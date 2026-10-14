---
slug: /getting-started/connecting-to-testnet
title: Verbindung zum Testnet
sidebar_label: Verbindung zum Testnet
sidebar_position: 4
---

# Verbindung zum Testnet

Treten Sie dem laufenden QoreChain-Diana-Testnet bei, indem Sie Ihren Node mit der korrekten Genesis-Datei, den richtigen Peers und Netzwerkeinstellungen konfigurieren.

:::note
Diese Seite behandelt das **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**). Das Mainnet (**`qorechain-vladi`**, EVM-Chain-ID **9801**) ist seit dem 29. Juni 2026 live und hat eine eigene Seite **Verbindung zum Mainnet** mit separater Genesis, eigenen Peers und Verbindungsdetails. Das Testnet läuft derzeit mit **v3.2.2**; sein Release-Manifest finden Sie unter [download.qore.host/testnet/latest.json](https://download.qore.host/testnet/latest.json).
:::

## Öffentliche Endpunkte

Wenn Sie lediglich **das Testnet abfragen oder Transaktionen broadcasten** möchten, verwenden Sie die öffentlichen Endpunkte:

| Dienst | URL |
|---|---|
| Konsens-RPC | `https://rpc-testnet.qore.host` (WebSocket: `wss://rpc-testnet.qore.host/websocket`) |
| Cosmos REST (LCD) | `https://api-testnet.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` (Chain-ID `9800`) |
| EVM WebSocket | `wss://evm-ws-testnet.qore.host` |
| SVM JSON-RPC (nur lesend) | `https://svm-testnet.qore.host` |
| Block-Explorer | [explore.qore.network](https://explore.qore.network) (auf Testnet umschalten) |

Testnet-QOR erhalten Sie über den [Dashboard-Faucet](/dashboard/faucet).

---

## Installation

Die maßgebliche Quelle für das aktuelle Testnet-Binary, die Genesis, die Peers und den State-Sync-Trust-Point ist das **Testnet-Manifest**, das live unter `https://download.qore.host/testnet/latest.json` aktualisiert wird. Es hat dasselbe Layout wie das Mainnet-Manifest, die Installationsschritte sind also dieselben — rufen Sie es ab und verwenden Sie dessen Werte, statt eine Version oder Prüfsumme fest zu codieren:

```bash
curl -s https://download.qore.host/testnet/latest.json -o latest.json
jq -r '.version, .minCompatible, .upgradeHeight' latest.json

BINARY_URL=$(jq -r .binary.url latest.json)
BINARY_SHA256=$(jq -r .binary.sha256 latest.json)

curl -fsSL "$BINARY_URL" -o qore.tgz
echo "${BINARY_SHA256}  qore.tgz" | sha256sum -c -

tar xzf qore.tgz
sudo install -m0755 qorechaind /usr/local/bin/
sudo mkdir -p /opt/qorechain/lib && sudo cp lib/*.so /opt/qorechain/lib/
export LD_LIBRARY_PATH=/opt/qorechain/lib

qorechaind init my-node --chain-id qorechain-diana
```

Das Testnet erhält koordinierte Upgrades über Governance-Vorschläge, daher enthält sein Manifest eine `upgradeHeight` (v3.2.2 wurde bei Höhe 6.905.034 angewendet), und `minCompatible` entspricht der aktuellen Version. Ein Node, der jetzt beitritt, benötigt das im Manifest genannte Release. Halten Sie die Systemuhr per NTP synchronisiert.

---

## Genesis herunterladen

Ersetzen Sie Ihre lokale Genesis-Datei durch die offizielle Testnet-Genesis, und verwenden Sie dafür die URL und den SHA-256 aus dem oben abgerufenen Manifest:

```bash
GENESIS_URL=$(jq -r .genesis.url latest.json)
GENESIS_SHA256=$(jq -r .genesis.sha256 latest.json)

curl -fsSL "$GENESIS_URL" -o ~/.qorechaind/config/genesis.json
echo "${GENESIS_SHA256}  $HOME/.qorechaind/config/genesis.json" | sha256sum -c -
```

Dieselbe Datei wird auch live von der Chain selbst ausgeliefert:

```bash
curl -s https://rpc-testnet.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

Diese Datei definiert den Anfangszustand des Diana-Testnets, einschließlich des Validator-Sets, der Token-Zuteilungen und der Modulparameter.

:::note Das Testnet wird an Ort und Stelle aktualisiert
Diana läuft seit dem 1. Juli 2026 durchgehend und wird wie das Mainnet über Governance-Vorschläge aktualisiert. Das Testnet ist ein Staging-Netzwerk und kann ohne Vorankündigung zurückgesetzt werden: Wenn Ihr Node nicht mehr synchronisiert, prüfen Sie das Manifest und die Discord-Ankündigungen, laden Sie dann die Genesis erneut herunter und starten Sie mit einem frischen Datenverzeichnis. Der öffentliche Sentry behält nur aktuelle Blöcke, daher sollte ein neuer Node per State Sync (unten) starten, statt ab Genesis nachzuspielen.
:::

---

## Peers konfigurieren

Lesen Sie die aktuellen Peer- und Seed-Listen aus dem Manifest, statt Node-IDs und Hosts fest zu codieren:

```bash
PEERS=$(jq -r '.peers | join(",")' latest.json)
SEEDS=$(jq -r '.seeds | join(",")' latest.json)
```

Öffnen Sie `~/.qorechaind/config/config.toml` und setzen Sie die Felder `persistent_peers` (und `seeds`) auf diese Werte:

```toml
persistent_peers = "<value of $PEERS>"
seeds = "<value of $SEEDS>"
```

Setzen Sie außerdem die Gebührenuntergrenze in `~/.qorechaind/config/app.toml` (das Testnet verwendet denselben Mindest-Gaspreis von **0.1uqor** wie das Mainnet):

```toml
minimum-gas-prices = "0.1uqor"
```

### Empfohlene Einstellungen

Ein Full Node bestimmt die Blockzeit nicht selbst — das tun die Validatoren (das Testnet erzeugt derzeit etwa jede Sekunde einen Block). Belassen Sie die Konsens-Timeouts bei ihren Standardwerten, es sei denn, Sie betreiben einen Validator und haben von der Validator-Gruppe Werte erhalten. Eine nützliche Mempool-Einstellung für einen öffentlichen RPC-Node, in der `config.toml`:

```toml
[mempool]
size = 5000
```

---

## Schneller Bootstrap (State Sync)

Das Feld `stateSync` des Manifests enthält ein regelmäßig aktualisiertes Trust-Height/Hash-Paar:

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

Setzen Sie den Abschnitt `[statesync]` der `config.toml` mit diesen Werten und den `rpcServers` aus dem Manifest — den vollständigen Ablauf finden Sie unter [Einen Node betreiben](/developer-guide/running-a-node).

---

## Node starten

Starten Sie Ihren Node, um mit der Synchronisierung mit dem Netzwerk zu beginnen:

```bash
./qorechaind start
```

Der Node verbindet sich mit Peers und beginnt, Blöcke herunterzuladen (ab der Genesis oder ab der Trust-Height, wenn Sie State Sync verwenden). Die Dauer der initialen Synchronisierung hängt von der aktuellen Chain-Höhe und Ihrer Netzwerkgeschwindigkeit ab.

---

## Sync-Status prüfen

Überprüfen Sie, ob Ihr Node zum neuesten Block aufschließt:

```bash
curl localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — Der Node synchronisiert noch. Warten Sie, bis er aufgeholt hat.
* `false` — Der Node ist vollständig synchronisiert und verarbeitet neue Blöcke.

Sie können auch die aktuelle Blockhöhe prüfen:

```bash
curl localhost:26657/status | jq '.result.sync_info.latest_block_height'
```

---

## Monitoring

QoreChain stellt mehrere Endpunkte zur Überwachung von Node-Gesundheit und -Leistung bereit.

### Prometheus-Metriken

Rohmetriken sind verfügbar unter:

```
http://localhost:26660/metrics
```

Diese Metriken können von jedem Prometheus-kompatiblen Collector abgerufen (gescrapt) werden.

### Grafana-Dashboards

Bei Betrieb über Docker Compose ist Grafana verfügbar unter:

```
http://localhost:3001
```

Legen Sie beim ersten Login eigene Zugangsdaten fest, wenn Sie dazu aufgefordert werden — belassen Sie nicht die Standardwerte. Vorkonfigurierte Dashboards zeigen Blockproduktion, Transaktionsdurchsatz, Peer-Verbindungen und Ressourcennutzung an.

### REST-Health-Check

Die REST-API bietet einen schnellen Status-Endpunkt:

```
http://localhost:1317
```

---

## Port-Referenz

| Port    | Protokoll | Beschreibung                                       |
| ------- | --------- | -------------------------------------------------- |
| `26657` | TCP       | RPC — Transaktionen abfragen und broadcasten       |
| `26656` | TCP       | P2P — Peer-to-Peer-Netzwerkkommunikation           |
| `1317`  | HTTP      | REST-API — Chain-Zustand per HTTP abfragen         |
| `9090`  | gRPC      | gRPC-API — programmatischer Chain-Zugriff          |
| `8545`  | HTTP      | EVM JSON-RPC — Ethereum-kompatibles RPC (Chain-ID `9800`) |
| `8546`  | WebSocket | EVM WebSocket — EVM-Event-Abonnements in Echtzeit  |
| `8899`  | HTTP      | SVM RPC — Solana-kompatibles RPC (nur lesend; die SVM-Transaktions-Lane ist deaktiviert) |
| `26660` | HTTP      | Prometheus-Metriken-Endpunkt                       |

---

## Nächste Schritte

* [Wallet-Einrichtung](/getting-started/wallet-setup) — Konfigurieren Sie eine Wallet für das Testnet
* [Ihre erste Transaktion](/getting-started/first-transaction) — Senden Sie Ihre erste QOR-Überweisung
