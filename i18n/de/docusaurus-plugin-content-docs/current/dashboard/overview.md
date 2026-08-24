---
slug: /dashboard/overview
title: Dashboard-Überblick & Erste Schritte
sidebar_label: Überblick & Erste Schritte
sidebar_position: 1
---

# Dashboard-Überblick & Erste Schritte

Das QoreChain Dashboard unter **[dashboard.qorechain.io](https://dashboard.qorechain.io)** ist die offizielle Web-App, um QoreChain direkt aus dem Browser zu nutzen. An einer einzigen Stelle können Sie die Chain erkunden, eine Wallet verwalten, Token tauschen, Assets zwischen Chains bewegen, Smart Contracts generieren und prüfen, bei Validatoren staken, Testnet-Token beantragen, Quests abschließen und die Tools des Netzwerks erreichen.

Alles in diesem Abschnitt ist eine Anleitung für Nutzer: was jede Seite tut und wie man sie verwendet. Es ist keine Installation erforderlich — das Dashboard läuft vollständig in Ihrem Browser.

## Was Sie tun können

| Bereich | Wofür es gedacht ist |
| --- | --- |
| **[Explorer](/dashboard/explorer)** | Blöcke, Transaktionen, Adressen und Validatoren durchsuchen. |
| **[Wallet](/dashboard/wallet)** | Ihr Guthaben und Ihren Verlauf einsehen und QOR empfangen — mit Ihrer eigenen Wallet (non-custodial) im Mainnet oder einer vom Dashboard verwalteten Test-Wallet im Testnet. |
| **[Trade](/dashboard/trade)** | Token tauschen und Liquidität auf dem On-Chain-AMM bereitstellen. |
| **[Bridge](/dashboard/bridge)** | Assets zwischen QoreChain und anderen Chains bewegen. |
| **[Smart Contract Creator](/dashboard/smart-contract-creator)** | Smart Contracts mit **QCAI** für 17 unterstützte Blockchains generieren. |
| **[Contract Auditor](/dashboard/contract-auditor)** | Eine **QCAI**-Sicherheitsanalyse für einen Smart Contract durchführen. |
| **[Staking & Validatoren](/dashboard/staking-and-validators)** | Validatoren prüfen und Ihre QOR delegieren. |
| **[Faucet](/dashboard/faucet)** | Test-Token im Testnet anfordern. |
| **[Quests](/dashboard/quests)** | Geführte Aufgaben abschließen, um das Netzwerk kennenzulernen. |
| **[Tools Hub](/dashboard/tools-hub)** | Node-, Rollup-, SDK- und Lizenz-Tooling erreichen. |

## Verbinden Sie Ihre Wallet {#connect-your-wallet}

Die meisten Aktionen, die den On-Chain-Zustand ändern — Token senden, tauschen, staken, bridgen — erfordern eine verbundene Wallet. Wie das Dashboard mit Schlüsseln umgeht, hängt vom Netzwerk ab:

- **Mainnet ist non-custodial.** Das Dashboard hält niemals Ihre Mainnet-Schlüssel. Sie verbinden Ihre eigene Wallet — **QoreX** (die offizielle QoreChain-Wallet, als Extension oder App), **Keplr** oder **MetaMask** — und das Dashboard liest Ihr tatsächliches Guthaben und Ihren Verlauf von der Chain. Jede Mainnet-Transaktion wird in Ihrer eigenen Wallet signiert, niemals vom Dashboard. Senden und Staken auf der **Native-Schiene erfordern QoreX**, da QoreChain-Konten mit einer post-quantum-hybriden Signatur signieren, die heute nur QoreX erzeugt; Keplr kann sich trotzdem verbinden, um Ihr Native-Schienen-Guthaben anzuzeigen. **MetaMask** signiert und sendet eigenständig auf der **EVM-Schiene**.
- **Testnet ist custodial.** Das Dashboard verwaltet eine Test-Wallet für Sie, sodass Sie ohne Einrichtungsaufwand und ohne Risiko für echte Werte experimentieren können.

### Mit QoreX verbinden (empfohlen) {#connect-qorex}

QoreX ist die offizielle QoreChain-Wallet. Die Karte **Connect with QoreX** im Dashboard unterstützt sowohl die Browser-Extension als auch die mobile App über denselben Einstiegspunkt.

1. Öffnen Sie [dashboard.qorechain.io](https://dashboard.qorechain.io) und stellen Sie sicher, dass die Kopfzeile **Mainnet** anzeigt.
2. Wenn dies Ihr erster Besuch einer Mainnet-Seite ist, lesen und akzeptieren Sie den [einmaligen Risikohinweis](#risk-acknowledgement).
3. Wählen Sie **Connect Wallet** (oder **Connect with QoreX** auf der Wallet-Karte).
4. Wenn die QoreX-Browser-Extension installiert und in diesem Browser erkannt wird, fragt das Dashboard **„How do you want to connect?"** mit zwei Optionen, **Browser extension** und **QoreX app**. Wählen Sie eine aus — die Wahl wird gespeichert, sodass sie bei künftigen Besuchen übersprungen wird (ein Link **Use a different method** ist jederzeit verfügbar, falls Sie später wechseln möchten). Wird keine Extension erkannt, geht das Dashboard direkt zum App-Ablauf über.
   - **Browser extension**: Das Popup der Extension öffnet sich und zeigt `dashboard.qorechain.io` als die Seite, die die Verbindung anfordert. Prüfen Sie dies und bestätigen Sie — damit wird ein einmaliger Nachweis signiert, dass Ihnen Ihre `qor1...`-Adresse gehört (es werden keine Mittel bewegt). Die Kopplung wird sofort in derselben Browser-Sitzung abgeschlossen.
   - **QoreX app**: Das Dashboard zeigt einen QR-Code (mit einem Link **Open QoreX**, der die App direkt öffnet, wenn Sie vom selben Smartphone aus browsen). Öffnen Sie die QoreX-App, scannen Sie den QR-Code (oder tippen Sie den Link an), prüfen Sie die Kopplungsanfrage mit der Herkunft des Dashboards und bestätigen Sie sie mit Ihrer biometrischen Bestätigung. Das Dashboard fragt im Hintergrund weiter ab und schließt die Kopplung automatisch ab, sobald Sie bestätigen.
5. Nach der Bestätigung zeigt das Dashboard Ihre `qor1...`-Adresse an und schaltet die Aktionen frei, die eine Signatur benötigen.

Siehe [Wallet](/dashboard/wallet#mainnet) für die vollständige Anleitung zum Verbinden und Senden je Wallet-Typ sowie die Seite [Account & Dashboard](/qorex/account-and-dashboard#dashboard) in der QoreX-Dokumentation für die Wallet-seitige Sicht derselben Kopplung.

### Mit Keplr oder MetaMask verbinden

1. Öffnen Sie [dashboard.qorechain.io](https://dashboard.qorechain.io) und stellen Sie sicher, dass die Kopfzeile **Mainnet** anzeigt.
2. Wenn dies Ihr erster Besuch einer Mainnet-Seite ist, lesen und akzeptieren Sie den einmaligen Risikohinweis (siehe unten).
3. Wählen Sie **Connect Wallet** und dann **Keplr** oder **MetaMask**.
4. Bestätigen Sie die Verbindung in Ihrer Wallet.

Sobald verbunden, zeigt das Dashboard Ihre Adresse (in verkürzter Form) in der Kopfzeile an. MetaMask schaltet das Senden und andere signierte Aktionen direkt auf der EVM-Schiene frei. Keplr schaltet die Ansicht Ihres Guthabens und Verlaufs auf der Native-Schiene frei — Senden und Staken laufen dort über QoreX (siehe oben), da QoreChain-Konten mit einer post-quantum-hybriden Signatur signieren. Nur lesende Seiten wie der Explorer funktionieren auch ohne Verbindung.

QoreChain-Konten verwenden das Bech32-Präfix `qor`, sodass eine verbundene Adresse wie `qor1...` aussieht — dasselbe Konto hat außerdem eine EVM- (`0x...`) und eine SVM-Kodierung (Base58). Konten sind mit quantensicherer Kryptografie geschützt. Siehe [Wallet Setup](/getting-started/wallet-setup) für eine Anleitung zur Ersteinrichtung und [QoreChain zu Ihrer Wallet hinzufügen](/dashboard/wallet#add-network), falls Ihre Wallet das Netzwerk noch nicht kennt.

### Einmaliger Risikohinweis {#risk-acknowledgement}

Bevor Sie eine Mainnet-Seite nutzen können, bittet das Dashboard Sie, einen einmaligen Haftungsausschluss zu akzeptieren. Er bestätigt, dass Sie verstehen, dass Mainnet-Transaktionen **echte Mittel** bewegen, dass das Dashboard **non-custodial** ist (nur Sie kontrollieren Ihre Schlüssel) und dass On-Chain-Transaktionen **unumkehrbar** sind. Sie akzeptieren ihn einmal; danach öffnen sich Mainnet-Seiten direkt.

## Wählen Sie Ihr Netzwerk

Das Dashboard arbeitet mit zwei Netzwerken. Die Kopfzeile zeigt das Netzwerk, mit dem Sie gerade verbunden sind.

| Netzwerk | Chain-ID | Wann es zu verwenden ist |
| --- | --- | --- |
| **Mainnet** | `qorechain-vladi` | Live-Netzwerk für echten Wert und den produktiven Einsatz. Non-custodial: Sie verbinden Ihre eigene Wallet. |
| **Testnet** | `qorechain-diana` | Kostenlose Umgebung zum Testen, mit einer vom Dashboard verwalteten Test-Wallet und dem [Faucet](/dashboard/faucet) für Test-Token. |

Das native Token ist **QOR** (Basiseinheit `uqor`, wobei 1 QOR = 10^6 uqor). Wenn Sie neu sind, beginnen Sie im Testnet, beantragen Sie Token beim Faucet und probieren Sie eine erste Überweisung aus, bevor Sie zum Mainnet wechseln.

:::tip Neu bei QoreChain?
Folgen Sie [Verbindung zum Testnet](/getting-started/connecting-to-testnet) und [Ihre erste Transaktion](/getting-started/first-transaction), um schnell praktische Erfahrung zu sammeln, und kehren Sie dann zurück, um den Rest des Dashboards zu erkunden.
:::

## Verwandte Themen

* [Explorer](/dashboard/explorer) — Blöcke, Transaktionen und Konten durchsuchen.
* [Wallet](/dashboard/wallet) — Konten verwalten und Transaktionen senden.
* [Trade / DEX](/dashboard/trade) — Token gegen On-Chain-AMM-Pools tauschen.
* [Bridge](/dashboard/bridge) — Assets zwischen Chains bewegen.
* [Tools Hub](/dashboard/tools-hub) — Lizenzen, Faucet und Entwickler-Tools.
