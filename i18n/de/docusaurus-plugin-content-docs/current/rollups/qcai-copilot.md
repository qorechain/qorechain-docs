---
slug: /rollups/qcai-copilot
title: QCAI Rollup Copilot
sidebar_label: QCAI Copilot
sidebar_position: 7
---

# QCAI Rollup Copilot

Der QCAI Rollup Copilot im RDK ist ein schreibgeschützter Helfer, der **versucht**, die Beratungsdaten des Netzwerks zu einem Rollup zu sammeln — eine Gebührenschätzung, Netzwerkempfehlungen, Betrugsuntersuchungen, die das Rollup referenzieren, den Status des Reinforcement-Learning-Agenten — und sie zu einer einzigen Ansicht in einfacher Sprache mit einer kurzen Liste von Vorschlägen zusammenzufassen.

:::caution Auf den öffentlichen Endpunkten nicht verfügbar
Die Beratungsdienste, die er liest (die REST-Routen `/qorechain/ai/v1/…` und der JSON-RPC-Namensraum `qor_*`), werden von den öffentlichen `qore.host`-Endpunkten im Mainnet und Testnet derzeit **nicht bereitgestellt**, sodass jeder Abschnitt als Warnung zurückkommt. Der Copilot arbeitet entwurfsgemäß nach bestem Bemühen (Best-Effort): Er schlägt nie fehl, aber ein leeres Ergebnis bedeutet **nicht**, dass das Rollup geprüft und als gesund befunden wurde. Verwenden Sie ihn nicht als Sicherheitssignal, bis diese Dienste bereitgestellt werden. Siehe [den `qor_`-Namensraum](/api-reference/json-rpc-qor_-namespace).
:::

## Ein Aufruf: `getRollupAdvice` {#one-call-getrollupadvice}

```ts
import { createRdkClient, getRollupAdvice } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });
const advice = await getRollupAdvice(rdk, "my-rollup");

console.log(advice.warnings);    // services that could not be reached (all of them today)
console.log(advice.suggestions); // plain-language suggestions, when data is available
```

Das Ergebnis enthält außerdem `feeEstimate`, `networkRecommendations`, `fraudInvestigations` und `rlAgentStatus`, sofern der jeweilige Dienst antwortet.

## CLI {#cli}

```bash
qorollup advise my-rollup
qorollup advise my-rollup --json
```

Nicht erreichbare Dienste werden als Warnungen statt als Fehler aufgeführt, und die menschenlesbare Ausgabe kann dennoch eine Zeile „no issues flagged" ausgeben, wenn nichts erreichbar war — lesen Sie die Warnungen. Siehe [Ein Rollup bereitstellen](/rollups/deploying-a-rollup) für die `qorollup`-Betreiber-CLI.
