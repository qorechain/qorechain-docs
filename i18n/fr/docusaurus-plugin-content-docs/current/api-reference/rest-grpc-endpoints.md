---
slug: /api-reference/rest-grpc-endpoints
title: Points de terminaison REST / gRPC
sidebar_label: Points de terminaison REST / gRPC
sidebar_position: 1
---

# Points de terminaison REST / gRPC

QoreChain expose trois interfaces principales pour l'accès programmatique :

| Interface | Port par défaut | Protocole | Description                        |
| --------- | ------------ | --------- | ---------------------------------- |
| REST      | `1317`       | HTTP/1.1  | API REST LCD (Light Client Daemon) |
| gRPC      | `9090`       | HTTP/2    | Service gRPC encodé en Protobuf    |
| RPC       | `26657`      | HTTP + WS | RPC du moteur de consensus QoreChain |

Tous les points de terminaison REST renvoient du JSON. Les points de terminaison gRPC utilisent les Protocol Buffers et peuvent être consommés avec n'importe quel client gRPC. L'interface RPC fournit des requêtes au niveau du consensus et la diffusion des transactions.

:::note
Ces interfaces sont disponibles à la fois sur le mainnet **`qorechain-vladi`** (actif depuis le 7 juin 2026 sur la version de chaîne **v3.1.77**) et le testnet **`qorechain-diana`**. Les URL de base ci-dessous supposent un nœud s'exécutant localement ; remplacez par l'hôte mainnet ou testnet de votre fournisseur pour un accès distant.
:::

## URL de base

```
REST:  http://localhost:1317
gRPC:  localhost:9090
RPC:   http://localhost:26657
```

## Module IA

| Méthode | Point de terminaison               | Description                                        |
| ------ | ---------------------------------- | -------------------------------------------------- |
| GET    | `/ai/v1/config`                    | Renvoie la configuration actuelle du module IA     |
| GET    | `/ai/v1/stats`                     | Statistiques agrégées de traitement IA             |
| GET    | `/ai/v1/fee-estimate`              | Estimation des frais de gas assistée par IA pour une transaction |
| GET    | `/ai/v1/fraud/investigations`      | Liste toutes les enquêtes de fraude actives        |
| GET    | `/ai/v1/fraud/investigations/{id}` | Renvoie les détails d'une enquête de fraude spécifique |
| GET    | `/ai/v1/network/recommendations`   | Recommandations d'optimisation réseau générées par IA |
| GET    | `/ai/v1/circuit-breakers`          | États et seuils actuels des disjoncteurs           |

## Module Bridge {#bridge-module}

À partir de la version de chaîne **v3.1.77**, l'état en lecture seule du module bridge est exposé via REST par grpc-gateway sous le préfixe `/qorechain/bridge/v1/...` (auparavant uniquement gRPC). Ces points de terminaison servent du JSON on-chain réel via HTTP pour les explorateurs et la télémétrie des nœuds légers. La `config` du bridge rapporte par exemple `min_validators=10` et `threshold=7`.

| Méthode | Point de terminaison                       | Description                              |
| ------ | ------------------------------------------ | ---------------------------------------- |
| GET    | `/qorechain/bridge/v1/config`              | Configuration actuelle du module bridge  |
| GET    | `/qorechain/bridge/v1/chains`              | Liste toutes les chaînes de pont enregistrées |
| GET    | `/qorechain/bridge/v1/chains/{chain_id}`   | Détails d'une chaîne pontée spécifique   |
| GET    | `/qorechain/bridge/v1/validators`          | Liste les validateurs de pont enregistrés |
| GET    | `/qorechain/bridge/v1/validators/{address}`| Détails d'un validateur de pont spécifique |
| GET    | `/qorechain/bridge/v1/operations`          | Liste les opérations de pont             |
| GET    | `/qorechain/bridge/v1/operations/{id}`     | Détails d'une opération de pont spécifique |

Les points de terminaison à chemin plus court suivants restent disponibles :

