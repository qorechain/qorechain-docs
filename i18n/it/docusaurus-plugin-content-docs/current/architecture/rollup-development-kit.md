---
slug: /architecture/rollup-development-kit
title: Rollup Development Kit
sidebar_label: Rollup Development Kit
sidebar_position: 12
---

# Rollup Development Kit

Il modulo `x/rdk` fornisce un completo Rollup Development Kit (RDK) che consente agli sviluppatori di distribuire rollup specifici per applicazione su QoreChain. Supporta quattro paradigmi di settlement, diverse modalità di sequencer, backend di disponibilità dei dati collegabili e ottimizzazione della configurazione assistita dall'IA.

---

## Paradigmi di settlement

QoreChain RDK supporta quattro distinte modalità di settlement — **optimistic**, **zk**, **based** e **sovereign** — ciascuna con diverse assunzioni di fiducia, caratteristiche di finalità e requisiti di prova.

### Settlement optimistic

I rollup optimistic presumono che le transazioni siano valide per impostazione predefinita e si affidano a prove di frode per la risoluzione delle controversie.

* **Sistema di prova**: prove di frode interattive
* **Finestra di contestazione**: 7 giorni (604.800 secondi), configurabile per ogni rollup
* **Cauzione di contestazione**: 1.000 QOR (1.000.000.000 uqor) — necessaria per inviare una contestazione tramite prova di frode
* **Finalità**: ritardata fino allo scadere della finestra di contestazione senza alcuna contestazione valida
* **Finalizzazione automatica**: l'`EndBlocker` finalizza automaticamente i batch una volta trascorsa la finestra di contestazione senza dispute

**Ciclo di vita del batch**:

```
Submitted → [challenge window expires] → Finalized
Submitted → [fraud proof submitted] → Challenged → Rejected
```

### Settlement ZK (Zero-Knowledge) {#zk-zero-knowledge-settlement}

I rollup ZK forniscono prove di validità crittografiche che garantiscono la correttezza della transizione di stato.

* **Sistema di prova**: SNARK (Groth16, PLONK) o STARK (trasparente, senza setup fidato)
* **Finalità**: istantanea alla verifica della prova — non è richiesta alcuna finestra di contestazione
* **Dimensione massima della prova**: 1 MB (1.048.576 byte)
* **Profondità di ricorsione**: profondità di aggregazione delle prove configurabile (predefinita: 1)
* **Maturità**: nella versione attuale, il settlement ZK utilizza una verifica stub che accetta qualsiasi prova non vuota. La verifica completa delle prove SNARK/STARK è un aggiornamento pianificato e deve essere considerata non ancora consolidata per la produzione.

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

| Modalità di settlement | Prove di frode |     SNARK |     STARK |     Nessuna |
| --------------- | -----------: | --------: | --------: | -------: |
| **Optimistic**  |     Richieste |        -- |        -- |       -- |
| **ZK**          |           -- | Supportata | Supportata |       -- |
| **Based**       |           -- |        -- |        -- | Richiesta |
| **Sovereign**   |           -- |        -- |        -- | Richiesta |

