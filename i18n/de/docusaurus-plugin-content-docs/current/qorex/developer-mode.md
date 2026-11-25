---
slug: /qorex/developer-mode
title: Entwicklermodus
sidebar_label: Entwicklermodus
sidebar_position: 9
---

# Entwicklermodus

Der Entwicklermodus ist ein Schalter in den **Einstellungen** von QoreX. Er ist **standardmäßig aus**. Solange er an ist, zeigt QoreX eine Reihe von Werkzeugen für alle, die auf **QORE**CHAIN entwickeln: Inspektoren, die das Netzwerk lesen, einen Ort zum Simulieren und Dekodieren von Transaktionen, Werkzeuge für Verträge und Rollups, Offline-Signieren und eine Möglichkeit, von KI-Agenten vorgeschlagene Transaktionen zu prüfen.

Der Entwicklermodus ändert keine Signierregel. Alles, was signiert, zeigt Ihnen weiterhin, was es signiert, und wartet auf Ihre Freigabe, genau wie zuvor.

## Innovationen {#innovations}

- **Jedes Werkzeug liest oder prüft zuerst.** Die Inspektoren lesen nur. Die Werkzeuge, die signieren können, zeigen eine dekodierte Prüfansicht und warten auf Ihre Freigabe.
- **Exakte Zahlen aus dem Netzwerk.** Die Inspektoren zeigen, was die Chain selbst meldet: ihre Version, ihre Funktionen, die registrierten Schlüssel Ihres Kontos, Ihr EVM-Fenster.
- **Fehler in klaren Worten.** Der Fehlerdecoder verwandelt einen rohen Netzwerkfehler in einen Satz und sagt, was als Nächstes zu tun ist.
- **KI-Agenten schlagen vor, Sie entscheiden.** Ein Agent kann lesen, was Sie erlauben, und eine Transaktion vorschlagen. QoreX prüft und simuliert sie, und Sie genehmigen oder lehnen sie im normalen Freigabefenster ab. Kein Agent kann signieren.

## So schalten Sie ihn ein {#how-to-use}

- **Mobile App (iPhone und Android):** Öffnen Sie die **Einstellungen** und schalten Sie den **Entwicklermodus** ein. In der unteren Leiste erscheint ein Tab **Entwickler** mit einem Code-Symbol (`</>`). Öffnen Sie ihn, um die Werkzeuge zu sehen. Schalten Sie die Einstellung aus, verschwindet der Tab wieder.
- **Browser-Erweiterung:** Tippen Sie im Popup siebenmal auf die Versionsnummer unten. Im Popup erscheint ein Bereich **Entwicklermodus** mit einer Schaltfläche **Entwicklerwerkzeuge**. Die Schaltfläche öffnet eine Seite mit denselben Gruppen wie der Tab der App. Derselbe Bereich hat **Entwicklermodus ausschalten**.

Im selben Bereich befindet sich der Netzwerkschalter. In der App heißt er **Testnet verwenden (Entwickler)** in den Einstellungen, in der Erweiterung **Zum Testnet (diana) wechseln**. Was es nur im Testnet gibt, steht unter [Testnet-Funktionen](/qorex/testnet-features).

Die Werkzeuge sind in App und Erweiterung dieselben, außer wo ein Werkzeug etwas anderes sagt. Sie sind wie folgt gruppiert.

## Prüfen {#inspect}

Nur lesend, im Mainnet und Testnet. Nichts auf diesen Bildschirmen signiert oder sendet.

### Netzwerk- und Funktionsinspektor

Zeigt, in welchem Netzwerk Sie sind und was es unterstützt: die Chain-ID, die Version des Nodes, den neuesten Block, das zuletzt angewendete Upgrade und ein geplantes, die von der Chain gemeldeten Protokollfunktionen (aktiviert, vorbereitet oder nicht aktiviert), die Chain-ID der EVM-Lane, ob die SVM-Lane ausführt oder geschlossen ist, die Cross-VM- und Post-Quanten-Parameter und wie viele IBC-Kanäle und Bridge-Routen das Netzwerk auflistet. Ein zweiter Teil, **Diese Wallet**, zeigt Ihre QoreX-Version, den Build (App oder Erweiterung) sowie die Signiermethoden und den Simulationsmodus, die dieser Build verwendet.

