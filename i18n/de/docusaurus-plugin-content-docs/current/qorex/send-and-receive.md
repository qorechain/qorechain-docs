---
slug: /qorex/send-and-receive
title: Senden & Empfangen
sidebar_label: Senden & Empfangen
sidebar_position: 3
---

# Senden & Empfangen

Diese Seite behandelt das Senden und Empfangen von QOR, das Bezahlen eines @Handles, Zahlungsanforderungen, Kontakte, den Transaktionsverlauf, das Halten von Assets in anderen Netzwerken und die Extras auf dem Home-Bildschirm. Sie ist für alle gedacht, die die mobile QoreX-App nutzen (die Erweiterung hat dieselben Bildschirme zum Senden und Empfangen, siehe [Browser-Erweiterung](/qorex/browser-extension)). Wo sich App, Browser-Erweiterung und Safari-Erweiterung unterscheiden, sagt der Text das.

## Innovationen {#innovations}

- **Signierte Zahlungsanforderungen.** Eine Anforderung ist ein Link, signiert mit Ihrem eigenen Kontoschlüssel. Wer sie bezahlt, sieht, wie QoreX die Signatur, das genaue Netzwerk und ein eventuelles @Handle prüft, bevor die normale Prüfansicht erscheint; ein geänderter Betrag oder Empfänger fällt also auf, statt unbemerkt durchzugehen. Siehe [Zahlungsanforderungen](#payment-requests).
- **Status aus der Chain gelesen.** Eine Überweisung ist *ausstehend*, *bestätigt* oder *fehlgeschlagen*, weil das Netzwerk es sagt, und eine Zahlungsanforderung wird nur dann als *bezahlt* markiert, wenn die Chain eine passende Zahlung zeigt. Siehe [Verlauf](#history).
- **Doppelgänger-Warnung.** Eine Adresse, die einer Ihnen bekannten nur ähnelt, wird vor dem Senden markiert. Siehe [Kontakte und Favoriten](#contacts).
- **Gebührenwarnungen in klaren Worten.** QoreX sagt Ihnen, wenn die Gebühr höher ist als der gesendete Betrag, und zeigt bei Ihrer ersten Überweisung die einmalige Gebühr für die Schlüsselregistrierung und die Gesamtsumme.

Der Tab Home (Wallet) ist Ihr Ausgangspunkt. Er zeigt ein **Netzwerk-Badge** (standardmäßig MAINNET, oder TESTNET, wenn Sie den Entwickler-Schalter aktiviert haben), Ihr **Gesamtguthaben** (zum Ein-/Ausblenden antippen) und die Hauptaktionen: **Senden · Empfangen · Swap · Staken** (**Swap** wird unter iOS nicht angezeigt). Ihre Asset-Liste zeigt **QOR** (ein einheitliches Guthaben über die Native-, EVM- und SVM-Lanes hinweg, gesendet auf der hybrid-signierten Native-Lane) und **Alle Netzwerke** (eine einheitliche Ansicht über ETH, BNB, POL, ARB und die weiteren [externen Netzwerke](#external-networks-tokens), die QoreX unterstützt).

## QOR auf der hybrid-signierten Native-Lane senden

1. Tippen Sie auf **Senden**.
2. Geben Sie den Empfänger als `qor1…`-Adresse **oder** als **@Handle** ein. Ein Handle wird aufgelöst und kryptografisch verifiziert (Registry-Signatur + Besitzer-Signatur + Trust-on-First-Use-Pinning); sollte sich der Schlüssel eines Handles jemals stillschweigend ändern, zeigt QoreX eine ausdrückliche Warnung an.
3. Geben Sie den Betrag ein. Die Vorschau zeigt Empfänger, Betrag, die **Netzwerkgebühr** und den Signaturstatus (ob die Überweisung die ML-DSA-87-Ebene trägt).
4. Bestätigen Sie mit **biometrischer** Freigabe. Jede native QOR-Überweisung wird doppelt signiert: mit einem klassischen Schlüssel und mit ML-DSA-87 (FIPS 204). QoreX signiert mit dieser obligatorischen hybriden Signatur und überträgt auf der Native-Lane. Nach dem Broadcast prüft es, ob die bestätigte Transaktion die ML-DSA-87-Ebene trägt, und warnt Sie, wenn nicht.

Auf dem ersten Bildschirm können Sie im Schnellausfüll-Feld (**QoreX fragen**) eine einfache Anfrage wie „send 50 QOR to @maria“ eintippen, und das Formular wird für Sie ausgefüllt. Es ist ein einfacher Textleser, der **vollständig auf Ihrem Gerät** läuft - nichts, was Sie dort eintippen, wird irgendwohin gesendet, und es ist kein KI-Assistent (QoreX hat keinen). Sie prüfen weiterhin alles und bestätigen wie gewohnt per Biometrie; kann es nicht lesen, was Sie eingetippt haben, sagt es das, und Sie füllen das Formular von Hand aus. Ihre Favoriten-Kontakte und letzten Empfänger erscheinen als Chips zum Antippen (siehe [Kontakte und Favoriten](#contacts)).

QoreChain registriert Ihren ML-DSA-87-Schlüssel nicht von selbst. QoreX erledigt das für Sie im Rahmen Ihrer **ersten** Überweisung (eine kleine einmalige Netzwerkgebühr), und den Status sehen Sie unter [Sicherheit & Wiederherstellung](/qorex/security-and-recovery#pqc-key). In QoreX ist kein separater Schritt nötig.

**Die Prüfansicht der ersten Überweisung zeigt die Kosten im Voraus.** Neben dem Betrag und der **Netzwerkgebühr** führt sie *Einmalige Registrierung des ML-DSA-87-Schlüssels* mit der Gebühr und dann **Gebühren gesamt** auf, sodass es nach dem Bestätigen keine Überraschung gibt. Spätere Überweisungen vom selben Konto zeigen nur die Netzwerkgebühr.

**Gebühr höher als der Betrag.** Ist die Netzwerkgebühr höher als der gesendete Betrag, sagt die Prüfansicht das (*„Die Netzwerkgebühr ist höher als der gesendete Betrag.“*) als Vorsichtshinweis. Er blockiert die Überweisung nie. QoreX zeigt ihn bei nativen QOR-Überweisungen und bei der eigenen Münze eines externen Netzwerks, wenn die Gebühr in dieser Münze angegeben ist. Das Abholen von Staking-Belohnungen wird genauso geprüft, siehe [Portfolio und Staking](/qorex/portfolio-and-staking#claim).

### Senden an ein @Handle, Schritt für Schritt {#handle-send}

1. Öffnen Sie **Senden** und geben Sie im Empfängerfeld statt einer Adresse `@` gefolgt vom Handle ein (zum Beispiel `@liviu`).
2. QoreX schlägt das Handle nach und zeigt Ihnen die **aufgelöste `qor1…`-Adresse**, bevor Sie irgendetwas bestätigen. (Das Beanspruchen Ihres eigenen Handles erfordert ein angemeldetes Konto und erfolgt in der App - siehe [@Handle](/qorex/account-and-dashboard#handle).)
3. Überprüfen Sie die aufgelöste Adresse, geben Sie den Betrag ein und bestätigen Sie wie gewohnt.

QoreX akzeptiert eine Auflösung nur, wenn sie **beide** durchgeführten Prüfungen besteht: eine Registry-Attestierung, die gegen einen in der App fest hinterlegten Trust-Key verifiziert wird, und die eigene Signatur des Handle-Besitzers über den Anspruch. Scheitert eine der beiden Prüfungen, wirft QoreX einen Fehler, statt auf eine unverifizierte Adresse zurückzufallen. Beim ersten Mal, dass Sie an ein bestimmtes Handle zahlen, merkt sich QoreX die aufgelöste Adresse; sollte sich die Adresse dieses Handles jemals ändern, stoppt QoreX vor dem Signieren und zeigt Ihnen die alte und die neue Adresse nebeneinander, damit Sie entscheiden können, ob Sie fortfahren möchten. Dieses Gedächtnis gilt **pro Gerät** - zahlen Sie erstmals an dasselbe Handle von einem anderen Telefon oder einer frischen Installation aus, erscheint es auch dort als neu, was erwartet ist und kein Fehler. Die Browser-Erweiterung löst Handles auf und bezahlt sie auf dieselbe Weise (ihr Gedächtnis gilt **pro Browser**, sodass ein anderer Browser oder Computer es als neu ansieht) - siehe [Senden an ein @Handle](/qorex/browser-extension#handle-send).

### Vesting-(gesperrtes) QOR senden {#vesting}

Wenn ein Teil Ihres Guthabens noch **vestet** - zum Beispiel eine noch nicht freigegebene TGE-Zuteilung -, wird Ihr Gesamtbetrag aufgeteilt in **jetzt verfügbar** und **noch gesperrt**. Sie können nur den verfügbaren Anteil senden; QoreX weist einen Überausgabe-Versuch selbst zurück, statt das Netzwerk diesen erst nach Abzug einer Gebühr ablehnen zu lassen. Der gesperrte Anteil wird schrittweise ausgabefähig, sobald der Vesting-Zeitplan ihn freigibt. Diese Aufteilung wird überall dort angezeigt, wo Ihr Guthaben erscheint - Home, Senden und Asset-Detail.

## Empfangen {#receive}

Tippen Sie auf **Empfangen**. Es beginnt mit der Münze: eine **durchsuchbare Liste** (*Wähle die Münze, die du empfangen möchtest*, Suchfeld *Münze oder Netzwerk suchen*) mit **QOR zuerst**, dann die eigene Münze jedes unterstützten Netzwerks und die mitgelieferten Token, jeweils mit ihrem Bild und dem ihres Netzwerks. Passt nichts zu Ihrer Suche, meldet die Liste *Keine Münze gefunden.* Die Bilder werden mit QoreX ausgeliefert, sodass zum Zeichnen der Liste nichts von Dritten geladen wird.

- **QOR** zeigt Ihre `qor1...`-Adresse (und Ihr @Handle, falls Sie eines haben) als QR-Code mit dem QoreChain-Icon, dazu **Kopieren** und **Teilen**. Alles, was dorthin gesendet wird, kommt auf der Native-Lane an, wo jede Überweisung eine klassische und eine ML-DSA-87-Signatur trägt.
- **Jede andere Münze und jedes andere Token** zeigt die eigene Adresse dieses Netzwerks und die Warnung *„Sende an diese Adresse nur \{coin\} oder Token auf \{network\}. Von einem anderen Netzwerk gesendete Coins können verloren gehen.“* Die Warnung nennt die gewählte Münze. Mit **Andere Münze wählen** gelangen Sie zurück zur Liste.
- **Abgedeckte Netzwerke:** Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis und Celestia. Alle EVM-Netzwerke teilen sich eine `0x...`-Adresse. Ihre EVM- und Solana-Adressen werden aus Ihrer Wiederherstellungsphrase abgeleitet, daher verlangt QoreX eine biometrische Bestätigung (**Adresse anzeigen**), bevor es sie zeigt. Andere Netzwerke können keine ML-DSA-87-Signaturen tragen. Siehe [Externe Netzwerke](#external-networks-tokens).
- **Auch eigene Token stehen in der Liste.** Ein Token, das Sie per Vertragsadresse (oder auf Solana per Mint-Adresse) hinzugefügt haben, wird unter Empfangen mit der Adresse seines Netzwerks angeboten, genau wie ein mitgeliefertes Token. Siehe [Coins und Token](#coins-and-tokens).
- **Adressen für Cosmos Hub, Osmosis und Celestia.** Angezeigt wird die Adresse, mit der Ihre Überweisungen aus diesem Netzwerk signieren (Ihr Coin-118-Schlüssel). Frühere Builds konnten bei einem Coin-60-Konto eine andere Adresse anzeigen oder dem aktiven Konto folgen; das ist behoben, und die Überweisung prüft die Adresse vor dem Signieren erneut.

Die Erweiterung und die Safari-Erweiterung haben unter **Empfangen** dieselbe Münzliste.

## Coins und Tokens {#coins-and-tokens}

Ein Coin ohne Zeile hat keine Adresse, auf der er empfangen werden könnte. Um einen Coin oder Token im **Portfolio** zu sehen, *bevor* Sie welche halten, öffnen Sie Portfolio → **+ Coin or token** und schalten Sie ihn ein (in der Erweiterung: **Coins and tokens**). Ein auf null angepinnter Coin öffnet beim Antippen **Empfangen** auf seinem Netzwerk. Einstellungen → **Coins and networks** listet alles auf, was die Wallet heute halten kann.

**Token per Contract hinzufügen** (nur EVM-Netzwerke):

1. Portfolio → **+ Coin or token** → **Add a token by contract** (Erweiterung: **Coins and tokens** → *Add a token by contract*).
2. Wählen Sie das **Network**, fügen Sie die **Contract address (0x…)** ein und tippen Sie auf **Check contract**.
3. QoreX liest Symbol und Dezimalstellen aus dem Contract selbst und zeigt *„The contract says: \{symbol\} · \{decimals\} decimals“*. Jeder kann einen Token erstellen und ihm einen beliebigen Namen geben - QoreX bürgt nicht dafür, stellen Sie also sicher, dass es der gemeinte Contract ist.
4. Tippen Sie auf **Add \{symbol\}**. Er wird mit *Added by you* gekennzeichnet und kann wie die mitgelieferten Tokens gesendet werden. Entfernen Sie ihn jederzeit.

Nach dem Hinzufügen erscheint das Token auch unter [Empfangen](#receive).

QoreX lehnt ab: einen Token, der bereits mitgeliefert wird, einen, den Sie schon hinzugefügt haben, ein Nicht-EVM-Netzwerk, eine ungültige Adresse, einen Contract, der nicht als Token antwortet, und einen Contract, der den Namen eines Tokens verwendet, den QoreX auf diesem Netzwerk bereits mitliefert (eine wahrscheinliche Kopie).

## Zahlungsanforderungen {#payment-requests}

Fordern Sie mit einem signierten Link, den Sie teilen oder kopieren, einen QOR-Betrag von jemandem an. Das funktioniert in der App, der Erweiterung und der Safari-Erweiterung, im Mainnet und im Testnet, und erfordert **keine** QoreX-Anmeldung.

**Eine Anforderung erstellen**

1. Öffnen Sie **Zahlungsanforderungen** (App: Einstellungen; Erweiterung: eine Schaltfläche auf dem Startbildschirm).
2. Tippen Sie auf **Neue Anforderung** und geben Sie den **Betrag (QOR)** und optional eine **Notiz** ein (höchstens 140 Zeichen). Wenn Sie ein @Handle haben, können Sie *Show my @handle on the request* ankreuzen.
3. Tippen Sie auf **Link erstellen**. QoreX signiert die Anforderung mit Ihrem eigenen Kontoschlüssel und zeigt *„Deine Anforderung ist bereit. Jeder kann sie bezahlen, in QoreX oder in einer anderen Wallet.“*
4. **Link teilen** oder **Link kopieren**.

Der Link ist mit Ihrem Kontoschlüssel signiert, sodass ein geänderter Betrag oder eine geänderte Adresse erkannt wird. Der Schlüssel muss zur Empfängeradresse gehören: Niemand sonst kann einen veränderten Link in Ihrem Namen neu signieren. Die Signatur ist nur eine Integritätsprüfung des Links; die Zahlung selbst wird wie gewohnt vom Zahlenden signiert, auf der Native-Lane mit der hybriden Signatur. Das Linkformat ist `qorex://pay?v=1&...`, und es nennt das genaue Netzwerk (Mainnet oder Testnet).

Die Schaltfläche **Anfordern** auf dem Home-Bildschirm der App richtet die Anforderung an einen bestimmten QoreX-Nutzer über dessen @Handle (sie erfordert eine [Anmeldung](/qorex/account-and-dashboard#sign-in) und Ihr eigenes @Handle). Nach dem Erstellen kann auch diese Anforderung als signierter Link geteilt werden.

**Eine Anforderung bezahlen**

1. Öffnen Sie den Link auf einem Telefon mit QoreX, oder gehen Sie zu **Eine Anforderung bezahlen**, nutzen Sie **Zahlungslink einfügen** (auch in der Erweiterung) und dann **Öffnen**.
2. QoreX prüft die Signatur, das Netzwerk und ein eventuelles @Handle, *bevor* es etwas zum Bezahlen anzeigt. Dann zeigt es den Empfänger, den Betrag, die Notiz und das Memo-Tag, und es folgt die normale Prüfansicht. Sie bestätigen wie bei jeder Überweisung.
3. Mögliche Meldungen: *„Signatur geprüft: Die Anforderung ist seit dem Signieren unverändert.“* oder eine Ablehnung wie *„Dieser Link wurde nach dem Signieren verändert. Bezahle ihn nicht.“*, *„Dieser Link wurde nicht vom Inhaber der Empfängeradresse signiert. Bezahle ihn nicht.“* oder *„Diese Anforderung ist für \{network\}. Wechsle in QoreX das Netzwerk, um sie zu bezahlen.“*
4. Enthält der Link ein @Handle, prüft QoreX es gegen das Handle-Register: verifiziert, erste Zahlung dorthin, *verweist jetzt auf eine andere Adresse als zuvor* (fragen Sie vor dem Bezahlen beim Empfänger nach) oder verweist nicht auf diese Adresse (bezahlen Sie nicht, wenn Sie nicht sicher sind). Eine Handle-Warnung erfordert eine zweite Bestätigung.

QoreX bezahlt Anforderungen vorerst nur in QOR. Bei einer Testnet-Anforderung steht *„Testnet-Anforderung. Testnet-QOR hat keinen Wert.“*

**Verfolgen und wiederverwenden**

**Meine Anforderungen** listet die von Ihnen erstellten Anforderungen. Jede zeigt **Bezahlt** oder **Noch nicht bezahlt**, aus der Chain gelesen: QoreX sucht eine passende Zahlung (das Memo-Tag auf der Überweisung), und als bezahlt wird sie nur markiert, wenn die Chain sie zeigt. Antwortet das Netzwerk nicht, heißt es *Status unbekannt*, nie eine Vermutung. **Status prüfen** fragt erneut. **Nächsten Monat wiederverwenden** erstellt eine neue Anforderung mit denselben Angaben und einer neuen ID. Mit einem @Handle sehen Sie außerdem **Anforderungen an mich** und **Per @handle gesendete Anforderungen**.

## Kontakte und Favoriten {#contacts}

**Kontakte** (App: Einstellungen; Erweiterung: eine Schaltfläche auf dem Startbildschirm) sind Namen für Adressen, an die Sie zahlen. Sie werden **nur auf diesem Gerät** gespeichert. Ein Kontakt hat einen Namen, höchstens eine Adresse je Netzwerk (QoreChain, EVM, Solana, Cosmos) und optional ein @Handle; die Liste fasst bis zu 200.

- **Favoriten.** Kreuzen Sie *Favorit (auf dem Sendebildschirm angezeigt)* an, und der Kontakt erscheint als Chip zum Antippen über dem Empfängerfeld. Ein Chip füllt nur das Formular aus: Sie prüfen und bestätigen weiterhin.
- **Zahlung wiederholen.** Bei einer früheren Zahlung (App: ihre Detailansicht; Erweiterung: die Verlaufszeile) füllt **Zahlung wiederholen** das Sendeformular erneut mit demselben Empfänger, Betrag und Memo aus. Bevor etwas gesendet wird, prüfen und bestätigen Sie immer.
- **Doppelgänger-Warnung.** Ein Kontakt ist keine Sicherheitsprüfung, und QoreX sagt das auch. Wenn eine Adresse, an die Sie zahlen wollen, einer bekannten nur *ähnlich sieht* (gleiche erste und letzte Zeichen, ein Trick von Betrügern, die ähnlich aussehende Adressen in Ihren Verlauf einschleusen), warnt die Prüfansicht *„Careful: this address only LOOKS LIKE one you already know“* und zeigt die bekannte Adresse zum Vergleich Zeichen für Zeichen. Dafür ist ein zweites Tippen (Erweiterung) oder eine Risikobestätigung (App) nötig. Verglichen wird mit Ihren gespeicherten Kontakten, Ihren eigenen Konten und Adressen, an die Sie bereits gezahlt haben.
- **Ein gespeicherter Kontakt wird in der Prüfansicht genannt** (*Gespeicherter Kontakt: \{name\}*). Bei einem gespeicherten @Handle wird außerdem angezeigt, ob seine Adresse dieselbe wie bei Ihrer letzten Zahlung ist, neu oder **geändert**.

## Verlauf {#history}

Der Verlauf zeigt jede QoreChain-Transaktion eines Kontos, nicht nur Überweisungen: empfangen, gestakt, entstakt, Einsatz verschoben, Belohnungen abgeholt, Sperren, Bonus, EVM-Fenster, Belohnungsadresse und Registrierung des ML-DSA-87-Schlüssels, mit Betrag und Gebühr; fehlgeschlagene Transaktionen sind mit *Fehlgeschlagen (die Gebühr wurde trotzdem gezahlt)* markiert. Das Hybrid-Abzeichen erscheint nur bei einer Transaktion, die die Chain selbst verifiziert hat. Externe Netzwerke sind noch nicht im Verlauf.

- **Wo.** App: **Aktivität**, mit einer Kontoauswahl, und ein Link **Verlauf** bei jedem Konto unter **Deine Konten**. Erweiterung: **Verlauf** auf dem Startbildschirm, mit einer Kontoauswahl.
- **Ausstehend, bestätigt, fehlgeschlagen.** Eine gerade gesendete Überweisung zeigt **Ausstehend: wartet auf das Netzwerk**, bis die Chain sie kennt. Eine Transaktion, die die Chain nach einigen Minuten noch nicht gesehen hat, zeigt *Im Netzwerk nicht gefunden: möglicherweise fehlgeschlagen. Prüfe die Transaktion, bevor du erneut sendest.* Sie wird nie auf Vermutung als gesendet angezeigt. **Ausblenden** entfernt eine solche Zeile.
- **Je Konto.** Jedes Konto der Wallet hat seinen eigenen Verlauf.
- **CSV exportieren.** **CSV exportieren** schreibt den Verlauf des Kontos in eine Datei **auf diesem Gerät**. Sie enthält nur Ihren Verlauf: keine Phrase, keine Schlüssel. Die Spalten sind fest und auf Englisch, und jede Zelle, die eine Tabellenkalkulation als Formel lesen könnte (eine Adresse oder ein Memo, das mit `=`, `+`, `-` oder `@` beginnt), erhält ein Präfix, damit sie als Text geöffnet wird.
- **Spam wird ausgeblendet.** Eingehende Überweisungen unter 0,1 QOR, deren Memo einen Link oder eine Domain enthält, werden in der Aktivität und in den Benachrichtigungen ausgeblendet, mit einer Zeile wie *„\{n\} wahrscheinliche Spam-Überweisungen ausgeblendet“* und **Anzeigen**. Überweisungen mit dem Wert null werden ausgeblendet. Ein Memo mit Link trägt in den Transaktionsdetails eine Warnung: QoreChain und QoreX bitten Sie nie, einen mit einer Überweisung gesendeten Link zu besuchen.
- **Gekürzte Nodes.** Hält ein Node alte Blöcke nicht mehr vor, fragt QoreX eine kleinere Seite an, bis der Node antwortet, und meldet es, wenn das Netzwerk nicht erreichbar ist. In diesem Fall zeigt es keine leere Liste mehr.

Die **QOR-Seite** (tippen Sie auf Home auf QOR) listet jede Transaktion des Kontos, ein- und ausgehend, mit **Mehr anzeigen** am Ende.

## Externe Netzwerke & Tokens {#external-networks-tokens}

Das Senden ist für jedes von QoreX aufgeführte Netzwerk aktiviert: Ethereum, BNB Smart Chain, Polygon, Arbitrum One, Base, OP Mainnet, Avalanche C-Chain, Solana, Cosmos Hub, Osmosis und Celestia, samt ihren Token. BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche und Celestia funktionieren wieder, nachdem man dort eine Zeit lang nur empfangen konnte. Native Überweisungen auf Arbitrum verwenden die eigene Gas-Schätzung des Netzwerks.

Über **Alle Netzwerke** (oder Send-external) können Sie **ETH, BNB, POL, AVAX und SOL** nativ senden, außerdem ETH auf **Arbitrum, Base und OP Mainnet** sowie **ATOM, OSMO und TIA** auf Cosmos, dazu **ERC-20**-, **SPL**- und **IBC**-Tokens - USDC und USDT über die EVM-Chains und Solana hinweg, DAI auf Ethereum sowie Noble USDC über IBC - alle abgeleitet aus derselben Wiederherstellungsphrase (ETH verwendet `m/44'/60'`, SOL verwendet seinen Standardpfad, und SPL verwendet Associated Token Accounts).

:::caution Externe Chains sind ausschließlich klassisch
Andere Blockchains können keine ML-DSA-87-Signaturen tragen. Wenn Sie auf einem externen Netzwerk senden, weist QoreX ausdrücklich darauf hin (die Überweisung verwendet eine klassische Signatur, und die Signaturzeile kennzeichnet sie als klassisch). Ihr **QOR** bleibt auf der hybrid-signierten Native-Lane. Cosmos-basierte externe Sendungen unterstützen ein optionales Memo. Bei EVM-Netzwerken zeigt QoreX vor der Bestätigung außerdem die **maximale Netzwerkgebühr** an - „Network fee: at most \{fee\}. Check it before you confirm.“ - und signiert mit genau diesem Wert.
:::

## Swap

Der Tab **Swap** ist an QoreChains On-Chain-AMM angebunden, bleibt aber deaktiviert - die Schaltfläche zeigt **„Swap - coming with pool liquidity“** -, bis Liquidität und das Remote-Feature-Flag ihn aktivieren. Sobald das geschieht, leuchtet er automatisch auf; **es ist kein App-Update erforderlich**.

:::note iOS
Der Swap-Tab erscheint im App-Store-Build überhaupt nicht - Apple behandelt einen In-App-Token-Tausch als regulierten Dienst. Swap bleibt (sobald aktiviert) nur unter Android verfügbar. Die Browser-Erweiterung hat keinen Swap-Bildschirm.
:::

## Extras auf dem Home-Bildschirm {#home-extras}

- **Home-Bildschirm-Widget** (Android und iPhone) - fügen Sie **QoreX** über die Widget-Auswahl Ihres Telefons hinzu. Es zeigt Ihr QOR-Guthaben für das verwendete Konto, zeigt Punkte statt des Betrags, solange der Privatsphäre-Modus aktiv ist, aktualisiert sich etwa alle 30 Minuten selbst und öffnet beim Antippen die App. Das Widget stellt keine eigene Anfrage an QoreChain-Server: Die App übergibt ihm auf dem Gerät Ihre Adresse, Ihr Guthaben und Ihre Privatsphäre-Einstellung, und das Widget liest das Guthaben vom öffentlichen QoreChain-REST-Endpunkt (der nur Ihre öffentliche Adresse sieht). Jeder, der Ihren Home-Bildschirm sehen kann, kann das Widget sehen. Schalten Sie daher den Privatsphäre-Modus ein (Guthaben antippen), falls das eine Rolle spielt.
- **Push-Benachrichtigungen** (mobil, Mainnet) - die Glocke unter Home → **Notifications** hat einen Schalter **Push notifications**: *„Get a notification when QOR arrives, even with the app closed. Our server watches only your public addresses; Apple and Google see no amount or address.“* Der Benachrichtigungstext lautet nur „QOR received“. Push ist **ausgeschaltet, bis Sie es einschalten**. Ist es eingeschaltet, speichert der Server Ihr Geräte-Token und die öffentlichen `qor1…`-Adressen der verwendeten Wallet (bis zu 10); schalten Sie den Schalter aus, wird Ihr Gerät vom Server entfernt, und ein Gerät, von dem der Server 90 Tage lang nichts gehört hat, wird vergessen. Siehe [Was QoreX über das Netzwerk sendet](/qorex/overview#data-and-privacy). Sind Benachrichtigungen für QoreX in den Einstellungen Ihres Telefons ausgeschaltet, schalten Sie sie zuerst dort ein. Die Zustellung wurde unter Android Ende-zu-Ende getestet; unter dem iPhone behandeln Sie sie als Best-Effort und prüfen Sie weiterhin die Liste **Notifications** in der App.
- **Suche und Tour** - siehe [Orientierung](/qorex/getting-started#find-your-way).

## Nächste Schritte

- [Portfolio & Staking](/qorex/portfolio-and-staking) - sehen Sie Ihre Zuteilung und verdienen Sie Rewards.
- [Sicherheit & Wiederherstellung](/qorex/security-and-recovery) - schützen und stellen Sie Ihre Wallet wieder her.

## Grenzen und bekannte Probleme {#limits}

- Überweisungen in externen Netzwerken (EVM, Solana, Cosmos) sind ausschließlich klassisch. SVM- und EVM-Überweisungen werden nicht von der Hybrid-Signatur abgedeckt.
- Swap ist nicht verfügbar: Er ist abgeschaltet, bis Pool-Liquidität vorhanden ist, und wird unter iOS nicht angezeigt.
- Das Beanspruchen eines @Handles erfordert ein angemeldetes Konto und erfolgt in der mobilen App. Konten im Ethereum-Stil (Coin 60) haben kein Handle. Ist der Handle-Dienst nicht erreichbar, können Sie weiterhin per `qor1…`-Adresse bezahlen.
- Zahlungsanforderungen werden nur in QOR bezahlt. Für das Anfordern per @Handle (um an ein Handle gesendete Anforderungen zu sehen) ist ein beanspruchtes @Handle nötig.
- Der Verlauf deckt vorerst nur QoreChain ab; weitere Netzwerke folgen.
- Push-Benachrichtigungen gibt es nur im Mainnet, und unter iPhone nur als Best Effort.
- Vesting-QOR kann keine Gebühren bezahlen; nur der verfügbare Anteil kann gesendet werden.
