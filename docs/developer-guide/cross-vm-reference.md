---
slug: /developer-guide/cross-vm-reference
title: Cross-VM Calls Reference (v3.2.8)
sidebar_label: Cross-VM Reference
sidebar_position: 9
---

# Cross-VM Calls Reference (v3.2.8)

A cross-VM call lets code on one virtual machine run a contract on another: an account or QoreChain Native contract calling an EVM contract, an account calling a QoreChain Native (CosmWasm) contract, a Solidity contract calling a QoreChain Native contract, and so on. There are two ways to make one. A **synchronous** call runs inside your own transaction and hands the answer back at once. An **asynchronous** call is put in a queue and runs in a later block.

This page is the field, cost and limit reference for release v3.2.8, with a worked example for each direction. The concepts, the lifecycle and the older behaviour are in [Cross-VM Interoperability](/developer-guide/cross-vm-interoperability); the SDK walkthrough is in the [Cross-VM guide](/sdk/guides/cross-vm).

:::note Where v3.2.8 runs
The **`qorechain-diana`** testnet has run **v3.2.8** since 12 November 2026. The **`qorechain-vladi`** mainnet has not applied it yet, and on mainnet `MsgCrossVMCall` is switched off. Everything marked "v3.2.8" below is testnet behaviour for now.
:::

:::caution Is the call message available right now?
On the testnet `MsgCrossVMCall` was paused, and governance proposal 37 lifts the pause. Whether the call is available at a given moment is shown by two things: the module parameters (`enabled`) and the circuit breaker list. Check both before you build anything on it:

```bash
# Module parameters: look for "enabled": true
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params

# Circuit breaker list: the call is paused while this contains /qorechain.crossvm.v1.MsgCrossVMCall
curl -s https://api-testnet.qore.host/cosmos/circuit/v1/disable_list
```

The list route is spelled `disable_list` over REST (the `disabled_list` spelling answers `501`). The command line equivalent on a node is `qorechaind query circuit disabled-list`. When the call is paused, a transaction that carries it is refused, and queued calls stay pending until they time out unless the pause is lifted first. When the list was read for this page (12 November 2026) it still held `/qorechain.crossvm.v1.MsgCrossVMCall`, so the examples below could not be sent and were not.
:::

## Why it matters {#why}

- **The cost is predictable.** A queued call into QoreChain Native shows its price up front: you choose how much contract work it may use and the highest congestion factor you accept, the money is held in escrow, and what the call does not use comes back to you.
- **One account cannot crowd out others.** A sender may have at most 100 queued calls at a time, so the shared queue stays usable.
- **A failing call is never free.** A call that fails still pays for the work it did, in every direction, so catching a failure and trying again on the same gas does not work.
- **The EVM side stays inside your window.** A call into the EVM that you did not sign yourself, and the EVM bridge at `0x0901`, are admitted only by an open [EVM authorisation window](/developer-guide/evm-window-reference).

## Synchronous and asynchronous calls {#sync-async}

| | Synchronous (default) | Asynchronous (`async = true`) |
| --- | --- | --- |
| When it runs | Inside your transaction | At the end of a later block, from the queue |
| Gas | Your transaction's own gas | A set prepaid budget (see [Cost](#cost)) |
| Answer | Returned in the transaction response, field `data` | Not returned; read the finished message by id |
| If the target fails | The whole transaction is undone | Only that call is recorded as `failed`; your transaction stays |
| Funds | `funds` may be attached for a QoreChain Native target | Same; an async call with funds into a lane that cannot carry them is refused at submission |
| Best for | Anything that needs the result now | Fire-and-forget work, and calls whose gas you want to cap |

A queued message moves through `pending`, then `executed`, `failed` or `timed_out`. It times out after `queue_timeout_blocks` (100 on the testnet). The queue runs oldest first, and the end-of-block pass runs at most 50 calls per block.

## MsgCrossVMCall fields {#fields}

Type URL `/qorechain.crossvm.v1.MsgCrossVMCall`.

