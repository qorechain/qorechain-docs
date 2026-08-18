---
slug: /qorex/overview
title: QoreX Wallet
sidebar_label: Übersicht
sidebar_position: 1
---

# QoreX Wallet

**QoreX** ist die offizielle **nicht-verwahrende** Wallet für **QoreChain**, das quantensichere Layer 1 (Mainnet `qorechain-vladi`). Deine privaten Schlüssel werden **ausschließlich auf deinem Gerät** erzeugt und gespeichert — die QoreChain Association hat niemals Zugriff auf dein Guthaben, und die Apps sammeln **keine Daten**. Jeder QOR-Transfer auf der Native-Lane trägt eine **hybride Post-Quanten-Signatur** (ML-DSA-87, NIST FIPS-204, kombiniert mit secp256k1), sodass dein Guthaben sowohl gegen klassische als auch gegen Quanten-Angreifer geschützt ist.

QoreX besteht aus zwei Teilen, die zusammenarbeiten:

- **Browser-Erweiterung** — die Desktop-Wallet, **live und öffentlich in Chrome, Firefox und Safari (macOS)**. Sie ist eine eigenständige Wallet (erstellen/importieren, QOR halten und senden) und zugleich der Connector, der jeder Website ermöglicht, QoreX zu erkennen und jede Anfrage in eine ausdrückliche Freigabe zu verwandeln. Siehe [Browser-Erweiterung](/qorex/browser-extension).
- **Mobile App** (Android & iOS) — die vollständige Wallet: erstellen/wiederherstellen, quantensichere QOR senden & empfangen, externe Netzwerke, Staking, Portfolio, Wiederherstellung und ein integrierter dApp-Browser. Derzeit im öffentlichen Test (siehe Verfügbarkeit unten).

## Plattformverfügbarkeit

| Funktion | Mobile App (Android & iOS) | Browser-Erweiterung |
|---|---|---|
| Wallet erstellen / importieren | ✅ | ✅ (eigenständig) |
| QOR senden & empfangen (Post-Quanten) | ✅ | ✅ (über das Popup) |
| Externe Netzwerke (ETH / BNB / POL / ARB / SOL + Tokens) | ✅ | über dApp-Signierung |
| Staking, Portfolio, Q-Day Scanner, Wiederherstellung, Legacy | ✅ | — |
| dApp-Verbindungen | ✅ (integrierter Browser) | ✅ (jede Website) |
| Konto (@handle, Zahlungsanfragen) | ✅ | — |
| Multi-Geräte-Verknüpfung | ✅ | — |
| Dashboard-Kopplung | ✅ | ✅ (Verbindung + vorgeschlagene Transfers, v0.1.5) |

## Warum QoreX anders ist

- **Quantensicher standardmäßig** — QOR-Transfers auf der Native-Lane tragen immer eine hybride Signatur aus ML-DSA-87 + secp256k1. Alles Klassische (externe Chains) ist klar gekennzeichnet, niemals stillschweigend.
- **Wirklich nicht-verwahrend** — Schlüssel werden auf dem Gerät erzeugt und liegen in einem hardwaregestützten Tresor (Secure Enclave auf iOS, StrongBox auf Android) oder einem verschlüsselten Tresor (Erweiterung). Sie verlassen dein Gerät niemals.
- **Keine Datenerfassung** — keine Analyse, kein Tracking, keine Werbung in irgendeiner QoreX-App. Eine optionale Kontoanmeldung fügt Annehmlichkeiten hinzu (siehe [Konto & Dashboard](/qorex/account-and-dashboard)), aber die Wallet hängt niemals davon ab.
- **Ein einheitliches Guthaben** — dein QOR ist ein einziges Guthaben über die Native-, EVM- und SVM-Lanes hinweg; QoreX zeigt es als eine einzige Zahl an.
- **Mehrere Wiederherstellungswege** — eine 24-Wörter-Wiederherstellungsphrase (immer), optionale Social Recovery mit Guardians und einer 48-Stunden-Zeitsperre, optionale Legacy-Vererbung sowie bequeme Multi-Geräte-Verknüpfung.

## Erste Schritte

- Neu bei QoreX? Beginne mit [Erste Schritte](/qorex/getting-started), um deine Wallet zu erstellen oder wiederherzustellen.
- Lerne dann, quantensichere QOR zu [Senden & Empfangen](/qorex/send-and-receive).
- Richte dein Sicherheitsnetz unter [Sicherheit & Wiederherstellung](/qorex/security-and-recovery) ein.
- Installiere am Desktop die [Browser-Erweiterung](/qorex/browser-extension).

:::note Download & Verfügbarkeit
- **Browser-Erweiterung** — live und öffentlich: Installiere sie aus dem [Chrome Web Store, den Firefox Add-ons oder dem Mac App Store (Safari)](/qorex/browser-extension#install).
- **Android-App** — verfügbar für **öffentliche Tests** bei Google Play.
- **iOS-App** — verfügbar zum Testen über **TestFlight**, falls du sie ausprobieren möchtest.

Die aktuellen, offiziellen Links findest du auf [qorechain.io](https://qorechain.io), und installiere QoreX nur aus einer offiziellen Quelle.
:::
