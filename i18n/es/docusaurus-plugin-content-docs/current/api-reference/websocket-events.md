---
slug: /api-reference/websocket-events
title: Eventos WebSocket
sidebar_label: Eventos WebSocket
sidebar_position: 5
---

# Eventos WebSocket

QoreChain proporciona transmisión de eventos en tiempo real a través de dos interfaces WebSocket: el WebSocket compatible con la EVM y el WebSocket RPC del Motor de Consenso de QoreChain.

:::note
Ambas interfaces WebSocket están disponibles en la red principal **`qorechain-vladi`** (activa en la versión de cadena **v3.1.82**) y en la red de pruebas **`qorechain-diana`**. Los endpoints locales siguientes asumen un nodo que ejecutes tú mismo; sustituye el host de red principal o de pruebas de tu proveedor para el acceso remoto.
:::

---

## WebSocket de la EVM

**Endpoint:** `ws://localhost:8546`

El WebSocket de la EVM admite el método estándar `eth_subscribe` para la transmisión de eventos en tiempo real compatible con las herramientas de Ethereum.

### Tipos de suscripción

| Suscripción              | Descripción                                      |
| ------------------------ | ------------------------------------------------ |
| `newHeads`               | Emite un encabezado cada vez que se añade un nuevo bloque |
| `logs`                   | Emite los logs que coinciden con un filtro opcional |
| `newPendingTransactions` | Emite los hashes de las transacciones que entran en el mempool |
| `syncing`                | Emite actualizaciones del estado de sincronización |

### Suscribirse a nuevos bloques

```json
{
  "jsonrpc": "2.0",
  "method": "eth_subscribe",
  "params": ["newHeads"],
  "id": 1
}
```

### Suscribirse a logs con un filtro

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

### Cancelar suscripción

```json
{
  "jsonrpc": "2.0",
  "method": "eth_unsubscribe",
  "params": ["0x1a2b3c..."],
  "id": 3
}
```

---

## WebSocket RPC de QoreChain

**Endpoint:** `ws://localhost:26657/websocket`

El WebSocket RPC usa el sistema de suscripción de eventos del Motor de Consenso de QoreChain. Los clientes se suscriben con una cadena de consulta que filtra los eventos por tipo y atributos.

### Suscribirse a todos los nuevos bloques

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

### Suscribirse a todas las transacciones

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

### Suscribirse a eventos específicos de un módulo

Filtra por tipo de evento para recibir solo los eventos de un módulo específico:

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

### Cancelar suscripción

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

## Referencia de eventos de módulos

### Módulo PQC

| Tipo de evento             | Atributos clave                                      | Descripción                                   |
| -------------------------- | ---------------------------------------------------- | --------------------------------------------- |
| `pqc_hybrid_verify`        | `address`, `algorithm`, `result` (pass/fail), `mode` | Se emite en cada verificación de firma híbrida |
| `pqc_hybrid_auto_register` | `address`, `algorithm`, `pubkey_hash`                | Se emite cuando una clave PQC se registra automáticamente |

### Módulo de IA

| Tipo de evento    | Atributos clave                                                     | Descripción                                      |
| ----------------- | ------------------------------------------------------------------- | ------------------------------------------------ |
| `fraud_alert`     | `severity` (low/medium/high/critical), `address`, `reason`, `score` | Se emite cuando se detecta fraude en una transacción |
| `circuit_breaker` | `module`, `action` (tripped/reset), `threshold`, `value`            | Se emite cuando un disyuntor de IA cambia de estado |

### Módulo de puente

| Tipo de evento         | Atributos clave                                                | Descripción                                             |
| ---------------------- | -------------------------------------------------------------- | ------------------------------------------------------- |
| `deposit_completed`    | `chain_id`, `sender`, `recipient`, `amount`, `asset`, `tx_hash` | Se emite cuando se confirma un depósito de puente entrante |
| `withdrawal_completed` | `chain_id`, `sender`, `recipient`, `amount`, `asset`, `tx_hash` | Se emite cuando se confirma un retiro de puente saliente |

### Módulo Cross-VM

| Tipo de evento     | Atributos clave                                                 | Descripción                                           |
| ------------------ | --------------------------------------------------------------- | ----------------------------------------------------- |
| `crossvm_request`  | `message_id`, `source_vm`, `target_vm`, `sender`, `payload_hash` | Se emite cuando se inicia una llamada entre VM        |
| `crossvm_response` | `message_id`, `source_vm`, `target_vm`, `success`, `gas_used`    | Se emite cuando se completa una llamada entre VM      |
| `crossvm_timeout`  | `message_id`, `source_vm`, `target_vm`, `queued_at_height`       | Se emite cuando un mensaje entre VM supera el tiempo de espera de la cola |

