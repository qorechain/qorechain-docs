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
Définissez `--chain-id qorechain-vladi` pour diffuser vos transactions sur le mainnet en production (version de chaîne **v3.1.82**), ou `--chain-id qorechain-diana` pour le testnet. Si ce paramètre est omis, le client utilise le `chain-id` de votre configuration locale.
:::

Les drapeaux communs s'appliquent à chaque sous-commande `tx` :

| Drapeau             | Type   | Description                                              |
| ------------------- | ------ | -------------------------------------------------------- |
| `--from`            | string | Nom ou adresse de la clé de signature                     |
| `--chain-id`        | string | Identifiant de la chaîne (par défaut : depuis la config)  |
| `--fees`            | string | Frais de transaction (p. ex. `500uqor`)                   |
| `--gas`             | string | Limite de gaz ou `auto` pour une estimation               |
| `--gas-adjustment`  | float  | Multiplicateur de gaz avec `auto` (par défaut : 1.0)      |
| `--keyring-backend` | string | Backend du trousseau : `os`, `file`, `test`               |
| `--node`            | string | Point de terminaison RPC (par défaut : `tcp://localhost:26657`) |
| `--broadcast-mode`  | string | `sync`, `async` ou `block`                                |
| `-y`                | bool   | Ignorer l'invite de confirmation                          |

---

## bank

### send

Transférer des jetons d'un compte à un autre.

```bash
qorechaind tx bank send <from_address> <to_address> <amount> [flags]
```

---

## staking

### create-validator

Créer un nouveau validateur sur le réseau.

```bash
qorechaind tx staking create-validator [flags]
```

| Drapeau                        | Type   | Description                                        |
| ------------------------------ | ------ | -------------------------------------------------- |
| `--amount`                     | string | Montant d'auto-délégation (p. ex. `1000000uqor`)   |
| `--pubkey`                     | string | Clé publique de consensus du validateur (JSON)     |
| `--moniker`                    | string | Nom d'affichage du validateur                      |
| `--commission-rate`            | string | Taux de commission initial (p. ex. `0.10`)         |
| `--commission-max-rate`        | string | Taux de commission maximal                         |
| `--commission-max-change-rate` | string | Taux de variation quotidienne maximal de la commission |
| `--min-self-delegation`        | string | Auto-délégation minimale requise                   |

### edit-validator

Modifier la description ou la commission d'un validateur existant.

```bash
qorechaind tx staking edit-validator [flags]
```

### delegate

Déléguer des jetons à un validateur.

```bash
qorechaind tx staking delegate <validator_address> <amount> [flags]
```

### redelegate

Déplacer une délégation d'un validateur vers un autre.

```bash
qorechaind tx staking redelegate <src_validator> <dst_validator> <amount> [flags]
```

### unbond

Retirer (unbond) des jetons délégués à un validateur.

```bash
qorechaind tx staking unbond <validator_address> <amount> [flags]
```

---

## distribution

### withdraw-all-rewards

Retirer toutes les récompenses de staking en attente.

```bash
qorechaind tx distribution withdraw-all-rewards [flags]
```

### withdraw-rewards

Retirer les récompenses d'un validateur spécifique.

```bash
qorechaind tx distribution withdraw-rewards <validator_address> [flags]
```

| Drapeau        | Type | Description                                     |
| -------------- | ---- | ----------------------------------------------- |
| `--commission` | bool | Retirer également la commission du validateur   |

---

## gov

### submit-proposal

