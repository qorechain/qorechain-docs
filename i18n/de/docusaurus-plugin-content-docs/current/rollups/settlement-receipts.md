---
slug: /rollups/settlement-receipts
title: Abwicklungsbelege
sidebar_label: Abwicklungsbelege
sidebar_position: 6
---

# Abwicklungsbelege

Ein **Abwicklungsbeleg** ist ein portabler Nachweis dafür, dass der Abwicklungs-Batch eines Rollups unter einer Post-Quanten-Signatur an der Main Chain verankert wurde. Er benennt das Rollup, den Batch und den Anker und trägt die **ML-DSA-87**-Signatur (Dilithium-5, FIPS-204) des Ankers, also dasselbe Verfahren, das die Main Chain verwendet.

:::caution Frühes Stadium: Es gibt noch keine Anker
Belege hängen von Ankern ab, und **auf keinem der beiden Netzwerke existiert bisher ein Rollup oder ein Anker** (geprüft am 27. Oktober 2026). Seit v3.2.2 (auf beiden Netzwerken live) wird ein Batch, der mit einer `anchor_signature` eingereicht wird, in derselben Transaktion in `x/multilayer` verankert; ein Batch ohne diese Signatur wird unverankert abgewickelt. Das TypeScript-RDK (0.6.0 bis 0.7.0) sendet dieses Feld, wenn sein Transaktions-Client hybrid signiert und der Ersteller des Rollups ist, und reicht andernfalls unverankert ein; die Clients für Python, Go, Rust und Java signieren nur klassisch und bauen das Feld nicht. Nichts davon wurde auf einem Live-Rollup erprobt. Betrachten Sie diese Seite als Beschreibung des Designs und der Bausteine, nicht eines Dienstes, auf den Sie sich heute verlassen können.
:::

## Ein Beleg ist eine Behauptung, kein Beweis {#a-receipt-is-a-claim}

Jedes Feld in einem Beleg stammt von demjenigen, der ihn Ihnen übergibt. Die Prüfung der Signatur gegen einen Schlüssel, den man Ihnen gegeben hat, zeigt, dass jemand mit diesem Schlüssel diese Bytes signiert hat; sie zeigt nicht, dass QoreChain irgendetwas verankert hat. Ein Verifizierer braucht daher einen Client, der mit einer QoreChain-Node seines Vertrauens verbunden ist, und liest die Behauptung aus dem Chain-Zustand erneut aus: das Rollup und seinen Layer, den Batch und seine State Root, den Anker sowie den registrierten Post-Quanten-Schlüssel des Erstellers.

## Was der Anker signiert {#what-the-anchor-signs}

