---
slug: /sdk/concepts/accounts-pqc
title: Hesaplar ve PQC İmzalama
sidebar_label: Hesaplar ve PQC
sidebar_position: 2
---

# Hesaplar ve PQC imzalama

QoreChain hesapları tek bir BIP-39 anımsatıcı ifadesinden (mnemonic) türetilir.
Her ikisi de tam olarak desteklenen iki hesap modeli vardır:

- **Hat başına HD türetme (eski/varsayılan)** — aynı anımsatıcı ifade, bağımsız
  türetme yolları üzerinden bir native (coin type 118), bir EVM (coin type 60)
  ve bir SVM (coin type 501) hesabı üretir. Üç anahtar, üç adres.
- **Birleşik eth-native hesaplar** (SDK 0.6.0, zincir v3.1.83) — TEK bir
  `eth_secp256k1` anahtarı, üç adres kodlamasının tümüyle gösterilen TEK bir
  20 baytlık kimliktir ve tek bir ortak bakiyeye sahiptir. Bkz.
  [Birleşik hesaplar](#unified-accounts).

## HD türetme (eski/varsayılan, coin type 118)

```ts
import {
  generateMnemonic,
  validateMnemonic,
  deriveNativeAccount,
  deriveEvmAccount,
  deriveSvmAccount,
} from "@qorechain/sdk";

const mnemonic = generateMnemonic(); // 12 words; pass 256 for 24 words

const native = await deriveNativeAccount(mnemonic);
console.log(native.address); // "qor1..."  (secp256k1, bech32)

const evm = await deriveEvmAccount(mnemonic);
console.log(evm.address); // "0x..."   (EIP-55 checksummed)

const svm = await deriveSvmAccount(mnemonic);
console.log(svm.address); // base58 ed25519 public key
```

Anımsatıcı ifade, herhangi bir anahtar türetilmeden önce doğrulanır (kelimeler
**ve** sağlama toplamı); böylece bir yazım hatası, sessizce yanlış bir hesap
üretmek yerine hata fırlatır. `validateMnemonic(mnemonic)` ile açıkça
doğrulama yapabilirsiniz.

### Türetme şemaları

| Tür | Eğri | Yol | Adres |
| --- | --- | --- | --- |
| native | secp256k1 | `m/44'/118'/0'/0/{i}` | `ripemd160(sha256(pubkey))` değerinin bech32 `qor` kodlaması |
| evm | secp256k1 | `m/44'/60'/0'/0/{i}` | `0x` + `keccak256(pubkey)[-20:]`, EIP-55 |
| svm | ed25519 | `m/44'/501'/{i}'/0'` | 32 baytlık genel anahtarın base58 kodlaması |

Ek hesaplar türetmek için bir hesap indeksi geçirin. TypeScript'te:

```ts
const second = await deriveNativeAccount(mnemonic, { accountIndex: 1 });
```

Python/Go/Rust'ta indeks konumsal bir argümandır
(`derive_native_account(mnemonic, 1)` / `DeriveNativeAccount(mnemonic, 1)` /
`derive_native_account(&mnemonic, 1)`).

### Bilinen-yanıt notu

Türetme şemaları deterministiktir ve dört SDK'nın tamamında bilinen-yanıt
(known-answer) testleriyle kapsanır; bu nedenle aynı anımsatıcı ifade
TypeScript, Python, Go ve Rust'ta birebir aynı adresleri üretir. Bu sayede bir
dilde türetip başka bir dilde doğrulama yapabilirsiniz.

> Bu hat başına türetme (coin type 118'de `deriveNativeAccount`, artı
> `deriveEvmAccount` / `deriveSvmAccount`) **eski/varsayılan** modeldir ve
> desteklenmeye devam eder, değişmemiştir. Aşağıdaki birleşik hesaplar ek,
> isteğe bağlı (opt-in) bir kimlik modelidir.

## Birleşik hesaplar (eth-native) {#unified-accounts}

SDK **0.6.0** sürümünden (zincir v3.1.83) itibaren
`deriveUnifiedAccount(mnemonic, index = 0)`, Ethereum HD yolu
`m/44'/60'/0'/0/{index}` üzerinde TEK bir `eth_secp256k1` anahtarı türetir;
bu anahtarın 20 adres baytı (`keccak256(pubkey)[12:]`), üç farklı şekilde
gösterilen AYNI kimliktir:

| Hat | Kodlama |
| --- | --- |
| Native | `qor` önekiyle bech32 (`qor1…`) |
| EVM | `0x` + EIP-55 karışık büyük/küçük harf sağlama toplamlı onaltılık |
| SVM | 20 baytın sağdan 12 sıfır baytla doldurulmuş halinin (32 bayt) base58 kodlaması |

Üç adresten **herhangi birine** yapılan yatırma işlemi **tek** bir bakiyeye
düşer ve anahtar her hatta harcama yapar:

```ts
import {
  deriveUnifiedAccount,
  qoreAddresses,
  addressesFrom20,
} from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);

account.cosmos;       // "qor1…"   bech32, Native lane
account.evm;          // "0x…"     EIP-55 hex, EVM lane
account.svm;          // "<base58>" 32-byte SVM address (addr20 + 12 zero bytes)
account.addressBytes; // the raw 20 bytes shared by all three
account.publicKey;    // 33-byte compressed secp256k1 public key
account.pqc;          // { publicKey, secretKey } — ML-DSA-87, derived below

// Decode any ONE encoding into all three:
const all = qoreAddresses({ evm: account.evm });
all.cosmos; // qor1…
all.svm;    // base58

// or straight from the raw 20 bytes:
const same = addressesFrom20(account.addressBytes);
```

`unifiedAccountFromSeed(seed32)` aynı işlemi ham 32 baytlık bir secp256k1 özel
anahtarından yapar.

### PQC tohum türetmesi

Hesabın ML-DSA-87 anahtar çifti deterministik olarak ve **adrese bağlı**
şekilde türetilir:

```text
pqcSeed = shake256("qorechain:pqc:v1|" + cosmosAddress + "|" + mnemonic, 32)
```

dolayısıyla `{ address, mnemonic }` çiftinden kurtarılabilir ve QoreChain'in
tüm dil SDK'larında birebir aynıdır. (`unifiedAccountFromSeed` için anımsatıcı
ifade yuvası `"seed:" + hex(seed32)` değeridir.)

