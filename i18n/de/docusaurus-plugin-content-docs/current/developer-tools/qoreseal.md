---
slug: /developer-tools/qoreseal
title: QoreSeal
sidebar_label: QoreSeal
sidebar_position: 30
---

# QoreSeal (`qoreseal`)

QoreSeal ist eine Open-Source-Bibliothek, die Daten mit ML-KEM-1024 (FIPS 203) an QoreChain-Konten verschlüsselt. Ein Konto veröffentlicht seinen öffentlichen ML-KEM-1024-Schlüssel on-chain; danach kann jeder eine Nutzlast verschlüsseln, die dieses Konto und jeder weitere vom Absender hinzugefügte Empfänger lesen kann. Es richtet sich an dApp-Entwickler, die vertrauliche Nutzlasten benötigen (Memos, Rechnungen, Dokumente, Gebote), an Prüfer, die Einsichtsrechte brauchen, und an Betreiber privater Gruppen und Sidechains. Es setzt Standard-Primitive zusammen und implementiert selbst keine. Version **0.1.0**, Apache-2.0, gepflegt von der QoreChain Association.

Stand am 30. Oktober 2026: Die Verschlüsselung selbst funktioniert überall offline, ohne Netzwerk und ohne Konto. Das Verschlüsseln an eine aus der Chain gelesene Adresse benötigt die KEM-Schlüsselregistry, die im **Testnet live** ist (`qorechain-diana`) und, seit das Mainnet (`qorechain-vladi`) v3.2.5 am 29. Oktober 2026 angewendet hat, **dort ihre Leseroute auch im Mainnet beantwortet** (bisher hat kein Konto dort einen Schlüssel veröffentlicht, den diese Seite finden konnte). Das Paket ist für Rust, Go, Python, Swift, Kotlin/JVM und Android veröffentlicht. Das TypeScript-Paket `@qorechain/qoreseal` **kommt** und ist noch nicht auf npm. Die Konstruktion ist ein Entwurf, der vor 1.0 noch eine externe Prüfung benötigt.

QoreSeal schützt den Inhalt einer Nutzlast, sonst nichts. Adressen, Zeitpunkt der Transaktion, Überweisungsbeträge, Umschlaggrößen und die Zahl der Empfänger bleiben on-chain öffentlich. Es ist kein Weg, Transaktionen privat zu machen.

## Innovationen {#innovations}

- **Ein Umschlag, 1 bis 1.024 Empfänger.** Die Nutzlast wird einmal mit einem zufälligen AES-256-GCM-Datenschlüssel verschlüsselt; der Datenschlüssel wird für jeden Empfänger separat verpackt, sodass ein zusätzlicher Leser etwa 1,6 KB kostet und keine weitere Kopie der Nutzlast.
- **Standardmäßig hybrid, nie stillschweigend herabgestuft.** Im Modus `hybrid` kombiniert jeder Empfängereintrag eine ML-KEM-1024-Kapselung mit einer X25519-Schlüsselvereinbarung über einen SHA3-256-Combiner, sodass die Daten geschützt bleiben, solange eines von beiden hält. Der Modus `mlkem` (ML-KEM-1024 allein) muss ausdrücklich gewählt werden; die Bibliothek fällt nie von selbst darauf zurück.
- **Kontextbindung.** Jeder Umschlag ist über die Schlüsselableitung (HKDF-SHA-256 mit info `"qorechain-kem-v1|" + chainId + "|" + purpose`) an eine Chain-ID und einen Zweck gebunden sowie an optionale zugehörige Daten. Ein für einen Zweck versiegelter Umschlag öffnet sich unter einem anderen nicht.
- **On-chain veröffentlichte Schlüssel, von der Chain geprüft.** Ein Konto registriert seinen ML-KEM-1024-Schlüssel mit `MsgRegisterKEMKey`, authentifiziert durch die hybride Signatur der Transaktion. `validateMlkemPublicKey` wendet dieselben Prüfungen an wie die Chain bei der Registrierung.
- **Empfängerkarten.** Die Registry hält den ML-KEM-Schlüssel und sonst nichts. Der X25519-Schlüssel für den Hybridmodus reist in einer Karte, die das Konto mit dem Nachrichtensignieren von [QoreSign](/qoresign/overview) signiert und an seinen on-chain ML-KEM-Schlüssel bindet. Absender prüfen die Karte gegen beide Schlüssel on-chain, sie kann also aus jedem Kanal stammen. Eine gefälschte oder veraltete Karte kann einen Umschlag höchstens auf ML-KEM-1024-Stärke reduzieren, weil der ML-KEM-Teil immer den Schlüssel on-chain verwendet.
- **Epochenschlüssel für private Gruppen.** `EpochKeyManager` erzeugt bei jeder Änderung der Mitgliedschaft einen neuen Epochenschlüssel und versiegelt ihn an die aktuellen Mitglieder. Ein entferntes Mitglied behält die Schlüssel der Epochen, zu denen es gehörte, und kann spätere nicht lesen.
- **Verschlüsselte Batches mit Commitments.** Der Batch-Codec erzeugt einen verschlüsselten Blob mit einem Chiffretext-Commitment und einem gesalzenen Klartext-Commitment, bereit zur Verankerung auf QoreChain mit dem [RDK](/rollups/overview).
- **Dieselben Bytes in jeder Sprache.** TypeScript und Go sind native Implementierungen; Rust ist der Kern unter Swift, Kotlin und Python. Gemeinsame Testvektoren werden in jeder Sprache Byte für Byte geprüft, und Fehler tragen stabile Codes (zum Beispiel `NOT_A_RECIPIENT`, `DECRYPTION_FAILED`, `CARD_INVALID`, `RECIPIENT_NEEDS_X25519`, `UNKNOWN_EPOCH`, `MALFORMED_ENVELOPE`).

