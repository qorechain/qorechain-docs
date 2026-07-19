---
slug: /qorex/dapp-browser
title: dApp-Browser
sidebar_label: dApp-Browser
sidebar_position: 7
---

# dApp-Browser (mobil)

QoreX enthält einen integrierten **dApp-Browser**, damit Sie QoreChain-Anwendungen nutzen können, ohne die Wallet zu verlassen, wobei jede Signatur ausdrücklich bestätigt wird.

## Verbindung zu einer dApp

Öffnen Sie den **dApp-Browser** über den Tab Home und navigieren Sie zu einer App. QoreX injiziert seine Provider in die Seite — einen QoreChain-Connect-Provider, einen schreibgeschützten EVM-Provider sowie höfliche `keplr`- / `ethereum`-Aliase, die andere echte Wallets **niemals kapern**.

- **Das Verbinden** erfordert **eine Bestätigung pro Origin**. Durch die Bestätigung wird der Website ausschließlich Ihre öffentliche Adresse offengelegt.
- **Jede Signatur** ist eine eigene, biometrisch abgesicherte Bestätigung, wobei die Nutzlast **dekodiert** wird, sodass Sie genau sehen, was Sie signieren — es gibt **kein Blindsignieren**.
- **Alle Berechtigungen erlöschen, wenn der Browser geschlossen wird** — Verbindungen sind auf die Sitzung beschränkt.

## Q-Day Scanner

Über die Schnellzugriffs-Schaltflächen im Tab Home können Sie auch den **Q-Day Scanner** öffnen: Geben Sie eine beliebige Adresse ein, um deren Quantenexpositionsbericht zu erhalten — welche Guthaben auf rein klassischen Schlüsseln liegen und welche bereits post-quanten-geschützt sind. Siehe [Sicherheit & Wiederherstellung](/qorex/security-and-recovery#q-day-scanner).

## Einstellungen — Kurzübersicht

Weitere nützliche Steuerungen in den **Einstellungen**:

- **Sicherheits-Dashboard** → [Sicherheit & Wiederherstellung](/qorex/security-and-recovery)
- **Ihre Adressen** und **Verknüpftes Konto** → [Konto & Dashboard](/qorex/account-and-dashboard)
- **Testnet verwenden (Entwickler)** — wechselt zum `qorechain-diana`-Testnet (EVM chain ID 9800); die App bindet sich live neu ein, ohne Neustart. Die Standardeinstellung ist immer Mainnet.
- **Portfolio-Animation** — schaltet den Aurora-Hintergrund um.
- **Netzwerkstatus** — zeigt "Connected to …" mit den aktiven Endpunkten an.

## Plattformhinweise

- **iOS** — Face ID (bei der ersten Verwendung erscheint eine Nutzungsaufforderung), ein Secure-Enclave-Tresor, Anmeldung über das systemeigene Authentifizierungsblatt und eine Kameraberechtigung für die Geräteverknüpfung und das QR-Scannen.
- **Android** — BiometricPrompt mit einem StrongBox-Keystore, registrierte Deep Links für `qorex://`-Abläufe (Auth-Callback, Connect, Tx, Link) und eine Kameraberechtigung für die Geräteverknüpfung.

Für Desktop-dApps verwenden Sie stattdessen die [Browser-Erweiterung](/qorex/browser-extension).
