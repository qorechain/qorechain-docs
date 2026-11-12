---
slug: /build-before-qday/workshop-1/apps/rust-qday-pay
title: Rust Uygulaması, qday-pay
sidebar_label: Rust, qday-pay
sidebar_position: 4
---

# Rust Uygulaması: qday-pay

**qday-pay**, QoreChain testnet'inde (`qorechain-diana`, EVM chain ID 9800) bir **hibrit imzayla** QOR ödemesi yapan küçük bir Rust komut satırı aracıdır: aynı işlemde klasik bir secp256k1 imzası ve kuantum sonrası bir ML-DSA-87 (FIPS 204) imzası. Gönderdikten sonra işlemi zincirden geri okur ve zincirin her iki yarıyı da doğrulayıp doğrulamadığını gösterir.

## Ne gösterir {#what-it-shows}

- **Rust'tan hibrit ML-DSA-87 + secp256k1 imzalama**, yayımlanmış crate ile ve ek araç gerektirmeden.
- **Zincir üzerinde doğrulanan hibrit imzalı bir işlem**: zincir `status=verified` değerli bir `pqc_hybrid_verify` olayı yayar ve işlem gövdesi 64 baytlık secp256k1 imzasının yanında 4627 baytlık bir ML-DSA-87 imzası taşır.
- **Tek kurtarma ifadesi, iki anahtar**: ML-DSA-87 anahtarı klasik anahtarla aynı mnemonic'ten türetilir ve adresinize bağlanır.

Neden önemli: gelecekteki bir kuantum bilgisayarın secp256k1 imzalarını kırması beklenir. Ayrıca bir ML-DSA-87 imzası taşıyan işlem korunmuş kalır. Bkz. [Kuantum Güvenli İşlemler](/sdk/guides/quantum-safe).

## Adım adım {#run}

### 1. Araçları kurun

Git'e ve `cargo` içeren güncel, kararlı bir Rust toolchain'e ihtiyacınız var.

- Git: https://git-scm.com/downloads
- Rust: https://rustup.rs adresinden rustup ile kurun

Sürümleri kontrol edin:

```bash
git --version
rustc --version
cargo --version
```

### 2. Kodu alın

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/04-rust-qday-pay
```

### 3. Derleyin

```bash
cargo build --release
```

İlk derleme bağımlılıkları indirip derler ve birkaç dakika sürer. `Finished` `release` profile ifadesiyle biter. Aracı argümansız çalıştırmak komutların listesini yazdırır:

```bash
cargo run --release
```

### 4. Tek kullanımlık bir testnet hesabı oluşturun

```bash
cargo run --release -- new
```

`new` bir kurtarma ifadesi oluşturur ve onu 0600 kipiyle bir anahtar dosyasına kaydeder. İfade asla yazdırılmaz. Anahtar dosyası varsayılan olarak `~/.config/qday/rust.env` yoludur; başka bir yol kullanmak için `QDAY_KEY_FILE` ayarlayın. Var olan bir dosyanın üzerine yazmayı reddeder. Bu yalnızca testnet için bir hesaptır: burada asla gerçek bir cüzdan kullanmayın, anahtar dosyasını asla paylaşmayın ya da commit etmeyin ve asla mainnet'te yeniden kullanmayın. Komut `qor1...` adresinizi yazdırır.

### 5. Faucet'ten testnet QOR'u alın

1. https://dashboard.qorechain.io/faucet adresini açın ve giriş yapın.
2. `qor1...` adresinizi yapıştırın ve talep edin. Bir talep, hesap başına ve adres başına 24 saatte bir 100 QOR öder.

Kayıt bir ücret ödediği için, sonraki adımdan önce hesabın zincirde var olması gerekir.

### 6. Hesabı kontrol edin

```bash
cargo run --release -- status                  # address, balance, PQC key, latest block
```

### 7. ML-DSA-87 anahtarını kaydedin

```bash
cargo run --release -- register                # register the ML-DSA-87 key (once, idempotent)
```

Bir anahtar kendi kaydını birlikte imzalayamadığı için kayıt işlemi klasik olarak imzalanır. Yeniden çalıştırmak hiçbir şey yapmaz.

### 8. Hibrit imzalı bir ödeme gönderin

```bash
cargo run --release -- send qor1... 1 --memo "Build Before Q-Day Workshop 1 (Rust)"
```

`qor1...` yerine herhangi bir testnet adresi yazın (örneğin ikinci bir tek kullanımlık hesap). Miktar QOR cinsindendir. `send` miktarı öder ve ardından doğrulamayı çalıştırır.

### 9. Herhangi bir işlemi doğrulayın

```bash
cargo run --release -- verify <TX_HASH>        # the verification report for any transaction
```

Araç yalnızca testnet içindir: SDK `testnet` ön ayarını kullanır ve başka bir chain id'ye karşı çalışmayı reddeder.

## Hesap {#account}

Hesap, coin type 118 (`m/44'/118'/0'/0/0`) kullanan ve `qor1...` adresi olan bir QoreChain Native secp256k1 hesabıdır. ML-DSA-87 anahtarı, SDK'nın kanonik, adrese bağlı kuralıyla aynı mnemonic'ten gelir. Tek bir mnemonic her iki anahtarı da geri yükler.

