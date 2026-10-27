---
slug: /dashboard/wallet
title: Wallet
sidebar_label: Wallet
sidebar_position: 3
---

# Wallet

Auf der **Wallet**-Seite sehen Sie Ihren Kontostand und Ihren Transaktionsverlauf, empfangen QOR und stellen (im Mainnet) Sendungen und Staking-Aktionen zusammen. Sie ist für alle gedacht, die QOR halten und ein Konto auf allen drei Rails an einem Ort sehen möchten. Wie die Seite funktioniert, hängt vom Netzwerk ab:

- **Das Mainnet ist non-custodial.** Das Dashboard verwahrt keine Mainnet-Schlüssel. Sie verbinden Ihre eigene Wallet (**QoreX**, **Keplr** oder **MetaMask**), und die Seite liest Ihren echten Kontostand und Verlauf von der Chain. Sendungen und Staking auf dem Native-Rail werden auf der Seite zusammengestellt und in **QoreX** signiert, weil QoreChain-Konten mit einer post-quantum-hybriden Signatur signieren, die QoreX erzeugt. Keplr verbindet sich zum Ansehen und Empfangen. MetaMask verbindet sich auf dem EVM-Rail; zum Senden braucht es dort einen registrierten Post-Quantum-Schlüssel und ein offenes EVM-Autorisierungsfenster, das in QoreX geöffnet wird (siehe [Senden mit MetaMask](#send-metamask)).
- **Das Testnet ist custodial.** Das Dashboard erstellt und verwahrt Test-Wallets für Ihr Konto, sodass Sie Test-QOR ganz ohne Installation senden und empfangen können. Für Testnet-Wallets gibt es keinen Staking-Bildschirm.

## Innovationen {#innovations}

- **Ein Konto, drei Kodierungen.** Die Seite leitet die Formen `qor1...`, `0x...` und SVM-base58 desselben Kontos ab und liest Kontostand und Verlauf einmal über `qor1...`. Verlaufszeilen tragen ein Native-, EVM- oder SVM-Badge.
- **Das Dashboard signiert im Mainnet nie.** Bei einer Sendung, einem Delegieren, Undelegieren oder Einfordern übergibt es QoreX nur die Parameter und das Netzwerk, niemals eine vorbereitete Transaktion. QoreX baut die Transaktion neu auf, zeigt sie vollständig an, signiert sie mit der hybriden ML-DSA-87-Signatur und überträgt sie. Das Dashboard erfährt nur den Transaktions-Hash.
- **@handle-Pinning.** Die Adresse eines aufgelösten Handles wird nur dann in diesem Browser gemerkt, nachdem Sie sie bestätigt haben. Löst sich das Handle später in eine andere Adresse auf, stoppt der Ablauf und zeigt beide vollständigen Adressen.
- **Gebührenprüfung vor dem Staking.** Die Seite liest das ausgebbare QOR (ohne Vesting) und den Status des ML-DSA-87-Schlüssels des Kontos von der Chain und lässt „Absenden“ deaktiviert, wenn die Gebühr nicht bezahlt werden kann.
- **Die Testadress-Warnung steht dort, wo Sie kopieren.** „Testadresse, senden Sie hier niemals echtes QOR.“ erscheint neben der Adresse, unter Meine Wallets und beim Empfangen, weil Testnet- und Mainnet-Adressen identisch aussehen.
- **Export der Wiederherstellungsphrase mit Prüfung.** Im Testnet erfordert das Anzeigen einer Phrase eine frische Anmeldung, die 24 Wörter werden 60 Sekunden lang angezeigt, und das Backup gilt erst als bestätigt, nachdem Sie die Wörter 3, 5 und 9 eingetippt haben.

## So verwenden Sie sie {#how-to-use}

### Ein Konto, drei Kodierungen {#one-account-three-encodings}

Ein QoreChain-Konto ist eine einzige Identität, die auf drei Arten geschrieben wird, eine pro Ausführungs-Rail:

| Rail | Kodierung | Sieht aus wie |
| --- | --- | --- |
| **Native QOR** | bech32 | `qor1...` |
| **EVM** | hex | `0x...` |
| **SVM** | base58 | z. B. `5Gv7...` |

Alle drei verweisen auf **dasselbe Konto und denselben Kontostand**. Guthaben, das auf einem beliebigen Rail empfangen wird, landet in einem Kontostand, und das Dashboard indiziert Kontostand und Verlauf über die `qor1`-Kodierung, sodass Aktivitäten von jedem Rail gemeinsam angezeigt werden.

### Die Wallet im Mainnet verwenden {#mainnet}

Voraussetzungen: angemeldet, Header auf **Mainnet**, die [einmalige Bestätigung](/dashboard/overview#risk-acknowledgement) akzeptiert und, zum Senden oder Staken, die QoreX-App oder -Erweiterung.

1. Öffnen Sie **Wallet**. Ist noch keine Wallet verbunden, zeigt eine Karte „Wallet verbinden“ die Karte **QoreX-Wallet** mit **Mit QoreX verbinden** und darunter, unter „oder eine andere Wallet verbinden“, **Keplr verbinden** und **MetaMask verbinden**.
2. Verbinden Sie eine Wallet (Schritte unten). Phantom kann hier nicht verbunden werden; siehe [Verknüpfte Signierer](#linked-signers).
3. Die Seite lädt Ihren echten Kontostand und Verlauf von der Chain.

Nach dem Verbinden hat die Seite sechs Tabs: **Wallet**, **Senden von QoreX**, **Staken / Delegieren**, **Rewards**, **Details** und **Wallets verbinden**.

- **Wallet:** eine Reihe **Ansicht** mit Wallet-Chips (nur wenn mehr als eine Wallet verbunden ist), **Gesamtkontostand**, **Empfangen** und **Assets & Aktivität** mit den letzten 10 Transaktionen.
- **Senden von QoreX, Staken / Delegieren, Rewards:** Diese laufen über QoreX, auch wenn zusätzlich Keplr oder MetaMask verbunden ist. Die Staking-Schritte stehen unter [Staking & Validatoren](/dashboard/staking-and-validators).
- **Details:** Ihre Native-, EVM- und SVM-Adressen sowie **Verknüpfte Adressen** (umbenennen, als Standard festlegen, in QoreX steuerbar oder nur beobachtbar).
- **Wallets verbinden:** verbundene Wallets (zum Ansehen anklicken, mit X lösen), nicht verknüpfte QoreX-Konten mit **Dieses Konto verknüpfen**, **+ QoreX**, **+ Keplr**, **+ MetaMask** und das Panel [QoreChain zu Ihrer Wallet hinzufügen](#add-network).

Falls in Ihrer Wallet QoreChain noch nicht konfiguriert ist, fügen Sie es zuerst hinzu, siehe [QoreChain zu Ihrer Wallet hinzufügen](#add-network).

#### Mit QoreX verbinden, Browser-Erweiterung {#connect-qorex-extension}

1. Suchen Sie auf der Wallet-Seite die Karte **QoreX-Wallet** und wählen Sie **Mit QoreX verbinden**.
2. Da die QoreX-Erweiterung erkannt wird, fragt das Dashboard, wie Sie sich verbinden möchten. Wählen Sie **Browser-Erweiterung**.
3. Die Erweiterung öffnet ein Genehmigungs-Popup, das `dashboard.qorechain.io` als anfragende Seite zeigt.
4. Genehmigen Sie es. Dies signiert einen einmaligen Nachweis, dass Ihnen Ihre Adresse `qor1...` gehört; es werden keine Gelder bewegt und keine weitere Berechtigung erteilt.
5. Das Popup schließt sich, und das Dashboard zeigt **Verbunden: qor1...** an. Die Wahl wird gespeichert, sodass das nächste Verbinden in diesem Browser sie ohne Nachfrage wiederverwendet. Ein Link **Andere Methode verwenden** erscheint nur, solange ein Pairing aussteht.

Sie können mehr als eine QoreX-Adresse mit demselben Dashboard-Konto verknüpfen (zum Beispiel eine von einer Firefox-Erweiterung und eine von Chrome, oder ein Smartphone und ein Laptop). Wählen Sie **Weitere Wallet hinzufügen**, um den Ablauf zu wiederholen; jeder verknüpften Adresse kann eine Bezeichnung gegeben werden, und eine wird als Standard fürs Senden markiert, beides im Tab **Wallets verbinden**.

**Zwischen Wallets im Tab Wallet wechseln.** Sind mehr als eine Wallet verbunden, können Sie mit der Reihe **Ansicht** aus Chips wechseln, wessen Kontostand und Verlauf Sie sehen, ohne den Tab zu verlassen. Die Reihe wird ausgeblendet, wenn nur eine Wallet verbunden ist.

**Konten in Ihrer QoreX-Erweiterung, die noch nicht verknüpft sind.** Eine Wiederherstellungsphrase kann mehrere Konten ableiten, und das Anlegen eines Kontos in QoreX teilt dem Dashboard nichts mit. Kann die Erweiterung ihre Konten auflisten, zeigen die Tabs **Wallet**, **Details** und **Wallets verbinden** eine Karte wie „2 Konten in Ihrer QoreX-Erweiterung sind hier nicht verknüpft“, mit dem Kontostand jedes Kontos (und wie viel davon gestaket ist, was nicht gesendet werden kann). Wählen Sie **Dieses Konto verknüpfen**, um es zu koppeln; das Verknüpfen gewährt keine Kontrolle über Ihre Schlüssel. Kann Ihr QoreX-Build nicht auswählen, welches Konto nachgewiesen werden soll, lässt sich von hier aus nur das aktive Konto verknüpfen.

#### Mit QoreX verbinden, Mobile App {#connect-qorex-app}

1. Wählen Sie auf der Wallet-Seite auf der Karte **QoreX-Wallet** die Option **Mit QoreX verbinden**.
2. Falls die Auswahl erscheint, wählen Sie **QoreX-App** (wird keine Erweiterung erkannt, führt das Dashboard direkt zu diesem Ablauf).
3. Das Dashboard zeigt einen QR-Code und **QoreX öffnen** an und fragt das Ergebnis ab („Warten auf Genehmigung in QoreX...“).
4. Scannen Sie auf Ihrem Smartphone den QR-Code in QoreX, oder tippen Sie auf **QoreX öffnen**, wenn Sie auf demselben Smartphone browsen (das öffnet die App über ihren `qorex://connect`-Link).
5. QoreX zeigt die Pairing-Anfrage mit der Herkunft (Origin) des Dashboards an. Genehmigen Sie mit Face ID, Touch ID oder PIN.
6. Innerhalb weniger Sekunden zeigt das Dashboard **Verbunden: qor1...** an.

#### Mit Keplr verbinden {#connect-keplr}

Keplr verbindet sich, um Ihren Native-Rail-Kontostand und Verlauf anzuzeigen und um zu empfangen. Senden und Staken laufen über QoreX.

1. Wählen Sie auf der Wallet-Seite **Keplr verbinden**.
2. Falls QoreChain in Keplr nicht konfiguriert ist, löst das Dashboard Keplrs `suggestChain`-Aufforderung aus. Prüfen Sie die Chain-ID und die Endpunkte und wählen Sie **Genehmigen**.
3. Wählen Sie das Konto aus und genehmigen Sie die Verbindung.
4. Das Dashboard liest Ihre `qor1...`-Adresse und lädt Ihren Kontostand und Verlauf.

Phantom kann auf der Mainnet-Wallet-Seite nicht als Wallet verbunden werden. Zuvor verknüpfte Phantom-Adressen erscheinen weiterhin unter **Verbundene Wallets**; zum Verknüpfen eines Phantom-Schlüssels als Signierer siehe [Verknüpfte Signierer (Phantom)](#linked-signers).

#### Mit MetaMask verbinden {#connect-metamask}

1. Wählen Sie auf der Wallet-Seite **MetaMask verbinden**.
2. Falls das QoreChain-EVM-Netzwerk noch nicht hinzugefügt ist, zeigt MetaMask seine Aufforderung **Netzwerk hinzufügen** (EIP-3085) mit vorausgefüllter Chain-ID, RPC-URL und Symbol an. Wählen Sie **Genehmigen**, dann **Netzwerk wechseln**.
3. Wählen Sie das Konto aus und **Verbinden**.
4. Das Dashboard liest Ihre `0x...`-Adresse und lädt Ihren Kontostand und Verlauf.

### Senden im Mainnet {#send-mainnet}

Jede Sendung wird im Dashboard zusammengestellt, aber in Ihrer eigenen Wallet finalisiert. Auf dem **Native-Rail** ist diese Wallet immer **QoreX**. Auf dem **EVM-Rail** signiert MetaMask, vorausgesetzt, das Konto hat bereits einen Post-Quantum-Schlüssel und ein offenes EVM-Fenster (siehe [Senden mit MetaMask](#send-metamask)).

:::caution Echte Gelder, unwiderrufliche Transfers
Mainnet-Transaktionen sind unwiderruflich. Prüfen Sie vor dem Genehmigen den Empfänger doppelt.
:::

:::note Vesting-Guthaben
Wenn ein Teil Ihres Kontostands noch vestet, zählt er zu dem, was Sie delegieren können, aber er kann keine Transaktionsgebühr bezahlen. Dafür benötigen Sie separat verfügbares QOR, auch um einen Post-Quantum-Schlüssel zu registrieren. Eine Wallet, die nur mit ihrem Vesting-Betrag ausgestattet ist, kann delegieren, aber nicht senden.
:::

#### Mit QoreX senden, Schritt für Schritt

1. Wählen Sie in der Karte **Senden von QoreX** optional **Senden von** (wenn Sie mehr als eine QoreX-Wallet verknüpft haben) und geben Sie dann den Empfänger (eine `qor1...`-Adresse oder ein `@handle`), den **Betrag (QOR)** und ein optionales **Memo** ein.
2. Wählen Sie **In QoreX fortsetzen**.
3. Genehmigen Sie, entweder:
   - **Browser-Erweiterung:** Wählen Sie **In Browser-Erweiterung genehmigen**. Das Erweiterungs-Popup zeigt den Transfer vollständig entschlüsselt (Empfänger und Betrag). Genehmigen Sie mit der eigenen Entsperrung Ihrer Erweiterung. Die Erweiterung signiert mit der hybriden Post-Quantum-Signatur und überträgt direkt an die Chain.
   - **Mobile App:** Scannen Sie den QR-Code mit QoreX, oder wählen Sie auf demselben Smartphone **In QoreX öffnen** (eine `qorex://tx`-Anfrage). QoreX entschlüsselt die Anfrage und zeigt Empfänger und Betrag an, und Sie genehmigen mit Ihrer Biometrie. QoreX signiert und überträgt.
4. Die Seite zeigt „Transfer bestätigt“ mit dem Transaktions-Hash (öffnen Sie ihn im [Explorer](/dashboard/explorer)), dann **Neuer Transfer**. Im App-Ablauf fragt das Dashboard das Ergebnis ab.

**Minimales Beispiel:** Mit QoreX verbinden (App, QR-Code scannen), dann Senden von QoreX mit einem `qor1...`-Empfänger und dem Betrag 1, **In QoreX fortsetzen** wählen und in QoreX genehmigen.

#### Senden an ein @handle

Das Empfängerfeld akzeptiert auch ein `@handle`. Was als Nächstes passiert, hängt davon ab, ob Sie diesem Handle von diesem Browser aus schon einmal etwas bezahlt haben:

- **Erstes Mal:** Die aufgelöste Adresse wird vollständig angezeigt, mit „Erstes Senden an @handle von diesem Browser aus. Prüfen Sie die Adresse, bevor Sie fortfahren:“, und Sie müssen sie bestätigen, bevor sie verwendet wird. Die Adresse wird erst nach Ihrer Bestätigung gemerkt (gepinnt).
- **Dieselbe Adresse wie zuvor:** Sie wird mit einer leichten Bestätigung durchgereicht.
- **Eine andere Adresse als zuvor:** Der Ablauf stoppt. Sowohl die vorherige als auch die neue Adresse werden vollständig angezeigt, mit einer expliziten Warnung, dass sich die Adresse geändert hat, und einer zweitrangig gestalteten Schaltfläche, um trotzdem fortzufahren.

Der Pin liegt nur in Ihrem Browser, sodass ein anderer Computer oder ein geleerter Browser wieder „erstes Mal“ anzeigt. Handles bestehen aus 3 bis 20 Zeichen (`a-z`, `0-9`, `_`) und gehören zu einer Adresse. Ist die Handle-Suche vorübergehend nicht verfügbar, weist das Feld darauf hin, und Sie können weiterhin an eine `qor1...`-Adresse senden.

#### Senden mit MetaMask {#send-metamask}

:::caution Seit Chain v3.2.0 kann MetaMask allein im Mainnet nicht senden
Der EVM-Lane lässt eine Transaktion nur von einem Konto zu, das einen registrierten Post-Quantum-Schlüssel besitzt und ein **offenes EVM-Autorisierungsfenster** hat: eine zeit-, anzahl- und wertbegrenzte Berechtigung, die mit einer Nachricht geöffnet wird, die eine hybride ML-DSA-87-Signatur (FIPS 204) trägt. MetaMask kann diese Nachricht nicht erzeugen. Ohne Fenster lehnt die Chain die Transaktion ab (typische Fehler: kein Fenster, Fenster erschöpft, kein Post-Quantum-Schlüssel).
:::

1. Registrieren Sie in **QoreX** den Post-Quantum-Schlüssel des Kontos, falls es noch keinen hat (Ihre erste QoreX-Überweisung von diesem Konto aus erledigt das), und öffnen Sie dann ein EVM-Autorisierungsfenster, siehe [EVM-Zugangsfenster](/qorex/security-and-recovery#evm-window). Das gilt für das **Ethereum-artige Konto (Coin 60)**, das sich den Schlüssel mit MetaMask teilt: Fügen Sie es in QoreX mit **Add an Ethereum account (coin 60)** mit derselben Wiederherstellungsphrase hinzu ([so geht’s](/qorex/getting-started#restore-dashboard)). Kein MetaMask-Schlüssel kann von einem gewöhnlichen Coin-118-Konto `qor1...` aus senden.
2. Ein Fenster ist begrenzt durch Blöcke (höchstens 17.280, etwa 15 Stunden im Mainnet), durch die Transaktionsanzahl (höchstens 1.000) und durch ein QOR-Ausgabenlimit, das jeden Betrag **plus** seine maximale Gebühr zählt. Halten Sie die Limits klein: Solange ein Fenster offen ist, bewegen MetaMask-Transaktionen QOR ohne Post-Quantum-Signatur. Das Öffnen eines neuen Fensters ersetzt das vorherige und erhöht die Nonce des Kontos, öffnen Sie es also **bevor** Sie von MetaMask aus senden (eine früher vorbereitete Transaktion schlägt mit „nonce too low“ fehl). Seit v3.2.3 unterstützt die Chain außerdem engere, eingegrenzte Fenster; QoreX bietet dafür noch keinen Bildschirm.
3. Öffnen Sie MetaMask und bestätigen Sie, dass es auf das QoreChain-EVM-Netzwerk eingestellt ist.
4. Wählen Sie in MetaMask **Senden**, geben Sie die `0x...`-Adresse des Empfängers und den Betrag ein, prüfen Sie die Gasgebühr und bestätigen Sie.
5. Zurück im Dashboard erscheint die Transaktion in Ihrem Verlauf, sobald sie on-chain ist (aktualisieren Sie, falls nötig).

Jede Transaktion verbraucht einen Teil des Fensters; ist sein Zeit-, Anzahl- oder Wertlimit erreicht, öffnen Sie in QoreX ein neues, und schließen Sie das Fenster, wenn Sie fertig sind.

### Empfangen {#receive-mainnet}

1. Wählen Sie **Empfangen**.
2. Wählen Sie mit dem Selektor ein Rail aus: **Native QOR**, **EVM** oder **SVM**.
3. Das Modal zeigt Ihre Adresse in dieser Kodierung mit einem QR-Code und einer Kopieren-Schaltfläche an.
4. Nur auf dem Native-Rail erzeugen die **Zahlungsanforderungs-Optionen** (Betrag, Memo) einen `qorechain:`-Link, den Sie kopieren können.

Unabhängig davon, welches Rail der Absender verwendet, landen die Gelder im selben Konto.

### Ihren Transaktionsverlauf lesen {#history}

Im Mainnet zeigt die Liste **Assets & Aktivität** die **letzten 10** Transaktionen. Jede Zeile hat:

- ein **Rail-Badge** (Native, EVM oder SVM);
- **Gesendet** oder **Empfangen** bei gewöhnlichen Transfers und eine beschreibende Bezeichnung für andere Aktivitäten (zum Beispiel *PQC-Schlüsselregistrierung* oder eine Contract-Aktion);
- den Betrag, den Zeitpunkt, einen Status **Bestätigt** oder **Fehlgeschlagen** und einen Hash, den Sie im [Explorer](/dashboard/explorer) öffnen können. Für ältere Aktivitäten öffnen Sie Ihre Adresse im Explorer.

### Die Wallet im Testnet verwenden {#testnet}

Im Testnet (`qorechain-diana`) verwaltet das Dashboard Test-Wallets für Sie. Das Testnet hat weder eine QoreX-Verbindung noch einen Staking-Bildschirm.

**Erster Besuch:** Erstellen Sie eine Wallet, oder importieren Sie eine 24-Wort-Phrase.

**Hauptkarte:** die Wallet-Bezeichnung, die Adresse mit Kopieren-Schaltfläche, **Gesamtkontostand**, **Senden**, **Empfangen** und **Meine Wallets**, eine Anzeige der letzten Aktualisierung mit Aktualisieren-Steuerung sowie **Assets & Aktivität** mit einem Tab **Transaktionsverlauf** und einem Tab **Tokens**.

Der Tab **Tokens** listet nur Token, die über Dashboard-Deployments ausgegeben wurden. Die Fest-Test-Token aus dem [Faucet](/dashboard/faucet#fest-tokens) erscheinen dort nie; prüfen Sie sie mit einer Bank-Kontostandsabfrage oder im [Explorer](/dashboard/explorer).

:::caution Testnet-Adressen sehen genau aus wie Mainnet-Adressen
Testnet und Mainnet verwenden dasselbe `qor1...`-Format, sodass eine Testnet-Adresse ohne jede Warnung in ein Auszahlungsformular oder eine andere Wallet eingefügt werden kann — und echtes QOR, das dorthin gesendet wird, landet im **Mainnet** an dieser Adresse, wo diese Testnet-Seite es nicht anzeigen kann. Senden Sie niemals echtes QOR an eine Testnet-Adresse. Das Dashboard wiederholt die Warnung neben der Adresse auf der Wallet-Seite, unter **Meine Wallets** und beim **Empfangen**. Wenn Sie bereits echtes QOR an eine Testnet-Adresse gesendet haben, wenden Sie sich an den Support und versuchen Sie nicht, es selbst zu verschieben.
:::

#### QOR senden (Testnet)

1. Wählen Sie **Senden**.
2. Wählen Sie ein **Asset** (QOR oder ein über das Dashboard ausgegebenes Token).
3. Geben Sie die **Empfängeradresse** ein (gespeicherte Kontakte und zuletzt verwendete Adressen werden beim Tippen vorgeschlagen) und den **Betrag** (oder **MAX**) sowie ein optionales **Memo**.
4. Wählen Sie **Transaktion prüfen**, kontrollieren Sie die Details und die geschätzte Gebühr, dann **Bestätigen & Senden**.
5. Sie erhalten eine Bestätigung mit dem Hash, und „Diese Adresse speichern?“ wird angeboten, damit der Empfänger als Kontakt gespeichert wird.

**Minimales Beispiel:** Wechseln Sie zum Testnet, erstellen Sie eine Wallet, fordern Sie im [Faucet](/dashboard/faucet) Test-QOR an und senden Sie dann 1 QOR an eine andere Adresse.

#### QOR empfangen (Testnet)

1. Wählen Sie **Empfangen**.
2. Teilen Sie die Adresse oder den QR-Code, oder kopieren Sie die Adresse.
3. Füllen Sie optional die **Zahlungsanforderungs-Optionen** (Betrag, Memo) aus, um einen Zahlungslink zu erzeugen; verwenden Sie **Link kopieren** oder **Bild speichern**.

#### Ihre Test-Wallets verwalten

**Meine Wallets** öffnet Ihre Adressliste: Wechseln Sie zwischen Wallets, erstellen, importieren oder entfernen Sie eine. Die aktive Wallet ist diejenige, die im Testnet im gesamten Dashboard für signierte Aktionen verwendet wird.

#### Wiederherstellungsphrase einer Test-Wallet sichern oder exportieren {#reveal-recovery-phrase}

Im Testnet verwaltet das Dashboard Ihre Wallets, doch Sie können die 24-Wort-Wiederherstellungsphrase einer Wallet exportieren, um sie in eine Self-Custody-Wallet wie QoreX zu importieren.

1. Suchen Sie auf der Testnet-Seite **Wallet** die Karte **Wiederherstellungsphrase**. Sie listet Ihre vom Dashboard verwalteten Wallets mit ihrem **Mainnet**-Kontostand auf (gefüllte Wallets zuerst), sodass Sie diejenige auswählen können, die Ihre Token hält.
2. Wählen Sie **Anzeigen**, lesen Sie die Warnung („Phrase für … anzeigen?“) und wählen Sie **Weiter**.
3. Melden Sie sich erneut an, wenn Sie dazu aufgefordert werden (eine frische Passwortprüfung ist erforderlich; das Dashboard sieht Ihr Passwort nie). Sie kehren automatisch zur Wallet zurück.
4. Die 24 Wörter werden 60 Sekunden lang angezeigt, mit einer Schaltfläche **Phrase kopieren**. Schreiben Sie sie auf und bewahren Sie sie offline auf. Der Countdown pausiert, während Sie das Bestätigungskästchen anhaken oder in die Prüffelder tippen.
5. Haken Sie **Ich habe meine Wiederherstellungsphrase aufgeschrieben und sicher aufbewahrt** an, tippen Sie die Wörter **3**, **5** und **9** ein (als *Erforderlich* markiert) und wählen Sie **Backup bestätigen**. Sie sehen „Wiederherstellungsphrase gespeichert“.
6. Wenn Sie mit **Ausblenden ohne Bestätigung** verlassen (oder der Timer abläuft), zeigt die Karte „Backup nicht bestätigt“ und bietet **Erneut anzeigen und bestätigen** an.

Wer diese 24 Wörter kennt, kontrolliert die Wallet. QoreChain kann sie weder wiederherstellen noch für Sie zurücksetzen, und der Support wird Sie nie danach fragen.

### QoreChain zu Ihrer Wallet hinzufügen {#add-network}

Das Panel **QoreChain zu Ihrer Wallet hinzufügen** (im Mainnet befindet es sich im Tab **Wallets verbinden** und, solange keine Wallet verbunden ist, unter den Verbinden-Schaltflächen; im Testnet am Ende der Seite) hat vier Karten:

| Karte | Was sie Ihnen bietet | Schaltflächen |
| --- | --- | --- |
| **Native-(Cosmos-)Wallets** | RPC- und REST-Endpunkte sowie die Chain-ID, jeweils mit Kopieren-Schaltfläche. | **Zu Keplr hinzufügen**, **Zu Cosmostation hinzufügen** (die Bezeichnung folgt der erkannten Wallet) |
| **EVM-Wallets** | EIP-3085-Netzwerkparameter. | **Zu EVM-Wallet hinzufügen** (oder **Zu MetaMask / Rabby hinzufügen**, je nach erkannten Wallets) |
| **SVM-Wallets** | Die SVM-RPC-URL für Custom-RPC-Einstellungen. | **SVM-RPC-URL kopieren** |
| **Mobile Wallets (WalletConnect)** | Ein WalletConnect-v2-Pairing. | **Pairing-QR erstellen** |

1. Suchen Sie das Panel und wählen Sie die Karte, die zum Rail Ihrer Wallet passt.
2. Wählen Sie die Hinzufügen-Schaltfläche, oder kopieren Sie die Endpunkte und die Chain-ID in das Formular „Netzwerk hinzufügen“ Ihrer Wallet.
3. Genehmigen Sie das neue Netzwerk in Ihrer Wallet.

Die öffentlichen Endpunkte sind `rpc.qore.host` (Native RPC), `api.qore.host` (REST), `evm.qore.host` (EVM JSON-RPC) und `svm.qore.host` (SVM RPC), mit `*-testnet`-Varianten (zum Beispiel `rpc-testnet.qore.host`). Chain-IDs: Mainnet `qorechain-vladi` (EVM-Chain-ID `9801`), Testnet `qorechain-diana` (EVM-Chain-ID `9800`).

### Verknüpfte Signierer (Phantom) {#linked-signers}

Mit der Karte **SVM-Wallets** können Sie außerdem einen Phantom-Schlüssel als **verknüpften Signierer** mit Ihrem Konto verbinden: ein zeitlich begrenzter (30 Tage), widerrufbarer Authenticator, keine separate primäre Wallet. Wählen Sie **Phantom verbinden** und dann **Authenticator registrieren**. Die Registrierung muss von **Keplr** signiert werden (das Dashboard braucht dafür eine verbundene Keplr), und Phantom wird nie zu einer eigenen Identität.

:::caution Die Verfügbarkeit der Registrierung unterscheidet sich je nach Netzwerk
Die Smart-Account- und Linked-Wallet-Funktionen der Chain sind im Testnet aktiviert und im Mainnet abgeschaltet (`GET /qorechain/abstractaccount/v1/config` liefert im Testnet `enabled: true` und im Mainnet `enabled: false`, geprüft am 27. Oktober 2026). Im Mainnet lehnt die Chain neue Registrierungen verknüpfter Signierer ab; betrachten Sie die Karte dort als Vorschau.
:::

:::caution Ein verknüpfter Signierer ist echte Autorität über das Konto
Die erteilte Berechtigung bestimmt, auf welchem Lane der Schlüssel handeln darf, nicht wie viel er bewegen kann, und eine Registrierung bleibt 30 Tage gültig. Verknüpfen Sie nur einen Schlüssel, dem Sie so sehr vertrauen wie dem Konto selbst, und widerrufen Sie ihn, wenn Sie ihn nicht mehr benötigen.
:::

Das Berechtigungs- und Ausgabenlimit-Modell finden Sie unter [Verknüpfte Signierer & Ausgabenlimits](/qorex/security-and-recovery#linked-signers) in den QoreX-Dokumenten.

## So greifen Sie darauf zu {#how-to-access}

- **URL:** [dashboard.qorechain.io/wallet](https://dashboard.qorechain.io/wallet). Eine Anmeldung ist erforderlich: Abgemeldet leitet die Seite zur Anmeldung weiter.
- **Netzwerk:** Der Schalter im Header bestimmt, welche Ansicht Sie erhalten (Mainnet non-custodial, Testnet custodial). Akzeptieren Sie im Mainnet zuerst die einmalige Bestätigung.
- **Wallets:** Im Testnet ist keine nötig. Im Mainnet verwenden Sie QoreX (App oder Erweiterung) zum Senden und Staken; Keplr oder MetaMask zum Ansehen und Empfangen.
- **Kosten:** Keine durch das Dashboard. On-Chain-Transaktionen zahlen die Netzwerkgebühr (Untergrenze 0,1 uqor pro Gas).
- **Guthaben:** Test-QOR aus dem [Faucet](/dashboard/faucet). Mainnet-QOR muss sich bereits in Ihrem Konto befinden.

## Wo sie veröffentlicht ist {#where-published}

| Oberfläche | Adresse | Netzwerke | Hinweise |
| --- | --- | --- | --- |
| Wallet-Seite | `dashboard.qorechain.io/wallet` | Mainnet (non-custodial) und Testnet (custodial) | Anmeldung erforderlich |
| QoreX-Verbindung und Senden | QoreX-App und -Erweiterung (siehe [QoreX](/qorex/overview)) | Nur Mainnet | Die QoreX-Abläufe des Dashboards sind fest auf das Mainnet eingestellt |
| Panel „Netzwerk hinzufügen“ | Auf der Wallet-Seite | Beide | Auch in der Übersicht des [Explorers](/dashboard/explorer) |

## Grenzen und bekannte Probleme {#limits}

- **Das Testnet hat keine Staking-Oberfläche und keine QoreX-Verbindung.** Staking und der Tab Rewards gibt es nur im Mainnet.
- **Der Mainnet-Verlauf umfasst die letzten 10 Transaktionen.** Öffnen Sie die Adresse im Explorer für mehr.
- **Keplr und MetaMask:** Keplr kann ansehen und empfangen; MetaMask kann ansehen und empfangen und sendet aus MetaMask heraus, sobald ein EVM-Fenster offen ist. Keines von beiden sendet oder staket vom Dashboard aus auf dem Native-Rail.
- **Phantom** kann nicht verbunden werden; früher verknüpfte Phantom-Adressen werden weiterhin aufgelistet.
- **Die Registrierung verknüpfter Signierer** funktioniert im Testnet und ist im Mainnet abgeschaltet; sie braucht Keplr zum Signieren.
- **Nicht im Dashboard:** Redelegation (in QoreX durchführen), ein Bildschirm für zeitgesperrtes Staking und eine Token-Liste im Mainnet.
- **Der Tab Tokens im Testnet** zeigt nur vom Dashboard ausgegebene Token, nicht die Fest-Token.

## Verwandte Themen

- [Token-Operationen](/user-guide/token-operations) - Konzepte hinter QOR-Transfers und Denominationen.
- [Staking & Validatoren](/dashboard/staking-and-validators) - Delegieren, Unbonden und Einfordern von der Wallet-Seite aus.
- [Trade](/dashboard/trade) - der Swap-Bildschirm für Test-Token.
