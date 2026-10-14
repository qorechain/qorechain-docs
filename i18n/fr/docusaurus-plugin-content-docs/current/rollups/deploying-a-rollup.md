---
slug: /rollups/deploying-a-rollup
title: Déployer un Rollup
sidebar_label: Déployer un Rollup
sidebar_position: 3
---

# Déployer un Rollup

Vous pouvez mettre en place un rollup spécifique à une application de trois façons : via le **Dashboard** (un formulaire de demande, et non une transaction on-chain), via la **CLI** de la chaîne (`qorechaind`, contrôle total sur la transaction on-chain), ou avec le **RDK TypeScript** (`@qorechain/rdk` plus le générateur `create-qorechain-rollup`), qui couvre aujourd'hui la configuration et les lectures. Cette page couvre les trois méthodes, ainsi que le cycle de vie de l'opérateur et les commandes de batch.

:::caution Capacité à un stade précoce
Aucun rollup n'a encore été créé sur l'un ou l'autre réseau. Les commandes ci-dessous utilisent le testnet **`qorechain-diana`** (chain ID EVM **9800**, version de chaîne **v3.2.2**). Le mainnet (**`qorechain-vladi`**, chain ID EVM **9801**) exécute la version de chaîne **v3.2.1** ; cette page décrit le comportement du mainnet, et la version plus récente du testnet peut différer dans le détail. Validez chaque déploiement sur testnet d'abord.
:::

:::note Frais et signature
Le réseau impose un prix du gas minimum de `0.1uqor`, donc un simple `--fees 500uqor` est refusé, et chaque transaction de la voie native nécessite la co-signature post-quantique hybride. Les exemples de CLI de cette page construisent donc la transaction avec `--generate-only` et la cosignent avec `qorechaind tx pqc cosign`, qui la signe et la diffuse (créez la clé une fois avec `qorechaind tx pqc gen-key`, puis enregistrez-la on-chain une fois avec `qorechaind tx pqc register-key`, ou via QoreX ou le SDK, qui le font pour vous). Les frais sont fixés lors de la génération du fichier non signé : définissez donc la limite de gas et les frais ensemble — les frais doivent être au moins égaux à la limite de gas × 0,1 uqor. Les limites de gas ci-dessous sont indicatives — simulez avant de vous y fier. Voir [Première transaction](/getting-started/first-transaction) et [Signature post-quantique](/developer-guide/post-quantum-signing).
:::

---

## Prérequis

| Prérequis | Détails |
| ----------- | ------- |
| **Stake minimum** | Au moins 10 000 QOR (`min_stake_for_rollup`) ; le stake est mis sous séquestre à la création du rollup |
| **Burn de création** | 1 % du stake que vous fournissez est brûlé définitivement à la création (une création qui ne peut pas appliquer le burn est refusée) ; le reste est conservé sous séquestre et restitué à l'arrêt du rollup |
| **Stake d'enregistrement de la couche** | La création enregistre aussi la couche du rollup dans le module multilayer, ce qui verrouille **1 000 QOR** supplémentaires (`min_sidechain_stake`) auprès du créateur, restitués lorsque la couche est désactivée à l'arrêt. Si la couche ne peut pas être enregistrée (solde trop faible, ou limite de 10 sidechains du multilayer atteinte), le rollup est tout de même créé mais n'a pas de couche, de sorte que ses batches ne peuvent pas être ancrés |
| **ID du rollup** | Utilisez 3 à 64 caractères : lettres minuscules, chiffres, `.`, `_` et `-`, en commençant par une lettre ou un chiffre. Les versions de chaîne plus récentes imposent cette règle, utilisez-la donc dès le départ |
| **Compte** | Un compte QoreChain approvisionné avec une clé post-quantique enregistrée, avec un solde suffisant pour le stake, le stake de la couche et les frais de transaction |

Interrogez les paramètres du module en direct pour connaître le stake minimum et le taux de burn actuels avant de déployer :

```bash
qorechaind query rdk config
```

---

## Déployer via le Dashboard (Tools → Rollups)

