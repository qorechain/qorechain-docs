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
Ces interfaces sont disponibles à la fois sur le mainnet **`qorechain-vladi`** (en production depuis le 7 juin 2026) et sur le testnet **`qorechain-diana`**. Au moment de la rédaction (vérifié le 27 octobre 2026), le mainnet exécute la version de nœud **v3.2.4** (appliquée à la hauteur 3 742 566 le 23 octobre 2026, proposition de gouvernance 13), et la proposition de gouvernance 14 du mainnet est en période de vote ; elle appliquerait la v3.2.5 à la hauteur 3 906 833. Le testnet exécute la **v3.2.6** : il a appliqué la v3.2.5 à la hauteur 8 890 800 le 26 octobre 2026 et la v3.2.6 à la hauteur 8 970 638 le 27 octobre 2026. Les routes et champs ajoutés par une version n'apparaissent sur un réseau qu'une fois que ce réseau a appliqué la version ; cette page indique ce qui n'existe que sur le testnet. Les URL de base ci-dessous supposent un nœud exécuté localement. Les points de terminaison hébergés publics sont `https://api.qore.host` / `https://api-testnet.qore.host` (REST) et `https://rpc.qore.host` / `https://rpc-testnet.qore.host` (RPC), répertoriés dans [Réseaux](/appendix/networks#public-endpoints). **Il n'existe aucun point de terminaison gRPC public** : les noms d'hôte `grpc.qore.host` et `grpc-testnet.qore.host` n'existent pas, exécutez donc votre propre nœud si vous avez besoin de gRPC.
:::

## URL de base

```
REST:  http://localhost:1317
gRPC:  localhost:9090
RPC:   http://localhost:26657
```

## Routes disponibles {#which-routes-exist}

Les modules propres à QoreChain sont exposés via REST sous le préfixe `/qorechain/<module>/v1/...`, et seuls les modules listés ci-dessous disposent de routes REST. Les autres modules ne sont accessibles qu'en **gRPC** (voir [Modules gRPC uniquement](#grpc-only-modules)). Les routes standard du Cosmos SDK, d'EVM et de QoreChain Native sont listées dans [Routes standard](#standard-routes).

Une route qui n'existe pas répond par un HTTP `501` avec `{"code":12,"message":"Not Implemented"}`. Cela signifie que la route n'est pas servie, et non que la requête a renvoyé un résultat vide. Les chemins raccourcis sans le préfixe `/qorechain/` (par exemple `/bridge/v1/chains` ou `/pqc/v1/params`) ne sont **pas** servis. Un enregistrement inconnu sur une route qui existe renvoie un HTTP `404` avec `{"code":5,"message":"... not found"}`.

Les exemples ci-dessous utilisent l'hôte public du mainnet ; remplacez-le par `https://api-testnet.qore.host` pour le testnet. Les valeurs des exemples ont été lues sur les réseaux en production entre le 20 et le 27 octobre 2026 et évoluent avec le temps ; servez-vous-en pour connaître la forme d'une réponse. La version v3.2.4 a ajouté quelques routes et champs. Ils sont marqués **v3.2.4** ci-dessous : le testnet les sert depuis le 19 octobre 2026 et le mainnet depuis le 23 octobre 2026. La version v3.2.6 en a ajouté d'autres, marqués **v3.2.6 (testnet)** : ils répondent uniquement sur le testnet, et le mainnet y répond par `501` tant qu'il n'a pas appliqué cette version. Un nœud encore sur une version antérieure répond à une nouvelle route par `501`.

## Module PQC {#pqc-module}

| Méthode | Point de terminaison                     | Description                                                                 |
| ------ | ---------------------------------------- | --------------------------------------------------------------------------- |
| GET    | `/qorechain/pqc/v1/account/{address}`    | Enregistrement de la clé post-quantique d'un compte (`found`, type de clé, algorithme) |
| GET    | `/qorechain/pqc/v1/evm_window/{address}` | La fenêtre d'autorisation du compte sur la voie EVM et ce qu'il en reste    |
| GET    | `/qorechain/pqc/v1/evm_delegation_consent/{address}` | Le consentement du compte à la délégation EIP-7702, la délégation actuelle et le nonce EVM (depuis la v3.2.2) |
| GET    | `/qorechain/pqc/v1/protocol_features`    | **v3.2.4** (testnet depuis le 19 octobre 2026 ; mainnet depuis le 23 octobre 2026 ; `501` sur un nœud plus ancien). Toutes les fonctionnalités de protocole que le binaire connaît, avec les indicateurs `enabled`, `known` et `staged` |
| GET    | `/qorechain/pqc/v1/params`               | **v3.2.6 (testnet)**. Les paramètres du module ; `501` sur le mainnet au moment de la rédaction |

Notez que le segment de chemin est le singulier `account`. Il n'existe aucune route `/qorechain/pqc/v1/stats` (utilisez `qorechaind query pqc stats`). `/qorechain/pqc/v1/params` est servie à partir de la v3.2.6, donc pour l'instant uniquement sur le testnet ; sur le mainnet, utilisez `qorechaind query pqc params` auprès d'un nœud jusqu'à ce qu'il applique cette version.

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

`classical_key_source` indique d'où provient `ecdsa_pubkey` : `stored` (la clé fournie à l'enregistrement), `auth_account` (rien n'a été stocké, il s'agit donc de la propre clé publique on-chain du compte) ou `none`. À partir de la v3.2.4 (sur le testnet depuis le 19 octobre 2026 ; sur le mainnet depuis le 23 octobre 2026), l'enregistrement porte aussi `"possession_proven": false`, qui passe à `true` une fois qu'une clé a été enregistrée avec une [preuve de possession](/developer-guide/post-quantum-signing#proof-of-possession) vérifiée ; un nœud sur une version antérieure ne renvoie pas ce champ.

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

Au moment de la rédaction, `layers` est une liste vide sur les deux réseaux. L'exemple est la réponse du mainnet ; sur le testnet, `max_sidechains` vaut `64` (relevé par la proposition de gouvernance 16, adoptée le 25 octobre 2026, pour l'événement des builders).

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

