---
slug: /api-reference/websocket-events
title: Eventos de WebSocket
sidebar_label: Eventos de WebSocket
sidebar_position: 5
---

# Eventos de WebSocket

QoreChain proporciona transmisión de eventos en tiempo real a través de dos interfaces WebSocket: el WebSocket compatible con EVM y el WebSocket RPC del Motor de Consenso de QoreChain.

:::note
El WebSocket RPC del motor de consenso está disponible públicamente tanto en la mainnet **`qorechain-vladi`** como en la testnet **`qorechain-diana`**. El WebSocket EVM está disponible públicamente **solo en la testnet**: no existe un WebSocket EVM público de mainnet (`wss://evm.qore.host` y `wss://evm-ws.qore.host` no aceptan conexiones WebSocket), por lo que en mainnet debe ejecutar su propio nodo para usar `eth_subscribe`. Los endpoints locales que se muestran a continuación asumen un nodo que usted mismo ejecuta.

| Interfaz | Mainnet | Testnet |
| --------- | ------- | ------- |
| WebSocket RPC | `wss://rpc.qore.host/websocket` | `wss://rpc-testnet.qore.host/websocket` |
| WebSocket EVM | ninguno (solo nodo propio) | `wss://evm-ws-testnet.qore.host` |
:::

---

## WebSocket EVM

**Endpoint:** `ws://localhost:8546` en su propio nodo; testnet pública: `wss://evm-ws-testnet.qore.host`. No existe un WebSocket EVM público de mainnet.

El WebSocket EVM admite el método estándar `eth_subscribe` para la transmisión de eventos en tiempo real, compatible con las herramientas de Ethereum.

### Tipos de suscripción

| Suscripción               | Descripción                                              |
| ------------------------- | --------------------------------------------------------- |
| `newHeads`                | Emite un encabezado cada vez que se añade un nuevo bloque |
| `logs`                    | Emite registros que coinciden con un filtro opcional       |
| `newPendingTransactions`  | Emite hashes de transacciones que entran al mempool        |

La suscripción `syncing` no está implementada: `eth_subscribe` con `"syncing"` devuelve `-32600 syncing subscription is not implemented`. En su lugar, consulte `eth_syncing` por HTTP.

### Suscribirse a nuevos bloques

```json
{
  "jsonrpc": "2.0",
  "method": "eth_subscribe",
  "params": ["newHeads"],
  "id": 1
}
```

### Suscribirse a registros con filtro

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

**Endpoint:** `ws://localhost:26657/websocket` en su propio nodo; público: `wss://rpc.qore.host/websocket` (mainnet) y `wss://rpc-testnet.qore.host/websocket` (testnet).

El WebSocket RPC utiliza el sistema de suscripción a eventos del Motor de Consenso de QoreChain. Los clientes se suscriben con una cadena de consulta que filtra los eventos por tipo y atributos.

### Suscribirse a todos los bloques nuevos

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

Filtre por tipo de evento para recibir únicamente los eventos de un módulo específico:

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

## Referencia de eventos por módulo

Los eventos se emiten como eventos estándar del motor de consenso. Suscríbase con una consulta `tm.event='Tx'` filtrada por el tipo de evento y el atributo (por ejemplo `tm.event='Tx' AND bridge_deposit.chain EXISTS`). Los eventos a nivel de bloque (los emitidos por la lógica de fin de bloque, como los eventos de PRISM que se muestran más abajo) se entregan con `tm.event='NewBlock'`, no con `Tx`. Los nombres y atributos que se muestran a continuación corresponden a la versión de cadena v3.2.5 (mainnet desde el 29 de octubre de 2026, testnet desde el 26 de octubre de 2026) (la lista de eventos no cambia respecto a v3.2.4); los eventos añadidos en v3.2.4 están marcados. La testnet (v3.2.6) emite un evento más, `rl_action_proposed`, indicado junto con los eventos de PRISM.

:::note Qué eventos verá realmente
Muchos de estos módulos están inactivos en las redes públicas: el puente no está en producción, todavía no hay capas multilayer ni rollups registrados, y xQORE no se puede usar. Sus eventos están definidos, pero no se disparan hasta que haya actividad. Los eventos de observación y recompensa de PRISM (`rl_observation_collected`, `rl_reward_computed`) se emiten aproximadamente cada 10 bloques en ambas redes; en la testnet (v3.2.6) el agente emite además `rl_action_proposed` en cada paso.
:::

