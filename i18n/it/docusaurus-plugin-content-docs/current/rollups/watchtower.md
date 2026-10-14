---
slug: /rollups/watchtower
title: Watchtower
sidebar_label: Watchtower
sidebar_position: 9
---

# Watchtower

Il Watchtower è un framework di auto-challenge per rollup ottimistici. Segue
i batch di settlement di un rollup, segnala ogni nuovo batch e la scadenza della
relativa finestra di challenge e — quando il **tuo** predicato di validità
rifiuta un batch — lo passa alla tua callback `onInvalid`, così puoi collegare
una challenge.

Il framework osserva e decide *quando*; **sei tu a fornire il controllo di
validità**. Il Watchtower non decide mai da solo che un batch è fraudolento —
chiama la tua funzione `validate` e agisce in base a ciò che restituisci.

:::caution Fase iniziale: richiede le route REST dell'RDK
Il Watchtower legge i batch tramite il client REST dell'RDK. Le route REST `/qorechain/rdk/v1/…` oggi non sono servite sul mainnet, quindi il Watchtower non può ancora funzionare sul mainnet. Non è stato creato alcun rollup su nessuna delle due reti, quindi non c'è nulla da osservare.
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

Il framework segnala:

- i **nuovi batch** tramite `onBatch`,
- le **scadenze delle finestre di challenge** tramite `onDeadline` e
- i **batch non validi** (per i quali la tua `validate` ha restituito `false`) tramite `onInvalid`.

Collegare `onInvalid` a una challenge trasforma il Watchtower in un
auto-challenger completo; lascialo non impostato per operare in modalità di sola
osservazione.

:::note Finestra di challenge
La scadenza riportata dal Watchtower usa la finestra di challenge convertita in blocchi a 6 secondi per blocco (100.800 blocchi per default), quindi con i blocchi da ≈3,2 s del mainnet la finestra reale è più breve di «7 giorni». Pubblicare una challenge richiede inoltre il bond di challenge del rollup (1.000 QOR per i preset `nft` e `custom`).
:::

## CLI

```bash
qorollup watchtower my-rollup
```

`watchtower` esegue il framework dalla riga di comando, stampando i nuovi batch
e le scadenze delle finestre di challenge finché non premi Ctrl-C. Consulta
[Distribuire un Rollup](/rollups/deploying-a-rollup) per la CLI operatore
`qorollup` completa.