### Módulo Multilayer

| Tipo de evento         | Atributos clave                                               | Descripción                                     |
| ---------------------- | -------------------------------------------------------------- | ----------------------------------------------- |
| `anchor_submitted`     | `layer_id`, `layer_type`, `anchor_hash`, `height`, `submitter` | Se emite cuando se envía un anclaje de estado de capa |
| `layer_status_changed` | `layer_id`, `previous_status`, `new_status`, `reason`          | Se emite cuando una capa cambia de estado operativo |

### Módulo RDK

| Tipo de evento    | Atributos clave                                       | Descripción                                      |
| ----------------- | ----------------------------------------------------- | ------------------------------------------------ |
| `rollup_created`  | `rollup_id`, `operator`, `settlement_type`, `profile` | Se emite cuando se registra un nuevo rollup       |
| `batch_submitted` | `rollup_id`, `batch_index`, `state_root`, `tx_count`  | Se emite cuando se envía un lote de liquidación    |
| `batch_finalized` | `rollup_id`, `batch_index`, `finalized_at_height`     | Se emite cuando un lote supera su ventana de impugnación |
| `da_blob_stored`  | `rollup_id`, `blob_index`, `size_bytes`, `commitment` | Se emite cuando se almacena un blob de DA          |
| `da_blob_pruned`  | `rollup_id`, `blob_index`, `pruned_at_height`         | Se emite cuando se purga un blob de DA tras la retención |

### Módulo de quema

| Tipo de evento    | Atributos clave                                                                    | Descripción                                 |
| ----------------- | ----------------------------------------------------------------------------------- | ------------------------------------------- |
| `fee_distributed` | `total_fees`, `validator_amount`, `burn_amount`, `treasury_amount`, `staker_amount` | Se emite cuando se distribuyen las comisiones recaudadas |
| `tokens_burned`   | `amount`, `channel`, `block_height`                                                 | Se emite cuando los tokens se queman de forma permanente |

### Módulo xQORE

| Tipo de evento   | Atributos clave                                               | Descripción                                |
| ---------------- | -------------------------------------------------------------- | ------------------------------------------ |
| `xqore_locked`   | `address`, `amount`, `lock_duration`, `tier`                   | Se emite cuando se bloquea QOR en xQORE     |
| `xqore_unlocked` | `address`, `amount`, `penalty_applied`, `penalty_amount`       | Se emite cuando se desbloquea xQORE de vuelta a QOR |
| `pvp_rebase`     | `epoch`, `total_penalty`, `rebase_amount`, `beneficiary_count` | Se emite durante la distribución de rebase PvP |

### Módulo de inflación

| Tipo de evento | Atributos clave                                           | Descripción                                |
| -------------- | ---------------------------------------------------------- | ------------------------------------------ |
| `epoch_minted` | `epoch`, `minted_amount`, `inflation_rate`, `block_height` | Se emite al final de cada época de inflación |

### Módulo RL Consensus

Los ajustes de parámetros de PRISM y la actividad de los disyuntores se emiten a través de este módulo.

| Tipo de evento              | Atributos clave                                               | Descripción                                                |
| --------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------- |
| `rl_action_applied`         | `action_type`, `param_key`, `old_value`, `new_value`, `reward` | Se emite cuando el agente PRISM aplica un ajuste de parámetro |
| `circuit_breaker_triggered` | `reason`, `param_key`, `attempted_value`, `limit`              | Se emite cuando el disyuntor de PRISM bloquea una acción     |

---

## Ejemplo de cliente JavaScript

### WebSocket de la EVM (ethers.js)

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

### WebSocket RPC de QoreChain (nativo)

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

## Notas

- **Límites de conexión**: el número máximo predeterminado de conexiones WebSocket es ilimitado (`max-open-connections = 0`). Establece un límite en `app.toml` para despliegues en producción.
- **Búfer de eventos**: el WebSocket RPC almacena en búfer hasta 200 eventos por suscripción. Si el cliente se queda atrás, se descartan los eventos más antiguos.
- **Reconexión**: los clientes deben implementar la reconexión automática con retroceso exponencial, ya que las conexiones WebSocket pueden interrumpirse durante los reinicios o actualizaciones del nodo.
