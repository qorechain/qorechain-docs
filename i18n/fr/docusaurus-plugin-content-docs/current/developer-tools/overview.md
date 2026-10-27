---
slug: /developer-tools/overview
title: Packages développeur
sidebar_label: Présentation
sidebar_position: 1
---

# Packages développeur

QoreChain publie ses outils pour développeurs sous forme de petits packages sur les registres publics (npm, PyPI, crates.io, le proxy de modules Go, Maven Central et Swift Package Manager). Cette page en est l'index : à quoi sert chaque package, son nom exact dans le registre, son langage, sa version actuelle, sa commande d'installation et son statut, ainsi que l'endroit où lire comment l'utiliser. Elle s'adresse aux développeurs qui créent des dApps, des portefeuilles, des backends et des rollups sur QoreChain et veulent choisir le bon package avant de lire un guide.

Les versions des tableaux ont été lues sur les registres le 27 octobre 2026. Le mainnet `qorechain-vladi` exécute la v3.2.4 et le testnet `qorechain-diana` exécute la v3.2.6. Chaque package indiqué comme publié est sous licence Apache-2.0.

## Innovations {#innovations}

- **Un seul format de signature hybride dans tous les langages.** La chaîne exige une signature secp256k1 plus une signature ML-DSA-87 (FIPS 204) sur les transactions de la voie native. QoreSign reproduit ses vecteurs de test publiés octet pour octet en TypeScript, Rust, Go, Swift et Kotlin, et `qorechain-pqc` exécute un même jeu de vecteurs dans ses six bindings, de sorte qu'une clé ou une signature produite dans un langage se vérifie dans les autres.
- **Forme des sign-bytes choisie d'après l'état de la chaîne, sans deviner.** Le SDK, l'adaptateur de portefeuille, `chain-bridge` et les assistants réseau de QoreSign demandent au nœud `GET /cosmos/upgrade/v1beta1/applied_plan/{name}` pour les deux noms de mise à niveau (`v3.2.0` et `v3.1.98`) et signent la forme v2 lorsque l'une des deux hauteurs est supérieure à zéro. Sans point de terminaison REST sur ces deux chaînes, ils lèvent une erreur au lieu de deviner. Les deux réseaux vérifient la v2 aujourd'hui (vérifié le 27 octobre 2026 : `v3.2.0` appliquée sur le mainnet à la hauteur 2,981,742 et `v3.1.98` sur le testnet à la hauteur 5,746,000).
- **Des quickstarts exécutés, pas seulement écrits.** Pour les packages qui en ont un, l'exemple a été exécuté le 27 octobre 2026 après installation depuis le registre public. 31 des 34 entrées de quickstart se sont exécutées avec succès ; le manifeste indique lesquelles trois ne l'ont pas été (voir [Limites](#limits)).
- **Un seul manifeste derrière les tableaux.** Les noms de packages, les versions et les commandes d'installation de cette page proviennent d'un unique manifeste lisible par machine, avec un point de terminaison de version en direct par package, les mêmes données que celles à partir desquelles le hub SDK de la [page Développeurs du dashboard](/dashboard/developers#sdks) est construit.

## Comment l'utiliser {#how-to-use}

Choisissez selon ce que vous construisez.

| Vous voulez | Utilisez | Lire |
|---|---|---|
| Lire l'état de la chaîne, dériver des comptes, envoyer des transactions signées en hybride depuis un script ou une dApp | SDK QoreChain | [Présentation du SDK](/sdk/overview), [Installation](/sdk/install), [Quickstart](/sdk/quickstart) |
| Signer dans votre propre portefeuille ou backend, vérifier des signatures, Sign In With QoreChain | QoreSign | [Présentation de QoreSign](/qoresign/overview), [Quickstart](/qoresign/quickstart) |
| Ajouter QoreChain à Keplr, Leap ou Cosmostation, générer des portefeuilles unifiés, construire des messages de fenêtre EVM et de clés liées | Adaptateur de portefeuille | [Adaptateur de portefeuille](/developer-tools/wallet-adapter) |
| Exécuter une tâche serveur qui envoie des QOR, enregistre des clés ou déploie des contrats | Chain bridge (ou le SDK) | [Chain bridge et handles](/developer-tools/chain-bridge) |
| Résoudre un `@handle` en adresse vérifiée | Handles | [Chain bridge et handles](/developer-tools/chain-bridge#handles) |
| Permettre à votre dApp d'utiliser le portefeuille QoreX | Intégrations QoreX | [QoreX, pour les développeurs](/qorex/overview#developers) |
| Créer et exploiter un rollup applicatif | RDK | [Présentation des rollups](/rollups/overview), [Déployer un rollup](/rollups/deploying-a-rollup) |
| Utiliser seules les primitives post-quantiques (ML-DSA, ML-KEM, SHAKE-256) | `qorechain-pqc` | [Signature post-quantique](/developer-guide/post-quantum-signing) |

Installez un package et exécutez d'abord son quickstart sur le testnet public. Les lectures ne nécessitent ni compte, ni clé, ni frais.

## Comment y accéder {#how-to-access}

| | Testnet | Mainnet |
|---|---|---|
| ID de chaîne | `qorechain-diana` | `qorechain-vladi` |
| ID de chaîne EVM | 9800 | 9801 |
| REST | `https://api-testnet.qore.host` | `https://api.qore.host` |
| RPC de consensus | `https://rpc-testnet.qore.host` | `https://rpc.qore.host` |
| JSON-RPC EVM | `https://evm-testnet.qore.host` | `https://evm.qore.host` |
| JSON-RPC SVM | `https://svm-testnet.qore.host` | `https://svm.qore.host` |

- **Compte et clés :** aucun pour les lectures. Pour envoyer, il vous faut un compte avec des QOR (les QOR testnet proviennent du [Faucet](/dashboard/faucet)) et, sur la voie native, une clé ML-DSA-87 enregistrée pour ce compte.
- **Coût :** les packages sont gratuits. Les transactions paient les frais réseau ; le plancher des frais est de 0.1 uqor par gas.
- **Règles de signature :** une transaction de la voie native doit porter une signature hybride (secp256k1 plus ML-DSA-87). Une transaction EVM n'est acceptée que depuis un compte disposant d'une clé ML-DSA-87 enregistrée et d'une fenêtre d'autorisation EVM ouverte. Les lectures SVM fonctionnent et les transactions SVM ne sont pas encore ouvertes. Voir [Comptes et signature PQC](/sdk/concepts/accounts-pqc).
- **Conventions des quickstarts :** les exemples lisent le compte du faucet du testnet public et signent avec la phrase de test publique (`abandon` onze fois, puis `about`). N'alimentez jamais un compte dérivé de cette phrase. Aucun quickstart n'envoie de transaction.

### La page développeur du dashboard {#dashboard-developers}

Le dashboard dispose d'une page publique à l'adresse [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers). Vérifiée le 27 octobre 2026, elle comporte six onglets (parcours complet : [Développeurs](/dashboard/developers)) :

- **SDKs :** le hub SDK. Chaque package du manifeste, regroupé par produit, avec un sélecteur de langage, la dernière version lue en direct sur chaque registre, des lignes d'installation et d'import avec boutons de copie, le quickstart avec la sortie observée par l'équipe SDK, les problèmes connus, ainsi que les ID de chaîne et les points de terminaison publics. Les packages qui ne sont pas publiés n'affichent aucune commande d'installation.
- **PQ key status :** lit la clé ML-DSA-87 qu'une adresse a enregistrée on-chain et sa fenêtre d'autorisation EVM, sur le testnet ou le mainnet.
- **Simulator :** simule à blanc une transaction signée (`TxRaw` en base64 ou hex) et affiche la consommation de gas et les variations de solde. Rien n'est diffusé.
- **Signing playground :** testnet uniquement. Génère dans le navigateur une clé hybride jetable, conservée en mémoire, pour signer et vérifier des messages et des requêtes Sign In With QoreChain.
- **QoreX test wallet :** testnet uniquement. Injecte dans l'onglet un portefeuille de test (`window.qorex`, annoncé via EIP-6963 sous le nom « QoreX (mock) ») pour que vous puissiez essayer des flux de dApp.
- **AI agents (MCP) :** une page pour le serveur MCP, qui n'est pas encore publié (voir [Prévu](#planned)).

L'**inspecteur de transactions** (collez un hash, voyez chaque message, le signataire, les frais et si la signature post-quantique est vérifiée) n'est **pas encore en ligne**. Les tableaux ci-dessous et le hub SDK affichent les mêmes données ; les tableaux ont été vérifiés auprès des registres le 27 octobre 2026.

## Où c'est publié {#where-published}

Chaque nom est le nom exact dans le registre. Le lien du package ouvre sa page de registre. « Published » signifie que la version indiquée est installable aujourd'hui.

### SDK QoreChain {#group-sdk}

Guides : [Présentation du SDK](/sdk/overview), [Installation](/sdk/install), [Guide React](/sdk/guides/react), [Référence CLI](/sdk/reference/cli). Source : [qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk).

| Package | Langage | Version | Installation | Statut |
|---|---|---|---|---|
| [`@qorechain/sdk`](https://www.npmjs.com/package/@qorechain/sdk) | TypeScript | 0.10.0 | `npm install @qorechain/sdk` | Publié |
| [`@qorechain/react`](https://www.npmjs.com/package/@qorechain/react) | TypeScript (React) | 0.10.0 | `npm install @qorechain/react @qorechain/sdk react react-dom` | Publié. Provider, hooks, `ConnectButton` et le badge d'état PQC (exporté sous le nom `QuantumSafeBadge` dans la 0.10.0) |
| [`@qorechain/evm`](https://www.npmjs.com/package/@qorechain/evm) | TypeScript | 0.8.0 | `npm install @qorechain/evm viem` | Publié |
| [`@qorechain/svm`](https://www.npmjs.com/package/@qorechain/svm) | TypeScript | 0.8.0 | `npm install @qorechain/svm @solana/web3.js` | Publié. Lectures uniquement sur les réseaux en ligne |
| [`create-qorechain-dapp`](https://www.npmjs.com/package/create-qorechain-dapp) | TypeScript (CLI) | 0.10.0 | `npx create-qorechain-dapp my-dapp` | Publié |
| [`qorechain-sdk`](https://pypi.org/project/qorechain-sdk/) | Python | 0.10.0 | `pip install qorechain-sdk` | Publié |
| [`qorechain-sdk`](https://crates.io/crates/qorechain-sdk) | Rust | 0.10.0 | `cargo add qorechain-sdk tokio --features tokio/macros,tokio/rt-multi-thread` | Publié |
| [`github.com/qorechain/qorechain-sdk/packages/go`](https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go) | Go | v0.10.0 | `go get github.com/qorechain/qorechain-sdk/packages/go@latest` | Publié |
| [`io.github.qorechain:qorechain-sdk`](https://central.sonatype.com/artifact/io.github.qorechain/qorechain-sdk) | Java | 0.10.0 | `implementation("io.github.qorechain:qorechain-sdk:0.10.0")` | Publié |

### QoreSign {#group-qoresign}

Guides : [Présentation de QoreSign](/qoresign/overview), [Quickstart](/qoresign/quickstart), [Vecteurs de test](/qoresign/vectors). Source : [qorechain/qoresign](https://github.com/qorechain/qoresign). QoreSign signe en local ; il ne détient aucune clé pour vous et ne fait ni signature à seuil, ni MPC, ni signature par portefeuille matériel.

| Package | Langage | Version | Installation | Statut |
|---|---|---|---|---|
| [`@qorechain/qoresign`](https://www.npmjs.com/package/@qorechain/qoresign) | TypeScript | 0.1.0 | `npm install @qorechain/qoresign` | Publié |
| [`qorechain-qoresign`](https://crates.io/crates/qorechain-qoresign) | Rust (s'importe sous le nom `qoresign`) | 0.1.0 | `cargo add qorechain-qoresign` | Publié |
| [`github.com/qorechain/qoresign/go`](https://pkg.go.dev/github.com/qorechain/qoresign/go) | Go | v0.1.0 | `go get github.com/qorechain/qoresign/go` | Publié |
| `QoreSign` (package Swift) | Swift (iOS 16+, macOS 13+) | 0.1.0 | `.package(url: "https://github.com/qorechain/qoresign", from: "0.1.0")`, product `QoreSign` | Publié comme release GitHub ; le framework binaire se télécharge depuis celle-ci |
| [`io.github.qorechain:qoresign`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) | Kotlin / JVM (JVM 17+) | 0.1.0 | `implementation("io.github.qorechain:qoresign:0.1.0")` | Publié |
| [`io.github.qorechain:qoresign-android`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign-android) | Kotlin (Android API 24+) | 0.1.0 | `implementation("io.github.qorechain:qoresign-android:0.1.0")` | Publié. Même API que l'artefact JVM ; son exemple n'a été exécuté que sur l'artefact JVM, pas sur un appareil Android |
| `qorechain-qoresign` (PyPI) | Python | aucune pour l'instant | aucune | **Non publié.** Le projet PyPI a renvoyé 404 le 27 octobre 2026. Prévu pour la 0.1.1 |

Le package TypeScript dispose d'un sous-chemin `@qorechain/qoresign/network`, et le module Go offre les mêmes assistants : `fetchPqKeyStatus`, `resolveSignBytesVersion`, `simulateTx` (avec les variations de solde), `suggestGasLimit`, `broadcastTx`, `submitWithSignBytesFallback` (un seul repli, puis il s'arrête), `verifySiwqWithChain` et `verifyMessageWithChain`. La crate Rust n'a pas de code réseau.

### Rollup Development Kit (RDK) {#group-rdk}

Guides : [Présentation des rollups](/rollups/overview), [Déployer un rollup](/rollups/deploying-a-rollup), [Architecture du Rollup Development Kit](/architecture/rollup-development-kit). Source : [qorechain/qorechain-rdk](https://github.com/qorechain/qorechain-rdk).

| Package | Langage | Version | Installation | Statut |
|---|---|---|---|---|
| [`@qorechain/rdk`](https://www.npmjs.com/package/@qorechain/rdk) | TypeScript | 0.7.0 | `npm install @qorechain/rdk` | Publié. Le seul client RDK qui signe en hybride, et seulement lorsque vous passez un `pqcKeypair` |
| [`@qorechain/rdk-cli`](https://www.npmjs.com/package/@qorechain/rdk-cli) | TypeScript (CLI `qorollup`) | 0.7.0 | `npm install -g @qorechain/rdk-cli` | Publié. Depuis la 0.6.2, il se lance via le lien bin de npm (la 0.6.1 et les versions antérieures n'affichaient rien). Ses commandes de transaction signent en classique uniquement, ce que les réseaux refusent |
| [`create-qorechain-rollup`](https://www.npmjs.com/package/create-qorechain-rollup) | TypeScript (CLI) | 0.7.0 | `npx create-qorechain-rollup my-rollup` | Publié |
| [`qorechain-rdk`](https://pypi.org/project/qorechain-rdk/) | Python (3.10+, importe `qorrdk`) | 0.7.0 | `pip install qorechain-rdk` | Publié. Les lectures fonctionnent ; les transactions signent en classique uniquement |
| [`qorechain-rdk`](https://crates.io/crates/qorechain-rdk) | Rust | 0.7.0 | `cargo add qorechain-rdk` | Publié. Les lectures fonctionnent ; les transactions signent en classique uniquement |
| [`github.com/qorechain/qorechain-rdk/packages/go`](https://pkg.go.dev/github.com/qorechain/qorechain-rdk/packages/go) | Go | v0.7.0 | `go get github.com/qorechain/qorechain-rdk/packages/go@v0.7.0` | Publié. Les lectures fonctionnent ; les transactions signent en classique uniquement |
| [`io.github.qorechain:qorechain-rdk`](https://central.sonatype.com/artifact/io.github.qorechain/qorechain-rdk) | Java (JDK 17+) | 0.7.0 | `implementation("io.github.qorechain:qorechain-rdk:0.7.0")` | Publié. Les lectures fonctionnent ; les transactions signent en classique uniquement |

### Primitives post-quantiques (`qorechain-pqc`) {#group-pqc}

Guide : [Signature post-quantique](/developer-guide/post-quantum-signing). Source : [qorechain/qorechain-pqc](https://github.com/qorechain/qorechain-pqc). La signature ML-DSA est déterministe par défaut dans tous les bindings ; la signature « hedged » est un choix explicite.

| Package | Langage | Version | Installation | Statut |
|---|---|---|---|---|
| [`@qorechain/pqc`](https://www.npmjs.com/package/@qorechain/pqc) | TypeScript | 0.2.3 | `npm install @qorechain/pqc` | Publié |
| [`qorechain-pqc`](https://pypi.org/project/qorechain-pqc/) | Python (3.9+) | 0.2.3 | `pip install qorechain-pqc` | Publié. Nécessite liboqs ; le premier import la compile si elle est absente (git, CMake et un compilateur C) |
| [`qorechain-pqc`](https://crates.io/crates/qorechain-pqc) | Rust | 0.2.3 | `cargo add qorechain-pqc` | Publié |
| [`github.com/qorechain/qorechain-pqc/go`](https://pkg.go.dev/github.com/qorechain/qorechain-pqc/go) | Go | v0.2.3 | `go get github.com/qorechain/qorechain-pqc/go` | Publié |
| [`io.github.qorechain:qorechain-pqc`](https://central.sonatype.com/artifact/io.github.qorechain/qorechain-pqc) | Java | 0.2.3 | `implementation("io.github.qorechain:qorechain-pqc:0.2.3")` | Publié |
| Bibliothèque C | C | 0.2.3 | compilez `c/` depuis le dépôt (nécessite liboqs et OpenSSL) | Source uniquement, sans registre de packages |

### Adaptateur de portefeuille {#group-wallet-adapter}

Page : [Adaptateur de portefeuille](/developer-tools/wallet-adapter). Source : [qorechain/qorechain-wallet-adapter](https://github.com/qorechain/qorechain-wallet-adapter).

| Package | Langage | Version | Installation | Statut |
|---|---|---|---|---|
| [`@qorechain/wallet-adapter`](https://www.npmjs.com/package/@qorechain/wallet-adapter) | TypeScript (module ES, JavaScript pur avec typages) | 0.4.0 | `npm install @qorechain/wallet-adapter @cosmjs/stargate @cosmjs/proto-signing` | Publié. Pas de quickstart testé |

### Chain bridge {#group-chain-bridge}

Page : [Chain bridge et handles](/developer-tools/chain-bridge).

| Package | Langage | Version | Installation | Statut |
|---|---|---|---|---|
| [`@qorechain/chain-bridge`](https://www.npmjs.com/package/@qorechain/chain-bridge) | TypeScript (serveur Node.js) | 0.2.3 | `npm install @qorechain/chain-bridge` | Publié. Pas de quickstart testé. Le registre n'indique aucun dépôt source |

### Handles {#group-handles}

Page : [Chain bridge et handles](/developer-tools/chain-bridge#handles).

| Package | Langage | Version | Installation | Statut |
|---|---|---|---|---|
| [`@qorechain/handles`](https://www.npmjs.com/package/@qorechain/handles) | TypeScript | 0.1.0 | `npm install @qorechain/handles` | Publié. Vérifie la résolution d'un handle par rapport à une clé de registre épinglée. Il n'épingle pas lui-même les adresses : l'appelant fournit le magasin d'épinglage et décide quand épingler. Pas de quickstart testé. Le registre n'indique aucun dépôt source |

### Intégrations QoreX {#group-qorex}

Guide : [QoreX, pour les développeurs](/qorex/overview#developers). Source : [qorechain/qorex-integrations](https://github.com/qorechain/qorex-integrations). Les six ont été publiés le 27 octobre 2026.

| Package | Langage | Version | Installation | Statut |
|---|---|---|---|---|
| [`@qorechain/qorex-types`](https://www.npmjs.com/package/@qorechain/qorex-types) | TypeScript | 0.1.0 | `npm install @qorechain/qorex-types` | Publié. Détecte QoreX (EIP-6963 et le fournisseur natif) |
| [`@qorechain/qorex-rainbowkit`](https://www.npmjs.com/package/@qorechain/qorex-rainbowkit) | TypeScript | 0.1.0 | `npm install @qorechain/qorex-rainbowkit @rainbow-me/rainbowkit wagmi viem @tanstack/react-query` | Publié |
| [`@qorechain/qorex-interchain-kit`](https://www.npmjs.com/package/@qorechain/qorex-interchain-kit) | TypeScript (React) | 0.1.0 | `npm install @qorechain/qorex-interchain-kit @interchain-kit/core @interchain-kit/react` | Publié |
| [`@qorechain/qorex-cosmos-kit`](https://www.npmjs.com/package/@qorechain/qorex-cosmos-kit) | TypeScript (React) | 0.1.0 | `npm install @qorechain/qorex-cosmos-kit @cosmos-kit/core @cosmos-kit/react` | Publié. Avec `@cosmos-kit/react` 2.24, passez `throwErrors={false}` ; l'extrait du README l'omet |
| [`@qorechain/qorex-wallet-mock`](https://www.npmjs.com/package/@qorechain/qorex-wallet-mock) | TypeScript | 0.1.0 | `npm install -D @qorechain/qorex-wallet-mock` | Publié. Un portefeuille de test qui signe réellement sur le testnet |
| [`@qorechain/qorex-synpress`](https://www.npmjs.com/package/@qorechain/qorex-synpress) | TypeScript | 0.1.0 | `npm install -D @qorechain/qorex-synpress @playwright/test` | Publié. Fixtures Playwright ; le mode extension lève une erreur aujourd'hui |

### Connect (déprécié) {#group-connect}

| Package | Langage | Version | Installation | Statut |
|---|---|---|---|---|
| [`@qorechain/connect`](https://www.npmjs.com/package/@qorechain/connect) | TypeScript | 0.2.1 | aucune | **Déprécié et plus maintenu.** Ne l'utilisez pas pour du nouveau travail. Remplacez-le comme dans le tableau ci-dessous |

:::caution @qorechain/connect est déprécié
`@qorechain/connect` est marqué comme déprécié sur npm. Sa plage de peer est `@qorechain/wallet-adapter` `^0.2.1`, qui n'inclut pas la 0.4.0, et il n'ouvre pas de [fenêtre d'autorisation EVM](/sdk/guides/evm#evm-window) ; un envoi EVM par son intermédiaire est donc refusé tant que le compte n'a pas de clé enregistrée et de fenêtre ouverte. Le dépôt indiqué dans ses métadonnées de registre n'est pas accessible publiquement.
:::

| Besoin | Utiliser à la place |
|---|---|
| Détecter QoreX (EVM, native, Solana) | `@qorechain/qorex-types` |
| dApps EVM avec RainbowKit et wagmi | `@qorechain/qorex-rainbowkit` |
| dApps Cosmos | `@qorechain/qorex-interchain-kit` (ou `@qorechain/qorex-cosmos-kit`) |
| Signature hybride dans votre propre portefeuille ou backend | `@qorechain/qoresign` |

### Prévu (non publié) {#planned}

Ces noms sont réservés à des outils qui ne sont pas encore sur un registre. Chacun a renvoyé 404 sur son registre le 27 octobre 2026 ; il n'y a donc rien à installer et le comportement indiqué ne peut pas encore être utilisé.

| Package | Usage prévu | Statut |
|---|---|---|
| `@qorechain/mcp` | Un serveur Model Context Protocol avec accès en lecture à QoreChain (blocs, transactions, comptes, validateurs, paliers de staking, état des signatures hybrides, simulation, transferts non signés). Il ne signerait ni ne diffuserait jamais. Un point de terminaison hébergé est également prévu | Non publié. Le dépôt source n'est pas public. Le point de terminaison hébergé n'est pas en ligne |
| `@qorechain/qore-cli` (commande `qore`) | Lectures en ligne de commande avec une sortie JSON stable sur les mêmes données | Non publié |
| `qorechain-qoresign` sur PyPI | QoreSign pour Python | Non publié (0.1.1 prévue) |

## Comment obtenir les versions en direct {#live-versions}

Les tableaux sont un instantané. Pour lire vous-même la version actuelle d'un package :

| Registre | Requête | Champ |
|---|---|---|
| npm | `https://registry.npmjs.org/<name>/latest` | `version` |
| PyPI | `https://pypi.org/pypi/<name>/json` | `info.version` |
| crates.io | `https://crates.io/api/v1/crates/<name>` (envoyez un en-tête `User-Agent`, sinon la requête est refusée) | `crate.max_stable_version` |
| Go | `https://proxy.golang.org/<module>/@latest` | `Version` (retirez le `v` initial) |
| Maven Central | `https://repo1.maven.org/maven2/<group path>/<artifact>/maven-metadata.xml` | `<release>` |
| Swift | `https://api.github.com/repos/qorechain/qoresign/releases/latest` | `tag_name` (retirez le `v` initial) ; les appels GitHub non authentifiés sont limités à 60 par heure et par adresse |

Pour un nom npm avec scope, conservez le `@`, par exemple `https://registry.npmjs.org/@qorechain/sdk/latest`. Un 404 signifie que le package n'est pas publié. Le proxy Go peut répondre à `@latest` depuis un cache pendant un court moment après une release ; épinglez donc la version dans la commande lorsque vous en voulez une précise (l'installation Go du RDK ci-dessus le fait). La page de chaque package sur son registre affiche aussi la version et l'historique des releases.

## Limites et problèmes connus {#limits}

- **Deux réseaux en ligne, des versions différentes.** Le mainnet exécute la v3.2.4 et le testnet exécute la v3.2.6. Une fonctionnalité qui n'existe que sur le testnet est signalée sur sa propre page. Ne supposez pas le comportement de la v3.2.5 sur le mainnet.
- **Pas encore en ligne :** l'inspecteur de transactions de la page développeur du dashboard, le serveur MCP et la CLI `qore`, QoreSign pour Python, les transactions SVM, et les précompilés EVM sur le mainnet (voir la [Présentation du SDK](/sdk/overview) pour la liste voie par voie).
- **Exemples non exécutés :** sur les 34 entrées de quickstart, 31 se sont exécutées avec succès le 27 octobre 2026. L'exemple Python de QoreSign n'a pas été exécuté (le package n'est pas publié) et l'exemple Android de QoreSign n'a pas été exécuté sur un appareil. L'adaptateur de portefeuille, chain bridge et handles n'ont pas de quickstart ; leurs exemples dans ce manuel proviennent donc des typages et du source des packages et n'ont pas été exécutés de bout en bout.
- **`@qorechain/rdk-cli` avant la 0.6.2** n'affichait rien lorsqu'il était lancé via le lien bin de npm, et son `--version` affichait 0.4.1. **`@qorechain/rdk` avant la 0.7.0** construisait des preuves de retrait qui ne se vérifiaient jamais on-chain. Utilisez la 0.7.0.
- **Conflit de version cosmjs.** `@qorechain/wallet-adapter` et `@qorechain/chain-bridge` utilisent cosmjs 0.32 ; le SDK utilise cosmjs 0.39. Installer l'adaptateur à côté du SDK dans un même projet fait signaler `ERESOLVE` par npm. Gardez-les dans des projets séparés ou passez `--legacy-peer-deps`.
- **Copie imbriquée du SDK dans les anciennes versions du RDK.** `@qorechain/rdk` 0.6.2 et les versions antérieures dépendent de `@qorechain/sdk` `^0.9.0` ; une application sur le SDK 0.10.0 obtenait donc une seconde copie imbriquée du SDK 0.9.x. À partir de la 0.7.0, le kit dépend de `@qorechain/sdk` `^0.10.0` et partage une seule copie.
- **Clients RDK en classique uniquement.** Les clients RDK Python, Rust, Go et Java signent en classique uniquement, ce que la voie native refuse sur les deux réseaux ; utilisez-les pour les lectures, ou utilisez le client TypeScript avec un `pqcKeypair` pour les transactions.
- **Packages sans dépôt source public.** `@qorechain/chain-bridge` et `@qorechain/handles` n'indiquent aucun dépôt source dans leurs métadonnées de registre. Vous pouvez lire le contenu publié des packages sur npm.
- **Python `qorechain-pqc`** n'a pas de génération de clé à partir d'une graine en 0.2.3, et il nécessite liboqs.
