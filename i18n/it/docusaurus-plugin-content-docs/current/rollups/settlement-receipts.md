---
slug: /rollups/settlement-receipts
title: Ricevute di settlement quantum-safe
sidebar_label: Ricevute di Settlement
sidebar_position: 6
---

# Ricevute di settlement quantum-safe

Una **ricevuta di settlement** è una prova portabile e autosufficiente che un
batch di settlement di un rollup è stato ancorato alla Main Chain sotto una firma
post-quantum. Lega uno specifico batch all'anchor on-chain che ha confermato lo
stato del rollup a quell'altezza, e può essere verificata **completamente
offline** — nessun nodo, nessuna fiducia nel percorso di rete del verificatore.

La firma dell'anchor è **ML-DSA-87** (Dilithium-5, FIPS-204), lo stesso schema
post-quantum usato dalla Main Chain, così una ricevuta eredita l'integrità
quantum-safe della chain base.

## Il messaggio canonico dell'anchor

La verifica controlla una firma Dilithium-5 su un messaggio canonico costruito
dai campi dell'anchor, concatenati esattamente in questo ordine:

```
layer_id || layer_height (8-byte big-endian) || state_root || validator_set_hash
```

`anchorSignBytes(...)` produce questi byte; il verificatore li ricostruisce dalla
ricevuta e controlla la firma rispetto alla chiave ML-DSA-87 registrata del
creatore del layer.

## Costruzione e verifica (TypeScript)

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

Se passi un `client` invece di (o insieme a) `creatorPublicKey`, la verifica
recupera la chiave ML-DSA-87 registrata del creatore del layer dalla chain
(`getPqcAccount(address)`). La verifica controlla quindi due cose:

1. la **firma Dilithium-5** sul messaggio canonico dell'anchor, e
2. il **legame state-root tra batch e anchor** — che il batch in tuo possesso sia
   quello confermato dall'anchor.

```ts
// Online verification: fetch the creator's PQC key from the chain.
const online = await verifySettlementReceipt(receipt, { client: rdk });
```

## Lettura degli anchor

Le ricevute vengono costruite da una nuova query **Anchor** on-chain di
`x/multilayer`. Le letture:

- `getAnchor(layerId)` — l'anchor per un layer.
- `getLatestAnchor()` — l'anchor più recente.
- `getAnchors(layerId)` — la cronologia degli anchor per un layer.
- `getPqcAccount(address)` — un account post-quantum registrato (la sua chiave
  ML-DSA-87), usato per verificare la firma del creatore.

## CLI

```bash
# Build a receipt and print it.
qorollup receipt my-roll 7

# Build, then verify it inline.
qorollup receipt my-roll 7 --verify

# Build and write it to a file.
qorollup receipt my-roll 7 --out receipt.json
```

Vedi [Deploying a Rollup](/rollups/deploying-a-rollup) per la CLI operatore
`qorollup` completa.

## Altri linguaggi

I client Python, Go, Rust e Java (JVM) espongono la stessa superficie di
costruzione/verifica. Eseguono la verifica ML-DSA-87 tramite la libreria
[`qorechain-pqc`](https://github.com/qorechain) anziché un'implementazione
JavaScript inclusa; installala insieme al client RDK per il tuo linguaggio.
