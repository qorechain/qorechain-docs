---
slug: /rollups/settlement-receipts
title: Bonuri de decontare rezistente cuantic
sidebar_label: Bonuri de decontare
sidebar_position: 6
---

# Bonuri de decontare rezistente cuantic

Un **bon de decontare** este o dovadă portabilă, autonomă, că un batch de decontare
al unui rollup a fost ancorat pe Main Chain sub o semnătură post-cuantică.
Acesta leagă un batch specific de ancora on-chain care a fixat starea rollup-ului
la acea înălțime și poate fi verificat **complet offline** — fără nod, fără
încredere în calea de rețea a verificatorului.

Semnătura de ancorare este **ML-DSA-87** (Dilithium-5, FIPS-204), aceeași
schemă post-cuantică pe care o folosește Main Chain, astfel încât un bon moștenește integritatea
rezistentă cuantic a lanțului de bază.

## Mesajul canonic de ancorare

Verificarea controlează o semnătură Dilithium-5 peste un mesaj canonic construit din
câmpurile ancorei, concatenate exact în această ordine:

```
layer_id || layer_height (8-byte big-endian) || state_root || validator_set_hash
```

`anchorSignBytes(...)` produce acești octeți; verificatorul îi reconstruiește din
bon și verifică semnătura față de cheia ML-DSA-87 înregistrată a creatorului stratului.

## Construire și verificare (TypeScript)

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

Dacă transmiți un `client` în loc de (sau alături de) `creatorPublicKey`, verificarea
preia de pe lanț cheia ML-DSA-87 înregistrată a creatorului stratului
(`getPqcAccount(address)`). Verificarea controlează apoi două lucruri:

1. **semnătura Dilithium-5** peste mesajul canonic de ancorare și
2. **legătura batch ↔ ancoră prin rădăcina de stare** — că batch-ul pe care îl deții este cel
   pe care l-a fixat ancora.

```ts
// Online verification: fetch the creator's PQC key from the chain.
const online = await verifySettlementReceipt(receipt, { client: rdk });
```

## Citirea ancorelor

Bonurile sunt construite din interogarea on-chain **Anchor** din `x/multilayer`,
disponibilă atât prin gRPC, cât și prin REST începând cu versiunea de lanț
**v3.1.80** (vezi
[REST / gRPC Endpoints](/api-reference/rest-grpc-endpoints#multilayer-module)).
Citirile:

- `getAnchor(layerId)` — ancora pentru un strat.
- `getLatestAnchor()` — cea mai recentă ancoră.
- `getAnchors(layerId)` — istoricul ancorelor pentru un strat.
- `getPqcAccount(address)` — un cont post-cuantic înregistrat (cheia sa ML-DSA-87),
  folosit pentru a verifica semnătura creatorului.

## CLI

```bash
# Build a receipt and print it.
qorollup receipt my-roll 7

# Build, then verify it inline.
qorollup receipt my-roll 7 --verify

# Build and write it to a file.
qorollup receipt my-roll 7 --out receipt.json
```

Vezi [Deploying a Rollup](/rollups/deploying-a-rollup) pentru CLI-ul complet de operator
`qorollup`.

## Alte limbaje

Clienturile Python, Go, Rust și Java (JVM) expun aceeași suprafață de
construire/verificare. Acestea efectuează verificarea ML-DSA-87 prin biblioteca
[`qorechain-pqc`](https://github.com/qorechain) și nu printr-o implementare
JavaScript inclusă; instaleaz-o alături de clientul RDK pentru limbajul tău.
