---
slug: /qorex/account-and-dashboard
title: Konto & Dashboard
sidebar_label: Konto & Dashboard
sidebar_position: 6
---

# Konto & Dashboard

QoreX funktioniert **vollständig ohne Konto** — Ihre Schlüssel hängen niemals von einem Konto ab. Die Anmeldung fügt Annehmlichkeiten wie Zahlungsanfragen und die Dashboard-Kopplung hinzu; auch das Beanspruchen eines @handle kann eine Anmeldung verlangen.

## Anmelden {#sign-in}

Sie können sich über **Anmelden** auf dem Home-Tab oder während des Onboardings anmelden. Methoden:

- **E-Mail-Code** — geben Sie Ihre E-Mail-Adresse ein und erhalten Sie einen Einmalcode. Nach dieser Anmeldung bietet QoreX an, einen **Passkey** für sofortige künftige Anmeldungen hinzuzufügen (Face ID / Touch ID / PIN). Dies ist ein *Konto*-Passkey — er berührt niemals Ihre Wallet-Schlüssel.
- **Passkey** — falls Sie zuvor einen registriert haben.
- **Mit Apple anmelden** *(nur iOS)* — Apple teilt nur Ihren Namen und Ihre E-Mail-Adresse und lässt Sie Ihre echte Adresse hinter einer privaten Relay-Adresse verbergen.
- **Mit Google fortfahren** — ein einzelner nativer Sprung durch das System-Authentifizierungsblatt (die App springt niemals in einen Browser hinaus).
- **Mit QORECHAIN Dashboard fortfahren** — melden Sie sich mit einem bestehenden Dashboard-Konto an (einschließlich dessen Google-Login) und importieren Sie Ihr Profil.

:::note
Das Passkey-Angebot erscheint nur nach der Anmeldung per **E-Mail-Code**. Wenn Sie sich mit einem Identitätsanbieter (Apple, Google oder Dashboard) anmelden, verwaltet dieser Anbieter seine eigene Authentifizierung, sodass diesen Konten kein Passkey zugeordnet werden kann.
:::

## Mehrere Konten aus einer Phrase {#accounts}

