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

:::caution Stadiu incipient: necesită rutele REST RDK
Watchtower citește loturile prin clientul REST RDK. Rutele REST `/qorechain/rdk/v1/…` nu sunt servite pe mainnet în prezent, deci Watchtower nu poate rula încă pe mainnet. Nu a fost creat niciun rollup pe niciuna dintre rețele, așa că nu există nimic de urmărit.
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

Cadrul evidențiază:

- **loturi noi** prin `onBatch`,
- **termene-limită ale ferestrei de contestare** prin `onDeadline` și
- **loturi invalide** (pentru care `validate` a returnat `false`) prin `onInvalid`.

Conectarea `onInvalid` la o contestare transformă Watchtower într-un
auto-contestator complet; lasă-l neconfigurat pentru a rula în mod
exclusiv de observare.

:::note Fereastra de contestare
Termenul-limită raportat de Watchtower folosește fereastra de contestare convertită în blocuri la 6 secunde per bloc (100.800 de blocuri implicit), deci la blocurile de ≈3,2 s ale mainnet-ului fereastra reală este mai scurtă decât „7 zile". Trimiterea unei contestări necesită, de asemenea, garanția de contestare a rollup-ului (1.000 QOR pentru presetările `nft` și `custom`).
:::

## CLI

```bash
qorollup watchtower my-rollup
```

`watchtower` rulează cadrul din linia de comandă, afișând loturile noi și
termenele-limită ale ferestrei de contestare până când apeși Ctrl-C. Vezi
[Implementarea unui rollup](/rollups/deploying-a-rollup) pentru întregul CLI
de operator `qorollup`.
