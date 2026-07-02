---
slug: /developer-guide/post-quantum-signing
title: Post-Quanten-Signierung
sidebar_label: Post-Quanten-Signierung
sidebar_position: 8
---

# Post-Quanten-Signierung

`qorechain-pqc` ist die Open-Source-Bibliothek für Post-Quanten-Kryptographie hinter QoreChain — **ausschließlich auf Standards basierend**. Sie stellt Wallets, Integratoren und Tooling genau die Primitiven bereit, die die Chain verwendet — in sechs Sprachen, mit einer konsistenten API, **nachweislich byte-kompatibel** anhand einer gemeinsamen sprachübergreifenden Testvektor-Suite.

Die Bibliothek kapselt auditierte Implementierungen der **finalen NIST-Standards**. Sie erfindet **kein** eigenes Verfahren: Eine nicht-standardkonforme Variante ist genau das, was Interoperabilität zerstört (eine an einer Stelle erzeugte Signatur würde an anderer Stelle nicht verifizieren). Jedes Binding wird gegen dieselben Vektoren validiert — eine in einer Sprache erzeugte ML-DSA-Signatur verifiziert daher in jeder anderen, ML-KEM-Shared-Secrets stimmen über alle sechs Sprachen überein, und SHAKE-256-Digests sind identisch.

* **Repository:** [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc)
* **Lizenz:** Apache-2.0

## Primitiven

| Primitive | Standard | Rolle | Stufen (Standard in **Fettschrift**) |
| --- | --- | --- | --- |
| **ML-DSA** | FIPS-204 | digitale Signaturen | 44 · 65 · **87** |
| **ML-KEM** | FIPS-203 | Schlüsselkapselung | 512 · 768 · **1024** |
| **SHAKE-256** | FIPS-202 | Hash mit erweiterbarer Ausgabe | — |

Dies sind dieselben Primitiven, die QoreChain auf Protokollebene einsetzt: **ML-DSA-87 (Dilithium-5)**-Signaturen, **ML-KEM-1024**-Schlüsselkapselung und **SHAKE-256** als Standard-Anwendungshash. Siehe [Post-Quanten-Sicherheit](/architecture/post-quantum-security) für die Nutzung durch die Chain.

### Größen (Bytes)

Wählen Sie die Sicherheitsstufe nach Ihrem Größen-/Sicherheitsbudget.

| Verfahren | Sicherheit | Öffentlicher Schlüssel | Signatur / Ciphertext |
| --- | --- | --- | --- |
| ML-DSA-44 | L2 | 1312 | 2420 |
| ML-DSA-65 | L3 | 1952 | 3309 |
| **ML-DSA-87** | L5 | 2592 | 4627 |
| ML-KEM-512 | L1 | 800 | 768 |
| ML-KEM-768 | L3 | 1184 | 1088 |
| **ML-KEM-1024** | L5 | 1568 | 1568 |

> Man kann einen NIST-Standard nicht verkleinern und trotzdem standardkonform bleiben. ML-DSA-87 hat feste Schlüssel-/Signaturgrößen und feste Bytes — ein "Optimieren" erzeugt eine nicht-standardkonforme Variante, die keine andere Implementierung verifizieren kann. Um den On-Chain-Fußabdruck zu verkleinern, nutzen Sie die unten beschriebenen Hebel, statt das Verfahren zu verändern.

## Sprachen und Pakete

Jede Sprache stellt dieselbe API bereit, jeweils gestützt auf eine andere auditierte Implementierung. Genau das garantiert Byte-Kompatibilität — unabhängige Backends stimmen über den Standard überein.

