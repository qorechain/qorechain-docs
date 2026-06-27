---
slug: /appendix/faq
title: FAQ
sidebar_label: FAQ
sidebar_position: 5
---

# Häufig gestellte Fragen

Allgemeine Fragen zu QoreChain, beantwortet anhand der Dokumentation. Jede Antwort verweist auf die maßgebliche Seite mit allen Details. Für SDK-spezifische Fragen siehe die [SDK-FAQ](/sdk/faq).

### Ist das Mainnet live?

Ja. Das QoreChain-Mainnet (Chain `qorechain-vladi`, EVM-Chain-ID 9801) ist seit dem 7. Juni 2026 live. Siehe [Netzwerke](/appendix/networks) und [Verbindung mit dem Mainnet](/getting-started/connecting-to-mainnet).

### Welche Chain-IDs und EVM-Chain-IDs gibt es?

Das Mainnet ist die Cosmos-Chain `qorechain-vladi` mit der EVM-Chain-ID **9801** (hex `0x2649`); das Testnet ist `qorechain-diana` mit der EVM-Chain-ID **9800** (hex `0x2648`). Die vollständige Tabelle finden Sie unter [Netzwerke](/appendix/networks).

### Wie werden Transaktionsgebühren verteilt?

Die eingenommenen Gebühren werden aufgeteilt: **37% an Validatoren, 30% verbrannt, 20% an die Community-Treasury, 10% an Staker und 3% an Light Nodes**. Siehe [Tokenomics](/architecture/tokenomics).

### Was ist PRISM?

PRISM ist die Reinforcement-Learning-Optimierungsschicht, die in die QoreChain Consensus Engine eingebettet ist. Sie beobachtet Netzwerkmetriken und schlägt deterministische Anpassungen der Konsensparameter unter Sicherungsschalter-Sicherheitskontrollen vor. Siehe [PRISM Consensus Engine](/architecture/prism-consensus-engine).

### Ist die Cross-Chain-Bridge live?

Die Cross-Chain-Bridge befindet sich derzeit im Testnet und ist noch ausstehend — sie ist noch kein Produktionssystem. Sie ist um 37 QCB-Chain-Konfigurationen und 8 IBC-Kanäle herum konzipiert; behandeln Sie diese Zielwerte als Design-Absicht und nicht als Live-Mainnet-Garantien. Siehe [Bridge-Architektur](/architecture/bridge-architecture).

### Wie verbinde ich ein Wallet?

Richten Sie ein Wallet ein und fügen Sie ein QoreChain-Netzwerk mit den EVM-Chain-IDs hinzu (9801 Mainnet, 9800 Testnet). Siehe [Wallet-Einrichtung](/getting-started/wallet-setup).

### Wie erhalte ich Testnet-Token?

Verwenden Sie den Testnet-Faucet im Dashboard. Siehe [Dashboard-Faucet](/dashboard/faucet) und [Verbindung mit dem Testnet](/getting-started/connecting-to-testnet).

### Wie betreibe ich einen Node, Validator oder Light Node?

Für einen Full Node siehe [Einen Node betreiben](/developer-guide/running-a-node). Für einen Validator siehe [Einen Validator betreiben](/developer-guide/running-a-validator). Für einen Light Node siehe [Light Node](/light-node/overview).

### Welches Signaturverfahren verwendet QoreChain?

QoreChain verwendet ein Post-Quantum-Hybridverfahren, das klassisches **secp256k1 (ECDSA)** mit Post-Quantum-**ML-DSA-87 (Dilithium-5)** kombiniert. Dieses Hybridverfahren ist auf dem Cosmos-Transaktionspfad standardmäßig erforderlich, wobei der Durchsetzungsmodus per Governance gesteuert wird. Siehe [Post-Quantum-Sicherheit](/architecture/post-quantum-security).

### Wie erstelle ich ein Rollup?

Verwenden Sie das QoreChain Rollup Development Kit. Siehe [Rollups](/rollups/overview) und die Architekturreferenz zum [Rollup Development Kit](/architecture/rollup-development-kit).

### Wie erstelle ich eine dApp?

Verwenden Sie das [QoreChain SDK](/sdk/overview), das öffentliche SDK zum Erstellen von Anwendungen auf QoreChain über seine EVM-, SVM- und CosmWasm-Ausführungsumgebungen hinweg.

### Wo kann ich Fragen stellen?

Der QCAIA-Community-Bot beantwortet Fragen auf Discord ([discord.gg/qorechain](https://discord.gg/qorechain)) und Telegram ([t.me/QoreChainCommunity](https://t.me/QoreChainCommunity)). Siehe [QCAIA-Community-Bot](/qcaia/overview).

## Verwandt

* [Netzwerke](/appendix/networks) — Referenz für Chain-IDs, Ports und Endpunkte.
* [Was ist QoreChain](/introduction/what-is-qorechain) — Überblick über die Plattform.
* [QCAIA-Community-Bot](/qcaia/overview) — Stellen Sie Fragen auf Discord und Telegram.