## Anwendungsfälle {#use-cases}

1. **Eine dApp verschlüsselt Memos oder Nachrichten zwischen Nutzern.** Eine Chat- oder Zahlungs-dApp versiegelt jede Notiz mit `sealToAddresses` an die Adresse des Empfängers und speichert den Text `qoreseal:` in einem Memo, einem Vertrag oder ihrer eigenen Datenbank. Nur der Schlüssel des Empfängers öffnet sie.
2. **Rechnungen und Dokumente mit einem Prüferschlüssel (Einsicht).** Ein Unternehmen versiegelt eine Rechnung in einem Umschlag an Käufer, Verkäufer und einen Prüferschlüssel, mit der Rechnungsnummer als zugehörigen Daten. Der Prüferschlüssel ist ein gewöhnliches QoreSeal-Schlüsselpaar, das in der Konfiguration liegt; ein Schlüssel pro Quartal (`deriveSealKeys` mit neuem Index) erlaubt dem Unternehmen, dem Prüfer nur die zu prüfenden Zeiträume zu übergeben.
3. **Versiegelte Gebote und Commit-Reveal.** Eine Auktion versiegelt Gebote an den Auktionsschlüssel mit `purpose: "bid:<auction id>"` und der Adresse des Bieters als zugehörigen Daten, speichert die Umschläge und öffnet sie nach Fristablauf.
4. **Konsortial- oder private Sidechains.** Der Betreiber eines privaten Rollups nutzt `EpochKeyManager`, um einen Epochenschlüssel mit den Mitgliedern zu teilen, verschlüsselt jeden Batch mit `PrivateBatchCodec` und verankert den verschlüsselten Blob und seine Commitments mit dem RDK auf QoreChain.
5. **Wallets, die „verschlüsselte Daten empfangen“ anbieten.** Eine Wallet leitet die QoreSeal-Schlüssel aus der Konto-Mnemonic ab (Index 0), veröffentlicht den ML-KEM-Schlüssel mit einer hybrid signierten `MsgRegisterKEMKey` und zeigt die Empfängerkarte zum Signieren als Klartext an.
6. **Wiederherstellungs- oder Treuhand-Empfänger.** Ein Verwahrungs- oder Compliance-Team fügt jedem Umschlag einen Offline-Wiederherstellungsschlüssel hinzu, sodass Daten den Verlust des Schlüssels eines Nutzers überleben.
7. **Backends in Python oder Go.** Ein Dienst versiegelt Berichte oder Exporte an eine Liste von Konten, byte-kompatibel mit jeder anderen Sprache.

## Funktionsweise {#how-it-works}

Primitive (QoreSeal implementiert keines davon): ML-KEM-1024 (FIPS 203; Kapselungsschlüssel 1.568 Byte, Dekapselungsschlüssel 3.168 Byte, Chiffretext 1.568 Byte), X25519 (RFC 7748), ein SHA3-256-Combiner, HKDF-SHA-256 und AES-256-GCM (96-Bit-Nonce, 128-Bit-Tag).

**Versiegeln**, kurz:

1. Ein zufälliges 16-Byte-Salt und ein zufälliger 32-Byte-Datenschlüssel werden gezogen.
2. Für jeden Empfänger eine ML-KEM-1024-Kapselung an den Schlüssel des Empfängers; im Hybridmodus zusätzlich eine ephemere X25519-Vereinbarung mit dem X25519-Schlüssel des Empfängers, und die beiden Geheimnisse werden mit SHA3-256 kombiniert. Ein Schlüsselverschlüsselungsschlüssel wird mit HKDF-SHA-256 abgeleitet (Salt, info `"qorechain-kem-v1|" + chainId + "|" + purpose`) und verpackt den Datenschlüssel mit AES-256-GCM.
3. Die Nutzlast wird einmal mit dem Datenschlüssel verschlüsselt, wobei der gesamte Header und die optionalen zugehörigen Daten authentifiziert werden.

