---
slug: /api-reference/websocket-events
title: WebSocket-Ereignisse
sidebar_label: WebSocket-Ereignisse
sidebar_position: 5
---

# WebSocket-Ereignisse

QoreChain bietet Echtzeit-Ereignis-Streaming über zwei WebSocket-Schnittstellen: den EVM-kompatiblen WebSocket und den RPC-WebSocket der QoreChain-Konsens-Engine.

:::note
Beide WebSocket-Schnittstellen sind im **`qorechain-vladi`**-Mainnet (live auf Chain-Version **v3.1.77**) und im **`qorechain-diana`**-Testnet verfügbar. Die untenstehenden lokalen Endpunkte gehen von einem Node aus, den Sie selbst betreiben; ersetzen Sie für den Fernzugriff den Mainnet- oder Testnet-Host Ihres Anbieters.
:::

---

## EVM-WebSocket

**Endpunkt:** `ws://localhost:8546`

Der EVM-WebSocket unterstützt die Standardmethode `eth_subscribe` für Echtzeit-Ereignis-Streaming, das mit Ethereum-Werkzeugen kompatibel ist.

### Abonnementtypen

| Abonnement               | Beschreibung                                              |
| ------------------------ | -------------------------------------------------------- |
| `newHeads`               | Sendet einen Header bei jedem Anhängen eines neuen Blocks |
| `logs`                   | Sendet Logs, die einem optionalen Filter entsprechen     |
| `newPendingTransactions` | Sendet Transaktions-Hashes, die in den Mempool gelangen  |
| `syncing`                | Sendet Aktualisierungen zum Sync-Status                  |

### Neue Blöcke abonnieren

```json
{
  "jsonrpc": "2.0",
  "method": "eth_subscribe",
  "params": ["newHeads"],
  "id": 1
}
```

### Logs mit Filter abonnieren

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

### Abonnement aufheben

```json
{
  "jsonrpc": "2.0",
  "method": "eth_unsubscribe",
  "params": ["0x1a2b3c..."],
  "id": 3
}
```

---

## QoreChain-RPC-WebSocket

**Endpunkt:** `ws://localhost:26657/websocket`

Der RPC-WebSocket verwendet das Ereignis-Abonnementsystem der QoreChain-Konsens-Engine. Clients abonnieren mit einer Abfragezeichenkette, die Ereignisse nach Typ und Attributen filtert.

### Alle neuen Blöcke abonnieren

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

### Alle Transaktionen abonnieren

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

### Modulspezifische Ereignisse abonnieren

Filtern Sie nach Ereignistyp, um nur Ereignisse eines bestimmten Moduls zu empfangen:

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

### Abonnement aufheben

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

## Referenz der Modulereignisse

### PQC-Modul

| Ereignistyp                | Schlüsselattribute                                   | Beschreibung                                       |
| -------------------------- | ---------------------------------------------------- | -------------------------------------------------- |
| `pqc_hybrid_verify`        | `address`, `algorithm`, `result` (pass/fail), `mode` | Wird bei jeder Hybridsignaturverifizierung ausgelöst |
| `pqc_hybrid_auto_register` | `address`, `algorithm`, `pubkey_hash`                | Wird ausgelöst, wenn ein PQC-Schlüssel automatisch registriert wird |

### KI-Modul

| Ereignistyp       | Schlüsselattribute                                                  | Beschreibung                                      |
| ----------------- | ------------------------------------------------------------------- | ------------------------------------------------- |
| `fraud_alert`     | `severity` (low/medium/high/critical), `address`, `reason`, `score` | Wird ausgelöst, wenn Betrug in einer Transaktion erkannt wird |
| `circuit_breaker` | `module`, `action` (tripped/reset), `threshold`, `value`            | Wird ausgelöst, wenn ein KI-Circuit-Breaker seinen Zustand ändert |

### Bridge-Modul

| Ereignistyp            | Schlüsselattribute                                             | Beschreibung                                            |
| ---------------------- | -------------------------------------------------------------- | ------------------------------------------------------- |
| `deposit_completed`    | `chain_id`, `sender`, `recipient`, `amount`, `asset`, `tx_hash` | Wird ausgelöst, wenn eine eingehende Bridge-Einzahlung bestätigt wird |
| `withdrawal_completed` | `chain_id`, `sender`, `recipient`, `amount`, `asset`, `tx_hash` | Wird ausgelöst, wenn eine ausgehende Bridge-Auszahlung bestätigt wird |

### Cross-VM-Modul

| Ereignistyp        | Schlüsselattribute                                              | Beschreibung                                          |
| ------------------ | --------------------------------------------------------------- | ----------------------------------------------------- |
| `crossvm_request`  | `message_id`, `source_vm`, `target_vm`, `sender`, `payload_hash` | Wird ausgelöst, wenn ein VM-übergreifender Aufruf initiiert wird |
| `crossvm_response` | `message_id`, `source_vm`, `target_vm`, `success`, `gas_used`    | Wird ausgelöst, wenn ein VM-übergreifender Aufruf abgeschlossen wird |
| `crossvm_timeout`  | `message_id`, `source_vm`, `target_vm`, `queued_at_height`       | Wird ausgelöst, wenn eine VM-übergreifende Nachricht das Warteschlangen-Timeout überschreitet |

