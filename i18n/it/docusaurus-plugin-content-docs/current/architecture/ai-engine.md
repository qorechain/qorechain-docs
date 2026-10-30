---
slug: /architecture/ai-engine
title: Motore AI
sidebar_label: Motore AI
sidebar_position: 4
---

# Motore AI

QoreChain integra funzionalità di AI a più livelli dello stack di protocollo tramite il modulo `x/ai`. Il livello on-chain fornisce un'analisi euristica deterministica adatta a operazioni critiche per il consenso, mentre un sidecar off-chain estende le capacità con modelli di deep learning per consulenza e strumenti per sviluppatori.

## Architettura a tre livelli

Il motore QCAI (QoreChain AI) opera su tre livelli:

| Livello                  | Ambito                                                                               | Esecuzione                                        | Deterministico |
| ------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------- | -------------- |
| **Livello consenso**     | Produzione dei blocchi, regolazione dei parametri                                    | On-chain (x/rlconsensus) — oggi solo osservazione | Sì             |
| **Livello rete**         | Instradamento delle transazioni, rilevamento frodi, ottimizzazione delle commissioni | On-chain (x/ai)                                   | Sì             |
| **Livello applicazione** | Generazione di contratti, auditing, analisi approfondita                             | Off-chain (sidecar)                               | No             |

Il livello di consenso è documentato separatamente in [Motore di Consenso PRISM](/architecture/prism-consensus-engine). Questa pagina copre i livelli di rete e applicazione.

:::note Cosa viene applicato sulle reti attive (verificato il 23 ottobre 2026, mainnet e testnet allora entrambe sulla v3.2.4; la testnet è passata nel frattempo alla v3.2.6 e la mainnet alla v3.2.5)
Due parti di `x/ai` agiscono oggi sulle transazioni, sia sulla corsia Cosmos sia sulla corsia EVM:

* Un **limite di frequenza per mittente**. Il limite attivo è di **600 transazioni al minuto per mittente** (`max_tx_per_minute`; la corsia EVM ha un proprio limite facoltativo, che non è impostato, quindi si applica lo stesso valore). Il "minuto" è contato su una finestra fissa di blocchi, non sul tempo reale, perché l'altezza del blocco è l'unico orologio condiviso da tutti i validatori. Un mittente che ha raggiunto il limite si vede rifiutare le transazioni successive finché quelle più vecchie non escono dalla finestra. Il limite è applicato sulla corsia Cosmos dalla v3.2.0 e su entrambe le corsie dalla v3.2.2.
* Un **punteggio di anomalia** per ogni transazione. L'`anomaly_action` attiva è `flag`: un punteggio alto emette un evento `ai_anomaly_check` e conta la transazione come segnalata, ma non la rifiuta. Rifiutare in base al punteggio è un'impostazione di governance che non è abilitata.

Tutto il resto di questa pagina (il router, la pipeline antifrode a sei livelli, l'ottimizzatore delle commissioni, l'ottimizzatore di rete, il sidecar) descrive analisi e consulenza: nulla di tutto ciò modifica quali transazioni la catena accetta, e la pipeline a sei livelli non viene chiamata dal percorso delle transazioni. Leggi le impostazioni attive con `qorechaind query ai config` e i contatori con `qorechaind query ai stats`.
:::

## Router delle transazioni

Il router potenziato dall'AI seleziona i validatori e i percorsi ottimali per ogni transazione utilizzando un punteggio multi-fattoriale ponderato.

### Formula di ottimizzazione

```
OptimalRoute = argmin_r( alpha * Latency(r) + beta * Cost(r) + gamma * Security(r)^-1 )
```

| Peso      | Simbolo | Predefinito | Descrizione                                                                                               |
| --------- | ------- | ----------- | --------------------------------------------------------------------------------------------------------- |
| Latenza   | alpha   | 0.4         | Tempo di risposta normalizzato (0=migliore, 1=peggiore). 0ms corrisponde a 0.0, 1000ms a 1.0.            |
| Costo     | beta    | 0.3         | Percentuale di carico attuale come proxy del costo.                                                       |
| Sicurezza | gamma   | 0.3         | Inverso del punteggio di reputazione. Una reputazione più alta produce un punteggio più basso (migliore). |

