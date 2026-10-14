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
sowie WebSocket-Abonnements). Die aktuelle Release-Linie ist **0.8**: TypeScript, Python, Rust und
Java stehen bei **0.8.3**, das Go-Modul bei **v0.8.4**. Wählen Sie unten Ihre Sprache.

## Upgrade-Hinweise {#upgrade}

:::danger Verwenden Sie auf den Live-Netzwerken SDK 0.8.1 oder neuer
Beide öffentlichen Netzwerke verifizieren die Form der **hybriden v2-Sign-Bytes**
(domänengetaggt und an die Chain-ID gebunden) und lehnen die alte Form mit `pqc`-Code 21 ab.
Jedes SDK-Release vor **0.8.0** signiert die alte Form, und **0.8.0** sucht die Umstellung
nur unter einem der beiden Upgrade-Namen, die die Netzwerke verwendet haben (das Mainnet
hat sie als `v3.2.0` verzeichnet, das Testnet als `v3.1.98` und später `v3.2.0`), und signiert
daher auf dem Mainnet die falsche Form. Verwenden Sie in jeder Sprache **0.8.1 oder neuer**;
**0.8.2 oder neuer** wird benötigt, um ein
[EVM-Autorisierungsfenster](/sdk/guides/evm#evm-window) zu öffnen. Hybride Builder
akzeptieren die Option `signBytesVersion` (`"auto"` | `"v1"` | `"v2"`); `"auto"` fragt das
Netzwerk ab und benötigt daher den REST-Endpunkt (`rest`) auf
`qorechain-vladi` / `qorechain-diana`: Es wirft einen Fehler, statt zu raten. Siehe
[Welche Sign-Bytes-Form?](/sdk/concepts/accounts-pqc#sign-bytes-versions).
:::

:::caution Ältere Fixes
SDK **0.6.1** behob einen konsenskritischen Bug: Die Tx-Body-Extension
`/qorechain.pqc.v1.PQCHybridSignature` wurde JSON-serialisiert in
`Any.value` geschrieben und **von der Chain bei CheckTx abgelehnt**. Hybride
(PQC + klassische) Transaktionen, die mit SDK ≤ 0.6.0 erstellt wurden, werden
on-chain abgelehnt. **0.8.0** hat die Konto-Helfer für Wallet-Signaturen entfernt (siehe
[Konten & PQC-Signierung](/sdk/concepts/accounts-pqc#phantom)).
:::

## TypeScript

Das Kern-Paket:

```bash
npm i @qorechain/sdk
```

Es zielt auf Node.js 20+ und liefert ESM, CommonJS sowie Typdefinitionen. Die
Beispiele für hybride Transaktionen in dieser Dokumentation importieren außerdem `StargateClient` aus
`@cosmjs/stargate` (`npm i @cosmjs/stargate`).

### EVM-Adapter

`@qorechain/evm` ist ein schlanker, typsicherer Adapter über [viem](https://viem.sh).
viem ist eine **Peer-Abhängigkeit** — installieren Sie es zusätzlich:

```bash
npm i @qorechain/evm viem
```

Veröffentlicht auf npm unter `0.8.0`.

### SVM-Adapter

`@qorechain/svm` ist ein schlanker Adapter über
[`@solana/web3.js`](https://solana.com/docs/clients/javascript), das eine
**Peer-Abhängigkeit** ist:

```bash
npm i @qorechain/svm @solana/web3.js
```

Veröffentlicht auf npm unter `0.8.0`.

### React-Kit

`@qorechain/react` ist die offizielle React-Schicht über `@qorechain/sdk` — ein
Provider, Hooks sowie die Komponenten `ConnectButton` / `QuantumSafeBadge`.
`react` (>=18) ist eine Peer-Abhängigkeit:

```bash
npm i @qorechain/react
```

Veröffentlicht auf npm unter `0.8.3`. Siehe den [React-Kit-Leitfaden](/sdk/guides/react).

### Scaffolder

`create-qorechain-dapp` (npm, `0.8.0`) erzeugt eine sofort lauffähige dApp:

```bash
npm create qorechain-dapp@latest my-dapp
```

Die generierten `package.json`-Dateien pinnen `@qorechain/sdk` / `@qorechain/evm` auf
`^0.3.0`, was npm zu einem 0.3-Release auflöst, das für die Live-Netzwerke nicht
signieren kann. Führen Sie nach dem Scaffolding `npm i @qorechain/sdk@latest` aus (und
`npm i @qorechain/evm@latest` für die EVM-Vorlage). Siehe die
[CLI-Referenz](/sdk/reference/cli).

## Python

```bash
pip install qorechain-sdk
```

Erfordert Python 3.10+. Das Paket liefert Type Hints und einen `py.typed`-Marker.

> Die Distribution wird als `qorechain-sdk` installiert (veröffentlicht auf PyPI unter `0.8.3`),
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

Veröffentlicht als eigenständiges Go-Modul (getaggt als `packages/go/v0.8.4`).

## Rust

```bash
cargo add qorechain-sdk
```

Oder, um den Repository-Stand (Head) zu verfolgen:

```toml
[dependencies]
qorechain-sdk = { git = "https://github.com/qorechain/qorechain-sdk" }
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

Erfordert Rust 1.74+. Die Lese-Clients sind asynchron (Tokio). Die Crate wird als
`qorechain` importiert (`use qorechain;`).

> Veröffentlicht auf crates.io als `qorechain-sdk` (0.8.3); `cargo add qorechain-sdk`
> installiert das neueste Release.

## Java

Maven (`pom.xml`):

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.8.3</version>
</dependency>
```

Oder Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.8.3'
```

> Veröffentlicht auf Maven Central als `io.github.qorechain:qorechain-sdk:0.8.3`. Central
> hat keinen Build 0.8.0 oder 0.8.1, verwenden Sie daher auf den Live-Netzwerken 0.8.2 oder neuer.

## Verwandte Pakete {#related-packages}

| Paket | Zweck | Version |
| --- | --- | --- |
| `@qorechain/wallet-adapter` | Wallet-seitige Helfer: Wallet-Erzeugung (`generateQoreWallet`), hybrides Signieren mit `eth_secp256k1` (`signHybridEth`, `QoreChainSigner`), MetaMask-Netzwerkregistrierung (`addQoreEvmToWallet`), Message-Builder für Authenticators und EVM-Fenster. Peer-Abhängigkeiten: `@cosmjs/proto-signing` und `@cosmjs/stargate` `^0.32` | 0.3.0 |
| `@qorechain/chain-bridge` | Serverseitiger Worker für Backends: leitet den PQC-Schlüssel ab, signiert hybrid und sendet (`sendTokens`, `registerPqc` und mehr). Übergeben Sie `cosmosRest` | 0.2.2 |
| `@qorechain/pqc` | Rein standardbasierte Primitive für ML-DSA / ML-KEM / SHAKE-256 sowie `hybridSignBytes` (siehe [Post-Quanten-Signierung](/developer-guide/post-quantum-signing)) | 0.2.1 |
| `@qorechain/handles` | Verifizierte `@handle`-Auflösung mit Trust-on-first-use-Pinning (`HandleClient`) | 0.1.0 |
| `@qorechain/rdk` | Client des Rollup Development Kit (siehe [Rollups](/rollups/why)). Das npm-Release (0.4.4) signiert Transaktionen nur klassisch, was die Netzwerke ablehnen, sodass es lesen, aber nicht senden kann; das hybride Signieren steckt in 0.5.0, derzeit nur auf PyPI und im Go-Modul | 0.4.4 (npm) |

## Weiter

Fahren Sie mit dem [Schnellstart](/sdk/quickstart) fort, um sich zu verbinden und den On-Chain-Zustand zu lesen.
