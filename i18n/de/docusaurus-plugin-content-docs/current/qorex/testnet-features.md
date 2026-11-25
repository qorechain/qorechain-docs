---
slug: /qorex/testnet-features
title: Testnet-Funktionen
sidebar_label: Testnet-Funktionen
sidebar_position: 10
---

# Testnet-Funktionen

:::caution NUR TESTNET
Alles auf dieser Seite funktioniert **nur im QoreChain-Testnet** (`qorechain-diana`). **Nichts davon ist im Mainnet.** Testnet-Token haben keinen Wert. Die folgenden Bildschirme erscheinen in QoreX nicht, solange Sie im Mainnet sind.
:::

QoreX hat einige Funktionen, die zuerst im Testnet erprobt werden. Sie werden nur angezeigt, solange das Testnet aktiv ist, und jeder Bildschirm sagt das mit einem Banner **TESTNET: nur Test-Token, kein echtes QOR**.

## Innovationen {#innovations}

- **Das Netzwerk bestätigt, bevor Sie signieren (nur Testnet).** Bei einer Überweisung an eine andere Chain bittet QoreX zuerst das Netzwerk, den Kanal und seine Gegenstelle zu bestätigen. Kann es das nicht, wird nichts gesendet.
- **Tatsächlicher Routenzustand (nur Testnet).** Der Bridge-Bildschirm zeigt, was das Netzwerk selbst über jede Route sagt, und bietet nichts an, was es nicht anbietet.
- **Transaktionen im Solana-Format auf QoreChain (nur Testnet).** Ein SVM-Fenster, das Sie mit Ihrer ML-DSA-87-Signatur öffnen, lässt Ihren eigenen Solana-Schlüssel innerhalb enger Grenzen handeln.

## So gelangen Sie in QoreX ins Testnet {#reach-testnet}

- **Mobile App:** Öffnen Sie die **Einstellungen** und schalten Sie **Testnet verwenden (Entwickler)** ein. Die App wechselt sofort zu `qorechain-diana`, ohne Neustart. Standard ist immer das Mainnet. Schalten Sie die Option aus, um zurückzukehren.
- **Browser-Erweiterung:** Tippen Sie siebenmal auf die Versionsnummer unten im Popup, um den Bereich **Entwicklermodus** einzublenden, und tippen Sie dann auf **Zum Testnet (diana) wechseln**. Im selben Bereich bringt Sie **Zurück zum Mainnet** zurück.

Solange das Testnet aktiv ist, erscheinen die folgenden Testnet-Bildschirme in den **Einstellungen** der App und im Popup der Erweiterung (**An eine andere Chain senden** und **Bridge**), und das Werkzeug **Solana auf QoreChain** erscheint unter dem Tab Entwickler oder auf der Seite Entwicklerwerkzeuge. Testnet-Guthaben zeigen keinen Dollarwert. dApps können das Netzwerk nicht wechseln; nur Sie können das.

## Test-QOR erhalten {#get-test-qor}

Testnet-QOR ist kostenlos und hat keinen Wert. Sie erhalten es über das [Dashboard-Faucet](/dashboard/faucet): Melden Sie sich dort an, kopieren Sie Ihre Testnet-Adresse aus QoreX (das Entwicklerwerkzeug **Testnet-Arbeitsbereich** hat eine Schaltfläche **Adresse kopieren** und eine Schaltfläche **Testnet-Faucet öffnen**) und fordern Sie Token an. Die öffentlichen Testnet-Endpunkte finden Sie auch unter [Mit dem Testnet verbinden](/getting-started/connecting-to-testnet).

## An eine andere Chain senden (IBC) {#ibc}

**NUR TESTNET.** Senden Sie QOR aus dem QoreChain-Testnet an die Testnets von **Cosmos Hub**, **Osmosis**, **Injective**, **Akash** und **Celestia** und holen Sie es zurück.

Was QoreX für Sie tut:

- **Es prüft zuerst die Route.** Bevor Sie signieren können, bittet QoreX das Netzwerk zu bestätigen, dass der Kanal offen ist und weiterhin zu der gewählten Chain führt. Ist der Kanal geschlossen, geändert oder nicht bestätigbar, sagt QoreX das und sendet nichts.
- **Es zeigt die vollständige Prüfansicht.** Sie sehen vor dem Signieren den Absender, den Empfänger auf der anderen Chain, die Netzwerkgebühr und die Zeitvorgaben.
- **Zeitvorgaben.** Eine Testüberweisung an das Cosmos-Hub-Testnet kam in etwa 20 Sekunden an. QoreX sagt Ihnen, dass Sie etwa eine Minute einplanen sollten. Wird sie nicht innerhalb von 10 Minuten zugestellt, kommt sie zu Ihnen zurück.
- **Welche Signatur.** Eine Überweisung von QoreChain wird mit Ihrem hybriden Schlüssel signiert (ML-DSA-87 und secp256k1). Der Rückweg wird auf der anderen Chain mit einem klassischen Schlüssel signiert, wie es diese Chain verlangt, und die Prüfansicht sagt das: Auf jener Chain sind diese Coins nur durch einen klassischen Schlüssel geschützt.

### Von QoreChain senden {#ibc-send}

