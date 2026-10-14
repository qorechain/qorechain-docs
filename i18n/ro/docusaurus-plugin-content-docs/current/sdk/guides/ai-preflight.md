---
slug: /sdk/guides/ai-preflight
title: Ghid pre-flight AI
sidebar_label: Pre-flight AI
sidebar_position: 5
---

# Ghid pre-flight AI

QoreChain definește un **model AI de risc/anomalii on-chain** pe care un dApp îl
poate citi din EVM. Două precompile-uri EVM doar de citire sunt menite să îți
permită să evaluezi o tranzacție *înainte* ca aceasta să fie semnată sau difuzată,
folosind doar `eth_call`:

| Capabilitate | Precompile | Adresă |
|---|---|---|
| Scor de risc pentru calldata | `aiRiskScore(bytes)` | `0x0000000000000000000000000000000000000B01` |
| Verificare de anomalii pentru `(sender, amount)` | `aiAnomalyCheck(address,uint256)` | `0x0000000000000000000000000000000000000B02` |

:::caution Nu este disponibil astăzi pe rețelele publice
`simulateWithRiskScore`, `aiRiskScore` și `aiAnomalyCheck` citesc precompile-urile de la
`0x…0B01` / `0x…0B02`. Un precompile static răspunde doar dacă adresa sa se află în
parametrul `active_static_precompiles` al modulului EVM, iar această listă este goală
atât pe `qorechain-vladi` (mainnet), cât și pe `qorechain-diana` (testnet). Pe
endpoint-urile publice, un apel returnează date goale (`0x`), iar aceste helpere
aruncă o eroare (de exemplu `returned no data ("0x")`). Funcționează doar pe o rețea
sau pe un nod unde precompile-urile au fost activate. Verifică mai întâi
`GET /cosmos/evm/vm/v1/params` și vezi
[Precompile-uri EVM: Starea rețelei](/developer-guide/evm-precompiles#network-status).
:::

Implementarea se află în `@qorechain/evm` (adaptorul EVM peste
[viem](https://viem.sh)) și este re-exportată din `@qorechain/sdk` pentru
descoperire.

> `level`-ul de risc este mai mare pentru tranzacțiile mai riscante. Politica de
> exemplu a lanțului folosește `require(level < 3)`.

## Pre-flight într-un singur apel

`simulateWithRiskScore` grupează o estimare de gaz, un scor de risc și o
verificare de anomalii într-un singur verdict consultativ:

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

`safe` este calculat ca `risk.level < RISK_LEVEL_UNSAFE_THRESHOLD && !anomaly.flagged`,
unde pragul are valoarea implicită `3`. Când nu este furnizat niciun `data`, scorul
de risc este calculat pe baza bytecode-ului implementat la `to`, astfel încât un
simplu transfer de valoare către un contract este, de asemenea, evaluat.

> **Indicatorul `safe` este consultativ.** Precompile-urile nu blochează nimic de
> la sine. Stabilește și aplică propria politică off-chain (iar un contract poate
> folosi `require` pe nivel on-chain). `RISK_LEVEL_UNSAFE_THRESHOLD` este exportat
> astfel încât să poți face referire la aceeași valoare implicită pe care o
> documentează SDK-ul.

## Componentele de bază

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

Ambele codifică apelul cu `encodeFunctionData` din viem și decodifică tuplul
returnat cu `decodeFunctionResult`.

## Constante de adresă

```ts
import { AI_RISK_SCORE_ADDRESS, AI_ANOMALY_CHECK_ADDRESS } from "@qorechain/evm";
```

## Disponibilitate

Helperele aruncă o eroare ori de câte ori precompile-urile nu sunt active pe nodul
pe care îl interoghezi: pe rețelele publice acesta este în prezent mereu cazul, la
fel și pe un nod EVM obișnuit. Tratează o eroare aruncată de oricare dintre aceste
helpere drept „feature not present on this node".

Vezi [ghidul EVM](/sdk/guides/evm) pentru lista completă de precompile-uri și
[exemplul `ai-preflight`](https://github.com/qorechain/qorechain-sdk/tree/main/examples/ai-preflight)
executabil.
