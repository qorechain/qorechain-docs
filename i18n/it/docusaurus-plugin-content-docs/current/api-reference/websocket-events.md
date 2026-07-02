---
slug: /api-reference/websocket-events
title: Eventi WebSocket
sidebar_label: Eventi WebSocket
sidebar_position: 5
---

# Eventi WebSocket

QoreChain fornisce lo streaming di eventi in tempo reale tramite due interfacce WebSocket: la WebSocket compatibile con l'EVM e la WebSocket RPC del QoreChain Consensus Engine.

:::note
Entrambe le interfacce WebSocket sono disponibili sulla mainnet **`qorechain-vladi`** (attiva sulla versione di chain **v3.1.82**) e sulla testnet **`qorechain-diana`**. Gli endpoint locali sotto indicati presuppongono un nodo che gestisci tu stesso; per l'accesso remoto sostituisci l'host mainnet o testnet del tuo provider.
:::

---

## WebSocket EVM

**Endpoint:** `ws://localhost:8546`

La WebSocket EVM supporta il metodo standard `eth_subscribe` per lo streaming di eventi in tempo reale compatibile con gli strumenti di Ethereum.

### Tipi di sottoscrizione

| Sottoscrizione           | Descrizione                                      |
| ------------------------ | ------------------------------------------------ |
| `newHeads`               | Emette un header ogni volta che viene aggiunto un nuovo blocco |
| `logs`                   | Emette i log corrispondenti a un filtro opzionale |
| `newPendingTransactions` | Emette gli hash delle transazioni che entrano nel mempool |
| `syncing`                | Emette aggiornamenti sullo stato di sincronizzazione |

### Sottoscrizione ai nuovi blocchi

```json
{
  "jsonrpc": "2.0",
  "method": "eth_subscribe",
  "params": ["newHeads"],
  "id": 1
}
```

### Sottoscrizione ai log con filtro

```json
{
  "jsonrpc": "2.0",
  "method": "eth_subscribe",
  "params": [
    "logs",
    {
      "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28",
      "topics": ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"]
    }
  ],
  "id": 2
}
```

### Annullamento della sottoscrizione

```json
{
  "jsonrpc": "2.0",
  "method": "eth_unsubscribe",
  "params": ["0x1a2b3c..."],
  "id": 3
}
```

---

## WebSocket RPC di QoreChain

**Endpoint:** `ws://localhost:26657/websocket`

La WebSocket RPC utilizza il sistema di sottoscrizione agli eventi del QoreChain Consensus Engine. I client si sottoscrivono con una stringa di query che filtra gli eventi per tipo e attributi.

### Sottoscrizione a tutti i nuovi blocchi

```json
{
  "jsonrpc": "2.0",
  "method": "subscribe",
  "params": {
    "query": "tm.event='NewBlock'"
  },
  "id": 1
}
```

### Sottoscrizione a tutte le transazioni

```json
{
  "jsonrpc": "2.0",
  "method": "subscribe",
  "params": {
    "query": "tm.event='Tx'"
  },
  "id": 2
}
```

### Sottoscrizione a eventi specifici di un modulo

Filtra per tipo di evento per ricevere solo gli eventi di un modulo specifico:

```json
{
  "jsonrpc": "2.0",
  "method": "subscribe",
  "params": {
    "query": "tm.event='Tx' AND fraud_alert.severity EXISTS"
  },
  "id": 3
}
```

### Annullamento della sottoscrizione

```json
{
  "jsonrpc": "2.0",
  "method": "unsubscribe",
  "params": {
    "query": "tm.event='NewBlock'"
  },
  "id": 4
}
```

---

## Riferimento agli eventi dei moduli

### Modulo PQC

| Tipo di evento             | Attributi chiave                                     | Descrizione                                   |
| -------------------------- | ---------------------------------------------------- | --------------------------------------------- |
| `pqc_hybrid_verify`        | `address`, `algorithm`, `result` (pass/fail), `mode` | Emesso a ogni verifica di firma ibrida        |
| `pqc_hybrid_auto_register` | `address`, `algorithm`, `pubkey_hash`                | Emesso quando una chiave PQC viene registrata automaticamente |

### Modulo AI

| Tipo di evento    | Attributi chiave                                                   | Descrizione                                      |
| ----------------- | ------------------------------------------------------------------- | ------------------------------------------------ |
| `fraud_alert`     | `severity` (low/medium/high/critical), `address`, `reason`, `score` | Emesso quando viene rilevata una frode in una transazione |
| `circuit_breaker` | `module`, `action` (tripped/reset), `threshold`, `value`            | Emesso quando un circuit breaker AI cambia stato |

### Modulo Bridge

| Tipo di evento         | Attributi chiave                                               | Descrizione                                             |
| ---------------------- | --------------------------------------------------------------- | ------------------------------------------------------- |
| `deposit_completed`    | `chain_id`, `sender`, `recipient`, `amount`, `asset`, `tx_hash` | Emesso quando un deposito bridge in entrata viene confermato |
| `withdrawal_completed` | `chain_id`, `sender`, `recipient`, `amount`, `asset`, `tx_hash` | Emesso quando un prelievo bridge in uscita viene confermato |

### Modulo Cross-VM

| Tipo di evento     | Attributi chiave                                                | Descrizione                                           |
| ------------------ | ---------------------------------------------------------------- | ----------------------------------------------------- |
| `crossvm_request`  | `message_id`, `source_vm`, `target_vm`, `sender`, `payload_hash` | Emesso quando viene avviata una chiamata cross-VM     |
| `crossvm_response` | `message_id`, `source_vm`, `target_vm`, `success`, `gas_used`    | Emesso quando una chiamata cross-VM si completa       |
| `crossvm_timeout`  | `message_id`, `source_vm`, `target_vm`, `queued_at_height`       | Emesso quando un messaggio cross-VM supera il timeout della coda |

