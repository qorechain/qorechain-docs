---
slug: /sdk/install
title: Instalare
sidebar_label: Instalare
sidebar_position: 2
---

# Instalare

Instalează SDK-ul pentru limbajul tău. Nucleul TypeScript (`@qorechain/sdk`),
adaptoarele EVM și SVM (`@qorechain/evm`, `@qorechain/svm`), kit-ul React
(`@qorechain/react`) și clienții Python, Go, Rust și Java sunt toate
**publicate** în registrele lor, cu paritate completă cu lanțul nativ (mesaje
tipizate, interogări, ciclul de viață al tranzacțiilor, tranzacții PQC hibride
și abonamente WebSocket). Linia curentă de versiuni este **0.8**: TypeScript,
Python, Rust și Java sunt la **0.8.3**, iar modulul Go este la **v0.8.4**.
Alege limbajul tău mai jos.

## Note de actualizare {#upgrade}

:::danger Folosește SDK 0.8.1 sau mai nou pe rețelele live
Ambele rețele publice verifică forma **v2 a sign-bytes hibride** (etichetată cu
domeniu și legată de chain id) și o resping pe cea veche cu codul `pqc` 21. Fiecare
versiune a SDK-ului dinaintea **0.8.0** semnează forma veche, iar **0.8.0** caută
comutarea sub doar unul dintre cele două nume de upgrade folosite de rețele
(mainnet a înregistrat-o ca `v3.2.0`, testnet ca `v3.1.98` și ulterior `v3.2.0`),
deci semnează forma greșită pe mainnet. Folosește **0.8.1 sau mai nou** în fiecare
limbaj; este nevoie de **0.8.2 sau mai nou** pentru a deschide o
[fereastră de autorizare EVM](/sdk/guides/evm#evm-window). Constructorii hibrizi
primesc o opțiune `signBytesVersion` (`"auto"` | `"v1"` | `"v2"`); `"auto"`
interoghează rețeaua și are deci nevoie de endpoint-ul REST (`rest`) pe
`qorechain-vladi` / `qorechain-diana`: aruncă o eroare în loc să ghicească. Vezi
[Ce formă de sign-bytes?](/sdk/concepts/accounts-pqc#sign-bytes-versions).
:::

:::caution Remedieri mai vechi
SDK **0.6.1** a remediat un bug critic pentru consens: extensia de corp de
tranzacție `/qorechain.pqc.v1.PQCHybridSignature` era serializată ca JSON în
`Any.value` și **respinsă de lanț la CheckTx**. Tranzacțiile hibride (PQC +
clasic) construite cu SDK ≤ 0.6.0 sunt respinse on-chain. **0.8.0** a eliminat
utilitarele de cont bazate pe semnătura portofelului (vezi
[Conturi și semnare PQC](/sdk/concepts/accounts-pqc#phantom)).
:::

## TypeScript

Pachetul de bază:

```bash
npm i @qorechain/sdk
```

Vizează Node.js 20+ și livrează ESM, CommonJS și definiții de tip. Exemplele de
tranzacții hibride din această documentație importă și `StargateClient` din
`@cosmjs/stargate` (`npm i @cosmjs/stargate`).

### Adaptor EVM

`@qorechain/evm` este un adaptor subțire, type-safe peste [viem](https://viem.sh).
viem este o **dependență peer** — instaleaz-o alături:

```bash
npm i @qorechain/evm viem
```

Publicat pe npm la `0.8.0`.

### Adaptor SVM

`@qorechain/svm` este un adaptor subțire peste
[`@solana/web3.js`](https://solana.com/docs/clients/javascript), care este o
**dependență peer**:

```bash
npm i @qorechain/svm @solana/web3.js
```

Publicat pe npm la `0.8.0`.

### Kit React

`@qorechain/react` este stratul React oficial peste `@qorechain/sdk` — un
provider, hook-uri și componentele `ConnectButton` / `QuantumSafeBadge`.
`react` (>=18) este o dependență peer:

```bash
npm i @qorechain/react
```

Publicat pe npm la `0.8.3`. Vezi [ghidul kit-ului React](/sdk/guides/react).

### Generatorul de proiecte

`create-qorechain-dapp` (npm, `0.8.0`) generează un dApp gata de rulat:

```bash
npm create qorechain-dapp@latest my-dapp
```

Fișierele `package.json` generate fixează `@qorechain/sdk` / `@qorechain/evm` la
`^0.3.0`, pe care npm îl rezolvă la o versiune 0.3 ce nu poate semna pentru
rețelele live. După generare, rulează `npm i @qorechain/sdk@latest` (și
`npm i @qorechain/evm@latest` pentru șablonul EVM). Vezi
[referința CLI](/sdk/reference/cli).

## Python

```bash
pip install qorechain-sdk
```

Necesită Python 3.10+. Pachetul livrează indicii de tip și un marker `py.typed`.

> Distribuția se instalează ca `qorechain-sdk` (publicat pe PyPI la `0.8.3`)
> dar **se importă ca `qorsdk`**:
>
> ```python
> import qorsdk
> ```

## Go

```bash
go get github.com/qorechain/qorechain-sdk/packages/go/...
```

Necesită Go 1.23+. Importă sub-pachetele de care ai nevoie, de exemplu:

```go
import (
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/client"
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/accounts"
)
```

Publicat ca modul Go autonom (etichetat `packages/go/v0.8.4`).

## Rust

```bash
cargo add qorechain-sdk
```

Sau, pentru a urmări ultima versiune din repository:

```toml
[dependencies]
qorechain-sdk = { git = "https://github.com/qorechain/qorechain-sdk" }
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

Necesită Rust 1.74+. Clienții de citire sunt asincroni (Tokio). Crate-ul se
importă ca `qorechain` (`use qorechain;`).

> Publicat pe crates.io ca `qorechain-sdk` (0.8.3); `cargo add qorechain-sdk`
> instalează cea mai recentă versiune.

## Java

Maven (`pom.xml`):

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.8.3</version>
</dependency>
```

Sau Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.8.3'
```

> Publicat pe Maven Central ca `io.github.qorechain:qorechain-sdk:0.8.3`. Central
> nu are o versiune 0.8.0 sau 0.8.1, așa că pe rețelele live folosește 0.8.2 sau mai
> nou.

## Pachete conexe {#related-packages}

| Pachet | Scop | Versiune |
| --- | --- | --- |
| `@qorechain/wallet-adapter` | Utilitare pentru partea de portofel: generarea portofelului (`generateQoreWallet`), semnare hibridă `eth_secp256k1` (`signHybridEth`, `QoreChainSigner`), înregistrarea rețelei în MetaMask (`addQoreEvmToWallet`), constructori de mesaje pentru authenticator și fereastra EVM. Dependențe peer: `@cosmjs/proto-signing` și `@cosmjs/stargate` `^0.32` | 0.3.0 |
| `@qorechain/chain-bridge` | Worker pe partea de server pentru backend-uri: derivă cheia PQC, semnează hibrid și difuzează (`sendTokens`, `registerPqc` și altele). Transmite `cosmosRest` | 0.2.2 |
| `@qorechain/pqc` | Primitive ML-DSA / ML-KEM / SHAKE-256 strict conforme standardelor și `hybridSignBytes` (vezi [Semnare post-cuantică](/developer-guide/post-quantum-signing)) | 0.2.1 |
| `@qorechain/handles` | Rezolvare verificată de `@handle` cu fixare trust-on-first-use (`HandleClient`) | 0.1.0 |
| `@qorechain/rdk` | Client Rollup Development Kit (vezi [Rollup-uri](/rollups/why)). Versiunea npm (0.4.4) semnează tranzacțiile doar clasic, ceea ce rețelele refuză, deci poate citi, dar nu poate trimite; semnarea hibridă este în 0.5.0, disponibilă momentan doar pe PyPI și în modulul Go | 0.4.4 (npm) |

## Următorul pas

Continuă la [Quickstart](/sdk/quickstart) pentru a te conecta și a citi starea de pe lanț.