| Méthode | Point de terminaison                | Description                                    |
| ------ | ----------------------------------- | ---------------------------------------------- |
| GET    | `/bridge/v1/chains`                 | Liste toutes les chaînes de pont enregistrées  |
| GET    | `/bridge/v1/chains/{id}`            | Détails d'une chaîne pontée spécifique         |
| GET    | `/bridge/v1/validators`             | Liste les validateurs de pont actifs           |
| GET    | `/bridge/v1/operations`             | Liste les opérations de pont récentes          |
| GET    | `/bridge/v1/operations/{id}`        | Détails d'une opération de pont spécifique      |
| GET    | `/bridge/v1/locked/{chain}/{asset}` | Valeur totale verrouillée pour une paire chaîne/actif |
| GET    | `/bridge/v1/limits/{chain}`         | Limites de débit et seuils pour une chaîne pontée |
| GET    | `/bridge/v1/estimate`               | Estime les frais de pont et le délai de transfert |

## Module PQC

| Méthode | Point de terminaison         | Description                                    |
| ------ | ---------------------------- | ---------------------------------------------- |
| GET    | `/pqc/v1/params`             | Paramètres actuels du module PQC               |
| GET    | `/pqc/v1/accounts/{address}` | Statut de la clé PQC pour un compte spécifique |
| GET    | `/pqc/v1/stats`              | Statistiques agrégées d'enregistrement et de migration PQC |

## Module Reputation

| Méthode | Point de terminaison                  | Description                               |
| ------ | ------------------------------------- | ----------------------------------------- |
| GET    | `/reputation/v1/validators`           | Scores de réputation pour tous les validateurs |
| GET    | `/reputation/v1/validators/{address}` | Score de réputation d'un validateur spécifique |

## Module Cross-VM

| Méthode | Point de terminaison       | Description                              |
| ------ | -------------------------- | ---------------------------------------- |
| GET    | `/crossvm/v1/message/{id}` | Récupère un message inter-VM par ID      |
| GET    | `/crossvm/v1/pending`      | Liste les messages inter-VM en attente dans la file |
| GET    | `/crossvm/v1/params`       | Paramètres actuels du module Cross-VM    |

## Module Multilayer

| Méthode | Point de terminaison           | Description                                  |
| ------ | ------------------------------ | -------------------------------------------- |
| GET    | `/multilayer/v1/layer/{id}`    | Détails d'une couche spécifique              |
| GET    | `/multilayer/v1/layers`        | Liste toutes les couches enregistrées        |
| GET    | `/multilayer/v1/anchor/{id}`   | Détails d'un enregistrement d'ancrage spécifique |
| GET    | `/multilayer/v1/anchors`       | Liste les soumissions d'ancrage récentes     |
| GET    | `/multilayer/v1/routing-stats` | Statistiques de routage des transactions à travers les couches |
| GET    | `/multilayer/v1/params`        | Paramètres actuels du module Multilayer      |

## Module SVM

| Méthode | Point de terminaison        | Description                                       |
| ------ | --------------------------- | ------------------------------------------------- |
| GET    | `/svm/v1/params`            | Paramètres actuels du module SVM                  |
| GET    | `/svm/v1/account/{address}` | Informations du compte SVM pour une adresse donnée |
| GET    | `/svm/v1/program/{address}` | Informations du programme déployé pour une adresse de programme donnée |

## Module RL Consensus

Les paramètres de réglage PRISM et l'état de l'agent d'apprentissage par renforcement sont exposés via ce module.

| Méthode | Point de terminaison          | Description                             |
| ------ | ----------------------------- | --------------------------------------- |
| GET    | `/rlconsensus/v1/agent`       | Statut et mode actuels de l'agent PRISM |
| GET    | `/rlconsensus/v1/observation` | Dernier vecteur d'observation           |
| GET    | `/rlconsensus/v1/rewards`     | Métriques de récompense cumulées        |
| GET    | `/rlconsensus/v1/params`      | Paramètres actuels du module PRISM Consensus |
| GET    | `/rlconsensus/v1/policy`      | Configuration et poids de la politique active |

## Module Burn

À partir de la version de chaîne **v3.1.77**, l'état en lecture seule du module burn est exposé via REST par grpc-gateway sous le préfixe `/qorechain/burn/v1/...` (auparavant uniquement gRPC). Ces points de terminaison servent du JSON on-chain réel via HTTP pour les explorateurs et la télémétrie des nœuds légers. Les `stats` de burn incluent par exemple `gas_burn_rate=0.30`.

