---
slug: /getting-started/connecting-to-mainnet
title: Verbindung zum Mainnet
sidebar_label: Verbindung zum Mainnet
sidebar_position: 3
---

# Verbindung zum Mainnet

Treten Sie dem aktiven QoreChain-Vladi-Mainnet bei, indem Sie Ihren Knoten mit der korrekten Genesis-Datei, den Peers und den Netzwerkeinstellungen konfigurieren.

:::note
Diese Seite behandelt das **`qorechain-vladi`**-Mainnet (EVM-Chain-ID **9801**, hex `0x2649`), seit dem **7. Juni 2026 23:59 UTC** aktiv und mit der Chain-Version **v3.1.77** auf Cosmos SDK v0.53 betrieben. Für das **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**) siehe [Verbindung zum Testnet](/getting-started/connecting-to-testnet) und üben Sie Ihre Einrichtung dort, bevor Sie live gehen.
:::

:::warning
Mainnet-Seed-Knoten, persistente Peers, die Genesis-URL und ihre SHA-256-Prüfsumme werden mit jedem offiziellen Mainnet-Release veröffentlicht. **Beziehen Sie diese aktuellen Werte immer aus dem offiziellen Mainnet-Repository/-Release** und überprüfen Sie die Genesis-Prüfsumme vor dem Start. Die untenstehenden Platzhalter (`<MAINNET_SEED_NODE_ID>@<host>:26656`, Genesis-URL, Snapshot-URLs) müssen durch die tatsächlich veröffentlichten Werte ersetzt werden — starten Sie keinen Mainnet-Knoten gegen unverifizierte Peers oder Genesis.
:::

---

## Installation

Installieren Sie die `qorechaind`-Binärdatei entweder durch Erstellen aus dem Quellcode oder durch Abrufen des offiziellen Docker-Images.

### Aus dem Quellcode erstellen

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

Siehe [Aus dem Quellcode erstellen](/developer-guide/building-from-source) für die vollständigen Voraussetzungen (Go 1.26+, CGO, Rust-Toolchain, native Bibliotheken).

### Den Knoten initialisieren

```bash
./qorechaind init my-node --chain-id qorechain-vladi
```

Dies erstellt die Standardkonfiguration und die Datenverzeichnisse unter `~/.qorechaind/`.

---

## Genesis herunterladen

Ersetzen Sie Ihre lokale Genesis-Datei durch die offizielle Mainnet-Genesis:

```bash
curl -o ~/.qorechaind/config/genesis.json \
  <MAINNET_GENESIS_URL>
```

Überprüfen Sie die Genesis-Prüfsumme gegen den im offiziellen Mainnet-Release veröffentlichten Wert, bevor Sie fortfahren:

```bash
sha256sum ~/.qorechaind/config/genesis.json
# Compare against <MAINNET_GENESIS_SHA256> from the official release
```

Diese Datei definiert den Anfangszustand des Vladi-Mainnets, einschließlich des Genesis-Validatorensatzes, der Token-Zuteilungen (TGE bei Genesis) und der Modulparameter.

:::note
`<MAINNET_GENESIS_URL>` und `<MAINNET_GENESIS_SHA256>` sind Platzhalter. Beziehen Sie die aktuelle Genesis-URL und ihre SHA-256-Prüfsumme aus dem offiziellen Mainnet-Release/-Repository und überprüfen Sie, dass die Prüfsumme übereinstimmt, bevor Sie Ihren Knoten starten.
:::

---

## Peers konfigurieren

Bearbeiten Sie Ihre Knotenkonfiguration, um sich mit bestehenden Mainnet-Peers zu verbinden.

Öffnen Sie `~/.qorechaind/config/config.toml` und setzen Sie die Felder `seeds` und `persistent_peers`:

```toml
seeds = "<MAINNET_SEED_NODE_ID>@<host>:26656"
persistent_peers = "<PEER_NODE_ID_1>@<host1>:26656,<PEER_NODE_ID_2>@<host2>:26656"
```

:::note
Die obigen Werte für Seed- und persistente Peers sind Platzhalter. Beziehen Sie die aktuelle Mainnet-Seed-Knoten-ID, den Host und den Port aus dem offiziellen Mainnet-Repository/-Release. Verbinden Sie sich nicht mit unverifizierten Peers.
:::

### Empfohlene Einstellungen

Möglicherweise möchten Sie auch Folgendes in `config.toml` anpassen:

```toml
[mempool]
size = 5000

[consensus]
timeout_propose = "3s"
timeout_commit = "5s"
```

Diese Werte sind auf die Blockzeiten und den Durchsatz des Vladi-Mainnets abgestimmt.

---

## Knoten starten

