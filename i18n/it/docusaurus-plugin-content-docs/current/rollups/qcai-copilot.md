---
slug: /rollups/qcai-copilot
title: Copilot QCAI per Rollup
sidebar_label: Copilot QCAI
sidebar_position: 7
---

# Copilot QCAI per Rollup

Il Copilot QCAI per Rollup nell'RDK è un helper in sola lettura che **cerca** di raccogliere i dati di advisory della rete per un rollup — una stima delle commissioni, le raccomandazioni di rete, le indagini antifrode che fanno riferimento al rollup, lo stato dell'agente di reinforcement learning — e di condensarli in un'unica lettura in linguaggio chiaro con un breve elenco di suggerimenti.

:::caution Non disponibile sugli endpoint pubblici
I servizi di advisory che legge (le route REST `/qorechain/ai/v1/…` e il namespace JSON-RPC `qor_*`) al momento **non sono serviti** dagli endpoint pubblici `qore.host` né su mainnet né su testnet, quindi ogni sezione ritorna come avviso. Il Copilot è best-effort per design: non fallisce mai, ma un risultato vuoto **non** significa che il rollup sia stato controllato e trovato sano. Non usarlo come segnale di sicurezza finché quei servizi non saranno esposti. Vedi [il namespace `qor_`](/api-reference/json-rpc-qor_-namespace).
:::

## Una sola chiamata: `getRollupAdvice` {#one-call-getrollupadvice}

```ts
import { createRdkClient, getRollupAdvice } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });
const advice = await getRollupAdvice(rdk, "my-rollup");

console.log(advice.warnings);    // services that could not be reached (all of them today)
console.log(advice.suggestions); // plain-language suggestions, when data is available
```

Il risultato contiene anche `feeEstimate`, `networkRecommendations`, `fraudInvestigations` e `rlAgentStatus` quando il servizio corrispondente risponde.

## CLI {#cli}

```bash
qorollup advise my-rollup
qorollup advise my-rollup --json
```

I servizi non raggiungibili sono elencati come avvisi anziché come errori, e l'output leggibile può comunque stampare una riga "no issues flagged" quando nulla era raggiungibile — leggi gli avvisi. Vedi [Distribuire un Rollup](/rollups/deploying-a-rollup) per la CLI operatore `qorollup`.
