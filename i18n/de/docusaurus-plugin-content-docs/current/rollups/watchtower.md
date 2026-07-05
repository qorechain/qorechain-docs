---
slug: /rollups/watchtower
title: Watchtower
sidebar_label: Watchtower
sidebar_position: 9
---

# Watchtower

Der Watchtower ist ein Auto-Challenger-Framework für Optimistic Rollups. Er
folgt den Settlement-Batches eines Rollups, macht jeden neuen Batch und dessen
Challenge-Window-Frist sichtbar und übergibt ihn — wenn **dein**
Gültigkeitsprädikat einen Batch ablehnt — an deinen `onInvalid`-Callback,
sodass du eine Challenge anbinden kannst.

Das Framework beobachtet und entscheidet, *wann*; **die Gültigkeitsprüfung
lieferst du**. Der Watchtower entscheidet niemals von sich aus, dass ein Batch
betrügerisch ist — er ruft deine `validate`-Funktion auf und handelt anhand
dessen, was du zurückgibst.

## `watchBatches`

```ts
import { createRdkClient, watchBatches, challengeBatch } from "@qorechain/rdk";

// The public qore.host REST + RPC endpoints are baked into the presets
// (RDK ≥ 0.4.2); the RPC endpoint is what broadcasts a challenge. Pass
// `endpoints` only to target your own node.
const rdk = createRdkClient({ network: "testnet" });

const watcher = watchBatches(rdk, "my-roll", {
  onBatch: (batch) => {
    console.log("new batch", batch.index);
  },

  // Your validity predicate. Return false to flag the batch as invalid.
  validate: async (batch) => {
    return await isBatchValid(batch); // your logic
  },

  // Called when validate() returns false — wire it to a challenge.
  onInvalid: async (batch) => {
    await challengeBatch(rdk, "my-roll", batch.index /* + your fraud proof */);
  },

  // Called as a batch approaches the end of its challenge window.
  onDeadline: (batch) => {
    console.warn("challenge window closing for batch", batch.index);
  },
});

// Later:
watcher.stop();
```

Das Framework macht sichtbar:

- **neue Batches** über `onBatch`,
- **Challenge-Window-Fristen** über `onDeadline` und
- **ungültige Batches** (bei denen dein `validate` `false` zurückgegeben hat) über `onInvalid`.

Indem du `onInvalid` mit `challengeBatch` verbindest, wird der Watchtower zu
einem vollständigen Auto-Challenger; lass es ungesetzt, um im reinen
Beobachtungsmodus zu laufen.

## CLI

```bash
qorollup watchtower my-roll
```

`watchtower` führt das Framework über die Kommandozeile aus und gibt neue
Batches sowie Challenge-Window-Fristen aus, bis du Strg-C drückst. Siehe
[Ein Rollup bereitstellen](/rollups/deploying-a-rollup) für die vollständige
`qorollup`-Operator-CLI.
