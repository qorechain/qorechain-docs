---
slug: /developer-guide/running-a-node
title: Einen Node betreiben
sidebar_label: Einen Node betreiben
sidebar_position: 10
---

# Einen Node betreiben

Dieser Leitfaden behandelt den Betrieb einer **reinen Node**-Bereitstellung von QoreChain — eines Full- oder RPC-Nodes, der die Chain synchronisiert und Endpunkte für die Integration bereitstellt, **ohne** Validator-Aufgaben. Er richtet sich an Börsen (CEX), Wallet-Backends, Indexer und Integratoren, die zuverlässigen Lese-/Schreibzugriff auf das Netzwerk benötigen, aber keine Blöcke signieren.

:::note
Für Blockproduktion, Staking, Slashing und Pool-Klassifikation siehe stattdessen [Einen Validator betreiben](/developer-guide/running-a-validator). Eine reine Node-Bereitstellung hält niemals einen Validator-Konsensschlüssel und erscheint niemals im aktiven Set.
:::

:::warning
Mainnet-Seed-Nodes, persistente Peers, die Genesis-URL/-Prüfsumme sowie Snapshot-/State-Sync-RPC-Endpunkte werden mit jeder offiziellen Mainnet-Version veröffentlicht. **Beziehen Sie diese aktuellen Werte aus dem offiziellen Mainnet-Repository/-Release** und verifizieren Sie die Genesis-Prüfsumme vor dem Start. Die Platzhalter unten (`<MAINNET_SEED_NODE_ID>@<host>:26656`, `<MAINNET_GENESIS_URL>`, Snapshot-/State-Sync-URLs) müssen durch die echten veröffentlichten Werte ersetzt werden.
:::

---

## Node vs. Validator

| Aspekt              | Reine Node (dieser Leitfaden)                   | Validator                                  |
| ------------------- | ----------------------------------------------- | ------------------------------------------ |
| Konsensschlüssel    | Keiner                                           | ed25519-Konsensschlüssel (muss gesichert werden) |
| Blockproduktion     | Nein                                             | Ja — schlägt Blöcke vor und signiert sie   |
| Staking / Slashing  | Nicht zutreffend                                | Selbst-Delegation, Slashing-Risiko         |
| Hauptzweck          | RPC/REST/gRPC/EVM/SVM für Integrationen bereitstellen | Das Netzwerk absichern, Belohnungen verdienen |
| Öffentliche Exposition | RPC-/EVM-Endpunkte typischerweise exponiert   | Validator hinter Sentry-Nodes verborgen    |

---

## Zielnetzwerke

| Netzwerk | Chain-ID            | EVM-Chain-ID         | Hinweise                       |
| -------- | ------------------- | -------------------- | ------------------------------ |
| Mainnet  | `qorechain-vladi`   | `9801` (hex `0x2649`) | Primär — live seit 7. Juni 2026 |
| Testnet  | `qorechain-diana`   | `9800`               | Integrationen hier zuerst proben |

Ersetzen Sie in diesem gesamten Leitfaden die passende `--chain-id` für Ihr Zielnetzwerk. Die Beispiele verwenden standardmäßig das Mainnet.

---

## Empfohlene Hardware

| Profil                   | CPU      | RAM   | Festplatte (NVMe SSD)   | Netzwerk  |
| ------------------------ | -------- | ----- | ----------------------- | --------- |
| Bereinigter RPC-Node     | 4 Kerne  | 16 GB | 500 GB+                 | 100 Mbps+ |
| Full-/Archiv-Node        | 8 Kerne  | 32 GB | 2 TB+ (wächst mit der Zeit) | 1 Gbps    |
| Börsenintegration        | 8 Kerne  | 32 GB | 2 TB+ mit Reserve       | 1 Gbps    |

NVMe SSD wird dringend empfohlen — der Chain-Zustand und die EVM/SVM-Speicher sind E/A-intensiv. Archiv-Nodes (keine Bereinigung, vollständige tx-Indexierung) wachsen kontinuierlich; planen Sie die Festplatte mit Reserve und Überwachung.

---

## Bereitstellung

### Docker Compose

Eine reine Node-Bereitstellung mit Docker Compose. Pinnen Sie das Image-Tag auf die aktive Chain-Version (**v3.1.80** auf dem Mainnet) und binden Sie ein persistentes Volume für die Chain-Daten ein.

