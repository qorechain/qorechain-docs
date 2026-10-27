---
slug: /appendix/faq
title: FAQ
sidebar_label: FAQ
sidebar_position: 5
---

# Häufig gestellte Fragen

Allgemeine Fragen zu QoreChain, beantwortet anhand der Dokumentation. Jede Antwort verweist auf die maßgebliche Seite mit allen Details. Für SDK-spezifische Fragen siehe die [SDK-FAQ](/sdk/faq).

### Ist das Mainnet live?

Ja. Das QoreChain-Mainnet (Chain `qorechain-vladi`, EVM-Chain-ID 9801) ist seit dem 7. Juni 2026 live und läuft mit Release v3.2.4 (angewendet auf Höhe 3.742.566 am 23. Oktober 2026 durch Governance-Vorschlag 13; der Governance-Vorschlag 14 würde v3.2.5 auf Höhe 3.906.833 anwenden und befand sich zum Zeitpunkt der Erstellung in seiner Abstimmungsphase); das Testnet `qorechain-diana` läuft mit v3.2.6 (angewendet auf Höhe 8.970.638 am 27. Oktober 2026). Siehe [Netzwerke](/appendix/networks) und [Verbindung mit dem Mainnet](/getting-started/connecting-to-mainnet).

### Welche Chain-IDs und EVM-Chain-IDs gibt es?

Das Mainnet ist die Cosmos-Chain `qorechain-vladi` mit der EVM-Chain-ID **9801** (hex `0x2649`); das Testnet ist `qorechain-diana` mit der EVM-Chain-ID **9800** (hex `0x2648`). Die vollständige Tabelle finden Sie unter [Netzwerke](/appendix/networks).

### Wie werden Transaktionsgebühren verteilt?

