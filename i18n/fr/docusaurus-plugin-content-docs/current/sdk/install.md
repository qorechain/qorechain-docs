---
slug: /sdk/install
title: Installation
sidebar_label: Installation
sidebar_position: 2
---

# Installation

Installez le SDK pour votre langage. Le cœur TypeScript (`@qorechain/sdk`), les
adaptateurs EVM et SVM (`@qorechain/evm`, `@qorechain/svm`), le kit React
(`@qorechain/react`), ainsi que les clients Python, Go, Rust et Java sont tous
**publiés** dans leurs registres avec une parité complète avec la chaîne native (messages typés,
requêtes, le cycle de vie des transactions, les transactions hybrides PQC, et les abonnements
WebSocket). Choisissez votre langage ci-dessous.

## TypeScript

Le paquet principal :

```bash
npm i @qorechain/sdk
```

Il cible Node.js 20+ et fournit ESM, CommonJS et les définitions de types.

### Adaptateur EVM

`@qorechain/evm` est un adaptateur fin et fortement typé au-dessus de [viem](https://viem.sh).
viem est une **dépendance pair** — installez-le en parallèle :

```bash
npm i @qorechain/evm viem
```

Publié sur npm en `0.5.0`.

### Adaptateur SVM

`@qorechain/svm` est un adaptateur fin au-dessus de
[`@solana/web3.js`](https://solana.com/docs/clients/javascript), qui est une
**dépendance pair** :

```bash
npm i @qorechain/svm @solana/web3.js
```

Publié sur npm en `0.5.0`.

### Kit React

`@qorechain/react` est la couche React officielle au-dessus de `@qorechain/sdk` — un
provider, des hooks, et les composants `ConnectButton` / `QuantumSafeBadge`.
`react` (>=18) est une dépendance pair :

```bash
npm i @qorechain/react
```

Publié sur npm en `0.5.0`. Voir le [guide du kit React](/sdk/guides/react).

## Python

```bash
pip install qorechain-sdk
```

Nécessite Python 3.10+. Le paquet fournit des indications de types et un marqueur `py.typed`.

> La distribution s'installe sous le nom `qorechain-sdk` (publiée sur PyPI en `0.5.0`)
> mais **s'importe sous le nom `qorsdk`** :
>
> ```python
> import qorsdk
> ```

## Go

```bash
go get github.com/qorechain/qorechain-sdk/packages/go/...
```

Nécessite Go 1.23+. Importez les sous-paquets dont vous avez besoin, par exemple :

```go
import (
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/client"
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/accounts"
)
```

Publié comme un module Go autonome en `packages/go/v0.5.0`.

## Rust

```bash
cargo add qorechain-sdk
```

Ou dans `Cargo.toml` :

```toml
[dependencies]
qorechain-sdk = "0.5"
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

Nécessite Rust 1.74+. Les clients de lecture sont asynchrones (Tokio).

> Publié sur crates.io sous le nom `qorechain-sdk` en `0.5.0`.

## Java

Maven (`pom.xml`) :

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.5.0</version>
</dependency>
```

Ou Gradle :

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.5.0'
```

> Publié sur Maven Central sous le nom `io.github.qorechain:qorechain-sdk:0.5.0`.

## Suite

Continuez vers le [Démarrage rapide](/sdk/quickstart) pour vous connecter et lire l'état on-chain.
