---
slug: /qorex/overview
title: QoreX Wallet
sidebar_label: Überblick
sidebar_position: 1
---

# QoreX Wallet

**QoreX** ist die offizielle **nicht-verwahrende** Wallet für **QoreChain**, die quantensichere Layer 1 (Mainnet `qorechain-vladi`). Deine privaten Schlüssel werden **ausschließlich auf deinem Gerät** erzeugt und gespeichert — die QoreChain Association hat niemals Zugriff auf dein Guthaben, und die Apps erheben **keine Daten**. Jede QOR-Übertragung auf der Native-Spur trägt eine **hybride Post-Quanten-Signatur** (ML-DSA-87, NIST FIPS-204, kombiniert mit secp256k1), sodass dein Guthaben sowohl vor klassischen als auch vor Quanten-Angreifern geschützt ist.

QoreX besteht aus zwei Teilen, die zusammenarbeiten:

- **Browser-Erweiterung** — die Desktop-Wallet, **live und öffentlich verfügbar für Chrome, Firefox und Safari (macOS)**. Sie ist eine eigenständige Wallet (erstellen/importieren, QOR halten und senden) und zugleich der Verbinder, über den jede Website QoreX erkennen und jede Anfrage in eine ausdrückliche Freigabe verwandeln kann. Siehe [Browser-Erweiterung](/qorex/browser-extension).
- **Mobile App** (Android und iOS) — die vollständige Wallet: erstellen/wiederherstellen, quantensichere QOR senden und empfangen, externe Netzwerke, Staking, Portfolio, Wiederherstellung sowie ein integrierter dApp-Browser. Derzeit im öffentlichen Test (siehe Verfügbarkeit weiter unten).

## Verfügbarkeit nach Plattform

| Funktion | Mobile App (Android und iOS) | Browser-Erweiterung |
|---|---|---|
| Wallet erstellen / importieren | ✅ | ✅ (eigenständig) |
| QOR senden und empfangen (Post-Quanten) | ✅ | ✅ (aus dem Popup) |
| Externe Netzwerke (Ethereum, BNB Chain, Polygon, Arbitrum, Solana, Cosmos Hub, Osmosis, Celestia + Token) | ✅ | ✅ (Senden aus dem Popup) |
| Staking, Portfolio, Q-Day Scanner, Wiederherstellung, Legacy | ✅ | — |
| dApp-Verbindungen | ✅ (integrierter Browser) | ✅ (jede Website) |
| Konto (@handle, Zahlungsanfragen) | ✅ | — |
| Verknüpfung mehrerer Geräte | ✅ | — |
| Kopplung mit dem Dashboard | ✅ | ✅ (Verbinden + vorgeschlagene Übertragungen, v0.1.5) |

## Warum QoreX anders ist

- **Standardmäßig quantensicher** — QOR-Übertragungen auf der Native-Spur tragen immer eine hybride Signatur aus ML-DSA-87 + secp256k1. Alles Klassische (externe Chains) wird klar gekennzeichnet, niemals stillschweigend.
- **Wirklich nicht-verwahrend** — Schlüssel werden auf dem Gerät erzeugt und liegen in einem hardwaregestützten Tresor (Secure Enclave unter iOS, StrongBox unter Android) oder in einem verschlüsselten Tresor (Erweiterung). Sie verlassen dein Gerät nie.
- **Keine Datenerhebung** — keine Analyse, kein Tracking, keine Werbung in irgendeiner QoreX-App. Eine optionale Kontoanmeldung bringt zusätzlichen Komfort (siehe [Konto und Dashboard](/qorex/account-and-dashboard)), doch die Wallet ist nie darauf angewiesen.
- **Ein einheitliches Guthaben** — dein QOR ist ein einziges Guthaben über die Spuren Native, EVM und SVM hinweg; QoreX zeigt es als eine einzige Zahl an.
- **Mehrere Wiederherstellungswege** — eine Wiederherstellungsphrase aus 24 Wörtern (immer), optionale soziale Wiederherstellung mit Vertrauenspersonen und 48-Stunden-Zeitsperre, optionale Legacy-Vererbung sowie die bequeme Verknüpfung mehrerer Geräte.

## Erste Schritte

- Neu bei QoreX? Beginne mit [Erste Schritte](/qorex/getting-started), um deine Wallet zu erstellen oder wiederherzustellen.
- Lerne anschließend, quantensichere QOR zu [senden und zu empfangen](/qorex/send-and-receive).
- Richte dein Sicherheitsnetz unter [Sicherheit und Wiederherstellung](/qorex/security-and-recovery) ein.
- Installiere auf dem Desktop die [Browser-Erweiterung](/qorex/browser-extension).

:::note Download und Verfügbarkeit
- **Browser-Erweiterung** — live und öffentlich verfügbar: installiere sie aus dem [Chrome Web Store, den Firefox Add-ons oder dem Mac App Store (Safari)](/qorex/browser-extension#install).
- **Android-App** — verfügbar zum **öffentlichen Testen** über Google Play.
- **iOS-App** — verfügbar zum Testen über **TestFlight**, falls du sie ausprobieren möchtest.

Die aktuellen, offiziellen Links findest du auf [qorechain.io](https://qorechain.io); installiere QoreX ausschließlich aus einem offiziellen Eintrag.
:::