### Módulo PQC

| Tipo de evento              | Atributos clave                                           | Descripción                                          |
| --------------------------- | --------------------------------------------------------- | ---------------------------------------------------- |
| `pqc_verify`                | `address`, `key_type`, `algorithm_id`, `hybrid_mode`, `status` | Se emite en cada comprobación de firma PQC             |
| `pqc_hybrid_verify`         | `address`, `algorithm_id`, `status`                       | Se emite en cada verificación de firma híbrida        |
| `pqc_hybrid_classical_only` | `address`, `hybrid_mode`                                  | Se emite cuando el modo actual acepta una firma solo clásica |
| `pqc_key_registered`        | `address`, `key_type`, `algorithm_id`                     | Se emite cuando se registra una clave PQC                 |
| `pqc_key_rotated`           | `address`, `algorithm_id`                                 | Se emite cuando se rota una clave PQC                    |
| `pqc_key_migrated`          | `address`, `from_algorithm`, `to_algorithm`               | Se emite cuando una clave se migra a un nuevo algoritmo    |
| `pqc_evm_window_opened`     | `address`, `expiry_height`, `max_txs`, `max_value`; `native_only` y `allowed_targets` cuando la ventana tiene alcance (v3.2.3) | Se emite cuando se abre una ventana de autorización del carril EVM  |
| `pqc_evm_window_closed`     | `address`                                                 | Se emite cuando se cierra una ventana de autorización del carril EVM |
| `pqc_evm_delegation_consent` | `address`, `delegate`, `expiry_height`                   | Se emite cuando una cuenta registra su consentimiento para una delegación EIP-7702 (v3.2.2) |
| `pqc_evm_delegation_cleared` | `address`, `delegate`                                    | Se emite cuando se borra la delegación EIP-7702 de una cuenta (v3.2.2) |
| `pqc_algorithm_registered`, `pqc_algorithm_status_updated`, `pqc_algorithm_disabled` | `algorithm_id`, y `name`/`category`, `old_status`/`new_status` o `reason` | Cambios en el registro de algoritmos realizados por la gobernanza |

Las claves PQC se registran explícitamente con una transacción de registro; no existe ningún evento de registro automático.

### Módulo Bridge

| Tipo de evento                | Atributos clave                                          | Descripción                                  |
| ----------------------------- | -------------------------------------------------------- | -------------------------------------------- |
| `bridge_deposit`              | `operation_id`, `chain`, `asset`, `amount`, `sender`     | Se emite cuando se registra un depósito entrante  |
| `bridge_withdraw`             | `operation_id`, `chain`, `asset`, `amount`, `sender`, `receiver` | Se emite cuando se registra un retiro |
| `bridge_attestation`          | `operation_id`, `validator`, `chain`, `pqc_verified`, `attestations` | Se emite por cada atestación de un validador |
| `bridge_operation_executed`   | `operation_id`, `status`                                 | Se emite cuando se completa una operación          |
| `bridge_circuit_breaker_trip` | `chain`, `status`, `reason`                              | Se emite cuando se activa el disyuntor del puente de una cadena |

### Módulo Cross-VM

| Tipo de evento     | Atributos clave                                                             | Descripción                                           |
| ------------------ | --------------------------------------------------------------------------- | ----------------------------------------------------- |
| `crossvm_request`  | `message_id`, `source_vm`, `target_vm`, `target_contract`, `sender`         | Se emite cuando se inicia una llamada entre VMs             |
| `crossvm_response` | `message_id`, `status`                                                      | Se emite cuando se completa una llamada entre VMs                |
| `crossvm_timeout`  | `message_id`                                                                | Se emite cuando un mensaje entre VMs supera el tiempo de espera en cola |

### Módulo Multilayer

| Tipo de evento          | Atributos clave                                                                              | Descripción                                  |
| ----------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `state_anchored`        | `layer_id`, `layer_height`, `state_root`, `main_chain_height`, `pqc_verified`, `transaction_count` | Se emite cuando se acepta un anclaje de estado de capa |
| `anchor_challenged`     | `layer_id`, `layer_height`, `challenger`, `challenge_reason`, `resolution`                   | Se emite cuando se impugna un anclaje         |
| `layer_status_updated`  | `layer_id`, `status`, `reason`                                                               | Se emite cuando una capa cambia de estado          |
| `sidechain_registered`, `paychain_registered` | `layer_id`, `layer_type`, `creator`, `status`                          | Se emite cuando se registra una capa           |
| `transaction_routed`    | `selected_layer`, `routing_reason`, `gas_savings`, `latency_ms`, `sender`                    | Se emite cuando una transacción se enruta a una capa |

