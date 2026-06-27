---
slug: /api-reference/rest-grpc-endpoints
title: Endpoints REST / gRPC
sidebar_label: Endpoints REST / gRPC
sidebar_position: 1
---

# Endpoints REST / gRPC

QoreChain expone tres interfaces principales para el acceso programático:

| Interfaz | Puerto predeterminado | Protocolo | Descripción                        |
| --------- | ------------ | --------- | ---------------------------------- |
| REST      | `1317`       | HTTP/1.1  | API REST LCD (Light Client Daemon) |
| gRPC      | `9090`       | HTTP/2    | Servicio gRPC codificado en Protobuf |
| RPC       | `26657`      | HTTP + WS | RPC del Motor de Consenso de QoreChain |

Todos los endpoints REST devuelven JSON. Los endpoints gRPC usan Protocol Buffers y pueden consumirse con cualquier cliente gRPC. La interfaz RPC proporciona consultas a nivel de consenso y difusión de transacciones.

:::note
Estas interfaces están disponibles tanto en la red principal **`qorechain-vladi`** (activa desde el 7 de junio de 2026 en la versión de cadena **v3.1.77**) como en la red de pruebas **`qorechain-diana`**. Las URL base siguientes asumen un nodo ejecutándose localmente; sustituye el host de red principal o de pruebas de tu proveedor para el acceso remoto.
:::

## URL base

```
REST:  http://localhost:1317
gRPC:  localhost:9090
RPC:   http://localhost:26657
```

## Módulo de IA

| Método | Endpoint                           | Descripción                                        |
| ------ | ---------------------------------- | -------------------------------------------------- |
| GET    | `/ai/v1/config`                    | Devuelve la configuración actual del módulo de IA  |
| GET    | `/ai/v1/stats`                     | Estadísticas agregadas de procesamiento de IA      |
| GET    | `/ai/v1/fee-estimate`              | Estimación de la comisión de gas asistida por IA para una transacción |
| GET    | `/ai/v1/fraud/investigations`      | Lista todas las investigaciones de fraude activas  |
| GET    | `/ai/v1/fraud/investigations/{id}` | Devuelve los detalles de una investigación de fraude específica |
| GET    | `/ai/v1/network/recommendations`   | Recomendaciones de optimización de red generadas por IA |
| GET    | `/ai/v1/circuit-breakers`          | Estados actuales de los disyuntores y sus umbrales |

## Módulo de puente {#bridge-module}

A partir de la versión de cadena **v3.1.77**, el estado de solo lectura del módulo de puente se expone por REST mediante grpc-gateway bajo el prefijo `/qorechain/bridge/v1/...` (anteriormente solo gRPC). Estos endpoints sirven JSON on-chain real por HTTP para exploradores y telemetría de nodos ligeros. La `config` del puente reporta, p. ej., `min_validators=10` y `threshold=7`.

| Método | Endpoint                                   | Descripción                              |
| ------ | ------------------------------------------ | ---------------------------------------- |
| GET    | `/qorechain/bridge/v1/config`              | Configuración actual del módulo de puente |
| GET    | `/qorechain/bridge/v1/chains`              | Lista todas las cadenas de puente registradas |
| GET    | `/qorechain/bridge/v1/chains/{chain_id}`   | Detalles de una cadena puenteada específica |
| GET    | `/qorechain/bridge/v1/validators`          | Lista los validadores de puente registrados |
| GET    | `/qorechain/bridge/v1/validators/{address}`| Detalles de un validador de puente específico |
| GET    | `/qorechain/bridge/v1/operations`          | Lista las operaciones de puente          |
| GET    | `/qorechain/bridge/v1/operations/{id}`     | Detalles de una operación de puente específica |

Los siguientes endpoints de ruta más corta siguen estando disponibles:

