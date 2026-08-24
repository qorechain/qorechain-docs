---
slug: /api-reference/rest-grpc-endpoints
title: Points de terminaison REST / gRPC
sidebar_label: Points de terminaison REST / gRPC
sidebar_position: 1
---

# Points de terminaison REST / gRPC

QoreChain expose trois interfaces principales pour un accès programmatique :

| Interface | Port par défaut | Protocole | Description                        |
| --------- | ------------ | --------- | ---------------------------------- |
| REST      | `1317`       | HTTP/1.1  | API REST LCD (Light Client Daemon) |
| gRPC      | `9090`       | HTTP/2    | Service gRPC encodé en Protobuf    |
| RPC       | `26657`      | HTTP + WS | RPC du moteur de consensus QoreChain |

Tous les points de terminaison REST renvoient du JSON. Les points de terminaison gRPC utilisent Protocol Buffers et peuvent être consommés avec n'importe quel client gRPC. L'interface RPC fournit des requêtes au niveau du consensus et la diffusion de transactions.

:::note
Ces interfaces sont disponibles à la fois sur le mainnet **`qorechain-vladi`** (en production depuis le 7 juin 2026 sur la version de chaîne **v3.1.92**) et sur le testnet **`qorechain-diana`**. Les URL de base ci-dessous supposent un nœud exécuté localement ; les points de terminaison hébergés publics (`rpc/api/evm/svm.qore.host` et leurs variantes `-testnet`) sont répertoriés dans [Réseaux](/appendix/networks#public-endpoints).
:::

## URL de base

```
REST:  http://localhost:1317
gRPC:  localhost:9090
RPC:   http://localhost:26657
```

## Module IA

| Méthode | Point de terminaison                | Description                                        |
| ------ | ---------------------------------- | -------------------------------------------------- |
| GET    | `/ai/v1/config`                    | Renvoie la configuration actuelle du module IA     |
| GET    | `/ai/v1/stats`                     | Statistiques agrégées de traitement IA             |
| GET    | `/ai/v1/fee-estimate`              | Estimation des frais de gas assistée par IA pour une transaction |
| GET    | `/ai/v1/fraud/investigations`      | Liste toutes les investigations de fraude actives  |
| GET    | `/ai/v1/fraud/investigations/{id}` | Renvoie les détails d'une investigation de fraude spécifique |
| GET    | `/ai/v1/network/recommendations`   | Recommandations d'optimisation réseau générées par IA |
| GET    | `/ai/v1/circuit-breakers`          | États et seuils actuels des disjoncteurs (circuit breakers) |

## Module Bridge {#bridge-module}

Depuis la version de chaîne **v3.1.77**, l'état en lecture seule du module bridge est exposé via REST par le biais du grpc-gateway sous le préfixe `/qorechain/bridge/v1/...` (auparavant uniquement gRPC). Ces points de terminaison servent du vrai JSON on-chain via HTTP pour les explorateurs et la télémétrie des light-nodes. Le `config` du bridge indique par exemple `min_validators=10` et `threshold=7`.

| Méthode | Point de terminaison                       | Description                              |
| ------ | ------------------------------------------ | ---------------------------------------- |
| GET    | `/qorechain/bridge/v1/config`              | Configuration actuelle du module bridge  |
| GET    | `/qorechain/bridge/v1/chains`              | Liste toutes les chaînes bridge enregistrées |
| GET    | `/qorechain/bridge/v1/chains/{chain_id}`   | Détails d'une chaîne bridgée spécifique  |
| GET    | `/qorechain/bridge/v1/validators`          | Liste les validateurs bridge enregistrés |
| GET    | `/qorechain/bridge/v1/validators/{address}`| Détails d'un validateur bridge spécifique |
| GET    | `/qorechain/bridge/v1/operations`          | Liste les opérations bridge              |
| GET    | `/qorechain/bridge/v1/operations/{id}`     | Détails d'une opération bridge spécifique |

Les points de terminaison à chemin plus court suivants restent disponibles :

| Méthode | Point de terminaison                | Description                                    |
| ------ | ----------------------------------- | ----------------------------------------------- |
| GET    | `/bridge/v1/chains`                 | Liste toutes les chaînes bridge enregistrées   |
| GET    | `/bridge/v1/chains/{id}`            | Détails d'une chaîne bridgée spécifique        |
| GET    | `/bridge/v1/validators`             | Liste les validateurs bridge actifs            |
| GET    | `/bridge/v1/operations`             | Liste les opérations bridge récentes           |
| GET    | `/bridge/v1/operations/{id}`        | Détails d'une opération bridge spécifique      |
| GET    | `/bridge/v1/locked/{chain}/{asset}` | Valeur totale verrouillée pour une paire chaîne/actif |
| GET    | `/bridge/v1/limits/{chain}`         | Limites de débit et seuils pour une chaîne bridgée |
| GET    | `/bridge/v1/estimate`               | Estime les frais et le délai de transfert du bridge |

## Module PQC

| Méthode | Point de terminaison         | Description                                    |
| ------ | ---------------------------- | ----------------------------------------------- |
| GET    | `/pqc/v1/params`             | Paramètres actuels du module PQC               |
| GET    | `/pqc/v1/accounts/{address}` | État des clés PQC pour un compte spécifique    |
| GET    | `/pqc/v1/stats`              | Statistiques agrégées d'enregistrement et de migration PQC |

## Module Reputation

| Méthode | Point de terminaison                  | Description                               |
| ------ | ------------------------------------- | ------------------------------------------ |
| GET    | `/reputation/v1/validators`           | Scores de réputation pour tous les validateurs |
| GET    | `/reputation/v1/validators/{address}` | Score de réputation pour un validateur spécifique |

## Module Cross-VM

| Méthode | Point de terminaison       | Description                              |
| ------ | -------------------------- | ------------------------------------------ |
| GET    | `/crossvm/v1/message/{id}` | Récupère un message cross-VM par ID       |
| GET    | `/crossvm/v1/pending`      | Liste les messages cross-VM en attente dans la file |
| GET    | `/crossvm/v1/params`       | Paramètres actuels du module Cross-VM     |

## Module Multilayer {#multilayer-module}

Depuis la version de chaîne **v3.1.80**, le service de requêtes complet du module multilayer est exposé via REST par le biais du grpc-gateway sous le préfixe `/qorechain/multilayer/v1/...` (auparavant uniquement gRPC), y compris deux **requêtes de lecture d'ancrage d'état** : `anchor/{layer_id}` renvoie le dernier ancrage de règlement pour une couche, et `anchors/{layer_id}` renvoie son historique d'ancrages. Chaque ancrage porte une signature **ML-DSA-87 (Dilithium-5)** sur ses champs canoniques, ce qui permet à un client de récupérer un ancrage et de le vérifier indépendamment — c'est la base on-chain des [reçus de règlement](/rollups/settlement-receipts) du Rollup Development Kit.

| Méthode | Point de terminaison                            | Description                                       |
| ------ | ----------------------------------------------- | --------------------------------------------------- |
| GET    | `/qorechain/multilayer/v1/params`               | Paramètres actuels du module Multilayer            |
| GET    | `/qorechain/multilayer/v1/layers`               | Liste toutes les couches enregistrées              |
| GET    | `/qorechain/multilayer/v1/layers/{layer_id}`    | Détails d'une couche spécifique                    |
| GET    | `/qorechain/multilayer/v1/anchor/{layer_id}`    | Dernier ancrage d'état pour une couche             |
| GET    | `/qorechain/multilayer/v1/anchors/{layer_id}`   | Historique des ancrages d'état pour une couche     |
| GET    | `/qorechain/multilayer/v1/routing-stats`        | Statistiques de routage des transactions entre couches |

Un `StateAnchorView` contient `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, `main_chain_height`, `anchored_at`, `pqc_aggregate_signature`, `transaction_count`, et `compressed_state_proof`. Le message canonique signé est `layer_id || layer_height || state_root || validator_set_hash`, vérifié par rapport à la clé PQC enregistrée du créateur de la couche.

Les points de terminaison à chemin plus court suivants restent disponibles :

| Méthode | Point de terminaison           | Description                                  |
| ------ | ------------------------------ | ----------------------------------------------- |
| GET    | `/multilayer/v1/layer/{id}`    | Détails d'une couche spécifique              |
| GET    | `/multilayer/v1/layers`        | Liste toutes les couches enregistrées        |
| GET    | `/multilayer/v1/anchor/{id}`   | Détails d'un enregistrement d'ancrage spécifique |
| GET    | `/multilayer/v1/anchors`       | Liste les soumissions d'ancrage récentes     |
| GET    | `/multilayer/v1/routing-stats` | Statistiques de routage des transactions entre couches |
| GET    | `/multilayer/v1/params`        | Paramètres actuels du module Multilayer      |

## Module SVM

| Méthode | Point de terminaison        | Description                                       |
| ------ | --------------------------- | --------------------------------------------------- |
| GET    | `/svm/v1/params`            | Paramètres actuels du module SVM                   |
| GET    | `/svm/v1/account/{address}` | Informations de compte SVM pour une adresse donnée |
| GET    | `/svm/v1/program/{address}` | Informations sur le programme déployé pour une adresse de programme donnée |

## Module RL Consensus

Les paramètres de réglage PRISM et l'état de l'agent d'apprentissage par renforcement sont exposés via ce module.

| Méthode | Point de terminaison          | Description                             |
| ------ | ----------------------------- | ------------------------------------------ |
| GET    | `/rlconsensus/v1/agent`       | État et mode actuels de l'agent PRISM   |
| GET    | `/rlconsensus/v1/observation` | Dernier vecteur d'observation           |
| GET    | `/rlconsensus/v1/rewards`     | Métriques de récompense cumulées        |
| GET    | `/rlconsensus/v1/params`      | Paramètres actuels du module PRISM Consensus |
| GET    | `/rlconsensus/v1/policy`      | Configuration et poids de la politique active |

## Module Burn

Depuis la version de chaîne **v3.1.77**, l'état en lecture seule du module burn est exposé via REST par le biais du grpc-gateway sous le préfixe `/qorechain/burn/v1/...` (auparavant uniquement gRPC). Ces points de terminaison servent du vrai JSON on-chain via HTTP pour les explorateurs et la télémétrie des light-nodes. Les `stats` du burn incluent par exemple `gas_burn_rate=0.30`.

| Méthode | Point de terminaison           | Description                          |
| ------ | ------------------------------ | --------------------------------------- |
| GET    | `/qorechain/burn/v1/params`    | Paramètres actuels du module Burn    |
| GET    | `/qorechain/burn/v1/stats`     | Statistiques de burn sur tous les canaux |
| GET    | `/qorechain/burn/v1/records`   | Liste les enregistrements de burn    |
| GET    | `/qorechain/burn/v1/milestone` | Progression du jalon de burn         |

Les points de terminaison à chemin plus court suivants restent disponibles :

| Méthode | Point de terminaison | Description                         |
| ------ | ----------------- | ---------------------------------------- |
| GET    | `/burn/v1/stats`  | Statistiques de burn sur tous les canaux |
| GET    | `/burn/v1/params` | Paramètres actuels du module Burn        |

## Module xQORE

| Méthode | Point de terminaison           | Description                                |
| ------ | ------------------------------ | ---------------------------------------------- |
| GET    | `/xqore/v1/position/{address}` | Position de staking xQORE pour une adresse donnée |
| GET    | `/xqore/v1/params`             | Paramètres actuels du module xQORE         |

## Module Inflation

| Méthode | Point de terminaison   | Description                         |
| ------ | ---------------------- | ---------------------------------------- |
| GET    | `/inflation/v1/rate`   | Taux d'inflation annualisé actuel   |
| GET    | `/inflation/v1/epoch`  | Numéro d'époque actuel et progression |
| GET    | `/inflation/v1/params` | Paramètres actuels du module Inflation |

## Module RDK

| Méthode | Point de terminaison         | Description                           |
| ------ | ---------------------------- | ---------------------------------------- |
| GET    | `/rdk/v1/rollup/{id}`        | Détails d'un rollup spécifique        |
| GET    | `/rdk/v1/rollups`            | Liste tous les rollups enregistrés    |
| GET    | `/rdk/v1/batch/{id}/{index}` | Récupère un lot (batch) de règlement spécifique |
| GET    | `/rdk/v1/batches/{id}`       | Liste les lots pour un rollup spécifique |
| GET    | `/rdk/v1/blob/{id}/{index}`  | Récupère un blob DA spécifique        |
| GET    | `/rdk/v1/params`             | Paramètres actuels du module RDK      |

## Module Babylon

| Méthode | Point de terminaison             | Description                              |
| ------ | -------------------------------- | -------------------------------------------- |
| GET    | `/babylon/v1/staking/{address}`  | Position de staking BTC pour une adresse donnée |
| GET    | `/babylon/v1/checkpoint/{epoch}` | Données de checkpoint BTC pour une époque donnée |
| GET    | `/babylon/v1/params`             | Paramètres actuels du module Babylon     |

## Module Abstract Account

Depuis la version de chaîne **v3.1.85**, le service de requêtes abstract-account est exposé via REST par le biais du grpc-gateway sous le préfixe `/qorechain/abstractaccount/v1/...`, y compris le **schéma de permissions** utilisé pour valider les portées d'[authentificateur](/developer-guide/account-abstraction#authenticators) sans les coder en dur.

| Méthode | Point de terminaison                                  | Description                                            |
| ------ | ----------------------------------------------------- | --------------------------------------------------------- |
| GET    | `/qorechain/abstractaccount/v1/config`                | Configuration du module (sonde de fonctionnalité : `enabled`) |
| GET    | `/qorechain/abstractaccount/v1/accounts`              | Liste les comptes abstraits                            |
| GET    | `/qorechain/abstractaccount/v1/accounts/{address}`    | État de compte abstrait pour une adresse                |
| GET    | `/qorechain/abstractaccount/v1/permission_schema`     | Taxonomie des permissions, correspondance message→permission, messages non délégables |

Les points de terminaison à chemin plus court suivants restent disponibles :

| Méthode | Point de terminaison                    | Description                                  |
| ------ | ---------------------------------------- | ------------------------------------------------ |
| GET    | `/abstractaccount/v1/account/{address}` | Détails du compte abstrait pour une adresse donnée |
| GET    | `/abstractaccount/v1/params`            | Paramètres actuels du module Abstract Account |

## Module FairBlock

| Méthode | Point de terminaison   | Description                                |
| ------ | ---------------------- | ---------------------------------------------- |
| GET    | `/fairblock/v1/config` | Configuration actuelle du chiffrement FairBlock |
| GET    | `/fairblock/v1/params` | Paramètres actuels du module FairBlock     |

## Module Gas Abstraction

| Méthode | Point de terminaison                 | Description                               |
| ------ | ------------------------------------ | --------------------------------------------- |
| GET    | `/gasabstraction/v1/accepted-tokens` | Liste les tokens acceptés pour le paiement du gas |
| GET    | `/gasabstraction/v1/params`          | Paramètres actuels du module Gas Abstraction |

## Réflexion gRPC

La réflexion du serveur gRPC (gRPC reflection) est activée par défaut, ce qui permet à des outils comme `grpcurl` de découvrir les services disponibles :

```bash
grpcurl -plaintext localhost:9090 list
```

Pour interroger un service spécifique :

```bash
grpcurl -plaintext localhost:9090 qorechain.pqc.v1.Query/Params
```

## Authentification

Tous les points de terminaison REST et gRPC sont non authentifiés par défaut. Pour les déploiements en production, placez un reverse proxy (par ex. Nginx ou Caddy) devant le nœud pour gérer la terminaison TLS et le contrôle d'accès.
