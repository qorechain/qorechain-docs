---
slug: /dashboard/smart-contract-creator
title: Smart Contract Creator
sidebar_label: Smart Contract Creator
sidebar_position: 6
---

# Smart Contract Creator

Der **Smart Contract Creator** generiert Smart Contracts aus einer Beschreibung in natürlicher Sprache, angetrieben von **QCAI**. Beschreibe, was du möchtest, wähle deine Ziel-Blockchain, und QCAI schreibt den Contract für dich. Es werden **17 Blockchains** für KI-Tooling unterstützt, sodass du das Ökosystem ansprechen kannst, für das du baust.

Wenn du deine Wallet verbindest, kannst du die von dir generierten Contracts speichern und verwalten – siehe [Überblick & Erste Schritte](/dashboard/overview#connect-your-wallet).

## Einen Contract generieren

1. **Beschreibe deinen Contract.** Schreibe im Eingabefeld, was der Contract tun soll – zum Beispiel ein Token mit fester Stückzahl, eine NFT-Kollektion oder ein Vesting-Zeitplan. Je präziser du bist, desto besser das Ergebnis.
2. **Wähle die Blockchain.** Wähle dein Ziel aus den unterstützten Blockchains. Die Contract-Sprache und die Kategorie deiner Wahl werden neben dem Auswahlfeld angezeigt.
3. **Wähle einen Contract-Typ** (optional). Wähle eine Ausgangsvorlage wie einen Token-, NFT- oder Governance-Contract, um die Generierung zu steuern.
4. **Generieren.** Wähle **Generate**. Eine Fortschrittsanzeige zeigt den Status, während QCAI den Contract erstellt.

## Das Ergebnis überprüfen

Wenn die Generierung abgeschlossen ist, zeigt das Dashboard den Contract in einer Ansicht mit Syntaxhervorhebung sowie Details wie den Contract-Namen, die Blockchain, die Sprache, die Dateigröße und den Zeitpunkt der Generierung. Die von dir verwendete Eingabe wird zur Referenz mit dem Ergebnis angezeigt.

Von hier aus kannst du:

- Den Contract-Code in die Zwischenablage **kopieren**.
- Den Contract als Datei im richtigen Format für deine gewählte Blockchain **herunterladen**.
- Den Contract **bearbeiten**, um ihn weiter zu verfeinern.

## Deinen Contract deployen {#deploy}

### Auf dem Mainnet (EVM) – Non-Custodial-Deployment {#deploy-mainnet}

Das Mainnet-Deployment ist non-custodial: Das Dashboard kompiliert deinen Contract und liefert **unsignierte** Deployment-Daten zurück – es hält niemals deine Schlüssel und signiert niemals in deinem Namen. Du signierst und sendest das Deployment in deiner eigenen Wallet, und das Dashboard erfasst anschließend den resultierenden Contract.

1. Öffne den Contract, den du deployen möchtest (einen Contract mit EVM-Ziel), und wähle **Deploy** auf **Mainnet**. Wenn dies deine erste Mainnet-Aktion ist, akzeptiere die [einmalige Risikobestätigung](/dashboard/overview#risk-acknowledgement).
2. Verbinde **MetaMask**, falls es noch nicht verbunden ist – siehe [Überblick & Erste Schritte](/dashboard/overview#connect-your-wallet).
3. Das Dashboard kompiliert den Contract und übergibt die unsignierte Deployment-Transaktion an deine Wallet.
4. Überprüfe die Transaktion in MetaMask – Netzwerk, Gas und Daten – und bestätige dann, um sie selbst zu signieren und zu senden.
5. Sobald das Deployment on-chain bestätigt ist, erfasst das Dashboard die resultierende Contract-Adresse bei deinen gespeicherten Contracts.

Auf dem Mainnet sind auf diesem Weg vorerst nur **EVM**-Deployments verfügbar; **Wasm**- und **SVM**-Deployments gibt es nur auf dem Testnet.

### Auf dem Testnet – mit einem Klick {#deploy-testnet}

Der Testnet-Ablauf ist unverändert: Die vom Dashboard verwaltete Test-Wallet signiert und übermittelt das Deployment für dich mit einem Klick, sodass du mit [Faucet](/dashboard/faucet)-Tokens schnell iterieren kannst, bevor du auf das Mainnet gehst. Das Testnet unterstützt EVM-, Wasm- und SVM-Deployments.

## Teilen und wiederverwenden

Jeder generierte Contract hat seine eigene Seite, die du öffnen oder teilen kannst. Wenn du einen Contract öffnest, der dir nicht gehört, kannst du ihn **forken**, um eine eigene Kopie zu starten und von dort aus weiterzuarbeiten.

:::tip Immer überprüfen und testen
Von QCAI generierter Code ist ein guter Ausgangspunkt, aber kein Ersatz für eine Überprüfung. Lies den Contract, teste ihn im [Testnet](/getting-started/connecting-to-testnet) und lasse ihn durch den [Contract Auditor](/dashboard/contract-auditor) laufen, bevor du etwas Wertvolles deployst.
:::

## Verwandt

- [Contract Auditor](/dashboard/contract-auditor) – führe eine QCAI-Sicherheitsanalyse für einen Contract durch.
- [Developer Guide](/developer-guide/evm-development) – Contracts in die Laufzeitumgebungen von QoreChain deployen.
