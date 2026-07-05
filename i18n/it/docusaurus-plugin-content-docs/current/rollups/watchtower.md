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

Il framework segnala:

- i **nuovi batch** tramite `onBatch`,
- le **scadenze delle finestre di challenge** tramite `onDeadline` e
- i **batch non validi** (per i quali la tua `validate` ha restituito `false`) tramite `onInvalid`.

Collegare `onInvalid` a `challengeBatch` trasforma il Watchtower in un
auto-challenger completo; lascialo non impostato per operare in modalità di sola
osservazione.

## CLI

```bash
qorollup watchtower my-roll
```

`watchtower` esegue il framework dalla riga di comando, stampando i nuovi batch
e le scadenze delle finestre di challenge finché non premi Ctrl-C. Consulta
[Distribuire un Rollup](/rollups/deploying-a-rollup) per la CLI operatore
`qorollup` completa.