Soumettre une proposition de gouvernance.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> [flags]
```

Le fichier de proposition est un document JSON qui spécifie le type de proposition, le titre, la description et les éventuels messages à exécuter.

### vote

Voter sur une proposition active.

```bash
qorechaind tx gov vote <proposal_id> <option> [flags]
```

Options de vote : `yes`, `no`, `abstain`, `no_with_veto`.

### deposit

Ajouter un dépôt à une proposition.

```bash
qorechaind tx gov deposit <proposal_id> <amount> [flags]
```

---

## pqc

Le chemin de transaction cosmos exige par défaut une signature hybride (`hybrid_signature_mode = required`). Les commandes `gen-key` et `cosign` produisent la clé Dilithium-5 (ML-DSA-87) et l'extension `PQCHybridSignature` nécessaires pour effectuer des transactions sur le chemin cosmos aux côtés de la signature classique secp256k1.

### gen-key

Générer une clé post-quantique Dilithium-5 (ML-DSA-87) pour la signature hybride.

```bash
qorechaind tx pqc gen-key [flags]
```

### cosign

Attacher une cosignature Dilithium-5 à une transaction sous forme d'extension `PQCHybridSignature`, produisant ainsi une transaction hybride (secp256k1 + ML-DSA-87). Obligatoire pour les transactions du chemin cosmos sous le mode d'application par défaut `required`. L'outillage standard CosmJS / relayer doit produire cette extension pour transiger ; la fonction `buildHybridTx` du SDK QoreChain (avec `includePqcPublicKey`) fait l'équivalent.

```bash
qorechaind tx pqc cosign <unsigned_tx_file> [flags]
```

### register-key

Enregistrer une clé publique post-quantique pour un compte.

```bash
qorechaind tx pqc register-key <algorithm> <pubkey_hex> [flags]
```

### register-key-v2

Enregistrer une clé PQC avec des métadonnées étendues et une attestation.

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> [flags]
```

| Drapeau         | Type   | Description                                  |
| --------------- | ------ | -------------------------------------------- |
| `--attestation` | string | Données d'attestation TEE (hex)              |
| `--metadata`    | string | Métadonnées supplémentaires de la clé (JSON) |

### migrate-key

Migrer une clé classique existante vers une paire de clés PQC hybride.

```bash
qorechaind tx pqc migrate-key <algorithm> <pqc_pubkey_hex> [flags]
```

---

## xqore

### lock

Verrouiller des jetons QOR dans une position de staking de gouvernance xQORE.

```bash
qorechaind tx xqore lock <amount> [flags]
```

| Drapeau           | Type   | Description                                            |
| ----------------- | ------ | ------------------------------------------------------ |
| `--lock-duration` | string | Durée de verrouillage (p. ex. `30d`, `90d`, `180d`)    |

### unlock

Déverrouiller des xQORE pour les reconvertir en QOR. Un déverrouillage anticipé peut entraîner des pénalités selon le palier de pénalité.

```bash
qorechaind tx xqore unlock <amount> [flags]
```

---

## bridge

### deposit

Initier un dépôt de pont depuis une chaîne externe.

```bash
qorechaind tx bridge deposit <chain_id> <amount> <asset> [flags]
```

| Drapeau       | Type   | Description                            |
| ------------- | ------ | -------------------------------------- |
| `--recipient` | string | Adresse du destinataire sur QoreChain  |

### withdraw

Initier un retrait de pont vers une chaîne externe.

```bash
qorechaind tx bridge withdraw <chain_id> <amount> <asset> <destination_address> [flags]
```

### update-chain-config

Activer ou reconfigurer le pont d'une chaîne en une seule transaction signée (disponible à partir de la version de chaîne **v3.1.80**). Nécessite la clé `bridge_admin` ou une licence `qcb_bridge` — aucune proposition de gouvernance ni mise à niveau de la chaîne n'est requise. Définit l'adresse du contrat, le nombre de confirmations, l'architecture et le statut.

```bash
qorechaind tx bridge update-chain-config <chain_id> [flags] --from bridge-admin
```

### set-verifier-bootstrap

Sélectionner le vérificateur actif d'une chaîne et installer sa racine de confiance (également réservé à `bridge_admin`).

```bash
qorechaind tx bridge set-verifier-bootstrap <chain_id> <verifier> [flags] --from bridge-admin
```

---

## crossvm

### call

Envoyer un message cross-VM entre environnements d'exécution (EVM, CosmWasm, SVM).

```bash
qorechaind tx crossvm call <target_vm> <contract_address> <payload_hex> [flags]
```

| Drapeau       | Type   | Description                                 |
| ------------- | ------ | ------------------------------------------- |
| `--source-vm` | string | VM source : `evm`, `cosmwasm`, `svm`        |
| `--gas-limit` | uint   | Limite de gaz pour l'exécution cross-VM     |

### process-queue

