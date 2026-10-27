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
These interfaces are available on both the **`qorechain-vladi`** mainnet (live since 7 June 2026) and the **`qorechain-diana`** testnet. At the time of writing (checked 27 October 2026) mainnet runs node release **v3.2.4** (applied at height 3,742,566 on 23 October 2026, governance proposal 13), and mainnet governance proposal 14 is in its voting period; it would apply v3.2.5 at height 3,906,833. The testnet runs **v3.2.6**: it applied v3.2.5 at height 8,890,800 on 26 October 2026 and v3.2.6 at height 8,970,638 on 27 October 2026. Routes and fields added by a release appear on a network only once that network has applied the release; this page marks what is testnet-only. The base URLs below assume a locally running node. The public hosted endpoints are `https://api.qore.host` / `https://api-testnet.qore.host` (REST) and `https://rpc.qore.host` / `https://rpc-testnet.qore.host` (RPC), listed in [Networks](/appendix/networks#public-endpoints). **There is no public gRPC endpoint**: the hostnames `grpc.qore.host` and `grpc-testnet.qore.host` do not exist, so run your own node if you need gRPC.
:::

## Base URLs

```
REST:  http://localhost:1317
gRPC:  localhost:9090
RPC:   http://localhost:26657
```

## Which routes exist {#which-routes-exist}

QoreChain-specific modules are exposed over REST under the `/qorechain/<module>/v1/...` prefix, and only the modules listed below have REST routes. The other modules are reachable over **gRPC only** (see [gRPC-only modules](#grpc-only-modules)). Standard Cosmos SDK, EVM and QoreChain Native routes are listed in [Standard routes](#standard-routes).

A route that does not exist answers HTTP `501` with `{"code":12,"message":"Not Implemented"}`. That means the route is not served, not that the query came back empty. Shortened paths without the `/qorechain/` prefix (for example `/bridge/v1/chains` or `/pqc/v1/params`) are **not** served. An unknown record on a route that does exist returns HTTP `404` with `{"code":5,"message":"... not found"}`.

The examples below use the public mainnet host; replace it with `https://api-testnet.qore.host` for the testnet. Values in the samples were read from the live networks between 20 and 27 October 2026 and change over time; use them for the shape of a response. The v3.2.4 release added a few routes and fields. They are marked **v3.2.4** below: the testnet has served them since 19 October 2026 and mainnet since 23 October 2026. The v3.2.6 release added more, marked **v3.2.6 (testnet)**: they answer on the testnet only, and mainnet answers them with `501` until it applies that release. A node still on an older release answers a new route with `501`.

## PQC Module {#pqc-module}

| Method | Endpoint                                 | Description                                                                 |
| ------ | ---------------------------------------- | --------------------------------------------------------------------------- |
| GET    | `/qorechain/pqc/v1/account/{address}`    | Post-quantum key registration for an account (`found`, key type, algorithm) |
| GET    | `/qorechain/pqc/v1/evm_window/{address}` | The account's EVM-lane authorisation window and what remains of it          |
| GET    | `/qorechain/pqc/v1/evm_delegation_consent/{address}` | The account's EIP-7702 delegation consent, current delegation and EVM nonce (since v3.2.2) |
| GET    | `/qorechain/pqc/v1/protocol_features`    | **v3.2.4** (testnet since 19 October 2026; mainnet since 23 October 2026; `501` on an older node). Every protocol feature the binary knows, with `enabled`, `known` and `staged` flags |
| GET    | `/qorechain/pqc/v1/params`               | **v3.2.6 (testnet)**. The module parameters; `501` on mainnet at the time of writing |

Note that the path segment is the singular `account`. There is no `/qorechain/pqc/v1/stats` route (use `qorechaind query pqc stats`). `/qorechain/pqc/v1/params` is served from v3.2.6, so on the testnet only for now; on mainnet use `qorechaind query pqc params` against a node until it applies that release.

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

`classical_key_source` says where `ecdsa_pubkey` comes from: `stored` (the key given at registration), `auth_account` (nothing was stored, so it is the account's own on-chain public key) or `none`. From v3.2.4 (on the testnet since 19 October 2026; on mainnet since 23 October 2026) the record also carries `"possession_proven": false`, which is `true` once a key was registered with a verified [proof of possession](/developer-guide/post-quantum-signing#proof-of-possession); a node on an older release does not report the field.

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

At the time of writing, `layers` is an empty list on both networks. The sample is the mainnet response; on the testnet `max_sidechains` is `64` (raised by governance proposal 16, passed 25 October 2026, for the builder event).

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

The real response lists every burn source (`ai_service`, `amm`, `auto_buyback`, `bridge_fee`, `contract_create`, `failed_tx`, `gas_fee`, `milestone`, `rollup_create`, `tge`, `treasury_buyback`, `xqore_penalty`, and, from v3.2.4, `staking_tier_penalty`, the early-unlock penalty of a staking-tier lock, burned); the sample is trimmed. Amounts are in `uqor`. `failed_tx` has been non-zero since the v3.2.2 upgrade, when the failed-transaction burn started to apply to the fee actually charged. Since v3.2.3 old per-burn `records` are pruned, so `records` is a recent window, not the full history; the totals in `stats` are cumulative.

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stranded_rewards
```

```json
{ "reserved": "0", "released": "10500542706858", "initialized": true, "snapshot_height": "2981742" }
```

`reserved` is what is left to release, `released` is how much governance has already moved out, and `snapshot_height` is the height of the v3.2.0 upgrade that recorded the reserve. The values above are those read on 23 October 2026: governance released the first amount (6,693,045.921330 QOR) on 19 October 2026, the v3.2.3 upgrade recomputed the remaining reserve at its own height (3,807,496.785528 QOR), and governance proposal 12 released that amount (passed, voting ended 21 October 2026), so the reserve is now empty and `released` totals 10,500,542.706858 QOR. Read the live values. See [Tokenomics](/architecture/tokenomics).

## Abstract Account Module {#abstract-account-module}

The abstract-account query service is exposed over REST under `/qorechain/abstractaccount/v1/...` (since chain version **v3.1.85**), including the **permission schema** used to validate [authenticator](/developer-guide/account-abstraction#authenticators) scopes without hardcoding.

| Method | Endpoint                                              | Description                                                         |
| ------ | ----------------------------------------------------- | ------------------------------------------------------------------- |
| GET    | `/qorechain/abstractaccount/v1/config`                | Module configuration (feature-probe: `enabled`)                     |
| GET    | `/qorechain/abstractaccount/v1/accounts`              | Lists abstract accounts                                             |
| GET    | `/qorechain/abstractaccount/v1/accounts/{address}`    | Abstract-account state for an address (`404` if none)               |
| GET    | `/qorechain/abstractaccount/v1/permission_schema`     | `schema_version`, `permissions`, `msg_permissions`, `key_management_msgs`, `lane_rules` |
| GET    | `/qorechain/abstractaccount/v1/auth_nonce/{address}/{pubkey_hex}` | **v3.2.4** (testnet since 19 October 2026; mainnet since 23 October 2026; `501` on an older node). The sequence a linked authenticator key must sign next (`nonce`, `linked`) |

```bash
curl -s https://api.qore.host/qorechain/abstractaccount/v1/config
```

```json
{ "config": { "enabled": false, "max_session_keys": 10, "max_spending_rules": 5, "default_session_ttl": "86400" } }
```

:::note Disabled on mainnet, enabled on the testnet
The sample above is the mainnet response: `enabled` is `false` there (and `accounts` is an empty list), so abstract-account features such as linked-wallet spending are not available on mainnet. On the testnet `enabled` is `true` since governance proposal 18 (passed 27 October 2026) and `accounts` lists the accounts created so far (checked 27 October 2026). Use `config.enabled` as the feature probe before relying on this module. See [Account Abstraction](/developer-guide/account-abstraction).
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

All seven AMM routes answer on both networks (checked 27 October 2026). At the time of writing there are no pools on either network (`{"pools": []}`). Answers for input that matches nothing: `pools/{pool_id}` with an unknown id returns HTTP `404` (`{"code":5,"message":"pool 1 not found"}`); `pool_by_denoms` with no pool for the pair returns `404` (`no pool for uqor/foo`); a quote for an unknown pool returns HTTP `400` with `{"code":3,"message":"pool not found"}`; `pools/{pool_id}/lp/{address}` returns `{"balance":"0"}` for an address with no LP position (the address must be a valid `qor1` bech32 address, otherwise `400`). The two quote routes and `pool_by_denoms` read their input from the query string, so they need parameters: without `amount_in` / `amount_out` they answer `400` (`invalid amount_in` / `invalid amount_out`).

On the testnet the second denomination a pool needs is available since v3.2.6: three governance-registered test tokens, see [Testnet test tokens (Fest)](#fest-tokens). There is no equivalent on mainnet, whose only bank denomination is `uqor`.

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

`reserved` is the part of the pool that is held back and can only be moved by a governance vote. The per-node bounds are in `uqor`: `max_reward_per_block_per_node` is the per-block ceiling and, since v3.2.3, `max_reward_per_month_per_node` (`2000000000` uqor = 2,000 QOR per 30 days) is the monthly ceiling, prorated by block time and uptime so it no longer depends on how fast blocks come. A ceiling is not a promised amount. The sample is the live mainnet response read on 23 October 2026, after governance released the earlier reserve (proposal 8, 19 October 2026). From v3.2.4 (on the testnet since 19 October 2026; on mainnet since 23 October 2026) the response also has `monthly_cap_active`, `last_distribution_time` and `last_distribution_height`, and a node's bound starts at its own registration.

:::note Registration needs a licence
The chain refuses a light-node registration without an active `lightnode_operator` licence grant (`holders/lightnode_operator` lists the grants). On 27 October 2026 `stats` reports `"total_registered": "1"` on both mainnet and the testnet. See [Light Nodes](/light-node/overview) for the programme status.
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

At the time of writing `rollups` is an empty list on both networks, so the per-rollup routes answer `404` (for example `{"code":5,"message":"rollup foo not found"}`). `default_challenge_window` is expressed in seconds (`604800`). From v3.2.4 the optimistic challenge window of a newly submitted batch is measured in block time: on the testnet since height 8,337,253 (19 October 2026), on mainnet since height 3,742,566 (23 October 2026). Before the upgrade the chain converted the seconds value to blocks at a fixed 6 seconds per block. On the testnet governance proposal 17 (passed 27 October 2026) set `default_challenge_window` to `3600` (one hour) and `max_rollups` to `200` for the builder event, so the sample above (mainnet) differs from the testnet there; `rollups` is still empty on the testnet at the time of writing.

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

On mainnet, `emission_mode` is `"fixed"`, `fixed_epoch_emission` is `"86000000000"` (86,000 QOR per epoch), `epoch_length` is `"43200"` blocks and `max_total_emission` is `"590000000000000"` (590,000,000 QOR, the cumulative cap). These were set by governance proposal 10 (passed 19 October 2026); the first epoch that uses the new fixed amount starts at block 3,672,000, and `epoch_info` shows the epoch in progress and the amount minted so far. The `schedule` list in the response belongs to the original `schedule` mode; it does not describe what a fixed-mode epoch mints. All amounts are `uqor`. The testnet reports its own, different values. From v3.2.4 there is a third mode, `target_apy`, with a `target_apy_bps` field (on the testnet since 19 October 2026; on mainnet since 23 October 2026). A network only switches to it by its own governance vote, so mainnet stays on `fixed` until such a vote passes (checked 27 October 2026: still `fixed`). The testnet switched to `target_apy` through its own governance (proposal 14, passed 20 October 2026) and reports `"emission_mode": "target_apy"` at the time of writing, with `epoch_info` showing the cumulative cap already reached (`remaining_emission` `0`).

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

## RL Consensus Module (v3.2.6, testnet) {#rlconsensus-module}

:::note Testnet only for now
The REST gateway of the `rlconsensus` module arrived with **v3.2.6**, which the `qorechain-diana` testnet applied at height 8,970,638 on 27 October 2026. On mainnet every route below answers HTTP `501` (`{"code":12,"message":"Not Implemented"}`) at the time of writing (checked 27 October 2026); there the module is reachable over gRPC only. All seven routes answer on the testnet and none needs a parameter.
:::

| Method | Endpoint                                  | Description                                                              |
| ------ | ----------------------------------------- | ------------------------------------------------------------------------ |
| GET    | `/qorechain/rlconsensus/v1/agent`         | Agent status: `mode`, `current_epoch`, `total_steps`, `last_observation_at`, `last_action_at`, `circuit_breaker_active`, `blocks_since_revert` |
| GET    | `/qorechain/rlconsensus/v1/params`        | Module parameters: observation interval, agent mode, step limits, circuit-breaker window and threshold, reward weights, default block time, gas price and validator-set size |
| GET    | `/qorechain/rlconsensus/v1/observation`   | The latest observation vector (`height` and 25 `values`)                 |
| GET    | `/qorechain/rlconsensus/v1/reward`        | The latest reward signal and its components                              |
| GET    | `/qorechain/rlconsensus/v1/policy`        | The stored policy network: `epoch`, `updated_at`, `weight_count` (the weights themselves are not returned) |
| GET    | `/qorechain/rlconsensus/v1/applied_params` | The values the agent holds as applied: `block_time_ms`, `gas_limit`, `gas_price_floor`, `pool_weight_rpos`, `pool_weight_dpos` |
| GET    | `/qorechain/rlconsensus/v1/last_action`   | The action the agent proposed at its last step: `height`, `mode`, five `values` and `applied` |

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

The agent takes one step every `observation_interval` blocks (10). In `shadow` mode it computes an action and records it without applying anything, so `applied` is `false` and `applied_params` stays at its defaults (`block_time_ms` `5000`, `gas_price_floor` `100`, pool weights `0.40` and `0.35`). On the testnet the agent was started in shadow mode with a stored policy by governance proposal 29 (passed 27 October 2026); `circuit_breaker_active` is `false`. Amounts and values are strings. The applied values are informational in this release: the only reader on chain is the read-only [`rlConsensusParams` precompile](/developer-guide/evm-precompiles#network-status). The matching gRPC methods are `AgentStatus`, `Params`, `Observation`, `Reward`, `Policy`, `AppliedParams` and `LastAction` (service `qorechain.rlconsensus.v1.Query`), and the CLI commands are in [Query Commands](/cli-reference/query-commands#rlconsensus).

## Staking Tiers Module (v3.2.4) {#stakingtier-module}

:::note Available from v3.2.4
The staking-tiers module is part of **v3.2.4**. These routes have been served by the testnet since 19 October 2026 and by mainnet since 23 October 2026 (governance proposal 13, height 3,742,566). A node on an older release answers them with `501`.
:::

| Method | Endpoint                                  | Description                                                        |
| ------ | ----------------------------------------- | ------------------------------------------------------------------ |
| GET    | `/qorechain/stakingtier/v1/params`        | Lock tiers, the minimum lock amount, the early-unlock penalty      |
| GET    | `/qorechain/stakingtier/v1/locks/{holder}` | A holder's locks, what each currently accrues and what can be claimed |
| GET    | `/qorechain/stakingtier/v1/pool`          | The bonus pool: balance, outstanding, surplus and the last settlement |

`params` lists the three lock lengths (3, 6 and 12 months) with their parameters and `min_lock_amount` (`"10000000"` uqor, 10 QOR). Locks are made with `tx stakingtier lock` (see [Transaction Commands](/cli-reference/transaction-commands#stakingtier)).

## Reputation Module {#reputation-module}

The reputation module's REST routes are served by the **testnet** (`qorechain-diana`, chain v3.2.6). On mainnet every `/qorechain/reputation/v1/...` route answers HTTP `501` (`{"code":12,"message":"Not Implemented"}`) at the time of writing (27 October 2026); there the module is reachable over gRPC only (`Params`, see below). A later mainnet release is expected to serve them; this page is updated once it has.

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET    | `/qorechain/reputation/v1/params` | The score weights (`alpha`, `beta`, `gamma`, `delta`), `lambda` and `min_score` |
| GET    | `/qorechain/reputation/v1/validator/{address}` | One validator's record. `{address}` is a `qorvaloper1...` operator address or a `qorvalcons1...` consensus address. Fields include `composite_score`, `stake_score`, `performance_score`, `contribution_score`, `time_score`, `uptime_blocks`, `missed_blocks` and `last_updated_height`. `404` means the validator has no score yet; a string that is neither an operator nor a consensus address answers `400` |
| GET    | `/qorechain/reputation/v1/validators` | The records of all scored validators (`reputations`) |

Scores are decimal strings between 0 and 1. The light node reads the per-validator route to warn when a delegated validator is below `min_reputation` (see [Rewards and Monitoring](/light-node/rewards-and-monitoring#delegation-alerts)). The same routes from the mainnet host return `501` until mainnet serves them.

## gRPC-only modules {#grpc-only-modules}

On mainnet (node release v3.2.4, checked 27 October 2026) these modules have a gRPC `Query` service but **no REST route**. Service names follow `qorechain.<module>.v1.Query`.

| Module        | gRPC query methods (mainnet, chain version v3.2.4)     |
| ------------- | ------------------------------------------------------ |
| `ai`          | `Config`, `Stats`                                      |
| `crossvm`     | `Params`, `PendingMessages`, `Message`                 |
| `reputation`  | `Params` (REST routes exist on the testnet only, see [Reputation Module](#reputation-module)) |
| `rlconsensus` | `AgentStatus`, `Params`, `Observation`, `Reward`, `Policy` |
| `svm`         | `Slot`, `Account`, `Program`                           |
| `qca`         | `Config`                                               |

The `rlconsensus` queries are served over REST on the testnet from v3.2.6 (with two more methods, `AppliedParams` and `LastAction`); see [RL Consensus Module](#rlconsensus-module). Mainnet answers them with `501` until it applies that release. Use `grpcurl` against your own node, or the [CLI query commands](/cli-reference/query-commands). The `rdk` queries are also available over REST (see [RDK Module](#rdk-module)); they were gRPC only before v3.2.2.

The xQORE, BTC-restaking (Babylon) and FairBlock modules have no query service in the current release at all, over REST or gRPC. The inflation and gas-abstraction modules, which had none before v3.2.2, are served over REST (see [Inflation Module](#inflation-module) and [Gas Abstraction Module](#gas-abstraction-module)).

## Standard routes {#standard-routes}

The standard Cosmos SDK, IBC, EVM and QoreChain Native REST routes are also served. Examples verified on both networks:

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
| `/cosmwasm/wasm/v1/codes/params`                      | QoreChain Native upload/instantiate permissions       |
| `/ibc/apps/transfer/v1/params`                        | IBC transfer parameters                       |
| `/ibc/core/client/v2/counterparty_info/{client_id}`   | **v3.2.6 (testnet)**. The IBC v2 counterparty registered for a client (`404` if none; `501` on mainnet) |
| `/ibc/core/client/v2/config/{client_id}`              | **v3.2.6 (testnet)**. The IBC v2 client config (`allowed_relayers`; `501` on mainnet) |
| `/cosmos/evm/erc20/v1/token_pairs`, `/token_pairs/{token}` | ERC20 token pairs (testnet: the three Fest test tokens and one IBC token; mainnet: none) |

The QoreChain Native prefix is `/cosmwasm/wasm/v1/...`; `/cosmos/wasm/v1/...` is not served.

### IBC v2 client routes (v3.2.6, testnet) {#ibc-v2-routes}

The IBC v2 client query service was served over gRPC before, but its REST routes were missing; v3.2.6 mounts them. A relayer reads the counterparty of a client from here. Both routes take the client ID in the path (for example `07-<type>-0`); without it they answer `501` on both networks. Checked 27 October 2026:

| Route | Testnet (v3.2.6) | Mainnet (v3.2.4) |
| --- | --- | --- |
| `/ibc/core/client/v2/counterparty_info/{client_id}` | `200` with the counterparty, or `404` (`client 07-<type>-0 counterparty not found`) for a client that has none registered; a blank ID answers `400` | `501` |
| `/ibc/core/client/v2/config/{client_id}` | `200`, `{"config":{"allowed_relayers":[]}}` (an empty list means any relayer) | `501` |
| `/ibc/core/channel/v2/clients/{client_id}/next_sequence_send`, `/packet_commitments` and the other IBC v2 channel routes | answer (`404` when nothing is recorded for the client, `200` with an empty list for commitments) | answer, same shapes |

The IBC v1 routes (`/ibc/core/client/v1/...`, `/ibc/core/channel/v1/...`) answer on both networks. At the time of writing the testnet holds one IBC client and one open transfer channel (`channel-0`, with one IBC-denominated token), and mainnet has no IBC client, channel or IBC-denominated token. On the testnet the rate-limit module answers at `/Stride-Labs/ibc-rate-limiting/ratelimit/ratelimits` (an empty list: no limit is set) and the 08-wasm checksum list at `/ibc/lightclients/wasm/v1/checksums` (empty); mainnet answers both with `501`.

### Testnet test tokens (Fest) {#fest-tokens}

:::note Testnet only, no value
The three tokens below exist only on the `qorechain-diana` testnet. They are test tokens for builders: they have no value, and mainnet has no ERC20 token pair at all (checked 27 October 2026: `token_pairs` is empty and the bank supply holds `uqor` only). Governance registered them as ERC20 token pairs on 27 October 2026 (proposal 26).
:::

On the testnet a registered ERC20 token also exists as a bank coin, so it can be held, sent and used as the second denomination of an [AMM pool](#amm-module). The bank denomination is `erc20:` followed by the contract address in **EIP-55 mixed-case checksum form**, and the denom string is **case-sensitive**: the all-lowercase spelling is a different string and is not found.

| Token | Contract address | Bank denom | Decimals |
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

`denoms_metadata` lists each token with `symbol` `fUSD` / `fETH` / `fBTC`, `display` `FestUSD` / `FestETH` / `FestBTC` and the decimals as the exponent of the display unit. A balance query (`/cosmos/bank/v1beta1/balances/{address}`) shows the converted part of a holder's balance under the `erc20:...` denom; tokens still held on the EVM side show in the ERC20 contract's own `balanceOf`. Converting between the two forms is done with `MsgConvertERC20` (EVM to bank) and `MsgConvertCoin` (bank to EVM); the sender of `MsgConvertERC20` must be written as a `qor1` bech32 address. See [EVM Development](/developer-guide/evm-development#fest-tokens).

## gRPC Reflection

A node you run yourself serves gRPC on port `9090`. Where server reflection is enabled, tools such as `grpcurl` can discover the available services:

```bash
grpcurl -plaintext localhost:9090 list
```

To query a specific service:

```bash
grpcurl -plaintext -d '{"address":"qor1..."}' localhost:9090 qorechain.pqc.v1.Query/Account
```

`qorechain.pqc.v1.Query` has three methods on a v3.2.3 node, `Account`, `EVMWindow` and `EVMDelegationConsent`, and a fourth from v3.2.4 (the testnet since 19 October 2026, mainnet since 23 October 2026), `ProtocolFeatures`. A `Params` method is added in v3.2.6 (the testnet only for now); a mainnet node has no `Params` method.

## Authentication

All REST and gRPC endpoints are unauthenticated by default. For production deployments, place a reverse proxy (e.g., Nginx or Caddy) in front of the node to handle TLS termination and access control.
