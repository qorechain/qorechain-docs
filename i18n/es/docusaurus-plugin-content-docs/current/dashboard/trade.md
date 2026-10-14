---
slug: /dashboard/trade
title: Operar (DEX)
sidebar_label: Operar (DEX)
sidebar_position: 4
---

# Operar (DEX)

La página de **Operar** es la pantalla de intercambio de tokens del Panel: intercambia un token por otro y aporta liquidez a un pool, sin libro de órdenes off-chain. Para el diseño del creador de mercado automatizado (AMM) nativo de QoreChain, consulta [AMM y liquidez on-chain](/architecture/amm).

:::caution Solo tokens de prueba, por ahora
Los pools y los tokens de esta página son tokens de prueba: los intercambios se ejecutan contra un contrato de intercambio desplegado en la EVM de testnet, y la página tiene un botón **Get test tokens** para conseguirlos. No trates nada de lo que se muestra aquí como liquidez de valor real ni como un precio de mercado. El módulo AMM nativo de QoreChain está activo, pero todavía no se ha creado ningún pool en ninguna de las dos redes. Esta página se actualizará cuando haya pools reales disponibles.
:::

Operar requiere una cuenta con sesión iniciada y una billetera —consulta [Iniciar sesión](/dashboard/overview#sign-in) y [Conectar tu billetera](/dashboard/overview#connect-your-wallet).

La página tiene cuatro pestañas: **Swap**, **Pools**, **Add Liquidity** y **My Positions**.

## Swap

Intercambia un token por otro:

1. Elige el token con el que vas a pagar e introduce una cantidad.
2. Elige el token que quieres recibir —la cantidad de salida se cotiza automáticamente.
3. Opcionalmente, ajusta tu **tolerancia al deslizamiento** (la variación máxima de precio que aceptarás; por defecto 0,5%).
4. Selecciona **Swap** y confirma.

Un panel de historial de intercambios enumera tus intercambios pasados con los tokens, las cantidades, la tasa, la hora y el estado.

:::tip Deslizamiento
Una mayor tolerancia al deslizamiento hace que un intercambio tenga más probabilidades de completarse en mercados que se mueven rápido, pero puedes recibir un precio menos favorable. El valor por defecto es adecuado para la mayoría de los pares.
:::

## Pools

Explora los pools de liquidez disponibles. Cada tarjeta de pool muestra el par de trading, la liquidez total, el volumen de 24 horas y el número de proveedores. Un cuadro de búsqueda filtra los pools por símbolo de token.

## Add Liquidity

Aporta liquidez a un pool y recibe una parte de sus comisiones de intercambio:

1. Selecciona los dos tokens que vas a emparejar (uno es QOR por defecto).
2. Introduce una cantidad para el primer token —la segunda cantidad se completa automáticamente para coincidir con la proporción actual del pool.
3. Revisa tu participación proyectada en el pool, luego selecciona **Add Liquidity** y confirma.

Recibes tokens de proveedor de liquidez (LP) que representan tu posición.

## My Positions

Consulta las posiciones de liquidez que tienes. Cada entrada muestra el par de tokens, la cantidad en cada token, tu participación en el pool y las comisiones obtenidas. Selecciona **Remove Liquidity** en una posición para previsualizar los tokens que recibirías y retirar tu parte.

## Relacionado

- [AMM y liquidez on-chain](/architecture/amm) — tipos de pools y curvas de precios.
- [Billetera](/dashboard/wallet) — comprueba los saldos antes y después de un intercambio.