Verwendung: Öffnen Sie den **Netzwerk- und Funktionsinspektor**. Tippen Sie auf **Aktualisieren**, um erneut zu lesen. Mit **Kopieren** neben einem Wert kopieren Sie ihn.

### Kontoinspektor

Zeigt das aktive Konto: ob es ein Cosmos-Konto (Coin 118) oder ein vereinheitlichtes Konto (Coin 60) ist, seinen Slot und seine Ableitungsindizes, seine Adressen auf jeder Lane (nativ `qor1...`, EVM `0x...`, SVM-Schlüssel) und die öffentlichen Schlüssel. Angezeigt werden nur öffentliche Informationen; nichts Geheimes verlässt den Tresor.

Verwendung: Öffnen Sie den **Kontoinspektor** und tippen Sie dann auf **Adressen und öffentliche Schlüssel anzeigen** (QoreX bittet Sie möglicherweise zu entsperren).

### PQC-Inspektor

Zeigt den ML-DSA-87-Schlüssel, der auf der Chain für Ihr Konto registriert ist: den Algorithmus, die Höhe, bei der er registriert wurde, den SHA-256 des öffentlichen Schlüssels, seine Größe, ob die Regeln der Chain ihn noch akzeptieren, und seinen Besitznachweis (Proof of Possession). Anschließend kann er diesen Schlüssel mit dem auf diesem Gerät vergleichen und sagen, ob sie übereinstimmen (kanonischer Schlüssel, eine ältere Ableitung oder eine nummerierte Rotation). Außerdem gibt es eine Tabelle **Was einen Vorgang schützt**: für eine native Überweisung, eine EVM-Transaktion, eine SVM-Transaktion, eine IBC-Überweisung und eine Überweisung auf einer externen Chain, welche Signatur post-quantenfähig und welche klassisch ist.

Verwendung: Öffnen Sie den **PQC-Inspektor**, um den Schlüssel auf der Chain zu lesen, und tippen Sie dann auf **Mit dem Schlüssel dieses Geräts vergleichen**, um den Vergleich auszuführen. Lehnt die Chain den registrierten Schlüssel ab, sagt der Bildschirm, dass er erneut registriert werden muss.

### EVM-Fenster-Inspektor

