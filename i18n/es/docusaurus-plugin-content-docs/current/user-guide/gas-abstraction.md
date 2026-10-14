---
slug: /user-guide/gas-abstraction
title: Abstracción de Gas
sidebar_label: Abstracción de Gas
sidebar_position: 7
---

# Abstracción de Gas

Esta página describe la función de abstracción de gas de QoreChain, cuyo diseño permite a los usuarios pagar las comisiones de transacción en un token no nativo aceptado en lugar de QOR. **Hoy no se puede usar en ninguna de las dos redes**; esta página explica el diseño y qué hacer en su lugar.

:::caution Todavía no disponible
Pagar las comisiones en un token no nativo **no** funciona hoy en mainnet (**`qorechain-vladi`**, versión de nodo **v3.2.1**) ni en la testnet (**`qorechain-diana`**).

* Las consultas de abstracción de gas no se sirven en mainnet: `qorechaind query gasabstraction accepted-tokens` imprime su texto de ayuda y la ruta REST `/qorechain/gasabstraction/v1/config` devuelve `Not Implemented`.
* No hay canales IBC abiertos en ninguna de las dos redes, por lo que no puede existir ningún saldo `ibc/USDC` o `ibc/ATOM` con el que pagar.
* El mínimo de comisión de la red se comprueba en `uqor`, por lo que una comisión en cualquier otra denominación es rechazada.

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

## Descripción general

La abstracción de gas está diseñada para eliminar el requisito de tener QOR para pagar las comisiones de transacción. Un usuario que tenga un token alternativo aceptado (por ejemplo, una stablecoin transferida vía IBC) pagaría la comisión en ese token, y el protocolo convertiría el monto de la comisión a su equivalente nativo antes de procesarla.

---

## Diseño previsto

### Tokens aceptados

La configuración de génesis del módulo enumera estos tokens y tasas de conversión definidas por el protocolo. Son relaciones de cambio a efectos de comisión, no precios de mercado. Hoy en las redes solo puede existir `uqor` (véase el aviso anterior).

| Token              | Denominación | Tasa de conversión |
| ------------------ | ------------ | ------------------- |
| **QOR**            | `uqor`       | 1.0 (nativo)         |
| **USDC** (vía IBC) | `ibc/USDC`   | 1.0                  |
| **ATOM** (vía IBC) | `ibc/ATOM`   | 10.0                 |

### Cómo está pensado que funcione

El `GasAbstractionDecorator` de QoreChain se sitúa en el pipeline de procesamiento de transacciones. Para una transacción cuya comisión está en una denominación no nativa:

1. **Inspección de la comisión** — El decorador lee la denominación de la comisión.
2. **Búsqueda de la tasa** — Si la denominación está en la lista de tokens aceptados, se busca la tasa de conversión correspondiente.
3. **Conversión** — La comisión se convierte a su equivalente nativo en `uqor`.
4. **Procesamiento estándar** — La comisión convertida pasa por el manejador estándar de deducción de comisiones, de modo que el procesamiento posterior de la comisión (distribución a validadores, quema, tesorería, participaciones de stakers y de light nodes) opera sobre el equivalente nativo.

---

## Consultar la configuración

Mainnet todavía no sirve las consultas de abstracción de gas, y el método JSON-RPC `qor_getGasAbstractionConfig` no se sirve en ningún endpoint público (consulte [el espacio de nombres `qor_`](/api-reference/json-rpc-qor_-namespace)). Actualmente no hay una forma pública de leer una lista de tokens aceptados en producción.