### Modulo Multilayer

| Tipo di evento         | Attributi chiave                                              | Descrizione                                     |
| ---------------------- | -------------------------------------------------------------- | ----------------------------------------------- |
| `anchor_submitted`     | `layer_id`, `layer_type`, `anchor_hash`, `height`, `submitter` | Emesso quando viene inviato un anchor di stato di un layer |
| `layer_status_changed` | `layer_id`, `previous_status`, `new_status`, `reason`          | Emesso quando un layer cambia stato operativo   |

### Modulo RDK

| Tipo di evento    | Attributi chiave                                      | Descrizione                                      |
| ----------------- | ----------------------------------------------------- | ------------------------------------------------ |
| `rollup_created`  | `rollup_id`, `operator`, `settlement_type`, `profile` | Emesso quando viene registrato un nuovo rollup   |
| `batch_submitted` | `rollup_id`, `batch_index`, `state_root`, `tx_count`  | Emesso quando viene inviato un batch di settlement |
| `batch_finalized` | `rollup_id`, `batch_index`, `finalized_at_height`     | Emesso quando un batch supera la sua finestra di challenge |
| `da_blob_stored`  | `rollup_id`, `blob_index`, `size_bytes`, `commitment` | Emesso quando un blob DA viene memorizzato       |
| `da_blob_pruned`  | `rollup_id`, `blob_index`, `pruned_at_height`         | Emesso quando un blob DA viene eliminato dopo la ritenzione |

### Modulo Burn

| Tipo di evento    | Attributi chiave                                                                    | Descrizione                                 |
| ----------------- | ----------------------------------------------------------------------------------- | ------------------------------------------- |
| `fee_distributed` | `total_fees`, `validator_amount`, `burn_amount`, `treasury_amount`, `staker_amount` | Emesso quando le commissioni raccolte vengono distribuite |
| `tokens_burned`   | `amount`, `channel`, `block_height`                                                 | Emesso quando i token vengono bruciati in modo permanente |

### Modulo xQORE

| Tipo di evento   | Attributi chiave                                              | Descrizione                                |
| ---------------- | -------------------------------------------------------------- | ------------------------------------------ |
| `xqore_locked`   | `address`, `amount`, `lock_duration`, `tier`                   | Emesso quando QOR viene bloccato in xQORE  |
| `xqore_unlocked` | `address`, `amount`, `penalty_applied`, `penalty_amount`       | Emesso quando xQORE viene sbloccato nuovamente in QOR |
| `pvp_rebase`     | `epoch`, `total_penalty`, `rebase_amount`, `beneficiary_count` | Emesso durante la distribuzione del rebase PvP |

### Modulo Inflation

| Tipo di evento | Attributi chiave                                          | Descrizione                                |
| -------------- | ---------------------------------------------------------- | ------------------------------------------ |
| `epoch_minted` | `epoch`, `minted_amount`, `inflation_rate`, `block_height` | Emesso alla fine di ogni epoca di inflazione |

### Modulo RL Consensus

Gli aggiustamenti dei parametri PRISM e l'attività dei circuit breaker vengono emessi tramite questo modulo.

| Tipo di evento              | Attributi chiave                                              | Descrizione                                                |
| --------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------- |
| `rl_action_applied`         | `action_type`, `param_key`, `old_value`, `new_value`, `reward` | Emesso quando l'agente PRISM applica un aggiustamento di parametro |
| `circuit_breaker_triggered` | `reason`, `param_key`, `attempted_value`, `limit`              | Emesso quando il circuit breaker PRISM blocca un'azione    |

---

## Esempio di client JavaScript

### WebSocket EVM (ethers.js)

```javascript
import { ethers } from "ethers";

const provider = new ethers.WebSocketProvider("ws://localhost:8546");

// Subscribe to new blocks
provider.on("block", (blockNumber) => {
  console.log("New block:", blockNumber);
});

// Subscribe to contract events
const filter = {
  address: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28",
  topics: [ethers.id("Transfer(address,address,uint256)")],
};
provider.on(filter, (log) => {
  console.log("Transfer event:", log);
});
```

### WebSocket RPC di QoreChain (nativa)

```javascript
const ws = new WebSocket("ws://localhost:26657/websocket");

ws.onopen = () => {
  // Subscribe to fraud alerts
  ws.send(JSON.stringify({
    jsonrpc: "2.0",
    method: "subscribe",
    params: { query: "tm.event='Tx' AND fraud_alert.severity EXISTS" },
    id: 1,
  }));

  // Subscribe to rollup batch submissions
  ws.send(JSON.stringify({
    jsonrpc: "2.0",
    method: "subscribe",
    params: { query: "tm.event='Tx' AND batch_submitted.rollup_id EXISTS" },
    id: 2,
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.result && data.result.events) {
    console.log("Event received:", data.result.events);
  }
};
```

---

## Note

- **Limiti di connessione**: il numero massimo predefinito di connessioni WebSocket è illimitato (`max-open-connections = 0`). Imposta un limite in `app.toml` per i deployment di produzione.
- **Buffer degli eventi**: la WebSocket RPC bufferizza fino a 200 eventi per sottoscrizione. Se il client rimane indietro, gli eventi più vecchi vengono scartati.
- **Riconnessione**: i client dovrebbero implementare la riconnessione automatica con backoff esponenziale, poiché le connessioni WebSocket possono essere interrotte durante i riavvii o gli aggiornamenti del nodo.
