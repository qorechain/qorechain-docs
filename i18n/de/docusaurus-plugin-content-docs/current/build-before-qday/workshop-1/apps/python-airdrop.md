---
slug: /build-before-qday/workshop-1/apps/python-airdrop
title: Python-App, Q-Day Airdrop
sidebar_label: Python, Airdrop
sidebar_position: 6
---

# Python-App: Q-Day Airdrop

Der **Q-Day Airdrop** ist ein kleines Python-Werkzeug, das Testnet-QOR an eine ganze Liste von Adressen in **einer** Transaktion sendet. Die Transaktion wird mit einem klassischen secp256k1-Schlüssel und einem Post-Quanten-Schlüssel ML-DSA-87 (FIPS 204) signiert. Das Werkzeug beweist dann anhand des eigenen Datensatzes der Chain, dass beide Signaturen verifiziert wurden. Es läuft im QoreChain-Testnet (`qorechain-diana`, EVM-Chain-ID 9800).

**Wie lange das dauert:** beim ersten Mal etwa 20 Minuten (10 Minuten Werkzeuge installieren, 5 Minuten Einrichtung, 5 Minuten Senden und Prüfen).

Sie müssen kein Python können. Sie tippen nur die folgenden Befehle nacheinander ein und vergleichen das Ergebnis mit "Was Sie sehen sollten".

## Was es zeigt {#what-it-shows}

- **Hybride Signierung mit ML-DSA-87 + secp256k1** aus Python.
- **Eine hybrid signierte Transaktion, on-chain verifiziert**, die mit einer einzigen Multi-Send-Nachricht viele Empfänger auf einmal bezahlt.
- **Einen Verifikationsbericht**, der aus dem eigenen Transaktionsdatensatz der Chain erstellt wird und nicht aus dem Wort des Werkzeugs.

Warum das wichtig ist: Eine Signatur schützt einen ganzen Airdrop, und er bleibt gegen einen künftigen Quantencomputer geschützt, weil die ML-DSA-87-Hälfte Post-Quanten-sicher ist. Siehe [Quantum-Safe Transactions](/sdk/guides/quantum-safe).

:::warning Nur Testnet
Verwenden Sie ausschließlich ein Wegwerf-Konto im Testnet. Testnet-QOR hat keinen Wert. Verwenden Sie in diesem Tutorial niemals Ihre echte Wallet, Ihre echte Wiederherstellungsphrase oder echtes Geld.
:::

## Begriffe, die Ihnen begegnen {#words}

| Begriff | Bedeutung |
| --- | --- |
| Testnet | Eine Übungskopie von QoreChain. Die Coins darauf sind kostenlos und wertlos. |
| QOR und uqor | Zwei Namen für dieselbe Münze. 1 QOR = 1.000.000 uqor. Das Werkzeug fragt nach QOR. Gebühren werden in uqor angezeigt. |
| Memo | Ein kurzer Text, der an eine Transaktion angehängt wird, wie ein Verwendungszweck bei einer Überweisung. |
| Adresse | Ihre öffentliche Kontonummer. Bei QoreChain beginnt sie mit `qor1`. Sie darf weitergegeben werden. |
| Schlüsseldatei | Eine Datei mit Ihrer geheimen Wiederherstellungsphrase. Geben Sie sie niemals weiter. |
| Faucet | Eine Webseite, die kostenlose Testnet-QOR verteilt. |
| Hash | Die eindeutige ID einer Transaktion. Damit schlagen Sie die Transaktion nach. |

## Bevor Sie beginnen {#before}

Sie brauchen **Git** (lädt den Code herunter) und **Python 3.10 oder neuer** mit `venv` (einem privaten Ordner für die Bibliotheken des Werkzeugs). Schließen Sie nach jeder Installation **das Terminal und öffnen Sie ein neues**, und führen Sie dann den Prüfbefehl aus.

