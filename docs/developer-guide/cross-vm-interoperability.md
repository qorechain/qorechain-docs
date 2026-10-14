---
slug: /developer-guide/cross-vm-interoperability
title: Cross-VM Interoperability
sidebar_label: Cross-VM Interoperability
sidebar_position: 5
---

# Cross-VM Interoperability

QoreChain's **triple-VM architecture** (EVM, CosmWasm, SVM) is designed to let smart contracts on any virtual machine communicate with contracts on any other VM. The `x/crossvm` module provides a call message with a same-transaction path and a queued path.

:::caution What works today
Cross-VM calls are only as available as their target lane:

* `MsgCrossVMCall` is **switched off on mainnet** by the circuit breaker (`qorechaind query circuit disabled-list`); it is enabled on the testnet.
* The **SVM lane is disabled** for transactions on both networks, so an SVM leg cannot run.
* **CosmWasm upload and instantiate are permissioned** on both networks and mainnet has no stored contract code, so there is no CosmWasm contract to call yet.
* The synchronous **EVM precompile is not active** (see below).

The module's REST routes (`/qorechain/crossvm/v1/...`) are not served by the public gateway; read messages with the CLI or a gRPC/ABCI query client.
:::

:::note
The endpoints below default to a local node. On mainnet, use the **`qorechain-vladi`** RPC endpoints (Cosmos RPC **26657**, EVM JSON-RPC **8545**); the testnet is **`qorechain-diana`**.
:::

---

## Architecture Overview

```
 EVM (Solidity)          CosmWasm (Rust/Wasm)         SVM (BPF)
      |                        |                        |
      |--- sync (precompile) ->|                        |
      |                        |                        |
      |<-- async (EndBlocker) -|-- async (EndBlocker) ->|
      |                        |                        |
      |<------------ async (EndBlocker) ----------------|
```

| Path             | Direction       | Timing           | Mechanism                       |
| ---------------- | --------------- | ---------------- | ------------------------------- |
| **Synchronous**  | EVM to CosmWasm | Same transaction | Precompile at `0x0000...0901` (not active yet, see below) |
| **Message, default** | Any VM to any other VM | Same transaction | `MsgCrossVMCall`; the call executes immediately and a failure reverts the whole transaction |
| **Message, queued**  | Any VM to any other VM | Next block (or later) | `MsgCrossVMCall` with `async` set; the message waits in the queue |

---

## Synchronous Path (EVM to CosmWasm)

The synchronous path uses an EVM **precompile** at address `0x0000000000000000000000000000000000000901`. It is designed to let Solidity contracts call CosmWasm contracts and receive a response within the same transaction.

:::warning Not active on mainnet or testnet
The CrossVM bridge precompile is **not active** on `qorechain-vladi` or `qorechain-diana`: a call to `0x…0901` succeeds and returns empty data. It will not be activated in its current form; it is being rebuilt so that a revert in the calling contract also undoes the CosmWasm side, value transfers are rejected, EVM-to-EVM re-entry is refused and the cross-VM circuit breaker applies. The example below shows the intended shape only. See [EVM Precompiles: Network status](/developer-guide/evm-precompiles#network-status).
:::

### Solidity Example

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ICrossVM {
    function call(bytes calldata payload) external returns (bytes memory);
}

contract CrossVMCaller {
    ICrossVM constant CROSSVM = ICrossVM(0x0000000000000000000000000000000000000901);

    function callCosmWasmContract(
        string memory cosmwasmAddr,
        string memory executeMsg,
        uint256 funds
    ) external returns (bytes memory) {
        bytes memory payload = abi.encode(cosmwasmAddr, executeMsg, funds);
        return CROSSVM.call(payload);
    }
}
```

Once active, the precompile executes the CosmWasm contract immediately and returns the result. The current node decodes calldata as `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)`; the ABI may change with the rebuild. Gas cost: **50,000 base + 4 per input byte + execution cost**.

---

## Message Path (`MsgCrossVMCall`)

Other cross-VM calls use the `MsgCrossVMCall` transaction. The chain works out the source lane from the sender, so the message carries only the target VM, the target contract, the payload and optional funds. By default the call executes immediately within the transaction, and the whole transaction reverts if the target fails. With the `async` flag the message is queued instead and handled by the module's end-block queue pass in a later block (see the lifecycle below). As noted above, this message is switched off on mainnet.

### CLI

`tx crossvm call` takes the target VM (`evm`, `cosmwasm` or `svm`) and the target contract as positional arguments, with the payload as hex:

```bash
qorechaind tx crossvm call evm 0x1234567890123456789012345678901234567890 \
  --payload 0a0b0c --from mykey --generate-only > tx.json