### Multilayer-Modul

| Ereignistyp            | Schlüsselattribute                                            | Beschreibung                                    |
| ---------------------- | ------------------------------------------------------------- | ----------------------------------------------- |
| `anchor_submitted`     | `layer_id`, `layer_type`, `anchor_hash`, `height`, `submitter` | Wird ausgelöst, wenn ein Layer-State-Anchor eingereicht wird |
| `layer_status_changed` | `layer_id`, `previous_status`, `new_status`, `reason`          | Wird ausgelöst, wenn eine Layer ihren Betriebsstatus ändert |

### RDK-Modul

| Ereignistyp       | Schlüsselattribute                                    | Beschreibung                                      |
| ----------------- | ----------------------------------------------------- | ------------------------------------------------- |
| `rollup_created`  | `rollup_id`, `operator`, `settlement_type`, `profile` | Wird ausgelöst, wenn ein neues Rollup registriert wird |
| `batch_submitted` | `rollup_id`, `batch_index`, `state_root`, `tx_count`  | Wird ausgelöst, wenn ein Settlement-Batch eingereicht wird |
| `batch_finalized` | `rollup_id`, `batch_index`, `finalized_at_height`     | Wird ausgelöst, wenn ein Batch sein Challenge-Fenster durchläuft |
| `da_blob_stored`  | `rollup_id`, `blob_index`, `size_bytes`, `commitment` | Wird ausgelöst, wenn ein DA-Blob gespeichert wird |
| `da_blob_pruned`  | `rollup_id`, `blob_index`, `pruned_at_height`         | Wird ausgelöst, wenn ein DA-Blob nach Ablauf der Aufbewahrung entfernt wird |

### Burn-Modul

| Ereignistyp       | Schlüsselattribute                                                                  | Beschreibung                                  |
| ----------------- | ----------------------------------------------------------------------------------- | --------------------------------------------- |
| `fee_distributed` | `total_fees`, `validator_amount`, `burn_amount`, `treasury_amount`, `staker_amount` | Wird ausgelöst, wenn eingesammelte Gebühren verteilt werden |
| `tokens_burned`   | `amount`, `channel`, `block_height`                                                 | Wird ausgelöst, wenn Token dauerhaft verbrannt werden |

### xQORE-Modul

| Ereignistyp      | Schlüsselattribute                                            | Beschreibung                                |
| ---------------- | ------------------------------------------------------------- | ------------------------------------------- |
| `xqore_locked`   | `address`, `amount`, `lock_duration`, `tier`                  | Wird ausgelöst, wenn QOR in xQORE gesperrt wird |
| `xqore_unlocked` | `address`, `amount`, `penalty_applied`, `penalty_amount`      | Wird ausgelöst, wenn xQORE wieder zu QOR entsperrt wird |
| `pvp_rebase`     | `epoch`, `total_penalty`, `rebase_amount`, `beneficiary_count` | Wird während der PvP-Rebase-Verteilung ausgelöst |

### Inflations-Modul

| Ereignistyp    | Schlüsselattribute                                        | Beschreibung                                |
| -------------- | --------------------------------------------------------- | ------------------------------------------- |
| `epoch_minted` | `epoch`, `minted_amount`, `inflation_rate`, `block_height` | Wird am Ende jeder Inflationsepoche ausgelöst |

### RL-Konsens-Modul

PRISM-Parameteranpassungen und Circuit-Breaker-Aktivität werden über dieses Modul ausgegeben.

| Ereignistyp                 | Schlüsselattribute                                            | Beschreibung                                              |
| --------------------------- | ------------------------------------------------------------- | -------------------------------------------------------- |
| `rl_action_applied`         | `action_type`, `param_key`, `old_value`, `new_value`, `reward` | Wird ausgelöst, wenn der PRISM-Agent eine Parameteranpassung anwendet |
| `circuit_breaker_triggered` | `reason`, `param_key`, `attempted_value`, `limit`             | Wird ausgelöst, wenn der PRISM-Circuit-Breaker eine Aktion blockiert |

---

## JavaScript-Client-Beispiel

### EVM-WebSocket (ethers.js)

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

### QoreChain-RPC-WebSocket (nativ)

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

## Hinweise

- **Verbindungslimits**: Die standardmäßige maximale Anzahl von WebSocket-Verbindungen ist unbegrenzt (`max-open-connections = 0`). Legen Sie für Produktionsbereitstellungen ein Limit in `app.toml` fest.
- **Ereignispuffer**: Der RPC-WebSocket puffert bis zu 200 Ereignisse pro Abonnement. Wenn der Client zurückfällt, werden ältere Ereignisse verworfen.
- **Wiederverbindung**: Clients sollten eine automatische Wiederverbindung mit exponentiellem Backoff implementieren, da WebSocket-Verbindungen bei Node-Neustarts oder -Upgrades unterbrochen werden können.
