---
slug: /api-reference/json-rpc-qor_-namespace
title: JSON-RPC — Espacio de nombres qor_
sidebar_label: JSON-RPC — Espacio de nombres qor_
sidebar_position: 2
---

# JSON-RPC — Espacio de nombres qor_

El espacio de nombres `qor_` se diseñó para proporcionar métodos JSON-RPC específicos de QoreChain con los que consultar el estado de la criptografía poscuántica, la analítica de IA, la mensajería entre VM, el estado multicapa, las operaciones de puente, la tokenómica, la infraestructura de rollups y el estado del consenso PRISM.

:::warning Los métodos previstos aún no se sirven
**Ninguno de los métodos de la tabla siguiente se sirve todavía en ninguna red.** Están implementados en el código fuente del nodo pero no registrados en el servidor JSON-RPC, y cada uno devuelve `-32601` (method not found). Su registro está previsto para una versión del nodo, y esta página indicará cuál cuando se publique. No desarrolle hoy sobre ellos; use las rutas REST de la tabla cuando exista una. Las bibliotecas cliente que exponen utilidades `client.qor.*` envuelven estos mismos métodos, por lo que esas utilidades fallan de la misma manera.
:::

## Qué se sirve: `qor_getKEMKey` {#qor-getkemkey}

Se sirve un método del espacio de nombres: `qor_getKEMKey(address)` devuelve la clave pública ML-KEM que ha publicado una dirección (`address` puede ser `qor1...` o `0x`). Responde `{"address": ..., "found": false}` cuando no hay ninguna clave publicada y, en caso contrario, añade `algorithm_id`, `algorithm_name`, `public_key` (hex `0x`) y `registered_height`. El nodo sirve el espacio de nombres `qor` solo donde la lista `api` de su sección `[json-rpc]` en `app.toml` incluye `qor`.

Observado el 7 de noviembre de 2026:

| Red | `rpc_modules` | `qor_getKEMKey` |
| --- | --- | --- |
| Testnet (`https://evm-testnet.qore.host`) | `eth`, `net`, `qor`, `rpc`, `txpool`, `web3` | responde (`found: false` para una dirección sin clave publicada) |
| Mainnet (`https://evm.qore.host`) | `eth`, `net`, `rpc`, `txpool`, `web3` | `-32601` (el endpoint público de la mainnet no lista `qor`) |

En la testnet, todos los demás métodos `qor_` comprobados (`qor_getPQCKeyStatus`, `qor_getHybridSignatureMode`, `qor_getAIStats`, `qor_getBurnStats`) siguieron devolviendo `-32601`.

