---
slug: /getting-started/connecting-to-mainnet
title: Verbindung zum Mainnet
sidebar_label: Verbindung zum Mainnet
sidebar_position: 3
---

# Verbindung zum Mainnet

Treten Sie dem live laufenden QoreChain-Vladi-Mainnet bei, indem Sie Ihren Node mit der offiziellen Genesis-Datei, den Peers und den Netzwerkeinstellungen konfigurieren.

:::note
Diese Seite behandelt das **`qorechain-vladi`**-Mainnet (EVM-Chain-ID **9801**, hexadezimal `0x2649`), live seit dem **29. Juni 2026** (Genesis-Block um 17:03 UTC) mit dem Release **v3.2.1** auf Cosmos SDK v0.53. Für das **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**) siehe [Verbindung zum Testnet](/getting-started/connecting-to-testnet) und proben Sie dort Ihr Setup, bevor Sie live gehen.
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

:::caution Halten Sie Ihren Node aktuell — v3.2.0 oder neuer erforderlich
Full Nodes müssen dem live laufenden Release des Netzwerks folgen — installieren Sie stets das Binary, auf das das Manifest verweist, und pinnen Sie kein altes fest. Das aktuelle Manifest ist **v3.2.1** mit `minCompatible` **3.2.0**. Das Mainnet hat zwei Governance-Upgrades durchlaufen, die jeder Node verarbeiten muss: **v3.1.94** bei Höhe 2.122.074 (die Emissions-Obergrenze) und **v3.2.0** bei Höhe 2.981.742 (das EVM-Autorisierungsfenster und die v2-Hybridsignatur-Bytes). Ein Node, der frisch beitritt, benötigt daher ein v3.2.x-Binary; bevorzugen Sie State Sync (unten) gegenüber einem Replay ab Genesis. Der veröffentlichte Chain-Daten-Snapshot liegt vor beiden Upgrade-Höhen, ein daraus wiederhergestellter Node muss sie daher mit einem v3.2.x-Binary replayen.

v3.2.1 ist ein node-lokales Release (keine Upgrade-Höhe, keine Governance-Abstimmung): Nodes auf v3.2.0 folgen der Chain weiter, ein Upgrade wird jedoch empfohlen. Setzen Sie nach dem Wechsel auf v3.2.1 `evm-chain-id = 9801` in `app.toml` (ein anderer Wert wird als Fehler protokolliert) und halten Sie die Systemuhr per NTP synchron: Ein Node hält an, wenn seine Uhr um mehr als 60 Sekunden abweicht. Prüfen Sie stets die Felder `"version"` und `"minCompatible"` des Manifests, bevor Sie `binary.url` vertrauen — das Manifest wird bewusst schrittweise ausgerollt (zuerst Testnet, dann Mainnet nach einer Bewährungsphase).
:::

