---
slug: /getting-started/first-transaction
title: Erste Transaktion
sidebar_label: Erste Transaktion
sidebar_position: 5
---

# Erste Transaktion

Diese Anleitung führt durch das Senden von QOR-Token, das Abfragen von Transaktionen und die Interaktion mit QoreChain über seine nativen, EVM- und SVM-Schnittstellen.

:::note
Die folgenden Befehle verwenden das **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**). Das Mainnet (**`qorechain-vladi`**, EVM-Chain-ID **9801**) ist seit dem 7. Juni 2026 aktiv und läuft bis Höhe 3.742.566 auf Release v3.2.3 und ab diesem Block auf v3.2.4 (das Testnet läuft seit dem 19. Oktober 2026 auf v3.2.4) — ersetzen Sie beim Durchführen von Transaktionen auf dem Mainnet die Chain-ID und die Endpunkte durch die des Mainnets von der Seite **Verbindung zum Mainnet**.
:::

## Ihr Guthaben prüfen

Überprüfen Sie vor dem Senden von Token Ihr Kontoguthaben:

```bash
qorechaind query bank balances qor1youraddress... --output json
```

Die Antwort enthält alle vom Konto gehaltenen Token-Denominationen. QOR-Guthaben werden in `uqor` (Mikro-QOR) angezeigt, wobei **1 QOR = 1.000.000 uqor** entspricht.

## QOR senden {#send-qor}

