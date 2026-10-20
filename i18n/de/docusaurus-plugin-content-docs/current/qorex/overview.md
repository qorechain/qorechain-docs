---
slug: /qorex/overview
title: QoreX Wallet
sidebar_label: Überblick
sidebar_position: 1
---

# QoreX Wallet

**QoreX** ist die offizielle **nicht-verwahrende** Wallet für **QoreChain**, die quantensichere Layer 1 (Mainnet `qorechain-vladi`). Deine privaten Schlüssel werden **ausschließlich auf deinem Gerät** erzeugt und gespeichert — die QoreChain Association hat niemals Zugriff auf deine Mittel, und die Apps enthalten **keine Analyse, keine Absturzberichte und kein Tracking-SDK** — Schlüssel, Wiederherstellungsphrase, Tresor und Freigaben verlassen dein Gerät niemals (siehe [Was QoreX über das Netzwerk sendet](#data-and-privacy)). Jede QOR-Überweisung auf der Native-Lane trägt eine **hybride Post-Quanten-Signatur** (ML-DSA-87, NIST FIPS-204, kombiniert mit secp256k1), sodass deine Mittel sowohl gegen klassische als auch gegen Quantenangreifer geschützt sind.

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
| Ein @handle bezahlen | ✅ | ✅ |
| Ein @handle beanspruchen | ✅ (erfordert ein angemeldetes Konto) | — (die Erweiterung verweist dich auf die App) |
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
- **Keine Analyse, keine Absturzberichte, kein Tracking-SDK** in irgendeiner QoreX-App. Einige optionale Extras sprechen nur dann mit einem Server, wenn du sie einschaltest: die Kontoanmeldung (siehe [Konto & Dashboard](/qorex/account-and-dashboard)) und Push-Benachrichtigungen, die dein Gerät und deine *öffentlichen* Adressen registrieren, damit QoreX dir mitteilen kann, wenn QOR eintrifft. Die Wallet ist von keinem von beiden abhängig. Die vollständige Liste findest du unter [Was QoreX über das Netzwerk sendet](#data-and-privacy).
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

Die Store-Prüfung läuft nach ihrem eigenen Zeitplan, sodass jeder Store seinen eigenen Build ausliefert und Google Play sowie der Chrome Web Store derzeit hinter den anderen zurückliegen. Dies ist die aktuelle Version **in jedem Store** Stand **20. Oktober 2026**:

| Store | Aktuelle Version | Hinweis |
|---|---|---|
| Apple App Store (iOS) | 1.1.7 | am 15. Oktober veröffentlicht |
| Google Play (Android) | 1.1.6 | 1.1.7 ist hochgeladen, aber noch nicht öffentlich — der öffentliche Eintrag zeigt noch 1.1.6 |
| Chrome Web Store | 0.3.6 | liefert weiterhin 0.3.6 aus |
| Firefox Add-ons | 0.3.7 | |
| Safari (Mac App Store) | 1.7.7, mit Erweiterung 0.3.7 | der Mac App Store verwendet eine eigene `1.x`-Nummerierung |

Die Stores zeigen immer ihre aktuelle Version an, und ein Store, der noch einen älteren Build ausliefert, schließt automatisch auf. Unten mit **1.1.7 / 0.3.7** markierte Funktionen sind in den Stores der Tabelle live, die diesen Build bereits führen (iOS, Firefox, Safari), und erreichen Google Play und Chrome, sobald diese Einträge aktualisiert werden. Nichts Neueres als 1.1.7 / 0.3.7 wird in diesem Handbuch als verfügbar beschrieben.

Was die Builds 1.1.7 / 0.3.7 für dich geändert haben:

- **Freigaben lehnen eine Anfrage ab, deren Bytes auf zwei Arten gelesen werden können.** Taucht dasselbe Feld in einer Anfrage zweimal auf, könnten ein Bildschirm und die Chain darüber uneins sein, was signiert wird — zum Beispiel eine Gebühr oder ein Betrag, der anders angezeigt wird als der ausgeführte. QoreX lehnt eine solche Anfrage jetzt ab, statt eine Lesart davon anzuzeigen. Siehe [Was das Freigabefenster zeigt](/qorex/security-and-recovery#approvals).
- **Das Ablaufdatum einer Berechtigung wird sekundengenau angezeigt**, und Governance-Abstimmungen werden dekodiert und auf dem Freigabebildschirm angezeigt.
- **Websites werden anhand der Origin identifiziert, die der Browser selbst bestätigt**, nicht anhand dessen, was eine Anfrage über sich selbst behauptet.
- **@handle-Abfragen funktionieren in der Erweiterung wieder.**
- **Das Beanspruchen eines @handle erfordert ein angemeldetes Konto und erfolgt in der App**; die Erweiterung verweist dich dorthin.
- **Zum Verwechseln ähnliche QoreChain-Namen sind reserviert**, sodass ein neuer Handle das Projekt oder seine Mitarbeitenden nicht nachahmen kann.

Highlights seit 1.0.9 / 0.2.6:

- **Mehrere Wallets** auf einem Telefon oder in einem Browser, jede mit eigener Wiederherstellungsphrase und Umschalten mit einem Tipp — siehe [Mehrere Wallets](/qorex/getting-started#several-wallets).
- **Ethereum-artiges Konto (Coin 60)**, von Hand hinzugefügt, für Phrasen, die zuerst in MetaMask oder im Dashboard verwendet wurden — siehe [Eine Phrase aus MetaMask oder dem Dashboard wiederherstellen](/qorex/getting-started#restore-dashboard).
- **Token per Contract hinzufügen**, **Auf jedem Netzwerk empfangen**, globale **Suche**, eine **Tour** beim ersten Start, ein **Home-Bildschirm-Widget** und **Push-Benachrichtigungen**, wenn QOR eintrifft (mobil) — siehe [Senden & Empfangen](/qorex/send-and-receive).
- **Beanspruchen & erneut staken**, eine Gebührenprüfung vor dem Beanspruchen, eine Liste **Unstaking läuft** und Warnungen, bevor du so staket, dass du dir die Möglichkeit zum Unstaken selbst verbaust — siehe [Portfolio & Staking](/qorex/portfolio-and-staking).
- Freigabe-Bildschirme, die jede Nachricht, die Gebühr, Ausgabenlimits und den Ablauf anzeigen und ablehnen, was QoreX nicht darstellen kann; **`signAndBroadcast`** für dApps; **Verbundene Websites** mit Widerrufen (Erweiterung); das **EVM-Zugriffsfenster** — siehe [Sicherheit & Wiederherstellung](/qorex/security-and-recovery) und die [Browser-Erweiterung](/qorex/browser-extension).
- Korrekturen: Ein finanziertes Konto konnte kurzzeitig aus „Deine Konten“ verschwinden (1.0.9); die Android-Hardware-Zurück-Taste geht jetzt einen Bildschirm zurück (1.1.1); die Wiederherstellungsphrase wird unter Android 14 und neuer Nicht-Bedienungshilfen-Diensten vorenthalten (1.1.6).

QoreX arbeitet auf dem Mainnet `qorechain-vladi`, das mit Chain **v3.2.3** läuft (live seit dem 7. Juni 2026). Signaturformat, Adressen, Dezimalstellen, Memos und Gebühren haben sich bei diesem Upgrade nicht geändert, daher ist dafür kein QoreX-Update nötig.

## Was QoreX über das Netzwerk sendet {#data-and-privacy}

QoreX hat **keine Analyse, keine Absturzberichte und kein Tracking-SDK**. Deine Schlüssel, deine Wiederherstellungsphrase, der Tresor und deine Freigaben **verlassen das Gerät niemals**. Die Apps sprechen mit dem Netzwerk, wie es jede Wallet muss; dies ist die vollständige Liste.

**Immer (nötig, um Kontostände anzuzeigen und zu senden):**

- **Öffentliche QoreChain-Endpunkte** (`api`, `rpc`, `evm` und `svm` auf `qore.host` sowie die `-testnet`-Entsprechungen) für Kontostände, Verlauf und das Broadcasten. Diese Anfragen enthalten deine **öffentliche** `qor1…`-Adresse.
- **Preisabfrage** — eine Anfrage für den QOR-Preis, die **keine Adresse** enthält.
- **Externe Netzwerke, die du hältst oder ansiehst** — öffentliche RPC-/REST-Dienste Dritter für dieses Netzwerk, die deine **öffentliche** Adresse in diesem Netzwerk enthalten.
- **@handle-Registry** — enthält den Handle, den du nachschlägst, oder eine öffentliche Adresse.

**Nur wenn du es einschaltest:**

- **Push-Benachrichtigungen** (mobil) — aus, bis du sie aktivierst. Der Server erhält dann dein Geräte-Token und die öffentlichen `qor1…`-Adressen der verwendeten Wallet (bis zu 10). Ein Gerät, von dem der Server 90 Tage nichts gehört hat, wird vergessen.
- **Soziale Wiederherstellung** — das Relay speichert **nur Chiffretext**.
- **Anmeldung** (E-Mail oder Apple oder Google) — nötig, um einen @handle zu beanspruchen, um das Dashboard zu verknüpfen und um Zahlungsanfragen zu verwenden.
- **Dashboard-Verbindung und verknüpfte Adressen** — sendet einen signierten Nachweis, dass dir die Adresse gehört.
- **Zahlungsanfragen** — senden den Absender-Handle, den Empfänger-Handle, den Betrag und eine optionale Notiz.

**Das Home-Bildschirm-Widget** stellt von sich aus keine Anfrage an QoreChain-Server: Die App übergibt ihm deine Adresse, den Kontostand und das Datenschutz-Flag lokal, und das Widget aktualisiert den Kontostand über den öffentlichen QoreChain-REST-Endpunkt.

In keiner der beiden Apps gibt es **einen KI-Chat oder einen QCAI-Dienst**.
