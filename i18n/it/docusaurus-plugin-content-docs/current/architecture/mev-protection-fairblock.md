---
slug: /architecture/mev-protection-fairblock
title: Protezione MEV (FairBlock)
sidebar_label: Protezione MEV (FairBlock)
sidebar_position: 10
---

# Protezione MEV (FairBlock)

Il modulo `x/fairblock` implementa la difesa di QoreChain contro gli attacchi MEV (Maximal Extractable Value) utilizzando la crittografia a soglia basata sull'identità. Combinata con un sistema di prioritizzazione delle transazioni a 5 corsie, questa crea un'architettura anti-MEV completa che protegge gli utenti da front-running, attacchi sandwich e altre forme di estrazione di valore basate sul mempool.

## Il problema MEV

Il MEV si verifica quando i proponenti dei blocchi o gli osservatori sfruttano l'**asimmetria informativa** nel mempool delle transazioni. Poiché le transazioni in attesa sono visibili prima dell'inclusione, gli avversari possono:

* **Front-run**: Inserire una transazione prima di uno scambio redditizio individuato
* **Attacco sandwich**: Inserire transazioni prima e dopo lo scambio di una vittima per estrarre valore dallo slippage di prezzo
* **Back-run**: Inserire una transazione immediatamente dopo un'opportunità individuata

Questi attacchi estraggono valore dagli utenti comuni e minano l'equità nella DeFi, negli scambi di token e nel minting di NFT.

## Framework tIBE di FairBlock

QoreChain affronta il MEV attraverso la **crittografia a soglia basata sull'identità (tIBE)**, uno schema crittografico in cui:

1. **Crittografia**: Gli utenti crittografano le proprie transazioni prima della trasmissione. Le transazioni crittografate sono **opache** — proponenti, validatori e osservatori del mempool non possono leggerne il contenuto.
2. **Inclusione**: I proponenti includono le transazioni crittografate nei blocchi senza conoscerne il contenuto. Poiché i dati sono illeggibili, l'asimmetria informativa viene eliminata.
3. **Decrittografia**: Dopo che una transazione è stata committata in un blocco, un numero soglia di validatori contribuisce con quote di decrittografia. Una volta raggiunta la soglia, la transazione viene decrittografata ed eseguita.

Questo approccio garantisce che nessuna singola parte possa decrittografare una transazione prima che sia stata committata in modo irreversibile, eliminando il vettore di attacco MEV alla radice.

### Struttura della transazione crittografata

Ogni transazione crittografata contiene:

