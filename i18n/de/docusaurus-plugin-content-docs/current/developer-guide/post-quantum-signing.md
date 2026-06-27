---
slug: /developer-guide/post-quantum-signing
title: Post-Quanten-Signierung
sidebar_label: Post-Quanten-Signierung
sidebar_position: 8
---

# Post-Quanten-Signierung

`qorechain-pqc` ist die quelloffene, **rein standardbasierte** Post-Quanten-Kryptografie-Bibliothek hinter QoreChain. Sie liefert Wallets, Integratoren und Werkzeugen genau die Primitive, die die Chain verwendet — in sechs Sprachen, mit einer einheitlichen API, **nachweislich byte-kompatibel** gegen eine gemeinsame sprachübergreifende Testvektor-Suite.

Die Bibliothek umschließt auditierte Implementierungen der **finalen NIST-Standards**. Sie erfindet **keine** eigene Variante: Eine nicht standardkonforme Variante ist genau das, was die Interoperabilität bricht (eine an einer Stelle erzeugte Signatur würde an einer anderen nicht verifizieren). Jede Anbindung wird gegen dieselben Vektoren validiert, sodass eine in einer Sprache erzeugte ML-DSA-Signatur in jeder anderen verifiziert, ML-KEM-Shared-Secrets über alle sechs hinweg übereinstimmen und SHAKE-256-Digests identisch sind.

* **Repository:** [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc)
* **Lizenz:** Apache-2.0

## Primitive

| Primitiv | Standard | Rolle | Stufen (Standard in **fett**) |
| --- | --- | --- | --- |
| **ML-DSA** | FIPS-204 | digitale Signaturen | 44 · 65 · **87** |
| **ML-KEM** | FIPS-203 | Schlüsselkapselung | 512 · 768 · **1024** |
| **SHAKE-256** | FIPS-202 | Hash mit erweiterbarer Ausgabe | — |

Dies sind dieselben Primitive, die QoreChain auf Protokollebene einsetzt: **ML-DSA-87-Signaturen (Dilithium-5)**, **ML-KEM-1024-Schlüsselkapselung** und **SHAKE-256** als standardmäßiger Anwendungs-Hash. Siehe [Post-Quanten-Sicherheit](/architecture/post-quantum-security) dazu, wie die Chain sie verwendet.

### Größen (Bytes)

Wählen Sie die Sicherheitsstufe nach Ihrem Größen-/Sicherheitsbudget.

| Verfahren | Sicherheit | Öffentlicher Schlüssel | Signatur / Chiffretext |
| --- | --- | --- | --- |
| ML-DSA-44 | L2 | 1312 | 2420 |
| ML-DSA-65 | L3 | 1952 | 3309 |
| **ML-DSA-87** | L5 | 2592 | 4627 |
| ML-KEM-512 | L1 | 800 | 768 |
| ML-KEM-768 | L3 | 1184 | 1088 |
| **ML-KEM-1024** | L5 | 1568 | 1568 |

> Sie können einen NIST-Standard nicht kleiner machen und gleichzeitig standardkonform bleiben. ML-DSA-87 hat feste Schlüssel-/Signaturgrößen und feste Bytes — eine „Optimierung“ ergibt eine nicht standardkonforme Variante, die keine andere Implementierung verifizieren kann. Um den On-Chain-Fußabdruck zu verkleinern, nutzen Sie die folgenden Hebel, anstatt das Verfahren zu verändern.

## Sprachen und Pakete

Jede Sprache stellt dieselbe API bereit, jeweils gestützt auf eine andere auditierte Implementierung. Genau das garantiert Byte-Kompatibilität — unabhängige Backends stimmen mit dem Standard überein.

