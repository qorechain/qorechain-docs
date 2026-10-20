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

:::caution Stade précoce : rien à surveiller, et les alertes d'échéance de la version 0.5.0 sont erronées
La Tour de guet lit les lots via le client REST du RDK, et les routes `/qorechain/rdk/v1/…` sont servies sur les deux réseaux. Aucun rollup n'a été créé sur l'un ou l'autre réseau (vérifié le 20 octobre 2026) ; il n'y a donc encore rien à surveiller. Dans `@qorechain/rdk` 0.5.0, la logique d'échéance de la fenêtre de contestation n'est en outre pas fiable : le `submittedAt` d'un lot est une **hauteur de bloc**, mais la Tour de guet (ainsi que le contrôle de santé derrière `qorollup status`) lui ajoute la fenêtre exprimée en secondes et compare la somme à l'horloge murale ; `secondsRemaining` n'a donc aucun sens, et `onDeadline` se déclenche dès qu'un lot est vu pour la première fois. N'utilisez pas `onDeadline` ni le compte à rebours pour prendre des décisions ; calculez vous-même l'échéance (voir la note ci-dessous). L'observateur ne lit en outre que la première page de lots (50).
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

Le framework fait remonter :

- les **nouveaux lots** via `onBatch`,
- les **échéances de fenêtre de contestation** via `onDeadline`, et
- les **lots invalides** (ceux pour lesquels votre `validate` a renvoyé `false`) via `onInvalid`.

Relier `onInvalid` à une contestation transforme la Tour de guet en un
contestataire automatique complet ; laissez-le non défini pour fonctionner en
mode observation seule.

:::note Fenêtre de contestation
Calculez l'échéance d'un lot en blocs, pas en secondes : `submitted_at` (une hauteur de bloc) plus la fenêtre. **Sur le mainnet (v3.2.3)**, la fenêtre correspond aux 604 800 « secondes » par défaut converties à raison fixe de 6 secondes par bloc, soit **100 800 blocs** (le temps réel suit le temps de bloc, donc plus court que « 7 jours » avec les blocs d'environ 3,2 s du mainnet). **Sur le testnet uniquement (v3.2.4)**, un lot soumis à partir de la hauteur 8 337 253 reçoit une fenêtre mesurée en secondes de temps de bloc. Publier une contestation exige également la caution de contestation du rollup (1 000 QOR pour les profils `nft` et `custom`).
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
