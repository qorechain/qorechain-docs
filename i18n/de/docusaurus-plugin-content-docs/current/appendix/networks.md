---
slug: /appendix/networks
title: Netzwerke
sidebar_label: Netzwerke
sidebar_position: 4
---

# Netzwerke

Eine konsolidierte Referenz für die QoreChain-Netzwerke — Chain-Identifikatoren, EVM-Chain-IDs, Token-Denomination, Adresspräfixe, öffentliche Endpunkte und Standard-Service-Ports.

## Netzwerke auf einen Blick

| | Mainnet | Testnet |
|---|---|---|
| **Status** | Live | Aktives Testnet |
| **Cosmos-Chain-ID** | `qorechain-vladi` | `qorechain-diana` |
| **EVM-Chain-ID (EIP-155)** | **9801** (hex `0x2649`) | **9800** (hex `0x2648`) |
| **Live seit** | 7. Juni 2026 | 1. Juli 2026 (seitdem durchgehend; kein Reset) |
| **Chain-Version** | v3.2.3 bis Höhe 3.742.566; v3.2.4 ab diesem Block (Governance-Vorschlag 13). v3.2.3 wurde bei Höhe 3.662.051 am 20. Oktober 2026 angewendet | v3.2.4 (angewendet bei Höhe 8.337.253, 19. Oktober 2026) |
| **Blockzeit (gemessener Durchschnitt)** | etwa 3,2 s | etwa 1,0 s |
| **Release-Manifest** | [download.qore.host/mainnet/latest.json](https://download.qore.host/mainnet/latest.json) | [download.qore.host/testnet/latest.json](https://download.qore.host/testnet/latest.json) |
| **Framework** | Cosmos SDK v0.53 | Cosmos SDK v0.53 |
| **Minimaler Gaspreis** | `0.1uqor` | `0.1uqor` |
| **Verbindungsanleitung** | [Verbindung zum Mainnet](/getting-started/connecting-to-mainnet) | [Verbindung zum Testnet](/getting-started/connecting-to-testnet) |

Beide Manifeste sind die maßgebliche Quelle für das Release, das ein neuer Node ausführen sollte. Beide Netzwerke erhalten koordinierte Upgrades über die Governance, daher enthält jedes Manifest die `upgradeHeight` seines aktuellen Releases und ein `minCompatible`, das diesem Release entspricht (Testnet 3.2.4; Mainnet 3.2.3 bis zum v3.2.4-Upgrade bei Höhe 3.742.566, danach wechselt das Mainnet-Manifest auf 3.2.4). Das Testnet läuft seit dem 19. Oktober 2026 mit v3.2.4.

## Öffentliche Endpunkte {#public-endpoints}

Alle öffentlichen Endpunkte werden über HTTPS bereitgestellt.

| Dienst | Mainnet | Testnet |
|---|---|---|
| Konsens-RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| Konsens-WebSocket | `wss://rpc.qore.host/websocket` | `wss://rpc-testnet.qore.host/websocket` |
| Cosmos REST (LCD) | `https://api.qore.host` | `https://api-testnet.qore.host` |
| EVM JSON-RPC | `https://evm.qore.host` | `https://evm-testnet.qore.host` |
| EVM WebSocket | — | `wss://evm-ws-testnet.qore.host` |
| SVM JSON-RPC (Solana-kompatibel, nur lesend) | `https://svm.qore.host` | `https://svm-testnet.qore.host` |
| Block-Explorer | [explore.qore.network](https://explore.qore.network) | [explore.qore.network](https://explore.qore.network) (auf Testnet umschalten) |
| Downloads (Binary / Genesis / Snapshot) | [download.qore.host](https://download.qore.host) | [download.qore.host/testnet/latest.json](https://download.qore.host/testnet/latest.json) |

:::note
Die öffentlichen SVM-Endpunkte sind **nur lesend** (das Einreichen von Transaktionen ist am Edge deaktiviert); betreiben Sie für SVM-Schreibzugriffe einen eigenen Node. Für umfangreiche oder produktive Workloads sollten Sie einen eigenen Node betreiben — siehe [Betrieb eines Nodes](/developer-guide/running-a-node). Es gibt keinen öffentlichen gRPC-Endpunkt und keinen öffentlichen Mainnet-EVM-WebSocket. Auf den öffentlichen EVM-Endpunkten akzeptiert `eth_getLogs` höchstens 10.000 Blöcke pro Abfrage, und `txpool_content` ist deaktiviert (ein selbst betriebener Node stellt den vollständigen Namespace bereit); siehe [eth_-Namespace](/api-reference/json-rpc-eth_-namespace).
:::

:::tip
Wenn ein Skript von einem öffentlichen Endpunkt `403 Forbidden` erhält, setzen Sie einen expliziten `User-Agent`-Header (der Standard-Agent von Pythons `urllib` wird blockiert; `requests`, `curl` sowie Node- und Go-Clients funktionieren unverändert).
:::

:::caution SVM-Transaktionspfad derzeit deaktiviert
Über die reine Lesbarkeit der öffentlichen Endpunkte hinaus ist der SVM-Ausführungspfad **derzeit netzwerkweit für das Einreichen von Transaktionen deaktiviert** (seit Chain-Version v3.1.89, 22. August) — dies gilt auch für das Einreichen über einen eigenen Node, nicht nur über die öffentlichen Endpunkte `svm.qore.host` / `svm-testnet.qore.host`. Details siehe [SVM-Entwicklung](/developer-guide/svm-development). Verwenden Sie bis zur Wiedereröffnung des Pfads die Cosmos- oder EVM-Schnittstellen.
:::

## Token und Adressen

| Element | Wert |
|---|---|
| **Anzeige-Denom** | QOR |
| **Basis-Denom** | uqor (1 QOR = 10⁶ uqor) |
| **Dezimalstellen nach Schnittstelle** | Cosmos **6** (`uqor`) · EVM **18** (wei-artig; 1 uqor = 10¹² wei) · SVM **9** (lamports; 1 uqor = 1.000 lamports) |
| **HD-Coin-Type (BIP-44)** | `118` |
| **Bech32-Kontopräfix** | `qor` (z. B. `qor1...`) |
| **Bech32-Validator-Präfix** | `qorvaloper` (z. B. `qorvaloper1...`) |

Die drei Schnittstellen stellen **ein einheitliches natives QOR-Guthaben** bereit: Derselbe Schlüssel kontrolliert dieselben Mittel unter seinen Adressformen `qor1...` (Cosmos), `0x...` (EVM) und base58 (SVM).

## Standard-Ports

Dies sind die Standard-Service-Ports, die ein selbst betriebener QoreChain-Node bereitstellt.

| Dienst | Port |
|---|---|
| Cosmos RPC | 26657 |
| P2P | 26656 |
| REST / API | 1317 |
| gRPC | 9090 |
| EVM JSON-RPC | 8545 |
| EVM JSON-RPC (WebSocket) | 8546 |
| SVM (Solana-kompatibel) JSON-RPC | 8899 |
| Prometheus-Metriken | 26660 |

## Endpunkte und Zugriff

- Für Node-Verbindung, Peers, Genesis und Snapshots folgen Sie [Verbindung zum Mainnet](/getting-started/connecting-to-mainnet) oder [Verbindung zum Testnet](/getting-started/connecting-to-testnet).
- Für den programmatischen Zugriff aus einer Anwendung verwenden Sie das [QoreChain SDK](/sdk/overview), das die Netzwerkkonfiguration für Sie auflöst.
- Der öffentliche **Block-Explorer** ist unter [explore.qore.network](https://explore.qore.network) erreichbar; das Dashboard unter [dashboard.qorechain.io](https://dashboard.qorechain.io) enthält eine eigene Explorer-Ansicht, und der Testnet-**Faucet** ist dort erreichbar (siehe [Dashboard-Faucet](/dashboard/faucet)).
- Diese Dokumentation wird unter [docs.qorechain.io](https://docs.qorechain.io) veröffentlicht.

## Zu MetaMask hinzufügen

Um ein QoreChain-Netzwerk zu einem EVM-Wallet wie MetaMask hinzuzufügen, verwenden Sie die obigen EVM-Chain-IDs — **9801** für das Mainnet mit `https://evm.qore.host` und **9800** für das Testnet mit `https://evm-testnet.qore.host` — mit `https://explore.qore.network` als Block-Explorer-URL. Siehe [Wallet-Einrichtung](/getting-started/wallet-setup) für die Schritt-für-Schritt-Anleitung.

## Verwandte Themen

* [Verbindung zum Mainnet](/getting-started/connecting-to-mainnet) — dem laufenden `qorechain-vladi`-Netzwerk beitreten.
* [Verbindung zum Testnet](/getting-started/connecting-to-testnet) — dem Diana-Testnet beitreten.
* [Exchange- & Integrator-Leitfaden](/developer-guide/exchange-integration) — Einzahlungen, Auszahlungen und Node-Betrieb für Integratoren.
* [Chain-Parameter](/appendix/chain-parameters) — kanonische Chain-Konfiguration.
* [SDK-Überblick](/sdk/overview) — Netzwerkkonfiguration aus dem Code auflösen.
