---
slug: /architecture/rollup-development-kit
title: Rollup Development Kit
sidebar_label: Rollup Development Kit
sidebar_position: 12
---

# Rollup Development Kit

Il modulo `x/rdk` fornisce un completo Rollup Development Kit (RDK) che consente agli sviluppatori di distribuire rollup specifici per applicazione su QoreChain. Supporta quattro paradigmi di settlement, diverse modalità di sequencer, backend di disponibilità dei dati collegabili e ottimizzazione della configurazione assistita dall'IA.

:::caution Funzionalità in fase iniziale
Il modulo è distribuito su mainnet (versione di catena **v3.2.5** dal 29 ottobre 2026) e su testnet (**v3.2.6** dal 27 ottobre 2026), ma **su nessuna delle due reti è ancora stato creato alcun rollup** (verificato il 30 ottobre 2026: `GET /qorechain/rdk/v1/rollups` restituisce un elenco vuoto su entrambe). Diverse funzionalità descritte di seguito oggi non sono utilizzabili end to end; lo stato è indicato dove ciascuna viene descritta. Per la guida pratica rivolta agli sviluppatori, vedi [Panoramica dei Rollup](/rollups/overview).
:::

---

## Paradigmi di settlement

QoreChain RDK supporta quattro distinte modalità di settlement — **optimistic**, **zk**, **based** e **sovereign** — ciascuna con diverse assunzioni di fiducia, caratteristiche di finalità e requisiti di prova.

### Settlement optimistic {#optimistic-settlement}

I rollup optimistic presumono che le transazioni siano valide per impostazione predefinita e si affidano a prove di frode per la risoluzione delle controversie.

* **Sistema di prova**: prove di frode interattive
* **Finestra di contestazione**: 604.800 secondi (predefinita, 7 giorni). **Prima della v3.2.4:** la catena la converte in blocchi a un rapporto fisso di 6 secondi per blocco, **100.800 blocchi**, quindi il tempo reale trascorso dipende dal tempo di blocco effettivo (circa 3,7 giorni con gli attuali blocchi da ≈3,1 s della mainnet); pianifica in blocchi, non in giorni. **Dalla v3.2.4:** per un batch inviato dall'altezza dell'upgrade in poi, la finestra è misurata in secondi di tempo di blocco (7 giorni pieni). Un batch inviato prima mantiene la regola del conteggio dei blocchi. La testnet ha applicato la v3.2.4 all'altezza 8.337.253 (19 ottobre 2026); la mainnet l'ha applicata all'altezza 3.742.566 (23 ottobre 2026, proposta di governance 13). Il valore predefinito configurato sulla testnet è più breve, 3.600 secondi (1 ora), quindi un rollup sulla testnet si finalizza più in fretta dei 7 giorni qui descritti.
* **Cauzione di contestazione**: 1.000 QOR (1.000.000.000 uqor) — necessaria per inviare una contestazione tramite prova di frode (preset `nft` e `custom`; i preset `defi`, `gaming` ed `enterprise` non impostano alcuna cauzione perché non hanno una finestra di contestazione)
* **Finalità**: ritardata fino allo scadere della finestra di contestazione senza alcuna contestazione valida
* **Finalizzazione automatica**: l'`EndBlocker` finalizza automaticamente i batch una volta trascorsa la finestra di contestazione senza dispute. Un batch contestato non viene mai finalizzato automaticamente: deve prima essere risolto, da qualsiasi account (dalla v3.2.5, sulla mainnet dal 29 ottobre 2026 e sulla testnet dal 26 ottobre; prima della v3.2.5 solo il creatore del rollup poteva farlo) (vedi [Distribuire un Rollup](/rollups/deploying-a-rollup#challenge-a-batch-optimistic-rollups)).

**Ciclo di vita del batch**:

```
Submitted → [challenge window expires] → Finalized
Submitted → [fraud proof submitted] → Challenged → Rejected
```

### Settlement ZK (Zero-Knowledge) {#zk-zero-knowledge-settlement}

