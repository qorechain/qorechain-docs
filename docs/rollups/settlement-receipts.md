---
slug: /rollups/settlement-receipts
title: Quantum-safe settlement receipts
sidebar_label: Settlement Receipts
sidebar_position: 6
---

# Quantum-safe settlement receipts

A **settlement receipt** is a portable record that a rollup's settlement batch was anchored to the Main Chain under a post-quantum signature. It names the rollup, the batch and the anchor, and carries the anchor's **ML-DSA-87** (Dilithium-5, FIPS-204) signature, the same scheme the Main Chain uses.

:::caution Early-stage: no anchors exist yet
Receipts depend on anchors, and **no rollup or anchor exists on either network yet**. On mainnet the RDK does not write anchors yet: settlement batches are recorded, but the anchoring step is skipped. Treat this page as a description of the design and of the building blocks, not of a service you can rely on today.
:::

## A receipt is a claim, not evidence {#a-receipt-is-a-claim}

Every field in a receipt is supplied by whoever hands it to you. Checking the signature against a key you were given shows that somebody holding that key signed those bytes; it does not show that QoreChain anchored anything. A verifier therefore needs a client connected to a QoreChain node it trusts and re-reads the claim from chain state: the rollup and its layer, the batch and its state root, the anchor, and the creator's registered post-quantum key.

## What the anchor signs {#what-the-anchor-signs}

The anchor's signature is made by the **rollup creator's** registered ML-DSA-87 key. On mainnet today the signed message is

```
layer_id || layer_height (8-byte big-endian) || state_root || validator_set_hash
```

A newer chain release changes the signed message, so do not hard-code it: read the sign bytes for the network you target. An anchor is a layer-level object: it does not name the rollup or the batch, so a verifier binds them through chain reads (see [Multilayer Architecture](/architecture/multilayer-architecture#reading-anchors)).

## Reading anchors {#reading-anchors}

Anchors are readable over REST and gRPC (`/qorechain/multilayer/v1/anchor/{layer_id}` for the latest anchor and `/qorechain/multilayer/v1/anchors/{layer_id}` for the history), and an account's registered post-quantum key at `/qorechain/pqc/v1/account/{address}`. A rollup's batches are read with `qorechaind query rdk batch [rollup-id]` (the RDK REST routes are not served on mainnet today).

## Build and verify (TypeScript) {#build-and-verify}

```ts
import {
  createRdkClient,
  buildSettlementReceipt,
  verifySettlementReceipt,
} from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });

// Build a receipt for one batch (throws if no anchor covers the batch yet).
const receipt = await buildSettlementReceipt(rdk, "my-rollup", 7);

// Verify it against chain state — pass a client; a receipt on its own proves nothing.
const result = await verifySettlementReceipt(receipt, { client: rdk });
console.log(result.valid);
```

Pass a `client` for every verification. Use the latest published release of your RDK client: the receipt API and its checks have changed between releases, and the Python, Go, Rust and Java clients expose the same build/verify surface (they perform the ML-DSA-87 verification through the [`qorechain-pqc`](https://github.com/qorechain) library).

:::note Current client limitations
The published RDK clients look the creator's key up through a path the live chain does not serve, so online verification does not yet complete against the live networks. Until a client release addresses this, use a receipt only as a record to cross-check against the anchor you read from your own node.
:::

## CLI {#cli}

```bash
qorollup receipt my-rollup 7                 # build and print
qorollup receipt my-rollup 7 --out receipt.json
```

See [Deploying a Rollup](/rollups/deploying-a-rollup) for the full `qorollup` operator CLI.
