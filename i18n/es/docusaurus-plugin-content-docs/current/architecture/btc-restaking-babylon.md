---
slug: /architecture/btc-restaking-babylon
title: Restaking de BTC (Babylon)
sidebar_label: Restaking de BTC (Babylon)
sidebar_position: 11
---

# Restaking de BTC (Babylon)

El módulo `x/babylon` integra QoreChain con el protocolo Babylon para heredar las garantías de finalidad de prueba de trabajo de Bitcoin. A través del restaking de BTC, QoreChain obtiene una capa de finalidad secundaria respaldada por el hashrate de Bitcoin, sin requerir ningún cambio en el propio protocolo de Bitcoin.

## Visión general

El protocolo Babylon permite a las cadenas de prueba de participación aprovechar la seguridad de Bitcoin mediante un mecanismo de marcado de tiempo y de checkpoints. La integración de QoreChain funciona de la siguiente manera:

1. Los **stakers de BTC** bloquean Bitcoin en transacciones de staking de Babylon y registran sus posiciones en QoreChain.
2. Los **checkpoints de época** de QoreChain se retransmiten periódicamente a Babylon, que les pone marca de tiempo en Bitcoin.
3. **Herencia de finalidad**: Una vez que una época de QoreChain tiene un checkpoint en Bitcoin, el estado cubierto por esa época hereda las garantías de finalidad de prueba de trabajo de Bitcoin.

Esto proporciona una defensa contra los ataques de largo alcance y la equivocación que está anclada al hashrate acumulado de Bitcoin en lugar de depender únicamente del propio conjunto de validadores de QoreChain.

## Posiciones de staking de BTC

Los usuarios pueden registrar posiciones de staking de BTC en QoreChain enviando una transacción `MsgBTCRestake` que hace referencia a una transacción de staking de Bitcoin.

### Requisitos de registro

| Parámetro               | Valor                        | Descripción                                       |
| ----------------------- | ---------------------------- | ------------------------------------------------- |
| **Stake mínimo**       | 100.000 satoshis (0.001 BTC) | BTC mínimo requerido por posición de staking         |
| **Periodo de desvinculación**    | 144 bloques de BTC (\~1 día)     | Periodo de espera antes de que el BTC en staking pueda retirarse |
| **Intervalo de checkpoint** | Cada 10 épocas de QoreChain    | Con qué frecuencia se hace checkpoint del estado en Babylon        |

### Estructura de una posición de staking

Cada posición de staking de BTC rastrea el siguiente estado on-chain:

| Campo              | Descripción                                                     |
| ------------------ | --------------------------------------------------------------- |
| `staker_address`   | Dirección de QoreChain del staker (`qor1...`)                     |
| `btc_tx_hash`      | Hash de la transacción de Bitcoin de la transacción de staking             |
| `amount_satoshis`  | Cantidad de BTC en staking, en satoshis                                |
| `status`           | Estado del ciclo de vida de la posición: `active`, `unbonding` o `withdrawn` |
| `staked_at`        | Marca de tiempo del registro de la posición                                |
| `unbonding_height` | Altura de bloque en la que se inició la desvinculación (si procede)   |
| `validator_addr`   | Dirección del validador de QoreChain al que se delega este stake          |

### Flujo de registro

1. **Crear la transacción de staking de BTC** — En la red de Bitcoin, crea la transacción de staking de BTC.
2. **Enviar MsgBTCRestake en QoreChain** — En QoreChain, envía `MsgBTCRestake` con `btc_tx_hash`, `amount` y `validator`.
3. **Posición registrada** — La posición se registra on-chain como "active".

## Checkpoints de época

Las raíces de estado de las épocas de QoreChain se marcan periódicamente con checkpoints en Bitcoin a través de la cadena de relé Babylon.

### Flujo de checkpoints

1. **Enviar checkpoint** — Un validador de QoreChain envía `MsgSubmitBTCCheckpoint` que contiene el número de época, el hash del bloque de BTC, la altura del bloque de BTC y la raíz de estado de QoreChain.
2. **Relé IBC** — Los datos del checkpoint se retransmiten a la cadena Babylon a través de IBC.
3. **Marcado de tiempo en Bitcoin** — Babylon incluye el checkpoint en una transacción de Bitcoin, anclando el estado de QoreChain a la blockchain de Bitcoin.
4. **Confirmación** — Una vez confirmada la transacción de Bitcoin, la finalidad fluye de vuelta a través de Babylon hacia QoreChain.
5. **Finalización** — El estado del checkpoint pasa de `pending` a `confirmed` y a `finalized`.

### Estructura de un checkpoint

