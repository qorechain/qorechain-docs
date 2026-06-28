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
Establezca `--chain-id qorechain-vladi` para difundir contra la mainnet en vivo (versión de cadena **v3.1.80**), o `--chain-id qorechain-diana` para la testnet. Si se omite, el cliente usa el `chain-id` de su configuración local.
:::

Las banderas comunes se aplican a cada subcomando `tx`:

| Bandera             | Tipo   | Descripción                                     |
| ------------------- | ------ | ----------------------------------------------- |
| `--from`            | string | Nombre o dirección de la clave de firma         |
| `--chain-id`        | string | Identificador de cadena (predeterminado: de la configuración) |
| `--fees`            | string | Comisiones de transacción (p. ej., `500uqor`)   |
| `--gas`             | string | Límite de gas o `auto` para estimación          |
| `--gas-adjustment`  | float  | Multiplicador de gas al usar `auto` (predeterminado: 1.0) |
| `--keyring-backend` | string | Backend del llavero: `os`, `file`, `test`       |
| `--node`            | string | Punto final RPC (predeterminado: `tcp://localhost:26657`) |
| `--broadcast-mode`  | string | `sync`, `async`, o `block`                       |
| `-y`                | bool   | Omitir el mensaje de confirmación               |

---

## bank

### send

Transferir tokens de una cuenta a otra.

```bash
qorechaind tx bank send <from_address> <to_address> <amount> [flags]
```

---

## staking

### create-validator

Crear un nuevo validador en la red.

```bash
qorechaind tx staking create-validator [flags]
```

| Bandera                        | Tipo   | Descripción                                  |
| ------------------------------ | ------ | -------------------------------------------- |
| `--amount`                     | string | Monto de autodelegación (p. ej., `1000000uqor`) |
| `--pubkey`                     | string | Clave pública de consenso del validador (JSON) |
| `--moniker`                    | string | Nombre visible del validador                 |
| `--commission-rate`            | string | Tasa de comisión inicial (p. ej., `0.10`)    |
| `--commission-max-rate`        | string | Tasa de comisión máxima                      |
| `--commission-max-change-rate` | string | Tasa máxima de cambio diario de comisión     |
| `--min-self-delegation`        | string | Autodelegación mínima requerida              |

### edit-validator

Editar la descripción o la comisión de un validador existente.

```bash
qorechaind tx staking edit-validator [flags]
```

### delegate

Delegar tokens a un validador.

```bash
qorechaind tx staking delegate <validator_address> <amount> [flags]
```

### redelegate

Mover la delegación de un validador a otro.

```bash
qorechaind tx staking redelegate <src_validator> <dst_validator> <amount> [flags]
```

### unbond

Desvincular tokens de un validador.

```bash
qorechaind tx staking unbond <validator_address> <amount> [flags]
```

---

## distribution

### withdraw-all-rewards

Retirar todas las recompensas de staking pendientes.

```bash
qorechaind tx distribution withdraw-all-rewards [flags]
```

### withdraw-rewards

Retirar recompensas de un validador específico.

```bash
qorechaind tx distribution withdraw-rewards <validator_address> [flags]
```

| Bandera        | Tipo | Descripción                        |
| -------------- | ---- | ---------------------------------- |
| `--commission` | bool | También retirar la comisión del validador |

---

## gov

### submit-proposal