### Módulo RDK

| Tipo de evento    | Atributos clave                                             | Descripción                                      |
| ----------------- | ----------------------------------------------------------- | ------------------------------------------------ |
| `rollup_created`  | `rollup_id`, `creator`, `profile`, `settlement_mode`        | Se emite cuando se registra un nuevo rollup          |
| `rollup_paused`, `rollup_resumed`, `rollup_stopped` | `rollup_id` y un motivo cuando se indica | Se emite cuando un rollup se pausa, se reanuda o se detiene |
| `batch_challenged`, `challenge_resolved`, `batch_rejected` | `rollup_id`, `batch_index` (y `fraud_upheld` en una resolución) | Se emite cuando se impugna un lote, se resuelve la impugnación o se rechaza un lote |
| `batch_submitted` | `rollup_id`, `batch_index`, `tx_count`                      | Se emite cuando se envía un lote de liquidación     |
| `batch_finalized` | `rollup_id`, `batch_index`                                  | Se emite cuando un lote supera su ventana de impugnación |
| `da_blob_stored`  | `rollup_id`, `blob_index`, `backend`, `size`                | Se emite cuando se almacena un blob de DA                |
| `da_blob_pruned`  | `rollup_id`, `blob_index`                                   | Se emite cuando un blob de DA se elimina tras su período de retención |

### Módulo Burn

| Tipo de evento           | Atributos clave                                           | Descripción                                         |
| ------------------------ | --------------------------------------------------------- | --------------------------------------------------- |
| `burn`                   | `source`, `amount`                                        | Se emite cuando se queman tokens de forma permanente          |
| `milestone_burn`         | `tx_threshold`, `burn_amount`, `cumulative_tx_count`      | Se emite cuando se ejecuta una quema por hito de recuento de transacciones |
| `burn_stranded_released` | `amount`, `destination`, `remaining`                      | Se emite cuando la gobernanza libera parte de la cuota atrapada de los stakers |

### Módulos Inflation, Gas Abstraction, Licence, Light Node e IA

| Tipo de evento | Atributos clave | Descripción |
| ---------- | -------------- | ----------- |
| `inflation_params_updated` | `mode`, `fixed_epoch_emission`, `max_total_emission` | Se emite cuando la gobernanza cambia los parámetros de emisión |
| `gas_abstraction_conversion`, `gas_abstraction_refill` | `paid`, `native_equivalent`, `rate`, `price_source`, `result` | Se emite cuando se convierte una comisión en otro token aceptado, y cuando se repone el float (ninguno se dispara mientras solo se acepte `uqor`) |
| `gas_abstraction_float_funded`, `gas_abstraction_config_updated` | `sender`, `amount`; `accepted_tokens`, `block_conversion_cap` | Se emite cuando se dota el float y cuando la gobernanza actualiza la configuración |
| `license_granted`, `license_revoked`, `license_suspended`, `license_resumed`, `license_expired` | beneficiario y funcionalidad | Ciclo de vida de las licencias |
| `license_authority_updated` | `new_authority` | Se emite cuando la gobernanza reemplaza la autoridad de licencias (v3.2.3) |
| `lightnode_register`, `lightnode_heartbeat`, `lightnode_claim_rewards`, `lightnode_deregister`, `lightnode_status_change`, `lightnode_reward_distribution`, `lightnode_reserve_release` | `address`, `node_type`, `status`, `reward_amount`, `destination` | Eventos del ciclo de vida y de las recompensas de los nodos ligeros |
| `ai_config_updated` | `max_tx_per_minute`, `max_evm_tx_per_minute`, `anomaly_action`, `anomaly_threshold` | Se emite cuando la gobernanza actualiza la configuración del filtrado de IA |

### Módulo Staking Tiers (v3.2.4)

