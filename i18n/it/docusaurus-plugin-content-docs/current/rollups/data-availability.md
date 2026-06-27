---
slug: /rollups/data-availability
title: Disponibilità dei Dati
sidebar_label: Disponibilità dei Dati
sidebar_position: 4
---

# Disponibilità dei Dati

La disponibilità dei dati (DA, data availability) è la garanzia che i dati di transazione alla base dello stato di un rollup siano pubblicati da qualche parte dove chiunque possa leggerli — in modo che chiunque possa ricostruire e verificare in modo indipendente lo stato del rollup. L'RDK supporta tre backend DA.

| Backend | Di cosa si tratta |
| ------- | ---------- |
| **`native`** | Archiviazione di blob on-chain all'interno di QoreChain stessa |
| **`celestia`** | Disponibilità dei dati tramite IBC verso Celestia, un livello DA modulare dedicato |
| **`both`** | Native e Celestia insieme, per ridondanza |

:::caution
I backend di disponibilità dei dati fanno parte dell'RDK in attiva evoluzione. Considera le note sulla maturità qui sotto come intento di progettazione e verifica sulla testnet **`qorechain-diana`** prima di affidarti a un backend in produzione.
:::

---

## DA nativa (archiviazione di blob on-chain)

La DA nativa archivia i dati di transazione del rollup come **blob** direttamente su QoreChain. Ogni blob viene committato ed è indirizzabile in modo che i dati alla base di un batch di settlement possano essere recuperati e verificati on-chain.

Concetti chiave:

* **Blob.** I dati di transazione del rollup vengono pubblicati come blob di disponibilità dei dati, ciascuno associato a un ID di rollup e a un indice di blob.
* **Commitment.** Ogni blob porta con sé un commitment (un hash dei dati del blob) in modo che un blob possa essere verificato rispetto a ciò che è stato committato, senza fidarsi di chi lo archivia.
* **Namespace.** I blob possono portare un namespace specifico del rollup, mantenendo i dati di ciascun rollup logicamente separati all'interno dell'archiviazione condivisa.
* **Conservazione e pruning.** I blob nativi vengono conservati per una finestra limitata e poi sottoposti a pruning per mantenere sostenibile l'archiviazione on-chain. Dopo il pruning, i dati grezzi del blob vengono rimossi mentre i metadati del commitment vengono conservati, così il commitment storico rimane verificabile anche se i byte non sono più archiviati on-chain.

La dimensione massima esatta del blob e la finestra di conservazione sono governate dai parametri del modulo attivi. Interrogali prima di progettare basandoti su un limite specifico:

```bash
qorechaind query rdk config
```

La DA nativa è l'opzione più semplice — mantiene tutto all'interno di QoreChain, ereditando la sicurezza e la crittografia post-quantistica della chain ospite, al costo di consumare l'archiviazione della chain ospite.

---

## DA Celestia (IBC verso Celestia)

Il backend `celestia` pubblica la disponibilità dei dati tramite IBC verso **Celestia**, una rete DA modulare dedicata. Questo scarica l'archiviazione dei blob da QoreChain verso un livello DA appositamente costruito, pur ancorando comunque il settlement su QoreChain.

:::note
La DA Celestia è un'integrazione in via di maturazione. Nella versione attuale dovrebbe essere considerata non ancora consolidata per la produzione — verifica il comportamento sulla testnet e preferisci `native` o `both` dove oggi hai bisogno di una garanzia consolidata.
:::

---

## Both (ridondanza)

Il backend `both` scrive su **native e Celestia insieme**, offrendo ridondanza tra un archivio on-chain e un livello DA modulare esterno. Scegli `both` quando vuoi la superficie di disponibilità più ampia e sei disposto a pagare per archiviare i dati in due posti.

Poiché il percorso Celestia è ancora in via di maturazione, considera `both` come native-con-ridondanza-in-corso piuttosto che una garanzia che oggi due copie pienamente indipendenti siano consolidate. Conferma il comportamento attuale sulla testnet.

---

## Scegliere un backend

| Se vuoi... | Scegli |
| -------------- | ------ |
| L'opzione più semplice, completamente on-chain, che eredita la sicurezza di QoreChain | **`native`** |
| Scaricare la DA su un livello modulare dedicato (in via di maturazione) | **`celestia`** |
| La massima superficie di disponibilità con ridondanza (in via di maturazione) | **`both`** |

Per come la DA si inserisce nel quadro più ampio del settlement, vedi **[Panoramica dei Rollup](/rollups/overview)**. Per il riferimento di modulo di livello più basso, vedi la pagina **[Rollup Development Kit](/architecture/rollup-development-kit)**.
