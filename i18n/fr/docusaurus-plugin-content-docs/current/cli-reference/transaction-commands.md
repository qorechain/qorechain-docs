---
slug: /cli-reference/transaction-commands
title: Commandes de transaction
sidebar_label: Commandes de transaction
sidebar_position: 2
---

# Commandes de transaction

Toutes les commandes de transaction suivent le modèle :

```bash
qorechaind tx <module> <command> [args] [flags]
```

:::note
Définissez `--chain-id qorechain-vladi` pour diffuser sur le mainnet en service (version de chaîne **v3.1.77**), ou `--chain-id qorechain-diana` pour le testnet. S'il est omis, le client utilise le `chain-id` de votre configuration locale.
:::

Des indicateurs communs s'appliquent à chaque sous-commande `tx` :

| Indicateur                | Type   | Description                                     |
| ------------------- | ------ | ----------------------------------------------- |
| `--from`            | string | Nom ou adresse de la clé de signature              |
| `--chain-id`        | string | Identifiant de la chaîne (par défaut : depuis la configuration)         |
| `--fees`            | string | Frais de transaction (par ex. `500uqor`)              |
| `--gas`             | string | Limite de gas ou `auto` pour l'estimation              |
| `--gas-adjustment`  | float  | Multiplicateur de gas avec `auto` (par défaut : 1.0) |
| `--keyring-backend` | string | Backend de trousseau : `os`, `file`, `test`           |
| `--node`            | string | Point d'accès RPC (par défaut : `tcp://localhost:26657`) |
| `--broadcast-mode`  | string | `sync`, `async` ou `block`                     |
| `-y`                | bool   | Ignore l'invite de confirmation                        |

---

## bank

### send

Transfère des tokens d'un compte à un autre.

```bash
qorechaind tx bank send <from_address> <to_address> <amount> [flags]
```

---

## staking

### create-validator

Crée un nouveau validateur sur le réseau.

```bash
qorechaind tx staking create-validator [flags]
```

| Indicateur                           | Type   | Description                                  |
| ------------------------------ | ------ | -------------------------------------------- |
| `--amount`                     | string | Montant d'auto-délégation (par ex. `1000000uqor`) |
| `--pubkey`                     | string | Clé publique de consensus du validateur (JSON)        |
| `--moniker`                    | string | Nom d'affichage du validateur                       |
| `--commission-rate`            | string | Taux de commission initial (par ex. `0.10`)       |
| `--commission-max-rate`        | string | Taux de commission maximal                      |
| `--commission-max-change-rate` | string | Taux de variation quotidien maximal de la commission         |
| `--min-self-delegation`        | string | Auto-délégation minimale requise             |

### edit-validator

Modifie la description ou la commission d'un validateur existant.

```bash
qorechaind tx staking edit-validator [flags]
```

### delegate

Délègue des tokens à un validateur.

```bash
qorechaind tx staking delegate <validator_address> <amount> [flags]
```

### redelegate

Déplace une délégation d'un validateur à un autre.

```bash
qorechaind tx staking redelegate <src_validator> <dst_validator> <amount> [flags]
```

### unbond

Effectue le unbonding de tokens depuis un validateur.

```bash
qorechaind tx staking unbond <validator_address> <amount> [flags]
```

---

## distribution

### withdraw-all-rewards

Retire toutes les récompenses de staking en attente.

```bash
qorechaind tx distribution withdraw-all-rewards [flags]
```

### withdraw-rewards

Retire les récompenses d'un validateur spécifique.

```bash
qorechaind tx distribution withdraw-rewards <validator_address> [flags]
```

| Indicateur           | Type | Description                        |
| -------------- | ---- | ---------------------------------- |
| `--commission` | bool | Retire également la commission du validateur |

---

## gov

### submit-proposal

