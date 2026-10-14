---
slug: /rollups/qcai-copilot
title: Copiloto de Rollup QCAI
sidebar_label: Copiloto QCAI
sidebar_position: 7
---

# Copiloto de Rollup QCAI

El Copiloto de Rollup QCAI del RDK es un asistente de solo lectura que **intenta** reunir los datos de asesoría de la red sobre un rollup — una estimación de comisiones, recomendaciones de red, investigaciones de fraude que hacen referencia al rollup, el estado del agente de aprendizaje por refuerzo — y condensarlos en una única lectura en lenguaje sencillo con una breve lista de sugerencias.

:::caution No disponible en los endpoints públicos
Los servicios de asesoría que lee (las rutas REST `/qorechain/ai/v1/…` y el espacio de nombres JSON-RPC `qor_*`) **no están servidos** actualmente por los endpoints públicos `qore.host` en mainnet ni en testnet, por lo que cada sección devuelve una advertencia. El Copiloto funciona por diseño según el principio de mejor esfuerzo: nunca falla, pero un resultado vacío **no** significa que el rollup se haya comprobado y se haya encontrado sano. No lo uses como señal de seguridad hasta que esos servicios estén expuestos. Consulta [el espacio de nombres `qor_`](/api-reference/json-rpc-qor_-namespace).
:::

## Una sola llamada: `getRollupAdvice` {#one-call-getrollupadvice}

```ts
import { createRdkClient, getRollupAdvice } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });
const advice = await getRollupAdvice(rdk, "my-rollup");

console.log(advice.warnings);    // services that could not be reached (all of them today)
console.log(advice.suggestions); // plain-language suggestions, when data is available
```

El resultado también incluye `feeEstimate`, `networkRecommendations`, `fraudInvestigations` y `rlAgentStatus` cuando el servicio correspondiente responde.

## CLI {#cli}

```bash
qorollup advise my-rollup
qorollup advise my-rollup --json
```

Los servicios no disponibles se muestran como advertencias en lugar de errores, y la salida legible por personas aún puede imprimir una línea "no issues flagged" cuando no se pudo alcanzar nada: lee las advertencias. Consulta [Desplegar un Rollup](/rollups/deploying-a-rollup) para ver la CLI de operador `qorollup`.