Ein QoreChain-Konto sendet auf dem Cosmos-Pfad mit einer **hybriden Signatur**: der klassischen secp256k1-Signatur plus einer ML-DSA-87-Signatur (Dilithium-5). Ein einfaches `qorechaind tx bank send ... -y` wird abgelehnt, daher wird die Überweisung unsigniert erstellt und anschließend co-signiert. Sie benötigen einmalig einen auf Ihrem Konto registrierten Post-Quanten-Schlüssel (siehe [Registrieren Sie Ihren Post-Quanten-Schlüssel](#register-pqc-key) weiter unten) sowie die offizielle `qorechaind`-Release-Binärdatei von [download.qore.host](https://download.qore.host) (eine aus dem öffentlichen Quellbaum gebaute Binärdatei kann keine Dilithium-Signatur erzeugen oder anwenden).

```bash
# 1. Build the unsigned transaction (the fee is fixed here, because cosign signs the fee in this file)
qorechaind tx bank send mykey qor1recipient... 1000000uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > tx.json

# 2. Add the ML-DSA-87 signature and broadcast
qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

Dies sendet **1 QOR** (1.000.000 uqor) an die Empfängeradresse und zahlt dabei eine Gebühr von 40.000 uqor (0,04 QOR). Die Netzwerk-Untergrenze beträgt **0,1 uqor pro Gas-Einheit**, die Gebühr muss also mindestens dem Gas-Limit multipliziert mit 0,1 entsprechen: `--gas 400000` erfordert `--fees 40000uqor` oder mehr. Eine hybrid signierte Überweisung verbraucht typischerweise 160.000 bis 240.000 Gas, weil die Signatur der Transaktion etwa 4,7 KB hinzufügt. `cosign` fragt den Node, welche Form der signierten Bytes das Netzwerk prüft, sodass derselbe Befehl auf beiden Netzwerken funktioniert.

### Registrieren Sie Ihren Post-Quanten-Schlüssel {#register-pqc-key}

Ein Post-Quanten-Schlüssel wird **explizit** registriert, einmal pro Konto. Die Chain registriert ihn bei Ihrer ersten Transaktion nicht für Sie. Die Registrierungstransaktion selbst (und die Schlüsselmigration) darf allein mit dem klassischen Schlüssel signiert werden, damit ein brandneues Konto starten kann:

```bash
# generate the ML-DSA-87 key (stored under ~/.qorechaind/pqc/mypqc.dilithium, mode 0600, not encrypted)
qorechaind tx pqc gen-key mypqc

# register the printed public key for your account
qorechaind tx pqc register-key <public_key_hex> hybrid --from mykey \
  --chain-id qorechain-diana --gas 600000 --fees 60000uqor
```

Seit v3.2.3 akzeptiert die Chain bei der Registrierung außerdem einen optionalen **Besitznachweis** und lehnt schwache, degenerierte oder bereits verwendete Schlüssel ab. Um einen anzuhängen, registrieren Sie mit `register-key-v2` und benennen Ihren lokalen Schlüssel:

```bash
qorechaind tx pqc register-key-v2 dilithium5 <public_key_hex> hybrid --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --gas 600000 --fees 60000uqor
```

Sichern Sie die PQC-Schlüsseldatei so sorgfältig wie Ihre Wiederherstellungsphrase; sie lässt sich mit `qorechaind tx pqc recover-key` aus der Phrase neu ableiten. [QoreX](/qorex/overview) und das QoreChain-SDK übernehmen die Schlüsselregistrierung für Sie. Den vollständigen hybriden Ablauf finden Sie unter [Wallet-Einrichtung](/getting-started/wallet-setup).

:::caution Cosmos-Transfers erfordern eine hybride PQC-Signatur
Auf dem Cosmos-Pfad lautet die Netzwerkeinstellung `hybrid_signature_mode = required` (die Live-Netzwerke laufen auf der v3.2-Linie). Eine rein klassische Transaktion wird **abgelehnt**. Um die hybride Signatur außerhalb der CLI zu erzeugen, leisten die quelloffene Bibliothek [**qorechain-pqc**](/developer-guide/post-quantum-signing) (`hybridSignBytes`) und das QoreChain-SDK im Code das Gleiche.
:::

Nachdem die co-signierte Transaktion akzeptiert wurde, gibt die CLI einen Transaktions-Hash zurück.

## Transaktion abfragen

Schlagen Sie eine abgeschlossene Transaktion anhand ihres Hashs nach:

```bash
qorechaind query tx <txhash>
```

Die Ausgabe enthält den Transaktionsstatus, das verbrauchte Gas, die Blockhöhe und alle während der Ausführung ausgegebenen Ereignisse.

Für JSON-Ausgabe:

```bash
qorechaind query tx <txhash> --output json
```

## Verwendung von JSON-RPC (EVM)

Die EVM-Ausführungsumgebung von QoreChain stellt an Port `8545` eine standardmäßige Ethereum-JSON-RPC-Schnittstelle bereit.

:::caution EVM-Transaktionen benötigen ein Autorisierungsfenster
Standardmäßiges Ethereum-Signieren (MetaMask, ethers.js, ...) funktioniert weiterhin unverändert, doch seit v3.2.0 lässt der EVM-Pfad eine Transaktion nur von einem Konto zu, das einen **registrierten Post-Quanten-Schlüssel** und ein **offenes EVM-Autorisierungsfenster** hat. Öffnen Sie zuerst eines (das ist eine Transaktion auf dem Cosmos-Pfad, signiert mit Ihrem ML-DSA-Schlüssel) — siehe [EVM-Autorisierungsfenster](#evm-window) weiter unten. Ohne Fenster antwortet der Node mit `no open EVM authorisation window`. Das Lesen von Zustand (`eth_blockNumber`, `eth_getBalance`, `eth_call`, `eth_estimateGas`) braucht kein Fenster.
:::

### Die neueste Blocknummer abrufen

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_blockNumber",
    "params": [],
    "id": 1
  }' | jq '.result'
```

### Ein Kontoguthaben abrufen

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_getBalance",
    "params": ["0xYourEVMAddress", "latest"],
    "id": 1
  }' | jq '.result'
```

Das Guthaben wird als hex-kodierter Wert in der kleinsten Denomination zurückgegeben.

### EVM-Autorisierungsfenster {#evm-window}

Seit dem Chain-Release **v3.2.0** (Mainnet-Höhe 2.981.742, 25. September 2026; Testnet-Höhe 5.920.000) lässt der EVM-Pfad eine Transaktion nur von einem Konto zu, das

1. einen **registrierten Post-Quanten-Schlüssel** (ML-DSA-87) hat und
2. ein **offenes EVM-Autorisierungsfenster** hat, das noch Platz für die Transaktion bietet.

Alles andere am EVM-Pfad bleibt unverändert: Sie signieren weiterhin mit MetaMask, ethers.js, Hardhat oder Foundry, und `eth_estimateGas` sowie andere Simulationen funktionieren ohne Fenster. Contract-Deployments zählen wie jede andere EVM-Transaktion, daher wird vor einem Deployment ein Fenster benötigt.

**Warum ein Fenster?** Ein Standard-Wallet erzeugt eine einzelne secp256k1-Signatur über eine Ethereum-Transaktion und bietet Anwendungen keine Möglichkeit, eine zweite, Post-Quanten-Signatur anzuhängen. Deshalb reist die Post-Quanten-Autorisierung der Transaktion *voraus*: Sie öffnen mit einer normalen Cosmos-Pfad-Transaktion, die Ihre ML-DSA-Signatur trägt, ein begrenztes Fenster, und der EVM-Pfad lässt dann Transaktionen zu, die davon abgedeckt sind. Ein klassischer Schlüssel allein kann nie ein Fenster öffnen, sodass ein gestohlener klassischer Schlüssel nur ausgeben kann, was ein bereits geöffnetes Fenster erlaubt. Es funktioniert wie eine ERC-20-Freigabe: Sie autorisieren einen begrenzten Betrag für eine begrenzte Zeit und führen dann normal Transaktionen durch.

**Was ein Fenster begrenzt.** Drei Grenzen gelten gleichzeitig; welche zuerst erschöpft ist, schließt das Fenster.

| Grenze | Bedeutung | Zulässiger Bereich |
| --- | --- | --- |
| `blocks` | Wie lange das Fenster offen bleibt, gezählt ab dem Block, der es öffnet | 1 – 17.280 |
| `max-txs` | Wie viele EVM-Transaktionen es zulässt | 1 – 1.000 |
| `max-value` | Gesamter Abfluss, den es zulässt, in uqor: übertragener Wert **plus** die maximale Gebühr, die jede Transaktion zahlen könnte (Gas-Limit × Gebührenobergrenze), aufgerundet | größer als 0 |

* 17.280 Blöcke entsprechen etwa 15 Stunden im Mainnet (etwa 3,2 s pro Block) und etwa 5 Stunden im Testnet (etwa 1,0 s pro Block).
* Eine Transaktion, die zugelassen wird und dann fehlschlägt, verbraucht dennoch ihren Platz und ihr Wertbudget.
* Das Öffnen eines neuen Fensters **ersetzt** das vorherige; der Verbrauch beginnt wieder bei null.
* Die CLI akzeptiert `max-value` in `uqor` oder `qor` (`1000qor` = 1.000.000.000 uqor).
* Die Wertgrenze zählt nur natives QOR: Eine Token-Überweisung, eine Freigabe oder ein anderer Contract-Aufruf trägt den Wert null. Um auch diese zu begrenzen, schränken Sie den Geltungsbereich des Fensters ein (siehe unten).

**Schritt 1 — Registrieren Sie Ihren Post-Quanten-Schlüssel** (einmalig): siehe [Registrieren Sie Ihren Post-Quanten-Schlüssel](#register-pqc-key) oben.

**Schritt 2 — Öffnen Sie ein Fenster.** Das Öffnen eines Fensters ist eine Cosmos-Pfad-Transaktion, daher wird sie unsigniert erzeugt und anschließend co-signiert:

```bash
# at most 1000 QOR in total, at most 20 transactions, for 7,200 blocks (about 6.4 hours on mainnet)
qorechaind tx pqc open-evm-window 7200 20 1000qor --from mykey \
  --chain-id qorechain-diana --gas 400000 --fees 40000uqor --generate-only > window.json

qorechaind tx pqc cosign window.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

**Den Geltungsbereich einschränken (v3.2.3 und später).** Zwei optionale Flags beschränken, was ein offenes Fenster zulässt: `--native-only` lässt nur einfache native QOR-Überweisungen zu (keine Calldata, keine Contract-Erstellung, keinen Empfänger, der Code trägt), und `--allowed-targets 0xAAA...,0xBBB...` lässt nur Transaktionen an diese Empfänger zu (höchstens 16; die Contract-Erstellung wird dann abgelehnt). Zum Beispiel:

```bash
qorechaind tx pqc open-evm-window 7200 20 1000qor --native-only --from mykey \
  --chain-id qorechain-diana --gas 400000 --fees 40000uqor --generate-only > window.json
```

Im Mainnet hat das Öffnen eines Fensters etwa 180.000 Gas verbraucht. In [QoreX](/qorex/security-and-recovery#evm-window) ist derselbe Schritt **Einstellungen → Sicherheit → EVM-Zugriffsfenster** (App) bzw. die Schaltfläche **EVM-Zugriffsfenster** (Erweiterung). Das Öffnen des Fensters erhöht die Nonce Ihres Kontos, öffnen Sie es daher **bevor** Sie die EVM-Transaktion in Ihrem Wallet vorbereiten.

**Schritt 3 — Prüfen Sie, was übrig ist:**

```bash
qorechaind query pqc evm-window qor1youraddress...
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_window/qor1youraddress...
```

Die REST-Antwort schlägt für eine Adresse ohne Fenster nie fehl; sie liefert `found: false`. Die Felder sind `found`, `live`, `opened_height`, `expiry_height`, `max_txs`, `used_txs`, `max_value`, `used_value`, `remaining_blocks`, `remaining_txs` und `remaining_value` (uqor-Ganzzahlen, als Strings zurückgegeben). Im Mainnet verwenden Sie `https://api.qore.host`.

**Schritt 4 — Nutzen Sie den EVM-Pfad ganz normal.** Senden Sie wie gewohnt aus MetaMask oder Ihrem Tooling. Jede Transaktion verbraucht einen Transaktionsplatz und (Wert + maximale Gebühr) aus dem Fenster.

**Ein Fenster vorzeitig schließen.** Wenn Sie vermuten, dass Ihr klassischer Schlüssel kompromittiert ist, schließen Sie das Fenster; was es noch zugelassen hätte, wird ab dem nächsten Block abgelehnt. Das Schließen widerruft außerdem jede ausstehende EIP-7702-Delegationszustimmung (seit v3.2.2; eine Transaktion vom Typ 4, die den Code eines Kontos ändert, wird nur nach einer Post-Quanten-Zustimmung per `authorize-evm-delegation` zugelassen):

```bash
qorechaind tx pqc close-evm-window --from mykey --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor --generate-only > close.json
qorechaind tx pqc cosign close.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

**Fehler**

| Was Sie sehen | Bedeutung | Was zu tun ist |
| --- | --- | --- |
| `no open EVM authorisation window; open one with MsgOpenEVMWindow ...` (Modul `pqc`, Code 26) | Kein Fenster für dieses Konto | Schritt 2 |
| `... has no registered post-quantum key; the EVM lane requires one` (Code 26 auf dem EVM-Pfad; Code 28, wenn Sie versuchen, ein Fenster zu öffnen) | Kein ML-DSA-Schlüssel registriert | Schritt 1 |
| `the EVM authorisation window for ... does not admit this transaction (remaining: ...)` (Code 27) | Abgelaufen oder erschöpft; die Meldung zeigt, welche Grenze | Neues Fenster öffnen |
| `invalid EVM authorisation window` (Code 28) | Grenzen außerhalb des Bereichs (`blocks` 1–17.280, `max-txs` 1–1.000, `max-value` > 0) | Argumente korrigieren |

Aus dem Code heraus können das QoreChain-SDK und `@qorechain/wallet-adapter` die Öffnen- und Schließen-Nachrichten zusammenstellen und den Fensterstatus lesen; siehe die [SDK-Dokumentation](/sdk/overview).

Das Fenster gilt nur für den EVM-Pfad. Transaktionen auf dem Cosmos-Pfad tragen die hybride Signatur ohnehin bei jeder Transaktion, und wenn Sie nie ein Fenster öffnen, werden Ihre EVM-Transaktionen abgelehnt, während sich sonst nichts ändert.

## Verwendung von SVM RPC

Die SVM-Ausführungsumgebung von QoreChain stellt an Port `8899` eine Solana-kompatible RPC-Schnittstelle bereit. Die SVM-Transaktionsspur ist derzeit netzwerkweit deaktiviert, daher sind diese Lesemethoden der Teil, den Sie heute nutzen können.

### Den aktuellen Slot abrufen

```bash
curl -s -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getSlot",
    "id": 1
  }' | jq '.result'
```

### Ein Kontoguthaben abrufen

```bash
curl -s -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getBalance",
    "params": ["YourSVMPublicKey"],
    "id": 1
  }' | jq '.result'
