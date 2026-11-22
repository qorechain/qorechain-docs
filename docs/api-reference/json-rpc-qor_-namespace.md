---
slug: /api-reference/json-rpc-qor_-namespace
title: JSON-RPC — qor_ Namespace
sidebar_label: JSON-RPC — qor_ Namespace
sidebar_position: 2
---

# JSON-RPC — qor_ Namespace

The `qor_` namespace was designed to provide QoreChain-specific JSON-RPC methods for querying post-quantum cryptography status, AI analytics, cross-VM messaging, multi-layer state, bridge operations, tokenomics, rollup infrastructure, and PRISM consensus state.

:::warning Served on the testnet from v3.2.9, not on mainnet
From v3.2.9, the testnet EVM endpoint (`https://evm-testnet.qore.host`) serves all the methods listed on this page. Mainnet runs v3.2.8, and its public EVM endpoint does not list the `qor` namespace: every `qor_` method there, including those in the table below, returns `-32601` (method not found). Checked on 22 November 2026: each of the 26 method names on this page, called on the testnet without arguments, answered either with a result or with an invalid-parameters error naming a missing argument, and none returned `-32601`; on mainnet `qor_getBurnStats` returned `-32601`. Build against the REST routes in the table below for anything that has to work on both networks. Client libraries that expose `client.qor.*` helpers wrap these same methods, so those helpers work on the testnet and fail on mainnet.
:::

## What is served: `qor_getKEMKey` {#qor-getkemkey}

`qor_getKEMKey(address)` was the only method served before v3.2.9, and it is the one to use on any endpoint that lists the `qor` namespace. It returns the ML-KEM public key an address has published (`address` may be `qor1...` or `0x`). It answers `{"address": ..., "found": false}` when no key is published and otherwise adds `algorithm_id`, `algorithm_name`, `public_key` (`0x` hex) and `registered_height`. The node serves the `qor` namespace only where its `[json-rpc]` `api` list in `app.toml` includes `qor`.

Observed on 7 November 2026 (before v3.2.9):

| Network | `rpc_modules` | `qor_getKEMKey` |
| --- | --- | --- |
| Testnet (`https://evm-testnet.qore.host`) | `eth`, `net`, `qor`, `rpc`, `txpool`, `web3` | answers (`found: false` for an address with no published key) |
| Mainnet (`https://evm.qore.host`) | `eth`, `net`, `rpc`, `txpool`, `web3` | `-32601` (the public mainnet endpoint does not list `qor`) |

On that date the testnet returned `-32601` for every other `qor_` method checked (`qor_getPQCKeyStatus`, `qor_getHybridSignatureMode`, `qor_getAIStats`, `qor_getBurnStats`); from v3.2.9 they answer on the testnet, as the note at the top of this page says.

You can check the namespace list yourself:

```bash
curl -s -X POST https://evm.qore.host \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"rpc_modules","params":[],"id":1}'
```

```json
{"jsonrpc":"2.0","id":1,"result":{"eth":"1.0","net":"1.0","rpc":"1.0","txpool":"1.0","web3":"1.0"}}
```

---

## The other methods and what to use on mainnet

