---
slug: /cli-reference/query-commands
title: Comandi di query
sidebar_label: Comandi di query
sidebar_position: 3
---

# Comandi di query

Tutti i comandi di query seguono lo schema:

```bash
qorechaind query <module> <command> [args] [flags]
```

:::note
Le query vengono eseguite sul nodo a cui punta `--node`. Usa un endpoint RPC della mainnet **`qorechain-vladi`** (versione della chain **v3.1.80**) per i dati live, oppure un endpoint della testnet **`qorechain-diana`** per i test. Il valore predefinito `tcp://localhost:26657` punta a un nodo che esegui tu stesso.
:::

I flag comuni si applicano a ogni sottocomando `query`:

| Flag       | Tipo   | Descrizione                                     |
| ---------- | ------ | ----------------------------------------------- |
| `--node`   | string | Endpoint RPC (predefinito: `tcp://localhost:26657`) |
| `--output` | string | Formato di output: `json` o `text`                 |
| `--height` | int    | Interroga lo stato a una specifica altezza di blocco          |

---

## bank

### balances

Interroga tutti i saldi di un account.

```bash
qorechaind query bank balances <address>
```

### total

Interroga l'offerta totale di tutti i token.

```bash
qorechaind query bank total
```

---

## staking

### validator

Interroga un singolo validatore tramite l'indirizzo operatore.

```bash
qorechaind query staking validator <validator_address>
```

### validators

Elenca tutti i validatori.

```bash
qorechaind query staking validators
```

### delegation

Interroga una delega da un delegante a un validatore.

```bash
qorechaind query staking delegation <delegator_address> <validator_address>
```

### delegations

Interroga tutte le deleghe di un delegante.

```bash
qorechaind query staking delegations <delegator_address>
```

### unbonding-delegation

Interroga una delega in fase di unbonding.

```bash
qorechaind query staking unbonding-delegation <delegator_address> <validator_address>
```

---

## distribution

### rewards

Interroga tutte le ricompense di delega di un delegante.

```bash
qorechaind query distribution rewards <delegator_address>
```

### commission

Interroga la commissione di un validatore.

```bash
qorechaind query distribution commission <validator_address>
```

---

## gov

### proposal

Interroga una singola proposta tramite ID.

```bash
qorechaind query gov proposal <proposal_id>
```

### proposals

Elenca tutte le proposte, opzionalmente filtrate per stato.

```bash
qorechaind query gov proposals [flags]
```

| Flag       | Tipo   | Descrizione                                                               |
| ---------- | ------ | ------------------------------------------------------------------------- |
| `--status` | string | Filtra per stato: `deposit_period`, `voting_period`, `passed`, `rejected` |

### votes

Interroga i voti su una proposta.

```bash
qorechaind query gov votes <proposal_id>
```

---

## pqc

### account

Interroga lo stato di registrazione della chiave PQC per un account.

```bash
qorechaind query pqc account <address>
```

### algorithms

Elenca tutti gli algoritmi PQC supportati.

```bash
qorechaind query pqc algorithms
```

### algorithm

Interroga i dettagli di uno specifico algoritmo PQC.

```bash
qorechaind query pqc algorithm <algorithm_name>
```

### stats

Interroga le statistiche aggregate di registrazione PQC.

```bash
qorechaind query pqc stats
```

### params

Interroga i parametri del modulo PQC.

```bash
qorechaind query pqc params
```

### migration

Interroga lo stato di migrazione della chiave PQC per un account.

```bash
qorechaind query pqc migration <address>
```

### hybrid-mode

Interroga la modalità corrente di applicazione delle firme ibride.

```bash
qorechaind query pqc hybrid-mode
```

---

## xqore

### position

Interroga la posizione di staking xQORE per un indirizzo.

```bash
qorechaind query xqore position <address>
```

### params

Interroga i parametri del modulo xQORE.

```bash
qorechaind query xqore params
```

---

## burn

### stats

Interroga le statistiche di burn su tutti i canali.

