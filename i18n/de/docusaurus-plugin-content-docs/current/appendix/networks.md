---
slug: /appendix/networks
title: Netzwerke
sidebar_label: Netzwerke
sidebar_position: 4
---

# Netzwerke

Eine konsolidierte Referenz für die QoreChain-Netzwerke — Chain-Identifikatoren, EVM-Chain-IDs, Token-Denomination, Adresspräfixe und Standard-Service-Ports. Für die vollständigen Details zur Node-Verbindung (öffentliche Endpunkte, Seeds und Genesis) folgen Sie den unten verlinkten Verbindungsanleitungen; Betreiber erhalten die aktuellen öffentlichen Endpunkte, Seeds und Genesis aus der offiziellen Veröffentlichung.

## Netzwerke auf einen Blick

| | Mainnet | Testnet |
|---|---|---|
| **Status** | Live | Aktives Testnet |
| **Cosmos-Chain-ID** | `qorechain-vladi` | `qorechain-diana` |
| **EVM-Chain-ID (EIP-155)** | **9801** (hex `0x2649`) | **9800** (hex `0x2648`) |
| **Live seit** | 7. Juni 2026, 23:59 UTC | — |
| **Chain-Version** | v3.1.80 | v3.1.80 |
| **Framework** | Cosmos SDK v0.53 | Cosmos SDK v0.53 |
| **Verbindungsanleitung** | [Verbindung mit dem Mainnet](/getting-started/connecting-to-mainnet) | [Verbindung mit dem Testnet](/getting-started/connecting-to-testnet) |

## Token und Adressen

| Element | Wert |
|---|---|
| **Anzeige-Denom** | QOR |
| **Basis-Denom** | uqor (1 QOR = 10⁶ uqor) |
| **Bech32-Konto-Präfix** | `qor` (z. B. `qor1...`) |
| **Bech32-Validator-Präfix** | `qorvaloper` (z. B. `qorvaloper1...`) |

## Standard-Ports

Dies sind die Standard-Service-Ports, die von einem QoreChain-Node bereitgestellt werden. Die tatsächlichen öffentlichen Endpunkt-Hostnamen werden mit der offiziellen Veröffentlichung publiziert — siehe die obigen Verbindungsanleitungen.

| Service | Port |
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

QoreChain veröffentlicht in dieser Referenz keine festen öffentlichen RPC-/REST-/EVM-Hostnamen. Stattdessen:

- Für Node-Verbindung, Seeds und Genesis folgen Sie [Verbindung mit dem Mainnet](/getting-started/connecting-to-mainnet) oder [Verbindung mit dem Testnet](/getting-started/connecting-to-testnet). Betreiber erhalten die aktuellen öffentlichen Endpunkte, Seeds und Genesis aus der offiziellen Veröffentlichung.
- Für programmatischen Zugriff aus einer Anwendung verwenden Sie das [QoreChain SDK](/sdk/overview), das die Netzwerkkonfiguration für Sie auflöst.
- Der On-Chain-**Explorer** ist über das Dashboard unter [dashboard.qorechain.io](https://dashboard.qorechain.io) verfügbar, und der Testnet-**Faucet** ist dort ebenfalls erreichbar (siehe [Dashboard-Faucet](/dashboard/faucet)).
- Diese Dokumentation wird unter [docs.qorechain.io](https://docs.qorechain.io) veröffentlicht.

## Zu MetaMask hinzufügen

Um ein QoreChain-Netzwerk zu einem EVM-Wallet wie MetaMask hinzuzufügen, verwenden Sie die obigen EVM-Chain-IDs — **9801** für das Mainnet und **9800** für das Testnet — zusammen mit dem EVM-JSON-RPC-Endpunkt für das Netzwerk, mit dem Sie sich verbinden. Eine Schritt-für-Schritt-Anleitung finden Sie unter [Wallet-Einrichtung](/getting-started/wallet-setup).

## Verwandt

* [Verbindung mit dem Mainnet](/getting-started/connecting-to-mainnet) — dem Live-Netzwerk `qorechain-vladi` beitreten.
* [Verbindung mit dem Testnet](/getting-started/connecting-to-testnet) — dem Diana-Testnet beitreten.
* [Chain-Parameter](/appendix/chain-parameters) — kanonische Chain-Konfiguration.
* [SDK-Übersicht](/sdk/overview) — Netzwerkkonfiguration aus dem Code auflösen.
