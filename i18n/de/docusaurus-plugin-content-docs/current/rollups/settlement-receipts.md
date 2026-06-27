---
slug: /rollups/settlement-receipts
title: Quantensichere Abwicklungsbelege
sidebar_label: Abwicklungsbelege
sidebar_position: 6
---

# Quantensichere Abwicklungsbelege

Ein **Abwicklungsbeleg** ist ein portabler, in sich geschlossener Nachweis, dass ein
Abwicklungs-Batch eines Rollups unter einer Post-Quanten-Signatur an der Main Chain verankert wurde.
Er bindet einen bestimmten Batch an den On-Chain-Anker, der den Zustand des Rollups
auf dieser Höhe festgeschrieben hat, und er kann **vollständig offline** verifiziert werden — keine Node, kein
Vertrauen in den Netzwerkpfad des Verifizierers.

Die Ankersignatur ist **ML-DSA-87** (Dilithium-5, FIPS-204), dasselbe
Post-Quanten-Verfahren, das die Main Chain verwendet, sodass ein Beleg die
quantensichere Integrität der Basis-Chain erbt.

## Die kanonische Anker-Nachricht

Die Verifizierung prüft eine Dilithium-5-Signatur über eine kanonische Nachricht, die aus den
Ankerfeldern aufgebaut ist, in genau dieser Reihenfolge verkettet:

```
layer_id || layer_height (8-byte big-endian) || state_root || validator_set_hash
```

`anchorSignBytes(...)` erzeugt diese Bytes; der Verifizierer rekonstruiert sie aus
dem Beleg und prüft die Signatur gegen den registrierten ML-DSA-87-Schlüssel des Layer-Erstellers.

## Erstellen und verifizieren (TypeScript)

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

Wenn Sie einen `client` anstelle von (oder zusätzlich zu) `creatorPublicKey` übergeben, ruft die Verifizierung
den registrierten ML-DSA-87-Schlüssel des Layer-Erstellers von der Chain ab
(`getPqcAccount(address)`). Die Verifizierung prüft dann zwei Dinge:

1. die **Dilithium-5-Signatur** über die kanonische Anker-Nachricht und
2. die **Batch-↔-Anker-State-Root-Bindung** — dass der Batch, den Sie halten, derjenige ist,
   den der Anker festgeschrieben hat.

```ts
// Online verification: fetch the creator's PQC key from the chain.
const online = await verifySettlementReceipt(receipt, { client: rdk });
```

## Anker lesen

Belege werden aus einer neuen On-Chain-`x/multilayer`-**Anchor**-Abfrage erstellt. Die Lesezugriffe:

- `getAnchor(layerId)` — der Anker für einen Layer.
- `getLatestAnchor()` — der jüngste Anker.
- `getAnchors(layerId)` — die Ankerhistorie für einen Layer.
- `getPqcAccount(address)` — ein registriertes Post-Quanten-Konto (sein ML-DSA-87-
  Schlüssel), genutzt zur Verifizierung der Signatur des Erstellers.

## CLI

```bash
# Build a receipt and print it.
qorollup receipt my-roll 7

# Build, then verify it inline.
qorollup receipt my-roll 7 --verify

# Build and write it to a file.
qorollup receipt my-roll 7 --out receipt.json
```

Siehe [Ein Rollup bereitstellen](/rollups/deploying-a-rollup) für die vollständige `qorollup`-
Betreiber-CLI.

## Weitere Sprachen

Die Clients für Python, Go, Rust und Java (JVM) stellen dieselbe Erstellungs-/Verifizierungs-
Oberfläche bereit. Sie führen die ML-DSA-87-Verifizierung über die
Bibliothek [`qorechain-pqc`](https://github.com/qorechain) statt über eine gebündelte
JavaScript-Implementierung durch; installieren Sie sie zusammen mit dem RDK-Client für Ihre
Sprache.
