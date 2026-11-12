---
slug: /build-before-qday/workshop-1/apps/rust-qday-pay
title: Rust Uygulaması, qday-pay
sidebar_label: Rust, qday-pay
sidebar_position: 4
---

# Rust Uygulaması: qday-pay

**qday-pay**, bir terminalde çalıştırdığınız küçük bir Rust programıdır. QoreChain testnet'i `qorechain-diana` üzerinde testnet QOR'u bir **hibrit imza** ile öder: klasik bir secp256k1 imzası artı kuantum sonrası bir ML-DSA-87 imzası (NIST FIPS 204). Ödemeden sonra işlemi zincirden geri okur ve her iki imzanın da kontrol edildiğine dair zincirin kendi kanıtını size gösterir.

**Ne kadar sürer:** toplamda yaklaşık 15 dakika. İlk derleme kütüphaneleri indirir ve derler, 2 ila 5 dakika sürer. Sonrasında her komut saniyeler içinde çalışır.

## Ne gösterir {#what-it-shows}

- Yayımlanmış `qorechain-sdk` crate'i ile **Rust'tan hibrit imzalama** (sürüm 0.13, kodda `qorechain` olarak kullanılır).
- Kuantum sonrası anahtarınızın zincire **tek seferlik kaydı**.
- Herhangi bir işlem için **bir doğrulama raporu**: 64 baytlık klasik imza, 4.627 baytlık ML-DSA-87 imzası ve zincirin `pqc_hybrid_verify` kararı.

Neden önemli: yalnızca klasik bir imzanın gelecekteki bir kuantum bilgisayar tarafından kırılabilmesi beklenir. Hibrit bir imza, iki yarıdan biri sağlam kaldığı sürece güvende kalır. [Kuantum Güvenli İşlemler](/sdk/guides/quantum-safe) sayfasına bakın.

## Adım adım {#run}

Kendi terminalinizde çalışırsınız. Yalnızca tek kullanımlık bir testnet hesabı kullanırsınız. Testnet QOR'unun değeri yoktur. Burada asla gerçek bir cüzdan veya gerçek para kullanmayın.

:::note Windows
qday-pay, anahtar dosyası için Linux ve macOS dosya izinlerini kullanır; bu yüzden Windows'ta onu **WSL** (Windows Subsystem for Linux) içinde çalıştırırsınız. WSL size Windows'un içinde bir Linux terminali verir. Bundan sonra aşağıdaki her şey Linux yönergelerini izler.
:::

### 1. Başlamadan önce: araçları kurun {#install}

Üç araca ihtiyacınız var: **Git** (kodu indirir), **Rust** (programı derler) ve bir **C derleyicisi** (Rust, programı bağlamak için birine ihtiyaç duyar). Bu uygulama için Java, Node.js ve Python gerekmez.

**macOS**

