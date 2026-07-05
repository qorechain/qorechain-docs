---
slug: /rollups/qcai-copilot
title: QCAI Rollup Copilot
sidebar_label: QCAI Copilot
sidebar_position: 7
---

# QCAI Rollup Copilot

Der QCAI Rollup Copilot sammelt alles, was die Beratungsdienste des Netzwerks
über ein Rollup wissen, und fasst es zu einer einzigen Ansicht in einfacher
Sprache zusammen: eine Live-Gebührenschätzung, Netzwerkempfehlungen, etwaige
Betrugsuntersuchungen, die das Rollup referenzieren, den Status des
Reinforcement-Learning-Agenten sowie eine kurze Liste umsetzbarer Vorschläge.

Er arbeitet **nach bestem Bemühen (Best-Effort)**. Die Beratungsdienste sind
optionale Infrastruktur — falls einer nicht erreichbar ist, degradiert der
Copilot kontrolliert: Er lässt den betreffenden Abschnitt weg und protokolliert
eine Warnung, anstatt den gesamten Aufruf fehlschlagen zu lassen. Sie erhalten
stets ein Ergebnis.

## Ein Aufruf: `getRollupAdvice`

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

## Die zugrunde liegenden Lesezugriffe

`getRollupAdvice` aggregiert eine Reihe schreibgeschützter Methoden, die Sie
auch direkt aufrufen können. Die beratenden REST-Methoden liegen unter
`/qorechain/ai/v1/...`:

- `getFeeEstimate(...)` — aktuelle Gebührenschätzung.
- `getNetworkRecommendations(...)` — Tuning-Empfehlungen auf Netzwerkebene.
- `getFraudInvestigations(...)` / `getFraudInvestigation(id)` — offene
  Untersuchungen und eine einzelne Untersuchung anhand der ID.
- `getCircuitBreakers(...)` — beratender Circuit-Breaker-Zustand.

Die Reinforcement-Learning-Lesezugriffe nutzen den `qor_*`-JSON-RPC-Namensraum:

- `getRLAgentStatus()` — der aktuelle Status des Agenten.
- `getRLObservation()` — die jüngste Beobachtung.
- `getRLReward()` — das jüngste Reward-Signal.

Da dies alles Lesezugriffe sind, benötigt der Copilot lediglich einen
REST-Endpunkt (und einen EVM- / `qor_`-JSON-RPC-Endpunkt für die
RL-Lesezugriffe) — keinen Signer.

## CLI

```bash
qorollup advise my-roll
qorollup advise my-roll --json
```

`advise` gibt die aggregierte Beratung aus, wobei nicht erreichbare Dienste als
Warnungen statt als Fehler ausgewiesen werden. Siehe
[Ein Rollup bereitstellen](/rollups/deploying-a-rollup) für die vollständige
`qorollup`-Betreiber-CLI.
