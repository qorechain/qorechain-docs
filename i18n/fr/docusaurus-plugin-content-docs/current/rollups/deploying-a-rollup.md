---
slug: /rollups/deploying-a-rollup
title: Déployer un rollup
sidebar_label: Déployer un rollup
sidebar_position: 3
---

# Déployer un rollup

Vous pouvez déployer un rollup applicatif de trois façons : via le **Dashboard** (un assistant guidé, sans code), via la **CLI** de la chaîne (`qorechaind`, contrôle total sur la transaction on-chain), ou par programmation avec le **RDK TypeScript** (`@qorechain/rdk` plus le générateur de projet `create-qorechain-rollup`). Cette page couvre les trois méthodes, ainsi que le cycle de vie côté opérateur et les commandes de batch.

:::note
Les commandes ci-dessous ciblent le testnet **`qorechain-diana`**. Le mainnet (**`qorechain-vladi`**, chain ID EVM **9801**) est en production depuis le 7 juin 2026 et exécute la version de chaîne **v3.1.85** — remplacez le chain ID et les endpoints par ceux du mainnet lors d'un déploiement en production. Validez toujours chaque déploiement sur le testnet d'abord.
:::

---

## Prérequis

| Prérequis | Détails |
| ----------- | ------- |
| **Stake minimum** | Une caution de stake en QOR est mise sous séquestre à la création du rollup |
| **Burn de création** | Une fraction du montant staké est brûlée définitivement à la création ; le reste est conservé sous séquestre et restitué lorsque le rollup est arrêté |
| **Compte** | Un compte QoreChain approvisionné, avec un solde suffisant pour le stake plus les frais de transaction |

Interrogez les paramètres du module en direct pour connaître le stake minimum et le taux de burn actuels avant de déployer :

```bash
qorechaind query rdk config
```

---

## Déployer via le Dashboard (Tools → Rollups)

Le Dashboard fournit un assistant guidé **Deploy a Rollup** sous **Tools → Rollups**. C'est le chemin le plus rapide pour lancer un rollup applicatif sans assembler une transaction à la main.

### Étapes

1. **Connectez-vous.** L'assistant exige une session authentifiée pour déployer et pour lister vos déploiements existants.
2. **Nommez votre rollup.** Saisissez un nom de rollup (2–41 caractères : lettres, chiffres, espaces, tirets ou traits de soulignement).
3. **Choisissez une machine virtuelle.** QoreChain est une chaîne à triple VM, votre rollup peut donc exécuter au choix :
   * **EVM** — contrats Solidity / Vyper avec tout l'outillage Ethereum (Hardhat, Foundry, MetaMask)
   * **CosmWasm** — smart contracts en Rust sur le runtime Cosmos SDK, avec IBC natif
   * **SVM** — la Solana Virtual Machine, pour les applications à exécution parallèle et à haut débit
