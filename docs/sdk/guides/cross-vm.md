---
slug: /sdk/guides/cross-vm
title: Cross-VM Guide
sidebar_label: Cross-VM
sidebar_position: 4
---

# Cross-VM guide

QoreChain runs **EVM, SVM, and QoreChain Native side by side**, and the `x/crossvm`
module lets a single native account invoke a contract on any of them. The SDK
provides a high-level `createCrossVMClient` helper to build, sign, and broadcast
these calls — including packing several into **one atomic transaction across all
three VMs** — plus typed read helpers to track message state. EVM→native routing
initiated *from inside the EVM* still runs on-chain via the **cross-VM bridge
precompile** in `@qorechain/evm`.

:::caution What works today
Cross-VM calls are only as available as their target lane:

- `MsgCrossVMCall` is switched off by the chain's circuit breaker on **mainnet**
  (`GET /cosmos/circuit/v1/disable_list` lists `/qorechain.crossvm.v1.MsgCrossVMCall`);
  it is enabled on the testnet.
- The SVM transaction lane is disabled network-wide, QoreChain Native upload and
  instantiate are permissioned (and there are no contracts on mainnet), and the EVM
  bridge precompile is not active (see
  [EVM Precompiles](/developer-guide/evm-precompiles#network-status)).
- The typed REST read helpers below call routes the public gateway does not serve.
  Read messages with `connectQueryClients(rpc).crossvm` instead.
- Like every Native-path transaction, a cross-VM call must carry the hybrid
  signature: connect the signing client with the account's keypair
  (`client.connectTx(signer, { pqcKeypair })`, SDK 0.9.0) so the cross-VM client signs
  hybrid (see [Accounts & PQC signing](/sdk/concepts/accounts-pqc#hybrid-signing)).
  Releases before 0.9.0 sign it classically and the public networks refuse it.
:::

## Unified cross-VM calls

`createCrossVMClient` wraps `MsgCrossVMCall` (type URL
`/qorechain.crossvm.v1.MsgCrossVMCall`) so you never hand-build a `{ typeUrl,
value }` or encode a payload yourself. The client's sender is the connected
`TxClient`'s address; `sourceVm` defaults to `"evm"`.

```ts
import { createClient, createCrossVMClient } from "@qorechain/sdk";

const client = createClient({ network: "testnet", endpoints: { rpc, rest } });
const tx = await client.connectTx(signer, { pqcKeypair }); // hybrid-signed (SDK 0.9.0)
const xvm = createCrossVMClient(tx);

// Call an EVM contract from a native account — the payload is ABI-encoded.
const { messageId, result } = await xvm.call({
  sourceVm: "cosmwasm",
  targetVm: "evm",
  targetContract: "0xToken",
  evm: { abi: erc20Abi, functionName: "transfer", args: ["0xRecipient", 1n] },
});
```

`VMType` is one of `"evm" | "cosmwasm" | "svm"` (also exported as the `VM_TYPES`
array).

### Per-VM payload encoding

Pick exactly **one** payload shape per call:

| Shape | Encoding |
|---|---|
| `{ payload: Uint8Array \| Hex }` | raw bytes, passed through unchanged |
| `{ evm: { abi, functionName, args } }` | ABI-encoded with viem's `encodeFunctionData` (selector + args) |
| `{ cosmwasm: object }` | `JSON.stringify` then UTF-8 bytes (the QoreChain Native execute-msg convention) |
| `{ svm: { data: Uint8Array \| Hex } }` | raw bytes (an SVM instruction blob) |

The EVM path lazily imports `viem`, so the optional `viem` peer is only needed
when you actually use an `{ evm: ... }` payload.

### Build-only (offline)

`buildCall` returns the `EncodeObject` without broadcasting — handy for
inspection, batching by hand, or signing elsewhere. (EVM payloads are
ABI-encoded asynchronously, so for those use `call`/`callAtomic`, or pre-encode
and pass `{ payload }`.)

```ts
const msg = xvm.buildCall({
  targetVm: "svm",
  targetContract: "Prog...",
  svm: { data: new Uint8Array([1, 2, 3]) },
});
```

## Atomic triple-VM transactions

`callAtomic` packs multiple `MsgCrossVMCall` messages into **one transaction
body** so they execute atomically under a single signature — the triple-VM
headline. One signature, calls across EVM + SVM + QoreChain Native that all land together
or not at all:

```ts
const { messageIds, result } = await xvm.callAtomic([
  {
    targetVm: "evm",
    targetContract: "0xToken",
    evm: { abi: erc20Abi, functionName: "transfer", args: ["0xRecipient", 2n] },
  },
  { targetVm: "svm", targetContract: "Prog...", svm: { data: instructionBytes } },
  { targetVm: "cosmwasm", targetContract: "qor1c...", cosmwasm: { ping: {} } },
]);
```

## Reading a message back

`getMessage` reads a cross-VM message by id, preferring the typed query client
and falling back to the `qor_getCrossVMMessage` JSON-RPC method (which the public
endpoints do not serve). Give it the typed query client, which reads over the
consensus RPC:

```ts
import { connectQueryClients } from "@qorechain/sdk";

// rpcClient: a connected consensus-RPC client (the CosmJS RPC client type).
const queries = connectQueryClients(rpcClient);
const reader = createCrossVMClient(tx, { query: queries.crossvm });

const msg = await reader.getMessage(messageId);

// Module parameters and the pending queue, over the same typed client:
const params = await queries.crossvm.params();
const pending = await queries.crossvm.pendingMessages();
```

## Reading cross-VM message state

`@qorechain/sdk` exports typed REST wrappers over `x/crossvm`. They call
`/qorechain/crossvm/v1/{message/{id},pending,params}`, which the public gateway
does **not** serve (`Not Implemented` on `api.qore.host` and `api-testnet.qore.host`),
so they throw `QoreHttpError` against the public endpoints. They are for nodes
that expose those routes; on the public networks use `connectQueryClients` above.

```ts
import {
  createClient,
  getCrossVmMessage,
  getPendingCrossVmMessages,
  getCrossVmParams,
} from "@qorechain/sdk";

const client = createClient({
  endpoints: { rest: "https://api-testnet.qore.host" },
});

// A single message by id.
const msg = await getCrossVmMessage(client.rest, messageId);

// All pending messages.
const pending = await getPendingCrossVmMessages(client.rest);

// Module parameters.
const params = await getCrossVmParams(client.rest);
```

These return typed shapes: `CrossVmMessage`, `CrossVmMessageResponse`,
`PendingCrossVmMessagesResponse`, and `CrossVmParamsResponse`.

You can also read a message through the `qor_` JSON-RPC namespace, once nodes
serve it:

> **Not served yet:** no released node build serves the `qor_` JSON-RPC namespace, so this call returns `-32601` (method not found) on every public endpoint today. See [the `qor_` namespace](/api-reference/json-rpc-qor_-namespace).

```ts
const m = await client.qor.getCrossVmMessage(messageId);
```

## The EVM bridge precompile

EVM→native routing executes on-chain through the cross-VM bridge precompile,
exposed in `@qorechain/evm`:

```ts
import { PRECOMPILE_ADDRESSES } from "@qorechain/evm";

console.log(PRECOMPILE_ADDRESSES.crossVmBridge);
// 0x0000000000000000000000000000000000000901
```

> **Not active.** The cross-VM bridge precompile is not active on mainnet or
> testnet and will not be activated in its current form; it is being rebuilt
> first. A call to `0x…0901` today returns empty data and routes nothing. See
> [EVM Precompiles: Network status](/developer-guide/evm-precompiles#network-status).

Once active, a Solidity contract (or viem) calls the precompile at that address
to route a message to the native layer, then tracks its state with the read
helpers above. See the [EVM guide](/sdk/guides/evm) for the full precompile list.
