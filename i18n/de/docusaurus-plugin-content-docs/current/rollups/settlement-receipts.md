---
slug: /rollups/settlement-receipts
title: Quantensichere Abwicklungsbelege
sidebar_label: Abwicklungsbelege
sidebar_position: 6
---

# Quantensichere Abwicklungsbelege

Ein **Abwicklungsbeleg** ist ein portabler Nachweis dafür, dass der Abwicklungs-Batch eines Rollups unter einer Post-Quanten-Signatur an der Main Chain verankert wurde. Er benennt das Rollup, den Batch und den Anker und trägt die **ML-DSA-87**-Signatur (Dilithium-5, FIPS-204) des Ankers, also dasselbe Verfahren, das die Main Chain verwendet.

:::caution Frühes Stadium: Es gibt noch keine Anker
Belege hängen von Ankern ab, und **auf keinem der beiden Netzwerke existiert bisher ein Rollup oder ein Anker** (geprüft am 20. Oktober 2026). Seit v3.2.2 (auf beiden Netzwerken live) wird ein Batch, der mit einer `anchor_signature` eingereicht wird, in derselben Transaktion in `x/multilayer` verankert; ein Batch ohne diese Signatur wird unverankert abgewickelt. Die veröffentlichten RDK-Clients (0.5.0) senden dieses Feld nicht, daher sind die von ihnen eingereichten Batches unverankert. Betrachten Sie diese Seite als Beschreibung des Designs und der Bausteine, nicht eines Dienstes, auf den Sie sich heute verlassen können.
:::

## Ein Beleg ist eine Behauptung, kein Beweis {#a-receipt-is-a-claim}

Jedes Feld in einem Beleg stammt von demjenigen, der ihn Ihnen übergibt. Die Prüfung der Signatur gegen einen Schlüssel, den man Ihnen gegeben hat, zeigt, dass jemand mit diesem Schlüssel diese Bytes signiert hat; sie zeigt nicht, dass QoreChain irgendetwas verankert hat. Ein Verifizierer braucht daher einen Client, der mit einer QoreChain-Node seines Vertrauens verbunden ist, und liest die Behauptung aus dem Chain-Zustand erneut aus: das Rollup und seinen Layer, den Batch und seine State Root, den Anker sowie den registrierten Post-Quanten-Schlüssel des Erstellers.

## Was der Anker signiert {#what-the-anchor-signs}

Die Signatur des Ankers wird mit dem registrierten ML-DSA-87-Schlüssel des **Rollup-Erstellers** erzeugt. Die signierte Nachricht hängt von der Höhe ab, bei der der Anker eingereicht wird. **Ab v3.2.2 (Mainnet-Höhe 3,556,788, Testnet-Höhe 6,905,034) ist es die v2-Nachricht**: ein Domain-Tag, die Chain-ID sowie längenpräfixierte `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, Transaktionsanzahl und komprimierter State Proof (das genaue Layout steht unter [Anker auslesen](/architecture/multilayer-architecture#reading-anchors)). Die Chain akzeptiert ab dieser Höhe keinen v1-Anker mehr (`layer_id || layer_height || state_root || validator_set_hash`, ohne Chain-ID). Kodieren Sie keine der beiden Formen fest ein: Lesen Sie die Sign-Bytes für das Netzwerk aus, das Sie ansprechen, zum Beispiel mit `qorechaind query rdk anchor-sign-bytes <layer-id> <batch-index> <state-root-hex> --chain-id <id> --tx-count <n>`.

Ein Anker ist ein Objekt auf Layer-Ebene: Er benennt weder das Rollup noch den Batch, deshalb bindet ein Verifizierer sie über Chain-Lesezugriffe (siehe [Multilayer-Architektur](/architecture/multilayer-architecture#reading-anchors)).

## Anker auslesen {#reading-anchors}

Anker sind über REST und gRPC lesbar (`/qorechain/multilayer/v1/anchor/{layer_id}` für den neuesten Anker und `/qorechain/multilayer/v1/anchors/{layer_id}` für die Historie), der registrierte Post-Quanten-Schlüssel eines Kontos unter `/qorechain/pqc/v1/account/{address}` (Singular `account`). Die Batches eines Rollups werden über die RDK-REST-Routen gelesen (`/qorechain/rdk/v1/batch/{rollup_id}/{batch_index}`, `/qorechain/rdk/v1/latest_batch/{rollup_id}`, `/qorechain/rdk/v1/batches/{rollup_id}`), die beide Netzwerke bereitstellen, oder mit `qorechaind query rdk batch [rollup-id]`.

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

Übergeben Sie bei jeder Verifikation einen `client`. Die Beleg-API und ihre Prüfungen haben sich zwischen den Versionen geändert, verwenden Sie daher eine Version, die gegen die Chain verifiziert (0.5.0 oder neuer). Die Clients für Python, Go, Rust und Java bieten dieselbe Build-/Verify-Schnittstelle (alle fünf Clients verwenden denselben Pluralpfad für die Schlüsselsuche wie in der folgenden Einschränkung).

:::caution Aktuelle Einschränkungen der Clients (RDK 0.5.0)
`verifySettlementReceipt` meldet in 0.5.0 niemals `valid` allein anhand des Belegs (ohne `client` lautet das Ergebnis `mode: "signature-only"` und `valid: false`), und seine Chain-Prüfung wird gegen die Live-Netzwerke noch nicht abgeschlossen, aus zwei Gründen, die im Client liegen, nicht in der Chain:

* Er schlägt den Schlüssel des Erstellers über die Pluralform `accounts` der Post-Quanten-Kontoroute nach, die die Netzwerke nicht bereitstellen (HTTP 501; die funktionierende Route ist die Singularform `account`), sodass das Ergebnis mit einem `client` `valid: false` lautet, mit der Begründung, dass der Post-Quanten-Schlüssel des Erstellers nicht aufgelöst werden konnte; und
* er baut die signierte Nachricht im v1-Layout nach, das die Chain für Anker seit v3.2.2 nicht mehr akzeptiert, sodass er selbst mit dem Schlüssel in der Hand keine echte v2-Signatur verifizieren könnte.

`buildSettlementReceipt` funktioniert erst, wenn ein Anker den Batch abdeckt, und es existiert keiner. Verwenden Sie einen Beleg nur als Aufzeichnung, die Sie mit dem Anker und dem Schlüssel des Erstellers abgleichen, die Sie von Ihrer eigenen Node lesen, mit den v2-Sign-Bytes für das Netzwerk.
:::

## CLI {#cli}

```bash
qorollup receipt my-rollup 7                 # build and print
qorollup receipt my-rollup 7 --out receipt.json
```

Siehe [Ein Rollup deployen](/rollups/deploying-a-rollup) für die vollständige `qorollup`-Operator-CLI.