```yaml
# docker-compose.yml
services:
  qorechain-node:
    image: qorechain/qorechaind:v3.1.80
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

Initialisieren Sie das Datenverzeichnis einmal (Genesis- und Peer-Konfiguration werden unten behandelt) und starten Sie dann:

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
curl -o ~/.qorechaind/config/genesis.json <MAINNET_GENESIS_URL>
sha256sum ~/.qorechaind/config/genesis.json
# Compare against <MAINNET_GENESIS_SHA256> from the official release
```

:::note
`<MAINNET_GENESIS_URL>` und `<MAINNET_GENESIS_SHA256>` sind Platzhalter — beziehen Sie die aktuelle Genesis-URL und -Prüfsumme aus dem offiziellen Mainnet-Release/-Repository und verifizieren Sie die Prüfsumme vor dem Start.
:::

### 3. Seeds und Peers konfigurieren

Öffnen Sie `~/.qorechaind/config/config.toml`:

```toml
seeds = "<MAINNET_SEED_NODE_ID>@<host>:26656"
persistent_peers = "<PEER_NODE_ID_1>@<host1>:26656,<PEER_NODE_ID_2>@<host2>:26656"
```

:::note
Die Seed- und Peer-Werte sind Platzhalter. Beziehen Sie die aktuellen Mainnet-Seeds und persistenten Peers aus dem offiziellen Mainnet-Repository/-Release.
:::

### 4. Synchronisierung starten

```bash
qorechaind start
```

---

## Schneller Bootstrap

Die Synchronisierung von Genesis aus kann lange dauern. Verwenden Sie für Integrationen **State Sync** oder einen **Snapshot** für einen schnellen Kaltstart.

### State Sync

State Sync holt einen aktuellen Snapshot des Anwendungszustands von vertrauenswürdigen RPC-Servern, anstatt jeden Block erneut abzuspielen. Konfigurieren Sie den Abschnitt `[statesync]` in `config.toml`:

```toml
[statesync]
enable = true
rpc_servers = "<STATESYNC_RPC_1>,<STATESYNC_RPC_2>"
trust_height = <TRUSTED_BLOCK_HEIGHT>
trust_hash = "<TRUSTED_BLOCK_HASH>"
trust_period = "168h0m0s"
```

Ermitteln Sie eine aktuelle vertrauenswürdige Höhe und Hash von einem gesunden RPC-Endpunkt:

```bash
curl -s <STATESYNC_RPC_1>/block | jq '.result.block.header.height, .result.block_id.hash'
```

:::note
`<STATESYNC_RPC_1>`, `<STATESYNC_RPC_2>`, `<TRUSTED_BLOCK_HEIGHT>` und `<TRUSTED_BLOCK_HASH>` sind Platzhalter. Verwenden Sie die im offiziellen Mainnet-Release veröffentlichten State-Sync-RPC-Server und leiten Sie die Trust-Höhe/-Hash aus einem aktuellen Block ab.
:::

### Snapshot-Wiederherstellung

Alternativ laden Sie einen aktuellen Chain-Daten-Snapshot herunter und entpacken ihn über Ihr Datenverzeichnis:

```bash
curl -o snapshot.tar.lz4 <MAINNET_SNAPSHOT_URL>
lz4 -dc snapshot.tar.lz4 | tar -xf - -C ~/.qorechaind/
qorechaind start
```

:::note
`<MAINNET_SNAPSHOT_URL>` ist ein Platzhalter. Beziehen Sie Snapshot-URLs (und jede zugehörige Prüfsumme) aus dem offiziellen Mainnet-Release/-Repository und verifizieren Sie die Prüfsumme vor dem Entpacken.
:::

---

## Pruning und Indexierung

Stimmen Sie Pruning und Transaktionsindexierung auf Ihre Integration ab. Börsen, die eine vollständige Transaktionshistorie benötigen, sollten mit minimalem Pruning und einem aktivierten Transaktionsindexer betrieben werden.

### Pruning (`app.toml`)

```toml
# Keep recent state only — smallest disk footprint
pruning = "default"

# Keep everything — required for archive / full historical queries
# pruning = "nothing"
```

| `pruning`   | Verhalten                                | Anwendungsfall                    |
| ----------- | ---------------------------------------- | --------------------------------- |
| `default`   | Behält aktuellen Zustand, bereinigt den Rest | RPC-Node, Guthaben-/Zustandsabfragen |
| `nothing`   | Behält den gesamten historischen Zustand | Archiv-Node, vollständige Historie |
| `custom`    | Vom Betreiber definierte Behalte-/Intervallwerte | Abgestimmte Aufbewahrung           |

### Transaktionsindexierung (`config.toml`)

