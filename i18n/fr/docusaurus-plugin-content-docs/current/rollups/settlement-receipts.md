---
slug: /rollups/settlement-receipts
title: Reçus de règlement résistants au quantique
sidebar_label: Reçus de règlement
sidebar_position: 6
---

# Reçus de règlement résistants au quantique

Un **reçu de règlement** est une preuve portable et autonome qu'un lot de
règlement d'un rollup a été ancré à la Main Chain sous une signature
post-quantique. Il lie un lot spécifique à l'ancrage on-chain qui a engagé l'état
du rollup à cette hauteur, et il peut être vérifié **entièrement hors ligne** —
pas de nœud, pas de confiance dans le chemin réseau du vérificateur.

La signature d'ancrage est **ML-DSA-87** (Dilithium-5, FIPS-204), le même schéma
post-quantique que celui qu'utilise la Main Chain, de sorte qu'un reçu hérite de
l'intégrité résistante au quantique de la chaîne de base.

## Le message d'ancrage canonique

La vérification contrôle une signature Dilithium-5 sur un message canonique
construit à partir des champs d'ancrage, concaténés dans cet ordre exact :

```
layer_id || layer_height (8-byte big-endian) || state_root || validator_set_hash
```

`anchorSignBytes(...)` produit ces octets ; le vérificateur les reconstruit à
partir du reçu et contrôle la signature au regard de la clé ML-DSA-87 enregistrée
du créateur de la couche.

## Construire et vérifier (TypeScript)

```ts
import {
  createRdkClient,
  buildSettlementReceipt,
  verifySettlementReceipt,
} from "@qorechain/rdk";

const rdk = createRdkClient({
  endpoints: { rest: "https://rest.testnet.example" },
});

// Build a portable receipt for one batch.
const receipt = await buildSettlementReceipt(rdk, "my-roll", 7);

// Persist it, ship it, hand it to a counterparty — it is self-contained JSON.

// Verify fully offline. With no client, you must supply the creator's key.
const result = await verifySettlementReceipt(receipt, {
  creatorPublicKey: "<layer creator ML-DSA-87 public key>",
});

console.log(result.valid); // true when the signature and the batch↔anchor binding both hold
```

Si vous passez un `client` à la place de (ou en plus de) `creatorPublicKey`, la
vérification récupère la clé ML-DSA-87 enregistrée du créateur de la couche depuis
la chaîne (`getPqcAccount(address)`). La vérification contrôle alors deux choses :

1. la **signature Dilithium-5** sur le message d'ancrage canonique, et
2. la **liaison racine d'état lot ↔ ancrage** — que le lot que vous détenez est
   bien celui que l'ancrage a engagé.

```ts
// Online verification: fetch the creator's PQC key from the chain.
const online = await verifySettlementReceipt(receipt, { client: rdk });
```

## Lire les ancrages

Les reçus sont construits à partir d'une nouvelle requête **Anchor** on-chain de
`x/multilayer`. Les lectures :

- `getAnchor(layerId)` — l'ancrage d'une couche.
- `getLatestAnchor()` — l'ancrage le plus récent.
- `getAnchors(layerId)` — l'historique des ancrages d'une couche.
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

Consultez [Déployer un Rollup](/rollups/deploying-a-rollup) pour la CLI opérateur
`qorollup` complète.

## Autres langages

Les clients Python, Go, Rust et Java (JVM) exposent la même surface de
construction/vérification. Ils effectuent la vérification ML-DSA-87 via la
bibliothèque [`qorechain-pqc`](https://github.com/qorechain) plutôt qu'une
implémentation JavaScript embarquée ; installez-la aux côtés du client RDK pour
votre langage.
