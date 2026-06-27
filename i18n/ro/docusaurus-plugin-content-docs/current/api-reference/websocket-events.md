---
slug: /api-reference/websocket-events
title: Evenimente WebSocket
sidebar_label: Evenimente WebSocket
sidebar_position: 5
---

# Evenimente WebSocket

QoreChain oferă streaming de evenimente în timp real prin două interfețe WebSocket: WebSocket-ul compatibil cu EVM și WebSocket-ul RPC al motorului de consens QoreChain.

:::note
Ambele interfețe WebSocket sunt disponibile pe mainnet-ul **`qorechain-vladi`** (activ pe versiunea de lanț **v3.1.77**) și pe testnet-ul **`qorechain-diana`**. Endpoint-urile locale de mai jos presupun un nod pe care îl rulezi tu însuți; înlocuiește cu host-ul de mainnet sau testnet al furnizorului tău pentru acces la distanță.
:::

---

## WebSocket EVM

**Endpoint:** `ws://localhost:8546`

WebSocket-ul EVM acceptă metoda standard `eth_subscribe` pentru streaming de evenimente în timp real, compatibil cu instrumentele Ethereum.

### Tipuri de abonare

| Abonare                  | Descriere                                         |
| ------------------------ | ------------------------------------------------ |
| `newHeads`               | Emite un antet de fiecare dată când un nou bloc este adăugat |
| `logs`                   | Emite jurnale care corespund unui filtru opțional |
| `newPendingTransactions` | Emite hash-uri de tranzacții care intră în mempool |
| `syncing`                | Emite actualizări ale stării de sincronizare      |

### Abonare la blocuri noi

```json
{
  "jsonrpc": "2.0",
  "method": "eth_subscribe",
  "params": ["newHeads"],
  "id": 1
}
```

### Abonare la jurnale cu filtru

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

### Dezabonare

```json
{
  "jsonrpc": "2.0",
  "method": "eth_unsubscribe",
  "params": ["0x1a2b3c..."],
  "id": 3
}
```

---

## WebSocket RPC QoreChain

**Endpoint:** `ws://localhost:26657/websocket`

WebSocket-ul RPC folosește sistemul de abonare la evenimente al motorului de consens QoreChain. Clienții se abonează cu un șir de interogare care filtrează evenimentele după tip și atribute.

### Abonare la toate blocurile noi

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

### Abonare la toate tranzacțiile

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

### Abonare la evenimente specifice unui modul

Filtrează după tipul de eveniment pentru a primi doar evenimente de la un modul specific:

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

### Dezabonare

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

## Referință evenimente de modul

### Modulul PQC

| Tip de eveniment           | Atribute cheie                                       | Descriere                                     |
| -------------------------- | ---------------------------------------------------- | --------------------------------------------- |
| `pqc_hybrid_verify`        | `address`, `algorithm`, `result` (pass/fail), `mode` | Emis la fiecare verificare a semnăturii hibride |
| `pqc_hybrid_auto_register` | `address`, `algorithm`, `pubkey_hash`                | Emis când o cheie PQC este înregistrată automat |

### Modulul AI

| Tip de eveniment  | Atribute cheie                                                      | Descriere                                        |
| ----------------- | ------------------------------------------------------------------- | ------------------------------------------------ |
| `fraud_alert`     | `severity` (low/medium/high/critical), `address`, `reason`, `score` | Emis când este detectată o fraudă într-o tranzacție |
| `circuit_breaker` | `module`, `action` (tripped/reset), `threshold`, `value`            | Emis când un circuit breaker AI își schimbă starea |

### Modulul Bridge

| Tip de eveniment       | Atribute cheie                                                 | Descriere                                              |
| ---------------------- | --------------------------------------------------------------- | ------------------------------------------------------- |
| `deposit_completed`    | `chain_id`, `sender`, `recipient`, `amount`, `asset`, `tx_hash` | Emis când un depozit bridge de intrare este confirmat   |
| `withdrawal_completed` | `chain_id`, `sender`, `recipient`, `amount`, `asset`, `tx_hash` | Emis când o retragere bridge de ieșire este confirmată  |

### Modulul Cross-VM

| Tip de eveniment   | Atribute cheie                                                  | Descriere                                            |
| ------------------ | --------------------------------------------------------------- | ----------------------------------------------------- |
| `crossvm_request`  | `message_id`, `source_vm`, `target_vm`, `sender`, `payload_hash` | Emis când este inițiat un apel cross-VM              |
| `crossvm_response` | `message_id`, `source_vm`, `target_vm`, `success`, `gas_used`    | Emis când un apel cross-VM se finalizează            |
| `crossvm_timeout`  | `message_id`, `source_vm`, `target_vm`, `queued_at_height`       | Emis când un mesaj cross-VM depășește timeout-ul cozii |

