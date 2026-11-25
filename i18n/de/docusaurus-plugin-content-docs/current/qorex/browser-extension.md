---
slug: /qorex/browser-extension
title: QoreX Browser-Erweiterung
sidebar_label: Browser-Erweiterung
sidebar_position: 2
---

# QoreX Browser-Erweiterung

Die **Browser-Erweiterung** von QoreX ist die Desktop-QoreChain-Wallet. Sie ist eine **eigenständige Wallet** (eine Wallet erstellen oder importieren, QOR halten, senden und staken und sich mit dApps verbinden), und sie ist der Baustein, der jeder Website erlaubt, QoreX zu erkennen und jede Anfrage in eine explizite, entschlüsselte Genehmigung zu verwandeln. Sie richtet sich an alle, die QoreChain in einem Desktop-Browser nutzen, und an Entwickler, die möchten, dass ihre Web-App mit einer QoreChain-Wallet funktioniert.

Sie ist **live und öffentlich** in drei Stores verfügbar (Chrome, Firefox und Safari), die alle die Erweiterung 0.4.4 ausliefern. Siehe [welche Version wo verfügbar ist](#versions).

## Innovationen {#innovations}

- **`signAndBroadcast`.** Eine dApp sendet Nachrichten; die Wallet zeigt jede entschlüsselte Nachricht und die Gebühr an, fügt dann die ML-DSA-87-Schicht hinzu, die nur die Wallet erzeugen kann, und überträgt. Eine Seite hält niemals den ML-DSA-87-Schlüssel.
- **`signDirect` prüft die Schicht gegen den registrierten Schlüssel.** Hängt eine dApp selbst eine ML-DSA-87-Schicht an, prüft QoreX sie gegen den für das Konto On-Chain registrierten Schlüssel, bevor ein Genehmigungsfenster geöffnet wird. Trägt die Transaktion keine Schicht, fügt QoreX sie hinzu. `signAndBroadcast` bleibt der einfachste Weg (siehe [Eine QoreChain-Transaktion senden](#sign-and-broadcast)).
- **Eine kleine Berechtigungsfläche.** Die Erweiterung deklariert `storage` sowie (in Chrome und Firefox) `nativeMessaging` für das optionale Entwicklermodus-Werkzeug KI-Agenten. Es gibt keine Host-Berechtigungen und keinen Analytics-, Absturzbericht- oder Tracking-Code. Siehe [Welche Berechtigungen QoreX anfragt](#permissions).
- **Versiegelter Tresor.** Der Tresor wird mit AES-256-GCM unter einem aus dem Passwort abgeleiteten Schlüssel (Argon2id) verschlüsselt. Wo der Browser WebAuthn PRF bereitstellt (Chrome und Edge), können Sie stattdessen mit einem Passkey entsperren; das Passwort bleibt stets ein Fallback.
- **Erkennung ohne Übernahme.** QoreX kündigt sich mit EIP-6963 (`rdns` `network.qore.qorex`) und dem Solana Wallet Standard an. Es überschreibt niemals `window.ethereum` oder `window.keplr`.
- **Genehmigungen pro Ursprung, vom Browser identifiziert.** Die Website ist der Ursprung, den der Browser selbst bestätigt, nie das, was die Anfrage behauptet. Eine Anfrage, die ein Feld wiederholt, damit es auf zwei Arten gelesen werden kann, wird abgelehnt.
- **Eine gesperrte Wallet fragt nach deinem Passwort, nicht nach einem neuen Versuch.** Eine Signaturanfrage einer Website, während QoreX gesperrt ist, öffnet den Passwortbildschirm und nennt die Website; nach dem Entsperren zeigt die Anfrage ihre eigene Genehmigung. Ohne Passwort wird nichts signiert.
- **Eine Prüfansicht vor jeder Überweisung.** Das Sendeformular führt zu einer Prüfansicht mit dem vollständigen Empfänger, den Gebühren und Warnungen, und erst dann zum Signieren.
- **Verlauf mit CSV-Export**, je Konto, wobei jede Transaktion so als ausstehend, bestätigt oder fehlgeschlagen angezeigt wird, wie die Chain es meldet.
- **Zahlungsanforderungen, Kontakte, Schutz meines Geldes und Hilfe** im Popup. Siehe [Zahlungsanforderungen](#pay-requests), [Kontakte](#contacts) und [Schutz meines Geldes](#protection).
- **Entwicklermodus mit 17 Werkzeugen.** Eine Schaltfläche **Entwicklerwerkzeuge** öffnet sie alle auf einer eigenen Seite. Siehe [Entwicklermodus](/qorex/developer-mode).

## So verwenden Sie sie {#how-to-use}

1. Installieren Sie die Erweiterung (siehe [So greifen Sie zu](#how-to-access)) und öffnen Sie das Popup.
2. Wählen Sie **Neue Wallet erstellen** (ein Passwort, dann 24 Wörter, die einmal angezeigt werden) oder **Wiederherstellungsphrase importieren**. Siehe [Eine Wallet erstellen oder wiederherstellen](#wallet). Wählen Sie dann **Was möchtest du zuerst tun?** oder überspringen Sie die Frage.
3. Verwenden Sie im Popup **Senden**, **Empfangen**, **QOR staken**, **Verlauf** und **Coins und Token**. Siehe [QOR senden](#send), [Verlauf](#history), [Aus der Erweiterung staken](#stake) und [Auf externen Netzwerken senden](#send-external).
4. Öffnen Sie eine dApp. Die erste Verbindung zeigt eine Genehmigung mit dem Ursprung der Website; die Genehmigung gibt nur Ihre öffentliche Adresse preis. Widerrufen Sie jede Website unter [Verbundene Websites](#connected-sites).
5. Als Entwickler erkennen Sie QoreX mit EIP-6963 und senden eine Transaktion mit `signAndBroadcast`. Siehe [Eine dApp mit QoreX verbinden](#connect) und [Eine QoreChain-Transaktion aus einer dApp senden](#sign-and-broadcast).

## So greifen Sie zu {#how-to-access}

Sie benötigen einen Desktop-Browser und sonst nichts: kein Konto, keine Registrierung und keine mobile App. Netzwerkgebühren fallen beim Senden oder Staken an (die Untergrenze des Netzwerks beträgt 0,1 uqor pro Gas). Die Erweiterung folgt dem Netzwerk, auf das sie eingestellt ist; das Mainnet `qorechain-vladi` ist die Voreinstellung.

### Installation {#install}

| Browser | Installation |
|---|---|
| **Chrome und Chromium-Browser** (Brave, Edge, Arc, Opera) | https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg |
| **Firefox** (Firefox 140 oder neuer) | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 12 oder neuer)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

Installieren Sie stets über einen dieser Einträge.

### Welche Version wo verfügbar ist {#versions}

Aktuelle Version in jedem Store:

| Store | Aktuelle Version |
|---|---|
| Chrome Web Store | 0.4.4 |
| Firefox Add-ons | 0.4.4 |
| Safari (Mac App Store, macOS-App **QoreX Wallet**) | 1.8.2, die die Erweiterung 0.4.4 enthält (der Mac App Store verwendet seine eigene `1.x`-Nummerierung) |

Store-Reviews landen zu unterschiedlichen Zeitpunkten, daher kann ein Store einen älteren Build ausliefern als ein anderer; der Store-Eintrag zeigt stets seine aktuelle Version. Siehe auch [Welche Version wo verfügbar ist](/qorex/overview#versions).

Die Erweiterung 0.4.x ergänzt die [automatische Sperre](#unlock), eine [Prüfansicht vor jeder Überweisung](#send), [Verlauf mit CSV-Export](#history), [Zahlungsanforderungen](#pay-requests), [Kontakte](#contacts), [Schutz meines Geldes](#protection), [Reparatur, Rotation und Multisig für den Post-Quanten-Schlüssel](#pqc-care), getrennte [Staking-Bildschirme](#stake), einen [Empfangen-Bildschirm, der mit der Münze beginnt](#receive), [EVM-Signierung für dApps](#standards), [sicherere EVM-Zugriffsfenster](#evm-window) und [Entwicklerwerkzeuge](#developer-tools). Die vollständige Liste nach Version steht unter [Was die Builds 1.2.5 / 0.4.4 hinzufügen](/qorex/overview#whats-new-125) und in den darauf folgenden Listen.

Seit 0.2.6 hat die Erweiterung außerdem hinzugewonnen: [mehrere Wallets mit einem Passwort](#wallets), ein [Ethereum-artiges Konto, das Sie von Hand hinzufügen](#coin60), [Claim & restake](#stake), eine Liste **Unstaking läuft**, das [Hinzufügen eines Tokens per Vertrag](#custom-tokens), [Empfangen auf jedem Netzwerk](#receive), [Verbundene Websites mit Widerrufen](#connected-sites), das [EVM-Zugriffsfenster](#evm-window), [`signAndBroadcast` für dApps](#sign-and-broadcast) sowie Genehmigungsbildschirme, die jede Nachricht, Gebühr und Ablaufzeit anzeigen.

**Die Berechtigungsoberfläche hat sich seit 0.1.3 nicht geändert.** Siehe [Welche Berechtigungen QoreX anfragt](#permissions).

:::note
Unter Safari öffnen sich Genehmigungen in einem Browser-Tab statt in einem Popup-Fenster. Die Erweiterung wird mit Apples Safari-Web-Extension-Wrapper aus derselben Codebasis verpackt. Das Entwicklermodus-Werkzeug **KI-Agenten** ist in Safari nicht verfügbar.
:::

## Eine Wallet erstellen oder wiederherstellen {#wallet}

Öffnen Sie das Popup und wählen Sie:

- **Neue Wallet erstellen** - wählen Sie ein Passwort (mindestens 8 Zeichen); QoreX erzeugt auf Ihrem Gerät eine frische 24-Wort-Wiederherstellungsphrase (256-Bit-Entropie), leitet Ihre QoreChain-Identität ab und versiegelt sie unter diesem Passwort (und optional einem Passkey - siehe [Sicherheit](#security)) im Tresor. Die 24 Wörter werden **einmal** angezeigt - schreiben Sie sie auf, haken Sie *Ich habe meine Wiederherstellungsphrase an einem sicheren Ort gespeichert* an und fahren Sie dann fort. Sie können sie später im Popup mit **Wiederherstellungsphrase anzeigen** erneut einblenden (Passwort erforderlich).
- **Backup prüfen** - direkt nachdem Sie bestätigt haben, dass Sie die Phrase gespeichert haben, bittet QoreX Sie, drei ihrer Wörter an zufälligen Positionen so einzutippen, wie Sie sie aufgeschrieben haben. Passt eines nicht, sehen Sie auf Ihr Papier und versuchen es erneut. Sie können **Später prüfen** wählen; später fragt **Mein Backup prüfen** nach Ihrem Passwort und zeigt die Phrase nicht an, denn es geht darum, Ihre geschriebene Kopie zu prüfen.
- **Wiederherstellungsphrase importieren** - Wiederherstellung aus einer vorhandenen Phrase. Eine Phrase mit weniger als 24 Wörtern stellt Ihr Guthaben normal wieder her, aber QoreX warnt, dass Ihr ML-DSA-87-Schlüssel dann nur die Stärke der Phrase erhält; für volle Stärke erstellen Sie eine neue 24-Wort-Wallet und verschieben Ihr Guthaben dorthin.

:::danger Schreiben Sie die Phrase auf, bevor Sie fortfahren
Der Tresor der Erweiterung existiert nur in diesem Browser. **Das Entfernen der Erweiterung, das Löschen ihrer Daten oder das Zurücksetzen des Browsers löscht Ihre Schlüssel**, und niemand - auch nicht die QoreChain Association - kann sie wiederherstellen. Ohne Ihre notierten 24 Wörter ist Ihr Guthaben für immer verloren. Siehe [Jetzt sichern](/qorex/security-and-recovery#back-up-now).
:::

Nach dem Erstellen oder Importieren fragt QoreX einmal **Was möchtest du zuerst tun?** In der Erweiterung führt **Ich möchte Geld empfangen** Sie durch die Münze, ihre Adresse und einen Zahlungslink; **Ich möchte Geld senden** durch das Aufladen der Wallet, den Hinweis zum @Handle (Handles werden in der App beansprucht) und Ihre erste Zahlung mit erklärter Gebühr; **Ich möchte meine Krypto sicher aufbewahren** zeigt Ihre Einzahlungsadresse und die Backup-Prüfung. Tippen Sie auf **Vorerst überspringen**, um die Frage zu übergehen; **Was möchtest du tun?** auf der Popup-Startseite öffnet sie erneut.

Die Erweiterung verwaltet ihre eigenen Schlüssel; sie benötigt nicht die mobile App. Schlüssel verlassen niemals das Gerät.

## Entsperren und automatische Sperre {#unlock}

- **Entsperren** - Passwort eingeben und die **Eingabetaste** drücken oder auf **Entsperren** tippen. Die Schaltfläche zeigt, dass sie arbeitet (die Ableitung des Tresorschlüssels ist bewusst langsam). **Falsches Passwort.** erscheint nur bei falschem Passwort; jeder andere Fehler wird benannt. Wo die [Passkey-Entsperrung](#security) aktiviert ist, können Sie **Mit Passkey entsperren** verwenden.
- **Automatische Sperre** - auf der Popup-Startseite legt **Automatisch sperren nach** fest, wie lange QoreX ohne Nutzung offen bleibt: 1, 5, 15, 30, 60 oder 240 Minuten (als Minuten oder Stunden angezeigt). Der Standard ist 15 Minuten.
- **Sperren** - die Schaltfläche **Sperren** auf der Popup-Startseite sperrt sofort; der nächste Bildschirm fragt nach Ihrem Passwort.
- **Eine Website fragt, während Sie gesperrt sind** - eine Signaturanfrage einer Website (nativ, EVM oder Solana) öffnet QoreX auf dem Passwortbildschirm und nennt die Website. Nach dem Entsperren schließt sich dieses Fenster, und die Anfrage zeigt ihre eigene Genehmigung. Schließen Sie das Fenster stattdessen, wird die Anfrage abgelehnt und nichts signiert.

## Mehrere Wallets und Konten {#wallets}

- **Wallets** (ab 0.3.3) - der Popup-Bildschirm **Wallets** („Wallets in diesem Browser") listet jede Wallet in diesem Browser auf. Jede hat ihre eigene Wiederherstellungsphrase; **ein Passwort** entsperrt alle, und das Umschalten ändert, welche Wallet QoreX anzeigt und mit welcher es signiert (on-chain bewegt sich nichts). Eine Wallet **fügen Sie hinzu**, indem Sie eine neue erstellen (ihre Phrase wird einmal angezeigt) oder eine wiederherstellen; Ihr Passwort wird einmal abgefragt, um den Tresor neu zu versiegeln. Das Hinzufügen oder Entfernen einer Wallet schaltet die **Passkey-Entsperrung** aus - schalten Sie sie auf dem Startbildschirm wieder ein. Zum Entfernen tippen Sie auf *Aus diesem Browser entfernen* und geben Ihr Passwort ein; die letzte Wallet kann auf diesem Bildschirm nicht entfernt werden. Das Entfernen löscht diesen Schlüssel aus dem Browser - nur seine Wiederherstellungsphrase bringt ihn zurück.
- **Konten** (ab 0.2.2) - **Ihre Konten** erstellt und wechselt zwischen mehreren Konten aus derselben Phrase (bis zu 20 pro Wallet; sie sind nummeriert und können nicht umbenannt werden). Die Wiederherstellung der notierten Phrase bringt **Konto 1** zurück; die übrigen fügen Sie mit **Konto hinzufügen** erneut hinzu. Der Wechsel nimmt alles mit: Senden, Staking, Empfangen und Ihr @Handle folgen jeweils dem gerade aktiven Konto.

### Ethereum-artiges Konto {#coin60}

Ab 0.3.2 fügt **Ethereum-Konto hinzufügen (Coin 60)** (auf dem Bildschirm **Deine Konten**) das Konto für eine Phrase hinzu, die zuerst in MetaMask oder im Dashboard verwendet wurde; siehe [Eine Phrase aus MetaMask oder dem Dashboard wiederherstellen](/qorex/getting-started#restore-dashboard). Seine 0x-Adresse ist diejenige, die MetaMask für dieselben Wörter anzeigt. Handles werden dafür nicht angeboten. Ab Erweiterung 0.3.9 können Sie von diesem Konto aus in der Erweiterung staken.

Portfolio, Q-Day Scanner, soziale Wiederherstellung, Legacy-Protokoll, Konto-Anmeldung und Geräteverknüpfung bleiben nur in der mobilen App verfügbar - siehe [QoreX Wallet](/qorex/overview#platform-availability).

## Ihr Konto, Guthaben & @Handle {#account}

Der Leerlaufbildschirm des Popups zeigt Ihre `qor1…`-Adresse (zum Kopieren antippen) sowie Ihr Live-QOR-Guthaben, sodass Sie keinen Block-Explorer öffnen müssen, um beides zu prüfen.

### Vesting-Guthaben (gesperrt) {#vesting}

Wenn Ihr Konto Vesting-QOR hält (zum Beispiel eine noch nicht freigegebene TGE-Zuteilung), teilt sich das Guthaben auf in **jetzt verfügbar** und **noch gesperrt**, und eine Sendung, die den verfügbaren Betrag übersteigt, wird abgelehnt, bevor sie das Netzwerk erreicht, statt On-Chain nach Abzug einer Gebühr fehlzuschlagen. QoreX zeigt hier absichtlich **kein** „nächstes Freischaltdatum": Ein Vesting-Zeitplan kann per Governance geändert werden, sodass ein Datum auf der Guthabenkarte wie ein Versprechen wirken würde, das QoreX nicht garantieren kann. Die Aufteilung in verfügbar vs. gesperrt bleibt das, was korrekt bleibt.

### Ein @Handle beanspruchen

Das Beanspruchen eines eindeutigen **@Handles** (zum Beispiel `@liviu`) erfordert ein **angemeldetes Konto** und geschieht **in der mobilen App**; die Erweiterung verweist Sie dorthin und beansprucht Handles nicht selbst. Einmal beansprucht, wird das Handle an diese Adresse gebunden, sodass die Erweiterung es auflöst, wenn Sie es bezahlen, und andere Sie per Namen bezahlen können. Siehe [@Handle](/qorex/account-and-dashboard#handle) dazu, wie Handles an Adressen gebunden werden (nicht an eine Wallet als Ganzes).

## QOR senden {#send}

1. Öffnen Sie das Popup und tippen Sie auf **Senden**.
2. Geben Sie den Empfänger (`qor1…`-Adresse oder @Handle), den Betrag und optional ein Memo ein. [Favoriten](#contacts) erscheinen als Chips zum Antippen auf dem Formular.
3. **Prüfen Sie die Überweisung.** Die Prüfansicht zeigt den Empfänger vollständig (und den Kontaktnamen, wenn es ein gespeicherter Kontakt ist), den Betrag und das Memo. Ist dies die erste Transaktion des Kontos, zeigt sie außerdem die einmalige Gebühr für die Registrierung des ML-DSA-87-Schlüssels und die Gesamtsumme.
4. Lesen Sie jede Warnung. QoreX sagt Ihnen, wenn es die erste Zahlung an diese Adresse aus dieser Wallet ist, wenn die Adresse einer früher bezahlten oder gespeicherten nur **ähnlich sieht** (vergleichen Sie jedes Zeichen; nötig ist ein zweites Tippen, **Noch einmal tippen, um trotzdem an diese Adresse zu senden**) und wenn die Netzwerkgebühr höher ist als der gesendete Betrag.
5. Tippen Sie auf **Bestätigen und senden**. QoreX signiert mit der hybriden Signatur und sendet.

Verfügbar im Mainnet und Testnet. Eine Transaktion über dem Gaslimit je Transaktion des Netzwerks wird abgelehnt, bevor etwas signiert wird.

## An ein @Handle senden {#handle-send}

Seit 0.1.9 können Sie ein registriertes @Handle direkt bezahlen, statt eine Adresse nachzuschlagen (Abfragen wurden in den Versionen bis 0.3.6 durch einen Fehler unterbrochen und funktionieren ab 0.3.7 wieder):

1. Öffnen Sie das Popup und tippen Sie auf **Senden**.
2. Geben Sie im Empfängerfeld ein `@` gefolgt vom Handle ein (zum Beispiel `@liviu`) statt einer `qor1…`-Adresse.
3. QoreX löst das Handle auf und zeigt Ihnen die **aufgelöste Adresse**, bevor Sie irgendetwas signieren - prüfen Sie diese immer gegen Ihre Erwartung.
4. Betrag eingeben, die [Prüfansicht](#send) prüfen und bestätigen.

Die Auflösung wird auf zwei Arten verifiziert, bevor QoreX sie verwendet: eine Registry-Attestierung, die gegen einen fest in die Erweiterung eingebauten Vertrauensschlüssel geprüft wird, sowie die eigene Signatur des Handle-Inhabers über die Beanspruchung. Eine Antwort, die eine der beiden Prüfungen nicht besteht, wird rundweg abgelehnt - QoreX greift nicht auf die Anzeige einer unverifizierten Adresse zurück. Beim ersten Mal, dass Sie ein bestimmtes Handle bezahlen, merkt sich QoreX (pinnt) die aufgelöste Adresse; wenn dieses Handle später auf eine **andere** Adresse aufgelöst wird, stoppt QoreX und zeigt Ihnen sowohl die alte als auch die neue Adresse vollständig an, damit Sie entscheiden können, ob Sie fortfahren möchten. Dieses Gedächtnis lebt **pro Browser** - wenn Sie dasselbe Handle zum ersten Mal aus einem anderen Browser oder Computer bezahlen, wird es dort ebenfalls als neu angezeigt. Das ist erwartet, kein Fehler.

## Empfangen {#receive}

Tippen Sie im Popup auf **Empfangen**. Es **beginnt mit der Münze**:

1. **Wähle die Münze, die du empfangen möchtest** - eine durchsuchbare Liste (**Münze oder Netzwerk suchen**) mit QOR zuerst, dann die eigene Münze jedes Netzwerks und die mitgelieferten Token, jeweils mit ihrem Bild und dem Bild ihres Netzwerks. [Per Vertrag hinzugefügte](#custom-tokens) Token sind ebenfalls aufgeführt. Die Bilder werden in der Wallet mitgeliefert, sodass nichts von Dritten geladen wird, um sie anzuzeigen.
2. QoreX zeigt die Adresse für das Netzwerk dieser Münze als QR-Code mit Kopieren-Schaltfläche und eine Warnung, die die Münze nennt: Senden Sie nur diese Münze, in diesem Netzwerk, an diese Adresse. Funktioniert eine Adresse auf mehreren Netzwerken (den EVM-Netzwerken), sagt es, auf welchen.
3. **Andere Münze wählen** bringt Sie zurück zur Liste.

Unterstützt werden die Netzwerke QoreChain, Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis und Celestia. Eine Adresse für ein anderes Netzwerk wird aus Ihrer Wiederherstellungsphrase abgeleitet und kann daher zum Anzeigen eine Bestätigung erfordern. Für Cosmos Hub, Osmosis und Celestia zeigt QoreX die Adresse, mit der Ihre Überweisungen auf diesen Netzwerken signieren.

## Verlauf {#history}

Tippen Sie auf der Popup-Startseite auf **Verlauf**, um zu sehen, was auf dem Konto passiert ist:

- **Jede Art von QoreChain-Transaktion**, nicht nur Überweisungen: gesendet, empfangen, gestakt, entstakt, Einsatz verschoben, Belohnungen abgeholt, Stake-Sperren, EVM-Fenster- und Schlüsseländerungen, mit Betrag und Gebühr. Eine EVM-Transaktion zeigt außerdem, wie viel sie aus dem [EVM-Zugriffsfenster](#evm-window) entnommen hat.
- **Status, aus der Chain gelesen.** Eine von diesem Gerät gesendete Überweisung, die der Verlauf der Chain noch nicht zeigt, wird als **Ausstehend: wartet auf das Netzwerk** aufgeführt. Findet das Netzwerk sie nicht, sagt QoreX, dass sie fehlgeschlagen sein kann; prüfen Sie sie also, bevor Sie erneut senden (Sie können die Zeile mit **Ausblenden** entfernen). Eine fehlgeschlagene Transaktion ist markiert, wobei die Gebühr trotzdem bezahlt wurde.
- **Je Konto** - bei mehreren Konten wählen Sie oben das Konto.
- **Zahlung wiederholen** - füllt das Sendeformular aus einer früheren Zahlung erneut aus. Sie prüfen und bestätigen weiterhin.
- **CSV exportieren** - die Datei wird auf Ihrem Gerät erstellt, enthält nur Ihren Verlauf (keine Phrase, keine Schlüssel) und ist so aufbereitet, dass sie sich gefahrlos in einer Tabellenkalkulation öffnen lässt.

Ist das Netzwerk nicht erreichbar, sagt QoreX, dass es den Verlauf nicht laden konnte; es zeigt das nie als „keine Transaktionen“. Der Verlauf deckt vorerst nur QoreChain ab. Er ist im Mainnet und Testnet verfügbar.

## Zahlungsanforderungen {#pay-requests}

Fordern Sie von jemandem einen QOR-Betrag mit einem Link an, der sich nicht unbemerkt ändern lässt.

**Eine Zahlung anfordern:**

1. Öffnen Sie **Zahlungsanforderungen** auf der Popup-Startseite und erstellen Sie eine **Neue Anforderung**: den Betrag in QOR, optional eine Notiz (bis zu 140 Zeichen) und, falls Sie eines haben, ob Ihr @Handle angezeigt werden soll.
2. Tippen Sie auf **Link erstellen**. QoreX signiert die Anforderung mit Ihrem Kontoschlüssel. Kopieren Sie den Link mit **Link kopieren** und senden Sie ihn an die Person, die zahlen soll.
3. **Meine Anforderungen** listet sie. **Status prüfen** liest die Chain und zeigt **Bezahlt** oder **Noch nicht bezahlt** (oder dass das Netzwerk nicht geantwortet hat). **Nächsten Monat wiederverwenden** erstellt aus einer alten Anforderung eine neue.

**Eine Anforderung bezahlen:**

1. Öffnen Sie **Eine Anforderung bezahlen**, fügen Sie den Link ein und tippen Sie auf **Öffnen**.
2. QoreX prüft die Signatur, dass der Signierende die Empfängeradresse besitzt, das genaue Netzwerk und ein eventuelles @Handle der Anforderung. Ein veränderter Link, ein falscher Signierender, ein unbekanntes Netzwerk oder eine andere Münze als QOR wird abgelehnt. Gilt die Anforderung für das andere Netzwerk, wechseln Sie selbst; QoreX tut es nicht.
3. Tippen Sie auf **Pay**. Sie erhalten die normale [Prüfansicht](#send), bevor etwas gesendet wird. Die Zahlung trägt das Tag der Anforderung im Memo; so findet das QoreX des Anfordernden sie in der Chain.

Eine signierte Anforderung braucht weder Konto noch Anmeldung. Eine Testnet-Anforderung sagt das: Testnet-QOR hat keinen Wert. Die Linkformate für Entwickler finden Sie unter [dApp-Integration](/qorex/dapp-integration).

## Kontakte und Favoriten {#contacts}

**Kontakte** auf der Popup-Startseite speichert Namen für die Adressen, an die Sie zahlen, **nur auf diesem Gerät**.

- **Kontakt hinzufügen** - ein Name und mindestens eine Adresse: QoreChain (`qor1…`), EVM (`0x…`), Solana oder Cosmos, sowie optional ein @Handle. Markieren Sie ihn als **Favorit**, um ihn als Chip zum Antippen auf dem Sendeformular zu sehen. **An &#123;name&#125; zahlen** öffnet das ausgefüllte Formular. Das Löschen braucht zweimaliges Tippen. Die Liste fasst bis zu 200 Kontakte.
- **@Handle-Kontakte** zeigen, ob das Handle auf dieselbe Adresse verweist wie bei Ihrer letzten Zahlung, und warnen Sie, wenn sich seine Adresse **geändert** hat.
- **Doppelgänger** - eine Adresse, die einer bekannten nur ähnlich sieht, wird markiert, wobei beide angezeigt werden, damit Sie jedes Zeichen vergleichen können.

Ein Kontakt ist keine Sicherheitsprüfung: Jede Zahlung zeigt zur Prüfung weiterhin die vollständige Adresse.

## Schutz meines Geldes {#protection}

**Schutz meines Geldes** auf der Popup-Startseite ist ein Bildschirm, auf dem jede Zeile beim Öffnen geprüft wird, auf Ihrem Gerät und im Netzwerk. Eine Prüfung, die nicht gelesen werden kann, sagt das; sie gilt nie als „in Ordnung“ oder „keine“.

- **Sicherung überprüft** und **Wiederherstellung getestet** - das Datum oder **Noch nicht**. **Meine Wiederherstellungsphrase testen** fragt nach drei Wörtern Ihrer Phrase. Sie werden auf Ihrem Gerät verglichen; nichts, was Sie eingeben, wird gespeichert oder gesendet.
- **Apps mit Berechtigungen** - die Websites, die Ihre Adresse sehen und Sie um Signaturen bitten können, mit **Widerrufen**.
- **Im Netzwerk erteilte Berechtigungen** - Grants, die einem anderen Konto erlauben, für Sie zu senden (authz) oder Ihr QOR für Netzwerkgebühren auszugeben (Gebührenfreigaben), unbegrenzte zuerst, mit **Widerrufen**. Beim Widerrufen sehen Sie, was Sie signieren werden, und die Gebühr, dann bestätigen Sie.
- **Token-Freigaben auf dem EVM von QoreChain** - tippen Sie auf **Token-Freigaben prüfen** (zum Lesen ist einmal Ihre Phrase nötig). QoreX sagt, wie weit zurück es geprüft hat; öffnen Sie den Bildschirm erneut, um weiterzuprüfen. **Widerrufen** sendet `approve(spender, 0)`, nachdem ein auf den Token-Vertrag beschränktes EVM-Fenster für eine Transaktion geöffnet wurde. Nur ein Konto im Ethereum-Stil (Coin 60) kann hier widerrufen.
- **Post-Quanten-Schutz je Kanal** - in klaren Worten: Native QoreChain-Transaktionen tragen zwei Signaturen (ML-DSA-87 und klassisch); EVM-Transaktionen werden klassisch signiert und nur innerhalb eines Fensters zugelassen, das Sie mit Ihrer Post-Quanten-Signatur geöffnet haben; andere Netzwerke akzeptieren nur klassische Signaturen.

Vertrauenspersonen und soziale Wiederherstellung gibt es in der mobilen App. Siehe [Sicherheit & Wiederherstellung](/qorex/security-and-recovery).

## Hilfe und Netzwerkstatus {#help-and-status}

- **Hilfe** auf der Popup-Startseite listet die einzigen offiziellen Kanäle: die [Telegram-Community](https://t.me/QorechainCommunity), [Discord](https://discord.gg/qorechain), die [Hilfeseite](https://qorechain.io/help/qorex), E-Mail an team@qorechain.io und **Sicherheitslücke melden**. Das QoreChain-Team fragt nie nach Ihrer Wiederherstellungsphrase, Ihrem Passwort oder Ihren Schlüsseln. **Zusammenfassung zeigen** liefert eine optionale Diagnoseübersicht (App-Version, Netzwerk und Fehlercodes, ohne Phrase, Schlüssel, Adressen oder Guthaben), die Sie nur kopieren sollten, wenn der Support darum bittet.
- **Netzwerkstatus-Banner** - QoreX liest den Zeitpunkt des neuesten Blocks der Chain. Ist er älter als eine Minute, meldet ein Banner, dass das Netzwerk langsam ist und wie alt der Block ist; ist das Netzwerk nicht erreichbar, heißt es, dass Guthaben veraltet sein können. Solange das Netzwerk in Ordnung ist, zeigt es nichts an.
- **Zuletzt bekannte Werte** - antwortet das Netzwerk nicht, zeigt das Popup das zuletzt gelesene Guthaben und die Delegationen und sagt, von wann sie stammen.

## Aus der Erweiterung staken {#stake}

Seit **0.2.2** hat das Popup einen eigenen Staking-Bildschirm - eine nur in der Erweiterung erstellte Wallet benötigt nicht mehr die mobile App, um Staking-Rewards zu verdienen. Öffnen Sie **QOR staken** auf der Popup-Startseite. Es öffnet sich ein **Menü** mit einer Zeile Erklärung je Aktion; jede Aktion öffnet ihren eigenen Bildschirm mit eigener Fehlerzeile, und **Zurück zum Staking** führt zum Menü zurück.

| Bildschirm | Funktion |
|---|---|
| **QOR staken** | Wählen Sie einen Validator und einen Betrag. Aktive Validatoren werden mit ihrer Provision aufgeführt; **inhaftierte** Validatoren fehlen. Während Sie tippen, warnt QoreX, wenn der Betrag weniger als die Gebühr einer Transaktion übrig ließe (Sie könnten dann nicht unstaken oder beanspruchen, bis das Konto wieder QOR hält). |
| **Entstaken** | Startet das Unbonding. Die Zeit, bis die QOR wieder bewegt werden können, wird **aus dem Netzwerk gelesen**, und der Betrag erscheint unter **Entstaken läuft** mit der verbleibenden Zeit. |
| **Einsatz verschieben** | Redelegieren ohne Unbonding-Wartezeit, in drei Schritten: (1) der Validator, **von** dem verschoben wird (noch nicht wegverschiebbare sind ausgegraut, mit Datum), (2) die Validatoren, **zu** denen verschoben wird, (3) **wie viel**, mit **Max** sowie Route und Aufteilung vor dem Signieren. Eine Verschiebung, die das Netzwerk ablehnen würde, wird vorher abgefangen. Siehe [Stake zwischen Validatoren verschieben](/qorex/portfolio-and-staking#move-stake). |
| **Abholen** | Sammelt Belohnungen ein. Ist die Gebühr höher als die Belohnungen, warnt das erste Tippen. |
| **Beanspruchen & erneut staken** | Reinvestiert Belohnungen in einer Transaktion bei den Validatoren, die sie verdient haben (bis zu 127 Validatoren). QoreX prüft zuvor, ob Ihr **entsperrtes** QOR die Gebühr bezahlen kann, die vor dem Eintreffen der Belohnungen fällig wird. |
| **Für einen Bonus sperren** | Sperren Sie einen Teil Ihres Stakes für 3, 6 oder 12 Monate. Siehe [Staking-Sperren](/qorex/portfolio-and-staking#staking-locks). |
| **Belohnungen gehen an** | Senden Sie künftige Staking-Belohnungen an **ein anderes Konto derselben Wallet**, und an keine andere Adresse. Der Bildschirm zeigt, wohin die Belohnungen derzeit gehen, nennt beim ersten Tippen das neue Konto vollständig und signiert beim zweiten. Ihr Stake wird nicht bewegt. |

Unter dem Menü fasst eine Karte **Staking, einfach erklärt** die bisher verdienten Belohnungen, die Kosten des Stakings (Validatorprovision und Netzwerkgebühren) und den Zeitpunkt zusammen, zu dem entstaktes QOR ankommt. Bei mehreren Konten wählen Sie über die Kontoauswahl, welches stakt. Jede Aktion wird wie eine Sendung mit der obligatorischen hybriden Signatur (secp256k1 und ML-DSA-87) signiert, und der Bildschirm sagt, wann Ihre erste Transaktion auch Ihren Schlüssel registriert. Der jährliche Satz wird aus der eigenen Angabe der Chain gelesen. Staking, Delegation und Rewards finden ausschließlich auf der **Native**-Lane statt, niemals über ein EVM-Precompile - siehe [Staking & Delegation](/user-guide/staking-and-delegation).

### Eine Dashboard-Staking-Anfrage genehmigen {#stake-dashboard}

Das QoreChain-[Dashboard](/dashboard/staking-and-validators) stellt Staking-Anfragen zusammen, kann sie aber nicht signieren - Ihr Schlüssel verlässt niemals den Tresor der Erweiterung. Wenn Sie im Dashboard auf **Weiter in QoreX** klicken, öffnet sich die Anfrage in der Erweiterung, damit Sie sie prüfen (Validator und Betrag) und genehmigen können, genau wie bei einer Sendung.

:::note Wenn eine Transaktion als „herabgestuft" statt erfolgreich angezeigt wird
Das Dashboard zeigt eine Transaktion gelegentlich als **herabgestuft** statt als sauberen Erfolg an. Das bedeutet, dass Ihre Gelder bewegt wurden, die ML-DSA-87-Signaturschicht für diese Transaktion jedoch on-chain nicht gefunden wurde - das ist nichts, was Sie falsch gemacht haben, und nichts, was Sie von Ihrer Seite aus beheben können. Es ist ein Fehler auf unserer Seite; bitte melden Sie ihn dem Support, damit wir es untersuchen können. Die Meldung bleibt absichtlich auf dem Bildschirm stehen, statt zu verschwinden, damit Sie Zeit haben, sie zu lesen und zu melden.
:::

### Auf externen Netzwerken senden {#send-external}

Neben QOR auf der Native-Lane sendet der Popup-Bildschirm **Auf externen Netzwerken senden** Assets auf anderen Netzwerken, alle abgeleitet von derselben Wiederherstellungsphrase. Alle folgenden Netzwerke können senden und empfangen:

| Art | Netzwerke | Gebündelte Token |
|---|---|---|
| EVM | Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche C-Chain | ERC-20-Einträge (USDC und USDT über die EVM-Chains hinweg, DAI auf Ethereum) |
| SVM | Solana | SPL-Einträge (USDC, USDT) |
| Cosmos | Cosmos Hub, Osmosis, Celestia | Noble USDC über IBC; optionales Memo-Feld |

1. Wählen Sie die Münze oder das Token und geben Sie dann den Empfänger und den Betrag ein (auf Cosmos-Netzwerken optional ein Memo).
2. Kreuzen Sie die Bestätigung an. Auf Englisch lautet sie: **"External networks accept only classical signatures. Unlike your QOR, this transfer has NO ML-DSA-87 signature. I understand."** Externe Chains können keine ML-DSA-87-Signatur tragen, und QoreX verschweigt das nie.
3. Auf EVM-Netzwerken nennt das erste Tippen die **maximale Netzwerkgebühr** („Netzwerkgebühr: höchstens …“); das zweite sendet genau mit diesem Angebot. Jede Änderung verwirft das Angebot. Ist die Gebühr, in der gesendeten Münze bezahlt, höher als der Betrag, werden Sie gewarnt.
4. Ein Empfänger, der einer auf diesem Netzwerk bereits bezahlten Adresse nur ähnlich sieht, wird vollständig angezeigt und verlangt ein weiteres Tippen.

## Unterstützte Wallet-Standards {#standards}

QoreX stellt drei Schnittstellen bereit, alle als `window.qorex` (`{ evm, native, svm }`) auf der Seite injiziert und über EIP-6963 und den Solana Wallet Standard auffindbar. In einer Web-App kapselt der [Wallet-Adapter](/developer-tools/wallet-adapter) diese Erkennung.

| Standard | Was es ist | Was es für Sie als Entwickler bedeutet |
|---|---|---|
| **EIP-1193** | Die Ethereum-Provider-JavaScript-API (`request(...)`, Events). | Neben Konto- und Netzwerkabfragen (`eth_requestAccounts`, `eth_accounts`, `eth_chainId`, `wallet_switchEthereumChain`) signiert QoreX `personal_sign`, `eth_signTypedData_v4` und `eth_sendTransaction` auf dem EVM-Kanal von QoreChain (Chain-ID 9801, Testnet 9800) und auf Ethereum. Jede Genehmigung sagt, auf Ihrem Gerät dekodiert, was autorisiert wird, und simuliert die Transaktion vorher, wo möglich. Auf QoreChain können nur Konten im Ethereum-Stil (Coin 60) senden, und eine Transaktion braucht ein [EVM-Zugriffsfenster](#evm-window). Siehe [dApp-Integration](/qorex/dapp-integration). |
| **EIP-6963** | Multi-Wallet-Provider-Erkennung (announce-/request-Events). | QoreX kündigt sich selbst neben jeder anderen Wallet an - es **überschreibt niemals `window.ethereum`** - sodass der Nutzer QoreX pro Website ohne Konflikte auswählt. |
| **Native Provider (Keplr-Muster)** | `window.qorex.native`: `enable`, `getKey`, `signAndBroadcast`, `signDirect`, `getOfflineSigner` (für cosmjs, cosmos-kit und Interchain Kit), `signArbitrary` / `verifyArbitrary` sowie eine `capabilities`-Liste. Er ist **kein** vollständiger Keplr-Ersatz: QoreX legt keinen Alias `window.keplr` an, und Amino-Signierung und `sendTx` sind nicht verfügbar. | Der einfachste Weg, eine QoreChain-Transaktion zu senden, ist **`signAndBroadcast`** (siehe [Eine QoreChain-Transaktion senden](#sign-and-broadcast)): QoreX zeigt die entschlüsselten Nachrichten und die Gebühr an, fügt die ML-DSA-87-Schicht hinzu, die nur die Wallet erzeugen kann, und überträgt. Bei `signDirect` oder `getOfflineSigner` prüft QoreX eine von Ihrer Seite angehängte Schicht gegen den registrierten Schlüssel des Kontos oder fügt die Schicht selbst hinzu, wenn keine vorhanden ist. Siehe [dApp-Integration](/qorex/dapp-integration). |
| **Solana Wallet Standard** *(ab 0.1.5)* | Native Wallet-Erkennung für Solana-dApps (`wallet-standard:register-wallet` / `app-ready`). | Solana-dApps **erkennen QoreX automatisch** - keine benutzerdefinierte Integration nötig. Funktionen: `standard:connect`, `standard:disconnect`, `standard:events`, `solana:signMessage`, `solana:signTransaction`, `solana:signAndSendTransaction`; Chain `solana:mainnet`; sowohl `legacy`- als auch `v0`-Transaktionen. |

:::note Direkter Zugriff auf die SVM-Lane
Dieselbe Schnittstelle ist auch unter `window.qorex.svm` (`connect` / `signAndSendTransaction` / `signMessage`) verfügbar. Wallet-Standard-Auto-Discovery und die vollständig implementierte SVM-Lane wurden mit **0.1.5** ausgeliefert und sind sowohl in Chrome als auch in Firefox live (siehe [welche Version wo verfügbar ist](#versions)).

Solana-Genehmigungen zeigen **eine Zeile pro Instruktion**, entschlüsselt, wo QoreX das kann: SOL-Überweisungen (Empfänger und Lamports), SPL-Token-Überweisungen, **„AUSGABE Ihrer Token ERLAUBEN"** (Approve), **„KONTROLLE über das Konto ÜBERGEBEN"** (Set Authority) und das Schließen eines Token-Kontos - und sagen bei allem anderen „Instruktion, die QoreX nicht lesen kann", zusammen mit dem Programm. Eine Anfrage, die eine Approve- oder Set-Authority-Instruktion enthält, erhält die Überschrift „will Verfügungsgewalt über Ihre Solana-Token - lesen Sie jede Zeile unten". Transaktionen, die Ihre Wallet nicht als Signer auflisten, werden abgelehnt, `signMessage` signiert keine Bytes, die in Wirklichkeit eine Transaktion sind, und die Signatur wird als **klassisch** markiert. Siehe [Hybride Signierung](#pqc).
:::

## Coins und Token {#custom-tokens}

Auf dem Popup-Bildschirm **Coins und Token** können Sie einen **ERC-20-Token über seinen Vertrag** hinzufügen: Netzwerk wählen, Vertragsadresse einfügen, **Vertrag prüfen**. QoreX liest Namen und Dezimalstellen des Tokens aus dem Vertrag selbst - und liest sie beim Hinzufügen im Hintergrund erneut, statt dem Popup zu vertrauen - und zeigt sie dann mit dem Hinweis an, dass jeder einen Token mit beliebigem Namen erstellen kann. Der Token erscheint danach unter **Auf externen Netzwerken senden** und unter [Empfangen](#receive). Abgelehnt werden gebündelte Token, Duplikate, Nicht-EVM-Netzwerke, ungültige Adressen, nicht lesbare Verträge und Verträge, die den Namen eines gebündelten Tokens borgen.

## Verbundene Websites {#connected-sites}

**Verbundene Websites** im Popup listet jede Website auf, die diese Wallet genehmigt hat - eine Website kann die Adresse dieser Wallet sehen und Sie um eine Signatur bitten. Tippen Sie auf **Widerrufen**, um eine zu entfernen. Genehmigungen werden **pro Wallet** geführt: Eine für eine Wallet genehmigte Website kann nach dem Wechsel nicht die Adresse einer anderen Wallet lesen.

## EVM-Zugriffsfenster {#evm-window}

Der Popup-Bildschirm **EVM-Zugriffsfenster** öffnet und schließt das Fenster, das einem Ethereum-artigen (Coin 60) Konto das Senden auf der EVM-Lane von QoreChain erlaubt (v3.2.0 und neuer), mit denselben Grenzen wie in der App: bis zu 17.280 Blöcke und 1.000 Transaktionen sowie eine QOR-Ausgabeobergrenze, die alle QOR zählt, die das Konto verlassen, plus jede maximale Gebühr. Token zählen nicht zur Obergrenze.

1. Wählen Sie die Dauer (Blöcke), die Anzahl der Transaktionen und das Ausgabelimit.
2. Wählen Sie, **was das Fenster zulässt**:
   - **Nur QOR-Überweisungen (empfohlen)**, der Standard: keine Vertragsaufrufe, keine neuen Verträge und kein Empfänger, der ein Vertrag ist;
   - **Jeder Vertrag**: Jeder Vertrag kann aufgerufen werden, und der Bildschirm warnt, dass Token, NFTs und Freigaben, die ein Vertrag bewegt, durch das Fenster nicht begrenzt werden. Kann das Netzwerk ein Fenster nicht auf QOR-Überweisungen begrenzen, fragt QoreX, bevor es eines für jeden Vertrag öffnet; bei Nein wird nichts geöffnet.
3. Tippen Sie auf **Fenster öffnen**. Das offene Fenster sagt genau, was es zulässt. **Fenster schließen** beendet es.

Ein mit **Nur QOR-Überweisungen** geöffnetes Fenster lässt keine Website einen Vertrag aufrufen. Die eigene Transaktion einer Website kann QoreX aus ihrer Genehmigung heraus ein Fenster für genau diese Transaktion öffnen lassen; die Genehmigung nennt jeden Vertrag, den das Fenster zulassen würde, und sagt, dass es jedes offene Fenster ersetzt.

Ein Coin-118-Konto kann die EVM-Lane nicht nutzen; der Bildschirm listet die drei nötigen Schritte auf und hat eine Schaltfläche zu **Deine Konten**. Nur die eigenen Bildschirme Ihrer Wallet können ein Fenster öffnen, schließen oder löschen; eine Website kann das nicht. Siehe [EVM-Zugriffsfenster](/qorex/security-and-recovery#evm-window).

## Pflege des Post-Quanten-Schlüssels und Multisig {#pqc-care}

**Schlüssel erneut registrieren (Reparatur).** Kann der Eintrag des Post-Quanten-Schlüssels des Kontos im Netzwerk nicht mehr signieren (er ist leer, nur klassisch oder anderweitig unbrauchbar), zeigt die Popup-Startseite eine Karte. Ein Tippen auf **Schlüssel erneut registrieren** zeigt die Netzwerkgebühr; tippen Sie erneut, um zu registrieren. QoreX tut das nie von sich aus. Hat das Konto ein EVM-Fenster, schließt das Netzwerk es; öffnen Sie danach also ein neues.

**Post-Quanten-Schlüssel rotieren.** Die Schaltfläche **Post-Quanten-Schlüssel rotieren** ersetzt den ML-DSA-87-Schlüssel des Kontos im Netzwerk durch den nächsten aus Ihrer Wiederherstellungsphrase abgeleiteten Schlüssel. Tippen Sie zweimal; die Gebühr wird im Ergebnis angezeigt. Die Rotation schützt Sie, wenn nur der Post-Quanten-Schlüssel offengelegt wurde; sie hilft **nicht**, wenn Ihre Wiederherstellungsphrase offengelegt wurde. Danach können andere Wallets mit derselben Phrase für dieses Konto nicht signieren, bis sie rotierte Schlüssel unterstützen, und das Netzwerk schließt das EVM-Fenster des Kontos. Beim Wiederherstellen aus der Phrase findet QoreX den richtigen Schlüssel.

**Multisig-Konten.** **Multisig-Konten** verwaltet Konten, die die Signaturen mehrerer Mitglieder benötigen, mit je einer Post-Quanten-Signatur und einer klassischen von jedem Mitglied. QoreX verwendet dieselben Dateien wie die QoreChain-Kommandozeile, sodass jedes Mitglied in QoreX oder in der Kommandozeile signieren kann.

1. **Multisig erstellen** aus Mitgliederadressen (jede muss mindestens eine Transaktion gesendet haben), der Anzahl der benötigten Signaturen und optional einem Namen, oder **Bestehendes Multisig hinzufügen**, indem Sie seinen Schlüssel einfügen.
2. Der Bildschirm zeigt das Guthaben und den Zustand des Schlüssels jedes Mitglieds. Zuerst **Registrierung vorbereiten** für die Menge der Post-Quanten-Mitglieder; solange sie nicht registriert ist, kann das Konto nicht senden. Dann **Überweisung vorbereiten**.
3. In der Erweiterung werden Dateien heruntergeladen und geöffnet. **Runde 1:** Die Mitglieder fügen Post-Quanten-Signaturen hinzu; kombinieren Sie sie. **Runde 2:** Die vereinbarten Mitglieder signieren klassisch. Dann **An das Netzwerk senden**.
4. Das Signieren braucht zweimaliges Tippen, und Sie prüfen zuerst, was Sie signieren. QoreX warnt Sie, wenn die Transaktion einen Authenticator registriert, denn ein Authenticator kann die Mittel des Multisig ohne die Signaturen der anderen Mitglieder bewegen.

## Entwicklerwerkzeuge {#developer-tools}

Der Entwicklermodus ist standardmäßig aus. Um ihn in der Erweiterung einzuschalten, tippen Sie siebenmal auf die **Versionsnummer** unten im Popup. Unten auf der Popup-Startseite erscheint ein Entwicklerbereich mit **Entwicklerwerkzeuge** (die Schaltfläche `</>`), **Zum Testnet (diana) wechseln** (oder **Zurück zum Mainnet**) und **Entwicklermodus ausschalten**.

**Entwicklerwerkzeuge** öffnet eine Seite mit den Werkzeugen, gruppiert in **Prüfen**, **Transaktionen**, **Verträge und Rollups**, **Weitere virtuelle Maschinen** und **Signieren und Agenten**. Es sind 17 Werkzeuge, dieselben wie in der App; im Testnet ist dort auch **Solana auf QoreChain** aufgeführt. Der Entwicklermodus ändert keine Signierregel: Alles, was signiert, zeigt weiterhin, was es signiert, und wartet auf Ihre Genehmigung. Jedes Werkzeug ist unter [Entwicklermodus](/qorex/developer-mode) beschrieben.

Das Werkzeug **KI-Agenten** lässt einen KI-Assistenten auf Ihrem Computer lesen, was Sie erlauben, und eine Transaktion **vorschlagen**. QoreX prüft und simuliert jeden Vorschlag, und Sie genehmigen oder lehnen ihn im normalen Genehmigungsfenster ab; kein Agent kann signieren. In der Erweiterung braucht es ein Begleitprogramm auf Ihrem Computer, das **noch nicht veröffentlicht ist**, und in Safari ist es nicht verfügbar.

Nur im **Testnet** bietet die Popup-Startseite außerdem das Senden an eine andere Chain über IBC und den QoreChain-Bridge-Bildschirm; im Mainnet wird keines von beiden angeboten. Siehe [Testnet-Funktionen](/qorex/testnet-features).

## Sprache {#language}

Die Erweiterung spricht dieselben zehn Sprachen wie die mobile App, das Dashboard und die Website: Englisch, Rumänisch, Deutsch, Spanisch, Französisch, Italienisch, Türkisch, Arabisch, Japanisch und Koreanisch. Sie folgt standardmäßig der Sprache Ihres **Browsers** (mit Rückfall auf Englisch für alles andere) - beachten Sie, dass dies eine andere Quelle ist als bei der mobilen App, die der Sprache des **Telefons** folgt, sodass beide unterschiedliche Sprachen anzeigen können, wenn Telefon und Browser unterschiedlich eingestellt sind. Eine Auswahl auf dem Leerlaufbildschirm des Popups erlaubt es Ihnen, die erkannte Sprache jederzeit zu überschreiben; der Wechsel zu Arabisch dreht das Popup sofort auf rechts-nach-links um, nicht nur den Text.

## Sicherheit & Berechtigungen {#security}

QoreX ist darauf ausgelegt, überprüfbar zu sein, nicht nur vertrauenswürdig:

- **Tresor** - Ihre Schlüssel werden mit **AES-256-GCM** versiegelt. Der Passwortpfad leitet seinen Schlüssel mit **Argon2id** ab (RFC 9106, speicherhart: 64 MiB, t=3, p=1), sodass ein kopierter Tresor-Blob auf GPU- oder ASIC-Hardware nur langsam per Brute Force zu knacken ist. (Alte PBKDF2-Blobs bleiben öffenbar und werden beim nächsten Entsperren zu Argon2id neu versiegelt.)
- **Passkey-Entsperrung (optional, ab 0.1.5)** - wo Ihr Authenticator die **WebAuthn-PRF**-Erweiterung unterstützt, kann QoreX den Tresor anhand der 32-Byte-PRF-Ausgabe des Passkeys entsperren, statt eines eingegebenen Passworts. Ihr Passwort bleibt stets ein Fallback.

  :::note Wo die Passkey-Entsperrung erscheint
  QoreX erkennt WebAuthn per Feature-Detection und zeigt **Passkey-Entsperrung aktivieren** nur dort, wo der Browser dies für Erweiterungsseiten bereitstellt - das sind **Chrome und Edge**. In **Firefox** ist die Option ausgeblendet, weil Firefox WebAuthn für Erweiterungsseiten nicht bereitstellt. Das ist erwartet, kein Fehler.
  :::
- **Automatische Sperre** - QoreX sperrt sich nach einer Zeit ohne Nutzung selbst (standardmäßig 15 Minuten) und hat eine Schaltfläche **Sperren**. Siehe [Entsperren und automatische Sperre](#unlock).
- **Manifest V3 + strikte CSP** - `script-src 'self'; object-src 'self'; base-uri 'self'`. Es gibt **kein Nachladen von Remote-Code** nach der Installation und kein `wasm-unsafe-eval`.
- **Keine Analytics, kein Absturzbericht, kein Tracking-SDK, keine Anmeldung** - die Erweiterung braucht kein Konto, um QOR zu halten, zu senden oder zu staken. Ihre Schlüssel, Wiederherstellungsphrase, Ihr Tresor und Ihre Genehmigungen verlassen den Browser nie. Sie stellt jedoch Netzwerkanfragen: an die öffentlichen QoreChain-Endpunkte für Guthaben, Verlauf und Übertragung (diese enthalten Ihre öffentliche `qor1…`-Adresse), eine Preisabfrage (ohne Adresse), die öffentlichen Dienste jedes externen Netzwerks, das Sie halten oder ansehen (Ihre öffentliche Adresse in diesem Netzwerk), und die @Handle-Registry (das Handle oder eine öffentliche Adresse). Nur wenn Sie die [Dashboard-Kopplung](#dashboard-bridge) verwenden, sendet sie einen signierten Nachweis, dass Sie die Adresse besitzen. Siehe [Was QoreX über das Netzwerk sendet](/qorex/overview#data-and-privacy).

### Welche Berechtigungen QoreX anfragt, und warum {#permissions}

Dieser Abschnitt existiert, weil der Firefox-Eintrag die Berechtigung **„Auf Ihre Daten für alle Websites zugreifen"** anzeigt, was im Widerspruch zu einer Wallet stehen kann, die keine Host-Berechtigungen deklariert. Hier ist die exakte, ungeschönte Wahrheit aus dem Manifest.

Die `manifest.json` der Erweiterung deklariert:

```json
"permissions": ["storage", "nativeMessaging"],
"host_permissions": [],
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["dist/content.js"], "run_at": "document_start" }
],
"web_accessible_resources": [
  { "resources": ["dist/inpage.js"], "matches": ["<all_urls>"], "use_dynamic_url": true }
]
```

- **`storage`** - speichert den verschlüsselten Tresor, Ihre Verbindungsgenehmigungen pro Ursprung sowie die eigenen Einstellungen und Listen Ihrer Wallet (etwa Kontakte) **lokal** im Erweiterungsspeicher.
- **`nativeMessaging`** - neu in 0.4.4, nur vom Entwicklermodus-Werkzeug [KI-Agenten](#developer-tools) genutzt, um mit einem Begleitprogramm auf Ihrem eigenen Computer zu sprechen (noch nicht veröffentlicht). QoreX öffnet diese Verbindung erst, nachdem Sie in diesem Werkzeug **Verbindungen von KI-Agenten auf diesem Computer erlauben** eingeschaltet haben. Das **Safari**-Paket deklariert diese Berechtigung nicht.
- **`host_permissions: []`** - QoreX deklariert **keine** Host-Berechtigungen. Es fordert nicht die Fähigkeit an, in Ihrem Namen Cross-Origin-Netzwerkanfragen an beliebige Websites zu stellen.
- **`web_accessible_resources`** - erlaubt Seiten, das eigene `inpage.js` von QoreX zu laden, das kleine Skript, das den Provider bereitstellt. `use_dynamic_url` gibt ihm eine Adresse pro Sitzung, sodass Websites die Erweiterung nicht per Abtasten identifizieren (Fingerprinting) können.
- **`content_scripts` mit Übereinstimmung `<all_urls>`** - dies ist der ehrliche Grund, warum Firefox *„Auf Ihre Daten für alle Websites zugreifen"* anzeigt. QoreX injiziert ein kleines Provider-Skript (`content.js` → `inpage.js`) in **jede Seite**. Ein Content-Script, das auf allen Websites läuft, *kann* technisch die Seite lesen, und Browser beschreiben diese Fähigkeit mit genau diesem Wortlaut - egal ob sie aus `host_permissions` oder aus einer Content-Script-Übereinstimmung stammt.

**Warum das Content-Script überall läuft.** Damit **jede** dApp die Wallet über EIP-6963 erkennen kann, ohne dass Sie zuvor pro Website Zugriff gewähren müssen. So funktionieren MetaMask, Keplr, Phantom und jede andere injizierte Wallet: Der injizierte Provider muss vorhanden sein, bevor die Skripte der Seite laufen (`document_start`), auf welcher Website Sie auch immer sind.

**Was dieses Skript tut - und nicht tut.** Es überbrückt ausschließlich Wallet-Nachrichten (den Provider ankündigen, Connect-/Sign-Anfragen an den Service-Worker weiterleiten, das Ergebnis zurückgeben). Es liest **nicht** über diese Wallet-Anfragen hinaus den Seiteninhalt, sendet nichts an einen Server und lädt keinen Remote-Code - und es kann keine beliebigen Cross-Origin-Daten abrufen, da keine Host-Berechtigungen vorliegen. All das ist überprüfbar: Die Erweiterung ist CSP-gesperrt, liefert keine Analytics aus, und ihr Manifest (oben) ist im installierten Paket lesbar.

## Eine dApp mit QoreX verbinden {#connect}

Eine dApp erkennt QoreX über **EIP-6963** (die Anfrage ankündigen, die Wallet mit dem `rdns` `network.qore.qorex` wählen) und verwendet dann den zurückgegebenen EIP-1193-Provider; für die QoreChain-**Native**-Lane verwendet sie `window.qorex.native` und liest `capabilities`, um zu sehen, was dieser Build unterstützt. QoreX setzt niemals `window.ethereum` oder `window.keplr`. Der vollständige Entwicklerleitfaden mit Code steht auf einer eigenen Seite: [Eine dApp in QoreX integrieren](/qorex/dapp-integration) (siehe [QoreX erkennen](/qorex/dapp-integration#detection) und [Verbinden](/qorex/dapp-integration#connect)). In einer Web-App kapselt der [Wallet-Adapter](/developer-tools/wallet-adapter) diese Erkennung für Sie, und das [QoreX-Entwickler-Kit](/developer-tools/qorex-integrations) deckt die App-seitige Integration ab. (`@qorechain/connect` ist veraltet; beginnen Sie damit keine neue Arbeit.)

Genehmigungen sind **pro Ursprung**: Die erste Verbindung zu einer Website öffnet ein Genehmigungs-Popup, das den Ursprung anzeigt, die Genehmigung gibt nur Ihre öffentliche Adresse preis, und die Genehmigung einer Website gewährt einer anderen nichts. Genehmigungen werden pro Wallet geführt, bleiben bestehen, bis Sie sie unter **Verbundene Websites** widerrufen, und eine Website kann eine wartende Anfrage haben (insgesamt drei); das Wechseln der Wallet oder das Sperren beantwortet wartende Anfragen mit „Nein“. Ab 0.4.4 öffnet eine Signaturanfrage einer Website, während QoreX gesperrt ist, den Passwortbildschirm, nennt die Website und zeigt nach dem Entsperren ihre Genehmigung; wird das Fenster geschlossen, ist sie abgelehnt. Siehe [Was das Genehmigungsfenster zeigt](/qorex/security-and-recovery#approvals).

### Dashboard-Brücke (v0.1.5, erweitert in v0.2.2) {#dashboard-bridge}

Version 0.1.5 fügt eine Brücke hinzu, die ausschließlich auf **`dashboard.qorechain.io`** beschränkt ist: `window.qorex.native.connectProof(sessionId)` signiert den *Connect-with-QoreX*-Pairing-Beweis (das Backend verifiziert die Signatur erneut), und `executeTransfer({ to, amountUqor, memo })` genehmigt und überträgt einen vom Dashboard vorgeschlagenen QOR-Transfer und gibt den `txHash` zurück. Diese Methoden werden bei jedem anderen Ursprung abgelehnt.

**0.2.2** fügt `native:executeRequest` hinzu, das eine gesamte vom Dashboard vorgeschlagene Anfrage entgegennimmt - einschließlich [Staking](#stake-dashboard) - validiert gegen denselben gemeinsamen Parser, den QoreX überall sonst verwendet: abgelehnt bei einer Netzwerk-Fehlübereinstimmung, einem fremden Ursprung, einer Adresse, die nicht Ihnen gehört, einer unbekannten Anfrageart oder einer Staking-Anfrage, die eine `toAddress` trägt (Staking-Anfragen haben keine). Die Anfragearten sind Senden, Delegieren, Undelegieren, Redelegieren und Beanspruchen; eine Connect-Anfrage lässt Sie wählen, welches Ihrer Konten verknüpft wird, und `listAccounts()` gibt Ihre Konten zurück (nur lesend).

Da eine `qor1…`-Adresse sowohl auf dem Mainnet als auch auf dem Testnet gleichermaßen gültig ist, gibt eine vom Dashboard vorgeschlagene Anfrage an, welches Netzwerk sie anvisiert, und QoreX weigert sich, danach zu handeln, wenn dies nicht mit dem Netzwerk übereinstimmt, mit dem die Erweiterung gerade verbunden ist - sie wechselt niemals im Auftrag einer Anfrage das Netzwerk.

## Eine QoreChain-Transaktion aus einer dApp senden: `signAndBroadcast` {#sign-and-broadcast}

Jede Native-Lane-Transaktion von QoreChain von einem Konto mit registriertem ML-DSA-87-Schlüssel braucht eine hybride Signatur - secp256k1 **und** ML-DSA-87 - und nur die Wallet hält den ML-DSA-Schlüssel, sodass eine Seite sie nicht erzeugen kann. Eine dApp sendet die Nachrichten mit `window.qorex.native.signAndBroadcast({ chainId, messages, memo?, gasLimit? })`; QoreX zeigt die entschlüsselten Nachrichten und die Gebühr an, baut die Transaktion für das von Ihnen gewählte Konto, fügt die hybride Signatur hinzu (und registriert zuvor den ML-DSA-87-Schlüssel des Kontos, falls dies seine erste Transaktion ist), überträgt und liefert `{ txHash, code, height?, shield }`. Verfügbar ab Erweiterung **0.3.5**.

- Die Chain muss das aktive Netzwerk der Wallet sein (`qorechain-vladi` im Mainnet). Eine dApp kann das Netzwerk nicht wechseln; nur Sie können das.
- 1-32 Nachrichten pro Aufruf; die Gebühr wird vor der Genehmigung angezeigt; der Wallet vorbehaltene Nachrichten wie die Verwaltung des ML-DSA-87-Schlüssels werden abgelehnt.
- cosmjs, cosmos-kit und Interchain Kit funktionieren über `getOfflineSigner` (ab 0.4.0), wobei QoreX die ML-DSA-87-Schicht und die zugehörige Gebühr hinzufügt.
- `signArbitrary` signiert eine Nachricht mit dem klassischen Schlüssel des Kontos und ML-DSA-87 (ab 0.4.0).

Regeln, Gas, Fehler und die vollständigen Codebeispiele stehen unter [Eine dApp in QoreX integrieren](/qorex/dapp-integration#sign-and-broadcast).

## Hybride Signierung {#pqc}

Jede native QOR-Überweisung, die QoreX selbst initiiert, wird zweifach signiert: mit einem klassischen secp256k1-Schlüssel und mit **ML-DSA-87** (FIPS 204), unter Verwendung der Hybrid-Pipeline in `@qorechain/sdk`. **Es gibt keinen Schalter dafür**: QoreChain verlangt es, und QoreX sendet niemals eine Native-Lane-QOR-Überweisung ohne diese Signatur.

- **Von dApps ausgelöstes Signieren auf der Native-Lane** - verwenden Sie [`signAndBroadcast`](#sign-and-broadcast): QoreX entschlüsselt jede Nachricht, zeigt die Gebühr an und fügt die ML-DSA-87-Schicht selbst hinzu. `signDirect` und die cosmjs-Signierer (`getOfflineSigner`) signieren eine Transaktion, die die Seite gebaut hat; trägt sie keine ML-DSA-87-Schicht, fügt QoreX eine hinzu, und eine von der Seite angehängte Schicht wird vor jedem Genehmigungsfenster gegen den registrierten Schlüssel des Kontos geprüft (aus MetaMask importierte Konten verwenden `signAndBroadcast`). QoreX signiert nie blind: Eine Anfrage, die es nicht entschlüsseln kann, wird abgelehnt, und es signiert niemals eine rein klassische QoreChain-Transaktion. Siehe [Eine dApp in QoreX integrieren](/qorex/dapp-integration#cosmjs).
- **Klassische Signaturen werden immer gekennzeichnet** - Überweisungen auf externen Netzwerken (ETH, BNB, Solana, …) können keine ML-DSA-87-Signatur tragen; QoreX lässt Sie eine explizite Bestätigung ankreuzen und markiert sie als klassisch, statt stillschweigend herabzustufen.

**Was das für die Transaktionsgröße bedeutet.** ML-DSA-87 ist eine große Signatur: Die Signatur umfasst **4.627 Byte** und der öffentliche Schlüssel **2.592 Byte** (festgelegt durch FIPS-204). Eine hybride QoreChain-Transaktion ist daher um mehrere Kilobyte größer als eine rein klassische. Wenn Sie Transaktionen selbst erstellen und übertragen, dimensionieren Sie Ihre Puffer und Gebührenschätzungen für die zusätzlichen Bytes; QoreChains Gas-Abrechnung erwartet diese bereits. Siehe [Post-Quanten-Signierung](/developer-guide/post-quantum-signing) (der Entwicklerleitfaden) für die Primitiven und die Anforderung der deterministischen Signierung.

## Wo sie veröffentlicht ist {#where-published}

| Store | Eintrag | Aktuelle Version | Link |
|---|---|---|---|
| Chrome Web Store | **QoreX** | 0.4.4 | [chromewebstore.google.com](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) |
| Firefox Add-ons | `qorex` | 0.4.4 | [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/qorex/) |
| Mac App Store (Safari) | **QoreX Wallet**, App 1.8.2 | Erweiterung 0.4.4 | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6794132220) |

Der Quellcode von QoreX ist nicht öffentlich. Die Store-Einträge zeigen stets die aktuelle Version.

## Einschränkungen und bekannte Probleme {#limits}

- **EVM-Signierung hat Grenzen.** Der Provider signiert `personal_sign`, `eth_signTypedData_v4` und `eth_sendTransaction` (QoreChain, sowie Ethereum je Website) und lehnt andere Signiermethoden ab. Auf QoreChain können nur aus MetaMask importierte Konten senden, eine EVM-Transaktion braucht ein Autorisierungsfenster (die Genehmigung öffnet eines für diese Transaktion), und sie trägt nur eine secp256k1-Signatur. Siehe [Eine dApp in QoreX integrieren](/qorex/dapp-integration#evm).
- **`window.qorex.native` ist im Keplr-Muster gehalten, aber kein Keplr-Ersatz.** Es gibt keinen Alias `window.keplr`. `signAmino` und `sendTx` fehlen: Amino wird mit Code `4200` abgelehnt. `getOfflineSigner` und `signDirect` funktionieren, und QoreX fügt die ML-DSA-87-Schicht hinzu, wenn die Seite keine mitbringt. `signArbitrary` und `verifyArbitrary` (Nachrichtensignierung) funktionieren ab 0.4.0. Eine dApp kann das Netzwerk nicht wechseln, und der Wallet vorbehaltene Nachrichten (Schlüsselverwaltung, Ausgabenregeln, EVM-Fenster, bestimmte Grants) werden von jeder Website abgelehnt.
- **Nur mobil:** Portfolio, Q-Day Scanner, soziale Wiederherstellung, Legacy, Anmeldung, Geräteverknüpfung und das Beanspruchen eines @Handles.
- **Kein Swap-Bildschirm** in der Erweiterung.
- **Passkey-Entsperrung** wird nur angeboten, wo der Browser WebAuthn für Erweiterungsseiten bereitstellt (Chrome und Edge); in Firefox ist sie ausgeblendet.
- **Safari** öffnet Genehmigungen in einem Browser-Tab statt in einem Popup.
- **Externe Netzwerke** akzeptieren nur klassische Signaturen; QoreX lässt Sie dies vor jeder Überweisung bestätigen.
- **Nur Testnet:** das Senden an eine andere Chain über IBC, der QoreChain-Bridge-Bildschirm und Solana auf QoreChain. Siehe [Testnet-Funktionen](/qorex/testnet-features).
- **KI-Agenten** brauchen ein noch nicht veröffentlichtes Begleitprogramm und sind in Safari nicht verfügbar.
- **Verlauf** deckt vorerst nur QoreChain ab.
- Der Tresor der Erweiterung existiert nur in diesem Browser. Das Entfernen der Erweiterung, das Löschen ihrer Daten oder das Zurücksetzen des Browsers löscht Ihre Schlüssel; nur Ihre notierten 24 Wörter stellen sie wieder her.
