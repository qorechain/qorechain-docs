---
slug: /dashboard/smart-contract-creator
title: Smart Contract Creator
sidebar_label: Smart Contract Creator
sidebar_position: 6
---

# Smart Contract Creator

Der **Smart Contract Creator** generiert Smart Contracts aus einer Beschreibung in natürlicher Sprache, angetrieben von **QCAI**. Beschreibe, was du möchtest, wähle deine Ziel-Blockchain, und QCAI schreibt den Contract für dich. Es werden **17 Blockchains** für KI-Tooling unterstützt, sodass du das Ökosystem ansprechen kannst, für das du baust.

Du kannst ihn **ohne Konto** ausprobieren: Ein erstmaliger Besucher erhält eine kostenlose Generierung und sieht den gesamten Contract. Für die nächste Generierung sowie für Speichern, Auditieren und Deployen brauchst du ein kostenloses Konto; die Seite bietet **Create a free account** an, sobald dein kostenloser Versuch aufgebraucht ist.

Melde dich an, um die von dir generierten Contracts zu speichern und zu verwalten – siehe [Anmelden](/dashboard/overview#sign-in).

## Einen Contract generieren

1. **Starte mit einem Beispiel oder beschreibe deinen eigenen Contract.** Die Seite öffnet sich mit „What would you like to build?". Unter **Or start from an example:** wähle **Token**, **NFT collection**, **Locked vault** oder **2-of-3 multisig** – jedes füllt eine vollständige Beschreibung aus und wählt eine passende Blockchain und Vorlage aus – oder schreibe deine eigene Beschreibung in **Contract Description**. Je präziser du bist, desto besser das Ergebnis.
2. **Wähle die Blockchain.** Verwende **Target Blockchain**. Die Contract-Sprache und die Kategorie deiner Wahl werden neben dem Auswahlfeld angezeigt.
3. **Wähle einen Contract-Typ** (optional). **Contract Type** bietet eine Ausgangsvorlage wie einen Token-, NFT- oder Governance-Contract; belasse es bei **Custom (describe in prompt)**, um dich allein auf deine Beschreibung zu stützen.
4. **Generieren.** Wähle **Generate Smart Contract**. Eine Fortschrittsanzeige zeigt den Status, während QCAI den Contract erstellt.

## Das Ergebnis überprüfen

Wenn die Generierung abgeschlossen ist, zeigt das Dashboard den Contract in einer Ansicht mit Syntaxhervorhebung sowie Details wie den Contract-Namen, die Blockchain, die Sprache, die Dateigröße und den Zeitpunkt der Generierung. Die von dir verwendete Eingabe wird zur Referenz mit dem Ergebnis angezeigt.

Von hier aus kannst du:

- Den Contract-Code in die Zwischenablage **kopieren** (**Copy Code**).
- Den Contract als **PDF exportieren** (**Export PDF**).
- Den Contract als Datei im richtigen Format für deine gewählte Blockchain **herunterladen** (**Download File**).
- Den Contract **bearbeiten** (**Edit Contract**), um ihn weiter zu verfeinern.

## Deinen Contract deployen {#deploy}

### Auf dem Mainnet (EVM) – Non-Custodial-Deployment {#deploy-mainnet}

Das Mainnet-Deployment ist non-custodial: Das Dashboard kompiliert deinen Contract und liefert **unsignierte** Deployment-Daten zurück – es hält niemals deine Schlüssel und signiert niemals in deinem Namen. Du signierst und sendest das Deployment in deiner eigenen Wallet, und das Dashboard erfasst anschließend den resultierenden Contract.

1. Öffne den Contract, den du deployen möchtest (einen Contract mit EVM-Ziel), und wähle **Deploy** auf **Mainnet**. Wenn dies deine erste Mainnet-Aktion ist, akzeptiere die [einmalige Risikobestätigung](/dashboard/overview#risk-acknowledgement).
2. Verbinde **MetaMask**, falls es noch nicht verbunden ist – siehe [Überblick & Erste Schritte](/dashboard/overview#connect-your-wallet). Seit Chain v3.2.0 benötigt die EVM-Lane außerdem, dass das Konto einen registrierten Post-Quantum-Schlüssel und ein **offenes EVM-Autorisierungsfenster** besitzt, das über QoreX geöffnet wird (siehe [Senden mit MetaMask](/dashboard/wallet#send-metamask)); ohne eines lehnt die Chain das Deployment ab.
3. Das Dashboard kompiliert den Contract und übergibt die unsignierte Deployment-Transaktion an deine Wallet.
4. Überprüfe die Transaktion in MetaMask – Netzwerk, Gas und Daten – und bestätige dann, um sie selbst zu signieren und zu senden.
5. Sobald das Deployment on-chain bestätigt ist, erfasst das Dashboard die resultierende Contract-Adresse bei deinen gespeicherten Contracts.

Über das Dashboard können nur **EVM**-Contracts (Solidity) deployt werden. CosmWasm- und Solana-Programm-Deployments sind derzeit auf keinem der beiden Netzwerke verfügbar.

### Auf dem Testnet – mit einem Klick {#deploy-testnet}

Auf dem Testnet signiert und übermittelt die vom Dashboard verwaltete Test-Wallet ein EVM-Deployment für dich mit einem Klick, sodass du mit [Faucet](/dashboard/faucet)-Tokens schnell iterieren kannst, bevor du auf das Mainnet gehst. Das Testnet erzwingt dieselbe EVM-Lane-Regel wie das Mainnet, daher kann ein Deployment weiterhin abgelehnt werden, wenn das Konto keinen Post-Quantum-Schlüssel oder kein offenes EVM-Fenster hat.

## Teilen und wiederverwenden

Jeder generierte Contract hat seine eigene Seite. Contracts sind **standardmäßig privat**: Nur du kannst deine öffnen. Als Eigentümer siehst du auf der Contract-Seite eine Schaltfläche **Public** / **Private**; setze sie auf **Public**, damit jeder mit dem Link den Contract öffnen (und forken) kann, und zurück auf **Private**, um ihn zurückzuziehen. Wenn du einen öffentlichen Contract öffnest, der dir nicht gehört, kannst du ihn **forken**, um eine eigene Kopie zu starten und von dort aus weiterzuarbeiten.

:::tip Immer überprüfen und testen
Von QCAI generierter Code ist ein guter Ausgangspunkt, aber kein Ersatz für eine Überprüfung. Lies den Contract, teste ihn im [Testnet](/getting-started/connecting-to-testnet) und lasse ihn durch den [Contract Auditor](/dashboard/contract-auditor) laufen, bevor du etwas Wertvolles deployst.
:::

## Verwandt

- [Contract Auditor](/dashboard/contract-auditor) – führe eine QCAI-Sicherheitsanalyse für einen Contract durch.
- [Developer Guide](/developer-guide/evm-development) – Contracts in die Laufzeitumgebungen von QoreChain deployen.