| Método | Endpoint                            | Descripción                                    |
| ------ | ----------------------------------- | ---------------------------------------------- |
| GET    | `/bridge/v1/chains`                 | Lista todas las cadenas de puente registradas  |
| GET    | `/bridge/v1/chains/{id}`            | Detalles de una cadena puenteada específica    |
| GET    | `/bridge/v1/validators`             | Lista los validadores de puente activos        |
| GET    | `/bridge/v1/operations`             | Lista las operaciones de puente recientes      |
| GET    | `/bridge/v1/operations/{id}`        | Detalles de una operación de puente específica |
| GET    | `/bridge/v1/locked/{chain}/{asset}` | Valor total bloqueado de un par cadena/activo  |
| GET    | `/bridge/v1/limits/{chain}`         | Límites de velocidad y umbrales de una cadena puenteada |
| GET    | `/bridge/v1/estimate`               | Estima la comisión de puente y el tiempo de transferencia |

## Módulo PQC

| Método | Endpoint                     | Descripción                                    |
| ------ | ---------------------------- | ---------------------------------------------- |
| GET    | `/pqc/v1/params`             | Parámetros actuales del módulo PQC             |
| GET    | `/pqc/v1/accounts/{address}` | Estado de la clave PQC de una cuenta específica |
| GET    | `/pqc/v1/stats`              | Estadísticas agregadas de registro y migración de PQC |

## Módulo de reputación

| Método | Endpoint                              | Descripción                               |
| ------ | ------------------------------------- | ----------------------------------------- |
| GET    | `/reputation/v1/validators`           | Puntuaciones de reputación de todos los validadores |
| GET    | `/reputation/v1/validators/{address}` | Puntuación de reputación de un validador específico |

## Módulo Cross-VM

| Método | Endpoint                   | Descripción                              |
| ------ | -------------------------- | ---------------------------------------- |
| GET    | `/crossvm/v1/message/{id}` | Recupera un mensaje entre VM por ID      |
| GET    | `/crossvm/v1/pending`      | Lista los mensajes entre VM pendientes en cola |
| GET    | `/crossvm/v1/params`       | Parámetros actuales del módulo Cross-VM  |

## Módulo Multilayer

| Método | Endpoint                       | Descripción                                  |
| ------ | ------------------------------ | -------------------------------------------- |
| GET    | `/multilayer/v1/layer/{id}`    | Detalles de una capa específica              |
| GET    | `/multilayer/v1/layers`        | Lista todas las capas registradas            |
| GET    | `/multilayer/v1/anchor/{id}`   | Detalles de un registro de anclaje específico |
| GET    | `/multilayer/v1/anchors`       | Lista los envíos de anclaje recientes        |
| GET    | `/multilayer/v1/routing-stats` | Estadísticas de enrutamiento de transacciones entre capas |
| GET    | `/multilayer/v1/params`        | Parámetros actuales del módulo Multilayer    |

## Módulo SVM

| Método | Endpoint                    | Descripción                                       |
| ------ | --------------------------- | ------------------------------------------------- |
| GET    | `/svm/v1/params`            | Parámetros actuales del módulo SVM                |
| GET    | `/svm/v1/account/{address}` | Información de la cuenta SVM de una dirección dada |
| GET    | `/svm/v1/program/{address}` | Información del programa desplegado de una dirección de programa dada |

## Módulo RL Consensus

Los parámetros de ajuste de PRISM y el estado del agente de aprendizaje por refuerzo se exponen a través de este módulo.

| Método | Endpoint                      | Descripción                             |
| ------ | ----------------------------- | --------------------------------------- |
| GET    | `/rlconsensus/v1/agent`       | Estado y modo actuales del agente PRISM |
| GET    | `/rlconsensus/v1/observation` | Último vector de observación            |
| GET    | `/rlconsensus/v1/rewards`     | Métricas acumuladas de recompensa       |
| GET    | `/rlconsensus/v1/params`      | Parámetros actuales del módulo PRISM Consensus |
| GET    | `/rlconsensus/v1/policy`      | Configuración y pesos de la política activa |

## Módulo de quema

A partir de la versión de cadena **v3.1.77**, el estado de solo lectura del módulo de quema se expone por REST mediante grpc-gateway bajo el prefijo `/qorechain/burn/v1/...` (anteriormente solo gRPC). Estos endpoints sirven JSON on-chain real por HTTP para exploradores y telemetría de nodos ligeros. Las `stats` de quema incluyen, p. ej., `gas_burn_rate=0.30`.

