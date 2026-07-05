---
slug: /developer-guide/post-quantum-signing
title: Post-Quanten-Signierung
sidebar_label: Post-Quanten-Signierung
sidebar_position: 8
---

# Post-Quanten-Signierung

`qorechain-pqc` ist die quelloffene, **ausschließlich standardbasierte** Post-Quanten-Kryptographie-Bibliothek hinter QoreChain. Sie stellt Wallets, Integratoren und Tooling exakt die Primitiven bereit, die die Chain verwendet — in sechs Sprachen, mit einer konsistenten API, **nachweislich byte-kompatibel** dank einer gemeinsamen sprachübergreifenden Testvektor-Suite.

Die Bibliothek kapselt auditierte Implementierungen der **finalen NIST-Standards**. Sie erfindet **kein** eigenes Verfahren: Eine nicht-standardkonforme Variante ist genau das, was Interoperabilität zerstört (eine an einer Stelle erzeugte Signatur würde an anderer Stelle nicht verifizieren). Jedes Binding wird gegen dieselben Vektoren validiert, sodass eine in einer Sprache erzeugte ML-DSA-Signatur in jeder anderen verifiziert, ML-KEM-Shared-Secrets über alle sechs Sprachen übereinstimmen und SHAKE-256-Digests identisch sind.

* **Repository:** [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc)
* **Lizenz:** Apache-2.0

## Primitiven

| Primitive | Standard | Rolle | Stufen (Standard in **fett**) |
| --- | --- | --- | --- |
| **ML-DSA** | FIPS-204 | digitale Signaturen | 44 · 65 · **87** |
| **ML-KEM** | FIPS-203 | Schlüsselkapselung | 512 · 768 · **1024** |
| **SHAKE-256** | FIPS-202 | Hash mit erweiterbarer Ausgabe | — |

Dies sind dieselben Primitiven, die QoreChain auf Protokollebene einsetzt: **ML-DSA-87 (Dilithium-5)**-Signaturen, **ML-KEM-1024**-Schlüsselkapselung und **SHAKE-256** als Standard-Anwendungshash. Siehe [Post-Quanten-Sicherheit](/architecture/post-quantum-security) dazu, wie die Chain sie verwendet.

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

> Man kann einen NIST-Standard nicht verkleinern und dabei standardkonform bleiben. ML-DSA-87 hat feste Schlüssel-/Signaturgrößen und feste Bytes — eine „Optimierung" erzeugt eine nicht-standardkonforme Variante, die keine andere Implementierung verifizieren kann. Um den On-Chain-Fußabdruck zu verringern, nutzen Sie die unten aufgeführten Hebel, statt das Verfahren zu verändern.

## Sprachen und Pakete

Jede Sprache stellt dieselbe API bereit, jeweils gestützt auf eine andere auditierte Implementierung. Genau das garantiert Byte-Kompatibilität — unabhängige Backends stimmen im Standard überein.

