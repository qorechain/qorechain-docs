---
slug: /qoresign/overview
title: QoreSign Genel Bakış
sidebar_label: Genel Bakış
sidebar_position: 1
---

# QoreSign

QoreSign, QoreChain üzerinde cüzdanlar, borsalar, saklama kuruluşları ve arka uç servisleri için hibrit secp256k1 + ML-DSA-87 (FIPS 204) imzalama sağlayan açık kaynaklı bir kütüphanedir.

QoreSign, QoreChain'in kendi cüzdanı dışındaki bir cüzdanın bir hesabın ML-DSA-87 anahtarını türetmesine, yerel hattaki işlemleri iki anahtarla imzalamasına, hibrit imzaları yerel olarak doğrulamasına, rastgele mesajları imzalamasına, imzalamadan önce bir işlemi simüle etmesine, işlenmiş bir işlemin nasıl korunduğunu geri okumasına ve Sign In With QoreChain'i uygulamasına olanak tanır. [`qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) bağlayıcıları üzerinde ince bir katmandır ve kendi başına hiçbir kriptografik ilkel eklemez. QoreChain Association tarafından Apache-2.0 lisansı altında sürdürülür.

Güncel sürüm **0.1.1**'dir (27 Ekim 2026). TypeScript, Rust, Go, Kotlin (JVM ve Android), Swift ve 0.1.1 ile gelen yeni dil olan Python için yayımlanmıştır. Kaynak kod, örnekler ve test vektörleri [qorechain/qoresign](https://github.com/qorechain/qoresign) deposundadır. Ana ağda (`qorechain-vladi`) ve test ağında (`qorechain-diana`) çalışır.

## QoreSign her hatta ne yapar {#lanes}

| Hat | QoreSign bugün ne yapar |
|---|---|
| **Yerel** (Cosmos SDK) | Hibrit imzalama ve doğrulama. Ağ, ML-DSA-87 imzasını varsayılan olarak zorunlu tutar. |
| **EVM** | Yalnızca yetkilendirme penceresi: hesap bir ML-DSA-87 anahtarı kaydeder ve yerel hattan sınırlı bir yetkilendirme penceresi açar. Ethereum işlemlerinin kendisi ML-DSA-87 imzası taşımaz. |
| **SVM** | Ağda henüz açık değil (`LANE_NOT_AVAILABLE`). |

Hibrit EVM imzalama için önce ağda hat başına PQC desteği gerekir. Bkz. [EVM cüzdanları: yetkilendirme penceresi](/qoresign/guides/evm-quantum-ready).

## Ne yapar {#what-it-does}

Her dilde aynı olan çevrimdışı çekirdek:

- Klasik anahtarı `m/44'/118'/0'/0/0` yolunda türetir (`deriveClassicalKey`) ve QoreChain cüzdanlarının bir hesap için kaydettiği kanonik ML-DSA-87 anahtarını türetir (`deriveCanonicalPqKey`, mnemonic'e ve adrese bağlıdır). Sertleştirilmiş bir HD türetme taslak olarak mevcuttur (`deriveHdPqKey`); `pqKeyFromSeed` 32 baytlık tohumundan bir anahtar çiftini yeniden oluşturur.
- `secp256k1` ve `eth_secp256k1` hesapları için `qor1` adreslerini oluşturur ve ayrıştırır.
- Yerel hat işlemini iki anahtarla imzalar (`signHybrid`) ya da bir dApp'in oluşturduğu gövdeye yalnızca ML-DSA-87 katmanını ekler (`signPqLayer`). ML-DSA-87 imzaları varsayılan olarak deterministiktir; hedged imzalama bir seçenektir ve ağ ikisini de kabul eder. secp256k1, düşük-S ile RFC 6979 kullanır.
- Hibrit imzalama baytlarını v1 ve v2 olarak hesaplar (`hybridSignBytes`) ve tam bir hibrit işlemi (`verifyHybridTx`) ya da yalnızca ML-DSA-87 katmanını (`verifyPqLayer`) doğrular.
- Sahiplik kanıtlı `MsgRegisterPQCKeyV2` oluşturur (`buildRegisterPqKeyMessage`, `signProofOfPossession`) ve dejenere açık anahtarları reddeder.
- Rastgele mesajları imzalar ve doğrular (`signMessage`, `verifyMessage`) ve Sign In With QoreChain v1'i uygular (`createSiwqMessage`, `signSiwq`, `verifySiwq`).
- Hat kurallarını kodda uygular (`decideLane`, `assertHybridLane`, `evaluateLayerState`). Hatalar tüm dillerde ortak, sabit bir kod taşır (`QoreSignError`, örneğin `INVALID_MNEMONIC`, `LANE_NOT_AVAILABLE`, `KEY_NOT_REGISTERED`).

