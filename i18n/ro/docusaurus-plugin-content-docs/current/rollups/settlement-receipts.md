---
slug: /rollups/settlement-receipts
title: Bonuri de decontare rezistente cuantic
sidebar_label: Bonuri de decontare
sidebar_position: 6
---

# Bonuri de decontare rezistente cuantic

Un **bon de decontare** este o dovadă portabilă și autonomă că un lot de
decontare al unui rollup a fost ancorat în Main Chain sub o semnătură
post-cuantică. El leagă un lot specific de ancora on-chain care a consemnat
starea rollup-ului la acea înălțime și poate fi verificat **complet offline**
— fără nod, fără încredere în calea de rețea a verificatorului.

Semnătura ancorei este **ML-DSA-87** (Dilithium-5, FIPS-204), aceeași schemă
post-cuantică pe care o folosește Main Chain, astfel încât un bon moștenește
integritatea rezistentă cuantic a lanțului de bază.

## Mesajul canonic al ancorei

Verificarea validează o semnătură Dilithium-5 asupra unui mesaj canonic
construit din câmpurile ancorei, concatenate exact în această ordine:

```
layer_id || layer_height (8-byte big-endian) || state_root || validator_set_hash
```

`anchorSignBytes(...)` produce acești octeți; verificatorul îi reconstruiește
din bon și validează semnătura față de cheia ML-DSA-87 înregistrată a
creatorului layer-ului.

## Construire și verificare (TypeScript)

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

Dacă transmiteți un `client` în locul lui `creatorPublicKey` (sau alături de
acesta), verificarea preia de pe lanț cheia ML-DSA-87 înregistrată a creatorului
layer-ului (`getPqcAccount(address)`). Verificarea validează apoi două lucruri:

1. **semnătura Dilithium-5** asupra mesajului canonic al ancorei și
2. **legătura lot ↔ ancoră prin state-root** — faptul că lotul pe care îl
   dețineți este cel consemnat de ancoră.

```ts
// Online verification: fetch the creator's PQC key from the chain.
const online = await verifySettlementReceipt(receipt, { client: rdk });
```

## Citirea ancorelor

Bonurile sunt construite din interogarea on-chain **Anchor** a modulului
`x/multilayer`, disponibilă atât prin gRPC, cât și prin REST începând cu
versiunea de lanț **v3.1.80** (vezi
[REST / gRPC Endpoints](/api-reference/rest-grpc-endpoints#multilayer-module)).
Citirile:

- `getAnchor(layerId)` — ancora pentru un layer.
- `getLatestAnchor()` — cea mai recentă ancoră.
- `getAnchors(layerId)` — istoricul ancorelor pentru un layer.
- `getPqcAccount(address)` — un cont post-cuantic înregistrat (cheia sa
  ML-DSA-87), folosit pentru verificarea semnăturii creatorului.

## CLI

```bash
# Build a receipt and print it.
qorollup receipt my-roll 7

# Build, then verify it inline.
qorollup receipt my-roll 7 --verify

# Build and write it to a file.
qorollup receipt my-roll 7 --out receipt.json
```

Vezi [Implementarea unui Rollup](/rollups/deploying-a-rollup) pentru CLI-ul
complet de operator `qorollup`.

## Alte limbaje

Clienții Python, Go, Rust și Java (JVM) expun aceeași suprafață de
construire/verificare. Aceștia efectuează verificarea ML-DSA-87 prin biblioteca
[`qorechain-pqc`](https://github.com/qorechain), nu printr-o implementare
JavaScript inclusă; instalați-o alături de clientul RDK pentru limbajul
dumneavoastră.
