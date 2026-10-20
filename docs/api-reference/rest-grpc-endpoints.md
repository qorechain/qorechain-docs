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
These interfaces are available on both the **`qorechain-vladi`** mainnet (live since 7 June 2026; node release **v3.2.3**) and the **`qorechain-diana`** testnet (node release **v3.2.4**). The base URLs below assume a locally running node. The public hosted endpoints are `https://api.qore.host` / `https://api-testnet.qore.host` (REST) and `https://rpc.qore.host` / `https://rpc-testnet.qore.host` (RPC), listed in [Networks](/appendix/networks#public-endpoints). **There is no public gRPC endpoint**: the hostnames `grpc.qore.host` and `grpc-testnet.qore.host` do not exist, so run your own node if you need gRPC.
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

The examples below use the public mainnet host; replace it with `https://api-testnet.qore.host` for the testnet. Values in the samples were read from the live networks around 20 October 2026 (mainnet v3.2.3, testnet v3.2.4) and change over time; use them for the shape of a response. The testnet runs the newer v3.2.4 release, so it serves a few routes and fields that mainnet does not have; they are marked **testnet only** below and answer `501` on mainnet.

## PQC Module {#pqc-module}

| Method | Endpoint                                 | Description                                                                 |
| ------ | ---------------------------------------- | --------------------------------------------------------------------------- |
| GET    | `/qorechain/pqc/v1/account/{address}`    | Post-quantum key registration for an account (`found`, key type, algorithm) |
| GET    | `/qorechain/pqc/v1/evm_window/{address}` | The account's EVM-lane authorisation window and what remains of it          |
| GET    | `/qorechain/pqc/v1/evm_delegation_consent/{address}` | The account's EIP-7702 delegation consent, current delegation and EVM nonce (since v3.2.2) |
| GET    | `/qorechain/pqc/v1/protocol_features`    | **Testnet only (v3.2.4).** Every protocol feature the binary knows, with `enabled`, `known` and `staged` flags |

Note that the path segment is the singular `account`. There is no `/qorechain/pqc/v1/params` or `/stats` route (use `qorechaind query pqc params` and `stats` for those).

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

`classical_key_source` says where `ecdsa_pubkey` comes from: `stored` (the key given at registration), `auth_account` (nothing was stored, so it is the account's own on-chain public key) or `none`. On the testnet (v3.2.4, **testnet only**) the record also carries `"possession_proven": false`, which is `true` once a key was registered with a verified [proof of possession](/developer-guide/post-quantum-signing#proof-of-possession); mainnet does not report the field yet.

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
  "remaining_value": "",
  "native_only": false,
  "allowed_targets": []
}
```

This route never fails for an address without a window; it returns `found: false`. Since v3.2.0 the EVM lane admits a transaction only from an account that has a registered PQC key **and** an open window. `live` is `true` while the window admits at least one more transaction at the current height. `remaining_blocks`, `remaining_txs` and `remaining_value` show which bound is closest to running out; values are `uqor` integers returned as strings. Since v3.2.3 a window can carry a scope: `native_only` (plain QOR transfers only) and `allowed_targets` (listed recipients only). See [EVM Development](/developer-guide/evm-development#evm-window) for how the EVM lane works.

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

An EIP-7702 delegation of an account takes effect only with the account's own post-quantum consent (`MsgAuthorizeEVMDelegation`). `found` and `live` report a recorded, still-usable consent for `delegate`; `current_delegate` is the delegation the account has set now and `nonce` is its EVM nonce.

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

A `StateAnchorView` contains the `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, `main_chain_height`, `anchored_at`, `pqc_aggregate_signature`, `transaction_count`, and `compressed_state_proof`. Since v3.2.2 the signed message is the **v2 anchor message**: the domain tag `qorechain-multilayer-anchor-v2`, then the chain id, layer id, layer height, state root, validator-set hash, transaction count and compressed state proof, each variable-length field prefixed with its 8-byte big-endian length (the earlier v1 message had no chain id and no length prefixes, so a signature was valid on every chain). It is verified against the layer creator's registered PQC key. `qorechaind query rdk anchor-sign-bytes` prints the bytes for a rollup batch. A layer with no anchor returns HTTP `404` (`no anchor for layer ...`) from `anchor/{layer_id}` and an empty list (`{"anchors": []}`) from `anchors/{layer_id}`.

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
| GET    | `/qorechain/burn/v1/stranded_rewards` | Staker share set aside and not yet released by governance |

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

The real response lists every burn source (`ai_service`, `amm`, `auto_buyback`, `bridge_fee`, `contract_create`, `failed_tx`, `gas_fee`, `milestone`, `rollup_create`, `tge`, `treasury_buyback`, `xqore_penalty`); the sample is trimmed. Amounts are in `uqor`. `failed_tx` has been non-zero since the v3.2.2 upgrade, when the failed-transaction burn started to apply to the fee actually charged. Since v3.2.3 old per-burn `records` are pruned, so `records` is a recent window, not the full history; the totals in `stats` are cumulative.

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stranded_rewards
```

```json
{ "reserved": "3807496785528", "released": "6693045921330", "initialized": true, "snapshot_height": "2981742" }
```

`reserved` is what is left to release, `released` is how much governance has already moved out, and `snapshot_height` is the height of the v3.2.0 upgrade that recorded the reserve. The values above are those at the time of writing: governance released the first amount (6,693,045.921330 QOR) on 19 October 2026, and the v3.2.3 upgrade recomputed the remaining reserve at its own height (3,807,496.785528 QOR). A further governance proposal to release that recomputed amount was still in its voting period at the time of writing, so read the live values. See [Tokenomics](/architecture/tokenomics).

## Abstract Account Module {#abstract-account-module}

The abstract-account query service is exposed over REST under `/qorechain/abstractaccount/v1/...` (since chain version **v3.1.85**), including the **permission schema** used to validate [authenticator](/developer-guide/account-abstraction#authenticators) scopes without hardcoding.

| Method | Endpoint                                              | Description                                                         |
| ------ | ----------------------------------------------------- | ------------------------------------------------------------------- |
| GET    | `/qorechain/abstractaccount/v1/config`                | Module configuration (feature-probe: `enabled`)                     |
| GET    | `/qorechain/abstractaccount/v1/accounts`              | Lists abstract accounts                                             |
| GET    | `/qorechain/abstractaccount/v1/accounts/{address}`    | Abstract-account state for an address (`404` if none)               |
| GET    | `/qorechain/abstractaccount/v1/permission_schema`     | `schema_version`, `permissions`, `msg_permissions`, `key_management_msgs`, `lane_rules` |
| GET    | `/qorechain/abstractaccount/v1/auth_nonce/{address}/{pubkey_hex}` | **Testnet only (v3.2.4).** The sequence a linked authenticator key must sign next (`nonce`, `linked`) |

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

`expires_at: "0"` means the grant does not expire. Since v3.2.3 governance can replace the licence authority that grants these licences (`MsgUpdateAuthority`); grants already made stay in place.

## Light Node Module {#light-node-module}

| Method | Endpoint                                      | Description                                                        |
| ------ | --------------------------------------------- | ------------------------------------------------------------------ |
| GET    | `/qorechain/lightnode/v1/params`              | Registration, heartbeat and reward parameters                      |
| GET    | `/qorechain/lightnode/v1/stats`               | `total_registered`, `total_active`, `total_rewards`, `last_reward_height` |
| GET    | `/qorechain/lightnode/v1/nodes`               | Lists registered light nodes                                       |
| GET    | `/qorechain/lightnode/v1/node/{address}`      | One node (`{"node": null, "found": false}` if not registered)     |
| GET    | `/qorechain/lightnode/v1/rewards/{address}`   | Rewards accumulated for an operator address (`accumulated_rewards`) |
| GET    | `/qorechain/lightnode/v1/reward_pool`         | Reward pool accounting (`balance`, `reserved`, `outstanding`, `payable`, `distributable`, `max_reward_per_block_per_node`, `max_reward_per_month_per_node`, `initialized`) |

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

`reserved` is the part of the pool that is held back and can only be moved by a governance vote. The per-node bounds are in `uqor`: `max_reward_per_block_per_node` is the per-block ceiling and, since v3.2.3, `max_reward_per_month_per_node` (`2000000000` uqor = 2,000 QOR per 30 days) is the monthly ceiling, prorated by block time and uptime so it no longer depends on how fast blocks come. A ceiling is not a promised amount. The sample is the live mainnet response at the time of writing, after governance released the earlier reserve (proposal 8, 19 October 2026). On the testnet (v3.2.4, **testnet only**) the response also has `monthly_cap_active`, `last_distribution_time` and `last_distribution_height`, and a node's bound starts at its own registration.

:::note Registration needs a licence
The chain refuses a light-node registration without an active `lightnode_operator` licence grant (`holders/lightnode_operator` lists the grants). At the time of writing `stats` reports `"total_registered": "0"` on mainnet and one registered node on the testnet. See [Light Nodes](/light-node/overview) for the programme status.
:::

## RDK Module {#rdk-module}

The Rollup Development Kit query service is exposed over REST under `/qorechain/rdk/v1/...` (since chain version **v3.2.2**; on v3.2.0 and v3.2.1 it was gRPC only).

| Method | Endpoint                                              | Description                                          |
| ------ | ----------------------------------------------------- | ---------------------------------------------------- |
| GET    | `/qorechain/rdk/v1/params`                            | Module parameters                                    |
| GET    | `/qorechain/rdk/v1/rollups`                           | Lists rollups                                        |
| GET    | `/qorechain/rdk/v1/rollup/{rollup_id}`                | One rollup (`404` if unknown)                        |
| GET    | `/qorechain/rdk/v1/latest_batch/{rollup_id}`          | The rollup's latest settlement batch                 |
| GET    | `/qorechain/rdk/v1/batch/{rollup_id}/{batch_index}`   | One settlement batch                                 |
| GET    | `/qorechain/rdk/v1/batches/{rollup_id}`               | The rollup's batches in index order (paginated)      |
| GET    | `/qorechain/rdk/v1/blob/{rollup_id}/{blob_index}`     | One data-availability blob record                    |

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

At the time of writing `rollups` is an empty list on both networks, so the per-rollup routes answer `404` (for example `{"code":5,"message":"rollup foo not found"}`). `default_challenge_window` is expressed in seconds (`604800`). On the testnet (v3.2.4, **testnet only**) the optimistic challenge window is measured in block time.

## Inflation Module {#inflation-module}

The emission settings and progress are exposed over REST under `/qorechain/inflation/v1/...` (since chain version **v3.2.2**). They are not available through a CLI command.

| Method | Endpoint                              | Description                                                                 |
| ------ | ------------------------------------- | --------------------------------------------------------------------------- |
| GET    | `/qorechain/inflation/v1/params`      | Emission parameters: `emission_mode`, `fixed_epoch_emission`, `max_total_emission`, `epoch_length`, `enabled` |
| GET    | `/qorechain/inflation/v1/epoch_info`  | Progress: `current_epoch`, `block_start`, `next_epoch_height`, `total_minted`, `max_total_emission`, `remaining_emission` |

```bash
curl -s https://api.qore.host/qorechain/inflation/v1/params
curl -s https://api.qore.host/qorechain/inflation/v1/epoch_info
```

On mainnet, `emission_mode` is `"fixed"`, `fixed_epoch_emission` is `"86000000000"` (86,000 QOR per epoch), `epoch_length` is `"43200"` blocks and `max_total_emission` is `"590000000000000"` (590,000,000 QOR, the cumulative cap). These were set by governance proposal 10 (passed 19 October 2026); the first epoch that uses the new fixed amount starts at block 3,672,000, and `epoch_info` shows the epoch in progress and the amount minted so far. The `schedule` list in the response belongs to the original `schedule` mode; it does not describe what a fixed-mode epoch mints. All amounts are `uqor`. The testnet reports its own, different values. On the testnet only (v3.2.4, **testnet only**) there is a third mode, `target_apy`, with a `target_apy_bps` field, used by the staking-tiers module's bonus; mainnet has no such mode.

## Gas Abstraction Module {#gas-abstraction-module}

| Method | Endpoint                                              | Description                                                                 |
| ------ | ----------------------------------------------------- | --------------------------------------------------------------------------- |
| GET    | `/qorechain/gasabstraction/v1/config`                 | Accepted fee tokens, premium, per-block conversion cap                      |
| GET    | `/qorechain/gasabstraction/v1/conversion_rate?denom=` | What one unit of a fee token is worth in `uqor`, and whether it is `usable` |
| GET    | `/qorechain/gasabstraction/v1/float`                  | The conversion float's address, balances and this block's usage             |

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

The accepted list holds native `uqor` only on both networks, so fees are paid in `uqor` and no conversion takes place. Governance adds a token (with a pool, a minimum liquidity and a maximum deviation between the time-weighted and spot price); a fee paid in such a token is converted through a QOR float and refilled through an AMM pool. `conversion_rate` without `?denom=` answers `500` (`denom is required`).

## Staking Tiers Module (testnet only) {#stakingtier-module}

:::note Testnet only
The staking-tiers module is part of **v3.2.4**, which runs on the testnet only. On mainnet these routes answer `501`, and a mainnet upgrade to v3.2.4 is only proposed so far (governance proposal 13, at height 3,742,566).
:::

| Method | Endpoint                                  | Description                                                        |
| ------ | ----------------------------------------- | ------------------------------------------------------------------ |
| GET    | `/qorechain/stakingtier/v1/params`        | Lock tiers, the minimum lock amount, the early-unlock penalty      |
| GET    | `/qorechain/stakingtier/v1/locks/{holder}` | A holder's locks, what each currently accrues and what can be claimed |
| GET    | `/qorechain/stakingtier/v1/pool`          | The bonus pool: balance, outstanding, surplus and the last settlement |

`params` lists the three lock lengths (3, 6 and 12 months) with their parameters and `min_lock_amount` (`"10000000"` uqor, 10 QOR). Locks are made with `tx stakingtier lock` (see [Transaction Commands](/cli-reference/transaction-commands#stakingtier)).

## gRPC-only modules {#grpc-only-modules}

These modules have a gRPC `Query` service but **no REST route**. Service names follow `qorechain.<module>.v1.Query`.

| Module        | gRPC query methods (chain version v3.2.3)              |
| ------------- | ------------------------------------------------------ |
| `ai`          | `Config`, `Stats`                                      |
| `crossvm`     | `Params`, `PendingMessages`, `Message`                 |
| `reputation`  | `Params`                                               |
| `rlconsensus` | `AgentStatus`, `Params`, `Observation`, `Reward`, `Policy` |
| `svm`         | `Slot`, `Account`, `Program`                           |
| `qca`         | `Config`                                               |

Use `grpcurl` against your own node, or the [CLI query commands](/cli-reference/query-commands). The `rdk` queries are also available over REST (see [RDK Module](#rdk-module)); they were gRPC only before v3.2.2.

The xQORE, BTC-restaking (Babylon) and FairBlock modules have no query service in the current release at all, over REST or gRPC. The inflation and gas-abstraction modules, which had none before v3.2.2, are served over REST (see [Inflation Module](#inflation-module) and [Gas Abstraction Module](#gas-abstraction-module)).

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
| `/cosmos/upgrade/v1beta1/current_plan`, `/applied_plan/{name}` | Pending / applied upgrades (`applied_plan/v3.2.3` returns `{"height":"3662051"}` on mainnet) |
| `/cosmos/circuit/v1/disable_list`                     | Message types switched off network-wide       |
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

`qorechain.pqc.v1.Query` has three methods on mainnet, `Account`, `EVMWindow` and `EVMDelegationConsent`, and a fourth on the testnet only (v3.2.4), `ProtocolFeatures`. There is no `Params` method.

## Authentication

All REST and gRPC endpoints are unauthenticated by default. For production deployments, place a reverse proxy (e.g., Nginx or Caddy) in front of the node to handle TLS termination and access control.
