---
slug: /appendix/chain-parameters
title: Parámetros de la cadena
sidebar_label: Parámetros de la cadena
sidebar_position: 2
---

# Parámetros de la cadena

Referencia consolidada de todos los parámetros de módulo configurables en el génesis de QoreChain. Los parámetros se agrupan por módulo y pueden consultarse en tiempo de ejecución con `qorechaind query <module> params`.

:::note
Los valores mostrados son los predeterminados de génesis desplegados. Los parámetros se aplican a la mainnet **`qorechain-vladi`** (EVM chain ID **9801**) y a la testnet **`qorechain-diana`** (EVM chain ID **9800**) salvo que se indique lo contrario.
:::

---

## Módulo PQC (`x/pqc`)

| Parameter                   | Type   | Default Value          | Description                                                            |
| --------------------------- | ------ | ---------------------- | ---------------------------------------------------------------------- |
| `hybrid_signature_mode`     | uint   | `2` (required)         | Modo de cumplimiento: 0=deshabilitado, 1=opcional, 2=requerido (predeterminado actual) |
| `allow_classical_fallback`  | bool   | `false`                | El respaldo solo clásico está cerrado; las txs de cosmos deben ser híbridas |
| `algorithm_registry`        | array  | ML-DSA-87, ML-KEM-1024 | Algoritmos PQC registrados con restricciones de tamaño                 |
| `auto_register_enabled`     | bool   | `true`                 | Registrar automáticamente las claves PQC en la primera tx híbrida     |
| `migration_deadline_height` | uint64 | `0`                    | Altura de bloque tras la cual se rechazan las claves solo clásicas (0=deshabilitado) |
| `migration_grace_period`    | uint64 | `100000`               | Bloques de aviso antes del plazo límite de migración                   |

---

## Módulo AI (`x/ai`)

| Parameter                  | Type   | Default Value | Description                                       |
| -------------------------- | ------ | ------------- | ------------------------------------------------- |
| `anomaly_weight_volume`    | string | `0.30`        | Peso de la anomalía de volumen en la puntuación de fraude |
| `anomaly_weight_velocity`  | string | `0.25`        | Peso de la anomalía de velocidad en la puntuación de fraude |
| `anomaly_weight_pattern`   | string | `0.25`        | Peso de la anomalía de patrón en la puntuación de fraude |
| `anomaly_weight_network`   | string | `0.20`        | Peso de la anomalía de grafo de red en la puntuación de fraude |
| `fraud_threshold_low`      | string | `0.30`        | Umbral de puntuación para alerta de severidad baja |
| `fraud_threshold_medium`   | string | `0.55`        | Umbral de puntuación para alerta de severidad media |
| `fraud_threshold_high`     | string | `0.75`        | Umbral de puntuación para alerta de severidad alta |
| `fraud_threshold_critical` | string | `0.90`        | Umbral de puntuación para alerta de severidad crítica |
| `circuit_breaker_enabled`  | bool   | `true`        | Habilitar los disyuntores de QCAI                 |

---

## Módulo Reputation (`x/reputation`)

| Parameter      | Type   | Default Value | Description                                          |
| -------------- | ------ | ------------- | ---------------------------------------------------- |
| `alpha`        | string | `0.30`        | Peso de la puntuación de disponibilidad (S\_i) en la fórmula de reputación |
| `beta`         | string | `0.25`        | Peso de la puntuación de participación (P\_i)                |
| `gamma`        | string | `0.25`        | Peso de la puntuación comunitaria (C\_i)                |
| `delta`        | string | `0.20`        | Peso de la puntuación de antigüedad (T\_i)                       |
| `decay_lambda` | string | `0.01`        | Factor de decaimiento temporal exponencial para puntuaciones históricas  |

Fórmula de reputación: `R_i = alpha * S_i + beta * P_i + gamma * C_i + delta * T_i` con decaimiento temporal exponencial aplicado por época.

---

## Módulo QCA (`x/qca`)

