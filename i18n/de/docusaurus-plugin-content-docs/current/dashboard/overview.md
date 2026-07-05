---
slug: /dashboard/overview
title: Dashboard – Übersicht & Erste Schritte
sidebar_label: Übersicht & Erste Schritte
sidebar_position: 1
---

# Dashboard – Übersicht & Erste Schritte

Das QoreChain Dashboard unter **[dashboard.qorechain.io](https://dashboard.qorechain.io)** ist die offizielle Web-App, um QoreChain direkt aus Ihrem Browser zu nutzen. Von einem zentralen Ort aus können Sie die Chain erkunden, eine Wallet verwalten, Token tauschen, Assets zwischen Chains bewegen, Smart Contracts generieren und prüfen, bei Validatoren staken, Testnet-Token anfordern, Quests abschließen und auf das Tooling des Netzwerks zugreifen.

Alles in diesem Abschnitt ist eine Anleitung für Nutzer: was jede Seite tut und wie Sie sie verwenden. Es ist keine Installation erforderlich — das Dashboard läuft vollständig in Ihrem Browser.

## Was Sie tun können

| Bereich | Wofür er dient |
| --- | --- |
| **[Explorer](/dashboard/explorer)** | Blöcke, Transaktionen, Adressen und Validatoren durchsuchen. |
| **[Wallet](/dashboard/wallet)** | Guthaben und Verlauf einsehen und QOR empfangen — mit Ihrer eigenen Wallet (non-custodial) im Mainnet oder einer vom Dashboard verwalteten Test-Wallet im Testnet. |
| **[Trade](/dashboard/trade)** | Token tauschen und Liquidität im On-Chain-AMM bereitstellen. |
| **[Bridge](/dashboard/bridge)** | Assets zwischen QoreChain und anderen Chains bewegen. |
| **[Smart Contract Creator](/dashboard/smart-contract-creator)** | Smart Contracts mit **QCAI** für 17 unterstützte Blockchains generieren. |
| **[Contract Auditor](/dashboard/contract-auditor)** | Eine **QCAI**-Sicherheitsanalyse für einen Smart Contract durchführen. |
| **[Staking & Validatoren](/dashboard/staking-and-validators)** | Validatoren prüfen und Ihre QOR delegieren. |
| **[Faucet](/dashboard/faucet)** | Test-Token im Testnet anfordern. |
| **[Quests](/dashboard/quests)** | Geführte Aufgaben abschließen, um das Netzwerk kennenzulernen. |
| **[Tools Hub](/dashboard/tools-hub)** | Zugriff auf Node-, Rollup-, SDK- und Lizenzierungs-Tooling. |

## Wallet verbinden {#connect-your-wallet}

Die meisten Aktionen, die den On-Chain-Zustand verändern — Token senden, tauschen, staken, bridgen — erfordern eine verbundene Wallet. Wie das Dashboard mit Schlüsseln umgeht, hängt vom Netzwerk ab:

- **Das Mainnet ist non-custodial.** Das Dashboard hält Ihre Mainnet-Schlüssel zu keinem Zeitpunkt. Sie verbinden Ihre eigene Wallet — **Keplr** für die Native-Schiene oder **MetaMask** für die EVM-Schiene — und das Dashboard liest Ihr tatsächliches Guthaben und Ihren Verlauf von der Chain. Jede Mainnet-Transaktion wird in Ihrer eigenen Wallet signiert, niemals vom Dashboard.
- **Das Testnet ist custodial.** Das Dashboard verwaltet eine Test-Wallet für Sie, sodass Sie ohne jegliche Einrichtung und ohne echtes Wertrisiko experimentieren können.

So verbinden Sie sich im Mainnet:

1. Öffnen Sie [dashboard.qorechain.io](https://dashboard.qorechain.io) und stellen Sie sicher, dass in der Kopfzeile **Mainnet** angezeigt wird.
2. Wenn dies Ihr erster Besuch auf einer Mainnet-Seite ist, lesen und akzeptieren Sie die einmalige Risikobestätigung (siehe unten).
3. Wählen Sie **Connect Wallet** und dann **Keplr** (Native-Schiene) oder **MetaMask** (EVM-Schiene).
4. Bestätigen Sie die Verbindung in Ihrer Wallet.

Sobald die Verbindung steht, zeigt das Dashboard Ihre Adresse (in gekürzter Form) in der Kopfzeile an und schaltet die Aktionen frei, die eine Signatur benötigen. Reine Lese-Seiten wie der Explorer funktionieren auch ohne Verbindung.

QoreChain-Konten verwenden das bech32-Präfix `qor`, eine verbundene Adresse sieht also aus wie `qor1...` — dasselbe Konto hat außerdem eine EVM- (`0x...`) und eine SVM-Kodierung (base58). Konten sind mit quantensicherer Kryptografie geschützt. Siehe [Wallet Setup](/getting-started/wallet-setup) für Hilfe bei der Ersteinrichtung und [QoreChain zu Ihrer Wallet hinzufügen](/dashboard/wallet#add-network), falls Ihre Wallet das Netzwerk noch nicht kennt.

### Einmalige Risikobestätigung {#risk-acknowledgement}

Bevor Sie eine Mainnet-Seite nutzen können, bittet Sie das Dashboard, einen einmaligen Haftungsausschluss zu akzeptieren. Damit bestätigen Sie, dass Sie verstehen, dass Mainnet-Transaktionen **echte Gelder** bewegen, dass das Dashboard **non-custodial** ist (nur Sie kontrollieren Ihre Schlüssel) und dass On-Chain-Transaktionen **unumkehrbar** sind. Sie akzeptieren dies einmalig; danach öffnen sich Mainnet-Seiten direkt.

## Netzwerk auswählen

Das Dashboard arbeitet mit zwei Netzwerken. Die Kopfzeile zeigt das Netzwerk an, mit dem Sie aktuell verbunden sind.

| Netzwerk | Chain-ID | Wann Sie es verwenden |
| --- | --- | --- |
| **Mainnet** | `qorechain-vladi` | Live-Netzwerk für echte Werte und Produktivbetrieb. Non-custodial: Sie verbinden Ihre eigene Wallet. |
| **Testnet** | `qorechain-diana` | Kostenlose Umgebung zum Testen, mit einer vom Dashboard verwalteten Test-Wallet und dem [Faucet](/dashboard/faucet) für Test-Token. |

Der native Token ist **QOR** (Basis-Denomination `uqor`, wobei 1 QOR = 10^6 uqor). Wenn Sie neu sind, beginnen Sie im Testnet, fordern Sie Token vom Faucet an und probieren Sie eine erste Überweisung aus, bevor Sie zum Mainnet wechseln.

:::tip Neu bei QoreChain?
Folgen Sie [Verbindung zum Testnet](/getting-started/connecting-to-testnet) und [Ihre erste Transaktion](/getting-started/first-transaction), um schnell praktische Erfahrung zu sammeln, und kommen Sie dann zurück, um den Rest des Dashboards zu erkunden.
:::

## Verwandte Themen

* [Explorer](/dashboard/explorer) — Blöcke, Transaktionen und Konten durchsuchen.
* [Wallet](/dashboard/wallet) — Konten verwalten und Transaktionen senden.
* [Trade / DEX](/dashboard/trade) — Token gegen On-Chain-AMM-Pools tauschen.
* [Bridge](/dashboard/bridge) — Assets zwischen Chains bewegen.
* [Tools Hub](/dashboard/tools-hub) — Lizenzen, Faucet und Entwickler-Utilities.
