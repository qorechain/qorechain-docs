---
slug: /rollups/settlement-receipts
title: Reçus de règlement à sûreté quantique
sidebar_label: Reçus de règlement
sidebar_position: 6
---

# Reçus de règlement à sûreté quantique

Un **reçu de règlement** est un enregistrement portable attestant qu'un lot de règlement d'un rollup a été ancré à la Main Chain sous une signature post-quantique. Il désigne le rollup, le lot et l'ancre, et porte la signature **ML-DSA-87** (Dilithium-5, FIPS-204) de l'ancre, le même schéma que celui utilisé par la Main Chain.

:::caution Stade précoce : aucune ancre n'existe encore
Les reçus dépendent des ancres, et **aucun rollup ni aucune ancre n'existe encore sur l'un ou l'autre réseau**. Sur le mainnet, le RDK n'écrit pas encore d'ancres : les lots de règlement sont enregistrés, mais l'étape d'ancrage est ignorée. Considérez cette page comme une description de la conception et des briques de base, et non d'un service sur lequel vous pouvez vous appuyer aujourd'hui.
:::

## Un reçu est une affirmation, pas une preuve {#a-receipt-is-a-claim}

Chaque champ d'un reçu est fourni par celui qui vous le remet. Vérifier la signature avec une clé qui vous a été donnée montre que quelqu'un détenant cette clé a signé ces octets ; cela ne montre pas que QoreChain a ancré quoi que ce soit. Un vérificateur a donc besoin d'un client connecté à un nœud QoreChain auquel il fait confiance, et relit l'affirmation depuis l'état de la chaîne : le rollup et sa couche, le lot et sa racine d'état, l'ancre, et la clé post-quantique enregistrée du créateur.

## Ce que l'ancre signe {#what-the-anchor-signs}

La signature de l'ancre est produite par la clé ML-DSA-87 enregistrée du **créateur du rollup**. Sur le mainnet aujourd'hui, le message signé est

```
layer_id || layer_height (8-byte big-endian) || state_root || validator_set_hash
```

Une version plus récente de la chaîne modifie le message signé ; ne le codez donc pas en dur : lisez les octets à signer pour le réseau que vous ciblez. Une ancre est un objet de niveau couche : elle ne désigne ni le rollup ni le lot, de sorte qu'un vérificateur les lie par des lectures de la chaîne (voir [Architecture multicouche](/architecture/multilayer-architecture#reading-anchors)).

## Lecture des ancres {#reading-anchors}

Les ancres sont lisibles via REST et gRPC (`/qorechain/multilayer/v1/anchor/{layer_id}` pour la dernière ancre et `/qorechain/multilayer/v1/anchors/{layer_id}` pour l'historique), et la clé post-quantique enregistrée d'un compte à l'adresse `/qorechain/pqc/v1/account/{address}`. Les lots d'un rollup se lisent avec `qorechaind query rdk batch [rollup-id]` (les routes REST du RDK ne sont pas servies sur le mainnet aujourd'hui).

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

Passez un `client` pour chaque vérification. Utilisez la dernière version publiée de votre client RDK : l'API des reçus et ses contrôles ont changé d'une version à l'autre, et les clients Python, Go, Rust et Java exposent la même surface de construction/vérification (ils effectuent la vérification ML-DSA-87 via la bibliothèque [`qorechain-pqc`](https://github.com/qorechain)).

:::note Limitations actuelles du client
Les clients RDK publiés recherchent la clé du créateur par un chemin que la chaîne en service ne sert pas ; la vérification en ligne n'aboutit donc pas encore sur les réseaux en service. Tant qu'une version de client ne corrige pas cela, utilisez un reçu uniquement comme un enregistrement à recouper avec l'ancre que vous lisez depuis votre propre nœud.
:::

## CLI {#cli}

```bash
qorollup receipt my-rollup 7                 # build and print
qorollup receipt my-rollup 7 --out receipt.json
```

Voir [Déployer un rollup](/rollups/deploying-a-rollup) pour la CLI opérateur `qorollup` complète.