Traiter manuellement les messages cross-VM en attente (commande opérateur).

```bash
qorechaind tx crossvm process-queue [flags]
```

---

## svm

### deploy-program

Déployer un programme BPF sur l'environnement d'exécution SVM.

```bash
qorechaind tx svm deploy-program <program_binary_path> [flags]
```

| Drapeau        | Type   | Description                              |
| -------------- | ------ | ---------------------------------------- |
| `--program-id` | string | ID de programme facultatif (base58)      |

### execute

Exécuter une instruction sur un programme SVM déployé.

```bash
qorechaind tx svm execute <program_id> <instruction_data_hex> [flags]
```

| Drapeau      | Type   | Description                                                        |
| ------------ | ------ | ------------------------------------------------------------------ |
| `--accounts` | string | Clés publiques des comptes pour l'instruction, séparées par des virgules |

### create-account

Créer un nouveau compte SVM avec un espace de données alloué.

```bash
qorechaind tx svm create-account <pubkey> <space> [flags]
```

| Drapeau   | Type   | Description                                                        |
| --------- | ------ | ------------------------------------------------------------------ |
| `--owner` | string | Programme propriétaire (base58, par défaut : programme système)    |

---

## multilayer

### register-sidechain

Enregistrer une nouvelle couche sidechain.

```bash
qorechaind tx multilayer register-sidechain <layer-id> <description> [flags]
```

| Drapeau                 | Type   | Description                                                        |
| ----------------------- | ------ | ------------------------------------------------------------------ |
| `--block-time-ms`       | uint   | Temps de bloc cible en ms (par défaut 2000)                         |
| `--domains`             | string | Domaines pris en charge, séparés par des virgules (par défaut `defi`) |
| `--max-tx`              | uint   | Nombre maximal de transactions par bloc (par défaut 1000)           |
| `--min-validators`      | uint32 | Taille minimale de l'ensemble de validateurs (par défaut 1)         |
| `--settlement-interval` | uint   | Intervalle de règlement en blocs (par défaut 100)                   |
| `--vm-types`            | string | Types de VM pris en charge, séparés par des virgules (par défaut `evm`) |

### register-paychain

Enregistrer une nouvelle couche paychain pour les microtransactions à haute fréquence.

```bash
qorechaind tx multilayer register-paychain <layer-id> <description> [flags]
```

| Drapeau                 | Type | Description                                                |
| ----------------------- | ---- | ---------------------------------------------------------- |
| `--max-tx`              | uint | Nombre maximal de transactions par bloc (par défaut 5000)  |
| `--settlement-interval` | uint | Intervalle de règlement en blocs (par défaut 50)           |

### anchor-state

Soumettre un ancrage d'état (règlement) pour une couche enregistrée.

```bash
qorechaind tx multilayer anchor-state <layer-id> <layer-height> <state-root-hex> <pqc-agg-sig-hex> [flags]
```

### route-tx

Router une transaction vers la couche optimale.

```bash
qorechaind tx multilayer route-tx <tx_data_hex> [flags]
```

| Drapeau          | Type   | Description                                 |
| ---------------- | ------ | ------------------------------------------- |
| `--target-layer` | string | Forcer le routage vers une couche spécifique |

### update-layer-status

Mettre à jour le statut opérationnel d'une couche (opérateur uniquement).

```bash
qorechaind tx multilayer update-layer-status <layer_id> <status> [flags]
```

Valeurs de statut : `active`, `paused`, `draining`.

### challenge-anchor

Soumettre une contestation pour fraude contre un ancrage d'état.

```bash
qorechaind tx multilayer challenge-anchor <layer_id> <anchor_hash> <proof_hex> [flags]
```

---

## rdk

### create-rollup

Enregistrer un nouveau rollup auprès du Rollup Development Kit.

```bash
qorechaind tx rdk create-rollup <rollup_id> [flags]
```

| Drapeau             | Type   | Description                                                |
| ------------------- | ------ | ---------------------------------------------------------- |
| `--settlement-type` | string | `optimistic`, `zk`, `pessimistic`, `sovereign`             |
| `--profile`         | string | Préréglage : `defi`, `gaming`, `nft`, `enterprise`, `custom` |
| `--stake`           | string | Montant de la mise de l'opérateur                          |
| `--da-enabled`      | bool   | Activer la disponibilité des données native                |