Le Dashboard propose un formulaire **Deploy a Rollup** sous **Tools → Rollups**. C'est un **formulaire de demande** : le soumettre enregistre une demande de provisionnement pour votre compte, examinée par **The Qore Trust**, et une nouvelle demande affiche un statut **provisioning**. Il ne diffuse **pas** de transaction `create-rollup` on-chain — pour enregistrer un rollup on-chain, utilisez la CLI ci-dessous.

### Étapes

1. **Connectez-vous.** Le formulaire nécessite une session authentifiée pour soumettre une demande et pour lister vos demandes existantes.
2. **Nommez votre rollup.** Saisissez un nom de rollup (2 à 41 caractères : lettres, chiffres, espaces, tirets ou underscores).
3. **Choisissez une machine virtuelle.** L'enregistrement on-chain stocke un libellé de VM. Votre rollup s'exécute off-chain dans son propre runtime ; ce choix ne s'exécute pas sur les voies EVM, CosmWasm ou SVM propres à QoreChain :
   * **EVM** — contrats Solidity / Vyper avec l'outillage Ethereum complet (Hardhat, Foundry, MetaMask)
   * **CosmWasm** — contrats intelligents Rust sur le runtime Cosmos SDK, avec IBC natif
   * **SVM** — la Solana Virtual Machine, pour les applications à exécution parallèle et haut débit
