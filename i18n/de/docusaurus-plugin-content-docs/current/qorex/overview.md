---
slug: /qorex/overview
title: QoreX Wallet
sidebar_label: Überblick
sidebar_position: 1
---

# QoreX Wallet

**QoreX** ist die offizielle **nicht-verwahrende** Wallet für **QoreChain**, das quantensichere Layer 1 (Mainnet `qorechain-vladi`). Ihre privaten Schlüssel werden **ausschließlich auf Ihrem Gerät** erzeugt und gespeichert — die QoreChain Association hat niemals Zugriff auf Ihre Guthaben, und die Apps erfassen **keinerlei Daten**. Jede QOR-Übertragung auf der Native-Lane trägt eine **hybride Post-Quanten-Signatur** (ML-DSA-87, NIST FIPS-204, kombiniert mit secp256k1), sodass Ihre Guthaben sowohl gegen klassische als auch gegen Quantenangreifer geschützt sind.

QoreX besteht aus zwei Teilen, die zusammenarbeiten:

- **Mobile App** (iOS & Android) — die vollständige Wallet: erstellen/wiederherstellen, quantensicheres QOR senden & empfangen, externe Netzwerke, Staking, Portfolio, Wiederherstellung und ein integrierter dApp-Browser.
- **Browser-Erweiterung** (Chrome & Firefox, mit Safari aus derselben Codebasis) — der dApp-Connector für den Desktop: Sie ermöglicht Websites, Ihre Wallet zu erkennen, und verwandelt jede Anfrage in eine explizite Freigabe.

## Plattformverfügbarkeit

| Funktion | iOS/Android-App | Chrome/Firefox-Erweiterung |
|---|---|---|
| Wallet erstellen / wiederherstellen / verknüpfen | ✅ | — (koppelt mit der App) |
| QOR senden & empfangen (Post-Quanten) | ✅ | via dApp-Signierung |
| Externe Netzwerke (ETH / BNB / POL / ARB / SOL + Tokens) | ✅ | ✅ (aus dem Popup senden) |
| Staking, Portfolio, Q-Day Scanner, Wiederherstellung, Legacy | ✅ | — |
| dApp-Verbindungen | ✅ (integrierter Browser) | ✅ (jede Website) |
| Konto (@handle, Zahlungsanfragen, Dashboard-Verknüpfung) | ✅ | — |

## Warum QoreX anders ist

- **Standardmäßig quantensicher** — QOR-Übertragungen auf der Native-Lane tragen stets eine hybride ML-DSA-87 + secp256k1-Signatur. Alles Klassische (externe Chains) ist klar gekennzeichnet, niemals stillschweigend.
- **Wirklich nicht-verwahrend** — Schlüssel werden auf dem Gerät erzeugt und liegen in einem hardwaregestützten Tresor (Secure Enclave unter iOS, StrongBox unter Android) oder einem verschlüsselten Tresor (Erweiterung). Sie verlassen niemals Ihr Gerät.
- **Keine Datenerfassung** — keine Analyse, kein Tracking, keine Werbung in irgendeiner QoreX-App. Eine optionale Konto-Anmeldung bietet zusätzlichen Komfort (siehe [Konto & Dashboard](/qorex/account-and-dashboard)), doch die Wallet ist niemals darauf angewiesen.
- **Ein einheitliches Guthaben** — Ihr QOR ist ein einziges Guthaben über die Native-, EVM- und SVM-Lanes hinweg; QoreX zeigt es als einzelne Zahl an.
- **Mehrere Wiederherstellungswege** — eine 24-Wort-Wiederherstellungsphrase (immer), optionale soziale Wiederherstellung mit Guardians und einem 48-Stunden-Timelock, optionale Legacy-Vererbung und komfortable Geräteverknüpfung über mehrere Geräte hinweg.

## Erste Schritte

- Neu bei QoreX? Beginnen Sie mit [Erste Schritte](/qorex/getting-started), um Ihre Wallet zu erstellen oder wiederherzustellen.
- Lernen Sie dann, quantensicheres QOR zu [Senden & Empfangen](/qorex/send-and-receive).
- Richten Sie Ihr Sicherheitsnetz unter [Sicherheit & Wiederherstellung](/qorex/security-and-recovery) ein.
- Installieren Sie auf dem Desktop die [Browser-Erweiterung](/qorex/browser-extension).

:::note Download & Verfügbarkeit
QoreX **1.0** wird nach und nach in den App-Stores ausgerollt — die iOS- und Android-Apps (App Store und Google Play) sowie die Browser-Erweiterung (Chrome Web Store, Firefox Add-ons und ein Safari-Build). Einzelne Ziele befinden sich möglicherweise gerade noch in der Prüfungsschlange eines Stores. Die aktuellen, offiziellen Download-Links finden Sie stets auf [qorechain.io](https://qorechain.io), und installieren Sie QoreX ausschließlich aus einem offiziellen Store-Eintrag.
:::
