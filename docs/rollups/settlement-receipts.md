---
slug: /rollups/settlement-receipts
title: Quantum-safe settlement receipts
sidebar_label: Settlement Receipts
sidebar_position: 6
---

# Quantum-safe settlement receipts

A **settlement receipt** is a portable record that a rollup's settlement batch was anchored to the Main Chain under a post-quantum signature. It names the rollup, the batch and the anchor, and carries the anchor's **ML-DSA-87** (Dilithium-5, FIPS-204) signature, the same scheme the Main Chain uses.

:::caution Early-stage: no anchors exist yet
Receipts depend on anchors, and **no rollup or anchor exists on either network yet** (checked 23 October 2026). Since v3.2.2 (live on both networks) a batch submitted with an `anchor_signature` is anchored in `x/multilayer` in the same transaction; a batch submitted without one settles unanchored. The TypeScript RDK (0.6.0) sends that field when its transaction client signs hybrid and is the rollup's creator, and submits unanchored otherwise; the Python, Go, Rust and Java clients sign classical-only and do not build the field. None of this has been exercised on a live rollup. Treat this page as a description of the design and of the building blocks, not of a service you can rely on today.
:::

## A receipt is a claim, not evidence {#a-receipt-is-a-claim}

Every field in a receipt is supplied by whoever hands it to you. Checking the signature against a key you were given shows that somebody holding that key signed those bytes; it does not show that QoreChain anchored anything. A verifier therefore needs a client connected to a QoreChain node it trusts and re-reads the claim from chain state: the rollup and its layer, the batch and its state root, the anchor, and the creator's registered post-quantum key.

## What the anchor signs {#what-the-anchor-signs}

The anchor's signature is made by the **rollup creator's** registered ML-DSA-87 key. The signed message depends on the height at which the anchor is submitted. **From v3.2.2 (mainnet height 3,556,788, testnet height 6,905,034) it is the v2 message**: a domain tag, the chain id, and length-prefixed `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, transaction count and compressed state proof (the exact layout is in [Reading Anchors](/architecture/multilayer-architecture#reading-anchors)). The chain does not accept a v1 anchor (`layer_id || layer_height || state_root || validator_set_hash`, no chain id) from that height on. Do not hard-code either form: read the sign bytes for the network you target. The RDK builds the v2 bytes with `anchorSignBytesForBatch` (and both forms with `anchorSignBytesV1` / `anchorSignBytesV2`), and the CLI prints them, for example with `qorechaind query rdk anchor-sign-bytes <layer-id> <batch-index> <state-root-hex> --chain-id <id> --tx-count <n>`.

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

Pass a `client` for every verification. The receipt API and its checks have changed between releases, so use 0.6.0 or later: 0.5.0 could not complete the chain check (see below). The Python, Go, Rust and Java clients expose the same build/verify surface; their 0.6.0 releases use the same singular key-lookup route and the same height-based choice of anchor message.

### What 0.6.0 verifies {#what-060-verifies}

`verifySettlementReceipt` never reports `valid` from the receipt alone: without a `client` the result is `mode: "signature-only"` and `valid: false`. With a `client` it re-reads the chain and reports each check separately:

* `rollupLayerBinding`: the chain says the rollup belongs to the receipt's layer;
* `batchStateRoot`: the chain's batch carries the receipt's state root;
* `anchorOnChain`: an anchor with that state root, height and signature exists on the chain;
* `creatorAuthority`: the signing key was read from the chain (`/qorechain/pqc/v1/account/{address}`), not taken from the receipt;
* `pqcSignature`: the ML-DSA-87 signature verifies over the canonical anchor message;
* `chainBinding`: the receipt names the chain that was actually queried.

The anchor message is chosen by the height the anchor was recorded at (v1 below the v3.2.2 switch, v2 from it), never by trying both, because a v1 signature carries no chain id and would verify on every chain. The package carries the switch height for mainnet (3,556,788) and testnet (6,905,034). The result reports the form it used as `signBytesVersion`. Receipt schema v2 records `chainId`; a version-1 receipt carries none, so it passes `chainBinding` only because its anchor was found on the chain you queried. Verification refuses a receipt checked against a node of another chain.

No anchor exists on either network, so this has only been checked against the package code and offline, not against a real anchor. `buildSettlementReceipt` works only once an anchor covers the batch.

:::note Releases before 0.6.0
`verifySettlementReceipt` in 0.5.0 failed closed against the live networks, for two reasons that were in the client, not the chain: it looked the creator's key up through a plural `accounts` form of the post-quantum account route, which the networks do not serve (HTTP 501), and it rebuilt only the v1 message, which the chain no longer accepts for anchors since v3.2.2. A genuine receipt therefore could not verify, and a forged one was still refused. Use 0.6.0 or later.
:::

## CLI {#cli}

```bash
qorollup receipt my-rollup 7                 # build and print
qorollup receipt my-rollup 7 --out receipt.json
```

See [Deploying a Rollup](/rollups/deploying-a-rollup) for the full `qorollup` operator CLI.
