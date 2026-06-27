---
slug: /rollups/qcai-copilot
title: QCAI Rollup Copilot
sidebar_label: QCAI Copilot
sidebar_position: 7
---

# QCAI Rollup Copilot

El QCAI Rollup Copilot reúne todo lo que los servicios de asesoramiento de la red
saben sobre un rollup y lo condensa en una sola lectura en lenguaje sencillo: una
estimación de comisiones en vivo, recomendaciones de red, cualquier investigación
de fraude que haga referencia al rollup, el estado del agente de aprendizaje por
refuerzo y una breve lista de sugerencias sobre las que puedes actuar.

Es de **mejor esfuerzo**. Los servicios de asesoramiento son infraestructura opcional — si uno
no está accesible, el Copilot se degrada con elegancia, omitiendo esa sección y
registrando una advertencia en lugar de hacer fallar toda la llamada. Siempre obtienes un resultado.

## Una sola llamada: `getRollupAdvice`

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

## Las lecturas subyacentes

`getRollupAdvice` agrega un conjunto de métodos de solo lectura que también puedes llamar
directamente. Los métodos REST de asesoramiento residen bajo `/qorechain/ai/v1/...`:

- `getFeeEstimate(...)` — estimación de comisiones actual.
- `getNetworkRecommendations(...)` — recomendaciones de ajuste a nivel de red.
- `getFraudInvestigations(...)` / `getFraudInvestigation(id)` — investigaciones
  abiertas y una única investigación por id.
- `getCircuitBreakers(...)` — estado consultivo del disyuntor.

Las lecturas de aprendizaje por refuerzo usan el espacio de nombres JSON-RPC `qor_*`:

- `getRLAgentStatus()` — el estado actual del agente.
- `getRLObservation()` — la observación más reciente.
- `getRLReward()` — la señal de recompensa más reciente.

Como todas son lecturas, el Copilot solo necesita un endpoint REST (y un endpoint EVM
/ `qor_` JSON-RPC para las lecturas de RL) — sin firmante.

## CLI

```bash
qorollup advise my-roll
qorollup advise my-roll --json
```

`advise` imprime el asesoramiento agregado, con los servicios inaccesibles expuestos como
advertencias en lugar de errores. Consulta [Desplegar un Rollup](/rollups/deploying-a-rollup)
para la CLI completa de operador `qorollup`.
