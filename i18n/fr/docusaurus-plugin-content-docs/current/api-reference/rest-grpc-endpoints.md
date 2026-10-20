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
Ces interfaces sont disponibles à la fois sur le mainnet **`qorechain-vladi`** (en production depuis le 7 juin 2026 ; version de nœud **v3.2.3**) et sur le testnet **`qorechain-diana`** (version de nœud **v3.2.4**). Les URL de base ci-dessous supposent un nœud exécuté localement. Les points de terminaison hébergés publics sont `https://api.qore.host` / `https://api-testnet.qore.host` (REST) et `https://rpc.qore.host` / `https://rpc-testnet.qore.host` (RPC), répertoriés dans [Réseaux](/appendix/networks#public-endpoints). **Il n'existe aucun point de terminaison gRPC public** : les noms d'hôte `grpc.qore.host` et `grpc-testnet.qore.host` n'existent pas, exécutez donc votre propre nœud si vous avez besoin de gRPC.
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

Les exemples ci-dessous utilisent l'hôte public du mainnet ; remplacez-le par `https://api-testnet.qore.host` pour le testnet. Les valeurs des exemples ont été lues sur les réseaux en production vers le 20 octobre 2026 (mainnet v3.2.3, testnet v3.2.4) et évoluent avec le temps ; servez-vous-en pour connaître la forme d'une réponse. Le testnet exécute la version v3.2.4, plus récente, et sert donc quelques routes et champs que le mainnet n'a pas ; ils sont marqués **testnet uniquement** ci-dessous et répondent `501` sur le mainnet.

## Module PQC {#pqc-module}

| Méthode | Point de terminaison                     | Description                                                                 |
| ------ | ---------------------------------------- | --------------------------------------------------------------------------- |
| GET    | `/qorechain/pqc/v1/account/{address}`    | Enregistrement de la clé post-quantique d'un compte (`found`, type de clé, algorithme) |
| GET    | `/qorechain/pqc/v1/evm_window/{address}` | La fenêtre d'autorisation du compte sur la voie EVM et ce qu'il en reste    |
| GET    | `/qorechain/pqc/v1/evm_delegation_consent/{address}` | Le consentement du compte à la délégation EIP-7702, la délégation actuelle et le nonce EVM (depuis la v3.2.2) |
| GET    | `/qorechain/pqc/v1/protocol_features`    | **Testnet uniquement (v3.2.4).** Toutes les fonctionnalités de protocole que le binaire connaît, avec les indicateurs `enabled`, `known` et `staged` |

Notez que le segment de chemin est le singulier `account`. Il n'existe aucune route `/qorechain/pqc/v1/params` ni `/stats` (utilisez `qorechaind query pqc params` et `stats` pour cela).

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
    "migration_algorithm_id": 0,
    "classical_key_source": "auth_account"
  }
}
```

`classical_key_source` indique d'où provient `ecdsa_pubkey` : `stored` (la clé fournie à l'enregistrement), `auth_account` (rien n'a été stocké, il s'agit donc de la propre clé publique on-chain du compte) ou `none`. Sur le testnet (v3.2.4, **testnet uniquement**), l'enregistrement porte aussi `"possession_proven": false`, qui passe à `true` une fois qu'une clé a été enregistrée avec une [preuve de possession](/developer-guide/post-quantum-signing#proof-of-possession) vérifiée ; le mainnet ne renvoie pas encore ce champ.

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
  "remaining_value": "",
  "native_only": false,
  "allowed_targets": []
}
```

Cette route n'échoue jamais pour une adresse sans fenêtre ; elle renvoie `found: false`. Depuis la v3.2.0, la voie EVM n'admet une transaction que depuis un compte qui possède une clé PQC enregistrée **et** une fenêtre ouverte. `live` vaut `true` tant que la fenêtre admet au moins une transaction de plus à la hauteur actuelle. `remaining_blocks`, `remaining_txs` et `remaining_value` indiquent quelle borne est la plus proche de l'épuisement ; les valeurs sont des entiers en `uqor` renvoyés sous forme de chaînes. Depuis la v3.2.3, une fenêtre peut porter une portée : `native_only` (transferts de QOR simples uniquement) et `allowed_targets` (destinataires listés uniquement). Consultez [Développement EVM](/developer-guide/evm-development#evm-window) pour le fonctionnement de la voie EVM.

```bash
curl -s https://api.qore.host/qorechain/pqc/v1/evm_delegation_consent/qor1...
```