Estos eventos llegan con la versión v3.2.4: la testnet `qorechain-diana` los emite desde el 19 de octubre de 2026 y la mainnet desde el 23 de octubre de 2026 (propuesta de gobernanza 13, altura 3.742.566). Un nodo con una versión anterior no tiene el módulo staking-tiers y no emite ninguno de ellos.

| Tipo de evento | Atributos clave | Descripción |
| ---------- | -------------- | ----------- |
| `staking_tier_lock_created` | `lock_id`, `delegator`, `validator`, `amount`, `months`, `end_time` | Se creó un bloqueo de delegación |
| `staking_tier_lock_unlocked_early`, `staking_tier_lock_released` | `lock_id`, `delegator`, `penalty_burned`, `bonus_forfeited` | Un bloqueo terminó anticipadamente (la penalización se quema bajo el origen de quema `staking_tier_penalty`), o llegó a su fin |
| `staking_tier_bonus_claimed`, `staking_tier_bonus_settled` | `delegator`, `amount`; totales de la liquidación | Se reclamó un bonus; se liquidó el pool |
| `staking_tier_params_updated` | parámetros | La gobernanza cambió los parámetros del módulo |

### Módulo xQORE

Estos eventos todavía no se emiten: xQORE no está activo en ninguna compilación de nodo publicada (consulte [Staking de xQORE](/user-guide/xqore-staking)).

| Tipo de evento | Atributos clave                                                       | Descripción                              |
| -------------- | --------------------------------------------------------------------- | ---------------------------------------- |
| `xqore_lock`   | `owner`, `amount`                                                     | Se emite cuando se bloquea QOR en xQORE    |
| `xqore_unlock` | `owner`, `amount`, `penalty`, `burned`, `redistributed`, `returned`   | Se emite cuando xQORE se desbloquea de vuelta a QOR |

### Módulo de consenso PRISM (consenso RL)

Estos son eventos de fin de bloque, entregados en el flujo `NewBlock`.

| Tipo de evento                 | Atributos clave         | Descripción                                                   |
| ------------------------------ | ----------------------- | ------------------------------------------------------------- |
| `rl_observation_collected`     | `height`                | Se emite cuando se toma una observación de PRISM (aproximadamente cada 10 bloques) |
| `rl_reward_computed`           | `height`, `reward`      | Se emite cuando se calcula la recompensa de PRISM                     |
| `rl_action_applied`            | `height`, `agent_mode`  | Se emite cuando el agente PRISM aplica un ajuste de parámetro   |
| `rl_action_proposed`           | `height`, `agent_mode`, `applied`, `block_time_delta`, `gas_price_delta`, `validator_set_size_delta`, `pool_weight_rpos_delta`, `pool_weight_dpos_delta` | **v3.2.6 (solo testnet).** Se emite en cada paso del agente en todos los modos, con la acción propuesta; `applied` es `false` en modo sombra. La mainnet no lo emite hasta que aplique esa versión |
| `rl_agent_mode_changed`        | `height`, `agent_mode`  | Se emite cuando cambia el modo del agente                   |
| `rl_circuit_breaker_triggered` | `height`                | Se emite cuando el disyuntor de PRISM bloquea una acción       |
| `rl_circuit_breaker_recovered` | `height`                | Se emite cuando el disyuntor se recupera                     |

### Módulo de IA

| Tipo de evento     | Atributos clave                                  | Descripción                                         |
| ------------------ | ------------------------------------------------ | --------------------------------------------------- |
| `ai_anomaly_check` | `score_millionths`, `action`, `is_anomalous`     | Se emite por cada transacción puntuada por anomalía         |

---

## Ejemplo de cliente JavaScript

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

### WebSocket RPC de QoreChain (nativo)

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

## Notas

- **Límites de conexión**: En un nodo que usted mismo ejecuta, el número máximo predeterminado de conexiones WebSocket es ilimitado (`max-open-connections = 0`). Establezca un límite en `app.toml` para los despliegues en producción. Los endpoints públicos aplican sus propios límites.
- **Búfer de eventos**: El WebSocket RPC almacena en búfer un número acotado de eventos por suscripción (200 de forma predeterminada en un nodo autoalojado). Si el cliente se retrasa, los eventos más antiguos se descartan.
- **Reconexión**: Los clientes deben implementar una reconexión automática con retroceso exponencial, ya que las conexiones WebSocket pueden interrumpirse durante los reinicios o las actualizaciones del nodo.
