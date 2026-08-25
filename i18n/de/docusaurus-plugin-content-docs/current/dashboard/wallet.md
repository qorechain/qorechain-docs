---
slug: /dashboard/wallet
title: Wallet
sidebar_label: Wallet
sidebar_position: 3
---

# Wallet

Auf der **Wallet**-Seite sehen Sie Ihren Kontostand und Ihren Transaktionsverlauf, empfangen QOR und senden es. Wie die Seite funktioniert, hängt vom Netzwerk ab:

- **Mainnet — non-custodial.** Das Dashboard verwahrt keine Mainnet-Schlüssel. Sie verbinden Ihre eigene Wallet — **QoreX** (die offizielle QoreChain-Wallet, als Erweiterung oder App), **Keplr** oder **MetaMask** — Ihr echter Kontostand und Verlauf werden direkt von der Chain gelesen, und Sie können auf jedem Rail Guthaben empfangen. Senden und Staken auf dem **Native-Rail erfordern QoreX**: QoreChain-Konten signieren mit einer post-quantum-hybriden Signatur, und QoreX ist die Wallet, die diese erzeugt — deshalb laufen die Tabs „Senden" und „Staken" des Dashboards über QoreX, unabhängig davon, welche andere Wallet Sie zusätzlich verbunden haben. Keplr kann weiterhin verbunden werden, um Ihren Native-Rail-Kontostand (`qor1...`) einzusehen und um darauf Guthaben zu empfangen. **MetaMask** signiert und sendet unabhängig auf dem **EVM-Rail** (`0x...`), das eine klassische Signatur verwendet und davon nicht betroffen ist.
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
3. Wählen Sie **Wallet verbinden** und eine Wallet aus — **QoreX** (empfohlen, die offizielle QoreChain-Wallet — erforderlich zum Senden und Staken auf dem Native-Rail), **Keplr** (zum Ansehen/Empfangen auf dem Native-Rail) oder **MetaMask** (zum Verbinden, Senden und Empfangen auf dem EVM-Rail). Die Schritt-für-Schritt-Anleitung für jede finden Sie unten.
4. Die Seite lädt Ihren echten Kontostand und Transaktionsverlauf von der Chain.

Nach dem Verbinden gliedert die Wallet-Seite alles in sechs Tabs: **Wallet** (Kontostand und Kontoübersicht), **Senden von QoreX**, **Staken / Delegieren**, **Rewards**, **Details** (Ihre `qor1...`-/`0x...`-/SVM-Adressen) und **Wallets verbinden** (jede von Ihnen angebundene Wallet, und wo Sie weitere verbinden). Die Tabs „Senden", „Staken" und „Rewards" laufen über QoreX — das gilt auch dann, wenn Sie zusätzlich Keplr oder MetaMask verbunden haben, weil Native-Rail-Transaktionen die post-quantum-hybride Signatur benötigen, die QoreX erzeugt.

