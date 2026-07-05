---
slug: /rollups/qcai-copilot
title: Copiloto de Rollup QCAI
sidebar_label: Copiloto QCAI
sidebar_position: 7
---

# Copiloto de Rollup QCAI

El Copiloto de Rollup QCAI reúne todo lo que los servicios de asesoría de la red
saben sobre un rollup y lo condensa en una única lectura en lenguaje sencillo:
una estimación de comisiones en vivo, recomendaciones de red, cualquier
investigación de fraude que haga referencia al rollup, el estado del agente de
aprendizaje por refuerzo y una breve lista de sugerencias sobre las que puedes
actuar.

Funciona según el principio de **mejor esfuerzo**. Los servicios de asesoría son
infraestructura opcional: si alguno no está disponible, el Copiloto se degrada
con elegancia, omitiendo esa sección y registrando una advertencia en lugar de
hacer fallar toda la llamada. Siempre obtienes un resultado.

## Una sola llamada: `getRollupAdvice`

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

## Las lecturas subyacentes

`getRollupAdvice` agrega un conjunto de métodos de solo lectura que también
puedes invocar directamente. Los métodos REST de asesoría se encuentran bajo
`/qorechain/ai/v1/...`:

- `getFeeEstimate(...)` — estimación de comisiones actual.
- `getNetworkRecommendations(...)` — recomendaciones de ajuste a nivel de red.
- `getFraudInvestigations(...)` / `getFraudInvestigation(id)` — investigaciones
  abiertas y una investigación individual por id.
- `getCircuitBreakers(...)` — estado de los circuit breakers de asesoría.

Las lecturas de aprendizaje por refuerzo usan el espacio de nombres JSON-RPC
`qor_*`:

- `getRLAgentStatus()` — el estado actual del agente.
- `getRLObservation()` — la observación más reciente.
- `getRLReward()` — la señal de recompensa más reciente.

Dado que todas estas operaciones son lecturas, el Copiloto solo necesita un
endpoint REST (y un endpoint EVM / JSON-RPC `qor_` para las lecturas de RL) —
no requiere firmante.

## CLI

```bash
qorollup advise my-roll
qorollup advise my-roll --json
```

`advise` imprime el consejo agregado, mostrando los servicios no disponibles
como advertencias en lugar de errores. Consulta
[Desplegar un Rollup](/rollups/deploying-a-rollup) para ver la CLI completa de
operador `qorollup`.