**Umschlagaufbau:** Magic `QSEL`, Version 1, Modus, Algorithmus-Bytes, Flags, Salt, Empfängeranzahl, ein Eintrag pro Empfänger (Hint, ML-KEM-Chiffretext, ephemerer X25519-Schlüssel im Hybridmodus, verpackter Datenschlüssel), Nonce, Chiffretext. Größe: `56 + 1.664 x Empfänger + Klartext` Byte im Hybridmodus und `56 + 1.632 x Empfänger + Klartext` im Modus `mlkem`. Aus der Spezifikation: 1 Empfänger und 1 KB Klartext sind 2.744 Byte (hybrid); 10 Empfänger und 1 KB sind 17.720 Byte.

Chain-ID und Zweck werden nicht in den Umschlag geschrieben: Der Empfänger muss dieselben Werte übergeben. Eine falsche Chain-ID, ein falscher Zweck oder falsche zugehörige Daten, oder jede Änderung an den Bytes, ergibt `DECRYPTION_FAILED`.

**Hints.** Gesalzene Hints erlauben es einem Empfänger, seinen eigenen Eintrag schnell zu finden. Mit `anonymous: true` werden die Hints auf null gesetzt, und Empfänger probieren jeden Eintrag.

**Textform.** `envelopeToText` und `envelopeFromText` konvertieren zu und von `"qoreseal:" + base64url`.

**Was on-chain liegt**

- Die KEM-Schlüsselregistry im Modul `qorechain.pqc.v1`: `MsgRegisterKEMKey` mit `sender`, `algorithm_id = 2` (ML-KEM-1024) und `public_key`, sowie `MsgRemoveKEMKey` mit `sender`. Type-URLs: `/qorechain.pqc.v1.MsgRegisterKEMKey` und `/qorechain.pqc.v1.MsgRemoveKEMKey`.
- Abfrage: `GET /qorechain/pqc/v1/kem/{address}` (akzeptiert die Form `qor1` oder `0x`), liefert `found` und, wenn gefunden, `key` mit `address`, `algorithm_id`, `algorithm_name`, `public_key` und `registered_height`.
- Die Registrierung wird durch die hybride Signatur der Transaktion authentifiziert. Der Absender muss bereits einen registrierten ML-DSA-87-Schlüssel haben, und die Transaktion wird mit QoreSign `signHybrid` signiert. Ein Schlüssel pro Konto; erneutes Registrieren ersetzt ihn.
- Ablehnungen (Codespace `pqc`): 250 Registry auf dieser Chain noch nicht aktiviert, 251 ungültiger öffentlicher KEM-Schlüssel, 252 für dieses Konto ist kein KEM-Schlüssel veröffentlicht, 253 dieser Schlüssel ist für dieses Konto bereits veröffentlicht, 254 das Veröffentlichen eines KEM-Schlüssels benötigt einen registrierten Post-Quanten-Signaturschlüssel. `describeKemRegistryError` erklärt sie.
- Die Umschläge selbst gehen dorthin, wo die Anwendung sie ablegt (Memos, Verträge, Dateien, APIs). Die Chain sieht nie einen geheimen Schlüssel.

**Empfängerkarte.** Etwa 6,7 KB JSON, hauptsächlich die ML-DSA-87-Signatur. Das Konto signiert einen festen Text (`QoreSeal recipient card v1`, Chain-ID, Adresse, SHA3-256 des ML-KEM-Schlüssels, X25519-Schlüssel, Ausstellungszeit) mit dem Nachrichtensignieren von QoreSign. Das Registrieren eines neuen ML-KEM-Schlüssels setzt jede für den alten Schlüssel erstellte Karte außer Kraft.

**Private Gruppen.** Eine Epochenschlüssel-Nutzlast (`QSEK`, Epochennummer, 32-Byte-Schlüssel) wird in einem gewöhnlichen Umschlag an die aktuellen Mitglieder versiegelt. Ein Batch-Blob (`QSBT`, Epoche, Batch-Index, Kontext wie die Rollup-ID, Nonce, AES-256-GCM-Chiffretext) umfasst `83 + Kontextlänge + Datenlänge` Byte. Commitments: `ciphertextCommitment = SHA3-256(blob)` und `plaintextCommitment = SHA3-256("qorechain-qoreseal-batch-v1" || commitSalt || data)`, gesalzen, damit Außenstehende Inhalte mit niedriger Entropie nicht erraten können.

Die Spezifikation ist `spec/qoreseal-v1.md` im Repository (Status: Entwurf, Prüfung läuft); die gemeinsamen Vektoren sind `vectors/qoreseal-v1.json`.

## Anwendung {#how-to-use}

### Installation {#install}

