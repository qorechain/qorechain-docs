---
slug: /sdk/install
title: Kurulum
sidebar_label: Kurulum
sidebar_position: 2
---

# Kurulum

SDK'yi dilinize göre kurun. TypeScript çekirdeği (`@qorechain/sdk`),
EVM ve SVM adaptörleri (`@qorechain/evm`, `@qorechain/svm`), React kiti
(`@qorechain/react`) ve Python, Go, Rust ve Java istemcilerinin tümü,
tam yerel-zincir eşitliğiyle (tipli mesajlar,
sorgular, tx yaşam döngüsü, hibrit PQC işlemleri ve WebSocket
abonelikleri) ilgili kayıt defterlerine **yayımlanmıştır**. Aşağıdan dilinizi seçin.

## TypeScript

Çekirdek paket:

```bash
npm i @qorechain/sdk
```

Node.js 20+ hedefler ve ESM, CommonJS ve tip tanımlarıyla gelir.

### EVM adaptörü

`@qorechain/evm`, [viem](https://viem.sh) üzerine ince, tip güvenli bir adaptördür.
viem bir **eş bağımlılıktır** — onu yanında kurun:

```bash
npm i @qorechain/evm viem
```

npm'e `0.5.0` sürümünde yayımlanmıştır.

### SVM adaptörü

`@qorechain/svm`, bir **eş bağımlılık** olan
[`@solana/web3.js`](https://solana.com/docs/clients/javascript) üzerine ince bir adaptördür:

```bash
npm i @qorechain/svm @solana/web3.js
```

npm'e `0.5.0` sürümünde yayımlanmıştır.

### React kiti

`@qorechain/react`, `@qorechain/sdk` üzerine kurulu resmi React katmanıdır — bir
sağlayıcı, kancalar ve `ConnectButton` / `QuantumSafeBadge` bileşenleri.
`react` (>=18) bir eş bağımlılıktır:

```bash
npm i @qorechain/react
```

npm'e `0.5.0` sürümünde yayımlanmıştır. [React kiti kılavuzuna](/sdk/guides/react) bakın.

## Python

```bash
pip install qorechain-sdk
```

Python 3.10+ gerektirir. Paket, tip ipuçları ve bir `py.typed` işaretçisiyle gelir.

> Dağıtım `qorechain-sdk` olarak kurulur (PyPI'ye `0.5.0` sürümünde yayımlanmıştır)
> ancak **`qorsdk` olarak içe aktarılır**:
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

`packages/go/v0.5.0` adresinde kendi kendine yeten bir Go modülü olarak yayımlanmıştır.

## Rust

```bash
cargo add qorechain-sdk
```

Veya `Cargo.toml` içinde:

```toml
[dependencies]
qorechain-sdk = "0.5"
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

Rust 1.74+ gerektirir. Okuma istemcileri eşzamansızdır (Tokio).

> crates.io'ya `qorechain-sdk` olarak `0.5.0` sürümünde yayımlanmıştır.

## Java

Maven (`pom.xml`):

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.5.0</version>
</dependency>
```

Veya Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.5.0'
```

> Maven Central'a `io.github.qorechain:qorechain-sdk:0.5.0` olarak yayımlanmıştır.

## Sonraki

Bağlanmak ve zincir üzerindeki durumu okumak için [Hızlı Başlangıç'a](/sdk/quickstart) devam edin.
