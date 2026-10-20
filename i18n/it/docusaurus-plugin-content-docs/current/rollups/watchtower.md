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

:::caution Fase iniziale: nulla da osservare, e gli avvisi di scadenza della 0.5.0 sono errati
Il Watchtower legge i batch tramite il client REST dell'RDK, e le route `/qorechain/rdk/v1/…` sono servite su entrambe le reti. Non è stato creato alcun rollup su nessuna delle due reti (verificato il 20 ottobre 2026), quindi non c'è ancora nulla da osservare. In `@qorechain/rdk` 0.5.0 anche la logica della scadenza della finestra di challenge è inaffidabile: il `submittedAt` di un batch è un'**altezza di blocco**, ma il Watchtower (e il controllo di salute alla base di `qorollup status`) vi somma la finestra espressa in secondi e confronta il risultato con l'orologio reale, quindi `secondsRemaining` non ha significato e `onDeadline` scatta non appena un batch viene visto per la prima volta. Non usare `onDeadline` né il conto alla rovescia per prendere decisioni; calcola tu stesso la scadenza (vedi la nota qui sotto). Inoltre l'osservatore legge solo la prima pagina di batch (50).
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

Il framework segnala:

- i **nuovi batch** tramite `onBatch`,
- le **scadenze delle finestre di challenge** tramite `onDeadline` e
- i **batch non validi** (per i quali la tua `validate` ha restituito `false`) tramite `onInvalid`.

Collegare `onInvalid` a una challenge trasforma il Watchtower in un
auto-challenger completo; lascialo non impostato per operare in modalità di sola
osservazione.

:::note Finestra di challenge
Calcola la scadenza di un batch in blocchi, non in secondi: `submitted_at` (un'altezza di blocco) più la finestra. **Su mainnet (v3.2.3)** la finestra è il default di 604.800 «secondi» convertito a 6 secondi fissi per blocco, ovvero **100.800 blocchi** (il tempo reale segue il block time, quindi è più breve di «7 giorni» con i blocchi da ≈3,2 s della mainnet). **Solo sulla testnet (v3.2.4)**, un batch inviato dall'altezza 8.337.253 in poi ottiene una finestra misurata in secondi di block time. Pubblicare una challenge richiede inoltre il bond di challenge del rollup (1.000 QOR per i preset `nft` e `custom`).
:::

## CLI

```bash
qorollup watchtower my-rollup
```

`watchtower` esegue il framework dalla riga di comando, stampando i nuovi batch
e le scadenze delle finestre di challenge finché non premi Ctrl-C. Consulta
[Distribuire un Rollup](/rollups/deploying-a-rollup) per la CLI operatore
`qorollup` completa.
