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
**publicate** în registrele lor, cu paritate completă cu lanțul nativ (mesaje tipizate,
interogări, ciclul de viață al tranzacțiilor, tranzacții PQC hibride și abonamente
WebSocket). Alege limbajul tău mai jos.

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

Publicat pe npm la `0.5.0`.

### Adaptor SVM

`@qorechain/svm` este un adaptor subțire peste
[`@solana/web3.js`](https://solana.com/docs/clients/javascript), care este o
**dependență peer**:

```bash
npm i @qorechain/svm @solana/web3.js
```

Publicat pe npm la `0.5.0`.

### Kit React

`@qorechain/react` este stratul React oficial peste `@qorechain/sdk` — un
provider, hook-uri și componentele `ConnectButton` / `QuantumSafeBadge`.
`react` (>=18) este o dependență peer:

```bash
npm i @qorechain/react
```

Publicat pe npm la `0.5.0`. Vezi [ghidul kit-ului React](/sdk/guides/react).

## Python

```bash
pip install qorechain-sdk
```

Necesită Python 3.10+. Pachetul livrează indicii de tip și un marker `py.typed`.

> Distribuția se instalează ca `qorechain-sdk` (publicat pe PyPI la `0.5.0`)
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

Publicat ca modul Go autonom la `packages/go/v0.5.0`.

## Rust

```bash
cargo add qorechain-sdk
```

Sau în `Cargo.toml`:

```toml
[dependencies]
qorechain-sdk = "0.5"
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

Necesită Rust 1.74+. Clienții de citire sunt asincroni (Tokio).

> Publicat pe crates.io ca `qorechain-sdk` la `0.5.0`.

## Java

Maven (`pom.xml`):

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.5.0</version>
</dependency>
```

Sau Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.5.0'
```

> Publicat pe Maven Central ca `io.github.qorechain:qorechain-sdk:0.5.0`.

## Următorul pas

Continuă la [Quickstart](/sdk/quickstart) pentru a te conecta și a citi starea de pe lanț.