| Planned method                | What to use today |
| ----------------------------- | ----------------- |
| `qor_getPQCKeyStatus`         | `GET /qorechain/pqc/v1/account/{address}` (`found`, `account.key_type`, `account.created_at_height`). See [REST / gRPC Endpoints](/api-reference/rest-grpc-endpoints#pqc-module). |
| `qor_getHybridSignatureMode`  | No public REST route; `qorechaind query pqc hybrid-mode` (or `query pqc params`) against a node or `--node https://rpc.qore.host:443`. |
| AI statistics (planned; method name not final) | gRPC `qorechain.ai.v1.Query/Stats` on a node you run, or `qorechaind query ai stats`; no REST route. |
| `qor_getCrossVMMessage`       | gRPC `qorechain.crossvm.v1.Query/Message` on a node you run; no REST route. |
| `qor_getReputationScore`      | No public query route (the reputation module exposes gRPC `Params` only). |
| `qor_getLayerInfo`            | `GET /qorechain/multilayer/v1/layers/{layer_id}` and `anchor/{layer_id}`. See [Multilayer Module](/api-reference/rest-grpc-endpoints#multilayer-module). |
| `qor_getBridgeStatus`         | `GET /qorechain/bridge/v1/chains/{chain_id}`. See [Bridge Module](/api-reference/rest-grpc-endpoints#bridge-module). The bridge is not live yet. |
| `qor_getRLAgentStatus`, `qor_getRLObservation`, `qor_getRLReward` | From v3.2.6 (both networks): `GET /qorechain/rlconsensus/v1/agent`, `/observation` and `/reward` (also `/params`, `/policy`, `/applied_params`, `/last_action`); see [RL Consensus Module](/api-reference/rest-grpc-endpoints#rlconsensus-module). The routes answered `200` on the public mainnet host on 4 November 2026; on a node older than v3.2.6 they answer `501` and the gRPC service `qorechain.rlconsensus.v1.Query` (`AgentStatus`, `Observation`, `Reward`) is the way to read them. |
| `qor_getPoolClassification`   | No public query route. |
| `qor_getBurnStats`            | `GET /qorechain/burn/v1/stats`. See [Burn Module](/api-reference/rest-grpc-endpoints#burn-module). |
| `qor_getXQOREPosition`        | None. xQORE is not live (see [xQORE Staking](/user-guide/xqore-staking)). |
| `qor_getInflationRate`        | `GET /qorechain/inflation/v1/params` and `/epoch_info` (emission mode, per-epoch amount, cap, progress; served since v3.2.2). See [Inflation Module](/api-reference/rest-grpc-endpoints#inflation-module). |
| `qor_getTokenomicsOverview`   | Combine `GET /qorechain/burn/v1/stats`, `GET /qorechain/inflation/v1/epoch_info` and `GET /cosmos/bank/v1beta1/supply`. |
| `qor_getRollupStatus`, `qor_listRollups`, `qor_getSettlementBatch`, `qor_getDABlobStatus` | `GET /qorechain/rdk/v1/rollup/{id}`, `/rollups`, `/batch/{id}/{index}`, `/latest_batch/{id}`, `/batches/{id}`, `/blob/{id}/{index}` (served since v3.2.2; see [RDK Module](/api-reference/rest-grpc-endpoints#rdk-module)), or `qorechaind query rdk`. |
| `qor_suggestRollupProfile`    | No public service; see [Preset Profiles](/rollups/preset-profiles). |
| `qor_getBTCStakingPosition`   | None. The BTC-restaking module has no query service yet. |
| `qor_getAbstractAccount`      | `GET /qorechain/abstractaccount/v1/accounts/{address}`. Abstract accounts are disabled on mainnet and enabled on the testnet (checked 27 October 2026). |
| `qor_getGasAbstractionConfig` | `GET /qorechain/gasabstraction/v1/config` (served since v3.2.2). See [Gas Abstraction Module](/api-reference/rest-grpc-endpoints#gas-abstraction-module). |
| `qor_getFairBlockStatus`, `qor_getLaneConfiguration` | None. |

For the EVM-lane state of an account (registered PQC key, authorisation window and EIP-7702 consent) use `GET /qorechain/pqc/v1/account/{address}`, `GET /qorechain/pqc/v1/evm_window/{address}` and `GET /qorechain/pqc/v1/evm_delegation_consent/{address}`. The status route is the **singular** `account`; the plural `/accounts/` is not served and answers `501`.

---

## Error Codes

Errors follow standard JSON-RPC 2.0 codes. Today, calls to a planned `qor_` method fail with `-32601`, and on the mainnet endpoint so does `qor_getKEMKey`.

| Code   | Message          | Description                           |
| ------ | ---------------- | ------------------------------------- |
| -32600 | Invalid Request  | Malformed JSON-RPC request            |
| -32601 | Method not found | The method does not exist, or the node does not serve the `qor_` namespace (every planned method today; `qor_getKEMKey` too where `qor` is not enabled) |
| -32602 | Invalid params   | Missing or invalid parameters         |
| -32603 | Internal error   | Server-side processing error          |
