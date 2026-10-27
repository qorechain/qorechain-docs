---
slug: /dashboard/trade
title: Operar (DEX)
sidebar_label: Operar (DEX)
sidebar_position: 4
---

# Operar (DEX)

La página **Operar** (titulada "QoreChain DEX") es una pantalla de intercambio de tokens de prueba con cuatro pestañas: **Swap**, **Pools**, **Add Liquidity** y **My Positions**. Sirve para probar un flujo de intercambio de principio a fin con tokens de prueba antes de que existan pools reales. Para el diseño del creador de mercado automatizado (AMM) nativo de QoreChain, consulta [AMM y liquidez on-chain](/architecture/amm).

:::caution Solo tokens de prueba, por ahora
Todo lo de esta página se ejecuta en la **testnet**, sea cual sea la red que muestre el encabezado. En la mainnet la página sigue protegida por el inicio de sesión y el reconocimiento de riesgos, pero muestra `qorechain-diana` y tokens de la testnet. Solo cinco tokens de prueba de QoreSwap se liquidan on-chain; todo lo demás es una zona de práctica. El módulo AMM nativo de QoreChain está activo, pero todavía no se ha creado ningún pool en ninguna de las dos redes (`GET /qorechain/amm/v1/pools` devuelve una lista vacía en ambas, comprobado el 27 de octubre de 2026).
:::

## Innovaciones {#innovations}

- **Intercambios on-chain de cinco tokens de prueba.** Los intercambios entre WQOR, QUSDC, QUSDT, QWETH y QWBTC se ejecutan contra el contrato AMM de QoreSwap en la EVM de la testnet (chain ID 9800). La cotización procede de `getAmountOut` del contrato.
- **Deslizamiento aplicado en la propia transacción.** La operación se ejecuta como un approve seguido de `swapExactTokensForTokens`, con una salida mínima derivada de tu ajuste de deslizamiento, firmada con la clave EVM de la billetera de prueba. Si el precio se mueve más allá de tu tolerancia, el intercambio se revierte en lugar de ejecutarse a un precio peor.
- **Tokens de prueba a demanda.** **Get test tokens** reclama los cinco tokens, una vez cada 12 horas por token.
- **Separación honesta entre lo real y la práctica.** Los demás pares, la lista de Pools, Add Liquidity y My Positions son una zona de práctica de la testnet y no están on-chain.

## Cómo usarlo {#how-to-use}

Requisitos previos: haber iniciado sesión y tener una billetera de prueba (consulta [Billetera](/dashboard/wallet#testnet)). Sin ella, la página muestra "Wallet Required for Trading".

### Swap

1. El banner ofrece **Get test tokens**; úsalo primero.
2. Elige el token con el que vas a pagar e introduce una cantidad. El par por defecto, QOR a USDC, es un par de **práctica** que no se liquida on-chain. Elige **WQOR** y **QUSDC** (o cualquier par de los cinco) para un intercambio on-chain.
3. Elige el token que quieres recibir; la cantidad de salida se cotiza automáticamente.
4. Opcionalmente, ajusta la **tolerancia al deslizamiento** (por defecto 0,5%).
5. Selecciona **Swap Now** y luego **Confirm Swap**. El resultado muestra "Swap Confirmed" con **View Transaction**.

**Recent Swaps** enumera los intercambios de todos los usuarios; **Show My History** lo filtra a los tuyos.

**Ejemplo mínimo:** en la testnet, selecciona **Get test tokens**, vende 10 WQOR por QUSDC, **Swap Now**, **Confirm Swap**.

:::tip Deslizamiento
Una mayor tolerancia hace que un intercambio tenga más probabilidades de completarse en mercados que se mueven rápido, pero puedes recibir un precio peor. El valor por defecto es adecuado para la mayoría de los pares.
:::

### Pools

Explora las tarjetas de pool: par de trading, liquidez total, volumen de 24 horas, número de proveedores y también un APR, una comisión, un ID de pool, un precio y las reservas. Un cuadro de búsqueda filtra por símbolo de token. Son cifras de práctica; no las interpretes como rendimientos.

### Add Liquidity

1. Selecciona dos tokens para emparejar (uno es QOR por defecto). Usa **Create Pool** para un par nuevo.
2. Introduce una cantidad para el primer token; el segundo se completa para coincidir con la proporción del pool. La página indica "Minimum 1000 QOR required".
3. Revisa tu participación y confirma.

### My Positions

Cada entrada muestra el par de tokens, la cantidad de cada token, tu participación y las comisiones obtenidas. Para salir de una posición, selecciona **Withdraw** y luego **Request Withdrawal (x%)**; tras un periodo de espera, selecciona **Confirm Withdraw** (o **Cancel Withdrawal**). No hay un único botón "Remove Liquidity".

## Cómo acceder {#how-to-access}

- **URL:** [dashboard.qorechain.io/trade](https://dashboard.qorechain.io/trade).
- **Cuenta:** se requiere iniciar sesión. Para intercambiar hace falta una billetera de prueba. En la mainnet también se requiere el [reconocimiento de riesgos](/dashboard/overview#risk-acknowledgement) por única vez antes de que se abra la página.
- **Red:** solo contenido de la testnet; el selector del encabezado no lo cambia.
- **Costo:** gratuito. Los tokens de prueba proceden de **Get test tokens**; la billetera de prueba paga el gas en QOR de prueba del [Faucet](/dashboard/faucet).

## Dónde se publica {#where-published}

| Superficie | Dirección | Red | ¿Se liquida on-chain? |
| --- | --- | --- | --- |
| Swap de WQOR, QUSDC, QUSDT, QWETH, QWBTC | `dashboard.qorechain.io/trade` | EVM de la testnet, chain ID 9800 | Sí |
| Otros pares, Pools, Add Liquidity, My Positions | `dashboard.qorechain.io/trade` | Testnet | No, libro de práctica |
| AMM nativo | Consulta [AMM](/architecture/amm) | Ambas redes | Todavía no existen pools |

## Límites y problemas conocidos {#limits}

- **No hay trading en la mainnet.** La página ignora el selector de red y muestra contenido de la testnet también en la mainnet.
- **Solo cinco tokens se liquidan on-chain.** Los tokens del fest del [Faucet](/dashboard/faucet#fest-tokens) no están en esta página.
- **El AMM nativo no tiene pools** en ninguna de las dos redes. Los pools reales se describirán cuando existan.
- **Las cifras de práctica** (precios, APR, volumen) no son datos de mercado.
- **Los tokens de la testnet no tienen valor** y no se pueden cambiar por nada.

## Relacionado

- [AMM y liquidez on-chain](/architecture/amm) - tipos de pools y curvas de precios.
- [Billetera](/dashboard/wallet) - comprueba los saldos antes y después de un intercambio.
