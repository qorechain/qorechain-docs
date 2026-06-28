---
slug: /getting-started/first-transaction
title: Erste Transaktion
sidebar_label: Erste Transaktion
sidebar_position: 5
---

# Erste Transaktion

Diese Anleitung führt durch das Senden von QOR-Token, das Abfragen von Transaktionen und die Interaktion mit QoreChain über seine nativen, EVM- und SVM-Schnittstellen.

:::note
Die folgenden Befehle verwenden das **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**). Das Mainnet (**`qorechain-vladi`**, EVM-Chain-ID **9801**) ist seit dem 7. Juni 2026 aktiv — ersetzen Sie die Chain-ID und die Endpunkte des Mainnets aus der Seite **Verbindung zum Mainnet**, wenn Sie auf dem Mainnet Transaktionen durchführen.
:::

## Ihr Guthaben prüfen

Überprüfen Sie vor dem Senden von Token Ihr Kontoguthaben:

```bash
qorechaind query bank balances qor1youraddress... --output json
```

Die Antwort enthält alle vom Konto gehaltenen Token-Denominationen. QOR-Guthaben werden in `uqor` (Mikro-QOR) angezeigt, wobei **1 QOR = 1.000.000 uqor** entspricht.

## QOR senden

Übertragen Sie Token von Ihrem Schlüssel an eine andere Adresse:

```bash
qorechaind tx bank send mykey qor1recipient... 1000000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Dies sendet **1 QOR** (1.000.000 uqor) an die Empfängeradresse und zahlt eine Gebühr von 500 uqor.

:::caution Cosmos-Transfers erfordern eine hybride PQC-Signatur
Auf dem Cosmos-Pfad ist der Netzwerkstandard `hybrid_signature_mode = required` (aktuelle Chain-Version **v3.1.80**). Ein einfaches klassisches `tx bank send` wird **abgelehnt** — jede Transaktion auf dem Cosmos-Pfad muss neben der secp256k1-Signatur eine ML-DSA-87-Signatur (Dilithium-5) tragen. Erzeugen Sie einen Dilithium-5-Schlüssel mit `qorechaind tx pqc gen-key` und hängen Sie dann die hybride Co-Signatur mit `qorechaind tx pqc cosign` an (oder erstellen Sie die Transaktion mit `buildHybridTx` des QoreChain-SDK und verwenden Sie `includePqcPublicKey`, damit sich der Schlüssel bei der ersten Verwendung automatisch registriert). Um die hybride Signatur außerhalb der CLI zu erzeugen, erledigen die quelloffene Bibliothek [**qorechain-pqc**](/developer-guide/post-quantum-signing) (`hybridSignBytes`) und das QoreChain-SDK das Äquivalent im Code. Siehe [Wallet-Einrichtung](/getting-started/wallet-setup) für den vollständigen hybriden Ablauf.
:::

Sie werden aufgefordert, die Transaktion zu bestätigen, bevor sie übertragen wird. Nach der Bestätigung gibt die CLI einen Transaktions-Hash zurück.

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

Die EVM-Ausführungsumgebung von QoreChain stellt eine standardmäßige Ethereum-JSON-RPC-Schnittstelle an Port `8545` bereit.

:::note
EVM-Transaktionen sind von der hybriden PQC-Anforderung des Cosmos-Pfads **nicht betroffen**. Sie verwenden einen separaten `eth_secp256k1`-Ante-Pfad, sodass standardmäßiges Ethereum-Signieren (MetaMask, ethers.js usw.) ohne eine PQC-Erweiterung funktioniert.
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

## Verwendung von SVM RPC

Die SVM-Ausführungsumgebung von QoreChain stellt eine Solana-kompatible RPC-Schnittstelle an Port `8899` bereit.

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

| Flag               | Beschreibung                  | Beispiel                       |
| ------------------ | ----------------------------- | ------------------------------ |
| `--chain-id`       | Gibt die Ziel-Chain an        | `--chain-id qorechain-diana`   |
| `--fees`           | Transaktionsgebühr in uqor    | `--fees 500uqor`               |
| `--from`           | Name oder Adresse des Signierschlüssels | `--from mykey`        |
| `--output`         | Antwortformat                 | `--output json`                |
| `--node`           | RPC-Endpunkt, zu dem verbunden wird | `--node tcp://localhost:26657` |
| `--gas`            | Gas-Limit für die Transaktion | `--gas auto`                   |
| `--gas-adjustment` | Multiplikator für geschätztes Gas | `--gas-adjustment 1.3`     |
| `-y`               | Bestätigungsabfrage überspringen | `-y`                        |

### Beispiel: Vollständiger Befehl mit allen gängigen Flags

```bash
qorechaind tx bank send mykey qor1recipient... 500000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor \
  --node tcp://localhost:26657 \
  --output json \
  -y
```

## Nächste Schritte

Nachdem Sie nun Ihre erste Transaktion gesendet haben, erkunden Sie mehr von dem, was QoreChain bietet:

* **Staking und Delegation** — Setzen Sie QOR ein und verdienen Sie Belohnungen
* **Assets überbrücken** — Verschieben Sie Assets über Chains hinweg
* **EVM-Entwicklung** — Stellen Sie Solidity-Smart-Contracts auf QoreChain bereit