| Sprache | Paket | Installation | Basiert auf |
| --- | --- | --- | --- |
| JavaScript / TypeScript | `@qorechain/pqc` (npm) | `npm i @qorechain/pqc` | [@noble/post-quantum](https://github.com/paulmillr/noble-post-quantum) |
| Rust | `qorechain-pqc` (crates.io) | `cargo add qorechain-pqc` | `fips204` · `fips203` · `sha3` |
| Python | `qorechain-pqc` (PyPI) | `pip install qorechain-pqc` (Import als `qorpqc`) | [liboqs-python](https://github.com/open-quantum-safe/liboqs-python) |
| Go | `github.com/qorechain/qorechain-pqc/go` | `go get github.com/qorechain/qorechain-pqc/go` | [Cloudflare CIRCL](https://github.com/cloudflare/circl) |
| C | `c/` (statische Bibliothek + Header) | Build aus dem [Repo](https://github.com/qorechain/qorechain-pqc) | [liboqs](https://github.com/open-quantum-safe/liboqs) + OpenSSL |
| Java | `io.github.qorechain:qorechain-pqc` (Maven Central) | `io.github.qorechain:qorechain-pqc:0.1.1` | [Bouncy Castle](https://www.bouncycastle.org/) |

:::info Verfügbarkeit
Die Bindings für JavaScript, Rust, Python, Go und Java sind alle in Version **0.1.1** **veröffentlicht** — installieren Sie sie direkt von npm, crates.io, PyPI, dem Go-Module-Proxy und Maven Central mit den obigen Befehlen. Die Python-Distribution wird als `qorechain-pqc` installiert, **importiert aber als `qorpqc`**. Das **Java**-Paket ist auf Maven Central als `io.github.qorechain:qorechain-pqc:0.1.1` verfügbar (Bouncy-Castle-Backend). Das **C**-Binding ist eine statische Bibliothek + Header, die Sie aus [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) selbst bauen.
:::

## Deterministische Signierung (konsenskritisch) {#deterministic-signing}

Seit Version **0.1.1** erzeugt `sign()` in **allen sechs Bindings** die **deterministische** ML-DSA-Variante (FIPS-204 §3.4, bei der die Signierzufälligkeit aus 32 Null-Bytes besteht) — und dies ist die einzige Variante, die die Chain akzeptiert. Der Transaktionsverifizierer von QoreChain **weist hedged (randomisierte) ML-DSA-Signaturen zurück**; eine hedged Signatur schlägt daher on-chain fehl, obwohl sie kryptographisch verifiziert.

Wichtige Fakten:

* **Ändern Sie den Standardwert nicht.** Deterministische Signierung ist konsenskritisch; jedes Binding dokumentiert sie entsprechend.
* Die deterministische Ausgabe ist für denselben Schlüssel und dieselbe Nachricht **byte-identisch über alle sechs Bindings** — festgeschrieben durch gemeinsame sprachübergreifende Testvektoren.
* Hedged Signierung bleibt als **explizites Opt-in** pro Binding verfügbar (z. B. `{hedged: true}` in JavaScript, `sign_hedged` in Rust, `mldsaSignHedged` in Java, `sign(..., hedged=True)` in Python) für Anwendungsfälle außerhalb der Chain — hedged Signaturen werden **von der Chain nicht akzeptiert**.
* Version 0.1.0 des JavaScript-Bindings signierte standardmäßig hedged — falls Sie Transaktions-Tooling gegen 0.1.0 gebaut haben, **aktualisieren Sie auf 0.1.1**; Transaktionen, die mit dem alten Standard signiert wurden, werden on-chain zurückgewiesen.

## Konsistente API

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

Stufenspezifische Exporte sind verfügbar, falls der Standard nicht das Gewünschte ist: `mldsa44/65/87` und `mlkem512/768/1024` (`mldsa` / `mlkem` sind die L5-Standards).

Die Bindings für **Rust, Go, C, Python und Java** spiegeln dies exakt wider. Zum Beispiel:

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

## Blockchain-Helfer

Über die reinen Primitiven hinaus stellt die Bibliothek zwei Helfer bereit, die Integratoren für die Interaktion mit QoreChain-Konten und -Transaktionen benötigen.

### `pubkeyHash(pk, len=20)`

Ein Registrierungshelfer für **Pay-to-Pubkey-Hash**. Er erzeugt einen kurzen (20–32 Byte) SHAKE-256-Hash eines öffentlichen Schlüssels. Das Muster: Nur den `pubkeyHash` im Kontozustand speichern und den vollständigen öffentlichen Schlüssel in der Transaktion verlangen. Der Kontozustand bleibt winzig, unabhängig vom 1–2,5 KB großen Schlüssel.

### `hybridSignBytes(bodyWithoutPqcExt, authInfo)`

Das Wallet-kompatible **Hybrid-Extension-Sign-Bytes-Framing** von QoreChain. Es erzeugt exakt die Bytes, die mit ML-DSA-87 (Dilithium-5) signiert werden müssen, um die PQC-Hälfte einer Hybrid-Transaktion zu bilden.

Dies ist der Baustein, den Wallets und Integratoren verwenden, um die **erforderliche Hybrid-Signatur** auf dem Cosmos-Transaktionspfad zu erzeugen. Ab der aktuellen Chain-Version sind Hybrid-Signaturen **standardmäßig erforderlich** (`hybrid_signature_mode = required`, `allow_classical_fallback = false`): Jede Transaktion auf dem Cosmos-Pfad muss neben ihrer klassischen secp256k1-Signatur eine Dilithium-5-Signatur tragen. Siehe [Post-Quanten-Sicherheit](/architecture/post-quantum-security) für das Durchsetzungsmodell.

Die klassische secp256k1-Signatur wird über die Standard-Sign-Bytes berechnet (die die PQC-Extension **ausschließen**), und die ML-DSA-87-Signatur wird berechnet und als `PQCHybridSignature`-Extension angehängt. Da die klassischen Sign-Bytes die Extension ausschließen, bleibt die klassische Signatur gültig — unabhängig davon, ob ein Verifizierer den PQC-Teil versteht.

Es gibt drei Wege, diese Hybrid-Signatur zu erzeugen:

* **Die CLI** — `qorechaind tx pqc cosign` hängt die Dilithium-5-Kosignatur an eine Transaktion an (nach `qorechaind tx pqc gen-key`). Siehe [Transaktionsbefehle](/cli-reference/transaction-commands).
* **Das QoreChain SDK** — `buildHybridTx` (mit `includePqcPublicKey`) leistet das Äquivalent in TypeScript/Python/Go/Rust. Siehe [SDK-Konten & PQC-Signierung](/sdk/concepts/accounts-pqc).
* **`qorechain-pqc` direkt** — verwenden Sie `hybridSignBytes` zum Framing der Sign-Bytes und `mldsa.sign` zur Erzeugung der Dilithium-5-Signatur, wenn Sie Tooling außerhalb des SDK in einer der sechs unterstützten Sprachen bauen.

## Optimierung des On-Chain-Fußabdrucks

ML-DSA-Schlüssel und -Signaturen sind nach klassischen Maßstäben groß. Da die Bytes eines Standards festgelegt sind, hält man den On-Chain-Fußabdruck klein, indem man diese drei Hebel nutzt — keiner davon verändert den Standard:

1. **Wählen Sie die Sicherheitsstufe bewusst.** ML-DSA-65-(L3-)Signaturen sind ~28 % kleiner als ML-DSA-87 (L5) und bleiben sehr stark; ML-KEM-768-Ciphertexte sind kleiner als bei 1024. Wählen Sie je nach Anwendungsfall.
2. **Pay-to-Pubkey-Hash.** Speichern Sie nur `pubkeyHash(pk)` (20–32 Bytes SHAKE-256) im Kontozustand und verlangen Sie den vollständigen öffentlichen Schlüssel in der Transaktion. Der Kontozustand bleibt unabhängig von der Schlüsselgröße winzig.
3. **Signaturen verifizieren und verwerfen.** Eine Signatur muss in der Transaktion (Blockdaten) enthalten sein, sollte aber niemals in den persistenten State-Tree geschrieben werden.

> **Warum kein Falcon?** FN-DSA (Falcon) würde kleinere Signaturen liefern, ist aber bewusst **ausgeschlossen**: FN-DSA ist ein FIPS-206-*Entwurf* (nicht final), und eine ausschließlich auf Standards basierende Bibliothek liefert nur finalisierte Standards aus. Das kann erneut geprüft werden, sobald FIPS-206 finalisiert ist.

## Verwandte Themen

* [Post-Quanten-Sicherheit](/architecture/post-quantum-security) — wie die Chain diese Primitiven nutzt und Hybrid-Signaturen durchsetzt.
* [Transaktionsbefehle](/cli-reference/transaction-commands) — der CLI-Ablauf `tx pqc gen-key` / `tx pqc cosign`.
* [SDK-Konten & PQC-Signierung](/sdk/concepts/accounts-pqc) — Schlüssel und Hybrid-Signierung aus dem QoreChain SDK.
* [Wallet-Einrichtung](/getting-started/wallet-setup) — PQC-gestützte Konten erstellen und verwalten.
