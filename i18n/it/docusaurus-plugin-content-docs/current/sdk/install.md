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
**pubblicati** sui rispettivi registry con piena parità con la catena nativa
(messaggi tipizzati, query, il ciclo di vita delle tx, transazioni PQC ibride e
sottoscrizioni WebSocket). La release corrente è la **0.7.0**, che aggiunge gli
account unificati eth-native, la correzione — critica per il consenso — della
codifica dell'estensione ibrida e le corsie degli authenticator (vedi la
[guida agli Authenticators](/sdk/guides/authenticators)).
Scegli il tuo linguaggio qui sotto.

:::caution Aggiornamento dalla 0.6.0 o precedente
L'SDK **0.6.1** ha corretto un bug critico per il consenso: l'estensione del
tx-body `/qorechain.pqc.v1.PQCHybridSignature` veniva serializzata in JSON
dentro `Any.value` e **rifiutata dalla catena a CheckTx**. Le transazioni
ibride (PQC + classica) costruite con SDK ≤ 0.6.0 vengono rifiutate on-chain —
aggiorna alla 0.6.1 o successiva in ogni linguaggio che utilizzi.
:::

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

Pubblicato su npm alla versione `0.7.0`.

### Adattatore SVM

`@qorechain/svm` è un adattatore sottile basato su
[`@solana/web3.js`](https://solana.com/docs/clients/javascript), che è una
**peer dependency**:

```bash
npm i @qorechain/svm @solana/web3.js
```

Pubblicato su npm alla versione `0.7.0`.

### Kit React

`@qorechain/react` è il livello React ufficiale sopra `@qorechain/sdk` — un
provider, hook e i componenti `ConnectButton` / `QuantumSafeBadge`.
`react` (>=18) è una peer dependency:

```bash
npm i @qorechain/react
```

Pubblicato su npm alla versione `0.7.0`. Vedi la [guida al kit React](/sdk/guides/react).

### Scaffolder

`create-qorechain-dapp` (npm, `0.7.0`) genera lo scheletro di una dApp pronta
all'uso:

```bash
npm create qorechain-dapp@latest my-dapp
```

## Python

```bash
pip install qorechain-sdk
```

Richiede Python 3.10+. Il pacchetto include type hint e un marcatore `py.typed`.

> La distribuzione si installa come `qorechain-sdk` (pubblicato su PyPI alla
> versione `0.7.0`) ma **si importa come `qorsdk`**:
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

Pubblicato come modulo Go autonomo (tag `packages/go/v0.7.0`).

## Rust

```bash
cargo add qorechain-sdk
```

Oppure, per seguire i sorgenti della `0.7.0` direttamente dal repository:

```toml
[dependencies]
qorechain-sdk = { git = "https://github.com/qorechain/qorechain-sdk" }
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

Richiede Rust 1.74+. I client di lettura sono asincroni (Tokio). Il crate si
importa come `qorechain` (`use qorechain;`).

> Pubblicato su crates.io come `qorechain-sdk`. `cargo add qorechain-sdk`
> installa il **crate pubblicato più recente**, che al momento è indietro
> rispetto alla release `0.7.0` — installa da crates.io (ultima versione
> pubblicata) oppure dal repository per la superficie più aggiornata.

## Java

Maven (`pom.xml`):

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.7.0</version>
</dependency>
```

Oppure Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.7.0'
```

> Pubblicato su Maven Central come `io.github.qorechain:qorechain-sdk:0.7.0`.

## Avanti

Continua con il [Quickstart](/sdk/quickstart) per connetterti e leggere lo stato on-chain.
