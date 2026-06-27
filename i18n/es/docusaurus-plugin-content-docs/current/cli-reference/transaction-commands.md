---
slug: /cli-reference/transaction-commands
title: Comandos de transacción
sidebar_label: Comandos de transacción
sidebar_position: 2
---

# Comandos de transacción

Todos los comandos de transacción siguen el patrón:

```bash
qorechaind tx <module> <command> [args] [flags]
```

:::note
Establezca `--chain-id qorechain-vladi` para transmitir contra la mainnet en vivo (versión de cadena **v3.1.77**), o `--chain-id qorechain-diana` para la testnet. Si se omite, el cliente usa el `chain-id` de su configuración local.
:::

Los flags comunes se aplican a cada subcomando `tx`:

| Flag                | Tipo   | Descripción                                     |
| ------------------- | ------ | ----------------------------------------------- |
| `--from`            | string | Nombre o dirección de la clave de firma         |
| `--chain-id`        | string | Identificador de la cadena (por defecto: de la configuración) |
| `--fees`            | string | Tarifas de transacción (p. ej., `500uqor`)      |
| `--gas`             | string | Límite de gas o `auto` para estimación          |
| `--gas-adjustment`  | float  | Multiplicador de gas al usar `auto` (por defecto: 1.0) |
| `--keyring-backend` | string | Backend del keyring: `os`, `file`, `test`       |
| `--node`            | string | Endpoint RPC (por defecto: `tcp://localhost:26657`) |
| `--broadcast-mode`  | string | `sync`, `async` o `block`                       |
| `-y`                | bool   | Omitir la confirmación                          |

---

## bank

### send

Transfiere tokens de una cuenta a otra.

```bash
qorechaind tx bank send <from_address> <to_address> <amount> [flags]
```

---

## staking

### create-validator

Crea un nuevo validador en la red.

```bash
qorechaind tx staking create-validator [flags]
```

| Flag                           | Tipo   | Descripción                                  |
| ------------------------------ | ------ | -------------------------------------------- |
| `--amount`                     | string | Monto de autodelegación (p. ej., `1000000uqor`) |
| `--pubkey`                     | string | Clave pública de consenso del validador (JSON) |
| `--moniker`                    | string | Nombre visible del validador                 |
| `--commission-rate`            | string | Tasa de comisión inicial (p. ej., `0.10`)    |
| `--commission-max-rate`        | string | Tasa de comisión máxima                      |
| `--commission-max-change-rate` | string | Tasa máxima de cambio diario de comisión     |
| `--min-self-delegation`        | string | Autodelegación mínima requerida              |

### edit-validator

Edita la descripción o comisión de un validador existente.

```bash
qorechaind tx staking edit-validator [flags]
```

### delegate

Delega tokens a un validador.

```bash
qorechaind tx staking delegate <validator_address> <amount> [flags]
```

### redelegate

Mueve una delegación de un validador a otro.

```bash
qorechaind tx staking redelegate <src_validator> <dst_validator> <amount> [flags]
```

### unbond

Desvincula tokens de un validador.

```bash
qorechaind tx staking unbond <validator_address> <amount> [flags]
```

---

## distribution

### withdraw-all-rewards

Retira todas las recompensas de staking pendientes.

```bash
qorechaind tx distribution withdraw-all-rewards [flags]
```

### withdraw-rewards

Retira las recompensas de un validador específico.

```bash
qorechaind tx distribution withdraw-rewards <validator_address> [flags]
```

| Flag           | Tipo | Descripción                        |
| -------------- | ---- | ---------------------------------- |
| `--commission` | bool | Retirar también la comisión del validador |

---

## gov

### submit-proposal

