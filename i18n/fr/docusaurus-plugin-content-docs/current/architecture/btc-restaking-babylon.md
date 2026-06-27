---
slug: /architecture/btc-restaking-babylon
title: Restaking BTC (Babylon)
sidebar_label: Restaking BTC (Babylon)
sidebar_position: 11
---

# Restaking BTC (Babylon)

Le module `x/babylon` intègre QoreChain au protocole Babylon afin d'hériter des garanties de finalité par preuve de travail de Bitcoin. Grâce au restaking BTC, QoreChain bénéficie d'une couche de finalité secondaire adossée à la puissance de hachage de Bitcoin — sans nécessiter de modification du protocole Bitcoin lui-même.

## Vue d'ensemble

Le protocole Babylon permet aux chaînes en preuve d'enjeu de tirer parti de la sécurité de Bitcoin au moyen d'un mécanisme d'horodatage et de checkpointing. L'intégration de QoreChain fonctionne comme suit :

1. **Les stakers BTC** verrouillent des bitcoins dans des transactions de staking Babylon et enregistrent leurs positions sur QoreChain.
2. **Les checkpoints d'époque** de QoreChain sont périodiquement relayés vers Babylon, qui les horodate sur Bitcoin.
3. **Héritage de finalité** : une fois qu'une époque QoreChain est checkpointée sur Bitcoin, l'état couvert par cette époque hérite des garanties de finalité par preuve de travail de Bitcoin.

Cela offre une défense contre les attaques à longue portée et l'équivocation, ancrée dans la puissance de hachage cumulée de Bitcoin plutôt que de s'appuyer uniquement sur l'ensemble de validateurs propre à QoreChain.

## Positions de staking BTC

Les utilisateurs peuvent enregistrer des positions de staking BTC sur QoreChain en soumettant une transaction `MsgBTCRestake` qui référence une transaction de staking Bitcoin.

### Conditions d'enregistrement

| Paramètre                | Valeur                       | Description                                       |
| ------------------------ | ---------------------------- | ------------------------------------------------- |
| **Stake minimal**        | 100 000 satoshis (0.001 BTC) | BTC minimal requis par position de staking        |
| **Période de désengagement** | 144 blocs BTC (\~1 jour) | Délai d'attente avant que le BTC staké puisse être retiré |
| **Intervalle de checkpoint** | Toutes les 10 époques QoreChain | Fréquence à laquelle l'état est checkpointé vers Babylon |

### Structure d'une position de staking

Chaque position de staking BTC suit l'état on-chain suivant :

| Champ              | Description                                                     |
| ------------------ | --------------------------------------------------------------- |
| `staker_address`   | Adresse QoreChain du staker (`qor1...`)                         |
| `btc_tx_hash`      | Hash de la transaction Bitcoin de staking                       |
| `amount_satoshis`  | Montant de BTC staké en satoshis                                |
| `status`           | État du cycle de vie de la position : `active`, `unbonding`, ou `withdrawn` |
| `staked_at`        | Horodatage de l'enregistrement de la position                   |
| `unbonding_height` | Hauteur de bloc à laquelle le désengagement a été initié (le cas échéant) |
| `validator_addr`   | Adresse du validateur QoreChain auquel ce stake est délégué     |

### Flux d'enregistrement

1. **Créer la transaction de staking BTC** — Sur le réseau Bitcoin, créer la transaction de staking BTC.
2. **Soumettre MsgBTCRestake sur QoreChain** — Sur QoreChain, soumettre `MsgBTCRestake` avec `btc_tx_hash`, `amount` et `validator`.
3. **Position enregistrée** — La position est enregistrée on-chain comme « active ».

## Checkpoints d'époque

Les racines d'état d'époque de QoreChain sont périodiquement checkpointées sur Bitcoin via la chaîne de relais Babylon.

### Flux de checkpoint

1. **Soumettre le checkpoint** — Un validateur QoreChain soumet `MsgSubmitBTCCheckpoint` contenant le numéro d'époque, le hash de bloc BTC, la hauteur de bloc BTC et la racine d'état QoreChain.
2. **Relais IBC** — Les données de checkpoint sont relayées vers la chaîne Babylon via IBC.
3. **Horodatage sur Bitcoin** — Babylon inclut le checkpoint dans une transaction Bitcoin, ancrant l'état de QoreChain à la blockchain Bitcoin.
4. **Confirmation** — Une fois la transaction Bitcoin confirmée, la finalité reflue à travers Babylon vers QoreChain.
5. **Finalisation** — Le statut du checkpoint passe de `pending` à `confirmed` puis à `finalized`.

### Structure d'un checkpoint

