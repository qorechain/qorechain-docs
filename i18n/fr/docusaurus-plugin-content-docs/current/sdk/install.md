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
abonnements WebSocket). La ligne de versions actuelle est la **0.10**, publiée les 25 et 26
octobre 2026 (vérifiée auprès de chaque registre le 27 octobre 2026) :

| Registre | Paquet | Version |
| --- | --- | --- |
| npm | `@qorechain/sdk`, `@qorechain/react`, `create-qorechain-dapp` | 0.10.0 |
| PyPI | `qorechain-sdk` (import `qorsdk`) | 0.10.0 |
| crates.io | `qorechain-sdk` (import `qorechain`) | 0.10.0 |
| Proxy de modules Go | `github.com/qorechain/qorechain-sdk/packages/go` | v0.10.0 |
| Maven Central | `io.github.qorechain:qorechain-sdk` | 0.10.0 (le client Java est de nouveau aligné sur les autres langages ; la 0.9.1 était une mise à jour Java uniquement) |

Choisissez votre langage ci-dessous.

## Notes de mise à niveau {#upgrade}

:::danger Utilisez le SDK 0.8.1 ou une version ultérieure sur les réseaux en production
Les deux réseaux publics vérifient la forme **sign-bytes hybride v2** (balisée par domaine et
liée au chain id) et refusent l'ancienne forme avec le code `pqc` 21. Toutes les versions du SDK
antérieures à la **0.8.0** signent l'ancienne forme, et la **0.8.0** cherche le basculement
sous un seul des deux noms de mise à niveau utilisés par les réseaux (le mainnet l'a enregistré sous
`v3.2.0`, le testnet sous `v3.1.98` puis `v3.2.0`), de sorte qu'elle signe la mauvaise forme
sur le mainnet. Utilisez la **0.10.0** (ou au minimum la **0.8.1**) dans tous les langages ; la **0.8.2 ou une version ultérieure** est nécessaire
pour ouvrir une [fenêtre d'autorisation EVM](/sdk/guides/evm#evm-window). Les constructeurs
hybrides acceptent une option `signBytesVersion` (`"auto"` | `"v1"` | `"v2"`) ; `"auto"`
interroge le réseau et nécessite donc le point d'accès REST (`rest`) sur
`qorechain-vladi` / `qorechain-diana` : il lève une erreur au lieu de deviner. Voir
[Quelle forme de sign-bytes ?](/sdk/concepts/accounts-pqc#sign-bytes-versions).
La forme n'a pas changé dans la chaîne v3.2.3 ni v3.2.4 (la v3.2.4 s'exécute sur le testnet depuis le 19 octobre 2026 et sur le mainnet depuis le 23 octobre 2026) : `"auto"`
se résout en v2 sur les deux réseaux, car les deux ont appliqué la mise à niveau qui y a basculé.
:::

## Ce qu'ajoute la 0.10.0 {#whats-new-0100}

Le SDK 0.10.0 est la version cliente pour la chaîne **v3.2.4**, que le mainnet a appliquée à la
hauteur 3,742,566 le 23 octobre 2026 (le testnet l'a appliquée à la hauteur 8,337,253
le 19 octobre). Le format de signature, les adresses, les décimales, les memos et les frais n'ont pas
changé, et une transaction construite avec la 0.9.0 reste valide. La version a été vérifiée dans
chaque langage avec de vraies transactions sur le testnet. Elle n'a pas de constructeurs pour
quoi que ce soit introduit après la v3.2.4. Le testnet est passé à la v3.2.6 (la v3.2.5 et
la v3.2.6 y ont été appliquées les 26 et 27 octobre 2026) ; la proposition de gouvernance 14 du
mainnet appliquerait la v3.2.5 à la hauteur 3,906,833 au moment de la rédaction, et ce que cette
version ajoute sera documenté lorsque le mainnet l'appliquera. Voici les nouveautés de la 0.10.0 :

| Domaine | Dans la 0.10.0 |
| --- | --- |
| Paliers de staking (`x/stakingtier`) | Constructeurs `lockDelegation` (avec les propres vérifications de la chaîne : une durée de 3, 6 ou 12 mois et un montant entier positif), `unlockEarly`, `claimBonus` et `updateParams` ; lectures des paramètres du module, des verrouillages d'un détenteur et du pool de bonus (`fetchStakingTierParams`, `fetchStakingLocks`, `fetchStakingTierPool`) ; les codes d'erreur du module. Ce que fait le module est décrit dans [Staking et délégation](/user-guide/staking-and-delegation) |
| Nonce d'authenticator | `fetchAuthNonce({ rest, address, pubkey })` lit la séquence qu'une clé liée doit signer ensuite pour `MsgExecuteEVM` / `MsgExecuteCosmos` depuis `/qorechain/abstractaccount/v1/auth_nonce/{address}/{pubkey_hex}`, au lieu de la suivre à la main. Les deux réseaux servent la route ; le module `abstractaccount` lui-même est désactivé sur le mainnet (activé sur le testnet), de sorte qu'une dépense sur le mainnet est refusée avant qu'un nonce soit vérifié |
| Interrupteurs de fonctionnalités du protocole | `fetchProtocolFeatures` et `isProtocolFeatureEnabled` lisent, par nom, quelles règles de consensus un réseau applique, depuis `/qorechain/pqc/v1/protocol_features` (les deux réseaux la servent). Un réseau antérieur à la v3.2.4 ne sert pas la route ; utilisez `isUpgradeApplied` dans ce cas |
| `possessionProven` | Le statut PQC indique si la clé du compte a été enregistrée avec une preuve de possession |
| `ibcTimeoutTimestamp(seconds)` | Un délai d'expiration IBC absolu dans l'unité que prend `MsgTransfer` (nanosecondes Unix). Les délais d'expiration IBC sont des instants absolus ; les paquets IBC v2 prennent des secondes Unix absolues, et une valeur relative y est refusée après le prélèvement des frais. Aucun canal IBC n'est ouvert sur le mainnet (vérifié le 27 octobre 2026) |
| Constante de mise à niveau et protos | `CHAIN_UPGRADE_V3_2_4` ; définitions protobuf synchronisées avec la chaîne v3.2.4 (nouveaux champs sur l'enregistrement de validateur de pont, le nœud léger et les requêtes de rollup) |
| `ensurePqcRegistered` | Il comparait comme concordant un statut sans clé publique ; il lit désormais la clé via `rest` et la compare. Faute de pouvoir la lire, le résultat indique `keyVerified: false` au lieu d'affirmer que la clé est celle de l'appelant |
| Refus pendant la simulation des frais | Un refus de la chaîne qui n'arrive que sous forme de texte (par exemple « no bonus to claim ») est désormais nommé d'après les descriptions d'erreur enregistrées de la chaîne dans chaque langage : `decodeTxError` (TypeScript), `SimulationRefusedError` (Python), `tx.DecodeRefusalText` (Go), `tx::decode_refusal_text` (Rust), `TxError.decode` (Java) |

`@qorechain/react` et `create-qorechain-dapp` sont passés à la 0.10.0 avec elle (le kit
dépend de `@qorechain/sdk` `^0.10.0`, et les modèles du générateur aussi).

## Ce qu'a ajouté la 0.9.0 {#whats-new-090}

Le SDK 0.9.0 était la version cliente pour les chaînes **v3.2.2** et **v3.2.3** (le mainnet
les a appliquées aux hauteurs 3,556,788 et 3,662,051 ; le mainnet exécute la v3.2.4 depuis le 23 octobre 2026 à la hauteur 3,742,566, et le testnet exécute la v3.2.4 ou une version ultérieure depuis le 19 octobre 2026). Le
format de signature, les adresses, les décimales, les memos et les frais n'ont pas changé,
si bien que la forme sign-bytes hybride v2 que signent la 0.8.1 et les versions suivantes
reste la bonne.
Voici les nouveautés :

| Domaine | Dans la 0.9.0 (et ultérieures) |
| --- | --- |
| `TxClient` hybride (TypeScript) | Passez la paire de clés du compte : `client.connectTx(signer, { pqcKeypair })` ou `TxClient.connect({ …, pqcKeypair, rest })`. Chaque transaction est alors signée en mode hybride et `fee: "auto"` simule la transaction hybride elle-même ; un simple enregistrement de clé reste classique (le chemin d'amorçage de la chaîne). `bankSend` et les clients rollup, multilayer et cross-VM du SDK l'utilisent. Sans paire de clés, rien ne change |
| Clé PQC récupérable | `derivePqcCanonical(address, mnemonic)` et ses équivalents dans chaque langage (voir [Signature hybride](/sdk/guides/quantum-safe#canonical-derivation)) |
| `ensurePqcRegistered` | Lit d'abord l'état de la clé via REST (`rest`), refuse d'enregistrer lorsqu'il ne peut pas le déterminer, lève `PqcKeyMismatchError` lorsque le compte détient déjà une autre clé, et traite le refus « déjà enregistrée » de la chaîne comme un succès. À partir de la chaîne v3.2.3, il signe et joint lui-même la **preuve de possession** ; avant la v3.2.3, il laisse le champ vide |
| Fenêtres EVM à portée restreinte | `openEvmWindowMsg` accepte `nativeOnly` et `allowedTargets` (16 au plus, sans doublons) ; `fetchEvmWindow` relit les deux (voir le [guide EVM](/sdk/guides/evm#evm-window)) |
| Consentement EIP-7702 | `authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `fetchEvmDelegationConsent`, `evmDelegationTupleNonce`, `classifyEvmDelegationRejection` |
| Intégrité des clés | Les constructeurs d'enregistrement refusent `classical_only`, une clé vide et une clé ML-DSA-87 dégénérée, que la chaîne refuse à partir de la v3.2.3. `signProofOfPossession` / `verifyProofOfPossession` sont exportées ; `migratePqcKeyHybrid` envoie le `MsgMigratePQCKey` signé en mode hybride dont les comptes dotés d'une clé ont besoin à partir de la v3.2.3 |
| Condensat de compte abstrait v2 | `evmAuthSignBytesV2` (lie la limite de gas de l'appel) et `resolveEvmAuthDigestVersion`. Le module `abstractaccount` est désactivé sur le mainnet (activé sur le testnet) ; sur le mainnet, ceci est donc donné à titre de référence |
| Détection des mises à niveau | `isUpgradeApplied`, `requireUpgradeApplied` : les nouveaux champs facultatifs ne sont renseignés qu'une fois que `applied_plan` signale la version, car un nœud qui n'a pas appliqué une version refuse la transaction entière lorsqu'un des nouveaux champs de cette version est renseigné |
| Décodage des erreurs | Un échec survenu dans un bloc conserve son codespace (par exemple `pqc` 231, et non `sdk_231`) ; `rate_limited` et les codes de délégation sont décodés ; `decodeTxError` lit le journal ou le message d'une erreur levée |
| Règles de dépense | `validateSpendingRules` s'exécute dans les constructeurs de `MsgUpdateSpendingRules` et refuse une règle qui ne borne rien |
| Correctifs | La route du compte PQC est la route au singulier `/qorechain/pqc/v1/account/{address}` dans tous les SDK (ainsi que dans `client.rest.getPqcAccount`, `isPqcRegistered` et `getPqcStatus` lorsqu'on leur donne le client composé) ; le `VERSION` exporté correspond au paquet ; les clients Go et Rust créés par le SDK expirent au lieu de rester bloqués ; les modèles de `create-qorechain-dapp` dépendent de la version avec laquelle ils sont livrés |

La dérivation PQC historique pour les nouvelles clés (`derivePqcLegacy`, `"bridge"`) est
dépréciée : elle n'est pas liée au compte, si bien qu'une même phrase mnémonique donnerait une même clé à
chaque compte. Les helpers de rotation la refusent comme **nouvelle** clé ; récupérer une clé historique existante
ou en changer par rotation fonctionne toujours.

## Versions antérieures à la 0.9.0 {#before-090}

Si vous êtes en 0.8.x, elle signe toujours la forme que vérifient les deux réseaux et fonctionne sur
le mainnet et le testnet. Voici les limites que la 0.9.0 a supprimées, et
certaines coûtent des frais si vous ne les connaissez pas :

| Version antérieure à la 0.9.0 | Contournement |
| --- | --- |
| Pas de constructeurs de preuve de possession, de fenêtre à portée restreinte ni de consentement EIP-7702 | Utilisez `qorechaind tx pqc register-key-v2 … --pqc-key <name>`, `open-evm-window --native-only` / `--allowed-targets`, et `authorize-evm-delegation` / `clear-evm-delegation` (voir [Fenêtre d'autorisation EVM](/getting-started/first-transaction#evm-window), [Délégations EIP-7702](/architecture/post-quantum-security#eip-7702)) |
| `ensurePqcRegistered` sans `status` diffusait l'enregistrement sans vérification, et signalait un succès lorsqu'une autre clé était enregistrée | Un second enregistrement pour un compte qui détient déjà une clé est refusé **après le prélèvement des frais**. Lisez d'abord `GET /qorechain/pqc/v1/account/{address}` et passez `status: { registered: found }` |
| `client.rest.getPqcAccount`, `isPqcRegistered`, `getPqcStatus` | Elles appelaient un chemin `/accounts/` au pluriel ou l'espace de noms `qor_`, que les points de terminaison publics ne servent pas (HTTP 501, `-32601`). Lisez la route REST au singulier ci-dessus |
| `TxClient` / `bankSend` et les clients rollup, multilayer et cross-VM signaient en classique uniquement | Les réseaux le refusent pour tout compte qui possède une clé. Envoyez via `signAndBroadcastHybrid` |
| Les transactions échouées dans un bloc perdaient leur codespace | Lisez la transaction depuis `GET /cosmos/tx/v1beta1/txs/{hash}` |
| La constante `VERSION` exportée de la 0.8.3 indiquait `0.8.0` | Lisez la version installée depuis `package.json` |
| `create-qorechain-dapp` 0.8.0 épinglait `@qorechain/sdk` / `@qorechain/evm` sur `^0.3.0` (un caret sur une version 0.x reste dans la 0.3) | Exécutez `npm i @qorechain/sdk@latest` après la génération |
| `@qorechain/react` 0.8.x laissait l'état de la clé enregistrée illisible sur les points de terminaison publics | Utilisez `@qorechain/react` 0.9.0 ou ultérieur |

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

Publié sur npm en `0.10.0` ; il dépend de `@qorechain/sdk` `^0.10.0`. Voir le [guide du kit React](/sdk/guides/react).

### Générateur de projet

`create-qorechain-dapp` (npm, `0.10.0`) génère une dApp prête à l'emploi :

```bash
npm create qorechain-dapp@latest my-dapp
```

Les fichiers `package.json` générés dépendent de la version du SDK avec laquelle le générateur
est livré (`@qorechain/sdk` `^0.10.0` ; le modèle EVM utilise `@qorechain/evm` `^0.8.0`).
La version 0.8.0 du générateur écrivait des plages `^0.3.0`, qui, sur une version 0.x, restent
dans la 0.3 et ne peuvent pas signer pour les réseaux en production ; si vous avez généré avec la 0.8.0, exécutez
`npm i @qorechain/sdk@latest`. Voir la [référence de la CLI](/sdk/reference/cli).

## Python

```bash
pip install qorechain-sdk
```

Nécessite Python 3.10+. Le paquet fournit des annotations de types et un marqueur `py.typed`.

> La distribution s'installe sous le nom `qorechain-sdk` (publiée sur PyPI en `0.10.0`)
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

Publié comme module Go autonome (étiqueté `packages/go/v0.10.0`). Épinglez la version
explicitement : `go get github.com/qorechain/qorechain-sdk/packages/go@v0.10.0`.

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

> Publié sur crates.io sous le nom `qorechain-sdk` (0.10.0) ; `cargo add qorechain-sdk`
> installe la dernière version publiée.

## Java

Maven (`pom.xml`) :

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.10.0</version>
</dependency>
```

Ou Gradle :

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.10.0'
```

> Publié sur Maven Central sous `io.github.qorechain:qorechain-sdk` (la 0.10.0 est la
> plus récente et la version de release, vérifié le 27 octobre 2026). Central n'a aucune version 0.8.0 ni
> 0.8.1, donc sur les réseaux en production utilisez la 0.8.2 ou une version ultérieure. La 0.9.1 était une
> version Java uniquement qui a fait passer Bouncy Castle de la 1.80 à la 1.85, sans changement d'API.

## Paquets associés {#related-packages}

| Paquet | Rôle | Version |
| --- | --- | --- |
| `@qorechain/wallet-adapter` | Assistants côté portefeuille : génération de portefeuille (`generateQoreWallet`), signature hybride `eth_secp256k1` (`signHybridEth`, `QoreChainSigner`), enregistrement du réseau MetaMask (`addQoreEvmToWallet`), constructeurs de messages d'authenticator et de fenêtre EVM (son `openEvmWindowMsg` ne construit que la forme sans restriction), le condensat de compte abstrait v2. Il ne joint pas de preuve de possession. Dépendances de type pair : `@cosmjs/proto-signing` et `@cosmjs/stargate` `^0.32` (le SDK utilise cosmjs 0.39 ; installer les deux dans un même projet fait donc signaler un conflit de dépendances de type pair par npm, `ERESOLVE` ; gardez-les dans des projets séparés ou passez `--legacy-peer-deps`) | 0.4.0 |
| `@qorechain/chain-bridge` | Worker côté serveur pour les backends : dérive la clé PQC, signe en hybride et diffuse (`sendTokens`, `registerPqc`, et plus). Passez `cosmosRest` : avec lui, un enregistrement porte la preuve de possession dès que le réseau a appliqué la v3.2.3, et un refus d'apparence PQC est vérifié auprès de la chaîne avant tout nouvel enregistrement (une clé enregistrée différente lève `pqc_key_mismatch` au lieu de payer un second enregistrement) | 0.2.3 |
| `@qorechain/pqc` | Primitives ML-DSA / ML-KEM / SHAKE-256 conformes aux standards uniquement et `hybridSignBytes` (voir [Signature post-quantique](/developer-guide/post-quantum-signing)) ; également sur PyPI, crates.io, Maven Central et le proxy Go (Go `v0.2.3`) à la même version | 0.2.3 |
| `@qorechain/handles` | Résolution vérifiée des `@handle` (`HandleClient`) : vous fournissez la clé publique du registre et un magasin d'épinglage, et vous épinglez après que l'utilisateur a vu l'adresse ; le paquet n'épingle jamais de lui-même. Voir [Chain bridge et handles](/developer-tools/chain-bridge#handles) | 0.1.0 |
| `@qorechain/connect` | **Déprécié sur npm et plus maintenu ; ne l'utilisez pas pour du nouveau travail. Utilisez plutôt [`@qorechain/wallet-adapter`](/developer-tools/wallet-adapter) (les remplaçants pour la connexion à QoreX se trouvent dans la [vue d'ensemble des outils pour développeurs](/developer-tools/overview#group-connect)).** Un connecteur unique pour les portefeuilles EVM, Cosmos et SVM, construit sur l'adaptateur de portefeuille (sa plage de pairs est `@qorechain/wallet-adapter` `^0.2.1`, qui n'inclut pas la 0.4.0). Il n'ouvre pas de [fenêtre d'autorisation EVM](/sdk/guides/evm#evm-window) : un envoi EVM via ce paquet est donc refusé tant que le compte n'a pas de clé enregistrée ni de fenêtre ouverte | 0.2.1 |
| `@qorechain/rdk` | Client du Rollup Development Kit (voir [Rollups](/rollups/why)). Il dépend de `@qorechain/sdk` `^0.9.0` et de `@qorechain/evm` `^0.8.0` ; un caret sur une version 0.x reste dans la 0.9, de sorte qu'une application sur le SDK 0.10.0 obtient avec le kit une seconde copie imbriquée du SDK 0.9.x (une application qui reste sur le SDK 0.9.x partage une seule copie). Ne signe en mode hybride que lorsque vous passez une `pqcKeypair` ; les lectures fonctionnent sans elle. Également publié sous le nom `qorechain-rdk` sur PyPI, crates.io et Maven Central, et comme module Go (épinglez `@v0.6.2` ; Maven Central sert la 0.6.1 tant que la 0.6.2 n'y est pas disponible) ; ces quatre clients signent en classique uniquement. Voir [RDK 0.6.2 : changements et limites](/rollups/deploying-a-rollup#rdk-050-limits) | 0.6.2 |
| `@qorechain/rdk-cli` | La CLI opérateur `qorollup` pour le RDK. Ses commandes de transaction (`create`, `pause`, `resume`, `stop`, `withdraw`) signent en classique uniquement et sont refusées par les réseaux ; installée depuis npm, elle s'exécute et `--version` affiche 0.6.2 (la 0.6.1 et les versions antérieures n'affichaient rien) | 0.6.2 |
| `create-qorechain-rollup` | Générateur de projets rollup ; ses modèles dépendent de `@qorechain/rdk` `^0.6.1` et signent en mode hybride lorsqu'ils peuvent résoudre votre clé post-quantique à partir de `QORE_MNEMONIC` ou `QORE_PQC_SEED_HEX` | 0.6.2 |

## Étape suivante

Poursuivez avec le [Démarrage rapide](/sdk/quickstart) pour vous connecter et lire l'état de la chaîne.
