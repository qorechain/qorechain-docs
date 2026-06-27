---
slug: /getting-started/quickstart
title: Schnellstart
sidebar_label: Schnellstart
sidebar_position: 1
---

# Schnellstart

Bringen Sie einen QoreChain-Knoten in wenigen Minuten zum Laufen. Wählen Sie Docker Compose für die schnellste Einrichtung oder erstellen Sie aus dem Quellcode für volle Kontrolle.

---

## Docker Compose (Empfohlen)

Der einfachste Weg, eine vollständige QoreChain-Umgebung mit allen vorkonfigurierten Diensten zu betreiben.

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
docker compose up -d
```

Dies startet die folgenden Dienste:

| Dienst             | Ports                                                                   | Beschreibung                                 |
| ------------------ | ----------------------------------------------------------------------- | -------------------------------------------- |
| **qorechain-node** | `26657` (RPC), `1317` (REST), `9090` (gRPC), `8545` (EVM), `8899` (SVM) | Vollständiger Blockchain-Knoten mit Multi-VM-Unterstützung |
| **ai-sidecar**     | `50051`                                                                 | QCAI-Engine für Anomalieerkennung und Risikobewertung |
| **indexer**        | --                                                                      | Block-Indexer für historische Abfragen       |
| **postgres**       | `5432`                                                                  | Datenbank-Backend für den Indexer            |
| **prometheus**     | `9091`                                                                  | Metrikerfassung                              |
| **grafana**        | `3001`                                                                  | Überwachungs-Dashboards                      |

Sobald alle Container gesund sind, beginnt Ihr Knoten mit der Synchronisierung mit dem Netzwerk.

---

## Aus dem Quellcode erstellen

### Voraussetzungen

* **Go 1.26+** mit aktiviertem CGO
* **Rust-Toolchain** (zum Kompilieren der PQC-Kryptografie und der SVM-Laufzeitbibliotheken)
* **Git**

### Die Binärdatei erstellen

```bash
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

### Den Knoten initialisieren

```bash
./qorechaind init my-node --chain-id qorechain-diana
```

Dies erstellt die Standardkonfiguration und die Datenverzeichnisse unter `~/.qorechaind/`.

### Den Knoten starten

```bash
./qorechaind start
```

Der Knoten startet mit den Standardeinstellungen. Siehe [Verbindung zum Testnet](/getting-started/connecting-to-testnet) für den Beitritt zum aktiven Netzwerk mit korrekter Genesis- und Peer-Konfiguration.

:::note
Die Beispiele auf dieser Seite zielen auf das **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**) ab. Das Mainnet (**`qorechain-vladi`**, EVM-Chain-ID **9801**) ist seit dem 7. Juni 2026 aktiv und hat seine eigene dedizierte Seite **Verbindung zum Mainnet**.
:::

---

## Installation überprüfen

Bestätigen Sie, dass Ihr Knoten korrekt läuft:

```bash
# Check the binary version
./qorechaind version
```

```bash
# Query the node status via RPC
curl localhost:26657/status
```

Eine erfolgreiche Antwort enthält den `moniker` des Knotens, das `network` (sollte `qorechain-diana` sein) und die aktuelle Blockhöhe.

---

## Nächste Schritte

* [Verbindung zum Testnet](/getting-started/connecting-to-testnet) — Treten Sie dem aktiven Diana-Testnet bei
* [Wallet-Einrichtung](/getting-started/wallet-setup) — Konfigurieren Sie eine Wallet für die Interaktion mit der Chain
* [Ihre erste Transaktion](/getting-started/first-transaction) — Senden Sie Ihren ersten QOR-Transfer
* [Verbindung zum Mainnet](/getting-started/connecting-to-mainnet) — Treten Sie dem aktiven Vladi-Mainnet bei
* [SDK-Überblick](/sdk/overview) — Erstellen Sie Anwendungen gegen QoreChain aus dem Code