| Parameter                      | Type   | Default Value | Description                                    |
| ------------------------------ | ------ | ------------- | ---------------------------------------------- |
| `emerald_pool_weight`          | string | `0.50`        | Peso de propuesta de bloque para el pool Emerald |
| `sapphire_pool_weight`         | string | `0.30`        | Peso de propuesta de bloque para el pool Sapphire |
| `ruby_pool_weight`             | string | `0.20`        | Peso de propuesta de bloque para el pool Ruby  |
| `emerald_min_reputation`       | string | `0.80`        | Puntuación mínima de reputación para el pool Emerald |
| `sapphire_min_reputation`      | string | `0.50`        | Puntuación mínima de reputación para el pool Sapphire |
| `bonding_curve_base_rate`      | string | `0.05`        | Tasa base para la curva de vinculación de staking |
| `bonding_curve_multiplier`     | string | `1.50`        | Multiplicador para la progresión de la curva de vinculación |
| `slashing_downtime_window`     | int64  | `10000`       | Bloques para evaluar el tiempo de inactividad  |
| `slashing_downtime_threshold`  | string | `0.05`        | Fracción mínima de bloques firmados antes del slashing |
| `slashing_downtime_penalty`    | string | `0.01`        | Fracción de slash por inactividad              |
| `slashing_double_sign_penalty` | string | `0.05`        | Fracción de slash por doble firma              |
| `qdrw_enabled`                 | bool   | `true`        | Habilitar la Ponderación Dinámica de Recompensas |
| `qdrw_throughput_weight`       | string | `0.40`        | Peso de QDRW para la métrica de rendimiento    |
| `qdrw_latency_weight`          | string | `0.30`        | Peso de QDRW para la métrica de latencia       |
| `qdrw_security_weight`         | string | `0.20`        | Peso de QDRW para la métrica de seguridad      |
| `qdrw_decentralization_weight` | string | `0.10`        | Peso de QDRW para la métrica de descentralización |
| `qdrw_adjustment_cap`          | string | `0.10`        | Ajuste máximo de QDRW en una sola época        |
| `qdrw_adjustment_interval`     | int64  | `100`         | Bloques entre ajustes de QDRW                  |

---

## Módulo Burn (`x/burn`)

| Parameter           | Type   | Default Value | Description                                       |
| ------------------- | ------ | ------------- | ------------------------------------------------- |
| `burn_enabled`      | bool   | `true`        | Habilitar el mecanismo de quema de comisiones     |
| `validator_share`   | string | `0.37`        | Fracción de comisiones distribuida a los validadores de bloque |
| `burn_share`        | string | `0.30`        | Fracción de comisiones quemada permanentemente    |
| `treasury_share`    | string | `0.20`        | Fracción de comisiones enviada a la tesorería comunitaria |
| `staker_share`      | string | `0.10`        | Fracción de comisiones distribuida a los delegadores |
| `light_node_share`  | string | `0.03`        | Fracción de comisiones distribuida a los nodos ligeros |

Las fracciones deben sumar `1.00`. La división de comisiones es **37 / 30 / 20 / 10 / 3** entre validadores, quema, tesorería, stakers y nodos ligeros.

---

## Módulo xQORE (`x/xqore`)

| Parameter            | Type   | Default Value | Description                                   |
| -------------------- | ------ | ------------- | --------------------------------------------- |
| `min_lock_amount`    | string | `1000000uqor` | Cantidad mínima a bloquear como xQORE         |
| `min_lock_duration`  | string | `7d`          | Duración mínima de bloqueo                     |
| `max_lock_duration`  | string | `365d`        | Duración máxima de bloqueo                     |
| `penalty_tier_1_pct` | string | `0.50`        | Penalización por desbloqueo anticipado: 0-25% del bloqueo transcurrido |
| `penalty_tier_2_pct` | string | `0.30`        | Penalización por desbloqueo anticipado: 25-50% del bloqueo transcurrido |
| `penalty_tier_3_pct` | string | `0.15`        | Penalización por desbloqueo anticipado: 50-75% del bloqueo transcurrido |
| `penalty_tier_4_pct` | string | `0.05`        | Penalización por desbloqueo anticipado: 75-100% del bloqueo transcurrido |
| `pvp_rebase_enabled` | bool   | `true`        | Habilitar la redistribución por rebase PvP    |

---

## Módulo Inflation (`x/inflation`)