```bash
qorechaind query burn stats
```

### params

Interroga i parametri del modulo burn.

```bash
qorechaind query burn params
```

---

## inflation

### rate

Interroga l'attuale tasso di inflazione annualizzato.

```bash
qorechaind query inflation rate
```

### epoch

Interroga il numero dell'epoca corrente e l'avanzamento.

```bash
qorechaind query inflation epoch
```

### params

Interroga i parametri del modulo inflation.

```bash
qorechaind query inflation params
```

---

## ai

### config

Interroga la configurazione del modulo IA.

```bash
qorechaind query ai config
```

### stats

Interroga le statistiche aggregate di elaborazione dell'IA.

```bash
qorechaind query ai stats
```

### fee-estimate

Ottiene una stima della gas fee assistita dall'IA.

```bash
qorechaind query ai fee-estimate [flags]
```

| Flag        | Tipo   | Descrizione                     |
| ----------- | ------ | ------------------------------- |
| `--tx-type` | string | Tipo di transazione per la stima |
| `--urgency` | string | `low`, `medium`, `high`         |

### investigations

Elenca le indagini sulle frodi attive.

```bash
qorechaind query ai investigations
```

### recommendations

Ottiene raccomandazioni di ottimizzazione della rete generate dall'IA.

```bash
qorechaind query ai recommendations
```

### circuit-breakers

Interroga gli stati correnti dei circuit breaker.

```bash
qorechaind query ai circuit-breakers
```

---

## reputation

### validators

Interroga i punteggi di reputazione di tutti i validatori.

```bash
qorechaind query reputation validators
```

### validator

Interroga il punteggio di reputazione di uno specifico validatore.

```bash
qorechaind query reputation validator <validator_address>
```

---

## bridge

### chains

Elenca tutte le chain bridge registrate.

```bash
qorechaind query bridge chains
```

### chain

Interroga i dettagli di una specifica chain collegata tramite bridge.

```bash
qorechaind query bridge chain <chain_id>
```

### validators

Elenca i validatori bridge attivi.

```bash
qorechaind query bridge validators
```

### operations

Elenca le operazioni bridge recenti.

```bash
qorechaind query bridge operations
```

| Flag       | Tipo   | Descrizione                              |
| ---------- | ------ | ---------------------------------------- |
| `--status` | string | Filtra: `pending`, `completed`, `failed` |
| `--chain`  | string | Filtra per chain ID                       |

### limits

Interroga i limiti di velocità per una chain collegata tramite bridge.

```bash
qorechaind query bridge limits <chain_id>
```

### estimate

Stima la commissione del bridge e il tempo di trasferimento.

```bash
qorechaind query bridge estimate <chain_id> <amount> <asset>
```

---

## crossvm

### message

Recupera un messaggio cross-VM tramite ID.

```bash
qorechaind query crossvm message <message_id>
```

### pending

Elenca i messaggi cross-VM in sospeso.

```bash
qorechaind query crossvm pending
```

### params

Interroga i parametri del modulo Cross-VM.

```bash
qorechaind query crossvm params
```

---

## svm

### account

Interroga le informazioni di un account SVM.

```bash
qorechaind query svm account <pubkey>
```

### program

Interroga le informazioni di un programma SVM distribuito.

```bash
qorechaind query svm program <program_id>
```

### params

Interroga i parametri del modulo SVM.

```bash
qorechaind query svm params
```

### slot

Interroga il numero di slot SVM corrente.

```bash
qorechaind query svm slot
```

---

## multilayer

### layer

Interroga i dettagli di uno specifico livello.

```bash
qorechaind query multilayer layer <layer_id>
```

### layers

Elenca tutti i livelli registrati.

```bash
qorechaind query multilayer layers
```

### anchor

Interroga uno specifico record di ancoraggio.

```bash
qorechaind query multilayer anchor <anchor_id>
```

### anchors

Elenca gli invii di ancoraggio recenti.

```bash
qorechaind query multilayer anchors [flags]
```