```

## Gängige CLI-Muster

Bei der Arbeit mit der `qorechaind`-CLI werden diese Flags häufig verwendet:

| Flag               | Beschreibung                   | Beispiel                        |
| ------------------ | ------------------------------- | -------------------------------- |
| `--chain-id`       | Gibt die Ziel-Chain an          | `--chain-id qorechain-diana`     |
| `--fees`           | Transaktionsgebühr in uqor (Gas-Limit × mindestens 0,1) | `--fees 40000uqor` |
| `--from`           | Name oder Adresse des Signierschlüssels | `--from mykey`           |
| `--output`         | Antwortformat                   | `--output json`                  |
| `--node`           | RPC-Endpunkt, zu dem verbunden wird | `--node tcp://localhost:26657` |
| `--gas`            | Gas-Limit für die Transaktion   | `--gas 400000` (oder `--gas auto`) |
| `--gas-adjustment` | Multiplikator für geschätztes Gas | `--gas-adjustment 1.5`         |
| `--gas-prices`     | Gaspreis anstelle von `--fees`  | `--gas-prices 0.1uqor`           |
| `--generate-only`  | Gibt die unsignierte Transaktion aus (vor `tx pqc cosign` erforderlich) | `--generate-only` |
| `-y`               | Bestätigungsabfrage überspringen | `-y`                             |

### Beispiel: Vollständiger Befehl mit allen gängigen Flags

```bash
qorechaind tx bank send mykey qor1recipient... 500000uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --node tcp://localhost:26657 \
  --output json \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

## Nächste Schritte

Nachdem Sie nun Ihre erste Transaktion gesendet haben, erkunden Sie mehr von dem, was QoreChain bietet:

* **Staking und Delegation** — Setzen Sie QOR ein, um das Netzwerk zu sichern, und erhalten Sie Staking-Belohnungen
* **Assets überbrücken** — Verschieben Sie Assets über Chains hinweg
* **EVM-Entwicklung** — Stellen Sie Solidity-Smart-Contracts auf QoreChain bereit
