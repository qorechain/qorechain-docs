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

:::caution Frühes Stadium: nichts zu beobachten, und die Fristwarnungen von 0.5.0 sind falsch
Der Watchtower liest Batches über den RDK-REST-Client, und die Routen `/qorechain/rdk/v1/…` werden auf beiden Netzwerken bereitgestellt. In keinem der beiden Netzwerke wurde ein Rollup erstellt (geprüft am 20. Oktober 2026), es gibt also noch nichts zu beobachten. In `@qorechain/rdk` 0.5.0 ist außerdem die Logik für die Challenge-Window-Frist unzuverlässig: Das `submittedAt` eines Batches ist eine **Blockhöhe**, aber der Watchtower (und die Gesundheitsprüfung hinter `qorollup status`) addiert das Fenster in Sekunden dazu und vergleicht die Summe mit der Wanduhrzeit, sodass `secondsRemaining` bedeutungslos ist und `onDeadline` ausgelöst wird, sobald ein Batch zum ersten Mal gesehen wird. Verwende `onDeadline` oder den Countdown nicht für Entscheidungen; berechne die Frist selbst (siehe die Notiz unten). Der Watcher liest außerdem nur die erste Seite der Batches (50).
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

Das Framework macht sichtbar:

- **neue Batches** über `onBatch`,
- **Challenge-Window-Fristen** über `onDeadline` und
- **ungültige Batches** (bei denen dein `validate` `false` zurückgegeben hat) über `onInvalid`.

Indem du `onInvalid` mit einer Challenge verbindest, wird der Watchtower zu
einem vollständigen Auto-Challenger; lass es ungesetzt, um im reinen
Beobachtungsmodus zu laufen.

:::note Challenge-Window
Berechne die Frist eines Batches in Blöcken, nicht in Sekunden: `submitted_at` (eine Blockhöhe) plus das Fenster. **Im Mainnet (v3.2.3)** beträgt das Fenster die standardmäßigen 604.800 „Sekunden“, umgerechnet mit festen 6 Sekunden pro Block, also **100.800 Blöcke** (die reale Zeit folgt der Blockzeit und ist daher bei den ≈3,2-s-Blöcken des Mainnets kürzer als „7 Tage“). **Nur im Testnet (v3.2.4)** erhält ein Batch, der ab Höhe 8.337.253 eingereicht wird, ein Fenster, das in Sekunden der Blockzeit gemessen wird. Das Einreichen einer Challenge erfordert außerdem die Challenge-Bond des Rollups (1.000 QOR für die Presets `nft` und `custom`).
:::

## CLI

```bash
qorollup watchtower my-rollup
```

`watchtower` führt das Framework über die Kommandozeile aus und gibt neue
Batches sowie Challenge-Window-Fristen aus, bis du Strg-C drückst. Siehe
[Ein Rollup bereitstellen](/rollups/deploying-a-rollup) für die vollständige
`qorollup`-Operator-CLI.
