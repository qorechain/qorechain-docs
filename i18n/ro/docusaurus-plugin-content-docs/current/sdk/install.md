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
și abonamente WebSocket). Versiunea curentă este **0.7.0**, care adaugă
conturile unificate eth-native, remedierea critică pentru consens a codificării
extensiei hibride și canalele de autentificatori (vezi
[ghidul Authenticators](/sdk/guides/authenticators)).
Alege limbajul tău mai jos.

:::caution Actualizare de la 0.6.0 sau mai vechi
SDK **0.6.1** a remediat un bug critic pentru consens: extensia de corp de
tranzacție `/qorechain.pqc.v1.PQCHybridSignature` era serializată ca JSON în
`Any.value` și **respinsă de lanț la CheckTx**. Tranzacțiile hibride (PQC +
clasic) construite cu SDK ≤ 0.6.0 sunt respinse on-chain — actualizează la
0.6.1 sau mai nou în fiecare limbaj pe care îl folosești.
:::

## TypeScript

Pachetul de bază:

```bash
npm i @qorechain/sdk
```

Vizează Node.js 20+ și livrează ESM, CommonJS și definiții de tip.

### Adaptor EVM

`@qorechain/evm` este un adaptor subțire, type-safe peste [viem](https://viem.sh).
viem este o **dependență peer** — instaleaz-o alături:

```bash
npm i @qorechain/evm viem
```

Publicat pe npm la `0.7.0`.

### Adaptor SVM

`@qorechain/svm` este un adaptor subțire peste
[`@solana/web3.js`](https://solana.com/docs/clients/javascript), care este o
**dependență peer**:

```bash
npm i @qorechain/svm @solana/web3.js
```

Publicat pe npm la `0.7.0`.

### Kit React

`@qorechain/react` este stratul React oficial peste `@qorechain/sdk` — un
provider, hook-uri și componentele `ConnectButton` / `QuantumSafeBadge`.
`react` (>=18) este o dependență peer:

```bash
npm i @qorechain/react
```

Publicat pe npm la `0.7.0`. Vezi [ghidul kit-ului React](/sdk/guides/react).

### Generatorul de proiecte

`create-qorechain-dapp` (npm, `0.7.0`) generează un dApp gata de rulat:

```bash
npm create qorechain-dapp@latest my-dapp
```

## Python

```bash
pip install qorechain-sdk
```

Necesită Python 3.10+. Pachetul livrează indicii de tip și un marker `py.typed`.

> Distribuția se instalează ca `qorechain-sdk` (publicat pe PyPI la `0.7.0`)
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

Publicat ca modul Go autonom (etichetat `packages/go/v0.7.0`).

## Rust

```bash
cargo add qorechain-sdk
```

Sau, pentru a urmări sursele `0.7.0` direct din repository:

```toml
[dependencies]
qorechain-sdk = { git = "https://github.com/qorechain/qorechain-sdk" }
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

Necesită Rust 1.74+. Clienții de citire sunt asincroni (Tokio). Crate-ul se
importă ca `qorechain` (`use qorechain;`).

> Publicat pe crates.io ca `qorechain-sdk`. `cargo add qorechain-sdk` instalează
> **cel mai recent crate publicat**, care în prezent este în urma versiunii
> `0.7.0` — instalează de pe crates.io (ultima versiune publicată) sau din repo
> pentru cea mai nouă suprafață de API.

## Java

Maven (`pom.xml`):

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.7.0</version>
</dependency>
```

Sau Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.7.0'
```

> Publicat pe Maven Central ca `io.github.qorechain:qorechain-sdk:0.7.0`.

## Următorul pas

Continuă la [Quickstart](/sdk/quickstart) pentru a te conecta și a citi starea de pe lanț.
