---
slug: /dashboard/trade
title: Operar (DEX)
sidebar_label: Operar (DEX)
sidebar_position: 4
---

# Operar (DEX)

La página de **Operar** es el exchange descentralizado del Panel. Te permite intercambiar tokens y aportar liquidez directamente en el creador de mercado automatizado (AMM) nativo y on-chain de QoreChain —sin libro de órdenes off-chain ni contrato inteligente externo. Los intercambios y las acciones de liquidez se liquidan a nivel de protocolo. Para el diseño que hay detrás, consulta [AMM y liquidez on-chain](/architecture/amm).

Conecta tu billetera para operar —consulta [Resumen y primeros pasos](/dashboard/overview#connect-your-wallet).

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

Explora los pools de liquidez disponibles. Cada tarjeta de pool muestra el par de trading, la liquidez total, el volumen de 24 horas, el APR y el número de proveedores. Un cuadro de búsqueda filtra los pools por símbolo de token.

## Add Liquidity

Aporta liquidez para ganar una parte de las comisiones de intercambio:

1. Selecciona los dos tokens que vas a emparejar (uno es QOR por defecto).
2. Introduce una cantidad para el primer token —la segunda cantidad se completa automáticamente para coincidir con la proporción actual del pool.
3. Revisa tu participación proyectada en el pool, luego selecciona **Add Liquidity** y confirma.

Recibes tokens de proveedor de liquidez (LP) que representan tu posición.

## My Positions

Consulta las posiciones de liquidez que tienes. Cada entrada muestra el par de tokens, la cantidad en cada token, tu participación en el pool, las comisiones obtenidas y el APR. Selecciona **Remove Liquidity** en una posición para previsualizar los tokens que recibirías y retirar tu parte.

## Relacionado

- [AMM y liquidez on-chain](/architecture/amm) — tipos de pools y curvas de precios.
- [Billetera](/dashboard/wallet) — comprueba los saldos antes y después de un intercambio.
