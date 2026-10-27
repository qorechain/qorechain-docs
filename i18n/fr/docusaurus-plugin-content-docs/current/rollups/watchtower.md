---
slug: /rollups/watchtower
title: Tour de guet
sidebar_label: Tour de guet
sidebar_position: 9
---

# Tour de guet

La Tour de guet (Watchtower) est un framework de contestation automatique pour
les rollups optimistes. Elle suit les lots de règlement d'un rollup, fait
remonter chaque nouveau lot ainsi que l'échéance de sa fenêtre de contestation,
et — lorsque **votre** prédicat de validité rejette un lot — le transmet à votre
callback `onInvalid` afin que vous puissiez y brancher une contestation.

Le framework observe et décide *quand* ; **c'est vous qui fournissez la
vérification de validité**. La Tour de guet ne décide jamais d'elle-même qu'un
lot est frauduleux — elle appelle votre fonction `validate` et agit selon ce que
vous renvoyez.

:::caution Stade précoce : rien à surveiller pour l'instant
La Tour de guet lit les lots via le client REST du RDK, et les routes `/qorechain/rdk/v1/…` sont servies sur les deux réseaux. Aucun rollup n'a été créé sur l'un ou l'autre réseau (vérifié le 27 octobre 2026) ; il n'y a donc encore rien à surveiller et la Tour de guet n'a jamais tourné face à un lot réel. Dans `@qorechain/rdk` 0.5.0, sa logique d'échéance était erronée (elle lisait une hauteur de bloc comme un horodatage Unix, de sorte que `onDeadline` se déclenchait dès qu'un lot était vu pour la première fois) et elle ne lisait que la première page de 50 lots ; **la 0.6.0 a corrigé les deux** (voir ci-dessous). Utilisez la 0.6.2, la version actuelle.
:::

## `watchBatches`

```ts
import { createRdkClient, watchBatches } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });

// `tx` is a signing client that produces the hybrid (post-quantum) signature
// the networks require: pass `pqcKeypair` to `RdkClient.connectTx` (see
// "RDK 0.6.2: changes and limits" in Deploying a Rollup). Without it the
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

Le framework fait remonter :

- les **nouveaux lots** via `onBatch`,
- les **échéances de fenêtre de contestation** via `onDeadline`, et
- les **lots invalides** (ceux pour lesquels votre `validate` a renvoyé `false`) via `onInvalid`.

Depuis la 0.6.0 (et dans la 0.6.1 et la 0.6.2), elle parcourt chaque page de la liste de lots d'un rollup, rejuge un lot à mesure que son échéance approche (elle continue d'interroger à partir du plus ancien lot dont la fenêtre est encore ouverte, au lieu de juger chaque lot une seule fois à sa première apparition), et mesure chaque fenêtre par rapport à la tête de la chaîne (`getChainTip`, le statut du nœud) plutôt qu'à l'horloge locale. Un lot déjà `finalized` n'est ni validé ni signalé.

Relier `onInvalid` à une contestation transforme la Tour de guet en un
contestataire automatique complet ; laissez-le non défini pour fonctionner en
mode observation seule.

:::note Fenêtre de contestation
La chaîne mesure la fenêtre d'un lot de l'une de deux manières, et `batchChallengeWindow` (utilisée par la Tour de guet et par le contrôle de santé derrière `qorollup status`) indique laquelle. **Fenêtre en nombre de blocs, règle du mainnet pour les lots soumis avant la hauteur 3 742 566 (v3.2.3 et antérieures) :** la fenêtre correspond aux secondes configurées du rollup converties à raison fixe de 6 secondes par bloc, soit **100 800 blocs** pour les 604 800 par défaut, comptés à partir de la hauteur `submitted_at` du lot ; le temps réel suit le temps de bloc, donc plus court que « 7 jours » avec les blocs d'environ 3,1 s du mainnet. Le package rapporte séparément `open` et `finalizable`, car selon la règle qu'il implémente un bloc est à la fois l'un et l'autre (une contestation est considérée ouverte tant que `height - submitted_at <= window`, finalisable dès que `height - submitted_at >= window`). **Fenêtre basée sur le temps, à partir de la v3.2.4 (le testnet depuis la hauteur 8 337 253, le mainnet depuis la hauteur 3 742 566) :** un lot soumis à partir de la hauteur de mise à niveau enregistre son temps de bloc et sa fenêtre est ce nombre de secondes de temps de bloc. La Tour de guet utilise la fenêtre propre au rollup lorsque le nœud la rapporte (le package documente cela comme v3.2.4 et ultérieures) ; sinon elle se rabat sur la fenêtre par défaut du module, donc passez `challengeWindowSecs` pour un rollup qui a configuré la sienne. Publier une contestation exige également la caution de contestation du rollup (1 000 QOR pour les profils `nft` et `custom`). La fenêtre par défaut du module est de 604,800 secondes sur le mainnet et de 3,600 secondes (une heure) sur le testnet (lue à `GET /qorechain/rdk/v1/params` le 27 octobre 2026) : une même configuration de rollup a donc une fenêtre bien plus courte sur le testnet.
:::

## CLI

```bash
qorollup watchtower my-rollup
```

`watchtower` exécute le framework depuis la ligne de commande, en affichant les
nouveaux lots et les échéances de fenêtre de contestation jusqu'à ce que vous
appuyiez sur Ctrl-C. Consultez
[Déployer un rollup](/rollups/deploying-a-rollup) pour le CLI opérateur
`qorollup` complet.
