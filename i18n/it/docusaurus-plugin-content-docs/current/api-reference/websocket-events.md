---
slug: /api-reference/websocket-events
title: Eventi WebSocket
sidebar_label: Eventi WebSocket
sidebar_position: 5
---

# Eventi WebSocket

QoreChain fornisce lo streaming di eventi in tempo reale attraverso due interfacce WebSocket: il WebSocket compatibile con EVM e il WebSocket RPC del Consensus Engine di QoreChain.

:::note
Il WebSocket RPC del consensus engine è disponibile pubblicamente sia sulla mainnet **`qorechain-vladi`** sia sulla testnet **`qorechain-diana`**. Il WebSocket EVM è disponibile pubblicamente **solo sulla testnet**: non esiste un WebSocket EVM pubblico sulla mainnet (`wss://evm.qore.host` e `wss://evm-ws.qore.host` non accettano connessioni WebSocket), quindi sulla mainnet eseguite un vostro nodo per usare `eth_subscribe`. Gli endpoint locali riportati di seguito presuppongono un nodo gestito da voi stessi.

| Interfaccia | Mainnet | Testnet |
| ----------- | ------- | ------- |
| WebSocket RPC | `wss://rpc.qore.host/websocket` | `wss://rpc-testnet.qore.host/websocket` |
| WebSocket EVM | nessuno (solo nodo proprio) | `wss://evm-ws-testnet.qore.host` |
:::

---

## WebSocket EVM

**Endpoint:** `ws://localhost:8546` sul vostro nodo; testnet pubblica: `wss://evm-ws-testnet.qore.host`. Non esiste un WebSocket EVM pubblico sulla mainnet.

Il WebSocket EVM supporta il metodo standard `eth_subscribe` per lo streaming di eventi in tempo reale, compatibile con gli strumenti dell'ecosistema Ethereum.

### Tipi di sottoscrizione

| Sottoscrizione            | Descrizione                                              |
| ------------------------ | --------------------------------------------------------- |
| `newHeads`               | Emette un header ogni volta che viene aggiunto un nuovo blocco |
| `logs`                   | Emette i log corrispondenti a un filtro opzionale          |
| `newPendingTransactions` | Emette gli hash delle transazioni in ingresso nel mempool  |

La sottoscrizione `syncing` non è implementata: `eth_subscribe` con `"syncing"` restituisce `-32600 syncing subscription is not implemented`. Interrogate invece `eth_syncing` via HTTP.

### Sottoscrivere i nuovi blocchi

```json
{
  "jsonrpc": "2.0",
  "method": "eth_subscribe",
  "params": ["newHeads"],
  "id": 1
}
```

### Sottoscrivere i log con filtro

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

### Annullare la sottoscrizione

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

**Endpoint:** `ws://localhost:26657/websocket` sul vostro nodo; pubblici: `wss://rpc.qore.host/websocket` (mainnet) e `wss://rpc-testnet.qore.host/websocket` (testnet).

Il WebSocket RPC utilizza il sistema di sottoscrizione eventi del Consensus Engine di QoreChain. I client si sottoscrivono con una stringa di query che filtra gli eventi per tipo e attributi.

### Sottoscrivere tutti i nuovi blocchi

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

### Sottoscrivere tutte le transazioni

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

### Sottoscrivere eventi specifici di un modulo

Filtrate per tipo di evento per ricevere solo gli eventi provenienti da un modulo specifico:

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

### Annullare la sottoscrizione

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

Gli eventi vengono emessi come eventi standard del consensus engine. Sottoscrivetevi con una query `tm.event='Tx'` filtrata sul tipo di evento e sull'attributo (ad esempio `tm.event='Tx' AND bridge_deposit.chain EXISTS`). Gli eventi a livello di blocco (quelli emessi dalla logica di fine blocco, come gli eventi PRISM qui sotto) vengono consegnati con `tm.event='NewBlock'`, non con `Tx`. I nomi e gli attributi riportati di seguito sono quelli della versione della chain v3.2.0.

:::note Quali eventi vedrete davvero
Molti di questi moduli sono inattivi sulle reti pubbliche: il bridge non è attivo, non è ancora registrato alcun layer multilayer né alcun rollup, e xQORE non è utilizzabile. I loro eventi sono definiti ma non vengono emessi finché non c'è attività. Gli eventi di osservazione e di ricompensa PRISM (`rl_observation_collected`, `rl_reward_computed`) vengono emessi circa ogni 10 blocchi su entrambe le reti.
:::