| Sprache | Installation | Mindestplattform |
|---|---|---|
| Rust | `cargo add qorechain-qoreseal` (Bibliotheksname `qoreseal`) | stabiles Rust |
| Go | `go get github.com/qorechain/qoreseal/go@v0.1.0` | Go 1.25 |
| Python | `pip install qorechain-qoreseal` (Import `qoreseal`) | Python 3.9 oder neuer; Wheels für macOS 11+ (arm64, x86_64) und Linux manylinux2014 (x86_64, aarch64); noch kein Windows-Wheel |
| Swift | `.package(url: "https://github.com/qorechain/qoreseal", from: "0.1.0")`, Produkt `QoreSeal` | iOS 16, macOS 13 |
| Kotlin / JVM | `implementation("io.github.qorechain:qoreseal:0.1.0")` | Java 17; Kotlin-Compiler 2.3 oder neuer (die Kompilierung scheitert mit Kotlin 2.1) |
| Android | `implementation("io.github.qorechain:qoreseal-android:0.1.0")` | API 24; R8-Keep-Regeln enthalten; Kotlin-Compiler 2.3 oder neuer |
| TypeScript | **kommt**: `@qorechain/qoreseal` ist noch nicht auf npm, daher gibt es keinen Installationsbefehl | |

Der TypeScript-Quellcode, seine Beispiele und die Netzwerk-Helfer liegen im Repository und laufen nach `pnpm install && pnpm build` von dort. Solange das npm-Paket nicht veröffentlicht ist, betrachten Sie das Repository als den Weg, TypeScript zu nutzen, und erwarten Sie den oben genannten Paketnamen.

### Quickstart 1: offline versiegeln und öffnen (Python) {#quickstart-python}

Am 27. Oktober 2026 gegen das veröffentlichte Wheel 0.1.0 ausgeführt. Kein Netzwerk, kein Konto. Zwei Empfänger, zugehörige Daten und eine Prüfung, dass ein anderer Zweck den Umschlag nicht öffnet.

```python
import qoreseal as qs

alice = qs.generate_seal_keys()
bob = qs.generate_seal_keys()

envelope = qs.seal_envelope(
    "qorechain-diana", "invoice",
    [qs.recipient_of(alice), qs.recipient_of(bob)],
    b"amount due: 120 QOR",
    aad=b"invoice-42",
)
text = qs.envelope_to_text(envelope)  # "qoreseal:..."

plaintext = qs.open_envelope("qorechain-diana", "invoice", envelope, bob, aad=b"invoice-42")
assert plaintext == b"amount due: 120 QOR"
print(len(envelope), text[:20], plaintext)

# A different purpose never opens the envelope.
try:
    qs.open_envelope("qorechain-diana", "chat", envelope, bob, aad=b"invoice-42")
except qs.QoreSealError.Failure as e:
    print("other purpose:", e.code)
```

Ausgegeben wurde `3403 qoreseal:UVNFTAEBAgE b'amount due: 120 QOR'` und danach `other purpose: DECRYPTION_FAILED`. Die Länge beträgt 56 + 2 x 1.664 + 19 = 3.403 Byte.

### Quickstart 2: offline versiegeln und öffnen (Go) {#quickstart-go}

Gegen v0.1.0 vom Go-Modul-Proxy ausgeführt.

```go
package main

import (
	"fmt"

	qoreseal "github.com/qorechain/qoreseal/go"
)

func main() {
	alice, _ := qoreseal.GenerateSealKeys()
	auditor, _ := qoreseal.GenerateSealKeys()

	envelope, err := qoreseal.Seal(qoreseal.SealArgs{
		ChainID:    "qorechain-diana",
		Purpose:    "invoice",
		Recipients: []qoreseal.SealRecipient{qoreseal.RecipientOf(alice), qoreseal.RecipientOf(auditor)},
		Plaintext:  []byte("120 QOR due on 2026-11-30"),
		AAD:        []byte("invoice-42"),
	})
	if err != nil {
		panic(err)
	}
	plaintext, err := qoreseal.Open(qoreseal.OpenArgs{
		ChainID: "qorechain-diana", Purpose: "invoice", Envelope: envelope, Keys: auditor, AAD: []byte("invoice-42"),
	})
	fmt.Println(len(envelope), string(plaintext), err)
}
```

Ausgegeben wurde `3409 120 QOR due on 2026-11-30 <nil>`.

Rust, Swift und Kotlin verwenden dieselben Aufrufe (`seal`, `open`, `generate_seal_keys` und so weiter, in der Schreibweise der jeweiligen Sprache). Ihre Beispiele wurden für diese Seite nicht ausgeführt.

### Quickstart 3: eine private Gruppe mit Epochen (Python, offline) {#quickstart-group}

Folgt dem Repository-Beispiel `examples/private-rollup`. Alice und Bob starten in Epoche 1, Carol tritt bei (Epoche 2), Bob wird entfernt (Epoche 3). Bob kann Epoche 1 lesen, aber nicht Epoche 3.

