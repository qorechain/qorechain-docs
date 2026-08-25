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
- **Mobile App** (Android & iOS) — die vollständige Wallet: erstellen/wiederherstellen, quantensicheres QOR senden & empfangen, externe Netzwerke, Staking, Portfolio, Wiederherstellung und ein integrierter dApp-Browser. **Auf Google Play** für Android und **im App Store** für iOS (siehe Verfügbarkeit unten).

## Plattform-Verfügbarkeit {#platform-availability}

| Funktion | Mobile App (Android & iOS) | Browser-Erweiterung |
|---|---|---|
| Wallet erstellen / importieren | ✅ | ✅ (eigenständig) |
| Mehrere Konten aus einer Wiederherstellungsphrase | ✅ (bis zu 20) | ✅ *(ab 0.2.2)* |
| QOR senden & empfangen (post-quanten) | ✅ | ✅ (aus dem Popup, inkl. Empfangs-QR) |
| Ein @handle bezahlen / beanspruchen | ✅ | ✅ |
| Staking (delegieren, Delegierung aufheben, beanspruchen) | ✅ | ✅ *(ab 0.2.2 — eigener Stake-Bildschirm, kann außerdem eine vom Dashboard übermittelte Staking-Anfrage freigeben)* |
| Externe Netzwerke (Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis, Celestia + Token) | ✅ | ✅ (Senden aus dem Popup) |
| Oberflächensprache (10 Sprachen) | ✅ (folgt dem Telefon) | ✅ (folgt dem Browser) |
| Portfolio, Q-Day Scanner, Social Recovery, Legacy | ✅ | — |
| dApp-Verbindungen | ✅ (integrierter Browser) | ✅ (jede Website) |
| Konto-Anmeldung & Zahlungsanfragen | ✅ | — |
| Verknüpfung mehrerer Geräte | ✅ | — |
| Dashboard-Kopplung | ✅ | ✅ (Verbinden + vorgeschlagene Überweisungen, inkl. Staking) |

:::note Staking in der Erweiterung erfordert 0.2.2 oder neuer
Ist deine Erweiterung älter als 0.2.2, kann die Staking-Schaltfläche des Dashboards melden, dass die Erweiterung aktualisiert werden muss — selbst wenn du bereits einen aktuellen Build nutzt. Die Korrektur, die die Staking-Anfrage des Dashboards mit der Erweiterung verbindet, ist mit 0.2.2 ausgeliefert worden. Prüfe [welche Version wo live ist](/qorex/browser-extension#versions); hat dein Store 0.2.2 noch nicht veröffentlicht, funktioniert die Staking-Freigabe automatisch, sobald es so weit ist — ohne dass du etwas tun musst.
:::

## Warum QoreX anders ist

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
- **Browser-Erweiterung** — live und öffentlich verfügbar: installiere sie über den [Chrome Web Store, Firefox Add-ons oder den Mac App Store (Safari)](/qorex/browser-extension#install). Siehe [welche Version wo live ist](/qorex/browser-extension#versions) — neuere Funktionen werden in manchen Browsern möglicherweise noch ausgerollt.
- **Android-App** — live im Produktivbetrieb bei Google Play: https://play.google.com/store/apps/details?id=network.qore.qorex
- **iOS-App** — live im **App Store**: https://apps.apple.com/us/app/qorex-wallet/id6791256626.

Die Store-Prüfung läuft nach ihrem eigenen Zeitplan, sodass die neueste Version manchmal einen Store vor dem anderen erreicht — das genaue aktuelle Bild findest du unter [welche Version wo live ist](#platform-availability) weiter unten. Installiere immer über einen offiziellen Store-Eintrag.
:::

:::note Welche Version wo live ist
Store-Freigaben treffen zu unterschiedlichen Zeiten ein, daher kann sich die untenstehende Version je nach Plattform kurzzeitig unterscheiden:

| Plattform | Live-Version |
|---|---|
| Android | 1.0.4 |
| iOS | 1.0.2 (ein Update befindet sich in Prüfung) |
| Firefox | 0.2.2 |
| Chrome | 0.1.5 (0.1.9 befindet sich in Prüfung; eine spätere Einreichung von 0.2.2 folgt, sobald diese Prüfung abgeschlossen ist) |
| Safari (macOS) | 1.3, mit Erweiterung 0.2.2 |

Diese Seite beschreibt den aktuellen Funktionsumfang von QoreX — ein Store, der noch eine ältere Version ausliefert, wird automatisch aktualisiert, ohne dass du etwas tun musst.
:::