| Método | Endpoint                       | Descripción                          |
| ------ | ------------------------------ | ------------------------------------ |
| GET    | `/qorechain/burn/v1/params`    | Parámetros actuales del módulo de quema |
| GET    | `/qorechain/burn/v1/stats`     | Estadísticas de quema en todos los canales |
| GET    | `/qorechain/burn/v1/records`   | Lista los registros de quema         |
| GET    | `/qorechain/burn/v1/milestone` | Progreso de los hitos de quema       |

Los siguientes endpoints de ruta más corta siguen estando disponibles:

| Método | Endpoint          | Descripción                         |
| ------ | ----------------- | ----------------------------------- |
| GET    | `/burn/v1/stats`  | Estadísticas de quema en todos los canales |
| GET    | `/burn/v1/params` | Parámetros actuales del módulo de quema |

## Módulo xQORE

| Método | Endpoint                       | Descripción                                |
| ------ | ------------------------------ | ------------------------------------------ |
| GET    | `/xqore/v1/position/{address}` | Posición de staking xQORE de una dirección dada |
| GET    | `/xqore/v1/params`             | Parámetros actuales del módulo xQORE       |

## Módulo de inflación

| Método | Endpoint               | Descripción                         |
| ------ | ---------------------- | ----------------------------------- |
| GET    | `/inflation/v1/rate`   | Tasa de inflación anualizada actual |
| GET    | `/inflation/v1/epoch`  | Número de época actual y progreso   |
| GET    | `/inflation/v1/params` | Parámetros actuales del módulo de inflación |

## Módulo RDK

| Método | Endpoint                     | Descripción                           |
| ------ | ---------------------------- | ------------------------------------- |
| GET    | `/rdk/v1/rollup/{id}`        | Detalles de un rollup específico      |
| GET    | `/rdk/v1/rollups`            | Lista todos los rollups registrados   |
| GET    | `/rdk/v1/batch/{id}/{index}` | Recupera un lote de liquidación específico |
| GET    | `/rdk/v1/batches/{id}`       | Lista los lotes de un rollup específico |
| GET    | `/rdk/v1/blob/{id}/{index}`  | Recupera un blob de DA específico      |
| GET    | `/rdk/v1/params`             | Parámetros actuales del módulo RDK     |

## Módulo Babylon

| Método | Endpoint                         | Descripción                              |
| ------ | -------------------------------- | ---------------------------------------- |
| GET    | `/babylon/v1/staking/{address}`  | Posición de staking de BTC de una dirección dada |
| GET    | `/babylon/v1/checkpoint/{epoch}` | Datos de checkpoint de BTC de una época dada |
| GET    | `/babylon/v1/params`             | Parámetros actuales del módulo Babylon   |

## Módulo de cuentas abstractas

| Método | Endpoint                                | Descripción                                  |
| ------ | --------------------------------------- | -------------------------------------------- |
| GET    | `/abstractaccount/v1/account/{address}` | Detalles de la cuenta abstracta de una dirección dada |
| GET    | `/abstractaccount/v1/params`            | Parámetros actuales del módulo de cuentas abstractas |

## Módulo FairBlock

| Método | Endpoint               | Descripción                                |
| ------ | ---------------------- | ------------------------------------------ |
| GET    | `/fairblock/v1/config` | Configuración actual del cifrado FairBlock |
| GET    | `/fairblock/v1/params` | Parámetros actuales del módulo FairBlock   |

## Módulo de abstracción de gas

| Método | Endpoint                             | Descripción                               |
| ------ | ------------------------------------ | ----------------------------------------- |
| GET    | `/gasabstraction/v1/accepted-tokens` | Lista los tokens aceptados para el pago de gas |
| GET    | `/gasabstraction/v1/params`          | Parámetros actuales del módulo de abstracción de gas |

## Reflexión gRPC

La reflexión del servidor gRPC está habilitada de forma predeterminada, lo que permite que herramientas como `grpcurl` descubran los servicios disponibles:

```bash
grpcurl -plaintext localhost:9090 list
```

Para consultar un servicio específico:

```bash
grpcurl -plaintext localhost:9090 qorechain.pqc.v1.Query/Params
```

## Autenticación

Todos los endpoints REST y gRPC no están autenticados de forma predeterminada. Para despliegues en producción, coloca un proxy inverso (p. ej., Nginx o Caddy) delante del nodo para gestionar la terminación TLS y el control de acceso.
