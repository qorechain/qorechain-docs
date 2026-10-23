---
slug: /rollups/watchtower
title: Watchtower
sidebar_label: Watchtower
sidebar_position: 9
---

# Watchtower

The Watchtower is an auto-challenger framework for optimistic rollups. It follows
a rollup's settlement batches, surfaces each new batch and its challenge-window
deadline, and — when **your** validity predicate rejects a batch — hands it to
your `onInvalid` callback so you can wire up a challenge.

The framework watches and decides *when*; **you supply the validity check**. The
Watchtower never decides on its own that a batch is fraudulent — it calls your
`validate` function and acts on what you return.

:::caution Early-stage: nothing to watch yet
The Watchtower reads batches through the RDK REST client, and the `/qorechain/rdk/v1/…` routes are served on both networks. No rollup has been created on either network (checked 23 October 2026), so there is nothing to watch yet and the Watchtower has not run against a live batch. In `@qorechain/rdk` 0.5.0 its deadline logic was wrong (it read a block height as a Unix timestamp, so `onDeadline` fired as soon as a batch was first seen) and it read only the first page of 50 batches; **0.6.0 fixes both** (see below). Use 0.6.0 or later.
:::

## `watchBatches`

```ts
import { createRdkClient, watchBatches } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });

// `tx` is a signing client that produces the hybrid (post-quantum) signature
// the networks require: pass `pqcKeypair` to `RdkClient.connectTx` (see
// "RDK 0.6.0: changes and limits" in Deploying a Rollup). Without it the
// transaction is classical-only and refused.
declare const tx: {
  challengeBatch(input: { rollupId: string; batchIndex: number; proof: string }): Promise<unknown>;
};

const watcher = watchBatches(rdk, "my-rollup", {
  onBatch: (batch) => {
    console.log("new batch", batch.batchIndex);
  },

  // Your validity predicate. Return false to flag the batch as invalid.
  validate: async (batch) => {
    return await isBatchValid(batch); // your logic
  },

  // Called when validate() returns false — wire it to a challenge.
  onInvalid: async ({ batch }) => {
    await tx.challengeBatch({
      rollupId: "my-rollup",
      batchIndex: batch.batchIndex,
      proof: myFraudProofHex, // hex fraud proof
    });
  },

  // Called once per batch when its challenge window is still open and close to
  // closing: within `deadlineWarnSecs` seconds (time-based window) or
  // `deadlineWarnBlocks` blocks (block-count window). `window` says which rule
  // applies and what is left.
  onDeadline: ({ batch, window }) => {
    console.warn("challenge window closing for batch", batch.batchIndex, window);
  },
});

// Later:
watcher.stop();
```

The framework surfaces:

- **new batches** via `onBatch`,
- **challenge-window deadlines** via `onDeadline`, and
- **invalid batches** (where your `validate` returned `false`) via `onInvalid`.

Since 0.6.0 it follows every page of a rollup's batch list, re-judges a batch as its deadline approaches (it keeps polling forward from the oldest batch whose window is still open, rather than judging each batch once on first sight), and measures each window against the chain tip (`getChainTip`, the node's status) instead of the local clock. A batch that is already `finalized` is not validated or warned about.

Wiring `onInvalid` to a challenge turns the Watchtower into a complete
auto-challenger; leave it unset to run in observe-only mode.

:::note Challenge window
The chain measures a batch's window one of two ways, and `batchChallengeWindow` (used by the Watchtower and by the health check behind `qorollup status`) reports which. **Block-count window, the rule on mainnet for batches submitted before height 3,742,566 (v3.2.3 and earlier):** the window is the rollup's configured seconds converted at a fixed 6 seconds per block, **100,800 blocks** for the default 604,800, counted from the batch's `submitted_at` height; real time follows block time, so it is shorter than "7 days" at mainnet's ≈3.2 s blocks. The package reports `open` and `finalizable` separately, because under the rule it implements one block is both (a challenge counts as open while `height - submitted_at <= window`, finalizable from `height - submitted_at >= window`). **Time-based window, from v3.2.4 (the testnet since height 8,337,253, mainnet since height 3,742,566):** a batch submitted from the upgrade height on records its block time and its window is that many seconds of block time. The Watchtower uses the rollup's own window when the node reports it (the package documents this as v3.2.4 and later); otherwise it falls back to the module's default window, so pass `challengeWindowSecs` for a rollup that configured its own. Posting a challenge also requires the rollup's challenge bond (1,000 QOR for the `nft` and `custom` presets).
:::

## CLI

```bash
qorollup watchtower my-rollup
```

`watchtower` runs the framework from the command line, printing new batches and
challenge-window deadlines until you press Ctrl-C. See
[Deploying a Rollup](/rollups/deploying-a-rollup) for the full `qorollup`
operator CLI.