I rollup ZK forniscono prove di validità crittografiche che garantiscono la correttezza della transizione di stato.

* **Sistema di prova**: SNARK (Groth16 su BLS12-381) o STARK (trasparente, senza setup fidato)
* **Finalità**: istantanea alla verifica della prova — non è richiesta alcuna finestra di contestazione
* **Dimensione massima della prova**: 1 MB (1.048.576 byte)
* **Profondità di ricorsione**: profondità di aggregazione delle prove configurabile (predefinita: 1)
* **Maturità**: i batch SNARK vengono verificati on-chain (Groth16 su BLS12-381) rispetto a una verifying key memorizzata insieme al rollup. **Il settlement ZK non può ancora essere usato su nessuna delle due reti:** la catena non ha modo di registrare una verifying key per un rollup, quindi ogni batch ZK viene rifiutato dopo che la sua commissione è stata pagata. La registrazione delle chiavi è pianificata per la versione di catena v3.2.7. La verifica STARK è sperimentale: è opt-in e controlla un circuito dimostrativo, non la transizione di stato del tuo rollup. Considera il settlement ZK non pronto per la produzione.

**Ciclo di vita del batch**:

```
Submitted + valid proof → Finalized (instant)
```

### Settlement based

I rollup based delegano il sequencing delle transazioni ai proposer L1 (QoreChain), ereditando le garanzie di liveness e di resistenza alla censura della chain host.

* **Sistema di prova**: nessuno richiesto — i proposer L1 sono la fonte di verità
* **Sequencer**: deve utilizzare la modalità sequencer `based` (imposta dalla validazione)
* **Finalità**: conferma a 2 blocchi su QoreChain
* **Ritardo di inclusione**: blocchi configurabili prima dell'inclusione forzata delle transazioni del rollup
* **Condivisione della priority fee**: percentuale configurabile delle priority fee pagate ai proposer L1

**Ciclo di vita del batch**:

```
Submitted → [2 L1 blocks] → Finalized (auto)
```

### Settlement sovereign

I rollup sovereign operano con un consenso indipendente e gestiscono autonomamente il sequencing delle proprie transazioni. Ancorano lo stato a QoreChain per la verificabilità, ma non dipendono dalla chain host per la finalità.

* **Sistema di prova**: nessuno
* **Finalità**: indipendente — determinata dal consenso proprio del rollup
* **Ancoraggio dello stato**: le radici di stato vengono pubblicate su QoreChain per trasparenza e verificabilità, ma non vengono imposte
* **Finalizzazione automatica**: nessuna — i rollup sovereign gestiscono la propria finalità

---

## Compatibilità dei sistemi di prova

| Modalità di settlement | Prove di frode |      SNARK |      STARK |    Nessuna |
| ---------------------- | -------------: | ---------: | ---------: | ---------: |
| **Optimistic**         |      Richieste |         -- |         -- |         -- |
| **ZK**                 |             -- | Supportata | Supportata |         -- |
| **Based**              |             -- |         -- |         -- |  Richiesta |
| **Sovereign**          |             -- |         -- |         -- |  Richiesta |

