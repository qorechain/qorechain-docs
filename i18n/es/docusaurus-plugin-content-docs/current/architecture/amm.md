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
Los comandos a continuación utilizan `qorechaind`. Añade los indicadores de transacción habituales (`--from`, `--chain-id`, `--gas`, `--fees`, `--node`) según tu entorno; por ejemplo `--chain-id qorechain-vladi --gas 400000 --fees 40000uqor` contra mainnet (el mínimo de comisión de la red es 0,1 uqor por unidad de gas). Cada comando `tx amm` es una transacción de la vía Cosmos, por lo que necesita la firma híbrida poscuántica: añade `--generate-only > tx.json` y luego ejecuta `qorechaind tx pqc cosign tx.json --from <key> --pqc-key <name> --chain-id <id>` (consulta [Primera transacción](/getting-started/first-transaction#send-qor)).
:::

:::caution Todavía no existen pools
El módulo AMM está activo en mainnet y en la testnet (ambas en v3.2.4), pero **todavía no se ha creado ningún pool** (comprobado el 23 de octubre de 2026: `GET /qorechain/amm/v1/pools` devuelve una lista vacía en ambas), y los denoms de los ejemplos siguientes (`uusdc`, `uusdt`) son ilustrativos: hoy no existen tales activos en las redes. Mientras no exista un pool, todo comando de swap o de aportar liquidez falla con un error de pool no encontrado.
:::

## Parámetros del módulo {#parameters}

Lee los valores actuales con `qorechaind query amm params` o `GET /qorechain/amm/v1/params`. Mainnet y testnet informan actualmente los mismos valores:

| Parámetro | Valor | Significado |
| --- | --- | --- |
| `enabled` | `true` | Interruptor del módulo |
| `swap_fee_bps` | `30` | Comisión de swap, 0,30 % del monto de entrada |
| `protocol_fee_bps` | `10` | La parte de la comisión de swap que sale del pool como parte del protocolo (0,10 % de la entrada). El resto se queda en el pool para los proveedores de liquidez |
| `pool_creation_fee` | `100000000` | 100 QOR (en uqor), cobrados además de los depósitos iniciales y quemados cuando se crea un pool |
| `min_liquidity` | `1000` | El menor de los dos depósitos iniciales de un pool nuevo debe ser al menos esta cantidad de unidades base |
| `max_pools_per_creator` | `50` | Pools que una cuenta puede crear |
| `max_swap_impact_bps` | `500` | Mayor impacto en el precio que puede tener un swap (5 %); consulta [Reglas de swap](#swap-rules) |
| `lp_token_decimals` | `6` | Decimales del token LP de un pool |

## Reglas de swap aplicadas desde v3.2.2 {#swap-rules}

Las correcciones de integridad del AMM siguientes se aplicaron a mainnet con v3.2.2 (altura 3,556,788, 16 de octubre de 2026) y se refinaron en v3.2.3 (altura 3,662,051, 20 de octubre de 2026). Se aplican a todo swap, sea cual sea la vía por la que llegue.

* **Ambos denoms están vinculados al pool.** Un swap debe nombrar los dos denoms del pool al que apunta. Los pools stable-swap se valoran con la curva stable-swap en ambas direcciones (exact-in y exact-out).
* **Comisión del protocolo.** La parte del protocolo de la comisión de swap sale del pool. Cuando se paga en QOR va al recolector de comisiones y se reparte con las demás comisiones del bloque (consulta [Tokenómica](/architecture/tokenomics)), registrando la parte quemada bajo la fuente de quema `amm`; en cualquier otra denominación va al pool comunitario. La comisión de creación de pool se quema y se registra bajo la misma fuente `amm`.
* **Tope de impacto en el precio.** `max_swap_impact_bps` se aplica: se rechaza un swap cuyo impacto en el precio respecto al precio del pool supere el 5 %. Un swap que no establece ningún límite de deslizamiento (un `min-out` de 0 en exact-in, o un `max-in` que cubre toda la reserva de entrada en exact-out) se mide además contra el precio del pool al inicio del bloque y se rechaza si operaciones anteriores del mismo bloque lo movieron más allá del tope. Establece un `min-out` / `max-in` real en cada swap.
* **Trabajo acotado al final del bloque (v3.2.3).** Al final de cada bloque el módulo actualiza el precio promedio ponderado continuo de como máximo 100 pools, de forma rotativa. Mientras haya 100 pools o menos, cada pool se actualiza en cada bloque; por encima de eso, el promedio de un pool se actualiza una vez por ronda de `ceil(pools / 100)` bloques. El promedio es informativo (lo devuelven las consultas `pool`) y no cambia la fijación de precios de los swaps.

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

Los pools pueden ser pausados y reanudados por la autoridad de gobernanza. En mainnet, estos dos mensajes están actualmente desactivados por el cortacircuitos; en la testnet no están desactivados. Un pool pausado rechaza los swaps y los cambios de liquidez hasta que se reanude, lo que resulta útil para la respuesta a incidentes o el mantenimiento coordinado.


## Resumen de comandos

**Transacciones** (`qorechaind tx amm …`):

| Comando | Propósito |
| --- | --- |
| `create-pool` | Crear un pool `constant_product` o `stable_swap` |
| `add-liquidity` | Depositar reservas y acuñar tokens LP |
| `remove-liquidity` | Quemar tokens LP y retirar reservas |
| `swap-exact-in` | Intercambiar un monto de entrada fijo |
| `swap-exact-out` | Intercambiar hasta un monto de salida fijo |
| `pause-pool` | Pausar un pool (autoridad de gobernanza; desactivado en mainnet) |
| `resume-pool` | Reanudar un pool pausado (autoridad de gobernanza; desactivado en mainnet) |

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
- Para llevar primero activos a QoreChain, consulta [Puentear activos](/user-guide/bridging-assets) (el puente todavía no está activo).
- Los pools también pueden ser una fuente de precios de comisiones para la [Abstracción de gas](/user-guide/gas-abstraction); hoy no se acepta ningún token para pagar comisiones.
