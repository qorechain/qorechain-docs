---
slug: /rollups/why
title: Why QoreChain RDK
sidebar_label: Why QoreChain RDK
sidebar_position: 2
---

# Why QoreChain RDK

Most rollup development kits are variations on the same theme: they help you
launch an app-chain that settles to a base layer. The QoreChain RDK does that
too, and it adds three QoreChain-specific capabilities that are built around
QoreChain's Layer 1 rather than the tooling:

- a **post-quantum** settlement layer,
- **on-chain AI/RL** advisory primitives (QCAI), and
- a **triple-VM** runtime with cross-VM calls.

:::caution Early stage: read the status column
No rollup has been created on either network yet. The table below states what
works today. If you only need a generic optimistic/zk rollup, any kit will do;
the capabilities here are what the RDK adds on top, in TypeScript, Python, Go,
Rust, and Java.
:::

| Capability | Status | What it relies on |
| --- | --- | --- |
| **Quantum-safe settlement receipts** | 🟡 Early stage | Anchors are signed with ML-DSA-87, the Main Chain's post-quantum scheme; no anchors exist yet |
| **QCAI Rollup Copilot** | 🟡 Not available on the public endpoints yet | On-chain AI/RL advisory services that the public endpoints do not expose today |
| **Multi-VM cross-VM calls** | 🟡 Not usable on the live networks yet | A cross-VM precompile that is not activated, and CosmWasm upload is closed |

---

## 1. Quantum-safe settlement receipts

> 🟡 **Design built on QoreChain's post-quantum base layer.** Settlement anchors
> are signed with ML-DSA-87 (Dilithium-5, FIPS-204), the same scheme the Main
> Chain uses. Early stage: no anchors exist on either network yet.

When your rollup's creator anchors a settlement batch, the anchor is signed with a
post-quantum key registered on-chain. The RDK can package that anchor as a
**portable receipt**, and a verifier re-reads the claim from a QoreChain node to
confirm that the rollup, the batch, the anchor and the creator's key all match
what the chain holds.

```ts
import { createRdkClient, buildSettlementReceipt, verifySettlementReceipt } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });
const receipt = await buildSettlementReceipt(rdk, "my-rollup", 42);
const result = await verifySettlementReceipt(receipt, { client: rdk });
console.log(result.valid);
```

See [Quantum-safe settlement receipts](/rollups/settlement-receipts) for what a
receipt does and does not prove.

---

## 2. QCAI Rollup Copilot

> 🟡 **Not available on the public endpoints yet.**

The Copilot is meant to aggregate the network's advisory services (a fee-policy
agent, recommendations, fraud investigations) into one read-only, plain-language
view for a rollup. It is best-effort: if a service is unreachable it degrades to a
warning instead of failing. Those services are not exposed on the public
endpoints today, so every section comes back as a warning.

```ts
import { createRdkClient, getRollupAdvice } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });
const advice = await getRollupAdvice(rdk, "my-rollup");
console.log(advice.warnings); // services that could not be reached
```

From the CLI: `qorollup advise my-rollup`. See [QCAI Copilot](/rollups/qcai-copilot).

---

## 3. Multi-VM cross-VM calls

> 🟡 **Not usable on the live networks yet** — the precompile is not activated and
> CosmWasm upload is closed. See [Multi-VM](/rollups/multi-vm).

The RDK includes helpers that encode a call from an EVM (Solidity) contract to a
**CosmWasm** contract through a fixed precompile at `0x…0901`. That precompile is
**not active** on mainnet or testnet (see
[EVM Precompiles: Network status](/developer-guide/evm-precompiles#network-status)).

```ts
import { encodeCrossVmCalldata, CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

const calldata = encodeCrossVmCalldata({
  contract: "qor1examplecontract…",       // target CosmWasm contract
  msg: JSON.stringify({ increment: {} }),  // its execute message
});

// Send an EVM transaction:  to = CROSS_VM_PRECOMPILE,  data = calldata
console.log(CROSS_VM_PRECOMPILE); // 0x0000000000000000000000000000000000000901
```

Or directly from Solidity on your rollup:

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

Scaffold a starter with `npm create qorechain-rollup my-app -- --template multivm-rollup`.
(EVM↔CosmWasm only; SVM cross-calls are separate.)

---

## Everything else you'd expect

Beyond those capabilities, the RDK ships the table-stakes too: five published
language clients verified against shared golden vectors, the five preset profiles
and the full compatibility matrix, settlement-batch and lifecycle management,
native data-availability storage (see its status note), a **watchtower** auto-challenger for optimistic
rollups, and the `qorollup` operator CLI.

## Next

- [Deploying a Rollup](/rollups/deploying-a-rollup) — per-language install and
  the CLI path to a testnet rollup.
- [Quantum-safe settlement receipts](/rollups/settlement-receipts) ·
  [QCAI Copilot](/rollups/qcai-copilot) ·
  [Multi-VM](/rollups/multi-vm) ·
  [Watchtower](/rollups/watchtower) — the deep dives.
