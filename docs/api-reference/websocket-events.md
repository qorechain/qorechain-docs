---
slug: /api-reference/websocket-events
title: WebSocket Events
sidebar_label: WebSocket Events
sidebar_position: 5
---

# WebSocket Events

QoreChain provides real-time event streaming through two WebSocket interfaces: the EVM-compatible WebSocket and the QoreChain Consensus Engine RPC WebSocket.

:::note
The consensus-engine RPC WebSocket is available publicly on both the **`qorechain-vladi`** mainnet and the **`qorechain-diana`** testnet. The EVM WebSocket is available publicly on the **testnet only**: there is no public mainnet EVM WebSocket (`wss://evm.qore.host` and `wss://evm-ws.qore.host` do not accept WebSocket connections), so on mainnet run your own node for `eth_subscribe`. The local endpoints below assume a node you run yourself.

| Interface | Mainnet | Testnet |
| --------- | ------- | ------- |
| RPC WebSocket | `wss://rpc.qore.host/websocket` | `wss://rpc-testnet.qore.host/websocket` |
| EVM WebSocket | none (own node only) | `wss://evm-ws-testnet.qore.host` |
:::

---

## EVM WebSocket

**Endpoint:** `ws://localhost:8546` on your own node; public testnet: `wss://evm-ws-testnet.qore.host`. There is no public mainnet EVM WebSocket.

The EVM WebSocket supports the standard `eth_subscribe` method for real-time event streaming compatible with Ethereum tooling.

### Subscription Types

| Subscription             | Description                                      |
| ------------------------ | ------------------------------------------------ |
| `newHeads`               | Emits a header each time a new block is appended |
| `logs`                   | Emits logs matching an optional filter           |
| `newPendingTransactions` | Emits transaction hashes entering the mempool    |

The `syncing` subscription is not implemented: `eth_subscribe` with `"syncing"` returns `-32600 syncing subscription is not implemented`. Poll `eth_syncing` over HTTP instead.

### Subscribe to New Blocks

```json
{
  "jsonrpc": "2.0",
  "method": "eth_subscribe",
  "params": ["newHeads"],
  "id": 1
}
```

### Subscribe to Logs with Filter

```json
{
  "jsonrpc": "2.0",
  "method": "eth_subscribe",
  "params": [
    "logs",
    {
      "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28",
      "topics": ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"]
    }
  ],
  "id": 2
}
```

### Unsubscribe

```json
{
  "jsonrpc": "2.0",
  "method": "eth_unsubscribe",
  "params": ["0x1a2b3c..."],
  "id": 3
}
```

---

## QoreChain RPC WebSocket

**Endpoint:** `ws://localhost:26657/websocket` on your own node; public: `wss://rpc.qore.host/websocket` (mainnet) and `wss://rpc-testnet.qore.host/websocket` (testnet).

The RPC WebSocket uses the QoreChain Consensus Engine event subscription system. Clients subscribe with a query string that filters events by type and attributes.

### Subscribe to All New Blocks

```json
{
  "jsonrpc": "2.0",
  "method": "subscribe",
  "params": {
    "query": "tm.event='NewBlock'"
  },
  "id": 1
}
```

### Subscribe to All Transactions

```json
{
  "jsonrpc": "2.0",
  "method": "subscribe",
  "params": {
    "query": "tm.event='Tx'"
  },
  "id": 2
}
```

### Subscribe to Module-Specific Events

Filter by event type to receive only events from a specific module:

```json
{
  "jsonrpc": "2.0",
  "method": "subscribe",
  "params": {
    "query": "tm.event='Tx' AND bridge_deposit.chain EXISTS"
  },
  "id": 3
}
```

### Unsubscribe

```json
{
  "jsonrpc": "2.0",
  "method": "unsubscribe",
  "params": {
    "query": "tm.event='NewBlock'"
  },
  "id": 4
}
```

---

## Module Events Reference

Events are emitted as standard consensus-engine events. Subscribe with a `tm.event='Tx'` query filtered on the event type and attribute (for example `tm.event='Tx' AND bridge_deposit.chain EXISTS`). Block-level events (those emitted by end-of-block logic, such as the PRISM events below) are delivered with `tm.event='NewBlock'`, not `Tx`. The names and attributes below are those of chain version v3.2.3 (mainnet); events that exist only on the v3.2.4 testnet are marked.

