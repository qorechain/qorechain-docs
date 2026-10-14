---
slug: /api-reference/rest-grpc-endpoints
title: REST / gRPC Endpoints
sidebar_label: REST / gRPC Endpoints
sidebar_position: 1
---

# REST / gRPC Endpoints

QoreChain exposes three primary interfaces for programmatic access:

| Interface | Default Port | Protocol  | Description                        |
| --------- | ------------ | --------- | ---------------------------------- |
| REST      | `1317`       | HTTP/1.1  | REST gateway (Cosmos SDK API server) |
| gRPC      | `9090`       | HTTP/2    | Protobuf-encoded gRPC service      |
| RPC       | `26657`      | HTTP + WS | QoreChain Consensus Engine RPC     |

All REST endpoints return JSON. gRPC endpoints use Protocol Buffers and can be consumed with any gRPC client. The RPC interface provides consensus-level queries and transaction broadcast.

:::note
These interfaces are available on both the **`qorechain-vladi`** mainnet (live since 29 June 2026) and the **`qorechain-diana`** testnet. The base URLs below assume a locally running node. The public hosted endpoints are `https://api.qore.host` / `https://api-testnet.qore.host` (REST) and `https://rpc.qore.host` / `https://rpc-testnet.qore.host` (RPC), listed in [Networks](/appendix/networks#public-endpoints). **There is no public gRPC endpoint**: the hostnames `grpc.qore.host` and `grpc-testnet.qore.host` do not exist, so run your own node if you need gRPC.
:::

## Base URLs

```
REST:  http://localhost:1317
gRPC:  localhost:9090
RPC:   http://localhost:26657
```

## Which routes exist {#which-routes-exist}

QoreChain-specific modules are exposed over REST under the `/qorechain/<module>/v1/...` prefix, and only the modules listed below have REST routes. The other modules are reachable over **gRPC only** (see [gRPC-only modules](#grpc-only-modules)). Standard Cosmos SDK, EVM and CosmWasm routes are listed in [Standard routes](#standard-routes).

A route that does not exist answers HTTP `501` with `{"code":12,"message":"Not Implemented"}`. That means the route is not served, not that the query came back empty. Shortened paths without the `/qorechain/` prefix (for example `/bridge/v1/chains` or `/pqc/v1/params`) are **not** served. An unknown record on a route that does exist returns HTTP `404` with `{"code":5,"message":"... not found"}`.

The examples below use the public mainnet host; replace it with `https://api-testnet.qore.host` for the testnet.

## PQC Module {#pqc-module}

| Method | Endpoint                                 | Description                                                                 |
| ------ | ---------------------------------------- | --------------------------------------------------------------------------- |
| GET    | `/qorechain/pqc/v1/account/{address}`    | Post-quantum key registration for an account (`found`, key type, algorithm) |
| GET    | `/qorechain/pqc/v1/evm_window/{address}` | The account's EVM-lane authorisation window and what remains of it          |

Note that the path segment is the singular `account`. There is no `/qorechain/pqc/v1/params` or `/stats` route.

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

An account with no registered key returns `{"found": false, "account": null}`. Use `found` to decide whether an account must register a key before it can send.

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

This route never fails for an address without a window; it returns `found: false`. Since v3.2.0 the EVM lane admits a transaction only from an account that has a registered PQC key **and** an open window. `live` is `true` while the window admits at least one more transaction at the current height. `remaining_blocks`, `remaining_txs` and `remaining_value` show which bound is closest to running out; values are `uqor` integers returned as strings. See [EVM Development](/developer-guide/evm-development) for how the EVM lane works.

## Bridge Module {#bridge-module}

The bridge module's read-only state is exposed over REST under `/qorechain/bridge/v1/...` (serving real on-chain JSON since chain version **v3.1.77**). The bridge `config` reports e.g. `min_validators=10` and `attestation_threshold=7`.

| Method | Endpoint                                    | Description                              |
| ------ | ------------------------------------------- | ---------------------------------------- |
| GET    | `/qorechain/bridge/v1/config`               | Current bridge module configuration      |
| GET    | `/qorechain/bridge/v1/chains`               | Lists all registered bridge chains       |
| GET    | `/qorechain/bridge/v1/chains/{chain_id}`    | Details for a specific bridged chain     |
| GET    | `/qorechain/bridge/v1/validators`           | Lists registered bridge validators       |
| GET    | `/qorechain/bridge/v1/validators/{address}` | Details for a specific bridge validator  |
| GET    | `/qorechain/bridge/v1/operations`           | Lists bridge operations                  |
| GET    | `/qorechain/bridge/v1/operations/{id}`      | Details for a specific bridge operation  |

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

`chains/{chain_id}` returns one entry such as `{"chain": {"chain_id": "ethereum", "name": "Ethereum", "chain_type": "evm", "bridge_contract": "0x000…0", "status": "pending", "min_confirmations": 12, ...}}`.

:::caution The bridge is not live yet
All 37 configured bridge chains report `"status": "pending"` on both networks, and `validators` and `operations` are empty lists. These routes show the module's configuration; they do not mean assets can be bridged today. See [Bridge Architecture](/architecture/bridge-architecture).
:::

## Multilayer Module {#multilayer-module}

The multilayer module's full query service is exposed over REST under `/qorechain/multilayer/v1/...` (since chain version **v3.1.80**), including two **state-anchor read queries**: `anchor/{layer_id}` returns the latest settlement anchor for a layer, and `anchors/{layer_id}` returns its anchor history. Each anchor carries an **ML-DSA-87 (Dilithium-5)** signature over its canonical fields, so a client can fetch an anchor and verify it independently — the on-chain basis for the Rollup Development Kit's [settlement receipts](/rollups/settlement-receipts).

| Method | Endpoint                                        | Description                                       |
| ------ | ----------------------------------------------- | ------------------------------------------------- |
| GET    | `/qorechain/multilayer/v1/params`               | Current Multilayer module parameters              |
| GET    | `/qorechain/multilayer/v1/layers`               | Lists all registered layers                       |
| GET    | `/qorechain/multilayer/v1/layers/{layer_id}`    | Details for a specific layer                      |
| GET    | `/qorechain/multilayer/v1/anchor/{layer_id}`    | Latest state anchor for a layer                   |
| GET    | `/qorechain/multilayer/v1/anchors/{layer_id}`   | State-anchor history for a layer                  |
| GET    | `/qorechain/multilayer/v1/routing-stats`        | Transaction routing statistics across layers      |

A `StateAnchorView` contains the `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, `main_chain_height`, `anchored_at`, `pqc_aggregate_signature`, `transaction_count`, and `compressed_state_proof`. The signed canonical message is `layer_id || layer_height || state_root || validator_set_hash`, verified against the layer creator's registered PQC key. A layer with no anchor returns HTTP `404` (`no anchor for layer ...`) from `anchor/{layer_id}` and an empty list (`{"anchors": []}`) from `anchors/{layer_id}`.

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

At the time of writing, `layers` is an empty list on both networks.

## Burn Module {#burn-module}

The burn module's read-only state is exposed over REST under `/qorechain/burn/v1/...`. Burn `params` include e.g. `gas_burn_rate=0.30`.

| Method | Endpoint                              | Description                                                    |
| ------ | ------------------------------------- | -------------------------------------------------------------- |
| GET    | `/qorechain/burn/v1/params`           | Current Burn module parameters                                 |
| GET    | `/qorechain/burn/v1/stats`            | Cumulative burn total, broken down by source                   |
| GET    | `/qorechain/burn/v1/records`          | Lists recent burn records                                      |
| GET    | `/qorechain/burn/v1/milestone`        | Burn milestone progress (cumulative transaction count)         |
| GET    | `/qorechain/burn/v1/stranded_rewards` | Staker share set aside by the v3.2.0 upgrade and not yet released |

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

The real response lists every burn source (`ai_service`, `amm`, `auto_buyback`, `bridge_fee`, `contract_create`, `failed_tx`, `gas_fee`, `milestone`, `rollup_create`, `tge`, `treasury_buyback`, `xqore_penalty`); the sample is trimmed. Amounts are in `uqor`.

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stranded_rewards
```

```json
{ "reserved": "6693045921330", "released": "0", "initialized": true, "snapshot_height": "2981742" }
```

`reserved` is what is left to release, `released` is how much governance has already moved out, and `snapshot_height` is the height of the v3.2.0 upgrade that recorded the reserve. See [Tokenomics](/architecture/tokenomics).

## Abstract Account Module {#abstract-account-module}

The abstract-account query service is exposed over REST under `/qorechain/abstractaccount/v1/...` (since chain version **v3.1.85**), including the **permission schema** used to validate [authenticator](/developer-guide/account-abstraction#authenticators) scopes without hardcoding.

| Method | Endpoint                                              | Description                                                         |
| ------ | ----------------------------------------------------- | ------------------------------------------------------------------- |
| GET    | `/qorechain/abstractaccount/v1/config`                | Module configuration (feature-probe: `enabled`)                     |
| GET    | `/qorechain/abstractaccount/v1/accounts`              | Lists abstract accounts                                             |
| GET    | `/qorechain/abstractaccount/v1/accounts/{address}`    | Abstract-account state for an address (`404` if none)               |
| GET    | `/qorechain/abstractaccount/v1/permission_schema`     | `schema_version`, `permissions`, `msg_permissions`, `key_management_msgs` |

```bash
curl -s https://api.qore.host/qorechain/abstractaccount/v1/config
```

```json
{ "config": { "enabled": false, "max_session_keys": 10, "max_spending_rules": 5, "default_session_ttl": "86400" } }
```

:::note Disabled on both networks
`enabled` is `false` on mainnet and testnet today, so abstract-account features such as linked-wallet spending are not available. Use `config.enabled` as the feature probe before relying on this module. See [Account Abstraction](/developer-guide/account-abstraction).
:::

## AMM Module {#amm-module}

| Method | Endpoint                                           | Description                                              |
| ------ | -------------------------------------------------- | -------------------------------------------------------- |
| GET    | `/qorechain/amm/v1/params`                         | Current AMM parameters (fees in basis points, limits)    |
| GET    | `/qorechain/amm/v1/pools`                          | Lists pools                                              |
| GET    | `/qorechain/amm/v1/pools/{pool_id}`                | One pool (`404` if unknown)                              |
| GET    | `/qorechain/amm/v1/pools/{pool_id}/lp/{address}`   | An address's LP-token balance in a pool                  |
| GET    | `/qorechain/amm/v1/pool_by_denoms?denom_a=&denom_b=` | Finds the pool for a denom pair (`404` if none)        |
| GET    | `/qorechain/amm/v1/quote/exact_in?pool_id=&denom_in=&amount_in=`   | Quote: output for an exact input       |
| GET    | `/qorechain/amm/v1/quote/exact_out?pool_id=&denom_out=&amount_out=` | Quote: input needed for an exact output |

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

At the time of writing there are no pools on either network (`{"pools": []}`), and a quote for an unknown pool returns HTTP `400` with `{"code":3,"message":"pool not found"}`.

## Licence Module {#licence-module}

| Method | Endpoint                                              | Description                                                      |
| ------ | ----------------------------------------------------- | ---------------------------------------------------------------- |
| GET    | `/qorechain/license/v1/check/{grantee}/{feature_id}`  | Whether `grantee` holds an active grant for the feature (`404` if none) |
| GET    | `/qorechain/license/v1/holders/{feature_id}`          | All grants for a feature                                         |
| GET    | `/qorechain/license/v1/list/{grantee}`                | All grants held by an address                                    |

A grant (`LicenseView`) has `grantee`, `feature_id`, `expires_at`, `granted_at`, `granted_by`, `suspended` and `metadata`. `check` also returns `active`. A list or holders query with no matches returns `{"licenses": []}`; `check` for an address without a grant returns HTTP `404` with `{"code":5,"message":"no license for <grantee>/<feature_id>"}`.

```bash
curl -s https://api.qore.host/qorechain/license/v1/holders/lightnode_operator
```

```json
{ "licenses": [] }
```

## Light Node Module {#light-node-module}

| Method | Endpoint                                      | Description                                                        |
| ------ | --------------------------------------------- | ------------------------------------------------------------------ |
| GET    | `/qorechain/lightnode/v1/params`              | Registration, heartbeat and reward parameters                      |
| GET    | `/qorechain/lightnode/v1/stats`               | `total_registered`, `total_active`, `total_rewards`, `last_reward_height` |
| GET    | `/qorechain/lightnode/v1/nodes`               | Lists registered light nodes                                       |
| GET    | `/qorechain/lightnode/v1/node/{address}`      | One node (`{"node": null, "found": false}` if not registered)     |
| GET    | `/qorechain/lightnode/v1/rewards/{address}`   | Rewards accumulated for an operator address (`accumulated_rewards`) |
| GET    | `/qorechain/lightnode/v1/reward_pool`         | Reward pool accounting (`balance`, `reserved`, `outstanding`, `payable`, `distributable`, `max_reward_per_block_per_node`, `initialized`) |

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

`reserved` is the part of the pool that is held back and can only be moved by a governance vote, and `max_reward_per_block_per_node` (in `uqor`) is the per-node, per-block ceiling on what the chain credits. A ceiling is not a promised amount. `balance` and `reserved` are shown as placeholders here.

:::note Registration is not open
`stats` reports `"total_registered": "0"` and `nodes` is empty on both networks, and the chain refuses a light-node registration without a `lightnode_operator` licence grant. See [Light Nodes](/light-node/overview) for the program status.
:::

## gRPC-only modules {#grpc-only-modules}

These modules have a gRPC `Query` service but **no REST route**. Service names follow `qorechain.<module>.v1.Query`.

| Module        | gRPC query methods (chain version v3.2.0)              |
| ------------- | ------------------------------------------------------ |
| `ai`          | `Config`, `Stats`                                      |
| `crossvm`     | `Params`, `PendingMessages`, `Message`                 |
| `reputation`  | `Params`                                               |
| `rlconsensus` | `AgentStatus`, `Params`, `Observation`, `Reward`, `Policy` |
| `rdk`         | `Params`, `Rollup`, `Rollups`, `Batch`, `LatestBatch`  |
| `svm`         | `Slot`, `Account`, `Program`                           |
| `qca`         | `Config`                                               |

Use `grpcurl` against your own node, or the [CLI query commands](/cli-reference/query-commands). The `rdk` queries in particular are **not** available over REST on mainnet (`/qorechain/rdk/v1/...` answers `501`), so REST-based rollup readers cannot work against mainnet today.

The xQORE, inflation, BTC-restaking (Babylon), FairBlock and gas-abstraction modules have no query service in the current mainnet release at all, over REST or gRPC.

## Standard routes {#standard-routes}

The standard Cosmos SDK, IBC, EVM and CosmWasm REST routes are also served. Examples verified on both networks:

| Endpoint                                              | Description                                   |
| ----------------------------------------------------- | --------------------------------------------- |
| `/cosmos/bank/v1beta1/supply`                         | Total supply                                  |
| `/cosmos/bank/v1beta1/balances/{address}`             | Account balances                              |
| `/cosmos/staking/v1beta1/validators`                  | Validators                                    |
| `/cosmos/staking/v1beta1/params`                      | Staking parameters                            |
| `/cosmos/distribution/v1beta1/params`                 | Distribution parameters                       |
| `/cosmos/gov/v1/params/voting`                        | Governance parameters                         |
| `/cosmos/slashing/v1beta1/params`                     | Slashing parameters                           |
| `/cosmos/upgrade/v1beta1/current_plan`, `/applied_plan/{name}` | Pending / applied upgrades          |
| `/cosmos/base/node/v1beta1/config`                    | Node minimum gas price (`0.1uqor` on both networks) |
| `/cosmos/base/tendermint/v1beta1/blocks/latest`       | Latest block                                  |
| `/cosmos/tx/v1beta1/txs`, `/txs/{hash}`, `/txs/block/{height}` | Transaction search / lookup / by block |
| `/cosmos/evm/vm/v1/params`                            | EVM module parameters                         |
| `/cosmos/evm/feemarket/v1/params`                     | EVM fee-market parameters                     |
| `/cosmwasm/wasm/v1/codes/params`                      | CosmWasm upload/instantiate permissions       |
| `/ibc/apps/transfer/v1/params`                        | IBC transfer parameters                       |

The CosmWasm prefix is `/cosmwasm/wasm/v1/...`; `/cosmos/wasm/v1/...` is not served.

## gRPC Reflection

A node you run yourself serves gRPC on port `9090`. Where server reflection is enabled, tools such as `grpcurl` can discover the available services:

```bash
grpcurl -plaintext localhost:9090 list
```

To query a specific service:

```bash
grpcurl -plaintext -d '{"address":"qor1..."}' localhost:9090 qorechain.pqc.v1.Query/Account
```

`qorechain.pqc.v1.Query` has two methods, `Account` and `EVMWindow`. There is no `Params` method.

## Authentication

All REST and gRPC endpoints are unauthenticated by default. For production deployments, place a reverse proxy (e.g., Nginx or Caddy) in front of the node to handle TLS termination and access control.
