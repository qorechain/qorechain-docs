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
depolarında **yayımlanmıştır**. Güncel sürüm hattı **0.8**'dir: TypeScript,
Python, Rust ve Java **0.8.3** sürümündedir, Go modülü ise **v0.8.4** sürümündedir.
Aşağıdan dilinizi seçin.

## Yükseltme notları {#upgrade}

:::danger Canlı ağlarda SDK 0.8.1 veya sonrasını kullanın
Her iki genel ağ da **v2 hibrit sign-bytes** biçimini (alan etiketli ve zincir
kimliğine bağlı) doğrular ve eski biçimi `pqc` kod 21 ile reddeder. **0.8.0**'dan
önceki her SDK sürümü eski biçimi imzalar; **0.8.0** ise geçişi, ağların kullandığı
iki yükseltme adından yalnızca birinin altında arar (mainnet bunu `v3.2.0` olarak,
testnet ise `v3.1.98` ve ardından `v3.2.0` olarak kaydetti), dolayısıyla mainnet
üzerinde yanlış biçimi imzalar. Her dilde **0.8.1 veya sonrasını** kullanın; bir
[EVM yetkilendirme penceresi](/sdk/guides/evm#evm-window) açmak için **0.8.2 veya
sonrası** gerekir. Hibrit oluşturucular bir `signBytesVersion` seçeneği alır
(`"auto"` | `"v1"` | `"v2"`); `"auto"` ağa sorar ve bu nedenle
`qorechain-vladi` / `qorechain-diana` üzerinde REST uç noktasına (`rest`) ihtiyaç
duyar: tahmin etmek yerine hata fırlatır. Bkz.
[Hangi sign-bytes biçimi?](/sdk/concepts/accounts-pqc#sign-bytes-versions).
:::

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

npm'de `0.8.3` sürümüyle yayımlanmıştır. Bkz.
[React kiti kılavuzu](/sdk/guides/react).

### İskelet oluşturucu

`create-qorechain-dapp` (npm, `0.8.0`), çalışmaya hazır bir dApp iskeleti
oluşturur:

```bash
npm create qorechain-dapp@latest my-dapp
```

Oluşturulan `package.json` dosyaları `@qorechain/sdk` / `@qorechain/evm` paketlerini
`^0.3.0` sürümüne sabitler; npm bunu canlı ağlar için imzalayamayan bir 0.3
sürümüne çözümler. İskeleti oluşturduktan sonra `npm i @qorechain/sdk@latest`
çalıştırın (EVM şablonu için ayrıca `npm i @qorechain/evm@latest`). Bkz.
[CLI başvurusu](/sdk/reference/cli).

## Python

```bash
pip install qorechain-sdk
```

Python 3.10+ gerektirir. Paket, tip ipuçları ve bir `py.typed` işaretçisiyle
birlikte gelir.

> Dağıtım `qorechain-sdk` adıyla kurulur (PyPI'da `0.8.3` sürümüyle
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
(`packages/go/v0.8.4` etiketiyle).

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

> crates.io'da `qorechain-sdk` (0.8.3) adıyla yayımlanmıştır; `cargo add qorechain-sdk`
> en son sürümü kurar.

## Java

Maven (`pom.xml`):

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.8.3</version>
</dependency>
```

Ya da Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.8.3'
```

> Maven Central'da `io.github.qorechain:qorechain-sdk:0.8.3` adıyla
> yayımlanmıştır. Central'da 0.8.0 veya 0.8.1 derlemesi yoktur; bu nedenle canlı
> ağlarda 0.8.2 veya sonrasını kullanın.

## İlgili paketler {#related-packages}

| Paket | Amaç | Sürüm |
| --- | --- | --- |
| `@qorechain/wallet-adapter` | Cüzdan tarafı yardımcıları: cüzdan oluşturma (`generateQoreWallet`), `eth_secp256k1` hibrit imzalama (`signHybridEth`, `QoreChainSigner`), MetaMask ağ kaydı (`addQoreEvmToWallet`), authenticator ve EVM penceresi mesaj oluşturucuları. Peer dependency'ler: `@cosmjs/proto-signing` ve `@cosmjs/stargate` `^0.32` | 0.3.0 |
| `@qorechain/chain-bridge` | Arka uçlar için sunucu tarafı worker: PQC anahtarını türetir, hibrit imzalar ve yayınlar (`sendTokens`, `registerPqc` ve daha fazlası). `cosmosRest` geçin | 0.2.2 |
| `@qorechain/pqc` | Yalnızca standartlara uygun ML-DSA / ML-KEM / SHAKE-256 ilkelleri ve `hybridSignBytes` (bkz. [Post-Kuantum İmzalama](/developer-guide/post-quantum-signing)) | 0.2.1 |
| `@qorechain/handles` | İlk kullanımda güven (trust-on-first-use) sabitlemesiyle doğrulanmış `@handle` çözümlemesi (`HandleClient`) | 0.1.0 |
| `@qorechain/rdk` | Rollup Development Kit istemcisi (bkz. [Rollup'lar](/rollups/why)). npm sürümü (0.4.4) işlemleri yalnızca klasik olarak imzalar, ağlar bunu reddeder; dolayısıyla okuyabilir ancak gönderemez; hibrit imzalama 0.5.0 sürümündedir ve şu anda yalnızca PyPI ve Go modülünde bulunur | 0.4.4 (npm) |

## Sıradaki adım

Bağlanmak ve zincir üzerindeki durumu okumak için
[Hızlı Başlangıç](/sdk/quickstart) sayfasına geçin.