### Modulo PQC

| Tipo di evento              | Attributi chiave                                     | Descrizione                                          |
| --------------------------- | ------------------------------------------------------ | ----------------------------------------------------- |
| `pqc_verify`                | `address`, `key_type`, `algorithm_id`, `hybrid_mode`, `status` | Emesso a ogni verifica di firma PQC |
| `pqc_hybrid_verify`         | `address`, `algorithm_id`, `status`                       | Emesso a ogni verifica di firma ibrida                |
| `pqc_hybrid_classical_only` | `address`, `hybrid_mode`                                  | Emesso quando una firma solo classica viene accettata dalla modalità corrente |
| `pqc_key_registered`        | `address`, `key_type`, `algorithm_id`                     | Emesso quando una chiave PQC viene registrata |
| `pqc_key_rotated`           | `address`, `algorithm_id`                                 | Emesso quando una chiave PQC viene ruotata |
| `pqc_key_migrated`          | `address`, `from_algorithm`, `to_algorithm`               | Emesso quando una chiave viene migrata a un nuovo algoritmo |
| `pqc_evm_window_opened`     | `address`, `expiry_height`, `max_txs`, `max_value`        | Emesso quando si apre una finestra di autorizzazione della corsia EVM |
| `pqc_evm_window_closed`     | `address`                                                 | Emesso quando si chiude una finestra di autorizzazione della corsia EVM |

Le chiavi PQC vengono registrate esplicitamente con una transazione di registrazione; non esiste alcun evento di registrazione automatica.

### Modulo Bridge

| Tipo di evento                | Attributi chiave                                         | Descrizione                                  |
| ----------------------------- | -------------------------------------------------------- | -------------------------------------------- |
| `bridge_deposit`              | `operation_id`, `chain`, `asset`, `amount`, `sender`     | Emesso quando viene registrato un deposito in ingresso |
| `bridge_withdraw`             | `operation_id`, `chain`, `asset`, `amount`, `sender`, `receiver` | Emesso quando viene registrato un prelievo |
| `bridge_attestation`          | `operation_id`, `validator`, `chain`, `pqc_verified`, `attestations` | Emesso per ogni attestazione di un validatore |
| `bridge_operation_executed`   | `operation_id`, `status`                                 | Emesso quando un'operazione si completa |
| `bridge_circuit_breaker_trip` | `chain`, `status`, `reason`                              | Emesso quando scatta il circuit breaker del bridge di una chain |

### Modulo Cross-VM

| Tipo di evento     | Attributi chiave                                                            | Descrizione                                           |
| ------------------ | --------------------------------------------------------------------------- | ----------------------------------------------------- |
| `crossvm_request`  | `message_id`, `source_vm`, `target_vm`, `target_contract`, `sender`         | Emesso quando viene avviata una chiamata cross-VM |
| `crossvm_response` | `message_id`, `status`                                                      | Emesso quando una chiamata cross-VM si completa |
| `crossvm_timeout`  | `message_id`                                                                | Emesso quando un messaggio cross-VM supera il timeout di coda |

### Modulo Multilayer

| Tipo di evento          | Attributi chiave                                                                             | Descrizione                                  |
| ----------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `state_anchored`        | `layer_id`, `layer_height`, `state_root`, `main_chain_height`, `pqc_verified`, `transaction_count` | Emesso quando un anchor di stato del layer viene accettato |
| `anchor_challenged`     | `layer_id`, `layer_height`, `challenger`, `challenge_reason`, `resolution`                   | Emesso quando un anchor viene contestato |
| `layer_status_updated`  | `layer_id`, `status`, `reason`                                                               | Emesso quando un layer cambia stato |
| `sidechain_registered`, `paychain_registered` | `layer_id`, `layer_type`, `creator`, `status`                          | Emesso quando un layer viene registrato |
| `transaction_routed`    | `selected_layer`, `routing_reason`, `gas_savings`, `latency_ms`, `sender`                    | Emesso quando una transazione viene instradata a un layer |

### Modulo RDK

