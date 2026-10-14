---
slug: /qorex/dapp-browser
title: dApp-Browser
sidebar_label: dApp-Browser
sidebar_position: 7
---

# dApp-Browser (mobil)

QoreX enthält einen integrierten **dApp-Browser**, damit Sie QoreChain-Anwendungen nutzen können, ohne die Wallet zu verlassen, wobei jede Signatur ausdrücklich bestätigt wird.

## Verbindung zu einer dApp

Öffnen Sie den **dApp-Browser** über den Tab Home und navigieren Sie zu einer App. Geben Sie die Adresse der dApp in das Feld **Enter a dApp URL** ein oder fügen Sie sie dort ein (nur `https://`-Adressen verbinden sich). QoreX injiziert seine Provider als `window.qorex` in die Seite — einen QoreChain-Native-Provider (einschließlich `signAndBroadcast`), einen schreibgeschützten EVM-Provider (nur Konto- und Chain-Abfragen) und einen Solana-Provider — und meldet sich außerdem über EIP-6963 an. Es setzt `window.ethereum` nur, wenn keine andere Wallet es gesetzt hat, und überschreibt niemals eine andere Wallet. Es gibt keinen `window.keplr`-Alias.

- **Das Verbinden** erfordert **eine Bestätigung pro Origin**. Durch die Bestätigung wird der Website ausschließlich Ihre öffentliche Adresse offengelegt.
- **Jede Signatur** ist eine eigene, biometrisch abgesicherte Bestätigung, wobei die Nutzlast **dekodiert** wird, sodass Sie genau sehen, was Sie signieren — es gibt **kein Blindsignieren**.
- **Alle Berechtigungen erlöschen, wenn der Browser geschlossen wird** — Verbindungen sind auf die Sitzung beschränkt.
- **Native Transaktionen laufen über `signAndBroadcast`:** QoreX zeigt jede Nachricht, die Gebühr und das signierende Konto an, fügt die quantensichere Schicht hinzu und sendet die Transaktion. Der EVM-Provider hier beantwortet nur Konto- und Chain-Abfragen; er signiert oder sendet keine EVM-Transaktionen. Siehe [Was das Bestätigungsfenster zeigt](/qorex/security-and-recovery#approvals).

## Q-Day Scanner

Über die Schnellzugriffs-Schaltflächen im Tab Home können Sie auch den **Q-Day Scanner** öffnen: Geben Sie eine beliebige Adresse ein, um deren Quantenexpositionsbericht zu erhalten — welche Guthaben auf rein klassischen Schlüsseln liegen und welche bereits post-quanten-geschützt sind. Siehe [Sicherheit & Wiederherstellung](/qorex/security-and-recovery#q-day-scanner).

## Einstellungen — Kurzübersicht

Weitere nützliche Einträge in den **Einstellungen**:

- **Sicherheit** → [Sicherheit & Wiederherstellung](/qorex/security-and-recovery)
- **Sprache** — folgt standardmäßig dem Telefon; 10 Sprachen
- **Rundgang erneut starten** — fünf kurze Karten dazu, was QoreX tut und wo sich was befindet
- **Coins und Netzwerke** — alles, was die Wallet heute halten und senden kann
- **Wallets** — mehrere Wiederherstellungsphrasen auf diesem Telefon — siehe [Mehrere Wallets](/qorex/getting-started#several-wallets)
- **Ihre Konten** und **Ihre Adressen** → [Konto & Dashboard](/qorex/account-and-dashboard)
- **Claim your @handle** und **Verknüpftes Konto** → [Konto & Dashboard](/qorex/account-and-dashboard)
- **Testnet verwenden (Entwickler)** — wechselt zum `qorechain-diana`-Testnet (EVM chain ID 9800); die App bindet sich live neu ein, ohne Neustart. Die Standardeinstellung ist immer Mainnet. Testnet-Guthaben zeigen keinen USD-Wert an.
- **Portfolio-Animation** — schaltet den Aurora-Hintergrund um.
- **Konto löschen** → [Ihr Konto löschen](/qorex/account-and-dashboard#delete-account)
- **Connected to** — zeigt das aktive Netzwerk und seine Chain-ID an.

## Plattformhinweise

- **iOS** (iOS 15.1 oder neuer) — Face ID (bei der ersten Verwendung erscheint eine Nutzungsaufforderung), ein Secure-Enclave-Tresor, Anmeldung über das systemeigene Authentifizierungsblatt und eine Kameraberechtigung für die Geräteverknüpfung und das QR-Scannen.
- **Android** (Android 7.0 oder neuer) — BiometricPrompt mit einem StrongBox-Keystore, registrierte Deep Links für `qorex://`-Abläufe (Auth-Callback, Connect, Tx, Link) und eine Kameraberechtigung für die Geräteverknüpfung.

Für Desktop-dApps verwenden Sie stattdessen die [Browser-Erweiterung](/qorex/browser-extension).
