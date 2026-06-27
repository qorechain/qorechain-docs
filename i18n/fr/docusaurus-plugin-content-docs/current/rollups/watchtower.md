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
callback `onInvalid` afin que vous puissiez déclencher une contestation.

Le framework observe et décide *quand* ; **c'est vous qui fournissez la
vérification de validité**. La Tour de guet ne décide jamais d'elle-même qu'un
lot est frauduleux — elle appelle votre fonction `validate` et agit selon ce que
vous renvoyez.

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

Le framework fait remonter :

- les **nouveaux lots** via `onBatch`,
- les **échéances de fenêtre de contestation** via `onDeadline`, et
- les **lots invalides** (ceux pour lesquels votre `validate` a renvoyé `false`) via `onInvalid`.

Relier `onInvalid` à `challengeBatch` transforme la Tour de guet en un
contestataire automatique complet ; laissez-le non défini pour fonctionner en
mode observation seule.

## CLI

```bash
qorollup watchtower my-roll
```

`watchtower` exécute le framework depuis la ligne de commande, en affichant les
nouveaux lots et les échéances de fenêtre de contestation jusqu'à ce que vous
appuyiez sur Ctrl-C. Consultez
[Déployer un rollup](/rollups/deploying-a-rollup) pour le CLI opérateur
`qorollup` complet.