Envía una propuesta de gobernanza.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> [flags]
```

El archivo de propuesta es un documento JSON que especifica el tipo de propuesta, el título, la descripción y cualquier mensaje a ejecutar.

### vote

Vota sobre una propuesta activa.

```bash
qorechaind tx gov vote <proposal_id> <option> [flags]
```

Opciones de voto: `yes`, `no`, `abstain`, `no_with_veto`.

### deposit

Añade un depósito a una propuesta.

```bash
qorechaind tx gov deposit <proposal_id> <amount> [flags]
```

---

## pqc

La ruta de transacción de cosmos requiere una firma híbrida por defecto (`hybrid_signature_mode = required`). Los comandos `gen-key` y `cosign` producen la clave Dilithium-5 (ML-DSA-87) y la extensión `PQCHybridSignature` necesarias para transaccionar en la ruta de cosmos junto con la firma clásica secp256k1.

### gen-key

Genera una clave post-cuántica Dilithium-5 (ML-DSA-87) para firma híbrida.

```bash
qorechaind tx pqc gen-key [flags]
```

### cosign

Adjunta una cofirma Dilithium-5 a una transacción como una extensión `PQCHybridSignature`, produciendo una transacción híbrida (secp256k1 + ML-DSA-87). Requerido para las transacciones de la ruta de cosmos bajo el modo de imposición `required` por defecto. Las herramientas estándar de CosmJS / relayer deben producir esta extensión para transaccionar; el `buildHybridTx` (con `includePqcPublicKey`) del SDK de QoreChain hace el equivalente.

```bash
qorechaind tx pqc cosign <unsigned_tx_file> [flags]
```

### register-key

Registra una clave pública post-cuántica para una cuenta.

```bash
qorechaind tx pqc register-key <algorithm> <pubkey_hex> [flags]
```

### register-key-v2

Registra una clave PQC con metadatos extendidos y atestación.

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> [flags]
```

| Flag            | Tipo   | Descripción                    |
| --------------- | ------ | ------------------------------ |
| `--attestation` | string | Datos de atestación TEE (hex)  |
| `--metadata`    | string | Metadatos adicionales de la clave (JSON) |

### migrate-key

Migra una clave clásica existente a un par de claves PQC híbrido.

```bash
qorechaind tx pqc migrate-key <algorithm> <pqc_pubkey_hex> [flags]
```

---

## xqore

### lock

Bloquea tokens QOR en una posición de staking de gobernanza xQORE.

```bash
qorechaind tx xqore lock <amount> [flags]
```

| Flag              | Tipo   | Descripción                                |
| ----------------- | ------ | ------------------------------------------ |
| `--lock-duration` | string | Duración del bloqueo (p. ej., `30d`, `90d`, `180d`) |

### unlock

Desbloquea xQORE de vuelta a QOR. El desbloqueo anticipado puede incurrir en penalizaciones según el nivel de penalización.

```bash
qorechaind tx xqore unlock <amount> [flags]
```

---

## bridge

### deposit

Inicia un depósito de bridge desde una cadena externa.

```bash
qorechaind tx bridge deposit <chain_id> <amount> <asset> [flags]
```

| Flag          | Tipo   | Descripción                    |
| ------------- | ------ | ------------------------------ |
| `--recipient` | string | Dirección del destinatario en QoreChain |

### withdraw

Inicia un retiro de bridge hacia una cadena externa.

```bash
qorechaind tx bridge withdraw <chain_id> <amount> <asset> <destination_address> [flags]
```

---

## crossvm

### call

Envía un mensaje cross-VM entre entornos de ejecución (EVM, CosmWasm, SVM).

```bash
qorechaind tx crossvm call <target_vm> <contract_address> <payload_hex> [flags]
```

| Flag          | Tipo   | Descripción                          |
| ------------- | ------ | ------------------------------------ |
| `--source-vm` | string | VM de origen: `evm`, `cosmwasm`, `svm` |
| `--gas-limit` | uint   | Límite de gas para la ejecución cross-VM |

### process-queue

Procesa manualmente los mensajes cross-VM pendientes (comando de operador).

```bash
qorechaind tx crossvm process-queue [flags]
```

---

## svm

### deploy-program

