---
slug: /rollups/qcai-copilot
title: QCAI Rollup Copilot
sidebar_label: QCAI Copilot
sidebar_position: 7
---

# QCAI Rollup Copilot

The QCAI Rollup Copilot in the RDK is a read-only helper that **tries** to gather the network's advisory data for one rollup — a fee estimate, network recommendations, fraud investigations that reference the rollup, the reinforcement-learning agent's status — and fold it into one plain-language read with a short list of suggestions.

:::caution Not available on the public endpoints
The advisory services it reads (`/qorechain/ai/v1/…` REST routes and the `qor_*` JSON-RPC namespace) are **not served** by the public `qore.host` endpoints on mainnet or testnet at present, so every section comes back as a warning. The Copilot is best-effort by design: it never fails, but an empty result does **not** mean the rollup was checked and found healthy. Do not use it as a safety signal until those services are exposed. See [the `qor_` namespace](/api-reference/json-rpc-qor_-namespace).
:::

## One call: `getRollupAdvice` {#one-call-getrollupadvice}

```ts
import { createRdkClient, getRollupAdvice } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });
const advice = await getRollupAdvice(rdk, "my-rollup");

console.log(advice.warnings);    // services that could not be reached (all of them today)
console.log(advice.suggestions); // plain-language suggestions, when data is available
```

The result also carries `feeEstimate`, `networkRecommendations`, `fraudInvestigations` and `rlAgentStatus` when the corresponding service answers.

## CLI {#cli}

```bash
qorollup advise my-rollup
qorollup advise my-rollup --json
```

Unreachable services are listed as warnings rather than errors, and the human-readable output can still print a "no issues flagged" line when nothing was reachable — read the warnings. See [Deploying a Rollup](/rollups/deploying-a-rollup) for the `qorollup` operator CLI.
