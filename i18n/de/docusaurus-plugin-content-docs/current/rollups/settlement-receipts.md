---
slug: /rollups/settlement-receipts
title: Quantensichere Abwicklungsbelege
sidebar_label: Abwicklungsbelege
sidebar_position: 6
---

# Quantensichere Abwicklungsbelege

Ein **Abwicklungsbeleg** ist ein portabler Nachweis dafür, dass der Abwicklungs-Batch eines Rollups unter einer Post-Quanten-Signatur an der Main Chain verankert wurde. Er benennt das Rollup, den Batch und den Anker und trägt die **ML-DSA-87**-Signatur (Dilithium-5, FIPS-204) des Ankers, also dasselbe Verfahren, das die Main Chain verwendet.

:::caution Frühes Stadium: Es gibt noch keine Anker
Belege hängen von Ankern ab, und **auf keinem der beiden Netzwerke existiert bisher ein Rollup oder ein Anker**. Im Mainnet schreibt das RDK noch keine Anker: Abwicklungs-Batches werden aufgezeichnet, der Verankerungsschritt wird jedoch übersprungen. Betrachten Sie diese Seite als Beschreibung des Designs und der Bausteine, nicht eines Dienstes, auf den Sie sich heute verlassen können.
:::

## Ein Beleg ist eine Behauptung, kein Beweis {#a-receipt-is-a-claim}

Jedes Feld in einem Beleg stammt von demjenigen, der ihn Ihnen übergibt. Die Prüfung der Signatur gegen einen Schlüssel, den man Ihnen gegeben hat, zeigt, dass jemand mit diesem Schlüssel diese Bytes signiert hat; sie zeigt nicht, dass QoreChain irgendetwas verankert hat. Ein Verifizierer braucht daher einen Client, der mit einer QoreChain-Node seines Vertrauens verbunden ist, und liest die Behauptung aus dem Chain-Zustand erneut aus: das Rollup und seinen Layer, den Batch und seine State Root, den Anker sowie den registrierten Post-Quanten-Schlüssel des Erstellers.

## Was der Anker signiert {#what-the-anchor-signs}

Die Signatur des Ankers wird mit dem registrierten ML-DSA-87-Schlüssel des **Rollup-Erstellers** erzeugt. Im Mainnet lautet die signierte Nachricht heute

```
layer_id || layer_height (8-byte big-endian) || state_root || validator_set_hash
```

Eine neuere Chain-Version ändert die signierte Nachricht, kodieren Sie sie daher nicht fest ein: Lesen Sie die Sign-Bytes für das Netzwerk aus, das Sie ansprechen. Ein Anker ist ein Objekt auf Layer-Ebene: Er benennt weder das Rollup noch den Batch, deshalb bindet ein Verifizierer sie über Chain-Lesezugriffe (siehe [Multilayer-Architektur](/architecture/multilayer-architecture#reading-anchors)).

## Anker auslesen {#reading-anchors}

Anker sind über REST und gRPC lesbar (`/qorechain/multilayer/v1/anchor/{layer_id}` für den neuesten Anker und `/qorechain/multilayer/v1/anchors/{layer_id}` für die Historie), der registrierte Post-Quanten-Schlüssel eines Kontos unter `/qorechain/pqc/v1/account/{address}`. Die Batches eines Rollups werden mit `qorechaind query rdk batch [rollup-id]` gelesen (die RDK-REST-Routen werden im Mainnet heute nicht bereitgestellt).

## Erstellen und verifizieren (TypeScript) {#build-and-verify}

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

Übergeben Sie bei jeder Verifikation einen `client`. Verwenden Sie die neueste veröffentlichte Version Ihres RDK-Clients: Die Beleg-API und ihre Prüfungen haben sich zwischen den Versionen geändert, und die Clients für Python, Go, Rust und Java bieten dieselbe Build-/Verify-Schnittstelle (sie führen die ML-DSA-87-Verifikation über die Bibliothek [`qorechain-pqc`](https://github.com/qorechain) durch).

:::note Aktuelle Einschränkungen der Clients
Die veröffentlichten RDK-Clients schlagen den Schlüssel des Erstellers über einen Pfad nach, den die Live-Chain nicht bereitstellt, sodass die Online-Verifikation gegen die Live-Netzwerke noch nicht abgeschlossen wird. Bis eine Client-Version dies behebt, verwenden Sie einen Beleg nur als Aufzeichnung, die Sie mit dem Anker abgleichen, den Sie von Ihrer eigenen Node lesen.
:::

## CLI {#cli}

```bash
qorollup receipt my-rollup 7                 # build and print
qorollup receipt my-rollup 7 --out receipt.json
```

Siehe [Ein Rollup deployen](/rollups/deploying-a-rollup) für die vollständige `qorollup`-Operator-CLI.
