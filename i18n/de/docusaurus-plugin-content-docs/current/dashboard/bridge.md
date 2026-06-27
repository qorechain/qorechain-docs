---
slug: /dashboard/bridge
title: Bridge
sidebar_label: Bridge
sidebar_position: 5
---

# Bridge

Die **Bridge** ermöglicht es Ihnen, Assets zwischen QoreChain und anderen Chains von einem einzigen Bildschirm aus zu bewegen. Jeder Bridge-Vorgang wird durch Post-Quantum-Kryptografie abgesichert. Den Entwurf hinter Cross-Chain-Transfers finden Sie unter [Bridge-Architektur](/architecture/bridge-architecture).

:::caution Qualifizierter Status
Die Cross-Chain-Bridge befindet sich derzeit im Testnet und wird schrittweise ausgerollt — sie ist noch kein produktives Mainnet-System. Betrachten Sie die verfügbaren Routen als laufende Arbeit und nicht als garantierte aktive Konnektivität, und beginnen Sie im Testnet.
:::

Verbinden Sie Ihre Wallet, um die Bridge zu nutzen — siehe [Übersicht & Erste Schritte](/dashboard/overview#connect-your-wallet).

## So bridgen Sie ein Asset

1. Wählen Sie im oberen Auswahlfeld die **Quell**-Chain und das Token. Das Auswahlfeld zeigt das Token, sein Netzwerk und Ihren Kontostand an.
2. Wählen Sie im unteren Auswahlfeld die **Ziel**-Chain und das Token.
3. Geben Sie den zu übertragenden Betrag ein. Der Betrag, den Sie erhalten werden, wird auf der Zielseite angezeigt.
4. Um die Assets an eine andere Adresse als Ihre eigene zu senden, aktivieren Sie **An andere senden** und geben Sie den Empfänger ein.
5. Überprüfen Sie die **Gebühr** und die **geschätzte Zeit** bis zur Abwicklung, die unten angezeigt werden.
6. Bestätigen Sie den Transfer in Ihrer Wallet.

Ein Tausch-Steuerelement zwischen den beiden Auswahlfeldern ermöglicht es Ihnen, Quelle und Ziel mit einem Tippen zu vertauschen.

## Tipps

- Bestätigen Sie beide Chains und die Zieladresse vor dem Absenden — Cross-Chain-Transfers können nicht rückgängig gemacht werden.
- Die Abwicklungszeit variiert je nach Route; die Schätzung wird aktualisiert, sobald Sie Chains und Beträge ändern.
- Hintergrundinformationen dazu, wie Transfers über Chains hinweg validiert werden, finden Sie unter [Assets bridgen](/user-guide/bridging-assets) und [Bridge-Architektur](/architecture/bridge-architecture).
