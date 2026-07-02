---
slug: /cli-reference/query-commands
title: Comandos de consulta
sidebar_label: Comandos de consulta
sidebar_position: 3
---

# Comandos de consulta

Todos los comandos de consulta siguen el patrón:

```bash
qorechaind query <module> <command> [args] [flags]
```

:::note
Las consultas se ejecutan contra el nodo al que apunte `--node`. Use un endpoint RPC de la mainnet **`qorechain-vladi`** (versión de cadena **v3.1.82**) para datos en vivo, o un endpoint de la testnet **`qorechain-diana`** para pruebas. El valor por defecto `tcp://localhost:26657` apunta a un nodo que usted mismo ejecuta.
:::

Los flags comunes se aplican a cada subcomando `query`:

| Flag       | Tipo   | Descripción                                     |
| ---------- | ------ | ----------------------------------------------- |
| `--node`   | string | Endpoint RPC (por defecto: `tcp://localhost:26657`) |
| `--output` | string | Formato de salida: `json` o `text`              |
| `--height` | int    | Consultar el estado en una altura de bloque específica |

---

## bank

### balances

Consulta todos los saldos de una cuenta.

```bash
qorechaind query bank balances <address>
```

### total

Consulta el suministro total de todos los tokens.

```bash
qorechaind query bank total
```

---

## staking

### validator

Consulta un único validador por su dirección de operador.

```bash
qorechaind query staking validator <validator_address>
```

### validators

Lista todos los validadores.

```bash
qorechaind query staking validators
```

### delegation

Consulta una delegación de un delegador a un validador.

```bash
qorechaind query staking delegation <delegator_address> <validator_address>
```

### delegations

Consulta todas las delegaciones de un delegador.

```bash
qorechaind query staking delegations <delegator_address>
```

### unbonding-delegation

Consulta una delegación en proceso de desvinculación.

```bash
qorechaind query staking unbonding-delegation <delegator_address> <validator_address>
```

---

## distribution

### rewards

Consulta todas las recompensas de delegación de un delegador.

```bash
qorechaind query distribution rewards <delegator_address>
```

### commission

Consulta la comisión de un validador.

```bash
qorechaind query distribution commission <validator_address>
```

---

## gov

### proposal

Consulta una única propuesta por su ID.

```bash
qorechaind query gov proposal <proposal_id>
```

### proposals

Lista todas las propuestas, opcionalmente filtradas por estado.

```bash
qorechaind query gov proposals [flags]
```

| Flag       | Tipo   | Descripción                                                               |
| ---------- | ------ | ------------------------------------------------------------------------- |
| `--status` | string | Filtrar por estado: `deposit_period`, `voting_period`, `passed`, `rejected` |

### votes

Consulta los votos sobre una propuesta.

```bash
qorechaind query gov votes <proposal_id>
```

---

## pqc

### account

Consulta el estado de registro de la clave PQC de una cuenta.

```bash
qorechaind query pqc account <address>
```

### algorithms

Lista todos los algoritmos PQC soportados.

```bash
qorechaind query pqc algorithms
```

### algorithm

Consulta los detalles de un algoritmo PQC específico.

```bash
qorechaind query pqc algorithm <algorithm_name>
```

### stats

Consulta las estadísticas agregadas de registro PQC.

```bash
qorechaind query pqc stats
```

### params

Consulta los parámetros del módulo PQC.

```bash
qorechaind query pqc params
```

### migration

Consulta el estado de migración de la clave PQC de una cuenta.

```bash
qorechaind query pqc migration <address>
```

### hybrid-mode

Consulta el modo actual de imposición de firmas híbridas.

```bash
qorechaind query pqc hybrid-mode
```

---

## xqore

### position

Consulta la posición de staking de xQORE de una dirección.

```bash
qorechaind query xqore position <address>
```

### params

Consulta los parámetros del módulo xQORE.

```bash
qorechaind query xqore params
```

---

## burn

### stats

