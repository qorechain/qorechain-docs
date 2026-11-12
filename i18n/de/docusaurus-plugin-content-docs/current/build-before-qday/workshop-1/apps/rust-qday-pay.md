---
slug: /build-before-qday/workshop-1/apps/rust-qday-pay
title: Rust-App, qday-pay
sidebar_label: Rust, qday-pay
sidebar_position: 4
---

# Rust-App: qday-pay

**qday-pay** ist ein kleines Rust-Programm, das Sie in einem Terminal ausführen. Es zahlt Testnet-QOR im QoreChain-Testnet `qorechain-diana` mit einer **hybriden Signatur**: einer klassischen secp256k1-Signatur plus einer Post-Quanten-Signatur ML-DSA-87 (NIST FIPS 204). Nach der Zahlung liest es die Transaktion aus der Chain zurück und zeigt Ihnen den eigenen Nachweis der Chain, dass beide Signaturen geprüft wurden.

**Wie lange das dauert:** insgesamt etwa 15 Minuten. Der erste Build lädt die Bibliotheken herunter und kompiliert sie und dauert 2 bis 5 Minuten. Danach läuft jeder Befehl in Sekunden.

## Was es zeigt {#what-it-shows}

- **Hybride Signierung aus Rust** mit dem veröffentlichten Crate `qorechain-sdk` (Version 0.13, im Code als `qorechain` verwendet).
- **Einmalige Registrierung** Ihres Post-Quanten-Schlüssels on-chain.
- **Einen Verifikationsbericht** für jede Transaktion: die 64 Bytes große klassische Signatur, die 4.627 Bytes große ML-DSA-87-Signatur und das Urteil `pqc_hybrid_verify` der Chain.

Warum das wichtig ist: Man erwartet, dass eine rein klassische Signatur von einem künftigen Quantencomputer gebrochen werden kann. Eine hybride Signatur bleibt sicher, solange eine der beiden Hälften hält. Siehe [Quantum-Safe Transactions](/sdk/guides/quantum-safe).

## Schritt für Schritt {#run}

Sie arbeiten in Ihrem eigenen Terminal. Verwenden Sie ausschließlich ein Wegwerf-Konto im Testnet. Testnet-QOR hat keinen Wert. Verwenden Sie hier niemals eine echte Wallet oder echtes Geld.

:::note Windows
qday-pay nutzt für seine Schlüsseldatei die Dateiberechtigungen von Linux und macOS, deshalb führen Sie es unter Windows in **WSL** (Windows Subsystem for Linux) aus. WSL gibt Ihnen ein Linux-Terminal innerhalb von Windows. Alles Weitere folgt dann den Linux-Anweisungen.
:::

### 1. Bevor Sie beginnen: die Werkzeuge installieren {#install}

Sie brauchen drei Werkzeuge: **Git** (lädt den Code herunter), **Rust** (baut das Programm) und einen **C-Compiler** (Rust braucht einen, um das Programm zu linken). Java, Node.js und Python werden für diese App nicht benötigt.

**macOS**

| Werkzeug | So installieren Sie es | Prüfen |
| --- | --- | --- |
| C-Compiler und Git | `xcode-select --install` (ein Fenster öffnet sich, klicken Sie auf Installieren) | `git --version` |
| Rust | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` (drücken Sie die Eingabetaste, um die Voreinstellung zu übernehmen), dann das Terminal schließen und neu öffnen | `rustc --version` und `cargo --version` |

**Linux (Debian oder Ubuntu; andere Distributionen verwenden ihren eigenen Paketmanager)**

| Werkzeug | So installieren Sie es | Prüfen |
| --- | --- | --- |
| Git und C-Compiler | `sudo apt update && sudo apt install -y git build-essential curl` | `git --version` |
| Rust | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` (drücken Sie die Eingabetaste, um die Voreinstellung zu übernehmen), dann das Terminal schließen und neu öffnen | `rustc --version` und `cargo --version` |

**Windows (über WSL)**