| Field | Number | Meaning |
| ----- | ------ | ------- |
| `sender` | 1 | Your `qor1...` address. It signs the message. |
| `source_vm` | 2 | Ignored by the chain. The chain works out where the call comes from. Still sent so older nodes accept the message. |
| `target_vm` | 3 | `evm`, `cosmwasm` or `svm`. A call into your own lane is refused. The SVM lane is disabled for transactions on both networks. |
| `target_contract` | 4 | An EVM address (`0x` and 40 hex digits, not a precompile address) or a `qor1...` contract address. |
| `payload` | 5 | The call data: ABI-encoded for the EVM, the JSON execute message as UTF-8 for QoreChain Native. At most `max_message_size` bytes (65,536). |
| `funds` | 6 | Coins to attach (QoreChain Native targets only). |
| `async` | 7 | `true` queues the call; `false` (default) runs it now. |
| `async_gas_limit` | 8 | v3.2.8, async into QoreChain Native only: the contract gas units the queued call runs on. `0` or unset means 500,000. Allowed from 250,000 up to what the queue can run in one block (1,875,000 at the default budget). |
| `async_max_factor` | 9 | v3.2.8, async into QoreChain Native only: the highest congestion factor you will pay, in millionths (`4000000` is 4x). `0` or unset means four times the factor at submission, capped at the chain maximum. A value below the factor in force is refused at submission. |

On the command line the two new fields are `--async-gas-limit` (a whole number) and `--async-max-factor` (a decimal such as `2.5`).

## Cost, escrow and refunds {#cost}

For an **async call into QoreChain Native** (v3.2.8):

1. **Escrow.** The prepay is units times factor times the gas price, and it is held, not spent. With the defaults that is 500,000 units x 4 x 0.1 uqor = 200,000 uqor, which is **0.2 QOR**. It moves from your balance to the `crossvm_async_escrow` account. You need that much spendable uqor: locked vesting coins, fee grants and fees paid in other tokens cannot fund it, and such a call is refused.
2. **Queue-slot fee.** Every async call also pays a slot fee as gas at submission: 500,000 gas into an empty queue, rising with how full the queue is to 2,000,000 gas into a full one. At the 0.1 uqor per gas price that is 0.05 QOR up to 0.2 QOR.
3. **Settlement.** When the call finishes, the gas it used at the factor then in force is paid out of the escrow as a fee, and the rest returns to you. A call that fails pays what it used. A call that times out, or is never run, gets its whole escrow back, and its slot fee is the processing fee. The `crossvm_escrow_settled` event carries the fee and the refund.
4. **Waiting for the factor.** The call runs while the congestion factor is at or below your `async_max_factor`. If the factor is higher it waits, and times out if it stays high. With the default (four times the factor at submission) the factor must more than quadruple before the call waits.
5. **Limits on size.** The prepay may not exceed 50,000,000 gas. Above that the call is refused at submission: retry later or lower `async_gas_limit`.

For an **async call into the EVM** the prepaid budget is 1,000,000 gas, charged at submission. For a **synchronous** call the cost is the transaction's own gas. Heavy QoreChain Native contracts that load large code need a higher `async_gas_limit` and `async_max_factor` than the defaults on their first call in a block.

### Failed calls are charged {#failed-charged}

A cross-VM call that fails still pays for the work it did. An EVM call that reverts or runs out of gas uses the EVM gas it consumed from the caller, and a QoreChain Native call made through the `0x0901` bridge that fails uses the gas the contract spent from the calling EVM frame. A contract that wants to survive an expensive failing callee should set a gas limit on the sub-call instead of retrying on the same remaining gas.

## The pending queue {#pending}

- **At most 100 pending calls per sender** (`max_pending_per_sender`). A further async call is refused with `ErrQueueFull` (codespace `crossvm`, code 4) until one of yours has run or timed out. Synchronous calls are not affected.
- **The whole queue holds at most `max_queue_size`** calls (1,000).
- **The pending list is paginated.** Each page holds at most 100 messages, and each payload in the list is cut to its first **1,024 bytes** (`payload_hex`). To read a full payload, fetch the message by id.

```bash
# One page of pending calls (use the next key from the response for the next page)
curl -s "https://api-testnet.qore.host/qorechain/crossvm/v1/pending?pagination.limit=100"

# A message by id, with its whole payload
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/message/<id>
```

Checked on the testnet on 12 November 2026: the pending route answered `200` with `{"messages":[],"count":0,"pagination":{"next_key":null,"total":"0"}}` (queue empty), and the message route answered `200` with `{"message":null,"found":false}` for an id that does not exist. The same reads on the Linux node CLI:

```bash
qorechaind query crossvm pending
qorechaind query crossvm message <id>
```

:::note Node CLI
`qorechaind` is the Linux node CLI. There is no packaged macOS binary. The REST calls work from any machine.
:::

## Module parameters {#params}

```bash
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params
```

Answered `200` on 12 November 2026 with these fields:

| Field | Value read | Meaning |
| ----- | ---------- | ------- |
| `enabled` | `true` | Module switch. The call message has its own entry on the circuit breaker list. |
| `max_message_size` | `65536` | Largest payload in bytes. |
| `max_queue_size` | `1000` | Most calls queued at once. |
| `queue_timeout_blocks` | `100` | Blocks before an unrun call times out. |
| `bridge_allowed_targets` | three `cosmwasm:qor1...` entries | The QoreChain Native contracts the `0x0901` bridge may call. Empty keeps the bridge shut. |
| `bridge_target_pins` | one entry per target: `target`, `code_id`, `history_len` | The code each allowed target must still run for the bridge to call it. |
| `max_pending_per_sender` | `100` | Queued calls one sender may hold. |
| `max_cosmos_tx_gas` | `"50000000"` | Most gas one Native transaction may declare. |
| `record_retention_blocks` | `"100000"` | How long the record of a finished queued call is kept. |
| `max_block_wasm_gas` | `"3000000"` | QoreChain Native execution one block may use. |
| `max_tx_wasm_share_bps` | `5000` | Share of that budget one transaction may use. |
| `max_block_level_wasm_gas` | `"10000000"` | Budget for contract work done outside transactions. |
| `queue_wasm_reserve_bps` | `2500` | Share of the block budget reserved for the queue. |
| `wasm_congestion_max_factor` | `20` | Highest the congestion factor can reach. |
| `wasm_congestion_target_bps` | `5000` | Usage share above which the factor rises. |
| `wasm_congestion_factor_micro` | `"1000000"` | The factor in force now, in millionths (`1000000` is 1x). |
| `max_block_upload_bps` | `5000` | Share of the budget code uploads may use. |
| `max_queue_timeouts_per_block` | `100` | Calls timed out per block. |

Use `wasm_congestion_factor_micro` to see what a queued call will prepay right now: units x factor x 0.1 uqor.

## Examples by direction {#examples}

All examples sign with the account's post-quantum key as every Native transaction does; see [Post-Quantum Signing](/developer-guide/post-quantum-signing). None of the examples below was sent for this page, because the call message was paused when it was written (see the box at the top).

### Native account to EVM contract {#native-to-evm}

The target is an EVM contract; the payload is ABI-encoded call data. The call runs as your own `0x` address, so the EVM side sees you as `msg.sender`. Command line (Linux node CLI), build then add the post-quantum signature:

```bash
qorechaind tx crossvm call evm 0x1234567890123456789012345678901234567890 \
  --payload <hex of abi.encode(selector, args)> \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > call.json

qorechaind tx pqc cosign call.json --from mykey --pqc-key mykey-mldsa \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

TypeScript with the published SDK (0.13.0). The helper ABI-encodes the call with viem:

```ts
import { createClient, createCrossVMClient } from "@qorechain/sdk";

const client = createClient({ network: "testnet" });
const tx = await client.connectTx(signer, { pqcKeypair }); // hybrid signing
const xvm = createCrossVMClient(tx);

const { messageId, executed, data } = await xvm.call({
  targetVm: "evm",
  targetContract: "0xYourErc20",
  evm: { abi: erc20Abi, functionName: "transfer", args: ["0xRecipient", 1n] },
});
```

Python, Go, Rust and Java take the payload as raw bytes for the EVM (the high-level ABI encoding is TypeScript only). Python:

```python
client.call(target_vm="evm", target_contract="0xYourErc20", payload=calldata_bytes)
```

Go:

```go
res, err := c.Call(crossvm.CallOptions{
    TargetVM:       crossvm.VMTypeEVM,
    TargetContract: "0xYourErc20",
    Payload:        calldata,
})
```

Rust:

```rust
let opts = CallOptions::new(VM_TYPE_EVM, "0xYourErc20", calldata_bytes);
let resp = cross_vm.call_with_responses(&opts).await?;
```

Java:

```java
CrossVMClient.CallOptions o = new CrossVMClient.CallOptions();
o.targetVm = CrossVMClient.VMType.EVM;
o.targetContract = "0xYourErc20";
o.payload = calldata;
client.call(o);
```

If the sender is not the account that signed the transaction, for example an authz grantee, the EVM side runs under the granter's window; see [Authz and windows](#authz).

### Native account to QoreChain Native contract {#native-to-wasm}

The payload is the contract's JSON execute message. A synchronous call returns the contract's answer in `data`:

```bash
qorechaind tx crossvm call cosmwasm qor1...contract \
  --payload $(printf '%s' '{"transfer":{"recipient":"qor1...","amount":"1"}}' | xxd -p -c 0) \
  --funds 100uqor \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 600000 --fees 60000uqor --generate-only > call.json
