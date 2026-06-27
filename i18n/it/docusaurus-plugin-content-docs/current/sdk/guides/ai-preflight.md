---
slug: /sdk/guides/ai-preflight
title: Guida al pre-flight AI
sidebar_label: Pre-flight AI
sidebar_position: 5
---

# Guida al pre-flight AI

QoreChain è la prima rete a esporre un **modello AI on-chain di rischio/anomalia**
a qualsiasi dApp. Due precompile EVM in sola lettura ti permettono di assegnare un punteggio a una transazione *prima*
che venga firmata o trasmessa, usando nient'altro che `eth_call`:

| Capacità | Precompile | Indirizzo |
|---|---|---|
| Punteggio di rischio per calldata | `aiRiskScore(bytes)` | `0x0000000000000000000000000000000000000B01` |
| Controllo anomalia per `(sender, amount)` | `aiAnomalyCheck(address,uint256)` | `0x0000000000000000000000000000000000000B02` |

L'implementazione si trova in `@qorechain/evm` (l'adapter EVM sopra
[viem](https://viem.sh)) ed è riesportata da `@qorechain/sdk` per facilitarne la scoperta.

> Il `level` di rischio è più alto per le transazioni più rischiose. La policy di esempio della chain
> usa `require(level < 3)`.

## Pre-flight con una sola chiamata

`simulateWithRiskScore` raggruppa una stima del gas, un punteggio di rischio e un controllo
di anomalia in un unico verdetto consultivo:

```ts
import { createEvmClient, simulateWithRiskScore } from "@qorechain/evm";

const { publicClient } = await createEvmClient({
  endpoints: { evmRpc: "https://evm.testnet.example" },
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

`safe` è calcolato come `risk.level < RISK_LEVEL_UNSAFE_THRESHOLD && !anomaly.flagged`,
dove la soglia ha come valore predefinito `3`. Quando non viene fornito alcun `data`, il punteggio di rischio viene
calcolato sul bytecode distribuito a `to`, quindi anche un semplice trasferimento di valore verso un
contratto riceve comunque un punteggio.

> **Il flag `safe` è consultivo.** I precompile non bloccano nulla di per
> sé. Imposta e applica la tua policy off-chain (e un contratto può usare `require`
> sul livello on-chain). `RISK_LEVEL_UNSAFE_THRESHOLD` è esportato così puoi
> fare riferimento allo stesso valore predefinito documentato dall'SDK.

## I componenti di base

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

Entrambi codificano la chiamata con `encodeFunctionData` di viem e decodificano la tupla
restituita con `decodeFunctionResult`.

## Costanti di indirizzo

```ts
import { AI_RISK_SCORE_ADDRESS, AI_ANOMALY_CHECK_ADDRESS } from "@qorechain/evm";
```

## Disponibilità

I precompile AI esistono sui nodi della rete QoreChain. Su un normale nodo EVM le
chiamate generano un errore "not available" — tratta un errore generato da uno qualsiasi di questi
helper come "feature non presente su questo nodo".

Consulta la [guida EVM](/sdk/guides/evm) per l'elenco completo dei precompile, e l'esempio
eseguibile [`ai-preflight`](https://github.com/qorechain/qorechain-sdk/tree/main/examples/ai-preflight).