| Méthode | Point de terminaison           | Description                          |
| ------ | ------------------------------ | ------------------------------------ |
| GET    | `/qorechain/burn/v1/params`    | Paramètres actuels du module Burn    |
| GET    | `/qorechain/burn/v1/stats`     | Statistiques de burn sur tous les canaux |
| GET    | `/qorechain/burn/v1/records`   | Liste les enregistrements de burn    |
| GET    | `/qorechain/burn/v1/milestone` | Progression des jalons de burn       |

Les points de terminaison à chemin plus court suivants restent disponibles :

| Méthode | Point de terminaison | Description                         |
| ------ | ----------------- | ----------------------------------- |
| GET    | `/burn/v1/stats`  | Statistiques de burn sur tous les canaux |
| GET    | `/burn/v1/params` | Paramètres actuels du module Burn   |

## Module xQORE

| Méthode | Point de terminaison           | Description                                |
| ------ | ------------------------------ | ------------------------------------------ |
| GET    | `/xqore/v1/position/{address}` | Position de staking xQORE pour une adresse donnée |
| GET    | `/xqore/v1/params`             | Paramètres actuels du module xQORE         |

## Module Inflation

| Méthode | Point de terminaison   | Description                         |
| ------ | ---------------------- | ----------------------------------- |
| GET    | `/inflation/v1/rate`   | Taux d'inflation annualisé actuel   |
| GET    | `/inflation/v1/epoch`  | Numéro de l'époque actuelle et progression |
| GET    | `/inflation/v1/params` | Paramètres actuels du module Inflation |

## Module RDK

| Méthode | Point de terminaison         | Description                           |
| ------ | ---------------------------- | ------------------------------------- |
| GET    | `/rdk/v1/rollup/{id}`        | Détails d'un rollup spécifique        |
| GET    | `/rdk/v1/rollups`            | Liste tous les rollups enregistrés    |
| GET    | `/rdk/v1/batch/{id}/{index}` | Récupère un lot de règlement spécifique |
| GET    | `/rdk/v1/batches/{id}`       | Liste les lots d'un rollup spécifique  |
| GET    | `/rdk/v1/blob/{id}/{index}`  | Récupère un blob DA spécifique        |
| GET    | `/rdk/v1/params`             | Paramètres actuels du module RDK      |

## Module Babylon

| Méthode | Point de terminaison             | Description                              |
| ------ | -------------------------------- | ---------------------------------------- |
| GET    | `/babylon/v1/staking/{address}`  | Position de staking BTC pour une adresse donnée |
| GET    | `/babylon/v1/checkpoint/{epoch}` | Données de point de contrôle BTC pour une époque donnée |
| GET    | `/babylon/v1/params`             | Paramètres actuels du module Babylon     |

## Module Abstract Account

| Méthode | Point de terminaison                    | Description                                  |
| ------ | --------------------------------------- | -------------------------------------------- |
| GET    | `/abstractaccount/v1/account/{address}` | Détails du compte abstrait pour une adresse donnée |
| GET    | `/abstractaccount/v1/params`            | Paramètres actuels du module Abstract Account |

## Module FairBlock

| Méthode | Point de terminaison   | Description                                |
| ------ | ---------------------- | ------------------------------------------ |
| GET    | `/fairblock/v1/config` | Configuration actuelle du chiffrement FairBlock |
| GET    | `/fairblock/v1/params` | Paramètres actuels du module FairBlock     |

## Module Gas Abstraction

| Méthode | Point de terminaison                 | Description                               |
| ------ | ------------------------------------ | ----------------------------------------- |
| GET    | `/gasabstraction/v1/accepted-tokens` | Liste les tokens acceptés pour le paiement du gas |
| GET    | `/gasabstraction/v1/params`          | Paramètres actuels du module Gas Abstraction |

## Réflexion gRPC

La réflexion du serveur gRPC est activée par défaut, permettant à des outils tels que `grpcurl` de découvrir les services disponibles :

```bash
grpcurl -plaintext localhost:9090 list
```

Pour interroger un service spécifique :

```bash
grpcurl -plaintext localhost:9090 qorechain.pqc.v1.Query/Params
```

## Authentification

Tous les points de terminaison REST et gRPC ne sont pas authentifiés par défaut. Pour les déploiements en production, placez un proxy inverse (par exemple, Nginx ou Caddy) devant le nœud pour gérer la terminaison TLS et le contrôle d'accès.