```

Queued, with an explicit gas allowance and factor ceiling (v3.2.8). The escrow is 800,000 x 2.5 x 0.1 uqor = 200,000 uqor (0.2 QOR) if the factor is 1:

```bash
qorechaind tx crossvm call cosmwasm qor1...contract \
  --payload <hex of the execute message> --async \
  --async-gas-limit 800000 --async-max-factor 2.5 \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > call.json
```

TypeScript with SDK 0.13.0 (synchronous, and queued with the default allowance):

```ts
const sync = await xvm.call({
  targetVm: "cosmwasm",
  targetContract: "qor1...contract",
  cosmwasm: { transfer: { recipient: "qor1...", amount: "1" } },
});

const queued = await xvm.call({
  targetVm: "cosmwasm",
  targetContract: "qor1...contract",
  cosmwasm: { transfer: { recipient: "qor1...", amount: "1" } },
  async: true, // default allowance: 500,000 units, 4x factor
});
```

Python (`async_=True`), Go (`Async: true`), Rust (`.queue(true)`) and Java (`o.async = true`) queue the same way:

```python
client.call(target_vm="cosmwasm", target_contract="qor1...contract",
            cosmwasm={"transfer": {"recipient": "qor1...", "amount": "1"}}, async_=True)
```

:::note SDK support for the two new fields
The published SDK (0.13.0) has no option for `async_gas_limit` or `async_max_factor`, so its queued calls use the defaults. A later SDK release adds them; use the command line or the raw message until then.
:::

### EVM contract to QoreChain Native contract through 0x0901 {#evm-to-wasm}

A Solidity contract calls the bridge precompile at `0x0000000000000000000000000000000000000901`. The call runs inside the EVM transaction, with the calling account or contract (as its `qor1` address) as the QoreChain Native sender, and a revert anywhere undoes both sides.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CrossVMCaller {
    address constant CROSSVM = 0x0000000000000000000000000000000000000901;

    function callNative(string calldata contractAddr, bytes calldata executeMsg)
        external returns (bytes memory)
    {
        // targetVM 1 is QoreChain Native; executeMsg is the JSON execute message
        (bool ok, bytes memory ret) = CROSSVM.call(
            abi.encodeWithSignature(
                "executeCrossVMCall(uint8,string,bytes)", 1, contractAddr, executeMsg
            )
        );
        require(ok, "cross-VM call failed");
        return ret;
    }
}
```

Rules for the bridge:

- Plain `CALL` only, no value, selector `0x3c11078c`. `STATICCALL`, `DELEGATECALL` and target VM `0` or `2` revert.
- The target must be in `bridge_allowed_targets` (and, from v3.2.8, still run the code it is pinned to). Read both with the params route above.
- **The caller needs a window that lists `0x0901`.** Any account sending a transaction to the bridge must have an open [EVM authorisation window](/developer-guide/evm-window-reference) whose `allowed_targets` includes `0x0000000000000000000000000000000000000901` (and the contract that calls it, if you call through one). Open one like this, with a bound that fits your session:

```bash
qorechaind tx pqc open-evm-window 600 5 10qor \
  --allowed-targets 0x0000000000000000000000000000000000000901 \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 80000uqor --generate-only > window.json
```

- A failed call reverts with an `Error(string)` reason and is charged for the gas the contract used.

The `@qorechain/rdk` helper `encodeCrossVmCalldata({ contract, msg })` builds the same call data in TypeScript (see [Multi-VM](/rollups/multi-vm)). With the published SDK the precompile address is `PRECOMPILE_ADDRESSES.crossVmBridge` from `@qorechain/evm`.

### QoreChain Native contract to EVM contract {#wasm-to-evm}

A QoreChain Native contract makes the call by dispatching a `MsgCrossVMCall` as a chain message, with itself as the sender. The message has the same fields as above; the chain treats the contract as a CosmWasm caller whatever `source_vm` says:

```json
{
  "@type": "/qorechain.crossvm.v1.MsgCrossVMCall",
  "sender": "qor1...the contract...",
  "source_vm": "cosmwasm",
  "target_vm": "evm",
  "target_contract": "0x1234567890123456789012345678901234567890",
  "payload": "<base64 of the ABI-encoded call>",
  "async": true
}
```

Things to know before relying on it:

- The EVM sees the contract as the **last 20 bytes** of its 32-byte address. Make sure the EVM contract does not depend on `msg.sender` being a normal account.
- From v3.2.8 a call that would leave that caller holding more native QOR than it started with fails (and is charged). EVM contracts meant for this direction should pay an ERC-20 token, or a 20-byte account named in the call, not native QOR to `msg.sender`.
- A contract acting as itself is not bounded by an EVM window. A call dispatched under an authz grant from an account is; see below.
- Below the `0x0901` bridge, a `MsgCrossVMCall` is accepted only from a contract acting as itself, and an authz `MsgExec` there cannot carry one for another account.

