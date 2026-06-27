---
slug: /sdk/guides/ai-preflight
title: KI-Pre-flight-Leitfaden
sidebar_label: KI-Pre-flight
sidebar_position: 5
---

# KI-Pre-flight-Leitfaden

QoreChain ist das erste Netzwerk, das ein **On-Chain-KI-Risiko-/Anomalie-Modell**
für jede dApp bereitstellt. Zwei schreibgeschützte EVM-Precompiles erlauben es dir, eine Transaktion zu bewerten, *bevor*
sie signiert oder gesendet wird, und das nur mit `eth_call`:

| Fähigkeit | Precompile | Adresse |
|---|---|---|
| Risiko-Score für Calldata | `aiRiskScore(bytes)` | `0x0000000000000000000000000000000000000B01` |
| Anomalie-Prüfung für `(sender, amount)` | `aiAnomalyCheck(address,uint256)` | `0x0000000000000000000000000000000000000B02` |

Die Implementierung befindet sich in `@qorechain/evm` (dem EVM-Adapter über
[viem](https://viem.sh)) und wird aus `@qorechain/sdk` zur besseren Auffindbarkeit re-exportiert.

> Das Risiko-`level` ist höher bei riskanteren Transaktionen. Die Beispiel-Policy der Chain
> verwendet `require(level < 3)`.

## Pre-flight mit einem Aufruf

`simulateWithRiskScore` bündelt eine Gas-Schätzung, einen Risiko-Score und eine Anomalie-Prüfung
zu einem einzigen beratenden Urteil:

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

`safe` wird berechnet als `risk.level < RISK_LEVEL_UNSAFE_THRESHOLD && !anomaly.flagged`,
wobei der Schwellenwert standardmäßig `3` ist. Wenn keine `data` angegeben wird, wird der Risiko-Score
über den bereitgestellten Bytecode unter `to` berechnet, sodass eine reine Wertüberweisung an einen
Vertrag dennoch bewertet wird.

> **Das `safe`-Flag ist beratend.** Die Precompiles blockieren von sich aus nichts.
> Lege deine eigene Policy off-chain fest und setze sie durch (und ein Vertrag kann on-chain
> mit `require` auf das Level prüfen). `RISK_LEVEL_UNSAFE_THRESHOLD` wird exportiert, sodass du
> denselben Standardwert referenzieren kannst, den das SDK dokumentiert.

## Die Bausteine

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

Beide kodieren den Aufruf mit viems `encodeFunctionData` und dekodieren das zurückgegebene
Tupel mit `decodeFunctionResult`.

## Adresskonstanten

```ts
import { AI_RISK_SCORE_ADDRESS, AI_ANOMALY_CHECK_ADDRESS } from "@qorechain/evm";
```

## Verfügbarkeit

Die KI-Precompiles existieren auf QoreChain-Netzwerk-Nodes. Auf einem einfachen EVM-Node werfen die
Aufrufe einen "not available"-Fehler — behandle einen geworfenen Fehler aus einem dieser
Helfer als "feature not present on this node".

Siehe den [EVM-Leitfaden](/sdk/guides/evm) für die vollständige Precompile-Liste und das
lauffähige [`ai-preflight`-Beispiel](https://github.com/qorechain/qorechain-sdk/tree/main/examples/ai-preflight).
