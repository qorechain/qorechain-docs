---
slug: /qorex/overview
title: QoreX Wallet
sidebar_label: Übersicht
sidebar_position: 1
---

# QoreX Wallet

**QoreX** ist die offizielle **nicht-verwahrende** Wallet für **QoreChain**, das quantensichere Layer 1 (Mainnet `qorechain-vladi`). Deine privaten Schlüssel werden **ausschließlich auf deinem Gerät** erzeugt und gespeichert — die QoreChain Association hat niemals Zugriff auf deine Gelder und die Apps sammeln **keine Daten**. Jede QOR-Überweisung auf der Native-Lane trägt eine **hybride Post-Quanten-Signatur** (ML-DSA-87, NIST FIPS-204, kombiniert mit secp256k1), sodass deine Gelder sowohl gegen klassische als auch gegen Quanten-Angreifer geschützt sind.

QoreX besteht aus zwei Teilen, die zusammenarbeiten:

- **Mobile App** (iOS & Android) — die vollständige Wallet: Erstellen/Wiederherstellen, quantensicheres QOR senden & empfangen, externe Netzwerke, Staking, Portfolio, Wiederherstellung und ein integrierter dApp-Browser.
- **Browser-Erweiterung** (Chrome & Firefox; Safari ausstehend) — der dApp-Connector für den Desktop: Sie ermöglicht Websites, deine Wallet zu erkennen, und verwandelt jede Anfrage in eine ausdrückliche Freigabe.

## Plattform-Verfügbarkeit

| Funktion | iOS/Android-App | Chrome/Firefox-Erweiterung |
|---|---|---|
| Wallet erstellen / wiederherstellen / verknüpfen | ✅ | — (koppelt mit der App) |
| QOR senden & empfangen (Post-Quanten) | ✅ | per dApp-Signatur |
| Externe Netzwerke (ETH / BNB / POL / ARB / SOL + Tokens) | ✅ | ✅ (aus dem Popup senden) |
| Staking, Portfolio, Q-Day Scanner, Wiederherstellung, Legacy | ✅ | — |
| dApp-Verbindungen | ✅ (integrierter Browser) | ✅ (jede Website) |
| Konto (@handle, Zahlungsanfragen, Dashboard-Verknüpfung) | ✅ | — |

## Warum QoreX anders ist

- **Standardmäßig quantensicher** — QOR-Überweisungen auf der Native-Lane tragen immer eine hybride ML-DSA-87- + secp256k1-Signatur. Alles Klassische (externe Chains) ist klar gekennzeichnet, niemals stillschweigend.
- **Wirklich nicht-verwahrend** — Schlüssel werden auf dem Gerät erzeugt und liegen in einem hardwaregestützten Tresor (Secure Enclave auf iOS, StrongBox auf Android) oder einem verschlüsselten Tresor (Erweiterung). Sie verlassen niemals dein Gerät.
- **Keine Datenerfassung** — keine Analyse, kein Tracking, keine Werbung in irgendeiner QoreX-App. Eine optionale Konto-Anmeldung bietet Zusatzfunktionen (siehe [Konto & Dashboard](/qorex/account-and-dashboard)), aber die Wallet ist niemals darauf angewiesen.
- **Ein einheitliches Guthaben** — dein QOR ist ein einziges Guthaben über die Native-, EVM- und SVM-Lane hinweg; QoreX zeigt es als eine einzige Zahl an.
- **Mehrere Wiederherstellungswege** — eine 24-word-Wiederherstellungsphrase (immer), optionale Social Recovery mit Guardians und einem 48-hour-Timelock, optionale Legacy-Vererbung und bequeme Multi-Geräte-Verknüpfung.

## Erste Schritte

- Neu bei QoreX? Beginne mit [Erste Schritte](/qorex/getting-started), um deine Wallet zu erstellen oder wiederherzustellen.
- Lerne dann, quantensicheres QOR zu [Senden & Empfangen](/qorex/send-and-receive).
- Richte dein Sicherheitsnetz unter [Sicherheit & Wiederherstellung](/qorex/security-and-recovery) ein.
- Installiere auf dem Desktop die [Browser-Erweiterung](/qorex/browser-extension).

:::note Download
QoreX für iOS und Android ist im App Store und bei Google Play veröffentlicht, und die Browser-Erweiterung im Chrome Web Store und bei Firefox Add-ons. Die aktuellen Download-Links findest du auf [qorechain.io](https://qorechain.io). Installiere QoreX nur aus einem offiziellen Store-Eintrag.
:::
