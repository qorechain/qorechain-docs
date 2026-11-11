---
slug: /qoresign/overview
title: QoreSign Überblick
sidebar_label: Überblick
sidebar_position: 1
---

# QoreSign

QoreSign ist eine Open-Source-Bibliothek für hybrides Signieren mit secp256k1 + ML-DSA-87 (FIPS 204) auf QoreChain, für Wallets, Börsen, Verwahrer und Backends.

Mit QoreSign kann eine Wallet, die nicht von QoreChain selbst stammt, den ML-DSA-87-Schlüssel eines Kontos ableiten, Transaktionen der nativen Lane mit beiden Schlüsseln signieren, Hybridsignaturen lokal prüfen, beliebige Nachrichten signieren, eine Transaktion vor dem Signieren simulieren, nachlesen, wie eine bestätigte Transaktion geschützt war, und Sign In With QoreChain umsetzen. QoreSign ist eine dünne Schicht über den Bindings von [`qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) und bringt keine eigenen kryptografischen Primitive mit. Es wird von der QoreChain Association unter der Apache-2.0-Lizenz gepflegt.

Die aktuelle Version ist **0.2.0** (veröffentlicht am 10. und 11. November 2026). Sie ist veröffentlicht für TypeScript, Rust, Go, Kotlin (JVM und Android), Swift und, seit 0.1.1, Python. Auf Maven Central ist 0.2.0 veröffentlicht (geprüft am 11. November 2026; siehe [Wo es veröffentlicht ist](#where-published)). Quellcode, Beispiele und Testvektoren befinden sich im Repository [qorechain/qoresign](https://github.com/qorechain/qoresign). Es funktioniert im Mainnet (`qorechain-vladi`) und im Testnet (`qorechain-diana`).

## Was QoreSign auf den einzelnen Lanes leistet {#lanes}

| Lane | Was QoreSign heute leistet |
|---|---|
| **Native** (Cosmos SDK) | Hybrides Signieren und Prüfen. Das Netzwerk verlangt standardmäßig die ML-DSA-87-Signatur. |
| **EVM** | Nur Autorisierungsfenster: Das Konto registriert einen ML-DSA-87-Schlüssel und öffnet von der nativen Lane aus ein begrenztes Autorisierungsfenster. Ethereum-Transaktionen selbst tragen keine ML-DSA-87-Signatur. |
| **SVM** | Im Netzwerk noch nicht geöffnet (`LANE_NOT_AVAILABLE`). |

Hybrides EVM-Signieren setzt zuerst PQC-Unterstützung pro Lane im Netzwerk voraus. Siehe [EVM-Wallets: Autorisierungsfenster](/qoresign/guides/evm-quantum-ready).

## Was es leistet {#what-it-does}

Offline-Kern, in jeder Sprache gleich:

- Leitet den klassischen Schlüssel auf `m/44'/118'/0'/0/0` ab (`deriveClassicalKey`) sowie den kanonischen ML-DSA-87-Schlüssel, den QoreChain-Wallets für ein Konto registrieren (`deriveCanonicalPqKey`, gebunden an die Mnemonic und die Adresse). Eine gehärtete HD-Ableitung existiert als Entwurf (`deriveHdPqKey`); `pqKeyFromSeed` stellt ein Schlüsselpaar aus seinem 32-Byte-Seed wieder her.
- Erstellt und parst `qor1`-Adressen für Konten vom Typ `secp256k1` und `eth_secp256k1`.
- Signiert eine Transaktion der nativen Lane mit beiden Schlüsseln (`signHybrid`) oder fügt nur die ML-DSA-87-Schicht zu einem Body hinzu, den eine dApp gebaut hat (`signPqLayer`). ML-DSA-87-Signaturen sind standardmäßig deterministisch; hedged Signieren ist eine Option, und das Netzwerk akzeptiert beides. secp256k1 verwendet RFC 6979 mit Low-S.
- Berechnet hybride Sign-Bytes v1 und v2 (`hybridSignBytes`) und prüft eine vollständige Hybridtransaktion (`verifyHybridTx`) oder allein die ML-DSA-87-Schicht (`verifyPqLayer`).
- Baut `MsgRegisterPQCKeyV2` mit Besitznachweis (`buildRegisterPqKeyMessage`, `signProofOfPossession`) und weist degenerierte öffentliche Schlüssel ab.
- Signiert und prüft beliebige Nachrichten (`signMessage`, `verifyMessage`) und setzt Sign In With QoreChain v1 um (`createSiwqMessage`, `signSiwq`, `verifySiwq`).
- Wendet die Lane-Regeln im Code an (`decideLane`, `assertHybridLane`, `evaluateLayerState`). Fehler tragen einen stabilen Code, der für alle Sprachen gleich ist (`QoreSignError`, zum Beispiel `INVALID_MNEMONIC`, `LANE_NOT_AVAILABLE`, `KEY_NOT_REGISTERED`).

Netzwerk-Helfer (TypeScript `@qorechain/qoresign/network`; Go `github.com/qorechain/qoresign/go/network` hat alle außer den beiden neuen):

- `fetchPqKeyStatus`: Ist für eine Adresse ein ML-DSA-87-Schlüssel registriert, und welcher.
- `resolveSignBytesVersion`: Welche Sign-Bytes-Form das Netzwerk prüft. Seit 0.2.0 liest es zuerst den Eintrag `pqc-sign-bytes-v2` in der Protokoll-Feature-Liste des Netzwerks und nutzt die Prüfung auf angewendete Upgrades nur, wenn sich die Liste nicht lesen lässt.
- `simulateTx` (verbrauchtes Gas, empfohlenes Gas-Limit, Saldoänderungen pro Adresse), `suggestGasLimit`, `broadcastTx` und `submitWithSignBytesFallback` (ein weiterer Versuch mit der anderen Sign-Bytes-Form, wenn das Netzwerk die erste ablehnt).
- `assertPqLayerMatchesRegisteredKey`: Prüft eine von einer dApp gelieferte Schicht gegen den Schlüssel auf der Chain, bevor die Wallet ihre klassische Signatur hinzufügt. Seit 0.2.0 prüft es gegen die Sign-Bytes-Version des Netzwerks.
- `verifySiwqWithChain` und `verifyMessageWithChain`: Prüfung gegen den auf der Chain registrierten Schlüssel.
- `fetchCommittedExtensionTypeUrls`: Liest nach, welche Erweiterungen eine bestätigte Transaktion trug.
- Seit 0.1.1, nur TypeScript: `inspectTransaction` und `fetchEvmWindow`, unten beschrieben.
- Neu in 0.2.0, TypeScript und Go: `fetchProtocolFeature`; TypeScript exportiert außerdem `PROTOCOL_FEATURES_PATH` und `SIGN_BYTES_V2_FEATURE`.

## Neu in 0.2.0 {#new-in-0-2-0}

Veröffentlicht am 10. und 11. November 2026 (Release v0.2.0 auf GitHub am 11. November). Änderungen im Verhalten und was beim Wechsel von 0.1.x zu tun ist:

- **Sign In With QoreChain: maximales Alter.** Eine Nachricht ohne `Expiration Time` wird mit `SIWQ_EXPIRED` abgelehnt, sobald sie älter als 600 Sekunden (10 Minuten) ist, gerechnet ab `Issued At`. Das Alter ist in jedem Binding einstellbar: `maxAgeSeconds` (TypeScript, Swift, Kotlin), `max_age_seconds` (Python und das Rust-`VerifySiwqArgs`) und `MaxAge` (Go `VerifySiwqOptions`). Ein Wert von null oder ein negativer Wert schlägt mit `INVALID_ARGUMENT` fehl. Setzen Sie `expirationTime` auf jeder Nachricht, die Ihr Server ausstellt, oder übergeben Sie ein größeres maximales Alter. Siehe [Sign In With QoreChain: Prüfung auf dem Server](/qoresign/guides/sign-in).
- **Strenge Zeitstempel.** `Issued At`, `Expiration Time` und `Not Before` folgen einer RFC-3339-Grammatik, die beim Erzeugen, Parsen, Signieren und Prüfen gleich angewendet wird. Ein Zeitstempel außerhalb davon schlägt mit `SIWQ_MALFORMED` fehl. Siehe [Sign In With QoreChain v1](/qoresign/spec/siwq-v1#timestamps). `parseSiwqTimestamp` (TypeScript) und `ParseSiwqTimestamp` (Go) liefern die Unix-Millisekunden eines Zeitstempels in dieser Grammatik. Gemeinsame Vektoren liegen in `vectors/siwq-timestamps-v1.json`.
- **Auflösung der Sign-Bytes-Version.** `resolveSignBytesVersion` liest zuerst das Protokoll-Feature `pqc-sign-bytes-v2` aus der Feature-Liste des Netzwerks. Lässt sich die Liste lesen, entscheidet sie über die Version (ein nicht aufgeführtes Feature bedeutet v1). Die Prüfung auf angewendete Upgrades wird nur genutzt, wenn sich die Liste nicht lesen lässt. `fetchProtocolFeature` (TypeScript und Go), `PROTOCOL_FEATURES_PATH` und `SIGN_BYTES_V2_FEATURE` (TypeScript) werden exportiert.
- **Schichtprüfung.** `assertPqLayerMatchesRegisteredKey` und `inspectTransaction` prüfen die ML-DSA-87-Schicht gegen die Sign-Bytes-Version, die das Netzwerk nutzt, oder gegen die Version aus der neuen Option `signBytesVersion` (`SignBytesVersion` in Go). Übergeben Sie `signBytesVersion: "v1"` für eine Transaktion, die vor dem Wechsel des Netzwerks zu v2 bestätigt wurde. Eine Schicht über beide Versionen zu akzeptieren, erfordert jetzt die ausdrückliche Diagnose-Option `allowLegacyEither` (`AllowLegacyEither` in Go), nur für Diagnosezwecke.
- **Swift, Kotlin und Python: Paket und native Bibliothek gemeinsam aktualisieren.** Die native Prüffunktion nimmt das maximale Alter als neuen Parameter, daher passt eine native Bibliothek aus 0.1.x nicht zu den Bindings von 0.2.0. Das xcframework, die JVM- und Android-Bibliotheken und die Python-Wheels sind für diese Version neu gebaut.

## Neu in 0.1.1 {#new-in-0-1-1}

- **Python.** Das Paket `qorechain-qoresign` (Import `qoresign`) ist auf PyPI, mit Wheels für macOS und Linux. Es bindet die Rust-Implementierung und reproduziert dieselben Testvektoren. Es arbeitet offline, wie die Bindings für Swift und Kotlin: keine Netzwerk-Helfer.
- **Transaktionsinspektor (Bibliothek).** `inspectTransaction` liest eine bestätigte Transaktion und berichtet, wie sie geschützt war. Siehe [Transaktionsinspektor](#inspector).
- **EVM-Fenster-Leser.** `fetchEvmWindow` liest das EVM-Autorisierungsfenster eines Kontos.
- **Korrekturen am Packaging.** Das Archiv des binären Swift-Frameworks enthält keinen verirrten Resource-Fork-Ordner mehr, und die nativen macOS-Bibliotheken in den Paketen für Kotlin und Python tragen das Build-Verzeichnis nicht mehr als Install-Namen ein.

## Transaktionsinspektor {#inspector}

`inspectTransaction({ rest, chainId, txhash, rpc? })` ist eine rein lesende Funktion in `@qorechain/qoresign/network`. Sie holt eine bestätigte Transaktion und liefert:

- die Nachrichten, das Memo, den Ergebniscode, die Höhe und die Gebühr;
- den Signierer: Adresse, Schlüsseltyp, öffentlichen Schlüssel und Sequenz;
- ob die klassische Signatur gültig ist;
- den Zustand der ML-DSA-87-Schicht: vorhanden oder nicht, wie viele Schichten, ob die Schicht gegen den Schlüssel gültig ist, den der Signierer jetzt registriert hat, und welche Sign-Bytes-Form sie verwendet hat;
- eine Sicherheitsstufe, nach derselben Klassifizierung wie im öffentlichen Explorer: `pqc` (trägt die ML-DSA-87-Schicht), `enrollment` (registriert oder rotiert einen ML-DSA-87-Schlüssel, was bauartbedingt mit dem klassischen Schlüssel signiert wird), `shake` (eine Transaktion der nativen Lane ohne die Schicht) oder `classical` (eine Transaktion der EVM-Lane).

Für einen dem Netzwerk unbekannten Hash liefert sie `undefined`. Übergeben Sie einen `rpc`-Endpunkt, um die exakten bestätigten Bytes von einem Node zu lesen; ohne ihn verwendet die Funktion Bytes, die das REST-Gateway neu kodiert. Sie sendet nichts und braucht weder Konto noch Schlüssel.

```js
import { fetchEvmWindow, fetchPqKeyStatus, inspectTransaction } from "@qorechain/qoresign/network";

const rest = "https://api-testnet.qore.host";
const address = "qor178nscfyp0cq2ac5x7un4u98xrj4ayp6pt0kw08"; // public testnet faucet account

const status = await fetchPqKeyStatus({ rest, address });
console.log("ML-DSA-87 key registered:", status.registered);

const tx = await inspectTransaction({ rest, chainId: "qorechain-diana", txhash: process.argv[2] });
console.log(tx?.tier, tx?.pqLayer, tx?.messages.map((m) => m.typeUrl));

const win = await fetchEvmWindow({ rest, address });
console.log("EVM window:", win.found, win.live);
```

Speichern Sie es als `inspect.mjs` und führen Sie `node inspect.mjs <txhash>` mit einem Testnet-Transaktionshash aus. Bei einem aktuellen Faucet-Transfer im Testnet gab es `ML-DSA-87 key registered: true`, Stufe `pqc`, `pqLayer { present: true, count: 1, algorithmId: 1, verified: true, signBytesVersion: 'v2' }`, die Nachricht `/cosmos.bank.v1beta1.MsgSend` und `EVM window: false false` aus.

`fetchEvmWindow({ rest, address })` liefert `found`, `live`, die Höhen von Öffnung und Ablauf, die maximale und die verbrauchte Zahl von Transaktionen und Wert, die verbleibenden Blöcke, Transaktionen und den verbleibenden Wert, `nativeOnly` und `allowedTargets`.

Dies ist die Bibliotheksfunktion. Die Dashboard-Seite [Developers](/dashboard/developers#inspector) hat einen Transaction-inspector-Tab, der sie nutzt: Fügen Sie einen Transaktions-Hash ein und lesen Sie das Ergebnis, ohne Code zu schreiben.

## Wofür es verwendet wird {#use-cases}

1. **Eine Keplr-kompatible Wallet fügt hybrides Signieren von QoreChain hinzu.** Leap, Cosmostation oder eine neue Wallet erzeugt die secp256k1-Signatur über `signDirect`. Mit QoreSign leitet sie den ML-DSA-87-Schlüssel des Kontos aus derselben Mnemonic ab und fügt die Schicht (`signPqLayer`) vor dem Signieren hinzu. Siehe [die Wallet-Anleitung](/qoresign/guides/keplr-compatible-wallets).
2. **Eine Börse oder ein Verwahrer signiert Auszahlungen auf den eigenen Servern.** Ein Hot- oder Warm-Wallet-Dienst in Go oder Rust signiert Überweisungen der nativen Lane mit `signHybrid`, simuliert sie vorher (`simulateTx`, Go und TypeScript), um Saldoänderungen und Gas zu sehen, und sendet mit `submitWithSignBytesFallback`. Das [Custody-Kit](/developer-tools/custody-kit) baut darauf auf.
3. **Ein Backend setzt Sign In With QoreChain um.** Der Server stellt eine einmalig verwendbare Nonce aus, die Wallet signiert eine Anmeldenachricht, und der Server ruft `verifySiwqWithChain` auf. Siehe [die Anleitung zur Anmeldung](/qoresign/guides/sign-in).
4. **Ein Compliance- oder Support-Werkzeug prüft, wie eine Transaktion geschützt war.** `inspectTransaction` berichtet, ob eine bestätigte Transaktion eine geprüfte ML-DSA-87-Schicht trug, welche Sign-Bytes-Form sie verwendet hat und welche Stufe sie hat.
5. **Eine Wallet zeigt das Autorisierungsfenster eines EVM-Kontos.** Bevor ein Nutzer aus einer EVM-Wallet sendet, zeigt `fetchEvmWindow`, ob ein Fenster aktiv ist und wie viele Transaktionen und wie viel Wert verbleiben.
6. **Ein Python-Team signiert Berichte oder Freigaben.** `qoresign.sign_message` erzeugt eine Hybridsignatur über beliebige Bytes, die jede andere QoreSign-Sprache prüfen kann.
7. **Eine mobile Wallet auf iOS oder Android.** Das Swift-Paket und das Android-AAR liefern dieselbe Ableitung, dasselbe Signieren und dieselbe Anmeldung wie das TypeScript-Paket, Byte für Byte.
8. **Auditoren und Integratoren prüfen Signaturen offline.** `verifyHybridTx`, `verifyPqLayer` und `verifyMessage` laufen ohne Netzwerk, wenn die öffentlichen Schlüssel vorliegen.

## Funktionsweise {#how-it-works}

- **Eine Hybridtransaktion** ist ein gewöhnlicher Cosmos-SDK-`TxRaw`, der vom selben Konto zweimal signiert wird: eine ML-DSA-87-Signatur, die im Transaktions-Body als Erweiterungsoption `/qorechain.pqc.v1.PQCHybridSignature` (Algorithmus-ID `1`) mitgeführt wird, und eine secp256k1-`SIGN_MODE_DIRECT`-Signatur über den endgültigen Body.
- **Sign-Bytes v2** (heute von beiden öffentlichen Netzwerken geprüft) sind `"qorechain-pqc-hybrid-v2"`, dann die Chain-ID, der Body ohne die PQC-Erweiterung und die Auth-Info, jeweils mit Längenpräfix. Die ML-DSA-87-Signatur deckt daher die Gebühr ab. Die klassische Signatur deckt den endgültigen Body einschließlich der Erweiterung ab. v1 bleibt erhalten, um ältere Signaturen zu reproduzieren. Siehe [Hybrides Signieren von Transaktionen v1](/qoresign/spec/hybrid-signing-v1).
- **Reihenfolge:** Body und Auth-Info kodieren, die Sign-Bytes und die ML-DSA-87-Signatur berechnen, die Erweiterung anhängen, dann das SignDoc mit secp256k1 signieren und senden.
- **Registrierung:** `MsgRegisterPQCKeyV2` enthält den öffentlichen ML-DSA-87-Schlüssel, den komprimierten secp256k1-Schlüssel des Kontos und einen Besitznachweis. Die Registrierungstransaktion wird allein mit dem klassischen Schlüssel signiert.
- **Domänentrennung:** Jede ML-DSA-87-Signatur beginnt mit einem reservierten Präfix, sodass eine Nachrichten- oder Anmeldesignatur niemals als Transaktionssignatur wiederverwendet werden kann.
- **Was auf der Chain liegt:** der registrierte öffentliche ML-DSA-87-Schlüssel, die Hybridtransaktionen und die EVM-Fenster. Schlüssel, Signieren und Prüfen finden auf dem Gerät oder Server statt, auf dem QoreSign läuft.
- **Gemeinsame Testvektoren:** Die Wire-Formate werden getrennt von den Paketen versioniert und von [Testvektoren](/qoresign/vectors) abgedeckt, die jede Sprache Byte für Byte reproduziert.

Größen (FIPS 204 und die [Anleitung zu Größen](/qoresign/guides/sizes-and-transport)): Ein öffentlicher ML-DSA-87-Schlüssel hat 2.592 Bytes, der geheime Schlüssel 4.896 Bytes, eine Signatur 4.627 Bytes und der Seed 32 Bytes. Eine Hybridtransaktion ist etwa 4,7 KB größer als eine klassische, daher vor dem Signieren simulieren. Eine Signatur oder ein öffentlicher Schlüssel passt nicht in einen statischen QR-Code; Air-Gapped-Signierer brauchen mehrteilige QR-Codes. Speichern Sie den 32-Byte-Seed, nicht den geheimen Schlüssel.

## Pakete {#packages}

| Sprache | Paket | Installation | Mindestplattform |
|---|---|---|---|
| TypeScript | [`@qorechain/qoresign`](https://www.npmjs.com/package/@qorechain/qoresign) | `npm install @qorechain/qoresign` | Node.js 20 oder höher; Browser |
| Rust | [`qorechain-qoresign`](https://crates.io/crates/qorechain-qoresign) (Bibliotheksname `qoresign`) | `cargo add qorechain-qoresign` | stabiles Rust |
| Go | [`github.com/qorechain/qoresign/go`](https://pkg.go.dev/github.com/qorechain/qoresign/go) | `go get github.com/qorechain/qoresign/go@v0.2.0` | Go 1.25 |
| Python | [`qorechain-qoresign`](https://pypi.org/project/qorechain-qoresign/) (Import `qoresign`) | `pip install qorechain-qoresign` | Python 3.9+; Wheels für macOS 11+ (arm64, x86_64) und Linux (x86_64, aarch64); noch kein Windows-Wheel, andere Plattformen bauen aus der Quelldistribution (braucht Rust 1.95) |
| Swift | `QoreSign` aus [`github.com/qorechain/qoresign`](https://github.com/qorechain/qoresign) (binäres Framework im GitHub-Release) | `.package(url: "https://github.com/qorechain/qoresign", from: "0.2.0")`, Produkt `QoreSign` | iOS 16, macOS 13 |
| Kotlin / JVM | [`io.github.qorechain:qoresign`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) | `implementation("io.github.qorechain:qoresign:0.2.0")` (auf Maven Central veröffentlicht, geprüft am 11. November 2026) | Java 17, Kotlin 2.3 oder höher; native Bibliotheken für macOS (arm64, x86-64), Linux (x86-64, arm64) und Windows (x86-64) |
| Android | [`io.github.qorechain:qoresign-android`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign-android) | `implementation("io.github.qorechain:qoresign-android:0.2.0")` (auf Maven Central veröffentlicht, geprüft am 11. November 2026) | API 24, Kotlin 2.3 oder höher; `arm64-v8a`, `armeabi-v7a`, `x86_64`; R8-Keep-Regeln enthalten |

:::note Kotlin-Compiler-Version
Die Artefakte für Kotlin und Android benötigen in Ihrem Projekt den Compiler **Kotlin 2.3 oder höher**. Ein Projekt mit Kotlin 2.1 lässt sich dagegen nicht kompilieren. Erhöhen Sie die Kotlin-Version des Builds, bevor Sie die Abhängigkeit hinzufügen.
:::

Alle Implementierungen prüfen sich selbst anhand derselben [Testvektoren](/qoresign/vectors).

## Beispiel {#example}

```ts
import {
  addressFromPublicKey,
  deriveCanonicalPqKey,
  deriveClassicalKey,
  signHybrid,
  verifyHybridTx,
} from "@qorechain/qoresign";

const classical = deriveClassicalKey({ mnemonic });                 // m/44'/118'/0'/0/0
const address = addressFromPublicKey(classical.publicKey, "secp256k1").bech32;
const pqKey = deriveCanonicalPqKey({ mnemonic, address });         // the key QoreChain wallets register

// bodyBytes / authInfoBytes / accountNumber come from the dApp's SignDoc
const signed = signHybrid({ chainId: "qorechain-vladi", accountNumber, bodyBytes, authInfoBytes, classicalKey: classical, pqKey });

verifyHybridTx({
  txBytes: signed.txBytes,
  chainId: "qorechain-vladi",
  accountNumber,
  classicalPublicKey: classical.publicKey,
  pqPublicKey: pqKey.publicKey,
}); // { valid: true, classical: true, pq: { valid: true, signBytesVersion: "v2" } }
```

Der [Quickstart](/qoresign/quickstart) führt denselben Ablauf von Anfang bis Ende offline aus und enthält die Quickstarts zum Nachrichtensignieren für Python und Go.

## Haupt-API {#main-api}

Die Namen sind in der TypeScript-Form angegeben. Go verwendet dieselben Namen in Go-Schreibweise (`SignHybrid`, `VerifySiwq`); Rust und Python verwenden snake_case (`sign_hybrid`); Swift und Kotlin verwenden camelCase über dem Rust-Kern.

| Name | Was er leistet | Wo |
|---|---|---|
| `deriveClassicalKey`, `deriveCanonicalPqKey`, `pqKeyFromSeed`, `classicalKeyFromPrivate` | Schlüssel aus einer Mnemonic, einem Seed oder rohen Bytes | alle |
| `deriveHdPqKey` | gehärtete HD-Ableitung von ML-DSA-87-Schlüsseln (Entwurf, kann sich ändern) | alle |
| `addressFromPublicKey`, `addressFromBytes`, `parseAddress` | `qor1`-Adressen | alle |
| `signHybrid`, `signPqLayer`, `hybridSignBytes` | hybrides Signieren und Sign-Bytes v1 oder v2 | alle |
| `verifyHybridTx`, `verifyPqLayer` | lokale Prüfung | alle |
| `buildRegisterPqKeyMessage`, `signProofOfPossession`, `verifyProofOfPossession` | Schlüsselregistrierung mit Besitznachweis | alle |
| `signMessage`, `verifyMessage` | Signieren beliebiger Nachrichten (ADR-36 plus ML-DSA-87) | alle |
| `createSiwqMessage`, `parseSiwqMessage`, `signSiwq`, `verifySiwq` | Sign In With QoreChain v1 (maximales Alter und strenge Zeitstempel seit 0.2.0) | alle |
| `parseSiwqTimestamp` | Unix-Millisekunden eines Zeitstempels in der strengen Grammatik (0.2.0) | TypeScript, Go (`ParseSiwqTimestamp`) |
| `decideLane`, `assertHybridLane`, `evaluateLayerState` | Lane-Regeln; Erkennung einer verworfenen Schicht | alle |
| `fetchPqKeyStatus`, `resolveSignBytesVersion`, `simulateTx`, `suggestGasLimit`, `broadcastTx`, `submitWithSignBytesFallback`, `assertPqLayerMatchesRegisteredKey`, `verifySiwqWithChain`, `verifyMessageWithChain`, `fetchCommittedExtensionTypeUrls` | Netzwerk-Helfer | TypeScript, Go |
| `fetchProtocolFeature`, `PROTOCOL_FEATURES_PATH`, `SIGN_BYTES_V2_FEATURE` | einen Eintrag der Protokoll-Feature-Liste des Netzwerks lesen; deren Pfad und der Feature-Name für Sign-Bytes v2 (0.2.0) | TypeScript (`fetchProtocolFeature` auch in Go) |
| `inspectTransaction`, `fetchEvmWindow` | eine bestätigte Transaktion lesen; ein EVM-Fenster lesen (seit 0.1.1) | TypeScript |

In Go sind die Netzwerk-Helfer Methoden eines Clients: `client := network.NewClient("https://api-testnet.qore.host")`, dann `client.VerifySiwqWithChain(ctx, address, qoresign.VerifySiwqOptions{...})` oder `client.SimulateTx(...)`. Python-Fehler sind `QoreSignError` mit `code` und `detail`; Bytefelder sind `bytes`.

API-Referenz: Führen Sie in einem Klon des Repositorys `pnpm -C packages/ts docs` (TypeScript), `cargo doc -p qorechain-qoresign` (Rust) oder `go doc github.com/qorechain/qoresign/go` (Go) aus. Die Bindings für Swift, Kotlin und Python spiegeln die Rust-API; siehe die READMEs für [Swift](https://github.com/qorechain/qoresign/tree/main/swift), [Kotlin](https://github.com/qorechain/qoresign/tree/main/kotlin) und [Python](https://github.com/qorechain/qoresign/tree/main/python).

## Netzwerke und Voraussetzungen {#networks}

| | Mainnet | Testnet |
|---|---|---|
| Chain-ID | `qorechain-vladi` (EVM-Chain-ID 9801) | `qorechain-diana` (EVM-Chain-ID 9800) |
| REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM | `https://evm.qore.host` | `https://evm-testnet.qore.host` |
| Geprüfte Sign-Bytes | v2 | v2 |

- **Native Lane:** Das Netzwerk verlangt standardmäßig die ML-DSA-87-Signatur. Ausgenommen: die Registrierung des ML-DSA-87-Schlüssels eines Kontos und ein Unjail durch ein Konto ohne Schlüssel. Das Konto muss seinen Schlüssel registriert haben (`MsgRegisterPQCKeyV2`), bevor Hybridtransaktionen gültig sind; QoreChain-Wallets registrieren ihn bei der Erstellung des Kontos.
- **EVM-Lane:** Ein Konto mit registriertem ML-DSA-87-Schlüssel öffnet mit einer hybrid signierten Transaktion der nativen Lane ein begrenztes Autorisierungsfenster (Ablaufhöhe, maximale Transaktionen, maximaler Wert, optional erlaubte Verträge). Außerhalb eines aktiven Fensters lehnt das Netzwerk die EVM-Transaktionen des Kontos ab. Lesezugriffe und Gasschätzung brauchen kein Fenster.
- **Gebühren:** Denom `uqor` (6 Dezimalstellen), minimaler Gaspreis 0,1 uqor pro Gas.
- **Werte für die Keplr-Registrierung:** Bech32-Präfix `qor`, Coin-Type `118`.
- **Konten:** keine für die Offline-Funktionen. Die Netzwerk-Helfer brauchen nur einen REST-Endpunkt; zum Senden braucht es ein finanziertes Konto mit registriertem ML-DSA-87-Schlüssel.

## Dokumentation {#documentation}

- [Quickstart](/qoresign/quickstart): Schlüssel ableiten, eine hybride Transaktion in wenigen Minuten signieren und prüfen.
- Anleitungen
  - [Hybrides Signieren in eine Keplr-kompatible Wallet einbauen](/qoresign/guides/keplr-compatible-wallets)
  - [Sign In With QoreChain: Prüfung auf dem Server](/qoresign/guides/sign-in)
  - [EVM-Wallets: Autorisierungsfenster](/qoresign/guides/evm-quantum-ready)
  - [Schlüsselableitung: kanonische Schlüssel und der HD-Entwurf](/qoresign/guides/key-derivation)
  - [Größen und Transport](/qoresign/guides/sizes-and-transport)
- Spezifikationen
  - [Hybrides Signieren von Transaktionen v1](/qoresign/spec/hybrid-signing-v1)
  - [Sign In With QoreChain v1](/qoresign/spec/siwq-v1)
  - [Nachrichtensignatur v1](/qoresign/spec/message-signing-v1)
  - [ML-DSA-87-Schlüsselableitung](/qoresign/spec/hd-derivation-draft)
- [Testvektoren](/qoresign/vectors)
- [Beispiele](https://github.com/qorechain/qoresign/tree/main/examples)

## Umfang und Grenzen {#scope}

- QoreSign signiert lokal. Es verwahrt keine Schlüssel für Sie, unterstützt weder Threshold- noch MPC-Signaturen und signiert nicht auf Hardware-Wallets.
- Es gibt keine hybride EVM-Signatur: `assertHybridLane("evm")` wirft `LANE_NOT_AVAILABLE`. EVM-Konten verwenden stattdessen das Autorisierungsfenster. SVM-Transaktionen sind nicht geöffnet.
- Rust, Swift, Kotlin und Python haben keinen Netzwerkcode. Kontonummern abrufen, simulieren und senden bleibt Ihrer App überlassen, oder Sie nutzen die Helfer für TypeScript oder Go.
- `inspectTransaction` und `fetchEvmWindow` gibt es nur in TypeScript. `inspectTransaction` prüft die Schicht gegen den Schlüssel, den der Signierer jetzt registriert hat; nach einer Schlüsselrotation meldet eine ältere Transaktion daher `verified: false`.
- Die kanonische Ableitung braucht die Mnemonic. Wallets ohne sie (Schlüssel in Hardware) erzeugen einen zufälligen Schlüssel (`pqKeyFromSeed`) oder nutzen den HD-Entwurf und registrieren diesen Schlüssel. Die Mnemonic muss in kanonischer Form vorliegen (Kleinbuchstaben, einzelne Leerzeichen); andere Schreibweisen werden abgelehnt, nicht normalisiert.
- Die HD-Ableitung (`deriveHdPqKey`) ist ein Entwurf und kann sich ändern.
- Python hat noch kein Windows-Wheel. Kotlin und Android brauchen den Compiler Kotlin 2.3 oder höher.
- Die Implementierungen von ML-DSA-87 und secp256k1 stammen aus `qorechain-pqc` (aufgebaut auf `@noble/post-quantum`, `fips204` und Cloudflare CIRCL) sowie aus `@noble/curves`, `k256` und `decred/secp256k1`.

## Sicherheitshinweise {#security}

- Schlüssel verlassen niemals den Prozess, in dem QoreSign läuft. Es wird nichts gesendet, solange Sie keinen Netzwerk-Helfer aufrufen, und diese senden nur öffentliche Daten: Adressen, signierte Transaktionsbytes und Hashes.
- Zeigen Sie dem Nutzer vor dem Signieren die Nachrichten und die Gebühr aus `bodyBytes` und `authInfoBytes`; die ML-DSA-87-Signatur deckt die Gebühr ab.
- Wenn eine dApp einen Body liefert, der bereits eine PQC-Schicht trägt, prüfen Sie ihn mit `assertPqLayerMatchesRegisteredKey`, bevor Sie die klassische Signatur hinzufügen. Nach dem Senden bestätigt `evaluateLayerState` mit `fetchCommittedExtensionTypeUrls`, oder `inspectTransaction`, dass die Schicht die Chain erreicht hat.
- Signieren Sie mit dem ML-DSA-87-Schlüssel niemals rohe Bytes außerhalb der reservierten Domänen.
- Anmelde-Nonces sind einmalig verwendbar. `verifySiwq` lehnt eine Anmeldung ohne den ML-DSA-87-Teil ab, außer `requirePq: false` wird übergeben; akzeptieren Sie rein klassische Anmeldungen nur, wenn Ihr Dienst die Post-Quanten-Garantie nicht braucht.
- Speichern Sie den 32-Byte-ML-DSA-87-Seed verschlüsselt, statt des geheimen Schlüssels.
- Legen Sie niemals eine Mainnet-Mnemonic in ein Skript oder in den Shell-Verlauf. Die Beispiele verwenden die öffentliche BIP-39-Testphrase (`abandon` elfmal, dann `about`); finanzieren Sie sie niemals.
- Melden Sie Schwachstellen vertraulich an security@qore.network, nicht in öffentlichen Issues. Sicherheitskorrekturen fließen in die jeweils neueste Minor-Version.

## Wo es veröffentlicht ist {#where-published}

Versionen auf den Registries am 11. November 2026 geprüft.

| Registry | Paket | Version | Link |
|---|---|---|---|
| npm | `@qorechain/qoresign` | 0.2.0 | [npmjs.com](https://www.npmjs.com/package/@qorechain/qoresign) |
| crates.io | `qorechain-qoresign` | 0.2.0 | [crates.io](https://crates.io/crates/qorechain-qoresign) |
| Go-Modulproxy | `github.com/qorechain/qoresign/go` | v0.2.0 (Tag `go/v0.2.0`) | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qoresign/go) |
| Maven Central | `io.github.qorechain:qoresign` | Veröffentlicht (Maven Central, v0.2.0; geprüft am 11. November 2026) | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) |
| Maven Central | `io.github.qorechain:qoresign-android` | Veröffentlicht (Maven Central, v0.2.0; geprüft am 11. November 2026) | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoresign-android) |
| PyPI | `qorechain-qoresign` | 0.2.0 (Wheels für macOS arm64 und x86_64, Linux x86_64 und aarch64, Quelldistribution) | [pypi.org](https://pypi.org/project/qorechain-qoresign/) |
| Swift Package Manager | `QoreSign` aus `github.com/qorechain/qoresign` | 0.2.0 (binäres `QoreSignFFI.xcframework.zip` im Release) | [GitHub-Release](https://github.com/qorechain/qoresign/releases/tag/v0.2.0) |

Repository: [github.com/qorechain/qoresign](https://github.com/qorechain/qoresign) (Releases v0.1.0, v0.1.1, v0.2.0).

## Verwandte Seiten {#related}

- [Post-Quanten-Primitive (`qorechain-pqc`)](/developer-tools/pqc-library): die ML-DSA-87-Primitive unter QoreSign.
- [QoreChain SDK](/sdk/overview): Transaktions-Composer, Nachrichten für EVM-Fenster und Feature-Erkennung.
- [Wallet-Adapter](/developer-tools/wallet-adapter): die Alternative auf dApp-Seite, wenn eine Wallet nicht geändert werden kann. Die dApp hält den ML-DSA-87-Schlüssel und bittet die unveränderte Wallet um `signDirect`; die Bytes sind dieselben wie bei QoreSign.
- [QoreSeal](/developer-tools/qoreseal): Verschlüsselung an Konten; seine Empfängerkarten sind QoreSign-Nachrichtensignaturen.
- [Custody-Kit](/developer-tools/custody-kit): Einzahlungserkennung und Auszahlungsprüfung auf Basis von QoreSign.
- [QoreChain-MCP-Server](/developer-tools/mcp): sein Tool `get_pq_status` nutzt QoreSign, um die Hybridschicht zu prüfen.
- [Post-Quanten-Signierung](/developer-guide/post-quantum-signing) und [Börsenintegration](/developer-guide/exchange-integration).
- [Übersicht der Entwicklerpakete](/developer-tools/overview).

## Versionierung {#versioning}

QoreSign ist vor 1.0: Minor-Versionen können die API ändern, und jede inkompatible Änderung ist im [Changelog](https://github.com/qorechain/qoresign/blob/main/CHANGELOG.md) aufgeführt. Die Wire-Formate werden getrennt versioniert (die `v1`-Spezifikationen und `vectors/qoresign-v1.json`) und ändern sich innerhalb einer Version nicht.

## Mitwirken und Sicherheit {#contributing}

Siehe [CONTRIBUTING.md](https://github.com/qorechain/qoresign/blob/main/CONTRIBUTING.md). Melden Sie Schwachstellen vertraulich an security@qore.network, wie in [SECURITY.md](https://github.com/qorechain/qoresign/blob/main/SECURITY.md) beschrieben.

## Lizenz {#license}

[Apache-2.0](https://github.com/qorechain/qoresign/blob/main/LICENSE). Copyright 2026 QoreChain Association.
