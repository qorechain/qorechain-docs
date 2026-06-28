---
slug: /rollups/deploying-a-rollup
title: Déployer un rollup
sidebar_label: Déployer un rollup
sidebar_position: 3
---

# Déployer un rollup

Vous pouvez déployer un rollup spécifique à une application de trois manières : via le **Dashboard** (un assistant guidé, sans code), via la **CLI** de la chaîne (`qorechaind`, contrôle total sur la transaction on-chain), ou par programmation avec le **RDK TypeScript** (`@qorechain/rdk` plus l'outil d'échafaudage `create-qorechain-rollup`). Cette page couvre les trois, ainsi que le cycle de vie de l'opérateur et les commandes de lot.

:::note
Les commandes ci-dessous ciblent le testnet **`qorechain-diana`**. Le mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) est en service depuis le 7 juin 2026 et exécute la version de chaîne **v3.1.80** — remplacez le chain ID et les endpoints du mainnet lors d'un déploiement sur le mainnet. Validez d'abord chaque déploiement sur le testnet.
:::

---

## Prérequis

| Prérequis | Détails |
| ----------- | ------- |
| **Mise minimale** | Une caution de mise en QOR est mise en séquestre lors de la création du rollup |
| **Burn de création** | Une fraction du montant misé est définitivement brûlée à la création ; le reste est conservé en séquestre et restitué lorsque le rollup est arrêté |
| **Compte** | Un compte QoreChain approvisionné avec un solde suffisant pour la mise plus les frais de transaction |

Interrogez les paramètres du module en direct pour connaître la mise minimale et le taux de burn actuels avant de déployer :

```bash
qorechaind query rdk config
```

---

## Déployer via le Dashboard (Tools → Rollups)

Le Dashboard fournit un assistant guidé **Deploy a Rollup** sous **Tools → Rollups**. C'est le chemin le plus rapide pour lancer un rollup spécifique à une application sans assembler une transaction à la main.

### Étapes

1. **Connectez-vous.** L'assistant nécessite une session authentifiée pour déployer et pour lister vos déploiements existants.
2. **Nommez votre rollup.** Saisissez un nom de rollup (2 à 41 caractères : lettres, chiffres, espaces, tirets ou tirets bas).
3. **Choisissez une machine virtuelle.** QoreChain est une chaîne à triple VM, votre rollup peut donc exécuter l'une des options suivantes :
   * **EVM** — contrats Solidity / Vyper avec l'outillage Ethereum complet (Hardhat, Foundry, MetaMask)
   * **CosmWasm** — contrats intelligents en Rust sur le runtime Cosmos SDK, avec IBC natif
   * **SVM** — la Solana Virtual Machine, pour les applications à exécution parallèle et à haut débit
