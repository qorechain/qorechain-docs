---
slug: /sdk/guides/ai-preflight
title: Guía de verificación previa con IA
sidebar_label: Verificación previa con IA
sidebar_position: 5
---

# Guía de verificación previa con IA

QoreChain define un **modelo de riesgo/anomalías de IA en la
cadena** que una dApp puede leer desde la EVM. Dos precompilados EVM de solo lectura están pensados para permitirte
puntuar una transacción *antes* de que se firme o se difunda, usando únicamente
`eth_call`:

| Capacidad | Precompilado | Dirección |
|---|---|---|
| Puntuación de riesgo para los datos de llamada | `aiRiskScore(bytes)` | `0x0000000000000000000000000000000000000B01` |
| Comprobación de anomalías para `(sender, amount)` | `aiAnomalyCheck(address,uint256)` | `0x0000000000000000000000000000000000000B02` |

:::caution No disponible hoy en las redes públicas
`simulateWithRiskScore`, `aiRiskScore` y `aiAnomalyCheck` leen los precompilados en
`0x…0B01` / `0x…0B02`. Un precompilado estático solo responde cuando su dirección está en el
parámetro `active_static_precompiles` del módulo EVM. Esa lista está vacía en
`qorechain-vladi` (red principal), y en `qorechain-diana` (red de pruebas) contiene solo los precompilados de PQC
y de parámetros de consenso (`0x…0A01`, `0x…0A02`, `0x…0C01`), no el par de IA
(comprobado el 27 de octubre de 2026). Contra los
endpoints públicos una llamada devuelve datos vacíos (`0x`) y estos ayudantes lanzan un error (por ejemplo
`returned no data ("0x")`). Solo funcionan en una red o nodo donde los
precompilados se hayan activado. Comprueba primero `GET /cosmos/evm/vm/v1/params`, y consulta
[Precompilados EVM: estado de la red](/developer-guide/evm-precompiles#network-status).
:::

La implementación vive en `@qorechain/evm` (el adaptador EVM sobre
[viem](https://viem.sh)) y se reexporta desde `@qorechain/sdk` para su
descubrimiento.

> El `level` de riesgo es más alto para las transacciones más arriesgadas. La
> política de ejemplo de la cadena usa `require(level < 3)`.

## Verificación previa en una sola llamada

`simulateWithRiskScore` agrupa una estimación de gas, una puntuación de riesgo y
una comprobación de anomalías en un único veredicto orientativo:

```ts
import { createEvmClient, simulateWithRiskScore } from "@qorechain/evm";

const { publicClient } = await createEvmClient({
  endpoints: { evmRpc: "https://evm-testnet.qore.host" },
});

const preflight = await simulateWithRiskScore(publicClient, {
  from: "0xYourAddress",
  to: "0xToken",
  data: "0xa9059cbb...", // ERC-20 transfer calldata
  value: 0n,
});

console.log(preflight.gas);     // bigint — eth_estimateGas
console.log(preflight.risk);    // { score: bigint, level: number }
console.log(preflight.anomaly); // { anomalyScore: bigint, flagged: boolean }
console.log(preflight.safe);    // boolean — advisory verdict
```

`safe` se calcula como `risk.level < RISK_LEVEL_UNSAFE_THRESHOLD && !anomaly.flagged`,
donde el umbral por defecto es `3`. Cuando no se proporciona ningún `data`, la
puntuación de riesgo se calcula sobre el bytecode desplegado en `to`, de modo que
una mera transferencia de valor a un contrato también se puntúa.

> **El indicador `safe` es orientativo.** Los precompilados no bloquean nada por sí
> mismos. Define y aplica tu propia política fuera de la cadena (y un contrato puede
> usar `require` sobre el nivel en la cadena). `RISK_LEVEL_UNSAFE_THRESHOLD` se
> exporta para que puedas referenciar el mismo valor por defecto que documenta el
> SDK.

## Los componentes básicos

```ts
import { aiRiskScore, aiAnomalyCheck } from "@qorechain/evm";

// Risk score for raw calldata (accepts a 0x-hex string or a Uint8Array).
const { score, level } = await aiRiskScore(publicClient, "0xa9059cbb...");

// Anomaly check for a (sender, amount) pair.
const { anomalyScore, flagged } = await aiAnomalyCheck(
  publicClient,
  "0xYourAddress",
  1_000_000_000_000_000_000n, // 1 QOR in wei
);
```

Ambos codifican la llamada con `encodeFunctionData` de viem y decodifican la tupla
devuelta con `decodeFunctionResult`.

## Constantes de dirección

```ts
import { AI_RISK_SCORE_ADDRESS, AI_ANOMALY_CHECK_ADDRESS } from "@qorechain/evm";
```

## Disponibilidad

Los ayudantes lanzan un error siempre que los precompilados no están activos en el nodo que consultas:
en las redes públicas eso ocurre actualmente siempre, y también en un nodo EVM normal.
Trata un error lanzado por cualquiera de estos ayudantes como "feature not present on this node".

Consulta la [guía de EVM](/sdk/guides/evm) para ver la lista completa de
precompilados, y el [ejemplo ejecutable `ai-preflight`](https://github.com/qorechain/qorechain-sdk/tree/main/examples/ai-preflight).