Soumet une proposition de gouvernance.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> [flags]
```

Le fichier de proposition est un document JSON spécifiant le type de proposition, le titre, la description et les éventuels messages à exécuter.

### vote

Vote sur une proposition active.

```bash
qorechaind tx gov vote <proposal_id> <option> [flags]
```

Options de vote : `yes`, `no`, `abstain`, `no_with_veto`.

### deposit

Ajoute un dépôt à une proposition.

```bash
qorechaind tx gov deposit <proposal_id> <amount> [flags]
```

---

## pqc

Le chemin de transaction cosmos requiert une signature hybride par défaut (`hybrid_signature_mode = required`). Les commandes `gen-key` et `cosign` produisent la clé Dilithium-5 (ML-DSA-87) et l'extension `PQCHybridSignature` nécessaires pour transiger sur le chemin cosmos aux côtés de la signature classique secp256k1.

### gen-key

Génère une clé post-quantique Dilithium-5 (ML-DSA-87) pour la signature hybride.

```bash
qorechaind tx pqc gen-key [flags]
```

### cosign

Attache une cosignature Dilithium-5 à une transaction sous forme d'extension `PQCHybridSignature`, produisant une transaction hybride (secp256k1 + ML-DSA-87). Requise pour les transactions du chemin cosmos sous le mode d'application `required` par défaut. Les outils standards CosmJS / relayer doivent produire cette extension pour transiger ; le `buildHybridTx` (avec `includePqcPublicKey`) du SDK QoreChain fait l'équivalent.

```bash
qorechaind tx pqc cosign <unsigned_tx_file> [flags]
```

### register-key

Enregistre une clé publique post-quantique pour un compte.

```bash
qorechaind tx pqc register-key <algorithm> <pubkey_hex> [flags]
```

### register-key-v2

Enregistre une clé PQC avec des métadonnées étendues et une attestation.

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> [flags]
```

| Indicateur            | Type   | Description                    |
| --------------- | ------ | ------------------------------ |
| `--attestation` | string | Données d'attestation TEE (hex)     |
| `--metadata`    | string | Métadonnées de clé supplémentaires (JSON) |

### migrate-key

Migre une clé classique existante vers une paire de clés PQC hybride.

```bash
qorechaind tx pqc migrate-key <algorithm> <pqc_pubkey_hex> [flags]
```

---

## xqore

### lock

Verrouille des tokens QOR dans une position de staking de gouvernance xQORE.

```bash
qorechaind tx xqore lock <amount> [flags]
```

| Indicateur              | Type   | Description                                |
| ----------------- | ------ | ------------------------------------------ |
| `--lock-duration` | string | Durée de verrouillage (par ex. `30d`, `90d`, `180d`) |

### unlock

Déverrouille du xQORE vers du QOR. Un déverrouillage anticipé peut entraîner des pénalités selon le palier de pénalité.

```bash
qorechaind tx xqore unlock <amount> [flags]
```

---

## bridge

### deposit

Initie un dépôt de bridge depuis une chaîne externe.

```bash
qorechaind tx bridge deposit <chain_id> <amount> <asset> [flags]
```

| Indicateur          | Type   | Description                    |
| ------------- | ------ | ------------------------------ |
| `--recipient` | string | Adresse destinataire sur QoreChain |

### withdraw

Initie un retrait de bridge vers une chaîne externe.

```bash
qorechaind tx bridge withdraw <chain_id> <amount> <asset> <destination_address> [flags]
```

---

## crossvm

### call

Envoie un message inter-VM entre environnements d'exécution (EVM, CosmWasm, SVM).

```bash
qorechaind tx crossvm call <target_vm> <contract_address> <payload_hex> [flags]
```

| Indicateur          | Type   | Description                          |
| ------------- | ------ | ------------------------------------ |
| `--source-vm` | string | VM source : `evm`, `cosmwasm`, `svm`  |
| `--gas-limit` | uint   | Limite de gas pour l'exécution inter-VM |

### process-queue

Traite manuellement les messages inter-VM en attente (commande opérateur).

```bash
qorechaind tx crossvm process-queue [flags]
```

---

## svm

### deploy-program

Déploie un programme BPF dans le runtime SVM.

