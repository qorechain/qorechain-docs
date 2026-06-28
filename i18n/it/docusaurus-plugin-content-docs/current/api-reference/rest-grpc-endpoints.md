---
slug: /api-reference/rest-grpc-endpoints
title: Endpoint REST / gRPC
sidebar_label: Endpoint REST / gRPC
sidebar_position: 1
---

# Endpoint REST / gRPC

QoreChain espone tre interfacce principali per l'accesso programmatico:

| Interfaccia | Porta predefinita | Protocollo | Descrizione                        |
| ----------- | ----------------- | ---------- | ---------------------------------- |
| REST        | `1317`            | HTTP/1.1   | API REST LCD (Light Client Daemon) |
| gRPC        | `9090`            | HTTP/2     | Servizio gRPC codificato in Protobuf |
| RPC         | `26657`           | HTTP + WS  | RPC del motore di consenso di QoreChain |

Tutti gli endpoint REST restituiscono JSON. Gli endpoint gRPC utilizzano i Protocol Buffers e possono essere consumati con qualsiasi client gRPC. L'interfaccia RPC fornisce query a livello di consenso e il broadcast delle transazioni.

:::note
Queste interfacce sono disponibili sia sulla mainnet **`qorechain-vladi`** (attiva dal 7 giugno 2026 sulla versione di chain **v3.1.80**) sia sulla testnet **`qorechain-diana`**. Gli URL di base riportati di seguito presuppongono un nodo in esecuzione locale; sostituisci l'host della mainnet o della testnet del tuo provider per l'accesso remoto.
:::

## URL di base

```
REST:  http://localhost:1317
gRPC:  localhost:9090
RPC:   http://localhost:26657
```

## Modulo AI

| Metodo | Endpoint                           | Descrizione                                        |
| ------ | ---------------------------------- | -------------------------------------------------- |
| GET    | `/ai/v1/config`                    | Restituisce la configurazione corrente del modulo AI |
| GET    | `/ai/v1/stats`                     | Statistiche aggregate di elaborazione AI           |
| GET    | `/ai/v1/fee-estimate`              | Stima delle commissioni di gas assistita dall'AI per una transazione |
| GET    | `/ai/v1/fraud/investigations`      | Elenca tutte le indagini sulle frodi attive        |
| GET    | `/ai/v1/fraud/investigations/{id}` | Restituisce i dettagli di una specifica indagine sulle frodi |
| GET    | `/ai/v1/network/recommendations`   | Raccomandazioni di ottimizzazione della rete generate dall'AI |
| GET    | `/ai/v1/circuit-breakers`          | Stati e soglie correnti dei circuit breaker        |

## Modulo Bridge {#bridge-module}

A partire dalla versione di chain **v3.1.77**, lo stato di sola lettura del modulo bridge è esposto via REST tramite grpc-gateway sotto il prefisso `/qorechain/bridge/v1/...` (in precedenza solo gRPC). Questi endpoint forniscono JSON on-chain reali su HTTP per explorer e telemetria di light-node. La `config` del bridge riporta ad esempio `min_validators=10` e `threshold=7`.

| Metodo | Endpoint                                   | Descrizione                              |
| ------ | ------------------------------------------ | ---------------------------------------- |
| GET    | `/qorechain/bridge/v1/config`              | Configurazione corrente del modulo bridge |
| GET    | `/qorechain/bridge/v1/chains`              | Elenca tutte le chain bridge registrate  |
| GET    | `/qorechain/bridge/v1/chains/{chain_id}`   | Dettagli di una specifica chain collegata via bridge |
| GET    | `/qorechain/bridge/v1/validators`          | Elenca i validatori bridge registrati    |
| GET    | `/qorechain/bridge/v1/validators/{address}`| Dettagli di uno specifico validatore bridge |
| GET    | `/qorechain/bridge/v1/operations`          | Elenca le operazioni bridge              |
| GET    | `/qorechain/bridge/v1/operations/{id}`     | Dettagli di una specifica operazione bridge |

I seguenti endpoint con percorso più breve rimangono disponibili:

| Metodo | Endpoint                            | Descrizione                                    |
| ------ | ----------------------------------- | ---------------------------------------------- |
| GET    | `/bridge/v1/chains`                 | Elenca tutte le chain bridge registrate        |
| GET    | `/bridge/v1/chains/{id}`            | Dettagli di una specifica chain collegata via bridge |
| GET    | `/bridge/v1/validators`             | Elenca i validatori bridge attivi              |
| GET    | `/bridge/v1/operations`             | Elenca le operazioni bridge recenti            |
| GET    | `/bridge/v1/operations/{id}`        | Dettagli di una specifica operazione bridge    |
| GET    | `/bridge/v1/locked/{chain}/{asset}` | Valore totale bloccato per una coppia chain/asset |
| GET    | `/bridge/v1/limits/{chain}`         | Limiti di frequenza e soglie per una chain collegata via bridge |
| GET    | `/bridge/v1/estimate`               | Stima la commissione del bridge e il tempo di trasferimento |

## Modulo PQC