| Parameter         | Type   | Default Value          | Description                                      |
| ----------------- | ------ | ---------------------- | ------------------------------------------------ |
| `epoch_length`    | uint64 | `100`                  | Bloques por época de inflación                    |
| `blocks_per_year` | uint64 | `6311520`              | Bloques estimados por año (para el cálculo de la tasa) |
| `initial_rate`    | string | `0.08`                 | Parámetro de tasa de emisión anualizada inicial  |
| `rate_decay`      | string | `0.05`                 | Factor de decaimiento aplicado cada año          |
| `min_rate`        | string | `0.02`                 | Parámetro de tasa de emisión mínima              |
| `max_supply`      | string | `1000000000000000uqor` | Límite máximo de suministro de tokens            |

:::note
Los parámetros de `x/inflation` anteriores son los predeterminados del mecanismo desplegado. Bajo el modelo económico canónico **tokenomics v2.1**, QoreChain tiene **suministro fijo** con un **presupuesto de emisión finito (pool de 590M)** que financia el staking y las recompensas del ecosistema. Los valores de `initial_rate` / `rate_decay` / `min_rate` son detalles del mecanismo que rigen cómo se programan las emisiones dentro de ese presupuesto finito; **no** son una inflación porcentual abierta del suministro total.
:::

---

## Módulo RL Consensus (`x/rlconsensus`)

El módulo `x/rlconsensus` implementa **PRISM**, la capa de optimización por aprendizaje por refuerzo del Motor de Consenso de QoreChain.

| Parameter                    | Type   | Default Value | Description                                     |
| ---------------------------- | ------ | ------------- | ----------------------------------------------- |
| `observation_interval`       | uint64 | `10`          | Bloques entre muestras de observación de PRISM  |
| `agent_mode`                 | uint   | `0`           | Modo del agente: 0=apagado, 1=observar, 2=sugerir, 3=automático |
| `circuit_breaker_enabled`    | bool   | `true`        | Habilitar el disyuntor de PRISM                  |
| `circuit_breaker_max_change` | string | `0.10`        | Cambio máximo de parámetro por acción (10%)     |
| `circuit_breaker_cooldown`   | uint64 | `100`         | Bloques de espera tras activarse el disyuntor   |
| `reward_throughput_weight`   | string | `0.40`        | Peso de recompensa para el rendimiento          |
| `reward_latency_weight`      | string | `0.30`        | Peso de recompensa para la latencia             |
| `reward_security_weight`     | string | `0.20`        | Peso de recompensa para la seguridad            |
| `reward_stability_weight`    | string | `0.10`        | Peso de recompensa para la estabilidad          |
| `ppo_learning_rate`          | string | `0.0003`      | Tasa de aprendizaje de PPO                       |
| `ppo_clip_range`             | string | `0.20`        | Rango de recorte de PPO                          |

---

## Módulo Bridge (`x/bridge`)

| Parameter                       | Type   | Default Value | Description                                     |
| ------------------------------- | ------ | ------------- | ----------------------------------------------- |
| `min_confirmations_ibc`         | uint64 | `1`           | Confirmaciones mínimas para transferencias IBC  |
| `min_confirmations_ethereum`    | uint64 | `12`          | Confirmaciones mínimas para el puente de Ethereum |
| `min_confirmations_bitcoin`     | uint64 | `6`           | Confirmaciones mínimas para el puente de Bitcoin |
| `circuit_breaker_enabled`       | bool   | `true`        | Habilitar el disyuntor del puente               |
| `circuit_breaker_max_daily_usd` | string | `10000000`    | Volumen máximo diario del puente (equivalente en USD) |
| `circuit_breaker_max_single_tx` | string | `1000000`     | Cantidad máxima de una sola transferencia (equivalente en USD) |

---

## Módulo Multilayer (`x/multilayer`)

| Parameter                   | Type   | Default Value      | Description                                       |
| --------------------------- | ------ | ------------------ | ------------------------------------------------- |
| `max_sidechains`            | uint   | `10`               | Número máximo de sidechains registradas           |
| `max_paychains`             | uint   | `50`               | Número máximo de paychains registradas            |
| `anchor_interval_sidechain` | uint64 | `100`              | Intervalo de anclaje obligatorio para sidechains (bloques) |
| `anchor_interval_paychain`  | uint64 | `50`               | Intervalo de anclaje obligatorio para paychains (bloques)  |
| `challenge_period`          | string | `7d`               | Duración de los desafíos de fraude sobre los anclajes |
| `min_sidechain_stake`       | string | `1000000000uqor` | Stake mínimo para registrar una sidechain (1.000 QOR) |
| `min_paychain_stake`        | string | `100000000uqor`  | Stake mínimo para registrar una paychain (100 QOR)    |
| `routing_threshold`         | string | `0.80`             | Umbral de carga para activar el enrutamiento automático |