### Modulul Multilayer

| Tip de eveniment       | Atribute cheie                                                | Descriere                                       |
| ---------------------- | -------------------------------------------------------------- | ----------------------------------------------- |
| `anchor_submitted`     | `layer_id`, `layer_type`, `anchor_hash`, `height`, `submitter` | Emis când o ancoră de stare a stratului este trimisă |
| `layer_status_changed` | `layer_id`, `previous_status`, `new_status`, `reason`          | Emis când un strat își schimbă starea operațională |

### Modulul RDK

| Tip de eveniment  | Atribute cheie                                        | Descriere                                        |
| ----------------- | ----------------------------------------------------- | ------------------------------------------------ |
| `rollup_created`  | `rollup_id`, `operator`, `settlement_type`, `profile` | Emis când un nou rollup este înregistrat          |
| `batch_submitted` | `rollup_id`, `batch_index`, `state_root`, `tx_count`  | Emis când un lot de decontare este trimis         |
| `batch_finalized` | `rollup_id`, `batch_index`, `finalized_at_height`     | Emis când un lot trece de fereastra sa de contestație |
| `da_blob_stored`  | `rollup_id`, `blob_index`, `size_bytes`, `commitment` | Emis când un blob DA este stocat                  |
| `da_blob_pruned`  | `rollup_id`, `blob_index`, `pruned_at_height`         | Emis când un blob DA este eliminat după reținere  |

### Modulul Burn

| Tip de eveniment  | Atribute cheie                                                                      | Descriere                                   |
| ----------------- | ----------------------------------------------------------------------------------- | ------------------------------------------- |
| `fee_distributed` | `total_fees`, `validator_amount`, `burn_amount`, `treasury_amount`, `staker_amount` | Emis când taxele colectate sunt distribuite |
| `tokens_burned`   | `amount`, `channel`, `block_height`                                                 | Emis când tokenurile sunt arse permanent    |

### Modulul xQORE

| Tip de eveniment | Atribute cheie                                                | Descriere                                  |
| ---------------- | -------------------------------------------------------------- | ------------------------------------------ |
| `xqore_locked`   | `address`, `amount`, `lock_duration`, `tier`                   | Emis când QOR este blocat în xQORE         |
| `xqore_unlocked` | `address`, `amount`, `penalty_applied`, `penalty_amount`       | Emis când xQORE este deblocat înapoi în QOR |
| `pvp_rebase`     | `epoch`, `total_penalty`, `rebase_amount`, `beneficiary_count` | Emis în timpul distribuției rebase PvP     |

### Modulul Inflation

| Tip de eveniment | Atribute cheie                                             | Descriere                                  |
| ---------------- | ---------------------------------------------------------- | ------------------------------------------ |
| `epoch_minted`   | `epoch`, `minted_amount`, `inflation_rate`, `block_height` | Emis la sfârșitul fiecărei epoci de inflație |

### Modulul RL Consensus

Ajustările de parametri PRISM și activitatea circuit breaker-ului sunt emise prin acest modul.

| Tip de eveniment            | Atribute cheie                                                | Descriere                                                |
| --------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------- |
| `rl_action_applied`         | `action_type`, `param_key`, `old_value`, `new_value`, `reward` | Emis când agentul PRISM aplică o ajustare de parametru     |
| `circuit_breaker_triggered` | `reason`, `param_key`, `attempted_value`, `limit`              | Emis când circuit breaker-ul PRISM blochează o acțiune     |

---

## Exemplu de client JavaScript

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

### WebSocket RPC QoreChain (Nativ)

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

- **Limite de conexiune**: Numărul maxim implicit de conexiuni WebSocket este nelimitat (`max-open-connections = 0`). Setează o limită în `app.toml` pentru implementări în producție.
- **Buffer de evenimente**: WebSocket-ul RPC stochează în buffer până la 200 de evenimente per abonare. Dacă clientul rămâne în urmă, evenimentele mai vechi sunt eliminate.
- **Reconectare**: Clienții ar trebui să implementeze reconectarea automată cu backoff exponențial, deoarece conexiunile WebSocket pot fi întrerupte în timpul restartărilor sau actualizărilor nodului.