Die eingenommenen Gebühren werden aufgeteilt: **37% an Validatoren, 30% verbrannt, 20% an die Community-Treasury, 10% an Staker und 3% an Light Nodes**. Die Aufteilung gilt für alles im Fee Collector, einschließlich der Epochen-Emission. Siehe [Tokenomics](/architecture/tokenomics#fee-distribution).

### Was ist PRISM?

PRISM ist die Reinforcement-Learning-Optimierungsschicht, die in die QoreChain Consensus Engine eingebettet ist. Sie beobachtet Netzwerkmetriken und schlägt deterministische Anpassungen der Konsensparameter unter Sicherungsschalter-Sicherheitskontrollen vor. Heute läuft sie im Beobachtungsmodus: Es ist keine trainierte Policy geladen, daher ändert sie keinen Parameter. Siehe [PRISM Consensus Engine](/architecture/prism-consensus-engine).

### Ist die Cross-Chain-Bridge live?

Nein. Das Bridge-Modul ist bereitgestellt, aber alle 37 Chain-Konfigurationen stehen noch aus, es sind keine Bridge-Validatoren registriert, und im Mainnet existiert kein IBC-Channel (das Testnet hat einen einzelnen ICS-20-Transfer-Channel zu einer Test-Chain, der für IBC-Tests geöffnet wurde, und keinen zu den geplanten Gegenparteien). Sie ist um 37 Chain-Konfigurationen und bis zu 8 IBC-Gegenparteien herum konzipiert; behandeln Sie diese Zielwerte als Design-Absicht. Siehe [Bridge-Architektur](/architecture/bridge-architecture).

### Wie verbinde ich ein Wallet?

Verwenden Sie das offizielle [QoreX](/qorex/overview)-Wallet oder fügen Sie einem EVM-Wallet ein QoreChain-Netzwerk mit den EVM-Chain-IDs hinzu (9801 Mainnet, 9800 Testnet). Siehe [Wallet-Einrichtung](/getting-started/wallet-setup).

### Wie erhalte ich Testnet-Token?

Verwenden Sie den Testnet-Faucet im Dashboard. Siehe [Dashboard-Faucet](/dashboard/faucet) und [Verbindung mit dem Testnet](/getting-started/connecting-to-testnet).

### Was sind fUSD, fETH und fBTC?

Reine Testnet-Test-Token (FestUSD, FestETH und FestBTC, mit 6, 18 und 8 Dezimalstellen), die für den Builder Fest erstellt wurden. Sie haben keinen Wert, existieren nicht im Mainnet und werden als Bank-Coins mit den groß-/kleinschreibungsabhängigen Denominationen `erc20:<contract address>` gehalten. Der Testnet-Faucet kann sie zusammen mit einem QOR-Claim senden. Siehe [Fest-Test-Token](/dashboard/faucet#fest-tokens).

### Wie betreibe ich einen Node, Validator oder Light Node?

Für einen Full Node siehe [Einen Node betreiben](/developer-guide/running-a-node). Für einen Validator siehe [Einen Validator betreiben](/developer-guide/running-a-validator). Für einen Light Node siehe [Light Node](/light-node/overview); die Registrierung für das Light-Node-Belohnungsprogramm ist offen und lizenzpflichtig ([Status](/light-node/overview#reward-program-status)).

### Welches Signaturverfahren verwendet QoreChain?

QoreChain verwendet ein Post-Quantum-Hybridverfahren, das klassisches **secp256k1 (ECDSA)** mit Post-Quantum-**ML-DSA-87 (Dilithium-5)** kombiniert. Dieses Hybridverfahren ist auf dem Cosmos-Transaktionspfad standardmäßig erforderlich, wobei der Durchsetzungsmodus per Governance gesteuert wird. Auf der EVM-Lane bleibt die Signatur secp256k1, und ein Konto muss zusätzlich einen registrierten ML-DSA-Schlüssel und ein offenes Autorisierungsfenster besitzen (seit v3.2.0). Siehe [Post-Quantum-Sicherheit](/architecture/post-quantum-security).

### Warum wird meine EVM-Transaktion mit „no open EVM authorisation window“ abgelehnt?

Seit v3.2.0 lässt die EVM-Lane eine Transaktion nur von einem Konto zu, das einen registrierten Post-Quantum-Schlüssel und ein offenes Autorisierungsfenster besitzt. Öffnen Sie ein Fenster mit einer Post-Quantum-signierten Transaktion auf der Cosmos-Lane und versuchen Sie es dann erneut. Siehe [EVM-Autorisierungsfenster](/getting-started/first-transaction#evm-window).

### Wie viele Validatoren hat das Mainnet?

Acht gebondete Validatoren am 27. Oktober 2026, mit etwa 60,3 Millionen gebondeten QOR (das aktive Set kann bis zu 100 umfassen). Das Testnet hat vier. Das aktuelle Set können Sie unter `GET /cosmos/staking/v1beta1/validators` auf `https://api.qore.host` auslesen.

### Welche Blockzeit kann ich erwarten?

Etwa 3,2 Sekunden im Mainnet und etwa 1,3 Sekunden im Testnet (gemessene Durchschnittswerte, 27. Oktober 2026). Die Blockzeit wird durch die Node-Konfiguration der Validatoren festgelegt.

### Ist xQORE verfügbar?

Noch nicht. Das Accounting-Modul existiert, aber Lock- und Unlock-Transaktionen sind in den Live-Netzwerken nicht angebunden. Siehe [Tokenomics](/architecture/tokenomics#x-xqore).

### Ist das QOR-Angebot festgelegt?

Das Genesis-Angebot betrug 4.420.000.000 QOR. Die Staking-Emission wird unter einer harten kumulativen Obergrenze von 590.000.000 QOR geprägt (86.000 QOR pro Epoche seit Governance-Vorschlag 10, Oktober 2026), und Burns entfernen Token dauerhaft. Siehe [Tokenomics](/architecture/tokenomics#supply-and-emission).

### Wie erstelle ich ein Rollup?

Verwenden Sie das QoreChain Rollup Development Kit. Siehe [Rollups](/rollups/overview) und die Architekturreferenz zum [Rollup Development Kit](/architecture/rollup-development-kit).

### Wie erstelle ich eine dApp?

Verwenden Sie das [QoreChain SDK](/sdk/overview), das öffentliche SDK zum Erstellen von Anwendungen auf QoreChain über seine EVM-, SVM- und QoreChain Native-Ausführungsumgebungen hinweg.

### Wo kann ich Fragen stellen?

Der QCAIA-Community-Bot beantwortet Fragen auf Discord ([discord.gg/qorechain](https://discord.gg/qorechain)) und Telegram ([t.me/QoreChainCommunity](https://t.me/QoreChainCommunity)). Siehe [QCAIA-Community-Bot](/qcaia/overview).

## Verwandt

* [Netzwerke](/appendix/networks) — Referenz für Chain-IDs, Ports und Endpunkte.
* [Was ist QoreChain](/introduction/what-is-qorechain) — Überblick über die Plattform.
* [QCAIA-Community-Bot](/qcaia/overview) — Stellen Sie Fragen auf Discord und Telegram.