Ağ yardımcıları (TypeScript `@qorechain/qoresign/network`; Go `github.com/qorechain/qoresign/go/network` iki yeni olan dışındaki hepsini içerir):

- `fetchPqKeyStatus`: bir adres için ML-DSA-87 anahtarının kayıtlı olup olmadığı ve hangisi olduğu.
- `resolveSignBytesVersion`: ağın hangi imzalama baytı biçimini doğruladığı.
- `simulateTx` (kullanılan gaz, önerilen gaz sınırı, adres başına bakiye değişiklikleri), `suggestGasLimit`, `broadcastTx` ve `submitWithSignBytesFallback` (ağ ilkini reddettiğinde diğer imzalama baytı biçimiyle bir yeniden deneme).
- `assertPqLayerMatchesRegisteredKey`: bir dApp'in sağladığı katmanı, cüzdan klasik imzasını eklemeden önce zincirdeki anahtarla karşılaştırır.
- `verifySiwqWithChain` ve `verifyMessageWithChain`: zincirde kayıtlı anahtara karşı doğrulama.
- `fetchCommittedExtensionTypeUrls`: işlenmiş bir işlemin hangi uzantıları taşıdığını geri okur.
- 0.1.1 ile yeni, yalnızca TypeScript: `inspectTransaction` ve `fetchEvmWindow`, aşağıda açıklanmıştır.

## 0.1.1 ile gelenler {#new-in-0-1-1}

