---
slug: /rollups/settlement-receipts
title: Quantum-safe settlement receipts
sidebar_label: Settlement Receipts
sidebar_position: 6
---

# Quantum-safe settlement receipts

A **settlement receipt** is a portable record that a rollup's settlement batch was anchored to the Main Chain under a post-quantum signature. It names the rollup, the batch and the anchor, and carries the anchor's **ML-DSA-87** (Dilithium-5, FIPS-204) signature, the same scheme the Main Chain uses.

:::caution Early-stage: no anchors exist yet
Receipts depend on anchors, and **no rollup or anchor exists on either network yet** (checked 20 October 2026). Since v3.2.2 (live on both networks) a batch submitted with an `anchor_signature` is anchored in `x/multilayer` in the same transaction; a batch submitted without one settles unanchored. The released RDK clients (0.5.0) do not send that field, so batches they submit are unanchored. Treat this page as a description of the design and of the building blocks, not of a service you can rely on today.
:::

## A receipt is a claim, not evidence {#a-receipt-is-a-claim}

Every field in a receipt is supplied by whoever hands it to you. Checking the signature against a key you were given shows that somebody holding that key signed those bytes; it does not show that QoreChain anchored anything. A verifier therefore needs a client connected to a QoreChain node it trusts and re-reads the claim from chain state: the rollup and its layer, the batch and its state root, the anchor, and the creator's registered post-quantum key.

## What the anchor signs {#what-the-anchor-signs}

The anchor's signature is made by the **rollup creator's** registered ML-DSA-87 key. The signed message depends on the height at which the anchor is submitted. **From v3.2.2 (mainnet height 3,556,788, testnet height 6,905,034) it is the v2 message**: a domain tag, the chain id, and length-prefixed `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, transaction count and compressed state proof (the exact layout is in [Reading Anchors](/architecture/multilayer-architecture#reading-anchors)). The chain does not accept a v1 anchor (`layer_id || layer_height || state_root || validator_set_hash`, no chain id) from that height on. Do not hard-code either form: read the sign bytes for the network you target, for example with `qorechaind query rdk anchor-sign-bytes <layer-id> <batch-index> <state-root-hex> --chain-id <id> --tx-count <n>`.

An anchor is a layer-level object: it does not name the rollup or the batch, so a verifier binds them through chain reads (see [Multilayer Architecture](/architecture/multilayer-architecture#reading-anchors)).

## Reading anchors {#reading-anchors}

Anchors are readable over REST and gRPC (`/qorechain/multilayer/v1/anchor/{layer_id}` for the latest anchor and `/qorechain/multilayer/v1/anchors/{layer_id}` for the history), and an account's registered post-quantum key at `/qorechain/pqc/v1/account/{address}` (singular `account`). A rollup's batches are read over the RDK REST routes (`/qorechain/rdk/v1/batch/{rollup_id}/{batch_index}`, `/qorechain/rdk/v1/latest_batch/{rollup_id}`, `/qorechain/rdk/v1/batches/{rollup_id}`), which both networks serve, or with `qorechaind query rdk batch [rollup-id]`.

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

Pass a `client` for every verification. The receipt API and its checks have changed between releases, so use a release that verifies against the chain (0.5.0 or later). The Python, Go, Rust and Java clients expose the same build/verify surface (the Go and Rust clients use the same plural key-lookup path as the limitation below).

:::caution Current client limitations (RDK 0.5.0)
`verifySettlementReceipt` in 0.5.0 never reports `valid` from the receipt alone (without a `client` the result is `mode: "signature-only"` and `valid: false`), and its chain check does not complete against the live networks yet, for two reasons that are in the client, not the chain:

* it looks the creator's key up through the plural `accounts` form of the post-quantum account route, which the networks do not serve (HTTP 501; the working route is the singular `account` one), so with a `client` the result is `valid: false` with the reason that the creator's post-quantum key could not be resolved; and
* it rebuilds the signed message in the v1 layout, which the chain no longer accepts for anchors since v3.2.2, so it could not verify a genuine v2 signature even with the key in hand.

`buildSettlementReceipt` works only once an anchor covers the batch, and none exists. Use a receipt only as a record to cross-check against the anchor and the creator's key that you read from your own node, with the v2 sign bytes for the network.
:::

## CLI {#cli}

```bash
qorollup receipt my-rollup 7                 # build and print
qorollup receipt my-rollup 7 --out receipt.json
```

See [Deploying a Rollup](/rollups/deploying-a-rollup) for the full `qorollup` operator CLI.