Falls in Ihrer Wallet QoreChain noch nicht konfiguriert ist, fügen Sie es zuerst hinzu — siehe [QoreChain zu Ihrer Wallet hinzufügen](#add-network).

### Verbinden mit QoreX — Browser-Erweiterung {#connect-qorex-extension}

1. Suchen Sie auf der Wallet-Seite die Karte **QoreX-Wallet** und wählen Sie **Mit QoreX verbinden**.
2. Da die QoreX-Erweiterung (0.1.4 oder neuer) in diesem Browser erkannt wird, fragt das Dashboard, wie Sie sich verbinden möchten. Wählen Sie **Browser-Erweiterung**.
3. Die QoreX-Erweiterung öffnet ihr eigenes Genehmigungs-Popup und zeigt `dashboard.qorechain.io` als die Seite an, die die Verbindung anfordert.
4. Prüfen Sie die Anfrage im Popup und genehmigen Sie sie — dies signiert einen einmaligen Nachweis, dass Ihnen die Adresse `qor1...` gehört; es werden keine Gelder bewegt und keine weitere Berechtigung erteilt.
5. Das Popup schließt sich, und das Dashboard zeigt auf der QoreX-Karte **Verbunden: qor1...** an, wobei Ihre Adresse den Rest der Wallet-Seite freischaltet. Die Wahl zwischen Erweiterung und App wird gespeichert, sodass beim nächsten Auswählen von **Mit QoreX verbinden** in diesem Browser dieselbe Methode ohne erneute Nachfrage verwendet wird — verwenden Sie **Andere Methode verwenden** auf der Verbindungskarte, wenn Sie jemals wechseln möchten.

Sie können mehr als eine QoreX-Adresse mit demselben Dashboard-Konto verknüpfen — zum Beispiel eine von einer Firefox-Erweiterung und eine von Chrome, oder ein Smartphone und ein Laptop. Wählen Sie **Weitere Wallet hinzufügen**, um den Ablauf mit einer zweiten Adresse zu wiederholen; jeder verknüpften Adresse kann eine eigene Bezeichnung gegeben werden, und eine wird als Standard fürs Senden markiert, beides im Tab **Wallets verbinden**.

**Zwischen Wallets im Tab Wallet wechseln.** Sobald mehr als eine Wallet verbunden ist — QoreX und MetaMask, oder zwei QoreX-Adressen — erscheint oben im Tab **Wallet** selbst eine Reihe von Wallet-Chips, einer pro verbundener Wallet, wobei die aktive markiert ist. Klicken Sie auf einen Chip, um zu wechseln, dessen Kontostand und Verlauf Sie gerade betrachten, ohne den Tab zu verlassen oder zu **Wallets verbinden** zu gehen. Die Reihe wird ausgeblendet, wenn nur eine Wallet verbunden ist, da eine Auswahl dann nichts zu tun hätte.

### Verbinden mit QoreX — Mobile App {#connect-qorex-app}

1. Suchen Sie auf der Wallet-Seite die Karte **QoreX-Wallet** und wählen Sie **Mit QoreX verbinden**.
2. Falls die Erweiterungsauswahl erscheint, wählen Sie **QoreX-App** (wird in diesem Browser keine Erweiterung erkannt, führt das Dashboard direkt zu diesem Ablauf).
3. Das Dashboard zeigt einen QR-Code und einen Link **QoreX öffnen** an.
4. Öffnen Sie auf Ihrem Smartphone die QoreX-App und scannen Sie damit den QR-Code — oder tippen Sie, falls Sie auf demselben Smartphone browsen, auf **QoreX öffnen**, um die App direkt über ihren `qorex://connect`-Link zu starten.
5. QoreX zeigt die Pairing-Anfrage mit der Herkunft (Origin) des Dashboards an. Prüfen Sie sie und genehmigen Sie mit Ihrer biometrischen Bestätigung (Face ID / Touch ID / PIN).
6. Das Dashboard fragt im Hintergrund die Genehmigung ab; innerhalb weniger Sekunden zeigt es auf der QoreX-Karte **Verbunden: qor1...** an, und Ihre Adresse schaltet den Rest der Wallet-Seite frei.

### Verbinden mit Keplr {#connect-keplr}

Keplr verbindet sich, um Ihren Native-Rail-Kontostand, Verlauf und Ihre Empfangsadresse anzuzeigen. Senden und Staken auf dem Native-Rail erfolgen über QoreX (siehe oben) — QoreChain-Konten signieren mit einer post-quantum-hybriden Signatur, weshalb die Tabs „Senden" und „Staken" des Dashboards über QoreX laufen und nicht über die Wallet, die Sie hier verbunden haben.

1. Wählen Sie auf der Wallet-Seite **Wallet verbinden** und dann **Keplr**.
2. Falls QoreChain in Keplr noch nicht konfiguriert ist, löst das Dashboard Keplrs `suggestChain`-Aufforderung aus — prüfen Sie die Netzwerkdetails (Chain-ID, RPC-/REST-Endpunkte) im Keplr-Popup und wählen Sie **Genehmigen**, um es hinzuzufügen.
3. Keplr bittet Sie anschließend, das zu verbindende Konto auszuwählen und die Verbindung zu genehmigen — wählen Sie **Genehmigen**.
4. Das Dashboard liest Ihre `qor1...`-Adresse und lädt Ihren Kontostand und Verlauf.

### Verbinden mit MetaMask {#connect-metamask}

1. Wählen Sie auf der Wallet-Seite **Wallet verbinden** und dann **MetaMask**.
2. Falls das QoreChain-EVM-Netzwerk noch nicht hinzugefügt ist, zeigt MetaMask seine Aufforderung **Netzwerk hinzufügen** (EIP-3085) mit vorausgefüllter Chain-ID, RPC-URL und Währungssymbol an — prüfen Sie diese und wählen Sie **Genehmigen**, dann **Netzwerk wechseln**.
3. MetaMask fragt, welches Konto verbunden werden soll — wählen Sie das Konto aus und bestätigen Sie mit **Verbinden**.
4. Das Dashboard liest Ihre `0x...`-Adresse und lädt Ihren Kontostand und Verlauf.

### Senden im Mainnet {#send-mainnet}

Da das Dashboard niemals Ihre Mainnet-Schlüssel verwahrt, wird jede Sendung im Dashboard zusammengestellt, aber in Ihrer eigenen Wallet finalisiert. Auf dem **Native-Rail** ist diese Wallet immer **QoreX** — die Tabs „Senden" und „Staken" laufen über sie, unabhängig davon, welche andere Wallet Sie zusätzlich verbunden haben, weil QoreChain-Konten mit einer post-quantum-hybriden Signatur signieren. Auf dem **EVM-Rail** signiert und sendet MetaMask unabhängig.

:::caution Echte Gelder, unwiderrufliche Transfers
Mainnet-Transaktionen sind unwiderruflich. Prüfen Sie vor dem Genehmigen immer die Empfängeradresse doppelt.
:::

:::note Vesting-Guthaben
Wenn ein Teil Ihres Kontostands noch vestet, zählt er zu dem, was Sie fürs Staking delegieren können, aber er kann keine Transaktionsgebühr bezahlen — dafür benötigen Sie separat verfügbares QOR, auch um einen PQC-Schlüssel zu registrieren. Eine Wallet, die nur mit ihrem Vesting-Betrag ausgestattet ist, kann delegieren, aber nicht senden.
:::

#### Senden mit QoreX — Browser-Erweiterung

1. Geben Sie auf der Wallet-Seite in der Karte **Senden von QoreX** den Empfänger ein (eine `qor1...`-Adresse oder ein `@handle`), den Betrag in QOR und optional ein Memo.
2. Wählen Sie **In QoreX fortsetzen**.
3. Das Dashboard zeigt eine Schaltfläche **In Browser-Erweiterung genehmigen** an — wählen Sie diese.
4. Die QoreX-Erweiterung öffnet ihr Genehmigungs-Popup mit dem vollständig entschlüsselten Transfer — Empfänger und Betrag. Prüfen Sie ihn und genehmigen Sie mit der eigenen Sicherheitsfunktion Ihrer Erweiterung (biometrisch oder Passwortentsperrung).
5. Die Erweiterung signiert den Transfer mit einer hybriden PQC-Signatur und überträgt ihn direkt an die Chain — das Dashboard erfährt nur den resultierenden Transaktions-Hash.
6. Die Wallet-Seite zeigt **Transfer bestätigt** mit dem Transaktions-Hash an, den Sie im [Explorer](/dashboard/explorer) öffnen können.

#### Senden mit QoreX — Mobile App

1. Geben Sie auf der Wallet-Seite in der Karte **Senden von QoreX** den Empfänger ein (eine `qor1...`-Adresse oder ein `@handle`), den Betrag in QOR und optional ein Memo.
2. Wählen Sie **In QoreX fortsetzen**.
3. Das Dashboard zeigt einen QR-Code und einen Link **QoreX öffnen** mit einer `qorex://tx`-Anfrage an.
4. Scannen Sie den QR-Code mit der QoreX-App, oder tippen Sie auf **QoreX öffnen**, wenn Sie sich auf demselben Smartphone befinden.
5. QoreX entschlüsselt die Anfrage und zeigt Empfänger und Betrag vollständig an. Prüfen Sie sie und genehmigen Sie mit Ihrer biometrischen Bestätigung.
6. QoreX signiert den Transfer mit einer hybriden PQC-Signatur und überträgt ihn.
7. Das Dashboard fragt das Ergebnis ab und zeigt **Transfer bestätigt** mit dem Transaktions-Hash, sobald er on-chain gelandet ist, den Sie im [Explorer](/dashboard/explorer) öffnen können.

#### Senden an ein @handle

Das Empfängerfeld in der Karte **Senden von QoreX** akzeptiert statt einer `qor1...`-Adresse auch ein `@handle`. Was als Nächstes passiert, hängt davon ab, ob Sie diesem Handle von diesem Browser aus schon einmal etwas bezahlt haben:

- **Erstes Mal**: Die aufgelöste Adresse wird vollständig angezeigt, und Sie müssen **Adresse bestätigen** auswählen, bevor sie verwendet werden kann — die Adresse wird erst nach Ihrer Bestätigung gemerkt (gepinnt), nicht schon im Moment der Auflösung.
- **Dieselbe Adresse wie zuvor**: Sie wird mit einer leichten Bestätigung durchgereicht — kein erneutes Eintippen nötig.
- **Eine andere Adresse als zuvor**: Der Ablauf stoppt hart. Sowohl die vorherige als auch die neue Adresse werden vollständig angezeigt — niemals gekürzt, da eine Kürzung genau die mittleren Zeichen verbirgt, die ein Angreifer ähnlich aussehen lassen würde — mit einer expliziten Warnung, dass sich die Adresse geändert hat, und einer **bewusst zweitrangig gestalteten** Schaltfläche, um trotzdem fortzufahren.

Dieser Pin wird nur in Ihrem eigenen Browser gespeichert, nicht auf einem Server, sodass ein anderer Computer oder ein geleerter Browser wieder „erstes Mal" anzeigt — das ist beabsichtigt. Handles bestehen aus 3–20 Zeichen (`a-z`, `0-9`, `_`) und gehören zu einer bestimmten Adresse, sodass jemand mit mehreren Adressen auf jeder ein anderes Handle verwenden kann.

#### Senden mit MetaMask

1. Öffnen Sie MetaMask und bestätigen Sie, dass es auf das QoreChain-EVM-Netzwerk eingestellt ist.
2. Wählen Sie in MetaMask **Senden**.
3. Geben Sie die `0x...`-Adresse des Empfängers und den Betrag ein.
4. Prüfen Sie die Gasgebühr und bestätigen Sie, um zu signieren und zu übertragen.
5. Zurück auf der Dashboard-Wallet-Seite erscheint die Transaktion in Ihrem Verlauf, sobald sie on-chain ist (aktualisieren Sie, falls sie noch nicht angezeigt wird).

### Auf einem bestimmten Rail empfangen {#receive-mainnet}

1. Wählen Sie **Empfangen**.
2. Wählen Sie im Empfangs-Modal mit dem Selektor ein Rail aus: **Native QOR**, **EVM** oder **SVM**.
3. Das Modal zeigt Ihre Adresse in der Kodierung dieses Rails (`qor1...`, `0x...` oder base58) mit einem QR-Code und einer Kopieren-Schaltfläche an.
4. Kopieren Sie die Adresse, oder lassen Sie den Absender den QR-Code scannen.

Unabhängig davon, welches Rail der Absender verwendet, landen die Gelder im selben Konto — ein Konto, drei Kodierungen, ein Kontostand.

### Ihren Transaktionsverlauf lesen {#history}

Im Mainnet zeigt jede Zeile Ihres Verlaufs:

- Ein **Rail-Badge** — Native, EVM oder SVM — das anzeigt, welches Rail die Transaktion verwendet hat.
- Eine **echte Transaktionstyp-Bezeichnung**, wie *Senden*, *PQC-Schlüsselregistrierung* oder *Contract-Deployment*, statt einer generischen Bezeichnung.
- Betrag, Zeitpunkt und Status, mit dem Transaktions-Hash, den Sie im [Explorer](/dashboard/explorer) öffnen können.

## Die Wallet im Testnet verwenden {#testnet}

Im Testnet (`qorechain-diana`) verwaltet das Dashboard eine Test-Wallet für Sie, sodass Sie Abläufe end-to-end testen können, ohne irgendetwas zu verbinden.

### Was die Seite anzeigt

- Ihre Wallet-Bezeichnung und aktive Adresse, in gekürzter Form, mit einer Ein-Klick-Kopieren-Schaltfläche.
- Ihren **Gesamtkontostand** in QOR.
- Ein Sicherheitspanel, das quantensichere Verschlüsselung und das verbundene Netzwerk vermerkt.
- Eine Anzeige der letzten Aktualisierung mit einer Aktualisieren-Steuerung.
- Die Tabs **Assets** und **Aktivität**, die Ihre Bestände und Ihren Transaktionsverlauf anzeigen.

Verwenden Sie die Aktualisieren-Steuerung jederzeit, um Ihren aktuellen Kontostand und die neueste Aktivität von der Chain abzurufen.

### QOR senden (Testnet)

1. Wählen Sie **Senden**.
2. Geben Sie die Empfängeradresse ein (`qor1...`).
3. Geben Sie den Betrag und optional ein Memo ein.
4. Prüfen Sie die Details und die geschätzte Gebühr, und bestätigen Sie dann.

Während Sie einen Empfänger eintippen, werden gespeicherte Kontakte und zuletzt verwendete Adressen vorgeschlagen, um Fehler zu vermeiden. Nach dem Absenden des Transfers erhalten Sie eine Bestätigung mit dem Transaktions-Hash, den Sie im [Explorer](/dashboard/explorer) öffnen können.

### QOR empfangen (Testnet)

1. Wählen Sie **Empfangen**.
2. Teilen Sie Ihre Adresse oder deren QR-Code mit dem Absender, oder kopieren Sie die Adresse mit einem Klick.
3. Geben Sie optional einen angeforderten Betrag und ein Memo ein, um einen Zahlungslink und einen herunterladbaren QR-Code zu erzeugen.

### Ihre Test-Wallets verwalten

Wählen Sie **Meine Wallets**, um Ihre Adressliste zu öffnen. Von dort aus können Sie zwischen Wallets wechseln, eine neue Wallet erstellen, eine bestehende importieren oder eine nicht mehr benötigte Wallet entfernen. Die aktive Wallet ist diejenige, die im Testnet für Senden, Swappen, Staking und andere signierte Aktionen im gesamten Dashboard verwendet wird.

## QoreChain zu Ihrer Wallet hinzufügen {#add-network}

Die Seite **Netzwerk hinzufügen** zeigt vier nebeneinanderliegende Karten — eine pro Verbindungsart —, sodass Sie QoreChain mit einem Klick zu Ihrer eigenen Wallet hinzufügen können:

| Karte | Was sie Ihnen bietet |
| --- | --- |
| **Native** | RPC- und REST-Endpunkte sowie die Chain-ID, jeweils mit Kopieren-Schaltfläche — für Keplr und andere Native-Rail-Wallets. |
| **EVM** | Fertige EIP-3085-Netzwerkparameter — ein Klick fügt QoreChain zu MetaMask und anderen EVM-Wallets hinzu. |
| **SVM** | Die SVM-RPC-URL für SVM-kompatible Wallets und Tools. |
| **WalletConnect** | Ein WalletConnect-Pairing, um eine beliebige WalletConnect-kompatible Wallet zu verknüpfen. |

So fügen Sie QoreChain hinzu:

1. Öffnen Sie die Seite **Netzwerk hinzufügen** im Dashboard.
2. Wählen Sie die Karte, die zum Rail Ihrer Wallet passt.
3. Wählen Sie die Hinzufügen-Schaltfläche (EVM, WalletConnect), oder kopieren Sie die Endpunkte und die Chain-ID in das Formular „Netzwerk hinzufügen" Ihrer Wallet (Native, SVM).
4. Genehmigen Sie das neue Netzwerk in Ihrer Wallet.

Die öffentlichen Endpunkte sind `rpc.qore.host` (Native RPC), `api.qore.host` (REST), `evm.qore.host` (EVM JSON-RPC) und `svm.qore.host` (SVM RPC), mit `*-testnet`-Varianten (zum Beispiel `rpc-testnet.qore.host`) für das Testnet. Chain-IDs: Mainnet `qorechain-vladi` (EVM-Chain-ID `9801`), Testnet `qorechain-diana` (EVM-Chain-ID `9800`).

### Verknüpfte Signierer (Phantom) {#linked-signers}

Mit der Karte **SVM** können Sie außerdem einen Phantom-Schlüssel als **verknüpften Signierer** mit Ihrem Konto verbinden — ein delegierter, widerrufbarer Ausgaben-Authenticator, keine separate primäre Wallet-Verbindung wie QoreX, Keplr oder MetaMask. Ihre bestehende Wallet signiert die Registrierung; Phantom wird nie zu einer eigenen Identität. Das On-Chain-Berechtigungs- und Ausgabenlimit-Modell dahinter finden Sie unter [Verknüpfte Signierer & Ausgabenlimits](/qorex/security-and-recovery#linked-signers) in den QoreX-Dokumenten.

## Verwandte Themen

- [Token-Operationen](/user-guide/token-operations) — Konzepte hinter QOR-Transfers und Denominationen.
- [Trade](/dashboard/trade) — Tauschen Sie Ihre Tokens auf dem On-Chain-AMM.
- [Bridge](/dashboard/bridge) — Bewegen Sie Assets zu und von anderen Chains.
