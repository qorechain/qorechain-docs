---
slug: /build-before-qday/workshop-1/apps/rust-qday-pay
title: Rust-App, qday-pay
sidebar_label: Rust, qday-pay
sidebar_position: 4
---

# Rust-App: qday-pay

**qday-pay** ist ein kleines Rust-Kommandozeilenwerkzeug, das auf dem QoreChain-Testnet (`qorechain-diana`, EVM-Chain-ID 9800) mit einer **hybriden Signatur** in QOR bezahlt: einer klassischen secp256k1-Signatur und einer Post-Quanten-Signatur ML-DSA-87 (FIPS 204) auf derselben Transaktion. Nach dem Senden liest es die Transaktion von der Chain zurück und zeigt, ob die Chain beide Hälften verifiziert hat.

## Was es zeigt {#what-it-shows}

- **Hybride Signierung mit ML-DSA-87 + secp256k1** aus Rust, mit dem veröffentlichten Crate und ohne zusätzliche Werkzeuge.
- **Eine hybrid signierte Transaktion, On-Chain verifiziert**: Die Chain gibt ein Ereignis `pqc_hybrid_verify` mit `status=verified` aus, und der Transaktions-Body trägt neben der 64 Bytes langen secp256k1-Signatur eine 4627 Bytes lange ML-DSA-87-Signatur.
- **Eine Wiederherstellungsphrase, zwei Schlüssel**: Der ML-DSA-87-Schlüssel wird aus derselben Mnemonic wie der klassische Schlüssel abgeleitet und an Ihre Adresse gebunden.

Warum das wichtig ist: Ein künftiger Quantencomputer wird voraussichtlich secp256k1-Signaturen brechen. Eine Transaktion, die zusätzlich eine ML-DSA-87-Signatur trägt, bleibt geschützt. Siehe [Quantum-Safe Transactions](/sdk/guides/quantum-safe).

## Schritt für Schritt {#run}

### 1. Die Werkzeuge installieren

Sie brauchen Git und eine aktuelle stabile Rust-Toolchain mit `cargo`.

- Git: https://git-scm.com/downloads
- Rust: Installation mit rustup von https://rustup.rs

Prüfen Sie die Versionen:

```bash
git --version
rustc --version
cargo --version
```

### 2. Den Code holen

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/04-rust-qday-pay
```

### 3. Bauen

```bash
cargo build --release
```

Der erste Build lädt die Abhängigkeiten herunter und kompiliert sie, das dauert einige Minuten. Er endet mit `Finished` im Profil `release`. Wenn Sie das Werkzeug ohne Argumente starten, gibt es die Liste der Befehle aus:

```bash
cargo run --release
```

### 4. Ein Wegwerf-Testnet-Konto erstellen

```bash
cargo run --release -- new
```

`new` erzeugt eine Wiederherstellungsphrase und speichert sie in einer Schlüsseldatei mit Modus 0600. Die Phrase wird nie ausgegeben. Die Schlüsseldatei liegt standardmäßig unter `~/.config/qday/rust.env`; setzen Sie `QDAY_KEY_FILE`, um einen anderen Pfad zu verwenden. Eine vorhandene Datei wird nicht überschrieben. Dies ist ein reines Testnet-Konto: Verwenden Sie hier nie eine echte Wallet, geben Sie die Schlüsseldatei nie weiter, committen Sie sie nie und verwenden Sie sie nie im Mainnet. Der Befehl gibt Ihre Adresse `qor1...` aus.

### 5. Test-QOR vom Faucet holen

1. Öffnen Sie https://dashboard.qorechain.io/faucet und melden Sie sich an.
2. Fügen Sie Ihre Adresse `qor1...` ein und fordern Sie an. Ein Abruf zahlt 100 QOR aus, einmal alle 24 Stunden pro Konto und pro Adresse.

Das Konto muss on-chain existieren, bevor Sie den nächsten Schritt ausführen, weil die Registrierung eine Gebühr kostet.

### 6. Das Konto prüfen

```bash
cargo run --release -- status                  # address, balance, PQC key, latest block
```

### 7. Den ML-DSA-87-Schlüssel registrieren

```bash
cargo run --release -- register                # register the ML-DSA-87 key (once, idempotent)
```

Die Registrierungstransaktion wird klassisch signiert, weil ein Schlüssel seine eigene Registrierung nicht mitsignieren kann. Ein erneuter Aufruf bewirkt nichts.

### 8. Eine hybrid signierte Zahlung senden

```bash
cargo run --release -- send qor1... 1 --memo "Build Before Q-Day Workshop 1 (Rust)"
```

Ersetzen Sie `qor1...` durch eine beliebige Testnet-Adresse (zum Beispiel ein zweites Wegwerf-Konto). Der Betrag ist in QOR angegeben. `send` zahlt den Betrag und führt danach die Verifizierung aus.

### 9. Eine beliebige Transaktion verifizieren

```bash
cargo run --release -- verify <TX_HASH>        # the verification report for any transaction
```

Das Werkzeug ist nur für das Testnet gedacht: Es verwendet die SDK-Voreinstellung `testnet` und weigert sich, gegen eine andere Chain-ID zu laufen.

## Das Konto {#account}

Das Konto ist ein QoreChain-Native-Konto mit secp256k1, Coin-Typ 118 (`m/44'/118'/0'/0/0`) und einer Adresse `qor1...`. Der ML-DSA-87-Schlüssel stammt aus derselben Mnemonic nach der kanonischen, an die Adresse gebundenen Regel des SDK. Eine Mnemonic stellt beide Schlüssel wieder her.