- **Python.** `qorechain-qoresign` paketi (içe aktarma `qoresign`) PyPI'dadır; macOS ve Linux için wheel dosyaları vardır. Rust uygulamasına bağlanır ve aynı test vektörlerini üretir. Swift ve Kotlin bağlayıcıları gibi çevrimdışıdır: ağ yardımcıları yoktur.
- **İşlem denetleyicisi (kütüphane).** `inspectTransaction` işlenmiş bir işlemi okur ve nasıl korunduğunu bildirir. Bkz. [İşlem denetleyicisi](#inspector).
- **EVM penceresi okuyucusu.** `fetchEvmWindow` bir hesabın EVM yetkilendirme penceresini okur.
- **Paketleme düzeltmeleri.** Swift ikili çerçeve arşivi artık başıboş bir resource-fork klasörü içermiyor; Kotlin ve Python paketlerindeki macOS yerel kütüphaneleri artık derleme dizinini kurulum adı olarak kaydetmiyor.

## İşlem denetleyicisi {#inspector}

`inspectTransaction({ rest, chainId, txhash, rpc? })`, `@qorechain/qoresign/network` içindeki salt okunur bir işlevdir. İşlenmiş bir işlemi getirir ve şunları döndürür:

- mesajlar, not, sonuç kodu, yükseklik ve ücret;
- imzalayan: adres, anahtar türü, açık anahtar ve sıra numarası;
- klasik imzanın doğrulanıp doğrulanmadığı;
- ML-DSA-87 katmanının durumu: mevcut olup olmadığı, kaç katman olduğu, katmanın imzalayanın şu an kayıtlı olan anahtarına karşı doğrulanıp doğrulanmadığı ve hangi imzalama baytı biçimini kullandığı;
- herkese açık gezginle aynı sınıflandırmayı kullanan bir güvenlik katmanı: `pqc` (ML-DSA-87 katmanını taşır), `enrollment` (bir ML-DSA-87 anahtarı kaydeder veya döndürür; bu işlem tasarım gereği klasik anahtarla imzalanır), `shake` (katmansız bir yerel hat işlemi) veya `classical` (bir EVM hattı işlemi).

Ağın tanımadığı bir hash için `undefined` döndürür. Bir düğümden işlenmiş baytların aynısını okumak için bir `rpc` uç noktası verin; verilmezse işlev REST ağ geçidinin yeniden kodladığı baytları kullanır. Hiçbir şey göndermez ve hesap ya da anahtar gerektirmez.

```js
import { fetchEvmWindow, fetchPqKeyStatus, inspectTransaction } from "@qorechain/qoresign/network";

const rest = "https://api-testnet.qore.host";
const address = "qor178nscfyp0cq2ac5x7un4u98xrj4ayp6pt0kw08"; // public testnet faucet account

const status = await fetchPqKeyStatus({ rest, address });
console.log("ML-DSA-87 key registered:", status.registered);

const tx = await inspectTransaction({ rest, chainId: "qorechain-diana", txhash: process.argv[2] });
console.log(tx?.tier, tx?.pqLayer, tx?.messages.map((m) => m.typeUrl));

const win = await fetchEvmWindow({ rest, address });
console.log("EVM window:", win.found, win.live);
```

Bunu `inspect.mjs` olarak kaydedin ve bir test ağı işlem hash'iyle `node inspect.mjs <txhash>` komutunu çalıştırın. Test ağındaki yakın tarihli bir musluk transferine karşı çalıştırıldığında şunları yazdırdı: `ML-DSA-87 key registered: true`, katman `pqc`, `pqLayer { present: true, count: 1, algorithmId: 1, verified: true, signBytesVersion: 'v2' }`, mesaj `/cosmos.bank.v1beta1.MsgSend` ve `EVM window: false false`.

`fetchEvmWindow({ rest, address })` şunları döndürür: `found`, `live`, açılış ve bitiş yükseklikleri, en fazla ve kullanılan işlem ile değer, kalan blok, işlem ve değer, `nativeOnly` ve `allowedTargets`.

Bu, kütüphane işlevidir. Gösterge paneli [Geliştiriciler](/dashboard/developers#inspector) sayfasında onu kullanan bir İşlem denetleyicisi sekmesi vardır: bir işlem karması yapıştırın ve sonucu kod yazmadan okuyun.

## Ne için kullanılır {#use-cases}

1. **Keplr uyumlu bir cüzdan QoreChain hibrit imzalamasını ekler.** Leap, Cosmostation veya yeni bir cüzdan secp256k1 imzasını `signDirect` ile üretir. QoreSign ile cüzdan, aynı mnemonic'ten hesabın ML-DSA-87 anahtarını türetir ve imzalamadan önce katmanı ekler (`signPqLayer`). Bkz. [cüzdan kılavuzu](/qoresign/guides/keplr-compatible-wallets).
2. **Bir borsa veya saklama kuruluşu çekimleri kendi sunucularında imzalar.** Go veya Rust ile yazılmış bir sıcak ya da ılık cüzdan servisi yerel hat transferlerini `signHybrid` ile imzalar, bakiye değişikliklerini ve gazı görmek için önce simüle eder (`simulateTx`, Go ve TypeScript) ve `submitWithSignBytesFallback` ile yayınlar. [Saklama seti](/developer-tools/custody-kit) bunun üzerine kuruludur.
3. **Bir arka uç Sign In With QoreChain'i uygular.** Sunucu tek kullanımlık bir nonce üretir, cüzdan bir oturum açma mesajı imzalar ve sunucu `verifySiwqWithChain` çağırır. Bkz. [oturum açma kılavuzu](/qoresign/guides/sign-in).
4. **Bir uyumluluk veya destek aracı bir işlemin nasıl korunduğunu denetler.** `inspectTransaction`, işlenmiş bir işlemin doğrulanmış bir ML-DSA-87 katmanı taşıyıp taşımadığını, hangi imzalama baytı biçimini kullandığını ve katmanını bildirir.
5. **Bir cüzdan bir EVM hesabının yetkilendirme penceresini gösterir.** Kullanıcı bir EVM cüzdanından göndermeden önce `fetchEvmWindow`, bir pencerenin canlı olup olmadığını ve kaç işlem ile ne kadar değerin kaldığını gösterir.
6. **Bir Python ekibi raporları veya onayları imzalar.** `qoresign.sign_message`, rastgele baytlar üzerinde diğer tüm QoreSign dillerinin doğrulayabileceği bir hibrit imza üretir.
7. **iOS veya Android'de mobil bir cüzdan.** Swift paketi ve Android AAR, TypeScript paketiyle bayt bayt aynı türetmeyi, imzalamayı ve oturum açmayı sağlar.
8. **Denetçiler ve entegratörler imzaları çevrimdışı doğrular.** `verifyHybridTx`, `verifyPqLayer` ve `verifyMessage`, açık anahtarlar verildiğinde ağ olmadan çalışır.

## Nasıl çalışır {#how-it-works}

- **Hibrit bir işlem**, aynı hesap tarafından iki kez imzalanmış sıradan bir Cosmos SDK `TxRaw`'dır: işlem gövdesinde `/qorechain.pqc.v1.PQCHybridSignature` uzantı seçeneği olarak taşınan bir ML-DSA-87 imzası (algoritma kimliği `1`) ve nihai gövde üzerinde bir secp256k1 `SIGN_MODE_DIRECT` imzası.
- **İmzalama baytları v2** (bugün her iki herkese açık ağ tarafından doğrulanır) şöyledir: `"qorechain-pqc-hybrid-v2"`, ardından zincir kimliği, PQC uzantısı olmayan gövde ve auth info; her biri uzunluk önekiyle. Bu nedenle ML-DSA-87 imzası ücreti kapsar. Klasik imza, uzantı dahil nihai gövdeyi kapsar. v1, eski imzaları yeniden üretmek için korunur. Bkz. [Hibrit işlem imzalama v1](/qoresign/spec/hybrid-signing-v1).
- **Sıra:** gövdeyi ve auth info'yu kodlayın, imzalama baytlarını ve ML-DSA-87 imzasını hesaplayın, uzantıyı ekleyin, ardından SignDoc'u secp256k1 ile imzalayın ve yayınlayın.
- **Kayıt:** `MsgRegisterPQCKeyV2`, ML-DSA-87 açık anahtarını, hesabın sıkıştırılmış secp256k1 anahtarını ve bir sahiplik kanıtını taşır. Kayıt işlemi yalnızca klasik anahtarla imzalanır.
- **Alan ayrımı:** her ML-DSA-87 imzası ayrılmış bir önekle başlar, böylece bir mesaj ya da oturum açma imzası asla işlem imzası olarak tekrar oynatılamaz.
- **Zincirde olanlar:** kayıtlı ML-DSA-87 açık anahtarı, hibrit işlemler ve EVM pencereleri. Anahtarlar, imzalama ve doğrulama QoreSign'ı çalıştıran cihazda veya sunucuda gerçekleşir.
- **Ortak test vektörleri:** kablo biçimleri paketlerden ayrı sürümlenir ve her dilin bayt bayt yeniden ürettiği [test vektörleriyle](/qoresign/vectors) kapsanır.

Boyutlar (FIPS 204 ve [boyutlar kılavuzu](/qoresign/guides/sizes-and-transport)): bir ML-DSA-87 açık anahtarı 2.592 bayt, gizli anahtar 4.896 bayt, bir imza 4.627 bayt ve tohum 32 bayttır. Hibrit bir işlem klasik bir işlemden yaklaşık 4,7 KB daha büyüktür; bu yüzden imzalamadan önce simüle edin. Bir imza veya açık anahtar tek bir statik QR koduna sığmaz; hava boşluklu imzalayıcılar çok parçalı QR'a ihtiyaç duyar. Gizli anahtarı değil, 32 baytlık tohumu saklayın.

## Paketler {#packages}

| Dil | Paket | Kurulum | Asgari platform |
|---|---|---|---|
| TypeScript | [`@qorechain/qoresign`](https://www.npmjs.com/package/@qorechain/qoresign) | `npm install @qorechain/qoresign` | Node.js 20 veya üzeri; tarayıcılar |
| Rust | [`qorechain-qoresign`](https://crates.io/crates/qorechain-qoresign) (kütüphane adı `qoresign`) | `cargo add qorechain-qoresign` | kararlı Rust |
| Go | [`github.com/qorechain/qoresign/go`](https://pkg.go.dev/github.com/qorechain/qoresign/go) | `go get github.com/qorechain/qoresign/go@v0.1.1` | Go 1.25 |
| Python | [`qorechain-qoresign`](https://pypi.org/project/qorechain-qoresign/) (içe aktarma `qoresign`) | `pip install qorechain-qoresign` | Python 3.9+; macOS 11+ (arm64, x86_64) ve Linux (x86_64, aarch64) için wheel dosyaları; henüz Windows wheel'i yok, diğer platformlar kaynak dağıtımından derlenir (Rust 1.95 gerekir) |
| Swift | [`github.com/qorechain/qoresign`](https://github.com/qorechain/qoresign) içinden `QoreSign` (GitHub sürümünde ikili çerçeve) | `.package(url: "https://github.com/qorechain/qoresign", from: "0.1.1")`, ürün `QoreSign` | iOS 16, macOS 13 |
| Kotlin / JVM | [`io.github.qorechain:qoresign`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) | `implementation("io.github.qorechain:qoresign:0.1.1")` | Java 17, Kotlin 2.3 veya üzeri; macOS (arm64, x86-64), Linux (x86-64, arm64) ve Windows (x86-64) için yerel kütüphaneler |
| Android | [`io.github.qorechain:qoresign-android`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign-android) | `implementation("io.github.qorechain:qoresign-android:0.1.1")` | API 24, Kotlin 2.3 veya üzeri; `arm64-v8a`, `armeabi-v7a`, `x86_64`; R8 koruma kuralları dahildir |

:::note Kotlin derleyici sürümü
Kotlin ve Android yapıtları, projenizde **Kotlin 2.3 veya üzeri** derleyiciyi gerektirir. Kotlin 2.1 kullanan bir proje bunlara karşı derlenemez. Bağımlılığı eklemeden önce derlemenin Kotlin sürümünü yükseltin.
:::

Tüm uygulamalar kendilerini aynı [test vektörlerine](/qoresign/vectors) karşı denetler.

## Örnek {#example}

```ts
import {
  addressFromPublicKey,
  deriveCanonicalPqKey,
  deriveClassicalKey,
  signHybrid,
  verifyHybridTx,
} from "@qorechain/qoresign";

const classical = deriveClassicalKey({ mnemonic });                 // m/44'/118'/0'/0/0
const address = addressFromPublicKey(classical.publicKey, "secp256k1").bech32;
const pqKey = deriveCanonicalPqKey({ mnemonic, address });         // the key QoreChain wallets register

// bodyBytes / authInfoBytes / accountNumber come from the dApp's SignDoc
const signed = signHybrid({ chainId: "qorechain-vladi", accountNumber, bodyBytes, authInfoBytes, classicalKey: classical, pqKey });

verifyHybridTx({
  txBytes: signed.txBytes,
  chainId: "qorechain-vladi",
  accountNumber,
  classicalPublicKey: classical.publicKey,
  pqPublicKey: pqKey.publicKey,
}); // { valid: true, classical: true, pq: { valid: true, signBytesVersion: "v2" } }
```

[Hızlı Başlangıç](/qoresign/quickstart) aynı akışı baştan sona, çevrimdışı çalıştırır ve Python ile Go için mesaj imzalama hızlı başlangıçlarını içerir.

## Ana API {#main-api}

Adlar TypeScript biçiminde verilmiştir. Go aynı adları Go büyük/küçük harf düzeniyle kullanır (`SignHybrid`, `VerifySiwq`); Rust ve Python snake_case kullanır (`sign_hybrid`); Swift ve Kotlin, Rust çekirdeği üzerinde camelCase kullanır.

| Ad | Ne yapar | Nerede |
|---|---|---|
| `deriveClassicalKey`, `deriveCanonicalPqKey`, `pqKeyFromSeed`, `classicalKeyFromPrivate` | mnemonic'ten, tohumdan veya ham baytlardan anahtarlar | tümü |
| `deriveHdPqKey` | ML-DSA-87 anahtarlarının sertleştirilmiş HD türetmesi (taslak, değişebilir) | tümü |
| `addressFromPublicKey`, `addressFromBytes`, `parseAddress` | `qor1` adresleri | tümü |
| `signHybrid`, `signPqLayer`, `hybridSignBytes` | hibrit imzalama ve imzalama baytları v1 veya v2 | tümü |
| `verifyHybridTx`, `verifyPqLayer` | yerel doğrulama | tümü |
| `buildRegisterPqKeyMessage`, `signProofOfPossession`, `verifyProofOfPossession` | sahiplik kanıtlı anahtar kaydı | tümü |
| `signMessage`, `verifyMessage` | rastgele mesaj imzalama (ADR-36 artı ML-DSA-87) | tümü |
| `createSiwqMessage`, `parseSiwqMessage`, `signSiwq`, `verifySiwq` | Sign In With QoreChain v1 | tümü |
| `decideLane`, `assertHybridLane`, `evaluateLayerState` | hat kuralları; düşürülmüş katmanın tespiti | tümü |
| `fetchPqKeyStatus`, `resolveSignBytesVersion`, `simulateTx`, `suggestGasLimit`, `broadcastTx`, `submitWithSignBytesFallback`, `assertPqLayerMatchesRegisteredKey`, `verifySiwqWithChain`, `verifyMessageWithChain`, `fetchCommittedExtensionTypeUrls` | ağ yardımcıları | TypeScript, Go |
| `inspectTransaction`, `fetchEvmWindow` | işlenmiş bir işlemi oku; bir EVM penceresini oku (0.1.1) | TypeScript |

Go'da ağ yardımcıları bir istemci üzerindeki yöntemlerdir: `client := network.NewClient("https://api-testnet.qore.host")`, ardından `client.VerifySiwqWithChain(ctx, address, qoresign.VerifySiwqOptions{...})` veya `client.SimulateTx(...)`. Python hataları `code` ve `detail` içeren `QoreSignError`'dır; bayt alanları `bytes`'tır.

API referansı: deponun bir kopyasında `pnpm -C packages/ts docs` (TypeScript), `cargo doc -p qorechain-qoresign` (Rust) veya `go doc github.com/qorechain/qoresign/go` (Go) komutunu çalıştırın. Swift, Kotlin ve Python bağlayıcıları Rust API'sini yansıtır; bkz. [Swift](https://github.com/qorechain/qoresign/tree/main/swift), [Kotlin](https://github.com/qorechain/qoresign/tree/main/kotlin) ve [Python](https://github.com/qorechain/qoresign/tree/main/python) README dosyaları.

## Ağlar ve gereksinimler {#networks}

| | Ana ağ | Test ağı |
|---|---|---|
| Zincir kimliği | `qorechain-vladi` (EVM zincir kimliği 9801) | `qorechain-diana` (EVM zincir kimliği 9800) |
| REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM | `https://evm.qore.host` | `https://evm-testnet.qore.host` |
| Doğrulanan imzalama baytları | v2 | v2 |

- **Yerel hat:** ağ, ML-DSA-87 imzasını varsayılan olarak zorunlu tutar. Muaf olanlar: bir hesabın ML-DSA-87 anahtarının kaydı ve anahtarı olmayan bir hesabın unjail işlemi. Hibrit işlemlerin doğrulanması için hesabın anahtarı kayıtlı olmalıdır (`MsgRegisterPQCKeyV2`); QoreChain cüzdanları bunu hesap oluşturulurken kaydeder.
- **EVM hattı:** kayıtlı bir ML-DSA-87 anahtarı olan bir hesap, hibrit imzalı bir yerel hat işlemiyle sınırlı bir yetkilendirme penceresi açar (bitiş yüksekliği, en fazla işlem, en fazla değer, isteğe bağlı izin verilen sözleşmeler). Canlı bir pencere dışında ağ, hesabın EVM işlemlerini reddeder. Okumalar ve gaz tahmini pencere gerektirmez.
- **Ücretler:** birim `uqor` (6 ondalık), asgari gaz fiyatı gaz başına 0,1 uqor.
- **Keplr kayıt değerleri:** bech32 öneki `qor`, coin türü `118`.
- **Hesaplar:** çevrimdışı işlevler için gerekmez. Ağ yardımcıları yalnızca bir REST uç noktası gerektirir; yayın için ML-DSA-87 anahtarı kayıtlı, fonlanmış bir hesap gerekir.

## Dokümantasyon {#documentation}

- [Hızlı Başlangıç](/qoresign/quickstart): birkaç dakikada anahtar türetin, hibrit bir işlemi imzalayın ve doğrulayın.
- Kılavuzlar
  - [Keplr uyumlu bir cüzdana hibrit imzalama ekleyin](/qoresign/guides/keplr-compatible-wallets)
  - [Sign In With QoreChain: sunucu doğrulaması](/qoresign/guides/sign-in)
  - [EVM cüzdanları: yetkilendirme penceresi](/qoresign/guides/evm-quantum-ready)
  - [Anahtar türetme: kanonik anahtarlar ve HD taslağı](/qoresign/guides/key-derivation)
  - [Boyutlar ve aktarım](/qoresign/guides/sizes-and-transport)
- Spesifikasyonlar
  - [Hibrit işlem imzalama v1](/qoresign/spec/hybrid-signing-v1)
  - [Sign In With QoreChain v1](/qoresign/spec/siwq-v1)
  - [Mesaj imzalama v1](/qoresign/spec/message-signing-v1)
  - [ML-DSA-87 anahtar türetme](/qoresign/spec/hd-derivation-draft)
- [Test vektörleri](/qoresign/vectors)
- [Örnekler](https://github.com/qorechain/qoresign/tree/main/examples)

## Kapsam ve sınırlar {#scope}

- QoreSign yerel olarak imzalar. Sizin yerinize anahtar tutmaz, eşik veya MPC imzalama yapmaz ve donanım cüzdanlarında imzalama yapmaz.
- Hibrit EVM imzası yoktur: `assertHybridLane("evm")` `LANE_NOT_AVAILABLE` hatası verir. EVM hesapları bunun yerine yetkilendirme penceresini kullanır. SVM işlemleri açık değildir.
- Rust, Swift, Kotlin ve Python'da ağ kodu yoktur. Hesap numaralarını getirme, simüle etme ve yayınlama uygulamanızda kalır; ya da TypeScript veya Go yardımcılarını kullanın.
- `inspectTransaction` ve `fetchEvmWindow` yalnızca TypeScript'te vardır. `inspectTransaction`, katmanı imzalayanın şu an kayıtlı olan anahtarına karşı denetler; bu yüzden bir anahtar döndürmesinden sonra eski bir işlem `verified: false` bildirir.
- Kanonik türetme mnemonic'i gerektirir. Mnemonic'i olmayan cüzdanlar (donanımda tutulan anahtarlar) rastgele bir anahtar üretir (`pqKeyFromSeed`) ya da HD taslağını kullanır ve o anahtarı kaydeder. Mnemonic kanonik biçimde olmalıdır (küçük harf, tek boşluk); başka yazımlar normalleştirilmez, reddedilir.
- HD türetme (`deriveHdPqKey`) bir taslaktır ve değişebilir.
- Python'un henüz Windows wheel'i yoktur. Kotlin ve Android, Kotlin 2.3 veya üzeri derleyiciyi gerektirir.
- ML-DSA-87 ve secp256k1 uygulamaları `qorechain-pqc`'den (`@noble/post-quantum`, `fips204` ve Cloudflare CIRCL üzerine kurulu) ve `@noble/curves`, `k256` ile `decred/secp256k1` kütüphanelerinden gelir.

## Güvenlik notları {#security}

- Anahtarlar, QoreSign'ı çalıştıran süreçten asla çıkmaz. Bir ağ yardımcısı çağırmadığınız sürece hiçbir yere bir şey gönderilmez ve bu yardımcılar yalnızca herkese açık veri gönderir: adresler, imzalı işlem baytları ve hash'ler.
- İmzalamadan önce `bodyBytes` ve `authInfoBytes` içindeki mesajları ve ücreti kullanıcıya gösterin; ML-DSA-87 imzası ücreti kapsar.
- Bir dApp zaten bir PQC katmanı taşıyan bir gövde sağladığında, klasik imzayı eklemeden önce `assertPqLayerMatchesRegisteredKey` ile denetleyin. Yayından sonra, `fetchCommittedExtensionTypeUrls` ile birlikte `evaluateLayerState` ya da `inspectTransaction`, katmanın zincire ulaştığını doğrular.
- ML-DSA-87 anahtarıyla ayrılmış alanların dışında asla ham bayt imzalamayın.
- Oturum açma nonce'ları tek kullanımlıktır. `verifySiwq`, `requirePq: false` verilmedikçe ML-DSA-87 kısmı olmayan bir oturum açmayı reddeder; yalnızca klasik oturum açmaları, ancak hizmetinizin kuantum sonrası güvenceye ihtiyacı yoksa kabul edin.
- Gizli anahtarı değil, 32 baytlık ML-DSA-87 tohumunu şifreli olarak saklayın.
- Ana ağ mnemonic'ini asla bir betiğe veya kabuk geçmişine koymayın. Örnekler herkese açık BIP-39 test ifadesini kullanır (`abandon` on bir kez, ardından `about`); asla fonlamayın.
- Güvenlik açıklarını herkese açık sorunlarda değil, security@qore.network adresine özel olarak bildirin. Güvenlik düzeltmeleri en son minör sürüme girer.

## Nerede yayımlandı {#where-published}

Sürümler kayıt defterlerinde 27 Ekim 2026 tarihinde denetlendi.

| Kayıt defteri | Paket | Sürüm | Bağlantı |
|---|---|---|---|
| npm | `@qorechain/qoresign` | 0.1.1 | [npmjs.com](https://www.npmjs.com/package/@qorechain/qoresign) |
| crates.io | `qorechain-qoresign` | 0.1.1 | [crates.io](https://crates.io/crates/qorechain-qoresign) |
| Go modül proxy'si | `github.com/qorechain/qoresign/go` | v0.1.1 (etiket `go/v0.1.1`) | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qoresign/go) |
| Maven Central | `io.github.qorechain:qoresign` | 0.1.1 | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) |
| Maven Central | `io.github.qorechain:qoresign-android` | 0.1.1 | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoresign-android) |
| PyPI | `qorechain-qoresign` | 0.1.1 (macOS arm64 ve x86_64, Linux x86_64 ve aarch64 wheel dosyaları, kaynak dağıtımı) | [pypi.org](https://pypi.org/project/qorechain-qoresign/) |
| Swift Package Manager | `github.com/qorechain/qoresign` içinden `QoreSign` | 0.1.1 (sürümde ikili `QoreSignFFI.xcframework.zip`) | [GitHub sürümü](https://github.com/qorechain/qoresign/releases/tag/v0.1.1) |

Depo: [github.com/qorechain/qoresign](https://github.com/qorechain/qoresign) (v0.1.0 ve v0.1.1 sürümleri).

## İlgili sayfalar {#related}

- [Kuantum sonrası ilkeller (`qorechain-pqc`)](/developer-tools/pqc-library): QoreSign'ın altındaki ML-DSA-87 ilkelleri.
- [QoreChain SDK](/sdk/overview): işlem oluşturucular, EVM pencere mesajları ve özellik algılama.
- [Cüzdan adaptörü](/developer-tools/wallet-adapter): bir cüzdan değiştirilemediğinde dApp tarafındaki alternatif. dApp ML-DSA-87 anahtarını tutar ve değiştirilmemiş cüzdandan `signDirect` ister; baytlar QoreSign'ınkilerle aynıdır.
- [QoreSeal](/developer-tools/qoreseal): hesaplara şifreleme; alıcı kartları QoreSign mesaj imzalarıdır.
- [Saklama seti](/developer-tools/custody-kit): QoreSign üzerine kurulu yatırım algılama ve çekim doğrulama.
- [QoreChain MCP sunucusu](/developer-tools/mcp): `get_pq_status` aracı, hibrit katmanı doğrulamak için QoreSign'ı kullanır.
- [Kuantum sonrası imzalama](/developer-guide/post-quantum-signing) ve [Borsa entegrasyonu](/developer-guide/exchange-integration).
- [Geliştirici paketlerine genel bakış](/developer-tools/overview).

## Sürümleme {#versioning}

QoreSign 1.0 öncesi aşamadadır: minör sürümler API'yi değiştirebilir ve her geriye dönük uyumsuz değişiklik [değişiklik günlüğünde](https://github.com/qorechain/qoresign/blob/main/CHANGELOG.md) listelenir. Kablo biçimleri ayrı sürümlenir (`v1` spesifikasyonları ve `vectors/qoresign-v1.json`) ve bir sürüm içinde değişmez.

## Katkı ve güvenlik {#contributing}

Bkz. [CONTRIBUTING.md](https://github.com/qorechain/qoresign/blob/main/CONTRIBUTING.md). Güvenlik açıklarını [SECURITY.md](https://github.com/qorechain/qoresign/blob/main/SECURITY.md) dosyasında anlatıldığı gibi özel olarak bildirin.

## Lisans {#license}

[Apache-2.0](https://github.com/qorechain/qoresign/blob/main/LICENSE). Telif hakkı 2026 QoreChain Association.
