---
slug: /rollups/multi-vm
title: Multi-VM (cross-VM calls)
sidebar_label: Multi-VM
sidebar_position: 8
---

# Multi-VM (cross-VM calls)

The RDK includes TypeScript helpers that encode a call from an EVM contract into the **cross-VM precompile** at `0x0000000000000000000000000000000000000901`, which is designed to route it to a CosmWasm contract on the **QoreChain Native** (Wasm) runtime, and a `multivm-rollup` scaffold template that wires them up. The tooling covers **EVM → QoreChain Native** only; SVM is a separate runtime and is not part of the precompile.

:::caution Not usable on the live networks yet
The cross-VM precompile is **not activated** on either network: the EVM module's list of active static precompiles is empty on mainnet and testnet, so a call to `0x…0901` returns empty data and executes nothing. CosmWasm contract upload is also closed on both networks, and the SVM transaction lane is disabled network-wide. Until the precompile is activated and CosmWasm uploads are re-opened, there is nothing to call. This page documents the tooling so you can prepare; do not build production flows on it. See [EVM Precompiles: Network status](/developer-guide/evm-precompiles#network-status).
:::

:::note
As of RDK v0.4.2 the Wasm runtime's VM option identifier is **`native`** (QoreChain Native); `cosmwasm` remains an accepted legacy alias, and both map to `cosmwasm` on the wire. The precompile ABI function is `executeCrossVMCall(string,bytes)`.
:::

## The precompile address

```ts
import { CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

console.log(CROSS_VM_PRECOMPILE); // 0x0000000000000000000000000000000000000901
```

## Encoding a cross-VM call

`encodeCrossVmCalldata` builds calldata for `executeCrossVMCall(string contract, bytes msg)`. `msg` is the contract's execute message as a UTF-8 JSON string or raw bytes.

```ts
import { encodeCrossVmCalldata } from "@qorechain/rdk";

const calldata = encodeCrossVmCalldata({
  contract: "qor1cosmwasmcontractaddress...",
  msg: JSON.stringify({ transfer: { recipient: "qor1...", amount: "100" } }),
});
```

## The Solidity side

From an EVM contract you call the precompile address with the encoded call:

```solidity
address constant CROSS_VM_PRECOMPILE = 0x0000000000000000000000000000000000000901;

function callCosmWasm(string calldata contractAddr, bytes calldata msg_)
    external returns (bytes memory)
{
    bytes memory data =
        abi.encodeWithSignature("executeCrossVMCall(string,bytes)", contractAddr, msg_);
    (bool ok, bytes memory ret) = CROSS_VM_PRECOMPILE.call(data);
    require(ok, "cross-VM call failed");
    return ret;
}
```

Because the precompile is inactive, a plain `.call` to it returns success with empty data; check the returned length rather than relying on the `ok` flag alone if you test this today.

## Scaffold a multi-VM rollup

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

The template includes a `contracts/CrossVmCaller.sol` starting point; compare it with the ABI above before relying on it. See [Deploying a Rollup](/rollups/deploying-a-rollup) for all scaffolder templates.
