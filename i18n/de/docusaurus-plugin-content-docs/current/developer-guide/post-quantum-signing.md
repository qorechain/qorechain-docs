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
| Java | `io.github.qorechain:qorechain-pqc` (Maven Central) | `io.github.qorechain:qorechain-pqc:0.2.1` | [Bouncy Castle](https://www.bouncycastle.org/) |

:::info Verfügbarkeit
Die Bindings für JavaScript, Rust, Python, Go und Java sind alle in Version **0.2.1** **veröffentlicht** — installieren Sie sie direkt von npm, crates.io, PyPI, dem Go-Modul-Proxy und Maven Central mit den obigen Befehlen. Die Python-Distribution wird als `qorechain-pqc` installiert, **importiert aber als `qorpqc`**. Das **Java**-Paket ist auf Maven Central als `io.github.qorechain:qorechain-pqc:0.2.1` verfügbar (Bouncy-Castle-Backend). Version **0.2.0** brachte das versionsbewusste `hybridSignBytes` (unten), und **0.2.1** korrigierte, welcher Upgrade-Name den Wechsel zu v2 für das Mainnet markiert; verwenden Sie daher 0.2.1 oder neuer. Das **C**-Binding ist eine statische Bibliothek + Header, die Sie aus [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) selbst bauen.
:::

## Deterministische Signierung (Standard) {#deterministic-signing}

Seit Version **0.1.1** (und in jedem späteren Release) erzeugt `sign()` in **allen sechs Bindings** die **deterministische** ML-DSA-Variante (FIPS-204 §3.4, bei der die Signier-Zufälligkeit aus 32 Null-Bytes besteht). Die Chain akzeptiert jede gültige FIPS-204-ML-DSA-87-Signatur, ob hedged oder deterministisch: Die Verifikation ist für beide identisch, und ohne den geheimen Schlüssel kann ein Verifizierer sie nicht unterscheiden. Die Bindings signieren standardmäßig deterministisch, damit dieselbe Transaktion immer dieselbe Signatur und denselben Tx-Hash ergibt und jedes Binding die gemeinsamen Testvektoren trifft.

Kernfakten:

* Die deterministische Ausgabe ist für denselben Schlüssel und dieselbe Nachricht **byte-identisch über alle sechs Bindings**, festgeschrieben durch gemeinsame sprachübergreifende Testvektoren.
* Hedged Signierung bleibt als **explizites Opt-in** pro Binding verfügbar (z. B. `{hedged: true}` in JavaScript, `sign_hedged` in Rust, `mldsaSignHedged` in Java, `sign(..., hedged=True)` in Python). Hedged Signaturen werden **von der Chain akzeptiert** wie jede gültige FIPS-204-Signatur; der einzige Unterschied ist, dass sich die Signatur und damit der Tx-Hash bei jedem Signieren ändert.
* Version 0.1.0 des JavaScript-Bindings signierte standardmäßig hedged. Auch diese Signaturen sind on-chain gültig; aktualisieren Sie auf 0.1.1, wenn Sie reproduzierbare Signaturen wollen, die den gemeinsamen Vektoren entsprechen.

## Schlüssel registrieren {#pqc-key-registration}

Jedes Konto registriert seinen öffentlichen ML-DSA-87-Schlüssel **einmalig und explizit**. Es gibt keine automatische Registrierung: Ein öffentlicher Schlüssel, der in einer späteren hybriden Transaktion eingebettet ist (zum Beispiel über die SDK-Option `includePqcPublicKey`), wird in der Erweiterung mitgeführt, registriert ihn aber **nicht**. Die Registrierung ist die eine Cosmos-Lane-Transaktion, die klassisch signiert werden darf, damit ein brandneues Konto seinen ersten Schlüssel bootstrappen kann. Führen Sie sie mit dem Release-`qorechaind` aus (ein aus dem öffentlichen Quellcode gebautes Binary kann nicht signieren; siehe [Aus dem Quellcode bauen](/developer-guide/building-from-source)), mit QoreX oder mit `ensurePqcRegistered` des SDK:

```bash
# 1. Create a key. It is stored unencrypted under ~/.qorechaind/pqc/mypqc.dilithium (mode 0600) and the public key hex is printed.
qorechaind tx pqc gen-key mypqc

# 2. Register the public key on your account (classical-signed).
qorechaind tx pqc register-key-v2 dilithium5 <printed-pubkey-hex> hybrid \
  --from mykey --chain-id qorechain-vladi --gas 600000 --fees 60000uqor -y

# 3. Verify.
qorechaind query pqc account <address>
```

Setzen Sie `--gas` explizit: Der 2.592 Byte große öffentliche Schlüssel kann die standardmäßigen 200.000 Gas überschreiten (Mainnet-Registrierungen haben etwa 220.000 bis 350.000 verbraucht), und die Gebühr muss mindestens Gas × 0,1 uqor betragen, sodass `--gas 600000` mindestens `--fees 60000uqor` erfordert. Die alte Form `qorechaind tx pqc register-key <pubkey-hex> hybrid` ist für Dilithium-5 gleichwertig. Danach bauen Sie jede Cosmos-Lane-Transaktion mit `--generate-only` und signieren sie mit `qorechaind tx pqc cosign`. Die Schlüsseldatei ist der Post-Quanten-Signierschlüssel des Kontos: Wer sie lesen kann, kann zusammen mit dem klassischen Schlüssel für das Konto kosignieren; sichern Sie sie daher wie die Mnemonic (sie lässt sich aus der Mnemonic neu ableiten, siehe unten).

Ein registrierter Schlüssel ist außerdem die erste von zwei Voraussetzungen für das Senden von EVM-Transaktionen; die zweite ist ein offenes [EVM-Autorisierungsfenster](/developer-guide/evm-development#evm-window).

## Fehlerbehebung für `pqc`-Code 21 (`hybrid_verify_failed`) {#code-21}

Code 21 bedeutet, dass die ML-DSA-87-Hälfte einer hybriden Signatur nicht gegen den registrierten Schlüssel des Kontos verifiziert wurde. Die Wahl zwischen hedged und deterministischer Signierung ist **nie** die Ursache. Prüfen Sie in dieser Reihenfolge:

1. **Sign-Bytes-Version.** Die PQC-Signatur deckt entweder die v1- oder die v2-Sign-Bytes ab, und ein Netzwerk verifiziert zu jeder Höhe genau eine Form: `qorechain-diana` wechselte mit seinem Upgrade `v3.1.98` zu v2, `qorechain-vladi` mit seinem Upgrade `v3.2.0`, und später gestartete Chains sind ab Genesis v2. Aktuelle SDKs wählen die Form pro Netzwerk; selbst gebaute Signer müssen den Node fragen, welches Upgrade angewendet ist (siehe [Konten & PQC-Signierung](/sdk/concepts/accounts-pqc)).
2. **Chain-ID in v2-Sign-Bytes.** v2 bindet die Chain-ID, daher verifiziert eine für `qorechain-diana` erstellte Signatur nicht auf `qorechain-vladi` und umgekehrt.
3. **Veraltete PQC-Bibliothek.** Builds aus der Zeit vor dem Standard (vor FIPS-204) erzeugen Signaturen, die ein standardkonformer Verifizierer ablehnt. Verwenden Sie `qorechain-pqc` 0.1.1 oder neuer.
4. **Falscher Schlüssel.** Der öffentliche Schlüssel muss der für das Konto registrierte sein (`GET /qorechain/pqc/v1/account/{address}`). Ein mit einer anderen Ableitung erzeugter Schlüssel (zum Beispiel die alte Bridge-Ableitung `shake256(mnemonic)` statt der adressgebundenen) signiert gültig, passt aber nicht. Siehe [Schlüsselrotation](#key-rotation), um auf den kanonischen Schlüssel zu wechseln.

## Deterministische Schlüsselableitung & Wiederherstellung {#key-derivation}

Die im Ökosystem standardisierte Ableitung bindet den ML-DSA-87-Schlüssel an das Konto, sodass er **allein aus der Mnemonic des Kontos wiederherstellbar** ist:

```
seed = SHAKE-256("qorechain:pqc:v1|" + cosmosAddress + "|" + mnemonic)
(publicKey, secretKey) = mldsa.keygen(seed)
```

Jedes veröffentlichte Tool (`@qorechain/wallet-adapter`, `@qorechain/sdk`, `@qorechain/chain-bridge` ≥0.1.1) leitet denselben Schlüssel ab, sodass eine Mnemonic unabhängig vom Tooling einen Schlüssel erzeugt. Schlüssel auf der CLI wiederherstellen (Mnemonic über stdin):

```bash
# the mnemonic is read from stdin; keep it out of shell history by redirecting from a file you delete afterwards
qorechaind tx pqc recover-key mykey qor1youraddress... < mnemonic.txt
# legacy tooling derivation (shake256(mnemonic) only, unbound to the address):
qorechaind tx pqc recover-key mykey qor1youraddress... --derivation bridge < mnemonic.txt
```

Der wiederhergestellte private Schlüssel wird als unverschlüsselter Hex-Wert (Modus 0600) nach `<home>/pqc/mykey.dilithium` geschrieben, zur Verwendung mit `tx pqc cosign`.

## Schlüsselrotation (gleicher Algorithmus) {#key-rotation}

Seit Chain-Version **v3.1.85** rotiert **`MsgRotatePQCKey`** den ML-DSA-87-Schlüssel eines Kontos **innerhalb desselben Algorithmus** — zuvor war die Registrierung einmalig und `MigratePQCKey` wechselte nur zwischen Algorithmen. Nutzen Sie die Rotation, um einen legacy-abgeleiteten Schlüssel auf die kanonische adressgebundene Ableitung zu migrieren oder um einen kompromittierten Schlüssel stillzulegen.

Die Rotation ist **doppelt signiert**: Sowohl der alte als auch der neue Schlüssel signieren die domänenseparierte Nachricht `"qorechain-pqc-rotate-v1|chainId|algorithm|account|oldPubHex|newPubHex"`. Replay ist strukturell unmöglich — nach der Rotation stimmt der alte Schlüssel nicht mehr mit dem registrierten Schlüssel überein, sodass dieselbe Nachricht nicht erneut angewendet werden kann. Die Rotation ist eine Operation, die **nur mit dem Root-Schlüssel** möglich ist (niemals an einen [Authenticator](/developer-guide/account-abstraction#authenticators) delegierbar), und die Transaktion selbst wird weiterhin hybrid mit dem *alten* Schlüssel signiert, was den aktuellen Besitz nachweist.

One-Shot-CLI (Mnemonic über stdin; stellt den alten Schlüssel wieder her, leitet den neuen ab oder generiert ihn, signiert doppelt, sendet):

```bash
# migrate a legacy-derived key to the canonical derivation (mnemonic on stdin):
qorechaind tx pqc rotate-key --old-derivation bridge --new-derivation adapter \
  --from mykey --chain-id qorechain-vladi --gas 600000 --fees 60000uqor -o json -y < mnemonic.txt

# rotate to a brand-new random key (compromise recovery); --new-key-out is required and is written before anything is sent:
qorechaind tx pqc rotate-key --old-derivation adapter --new-random --new-key-out mykey-new \
  --from mykey --chain-id qorechain-vladi --gas 600000 --fees 60000uqor -o json -y < mnemonic.txt
```

Die Rotation trägt zwei 2.592 Byte große Schlüssel und drei Signaturen und benötigt daher deutlich mehr Gas als eine Überweisung; behalten Sie das explizite `--gas 600000` und eine Gebühr von mindestens 60.000 uqor bei. `--new-random` ohne `--new-key-out` wird abgelehnt (Node-Release v3.2.1 und später), damit eine Rotation Sie nie ohne den neuen Schlüssel zurücklassen kann.

Im Code stellen `@qorechain/wallet-adapter` (≥0.1.7) und `@qorechain/sdk` (≥0.7.0) denselben Ablauf bereit (synchron; er liefert die Nachricht samt beider Schlüsselpaare zurück):

```js
import { rotatePqcKeyMsgFromMnemonic } from "@qorechain/wallet-adapter";

// Builds the dual-signed MsgRotatePQCKey migrating shake256(mnemonic) -> canonical:
const { msg, oldKeypair, newKeypair } = rotatePqcKeyMsgFromMnemonic({
  account: "qor1youraddress...", mnemonic, chainId: "qorechain-vladi",
});
// Sign & broadcast `msg` with the account's normal hybrid signer, using `oldKeypair` for the envelope's PQC signature.
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

### `hybridSignBytes(version, chainId, bodyWithoutPqcExt, authInfo)`

QoreChains Wallet-kompatibles **Hybrid-Extension-Sign-Bytes-Framing**. Dies erzeugt exakt die Bytes, die mit ML-DSA-87 (Dilithium-5) signiert werden müssen, um die PQC-Hälfte einer hybriden Transaktion zu bilden. Es gibt zwei Formen, und ein Netzwerk verifiziert zu jeder Höhe genau eine: **v1** = `BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A` und **v2** = `"qorechain-pqc-hybrid-v2" ‖ BE64(len chainId) ‖ chainId ‖ BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A` (`B0` ist der Transaktionskörper ohne die PQC-Erweiterung, `A` die Auth-Info). Beide öffentlichen Netzwerke sind auf **v2**. Die Bibliothek ist rein (pure), daher wählt der Aufrufer die Form: Fragen Sie den Node mit `GET /cosmos/upgrade/v1beta1/applied_plan/{name}` nach **beiden** `v3.2.0` (dem Upgrade-Namen des Mainnets) und `v3.1.98` (dem früheren Namen des Testnets) und verwenden Sie v2, wenn eine der Höhen größer als 0 ist; `signBytesVersionForApplied` und `signBytesVersionFor(chainId, height)` setzen diese Regel um (verwenden Sie `@qorechain/pqc` 0.2.1 oder neuer; die Form mit 2 Argumenten aus 0.1.x wirft einen Fehler).

Dies ist das Element, das Wallets und Integratoren verwenden, um die **erforderliche hybride Signatur** auf dem Cosmos-Transaktionspfad zu erzeugen. Ab der aktuellen Chain-Version sind hybride Signaturen **standardmäßig erforderlich** (`hybrid_signature_mode = required`, `allow_classical_fallback = false`): Jede Transaktion auf dem Cosmos-Pfad muss neben ihrer klassischen secp256k1-Signatur eine Dilithium-5-Signatur tragen. Siehe [Post-Quanten-Sicherheit](/architecture/post-quantum-security) für das Durchsetzungsmodell.

Die klassische secp256k1-Signatur wird über die standardmäßigen Sign-Bytes berechnet (die die PQC-Erweiterung **ausschließen**), und die ML-DSA-87-Signatur wird berechnet und als `PQCHybridSignature`-Erweiterung angehängt. Da die klassischen Sign-Bytes die Erweiterung ausschließen, bleibt die klassische Signatur gültig, unabhängig davon, ob ein Verifizierer den PQC-Teil versteht oder nicht.

Es gibt drei Wege, diese hybride Signatur zu erzeugen:

* **Die CLI** — `qorechaind tx pqc cosign` hängt die Dilithium-5-Kosignatur an eine Transaktion an und sendet sie (nach `qorechaind tx pqc gen-key` und der Registrierung des Schlüssels). Sie ist nur Teil des Release-Binaries. Siehe [Transaktionsbefehle](/cli-reference/transaction-commands).
* **Das QoreChain SDK** — `buildHybridTx` / `signAndBroadcastHybrid` (übergeben Sie `rest`, damit die Form der Sign-Bytes aufgelöst wird) erledigen das Äquivalent in TypeScript, Python, Go, Rust und Java; registrieren Sie zuerst Ihren Schlüssel (siehe oben). Siehe [SDK-Konten & PQC-Signierung](/sdk/concepts/accounts-pqc).
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