```python
import qoreseal as qs

chain_id, rollup_id = "qorechain-diana", "demo-private-rollup"
purpose = f"epoch-key:{rollup_id}"
alice, bob, carol = qs.generate_seal_keys(), qs.generate_seal_keys(), qs.generate_seal_keys()

mgr = qs.EpochKeyManager(chain_id, purpose, [
    qs.GroupMember(id="alice", recipient=qs.recipient_of(alice)),
    qs.GroupMember(id="bob", recipient=qs.recipient_of(bob)),
])
bob_keys = [qs.open_epoch_key(chain_id, purpose, mgr.distribution(), bob)]  # epoch 1

b1 = mgr.seal_batch(rollup_id, 1, b'{"txs":["alice pays bob 5"]}')
mgr.add_member("carol", qs.recipient_of(carol))   # epoch 2
mgr.remove_member("bob")                          # epoch 3
b3 = mgr.seal_batch(rollup_id, 3, b'{"txs":["alice pays carol 1"]}')

print(qs.open_batch(b1.blob, bob_keys).data)      # bob read epoch 1
try:
    qs.open_batch(b3.blob, bob_keys)              # bob was removed before epoch 3
except qs.QoreSealError.Failure as e:
    print("bob, epoch 3:", e.code)
print(b3.ciphertext_commitment.hex(), b3.plaintext_commitment.hex())
```

Ausgegeben wurde Bobs Batch aus Epoche 1, danach `bob, epoch 3: UNKNOWN_EPOCH`, danach die beiden Commitments (bei jedem Lauf zufällig).

Um einen versiegelten Batch mit dem [RDK](/rollups/overview) zu verankern, ist der verschlüsselte Blob der native Datenverfügbarkeits-Blob und sein SHA-256 der `data_hash` des Batches (TypeScript, aus dem Repository-Leitfaden; für diese Seite nicht ausgeführt):

```ts
import { buildDaBlob, submitBatchMsg } from "@qorechain/rdk";

const codec = new PrivateBatchCodec("my-rollup", mgr);
const sealed = codec.seal(batchIndex, batchBytes);
const blob = buildDaBlob({ data: sealed.blob, maxBlobSize: params.maxDaBlobSize });
const msg = submitBatchMsg({ sequencer, rollupId: "my-rollup", batchIndex, stateRoot, txCount, dataHash: blob.dataHash });
```

Wie Rollup-Batches veröffentlicht werden, siehe [Datenverfügbarkeit](/rollups/data-availability).

### An eine Adresse im Testnet verschlüsseln {#encrypt-to-address}

Sie benötigen ein von Ihnen kontrolliertes Konto auf `qorechain-diana` mit etwas Testnet-QOR und einem registrierten ML-DSA-87-Schlüssel (das QoreSign-Beispiel `register-and-send` registriert einen). Verwenden Sie eine Testnet-Mnemonic, niemals eine Mainnet-Mnemonic, und niemals die öffentliche Testphrase mit Guthaben. Dieser Ablauf ist nach dem Repository-Leitfaden beschrieben und wurde für diese Seite nicht ausgeführt.

1. Leiten Sie die Schlüssel aus der Konto-Mnemonic ab: `deriveSealKeys({ mnemonic })` (Index 0). Die Mnemonic ist zugleich ihre Sicherung.
2. Veröffentlichen Sie den ML-KEM-1024-Schlüssel: `buildRegisterKemKeyMessage({ sender: address, mlkemPublicKey: sealKeys.mlkemPublicKey })`, setzen Sie ihn in einen Transaktions-Body, signieren Sie ihn mit QoreSign `signHybrid`, simulieren Sie mit `simulateTx` und senden Sie mit `submitWithSignBytesFallback`. Bei einer Ablehnung erklärt sie `describeKemRegistryError(res.codespace, res.code)`.
3. Prüfen Sie es: `GET https://api-testnet.qore.host/qorechain/pqc/v1/kem/<address>`. Für ein Konto, das keinen Schlüssel veröffentlicht hat, antwortet es `{"found":false,"key":null}`.
4. Signieren Sie eine Empfängerkarte: `signRecipientCard({ chainId: "qorechain-diana", address, keys: sealKeys, classicalKey, pqKey })`, und veröffentlichen Sie sie dort, wo Absender sie abrufen können.
5. Absenderseite: `sealToAddresses({ rest: "https://api-testnet.qore.host", chainId: "qorechain-diana", purpose: "note", recipients: [{ address, card }], plaintext })`. Ohne Karte übergeben Sie `mode: "mlkem"`.
6. Empfängerseite: `open({ chainId: "qorechain-diana", purpose: "note", envelope, keys: sealKeys })`.

