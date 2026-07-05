---
slug: /rollups/settlement-receipts
title: Quantensichere Abwicklungsbelege
sidebar_label: Abwicklungsbelege
sidebar_position: 6
---

# Quantensichere Abwicklungsbelege

Ein **Abwicklungsbeleg** ist ein portabler, in sich geschlossener Nachweis
dafür, dass ein Abwicklungs-Batch eines Rollups unter einer
Post-Quanten-Signatur an der Main Chain verankert wurde. Er bindet einen
bestimmten Batch an den On-Chain-Anker, der den Zustand des Rollups auf dieser
Höhe festgeschrieben hat, und er kann **vollständig offline** verifiziert
werden — keine Node, kein Vertrauen in den Netzwerkpfad des Verifizierers.

Die Ankersignatur ist **ML-DSA-87** (Dilithium-5, FIPS-204), dasselbe
Post-Quanten-Verfahren, das die Main Chain verwendet, sodass ein Beleg die
quantensichere Integrität der Basis-Chain erbt.

## Die kanonische Anker-Nachricht

Die Verifikation prüft eine Dilithium-5-Signatur über eine kanonische
Nachricht, die aus den Anker-Feldern gebildet wird, konkateniert in genau
dieser Reihenfolge:

```
layer_id || layer_height (8-byte big-endian) || state_root || validator_set_hash
```

`anchorSignBytes(...)` erzeugt diese Bytes; der Verifizierer rekonstruiert sie
aus dem Beleg und prüft die Signatur gegen den registrierten
ML-DSA-87-Schlüssel des Layer-Erstellers.

## Erstellen und verifizieren (TypeScript)

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

Wenn Sie statt (oder zusätzlich zu) `creatorPublicKey` einen `client`
übergeben, holt die Verifikation den registrierten ML-DSA-87-Schlüssel des
Layer-Erstellers von der Chain (`getPqcAccount(address)`). Die Verifikation
prüft dann zwei Dinge:

1. die **Dilithium-5-Signatur** über die kanonische Anker-Nachricht, und
2. die **Batch-↔-Anker-State-Root-Bindung** — also dass der Batch, den Sie
   halten, derjenige ist, den der Anker festgeschrieben hat.

```ts
// Online verification: fetch the creator's PQC key from the chain.
const online = await verifySettlementReceipt(receipt, { client: rdk });
```

## Anker auslesen

Belege werden aus der On-Chain-**Anchor**-Abfrage von `x/multilayer` erstellt,
die seit Chain-Version **v3.1.80** sowohl über gRPC als auch über REST
verfügbar ist (siehe
[REST- / gRPC-Endpunkte](/api-reference/rest-grpc-endpoints#multilayer-module)).
Die Lesezugriffe:

- `getAnchor(layerId)` — der Anker für einen Layer.
- `getLatestAnchor()` — der jüngste Anker.
- `getAnchors(layerId)` — die Anker-Historie eines Layers.
- `getPqcAccount(address)` — ein registriertes Post-Quanten-Konto (dessen
  ML-DSA-87-Schlüssel), verwendet zur Verifikation der Signatur des Erstellers.

## CLI

```bash
# Build a receipt and print it.
qorollup receipt my-roll 7

# Build, then verify it inline.
qorollup receipt my-roll 7 --verify

# Build and write it to a file.
qorollup receipt my-roll 7 --out receipt.json
```

Siehe [Ein Rollup deployen](/rollups/deploying-a-rollup) für die vollständige
`qorollup`-Operator-CLI.

## Weitere Sprachen

Die Clients für Python, Go, Rust und Java (JVM) bieten dieselbe
Build-/Verify-Schnittstelle. Sie führen die ML-DSA-87-Verifikation über die
Bibliothek [`qorechain-pqc`](https://github.com/qorechain) durch statt über
eine mitgelieferte JavaScript-Implementierung; installieren Sie sie zusätzlich
zum RDK-Client für Ihre Sprache.
