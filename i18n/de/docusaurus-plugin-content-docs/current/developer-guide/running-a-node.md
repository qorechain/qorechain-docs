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

:::caution Verwenden Sie das Release, das das Manifest nennt: v3.2.5 im Mainnet, v3.2.6 im Testnet
Ein Node, der ab Genesis synchronisiert oder aus einem Snapshot repliziert, durchläuft mehrere Governance-Upgrades (siehe [Upgrades](#upgrades) unten). Installieren Sie daher immer das Binary, auf das das Manifest verweist: Es enthält jeden Upgrade-Handler. Im **Mainnet** sind `minCompatible` und `version` des Manifests beide `3.2.5` (angewendet auf Höhe 3,906,833 am 29. Oktober 2026, Governance-Vorschlag 14), ein jetzt beitretender Node benötigt also v3.2.5: Ein älteres Binary stoppt auf einer Upgrade-Höhe, die es nicht kennt. Das Release ist das Bundle `qorechaind-v3.2.5-b2-linux-amd64.tar.gz` (97.965.547 Bytes, SHA-256 `4448db60b5ec50009f3943ca1fb5849f9a2790966b3ea433a8c3d55a85115382`, am 30. Oktober 2026 aus dem Manifest gelesen; das Live-Manifest ist die maßgebliche Quelle). Es enthält `qorechaind` und `lib/` mit `libqorepqc.so`, `libqoresvm.so` und `libwasmvm.x86_64.so`. Ein Node, der noch auf v3.2.4 läuft, hält auf Höhe 3,906,833 mit `UPGRADE "v3.2.5" NEEDED` an: Installieren Sie das Bundle und starten Sie neu, sein State bleibt erhalten. Es ist kein weiteres Mainnet-Upgrade angesetzt (`current_plan` ist `null`, geprüft am 30. Oktober 2026); wenn das Manifest ein neueres Release nennt, ist das das Binary, das zu installieren ist. Im **Testnet** sind `minCompatible` und `version` des Manifests beide `3.2.6` (`upgradeHeight` 8,970,638; v3.2.5 wurde auf Höhe 8,890,800 am 26. Oktober 2026 angewendet und v3.2.6 am 27. Oktober 2026), ein dem Testnet beitretender Node benötigt also das v3.2.6-Binary. Betreiben Sie kein Testnet-Binary gegen das Mainnet oder umgekehrt: Jedes Verzeichnis führt sein eigenes Release (siehe [Upgrades](#upgrades)). Das Manifest wird bewusst gestaffelt befördert (zuerst Testnet, danach Mainnet nach einer Einlaufphase). Prüfen Sie daher sein Feld `"version"` gegen `minCompatible`, bevor Sie `binary.url` vertrauen.

Ein aus dem öffentlichen Quellcode gebautes Binary (der Community-Build) verweigert den Start in beiden öffentlichen Netzwerken (v3.2.3 und später): Es kann keine Post-Quanten-Signaturen verifizieren und die Blöcke der Netzwerke nicht originalgetreu replizieren. Verwenden Sie ausschließlich das Release-Archiv.

Ab v3.2.1 sind zwei Einstellungen wichtig: Halten Sie die Systemuhr per NTP synchronisiert (der Node stoppt, wenn seine Uhr um mehr als 60 Sekunden abweicht), und setzen Sie `evm-chain-id` in `app.toml` (siehe [Node-Limits](#node-limits)).
:::

---

## Node vs. Validator

| Aspekt              | Reiner Node (dieser Leitfaden)                          | Validator                                  |
| ------------------- | ----------------------------------------------- | ------------------------------------------ |
| Konsensschlüssel    | Keiner                                          | ed25519-Konsensschlüssel (muss gesichert werden)    |
| Blockproduktion     | Nein                                            | Ja — schlägt Blöcke vor und signiert sie            |
| Staking / Slashing  | Nicht anwendbar                                 | Selbstdelegation, Slashing-Risiko             |
| Hauptzweck          | RPC/REST/gRPC/EVM (und schreibgeschütztes SVM) für Integrationen bereitstellen | Netzwerk sichern (Staking-Rewards fallen an) |
| Öffentliche Erreichbarkeit | RPC/EVM-Endpunkte typischerweise exponiert | Validator hinter Sentry-Nodes verborgen       |

---

## Zielnetzwerke

| Netzwerk | Chain-ID            | EVM-Chain-ID         | Hinweise                          |
| -------- | ------------------- | -------------------- | ------------------------------ |
| Mainnet  | `qorechain-vladi`   | `9801` (hex `0x2649`) | Primär — live seit 7. Juni 2026; Node-Release v3.2.5 (seit 29. Okt. 2026) |
| Testnet  | `qorechain-diana`   | `9800`               | Integrationen zuerst hier erproben; Node-Release v3.2.6 (seit 27. Okt. 2026) |

Setzen Sie in diesem Leitfaden durchgehend die passende `--chain-id` für Ihr Zielnetzwerk ein. Die Beispiele verwenden standardmäßig das Mainnet.

---

## Empfohlene Hardware {#recommended-hardware}

| Profil                   | CPU      | RAM   | Festplatte (NVMe-SSD)   | Netzwerk  |
| ------------------------ | -------- | ----- | ----------------------- | --------- |
| Geprunter RPC-Node       | 4 Kerne  | 16 GB | 500 GB+                 | 100 Mbps+ |
| Full-/Archive-Node       | 8 Kerne  | 32 GB | 2 TB+ (wächst mit der Zeit) | 1 Gbps    |
| Börsen-Integration       | 8 Kerne  | 32 GB | 2 TB+ mit Reserve       | 1 Gbps    |

Eine NVMe-SSD wird dringend empfohlen: Der Chain-State und die EVM-/SVM-Stores sind I/O-intensiv. Die obigen Festplattenangaben sind großzügig. Gemessen im Mainnet (27. Oktober 2026): Ein Validator, der per State Sync beigetreten ist, mit `pruning = "custom"` (keep-recent 100000) und `indexer = "null"`, belegt nach zwei Monaten etwa 10 GB, und ein Node mit Standard-Pruning, der seit Genesis läuft, belegt nach vier Monaten etwa 100 bis 130 GB. Die Dimensionierung für Validatoren steht unter [Einen Validator betreiben: Hardware](/developer-guide/running-a-validator#hardware). Archive-Nodes (kein Pruning, vollständige Tx-Indexierung) wachsen kontinuierlich; stellen Sie Speicherplatz mit Reserve und Monitoring bereit.

---

## Deployment

### Docker Compose

Ein reines Node-Deployment mit Docker Compose. Es gibt kein öffentlich veröffentlichtes `qorechaind`-Image zum Herunterladen (unter der Docker-Hub-Organisation des Projekts ist nichts veröffentlicht). Das `Dockerfile` im öffentlichen Repository baut das **Community**-Binary (keine Post-Quanten-Bibliothek, Stub-Keeper): Das eignet sich für die lokale Entwicklung, kann aber weder dem Mainnet noch dem Testnet folgen, und seit v3.2.3 verweigert es dort den Start. Bauen Sie für einen Netzwerk-Node ein eigenes Image aus dem in `latest.json` genannten **Release-Archiv**, taggen Sie es auf die Release-Version (**v3.2.5** im Mainnet, **v3.2.6** im Testnet, zum Zeitpunkt der Erstellung) und mounten Sie dann ein persistentes Volume für die Chain-Daten:

```bash
# Fetch and verify the release archive (see "Joining the Network" below for the manifest steps)
curl -s https://download.qore.host/mainnet/latest.json -o latest.json
curl -fsSL "$(jq -r .binary.url latest.json)" -o qore.tgz
echo "$(jq -r .binary.sha256 latest.json)  qore.tgz" | sha256sum -c -
mkdir release && tar xzf qore.tgz -C release

cat > release/Dockerfile <<'EOF'
FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates curl jq && rm -rf /var/lib/apt/lists/*
COPY qorechaind /usr/local/bin/qorechaind
COPY lib/ /opt/qorechain/lib/
ENV LD_LIBRARY_PATH=/opt/qorechain/lib
ENTRYPOINT ["qorechaind"]
EOF
docker build -t qorechain-node:v3.2.5 release/
```

Das Archiv enthält `qorechaind` und ein Verzeichnis `lib/` mit den zugehörigen Shared Libraries (`libqorepqc.so`, `libqoresvm.so`, `libwasmvm.x86_64.so`); das obige Image ist, wie das Release-Archiv, nur für `linux/amd64`.

```yaml
# docker-compose.yml
services:
  qorechain-node:
    image: qorechain-node:v3.2.5
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
      - "8899:8899"     # SVM RPC (read-only: SVM transactions are disabled)
      - "26660:26660"   # Prometheus

volumes:
  qorechain-data:
```

Initialisieren Sie das Datenverzeichnis einmalig (zum Beispiel `docker compose run --rm qorechain-node init my-node --chain-id qorechain-vladi --home /root/.qorechaind`; Genesis- und Peer-Konfiguration werden weiter unten behandelt) und starten Sie dann:

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

### 2. Manifest abrufen {#fetch-the-manifest}

```bash
curl -s https://download.qore.host/mainnet/latest.json -o latest.json
# testnet: https://download.qore.host/testnet/latest.json
```

Verwenden Sie diese Datei als Quelle für die Binary-, Genesis- und Peer-Werte in den folgenden Schritten — prüfen Sie `jq -r .minCompatible latest.json` und betreiben Sie mindestens dieses Release (das empfohlene ist `jq -r .version latest.json`).

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

`qorechaind init <moniker> --chain-id qorechain-vladi` schreibt außerdem die EVM-Chain-ID des Netzwerks in `app.toml` (siehe [Node-Limits](#node-limits)); prüfen Sie sie bei einem Home-Verzeichnis, das vor langer Zeit initialisiert wurde.

### 5. Synchronisierung starten

```bash
qorechaind start --minimum-gas-prices=0.1uqor
```

---

## Schneller Bootstrap

Die Synchronisierung ab Genesis kann sehr lange dauern. Verwenden Sie **State Sync** als Standardweg zum Beitreten; ein **Snapshot** ist nur ein Fallback (der Mainnet-Snapshot stammt vom 21. August 2026, und das Testnet veröffentlicht keinen).

### State Sync

State Sync lädt einen aktuellen Snapshot des Anwendungszustands von vertrauenswürdigen RPC-Servern, anstatt jeden Block erneut abzuspielen. Konfigurieren Sie den Abschnitt `[statesync]` in `config.toml`:

```toml
[statesync]
enable = true
rpc_servers = "https://rpc.qore.host:443,https://<a second RPC you run or trust>:26657"
trust_height = <TRUSTED_BLOCK_HEIGHT>
trust_hash = "<TRUSTED_BLOCK_HASH>"
trust_period = "168h0m0s"
```

Entnehmen Sie `trust_height` / `trust_hash` dem Feld `stateSync` des Manifests. Es wird stündlich aktualisiert und ist damit die bevorzugte Quelle:

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

:::warning Zwei verschiedene RPC-Server
State Sync gleicht den Trust Point mit **zwei** RPC-Servern ab. Die Liste `stateSync.rpcServers` des Manifests nennt im Mainnet `https://rpc.qore.host` zweimal (und im Testnet `https://rpc-testnet.qore.host` zweimal): Zwei identische Einträge erfüllen die Anzahl, machen den Abgleich aber wirkungslos. Fügen Sie einen zweiten RPC hinzu, den Sie selbst betreiben oder dem Sie unabhängig vertrauen, und vergleichen Sie den Trust-Hash mit einer zweiten Quelle, zum Beispiel `curl -s "https://<second-rpc>/block?height=$TRUST_HEIGHT" | jq -r .result.block_id.hash`, was `$TRUST_HASH` entsprechen muss.
:::

Als Fallback/Alternative können Sie eine vertrauenswürdige Höhe und deren Hash selbst über den öffentlichen RPC ableiten:

```bash
curl -s https://rpc.qore.host/block | jq -r '.result.block.header.height, .result.block_id.hash'
```

### Snapshot-Wiederherstellung

Alternativ laden Sie den veröffentlichten Chain-Daten-Snapshot herunter, verifizieren dessen Prüfsumme und entpacken ihn über Ihr Datenverzeichnis. Im Mainnet nennt das Objekt `snapshot` des Manifests die URL, die Blockhöhe (`height`), die Größe und die SHA-256-Prüfsumme. **Die Snapshot-URL im Testnet-Manifest liefert derzeit `404` (für das Testnet ist kein Snapshot veröffentlicht), verwenden Sie dort also State Sync.** Lesen Sie `snapshot.height`, bevor Sie den Mainnet-Snapshot verwenden: Er ist ein einzelnes Archiv von etwa 27 GB, und ein alter bedeutet eine lange Aufholphase. Der derzeit veröffentlichte Mainnet-Snapshot stammt vom 21. August 2026 (Höhe 1,966,629): Er liegt vor den Upgrade-Höhen von v3.1.94, v3.2.0, v3.2.2, v3.2.3 und v3.2.4, ein daraus wiederhergestellter Node muss also etwa zwei Monate an Blöcken mit dem Release-Binary replizieren, das das Manifest nennt. State Sync ist fast immer die bessere Wahl.

```bash
SNAP_URL=$(jq -r .snapshot.url latest.json)
SNAP_SHA256=$(jq -r .snapshot.sha256 latest.json)
curl -fsSL "$SNAP_URL" -o snapshot.tar.gz
echo "${SNAP_SHA256}  snapshot.tar.gz" | sha256sum -c -

tar xzf snapshot.tar.gz -C ~/.qorechaind/
qorechaind start --minimum-gas-prices=0.1uqor
```

:::note
Die Felder `snapshot.height` und `snapshot.ts` des Manifests zeigen, wie aktuell das Archiv ist, und State Sync (oben) ist meist schneller als ein Download von 27 GB. Verifizieren Sie vor dem Entpacken immer die Prüfsumme, und verwenden Sie beim Replay aus einem Snapshot ein Node-Release, das jeden Upgrade-Handler enthält (siehe den Hinweis am Anfang dieser Seite).
:::

---

## Upgrades {#upgrades}

Konsensänderungen kommen als **koordinierte Governance-Upgrades**: Ein angenommener Vorschlag nennt einen Plan (zum Beispiel `v3.2.3`) und eine Blockhöhe. Das Release-Binary enthält die Upgrade-Handler; auf der Plan-Höhe muss jeder Node es ausführen, und ein Node, der noch das vorherige Binary nutzt, **hält auf dieser Höhe an** (das ist das beabsichtigte Verhalten des Upgrade-Moduls). Das Manifest verrät, um welche Art Release es sich handelt: `upgradeType` ist `height` bei einem koordinierten Upgrade (mit gesetztem `upgradeHeight`) und `rolling` bei einem node-lokalen Release, das Node für Node ausgetauscht werden kann. Installieren Sie das neue Binary **vor** der Höhe; falls Ihr Node zuvor angehalten hat, tauschen Sie das Binary aus und starten Sie neu (siehe den Rollback-Hinweis unter [Fehlerbehebung](#troubleshooting)).

| Release | Mainnet `qorechain-vladi` | Testnet `qorechain-diana` |
| ------- | ------------------------- | ------------------------- |
| v3.1.94 | Höhe 2,122,074 | nicht angewendet |
| v3.2.0 | Höhe 2,981,742 | Höhe 5,920,000 |
| v3.2.1 | node-lokal, keine Höhe | node-lokal |
| v3.2.2 | Höhe 3,556,788 (16. Okt. 2026) | Höhe 6,905,034 (2. Okt. 2026) |
| v3.2.3 | Höhe 3,662,051 (20. Okt. 2026, Governance-Vorschlag 11) | Höhe 8,003,746 (15. Okt. 2026) |
| v3.2.4 | Höhe 3,742,566 (23. Okt. 2026, Governance-Vorschlag 13) | Höhe 8,337,253 (19. Okt. 2026, Governance-Vorschlag 13) |
| v3.2.5 | Höhe 3,906,833 (29. Okt. 2026, Governance-Vorschlag 14) | Höhe 8,890,800 (26. Okt. 2026) |
| v3.2.6 | nicht angewendet | Höhe 8,970,638 (27. Okt. 2026) |

**Was ein Node-Betreiber für v3.2.4 getan hat (Mainnet-Höhe 3,742,566).** Der Governance-Vorschlag 13 nannte den Plan `v3.2.4` bei Höhe 3,742,566 (angewendet am 23. Oktober 2026): Nodes blieben bis zu dieser Höhe auf v3.2.3, hielten dort an und starteten auf v3.2.4 neu. Für das nächste koordinierte Upgrade sind die Schritte dieselben:

1. Beobachten Sie das Manifest (`https://download.qore.host/mainnet/latest.json`): Solange es das neue Release nicht nennt, gibt es nichts zu installieren, und ein Binary aus dem Testnet-Verzeichnis ist nicht das Mainnet-Release.
2. Wenn das Manifest das Release nennt, laden Sie das Archiv von dessen `binary.url` herunter, verifizieren Sie den `sha256` (der Vorschlagstext veröffentlicht ebenfalls den sha256 des Binarys) und stellen Sie es **vor** der Höhe bereit. Prüfen Sie mit `GET /cosmos/upgrade/v1beta1/current_plan` den anstehenden Plan (`name` und `height`) und mit `GET /status` auf dem RPC die aktuelle Höhe.
3. Auf der Plan-Höhe **hält** ein Node, der noch das alte Binary nutzt, **an** (das ist das beabsichtigte Verhalten des Upgrade-Moduls, kein Fehler); ein Node, der bereits das neue Binary nutzt, wendet den Upgrade-Handler an und läuft weiter. Falls Ihrer zuvor angehalten hat, tauschen Sie das Binary aus und starten Sie neu. Nach dem Upgrade liefert `GET /cosmos/upgrade/v1beta1/applied_plan/v3.2.4` die Höhe statt `0` (3742566 im Mainnet, 8337253 im Testnet).
4. Ein Node, der dem Mainnet jetzt beitritt, installiert das Release, das das Manifest nennt (v3.2.5 zum Zeitpunkt der Erstellung; prüfen Sie `version` gegen `minCompatible`).

Transaktionssignierung, Adressen, Dezimalstellen, Memos und Gebühren bleiben durch v3.2.4 unverändert.

**v3.2.5 im Mainnet (Höhe 3,906,833, 29. Oktober 2026, Governance-Vorschlag 14).** Es galten dieselben Schritte: Das Manifest nannte `3.2.5` als `version` und als `minCompatible`, und ein Node, der noch auf v3.2.4 lief, hielt auf der Plan-Höhe mit `UPGRADE "v3.2.5" NEEDED` an. Die Lösung ist, das v3.2.5-Bundle zu installieren (es liefert `qorechaind` und die Shared Libraries unter `lib/` zusammen aus; halten Sie sie nebeneinander) und neu zu starten; der State des Nodes bleibt erhalten. Es ist kein weiteres Mainnet-Upgrade angesetzt.

Lesen Sie den Live-Stand mit `GET /cosmos/upgrade/v1beta1/applied_plan/<name>` (`0` = nicht angewendet) und einen anstehenden Plan mit `GET /cosmos/upgrade/v1beta1/current_plan`. v3.2.2 hat die Abhängigkeiten der Konsens-Engine, des Cosmos SDK (v0.53.8) und von IBC angehoben, und die strengeren Transaktionsprüfungen des SDK führen dazu, dass dieses Release das vorherige Binary auf der Upgrade-Höhe ersetzt und nicht Node für Node. Transaktionssignierung, Adressen, Dezimalstellen, Memos und Gebühren haben sich in v3.2.2 und v3.2.3 nicht geändert.

**State Sync und die Uhr.** State Sync entnimmt seinen Trust-Point dem Block `stateSync` des Manifests (`trustHeight`, `trustHash`, stündlich aktualisiert); der dort aufgeführte RPC-Server ist der des Projekts selbst, fügen Sie für einen Produktions-Node daher RPC-Server hinzu, denen Sie vertrauen, und prüfen Sie den Trust-Hash anhand einer anderen Quelle. Halten Sie die Uhr per NTP synchronisiert: Der Node stoppt, wenn er mehr als 60 Sekunden vom Netzwerk abweicht.

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

| `pruning`   | Verhalten                                | Anwendungsfall                          |
| ----------- | ---------------------------------------- | --------------------------------- |
| `default`   | Behält aktuellen State, prunt den Rest   | RPC-Node, Kontostands-/State-Abfragen   |
| `nothing`   | Behält den gesamten historischen State   | Archive-Node, vollständige Historie        |
| `custom`    | Vom Betreiber definierte Keep-/Intervall-Werte    | Feinabgestimmte Aufbewahrung                   |

### Node-Limits (`app.toml`) {#node-limits}

Ab Node-Release v3.2.1 schreibt `init` einen Abschnitt `[qorechain]` mit drei node-lokalen Limits. Sie ändern nur, was dieser Node im Speicher hält und was er in die von ihm vorgeschlagenen Blöcke aufnimmt, niemals aber, was ein Block enthalten muss, um gültig zu sein:

```toml
[qorechain]
# Maximum number of Cosmos transactions held in the app-side mempool (default 5000).
# When full, a new transaction that pays more per gas evicts the lowest-paying one; otherwise it is refused.
cosmos-mempool-max-txs = 5000

# Time the node may spend selecting transactions for a proposal before it proposes what it has ("0s" disables the budget).
prepare-proposal-budget = "1s"

# Stop after this many candidates in a row that do not fit in the remaining block space (0 disables the cap).
prepare-proposal-max-skips = 64
```

`init` schreibt außerdem die EVM-Chain-ID des Netzwerks in die Einstellung `evm-chain-id` im Abschnitt `[evm]` von `app.toml` (`9801` für `--chain-id qorechain-vladi`, `9800` für `qorechain-diana`). Ein Node, dessen `app.toml` einen anderen Wert enthält, startet zwar, protokolliert beim Start aber einen Fehler, und sein eigenes JSON-RPC (`eth_chainId`, Signieren gegen diesen Node) antwortet mit der falschen Chain-ID, bis Sie die Datei korrigieren; der Konsens ist davon nicht betroffen. Ältere Binaries schrieben unabhängig von `--chain-id` den Testnet-Wert (`9800`), daher sollte ein vor langer Zeit initialisierter Mainnet-Node diese Einstellung prüfen. Setzen Sie `QORE_EVM_CHAIN_ID` nicht auf einen anderen Wert als den des Netzwerks: Ein solcher Node verweigert den Start.

### Transaktionsindexierung (`config.toml`)

```toml
[tx_index]
indexer = "kv"
```

Setzen Sie `indexer = "kv"` (oder einen umfangreicheren Indexer), damit Transaktionen per Hash und Event abfragbar sind — essenziell für Börsen, die Ein- und Auszahlungen abgleichen. Setzen Sie `indexer = "null"` nur, wenn Sie keine historischen Tx-Abfragen benötigen.

---

## Endpunkte für Integrationen bereitstellen {#exposing-endpoints-for-integration}

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
api = "eth,net,web3,txpool"
```

**JSON-RPC-Limits im Node-Release v3.2.4.** Ein Node, der das v3.2.4-Binary ausführt (Testnet seit dem 19. Oktober 2026; Mainnet seit dem 23. Oktober 2026), begrenzt seinen eigenen JSON-RPC-Server. Das sind node-lokale Einstellungen im Abschnitt `[json-rpc]` der `app.toml` und sie wirken sich nicht auf den Konsens aus: `http-body-limit` (Standard 262144 Bytes, 256 KiB; ein größerer Request-Body wird mit HTTP 413 abgelehnt, bevor er gelesen wird), `max-concurrent-requests` (Standard 256; Anfragen darüber hinaus erhalten sofort HTTP 503) und `max-open-connections` (ein fehlender oder auf null gesetzter Wert bedeutet jetzt 1000, nicht unbegrenzt). Zusätzlich wird das Filterargument von `eth_getLogs` und `eth_newFilter` abgelehnt, wenn es mehr als 4 Topic-Positionen, mehr als 1000 Alternativen in einer Position oder mehr als 1000 Adressen auflistet. Ein Integrator, der sehr große gebündelte oder Contract-Deployment-Anfragen an seinen eigenen Node sendet, sollte prüfen, ob seine größte Anfrage in das Body-Limit passt, und es bei Bedarf erhöhen.

Die öffentlichen Endpunkte stellen die Namespaces `eth_`, `net_`, `web3_` und `txpool_` (nur Status) bereit; ein von v3.2.3 oder später initialisierter Node verwendet standardmäßig `eth,net,web3` und lässt `txpool` weg (er veröffentlicht die ausstehenden Transaktionen des Nodes), fügen Sie ihn also nur hinzu, wenn Sie ihn benötigen. Der Namespace `qor_` wird von keinem veröffentlichten Node-Build bereitgestellt, fügen Sie ihn daher nicht hinzu (siehe [den Namespace `qor_`](/api-reference/json-rpc-qor_-namespace)).

Und den RPC-Listener in `config.toml`:

```toml
[rpc]
laddr = "tcp://0.0.0.0:26657"
```

| Endpunkt     | Port   | Verwendung für                                         |
| ------------ | ------ | ------------------------------------------------------ |
| RPC          | `26657` | Broadcasting von Transaktionen, Abfragen von Blöcken/Status      |
| REST         | `1317`  | HTTP-Abfragen des Chain-States                            |
| gRPC         | `9090`  | Programmatischer Zugriff mit hohem Durchsatz                    |
| EVM JSON-RPC | `8545`  | Ethereum-kompatible Integrationen (Chain-ID `9801`)     |
| EVM WS       | `8546`  | EVM-Event-Subscriptions                                |
| SVM RPC      | `8899`  | Solana-kompatible Lesezugriffe (SVM-Transaktionen sind deaktiviert) |

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

Der Node kann Prometheus-Metriken auf Port **26660** bereitstellen (setzen Sie `prometheus = true` im Abschnitt `[instrumentation]` von `config.toml`):

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

1. **Pinnen Sie die Chain-Version.** Betreiben Sie das vom Manifest empfohlene Release (**v3.2.5** im Mainnet und **v3.2.6** im Testnet zum Zeitpunkt der Erstellung), verfolgen Sie offizielle Releases für koordinierte Upgrades und halten Sie die Systemuhr per NTP synchronisiert.

2. **Betreiben Sie redundante Nodes.** Betreiben Sie mindestens zwei Nodes hinter einem Load Balancer, damit ein einzelner Neustart oder Resync den Integrationsverkehr nicht unterbricht.

3. **Verifizieren Sie Genesis und Snapshots.** Validieren Sie die Genesis-SHA-256 und jede Snapshot-Prüfsumme immer gegen das offizielle Release, bevor Sie starten.

4. **Schützen Sie öffentliche Endpunkte.** Stellen Sie RPC/EVM/gRPC einen Reverse Proxy, Rate Limiting und eine Firewall voran. Exponieren Sie niemals unauthentifiziertes Schreib-RPC ins Internet.

5. **Passen Sie das Pruning an den Bedarf an.** Verwenden Sie `pruning = "nothing"` plus `tx_index = "kv"` für Börsen, die die vollständige Ein-/Auszahlungshistorie abgleichen; verwenden Sie `default` für leichtgewichtige Abfragen.

6. **Überwachen Sie die Synchronisierung kontinuierlich.** Alarmieren Sie bei Blockhöhen-Rückstand, null Peers und einem Node, der in `catching_up` feststeckt.

Ein reines Node-Deployment signiert nie. Transaktionen, die Ihre Integration darüber sendet, müssen bereits die hybride Post-Quanten-Signatur tragen (und für die EVM-Lane benötigt der Absender einen registrierten Schlüssel und ein offenes Autorisierungsfenster); siehe [Börsen-Integration](/developer-guide/exchange-integration) und [Post-Quanten-Signierung](/developer-guide/post-quantum-signing).

Um das Netzwerk ohne den Betrieb eines Full Nodes zu beobachten, siehe die [Light-Node-Dokumentation](/light-node/overview).

---

## Fehlerbehebung {#troubleshooting}

### Der Node stoppt mit einem Uhrenfehler

Ab Node-Release v3.2.1 stoppt die Konsens-Engine, wenn die Systemuhr um mehr als 60 Sekunden vom Netzwerk abweicht. Betreiben Sie einen NTP-Client (`chrony` oder `systemd-timesyncd`), prüfen Sie mit `timedatectl status`, dass die Uhr synchronisiert ist, und starten Sie den Node dann neu.

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
* [Aus dem Quellcode bauen](/developer-guide/building-from-source) — Das Community-`qorechaind`-Binary für die Entwicklung bauen
* [Light Node](/light-node/overview) — Leichtgewichtiger Client, der dem Netzwerk ohne Full Node folgt
