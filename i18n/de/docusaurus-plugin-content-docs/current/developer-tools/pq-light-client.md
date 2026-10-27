---
slug: /developer-tools/pq-light-client
title: PQ Light Client
sidebar_label: PQ Light Client
sidebar_position: 31
---

# PQ Light Client (`qorechain-pq-light-client`)

`qorechain-pq-light-client` ist eine Entwurfsspezifikation und ein Referenz-Verifizierer für mit ML-DSA-87 (FIPS 204) signierte Checkpoints. Im vorgeschlagenen Design signieren Validatoren am Ende jeder Epoche einen kurzen Checkpoint mit einem separaten ML-DSA-87-Checkpoint-Schlüssel, und ein Light Client folgt der Kette der Checkpoints, indem er diese Signaturen prüft und sonst nichts. Es richtet sich an Protokollforscher, an Entwickler von Relayern und Bridges sowie an Teams auf anderen Chains, die das Design prüfen und dagegen testen möchten. Version **0.1.0**, Apache-2.0, gepflegt von der QoreChain Association.

**Die Chain unterstützt diese Checkpoints nicht, und nichts ist geplant.** QoreChain erzeugt die Checkpoints, die dieses Paket verifiziert, weder auf dem Mainnet (`qorechain-vladi`) noch auf dem Testnet (`qorechain-diana`). Keine Chain-Version unterstützt sie, und weder ein Upgrade noch ein Datum ist geplant. Die Konsensschlüssel der Validatoren sind heute ed25519, nicht Post-Quanten. Das Paket kann keinem Live-Netzwerk folgen: Es läuft gegen simulierte Validatorsets und die gemeinsamen Testvektoren. Es macht keine QoreChain-Route, keine Bridge und keinen IBC-Kanal zu einer Post-Quanten-Route.

## Innovationen {#innovations}

- **Checkpoints statt Signaturen pro Block.** Validatoren würden pro Epoche einen Checkpoint signieren (Chain-ID, Epoche, Höhe, Zeit, Header-Hash, App-Hash, den Hash des signierenden Sets und den Hash des nächsten Sets). Die Signaturen würden in gewöhnlichen Transaktionen reisen, sodass die Blockproduktion nie auf sie wartet, und das Datenvolumen bleibt weit unter dem, was das Signieren jedes Blocks bedeutet. Die Spezifikation (Abschnitt 12) gibt die Begründung.
- **Ein separater Checkpoint-Schlüssel mit Besitznachweis.** Jeder Validator würde einen ML-DSA-87-Checkpoint-Schlüssel registrieren, getrennt von seinem Konsensschlüssel und von jedem Kontoschlüssel, mit einem Besitznachweis (Proof of Possession) über `"qorechain-pqlc-key-pop-v1|" || chain_id || operator address || consensus address || public key`.
- **Set-Übergabe durch das ausscheidende Set.** Ein Checkpoint wird akzeptiert, wenn Validatoren, die strikt mehr als zwei Drittel der Stimmkraft des Sets halten, das der letzte vertrauenswürdige Checkpoint benennt, ihn signiert haben, sodass Änderungen des Validatorsets immer vom ausscheidenden Set signiert werden. Genau zwei Drittel sind kein Quorum, und eine Signatur eines Nichtmitglieds macht den Checkpoint ungültig, statt übersprungen zu werden.
- **Eine Kodierung pro Objekt.** Checkpoint, Validatorset und signierter Checkpoint haben kanonische Kodierungen, und die Decoder akzeptieren für jedes genau eine Kodierung. Ein Relayer leitet die kanonischen Bytes unverändert weiter.
- **Feste Reihenfolge der Prüfungen.** `verifyCheckpoint` führt die Prüfungen in einer festgelegten Reihenfolge aus, sodass TypeScript, Rust und Go für dieselbe Eingabe denselben Fehlercode liefern.
- **Nachweis von Fehlverhalten.** Zwei verschiedene Checkpoints für eine Epoche, jeder mit Quorum, sind Fehlverhalten. `detectMisbehaviour` liefert beide Checkpoints in kanonischer Reihenfolge, die Doppelsignierer und deren Stimmkraft.
- **Drei Sprachen, ein Satz Vektoren.** Die gemeinsamen Vektoren (`vectors/pq-light-client-v1.json`) stammen aus einem deterministischen Simulator und decken Checkpoint-Ketten mit 4 und 21 Validatoren, Set-Rotationen, jede Ablehnung, die der Verifizierer erzeugen kann, widersprüchliche Checkpoints und Decoder-Fälle ab. Go, Rust und TypeScript bestehen sie alle, sodass eine vierte Implementierung Byte für Byte nachweisen kann, dass sie übereinstimmt.

