---
slug: /api-reference/json-rpc-qor_-namespace
title: JSON-RPC — Namespace qor_
sidebar_label: JSON-RPC — Namespace qor_
sidebar_position: 2
---

# JSON-RPC — qor_ Namespace

Il namespace `qor_` fornisce metodi JSON-RPC specifici di QoreChain per interrogare lo stato della crittografia post-quantistica, le analitiche AI, la messaggistica cross-VM, lo stato multi-layer, le operazioni di bridge, la tokenomics, l'infrastruttura di rollup e lo stato del consenso PRISM.

## Connessione

| Trasporto | Indirizzo predefinito   |
| --------- | ----------------------- |
| HTTP      | `http://localhost:8545` |
| WebSocket | `ws://localhost:8546`   |

Il namespace `qor_` viene servito insieme a `eth_`, `web3_`, `net_` e `txpool_` sulle stesse porte. Abilitalo in `app.toml`:

```toml
[json-rpc]
api = "eth,web3,net,txpool,qor"
```

:::note
Il namespace `qor_` è disponibile sulla mainnet **`qorechain-vladi`** (EVM chain ID **9801**, in esecuzione sulla versione della chain **v3.1.92**) e sulla testnet **`qorechain-diana`** (EVM chain ID **9800**). Gli esempi seguenti presuppongono un nodo locale; sostituisci l'endpoint mainnet o testnet del tuo provider per l'accesso remoto.
:::

---

## Metodi

| Metodo                        | Parametri                               | Descrizione                                                        |
| ----------------------------- | ---------------------------------------- | ------------------------------------------------------------------ |
| `qor_getPQCKeyStatus`         | `address` (string)                      | Restituisce lo stato di registrazione della chiave PQC per un account |
| `qor_getHybridSignatureMode`  | none                                    | Restituisce la modalità di applicazione della firma ibrida corrente |
| `qor_getAIStats`              | none                                    | Restituisce le statistiche aggregate di elaborazione del modulo AI |
| `qor_getCrossVMMessage`       | `messageId` (string)                    | Recupera un messaggio cross-VM tramite il suo ID                   |
| `qor_getReputationScore`      | `validator` (string)                    | Restituisce il punteggio di reputazione per un indirizzo di validatore |
| `qor_getLayerInfo`            | `layerId` (string)                      | Restituisce metadati e stato di un layer registrato                |
| `qor_getBridgeStatus`         | `chainId` (string)                      | Restituisce lo stato del bridge e i totali bloccati per una chain  |
| `qor_getRLAgentStatus`        | none                                    | Restituisce la modalità corrente dell'agente PRISM e lo stato operativo |
| `qor_getRLObservation`        | none                                    | Restituisce l'ultimo vettore di osservazione PRISM                 |
| `qor_getRLReward`             | none                                    | Restituisce le metriche cumulative di reward di PRISM              |
| `qor_getPoolClassification`   | `validator` (string)                    | Restituisce la classificazione del pool CPoS per un validatore     |
| `qor_getBurnStats`            | none                                    | Restituisce le statistiche di burn su tutti i canali                |
| `qor_getXQOREPosition`        | `address` (string)                      | Restituisce la posizione di staking xQORE per un indirizzo         |
| `qor_getInflationRate`        | none                                    | Restituisce il tasso di inflazione annualizzato corrente            |
| `qor_getTokenomicsOverview`   | none                                    | Restituisce una panoramica combinata di burn, inflazione e supply  |
| `qor_getRollupStatus`         | `rollupId` (string)                     | Restituisce stato e configurazione di un rollup specifico          |
| `qor_listRollups`             | none                                    | Restituisce un elenco di tutti i rollup registrati                 |
| `qor_getSettlementBatch`      | `rollupId` (string), `batchIndex` (int) | Restituisce un batch di settlement specifico per un rollup         |
| `qor_suggestRollupProfile`    | `useCase` (string)                      | Raccomandazione del profilo rollup assistita da AI per un caso d'uso |
| `qor_getDABlobStatus`         | `rollupId` (string), `blobIndex` (int)  | Restituisce lo stato di un blob DA specifico                       |
| `qor_getBTCStakingPosition`   | `address` (string)                      | Restituisce la posizione di staking BTC tramite il modulo Babylon  |
| `qor_getAbstractAccount`      | `address` (string)                      | Restituisce i dettagli dell'account astratto e le regole di spesa  |
| `qor_getFairBlockStatus`      | none                                    | Restituisce lo stato e la configurazione della crittografia FairBlock |
| `qor_getGasAbstractionConfig` | none                                    | Restituisce i token accettati e i parametri di gas abstraction     |
| `qor_getLaneConfiguration`    | none                                    | Restituisce la configurazione di prioritizzazione delle TX a 5 corsie |

---

## Esempi

### qor_getBurnStats

**Richiesta:**

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getBurnStats",
    "params": [],
    "id": 1
  }'
```

**Risposta:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "total_burned": "1250000000",
    "total_distributed": "4750000000",
    "channels": {
      "validator_share": "0.40",
      "burn_share": "0.30",
      "treasury_share": "0.20",
      "staker_share": "0.10"
    },
    "last_block_burned": "342891"
  }
}
```

### qor_getRLAgentStatus

**Richiesta:**

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getRLAgentStatus",
    "params": [],
    "id": 2
  }'
```

**Risposta:**

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "agent_mode": "observe",
    "observation_interval": 10,
    "circuit_breaker": {
      "active": false,
      "max_param_change": "0.10",
      "cooldown_blocks": 100
    },
    "last_observation_block": "342885",
    "cumulative_reward": "18.742"
  }
}
```

### qor_getRollupStatus

**Richiesta:**

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getRollupStatus",
    "params": ["rollup-001"],
    "id": 3
  }'
```

**Risposta:**

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "rollup_id": "rollup-001",
    "status": "active",
    "settlement_type": "optimistic",
    "operator": "qor1abc123...",
    "total_batches": 147,
    "last_finalized_batch": 145,
    "pending_batches": 2,
    "stake": "10000000000uqor",
    "created_at_height": 100230
  }
}
```

---

## Codici di errore

| Codice | Messaggio         | Descrizione                             |
| ------ | ----------------- | ---------------------------------------- |
| -32600 | Invalid Request    | Richiesta JSON-RPC malformata            |
| -32601 | Method not found   | Il metodo non esiste                     |
| -32602 | Invalid params     | Parametri mancanti o non validi          |
| -32603 | Internal error     | Errore di elaborazione lato server       |
| -32000 | Module disabled    | Il modulo interrogato non è abilitato    |
| -32001 | Entity not found   | La risorsa richiesta non esiste          |
