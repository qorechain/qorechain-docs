---
slug: /cli-reference/query-commands
title: Commandes de requête
sidebar_label: Commandes de requête
sidebar_position: 3
---

# Commandes de requête

Toutes les commandes de requête suivent le modèle :

```bash
qorechaind query <module> <command> [args] [flags]
```

:::note
Les requêtes s'exécutent sur le nœud vers lequel pointe `--node`. Utilisez un point d'accès RPC du mainnet **`qorechain-vladi`** (version de chaîne **v3.1.80**) pour des données en direct, ou un point d'accès du testnet **`qorechain-diana`** pour les tests. La valeur par défaut `tcp://localhost:26657` cible un nœud que vous exécutez vous-même.
:::

Des indicateurs communs s'appliquent à chaque sous-commande `query` :

| Indicateur       | Type   | Description                                     |
| ---------- | ------ | ----------------------------------------------- |
| `--node`   | string | Point d'accès RPC (par défaut : `tcp://localhost:26657`) |
| `--output` | string | Format de sortie : `json` ou `text`                 |
| `--height` | int    | Interroge l'état à une hauteur de bloc spécifique          |

---

## bank

### balances

Interroge tous les soldes d'un compte.

```bash
qorechaind query bank balances <address>
```

### total

Interroge l'offre totale de tous les tokens.

```bash
qorechaind query bank total
```

---

## staking

### validator

Interroge un seul validateur par son adresse d'opérateur.

```bash
qorechaind query staking validator <validator_address>
```

### validators

Liste tous les validateurs.

```bash
qorechaind query staking validators
```

### delegation

Interroge une délégation d'un délégateur vers un validateur.

```bash
qorechaind query staking delegation <delegator_address> <validator_address>
```

### delegations

Interroge toutes les délégations d'un délégateur.

```bash
qorechaind query staking delegations <delegator_address>
```

### unbonding-delegation

Interroge une délégation en cours de unbonding.

```bash
qorechaind query staking unbonding-delegation <delegator_address> <validator_address>
```

---

## distribution

### rewards

Interroge toutes les récompenses de délégation d'un délégateur.

```bash
qorechaind query distribution rewards <delegator_address>
```

### commission

Interroge la commission d'un validateur.

```bash
qorechaind query distribution commission <validator_address>
```

---

## gov

### proposal

Interroge une seule proposition par son ID.

```bash
qorechaind query gov proposal <proposal_id>
```

### proposals

Liste toutes les propositions, éventuellement filtrées par statut.

```bash
qorechaind query gov proposals [flags]
```

| Indicateur       | Type   | Description                                                               |
| ---------- | ------ | ------------------------------------------------------------------------- |
| `--status` | string | Filtre par statut : `deposit_period`, `voting_period`, `passed`, `rejected` |

### votes

Interroge les votes sur une proposition.

```bash
qorechaind query gov votes <proposal_id>
```

---

## pqc

### account

Interroge le statut d'enregistrement de clé PQC d'un compte.

```bash
qorechaind query pqc account <address>
```

### algorithms

Liste tous les algorithmes PQC pris en charge.

```bash
qorechaind query pqc algorithms
```

### algorithm

Interroge les détails d'un algorithme PQC spécifique.

```bash
qorechaind query pqc algorithm <algorithm_name>
```

### stats

Interroge les statistiques agrégées d'enregistrement PQC.

```bash
qorechaind query pqc stats
```

### params

Interroge les paramètres du module PQC.

```bash
qorechaind query pqc params
```

### migration

Interroge le statut de migration de clé PQC d'un compte.

```bash
qorechaind query pqc migration <address>
```

### hybrid-mode

Interroge le mode d'application des signatures hybrides actuel.

```bash
qorechaind query pqc hybrid-mode
```

---

## xqore

### position

Interroge la position de staking xQORE d'une adresse.

```bash
qorechaind query xqore position <address>
```

### params

Interroge les paramètres du module xQORE.

