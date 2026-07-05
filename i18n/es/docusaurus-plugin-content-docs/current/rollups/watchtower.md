---
slug: /rollups/watchtower
title: Watchtower
sidebar_label: Watchtower
sidebar_position: 9
---

# Watchtower

El Watchtower es un framework de desafío automático (auto-challenger) para rollups
optimistas. Sigue los lotes de liquidación de un rollup, expone cada nuevo lote y
la fecha límite de su ventana de desafío y — cuando **tu** predicado de validez
rechaza un lote — se lo entrega a tu callback `onInvalid` para que puedas
conectar un desafío.

El framework observa y decide *cuándo*; **tú aportas la comprobación de validez**.
El Watchtower nunca decide por sí solo que un lote es fraudulento — llama a tu
función `validate` y actúa según lo que devuelvas.

## `watchBatches`

```ts
import { createRdkClient, watchBatches, challengeBatch } from "@qorechain/rdk";

// The public qore.host REST + RPC endpoints are baked into the presets
// (RDK ≥ 0.4.2); the RPC endpoint is what broadcasts a challenge. Pass
// `endpoints` only to target your own node.
const rdk = createRdkClient({ network: "testnet" });

const watcher = watchBatches(rdk, "my-roll", {
  onBatch: (batch) => {
    console.log("new batch", batch.index);
  },

  // Your validity predicate. Return false to flag the batch as invalid.
  validate: async (batch) => {
    return await isBatchValid(batch); // your logic
  },

  // Called when validate() returns false — wire it to a challenge.
  onInvalid: async (batch) => {
    await challengeBatch(rdk, "my-roll", batch.index /* + your fraud proof */);
  },

  // Called as a batch approaches the end of its challenge window.
  onDeadline: (batch) => {
    console.warn("challenge window closing for batch", batch.index);
  },
});

// Later:
watcher.stop();
```

El framework expone:

- **nuevos lotes** mediante `onBatch`,
- **fechas límite de la ventana de desafío** mediante `onDeadline`, y
- **lotes inválidos** (aquellos en los que tu `validate` devolvió `false`) mediante `onInvalid`.

Conectar `onInvalid` a `challengeBatch` convierte al Watchtower en un
auto-challenger completo; déjalo sin definir para ejecutarlo en modo de solo
observación.

## CLI

```bash
qorollup watchtower my-roll
```

`watchtower` ejecuta el framework desde la línea de comandos, imprimiendo los
nuevos lotes y las fechas límite de la ventana de desafío hasta que pulses
Ctrl-C. Consulta
[Desplegar un Rollup](/rollups/deploying-a-rollup) para ver la CLI completa de
operador `qorollup`.
