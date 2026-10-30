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

:::caution Stadiu incipient: nu există încă nimic de urmărit
Watchtower citește loturile prin clientul REST RDK, iar rutele `/qorechain/rdk/v1/…` sunt servite pe ambele rețele. Nu a fost creat niciun rollup pe niciuna dintre rețele (verificat la 27 octombrie 2026), deci nu există încă nimic de urmărit, iar Watchtower nu a rulat împotriva unui lot real. În `@qorechain/rdk` 0.5.0, logica sa de termen-limită era greșită (citea o înălțime de bloc ca timestamp Unix, așa că `onDeadline` se declanșa imediat ce un lot era văzut prima dată) și citea doar prima pagină de 50 de loturi; **0.6.0 le-a corectat pe amândouă** (vezi mai jos). Folosește 0.7.0, versiunea curentă.
:::

## `watchBatches`

```ts
import { createRdkClient, watchBatches } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });

// `tx` is a signing client that produces the hybrid (post-quantum) signature
// the networks require: pass `pqcKeypair` to `RdkClient.connectTx` (see
// "RDK 0.7.0: changes and limits" in Deploying a Rollup). Without it the
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

Cadrul evidențiază:

- **loturi noi** prin `onBatch`,
- **termene-limită ale ferestrei de contestare** prin `onDeadline` și
- **loturi invalide** (pentru care `validate` a returnat `false`) prin `onInvalid`.

De la 0.6.0 (și în fiecare versiune de după ea), urmărește toate paginile listei de loturi a unui rollup, rejudecă un lot pe măsură ce se apropie termenul-limită al acestuia (continuă să interogheze înainte, începând de la cel mai vechi lot a cărui fereastră este încă deschisă, în loc să judece fiecare lot o singură dată, la prima vedere) și măsoară fiecare fereastră față de vârful lanțului (`getChainTip`, starea nodului) în loc de ceasul local. Un lot deja `finalized` nu este validat și nu se emit avertismente pentru el.

**Loturi retrimise (0.7.0).** De la lanțul v3.2.5 (ambele rețele), o fraudă confirmată respinge lotul și fiecare lot nefinalizat de după el, iar sequencer-ul le retrimite sub aceiași indecși. Versiunile dinainte de 0.7.0 deosebeau loturile doar după index și de aceea nu observau un lot retrimis la un index respins; 0.7.0 le deosebește după index și rădăcina de stare și nu validează niciodată un lot respins.

**Aplicarea regulii de fraudă a lanțului (0.7.0).** `transitionRootValidator` este un predicat `validate` gata făcut, care aplică regula proprie a lanțului (un lot este fraudulos când rădăcina sa de stare nu este rădăcina canonică de tranziție), iar `fraudProofForBatch` returnează dovada care câștigă, sau nimic pentru un lot onest, astfel încât să o poți transmite lui `challengeBatch`.

Conectarea `onInvalid` la o contestare transformă Watchtower într-un
auto-contestator complet; lasă-l neconfigurat pentru a rula în mod
exclusiv de observare.

:::note Fereastra de contestare
Lanțul măsoară fereastra unui lot în unul din două moduri, iar `batchChallengeWindow` (folosit de Watchtower și de verificarea de sănătate din spatele `qorollup status`) raportează care anume. **Fereastră în număr de blocuri, regula de pe mainnet pentru loturile trimise înainte de înălțimea 3.742.566 (v3.2.3 și mai vechi):** fereastra reprezintă secundele configurate ale rollup-ului convertite la 6 secunde fixe per bloc, adică **100.800 de blocuri** pentru valoarea implicită de 604.800, numărate de la înălțimea `submitted_at` a lotului; timpul real urmează timpul de bloc, deci este mai scurt decât „7 zile" la blocurile de ≈3,1 s ale mainnet-ului. Pachetul raportează separat `open` și `finalizable`, deoarece, în regula pe care o implementează, un bloc este ambele (o contestare contează ca deschisă cât timp `height - submitted_at <= window`, iar lotul este finalizabil de la `height - submitted_at >= window`). **Fereastră bazată pe timp, de la v3.2.4 (testnet de la înălțimea 8.337.253, mainnet de la înălțimea 3.742.566):** un lot trimis de la înălțimea upgrade-ului încolo își înregistrează timpul de bloc, iar fereastra sa este acel număr de secunde de timp de bloc. Watchtower folosește fereastra proprie a rollup-ului când nodul o raportează (pachetul documentează aceasta ca v3.2.4 și mai nou); altfel revine la fereastra implicită a modulului, așa că transmite `challengeWindowSecs` pentru un rollup care și-a configurat-o pe a sa. Trimiterea unei contestări necesită, de asemenea, garanția de contestare a rollup-ului (1.000 QOR pentru presetările `nft` și `custom`). Fereastra implicită a modulului este de 604.800 de secunde pe mainnet și de 3.600 de secunde (o oră) pe testnet (citit de la `GET /qorechain/rdk/v1/params` pe 27 octombrie 2026), deci aceeași configurație de rollup are o fereastră mult mai scurtă pe testnet.
:::

## CLI

```bash
qorollup watchtower my-rollup
```

`watchtower` rulează cadrul din linia de comandă, afișând loturile noi și
termenele-limită ale ferestrei de contestare până când apeși Ctrl-C. Adaugă `--canonical` (0.7.0) și raportează și fiecare lot a cărui rădăcină de stare nu este rădăcina canonică de tranziție, adică loturile pe care o contestare le-ar câștiga. Vezi
[Implementarea unui rollup](/rollups/deploying-a-rollup) pentru întregul CLI
de operator `qorollup`.