| Campo              | Descripción                                              |
| ------------------ | -------------------------------------------------------- |
| `epoch_num`        | Número de época de QoreChain del que se hace checkpoint                |
| `btc_block_hash`   | Hash del bloque de Bitcoin que contiene el checkpoint             |
| `btc_block_height` | Altura del bloque de Bitcoin                                     |
| `state_root`       | Raíz de estado de QoreChain en el límite de la época               |
| `submitted_at`     | Marca de tiempo del envío del checkpoint                       |
| `status`           | Estado del checkpoint: `pending`, `confirmed` o `finalized` |

### Instantáneas de época

En cada límite de checkpoint, una instantánea de época captura el estado agregado de la red:

| Campo              | Descripción                                      |
| ------------------ | ------------------------------------------------ |
| `total_staked`     | Total de BTC en staking en todas las posiciones (satoshis) |
| `active_positions` | Número de posiciones de staking activas               |
| `validator_count`  | Número de validadores con delegaciones respaldadas por BTC |
| `block_height`     | Altura de bloque de QoreChain en la instantánea               |

## Capa de finalidad secundaria

La integración de Babylon proporciona una **garantía de finalidad secundaria** que complementa la finalidad de consenso nativa de QoreChain:

| Capa de finalidad | Fuente                     | Velocidad        | Seguridad                                |
| -------------- | -------------------------- | ------------ | --------------------------------------- |
| **Primaria**    | Motor de consenso de QoreChain | \~5 segundos  | Respaldada por stake de QOR + firmas PQC    |
| **Secundaria**  | Babylon + Bitcoin          | \~60 minutos | Respaldada por el hashrate acumulado de Bitcoin |

La capa secundaria es especialmente valiosa para:

* **Prevención de ataques de largo alcance**: Incluso si un atacante acumula un stake significativo de QOR, no puede reescribir el historial que tiene un checkpoint en Bitcoin.
* **Seguridad del puente entre cadenas**: Las operaciones del puente que involucran grandes valores pueden esperar la finalidad a nivel de Bitcoin antes de liberar los fondos.
* **Confianza institucional**: La marca de tiempo de Bitcoin proporciona una prueba verificable de forma independiente del historial de estado de QoreChain.

## Configuración

| Parámetro             | Predeterminado          | Descripción                               |
| --------------------- | ---------------- | ----------------------------------------- |
| `enabled`             | `false`          | Interruptor maestro para las funciones de restaking de BTC  |
| `min_stake_amount`    | 100.000 satoshis | BTC mínimo por posición de staking          |
| `unbonding_period`    | 144 bloques de BTC   | Duración de la desvinculación denominada en BTC        |
| `checkpoint_interval` | 10 épocas        | Épocas entre checkpoints de Babylon        |
| `babylon_chain_id`    | `bbn-1`          | Chain ID de la red Babylon conectada |

## Eventos

El módulo emite los siguientes eventos on-chain:

| Tipo de evento               | Atributos                               | Descripción                                    |
| ------------------------ | ---------------------------------------- | ---------------------------------------------- |
| `btc_restake`            | staker, btc\_tx\_hash, amount, validator | Nueva posición de staking de BTC registrada            |
| `btc_unbond`             | staker, amount                           | Posición de staking de BTC entró en desvinculación         |
| `btc_checkpoint`         | epoch, checkpoint\_id                    | Checkpoint de época enviado a Babylon          |
| `babylon_epoch_complete` | epoch                                    | Época de Babylon finalizada con marca de tiempo de Bitcoin |

## Endpoints de la API

### REST

| Método | Endpoint                         | Descripción                              |
| ------ | -------------------------------- | ---------------------------------------- |
| GET    | `/babylon/v1/staking/{address}`  | Obtener las posiciones de staking de BTC de una dirección |
| GET    | `/babylon/v1/checkpoint/{epoch}` | Obtener los datos del checkpoint de una época específica |
| GET    | `/babylon/v1/params`             | Obtener los parámetros de configuración del módulo      |

### JSON-RPC

| Método                      | Parámetros         | Descripción                                                      |
| --------------------------- | ------------------ | ---------------------------------------------------------------- |
| `qor_getBTCStakingPosition` | `address` (string) | Devuelve la posición de staking de BTC para la dirección de QoreChain dada |

## Comandos de la CLI

### Comandos de consulta

```bash
# Query BTC restaking configuration
qorechaind query babylon config

# Query a staking position by address
qorechaind query babylon position <staker-address>
```

### Comandos de transacción

```bash
# Register a BTC restaking position
qorechaind tx babylon restake \
  --btc-tx-hash <hash> \
  --amount-satoshis <amount> \
  --validator <qorvaloper1...> \
  --from <key-name>

# Submit a BTC checkpoint
qorechaind tx babylon submit-checkpoint \
  --epoch <epoch-number> \
  --btc-block-hash <hash> \
  --btc-block-height <height> \
  --state-root <root> \
  --from <key-name>
```