Il router mantiene una **cache delle metriche** (TTL predefinito: 30 secondi) con dati di performance per validatore, inclusi latenza media, percentuale di uptime, percentuale di carico e punteggio di reputazione. Quando le metriche memorizzate nella cache non sono disponibili, il sistema ricade sul router euristico.

### Confidenza dell'instradamento

La confidenza scala con il numero di validatori che dispongono di metriche disponibili:

| Validatori con metriche | Confidenza |
| ----------------------- | ---------- |
| >= 10                   | 0.95       |
| >= 5                    | 0.85       |
| >= 2                    | 0.75       |
| 1                       | 0.60       |

## Rilevamento frodi

Il rilevatore di frodi implementa una **pipeline di rilevamento a sei livelli** che analizza ogni transazione rispetto alla cronologia recente utilizzando metodi statistici.

### Livelli di rilevamento

| Livello | Rilevatore              | Metodo                                                                             | Soglia di attivazione                                              |
| ------- | ----------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 1       | **Isolation Forest**    | Z-score statistico su caratteristiche di importo, gas e frequenza del mittente     | Punteggio di anomalia > 0.7                                        |
| 2       | **Sequence Analyzer**   | Rileva schemi alternati di invio/ricezione (wash trading)                          | > 3 trasferimenti alternati tra la stessa coppia                   |
| 3       | **Sybil Detector**      | Traccia nuovi indirizzi univoci; segnala picchi di nuovi mittenti                  | > 30% delle transazioni recenti da nuovi indirizzi                 |
| 4       | **DDoS Detector**       | Monitora la frequenza delle transazioni per mittente                               | > 100 transazioni al minuto da un singolo mittente                 |
| 5       | **Flash Loan Detector** | Identifica schemi prestito-manipolazione-rimborso all'interno di un singolo blocco | >= 3 transazioni nello stesso blocco con varianza di importo > 10x |
| 6       | **Exploit Detector**    | Segnala un consumo di gas anomalo nelle chiamate ai contratti                      | > 5x del gas medio per lo stesso tipo di transazione               |

### Classificazione delle minacce

| Intervallo di confidenza | Livello di minaccia |
| ------------------------ | ------------------- |
| >= 0.9                   | Critico             |
| >= 0.7                   | Alto                |
| >= 0.5                   | Medio               |
| >= 0.3                   | Basso               |
| &lt; 0.3                 | Nessuno             |

### Azioni di risposta

| Livello di minaccia | Confidenza | Azione                                                                 |
| ------------------- | ---------- | ---------------------------------------------------------------------- |
| Critico             | > 0.8      | `circuit_break` — Sospende l'esecuzione di contratti specifici         |
| Critico             | &lt;= 0.8  | `rate_limit` — Riduce temporaneamente l'accettazione di TX dalla fonte |
| Alto                | > 0.7      | `rate_limit`                                                           |
| Alto                | &lt;= 0.7  | `alert` — Emette un evento per validatori e operatori                  |
| Medio               | Qualsiasi  | `alert`                                                                |
| Basso / Nessuno     | Qualsiasi  | `allow`                                                                |

Quando viene attivata un'azione diversa da `allow`, la pipeline crea un record di indagine sulla frode con un ID univoco (formato: `INV-{block_height}-{txhash}`, troncato a 48 caratteri). Sulle reti attive la pipeline non viene chiamata dal percorso delle transazioni (vedi la nota all'inizio di questa pagina), quindi oggi non viene prodotto alcun record di indagine e la pipeline non imposta alcun circuit breaker sui contratti.

## Ottimizzatore delle commissioni

L'ottimizzatore delle commissioni prevede la congestione della rete e suggerisce le commissioni ottimali per i tempi di conferma desiderati utilizzando il tracciamento della congestione con media mobile esponenziale (EMA).

### Previsione della congestione

* **Fattore di smoothing EMA (alpha)**: 0.2
* **Finestra cronologica**: 100 blocchi
* **Analisi della tendenza**: Confronta i 5 blocchi più recenti con i 5 blocchi precedenti per rilevare le tendenze di congestione, quindi proietta in avanti con uno smorzamento del 50%.

### Livelli di urgenza

| Urgenza  | Moltiplicatore base | Conferma stimata |
| -------- | ------------------- | ---------------- |
| `fast`   | 2.0x                | 1-2 blocchi      |
| `normal` | 1.0x                | 3-5 blocchi      |
| `slow`   | 0.5x                | 6-10 blocchi     |

