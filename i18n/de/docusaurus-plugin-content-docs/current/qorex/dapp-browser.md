---
slug: /qorex/dapp-browser
title: dApp-Browser
sidebar_label: dApp-Browser
sidebar_position: 7
---

# dApp-Browser (mobil)

QoreX enthält einen integrierten **dApp-Browser**, damit Sie QoreChain-Anwendungen nutzen können, ohne die Wallet zu verlassen, wobei jede Signatur ausdrücklich bestätigt wird. Er richtet sich an mobile Nutzer, die eine Web-App verwenden möchten, ohne etwas anderes zu installieren, und an Entwickler, die ihre App in der mobilen Wallet testen.

## Innovationen {#innovations}

- **Sitzungsbezogene Verbindungen.** Eine Bestätigung pro Origin, und jede Verbindung endet, wenn Sie den Browser schließen.
- **Dekodierte, biometrisch abgesicherte Signaturen.** Jede Signatur ist eine eigene Bestätigung mit dekodierter Nutzlast; was QoreX nicht dekodieren kann, lehnt es ab.
- **`signAndBroadcast`.** Eine Seite sendet die Nachrichten; QoreX zeigt sie an, fügt die ML-DSA-87-Schicht hinzu, die nur die Wallet erzeugen kann, und sendet die Transaktion.
- **Auffindbarkeit ohne Übernahme.** QoreX meldet sich über EIP-6963 an und überschreibt niemals `window.ethereum` oder `window.keplr` einer anderen Wallet.

## Zugang {#how-to-access}

Der dApp-Browser ist Teil der mobilen App: Installieren Sie sie aus dem App Store (iOS 15.1 oder neuer) oder von Google Play (Android 7.0 oder neuer); die Links stehen in der [Übersicht](/qorex/overview#how-to-access). Es ist kein Konto erforderlich. Für Desktop-dApps verwenden Sie die [Browser-Erweiterung](/qorex/browser-extension).

## Verbindung zu einer dApp {#how-to-use}

Öffnen Sie den **dApp-Browser** über den Tab Home und navigieren Sie zu einer App. Geben Sie die Adresse der dApp in das Feld **Enter a dApp URL** ein oder fügen Sie sie dort ein (nur `https://`-Adressen verbinden sich). QoreX injiziert seine Provider als `window.qorex` in die Seite - einen QoreChain-Native-Provider (einschließlich `signAndBroadcast`), einen schreibgeschützten EVM-Provider (nur Konto- und Chain-Abfragen) und einen Solana-Provider - und meldet sich außerdem über EIP-6963 an. Es setzt `window.ethereum` nur, wenn keine andere Wallet es gesetzt hat, und überschreibt niemals eine andere Wallet. Es gibt keinen `window.keplr`-Alias.

- **Das Verbinden** erfordert **eine Bestätigung pro Origin**. Durch die Bestätigung wird der Website ausschließlich Ihre öffentliche Adresse offengelegt.
- **Jede Signatur** ist eine eigene, biometrisch abgesicherte Bestätigung, wobei die Nutzlast **dekodiert** wird, sodass Sie genau sehen, was Sie signieren - es gibt **kein Blindsignieren**.
- **Alle Berechtigungen erlöschen, wenn der Browser geschlossen wird** - Verbindungen sind auf die Sitzung beschränkt.
- **Native Transaktionen laufen über `signAndBroadcast`:** QoreX zeigt jede Nachricht, die Gebühr und das signierende Konto an, fügt die ML-DSA-87-Schicht hinzu und sendet die Transaktion. Der EVM-Provider hier beantwortet nur Konto- und Chain-Abfragen; er signiert oder sendet keine EVM-Transaktionen. Siehe [Was das Bestätigungsfenster zeigt](/qorex/security-and-recovery#approvals).

## Q-Day Scanner

Über die Schnellzugriffs-Schaltflächen im Tab Home können Sie auch den **Q-Day Scanner** öffnen: Geben Sie eine beliebige Bitcoin- oder Ethereum-Adresse ein, um einen Expositionsbericht zu erhalten. Siehe [Sicherheit & Wiederherstellung](/qorex/security-and-recovery#q-day-scanner).

## Einstellungen - Kurzübersicht

Weitere nützliche Einträge in den **Einstellungen**:

- **Sicherheit** → [Sicherheit & Wiederherstellung](/qorex/security-and-recovery)
- **Sprache** - folgt standardmäßig dem Telefon; 10 Sprachen
- **Rundgang erneut starten** - fünf kurze Karten dazu, was QoreX tut und wo sich was befindet
- **Coins und Netzwerke** - alles, was die Wallet heute halten und senden kann
- **Wallets** - mehrere Wiederherstellungsphrasen auf diesem Telefon - siehe [Mehrere Wallets](/qorex/getting-started#several-wallets)
- **Ihre Konten** und **Ihre Adressen** → [Konto & Dashboard](/qorex/account-and-dashboard)
- **Claim your @handle** und **Verknüpftes Konto** → [Konto & Dashboard](/qorex/account-and-dashboard)
- **Testnet verwenden (Entwickler)** - wechselt zum `qorechain-diana`-Testnet (EVM chain ID 9800); die App bindet sich live neu ein, ohne Neustart. Die Standardeinstellung ist immer Mainnet. Testnet-Guthaben zeigen keinen USD-Wert an.
- **Portfolio-Animation** - schaltet den Aurora-Hintergrund um.
- **Konto löschen** → [Ihr Konto löschen](/qorex/account-and-dashboard#delete-account)
- **Connected to** - zeigt das aktive Netzwerk und seine Chain-ID an.

## Plattformhinweise

- **iOS** (iOS 15.1 oder neuer) - Face ID (bei der ersten Verwendung erscheint eine Nutzungsaufforderung), ein Secure-Enclave-Tresor, Anmeldung über das systemeigene Authentifizierungsblatt und eine Kameraberechtigung für die Geräteverknüpfung und das QR-Scannen.
- **Android** (Android 7.0 oder neuer) - BiometricPrompt mit einem StrongBox-Keystore, registrierte Deep Links für `qorex://`-Abläufe (Auth-Callback, Connect, Tx, Link) und eine Kameraberechtigung für die Geräteverknüpfung.

Für Desktop-dApps verwenden Sie stattdessen die [Browser-Erweiterung](/qorex/browser-extension).

## Wo es veröffentlicht ist {#where-published}

Der dApp-Browser wird innerhalb der mobilen QoreX-App ausgeliefert (App Store und Google Play); die Einträge und aktuellen Versionen finden Sie unter [Wo es veröffentlicht ist](/qorex/overview#where-published). Es ist kein separater Download.

## Grenzen und bekannte Probleme {#limits}

- Nur `https://`-Adressen verbinden sich.
- Der EVM-Provider hier beantwortet nur Konto- und Chain-Abfragen; er signiert oder sendet keine EVM-Transaktionen oder -Nachrichten. `signArbitrary` (Nachrichtensignierung) wird nicht unterstützt.
- `window.qorex.native` ist im Keplr-Stil, aber kein Drop-in-Ersatz für Keplr, und es gibt keinen `window.keplr`-Alias.
- Verbindungen bleiben nicht bestehen: Sie enden, wenn der Browser geschlossen wird.
- Der Q-Day Scanner, die Social Recovery und Legacy sind in der App enthalten, nicht in der Erweiterung.
