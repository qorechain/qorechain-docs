---
slug: /dashboard/smart-contract-creator
title: Smart Contract Creator
sidebar_label: Smart Contract Creator
sidebar_position: 6
---

# Smart Contract Creator

Der **Smart Contract Creator** generiert Smart Contracts aus einer Beschreibung in natürlicher Sprache, angetrieben von **QCAI**. Beschreibe, was du möchtest, wähle deine Ziel-Blockchain, und QCAI schreibt den Contract für dich. Es unterstützt **17 blockchains** für KI-Tooling, sodass du das Ökosystem ansprechen kannst, für das du baust.

Wenn du deine Wallet verbindest, kannst du die von dir generierten Contracts speichern und verwalten – siehe [Overview & Getting Started](/dashboard/overview#connect-your-wallet).

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

## Teilen und wiederverwenden

Jeder generierte Contract hat seine eigene Seite, die du öffnen oder teilen kannst. Wenn du einen Contract öffnest, der dir nicht gehört, kannst du ihn **forken**, um eine eigene Kopie zu starten und von dort aus weiterzuarbeiten.

:::tip Immer überprüfen und testen
Von QCAI generierter Code ist ein guter Ausgangspunkt, aber kein Ersatz für eine Überprüfung. Lies den Contract, teste ihn im [testnet](/getting-started/connecting-to-testnet) und lasse ihn durch den [Contract Auditor](/dashboard/contract-auditor) laufen, bevor du etwas Wertvolles bereitstellst.
:::

## Verwandt

- [Contract Auditor](/dashboard/contract-auditor) – führe eine QCAI-Sicherheitsanalyse für einen Contract durch.
- [Developer Guide](/developer-guide/evm-development) – Contracts auf den Laufzeitumgebungen von QoreChain bereitstellen.
