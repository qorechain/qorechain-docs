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

:::caution Stade précoce : nécessite les routes REST du RDK
La Tour de guet lit les lots via le client REST du RDK. Les routes REST `/qorechain/rdk/v1/…` ne sont pas servies sur le mainnet aujourd'hui ; la Tour de guet ne peut donc pas encore fonctionner sur le mainnet. Aucun rollup n'a été créé sur l'un ou l'autre réseau, il n'y a donc rien à surveiller.
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

Le framework fait remonter :

- les **nouveaux lots** via `onBatch`,
- les **échéances de fenêtre de contestation** via `onDeadline`, et
- les **lots invalides** (ceux pour lesquels votre `validate` a renvoyé `false`) via `onInvalid`.

Relier `onInvalid` à une contestation transforme la Tour de guet en un
contestataire automatique complet ; laissez-le non défini pour fonctionner en
mode observation seule.

:::note Fenêtre de contestation
L'échéance rapportée par la Tour de guet utilise la fenêtre de contestation convertie en blocs à raison de 6 secondes par bloc (100 800 blocs par défaut) ; ainsi, avec les blocs d'environ 3,2 s du mainnet, la fenêtre réelle est plus courte que « 7 jours ». Publier une contestation exige également la caution de contestation du rollup (1 000 QOR pour les profils `nft` et `custom`).
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
