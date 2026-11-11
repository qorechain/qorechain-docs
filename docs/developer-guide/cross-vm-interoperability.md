---
slug: /developer-guide/cross-vm-interoperability
title: Cross-VM Interoperability
sidebar_label: Cross-VM Interoperability
sidebar_position: 5
---

# Cross-VM Interoperability

QoreChain's **triple-VM architecture** (EVM, QoreChain Native, SVM) is designed to let smart contracts on any virtual machine communicate with contracts on any other VM. The `x/crossvm` module provides a call message with a same-transaction path and a queued path.

:::caution What works today
Cross-VM calls are only as available as their target lane:

* `MsgCrossVMCall` is **switched off on mainnet** by the circuit breaker (`qorechaind query circuit disabled-list`); it is enabled on the testnet.
* The **SVM lane is disabled** for transactions on both networks, so an SVM leg cannot run.
* **QoreChain Native upload is permissioned** on both networks and **instantiation is permissioned on mainnet**, which has no stored contract code, so there is no QoreChain Native contract to call on mainnet yet. On the testnet, governance stored a few reviewed contracts that any account can instantiate (see [QoreChain Native Development](/developer-guide/cosmwasm-development)), so a QoreChain Native target can exist there.
* The synchronous **EVM precompile is not active on mainnet** and is **active on the testnet** with an allowlist of reviewed QoreChain Native contracts (read 7 November 2026; a read-only call through it was run after the v3.2.7 upgrade, see below). A hardened version has been in the binary since v3.2.3. (On 27 October 2026 testnet governance activated three other precompiles, PQC Verify, PQC Key Status and PRISM Consensus Params, and the CrossVM bridge joined the testnet list by 4 November; mainnet has none active.)

On mainnet the module's REST routes (`/qorechain/crossvm/v1/...`) are not served by the public gateway (`501`); read messages with the CLI or a gRPC/ABCI query client.
:::

:::note
The endpoints below default to a local node. On mainnet, use the **`qorechain-vladi`** RPC endpoints (Cosmos RPC **26657**, EVM JSON-RPC **8545**); the testnet is **`qorechain-diana`**.
:::

---

## Architecture Overview

```
 EVM (Solidity)     QoreChain Native (Rust/Wasm)     SVM (BPF)
      |                        |                        |
      |--- sync (precompile) ->|                        |
      |                        |                        |
      |<-- async (EndBlocker) -|-- async (EndBlocker) ->|
      |                        |                        |
      |<------------ async (EndBlocker) ----------------|
```

| Path             | Direction       | Timing           | Mechanism                       |
| ---------------- | --------------- | ---------------- | ------------------------------- |
| **Synchronous**  | EVM to QoreChain Native | Same transaction | Precompile at `0x0000...0901` (active on the testnet, not on mainnet; see below) |
| **Message, default** | Any VM to any other VM | Same transaction | `MsgCrossVMCall`; the call executes immediately and a failure reverts the whole transaction |
| **Message, queued**  | Any VM to any other VM | Next block (or later) | `MsgCrossVMCall` with `async` set; the message waits in the queue |

---

## Synchronous Path (EVM to QoreChain Native) {#synchronous-path-evm-to-qorechain-native}

The synchronous path uses an EVM **precompile** at address `0x0000000000000000000000000000000000000901`. It is designed to let Solidity contracts call QoreChain Native contracts and receive a response within the same transaction.

