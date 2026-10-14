---
slug: /qorex/overview
title: QoreX Wallet
sidebar_label: Überblick
sidebar_position: 1
---

# QoreX Wallet

**QoreX** ist die offizielle **nicht-verwahrende** Wallet für **QoreChain**, die quantensichere Layer 1 (Mainnet `qorechain-vladi`). Deine privaten Schlüssel werden **ausschließlich auf deinem Gerät** erzeugt und gespeichert — die QoreChain Association hat niemals Zugriff auf deine Mittel, und die Apps enthalten **keine Analyse, kein Tracking und keine Werbung**. Jede QOR-Überweisung auf der Native-Lane trägt eine **hybride Post-Quanten-Signatur** (ML-DSA-87, NIST FIPS-204, kombiniert mit secp256k1), sodass deine Mittel sowohl gegen klassische als auch gegen Quantenangreifer geschützt sind.

QoreX besteht aus zwei Teilen, die zusammenarbeiten:

- **Browser-Erweiterung** — die Desktop-Wallet, **live und öffentlich verfügbar für Chrome, Firefox und Safari (macOS)**. Sie ist eine eigenständige Wallet (erstellen/importieren, QOR halten und senden) und zugleich der Konnektor, über den jede Website QoreX erkennen und jede Anfrage in eine ausdrückliche Freigabe verwandeln kann. Siehe [Browser-Erweiterung](/qorex/browser-extension).
- **Mobile App** (Android & iOS) — die vollständige Wallet: erstellen/wiederherstellen, quantensicheres QOR senden & empfangen, externe Netzwerke, Staking, Portfolio, Wiederherstellung und ein integrierter dApp-Browser. **Auf Google Play** für Android und **im App Store** für iOS (siehe Verfügbarkeit unten).

