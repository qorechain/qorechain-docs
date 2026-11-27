---
slug: /qorex/overview
title: QoreX Wallet
sidebar_label: Überblick
sidebar_position: 1
---

# QoreX Wallet

**QoreX** ist die offizielle **nicht-verwahrende** Wallet für **QoreChain** (Mainnet `qorechain-vladi`). Sie ist für alle gedacht, die QOR halten, senden, staken und empfangen, Menschen per @handle bezahlen, Assets in anderen Netzwerken mit derselben Wiederherstellungsphrase halten und freigeben möchten, was Websites ihre Wallet signieren lassen wollen. Deine privaten Schlüssel werden **ausschließlich auf deinem Gerät** erzeugt und gespeichert. Die QoreChain Association hat niemals Zugriff auf deine Mittel, und die Apps enthalten **keine Analyse, keine Absturzberichte und kein Tracking-SDK**. Schlüssel, Wiederherstellungsphrase, Tresor und Freigaben verlassen dein Gerät niemals (siehe [Was QoreX über das Netzwerk sendet](#data-and-privacy)). Jede native QOR-Überweisung wird doppelt signiert: mit einem klassischen Schlüssel und mit ML-DSA-87 (FIPS 204).

QoreX ist eine Familie aus vier Builds, die zusammenarbeiten:

- **Mobile App** (Android und iOS): die vollständige Wallet, mit Wiederherstellung, Staking, Portfolio, einem integrierten dApp-Browser und dem Q-Day Scanner. Siehe [Erste Schritte](/qorex/getting-started) und [dApp-Browser](/qorex/dapp-browser).
- **Browser-Erweiterung** (Chrome und Chromium-Browser, Firefox): eine eigenständige Desktop-Wallet und der Konnektor, über den jede Website QoreX erkennen und jede Anfrage in eine ausdrückliche Freigabe verwandeln kann. Siehe [Browser-Erweiterung](/qorex/browser-extension).
- **Safari-Erweiterung**: dieselbe Erweiterung, verpackt in der macOS-App **QoreX Wallet** im Mac App Store.
- **Developer-Kit**: sechs öffentliche npm-Pakete für Apps, die QoreX integrieren. Siehe [Für Entwickler](#developers).

:::caution Sichere deine Wiederherstellungsphrase, sobald du eine Wallet erstellst
QoreX ist nicht-verwahrend: Die QoreChain Association kann eine verlorene Wallet weder wiederherstellen noch zurücksetzen noch für dich zurückholen. **Das Deinstallieren der App, das Zurücksetzen des Telefons oder das Entfernen der Erweiterung löscht deine Schlüssel von diesem Gerät.** Schreibe deine 24-Wörter-Wiederherstellungsphrase auf (die mobile App zeigt sie beim Erstellen der Wallet nicht an, lasse sie dir daher unter **Einstellungen → Sicherheit → Wiederherstellungsphrase anzeigen** anzeigen; die Erweiterung zeigt sie einmal bei der Erstellung) und richte, wenn du kannst, die [soziale Wiederherstellung](/qorex/security-and-recovery#social-recovery) ein. Siehe [Jetzt sichern](/qorex/security-and-recovery#back-up-now).
:::

## Innovationen {#innovations}

- **Hybrid signierte Native-Lane.** Jede native QOR-Überweisung wird doppelt signiert: mit einem klassischen secp256k1-Schlüssel und mit ML-DSA-87 (FIPS 204). Die Chain prüft beide. Alles in einem externen Netzwerk ist nur klassisch signiert, und QoreX kennzeichnet es vor deiner Bestätigung entsprechend.
- **Eine Wiederherstellungsphrase, ein ML-DSA-87-Schlüssel, kein zweites Backup.** Der ML-DSA-87-Schlüssel wird deterministisch aus denselben 24 Wörtern abgeleitet: `SHAKE256("qorechain:pqc:v1|" + address + "|" + mnemonic)`. Die Ableitung ist in [QoreSign](/qoresign/overview) veröffentlicht, sodass jede kompatible Wallet denselben Schlüssel ableitet.
- **Automatisch registriert, dann geprüft.** Der ML-DSA-87-Schlüssel wird mit deiner ersten Transaktion on-chain registriert (mit einem Besitznachweis ab Chain v3.2.3). Nach jedem Broadcast prüft die Wallet, ob die bestätigte Transaktion die ML-DSA-87-Ebene trägt, und warnt dich, falls nicht.
- **Freigaben, die ablehnen, was sie nicht lesen können.** Jede Nachricht, die Gebühr, Ausgabenlimits und der Ablauf werden dekodiert, bevor du signierst. Eine Anfrage, die QoreX nicht dekodieren kann, oder eine, deren Bytes auf zwei Arten gelesen werden können, wird abgelehnt.
- **`signAndBroadcast` für dApps.** Eine Website sendet die Nachrichten; die Wallet zeigt sie dekodiert an, fügt die ML-DSA-87-Ebene hinzu, die nur die Wallet erzeugen kann, und sendet per Broadcast. Eine Seite kann diese Ebene nicht erzeugen.
- **EVM-Zugriffsfenster, standardmäßig sicherer.** Oberhalb von Chain v3.2.0 wird eine EVM-Transaktion nur zugelassen, solange das Konto ein offenes Fenster hat: eine hybrid signierte `MsgOpenEVMWindow`, begrenzt durch Transaktionsanzahl, Wert und Ablauf. QoreX öffnet, zeigt und schließt es. Ein selbst geöffnetes Fenster ist auf **Nur QOR-Überweisungen** beschränkt, außer du wählst **Jeder Vertrag**, was eine eigene Warnung mitbringt; ein offenes Fenster sagt genau, was es zulässt; und eine Freigabe, die für eine Website ein Fenster öffnet, nennt jeden Vertrag, den das Fenster erlaubt, und sagt, wann es das offene ersetzt. Siehe [Sicherheit & Wiederherstellung](/qorex/security-and-recovery#evm-window).
- **Handles mit Pinning.** Ein @handle wird durch eine ed25519-Attestierung der Registry plus die eigene secp256k1-Signatur des Eigentümers an eine `qor1…`-Adresse gebunden. QoreX merkt sich die Adresse, die es zuerst aufgelöst hat, und meldet eine stille Änderung.
- **Wiederherstellung ohne Unternehmen.** Die soziale Wiederherstellung teilt den Seed in verschlüsselte, mit ML-KEM versiegelte Anteile auf (2 von 3 Guardians), mit einer 48-Stunden-Zeitsperre, die dich benachrichtigt; Legacy ist ein Dead-Man-Switch über deine Guardians; die Geräteverknüpfung überträgt eine Wallet mit einem Einmalcode und einem QR-Code, der allein nutzlos ist. Siehe [Sicherheit & Wiederherstellung](/qorex/security-and-recovery).
- **Erster Start mit Ziel.** Nach der kurzen Tour fragt QoreX **Was möchtest du zuerst tun?** (Geld empfangen, Geld senden oder meine Krypto sicher aufbewahren) und führt dich dorthin, mit einer kurzen Backup-Prüfung am Ende. Siehe [Erster Start](/qorex/getting-started#first-run).
- **Zahlungsanforderungen mit signierten Links.** Fordere einen Betrag an, und QoreX erstellt einen mit deinem eigenen Kontoschlüssel signierten Link, sodass ein geänderter Empfänger oder Betrag erkannt wird. Das QoreX des Zahlenden prüft die Signatur, das Netzwerk und ein eventuelles @handle und zeigt dann die normale Prüfansicht. Eine Anforderung wird nur dann als bezahlt markiert, wenn die Chain die Zahlung zeigt. Siehe [Senden & Empfangen](/qorex/send-and-receive).
- **Kontakte und Favoriten.** Namen für die Adressen, an die du zahlst, nur auf dem Gerät gespeichert. Favoriten sind Chips zum Antippen auf dem Sendeformular, **Zahlung wiederholen** füllt das Formular erneut aus (du prüfst es weiterhin), und eine Adresse, die einer gespeicherten nur ähnelt, wird markiert.
- **Schutz meines Geldes.** Ein Bildschirm, der live prüft, ob dein Backup verifiziert und deine Wiederherstellung getestet wurde, deine Vertrauenspersonen (App), die mit dir verbundenen Websites und Apps, die Berechtigungen, die dein Konto im Netzwerk erteilt hat, und die ERC-20-Freigaben auf dem EVM von QoreChain (jeweils mit Widerrufen) sowie welche Signaturen auf welcher Lane Post-Quanten-Signaturen sind. Siehe [Sicherheit & Wiederherstellung](/qorex/security-and-recovery).
- **Ein klarer Verlauf.** Jede Transaktion wird je Konto als ausstehend, bestätigt oder fehlgeschlagen angezeigt, aus der Chain gelesen, mit einem CSV-Export, der sich gefahrlos in einer Tabellenkalkulation öffnen lässt.
- **Ein Netzwerkstatus-Banner.** Kommen keine Blöcke mehr an, sagt QoreX das, anhand der eigenen Blockzeiten der Chain. Solange das Netzwerk in Ordnung ist, sagt es nichts.
- **Pflege des Post-Quanten-Schlüssels.** Kann der Eintrag des Post-Quanten-Schlüssels eines Kontos nicht mehr signieren, bietet QoreX an, ihn erneut zu registrieren (nie automatisch, zweimal tippen). Du kannst außerdem den ML-DSA-87-Schlüssel aus deiner Wiederherstellungsphrase rotieren und ein Post-Quanten-**Multisig**-Konto erstellen, mitsignieren und davon senden.
- **Entwicklermodus.** Ein Schalter (standardmäßig aus), der 17 Werkzeuge hinzufügt: Inspektoren, einen Transaktionssimulator, Prüfung von Verträgen und Bereitstellungen, Rollup-Profile, Offline- und Multisig-Signieren und einen Ort, an dem KI-Agenten Transaktionen vorschlagen, die du freigibst. Nichts darin ändert eine Signierregel. Siehe [Entwicklermodus](/qorex/developer-mode).
- **Netzwerkfunktionen nur im Testnet.** Das Senden an eine andere Chain über IBC, ein QoreChain-Bridge-Bildschirm und Solana auf QoreChain gibt es nur im Testnet. Siehe [Testnet-Funktionen](/qorex/testnet-features).
- **Kleiner Fußabdruck.** Die Erweiterung verlangt vom Browser eine einzige API-Berechtigung, `storage`, und enthält keinen Analyse- oder Tracking-Code. Push teilt dem Server nur deine öffentlichen Adressen mit, und die Benachrichtigung sagt nur „QOR received“.

## So nutzt du es {#how-to-use}

1. Installiere QoreX über einen offiziellen Store-Eintrag (siehe [So erhältst du Zugang](#how-to-access)).
2. Erstelle eine Wallet oder stelle eine wieder her: [Erste Schritte](/qorex/getting-started) für die mobile App, [Browser-Erweiterung](/qorex/browser-extension#wallet) für die Erweiterung.
3. Schreibe die 24 Wörter auf, wähle dann **Was möchtest du zuerst tun?** (Geld empfangen, Geld senden oder meine Krypto sicher aufbewahren) und folge den Schritten: [Erster Start](/qorex/getting-started#first-run). Danach sende und empfange QOR: [Senden & Empfangen](/qorex/send-and-receive).
4. Staking: [Portfolio & Staking](/qorex/portfolio-and-staking). Richte dein Sicherheitsnetz ein: [Sicherheit & Wiederherstellung](/qorex/security-and-recovery).
5. Um eine Website mit QoreX zu nutzen, öffne sie in der Erweiterung (Desktop) oder im [dApp-Browser](/qorex/dapp-browser) der App. Jede Verbindung und jede Signatur ist eine Freigabe, die du erteilst.

## So erhältst du Zugang {#how-to-access}

- **Netzwerke:** Mainnet `qorechain-vladi` (Standard) und Testnet `qorechain-diana`. Auf dem Handy findest du das Testnet unter **Einstellungen → Testnet verwenden (Entwickler)**. In der Erweiterung schaltest du zuerst den Entwicklermodus ein (tippe siebenmal auf die Versionsnummer unten im Popup) und wählst dann **Zum Testnet (diana) wechseln**. Solange du im Testnet bist, zeigt jeder Bildschirm ein gelbes **TESTNET**-Banner.
- **Konto erforderlich:** keines. Die Anmeldung (E-Mail, Apple oder Google) ist optional und nur nötig, um einen @handle zu beanspruchen, das Dashboard zu verknüpfen und die kontobasierten Zahlungsanforderungen in der App zu verwenden. Signierte Zahlungslinks benötigen kein Konto.
- **Voraussetzungen:** Auf dem Handy eine Gerätesperre (Face ID oder Touch ID unter iOS; eine biometrische Methode der Klasse 3 oder eine Bildschirmsperr-PIN unter Android), sonst bleiben die Schaltflächen zum Erstellen und Importieren deaktiviert. In der Erweiterung ein Passwort.
- **Kosten:** QoreX ist kostenlos. Senden, Staking und das Öffnen eines EVM-Fensters zahlen die normale Netzwerkgebühr (die Netzwerk-Untergrenze liegt bei 0.1 uqor pro Gas).
- **Installiere immer über einen offiziellen Eintrag:**

| Build | Wo | Minimum |
|---|---|---|
| iOS-App | [App Store, QoreX](https://apps.apple.com/us/app/qorex-wallet/id6791256626) | iOS 15.1 |
| Android-App | [Google Play](https://play.google.com/store/apps/details?id=network.qore.qorex) | Android 7.0 |
| Chrome, Brave, Edge, Arc, Opera | [Chrome Web Store](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) | ein Chromium-Browser |
| Firefox | [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/qorex/) | Firefox 140 |
| Safari | [Mac App Store, QoreX Wallet](https://apps.apple.com/us/app/qorex-wallet/id6794132220) | macOS 12 |

## Wo es veröffentlicht ist {#where-published}

| Build | Eintrag und Paketname | Aktuelle Version | Link |
|---|---|---|---|
| iOS-App | App Store, **QoreX** (id 6791256626) | 1.2.5 | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6791256626) |
| Android-App | Google Play, `network.qore.qorex` | 1.2.5 | [play.google.com](https://play.google.com/store/apps/details?id=network.qore.qorex) |
| Chrome-Erweiterung | Chrome Web Store, **QoreX** | 0.4.5 | [chromewebstore.google.com](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) |
| Firefox-Erweiterung | Firefox Add-ons, `qorex` | 0.4.5 | [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/qorex/) |
| Safari-Erweiterung | Mac App Store, **QoreX Wallet** (id 6794132220) | App 1.8.1, Erweiterung 0.4.3 | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6794132220) |
| Developer-Kit | sechs npm-Pakete, siehe [Für Entwickler](#developers) | 0.1.0 | [QoreX-Integrationen](/developer-tools/qorex-integrations) |

Die Store-Prüfung läuft nach ihrem eigenen Zeitplan, sodass ein Store einen älteren Build ausliefern kann als ein anderer; siehe [Welche Version wo live ist](#versions). Der QoreX-Quellcode ist nicht öffentlich.

## Grenzen und bekannte Probleme {#limits}

- **Kein Versprechen über das Signierte hinaus.** Die hybride Signatur deckt Transaktionen der Native-Lane ab. EVM-Transaktionen tragen nur eine secp256k1-Signatur und werden nur zugelassen, solange ein EVM-Zugriffsfenster offen ist (nur mit **Ethereum-Konto hinzufügen (Coin 60)** hinzugefügte Konten können auf dieser Lane senden). SVM- und Überweisungen in externe Netzwerke sind nur klassisch signiert.
- **Nur mobil:** Portfolio, Q-Day Scanner, soziale Wiederherstellung, Legacy, Anmeldung, das Beanspruchen eines @handle und Geräteverknüpfung.
- **Swap ist nicht verfügbar.** Er bleibt aus, bis Pool-Liquidität vorhanden ist, und wird unter iOS nicht angezeigt.
- **Verknüpfte Signer** (Phantom oder MetaMask als verknüpfter Schlüssel mit Ausgabenlimits) sind in QoreX noch nicht verfügbar.
- **Nur Testnet:** das Senden an eine andere Chain über IBC, der QoreChain-Bridge-Bildschirm und Solana auf QoreChain. Nichts davon wird im Mainnet angeboten. Siehe [Testnet-Funktionen](/qorex/testnet-features).
- **KI-Agenten** (Entwicklermodus) können nicht signieren: Sie können nur eine Transaktion vorschlagen, die du freigibst. In der Erweiterung benötigen sie ein noch nicht veröffentlichtes Begleitprogramm auf deinem Computer, und in Safari sind sie nicht verfügbar. In der App fügst du einen Vorschlag ein oder öffnest einen Vorschlagslink. Siehe [Entwicklermodus](/qorex/developer-mode).
- **Wenn der Handle-Dienst ausfällt,** greift die Wallet auf einfache Adressen zurück; alles andere funktioniert weiter.
- Eine verlorene Wallet ohne aufgeschriebene Phrase und ohne soziale Wiederherstellung kann von niemandem wiederhergestellt werden.

## Plattform-Verfügbarkeit {#platform-availability}

| Funktion | Mobile App (Android & iOS) | Browser-Erweiterung |
|---|---|---|
| Wallet erstellen / importieren | ✅ (die App zeigt die Phrase beim Erstellen der Wallet nicht an - lasse sie dir unter Einstellungen → Sicherheit anzeigen) | ✅ (eigenständig; die Phrase wird einmal bei der Erstellung angezeigt, dann folgt eine kurze Backup-Prüfung) |
| Erster Start: **Was möchtest du zuerst tun?** | ✅ (nach der Tour; erneut über die Einstellungen) | ✅ (nach Erstellen oder Importieren; erneut über das Popup) |
| Backup-Prüfung (ein Quiz zu drei Wörtern deiner Phrase) | ✅ | ✅ |
| Mehrere Wallets, jede mit eigener Wiederherstellungsphrase | ✅ (Einstellungen → Wallets) | ✅ (**Wallets**, ein Passwort für alle) |
| Mehrere Konten aus einer Wiederherstellungsphrase | ✅ (bis zu 20 pro Wallet) | ✅ |
| Ethereum-artiges Konto (Coin 60), von Hand hinzugefügt | ✅ | ✅ |
| QOR senden & empfangen (hybrid signierte Native-Lane) | ✅ | ✅ (Senden mit Prüfschritt; Empfangen beginnt mit der Münze) |
| Auf jedem unterstützten Netzwerk empfangen | ✅ | ✅ |
| Einen @handle bezahlen | ✅ | ✅ |
| Einen @handle beanspruchen | ✅ (erfordert ein angemeldetes Konto) | - (die Erweiterung verweist dich auf die App) |
| Zahlungsanforderungen mit signierten Links und das Bezahlen einer solchen | ✅ | ✅ |
| Kontakte, Favoriten und **Zahlung wiederholen** | ✅ | ✅ |
| Verlauf je Konto (ausstehend, bestätigt, fehlgeschlagen) und CSV-Export | ✅ (Aktivität) | ✅ (**Verlauf**) |
| **Schutz meines Geldes** | ✅ | ✅ |
| **Hilfe** (offizielle Kanäle) | ✅ | ✅ |
| Netzwerkstatus-Banner | ✅ | ✅ |
| Automatische Sperre (Standard 15 Minuten) | ✅ (fragt erneut nach Biometrie oder PIN) | ✅ (fragt erneut nach deinem Passwort) |
| Staking: delegieren, entstaken, Einsatz verschieben, beanspruchen, beanspruchen & erneut staken, Sperren, wählen, wohin Belohnungen gehen | ✅ | ✅ (je ein eigener Bildschirm) |
| Reparatur und Rotation des Post-Quanten-Schlüssels | ✅ | ✅ |
| Post-Quanten-Multisig-Konten | ✅ | ✅ |
| Externe Netzwerke (Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis, Celestia + Token) | ✅ | ✅ (Senden aus dem Popup) |
| Token per Contract hinzufügen (EVM-Netzwerke) | ✅ | ✅ |
| EVM-Zugriffsfenster | ✅ | ✅ |
| Oberflächensprache (10 Sprachen) | ✅ (folgt dem Telefon) | ✅ (folgt dem Browser) |
| Portfolio, Q-Day Scanner, Social Recovery, Legacy | ✅ | - |
| Suche, Einführungstour beim ersten Start, Home-Bildschirm-Widget, Push-Benachrichtigungen | ✅ | - |
| dApp-Verbindungen | ✅ (integrierter Browser, je Website widerrufbar, Favoriten und zuletzt besuchte Websites) | ✅ (jede Website; **Verbundene Websites** mit Widerrufen) |
| Entwicklermodus (17 Werkzeuge) | ✅ (ein Tab **Entwickler** in der unteren Leiste) | ✅ (eine Schaltfläche **Entwicklerwerkzeuge**) |
| KI-Agenten, die Transaktionen vorschlagen (Entwicklermodus) | ✅ (Vorschlag einfügen oder Vorschlagslink öffnen) | Begleitprogramm erforderlich (noch nicht veröffentlicht); nicht in Safari |
| An eine andere Chain senden (IBC), QoreChain-Bridge-Bildschirm, Solana auf QoreChain | nur Testnet | nur Testnet |
| Swap | Nur Android, deaktiviert bis Pool-Liquidität vorhanden ist (unter iOS nicht angezeigt) | - |
| Konto-Anmeldung | ✅ | - |
| Verknüpfung mehrerer Geräte | ✅ | - |
| Dashboard-Kopplung | ✅ | ✅ (Verbinden + vorgeschlagene Überweisungen, inkl. Staking) |

## Erste Schritte

- Neu bei QoreX? Beginne mit [Erste Schritte](/qorex/getting-started), um deine Wallet zu erstellen oder wiederherzustellen.
- Lerne anschließend, QOR auf der hybrid signierten Native-Lane zu [Senden & Empfangen](/qorex/send-and-receive).
- Richte dein Sicherheitsnetz unter [Sicherheit & Wiederherstellung](/qorex/security-and-recovery) ein.
- Installiere auf dem Desktop die [Browser-Erweiterung](/qorex/browser-extension).

## Download & Verfügbarkeit {#availability}

Installiere über die offiziellen Einträge unter [So erhältst du Zugang](#how-to-access). Die Android-App benötigt Android 7.0 oder neuer, die iOS-App iOS 15.1 oder neuer, die Firefox-Erweiterung Firefox 140 oder neuer und die Safari-Erweiterung macOS 12 oder neuer.

## Welche Version wo live ist {#versions}

:::note
Versionsstand, geprüft am 27. November 2026. Die Apps 1.2.5 für iPhone und Android sowie die Erweiterungen 0.4.5 für Chrome und Firefox sind verfügbar. Safari 1.8.2 mit der Erweiterung 0.4.5 ist in der Store-Prüfung: In Safari kommen die Funktionen, die dieses Handbuch für 0.4.5 beschreibt, sobald der Mac App Store das Update anbietet. Die Webseite hinter geteilten Zahlungslinks ist online; siehe [Einen Zahlungslink ohne die App öffnen](/qorex/send-and-receive#pay-web).
:::

Die Store-Prüfung läuft nach ihrem eigenen Zeitplan, sodass ein Store eine Weile einen älteren Build ausliefern kann als ein anderer. Dies ist die aktuelle Version **in jedem Store**:

| Store | Aktuelle Version | Hinweis |
|---|---|---|
| Apple App Store (iOS) | 1.2.5 | |
| Google Play (Android) | 1.2.5 | |
| Chrome Web Store | 0.4.5 | |
| Firefox Add-ons | 0.4.5 | |
| Safari (Mac App Store) | 1.8.1, mit Erweiterung 0.4.3 | der Mac App Store verwendet eine eigene `1.x`-Nummerierung |

Die Stores zeigen immer ihre aktuelle Version an, und ein Store, der noch einen älteren Build ausliefert, schließt automatisch auf.

### Was die Builds 1.2.5 / 0.4.5 hinzufügen {#whats-new-125}

Für den Alltagsgebrauch (App und Erweiterung, Mainnet und Testnet, sofern nicht anders angegeben):

- **Erster Start mit Ziel.** Nach der Tour führt dich **Was möchtest du zuerst tun?** zum Empfangen, Senden oder sicheren Aufbewahren deiner Krypto, mit einer kurzen Backup-Prüfung. Überspringbar und erneut aufrufbar. Siehe [Erster Start](/qorex/getting-started#first-run).
- **Zahlungsanforderungen mit signierten Links** und das Bezahlen über einen Link. Eine Anforderung wird als bezahlt markiert, wenn die Chain es zeigt.
- **Kontakte und Favoriten**, mit **Zahlung wiederholen** und einer Warnung bei ähnlich aussehenden Adressen.
- **Ein klarerer Verlauf**: ausstehend, bestätigt oder fehlgeschlagen, je Konto, mit CSV-Export.
- **Schutz meines Geldes**: Backup, Wiederherstellungstest, Vertrauenspersonen (App), verbundene Websites, Berechtigungen und Token-Freigaben mit Widerrufen sowie eine verständliche Erklärung, welche Signaturen auf welcher Lane Post-Quanten-Signaturen sind.
- **Sicherere EVM-Zugriffsfenster.** Ein selbst geöffnetes Fenster ist standardmäßig auf **Nur QOR-Überweisungen** gesetzt; jeden Vertrag zuzulassen ist eine eigene Wahl mit Warnung. Freigaben nennen jeden Vertrag, den ein Fenster erlaubt, und sagen, wann ein neues Fenster das offene ersetzt. Kann ein Node nicht prüfen, was ein Aufruf mit deinen Token macht, sagt QoreX das und verlangt ein zweites Tippen.
- **Hilfe in der App** (**Hilfe**): nur die offiziellen Kanäle, dazu der Hinweis, dass das QoreX-Team nie nach deiner Phrase fragt.
- **Ein Netzwerkstatus-Banner**, wenn keine Blöcke mehr ankommen, und die **Staking-Periode** (die Zeit, bis entstaktes QOR wieder bewegt werden kann) wird aus dem Netzwerk gelesen, statt eine feste Zahl zu sein.
- **Erweiterung: Eine Signaturanfrage einer Website, während QoreX gesperrt ist**, öffnet den Passwortbildschirm und nennt die Website; nach dem Entsperren zeigt die Anfrage ihre eigene Freigabe.
- **App: Favoriten und zuletzt besuchte Websites** auf der Startseite des dApp-Browsers.
- **Pflege des Post-Quanten-Schlüssels**: **Schlüssel erneut registrieren** für einen Schlüsseleintrag, der nicht mehr signieren kann (nie automatisch, zweimal tippen), **Post-Quanten-Schlüssel rotieren** aus deiner Wiederherstellungsphrase und vollständige Multisig-Konten (erstellen, per Datei oder durch Einfügen mitsignieren, senden).
- **Empfangen** bietet auch die per Vertrag hinzugefügten Token an, mit der Adresse ihres Netzwerks.
- **Empfangen** zeigt für Cosmos Hub, Osmosis und Celestia die Adresse, mit der deine Überweisungen in diesen Netzwerken signieren.
- **Entwicklermodus** mit 17 Werkzeugen. Siehe [Entwicklermodus](/qorex/developer-mode).
- **Nur Testnet:** an eine andere Chain über IBC senden, ein QoreChain-Bridge-Bildschirm und Solana auf QoreChain. Siehe [Testnet-Funktionen](/qorex/testnet-features).
- **Für Websites:** QoreX lehnt jetzt von jeder Website eine dauerhafte Berechtigung ab (einen authz-Grant für `MsgGrant` oder `MsgExec`), die es jemand anderem erlauben würde, als dein Konto zu handeln. Siehe [dApp-Integration](/qorex/dapp-integration).

Was die Builds 1.2.4 / 0.4.3 für dich geändert haben:

- **Entsperren der Erweiterung.** Die Eingabetaste entsperrt, die Schaltfläche zeigt, dass sie arbeitet, **Falsches Passwort.** erscheint nur bei falschem Passwort, und jeder andere Fehler wird benannt.
- **Vertragsaufrufe erhalten genug Gas.** Die CosmWasm- oder Cross-VM-Transaktion einer Website wird vor der Freigabe simuliert, und ein Aufruf, den der Vertrag ablehnen würde, wird abgelehnt, bevor du ihn siehst.
- **Gaspreise folgen dem Netzwerk**, und eine Transaktion über dem Gaslimit je Transaktion des Netzwerks wird abgelehnt, bevor etwas signiert wird.
- **Solana-Freigaben** markieren eine Anweisung, die QoreX nicht dekodieren kann, als unlesbar und verlangen ein zweites Tippen; ein Memo zeigt seinen Text.
- **Ein Post-Quanten-Schlüssel, der nicht mehr signieren kann, wird als solcher benannt**, statt als „von einer anderen Wallet registriert“.
- **Eine Website kann dein EVM-Fenster nicht mehr schließen oder seine Zustimmung löschen**; beides erledigst du in den eigenen Bildschirmen von QoreX.
- Der **Staking-Ertrag** wird aus der eigenen Angabe der Chain gelesen, und die **Nutzung des EVM-Fensters** erscheint im Verlauf.
- **Firefox:** github.com lädt mit installiertem QoreX wieder normal.

Was die Builds 1.2.3 / 0.4.2 für dich geändert haben:

- **Empfangen beginnt mit der Münze.** Eine durchsuchbare Liste mit QOR zuerst, dann die eigene Münze jedes Netzwerks und die mitgelieferten Token, jeweils mit Bild. Die Auswahl zeigt Adresse und QR-Code für dieses Netzwerk, mit einer Warnung, die die Münze nennt.
- **Konten, die kein EVM-Fenster nutzen können, erfahren, was als Nächstes zu tun ist**, mit einer Schaltfläche zu **Deine Konten**.
- **Die Bildschirme für Staking und das EVM-Fenster sagen, wann deine erste Transaktion auch deinen Schlüssel registriert.**

Was die Builds 1.2.2 / 0.4.1 für dich geändert haben:

- Die QOR-Seite listet jede Transaktion des Kontos, ein- und ausgehend, mit **Mehr anzeigen**.
- **Senden funktioniert auf BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche und Celestia** (und mit deren Token), wie auf Ethereum, Solana, Cosmos Hub und Osmosis.
- Freigabebildschirme lesen Ausgabenregeln und EVM-Aufrufdaten und bieten die vollständige Nachricht an. Nachrichten, die die Schlüssel oder Befugnisse eines Kontos verwalten, können nur in den eigenen Bildschirmen von QoreX signiert werden.
- Die Prüfansicht der ersten Überweisung zeigt die einmalige Gebühr für die Schlüsselregistrierung und die Gesamtsumme.

Was der Build 1.2.1 (App) für dich geändert hat: Ein Link kann eine Seite im dApp-Browser öffnen (nach der üblichen biometrischen Abfrage), die Freigabefenster zeigen das Memo einer Transaktion, und die App teilt Websites ihre Signierfähigkeiten mit. Die vom Dashboard ausgegebenen Links, die mit `qorex://` beginnen, funktionieren wieder.

Was die Builds 1.2.0 / 0.4.0 für dich geändert haben:

- **Automatische Sperre** (1, 5, 15, 30, 60 oder 240 Minuten; Standard 15) und eine Schaltfläche **Sperren** in der Erweiterung.
- **Eine Prüfansicht vor jeder Überweisung** in der Erweiterung und eine Warnung, wenn eine Adresse einer früher bezahlten nur ähnelt.
- **Verlauf je Konto** mit jeder Art von QoreChain-Transaktion.
- **Die Staking-Bildschirme** der Erweiterung sind getrennt (QOR staken, Entstaken, Einsatz verschieben, Abholen, Beanspruchen & erneut staken, Für einen Bonus sperren, Belohnungen gehen an), **Einsatz verschieben** läuft in drei Schritten und fängt Verschiebungen ab, die das Netzwerk ablehnen würde, und du kannst **wählen, wohin Staking-Belohnungen gehen** (ein anderes Konto derselben Wallet).
- **EVM-dApps signieren über QoreX** (`personal_sign`, typisierte Daten und Transaktionen), mit dem dekodierten Risiko jeder Anfrage und einer Simulation vor dem Signieren.
- **Zuletzt bekannte Werte** werden angezeigt und als solche gekennzeichnet, wenn das Netzwerk nicht antwortet.
- Eine Warnung, wenn die Gebühr höher ist als der bewegte Wert.

Was die Builds 1.1.9 / 0.3.9 hinzugefügt haben (in jedem aktuellen Build enthalten):

- **Staking-Sperren.** Sperre einen Teil deines Stakes für 3, 6 oder 12 Monate. Der angezeigte Bonus ist der Bonus, den die Sperre heute einbringt, unter der Obergrenze des Netzwerks. Das vorzeitige Entsperren liegt hinter einer zweiten Bestätigung, die die Kosten nennt, und **Unstake** und **Stake verschieben** sind auf den entsperrten Teil beschränkt. Der Stufenplan ist mit „bis zu“ gekennzeichnet, mit dem heutigen Wert daneben. Siehe [Portfolio & Staking](/qorex/portfolio-and-staking#staking-locks).
- **IBC-Transfer-Memos in einfachen Worten** bei Freigaben.
- **Staking von aus MetaMask importierten Konten (Coin 60)** in der Erweiterung.

Was die Builds 1.1.8 / 0.3.8 für dich geändert haben:

- **MetaMask auf QoreChain, gleich von der ersten Seite an.** Öffne, prüfe und schließe das EVM-Zugriffsfenster, das MetaMask braucht, und sieh, was davon noch übrig ist.
- **Strengere Signaturprüfungen.** QoreX verifiziert die ML-DSA-87-Signatur einer App gegen den registrierten Schlüssel deines Kontos und sagt deutlich, wenn dieser Schlüssel von einer anderen Wallet registriert wurde.
- **Korrekturen für gemeldete Sicherheitsprobleme.**

Was die Builds 1.1.7 / 0.3.7 für dich geändert haben (in 1.1.8 / 0.3.8 enthalten):

- **Freigaben lehnen eine Anfrage ab, deren Bytes auf zwei Arten gelesen werden können.** Taucht dasselbe Feld in einer Anfrage zweimal auf, könnten ein Bildschirm und die Chain darüber uneins sein, was signiert wird - zum Beispiel eine Gebühr oder ein Betrag, der anders angezeigt wird als der ausgeführte. QoreX lehnt eine solche Anfrage jetzt ab, statt eine Lesart davon anzuzeigen. Siehe [Was das Freigabefenster zeigt](/qorex/security-and-recovery#approvals).
- **Das Ablaufdatum einer Berechtigung wird sekundengenau angezeigt**, und Governance-Abstimmungen werden dekodiert und auf dem Freigabebildschirm angezeigt.
- **Websites werden anhand der Origin identifiziert, die der Browser selbst bestätigt**, nicht anhand dessen, was eine Anfrage über sich selbst behauptet.
- **@handle-Abfragen funktionieren in der Erweiterung wieder.**
- **Das Beanspruchen eines @handle erfordert ein angemeldetes Konto und erfolgt in der App**; die Erweiterung verweist dich dorthin.
- **Zum Verwechseln ähnliche QoreChain-Namen sind reserviert**, sodass ein neuer Handle das Projekt oder seine Mitarbeitenden nicht nachahmen kann.

Highlights seit 1.0.9 / 0.2.6:

- **Mehrere Wallets** auf einem Telefon oder in einem Browser, jede mit eigener Wiederherstellungsphrase und Umschalten mit einem Tipp - siehe [Mehrere Wallets](/qorex/getting-started#several-wallets).
- **Ethereum-artiges Konto (Coin 60)**, von Hand hinzugefügt, für Phrasen, die zuerst in MetaMask oder im Dashboard verwendet wurden - siehe [Eine Phrase aus MetaMask oder dem Dashboard wiederherstellen](/qorex/getting-started#restore-dashboard).
- **Token per Contract hinzufügen**, **Auf jedem Netzwerk empfangen**, globale **Suche**, eine **Tour** beim ersten Start, ein **Home-Bildschirm-Widget** und **Push-Benachrichtigungen**, wenn QOR eintrifft (mobil) - siehe [Senden & Empfangen](/qorex/send-and-receive).
- **Beanspruchen & erneut staken**, eine Gebührenprüfung vor dem Beanspruchen, eine Liste **Unstaking läuft** und Warnungen, bevor du so staket, dass du dir die Möglichkeit zum Unstaken selbst verbaust - siehe [Portfolio & Staking](/qorex/portfolio-and-staking).
- Freigabe-Bildschirme, die jede Nachricht, die Gebühr, Ausgabenlimits und den Ablauf anzeigen und ablehnen, was QoreX nicht darstellen kann; **`signAndBroadcast`** für dApps; **Verbundene Websites** mit Widerrufen (Erweiterung); das **EVM-Zugriffsfenster** - siehe [Sicherheit & Wiederherstellung](/qorex/security-and-recovery) und die [Browser-Erweiterung](/qorex/browser-extension).
- Korrekturen: Ein finanziertes Konto konnte kurzzeitig aus „Deine Konten“ verschwinden (1.0.9); die Android-Hardware-Zurück-Taste geht jetzt einen Bildschirm zurück (1.1.1); die Wiederherstellungsphrase wird unter Android 14 und neuer Nicht-Bedienungshilfen-Diensten vorenthalten (1.1.6).

QoreX arbeitet auf dem Mainnet `qorechain-vladi` (live seit dem 7. Juni 2026), das seit dem 18. November 2026 mit Chain **v3.2.8** läuft (v3.2.7 seit dem 12. November 2026, v3.2.6 seit dem 4. November 2026, v3.2.5 seit dem 29. Oktober 2026, v3.2.4 seit dem 23. Oktober 2026). Signaturformat, Adressen, Dezimalstellen und Memos ändern sich bei diesen Upgrades nicht. QoreX 1.2.4 / 0.4.3 hat die Behandlung der v3.2.8-Regeln ergänzt (Reichweite des EVM-Fensters, Gaslimits und Gaspreis des Netzwerks), halte QoreX also aktuell.

## Für Entwickler {#developers}

Um eine Website mit QoreX zu verbinden (Wallet-Erkennung, Provider, Signieren, Links und Fehler), beginne mit der [dApp-Integration](/qorex/dapp-integration); die in die Wallet eingebauten Werkzeuge für Entwickler findest du unter [Entwicklermodus](/qorex/developer-mode). Um QoreX aus deiner eigenen App zu integrieren, kannst du auch das QoreX-Developer-Kit verwenden: sechs npm-Pakete, veröffentlicht in Version 0.1.0. Ihre Installationsbefehle, Beispiele und Grenzen findest du unter [QoreX-Integrationen](/developer-tools/qorex-integrations). Für die Wallet-Erkennung und das Signieren in einer Web-App siehe außerdem den [Wallet-Adapter](/developer-tools/wallet-adapter) und, für den Browser-Provider, den QoreX einbindet, die [Browser-Erweiterung](/qorex/browser-extension#standards).

## Was QoreX über das Netzwerk sendet {#data-and-privacy}

QoreX hat **keine Analyse, keine Absturzberichte und kein Tracking-SDK**. Deine Schlüssel, deine Wiederherstellungsphrase, der Tresor und deine Freigaben **verlassen das Gerät niemals**. Die Apps sprechen mit dem Netzwerk, wie es jede Wallet muss; dies ist die vollständige Liste.

**Immer (nötig, um Kontostände anzuzeigen und zu senden):**

- **Öffentliche QoreChain-Endpunkte** (`api`, `rpc`, `evm` und `svm` auf `qore.host` sowie die `-testnet`-Entsprechungen) für Kontostände, Verlauf und das Broadcasten. Diese Anfragen enthalten deine **öffentliche** `qor1…`-Adresse.
- **Preisabfrage** - eine Anfrage für den QOR-Preis, die **keine Adresse** enthält.
- **Externe Netzwerke, die du hältst oder ansiehst** - öffentliche RPC-/REST-Dienste Dritter für dieses Netzwerk, die deine **öffentliche** Adresse in diesem Netzwerk enthalten.
- **@handle-Registry** - enthält den Handle, den du nachschlägst, oder eine öffentliche Adresse.

**Nur wenn du es einschaltest:**

- **Push-Benachrichtigungen** (mobil) - aus, bis du sie aktivierst. Der Server erhält dann dein Geräte-Token und die öffentlichen `qor1…`-Adressen der verwendeten Wallet (bis zu 10). Ein Gerät, von dem der Server 90 Tage nichts gehört hat, wird vergessen.
- **Soziale Wiederherstellung** - das Relay speichert **nur Chiffretext**.
- **Anmeldung** (E-Mail oder Apple oder Google) - nötig, um einen @handle zu beanspruchen, um das Dashboard zu verknüpfen und um die kontobasierten Zahlungsanforderungen in der App zu verwenden.
- **Dashboard-Verbindung und verknüpfte Adressen** - sendet einen signierten Nachweis, dass dir die Adresse gehört.
- **Kontobasierte Zahlungsanforderungen** (an ein @handle, in der App) - senden den Absender-Handle, den Empfänger-Handle, den Betrag und eine optionale Notiz. Ein **signierter Zahlungslink** wird auf deinem Gerät erstellt und signiert; ob er bezahlt wurde, wird aus den öffentlichen QoreChain-Endpunkten gelesen.
- **Q-Day-Scanner bei einer Bitcoin-Adresse** - fragt einen von Dritten betriebenen Dienst ab, der diese Adresse und deine IP-Adresse sieht. QoreX nennt ihn und scannt erst, nachdem du zugestimmt hast.

**Das Home-Bildschirm-Widget** stellt von sich aus keine Anfrage an QoreChain-Server: Die App übergibt ihm deine Adresse, den Kontostand und das Datenschutz-Flag lokal, und das Widget aktualisiert den Kontostand über den öffentlichen QoreChain-REST-Endpunkt.

**Nur auf dem Gerät gespeichert:** Kontakte, die Favoriten und zuletzt besuchten dApp-Websites deiner App (ohne Query oder Fragment der Adresse gespeichert), der von dir erstellte Verlaufsexport sowie der Wiederherstellungstest und die Backup-Prüfung (die eingegebenen Wörter werden weder gespeichert noch gesendet). Das **Netzwerkstatus**-Banner liest den neuesten Block aus den öffentlichen QoreChain-Endpunkten, nicht aus einem separaten Statusdienst.

In keiner der beiden Apps gibt es **einen KI-Chat oder einen QCAI-Dienst**. Mit dem Werkzeug **KI-Agenten** im Entwicklermodus kann ein KI-Assistent, den du selbst betreibst, QoreX Transaktionen vorschlagen; QoreX hat darin keinen eigenen KI-Dienst, und nichts wird ohne deine Freigabe signiert.
