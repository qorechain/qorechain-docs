---
slug: /rollups/settlement-receipts
title: Reçus de règlement à sûreté quantique
sidebar_label: Reçus de règlement
sidebar_position: 6
---

# Reçus de règlement à sûreté quantique

Un **reçu de règlement** est un enregistrement portable attestant qu'un lot de règlement d'un rollup a été ancré à la Main Chain sous une signature post-quantique. Il désigne le rollup, le lot et l'ancre, et porte la signature **ML-DSA-87** (Dilithium-5, FIPS-204) de l'ancre, le même schéma que celui utilisé par la Main Chain.

:::caution Stade précoce : aucune ancre n'existe encore
Les reçus dépendent des ancres, et **aucun rollup ni aucune ancre n'existe encore sur l'un ou l'autre réseau** (vérifié le 21 octobre 2026). Depuis la v3.2.2 (en service sur les deux réseaux), un lot soumis avec un `anchor_signature` est ancré dans `x/multilayer` au sein de la même transaction ; un lot soumis sans cette signature est réglé sans ancre. Le RDK TypeScript (0.6.0) envoie ce champ lorsque son client de transaction signe en hybride et est le créateur du rollup, et soumet sans ancre dans le cas contraire ; les clients Python, Go, Rust et Java signent en classique uniquement et ne construisent pas ce champ. Rien de tout cela n'a été exercé sur un rollup en production. Considérez cette page comme une description de la conception et des briques de base, et non d'un service sur lequel vous pouvez vous appuyer aujourd'hui.
:::

## Un reçu est une affirmation, pas une preuve {#a-receipt-is-a-claim}

Chaque champ d'un reçu est fourni par celui qui vous le remet. Vérifier la signature avec une clé qui vous a été donnée montre que quelqu'un détenant cette clé a signé ces octets ; cela ne montre pas que QoreChain a ancré quoi que ce soit. Un vérificateur a donc besoin d'un client connecté à un nœud QoreChain auquel il fait confiance, et relit l'affirmation depuis l'état de la chaîne : le rollup et sa couche, le lot et sa racine d'état, l'ancre, et la clé post-quantique enregistrée du créateur.

## Ce que l'ancre signe {#what-the-anchor-signs}

La signature de l'ancre est produite par la clé ML-DSA-87 enregistrée du **créateur du rollup**. Le message signé dépend de la hauteur à laquelle l'ancre est soumise. **À partir de la v3.2.2 (mainnet hauteur 3,556,788, testnet hauteur 6,905,034), c'est le message v2** : une balise de domaine, l'identifiant de chaîne, puis `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, le nombre de transactions et la preuve d'état compressée, chacun préfixé par sa longueur (la disposition exacte figure dans [Lecture des ancres](/architecture/multilayer-architecture#reading-anchors)). La chaîne n'accepte plus d'ancre v1 (`layer_id || layer_height || state_root || validator_set_hash`, sans identifiant de chaîne) à partir de cette hauteur. Ne codez aucune des deux formes en dur : lisez les octets à signer pour le réseau que vous ciblez. Le RDK construit les octets v2 avec `anchorSignBytesForBatch` (et les deux formes avec `anchorSignBytesV1` / `anchorSignBytesV2`), et la CLI les affiche, par exemple avec `qorechaind query rdk anchor-sign-bytes <layer-id> <batch-index> <state-root-hex> --chain-id <id> --tx-count <n>`.

Une ancre est un objet de niveau couche : elle ne désigne ni le rollup ni le lot, de sorte qu'un vérificateur les lie par des lectures de la chaîne (voir [Architecture multicouche](/architecture/multilayer-architecture#reading-anchors)).

## Lecture des ancres {#reading-anchors}

Les ancres sont lisibles via REST et gRPC (`/qorechain/multilayer/v1/anchor/{layer_id}` pour la dernière ancre et `/qorechain/multilayer/v1/anchors/{layer_id}` pour l'historique), et la clé post-quantique enregistrée d'un compte à l'adresse `/qorechain/pqc/v1/account/{address}` (`account` au singulier). Les lots d'un rollup se lisent via les routes REST du RDK (`/qorechain/rdk/v1/batch/{rollup_id}/{batch_index}`, `/qorechain/rdk/v1/latest_batch/{rollup_id}`, `/qorechain/rdk/v1/batches/{rollup_id}`), que les deux réseaux servent, ou avec `qorechaind query rdk batch [rollup-id]`.

## Construire et vérifier (TypeScript) {#build-and-verify}

```ts
import {
  createRdkClient,
  buildSettlementReceipt,
  verifySettlementReceipt,
} from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });

// Build a receipt for one batch (throws if no anchor covers the batch yet).
const receipt = await buildSettlementReceipt(rdk, "my-rollup", 7);

// Verify it against chain state — pass a client; a receipt on its own proves nothing.
const result = await verifySettlementReceipt(receipt, { client: rdk });
console.log(result.valid);
```

Passez un `client` pour chaque vérification. L'API des reçus et ses contrôles ont changé d'une version à l'autre : utilisez donc la 0.6.0 ou ultérieure, car la 0.5.0 ne pouvait pas mener à bien le contrôle sur la chaîne (voir ci-dessous). Les clients Python, Go, Rust et Java exposent la même surface de construction/vérification ; leurs versions 0.6.0 utilisent la même route de recherche de clé au singulier et le même choix du message d'ancre selon la hauteur.

### Ce que vérifie la 0.6.0 {#what-060-verifies}

`verifySettlementReceipt` ne rapporte jamais `valid` à partir du seul reçu : sans `client`, le résultat est `mode: "signature-only"` et `valid: false`. Avec un `client`, il relit la chaîne et rapporte chaque contrôle séparément :

* `rollupLayerBinding` : la chaîne indique que le rollup appartient à la couche du reçu ;
* `batchStateRoot` : le lot de la chaîne porte la racine d'état du reçu ;
* `anchorOnChain` : une ancre avec cette racine d'état, cette hauteur et cette signature existe sur la chaîne ;
* `creatorAuthority` : la clé de signature a été lue depuis la chaîne (`/qorechain/pqc/v1/account/{address}`), et non reprise du reçu ;
* `pqcSignature` : la signature ML-DSA-87 est valide sur le message d'ancre canonique ;
* `chainBinding` : le reçu désigne la chaîne qui a réellement été interrogée.

Le message d'ancre est choisi selon la hauteur à laquelle l'ancre a été enregistrée (v1 en dessous du basculement de la v3.2.2, v2 à partir de celui-ci), jamais en essayant les deux, car une signature v1 ne porte aucun identifiant de chaîne et serait valide sur toutes les chaînes. Le paquet embarque la hauteur de basculement pour le mainnet (3,556,788) et le testnet (6,905,034). Le résultat indique la forme utilisée dans `signBytesVersion`. Le schéma de reçu v2 enregistre `chainId` ; un reçu de version 1 n'en porte aucun, il ne passe donc `chainBinding` que parce que son ancre a été trouvée sur la chaîne que vous avez interrogée. La vérification refuse un reçu contrôlé auprès d'un nœud d'une autre chaîne.

Aucune ancre n'existe sur l'un ou l'autre réseau ; cela n'a donc été vérifié que par rapport au code du paquet et hors ligne, pas par rapport à une ancre réelle. `buildSettlementReceipt` ne fonctionne qu'une fois qu'une ancre couvre le lot.

:::note Versions antérieures à la 0.6.0
Dans la 0.5.0, `verifySettlementReceipt` échouait de façon fermée sur les réseaux en service, pour deux raisons qui tenaient au client et non à la chaîne : il recherchait la clé du créateur via une forme plurielle `accounts` de la route de compte post-quantique, que les réseaux ne servent pas (HTTP 501), et il ne reconstruisait que le message v1, que la chaîne n'accepte plus pour les ancres depuis la v3.2.2. Un reçu authentique ne pouvait donc pas être vérifié, tandis qu'un reçu falsifié était tout de même refusé. Utilisez la 0.6.0 ou ultérieure.
:::

## CLI {#cli}

```bash
qorollup receipt my-rollup 7                 # build and print
qorollup receipt my-rollup 7 --out receipt.json
```

Voir [Déployer un rollup](/rollups/deploying-a-rollup) pour la CLI opérateur `qorollup` complète.