:::caution Sichere deine Wiederherstellungsphrase, sobald du eine Wallet erstellst
QoreX ist nicht-verwahrend: Die QoreChain Association kann eine verlorene Wallet weder wiederherstellen noch zurücksetzen noch für dich zurückholen. **Das Deinstallieren der App, das Zurücksetzen des Telefons oder das Entfernen der Erweiterung löscht deine Schlüssel von diesem Gerät.** Schreibe deine 24-Wörter-Wiederherstellungsphrase auf (die mobile App zeigt sie beim Erstellen der Wallet nicht an — lasse sie dir unter **Einstellungen → Sicherheit → Wiederherstellungsphrase anzeigen** anzeigen; die Erweiterung zeigt sie einmal bei der Erstellung) und richte, wenn du kannst, die [soziale Wiederherstellung](/qorex/security-and-recovery#social-recovery) ein. Siehe [Jetzt sichern](/qorex/security-and-recovery#back-up-now).
:::

## Plattform-Verfügbarkeit {#platform-availability}

| Funktion | Mobile App (Android & iOS) | Browser-Erweiterung |
|---|---|---|
| Wallet erstellen / importieren | ✅ (die App zeigt die Phrase beim Erstellen der Wallet nicht an — lasse sie dir unter Einstellungen → Sicherheit anzeigen) | ✅ (eigenständig; die Phrase wird einmal bei der Erstellung angezeigt) |
| Mehrere Wallets, jede mit eigener Wiederherstellungsphrase | ✅ (Einstellungen → Wallets) | ✅ (**Wallets**, ein Passwort für alle) |
| Mehrere Konten aus einer Wiederherstellungsphrase | ✅ (bis zu 20 pro Wallet) | ✅ |
| Ethereum-artiges Konto (Coin 60), von Hand hinzugefügt | ✅ | ✅ |
| QOR senden & empfangen (post-quanten) | ✅ | ✅ (Senden; Empfangen mit QR) |
| Auf jedem unterstützten Netzwerk empfangen | ✅ | ✅ |
| Ein @handle bezahlen / beanspruchen | ✅ | ✅ Bezahlen; das Beanspruchen wird in einigen Erweiterungsversionen für gewöhnliche QoreChain-Konten angeboten — andernfalls in der App beanspruchen |
| Staking: delegieren, Delegierung aufheben, Stake verschieben, beanspruchen, beanspruchen & erneut staken | ✅ | ✅ |
| Externe Netzwerke (Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis, Celestia + Token) | ✅ | ✅ (Senden aus dem Popup) |
| Token per Contract hinzufügen (EVM-Netzwerke) | ✅ | ✅ |
| EVM-Zugriffsfenster | ✅ | ✅ |
| Oberflächensprache (10 Sprachen) | ✅ (folgt dem Telefon) | ✅ (folgt dem Browser) |
| Portfolio, Q-Day Scanner, Social Recovery, Legacy | ✅ | — |
| Suche, Einführungstour beim ersten Start, Home-Bildschirm-Widget, Push-Benachrichtigungen | ✅ | — |
| dApp-Verbindungen | ✅ (integrierter Browser, auf die Sitzung beschränkt) | ✅ (jede Website; **Verbundene Websites** mit Widerrufen) |
| Swap | Nur Android, deaktiviert bis Pool-Liquidität vorhanden ist (unter iOS nicht angezeigt) | — |
| Konto-Anmeldung & Zahlungsanfragen | ✅ | — |
| Verknüpfung mehrerer Geräte | ✅ | — |
| Dashboard-Kopplung | ✅ | ✅ (Verbinden + vorgeschlagene Überweisungen, inkl. Staking) |

## Warum QoreX anders ist

- **Standardmäßig quantensicher** — QOR-Überweisungen auf der Native-Lane tragen immer eine hybride Signatur aus ML-DSA-87 + secp256k1. Alles Klassische (externe Chains) wird eindeutig gekennzeichnet, niemals stillschweigend.
- **Wirklich nicht-verwahrend** — Schlüssel werden auf dem Gerät erzeugt und liegen in einem hardwaregestützten Tresor (Secure Enclave unter iOS, StrongBox unter Android) oder in einem verschlüsselten Tresor (Erweiterung). Sie verlassen dein Gerät niemals.
- **Keine Analyse, kein Tracking, keine Werbung** in irgendeiner QoreX-App. Optionale Extras nutzen einen Server nur, wenn du sie einschaltest: die Kontoanmeldung (siehe [Konto & Dashboard](/qorex/account-and-dashboard)) und Push-Benachrichtigungen, die dein Gerät und deine *öffentlichen* Adressen registrieren, damit QoreX dir mitteilen kann, wenn QOR eintrifft. Die Wallet ist von keinem von beiden abhängig.
- **Ein einheitlicher Kontostand** — dein QOR ist ein einziger Kontostand über die Lanes Native, EVM und SVM hinweg; QoreX zeigt ihn als eine einzige Zahl an.
- **Mehrere Wiederherstellungswege** — eine 24-Wörter-Wiederherstellungsphrase (immer; auf dem Handy unter Einstellungen → Sicherheit anzeigen), optionale soziale Wiederherstellung mit Guardians und einer 48-Stunden-Zeitsperre, optionale Legacy-Nachlassregelung sowie die bequeme Verknüpfung mehrerer Geräte.

## Erste Schritte

- Neu bei QoreX? Beginne mit [Erste Schritte](/qorex/getting-started), um deine Wallet zu erstellen oder wiederherzustellen.
- Lerne anschließend, quantensicheres QOR zu [Senden & Empfangen](/qorex/send-and-receive).
- Richte dein Sicherheitsnetz unter [Sicherheit & Wiederherstellung](/qorex/security-and-recovery) ein.
- Installiere auf dem Desktop die [Browser-Erweiterung](/qorex/browser-extension).

## Download & Verfügbarkeit {#availability}

- **Browser-Erweiterung** — live und öffentlich verfügbar: installiere sie über den [Chrome Web Store, Firefox Add-ons oder den Mac App Store (Safari)](/qorex/browser-extension#install). Installiere immer über einen offiziellen Store-Eintrag.
- **Android-App** — live im Produktivbetrieb bei Google Play: https://play.google.com/store/apps/details?id=network.qore.qorex (Android 7.0 oder neuer).
- **iOS-App** — live im **App Store**: https://apps.apple.com/us/app/qorex-wallet/id6791256626 (iOS 15.1 oder neuer).

## Welche Version wo live ist {#versions}

Die Store-Prüfung läuft nach ihrem eigenen Zeitplan, sodass ein Store kurzzeitig einen älteren oder neueren Build ausliefern kann als ein anderer. Stand **15. Oktober 2026**:

| Plattform | Live-Version |
|---|---|
| Android | 1.1.6 |
| iOS | 1.1.6 |
| Chrome | 0.3.6 |
| Firefox | 0.3.7 (ein Punkt-Release nach 0.3.6) |
| Safari (macOS) | 1.7.6, mit Erweiterung 0.3.6 |

Diese Dokumentation beschreibt den Funktionsumfang 1.1.6 / 0.3.6. Ein Store, der noch einen älteren Build ausliefert, wird automatisch aufschließen; die Stores zeigen immer ihre aktuelle Version an. Highlights seit 1.0.9 / 0.2.6:

- **Mehrere Wallets** auf einem Telefon oder in einem Browser, jede mit eigener Wiederherstellungsphrase und Umschalten mit einem Tipp — siehe [Mehrere Wallets](/qorex/getting-started#several-wallets).
- **Ethereum-artiges Konto (Coin 60)**, von Hand hinzugefügt, für Phrasen, die zuerst in MetaMask oder im Dashboard verwendet wurden — siehe [Eine Phrase aus MetaMask oder dem Dashboard wiederherstellen](/qorex/getting-started#restore-dashboard).
- **Token per Contract hinzufügen**, **Auf jedem Netzwerk empfangen**, globale **Suche**, eine **Tour** beim ersten Start, ein **Home-Bildschirm-Widget** und **Push-Benachrichtigungen**, wenn QOR eintrifft (mobil) — siehe [Senden & Empfangen](/qorex/send-and-receive).
- **Beanspruchen & erneut staken**, eine Gebührenprüfung vor dem Beanspruchen, eine Liste **Unstaking läuft** und Warnungen, bevor du so staket, dass du dir die Möglichkeit zum Unstaken selbst verbaust — siehe [Portfolio & Staking](/qorex/portfolio-and-staking).
- Freigabe-Bildschirme, die jede Nachricht, die Gebühr, Ausgabenlimits und den Ablauf anzeigen und ablehnen, was QoreX nicht darstellen kann; **`signAndBroadcast`** für dApps; **Verbundene Websites** mit Widerrufen (Erweiterung); das **EVM-Zugriffsfenster** — siehe [Sicherheit & Wiederherstellung](/qorex/security-and-recovery) und die [Browser-Erweiterung](/qorex/browser-extension).
- Korrekturen: Ein finanziertes Konto konnte kurzzeitig aus „Deine Konten“ verschwinden (1.0.9); die Android-Hardware-Zurück-Taste geht jetzt einen Bildschirm zurück (1.1.1); die Wiederherstellungsphrase wird unter Android 14 und neuer Nicht-Bedienungshilfen-Diensten vorenthalten (1.1.6).