| Werkzeug | macOS | Windows | Linux (Debian oder Ubuntu) | Prüfen |
| --- | --- | --- | --- | --- |
| Git | `brew install git` (Homebrew von https://brew.sh) | https://git-scm.com/download/win | `sudo apt install git` | `git --version` |
| Python 3.10+ | `brew install python` | https://www.python.org/downloads/ (setzen Sie im Installer den Haken bei "Add python.exe to PATH") | `sudo apt install python3 python3-venv python3-pip` | `python3 --version` (unter Windows: `python --version`) |

Verwenden Sie unter Windows PowerShell oder Git Bash. Wo diese Seite `python3` schreibt, verwendet Windows meist `python`. Alles andere ist gleich, außer der Zeile, die die virtuelle Umgebung einschaltet (Schritt 3).

## Testnet-Wallet und kostenlose QOR besorgen {#wallet}

Das Werkzeug erzeugt seinen eigenen Wegwerf-Schlüssel (Schritt 4 unten), Sie brauchen für dieses Tutorial also keine Wallet-App. Wenn Sie Ihr Konto zusätzlich in QoreX sehen möchten:

1. **QoreX-App:** Öffnen Sie die Einstellungen und aktivieren Sie **Use testnet (developers)**.
2. **QoreX-Browser-Erweiterung:** Entsperren Sie sie, tippen Sie unten 7 Mal auf die Versionsnummer und wählen Sie dann **Switch to testnet (diana)**.

Die kostenlosen QOR kommen vom Faucet unter https://dashboard.qorechain.io/faucet. Sie melden sich an, fügen die Adresse ein und fordern an. Er gibt **100 QOR pro 24 Stunden und Konto** aus.

Die allererste Transaktion eines neuen Kontos registriert dessen Post-Quanten-Schlüssel ML-DSA-87 auf der Chain. Das ist ein einmaliger Schritt mit einer Gebühr von etwa 0,09 QOR. Das Werkzeug erledigt ihn für Sie mit dem Befehl `register`.

## Schritt für Schritt {#run}

### 1. Den Code herunterladen {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/06-python-airdrop
```

**Was es tut**

- `git clone <address>`: kopiert das Projekt von GitHub in einen neuen Ordner namens `build-before-qday`.
- `cd <folder>`: wechselt Ihr Terminal in den Ordner der Python-App. Jeder spätere Befehl muss aus diesem Ordner ausgeführt werden.

**Was Sie sehen sollten:** Zeilen wie `Cloning into 'build-before-qday'...` und dann Ihre Eingabeaufforderung im neuen Ordner.

### 2. Eine private Python-Umgebung anlegen {#venv}

```bash
python3 -m venv .venv
```

**Was es tut:** legt einen Ordner namens `.venv` an, der die Bibliotheken dieses Werkzeugs enthält, damit sie sich nicht mit anderem auf Ihrem Computer vermischen.

| Teil | Bedeutung |
| --- | --- |
| `python3` | Das Python-Programm. |
| `-m venv` | Den in Python eingebauten Erzeuger für "virtuelle Umgebungen" ausführen. |
| `.venv` | Der Name des Ordners, der angelegt wird. |

**Was Sie sehen sollten:** keine Ausgabe, aber einen neuen Ordner `.venv`.

### 3. Sie einschalten und die Bibliotheken installieren {#deps}

```bash
source .venv/bin/activate
```

Verwenden Sie in Windows PowerShell stattdessen `.venv\Scripts\activate` (blockiert PowerShell das, führen Sie `Set-ExecutionPolicy -Scope Process RemoteSigned` aus und versuchen Sie es erneut). In der Windows-Eingabeaufforderung verwenden Sie `.venv\Scripts\activate.bat`.

**Was es tut:** schaltet Ihr Terminal auf die private Umgebung um.

**Was Sie sehen sollten:** `(.venv)` am Anfang Ihrer Eingabeaufforderung. Schalten Sie sie in jedem neuen Terminal mit demselben Befehl wieder ein.

```bash
pip install -r requirements.txt
```

| Teil | Bedeutung |
| --- | --- |
| `pip` | Der Bibliotheks-Installer von Python. |
| `install` | Bibliotheken herunterladen und installieren. |
| `-r requirements.txt` | Die Liste der Bibliotheken aus dieser Datei lesen. Sie nennt eine Bibliothek, `qorechain-sdk==0.13.0` (das QoreChain-SDK, genau Version 0.13.0), plus das, was sie braucht. |

**Was Sie sehen sollten:** Download-Zeilen, die mit `Successfully installed ... qorechain-sdk-0.13.0` enden. Der Hinweis, dass ein neueres pip verfügbar ist, ist harmlos.

**Wie lange:** etwa 15 Sekunden bis 1 Minute.

Prüfen Sie nun, ob das Werkzeug startet:

```bash
python airdrop.py --help
```

**Was Sie sehen sollten:** die Befehle `new`, `status`, `register`, `drop` und `verify`.

### 4. Ihr Wegwerf-Testnet-Konto anlegen {#key}

```bash
python airdrop.py new
```

**Was es tut:** legt ein frisches Konto an. Es schreibt eine geheime Wiederherstellungsphrase in die Schlüsseldatei `~/.config/qday/python.env` (in Ihrem Home-Ordner, nur für Sie lesbar) und gibt nur die öffentliche Adresse aus.

| Teil | Bedeutung |
| --- | --- |
| `new` | Eine neue Schlüsseldatei anlegen und ihre Adresse ausgeben. |
| `new --force` | Eine vorhandene Schlüsseldatei ersetzen. Der alte Schlüssel geht verloren. |

**Was Sie sehen sollten:** `New testnet wallet`, eine `address`, die mit `qor1...` beginnt, den Pfad der Schlüsseldatei mit `(mode 600, mnemonic not shown)` und einen Hinweis für den nächsten Schritt.

**Kopieren Sie die `qor1...`-Adresse.** Wenn Sie sie verlieren, gibt `python airdrop.py status` sie erneut aus. Geben Sie die Schlüsseldatei niemals weiter, committen Sie sie niemals in Git und verwenden Sie sie niemals im Mainnet.

Um den Schlüssel an einem anderen Ort zu halten, setzen Sie `--key-file` **vor** den Befehlsnamen:

```bash
python airdrop.py --key-file ~/my.env status
```

`--key-file <path>` bedeutet "verwende diese Schlüsseldatei statt der Standarddatei". Die Reihenfolge zählt: `--key-file` steht vor `status`, `drop` und den anderen Befehlen. Sie können stattdessen auch die Umgebungsvariable `QORE_KEY_FILE` setzen.

### 5. Testnet-QOR vom Faucet holen {#faucet}

1. Öffnen Sie https://dashboard.qorechain.io/faucet und melden Sie sich an.
2. Fügen Sie Ihre `qor1...`-Adresse ein und klicken Sie auf die Anfrage-Schaltfläche.
3. Warten Sie einige Sekunden und führen Sie dann aus:

```bash
python airdrop.py status
```

**Was es tut:** fragt das Testnet nach Ihrem Guthaben und danach, ob Ihr Post-Quanten-Schlüssel registriert ist.

**Was Sie sehen sollten:** Ihr Guthaben (etwa 100 QOR) und eine Warnung, dass der ML-DSA-87-Schlüssel noch nicht registriert ist. Meldet es, dass die Adresse "is not on chain yet", ist die Zahlung des Faucets noch nicht angekommen: Warten Sie 10 Sekunden und versuchen Sie es erneut.

### 6. Ihren Post-Quanten-Schlüssel registrieren {#register}

```bash
python airdrop.py register
```

**Was es tut:** hinterlegt Ihren ML-DSA-87-Schlüssel einmalig auf der Chain. Der Befehl kann gefahrlos erneut ausgeführt werden. Diese erste Transaktion wird klassisch signiert, weil ein Schlüssel seine eigene Registrierung nicht mitsignieren kann. Sie kostet etwa 0,09 QOR. Jede Transaktion danach wird hybrid signiert.

**Was Sie sehen sollten:** einen Transaktions-Hash und eine Zeile `registered` (oder `already registered`, wenn Sie den Befehl zweimal ausgeführt haben).

**Wie lange:** einige Sekunden (ein Block).

### 7. Die Empfängerliste schreiben {#list}

Legen Sie zwei Wegwerf-Empfängerkonten an. Jedes erhält seine eigene Schlüsseldatei:

```bash
python airdrop.py --key-file ~/.config/qday/r1.env new
python airdrop.py --key-file ~/.config/qday/r2.env new
```

**Was es tut:** dasselbe `new` wie zuvor, aber `--key-file` leitet jeden Schlüssel in eine eigene Datei, damit nichts überschrieben wird. (Sie können auch Adressen von Freunden verwenden, die das Testnet nutzen.)

**Was Sie sehen sollten:** zwei verschiedene `qor1...`-Adressen. Kopieren Sie beide.

Erstellen Sie nun in diesem Ordner eine reine Textdatei namens `addresses.txt` mit einer Adresse pro Zeile. Jeder Texteditor genügt (Notepad unter Windows, TextEdit im Nur-Text-Modus unter macOS, `nano addresses.txt` unter Linux):

```text
# One qor1 address per line. Blank lines and lines starting with # are ignored.
qor1...first-testnet-address
qor1...second-testnet-address
```

Ersetzen Sie die beiden Beispielzeilen durch Ihre echten Adressen. Leere Zeilen, `#`-Kommentare, Duplikate, der Absender selbst und alles, was keine gültige `qor1...`-Adresse ist, werden mit einer Warnung übersprungen. Höchstens 100 Empfänger pro Transaktion. Im Ordner liegt außerdem `addresses.example.txt`, ein Muster mit Platzhalterzeilen.

### 8. Den Airdrop senden {#drop}

```bash
python airdrop.py drop addresses.txt 0.1 --memo "Build Before Q-Day"
```

| Teil | Bedeutung |
| --- | --- |
| `drop` | Eine Transaktion senden, die alle in der Liste bezahlt. |
| `addresses.txt` | Die Datei mit den Empfängern. |
| `0.1` | Der Betrag in QOR **für jeden Empfänger** (0,1 QOR = 100.000 uqor). Zwei Empfänger erhalten zusammen 0,2 QOR. |
| `--memo "..."` | Ein kurzer Text, der an die Transaktion angehängt wird. Optional. |
| `--yes` (oder `-y`) | Optional: die Rückfrage "sind Sie sicher" überspringen. |

Reihenfolge der Optionen: Der Betrag und die Datei stehen zuerst, `--memo` und `--yes` danach. `--key-file` ist anders: Es steht vor `drop`.

**Was es tut:** zeigt eine Zusammenfassung (Empfänger, Betrag je Empfänger, Summe) und bittet Sie um Bestätigung. Geben Sie `y` ein und drücken Sie die Eingabetaste. Dann fragt es die Chain, wie viel Gas nötig ist (ein Testlauf), addiert 30 Prozent als Sicherheitsaufschlag, signiert mit beiden Schlüsseln, sendet eine Transaktion und gibt den Verifikationsbericht aus.

**Was Sie sehen sollten:** den Transaktions-Hash und die Höhe, dann einen Bericht mit: Code 0, dem Status `verified` für `pqc_hybrid_verify` des Signierenden, einer ML-DSA-87-Signatur von 4.627 Bytes und einer Empfängeranzahl, die zu Ihrer Liste passt. Kopieren Sie den Hash.

**Wie lange:** etwa 10 Sekunden.

### 9. Eine beliebige Transaktion verifizieren {#verify}

```bash
python airdrop.py verify <TX_HASH>
```

**Was es tut:** liest die Transaktion aus der Chain und gibt allein den Verifikationsbericht aus. Es funktioniert für jeden Transaktions-Hash, nicht nur für Ihren eigenen.

**Was Sie sehen sollten:** denselben Bericht wie am Ende von Schritt 8.

## Die Transaktion selbst verifizieren {#check}

Sie müssen dem Werkzeug nicht vertrauen. Fragen Sie die Chain direkt.

**Weg 1, im Browser.** Öffnen Sie `https://explore.qore.network/tx/<HASH>` (setzen Sie Ihren Hash anstelle von `<HASH>` ein) und schalten Sie den Explorer dann auf **Testnet**. Sie sollten eine erfolgreiche Transaktion sehen, bei der jeder Empfänger bezahlt wurde.

**Weg 2, ein Befehl:**

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

| Teil | Bedeutung |
| --- | --- |
| `curl` | Ein Werkzeug, das eine Webadresse herunterlädt. In macOS, Windows 10+ und den meisten Linux-Systemen enthalten. |
| `-s` | Still: den Fortschrittsbalken ausblenden. |
| die Adresse | Die öffentliche Testnet-REST-API. Sie liefert den vollständigen Transaktionsdatensatz als JSON. |

**Was Sie sehen sollten** in der langen Ausgabe (hängen Sie `| jq .` an, wenn Sie jq installiert haben, siehe https://jqlang.github.io/jq/download/):

- `"code": 0` bedeutet, dass die Transaktion erfolgreich war.
- Eine `PQCHybridSignature`-Erweiterung mit einer `pqc_signature` von **4.627 Bytes** (die ML-DSA-87-Signatur), neben der 64 Bytes großen klassischen.
- Ein Ereignis `pqc_hybrid_verify` mit `status` auf `verified` für Ihre Adresse.

## Wie der Nachweis funktioniert {#proof}

`verify` liest `GET /cosmos/tx/v1beta1/txs/{hash}` vom öffentlichen Testnet-REST-Endpunkt und prüft:

- ein Ereignis vom Typ `pqc_hybrid_verify` für den Signierenden mit `status=verified`;
- die Erweiterung `/qorechain.pqc.v1.PQCHybridSignature` trägt eine 4.627 Bytes große ML-DSA-87-Signatur;
- die Transaktion war erfolgreich (Code 0), und wie viele Empfänger sie bezahlt hat.

## Fehlerbehebung {#troubleshooting}

| Was Sie sehen | Warum | Was zu tun ist |
| --- | --- | --- |
| `python3: command not found` oder Version unter 3.10 | Python fehlt oder ist zu alt. | Installieren Sie Python 3.10 oder neuer und öffnen Sie ein neues Terminal. Unter Windows verwenden Sie `python`. |
| `No module named venv` oder `ensurepip is not available` | Der venv-Teil von Python ist nicht installiert (Debian, Ubuntu). | `sudo apt install python3-venv`, dann Schritt 2 wiederholen. |
| `ModuleNotFoundError: No module named 'qorsdk'` | Die Umgebung ist nicht eingeschaltet, oder die Installation wurde übersprungen. | Führen Sie `source .venv/bin/activate` aus, dann `pip install -r requirements.txt`. |
| `unrecognized arguments: --key-file` | `--key-file` wurde hinter den Befehl gesetzt. | Setzen Sie es davor: `python airdrop.py --key-file <path> status`. |
| `no key file at ... Run: python airdrop.py new` | Sie haben Schritt 4 übersprungen, oder es ist ein anderes `--key-file` im Einsatz. | Führen Sie `python airdrop.py new` aus. |
| `... already exists (use --force to replace it)` | Eine Schlüsseldatei ist bereits vorhanden. | Behalten Sie sie, oder führen Sie `python airdrop.py new --force` aus (der alte Schlüssel geht verloren). |
| `... is readable by others (mode ...)` | Die Berechtigungen der Schlüsseldatei sind zu offen. | Führen Sie `chmod 600 <path>` aus. |
| `... is not on chain yet (fund it first)` | Es sind keine QOR vom Faucet angekommen. | Warten Sie 10 Sekunden, oder fordern Sie beim Faucet an. |
| `account has no PQC key and classical fallback is disabled` | Der Post-Quanten-Schlüssel ist noch nicht registriert. | Führen Sie zuerst `python airdrop.py register` aus. |
| `the ML-DSA-87 key is not registered yet` | Derselbe Grund, vom Werkzeug vor dem Senden erkannt. | Führen Sie `python airdrop.py register` aus. |
| `balance too low` | Gesamtbetrag plus Gebühr übersteigt Ihr Guthaben. | Senden Sie einen kleineren Betrag, oder warten Sie auf die nächste Faucet-Anfrage. |
| Der Faucet meldet ein Ratenlimit | Eine Anfrage pro 24 Stunden und Konto. | Warten Sie, oder verwenden Sie ein anderes Wegwerf-Konto. |
| `skip line N: not a valid qor1 address` | Eine Zeile in `addresses.txt` ist keine gültige Adresse. | Korrigieren oder löschen Sie diese Zeile. Die anderen Zeilen funktionieren weiterhin. |
| `no valid recipients` | Jede Zeile wurde übersprungen. | Prüfen Sie, ob `addresses.txt` echte `qor1...`-Adressen enthält. |
| `bad amount` | Der Betrag ist keine einfache Zahl. | Verwenden Sie QOR als Zahl, zum Beispiel `0.1`. |
| `refused by the node: code ...` | Die Chain hat die Transaktion abgelehnt. | Lesen Sie die Meldung. Warten Sie eine Minute und versuchen Sie es erneut, wenn das Testnet ausgelastet ist oder aktualisiert wird. |
| `transaction not found on the testnet` | Falscher Hash, oder der Block ist noch nicht final. | Prüfen Sie den Hash und versuchen Sie es in einigen Sekunden erneut. |
| `the testnet may be pausing for an upgrade` | Öffentliche Endpunkte begrenzen Anfragen pro IP-Adresse, oder das Testnet wird aktualisiert. | Warten Sie eine Minute und führen Sie es erneut aus. |
| `EVM authorisation window exhausted` | Gehört zu den EVM-Apps, nicht zu dieser. | Öffnen Sie in einer EVM-App mit `pnpm window open` ein neues Fenster. |
| `HHE10402`, nachdem das Fenster geöffnet wurde | Nur Hardhat-Apps: Das Fenster war noch nicht aktiv. | Führen Sie das Deploy erneut aus. |
| `CORS`-Fehler in einem Browser | Nur, wenn eine Webseite die Chain direkt aufruft. Dieses Werkzeug tut das nicht. | Verwenden Sie in einer Browser-App den `/lcd`-Proxy der Vorlage. |
| `pnpm: command not found` | pnpm ist nicht installiert. Hier nicht nötig. | Nur für das Hardhat-Tutorial: Führen Sie `npm install -g pnpm` aus. |

## Der SDK-Code, auf den es ankommt {#code}

```python
from qorsdk import (derive_native_account, derive_pqc_canonical, msg, build_hybrid_tx,
                    auto_fee, hybrid_sign_and_broadcast, wait_for_tx,
                    resolve_sign_bytes_version)

account = derive_native_account(mnemonic)                   # classical secp256k1 key
pqc = derive_pqc_canonical(account.address, mnemonic)       # ML-DSA-87 key, same mnemonic

# ONE MsgMultiSend: one input (the sender), one output per recipient.
drop = msg.bank.multi_send(
    inputs=[Input(address=sender, coins=[Coin(denom="uqor", amount=str(each * len(to)))])],
    outputs=[Output(address=a, coins=[Coin(denom="uqor", amount=str(each))]) for a in to])

build = lambda fee, v: build_hybrid_tx(account=account, pqc_keypair=pqc, messages=[drop], fee=fee,
    memo=memo, chain_id="qorechain-diana", account_number=num, sequence=seq, sign_bytes_version=v)

v = resolve_sign_bytes_version("qorechain-diana", rest_url=REST)                 # "v2" on the testnet
fee = auto_fee(REST, build({"amount": [], "gas": "0"}, v), gas_multiplier=1.3)  # simulate
res = hybrid_sign_and_broadcast(lambda v: build(fee, v), chain_id="qorechain-diana", rest_url=REST)
included = wait_for_tx(rest, res["tx_response"]["txhash"])
```

Der Schlüssel wird einmalig mit `ensure_pqc_registered(...)` registriert, was nichts tut, wenn derselbe Schlüssel bereits on-chain ist. Das Gas ist nie fest: Die echte, hybrid signierte Transaktion wird zuerst simuliert, und das Limit ist das simulierte Gas mal 1,3, bepreist mit 0,15 uqor pro Gas.

Das Konto hat Coin-Typ 118 (`m/44'/118'/0'/0/0`). Der ML-DSA-87-Schlüssel wird aus derselben Wiederherstellungsphrase abgeleitet und mit `derive_pqc_canonical` an die Adresse gebunden. Wenn Sie Ihre eigene App stattdessen auf den seedbasierten Helfern aufbauen, braucht SDK 0.13.0 einen Wiederherstellungscode oder ein unabhängiges 32-Byte-PQC-Geheimnis (in Python `unified_account_from_seed(seed32, recovery_code=...)`); siehe [SDK-Installation](/sdk/install#whats-new-0130). Geben Sie niemals einen Wiederherstellungscode aus.

## Verwendete Pakete {#packages}

| Element | Version |
| --- | --- |
| `qorechain-sdk` (PyPI, importiert als `qorsdk`) | 0.13.0 (in `requirements.txt` als `qorechain-sdk==0.13.0` gepinnt) |
| Python | 3.10 oder neuer |

Das Werkzeug importiert außerdem die Protobuf-Typen `Input`, `Output` (aus `cosmpy.protos.cosmos.bank.v1beta1.bank_pb2`) und `Coin` (aus `cosmpy.protos.cosmos.base.v1beta1.coin_pb2`); sie werden mit dem SDK mitgeliefert. Siehe [SDK-Installation](/sdk/install) für die Release-Tabelle aller Sprachen.

## Wo Sie etwas nachschlagen {#access}

| Was | Wo |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| Explorer | `https://explore.qore.network` (auf Testnet umschalten) |
| Faucet | https://dashboard.qorechain.io/faucet |
| Code | https://github.com/qorechain/build-before-qday/tree/main/workshop-1/06-python-airdrop |