:::note Which events you will actually see
Many of these modules are idle on the public networks: the bridge is not live, no multilayer layers or rollups are registered yet, and xQORE is not usable. Their events are defined but do not fire until there is activity. The PRISM observation and reward events (`rl_observation_collected`, `rl_reward_computed`) are emitted about every 10 blocks on both networks.
:::

### PQC Module

| Event Type                  | Key Attributes                                            | Description                                          |
| --------------------------- | --------------------------------------------------------- | ---------------------------------------------------- |
| `pqc_verify`                | `address`, `key_type`, `algorithm_id`, `hybrid_mode`, `status` | Emitted on each PQC signature check             |
| `pqc_hybrid_verify`         | `address`, `algorithm_id`, `status`                       | Emitted on each hybrid signature verification        |
| `pqc_hybrid_classical_only` | `address`, `hybrid_mode`                                  | Emitted when a classical-only signature is accepted by the current mode |
| `pqc_key_registered`        | `address`, `key_type`, `algorithm_id`                     | Emitted when a PQC key is registered                 |
| `pqc_key_rotated`           | `address`, `algorithm_id`                                 | Emitted when a PQC key is rotated                    |
| `pqc_key_migrated`          | `address`, `from_algorithm`, `to_algorithm`               | Emitted when a key is migrated to a new algorithm    |
| `pqc_evm_window_opened`     | `address`, `expiry_height`, `max_txs`, `max_value`; `native_only` and `allowed_targets` when the window is scoped (v3.2.3) | Emitted when an EVM-lane authorisation window opens  |
| `pqc_evm_window_closed`     | `address`                                                 | Emitted when an EVM-lane authorisation window closes |
| `pqc_evm_delegation_consent` | `address`, `delegate`, `expiry_height`                   | Emitted when an account records its consent to an EIP-7702 delegation (v3.2.2) |
| `pqc_evm_delegation_cleared` | `address`, `delegate`                                    | Emitted when an account's EIP-7702 delegation is cleared (v3.2.2) |
| `pqc_algorithm_registered`, `pqc_algorithm_status_updated`, `pqc_algorithm_disabled` | `algorithm_id`, and `name`/`category`, `old_status`/`new_status` or `reason` | Algorithm-registry changes made by governance |

PQC keys are registered explicitly with a registration transaction; there is no automatic registration event.

### Bridge Module

| Event Type                    | Key Attributes                                           | Description                                  |
| ----------------------------- | -------------------------------------------------------- | -------------------------------------------- |
| `bridge_deposit`              | `operation_id`, `chain`, `asset`, `amount`, `sender`     | Emitted when an inbound deposit is recorded  |
| `bridge_withdraw`             | `operation_id`, `chain`, `asset`, `amount`, `sender`, `receiver` | Emitted when a withdrawal is recorded |
| `bridge_attestation`          | `operation_id`, `validator`, `chain`, `pqc_verified`, `attestations` | Emitted for each validator attestation |
| `bridge_operation_executed`   | `operation_id`, `status`                                 | Emitted when an operation completes          |
| `bridge_circuit_breaker_trip` | `chain`, `status`, `reason`                              | Emitted when a chain's bridge circuit breaker trips |

### Cross-VM Module

| Event Type         | Key Attributes                                                              | Description                                           |
| ------------------ | --------------------------------------------------------------------------- | ----------------------------------------------------- |
| `crossvm_request`  | `message_id`, `source_vm`, `target_vm`, `target_contract`, `sender`         | Emitted when a cross-VM call is initiated             |
| `crossvm_response` | `message_id`, `status`                                                      | Emitted when a cross-VM call completes                |
| `crossvm_timeout`  | `message_id`                                                                | Emitted when a cross-VM message exceeds its queue timeout |

### Multilayer Module