4. **Choisissez une couche de disponibilité des données.** L'endroit où votre rollup publie les données de transaction afin que quiconque puisse reconstruire l'état : **QoreChain DA**, **Celestia**, ou **EigenDA**. Notez qu'EigenDA est une option au niveau du Dashboard, tandis que les backends DA on-chain du module `x/rdk` sont native, Celestia, ou les deux — voir [Data Availability](/rollups/data-availability).
5. **Définissez un gas token.** Le token utilisé pour payer l'exécution sur votre rollup. Par défaut **QOR** ; saisissez un symbole personnalisé pour utiliser votre propre token natif.
6. **Choisissez un séquenceur.** Qui ordonne les transactions avant le règlement : **Shared sequencer** (l'ensemble partagé de QoreChain), **Dedicated (single)** (exécutez votre propre séquenceur unique), ou **Decentralized** (un ensemble de séquenceurs sans permission).
7. **Choisissez une cible de règlement.** Où le rollup ancre ses racines d'état et ses preuves de validité : **QoreChain mainnet** ou **Ethereum**.
8. **Soumettez la demande.** Le provisionnement est examiné par **The Qore Trust**, donc une demande fraîchement soumise apparaît avec un statut **provisioning** jusqu'à la fin de l'examen.

Vos demandes soumises apparaissent dans la liste **Your rollups** avec leur VM, leur couche DA, leur gas token, leur séquenceur, leur cible de règlement et leur statut actuel.

:::note
Les options du formulaire (machine virtuelle, couche de disponibilité des données, gas token, séquenceur, cible de règlement) décrivent ce que vous demandez ; elles sont plus larges que ce que le module `x/rdk` on-chain prend actuellement en charge. On-chain, la disponibilité des données est `native` (Celestia n'est pas actif), et le séquençage est assuré par le créateur du rollup ou par une adresse de séquenceur configurée. Voir [Data Availability](/rollups/data-availability).
:::

---

## Déployer via la CLI

La CLI crée le rollup directement on-chain. `create-rollup` prend trois arguments positionnels — l'ID du rollup, un profil, et le montant du stake (en `uqor`) — plus un flag optionnel `--vm`.

:::tip
Depuis la version de chaîne **v3.1.74**, `create-rollup` **applique automatiquement le preset du profil choisi** — le mode de règlement, le séquenceur, la DA, le modèle de gas et la VM proviennent tous du preset. Vous n'avez plus besoin de les définir manuellement (auparavant le message codait en dur une configuration souveraine). Le flag `--vm` **est désormais vide par défaut**, de sorte que la VM du profil s'applique sauf si vous la remplacez explicitement.
:::

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 600000 --fees 60000uqor \
  --generate-only > create-rollup.json
```

**Exemple** — créez un rollup à partir du preset `defi` (le règlement, le séquenceur, la DA et la VM proviennent tous du preset ; `defi` se résout en règlement zk sur l'EVM). Construisez la transaction non signée, puis joignez la co-signature post-quantique et diffusez :

```bash
# 1. Build the unsigned transaction (10,000 QOR stake)
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 600000 --fees 60000uqor \
  --generate-only > create-rollup.json

# 2. Cosign with your post-quantum key and broadcast
qorechaind tx pqc cosign create-rollup.json \
  --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

Un profil ZK tel que `defi` est accepté à la création, mais un rollup créé de cette façon ne porte pas de clé de vérification, de sorte que ses batches ZK ne peuvent pas encore être finalisés (voir [ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)).

**Flags :**

| Flag | Défaut | Description |
| ---- | ------- | ----------- |
| `--vm` | *(vide — utilise la VM du profil)* | Remplace le type de VM du rollup : `evm`, `cosmwasm`, `svm`, ou `custom`. Laissez non défini pour appliquer la VM du preset. (Dans les clients RDK, le runtime Wasm est le type de VM **`native`** — QoreChain Native — avec `cosmwasm` conservé comme alias hérité ; `cosmwasm` est la valeur sur le fil, celle que prend ce flag au niveau de la chaîne.) |

:::note Le libellé de VM est une métadonnée
`--vm` enregistre le runtime utilisé par votre rollup. La chaîne hôte ne fait que régler le rollup ; elle n'exécute pas ses contrats. Le téléversement CosmWasm de la chaîne hôte est actuellement fermé et sa voie de transactions SVM est désactivée sur l'ensemble du réseau, ce qui n'affecte pas le règlement d'un rollup off-chain mais signifie que vous ne pouvez pas déployer de contrats pour un rollup sur ces voies de la chaîne hôte.
:::

L'argument `[profile]` sélectionne une configuration prédéfinie appliquée automatiquement — voir **[Preset Profiles](/rollups/preset-profiles)**. Le `[stake-amount]` est le dépôt en `uqor` ; le burn de création en représente 1 %.

### Inspecter ce que vous avez déployé

```bash
# Query a specific rollup by ID
qorechaind query rdk rollup my-defi-rollup

# List all registered rollups
qorechaind query rdk list-rollups
```

---

## Déployer avec le RDK TypeScript (`@qorechain/rdk`) {#deploy-with-the-typescript-rdk-qorechainrdk}

Le Rollup Development Kit est publié sous forme de deux packages npm publics pour le même module on-chain `x/rdk` que la CLI. Aujourd'hui, ils sont surtout utiles pour construire et valider des configurations et pour lire l'état ; consultez l'avertissement sur la signature ci-dessous avant de vous appuyer sur eux pour envoyer des transactions :

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)** (`v0.4.4`) — le SDK TypeScript : un constructeur de configuration avec des profils prédéfinis, des helpers de transaction pour les cycles de vie du rollup et des batches de règlement, la DA native, des clients de lecture typés, et les ajouts de la v0.4 — les reçus de règlement à sécurité post-quantique, le QCAI Rollup Copilot, des helpers de calldata cross-VM, et le watchtower.
* **`create-qorechain-rollup`** (`v0.4.4`) — un générateur qui clone un template de démarrage exécutable par profil (y compris le template `multivm-rollup`).

Ces packages sont publiés sur npm. Le dépôt fournit également une CLI opérateur publiée, **`@qorechain/rdk-cli`** (`qorollup`, `v0.4.4`), avec les commandes `doctor`, `create`, `status`, `watch`, `params`, `suggest`, le cycle de vie (`pause`/`resume`/`stop`), `keygen`, `manifest`, `withdraw`, et `faucet`, plus les commandes v0.4 `receipt`, `advise`, et `watchtower`.

Points marquants depuis la version initiale v0.4.0 :

* **v0.4.2 — fonctionne avec le réseau en production dès l'installation.** Les presets `mainnet` et `testnet` intègrent désormais les endpoints publics `qore.host` (REST sur `api.qore.host` / `api-testnet.qore.host`), de sorte que `createRdkClient({ network })` atteint la chaîne sans `endpoints` manuel — ne la remplacez que pour cibler votre propre nœud. La même version a renommé l'identifiant de VM du rollup Wasm en **`native`** (QoreChain Native) ; `cosmwasm` reste un alias hérité accepté, et les deux se mappent sur `cosmwasm` sur le fil — la chaîne, l'explorateur et le Dashboard sont inchangés.
* **v0.4.3 — mise à jour de dépendance pour la correction de l'encodage de la signature hybride du SDK.** Le client de transaction du RDK lui-même signe toujours en mode classique uniquement (voir l'avertissement ci-dessous).
* **v0.4.4 — suit `@qorechain/sdk` `^0.7.0`**, la version du SDK pour les voies d'authentificateur de la chaîne **v3.1.85**, de sorte que ces capacités atteignent directement les utilisateurs TypeScript du RDK via le SDK. Aucun changement d'API du RDK.

