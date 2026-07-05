---
slug: /rollups/qcai-copilot
title: Copilot QCAI per Rollup
sidebar_label: Copilot QCAI
sidebar_position: 7
---

# Copilot QCAI per Rollup

Il Copilot QCAI per Rollup raccoglie tutto ciò che i servizi di advisory della
rete sanno su un rollup e lo condensa in un'unica lettura in linguaggio
chiaro: una stima delle commissioni in tempo reale, le raccomandazioni di rete,
eventuali indagini antifrode che fanno riferimento al rollup, lo stato
dell'agente di reinforcement learning e un breve elenco di suggerimenti su cui
puoi intervenire.

È **best-effort**. I servizi di advisory sono infrastruttura opzionale — se uno
non è raggiungibile, il Copilot degrada in modo controllato, omettendo quella
sezione e registrando un avviso invece di far fallire l'intera chiamata.
Ottieni sempre un risultato.

## Una sola chiamata: `getRollupAdvice`

```ts
import { createRdkClient, getRollupAdvice } from "@qorechain/rdk";

// The public qore.host endpoints (REST + the qor_ JSON-RPC endpoint used for
// the RL agent reads) are baked into the presets since RDK 0.4.2 — no manual
// endpoint config needed; pass `endpoints` only to target your own node.
const rdk = createRdkClient({ network: "testnet" });

const advice = await getRollupAdvice(rdk, "my-roll");

console.log(advice.feeEstimate);            // live fee estimate (if reachable)
console.log(advice.networkRecommendations); // tuning recommendations
console.log(advice.fraudInvestigations);    // investigations referencing this rollup
console.log(advice.rlAgentStatus);          // RL agent status (qor_ JSON-RPC)
console.log(advice.suggestions);            // plain-language, actionable
console.log(advice.warnings);               // services that were unreachable
```

## Le letture sottostanti

`getRollupAdvice` aggrega un insieme di metodi di sola lettura che puoi anche
chiamare direttamente. I metodi REST di advisory si trovano sotto
`/qorechain/ai/v1/...`:

- `getFeeEstimate(...)` — stima corrente delle commissioni.
- `getNetworkRecommendations(...)` — raccomandazioni di tuning a livello di rete.
- `getFraudInvestigations(...)` / `getFraudInvestigation(id)` — indagini
  aperte e una singola indagine tramite id.
- `getCircuitBreakers(...)` — stato advisory dei circuit breaker.

Le letture di reinforcement learning usano il namespace JSON-RPC `qor_*`:

- `getRLAgentStatus()` — lo stato corrente dell'agente.
- `getRLObservation()` — l'osservazione più recente.
- `getRLReward()` — il segnale di reward più recente.

Poiché si tratta esclusivamente di letture, al Copilot serve solo un endpoint
REST (e un endpoint EVM / JSON-RPC `qor_` per le letture RL) — nessun signer.

## CLI

```bash
qorollup advise my-roll
qorollup advise my-roll --json
```

`advise` stampa il parere aggregato, con i servizi non raggiungibili segnalati
come avvisi anziché come errori. Consulta [Distribuire un Rollup](/rollups/deploying-a-rollup)
per la CLI operatore `qorollup` completa.