Enviar una propuesta de gobernanza.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> [flags]
```

El archivo de propuesta es un documento JSON que especifica el tipo de propuesta, el título, la descripción y los mensajes que se ejecutarán.

### vote

Votar en una propuesta activa.

```bash
qorechaind tx gov vote <proposal_id> <option> [flags]
```

Opciones de voto: `yes`, `no`, `abstain`, `no_with_veto`.

### deposit

Añadir un depósito a una propuesta.

```bash
qorechaind tx gov deposit <proposal_id> <amount> [flags]
```

---

## pqc

La ruta de transacción de cosmos requiere una firma híbrida de forma predeterminada (`hybrid_signature_mode = required`). Los comandos `gen-key` y `cosign` producen la clave Dilithium-5 (ML-DSA-87) y la extensión `PQCHybridSignature` necesarias para transaccionar en la ruta de cosmos junto con la firma clásica secp256k1.

### gen-key

Generar una clave poscuántica Dilithium-5 (ML-DSA-87) para firma híbrida.

```bash
qorechaind tx pqc gen-key [flags]
```

### cosign

Adjuntar una cofirma Dilithium-5 a una transacción como una extensión `PQCHybridSignature`, produciendo una transacción híbrida (secp256k1 + ML-DSA-87). Requerido para transacciones de la ruta de cosmos bajo el modo de aplicación predeterminado `required`. Las herramientas estándar de CosmJS / relayer deben producir esta extensión para transaccionar; el `buildHybridTx` del SDK de QoreChain (con `includePqcPublicKey`) hace el equivalente.

```bash
qorechaind tx pqc cosign <unsigned_tx_file> [flags]
```

### register-key

Registrar una clave pública poscuántica para una cuenta.

```bash
qorechaind tx pqc register-key <algorithm> <pubkey_hex> [flags]
```

### register-key-v2

Registrar una clave PQC con metadatos extendidos y atestación.

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> [flags]
```

| Bandera         | Tipo   | Descripción                    |
| --------------- | ------ | ------------------------------ |
| `--attestation` | string | Datos de atestación TEE (hex)  |
| `--metadata`    | string | Metadatos adicionales de clave (JSON) |

### migrate-key

Migrar una clave clásica existente a un par de claves PQC híbrido.

```bash
qorechaind tx pqc migrate-key <algorithm> <pqc_pubkey_hex> [flags]
```

---

## xqore

### lock

Bloquear tokens QOR en una posición de staking de gobernanza xQORE.

```bash
qorechaind tx xqore lock <amount> [flags]
```

| Bandera           | Tipo   | Descripción                                |
| ----------------- | ------ | ------------------------------------------ |
| `--lock-duration` | string | Duración del bloqueo (p. ej., `30d`, `90d`, `180d`) |

### unlock

Desbloquear xQORE de vuelta a QOR. El desbloqueo anticipado puede incurrir en penalizaciones según el nivel de penalización.

```bash
qorechaind tx xqore unlock <amount> [flags]
```

---

## bridge

### deposit

Iniciar un depósito de bridge desde una cadena externa.

```bash
qorechaind tx bridge deposit <chain_id> <amount> <asset> [flags]
```

| Bandera       | Tipo   | Descripción                    |
| ------------- | ------ | ------------------------------ |
| `--recipient` | string | Dirección del destinatario en QoreChain |

### withdraw

Iniciar un retiro de bridge hacia una cadena externa.

```bash
qorechaind tx bridge withdraw <chain_id> <amount> <asset> <destination_address> [flags]
```

### update-chain-config

Activar o reconfigurar el bridge de una cadena en una única transacción firmada (disponible a partir de la versión de cadena **v3.1.80**). Requiere la clave `bridge_admin` o una licencia `qcb_bridge`: sin propuesta de gobernanza ni actualización de cadena. Establece la dirección del contrato, el recuento de confirmaciones, la arquitectura y el estado.

```bash
qorechaind tx bridge update-chain-config <chain_id> [flags] --from bridge-admin
```

### set-verifier-bootstrap

Seleccionar el verificador activo de una cadena e instalar su raíz de confianza (también restringido por `bridge_admin`).

```bash
qorechaind tx bridge set-verifier-bootstrap <chain_id> <verifier> [flags] --from bridge-admin
```

---

## crossvm

### call

Enviar un mensaje cross-VM entre entornos de ejecución (EVM, CosmWasm, SVM).

```bash
qorechaind tx crossvm call <target_vm> <contract_address> <payload_hex> [flags]
```

| Bandera       | Tipo   | Descripción                          |
| ------------- | ------ | ------------------------------------ |
| `--source-vm` | string | VM de origen: `evm`, `cosmwasm`, `svm` |
| `--gas-limit` | uint   | Límite de gas para la ejecución cross-VM |

### process-queue