| Event Type              | Key Attributes                                                                               | Description                                  |
| ----------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `state_anchored`        | `layer_id`, `layer_height`, `state_root`, `main_chain_height`, `pqc_verified`, `transaction_count` | Emitted when a layer state anchor is accepted |
| `anchor_challenged`     | `layer_id`, `layer_height`, `challenger`, `challenge_reason`, `resolution`                   | Emitted when an anchor is challenged         |
| `layer_status_updated`  | `layer_id`, `status`, `reason`                                                               | Emitted when a layer changes status          |
| `sidechain_registered`, `paychain_registered` | `layer_id`, `layer_type`, `creator`, `status`                          | Emitted when a layer is registered           |
| `transaction_routed`    | `selected_layer`, `routing_reason`, `gas_savings`, `latency_ms`, `sender`                    | Emitted when a transaction is routed to a layer |

### RDK Module

| Event Type        | Key Attributes                                              | Description                                      |
| ----------------- | ----------------------------------------------------------- | ------------------------------------------------ |
| `rollup_created`  | `rollup_id`, `creator`, `profile`, `settlement_mode`        | Emitted when a new rollup is registered          |
| `rollup_paused`, `rollup_resumed`, `rollup_stopped` | `rollup_id` and a reason where given | Emitted when a rollup is paused, resumed or stopped |
| `batch_challenged`, `challenge_resolved`, `batch_rejected` | `rollup_id`, `batch_index` (and `fraud_upheld` on a resolution) | Emitted when a batch is challenged, the challenge is resolved, or a batch is rejected |
| `batch_submitted` | `rollup_id`, `batch_index`, `tx_count`                      | Emitted when a settlement batch is submitted     |
| `batch_finalized` | `rollup_id`, `batch_index`                                  | Emitted when a batch passes its challenge window |
| `da_blob_stored`  | `rollup_id`, `blob_index`, `backend`, `size`                | Emitted when a DA blob is stored                 |
| `da_blob_pruned`  | `rollup_id`, `blob_index`                                   | Emitted when a DA blob is pruned after retention |

### Burn Module

| Event Type               | Key Attributes                                            | Description                                         |
| ------------------------ | --------------------------------------------------------- | --------------------------------------------------- |
| `burn`                   | `source`, `amount`                                        | Emitted when tokens are permanently burned          |
| `milestone_burn`         | `tx_threshold`, `burn_amount`, `cumulative_tx_count`      | Emitted when a transaction-count milestone burn runs |
| `burn_stranded_released` | `amount`, `destination`, `remaining`                      | Emitted when governance releases part of the stranded staker share |

### Inflation, Gas Abstraction, Licence, Light Node and AI Modules

| Event Type | Key Attributes | Description |
| ---------- | -------------- | ----------- |
| `inflation_params_updated` | `mode`, `fixed_epoch_emission`, `max_total_emission` | Emitted when governance changes the emission parameters |
| `gas_abstraction_conversion`, `gas_abstraction_refill` | `paid`, `native_equivalent`, `rate`, `price_source`, `result` | Emitted when a fee in another accepted token is converted, and when the float is refilled (none fire while only `uqor` is accepted) |
| `gas_abstraction_float_funded`, `gas_abstraction_config_updated` | `sender`, `amount`; `accepted_tokens`, `block_conversion_cap` | Emitted when the float is funded and when governance updates the configuration |
| `license_granted`, `license_revoked`, `license_suspended`, `license_resumed`, `license_expired` | grantee and feature | Licence lifecycle |
| `license_authority_updated` | `new_authority` | Emitted when governance replaces the licence authority (v3.2.3) |
| `lightnode_register`, `lightnode_heartbeat`, `lightnode_claim_rewards`, `lightnode_deregister`, `lightnode_status_change`, `lightnode_reward_distribution`, `lightnode_reserve_release` | `address`, `node_type`, `status`, `reward_amount`, `destination` | Light-node lifecycle and reward events |
| `ai_config_updated` | `max_tx_per_minute`, `max_evm_tx_per_minute`, `anomaly_action`, `anomaly_threshold` | Emitted when governance updates the AI screening configuration |

### Staking Tiers Module (v3.2.4)

These events come with the v3.2.4 release: the `qorechain-diana` testnet has emitted them since 19 October 2026 and mainnet emits them from height 3,742,566 (governance proposal 13). A mainnet node still on v3.2.3 has no staking-tiers module and emits none of them.