:::caution Ein koordiniertes Mainnet-Upgrade ist geplant — lesen Sie dies, bevor Sie einen Node starten oder neu starten
Der Mainnet-Governance-Vorschlag **7** (beschleunigt, Abstimmung bis 15. Oktober 2026 21:24 UTC) würde **v3.2.2** bei Höhe **3.556.788** anwenden — etwa zwei Tage nach dem 14. Oktober bei rund 3,2 s pro Block. Der Vorschlagstext lautet: Bleiben Sie bis zu dieser Höhe auf v3.2.1 (oder v3.2.0); der Node hält dort an, und Sie starten ihn auf v3.2.2 neu; die Transaktionssignierung bleibt unverändert. **Ob es dazu kommt, hängt von der Abstimmung ab** — prüfen Sie das Ergebnis (`curl -s https://api.qore.host/cosmos/gov/v1/proposals/7`, Feld `status`) sowie die Felder `version` und `upgradeHeight` des [Mainnet-Manifests](https://download.qore.host/mainnet/latest.json), bevor Sie ein Binary austauschen. Installieren Sie v3.2.2 nicht vorzeitig: Ein Node, der es vor der Höhe trägt, hält ebenfalls an. Wenn der Vorschlag scheitert oder die Höhe überschritten ist, gilt dieser Hinweis nicht mehr.
:::

### Aus dem Quellcode kompilieren (nur für die Entwicklung)

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

Dies erzeugt das Community-Binary mit Stub-Keepern und ohne Post-Quanten-Signierer; es kann weder den Konsenszustand der Netzwerke reproduzieren noch hybrid-signierte Transaktionen erstellen. Um einen Node im Mainnet zu betreiben, installieren Sie das oben genannte Release-Binary. Die vollständigen Voraussetzungen (Go 1.26+, CGO, native Bibliotheken) finden Sie unter [Building from Source](/developer-guide/building-from-source).

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

Ein Full Node legt die Blockzeit nicht fest — das tun die Validatoren (das Mainnet erzeugt derzeit etwa alle 3,2 Sekunden einen Block). Belassen Sie die Konsensus-Timeouts bei ihren Standardwerten, es sei denn, Sie betreiben einen Validator und haben von der Validatorengruppe Werte erhalten. Eine nützliche Mempool-Einstellung für einen öffentlichen RPC-Node in `config.toml`:

```toml
[mempool]
size = 5000
```

---

## Schneller Bootstrap (Snapshot oder State Sync)

Die Synchronisation ab Genesis kann lange dauern. Das Feld `stateSync` des Manifests enthält ein stündlich aktualisiertes Paar aus Vertrauenshöhe und -hash — verwenden Sie es, um State Sync zu konfigurieren, anstatt eine Höhe manuell nachzuschlagen:

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

Setzen Sie anschließend den Abschnitt `[statesync]` von `config.toml` mit diesen Werten — den vollständigen Ablauf, einschließlich eines manuellen, RPC-basierten Fallbacks, falls Sie einen Vertrauenspunkt selbst ableiten müssen, finden Sie unter [Running a Node](/developer-guide/running-a-node).

Ein Chain-Daten-Snapshot ist ebenfalls im Manifest aufgeführt (`snapshot.url`, `snapshot.sha256`, `snapshot.height`). Lesen Sie die Werte aus dem Manifest, anstatt einen Dateinamen oder eine Höhe fest zu hinterlegen, da ein neuer Snapshot den alten ablöst. Der Snapshot ist groß (zig Gigabyte) und wurde, wie im Oktober 2026 veröffentlicht, bei Höhe 1.966.629 (21. August 2026) erstellt — vor den Upgrade-Höhen von v3.1.94 und v3.2.0 —, sodass ein daraus wiederhergestellter Node beide Upgrades replayt und ein v3.2.x-Binary ausführen muss; State Sync ist in der Regel schneller:

```bash
SNAPSHOT_URL=$(jq -r .snapshot.url latest.json)
SNAPSHOT_SHA256=$(jq -r .snapshot.sha256 latest.json)

curl -fsSL "$SNAPSHOT_URL" -o snapshot.tar.gz
echo "${SNAPSHOT_SHA256}  snapshot.tar.gz" | sha256sum -c -

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
| `8899`  | HTTP      | SVM RPC — Solana-kompatibles RPC (nur lesend; die SVM-Transaktionsspur ist deaktiviert) |
| `26660` | HTTP      | Prometheus-Metriken-Endpunkt                              |

---

## Netzwerk-Fakten

| Feld              | Wert                                    |
| ----------------- | ---------------------------------------- |
| Chain-ID          | `qorechain-vladi`                        |
| EVM-Chain-ID      | `9801` (hexadezimal `0x2649`)            |
| Chain-Version     | v3.2.1 (Konsensusregeln von v3.2.0)      |
| Live seit         | 29. Juni 2026 17:03 UTC (Genesis-Block)  |
| Blockzeit         | etwa 3,2 Sekunden (gemessener Durchschnitt) |
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