```bash
qorechaind tx svm deploy-program <program_binary_path> [flags]
```

| Indicateur           | Type   | Description                  |
| -------------- | ------ | ---------------------------- |
| `--program-id` | string | ID de programme facultatif (base58) |

### execute

Exécute une instruction sur un programme SVM déployé.

```bash
qorechaind tx svm execute <program_id> <instruction_data_hex> [flags]
```

| Indicateur         | Type   | Description                                         |
| ------------ | ------ | --------------------------------------------------- |
| `--accounts` | string | Clés publiques de comptes séparées par des virgules pour l'instruction |

### create-account

Crée un nouveau compte SVM avec un espace de données alloué.

```bash
qorechaind tx svm create-account <pubkey> <space> [flags]
```

| Indicateur      | Type   | Description                                     |
| --------- | ------ | ----------------------------------------------- |
| `--owner` | string | Programme propriétaire (base58, par défaut : programme système) |

---

## multilayer

### register-sidechain

Enregistre une nouvelle couche sidechain.

```bash
qorechaind tx multilayer register-sidechain <layer-id> <description> [flags]
```

| Indicateur                    | Type   | Description                                          |
| ----------------------- | ------ | --------------------------------------------------- |
| `--block-time-ms`       | uint   | Temps de bloc cible en ms (par défaut 2000)              |
| `--domains`             | string | Domaines pris en charge séparés par des virgules (par défaut `defi`)  |
| `--max-tx`              | uint   | Nombre max de transactions par bloc (par défaut 1000)           |
| `--min-validators`      | uint32 | Taille minimale de l'ensemble des validateurs (par défaut 1)              |
| `--settlement-interval` | uint   | Intervalle de règlement en blocs (par défaut 100)         |
| `--vm-types`            | string | Types de VM pris en charge séparés par des virgules (par défaut `evm`)  |

### register-paychain

Enregistre une nouvelle couche paychain pour les microtransactions à haute fréquence.

```bash
qorechaind tx multilayer register-paychain <layer-id> <description> [flags]
```

| Indicateur                    | Type | Description                                  |
| ----------------------- | ---- | -------------------------------------------- |
| `--max-tx`              | uint | Nombre max de transactions par bloc (par défaut 5000)    |
| `--settlement-interval` | uint | Intervalle de règlement en blocs (par défaut 50)   |

### anchor-state

Soumet un ancrage d'état (règlement) pour une couche enregistrée.

```bash
qorechaind tx multilayer anchor-state <layer-id> <layer-height> <state-root-hex> <pqc-agg-sig-hex> [flags]
```

### route-tx

Route une transaction vers la couche optimale.

```bash
qorechaind tx multilayer route-tx <tx_data_hex> [flags]
```

| Indicateur             | Type   | Description                       |
| ---------------- | ------ | --------------------------------- |
| `--target-layer` | string | Force le routage vers une couche spécifique |

### update-layer-status

Met à jour le statut opérationnel d'une couche (opérateur uniquement).

```bash
qorechaind tx multilayer update-layer-status <layer_id> <status> [flags]
```

Valeurs de statut : `active`, `paused`, `draining`.

### challenge-anchor

Soumet une contestation par preuve de fraude contre un ancrage d'état.

```bash
qorechaind tx multilayer challenge-anchor <layer_id> <anchor_hash> <proof_hex> [flags]
```

---

## rdk

### create-rollup

Enregistre un nouveau rollup avec le Kit de développement de rollups.

```bash
qorechaind tx rdk create-rollup <rollup_id> [flags]
```

| Indicateur                | Type   | Description                                          |
| ------------------- | ------ | ---------------------------------------------------- |
| `--settlement-type` | string | `optimistic`, `zk`, `pessimistic`, `sovereign`       |
| `--profile`         | string | Préréglage : `defi`, `gaming`, `nft`, `enterprise`, `custom` |
| `--stake`           | string | Montant du stake de l'opérateur                                |
| `--da-enabled`      | bool   | Active la disponibilité native des données                      |

