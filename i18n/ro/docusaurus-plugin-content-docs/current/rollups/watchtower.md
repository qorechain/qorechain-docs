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

:::caution Stadiu incipient: nu există nimic de urmărit, iar alertele de termen-limită din 0.5.0 sunt greșite
Watchtower citește loturile prin clientul REST RDK, iar rutele `/qorechain/rdk/v1/…` sunt servite pe ambele rețele. Nu a fost creat niciun rollup pe niciuna dintre rețele (verificat la 20 octombrie 2026), deci nu există încă nimic de urmărit. În `@qorechain/rdk` 0.5.0, logica termenului-limită al ferestrei de contestare este de asemenea nesigură: `submittedAt` al unui lot este o **înălțime de bloc**, dar Watchtower (și verificarea de sănătate din spatele `qorollup status`) îi adaugă fereastra în secunde și compară suma cu ceasul real, așa că `secondsRemaining` nu are sens, iar `onDeadline` se declanșează imediat ce un lot este văzut prima dată. Nu folosi `onDeadline` sau numărătoarea inversă pentru decizii; calculează tu termenul-limită (vezi nota de mai jos). Watcher-ul citește, de asemenea, doar prima pagină de loturi (50).
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

Cadrul evidențiază:

- **loturi noi** prin `onBatch`,
- **termene-limită ale ferestrei de contestare** prin `onDeadline` și
- **loturi invalide** (pentru care `validate` a returnat `false`) prin `onInvalid`.

Conectarea `onInvalid` la o contestare transformă Watchtower într-un
auto-contestator complet; lasă-l neconfigurat pentru a rula în mod
exclusiv de observare.

:::note Fereastra de contestare
Calculează termenul-limită al unui lot în blocuri, nu în secunde: `submitted_at` (o înălțime de bloc) plus fereastra. **Pe mainnet (v3.2.3)** fereastra este valoarea implicită de 604.800 de „secunde", convertită la 6 secunde fixe per bloc, adică **100.800 de blocuri** (timpul real urmează timpul de bloc, deci este mai scurt decât „7 zile" la blocurile de ≈3,2 s ale mainnet-ului). **Doar pe testnet (v3.2.4)**, un lot trimis începând cu înălțimea 8.337.253 primește o fereastră măsurată în secunde de timp de bloc. Trimiterea unei contestări necesită, de asemenea, garanția de contestare a rollup-ului (1.000 QOR pentru presetările `nft` și `custom`).
:::

## CLI

```bash
qorollup watchtower my-rollup
```

`watchtower` rulează cadrul din linia de comandă, afișând loturile noi și
termenele-limită ale ferestrei de contestare până când apeși Ctrl-C. Vezi
[Implementarea unui rollup](/rollups/deploying-a-rollup) pentru întregul CLI
de operator `qorollup`.