| Metodo | Endpoint                     | Descrizione                                    |
| ------ | ---------------------------- | ---------------------------------------------- |
| GET    | `/pqc/v1/params`             | Parametri correnti del modulo PQC              |
| GET    | `/pqc/v1/accounts/{address}` | Stato delle chiavi PQC per un account specifico |
| GET    | `/pqc/v1/stats`              | Statistiche aggregate di registrazione e migrazione PQC |

## Modulo Reputation

| Metodo | Endpoint                              | Descrizione                               |
| ------ | ------------------------------------- | ----------------------------------------- |
| GET    | `/reputation/v1/validators`           | Punteggi di reputazione per tutti i validatori |
| GET    | `/reputation/v1/validators/{address}` | Punteggio di reputazione per un validatore specifico |

## Modulo Cross-VM

| Metodo | Endpoint                   | Descrizione                              |
| ------ | -------------------------- | ---------------------------------------- |
| GET    | `/crossvm/v1/message/{id}` | Recupera un messaggio cross-VM tramite ID |
| GET    | `/crossvm/v1/pending`      | Elenca i messaggi cross-VM in attesa nella coda |
| GET    | `/crossvm/v1/params`       | Parametri correnti del modulo Cross-VM   |

## Modulo Multilayer {#multilayer-module}

A partire dalla versione di chain **v3.1.80**, l'intero servizio di query del modulo multilayer è esposto via REST tramite grpc-gateway sotto il prefisso `/qorechain/multilayer/v1/...` (in precedenza solo gRPC), incluse due **query di lettura degli state-anchor**: `anchor/{layer_id}` restituisce l'ultimo anchor di settlement per un layer, mentre `anchors/{layer_id}` ne restituisce la cronologia degli anchor. Ogni anchor reca una firma **ML-DSA-87 (Dilithium-5)** sui propri campi canonici, in modo che un client possa recuperare un anchor e verificarlo in modo indipendente — la base on-chain per le [ricevute di settlement](/rollups/settlement-receipts) del Rollup Development Kit.

| Metodo | Endpoint                                        | Descrizione                                       |
| ------ | ----------------------------------------------- | ------------------------------------------------- |
| GET    | `/qorechain/multilayer/v1/params`               | Parametri correnti del modulo Multilayer          |
| GET    | `/qorechain/multilayer/v1/layers`               | Elenca tutti i layer registrati                   |
| GET    | `/qorechain/multilayer/v1/layers/{layer_id}`    | Dettagli di un layer specifico                    |
| GET    | `/qorechain/multilayer/v1/anchor/{layer_id}`    | Ultimo state anchor per un layer                  |
| GET    | `/qorechain/multilayer/v1/anchors/{layer_id}`   | Cronologia degli state-anchor per un layer        |
| GET    | `/qorechain/multilayer/v1/routing-stats`        | Statistiche di routing delle transazioni tra i layer |