La réponse réelle liste chaque source de burn (`ai_service`, `amm`, `auto_buyback`, `bridge_fee`, `contract_create`, `failed_tx`, `gas_fee`, `milestone`, `rollup_create`, `tge`, `treasury_buyback`, `xqore_penalty` et, à partir de la v3.2.4, `staking_tier_penalty`, la pénalité de déverrouillage anticipé d'un verrouillage de staking tier, qui est brûlée) ; l'exemple est abrégé. Les montants sont en `uqor`. `failed_tx` est non nul depuis la mise à niveau v3.2.2, lorsque le burn des transactions échouées a commencé à s'appliquer aux frais réellement prélevés. Depuis la v3.2.3, les anciens `records` de burn individuels sont élagués ; `records` est donc une fenêtre récente et non l'historique complet, tandis que les totaux de `stats` sont cumulés.

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stranded_rewards
```

```json
{ "reserved": "0", "released": "10500542706858", "initialized": true, "snapshot_height": "2981742" }
```

`reserved` correspond à ce qu'il reste à libérer, `released` à ce que la gouvernance a déjà fait sortir, et `snapshot_height` à la hauteur de la mise à niveau v3.2.0 qui a enregistré la réserve. Les valeurs ci-dessus sont celles lues le 23 octobre 2026 : la gouvernance a libéré le premier montant (6 693 045,921330 QOR) le 19 octobre 2026, la mise à niveau v3.2.3 a recalculé la réserve restante à sa propre hauteur (3 807 496,785528 QOR), et la proposition de gouvernance 12 a libéré ce montant (adoptée, vote terminé le 21 octobre 2026) ; la réserve est donc désormais vide et `released` totalise 10 500 542,706858 QOR. Lisez les valeurs en direct. Voir [Tokenomics](/architecture/tokenomics).

## Module Abstract Account {#abstract-account-module}

Le service de requêtes abstract-account est exposé via REST sous `/qorechain/abstractaccount/v1/...` (depuis la version de chaîne **v3.1.85**), y compris le **schéma de permissions** utilisé pour valider les portées d'[authentificateur](/developer-guide/account-abstraction#authenticators) sans les coder en dur.

| Méthode | Point de terminaison                                  | Description                                                         |
| ------ | ----------------------------------------------------- | ------------------------------------------------------------------- |
| GET    | `/qorechain/abstractaccount/v1/config`                | Configuration du module (sonde de fonctionnalité : `enabled`)       |
| GET    | `/qorechain/abstractaccount/v1/accounts`              | Liste les comptes abstraits                                         |
| GET    | `/qorechain/abstractaccount/v1/accounts/{address}`    | État de compte abstrait pour une adresse (`404` s'il n'y en a pas)  |
| GET    | `/qorechain/abstractaccount/v1/permission_schema`     | `schema_version`, `permissions`, `msg_permissions`, `key_management_msgs`, `lane_rules` |
| GET    | `/qorechain/abstractaccount/v1/auth_nonce/{address}/{pubkey_hex}` | **v3.2.4** (testnet depuis le 19 octobre 2026 ; mainnet depuis le 23 octobre 2026 ; `501` sur un nœud plus ancien). La séquence que doit signer ensuite une clé d'authentificateur liée (`nonce`, `linked`) |

```bash
curl -s https://api.qore.host/qorechain/abstractaccount/v1/config
```

```json
{ "config": { "enabled": false, "max_session_keys": 10, "max_spending_rules": 5, "default_session_ttl": "86400" } }
```

:::note Désactivé sur le mainnet, activé sur le testnet
L'exemple ci-dessus est la réponse du mainnet : `enabled` y vaut `false` (et `accounts` est une liste vide) ; les fonctionnalités de compte abstrait, telles que la dépense depuis des portefeuilles liés, ne sont donc pas disponibles sur le mainnet. Sur le testnet, `enabled` vaut `true` depuis la proposition de gouvernance 18 (adoptée le 27 octobre 2026) et `accounts` liste les comptes créés jusqu'ici (vérifié le 27 octobre 2026). Utilisez `config.enabled` comme sonde de fonctionnalité avant de vous appuyer sur ce module. Voir [Abstraction de compte](/developer-guide/account-abstraction).
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

Les sept routes AMM répondent sur les deux réseaux (vérifié le 27 octobre 2026). Au moment de la rédaction, il n'existe aucun pool sur les deux réseaux (`{"pools": []}`). Réponses pour une entrée qui ne correspond à rien : `pools/{pool_id}` avec un identifiant inconnu renvoie un HTTP `404` (`{"code":5,"message":"pool 1 not found"}`) ; `pool_by_denoms` sans pool pour la paire renvoie `404` (`no pool for uqor/foo`) ; une cotation pour un pool inconnu renvoie un HTTP `400` avec `{"code":3,"message":"pool not found"}` ; `pools/{pool_id}/lp/{address}` renvoie `{"balance":"0"}` pour une adresse sans position LP (l'adresse doit être une adresse bech32 `qor1` valide, sinon `400`). Les deux routes de cotation et `pool_by_denoms` lisent leur entrée dans la chaîne de requête et ont donc besoin de paramètres : sans `amount_in` / `amount_out`, elles répondent `400` (`invalid amount_in` / `invalid amount_out`).

Sur le testnet, la seconde dénomination dont un pool a besoin est disponible depuis la v3.2.6 : trois tokens de test enregistrés par la gouvernance, voir [Tokens de test du testnet (Fest)](#fest-tokens). Il n'existe pas d'équivalent sur le mainnet, dont la seule dénomination bancaire est `uqor`.

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
  "balance": "5645408555",
  "reserved": "5645276228",
  "outstanding": "130077",
  "payable": "0",
  "max_reward_per_block_per_node": "1713",
  "distributable": "2250",
  "initialized": true,
  "max_reward_per_month_per_node": "2000000000",
  "monthly_cap_active": true,
  "last_distribution_time": "1792775155",
  "last_distribution_height": "3744000"
}
```

`reserved` est la part du pool qui est mise de côté et ne peut être déplacée que par un vote de gouvernance. Les bornes par nœud sont en `uqor` : `max_reward_per_block_per_node` est le plafond par bloc et, depuis la v3.2.3, `max_reward_per_month_per_node` (`2000000000` uqor = 2 000 QOR par période de 30 jours) est le plafond mensuel, calculé au prorata du temps de bloc et de la disponibilité, de sorte qu'il ne dépend plus de la vitesse à laquelle les blocs arrivent. Un plafond n'est pas un montant promis. L'exemple est la réponse réelle du mainnet lue le 23 octobre 2026, après que la gouvernance a libéré la réserve précédente (proposition 8, 19 octobre 2026). À partir de la v3.2.4 (sur le testnet depuis le 19 octobre 2026 ; sur le mainnet depuis le 23 octobre 2026), la réponse comporte aussi `monthly_cap_active`, `last_distribution_time` et `last_distribution_height`, et la borne d'un nœud démarre à son propre enregistrement.

:::note L'enregistrement nécessite une licence
La chaîne refuse l'enregistrement d'un light node sans autorisation de licence `lightnode_operator` active (`holders/lightnode_operator` liste les autorisations). Le 27 octobre 2026, `stats` indique `"total_registered": "1"` sur le mainnet comme sur le testnet. Voir [Light Nodes](/light-node/overview) pour l'état du programme.
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

Au moment de la rédaction, `rollups` est une liste vide sur les deux réseaux ; les routes par rollup répondent donc `404` (par exemple `{"code":5,"message":"rollup foo not found"}`). `default_challenge_window` est exprimé en secondes (`604800`). À partir de la v3.2.4, la fenêtre de contestation optimiste d'un lot nouvellement soumis est mesurée en temps de bloc : sur le testnet depuis la hauteur 8 337 253 (19 octobre 2026), sur le mainnet depuis la hauteur 3 742 566 (23 octobre 2026). Avant la mise à niveau, la chaîne convertissait la valeur en secondes en blocs à raison de 6 secondes fixes par bloc. Sur le testnet, la proposition de gouvernance 17 (adoptée le 27 octobre 2026) a fixé `default_challenge_window` à `3600` (une heure) et `max_rollups` à `200` pour l'événement des builders ; l'exemple ci-dessus (mainnet) diffère donc du testnet sur ce point ; `rollups` est toujours vide sur le testnet au moment de la rédaction.

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

Sur le mainnet, `emission_mode` vaut `"fixed"`, `fixed_epoch_emission` vaut `"86000000000"` (86 000 QOR par époque), `epoch_length` vaut `"43200"` blocs et `max_total_emission` vaut `"590000000000000"` (590 000 000 QOR, le plafond cumulé). Ces valeurs ont été fixées par la proposition de gouvernance 10 (adoptée le 19 octobre 2026) ; la première époque qui utilise le nouveau montant fixe commence au bloc 3 672 000, et `epoch_info` indique l'époque en cours et le montant émis jusqu'ici. La liste `schedule` de la réponse relève du mode `schedule` d'origine ; elle ne décrit pas ce qu'émet une époque en mode fixe. Tous les montants sont en `uqor`. Le testnet renvoie ses propres valeurs, différentes. À partir de la v3.2.4, il existe un troisième mode, `target_apy`, avec un champ `target_apy_bps` (sur le testnet depuis le 19 octobre 2026 ; sur le mainnet depuis le 23 octobre 2026). Un réseau ne passe à ce mode que par son propre vote de gouvernance ; le mainnet reste donc en `fixed` tant qu'un tel vote n'a pas été adopté (vérifié le 27 octobre 2026 : toujours `fixed`). Le testnet est passé à `target_apy` par sa propre gouvernance (proposition 14, adoptée le 20 octobre 2026) et indique `"emission_mode": "target_apy"` au moment de la rédaction, `epoch_info` montrant que le plafond cumulé est déjà atteint (`remaining_emission` à `0`).

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

## Module RL Consensus (v3.2.6, testnet) {#rlconsensus-module}

:::note Testnet uniquement pour l'instant
La passerelle REST du module `rlconsensus` est arrivée avec la **v3.2.6**, que le testnet `qorechain-diana` a appliquée à la hauteur 8 970 638 le 27 octobre 2026. Sur le mainnet, chaque route ci-dessous répond par un HTTP `501` (`{"code":12,"message":"Not Implemented"}`) au moment de la rédaction (vérifié le 27 octobre 2026) ; le module n'y est accessible qu'en gRPC. Les sept routes répondent sur le testnet et aucune n'a besoin de paramètre.
:::

| Méthode | Point de terminaison                      | Description                                                              |
| ------ | ----------------------------------------- | ------------------------------------------------------------------------ |
| GET    | `/qorechain/rlconsensus/v1/agent`         | État de l'agent : `mode`, `current_epoch`, `total_steps`, `last_observation_at`, `last_action_at`, `circuit_breaker_active`, `blocks_since_revert` |
| GET    | `/qorechain/rlconsensus/v1/params`        | Paramètres du module : intervalle d'observation, mode de l'agent, limites de pas, fenêtre et seuil du disjoncteur, poids de récompense, temps de bloc par défaut, prix du gas et taille de l'ensemble de validateurs |
| GET    | `/qorechain/rlconsensus/v1/observation`   | Le dernier vecteur d'observation (`height` et 25 `values`)                 |
| GET    | `/qorechain/rlconsensus/v1/reward`        | Le dernier signal de récompense et ses composantes                              |
| GET    | `/qorechain/rlconsensus/v1/policy`        | Le réseau de politique stocké : `epoch`, `updated_at`, `weight_count` (les poids eux-mêmes ne sont pas renvoyés) |
| GET    | `/qorechain/rlconsensus/v1/applied_params` | Les valeurs que l'agent considère comme appliquées : `block_time_ms`, `gas_limit`, `gas_price_floor`, `pool_weight_rpos`, `pool_weight_dpos` |
| GET    | `/qorechain/rlconsensus/v1/last_action`   | L'action que l'agent a proposée à son dernier pas : `height`, `mode`, cinq `values` et `applied` |

```bash
curl -s https://api-testnet.qore.host/qorechain/rlconsensus/v1/agent
curl -s https://api-testnet.qore.host/qorechain/rlconsensus/v1/last_action
```

```json
{ "mode": "shadow", "current_epoch": "1", "total_steps": "209", "last_observation_at": "8975660",
  "last_action_at": "8975660", "circuit_breaker_active": false, "blocks_since_revert": "0" }
```

```json
{ "height": "8975660", "mode": "shadow", "values": ["-0.334711810000000000", "-0.500000000000000000",
  "0.000000000000000000", "0.000000000000000000", "0.000000000000000000"], "applied": false }
```

L'agent effectue un pas tous les `observation_interval` blocs (10). En mode `shadow`, il calcule une action et l'enregistre sans rien appliquer ; `applied` vaut donc `false` et `applied_params` reste à ses valeurs par défaut (`block_time_ms` `5000`, `gas_price_floor` `100`, poids de pool `0.40` et `0.35`). Sur le testnet, l'agent a été démarré en mode shadow avec une politique stockée par la proposition de gouvernance 29 (adoptée le 27 octobre 2026) ; `circuit_breaker_active` vaut `false`. Les montants et les valeurs sont des chaînes. Les valeurs appliquées sont informatives dans cette version : le seul lecteur on-chain est le [précompilé `rlConsensusParams`](/developer-guide/evm-precompiles#network-status) en lecture seule. Les méthodes gRPC correspondantes sont `AgentStatus`, `Params`, `Observation`, `Reward`, `Policy`, `AppliedParams` et `LastAction` (service `qorechain.rlconsensus.v1.Query`), et les commandes CLI figurent dans [Commandes de requête](/cli-reference/query-commands#rlconsensus).

## Module Staking Tiers (v3.2.4) {#stakingtier-module}

:::note Disponible à partir de la v3.2.4
Le module staking-tiers fait partie de la **v3.2.4**. Ces routes sont servies par le testnet depuis le 19 octobre 2026 et par le mainnet depuis le 23 octobre 2026 (proposition de gouvernance 13, hauteur 3 742 566). Un nœud sur une version antérieure y répond par `501`.
:::

| Méthode | Point de terminaison                      | Description                                                        |
| ------ | ----------------------------------------- | ------------------------------------------------------------------ |
| GET    | `/qorechain/stakingtier/v1/params`        | Paliers de verrouillage, montant minimal de verrouillage, pénalité de déverrouillage anticipé |
| GET    | `/qorechain/stakingtier/v1/locks/{holder}` | Les verrouillages d'un détenteur, ce que chacun accumule actuellement et ce qui peut être réclamé |
| GET    | `/qorechain/stakingtier/v1/pool`          | Le pool de bonus : solde, montant en attente, excédent et dernier règlement |

`params` liste les trois durées de verrouillage (3, 6 et 12 mois) avec leurs paramètres et `min_lock_amount` (`"10000000"` uqor, 10 QOR). Les verrouillages se font avec `tx stakingtier lock` (voir [Commandes de transaction](/cli-reference/transaction-commands#stakingtier)).

## Modules gRPC uniquement {#grpc-only-modules}

Sur le mainnet (version de nœud v3.2.4, vérifié le 27 octobre 2026), ces modules disposent d'un service `Query` gRPC mais **d'aucune route REST**. Les noms de service suivent le format `qorechain.<module>.v1.Query`.

| Module        | Méthodes de requête gRPC (mainnet, version de chaîne v3.2.4) |
| ------------- | ------------------------------------------------------ |
| `ai`          | `Config`, `Stats`                                      |
| `crossvm`     | `Params`, `PendingMessages`, `Message`                 |
| `reputation`  | `Params`                                               |
| `rlconsensus` | `AgentStatus`, `Params`, `Observation`, `Reward`, `Policy` |
| `svm`         | `Slot`, `Account`, `Program`                           |
| `qca`         | `Config`                                               |

Les requêtes `rlconsensus` sont servies via REST sur le testnet à partir de la v3.2.6 (avec deux méthodes de plus, `AppliedParams` et `LastAction`) ; voir [Module RL Consensus](#rlconsensus-module). Le mainnet y répond par `501` tant qu'il n'a pas appliqué cette version. Utilisez `grpcurl` sur votre propre nœud, ou les [commandes de requête CLI](/cli-reference/query-commands). Les requêtes `rdk` sont aussi disponibles via REST (voir [Module RDK](#rdk-module)) ; elles n'étaient disponibles qu'en gRPC avant la v3.2.2.

Les modules xQORE, restaking BTC (Babylon) et FairBlock n'ont aucun service de requête dans la version actuelle, ni en REST ni en gRPC. Les modules inflation et abstraction de gas, qui n'en avaient aucun avant la v3.2.2, sont servis via REST (voir [Module Inflation](#inflation-module) et [Module Gas Abstraction](#gas-abstraction-module)).

## Routes standard {#standard-routes}

Les routes REST standard du Cosmos SDK, d'IBC, d'EVM et de QoreChain Native sont également servies. Exemples vérifiés sur les deux réseaux :

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
| `/cosmwasm/wasm/v1/codes/params`                      | Permissions d'upload/d'instanciation QoreChain Native |
| `/ibc/apps/transfer/v1/params`                        | Paramètres de transfert IBC                   |
| `/ibc/core/client/v2/counterparty_info/{client_id}`   | **v3.2.6 (testnet)**. La contrepartie IBC v2 enregistrée pour un client (`404` s'il n'y en a pas ; `501` sur le mainnet) |
| `/ibc/core/client/v2/config/{client_id}`              | **v3.2.6 (testnet)**. La configuration du client IBC v2 (`allowed_relayers` ; `501` sur le mainnet) |
| `/cosmos/evm/erc20/v1/token_pairs`, `/token_pairs/{token}` | Paires de tokens ERC20 (testnet : les trois tokens de test Fest et un token IBC ; mainnet : aucune) |

Le préfixe QoreChain Native est `/cosmwasm/wasm/v1/...` ; `/cosmos/wasm/v1/...` n'est pas servi.

### Routes client IBC v2 (v3.2.6, testnet) {#ibc-v2-routes}

Le service de requêtes client IBC v2 était auparavant servi via gRPC, mais ses routes REST manquaient ; la v3.2.6 les monte. Un relayeur y lit la contrepartie d'un client. Les deux routes prennent l'identifiant du client dans le chemin (par exemple `07-<type>-0`) ; sans lui, elles répondent `501` sur les deux réseaux. Vérifié le 27 octobre 2026 :

| Route | Testnet (v3.2.6) | Mainnet (v3.2.4) |
| --- | --- | --- |
| `/ibc/core/client/v2/counterparty_info/{client_id}` | `200` avec la contrepartie, ou `404` (`client 07-<type>-0 counterparty not found`) pour un client qui n'en a aucune d'enregistrée ; un identifiant vide répond `400` | `501` |
| `/ibc/core/client/v2/config/{client_id}` | `200`, `{"config":{"allowed_relayers":[]}}` (une liste vide signifie n'importe quel relayeur) | `501` |
| `/ibc/core/channel/v2/clients/{client_id}/next_sequence_send`, `/packet_commitments` et les autres routes de canal IBC v2 | répondent (`404` lorsque rien n'est enregistré pour le client, `200` avec une liste vide pour les engagements) | répondent, mêmes formes |

Les routes IBC v1 (`/ibc/core/client/v1/...`, `/ibc/core/channel/v1/...`) répondent sur les deux réseaux. Au moment de la rédaction, le testnet détient un client IBC et un canal de transfert ouvert (`channel-0`, avec un token libellé en IBC), et le mainnet n'a aucun client IBC, aucun canal ni aucun token libellé en IBC. Sur le testnet, le module de limitation de débit répond à `/Stride-Labs/ibc-rate-limiting/ratelimit/ratelimits` (une liste vide : aucune limite n'est définie) et la liste des checksums 08-wasm à `/ibc/lightclients/wasm/v1/checksums` (vide) ; le mainnet répond `501` aux deux.

### Tokens de test du testnet (Fest) {#fest-tokens}

:::note Testnet uniquement, sans valeur
Les trois tokens ci-dessous n'existent que sur le testnet `qorechain-diana`. Ce sont des tokens de test pour les builders : ils n'ont aucune valeur, et le mainnet n'a aucune paire de tokens ERC20 (vérifié le 27 octobre 2026 : `token_pairs` est vide et l'offre bancaire ne contient que `uqor`). La gouvernance les a enregistrés comme paires de tokens ERC20 le 27 octobre 2026 (proposition 26).
:::

Sur le testnet, un token ERC20 enregistré existe aussi comme coin bancaire : il peut donc être détenu, envoyé et utilisé comme seconde dénomination d'un [pool AMM](#amm-module). La dénomination bancaire est `erc20:` suivi de l'adresse du contrat sous la **forme checksum EIP-55 en casse mixte**, et la chaîne de dénomination est **sensible à la casse** : l'écriture entièrement en minuscules est une chaîne différente et n'est pas trouvée.

| Token | Adresse du contrat | Dénomination bancaire | Décimales |
| --- | --- | --- | --- |
| fUSD (FestUSD) | `0x97143B771D34ddb9130b807b135Ae675A5a963CA` | `erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA` | 6 |
| fETH (FestETH) | `0x02292293c13880a26242690eb70a0e42B8E91c28` | `erc20:0x02292293c13880a26242690eb70a0e42B8E91c28` | 18 |
| fBTC (FestBTC) | `0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` | `erc20:0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` | 8 |

```bash
# the three tokens and their display names / decimals
curl -s https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata
# one denom: the case matters (this returns the metadata, the lowercase spelling returns 404)
curl -s "https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata/erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA"
# the ERC20 token pairs, and the supply of one denom
curl -s https://api-testnet.qore.host/cosmos/evm/erc20/v1/token_pairs
curl -s "https://api-testnet.qore.host/cosmos/bank/v1beta1/supply/by_denom?denom=erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA"
```

`denoms_metadata` liste chaque token avec `symbol` `fUSD` / `fETH` / `fBTC`, `display` `FestUSD` / `FestETH` / `FestBTC` et les décimales comme exposant de l'unité d'affichage. Une requête de solde (`/cosmos/bank/v1beta1/balances/{address}`) montre la part convertie du solde d'un détenteur sous la dénomination `erc20:...` ; les tokens encore détenus côté EVM apparaissent dans le `balanceOf` propre au contrat ERC20. La conversion entre les deux formes se fait avec `MsgConvertERC20` (EVM vers bancaire) et `MsgConvertCoin` (bancaire vers EVM) ; l'expéditeur de `MsgConvertERC20` doit être écrit sous la forme d'une adresse bech32 `qor1`. Voir [Développement EVM](/developer-guide/evm-development#fest-tokens).

## Réflexion gRPC

Un nœud que vous exécutez vous-même sert gRPC sur le port `9090`. Lorsque la réflexion du serveur est activée, des outils comme `grpcurl` peuvent découvrir les services disponibles :

```bash
grpcurl -plaintext localhost:9090 list
```

Pour interroger un service spécifique :

```bash
grpcurl -plaintext -d '{"address":"qor1..."}' localhost:9090 qorechain.pqc.v1.Query/Account
```

`qorechain.pqc.v1.Query` possède trois méthodes sur un nœud v3.2.3, `Account`, `EVMWindow` et `EVMDelegationConsent`, et une quatrième à partir de la v3.2.4 (le testnet depuis le 19 octobre 2026, le mainnet depuis le 23 octobre 2026), `ProtocolFeatures`. Une méthode `Params` est ajoutée en v3.2.6 (uniquement sur le testnet pour l'instant) ; un nœud mainnet n'a pas de méthode `Params`.

## Authentification

Tous les points de terminaison REST et gRPC sont non authentifiés par défaut. Pour les déploiements en production, placez un reverse proxy (par ex. Nginx ou Caddy) devant le nœud pour gérer la terminaison TLS et le contrôle d'accès.