Puede comprobar usted mismo la lista del espacio de nombres:

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
| `qor_getHybridSignatureMode`  | No hay ruta REST pública; `qorechaind query pqc hybrid-mode` (o `query pqc params`) contra un nodo o con `--node https://rpc.qore.host:443`. |
| Estadísticas de IA (previsto; el nombre del método no es definitivo) | gRPC `qorechain.ai.v1.Query/Stats` en un nodo propio, o `qorechaind query ai stats`; no hay ruta REST. |
| `qor_getCrossVMMessage`       | gRPC `qorechain.crossvm.v1.Query/Message` en un nodo propio; no hay ruta REST. |
| `qor_getReputationScore`      | No hay ruta de consulta pública (el módulo de reputación solo expone gRPC `Params`). |
| `qor_getLayerInfo`            | `GET /qorechain/multilayer/v1/layers/{layer_id}` y `anchor/{layer_id}`. Consulte [Módulo Multilayer](/api-reference/rest-grpc-endpoints#multilayer-module). |
| `qor_getBridgeStatus`         | `GET /qorechain/bridge/v1/chains/{chain_id}`. Consulte [Módulo Bridge](/api-reference/rest-grpc-endpoints#bridge-module). El puente todavía no está activo. |
| `qor_getRLAgentStatus`, `qor_getRLObservation`, `qor_getRLReward` | Desde v3.2.6 (ambas redes): `GET /qorechain/rlconsensus/v1/agent`, `/observation` y `/reward` (también `/params`, `/policy`, `/applied_params`, `/last_action`); véase [Módulo RL Consensus](/api-reference/rest-grpc-endpoints#rlconsensus-module). Las rutas respondieron `200` en el host público de la mainnet el 4 de noviembre de 2026; en un nodo anterior a v3.2.6 responden `501` y la forma de leerlas es el servicio gRPC `qorechain.rlconsensus.v1.Query` (`AgentStatus`, `Observation`, `Reward`). |
| `qor_getPoolClassification`   | No hay ruta de consulta pública. |
| `qor_getBurnStats`            | `GET /qorechain/burn/v1/stats`. Consulte [Módulo Burn](/api-reference/rest-grpc-endpoints#burn-module). |
| `qor_getXQOREPosition`        | Ninguno. xQORE no está activo (consulte [Staking de xQORE](/user-guide/xqore-staking)). |
| `qor_getInflationRate`        | `GET /qorechain/inflation/v1/params` y `/epoch_info` (modo de emisión, cantidad por época, tope, progreso; se sirven desde v3.2.2). Consulte [Módulo Inflation](/api-reference/rest-grpc-endpoints#inflation-module). |
| `qor_getTokenomicsOverview`   | Combine `GET /qorechain/burn/v1/stats`, `GET /qorechain/inflation/v1/epoch_info` y `GET /cosmos/bank/v1beta1/supply`. |
| `qor_getRollupStatus`, `qor_listRollups`, `qor_getSettlementBatch`, `qor_getDABlobStatus` | `GET /qorechain/rdk/v1/rollup/{id}`, `/rollups`, `/batch/{id}/{index}`, `/latest_batch/{id}`, `/batches/{id}`, `/blob/{id}/{index}` (se sirven desde v3.2.2; consulte [Módulo RDK](/api-reference/rest-grpc-endpoints#rdk-module)), o `qorechaind query rdk`. |
| `qor_suggestRollupProfile`    | No hay servicio público; consulte [Perfiles preconfigurados](/rollups/preset-profiles). |
| `qor_getBTCStakingPosition`   | Ninguno. El módulo de restaking de BTC todavía no tiene servicio de consulta. |
| `qor_getAbstractAccount`      | `GET /qorechain/abstractaccount/v1/accounts/{address}`. Las cuentas abstractas están deshabilitadas en la mainnet y habilitadas en la testnet (comprobado el 27 de octubre de 2026). |
| `qor_getGasAbstractionConfig` | `GET /qorechain/gasabstraction/v1/config` (se sirve desde v3.2.2). Consulte [Módulo Gas Abstraction](/api-reference/rest-grpc-endpoints#gas-abstraction-module). |
| `qor_getFairBlockStatus`, `qor_getLaneConfiguration` | Ninguno. |

Para el estado de una cuenta en el carril EVM (clave PQC registrada, ventana de autorización y consentimiento EIP-7702) use `GET /qorechain/pqc/v1/account/{address}`, `GET /qorechain/pqc/v1/evm_window/{address}` y `GET /qorechain/pqc/v1/evm_delegation_consent/{address}`. La ruta de estado es `account` en **singular**; el plural `/accounts/` no se sirve y responde `501`.

---

## Códigos de error

Los errores siguen los códigos estándar de JSON-RPC 2.0. Hoy, las llamadas a un método `qor_` previsto fallan con `-32601`, y en el endpoint de la mainnet también `qor_getKEMKey`.

| Código | Mensaje          | Descripción                           |
| ------ | ---------------- | ------------------------------------- |
| -32600 | Invalid Request  | Solicitud JSON-RPC mal formada        |
| -32601 | Method not found | El método no existe, o el nodo no sirve el espacio de nombres `qor_` (todos los métodos previstos hoy; también `qor_getKEMKey` donde `qor` no está habilitado) |
| -32602 | Invalid params   | Parámetros faltantes o no válidos     |
| -32603 | Internal error   | Error de procesamiento del lado del servidor |