| Tipo di evento    | Attributi chiave                                            | Descrizione                                      |
| ----------------- | ----------------------------------------------------------- | ------------------------------------------------ |
| `rollup_created`  | `rollup_id`, `creator`, `profile`, `settlement_mode`        | Emesso quando viene registrato un nuovo rollup |
| `batch_submitted` | `rollup_id`, `batch_index`, `tx_count`                      | Emesso quando viene inviato un batch di settlement |
| `batch_finalized` | `rollup_id`, `batch_index`                                  | Emesso quando un batch supera la finestra di contestazione |
| `da_blob_stored`  | `rollup_id`, `blob_index`, `backend`, `size`                | Emesso quando un blob DA viene memorizzato |
| `da_blob_pruned`  | `rollup_id`, `blob_index`                                   | Emesso quando un blob DA viene eliminato dopo il periodo di conservazione |

### Modulo Burn

| Tipo di evento           | Attributi chiave                                          | Descrizione                                         |
| ------------------------ | --------------------------------------------------------- | --------------------------------------------------- |
| `burn`                   | `source`, `amount`                                        | Emesso quando i token vengono bruciati in modo permanente |
| `milestone_burn`         | `tx_threshold`, `burn_amount`, `cumulative_tx_count`      | Emesso quando viene eseguito un burn per traguardo del numero di transazioni |
| `burn_stranded_released` | `amount`, `destination`, `remaining`                      | Emesso quando la governance rilascia una parte della quota bloccata degli staker |

### Modulo xQORE

Questi eventi non vengono ancora emessi: xQORE non è attivo in nessuna build del nodo rilasciata (vedi [Staking xQORE](/user-guide/xqore-staking)).

| Tipo di evento | Attributi chiave                                                      | Descrizione                              |
| -------------- | --------------------------------------------------------------------- | ---------------------------------------- |
| `xqore_lock`   | `owner`, `amount`                                                     | Emesso quando QOR viene bloccato in xQORE |
| `xqore_unlock` | `owner`, `amount`, `penalty`, `burned`, `redistributed`, `returned`   | Emesso quando xQORE viene sbloccato e riconvertito in QOR |

### Modulo PRISM Consensus (RL Consensus)

Questi sono eventi di fine blocco, consegnati sul flusso `NewBlock`.

| Tipo di evento                 | Attributi chiave        | Descrizione                                                   |
| ------------------------------ | ----------------------- | ------------------------------------------------------------- |
| `rl_observation_collected`     | `height`                | Emesso quando viene effettuata un'osservazione PRISM (circa ogni 10 blocchi) |
| `rl_reward_computed`           | `height`, `reward`      | Emesso quando viene calcolata la ricompensa PRISM |
| `rl_action_applied`            | `height`, `agent_mode`  | Emesso quando l'agente PRISM applica una regolazione di parametro |
| `rl_agent_mode_changed`        | `height`, `agent_mode`  | Emesso quando cambia la modalità dell'agente |
| `rl_circuit_breaker_triggered` | `height`                | Emesso quando il circuit breaker PRISM blocca un'azione |
| `rl_circuit_breaker_recovered` | `height`                | Emesso quando il circuit breaker si ripristina |

### Modulo AI

| Tipo di evento     | Attributi chiave                                 | Descrizione                                         |
| ------------------ | ------------------------------------------------ | --------------------------------------------------- |
| `ai_anomaly_check` | `score_millionths`, `action`, `is_anomalous`     | Emesso per ogni transazione con punteggio di anomalia |

---

## Esempio di client JavaScript

### WebSocket EVM (ethers.js)

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

### WebSocket RPC di QoreChain (nativo)

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

## Note

- **Limiti di connessione**: su un nodo gestito da voi stessi, il numero massimo predefinito di connessioni WebSocket è illimitato (`max-open-connections = 0`). Impostate un limite in `app.toml` per gli ambienti di produzione. Gli endpoint pubblici applicano limiti propri.
- **Buffer degli eventi**: il WebSocket RPC memorizza in buffer un numero limitato di eventi per sottoscrizione (200 per impostazione predefinita su un nodo self-hosted). Se il client rimane indietro, gli eventi più vecchi vengono scartati.
- **Riconnessione**: i client dovrebbero implementare la riconnessione automatica con backoff esponenziale, poiché le connessioni WebSocket possono essere interrotte durante i riavvii o gli aggiornamenti del nodo.
