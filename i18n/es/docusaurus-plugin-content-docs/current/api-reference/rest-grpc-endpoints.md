---
slug: /api-reference/rest-grpc-endpoints
title: Endpoints REST / gRPC
sidebar_label: Endpoints REST / gRPC
sidebar_position: 1
---

# Endpoints REST / gRPC

QoreChain expone tres interfaces principales para el acceso programático:

| Interfaz | Puerto predeterminado | Protocolo | Descripción                        |
| -------- | ---------------------- | --------- | ----------------------------------- |
| REST     | `1317`                  | HTTP/1.1  | API REST LCD (Light Client Daemon) |
| gRPC     | `9090`                  | HTTP/2    | Servicio gRPC codificado con Protobuf |
| RPC      | `26657`                 | HTTP + WS | RPC del motor de consenso de QoreChain |

Todos los endpoints REST devuelven JSON. Los endpoints gRPC usan Protocol Buffers y pueden consumirse con cualquier cliente gRPC. La interfaz RPC ofrece consultas a nivel de consenso y difusión de transacciones.

:::note
Estas interfaces están disponibles tanto en la mainnet **`qorechain-vladi`** (en producción desde el 7 de junio de 2026 en la versión de cadena **v3.1.92**) como en la testnet **`qorechain-diana`**. Las URLs base a continuación asumen un nodo ejecutándose localmente; los endpoints públicos alojados (`rpc/api/evm/svm.qore.host` y sus variantes `-testnet`) se listan en [Redes](/appendix/networks#public-endpoints).
:::

## URLs base

```
REST:  http://localhost:1317
gRPC:  localhost:9090
RPC:   http://localhost:26657
```

## Módulo AI

| Método | Endpoint                           | Descripción                                          |
| ------ | ----------------------------------- | ----------------------------------------------------- |
| GET    | `/ai/v1/config`                    | Devuelve la configuración actual del módulo AI        |
| GET    | `/ai/v1/stats`                     | Estadísticas agregadas de procesamiento AI             |
| GET    | `/ai/v1/fee-estimate`              | Estimación de tarifa de gas asistida por AI para una transacción |
| GET    | `/ai/v1/fraud/investigations`      | Lista todas las investigaciones de fraude activas       |
| GET    | `/ai/v1/fraud/investigations/{id}` | Devuelve los detalles de una investigación de fraude específica |
| GET    | `/ai/v1/network/recommendations`   | Recomendaciones de optimización de red generadas por AI |
| GET    | `/ai/v1/circuit-breakers`          | Estados y umbrales actuales de los disyuntores (circuit breakers) |

## Módulo Bridge {#bridge-module}

A partir de la versión de cadena **v3.1.77**, el estado de solo lectura del módulo bridge se expone mediante REST vía grpc-gateway bajo el prefijo `/qorechain/bridge/v1/...` (anteriormente solo disponible por gRPC). Estos endpoints entregan JSON real on-chain sobre HTTP para exploradores y telemetría de nodos ligeros. El `config` del bridge reporta, por ejemplo, `min_validators=10` y `threshold=7`.

| Método | Endpoint                                    | Descripción                               |
| ------ | -------------------------------------------- | ------------------------------------------ |
| GET    | `/qorechain/bridge/v1/config`               | Configuración actual del módulo bridge     |
| GET    | `/qorechain/bridge/v1/chains`               | Lista todas las cadenas bridge registradas |
| GET    | `/qorechain/bridge/v1/chains/{chain_id}`    | Detalles de una cadena puenteada específica |
| GET    | `/qorechain/bridge/v1/validators`           | Lista los validadores de bridge registrados |
| GET    | `/qorechain/bridge/v1/validators/{address}` | Detalles de un validador de bridge específico |
| GET    | `/qorechain/bridge/v1/operations`           | Lista las operaciones de bridge            |
| GET    | `/qorechain/bridge/v1/operations/{id}`      | Detalles de una operación de bridge específica |

Los siguientes endpoints de ruta más corta siguen estando disponibles:

| Método | Endpoint                             | Descripción                                        |
| ------ | ------------------------------------- | --------------------------------------------------- |
| GET    | `/bridge/v1/chains`                  | Lista todas las cadenas bridge registradas          |
| GET    | `/bridge/v1/chains/{id}`             | Detalles de una cadena puenteada específica         |
| GET    | `/bridge/v1/validators`              | Lista los validadores de bridge activos             |
| GET    | `/bridge/v1/operations`              | Lista las operaciones de bridge recientes           |
| GET    | `/bridge/v1/operations/{id}`         | Detalles de una operación de bridge específica      |
| GET    | `/bridge/v1/locked/{chain}/{asset}`  | Valor total bloqueado para un par cadena/activo     |
| GET    | `/bridge/v1/limits/{chain}`          | Límites de tasa y umbrales para una cadena puenteada |
| GET    | `/bridge/v1/estimate`                | Estima la tarifa de bridge y el tiempo de transferencia |

## Módulo PQC

| Método | Endpoint                     | Descripción                                          |
| ------ | ----------------------------- | ------------------------------------------------------ |
| GET    | `/pqc/v1/params`             | Parámetros actuales del módulo PQC                     |
| GET    | `/pqc/v1/accounts/{address}` | Estado de la clave PQC para una cuenta específica       |
| GET    | `/pqc/v1/stats`               | Estadísticas agregadas de registro y migración PQC     |

## Módulo Reputation

| Método | Endpoint                              | Descripción                                    |
| ------ | -------------------------------------- | ------------------------------------------------ |
| GET    | `/reputation/v1/validators`           | Puntuaciones de reputación de todos los validadores |
| GET    | `/reputation/v1/validators/{address}` | Puntuación de reputación de un validador específico |

## Módulo Cross-VM

| Método | Endpoint                    | Descripción                                    |
| ------ | ----------------------------- | ------------------------------------------------ |
| GET    | `/crossvm/v1/message/{id}`   | Recupera un mensaje cross-VM por ID              |
| GET    | `/crossvm/v1/pending`        | Lista los mensajes cross-VM pendientes en cola   |
| GET    | `/crossvm/v1/params`         | Parámetros actuales del módulo Cross-VM          |

## Módulo Multilayer {#multilayer-module}

A partir de la versión de cadena **v3.1.80**, el servicio de consultas completo del módulo multilayer se expone mediante REST vía grpc-gateway bajo el prefijo `/qorechain/multilayer/v1/...` (anteriormente solo disponible por gRPC), incluyendo dos **consultas de lectura de anclaje de estado**: `anchor/{layer_id}` devuelve el último anclaje de liquidación (settlement anchor) de una capa, y `anchors/{layer_id}` devuelve su historial de anclajes. Cada anclaje lleva una firma **ML-DSA-87 (Dilithium-5)** sobre sus campos canónicos, de modo que un cliente puede obtener un anclaje y verificarlo de forma independiente — la base on-chain de los [recibos de liquidación](/rollups/settlement-receipts) del Rollup Development Kit.

| Método | Endpoint                                        | Descripción                                          |
| ------ | ------------------------------------------------- | ------------------------------------------------------ |
| GET    | `/qorechain/multilayer/v1/params`               | Parámetros actuales del módulo Multilayer               |
| GET    | `/qorechain/multilayer/v1/layers`               | Lista todas las capas registradas                        |
| GET    | `/qorechain/multilayer/v1/layers/{layer_id}`    | Detalles de una capa específica                          |
| GET    | `/qorechain/multilayer/v1/anchor/{layer_id}`    | Último anclaje de estado de una capa                     |
| GET    | `/qorechain/multilayer/v1/anchors/{layer_id}`   | Historial de anclajes de estado de una capa              |
| GET    | `/qorechain/multilayer/v1/routing-stats`        | Estadísticas de enrutamiento de transacciones entre capas |

Un `StateAnchorView` contiene `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, `main_chain_height`, `anchored_at`, `pqc_aggregate_signature`, `transaction_count` y `compressed_state_proof`. El mensaje canónico firmado es `layer_id || layer_height || state_root || validator_set_hash`, verificado contra la clave PQC registrada del creador de la capa.

Los siguientes endpoints de ruta más corta siguen estando disponibles:

| Método | Endpoint                       | Descripción                                     |
| ------ | -------------------------------- | -------------------------------------------------- |
| GET    | `/multilayer/v1/layer/{id}`     | Detalles de una capa específica                    |
| GET    | `/multilayer/v1/layers`         | Lista todas las capas registradas                  |
| GET    | `/multilayer/v1/anchor/{id}`    | Detalles de un registro de anclaje específico      |
| GET    | `/multilayer/v1/anchors`        | Lista los envíos de anclaje recientes              |
| GET    | `/multilayer/v1/routing-stats`  | Estadísticas de enrutamiento de transacciones entre capas |
| GET    | `/multilayer/v1/params`         | Parámetros actuales del módulo Multilayer          |

## Módulo SVM

| Método | Endpoint                    | Descripción                                              |
| ------ | ----------------------------- | ----------------------------------------------------------- |
| GET    | `/svm/v1/params`            | Parámetros actuales del módulo SVM                          |
| GET    | `/svm/v1/account/{address}` | Información de cuenta SVM para una dirección dada           |
| GET    | `/svm/v1/program/{address}` | Información del programa desplegado para una dirección de programa dada |

## Módulo RL Consensus

Los parámetros de ajuste de PRISM y el estado del agente de aprendizaje por refuerzo se exponen a través de este módulo.

| Método | Endpoint                      | Descripción                                  |
| ------ | ------------------------------- | ----------------------------------------------- |
| GET    | `/rlconsensus/v1/agent`       | Estado y modo actuales del agente PRISM         |
| GET    | `/rlconsensus/v1/observation` | Último vector de observación                    |
| GET    | `/rlconsensus/v1/rewards`     | Métricas de recompensa acumulada                |
| GET    | `/rlconsensus/v1/params`      | Parámetros actuales del módulo PRISM Consensus  |
| GET    | `/rlconsensus/v1/policy`      | Configuración y pesos de la política activa     |

## Módulo Burn

A partir de la versión de cadena **v3.1.77**, el estado de solo lectura del módulo burn se expone mediante REST vía grpc-gateway bajo el prefijo `/qorechain/burn/v1/...` (anteriormente solo disponible por gRPC). Estos endpoints entregan JSON real on-chain sobre HTTP para exploradores y telemetría de nodos ligeros. Las `stats` de burn incluyen, por ejemplo, `gas_burn_rate=0.30`.

| Método | Endpoint                        | Descripción                            |
| ------ | ---------------------------------- | ----------------------------------------- |
| GET    | `/qorechain/burn/v1/params`       | Parámetros actuales del módulo Burn       |
| GET    | `/qorechain/burn/v1/stats`        | Estadísticas de burn en todos los canales |
| GET    | `/qorechain/burn/v1/records`      | Lista los registros de burn               |
| GET    | `/qorechain/burn/v1/milestone`    | Progreso de los hitos (milestones) de burn |

Los siguientes endpoints de ruta más corta siguen estando disponibles:

| Método | Endpoint          | Descripción                              |
| ------ | ------------------ | ------------------------------------------- |
| GET    | `/burn/v1/stats`  | Estadísticas de burn en todos los canales   |
| GET    | `/burn/v1/params` | Parámetros actuales del módulo Burn         |

## Módulo xQORE

| Método | Endpoint                       | Descripción                                        |
| ------ | --------------------------------- | ------------------------------------------------------ |
| GET    | `/xqore/v1/position/{address}` | Posición de staking xQORE para una dirección dada       |
| GET    | `/xqore/v1/params`             | Parámetros actuales del módulo xQORE                     |

## Módulo Inflation

| Método | Endpoint               | Descripción                                  |
| ------ | ------------------------ | ----------------------------------------------- |
| GET    | `/inflation/v1/rate`   | Tasa de inflación anualizada actual              |
| GET    | `/inflation/v1/epoch`  | Número de época actual y su progreso             |
| GET    | `/inflation/v1/params` | Parámetros actuales del módulo Inflation         |

## Módulo RDK

| Método | Endpoint                     | Descripción                             |
| ------ | ------------------------------- | ------------------------------------------- |
| GET    | `/rdk/v1/rollup/{id}`        | Detalles de un rollup específico            |
| GET    | `/rdk/v1/rollups`            | Lista todos los rollups registrados         |
| GET    | `/rdk/v1/batch/{id}/{index}` | Recupera un lote de liquidación específico  |
| GET    | `/rdk/v1/batches/{id}`       | Lista los lotes de un rollup específico     |
| GET    | `/rdk/v1/blob/{id}/{index}`  | Recupera un blob de DA específico           |
| GET    | `/rdk/v1/params`             | Parámetros actuales del módulo RDK          |

## Módulo Babylon

| Método | Endpoint                         | Descripción                                     |
| ------ | ----------------------------------- | -------------------------------------------------- |
| GET    | `/babylon/v1/staking/{address}`   | Posición de staking en BTC para una dirección dada |
| GET    | `/babylon/v1/checkpoint/{epoch}`  | Datos de checkpoint BTC para una época dada        |
| GET    | `/babylon/v1/params`              | Parámetros actuales del módulo Babylon             |

## Módulo Abstract Account

A partir de la versión de cadena **v3.1.85**, el servicio de consultas de cuenta abstracta se expone mediante REST vía grpc-gateway bajo el prefijo `/qorechain/abstractaccount/v1/...`, incluyendo el **esquema de permisos** usado para validar los alcances de [autenticador](/developer-guide/account-abstraction#authenticators) sin necesidad de codificarlos de forma fija (hardcoding).

| Método | Endpoint                                              | Descripción                                                    |
| ------ | -------------------------------------------------------- | ------------------------------------------------------------------ |
| GET    | `/qorechain/abstractaccount/v1/config`                  | Configuración del módulo (sonda de funcionalidad: `enabled`)       |
| GET    | `/qorechain/abstractaccount/v1/accounts`                | Lista las cuentas abstractas                                        |
| GET    | `/qorechain/abstractaccount/v1/accounts/{address}`      | Estado de cuenta abstracta para una dirección                       |
| GET    | `/qorechain/abstractaccount/v1/permission_schema`       | Taxonomía de permisos, mapa mensaje→permiso, mensajes no delegables |

Los siguientes endpoints de ruta más corta siguen estando disponibles:

| Método | Endpoint                                | Descripción                                        |
| ------ | ------------------------------------------ | ------------------------------------------------------ |
| GET    | `/abstractaccount/v1/account/{address}` | Detalles de cuenta abstracta para una dirección dada    |
| GET    | `/abstractaccount/v1/params`            | Parámetros actuales del módulo Abstract Account         |

## Módulo FairBlock

| Método | Endpoint               | Descripción                                       |
| ------ | ------------------------ | ----------------------------------------------------- |
| GET    | `/fairblock/v1/config` | Configuración actual del cifrado de FairBlock          |
| GET    | `/fairblock/v1/params` | Parámetros actuales del módulo FairBlock                |

## Módulo Gas Abstraction

| Método | Endpoint                             | Descripción                                       |
| ------ | --------------------------------------- | ------------------------------------------------------ |
| GET    | `/gasabstraction/v1/accepted-tokens`  | Lista los tokens aceptados para el pago de gas          |
| GET    | `/gasabstraction/v1/params`           | Parámetros actuales del módulo Gas Abstraction           |

## Reflexión gRPC

La reflexión del servidor gRPC está habilitada por defecto, lo que permite que herramientas como `grpcurl` descubran los servicios disponibles:

```bash
grpcurl -plaintext localhost:9090 list
```

Para consultar un servicio específico:

```bash
grpcurl -plaintext localhost:9090 qorechain.pqc.v1.Query/Params
```

## Autenticación

Todos los endpoints REST y gRPC no requieren autenticación por defecto. Para despliegues en producción, coloque un proxy inverso (por ejemplo, Nginx o Caddy) delante del nodo para gestionar la terminación TLS y el control de acceso.