La verifica STARK è sperimentale e il settlement ZK non è pronto per la produzione; vedi la nota sulla maturità del [settlement ZK](#zk-zero-knowledge-settlement) sopra.

---

## Profili preimpostati

L'RDK include **cinque profili preimpostati** che forniscono configurazioni di rollup pronte all'uso, ottimizzate per casi d'uso comuni. Ogni preset raggruppa un paradigma di settlement, una modalità di sequencer, un backend di disponibilità dei dati, un modello di gas e una VM ottimizzati per il proprio dominio target:

| Profilo          | Settlement (prova)       | Sequencer | DA              | Modello di gas    | VM      | Caso d'uso target |
| ---------------- | ------------------------ | --------- | --------------- | ------------ | ------- | --------------- |
| **`defi`**       | zk (SNARK)               | dedicated | native          | EIP-1559     | EVM     | Applicazioni di trading, prestito e in stile AMM |
| **`gaming`**     | based                    | based     | native          | flat         | custom  | Stato di gioco ed economie in-game ad alto throughput e bassa latenza |
| **`nft`**        | optimistic (fraud)       | dedicated | native (Celestia DA pianificata) | standard | QoreChain Native | Minting di NFT, marketplace e oggetti da collezione digitali |
| **`enterprise`** | based                    | based     | native          | subsidized   | EVM     | Deployment permissioned e di consorzio con fee sponsorizzate |
| **`custom`**     | completamente parametrizzato      | completamente parametrizzato | completamente parametrizzato | completamente parametrizzato | completamente parametrizzato | Ogni campo è definito dall'utente |

Il profilo `custom` lascia ogni campo da impostare a te. I valori esatti raggruppati in ciascun preset possono evolvere man mano che l'RDK matura; interroga la configurazione live con `qorechaind query rdk config` (o `RdkClient.params()` da `@qorechain/rdk`) per i parametri autorevoli di ogni preset, e nota che il settlement `based` si abbina sempre alla modalità sequencer `based`.

---

## Modalità di sequencer

Il sequencer determina chi ordina le transazioni all'interno di un blocco del rollup.

:::note Cosa viene imposto oggi
On-chain, un batch può essere inviato solo dall'indirizzo del sequencer configurato per il rollup oppure, quando non ne è impostato nessuno (è il caso di ogni preset), dal suo creatore. Le modalità `shared` e `based` sono registrate nella configurazione del rollup, ma QoreChain non ammette ancora un elenco di sequencer condivisi né i proposer L1 come mittenti di batch; tali modalità descrivono il design previsto.
:::

### Sequencer dedicated

Un singolo operatore esegue il sequencing di tutte le transazioni del rollup.

* **Operatore**: singolo indirizzo designato
* **Latenza**: la più bassa possibile — ordinamento da parte di un singolo soggetto
* **Fiducia**: richiede fiducia nell'operatore del sequencer per la liveness e l'equità nell'ordinamento

### Sequencer shared

Un insieme di sequencer ordina collettivamente le transazioni.

* **Stato**: oggi è solo un'etichetta — l'elenco non è ancora ammesso on-chain (vedi la nota sopra)
* **Dimensione minima dell'insieme**: configurabile (predefinita: 1)
* **Latenza**: leggermente superiore a causa del coordinamento multi-soggetto
* **Fiducia**: distribuita sull'insieme di sequencer

### Sequencer based

I proposer L1 di QoreChain eseguono il sequencing delle transazioni del rollup.

* **Stato**: oggi è solo un'etichetta — i proposer L1 non sono ancora ammessi come mittenti di batch (vedi la nota sopra)
* **Ritardo di inclusione**: blocchi configurabili prima dell'inclusione forzata (predefinita: 10)
* **Condivisione della priority fee**: percentuale configurabile delle priority fee pagate ai proposer L1
* **Fiducia**: eredita la sicurezza dell'insieme di validatori di QoreChain e la resistenza alla censura
* **Requisito**: la modalità di settlement based richiede il sequencer based (imposto in fase di validazione)

---

## Backend di disponibilità dei dati

### DA native

Archiviazione di blob on-chain in un KV-store all'interno di QoreChain stessa.

:::caution Ancora nessun modo pubblico per pubblicare un blob
Il modulo definisce l'archiviazione, la conservazione e il pruning dei blob, ma nelle versioni attuali non esiste alcun messaggio di transazione per pubblicare un blob. Un batch che indica un hash di dati su un rollup `native` o `both` viene rifiutato perché non è possibile archiviare alcun blob corrispondente. Vedi [Disponibilità dei Dati](/rollups/data-availability). Con la disponibilità dei dati nativa, un batch deve quindi lasciare `data_hash` vuoto; il client RDK (0.7.0) lo fa, e la catena rifiuta un batch che ne dichiari uno.
:::

| Parametro                    | Valore                                                                                                                      |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Dimensione massima del blob** | 2 MB (2.097.152 byte)                                                                                                    |
| **Periodo di conservazione** | 432.000 blocchi (circa 16 giorni con gli attuali blocchi da ≈3,1 s della mainnet; il valore varia con il tempo di blocco)   |
| **Pruning automatico**       | I blob scaduti vengono rimossi nell'`EndBlocker` — i dati vengono eliminati ma i metadati di commitment vengono conservati  |
| **Commitment**               | Hash SHAKE-256 (32 byte) dei dati del blob                                                                                  |

### Celestia DA

Disponibilità dei dati basata su IBC che utilizza il livello DA dedicato di Celestia.

* **Stato**: in stub nella versione attuale — restituisce un errore se selezionato come unico backend
* **Supporto namespace**: i namespace specifici del rollup sono supportati nello schema dei blob
* **Pianificato**: integrazione IBC completa con l'invio e la verifica dei blob di Celestia

### Both (Ridondante)

Archivia i blob simultaneamente su entrambi i backend Native e Celestia.

* Nella versione attuale viene effettivamente archiviato solo il blob native; per il componente Celestia viene registrato un avviso.

---

## Ciclo di vita del rollup

```
Pending → Active → Paused → Active → Stopped
                      ↑                  |
                      └──────────────────┘
                      (can resume from paused,
                       stopped is permanent)
```

| Stato       | Descrizione                                                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Pending** | Rollup registrato ma non ancora attivato                                                                                             |
| **Active**  | Il rollup è live ed elabora i batch                                                                                                  |
| **Paused**  | Sospeso temporaneamente dal creatore (può riprendere)                                                                                |
| **Stopped** | Dismesso permanentemente — ciò che resta dell'escrow del creatore viene restituito (vedi [Registro dell'escrow](#escrow-ledger))     |

Alla creazione, lo stato del rollup viene impostato su `Active` immediatamente dopo che l'escrow dello stake e il burn di creazione hanno avuto successo (la registrazione del livello viene tentata ma non è bloccante). Solo il creatore può mettere in pausa, riprendere o fermare un rollup (imposto a partire dalla versione di catena v3.2.0).

---

## Ciclo di vita del batch

I batch di settlement tracciano la progressione di stato delle radici di stato del rollup:

```
Submitted → Finalized                              (happy path)
Submitted → Challenged → Rejected                  (fraud detected)
```

| Stato          | Descrizione                                                    |
| -------------- | -------------------------------------------------------------- |
| **Submitted**  | Batch pubblicato su QoreChain, in attesa di finalizzazione     |
| **Challenged** | Contestazione tramite prova di frode inviata (solo optimistic) |
| **Finalized**  | Batch accettato come canonico                                  |
| **Rejected**   | Batch invalidato da una contestazione riuscita                 |

Comportamento di RDK 0.6.1 e successive (la 0.7.0 è l'attuale): per un rollup optimistic il client costruisce un batch la cui radice di stato è la radice di transizione canonica della catena (`batchTransitionRoot` nell'RDK), non un valore libero a tua scelta.

### Regole di finalizzazione automatica

| Modalità di settlement | Trigger di finalizzazione                                                                                                                                       |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Optimistic**         | 100.800 blocchi dopo l'invio (finestra predefinita) senza alcuna contestazione; per i batch inviati dalla v3.2.4 (testnet dall'altezza 8.337.253; mainnet dall'altezza 3.742.566, 23 ottobre 2026), 604.800 secondi di tempo di blocco |
| **ZK**                 | Istantanea all'invio di una prova valida                                                                                                                        |
| **Based**              | 2 blocchi L1 dopo l'invio                                                                                                                                       |
| **Sovereign**          | Nessuna — gestita dal consenso proprio del rollup                                                                                                               |

La finalizzazione automatica viene eseguita nell'`EndBlocker` per i rollup optimistic e based. I batch ZK vengono finalizzati inline durante l'invio del batch.

---

## Parametri del modulo

| Parametro                   |                             Predefinito | Descrizione                                                     |
| --------------------------- | --------------------------------------: | --------------------------------------------------------------- |
| `max_rollups`               |                              100 (testnet: 200) | Numero massimo di rollup che possono essere registrati          |
| `min_stake_for_rollup`      |        10.000.000.000 uqor (10.000 QOR) | Stake minimo richiesto per creare un rollup                     |
| `rollup_creation_burn_rate` |                        0.01 (1%)        | Frazione dello stake di creazione bruciata tramite `x/burn`     |
| `default_challenge_window`  | 604.800 s (testnet: 3.600 s) | Finestra di contestazione optimistic predefinita; prima della v3.2.4 la catena la convertiva in 100.800 blocchi |
| `max_da_blob_size`          |                 2.097.152 byte (2 MB)   | Dimensione massima del blob di disponibilità dei dati           |
| `blob_retention_blocks`     |                       432.000 blocchi   | Blocchi prima del pruning dei blob DA                           |
| `max_batches_per_block`     |                                      10 | Numero massimo di batch di settlement elaborati per blocco      |

---

## Integrazione multilivello

Il modulo RDK si integra con `x/multilayer` per la gestione dello stato cross-layer:

### Registrazione del livello {#layer-registration}

Quando viene creato un rollup, il modulo registra per esso un livello tramite `RegisterSidechain`, quindi on-chain il tipo di livello è **`sidechain`**, parte con stato `proposed`, conta ai fini del limite di sidechain di multilayer (`max_sidechains`, predefinito **10**) e blocca il `min_sidechain_stake` del creatore (1.000 QOR). La registrazione include:

* ID del livello (corrisponde all'ID del rollup)
* Tempo di blocco target e numero massimo di transazioni per blocco
* Tipi di VM e domini supportati
* Intervallo di settlement

La registrazione è **non fatale**: se fallisce (saldo insufficiente o limite raggiunto), il rollup viene comunque creato, ma non ha alcun livello e non può essere ancorato. Un anchor di regolamento non richiede che il livello sia `active`: il livello registrato da un rollup RDK resta `proposed` ed è comunque ancorabile dal suo creatore (vedi [Invio dell'anchor](/architecture/multilayer-architecture#anchor-submission)).

### Ancoraggio dello stato {#state-anchoring}

Un batch di settlement può essere ancorato a `x/multilayer`, che registra l'ID del livello, l'altezza del livello (l'indice del batch), la radice di stato, l'hash dell'insieme di validatori e il conteggio delle transazioni sotto una firma post-quantistica del creatore del rollup.

* **Dalla v3.2.2 (attiva su mainnet e testnet):** `MsgSubmitBatch` ha due campi facoltativi. `anchor_signature` è la firma ML-DSA-87 del creatore sui **byte di firma dell'anchor v2** del batch (vedi [Lettura degli anchor](/architecture/multilayer-architecture#reading-anchors)); quando è presente il batch viene ancorato in `x/multilayer` nella **stessa transazione**, e un anchor rifiutato rifiuta il batch. `validator_set_hash` è l'impegno sull'insieme di validatori del rollup, riportato nell'anchor e coperto dalla firma. Da CLI: `qorechaind query rdk anchor-sign-bytes <layer-id> <batch-index> <state-root-hex> --chain-id <id> --tx-count <n>` stampa i byte da firmare (`<layer-id>` è l'id del layer del rollup, che coincide con l'id del rollup per i rollup creati tramite l'RDK), e `tx rdk submit-batch ... --anchor-signature <hex> --validator-set-hash <hex>` li invia.
* **Senza la firma** il batch viene regolato senza anchor, esattamente come prima. Un client che non invia il campo produce batch senza anchor, quindi verifica che il toolkit che usi lo supporti: il `@qorechain/rdk` TypeScript 0.6.0 firma l'anchor quando il suo client firma in modalità ibrida ed è il creatore del rollup (altrimenti invia senza anchor), mentre i client Python, Go, Rust e Java non costruiscono il campo. Su nessuna delle due reti esiste ancora alcun rollup, livello o anchor, quindi nessun anchor è stato scritto e quel percorso non è stato testato dal vivo.

Vedi [Ricevute di Settlement](/rollups/settlement-receipts) per ciò che un anchor dimostra e ciò che non dimostra.

---

## Registro dell'escrow e prelievi {#escrow-ledger}

L'escrow di tutti i rollup si trova in un unico saldo di modulo condiviso. Dalla **v3.2.3** (altezza mainnet 3.662.051, 20 ottobre 2026) un **registro dell'escrow** per rollup è l'unica contabilità di ciò che ciascun rollup detiene in quel pool:

* `create-rollup` accredita al registro l'escrow che il rollup conserva effettivamente: lo stake meno il burn di creazione dell'1%.
* Un prelievo (`tx rdk execute-withdrawal`) e una ricompensa per una prova di frode vengono pagati dal registro e addebitati su di esso. Un prelievo superiore a ciò che il rollup detiene ancora viene rifiutato con un errore di escrow insufficiente.
* `stop-rollup` rimborsa solo ciò che resta nel registro e lo azzera. Un rollup fermato non paga ulteriori prelievi.
* La `RollupView` di sola lettura restituita dalle query sui rollup riporta `escrow_balance`: gli uqor ancora detenuti per quel rollup.

Prima della v3.2.3 il registro veniva accreditato con zero, quindi ogni prelievo falliva in modo chiuso; `execute-withdrawal` può quindi riuscire sulla mainnet solo dalla v3.2.3 in poi. I controlli che un client dovrebbe eseguire prima di pagare una commissione: il denom deve essere esattamente `uqor`, l'importo deve essere positivo, la prova di Merkle ha al massimo 64 livelli con ogni nodo fratello di esattamente 32 byte, e chi invia e il destinatario devono essere indirizzi `qor1…` validi. Un prelievo richiede inoltre un batch finalizzato che abbia registrato una `withdrawals_root`, e ogni foglia di prelievo può essere pagata una sola volta.

## Lettura dello stato RDK {#reading-state}

Le query RDK sono servite via REST su mainnet e testnet sotto `/qorechain/rdk/v1/`:

| Route | Restituisce |
| --- | --- |
| `/params` | Parametri del modulo (la tabella sopra) |
| `/rollups` e `/rollup/{rollup_id}` | Record dei rollup, incluso `escrow_balance` |
| `/batches/{rollup_id}` | Batch, paginati (`start_index`, `limit` predefinito 50, al massimo 100, `next_index`) |
| `/batch/{rollup_id}/{batch_index}` e `/latest_batch/{rollup_id}` | Un batch, oppure il più recente |
| `/blob/{rollup_id}/{blob_index}` | Metadati del blob, incluso `expires_at_height` (i byte del blob non vengono restituiti) |

`qorechaind query rdk config` stampa i parametri del modulo (la route è `/params`; non esiste una route `/config`). Gli id di rollup e di livello devono rispettare la grammatica degli id descritta in [ID di livello e di rollup](/architecture/multilayer-architecture#id-grammar), applicata dalla v3.2.2.

---

## Integrazione del burn

Alla creazione del rollup, **l'1% dell'importo dello stake** viene bruciato tramite il modulo `x/burn` attraverso il canale di burn `rollup_create`. Per esempio, la creazione di un rollup con lo stake minimo di 10.000 QOR brucia permanentemente 100 QOR. I restanti 9.900 QOR vengono mantenuti in escrow e, quando il rollup viene fermato, ciò che ne resta viene restituito al creatore (i prelievi e le ricompense per le prove di frode pagati dall'escrow riducono il rimborso). Il burn alla creazione è imposto a partire dalla versione di catena v3.2.0; le versioni precedenti non lo applicavano.
