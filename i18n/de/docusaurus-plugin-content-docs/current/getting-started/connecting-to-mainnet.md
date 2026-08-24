---
slug: /getting-started/connecting-to-mainnet
title: Verbindung zum Mainnet
sidebar_label: Verbindung zum Mainnet
sidebar_position: 3
---

# Verbindung zum Mainnet

Treten Sie dem live laufenden QoreChain-Vladi-Mainnet bei, indem Sie Ihren Node mit der offiziellen Genesis-Datei, den Peers und den Netzwerkeinstellungen konfigurieren.

:::note
Diese Seite behandelt das **`qorechain-vladi`**-Mainnet (EVM-Chain-ID **9801**, hexadezimal `0x2649`), live seit **7. Juni 2026 23:59 UTC** mit Chain-Version **v3.1.92** auf Cosmos SDK v0.53. Für das **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**) siehe [Verbindung zum Testnet](/getting-started/connecting-to-testnet) und proben Sie dort Ihr Setup, bevor Sie live gehen.
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

Die maßgebliche Quelle für das aktuelle Binary ist das **Mainnet-Manifest**, eine JSON-Datei, die live unter `https://download.qore.host/mainnet/latest.json` aktualisiert wird. Sie enthält die aktuelle Binary-URL und den SHA-256-Wert, die aktuelle Genesis-URL/den SHA-256-Wert/die Größe, die aktuellen Peers und Seeds, den P2P-Port, einen State-Sync-Vertrauenspunkt sowie die minimal kompatible Chain-Version. Rufen Sie sie ab und verwenden Sie ihre Werte, anstatt eine Binary-Version oder Prüfsumme in Ihren Installationsskripten fest zu hinterlegen — diese veralten, sobald ein neues Release erscheint:

```bash
curl -s https://download.qore.host/mainnet/latest.json -o latest.json

BINARY_URL=$(jq -r .binary.url latest.json)
BINARY_SHA256=$(jq -r .binary.sha256 latest.json)

curl -fsSL "$BINARY_URL" -o qore.tgz
echo "${BINARY_SHA256}  qore.tgz" | sha256sum -c -

tar xzf qore.tgz
sudo install -m0755 qorechaind /usr/local/bin/
sudo mkdir -p /opt/qorechain/lib && sudo cp lib/*.so /opt/qorechain/lib/
export LD_LIBRARY_PATH=/opt/qorechain/lib
```

Das Bundle enthält `qorechaind` sowie die benötigten Shared Libraries (`libqorepqc.so`, `libqoresvm.so`, `libwasmvm.x86_64.so`).

:::caution Halten Sie Ihren Node aktuell — v3.1.92 oder neuer für einen frischen Sync erforderlich
Full Nodes müssen der live laufenden Chain-Version des Netzwerks folgen — installieren Sie stets das Binary, auf das das Manifest verweist, und pinnen Sie kein altes fest. Unabhängig vom Feld `minCompatible` des Manifests ist **v3.1.92 oder neuer für einen Node erforderlich, der frisch (ab Genesis) beitritt oder sich von einem Halt erholt** — ältere Versionen können einen vollständigen Sync aufgrund eines inzwischen behobenen Gas-Metering-Fehlers nicht abschließen, der das Replay am ersten Block mit einer Transaktion stoppt. Ein Node, der bereits aufgeholt hat und eine ältere Version ausführt, sollte dennoch bei nächster Gelegenheit aktualisiert werden, da ein veralteter Node neuere Transaktionstypen nicht dekodieren kann und die Synchronisation einstellt, sobald ein solcher in einem Block erscheint.
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

Ersetzen Sie Ihre lokale Genesis-Datei durch die offizielle Mainnet-Genesis, unter Verwendung der URL und des SHA-256-Werts aus dem oben abgerufenen Manifest:

```bash
GENESIS_URL=$(jq -r .genesis.url latest.json)
GENESIS_SHA256=$(jq -r .genesis.sha256 latest.json)

curl -fsSL "$GENESIS_URL" -o ~/.qorechaind/config/genesis.json
echo "${GENESIS_SHA256}  $HOME/.qorechaind/config/genesis.json" | sha256sum -c -
```

Dieselbe Datei wird auch live von der Chain selbst ausgeliefert — Sie können den Download dagegen gegenprüfen:

```bash
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

Diese Datei definiert den Anfangszustand des Vladi-Mainnets, einschließlich des Genesis-Validator-Sets, der Token-Zuteilungen (TGE bei Genesis) und der Modulparameter.

---

## Peers konfigurieren

Bearbeiten Sie Ihre Node-Konfiguration, um sich mit den öffentlichen Mainnet-Sentry-Nodes zu verbinden. Lesen Sie die aktuellen Peer- und Seed-Listen aus dem Manifest, anstatt Node-IDs und Hosts fest zu hinterlegen — diese rotieren:

```bash
PEERS=$(jq -r '.peers | join(",")' latest.json)
SEEDS=$(jq -r '.seeds | join(",")' latest.json)
```

Öffnen Sie `~/.qorechaind/config/config.toml` und setzen Sie die Felder `persistent_peers` (und `seeds`) auf diese Werte:

```toml
persistent_peers = "<value of $PEERS>"
seeds = "<value of $SEEDS>"
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

## Schneller Bootstrap (Snapshot oder State Sync)

Die Synchronisation ab Genesis kann lange dauern. Das Feld `stateSync` des Manifests enthält ein stündlich aktualisiertes Paar aus Vertrauenshöhe und -hash — verwenden Sie es, um State Sync zu konfigurieren, anstatt eine Höhe manuell nachzuschlagen:

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

Setzen Sie anschließend den Abschnitt `[statesync]` von `config.toml` mit diesen Werten — den vollständigen Ablauf, einschließlich eines manuellen, RPC-basierten Fallbacks, falls Sie einen Vertrauenspunkt selbst ableiten müssen, finden Sie unter [Running a Node](/developer-guide/running-a-node).

Ein Chain-Daten-Snapshot wird ebenfalls unter [download.qore.host](https://download.qore.host) veröffentlicht. Prüfen Sie dort die aktuelle Auflistung auf den neuesten Snapshot-Dateinamen und dessen veröffentlichte Prüfsumme — hinterlegen Sie keinen Dateinamen oder keine Höhe fest, da ein neuer Snapshot den alten regelmäßig ablöst:

```bash
# Substitute the current filename and checksum from the download.qore.host listing
curl -fsSL https://download.qore.host/<current-snapshot-filename>.tar.gz -o snapshot.tar.gz
sha256sum snapshot.tar.gz   # compare against the checksum published alongside it

tar xzf snapshot.tar.gz -C ~/.qorechaind/
```

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
| `26657` | TCP       | RPC — Transaktionen abfragen und broadcasten             |
| `26656` | TCP       | P2P — Peer-to-Peer-Netzwerkkommunikation                 |
| `1317`  | HTTP      | REST-API — Chain-Zustand per HTTP abfragen               |
| `9090`  | gRPC      | gRPC-API — programmatischer Chain-Zugriff                |
| `8545`  | HTTP      | EVM JSON-RPC — Ethereum-kompatibles RPC (Chain-ID `9801`) |
| `8546`  | WebSocket | EVM WebSocket — EVM-Event-Abonnements in Echtzeit        |
| `8899`  | HTTP      | SVM RPC — Solana-kompatibles RPC                          |
| `26660` | HTTP      | Prometheus-Metriken-Endpunkt                              |

---

## Netzwerk-Fakten

| Feld              | Wert                                    |
| ----------------- | ---------------------------------------- |
| Chain-ID          | `qorechain-vladi`                        |
| EVM-Chain-ID      | `9801` (hexadezimal `0x2649`)            |
| Chain-Version     | v3.1.92                                  |
| Live seit         | 7. Juni 2026 23:59 UTC                   |
| Token             | QOR (`uqor`, 10^6 Mikroeinheiten = 1 QOR) |
| Minimaler Gaspreis | `0.1uqor`                                |
| Account-Präfix    | `qor`                                    |
| Validator-Präfix  | `qorvaloper`                             |
| SDK               | Cosmos SDK v0.53                         |

---

## Nächste Schritte

* [Running a Node](/developer-guide/running-a-node) — Einen Full/RPC-Node für Börsen und Integratoren betreiben
* [Exchange & Integrator Guide](/developer-guide/exchange-integration) — Einzahlungen, Auszahlungen und Monitoring
* [Running a Validator](/developer-guide/running-a-validator) — Einen Validator erstellen und betreiben
* [Wallet Setup](/getting-started/wallet-setup) — Eine Wallet für das Mainnet konfigurieren
* [Your First Transaction](/getting-started/first-transaction) — Ihre erste QOR-Überweisung senden
* [Verbindung zum Testnet](/getting-started/connecting-to-testnet) — Dem Diana-Testnet zum kostenlosen Testen beitreten
* [Networks](/appendix/networks) — Chain-IDs, Ports und die vollständige Netzwerk-Referenz