La verifica completa delle prove STARK e ZK è ancora in fase di maturazione; vedi la nota sulla maturità del [settlement ZK](#zk-zero-knowledge-settlement) sopra.

---

## Profili preimpostati

L'RDK include **cinque profili preimpostati** che forniscono configurazioni di rollup pronte all'uso, ottimizzate per casi d'uso comuni. Ogni preset raggruppa un paradigma di settlement, una modalità di sequencer, un backend di disponibilità dei dati, un modello di gas e una VM ottimizzati per il proprio dominio target:

| Profilo          | Settlement (prova)       | Sequencer | DA              | Modello di gas    | VM      | Caso d'uso target |
| ---------------- | ------------------------ | --------- | --------------- | ------------ | ------- | --------------- |
| **`defi`**       | zk (SNARK)               | dedicated | native          | EIP-1559     | EVM     | Applicazioni di trading, prestito e in stile AMM |
| **`gaming`**     | based                    | based     | native          | flat         | custom  | Stato di gioco ed economie in-game ad alto throughput e bassa latenza |
| **`nft`**        | optimistic (fraud)       | dedicated | native (Celestia DA pianificata) | standard | CosmWasm | Minting di NFT, marketplace e oggetti da collezione digitali |
| **`enterprise`** | based                    | based     | native          | subsidized   | EVM     | Deployment permissioned e di consorzio con fee sponsorizzate |
| **`custom`**     | completamente parametrizzato      | completamente parametrizzato | completamente parametrizzato | completamente parametrizzato | completamente parametrizzato | Ogni campo è definito dall'utente |

Il profilo `custom` lascia ogni campo da impostare a te. I valori esatti raggruppati in ciascun preset possono evolvere man mano che l'RDK matura; interroga la configurazione live con `qorechaind query rdk config` (o `RdkClient.params()` da `@qorechain/rdk`) per i parametri autorevoli di ogni preset, e nota che il settlement `based` si abbina sempre alla modalità sequencer `based`.

---

## Modalità di sequencer

Il sequencer determina chi ordina le transazioni all'interno di un blocco del rollup.

### Sequencer dedicated

Un singolo operatore esegue il sequencing di tutte le transazioni del rollup.

* **Operatore**: singolo indirizzo designato
* **Latenza**: la più bassa possibile — ordinamento da parte di un singolo soggetto
* **Fiducia**: richiede fiducia nell'operatore del sequencer per la liveness e l'equità nell'ordinamento

### Sequencer shared

Un insieme di sequencer ordina collettivamente le transazioni.

* **Dimensione minima dell'insieme**: configurabile (predefinita: 1)
* **Latenza**: leggermente superiore a causa del coordinamento multi-soggetto
* **Fiducia**: distribuita sull'insieme di sequencer

### Sequencer based

I proposer L1 di QoreChain eseguono il sequencing delle transazioni del rollup.

* **Ritardo di inclusione**: blocchi configurabili prima dell'inclusione forzata (predefinita: 10)
* **Condivisione della priority fee**: percentuale configurabile delle priority fee pagate ai proposer L1
* **Fiducia**: eredita la sicurezza dell'insieme di validatori di QoreChain e la resistenza alla censura
* **Requisito**: la modalità di settlement based richiede il sequencer based (imposto in fase di validazione)

---

## Backend di disponibilità dei dati

### DA native

Archiviazione di blob on-chain in un KV-store all'interno di QoreChain stessa.

| Parametro            | Valore                                                                                               |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| **Dimensione massima del blob**    | 2 MB (2.097.152 byte)                                                                              |
| **Periodo di conservazione** | 432.000 blocchi (\~30 giorni con blocchi da 6 secondi)                                                       |
| **Pruning automatico**     | I blob scaduti vengono rimossi nell'`EndBlocker` — i dati vengono eliminati ma i metadati di commitment vengono conservati  |
| **Commitment**       | Hash SHA-256 dei dati del blob                                                                           |

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

| Stato       | Descrizione                                                  |
| ----------- | ------------------------------------------------------------ |
| **Pending** | Rollup registrato ma non ancora attivato                      |
| **Active**  | Il rollup è live ed elabora i batch                        |
| **Paused**  | Sospeso temporaneamente dal creatore (può riprendere)                   |
| **Stopped** | Dismesso permanentemente — la cauzione di stake viene restituita al creatore  |

Alla creazione, lo stato del rollup viene impostato su `Active` immediatamente dopo che l'escrow dello stake e la registrazione del livello hanno avuto successo.

---

## Ciclo di vita del batch

I batch di settlement tracciano la progressione di stato delle radici di stato del rollup:

```
Submitted → Finalized                              (happy path)
Submitted → Challenged → Rejected                  (fraud detected)
```

| Stato          | Descrizione                                       |
| -------------- | ------------------------------------------------- |
| **Submitted**  | Batch pubblicato su QoreChain, in attesa di finalizzazione  |
| **Challenged** | Contestazione tramite prova di frode inviata (solo optimistic) |
| **Finalized**  | Batch accettato come canonico                       |
| **Rejected**   | Batch invalidato da una contestazione riuscita     |

### Regole di finalizzazione automatica

| Modalità di settlement | Trigger di finalizzazione                                        |
| --------------- | ----------------------------------------------------------- |
| **Optimistic**  | La finestra di contestazione scade (\~7 giorni) senza alcuna contestazione valida |
| **ZK**          | Istantanea all'invio di una prova valida                           |
| **Based**       | 2 blocchi L1 dopo l'invio                                |
| **Sovereign**   | Nessuna — gestita dal consenso proprio del rollup                |

La finalizzazione automatica viene eseguita nell'`EndBlocker` per i rollup optimistic e based. I batch ZK vengono finalizzati inline durante l'invio del batch.

---

## Parametri del modulo

| Parametro                   |                          Predefinito | Descrizione                                      |
| --------------------------- | -------------------------------: | ------------------------------------------------ |
| `max_rollups`               |                              100 | Numero massimo di rollup che possono essere registrati |
| `min_stake_for_rollup`      | 10.000.000.000 uqor (10.000 QOR) | Stake minimo richiesto per creare un rollup        |
| `rollup_creation_burn_rate` |                        0.01 (1%) | Frazione dello stake di creazione bruciata tramite `x/burn`   |
| `default_challenge_window`  |         604.800 secondi (7 giorni) | Finestra di contestazione optimistic predefinita              |
| `max_da_blob_size`          |           2.097.152 byte (2 MB) | Dimensione massima del blob di disponibilità dei dati              |
| `blob_retention_blocks`     |              432.000 (\~30 giorni) | Blocchi prima del pruning dei blob DA                 |
| `max_batches_per_block`     |                               10 | Numero massimo di batch di settlement elaborati per blocco   |

---

## Integrazione multilivello

Il modulo RDK si integra con `x/multilayer` per la gestione dello stato cross-layer:

### Registrazione del livello

Quando viene creato un rollup, esso viene automaticamente registrato come livello sidechain tramite `RegisterSidechain`. La registrazione include:

* ID del livello (corrisponde all'ID del rollup)
* Tempo di blocco target e numero massimo di transazioni per blocco
* Tipi di VM e domini supportati
* Intervallo di settlement

La registrazione è **non fatale**: se la registrazione in `x/multilayer` fallisce, il rollup viene comunque creato e viene registrato un avviso.

### Ancoraggio dello stato

Ogni batch di settlement inviato all'RDK viene ancorato a `x/multilayer` tramite `AnchorState`. Questo registra:

* ID del livello e altezza del livello (indice del batch)
* Radice di stato
* Conteggio delle transazioni

L'ancoraggio è **non fatale**: i fallimenti vengono registrati ma non impediscono l'elaborazione del batch.

---

## Integrazione del burn

Alla creazione del rollup, **l'1% dell'importo dello stake** viene bruciato tramite il modulo `x/burn` attraverso il canale di burn `rollup_create`. Per esempio, la creazione di un rollup con lo stake minimo di 10.000 QOR brucia permanentemente 100 QOR. I restanti 9.900 QOR vengono mantenuti in escrow e restituiti quando il rollup viene fermato.
