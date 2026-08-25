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
Binaries, Genesis und Snapshots werden unter [download.qore.host](https://download.qore.host) mit SHA-256-Prüfsummen veröffentlicht. **Verifizieren Sie Prüfsummen immer vor dem Installieren oder Entpacken**, und verifizieren Sie Einzahlungen ausschließlich gegen Ihren eigenen, synchronisierten Node.
:::

:::note Source of truth: das Live-Manifest
Das aktuelle Binary, Genesis, Peers, Seeds und ein State-Sync-Trust-Point werden als JSON-Manifest veröffentlicht, das live aktualisiert wird — hinterlegen Sie in Ihren Installationsskripten keine fest codierte Binary-Version, Prüfsumme oder Snapshot-Dateinamen, da diese veralten, sobald ein neues Release erscheint:

- Mainnet: `https://download.qore.host/mainnet/latest.json`
- Testnet: `https://download.qore.host/testnet/latest.json`

Die Felder des Manifests umfassen `binary` (URL + sha256), `genesis` (URL + sha256 + sizeBytes), `peers`, `seeds`, `p2pPort`, `stateSync` (ein stündlich aktualisierter Trust-Point) und `minCompatible`. Die Installations- und Beitrittsschritte unten rufen dieses Manifest ab und verwenden dessen aktuelle Werte.
:::

:::caution v3.1.92 oder höher für einen frisch beitretenden Node erforderlich
Ein Node, der ab Genesis synchronisiert oder aus einem Archiv/Snapshot repliziert, muss auf **v3.1.92 oder höher** sein — ältere Versionen (selbst wenn das Feld `minCompatible` des Manifests noch nicht entsprechend aktualisiert wurde) halten beim Replay am ersten Block mit einer Transaktion an, aufgrund eines mittlerweile behobenen Gas-Metering-Bugs.

**Das Manifest selbst kann hinter dieser Untergrenze zurückliegen** — es wird zuerst im Testnet und erst nach einer Einlaufphase im Mainnet befördert, und zum Zeitpunkt der Erstellung dieses Textes zeigt das `binary.url`-Feld des Mainnet-Manifests noch auf einen Build vor v3.1.92. Prüfen Sie das `"version"`-Feld des Manifests, bevor Sie `binary.url` vertrauen; liegt es hinter v3.1.92, beziehen Sie das Binary stattdessen von den [qorechain-core GitHub Releases](https://github.com/qorechain/qorechain-core/releases) (prüfen Sie dessen veröffentlichte Prüfsumme auf dieselbe Weise) oder bauen Sie aus dem Quellcode, statt sich auf das Manifest zu verlassen.
:::

---

## Node vs. Validator

| Aspekt              | Reiner Node (dieser Leitfaden)                          | Validator                                        |
| -------------------- | ----------------------------------------------------- | ------------------------------------------------ |
| Konsensschlüssel     | Keiner                                                 | ed25519-Konsensschlüssel (muss gesichert werden)  |
| Blockproduktion      | Nein                                                   | Ja — schlägt Blöcke vor und signiert sie          |
| Staking / Slashing   | Nicht anwendbar                                        | Selbstdelegation, Slashing-Risiko                 |
| Hauptzweck           | RPC/REST/gRPC/EVM/SVM für Integrationen bereitstellen  | Netzwerk sichern, Rewards verdienen               |
| Öffentliche Erreichbarkeit | RPC/EVM-Endpunkte typischerweise exponiert       | Validator hinter Sentry-Nodes verborgen           |

---

## Zielnetzwerke

| Netzwerk | Chain-ID            | EVM-Chain-ID          | Hinweise                           |
| -------- | ------------------- | --------------------- | ----------------------------------- |
| Mainnet  | `qorechain-vladi`   | `9801` (hex `0x2649`) | Primär — live seit 7. Juni 2026     |
| Testnet  | `qorechain-diana`   | `9800`                | Integrationen zuerst hier erproben  |

Setzen Sie in diesem Leitfaden durchgehend die passende `--chain-id` für Ihr Zielnetzwerk ein. Die Beispiele verwenden standardmäßig das Mainnet.

---

## Empfohlene Hardware

| Profil                    | CPU      | RAM   | Festplatte (NVMe-SSD)        | Netzwerk  |
| ------------------------- | -------- | ----- | ----------------------------- | --------- |
| Geprunter RPC-Node        | 4 Kerne  | 16 GB | 500 GB+                       | 100 Mbps+ |
| Full-/Archive-Node        | 8 Kerne  | 32 GB | 2 TB+ (wächst mit der Zeit)   | 1 Gbps    |
| Börsen-Integration        | 8 Kerne  | 32 GB | 2 TB+ mit Reserve             | 1 Gbps    |

Eine NVMe-SSD wird dringend empfohlen — der Chain-State und die EVM-/SVM-Stores sind I/O-intensiv. Archive-Nodes (kein Pruning, vollständige Tx-Indexierung) wachsen kontinuierlich; stellen Sie Speicherplatz mit Reserve und Monitoring bereit.

---

## Deployment

### Docker Compose

Ein reines Node-Deployment mit Docker Compose. Es gibt derzeit noch kein öffentlich veröffentlichtes `qorechaind`-Image zum Herunterladen — bauen Sie eines selbst aus dem `Dockerfile` des Repositorys und taggen Sie es auf die live laufende Chain-Version (**v3.1.92** im Mainnet), und mounten Sie dann ein persistentes Volume für die Chain-Daten:

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
docker build -t qorechain-node:v3.1.92 .
```

```yaml
# docker-compose.yml
services:
  qorechain-node:
    image: qorechain-node:v3.1.92
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

Initialisieren Sie das Datenverzeichnis einmalig (Genesis- und Peer-Konfiguration werden weiter unten behandelt) und starten Sie dann:

```bash
docker compose up -d
docker compose logs -f qorechain-node
```

### systemd

Für eine Bare-Metal-Installation betreiben Sie `qorechaind` unter systemd:

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

### 2. Manifest abrufen

```bash
curl -s https://download.qore.host/mainnet/latest.json -o latest.json
# testnet: https://download.qore.host/testnet/latest.json
```

Verwenden Sie diese Datei als Quelle für die Binary-, Genesis- und Peer-Werte in den folgenden Schritten — prüfen Sie `jq -r .minCompatible latest.json`, denken Sie aber daran, dass die **v3.1.92-Untergrenze** oben auch dann gilt, wenn dieses Feld hinterherhinkt.

### 3. Genesis herunterladen und verifizieren

```bash
GENESIS_URL=$(jq -r .genesis.url latest.json)
GENESIS_SHA256=$(jq -r .genesis.sha256 latest.json)

curl -fsSL "$GENESIS_URL" -o ~/.qorechaind/config/genesis.json
echo "${GENESIS_SHA256}  $HOME/.qorechaind/config/genesis.json" | sha256sum -c -

# Cross-verify against the genesis served live by the chain:
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

### 4. Peers und die Gebührenuntergrenze konfigurieren

Lesen Sie die aktuellen Peers und Seeds aus dem Manifest, statt Node-IDs und Hosts fest zu codieren — diese rotieren:

```bash
PEERS=$(jq -r '.peers | join(",")' latest.json)
SEEDS=$(jq -r '.seeds | join(",")' latest.json)
```

Öffnen Sie `~/.qorechaind/config/config.toml` und setzen Sie `persistent_peers` (und `seeds`) auf diese Werte:

```toml
persistent_peers = "<value of $PEERS>"
seeds = "<value of $SEEDS>"
```

Setzen Sie anschließend den minimalen Gaspreis in `~/.qorechaind/config/app.toml` (Netzwerk-Gebührenuntergrenze: **0.1uqor**):

```toml
minimum-gas-prices = "0.1uqor"
```

### 5. Synchronisierung starten

```bash
qorechaind start --minimum-gas-prices=0.1uqor
```

---

## Schneller Bootstrap

Die Synchronisierung ab Genesis kann sehr lange dauern. Verwenden Sie für Integrationen **State Sync** oder einen **Snapshot** für einen schnellen Kaltstart.

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

Entnehmen Sie `trust_height` / `trust_hash` dem Feld `stateSync` des Manifests — es wird stündlich aktualisiert und ist damit die bevorzugte Quelle:

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

Als Fallback/Alternative können Sie eine vertrauenswürdige Höhe und deren Hash selbst über den öffentlichen RPC ableiten:

```bash
curl -s https://rpc.qore.host/block | jq -r '.result.block.header.height, .result.block_id.hash'
```

### Snapshot-Wiederherstellung

Alternativ laden Sie den veröffentlichten Chain-Daten-Snapshot herunter, verifizieren dessen Prüfsumme und entpacken ihn über Ihr Datenverzeichnis. Das Manifest führt derzeit keinen Snapshot-Verweis, prüfen Sie daher die Live-Auflistung unter [download.qore.host](https://download.qore.host) auf den aktuellen Dateinamen und die aktuelle Prüfsumme, statt sie fest zu codieren:

```bash
# Substitute the current filename and checksum from the download.qore.host listing
curl -fsSL https://download.qore.host/<current-snapshot-filename>.tar.gz -o snapshot.tar.gz
sha256sum snapshot.tar.gz   # compare against the checksum published alongside it

tar xzf snapshot.tar.gz -C ~/.qorechaind/
qorechaind start --minimum-gas-prices=0.1uqor
```

:::note
Snapshots werden unter **höhengestempelten Dateinamen** veröffentlicht, die regelmäßig wechseln — prüfen Sie [download.qore.host](https://download.qore.host) auf den aktuellsten Snapshot und dessen SHA-256-Prüfsumme, und verifizieren Sie immer vor dem Entpacken. Denken Sie daran, dass das **v3.1.92-Minimum** oben auch für den Replay aus einem Snapshot gilt.
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

| `pruning`   | Verhalten                                        | Anwendungsfall                        |
| ----------- | ------------------------------------------------ | -------------------------------------- |
| `default`   | Behält aktuellen State, prunt den Rest           | RPC-Node, Kontostands-/State-Abfragen  |
| `nothing`   | Behält den gesamten historischen State           | Archive-Node, vollständige Historie    |
| `custom`    | Vom Betreiber definierte Keep-/Intervall-Werte   | Feinabgestimmte Aufbewahrung           |

### Transaktionsindexierung (`config.toml`)

```toml
[tx_index]
indexer = "kv"
```

Setzen Sie `indexer = "kv"` (oder einen umfangreicheren Indexer), damit Transaktionen per Hash und Event abfragbar sind — essenziell für Börsen, die Ein- und Auszahlungen abgleichen. Setzen Sie `indexer = "null"` nur, wenn Sie keine historischen Tx-Abfragen benötigen.

---

## Endpunkte für Integrationen bereitstellen

Aktivieren und binden Sie in `app.toml` die API-Server, die Integratoren benötigen:

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

| Endpunkt     | Port    | Verwendung für                                               |
| ------------ | ------- | -------------------------------------------------------------- |
| RPC          | `26657` | Broadcasting von Transaktionen, Abfragen von Blöcken/Status    |
| REST         | `1317`  | HTTP-Abfragen des Chain-States                                 |
| gRPC         | `9090`  | Programmatischer Zugriff mit hohem Durchsatz                   |
| EVM JSON-RPC | `8545`  | Ethereum-kompatible Integrationen (Chain-ID `9801`)             |
| EVM WS       | `8546`  | EVM-Event-Subscriptions                                        |
| SVM RPC      | `8899`  | Solana-kompatible Integrationen                                 |

:::warning
Exponieren Sie RPC, EVM JSON-RPC oder gRPC niemals direkt ins öffentliche Internet ohne Reverse Proxy, Rate Limiting, Authentifizierung und Firewall. Binden Sie an `0.0.0.0` nur hinter einer kontrollierten Ingress-Schicht.
:::

---

## Health- und Sync-Monitoring

### Sync-Status

```bash
curl -s localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — synchronisiert noch.
* `false` — vollständig synchronisiert und liefert den aktuellen State.

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

Scrapen Sie diese mit einem beliebigen Prometheus-kompatiblen Collector. Wenn Sie den Docker-Compose-Monitoring-Stack betreiben, ist Grafana unter `http://localhost:3001` erreichbar — legen Sie beim ersten Login eigene Zugangsdaten fest. Überwachen Sie Blockhöhen-Rückstand, Peer-Anzahl und Ressourcennutzung; alarmieren Sie, wenn `catching_up` dauerhaft `true` bleibt oder die Peer-Anzahl auf null fällt.

### EVM-Endpunkt-Prüfung

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# Expect "0x2649" (9801) on mainnet
```

---

## Bewährte Betriebspraktiken

1. **Pinnen Sie die Chain-Version.** Betreiben Sie das live laufende Tag (**v3.1.92** im Mainnet) und verfolgen Sie offizielle Releases für koordinierte Upgrades.

2. **Betreiben Sie redundante Nodes.** Betreiben Sie mindestens zwei Nodes hinter einem Load Balancer, damit ein einzelner Neustart oder Resync den Integrationsverkehr nicht unterbricht.

3. **Verifizieren Sie Genesis und Snapshots.** Validieren Sie die Genesis-SHA-256 und jede Snapshot-Prüfsumme immer gegen das offizielle Release, bevor Sie starten.

4. **Schützen Sie öffentliche Endpunkte.** Stellen Sie RPC/EVM/gRPC einen Reverse Proxy, Rate Limiting und eine Firewall voran. Exponieren Sie niemals unauthentifiziertes Schreib-RPC ins Internet.

5. **Passen Sie das Pruning an den Bedarf an.** Verwenden Sie `pruning = "nothing"` plus `tx_index = "kv"` für Börsen, die die vollständige Ein-/Auszahlungshistorie abgleichen; verwenden Sie `default` für leichtgewichtige Abfragen.

6. **Überwachen Sie die Synchronisierung kontinuierlich.** Alarmieren Sie bei Blockhöhen-Rückstand, null Peers und einem Node, der in `catching_up` feststeckt.

Für ultraleichten Lesezugriff ohne den Betrieb eines Full Nodes siehe die **Light Node**-Dokumentation.

---

## Fehlerbehebung

### Ein bereits vor dem Upgrade angehaltener Node läuft nach einem Binary-Wechsel nicht weiter

Wenn Ihr Node **bereits vor** dem Upgrade seines Binaries angehalten hatte oder feststeckte, reicht es nicht aus, einfach das neue Binary einzusetzen und neu zu starten — der Node hat veraltete ABCI-Ergebnisse aus dem alten Lauf im Cache und führt den Block, der das Anhalten verursacht hat, nicht erneut aus. Setzen Sie explizit zurück, bevor Sie neu starten:

```bash
qorechaind rollback --home <HOME>
systemctl restart <unit>
```

Der Befehl lautet `qorechaind rollback` (ein Top-Level-Subcommand) — es gibt kein Subcommand `comet rollback` und keine `--hard`-Flag dafür.

### Snapshot-Wiederherstellung landet in einer Crash-Loop wegen einer fehlenden `priv_validator_state.json`

Ein veröffentlichtes Archiv/Snapshot enthält **nicht** `data/priv_validator_state.json`, und der Node verweigert ohne diese Datei den Start. Falls sie nach einer Snapshot-Wiederherstellung fehlt, erstellen Sie sie — aber **nur, wenn noch keine existiert**. Überschreiben Sie niemals eine echte: Auf einem Validator ist diese Datei die Anti-Double-Signing-Sicherung, und ein Überschreiben riskiert ein Double-Sign.

```bash
echo '{"height":"0","round":0,"step":0}' > <HOME>/data/priv_validator_state.json
```

---

## Nächste Schritte

* [Verbindung mit dem Mainnet](/getting-started/connecting-to-mainnet) — Mainnet-Genesis, Peers und Verbindungsdetails
* [Einen Validator betreiben](/developer-guide/running-a-validator) — Blockproduktions-Aufgaben hinzufügen
* [Aus dem Quellcode bauen](/developer-guide/building-from-source) — Das `qorechaind`-Binary bauen
* **Light Node** — Ultraleichter Nur-Lese-Zugriff (Dokumentation folgt in Kürze)