:::caution Signer avec les clients publiés
Les deux réseaux exigent une signature hybride (secp256k1 + ML-DSA-87) sur chaque transaction de la voie native. Le package npm publié actuellement (`@qorechain/rdk` 0.4.4) signe via un client en mode classique uniquement : il peut donc **lire** l'état de la chaîne mais ne peut pas faire accepter une transaction. Pour les transactions aujourd'hui, construisez et signez avec la CLI (`--generate-only`, puis `qorechaind tx pqc cosign`) ou avec la signature hybride de [`@qorechain/sdk`](/sdk/overview). Les clients RDK Python, Go, Rust et Java signent aussi en mode classique uniquement et **ne conviennent pas aux transactions** sur ces réseaux. Vérifiez la version que vous installez ; les versions qui ajouteront la signature hybride aux clients RDK seront signalées ici.
:::

:::note Les lectures nécessitent les routes REST du RDK
Les helpers de lecture TypeScript (`rdk.params()`, `rdk.rest.getRollup()`) appellent des routes REST `/qorechain/rdk/v1/…`, que les endpoints publics du mainnet ne servent pas aujourd'hui. Sur le mainnet, utilisez `qorechaind query rdk …` (gRPC).
:::

#### Clients Python, Go, Rust et Java

Aux côtés du package TypeScript, le RDK fournit des clients **Python**, **Go**, **Rust** et **Java** complets qui reflètent la surface TypeScript : le constructeur de configuration avec validation, les cinq profils prédéfinis, les utilitaires denom/economics/bech32, les helpers de Merkle binaire et de preuve de retrait, les manifestes de rollup, les clients de lecture REST et JSON-RPC `qor_`, les vérifications préalables/de santé, les comptes (mnémonique → adresse `qor`), et la signature de transaction classique + diffusion (`SIGN_MODE_DIRECT`, non acceptée sur les réseaux à signature hybride — voir l'avertissement ci-dessus). Tous sont vérifiés par rapport à des vecteurs de référence partagés inter-langages et sont **publiés** sur leurs registres respectifs :

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

Versions actuellement publiées : Python `qorechain-rdk` **0.5.0** (PyPI, import `qorrdk`), module Go `github.com/qorechain/qorechain-rdk/packages/go` (**v0.5.0**), Rust `qorechain-rdk` **0.4.4** (crates.io) et Java `io.github.qorechain:qorechain-rdk` **0.4.4** (Maven Central). Ces clients lisent l'état de la chaîne ; ils ne produisent pas la signature hybride exigée par les réseaux (voir l'avertissement ci-dessus).

:::note
Le RDK TypeScript et ses templates ciblent par défaut le testnet **`qorechain-diana`**, et depuis la v0.4.2 les presets atteignent les endpoints publics en production dès l'installation. Épinglez les versions et validez sur testnet avant le mainnet.
:::

### Générer un projet avec `create-qorechain-rollup` {#scaffold-a-project-with-create-qorechain-rollup}

