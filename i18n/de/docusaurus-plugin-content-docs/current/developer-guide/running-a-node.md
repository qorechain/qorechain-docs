---
slug: /developer-guide/running-a-node
title: Einen Node betreiben
sidebar_label: Einen Node betreiben
sidebar_position: 10
---

# Einen Node betreiben

Dieser Leitfaden behandelt den Betrieb eines **reinen Node-Deployments** von QoreChain — ein Full- oder RPC-Node, der die Chain synchronisiert und Endpunkte für Integrationen bereitstellt, **ohne** Validator-Aufgaben. Er richtet sich an Börsen (CEX), Wallet-Backends, Indexer und Integratoren, die zuverlässigen Lese-/Schreibzugriff auf das Netzwerk benötigen, aber keine Blöcke signieren.

:::note
Für Blockproduktion, Staking, Slashing und Pool-Klassifizierung siehe stattdessen [Einen Validator betreiben](/developer-guide/running-a-validator). Ein reines Node-Deployment hält niemals einen Validator-Konsensschlüssel und erscheint niemals im aktiven Set.
:::

:::warning
Binaries, Genesis und Snapshots werden unter [download.qore.host](https://download.qore.host) mit SHA-256-Prüfsummen veröffentlicht. **Verifizieren Sie Prüfsummen immer vor der Installation oder dem Entpacken**, und verifizieren Sie Einzahlungen ausschließlich gegen Ihren eigenen synchronisierten Node.
:::

---

## Node vs. Validator

| Aspekt              | Reiner Node (dieser Leitfaden)                  | Validator                                  |
| ------------------- | ----------------------------------------------- | ------------------------------------------ |
| Konsensschlüssel    | Keiner                                          | ed25519-Konsensschlüssel (muss gesichert werden) |
| Blockproduktion     | Nein                                            | Ja — schlägt Blöcke vor und signiert sie   |
| Staking / Slashing  | Nicht zutreffend                                | Selbstdelegation, Slashing-Risiko          |
| Hauptzweck          | RPC/REST/gRPC/EVM/SVM für Integrationen bereitstellen | Das Netzwerk sichern, Rewards verdienen |
| Öffentliche Erreichbarkeit | RPC/EVM-Endpunkte typischerweise exponiert | Validator hinter Sentry-Nodes verborgen    |

---

## Zielnetzwerke

| Netzwerk | Chain-ID            | EVM-Chain-ID         | Hinweise                       |
| -------- | ------------------- | -------------------- | ------------------------------ |
| Mainnet  | `qorechain-vladi`   | `9801` (hex `0x2649`) | Primär — live seit 7. Juni 2026 |
| Testnet  | `qorechain-diana`   | `9800`               | Proben Sie Integrationen zuerst hier |

Ersetzen Sie die passende `--chain-id` für Ihr Zielnetzwerk in diesem gesamten Leitfaden. Die Beispiele verwenden standardmäßig das Mainnet.

---

## Empfohlene Hardware

| Profil                   | CPU      | RAM   | Festplatte (NVMe SSD)   | Netzwerk  |
| ------------------------ | -------- | ----- | ----------------------- | --------- |
| Pruned RPC-Node          | 4 Kerne  | 16 GB | 500 GB+                 | 100 Mbps+ |
| Full-/Archiv-Node        | 8 Kerne  | 32 GB | 2 TB+ (wächst mit der Zeit) | 1 Gbps |
| Börsenintegration        | 8 Kerne  | 32 GB | 2 TB+ mit Reserve       | 1 Gbps    |

NVMe SSD wird dringend empfohlen — der Chain-State und die EVM-/SVM-Stores sind I/O-intensiv. Archiv-Nodes (kein Pruning, vollständige Tx-Indexierung) wachsen kontinuierlich; planen Sie Festplattenkapazität mit Reserve und Monitoring ein.

---

## Deployment

### Docker Compose

Ein reines Node-Deployment mit Docker Compose. Pinnen Sie das Image-Tag auf die aktuelle Chain-Version (**v3.1.82** auf dem Mainnet) und mounten Sie ein persistentes Volume für die Chain-Daten.

```yaml
# docker-compose.yml
services:
  qorechain-node:
    image: qorechain/qorechaind:v3.1.82
    container_name: qorechain-node
    restart: unless-stopped
    command: ["start", "--home", "/root/.qorechaind"]
    volumes:
      - qorechain-data:/root/.qorechaind
    ports:
      - "26657:26657"   # RPC
      - "26656:26656"   # P2P
      - "1317:1317"     # REST
      - "9090:9090"     # gRPC
      - "8545:8545"     # EVM JSON-RPC
      - "8546:8546"     # EVM WebSocket
      - "8899:8899"     # SVM RPC
      - "26660:26660"   # Prometheus

volumes:
  qorechain-data:
```

Initialisieren Sie das Datenverzeichnis einmalig (Genesis- und Peer-Konfiguration werden unten behandelt) und starten Sie dann:

```bash
docker compose up -d
docker compose logs -f qorechain-node
```

### systemd

Für eine Bare-Metal-Installation führen Sie `qorechaind` unter systemd aus:

```ini
# /etc/systemd/system/qorechaind.service
[Unit]
Description=QoreChain node
After=network-online.target
Wants=network-online.target

[Service]
User=qorechain
ExecStart=/usr/local/bin/qorechaind start --home /var/lib/qorechaind
Restart=on-failure
RestartSec=5
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now qorechaind
sudo journalctl -u qorechaind -f
```

---

## Dem Netzwerk beitreten

### 1. Initialisieren

```bash
qorechaind init my-node --chain-id qorechain-vladi
```

### 2. Genesis herunterladen und verifizieren

```bash
curl -fsSL https://download.qore.host/genesis.json -o ~/.qorechaind/config/genesis.json

# Cross-verify against the genesis served live by the chain:
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

### 3. Peers und die Gebührenuntergrenze konfigurieren

Öffnen Sie `~/.qorechaind/config/config.toml` und setzen Sie die öffentlichen Mainnet-Sentry-Peers:

```toml
persistent_peers = "0c9b83801ad519671daf19387b6635f72cb9ddd3@44.200.237.4:26656,83cab9ae05d17073c4e45c25d2422b25fff71fe7@35.174.136.254:26656"
```

Setzen Sie anschließend den minimalen Gaspreis in `~/.qorechaind/config/app.toml` (Netzwerk-Gebührenuntergrenze: **0.1uqor**):

```toml
minimum-gas-prices = "0.1uqor"
```

### 4. Synchronisierung starten

```bash
qorechaind start --minimum-gas-prices=0.1uqor
```

---

## Schneller Bootstrap

Die Synchronisierung ab Genesis kann lange dauern. Verwenden Sie für Integrationen **State Sync** oder einen **Snapshot** für einen schnellen Kaltstart.

### State Sync

State Sync lädt einen aktuellen Snapshot des Anwendungszustands von vertrauenswürdigen RPC-Servern, anstatt jeden Block erneut abzuspielen. Konfigurieren Sie den Abschnitt `[statesync]` in `config.toml`:

```toml
[statesync]
enable = true
rpc_servers = "https://rpc.qore.host:443,https://rpc.qore.host:443"
trust_height = <TRUSTED_BLOCK_HEIGHT>
trust_hash = "<TRUSTED_BLOCK_HASH>"
trust_period = "168h0m0s"
```

Ermitteln Sie eine aktuelle vertrauenswürdige Höhe und den zugehörigen Hash über das öffentliche RPC:

```bash
curl -s https://rpc.qore.host/block | jq -r '.result.block.header.height, .result.block_id.hash'
```

### Snapshot-Wiederherstellung

Alternativ laden Sie den veröffentlichten Chain-Daten-Snapshot herunter, verifizieren dessen Prüfsumme und entpacken ihn über Ihr Datenverzeichnis:

```bash
curl -fsSL https://download.qore.host/qore-vladi-snapshot-90833.tar.gz -o snapshot.tar.gz
sha256sum snapshot.tar.gz
# ebe469796ad96e692877846c7bfd8513d773321c77e415b1358790b7c4e53396

tar xzf snapshot.tar.gz -C ~/.qorechaind/
qorechaind start --minimum-gas-prices=0.1uqor
```

:::note
Snapshots werden unter **höhengestempelten Dateinamen** veröffentlicht — prüfen Sie [download.qore.host](https://download.qore.host) auf den aktuellsten Snapshot und dessen SHA-256-Prüfsumme, und verifizieren Sie immer vor dem Entpacken.
:::

---

## Pruning und Indexierung

Stimmen Sie Pruning und Transaktionsindexierung auf Ihre Integration ab. Börsen, die eine vollständige Transaktionshistorie benötigen, sollten mit minimalem Pruning und aktiviertem Transaktionsindexer laufen.

### Pruning (`app.toml`)

```toml
# Keep recent state only — smallest disk footprint
pruning = "default"

# Keep everything — required for archive / full historical queries
# pruning = "nothing"
```

| `pruning`   | Verhalten                                | Anwendungsfall                    |
| ----------- | ---------------------------------------- | --------------------------------- |
| `default`   | Behält aktuellen State, prunt den Rest   | RPC-Node, Guthaben-/State-Abfragen |
| `nothing`   | Behält den gesamten historischen State   | Archiv-Node, vollständige Historie |
| `custom`    | Vom Betreiber definierte Keep-/Intervall-Werte | Angepasste Aufbewahrung     |

### Transaktionsindexierung (`config.toml`)

```toml
[tx_index]
indexer = "kv"
```

Setzen Sie `indexer = "kv"` (oder einen umfangreicheren Indexer), damit Transaktionen per Hash und Event abfragbar sind — unerlässlich für Börsen, die Ein- und Auszahlungen abgleichen. Setzen Sie `indexer = "null"` nur, wenn Sie keine historischen Tx-Abfragen benötigen.

---

## Endpunkte für Integrationen bereitstellen

Aktivieren und binden Sie die von Integratoren benötigten API-Server in `app.toml`:

```toml
[api]
enable = true
address = "tcp://0.0.0.0:1317"

[grpc]
enable = true
address = "0.0.0.0:9090"

[json-rpc]
enable = true
address = "0.0.0.0:8545"
ws-address = "0.0.0.0:8546"
api = "eth,net,web3,qor"
```

Und den RPC-Listener in `config.toml`:

```toml
[rpc]
laddr = "tcp://0.0.0.0:26657"
```

| Endpunkt     | Port   | Verwendung für                                          |
| ------------ | ------ | ------------------------------------------------------ |
| RPC          | `26657` | Broadcasten von Transaktionen, Abfragen von Blöcken/Status |
| REST         | `1317`  | HTTP-Abfragen des Chain-States                         |
| gRPC         | `9090`  | Programmatischer Zugriff mit hohem Durchsatz           |
| EVM JSON-RPC | `8545`  | Ethereum-kompatible Integrationen (Chain-ID `9801`)    |
| EVM WS       | `8546`  | EVM-Event-Abonnements                                  |
| SVM RPC      | `8899`  | Solana-kompatible Integrationen                        |

:::warning
Exponieren Sie RPC, EVM JSON-RPC oder gRPC niemals ohne Reverse Proxy, Rate Limiting, Authentifizierung und Firewall direkt im öffentlichen Internet. Binden Sie an `0.0.0.0` nur hinter einer kontrollierten Ingress-Schicht.
:::

---

## Health- und Sync-Monitoring

### Sync-Status

```bash
curl -s localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — synchronisiert noch.
* `false` — vollständig synchronisiert und stellt den aktuellen State bereit.

```bash
# Latest height and network
curl -s localhost:26657/status | jq '.result.sync_info.latest_block_height, .result.node_info.network'
```

Das Feld `network` sollte `qorechain-vladi` (Mainnet) oder `qorechain-diana` (Testnet) melden.

### Prometheus und Grafana

QoreChain stellt Prometheus-Metriken auf Port **26660** bereit:

```
http://localhost:26660/metrics
```

Scrapen Sie diese mit einem beliebigen Prometheus-kompatiblen Collector. Wenn Sie den Docker-Compose-Monitoring-Stack betreiben, ist Grafana unter `http://localhost:3001` verfügbar — setzen Sie beim ersten Login eigene Zugangsdaten. Überwachen Sie Blockhöhen-Rückstand, Peer-Anzahl und Ressourcennutzung; alarmieren Sie, wenn `catching_up` dauerhaft `true` bleibt oder die Peer-Anzahl auf null fällt.

### EVM-Endpunkt-Check

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# Expect "0x2649" (9801) on mainnet
```

---

## Operative Best Practices

1. **Pinnen Sie die Chain-Version.** Betreiben Sie das aktuelle Tag (**v3.1.82** auf dem Mainnet) und verfolgen Sie offizielle Releases für koordinierte Upgrades.

2. **Betreiben Sie redundante Nodes.** Betreiben Sie mindestens zwei Nodes hinter einem Load Balancer, damit ein einzelner Neustart oder Resync den Integrationsverkehr nicht unterbricht.

3. **Verifizieren Sie Genesis und Snapshots.** Validieren Sie die Genesis-SHA-256 und jede Snapshot-Prüfsumme immer gegen das offizielle Release, bevor Sie starten.

4. **Schützen Sie öffentliche Endpunkte.** Setzen Sie vor RPC/EVM/gRPC einen Reverse Proxy, Rate Limiting und eine Firewall. Exponieren Sie niemals unauthentifiziertes Schreib-RPC im Internet.

5. **Passen Sie Pruning an den Bedarf an.** Verwenden Sie `pruning = "nothing"` plus `tx_index = "kv"` für Börsen, die die vollständige Ein-/Auszahlungshistorie abgleichen; verwenden Sie `default` für leichtgewichtige Abfragen.

6. **Überwachen Sie die Synchronisierung kontinuierlich.** Alarmieren Sie bei Blockhöhen-Rückstand, null Peers und einem Node, der in `catching_up` feststeckt.

Für ultraleichten Lesezugriff ohne Betrieb eines Full-Nodes siehe die **Light Node**-Dokumentation.

---

## Nächste Schritte

* [Verbindung zum Mainnet](/getting-started/connecting-to-mainnet) — Mainnet-Genesis, Peers und Verbindungsdetails
* [Einen Validator betreiben](/developer-guide/running-a-validator) — Blockproduktions-Aufgaben hinzufügen
* [Aus dem Quellcode bauen](/developer-guide/building-from-source) — Das `qorechaind`-Binary bauen
* **Light Node** — Ultraleichter, rein lesender Zugriff (Dokumentation folgt in Kürze)