Der vollständige lauffähige Ablauf ist das Repository-Beispiel `examples/register-and-encrypt`. Das Mainnet hat v3.2.5 am 29. Oktober 2026 angewendet; prüfen Sie die README des Beispiels selbst, um zu erfahren, welches Release seinen Mainnet-Schutz aufhebt. Go bietet dieselbe Absenderseite mit `network.NewClient(rest).SealToAddresses(ctx, network.SealToArgs{...})`. Rust, Swift, Kotlin und Python arbeiten offline: Lesen Sie `/qorechain/pqc/v1/kem/{address}` und `/qorechain/pqc/v1/account/{address}` selbst, prüfen Sie die Karte (`verify_recipient_card`) und versiegeln Sie dann.

### Haupt-API {#api}

Die Namen stehen in TypeScript-Form. Go verwendet die Go-Schreibweise (`Seal`, `Open`, `NewEpochKeyManager`), Rust und Python verwenden snake_case. In Python, Swift und Kotlin sind `seal` und `open` jeweils `seal_envelope` / `sealEnvelope` und `open_envelope` / `openEnvelope`.

| Name | Was es tut | Wo |
|---|---|---|
| `generateSealKeys` | zufälliges Schlüsselpaar (ML-KEM-1024 + X25519) | alle |
| `deriveSealKeys` | Schlüsselpaar aus einer BIP-39-Mnemonic, optionaler Passphrase und Index | alle |
| `sealKeysFromSeed`, `sealSeedFromMnemonic` | aus dem 32-Byte-Seed wiederherstellen; Seed aus einer Mnemonic | alle |
| `recipientOf` | öffentlicher Empfänger aus einem Schlüsselpaar | alle |
| `validateMlkemPublicKey`, `validateX25519PublicKey` | Eingabeprüfungen (die Chain wendet dieselbe ML-KEM-Prüfung an) | alle |
| `seal` | an 1 bis 1.024 Empfänger verschlüsseln (`mode`, `aad`, `anonymous`) | alle |
| `open` | mit einem Schlüsselpaar entschlüsseln | alle |
| `parseEnvelope`, `envelopeSize` | einen Umschlag untersuchen; seine Größe berechnen | alle |
| `envelopeToText`, `envelopeFromText` | Textform `qoreseal:` | alle |
| `signRecipientCard`, `verifyRecipientCard` | die Empfängerkarte erstellen und prüfen | alle |
| `recipientCardText`, `recipientCardFields`, `assembleRecipientCard` | eine Karte bauen, wenn anderswo signiert wird, zum Beispiel in einer Wallet-Oberfläche | alle |
| `buildRegisterKemKeyMessage`, `buildRemoveKemKeyMessage` | Registry-Nachrichten, hybrid mit QoreSign zu signieren | alle |
| `describeKemRegistryError` | erklärt die Codes 250 bis 254 des Codespace `pqc` | alle |
| `EpochKeyManager` | Epochenschlüssel für eine Gruppe: `addMember`, `removeMember`, `rotate`, `distribution`, `exportKeys`, `keyFor`, `members`, `epoch` | alle |
| `sealEpochKey`, `openEpochKey` | einen Epochenschlüssel senden oder empfangen (zum Beispiel Verlauf für einen Neuzugang) | alle |
| `PrivateBatchCodec`, `sealBatch`, `openBatch`, `parseBatchHeader`, `batchSize` | verschlüsselte Batches mit Commitments | alle |
| `fetchKemKey`, `fetchMlkemPublicKey` | den ML-KEM-Schlüssel eines Kontos per REST lesen | TypeScript, Go-Netzwerkpaket |
| `resolveRecipient` | Schlüssel on-chain plus Karte, geprüft, als Empfänger | TypeScript, Go-Netzwerkpaket |
| `sealToAddresses` | an Konten per Adresse versiegeln | TypeScript, Go-Netzwerkpaket |

Die Netzwerk-Helfer sind `@qorechain/qoreseal/network` in TypeScript und `github.com/qorechain/qoreseal/go/network` in Go. Auch Bausteine auf niedrigerer Ebene werden exportiert (`mlkemEncapsulate`, `mlkemDecapsulate`, `x25519Agree`, `hybridSharedSecret`, `deriveKey`, `kdfInfo`, `recipientHint`). Funktionen, die für Tests benannt sind (`sealWithEntropy`, `testing_*`), dienen dazu, die Testvektoren zu reproduzieren, und dürfen nie mit echten Daten verwendet werden.

Python-Fehler lösen `QoreSealError.Failure` mit einem stabilen `code` aus; Go-Fehler vergleichen Sie mit `qoreseal.IsCode`.

## Zugang {#how-to-access}

