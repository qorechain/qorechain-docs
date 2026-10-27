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
El módulo AMM está activo en mainnet (v3.2.4) y en la testnet (v3.2.6), pero **todavía no se ha creado ningún pool** (comprobado el 27 de octubre de 2026: `GET /qorechain/amm/v1/pools` devuelve una lista vacía en ambas), y los denoms de los ejemplos siguientes (`uusdc`, `uusdt`) son ilustrativos: hoy no existen tales activos en las redes. Mientras no exista un pool, todo comando de swap o de aportar liquidez falla con un error de pool no encontrado.
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
| `lp_token_decimals` | `6` | Decimales de visualización de las participaciones LP de un pool (cosmético: las participaciones LP son entradas de un libro mayor, no tokens) |

## Reglas de swap aplicadas desde v3.2.2 {#swap-rules}

Las correcciones de integridad del AMM siguientes se aplicaron a mainnet con v3.2.2 (altura 3,556,788, 16 de octubre de 2026) y se refinaron en v3.2.3 (altura 3,662,051, 20 de octubre de 2026). Se aplican a todo swap, sea cual sea la vía por la que llegue.

* **Ambos denoms están vinculados al pool.** Un swap debe nombrar los dos denoms del pool al que apunta. Los pools stable-swap se valoran con la curva stable-swap en ambas direcciones (exact-in y exact-out).
* **Comisión del protocolo.** La parte del protocolo de la comisión de swap sale del pool. Cuando se paga en QOR va al recolector de comisiones y se reparte con las demás comisiones del bloque (consulta [Tokenómica](/architecture/tokenomics)), registrando la parte quemada bajo la fuente de quema `amm`; en cualquier otra denominación va al pool comunitario. La comisión de creación de pool se quema y se registra bajo la misma fuente `amm`.
* **Tope de impacto en el precio.** `max_swap_impact_bps` se aplica: se rechaza un swap cuyo impacto en el precio respecto al precio del pool supere el 5 %. Un swap que no establece ningún límite de deslizamiento (un `min-out` de 0 en exact-in, o un `max-in` que cubre toda la reserva de entrada en exact-out) se mide además contra el precio del pool al inicio del bloque y se rechaza si operaciones anteriores del mismo bloque lo movieron más allá del tope. Establece un `min-out` / `max-in` real en cada swap.
* **Trabajo acotado al final del bloque (v3.2.3).** Al final de cada bloque el módulo actualiza el precio promedio ponderado continuo de como máximo 100 pools, de forma rotativa. Mientras haya 100 pools o menos, cada pool se actualiza en cada bloque; por encima de eso, el promedio de un pool se actualiza una vez por ronda de `ceil(pools / 100)` bloques. El promedio es informativo (lo devuelven las consultas `pool`) y no cambia la fijación de precios de los swaps.

## Pools y participaciones LP

Un pool mantiene reservas de dos denoms (`token_a`, `token_b`, almacenados en orden ordenado) y registra **participaciones LP** que representan un derecho proporcional sobre esas reservas. Cada pool tiene un `id` numérico, un `type` y un `status` (`active` o `paused`). Cuando aportas liquidez, tu saldo de participaciones LP en ese pool sube; cuando retiras liquidez, baja y recibes tu parte de las reservas.

:::note Las participaciones LP no son tokens
Las participaciones LP son entradas del libro mayor propio del módulo AMM, llevado por pool y por cuenta (la clave interna es `amm-lp/<pool id>`). **No son bank coins ni tokens ERC-20, no aparecen en tu saldo de bank, y no se pueden transferir, enviar a otra cuenta ni negociar**. Lee tu participación con la consulta `lp-balance` o con la ruta `/lp/{address}` que se indica más abajo.
:::

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

`add-liquidity` deposita ambos lados en un pool y abona participaciones LP a tu saldo. El argumento final es el monto mínimo de participaciones LP que aceptarás: tu protección frente a que la proporción del pool cambie antes de que se confirme tu transacción.

```bash
qorechaind tx amm add-liquidity 1 500000000uqor 500000000uusdc 100000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

### Retirar liquidez

`remove-liquidity` descuenta participaciones LP de tu saldo y retira reservas. Los dos argumentos `min` establecen el monto mínimo de cada lado que aceptarás recibir de vuelta.

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

`pool` devuelve las reservas del pool, el suministro de LP, el tipo, el estado y un precio promedio ponderado continuo. `lp-balance` devuelve el `balance` de participaciones LP que una cuenta posee en ese pool.

### Rutas REST {#rest-routes}

Las mismas lecturas se sirven por REST en **ambas** redes, mainnet (`https://api.qore.host`) y testnet (`https://api-testnet.qore.host`); se comprobaron en ambas el 27 de octubre de 2026:

| Ruta | Devuelve |
| --- | --- |
| `GET /qorechain/amm/v1/params` | Parámetros del módulo |
| `GET /qorechain/amm/v1/pools` | Todos los pools (una lista vacía mientras no exista ninguno) |
| `GET /qorechain/amm/v1/pools/{pool_id}` | Un pool (`404` si no se conoce) |
| `GET /qorechain/amm/v1/pools/{pool_id}/lp/{address}` | El balance de LP de una dirección en el pool (`{address}` es una dirección bech32 `qor1...`) |
| `GET /qorechain/amm/v1/pool_by_denoms?denom_a=&denom_b=` | El pool de un par de denoms (`404` si no hay ninguno) |
| `GET /qorechain/amm/v1/quote/exact_in?pool_id=&denom_in=&amount_in=` | Salida y comisión para una entrada exacta |
| `GET /qorechain/amm/v1/quote/exact_out?pool_id=&denom_out=&amount_out=` | Entrada y comisión para una salida exacta |

Una cotización contra un pool que no existe responde con un error de pool no encontrado.

### Tokens Fest de testnet {#fest-tokens}

La gobernanza de testnet registró tres contratos ERC-20 de prueba, **fUSD** (6 decimales), **fETH** (18) y **fBTC** (8), para que existan como monedas de bank con las denominaciones sensibles a mayúsculas `erc20:<EIP-55 contract address>` (listadas en la página del [Faucet](/dashboard/faucet#fest-tokens)). Los titulares obtienen la moneda de bank con `MsgConvertERC20` (el remitente debe ser una dirección bech32 `qor1...`) y pueden crear un pool contra `uqor` con el comando habitual `create-pool` y la comisión de creación de 100 QOR. Son tokens de prueba exclusivos de testnet y sin valor, y todavía no existe ningún pool para ellos (comprobado el 27 de octubre de 2026). Mainnet no tiene tales tokens.

## Pausar y reanudar un pool

Los pools pueden ser pausados y reanudados por la autoridad de gobernanza. En mainnet, estos dos mensajes están actualmente desactivados por el cortacircuitos; en la testnet no están desactivados. Un pool pausado rechaza los swaps y los cambios de liquidez hasta que se reanude, lo que resulta útil para la respuesta a incidentes o el mantenimiento coordinado.


## Resumen de comandos

**Transacciones** (`qorechaind tx amm …`):

| Comando | Propósito |
| --- | --- |
| `create-pool` | Crear un pool `constant_product` o `stable_swap` |
| `add-liquidity` | Depositar reservas y abonar participaciones LP |
| `remove-liquidity` | Descontar participaciones LP y retirar reservas |
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