```toml
[tx_index]
indexer = "kv"
```

Setzen Sie `indexer = "kv"` (oder einen reichhaltigeren Indexer), damit Transaktionen nach Hash und Event abfragbar sind — essenziell für Börsen, die Ein- und Auszahlungen abgleichen. Setzen Sie `indexer = "null"` nur, wenn Sie keine historischen tx-Abfragen benötigen.

---

## Endpunkte für die Integration exponieren

Aktivieren und binden Sie die API-Server, die Integratoren benötigen, in `app.toml`:

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

| Endpunkt     | Port   | Verwenden für                                          |
| ------------ | ------ | ------------------------------------------------------ |
| RPC          | `26657` | Transaktionen übertragen, Blöcke/Status abfragen       |
| REST         | `1317`  | HTTP-Abfragen des Chain-Zustands                       |
| gRPC         | `9090`  | Programmatischer Zugriff mit hohem Durchsatz           |
| EVM JSON-RPC | `8545`  | Ethereum-kompatible Integrationen (Chain-ID `9801`)    |
| EVM WS       | `8546`  | EVM-Event-Abonnements                                  |
| SVM RPC      | `8899`  | Solana-kompatible Integrationen                        |

:::warning
Exponieren Sie RPC, EVM JSON-RPC oder gRPC niemals direkt ins öffentliche Internet ohne einen Reverse-Proxy, Rate-Limiting, Authentifizierung und eine Firewall. Binden Sie nur hinter einer kontrollierten Ingress-Schicht an `0.0.0.0`.
:::

---

## Zustands- und Synchronisierungsüberwachung

### Synchronisierungsstatus

```bash
curl -s localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — synchronisiert noch.
* `false` — vollständig synchronisiert und stellt den aktuellen Zustand bereit.

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

Scrapen Sie diese mit einem beliebigen Prometheus-kompatiblen Collector. Wenn Sie den Docker-Compose-Überwachungsstack betreiben, ist Grafana unter `http://localhost:3001` verfügbar — legen Sie beim ersten Login Ihre eigenen Anmeldedaten fest. Verfolgen Sie Blockhöhen-Lag, Peer-Anzahl und Ressourcennutzung; alarmieren Sie, wenn `catching_up` `true` bleibt oder die Peer-Anzahl auf null fällt.

### EVM-Endpunktprüfung

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# Expect "0x2649" (9801) on mainnet
```

---

## Bewährte Betriebspraktiken

1. **Pinnen Sie die Chain-Version.** Führen Sie das aktive Tag aus (**v3.1.80** auf dem Mainnet) und verfolgen Sie offizielle Releases für koordinierte Upgrades.

2. **Betreiben Sie redundante Nodes.** Betreiben Sie mindestens zwei Nodes hinter einem Load Balancer, damit ein einzelner Neustart oder eine Neusynchronisierung den Integrationsverkehr nicht unterbricht.

3. **Verifizieren Sie Genesis und Snapshots.** Validieren Sie immer den Genesis-SHA-256 und jede Snapshot-Prüfsumme gegen das offizielle Release, bevor Sie starten.

4. **Schützen Sie öffentliche Endpunkte.** Stellen Sie RPC/EVM/gRPC einen Reverse-Proxy, Rate-Limiting und eine Firewall voran. Exponieren Sie niemals unauthentifiziertes Schreib-RPC ins Internet.

5. **Passen Sie das Pruning an den Bedarf an.** Verwenden Sie `pruning = "nothing"` plus `tx_index = "kv"` für Börsen, die die vollständige Ein-/Auszahlungshistorie abgleichen; verwenden Sie `default` für leichtgewichtige Abfragen.

6. **Überwachen Sie die Synchronisierung kontinuierlich.** Alarmieren Sie bei Blockhöhen-Lag, null Peers und einem in `catching_up` feststeckenden Node.

Für ultraleichten Lesezugriff ohne Betrieb eines Full-Nodes siehe die **Light-Node**-Dokumentation.

---

## Nächste Schritte

* [Verbindung zum Mainnet](/getting-started/connecting-to-mainnet) — Mainnet-Genesis, Peers und Verbindungsdetails
* [Einen Validator betreiben](/developer-guide/running-a-validator) — Blockproduktionsaufgaben hinzufügen
* [Aus dem Quellcode bauen](/developer-guide/building-from-source) — Das `qorechaind`-Binary bauen
* **Light Node** — Ultraleichter Nur-Lese-Zugriff (Dokumentation in Kürze)
