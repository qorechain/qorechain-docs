---
slug: /sdk/guides/ai-preflight
title: KI-Pre-flight-Leitfaden
sidebar_label: KI-Pre-flight
sidebar_position: 5
---

# KI-Pre-flight-Leitfaden

QoreChain definiert ein **On-Chain-KI-Risiko-/Anomalie-Modell**, das eine dApp
aus der EVM lesen kann. Zwei schreibgeschützte EVM-Precompiles sollen es dir ermöglichen, eine Transaktion zu bewerten, *bevor*
sie signiert oder gesendet wird, und das nur mit `eth_call`:

| Fähigkeit | Precompile | Adresse |
|---|---|---|
| Risiko-Score für Calldata | `aiRiskScore(bytes)` | `0x0000000000000000000000000000000000000B01` |
| Anomalie-Prüfung für `(sender, amount)` | `aiAnomalyCheck(address,uint256)` | `0x0000000000000000000000000000000000000B02` |

:::caution Heute in den öffentlichen Netzwerken nicht verfügbar
`simulateWithRiskScore`, `aiRiskScore` und `aiAnomalyCheck` lesen die Precompiles unter
`0x…0B01` / `0x…0B02`. Ein statisches Precompile antwortet nur, wenn seine Adresse im Parameter
`active_static_precompiles` des EVM-Moduls steht. Diese Liste ist auf
`qorechain-vladi` (Mainnet) leer, und auf `qorechain-diana` (Testnet) enthält sie nur die PQC-
und Konsensparameter-Precompiles (`0x…0A01`, `0x…0A02`, `0x…0C01`), nicht das AI-Paar
(geprüft am 27. Oktober 2026). Gegen die öffentlichen
Endpunkte liefert ein Aufruf leere Daten (`0x`) zurück, und diese Helfer werfen einen Fehler (zum Beispiel
`returned no data ("0x")`). Sie funktionieren nur in einem Netzwerk oder auf einem Node, auf dem die
Precompiles aktiviert wurden. Prüfe zuerst `GET /cosmos/evm/vm/v1/params` und siehe
[EVM-Precompiles: Netzwerkstatus](/developer-guide/evm-precompiles#network-status).
:::

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

Die Helfer werfen immer dann einen Fehler, wenn die Precompiles auf dem abgefragten Node nicht aktiv sind:
in den öffentlichen Netzwerken ist das derzeit immer der Fall, ebenso auf einem einfachen EVM-Node.
Behandle einen geworfenen Fehler aus einem dieser Helfer als "feature not present on this
node".

Siehe den [EVM-Leitfaden](/sdk/guides/evm) für die vollständige Precompile-Liste und das
lauffähige [`ai-preflight`-Beispiel](https://github.com/qorechain/qorechain-sdk/tree/main/examples/ai-preflight).