| | Mainnet `qorechain-vladi` | Testnet `qorechain-diana` |
|---|---|---|
| KEM-Schlüsselregistry | live seit v3.2.5 (angewendet am 29. Oktober 2026, Höhe 3.906.833); Leseroute geprüft, siehe unten | live |
| REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM | `https://evm.qore.host` (Chain-ID 9801) | `https://evm-testnet.qore.host` (Chain-ID 9800) |

Am 30. Oktober 2026 antwortete die Registry-Abfrage für ein Konto ohne Schlüssel in beiden Netzwerken mit `{"found":false,"key":null}` (am 27. Oktober antwortete das Mainnet noch „Not Implemented“). Eine Suche in Mainnet-Transaktionen am 30. Oktober fand noch keine `MsgRegisterKEMKey`, das Veröffentlichen eines Schlüssels im Mainnet wurde von dieser Seite also nicht Ende-zu-Ende erprobt.

- Offline-Versiegeln und -Öffnen, einschließlich direkt übergebener Prüferschlüssel, privater Gruppen und Batches, benötigt weder Netzwerk noch Konto.
- Das Verschlüsseln an eine Adresse setzt voraus, dass der Empfänger einen ML-KEM-1024-Schlüssel in der Registry veröffentlicht hat und, für den Hybridmodus, eine Empfängerkarte.
- Das Veröffentlichen eines Schlüssels benötigt ein Konto mit Testnet-QOR (im Mainnet QOR), einen registrierten ML-DSA-87-Schlüssel und QoreSign, um die Transaktion hybrid zu signieren. Die Gebühren-Untergrenze beträgt 0,1 uqor pro Gas. Testnet-QOR erhalten Sie vom [Faucet](/dashboard/faucet).
- Eine Mainnet-Registrierung wird nur von einer Chain akzeptiert, die die Registry hat; erscheint eine Ablehnung mit Code 250, ist die Registry auf dieser Chain nicht aktiviert.

## Wo es veröffentlicht ist {#where-published}

Am 27. Oktober 2026 gegen jede Registry geprüft.

| Registry | Paket | Version | Link |
|---|---|---|---|
| crates.io | `qorechain-qoreseal` | 0.1.0 | [crates.io/crates/qorechain-qoreseal](https://crates.io/crates/qorechain-qoreseal) |
| Go-Modul-Proxy | `github.com/qorechain/qoreseal/go` | v0.1.0 (Tag `go/v0.1.0`) | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qoreseal/go) |
| PyPI | `qorechain-qoreseal` | 0.1.0 (Wheels für macOS arm64 und x86_64, Linux x86_64 und aarch64, plus Quellcode) | [pypi.org/project/qorechain-qoreseal](https://pypi.org/project/qorechain-qoreseal/) |
| Swift Package Manager | `QoreSeal` aus `github.com/qorechain/qoreseal` | 0.1.0 (Binärdatei `QoreSealFFI.xcframework.zip` im GitHub-Release) | [release v0.1.0](https://github.com/qorechain/qoreseal/releases/tag/v0.1.0) |
| Maven Central | `io.github.qorechain:qoreseal` | 0.1.0 | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoreseal) |
| Maven Central | `io.github.qorechain:qoreseal-android` | 0.1.0 | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoreseal-android) |
| npm | `@qorechain/qoreseal` | noch nicht veröffentlicht (kommt) | |

Projekte, die eines der beiden Maven-Artefakte verwenden, benötigen den Kotlin-Compiler 2.3 oder neuer. Das Kotlin/JVM-Artefakt bündelt native Bibliotheken für macOS (arm64, x86_64), Linux (x86_64, arm64) und Windows (x86_64); das Android-Artefakt deckt arm64-v8a, armeabi-v7a und x86_64 ab.