| Sprache | Paket | Installation | Gestützt auf |
| --- | --- | --- | --- |
| JavaScript / TypeScript | `@qorechain/pqc` (npm) | `npm i @qorechain/pqc` | [@noble/post-quantum](https://github.com/paulmillr/noble-post-quantum) |
| Rust | `qorechain-pqc` (crates.io) | `cargo add qorechain-pqc` | `fips204` · `fips203` · `sha3` |
| Python | `qorechain-pqc` (PyPI) | `pip install qorechain-pqc` (Import `qorpqc`) | [liboqs-python](https://github.com/open-quantum-safe/liboqs-python) |
| Go | `github.com/qorechain/qorechain-pqc/go` | `go get github.com/qorechain/qorechain-pqc/go` | [Cloudflare CIRCL](https://github.com/cloudflare/circl) |
| C | `c/` (statische Bibliothek + Header) | Build aus dem [Repo](https://github.com/qorechain/qorechain-pqc) | [liboqs](https://github.com/open-quantum-safe/liboqs) + OpenSSL |
| Java | `io.github.qorechain:qorechain-pqc` (Maven Central) | `io.github.qorechain:qorechain-pqc:0.1.1` | [Bouncy Castle](https://www.bouncycastle.org/) |

:::info Verfügbarkeit
Die Bindings für JavaScript, Rust, Python, Go und Java sind alle in Version **0.1.1** **veröffentlicht** — installieren Sie sie direkt von npm, crates.io, PyPI, dem Go-Modul-Proxy und Maven Central mit den obigen Befehlen. Die Python-Distribution wird als `qorechain-pqc` installiert, **importiert aber als `qorpqc`**. Das **Java**-Paket ist auf Maven Central als `io.github.qorechain:qorechain-pqc:0.1.1` verfügbar (Bouncy-Castle-Backend). Das **C**-Binding ist eine statische Bibliothek + Header, die Sie aus [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) selbst bauen.
:::

## Deterministische Signierung (konsenskritisch) {#deterministic-signing}

Seit Version **0.1.1** erzeugt `sign()` die **deterministische** ML-DSA-Variante (FIPS-204 §3.4, bei der die Signier-Zufälligkeit aus 32 Null-Bytes besteht) in **allen sechs Bindings** — und dies ist die einzige Variante, die die Chain akzeptiert. Der Transaktionsverifizierer von QoreChain **lehnt hedged (randomisierte) ML-DSA-Signaturen ab**, sodass eine hedged Signatur on-chain fehlschlägt, obwohl sie kryptographisch verifiziert.

Kernfakten:

* **Ändern Sie den Standard nicht.** Deterministische Signierung ist konsenskritisch; jedes Binding dokumentiert sie entsprechend.
* Die deterministische Ausgabe ist für denselben Schlüssel und dieselbe Nachricht **byte-identisch über alle sechs Bindings** — festgeschrieben durch gemeinsame sprachübergreifende Testvektoren.
* Hedged Signierung bleibt als **explizites Opt-in** pro Binding verfügbar (z. B. `{hedged: true}` in JavaScript, `sign_hedged` in Rust, `mldsaSignHedged` in Java, `sign(..., hedged=True)` in Python) für Anwendungsfälle außerhalb der Chain — hedged Signaturen werden **von der Chain nicht akzeptiert**.
* Version 0.1.0 des JavaScript-Bindings signierte standardmäßig hedged — wenn Sie Transaktions-Tooling gegen 0.1.0 gebaut haben, **aktualisieren Sie auf 0.1.1**; mit dem alten Standard signierte Transaktionen werden on-chain abgelehnt.

## Deterministische Schlüsselableitung & Wiederherstellung {#key-derivation}

Die im Ökosystem standardisierte Ableitung bindet den ML-DSA-87-Schlüssel an das Konto, sodass er **allein aus der Mnemonic des Kontos wiederherstellbar** ist:

```
seed = SHAKE-256("qorechain:pqc:v1|" + cosmosAddress + "|" + mnemonic)
(publicKey, secretKey) = mldsa.keygen(seed)
```

Jedes veröffentlichte Tool (`@qorechain/wallet-adapter`, `@qorechain/sdk`, `@qorechain/chain-bridge` ≥0.1.1) leitet denselben Schlüssel ab, sodass eine Mnemonic unabhängig vom Tooling einen Schlüssel erzeugt. Schlüssel auf der CLI wiederherstellen (Mnemonic über stdin):

```bash
qorechaind tx pqc recover-key mykey qor1youraddress...
# legacy tooling derivation (shake256(mnemonic) only, unbound to the address):
qorechaind tx pqc recover-key mykey qor1youraddress... --derivation bridge
```

## Schlüsselrotation (gleicher Algorithmus) {#key-rotation}

Seit Chain-Version **v3.1.85** rotiert **`MsgRotatePQCKey`** den ML-DSA-87-Schlüssel eines Kontos **innerhalb desselben Algorithmus** — zuvor war die Registrierung einmalig und `MigratePQCKey` wechselte nur zwischen Algorithmen. Nutzen Sie die Rotation, um einen legacy-abgeleiteten Schlüssel auf die kanonische adressgebundene Ableitung zu migrieren oder um einen kompromittierten Schlüssel stillzulegen.

Die Rotation ist **doppelt signiert**: Sowohl der alte als auch der neue Schlüssel signieren die domänenseparierte Nachricht `"qorechain-pqc-rotate-v1|chainId|algorithm|account|oldPubHex|newPubHex"`. Replay ist strukturell unmöglich — nach der Rotation stimmt der alte Schlüssel nicht mehr mit dem registrierten Schlüssel überein, sodass dieselbe Nachricht nicht erneut angewendet werden kann. Die Rotation ist eine Operation, die **nur mit dem Root-Schlüssel** möglich ist (niemals an einen [Authenticator](/developer-guide/account-abstraction#authenticators) delegierbar), und die Transaktion selbst wird weiterhin hybrid mit dem *alten* Schlüssel signiert, was den aktuellen Besitz nachweist.

One-Shot-CLI (Mnemonic über stdin; stellt den alten Schlüssel wieder her, leitet den neuen ab oder generiert ihn, signiert doppelt, sendet):

```bash
# migrate a legacy-derived key to the canonical derivation:
qorechaind tx pqc rotate-key --old-derivation bridge --new-derivation adapter \
  --from mykey --chain-id qorechain-vladi -o json -y

# rotate to a brand-new random key (compromise recovery):
qorechaind tx pqc rotate-key --old-derivation adapter --new-random \
  --from mykey --chain-id qorechain-vladi -o json -y
```

Im Code stellen `@qorechain/wallet-adapter` (≥0.1.7) und `@qorechain/sdk` (≥0.7.0) denselben Ablauf bereit:

```js
import { rotatePqcKeyMsgFromMnemonic } from "@qorechain/wallet-adapter";

// Builds the dual-signed MsgRotatePQCKey migrating shake256(mnemonic) -> canonical:
const msg = await rotatePqcKeyMsgFromMnemonic({
  mnemonic, address: "qor1youraddress...", chainId: "qorechain-vladi",
});
// Sign & broadcast with the account's normal hybrid signer (old key cosigns the envelope).
```

Nach einer erfolgreichen Rotation signiert der neue Schlüssel (Code 0) und der alte Schlüssel wird abgelehnt (`pqc`-Code 21).

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

Stufenspezifische Exporte stehen bereit, wo der Standard nicht das Gewünschte ist: `mldsa44/65/87` und `mlkem512/768/1024` (`mldsa` / `mlkem` sind die L5-Standards).

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

Ein **Pay-to-Pubkey-Hash**-Registrierungshelfer. Er erzeugt einen kurzen (20–32 Byte) SHAKE-256-Hash eines öffentlichen Schlüssels. Das Muster: Nur den `pubkeyHash` im Kontostatus speichern und den vollständigen öffentlichen Schlüssel in der Transaktion verlangen. Der Kontostatus bleibt winzig, unabhängig vom 1–2,5 KB großen Schlüssel.

### `hybridSignBytes(bodyWithoutPqcExt, authInfo)`

QoreChains Wallet-kompatibles **Hybrid-Extension-Sign-Bytes-Framing**. Dies erzeugt exakt die Bytes, die mit ML-DSA-87 (Dilithium-5) signiert werden müssen, um die PQC-Hälfte einer hybriden Transaktion zu bilden.

Dies ist das Element, das Wallets und Integratoren verwenden, um die **erforderliche hybride Signatur** auf dem Cosmos-Transaktionspfad zu erzeugen. Ab der aktuellen Chain-Version sind hybride Signaturen **standardmäßig erforderlich** (`hybrid_signature_mode = required`, `allow_classical_fallback = false`): Jede Transaktion auf dem Cosmos-Pfad muss neben ihrer klassischen secp256k1-Signatur eine Dilithium-5-Signatur tragen. Siehe [Post-Quanten-Sicherheit](/architecture/post-quantum-security) für das Durchsetzungsmodell.

Die klassische secp256k1-Signatur wird über die standardmäßigen Sign-Bytes berechnet (die die PQC-Erweiterung **ausschließen**), und die ML-DSA-87-Signatur wird berechnet und als `PQCHybridSignature`-Erweiterung angehängt. Da die klassischen Sign-Bytes die Erweiterung ausschließen, bleibt die klassische Signatur gültig, unabhängig davon, ob ein Verifizierer den PQC-Teil versteht oder nicht.

Es gibt drei Wege, diese hybride Signatur zu erzeugen:

* **Die CLI** — `qorechaind tx pqc cosign` hängt die Dilithium-5-Kosignatur an eine Transaktion an (nach `qorechaind tx pqc gen-key`). Siehe [Transaktionsbefehle](/cli-reference/transaction-commands).
* **Das QoreChain SDK** — `buildHybridTx` (mit `includePqcPublicKey`) erledigt das Äquivalent in TypeScript/Python/Go/Rust. Siehe [SDK-Konten & PQC-Signierung](/sdk/concepts/accounts-pqc).
* **`qorechain-pqc` direkt** — verwenden Sie `hybridSignBytes`, um die Sign-Bytes zu rahmen, und `mldsa.sign`, um die Dilithium-5-Signatur zu erzeugen, wenn Sie Tooling außerhalb des SDK in einer der sechs unterstützten Sprachen bauen.

## Optimierung des On-Chain-Fußabdrucks

ML-DSA-Schlüssel und -Signaturen sind nach klassischen Maßstäben groß. Da die Bytes eines Standards fest sind, hält man den On-Chain-Fußabdruck klein, indem man diese drei Hebel nutzt — keiner davon verändert den Standard:

1. **Wählen Sie die Sicherheitsstufe bewusst.** ML-DSA-65 (L3)-Signaturen sind ~28 % kleiner als ML-DSA-87 (L5) und bleiben sehr stark; ML-KEM-768-Chiffretexte sind kleiner als bei 1024. Wählen Sie je nach Anwendungsfall.
2. **Pay-to-Pubkey-Hash.** Speichern Sie nur `pubkeyHash(pk)` (20–32 Bytes SHAKE-256) im Kontostatus und verlangen Sie den vollständigen öffentlichen Schlüssel in der Transaktion. Der Kontostatus bleibt winzig, unabhängig von der Schlüsselgröße.
3. **Signaturen verifizieren und verwerfen.** Eine Signatur muss in der Transaktion (Blockdaten) enthalten sein, sollte aber niemals in den persistenten Statusbaum geschrieben werden.

> **Warum kein Falcon?** FN-DSA (Falcon) würde kleinere Signaturen liefern, ist aber bewusst **ausgeschlossen**: FN-DSA ist FIPS-206-*Entwurf* (nicht final), und eine ausschließlich standardbasierte Bibliothek liefert nur finalisierte Standards aus. Das kann erneut geprüft werden, sobald FIPS-206 finalisiert ist.

## Verwandte Themen

* [Post-Quanten-Sicherheit](/architecture/post-quantum-security) — wie die Chain diese Primitiven verwendet und hybride Signaturen durchsetzt.
* [Transaktionsbefehle](/cli-reference/transaction-commands) — der CLI-Ablauf `tx pqc gen-key` / `tx pqc cosign`.
* [SDK-Konten & PQC-Signierung](/sdk/concepts/accounts-pqc) — Schlüssel und hybride Signierung mit dem QoreChain SDK.
* [Wallet-Einrichtung](/getting-started/wallet-setup) — PQC-gestützte Konten erstellen und verwalten.