:::warning Not active on mainnet; active on the testnet with an allowlist
The CrossVM bridge precompile is **not active** on `qorechain-vladi`: a call to `0x…0901` there succeeds and returns empty data. On `qorechain-diana` the `active_static_precompiles` list holds `0x…0901` (read 7 November 2026); a read-only `eth_call` through it was run on 7 November 2026, after the v3.2.7 upgrade (results below). The v3.2.3 binary carries a hardened version (it refuses a `STATICCALL`, meters its nested call against the calling frame's gas and journals it so an EVM revert also undoes the QoreChain Native side, reaches only allowlisted QoreChain Native targets, and honours the cross-VM circuit breaker), but it only runs where a governance-approved proposal has added it to the active list (the testnet so far, not mainnet). On mainnet the precompile and cross-VM calls stay off, even after a v3.2.7 upgrade (which has no date yet), until a separate governance decision. The example below is the layout the node decodes; it cannot run on mainnet until the precompile is active. On the testnet it can be called, within the allowlist (next section). See [EVM Precompiles: Network status](/developer-guide/evm-precompiles#network-status).
:::

### Solidity Example

The node decodes the precompile's input as a 4-byte selector followed by the ABI-encoded arguments of `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)` (selector `0x3c11078c`). `targetVM` is `1` for a QoreChain Native contract (QoreChain Native is the CosmWasm runtime; `0` is the EVM, which the hardened bridge refuses as a target). `targetContract` is the contract's bech32 address as a string, and `payload` is the contract's execute message as UTF-8 JSON bytes. The precompile returns the target's raw response bytes.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CrossVMCaller {
    address constant CROSSVM = 0x0000000000000000000000000000000000000901;
    uint8 constant TARGET_QORECHAIN_NATIVE = 1;

    function callQoreChainNative(string calldata contractAddr, bytes calldata executeMsg)
        external
        returns (bytes memory)
    {
        bytes memory data = abi.encodeWithSignature(
            "executeCrossVMCall(uint8,string,bytes)",
            TARGET_QORECHAIN_NATIVE,
            contractAddr,
            executeMsg
        );
        (bool ok, bytes memory ret) = CROSSVM.call(data);
        require(ok, "cross-VM call failed");
        // While the precompile is not active, the call succeeds with empty data
        // and nothing executes; treat an empty reply as a failure.
        require(ret.length > 0, "cross-VM precompile not active or empty reply");
        return ret;
    }
}
```

This is the layout the node decodes; it is the same layout the `@qorechain/rdk` encoder builds, and the contract above matches the starter in [Multi-VM](/rollups/multi-vm). Funds cannot be attached through the precompile (the `MsgCrossVMCall` message path takes `--funds`). The sample cannot do anything on mainnet today, because the precompile is not active there. On the testnet it works within the allowlist described next; the sample contract itself was not deployed for this page, the call below was made directly with `eth_call`.

Where the precompile is active, it executes the QoreChain Native contract immediately and returns the result. (The `@qorechain/rdk` helper `encodeCrossVmCalldata`, available from 0.6.0 and in the current 0.8.0, builds the calldata; see [Multi-VM](/rollups/multi-vm).) Gas cost: **50,000 base + 4 per input byte + execution cost**.

### Testnet behaviour (allowlist, checked 7 November 2026) {#testnet-allowlist}

On `qorechain-diana` (node release v3.2.7 since 6 November 2026) the precompile reaches only QoreChain Native contracts on the bridge allowlist. `GET /qorechain/crossvm/v1/params` lists them in `bridge_allowed_targets` (three entries on 7 November 2026, written `cosmwasm:qor1...`), next to `enabled` `true`, `max_message_size` 65536, `max_queue_size` 1000 and `queue_timeout_blocks` 100. Two read-only `eth_call` requests to `0x…0901` with `executeCrossVMCall(1, target, 0x7b7d)` were run on 7 November 2026:

* **Target outside the allowlist:** reverts with `cross-VM bridge call refused: target cosmwasm:qor1... is not allowlisted`.
* **Target on the allowlist:** the call reaches the contract (the node reports the contract's own error for the empty `{}` message: `Error parsing into type cw20::msg::Cw20ExecuteMsg`). That shows the route works; no state-changing cross-VM transaction through the precompile was sent for this page.

On mainnet the precompile (`0x…0901`) and cross-VM calls stay **off** (circuit breaker) even after the v3.2.7 upgrade, until a separate governance decision.

### What v3.2.7 changes for cross-VM calls (testnet only for now) {#v327}

These apply on the testnet since 6 November 2026 and are **not on mainnet yet** (the upgrade has no date):

* A call that fails in the target VM now fails cleanly: it is that call's failure and the queue goes on with the next message.
* Malformed targets are refused at submit time with code 5 in codespace `crossvm`.
* A cross-VM call can no longer target an EVM precompile address.

---

## Message Path (`MsgCrossVMCall`)

Other cross-VM calls use the `MsgCrossVMCall` transaction. The chain works out the source lane from the sender, so the message carries only the target VM, the target contract, the payload and optional funds. By default the call executes immediately within the transaction, and the whole transaction reverts if the target fails. With the `async` flag the message is queued instead and handled by the module's end-block queue pass in a later block (see the lifecycle below). As noted above, this message is switched off on mainnet.

### CLI

`tx crossvm call` takes the target VM (`evm`, `cosmwasm` or `svm`) and the target contract as positional arguments, with the payload as hex. The CLI does not ask for the source VM: the chain derives the caller's lane from state and ignores the declared field (the CLI fills in a placeholder so the message passes its own validation):

```bash
qorechaind tx crossvm call evm 0x1234567890123456789012345678901234567890 \
  --payload 0a0b0c --from mykey --generate-only > tx.json
```

Other flags: `--funds <coins>` (QoreChain Native targets only) and `--async` to queue the call instead of executing it now. Sign and broadcast `tx.json` with `tx pqc cosign` (see [Post-Quantum Signing](/developer-guide/post-quantum-signing)); the fee floor is 0.1 uqor per gas. A call into the caller's own lane is refused (since v3.2.3).

:::caution Disabled on mainnet
`MsgCrossVMCall` is switched off on mainnet by the circuit breaker, so the command cannot succeed there today. (Release binaries before v3.2.3 also built a message that failed its own validation because the source VM was empty; the v3.2.3 binary fixes that.) On the testnet the message is enabled, but the SVM lane is disabled, so an SVM target cannot be reached; an EVM target, and a QoreChain Native target once a contract has been instantiated there, can.
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

Since v3.2.3 a queued call that fails is rolled back as a whole: only its `Failed` record remains, and the funds attached to a failed QoreChain Native call are no longer moved into the contract. While the module is disabled, or `MsgCrossVMCall` is switched off by the circuit breaker, the queue is **not executed**: queued messages stay pending and expire at their timeout unless the switch is lifted first.

### Async calls into CosmWasm (v3.2.8) {#async-calls}

From release v3.2.8 (testnet only until a later mainnet upgrade) an asynchronous call into CosmWasm is prepaid and queued with limits:

| `MsgCrossVMCall` field | Meaning |
| ---------------------- | ------- |
| `async_gas_limit` (8)  | Contract gas units you reserve for the queued call (default 500,000) |
| `async_max_factor` (9) | The highest congestion factor you accept for it (default 4x); the call is refused if the factor in force is above it |

- **Escrow.** The sender prepays gas units x factor x gas price into an escrow account. At the defaults that is 500,000 x 4 x 0.1 uqor, about 0.2 QOR. What the call does not use is refunded when it runs.
- **Queue-slot fee.** Queueing a call also pays a small slot fee.
- **At most 100 pending calls per sender.** A further call is refused until one finishes or times out.
- **Failed calls are charged.** A call that fails still pays for the work done.
- **Heavy calls:** raise `async_gas_limit` and `async_max_factor` for contracts that load large code; a cw721-size contract does not fit the defaults on its first call in a block.

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

# List pending messages (from v3.2.8 one page of at most 100; follow the next key for more)
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

**Atomicity:** Synchronous calls (EVM to QoreChain Native via precompile) are designed to be atomic, so that if either side reverts the entire transaction reverts. The hardened precompile journals the nested call, so a revert in the calling contract also undoes the QoreChain Native side; it is active on the testnet only. Asynchronous calls are **not atomic** across blocks; design your contracts to handle the `Failed` and `Timed Out` states gracefully.

**Ordering:** Messages in the queue are processed FIFO within each EndBlocker pass. There is no guaranteed ordering across different source VMs.

**Payload encoding:** The payload format depends on the target VM:

* **EVM targets:** ABI-encoded function calls
* **QoreChain Native targets:** JSON-encoded execute messages
* **SVM targets:** Hex-encoded BPF instruction data

---

## Next Steps

* [EVM Precompiles](/developer-guide/evm-precompiles) — Status of the synchronous CrossVM precompile and the other planned precompiles
* [EVM Development](/developer-guide/evm-development) — Solidity development on QoreChain
* [QoreChain Native Development](/developer-guide/cosmwasm-development) — Rust/Wasm contract development
* [SVM Development](/developer-guide/svm-development) — BPF program deployment
