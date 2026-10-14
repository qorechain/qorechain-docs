---
slug: /api-reference/websocket-events
title: WebSocket-Ereignisse
sidebar_label: WebSocket-Ereignisse
sidebar_position: 5
---

# WebSocket-Ereignisse

QoreChain bietet Echtzeit-Event-Streaming über zwei WebSocket-Schnittstellen: den EVM-kompatiblen WebSocket und den QoreChain-Consensus-Engine-RPC-WebSocket.

:::note
Der RPC-WebSocket der Consensus Engine ist öffentlich sowohl im **`qorechain-vladi`**-Mainnet als auch im **`qorechain-diana`**-Testnet verfügbar. Der EVM-WebSocket ist öffentlich **nur im Testnet** verfügbar: Es gibt keinen öffentlichen Mainnet-EVM-WebSocket (`wss://evm.qore.host` und `wss://evm-ws.qore.host` akzeptieren keine WebSocket-Verbindungen). Betreiben Sie im Mainnet daher für `eth_subscribe` einen eigenen Node. Die folgenden lokalen Endpunkte setzen einen selbst betriebenen Node voraus.

| Schnittstelle | Mainnet | Testnet |
| --------- | ------- | ------- |
| RPC WebSocket | `wss://rpc.qore.host/websocket` | `wss://rpc-testnet.qore.host/websocket` |
| EVM WebSocket | keiner (nur eigener Node) | `wss://evm-ws-testnet.qore.host` |
:::

---

## EVM WebSocket

**Endpunkt:** `ws://localhost:8546` auf Ihrem eigenen Node; öffentliches Testnet: `wss://evm-ws-testnet.qore.host`. Es gibt keinen öffentlichen Mainnet-EVM-WebSocket.

Der EVM-WebSocket unterstützt die Standardmethode `eth_subscribe` für Echtzeit-Event-Streaming, das mit Ethereum-Tools kompatibel ist.

### Subscription-Typen

| Subscription             | Beschreibung                                          |
| ------------------------ | ------------------------------------------------------ |
| `newHeads`               | Gibt einen Header aus, sobald ein neuer Block angehängt wird |
| `logs`                   | Gibt Logs aus, die einem optionalen Filter entsprechen  |
| `newPendingTransactions` | Gibt Transaktions-Hashes aus, die in den Mempool gelangen |

Die Subscription `syncing` ist nicht implementiert: `eth_subscribe` mit `"syncing"` liefert `-32600 syncing subscription is not implemented`. Fragen Sie stattdessen `eth_syncing` über HTTP ab.

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

### Abbestellen

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

**Endpunkt:** `ws://localhost:26657/websocket` auf Ihrem eigenen Node; öffentlich: `wss://rpc.qore.host/websocket` (Mainnet) und `wss://rpc-testnet.qore.host/websocket` (Testnet).

Der RPC-WebSocket nutzt das Event-Subscription-System der QoreChain Consensus Engine. Clients abonnieren mit einem Query-String, der Ereignisse nach Typ und Attributen filtert.

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

### Modul-spezifische Ereignisse abonnieren

Filtern Sie nach Ereignistyp, um nur Ereignisse eines bestimmten Moduls zu erhalten:

```json
{
  "jsonrpc": "2.0",
  "method": "subscribe",
  "params": {
    "query": "tm.event='Tx' AND bridge_deposit.chain EXISTS"
  },
  "id": 3
}
```

### Abbestellen

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

## Referenz der Modul-Ereignisse

Ereignisse werden als Standard-Ereignisse der Consensus Engine ausgegeben. Abonnieren Sie mit einer `tm.event='Tx'`-Query, die nach Ereignistyp und Attribut gefiltert ist (zum Beispiel `tm.event='Tx' AND bridge_deposit.chain EXISTS`). Ereignisse auf Blockebene (also solche, die von der End-of-Block-Logik ausgegeben werden, wie die PRISM-Ereignisse unten) werden mit `tm.event='NewBlock'` zugestellt, nicht mit `Tx`. Die unten aufgeführten Namen und Attribute entsprechen der Chain-Version v3.2.0.

:::note Welche Ereignisse Sie tatsächlich sehen werden
Viele dieser Module sind in den öffentlichen Netzwerken inaktiv: Die Bridge ist nicht live, es sind noch keine Multilayer-Layer oder Rollups registriert, und xQORE ist nicht nutzbar. Ihre Ereignisse sind zwar definiert, werden aber erst ausgelöst, wenn es Aktivität gibt. Die PRISM-Beobachtungs- und Belohnungsereignisse (`rl_observation_collected`, `rl_reward_computed`) werden in beiden Netzwerken etwa alle 10 Blöcke ausgegeben.
:::

### PQC-Modul

