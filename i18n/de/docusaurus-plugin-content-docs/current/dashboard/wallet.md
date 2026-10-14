---
slug: /dashboard/wallet
title: Wallet
sidebar_label: Wallet
sidebar_position: 3
---

# Wallet

Auf der **Wallet**-Seite sehen Sie Ihren Kontostand und Ihren Transaktionsverlauf, empfangen QOR und senden es. Wie die Seite funktioniert, hängt vom Netzwerk ab:

- **Mainnet — non-custodial.** Das Dashboard verwahrt keine Mainnet-Schlüssel. Sie verbinden Ihre eigene Wallet — **QoreX** (die offizielle QoreChain-Wallet, als Erweiterung oder App), **Keplr** oder **MetaMask** — Ihr echter Kontostand und Verlauf werden direkt von der Chain gelesen, und Sie können auf jedem Rail Guthaben empfangen. Senden und Staken auf dem **Native-Rail erfordern QoreX**: QoreChain-Konten signieren mit einer post-quantum-hybriden Signatur, und QoreX ist die Wallet, die diese erzeugt — deshalb laufen die Tabs „Senden" und „Staken" des Dashboards über QoreX, unabhängig davon, welche andere Wallet Sie zusätzlich verbunden haben. Keplr kann weiterhin verbunden werden, um Ihren Native-Rail-Kontostand (`qor1...`) einzusehen und um darauf Guthaben zu empfangen. **MetaMask** verbindet sich auf dem **EVM-Rail** (`0x...`) und signiert EVM-Transaktionen selbst, doch seit Chain v3.2.0 lässt der EVM-Lane eine Transaktion nur von einem Konto zu, das einen registrierten Post-Quantum-Schlüssel **und** ein offenes EVM-Autorisierungsfenster hat. MetaMask kann diesen Schlüssel weder registrieren noch ein Fenster öffnen; QoreX kann das. Siehe [Senden mit MetaMask](#send-metamask).
- **Testnet — custodial.** Das Dashboard verwaltet für Sie eine Test-Wallet, sodass Sie Transfers, Swaps und Staking ganz ohne Einrichtung ausprobieren können. Füllen Sie sie über den [Faucet](/dashboard/faucet) auf.

Konten sind mit quantensicherer Kryptografie geschützt, und die Native-Kodierung jeder Adresse verwendet das `qor`-Bech32-Präfix (`qor1...`).

## Ein Konto, drei Kodierungen {#one-account-three-encodings}

Ein QoreChain-Konto ist eine einzige Identität, die auf drei Arten geschrieben werden kann — eine pro Ausführungs-Rail:

| Rail | Kodierung | Sieht aus wie |
| --- | --- | --- |
| **Native QOR** | bech32 | `qor1...` |
| **EVM** | hex | `0x...` |
| **SVM** | base58 | z. B. `5Gv7...` |

Alle drei Kodierungen verweisen auf **dasselbe Konto und denselben Kontostand**. Guthaben, das auf einem beliebigen Rail empfangen wird, landet in Ihrem einen Kontostand, und das Dashboard indiziert Kontostand und Verlauf über die `qor1`-(Native-)Kodierung, sodass Aktivitäten von jedem Rail gemeinsam angezeigt werden.

## Die Wallet im Mainnet verwenden {#mainnet}

1. Stellen Sie den Dashboard-Header auf **Mainnet** um.
2. Bestätigen Sie bei Aufforderung die [einmalige Risikobestätigung](/dashboard/overview#risk-acknowledgement) — im Mainnet werden echte Gelder bewegt, das Dashboard ist non-custodial, und Transaktionen sind unwiderruflich.
3. Wählen Sie auf dem Verbindungsbildschirm eine Wallet aus — **Mit QoreX verbinden** (empfohlen, die offizielle QoreChain-Wallet — erforderlich zum Senden und Staken auf dem Native-Rail), **Keplr verbinden** (zum Ansehen/Empfangen auf dem Native-Rail) oder **MetaMask verbinden** (zum Verbinden und Empfangen auf dem EVM-Rail; zum Senden ist ein offenes EVM-Fenster nötig, siehe [Senden mit MetaMask](#send-metamask)). Die Schritt-für-Schritt-Anleitung für jede finden Sie unten. Phantom kann hier nicht als Wallet verbunden werden; siehe den Hinweis unter [Verbinden mit Keplr](#connect-keplr).
4. Die Seite lädt Ihren echten Kontostand und Transaktionsverlauf von der Chain.

Nach dem Verbinden gliedert die Wallet-Seite alles in sechs Tabs: **Wallet** (Kontostand und Kontoübersicht), **Senden von QoreX**, **Staken / Delegieren**, **Rewards**, **Details** (Ihre `qor1...`-/`0x...`-/SVM-Adressen) und **Wallets verbinden** (jede von Ihnen angebundene Wallet, und wo Sie weitere verbinden). Die Tabs „Senden", „Staken" und „Rewards" laufen über QoreX — das gilt auch dann, wenn Sie zusätzlich Keplr oder MetaMask verbunden haben, weil Native-Rail-Transaktionen die post-quantum-hybride Signatur benötigen, die QoreX erzeugt.

Falls in Ihrer Wallet QoreChain noch nicht konfiguriert ist, fügen Sie es zuerst hinzu — siehe [QoreChain zu Ihrer Wallet hinzufügen](#add-network).

### Verbinden mit QoreX — Browser-Erweiterung {#connect-qorex-extension}

1. Suchen Sie auf der Wallet-Seite die Karte **QoreX-Wallet** und wählen Sie **Mit QoreX verbinden**.
2. Da die QoreX-Erweiterung in diesem Browser erkannt wird, fragt das Dashboard, wie Sie sich verbinden möchten. Wählen Sie **Browser-Erweiterung**.
3. Die QoreX-Erweiterung öffnet ihr eigenes Genehmigungs-Popup und zeigt `dashboard.qorechain.io` als die Seite an, die die Verbindung anfordert.
4. Prüfen Sie die Anfrage im Popup und genehmigen Sie sie — dies signiert einen einmaligen Nachweis, dass Ihnen die Adresse `qor1...` gehört; es werden keine Gelder bewegt und keine weitere Berechtigung erteilt.
5. Das Popup schließt sich, und das Dashboard zeigt auf der QoreX-Karte **Verbunden: qor1...** an, wobei Ihre Adresse den Rest der Wallet-Seite freischaltet. Die Wahl zwischen Erweiterung und App wird gespeichert, sodass beim nächsten Auswählen von **Mit QoreX verbinden** in diesem Browser dieselbe Methode ohne erneute Nachfrage verwendet wird — verwenden Sie **Andere Methode verwenden** auf der Verbindungskarte, wenn Sie jemals wechseln möchten.

Sie können mehr als eine QoreX-Adresse mit demselben Dashboard-Konto verknüpfen — zum Beispiel eine von einer Firefox-Erweiterung und eine von Chrome, oder ein Smartphone und ein Laptop. Wählen Sie **Weitere Wallet hinzufügen**, um den Ablauf mit einer zweiten Adresse zu wiederholen; jeder verknüpften Adresse kann eine eigene Bezeichnung gegeben werden, und eine wird als Standard fürs Senden markiert, beides im Tab **Wallets verbinden**.

**Zwischen Wallets im Tab Wallet wechseln.** Sobald mehr als eine Wallet verbunden ist — QoreX und MetaMask, oder zwei QoreX-Adressen — erscheint oben im Tab **Wallet** selbst eine mit **Ansicht** eingeleitete Reihe von Wallet-Chips, einer pro verbundener Wallet, wobei die aktive markiert ist. Klicken Sie auf einen Chip, um zu wechseln, dessen Kontostand und Verlauf Sie gerade betrachten, ohne den Tab zu verlassen oder zu **Wallets verbinden** zu gehen. Die Reihe wird ausgeblendet, wenn nur eine Wallet verbunden ist, da eine Auswahl dann nichts zu tun hätte.

**Konten in Ihrer QoreX-Erweiterung, die noch nicht verknüpft sind.** Eine Wiederherstellungsphrase kann mehrere Konten ableiten, und das Anlegen eines Kontos in QoreX teilt dem Dashboard nichts mit — das Verknüpfen ist ein separater, signierter Schritt. Kann die QoreX-Erweiterung ihre Konten auflisten, zeigen die Tabs **Wallet**, **Details** und **Wallets verbinden** eine Karte wie „2 Konten in Ihrer QoreX-Erweiterung sind hier nicht verknüpft", mit dem Kontostand jedes Kontos (und wie viel davon gestaket ist, was nicht gesendet werden kann). Wählen Sie **Dieses Konto verknüpfen**, um es zu koppeln; durch das Verknüpfen kann das Dashboard Kontostand und Verlauf anzeigen, und es gewährt keine Kontrolle über Ihre Schlüssel. Kann Ihr QoreX-Build nicht auswählen, welches Konto nachgewiesen werden soll, lässt sich von hier aus nur das aktive Konto verknüpfen — die Karte fordert Sie dann auf, zuerst in QoreX zu dem Konto zu wechseln.

Im Tab **Details** listet **Verknüpfte Adressen** jede mit Ihrem Konto verbundene Adresse mit ihrer Herkunfts-Wallet auf; Sie können eine Adresse umbenennen, eine als Standard fürs Senden markieren und sehen, ob sie in QoreX steuerbar oder nur beobachtbar (Vorhängeschloss) ist.

### Verbinden mit QoreX — Mobile App {#connect-qorex-app}

1. Suchen Sie auf der Wallet-Seite die Karte **QoreX-Wallet** und wählen Sie **Mit QoreX verbinden**.
2. Falls die Erweiterungsauswahl erscheint, wählen Sie **QoreX-App** (wird in diesem Browser keine Erweiterung erkannt, führt das Dashboard direkt zu diesem Ablauf).
3. Das Dashboard zeigt einen QR-Code und einen Link **QoreX öffnen** an.
4. Öffnen Sie auf Ihrem Smartphone die QoreX-App und scannen Sie damit den QR-Code — oder tippen Sie, falls Sie auf demselben Smartphone browsen, auf **QoreX öffnen**, um die App direkt über ihren `qorex://connect`-Link zu starten.
5. QoreX zeigt die Pairing-Anfrage mit der Herkunft (Origin) des Dashboards an. Prüfen Sie sie und genehmigen Sie mit Ihrer biometrischen Bestätigung (Face ID / Touch ID / PIN).
6. Das Dashboard fragt im Hintergrund die Genehmigung ab; innerhalb weniger Sekunden zeigt es auf der QoreX-Karte **Verbunden: qor1...** an, und Ihre Adresse schaltet den Rest der Wallet-Seite frei.

### Verbinden mit Keplr {#connect-keplr}

Keplr verbindet sich, um Ihren Native-Rail-Kontostand, Verlauf und Ihre Empfangsadresse anzuzeigen. Senden und Staken auf dem Native-Rail erfolgen über QoreX (siehe unten) — QoreChain-Konten signieren mit einer post-quantum-hybriden Signatur, weshalb die Tabs „Senden" und „Staken" des Dashboards über QoreX laufen und nicht über die Wallet, die Sie hier verbunden haben.

1. Wählen Sie auf der Wallet-Seite **Keplr verbinden**.
2. Falls QoreChain in Keplr noch nicht konfiguriert ist, löst das Dashboard Keplrs `suggestChain`-Aufforderung aus — prüfen Sie die Netzwerkdetails (Chain-ID, RPC-/REST-Endpunkte) im Keplr-Popup und wählen Sie **Genehmigen**, um es hinzuzufügen.
3. Keplr bittet Sie anschließend, das zu verbindende Konto auszuwählen und die Verbindung zu genehmigen — wählen Sie **Genehmigen**.
4. Das Dashboard liest Ihre `qor1...`-Adresse und lädt Ihren Kontostand und Verlauf.

Phantom kann auf der Mainnet-Wallet-Seite nicht als Wallet verbunden werden. Zuvor verknüpfte Phantom-Adressen erscheinen weiterhin unter **Verbundene Wallets**; zum Verknüpfen eines Phantom-Schlüssels als Signierer siehe [Verknüpfte Signierer (Phantom)](#linked-signers).

### Verbinden mit MetaMask {#connect-metamask}

1. Wählen Sie auf der Wallet-Seite **MetaMask verbinden**.
2. Falls das QoreChain-EVM-Netzwerk noch nicht hinzugefügt ist, zeigt MetaMask seine Aufforderung **Netzwerk hinzufügen** (EIP-3085) mit vorausgefüllter Chain-ID, RPC-URL und Währungssymbol an — prüfen Sie diese und wählen Sie **Genehmigen**, dann **Netzwerk wechseln**.
3. MetaMask fragt, welches Konto verbunden werden soll — wählen Sie das Konto aus und bestätigen Sie mit **Verbinden**.
4. Das Dashboard liest Ihre `0x...`-Adresse und lädt Ihren Kontostand und Verlauf.

### Senden im Mainnet {#send-mainnet}

Da das Dashboard niemals Ihre Mainnet-Schlüssel verwahrt, wird jede Sendung im Dashboard zusammengestellt, aber in Ihrer eigenen Wallet finalisiert. Auf dem **Native-Rail** ist diese Wallet immer **QoreX** — die Tabs „Senden" und „Staken" laufen über sie, unabhängig davon, welche andere Wallet Sie zusätzlich verbunden haben, weil QoreChain-Konten mit einer post-quantum-hybriden Signatur signieren. Auf dem **EVM-Rail** signiert MetaMask die Transaktion, vorausgesetzt, das Konto hat bereits einen Post-Quantum-Schlüssel und ein offenes EVM-Fenster (siehe [Senden mit MetaMask](#send-metamask)).

:::caution Echte Gelder, unwiderrufliche Transfers
Mainnet-Transaktionen sind unwiderruflich. Prüfen Sie vor dem Genehmigen immer die Empfängeradresse doppelt.
:::

:::note Vesting-Guthaben
Wenn ein Teil Ihres Kontostands noch vestet, zählt er zu dem, was Sie fürs Staking delegieren können, aber er kann keine Transaktionsgebühr bezahlen — dafür benötigen Sie separat verfügbares QOR, auch um einen PQC-Schlüssel zu registrieren. Eine Wallet, die nur mit ihrem Vesting-Betrag ausgestattet ist, kann delegieren, aber nicht senden.
:::

#### Senden mit QoreX — Browser-Erweiterung

1. Geben Sie auf der Wallet-Seite in der Karte **Senden von QoreX** den Empfänger ein (eine `qor1...`-Adresse oder ein `@handle`), den Betrag in QOR und optional ein Memo. Wenn Sie mehr als eine QoreX-Wallet verknüpft haben, wählen Sie unter **Senden von**, welche bezahlt.
2. Wählen Sie **In QoreX fortsetzen**.
3. Das Dashboard zeigt eine Schaltfläche **In Browser-Erweiterung genehmigen** an — wählen Sie diese.
4. Die QoreX-Erweiterung öffnet ihr Genehmigungs-Popup mit dem vollständig entschlüsselten Transfer — Empfänger und Betrag. Prüfen Sie ihn und genehmigen Sie mit der eigenen Sicherheitsfunktion Ihrer Erweiterung (biometrisch oder Passwortentsperrung).
5. Die Erweiterung signiert den Transfer mit einer hybriden PQC-Signatur und überträgt ihn direkt an die Chain — das Dashboard erfährt nur den resultierenden Transaktions-Hash.
6. Die Wallet-Seite zeigt **Transfer bestätigt** mit dem Transaktions-Hash an, den Sie im [Explorer](/dashboard/explorer) öffnen können.

#### Senden mit QoreX — Mobile App

1. Geben Sie auf der Wallet-Seite in der Karte **Senden von QoreX** den Empfänger ein (eine `qor1...`-Adresse oder ein `@handle`), den Betrag in QOR und optional ein Memo. Wenn Sie mehr als eine QoreX-Wallet verknüpft haben, wählen Sie unter **Senden von**, welche bezahlt.
2. Wählen Sie **In QoreX fortsetzen**.
3. Das Dashboard zeigt einen QR-Code und einen Link **In QoreX öffnen** mit einer `qorex://tx`-Anfrage an.
4. Scannen Sie den QR-Code mit der QoreX-App, oder tippen Sie auf **In QoreX öffnen**, wenn Sie sich auf demselben Smartphone befinden.
5. QoreX entschlüsselt die Anfrage und zeigt Empfänger und Betrag vollständig an. Prüfen Sie sie und genehmigen Sie mit Ihrer biometrischen Bestätigung.
6. QoreX signiert den Transfer mit einer hybriden PQC-Signatur und überträgt ihn.
7. Das Dashboard fragt das Ergebnis ab und zeigt **Transfer bestätigt** mit dem Transaktions-Hash, sobald er on-chain gelandet ist, den Sie im [Explorer](/dashboard/explorer) öffnen können.

#### Senden an ein @handle

Das Empfängerfeld in der Karte **Senden von QoreX** akzeptiert statt einer `qor1...`-Adresse auch ein `@handle`. Was als Nächstes passiert, hängt davon ab, ob Sie diesem Handle von diesem Browser aus schon einmal etwas bezahlt haben:

- **Erstes Mal**: Die aufgelöste Adresse wird vollständig angezeigt, zusammen mit „Erstes Senden an @handle von diesem Browser aus. Prüfen Sie die Adresse, bevor Sie fortfahren:", und Sie müssen **Diese Adresse ist richtig — fortfahren** auswählen, bevor sie verwendet werden kann — die Adresse wird erst nach Ihrer Bestätigung gemerkt (gepinnt), nicht schon im Moment der Auflösung.
- **Dieselbe Adresse wie zuvor**: Sie wird mit einer leichten Bestätigung durchgereicht — kein erneutes Eintippen nötig.
- **Eine andere Adresse als zuvor**: Der Ablauf stoppt hart. Sowohl die vorherige als auch die neue Adresse werden vollständig angezeigt — niemals gekürzt, da eine Kürzung genau die mittleren Zeichen verbirgt, die ein Angreifer ähnlich aussehen lassen würde — mit einer expliziten Warnung, dass sich die Adresse geändert hat, und einer bewusst zweitrangig gestalteten Schaltfläche **Ich vertraue dieser Änderung — fortfahren**, um trotzdem fortzufahren.

Dieser Pin wird nur in Ihrem eigenen Browser gespeichert, nicht auf einem Server, sodass ein anderer Computer oder ein geleerter Browser wieder „erstes Mal" anzeigt — das ist beabsichtigt. Handles bestehen aus 3–20 Zeichen (`a-z`, `0-9`, `_`) und gehören zu einer bestimmten Adresse, sodass jemand mit mehreren Adressen auf jeder ein anderes Handle verwenden kann. Ist die Handle-Suche vorübergehend nicht verfügbar, weist das Feld darauf hin, und Sie können weiterhin an eine `qor1...`-Adresse senden.

#### Senden mit MetaMask {#send-metamask}

:::caution Seit Chain v3.2.0 kann MetaMask allein im Mainnet nicht senden
Der EVM-Lane lässt eine Transaktion nur von einem Konto zu, das einen registrierten Post-Quantum-Schlüssel besitzt und ein **offenes EVM-Autorisierungsfenster** hat: eine zeit-, anzahl- und wertbegrenzte Berechtigung, die das Konto mit einer Post-Quantum-signierten Nachricht öffnet. MetaMask kann diese Nachricht nicht erzeugen. Wenn Sie ohne Fenster senden, lehnt die Chain die Transaktion ab (typische Fehler: kein Fenster, Fenster erschöpft, kein Post-Quantum-Schlüssel).
:::

1. Registrieren Sie in **QoreX** (der eigenen Wallet des Kontos) den Post-Quantum-Schlüssel des Kontos, falls es noch keinen hat, und öffnen Sie dann ein EVM-Autorisierungsfenster — siehe [EVM-Zugangsfenster](/qorex/security-and-recovery#evm-window). Wählen Sie Limits, mit denen Sie sich wohlfühlen; das Öffnen eines neuen Fensters ersetzt das vorherige.
2. Öffnen Sie MetaMask und bestätigen Sie, dass es auf das QoreChain-EVM-Netzwerk eingestellt ist.
3. Wählen Sie in MetaMask **Senden**, geben Sie die `0x...`-Adresse des Empfängers und den Betrag ein, prüfen Sie die Gasgebühr und bestätigen Sie.
4. Zurück auf der Dashboard-Wallet-Seite erscheint die Transaktion in Ihrem Verlauf, sobald sie on-chain ist (aktualisieren Sie, falls sie noch nicht angezeigt wird).

Jede Transaktion verbraucht einen Teil des Fensters; ist sein Zeit-, Transaktionsanzahl- oder Wertlimit erreicht, öffnen Sie in QoreX ein neues.

### Auf einem bestimmten Rail empfangen {#receive-mainnet}

1. Wählen Sie **Empfangen**.
2. Wählen Sie im Empfangs-Modal mit dem Selektor ein Rail aus: **Native QOR**, **EVM** oder **SVM**.
3. Das Modal zeigt Ihre Adresse in der Kodierung dieses Rails (`qor1...`, `0x...` oder base58) mit einem QR-Code und einer Kopieren-Schaltfläche an.
4. Kopieren Sie die Adresse, oder lassen Sie den Absender den QR-Code scannen.

Unabhängig davon, welches Rail der Absender verwendet, landen die Gelder im selben Konto — ein Konto, drei Kodierungen, ein Kontostand.

### Ihren Transaktionsverlauf lesen {#history}

Im Mainnet zeigt jede Zeile Ihres Verlaufs:

- Ein **Rail-Badge** — Native, EVM oder SVM — das anzeigt, welches Rail die Transaktion verwendet hat.
- **Gesendet** oder **Empfangen** bei gewöhnlichen Transfers und eine beschreibende Typbezeichnung für andere Aktivitäten (zum Beispiel *PQC-Schlüsselregistrierung* oder eine Contract-Aktion).
- Betrag, Zeitpunkt und einen Status **Bestätigt** / **Fehlgeschlagen**, mit dem Transaktions-Hash, den Sie im [Explorer](/dashboard/explorer) öffnen können.

## Die Wallet im Testnet verwenden {#testnet}

Im Testnet (`qorechain-diana`) verwaltet das Dashboard eine Test-Wallet für Sie, sodass Sie Abläufe end-to-end testen können, ohne irgendetwas zu verbinden.

### Was die Seite anzeigt

- Ihre Wallet-Bezeichnung und aktive Adresse, in gekürzter Form, mit einer Ein-Klick-Kopieren-Schaltfläche.
- Ihren **Gesamtkontostand** in QOR.
- Ein Sicherheitspanel, das quantensichere Verschlüsselung und das verbundene Netzwerk vermerkt.
- Eine Anzeige der letzten Aktualisierung mit einer Aktualisieren-Steuerung.
- Einen Bereich **Assets & Aktivität** mit einem Tab **Transaktionsverlauf** und einem Tab **Tokens**.

Verwenden Sie die Aktualisieren-Steuerung jederzeit, um Ihren aktuellen Kontostand und die neueste Aktivität von der Chain abzurufen.

:::caution Testnet-Adressen sehen genau aus wie Mainnet-Adressen
Testnet und Mainnet verwenden dasselbe `qor1...`-Format, sodass eine Testnet-Adresse ohne jede Warnung in eine Börsenauszahlung oder eine andere Wallet eingefügt werden kann — und echtes QOR, das dorthin gesendet wird, landet im **Mainnet** an dieser Adresse, wo diese Testnet-Seite es nicht anzeigen kann. Senden Sie niemals echtes QOR an eine Testnet-Adresse. Das Dashboard wiederholt diese Warnung neben der Adresse auf der Wallet-Seite, in der Liste **Meine Wallets** und auf dem Bildschirm **Empfangen**. Wechseln Sie für echtes QOR zum Mainnet und verwenden Sie die dort angezeigte Adresse; wenn Sie bereits echtes QOR an eine Testnet-Adresse gesendet haben, wenden Sie sich an den Support — versuchen Sie nicht, es selbst zu verschieben.
:::

### QOR senden (Testnet)

1. Wählen Sie **Senden**.
2. Geben Sie die **Empfängeradresse** ein (`qor1...`).
3. Geben Sie den **Betrag** (oder **MAX**) und optional ein **Memo** ein.
4. Wählen Sie **Transaktion prüfen**, kontrollieren Sie die Details und die geschätzte Netzwerkgebühr, und wählen Sie dann **Bestätigen & Senden**.

Während Sie einen Empfänger eintippen, werden gespeicherte Kontakte und zuletzt verwendete Adressen vorgeschlagen, um Fehler zu vermeiden. Nach dem Absenden des Transfers erhalten Sie eine Bestätigung mit dem Transaktions-Hash, den Sie im [Explorer](/dashboard/explorer) öffnen können.

### QOR empfangen (Testnet)

1. Wählen Sie **Empfangen**.
2. Teilen Sie Ihre Adresse oder deren QR-Code mit dem Absender, oder kopieren Sie die Adresse mit einem Klick.
3. Geben Sie optional einen angeforderten Betrag und ein Memo ein, um einen Zahlungslink und einen herunterladbaren QR-Code zu erzeugen.

### Ihre Test-Wallets verwalten

Wählen Sie **Meine Wallets**, um Ihre Adressliste zu öffnen. Von dort aus können Sie zwischen Wallets wechseln, eine neue Wallet erstellen, eine bestehende importieren oder eine nicht mehr benötigte Wallet entfernen. Die aktive Wallet ist diejenige, die im Testnet für Senden, Swappen, Staking und andere signierte Aktionen im gesamten Dashboard verwendet wird.

### Wiederherstellungsphrase einer Test-Wallet sichern oder exportieren {#reveal-recovery-phrase}

Im Testnet verwaltet das Dashboard Ihre Wallets für Sie, doch Sie können die 24-Wort-Wiederherstellungsphrase einer Wallet exportieren, um sie in eine Self-Custody-Wallet wie QoreX zu importieren.

1. Suchen Sie auf der Testnet-Seite **Wallet** die Karte **Wiederherstellungsphrase**. Sie listet jede Ihrer vom Dashboard verwalteten Wallets mit ihrem **Mainnet**-Kontostand auf (gefüllte Wallets zuerst), sodass Sie diejenige auswählen können, die tatsächlich Ihre Token hält.
2. Wählen Sie neben der Wallet **Anzeigen**, lesen Sie die Warnung („Phrase für … anzeigen?") und wählen Sie **Weiter**.
3. Sie werden zur erneuten Anmeldung auf die Anmeldeseite des Kontos weitergeleitet (eine frische Passwortprüfung ist erforderlich; das Dashboard sieht Ihr Passwort nie) und kehren automatisch zur Wallet zurück.
4. Die 24 Wörter werden 60 Sekunden lang angezeigt. Schreiben Sie sie auf und bewahren Sie sie offline auf. Der Countdown pausiert, während Sie das Bestätigungskästchen anhaken oder in die Prüffelder tippen.
5. Haken Sie **Ich habe meine Wiederherstellungsphrase aufgeschrieben und sicher aufbewahrt** an, tippen Sie die Wörter **3**, **5** und **9** aus Ihrer schriftlichen Kopie ein (als *Erforderlich* markiert) und wählen Sie **Backup bestätigen**. Sie sehen „Wiederherstellungsphrase gespeichert".
6. Wenn Sie mit **Ausblenden ohne Bestätigung** verlassen (oder der Timer abläuft), zeigt die Karte „Backup nicht bestätigt" — nichts hält fest, dass Sie die Phrase aufgeschrieben haben — und bietet **Erneut anzeigen und bestätigen** an.

Wer diese 24 Wörter kennt, kontrolliert die Wallet. QoreChain kann sie weder wiederherstellen noch für Sie zurücksetzen, und der Support wird Sie nie danach fragen.

## QoreChain zu Ihrer Wallet hinzufügen {#add-network}

Das Panel **QoreChain zu Ihrer Wallet hinzufügen** auf der Wallet-Seite (im Mainnet befindet es sich im Tab **Wallets verbinden** und, solange keine Wallet verbunden ist, unter den Verbinden-Schaltflächen; im Testnet am Ende der Seite) zeigt vier nebeneinanderliegende Karten — eine pro Verbindungsart —, sodass Sie QoreChain mit einem Klick zu Ihrer eigenen Wallet hinzufügen können:

| Karte | Was sie Ihnen bietet |
| --- | --- |
| **Native-(Cosmos-)Wallets** | RPC- und REST-Endpunkte sowie die Chain-ID, jeweils mit Kopieren-Schaltfläche — für Keplr und andere Native-Rail-Wallets. |
| **EVM-Wallets** | Fertige EIP-3085-Netzwerkparameter — ein Klick fügt QoreChain zu MetaMask und anderen EVM-Wallets hinzu. |
| **SVM-Wallets** | Die SVM-RPC-URL für SVM-kompatible Wallets und Tools. |
| **Mobile Wallets (WalletConnect)** | Ein WalletConnect-v2-Pairing-QR für die Mobilversionen kompatibler Wallets. |

So fügen Sie QoreChain hinzu:

1. Öffnen Sie die Seite **Wallet** und suchen Sie **QoreChain zu Ihrer Wallet hinzufügen**.
2. Wählen Sie die Karte, die zum Rail Ihrer Wallet passt.
3. Wählen Sie die Hinzufügen-Schaltfläche (**Zu Keplr hinzufügen** / **Zu Cosmostation hinzufügen**, **Zu MetaMask hinzufügen** oder Ihre andere EVM-Wallet, oder das WalletConnect-Pairing), oder kopieren Sie die Endpunkte und die Chain-ID in das Formular „Netzwerk hinzufügen" Ihrer Wallet (die SVM-Karte liefert die SVM-RPC-URL zum Einfügen in eine Custom-RPC-Einstellung).
4. Genehmigen Sie das neue Netzwerk in Ihrer Wallet.

Die öffentlichen Endpunkte sind `rpc.qore.host` (Native RPC), `api.qore.host` (REST), `evm.qore.host` (EVM JSON-RPC) und `svm.qore.host` (SVM RPC), mit `*-testnet`-Varianten (zum Beispiel `rpc-testnet.qore.host`) für das Testnet. Chain-IDs: Mainnet `qorechain-vladi` (EVM-Chain-ID `9801`), Testnet `qorechain-diana` (EVM-Chain-ID `9800`).

### Verknüpfte Signierer (Phantom) {#linked-signers}

Mit der Karte **SVM-Wallets** können Sie außerdem einen Phantom-Schlüssel als **verknüpften Signierer** mit Ihrem Konto verbinden — ein zeitlich begrenzter (30 Tage), widerrufbarer Authenticator, keine separate primäre Wallet-Verbindung wie QoreX, Keplr oder MetaMask. Wählen Sie **Phantom verbinden** und dann **Authenticator registrieren**; Ihre bestehende Wallet signiert die Registrierung, und Phantom wird nie zu einer eigenen Identität.

:::caution Die Registrierung verknüpfter Signierer ist derzeit auf der Chain abgeschaltet
Die Smart-Account- und Linked-Wallet-Funktionen der Chain sind implementiert, aber in beiden Netzwerken abgeschaltet (`abstractaccount.enabled = false`; prüfen Sie `GET /qorechain/abstractaccount/v1/config`), und die Chain lehnt neue Registrierungen verknüpfter Signierer ab, solange das der Fall ist. Betrachten Sie die Karte vorerst als Vorschau und erwarten Sie nicht, dass eine Registrierung gelingt.
:::

:::caution Ein verknüpfter Signierer ist echte Autorität über das Konto
Ist die Funktion aktiviert, bestimmt die erteilte Berechtigung, auf welchem Lane der Schlüssel handeln darf, nicht wie viel er bewegen kann, und eine Registrierung bleibt 30 Tage gültig. Verknüpfen Sie nur einen Phantom-Schlüssel, dem Sie so sehr vertrauen wie dem Konto selbst, und widerrufen Sie ihn, wenn Sie ihn nicht mehr benötigen.
:::

Das On-Chain-Berechtigungs- und Ausgabenlimit-Modell finden Sie unter [Verknüpfte Signierer & Ausgabenlimits](/qorex/security-and-recovery#linked-signers) in den QoreX-Dokumenten.

## Verwandte Themen

- [Token-Operationen](/user-guide/token-operations) — Konzepte hinter QOR-Transfers und Denominationen.
- [Trade](/dashboard/trade) — Tauschen Sie Tokens (derzeit Test-Tokens).
