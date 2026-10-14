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
sottoscrizioni WebSocket). La linea di release corrente è la **0.8**: TypeScript, Python, Rust e
Java sono alla **0.8.3**, e il modulo Go è alla **v0.8.4**. Scegli il tuo linguaggio
qui sotto.

## Note di aggiornamento {#upgrade}

:::danger Usa l'SDK 0.8.1 o successivo sulle reti live
Entrambe le reti pubbliche verificano la forma **sign-bytes ibrida v2** (con tag di dominio e
vincolata al chain id) e rifiutano la vecchia forma con il codice `pqc` 21. Ogni release dell'SDK
precedente alla **0.8.0** firma la vecchia forma, e la **0.8.0** cerca il passaggio
sotto uno solo dei due nomi di aggiornamento usati dalle reti (la mainnet lo ha registrato come
`v3.2.0`, la testnet come `v3.1.98` e poi `v3.2.0`), quindi firma la forma sbagliata
su mainnet. Usa la **0.8.1 o successiva** in ogni linguaggio; serve la **0.8.2 o successiva**
per aprire una [finestra di autorizzazione EVM](/sdk/guides/evm#evm-window). I builder
ibridi accettano un'opzione `signBytesVersion` (`"auto"` | `"v1"` | `"v2"`); `"auto"`
interroga la rete e quindi richiede l'endpoint REST (`rest`) su
`qorechain-vladi` / `qorechain-diana`: solleva un errore invece di tirare a indovinare. Vedi
[Quale forma di sign-bytes?](/sdk/concepts/accounts-pqc#sign-bytes-versions).
:::

:::caution Correzioni precedenti
L'SDK **0.6.1** ha corretto un bug critico per il consenso: l'estensione del
tx-body `/qorechain.pqc.v1.PQCHybridSignature` veniva serializzata in JSON
dentro `Any.value` e **rifiutata dalla catena a CheckTx**. Le transazioni ibride (PQC +
classica) costruite con SDK ≤ 0.6.0 vengono rifiutate on-chain. La **0.8.0**
ha rimosso gli helper di account con firma da wallet (vedi
[Account e firma PQC](/sdk/concepts/accounts-pqc#phantom)).
:::

## TypeScript

Il pacchetto core:

```bash
npm i @qorechain/sdk
```

Ha come target Node.js 20+ e include ESM, CommonJS e definizioni di tipo. Gli
esempi di transazioni ibride in questa documentazione importano anche `StargateClient` da
`@cosmjs/stargate` (`npm i @cosmjs/stargate`).

### Adattatore EVM

`@qorechain/evm` è un adattatore sottile e type-safe sopra [viem](https://viem.sh).
viem è una **peer dependency** — installalo insieme:

```bash
npm i @qorechain/evm viem
```

Pubblicato su npm alla `0.8.0`.

### Adattatore SVM

`@qorechain/svm` è un adattatore sottile sopra
[`@solana/web3.js`](https://solana.com/docs/clients/javascript), che è una
**peer dependency**:

```bash
npm i @qorechain/svm @solana/web3.js
```

Pubblicato su npm alla `0.8.0`.

### Kit React

`@qorechain/react` è il livello React ufficiale sopra `@qorechain/sdk` — un
provider, hook e i componenti `ConnectButton` / `QuantumSafeBadge`.
`react` (>=18) è una peer dependency:

```bash
npm i @qorechain/react
```

Pubblicato su npm alla `0.8.3`. Vedi la [guida al kit React](/sdk/guides/react).

### Scaffolder

`create-qorechain-dapp` (npm, `0.8.0`) genera una dApp pronta all'uso:

```bash
npm create qorechain-dapp@latest my-dapp
```

I file `package.json` generati fissano `@qorechain/sdk` / `@qorechain/evm` a
`^0.3.0`, che npm risolve in una release 0.3 che non può firmare per le reti
live. Dopo la generazione, esegui `npm i @qorechain/sdk@latest` (e
`npm i @qorechain/evm@latest` per il template EVM). Vedi il
[riferimento della CLI](/sdk/reference/cli).

## Python

```bash
pip install qorechain-sdk
```

Richiede Python 3.10+. Il pacchetto include type hint e un marcatore `py.typed`.

> La distribuzione si installa come `qorechain-sdk` (pubblicato su PyPI alla `0.8.3`)
> ma **si importa come `qorsdk`**:
>
> ```python
> import qorsdk
> ```

## Go

```bash
go get github.com/qorechain/qorechain-sdk/packages/go/...
```

Richiede Go 1.23+. Importa i sotto-pacchetti che ti servono, per esempio:

```go
import (
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/client"
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/accounts"
)
```

Pubblicato come modulo Go autonomo (taggato `packages/go/v0.8.4`).

## Rust

```bash
cargo add qorechain-sdk
```

Oppure, per seguire la head del repository:

```toml
[dependencies]
qorechain-sdk = { git = "https://github.com/qorechain/qorechain-sdk" }
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

Richiede Rust 1.74+. I client di lettura sono asincroni (Tokio). Il crate si importa come
`qorechain` (`use qorechain;`).

> Pubblicato su crates.io come `qorechain-sdk` (0.8.3); `cargo add qorechain-sdk`
> installa l'ultima release.

## Java

Maven (`pom.xml`):

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.8.3</version>
</dependency>
```

Oppure Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.8.3'
```

> Pubblicato su Maven Central come `io.github.qorechain:qorechain-sdk:0.8.3`. Central
> non ha alcuna build 0.8.0 o 0.8.1, quindi sulle reti live usa la 0.8.2 o successiva.

## Pacchetti correlati {#related-packages}

| Pacchetto | Scopo | Versione |
| --- | --- | --- |
| `@qorechain/wallet-adapter` | Helper lato wallet: generazione del wallet (`generateQoreWallet`), firma ibrida `eth_secp256k1` (`signHybridEth`, `QoreChainSigner`), registrazione della rete in MetaMask (`addQoreEvmToWallet`), builder di messaggi per authenticator e finestre EVM. Peer dependency: `@cosmjs/proto-signing` e `@cosmjs/stargate` `^0.32` | 0.3.0 |
| `@qorechain/chain-bridge` | Worker lato server per i backend: deriva la chiave PQC, firma in modo ibrido e trasmette (`sendTokens`, `registerPqc` e altro). Passa `cosmosRest` | 0.2.2 |
| `@qorechain/pqc` | Primitive ML-DSA / ML-KEM / SHAKE-256 solo conformi agli standard e `hybridSignBytes` (vedi [Firma post-quantistica](/developer-guide/post-quantum-signing)) | 0.2.1 |
| `@qorechain/handles` | Risoluzione verificata degli `@handle` con pinning al primo utilizzo (`HandleClient`) | 0.1.0 |
| `@qorechain/rdk` | Client del Rollup Development Kit (vedi [Rollup](/rollups/why)). La release npm (0.4.4) firma le transazioni solo in modo classico, cosa che le reti rifiutano, quindi può leggere ma non inviare; la firma ibrida è nella 0.5.0, attualmente solo su PyPI e nel modulo Go | 0.4.4 (npm) |

## Avanti

Continua con il [Quickstart](/sdk/quickstart) per connetterti e leggere lo stato on-chain.