### submit-batch

Soumettre un lot de règlement pour un rollup.

```bash
qorechaind tx rdk submit-batch <rollup_id> <state_root_hex> <batch_data_path> [flags]
```

### challenge-batch

Soumettre une contestation pour fraude contre un lot de règlement (rollups optimistes).

```bash
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> <proof_hex> [flags]
```

### finalize-batch

Finaliser manuellement un lot dont la fenêtre de contestation est écoulée.

```bash
qorechaind tx rdk finalize-batch <rollup_id> <batch_index> [flags]
```

### pause-rollup

Mettre en pause un rollup (opérateur uniquement).

```bash
qorechaind tx rdk pause-rollup <rollup_id> [flags]
```

### resume-rollup

Reprendre un rollup mis en pause (opérateur uniquement).

```bash
qorechaind tx rdk resume-rollup <rollup_id> [flags]
```

### stop-rollup

Arrêter définitivement un rollup et libérer sa mise (opérateur uniquement).

```bash
qorechaind tx rdk stop-rollup <rollup_id> [flags]
```

:::note
Le retrait de rollup et le règlement inter-couches sont également exposés dans le groupe de transactions `rdk` (par exemple, une commande `execute-withdrawal` qui règle un retrait prouvé contre un lot finalisé). Les arguments et drapeaux exacts dépendent du type de règlement et de la configuration DA de votre rollup ; consultez la documentation du **Rollup Development Kit** pour la référence de commandes faisant autorité avant de construire ces transactions.
:::

---

## babylon

### submit-btc-checkpoint

Soumettre un point de contrôle BTC pour une époque.

```bash
qorechaind tx babylon submit-btc-checkpoint <epoch> <checkpoint_hex> [flags]
```

### btc-restake

Restaker du BTC via l'intégration Babylon.

```bash
qorechaind tx babylon btc-restake <amount> [flags]
```

| Drapeau         | Type   | Description                                    |
| --------------- | ------ | ---------------------------------------------- |
| `--btc-tx-hash` | string | Hachage de transaction Bitcoin comme preuve    |

---

## abstractaccount

### create

Créer un compte abstrait avec des règles de dépense programmables.

```bash
qorechaind tx abstractaccount create [flags]
```

| Drapeau            | Type   | Description                                     |
| ------------------ | ------ | ----------------------------------------------- |
| `--spending-rules` | string | Fichier JSON définissant les règles de dépense  |

### update-spending-rules

Mettre à jour les règles de dépense d'un compte abstrait existant.

```bash
qorechaind tx abstractaccount update-spending-rules <rules_file.json> [flags]
```

---

## rlconsensus

PRISM est la couche d'apprentissage par renforcement qui ajuste les paramètres de consensus. Ces commandes contrôlent l'agent PRISM ; le nom de module CLI `rlconsensus` et ses sous-commandes sont conservés tels quels.

### set-agent-mode

Définir le mode opérationnel de l'agent PRISM (gouvernance uniquement).

```bash
qorechaind tx rlconsensus set-agent-mode <mode> [flags]
```

Valeurs de mode : `0` (désactivé), `1` (observation), `2` (suggestion), `3` (automatique).

### resume-agent

Relancer l'agent PRISM après le déclenchement d'un disjoncteur.

```bash
qorechaind tx rlconsensus resume-agent [flags]
```

### update-policy

Mettre à jour la configuration de politique de l'agent PRISM (gouvernance uniquement).

```bash
qorechaind tx rlconsensus update-policy <policy_file.json> [flags]
```

### update-reward-weights

Mettre à jour la configuration des poids de récompense pour l'agent PRISM.

```bash
qorechaind tx rlconsensus update-reward-weights [flags]
```

| Drapeau               | Type   | Description                              |
| --------------------- | ------ | ---------------------------------------- |
| `--throughput-weight` | string | Poids de la récompense de débit          |
| `--latency-weight`    | string | Poids de la récompense de latence        |
| `--security-weight`   | string | Poids de la récompense de sécurité       |
