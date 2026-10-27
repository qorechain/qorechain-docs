---
slug: /qorel/signing-from-any-language
title: QoreChain-Transaktionen aus jeder Sprache signieren
sidebar_label: Signieren aus jeder Sprache
sidebar_position: 8
---

# QoreChain-Transaktionen aus jeder Sprache signieren

QORel signiert in Rust mit dem Crate `qorel-signer`. Andere Relayer, Bots und Werkzeuge können dieselbe hybride Post-Quanten-Signatur in anderen Sprachen mit dem QoreChain-SDK und den Post-Quanten-Bibliotheken erzeugen. Diese Seite legt den Vertrag fest, dem alle folgen, und nennt die Bibliothek für Rust, TypeScript, Go, Python und Java. Sie richtet sich an Entwickler, die einen Relayer, einen Bot oder ein Backend bauen, das Transaktionen an QoreChain sendet.

## Innovationen {#innovations}

- **Ein Vertrag, ein Satz Testvektoren.** Jede Sprache baut dieselben Sign-Bytes und dieselbe Erweiterung. Das QORel-Repository veröffentlicht Vektoren, die Byte für Byte aus Transaktionen nachgebaut wurden, die die Chain akzeptiert hat, sodass Sie eine Implementierung prüfen können, bevor sie ein Netzwerk berührt.
- **Die Erweiterung ist die einzige Ergänzung.** Die Post-Quanten-Signatur reist in einer Erweiterungsoption des Transaktions-Bodys; Nachrichten, Gebühren und die klassische Signatur behalten ihre übliche Form.
- **Der Einhängepunkt ist schmal.** Die Signatur wird hinzugefügt, nachdem die Auth-Info feststeht und bevor das klassische Sign-Dokument gebaut wird. Ein Relayer braucht an dieser Stelle eine Änderung, kein Neuschreiben.
- **Überall derselbe Schlüssel.** Der ML-DSA-87-Schlüssel wird mit der QoreChain-Wallet-Ableitung aus der Mnemonic des Kontos abgeleitet, sodass jede Wallet und jeder Relayer, der die Mnemonic importiert, denselben Post-Quanten-Schlüssel erhält.

## Verwendung {#how-to-use}

### Der Vertrag {#contract}

QoreChain akzeptiert eine Transaktion der nativen Lane nur, wenn sie beide Signaturen trägt:

- **Die klassische secp256k1-Signatur** in der üblichen Form `SIGN_MODE_DIRECT`. Sie deckt den finalen Body ab, die Erweiterung eingeschlossen.
- **Eine ML-DSA-87-Signatur (FIPS 204)** in einer Erweiterungsoption des Bodys vom Typ `/qorechain.pqc.v1.PQCHybridSignature`, mit `algorithm_id = 1`, `pqc_signature` (4.627 Bytes) und einem optionalen `pqc_public_key` (2.592 Bytes). Sie muss die einzige kritische Erweiterungsoption (in `extension_options`) der Transaktion sein.

Die ML-DSA-Signatur deckt die Sign-Bytes ab (Version 2, aktuell auf beiden Netzwerken):

```
"qorechain-pqc-hybrid-v2" || BE64(len(chain_id)) || chain_id
                          || BE32(len(B0)) || B0
                          || BE32(len(A))  || A
```

- `B0` ist der `TxBody` ohne die PQC-Erweiterung, kanonisch neu kodiert.
- `A` sind die unveränderten `AuthInfo`-Bytes.

Reihenfolge der Schritte:

1. Bauen Sie den Body und die Auth-Info.
2. Signieren Sie die Sign-Bytes mit ML-DSA-87.
3. Hängen Sie die Erweiterung an den Body an.
4. Signieren Sie den finalen Body mit secp256k1.
5. Senden Sie per Broadcast.

Regeln, bei denen man leicht Fehler macht:

