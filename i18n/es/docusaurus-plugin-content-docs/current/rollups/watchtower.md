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

:::caution Etapa temprana: todavía nada que vigilar
El Watchtower lee los lotes a través del cliente REST del RDK, y las rutas `/qorechain/rdk/v1/…` se sirven en ambas redes. No se ha creado ningún rollup en ninguna de las dos redes (comprobado el 27 de octubre de 2026), así que todavía no hay nada que vigilar y el Watchtower no se ha ejecutado contra un lote real. En `@qorechain/rdk` 0.5.0 su lógica de fecha límite era incorrecta (leía una altura de bloque como una marca de tiempo Unix, por lo que `onDeadline` se disparaba en cuanto se veía un lote por primera vez) y solo leía la primera página de 50 lotes; **la 0.6.0 corrigió ambas cosas** (véase abajo). Usa la 0.6.1, la versión actual.
:::

## `watchBatches`

```ts
import { createRdkClient, watchBatches } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });

// `tx` is a signing client that produces the hybrid (post-quantum) signature
// the networks require: pass `pqcKeypair` to `RdkClient.connectTx` (see
// "RDK 0.6.1: changes and limits" in Deploying a Rollup). Without it the
// transaction is classical-only and refused.
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

  // Called once per batch when its challenge window is still open and close to
  // closing: within `deadlineWarnSecs` seconds (time-based window) or
  // `deadlineWarnBlocks` blocks (block-count window). `window` says which rule
  // applies and what is left.
  onDeadline: ({ batch, window }) => {
    console.warn("challenge window closing for batch", batch.batchIndex, window);
  },
});

// Later:
watcher.stop();
```

El framework expone:

- **nuevos lotes** mediante `onBatch`,
- **fechas límite de la ventana de desafío** mediante `onDeadline`, y
- **lotes inválidos** (aquellos en los que tu `validate` devolvió `false`) mediante `onInvalid`.

Desde la 0.6.0 (y en la 0.6.1) recorre todas las páginas de la lista de lotes de un rollup, vuelve a juzgar un lote a medida que se acerca su fecha límite (sigue sondeando hacia adelante desde el lote más antiguo cuya ventana sigue abierta, en lugar de juzgar cada lote una sola vez al verlo por primera vez) y mide cada ventana contra la punta de la cadena (`getChainTip`, el estado del nodo) en lugar del reloj local. Un lote que ya está `finalized` no se valida ni genera avisos.

Conectar `onInvalid` a un desafío convierte al Watchtower en un
auto-challenger completo; déjalo sin definir para ejecutarlo en modo de solo
observación.

:::note Ventana de desafío
La cadena mide la ventana de un lote de una de dos maneras, y `batchChallengeWindow` (usada por el Watchtower y por la comprobación de salud que hay detrás de `qorollup status`) indica cuál. **Ventana por recuento de bloques, la regla de mainnet para los lotes enviados antes de la altura 3,742,566 (v3.2.3 y anteriores):** la ventana son los segundos configurados del rollup convertidos a 6 segundos fijos por bloque, **100,800 bloques** para el valor por defecto de 604,800, contados desde la altura `submitted_at` del lote; el tiempo real sigue al tiempo de bloque, así que es más corto que «7 días» con los bloques de ≈3.2 s de mainnet. El paquete informa `open` y `finalizable` por separado, porque bajo la regla que implementa un bloque es ambas cosas a la vez (un desafío cuenta como abierto mientras `height - submitted_at <= window`, y es finalizable desde `height - submitted_at >= window`). **Ventana basada en tiempo, desde v3.2.4 (la testnet desde la altura 8,337,253, mainnet desde la altura 3,742,566):** un lote enviado a partir de la altura de la actualización registra su tiempo de bloque y su ventana es esa cantidad de segundos de tiempo de bloque. El Watchtower usa la ventana propia del rollup cuando el nodo la informa (el paquete lo documenta como v3.2.4 y posterior); en caso contrario recurre a la ventana por defecto del módulo, así que pasa `challengeWindowSecs` para un rollup que configuró la suya. Publicar un desafío también requiere la fianza de desafío del rollup (1,000 QOR para los presets `nft` y `custom`). La ventana por defecto del módulo es de 604,800 segundos en la mainnet y de 3,600 segundos (una hora) en la testnet (leído de `GET /qorechain/rdk/v1/params` el 27 de octubre de 2026), así que la misma configuración de rollup tiene una ventana mucho más corta en la testnet.
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