Consulta las estadísticas de quema en todos los canales.

```bash
qorechaind query burn stats
```

### params

Consulta los parámetros del módulo de quema.

```bash
qorechaind query burn params
```

---

## inflation

### rate

Consulta la tasa de inflación anualizada actual.

```bash
qorechaind query inflation rate
```

### epoch

Consulta el número de época actual y su progreso.

```bash
qorechaind query inflation epoch
```

### params

Consulta los parámetros del módulo de inflación.

```bash
qorechaind query inflation params
```

---

## ai

### config

Consulta la configuración del módulo de IA.

```bash
qorechaind query ai config
```

### stats

Consulta las estadísticas agregadas de procesamiento de IA.

```bash
qorechaind query ai stats
```

### fee-estimate

Obtiene una estimación de tarifa de gas asistida por IA.

```bash
qorechaind query ai fee-estimate [flags]
```

| Flag        | Tipo   | Descripción                     |
| ----------- | ------ | ------------------------------- |
| `--tx-type` | string | Tipo de transacción para la estimación |
| `--urgency` | string | `low`, `medium`, `high`         |

### investigations

Lista las investigaciones de fraude activas.

```bash
qorechaind query ai investigations
```

### recommendations

Obtiene recomendaciones de optimización de red generadas por IA.

```bash
qorechaind query ai recommendations
```

### circuit-breakers

Consulta los estados actuales de los circuit breakers.

```bash
qorechaind query ai circuit-breakers
```

---

## reputation

### validators

Consulta las puntuaciones de reputación de todos los validadores.

```bash
qorechaind query reputation validators
```

### validator

Consulta la puntuación de reputación de un validador específico.

```bash
qorechaind query reputation validator <validator_address>
```

---

## bridge

### chains

Lista todas las cadenas de bridge registradas.

```bash
qorechaind query bridge chains
```

### chain

Consulta los detalles de una cadena con bridge específica.

```bash
qorechaind query bridge chain <chain_id>
```

### validators

Lista los validadores de bridge activos.

```bash
qorechaind query bridge validators
```

### operations

Lista las operaciones de bridge recientes.

```bash
qorechaind query bridge operations
```

| Flag       | Tipo   | Descripción                              |
| ---------- | ------ | ---------------------------------------- |
| `--status` | string | Filtro: `pending`, `completed`, `failed` |
| `--chain`  | string | Filtrar por chain ID                     |

### limits

Consulta los límites de tasa de una cadena con bridge.

```bash
qorechaind query bridge limits <chain_id>
```

### estimate

Estima la tarifa de bridge y el tiempo de transferencia.

```bash
qorechaind query bridge estimate <chain_id> <amount> <asset>
```

---

## crossvm

### message

Recupera un mensaje cross-VM por su ID.

```bash
qorechaind query crossvm message <message_id>
```

### pending

Lista los mensajes cross-VM pendientes.

```bash
qorechaind query crossvm pending
```

### params

Consulta los parámetros del módulo Cross-VM.

```bash
qorechaind query crossvm params
```

---

## svm

### account

Consulta la información de una cuenta SVM.

```bash
qorechaind query svm account <pubkey>
```

### program

Consulta la información de un programa SVM desplegado.

```bash
qorechaind query svm program <program_id>
```

### params

Consulta los parámetros del módulo SVM.

```bash
qorechaind query svm params
```

### slot

Consulta el número de slot SVM actual.

```bash
qorechaind query svm slot
```

---

## multilayer

### layer

Consulta los detalles de una capa específica.

```bash
qorechaind query multilayer layer <layer_id>
```

### layers

Lista todas las capas registradas.

```bash
qorechaind query multilayer layers
```

### anchor

Consulta un registro de anclaje específico.

```bash
qorechaind query multilayer anchor <anchor_id>
```

### anchors

Lista los envíos de anclaje recientes.

```bash
qorechaind query multilayer anchors [flags]
```