- `B0` muss kanonisch sein, weil die Chain es ableitet, indem sie den Body dekodiert, die Hybridoption entfernt und neu kodiert. Senden Sie keine Bodys mit eigenen Erweiterungsoptionen, dem Flag `unordered`, unbekannten Feldern oder einer nicht kanonischen Kodierung.
- Eine Ablehnung mit Codespace `pqc` Code 21 bedeutet, dass die Hybridsignatur nicht verifiziert wurde. Lesen Sie die Sign-Bytes-Version und die Registrierung des Kontos neu, bevor Sie es erneut versuchen; siehe [Post-Quanten-Signierung](/developer-guide/post-quantum-signing#code-21).
- Gas: Die Prüfung kostet 2.000 Gas pro Signer mit Schlüssel, plus die Größenkosten der rund 4,7 KB Erweiterung. Simulieren Sie über denselben Pfad, damit beides gezählt wird.

### Den Schlüssel registrieren und ableiten {#keys}

Das Konto registriert seinen öffentlichen ML-DSA-Schlüssel einmalig mit `MsgRegisterPQCKeyV2`, einschließlich eines Besitznachweises (Proof of Possession). Das ist die einzige Transaktion, die QoreChain allein mit der klassischen Signatur akzeptiert. Siehe [Post-Quanten-Signierung](/developer-guide/post-quantum-signing#pqc-key-registration).

Der ML-DSA-Schlüssel wird aus derselben Mnemonic wie das Konto abgeleitet:

```
seed = SHAKE256("qorechain:pqc:v1|" + address + "|" + mnemonic)[:32]
```

danach `ML-DSA-87.KeyGen_internal(seed)`. Geheimnisse werden genullt und nie ausgegeben. Dieselbe Ableitung ist unter [Schlüsselableitung](/qoresign/guides/key-derivation) beschrieben.

### Die Signierschicht in QORel {#signer-layer}

Das Crate `qorel-signer` teilt die Arbeit in drei Schnittstellen auf:

- `PqSigner`: ein Post-Quanten-Primitiv (`algorithm_id`, `public_key`, `sign`). `MlDsa87Signer` wird mitgeliefert, mit hedged Signieren als Standard und deterministischem Signieren für Testvektoren; jede Signatur wird vor der Verwendung geprüft.
- `SignBytesFramer`: die Regeln einer Chain (`check_body`, `frame`, `pack`).
- `TxExtensionSigner`: das, was der Relayer aufruft. `PqExtensionSigner` verbindet ein Primitiv und einen Framer.

Der Relayer baut eine Transaktion in dieser Reihenfolge: den Body ohne Erweiterung eines Co-Signers kodieren (`B0`); die finale Auth-Info kodieren (`A`); den Co-Signer nach den anzuhängenden Erweiterungsoptionen fragen; den Body mit ihnen neu kodieren; die klassische Signatur über das Sign-Dokument des finalen Bodys erstellen. Um das Crate aus Rust zu verwenden, binden Sie es aus dem Repository ein (es ist nicht auf crates.io):

```toml
[dependencies]
qorel-signer = { git = "https://github.com/qorechain/QORel", tag = "qorel-v0.1.0" }
```

Ein vollständiger Aufruf, der den Hybrid-Signer für eine Chain baut und ihn nach den Erweiterungsoptionen fragt, steht in `crates/qorel-signer/README.md` im Repository. Das Crate arbeitet auf rohen Protobuf-Bytes, verweigert Bodys, die die Chain ablehnen würde (eine bereits vorhandene kritische Erweiterungsoption, `unordered`, unbekannte Felder), fällt in QoreChain-Netzwerken nie auf v1-Sign-Bytes zurück, solange die Version nicht bekannt ist, prüft jede Signatur, die es erzeugt, und nullt Geheimnisse und schwärzt sie in der `Debug`-Ausgabe. Seine Tests bauen Transaktionen, die der Ante-Handler der Chain akzeptiert hat, Byte für Byte nach. Siehe auch [qorel-signer in der Übersicht](/qorel/overview#qorel-signer).

Eine Chain, die eine andere zusätzliche Signatur braucht, implementiert einen Framer und, falls sich der Algorithmus unterscheidet, ein neues Primitiv; sonst ändert sich nichts am Relayer.

### Bibliotheken {#libraries}

| Sprache | Paket | Hybrides Signieren |
|---|---|---|
| Rust | `qorechain-sdk` (crates.io) oder `qorel-signer` aus dem [QORel-Repository](https://github.com/qorechain/QORel) (`crates/qorel-signer`) | `qorel_signer::qorechain::qorechain_hybrid_signer` mit `PqExtensionSigner`; `qorechain::tx::build_hybrid_tx` |
| TypeScript und JavaScript | `npm install @qorechain/sdk` | `TxClient` signiert hybrid mit einem `pqcKeypair`; `ensurePqcRegistered` |
| Go | `go get github.com/qorechain/qorechain-sdk/packages/go@latest` | `qorechain/tx` (hybrides Bauen und Signieren), `qorechain/signbytes`, `qorechain/pqcdx` |
| Python | `pip install qorechain-sdk` | `build_hybrid_tx`, `build_hybrid_signature_extension` |
| Java und Kotlin | `io.github.qorechain:qorechain-sdk` (Maven Central) | `PqcDx` (Registrierung, hybrider Sendepfad) und der Builder für hybride Transaktionen |
| C und andere | [`qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) | Bindings für ML-DSA-87 Schlüsselerzeugung, Signieren und Prüfen; bilden Sie die Sign-Bytes wie oben beschrieben |

Die aktuelle Version jedes Pakets steht unter [Entwickler-Pakete](/developer-tools/overview), das Signieren in einer Wallet oder einem Backend unter [QoreSign](/qoresign/overview). Die rein klassischen Clients in einigen Paketen können keine Transaktionen der nativen Lane senden; prüfen Sie die Paketseite, bevor Sie einen für Schreibzugriffe verwenden.

### Testvektoren {#test-vectors}

`crates/qorel-signer/tests/vectors/` im QORel-Repository enthält:

- eine Known-Answer-Datei für Sign-Bytes;
- Vektoren für Relay-Transaktionen: den Body ohne die Erweiterung, die Sign-Bytes, die Bytes der Erweiterung und die vollständig signierte Transaktion, Byte für Byte aus Transaktionen nachgebaut, die die Chain akzeptiert hat;
- den SDK-übergreifenden Vektor der Schlüsselableitung.

Führen Sie sie in Ihrer Sprache aus, bevor Sie etwas an ein Live-Netzwerk senden. Die QoreSign-Vektoren stehen unter [Testvektoren](/qoresign/vectors).

### Post-Quanten-Signierung in einem anderen Relayer ergänzen {#other-relayers}

Der Einhängepunkt ist „nachdem die Auth-Info feststeht und bevor das klassische Sign-Dokument gebaut wird“. Hängen Sie die Erweiterung dort ein:

- In Hermes-basierten Relayern ist das `crates/relayer/src/chain/cosmos/encode.rs::sign_tx`. Die Änderung von QORel dort ist generisch: Jeder `TxExtensionSigner` kann Erweiterungsoptionen hinzufügen.
- In Go-Relayern, die auf dem Paket `client/tx` des Cosmos SDK aufbauen, umhüllen Sie den `TxBuilder` vor `SetSignatures`.

## Zugang {#how-to-access}

- **Netzwerk.** Der Vertrag ist auf beiden QoreChain-Netzwerken derselbe; QORel selbst ist nur im Testnet getestet.
- **Schlüssel und Konto.** Ein aufgeladenes Konto mit einem registrierten ML-DSA-87-Schlüssel; Test-QOR gibt es beim [Dashboard-Faucet](/dashboard/faucet).
- **Kosten.** Die Bibliotheken sind kostenlos (Apache-2.0). Transaktionen zahlen Gas mit einer Untergrenze von 0,1 uqor pro Gas.

## Wo es veröffentlicht ist {#where-published}

| Paket | Registry | Quellcode |
|---|---|---|
| `qorel-signer` | Im Repository (`crates/qorel-signer`); nicht auf crates.io, verwenden Sie die Git-Abhängigkeit oben | [qorechain/QORel](https://github.com/qorechain/QORel) |
| `qorechain-sdk`, `@qorechain/sdk`, Go-Modul, Maven-Artefakt | crates.io, npm, Go-Proxy, Maven Central, PyPI | [qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk) |
| `qorechain-pqc` | npm, PyPI, crates.io, Go, Maven | [qorechain/qorechain-pqc](https://github.com/qorechain/qorechain-pqc) |

## Grenzen und bekannte Probleme {#limits}

- **Nur ML-DSA-87 (Algorithmus-ID 1).** Das ist der einzige Algorithmus, mit dem QORel und die obigen Bibliotheken signieren.
- **Sign-Bytes-Version.** Diese Seite dokumentiert Version 2, die beide Netzwerke prüfen. Ein Werkzeug muss die Version dennoch von der Chain lesen (die angewendeten Upgrade-Einträge), statt sie anzunehmen; QORel tut das.
- **Das Signieren ist lokal.** Keine dieser Bibliotheken hält einen Schlüssel für Sie oder signiert über eine Hardware-Wallet.
- **Sprachbeispiele werden hier nicht wiederholt.** Verwenden Sie den Quickstart des jeweiligen Pakets; dieses Handbuch behauptet nicht, dass jede Sprache gegen die QORel-Testvektoren ausgeführt wurde.
