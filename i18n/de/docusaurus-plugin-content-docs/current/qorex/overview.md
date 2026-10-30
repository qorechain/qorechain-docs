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
- **EVM-Zugriffsfenster.** Oberhalb von Chain v3.2.0 wird eine EVM-Transaktion nur zugelassen, solange das Konto ein offenes Fenster hat: eine hybrid signierte `MsgOpenEVMWindow`, begrenzt durch Transaktionsanzahl, Wert und Ablauf. QoreX öffnet, zeigt und schließt es.
- **Handles mit Pinning.** Ein @handle wird durch eine ed25519-Attestierung der Registry plus die eigene secp256k1-Signatur des Eigentümers an eine `qor1…`-Adresse gebunden. QoreX merkt sich die Adresse, die es zuerst aufgelöst hat, und meldet eine stille Änderung.
- **Wiederherstellung ohne Unternehmen.** Die soziale Wiederherstellung teilt den Seed in verschlüsselte, mit ML-KEM versiegelte Anteile auf (2 von 3 Guardians), mit einer 48-Stunden-Zeitsperre, die dich benachrichtigt; Legacy ist ein Dead-Man-Switch über deine Guardians; die Geräteverknüpfung überträgt eine Wallet mit einem Einmalcode und einem QR-Code, der allein nutzlos ist. Siehe [Sicherheit & Wiederherstellung](/qorex/security-and-recovery).
- **Kleiner Fußabdruck.** Die Erweiterung verlangt vom Browser eine einzige API-Berechtigung, `storage`, und enthält keinen Analyse- oder Tracking-Code. Push teilt dem Server nur deine öffentlichen Adressen mit, und die Benachrichtigung sagt nur „QOR received“.

## So nutzt du es {#how-to-use}

