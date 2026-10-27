---
slug: /sdk/install
title: Kurulum
sidebar_label: Kurulum
sidebar_position: 2
---

# Kurulum

Dilinize uygun SDK'yı kurun. TypeScript çekirdeği (`@qorechain/sdk`), EVM ve
SVM adaptörleri (`@qorechain/evm`, `@qorechain/svm`), React kiti
(`@qorechain/react`) ile Python, Go, Rust ve Java istemcilerinin tümü, yerel
zincirle tam eşdeğerlik sağlayacak şekilde (tipli mesajlar, sorgular, işlem
yaşam döngüsü, hibrit PQC işlemleri ve WebSocket abonelikleri) kendi kayıt
depolarında **yayımlanmıştır**. Güncel sürüm hattı **0.10**'dur ve 25 ve 26 Ekim
2026'da yayımlanmıştır (27 Ekim 2026'da her kayıt deposuna karşı kontrol edildi):

| Kayıt deposu | Paket | Sürüm |
| --- | --- | --- |
| npm | `@qorechain/sdk`, `@qorechain/react`, `create-qorechain-dapp` | 0.10.0 |
| PyPI | `qorechain-sdk` (import `qorsdk`) | 0.10.0 |
| crates.io | `qorechain-sdk` (import `qorechain`) | 0.10.0 |
| Go modül proxy'si | `github.com/qorechain/qorechain-sdk/packages/go` | v0.10.0 |
| Maven Central | `io.github.qorechain:qorechain-sdk` | 0.10.0 (Java istemcisi diğer dillerle yeniden aynı sürümde; 0.9.1 yalnızca Java'ya özel bir güncellemeydi) |

Aşağıdan dilinizi seçin.

## Yükseltme notları {#upgrade}

:::danger Canlı ağlarda SDK 0.8.1 veya sonrasını kullanın
Her iki genel ağ da **v2 hibrit sign-bytes** biçimini (alan etiketli ve zincir
kimliğine bağlı) doğrular ve eski biçimi `pqc` kod 21 ile reddeder. **0.8.0**'dan
önceki her SDK sürümü eski biçimi imzalar; **0.8.0** ise geçişi, ağların kullandığı
iki yükseltme adından yalnızca birinin altında arar (mainnet bunu `v3.2.0` olarak,
testnet ise `v3.1.98` ve ardından `v3.2.0` olarak kaydetti), dolayısıyla mainnet
üzerinde yanlış biçimi imzalar. Her dilde **0.10.0** (veya en azından **0.8.1**)
kullanın; bir [EVM yetkilendirme penceresi](/sdk/guides/evm#evm-window) açmak için
**0.8.2 veya sonrası** gerekir. Hibrit oluşturucular bir `signBytesVersion`
seçeneği alır (`"auto"` | `"v1"` | `"v2"`); `"auto"` ağa sorar ve bu nedenle
`qorechain-vladi` / `qorechain-diana` üzerinde REST uç noktasına (`rest`) ihtiyaç
duyar: tahmin etmek yerine hata fırlatır. Bkz.
[Hangi sign-bytes biçimi?](/sdk/concepts/accounts-pqc#sign-bytes-versions).
Biçim, zincir v3.2.3 veya v3.2.4 ile değişmedi (v3.2.4 test ağında 19 Ekim 2026'dan beri, mainnet'te 23 Ekim 2026'dan beri çalışır): `"auto"` her
iki ağda da v2'ye çözümlenir, çünkü ikisi de v2'ye geçiren yükseltmeyi uyguladı.
:::

## 0.10.0 neler ekliyor {#whats-new-0100}

SDK 0.10.0, mainnet'in 23 Ekim 2026'da 3.742.566 yüksekliğinde uyguladığı (testnet
bunu 19 Ekim'de 8.337.253 yüksekliğinde uyguladı) zincir **v3.2.4** için istemci
sürümüdür. İmzalama biçimi, adresler, ondalık basamaklar, memo'lar ve ücretler
değişmedi ve 0.9.0 ile oluşturulmuş bir işlem geçerli kalır. Sürüm, her dilde testnet
üzerinde gerçek işlemlerle kontrol edildi. v3.2.4'ten sonra getirilen hiçbir şey için
oluşturucuları yoktur. Testnet v3.2.6'ya geçti (v3.2.5 ve v3.2.6 orada 26 ve 27 Ekim
2026'da uygulandı); mainnet yönetişim önerisi 14, yazım sırasında v3.2.5'i 3.906.833
yüksekliğinde uygulayacaktır ve bu sürümün neler eklediği mainnet onu uyguladığında
belgelenir. 0.10.0'daki yenilikler:

| Alan | 0.10.0'da |
| --- | --- |
| Stake katmanları (`x/stakingtier`) | `lockDelegation` (zincirin kendi denetimleri: 3, 6 veya 12 aylık bir süre ve pozitif bir tam miktar), `unlockEarly`, `claimBonus` ve `updateParams` oluşturucuları; modül parametreleri, bir sahibin kilitleri ve bonus havuzu için okumalar (`fetchStakingTierParams`, `fetchStakingLocks`, `fetchStakingTierPool`); modülün hata kodları. Modülün ne yaptığı [Staking ve Delegasyon](/user-guide/staking-and-delegation) sayfasında anlatılır |
| Authenticator nonce değeri | `fetchAuthNonce({ rest, address, pubkey })`, bağlı bir anahtarın `MsgExecuteEVM` / `MsgExecuteCosmos` için sıradaki imzalaması gereken sırayı elle takip etmek yerine `/qorechain/abstractaccount/v1/auth_nonce/{address}/{pubkey_hex}` rotasından okur. Her iki ağ da rotayı sunar; `abstractaccount` modülünün kendisi mainnet'te kapalıdır (testnet'te etkindir), bu nedenle bir mainnet harcaması herhangi bir nonce denetlenmeden önce reddedilir |
| Protokol özellik anahtarları | `fetchProtocolFeatures` ve `isProtocolFeatureEnabled`, bir ağın hangi konsensüs kurallarını uyguladığını adıyla `/qorechain/pqc/v1/protocol_features` rotasından okur (her iki ağ da sunar). v3.2.4'ün altındaki bir ağ rotayı sunmaz; orada `isUpgradeApplied` kullanın |
| `possessionProven` | PQC durumu, hesabın anahtarının bir sahiplik kanıtıyla kaydedilip kaydedilmediğini söyler |
| `ibcTimeoutTimestamp(seconds)` | `MsgTransfer`'ın aldığı birimde (Unix nanosaniye) mutlak bir IBC zaman aşımı. IBC zaman aşımları mutlak zamanlardır; IBC v2 paketleri mutlak Unix saniyesi alır ve orada göreli bir değer ücret alındıktan sonra reddedilir. Mainnet'te hiçbir IBC kanalı açık değildir (27 Ekim 2026'da kontrol edildi) |
| Yükseltme sabiti ve protobuf'lar | `CHAIN_UPGRADE_V3_2_4`; zincir v3.2.4 ile eşitlenmiş protobuf tanımları (köprü doğrulayıcı kaydında, hafif düğümde ve rollup sorgularında yeni alanlar) |
| `ensurePqcRegistered` | Açık anahtarı olmayan bir durumu eşleşme sayıyordu; artık anahtarı `rest` üzerinden okur ve karşılaştırır. Okunacak bir şey yoksa sonuç, anahtarın çağıranın olduğunu iddia etmek yerine `keyVerified: false` bildirir |
| Ücret simülasyonu sırasında ret | Yalnızca metin olarak gelen bir zincir reddi (örneğin "no bonus to claim"), artık her dilde zincirin kayıtlı hata açıklamalarından adlandırılır: `decodeTxError` (TypeScript), `SimulationRefusedError` (Python), `tx.DecodeRefusalText` (Go), `tx::decode_refusal_text` (Rust), `TxError.decode` (Java) |

`@qorechain/react` ve `create-qorechain-dapp` onunla birlikte 0.10.0'a geçti (kit
`@qorechain/sdk` `^0.10.0` sürümüne bağımlıdır ve iskelet oluşturucunun şablonları da öyle).

## 0.9.0 neler ekledi {#whats-new-090}

SDK 0.9.0, zincir **v3.2.2** ve **v3.2.3** için istemci sürümüydü (mainnet
bunları 3.556.788 ve 3.662.051 yüksekliklerinde uyguladı; mainnet 23 Ekim 2026'dan beri 3.742.566 yüksekliğinde v3.2.4 çalıştırır ve testnet 19 Ekim 2026'dan beri v3.2.4 veya üstünü çalıştırır). İmzalama biçimi, adresler, ondalık basamaklar, memo'lar ve ücretler
değişmedi; dolayısıyla 0.8.1 ve sonrasının imzaladığı v2 hibrit sign-bytes biçimi
hâlâ doğru olandır. Yenilikler:

| Alan | 0.9.0'da (ve sonrasında) |
| --- | --- |
| Hibrit `TxClient` (TypeScript) | Hesabın anahtar çiftini verin: `client.connectTx(signer, { pqcKeypair })` veya `TxClient.connect({ …, pqcKeypair, rest })`. Böylece her işlem hibrit imzalanır ve `fee: "auto"` hibrit işlemin kendisini simüle eder; çıplak bir anahtar kaydı klasik kalır (zincirin önyükleme yolu). `bankSend` ile SDK'nın rollup, multilayer ve cross-VM istemcileri bunu kullanır. Anahtar çifti verilmezse hiçbir şey değişmez |
| Kurtarılabilir PQC anahtarı | `derivePqcCanonical(address, mnemonic)` ve her dildeki karşılıkları (bkz. [Hibrit imzalama](/sdk/guides/quantum-safe#canonical-derivation)) |
| `ensurePqcRegistered` | Önce anahtar durumunu REST üzerinden okur (`rest`), ayırt edemediğinde kaydetmeyi reddeder, hesap zaten farklı bir anahtar tutuyorsa `PqcKeyMismatchError` fırlatır ve zincirin "already registered" reddini başarı sayar. Zincir v3.2.3'ten itibaren **sahiplik kanıtını** kendiliğinden imzalar ve ekler; v3.2.3 öncesinde alanı boş bırakır |
| Kapsamlı EVM pencereleri | `openEvmWindowMsg`, `nativeOnly` ve `allowedTargets` alır (en fazla 16, tekrar yok); `fetchEvmWindow` ikisini de geri okur (bkz. [EVM kılavuzu](/sdk/guides/evm#evm-window)) |
| EIP-7702 onayı | `authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `fetchEvmDelegationConsent`, `evmDelegationTupleNonce`, `classifyEvmDelegationRejection` |
| Anahtar bütünlüğü | Kayıt oluşturucuları `classical_only`'yi, boş bir anahtarı ve dejenere bir ML-DSA-87 anahtarını reddeder; zincir bunları v3.2.3'ten itibaren reddeder. `signProofOfPossession` / `verifyProofOfPossession` dışa aktarılır; `migratePqcKeyHybrid`, anahtarı olan hesapların v3.2.3'ten itibaren ihtiyaç duyduğu hibrit imzalı `MsgMigratePQCKey` mesajını gönderir |
| Abstract-account özeti v2 | `evmAuthSignBytesV2` (çağrının gas limitini bağlar) ve `resolveEvmAuthDigestVersion`. `abstractaccount` modülü mainnet'te kapalıdır (testnet'te etkindir); bu nedenle mainnet'te bu yalnızca başvuru içindir |
| Yükseltme algılama | `isUpgradeApplied`, `requireUpgradeApplied`: yeni isteğe bağlı alanlar yalnızca `applied_plan` sürümü bildirdikten sonra ayarlanır, çünkü bir sürümü uygulamamış bir düğüm, o sürümün yeni alanlarından biri ayarlandığında işlemin tamamını reddeder |
| Hata çözümleme | Bir blok içindeki başarısızlık codespace'ini korur (örneğin `sdk_231` değil `pqc` 231); `rate_limited` ve delegasyon kodları çözülür; `decodeTxError` fırlatılan bir hatanın günlüğünü veya mesajını okur |
| Harcama kuralları | `validateSpendingRules`, `MsgUpdateSpendingRules` oluşturucularında çalışır ve hiçbir şeyi sınırlamayan bir kuralı reddeder |
| Düzeltmeler | PQC hesap rotası her SDK'da tekil `/qorechain/pqc/v1/account/{address}` biçimindedir (ve birleşik istemci verildiğinde `client.rest.getPqcAccount`, `isPqcRegistered` ve `getPqcStatus` içinde de); dışa aktarılan `VERSION` paketle eşleşir; SDK'nın oluşturduğu Go ve Rust istemcileri takılı kalmak yerine zaman aşımına uğrar; `create-qorechain-dapp` şablonları birlikte geldikleri sürüme bağımlıdır |

Yeni anahtarlar için eski PQC türetmesi (`derivePqcLegacy`, `"bridge"`) kullanımdan
kaldırılmıştır: hesaba bağlı değildir; bu nedenle bir mnemonic her hesaba tek bir
anahtar verirdi. Rotasyon yardımcıları onu **yeni** anahtar olarak reddeder; mevcut
bir eski anahtarı kurtarmak veya ondan rotasyonla uzaklaşmak hâlâ çalışır.

## 0.9.0 öncesi sürümler {#before-090}

0.8.x kullanıyorsanız, her iki ağın da doğruladığı biçimi imzalamaya devam eder ve
mainnet ve testnet üzerinde çalışır. Bunlar, 0.9.0'ın kaldırdığı
sınırlardır ve bazıları bilmediğinizde ücrete mal olur:

| 0.9.0 öncesi sürüm | Geçici çözüm |
| --- | --- |
| Sahiplik kanıtı, kapsamlı pencere veya EIP-7702 onayı oluşturucuları yok | `qorechaind tx pqc register-key-v2 … --pqc-key <name>`, `open-evm-window --native-only` / `--allowed-targets` ve `authorize-evm-delegation` / `clear-evm-delegation` komutlarını kullanın (bkz. [EVM yetkilendirme penceresi](/getting-started/first-transaction#evm-window), [EIP-7702 delegasyonları](/architecture/post-quantum-security#eip-7702)) |
| `status` verilmeden `ensurePqcRegistered` kaydı denetlemeden yayınlıyordu ve farklı bir anahtar kayıtlıyken başarı bildiriyordu | Zaten anahtarı olan bir hesap için ikinci bir kayıt **ücret alındıktan sonra** reddedilir. Önce `GET /qorechain/pqc/v1/account/{address}` adresini okuyun ve `status: { registered: found }` geçin |
| `client.rest.getPqcAccount`, `isPqcRegistered`, `getPqcStatus` | Çoğul bir `/accounts/` yolunu veya herkese açık uç noktaların sunmadığı `qor_` ad alanını çağırıyorlardı (HTTP 501, `-32601`). Yukarıdaki tekil REST rotasını okuyun |
| `TxClient` / `bankSend` ile rollup, multilayer ve cross-VM istemcileri yalnızca klasik imzalıyordu | Ağlar bunu anahtarı olan her hesap için reddeder. `signAndBroadcastHybrid` üzerinden gönderin |
| Blok içinde başarısız olan işlemler codespace'ini yitiriyordu | İşlemi `GET /cosmos/tx/v1beta1/txs/{hash}` adresinden okuyun |
| 0.8.3'ün dışa aktarılan `VERSION` sabiti `0.8.0` bildiriyordu | Kurulu sürümü `package.json` içinden okuyun |
| `create-qorechain-dapp` 0.8.0, `@qorechain/sdk` / `@qorechain/evm` paketlerini `^0.3.0` sürümüne sabitliyordu (0.x sürümünde caret, 0.3 içinde kalır) | İskeleti oluşturduktan sonra `npm i @qorechain/sdk@latest` çalıştırın |
| `@qorechain/react` 0.8.x, kayıtlı anahtar durumunu herkese açık uç noktalarda okunamaz bırakıyordu | `@qorechain/react` 0.9.0 veya üstünü kullanın |

:::caution Eski düzeltmeler
SDK **0.6.1**, konsensüs açısından kritik bir hatayı düzeltti:
`/qorechain.pqc.v1.PQCHybridSignature` tx-body uzantısı `Any.value` içine
JSON olarak serileştiriliyor ve **zincir tarafından CheckTx aşamasında
reddediliyordu**. SDK ≤ 0.6.0 ile oluşturulan hibrit (PQC + klasik) işlemler
zincir üzerinde reddedilir. **0.8.0**, cüzdan imzalı hesap yardımcılarını
kaldırdı (bkz. [Hesaplar ve PQC imzalama](/sdk/concepts/accounts-pqc#phantom)).
:::

## TypeScript

Çekirdek paket:

```bash
npm i @qorechain/sdk
```

Node.js 20+ hedefler; ESM, CommonJS ve tip tanımlarıyla birlikte gelir. Bu
belgelerdeki hibrit işlem örnekleri ayrıca `@cosmjs/stargate` içinden
`StargateClient` içe aktarır (`npm i @cosmjs/stargate`).

### EVM adaptörü

`@qorechain/evm`, [viem](https://viem.sh) üzerine kurulu ince ve tip güvenli
bir adaptördür. viem bir **peer dependency**'dir — birlikte kurun:

```bash
npm i @qorechain/evm viem
```

npm'de `0.8.0` sürümüyle yayımlanmıştır.

### SVM adaptörü

`@qorechain/svm`,
[`@solana/web3.js`](https://solana.com/docs/clients/javascript) üzerine kurulu
ince bir adaptördür; `@solana/web3.js` bir **peer dependency**'dir:

```bash
npm i @qorechain/svm @solana/web3.js
```

npm'de `0.8.0` sürümüyle yayımlanmıştır.

### React kiti

`@qorechain/react`, `@qorechain/sdk` üzerindeki resmi React katmanıdır — bir
provider, hook'lar ve `ConnectButton` / `QuantumSafeBadge` bileşenlerini
içerir. `react` (>=18) bir peer dependency'dir:

```bash
npm i @qorechain/react
```

npm'de `0.10.0` sürümüyle yayımlanmıştır; `@qorechain/sdk` `^0.10.0` sürümüne
bağımlıdır. Bkz. [React kiti kılavuzu](/sdk/guides/react).

### İskelet oluşturucu

`create-qorechain-dapp` (npm, `0.10.0`), çalışmaya hazır bir dApp iskeleti
oluşturur:

```bash
npm create qorechain-dapp@latest my-dapp
```

Oluşturulan `package.json` dosyaları, iskelet oluşturucunun birlikte geldiği SDK
sürümüne bağımlıdır (`@qorechain/sdk` `^0.10.0`; EVM şablonu `@qorechain/evm`
`^0.8.0` kullanır). İskelet oluşturucunun 0.8.0 sürümü `^0.3.0` aralıkları
yazıyordu; bir 0.x sürümünde bunlar 0.3 içinde kalır ve canlı ağlar için
imzalayamaz; 0.8.0 ile iskelet oluşturduysanız `npm i @qorechain/sdk@latest`
çalıştırın. Bkz. [CLI başvurusu](/sdk/reference/cli).

## Python

```bash
pip install qorechain-sdk
```

Python 3.10+ gerektirir. Paket, tip ipuçları ve bir `py.typed` işaretçisiyle
birlikte gelir.

> Dağıtım `qorechain-sdk` adıyla kurulur (PyPI'da `0.10.0` sürümüyle
> yayımlanmıştır) ancak **`qorsdk` adıyla içe aktarılır**:
>
> ```python
> import qorsdk
> ```

## Go

```bash
go get github.com/qorechain/qorechain-sdk/packages/go/...
```

Go 1.23+ gerektirir. İhtiyaç duyduğunuz alt paketleri içe aktarın, örneğin:

```go
import (
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/client"
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/accounts"
)
```

Kendi kendine yeten bir Go modülü olarak yayımlanmıştır
(`packages/go/v0.10.0` etiketiyle). Sürümü açıkça sabitleyin:
`go get github.com/qorechain/qorechain-sdk/packages/go@v0.10.0`.

## Rust

```bash
cargo add qorechain-sdk
```

Ya da depo başını takip etmek için:

```toml
[dependencies]
qorechain-sdk = { git = "https://github.com/qorechain/qorechain-sdk" }
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

Rust 1.74+ gerektirir. Okuma istemcileri asenkrondur (Tokio). Crate,
`qorechain` adıyla içe aktarılır (`use qorechain;`).

> crates.io'da `qorechain-sdk` (0.10.0) adıyla yayımlanmıştır; `cargo add qorechain-sdk`
> en son sürümü kurar.

## Java

Maven (`pom.xml`):

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.10.0</version>
</dependency>
```

Ya da Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.10.0'
```

> Maven Central'da `io.github.qorechain:qorechain-sdk` adıyla yayımlanmıştır
> (0.10.0 en son ve sürüm (release) olanıdır, 27 Ekim 2026'da kontrol edildi).
> Central'da 0.8.0 veya 0.8.1 derlemesi yoktur; bu nedenle canlı ağlarda 0.8.2
> veya sonrasını kullanın. 0.9.1, Bouncy Castle'ı 1.80'den 1.85'e API değişikliği
> olmadan taşıyan yalnızca Java'ya özel bir sürümdü.

## İlgili paketler {#related-packages}

| Paket | Amaç | Sürüm |
| --- | --- | --- |
| `@qorechain/wallet-adapter` | Cüzdan tarafı yardımcıları: cüzdan oluşturma (`generateQoreWallet`), `eth_secp256k1` hibrit imzalama (`signHybridEth`, `QoreChainSigner`), MetaMask ağ kaydı (`addQoreEvmToWallet`), authenticator ve EVM penceresi mesaj oluşturucuları (`openEvmWindowMsg` yalnızca kapsamsız biçimi oluşturur), v2 abstract-account özeti. Sahiplik kanıtı eklemez. Peer dependency'ler: `@cosmjs/proto-signing` ve `@cosmjs/stargate` `^0.32` (SDK cosmjs 0.39 kullanır; bu nedenle ikisini aynı projeye kurmak npm'in bir peer çakışması, `ERESOLVE`, bildirmesine yol açar; onları ayrı projelerde tutun veya `--legacy-peer-deps` geçin) | 0.4.0 |
| `@qorechain/chain-bridge` | Arka uçlar için sunucu tarafı worker: PQC anahtarını türetir, hibrit imzalar ve yayınlar (`sendTokens`, `registerPqc` ve daha fazlası). `cosmosRest` geçin: bununla, ağ v3.2.3'ü uyguladıktan sonra bir kayıt sahiplik kanıtını taşır ve PQC'ye benzeyen bir ret, herhangi bir yeniden kayıttan önce zincire karşı kontrol edilir (farklı bir kayıtlı anahtar, ikinci bir kayıt için ücret ödetmek yerine `pqc_key_mismatch` hatası verir) | 0.2.3 |
| `@qorechain/pqc` | Yalnızca standartlara uygun ML-DSA / ML-KEM / SHAKE-256 ilkelleri ve `hybridSignBytes` (bkz. [Post-Kuantum İmzalama](/developer-guide/post-quantum-signing)); ayrıca aynı sürümde PyPI, crates.io, Maven Central ve Go proxy'sinde (Go `v0.2.3`) | 0.2.3 |
| `@qorechain/handles` | Doğrulanmış `@handle` çözümlemesi (`HandleClient`): kayıt defterinin açık anahtarını ve bir sabitleme deposunu siz sağlarsınız ve kullanıcı adresi gördükten sonra siz sabitlersiniz; paket kendiliğinden hiçbir zaman sabitlemez. Bkz. [Chain bridge ve handle'lar](/developer-tools/chain-bridge#handles) | 0.1.0 |
| `@qorechain/connect` | **npm'de kullanımdan kaldırılmıştır ve artık bakımı yapılmamaktadır; yeni işlerde kullanmayın. Bunun yerine [`@qorechain/wallet-adapter`](/developer-tools/wallet-adapter) kullanın (QoreX bağlantısı için yedekler [geliştirici araçlarına genel bakışta](/developer-tools/overview#group-connect) yer alır).** EVM, Cosmos ve SVM cüzdanları için, cüzdan adaptörü üzerine kurulu tek bir bağlayıcı (peer aralığı `@qorechain/wallet-adapter` `^0.2.1`'dir ve 0.4.0'ı içermez). Bir [EVM yetkilendirme penceresi](/sdk/guides/evm#evm-window) açmaz; bu nedenle hesabın kayıtlı bir anahtarı ve açık bir penceresi olana kadar onun üzerinden yapılan bir EVM gönderimi reddedilir | 0.2.1 |
| `@qorechain/rdk` | Rollup Development Kit istemcisi (bkz. [Rollup'lar](/rollups/why)). 0.7.0'dan itibaren `@qorechain/sdk` `^0.10.0` ve `@qorechain/evm` `^0.8.0` sürümlerine bağımlıdır; böylece SDK 0.10.0 kullanan bir uygulama SDK kopyasını kitle paylaşır (0.6.x `^0.9.0` sürümüne bağımlıydı ve 0.x sürümünde caret 0.9 içinde kalır; bu da SDK 0.10.0 kullanan bir uygulamaya ikinci, iç içe bir SDK 0.9.x kopyası veriyordu). Yalnızca bir `pqcKeypair` verdiğinizde hibrit imzalar; okumalar onsuz çalışır. Ayrıca PyPI, crates.io ve Maven Central'da `qorechain-rdk` olarak ve bir Go modülü olarak yayımlanmıştır (`@v0.7.0` sabitleyin); bu dört istemci yalnızca klasik imzalar. Bkz. [RDK 0.7.0: değişiklikler ve sınırlar](/rollups/deploying-a-rollup#rdk-050-limits) | 0.7.0 |
| `@qorechain/rdk-cli` | RDK için `qorollup` operatör CLI'ı. İşlem komutları (`create`, `pause`, `resume`, `stop`, `withdraw`) yalnızca klasik imzalar ve ağlar tarafından reddedilir; npm'den kurulduğunda çalışır ve `--version` 0.7.0 yazdırır (0.6.1 ve öncesi hiçbir şey yazdırmıyordu) | 0.7.0 |
| `create-qorechain-rollup` | Rollup başlangıç iskelet oluşturucusu; şablonları `@qorechain/rdk` `^0.7.0` sürümüne bağımlıdır ve post-kuantum anahtarınızı `QORE_MNEMONIC` veya `QORE_PQC_SEED_HEX` içinden çözümleyebildiklerinde hibrit imzalar | 0.7.0 |

## Sıradaki adım

Bağlanmak ve zincir üzerindeki durumu okumak için
[Hızlı Başlangıç](/sdk/quickstart) sayfasına geçin.