Una `StateAnchorView` contiene i campi `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, `main_chain_height`, `anchored_at`, `pqc_aggregate_signature`, `transaction_count` e `compressed_state_proof`. Il messaggio canonico firmato è `layer_id || layer_height || state_root || validator_set_hash`, verificato rispetto alla chiave PQC registrata del creatore del layer.

I seguenti endpoint con percorso più breve rimangono disponibili:

| Metodo | Endpoint                       | Descrizione                                  |
| ------ | ------------------------------ | -------------------------------------------- |
| GET    | `/multilayer/v1/layer/{id}`    | Dettagli di un layer specifico               |
| GET    | `/multilayer/v1/layers`        | Elenca tutti i layer registrati              |
| GET    | `/multilayer/v1/anchor/{id}`   | Dettagli di uno specifico record di anchor   |
| GET    | `/multilayer/v1/anchors`       | Elenca le sottomissioni di anchor recenti    |
| GET    | `/multilayer/v1/routing-stats` | Statistiche di routing delle transazioni tra i layer |
| GET    | `/multilayer/v1/params`        | Parametri correnti del modulo Multilayer     |

## Modulo SVM

| Metodo | Endpoint                    | Descrizione                                       |
| ------ | --------------------------- | ------------------------------------------------- |
| GET    | `/svm/v1/params`            | Parametri correnti del modulo SVM                 |
| GET    | `/svm/v1/account/{address}` | Informazioni sull'account SVM per un dato indirizzo |
| GET    | `/svm/v1/program/{address}` | Informazioni sul programma distribuito per un dato indirizzo di programma |

## Modulo RL Consensus

I parametri di tuning di PRISM e lo stato dell'agente di reinforcement-learning sono esposti tramite questo modulo.

| Metodo | Endpoint                      | Descrizione                             |
| ------ | ----------------------------- | --------------------------------------- |
| GET    | `/rlconsensus/v1/agent`       | Stato e modalità correnti dell'agente PRISM |
| GET    | `/rlconsensus/v1/observation` | Ultimo vettore di osservazione          |
| GET    | `/rlconsensus/v1/rewards`     | Metriche di reward cumulative           |
| GET    | `/rlconsensus/v1/params`      | Parametri correnti del modulo PRISM Consensus |
| GET    | `/rlconsensus/v1/policy`      | Configurazione e pesi della policy attiva |

## Modulo Burn

A partire dalla versione di chain **v3.1.77**, lo stato di sola lettura del modulo burn è esposto via REST tramite grpc-gateway sotto il prefisso `/qorechain/burn/v1/...` (in precedenza solo gRPC). Questi endpoint forniscono JSON on-chain reali su HTTP per explorer e telemetria di light-node. Le `stats` del burn includono ad esempio `gas_burn_rate=0.30`.

| Metodo | Endpoint                       | Descrizione                          |
| ------ | ------------------------------ | ------------------------------------ |
| GET    | `/qorechain/burn/v1/params`    | Parametri correnti del modulo Burn   |
| GET    | `/qorechain/burn/v1/stats`     | Statistiche di burn su tutti i canali |
| GET    | `/qorechain/burn/v1/records`   | Elenca i record di burn              |
| GET    | `/qorechain/burn/v1/milestone` | Avanzamento dei milestone di burn    |

I seguenti endpoint con percorso più breve rimangono disponibili:

| Metodo | Endpoint          | Descrizione                         |
| ------ | ----------------- | ----------------------------------- |
| GET    | `/burn/v1/stats`  | Statistiche di burn su tutti i canali |
| GET    | `/burn/v1/params` | Parametri correnti del modulo Burn  |

## Modulo xQORE

| Metodo | Endpoint                       | Descrizione                                |
| ------ | ------------------------------ | ------------------------------------------ |
| GET    | `/xqore/v1/position/{address}` | Posizione di staking xQORE per un dato indirizzo |
| GET    | `/xqore/v1/params`             | Parametri correnti del modulo xQORE        |

## Modulo Inflation

| Metodo | Endpoint               | Descrizione                         |
| ------ | ---------------------- | ----------------------------------- |
| GET    | `/inflation/v1/rate`   | Tasso di inflazione annualizzato corrente |
| GET    | `/inflation/v1/epoch`  | Numero e avanzamento dell'epoca corrente |
| GET    | `/inflation/v1/params` | Parametri correnti del modulo Inflation |

## Modulo RDK

| Metodo | Endpoint                     | Descrizione                           |
| ------ | ---------------------------- | ------------------------------------- |
| GET    | `/rdk/v1/rollup/{id}`        | Dettagli di un rollup specifico       |
| GET    | `/rdk/v1/rollups`            | Elenca tutti i rollup registrati      |
| GET    | `/rdk/v1/batch/{id}/{index}` | Recupera un batch di settlement specifico |
| GET    | `/rdk/v1/batches/{id}`       | Elenca i batch per un rollup specifico |
| GET    | `/rdk/v1/blob/{id}/{index}`  | Recupera uno specifico blob DA        |
| GET    | `/rdk/v1/params`             | Parametri correnti del modulo RDK     |

## Modulo Babylon

| Metodo | Endpoint                         | Descrizione                              |
| ------ | -------------------------------- | ---------------------------------------- |
| GET    | `/babylon/v1/staking/{address}`  | Posizione di staking BTC per un dato indirizzo |
| GET    | `/babylon/v1/checkpoint/{epoch}` | Dati del checkpoint BTC per una data epoca |
| GET    | `/babylon/v1/params`             | Parametri correnti del modulo Babylon    |

## Modulo Abstract Account

| Metodo | Endpoint                                | Descrizione                                  |
| ------ | --------------------------------------- | -------------------------------------------- |
| GET    | `/abstractaccount/v1/account/{address}` | Dettagli dell'abstract account per un dato indirizzo |
| GET    | `/abstractaccount/v1/params`            | Parametri correnti del modulo Abstract Account |

## Modulo FairBlock

| Metodo | Endpoint               | Descrizione                                |
| ------ | ---------------------- | ------------------------------------------ |
| GET    | `/fairblock/v1/config` | Configurazione corrente della cifratura FairBlock |
| GET    | `/fairblock/v1/params` | Parametri correnti del modulo FairBlock    |

## Modulo Gas Abstraction

| Metodo | Endpoint                             | Descrizione                               |
| ------ | ------------------------------------ | ----------------------------------------- |
| GET    | `/gasabstraction/v1/accepted-tokens` | Elenca i token accettati per il pagamento del gas |
| GET    | `/gasabstraction/v1/params`          | Parametri correnti del modulo Gas Abstraction |

## Reflection gRPC

La reflection del server gRPC è abilitata per impostazione predefinita, consentendo a strumenti come `grpcurl` di scoprire i servizi disponibili:

```bash
grpcurl -plaintext localhost:9090 list
```

Per interrogare un servizio specifico:

```bash
grpcurl -plaintext localhost:9090 qorechain.pqc.v1.Query/Params
```

## Autenticazione

Tutti gli endpoint REST e gRPC sono non autenticati per impostazione predefinita. Per i deployment in produzione, posiziona un reverse proxy (ad esempio Nginx o Caddy) davanti al nodo per gestire la terminazione TLS e il controllo degli accessi.
