---
slug: /api-reference/json-rpc-qor_-namespace
title: JSON-RPC — qor_ Namespace
sidebar_label: JSON-RPC — qor_ Namespace
sidebar_position: 2
---

# JSON-RPC — qor_ Namespace

The `qor_` namespace was designed to provide QoreChain-specific JSON-RPC methods for querying post-quantum cryptography status, AI analytics, cross-VM messaging, multi-layer state, bridge operations, tokenomics, rollup infrastructure, and PRISM consensus state.

:::warning Not served yet
**No released node build serves the `qor_` namespace yet**, on mainnet (`qorechain-vladi`), testnet (`qorechain-diana`) or a node you run yourself. On the public EVM endpoints `rpc_modules` lists only `eth`, `net`, `rpc`, `txpool` and `web3`, and **every `qor_` method returns `-32601` (method not found)** on both networks. The methods are implemented in the node source but not registered with the JSON-RPC server, so adding `qor` to the `api` list in `app.toml` has no effect. Registering the namespace is planned for a node release, and this page will say which release when it ships.

Do not build against `qor_` methods today. Use the REST routes in the table below where one exists. Client libraries that expose `client.qor.*` helpers wrap these same methods, so those helpers fail the same way.
:::

You can confirm this yourself:

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
| `qor_getHybridSignatureMode`  | No public query route. |
| `qor_getAIStats`              | gRPC `qorechain.ai.v1.Query/Stats` on a node you run; no REST route. |
| `qor_getCrossVMMessage`       | gRPC `qorechain.crossvm.v1.Query/Message` on a node you run; no REST route. |
| `qor_getReputationScore`      | No public query route (the reputation module exposes gRPC `Params` only). |
| `qor_getLayerInfo`            | `GET /qorechain/multilayer/v1/layers/{layer_id}` and `anchor/{layer_id}`. See [Multilayer Module](/api-reference/rest-grpc-endpoints#multilayer-module). |
| `qor_getBridgeStatus`         | `GET /qorechain/bridge/v1/chains/{chain_id}`. See [Bridge Module](/api-reference/rest-grpc-endpoints#bridge-module). The bridge is not live yet. |
| `qor_getRLAgentStatus`, `qor_getRLObservation`, `qor_getRLReward` | gRPC `qorechain.rlconsensus.v1.Query` (`AgentStatus`, `Observation`, `Reward`) on a node you run; no REST route. |
| `qor_getPoolClassification`   | No public query route. |
| `qor_getBurnStats`            | `GET /qorechain/burn/v1/stats`. See [Burn Module](/api-reference/rest-grpc-endpoints#burn-module). |
| `qor_getXQOREPosition`        | None. xQORE is not live (see [xQORE Staking](/user-guide/xqore-staking)). |
| `qor_getInflationRate`        | No public query route on mainnet. |
| `qor_getTokenomicsOverview`   | Combine `GET /qorechain/burn/v1/stats` with `GET /cosmos/bank/v1beta1/supply`. |
| `qor_getRollupStatus`, `qor_listRollups`, `qor_getSettlementBatch`, `qor_getDABlobStatus` | gRPC `qorechain.rdk.v1.Query` (`Rollup`, `Rollups`, `Batch`, `LatestBatch`) or the CLI on a node you run; the `/qorechain/rdk/v1/...` REST routes are not served on mainnet. |
| `qor_suggestRollupProfile`    | No public service; see [Preset Profiles](/rollups/preset-profiles). |
| `qor_getBTCStakingPosition`   | None. The BTC-restaking module has no query service yet. |
| `qor_getAbstractAccount`      | `GET /qorechain/abstractaccount/v1/accounts/{address}`. Abstract accounts are disabled on both networks today. |
| `qor_getFairBlockStatus`, `qor_getGasAbstractionConfig`, `qor_getLaneConfiguration` | None. |

For the EVM-lane state of an account (registered PQC key and authorisation window) use `GET /qorechain/pqc/v1/account/{address}` and `GET /qorechain/pqc/v1/evm_window/{address}`.

---

## Error Codes

On a node that does serve the namespace, errors follow standard JSON-RPC 2.0 codes. Today, calls to a `qor_` method fail with `-32601`.

| Code   | Message          | Description                           |
| ------ | ---------------- | ------------------------------------- |
| -32600 | Invalid Request  | Malformed JSON-RPC request            |
| -32601 | Method not found | The method does not exist, or the node does not serve the `qor_` namespace (every released build today) |
| -32602 | Invalid params   | Missing or invalid parameters         |
| -32603 | Internal error   | Server-side processing error          |
