---
slug: /rollups/data-availability
title: Disponibilità dei Dati
sidebar_label: Disponibilità dei Dati
sidebar_position: 4
---

# Disponibilità dei Dati

La disponibilità dei dati (DA, data availability) è la garanzia che i dati di transazione alla base dello stato di un rollup siano pubblicati da qualche parte dove chiunque possa leggerli — in modo che chiunque possa ricostruire e verificare in modo indipendente lo stato del rollup. L'RDK definisce tre backend DA; oggi è implementato solo `native`.

| Backend | Di cosa si tratta | Stato |
| ------- | ---------- | ------ |
| **`native`** | Archiviazione di blob on-chain all'interno di QoreChain stessa | Implementato nel modulo; non esiste ancora un modo pubblico per pubblicare un blob (vedi sotto) |
| **`celestia`** | Disponibilità dei dati tramite IBC verso Celestia, un livello DA modulare dedicato | Non implementato |
| **`both`** | Native e Celestia insieme, per ridondanza | Si comporta esattamente come `native` oggi |

:::caution Capacità in fase iniziale
Nessun rollup è stato ancora creato su nessuna delle due reti (verificato il 27 ottobre 2026), e i backend DA sono implementati solo in parte. Lo stato di ciascun backend è indicato di seguito; verifica sulla testnet **`qorechain-diana`** prima di affidarti a uno qualsiasi di essi.
:::

---

## DA nativa (archiviazione di blob on-chain)

La DA nativa è l'archivio di blob on-chain all'interno di `x/rdk`: ogni blob è identificato dall'ID del rollup e dall'indice del blob, porta con sé un **commitment SHAKE-256** dei propri byte, e viene sottoposto a pruning dopo la finestra di conservazione mentre il suo commitment viene mantenuto.

:::caution Non esiste ancora un modo pubblico per pubblicare un blob
Il modulo definisce l'archiviazione, la conservazione e il pruning dei blob, ma nelle release attuali (mainnet v3.2.5 e testnet v3.2.6; i messaggi del modulo sono verificati nel sorgente della chain) **non esiste alcun messaggio di transazione per pubblicare un blob**. La chain accetta un `data_hash` non vuoto su un rollup `native` o `both` solo quando un blob corrispondente è archiviato on-chain, e nulla può archiviarne uno. Quindi un batch di settlement su un tale rollup **deve lasciare `data_hash` vuoto**: un batch che indica un data hash viene rifiutato come dati non disponibili, dopo che la commissione di transazione è stata pagata.

L'RDK si adegua a questo dalla **0.6.1** (e lo fanno anche la 0.6.2 e la 0.7.0): `SubmitBatchInput.dataHash` è facoltativo (se omesso significa vuoto), tutti e sei i template iniziali lo lasciano vuoto, `dataHashError` (`data_hash_error`, `DataHashError`, `Rules.dataHashError`) espone la regola in tutti e cinque i linguaggi, e `RdkTxClient.submitBatch` rifiuta un tale batch prima di trasmetterlo quando può leggere il rollup (un client ibrido con un endpoint REST). Le release precedenti dei template mettevano un data hash sui loro batch, che la chain rifiutava.
:::

Concetti chiave:

* **Blob.** Un blob è associato a un ID di rollup e a un indice di blob.
* **Commitment.** Ogni blob porta con sé un commitment SHAKE-256 di 32 byte dei propri dati, in modo che un blob possa essere verificato rispetto a ciò che è stato committato, senza fidarsi di chi lo archivia. (L'helper TypeScript `buildDaBlob()` calcolava l'hash con SHA-256 nella 0.6.2 e precedenti, quindi il suo `dataHash` non corrispondeva al commitment della chain; dalla 0.7.0 il suo commitment è lo SHAKE-256 della chain. Poiché nessuna transazione pubblica un blob, non dovresti comunque inviare un data hash in un batch su un rollup `native` o `both`.)
* **Namespace.** I blob possono portare un namespace specifico del rollup, mantenendo i dati di ciascun rollup logicamente separati all'interno dell'archiviazione condivisa.
* **Conservazione e pruning.** I blob nativi vengono conservati per `blob_retention_blocks` (432.000 blocchi — circa 16 giorni con l'attuale block time della mainnet di ≈3,1 s; la cifra varia con il block time) e poi sottoposti a pruning per mantenere sostenibile l'archiviazione on-chain. Dopo il pruning, i dati grezzi del blob vengono rimossi mentre i metadati del commitment vengono conservati, così il commitment storico rimane verificabile anche se i byte non sono più archiviati on-chain.

La dimensione massima del blob e la finestra di conservazione sono governate dai parametri del modulo attivi. Interrogali prima di progettare basandoti su un limite specifico:

```bash
qorechaind query rdk config
```

I metadati del blob (non i byte) sono leggibili via REST all'indirizzo `/qorechain/rdk/v1/blob/{rollup_id}/{blob_index}`, servito da entrambe le reti; includono `expires_at_height`.

---

## DA Celestia (IBC verso Celestia)

La DA Celestia **non è implementata**. Un rollup il cui backend DA è `celestia` non può pubblicare dati (il modulo restituisce un errore). Il design previsto pubblica la disponibilità dei dati tramite IBC verso **Celestia**, una rete DA modulare dedicata, pur ancorando comunque il settlement su QoreChain; sulla mainnet non è aperto alcun canale IBC, e l'unico canale aperto sulla testnet (verificato il 27 ottobre 2026) è un canale di trasferimento di token (`ics20-1`), non un canale di disponibilità dei dati (vedi [Architettura del Bridge](/architecture/bridge-architecture)). Usa `native`.

---

## Both (ridondanza)

Il backend `both` è pensato per scrivere su **native e Celestia insieme**. Oggi `both` si comporta esattamente come `native`: viene archiviata solo la copia nativa, e la metà Celestia viene saltata con un avviso registrato nei log. Non considerarlo come due copie indipendenti.

---

## Scegliere un backend

| Se vuoi... | Scegli |
| -------------- | ------ |
| L'opzione più semplice, completamente on-chain, che eredita la sicurezza di QoreChain | **`native`** |
| Scaricare la DA su un livello modulare dedicato | **`celestia`** — non implementato |
| Ridondanza su due archivi | **`both`** — uguale a `native` oggi |

Per come la DA si inserisce nel quadro più ampio del settlement, vedi **[Panoramica dei Rollup](/rollups/overview)**. Per il riferimento di modulo di livello più basso, vedi la pagina **[Rollup Development Kit](/architecture/rollup-development-kit)**.
