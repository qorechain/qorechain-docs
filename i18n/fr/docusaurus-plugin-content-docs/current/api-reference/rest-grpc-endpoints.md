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
| REST      | `1317`       | HTTP/1.1  | Passerelle REST (serveur d'API du Cosmos SDK) |
| gRPC      | `9090`       | HTTP/2    | Service gRPC encodé en Protobuf    |
| RPC       | `26657`      | HTTP + WS | RPC du moteur de consensus QoreChain |

Tous les points de terminaison REST renvoient du JSON. Les points de terminaison gRPC utilisent Protocol Buffers et peuvent être consommés avec n'importe quel client gRPC. L'interface RPC fournit des requêtes au niveau du consensus et la diffusion de transactions.

:::note
Ces interfaces sont disponibles à la fois sur le mainnet **`qorechain-vladi`** (en production depuis le 29 juin 2026) et sur le testnet **`qorechain-diana`**. Les URL de base ci-dessous supposent un nœud exécuté localement. Les points de terminaison hébergés publics sont `https://api.qore.host` / `https://api-testnet.qore.host` (REST) et `https://rpc.qore.host` / `https://rpc-testnet.qore.host` (RPC), répertoriés dans [Réseaux](/appendix/networks#public-endpoints). **Il n'existe aucun point de terminaison gRPC public** : les noms d'hôte `grpc.qore.host` et `grpc-testnet.qore.host` n'existent pas, exécutez donc votre propre nœud si vous avez besoin de gRPC.
:::

## URL de base

```
REST:  http://localhost:1317
gRPC:  localhost:9090
RPC:   http://localhost:26657
```

## Routes disponibles {#which-routes-exist}

Les modules propres à QoreChain sont exposés via REST sous le préfixe `/qorechain/<module>/v1/...`, et seuls les modules listés ci-dessous disposent de routes REST. Les autres modules ne sont accessibles qu'en **gRPC** (voir [Modules gRPC uniquement](#grpc-only-modules)). Les routes standard du Cosmos SDK, d'EVM et de CosmWasm sont listées dans [Routes standard](#standard-routes).

Une route qui n'existe pas répond par un HTTP `501` avec `{"code":12,"message":"Not Implemented"}`. Cela signifie que la route n'est pas servie, et non que la requête a renvoyé un résultat vide. Les chemins raccourcis sans le préfixe `/qorechain/` (par exemple `/bridge/v1/chains` ou `/pqc/v1/params`) ne sont **pas** servis. Un enregistrement inconnu sur une route qui existe renvoie un HTTP `404` avec `{"code":5,"message":"... not found"}`.

Les exemples ci-dessous utilisent l'hôte public du mainnet ; remplacez-le par `https://api-testnet.qore.host` pour le testnet.

## Module PQC {#pqc-module}

| Méthode | Point de terminaison                     | Description                                                                 |
| ------ | ---------------------------------------- | --------------------------------------------------------------------------- |
| GET    | `/qorechain/pqc/v1/account/{address}`    | Enregistrement de la clé post-quantique d'un compte (`found`, type de clé, algorithme) |
| GET    | `/qorechain/pqc/v1/evm_window/{address}` | La fenêtre d'autorisation du compte sur la voie EVM et ce qu'il en reste    |

Notez que le segment de chemin est le singulier `account`. Il n'existe aucune route `/qorechain/pqc/v1/params` ni `/stats`.

```bash
curl -s https://api.qore.host/qorechain/pqc/v1/account/qor1...
```

```json
{
  "found": true,
  "account": {
    "address": "qor1...",
    "public_key": "<base64 ML-DSA-87 public key>",
    "algorithm_id": 1,
    "algorithm_name": "dilithium5",
    "ecdsa_pubkey": null,
    "key_type": "hybrid",
    "created_at_height": "209015",
    "migration_public_key": null,
    "migration_algorithm_id": 0
  }
}
```

Un compte sans clé enregistrée renvoie `{"found": false, "account": null}`. Utilisez `found` pour déterminer si un compte doit enregistrer une clé avant de pouvoir envoyer.

```bash
curl -s https://api.qore.host/qorechain/pqc/v1/evm_window/qor1...
```

```json
{
  "found": false,
  "live": false,
  "opened_height": "0",
  "expiry_height": "0",
  "max_txs": "0",
  "used_txs": "0",
  "max_value": "",
  "used_value": "",
  "remaining_blocks": "0",
  "remaining_txs": "0",
  "remaining_value": ""
}
```

Cette route n'échoue jamais pour une adresse sans fenêtre ; elle renvoie `found: false`. Depuis la v3.2.0, la voie EVM n'admet une transaction que depuis un compte qui possède une clé PQC enregistrée **et** une fenêtre ouverte. `live` vaut `true` tant que la fenêtre admet au moins une transaction de plus à la hauteur actuelle. `remaining_blocks`, `remaining_txs` et `remaining_value` indiquent quelle borne est la plus proche de l'épuisement ; les valeurs sont des entiers en `uqor` renvoyés sous forme de chaînes. Consultez [Développement EVM](/developer-guide/evm-development) pour le fonctionnement de la voie EVM.

## Module Bridge {#bridge-module}

L'état en lecture seule du module bridge est exposé via REST sous `/qorechain/bridge/v1/...` (il sert du vrai JSON on-chain depuis la version de chaîne **v3.1.77**). Le `config` du bridge indique par exemple `min_validators=10` et `attestation_threshold=7`.

| Méthode | Point de terminaison                        | Description                              |
| ------ | ------------------------------------------- | ---------------------------------------- |
| GET    | `/qorechain/bridge/v1/config`               | Configuration actuelle du module bridge  |
| GET    | `/qorechain/bridge/v1/chains`               | Liste toutes les chaînes bridge enregistrées |
| GET    | `/qorechain/bridge/v1/chains/{chain_id}`    | Détails d'une chaîne bridgée spécifique  |
| GET    | `/qorechain/bridge/v1/validators`           | Liste les validateurs bridge enregistrés |
| GET    | `/qorechain/bridge/v1/validators/{address}` | Détails d'un validateur bridge spécifique |
| GET    | `/qorechain/bridge/v1/operations`           | Liste les opérations bridge              |
| GET    | `/qorechain/bridge/v1/operations/{id}`      | Détails d'une opération bridge spécifique |

```bash
curl -s https://api.qore.host/qorechain/bridge/v1/config
```

```json
{
  "config": {
    "min_validators": 10,
    "attestation_threshold": 7,
    "challenge_period_secs": "86400",
    "large_transfer_threshold": "100000000000",
    "enabled": true
  }
}
```

`chains/{chain_id}` renvoie une entrée telle que `{"chain": {"chain_id": "ethereum", "name": "Ethereum", "chain_type": "evm", "bridge_contract": "0x000…0", "status": "pending", "min_confirmations": 12, ...}}`.

:::caution Le bridge n'est pas encore en production
Les 37 chaînes bridge configurées indiquent `"status": "pending"` sur les deux réseaux, et `validators` et `operations` sont des listes vides. Ces routes présentent la configuration du module ; elles ne signifient pas que des actifs peuvent être bridgés aujourd'hui. Voir [Architecture du bridge](/architecture/bridge-architecture).
:::

## Module Multilayer {#multilayer-module}

Le service de requêtes complet du module multilayer est exposé via REST sous `/qorechain/multilayer/v1/...` (depuis la version de chaîne **v3.1.80**), y compris deux **requêtes de lecture d'ancrage d'état** : `anchor/{layer_id}` renvoie le dernier ancrage de règlement pour une couche, et `anchors/{layer_id}` renvoie son historique d'ancrages. Chaque ancrage porte une signature **ML-DSA-87 (Dilithium-5)** sur ses champs canoniques, ce qui permet à un client de récupérer un ancrage et de le vérifier indépendamment — c'est la base on-chain des [reçus de règlement](/rollups/settlement-receipts) du Rollup Development Kit.

| Méthode | Point de terminaison                            | Description                                       |
| ------ | ----------------------------------------------- | ------------------------------------------------- |
| GET    | `/qorechain/multilayer/v1/params`               | Paramètres actuels du module Multilayer           |
| GET    | `/qorechain/multilayer/v1/layers`               | Liste toutes les couches enregistrées             |
| GET    | `/qorechain/multilayer/v1/layers/{layer_id}`    | Détails d'une couche spécifique                   |
| GET    | `/qorechain/multilayer/v1/anchor/{layer_id}`    | Dernier ancrage d'état pour une couche            |
| GET    | `/qorechain/multilayer/v1/anchors/{layer_id}`   | Historique des ancrages d'état pour une couche    |
| GET    | `/qorechain/multilayer/v1/routing-stats`        | Statistiques de routage des transactions entre couches |

Un `StateAnchorView` contient `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, `main_chain_height`, `anchored_at`, `pqc_aggregate_signature`, `transaction_count` et `compressed_state_proof`. Le message canonique signé est `layer_id || layer_height || state_root || validator_set_hash`, vérifié par rapport à la clé PQC enregistrée du créateur de la couche. Une couche sans ancrage renvoie un HTTP `404` (`no anchor for layer ...`) depuis `anchor/{layer_id}` et une liste vide (`{"anchors": []}`) depuis `anchors/{layer_id}`.

```bash
curl -s https://api.qore.host/qorechain/multilayer/v1/params
```

```json
{
  "params": {
    "max_sidechains": "10",
    "max_paychains": "50",
    "min_anchor_interval": "100",
    "max_anchor_interval": "1000",
    "default_challenge_period": "86400",
    "min_sidechain_stake": "1000000000",
    "min_paychain_stake": "100000000",
    "routing_enabled": true,
    "routing_confidence_threshold": "0.6",
    "cross_layer_fee_bundling": true
  }
}
```

Au moment de la rédaction, `layers` est une liste vide sur les deux réseaux.

## Module Burn {#burn-module}

L'état en lecture seule du module burn est exposé via REST sous `/qorechain/burn/v1/...`. Les `params` du burn incluent par exemple `gas_burn_rate=0.30`.

| Méthode | Point de terminaison                  | Description                                                    |
| ------ | ------------------------------------- | -------------------------------------------------------------- |
| GET    | `/qorechain/burn/v1/params`           | Paramètres actuels du module Burn                              |
| GET    | `/qorechain/burn/v1/stats`            | Total cumulé brûlé, ventilé par source                         |
| GET    | `/qorechain/burn/v1/records`          | Liste les enregistrements de burn récents                      |
| GET    | `/qorechain/burn/v1/milestone`        | Progression du jalon de burn (nombre cumulé de transactions)   |
| GET    | `/qorechain/burn/v1/stranded_rewards` | Part des stakers mise de côté par la mise à niveau v3.2.0 et pas encore libérée |

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stats
```

```json
{
  "stats": {
    "total_burned": "31560093291491",
    "burns_by_source": {
      "gas_fee": "31560093291491",
      "failed_tx": "0",
      "milestone": "0",
      "amm": "0",
      "xqore_penalty": "0"
    },
    "last_burn_height": "3506945"
  }
}
```

La réponse réelle liste chaque source de burn (`ai_service`, `amm`, `auto_buyback`, `bridge_fee`, `contract_create`, `failed_tx`, `gas_fee`, `milestone`, `rollup_create`, `tge`, `treasury_buyback`, `xqore_penalty`) ; l'exemple est abrégé. Les montants sont en `uqor`.

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stranded_rewards
```

```json
{ "reserved": "6693045921330", "released": "0", "initialized": true, "snapshot_height": "2981742" }
```

`reserved` correspond à ce qu'il reste à libérer, `released` à ce que la gouvernance a déjà fait sortir, et `snapshot_height` à la hauteur de la mise à niveau v3.2.0 qui a enregistré la réserve. Voir [Tokenomics](/architecture/tokenomics).

## Module Abstract Account {#abstract-account-module}

Le service de requêtes abstract-account est exposé via REST sous `/qorechain/abstractaccount/v1/...` (depuis la version de chaîne **v3.1.85**), y compris le **schéma de permissions** utilisé pour valider les portées d'[authentificateur](/developer-guide/account-abstraction#authenticators) sans les coder en dur.

| Méthode | Point de terminaison                                  | Description                                                         |
| ------ | ----------------------------------------------------- | ------------------------------------------------------------------- |
| GET    | `/qorechain/abstractaccount/v1/config`                | Configuration du module (sonde de fonctionnalité : `enabled`)       |
| GET    | `/qorechain/abstractaccount/v1/accounts`              | Liste les comptes abstraits                                         |
| GET    | `/qorechain/abstractaccount/v1/accounts/{address}`    | État de compte abstrait pour une adresse (`404` s'il n'y en a pas)  |
| GET    | `/qorechain/abstractaccount/v1/permission_schema`     | `schema_version`, `permissions`, `msg_permissions`, `key_management_msgs` |

```bash
curl -s https://api.qore.host/qorechain/abstractaccount/v1/config
```

```json
{ "config": { "enabled": false, "max_session_keys": 10, "max_spending_rules": 5, "default_session_ttl": "86400" } }
```

:::note Désactivé sur les deux réseaux
`enabled` vaut `false` aujourd'hui sur le mainnet comme sur le testnet : les fonctionnalités de compte abstrait, telles que la dépense depuis des portefeuilles liés, ne sont donc pas disponibles. Utilisez `config.enabled` comme sonde de fonctionnalité avant de vous appuyer sur ce module. Voir [Abstraction de compte](/developer-guide/account-abstraction).
:::

## Module AMM {#amm-module}

| Méthode | Point de terminaison                               | Description                                              |
| ------ | -------------------------------------------------- | -------------------------------------------------------- |
| GET    | `/qorechain/amm/v1/params`                         | Paramètres actuels de l'AMM (frais en points de base, limites) |
| GET    | `/qorechain/amm/v1/pools`                          | Liste les pools                                          |
| GET    | `/qorechain/amm/v1/pools/{pool_id}`                | Un pool (`404` s'il est inconnu)                         |
| GET    | `/qorechain/amm/v1/pools/{pool_id}/lp/{address}`   | Solde en tokens LP d'une adresse dans un pool            |
| GET    | `/qorechain/amm/v1/pool_by_denoms?denom_a=&denom_b=` | Trouve le pool d'une paire de denoms (`404` s'il n'y en a pas) |
| GET    | `/qorechain/amm/v1/quote/exact_in?pool_id=&denom_in=&amount_in=`   | Cotation : sortie pour une entrée exacte |
| GET    | `/qorechain/amm/v1/quote/exact_out?pool_id=&denom_out=&amount_out=` | Cotation : entrée nécessaire pour une sortie exacte |

```bash
curl -s https://api.qore.host/qorechain/amm/v1/params
```

```json
{
  "params": {
    "swap_fee_bps": 30,
    "protocol_fee_bps": 10,
    "min_liquidity": "1000",
    "max_pools_per_creator": 50,
    "lp_token_decimals": 6,
    "pool_creation_fee": "100000000",
    "max_swap_impact_bps": 500,
    "enabled": true
  }
}
```

Au moment de la rédaction, il n'existe aucun pool sur les deux réseaux (`{"pools": []}`), et une cotation pour un pool inconnu renvoie un HTTP `400` avec `{"code":3,"message":"pool not found"}`.

## Module Licence {#licence-module}

| Méthode | Point de terminaison                                  | Description                                                      |
| ------ | ----------------------------------------------------- | ---------------------------------------------------------------- |
| GET    | `/qorechain/license/v1/check/{grantee}/{feature_id}`  | Indique si `grantee` détient une autorisation active pour la fonctionnalité (`404` s'il n'y en a pas) |
| GET    | `/qorechain/license/v1/holders/{feature_id}`          | Toutes les autorisations pour une fonctionnalité                 |
| GET    | `/qorechain/license/v1/list/{grantee}`                | Toutes les autorisations détenues par une adresse                |

Une autorisation (`LicenseView`) comporte `grantee`, `feature_id`, `expires_at`, `granted_at`, `granted_by`, `suspended` et `metadata`. `check` renvoie également `active`. Une requête list ou holders sans correspondance renvoie `{"licenses": []}` ; `check` pour une adresse sans autorisation renvoie un HTTP `404` avec `{"code":5,"message":"no license for <grantee>/<feature_id>"}`.

```bash
curl -s https://api.qore.host/qorechain/license/v1/holders/lightnode_operator
```

```json
{ "licenses": [] }
```

## Module Light Node {#light-node-module}

| Méthode | Point de terminaison                          | Description                                                        |
| ------ | --------------------------------------------- | ------------------------------------------------------------------ |
| GET    | `/qorechain/lightnode/v1/params`              | Paramètres d'enregistrement, de heartbeat et de récompense         |
| GET    | `/qorechain/lightnode/v1/stats`               | `total_registered`, `total_active`, `total_rewards`, `last_reward_height` |
| GET    | `/qorechain/lightnode/v1/nodes`               | Liste les light nodes enregistrés                                  |
| GET    | `/qorechain/lightnode/v1/node/{address}`      | Un nœud (`{"node": null, "found": false}` s'il n'est pas enregistré) |
| GET    | `/qorechain/lightnode/v1/rewards/{address}`   | Récompenses accumulées pour une adresse d'opérateur (`accumulated_rewards`) |
| GET    | `/qorechain/lightnode/v1/reward_pool`         | Comptabilité du pool de récompenses (`balance`, `reserved`, `outstanding`, `payable`, `distributable`, `max_reward_per_block_per_node`, `initialized`) |

```bash
curl -s https://api.qore.host/qorechain/lightnode/v1/params
```

```json
{
  "registration_fee": "1000000",
  "heartbeat_interval": "1000",
  "min_delegated_stake": "1000000000",
  "reward_share": "0.030000000000000000",
  "min_uptime_for_rewards": "0.800000000000000000",
  "max_light_nodes": "10000",
  "heartbeat_grace_period": "100"
}
```

```bash
curl -s https://api.qore.host/qorechain/lightnode/v1/reward_pool
```

```json
{
  "balance": "<uqor>",
  "reserved": "<uqor>",
  "outstanding": "0",
  "payable": "0",
  "max_reward_per_block_per_node": "1713",
  "distributable": "0",
  "initialized": true
}
```

`reserved` est la part du pool qui est mise de côté et ne peut être déplacée que par un vote de gouvernance, et `max_reward_per_block_per_node` (en `uqor`) est le plafond par nœud et par bloc de ce que la chaîne crédite. Un plafond n'est pas un montant promis. `balance` et `reserved` sont affichés ici sous forme d'espaces réservés.

:::note L'enregistrement n'est pas ouvert
`stats` indique `"total_registered": "0"` et `nodes` est vide sur les deux réseaux, et la chaîne refuse l'enregistrement d'un light node sans autorisation de licence `lightnode_operator`. Voir [Light Nodes](/light-node/overview) pour l'état du programme.
:::

## Modules gRPC uniquement {#grpc-only-modules}

Ces modules disposent d'un service `Query` gRPC mais **d'aucune route REST**. Les noms de service suivent le format `qorechain.<module>.v1.Query`.

| Module        | Méthodes de requête gRPC (version de chaîne v3.2.0)    |
| ------------- | ------------------------------------------------------ |
| `ai`          | `Config`, `Stats`                                      |
| `crossvm`     | `Params`, `PendingMessages`, `Message`                 |
| `reputation`  | `Params`                                               |
| `rlconsensus` | `AgentStatus`, `Params`, `Observation`, `Reward`, `Policy` |
| `rdk`         | `Params`, `Rollup`, `Rollups`, `Batch`, `LatestBatch`  |
| `svm`         | `Slot`, `Account`, `Program`                           |
| `qca`         | `Config`                                               |

Utilisez `grpcurl` sur votre propre nœud, ou les [commandes de requête CLI](/cli-reference/query-commands). Les requêtes `rdk` en particulier ne sont **pas** disponibles via REST sur le mainnet (`/qorechain/rdk/v1/...` répond `501`) : les lecteurs de rollups basés sur REST ne peuvent donc pas fonctionner aujourd'hui avec le mainnet.

Les modules xQORE, inflation, restaking BTC (Babylon), FairBlock et abstraction de gas n'ont aucun service de requête dans la version actuelle du mainnet, ni en REST ni en gRPC.

## Routes standard {#standard-routes}

Les routes REST standard du Cosmos SDK, d'IBC, d'EVM et de CosmWasm sont également servies. Exemples vérifiés sur les deux réseaux :

| Point de terminaison                                  | Description                                   |
| ----------------------------------------------------- | --------------------------------------------- |
| `/cosmos/bank/v1beta1/supply`                         | Offre totale                                  |
| `/cosmos/bank/v1beta1/balances/{address}`             | Soldes d'un compte                            |
| `/cosmos/staking/v1beta1/validators`                  | Validateurs                                   |
| `/cosmos/staking/v1beta1/params`                      | Paramètres de staking                         |
| `/cosmos/distribution/v1beta1/params`                 | Paramètres de distribution                    |
| `/cosmos/gov/v1/params/voting`                        | Paramètres de gouvernance                     |
| `/cosmos/slashing/v1beta1/params`                     | Paramètres de slashing                        |
| `/cosmos/upgrade/v1beta1/current_plan`, `/applied_plan/{name}` | Mises à niveau en attente / appliquées |
| `/cosmos/base/node/v1beta1/config`                    | Prix minimal du gas du nœud (`0.1uqor` sur les deux réseaux) |
| `/cosmos/base/tendermint/v1beta1/blocks/latest`       | Dernier bloc                                  |
| `/cosmos/tx/v1beta1/txs`, `/txs/{hash}`, `/txs/block/{height}` | Recherche de transactions / consultation / par bloc |
| `/cosmos/evm/vm/v1/params`                            | Paramètres du module EVM                      |
| `/cosmos/evm/feemarket/v1/params`                     | Paramètres du marché des frais EVM            |
| `/cosmwasm/wasm/v1/codes/params`                      | Permissions d'upload/d'instanciation CosmWasm |
| `/ibc/apps/transfer/v1/params`                        | Paramètres de transfert IBC                   |

Le préfixe CosmWasm est `/cosmwasm/wasm/v1/...` ; `/cosmos/wasm/v1/...` n'est pas servi.

## Réflexion gRPC

Un nœud que vous exécutez vous-même sert gRPC sur le port `9090`. Lorsque la réflexion du serveur est activée, des outils comme `grpcurl` peuvent découvrir les services disponibles :

```bash
grpcurl -plaintext localhost:9090 list
```

Pour interroger un service spécifique :

```bash
grpcurl -plaintext -d '{"address":"qor1..."}' localhost:9090 qorechain.pqc.v1.Query/Account
```

`qorechain.pqc.v1.Query` possède deux méthodes, `Account` et `EVMWindow`. Il n'existe pas de méthode `Params`.

## Authentification

Tous les points de terminaison REST et gRPC sont non authentifiés par défaut. Pour les déploiements en production, placez un reverse proxy (par ex. Nginx ou Caddy) devant le nœud pour gérer la terminaison TLS et le contrôle d'accès.