Procesar manualmente los mensajes cross-VM pendientes (comando de operador).

```bash
qorechaind tx crossvm process-queue [flags]
```

---

## svm

### deploy-program

Desplegar un programa BPF en el entorno de ejecución SVM.

```bash
qorechaind tx svm deploy-program <program_binary_path> [flags]
```

| Bandera        | Tipo   | Descripción                  |
| -------------- | ------ | ---------------------------- |
| `--program-id` | string | ID de programa opcional (base58) |

### execute

Ejecutar una instrucción en un programa SVM desplegado.

```bash
qorechaind tx svm execute <program_id> <instruction_data_hex> [flags]
```

| Bandera      | Tipo   | Descripción                                         |
| ------------ | ------ | --------------------------------------------------- |
| `--accounts` | string | Claves públicas de cuentas separadas por comas para la instrucción |

### create-account

Crear una nueva cuenta SVM con espacio de datos asignado.

```bash
qorechaind tx svm create-account <pubkey> <space> [flags]
```

| Bandera   | Tipo   | Descripción                                     |
| --------- | ------ | ----------------------------------------------- |
| `--owner` | string | Programa propietario (base58, predeterminado: programa del sistema) |

---

## multilayer

### register-sidechain

Registrar una nueva capa sidechain.

```bash
qorechaind tx multilayer register-sidechain <layer-id> <description> [flags]
```

| Bandera                 | Tipo   | Descripción                                          |
| ----------------------- | ------ | --------------------------------------------------- |
| `--block-time-ms`       | uint   | Tiempo de bloque objetivo en ms (predeterminado 2000) |
| `--domains`             | string | Dominios admitidos separados por comas (predeterminado `defi`) |
| `--max-tx`              | uint   | Máx. transacciones por bloque (predeterminado 1000) |
| `--min-validators`      | uint32 | Tamaño mínimo del conjunto de validadores (predeterminado 1) |
| `--settlement-interval` | uint   | Intervalo de liquidación en bloques (predeterminado 100) |
| `--vm-types`            | string | Tipos de VM admitidos separados por comas (predeterminado `evm`) |

### register-paychain

Registrar una nueva capa paychain para microtransacciones de alta frecuencia.

```bash
qorechaind tx multilayer register-paychain <layer-id> <description> [flags]
```

| Bandera                 | Tipo | Descripción                                  |
| ----------------------- | ---- | -------------------------------------------- |
| `--max-tx`              | uint | Máx. transacciones por bloque (predeterminado 5000) |
| `--settlement-interval` | uint | Intervalo de liquidación en bloques (predeterminado 50) |

### anchor-state

Enviar un anclaje de estado (liquidación) para una capa registrada.

```bash
qorechaind tx multilayer anchor-state <layer-id> <layer-height> <state-root-hex> <pqc-agg-sig-hex> [flags]
```

### route-tx

Enrutar una transacción a la capa óptima.

```bash
qorechaind tx multilayer route-tx <tx_data_hex> [flags]
```

| Bandera          | Tipo   | Descripción                       |
| ---------------- | ------ | --------------------------------- |
| `--target-layer` | string | Forzar el enrutamiento a una capa específica |

### update-layer-status

Actualizar el estado operativo de una capa (solo operador).

```bash
qorechaind tx multilayer update-layer-status <layer_id> <status> [flags]
```

Valores de estado: `active`, `paused`, `draining`.

### challenge-anchor

Enviar una impugnación de fraude contra un anclaje de estado.

```bash
qorechaind tx multilayer challenge-anchor <layer_id> <anchor_hash> <proof_hex> [flags]
```

---

## rdk

### create-rollup

Registrar un nuevo rollup con el Rollup Development Kit.

```bash
qorechaind tx rdk create-rollup <rollup_id> [flags]
```

| Bandera             | Tipo   | Descripción                                          |
| ------------------- | ------ | ---------------------------------------------------- |
| `--settlement-type` | string | `optimistic`, `zk`, `pessimistic`, `sovereign`       |
| `--profile`         | string | Preconfiguración: `defi`, `gaming`, `nft`, `enterprise`, `custom` |
| `--stake`           | string | Monto de stake del operador                          |
| `--da-enabled`      | bool   | Habilitar disponibilidad de datos nativa             |

