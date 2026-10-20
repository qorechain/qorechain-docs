---
slug: /rollups/multi-vm
title: Multi-VM (cross-VM calls)
sidebar_label: Multi-VM
sidebar_position: 8
---

# Multi-VM (cross-VM calls)

The RDK includes TypeScript helpers that encode a call from an EVM contract into the **cross-VM precompile** at `0x0000000000000000000000000000000000000901`, which is designed to route it to a CosmWasm contract on the **QoreChain Native** (Wasm) runtime, and a `multivm-rollup` scaffold template that wires them up. The tooling covers **EVM → QoreChain Native** only; SVM is a separate runtime and is not part of the precompile.

:::caution Not usable on the live networks yet
The cross-VM precompile is **not activated** on either network: the EVM module's list of active static precompiles is empty on mainnet and testnet, `eth_getCode` for `0x…0901` returns `0x`, and a call to it succeeds with empty data and executes nothing. CosmWasm contract upload is also closed on both networks, and the SVM transaction lane is disabled network-wide. Until the precompile is activated and CosmWasm uploads are re-opened, there is nothing to call. This page documents the tooling so you can prepare; do not build production flows on it. See [EVM Precompiles: Network status](/developer-guide/evm-precompiles#network-status).
:::

:::caution The 0.5.0 encoder does not match the chain's layout
`encodeCrossVmCalldata` in `@qorechain/rdk` 0.5.0 (and the `CrossVmCaller.sol` starter in the `multivm-rollup` template) use the function `executeCrossVMCall(string,bytes)`. The node decodes `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)` (4-byte selector, then the ABI-encoded arguments; `targetVM` 1 is CosmWasm, the only supported target), and the ABI may still change before activation. Calldata from the helper therefore does not decode on the node even once the precompile exists. The sections below show the node's layout.
:::

:::note
As of RDK v0.4.2 the Wasm runtime's VM option identifier is **`native`** (QoreChain Native); `cosmwasm` remains an accepted legacy alias, and both map to `cosmwasm` on the wire.
:::

## The precompile address

```ts
import { CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

console.log(CROSS_VM_PRECOMPILE); // 0x0000000000000000000000000000000000000901
```

## Encoding a cross-VM call

Encode the node's layout directly. `payload` is the contract's execute message as UTF-8 JSON bytes (shown with viem):

```ts
import { encodeFunctionData, parseAbi, toHex } from "viem";

const abi = parseAbi([
  "function executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)",
]);

const calldata = encodeFunctionData({
  abi,
  functionName: "executeCrossVMCall",
  args: [
    1, // CosmWasm
    "qor1cosmwasmcontractaddress...",
    toHex(new TextEncoder().encode(JSON.stringify({ transfer: { recipient: "qor1...", amount: "100" } }))),
  ],
});
```

`encodeCrossVmCalldata({ contract, msg })` from `@qorechain/rdk` builds the `(string,bytes)` form instead, which the node does not read (see the caution above).

## The Solidity side

From an EVM contract you call the precompile address with the encoded call:

```solidity
address constant CROSS_VM_PRECOMPILE = 0x0000000000000000000000000000000000000901;

function callCosmWasm(string calldata contractAddr, bytes calldata msg_)
    external returns (bytes memory)
{
    bytes memory data = abi.encodeWithSignature(
        "executeCrossVMCall(uint8,string,bytes)", uint8(1), contractAddr, msg_
    );
    (bool ok, bytes memory ret) = CROSS_VM_PRECOMPILE.call(data);
    require(ok, "cross-VM call failed");
    return ret;
}
```

Because the precompile is inactive, a plain `.call` to it returns **success with empty data and does nothing**; the `ok` flag does not tell you the call took effect. If you test this today, confirm the effect on the target contract.

## Scaffold a multi-VM rollup

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

The template includes a `contracts/CrossVmCaller.sol` starting point; compare it with the node's layout above before relying on it. See [Deploying a Rollup](/rollups/deploying-a-rollup) for all scaffolder templates.