Quellcode: [github.com/qorechain/qoreseal](https://github.com/qorechain/qoreseal) (Release v0.1.0). Lizenz Apache-2.0.

## Einschränkungen und bekannte Probleme {#limits}

- **Geschützt wird der Inhalt der Nutzlast.** Adressen von Absender und Empfänger, Beträge von Banküberweisungen, der Zeitpunkt von Transaktionen, Umschlaggrößen und die Zahl der Empfänger bleiben on-chain öffentlich.
- **Keine privaten Transaktionen.** QoreSeal verbirgt nicht, wer mit wem Transaktionen ausführt oder wie viel.
- **Keine Zero-Knowledge-Beweise.** Nichts beweist etwas über die verschlüsselten Daten; in einer privaten Sidechain können Prüfer außerhalb der Gruppe nicht kontrollieren, was in einem Batch geschieht.
- **Umschläge sind nicht signiert.** Jeder kann an eine Adresse verschlüsseln, und jeder Empfänger eines Umschlags mit mehreren Empfängern könnte für die anderen einen anderen Umschlag bauen. Signieren Sie den Inhalt oder den Umschlag (QoreSign `signMessage`), wenn der Absender authentifiziert werden muss.
- **Jeder Empfänger liest die gesamte Nutzlast.** Es gibt keine Schwärzung pro Empfänger; versiegeln Sie getrennte Umschläge für unterschiedliche Leser.
- **Hints sind keine Anonymität.** Jeder, der den öffentlichen Schlüssel eines Kandidaten kennt (er liegt on-chain), kann testen, ob dieser Schlüssel ein Empfänger ist. `anonymous: true` setzt die Hints auf null; Empfänger probieren dann jeden Eintrag.
- **Schlüsselverlust bedeutet Datenverlust.** Es gibt keine Wiederherstellung on-chain. Der Verlust des Seeds oder der Mnemonic bedeutet den Verlust von allem, was an diesen Schlüssel versiegelt wurde.
- **Das Entfernen oder Rotieren eines Schlüssels löscht oder verschlüsselt nichts neu.** An einen alten Schlüssel versiegelte Daten bleiben für jeden lesbar, der ihn hält; bewahren Sie alte Seeds oder Indizes auf.
- **Entfernte Gruppenmitglieder** behalten die Schlüssel der Epochen, zu denen sie gehörten. Neue Mitglieder lesen ab ihrer Beitrittsepoche, sofern ältere Schlüssel nicht an sie versiegelt werden.
- **Chain-ID und Zweck stehen nicht im Umschlag;** der Empfänger muss sie kennen.
- **Mainnet-Registry:** Die Leseroute ist seit v3.2.5 live; beim Prüfen war im Mainnet noch kein Schlüssel veröffentlicht, und der EVM-JSON-RPC-Namespace `qor_` ist auf `evm.qore.host` nicht freigegeben (nutzen Sie die REST-Route).
- **Vor 1.0, Konstruktion wartet auf externe Prüfung.** Minor-Versionen können die API ändern. Lesen Sie die Spezifikation, bevor Sie sich darauf verlassen.
- **Noch kein npm-Paket** und noch kein Python-Wheel für Windows.

## Sicherheitshinweise {#security}

- Geheime Schlüssel verlassen nie das Gerät oder den Server, auf dem QoreSeal läuft. Die Chain speichert allein den öffentlichen ML-KEM-1024-Schlüssel, und die Karte trägt den öffentlichen X25519-Schlüssel.
- Sichern Sie die Konto-Mnemonic, eine eigene Mnemonic oder den 32-Byte-Seed (`keys.seed`), im Ruhezustand verschlüsselt. Exportieren Sie nie den geheimen ML-KEM-Schlüssel allein; exportieren Sie den Seed oder die Mnemonic.
- Rotation: Wechseln Sie zum nächsten Index, registrieren Sie den neuen ML-KEM-Schlüssel, signieren Sie eine neue Karte. Alte Karten werden automatisch nicht mehr verifiziert.
- Fügen Sie Daten, die den Verlust des Schlüssels eines Nutzers überleben müssen, einen Wiederherstellungsempfänger (einen Offline-Schlüssel) hinzu. Behandeln Sie ihn wie einen Prüferschlüssel, da er alles liest, wozu er hinzugefügt wird.
- Für Gruppen enthält `exportKeys()` jeden Epochenschlüssel. Versiegeln Sie diesen Export an den eigenen Schlüssel des Betreibers und einen Offline-Wiederherstellungsschlüssel, und halten Sie ihn vom Sequencer-Rechner fern. Rotieren Sie Epochenschlüssel nach einem Zeitplan.
- Der Modus `mlkem` muss ausdrücklich gewählt werden; hybrid wird nie stillschweigend herabgestuft.
- Die Primitive stammen aus den Bindings von [`qorechain-pqc`](/developer-tools/pqc-library) und aus etablierten Bibliotheken (noble für TypeScript, RustCrypto-Crates, die Go-Standardbibliothek); Kontosignaturen stammen von [QoreSign](/qoresign/overview).
- Melden Sie Schwachstellen vertraulich an security@qore.network. Dass On-Chain-Metadaten öffentlich sind, ist gewollt und ein Dokumentationsthema, keine Schwachstelle.

## Verwandte Seiten {#related}

- [QoreSign](/qoresign/overview): hybrides Signieren für die Registrierungstransaktion sowie das Nachrichtensignieren hinter Empfängerkarten und signierten Umschlägen.
- [RDK-Überblick](/rollups/overview) und [Datenverfügbarkeit](/rollups/data-availability): Verankerung verschlüsselter Batches einer privaten Sidechain.
- [PQC-Bibliothek](/developer-tools/pqc-library): die ML-KEM-1024-Bindings unter QoreSeal.
- [Post-Quantum-Sicherheit](/architecture/post-quantum-security) und [Post-Quanten-Signierung](/developer-guide/post-quantum-signing): wie Konten und Schlüssel on-chain funktionieren.
- [Überblick über die Entwickler-Pakete](/developer-tools/overview).