---

## Módulo Cross-VM (`x/crossvm`)

| Parameter          | Type   | Default Value | Description                                    |
| ------------------ | ------ | ------------- | ---------------------------------------------- |
| `max_message_size` | uint64 | `65536`       | Tamaño máximo de mensaje cross-VM en bytes (64 KB) |
| `max_queue_size`   | uint   | `1000`        | Máximo de mensajes pendientes en la cola cross-VM |
| `queue_timeout`    | uint64 | `100`         | Bloques antes de que expire un mensaje pendiente   |

---

## Módulo SVM (`x/svm`)

| Parameter                     | Type   | Default Value | Description                                  |
| ----------------------------- | ------ | ------------- | -------------------------------------------- |
| `max_program_size`            | uint64 | `10485760`    | Tamaño máximo del binario del programa en bytes (10 MB) |
| `compute_budget`              | uint64 | `1400000`     | Unidades de cómputo predeterminadas por transacción (1,4M) |
| `rent_lamports_per_byte_year` | uint64 | `3480`        | Coste anual de renta por byte en lamports    |
| `rent_exemption_threshold`    | string | `2.0`         | Años de renta requeridos para la exención     |
| `max_accounts_per_tx`         | uint   | `64`          | Máximo de cuentas referenciadas por transacción  |

---

## Módulo RDK (`x/rdk`)

| Parameter             | Type   | Default Value                      | Description                              |
| --------------------- | ------ | ---------------------------------- | ---------------------------------------- |
| `max_rollups`         | uint   | `100`                              | Máximo de rollups registrados            |
| `min_stake`           | string | `10000000000uqor`                  | Stake mínimo del operador (10.000 QOR)   |
| `burn_rate`           | string | `0.01`                             | Porcentaje de comisiones del rollup quemadas (1%) |
| `challenge_window`    | string | `7d`                               | Duración de la ventana de desafío de fraude |
| `max_blob_size`       | uint64 | `2097152`                          | Tamaño máximo de blob de DA en bytes (2 MB) |
| `blob_retention`      | uint64 | `432000`                           | Bloques para retener los blobs de DA antes de la poda |
| `max_batches_pending` | uint   | `10`                               | Máximo de lotes no finalizados por rollup |
| `auto_finalize`       | bool   | `true`                             | Habilitar la autofinalización en EndBlocker |
| `settlement_types`    | array  | optimistic, zk, based, sovereign   | Paradigmas de liquidación permitidos     |
| `preset_profiles`     | array  | defi, gaming, nft, enterprise, custom | Presets de rollup disponibles         |

---

## Módulo FairBlock (`x/fairblock`)

| Parameter            | Type   | Default Value | Description                                 |
| -------------------- | ------ | ------------- | ------------------------------------------- |
| `enabled`            | bool   | `false`       | Habilitar el cifrado tIBE de FairBlock      |
| `tibe_threshold`     | uint   | `2`           | Mínimo de fragmentos de clave de descifrado requeridos |
| `decryption_delay`   | uint64 | `1`           | Bloques tras la finalización antes del descifrado |
| `max_encrypted_size` | uint64 | `4096`        | Tamaño máximo de la carga útil cifrada en bytes |

---

## Módulo Gas Abstraction (`x/gasabstraction`)

| Parameter         | Type  | Default Value | Description                                           |
| ----------------- | ----- | ------------- | ----------------------------------------------------- |
| `accepted_tokens` | array | (ver abajo)   | Tokens aceptados para el pago de gas con tasas de conversión |

**Tokens aceptados predeterminados:**

| Token Denom | Conversion Rate | Description            |
| ----------- | --------------- | ---------------------- |
| `uqor`      | `1.0`           | Token nativo QOR (1:1) |
| `ibc/USDC`  | `1.0`           | USDC puenteado vía IBC |
| `ibc/ATOM`  | `10.0`          | ATOM puenteado vía IBC |

Las tasas de conversión representan el número de unidades de gas por unidad de token. Las tasas más altas significan que cada unidad de token cubre más gas.