```rust
let classical = derive_native_account(mnemonic, 0)?;
let pqc = try_derive_pqc_canonical(&classical.address, mnemonic)?;
```

## Der SDK-Code, auf den es ankommt {#code}

Dies ist der Kern des Befehls `send`, gekürzt:

```rust
// The payment: a plain bank MsgSend.
let send = bank_send_any(w.address(), to, vec![coin(&uqor)]);
// Which hybrid sign-bytes form this network verifies (asked once, cached).
let version = SignBytesResolver::new()
    .resolve(SignBytesMode::Auto, &net.chain_id, Some(&net.rest_url)).await?;

let mut params = BuildHybridTxParams {
    private_key: w.classical.private_key.clone(), // secp256k1 half
    public_key: w.classical.public_key.clone(),
    pqc_secret_key: w.pqc.secret_key.clone(),     // ML-DSA-87 half
    pqc_public_key: w.pqc.public_key.clone(),
    messages: vec![Message { type_url: send.type_url, value: send.value }],
    chain_id: net.chain_id.clone(),
    include_pqc_public_key: false, // key registered with `register`
    sign_bytes_version: Some(version),
    /* fee, account_number, sequence, memo, timeout_height */
};

let draft = build_hybrid_tx(params.clone())?;                    // sign a draft
params.fee = estimate_fee(&net.rest_url, &draft.tx_raw_bytes, 1.3, "0.15uqor").await?; // simulate, gas x 1.3
let tx = build_hybrid_tx(params.clone())?;                       // sign for real
let res = broadcast_and_wait(&net.rest_url, &tx.tx_raw_bytes, WaitOptions::default()).await?;
```

Die Registrierung ist ein einziger idempotenter Aufruf, `ensure_pqc_registered()` auf `PqcDx`: Er sendet `MsgRegisterPQCKeyV2` mit einem Besitznachweis nur dann, wenn noch kein Schlüssel registriert ist, und schlägt fehl, wenn das Konto einen anderen Schlüssel hält.

Das Gas ist nie fest vorgegeben: Der Entwurf wird simuliert, und das Limit ist das simulierte Gas mal 1,3, bepreist mit 0,15 uqor pro Gas (die Untergrenze der Chain liegt bei 0,1 uqor).

## Wie "verifiziert" entschieden wird {#verified}

`verify` liest `GET /cosmos/tx/v1beta1/txs/{hash}` vom öffentlichen Testnet-REST-Endpunkt und prüft drei Dinge:

- Die Transaktion war erfolgreich (`code 0`).
- Die Chain hat für den Signer `pqc_hybrid_verify` mit `status=verified` ausgegeben.
- Der Body trägt eine Erweiterung `/qorechain.pqc.v1.PQCHybridSignature` mit einer 4627 Bytes langen ML-DSA-87-Signatur.

## Was Sie sehen sollten {#output}

Ein erfolgreiches `send` gibt Betrag und Gebühr aus, den Block, in den die Transaktion aufgenommen wurde, und danach einen Bericht, der zeigt, dass die Transaktion erfolgreich war, `pqc_hybrid_verify` auf `verified` steht und die ML-DSA-87-Signatur 4627 Bytes lang ist. Schlägt eine Prüfung fehl, beendet sich das Werkzeug mit Status 2. Um die Transaktion nachzuschlagen, öffnen Sie https://explore.qore.network, schalten auf **Testnet** und suchen nach dem Hash, oder öffnen `https://explore.qore.network/tx/<HASH>`.

## Netzwerk-Endpunkte {#access}

| Was | Wo |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| Explorer | `https://explore.qore.network` (auf Testnet umschalten) |
| Faucet | https://dashboard.qorechain.io/faucet |

## Verwendete Pakete {#packages}

| Eintrag | Version |
| --- | --- |
| `qorechain-sdk` (importiert als `qorechain`) | 0.13 (aufgelöst zu 0.13.0) |
| `tokio` | 1 |
| `serde_json` | 1 |
| `base64` | 0.22 |
| `cosmrs` | 0.22 |
| `qday-pay` (diese App, nicht veröffentlicht) | 0.1.0 |

Die SDK-Release-Tabelle aller Sprachen finden Sie unter [SDK installieren](/sdk/install).

## Quellcode {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/04-rust-qday-pay