### Native hatta eth anahtarıyla gönderim

Birleşik bir hesap, Native yolu işlemlerini `eth_secp256k1` şemasıyla imzalar:
klasik imza, SignDoc baytlarının **keccak256** özeti üzerinde secp256k1'dir
(sha256 değil) ve `SignerInfo` genel anahtarı
`/cosmos.evm.crypto.v1.ethsecp256k1.PubKey` tür URL'sini kullanır. Hibrit yol
(`signHybridEth`) ayrıca ML-DSA-87 `PQCHybridSignature` uzantısını ekler —
canlı ağlarda zorunludur:

```ts
import { EthNativeSigner, deriveUnifiedAccount } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
const signer = new EthNativeSigner(account); // signMode: "hybrid" by default

// `transport` is anything with broadcastTx (e.g. a connected client).
await signer.bankSend(
  transport,
  "qor1recipient…",
  [{ denom: "uqor", amount: "1000000" }], // 1 QOR
  { chainId: "qorechain-vladi", accountNumber, sequence, fee },
);
```

Daha alt düzey denetim için `signHybridEth(params)` / `signClassicalEth(params)`
birleştirilmiş `TxRaw` baytlarını ve imzalama çıktılarını döndürür;
`accountAuthInfo(baseAccount)` ise zincir üstü genel anahtarı `eth_secp256k1`
tür URL'sini kullanan bir hesaptan `account_number` / `sequence` değerlerini
okur. Yalnızca-klasik yol, tek seferlik, bootstrap muafiyetli
`MsgRegisterPQCKeyV2` içindir; diğer her şey için hibrit kullanın.

