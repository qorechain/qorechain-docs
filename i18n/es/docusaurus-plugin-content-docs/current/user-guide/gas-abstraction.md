---
slug: /user-guide/gas-abstraction
title: Abstracción de Gas
sidebar_label: Abstracción de Gas
sidebar_position: 7
---

# Abstracción de Gas

La abstracción de gas permite a un usuario pagar la comisión de una transacción en un token no nativo aceptado en lugar de QOR. El código de conversión de comisiones forma parte de la cadena, pero **hoy no se acepta ningún token no nativo en ninguna de las dos redes**, por lo que toda comisión se paga en QOR. Esta página explica qué está activo, cómo funciona la conversión tal como está construida y qué hacer en su lugar.

:::caution Todavía no se puede usar: pague cada comisión en uqor
En mainnet (**`qorechain-vladi`**) y en la testnet (**`qorechain-diana`**), en las versiones de nodo **v3.2.4** y **v3.2.6** respectivamente, comprobado el 27 de octubre de 2026:

* La lista de tokens aceptados en producción contiene **solo `uqor`**. La conversión de comisiones se activó con v3.2.2, pero no hay nada más en la lista, el tope de conversión por bloque es `0` (conversión desactivada) y el float de conversión no tiene saldo. Una comisión pagada en cualquier otra denominación es rechazada con un error «denom not accepted for fee payment», tanto en simulación como en una transacción real.
* No existe ningún canal IBC en mainnet, y el único canal de prueba de la testnet no convierte ningún token `ibc/…` en un token de comisión aceptado (la lista es solo `uqor`), por lo que no hay nada más que `uqor` con lo que pagar.

Pague cada comisión en `uqor`. Esta página se actualizará cuando se acepte un token en una red en producción.
:::

---

## Lo que funciona hoy: pagar comisiones en uqor

Cada transacción paga al menos **0.1 uqor por unidad de gas**. Establezca el límite de gas y la comisión a la vez:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --gas 400000 --fees 40000uqor \
  --chain-id qorechain-vladi --generate-only > tx.json
```

Después fírmela de forma híbrida y transmítala con `qorechaind tx pqc cosign`, como se describe en [Comandos de transacción](/cli-reference/transaction-commands#hybrid-signing). Consulte [Comisiones y gas](/cli-reference/transaction-commands#fees-and-gas) para ver los límites sugeridos por tipo de transacción.

---

## La configuración en producción {#live-configuration}

El módulo sirve su configuración por REST y gRPC. Estos son los valores en ambas redes el 27 de octubre de 2026:

| Campo | Valor | Significado |
| --- | --- | --- |
| `enabled` | `true` | Interruptor del módulo |
| `native_denom` | `uqor` | La denominación en la que se paga finalmente toda comisión |
| `accepted_tokens` | solo `uqor` | Tokens que pueden pagar una comisión. `uqor` no necesita fuente de precios |
| `premium_bps` | `300` | La parte del valor de una comisión convertida que el float se queda para cubrir su riesgo de precio (3 %) |
| `max_tip_multiplier` | `3` | Una comisión convertida no puede superar este múltiplo de la comisión mínima para su gas; `0` significaría sin límite |
| `float_min` | `0` | El saldo nativo que el float siempre reserva |
| `block_conversion_cap` | `0` | Lo máximo que el float paga por bloque; `0` significa que la conversión está desactivada |

Las versiones anteriores de esta página mostraban entradas de ejemplo `ibc/USDC` e `ibc/ATOM` con tasas fijas. No están en la lista en producción.

Léala usted mismo:

```bash
qorechaind query gasabstraction config
qorechaind query gasabstraction accepted-tokens
qorechaind query gasabstraction conversion-rate uqor
qorechaind query gasabstraction float

curl -s https://api.qore.host/qorechain/gasabstraction/v1/config
curl -s "https://api.qore.host/qorechain/gasabstraction/v1/conversion_rate?denom=uqor"
curl -s https://api.qore.host/qorechain/gasabstraction/v1/float
```

`conversion_rate` informa de `rate`, `effective_rate` (la tasa menos la prima), `price_source` y si el token es `usable` en esta altura, con un `reason` cuando no lo es. `float` informa de la dirección y los saldos del float y del uso del bloque actual frente a `block_cap`. El método JSON-RPC `qor_getGasAbstractionConfig` no se sirve en ningún endpoint público (consulte [el espacio de nombres `qor_`](/api-reference/json-rpc-qor_-namespace)); use REST o gRPC.

---

## Cómo funciona la conversión (tal como está construida) {#how-it-works}

Desde v3.2.2 el decorador de comisiones dirige cada transacción por una de dos rutas:

* Una comisión en `uqor`, o en más de una denominación, toma la **ruta nativa**, sin cambios.
* Una comisión en **exactamente una** denominación no nativa toma la **ruta de conversión**.

En la ruta de conversión:

1. **¿Aceptada?** La denominación debe estar en la lista de tokens aceptados y tener una fuente de precios, o la transacción es rechazada.
2. **Precio.** El precio del token proviene de una de dos fuentes: una tasa estática fijada por gobernanza que caduca en una altura de bloque indicada, o el precio medio ponderado en el tiempo del pool del [AMM](/architecture/amm) que empareja el token con QOR. Un precio de pool solo se usa si el pool está activo, tiene al menos la liquidez mínima configurada en el lado de QOR y su precio spot está dentro de la desviación configurada respecto a su media.
3. **Valor.** El valor nativo de la comisión es el monto del token multiplicado por el precio, menos la prima.
4. **Mismas reglas que una comisión nativa.** Las reglas de comisión mínima y de comisión dinámica nativas se aplican a ese valor nativo, de modo que una comisión convertida debe cumplir exactamente lo que debe cumplir una comisión en QOR (0.1 uqor por unidad de gas como mínimo), y está limitada por `max_tip_multiplier`.
5. **Liquidación.** Los tokens del pagador van al **float** del módulo de abstracción de gas, y el float paga el valor nativo en `uqor` al recolector de comisiones. Todo lo que está aguas abajo del recolector de comisiones (quema, y las participaciones de validadores, stakers, tesorería y light nodes) solo ve, por tanto, `uqor`.

La conversión está acotada de tres maneras: por transacción (`max_tip_multiplier`), por bloque (`block_conversion_cap`) y por el saldo que el float siempre reserva (`float_min`). Todo rechazo también ocurre durante la simulación, de modo que la estimación de gas falla igual que lo haría la transacción real.

### Conseguir que se acepte un token

* **La gobernanza** reemplaza la configuración con `MsgUpdateConfig` (autoridad: la cuenta del módulo de gobernanza). Así se añadiría un token de comisión `ibc/<hash>` real y su pool o tasa estática, y se abriría la conversión.
* **El float** es una cuenta de módulo que rechaza los envíos ordinarios del banco. Se financia con `MsgFundFloat` (`qorechaind tx gasabstraction fund-float <amount>uqor`), por ejemplo desde una cuenta que recibió un gasto del fondo comunitario con ese fin.

No se ha presentado en mainnet ninguna propuesta para hacer ninguna de las dos cosas, y la lista seguirá siendo solo `uqor` hasta que una sea aprobada.
