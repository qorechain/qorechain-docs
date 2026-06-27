---
slug: /getting-started/connecting-to-testnet
title: Verbindung zum Testnet
sidebar_label: Verbindung zum Testnet
sidebar_position: 4
---

# Verbindung zum Testnet

Treten Sie dem aktiven QoreChain-Diana-Testnet bei, indem Sie Ihren Knoten mit der korrekten Genesis-Datei, den Peers und den Netzwerkeinstellungen konfigurieren.

:::note
Diese Seite behandelt das **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**). Das Mainnet (**`qorechain-vladi`**, EVM-Chain-ID **9801**) ist seit dem 7. Juni 2026 aktiv und hat seine eigene dedizierte Seite **Verbindung zum Mainnet** mit separater Genesis, separaten Peers und Verbindungsdetails.
:::

---

## Genesis herunterladen

Ersetzen Sie Ihre lokale Genesis-Datei durch die offizielle Testnet-Genesis:

```bash
curl -o ~/.qorechaind/config/genesis.json \
  https://raw.githubusercontent.com/qorechain/qorechain-core/main/config/genesis.json
```

Diese Datei definiert den Anfangszustand des Diana-Testnets, einschließlich des Validatorensatzes, der Token-Zuteilungen und der Modulparameter.

---

## Peers konfigurieren

Bearbeiten Sie Ihre Knotenkonfiguration, um sich mit bestehenden Testnet-Peers zu verbinden.

Öffnen Sie `~/.qorechaind/config/config.toml` und setzen Sie das Feld `persistent_peers`:

```toml
persistent_peers = "node-id@seed1.qorechain.io:26656,node-id@seed2.qorechain.io:26656"
```

Beziehen Sie sich auf das [QoreChain-Repository](https://github.com/qorechain/qorechain-core) für die aktuelle Peer-Liste.

### Empfohlene Einstellungen

Möglicherweise möchten Sie auch Folgendes in `config.toml` anpassen:

```toml
[mempool]
size = 5000

[consensus]
timeout_propose = "3s"
timeout_commit = "5s"
```

Diese Werte sind auf die Blockzeiten und den Durchsatz des Diana-Testnets abgestimmt.

---

## Knoten starten

Starten Sie Ihren Knoten, um die Synchronisierung mit dem Netzwerk zu beginnen:

```bash
./qorechaind start
```

Der Knoten verbindet sich mit Peers und beginnt, Blöcke von der Genesis herunterzuladen. Die anfängliche Synchronisierungszeit hängt von der aktuellen Chain-Höhe und Ihrer Netzwerkgeschwindigkeit ab.

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

| Port    | Protokoll | Beschreibung                                       |
| ------- | --------- | -------------------------------------------------- |
| `26657` | TCP       | RPC — Transaktionen abfragen und übertragen        |
| `26656` | TCP       | P2P — Peer-to-Peer-Netzwerkkommunikation           |
| `1317`  | HTTP      | REST-API — Chain-Zustand per HTTP abfragen         |
| `9090`  | gRPC      | gRPC-API — programmatischer Chain-Zugriff          |
| `8545`  | HTTP      | EVM JSON-RPC — Ethereum-kompatibles RPC (Chain-ID `9800`) |
| `8546`  | WebSocket | EVM WebSocket — Echtzeit-EVM-Ereignisabonnements   |
| `8899`  | HTTP      | SVM RPC — Solana-kompatibles RPC                   |
| `26660` | HTTP      | Prometheus-Metrik-Endpunkt                         |

---

## Nächste Schritte

* [Wallet-Einrichtung](/getting-started/wallet-setup) — Konfigurieren Sie eine Wallet für das Testnet
* [Ihre erste Transaktion](/getting-started/first-transaction) — Senden Sie Ihren ersten QOR-Transfer