Despliega un programa BPF en el runtime SVM.

```bash
qorechaind tx svm deploy-program <program_binary_path> [flags]
```

| Flag           | Tipo   | Descripción                  |
| -------------- | ------ | ---------------------------- |
| `--program-id` | string | ID de programa opcional (base58) |

### execute

Ejecuta una instrucción en un programa SVM desplegado.

```bash
qorechaind tx svm execute <program_id> <instruction_data_hex> [flags]
```

| Flag         | Tipo   | Descripción                                         |
| ------------ | ------ | --------------------------------------------------- |
| `--accounts` | string | Pubkeys de cuentas separadas por comas para la instrucción |

### create-account

Crea una nueva cuenta SVM con espacio de datos asignado.

```bash
qorechaind tx svm create-account <pubkey> <space> [flags]
```

| Flag      | Tipo   | Descripción                                     |
| --------- | ------ | ----------------------------------------------- |
| `--owner` | string | Programa propietario (base58, por defecto: programa del sistema) |

---

## multilayer

### register-sidechain

Registra una nueva capa sidechain.

```bash
qorechaind tx multilayer register-sidechain <layer-id> <description> [flags]
```

| Flag                    | Tipo   | Descripción                                          |
| ----------------------- | ------ | --------------------------------------------------- |
| `--block-time-ms`       | uint   | Tiempo de bloque objetivo en ms (por defecto 2000)  |
| `--domains`             | string | Dominios soportados separados por comas (por defecto `defi`) |
| `--max-tx`              | uint   | Máximo de transacciones por bloque (por defecto 1000) |
| `--min-validators`      | uint32 | Tamaño mínimo del conjunto de validadores (por defecto 1) |
| `--settlement-interval` | uint   | Intervalo de liquidación en bloques (por defecto 100) |
| `--vm-types`            | string | Tipos de VM soportados separados por comas (por defecto `evm`) |

### register-paychain

Registra una nueva capa paychain para microtransacciones de alta frecuencia.

```bash
qorechaind tx multilayer register-paychain <layer-id> <description> [flags]
```

| Flag                    | Tipo | Descripción                                  |
| ----------------------- | ---- | -------------------------------------------- |
| `--max-tx`              | uint | Máximo de transacciones por bloque (por defecto 5000) |
| `--settlement-interval` | uint | Intervalo de liquidación en bloques (por defecto 50) |

### anchor-state

Envía un anclaje de estado (liquidación) para una capa registrada.

```bash
qorechaind tx multilayer anchor-state <layer-id> <layer-height> <state-root-hex> <pqc-agg-sig-hex> [flags]
```

### route-tx

Enruta una transacción a la capa óptima.

```bash
qorechaind tx multilayer route-tx <tx_data_hex> [flags]
```

| Flag             | Tipo   | Descripción                       |
| ---------------- | ------ | --------------------------------- |
| `--target-layer` | string | Forzar el enrutamiento a una capa específica |

### update-layer-status

Actualiza el estado operativo de una capa (solo operador).

```bash
qorechaind tx multilayer update-layer-status <layer_id> <status> [flags]
```

Valores de estado: `active`, `paused`, `draining`.

### challenge-anchor

Envía una impugnación de fraude contra un anclaje de estado.

```bash
qorechaind tx multilayer challenge-anchor <layer_id> <anchor_hash> <proof_hex> [flags]
```

---

## rdk

### create-rollup

Registra un nuevo rollup con el Rollup Development Kit.

```bash
qorechaind tx rdk create-rollup <rollup_id> [flags]
```

| Flag                | Tipo   | Descripción                                          |
| ------------------- | ------ | ---------------------------------------------------- |
| `--settlement-type` | string | `optimistic`, `zk`, `pessimistic`, `sovereign`       |
| `--profile`         | string | Preset: `defi`, `gaming`, `nft`, `enterprise`, `custom` |
| `--stake`           | string | Monto del stake del operador                         |
| `--da-enabled`      | bool   | Habilitar la disponibilidad de datos nativa          |