```json
{
  "found": false,
  "live": false,
  "delegate": "",
  "granted_height": "0",
  "expiry_height": "0",
  "current_delegate": "",
  "nonce": "0"
}
```

La délégation EIP-7702 d'un compte ne prend effet qu'avec le consentement post-quantique du compte lui-même (`MsgAuthorizeEVMDelegation`). `found` et `live` indiquent un consentement enregistré et encore utilisable pour `delegate` ; `current_delegate` est la délégation que le compte a définie actuellement et `nonce` est son nonce EVM.

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

Un `StateAnchorView` contient `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, `main_chain_height`, `anchored_at`, `pqc_aggregate_signature`, `transaction_count` et `compressed_state_proof`. Depuis la v3.2.2, le message signé est le **message d'ancrage v2** : le tag de domaine `qorechain-multilayer-anchor-v2`, puis l'identifiant de chaîne, l'identifiant de couche, la hauteur de couche, la racine d'état, le hash de l'ensemble de validateurs, le nombre de transactions et la preuve d'état compressée, chaque champ de longueur variable étant préfixé par sa longueur sur 8 octets en big-endian (l'ancien message v1 n'avait ni identifiant de chaîne ni préfixes de longueur, de sorte qu'une signature était valide sur toutes les chaînes). Il est vérifié par rapport à la clé PQC enregistrée du créateur de la couche. `qorechaind query rdk anchor-sign-bytes` affiche les octets pour un lot de rollup. Une couche sans ancrage renvoie un HTTP `404` (`no anchor for layer ...`) depuis `anchor/{layer_id}` et une liste vide (`{"anchors": []}`) depuis `anchors/{layer_id}`.

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
| GET    | `/qorechain/burn/v1/stranded_rewards` | Part des stakers mise de côté et pas encore libérée par la gouvernance |

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stats
```

```json
{
  "stats": {
    "total_burned": "31574710367921",
    "burns_by_source": {
      "gas_fee": "31574710282421",
      "failed_tx": "85500",
      "milestone": "0",
      "amm": "0",
      "xqore_penalty": "0"
    },
    "last_burn_height": "3666968"
  }
}
```

La réponse réelle liste chaque source de burn (`ai_service`, `amm`, `auto_buyback`, `bridge_fee`, `contract_create`, `failed_tx`, `gas_fee`, `milestone`, `rollup_create`, `tge`, `treasury_buyback`, `xqore_penalty`) ; l'exemple est abrégé. Les montants sont en `uqor`. `failed_tx` est non nul depuis la mise à niveau v3.2.2, lorsque le burn des transactions échouées a commencé à s'appliquer aux frais réellement prélevés. Depuis la v3.2.3, les anciens `records` de burn individuels sont élagués ; `records` est donc une fenêtre récente et non l'historique complet, tandis que les totaux de `stats` sont cumulés.

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stranded_rewards
```

```json
{ "reserved": "3807496785528", "released": "6693045921330", "initialized": true, "snapshot_height": "2981742" }
```

`reserved` correspond à ce qu'il reste à libérer, `released` à ce que la gouvernance a déjà fait sortir, et `snapshot_height` à la hauteur de la mise à niveau v3.2.0 qui a enregistré la réserve. Les valeurs ci-dessus sont celles du moment de la rédaction : la gouvernance a libéré le premier montant (6 693 045,921330 QOR) le 19 octobre 2026, et la mise à niveau v3.2.3 a recalculé la réserve restante à sa propre hauteur (3 807 496,785528 QOR). Une autre proposition de gouvernance visant à libérer ce montant recalculé était encore en période de vote au moment de la rédaction ; lisez donc les valeurs en direct. Voir [Tokenomics](/architecture/tokenomics).

## Module Abstract Account {#abstract-account-module}

Le service de requêtes abstract-account est exposé via REST sous `/qorechain/abstractaccount/v1/...` (depuis la version de chaîne **v3.1.85**), y compris le **schéma de permissions** utilisé pour valider les portées d'[authentificateur](/developer-guide/account-abstraction#authenticators) sans les coder en dur.

| Méthode | Point de terminaison                                  | Description                                                         |
| ------ | ----------------------------------------------------- | ------------------------------------------------------------------- |
| GET    | `/qorechain/abstractaccount/v1/config`                | Configuration du module (sonde de fonctionnalité : `enabled`)       |
| GET    | `/qorechain/abstractaccount/v1/accounts`              | Liste les comptes abstraits                                         |
| GET    | `/qorechain/abstractaccount/v1/accounts/{address}`    | État de compte abstrait pour une adresse (`404` s'il n'y en a pas)  |
| GET    | `/qorechain/abstractaccount/v1/permission_schema`     | `schema_version`, `permissions`, `msg_permissions`, `key_management_msgs`, `lane_rules` |
| GET    | `/qorechain/abstractaccount/v1/auth_nonce/{address}/{pubkey_hex}` | **Testnet uniquement (v3.2.4).** La séquence que doit signer ensuite une clé d'authentificateur liée (`nonce`, `linked`) |

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
{
  "licenses": [
    {
      "grantee": "qor1...",
      "feature_id": "lightnode_operator",
      "expires_at": "0",
      "granted_at": "3536305",
      "granted_by": "qor1...",
      "suspended": false,
      "metadata": "",
      "active": true
    }
  ]
}
```

