---
slug: /qorex/browser-extension
title: Browser-Erweiterung
sidebar_label: Browser-Erweiterung
sidebar_position: 8
---

# Browser-Erweiterung

Die QoreX **Browser-Erweiterung** ist der **dApp-Connector** für den Desktop. Sie läuft unter **Chrome und Firefox**, und ein **Safari**-Build wird aus derselben Codebasis ausgeliefert (verpackt mit Apples Safari-Web-Extension-Wrapper — unter Safari öffnen sich Freigaben in einem Browser-Tab statt in einem Popup-Fenster). Sie ermöglicht es Websites, Ihre Wallet zu erkennen, und macht aus jeder Anfrage eine ausdrückliche Freigabe. Konzeptionell bildet sie ein Gespann mit der Mobile-App und enthält **keine** Staking-, Portfolio- oder Konto-Funktionen — diese leben in der App.

## Einrichtung

Die Erweiterung wird mit einer in der **QoreX Mobile-App** erstellten Wallet gekoppelt. Wenn Sie das Popup vor der Kopplung öffnen, erscheint **„Noch keine Wallet — erstellen Sie eine in der QoreX-App."**

## Entsperren

Das Popup fragt nach Ihrem **Vault-Passwort** (oder einem Passkey, sofern der Browser Passkey-abgeleitete Schlüssel unterstützt). Der Vault ist im Erweiterungsspeicher mit AES-256-GCM verschlüsselt, er sperrt sich automatisch, und jedes Entsperren erfolgt ausdrücklich.

## Verbindung zu dApps

Websites erkennen QoreX über **EIP-6963** (den Multi-Wallet-Standard) und den QoreChain-Connect-Vertrag. QoreX **überschreibt niemals** `window.ethereum` oder `window.keplr` — es erscheint **neben** anderen Wallets, und Sie wählen pro Website, welche Wallet verwendet wird.

1. Eine Website fordert eine Verbindung an; das Freigabe-Popup zeigt den **Origin** an.
2. Die Freigabe gibt gegenüber diesem Origin nur Ihre **öffentliche Adresse** preis.
3. Freigaben gelten **pro Origin**, bleiben über Browser-Neustarts hinweg bestehen, und die Freigabe einer Website gewährt einer anderen nichts.

## Signieren

Jede Signaturanfrage öffnet ein Freigabe-Fenster, das den **dekodierten Payload** zeigt — Empfänger, Betrag, Netzwerk — niemals einen bloßen Hash.

- Bei QoreChain-Transaktionen auf der Native-Lane weist die Erweiterung darauf hin, dass die **dApp die Post-Quantum-Schicht bereitstellt** (die Wallet signiert die klassische Hälfte — dasselbe Muster, das etablierte Wallets verwenden).
- Ist eine Anfrage **rein klassisch**, zeigt das Popup eine ausdrückliche Warnung: **„⚠ Diese Anfrage ist eine klassische Signatur — die App hat keine quantensichere Schicht hinzugefügt."**
- **Ablehnen** ist immer nur einen Klick entfernt, und Anfragen laufen von selbst ab.

## Senden über externe Netzwerke

Aus dem Popup können Sie **ETH / BNB / POL / ARB / SOL** sowie **ERC-20 / SPL**-Token senden (dieselben Seed-Ableitungen wie in der App). Sie müssen den Hinweis zur klassischen Signatur bestätigen, bevor Sie senden; ein Ergebnis-Link öffnet den Block-Explorer.

## Netzwerke & Sicherheitsprofil

- **Aktives Netzwerk** — standardmäßig QoreChain **mainnet** (Chain `0x2649` auf der EVM-Lane). Testnet bleibt für dApps unterstützt, die es anfordern, und netzwerkübergreifende Signaturanfragen werden abgelehnt.
- **Berechtigungen** — die Erweiterung fordert **ausschließlich `storage`** an. Das Content-Script injiziert nur die Provider-APIs; es liest keine Seiteninhalte über Wallet-Anfragen hinaus, und es gibt keine Analytik und keinen Remote-Code.