4. **Choisissez une couche de disponibilité des données.** L'endroit où votre rollup publie les données de transaction pour que chacun puisse reconstruire l'état : **QoreChain DA**, **Celestia** ou **EigenDA**. Notez qu'EigenDA est une option au niveau du Dashboard, tandis que les backends DA on-chain de `x/rdk` sont native, Celestia ou both — voir [Disponibilité des données](/rollups/data-availability).
5. **Définissez un token de gas.** Le token utilisé pour payer l'exécution sur votre rollup. Par défaut **QOR** ; saisissez un symbole personnalisé pour utiliser votre propre token natif.
6. **Choisissez un séquenceur.** Qui ordonne les transactions avant le règlement : **Shared sequencer** (l'ensemble partagé de QoreChain), **Dedicated (single)** (exécutez votre propre séquenceur unique), ou **Decentralized** (un ensemble de séquenceurs sans permission).
7. **Choisissez une cible de règlement.** L'endroit où le rollup ancre ses racines d'état et ses preuves de validité : **QoreChain mainnet** ou **Ethereum**.
8. **Déployez.** Soumettez l'assistant. Le provisionnement est examiné par **The Qore Trust** avant que le rollup ne soit mis en service, de sorte qu'un rollup fraîchement soumis apparaît avec un statut **provisioning** jusqu'à ce que l'examen soit terminé.

Vos rollups soumis apparaissent dans la liste **Your rollups** avec leur VM, couche DA, token de gas, séquenceur, cible de règlement et statut actuel.

:::note
L'assistant du Dashboard présente des choix conviviaux, au niveau produit, et achemine le provisionnement via un pipeline examiné. La CLI ci-dessous fonctionne directement avec la surface de messages on-chain du module `x/rdk`. Les deux partagent les mêmes concepts sous-jacents (VM, DA, séquenceur, règlement) mais les exposent à des altitudes différentes.
:::

---

## Déployer via la CLI

La CLI crée le rollup directement on-chain. `create-rollup` prend trois arguments positionnels — l'identifiant du rollup, un profil et le montant de la mise (en `uqor`) — plus un drapeau optionnel `--vm`.

:::tip
Depuis la version de chaîne **v3.1.74**, `create-rollup` **applique automatiquement le préréglage du profil choisi** — le mode de règlement, le séquenceur, la DA, le modèle de gas et la VM sont tous tirés du préréglage. Vous n'avez plus besoin de les définir à la main (auparavant, le message codait en dur une configuration souveraine). Le drapeau `--vm` est désormais **vide par défaut**, de sorte que la VM du profil s'applique sauf si vous la remplacez explicitement.
:::

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Exemple** — créer un rollup à partir du préréglage `defi` (règlement, séquenceur, DA et VM proviennent tous du préréglage ; `defi` se résout en règlement zk sur l'EVM) :

```bash
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Drapeaux :**

| Drapeau | Défaut | Description |
| ---- | ------- | ----------- |
| `--vm` | *(vide — utilise la VM du profil)* | Remplace le type de VM du rollup : `evm`, `cosmwasm`, `svm` ou `custom`. Laissez non défini pour appliquer la VM du préréglage. |

L'argument `[profile]` sélectionne une configuration préréglée qui est appliquée automatiquement — voir **[Profils préréglés](/rollups/preset-profiles)**. Le `[stake-amount]` est la caution en `uqor`.

### Inspecter ce que vous avez déployé

```bash
# Query a specific rollup by ID
qorechaind query rdk rollup my-defi-rollup

# List all registered rollups
qorechaind query rdk list-rollups
```

---

## Déployer avec le RDK TypeScript (`@qorechain/rdk`) {#deploy-with-the-typescript-rdk-qorechainrdk}

Le Rollup Development Kit est livré sous forme de deux paquets npm publics qui pilotent le même module on-chain `x/rdk` que la CLI, via RPC/REST/gRPC/JSON-RPC publics et n'importe quel `OfflineSigner` de cosmjs :

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)** (`v0.4.0`) — le SDK TypeScript : un constructeur de configuration avec des profils préréglés, des helpers de transaction pour les cycles de vie des rollups et des lots de règlement, la DA native, des clients de lecture typés, et les ajouts v0.4 — reçus de règlement résistants au quantique, le QCAI Rollup Copilot, les helpers de calldata inter-VM et la watchtower.
* **`create-qorechain-rollup`** (`v0.4.0`) — un outil d'échafaudage qui clone un modèle de démarrage exécutable par profil (y compris le modèle `multivm-rollup`).

Ils sont publiés sur npm. Le dépôt fournit également une CLI d'opérateur publiée, **`@qorechain/rdk-cli`** (`qorollup`, `v0.4.0`), avec les commandes `doctor`, `create`, `status`, `watch`, `params`, `suggest`, le cycle de vie (`pause`/`resume`/`stop`), `keygen`, `manifest`, `withdraw` et `faucet`, ainsi que les commandes v0.4 `receipt`, `advise` et `watchtower`.

#### Clients Python, Go, Rust et Java

Aux côtés du paquet TypeScript, le RDK fournit des clients **Python**, **Go**, **Rust** et **Java** complets qui reflètent la surface TypeScript : le constructeur de configuration avec validation, les cinq profils préréglés, les utilitaires de denom/économie/bech32, les helpers de Merkle binaire et de preuve de retrait, les manifestes de rollup, les clients de lecture REST et JSON-RPC `qor_`, les contrôles de préflight/santé, les comptes (mnémonique → adresse `qor`), et la **signature + diffusion de transactions** (`SIGN_MODE_DIRECT`). Tous sont vérifiés par rapport à des vecteurs de référence inter-langages partagés et sont **publiés** dans leurs registres respectifs :

```bash
# Python — installs as qorechain-rdk, imports as qorrdk
pip install qorechain-rdk

# Rust
cargo add qorechain-rdk

# Go
go get github.com/qorechain/qorechain-rdk/packages/go

# Java (Maven / Gradle)
# io.github.qorechain:qorechain-rdk:0.4.0
```

```python
import qorrdk
```

Versions actuellement publiées : Python `qorechain-rdk` **0.4.0** (PyPI, import `qorrdk`), Rust `qorechain-rdk` **0.4.0** (crates.io), module Go `github.com/qorechain/qorechain-rdk/packages/go`, et Java `io.github.qorechain:qorechain-rdk` **0.4.0** (Maven Central). La diffusion en direct nécessite un endpoint de nœud.

:::note
Le RDK TypeScript et ses modèles ciblent le testnet **`qorechain-diana`** et sont marqués **bientôt disponibles** pour les flux complets de bout en bout. Épinglez les versions et validez sur le testnet.
:::

### Échafauder un projet avec `create-qorechain-rollup` {#scaffold-a-project-with-create-qorechain-rollup}

Chaque profil a un modèle de démarrage correspondant (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`). Échafaudez-en un avec l'une ou l'autre forme :

```bash
npm create qorechain-rollup my-rollup
# or
npx create-qorechain-rollup my-rollup
```

Pour un usage non interactif / CI, passez explicitement le modèle et le réseau :

```bash
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --yes
```

L'outil d'échafaudage affiche le coût documenté de la mise et du burn de création ainsi que les étapes suivantes pour créer votre rollup et lire son statut.

### Créer un rollup à partir du code

Construisez une configuration à partir d'un préréglage, lisez la mise et le taux de burn en direct depuis la chaîne, puis créez le rollup avec un client de signature. Le constructeur de configuration applique la matrice de compatibilité règlement → preuve lors de `validate()` / `build()`.

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// A config builder pre-filled with the defi preset's defaults; override via .set({ ... }).
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

const rdk = createRdkClient({ network: "testnet" });

// Read the live module parameters — never hardcode the stake or burn rate.
const params = await rdk.params();
const cost = estimateCreationCost({
  stakeUqor: params.minStakeForRollup,
  burnRate: params.rollupCreationBurnRate,
});
console.log(`Stake: ${uqorToQor(cost.stakeUqor)} QOR — burned: ${uqorToQor(cost.burnUqor)} QOR`);

// Connect a signing client with any cosmjs OfflineSigner.
const tx = await rdk.connectTx(signer, { gasPrice: "0.025uqor" });
const msg = config.toCreateMsg(tx.address, { stakeAmount: params.minStakeForRollup });

const res = await tx.createRollup({
  rollupId: msg.rollupId,
  profile: msg.profile,
  vmType: msg.vmType,
  stakeAmount: msg.stakeAmount,
});
console.log(`Submitted: ${res.transactionHash} (code ${res.code})`);
```

Vous ne savez pas quel profil convient ? `rdk.suggestProfile("a lending protocol with predictable fees")` renvoie une recommandation assistée par QCAI (avec un repli documenté).

### Gérer le cycle de vie et lire l'état depuis le code

Le client de signature expose le cycle de vie complet — `pauseRollup`, `resumeRollup`, `stopRollup`, plus `submitBatch`, `challengeBatch`, `resolveChallenge` et `executeWithdrawal`. Les transitions de cycle de vie peuvent être protégées en passant `currentStatus`.

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

### Pause

Suspendre temporairement le rollup. L'état est préservé et le rollup peut être repris. Une chaîne de motif est requise.

```bash
qorechaind tx rdk pause-rollup [rollup-id] [reason] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Reprise

Reprendre un rollup précédemment mis en pause.

```bash
qorechaind tx rdk resume-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Arrêt

Mettre définitivement hors service le rollup et libérer sa mise. Le QOR misé — moins le burn de création unique — est restitué au créateur.

```bash
qorechaind tx rdk stop-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

:::danger
L'arrêt d'un rollup est permanent. Le rollup ne peut pas être redémarré une fois arrêté.
:::

---

## Commandes d'opérateur : lots et contestations

Les opérateurs de rollups soumettent des lots de règlement, et les contestataires peuvent disputer les lots optimistes. Ces commandes sous-tendent la couche de règlement décrite dans **[Présentation des rollups](/rollups/overview)** et **[ZK / STARK et retraits](/rollups/zk-stark-withdrawals)**.

### Soumettre un lot

Soumettre un lot de règlement pour un rollup. Prend l'identifiant du rollup, un index de lot et une racine d'état encodée en hexadécimal.

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Contester un lot

Contester un lot soumis (pour les rollups optimistes). Prend l'identifiant du rollup et l'index de lot ; passez la preuve de fraude avec `--proof`. Depuis la version de chaîne **v3.1.74**, le chemin optimiste **submit-batch → challenge-batch** est actif et fonctionne de bout en bout.

```bash
qorechaind tx rdk challenge-batch [rollup-id] [batch-index] \
  --proof <hex-encoded-fraud-proof> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

| Drapeau | Description |
| ---- | ----------- |
| `--proof` | Preuve de fraude encodée en hexadécimal |

### Inspecter les lots

```bash
# Latest batch for a rollup
qorechaind query rdk batch [rollup-id]

# A specific batch by index
qorechaind query rdk batch [rollup-id] --index 42
```

---

## Interrogation

| Commande | Objectif |
| ------- | ------- |
| `qorechaind query rdk rollup [rollup-id]` | Détails d'un rollup spécifique |
| `qorechaind query rdk list-rollups` | Tous les rollups enregistrés |
| `qorechaind query rdk batch [rollup-id]` | Dernier lot de règlement (ou `--index`) |
| `qorechaind query rdk config` | Paramètres du module RDK |
| `qorechaind query rdk suggest-profile [use-case]` | Recommander un préréglage pour un cas d'usage |

---

## Étapes suivantes

* **[Disponibilité des données](/rollups/data-availability)** — backends DA native, Celestia et redondant.
* **[ZK / STARK et retraits](/rollups/zk-stark-withdrawals)** — vérification des preuves et flux de retrait L2 → L1 via `execute-withdrawal`.
