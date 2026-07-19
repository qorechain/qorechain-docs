---
slug: /qorex/browser-extension
title: Browser-Erweiterung
sidebar_label: Browser-Erweiterung
sidebar_position: 8
---

# Browser-Erweiterung

Die QoreX **Browser-Erweiterung** (Chrome und Firefox; eine Safari-Version mit identischer Funktionalität ist in Arbeit) ist der **dApp-Connector** für den Desktop. Sie ermöglicht Websites, deine Wallet zu erkennen, und verwandelt jede Anfrage in eine ausdrückliche Freigabe. Konzeptionell arbeitet sie mit der mobilen App zusammen und umfasst **kein** Staking, kein Portfolio und keine Kontofunktionen — diese befinden sich in der App.

## Einrichtung

Die Erweiterung wird mit einer Wallet gekoppelt, die in der **QoreX Mobile-App** erstellt wurde. Wenn du das Popup vor der Kopplung öffnest, erscheint **"No wallet yet — create one in the QoreX app."**

## Entsperren

Das Popup fragt nach deinem **Vault-Passwort** (oder einem Passkey, sofern der Browser Passkey-abgeleitete Schlüssel unterstützt). Der Vault ist AES-256-GCM-verschlüsselt im Erweiterungsspeicher abgelegt, er sperrt sich automatisch, und jedes Entsperren erfolgt ausdrücklich.

## Verbindung mit dApps

Websites erkennen QoreX über **EIP-6963** (den Multi-Wallet-Standard) und den QoreChain-Connect-Contract. QoreX **überschreibt niemals** `window.ethereum` oder `window.keplr` — es erscheint **neben** anderen Wallets, und du wählst pro Website aus, welche Wallet verwendet wird.

1. Eine Website fordert eine Verbindung an; das Freigabe-Popup zeigt die **Herkunft (Origin)** an.
2. Durch die Freigabe wird der Herkunft ausschließlich deine **öffentliche Adresse** offengelegt.
3. Freigaben gelten **pro Herkunft (Origin)**, bleiben über Browser-Neustarts hinweg bestehen, und die Freigabe für eine Website gewährt keiner anderen etwas.

## Signieren

Jede Signaturanfrage öffnet ein Freigabefenster, das die **dekodierte Nutzlast** anzeigt — Empfänger, Betrag, Netzwerk — niemals einen bloßen Hash.

- Bei QoreChain-Transaktionen auf der Native-Lane weist die Erweiterung darauf hin, dass die **dApp die Post-Quantum-Schicht bereitstellt** (die Wallet signiert die klassische Hälfte — dasselbe Muster, das etablierte Wallets verwenden).
- Wenn eine Anfrage **rein klassisch** ist, zeigt das Popup eine ausdrückliche Warnung: **"⚠ This request is a classical signature — the app did not add a quantum-safe layer."**
- **Ablehnen** ist immer mit einem Klick möglich, und Anfragen laufen von selbst ab.

## Senden über externe Netzwerke

Aus dem Popup kannst du **ETH / BNB / POL / ARB / SOL** sowie **ERC-20 / SPL**-Token senden (dieselben Seed-Ableitungen wie in der App). Du musst den Hinweis zur klassischen Signatur bestätigen, bevor du sendest; ein Ergebnislink öffnet den Block-Explorer.

## Netzwerke & Sicherheitshaltung

- **Aktives Netzwerk** — QoreChain **Mainnet** standardmäßig (Chain `0x2649` auf der EVM-Lane). Testnet bleibt für dApps unterstützt, die es anfordern, und netzwerkübergreifende Signaturanfragen werden abgelehnt.
- **Berechtigungen** — die Erweiterung fordert **ausschließlich `storage`** an. Das Content-Script injiziert nur die Provider-APIs; es liest keine Seiteninhalte über Wallet-Anfragen hinaus, und es gibt keine Analyse und keinen Remote-Code.
