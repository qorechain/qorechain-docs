---
slug: /rollups/watchtower
title: Watchtower
sidebar_label: Watchtower
sidebar_position: 9
---

# Watchtower

Il Watchtower è un framework di auto-challenge per rollup ottimistici. Segue
i batch di settlement di un rollup, evidenzia ogni nuovo batch e la relativa
scadenza della finestra di contestazione e — quando il **tuo** predicato di validità rifiuta un batch — lo passa
alla tua callback `onInvalid` così puoi impostare una contestazione.

Il framework osserva e decide *quando*; **la verifica di validità la fornisci tu**. Il
Watchtower non decide mai da solo che un batch è fraudolento — chiama la tua
funzione `validate` e agisce in base a ciò che restituisci.

## `watchBatches`

```ts
import { createRdkClient, watchBatches, challengeBatch } from "@qorechain/rdk";

const rdk = createRdkClient({
  endpoints: {
    rest: "https://rest.testnet.example",
    rpc: "https://rpc.testnet.example", // needed to broadcast a challenge
  },
});

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

Il framework evidenzia:

- i **nuovi batch** tramite `onBatch`,
- le **scadenze della finestra di contestazione** tramite `onDeadline`, e
- i **batch non validi** (per i quali il tuo `validate` ha restituito `false`) tramite `onInvalid`.

Collegare `onInvalid` a `challengeBatch` trasforma il Watchtower in un
auto-challenger completo; lascialo non impostato per eseguirlo in modalità di sola osservazione.

## CLI

```bash
qorollup watchtower my-roll
```

`watchtower` esegue il framework dalla riga di comando, stampando i nuovi batch e
le scadenze della finestra di contestazione finché non premi Ctrl-C. Vedi
[Distribuire un Rollup](/rollups/deploying-a-rollup) per la CLI operatore `qorollup`
completa.