```bash
qorechaind query xqore params
```

---

## burn

### stats

Interroge les statistiques de burn sur tous les canaux.

```bash
qorechaind query burn stats
```

### params

Interroge les paramètres du module burn.

```bash
qorechaind query burn params
```

---

## inflation

### rate

Interroge le taux d'inflation annualisé actuel.

```bash
qorechaind query inflation rate
```

### epoch

Interroge le numéro d'époque actuel et sa progression.

```bash
qorechaind query inflation epoch
```

### params

Interroge les paramètres du module inflation.

```bash
qorechaind query inflation params
```

---

## ai

### config

Interroge la configuration du module IA.

```bash
qorechaind query ai config
```

### stats

Interroge les statistiques agrégées de traitement IA.

```bash
qorechaind query ai stats
```

### fee-estimate

Obtient une estimation de frais de gas assistée par IA.

```bash
qorechaind query ai fee-estimate [flags]
```

| Indicateur        | Type   | Description                     |
| ----------- | ------ | ------------------------------- |
| `--tx-type` | string | Type de transaction pour l'estimation |
| `--urgency` | string | `low`, `medium`, `high`         |

### investigations

Liste les enquêtes de fraude actives.

```bash
qorechaind query ai investigations
```

### recommendations

Obtient des recommandations d'optimisation réseau générées par IA.

```bash
qorechaind query ai recommendations
```

### circuit-breakers

Interroge l'état actuel des coupe-circuits.

```bash
qorechaind query ai circuit-breakers
```

---

## reputation

### validators

Interroge les scores de réputation de tous les validateurs.

```bash
qorechaind query reputation validators
```

### validator

Interroge le score de réputation d'un validateur spécifique.

```bash
qorechaind query reputation validator <validator_address>
```

---

## bridge

### chains

Liste toutes les chaînes de bridge enregistrées.

```bash
qorechaind query bridge chains
```

### chain

Interroge les détails d'une chaîne bridgée spécifique.

```bash
qorechaind query bridge chain <chain_id>
```

### validators

Liste les validateurs de bridge actifs.

```bash
qorechaind query bridge validators
```

### operations

Liste les opérations de bridge récentes.

```bash
qorechaind query bridge operations
```

| Indicateur       | Type   | Description                              |
| ---------- | ------ | ---------------------------------------- |
| `--status` | string | Filtre : `pending`, `completed`, `failed` |
| `--chain`  | string | Filtre par chain ID                       |

### limits

Interroge les limites de débit d'une chaîne bridgée.

```bash
qorechaind query bridge limits <chain_id>
```

### estimate

Estime les frais de bridge et le temps de transfert.

```bash
qorechaind query bridge estimate <chain_id> <amount> <asset>
```

---

## crossvm

### message

Récupère un message inter-VM par son ID.

```bash
qorechaind query crossvm message <message_id>
```

### pending

Liste les messages inter-VM en attente.

```bash
qorechaind query crossvm pending
```

### params

Interroge les paramètres du module Cross-VM.

```bash
qorechaind query crossvm params
```

---

## svm

### account

Interroge les informations d'un compte SVM.

```bash
qorechaind query svm account <pubkey>
```

### program

Interroge les informations d'un programme SVM déployé.

```bash
qorechaind query svm program <program_id>
```

### params

Interroge les paramètres du module SVM.

```bash
qorechaind query svm params
```

### slot

Interroge le numéro de slot SVM actuel.

```bash
qorechaind query svm slot
```

---

## multilayer

### layer

Interroge les détails d'une couche spécifique.

```bash
qorechaind query multilayer layer <layer_id>
```

### layers

Liste toutes les couches enregistrées.

```bash
qorechaind query multilayer layers
```

### anchor

Interroge un enregistrement d'ancrage spécifique.

```bash
qorechaind query multilayer anchor <anchor_id>
```

### anchors

Liste les soumissions d'ancrage récentes.