```rust
let classical = derive_native_account(mnemonic, 0)?;
let pqc = try_derive_pqc_canonical(&classical.address, mnemonic)?;
```

## Önemli olan SDK kodu {#code}

Bu, `send` komutunun kısaltılmış çekirdeğidir:

```rust
// The payment: a plain bank MsgSend.
let send = bank_send_any(w.address(), to, vec![coin(&uqor)]);
// Which hybrid sign-bytes form this network verifies (asked once, cached).
let version = SignBytesResolver::new()
    .resolve(SignBytesMode::Auto, &net.chain_id, Some(&net.rest_url)).await?;

let mut params = BuildHybridTxParams {
    private_key: w.classical.private_key.clone(), // secp256k1 half
    public_key: w.classical.public_key.clone(),
    pqc_secret_key: w.pqc.secret_key.clone(),     // ML-DSA-87 half
    pqc_public_key: w.pqc.public_key.clone(),
    messages: vec![Message { type_url: send.type_url, value: send.value }],
    chain_id: net.chain_id.clone(),
    include_pqc_public_key: false, // key registered with `register`
    sign_bytes_version: Some(version),
    /* fee, account_number, sequence, memo, timeout_height */
};

let draft = build_hybrid_tx(params.clone())?;                    // sign a draft
params.fee = estimate_fee(&net.rest_url, &draft.tx_raw_bytes, 1.3, "0.15uqor").await?; // simulate, gas x 1.3
let tx = build_hybrid_tx(params.clone())?;                       // sign for real
let res = broadcast_and_wait(&net.rest_url, &tx.tx_raw_bytes, WaitOptions::default()).await?;
```

Kayıt, `PqcDx` üzerindeki tek bir idempotent çağrıdır, `ensure_pqc_registered()`: yalnızca henüz kayıtlı bir anahtar yokken sahiplik kanıtıyla birlikte `MsgRegisterPQCKeyV2` gönderir ve hesap farklı bir anahtar tutuyorsa hata verir.

Gaz asla sabit değildir: taslak simüle edilir ve limit, simüle edilen gazın 1,3 katıdır; gaz başına 0,15 uqor ile fiyatlandırılır (zincir tabanı 0,1 uqor'dur).

## "Doğrulandı" nasıl belirlenir {#verified}

`verify`, herkese açık testnet REST uç noktasından `GET /cosmos/tx/v1beta1/txs/{hash}` isteğini okur ve üç şeyi kontrol eder:

- işlem başarılı oldu (`code 0`);
- zincir, imzalayan için `status=verified` ile `pqc_hybrid_verify` olayını yaydı;
- gövde, 4627 baytlık bir ML-DSA-87 imzası içeren `/qorechain.pqc.v1.PQCHybridSignature` uzantısını taşıyor.

## Görmeniz gerekenler {#output}

Başarılı bir `send`, miktarı ve ücreti, işlemin dahil edildiği bloğu ve ardından işlemin başarılı olduğunu, `pqc_hybrid_verify` değerinin `verified` olduğunu ve ML-DSA-87 imzasının 4627 bayt olduğunu gösteren bir rapor yazdırır. Herhangi bir kontrol başarısız olursa araç 2 durum koduyla çıkar. İşlemi görmek için https://explore.qore.network adresini açın, **Testnet**'e geçirin ve hash'i aratın ya da `https://explore.qore.network/tx/<HASH>` adresini açın.

## Ağ uç noktaları {#access}

| Ne | Nerede |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| Explorer | `https://explore.qore.network` (Testnet'e geçin) |
| Faucet | https://dashboard.qorechain.io/faucet |

## Kullanılan paketler {#packages}

| Öğe | Sürüm |
| --- | --- |
| `qorechain-sdk` (`qorechain` olarak içe aktarılır) | 0.13 (0.13.0 olarak çözülür) |
| `tokio` | 1 |
| `serde_json` | 1 |
| `base64` | 0.22 |
| `cosmrs` | 0.22 |
| `qday-pay` (bu uygulama, yayımlanmamış) | 0.1.0 |

Tüm dillerin SDK sürüm tablosu için bkz. [SDK kurulumu](/sdk/install).

## Kaynak kod {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/04-rust-qday-pay
