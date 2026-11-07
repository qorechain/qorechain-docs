---
slug: /api-reference/json-rpc-qor_-namespace
title: JSON-RPC — qor_ Namespace
sidebar_label: JSON-RPC — qor_ Namespace
sidebar_position: 2
---

# JSON-RPC — qor_ Namespace

The `qor_` namespace was designed to provide QoreChain-specific JSON-RPC methods for querying post-quantum cryptography status, AI analytics, cross-VM messaging, multi-layer state, bridge operations, tokenomics, rollup infrastructure, and PRISM consensus state.

:::warning The planned methods are not served yet
**None of the methods in the table below is served on any network yet.** They are implemented in the node source but not registered with the JSON-RPC server, and each returns `-32601` (method not found). Registering them is planned for a node release, and this page will say which release when it ships. Do not build against them today; use the REST routes in the table where one exists. Client libraries that expose `client.qor.*` helpers wrap these same methods, so those helpers fail the same way.
:::

## What is served: `qor_getKEMKey` {#qor-getkemkey}

One method of the namespace is served: `qor_getKEMKey(address)` returns the ML-KEM public key an address has published (`address` may be `qor1...` or `0x`). It answers `{"address": ..., "found": false}` when no key is published and otherwise adds `algorithm_id`, `algorithm_name`, `public_key` (`0x` hex) and `registered_height`. The node serves the `qor` namespace only where its `[json-rpc]` `api` list in `app.toml` includes `qor`.

Observed on 7 November 2026:

| Network | `rpc_modules` | `qor_getKEMKey` |
| --- | --- | --- |
| Testnet (`https://evm-testnet.qore.host`) | `eth`, `net`, `qor`, `rpc`, `txpool`, `web3` | answers (`found: false` for an address with no published key) |
| Mainnet (`https://evm.qore.host`) | `eth`, `net`, `rpc`, `txpool`, `web3` | `-32601` (the public mainnet endpoint does not list `qor`) |

On the testnet every other `qor_` method checked (`qor_getPQCKeyStatus`, `qor_getHybridSignatureMode`, `qor_getAIStats`, `qor_getBurnStats`) still returned `-32601`.

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

## Planned methods and what to use today

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