| Ereignistyp                 | Schlüsselattribute                                        | Beschreibung                                         |
| --------------------------- | --------------------------------------------------------- | ---------------------------------------------------- |
| `pqc_verify`                | `address`, `key_type`, `algorithm_id`, `hybrid_mode`, `status` | Wird bei jeder PQC-Signaturprüfung ausgegeben             |
| `pqc_hybrid_verify`         | `address`, `algorithm_id`, `status`                       | Wird bei jeder Hybrid-Signaturverifizierung ausgegeben        |
| `pqc_hybrid_classical_only` | `address`, `hybrid_mode`                                  | Wird ausgegeben, wenn eine rein klassische Signatur vom aktuellen Modus akzeptiert wird |
| `pqc_key_registered`        | `address`, `key_type`, `algorithm_id`                     | Wird ausgegeben, wenn ein PQC-Schlüssel registriert wird                 |
| `pqc_key_rotated`           | `address`, `algorithm_id`                                 | Wird ausgegeben, wenn ein PQC-Schlüssel rotiert wird                    |
| `pqc_key_migrated`          | `address`, `from_algorithm`, `to_algorithm`               | Wird ausgegeben, wenn ein Schlüssel auf einen neuen Algorithmus migriert wird    |
| `pqc_evm_window_opened`     | `address`, `expiry_height`, `max_txs`, `max_value`        | Wird ausgegeben, wenn sich ein Autorisierungsfenster der EVM-Lane öffnet  |
| `pqc_evm_window_closed`     | `address`                                                 | Wird ausgegeben, wenn sich ein Autorisierungsfenster der EVM-Lane schließt |

PQC-Schlüssel werden explizit mit einer Registrierungstransaktion registriert; es gibt kein Ereignis für eine automatische Registrierung.

### Bridge-Modul

| Ereignistyp                   | Schlüsselattribute                                       | Beschreibung                                  |
| ----------------------------- | -------------------------------------------------------- | -------------------------------------------- |
| `bridge_deposit`              | `operation_id`, `chain`, `asset`, `amount`, `sender`     | Wird ausgegeben, wenn eine eingehende Einzahlung erfasst wird  |
| `bridge_withdraw`             | `operation_id`, `chain`, `asset`, `amount`, `sender`, `receiver` | Wird ausgegeben, wenn eine Auszahlung erfasst wird |
| `bridge_attestation`          | `operation_id`, `validator`, `chain`, `pqc_verified`, `attestations` | Wird für jede Validator-Attestierung ausgegeben |
| `bridge_operation_executed`   | `operation_id`, `status`                                 | Wird ausgegeben, wenn eine Operation abgeschlossen wird          |
| `bridge_circuit_breaker_trip` | `chain`, `status`, `reason`                              | Wird ausgegeben, wenn der Bridge-Circuit-Breaker einer Chain auslöst |

### Cross-VM-Modul

| Ereignistyp        | Schlüsselattribute                                                          | Beschreibung                                           |
| ------------------ | --------------------------------------------------------------------------- | ----------------------------------------------------- |
| `crossvm_request`  | `message_id`, `source_vm`, `target_vm`, `target_contract`, `sender`         | Wird ausgegeben, wenn ein Cross-VM-Aufruf initiiert wird             |
| `crossvm_response` | `message_id`, `status`                                                      | Wird ausgegeben, wenn ein Cross-VM-Aufruf abgeschlossen wird                |
| `crossvm_timeout`  | `message_id`                                                                | Wird ausgegeben, wenn eine Cross-VM-Nachricht das Warteschlangen-Timeout überschreitet |

### Multilayer-Modul

| Ereignistyp             | Schlüsselattribute                                                                           | Beschreibung                                  |
| ----------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `state_anchored`        | `layer_id`, `layer_height`, `state_root`, `main_chain_height`, `pqc_verified`, `transaction_count` | Wird ausgegeben, wenn ein Layer-State-Anker akzeptiert wird |
| `anchor_challenged`     | `layer_id`, `layer_height`, `challenger`, `challenge_reason`, `resolution`                   | Wird ausgegeben, wenn ein Anker angefochten wird         |
| `layer_status_updated`  | `layer_id`, `status`, `reason`                                                               | Wird ausgegeben, wenn ein Layer seinen Status ändert          |
| `sidechain_registered`, `paychain_registered` | `layer_id`, `layer_type`, `creator`, `status`                          | Wird ausgegeben, wenn ein Layer registriert wird           |
| `transaction_routed`    | `selected_layer`, `routing_reason`, `gas_savings`, `latency_ms`, `sender`                    | Wird ausgegeben, wenn eine Transaktion an einen Layer geroutet wird |

### RDK-Modul

| Ereignistyp       | Schlüsselattribute                                          | Beschreibung                                      |
| ----------------- | ----------------------------------------------------------- | ------------------------------------------------ |
| `rollup_created`  | `rollup_id`, `creator`, `profile`, `settlement_mode`        | Wird ausgegeben, wenn ein neuer Rollup registriert wird          |
| `batch_submitted` | `rollup_id`, `batch_index`, `tx_count`                      | Wird ausgegeben, wenn ein Abwicklungs-Batch übermittelt wird     |
| `batch_finalized` | `rollup_id`, `batch_index`                                  | Wird ausgegeben, wenn ein Batch sein Challenge-Fenster erfolgreich durchläuft |
| `da_blob_stored`  | `rollup_id`, `blob_index`, `backend`, `size`                | Wird ausgegeben, wenn ein DA-Blob gespeichert wird                |
| `da_blob_pruned`  | `rollup_id`, `blob_index`                                   | Wird ausgegeben, wenn ein DA-Blob nach Ablauf der Aufbewahrungsfrist entfernt wird |

