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

:::caution Early-stage: needs the RDK REST routes
The Watchtower reads batches through the RDK REST client. The `/qorechain/rdk/v1/…` REST routes are not served on mainnet today, so the Watchtower cannot run against mainnet yet. No rollup has been created on either network, so there is nothing to watch.
:::

## `watchBatches`

```ts
import { createRdkClient, watchBatches } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });

// `tx` is a signing client that produces the hybrid (post-quantum) signature
// the networks require. See "Signing with the published clients" in
// Deploying a Rollup — the classical-only client in @qorechain/rdk 0.4.4
// cannot get a challenge accepted.
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

  // Called as a batch approaches the end of its challenge window.
  onDeadline: ({ batch, secondsRemaining }) => {
    console.warn("challenge window closing for batch", batch.batchIndex, secondsRemaining);
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
The deadline the Watchtower reports uses the challenge window converted to blocks at 6 seconds per block (100,800 blocks by default), so on mainnet's ≈3.2 s blocks the real window is shorter than "7 days". Posting a challenge also requires the rollup's challenge bond (1,000 QOR for the `nft` and `custom` presets).
:::

## CLI

```bash
qorollup watchtower my-rollup
```

`watchtower` runs the framework from the command line, printing new batches and
challenge-window deadlines until you press Ctrl-C. See
[Deploying a Rollup](/rollups/deploying-a-rollup) for the full `qorollup`
operator CLI.