Zeigt, ob für Ihr Konto ein EVM-Fenster aktiv ist, die Höhen und ungefähren Zeiten, zu denen es geöffnet wurde und abläuft, wie viele Transaktionen und welcher Wert verbraucht und noch übrig sind und was es erlaubt (nur QOR-Überweisungen oder Aufrufe und Überweisungen; die erlaubten Empfänger und Verträge). Öffnen und Schließen eines Fensters geschehen auf dem EVM-Fenster-Bildschirm, nicht hier. Siehe [Sicherheit und Wiederherstellung](/qorex/security-and-recovery#evm-window).

Verwendung: Öffnen Sie den **EVM-Fenster-Inspektor**. Heißt es, ein Fenster „konnte nicht gelesen werden“, ist das nicht dasselbe wie keines zu haben.

## Transaktionen {#transactions}

Mainnet und Testnet, sofern ein Werkzeug nichts anderes sagt.

### Transaktionsinspektor

Fügen Sie einen Transaktions-Hash (QoreChain oder EVM mit `0x`) oder eine Rohanfrage ein: ein SignDoc-JSON, ein base64-TxRaw, ein EVM-Transaktions-JSON oder eine dApp-Anfrage. QoreX dekodiert jede Nachricht, zeigt, wer signiert, wer empfängt, die bewegten Mittel, die Gebühr, das Memo und die angeforderten Berechtigungen und sagt, ob die Post-Quanten-Signatur angehängt ist. Bei einer Transaktion, die bereits im Netzwerk ist, zeigt es auch das Ergebnis, das verbrauchte Gas und die Events. Ein Nachrichtentyp, den QoreX nicht lesen kann, wird mit seinen Rohbytes als unbekannt angezeigt; QoreX rät nicht. Anfragen werden auf Ihrem Gerät gelesen und niemals gesendet.

Verwendung: Öffnen Sie den **Transaktionsinspektor**, fügen Sie ein und tippen Sie auf **Prüfen**.

### Simulationswerkbank

Fügen Sie QoreChain-Nachrichten als JSON oder eine EVM-Transaktion ein, und QoreX fragt das Netzwerk, was passieren würde. Nichts wird signiert oder gesendet. Sie sehen, ob es gelingen würde, das benötigte Gas und die Gebühr, die einmalige Gebühr für die Registrierung des Post-Quanten-Schlüssels, falls sie anfällt, die Änderungen an den Assets Ihres Kontos und eine Liste dessen, was die Simulation nicht zeigen kann (zum Beispiel den eigenen Zustand eines Vertrags oder Cross-VM-Schritte, die in einem späteren Block laufen). Netzwerkfehler werden vom eingebauten **Fehlerdecoder** in klare Worte übersetzt, mit einem Vorschlag für das weitere Vorgehen: Fügen Sie ein Raw-Log, ein Ergebnis-JSON oder eine Fehlermeldung ein und tippen Sie auf **Dekodieren**.

Verwendung: Öffnen Sie die **Simulationswerkbank**, wählen Sie **QoreChain-Nachrichten** oder **EVM-Transaktion**, fügen Sie ein und tippen Sie auf **Simulieren**.

### Gebühren und Sponsoring

Zeigt den Mindestgaspreis der Chain, was QoreX je Gas zahlt, die Kosten üblicher Aktionen (Senden, Staken, ein EVM-Fenster öffnen, IBC-Überweisung), ob die nächste Transaktion auch die einmalige Schlüsselregistrierung bezahlt, sowie die erhaltenen und erteilten Gebührenfreigaben mit einem Urteil zu jeder: Würde sie zahlen oder warum wird sie abgelehnt (abgelaufen, aufgebraucht, falscher Nachrichtentyp). QoreX zahlt seine eigenen Gebühren und benennt selbst nie einen Gebührengeber.

Verwendung: Öffnen Sie **Gebühren und Sponsoring**; es liest beim Öffnen.

### Testnet-Arbeitsbereich

Werkzeuge zum Entwickeln im Testnet, die das Mainnet nie berühren:

- **Nur-Testnet-Konten.** Ein aus Ihrer Wiederherstellungsphrase erzeugtes Konto, das QoreX nie im Mainnet signieren lässt und ausblendet, solange das Mainnet aktiv ist. Tippen Sie auf **Nur-Testnet-Konto erstellen**.
- **Faucet.** Kopieren Sie Ihre Testnet-Adresse und tippen Sie auf **Testnet-Faucet öffnen**. Das Faucet befindet sich im Dashboard, und zum Nutzen melden Sie sich dort an. Siehe [Testnet-Funktionen](/qorex/testnet-features#get-test-qor).
- **Verbindungen zurücksetzen.** **Alle Verbindungen zurücksetzen** trennt jede Website, lehnt jede noch wartende Anfrage ab und vergisst die Verträge, für die Websites Sie kürzlich signieren ließen. Zum Bestätigen zweimal tippen.

Verfügbarkeit: Der Bildschirm öffnet sich in beiden Netzwerken; die Nur-Testnet-Konten und das Faucet sind für das Testnet.

### Anfrageprotokoll

Listet auf, was Websites angefragt haben, was Sie entschieden haben und was das Netzwerk geantwortet hat. Es wird nur auf Ihrem Gerät gespeichert, und nur solange der Entwicklermodus an ist, höchstens 500 Einträge und 7 Tage. Es zeichnet nie Ihre Wiederherstellungsphrase, Schlüssel oder Passwörter auf, auch nicht, was signiert wurde (nur dessen Typ und einen Hash). Sie können es nach dem Schließen des Browsers behalten, es leeren oder mit **Debug-Datei exportieren** an einen Fehlerbericht anhängen; die Datei wird vor dem Schreiben auf Phrasen und Schlüssel geprüft.

Verwendung: Öffnen Sie das **Anfrageprotokoll**. Schalten Sie zuerst den Entwicklermodus ein, sonst wird nichts aufgezeichnet.

## Verträge und Rollups {#contracts}

### Vertragsinteraktion

Rufen Sie EVM-, CosmWasm- (QoreChain Native) und SVM-Verträge mit Ihrem eigenen Konto auf. Lesen ist kostenlos; alles, was den Zustand ändert, durchläuft dieselbe Freigabe wie eine dApp-Anfrage, die es simuliert und die Post-Quanten-Signatur hinzufügt.

Verwendung:

1. Öffnen Sie die **Vertragsinteraktion** und wählen Sie den **Vertragstyp**.
2. EVM: Geben Sie die Vertragsadresse ein und laden Sie seine **ABI (JSON)**. Jede Funktion wird zu einem typisierten Formular, gekennzeichnet als read, write oder payable. QoreX verweigert einen Wert für eine Funktion, die keine QOR empfangen kann.
3. CosmWasm: Geben Sie die Vertragsadresse ein, laden Sie optional ein Schema aus `cosmwasm-schema`, schreiben Sie die **Nachricht (JSON)** und bei Bedarf die Mittel (geschrieben wie `1000uqor`). Verwenden Sie **Abfrage** zum Lesen oder **Ausführung prüfen**, um genau zu sehen, was signiert wird.
4. SVM (nur Testnet): Geben Sie die Programm-ID ein und laden Sie eine **Anchor-IDL (JSON)**. QoreX signiert die Solana-Transaktion mit Ihrem eigenen Solana-Schlüssel und leitet sie mit Ihrem QoreChain-Konto weiter.
5. Tippen Sie auf **Simulieren**, um zu sehen, was der Aufruf laut Netzwerk tun würde, dann auf **Prüfen und signieren** (oder **Weiter zur Freigabe**) und genehmigen Sie im Freigabefenster.

Sie können Verträge je Netzwerk speichern, als Datei exportieren und wieder importieren. Ein Bereich **Vertragsinfo** zeigt bei einem CosmWasm-Vertrag Code-ID, Ersteller, Label und Admin.

### Bereitstellungsfreigabe

Genehmigen Sie eine Bereitstellung, die Ihr Kommandozeilenwerkzeug, Ihre IDE oder Ihr Agent vorbereitet hat. QoreX ermittelt den Code-Hash selbst, dekodiert die Konstruktorargumente und prüft, wer den Vertrag aktualisieren kann, bevor etwas signiert wird. Es lehnt ab, wenn der vom Werkzeug angegebene Hash nicht zu den Bytes passt. Es warnt vor Mustern aktualisierbarer Proxys, vor einem Admin oder einer Upgrade-Befugnis, die nicht Ihr Konto ist, und vor einem Vertrag ohne Admin, der nie migriert werden kann. Es verarbeitet EVM-Vertragsbereitstellungen und CosmWasm-Verträge, die aus einem bereits gespeicherten Code instanziiert werden. QoreX lädt keinen CosmWasm-Code hoch, und die Bereitstellung von SVM-Programmen wird in dieser Version nicht unterstützt. Code-Uploads in einem Netzwerk, das sie über die Governance sendet, können nicht aus einer Wallet signiert werden.

Verwendung: Öffnen Sie die **Bereitstellungsfreigabe**, fügen Sie das Deploy-Anfrage-JSON aus Ihrem Werkzeug ein (tippen Sie auf **Format zeigen**, um es zu sehen), tippen Sie auf **Prüfen**, lesen Sie die Prüfansicht und dann **Freigeben und signieren**.

### Rollup- und Appchain-Profile

Fügen Sie ein mit dem QoreChain RDK gebautes Rollup oder eine Appchain hinzu. QoreX befragt dessen Node live, bevor es das Profil speichert, und zeigt jede Prüfung: REST- und RPC-Chain-ID, Adresspräfix, EVM-Chain-ID und das Rollup auf QoreChain. Ein Profil kann auf das Mainnet oder das Testnet settlen. Solange ein Profil aktiv ist, fragt jede Prüfansicht, welches Netzwerk signiert, und das Signieren für einen Node, der seine Chain-ID nicht bestätigt, wird abgelehnt.

Verwendung: Öffnen Sie die **Rollup- und Appchain-Profile**, tippen Sie auf **Profil hinzufügen**, füllen Sie Name, Chain-ID und Endpunkte aus und dann **Prüfen und hinzufügen**. Mit **Aktivieren** oder **Nicht mehr verwenden** wechseln Sie, und **Erneut prüfen** geht jederzeit.

## Weitere virtuelle Maschinen {#other-vms}

### Solana auf QoreChain (nur Testnet)

Die SVM-Lane im QoreChain-**Testnet**: SVM-Fenster und das Weiterleiten einer signierten Solana-Transaktion. Dieses Werkzeug wird nur angezeigt, solange das Testnet aktiv ist; im Mainnet ist die SVM-Lane nicht geöffnet, und nichts hiervon kann verwendet werden. Details und Schritte stehen unter [Testnet-Funktionen](/qorex/testnet-features#solana-on-qorechain).

### Cross-VM-Aufruf

Erstellen Sie einen Aufruf von Ihrem Konto an einen Vertrag auf einer anderen Ausführungs-Lane von QoreChain selbst (EVM, CosmWasm oder SVM). Nichts verlässt QoreChain: Dies ist keine Brücke zu einer anderen Chain. Das Formular fragt nach der Ziel-Lane, dem Vertrag oder Programm, der Nutzlast und, nur bei CosmWasm, den beizufügenden QOR.

Sie wählen unter **Wann es läuft**, und QoreX sagt es klar:

- **Jetzt, innerhalb dieser Transaktion (atomar):** Entweder geschieht alles oder nichts.
- **Eingereiht für einen späteren Block (nicht atomar):** Es läuft in einem späteren Block. Schlägt es fehl oder läuft die Zeit ab, bleibt das, was diese Transaktion getan hat, bestehen.

Verwendung: Öffnen Sie den **Cross-VM-Aufruf**, füllen Sie das Formular aus, tippen Sie auf **Simulieren**, um die Schritte und die Gebühr zu sehen, dann **Signieren und senden**. QoreX signiert nur Aufrufe, die es simuliert hat. Hat das Netzwerk Cross-VM-Aufrufe abgeschaltet, sagt der Bildschirm das und bietet nichts zum Signieren an. Im Mainnet sind Cross-VM-Aufrufe heute geschlossen, rechnen Sie dort also mit dieser Meldung.

### Einen Cross-VM-Aufruf verfolgen

Fügen Sie den Hash einer Transaktion ein (QoreChain oder `0x` für EVM), und QoreX liest ihre Cross-VM-Teilschritte. Ein eingereihter Teilschritt wird als ausstehend, ausgeführt, fehlgeschlagen oder abgelaufen angezeigt. Die Teilschritte einer EVM-Transaktion liefen innerhalb der Transaktion selbst und werden aus deren Ergebnis gelesen. Abgeschlossene eingereihte Einträge werden nach einer Weile vom Netzwerk gelöscht, und der Tracker sagt das, wenn der Eintrag fehlt.

Verwendung: Öffnen Sie **Einen Cross-VM-Aufruf verfolgen**, fügen Sie den Hash ein und tippen Sie auf **Verfolgen**.

## Signieren und Agenten {#signing-and-agents}

### Berechtigungen und Sitzungen

Listet alles, was Ihr Konto anderen Adressen erlaubt hat, mit den Grenzen, die die Chain selbst durchsetzt, und lässt Sie jede widerrufen: **Berechtigungen**, **Gebührenfreigaben**, **Verknüpfte Schlüssel** und **Zugriffsfenster**. Jede zeigt, was sie darf, ihre Grenze und wann sie abläuft (oder dass sie es nie tut). **Widerrufen** sendet die widerrufende Transaktion; **Fenster schließen** schließt ein EVM-Fenster.

Mit **Neue Sitzung** können Sie einer App oder einer anderen Adresse auch eine begrenzte Sitzung geben: für eine Anzahl von Tagen nur aufgeführte Verträge aufrufen, bis zu einem festen Betrag senden, mit gewählten Validatoren staken oder abstimmen und Belohnungen abholen, optional mit Bezahlung ihrer Gebühren bis zu einer Grenze. Eine **Vorschau** sagt genau, was der Berechtigte tun darf, und führt getrennt auf, was die Chain nicht durchsetzt und wonach QoreX Sie jedes Mal fragt.

### Offline- und Multisig-Arbeitsbereich {#multisig}

Bereiten Sie eine beliebige Transaktion als Datei im Kommandozeilenformat der Chain vor, prüfen Sie jede Signatur in einer Multisig-Datei oder signieren Sie auf einem Gerät und senden Sie von einem anderen.

- **Offline signieren:** Bereiten Sie auf einem Gerät mit Internetverbindung eine Transaktion vor (beginnen Sie mit einer Vorlage wie Senden, Delegieren oder Vertrag aufrufen oder fügen Sie die Nachrichten ein), bringen Sie die Datei oder den QR-Code zu dem QoreX, das den Schlüssel hält, prüfen Sie sie, **Signieren** Sie und wählen Sie dann auf einem der beiden Geräte **An das Netzwerk senden**.
- **Signaturen prüfen:** Öffnen Sie die Transaktion und etwaige Signaturdateien. Für jedes Multisig-Mitglied zeigt QoreX, ob es einen Post-Quanten-Schlüssel registriert hat und ob Runde 1 (post-quantenfähig) und Runde 2 (klassisch) gültig, veraltet, ungültig oder fehlend sind und welche Runde noch fehlt.

Die Prüfansicht zeigt immer das Memo und jede Gebührenmünze, und QoreX signiert nur die Bytes, die Sie geprüft haben. Es lehnt eine Gebühr in einer anderen Münze als QOR ab, eine Gebühr deutlich über dem hohen Gaspreis des Netzwerks und eine Gebühr, die von einem anderen Konto bezahlt oder gewährt wird. Ändert sich die Datei nach Ihrer Prüfung, müssen Sie sie erneut öffnen und prüfen. QoreX sendet keine Transaktion ohne ihre ML-DSA-87-Signatur.

## KI-Agenten {#ai-agents}

KI-Agenten (Ihr eigener KI-Assistent oder ein von Ihnen betriebenes Werkzeug) können die von Ihnen gewählten Konten lesen und eine Transaktion **vorschlagen**. Sie können nicht signieren. Das Modell ist:

1. Sie entscheiden, welche Konten ein Agent sehen kann und für welche er vorschlagen darf. Sie können einen Agenten jederzeit pausieren oder widerrufen, und die Liste **Aktivität** zeigt, was er getan hat.
2. QoreX prüft jeden Vorschlag und simuliert ihn im Netzwerk. Ein Vorschlag, den QoreX nicht lesen kann oder der laut Netzwerk fehlschlagen würde, wird Ihnen nicht gezeigt.
3. Sie sehen den Vorschlag im normalen Freigabefenster, gekennzeichnet als von einem KI-Agenten und nicht von einer Website vorgeschlagen, und genehmigen oder lehnen ihn ab. Nichts wird signiert, bevor Sie genehmigen.

QoreX signiert niemals die Arten von Anfragen, die keine außenstehende Partei stellen darf, egal wer sie vorschlägt. Eine Begrenzung der Vorschläge je Stunde stoppt eine Flut, und es wartet immer nur ein Vorschlag.

So nutzen Sie es:

- **Mobile App:** Schalten Sie den Entwicklermodus ein, öffnen Sie **KI-Agenten**, fügen Sie dann das Vorschlags-JSON Ihres Agenten ein und tippen Sie auf **Vorschlag prüfen**, oder öffnen Sie einen `qorex://propose`-Link. QoreX kann nicht prüfen, wer einen eingefügten Vorschlag oder einen Link verfasst hat, und sagt das. Prüfen Sie ihn und genehmigen oder lehnen Sie ihn ab.
- **Browser-Erweiterung (Chrome, Edge, Brave, Firefox):** Ein Agent verbindet sich über ein Begleitprogramm auf Ihrem Computer, das das Model Context Protocol verwendet. Dieses Programm ist noch nicht veröffentlicht, daher kann die Öffentlichkeit die Erweiterungsseite noch nicht nutzen. Wenn es so weit ist, schalten Sie **Verbindungen von KI-Agenten auf diesem Computer erlauben** ein, koppeln den Agenten mit einem Einmalcode, der in 5 Minuten abläuft, und wählen seine Konten.
- **Safari:** nicht verfügbar. Safari kann QoreX nicht mit Programmen auf Ihrem Computer verbinden.

## Grenzen {#limits}

- Der Entwicklermodus ist für Menschen, die entwickeln. Wenn Sie nur senden, empfangen und staken, brauchen Sie ihn nicht.
- Ein Werkzeug, das vom Netzwerk abhängt (die Inspektoren, der Simulator, die Tracker), sagt „konnte nicht gelesen werden“, wenn das Netzwerk nicht erreichbar ist. Das ist nicht dasselbe wie, dass dort nichts ist.
- SVM-Werkzeuge und der Cross-VM-Composer hängen davon ab, was das Netzwerk erlaubt. Im Mainnet sind SVM- und Cross-VM-Aufrufe heute geschlossen.
- In der Browser-Erweiterung braucht es das Tippen auf die Versionsnummer, um den Schalter einzublenden; in der App liegt er in den Einstellungen.
