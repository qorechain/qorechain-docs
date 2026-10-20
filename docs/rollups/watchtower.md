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

:::caution Early-stage: nothing to watch, and the 0.5.0 deadline alerts are wrong
The Watchtower reads batches through the RDK REST client, and the `/qorechain/rdk/v1/…` routes are served on both networks. No rollup has been created on either network (checked 20 October 2026), so there is nothing to watch yet. In `@qorechain/rdk` 0.5.0 the challenge-window deadline logic is also unreliable: a batch's `submittedAt` is a **block height**, but the Watchtower (and the health check behind `qorollup status`) adds the window in seconds to it and compares the sum with the wall clock, so `secondsRemaining` is meaningless and `onDeadline` fires as soon as a batch is first seen. Do not use `onDeadline` or the countdown for decisions; compute the deadline yourself (see the note below). The watcher also reads only the first page of batches (50).
:::

## `watchBatches`

```ts
import { createRdkClient, watchBatches } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });

// `tx` is a signing client that produces the hybrid (post-quantum) signature
// the networks require: pass `pqcKeypair` to `RdkClient.connectTx` (see
// "RDK 0.5.0 limits" in Deploying a Rollup). Without it the transaction is
// classical-only and refused.
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

  // Called when a batch is within `deadlineWarnSecs` of its deadline. In 0.5.0 the
  // deadline mixes a block height with the wall clock, so treat this as unreliable.
  onDeadline: ({ batch, secondsRemaining }) => {
    console.warn("challenge window alert for batch", batch.batchIndex, secondsRemaining);
  },
});

// Later:
watcher.stop();
```

The framework surfaces:

- **new batches** via `onBatch`,
- **challenge-window deadlines** via `onDeadline`, and
- **invalid batches** (where your `validate` returned `false`) via `onInvalid`.

Wiring `onInvalid` to a challenge turns the Watchtower into a complete
auto-challenger; leave it unset to run in observe-only mode.

:::note Challenge window
Compute a batch's deadline in blocks, not seconds: `submitted_at` (a block height) plus the window. **On mainnet (v3.2.3)** the window is the default 604,800 "seconds" converted at a fixed 6 seconds per block, **100,800 blocks** (real time follows block time, so shorter than "7 days" at mainnet's ≈3.2 s blocks). **On the testnet only (v3.2.4)**, a batch submitted from height 8,337,253 on gets a window measured in seconds of block time. Posting a challenge also requires the rollup's challenge bond (1,000 QOR for the `nft` and `custom` presets).
:::

## CLI

```bash
qorollup watchtower my-rollup
```

`watchtower` runs the framework from the command line, printing new batches and
challenge-window deadlines until you press Ctrl-C. See
[Deploying a Rollup](/rollups/deploying-a-rollup) for the full `qorollup`
operator CLI.