The contract-side Rust code that dispatches this message was not run for this page.

## Authz and windows {#authz}

A cross-VM call into the EVM that the sender did not send itself runs under the **sender's** EVM window, exactly as if the sender's own code were acting in someone else's transaction. In practice this is an authz grant being used. When someone uses your grant of `MsgCrossVMCall` to call the EVM:

- The call is admitted only if **your** window is open and its scope admits the target (`allowed_targets`, `native_only`, the value-moving precompiles).
- Each successful call uses one of the window's transactions, and native value you lose in it is counted against the window's value.
- Without a usable post-quantum key and a live window, the call is refused, at submission for an async call and again when the queue runs it.
- A contract or group policy holds no window, so an authz grant from one cannot carry a call into the EVM.
- Calls into QoreChain Native are not bounded by the window. A generic authz grant of `MsgCrossVMCall` gives the grantee your identity on the QoreChain Native lane: grant it only to parties you trust with the account.

A conversion of an ERC-20 token under an authz grant (`MsgConvertERC20`) is admitted by the sender's window in the same way.

## Limits and errors {#limits}

| Situation | Result |
| --------- | ------ |
| Payload larger than `max_message_size` | Refused, code 8 (`message payload exceeds max size`) |
| Target address of the wrong shape for its lane | Refused at submission, code 5 (`invalid target contract address`) |
| Target is a precompile address (`0x...0000` to `0x...ffff`) | Refused at submission, code 5 |
| Target VM equal to your own lane | Refused |
| Unknown or unsupported VM | Code 7 (`unsupported VM type`) |
| More than 100 queued calls from one sender | `ErrQueueFull`, code 4, until one finishes or times out |
| Queue holds `max_queue_size` calls | `ErrQueueFull`, code 4 |
| `async_max_factor` below the factor in force | Refused at submission |
| `async_gas_limit` below 250,000 or above the queue's per-block room | Refused at submission |
| Prepay above 50,000,000 gas | Refused at submission; retry later or lower the limit |
| Spendable uqor lower than the escrow | Refused (vesting-locked coins, fee grants and other-token fees cannot fund it) |
| Congestion factor above `async_max_factor` when the call comes up | The call waits; it times out after `queue_timeout_blocks` |
| Call times out or is never run | Escrow refunded in full, slot fee kept as the processing fee |
| Target fails | `failed` record (async) or the transaction is undone (sync); gas used is charged |
| Native QOR returned to a contract caller (32-byte sender) from the EVM | The call fails and is charged |
| `0x0901` call without a window that lists it | Refused |
| `0x0901` target not in `bridge_allowed_targets`, or code changed since it was pinned | Reverts: `cross-VM bridge call refused: target ... is not allowlisted` for an unlisted target |
| `MsgCrossVMCall` on the circuit breaker list | Transaction refused; queued calls stay pending |
| A call into the SVM | Not possible today: the SVM lane is disabled for transactions on both networks |

An error recorded on a failed queued call carries plain text without a source-file annotation.

## Events {#events}

| Event | Attributes | Meaning |
| ----- | ---------- | ------- |
| `crossvm_request` | `message_id`, `source_vm`, `target_vm`, `target_contract`, `sender` | A call was submitted |
| `crossvm_response` | `message_id`, `status`, and `error` for a failed call | A queued call finished |
| `crossvm_timeout` | `message_id` | A queued call timed out |
| `crossvm_escrow_settled` | fee and refund | The escrow of an async call into QoreChain Native was paid out |

## Related pages {#related}

- [Cross-VM Interoperability](/developer-guide/cross-vm-interoperability) for the concepts, lifecycle and testnet allowlist notes.
- [EVM Authorisation Window Reference](/developer-guide/evm-window-reference) for opening and scoping the window the bridge needs.
- [EVM Precompiles](/developer-guide/evm-precompiles) for the precompile table and network status.
- [QoreChain Native Development](/developer-guide/cosmwasm-development) and [QoreChain Native Gas and Limits](/developer-guide/cosmwasm-gas-and-limits) for contract gas and the block budget.
- [Post-Quantum Signing](/developer-guide/post-quantum-signing) for signing the transactions above.
- [Cross-VM guide (SDK)](/sdk/guides/cross-vm) and [Multi-VM rollups](/rollups/multi-vm) for the SDK and RDK helpers.
