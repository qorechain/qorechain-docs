---
slug: /build-before-qday/workshop-1/apps/python-airdrop
title: Python-App, Q-Day Airdrop
sidebar_label: Python, Airdrop
sidebar_position: 6
---

# Python-App: Q-Day Airdrop

Der **Q-Day Airdrop** ist ein kleines Python-Werkzeug, das Test-QOR an eine ganze Liste von Adressen in **einer** Transaktion sendet, signiert mit einem klassischen secp256k1-Schlüssel und einem Post-Quanten-Schlüssel ML-DSA-87 (FIPS 204). Anschließend belegt es anhand des eigenen Eintrags der Chain, dass beide Signaturen verifiziert wurden. Es läuft auf dem QoreChain-Testnet (`qorechain-diana`, EVM-Chain-ID 9800).

## Was es zeigt {#what-it-shows}

- **Hybride Signierung mit ML-DSA-87 + secp256k1** aus Python.
- **Eine hybrid signierte Transaktion, On-Chain verifiziert**, die mit einer einzigen Multi-Send-Nachricht viele Empfänger auf einmal bezahlt.
- **Ein Verifizierungsbericht**, der aus dem eigenen Transaktionseintrag der Chain erstellt wird und nicht aus dem Wort des Werkzeugs.

Warum das wichtig ist: Eine Signatur schützt einen ganzen Airdrop, und er bleibt gegen einen künftigen Quantencomputer geschützt, weil die ML-DSA-87-Hälfte Post-Quanten-sicher ist. Siehe [Quantum-Safe Transactions](/sdk/guides/quantum-safe).

## Schritt für Schritt {#run}

Alles Folgende läuft in Ihrem eigenen Terminal (macOS, Linux oder Windows mit WSL). Sie verwenden nur ein Wegwerf-Testnet-Konto. Test-QOR hat keinen Wert, und Sie verwenden hier nie eine echte Wallet.

### 1. Die Werkzeuge installieren {#install}

Sie brauchen Git und Python 3.10 oder neuer (mit `venv`). Prüfen Sie, was Sie haben:

```bash
git --version
python3 --version      # must report 3.10 or later
python3 -m venv --help # prints usage if venv is available
```