Chaque profil possède un template de démarrage correspondant (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`). Générez-en un avec l'une des deux formes :

```bash
npm create qorechain-rollup my-rollup
# or
npx create-qorechain-rollup my-rollup
```

Pour une utilisation non interactive / CI, passez le template et le réseau explicitement :

```bash
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --yes
```

Le générateur affiche le coût documenté du stake et du burn de création, ainsi que les prochaines étapes pour créer votre rollup et consulter son statut.

:::caution Vérifiez la version du RDK installée par le template
Les templates épinglent actuellement `@qorechain/rdk` sur la série 0.2. Après la génération, exécutez `npm install @qorechain/rdk@latest` afin d'obtenir les presets d'endpoints publics `qore.host` et les clients de lecture actuels. Le script `submit-batch` du projet de démarrage n'est qu'un flux de référence : il envoie des racines illustratives et une preuve d'exemple, et il n'est pas censé finaliser un batch sur un réseau en production.
:::

### Construire une configuration de rollup depuis du code

Construisez une configuration à partir d'un preset, lisez le stake et le taux de burn en direct depuis la chaîne, puis produisez le message de création. Le constructeur de configuration applique la matrice de compatibilité règlement → preuve lors de `validate()` / `build()`. Soumettez les valeurs obtenues avec la CLI ci-dessus (ou avec un client qui signe en mode hybride) — voir l'avertissement sur la signature.

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// A config builder pre-filled with the defi preset's defaults; override via .set({ ... }).
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

// The public qore.host endpoints are baked into the presets (RDK ≥ 0.4.2).
// `params()` is a REST read: it works where the RDK REST routes are served and
// is refused (HTTP 501) on mainnet today — use `qorechaind query rdk config` there.
const rdk = createRdkClient({ network: "testnet" });

// Read the live module parameters — never hardcode the stake or burn rate.
const params = await rdk.params();
const cost = estimateCreationCost({
  stakeUqor: params.minStakeForRollup,
  burnRate: params.rollupCreationBurnRate,
});
console.log(`Stake: ${uqorToQor(cost.stakeUqor)} QOR — burned: ${uqorToQor(cost.burnUqor)} QOR`);

// The values to pass to `qorechaind tx rdk create-rollup`.
const msg = config.toCreateMsg("<your qor address>", { stakeAmount: params.minStakeForRollup });
console.log(msg.rollupId, msg.profile, msg.vmType, msg.stakeAmount);
```

Vous ne savez pas quel profil convient ? `rdk.suggestProfile(...)` est censé renvoyer une recommandation assistée par le QCAI ; sur les endpoints publics actuels, il renvoie toujours le repli `defi` (`source: "fallback"`), choisissez donc à partir du [tableau des profils](/rollups/preset-profiles).

### Lire l'état depuis le code

Le client REST typé ne nécessite aucun signataire, et fonctionne là où les routes REST du RDK sont servies (pas sur le mainnet aujourd'hui) :

```ts
const rollup = await rdk.rest.getRollup("my-defi-rollup");
console.log(rollup.status, rollup.settlementMode, rollup.daBackend, rollup.vmType);
```

Pour les batches, utilisez `qorechaind query rdk batch [rollup-id]` (ci-dessous).

---

## Gestion du cycle de vie

Un rollup passe par les états `pending`, `active`, `paused`, et `stopped` ; un nouveau rollup démarre immédiatement à l'état `active`. Seul le créateur peut le mettre en pause, le reprendre ou l'arrêter (appliqué depuis la version de chaîne v3.2.0). Chaque commande ci-dessous suit le même schéma en deux étapes que la création : générer la transaction non signée, puis la cosigner.

### Pause

Suspendre temporairement le rollup. L'état est préservé et le rollup peut être repris. Une chaîne de caractères indiquant la raison est requise.

```bash
qorechaind tx rdk pause-rollup [rollup-id] [reason] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > pause.json
qorechaind tx pqc cosign pause.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

### Reprise

Reprendre un rollup précédemment mis en pause.

```bash
qorechaind tx rdk resume-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > resume.json
qorechaind tx pqc cosign resume.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

### Arrêt

Décommissionner définitivement le rollup et libérer son stake. Le QOR staké — moins le burn de création unique — est restitué au créateur. Le stake d'enregistrement de la couche de 1 000 QOR est restitué séparément lorsque la couche du rollup est désactivée.

```bash
qorechaind tx rdk stop-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > stop.json
qorechaind tx pqc cosign stop.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

:::danger
Arrêter un rollup est définitif. Le rollup ne peut pas être redémarré une fois arrêté.
:::

---

## Commandes opérateur : batches et challenges

Les opérateurs de rollup soumettent des batches de règlement, et les challengers peuvent contester des batches optimistes. Ces commandes sous-tendent la couche de règlement décrite dans **[Rollups Overview](/rollups/overview)** et **[ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)**.

### Qui peut soumettre, et dans quel ordre

* **Seule l'adresse de séquenceur configurée du rollup — ou, lorsqu'aucune n'est configurée (c'est le cas de tous les presets), son créateur — peut soumettre des batches.** Le séquençage basé (based) et partagé n'admet pas encore d'ensembles de proposeurs ni de listes : ce ne sont aujourd'hui que des libellés, et c'est le créateur qui soumet.
* Les batches forment une chaîne : le premier batch a l'index `0` ; chaque batch suivant doit utiliser l'index suivant et porter la racine d'état du batch précédent comme `prev_state_root`.
* Un batch qui porte un hash de données sur un rollup `native` ou `both` est refusé tant qu'un blob correspondant n'est pas déjà stocké (voir [Data Availability](/rollups/data-availability)). Un batch sans hash de données n'est pas vérifié.
* Un rollup `zk` doit joindre une preuve, et cette preuve doit être vérifiée (voir [ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)).

### Soumettre un batch

Soumettre un batch de règlement pour un rollup. Prend l'ID du rollup, un index de batch, et une racine d'état encodée en hexadécimal.

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > batch.json
qorechaind tx pqc cosign batch.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

La commande CLI ne prend que ces trois arguments positionnels : elle ne peut donc soumettre que le **batch 0** ; les batches suivants nécessitent un client capable de définir `prev_state_root` (et, le cas échéant, `data_hash`, `withdrawals_root` et `tx_count`). Les batches d'un rollup sont réglés mais **ne sont pas ancrés** dans `x/multilayer` sur le mainnet aujourd'hui (voir [Rollup Development Kit](/architecture/rollup-development-kit#state-anchoring)).

### Contester un batch (rollups optimistes) {#challenge-a-batch-optimistic-rollups}

Tout compte peut contester un batch `submitted` pendant la fenêtre de contestation en déposant une caution (le `challenge_bond` du rollup ; 1 000 QOR pour les presets `nft` et `custom`) et une preuve de fraude. Prend l'ID du rollup et l'index du batch ; passez la preuve de fraude avec `--proof` :

```bash
qorechaind tx rdk challenge-batch [rollup-id] [batch-index] \
  --proof <hex-encoded-fraud-proof> \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > challenge.json
qorechaind tx pqc cosign challenge.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

| Flag | Description |
| ---- | ----------- |
| `--proof` | Preuve de fraude encodée en hexadécimal |

Une contestation **gèle** le batch (`challenged`) : il ne peut pas être finalisé. Le **créateur** du rollup le résout ensuite avec un message resolve-challenge (non exposé comme commande CLI ; utilisez un client). La chaîne décide elle-même du résultat en vérifiant la preuve stockée. Si la fraude est confirmée, le batch est `rejected`, la caution est restituée et le challenger reçoit un montant supplémentaire égal à la caution, prélevé sur le stake du rollup ; si la contestation est rejetée, la caution revient au créateur et le batch repasse à l'état `submitted`.

### Inspecter les batches

```bash
# Latest batch for a rollup
qorechaind query rdk batch [rollup-id]

# A specific batch by index
qorechaind query rdk batch [rollup-id] --index 42
```

---

## Requêtes

| Commande | Objectif |
| ------- | ------- |
| `qorechaind query rdk rollup [rollup-id]` | Détails d'un rollup spécifique |
| `qorechaind query rdk list-rollups` | Tous les rollups enregistrés |
| `qorechaind query rdk batch [rollup-id]` | Dernier batch de règlement (ou `--index`) |
| `qorechaind query rdk config` | Paramètres du module RDK |
| `qorechaind query rdk suggest-profile [use-case]` | Affiche un renvoi vers le RPC `qor_suggestRollupProfile` ; les endpoints publics ne le servent pas, choisissez donc un profil dans le tableau des [Preset Profiles](/rollups/preset-profiles) |

---

## Prochaines étapes

* **[Data Availability](/rollups/data-availability)** — backends DA native, Celestia, et redondant.
* **[ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)** — vérification de preuves et flux de retrait L2 → L1 via `execute-withdrawal`.
