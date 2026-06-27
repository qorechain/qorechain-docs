---
slug: /dashboard/overview
title: Dashboard – Übersicht & Erste Schritte
sidebar_label: Übersicht & Erste Schritte
sidebar_position: 1
---

# Dashboard – Übersicht & Erste Schritte

Das QoreChain Dashboard unter **[dashboard.qorechain.io](https://dashboard.qorechain.io)** ist die offizielle Web-App, um QoreChain aus Ihrem Browser heraus zu nutzen. An einem einzigen Ort können Sie die Chain erkunden, eine Wallet verwalten, Token swappen, Assets über Chains hinweg bewegen, Smart Contracts generieren und auditieren, an Validatoren staken, Testnet-Token beziehen, Quests abschließen und das Tooling des Netzwerks erreichen.

Alles in diesem Abschnitt ist eine Anleitung für Nutzer: was jede Seite tut und wie Sie sie verwenden. Es ist keine Installation erforderlich — das Dashboard läuft vollständig in Ihrem Browser.

## Was Sie tun können

| Bereich | Wofür es dient |
| --- | --- |
| **[Explorer](/dashboard/explorer)** | Blöcke, Transaktionen, Adressen und Validatoren durchsuchen. |
| **[Wallet](/dashboard/wallet)** | Kontostände ansehen, QOR senden und empfangen sowie Ihre Adressen verwalten. |
| **[Trade](/dashboard/trade)** | Token swappen und Liquidität auf dem On-Chain-AMM bereitstellen. |
| **[Bridge](/dashboard/bridge)** | Assets zwischen QoreChain und anderen Chains bewegen. |
| **[Smart Contract Creator](/dashboard/smart-contract-creator)** | Smart Contracts mit **QCAI** über 17 unterstützte Blockchains hinweg generieren. |
| **[Contract Auditor](/dashboard/contract-auditor)** | Eine **QCAI**-Sicherheitsanalyse für einen Smart Contract durchführen. |
| **[Staking & Validatoren](/dashboard/staking-and-validators)** | Validatoren überprüfen und Ihr QOR delegieren. |
| **[Faucet](/dashboard/faucet)** | Test-Token im Testnet anfordern. |
| **[Quests](/dashboard/quests)** | Geführte Aufgaben abschließen, um das Netzwerk kennenzulernen. |
| **[Tools Hub](/dashboard/tools-hub)** | Node-, Rollup-, SDK- und Lizenzierungs-Tooling erreichen. |

## Ihre Wallet verbinden {#connect-your-wallet}

Die meisten Aktionen, die den On-Chain-Zustand ändern — Token senden, swappen, staken, bridgen — erfordern eine verbundene Wallet.

1. Öffnen Sie [dashboard.qorechain.io](https://dashboard.qorechain.io).
2. Wählen Sie **Wallet verbinden**.
3. Genehmigen Sie die Verbindung in Ihrer Wallet.

Nach dem Verbinden zeigt das Dashboard Ihre Adresse (in gekürzter Form) im Header an und schaltet die Aktionen frei, die eine Signatur benötigen. Schreibgeschützte Seiten wie der Explorer funktionieren ohne Verbindung.

QoreChain-Konten verwenden das bech32-Präfix `qor`, sodass eine verbundene Adresse wie `qor1...` aussieht. Konten sind mit Quantum-Safe-Kryptografie geschützt. Eine Anleitung zur erstmaligen Einrichtung finden Sie unter [Wallet-Einrichtung](/getting-started/wallet-setup).

## Ihr Netzwerk auswählen

Das Dashboard arbeitet mit zwei Netzwerken. Der Header zeigt das Netzwerk an, mit dem Sie derzeit verbunden sind.

| Netzwerk | Chain-ID | Wann zu verwenden |
| --- | --- | --- |
| **Mainnet** | `qorechain-vladi` | Live-Netzwerk für realen Wert und produktiven Einsatz. |
| **Testnet** | `qorechain-diana` | Kostenlose Umgebung zum Testen, mit dem [Faucet](/dashboard/faucet) für Test-Token. |

Der native Token ist **QOR** (Basis-Denomination `uqor`, wobei 1 QOR = 10^6 uqor). Wenn Sie neu sind, beginnen Sie im Testnet, beziehen Sie Token vom Faucet und probieren Sie einen ersten Transfer aus, bevor Sie zum Mainnet wechseln.

:::tip Neu bei QoreChain?
Folgen Sie [Mit dem Testnet verbinden](/getting-started/connecting-to-testnet) und [Ihre erste Transaktion](/getting-started/first-transaction), um schnell praktisch loszulegen, und kommen Sie dann zurück, um den Rest des Dashboards zu erkunden.
:::

## Verwandte Themen

* [Explorer](/dashboard/explorer) — Blöcke, Transaktionen und Konten durchsuchen.
* [Wallet](/dashboard/wallet) — Konten verwalten und Transaktionen senden.
* [Trade / DEX](/dashboard/trade) — Token gegen On-Chain-AMM-Pools swappen.
* [Bridge](/dashboard/bridge) — Assets über Chains hinweg bewegen.
* [Tools Hub](/dashboard/tools-hub) — Lizenzen, Faucet und Entwickler-Dienstprogramme.
