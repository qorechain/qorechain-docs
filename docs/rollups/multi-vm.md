---
slug: /rollups/multi-vm
title: Multi-VM (cross-VM calls)
sidebar_label: Multi-VM
sidebar_position: 8
---

# Multi-VM (cross-VM calls)

The RDK includes TypeScript helpers that encode a call from an EVM contract into the **cross-VM precompile** at `0x0000000000000000000000000000000000000901`, which is designed to route it to a QoreChain Native contract on the **QoreChain Native** (Wasm) runtime, and a `multivm-rollup` scaffold template that wires them up. The tooling covers **EVM → QoreChain Native** only; SVM is a separate runtime and is not part of the precompile.

:::caution Not usable on the live networks yet
The cross-VM precompile is **not activated** on either network: the EVM module's list of active static precompiles is empty on mainnet, and on the testnet it holds only `0x…0A01`, `0x…0A02` and `0x…0C01` (checked 27 October 2026), so `0x…0901` is on neither list; `eth_getCode` for `0x…0901` returns `0x`, and a call to it succeeds with empty data and executes nothing. QoreChain Native contract upload is also closed on both networks, and the SVM transaction lane is disabled network-wide. Until the precompile is activated and QoreChain Native uploads are re-opened, there is nothing to call. This page documents the tooling so you can prepare; do not build production flows on it. See [EVM Precompiles: Network status](/developer-guide/evm-precompiles#network-status).
:::

:::note The encoder matches the chain's layout since 0.6.0
`encodeCrossVmCalldata` in `@qorechain/rdk` **0.5.0 and earlier** (and the `CrossVmCaller.sol` starter in the `multivm-rollup` template of those releases) used `executeCrossVMCall(string,bytes)`, a different function selector from the one the node decodes, so no call they encoded could have reached the precompile even on a network that had activated it. **0.6.0** encodes `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)` (selector `0x3c11078c`), which is what the node decodes (4-byte selector, then the ABI-encoded arguments; `targetVM` 1 is QoreChain Native, the only supported target), and the helper's calldata round-trips through the chain's own decoder according to the release notes. The ABI may still change before activation.
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
    1, // QoreChain Native
    "qor1cosmwasmcontractaddress...",
    toHex(new TextEncoder().encode(JSON.stringify({ transfer: { recipient: "qor1...", amount: "100" } }))),
  ],
});
```

`encodeCrossVmCalldata` from `@qorechain/rdk` 0.6.0 and later (0.7.0 is current) builds the same calldata for you:

```ts
import {
  CROSS_VM_PRECOMPILE,
  CROSS_VM_TARGET,
  encodeCrossVmCalldata,
  isCrossVmPrecompileActive,
} from "@qorechain/rdk";

// Ask the node first: today this answers `active: false` on both networks.
const status = await isCrossVmPrecompileActive("https://api.qore.host");
console.log(status.active, status.reason);

const calldata = encodeCrossVmCalldata({
  contract: "qor1cosmwasmcontractaddress...",
  msg: JSON.stringify({ increment: {} }),
  targetVm: CROSS_VM_TARGET.NATIVE, // 1 = QoreChain Native (CosmWasm); the default
});
// An EVM transaction to CROSS_VM_PRECOMPILE with `data: calldata`.
```

`isCrossVmPrecompileActive(restBase)` reads the EVM parameter `active_static_precompiles` over REST and answers `active: true` only when the precompile's address is listed. That is the only reliable check, and it has to happen off-chain: the precompile returns the target's raw reply, so an empty reply cannot tell an inactive precompile from a genuine call to a contract that returns nothing, and a precompile has no bytecode whether it is active or not. Even when it reports `active: true`, the package documents that from chain v3.2.3 a call reaches only the targets governance has allowlisted (the cross-VM parameter `bridge_allowed_targets`, each entry `<vm>:<contract>`), and that EVM-to-EVM is refused.

### Chain v3.2.5: allowlist, reply format and refusals (testnet now, mainnet after the upgrade) {#chain-v325}

Chain v3.2.5 changes how the bridge behaves. The testnet runs it; **mainnet (v3.2.4) does not until governance proposal 14 is applied**, and the descriptions elsewhere on this page that say the precompile returns the target's raw reply describe mainnet today.

* **An allowlist route.** `GET /qorechain/crossvm/v1/params` serves the bridge parameters, including the allowlist of targets. On the testnet the allowlist is empty (checked 27 October 2026), so no target is allowed yet.
* **A fixed reply format.** The precompile returns `abi.encode(bytes)`, so a reply is always at least 64 bytes and an empty reply can be told from a missing one; decode it with `abi.decode(ret, (bytes))`.
* **Refusals carry a reason.** When the bridge refuses a call it reverts with `Error(string)`, which a contract can read and pass on.
* **The precompile is still not active.** `0x...0901` is not in the active precompile list on either network, so none of this has run end to end.

`@qorechain/rdk` 0.7.0 has helpers for these (checked against encodings Solidity produced): `getCrossVmParams` (the allowlist), `crossVmTargetReady` (precompile active, bridge enabled and the target allowlisted, with the blocking reason when not), `decodeCrossVmResult` (`abi.decode(ret, (bytes))`) and `decodeRevertReason` (`Error(string)`).

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

Because the precompile is inactive, a plain `.call` to it returns **success with empty data and does nothing**; the `ok` flag does not tell you the call took effect. The dependable in-contract guard is a target that always returns a non-empty acknowledgement, with a `require(ret.length > 0)` after the call, so that an empty reply is treated as a failure; the `multivm-rollup` template does this (0.6.0 and later).

## Scaffold a multi-VM rollup

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

The `multivm-rollup` template includes `src/crossvm-call.ts` (it checks whether the precompile is live, then prints the calldata) and a `contracts/CrossVmCaller.sol` that calls `executeCrossVMCall(uint8,string,bytes)` and requires a non-empty reply from the target. From 0.7.0 the contract decodes the `abi.encode(bytes)` result, requires the 64-byte minimum an active precompile returns, and passes the chain's refusal reason through. It does not make a call work while the precompile is inactive. See [Deploying a Rollup](/rollups/deploying-a-rollup) for all scaffolder templates.
