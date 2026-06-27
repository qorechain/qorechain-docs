---
slug: /rollups/watchtower
title: Watchtower
sidebar_label: Watchtower
sidebar_position: 9
---

# Watchtower

El Watchtower es un framework de auto-impugnación para rollups optimistas. Sigue
los lotes de liquidación de un rollup, expone cada nuevo lote y la fecha límite de
su ventana de impugnación y —cuando **tu** predicado de validez rechaza un lote—
lo entrega a tu callback `onInvalid` para que puedas conectar una impugnación.

El framework observa y decide *cuándo*; **tú proporcionas la comprobación de
validez**. El Watchtower nunca decide por sí mismo que un lote es fraudulento:
llama a tu función `validate` y actúa según lo que devuelvas.

## `watchBatches`

```ts
import { createRdkClient, watchBatches, challengeBatch } from "@qorechain/rdk";

const rdk = createRdkClient({
  endpoints: {
    rest: "https://rest.testnet.example",
    rpc: "https://rpc.testnet.example", // needed to broadcast a challenge
  },
});

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
- **fechas límite de la ventana de impugnación** mediante `onDeadline`, y
- **lotes inválidos** (en los que tu `validate` devolvió `false`) mediante `onInvalid`.

Conectar `onInvalid` a `challengeBatch` convierte al Watchtower en un
auto-impugnador completo; déjalo sin configurar para ejecutarlo en modo de solo
observación.

## CLI

```bash
qorollup watchtower my-roll
```

`watchtower` ejecuta el framework desde la línea de comandos, imprimiendo nuevos
lotes y fechas límite de la ventana de impugnación hasta que pulses Ctrl-C. Consulta
[Desplegar un Rollup](/rollups/deploying-a-rollup) para conocer la CLI completa del
operador `qorollup`.
