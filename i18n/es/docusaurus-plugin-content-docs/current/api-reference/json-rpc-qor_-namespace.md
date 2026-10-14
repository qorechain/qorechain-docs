---
slug: /api-reference/json-rpc-qor_-namespace
title: JSON-RPC — Espacio de nombres qor_
sidebar_label: JSON-RPC — Espacio de nombres qor_
sidebar_position: 2
---

# JSON-RPC — Espacio de nombres qor_

El espacio de nombres `qor_` se diseñó para proporcionar métodos JSON-RPC específicos de QoreChain con los que consultar el estado de la criptografía poscuántica, la analítica de IA, la mensajería entre VM, el estado multicapa, las operaciones de puente, la tokenómica, la infraestructura de rollups y el estado del consenso PRISM.

:::warning Aún no se sirve
**Ninguna versión publicada del nodo sirve todavía el espacio de nombres `qor_`**, ni en mainnet (`qorechain-vladi`), ni en testnet (`qorechain-diana`), ni en un nodo propio. En los endpoints EVM públicos, `rpc_modules` solo lista `eth`, `net`, `rpc`, `txpool` y `web3`, y **todo método `qor_` devuelve `-32601` (method not found)** en ambas redes. Los métodos están implementados en el código fuente del nodo pero no registrados en el servidor JSON-RPC, así que añadir `qor` a la lista `api` de `app.toml` no tiene efecto. El registro del espacio de nombres está previsto para una versión del nodo, y esta página indicará cuál cuando se publique.

No desarrolle hoy sobre métodos `qor_`. Use las rutas REST de la tabla siguiente cuando exista una. Las bibliotecas cliente que exponen utilidades `client.qor.*` envuelven estos mismos métodos, por lo que esas utilidades fallan de la misma manera.
:::

Puede comprobarlo usted mismo:

```bash
curl -s -X POST https://evm.qore.host \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"rpc_modules","params":[],"id":1}'
```

```json
{"jsonrpc":"2.0","id":1,"result":{"eth":"1.0","net":"1.0","rpc":"1.0","txpool":"1.0","web3":"1.0"}}
```

---

## Métodos previstos y qué usar hoy

| Método previsto                | Qué usar hoy |
| ----------------------------- | ----------------- |
| `qor_getPQCKeyStatus`         | `GET /qorechain/pqc/v1/account/{address}` (`found`, `account.key_type`, `account.created_at_height`). Consulte [Endpoints REST / gRPC](/api-reference/rest-grpc-endpoints#pqc-module). |
| `qor_getHybridSignatureMode`  | No hay ruta de consulta pública. |
| `qor_getAIStats`              | gRPC `qorechain.ai.v1.Query/Stats` en un nodo propio; no hay ruta REST. |
| `qor_getCrossVMMessage`       | gRPC `qorechain.crossvm.v1.Query/Message` en un nodo propio; no hay ruta REST. |
| `qor_getReputationScore`      | No hay ruta de consulta pública (el módulo de reputación solo expone gRPC `Params`). |
| `qor_getLayerInfo`            | `GET /qorechain/multilayer/v1/layers/{layer_id}` y `anchor/{layer_id}`. Consulte [Módulo Multilayer](/api-reference/rest-grpc-endpoints#multilayer-module). |
| `qor_getBridgeStatus`         | `GET /qorechain/bridge/v1/chains/{chain_id}`. Consulte [Módulo Bridge](/api-reference/rest-grpc-endpoints#bridge-module). El puente todavía no está activo. |
| `qor_getRLAgentStatus`, `qor_getRLObservation`, `qor_getRLReward` | gRPC `qorechain.rlconsensus.v1.Query` (`AgentStatus`, `Observation`, `Reward`) en un nodo propio; no hay ruta REST. |
| `qor_getPoolClassification`   | No hay ruta de consulta pública. |
| `qor_getBurnStats`            | `GET /qorechain/burn/v1/stats`. Consulte [Módulo Burn](/api-reference/rest-grpc-endpoints#burn-module). |
| `qor_getXQOREPosition`        | Ninguno. xQORE no está activo (consulte [Staking de xQORE](/user-guide/xqore-staking)). |
| `qor_getInflationRate`        | No hay ruta de consulta pública en mainnet. |
| `qor_getTokenomicsOverview`   | Combine `GET /qorechain/burn/v1/stats` con `GET /cosmos/bank/v1beta1/supply`. |
| `qor_getRollupStatus`, `qor_listRollups`, `qor_getSettlementBatch`, `qor_getDABlobStatus` | gRPC `qorechain.rdk.v1.Query` (`Rollup`, `Rollups`, `Batch`, `LatestBatch`) o la CLI en un nodo propio; las rutas REST `/qorechain/rdk/v1/...` no se sirven en mainnet. |
| `qor_suggestRollupProfile`    | No hay servicio público; consulte [Perfiles preconfigurados](/rollups/preset-profiles). |
| `qor_getBTCStakingPosition`   | Ninguno. El módulo de restaking de BTC todavía no tiene servicio de consulta. |
| `qor_getAbstractAccount`      | `GET /qorechain/abstractaccount/v1/accounts/{address}`. Las cuentas abstractas están deshabilitadas hoy en ambas redes. |
| `qor_getFairBlockStatus`, `qor_getGasAbstractionConfig`, `qor_getLaneConfiguration` | Ninguno. |

Para el estado de una cuenta en el carril EVM (clave PQC registrada y ventana de autorización) use `GET /qorechain/pqc/v1/account/{address}` y `GET /qorechain/pqc/v1/evm_window/{address}`.

---

## Códigos de error

En un nodo que sí sirve el espacio de nombres, los errores siguen los códigos estándar de JSON-RPC 2.0. Hoy, las llamadas a un método `qor_` fallan con `-32601`.

| Código | Mensaje          | Descripción                           |
| ------ | ---------------- | ------------------------------------- |
| -32600 | Invalid Request  | Solicitud JSON-RPC mal formada        |
| -32601 | Method not found | El método no existe, o el nodo no sirve el espacio de nombres `qor_` (todas las versiones publicadas hoy) |
| -32602 | Invalid params   | Parámetros faltantes o no válidos     |
| -32603 | Internal error   | Error de procesamiento del lado del servidor |