| Araç | Nasıl kurulur | Kontrol |
| --- | --- | --- |
| C derleyicisi ve Git | `xcode-select --install` (bir pencere açılır, Install'a tıklayın) | `git --version` |
| Rust | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` (varsayılanı kabul etmek için Enter'a basın), ardından terminali kapatıp yeniden açın | `rustc --version` ve `cargo --version` |

**Linux (Debian veya Ubuntu; diğer dağıtımlar kendi paket yöneticisini kullanır)**

| Araç | Nasıl kurulur | Kontrol |
| --- | --- | --- |
| Git ve C derleyicisi | `sudo apt update && sudo apt install -y git build-essential curl` | `git --version` |
| Rust | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` (varsayılanı kabul etmek için Enter'a basın), ardından terminali kapatıp yeniden açın | `rustc --version` ve `cargo --version` |

**Windows (WSL ile)**

1. PowerShell'i yönetici olarak açın ve `wsl --install` çalıştırın. İstediğinde bilgisayarı yeniden başlatın. Windows Ubuntu'yu kurar. Başlat menüsünden **Ubuntu** uygulamasını açın.
2. Ubuntu terminalinde yukarıdaki **Linux** tablosunu izleyin.
3. Windows için Git'e (https://git-scm.com/download/win) gerek yoktur, çünkü Git yukarıdaki Linux komutuyla gelir.

Rust 1.74 veya daha yenisi gereklidir. `rustup` komutu en son sürümü kurar, bu uygundur. Sürüm kontrolü `rustc 1.80.0` gibi bir şey ya da daha yüksek bir numara yazdırmalıdır.

**Ne görmelisiniz:** `git --version`, `rustc --version` ve `cargo --version` komutlarının her biri bir sürüm numarası yazdırır. Bir komut `command not found` derse terminali kapatın, yenisini açın ve yeniden deneyin.

### 2. Başlamadan önce: bir testnet cüzdanı ve faucet {#wallet}

Bu uygulama kendi testnet hesabını oluşturur (5. adım), bu yüzden onu çalıştırmak için bir cüzdan kurmanız gerekmez. Yalnızca ücretsiz testnet QOR almanın bir yoluna ihtiyacınız var. Faucet, bir adrese ücretsiz testnet QOR gönderen bir web sitesidir.

Hesabınıza QoreX cüzdanında da bakmak isterseniz, tek kullanımlık bir hesapla **testnet'te QoreX** kullanın:

- **QoreX uygulaması:** Ayarlar'ı açın ve **Use testnet (developers)** seçeneğini açın.
- **QoreX tarayıcı uzantısı:** kilidini açın, alttaki sürüm numarasına 7 kez dokunun, ardından **Switch to testnet (diana)** seçeneğini seçin.

Bu uygulama için bir Ethereum hesabına ihtiyacınız yoktur. QoreChain Native hesap türünü (bir `qor1...` adresi) kullanır.

**Faucet:** https://dashboard.qorechain.io/faucet. Oturum açın, adresinizi yapıştırın ve talep edin. Faucet **hesap başına 24 saatte 100 QOR** verir.

**Bilmekte fayda var:** yeni bir hesabın ilk işlemi, kuantum sonrası ML-DSA-87 anahtarını zincire kaydeder. Bu, yaklaşık 0,09 QOR'luk tek seferlik bir ücrettir. qday-pay bunu 7. adımda yapar.

**Tutarlar:** okuduğunuz birim **QOR**'dur. Zincir, en küçük birim olan **uqor** ile sayar. 1 QOR = 1.000.000 uqor. Tutarları QOR olarak yazarsınız (örneğin `1`) ve program sizin için dönüştürür.

### 3. Kodu alın {#get-the-code-step}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/04-rust-qday-pay
```

**Ne yapar**

| Parça | Anlamı |
| --- | --- |
| `git clone <address>` | Örnek uygulamaların tam bir kopyasını GitHub'dan `build-before-qday` adlı yeni bir klasöre indirir. |
| `cd <folder>` | Terminalinizi Rust uygulamasının klasörüne taşır. Sonraki tüm komutlar buradan çalışır. |

**Ne görmelisiniz:** `Cloning into 'build-before-qday'...` ve ardından komut satırınız `04-rust-qday-pay` klasöründe. Kontrol için `ls` çalıştırın: `Cargo.toml`, `Cargo.lock`, `README.md` ve `src` görürsünüz.

### 4. Programı derleyin {#build}

```bash
cargo build --release
```

**Ne yapar:** `cargo`, Rust'ın derleme aracıdır. Bu komut `Cargo.toml` içinde listelenen kütüphaneleri indirir ve programı tek bir dosyada derler.

| Parça | Anlamı |
| --- | --- |
| `build` | Programı derle (henüz çalıştırma). |
| `--release` | Hızlı, optimize edilmiş sürümü derle. Bu olmadan, farklı bir klasörde daha yavaş bir hata ayıklama sürümü elde edersiniz. |

**Ne kadar sürer:** ilk seferde 2 ila 5 dakika, sonrasında birkaç saniye.

**Ne görmelisiniz:** çok sayıda `Compiling ...` satırı, ardından `Finished release profile [optimized] target(s)`. Program artık `./target/release/qday-pay` dosyasıdır.

Çalıştığını kontrol edin:

```bash
./target/release/qday-pay
```

**Ne yapar:** programı hiçbir komut vermeden çalıştırır. Yardım metnini yazdırır ve hiçbir şeyi değiştirmez.

**Ne görmelisiniz:**

```text
qday-pay: hybrid post-quantum payments on QoreChain testnet

  qday-pay new
  qday-pay status
  qday-pay register
  qday-pay send <qor1to> <amount_qor> [--memo text]
  qday-pay verify <tx_hash>
```

Bu beş satır, aşağıda kullanacağınız beş komuttur. Bu sayfanın geri kalanında `<command>`, `./target/release/qday-pay <command>` anlamına gelir.

### 5. Tek kullanımlık bir testnet hesabı oluşturun {#new-account}

```bash
./target/release/qday-pay new
```

**Ne yapar:** yepyeni bir testnet hesabı oluşturur. Gizli bir kurtarma ifadesi (mnemonic) üretir ve onu bir **anahtar dosyasına** kaydeder. Bu tek ifadeden iki anahtarınızı da türetir: klasik secp256k1 anahtarını ve kuantum sonrası ML-DSA-87 anahtarını. İfade ekranda asla yazdırılmaz.

| Parça | Anlamı |
| --- | --- |
| `new` | Komut: bir hesap ve bir anahtar dosyası oluştur. Var olan bir anahtar dosyasının üzerine yazmayı reddeder, böylece fonlanmış bir hesabı yanlışlıkla yok edemez. |

**Anahtar dosyası nerede:** `~/.config/qday/rust.env`. `~` ev klasörünüzdür. Dosya yalnızca sizin okuyabileceğiniz şekilde ayarlıdır (mod 0600). `QDAY_KEY_FILE` ayarlayarak başka bir yer kullanabilirsiniz, örneğin `QDAY_KEY_FILE=$HOME/my-test-key.env ./target/release/qday-pay new`. Bunu yaparsanız, sonraki her komutun önüne aynı değişkeni ayarlayın.

:::warning Anahtar dosyasını gizli tutun
Anahtar dosyası, hesabın anahtarıdır. Asla paylaşmayın, bir sohbete veya ekran görüntüsüne yapıştırmayın ve Git'e göndermeyin. Bu hesabı yalnızca workshop için kullanın, mainnet'te asla. İşiniz bitince dosyayı silin.
:::

**Ne görmelisiniz:**

```text
  New testnet account (mnemonic saved, not shown)

  address      qor1...
  key file     /home/you/.config/qday/rust.env (0600)

  Next: fund it with testnet QOR, then `qday-pay status`.
```

`qor1...` adresini kopyalayın.

### 6. Hesabı faucet'ten fonlayın {#faucet}

1. https://dashboard.qorechain.io/faucet adresini açın ve oturum açın.
2. `qor1...` adresinizi yapıştırın ve talep edin. 100 QOR alırsınız.
3. Ödemeyi içeren blok için yaklaşık 10 saniye bekleyin.

Bir anahtarı kaydedebilmeniz için hesabın zincirde var olması gerekir ve hesabı oluşturan şey faucet ödemesidir.

### 7. Hesabı kontrol edin {#status}

```bash
./target/release/qday-pay status
```

**Ne yapar:** hesabınızı testnet'ten okur ve bir özet yazdırır. Hiçbir şey göndermez.

**Ne görmelisiniz:**

```text
  network      qorechain-diana (testnet)
  address      qor1...
  balance      100 QOR
  ML-DSA-87    NOT registered (run `qday-pay register`)
  block        123456
```

| Satır | Anlamı |
| --- | --- |
| `network` | Programın konuştuğu zincir. Yalnızca `qorechain-diana` testnet'inde çalışır ve başka her ağı reddeder. |
| `balance` | Harcayabileceğiniz QOR. |
| `ML-DSA-87` | Kuantum sonrası anahtarınızın zincirde kayıtlı olup olmadığı. |
| `block` | En son blok yüksekliği. Sürekli yükselir. |

### 8. Kuantum sonrası anahtarı kaydedin {#register}

```bash
./target/release/qday-pay register
```

**Ne yapar:** zincire ML-DSA-87 açık anahtarınızı, bir **sahiplik kanıtı** ile (karşılık gelen gizli anahtara gerçekten sahip olduğunuzun kanıtı) birlikte bildiren tek bir işlem gönderir. Zincir anahtarı saklar ve bundan sonra kuantum sonrası imzalarınızı kontrol edebilir. Tek seferlik yaklaşık 0,09 QOR ücret tutar. Güvenle yeniden çalıştırabilirsiniz: anahtar zaten kayıtlıysa hiçbir şey yapmaz.

| Parça | Anlamı |
| --- | --- |
| `register` | Komut: ML-DSA-87 anahtarınızı bir kez kaydet. |

**Ne görmelisiniz:**

```text
  ML-DSA-87    registered (MsgRegisterPQCKeyV2 + proof of possession)
  tx           <64-character transaction hash>
  block        123460
  gas          ... used / ... wanted
  address      qor1...
```

### 9. Hibrit imzalı bir ödeme gönderin {#send}

`qor1...` yerine bir testnet adresi yazın. Kendi adresinize veya bir arkadaşınızın testnet adresine ödeme yapabilirsiniz.

```bash
./target/release/qday-pay send qor1... 1 --memo "Build Before Q-Day Workshop 1 (Rust)"
```

**Ne yapar:** bir ödeme oluşturur, onu iki kez imzalar (secp256k1 ve ML-DSA-87), gaz maliyetini kontrol eder, gönderir, bir bloğa girene kadar bekler ve ardından 10. adımın doğrulamasını sizin için çalıştırır.

| Parça | Anlamı |
| --- | --- |
| `send` | Komut: başka bir adrese QOR öde. |
| `qor1...` (ilk değer) | Alıcı. Bir `qor1` adresi olmalıdır, yoksa program `not a qor1 address` ile durur. |
| `1` (ikinci değer) | QOR cinsinden tutar. `1`, 1 QOR yani 1.000.000 uqor demektir. `0.5` gibi ondalıklar kullanabilirsiniz. |
| `--memo "text"` | İsteğe bağlı. Memo, işleme eklenen ve zincirde saklanan kısa bir metindir. Boşluk içeriyorsa tırnak içine alın. Herkes okuyabilir, bu yüzden özel hiçbir şey yazmayın. |

`--memo` seçeneği, örnekteki gibi alıcıdan ve tutardan sonra gelir.

**Ne görmelisiniz:**

```text
  sending      1 QOR -> qor1...
  fee          ... uqor (gas ...)
  included     block 123465

  tx           <64-character transaction hash>
  block        123465
  memo         Build Before Q-Day Workshop 1 (Rust)
  classical    secp256k1   64 bytes
  quantum      ML-DSA-87   4627 bytes

  VERIFIED: secp256k1 + ML-DSA-87
```

`fee` uqor cinsinden gösterilir ve 1 QOR'un çok altındadır. Program ayrıca bir `explorer` bağlantısı ve bir `chain says` satırı yazdırır (10. adım). İşlem hash'ini kopyalayın.

### 10. Herhangi bir işlemi doğrulayın {#verify}

```bash
./target/release/qday-pay verify <TX_HASH>
```

**Ne yapar:** işlemi zincirden okur ve hiçbir şey göndermeden üç şeyi kontrol eder.

| Parça | Anlamı |
| --- | --- |
| `verify` | Komut: doğrulama raporunu yazdır. |
| `<TX_HASH>` | İşlemin 64 karakterlik hash'i. 9. adımdaki hash'i yapıştırın. Herhangi bir testnet işlemi için çalışır. |

Kontroller:

1. İşlem başarılı oldu (sonuç kodu 0).
2. Zincir, `status=verified` ile `pqc_hybrid_verify` olayını yayımladı. Bu, zincirin kuantum sonrası imzayı kontrol ettiğini söylemesidir.
3. İşlem, 64 baytlık secp256k1 imzasının yanında, 4.627 baytlık bir ML-DSA-87 imzası içeren bir `PQCHybridSignature` uzantısı taşıyor.

**Ne görmelisiniz:** 9. adımdakiyle aynı rapor, `VERIFIED: secp256k1 + ML-DSA-87` ile biter. Bir kontrol başarısız olursa rapor `NOT VERIFIED as hybrid` der ve program 2 koduyla çıkar.

### 11. Programımız olmadan ikinci bir yolla doğrulayın {#verify-curl}

Zincire doğrudan sorabilirsiniz. Bunun için yalnızca `curl` gerekir; macOS ve çoğu Linux sistemi bunu içerir. `jq` aracı (isteğe bağlı) yanıtı okumayı kolaylaştırır. macOS'ta `brew install jq` veya Linux'ta `sudo apt install -y jq` ile kurun.

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> | jq '.tx_response.code, .tx.body.extension_options[0]["@type"], (.tx.body.extension_options[0].pqc_signature | length)'
```

| Parça | Anlamı |
| --- | --- |
| `curl -s <address>` | Yanıtı testnet REST servisinden indirir. `-s` ilerleme çubuğunu gizler. |
| `<HASH>` | İşlem hash'iniz. |
| `\| jq '...'` | Üç değeri seçip çıkarır. `jq` yoksa bu kısmı bırakın ve tam metni okuyun. |

**Ne görmelisiniz:**

- Yanıtta `"code": 0` (işlem başarılı oldu). `jq` çıktısında ilk satır `0`'dır.
- ML-DSA-87 imzasını tutan bir `PQCHybridSignature` uzantısı (tür `/qorechain.pqc.v1.PQCHybridSignature`). Base64 metin uzunluğu 6.172 karakterdir, yani 4.627 bayt.
- `tx_response.events` içinde, `status` özniteliği `verified` olan `pqc_hybrid_verify` türünde bir olay.

**Explorer'da:** https://explore.qore.network adresini açın, **Testnet**'e geçin ve işlem hash'inizi arayın. Program ayrıca doğrudan bir bağlantı yazdırır.

### 12. Temizlik {#cleanup}

İşiniz bitince tek kullanımlık anahtar dosyasını silin:

```bash
rm ~/.config/qday/rust.env
```

`rm` bir dosyayı siler. Yalnızca artık ihtiyacınız olmayan bir testnet anahtarı için çalıştırın.

## Sorun giderme {#troubleshooting}

| Ne görüyorsunuz | Neden | Ne yapmalı |
| --- | --- | --- |
| `command not found: cargo` veya `rustc` | Rust kurulu değil ya da terminal kurulumdan önce açılmış. | Rust'ı kurun (1. adım), ardından terminali kapatıp yeniden açın. |
| `linker 'cc' not found` veya `linking with cc failed` | C derleyicisi yok. | macOS: `xcode-select --install`. Ubuntu: `sudo apt install -y build-essential`. |
| `cannot read ... run qday-pay new first` | O konumda anahtar dosyası yok. | `./target/release/qday-pay new` çalıştırın veya daha önceki `QDAY_KEY_FILE` değerini ayarlayın. |
| `cannot create ... it may already exist` | Bir anahtar dosyası var. Program hiçbirinin üzerine yazmaz. | Onu kullanmaya devam edin ya da ihtiyacınız olan bir şey yoksa `rm` ile silin, ardından `new` komutunu yeniden çalıştırın. |
| `account qor1... not found on chain yet; fund it first` | Hesapta henüz QOR yok, bu yüzden zincirde var olmuyor. | Faucet'ten QOR isteyin (6. adım), yaklaşık 10 saniye bekleyin, yeniden deneyin. |
| Faucet hız sınırına takıldığınızı söylüyor | Faucet, hesap başına 24 saatte bir talep verir. | 24 saat bekleyin veya ikinci bir tek kullanımlık hesap kullanın. |
| `account has no PQC key and classical fallback is disabled` | Kuantum sonrası anahtarı kaydetmeden önce ödeme gönderdiniz. | `./target/release/qday-pay register` çalıştırın, ardından yeniden gönderin. |
| `not a qor1 address` | Alıcı yanlış, örneğin bir `0x...` adresi. | Bir `qor1...` adresi kullanın. |
| `transport error` veya `error sending request` | İnternet yok ya da testnet kısa süreliğine erişilemiyor. | Bağlantınızı kontrol edin ve bir dakika sonra yeniden deneyin. |
| `NOT VERIFIED as hybrid` | İşlem başarısız oldu ya da hibrit imzalı bir işlem değildi. | Raporda `code` değerini okuyun. Bu programla yeni bir ödeme gönderin. |
| `pnpm: command not found` | Bir JavaScript uygulamasını denediniz. Bu Rust uygulaması pnpm gerektirmez. | Burada yok sayın. JavaScript uygulamaları için `npm install -g pnpm` çalıştırın. |
| `EVM authorisation window exhausted` | Bu, bu uygulamaya değil Hardhat uygulamasına aittir. | O uygulamada `pnpm window open` ile yeni bir pencere açın. |
| CORS hataları | Bu, tarayıcı uygulamalarına aittir. Bu komut satırı uygulamasında yoktur. | Bir tarayıcı uygulamasında şablonun `/lcd` vekilini kullanın. |

## Hesap {#account}

Hesap, bir QoreChain Native secp256k1 hesabıdır (coin türü 118, yol `m/44'/118'/0'/0/0`, bir `qor1...` adresi). ML-DSA-87 anahtarı, aynı kurtarma ifadesinden SDK'nın adrese bağlı kanonik kuralıyla (`authenticator::try_derive_pqc_canonical`) gelir. Tek bir kurtarma ifadesi iki anahtarı da geri getirir.

## Önemli olan SDK kodu {#code}

Bu, `src/main.rs` içindeki `send` komutunun özüdür:

```rust
let send = bank_send_any(w.address(), to, vec![coin(&uqor)]);           // MsgSend
let draft = build_hybrid_tx(params.clone())?;                           // secp256k1 + ML-DSA-87
params.fee = estimate_fee(rest, &draft.tx_raw_bytes, 1.3, "0.15uqor").await?; // simulate, gas x 1.3
let tx = build_hybrid_tx(params)?;                                      // sign for real
let res = broadcast_and_wait(rest, &tx.tx_raw_bytes, WaitOptions::default()).await?;
```

Kayıt tek bir çağrıdır: `PqcDx::ensure_pqc_registered()`. Yalnızca henüz kayıtlı bir anahtar yoksa sahiplik kanıtıyla `MsgRegisterPQCKeyV2` gönderir.

## "Doğrulandı" nasıl belirlenir {#verified}

`verify`, `GET /cosmos/tx/v1beta1/txs/{hash}` çağrısını okur ve şunları kontrol eder:

- işlem başarılı oldu (`code 0`);
- zincir, imzalayan için `status=verified` ile `pqc_hybrid_verify` olayını yayımladı;
- gövde, 4.627 baytlık bir ML-DSA-87 imzası içeren bir `/qorechain.pqc.v1.PQCHybridSignature` uzantısı taşıyor (64 baytlık secp256k1 imzasının yanında).

## Ne görmelisiniz {#output}

- `new`, bir `qor1...` adresi ve anahtar dosyasının yerini yazdırır, kurtarma ifadesini asla.
- `status`, bakiyeyi ve ML-DSA-87 anahtarının kayıtlı olup olmadığını gösterir.
- `send`, `VERIFIED: secp256k1 + ML-DSA-87` ve bir explorer bağlantısıyla biter.
- https://explore.qore.network adresinde (Testnet'e geçilmişken) işlem, hash'i altında görünür.

## Ağ uç noktaları {#access}

| | |
| --- | --- |
| Cosmos zincir kimliği | `qorechain-diana` (yalnızca testnet) |
| REST | `https://api-testnet.qore.host` |
| Faucet | https://dashboard.qorechain.io/faucet |
| Explorer | https://explore.qore.network (Testnet'e geçin) |

## Kullanılan paketler {#packages}

| Crate | Sürüm | Ne için kullanılır |
| --- | --- | --- |
| `qorechain-sdk` | 0.13 | Hesaplar, hibrit imzalama, REST istemcisi, doğrulama yardımcıları |
| `tokio` | 1 | Asenkron çalışma zamanı |
| `serde_json` | 1 | Zincirin JSON yanıtlarını okuma |
| `base64` | 0.22 | İmza boyutlarını ölçme |
| `cosmrs` | 0.22 | `Coin` mesaj türü |

## Kaynak kod {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/04-rust-qday-pay
