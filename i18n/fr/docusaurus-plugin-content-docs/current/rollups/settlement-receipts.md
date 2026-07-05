---
slug: /rollups/settlement-receipts
title: Reçus de règlement à sûreté quantique
sidebar_label: Reçus de règlement
sidebar_position: 6
---

# Reçus de règlement à sûreté quantique

Un **reçu de règlement** est une preuve portable et autonome qu'un lot de
règlement d'un rollup a été ancré à la Main Chain sous une signature
post-quantique. Il lie un lot spécifique à l'ancre on-chain qui a engagé l'état
du rollup à cette hauteur, et il peut être vérifié **entièrement hors ligne** —
sans nœud, sans confiance dans le chemin réseau du vérificateur.

La signature d'ancrage est **ML-DSA-87** (Dilithium-5, FIPS-204), le même schéma
post-quantique utilisé par la Main Chain, de sorte qu'un reçu hérite de
l'intégrité à sûreté quantique de la chaîne de base.

## Le message d'ancrage canonique

La vérification contrôle une signature Dilithium-5 sur un message canonique
construit à partir des champs de l'ancre, concaténés dans cet ordre exact :

```
layer_id || layer_height (8-byte big-endian) || state_root || validator_set_hash
```

`anchorSignBytes(...)` produit ces octets ; le vérificateur les reconstruit à
partir du reçu et contrôle la signature avec la clé ML-DSA-87 enregistrée du
créateur de la couche.

## Construire et vérifier (TypeScript)

```ts
import {
  createRdkClient,
  buildSettlementReceipt,
  verifySettlementReceipt,
} from "@qorechain/rdk";

// The public qore.host endpoints are baked into the presets (RDK ≥ 0.4.2);
// pass `endpoints` only to target your own node.
const rdk = createRdkClient({ network: "testnet" });

// Build a portable receipt for one batch.
const receipt = await buildSettlementReceipt(rdk, "my-roll", 7);

// Persist it, ship it, hand it to a counterparty — it is self-contained JSON.

// Verify fully offline. With no client, you must supply the creator's key.
const result = await verifySettlementReceipt(receipt, {
  creatorPublicKey: "<layer creator ML-DSA-87 public key>",
});

console.log(result.valid); // true when the signature and the batch↔anchor binding both hold
```

Si vous passez un `client` au lieu de (ou en plus de) `creatorPublicKey`, la
vérification récupère depuis la chaîne la clé ML-DSA-87 enregistrée du créateur
de la couche (`getPqcAccount(address)`). La vérification contrôle alors deux
choses :

1. la **signature Dilithium-5** sur le message d'ancrage canonique, et
2. la **liaison lot ↔ racine d'état de l'ancre** — c'est-à-dire que le lot que
   vous détenez est bien celui que l'ancre a engagé.

```ts
// Online verification: fetch the creator's PQC key from the chain.
const online = await verifySettlementReceipt(receipt, { client: rdk });
```

## Lecture des ancres

Les reçus sont construits à partir de la requête **Anchor** on-chain du module
`x/multilayer`, disponible à la fois via gRPC et REST depuis la version de
chaîne **v3.1.80** (voir
[Points de terminaison REST / gRPC](/api-reference/rest-grpc-endpoints#multilayer-module)).
Les lectures :

- `getAnchor(layerId)` — l'ancre d'une couche.
- `getLatestAnchor()` — l'ancre la plus récente.
- `getAnchors(layerId)` — l'historique des ancres d'une couche.
- `getPqcAccount(address)` — un compte post-quantique enregistré (sa clé
  ML-DSA-87), utilisé pour vérifier la signature du créateur.

## CLI

```bash
# Build a receipt and print it.
qorollup receipt my-roll 7

# Build, then verify it inline.
qorollup receipt my-roll 7 --verify

# Build and write it to a file.
qorollup receipt my-roll 7 --out receipt.json
```

Voir [Déployer un rollup](/rollups/deploying-a-rollup) pour la CLI opérateur
`qorollup` complète.

## Autres langages

Les clients Python, Go, Rust et Java (JVM) exposent la même surface de
construction/vérification. Ils effectuent la vérification ML-DSA-87 via la
bibliothèque [`qorechain-pqc`](https://github.com/qorechain) plutôt qu'avec une
implémentation JavaScript embarquée ; installez-la aux côtés du client RDK de
votre langage.
