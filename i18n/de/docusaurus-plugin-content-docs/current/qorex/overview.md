---
slug: /qorex/overview
title: QoreX Wallet
sidebar_label: Überblick
sidebar_position: 1
---

# QoreX Wallet

**QoreX** ist die offizielle **nicht-verwahrende** Wallet für **QoreChain**, die quantensichere Layer 1 (Mainnet `qorechain-vladi`). Deine privaten Schlüssel werden **ausschließlich auf deinem Gerät** erzeugt und gespeichert — die QoreChain Association hat niemals Zugriff auf deine Mittel, und die Apps erheben **keine Daten**. Jede QOR-Überweisung auf der Native-Lane trägt eine **hybride Post-Quanten-Signatur** (ML-DSA-87, NIST FIPS-204, kombiniert mit secp256k1), sodass deine Mittel sowohl gegen klassische als auch gegen Quantenangreifer geschützt sind.

QoreX besteht aus zwei Teilen, die zusammenarbeiten:

- **Browser-Erweiterung** — die Desktop-Wallet, **live und öffentlich verfügbar für Chrome, Firefox und Safari (macOS)**. Sie ist eine eigenständige Wallet (erstellen/importieren, QOR halten und senden) und zugleich der Konnektor, über den jede Website QoreX erkennen und jede Anfrage in eine ausdrückliche Freigabe verwandeln kann. Siehe [Browser-Erweiterung](/qorex/browser-extension).
- **Mobile App** (Android & iOS) — die vollständige Wallet: erstellen/wiederherstellen, quantensicheres QOR senden & empfangen, externe Netzwerke, Staking, Portfolio, Wiederherstellung und ein integrierter dApp-Browser. **Auf Google Play** für Android; über TestFlight für iOS (siehe Verfügbarkeit unten).

## Plattform-Verfügbarkeit

| Funktion | Mobile App (Android & iOS) | Browser-Erweiterung |
|---|---|---|
| Wallet erstellen / importieren | ✅ | ✅ (eigenständig) |
| QOR senden & empfangen (post-quanten) | ✅ | ✅ (aus dem Popup) |
| Externe Netzwerke (Ethereum, BNB Chain, Polygon, Arbitrum, Solana, Cosmos Hub, Osmosis, Celestia + Token) | ✅ | ✅ (Senden aus dem Popup) |
| Staking, Portfolio, Q-Day Scanner, Wiederherstellung, Legacy | ✅ | — |
| dApp-Verbindungen | ✅ (integrierter Browser) | ✅ (jede Website) |
| Konto (@handle, Zahlungsanfragen) | ✅ | — |
| Verknüpfung mehrerer Geräte | ✅ | — |
| Kopplung mit dem Dashboard | ✅ | ✅ (Verbinden + vorgeschlagene Überweisungen, v0.1.5) |

## Was QoreX anders macht

- **Standardmäßig quantensicher** — QOR-Überweisungen auf der Native-Lane tragen immer eine hybride Signatur aus ML-DSA-87 + secp256k1. Alles Klassische (externe Chains) wird eindeutig gekennzeichnet, niemals stillschweigend.
- **Wirklich nicht-verwahrend** — Schlüssel werden auf dem Gerät erzeugt und liegen in einem hardwaregestützten Tresor (Secure Enclave unter iOS, StrongBox unter Android) oder in einem verschlüsselten Tresor (Erweiterung). Sie verlassen dein Gerät niemals.
- **Keine Datenerhebung** — keine Analyse, kein Tracking und keine Werbung in irgendeiner QoreX-App. Eine optionale Kontoanmeldung bringt zusätzlichen Komfort (siehe [Konto & Dashboard](/qorex/account-and-dashboard)), doch die Wallet ist nie davon abhängig.
- **Ein einheitlicher Kontostand** — dein QOR ist ein einziger Kontostand über die Lanes Native, EVM und SVM hinweg; QoreX zeigt ihn als eine einzige Zahl an.
- **Mehrere Wiederherstellungswege** — eine 24-Wörter-Wiederherstellungsphrase (immer), optionale soziale Wiederherstellung mit Guardians und einer 48-Stunden-Zeitsperre, optionale Legacy-Nachlassregelung sowie die bequeme Verknüpfung mehrerer Geräte.

## Erste Schritte

- Neu bei QoreX? Beginne mit [Erste Schritte](/qorex/getting-started), um deine Wallet zu erstellen oder wiederherzustellen.
- Lerne anschließend, quantensicheres QOR zu [Senden & Empfangen](/qorex/send-and-receive).
- Richte dein Sicherheitsnetz unter [Sicherheit & Wiederherstellung](/qorex/security-and-recovery) ein.
- Installiere auf dem Desktop die [Browser-Erweiterung](/qorex/browser-extension).

:::note Download & Verfügbarkeit
- **Browser-Erweiterung** — live und öffentlich verfügbar: installiere sie über den [Chrome Web Store, Firefox Add-ons oder den Mac App Store (Safari)](/qorex/browser-extension#install).
- **Android-App** — verfügbar bei Google Play: https://play.google.com/store/apps/details?id=network.qore.qorex
- **iOS-App** — zum Testen verfügbar über **TestFlight**: https://testflight.apple.com/join/Xa9D7vgR — die Veröffentlichung im App Store befindet sich noch in Prüfung.

Installiere QoreX ausschließlich über einen offiziellen Store-Eintrag.
:::