1. Installiere QoreX über einen offiziellen Store-Eintrag (siehe [So erhältst du Zugang](#how-to-access)).
2. Erstelle eine Wallet oder stelle eine wieder her: [Erste Schritte](/qorex/getting-started) für die mobile App, [Browser-Erweiterung](/qorex/browser-extension#wallet) für die Erweiterung.
3. Schreibe die 24 Wörter auf, dann sende und empfange QOR: [Senden & Empfangen](/qorex/send-and-receive).
4. Staking: [Portfolio & Staking](/qorex/portfolio-and-staking). Richte dein Sicherheitsnetz ein: [Sicherheit & Wiederherstellung](/qorex/security-and-recovery).
5. Um eine Website mit QoreX zu nutzen, öffne sie in der Erweiterung (Desktop) oder im [dApp-Browser](/qorex/dapp-browser) der App. Jede Verbindung und jede Signatur ist eine Freigabe, die du erteilst.

## So erhältst du Zugang {#how-to-access}

- **Netzwerke:** Mainnet `qorechain-vladi` (Standard) und Testnet `qorechain-diana`. Auf dem Handy findest du das Testnet unter **Einstellungen → Testnet verwenden (Entwickler)**.
- **Konto erforderlich:** keines. Die Anmeldung (E-Mail, Apple oder Google) ist optional und nur nötig, um einen @handle zu beanspruchen, das Dashboard zu verknüpfen und Zahlungsanfragen zu verwenden.
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

| Build | Eintrag und Paketname | Aktuelle Version (27. Okt. 2026) | Link |
|---|---|---|---|
| iOS-App | App Store, **QoreX** (id 6791256626) | 1.1.8 | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6791256626) |
| Android-App | Google Play, `network.qore.qorex` | 1.1.9 | [play.google.com](https://play.google.com/store/apps/details?id=network.qore.qorex) |
| Chrome-Erweiterung | Chrome Web Store, **QoreX** | 0.3.8 | [chromewebstore.google.com](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) |
| Firefox-Erweiterung | Firefox Add-ons, `qorex` | 0.3.9 | [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/qorex/) |
| Safari-Erweiterung | Mac App Store, **QoreX Wallet** (id 6794132220) | App 1.7.8, Erweiterung 0.3.8 | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6794132220) |
| Developer-Kit | sechs npm-Pakete, siehe [Für Entwickler](#developers) | 0.1.0 | [QoreX-Integrationen](/developer-tools/qorex-integrations) |

Die Store-Prüfung läuft nach ihrem eigenen Zeitplan, sodass ein Store einen älteren Build ausliefern kann als ein anderer; siehe [Welche Version wo live ist](#versions). Der QoreX-Quellcode ist nicht öffentlich.

## Grenzen und bekannte Probleme {#limits}

- **Kein Versprechen über das Signierte hinaus.** Die hybride Signatur deckt Transaktionen der Native-Lane ab. EVM-Transaktionen tragen nur eine secp256k1-Signatur und werden nur zugelassen, solange ein EVM-Zugriffsfenster offen ist. SVM- und Überweisungen in externe Netzwerke sind nur klassisch signiert.
- **Der EVM-Provider der Erweiterung beantwortet nur Konto- und Netzwerkabfragen.** Er signiert noch keine EVM-Transaktionen oder Nachrichten. Das Signieren von Nachrichten (`signArbitrary`) wird nicht ausgeliefert.
- **Nur mobil:** Portfolio, Q-Day Scanner, soziale Wiederherstellung, Legacy, Zahlungsanfragen, Anmeldung und Geräteverknüpfung.
- **Swap ist nicht verfügbar.** Er bleibt aus, bis Pool-Liquidität vorhanden ist, und wird unter iOS nicht angezeigt.
- **Verknüpfte Signer** (Phantom oder MetaMask als verknüpfter Schlüssel mit Ausgabenlimits) sind in QoreX noch nicht verfügbar.
- **Schlüsselrotation** für deinen ML-DSA-87-Schlüssel ist in QoreX noch nicht verfügbar.
- **Wenn der Handle-Dienst ausfällt,** greift die Wallet auf einfache Adressen zurück; alles andere funktioniert weiter.
- Eine verlorene Wallet ohne aufgeschriebene Phrase und ohne soziale Wiederherstellung kann von niemandem wiederhergestellt werden.

## Plattform-Verfügbarkeit {#platform-availability}

| Funktion | Mobile App (Android & iOS) | Browser-Erweiterung |
|---|---|---|
| Wallet erstellen / importieren | ✅ (die App zeigt die Phrase beim Erstellen der Wallet nicht an - lasse sie dir unter Einstellungen → Sicherheit anzeigen) | ✅ (eigenständig; die Phrase wird einmal bei der Erstellung angezeigt) |
| Mehrere Wallets, jede mit eigener Wiederherstellungsphrase | ✅ (Einstellungen → Wallets) | ✅ (**Wallets**, ein Passwort für alle) |
| Mehrere Konten aus einer Wiederherstellungsphrase | ✅ (bis zu 20 pro Wallet) | ✅ |
| Ethereum-artiges Konto (Coin 60), von Hand hinzugefügt | ✅ | ✅ |
| QOR senden & empfangen (hybrid signierte Native-Lane) | ✅ | ✅ (Senden; Empfangen mit QR) |
| Auf jedem unterstützten Netzwerk empfangen | ✅ | ✅ |
| Einen @handle bezahlen | ✅ | ✅ |
| Einen @handle beanspruchen | ✅ (erfordert ein angemeldetes Konto) | - (die Erweiterung verweist dich auf die App) |
| Staking: delegieren, Delegierung aufheben, Stake verschieben, beanspruchen, beanspruchen & erneut staken | ✅ | ✅ |
| Externe Netzwerke (Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis, Celestia + Token) | ✅ | ✅ (Senden aus dem Popup) |
| Token per Contract hinzufügen (EVM-Netzwerke) | ✅ | ✅ |
| EVM-Zugriffsfenster | ✅ | ✅ |
| Oberflächensprache (10 Sprachen) | ✅ (folgt dem Telefon) | ✅ (folgt dem Browser) |
| Portfolio, Q-Day Scanner, Social Recovery, Legacy | ✅ | - |
| Suche, Einführungstour beim ersten Start, Home-Bildschirm-Widget, Push-Benachrichtigungen | ✅ | - |
| dApp-Verbindungen | ✅ (integrierter Browser, auf die Sitzung beschränkt) | ✅ (jede Website; **Verbundene Websites** mit Widerrufen) |
| Swap | Nur Android, deaktiviert bis Pool-Liquidität vorhanden ist (unter iOS nicht angezeigt) | - |
| Konto-Anmeldung & Zahlungsanfragen | ✅ | - |
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

Die Store-Prüfung läuft nach ihrem eigenen Zeitplan, sodass ein Store eine Weile einen älteren Build ausliefern kann als ein anderer. Dies ist die aktuelle Version **in jedem Store** Stand **27. Oktober 2026**:

| Store | Aktuelle Version | Hinweis |
|---|---|---|
| Apple App Store (iOS) | 1.1.8 | am 21. Oktober veröffentlicht |
| Google Play (Android) | 1.1.9 | |
| Chrome Web Store | 0.3.8 | |
| Firefox Add-ons | 0.3.9 | |
| Safari (Mac App Store) | 1.7.8, mit Erweiterung 0.3.8 | der Mac App Store verwendet eine eigene `1.x`-Nummerierung |

Die Stores zeigen immer ihre aktuelle Version an, und ein Store, der noch einen älteren Build ausliefert, schließt automatisch auf. Builds, die ein Store noch nicht veröffentlicht hat, werden in diesem Handbuch nicht als verfügbar beschrieben.

Was die Builds 1.1.9 / 0.3.9 hinzufügen (heute Android 1.1.9 und die Firefox-Erweiterung 0.3.9; iOS, Chrome und Safari enthalten sie, sobald ihre Stores diese Builds ausliefern):

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

QoreX arbeitet auf dem Mainnet `qorechain-vladi` (live seit dem 7. Juni 2026), das seit dem 29. Oktober 2026 mit Chain **v3.2.5** läuft (v3.2.4 seit dem 23. Oktober 2026). Signaturformat, Adressen, Dezimalstellen, Memos und Gebühren ändern sich bei diesen Upgrades nicht, daher ist dafür kein QoreX-Update nötig.

## Für Entwickler {#developers}

Um QoreX aus deiner eigenen App zu integrieren, verwende das QoreX-Developer-Kit: sechs npm-Pakete, veröffentlicht in Version 0.1.0. Ihre Installationsbefehle, Beispiele und Grenzen findest du unter [QoreX-Integrationen](/developer-tools/qorex-integrations). Für die Wallet-Erkennung und das Signieren in einer Web-App siehe außerdem den [Wallet-Adapter](/developer-tools/wallet-adapter) und, für den Browser-Provider, den QoreX einbindet, die [Browser-Erweiterung](/qorex/browser-extension#standards).

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
- **Anmeldung** (E-Mail oder Apple oder Google) - nötig, um einen @handle zu beanspruchen, um das Dashboard zu verknüpfen und um Zahlungsanfragen zu verwenden.
- **Dashboard-Verbindung und verknüpfte Adressen** - sendet einen signierten Nachweis, dass dir die Adresse gehört.
- **Zahlungsanfragen** - senden den Absender-Handle, den Empfänger-Handle, den Betrag und eine optionale Notiz.

**Das Home-Bildschirm-Widget** stellt von sich aus keine Anfrage an QoreChain-Server: Die App übergibt ihm deine Adresse, den Kontostand und das Datenschutz-Flag lokal, und das Widget aktualisiert den Kontostand über den öffentlichen QoreChain-REST-Endpunkt.

In keiner der beiden Apps gibt es **einen KI-Chat oder einen QCAI-Dienst**.
