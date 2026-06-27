---
slug: /architecture/amm
title: AMM y liquidez on-chain
sidebar_label: AMM y liquidez on-chain
sidebar_position: 8
---

# AMM y liquidez on-chain

El módulo `x/amm` es el creador de mercado automatizado (AMM) nativo y on-chain de QoreChain. Permite a cualquiera crear pools de liquidez, aportar liquidez e intercambiar activos nativos de QoreChain directamente a nivel de protocolo, sin necesidad de un libro de órdenes off-chain ni de un DEX de contrato inteligente externo. Es la capa de liquidación on-chain detrás de la experiencia **Trade / DEX del Dashboard**.

Los pools siguen curvas de fijación de precios de AMM conocidas:

- **`constant_product`** — la curva `x*y=k` (pares de propósito general).
- **`stable_swap`** — una curva de bajo deslizamiento para pares estrechamente vinculados, ajustada por un coeficiente de amplificación.

Todos los montos utilizan las unidades nativas de QoreChain. El token de staking y de comisiones es **QOR**, cuyo denom base es **uqor** (1 QOR = 10^6 uqor). Los participantes de los pools y las direcciones utilizan el prefijo bech32 `qor`.

:::note
Los comandos a continuación utilizan `qorechaind`. Añade los indicadores de transacción habituales (`--from`, `--chain-id`, `--gas`, `--fees`, `--node`) según tu entorno; por ejemplo `--chain-id qorechain-vladi` contra mainnet.
:::

## Pools y participaciones LP

Un pool mantiene reservas de dos denoms (`token_a`, `token_b`, almacenados en orden ordenado) y acuña **tokens LP** que representan un derecho proporcional sobre esas reservas. Cada pool tiene un `id` numérico, un `type`, un `status` (`active` o `paused`) y su propio denom LP. Cuando aportas liquidez recibes tokens LP; cuando retiras liquidez los quemas para canjear tu parte de las reservas.

### Crear un pool

`create-pool` toma un tipo de pool y los dos depósitos iniciales (como monedas). Para un par estable, establece el coeficiente de amplificación con `--amp`.

```bash
# Constant-product pool seeded with QOR and a bridged USD asset
qorechaind tx amm create-pool constant_product 1000000000uqor 1000000000uusdc \
  --from qor1youraddr... --chain-id qorechain-vladi

# Stable-swap pool with an amplification coefficient
qorechaind tx amm create-pool stable_swap 1000000000uusdc 1000000000uusdt \
  --amp 200 --from qor1youraddr... --chain-id qorechain-vladi
```

### Aportar liquidez

`add-liquidity` deposita ambos lados en un pool y acuña tokens LP. El argumento final es el monto mínimo de LP que aceptarás: tu protección frente a que la proporción del pool cambie antes de que se confirme tu transacción.

```bash
qorechaind tx amm add-liquidity 1 500000000uqor 500000000uusdc 100000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

### Retirar liquidez

`remove-liquidity` quema tokens LP y retira reservas. Los dos argumentos `min` establecen el monto mínimo de cada lado que aceptarás recibir de vuelta.

```bash
qorechaind tx amm remove-liquidity 1 100000 490000000 490000000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

## Swaps

El AMM admite las dos direcciones de swap estándar.

### Exact-in

`swap-exact-in` gasta un monto de entrada fijo y devuelve la cantidad de salida que produzca la curva, sujeto a un mínimo de salida (protección contra deslizamiento).

```bash
# Spend exactly 1,000,000 uqor for uusdc, refusing anything below 990,000 uusdc out
qorechaind tx amm swap-exact-in 1 1000000uqor uusdc 990000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

### Exact-out

`swap-exact-out` solicita un monto de salida fijo y gasta la cantidad de entrada necesaria, sujeto a un máximo de entrada.

```bash
# Receive exactly 1,000,000 uusdc, spending at most 1,010,000 uqor
qorechaind tx amm swap-exact-out 1 uqor 1000000uusdc 1010000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