Einstellungen → **Ihre Konten** lässt Sie bis zu **20 Konten** pro Wallet erstellen und zwischen ihnen wechseln, die alle von derselben 24-Wort-Wiederherstellungsphrase abgeleitet sind (es gibt nichts Zusätzliches zu sichern). Jedes Konto ist eine eigene `qor1…`-Adresse mit eigenem Guthaben, einem eigenen optionalen @handle (ein Handle ist an eine **Adresse** gebunden, nicht an die Wallet) und — nach seiner ersten Überweisung — einem eigenen Post-Quanten-Schlüssel. Tippen Sie auf ein Konto, um es zum verwendeten Konto zu machen. Welches Konto gerade aktiv ist, bestimmt, welches Konto Senden, Empfangen, Staking und der dApp-Browser verwenden — der Wechsel nimmt alles mit, und die App zeigt an, auf welchem Konto Sie sich befinden, sobald mehr als eines existiert. Konten werden als *Account 1, 2, …* nummeriert; sie lassen sich nicht umbenennen. Die Browser-Erweiterung hat denselben Bildschirm — siehe [Mehrere Konten aus einer Phrase](/qorex/browser-extension#wallet).

- **Konto hinzufügen** fügt das nächste Konto derselben Phrase hinzu. Ein neues Konto registriert bei seiner ersten Überweisung seinen eigenen quantensicheren Schlüssel, was eine kleine einmalige Netzwerkgebühr kostet.
- **Ethereum-Konto hinzufügen (coin 60)** ist für eine Wiederherstellungsphrase gedacht, die zuerst in MetaMask oder im QoreChain Dashboard verwendet wurde — dort liegen ihre Guthaben. Es verwendet den Ethereum-Pfad `m/44'/60'` und ist mit *Ethereum · coin 60* beschriftet; seine `0x…`-Adresse ist auf jedem EVM-Netzwerk dieselbe und derselbe Schlüssel wie dieses QoreChain-Konto. Siehe [Eine Phrase aus MetaMask oder dem Dashboard wiederherstellen](/qorex/getting-started#restore-dashboard).
- **Wiederherstellen** einer Phrase auf einem neuen Gerät bringt nur **Account 1** zurück; verwenden Sie **Konto hinzufügen** (und **Ethereum-Konto hinzufügen (coin 60)**), um die übrigen zurückzuholen. Der Adressen-Bildschirm (**Einstellungen → Ihre Adressen**) ist davon getrennt: Er listet jedes Konto dieser Wallet plus schreibgeschützte Adressen auf, die aus anderen Wallets verknüpft wurden.

## @handle {#handle}

Beanspruchen Sie einen eindeutigen Namen (zum Beispiel `@liviu`), der durch **doppelte Signaturen** an Ihre Adresse gebunden wird (eine ed25519-Signatur der Registry + Ihre eigene secp256k1-Signatur). Jeder kann dann an Ihren @handle senden. Die Auflösung erfolgt nach dem Prinzip **verify-then-pin** (Trust-on-First-Use), sodass QoreX es meldet, falls der Schlüssel eines Handles jemals stillschweigend geändert wird.

Weil ein Handle an eine Adresse gebunden ist und nicht an Ihre Wallet, erfolgt die Beanspruchung **pro Adresse** — wenn Sie [mehrere Konten](#accounts) haben, kann jedes sein eigenes @handle tragen, und die Beanspruchung eines Handles für ein Konto gibt den anderen nicht automatisch einen Namen. In der Browser-Erweiterung können Sie an einen Handle zahlen; das Beanspruchen aus dem Popup wird in manchen Versionen für gewöhnliche QoreChain-Konten angeboten, in anderen nicht — bietet das Popup es nicht an, beanspruchen Sie den Handle in der mobilen App. Konten im Ethereum-Stil (coin 60) haben keinen Handle.

Wenn die Handle-Registry vorübergehend nicht erreichbar ist, wird der Bildschirm auf **„Handles demnächst verfügbar"** heruntergestuft und alles andere funktioniert weiter; Handles werden automatisch wieder aktiv, sobald die Registry zurückkehrt.

:::note Beanspruchung eines Handles vs. Verknüpfung mit dem Dashboard
Dies sind zwei getrennte, voneinander unabhängige Aktionen. Die Beanspruchung eines @handle ermöglicht es **anderen Personen, Ihnen unter Ihrem Namen zu senden** — mehr bewirkt sie von sich aus nicht. Die Verknüpfung mit dem Dashboard (unten) verbindet Ihre Wallet mit einem Dashboard-Konto, sodass beide dieselben Daten anzeigen können. Sie können das eine tun, ohne das andere zu tun.
:::

## Verknüpftes Konto {#linked-account}

**Einstellungen → Verknüpftes Konto** verbindet Ihre QoreX-Wallet und Ihr Dashboard-Konto in beide Richtungen:

1. Geben Sie den vom Dashboard angezeigten 8-stelligen Code ein **oder** erzeugen Sie einen in QoreX (10 Minuten gültig) und geben Sie ihn im Dashboard ein.
2. Wenn Sie [mehrere Konten](#accounts) haben, lässt Sie das eigene Bestätigungsfenster von QoreX auswählen, **welches Konto** verknüpft wird — es geht nicht einfach vom gerade aktiven Konto aus.
3. Nach der Verknüpfung erscheinen Ihr @handle und die verbundenen Adressen auf beiden.
4. Jederzeit trennbar.

Die Anmeldung *über* **Mit Dashboard fortfahren** verknüpft beide implizit — es ist nichts Weiteres zu tun.

## Dashboard-Integration {#dashboard}

Wenn das Dashboard verbunden ist:

- **Connect with QoreX** auf dem Dashboard koppelt es über einen `qorex://connect` Deep Link plus einen signierten Eigentumsnachweis mit Ihrer Wallet.
- **Auf dem Dashboard initiierte Überweisungen** treffen in QoreX als `qorex://tx`-Anfragen ein. Sie werden dekodiert, Ihnen vollständig angezeigt und **nur in der App** nach biometrischer Freigabe signiert — und nur von der eigenen abgeleiteten Adresse der App. Weil eine `qor1…`-Adresse auf Mainnet und Testnet gleichermaßen gültig ist, gibt jede vom Dashboard initiierte Anfrage an, welches Netzwerk sie anspricht, und QoreX verweigert die Ausführung, falls dies nicht mit dem Netzwerk übereinstimmt, mit dem Sie gerade verbunden sind — es wechselt niemals im Auftrag einer Anfrage das Netzwerk.
- Wenn eine Connect- oder Überweisungsanfrage eintrifft, während Sie **nicht angemeldet** sind, bietet QoreX einen eingebetteten Schritt **„Am Dashboard anmelden"** an, damit Sie fortfahren können, ohne in eine Sackgasse zu geraten.
- **Ihre Adressen (Einstellungen)** — listet jedes von dieser Wallet abgeleitete Konto sowie **schreibgeschützte** Adressen auf, die Sie aus anderen Wallets verknüpft haben (Keplr / MetaMask / Phantom). Schreibgeschützte Einträge sind mit der Wallet gekennzeichnet, die sie erstellt hat; beim Versuch, von einer solchen zu senden, wird erklärt, dass Sie von der Wallet senden müssen, die sie erstellt hat.

## Konto löschen {#delete-account}

Einstellungen → **Konto löschen** (der rote Eintrag ganz unten). Nach einer Bestätigung und einer biometrischen Entsperrung löscht QoreX dauerhaft: die Wallet und die privaten Schlüssel dieses Geräts; Ihren @handle in der QoreX-Registry (falls vorhanden); Ihr QoreChain-Dashboard-Konto (falls Sie angemeldet waren); und Ihre Social-Recovery-Einrichtung (falls konfiguriert). Dies lässt sich nicht rückgängig machen. Da QoreX non-custodial ist, **verlieren Sie den Zugriff auf alle Guthaben, wenn Sie Ihre Wiederherstellungsphrase nicht gesichert haben** — sichern Sie sie zuerst. Die serverseitigen Löschungen erfolgen nach bestem Bemühen; das Löschen auf dem Gerät wird immer abgeschlossen und bringt die App zurück zum Bildschirm des ersten Starts.

## Nächste Schritte

- [Sicherheit & Wiederherstellung](/qorex/security-and-recovery) — Sicherung, Wiederherstellung und das EVM-Zugriffsfenster.
- [dApp-Browser](/qorex/dapp-browser) — verbinden Sie sich mit Apps von innerhalb von QoreX.