| Event Type | Key Attributes | Description |
| ---------- | -------------- | ----------- |
| `staking_tier_lock_created` | `lock_id`, `delegator`, `validator`, `amount`, `months`, `end_time` | A delegation lock was created |
| `staking_tier_lock_unlocked_early`, `staking_tier_lock_released` | `lock_id`, `delegator`, `penalty_burned`, `bonus_forfeited` | A lock was ended early (the penalty is burned under the `staking_tier_penalty` burn source), or reached its end |
| `staking_tier_bonus_claimed`, `staking_tier_bonus_settled` | `delegator`, `amount`; settlement totals | A bonus was claimed; the pool was settled |
| `staking_tier_params_updated` | parameters | Governance changed the module parameters |

### xQORE Module

These events are not emitted yet: xQORE is not live in any released node build (see [xQORE Staking](/user-guide/xqore-staking)).

| Event Type     | Key Attributes                                                        | Description                              |
| -------------- | --------------------------------------------------------------------- | ---------------------------------------- |
| `xqore_lock`   | `owner`, `amount`                                                     | Emitted when QOR is locked into xQORE    |
| `xqore_unlock` | `owner`, `amount`, `penalty`, `burned`, `redistributed`, `returned`   | Emitted when xQORE is unlocked back to QOR |

### PRISM Consensus (RL Consensus) Module

These are end-of-block events, delivered on the `NewBlock` stream.

| Event Type                     | Key Attributes          | Description                                                   |
| ------------------------------ | ----------------------- | ------------------------------------------------------------- |
| `rl_observation_collected`     | `height`                | Emitted when a PRISM observation is taken (about every 10 blocks) |
| `rl_reward_computed`           | `height`, `reward`      | Emitted when the PRISM reward is computed                     |
| `rl_action_applied`            | `height`, `agent_mode`  | Emitted when the PRISM agent applies a parameter adjustment   |
| `rl_agent_mode_changed`        | `height`, `agent_mode`  | Emitted when the agent mode changes                           |
| `rl_circuit_breaker_triggered` | `height`                | Emitted when the PRISM circuit breaker blocks an action       |
| `rl_circuit_breaker_recovered` | `height`                | Emitted when the circuit breaker recovers                     |

### AI Module

| Event Type         | Key Attributes                                   | Description                                         |
| ------------------ | ------------------------------------------------ | --------------------------------------------------- |
| `ai_anomaly_check` | `score_millionths`, `action`, `is_anomalous`     | Emitted for each anomaly-scored transaction         |

---

## JavaScript Client Example

### EVM WebSocket (ethers.js)

```javascript
import { ethers } from "ethers";

// Own node: ws://localhost:8546. Public testnet: wss://evm-ws-testnet.qore.host
const provider = new ethers.WebSocketProvider("ws://localhost:8546");

// Subscribe to new blocks
provider.on("block", (blockNumber) => {
  console.log("New block:", blockNumber);
});

// Subscribe to contract events
const filter = {
  address: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28",
  topics: [ethers.id("Transfer(address,address,uint256)")],
};
provider.on(filter, (log) => {
  console.log("Transfer event:", log);
});
```

### QoreChain RPC WebSocket (Native)

```javascript
// Own node: ws://localhost:26657/websocket. Public: wss://rpc.qore.host/websocket
const ws = new WebSocket("ws://localhost:26657/websocket");

ws.onopen = () => {
  // Subscribe to bridge deposits
  ws.send(JSON.stringify({
    jsonrpc: "2.0",
    method: "subscribe",
    params: { query: "tm.event='Tx' AND bridge_deposit.chain EXISTS" },
    id: 1,
  }));

  // Subscribe to rollup batch submissions
  ws.send(JSON.stringify({
    jsonrpc: "2.0",
    method: "subscribe",
    params: { query: "tm.event='Tx' AND batch_submitted.rollup_id EXISTS" },
    id: 2,
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.result && data.result.events) {
    console.log("Event received:", data.result.events);
  }
};
```

---

## Notes

- **Connection limits**: On a node you run yourself, the default maximum number of WebSocket connections is unlimited (`max-open-connections = 0`). Set a limit in `app.toml` for production deployments. The public endpoints apply their own limits.
- **Event buffer**: The RPC WebSocket buffers a bounded number of events per subscription (a default of 200 on a self-hosted node). If the client falls behind, older events are dropped.
- **Reconnection**: Clients should implement automatic reconnection with exponential backoff, as WebSocket connections may be interrupted during node restarts or upgrades.