| Champ              | Description                                              |
| ------------------ | -------------------------------------------------------- |
| `epoch_num`        | Numéro d'époque QoreChain en cours de checkpointing      |
| `btc_block_hash`   | Hash de bloc Bitcoin contenant le checkpoint             |
| `btc_block_height` | Hauteur de bloc Bitcoin                                  |
| `state_root`       | Racine d'état QoreChain à la limite d'époque             |
| `submitted_at`     | Horodatage de la soumission du checkpoint                |
| `status`           | État du checkpoint : `pending`, `confirmed`, ou `finalized` |

### Instantanés d'époque

À chaque limite de checkpoint, un instantané d'époque capture l'état réseau agrégé :

| Champ              | Description                                      |
| ------------------ | ------------------------------------------------ |
| `total_staked`     | Total de BTC staké sur toutes les positions (satoshis) |
| `active_positions` | Nombre de positions de staking actives           |
| `validator_count`  | Nombre de validateurs avec des délégations adossées au BTC |
| `block_height`     | Hauteur de bloc QoreChain au moment de l'instantané |

## Couche de finalité secondaire

L'intégration Babylon fournit une **garantie de finalité secondaire** qui complète la finalité de consensus native de QoreChain :

| Couche de finalité | Source                         | Vitesse       | Sécurité                                |
| ------------------ | ------------------------------ | ------------- | --------------------------------------- |
| **Primaire**       | Moteur de consensus QoreChain  | \~5 secondes  | Adossée au stake QOR + signatures PQC   |
| **Secondaire**     | Babylon + Bitcoin              | \~60 minutes  | Adossée à la puissance de hachage cumulée de Bitcoin |

La couche secondaire est particulièrement précieuse pour :

* **Prévention des attaques à longue portée** : même si un attaquant accumule un stake QOR important, il ne peut pas réécrire l'historique qui a été checkpointé sur Bitcoin.
* **Sécurité du bridge inter-chaînes** : les opérations de bridge impliquant de grosses valeurs peuvent attendre une finalité de niveau Bitcoin avant de libérer les fonds.
* **Confiance institutionnelle** : l'horodatage Bitcoin fournit une preuve vérifiable de manière indépendante de l'historique d'état de QoreChain.

## Configuration

| Paramètre             | Défaut           | Description                               |
| --------------------- | ---------------- | ----------------------------------------- |
| `enabled`             | `false`          | Interrupteur principal des fonctionnalités de restaking BTC |
| `min_stake_amount`    | 100 000 satoshis | BTC minimal par position de staking       |
| `unbonding_period`    | 144 blocs BTC    | Durée de désengagement libellée en BTC    |
| `checkpoint_interval` | 10 époques       | Époques entre les checkpoints Babylon     |
| `babylon_chain_id`    | `bbn-1`          | ID de chaîne du réseau Babylon connecté   |

## Événements

Le module émet les événements on-chain suivants :

| Type d'événement         | Attributs                                | Description                                    |
| ------------------------ | ---------------------------------------- | ---------------------------------------------- |
| `btc_restake`            | staker, btc\_tx\_hash, amount, validator | Nouvelle position de staking BTC enregistrée   |
| `btc_unbond`             | staker, amount                           | Position de staking BTC entrée en désengagement |
| `btc_checkpoint`         | epoch, checkpoint\_id                    | Checkpoint d'époque soumis à Babylon           |
| `babylon_epoch_complete` | epoch                                    | Époque Babylon finalisée avec horodatage Bitcoin |

## Points de terminaison de l'API

### REST

| Méthode | Point de terminaison             | Description                              |
| ------- | -------------------------------- | ---------------------------------------- |
| GET     | `/babylon/v1/staking/{address}`  | Obtenir les positions de staking BTC pour une adresse |
| GET     | `/babylon/v1/checkpoint/{epoch}` | Obtenir les données de checkpoint pour une époque spécifique |
| GET     | `/babylon/v1/params`             | Obtenir les paramètres de configuration du module |

### JSON-RPC

| Méthode                     | Paramètres         | Description                                                      |
| --------------------------- | ------------------ | ---------------------------------------------------------------- |
| `qor_getBTCStakingPosition` | `address` (string) | Renvoie la position de staking BTC pour l'adresse QoreChain donnée |

## Commandes CLI

### Commandes de requête

```bash
# Query BTC restaking configuration
qorechaind query babylon config

# Query a staking position by address
qorechaind query babylon position <staker-address>
```

### Commandes de transaction

```bash
# Register a BTC restaking position
qorechaind tx babylon restake \
  --btc-tx-hash <hash> \
  --amount-satoshis <amount> \
  --validator <qorvaloper1...> \
  --from <key-name>

# Submit a BTC checkpoint
qorechaind tx babylon submit-checkpoint \
  --epoch <epoch-number> \
  --btc-block-hash <hash> \
  --btc-block-height <height> \
  --state-root <root> \
  --from <key-name>
```