| Flag         | Tipo   | Descripción               |
| ------------ | ------ | ------------------------- |
| `--layer-id` | string | Filtrar por ID de capa    |
| `--limit`    | uint   | Máximo de resultados a devolver |

### routing-stats

Consulta las estadísticas de enrutamiento de transacciones entre capas.

```bash
qorechaind query multilayer routing-stats
```

### simulate-route

Simula el enrutamiento de una transacción sin ejecutarla.

```bash
qorechaind query multilayer simulate-route <tx_data_hex>
```

### params

Consulta los parámetros del módulo Multilayer.

```bash
qorechaind query multilayer params
```

---

## rdk

### rollup

Consulta los detalles de un rollup específico.

```bash
qorechaind query rdk rollup <rollup_id>
```

### rollups

Lista todos los rollups registrados.

```bash
qorechaind query rdk rollups
```

| Flag       | Tipo   | Descripción                           |
| ---------- | ------ | ------------------------------------- |
| `--status` | string | Filtro: `active`, `paused`, `stopped` |

### batch

Consulta un lote de liquidación específico.

```bash
qorechaind query rdk batch <rollup_id> <batch_index>
```

### latest-batch

Consulta el último lote de un rollup.

```bash
qorechaind query rdk latest-batch <rollup_id>
```

### suggest-profile

Obtiene una recomendación de perfil de rollup asistida por IA.

```bash
qorechaind query rdk suggest-profile <use_case>
```

### blob

Consulta un blob de DA específico.

```bash
qorechaind query rdk blob <rollup_id> <blob_index>
```

### params

Consulta los parámetros del módulo RDK.

```bash
qorechaind query rdk params
```

:::note
Las pruebas de retiro de rollups y el estado de liquidación también se pueden consultar bajo el grupo `rdk`. Los subcomandos de consulta exactos y sus argumentos dependen del tipo de liquidación de su rollup; consulte la documentación de **Rollup Development Kit** para conocer la superficie autoritativa de consultas de retiro/liquidación.
:::

---

## rlconsensus

PRISM es la capa de aprendizaje por refuerzo que ajusta los parámetros de consenso. El nombre de módulo de la CLI `rlconsensus` y sus subcomandos se conservan textualmente.

### agent-status

Consulta el estado y modo actual del agente PRISM.

```bash
qorechaind query rlconsensus agent-status
```

### observation

Consulta el último vector de observación de PRISM.

```bash
qorechaind query rlconsensus observation
```

### reward

Consulta las métricas acumuladas de recompensa de PRISM.

```bash
qorechaind query rlconsensus reward
```

### params

Consulta los parámetros del módulo PRISM Consensus.

```bash
qorechaind query rlconsensus params
```

### policy

Consulta la configuración de política activa de PRISM.

```bash
qorechaind query rlconsensus policy
```

---

## babylon

### staking

Consulta la posición de staking de BTC de una dirección.

```bash
qorechaind query babylon staking <address>
```

### checkpoint

Consulta los datos de checkpoint de BTC para una época determinada.

```bash
qorechaind query babylon checkpoint <epoch>
```

### params

Consulta los parámetros del módulo Babylon.

```bash
qorechaind query babylon params
```

---

## abstractaccount

### account

Consulta los detalles de una cuenta abstracta.

```bash
qorechaind query abstractaccount account <address>
```

### params

Consulta los parámetros del módulo Abstract Account.

```bash
qorechaind query abstractaccount params
```

---

## gasabstraction

### accepted-tokens

Lista los tokens aceptados para el pago de gas.

```bash
qorechaind query gasabstraction accepted-tokens
```

### params

Consulta los parámetros del módulo Gas Abstraction.

```bash
qorechaind query gasabstraction params
```

---

## fairblock

### config

Consulta la configuración de cifrado de FairBlock.

```bash
qorechaind query fairblock config
```

### params

Consulta los parámetros del módulo FairBlock.

```bash
qorechaind query fairblock params
```