### Burn-Modul

| Ereignistyp              | Schlüsselattribute                                        | Beschreibung                                         |
| ------------------------ | --------------------------------------------------------- | --------------------------------------------------- |
| `burn`                   | `source`, `amount`                                        | Wird ausgegeben, wenn Tokens dauerhaft verbrannt werden          |
| `milestone_burn`         | `tx_threshold`, `burn_amount`, `cumulative_tx_count`      | Wird ausgegeben, wenn ein Meilenstein-Burn für die Transaktionsanzahl ausgeführt wird |
| `burn_stranded_released` | `amount`, `destination`, `remaining`                      | Wird ausgegeben, wenn die Governance einen Teil des gestrandeten Staker-Anteils freigibt |

### xQORE-Modul

Diese Ereignisse werden noch nicht ausgegeben: xQORE ist in keinem veröffentlichten Node-Build live (siehe [xQORE Staking](/user-guide/xqore-staking)).

| Ereignistyp    | Schlüsselattribute                                                    | Beschreibung                              |
| -------------- | --------------------------------------------------------------------- | ---------------------------------------- |
| `xqore_lock`   | `owner`, `amount`                                                     | Wird ausgegeben, wenn QOR in xQORE gesperrt wird    |
| `xqore_unlock` | `owner`, `amount`, `penalty`, `burned`, `redistributed`, `returned`   | Wird ausgegeben, wenn xQORE zurück in QOR entsperrt wird |

### PRISM-Konsens-Modul (RL-Konsens)

Dies sind End-of-Block-Ereignisse, die über den `NewBlock`-Stream zugestellt werden.

| Ereignistyp                    | Schlüsselattribute      | Beschreibung                                                   |
| ------------------------------ | ----------------------- | ------------------------------------------------------------- |
| `rl_observation_collected`     | `height`                | Wird ausgegeben, wenn eine PRISM-Beobachtung erfasst wird (etwa alle 10 Blöcke) |
| `rl_reward_computed`           | `height`, `reward`      | Wird ausgegeben, wenn die PRISM-Belohnung berechnet wird                     |
| `rl_action_applied`            | `height`, `agent_mode`  | Wird ausgegeben, wenn der PRISM-Agent eine Parameteranpassung vornimmt   |
| `rl_agent_mode_changed`        | `height`, `agent_mode`  | Wird ausgegeben, wenn sich der Agentenmodus ändert                   |
| `rl_circuit_breaker_triggered` | `height`                | Wird ausgegeben, wenn der PRISM-Circuit-Breaker eine Aktion blockiert       |
| `rl_circuit_breaker_recovered` | `height`                | Wird ausgegeben, wenn sich der Circuit-Breaker erholt                  |

### KI-Modul

| Ereignistyp        | Schlüsselattribute                               | Beschreibung                                         |
| ------------------ | ------------------------------------------------ | --------------------------------------------------- |
| `ai_anomaly_check` | `score_millionths`, `action`, `is_anomalous`     | Wird für jede auf Anomalien bewertete Transaktion ausgegeben         |

---

## JavaScript-Client-Beispiel

### EVM WebSocket (ethers.js)

```javascript
import { ethers } from "ethers";

// Own node: ws://localhost:8546. Public testnet: wss://evm-ws-testnet.qore.host
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
// Own node: ws://localhost:26657/websocket. Public: wss://rpc.qore.host/websocket
const ws = new WebSocket("ws://localhost:26657/websocket");

ws.onopen = () => {
  // Subscribe to bridge deposits
  ws.send(JSON.stringify({
    jsonrpc: "2.0",
    method: "subscribe",
    params: { query: "tm.event='Tx' AND bridge_deposit.chain EXISTS" },
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

- **Verbindungslimits**: Auf einem selbst betriebenen Node ist die standardmäßige maximale Anzahl an WebSocket-Verbindungen unbegrenzt (`max-open-connections = 0`). Legen Sie für Produktionsumgebungen ein Limit in `app.toml` fest. Die öffentlichen Endpunkte wenden eigene Limits an.
- **Ereignispuffer**: Der RPC-WebSocket puffert pro Subscription eine begrenzte Anzahl von Ereignissen (Standard sind 200 auf einem selbst gehosteten Node). Wenn der Client in Rückstand gerät, werden ältere Ereignisse verworfen.
- **Wiederverbindung**: Clients sollten eine automatische Wiederverbindung mit exponentiellem Backoff implementieren, da WebSocket-Verbindungen bei Node-Neustarts oder -Upgrades unterbrochen werden können.
