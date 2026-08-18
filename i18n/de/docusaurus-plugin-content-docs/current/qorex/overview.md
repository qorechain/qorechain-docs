---
slug: /qorex/overview
title: QoreX Wallet
sidebar_label: Übersicht
sidebar_position: 1
---

# QoreX Wallet

**QoreX** ist die offizielle **nicht-verwahrende** Wallet für **QoreChain**, die quantensichere Layer 1 (Mainnet `qorechain-vladi`). Deine privaten Schlüssel werden **ausschließlich auf deinem Gerät** erzeugt und gespeichert — die QoreChain Association hat niemals Zugriff auf deine Guthaben, und die Apps erheben **keine Daten**. Jeder QOR-Transfer auf der Native-Lane trägt eine **hybride Post-Quanten-Signatur** (ML-DSA-87, NIST FIPS-204, kombiniert mit secp256k1), sodass deine Guthaben sowohl vor klassischen als auch vor Quantenangreifern geschützt sind.

QoreX besteht aus zwei Teilen, die zusammenarbeiten:

- **Browser-Erweiterung** — die Desktop-Wallet, **live und öffentlich verfügbar für Chrome, Firefox und Safari (macOS)**. Sie ist eine eigenständige Wallet (erstellen/importieren, QOR halten und senden) und zugleich der Konnektor, über den jede Website QoreX erkennen kann und jede Anfrage zu einer ausdrücklichen Freigabe wird. Siehe [Browser-Erweiterung](/qorex/browser-extension).
- **Mobile App** (Android & iOS) — die vollständige Wallet: erstellen/wiederherstellen, quantensichere QOR senden & empfangen, externe Netzwerke, Staking, Portfolio, Wiederherstellung und ein integrierter dApp-Browser. **Auf Google Play** für Android; auf TestFlight für iOS (siehe Verfügbarkeit weiter unten).

## Plattform-Verfügbarkeit

| Funktion | Mobile App (Android & iOS) | Browser-Erweiterung |
|---|---|---|
| Wallet erstellen / importieren | ✅ | ✅ (eigenständig) |
| QOR senden & empfangen (Post-Quanten) | ✅ | ✅ (aus dem Popup) |
| Externe Netzwerke (Ethereum, BNB Chain, Polygon, Arbitrum, Solana, Cosmos Hub, Osmosis, Celestia + Token) | ✅ | ✅ (Senden aus dem Popup) |
| Staking, Portfolio, Q-Day Scanner, Recovery, Legacy | ✅ | — |
| dApp-Verbindungen | ✅ (integrierter Browser) | ✅ (jede Website) |
| Konto (@handle, Zahlungsanfragen) | ✅ | — |
| Verknüpfung mehrerer Geräte | ✅ | — |
| Kopplung mit dem Dashboard | ✅ | ✅ (Verbinden + vorgeschlagene Transfers, v0.1.5) |

## Was QoreX besonders macht

- **Standardmäßig quantensicher** — QOR-Transfers auf der Native-Lane tragen immer eine hybride Signatur aus ML-DSA-87 + secp256k1. Alles Klassische (externe Chains) wird deutlich gekennzeichnet, niemals stillschweigend.
- **Wirklich nicht-verwahrend** — Schlüssel werden auf dem Gerät erzeugt und liegen in einem hardwaregestützten Tresor (Secure Enclave unter iOS, StrongBox unter Android) oder in einem verschlüsselten Tresor (Erweiterung). Sie verlassen dein Gerät nie.
- **Keine Datenerhebung** — keine Analyse, kein Tracking und keine Werbung in irgendeiner QoreX-App. Eine optionale Konto-Anmeldung bringt zusätzlichen Komfort (siehe [Konto & Dashboard](/qorex/account-and-dashboard)), doch die Wallet ist nie darauf angewiesen.
- **Ein einheitlicher Kontostand** — dein QOR ist ein einziger Kontostand über die Native-, EVM- und SVM-Lanes hinweg; QoreX zeigt ihn als eine einzige Zahl an.
- **Mehrere Wiederherstellungswege** — eine 24-Wörter-Wiederherstellungsphrase (immer), optionale soziale Wiederherstellung mit Guardians und 48-Stunden-Zeitsperre, optionale Legacy-Vererbung sowie die komfortable Verknüpfung mehrerer Geräte.

## Erste Schritte

- Neu bei QoreX? Beginne mit [Erste Schritte](/qorex/getting-started), um deine Wallet zu erstellen oder wiederherzustellen.
- Lerne anschließend, quantensichere QOR zu [senden & empfangen](/qorex/send-and-receive).
- Richte dein Sicherheitsnetz unter [Sicherheit & Wiederherstellung](/qorex/security-and-recovery) ein.
- Installiere auf dem Desktop die [Browser-Erweiterung](/qorex/browser-extension).

:::note Download & Verfügbarkeit
- **Browser-Erweiterung** — live und öffentlich verfügbar: installiere sie aus dem [Chrome Web Store, den Firefox Add-ons oder dem Mac App Store (Safari)](/qorex/browser-extension#install).
- **Android-App** — verfügbar auf Google Play: https://play.google.com/store/apps/details?id=network.qore.qorex
- **iOS-App** — zum Testen über **TestFlight** verfügbar, falls du sie ausprobieren möchtest; die Veröffentlichung im App Store befindet sich noch in Prüfung. Den aktuellen Einladungslink findest du auf [qorechain.io](https://qorechain.io).

Installiere QoreX ausschließlich über einen offiziellen Store-Eintrag.
:::