:::caution Hibrit işlemler için SDK 0.6.1+ sürümüne yükseltin
SDK **0.6.1**, konsensüs açısından kritik bir kodlama hatasını düzeltti:
`/qorechain.pqc.v1.PQCHybridSignature` tx-body uzantısı `Any.value` içine
JSON olarak serileştiriliyordu ve zincir **bu işlemleri CheckTx aşamasında
reddediyordu** (bir tx ayrıştırma hatası). Artık beş dilin tamamında protobuf
ile kodlanmaktadır (uzantı değeri `0x08` ile başlar). SDK ≤ 0.6.0 ile
oluşturulan her hibrit işlem — eth-native hat dahil — zincir üzerinde
reddedilir: 0.6.1 veya sonrasına yükseltin.
:::

### Phantom (P1a): anahtar dışa aktarmadan birleşik hesap

`connectPhantomUnified()` (TypeScript), deterministik bir Phantom imzasından
kanonik, **emanetsiz (non-custodial)** bir birleşik hesap türetir: kullanıcı,
sabit ve alan ayrımlı (domain-separated) bir mesajı Phantom'un ed25519
anahtarıyla imzalar ve `shake256(signature, 32)` hesabı tohumlar.

```ts
import {
  connectPhantomUnified,
  unifiedAccountFromPhantomSignature,
} from "@qorechain/sdk";

// In the browser (uses window.solana):
const account = await connectPhantomUnified();

// Or, given a raw signature you already have:
const same = unifiedAccountFromPhantomSignature(signatureBytes);
```

Türetilen hesap, Phantom ed25519 anahtarından ayrı, kanonik bir anahtardır —
Phantom, türetilen secp256k1/PQC gizli anahtarlarını asla görmez. Phantom
anahtarının kendisinin limitler dahilinde hesaptan harcama yapmasına izin
vermek için bkz.
[Kimlik doğrulayıcılar ve yetkilendirilmiş harcama](/sdk/guides/authenticators).

## Kuantum sonrası kriptografi (PQC)

QoreChain, **ML-DSA-87** (Dilithium-5, FIPS 204) imzalarını destekler. SDK bu
temel işlevleri doğrudan sunar.

```ts
import {
  generatePqcKeypair,
  pqcSign,
  pqcVerify,
  ML_DSA_87_PUBLIC_KEY_LENGTH,
  ML_DSA_87_SIGNATURE_LENGTH,
} from "@qorechain/sdk";

const keypair = generatePqcKeypair();
const message = new TextEncoder().encode("hello");

const signature = pqcSign(keypair.secretKey, message);
const ok = pqcVerify(keypair.publicKey, message, signature);
```

Dışa aktarılan uzunluk sabitleri (`ML_DSA_87_PUBLIC_KEY_LENGTH`,
`ML_DSA_87_SECRET_KEY_LENGTH`, `ML_DSA_87_SIGNATURE_LENGTH`,
`ML_DSA_87_SEED_LENGTH`) arabellek boyutlarını doğrulamanıza olanak tanır.

> Altta, PQC temel işlevleri [**qorechain-pqc**](/developer-guide/post-quantum-signing) kütüphanesinden gelir — denetlenmiş FIPS-204/203/202 uygulamalarını altı dilde (JavaScript/TypeScript, Rust, Go, C, Python, Java) tek tutarlı bir API arkasında saran, açık kaynaklı ve yalnızca standartlara dayalı kütüphane. SDK dışında ham temel işlevlere veya `hybridSignBytes` çerçevelemesine ihtiyaç duyduğunuzda doğrudan ona başvurun.

### Takılabilir imzalayıcılar

Bileşim (composition) için SDK; bir `Signer` soyutlaması, `PqcSigner` ve
`HybridSigner` uygulamaları ile bir `SignatureMode` enum'u sağlar. PQC
imzalamayı temel işlevleri doğrudan çağırmak yerine kendi akışınıza takmak
istediğinizde bunları kullanın.

## Hibrit imzalama {#hybrid-signing}

**Hibrit** bir işlem hem klasik bir secp256k1 imzası hem de bir ML-DSA-87
imzası taşır; böylece klasik doğrulama altında geçerli kalırken kuantum
sonrası koruma kazanır. Kuantum sonrası kısım, işlem üzerinde bir
`PQCHybridSignature` uzantısı olarak taşınır.

