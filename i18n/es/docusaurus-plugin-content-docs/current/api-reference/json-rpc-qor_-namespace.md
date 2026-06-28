---
slug: /api-reference/json-rpc-qor_-namespace
title: JSON-RPC — Espacio de nombres qor_
sidebar_label: JSON-RPC — Espacio de nombres qor_
sidebar_position: 2
---

# JSON-RPC — Espacio de nombres qor_

El espacio de nombres `qor_` proporciona métodos JSON-RPC específicos de QoreChain para consultar el estado de la criptografía poscuántica, la analítica de IA, la mensajería entre VM, el estado multicapa, las operaciones de puente, la tokenómica, la infraestructura de rollups y el estado del consenso PRISM.

## Conexión

| Transporte | Dirección predeterminada |
| --------- | ----------------------- |
| HTTP      | `http://localhost:8545` |
| WebSocket | `ws://localhost:8546`   |

El espacio de nombres `qor_` se sirve junto con `eth_`, `web3_`, `net_` y `txpool_` en los mismos puertos. Habilítalo en `app.toml`:

```toml
[json-rpc]
api = "eth,web3,net,txpool,qor"
```

:::note
El espacio de nombres `qor_` está disponible en la red principal **`qorechain-vladi`** (EVM chain ID **9801**, activa en la versión de cadena **v3.1.80**) y en la red de pruebas **`qorechain-diana`** (EVM chain ID **9800**). Los ejemplos siguientes asumen un nodo local; sustituye el endpoint de red principal o de pruebas de tu proveedor para el acceso remoto.
:::

---

## Métodos

| Método                        | Parámetros                              | Descripción                                              |
| ----------------------------- | --------------------------------------- | -------------------------------------------------------- |
| `qor_getPQCKeyStatus`         | `address` (string)                      | Devuelve el estado de registro de la clave PQC de una cuenta |
| `qor_getHybridSignatureMode`  | ninguno                                 | Devuelve el modo actual de aplicación de firmas híbridas |
| `qor_getAIStats`              | ninguno                                 | Devuelve estadísticas agregadas de procesamiento del módulo de IA |
| `qor_getCrossVMMessage`       | `messageId` (string)                    | Recupera un mensaje entre VM por su ID                   |
| `qor_getReputationScore`      | `validator` (string)                    | Devuelve la puntuación de reputación de una dirección de validador |
| `qor_getLayerInfo`            | `layerId` (string)                      | Devuelve metadatos y estado de una capa registrada       |
| `qor_getBridgeStatus`         | `chainId` (string)                      | Devuelve el estado del puente y los totales bloqueados de una cadena |
| `qor_getRLAgentStatus`        | ninguno                                 | Devuelve el modo actual del agente PRISM y su estado operativo |
| `qor_getRLObservation`        | ninguno                                 | Devuelve el último vector de observación de PRISM        |
| `qor_getRLReward`             | ninguno                                 | Devuelve las métricas acumuladas de recompensa de PRISM  |
| `qor_getPoolClassification`   | `validator` (string)                    | Devuelve la clasificación de pool CPoS de un validador   |
| `qor_getBurnStats`            | ninguno                                 | Devuelve las estadísticas de quema en todos los canales  |
| `qor_getXQOREPosition`        | `address` (string)                      | Devuelve la posición de staking xQORE de una dirección   |
| `qor_getInflationRate`        | ninguno                                 | Devuelve la tasa de inflación anualizada actual          |
| `qor_getTokenomicsOverview`   | ninguno                                 | Devuelve un resumen combinado de quema, inflación y oferta |
| `qor_getRollupStatus`         | `rollupId` (string)                     | Devuelve el estado y la configuración de un rollup específico |
| `qor_listRollups`             | ninguno                                 | Devuelve una lista de todos los rollups registrados      |
| `qor_getSettlementBatch`      | `rollupId` (string), `batchIndex` (int) | Devuelve un lote de liquidación específico de un rollup  |
| `qor_suggestRollupProfile`    | `useCase` (string)                      | Recomendación de perfil de rollup asistida por IA para un caso de uso |
| `qor_getDABlobStatus`         | `rollupId` (string), `blobIndex` (int)  | Devuelve el estado de un blob de DA específico           |
| `qor_getBTCStakingPosition`   | `address` (string)                      | Devuelve la posición de staking de BTC a través del módulo Babylon |
| `qor_getAbstractAccount`      | `address` (string)                      | Devuelve los detalles de la cuenta abstracta y sus reglas de gasto |
| `qor_getFairBlockStatus`      | ninguno                                 | Devuelve el estado y la configuración del cifrado FairBlock |
| `qor_getGasAbstractionConfig` | ninguno                                 | Devuelve los tokens aceptados y los parámetros de abstracción de gas |
| `qor_getLaneConfiguration`    | ninguno                                 | Devuelve la configuración de priorización de TX de 5 carriles |

---

## Ejemplos

### qor_getBurnStats

**Solicitud:**

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

**Respuesta:**

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

**Solicitud:**

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

**Respuesta:**

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

**Solicitud:**

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

**Respuesta:**

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

## Códigos de error

| Código | Mensaje          | Descripción                           |
| ------ | ---------------- | ------------------------------------- |
| -32600 | Invalid Request  | Solicitud JSON-RPC mal formada        |
| -32601 | Method not found | El método no existe                   |
| -32602 | Invalid params   | Parámetros faltantes o no válidos     |
| -32603 | Internal error   | Error de procesamiento del lado del servidor |
| -32000 | Module disabled  | El módulo consultado no está habilitado |
| -32001 | Entity not found | El recurso solicitado no existe       |