```

Other flags: `--funds <coins>` (CosmWasm targets only) and `--async` to queue the call instead of executing it now. Sign and broadcast `tx.json` with `tx pqc cosign` (see [Post-Quantum Signing](/developer-guide/post-quantum-signing)); the fee floor is 0.1 uqor per gas.

:::caution Disabled on mainnet, and the CLI form needs a fix
`MsgCrossVMCall` is switched off on mainnet by the circuit breaker. In the current release binaries, `tx crossvm call` also builds a message that does not pass the message's own validation (it leaves the source VM empty), so the command is documented here for reference only.
:::

---

## Message Lifecycle

Every queued cross-VM message transitions through a defined set of states:

```
Submitted --> Pending --> Executed
                |
                +--> Failed
                |
                +--> Timed Out
```

| State         | Description                                               |
| ------------- | --------------------------------------------------------- |
| **Submitted** | Message accepted into the queue                           |
| **Pending**   | Awaiting execution in the next EndBlocker pass            |
| **Executed**  | Target contract called successfully; response recorded    |
| **Failed**    | Target contract execution reverted; error recorded        |
| **Timed Out** | Message exceeded `queue_timeout_blocks` without execution |

---

## Parameters

| Parameter              | Value        | Description                                    |
| ---------------------- | ------------ | ---------------------------------------------- |
| `enabled`              | `true`       | Module-level switch (the call message itself is separately switched off on mainnet) |
| `max_message_size`     | 65,536 bytes | Maximum payload size per message               |
| `max_queue_size`       | 1,000        | Maximum pending messages in the queue          |
| `queue_timeout_blocks` | 100          | Blocks before an unprocessed message times out |

---

## Events

The `x/crossvm` module emits the following events:

| Event              | Attributes                                                          | Description                           |
| ------------------ | ------------------------------------------------------------------- | ------------------------------------- |
| `crossvm_request`  | `message_id`, `source_vm`, `target_vm`, `target_contract`, `sender` | New cross-VM message submitted        |
| `crossvm_response` | `message_id`, `status`, `result`                                    | Message executed (success or failure) |
| `crossvm_timeout`  | `message_id`, `source_vm`, `target_vm`                              | Message expired without execution     |

Subscribe to events via WebSocket:

```bash
wscat -c ws://localhost:26657/websocket
> {"jsonrpc":"2.0","method":"subscribe","params":["tm.event='Tx' AND crossvm_request.message_id EXISTS"],"id":1}
```

---

## Querying Messages

### CLI

```bash
# Query a specific message by ID
qorechaind query crossvm message <message-id>

# List all pending messages
qorechaind query crossvm pending

# Module parameters
qorechaind query crossvm params
```

### JSON-RPC

> **Not served yet:** no released node build serves the `qor_` JSON-RPC namespace, so this call returns `-32601` (method not found) on every public endpoint today. See [the `qor_` namespace](/api-reference/json-rpc-qor_-namespace).

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getCrossVMMessage",
    "params": ["<message-id>"],
    "id": 1
  }'
```

### Response Format

```json
{
  "message_id": "crossvm-00000042",
  "source_vm": "cosmwasm",
  "target_vm": "evm",
  "target_contract": "0x1234...abcd",
  "sender": "qor1sender...",
  "payload": "...",
  "status": "executed",
  "result": "0x...",
  "submitted_height": 12345,
  "executed_height": 12346
}
```

---

## Design Considerations

**Atomicity:** Synchronous calls (EVM to CosmWasm via precompile) are designed to be atomic, so that if either side reverts the entire transaction reverts. The current precompile does not yet guarantee this, which is one reason it is not active (see above). Asynchronous calls are **not atomic** across blocks; design your contracts to handle the `Failed` and `Timed Out` states gracefully.

**Ordering:** Messages in the queue are processed FIFO within each EndBlocker pass. There is no guaranteed ordering across different source VMs.

**Payload encoding:** The payload format depends on the target VM:

* **EVM targets:** ABI-encoded function calls
* **CosmWasm targets:** JSON-encoded execute messages
* **SVM targets:** Hex-encoded BPF instruction data

---

## Next Steps

* [EVM Precompiles](/developer-guide/evm-precompiles) — Status of the synchronous CrossVM precompile and the other planned precompiles
* [EVM Development](/developer-guide/evm-development) — Solidity development on QoreChain
* [CosmWasm Development](/developer-guide/cosmwasm-development) — Rust/Wasm contract development
* [SVM Development](/developer-guide/svm-development) — BPF program deployment
