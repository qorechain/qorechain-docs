---
slug: /sdk/install
title: Installazione
sidebar_label: Installazione
sidebar_position: 2
---

# Installazione

Installa l'SDK per il tuo linguaggio. Il core TypeScript (`@qorechain/sdk`), gli
adattatori EVM e SVM (`@qorechain/evm`, `@qorechain/svm`), il kit React
(`@qorechain/react`) e i client Python, Go, Rust e Java sono tutti
**pubblicati** sui rispettivi registry con piena parità con la catena nativa (messaggi tipizzati,
query, il ciclo di vita delle tx, transazioni PQC ibride e sottoscrizioni
WebSocket). Scegli il tuo linguaggio qui sotto.

## TypeScript

Il pacchetto core:

```bash
npm i @qorechain/sdk
```

Ha come target Node.js 20+ e include ESM, CommonJS e definizioni di tipo.

### Adattatore EVM

`@qorechain/evm` è un adattatore sottile e type-safe basato su [viem](https://viem.sh).
viem è una **peer dependency** — installalo insieme:

```bash
npm i @qorechain/evm viem
```

Pubblicato su npm alla versione `0.5.0`.

### Adattatore SVM

`@qorechain/svm` è un adattatore sottile basato su
[`@solana/web3.js`](https://solana.com/docs/clients/javascript), che è una
**peer dependency**:

```bash
npm i @qorechain/svm @solana/web3.js
```

Pubblicato su npm alla versione `0.5.0`.

### Kit React

`@qorechain/react` è il livello React ufficiale sopra `@qorechain/sdk` — un
provider, hook e i componenti `ConnectButton` / `QuantumSafeBadge`.
`react` (>=18) è una peer dependency:

```bash
npm i @qorechain/react
```

Pubblicato su npm alla versione `0.5.0`. Vedi la [guida al kit React](/sdk/guides/react).

## Python

```bash
pip install qorechain-sdk
```

Richiede Python 3.10+. Il pacchetto include type hint e un marcatore `py.typed`.

> La distribuzione si installa come `qorechain-sdk` (pubblicato su PyPI alla versione `0.5.0`)
> ma **si importa come `qorsdk`**:
>
> ```python
> import qorsdk
> ```

## Go

```bash
go get github.com/qorechain/qorechain-sdk/packages/go/...
```

Richiede Go 1.23+. Importa i sotto-pacchetti che ti servono, ad esempio:

```go
import (
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/client"
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/accounts"
)
```

Pubblicato come modulo Go autonomo a `packages/go/v0.5.0`.

## Rust

```bash
cargo add qorechain-sdk
```

Oppure in `Cargo.toml`:

```toml
[dependencies]
qorechain-sdk = "0.5"
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

Richiede Rust 1.74+. I client di lettura sono asincroni (Tokio).

> Pubblicato su crates.io come `qorechain-sdk` alla versione `0.5.0`.

## Java

Maven (`pom.xml`):

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.5.0</version>
</dependency>
```

Oppure Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.5.0'
```

> Pubblicato su Maven Central come `io.github.qorechain:qorechain-sdk:0.5.0`.

## Avanti

Continua con il [Quickstart](/sdk/quickstart) per connetterti e leggere lo stato on-chain.