La commissione finale incorpora un **moltiplicatore di congestione** (1.0x allo 0% di congestione, fino a 5.0x al 100% di congestione) e un **premio di tendenza** quando la congestione prevista supera quella attuale. La commissione minima propria dello stimatore è una costante legacy di 500 uqor; non è esposta sulle reti attive, e la commissione che una transazione deve effettivamente pagare è fissata dal floor di rete di 0.1 uqor per unità di gas (vedi [Prima transazione](/getting-started/first-transaction#send-qor)).

## Ottimizzatore di rete

L'ottimizzatore di rete monitora continuamente le metriche di performance e genera raccomandazioni sui parametri di governance utilizzando una funzione di ricompensa multi-obiettivo.

### Funzione di ricompensa

```
R(s, a, s') = alpha * DeltaPerformance + beta * DeltaLatency + gamma * DeltaEnergy - delta * StabilityPenalty
```

| Peso  | Valore | Obiettivo                       |
| ----- | ------ | ------------------------------- |
| alpha | 0.35   | Miglioramento delle performance |
| beta  | 0.30   | Riduzione della latenza         |
| gamma | 0.15   | Risparmio di energia/risorse    |
| delta | 0.20   | Preservazione della stabilità   |

### Tipi di raccomandazione

L'ottimizzatore genera raccomandazioni per:

* **Limite di gas del blocco**: Aumenta quando l'utilizzo è > 80%, diminuisce quando è &lt; 20%
* **Tasso minimo di commissione**: Riduce quando il numero di validatori è inferiore a 5
* **Numero massimo di validatori**: Aumenta quando i tempi dei blocchi sono sani e sono attivi >= 10 validatori
* **Tempo target del blocco**: Avvisa quando il tempo medio del blocco supera gli 8 secondi

Ogni raccomandazione include il valore attuale, il valore suggerito, l'impatto previsto, il punteggio di confidenza e la motivazione.

## Sidecar AI

Il Sidecar QCAI estende l'AI on-chain con modelli di deep learning off-chain supportati dal QCAI Backend. Il sidecar è opzionale e non critico per il consenso, ed è raggiungibile tramite un'interfaccia gRPC interna.

### Capacità

| Capacità                             | Descrizione                                                                             |
| ------------------------------------ | --------------------------------------------------------------------------------------- |
| **Generazione di contratti**         | Genera smart contract da specifiche in linguaggio naturale su 17 piattaforme            |
| **Auditing dei contratti**           | Analisi approfondita della sicurezza del codice degli smart contract                    |
| **Analisi approfondita delle frodi** | Indagine estesa sulle frodi tramite modelli addestrati (integra le euristiche on-chain) |
| **Consulenza sulla rete**            | Raccomandazioni avanzate di ottimizzazione dei parametri                                |

### Modelli

| Nome del modello | Caso d'uso                                                                |
| ---------------- | ------------------------------------------------------------------------- |
| QCAI Fast        | Risposte a bassa latenza per la stima delle commissioni e l'instradamento |
| QCAI Balanced    | Analisi approfondita per l'auditing e le indagini sulle frodi             |

Il sidecar viene eseguito come servizio off-chain indipendente, in modo che i carichi di lavoro di deep learning non blocchino né influenzino mai l'esecuzione critica per il consenso.

## Precompilati EVM

Due contratti precompilati espongono le capacità di AI on-chain agli smart contract EVM:

| Precompilato     | Indirizzo | Descrizione                                                                               |
| ---------------- | --------- | ----------------------------------------------------------------------------------------- |
| `aiRiskScore`    | `0x0B01`  | Restituisce un punteggio di rischio (0-100) per un dato indirizzo o hash di transazione   |
| `aiAnomalyCheck` | `0x0B02`  | Restituisce un flag booleano di anomalia e un punteggio di confidenza per una transazione |

:::warning Non ancora attivo
Questi due precompilati **non sono attivi** sulla mainnet (`qorechain-vladi`) né sulla testnet (`qorechain-diana`), verificato il 27 ottobre 2026; una chiamata restituisce dati vuoti. (Altri tre precompilati QoreChain, la coppia PQC e i parametri PRISM, sono attivi solo sulla testnet.) Verranno attivati solo dopo aver ottenuto un percorso di scoring in sola lettura e a virgola fissa. Vedi [Precompilati EVM: stato della rete](/developer-guide/evm-precompiles#network-status).
:::

**Importante**: I precompilati EVM utilizzano **esclusivamente il motore euristico deterministico**. Non chiamano mai il sidecar, garantendo che tutta l'esecuzione EVM rimanga completamente deterministica e riproducibile. Dalla v3.2.3 il precompilato di controllo delle anomalie analizza una transazione senza scrivere stato; l'altro rafforzamento dei precompilati in quella release (il bridge CrossVM che rifiuta `STATICCALL`, misura la propria chiamata annidata sul gas del frame chiamante e raggiunge solo target QoreChain Native in allowlist) si applica una volta attivato il precompilato CrossVM. Al 27 ottobre 2026 l'elenco `active_static_precompiles` è vuoto sulla mainnet; sulla testnet contiene tre voci (PQC Verify `0x…0A01`, PQC Key Status `0x…0A02` e PRISM Consensus Params `0x…0C01`), nessuna delle quali è un precompilato di IA.

## Attestazione TEE

Il modulo AI definisce le interfacce per l'attestazione del **Trusted Execution Environment**, abilitando la futura esecuzione verificabile di modelli AI all'interno di enclave hardware sicure.

### Piattaforme supportate

| Piattaforma | Identificatore | Descrizione                                            |
| ----------- | -------------- | ------------------------------------------------------ |
| Intel SGX   | `sgx`          | Software Guard Extensions                              |
| Intel TDX   | `tdx`          | Trust Domain Extensions                                |
| AMD SEV-SNP | `sev-snp`      | Secure Encrypted Virtualization - Secure Nested Paging |
| ARM CCA     | `arm-cca`      | Confidential Compute Architecture                      |

### Flusso di attestazione

1. **Carica i pesi del modello** — Il sidecar carica i pesi del modello AI in un'enclave TEE.
2. **Esegui l'inferenza all'interno dell'enclave** — L'inferenza viene eseguita all'interno della memoria protetta dell'enclave.
3. **Produci un report di attestazione** — L'enclave produce un report di attestazione che vincola l'hash del modello, l'hash dell'input e l'hash dell'output.
4. **Verifica l'attestazione on-chain** — I validatori verificano l'attestazione on-chain prima di accettare i risultati dell'inferenza.

L'attestazione TEE è attualmente nella fase di specifica dell'interfaccia. L'implementazione è prevista per una versione futura.

## Apprendimento federato

Il modulo AI definisce le interfacce per il coordinamento dell'**apprendimento federato on-chain**, in cui i nodi validatori addestrano modelli locali e inviano aggiornamenti del gradiente che vengono aggregati in un modello globale senza condividere i dati di addestramento grezzi.

### Metodi di aggregazione

| Metodo     | Descrizione                                                                       |
| ---------- | --------------------------------------------------------------------------------- |
| `fedavg`   | Federated Averaging — media ponderata dei gradienti in base al numero di campioni |
| `fedprox`  | Federated Proximal — aggiunge un termine prossimale per gestire dati eterogenei   |
| `scaffold` | SCAFFOLD — usa variabili di controllo per correggere il drift del client          |

### Ciclo di vita di un round

```
Pending --> Training --> Aggregating --> Complete
                                    \-> Failed (timeout or insufficient participants)
```

Ogni round è configurato con un numero minimo/massimo di partecipanti, timeout, learning rate, norma di clipping del gradiente e un moltiplicatore di rumore opzionale per la privacy differenziale. Tutti gli invii di gradiente sono firmati con firme PQC (Dilithium-5).

L'apprendimento federato è attualmente nella fase di specifica dell'interfaccia. L'implementazione è prevista per una versione futura.

## Query

`qorechaind query ai config` e `qorechaind query ai stats` (gRPC) sono le query del modulo. Oggi il modulo non ha route REST: le route `/ai/v1/...` per stima delle commissioni, indagini sulle frodi, raccomandazioni di rete e circuit breaker non sono servite né sulla mainnet né sulla testnet.

## Correlati

* [Motore di Consenso PRISM](/architecture/prism-consensus-engine) — il livello AI progettato per l'ottimizzazione del consenso (oggi solo osservazione).
* [Smart Contract Creator](/dashboard/smart-contract-creator) — generazione di contratti assistita dall'AI nella Dashboard.
* [Contract Auditor](/dashboard/contract-auditor) — revisione della sicurezza dei contratti assistita dall'AI.