1. Schalten Sie das Testnet ein (siehe [oben](#reach-testnet)), öffnen Sie die **Einstellungen** (Erweiterung: das Popup) und tippen Sie auf **An eine andere Chain senden**.
2. Wählen Sie die **Ziel-Chain** und das **Asset** (QOR oder Coins, die über IBC angekommen sind).
3. Geben Sie den **Betrag** ein. Der **Empfänger** (**Receiver**) ist mit Ihrer eigenen Adresse auf jener Chain vorausgefüllt; Sie können ihn ändern. QoreX prüft, ob es eine gültige Adresse für diese Chain ist.
4. Tippen Sie auf **Prüfen**, prüfen Sie die Angaben unter **Vor dem Signieren prüfen** und dann **Signieren und senden**.

### Coins zurückholen {#ibc-back}

1. Öffnen Sie in **An eine andere Chain senden** den Punkt **Zurück zu QoreChain holen** und tippen Sie auf der verwendeten Chain auf **Show my balances**.
2. Wählen Sie unter **Was zurückgeholt wird**, was zurückkommen soll. Das Konto auf jener Chain braucht etwas von deren eigener Münze, um die Gebühr zu zahlen; QoreX sagt Ihnen, wenn sie fehlt.
3. Prüfen Sie und wählen Sie dann **Signieren und zurückholen**. Die Coins werden an Ihre eigene QoreChain-Adresse zugestellt.

### Eine Überweisung verfolgen {#ibc-track}

**Deine Überweisungen** listet jede Überweisung auf und verfolgt sie: wartet auf das Netzwerk, unterwegs, zugestellt oder zu Ihnen zurückgekommen (mit dem Grund oder weil die Zeit abgelaufen ist). Tippen Sie auf **Aktualisieren**, um erneut zu lesen. Ist der Status noch nicht bekannt, sagt QoreX, dass die Zustellung nicht bestätigt ist, statt zu raten.

## Bridge-Bildschirm {#bridge}

**NUR TESTNET.** Der Bildschirm **Bridge** liest die Routen der QoreChain Bridge aus dem Netzwerk und zeigt den tatsächlichen Zustand jeder Route: noch nicht geöffnet, pausiert, derzeit geschlossen, offen, offen für Auszahlungen oder offen für Einzahlungen. Eine Route wird nur angeboten, wenn das Netzwerk selbst sagt, dass sie offen ist.

**Heute sind im Testnet alle Routen geschlossen, daher wird nichts angeboten.** Der Bildschirm steht bereit für den Zeitpunkt, an dem Routen öffnen. Nichts hier ist eine Route, ein Asset oder ein Betrag, den Sie jetzt nutzen können, und nichts ist im Mainnet.

## Solana auf QoreChain {#solana-on-qorechain}

**NUR TESTNET.** Die SVM-Lane führt auf QoreChain Transaktionen im Solana-Format aus. Es ist ein Werkzeug des Entwicklermodus, das nur angezeigt wird, solange das Testnet aktiv ist. Im Mainnet ist die SVM-Lane nicht geöffnet, und nichts hiervon kann verwendet werden.

Was das Werkzeug tut:

- **Zeigt die Lane.** Ob die SVM-Lane im Netzwerk läuft, und ihren Cluster.
- **Zeigt Ihr SVM-Fenster.** Ein Fenster lässt Transaktionen, die mit Ihrem Solana-Schlüssel signiert sind, innerhalb von Grenzen von Ihrem Konto ausgeben, ohne ML-DSA-87-Signatur. QoreX zeigt, ob eines offen ist, wie viele Blöcke, Transaktionen und QOR noch übrig sind, welcher Solana-Schlüssel gebunden ist und welche Programme es zulässt.
- **Öffnet und schließt ein Fenster.** Öffnen Sie ein Fenster, indem Sie wählen, welche Programme es zulässt (sie aufzulisten wird empfohlen; **Jedes Programm** trägt eine Warnung), wie viele Blöcke es offen bleibt (höchstens 17.280), wie viele Transaktionen (höchstens 1.000) und wie viel QOR es höchstens ausgeben darf. Gebunden wird der Solana-Schlüssel mit Index 0 Ihrer Wiederherstellungsphrase. Das Öffnen eines Fensters ersetzt das vorhandene. Es gilt die Warnung auf dem Bildschirm: Halten Sie es klein und kurz, und schließen Sie es, wenn Sie fertig sind, mit **Fenster schließen**.
- **Leitet eine signierte Solana-Transaktion weiter.** Fügen Sie die Wire-Bytes (base64 oder base58) aus einem Entwicklerwerkzeug ein und tippen Sie auf **Lesen**. QoreX zeigt die Programme und welche Signierer signiert haben und leitet nur vollständig signierte Transaktionen weiter. Ihr QoreChain-Konto signiert den Umschlag mit ML-DSA-87 und zahlt dessen Gebühr; es erhält keine Befugnis über die Solana-Transaktion.

Verwendung: Schalten Sie das Testnet und den Entwicklermodus ein, öffnen Sie **Solana auf QoreChain** im Tab Entwickler (oder auf der Seite Entwicklerwerkzeuge der Erweiterung) und nutzen Sie dann die obigen Abschnitte. Auch Vertragsaufrufe an SVM-Programme aus dem [Entwicklermodus](/qorex/developer-mode#contracts) funktionieren nur im Testnet.

Die Chain-Seite der SVM-Lane finden Sie unter [SVM im Testnet](/developer-guide/svm-testnet-v329) und [die SVM-Lane](/developer-guide/svm-lane-v328).

## Was nicht im Mainnet ist {#not-on-mainnet}

- Das Senden an andere Chains über IBC aus QoreX.
- Der QoreChain-Bridge-Bildschirm und seine Routen.
- Solana auf QoreChain, einschließlich SVM-Fenstern und Weiterleitung.

QoreX zeigt diese Bildschirme nur im Testnet und sagt das auf jedem.