El argumento final `min-out` / `max-in` de cada swap es la protección contra deslizamiento: configúralo a partir de una cotización reciente (más abajo) más tu tolerancia, y la transacción se revierte si el precio ejecutado lo incumpliría.

## Cotizaciones (vista previa de precios)

Las cotizaciones son de solo lectura: previsualizan un swap sin enviarlo, de modo que un cliente puede mostrar una salida y una comisión esperadas antes de que el usuario firme. Son el respaldo natural del campo de precio de una interfaz de Trade.

```bash
# Preview the output of spending 1,000,000 uqor into pool 1
qorechaind query amm quote-exact-in 1 uqor 1000000
# -> returns amount_out and fee

# Preview the input needed to receive 1,000,000 uusdc from pool 1
qorechaind query amm quote-exact-out 1 uusdc 1000000
# -> returns amount_in and fee
```

La `fee` devuelta es la comisión de swap que el AMM aplica a la operación. Los niveles de comisión y deslizamiento dependen del pool y de los parámetros; utiliza los endpoints de cotización para ver su efecto concreto en cualquier operación dada en lugar de calcularlos a mano.

## Inspeccionar pools y saldos

Todas estas son consultas de solo lectura que cualquiera puede ejecutar.

```bash
# Module parameters
qorechaind query amm params

# A single pool by ID
qorechaind query amm pool 1

# Every pool
qorechaind query amm pools

# Resolve a pool from its denom pair (order-independent)
qorechaind query amm pool-by-denoms uqor uusdc

# An account's LP balance in a pool
qorechaind query amm lp-balance 1 qor1youraddr...
```

`pool` devuelve las reservas del pool, el suministro de LP, el tipo, el estado y un precio promedio ponderado continuo. `lp-balance` devuelve el `balance` de tokens LP que una cuenta posee en ese pool.

## Pausar y reanudar un pool

Los pools pueden ser pausados y reanudados por la autoridad del pool (la dirección pasada mediante `--from`). Un pool pausado rechaza los swaps y los cambios de liquidez hasta que se reanude, lo que resulta útil para la respuesta a incidentes o el mantenimiento coordinado.

```bash
# Pause pool 1 with a human-readable reason
qorechaind tx amm pause-pool 1 "scheduled maintenance" \
  --from qor1authority... --chain-id qorechain-vladi

# Resume pool 1
qorechaind tx amm resume-pool 1 \
  --from qor1authority... --chain-id qorechain-vladi
```

## Resumen de comandos

**Transacciones** (`qorechaind tx amm …`):

| Comando | Propósito |
| --- | --- |
| `create-pool` | Crear un pool `constant_product` o `stable_swap` |
| `add-liquidity` | Depositar reservas y acuñar tokens LP |
| `remove-liquidity` | Quemar tokens LP y retirar reservas |
| `swap-exact-in` | Intercambiar un monto de entrada fijo |
| `swap-exact-out` | Intercambiar hasta un monto de salida fijo |
| `pause-pool` | Pausar un pool (autoridad) |
| `resume-pool` | Reanudar un pool pausado (autoridad) |

**Consultas** (`qorechaind query amm …`):

| Comando | Propósito |
| --- | --- |
| `params` | Mostrar los parámetros del módulo |
| `pool` | Mostrar un pool por ID |
| `pools` | Listar todos los pools |
| `pool-by-denoms` | Resolver un pool a partir de su par de denoms |
| `lp-balance` | El saldo LP de una cuenta en un pool |
| `quote-exact-in` | Previsualizar la salida de un swap de entrada fija |
| `quote-exact-out` | Previsualizar la entrada de un swap de salida fija |

## Relacionado

- **Trade / DEX del Dashboard** expone estos pools, cotizaciones y swaps en una interfaz gráfica para usuarios cotidianos.
- Para saber cómo el suministro de QOR, las comisiones y el valor fluyen a través de la cadena, consulta [Tokenómica](/architecture/tokenomics).
- Prueba los swaps tú mismo en la interfaz [Trade / DEX](/dashboard/trade).
- Para llevar primero activos a QoreChain, consulta [Puentear activos](/user-guide/bridging-assets).