1. Öffnen Sie PowerShell als Administrator und führen Sie `wsl --install` aus. Starten Sie den Computer neu, wenn Sie dazu aufgefordert werden. Windows installiert Ubuntu. Öffnen Sie die App **Ubuntu** aus dem Startmenü.
2. Folgen Sie im Ubuntu-Terminal der **Linux**-Tabelle oben.
3. Git für Windows (https://git-scm.com/download/win) wird nicht benötigt, weil Git im obigen Linux-Befehl enthalten ist.

Rust 1.74 oder neuer ist erforderlich. Der Befehl `rustup` installiert die neueste Version, das ist in Ordnung. Die Versionsprüfung sollte etwas wie `rustc 1.80.0` ausgeben, oder eine höhere Nummer.

**Was Sie sehen sollten:** `git --version`, `rustc --version` und `cargo --version` geben jeweils eine Versionsnummer aus. Meldet ein Befehl `command not found`, schließen Sie das Terminal, öffnen Sie ein neues und versuchen Sie es erneut.

### 2. Bevor Sie beginnen: Testnet-Wallet und Faucet {#wallet}

Diese App legt ihr eigenes Testnet-Konto an (Schritt 5), Sie müssen also keine Wallet installieren, um sie auszuführen. Sie brauchen nur eine Möglichkeit, kostenlose Testnet-QOR zu erhalten. Der Faucet ist eine Webseite, die kostenlose Testnet-QOR an eine Adresse sendet.

Wenn Sie Ihr Konto zusätzlich in der QoreX-Wallet ansehen möchten, verwenden Sie **QoreX im Testnet** mit einem Wegwerf-Konto:

- **QoreX-App:** Öffnen Sie die Einstellungen und aktivieren Sie **Use testnet (developers)**.
- **QoreX-Browser-Erweiterung:** Entsperren Sie sie, tippen Sie unten 7 Mal auf die Versionsnummer und wählen Sie dann **Switch to testnet (diana)**.

Sie brauchen für diese App kein Ethereum-Konto. Sie verwendet den Kontotyp QoreChain Native (eine `qor1...`-Adresse).

**Faucet:** https://dashboard.qorechain.io/faucet. Melden Sie sich an, fügen Sie Ihre Adresse ein und fordern Sie an. Der Faucet zahlt **100 QOR pro 24 Stunden und Konto**.

**Gut zu wissen:** Die allererste Transaktion eines neuen Kontos registriert dessen Post-Quanten-Schlüssel ML-DSA-87 on-chain. Das ist eine einmalige Gebühr von etwa 0,09 QOR. qday-pay erledigt das in Schritt 7.

**Beträge:** Die Einheit, die Sie lesen, ist **QOR**. Die Chain rechnet in **uqor**, der kleinsten Einheit. 1 QOR = 1.000.000 uqor. Sie geben Beträge in QOR ein (zum Beispiel `1`), und das Programm rechnet für Sie um.

### 3. Den Code holen {#get-the-code-step}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/04-rust-qday-pay
```

**Was es tut**

| Teil | Bedeutung |
| --- | --- |
| `git clone <address>` | Lädt eine vollständige Kopie der Beispiel-Apps von GitHub in einen neuen Ordner namens `build-before-qday`. |
| `cd <folder>` | Wechselt Ihr Terminal in den Ordner der Rust-App. Alle weiteren Befehle laufen von hier aus. |

**Was Sie sehen sollten:** `Cloning into 'build-before-qday'...` und dann Ihre Eingabeaufforderung im Ordner `04-rust-qday-pay`. Führen Sie zur Kontrolle `ls` aus: Sie sehen `Cargo.toml`, `Cargo.lock`, `README.md` und `src`.

### 4. Das Programm bauen {#build}

```bash
cargo build --release
```

**Was es tut:** `cargo` ist das Build-Werkzeug von Rust. Dieser Befehl lädt die in `Cargo.toml` aufgelisteten Bibliotheken herunter und kompiliert das Programm zu einer einzigen Datei.

| Teil | Bedeutung |
| --- | --- |
| `build` | Das Programm kompilieren (noch nicht ausführen). |
| `--release` | Die schnelle, optimierte Version bauen. Ohne diese Option erhalten Sie eine langsamere Debug-Version in einem anderen Ordner. |

**Wie lange:** beim ersten Mal 2 bis 5 Minuten, danach einige Sekunden.

**Was Sie sehen sollten:** viele Zeilen `Compiling ...`, dann `Finished release profile [optimized] target(s)`. Das Programm ist jetzt die Datei `./target/release/qday-pay`.

Prüfen Sie, ob es läuft:

```bash
./target/release/qday-pay
```

**Was es tut:** führt das Programm ohne Befehl aus. Es gibt seine Hilfe aus und ändert nichts.

**Was Sie sehen sollten:**

```text
qday-pay: hybrid post-quantum payments on QoreChain testnet

  qday-pay new
  qday-pay status
  qday-pay register
  qday-pay send <qor1to> <amount_qor> [--memo text]
  qday-pay verify <tx_hash>
```

Die fünf Zeilen sind die fünf Befehle, die Sie unten verwenden. Im Rest dieser Seite steht `<command>` für `./target/release/qday-pay <command>`.

### 5. Ein Wegwerf-Testnet-Konto anlegen {#new-account}

```bash
./target/release/qday-pay new
```

**Was es tut:** legt ein ganz neues Testnet-Konto an. Es erzeugt eine geheime Wiederherstellungsphrase (die Mnemonic) und speichert sie in einer **Schlüsseldatei**. Aus dieser einen Phrase leitet es beide Schlüssel ab, den klassischen secp256k1-Schlüssel und den Post-Quanten-Schlüssel ML-DSA-87. Die Phrase wird nie auf dem Bildschirm ausgegeben.

| Teil | Bedeutung |
| --- | --- |
| `new` | Der Befehl: ein Konto und eine Schlüsseldatei anlegen. Er weigert sich, eine bereits vorhandene Schlüsseldatei zu überschreiben, sodass er nicht versehentlich ein finanziertes Konto zerstören kann. |

**Wo die Schlüsseldatei liegt:** `~/.config/qday/rust.env`. Das `~` steht für Ihren Home-Ordner. Die Datei ist nur für Sie lesbar (Modus 0600). Sie können einen anderen Ort verwenden, indem Sie `QDAY_KEY_FILE` setzen, zum Beispiel `QDAY_KEY_FILE=$HOME/my-test-key.env ./target/release/qday-pay new`. Wenn Sie das tun, setzen Sie dieselbe Variable vor jeden weiteren Befehl.

:::warning Halten Sie die Schlüsseldatei privat
Die Schlüsseldatei ist der Schlüssel zum Konto. Geben Sie sie niemals weiter, fügen Sie sie niemals in einen Chat oder einen Screenshot ein und committen Sie sie niemals in Git. Verwenden Sie dieses Konto nur für den Workshop und niemals im Mainnet. Löschen Sie die Datei, wenn Sie fertig sind.
:::

**Was Sie sehen sollten:**

```text
  New testnet account (mnemonic saved, not shown)

  address      qor1...
  key file     /home/you/.config/qday/rust.env (0600)

  Next: fund it with testnet QOR, then `qday-pay status`.
```

Kopieren Sie die `qor1...`-Adresse.

### 6. Das Konto über den Faucet aufladen {#faucet}

1. Öffnen Sie https://dashboard.qorechain.io/faucet und melden Sie sich an.
2. Fügen Sie Ihre `qor1...`-Adresse ein und fordern Sie an. Sie erhalten 100 QOR.
3. Warten Sie etwa 10 Sekunden auf den Block, der die Zahlung enthält.

Das Konto muss on-chain existieren, bevor Sie einen Schlüssel registrieren können, und die Zahlung des Faucets legt es an.

### 7. Das Konto prüfen {#status}

```bash
./target/release/qday-pay status
```

**Was es tut:** liest Ihr Konto aus dem Testnet und gibt eine Zusammenfassung aus. Es sendet nichts.

**Was Sie sehen sollten:**

```text
  network      qorechain-diana (testnet)
  address      qor1...
  balance      100 QOR
  ML-DSA-87    NOT registered (run `qday-pay register`)
  block        123456
```

| Zeile | Bedeutung |
| --- | --- |
| `network` | Die Chain, mit der das Programm spricht. Es arbeitet nur mit dem Testnet `qorechain-diana` und lehnt jedes andere Netzwerk ab. |
| `balance` | Ihre ausgebbaren QOR. |
| `ML-DSA-87` | Ob Ihr Post-Quanten-Schlüssel on-chain registriert ist. |
| `block` | Die aktuelle Blockhöhe. Sie steigt stetig. |

### 8. Den Post-Quanten-Schlüssel registrieren {#register}

```bash
./target/release/qday-pay register
```

**Was es tut:** sendet eine Transaktion, die der Chain Ihren öffentlichen ML-DSA-87-Schlüssel mitteilt, zusammen mit einem **Besitznachweis** (einem Beweis, dass Sie wirklich den passenden geheimen Schlüssel besitzen). Die Chain speichert den Schlüssel und kann von nun an Ihre Post-Quanten-Signaturen prüfen. Es kostet eine einmalige Gebühr von etwa 0,09 QOR. Sie können den Befehl gefahrlos erneut ausführen: Ist der Schlüssel bereits registriert, geschieht nichts.

| Teil | Bedeutung |
| --- | --- |
| `register` | Der Befehl: Ihren ML-DSA-87-Schlüssel einmalig registrieren. |

**Was Sie sehen sollten:**

```text
  ML-DSA-87    registered (MsgRegisterPQCKeyV2 + proof of possession)
  tx           <64-character transaction hash>
  block        123460
  gas          ... used / ... wanted
  address      qor1...
```

### 9. Eine hybrid signierte Zahlung senden {#send}

Ersetzen Sie `qor1...` durch eine Testnet-Adresse. Sie können Ihre eigene Adresse bezahlen oder die Testnet-Adresse einer Freundin oder eines Freundes.

```bash
./target/release/qday-pay send qor1... 1 --memo "Build Before Q-Day Workshop 1 (Rust)"
```

**Was es tut:** baut eine Zahlung, signiert sie zweifach (secp256k1 und ML-DSA-87), prüft die Gaskosten, sendet sie, wartet, bis sie in einem Block ist, und führt dann für Sie die Verifikation aus Schritt 10 aus.

| Teil | Bedeutung |
| --- | --- |
| `send` | Der Befehl: QOR an eine andere Adresse zahlen. |
| `qor1...` (erster Wert) | Der Empfänger. Es muss eine `qor1`-Adresse sein, sonst bricht das Programm mit `not a qor1 address` ab. |
| `1` (zweiter Wert) | Der Betrag in QOR. `1` bedeutet 1 QOR, das sind 1.000.000 uqor. Sie können Dezimalwerte wie `0.5` verwenden. |
| `--memo "text"` | Optional. Ein Memo ist ein kurzer Text, der an die Transaktion angehängt und on-chain gespeichert wird. Setzen Sie ihn in Anführungszeichen, wenn er Leerzeichen enthält. Jeder kann ihn lesen, schreiben Sie also nichts Privates hinein. |

Die Option `--memo` steht nach dem Empfänger und dem Betrag, wie im Beispiel.

**Was Sie sehen sollten:**

```text
  sending      1 QOR -> qor1...
  fee          ... uqor (gas ...)
  included     block 123465

  tx           <64-character transaction hash>
  block        123465
  memo         Build Before Q-Day Workshop 1 (Rust)
  classical    secp256k1   64 bytes
  quantum      ML-DSA-87   4627 bytes

  VERIFIED: secp256k1 + ML-DSA-87
```

Die `fee` wird in uqor angezeigt und liegt weit unter 1 QOR. Das Programm gibt außerdem einen `explorer`-Link und eine Zeile `chain says` aus (Schritt 10). Kopieren Sie den Transaktions-Hash.

### 10. Eine beliebige Transaktion verifizieren {#verify}

```bash
./target/release/qday-pay verify <TX_HASH>
```

**Was es tut:** liest die Transaktion aus der Chain und prüft drei Dinge, ohne etwas zu senden.

| Teil | Bedeutung |
| --- | --- |
| `verify` | Der Befehl: den Verifikationsbericht ausgeben. |
| `<TX_HASH>` | Der 64-stellige Hash der Transaktion. Fügen Sie den Hash aus Schritt 9 ein. Es funktioniert für jede Testnet-Transaktion. |

Die Prüfungen:

1. Die Transaktion war erfolgreich (Ergebniscode 0).
2. Die Chain hat das Ereignis `pqc_hybrid_verify` mit `status=verified` ausgegeben. Das ist die Aussage der Chain, dass sie die Post-Quanten-Signatur geprüft hat.
3. Die Transaktion trägt eine `PQCHybridSignature`-Erweiterung mit einer 4.627 Bytes großen ML-DSA-87-Signatur, neben der 64 Bytes großen secp256k1-Signatur.

**Was Sie sehen sollten:** denselben Bericht wie in Schritt 9, der mit `VERIFIED: secp256k1 + ML-DSA-87` endet. Schlägt eine Prüfung fehl, lautet der Bericht `NOT VERIFIED as hybrid`, und das Programm endet mit Code 2.

### 11. Auf zweitem Weg verifizieren, ohne unser Programm {#verify-curl}

Sie können die Chain direkt fragen. Dafür brauchen Sie nur `curl`, das macOS und die meisten Linux-Systeme mitbringen. Das Werkzeug `jq` (optional) macht die Antwort besser lesbar. Installieren Sie es mit `brew install jq` unter macOS oder `sudo apt install -y jq` unter Linux.

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> | jq '.tx_response.code, .tx.body.extension_options[0]["@type"], (.tx.body.extension_options[0].pqc_signature | length)'
```

| Teil | Bedeutung |
| --- | --- |
| `curl -s <address>` | Lädt die Antwort vom Testnet-REST-Dienst herunter. `-s` blendet den Fortschrittsbalken aus. |
| `<HASH>` | Ihr Transaktions-Hash. |
| `\| jq '...'` | Greift drei Werte heraus. Ohne `jq` lassen Sie diesen Teil weg und lesen den vollständigen Text. |

**Was Sie sehen sollten:**

- `"code": 0` in der Antwort (die Transaktion war erfolgreich). In der `jq`-Ausgabe ist die erste Zeile `0`.
- Eine `PQCHybridSignature`-Erweiterung (Typ `/qorechain.pqc.v1.PQCHybridSignature`), die die ML-DSA-87-Signatur enthält. Die Länge des Base64-Textes beträgt 6.172 Zeichen, das sind 4.627 Bytes.
- In `tx_response.events` ein Ereignis vom Typ `pqc_hybrid_verify` mit dem Attribut `status` auf `verified`.

**Im Explorer:** Öffnen Sie https://explore.qore.network, schalten Sie ihn auf **Testnet** und suchen Sie nach Ihrem Transaktions-Hash. Das Programm gibt auch einen direkten Link aus.

### 12. Aufräumen {#cleanup}

Wenn Sie fertig sind, löschen Sie die Wegwerf-Schlüsseldatei:

```bash
rm ~/.config/qday/rust.env
```

`rm` löscht eine Datei. Führen Sie es nur für einen Testnet-Schlüssel aus, den Sie nicht mehr brauchen.

## Fehlerbehebung {#troubleshooting}

| Was Sie sehen | Warum | Was zu tun ist |
| --- | --- | --- |
| `command not found: cargo` oder `rustc` | Rust ist nicht installiert, oder das Terminal wurde vor der Installation geöffnet. | Installieren Sie Rust (Schritt 1), schließen Sie dann das Terminal und öffnen Sie es neu. |
| `linker 'cc' not found` oder `linking with cc failed` | Es gibt keinen C-Compiler. | macOS: `xcode-select --install`. Ubuntu: `sudo apt install -y build-essential`. |
| `cannot read ... run qday-pay new first` | An dieser Stelle gibt es keine Schlüsseldatei. | Führen Sie `./target/release/qday-pay new` aus, oder setzen Sie dasselbe `QDAY_KEY_FILE` wie zuvor. |
| `cannot create ... it may already exist` | Es gibt bereits eine Schlüsseldatei. Das Programm überschreibt nie eine. | Verwenden Sie sie weiter, oder löschen Sie sie mit `rm`, falls sie nichts Wichtiges enthält, und führen Sie dann `new` erneut aus. |
| `account qor1... not found on chain yet; fund it first` | Das Konto hat noch keine QOR und existiert deshalb on-chain noch nicht. | Fordern Sie QOR vom Faucet an (Schritt 6), warten Sie etwa 10 Sekunden und versuchen Sie es erneut. |
| Der Faucet meldet ein Ratenlimit | Der Faucet gibt eine Anfrage pro 24 Stunden und Konto aus. | Warten Sie 24 Stunden oder verwenden Sie ein zweites Wegwerf-Konto. |
| `account has no PQC key and classical fallback is disabled` | Sie haben eine Zahlung gesendet, bevor der Post-Quanten-Schlüssel registriert war. | Führen Sie `./target/release/qday-pay register` aus und senden Sie dann erneut. |
| `not a qor1 address` | Der Empfänger ist falsch, zum Beispiel eine `0x...`-Adresse. | Verwenden Sie eine `qor1...`-Adresse. |
| `transport error` oder `error sending request` | Keine Internetverbindung, oder das Testnet ist kurz nicht erreichbar. | Prüfen Sie Ihre Verbindung und versuchen Sie es in einer Minute erneut. |
| `NOT VERIFIED as hybrid` | Die Transaktion ist fehlgeschlagen oder war nicht hybrid signiert. | Lesen Sie den `code` im Bericht. Senden Sie mit diesem Programm eine neue Zahlung. |
| `pnpm: command not found` | Sie haben eine JavaScript-App versucht. Diese Rust-App braucht kein pnpm. | Ignorieren Sie es hier. Für die JavaScript-Apps führen Sie `npm install -g pnpm` aus. |
| `EVM authorisation window exhausted` | Das gehört zur Hardhat-App, nicht zu dieser. | Öffnen Sie in jener App mit `pnpm window open` ein neues Fenster. |
| CORS-Fehler | Das betrifft Browser-Apps. Diese Kommandozeilen-App hat keine. | Verwenden Sie in einer Browser-App den `/lcd`-Proxy der Vorlage. |

## Das Konto {#account}

Das Konto ist ein QoreChain-Native-secp256k1-Konto (Coin-Typ 118, Pfad `m/44'/118'/0'/0/0`, eine `qor1...`-Adresse). Der ML-DSA-87-Schlüssel stammt aus derselben Wiederherstellungsphrase über die kanonische, an die Adresse gebundene Regel des SDK (`authenticator::try_derive_pqc_canonical`). Eine Wiederherstellungsphrase stellt beide Schlüssel wieder her.

## Der SDK-Code, auf den es ankommt {#code}

Das ist der Kern des Befehls `send` in `src/main.rs`:

```rust
let send = bank_send_any(w.address(), to, vec![coin(&uqor)]);           // MsgSend
let draft = build_hybrid_tx(params.clone())?;                           // secp256k1 + ML-DSA-87
params.fee = estimate_fee(rest, &draft.tx_raw_bytes, 1.3, "0.15uqor").await?; // simulate, gas x 1.3
let tx = build_hybrid_tx(params)?;                                      // sign for real
let res = broadcast_and_wait(rest, &tx.tx_raw_bytes, WaitOptions::default()).await?;
```

Die Registrierung ist ein einziger Aufruf: `PqcDx::ensure_pqc_registered()`. Er sendet `MsgRegisterPQCKeyV2` mit einem Besitznachweis nur dann, wenn noch kein Schlüssel registriert ist.

## Wie "verifiziert" entschieden wird {#verified}

`verify` liest `GET /cosmos/tx/v1beta1/txs/{hash}` und prüft:

- die Transaktion war erfolgreich (`code 0`);
- die Chain hat `pqc_hybrid_verify` mit `status=verified` für den Signierenden ausgegeben;
- der Body trägt eine `/qorechain.pqc.v1.PQCHybridSignature`-Erweiterung mit einer 4.627 Bytes großen ML-DSA-87-Signatur (neben der 64 Bytes großen secp256k1-Signatur).

## Was Sie sehen sollten {#output}

- `new` gibt eine `qor1...`-Adresse und den Ort der Schlüsseldatei aus, nie die Wiederherstellungsphrase.
- `status` zeigt das Guthaben und ob der ML-DSA-87-Schlüssel registriert ist.
- `send` endet mit `VERIFIED: secp256k1 + ML-DSA-87` und einem Explorer-Link.
- Auf https://explore.qore.network (auf Testnet umgeschaltet) erscheint die Transaktion unter ihrem Hash.

## Netzwerk-Endpunkte {#access}

| | |
| --- | --- |
| Cosmos-Chain-ID | `qorechain-diana` (nur Testnet) |
| REST | `https://api-testnet.qore.host` |
| Faucet | https://dashboard.qorechain.io/faucet |
| Explorer | https://explore.qore.network (auf Testnet umschalten) |

## Verwendete Pakete {#packages}

| Crate | Version | Verwendet für |
| --- | --- | --- |
| `qorechain-sdk` | 0.13 | Konten, hybride Signierung, REST-Client, Verifikationshelfer |
| `tokio` | 1 | Asynchrone Laufzeitumgebung |
| `serde_json` | 1 | Lesen der JSON-Antworten der Chain |
| `base64` | 0.22 | Messen der Signaturgrößen |
| `cosmrs` | 0.22 | Der Nachrichtentyp `Coin` |

## Quellcode {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/04-rust-qday-pay
