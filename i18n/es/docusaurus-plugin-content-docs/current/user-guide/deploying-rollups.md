---
slug: /user-guide/deploying-rollups
title: Despliegue de rollups
sidebar_label: Despliegue de rollups
sidebar_position: 6
---

# Despliegue de rollups

Esta guía explica cómo desplegar rollups específicos de aplicación en QoreChain usando el Rollup Development Kit (RDK). El RDK proporciona perfiles preestablecidos para casos de uso comunes y personalización completa para despliegues avanzados.

:::caution
El RDK y la capa de liquidación de rollups son una capacidad en activa evolución. Considera los parámetros, los preajustes y la madurez de las funciones individuales que aparecen a continuación como sujetos a cambios, y valida los despliegues en **`qorechain-diana`** antes de apuntar a mainnet.
:::

:::note
Los comandos a continuación usan la testnet **`qorechain-diana`** (EVM chain ID **9800**). La mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) está activa desde el 7 de junio de 2026 ejecutando la versión de cadena **v3.1.77** — sustituye el chain ID y los endpoints de mainnet de la página **Conexión a Mainnet** al desplegar en mainnet.
:::

---

## Resumen

El RDK de QoreChain permite a los desarrolladores lanzar rollups soberanos que se liquidan en QoreChain. Cada rollup es un entorno de ejecución independiente con su propio tiempo de bloque, máquina virtual y modelo de comisiones, a la vez que hereda las garantías de seguridad y disponibilidad de datos de QoreChain.

---

## Perfiles preestablecidos

El RDK incluye cinco perfiles preestablecidos, cada uno ajustado para una categoría de aplicación común:

| Perfil         | Liquidación (prueba)  | Secuenciador | DA              | Modelo de gas | VM       | Caso de uso previsto |
| -------------- | ------------------- | --------- | --------------- | ------------ | -------- | ----------------- |
| **defi**       | zk (SNARK)          | dedicado | nativo          | EIP-1559     | EVM      | Aplicaciones DeFi/AMM (préstamos, DEX, derivados) |
| **gaming**     | based               | based     | nativo          | plano        | custom   | Estado de juego de alto rendimiento y experiencias en tiempo real |
| **nft**        | optimista (fraude)  | dedicado | nativo (DA de Celestia planeado) | estándar | CosmWasm | Acuñación de NFT y cargas de trabajo de marketplace |
| **enterprise** | based               | based     | nativo          | subvencionado | EVM      | Despliegues permisionados y de consorcio con comisiones patrocinadas |
| **custom**     | totalmente parametrizado | totalmente parametrizado | totalmente parametrizado | totalmente parametrizado | totalmente parametrizado | Configura cada campo tú mismo |

:::note
Los valores por preajuste anteriores coinciden con los valores predeterminados de perfil incluidos en `@qorechain/rdk`. La configuración exacta puede evolucionar a medida que el RDK madura — consulta los valores autorizados con `qorechaind query rdk config` (o `RdkClient.params()`), y ten en cuenta que la liquidación `based` siempre se empareja con el modo de secuenciador `based`.
:::

---

## Requisitos

Antes de desplegar un rollup, asegúrate de cumplir los siguientes requisitos:

| Requisito         | Detalles                                                                                |
| ----------------- | -------------------------------------------------------------------------------------- |
| **Stake mínimo** | 10,000 QOR (10,000,000,000 uqor)                                                       |
| **Quema de creación** | El 1 % del importe en stake se quema permanentemente al crear el rollup            |
| **Cuenta**       | Una cuenta de QoreChain financiada con saldo suficiente para el stake más las comisiones de transacción |

---

## Creación de un rollup a partir de un preajuste

Despliega un rollup usando uno de los perfiles preestablecidos:

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "my-defi-rollup" \
  --profile defi \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Ejemplo:** Despliega un rollup de gaming:

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "battle-arena" \
  --profile gaming \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Creación de un rollup personalizado

