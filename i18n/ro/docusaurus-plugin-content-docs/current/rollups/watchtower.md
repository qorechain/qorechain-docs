---
slug: /rollups/watchtower
title: Watchtower
sidebar_label: Watchtower
sidebar_position: 9
---

# Watchtower

Watchtower este un cadru de auto-contestare pentru rollup-urile optimiste. Acesta
urmărește loturile de decontare ale unui rollup, evidențiază fiecare lot nou și
termenul-limită al ferestrei sale de contestare și — atunci când predicatul **tău**
de validitate respinge un lot — îl predă callback-ului tău `onInvalid`, astfel
încât să poți configura o contestare.

Cadrul urmărește și decide *când*; **tu furnizezi verificarea de validitate**.
Watchtower nu decide niciodată de unul singur că un lot este fraudulos — apelează
funcția ta `validate` și acționează pe baza a ceea ce returnezi.

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

Cadrul evidențiază:

- **loturi noi** prin `onBatch`,
- **termene-limită ale ferestrei de contestare** prin `onDeadline` și
- **loturi invalide** (pentru care `validate` a returnat `false`) prin `onInvalid`.

Conectarea `onInvalid` la `challengeBatch` transformă Watchtower într-un
auto-contestator complet; lasă-l neconfigurat pentru a rula în mod
exclusiv de observare.

## CLI

```bash
qorollup watchtower my-roll
```

`watchtower` rulează cadrul din linia de comandă, afișând loturile noi și
termenele-limită ale ferestrei de contestare până când apeși Ctrl-C. Vezi
[Implementarea unui rollup](/rollups/deploying-a-rollup) pentru întregul CLI
de operator `qorollup`.