:::caution Native yolda hibrit imzalama zorunludur
Güncel zincir sürümünden (**v3.1.92**) itibaren ağ varsayılanı
`hybrid_signature_mode = required` ve `allow_classical_fallback = false`
şeklindedir. `buildHybridTx` üzerinden (`includePqcPublicKey` ile) hibrit
imzalama — veya birleşik eth-native hesaplar için `signHybridEth` —
Native-yol işlemleri için **zorunludur**; yalnızca-klasik Native işlemler
zincir üzerinde reddedilir. EVM işlemleri ayrı bir `eth_secp256k1` yolu
kullanır ve bundan etkilenmez.
:::

:::caution SDK ≤ 0.6.0 hibrit işlemleri reddedilir
0.6.1 sürümü, `PQCHybridSignature` uzantısının kodlamasını düzeltti
(JSON → protobuf, konsensüs açısından kritik). SDK 0.6.0 veya öncesiyle
oluşturulan hibrit işlemler, CheckTx aşamasında bir tx ayrıştırma hatasıyla
başarısız olur — 0.6.1+ sürümüne yükseltin.
:::

```ts
import {
  buildHybridTx,
  deriveNativeAccount,
  directSignerFromPrivateKey,
} from "@qorechain/sdk";

const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");

// buildHybridTx assembles a tx with BOTH a classical signature and an
// ML-DSA-87 signature attached as a PQCHybridSignature extension.
// (See packages/ts and the pqc-hybrid-sign example for the full call.)
```

### Zincir üstü ön koşul

Bir hibrit işlemin zincir üzerinde PQC doğrulamasından geçebilmesi için,
imzalayanın PQC genel anahtarının zincirin `MsgRegisterPQCKey` mesajı
aracılığıyla **kayıtlı** olması gerekir — *ancak* `includePqcPublicKey: true`
ayarlarsanız anahtar uzantıya gömülür ve zincir ilk kullanımda otomatik olarak
kaydedebilir.

### Hibrit işlem sözleşmesi (üst düzey)

İşlem, standart imza baytları (PQC uzantısını **hariç tutar**) üzerinden
klasik olarak imzalanır ve ML-DSA-87 imzası hesaplanıp `PQCHybridSignature`
uzantısı olarak eklenir. Klasik imza baytları uzantıyı hariç tuttuğundan,
doğrulayıcı PQC kısmını anlasın ya da anlamasın klasik imza geçerli kalır.
Alt düzey yardımcılar (`encodeHybridExtension`, `attachHybridExtension`,
`buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`) ve uçtan uca
oluşturucular (`buildHybridTx`, `signAndBroadcastHybrid`) ileri düzey kullanım
için dışa aktarılmıştır.

> Hibrit işlem gönderimi, canlı ağdaki cosmos işlemleri için zorunlu yoldur.
> Yerel imzalama/doğrulama temel işlevleri ve işlem oluşturma yardımcıları
> bugün kullanılabilir durumdadır.

## PQC anahtar rotasyonu

SDK 0.7.0 sürümünden itibaren bir hesap, ML-DSA-87 anahtarını **aynı
algoritmanın** yeni bir anahtarıyla döndürebilir — eski bir
`shake256(mnemonic)` anahtarını kanonik olarak adrese bağlı
`shake256("qorechain:pqc:v1|addr|mnemonic")` anahtarına taşıyarak — bunun için
`rotatePqcKeyMsgFromMnemonic` kullanılır (her iki anahtar da rotasyon
baytlarını çift imzalar). Tam bir örnek için Kimlik Doğrulayıcılar
kılavuzundaki [Anahtar rotasyonu](/sdk/guides/authenticators#key-rotation)
bölümüne bakın.

## Algoritma tanımlayıcıları

SDK, protokol düzeyindeki çalışmalar için algoritma kimliklerini ve
yardımcılarını dışa aktarır: `AlgorithmUnspecified`, `AlgorithmDilithium5`,
`AlgorithmMLKEM1024`, `algorithmName(id)` ve `isSignatureAlgorithm(id)`.
