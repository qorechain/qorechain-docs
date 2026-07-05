---
slug: /sdk/install
title: Installation
sidebar_label: Installation
sidebar_position: 2
---

# Installation

Installieren Sie das SDK für Ihre Sprache. Der TypeScript-Kern (`@qorechain/sdk`), die
EVM- und SVM-Adapter (`@qorechain/evm`, `@qorechain/svm`), das React-Kit
(`@qorechain/react`) sowie die Clients für Python, Go, Rust und Java sind allesamt
in ihren jeweiligen Registries **veröffentlicht** und bieten vollständige Parität mit der
nativen Chain (typisierte Nachrichten, Abfragen, der Tx-Lebenszyklus, hybride PQC-Transaktionen
sowie WebSocket-Abonnements). Das aktuelle Release ist **0.7.0** und bringt
vereinheitlichte eth-native Accounts, den konsenskritischen Fix der
Hybrid-Extension-Kodierung sowie die Authenticator-Lanes (siehe den
[Authenticators-Leitfaden](/sdk/guides/authenticators)).
Wählen Sie unten Ihre Sprache.

:::caution Upgrade von 0.6.0 oder früher
SDK **0.6.1** behob einen konsenskritischen Bug: Die Tx-Body-Extension
`/qorechain.pqc.v1.PQCHybridSignature` wurde JSON-serialisiert in
`Any.value` geschrieben und **von der Chain bei CheckTx abgelehnt**. Hybride
(PQC + klassische) Transaktionen, die mit SDK ≤ 0.6.0 erstellt wurden, werden
on-chain abgelehnt — aktualisieren Sie in jeder von Ihnen verwendeten Sprache
auf 0.6.1 oder neuer.
:::

## TypeScript

Das Kern-Paket:

```bash
npm i @qorechain/sdk
```

Es zielt auf Node.js 20+ und liefert ESM, CommonJS sowie Typdefinitionen.

### EVM-Adapter

`@qorechain/evm` ist ein schlanker, typsicherer Adapter über [viem](https://viem.sh).
viem ist eine **Peer-Abhängigkeit** — installieren Sie es zusätzlich:

```bash
npm i @qorechain/evm viem
```

Veröffentlicht auf npm unter `0.7.0`.

### SVM-Adapter

`@qorechain/svm` ist ein schlanker Adapter über
[`@solana/web3.js`](https://solana.com/docs/clients/javascript), das eine
**Peer-Abhängigkeit** ist:

```bash
npm i @qorechain/svm @solana/web3.js
```

Veröffentlicht auf npm unter `0.7.0`.

### React-Kit

`@qorechain/react` ist die offizielle React-Schicht über `@qorechain/sdk` — ein
Provider, Hooks sowie die Komponenten `ConnectButton` / `QuantumSafeBadge`.
`react` (>=18) ist eine Peer-Abhängigkeit:

```bash
npm i @qorechain/react
```

Veröffentlicht auf npm unter `0.7.0`. Siehe den [React-Kit-Leitfaden](/sdk/guides/react).

### Scaffolder

`create-qorechain-dapp` (npm, `0.7.0`) erzeugt eine sofort lauffähige dApp:

```bash
npm create qorechain-dapp@latest my-dapp
```

## Python

```bash
pip install qorechain-sdk
```

Erfordert Python 3.10+. Das Paket liefert Type Hints und einen `py.typed`-Marker.

> Die Distribution wird als `qorechain-sdk` installiert (veröffentlicht auf PyPI unter `0.7.0`),
> wird aber **als `qorsdk` importiert**:
>
> ```python
> import qorsdk
> ```

## Go

```bash
go get github.com/qorechain/qorechain-sdk/packages/go/...
```

Erfordert Go 1.23+. Importieren Sie die benötigten Sub-Pakete, zum Beispiel:

```go
import (
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/client"
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/accounts"
)
```

Veröffentlicht als eigenständiges Go-Modul (getaggt als `packages/go/v0.7.0`).

## Rust

```bash
cargo add qorechain-sdk
```

Oder, um die `0.7.0`-Quellen direkt aus dem Repository zu verwenden:

```toml
[dependencies]
qorechain-sdk = { git = "https://github.com/qorechain/qorechain-sdk" }
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

Erfordert Rust 1.74+. Die Lese-Clients sind asynchron (Tokio). Die Crate wird als
`qorechain` importiert (`use qorechain;`).

> Veröffentlicht auf crates.io als `qorechain-sdk`. `cargo add qorechain-sdk`
> installiert die **zuletzt veröffentlichte Crate**, die derzeit hinter dem
> `0.7.0`-Release zurückliegt — installieren Sie von crates.io (zuletzt
> veröffentlicht) oder aus dem Repository, um die neueste API-Oberfläche zu erhalten.

## Java

Maven (`pom.xml`):

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.7.0</version>
</dependency>
```

Oder Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.7.0'
```

> Veröffentlicht auf Maven Central als `io.github.qorechain:qorechain-sdk:0.7.0`.

## Weiter

Fahren Sie mit dem [Schnellstart](/sdk/quickstart) fort, um sich zu verbinden und den On-Chain-Zustand zu lesen.
