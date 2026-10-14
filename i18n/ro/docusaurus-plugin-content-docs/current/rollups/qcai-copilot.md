---
slug: /rollups/qcai-copilot
title: QCAI Rollup Copilot
sidebar_label: QCAI Copilot
sidebar_position: 7
---

# QCAI Rollup Copilot

QCAI Rollup Copilot din RDK este un ajutor doar pentru citire care **încearcă** să adune datele de consultanță ale rețelei pentru un singur rollup — o estimare a comisioanelor, recomandări de rețea, investigații de fraudă care fac referire la rollup, statusul agentului de învățare prin întărire — și să le condenseze într-o singură citire în limbaj simplu, cu o listă scurtă de sugestii.

:::caution Indisponibil pe endpoint-urile publice
Serviciile de consultanță pe care le citește (rutele REST `/qorechain/ai/v1/…` și namespace-ul JSON-RPC `qor_*`) **nu sunt servite** în prezent de endpoint-urile publice `qore.host` de pe mainnet sau testnet, așa că fiecare secțiune revine ca avertisment. Copilot funcționează prin design în regim best-effort: nu eșuează niciodată, dar un rezultat gol **nu** înseamnă că rollup-ul a fost verificat și găsit sănătos. Nu-l folosi ca semnal de siguranță până când aceste servicii nu sunt expuse. Vezi [namespace-ul `qor_`](/api-reference/json-rpc-qor_-namespace).
:::

## Un singur apel: `getRollupAdvice` {#one-call-getrollupadvice}

```ts
import { createRdkClient, getRollupAdvice } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });
const advice = await getRollupAdvice(rdk, "my-rollup");

console.log(advice.warnings);    // services that could not be reached (all of them today)
console.log(advice.suggestions); // plain-language suggestions, when data is available
```

Rezultatul conține și `feeEstimate`, `networkRecommendations`, `fraudInvestigations` și `rlAgentStatus` atunci când serviciul corespunzător răspunde.

## CLI {#cli}

```bash
qorollup advise my-rollup
qorollup advise my-rollup --json
```

Serviciile inaccesibile sunt listate ca avertismente, nu ca erori, iar ieșirea lizibilă pentru om poate afișa totuși o linie „no issues flagged” atunci când nimic nu a putut fi accesat — citește avertismentele. Vezi [Implementarea unui Rollup](/rollups/deploying-a-rollup) pentru CLI-ul de operator `qorollup`.