```bash
qorechaind query multilayer anchors [flags]
```

| Indicateur         | Type   | Description               |
| ------------ | ------ | ------------------------- |
| `--layer-id` | string | Filtre par layer ID        |
| `--limit`    | uint   | Nombre maximal de résultats à renvoyer |

### routing-stats

Interroge les statistiques de routage des transactions entre les couches.

```bash
qorechaind query multilayer routing-stats
```

### simulate-route

Simule le routage d'une transaction sans exécution.

```bash
qorechaind query multilayer simulate-route <tx_data_hex>
```

### params

Interroge les paramètres du module Multilayer.

```bash
qorechaind query multilayer params
```

---

## rdk

### rollup

Interroge les détails d'un rollup spécifique.

```bash
qorechaind query rdk rollup <rollup_id>
```

### rollups

Liste tous les rollups enregistrés.

```bash
qorechaind query rdk rollups
```

| Indicateur       | Type   | Description                           |
| ---------- | ------ | ------------------------------------- |
| `--status` | string | Filtre : `active`, `paused`, `stopped` |

### batch

Interroge un lot de règlement spécifique.

```bash
qorechaind query rdk batch <rollup_id> <batch_index>
```

### latest-batch

Interroge le dernier lot d'un rollup.

```bash
qorechaind query rdk latest-batch <rollup_id>
```

### suggest-profile

Obtient une recommandation de profil de rollup assistée par IA.

```bash
qorechaind query rdk suggest-profile <use_case>
```

### blob

Interroge un blob DA spécifique.

```bash
qorechaind query rdk blob <rollup_id> <blob_index>
```

### params

Interroge les paramètres du module RDK.

```bash
qorechaind query rdk params
```

:::note
Les preuves de retrait de rollup et le statut de règlement sont également interrogeables sous le groupe `rdk`. Les sous-commandes de requête exactes et leurs arguments dépendent du type de règlement de votre rollup ; consultez la documentation du **Kit de développement de rollups** pour la surface de requête de retrait/règlement faisant autorité.
:::

---

## rlconsensus

PRISM est la couche d'apprentissage par renforcement qui ajuste les paramètres de consensus. Le nom de module CLI `rlconsensus` et ses sous-commandes sont conservés tels quels.

### agent-status

Interroge le statut et le mode actuels de l'agent PRISM.

```bash
qorechaind query rlconsensus agent-status
```

### observation

Interroge le dernier vecteur d'observation de PRISM.

```bash
qorechaind query rlconsensus observation
```

### reward

Interroge les métriques de récompense cumulées de PRISM.

```bash
qorechaind query rlconsensus reward
```

### params

Interroge les paramètres du module PRISM Consensus.

```bash
qorechaind query rlconsensus params
```

### policy

Interroge la configuration de politique PRISM active.

```bash
qorechaind query rlconsensus policy
```

---

## babylon

### staking

Interroge la position de staking BTC d'une adresse.

```bash
qorechaind query babylon staking <address>
```

### checkpoint

Interroge les données de checkpoint BTC pour une époque donnée.

```bash
qorechaind query babylon checkpoint <epoch>
```

### params

Interroge les paramètres du module Babylon.

```bash
qorechaind query babylon params
```

---

## abstractaccount

### account

Interroge les détails d'un compte abstrait.

```bash
qorechaind query abstractaccount account <address>
```

### params

Interroge les paramètres du module Abstract Account.

```bash
qorechaind query abstractaccount params
```

---

## gasabstraction

### accepted-tokens

Liste les tokens acceptés pour le paiement du gas.

```bash
qorechaind query gasabstraction accepted-tokens
```

### params

Interroge les paramètres du module Gas Abstraction.

```bash
qorechaind query gasabstraction params
```

---

## fairblock

### config

Interroge la configuration de chiffrement FairBlock.

```bash
qorechaind query fairblock config
```

### params

Interroge les paramètres du module FairBlock.

```bash
qorechaind query fairblock params
```
