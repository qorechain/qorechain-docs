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

:::caution Fase iniziale: ancora nulla da osservare
Il Watchtower legge i batch tramite il client REST dell'RDK, e le route `/qorechain/rdk/v1/…` sono servite su entrambe le reti. Non è stato creato alcun rollup su nessuna delle due reti (verificato il 27 ottobre 2026), quindi non c'è ancora nulla da osservare e il Watchtower non è mai stato eseguito su un batch live. In `@qorechain/rdk` 0.5.0 la sua logica di scadenza era errata (leggeva un'altezza di blocco come timestamp Unix, quindi `onDeadline` scattava non appena un batch veniva visto per la prima volta) e leggeva solo la prima pagina di 50 batch; **la 0.6.0 ha corretto entrambe le cose** (vedi sotto). Usa la 0.7.0, la release attuale.
:::

## `watchBatches`

```ts
import { createRdkClient, watchBatches } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });

// `tx` is a signing client that produces the hybrid (post-quantum) signature
// the networks require: pass `pqcKeypair` to `RdkClient.connectTx` (see
// "RDK 0.7.0: changes and limits" in Deploying a Rollup). Without it the
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

Il framework segnala:

- i **nuovi batch** tramite `onBatch`,
- le **scadenze delle finestre di challenge** tramite `onDeadline` e
- i **batch non validi** (per i quali la tua `validate` ha restituito `false`) tramite `onInvalid`.

Dalla 0.6.0 (e in ogni release successiva) segue ogni pagina dell'elenco dei batch di un rollup, rivaluta un batch man mano che la sua scadenza si avvicina (continua a interrogare in avanti a partire dal batch più vecchio la cui finestra è ancora aperta, anziché giudicare ciascun batch una sola volta alla prima occasione), e misura ogni finestra rispetto alla punta della chain (`getChainTip`, lo stato del nodo) anziché rispetto all'orologio locale. Un batch già `finalized` non viene validato né segnalato.

**Batch rinviati (0.7.0).** Dalla chain v3.2.5 (testnet ora; mainnet dopo l'upgrade) una frode confermata rifiuta il batch e ogni batch successivo non finalizzato, e il sequencer li rinvia con gli stessi indici. Le release precedenti alla 0.7.0 distinguevano i batch solo per indice e quindi perdevano un batch rinviato a un indice rifiutato; la 0.7.0 li distingue per indice e state root e non valida mai un batch rifiutato.

**Applicare la regola antifrode della chain (0.7.0).** `transitionRootValidator` è un predicato `validate` già pronto che applica la regola della chain stessa (un batch è fraudolento quando la sua state root non è la transition root canonica), e `fraudProofForBatch` restituisce la prova vincente, o nessuna per un batch onesto, così puoi passarla a `challengeBatch`.

Collegare `onInvalid` a una challenge trasforma il Watchtower in un
auto-challenger completo; lascialo non impostato per operare in modalità di sola
osservazione.

:::note Finestra di challenge
La chain misura la finestra di un batch in due modi possibili, e `batchChallengeWindow` (usata dal Watchtower e dal controllo di salute alla base di `qorollup status`) indica quale. **Finestra a conteggio di blocchi, la regola sulla mainnet per i batch inviati prima dell'altezza 3.742.566 (v3.2.3 e precedenti):** la finestra è costituita dai secondi configurati del rollup convertiti a 6 secondi fissi per blocco, ovvero **100.800 blocchi** per il default di 604.800, contati dall'altezza `submitted_at` del batch; il tempo reale segue il block time, quindi è più breve di «7 giorni» con i blocchi da ≈3,1 s della mainnet. Il pacchetto riporta `open` e `finalizable` separatamente, perché secondo la regola che implementa un blocco è entrambe le cose (una challenge risulta aperta finché `height - submitted_at <= window`, finalizzabile da `height - submitted_at >= window`). **Finestra basata sul tempo, dalla v3.2.4 (la testnet dall'altezza 8.337.253, la mainnet dall'altezza 3.742.566):** un batch inviato dall'altezza dell'upgrade in poi registra il proprio block time e la sua finestra è quel numero di secondi di block time. Il Watchtower usa la finestra propria del rollup quando il nodo la riporta (il pacchetto la documenta come v3.2.4 e successive); altrimenti ripiega sulla finestra predefinita del modulo, quindi passa `challengeWindowSecs` per un rollup che ne ha configurata una propria. Pubblicare una challenge richiede inoltre il bond di challenge del rollup (1.000 QOR per i preset `nft` e `custom`). La finestra predefinita del modulo è di 604.800 secondi sulla mainnet e di 3.600 secondi (un'ora) sulla testnet (letta da `GET /qorechain/rdk/v1/params` il 27 ottobre 2026), quindi la stessa configurazione di rollup ha una finestra molto più breve sulla testnet.
:::

## CLI

```bash
qorollup watchtower my-rollup
```

`watchtower` esegue il framework dalla riga di comando, stampando i nuovi batch
e le scadenze delle finestre di challenge finché non premi Ctrl-C. Aggiungi `--canonical` (0.7.0) e riporta anche ogni batch la cui state root non è la transition root canonica, cioè i batch che una challenge vincerebbe. Consulta
[Distribuire un Rollup](/rollups/deploying-a-rollup) per la CLI operatore
`qorollup` completa.
