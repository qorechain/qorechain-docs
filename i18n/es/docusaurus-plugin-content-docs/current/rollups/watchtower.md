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

:::caution Etapa temprana: necesita las rutas REST del RDK
El Watchtower lee los lotes a través del cliente REST del RDK. Las rutas REST `/qorechain/rdk/v1/…` hoy no se sirven en mainnet, por lo que el Watchtower todavía no puede ejecutarse contra mainnet. No se ha creado ningún rollup en ninguna de las dos redes, así que no hay nada que vigilar.
:::

## `watchBatches`

```ts
import { createRdkClient, watchBatches } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });

// `tx` is a signing client that produces the hybrid (post-quantum) signature
// the networks require. See "Signing with the published clients" in
// Deploying a Rollup — the classical-only client in @qorechain/rdk 0.4.4
// cannot get a challenge accepted.
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

  // Called as a batch approaches the end of its challenge window.
  onDeadline: ({ batch, secondsRemaining }) => {
    console.warn("challenge window closing for batch", batch.batchIndex, secondsRemaining);
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
La fecha límite que informa el Watchtower usa la ventana de desafío convertida a bloques a 6 segundos por bloque (100,800 bloques por defecto), por lo que con los bloques de ≈3.2 s de mainnet la ventana real es más corta que "7 días". Publicar un desafío también requiere la fianza de desafío del rollup (1,000 QOR para los presets `nft` y `custom`).
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