### submit-batch

Enviar un lote de liquidación para un rollup.

```bash
qorechaind tx rdk submit-batch <rollup_id> <state_root_hex> <batch_data_path> [flags]
```

### challenge-batch

Enviar una impugnación de fraude contra un lote de liquidación (rollups optimistas).

```bash
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> <proof_hex> [flags]
```

### finalize-batch

Finalizar manualmente un lote que ha superado la ventana de impugnación.

```bash
qorechaind tx rdk finalize-batch <rollup_id> <batch_index> [flags]
```

### pause-rollup

Pausar un rollup (solo operador).

```bash
qorechaind tx rdk pause-rollup <rollup_id> [flags]
```

### resume-rollup

Reanudar un rollup pausado (solo operador).

```bash
qorechaind tx rdk resume-rollup <rollup_id> [flags]
```

### stop-rollup

Detener permanentemente un rollup y liberar su stake (solo operador).

```bash
qorechaind tx rdk stop-rollup <rollup_id> [flags]
```

:::note
El retiro de rollup y la liquidación entre capas también se exponen bajo el grupo de transacciones `rdk` (por ejemplo, un comando `execute-withdrawal` que liquida un retiro probado contra un lote finalizado). Los argumentos y banderas exactos dependen del tipo de liquidación y la configuración de DA de su rollup; consulte la documentación de **Rollup Development Kit** para conocer la superficie de comandos autoritativa antes de construir estas transacciones.
:::

---

## babylon

### submit-btc-checkpoint

Enviar un checkpoint de BTC para una época.

```bash
qorechaind tx babylon submit-btc-checkpoint <epoch> <checkpoint_hex> [flags]
```

### btc-restake

Volver a hacer staking de BTC mediante la integración con Babylon.

```bash
qorechaind tx babylon btc-restake <amount> [flags]
```

| Bandera         | Tipo   | Descripción                       |
| --------------- | ------ | --------------------------------- |
| `--btc-tx-hash` | string | Hash de transacción de Bitcoin como prueba |

---

## abstractaccount

### create

Crear una cuenta abstracta con reglas de gasto programables.

```bash
qorechaind tx abstractaccount create [flags]
```

| Bandera            | Tipo   | Descripción                       |
| ------------------ | ------ | --------------------------------- |
| `--spending-rules` | string | Archivo JSON que define las reglas de gasto |

### update-spending-rules

Actualizar las reglas de gasto de una cuenta abstracta existente.

```bash
qorechaind tx abstractaccount update-spending-rules <rules_file.json> [flags]
```

---

## rlconsensus

PRISM es la capa de aprendizaje por refuerzo que ajusta los parámetros de consenso. Estos comandos controlan el agente PRISM; el nombre del módulo de la CLI `rlconsensus` y sus subcomandos se conservan textualmente.

### set-agent-mode

Establecer el modo operativo del agente PRISM (solo gobernanza).

```bash
qorechaind tx rlconsensus set-agent-mode <mode> [flags]
```

Valores de modo: `0` (off), `1` (observe), `2` (suggest), `3` (auto).

### resume-agent

Reanudar el agente PRISM después de un disparo del interruptor de circuito.

```bash
qorechaind tx rlconsensus resume-agent [flags]
```

### update-policy

Actualizar la configuración de política del agente PRISM (solo gobernanza).

```bash
qorechaind tx rlconsensus update-policy <policy_file.json> [flags]
```

### update-reward-weights

Actualizar la configuración de pesos de recompensa para el agente PRISM.

```bash
qorechaind tx rlconsensus update-reward-weights [flags]
```

| Bandera               | Tipo   | Descripción                  |
| --------------------- | ------ | ---------------------------- |
| `--throughput-weight` | string | Peso para la recompensa de rendimiento |
| `--latency-weight`    | string | Peso para la recompensa de latencia |
| `--security-weight`   | string | Peso para la recompensa de seguridad |