Starten Sie Ihren Knoten, um die Synchronisierung mit dem Netzwerk zu beginnen:

```bash
./qorechaind start
```

Der Knoten verbindet sich mit Peers und beginnt, Blöcke von der Genesis herunterzuladen. Die anfängliche Synchronisierungszeit hängt von der aktuellen Chain-Höhe und Ihrer Netzwerkgeschwindigkeit ab. Für einen schnelleren Bootstrap verwenden Betreiber typischerweise State Sync oder einen aktuellen Snapshot — siehe [Einen Knoten betreiben](/developer-guide/running-a-node) für den vollständigen State-Sync- und Snapshot-Workflow.

---

## Synchronisierungsstatus prüfen

Überprüfen Sie, ob Ihr Knoten den neuesten Block aufholt:

```bash
curl localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — Der Knoten synchronisiert noch. Warten Sie, bis er aufgeholt hat.
* `false` — Der Knoten ist vollständig synchronisiert und verarbeitet neue Blöcke.

Sie können auch die neueste Blockhöhe prüfen:

```bash
curl localhost:26657/status | jq '.result.sync_info.latest_block_height'
```

Bestätigen Sie, dass Sie im richtigen Netzwerk sind — das Feld `network` sollte `qorechain-vladi` melden:

```bash
curl localhost:26657/status | jq '.result.node_info.network'
```

---

## Überwachung

QoreChain stellt mehrere Endpunkte zur Überwachung der Knotengesundheit und -leistung bereit.

### Prometheus-Metriken

Rohmetriken sind verfügbar unter:

```
http://localhost:26660/metrics
```

Diese Metriken können von jedem Prometheus-kompatiblen Collector abgegriffen werden.

### Grafana-Dashboards

Beim Betrieb über Docker Compose ist Grafana verfügbar unter:

```
http://localhost:3001
```

Legen Sie bei der ersten Anmeldung Ihre eigenen Anmeldedaten fest, wenn Sie dazu aufgefordert werden — belassen Sie nicht die Standardwerte. Vorkonfigurierte Dashboards zeigen Blockproduktion, Transaktionsdurchsatz, Peer-Verbindungen und Ressourcennutzung an.

### REST-Zustandsprüfung

Die REST-API bietet einen schnellen Statusendpunkt:

```
http://localhost:1317
```

---

## Ports-Referenz

| Port    | Protokoll | Beschreibung                                            |
| ------- | --------- | ------------------------------------------------------- |
| `26657` | TCP       | RPC — Transaktionen abfragen und übertragen             |
| `26656` | TCP       | P2P — Peer-to-Peer-Netzwerkkommunikation                |
| `1317`  | HTTP      | REST-API — Chain-Zustand per HTTP abfragen              |
| `9090`  | gRPC      | gRPC-API — programmatischer Chain-Zugriff               |
| `8545`  | HTTP      | EVM JSON-RPC — Ethereum-kompatibles RPC (Chain-ID `9801`) |
| `8546`  | WebSocket | EVM WebSocket — Echtzeit-EVM-Ereignisabonnements        |
| `8899`  | HTTP      | SVM RPC — Solana-kompatibles RPC                        |
| `26660` | HTTP      | Prometheus-Metrik-Endpunkt                             |

---

## Netzwerkfakten

| Feld              | Wert                                   |
| ----------------- | -------------------------------------- |
| Chain-ID          | `qorechain-vladi`                      |
| EVM-Chain-ID      | `9801` (hex `0x2649`)                  |
| Chain-Version     | v3.1.77                                |
| Aktiv seit        | 7. Juni 2026 23:59 UTC                 |
| Token             | QOR (`uqor`, 10^6 Mikroeinheiten = 1 QOR) |
| Konto-Präfix      | `qor`                                  |
| Validator-Präfix  | `qorvaloper`                           |
| SDK               | Cosmos SDK v0.53                       |

---

## Nächste Schritte

* [Einen Knoten betreiben](/developer-guide/running-a-node) — Betreiben Sie einen Full-/RPC-Knoten für Börsen und Integratoren
* [Einen Validator betreiben](/developer-guide/running-a-validator) — Erstellen und betreiben Sie einen Validator
* [Wallet-Einrichtung](/getting-started/wallet-setup) — Konfigurieren Sie eine Wallet für das Mainnet
* [Ihre erste Transaktion](/getting-started/first-transaction) — Senden Sie Ihren ersten QOR-Transfer
* [Verbindung zum Testnet](/getting-started/connecting-to-testnet) — Treten Sie dem Diana-Testnet für kostenlose Tests bei
* [Netzwerke](/appendix/networks) — Chain-IDs, Ports und die vollständige Netzwerkreferenz