### submit-batch

Envía un lote de liquidación para un rollup.

```bash
qorechaind tx rdk submit-batch <rollup_id> <state_root_hex> <batch_data_path> [flags]
```

### challenge-batch

Envía una impugnación de fraude contra un lote de liquidación (rollups optimistas).

```bash
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> <proof_hex> [flags]
```

### finalize-batch

Finaliza manualmente un lote que ha pasado la ventana de impugnación.

```bash
qorechaind tx rdk finalize-batch <rollup_id> <batch_index> [flags]
```

### pause-rollup

Pausa un rollup (solo operador).

```bash
qorechaind tx rdk pause-rollup <rollup_id> [flags]
```

### resume-rollup

Reanuda un rollup pausado (solo operador).

```bash
qorechaind tx rdk resume-rollup <rollup_id> [flags]
```

### stop-rollup

Detiene permanentemente un rollup y libera su stake (solo operador).

```bash
qorechaind tx rdk stop-rollup <rollup_id> [flags]
```

:::note
El retiro de rollups y la liquidación entre capas también se exponen bajo el grupo de transacciones `rdk` (por ejemplo, un comando `execute-withdrawal` que liquida un retiro probado contra un lote finalizado). Los argumentos y flags exactos dependen del tipo de liquidación de su rollup y de la configuración de DA; consulte la documentación de **Rollup Development Kit** para conocer la superficie de comandos autoritativa antes de construir estas transacciones.
:::

---

## babylon

### submit-btc-checkpoint

Envía un checkpoint de BTC para una época.

```bash
qorechaind tx babylon submit-btc-checkpoint <epoch> <checkpoint_hex> [flags]
```

### btc-restake

Hace restake de BTC vía la integración con Babylon.

```bash
qorechaind tx babylon btc-restake <amount> [flags]
```

| Flag            | Tipo   | Descripción                       |
| --------------- | ------ | --------------------------------- |
| `--btc-tx-hash` | string | Hash de transacción de Bitcoin como prueba |

---

## abstractaccount

### create

Crea una cuenta abstracta con reglas de gasto programables.

```bash
qorechaind tx abstractaccount create [flags]
```

| Flag               | Tipo   | Descripción                       |
| ------------------ | ------ | --------------------------------- |
| `--spending-rules` | string | Archivo JSON que define las reglas de gasto |

### update-spending-rules

Actualiza las reglas de gasto de una cuenta abstracta existente.

```bash
qorechaind tx abstractaccount update-spending-rules <rules_file.json> [flags]
```

---

## rlconsensus

PRISM es la capa de aprendizaje por refuerzo que ajusta los parámetros de consenso. Estos comandos controlan el agente PRISM; el nombre de módulo de la CLI `rlconsensus` y sus subcomandos se conservan textualmente.

### set-agent-mode

Establece el modo operativo del agente PRISM (solo gobernanza).

```bash
qorechaind tx rlconsensus set-agent-mode <mode> [flags]
```

Valores de modo: `0` (off), `1` (observe), `2` (suggest), `3` (auto).

### resume-agent

Reanuda el agente PRISM tras la activación de un circuit breaker.

```bash
qorechaind tx rlconsensus resume-agent [flags]
```

### update-policy

Actualiza la configuración de política del agente PRISM (solo gobernanza).

```bash
qorechaind tx rlconsensus update-policy <policy_file.json> [flags]
```

### update-reward-weights

Actualiza la configuración de pesos de recompensa para el agente PRISM.

```bash
qorechaind tx rlconsensus update-reward-weights [flags]
```

| Flag                  | Tipo   | Descripción                  |
| --------------------- | ------ | ---------------------------- |
| `--throughput-weight` | string | Peso para la recompensa de rendimiento |
| `--latency-weight`    | string | Peso para la recompensa de latencia |
| `--security-weight`   | string | Peso para la recompensa de seguridad |
