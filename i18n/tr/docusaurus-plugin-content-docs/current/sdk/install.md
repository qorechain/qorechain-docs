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
depolarında **yayımlanmıştır**. Güncel sürüm **0.7.0** olup birleşik
eth-yerel hesapları, konsensüs açısından kritik hibrit-uzantı kodlama
düzeltmesini ve authenticator şeritlerini ekler (bkz.
[Authenticators kılavuzu](/sdk/guides/authenticators)).
Aşağıdan dilinizi seçin.

:::caution 0.6.0 veya önceki sürümlerden yükseltme
SDK **0.6.1**, konsensüs açısından kritik bir hatayı düzeltti:
`/qorechain.pqc.v1.PQCHybridSignature` tx-body uzantısı `Any.value` içine
JSON olarak serileştiriliyor ve **zincir tarafından CheckTx aşamasında
reddediliyordu**. SDK ≤ 0.6.0 ile oluşturulan hibrit (PQC + klasik) işlemler
zincir üzerinde reddedilir — kullandığınız her dilde 0.6.1 veya sonrasına
yükseltin.
:::

## TypeScript

Çekirdek paket:

```bash
npm i @qorechain/sdk
```

Node.js 20+ hedefler; ESM, CommonJS ve tip tanımlarıyla birlikte gelir.

### EVM adaptörü

`@qorechain/evm`, [viem](https://viem.sh) üzerine kurulu ince ve tip güvenli
bir adaptördür. viem bir **peer dependency**'dir — birlikte kurun:

```bash
npm i @qorechain/evm viem
```

npm'de `0.7.0` sürümüyle yayımlanmıştır.

### SVM adaptörü

`@qorechain/svm`,
[`@solana/web3.js`](https://solana.com/docs/clients/javascript) üzerine kurulu
ince bir adaptördür; `@solana/web3.js` bir **peer dependency**'dir:

```bash
npm i @qorechain/svm @solana/web3.js
```

npm'de `0.7.0` sürümüyle yayımlanmıştır.

### React kiti

`@qorechain/react`, `@qorechain/sdk` üzerindeki resmi React katmanıdır — bir
provider, hook'lar ve `ConnectButton` / `QuantumSafeBadge` bileşenlerini
içerir. `react` (>=18) bir peer dependency'dir:

```bash
npm i @qorechain/react
```

npm'de `0.7.0` sürümüyle yayımlanmıştır. Bkz.
[React kiti kılavuzu](/sdk/guides/react).

### İskelet oluşturucu

`create-qorechain-dapp` (npm, `0.7.0`), çalışmaya hazır bir dApp iskeleti
oluşturur:

```bash
npm create qorechain-dapp@latest my-dapp
```

## Python

```bash
pip install qorechain-sdk
```

Python 3.10+ gerektirir. Paket, tip ipuçları ve bir `py.typed` işaretçisiyle
birlikte gelir.

> Dağıtım `qorechain-sdk` adıyla kurulur (PyPI'da `0.7.0` sürümüyle
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
(`packages/go/v0.7.0` etiketiyle).

## Rust

```bash
cargo add qorechain-sdk
```

Ya da `0.7.0` kaynaklarını doğrudan depodan takip etmek için:

```toml
[dependencies]
qorechain-sdk = { git = "https://github.com/qorechain/qorechain-sdk" }
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

Rust 1.74+ gerektirir. Okuma istemcileri asenkrondur (Tokio). Crate,
`qorechain` adıyla içe aktarılır (`use qorechain;`).

> crates.io'da `qorechain-sdk` adıyla yayımlanmıştır. `cargo add qorechain-sdk`
> komutu, şu anda `0.7.0` sürümünün gerisinde kalan **yayımlanmış en son
> crate'i** kurar — en yeni yüzey için crates.io'dan (yayımlanmış en son
> sürüm) veya depodan kurun.

## Java

Maven (`pom.xml`):

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.7.0</version>
</dependency>
```

Ya da Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.7.0'
```

> Maven Central'da `io.github.qorechain:qorechain-sdk:0.7.0` adıyla
> yayımlanmıştır.

## Sıradaki adım

Bağlanmak ve zincir üzerindeki durumu okumak için
[Hızlı Başlangıç](/sdk/quickstart) sayfasına geçin.