| Sprache | Paket | Installation | Gestützt auf |
| --- | --- | --- | --- |
| JavaScript / TypeScript | `@qorechain/pqc` (npm) | `npm i @qorechain/pqc` | [@noble/post-quantum](https://github.com/paulmillr/noble-post-quantum) |
| Rust | `qorechain-pqc` (crates.io) | `cargo add qorechain-pqc` | `fips204` · `fips203` · `sha3` |
| Python | `qorechain-pqc` (PyPI) | `pip install qorechain-pqc` (import `qorpqc`) | [liboqs-python](https://github.com/open-quantum-safe/liboqs-python) |
| Go | `github.com/qorechain/qorechain-pqc/go` | `go get github.com/qorechain/qorechain-pqc/go` | [Cloudflare CIRCL](https://github.com/cloudflare/circl) |
| C | `c/` (statische Lib + Header) | aus dem [Repo](https://github.com/qorechain/qorechain-pqc) bauen | [liboqs](https://github.com/open-quantum-safe/liboqs) + OpenSSL |
| Java | `io.github.qorechain:qorechain-pqc` (Maven Central) | `io.github.qorechain:qorechain-pqc:0.1.0` | [Bouncy Castle](https://www.bouncycastle.org/) |

:::info Verfügbarkeit
Die Bindungen für JavaScript, Rust, Python, Go und Java sind alle in Version **0.1.0** **veröffentlicht** — installieren Sie sie mit den obigen Befehlen direkt von npm, crates.io, PyPI, dem Go-Modul-Proxy und Maven Central. Die Python-Distribution installiert sich als `qorechain-pqc`, wird aber **als `qorpqc` importiert**. Das **Java**-Paket ist auf Maven Central als `io.github.qorechain:qorechain-pqc:0.1.0` verfügbar (Bouncy-Castle-Backend). Die **C**-Bindung ist eine statische Bibliothek + Header, die Sie aus [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) bauen.
:::

## Einheitliche API

Jede Sprache bietet dieselbe Oberfläche:

```text
keygen()                              -> (publicKey, secretKey)
sign(secretKey, message)              -> signature
verify(publicKey, message, signature) -> bool

kem.keygen()                          -> (publicKey, secretKey)
kem.encapsulate(publicKey)            -> (cipherText, sharedSecret)
kem.decapsulate(secretKey, cipherText)-> sharedSecret

shake256(data, outLen=32)             -> digest
```

### Schnellstart (JavaScript / TypeScript)

```js
import { mldsa, mlkem, shake256, pubkeyHash } from '@qorechain/pqc';

// ML-DSA-87 signatures
const { publicKey, secretKey } = mldsa.keygen();
const sig = mldsa.sign(secretKey, message);
mldsa.verify(publicKey, message, sig); // true

// ML-KEM-1024 key encapsulation
const { publicKey: ek, secretKey: dk } = mlkem.keygen();
const { cipherText, sharedSecret } = mlkem.encapsulate(ek);
mlkem.decapsulate(dk, cipherText); // === sharedSecret

// SHAKE-256 + blockchain helpers
shake256(data, 32);        // 32-byte digest
pubkeyHash(publicKey, 20); // pay-to-pubkey-hash
```

Stufenspezifische Exporte sind verfügbar, wenn der Standard nicht das Gewünschte ist: `mldsa44/65/87` und `mlkem512/768/1024` (`mldsa` / `mlkem` sind die L5-Standards).

Die Bindungen für **Rust, Go, C, Python und Java** spiegeln dies exakt wider. Zum Beispiel:

```rust
// Rust
use qorechain_pqc::mldsa::default as mldsa;
let (pk, sk) = mldsa::keygen()?;
let sig = mldsa::sign(&sk, msg)?;
assert!(mldsa::verify(&pk, msg, &sig));
```

```go
// Go
pk, sk, _ := pqc.MLDSA.Keygen()
sig, _ := pqc.MLDSA.Sign(sk, msg)
pqc.MLDSA.Verify(pk, msg, sig) // true
```

## Blockchain-Hilfsfunktionen

Über die rohen Primitive hinaus stellt die Bibliothek zwei Hilfsfunktionen bereit, die Integratoren für die Interaktion mit QoreChain-Konten und -Transaktionen benötigen.

### `pubkeyHash(pk, len=20)`

Eine **Pay-to-Pubkey-Hash**-Registrierungshilfe. Sie erzeugt einen kurzen (20–32 Byte) SHAKE-256-Hash eines öffentlichen Schlüssels. Das Muster: nur den `pubkeyHash` im Kontozustand speichern und den vollständigen öffentlichen Schlüssel in der Transaktion verlangen. Der Kontozustand bleibt winzig, unabhängig vom 1–2,5 KB großen Schlüssel.

### `hybridSignBytes(bodyWithoutPqcExt, authInfo)`

Das wallet-kompatible **Hybrid-Extension-Sign-Bytes-Framing** von QoreChain. Es erzeugt genau die Bytes, die mit ML-DSA-87 (Dilithium-5) signiert werden müssen, um die PQC-Hälfte einer hybriden Transaktion zu bilden.

Dies ist der Baustein, den Wallets und Integratoren verwenden, um die **erforderliche hybride Signatur** auf dem Cosmos-Transaktionspfad zu erzeugen. Ab der aktuellen Chain-Version sind hybride Signaturen **standardmäßig erforderlich** (`hybrid_signature_mode = required`, `allow_classical_fallback = false`): Jede Transaktion auf dem Cosmos-Pfad muss neben ihrer klassischen secp256k1-Signatur eine Dilithium-5-Signatur tragen. Siehe [Post-Quanten-Sicherheit](/architecture/post-quantum-security) für das Durchsetzungsmodell.

Die klassische secp256k1-Signatur wird über die Standard-Sign-Bytes berechnet (die die PQC-Erweiterung **ausschließen**), und die ML-DSA-87-Signatur wird berechnet und als `PQCHybridSignature`-Erweiterung angehängt. Da die klassischen Sign-Bytes die Erweiterung ausschließen, bleibt die klassische Signatur gültig, unabhängig davon, ob ein Verifizierer den PQC-Teil versteht oder nicht.

Es gibt drei Möglichkeiten, diese hybride Signatur zu erzeugen:

* **Das CLI** — `qorechaind tx pqc cosign` hängt die Dilithium-5-Cosignatur an eine Transaktion an (nach `qorechaind tx pqc gen-key`). Siehe [Transaktionsbefehle](/cli-reference/transaction-commands).
* **Das QoreChain SDK** — `buildHybridTx` (mit `includePqcPublicKey`) macht das Äquivalent in TypeScript/Python/Go/Rust. Siehe [SDK-Konten & PQC-Signierung](/sdk/concepts/accounts-pqc).
* **`qorechain-pqc` direkt** — verwenden Sie `hybridSignBytes`, um die Sign-Bytes zu rahmen, und `mldsa.sign`, um die Dilithium-5-Signatur zu erzeugen, wenn Sie Werkzeuge außerhalb des SDK in einer der sechs unterstützten Sprachen erstellen.

## Optimierung des On-Chain-Fußabdrucks

ML-DSA-Schlüssel und -Signaturen sind nach klassischen Maßstäben groß. Da die Bytes eines Standards fest sind, besteht der Weg, den On-Chain-Fußabdruck klein zu halten, in der Nutzung dieser drei Hebel — von denen keiner den Standard verändert:

1. **Wählen Sie die Sicherheitsstufe bewusst.** ML-DSA-65-Signaturen (L3) sind ~28 % kleiner als ML-DSA-87 (L5) und bleiben sehr stark; ML-KEM-768-Chiffretexte sind kleiner als 1024. Wählen Sie je nach Anwendungsfall.
2. **Pay-to-Pubkey-Hash.** Speichern Sie nur `pubkeyHash(pk)` (20–32 Byte SHAKE-256) im Kontozustand und verlangen Sie den vollständigen öffentlichen Schlüssel in der Transaktion. Der Kontozustand bleibt winzig, unabhängig von der Schlüsselgröße.
3. **Signaturen verifizieren und verwerfen.** Eine Signatur muss in der Transaktion (Blockdaten) vorhanden sein, sollte aber niemals in den persistenten Zustandsbaum geschrieben werden.

> **Warum kein Falcon?** FN-DSA (Falcon) würde kleinere Signaturen liefern, ist aber absichtlich **ausgeschlossen**: FN-DSA ist FIPS-206 *Entwurf* (nicht final), und eine rein standardbasierte Bibliothek liefert nur finalisierte Standards aus. Es kann erneut betrachtet werden, sobald FIPS-206 finalisiert ist.

## Verwandt

* [Post-Quanten-Sicherheit](/architecture/post-quantum-security) — wie die Chain diese Primitive verwendet und hybride Signaturen durchsetzt.
* [Transaktionsbefehle](/cli-reference/transaction-commands) — der CLI-Ablauf `tx pqc gen-key` / `tx pqc cosign`.
* [SDK-Konten & PQC-Signierung](/sdk/concepts/accounts-pqc) — Schlüssel und hybride Signierung aus dem QoreChain SDK.
* [Wallet-Einrichtung](/getting-started/wallet-setup) — PQC-gestützte Konten erstellen und verwalten.
