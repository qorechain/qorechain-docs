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
**publiés** sur leurs registres avec une parité native complète avec la chaîne
(messages typés, requêtes, cycle de vie des transactions, transactions PQC
hybrides et abonnements WebSocket). La version actuelle est **0.7.0**, qui
ajoute les comptes unifiés eth-native, le correctif d'encodage de l'extension
hybride critique pour le consensus, et les voies d'authenticators (voir le
[guide Authenticators](/sdk/guides/authenticators)).
Choisissez votre langage ci-dessous.

:::caution Mise à niveau depuis 0.6.0 ou antérieur
Le SDK **0.6.1** a corrigé un bug critique pour le consensus : l'extension de
corps de transaction `/qorechain.pqc.v1.PQCHybridSignature` était sérialisée en
JSON dans `Any.value` et **rejetée par la chaîne au CheckTx**. Les transactions
hybrides (PQC + classique) construites avec un SDK ≤ 0.6.0 sont rejetées
on-chain — passez à la version 0.6.1 ou ultérieure dans chaque langage que vous
utilisez.
:::

## TypeScript

Le paquet cœur :

```bash
npm i @qorechain/sdk
```

Il cible Node.js 20+ et fournit ESM, CommonJS et les définitions de types.

### Adaptateur EVM

`@qorechain/evm` est un adaptateur léger et typé au-dessus de
[viem](https://viem.sh). viem est une **peer dependency** — installez-le en
parallèle :

```bash
npm i @qorechain/evm viem
```

Publié sur npm en `0.7.0`.

### Adaptateur SVM

`@qorechain/svm` est un adaptateur léger au-dessus de
[`@solana/web3.js`](https://solana.com/docs/clients/javascript), qui est une
**peer dependency** :

```bash
npm i @qorechain/svm @solana/web3.js
```

Publié sur npm en `0.7.0`.

### Kit React

`@qorechain/react` est la couche React officielle au-dessus de
`@qorechain/sdk` — un provider, des hooks et les composants `ConnectButton` /
`QuantumSafeBadge`. `react` (>=18) est une peer dependency :

```bash
npm i @qorechain/react
```

Publié sur npm en `0.7.0`. Voir le [guide du kit React](/sdk/guides/react).

### Générateur de projet

`create-qorechain-dapp` (npm, `0.7.0`) génère une dApp prête à l'emploi :

```bash
npm create qorechain-dapp@latest my-dapp
```

## Python

```bash
pip install qorechain-sdk
```

Nécessite Python 3.10+. Le paquet fournit des annotations de types et un
marqueur `py.typed`.

> La distribution s'installe sous le nom `qorechain-sdk` (publiée sur PyPI en
> `0.7.0`) mais **s'importe sous le nom `qorsdk`** :
>
> ```python
> import qorsdk
> ```

## Go

```bash
go get github.com/qorechain/qorechain-sdk/packages/go/...
```

Nécessite Go 1.23+. Importez les sous-paquets dont vous avez besoin, par
exemple :

```go
import (
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/client"
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/accounts"
)
```

Publié en tant que module Go autonome (taggé `packages/go/v0.7.0`).

## Rust

```bash
cargo add qorechain-sdk
```

Ou, pour suivre directement les sources `0.7.0` depuis le dépôt :

```toml
[dependencies]
qorechain-sdk = { git = "https://github.com/qorechain/qorechain-sdk" }
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

Nécessite Rust 1.74+. Les clients de lecture sont asynchrones (Tokio). La
crate s'importe sous le nom `qorechain` (`use qorechain;`).

> Publié sur crates.io sous le nom `qorechain-sdk`. `cargo add qorechain-sdk`
> installe la **dernière crate publiée**, qui est actuellement en retard sur la
> version `0.7.0` — installez depuis crates.io (dernière version publiée) ou
> depuis le dépôt pour la surface la plus récente.

## Java

Maven (`pom.xml`) :

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.7.0</version>
</dependency>
```

Ou Gradle :

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.7.0'
```

> Publié sur Maven Central sous `io.github.qorechain:qorechain-sdk:0.7.0`.

## Étape suivante

Poursuivez avec le [Démarrage rapide](/sdk/quickstart) pour vous connecter et
lire l'état on-chain.
