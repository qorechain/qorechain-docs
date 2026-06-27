---
slug: /rollups/qcai-copilot
title: QCAI Rollup Copilot
sidebar_label: QCAI Copilot
sidebar_position: 7
---

# QCAI Rollup Copilot

Il QCAI Rollup Copilot raccoglie tutto ciò che i servizi advisory della rete
sanno su un singolo rollup e lo riassume in un'unica lettura in linguaggio
chiaro: una stima delle commissioni in tempo reale, le raccomandazioni di rete,
eventuali indagini sulle frodi che fanno riferimento al rollup, lo stato
dell'agente di reinforcement learning e un breve elenco di suggerimenti su cui
puoi intervenire.

È **best-effort**. I servizi advisory sono infrastruttura opzionale — se uno è
irraggiungibile, il Copilot degrada con grazia, eliminando quella sezione e
registrando un avviso invece di far fallire l'intera chiamata. Ottieni sempre un
risultato.

## Una sola chiamata: `getRollupAdvice`

```ts
import { createRdkClient, getRollupAdvice } from "@qorechain/rdk";

const rdk = createRdkClient({
  endpoints: {
    rest: "https://rest.testnet.example",
    evmRpc: "https://evm.testnet.example", // qor_ JSON-RPC for RL agent reads
  },
});

const advice = await getRollupAdvice(rdk, "my-roll");

console.log(advice.feeEstimate);            // live fee estimate (if reachable)
console.log(advice.networkRecommendations); // tuning recommendations
console.log(advice.fraudInvestigations);    // investigations referencing this rollup
console.log(advice.rlAgentStatus);          // RL agent status (qor_ JSON-RPC)
console.log(advice.suggestions);            // plain-language, actionable
console.log(advice.warnings);               // services that were unreachable
```

## Le letture sottostanti

`getRollupAdvice` aggrega un insieme di metodi in sola lettura che puoi anche
chiamare direttamente. I metodi REST advisory si trovano sotto
`/qorechain/ai/v1/...`:

- `getFeeEstimate(...)` — stima corrente delle commissioni.
- `getNetworkRecommendations(...)` — raccomandazioni di tuning a livello di rete.
- `getFraudInvestigations(...)` / `getFraudInvestigation(id)` — indagini aperte
  e una singola indagine tramite id.
- `getCircuitBreakers(...)` — stato advisory dei circuit breaker.

Le letture di reinforcement learning usano il namespace JSON-RPC `qor_*`:

- `getRLAgentStatus()` — lo stato corrente dell'agente.
- `getRLObservation()` — l'osservazione più recente.
- `getRLReward()` — l'ultimo segnale di reward.

Poiché si tratta tutte di letture, al Copilot serve solo un endpoint REST (e un
endpoint EVM / JSON-RPC `qor_` per le letture RL) — nessun signer.

## CLI

```bash
qorollup advise my-roll
qorollup advise my-roll --json
```

`advise` stampa l'advisory aggregata, con i servizi irraggiungibili evidenziati
come avvisi anziché errori. Vedi [Deploying a Rollup](/rollups/deploying-a-rollup)
per la CLI operatore `qorollup` completa.
