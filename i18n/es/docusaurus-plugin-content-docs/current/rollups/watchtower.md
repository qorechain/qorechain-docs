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

:::caution Etapa temprana: nada que vigilar, y las alertas de fecha límite de la 0.5.0 son erróneas
El Watchtower lee los lotes a través del cliente REST del RDK, y las rutas `/qorechain/rdk/v1/…` se sirven en ambas redes. No se ha creado ningún rollup en ninguna de las dos redes (comprobado el 20 de octubre de 2026), así que todavía no hay nada que vigilar. En `@qorechain/rdk` 0.5.0 la lógica de la fecha límite de la ventana de desafío tampoco es fiable: el `submittedAt` de un lote es una **altura de bloque**, pero el Watchtower (y la comprobación de salud que hay detrás de `qorollup status`) le suma la ventana en segundos y compara la suma con el reloj real, por lo que `secondsRemaining` carece de sentido y `onDeadline` se dispara en cuanto se ve un lote por primera vez. No uses `onDeadline` ni la cuenta atrás para tomar decisiones; calcula tú mismo la fecha límite (consulta la nota de abajo). El observador también lee solo la primera página de lotes (50).
:::

## `watchBatches`

```ts
import { createRdkClient, watchBatches } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });

// `tx` is a signing client that produces the hybrid (post-quantum) signature
// the networks require: pass `pqcKeypair` to `RdkClient.connectTx` (see
// "RDK 0.5.0 limits" in Deploying a Rollup). Without it the transaction is
// classical-only and refused.
declare const tx: {
  challengeBatch(input: { rollupId: string; batchIndex: number; proof: string }): Promise<unknown>;
};

const watcher = watchBatches(rdk, "my-rollup", {
  onBatch: (batch) => {
    console.log("new batch", batch.batchIndex);
  },

  // Your validity predicate. Return false to flag the batch as invalid.
  validate: async (batch) => {
    return await isBatchValid(batch); // your logic
  },

  // Called when validate() returns false — wire it to a challenge.
  onInvalid: async ({ batch }) => {
    await tx.challengeBatch({
      rollupId: "my-rollup",
      batchIndex: batch.batchIndex,
      proof: myFraudProofHex, // hex fraud proof
    });
  },

  // Called when a batch is within `deadlineWarnSecs` of its deadline. In 0.5.0 the
  // deadline mixes a block height with the wall clock, so treat this as unreliable.
  onDeadline: ({ batch, secondsRemaining }) => {
    console.warn("challenge window alert for batch", batch.batchIndex, secondsRemaining);
  },
});

// Later:
watcher.stop();
```

El framework expone:

- **nuevos lotes** mediante `onBatch`,
- **fechas límite de la ventana de desafío** mediante `onDeadline`, y
- **lotes inválidos** (aquellos en los que tu `validate` devolvió `false`) mediante `onInvalid`.

Conectar `onInvalid` a un desafío convierte al Watchtower en un
auto-challenger completo; déjalo sin definir para ejecutarlo en modo de solo
observación.

:::note Ventana de desafío
Calcula la fecha límite de un lote en bloques, no en segundos: `submitted_at` (una altura de bloque) más la ventana. **En mainnet (v3.2.3)** la ventana es el valor por defecto de 604,800 «segundos» convertido a 6 segundos fijos por bloque, es decir **100,800 bloques** (el tiempo real sigue al tiempo de bloque, así que es más corto que «7 días» con los bloques de ≈3.2 s de mainnet). **Solo en la testnet (v3.2.4)**, un lote enviado a partir de la altura 8,337,253 recibe una ventana medida en segundos de tiempo de bloque. Publicar un desafío también requiere la fianza de desafío del rollup (1,000 QOR para los presets `nft` y `custom`).
:::

## CLI

```bash
qorollup watchtower my-rollup
```

`watchtower` ejecuta el framework desde la línea de comandos, imprimiendo los
nuevos lotes y las fechas límite de la ventana de desafío hasta que pulses
Ctrl-C. Consulta
[Desplegar un Rollup](/rollups/deploying-a-rollup) para ver la CLI completa de
operador `qorollup`.
