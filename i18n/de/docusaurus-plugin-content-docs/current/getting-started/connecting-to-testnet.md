---
slug: /getting-started/connecting-to-testnet
title: Verbindung zum Testnet
sidebar_label: Verbindung zum Testnet
sidebar_position: 4
---

# Verbindung zum Testnet

Treten Sie dem laufenden QoreChain-Diana-Testnet bei, indem Sie Ihren Node mit der korrekten Genesis-Datei, den richtigen Peers und Netzwerkeinstellungen konfigurieren.

:::note
Diese Seite behandelt das **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**). Das Mainnet (**`qorechain-vladi`**, EVM-Chain-ID **9801**) ist seit dem 7. Juni 2026 live und hat eine eigene Seite **Verbindung zum Mainnet** mit separater Genesis, eigenen Peers und Verbindungsdetails.
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

## Genesis herunterladen

Ersetzen Sie Ihre lokale Genesis-Datei durch die offizielle Testnet-Genesis, die live von der Chain selbst ausgeliefert wird:

```bash
curl -s https://rpc-testnet.qore.host/genesis | jq '.result.genesis' \
  > ~/.qorechaind/config/genesis.json
```

Diese Datei definiert den Anfangszustand des Diana-Testnets, einschließlich des Validator-Sets, der Token-Zuteilungen und der Modulparameter.

:::caution
Das Diana-Testnet wird regelmäßig **re-genesist** (auf Höhe 0 zurückgesetzt), wenn Pre-Release-Builds ausgerollt werden. Wenn Ihr Node nach einem Reset nicht mehr synchronisiert, laden Sie die Genesis erneut herunter und starten Sie mit einem frischen Datenverzeichnis.
:::

---

## Peers konfigurieren

Bearbeiten Sie Ihre Node-Konfiguration, um sich mit bestehenden Testnet-Peers zu verbinden.

Fragen Sie einen aktuellen Peer direkt aus dem Netzwerk ab und setzen Sie anschließend das Feld `persistent_peers` in `~/.qorechaind/config/config.toml`:

```bash
# node id + listen address of the public testnet node
curl -s https://rpc-testnet.qore.host/status | jq -r '.result.node_info.id'
```

Setzen Sie außerdem die Gebührenuntergrenze in `~/.qorechaind/config/app.toml` (das Testnet verwendet denselben Mindest-Gaspreis von **0.1uqor** wie das Mainnet):

```toml
minimum-gas-prices = "0.1uqor"
```

### Empfohlene Einstellungen

Zusätzlich können Sie folgende Werte in der `config.toml` anpassen:

```toml
[mempool]
size = 5000

[consensus]
timeout_propose = "3s"
timeout_commit = "5s"
```

Diese Werte sind auf die Blockzeiten und den Durchsatz des Diana-Testnets abgestimmt.

---

## Node starten

Starten Sie Ihren Node, um mit der Synchronisierung mit dem Netzwerk zu beginnen:

```bash
./qorechaind start
```

Der Node verbindet sich mit Peers und beginnt, Blöcke ab der Genesis herunterzuladen. Die Dauer der initialen Synchronisierung hängt von der aktuellen Chain-Höhe und Ihrer Netzwerkgeschwindigkeit ab.

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
| `8899`  | HTTP      | SVM RPC — Solana-kompatibles RPC                   |
| `26660` | HTTP      | Prometheus-Metriken-Endpunkt                       |

---

## Nächste Schritte

* [Wallet-Einrichtung](/getting-started/wallet-setup) — Konfigurieren Sie eine Wallet für das Testnet
* [Ihre erste Transaktion](/getting-started/first-transaction) — Senden Sie Ihre erste QOR-Überweisung
