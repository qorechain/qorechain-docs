---
slug: /api-reference/websocket-events
title: Evenimente WebSocket
sidebar_label: Evenimente WebSocket
sidebar_position: 5
---

# Evenimente WebSocket

QoreChain oferă transmiterea evenimentelor în timp real prin două interfețe WebSocket: WebSocket-ul compatibil EVM și WebSocket-ul RPC al Motorului de Consens QoreChain.

:::note
Ambele interfețe WebSocket sunt disponibile pe mainnet-ul **`qorechain-vladi`** (live la versiunea de chain **v3.1.95**) și pe testnet-ul **`qorechain-diana`**. Endpoint-urile locale de mai jos presupun un nod pe care îl rulezi tu însuți; înlocuiește-le cu host-ul mainnet sau testnet al furnizorului tău pentru acces la distanță.
:::

---

## EVM WebSocket

**Endpoint:** `ws://localhost:8546`

WebSocket-ul EVM suportă metoda standard `eth_subscribe` pentru transmiterea evenimentelor în timp real, compatibilă cu uneltele Ethereum.

### Tipuri de abonare

| Abonament                | Descriere                                          |
| ------------------------ | --------------------------------------------------- |
| `newHeads`               | Emite un antet de fiecare dată când este adăugat un bloc nou |
| `logs`                   | Emite loguri care corespund unui filtru opțional     |
| `newPendingTransactions` | Emite hash-urile tranzacțiilor care intră în mempool |
| `syncing`                | Emite actualizări ale stării de sincronizare         |

### Abonare la blocuri noi

```json
{
  "jsonrpc": "2.0",
  "method": "eth_subscribe",
  "params": ["newHeads"],
  "id": 1
}
```

### Abonare la loguri cu filtru

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

## QoreChain RPC WebSocket

**Endpoint:** `ws://localhost:26657/websocket`

WebSocket-ul RPC folosește sistemul de abonare la evenimente al Motorului de Consens QoreChain. Clienții se abonează folosind un șir de interogare (query) care filtrează evenimentele după tip și atribute.

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

Filtrează după tipul evenimentului pentru a primi doar evenimente dintr-un modul specific:

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

## Referință evenimente pe module

### Modulul PQC

| Tip eveniment               | Atribute cheie                                        | Descriere                                       |
| --------------------------- | ------------------------------------------------------ | ------------------------------------------------ |
| `pqc_hybrid_verify`         | `address`, `algorithm`, `result` (pass/fail), `mode`   | Emis la fiecare verificare a semnăturii hibride  |
| `pqc_hybrid_auto_register`  | `address`, `algorithm`, `pubkey_hash`                  | Emis atunci când o cheie PQC este înregistrată automat |

### Modulul AI

| Tip eveniment      | Atribute cheie                                                        | Descriere                                          |
| ------------------- | ----------------------------------------------------------------------- | --------------------------------------------------- |
| `fraud_alert`       | `severity` (low/medium/high/critical), `address`, `reason`, `score`     | Emis atunci când este detectată o fraudă într-o tranzacție |
| `circuit_breaker`   | `module`, `action` (tripped/reset), `threshold`, `value`                | Emis atunci când un disjunctor (circuit breaker) AI își schimbă starea |

### Modulul Bridge

| Tip eveniment           | Atribute cheie                                                    | Descriere                                                  |
| ------------------------ | --------------------------------------------------------------------- | ------------------------------------------------------------ |
| `deposit_completed`      | `chain_id`, `sender`, `recipient`, `amount`, `asset`, `tx_hash`      | Emis atunci când un depozit bridge de intrare este confirmat |
| `withdrawal_completed`   | `chain_id`, `sender`, `recipient`, `amount`, `asset`, `tx_hash`      | Emis atunci când o retragere bridge de ieșire este confirmată |

### Modulul Cross-VM

| Tip eveniment       | Atribute cheie                                                     | Descriere                                             |
| --------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------- |
| `crossvm_request`    | `message_id`, `source_vm`, `target_vm`, `sender`, `payload_hash`      | Emis atunci când este inițiat un apel cross-VM           |
| `crossvm_response`   | `message_id`, `source_vm`, `target_vm`, `success`, `gas_used`         | Emis atunci când un apel cross-VM se finalizează          |
| `crossvm_timeout`    | `message_id`, `source_vm`, `target_vm`, `queued_at_height`            | Emis atunci când un mesaj cross-VM depășește timpul de așteptare în coadă |