Para tener control total sobre los parámetros del rollup, usa el perfil `custom` y especifica cada opción:

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "my-rollup" \
  --profile custom \
  --settlement optimistic \
  --sequencer dedicated \
  --da-backend native \
  --vm-type evm \
  --block-time 1000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Parámetros personalizados:**

| Parámetro      | Opciones                                       | Descripción                        |
| -------------- | --------------------------------------------- | ---------------------------------- |
| `--settlement` | `optimistic`, `zk`, `based`, `sovereign`      | Cómo se verifican las transiciones de estado |
| `--sequencer`  | `dedicated`, `shared`, `based`                | Estrategia de ordenación de transacciones |
| `--da-backend` | `native`, `external`                          | Capa de disponibilidad de datos    |
| `--vm-type`    | `evm`, `cosmwasm`, `custom`                   | Entorno de ejecución               |
| `--block-time` | Entero (milisegundos)                         | Intervalo objetivo de producción de bloques |

---

## Envío de lotes

Los operadores de rollups envían lotes de transacciones a QoreChain para su liquidación:

```bash
qorechaind tx rdk submit-batch \
  --rollup-id "my-rollup" \
  --state-root <hex_encoded_state_root> \
  --tx-count 500 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Ejemplo:**

```bash
qorechaind tx rdk submit-batch \
  --rollup-id "my-rollup" \
  --state-root a1b2c3d4e5f6... \
  --tx-count 500 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Gestión del ciclo de vida del rollup

Los operadores de rollups pueden gestionar el ciclo de vida de sus despliegues:

1. **Pausar un rollup** — Detén temporalmente la producción de bloques. El estado del rollup se conserva y puede reanudarse.

   ```bash
   qorechaind tx rdk pause-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

2. **Reanudar un rollup** — Reanuda la producción de bloques en un rollup pausado:

   ```bash
   qorechaind tx rdk resume-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

3. **Detener un rollup (permanente)** — Detén un rollup de forma permanente. Esta acción es **irreversible**.

   ```bash
   qorechaind tx rdk stop-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

:::danger
Detener un rollup es permanente. Todo el estado asociado se archiva, pero el rollup no puede reiniciarse. El QOR en stake (menos la quema de creación) se devuelve al operador.
:::

---

## Consulta de rollups

Obtén detalles sobre un rollup específico:

```bash
qorechaind query rdk rollup <rollup_id>
```

Lista todos los rollups en QoreChain:

```bash
qorechaind query rdk rollups
```

**Salida de ejemplo:**

```yaml
rollup:
  id: "my-defi-rollup"
  owner: qor1abc...xyz
  profile: defi
  settlement: zk
  vm_type: evm
  block_time: 500ms
  status: active
  total_batches: 1247
  last_state_root: "a1b2c3d4..."
```

---

## Sugerencia de perfil asistida por QCAI

¿No estás seguro de qué perfil se adapta a tu caso de uso? Usa la herramienta de sugerencia asistida por QCAI:

```bash
qorechaind query rdk suggest-profile --use-case "defi lending protocol"
```

**Salida de ejemplo:**

```yaml
suggested_profile: defi
confidence: 0.94
reasoning: "DeFi lending protocols benefit from ZK settlement for fast finality, EVM compatibility for Solidity smart contracts, and EIP-1559 fee model for predictable gas costs."
alternative_profile: enterprise
```

Este comando analiza tu descripción y recomienda el perfil preestablecido más adecuado junto con una explicación.

---

## Consejos

* Empieza con un perfil preestablecido y personalízalo más tarde. Los preajustes están optimizados para sus casos de uso objetivo.
* La quema de creación del 1 % es un costo único aplicado al stake mínimo en el momento del despliegue.
* Usa la liquidación `based` si quieres la configuración más sencilla, con los validadores de QoreChain encargándose de la secuenciación.
* Supervisa de cerca los envíos de lotes. Las lagunas en el envío de lotes pueden activar alertas de la red.
* El comando `suggest-profile` es un punto de partida útil, pero revisa la recomendación frente a tus requisitos específicos.