4. **Choisissez une couche de disponibilité des données.** L'endroit où votre rollup publie les données de transaction afin que quiconque puisse reconstruire l'état : **QoreChain DA**, **Celestia** ou **EigenDA**. Notez qu'EigenDA est une option au niveau du Dashboard, tandis que les backends DA on-chain du module `x/rdk` sont natif, Celestia, ou les deux — voir [Disponibilité des données](/rollups/data-availability).
5. **Définissez un jeton de gas.** Le jeton utilisé pour payer l'exécution sur votre rollup. Par défaut **QOR** ; saisissez un symbole personnalisé pour utiliser votre propre jeton natif.
6. **Choisissez un séquenceur.** Qui ordonne les transactions avant le règlement : **Shared sequencer** (l'ensemble partagé QoreChain), **Dedicated (single)** (exploitez votre propre séquenceur unique), ou **Decentralized** (un ensemble de séquenceurs sans permission).
7. **Choisissez une cible de règlement.** L'endroit où le rollup ancre ses racines d'état et ses preuves de validité : **QoreChain mainnet** ou **Ethereum**.
8. **Déployez.** Soumettez l'assistant. Le provisionnement est examiné par **The Qore Trust** avant la mise en service du rollup ; un rollup fraîchement soumis apparaît donc avec le statut **provisioning** jusqu'à la fin de l'examen.

Vos rollups soumis apparaissent dans la liste **Your rollups** avec leur VM, leur couche DA, leur jeton de gas, leur séquenceur, leur cible de règlement et leur statut actuel.

:::note
L'assistant du Dashboard présente des choix conviviaux, au niveau produit, et fait passer le provisionnement par un pipeline soumis à examen. La CLI ci-dessous travaille directement sur la surface de messages on-chain du module `x/rdk`. Les deux partagent les mêmes concepts sous-jacents (VM, DA, séquenceur, règlement) mais les exposent à des altitudes différentes.
:::

---

## Déployer via la CLI

La CLI crée le rollup directement on-chain. `create-rollup` prend trois arguments positionnels — l'ID du rollup, un profil et le montant du stake (en `uqor`) — plus un flag optionnel `--vm`.

:::tip
Depuis la version de chaîne **v3.1.74**, `create-rollup` **applique automatiquement le preset du profil choisi** — le mode de règlement, le séquenceur, la DA, le modèle de gas et la VM sont tous tirés du preset. Vous n'avez plus besoin de les définir à la main (auparavant, le message imposait en dur une configuration souveraine). Le flag `--vm` est désormais **vide par défaut**, de sorte que la VM du profil s'applique sauf si vous la remplacez explicitement.
:::

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Exemple** — créer un rollup à partir du preset `defi` (le règlement, le séquenceur, la DA et la VM proviennent tous du preset ; `defi` correspond à un règlement zk sur l'EVM) :

```bash
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Flags :**

| Flag | Valeur par défaut | Description |
| ---- | ------- | ----------- |
| `--vm` | *(vide — utilise la VM du profil)* | Remplace le type de VM du rollup : `evm`, `cosmwasm`, `svm` ou `custom`. Laissez vide pour appliquer la VM du preset. (Dans les clients RDK, le runtime Wasm est le type de VM **`native`** — QoreChain Native — avec `cosmwasm` conservé comme alias historique ; `cosmwasm` est la valeur transmise sur le réseau, et c'est celle qu'accepte ce flag au niveau de la chaîne.) |

L'argument `[profile]` sélectionne une configuration preset appliquée automatiquement — voir **[Profils prédéfinis](/rollups/preset-profiles)**. Le `[stake-amount]` est la caution en `uqor`.

### Inspecter ce que vous avez déployé

```bash
# Query a specific rollup by ID
qorechaind query rdk rollup my-defi-rollup

# List all registered rollups
qorechaind query rdk list-rollups
```

---

## Déployer avec le RDK TypeScript (`@qorechain/rdk`) {#deploy-with-the-typescript-rdk-qorechainrdk}

Le Rollup Development Kit est distribué sous forme de deux paquets npm publics qui pilotent le même module on-chain `x/rdk` que la CLI, via les endpoints publics RPC/REST/gRPC/JSON-RPC et n'importe quel `OfflineSigner` cosmjs :

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)** (`v0.4.4`) — le SDK TypeScript : un constructeur de configuration avec profils prédéfinis, des helpers de transaction pour les cycles de vie du rollup et des batchs de règlement, la DA native, des clients de lecture typés, et les ajouts de la v0.4 — reçus de règlement à sûreté quantique, le QCAI Rollup Copilot, des helpers de calldata cross-VM et le watchtower.
* **`create-qorechain-rollup`** (`v0.4.4`) — un générateur de projet qui clone un template de démarrage exécutable par profil (y compris le template `multivm-rollup`).

Ils sont publiés sur npm. Le dépôt fournit également une CLI opérateur publiée, **`@qorechain/rdk-cli`** (`qorollup`, `v0.4.4`), avec les commandes `doctor`, `create`, `status`, `watch`, `params`, `suggest`, le cycle de vie (`pause`/`resume`/`stop`), `keygen`, `manifest`, `withdraw` et `faucet`, plus les commandes `receipt`, `advise` et `watchtower` de la v0.4.

Points marquants depuis la version initiale v0.4.0 :

* **v0.4.2 — fonctionne contre le réseau en production, prêt à l'emploi.** Les presets `mainnet` et `testnet` embarquent désormais les endpoints publics `qore.host` (REST sur `api.qore.host` / `api-testnet.qore.host`), de sorte que `createRdkClient({ network })` atteint la chaîne sans configuration `endpoints` manuelle — ne la surchargez que pour cibler votre propre nœud. La même version a renommé l'identifiant de VM des rollups Wasm en **`native`** (QoreChain Native) ; `cosmwasm` reste un alias historique accepté, et les deux correspondent à `cosmwasm` sur le réseau — la chaîne, l'explorateur et le Dashboard sont inchangés.
* **v0.4.3 — correctif de l'encodage des signatures hybrides** pour le chemin de signature TypeScript (voir l'avertissement ci-dessous).
* **v0.4.4 — suit `@qorechain/sdk` `^0.7.0`**, la version du SDK pour les voies d'authentificateurs de la chaîne **v3.1.85**, de sorte que ces capacités parviennent directement aux utilisateurs TypeScript du RDK via le SDK. Aucun changement d'API du RDK.

:::caution
**Les utilisateurs TypeScript doivent être en RDK ≥ 0.4.3.** Les versions antérieures encodaient mal l'extension de transaction PQC hybride, si bien que la chaîne rejetait toutes les transactions signées en hybride. La v0.4.3 (via `@qorechain/sdk` ≥ 0.6.1) corrige l'encodage. Seul le chemin de signature hybride TypeScript était concerné — les clients Python, Go, Rust et Java signent en classique uniquement et n'ont jamais été affectés.
:::

#### Clients Python, Go, Rust et Java

Aux côtés du paquet TypeScript, le RDK fournit des clients **Python**, **Go**, **Rust** et **Java** complets qui reflètent la surface TypeScript : le constructeur de configuration avec validation, les cinq profils prédéfinis, les utilitaires denom/économie/bech32, les helpers de Merkle binaire et de preuves de retrait, les manifestes de rollup, les clients de lecture REST et JSON-RPC `qor_`, les vérifications preflight/santé, les comptes (mnémonique → adresse `qor`), et la **signature + diffusion de transactions** (`SIGN_MODE_DIRECT`). Tous sont vérifiés contre des vecteurs de référence partagés entre langages et sont **publiés** sur leurs registres :

```bash
# Python — installs as qorechain-rdk, imports as qorrdk
pip install qorechain-rdk

# Rust
cargo add qorechain-rdk

# Go
go get github.com/qorechain/qorechain-rdk/packages/go

# Java (Maven / Gradle)
# io.github.qorechain:qorechain-rdk:0.4.4
```

```python
import qorrdk
```

Versions publiées actuelles : Python `qorechain-rdk` **0.4.4** (PyPI, import `qorrdk`), Rust `qorechain-rdk` (crates.io — installez la dernière version publiée, ou compilez depuis le dépôt), module Go `github.com/qorechain/qorechain-rdk/packages/go` (**v0.4.4**), et Java `io.github.qorechain:qorechain-rdk` **0.4.4** (Maven Central). La diffusion en direct nécessite un endpoint de nœud.

:::note
Le RDK TypeScript et ses templates ciblent par défaut le testnet **`qorechain-diana`**, et depuis la v0.4.2 les presets atteignent les endpoints publics en production, prêts à l'emploi. Épinglez les versions et validez sur le testnet avant le mainnet.
:::

### Générer un projet avec `create-qorechain-rollup` {#scaffold-a-project-with-create-qorechain-rollup}

Chaque profil possède un template de démarrage correspondant (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`). Générez-en un avec l'une ou l'autre forme :

```bash
npm create qorechain-rollup my-rollup
# or
npx create-qorechain-rollup my-rollup
```

Pour un usage non interactif / CI, passez le template et le réseau explicitement :

```bash
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --yes
```

Le générateur affiche le coût documenté du stake et du burn de création, ainsi que les étapes suivantes pour créer votre rollup et lire son statut.

### Créer un rollup depuis le code

Construisez une configuration à partir d'un preset, lisez le stake et le taux de burn en direct depuis la chaîne, puis créez le rollup avec un client de signature. Le constructeur de configuration applique la matrice de compatibilité règlement → preuve lors de `validate()` / `build()`.

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// A config builder pre-filled with the defi preset's defaults; override via .set({ ... }).
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

// The public qore.host endpoints are baked into the presets (RDK ≥ 0.4.2) —
// no manual `endpoints` config needed; override to target your own node.
const rdk = createRdkClient({ network: "testnet" });

// Read the live module parameters — never hardcode the stake or burn rate.
const params = await rdk.params();
const cost = estimateCreationCost({
  stakeUqor: params.minStakeForRollup,
  burnRate: params.rollupCreationBurnRate,
});
console.log(`Stake: ${uqorToQor(cost.stakeUqor)} QOR — burned: ${uqorToQor(cost.burnUqor)} QOR`);

// Connect a signing client with any cosmjs OfflineSigner.
const tx = await rdk.connectTx(signer, { gasPrice: "0.15uqor" }); // the chain enforces a 0.1uqor/gas fee floor
const msg = config.toCreateMsg(tx.address, { stakeAmount: params.minStakeForRollup });

const res = await tx.createRollup({
  rollupId: msg.rollupId,
  profile: msg.profile,
  vmType: msg.vmType,
  stakeAmount: msg.stakeAmount,
});
console.log(`Submitted: ${res.transactionHash} (code ${res.code})`);
```

Vous hésitez sur le profil adapté ? `rdk.suggestProfile("a lending protocol with predictable fees")` renvoie une recommandation assistée par QCAI (avec un fallback documenté).

### Gérer le cycle de vie et lire l'état depuis le code

Le client de signature expose le cycle de vie complet — `pauseRollup`, `resumeRollup`, `stopRollup`, plus `submitBatch`, `challengeBatch`, `resolveChallenge` et `executeWithdrawal`. Les transitions du cycle de vie peuvent être protégées en passant `currentStatus`.

```ts
await tx.pauseRollup({ rollupId: "my-defi-rollup", reason: "maintenance" });
await tx.resumeRollup({ rollupId: "my-defi-rollup" });
await tx.stopRollup({ rollupId: "my-defi-rollup" });
```

Lisez l'état avec le client REST typé (aucun signataire requis) :

```ts
const rollup = await rdk.rest.getRollup("my-defi-rollup");
console.log(rollup.status, rollup.settlementMode, rollup.daBackend, rollup.vmType);

const batch = await rdk.rest.getLatestBatch("my-defi-rollup");
console.log(batch.batchIndex, batch.status, batch.txCount);
```

---

## Gestion du cycle de vie

Un rollup passe par les états `pending`, `active`, `paused` et `stopped`. Le créateur gère les transitions avec les commandes suivantes.

### Mettre en pause

Interrompt temporairement le rollup. L'état est préservé et le rollup peut être repris. Une chaîne de caractères indiquant la raison est requise.

```bash
qorechaind tx rdk pause-rollup [rollup-id] [reason] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Reprendre

Reprend un rollup précédemment mis en pause.

```bash
qorechaind tx rdk resume-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Arrêter

Met définitivement le rollup hors service et libère son stake. Le QOR staké — moins le burn de création unique — est restitué au créateur.

```bash
qorechaind tx rdk stop-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

:::danger
L'arrêt d'un rollup est définitif. Le rollup ne peut pas être redémarré après avoir été arrêté.
:::

---

## Commandes opérateur : batchs et contestations

Les opérateurs de rollup soumettent des batchs de règlement, et les contestataires peuvent contester les batchs optimistes. Ces commandes sous-tendent la couche de règlement décrite dans **[Vue d'ensemble des rollups](/rollups/overview)** et **[ZK / STARK et retraits](/rollups/zk-stark-withdrawals)**.

### Soumettre un batch

Soumet un batch de règlement pour un rollup. Prend l'ID du rollup, un index de batch et une racine d'état encodée en hexadécimal.

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Contester un batch

Conteste un batch soumis (pour les rollups optimistes). Prend l'ID du rollup et l'index du batch ; passez la preuve de fraude avec `--proof`. Depuis la version de chaîne **v3.1.74**, le chemin optimiste **submit-batch → challenge-batch** est en production et fonctionne de bout en bout.

```bash
qorechaind tx rdk challenge-batch [rollup-id] [batch-index] \
  --proof <hex-encoded-fraud-proof> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

| Flag | Description |
| ---- | ----------- |
| `--proof` | Preuve de fraude encodée en hexadécimal |

### Inspecter les batchs

```bash
# Latest batch for a rollup
qorechaind query rdk batch [rollup-id]

# A specific batch by index
qorechaind query rdk batch [rollup-id] --index 42
```

---

## Requêtes

| Commande | Objet |
| ------- | ------- |
| `qorechaind query rdk rollup [rollup-id]` | Détails d'un rollup spécifique |
| `qorechaind query rdk list-rollups` | Tous les rollups enregistrés |
| `qorechaind query rdk batch [rollup-id]` | Dernier batch de règlement (ou `--index`) |
| `qorechaind query rdk config` | Paramètres du module RDK |
| `qorechaind query rdk suggest-profile [use-case]` | Recommande un preset pour un cas d'usage |

---

## Prochaines étapes

* **[Disponibilité des données](/rollups/data-availability)** — backends DA natif, Celestia et redondant.
* **[ZK / STARK et retraits](/rollups/zk-stark-withdrawals)** — vérification des preuves et flux de retrait L2 → L1 via `execute-withdrawal`.