| Campo            | Descrizione                                       |
| ---------------- | ------------------------------------------------ |
| `encrypted_data` | Payload della transazione crittografato con tIBE |
| `sender`         | Indirizzo del mittente della transazione (visibile per l'instradamento) |
| `target_height`  | Altezza del blocco in cui deve avvenire la decrittografia |
| `submitted_at`   | Timestamp della crittografia                      |

### Quote di decrittografia

I validatori contribuiscono con quote di decrittografia per le transazioni committate:

| Campo        | Descrizione                           |
| ------------ | ------------------------------------- |
| `validator`  | Indirizzo del validatore che contribuisce |
| `tx_id`      | ID della transazione crittografata    |
| `share_data` | La quota della chiave di decrittografia del validatore |
| `height`     | Altezza del blocco di invio della quota |

## Stato dell'implementazione

Nell'attuale release di testnet, il modulo FairBlock è un'**implementazione stub**:

* L'ante handler `FairBlockDecorator` è collegato alla pipeline di elaborazione delle transazioni ma **lascia passare** tutte le transazioni senza modifiche.
* Quando `enabled` è `false` (il valore predefinito), il decorator delega immediatamente al gestore successivo nella catena.
* L'attivazione completa di tIBE è prevista per una release futura, in attesa di una cerimonia di chiavi dei validatori per stabilire i parametri di crittografia a soglia.

### Configurazione di FairBlock

| Parametro            | Predefinito  | Descrizione                                      |
| -------------------- | ------------ | ------------------------------------------------ |
| `enabled`            | `false`      | Interruttore principale per la crittografia tIBE |
| `tibe_threshold`     | 5            | Numero di quote di decrittografia dei validatori richieste |
| `decryption_delay`   | 3 blocchi    | Blocchi dopo l'inclusione prima dell'inizio della decrittografia |
| `max_encrypted_size` | 65.536 byte  | Dimensione massima di un payload di transazione crittografato |

## Prioritizzazione delle transazioni a 5 corsie

QoreChain implementa un'architettura del mempool a 5 corsie che categorizza le transazioni per tipo e assegna a ciascuna corsia un livello di priorità e un'allocazione di spazio nel blocco.

### Configurazione delle corsie

| Corsia      |     Priorità  | Spazio nel blocco | Tipo di transazione                              |
| ----------- | ------------: | ----------------: | ------------------------------------------------ |
| **PQC**     | 100 (massima) |               15% | Transazioni con firme ibride post-quantistiche   |
| **MEV**     |            90 |               20% | Transazioni crittografate con tIBE di FairBlock  |
| **AI**      |            80 |               15% | Transazioni valutate dall'AI e ottimizzate sulle commissioni |
| **Default** |            50 |               40% | Transazioni standard                             |
| **Free**    |   10 (minima) |               10% | Transazioni con gas astratto e sponsorizzate     |

### Descrizione delle corsie

**Corsia PQC** (Priorità 100, 15% dello spazio nel blocco)\
Le transazioni firmate con firme crittografiche ibride post-quantistiche ricevono la priorità più alta. Ciò incentiva l'adozione della firma delle transazioni quantum-safe e garantisce che le operazioni protette da PQC non vengano mai escluse durante la congestione.

**Corsia MEV** (Priorità 90, 20% dello spazio nel blocco)\
Le transazioni crittografate con tIBE ricevono la seconda priorità più alta e l'allocazione riservata più ampia. Ciò garantisce che gli utenti che scelgono la protezione MEV abbiano spazio nel blocco garantito, incoraggiando l'adozione diffusa dello schema di crittografia.

**Corsia AI** (Priorità 80, 15% dello spazio nel blocco)\
Le transazioni che sono state valutate o ottimizzate dal sistema di rilevamento delle anomalie AI ricevono una priorità elevata. Ciò include le transazioni contrassegnate come operazioni legittime ad alto valore o quelle con strutture di commissioni ottimizzate dall'AI.

**Corsia Default** (Priorità 50, 40% dello spazio nel blocco)\
Transazioni standard senza alcuna classificazione speciale. Questa corsia riceve la maggiore allocazione assoluta di spazio nel blocco per gestire il normale traffico di rete.

**Corsia Free** (Priorità 10, 10% dello spazio nel blocco)\
Transazioni con gas astratto e sponsorizzate. Questa corsia abilita esperienze utente a zero commissioni in cui una terza parte (applicazione, protocollo o relayer) sponsorizza il costo del gas. La bassa priorità e lo spazio limitato nel blocco prevengono gli abusi pur supportando i casi d'uso dell'astrazione del gas.

### Stato dell'implementazione

La configurazione delle corsie è **solo dati** nell'attuale release di testnet. Le definizioni delle corsie (priorità, allocazione di spazio nel blocco) vengono registrate all'inizializzazione dell'applicazione, ma il riordinamento effettivo del mempool tramite `PrepareProposal` e `ProcessProposal` è una milestone futura. Attualmente, tutte le transazioni vengono elaborate in ordine standard indipendentemente dall'assegnazione della corsia.

## Effetto anti-MEV combinato

1. **Livello 1: Crittografia (tIBE)** — Le transazioni vengono crittografate prima di entrare nel mempool. I proponenti non possono leggerne il contenuto, quindi non c'è alcuna informazione da estrarre.
2. **Livello 2: Prioritizzazione (corsie)** — Le transazioni crittografate della corsia MEV ottengono il 20% di spazio nel blocco riservato. La priorità 90 garantisce l'inclusione anche durante la congestione.
3. **Livello 3: Decrittografia a soglia** — Solo dopo il commit del blocco i validatori rivelano le quote di decrittografia. Il requisito della soglia impedisce a qualsiasi singolo validatore la decrittografia anticipata.

Risultato: l'asimmetria informativa viene eliminata in ogni fase del ciclo di vita della transazione, dalla trasmissione all'esecuzione.

Questo approccio è nettamente superiore agli schemi di decrittografia con ritardo temporale o di commit-reveal a singola parte, perché il requisito della soglia distribuisce la fiducia sull'intero insieme dei validatori.
