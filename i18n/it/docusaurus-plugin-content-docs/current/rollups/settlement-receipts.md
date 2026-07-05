---
slug: /rollups/settlement-receipts
title: Ricevute di settlement quantum-safe
sidebar_label: Ricevute di Settlement
sidebar_position: 6
---

# Ricevute di settlement quantum-safe

Una **ricevuta di settlement** è una prova portabile e autosufficiente che un
batch di settlement di un rollup è stato ancorato alla Main Chain sotto una
firma post-quantum. Lega uno specifico batch all'anchor on-chain che ha
confermato lo stato del rollup a quell'altezza, e può essere verificata
**completamente offline** — nessun nodo, nessuna fiducia nel percorso di rete
del verificatore.

La firma dell'anchor è **ML-DSA-87** (Dilithium-5, FIPS-204), lo stesso schema
post-quantum utilizzato dalla Main Chain, quindi una ricevuta eredita
l'integrità quantum-safe della chain di base.

## Il messaggio canonico dell'anchor

La verifica controlla una firma Dilithium-5 su un messaggio canonico costruito
a partire dai campi dell'anchor, concatenati esattamente in questo ordine:

```
layer_id || layer_height (8-byte big-endian) || state_root || validator_set_hash
```

`anchorSignBytes(...)` produce questi byte; il verificatore li ricostruisce a
partire dalla ricevuta e controlla la firma rispetto alla chiave ML-DSA-87
registrata del creatore del layer.

## Costruzione e verifica (TypeScript)

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

Se passi un `client` invece di (o insieme a) `creatorPublicKey`, la verifica
recupera dalla chain la chiave ML-DSA-87 registrata del creatore del layer
(`getPqcAccount(address)`). La verifica controlla quindi due cose:

1. la **firma Dilithium-5** sul messaggio canonico dell'anchor, e
2. il **legame batch ↔ state-root dell'anchor** — ovvero che il batch in tuo
   possesso sia quello confermato dall'anchor.

```ts
// Online verification: fetch the creator's PQC key from the chain.
const online = await verifySettlementReceipt(receipt, { client: rdk });
```

## Lettura degli anchor

Le ricevute sono costruite a partire dalla query on-chain **Anchor** del modulo
`x/multilayer`, disponibile sia via gRPC sia via REST a partire dalla versione
della chain **v3.1.80** (vedi
[Endpoint REST / gRPC](/api-reference/rest-grpc-endpoints#multilayer-module)).
Le letture:

- `getAnchor(layerId)` — l'anchor di un layer.
- `getLatestAnchor()` — l'anchor più recente.
- `getAnchors(layerId)` — la cronologia degli anchor di un layer.
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

Vedi [Deploy di un Rollup](/rollups/deploying-a-rollup) per la CLI operatore
`qorollup` completa.

## Altri linguaggi

I client Python, Go, Rust e Java (JVM) espongono la stessa interfaccia di
costruzione/verifica. Eseguono la verifica ML-DSA-87 tramite la libreria
[`qorechain-pqc`](https://github.com/qorechain) invece di un'implementazione
JavaScript inclusa; installala insieme al client RDK per il tuo linguaggio.
