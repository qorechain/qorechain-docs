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

:::caution Frühes Stadium: benötigt die RDK-REST-Routen
Der Watchtower liest Batches über den RDK-REST-Client. Die REST-Routen `/qorechain/rdk/v1/…` werden heute im Mainnet nicht bereitgestellt, daher kann der Watchtower noch nicht gegen das Mainnet laufen. In keinem der beiden Netzwerke wurde ein Rollup erstellt, es gibt also nichts zu beobachten.
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

Das Framework macht sichtbar:

- **neue Batches** über `onBatch`,
- **Challenge-Window-Fristen** über `onDeadline` und
- **ungültige Batches** (bei denen dein `validate` `false` zurückgegeben hat) über `onInvalid`.

Indem du `onInvalid` mit einer Challenge verbindest, wird der Watchtower zu
einem vollständigen Auto-Challenger; lass es ungesetzt, um im reinen
Beobachtungsmodus zu laufen.

:::note Challenge-Window
Die vom Watchtower gemeldete Frist verwendet das in Blöcke umgerechnete Challenge-Window bei 6 Sekunden pro Block (standardmäßig 100.800 Blöcke), sodass das tatsächliche Fenster bei den ≈3,2-s-Blöcken des Mainnets kürzer ist als „7 Tage“. Das Einreichen einer Challenge erfordert außerdem die Challenge-Bond des Rollups (1.000 QOR für die Presets `nft` und `custom`).
:::

## CLI

```bash
qorollup watchtower my-rollup
```

`watchtower` führt das Framework über die Kommandozeile aus und gibt neue
Batches sowie Challenge-Window-Fristen aus, bis du Strg-C drückst. Siehe
[Ein Rollup bereitstellen](/rollups/deploying-a-rollup) für die vollständige
`qorollup`-Operator-CLI.