Die Signatur des Ankers wird mit dem registrierten ML-DSA-87-Schlüssel des **Rollup-Erstellers** erzeugt. Die signierte Nachricht hängt von der Höhe ab, bei der der Anker eingereicht wird. **Ab v3.2.2 (Mainnet-Höhe 3,556,788, Testnet-Höhe 6,905,034) ist es die v2-Nachricht**: ein Domain-Tag, die Chain-ID sowie längenpräfixierte `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, Transaktionsanzahl und komprimierter State Proof (das genaue Layout steht unter [Anker auslesen](/architecture/multilayer-architecture#reading-anchors)). Die Chain akzeptiert ab dieser Höhe keinen v1-Anker mehr (`layer_id || layer_height || state_root || validator_set_hash`, ohne Chain-ID). Kodieren Sie keine der beiden Formen fest ein: Lesen Sie die Sign-Bytes für das Netzwerk aus, das Sie ansprechen. Das RDK baut die v2-Bytes mit `anchorSignBytesForBatch` (und beide Formen mit `anchorSignBytesV1` / `anchorSignBytesV2`), und die CLI gibt sie aus, zum Beispiel mit `qorechaind query rdk anchor-sign-bytes <layer-id> <batch-index> <state-root-hex> --chain-id <id> --tx-count <n>`.

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

Übergeben Sie bei jeder Verifikation einen `client`. Die Beleg-API und ihre Prüfungen haben sich zwischen den Versionen geändert, verwenden Sie daher 0.7.0 (das aktuelle Release; seine Beleg-Prüfungen sind die in 0.6.1 eingeführten): 0.5.0 konnte die Chain-Prüfung nicht abschließen, und 0.6.0 verglich nicht jedes Feld des Belegs (siehe unten). Die Clients für Python, Go, Rust und Java bieten dieselbe Build-/Verify-Schnittstelle; ihre Releases ab 0.6.1 verwenden dieselbe Singular-Route für die Schlüsselsuche, dieselbe höhenbasierte Wahl der Anker-Nachricht und denselben feldweisen Vergleich.

### Was 0.7.0 verifiziert {#what-060-verifies}

`verifySettlementReceipt` meldet niemals `valid` allein anhand des Belegs: Ohne `client` lautet das Ergebnis `mode: "signature-only"` und `valid: false`. Mit einem `client` liest es die Chain erneut aus und meldet jede Prüfung einzeln:

* `rollupLayerBinding`: Die Chain bestätigt, dass das Rollup zum Layer des Belegs gehört;
* `batchStateRoot`: Der Batch der Chain trägt die State Root des Belegs;
* `anchorOnChain`: Auf der Chain existiert ein Anker, der **jedes** Anker-Feld erfüllt, das der Beleg nennt: State Root, Layer-Höhe, Validator-Set-Hash, Signatur, Main-Chain-Höhe, Anker-Zeitpunkt, Algorithmus und Version sowie bei einem Beleg der Version 2 die Transaktionsanzahl und der komprimierte State Proof. Eine Abweichung nennt das Feld;
* `creatorAuthority`: Der signierende Schlüssel wurde aus der Chain gelesen (`/qorechain/pqc/v1/account/{address}`), nicht aus dem Beleg übernommen;
* `pqcSignature`: Die ML-DSA-87-Signatur verifiziert sich über die kanonische Anker-Nachricht;
* `chainBinding`: Der Beleg benennt die Chain, die tatsächlich abgefragt wurde.

Die Anker-Nachricht wird anhand der Höhe gewählt, bei der der Anker aufgezeichnet wurde (v1 unterhalb des Umschaltpunkts von v3.2.2, v2 ab diesem), niemals durch Ausprobieren beider, denn eine v1-Signatur trägt keine Chain-ID und würde auf jeder Chain verifiziert. Das Paket enthält die Umschalthöhe für das Mainnet (3,556,788) und das Testnet (6,905,034). Das Ergebnis meldet die verwendete Form als `signBytesVersion`. Das Beleg-Schema v2 zeichnet `chainId` auf; ein Beleg der Version 1 trägt keine, daher besteht er `chainBinding` nur, weil sein Anker auf der abgefragten Chain gefunden wurde. Die Verifikation weist einen Beleg zurück, der gegen eine Node einer anderen Chain geprüft wird. Bevor etwas von der Chain gelesen wird, weist `receiptSchemaError` einen Beleg mit unbekannter `version`, einem anderen `algorithm` als `ML-DSA-87` oder (Version 2) ohne `chainId` zurück.

Seit 0.6.1 trägt das Ergebnis außerdem den eigenen `anchor` der Chain und, wenn `valid` true ist, einen aus dem Chain-Zustand neu aufgebauten `verifiedReceipt` (`verified_receipt` in Python und Rust, `VerifiedReceipt` in Go): Lesen Sie Fakten aus diesen, nicht aus dem Beleg, der Ihnen übergeben wurde. `qorollup receipt verify --json` gibt diesen aus der Chain gelesenen Beleg als `receipt` zurück (`null`, wenn der Beleg nicht gültig ist), statt die Datei zurückzugeben. Belege der Version 1, die der Transaktionsanzahl und dem Proof vorausgehen, werden weiterhin verifiziert.

Auf keinem der beiden Netzwerke existiert ein Anker, daher wurde dies nur gegen den Paketcode und offline geprüft, nicht gegen einen echten Anker. `buildSettlementReceipt` funktioniert erst, wenn ein Anker den Batch abdeckt.

:::note Versionen vor 0.6.1
`verifySettlementReceipt` in 0.6.0 glich den Anker der Chain anhand seiner State Root, Layer-Höhe, seines Validator-Set-Hashs und seiner Signatur ab, verglich aber die übrigen Felder, die ein Beleg zeigt, nicht (Main-Chain-Höhe, Anker-Zeitpunkt, Algorithmus, Version sowie bei einem Beleg der Version 2 die Transaktionsanzahl und der komprimierte State Proof), und behandelte die Batch-State-Root als rein informativ. Die Settlement-Aussage selbst (State Root, Anker-Signatur, Schlüssel des Erstellers) war stets gebunden; was 0.6.0 Ihnen nicht sagen konnte, war, ob die daneben ausgegebenen Metadaten mit der Chain übereinstimmten. Verwenden Sie 0.7.0.

`verifySettlementReceipt` in 0.5.0 schlug gegen die Live-Netzwerke geschlossen fehl (fail closed), aus zwei Gründen, die im Client lagen, nicht in der Chain: Er schlug den Schlüssel des Erstellers über eine Pluralform `accounts` der Post-Quanten-Kontoroute nach, die die Netzwerke nicht bereitstellen (HTTP 501), und er baute nur die v1-Nachricht nach, die die Chain für Anker seit v3.2.2 nicht mehr akzeptiert. Ein echter Beleg konnte daher nicht verifiziert werden, und ein gefälschter wurde dennoch zurückgewiesen. Verwenden Sie 0.7.0.
:::

## CLI {#cli}

```bash
qorollup receipt my-rollup 7                 # build and print
qorollup receipt my-rollup 7 --out receipt.json
```

Siehe [Ein Rollup deployen](/rollups/deploying-a-rollup) für die vollständige `qorollup`-Operator-CLI.
