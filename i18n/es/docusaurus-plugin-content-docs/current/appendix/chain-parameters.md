---
slug: /appendix/chain-parameters
title: Parámetros de la cadena
sidebar_label: Parámetros de la cadena
sidebar_position: 2
---

# Parámetros de la cadena

Referencia consolidada de los parámetros de módulo de las redes de QoreChain, agrupados por módulo. Los parámetros pueden consultarse con `qorechaind query <module> params` cuando el módulo tiene una consulta de params (`pqc`, `amm`, `crossvm`, `lightnode`, `multilayer`, `reputation`, `rlconsensus`; `ai`, `qca`, `rdk`, `bridge`, `abstractaccount` y `gasabstraction` usan `config`), y por REST únicamente en las rutas enumeradas en la [referencia REST / gRPC](/api-reference/rest-grpc-endpoints). Los parámetros de `x/inflation` también se sirven por REST en la mainnet desde v3.2.3 (`/qorechain/inflation/v1/params`). REST no está disponible en la mainnet para `ai`, `qca`, `reputation`, `crossvm`, `rlconsensus`, `fairblock` ni `xqore`, ni para los parámetros de `pqc` (la testnet sirve por REST los parámetros de `pqc`, `crossvm` y `rlconsensus` desde v3.2.6).

:::note
Los valores mostrados se leyeron en vivo de la mainnet **`qorechain-vladi`** (EVM chain ID **9801**, versión **v3.2.4**, aplicada el 23 de octubre de 2026) el 23 de octubre de 2026 (valores de génesis salvo que una propuesta de gobernanza los haya cambiado; esos casos se indican), y las filas de los módulos centrales se volvieron a leer el 27 de octubre de 2026. La propuesta de gobernanza 14 aplicaría v3.2.5 en la mainnet en la altura 3,906,833 (en su periodo de votación en el momento de escribir esto); esta página describe la mainnet tal como está hoy y se actualiza cuando se aplique esa actualización. La testnet **`qorechain-diana`** (EVM chain ID **9800**) ejecuta la versión **v3.2.6** (aplicada el 27 de octubre de 2026). Sus valores son idénticos a los de la mainnet salvo donde se indique lo contrario; las diferencias que quedan se recogen en [Diferencias entre testnet y mainnet](#testnet-differences). Las duraciones expresadas en bloques se convierten con el tiempo de bloque medido en la mainnet, de unos 3,1 segundos (la testnet produce un bloque aproximadamente cada 1,3 segundos).
:::

---

## Módulo PQC (`x/pqc`)

| Parámetro                  | Valor                      | Descripción                                                              |
| -------------------------- | -------------------------- | ------------------------------------------------------------------------ |
| `pqc_primary`              | `true`                     | Las firmas poscuánticas son el esquema principal                          |
| `allow_classical_fallback` | `false`                    | El respaldo solo clásico está cerrado; las txs del carril Cosmos deben ser híbridas |
| `min_security_level`       | `5`                        | Nivel mínimo de seguridad NIST para un algoritmo registrado               |
| `default_migration_blocks` | `1,000,000`                | Duración predeterminada de una migración de algoritmo iniciada por gobernanza (unos 36 días con bloques de ≈3,1 s) |
| `default_signature_algo`   | `1`                        | Dilithium-5 / ML-DSA-87                                                  |
| `hybrid_signature_mode`    | `2` (requerido)            | Modo de cumplimiento: 0=deshabilitado, 1=opcional, 2=requerido            |

El registro de algoritmos (id 1 `dilithium5`, id 2 `mlkem1024`) es estado de la cadena y no un parámetro. Las claves se registran explícitamente con `MsgRegisterPQCKey` o `MsgRegisterPQCKeyV2`; no existe el registro automático. Desde v3.2.3 la cadena rechaza las claves públicas débiles, degeneradas y ya utilizadas, y `MsgRegisterPQCKeyV2` acepta una prueba de posesión opcional (`tx pqc register-key-v2 ... --pqc-key <name>`) que la cadena verifica cuando está presente.

### Límites de la ventana de autorización EVM {#evm-window-limits}

Los límites de una [ventana de autorización EVM](/getting-started/first-transaction#evm-window) son constantes del protocolo y no parámetros de módulo:

| Límite | Valor |
| ----- | ----- |
| `blocks` máximo | 17,280 (unas 15 horas con bloques de ≈3,1 s) |
| `max_txs` máximo | 1,000 |
| `max_value` | mayor que 0 (uqor; valor transferido más la comisión máxima de cada transacción) |
| `allowed_targets` máximo | 16 direcciones de destinatario (ámbito opcional, v3.2.3) |

Desde v3.2.3, una ventana también puede restringirse con `native_only` (solo transferencias simples de QOR nativo).

---

## Módulo AI (`x/ai`)

La configuración del módulo (`qorechaind query ai config`):

| Parámetro           | Valor                  | Descripción                                                                 |
| ------------------- | ---------------------- | --------------------------------------------------------------------------- |
| `anomaly_threshold` | `0.7`                  | Puntuación de anomalía por encima de la cual el ante handler marca una transacción |
| `routing_strategy`  | `reputation_weighted`  | Estrategia de enrutamiento                                                   |
| `risk_threshold`    | `0.8`                  | Umbral de la puntuación de riesgo                                            |
| `max_tx_per_minute` | `600`                  | Límite de transacciones por remitente en el carril Cosmos, contado sobre una ventana de 30 bloques (unos 94 s con bloques de ≈3,1 s; el nombre es histórico). Se aplica desde v3.2.0; el valor predeterminado es 10 |

Los pesos de puntuación de fraude y los umbrales de severidad descritos en la página [Motor de IA](/architecture/ai-engine) son constantes del detector, no parámetros del módulo.

---

## Módulo Reputation (`x/reputation`)

| Parámetro   | Valor  | Descripción                                          |
| ----------- | ------ | ---------------------------------------------------- |
| `alpha`     | `0.30` | Peso de la puntuación de disponibilidad (S\_i) en la fórmula de reputación |
| `beta`      | `0.35` | Peso de la puntuación de participación (P\_i)         |
| `gamma`     | `0.20` | Peso de la puntuación comunitaria (C\_i)              |
| `delta`     | `0.15` | Peso de la puntuación de antigüedad (T\_i)            |
| `lambda`    | `1000` | Escala del decaimiento temporal de las puntuaciones históricas |
| `min_score` | `0.10` | Suelo de una puntuación de reputación                 |

Fórmula de reputación: `R_i = alpha * S_i + beta * P_i + gamma * C_i + delta * T_i` con decaimiento temporal aplicado a las puntuaciones históricas.

---

## Módulo QCA (`x/qca`)

:::note Implementado, aún no activo
La lógica CPoS de triple pool está implementada en `x/qca` y estos parámetros están en la cadena, pero **aún no están conectados a la producción de bloques, las recompensas, el slashing ni el recuento de gobernanza**. El slashing en vigor es el del módulo estándar `x/slashing` (véase [Staking, slashing, gobernanza, comisiones y EVM](#core-modules)). Véase [Mecanismo de consenso](/architecture/consensus-mechanism).
:::

La configuración (`qorechaind query qca config`):

| Parámetro                       | Valor               | Descripción                                           |
| ------------------------------- | ------------------- | ----------------------------------------------------- |
| `use_reputation_weighting`      | `true`              | Ajuste de génesis para la ponderación por reputación  |
| `min_reputation_score`          | `0.1`               | Puntuación mínima de reputación                       |
| `pool_classification_interval`  | `1000` bloques      | Bloques entre clasificaciones de pools                |
| `pool_weight_rpos`              | `0.40`              | Peso de propuesta del pool RPoS                       |
| `pool_weight_dpos`              | `0.35`              | Peso de propuesta del pool DPoS                       |
| `pool_min_delegation_dpos`      | `10,000,000,000 uqor` | Delegación mínima para el pool DPoS (10.000 QOR)    |
| `pool_rep_percentile_rpos`      | `70`                | Percentil de reputación para el pool RPoS             |
| `bonding_alpha`                 | `0.1`               | Parámetro de la curva de vinculación                  |
| `bonding_beta`                  | `1.0`               | Parámetro de la curva de vinculación                  |
| `bonding_phase_multiplier`      | `1.5`               | Multiplicador de fase de la curva de vinculación      |
| `slashing_base_rate`            | `0.01`              | Tasa base del slashing progresivo                     |
| `slashing_escalation_factor`    | `1.5`               | Factor de escalada del slashing progresivo            |
| `slashing_max_penalty`          | `0.33`              | Penalización máxima del slashing progresivo           |
| `slashing_decay_halflife`       | `100,000` bloques   | Semivida de decaimiento del slashing progresivo       |
| `qdrw_enabled`                  | `false`             | El recuento QDRW está deshabilitado                   |
| `qdrw_xqore_multiplier`         | `2.0`               | Peso de xQORE en la fórmula QDRW                      |
| `qdrw_rep_min_multiplier`       | `0.5`               | Límite inferior del multiplicador de reputación       |
| `qdrw_rep_max_multiplier`       | `2.0`               | Límite superior del multiplicador de reputación       |

---

## Módulo Burn (`x/burn`)

| Parámetro              | Valor                        | Descripción                                           |
| ---------------------- | ---------------------------- | ----------------------------------------------------- |
| `gas_burn_rate`        | `0.30`                       | Fracción del colector de comisiones que se quema      |
| `contract_create_fee`  | `100,000,000 uqor` (100 QOR) | Comisión fija de quema por la creación de un contrato |
| `ai_service_burn_rate` | `0.50`                       | Fracción de las comisiones de servicios de IA que se quema |
| `bridge_burn_rate`     | `1.00`                       | Fracción de las comisiones del puente que se quema    |
| `failed_tx_burn_rate`  | `0.10`                       | Fracción del gas de transacciones fallidas que se quema (aplicada por la cadena desde v3.2.2) |
| `validator_share`      | `0.37`                       | Fracción distribuida a los validadores                |
| `treasury_share`       | `0.20`                       | Fracción enviada a la tesorería                       |
| `staker_share`         | `0.10`                       | Fracción distribuida a los stakers                    |
| `light_node_share`     | `0.03`                       | Fracción distribuida a los nodos ligeros              |
| `enabled`              | `true`                       | Indicador de activación del módulo                    |

La división de comisiones es **37 / 30 / 20 / 10 / 3** entre validadores, quema, tesorería, stakers y nodos ligeros; las fracciones deben sumar `1.00`. También existe un `milestone_burn_schedule`. Véase [Tokenomics](/architecture/tokenomics).

---

## Módulo xQORE (`x/xqore`)

:::caution Aún no disponible en la cadena
La contabilidad del módulo xQORE existe, pero las transacciones de bloqueo y desbloqueo, las consultas y los comandos de CLI **aún no están conectados a las redes en vivo**: actualmente no se puede bloquear ningún QOR y no se ha acuñado ningún xQORE. Los valores siguientes son la configuración de génesis.
:::

| Parámetro                 | Valor                  | Descripción                                          |
| ------------------------- | ---------------------- | ---------------------------------------------------- |
| `governance_multiplier`   | `2.0`                  | Multiplicador de poder de voto para los titulares de xQORE |
| `min_lock_amount`         | `1,000,000 uqor`       | Cantidad mínima a bloquear (1 QOR)                   |
| `penalty_burn_rate`       | `0.0`                  | Fracción de las penalizaciones de salida que se quema (todas se redistribuyen) |
| `rebase_interval`         | `100` bloques          | Bloques entre eventos de rebase PvP                  |
| `enabled`                 | `true`                 | Indicador de activación del módulo                   |

Penalizaciones de salida: 50 % (bloqueo inferior a 30 días), 35 % (30–90 días), 15 % (90–180 días), 0 % (más de 180 días). Multiplicadores de bloqueo: 1.0 / 1.2 / 1.4 / 1.7 / 2.0 a 0 / 90 / 180 / 365 / 730 días.

---

## Módulo Inflation (`x/inflation`)

| Parámetro              | Valor                   | Descripción                                           |
| ---------------------- | ----------------------- | ----------------------------------------------------- |
| `emission_mode`        | `fixed`                 | `schedule` (heredado) o `fixed` (desde v3.1.94)        |
| `fixed_epoch_emission` | `86,000,000,000 uqor` (86.000 QOR) | Acuñado por época en modo fijo (16.239 QOR antes de la propuesta de gobernanza 10, del 19 de octubre de 2026) |
| `max_total_emission`   | `590,000,000,000,000 uqor` (590.000.000 QOR) | Techo acumulado estricto (114.285.714 QOR antes de la propuesta 10) |
| `epoch_length`         | `43,200` bloques        | Bloques por época (unas 37,7 horas con bloques de ≈3,1 s) |
| `schedule`             | 17,5 %, 11 %, 7 %, 7 %, 2 % | Tasas heredadas por año, sin uso en modo fijo     |
| `enabled`              | `true`                  | Indicador de activación del módulo                    |

El módulo acuña esta emisión en el colector de comisiones hasta alcanzar el tope. La primera época con 86.000 QOR comienza en el bloque 3,672,000. El 23 de octubre de 2026 (época 86) se habían acuñado 105.420.896,21 QOR y quedaban 484.579.103,79 QOR bajo el tope (`GET /qorechain/inflation/v1/epoch_info`). Véase [Tokenomics](/architecture/tokenomics#supply-and-emission).

---

## Módulo RL Consensus (`x/rlconsensus`)

El módulo `x/rlconsensus` implementa **PRISM**, la capa de optimización por aprendizaje por refuerzo. En la mainnet está en modo de observación: no se carga ningún peso de política, por lo que no ajusta nada, y los cuatro mensajes de control de PRISM están desactivados por el disyuntor (véase [Estado del disyuntor](#circuit-breaker)). En la testnet el agente funciona en **modo sombra** con una pequeña política de demostración cargada: observa cada 10 bloques y registra una acción propuesta sin cambiar ningún valor. La tabla muestra los valores de la mainnet; la testnet difiere solo en `agent_mode` (`0`, sombra) y los sirve por REST (`GET /qorechain/rlconsensus/v1/params`, v3.2.6; la mainnet responde 501).

| Parámetro                        | Valor          | Descripción                                                   |
| -------------------------------- | -------------- | ------------------------------------------------------------- |
| `enabled`                        | `true`         | Indicador de activación del módulo                            |
| `observation_interval`           | `10`           | Bloques entre muestras de observación de PRISM                |
| `agent_mode`                     | `1` (conservador) | Modo del agente: 0=sombra, 1=conservador, 2=autónomo, 3=en pausa |
| `max_change_conservative`        | `0.10`         | Cambio máximo de parámetro por acción en modo conservador     |
| `max_change_autonomous`          | `0.25`         | Cambio máximo de parámetro por acción en modo autónomo        |
| `circuit_breaker_window`         | `50`           | Ventana del disyuntor                                         |
| `circuit_breaker_threshold`      | `0.50`         | Umbral del disyuntor                                          |
| `reward_weight_throughput`       | `0.30`         | Peso de recompensa para el rendimiento                        |
| `reward_weight_finality`         | `0.25`         | Peso de recompensa para la finalidad                          |
| `reward_weight_decentralization` | `0.20`         | Peso de recompensa para la descentralización                  |
| `reward_weight_mev`              | `0.15`         | Peso de recompensa para MEV                                   |
| `reward_weight_failed_txs`       | `0.10`         | Peso de recompensa para las transacciones fallidas            |
| `default_block_time_ms`          | `5000`         | Tiempo de bloque predeterminado en la línea base de observación (no es el tiempo de bloque real) |
| `default_base_gas_price`         | `100`          | Precio base de gas predeterminado en la línea base de observación |
| `default_validator_set_size`     | `100`          | Tamaño predeterminado del conjunto de validadores en la línea base de observación |

---

## Módulo Bridge (`x/bridge`)

:::caution No está en vivo
Las 37 configuraciones de cadena están en estado `pending`, no hay validadores de puente registrados, no se ha creado ninguna operación de puente y no hay ningún canal IBC abierto en la mainnet (la testnet tiene un único canal de transferencia ICS-20 (`channel-0`) hacia una cadena de prueba con chain ID `provider`, abierto para pruebas de IBC (comprobado el 27 de octubre de 2026)). Véase [Arquitectura del puente](/architecture/bridge-architecture).
:::

`GET /qorechain/bridge/v1/config`:

| Parámetro                  | Valor                       | Descripción                                       |
| -------------------------- | --------------------------- | ------------------------------------------------- |
| `min_validators`           | `10`                        | Validadores requeridos para el conjunto de atestación |
| `attestation_threshold`    | `7`                         | Atestaciones requeridas                           |
| `challenge_period_secs`    | `86400`                     | Periodo de desafío (24 horas)                     |
| `large_transfer_threshold` | `100,000,000,000 uqor` (100.000 QOR) | Las transferencias por encima de este valor esperan el periodo de desafío |
| `enabled`                  | `true`                      | Indicador de activación del módulo                |

Los ajustes por cadena (`min_confirmations`, `max_single_transfer`, `daily_limit`) residen en la configuración de cada cadena, no en los parámetros del módulo.

---

## Módulo Multilayer (`x/multilayer`)

| Parámetro                      | Valor            | Descripción                                       |
| ------------------------------ | ---------------- | ------------------------------------------------- |
| `max_sidechains`               | `10` (testnet: `64`) | Número máximo de sidechains registradas       |
| `max_paychains`                | `50`             | Número máximo de paychains registradas            |
| `min_anchor_interval`          | `100`            | Intervalo mínimo de anclaje (bloques)             |
| `max_anchor_interval`          | `1000`           | Intervalo máximo de anclaje (bloques)             |
| `default_challenge_period`     | `86400` s        | Periodo de desafío predeterminado (1 día)         |
| `min_sidechain_stake`          | `1,000,000,000`  | Stake mínimo para registrar una sidechain (1.000 QOR) |
| `min_paychain_stake`           | `100,000,000`    | Stake mínimo para registrar una paychain (100 QOR)    |
| `routing_enabled`              | `true`           | Enrutamiento entre capas habilitado               |
| `routing_confidence_threshold` | `0.6`            | Umbral de confianza para el enrutamiento automático |
| `cross_layer_fee_bundling`     | `true`           | Un solo pago de comisión puede cubrir varias capas |

---

## Módulo Cross-VM (`x/crossvm`)

| Parámetro             | Valor   | Descripción                                    |
| --------------------- | ------- | ---------------------------------------------- |
| `max_message_size`    | `65536` | Tamaño máximo de mensaje cross-VM en bytes (64 KB) |
| `max_queue_size`      | `1000`  | Máximo de mensajes pendientes en la cola cross-VM |
| `queue_timeout_blocks`| `100`   | Bloques antes de que expire un mensaje pendiente |
| `enabled`             | `true`  | Indicador de activación del módulo             |

`MsgCrossVMCall` está desactivado en la mainnet por el disyuntor (habilitado en la testnet). La testnet sirve estos valores por REST (`GET /qorechain/crossvm/v1/params`); la mainnet responde 501.

---

## Módulo SVM (`x/svm`)

Valores de génesis:

| Parámetro               | Valor        | Descripción                                  |
| ----------------------- | ------------ | -------------------------------------------- |
| `max_program_size`      | `10485760`   | Tamaño máximo del binario del programa en bytes (10 MB) |
| `max_account_data_size` | `10485760`   | Tamaño máximo de los datos de cuenta en bytes (10 MB) |
| `compute_budget_max`    | `1400000`    | Máximo de unidades de cómputo por transacción (1,4M) |
| `lamports_per_byte`     | `3480`       | Coste de renta por byte en lamports          |
| `rent_exemption_multi`  | `2.0`        | Años de renta requeridos para la exención    |
| `enabled`               | `true`       | Indicador de activación del módulo           |
| `svm_slot_offset`       | `0`          | Desplazamiento de slot                       |
| `default_sig_scheme`    | `0`          | Esquema de firma predeterminado              |
| `max_cpi`               | `4`          | Profundidad máxima de invocación entre programas (cross-program invocation) |

El carril de transacciones SVM está deshabilitado en toda la red (véase [Redes](/appendix/networks)).

---

## Módulo RDK (`x/rdk`)

`qorechaind query rdk config`:

| Parámetro                   | Valor                | Descripción                                   |
| --------------------------- | -------------------- | --------------------------------------------- |
| `max_rollups`               | `100` (testnet: `200`) | Máximo de rollups registrados               |
| `min_stake_for_rollup`      | `10,000,000,000 uqor`| Stake mínimo del operador (10.000 QOR)        |
| `rollup_creation_burn_rate` | `0.01`               | Fracción del stake de creación que se quema (1 %) |
| `default_challenge_window`  | `604,800` s (testnet: `3,600` s) | Ventana de desafío predeterminada (7 días; 1 hora en la testnet) |
| `max_da_blob_size`          | `2,097,152`          | Tamaño máximo de blob de DA en bytes (2 MB)   |
| `blob_retention_blocks`     | `432,000`            | Bloques durante los que se retienen los blobs de DA (unos 16 días con bloques de ≈3,1 s) |
| `max_batches_per_block`     | `10`                 | Máximo de lotes procesados por bloque         |

Todavía no se ha creado ningún rollup en ninguna de las dos redes.

---

## Módulo FairBlock (`x/fairblock`)

Valores de génesis (el módulo no tiene servicio de consulta, por lo que no pueden releerse en vivo):

| Parámetro            | Valor   | Descripción                                 |
| -------------------- | ------- | ------------------------------------------- |
| `enabled`            | `false` | El cifrado tIBE de FairBlock está deshabilitado |
| `tibe_threshold`     | `5`     | Mínimo de fragmentos de clave de descifrado requeridos |
| `decryption_delay`   | `3`     | Bloques tras la finalización antes del descifrado |
| `max_encrypted_size` | `65536` | Tamaño máximo de la carga útil cifrada en bytes |

---

## Módulo Gas Abstraction (`x/gasabstraction`)

Configuración de génesis (`enabled = true`, `native_denom = uqor`):

| Denom del token | Tasa de conversión | Descripción            |
| --------------- | ------------------ | ---------------------- |
| `uqor`          | `1.0`              | Token nativo QOR (1:1) |
| `ibc/USDC`      | `1.0`              | USDC puenteado vía IBC |
| `ibc/ATOM`      | `10.0`             | ATOM puenteado vía IBC |

La tasa de conversión es la que se usa al convertir una comisión pagada en ese token.

:::note Ningún token de comisión IBC aceptado
No hay ningún canal IBC abierto en la mainnet, por lo que no puede existir allí ningún `ibc/USDC` ni `ibc/ATOM`; el único canal de prueba de la testnet tiene un pequeño saldo de vouchers de prueba, pero su lista de tokens aceptados también es solo `uqor`. Las comisiones se pagan en `uqor`.
:::

---

## Módulo Light Node (`x/lightnode`)

| Parámetro                | Valor              | Descripción                                          |
| ------------------------ | ------------------ | ---------------------------------------------------- |
| `registration_fee`       | `1,000,000 uqor` (1 QOR) | Comisión para registrar un nodo ligero         |
| `heartbeat_interval`     | `1000` bloques     | Bloques entre latidos requeridos (unos 52 minutos con bloques de ≈3,1 s) |
| `min_delegated_stake`    | `1,000,000,000 uqor` (1.000 QOR) | Stake mínimo delegado por el operador  |
| `reward_share`           | `0.03`             | Parte del colector de comisiones reservada para los nodos ligeros |
| `min_uptime_for_rewards` | `0.80`             | Fracción mínima de disponibilidad para ser elegible a recompensas |
| `max_light_nodes`        | `10,000`           | Máximo de nodos ligeros registrados                  |
| `heartbeat_grace_period` | `100` bloques      | Periodo de gracia para un latido tardío              |

La contabilidad de recompensas está en vivo. `GET /qorechain/lightnode/v1/reward_pool` informa del pool (`balance`, `reserved`, `outstanding`, `payable`, `distributable`) y del límite de recompensa por nodo. Desde v3.2.3 el límite es `max_reward_per_month_per_node`, **2.000 QOR (`2000000000` uqor) por nodo cada 30 días**, prorrateado por tiempo de bloque y escalado según la disponibilidad del nodo; el valor anterior por bloque (`max_reward_per_block_per_node`, `1713` uqor) sigue apareciendo en el informe. El 27 de octubre de 2026 el pool de la mainnet tenía una reserva de unos 13.380,9 QOR (`reserved`), de los cuales una pequeña cantidad (0,06 QOR) estaba pendiente y todavía no había nada pagadero. El registro está abierto y sujeto a licencia: en esa fecha se habían concedido siete licencias `lightnode_operator` en la mainnet y había un nodo ligero registrado en cada red (`GET /qorechain/license/v1/holders/lightnode_operator`, `GET /qorechain/lightnode/v1/stats`). Véase [Nodo ligero](/light-node/overview#reward-program-status) y [Tokenomics](/architecture/tokenomics#stranded-and-reserve).

---

## Módulo AMM (`x/amm`)

| Parámetro               | Valor                         | Descripción                         |
| ----------------------- | ----------------------------- | ----------------------------------- |
| `swap_fee_bps`          | `30`                          | Comisión de swap (0,30 %)           |
| `protocol_fee_bps`      | `10`                          | Parte de la comisión de protocolo (0,10 %) |
| `min_liquidity`         | `1000`                        | Liquidez mínima                     |
| `max_pools_per_creator` | `50`                          | Máximo de pools por creador         |
| `lp_token_decimals`     | `6`                           | Decimales de visualización de las participaciones LP (las participaciones son entradas de un libro mayor, no tokens) |
| `pool_creation_fee`     | `100,000,000 uqor` (100 QOR)  | Comisión por crear un pool          |
| `max_swap_impact_bps`   | `500`                         | Impacto máximo en el precio de un swap (5 %) |
| `enabled`               | `true`                        | Indicador de activación del módulo  |

Todavía no existen pools ni en la mainnet ni en la testnet, y `MsgPausePool` / `MsgResumePool` están desactivados en la mainnet.

---

## Cuentas inteligentes (`x/abstractaccount`)

:::caution Desactivado en la mainnet
En la mainnet `enabled` es `false` (en la testnet está en `true`, comprobado el 27 de octubre de 2026): registrar un autenticador, ejecutar a través de uno y crear una cuenta inteligente se rechazan mientras esté desactivado. Consulte `GET /qorechain/abstractaccount/v1/config` antes de construir sobre estas funciones.
:::

| Parámetro             | Valor    | Descripción                      |
| --------------------- | -------- | -------------------------------- |
| `enabled`             | `false` (testnet: `true`) | Indicador de activación del módulo |
| `max_session_keys`    | `10`     | Máximo de claves de sesión por cuenta |
| `max_spending_rules`  | `5`      | Máximo de reglas de gasto        |
| `default_session_ttl` | `86400` s| Duración predeterminada de la clave de sesión |

---

## Staking, slashing, gobernanza, comisiones y EVM {#core-modules}

Módulos estándar del Cosmos SDK y de EVM, todos leídos en vivo en la mainnet el 27 de octubre de 2026 (sin cambios respecto a las lecturas anteriores). La testnet coincide salvo en los periodos de votación de gobernanza, los precompiles de EVM activos y el permiso de instanciación de QoreChain Native (véase [Diferencias entre testnet y mainnet](#testnet-differences)).

| Módulo | Parámetro | Valor |
| --- | --- | --- |
| Staking | `unbonding_time` | 1,814,400 s (21 días) |
| | `max_validators` | 100 |
| | `max_entries` | 7 |
| | `historical_entries` | 10,000 |
| | `bond_denom` | `uqor` |
| | `min_commission_rate` | 0 |
| Slashing | `signed_blocks_window` | 10,000 bloques (unas 8,7 horas con bloques de ≈3,1 s) |
| | `min_signed_per_window` | 5 % (un validador que firme menos del 5 % de la ventana es encarcelado) |
| | `downtime_jail_duration` | 600 s |
| | `slash_fraction_downtime` | 1 % |
| | `slash_fraction_double_sign` | 5 % |
| Gobernanza | `min_deposit` | 10,000,000 uqor (10 QOR) |
| | `max_deposit_period` / `voting_period` | 172,800 s (2 días) cada uno |
| | `quorum` / `threshold` / `veto_threshold` | 0.334 / 0.5 / 0.334 |
| | `expedited_voting_period` / `expedited_min_deposit` / `expedited_threshold` | 86,400 s / 50 QOR / 0.667 |
| | `burn_vote_veto` | `true` |
| Distribución | `community_tax` | 0.02 |
| Mercado de comisiones | `min_gas_price` | 0.1 uqor por gas |
| | `base_fee_change_denominator` / `elasticity_multiplier` | 8 / 2 |
| | `no_base_fee` | `false` |
| EVM | `evm_denom` / `extended_denom` | `uqor` / `aqor` (18 decimales) |
| | acceso para crear / llamar contratos | sin permisos |
| | `active_static_precompiles` | vacío en la mainnet (no hay ningún precompile de EVM activo; la testnet tiene tres activos, véase más abajo) |
| | `history_serve_window` | 8,192 |
| ERC-20 | `enable_erc20` / `permissionless_registration` | `true` / `false` |
| QoreChain Native | `code_upload_access` / `instantiate_default_permission` | `Nobody` / `Nobody` |

---

## Estado del disyuntor {#circuit-breaker}

La cadena puede desactivar tipos de mensaje concretos con el disyuntor (circuit breaker) del Cosmos SDK, controlado por la cuenta de operaciones de la fundación y por la gobernanza. Un tipo de mensaje desactivado es rechazado por el ante handler en todos los carriles. La lista en vivo está en `GET /cosmos/circuit/v1/disable_list`.

**Mainnet (27 de octubre de 2026, 16 entradas, sin cambios desde el 14 de octubre):** creación de cuentas de vesting (`MsgCreateVestingAccount`, `MsgCreatePermanentLockedAccount`, `MsgCreatePeriodicVestingAccount`); QoreChain Native `MsgStoreCode`, `MsgInstantiateContract`, `MsgInstantiateContract2`; AMM `MsgPausePool`, `MsgResumePool`; `crossvm.MsgCrossVMCall`; `multilayer.MsgUpdateLayerStatus`; `pqc.MsgDeprecateAlgorithm`, `pqc.MsgDisableAlgorithm`; y los cuatro mensajes de control de PRISM (`MsgSetAgentMode`, `MsgUpdatePolicy`, `MsgUpdateRewardWeights`, `MsgResumeAgent`). El carril EVM (`MsgEthereumTx`) está **abierto**: estuvo desactivado del 16 al 25 de septiembre y se reabrió con la actualización v3.2.0.

**Testnet (27 de octubre de 2026, 1 entrada):** solo `MsgStoreCode` de QoreChain Native (subida de contratos); la instanciación ya no está desactivada allí.

Todos los demás tipos de mensaje, incluidos todos los mensajes estándar de bank, staking, gobernanza, distribución, authz y de registro de `x/pqc`, están habilitados. La lista está controlada por la gobernanza y puede cambiar; consúltela siempre.

---

## Diferencias entre testnet y mainnet {#testnet-differences}

Leído en vivo el 27 de octubre de 2026. La mainnet `qorechain-vladi` ejecuta v3.2.4 (desde la altura 3,742,566, 23 de octubre de 2026; la propuesta de gobernanza 14 aplicaría v3.2.5 en la altura 3,906,833 y estaba en su periodo de votación en el momento de escribir esto). La testnet `qorechain-diana` ejecuta **v3.2.6**: v3.2.4 llegó a ella en la altura 8,337,253 (19 de octubre de 2026), v3.2.5 en la altura 8,890,800 (26 de octubre) y v3.2.6 en la altura 8,970,638 (27 de octubre). La testnet es una red de preproducción que recibe cada versión primero y está ajustada para pruebas, por lo que los valores siguientes difieren de los de la mainnet. Esta sección cubre las tablas de parámetros de esta página; las funciones de v3.2.5 se documentan el día en que la mainnet aplique esa versión, y esta sección se revisa entonces. Todo parámetro que no figura aquí es idéntico en ambas redes (los valores de staking, slashing, distribución, fee-market, ERC-20, AMM, quema, nodos ligeros, puente, abstracción de gas y staking con bloqueo temporal se compararon uno por uno).

| Área | Mainnet | Testnet |
| ---- | ------- | ------- |
| Periodos de votación de gobernanza | `voting_period` 172,800 s (2 días); `expedited_voting_period` 86,400 s (1 día) | `voting_period` 14,400 s (4 horas); `expedited_voting_period` 3,600 s (1 hora). Los depósitos, el quórum y los umbrales son los mismos |
| `x/inflation` | `emission_mode` `fixed`; `fixed_epoch_emission` 86.000 QOR; `max_total_emission` 590.000.000 QOR; `target_apy_bps` `0` | `emission_mode` `target_apy`; `target_apy_bps` `1667`; `fixed_epoch_emission` 16.239 QOR; `max_total_emission` 3,950,390,341,362,112,750 uqor, ya alcanzado (`remaining_emission` `0` en `/qorechain/inflation/v1/epoch_info`, por lo que la testnet no acuña nada más) |
| Precompiles estáticos activos de EVM | ninguno (`[]`) | tres: el precompile de parámetros de PRISM en `0x0000000000000000000000000000000000000C01` y los precompiles en `0x...0a01` y `0x...0a02` |
| Agente PRISM (`x/rlconsensus`) | Modo de observación, sin política cargada; mensajes de control desactivados | Modo sombra con una política de demostración (establecida por la gobernanza de la testnet); `GET /qorechain/rlconsensus/v1/...` responde (la mainnet responde 501) |
| Cuentas inteligentes (`x/abstractaccount`) | `enabled` `false` | `enabled` `true` |
| RDK (`x/rdk`) | `max_rollups` 100; `default_challenge_window` 604,800 s | `max_rollups` 200; `default_challenge_window` 3,600 s |
| Multilayer (`x/multilayer`) | `max_sidechains` 10 | `max_sidechains` 64 |
| Permiso de instanciación de QoreChain Native | `Nobody` | `Everybody` (la subida de código sigue en `Nobody` en ambas) |
| Disyuntor | 16 entradas (véase arriba) | 1 entrada: `MsgStoreCode` de QoreChain Native |
| Rutas de parámetros por REST | los parámetros de `x/pqc`, `x/crossvm` y `x/rlconsensus` responden 501 | `GET /qorechain/pqc/v1/params`, `/qorechain/crossvm/v1/params` y `/qorechain/rlconsensus/v1/params` responden (v3.2.6) |
| Tiempo de bloque y validadores | unos 3,1 s; 8 validadores bonded | unos 1,3 s; 4 validadores bonded |
| Tokens de prueba | ninguno | fUSD, fETH y fBTC (véase [Faucet](/dashboard/faucet#fest-tokens)) |

Ambas redes incluyen las novedades de v3.2.4: el módulo opcional de staking con bloqueo temporal `x/stakingtier` (49 módulos en lugar de 48; `GET /qorechain/stakingtier/v1/params`, bloqueo mínimo de 10 QOR, penalización por desbloqueo anticipado del 5 %), una decimotercera fuente de quema registrada (`staking_tier_penalty`), campos adicionales de reporte del pool de recompensas de nodos ligeros con un límite de recompensa que comienza con el propio registro del nodo, el indicador `possession_proven` en las cuentas PQC (la prueba de posesión sigue siendo opcional para las claves de cuenta y obligatoria para las claves de validadores del puente), la ventana de desafío de RDK contada en tiempo de bloque y las consultas `protocol_features` y `auth_nonce`. Véase [Staking y delegación](/user-guide/staking-and-delegation#time-locked-staking). Las novedades de v3.2.6 en la testnet se resumen en el [Historial de versiones](/appendix/version-history#testnet-v326).