| Flag         | Tipo   | Descrizione               |
| ------------ | ------ | ------------------------- |
| `--layer-id` | string | Filtra per ID del livello        |
| `--limit`    | uint   | Numero massimo di risultati da restituire |

### routing-stats

Interroga le statistiche di instradamento delle transazioni tra i livelli.

```bash
qorechaind query multilayer routing-stats
```

### simulate-route

Simula l'instradamento di una transazione senza esecuzione.

```bash
qorechaind query multilayer simulate-route <tx_data_hex>
```

### params

Interroga i parametri del modulo Multilayer.

```bash
qorechaind query multilayer params
```

---

## rdk

### rollup

Interroga i dettagli di uno specifico rollup.

```bash
qorechaind query rdk rollup <rollup_id>
```

### rollups

Elenca tutti i rollup registrati.

```bash
qorechaind query rdk rollups
```

| Flag       | Tipo   | Descrizione                           |
| ---------- | ------ | ------------------------------------- |
| `--status` | string | Filtra: `active`, `paused`, `stopped` |

### batch

Interroga uno specifico batch di settlement.

```bash
qorechaind query rdk batch <rollup_id> <batch_index>
```

### latest-batch

Interroga l'ultimo batch di un rollup.

```bash
qorechaind query rdk latest-batch <rollup_id>
```

### suggest-profile

Ottiene una raccomandazione di profilo rollup assistita dall'IA.

```bash
qorechaind query rdk suggest-profile <use_case>
```

### blob

Interroga uno specifico blob DA.

```bash
qorechaind query rdk blob <rollup_id> <blob_index>
```

### params

Interroga i parametri del modulo RDK.

```bash
qorechaind query rdk params
```

:::note
Le prove di prelievo dei rollup e lo stato di settlement sono interrogabili anch'essi nel gruppo `rdk`. Gli esatti sottocomandi di query e i relativi argomenti dipendono dal tipo di settlement del tuo rollup; consulta la documentazione **Rollup Development Kit** per la superficie autorevole delle query di prelievo/settlement.
:::

---

## rlconsensus

PRISM è il livello di reinforcement-learning che ottimizza i parametri di consenso. Il nome del modulo CLI `rlconsensus` e i suoi sottocomandi sono mantenuti alla lettera.

### agent-status

Interroga lo stato e la modalità correnti dell'agente PRISM.

```bash
qorechaind query rlconsensus agent-status
```

### observation

Interroga l'ultimo vettore di osservazione di PRISM.

```bash
qorechaind query rlconsensus observation
```

### reward

Interroga le metriche di ricompensa cumulative di PRISM.

```bash
qorechaind query rlconsensus reward
```

### params

Interroga i parametri del modulo PRISM Consensus.

```bash
qorechaind query rlconsensus params
```

### policy

Interroga la configurazione della policy PRISM attiva.

```bash
qorechaind query rlconsensus policy
```

---

## babylon

### staking

Interroga la posizione di staking BTC per un indirizzo.

```bash
qorechaind query babylon staking <address>
```

### checkpoint

Interroga i dati del checkpoint BTC per una data epoca.

```bash
qorechaind query babylon checkpoint <epoch>
```

### params

Interroga i parametri del modulo Babylon.

```bash
qorechaind query babylon params
```

---

## abstractaccount

### account

Interroga i dettagli di un abstract account.

```bash
qorechaind query abstractaccount account <address>
```

### params

Interroga i parametri del modulo Abstract Account.

```bash
qorechaind query abstractaccount params
```

---

## gasabstraction

### accepted-tokens

Elenca i token accettati per il pagamento del gas.

```bash
qorechaind query gasabstraction accepted-tokens
```

### params

Interroga i parametri del modulo Gas Abstraction.

```bash
qorechaind query gasabstraction params
```

---

## fairblock

### config

Interroga la configurazione di cifratura FairBlock.

```bash
qorechaind query fairblock config
```

### params

Interroga i parametri del modulo FairBlock.

```bash
qorechaind query fairblock params
```