### submit-batch

Soumet un lot de règlement pour un rollup.

```bash
qorechaind tx rdk submit-batch <rollup_id> <state_root_hex> <batch_data_path> [flags]
```

### challenge-batch

Soumet une contestation par preuve de fraude contre un lot de règlement (rollups optimistic).

```bash
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> <proof_hex> [flags]
```

### finalize-batch

Finalise manuellement un lot ayant dépassé la fenêtre de contestation.

```bash
qorechaind tx rdk finalize-batch <rollup_id> <batch_index> [flags]
```

### pause-rollup

Met en pause un rollup (opérateur uniquement).

```bash
qorechaind tx rdk pause-rollup <rollup_id> [flags]
```

### resume-rollup

Reprend un rollup en pause (opérateur uniquement).

```bash
qorechaind tx rdk resume-rollup <rollup_id> [flags]
```

### stop-rollup

Arrête définitivement un rollup et libère son stake (opérateur uniquement).

```bash
qorechaind tx rdk stop-rollup <rollup_id> [flags]
```

:::note
Le retrait de rollup et le règlement inter-couches sont également exposés sous le groupe de transactions `rdk` (par exemple, une commande `execute-withdrawal` qui règle un retrait prouvé contre un lot finalisé). Les arguments et indicateurs exacts dépendent du type de règlement et de la configuration DA de votre rollup ; consultez la documentation du **Kit de développement de rollups** pour la surface de commande faisant autorité avant de construire ces transactions.
:::

---

## babylon

### submit-btc-checkpoint

Soumet un checkpoint BTC pour une époque.

```bash
qorechaind tx babylon submit-btc-checkpoint <epoch> <checkpoint_hex> [flags]
```

### btc-restake

Restake du BTC via l'intégration Babylon.

```bash
qorechaind tx babylon btc-restake <amount> [flags]
```

| Indicateur            | Type   | Description                       |
| --------------- | ------ | --------------------------------- |
| `--btc-tx-hash` | string | Hachage de transaction Bitcoin comme preuve |

---

## abstractaccount

### create

Crée un compte abstrait avec des règles de dépense programmables.

```bash
qorechaind tx abstractaccount create [flags]
```

| Indicateur               | Type   | Description                       |
| ------------------ | ------ | --------------------------------- |
| `--spending-rules` | string | Fichier JSON définissant les règles de dépense |

### update-spending-rules

Met à jour les règles de dépense d'un compte abstrait existant.

```bash
qorechaind tx abstractaccount update-spending-rules <rules_file.json> [flags]
```

---

## rlconsensus

PRISM est la couche d'apprentissage par renforcement qui ajuste les paramètres de consensus. Ces commandes contrôlent l'agent PRISM ; le nom de module CLI `rlconsensus` et ses sous-commandes sont conservés tels quels.

### set-agent-mode

Définit le mode opérationnel de l'agent PRISM (gouvernance uniquement).

```bash
qorechaind tx rlconsensus set-agent-mode <mode> [flags]
```

Valeurs de mode : `0` (off), `1` (observe), `2` (suggest), `3` (auto).

### resume-agent

Reprend l'agent PRISM après le déclenchement d'un coupe-circuit.

```bash
qorechaind tx rlconsensus resume-agent [flags]
```

### update-policy

Met à jour la configuration de politique de l'agent PRISM (gouvernance uniquement).

```bash
qorechaind tx rlconsensus update-policy <policy_file.json> [flags]
```

### update-reward-weights

Met à jour la configuration des poids de récompense de l'agent PRISM.

```bash
qorechaind tx rlconsensus update-reward-weights [flags]
```

| Indicateur                  | Type   | Description                  |
| --------------------- | ------ | ---------------------------- |
| `--throughput-weight` | string | Poids pour la récompense de débit |
| `--latency-weight`    | string | Poids pour la récompense de latence    |
| `--security-weight`   | string | Poids pour la récompense de sécurité   |
