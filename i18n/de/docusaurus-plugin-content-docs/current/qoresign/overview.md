---
slug: /qoresign/overview
title: QoreSign – Überblick
sidebar_label: Überblick
sidebar_position: 1
---

# QoreSign

QoreSign ist hybrides Signieren mit secp256k1 + ML-DSA-87 (FIPS 204) für Wallets
und Backends auf QoreChain.

Mit QoreSign kann eine Wallet, die nicht von QoreChain selbst stammt, den
ML-DSA-87-Schlüssel eines Kontos ableiten, Transaktionen der nativen Lane mit
beiden Schlüsseln signieren, Hybridsignaturen lokal prüfen, eine Transaktion vor
dem Signieren simulieren und Sign In With QoreChain umsetzen. QoreSign ist eine
dünne Schicht über den Bindings von
[`qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) und bringt keine
eigenen kryptografischen Primitive mit.

Die aktuelle Version ist **0.1.0**. Quellcode, Beispiele und Testvektoren
befinden sich im Repository [qorechain/qoresign](https://github.com/qorechain/qoresign).

## Was QoreSign auf den einzelnen Lanes leistet {#lanes}

| Lane | Was QoreSign heute leistet |
|---|---|
| **Native** (Cosmos SDK) | Hybrides Signieren und Prüfen. Das Netzwerk verlangt standardmäßig die ML-DSA-87-Signatur. |
| **EVM** | Nur Autorisierungsfenster: Das Konto registriert einen ML-DSA-87-Schlüssel und öffnet von der nativen Lane aus ein begrenztes Autorisierungsfenster. Ethereum-Transaktionen selbst tragen keine ML-DSA-87-Signatur. |
| **SVM** | Im Netzwerk noch nicht geöffnet (`LANE_NOT_AVAILABLE`). |

Hybrides EVM-Signieren setzt zuerst PQC-Unterstützung pro Lane im Netzwerk
voraus. Siehe
[EVM-Wallets: Autorisierungsfenster](/qoresign/guides/evm-quantum-ready).

## Pakete {#packages}

| Sprache | Paket | Installation |
|---|---|---|
| TypeScript | [`@qorechain/qoresign`](https://www.npmjs.com/package/@qorechain/qoresign) | `npm install @qorechain/qoresign` |
| Rust | [`qorechain-qoresign`](https://crates.io/crates/qorechain-qoresign) | `cargo add qorechain-qoresign` |
| Go | [`github.com/qorechain/qoresign/go`](https://pkg.go.dev/github.com/qorechain/qoresign/go) | `go get github.com/qorechain/qoresign/go` |
| Swift | [`QoreSign`](https://github.com/qorechain/qoresign) (Swift Package, iOS 16+, macOS 13+) | `.package(url: "https://github.com/qorechain/qoresign", from: "0.1.0")` |
| Kotlin / JVM | [`io.github.qorechain:qoresign`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) | `implementation("io.github.qorechain:qoresign:0.1.0")` |

Alle fünf Implementierungen prüfen sich selbst anhand derselben
[Testvektoren](/qoresign/vectors).

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

Netzwerk-Helfer (Schlüsselstatus, Simulation mit Saldoänderungen, Broadcast,
Prüfung von Anmeldungen gegen die Chain) befinden sich in
`@qorechain/qoresign/network`.

## Dokumentation {#documentation}

- [Quickstart](/qoresign/quickstart): Schlüssel ableiten, eine hybride
  Transaktion in wenigen Minuten signieren und prüfen.
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

API-Referenz: Führen Sie in einem Klon des Repositorys `pnpm -C packages/ts docs`
(TypeScript), `cargo doc -p qorechain-qoresign` (Rust) oder
`go doc github.com/qorechain/qoresign/go` (Go) aus. Die Bindings für Swift und
Kotlin spiegeln die Rust-API; siehe die READMEs für
[Swift](https://github.com/qorechain/qoresign/tree/main/swift) und
[Kotlin](https://github.com/qorechain/qoresign/tree/main/kotlin).

## Umfang {#scope}

QoreSign signiert lokal. Es verwahrt keine Schlüssel für Sie, unterstützt weder
Threshold- noch MPC-Signaturen und signiert nicht auf Hardware-Wallets. Die
Implementierungen von ML-DSA-87 und secp256k1 stammen aus `qorechain-pqc`
(aufgebaut auf `@noble/post-quantum`, `fips204` und Cloudflare CIRCL) sowie aus
`@noble/curves`, `k256` und `decred/secp256k1`.

## Versionierung {#versioning}

QoreSign ist vor 1.0: Minor-Versionen können die API ändern, und jede
inkompatible Änderung ist im
[Changelog](https://github.com/qorechain/qoresign/blob/main/CHANGELOG.md)
aufgeführt. Die Wire-Formate werden getrennt versioniert (die `v1`-Spezifikationen
und `vectors/qoresign-v1.json`) und ändern sich innerhalb einer Version nicht.

## Mitwirken und Sicherheit {#contributing}

Siehe
[CONTRIBUTING.md](https://github.com/qorechain/qoresign/blob/main/CONTRIBUTING.md).
Melden Sie Schwachstellen vertraulich, wie in
[SECURITY.md](https://github.com/qorechain/qoresign/blob/main/SECURITY.md)
beschrieben.

## Lizenz {#license}

[Apache-2.0](https://github.com/qorechain/qoresign/blob/main/LICENSE). Copyright
2026 QoreChain Association.
