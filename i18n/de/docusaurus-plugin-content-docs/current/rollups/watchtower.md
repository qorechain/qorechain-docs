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

:::caution Frühes Stadium: noch nichts zu beobachten
Der Watchtower liest Batches über den RDK-REST-Client, und die Routen `/qorechain/rdk/v1/…` werden auf beiden Netzwerken bereitgestellt. In keinem der beiden Netzwerke wurde ein Rollup erstellt (geprüft am 27. Oktober 2026), es gibt also noch nichts zu beobachten, und der Watchtower ist noch nie gegen einen Live-Batch gelaufen. In `@qorechain/rdk` 0.5.0 war seine Fristlogik falsch (sie las eine Blockhöhe als Unix-Zeitstempel, sodass `onDeadline` ausgelöst wurde, sobald ein Batch zum ersten Mal gesehen wurde), und er las nur die erste Seite mit 50 Batches; **0.6.0 hat beides behoben** (siehe unten). Verwende 0.6.2, das aktuelle Release.
:::

## `watchBatches`

```ts
import { createRdkClient, watchBatches } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });

// `tx` is a signing client that produces the hybrid (post-quantum) signature
// the networks require: pass `pqcKeypair` to `RdkClient.connectTx` (see
// "RDK 0.6.2: changes and limits" in Deploying a Rollup). Without it the
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

Das Framework macht sichtbar:

- **neue Batches** über `onBatch`,
- **Challenge-Window-Fristen** über `onDeadline` und
- **ungültige Batches** (bei denen dein `validate` `false` zurückgegeben hat) über `onInvalid`.

Indem du `onInvalid` mit einer Challenge verbindest, wird der Watchtower zu
einem vollständigen Auto-Challenger; lass es ungesetzt, um im reinen
Beobachtungsmodus zu laufen.

Seit 0.6.0 (und in 0.6.1 und 0.6.2) folgt er jeder Seite der Batch-Liste eines Rollups, beurteilt einen Batch neu, wenn sich seine Frist nähert (er pollt weiter ab dem ältesten Batch, dessen Fenster noch offen ist, statt jeden Batch nur einmal beim ersten Anblick zu beurteilen), und misst jedes Fenster an der Chain-Spitze (`getChainTip`, dem Status des Nodes) statt an der lokalen Uhr. Ein Batch, der bereits `finalized` ist, wird weder validiert noch gemeldet.

:::note Challenge-Window
Die Chain misst das Fenster eines Batches auf eine von zwei Arten, und `batchChallengeWindow` (verwendet vom Watchtower und von der Gesundheitsprüfung hinter `qorollup status`) meldet, auf welche. **Fenster nach Blockanzahl, die Regel im Mainnet für Batches, die vor Höhe 3.742.566 eingereicht wurden (v3.2.3 und früher):** Das Fenster sind die konfigurierten Sekunden des Rollups, umgerechnet mit festen 6 Sekunden pro Block, also **100.800 Blöcke** für die standardmäßigen 604.800, gezählt ab der Höhe `submitted_at` des Batches; die reale Zeit folgt der Blockzeit und ist daher bei den ≈3,1-s-Blöcken des Mainnets kürzer als „7 Tage“. Das Paket meldet `open` und `finalizable` getrennt, weil bei der Regel, die es umsetzt, ein Block beides ist (eine Challenge gilt als offen, solange `height - submitted_at <= window`, finalisierbar ab `height - submitted_at >= window`). **Zeitbasiertes Fenster, ab v3.2.4 (das Testnet seit Höhe 8.337.253, das Mainnet seit Höhe 3.742.566):** Ein Batch, der ab der Upgrade-Höhe eingereicht wird, hält seine Blockzeit fest, und sein Fenster ist diese Anzahl von Sekunden Blockzeit. Der Watchtower verwendet das eigene Fenster des Rollups, wenn der Node es meldet (das Paket dokumentiert dies als v3.2.4 und später); andernfalls fällt er auf das Standardfenster des Moduls zurück, übergib daher `challengeWindowSecs` für ein Rollup, das ein eigenes konfiguriert hat. Das Einreichen einer Challenge erfordert außerdem die Challenge-Bond des Rollups (1.000 QOR für die Presets `nft` und `custom`). Das Standardfenster des Moduls beträgt 604.800 Sekunden im Mainnet und 3.600 Sekunden (eine Stunde) im Testnet (gelesen von `GET /qorechain/rdk/v1/params` am 27. Oktober 2026), daher hat dieselbe Rollup-Konfiguration im Testnet ein viel kürzeres Fenster.
:::

## CLI

```bash
qorollup watchtower my-rollup
```

`watchtower` führt das Framework über die Kommandozeile aus und gibt neue
Batches sowie Challenge-Window-Fristen aus, bis du Strg-C drückst. Siehe
[Ein Rollup bereitstellen](/rollups/deploying-a-rollup) für die vollständige
`qorollup`-Operator-CLI.
