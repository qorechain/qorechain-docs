---
slug: /sdk/guides/ai-preflight
title: AI Pre-flight Guide
sidebar_label: AI Pre-flight
sidebar_position: 5
---

# AI pre-flight guide

QoreChain defines an **on-chain AI risk/anomaly model** that a dApp can read from
the EVM. Two read-only EVM precompiles are meant to let you score a transaction
*before* it is signed or broadcast, using nothing but `eth_call`:

| Capability | Precompile | Address |
|---|---|---|
| Risk score for calldata | `aiRiskScore(bytes)` | `0x0000000000000000000000000000000000000B01` |
| Anomaly check for `(sender, amount)` | `aiAnomalyCheck(address,uint256)` | `0x0000000000000000000000000000000000000B02` |

:::caution Not available on the public networks today
`simulateWithRiskScore`, `aiRiskScore` and `aiAnomalyCheck` read the precompiles at
`0x…0B01` / `0x…0B02`. A static precompile answers only when its address is in the
EVM module's `active_static_precompiles` parameter, and that list is empty on both
`qorechain-vladi` (mainnet) and `qorechain-diana` (testnet). Against the public
endpoints a call returns empty data (`0x`) and these helpers throw (for example
`returned no data ("0x")`). They work only on a network or node where the
precompiles have been activated. Check `GET /cosmos/evm/vm/v1/params` first, and see
[EVM Precompiles: Network status](/developer-guide/evm-precompiles#network-status).
:::

The implementation lives in `@qorechain/evm` (the EVM adapter over
[viem](https://viem.sh)) and is re-exported from `@qorechain/sdk` for discovery.

> The risk `level` is higher for riskier transactions. The chain's example policy
> uses `require(level < 3)`.

## One-call pre-flight

`simulateWithRiskScore` bundles a gas estimate, a risk score, and an anomaly
check into a single advisory verdict:

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

`safe` is computed as `risk.level < RISK_LEVEL_UNSAFE_THRESHOLD && !anomaly.flagged`,
where the threshold defaults to `3`. When no `data` is supplied, the risk score is
computed over the deployed bytecode at `to`, so a bare value transfer to a
contract is still scored.

> **The `safe` flag is advisory.** The precompiles do not block anything on their
> own. Set and enforce your own policy off-chain (and a contract can `require` on
> the level on-chain). `RISK_LEVEL_UNSAFE_THRESHOLD` is exported so you can
> reference the same default the SDK documents.

## The building blocks

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

Both encode the call with viem's `encodeFunctionData` and decode the returned
tuple with `decodeFunctionResult`.

## Address constants

```ts
import { AI_RISK_SCORE_ADDRESS, AI_ANOMALY_CHECK_ADDRESS } from "@qorechain/evm";
```

## Availability

The helpers throw whenever the precompiles are not active on the node you query:
on the public networks that is currently always, and on a plain EVM node too.
Treat a thrown error from any of these helpers as "feature not present on this
node".

See the [EVM guide](/sdk/guides/evm) for the full precompile list, and the
runnable [`ai-preflight` example](https://github.com/qorechain/qorechain-sdk/tree/main/examples/ai-preflight).