## Anwendungsfälle {#use-cases}

1. **Relayer-Entwickler prototypisieren einen Post-Quanten-Update-Pfad.** Ein Rust-Relayer hält pro Netzwerk einen vertrauenswürdigen Zustand, dekodiert und verifiziert jeden signierten Checkpoint, leitet dieselben Bytes an das Ziel weiter und hält bei `CONFLICTING_CHECKPOINT` an. Heute läuft er über die Vektoren oder eine eigene simulierte Chain; der Relayer-Leitfaden des Repositorys zeigt die Schleife.
2. **IBC- und Bridge-Teams bewerten das Design.** Abschnitt 14 der Spezifikation bildet Checkpoints auf einen IBC-Light-Client-Typ ab (Client-Zustand, Konsenszustand, Fehlverhalten, Mitgliedschaftsbeweise bei Checkpoint-Höhen). Teams können die Abbildung und ihre Abwägungen prüfen, bevor etwas on-chain existiert. Es ist eine Entwurfsnotiz; dafür existiert kein Code.
3. **Teams auf EVM-Chains oder Solana vergleichen Verifizierer-Designs.** Abschnitt 15 vergleicht die on-chain-Verifikation von ML-DSA-87, einen STARK-Beweis der Verifikation und ein Attestor-Set, einschließlich dessen, welche Entscheidungen die Post-Quanten-Eigenschaft erhalten und welche sie aufgeben. Ebenfalls nur Entwurfsnotizen. Zur Orientierung: Die eigene EVM von QoreChain hat ein ML-DSA-Verifikations-Precompile (`pqcVerify`, 0x0A01), das nur auf dem Testnet aktiv ist; siehe [EVM-Precompiles](/developer-guide/evm-precompiles).
4. **Sicherheitsprüfer und Forscher prüfen die Regeln.** Die Reihenfolge der Prüfungen, die Quorumsregel, die Set-Übergabe, die Vertrauensperiode und der Nachweis von Fehlverhalten sind spezifiziert und in drei Sprachen testbar.
5. **Teams, die über Routen sprechen, formulieren ihre Aussagen korrekt.** Die Positionsseite im Repository definiert, wann eine Route als Post-Quanten-Route bezeichnet werden darf (siehe [Einschränkungen](#limits)).
6. **Implementierer in anderen Sprachen.** Die Vektoren erlauben einer neuen Implementierung nachzuweisen, dass sie mit der Referenz übereinstimmt.

## Funktionsweise {#how-it-works}

Alles in diesem Abschnitt ist das vorgeschlagene Design, und alles davon setzt Chain-Unterstützung voraus, die nicht geplant ist.

1. Jeder Validator registriert einen ML-DSA-87-Checkpoint-Schlüssel mit einem Besitznachweis (siehe oben).
2. Am Ende jeder Epoche signieren die Validatoren einen Checkpoint: Chain-ID, Epoche (strikt steigend), Höhe, Zeit, Header-Hash, App-Hash, den Hash des Sets, das diesen Checkpoint signiert, und den Hash des Sets, das den nächsten signiert.
3. Ein Light Client akzeptiert einen Checkpoint, der von mehr als zwei Dritteln der Stimmkraft des Sets signiert wurde, das sein letzter vertrauenswürdiger Checkpoint benannt hat.
4. Zwei verschiedene Checkpoints für eine Epoche, jeder mit Quorum, sind Fehlverhalten; der Nachweis benennt die Doppelsignierer.

Der Konsens pro Block bliebe unverändert. Höhen innerhalb einer Epoche bleiben bis zum nächsten Checkpoint klassisch; ein Client, der die Post-Quanten-Garantie braucht, nutzt Checkpoint-Höhen und nimmt bis zu eine Epoche Latenz in Kauf.

**Formate** (alle Ganzzahlen Big-Endian, Versionsbyte `0x01`):

| Objekt | Aufbau | Größe |
|---|---|---|
| Checkpoint | Version, Länge und Bytes der Chain-ID, Epoche, Höhe, Zeit, Header-Hash, App-Hash, Validatorset-Hash, Hash des nächsten Validatorsets | `154 + len(chain_id)` Bytes (169 für `qorechain-vladi`) |
| Validatorset | Version, Anzahl (1 bis 256), dann pro Validator: 20-Byte-Adresse, 8-Byte-Stimmkraft, 2.592-Byte-ML-DSA-87-Schlüssel, nach Adresse sortiert | `3 + 2,620 x validators` Bytes |
| Signierter Checkpoint | Version, Checkpoint, Anzahl der Signaturen, pro Signierer eine 20-Byte-Adresse und eine 4.627-Byte-Signatur (nach Adresse sortiert), Flag für das nächste Set, nächstes Set, wenn sich das Set ändert | `173 + 4,647 x signers` Bytes für `qorechain-vladi`, plus das nächste Set, falls vorhanden |

**Signatur und Hash.** ML-DSA-87, FIPS-204-Pure-Modus, leerer Kontext, über `"qorechain-pqlc-checkpoint-v1|" || encode(checkpoint)`. Deterministisches und Hedged-Signieren sind beide gültig. Der Hash ist SHAKE-256 mit 32 Byte Ausgabe; der Validatorset-Hash verwendet das Präfix `qorechain-pqlc-valset-v1|`.

**Reihenfolge der Verifikation** (`verifyCheckpoint`): Struktur, Chain-ID, Ablauf des Vertrauens, Uhrenabweichung, Behandlung derselben Epoche (identisch ergibt `NOT_NEWER`; verschieden mit Quorum ergibt `CONFLICTING_CHECKPOINT`), Fortschritt von Epoche, Höhe und Zeit, signierendes Set entspricht dem vertrauenswürdigen nächsten Set, mitgeführtes nächstes Set passt zu seinem Hash, Quorum. Ein Fehlschlag lässt den vertrauenswürdigen Zustand unverändert. Eine spätere Epoche kann direkt akzeptiert werden, solange das signierende Set unverändert ist; nach einer Rotation muss jeder Checkpoint ab der Rotation verifiziert werden.

**Vertrauen.** Ein Client beginnt bei einer außerhalb des Protokolls gewählten Vertrauenswurzel, wie bei jedem Proof-of-Stake-Light-Client. Die Vertrauensperiode muss kürzer sein als der Zeitraum, in dem ein Validator noch sanktioniert werden kann; danach muss der Client neu initialisiert werden.

Die Spezifikation ist `spec/pq-light-client-v1.md` im Repository (Status: Entwurf, offen für Review). Abschnitt 10 (Checkpoint-Schlüssel, Signieren, Epochen, Sanktionen on-chain) ist ein Design zur Prüfung, keine Verpflichtung.

## Anwendung {#how-to-use}

### Installation {#install}

| Sprache | Installation | Mindestplattform |
|---|---|---|
| TypeScript | `npm install @qorechain/pq-light-client` | Node.js 20.19 oder neuer, und Browser. Hängt von `@qorechain/pqc` 0.2.3 ab |
| Rust | `cargo add qorechain-pq-light-client` (Bibliothek `qorechain_pq_light_client`) | stable Rust; hängt von `qorechain-pqc` 0.2.3 ab; kein `unsafe`, keine I/O |
| Go | `go get github.com/qorechain/qorechain-pq-light-client/go@v0.1.0` (Paket `pqlightclient`) | Go 1.25; hängt von `github.com/qorechain/qorechain-pqc/go` v0.2.3 ab |

Es gibt kein PyPI-Paket, und keines ist geplant.

### Quickstart (offline, TypeScript) {#quickstart}

Nichts berührt ein QoreChain-Netzwerk. Das Skript folgt der simulierten Checkpoint-Kette mit 21 Validatoren aus den gemeinsamen Vektoren (Chain-ID `qorechain-sim-21`, einschließlich einer Set-Rotation in Epoche 2) und zeigt dann, dass die Live-Quelle nicht verfügbar ist. Die Vektorschlüssel sind öffentliche Testschlüssel.

```bash
mkdir pqlc && cd pqlc && npm init -y && npm pkg set type=module
npm install @qorechain/pq-light-client
curl -sLO https://raw.githubusercontent.com/qorechain/qorechain-pq-light-client/v0.1.0/vectors/pq-light-client-v1.json
```

```js
// follow.mjs: a TypeScript port of the repository's Rust relayer example.
import { readFileSync } from "node:fs";
import {
  PqLightClientError,
  decodeSignedCheckpoint,
  decodeValidatorSet,
  fetchCheckpoint,
  newTrustedState,
  verifyCheckpoint,
} from "@qorechain/pq-light-client";

const v = JSON.parse(readFileSync("pq-light-client-v1.json", "utf8"));
const hex = (s) => Uint8Array.from(Buffer.from(s, "hex"));

const root = decodeSignedCheckpoint(hex(v.signedCheckpoints["c21-e0-root"].encoded));
const set = decodeValidatorSet(hex(v.validatorSets.C21.encoded));
let state = newTrustedState({
  checkpoint: root.checkpoint,
  signatures: root.signatures,
  validatorSet: set,
  nextValidatorSet: set,
  trustingPeriod: 1_209_600n, // 14 days
  maxClockDrift: 10n,
});

for (const id of ["c21-e1", "c21-e2-rotate", "c21-e3"]) {
  const signed = decodeSignedCheckpoint(hex(v.signedCheckpoints[id].encoded));
  state = verifyCheckpoint(state, signed, signed.checkpoint.time + 5n);
  console.log(`trusted epoch ${state.checkpoint.epoch} at height ${state.checkpoint.height}`);
}

try {
  await fetchCheckpoint("https://rpc.example.invalid", state.checkpoint.chainId, 4n);
} catch (e) {
  if (e instanceof PqLightClientError) console.log("live source:", e.code);
}
```

Am 27. Oktober 2026 gegen das veröffentlichte npm-Paket 0.1.0 und die Vektoren beim Tag v0.1.0 ausgeführt, gab `node follow.mjs` Folgendes aus:

```
trusted epoch 1 at height 11000
trusted epoch 2 at height 12000
trusted epoch 3 at height 13000
live source: REQUIRES_CHAIN_SUPPORT
```

Die Vektordatei ist etwa 2,4 MB groß. Das Rust-Original ist `rust/examples/relayer.rs` im Repository (`cargo run --example relayer`); es wurde für diese Seite nicht ausgeführt.

Fehlerbehandlung in TypeScript (aus dem Paket-README):

```ts
try {
  trusted = verifyCheckpoint(trusted, decodeSignedCheckpoint(bytes), BigInt(Math.floor(Date.now() / 1000)));
} catch (e) {
  if (e instanceof PqLightClientError && e.code === "CONFLICTING_CHECKPOINT") {
    report(e.misbehaviour);
  }
}
```

Dasselbe in Go:

```go
signed, err := pqlightclient.DecodeSignedCheckpoint(b)
if err != nil {
	return err
}
next, err := pqlightclient.VerifyCheckpoint(trusted, signed, uint64(time.Now().Unix()))
if errors.Is(err, pqlightclient.ErrConflictingCheckpoint) {
	// err.(*pqlightclient.Error).Misbehaviour holds the evidence
}
```

### Haupt-API {#api}

Die API ist in allen drei Sprachen gleich (TypeScript camelCase, Go PascalCase, Rust snake_case). 64-Bit-Felder sind in TypeScript `bigint`.

| Name | Was es tut |
|---|---|
| `Checkpoint`, `ValidatorSet`, `SignedCheckpoint`, `TrustedState`, `Misbehaviour` | Datentypen |
| `encodeCheckpoint`, `decodeCheckpoint` | kanonische Checkpoint-Kodierung; strikter Decoder |
| `encodeValidatorSet`, `decodeValidatorSet`, `hashValidatorSet` | Kodierung des Validatorsets und SHAKE-256-Hash |
| `encodeSignedCheckpoint`, `decodeSignedCheckpoint` | die Bytes, die ein Relayer transportiert |
| `encodeCheckpointSignBytes` | die Sign-Bytes, `"qorechain-pqlc-checkpoint-v1|" || encode(checkpoint)` |
| `newTrustedState` | Vertrauenswurzel zu vertrauenswürdigem Zustand (prüft, dass beide Sets auf die Werte im Checkpoint hashen; verifiziert keine Signaturen) |
| `verifyCheckpoint(trusted, signed, now)` | vollständige Verifikation; liefert den neuen vertrauenswürdigen Zustand oder einen typisierten Fehler |
| `detectMisbehaviour(set, a, b)` | Nachweis für widersprüchliche Checkpoints, oder nichts |
| `signCheckpoint` | einen Checkpoint mit einem ML-DSA-87-Geheimschlüssel signieren (Simulatoren und Tests) |
| `CheckpointSource`, `fetchCheckpoint`, `chainCheckpointSource` (TypeScript) oder `ChainCheckpointSource` (Rust, Go) | Schnittstellen für eine künftige Node-API; heute scheitern sie immer mit `REQUIRES_CHAIN_SUPPORT` und senden keine Anfrage |
| `PqLightClientError` (TypeScript), `*Error` mit `ErrInsufficientPower` und Ähnlichem (Go, `errors.Is` verwenden), `Error` mit `code()` (Rust) | typisierte Fehler mit stabilen Codes |

Fehlercodes, in allen drei Sprachen gleich, und was ein Relayer tun sollte (aus dem Relayer-Leitfaden):

| Fehler | Aktion |
|---|---|
| `MALFORMED` | die Bytes verwerfen; die Quelle ist fehlerhaft |
| `CHAIN_ID_MISMATCH` | Konfigurationsfehler |
| `TRUST_EXPIRED` | anhalten; von einer neuen Vertrauenswurzel neu initialisieren |
| `FUTURE_CHECKPOINT` | die lokale Uhr prüfen; später erneut versuchen |
| `NOT_NEWER` | nichts Neues; warten |
| `SET_MISMATCH` | ein Checkpoint mit einer Set-Rotation fehlt; die Epochen dazwischen abrufen |
| `UNKNOWN_VALIDATOR`, `BAD_SIGNATURE` | den Checkpoint verwerfen |
| `INSUFFICIENT_POWER` | auf weitere Signaturen warten |
| `CONFLICTING_CHECKPOINT` | das Weiterleiten stoppen und den Nachweis melden |
| `REQUIRES_CHAIN_SUPPORT` | heute zu erwarten |

## Zugang {#how-to-access}

- **Mainnet `qorechain-vladi` und Testnet `qorechain-diana`:** Es werden keine Checkpoints erzeugt, daher können die Verifizierer keinem der beiden Netzwerke folgen. Keine Chain-Version unterstützt sie, und keine ist geplant.
- Was die Netzwerke heute tun: Die Konsensschlüssel der Validatoren sind ed25519, Vote Extensions sind aus, und IBC verwendet den Standard-Light-Client-Typ 07.
- **Um das Paket auszuführen**, brauchen Sie nichts außer der Sprachlaufzeit. Kein Konto, keine Schlüssel, keinen Endpunkt, keine Kosten. Die Vektoren verwenden öffentliche Testschlüssel und die Chain-IDs `qorechain-sim` und `qorechain-sim-21`.
- Nur zur Orientierung (dieses Paket nutzt sie nicht): REST `https://api.qore.host` und `https://api-testnet.qore.host`, RPC `https://rpc.qore.host` und `https://rpc-testnet.qore.host`.

## Wo es veröffentlicht ist {#where-published}

Am 27. Oktober 2026 gegen jede Registry geprüft.

| Registry | Paket | Version | Link |
|---|---|---|---|
| npm | `@qorechain/pq-light-client` | 0.1.0 (`latest`) | [npmjs.com](https://www.npmjs.com/package/@qorechain/pq-light-client) |
| crates.io | `qorechain-pq-light-client` | 0.1.0 | [crates.io](https://crates.io/crates/qorechain-pq-light-client) |
| Go-Modul-Proxy | `github.com/qorechain/qorechain-pq-light-client/go` | v0.1.0 (Tag `go/v0.1.0`) | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qorechain-pq-light-client/go) |

Quelle: [github.com/qorechain/qorechain-pq-light-client](https://github.com/qorechain/qorechain-pq-light-client) (Release v0.1.0, Quellcode, keine Binärdateien). Lizenz Apache-2.0.

## Einschränkungen und bekannte Probleme {#limits}

- **Es macht weder QoreChain noch einen IBC-Kanal, eine Bridge oder einen Relayer zu einer Post-Quanten-Lösung.** Die Konsensschlüssel der Validatoren sind heute nicht Post-Quanten, und kein Upgrade, das dies ändert, ist geplant.
- **Es kann keinem Live-Netzwerk folgen.** `fetchCheckpoint` scheitert immer mit `REQUIRES_CHAIN_SUPPORT`. Es arbeitet mit simulierten Validatorsets und den gemeinsamen Vektoren.
- **Die Spezifikation ist ein Entwurf, offen für Review.** Nichts darin ist eine Verpflichtung.
- **Entwurfsnotizen ohne Code:** der IBC-Client-Typ (Abschnitt 14) und die Verifizierer für EVM und Solana (Abschnitt 15).
- **Höhen innerhalb einer Epoche bleiben klassisch.** Auch mit Checkpoints würde die Post-Quanten-Verifikation bei Checkpoint-Höhen gelten.
- **Was als Post-Quanten-Route bezeichnet werden darf.** Eine Route darf als Post-Quanten-Route bezeichnet werden, wenn beide Enden in beide Richtungen den Post-Quanten-signierten Zustand des jeweils anderen Endes verifizieren, ohne klassischen Schritt: kein klassischer Light Client an einem der Enden, kein paarungsbasierter SNARK-Wrapper, kein klassisches Attestor-Komitee. Post-Quanten-Kontosignaturen allein machen eine Route nicht zu einer Post-Quanten-Route. QoreChain-Konten signieren mit ML-DSA-87 und secp256k1; beschreiben Sie das als "Post-Quanten-Kontosignaturen", nicht als Post-Quanten-Route.
- **Vertrauenswurzeln sind subjektiv.** Das Protokoll kann einen Client nicht schützen, der mit einer falschen beginnt.
- **Vor 1.0.** Minor-Versionen können die API ändern.

Von der Positionsseite des Repositorys vorgeschlagene Formulierungen:

| Situation | Formulierung |
|---|---|
| Konten signieren mit ML-DSA-87 | "Post-Quanten-Kontosignaturen" |
| Ein Ende verifiziert Post-Quanten-Checkpoints, das andere nicht | "Post-Quanten-Verifikation des QoreChain-Zustands auf Chain X; der Rückweg ist klassisch" |
| Beide Enden verifizieren Post-Quanten-signierten Zustand, ohne klassischen Schritt | "Post-Quanten-Route" |

Solange nicht beide Enden die Regel erfüllen, beschreiben Sie eine Route danach, was sie tatsächlich verifiziert, zum Beispiel "gesichert durch den klassischen Light Client der Gegenseite".

## Sicherheitshinweise {#security}

- Das Paket hält keine Schlüssel und führt keine I/O aus. Rust hat keinen `unsafe`-Code; in TypeScript und Go sendet `fetchCheckpoint` keine Anfrage.
- Die Decoder sind strikt: eine Kodierung pro Objekt, und jede andere Signatur- oder Schlüssellänge wird abgelehnt. Relayer müssen die kanonischen Bytes unverändert weiterleiten, nie eine Neukodierung.
- Signaturen von Validatoren außerhalb des Sets machen einen Checkpoint ungültig, statt übersprungen zu werden, was alle Implementierungen beim selben Ergebnis hält.
- Halten Sie die Uhr des Verifizierers synchron: Eine vorgehende Uhr lässt das Vertrauen zu früh ablaufen, eine nachgehende lehnt neue Checkpoints als `FUTURE_CHECKPOINT` ab.
- Das Design setzt voraus, dass Validatoren, die mehr als zwei Drittel der Stimmkraft jedes Checkpoint-Sets halten, nichts anderes signieren als Checkpoints, die ihr eigener Node committet hat.
- Die vorgeschlagenen Signierdomänen (`qorechain-pqlc-checkpoint-v1|`, `qorechain-pqlc-key-pop-v1|`) sind Vorschläge; sie sind heute on-chain nicht reserviert.
- Die Schlüssel der Vektoren sind öffentliche Testschlüssel; verwenden Sie sie nie für etwas anderes.
- Melden Sie Schwachstellen vertraulich an security@qore.network.

## Verwandte Seiten {#related}

- [PQC-Bibliothek](/developer-tools/pqc-library): die Bindings für ML-DSA-87 und SHAKE-256 unter den Verifizierern.
- [QoreSign](/qoresign/overview): ML-DSA-87-Signaturen auf Kontoebene, die etwas anderes sind als Validator-Checkpoints.
- [Post-Quanten-Sicherheit](/architecture/post-quantum-security): das Post-Quanten-Modell der Chain heute.
- [Bridge-Architektur](/architecture/bridge-architecture) und [Assets bridgen](/user-guide/bridging-assets): Cross-Chain-Routen verwenden heute den klassischen Standard-Light-Client.
- [QoreSeal](/developer-tools/qoreseal): das andere Post-Quanten-Kit in Version 0.1.0, veröffentlicht am 27. Oktober 2026.
- [Übersicht der Entwicklerpakete](/developer-tools/overview).
