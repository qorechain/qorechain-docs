---
slug: /rollups/qcai-copilot
title: QCAI Rollup Copilot
sidebar_label: QCAI Copilot
sidebar_position: 7
---

# QCAI Rollup Copilot

QCAI Rollup Copilot adună tot ceea ce serviciile de consultanță ale rețelei știu
despre un singur rollup și le condensează într-o singură citire în limbaj simplu: o estimare
live a comisioanelor, recomandări de rețea, orice investigații de fraudă care fac referire la
rollup, statusul agentului de învățare prin întărire și o listă scurtă de
sugestii pe baza cărora poți acționa.

Funcționează în regim **best-effort**. Serviciile de consultanță sunt infrastructură opțională — dacă unul
este inaccesibil, Copilot se degradează grațios, eliminând acea secțiune și
înregistrând un avertisment în loc să eșueze întregul apel. Întotdeauna obții un rezultat.

## Un singur apel: `getRollupAdvice`

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

## Citirile subiacente

`getRollupAdvice` agregă un set de metode read-only pe care le poți apela și
direct. Metodele REST de consultanță se află sub `/qorechain/ai/v1/...`:

- `getFeeEstimate(...)` — estimarea curentă a comisioanelor.
- `getNetworkRecommendations(...)` — recomandări de ajustare la nivel de rețea.
- `getFraudInvestigations(...)` / `getFraudInvestigation(id)` — investigații
  deschise și o singură investigație după id.
- `getCircuitBreakers(...)` — starea consultativă a întrerupătoarelor de circuit.

Citirile de învățare prin întărire folosesc namespace-ul JSON-RPC `qor_*`:

- `getRLAgentStatus()` — statusul curent al agentului.
- `getRLObservation()` — cea mai recentă observație.
- `getRLReward()` — cel mai recent semnal de recompensă.

Deoarece toate acestea sunt citiri, Copilot are nevoie doar de un endpoint REST (și un endpoint EVM
/ `qor_` JSON-RPC pentru citirile RL) — fără un semnatar.

## CLI

```bash
qorollup advise my-roll
qorollup advise my-roll --json
```

`advise` afișează consultanța agregată, cu serviciile inaccesibile scoase la suprafață ca
avertismente, nu ca erori. Vezi [Deploying a Rollup](/rollups/deploying-a-rollup)
pentru CLI-ul complet de operator `qorollup`.
