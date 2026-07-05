---
slug: /getting-started/connecting-to-mainnet
title: Verbindung zum Mainnet
sidebar_label: Verbindung zum Mainnet
sidebar_position: 3
---

# Verbindung zum Mainnet

Treten Sie dem live laufenden QoreChain-Vladi-Mainnet bei, indem Sie Ihren Node mit der offiziellen Genesis-Datei, den Peers und den Netzwerkeinstellungen konfigurieren.

:::note
Diese Seite behandelt das **`qorechain-vladi`**-Mainnet (EVM-Chain-ID **9801**, hexadezimal `0x2649`), live seit dem **7. Juni 2026, 23:59 UTC**, mit Chain-Version **v3.1.85** auf Cosmos SDK v0.53. Für das **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**) siehe [Verbindung zum Testnet](/getting-started/connecting-to-testnet) — proben Sie dort Ihr Setup, bevor Sie live gehen.
:::

## Öffentliche Endpunkte

Wenn Sie lediglich **die Chain abfragen oder Transaktionen broadcasten** möchten, benötigen Sie keinen eigenen Node — die öffentlichen Endpunkte sind:

| Dienst | URL |
|---|---|
| Konsensus-RPC | `https://rpc.qore.host` (WebSocket: `wss://rpc.qore.host/websocket`) |
| Cosmos REST (LCD) | `https://api.qore.host` |
| EVM JSON-RPC | `https://evm.qore.host` (Chain-ID `9801`) |
| SVM JSON-RPC (nur lesend) | `https://svm.qore.host` |
| Block-Explorer | [explore.qore.network](https://explore.qore.network) |

Für hohe Lasten oder Produktions-Workloads (Börsen, Indexer) betreiben Sie einen eigenen Node, wie unten beschrieben.

---

## Installation

Installieren Sie das `qorechaind`-Binary entweder aus dem offiziellen vorkompilierten Bundle oder durch Kompilieren aus dem Quellcode.

### Vorkompiliertes Binary-Bundle (linux/amd64)

Das offizielle Release-Bundle enthält `qorechaind` sowie die benötigten Shared Libraries (`libqorepqc.so`, `libqoresvm.so`, `libwasmvm.x86_64.so`):

```bash
curl -fsSL https://download.qore.host/qorechaind-v3.1.83-linux-amd64.tar.gz -o qore.tgz
# Verify the checksum before installing:
sha256sum qore.tgz
# fa035b3699e92d755f47445cbf7dde4e1f6c224343008546aa159b7eb46a805c

tar xzf qore.tgz
sudo install -m0755 qorechaind /usr/local/bin/
sudo mkdir -p /opt/qorechain/lib && sudo cp lib/*.so /opt/qorechain/lib/
export LD_LIBRARY_PATH=/opt/qorechain/lib
```

Versionierte Bundles werden unter [download.qore.host](https://download.qore.host) veröffentlicht; jedes Release wird mit seiner SHA-256-Prüfsumme ausgeliefert — installieren Sie stets das **neueste** veröffentlichte Bundle.

:::caution Halten Sie Ihren Node aktuell
Full Nodes müssen der Chain-Version des Netzwerks folgen (derzeit **v3.1.85**). Ein veralteter Node kann neuere Transaktionstypen nicht dekodieren (zum Beispiel mit `eth_secp256k1` signierte Transaktionen, eingeführt in v3.1.83) und stellt die Synchronisation ein, sobald eine solche Transaktion in einem Block erscheint.
:::

### Aus dem Quellcode kompilieren

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

Die vollständigen Voraussetzungen (Go 1.26+, CGO, Rust-Toolchain, native Bibliotheken) finden Sie unter [Building from Source](/developer-guide/building-from-source).

### Node initialisieren

```bash
qorechaind init my-node --chain-id qorechain-vladi
```

Dies erstellt die Standard-Konfigurations- und Datenverzeichnisse unter `~/.qorechaind/`.

---

## Genesis herunterladen

Ersetzen Sie Ihre lokale Genesis-Datei durch die offizielle Mainnet-Genesis:

```bash
curl -fsSL https://download.qore.host/genesis.json -o ~/.qorechaind/config/genesis.json
```

Dieselbe Datei wird auch live von der Chain selbst ausgeliefert — Sie können den Download dagegen gegenprüfen:

```bash
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

Diese Datei definiert den Anfangszustand des Vladi-Mainnets, einschließlich des Genesis-Validator-Sets, der Token-Zuteilungen (TGE bei Genesis) und der Modulparameter.

---

## Peers konfigurieren

Bearbeiten Sie Ihre Node-Konfiguration, um sich mit den öffentlichen Mainnet-Sentry-Nodes zu verbinden.

Öffnen Sie `~/.qorechaind/config/config.toml` und setzen Sie das Feld `persistent_peers`:

```toml
persistent_peers = "0c9b83801ad519671daf19387b6635f72cb9ddd3@44.200.237.4:26656,83cab9ae05d17073c4e45c25d2422b25fff71fe7@35.174.136.254:26656"
```

Setzen Sie außerdem den minimalen Gaspreis in `~/.qorechaind/config/app.toml` (die Gebührenuntergrenze des Netzwerks beträgt **0.1uqor**):

```toml
minimum-gas-prices = "0.1uqor"
```

### Empfohlene Einstellungen

Zusätzlich empfiehlt es sich, Folgendes in `config.toml` anzupassen:

```toml
[mempool]
size = 5000

[consensus]
timeout_propose = "3s"
timeout_commit = "5s"
```

Diese Werte sind auf die Blockzeiten und den Durchsatz des Vladi-Mainnets abgestimmt.

---

## Schneller Bootstrap (Snapshot)

Die Synchronisation ab Genesis kann lange dauern. Ein aktueller Chain-Daten-Snapshot wird unter [download.qore.host](https://download.qore.host) veröffentlicht:

```bash
curl -fsSL https://download.qore.host/qore-vladi-snapshot-90833.tar.gz -o snapshot.tar.gz
# Verify before extracting:
sha256sum snapshot.tar.gz
# ebe469796ad96e692877846c7bfd8513d773321c77e415b1358790b7c4e53396

tar xzf snapshot.tar.gz -C ~/.qorechaind/
```

Snapshots werden unter höhengestempelten Dateinamen veröffentlicht — prüfen Sie [download.qore.host](https://download.qore.host) auf den aktuellsten. Alternativ können Sie **State Sync** verwenden — den vollständigen Ablauf finden Sie unter [Running a Node](/developer-guide/running-a-node).

---

## Node starten

Starten Sie Ihren Node, um mit der Synchronisation mit dem Netzwerk zu beginnen:

```bash
qorechaind start --minimum-gas-prices=0.1uqor
```

Der Node verbindet sich mit Peers und beginnt, Blöcke herunterzuladen (ab Genesis oder ab der Snapshot-Höhe, falls Sie einen Snapshot eingespielt haben).

---

## Synchronisationsstatus prüfen

Überprüfen Sie, ob Ihr Node zum neuesten Block aufholt:

```bash
curl localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — Der Node synchronisiert noch. Warten Sie, bis er aufgeholt hat.
* `false` — Der Node ist vollständig synchronisiert und verarbeitet neue Blöcke.

Sie können auch die aktuelle Blockhöhe prüfen:

```bash
curl localhost:26657/status | jq '.result.sync_info.latest_block_height'
```

Bestätigen Sie, dass Sie im richtigen Netzwerk sind — das Feld `network` sollte `qorechain-vladi` melden:

```bash
curl localhost:26657/status | jq '.result.node_info.network'
```

---

## Monitoring

QoreChain stellt mehrere Endpunkte zur Überwachung von Node-Gesundheit und -Leistung bereit.

### Prometheus-Metriken

Rohmetriken sind verfügbar unter:

```
http://localhost:26660/metrics
```

Diese Metriken können von jedem Prometheus-kompatiblen Collector gescrapt werden.

### Grafana-Dashboards

Beim Betrieb über Docker Compose ist Grafana verfügbar unter:

```
http://localhost:3001
```

Legen Sie beim ersten Login eigene Zugangsdaten fest, wenn Sie dazu aufgefordert werden — belassen Sie es nicht bei den Standardwerten. Vorkonfigurierte Dashboards zeigen Blockproduktion, Transaktionsdurchsatz, Peer-Verbindungen und Ressourcennutzung an.

### REST-Health-Check

Die REST-API bietet einen schnellen Status-Endpunkt:

```
http://localhost:1317
```

---

## Port-Referenz

| Port    | Protokoll | Beschreibung                                             |
| ------- | --------- | ------------------------------------------------------- |
| `26657` | TCP       | RPC — Transaktionen abfragen und broadcasten            |
| `26656` | TCP       | P2P — Peer-to-Peer-Netzwerkkommunikation                |
| `1317`  | HTTP      | REST-API — Chain-Zustand per HTTP abfragen              |
| `9090`  | gRPC      | gRPC-API — programmatischer Chain-Zugriff               |
| `8545`  | HTTP      | EVM JSON-RPC — Ethereum-kompatibles RPC (Chain-ID `9801`) |
| `8546`  | WebSocket | EVM WebSocket — EVM-Event-Abonnements in Echtzeit       |
| `8899`  | HTTP      | SVM RPC — Solana-kompatibles RPC                        |
| `26660` | HTTP      | Prometheus-Metriken-Endpunkt                            |

---

## Netzwerk-Fakten

| Feld               | Wert                                        |
| ------------------ | ------------------------------------------- |
| Chain-ID           | `qorechain-vladi`                           |
| EVM-Chain-ID       | `9801` (hexadezimal `0x2649`)               |
| Chain-Version      | v3.1.85                                     |
| Live seit          | 7. Juni 2026, 23:59 UTC                     |
| Token              | QOR (`uqor`, 10^6 Mikroeinheiten = 1 QOR)   |
| Minimaler Gaspreis | `0.1uqor`                                   |
| Account-Präfix     | `qor`                                       |
| Validator-Präfix   | `qorvaloper`                                |
| SDK                | Cosmos SDK v0.53                            |

---

## Nächste Schritte

* [Running a Node](/developer-guide/running-a-node) — Einen Full/RPC-Node für Börsen und Integratoren betreiben
* [Exchange & Integrator Guide](/developer-guide/exchange-integration) — Einzahlungen, Auszahlungen und Monitoring
* [Running a Validator](/developer-guide/running-a-validator) — Einen Validator erstellen und betreiben
* [Wallet Setup](/getting-started/wallet-setup) — Eine Wallet für das Mainnet konfigurieren
* [Your First Transaction](/getting-started/first-transaction) — Ihre erste QOR-Überweisung senden
* [Verbindung zum Testnet](/getting-started/connecting-to-testnet) — Dem Diana-Testnet zum kostenlosen Testen beitreten
* [Networks](/appendix/networks) — Chain-IDs, Ports und die vollständige Netzwerk-Referenz
