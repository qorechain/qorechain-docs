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
Le query vengono eseguite sul nodo indicato da `--node`. Usa un endpoint RPC mainnet **`qorechain-vladi`** (versione della chain **v3.1.92**) per i dati live, oppure un endpoint testnet **`qorechain-diana`** per i test. Il valore predefinito `tcp://localhost:26657` punta a un nodo eseguito da te.
:::

I flag comuni si applicano a ogni sottocomando `query`:

| Flag       | Tipo   | Descrizione                                          |
| ---------- | ------ | ---------------------------------------------------- |
| `--node`   | string | Endpoint RPC (predefinito: `tcp://localhost:26657`)  |
| `--output` | string | Formato di output: `json` o `text`                   |
| `--height` | int    | Interroga lo stato a una specifica altezza di blocco |

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

Elenca tutte le proposte, con filtro opzionale per stato.

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

Interroga lo stato di registrazione della chiave PQC di un account.

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

Interroga lo stato di migrazione della chiave PQC di un account.

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

Interroga la posizione di staking xQORE di un indirizzo.

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

Interroga il tasso di inflazione annualizzato corrente.

```bash
qorechaind query inflation rate
```

### epoch

Interroga il numero dell'epoca corrente e il suo avanzamento.

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

Interroga la configurazione del modulo AI.

```bash
qorechaind query ai config
```

### stats

Interroga le statistiche aggregate di elaborazione AI.

```bash
qorechaind query ai stats
```

### fee-estimate

Ottieni una stima delle commissioni gas assistita dall'AI.

```bash
qorechaind query ai fee-estimate [flags]
```

| Flag        | Tipo   | Descrizione                      |
| ----------- | ------ | -------------------------------- |
| `--tx-type` | string | Tipo di transazione per la stima |
| `--urgency` | string | `low`, `medium`, `high`          |

### investigations

Elenca le indagini antifrode attive.

```bash
qorechaind query ai investigations
```

### recommendations

Ottieni raccomandazioni di ottimizzazione della rete generate dall'AI.

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
| `--status` | string | Filtro: `pending`, `completed`, `failed` |
| `--chain`  | string | Filtra per ID della chain                |

### limits

Interroga i limiti di velocità (rate limit) di una chain collegata tramite bridge.

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

Interroga i dettagli di uno specifico layer.

```bash
qorechaind query multilayer layer <layer_id>
```

### layers

Elenca tutti i layer registrati.

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

| Flag         | Tipo   | Descrizione                            |
| ------------ | ------ | -------------------------------------- |
| `--layer-id` | string | Filtra per ID del layer                |
| `--limit`    | uint   | Numero massimo di risultati restituiti |

### routing-stats

Interroga le statistiche di instradamento delle transazioni tra i layer.

```bash
qorechaind query multilayer routing-stats
```

### simulate-route

Simula l'instradamento di una transazione senza eseguirla.

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
| `--status` | string | Filtro: `active`, `paused`, `stopped` |

### batch

Interroga uno specifico batch di regolamento.

```bash
qorechaind query rdk batch <rollup_id> <batch_index>
```

### latest-batch

Interroga il batch più recente di un rollup.

```bash
qorechaind query rdk latest-batch <rollup_id>
```

### suggest-profile

Ottieni una raccomandazione di profilo rollup assistita dall'AI.

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
Anche le prove di prelievo dei rollup e lo stato di regolamento sono interrogabili nel gruppo `rdk`. I sottocomandi di query esatti e i loro argomenti dipendono dal tipo di regolamento del tuo rollup; consulta la documentazione del **Rollup Development Kit** per la superficie di query autorevole su prelievi/regolamenti.
:::

---

## rlconsensus

PRISM è il layer di reinforcement learning che ottimizza i parametri di consenso. Il nome del modulo CLI `rlconsensus` e i suoi sottocomandi sono mantenuti invariati.

### agent-status

Interroga lo stato e la modalità correnti dell'agente PRISM.

```bash
qorechaind query rlconsensus agent-status
```

### observation

Interroga il vettore di osservazione PRISM più recente.

```bash
qorechaind query rlconsensus observation
```

### reward

Interroga le metriche cumulative di ricompensa PRISM.

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

Interroga la posizione di staking BTC di un indirizzo.

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

### permission-schema

Interroga la tassonomia canonica dei permessi degli authenticator — gli 11 permessi, la mappa messaggio→permesso e i messaggi di gestione delle chiavi non delegabili (disponibile a partire dalla versione della chain **v3.1.85**; servita anche via REST su `/qorechain/abstractaccount/v1/permission_schema`).

```bash
qorechaind query abstractaccount permission-schema
```

### auth-keygen / auth-sign-cosmos / auth-sign-evm

Strumenti di supporto per costruire autorizzazioni degli authenticator al di fuori degli SDK: genera una chiave di test, oppure produci **esattamente i sign bytes che la chain verifica** per un'azione delegata sulla corsia Native o sulla corsia EVM (disponibili a partire dalla versione della chain **v3.1.85**).

```bash
qorechaind query abstractaccount auth-keygen
qorechaind query abstractaccount auth-sign-cosmos <account> <to> <amount> <nonce>
qorechaind query abstractaccount auth-sign-evm <account> <to> <value> <data_hex> <nonce>
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