### Modulul Multilayer

| Tip eveniment            | Atribute cheie                                                   | Descriere                                          |
| -------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------- |
| `anchor_submitted`         | `layer_id`, `layer_type`, `anchor_hash`, `height`, `submitter`   | Emis atunci când este trimisă o ancoră a stării unui layer |
| `layer_status_changed`     | `layer_id`, `previous_status`, `new_status`, `reason`            | Emis atunci când un layer își schimbă starea operațională |

### Modulul RDK

| Tip eveniment       | Atribute cheie                                          | Descriere                                          |
| ---------------------- | ----------------------------------------------------------- | ------------------------------------------------------ |
| `rollup_created`      | `rollup_id`, `operator`, `settlement_type`, `profile`      | Emis atunci când este înregistrat un rollup nou        |
| `batch_submitted`     | `rollup_id`, `batch_index`, `state_root`, `tx_count`        | Emis atunci când este trimis un batch de decontare      |
| `batch_finalized`     | `rollup_id`, `batch_index`, `finalized_at_height`           | Emis atunci când un batch trece de fereastra sa de contestare |
| `da_blob_stored`      | `rollup_id`, `blob_index`, `size_bytes`, `commitment`       | Emis atunci când este stocat un blob DA                 |
| `da_blob_pruned`      | `rollup_id`, `blob_index`, `pruned_at_height`                | Emis atunci când un blob DA este eliminat după perioada de retenție |

### Modulul Burn

| Tip eveniment        | Atribute cheie                                                                       | Descriere                                     |
| ----------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `fee_distributed`      | `total_fees`, `validator_amount`, `burn_amount`, `treasury_amount`, `staker_amount`      | Emis atunci când comisioanele colectate sunt distribuite |
| `tokens_burned`        | `amount`, `channel`, `block_height`                                                       | Emis atunci când tokenurile sunt arse (burn) permanent |

### Modulul xQORE

| Tip eveniment      | Atribute cheie                                                    | Descriere                                     |
| --------------------- | ---------------------------------------------------------------------- | -------------------------------------------------- |
| `xqore_locked`       | `address`, `amount`, `lock_duration`, `tier`                          | Emis atunci când QOR este blocat în xQORE           |
| `xqore_unlocked`     | `address`, `amount`, `penalty_applied`, `penalty_amount`               | Emis atunci când xQORE este deblocat înapoi în QOR  |
| `pvp_rebase`         | `epoch`, `total_penalty`, `rebase_amount`, `beneficiary_count`         | Emis în timpul distribuției rebase PvP              |

### Modulul Inflation

| Tip eveniment    | Atribute cheie                                                | Descriere                                    |
| ------------------- | -------------------------------------------------------------- | ------------------------------------------------ |
| `epoch_minted`     | `epoch`, `minted_amount`, `inflation_rate`, `block_height`     | Emis la finalul fiecărei epoci de inflație        |

### Modulul RL Consensus

Ajustările parametrilor PRISM și activitatea disjunctorului (circuit breaker) sunt emise prin acest modul.

| Tip eveniment                 | Atribute cheie                                                   | Descriere                                                     |
| -------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `rl_action_applied`             | `action_type`, `param_key`, `old_value`, `new_value`, `reward`      | Emis atunci când agentul PRISM aplică o ajustare de parametru       |
| `circuit_breaker_triggered`     | `reason`, `param_key`, `attempted_value`, `limit`                    | Emis atunci când disjunctorul PRISM blochează o acțiune             |

---

## Exemplu de client JavaScript

### EVM WebSocket (ethers.js)

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

### QoreChain RPC WebSocket (Native)

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

- **Limite de conexiune**: Numărul maxim implicit de conexiuni WebSocket este nelimitat (`max-open-connections = 0`). Setează o limită în `app.toml` pentru mediile de producție.
- **Buffer de evenimente**: WebSocket-ul RPC stochează în buffer până la 200 de evenimente per abonament. Dacă clientul rămâne în urmă, evenimentele mai vechi sunt eliminate.
- **Reconectare**: Clienții ar trebui să implementeze reconectare automată cu backoff exponențial, deoarece conexiunile WebSocket pot fi întrerupte în timpul repornirilor sau upgrade-urilor nodului.