Wenn etwas fehlt, installieren Sie es zuerst, zum Beispiel von [python.org](https://www.python.org/downloads/) oder mit Ihrem Paketmanager (`brew install python` auf macOS, `sudo apt install python3 python3-venv git` auf Debian oder Ubuntu). Öffnen Sie ein neues Terminal und führen Sie die Prüfungen erneut aus.

### 2. Den Code holen {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/06-python-airdrop
```

### 3. Die Abhängigkeiten installieren {#deps}

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Das installiert ein Paket, `qorechain-sdk==0.13.0`, plus dessen Abhängigkeiten. Lassen Sie die virtuelle Umgebung für die restlichen Schritte aktiv (führen Sie in jedem neuen Terminal `source .venv/bin/activate` erneut aus). Prüfen Sie, dass das Werkzeug startet:

```bash
python airdrop.py --help
```

Sie sollten die Befehle `new`, `status`, `register`, `drop` und `verify` sehen.

### 4. Ihr Wegwerf-Testnet-Konto erstellen {#key}

```bash
python airdrop.py new
```

Das erzeugt eine neue Wiederherstellungsphrase, schreibt sie in die Schlüsseldatei `~/.config/qday/python.env` (nur für Sie lesbar, Modus 600) und gibt nur die Kontoadresse aus, die mit `qor1...` beginnt. Die Phrase wird nie angezeigt. Geben Sie diese Datei nicht weiter, committen Sie sie nicht und verwenden Sie sie nicht im Mainnet. Um den Schlüssel an einem anderen Ort zu halten, geben Sie `--key-file /path/to/file` vor dem Befehlsnamen an (zum Beispiel `python airdrop.py --key-file ~/my.env status`) oder setzen Sie `QORE_KEY_FILE`.

Kopieren Sie die Adresse `qor1...` aus der Ausgabe. Wenn Sie sie verlieren, gibt `python airdrop.py status` sie erneut aus.

### 5. Test-QOR vom Faucet holen {#faucet}

1. Öffnen Sie https://dashboard.qorechain.io/faucet und melden Sie sich an.
2. Fügen Sie Ihre Adresse `qor1...` ein und fordern Sie Token an. Der Faucet gibt 100 QOR pro 24 Stunden aus.
3. Prüfen Sie, ob sie angekommen sind:

```bash
python airdrop.py status
```

Das Guthaben sollte Ihr Test-QOR zeigen, und der Post-Quanten-Schlüssel sollte noch als nicht registriert erscheinen.

### 6. Ihren Post-Quanten-Schlüssel registrieren {#register}

```bash
python airdrop.py register
```

Das registriert Ihren ML-DSA-87-Schlüssel einmalig on-chain. Ein erneuter Aufruf ist unbedenklich. Die Registrierung wird klassisch signiert, weil ein Schlüssel seine eigene Registrierung nicht mitsignieren kann. Jede Transaktion danach ist hybrid signiert.

### 7. Die Empfängerliste schreiben {#list}

Erstellen Sie eine Textdatei mit einer Testnet-Adresse pro Zeile. Für einen ersten Versuch erzeugen Sie ein paar Wegwerf-Adressen, indem Sie `--key-file` auf neue Dateien zeigen lassen, oder Sie verwenden Adressen von Freunden, die ebenfalls das Testnet nutzen:

```bash
python airdrop.py --key-file ~/.config/qday/r1.env new
python airdrop.py --key-file ~/.config/qday/r2.env new
```

Tragen Sie dann die ausgegebenen Adressen in `addresses.txt` ein:

```text
# One qor1 address per line. Blank lines and lines starting with # are ignored.
qor1...first-testnet-address
qor1...second-testnet-address
```

Leerzeilen, `#`-Kommentare, Duplikate, der Absender selbst und alles, was keine gültige Kontoadresse `qor1...` ist, werden mit einer Warnung übersprungen. Es sind höchstens 100 Empfänger pro Transaktion erlaubt. Das Repository enthält außerdem `addresses.example.txt`, ein Beispiel mit Platzhalterzeilen.

### 8. Den Airdrop senden {#drop}

```bash
python airdrop.py drop addresses.txt 0.1 --memo "Build Before Q-Day"
```

`0.1` ist der Betrag in QOR, der an jeden Empfänger geht. Das Werkzeug zeigt eine Zusammenfassung (Empfänger, Betrag je Empfänger, Gesamtbetrag) und bittet um Bestätigung; mit `--yes` überspringen Sie die Frage. Danach simuliert es die Transaktion, um das Gas festzulegen, signiert sie mit beiden Schlüsseln, sendet sie als eine Transaktion und gibt den Verifizierungsbericht aus. Wenn das Senden fehlschlägt, warten Sie eine Minute und versuchen Sie es erneut.

### 9. Eine beliebige Transaktion verifizieren {#verify}

```bash
python airdrop.py verify <TX_HASH>
```

Verwenden Sie den Hash, den `drop` ausgegeben hat. Das gibt den Verifizierungsbericht für sich allein aus, für jeden beliebigen Transaktions-Hash.

## Was Sie sehen sollten {#output}

- `drop` gibt den Transaktions-Hash und die Höhe aus, danach den Verifizierungsbericht: Der Status `pqc_hybrid_verify` des Signers ist `verified`, die ML-DSA-87-Signatur ist 4627 Bytes lang, der Code ist 0, und die Zahl der Empfänger entspricht Ihrer Liste.
- Im Explorer: Öffnen Sie `https://explore.qore.network/tx/<HASH>` und schalten Sie den Explorer auf **Testnet**. Die Transaktion wird als erfolgreich angezeigt, mit jedem bezahlten Empfänger.

## Wie der Nachweis funktioniert {#proof}

`verify` liest `GET /cosmos/tx/v1beta1/txs/{hash}` vom öffentlichen Testnet-REST-Endpunkt und prüft:

- ein Ereignis vom Typ `pqc_hybrid_verify` für den Signer mit `status=verified`;
- die Erweiterung `/qorechain.pqc.v1.PQCHybridSignature` trägt eine 4627 Bytes lange ML-DSA-87-Signatur (neben der 64 Bytes langen secp256k1-Signatur);
- die Transaktion war erfolgreich (Code 0), und wie viele Empfänger sie bezahlt hat.

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

Der Schlüssel wird einmalig mit `ensure_pqc_registered(...)` registriert, was nichts tut, wenn derselbe Schlüssel bereits on-chain ist. Das Gas ist nie fest vorgegeben: Die echte hybrid signierte Transaktion wird zuerst simuliert, und das Limit ist das simulierte Gas mal 1,3, bepreist mit 0,15 uqor pro Gas.

Das Konto hat Coin-Typ 118 (`m/44'/118'/0'/0/0`). Der ML-DSA-87-Schlüssel wird aus derselben Wiederherstellungsphrase abgeleitet und mit `derive_pqc_canonical` an die Adresse gebunden. Wenn Sie stattdessen Ihre eigene App auf den Seed-basierten Helfern aufbauen, braucht SDK 0.13.0 einen Wiederherstellungscode oder ein unabhängiges 32-Byte-PQC-Geheimnis (in Python `unified_account_from_seed(seed32, recovery_code=...)`); siehe [SDK installieren](/sdk/install#whats-new-0130). Geben Sie einen Wiederherstellungscode niemals aus.

## Verwendete Pakete {#packages}

| Eintrag | Version |
| --- | --- |
| `qorechain-sdk` (PyPI, importiert als `qorsdk`) | 0.13.0 (in `requirements.txt` fixiert als `qorechain-sdk==0.13.0`) |
| Python | 3.10 oder neuer |

Das Werkzeug importiert außerdem die Protobuf-Typen `Input`, `Output` (aus `cosmpy.protos.cosmos.bank.v1beta1.bank_pb2`) und `Coin` (aus `cosmpy.protos.cosmos.base.v1beta1.coin_pb2`); sie kommen mit dem SDK. Die SDK-Release-Tabelle aller Sprachen finden Sie unter [SDK installieren](/sdk/install).

## Wo Sie nachschlagen {#access}

| Was | Wo |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| Explorer | `https://explore.qore.network` (auf Testnet umschalten) |
| Faucet | https://dashboard.qorechain.io/faucet |
| Code | https://github.com/qorechain/build-before-qday/tree/main/workshop-1/06-python-airdrop |
