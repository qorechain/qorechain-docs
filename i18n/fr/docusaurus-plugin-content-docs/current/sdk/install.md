---
slug: /sdk/install
title: Installation
sidebar_label: Installation
sidebar_position: 2
---

# Installation

Installez le SDK pour votre langage. Le cœur TypeScript (`@qorechain/sdk`), les
adaptateurs EVM et SVM (`@qorechain/evm`, `@qorechain/svm`), le kit React
(`@qorechain/react`) et les clients Python, Go, Rust et Java sont tous
**publiés** sur leurs registres avec une parité complète avec la chaîne native (messages
typés, requêtes, cycle de vie des tx, transactions PQC hybrides et
abonnements WebSocket). La ligne de versions actuelle est la **0.8** : TypeScript, Python, Rust et
Java sont en **0.8.3**, et le module Go est en **v0.8.4**. Choisissez votre langage
ci-dessous.

## Notes de mise à niveau {#upgrade}

:::danger Utilisez le SDK 0.8.1 ou une version ultérieure sur les réseaux en production
Les deux réseaux publics vérifient la forme **sign-bytes hybride v2** (balisée par domaine et
liée au chain id) et refusent l'ancienne forme avec le code `pqc` 21. Toutes les versions du SDK
antérieures à la **0.8.0** signent l'ancienne forme, et la **0.8.0** cherche le basculement
sous un seul des deux noms de mise à niveau utilisés par les réseaux (le mainnet l'a enregistré sous
`v3.2.0`, le testnet sous `v3.1.98` puis `v3.2.0`), de sorte qu'elle signe la mauvaise forme
sur le mainnet. Utilisez la **0.8.1 ou une version ultérieure** dans tous les langages ; la **0.8.2 ou une version ultérieure** est nécessaire
pour ouvrir une [fenêtre d'autorisation EVM](/sdk/guides/evm#evm-window). Les constructeurs
hybrides acceptent une option `signBytesVersion` (`"auto"` | `"v1"` | `"v2"`) ; `"auto"`
interroge le réseau et nécessite donc le point d'accès REST (`rest`) sur
`qorechain-vladi` / `qorechain-diana` : il lève une erreur au lieu de deviner. Voir
[Quelle forme de sign-bytes ?](/sdk/concepts/accounts-pqc#sign-bytes-versions).
:::

:::caution Anciens correctifs
Le SDK **0.6.1** a corrigé un bogue critique pour le consensus : l'extension de corps de tx
`/qorechain.pqc.v1.PQCHybridSignature` était sérialisée en JSON
dans `Any.value` et **rejetée par la chaîne au CheckTx**. Les transactions hybrides (PQC +
classique) construites avec le SDK ≤ 0.6.0 sont rejetées sur la chaîne. La **0.8.0**
a supprimé les assistants de compte à signature de portefeuille (voir
[Comptes et signature PQC](/sdk/concepts/accounts-pqc#phantom)).
:::

## TypeScript

Le paquet principal :

```bash
npm i @qorechain/sdk
```

Il cible Node.js 20+ et fournit ESM, CommonJS et des définitions de types. Les
exemples de transactions hybrides de cette documentation importent aussi `StargateClient` depuis
`@cosmjs/stargate` (`npm i @cosmjs/stargate`).

### Adaptateur EVM

`@qorechain/evm` est un adaptateur fin et typé au-dessus de [viem](https://viem.sh).
viem est une **dépendance de type pair** — installez-la avec :

```bash
npm i @qorechain/evm viem
```

Publié sur npm en `0.8.0`.

### Adaptateur SVM

`@qorechain/svm` est un adaptateur fin au-dessus de
[`@solana/web3.js`](https://solana.com/docs/clients/javascript), qui est une
**dépendance de type pair** :

```bash
npm i @qorechain/svm @solana/web3.js
```

Publié sur npm en `0.8.0`.

### Kit React

`@qorechain/react` est la couche React officielle au-dessus de `@qorechain/sdk` — un
fournisseur, des hooks et les composants `ConnectButton` / `QuantumSafeBadge`.
`react` (>=18) est une dépendance de type pair :

```bash
npm i @qorechain/react
```

Publié sur npm en `0.8.3`. Voir le [guide du kit React](/sdk/guides/react).

### Générateur de projet

`create-qorechain-dapp` (npm, `0.8.0`) génère une dApp prête à l'emploi :

```bash
npm create qorechain-dapp@latest my-dapp
```

Les fichiers `package.json` générés épinglent `@qorechain/sdk` / `@qorechain/evm` sur
`^0.3.0`, ce que npm résout vers une version 0.3 qui ne peut pas signer pour les réseaux
en production. Après la génération, exécutez `npm i @qorechain/sdk@latest` (et
`npm i @qorechain/evm@latest` pour le modèle EVM). Voir la
[référence de la CLI](/sdk/reference/cli).

## Python

```bash
pip install qorechain-sdk
```

Nécessite Python 3.10+. Le paquet fournit des annotations de types et un marqueur `py.typed`.

> La distribution s'installe sous le nom `qorechain-sdk` (publiée sur PyPI en `0.8.3`)
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

Publié comme module Go autonome (étiqueté `packages/go/v0.8.4`).

## Rust

```bash
cargo add qorechain-sdk
```

Ou, pour suivre la tête du dépôt :

```toml
[dependencies]
qorechain-sdk = { git = "https://github.com/qorechain/qorechain-sdk" }
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

Nécessite Rust 1.74+. Les clients de lecture sont asynchrones (Tokio). La crate s'importe sous le nom
`qorechain` (`use qorechain;`).

> Publié sur crates.io sous le nom `qorechain-sdk` (0.8.3) ; `cargo add qorechain-sdk`
> installe la dernière version publiée.

## Java

Maven (`pom.xml`) :

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.8.3</version>
</dependency>
```

Ou Gradle :

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.8.3'
```

> Publié sur Maven Central sous `io.github.qorechain:qorechain-sdk:0.8.3`. Central
> n'a aucune version 0.8.0 ni 0.8.1, donc sur les réseaux en production utilisez la 0.8.2 ou une version ultérieure.

## Paquets associés {#related-packages}

| Paquet | Rôle | Version |
| --- | --- | --- |
| `@qorechain/wallet-adapter` | Assistants côté portefeuille : génération de portefeuille (`generateQoreWallet`), signature hybride `eth_secp256k1` (`signHybridEth`, `QoreChainSigner`), enregistrement du réseau MetaMask (`addQoreEvmToWallet`), constructeurs de messages d'authenticator et de fenêtre EVM. Dépendances de type pair : `@cosmjs/proto-signing` et `@cosmjs/stargate` `^0.32` | 0.3.0 |
| `@qorechain/chain-bridge` | Worker côté serveur pour les backends : dérive la clé PQC, signe en hybride et diffuse (`sendTokens`, `registerPqc`, et plus). Passez `cosmosRest` | 0.2.2 |
| `@qorechain/pqc` | Primitives ML-DSA / ML-KEM / SHAKE-256 conformes aux standards uniquement et `hybridSignBytes` (voir [Signature post-quantique](/developer-guide/post-quantum-signing)) | 0.2.1 |
| `@qorechain/handles` | Résolution vérifiée des `@handle` avec épinglage à la première utilisation (`HandleClient`) | 0.1.0 |
| `@qorechain/rdk` | Client du Rollup Development Kit (voir [Rollups](/rollups/why)). La version npm (0.4.4) signe les transactions en classique uniquement, ce que les réseaux refusent ; elle peut donc lire mais pas envoyer ; la signature hybride est dans la 0.5.0, actuellement sur PyPI et le module Go uniquement | 0.4.4 (npm) |

## Étape suivante

Poursuivez avec le [Démarrage rapide](/sdk/quickstart) pour vous connecter et lire l'état de la chaîne.
