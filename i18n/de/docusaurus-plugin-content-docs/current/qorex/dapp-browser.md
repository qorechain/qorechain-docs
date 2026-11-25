---
slug: /qorex/dapp-browser
title: dApp-Browser
sidebar_label: dApp-Browser
sidebar_position: 7
---

# dApp-Browser (mobil)

QoreX enthält einen integrierten **dApp-Browser**, damit Sie QoreChain-Anwendungen nutzen können, ohne die Wallet zu verlassen, wobei jede Signatur ausdrücklich bestätigt wird. Er richtet sich an mobile Nutzer, die eine Web-App verwenden möchten, ohne etwas anderes zu installieren, und an Entwickler, die ihre App in der mobilen Wallet testen.

## Innovationen {#innovations}

- **Eine Bestätigung pro Website, jederzeit widerrufbar.** Jede Origin wird einzeln bestätigt; verbundene Websites werden auf diesem Gerät je Wallet gespeichert, und Sie können jede davon unter [Schutz meines Geldes](/qorex/security-and-recovery#protection) widerrufen.
- **Dekodierte, biometrisch abgesicherte Signaturen.** Jede Signatur ist eine eigene Bestätigung mit dekodierter Nutzlast; was QoreX nicht dekodieren kann, lehnt es ab.
- **`signAndBroadcast`.** Eine Seite sendet die Nachrichten; QoreX zeigt sie an, fügt die ML-DSA-87-Schicht hinzu, die nur die Wallet erzeugen kann, und sendet die Transaktion.
- **EVM- und Nachrichtensignierung im Browser.** EVM-dApps können Nachrichten, typisierte Daten und Transaktionen auf QoreChain signieren lassen, wobei die Wirkung jeder davon zuvor dekodiert und simuliert wird, und jede Seite kann um eine Nachrichtensignatur bitten, die auch eine ML-DSA-87-Hälfte trägt.
- **Eine Seite aus einem Link öffnen.** Ein `browse`-Link öffnet Ihre Seite direkt im dApp-Browser, und die Startseite speichert Ihre Favoriten und zuletzt besuchten Websites auf dem Gerät.
- **Auffindbarkeit ohne Übernahme.** QoreX meldet sich über EIP-6963 an und überschreibt niemals `window.ethereum` oder `window.keplr` einer anderen Wallet.

## Zugang {#how-to-access}

Der dApp-Browser ist Teil der mobilen App: Installieren Sie sie aus dem App Store (iOS 15.1 oder neuer) oder von Google Play (Android 7.0 oder neuer); die Links stehen in der [Übersicht](/qorex/overview#how-to-access). Es ist kein Konto erforderlich. Für Desktop-dApps verwenden Sie die [Browser-Erweiterung](/qorex/browser-extension).

## Verbindung zu einer dApp {#how-to-use}

Öffnen Sie den **dApp-Browser** über den Tab Home und navigieren Sie zu einer App. Geben Sie die Adresse der dApp in das Feld **dApp-URL eingeben** ein oder fügen Sie sie dort ein (nur `https://`-Adressen verbinden sich). QoreX injiziert seine Provider als `window.qorex` in die Seite - einen QoreChain-Native-Provider (einschließlich `signAndBroadcast`, `signDirect` und Nachrichtensignierung), einen EVM-Provider und ein Solana-Provider-Objekt - und meldet sich außerdem über EIP-6963 an. Es setzt `window.ethereum` nur, wenn keine andere Wallet es gesetzt hat, und überschreibt niemals eine andere Wallet. Es gibt keinen `window.keplr`-Alias. Für Entwickler: siehe [Eine dApp in QoreX integrieren](/qorex/dapp-integration).

### Favoriten und zuletzt besuchte Websites {#favourites}

Die Startseite des Browsers listet Ihre **Favoriten** und unter **Zuletzt** Ihre zuletzt besuchten Websites (die letzten 8). Tippen Sie auf den Stern in der Adressleiste, um die offene Seite als Favorit zu behalten (erneutes Tippen entfernt sie), und nutzen Sie die Home-Schaltfläche, um zur Liste zurückzukehren. **Leeren** leert die Liste der zuletzt besuchten Seiten. Eine Seite, die Sie über einen [browse-Link](#browse-links) geöffnet haben, zählt als Besuch. Beide Listen bleiben auf diesem Telefon und werden ohne Query und Fragment der Seite gespeichert.

### Eine Seite aus einem Link öffnen {#browse-links}

Ein Link im Web kann eine Seite im dApp-Browser öffnen: `https://link.qore.network/browse?url=<encoded https address>` oder `qorex://browse?url=<encoded https address>`. QoreX verlangt zuerst die biometrische Abfrage, die den dApp-Browser öffnet. Es lehnt eine Adresse ab, die nicht `https://` auf einem Domainnamen ist oder die einen Port, einen Benutzernamen, eine IP-Adresse oder `localhost` enthält. Der Link gibt der Seite nichts: Sie muss weiterhin um eine Verbindung bitten, und jede Signatur läuft weiterhin über das Bestätigungsfenster. Ist keine Wallet auf dem Telefon, bleibt die App beim Onboarding. Siehe [Links, die ein Dienst erzeugen kann](/qorex/dapp-integration#links).

- **Das Verbinden** erfordert **eine Bestätigung pro Origin**. Durch die Bestätigung wird der Website ausschließlich Ihre öffentliche Adresse offengelegt.
- **Jede Signatur** ist eine eigene, biometrisch abgesicherte Bestätigung, wobei die Nutzlast **dekodiert** wird, sodass Sie genau sehen, was Sie signieren - es gibt **kein Blindsignieren**.
- **Verbindungen bestehen, bis Sie sie widerrufen.** Ab 1.2.5 wird die Adresse der Website auf diesem Gerät je Wallet gespeichert. Verbundene Websites sehen und widerrufen Sie unter [Schutz meines Geldes](/qorex/security-and-recovery#protection). Eine Verbindung signiert niemals von sich aus etwas: Jede Signatur benötigt weiterhin ihre eigene Bestätigung.
- **Native Transaktionen laufen über `signAndBroadcast`:** QoreX zeigt jede Nachricht, die Gebühr und das signierende Konto an, fügt die ML-DSA-87-Schicht hinzu und sendet die Transaktion. Siehe [Was das Bestätigungsfenster zeigt](/qorex/security-and-recovery#approvals).
- **EVM-dApps** können `personal_sign`, typisierte Daten und Transaktionen auf QoreChain anfragen. Das Bestätigungsfenster dekodiert sie und zeigt, was die Transaktion mit Ihrem Guthaben macht, soweit das Netzwerk es zulässt. Auf dem EVM-Kanal von QoreChain öffnet die Bestätigung außerdem das kurze Autorisierungsfenster, das die Transaktion benötigt, und nennt jeden Vertrag, den es zulässt; siehe [EVM-Zugriffsfenster](/qorex/security-and-recovery#evm-window). Nur aus MetaMask importierte Konten können auf diesem Kanal senden.
- **Nachrichtensignierung:** Eine Seite kann Sie bitten, eine Nachricht zu signieren; Sie sehen sie vorher vollständig.
- **Netzwerk:** Eine Seite kann das Netzwerk nicht wechseln. Wechseln Sie es in QoreX selbst (siehe die Einstellungen unten), und die Seite muss im selben Netzwerk wie die Wallet sein.

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
- **Entwicklermodus** - standardmäßig aus; fügt einen Tab Entwickler mit Werkzeugen für alle hinzu, die auf QoreChain entwickeln. Siehe [Entwicklermodus](/qorex/developer-mode).
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
- Der In-App-Browser signiert nur im aktiven Netzwerk von QoreChain und sendet nur das EVM-Ereignis `connect`: Er wird geschlossen, um Konto oder Netzwerk zu wechseln. Er signiert keine Solana-Transaktionen und hat kein Ethereum-Netzwerk.
- `window.qorex.native` ist im Keplr-Stil, aber kein Drop-in-Ersatz für Keplr, und es gibt keinen `window.keplr`-Alias. Amino-Signierung wird abgelehnt.
- Der Q-Day Scanner, die Social Recovery und Legacy sind in der App enthalten, nicht in der Erweiterung.