`expires_at: "0"` signifie que l'autorisation n'expire pas. Depuis la v3.2.3, la gouvernance peut remplacer l'autorité de licence qui accorde ces licences (`MsgUpdateAuthority`) ; les autorisations déjà accordées restent en place.

## Module Light Node {#light-node-module}

| Méthode | Point de terminaison                          | Description                                                        |
| ------ | --------------------------------------------- | ------------------------------------------------------------------ |
| GET    | `/qorechain/lightnode/v1/params`              | Paramètres d'enregistrement, de heartbeat et de récompense         |
| GET    | `/qorechain/lightnode/v1/stats`               | `total_registered`, `total_active`, `total_rewards`, `last_reward_height` |
| GET    | `/qorechain/lightnode/v1/nodes`               | Liste les light nodes enregistrés                                  |
| GET    | `/qorechain/lightnode/v1/node/{address}`      | Un nœud (`{"node": null, "found": false}` s'il n'est pas enregistré) |
| GET    | `/qorechain/lightnode/v1/rewards/{address}`   | Récompenses accumulées pour une adresse d'opérateur (`accumulated_rewards`) |
| GET    | `/qorechain/lightnode/v1/reward_pool`         | Comptabilité du pool de récompenses (`balance`, `reserved`, `outstanding`, `payable`, `distributable`, `max_reward_per_block_per_node`, `max_reward_per_month_per_node`, `initialized`) |

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
  "balance": "487231800",
  "reserved": "487231800",
  "outstanding": "0",
  "payable": "0",
  "max_reward_per_block_per_node": "1713",
  "distributable": "0",
  "initialized": true,
  "max_reward_per_month_per_node": "2000000000"
}
```

`reserved` est la part du pool qui est mise de côté et ne peut être déplacée que par un vote de gouvernance. Les bornes par nœud sont en `uqor` : `max_reward_per_block_per_node` est le plafond par bloc et, depuis la v3.2.3, `max_reward_per_month_per_node` (`2000000000` uqor = 2 000 QOR par période de 30 jours) est le plafond mensuel, calculé au prorata du temps de bloc et de la disponibilité, de sorte qu'il ne dépend plus de la vitesse à laquelle les blocs arrivent. Un plafond n'est pas un montant promis. L'exemple est la réponse réelle du mainnet au moment de la rédaction, après que la gouvernance a libéré la réserve précédente (proposition 8, 19 octobre 2026). Sur le testnet (v3.2.4, **testnet uniquement**), la réponse comporte aussi `monthly_cap_active`, `last_distribution_time` et `last_distribution_height`, et la borne d'un nœud démarre à son propre enregistrement.

:::note L'enregistrement nécessite une licence
La chaîne refuse l'enregistrement d'un light node sans autorisation de licence `lightnode_operator` active (`holders/lightnode_operator` liste les autorisations). Au moment de la rédaction, `stats` indique `"total_registered": "0"` sur le mainnet et un nœud enregistré sur le testnet. Voir [Light Nodes](/light-node/overview) pour l'état du programme.
:::

## Module RDK {#rdk-module}

Le service de requêtes du Rollup Development Kit est exposé via REST sous `/qorechain/rdk/v1/...` (depuis la version de chaîne **v3.2.2** ; en v3.2.0 et v3.2.1, il n'était disponible qu'en gRPC).

| Méthode | Point de terminaison                                  | Description                                          |
| ------ | ----------------------------------------------------- | ---------------------------------------------------- |
| GET    | `/qorechain/rdk/v1/params`                            | Paramètres du module                                 |
| GET    | `/qorechain/rdk/v1/rollups`                           | Liste les rollups                                    |
| GET    | `/qorechain/rdk/v1/rollup/{rollup_id}`                | Un rollup (`404` s'il est inconnu)                   |
| GET    | `/qorechain/rdk/v1/latest_batch/{rollup_id}`          | Le dernier lot de règlement du rollup                |
| GET    | `/qorechain/rdk/v1/batch/{rollup_id}/{batch_index}`   | Un lot de règlement                                  |
| GET    | `/qorechain/rdk/v1/batches/{rollup_id}`               | Les lots du rollup dans l'ordre de leur index (paginé) |
| GET    | `/qorechain/rdk/v1/blob/{rollup_id}/{blob_index}`     | Un enregistrement de blob de disponibilité des données |

```bash
curl -s https://api.qore.host/qorechain/rdk/v1/params
```

```json
{
  "params": {
    "max_rollups": 100,
    "min_stake_for_rollup": "10000000000",
    "rollup_creation_burn_rate": "0.01",
    "default_challenge_window": "604800",
    "max_da_blob_size": "2097152",
    "blob_retention_blocks": "432000",
    "max_batches_per_block": 10
  }
}
```

Au moment de la rédaction, `rollups` est une liste vide sur les deux réseaux ; les routes par rollup répondent donc `404` (par exemple `{"code":5,"message":"rollup foo not found"}`). `default_challenge_window` est exprimé en secondes (`604800`). Sur le testnet (v3.2.4, **testnet uniquement**), la fenêtre de contestation optimiste est mesurée en temps de bloc.

## Module Inflation {#inflation-module}

Les paramètres d'émission et leur progression sont exposés via REST sous `/qorechain/inflation/v1/...` (depuis la version de chaîne **v3.2.2**). Ils ne sont pas disponibles via une commande CLI.

| Méthode | Point de terminaison                  | Description                                                                 |
| ------ | ------------------------------------- | --------------------------------------------------------------------------- |
| GET    | `/qorechain/inflation/v1/params`      | Paramètres d'émission : `emission_mode`, `fixed_epoch_emission`, `max_total_emission`, `epoch_length`, `enabled` |
| GET    | `/qorechain/inflation/v1/epoch_info`  | Progression : `current_epoch`, `block_start`, `next_epoch_height`, `total_minted`, `max_total_emission`, `remaining_emission` |

```bash
curl -s https://api.qore.host/qorechain/inflation/v1/params
curl -s https://api.qore.host/qorechain/inflation/v1/epoch_info
```

Sur le mainnet, `emission_mode` vaut `"fixed"`, `fixed_epoch_emission` vaut `"86000000000"` (86 000 QOR par époque), `epoch_length` vaut `"43200"` blocs et `max_total_emission` vaut `"590000000000000"` (590 000 000 QOR, le plafond cumulé). Ces valeurs ont été fixées par la proposition de gouvernance 10 (adoptée le 19 octobre 2026) ; la première époque qui utilise le nouveau montant fixe commence au bloc 3 672 000, et `epoch_info` indique l'époque en cours et le montant émis jusqu'ici. La liste `schedule` de la réponse relève du mode `schedule` d'origine ; elle ne décrit pas ce qu'émet une époque en mode fixe. Tous les montants sont en `uqor`. Le testnet renvoie ses propres valeurs, différentes. Sur le testnet uniquement (v3.2.4, **testnet uniquement**), il existe un troisième mode, `target_apy`, avec un champ `target_apy_bps`, utilisé par le bonus du module staking-tiers ; le mainnet n'a pas de tel mode.

## Module Gas Abstraction {#gas-abstraction-module}

| Méthode | Point de terminaison                                  | Description                                                                 |
| ------ | ----------------------------------------------------- | --------------------------------------------------------------------------- |
| GET    | `/qorechain/gasabstraction/v1/config`                 | Tokens de frais acceptés, prime, plafond de conversion par bloc             |
| GET    | `/qorechain/gasabstraction/v1/conversion_rate?denom=` | Ce que vaut une unité d'un token de frais en `uqor`, et s'il est `usable`   |
| GET    | `/qorechain/gasabstraction/v1/float`                  | L'adresse du float de conversion, ses soldes et son utilisation dans ce bloc |

```bash
curl -s https://api.qore.host/qorechain/gasabstraction/v1/config
```

```json
{
  "config": {
    "enabled": true,
    "native_denom": "uqor",
    "accepted_tokens": [
      { "denom": "uqor", "conversion_rate": "1.0", "price_source": "", "rate_expiry_height": "0",
        "pool_id": "0", "min_liquidity": "", "max_deviation_bps": 0 }
    ],
    "premium_bps": 300,
    "max_tip_multiplier": 3,
    "float_min": "0",
    "block_conversion_cap": "0"
  }
}
```

La liste des tokens acceptés ne contient que l'`uqor` natif sur les deux réseaux : les frais sont donc payés en `uqor` et aucune conversion n'a lieu. La gouvernance ajoute un token (avec un pool, une liquidité minimale et un écart maximal entre le prix moyenné dans le temps et le prix spot) ; des frais payés dans un tel token sont convertis via un float de QOR et réapprovisionnés via un pool AMM. `conversion_rate` sans `?denom=` répond `500` (`denom is required`).

## Module Staking Tiers (testnet uniquement) {#stakingtier-module}

:::note Testnet uniquement
Le module staking-tiers fait partie de la **v3.2.4**, qui ne tourne que sur le testnet. Sur le mainnet, ces routes répondent `501`, et une mise à niveau du mainnet vers la v3.2.4 n'est pour l'instant que proposée (proposition de gouvernance 13, à la hauteur 3 742 566).
:::

| Méthode | Point de terminaison                      | Description                                                        |
| ------ | ----------------------------------------- | ------------------------------------------------------------------ |
| GET    | `/qorechain/stakingtier/v1/params`        | Paliers de verrouillage, montant minimal de verrouillage, pénalité de déverrouillage anticipé |
| GET    | `/qorechain/stakingtier/v1/locks/{holder}` | Les verrouillages d'un détenteur, ce que chacun accumule actuellement et ce qui peut être réclamé |
| GET    | `/qorechain/stakingtier/v1/pool`          | Le pool de bonus : solde, montant en attente, excédent et dernier règlement |

`params` liste les trois durées de verrouillage (3, 6 et 12 mois) avec leurs paramètres et `min_lock_amount` (`"10000000"` uqor, 10 QOR). Les verrouillages se font avec `tx stakingtier lock` (voir [Commandes de transaction](/cli-reference/transaction-commands#stakingtier)).

## Modules gRPC uniquement {#grpc-only-modules}

Ces modules disposent d'un service `Query` gRPC mais **d'aucune route REST**. Les noms de service suivent le format `qorechain.<module>.v1.Query`.

| Module        | Méthodes de requête gRPC (version de chaîne v3.2.3)    |
| ------------- | ------------------------------------------------------ |
| `ai`          | `Config`, `Stats`                                      |
| `crossvm`     | `Params`, `PendingMessages`, `Message`                 |
| `reputation`  | `Params`                                               |
| `rlconsensus` | `AgentStatus`, `Params`, `Observation`, `Reward`, `Policy` |
| `svm`         | `Slot`, `Account`, `Program`                           |
| `qca`         | `Config`                                               |

Utilisez `grpcurl` sur votre propre nœud, ou les [commandes de requête CLI](/cli-reference/query-commands). Les requêtes `rdk` sont aussi disponibles via REST (voir [Module RDK](#rdk-module)) ; elles n'étaient disponibles qu'en gRPC avant la v3.2.2.

Les modules xQORE, restaking BTC (Babylon) et FairBlock n'ont aucun service de requête dans la version actuelle, ni en REST ni en gRPC. Les modules inflation et abstraction de gas, qui n'en avaient aucun avant la v3.2.2, sont servis via REST (voir [Module Inflation](#inflation-module) et [Module Gas Abstraction](#gas-abstraction-module)).

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
| `/cosmos/upgrade/v1beta1/current_plan`, `/applied_plan/{name}` | Mises à niveau en attente / appliquées (`applied_plan/v3.2.3` renvoie `{"height":"3662051"}` sur le mainnet) |
| `/cosmos/circuit/v1/disable_list`                     | Types de messages désactivés à l'échelle du réseau |
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

`qorechain.pqc.v1.Query` possède trois méthodes sur le mainnet, `Account`, `EVMWindow` et `EVMDelegationConsent`, et une quatrième sur le testnet uniquement (v3.2.4), `ProtocolFeatures`. Il n'existe pas de méthode `Params`.

## Authentification

Tous les points de terminaison REST et gRPC sont non authentifiés par défaut. Pour les déploiements en production, placez un reverse proxy (par ex. Nginx ou Caddy) devant le nœud pour gérer la terminaison TLS et le contrôle d'accès.
