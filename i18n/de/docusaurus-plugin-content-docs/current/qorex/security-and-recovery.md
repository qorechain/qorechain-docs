---
slug: /qorex/security-and-recovery
title: Sicherheit & Wiederherstellung
sidebar_label: Sicherheit & Wiederherstellung
sidebar_position: 5
---

# Sicherheit & Wiederherstellung

Diese Seite erklärt, wie QoreX deine Schlüssel schützt und wie du eine Wallet zurückbekommst: die Schutzprüfung auf einem Bildschirm, der ML-DSA-87-Schlüssel und seine Pflege, Multisig-Konten, die soziale Wiederherstellung, Legacy, die Geräteverknüpfung, das EVM-Zugriffsfenster, was Genehmigungen anzeigen, die automatische Sperre, der Q-Day Scanner und wo du Hilfe bekommst. Sie richtet sich an alle QoreX-Nutzer; die meisten Wiederherstellungswerkzeuge befinden sich in der mobilen App, und der Text sagt, wo sich die Browser- oder die Safari-Erweiterung unterscheidet.

## Innovationen {#innovations}

- **Schutz meines Geldes.** Ein Bildschirm, der live dein Backup, deine verbundenen Websites, die on-chain erteilten Berechtigungen und deine Token-Freigaben prüft und dich widerrufen lässt. Siehe [Schutz meines Geldes](#protection).
- **Pflege des Post-Quanten-Schlüssels.** Rotiere den ML-DSA-87-Schlüssel aus deiner Wiederherstellungsphrase, repariere einen Eintrag, der nicht mehr signieren kann, und betreibe ein Post-Quanten-Multisig. Siehe [Schlüssel rotieren](#pqc-rotation), [Reparieren](#pqc-repair) und [Multisig-Konten](#multisig).
- **Soziale Wiederherstellung mit verschlüsselten Shares und einem Wiederherstellungs-Kit.** Guardians halten mit ML-KEM versiegelte Shares, aufgeteilt 2 von 3, und benötigen dein Wiederherstellungs-Kit, um die Wallet wiederherzustellen. Eine Wiederherstellung durchläuft eine 48-Stunden-Zeitsperre und warnt dich; du kannst abbrechen, und ein Abbruch kann nur verzögern, niemals Gelder bewegen.
- **Legacy.** Ein Totmannschalter über deinen Guardians, für einen Begünstigten deiner Wahl.
- **Geräteverknüpfung.** Ein einmaliger Code und ein QR-Code, niemals auf demselben Bildschirm. Der QR-Code allein ist Chiffretext hinter einer speicherintensiven Schlüsselableitung.
- **Deterministischer ML-DSA-87-Schlüssel.** Aus deiner Wiederherstellungsphrase abgeleitet (der erste Schlüssel ist `SHAKE256("qorechain:pqc:v1|" + address + "|" + mnemonic)`, und rotierte Schlüssel werden aus derselben Phrase abgeleitet), sodass der Schlüssel kein eigenes Backup braucht. Siehe [QoreSign](/qoresign/overview).
- **Begrenzter EVM-Zugriff.** Eine EVM-Transaktion wird nur zugelassen, solange ein Zugriffsfenster offen ist, begrenzt durch Transaktionsanzahl, Wert und Ablauf, und ein selbst geöffnetes Fenster lässt nur QOR-Überweisungen zu, wenn du nichts anderes wählst.
- **Genehmigungen, die ablehnen, was sie nicht lesen können.** Siehe [Was das Genehmigungsfenster zeigt](#approvals).
- **Q-Day Scanner.** Ein Expositionsbericht für jede Bitcoin- oder Ethereum-Adresse.

## Anwendung und wo du es findest {#how-to-use}

Das meiste Folgende befindet sich in der mobilen App unter **Einstellungen → Sicherheit**; **Schutz meines Geldes** und **Hilfe** liegen in den **Einstellungen**. In den Browser- und Safari-Erweiterungen hat die Popup-Startseite Schaltflächen für das EVM-Zugriffsfenster, Verbundene Websites, das Anzeigen der Wiederherstellungsphrase, Post-Quanten-Schlüssel rotieren, Multisig-Konten, Schutz meines Geldes und Hilfe sowie die Einstellung zur automatischen Sperre. Soziale Wiederherstellung, Legacy, Geräteverknüpfung und der Q-Day Scanner gibt es nur mobil. QoreX ist kostenlos und braucht dafür kein Konto; die Store-Links findest du in der [Übersicht](/qorex/overview#how-to-access).

Der Home-Tab zeigt außerdem eine **Backup-Health**-Karte, die so lange warnt, bis die soziale Wiederherstellung eingerichtet ist. Die Karte verfolgt nur die soziale Wiederherstellung: Sie kann nicht erkennen, ob du deine Wiederherstellungsphrase aufgeschrieben hast, also erledige das selbst (siehe unten).

## Schutz meines Geldes {#protection}

Ein Bildschirm, der die Frage beantwortet: „Ist mein Geld sicher, und wer kann für mich handeln?“. App: **Einstellungen → Schutz meines Geldes**. Erweiterung und Safari: **Schutz meines Geldes** auf der Popup-Startseite. Jede Zeile wird beim Öffnen geprüft, auf diesem Gerät und im Netzwerk; nichts wird angenommen. Kann etwas nicht gelesen werden, sagt QoreX *„Gerade nicht lesbar. Das heißt nicht, dass es keine gibt.“*

| Zeile | Was geprüft wird | Was du tun kannst |
|---|---|---|
| **Sicherung überprüft** und **Wiederherstellung getestet** | ob du nachgewiesen hast, dass du deine Wiederherstellungsphrase besitzt, und wann | **Meine Wiederherstellungsphrase testen**: Tippe drei Wörter deiner Phrase ein. Es ist ein Probelauf: Sie werden auf diesem Gerät verglichen, nichts Eingegebenes wird gespeichert oder gesendet, und nichts wird wiederhergestellt oder geändert. Falsche Wörter werden nicht vermerkt |
| **Vertrauenspersonen (soziale Wiederherstellung)** | ob Guardians eingerichtet sind, wie viele es sind und wie viele benötigt werden | richte sie unter [Soziale Wiederherstellung](#social-recovery) ein |
| **Apps mit Berechtigungen** | Websites, die deine Adresse sehen und dich um Signaturen bitten können (in der App die Websites des In-App-dApp-Browsers; in der Erweiterung die verbundenen Websites) | jede Website **widerrufen** |
| **Im Netzwerk erteilte Berechtigungen** | dauerhafte **authz-Grants** und **Gebührenfreigaben**, die dein Konto anderen erteilt hat, aus der Chain gelesen, unbegrenzte zuerst, mit Enddaten | **Widerrufen**: QoreX zeigt eine Prüfansicht mit der Netzwerkgebühr und signiert dann die Entfernung mit deiner hybriden Signatur |
| **ERC-20-Token-Freigaben** | Spender, die deine Token auf dem **EVM von QoreChain** bewegen dürfen | **Widerrufen**, was `approve(spender, 0)` sendet |

**Zu Token-Freigaben.** Tippe in der App auf **Token-Freigaben prüfen**; zum Lesen wird die Ethereum-Adresse dieser Wallet verwendet, wofür einmal deine Phrase nötig ist. Sie werden in Bereichen gelesen, die der Node akzeptiert, daher kann der Bildschirm *„Token-Freigaben bis Block \{from\} geprüft. Ältere könnten existieren: Öffne diesen Bildschirm erneut, um weiterzuprüfen.“* anzeigen. Zum Widerrufen öffnet QoreX zuerst ein **EVM-Fenster für eine Transaktion**, mit deinem Post-Quanten-Schlüssel signiert und auf den Token-Vertrag beschränkt, und sendet dann die EVM-Transaktion, die mit deinem klassischen Schlüssel signiert wird. Nur ein Konto im Ethereum-Stil (Coin 60) kann auf dem EVM von QoreChain senden, daher kann ein Coin-118-Konto hier keine EVM-Freigabe widerrufen, und QoreX sagt das.

**Post-Quanten-Schutz je Kanal.** Der Bildschirm erklärt in klaren Worten, welche Signaturen was schützen:

- **QoreChain (nativ):** Jede Transaktion trägt zwei Signaturen, eine Post-Quanten-Signatur (ML-DSA-87) und eine klassische, und das Netzwerk prüft beide.
- **QoreChain EVM:** EVM-Transaktionen werden klassisch signiert, wie in jeder EVM-Wallet. Das Netzwerk lässt sie nur innerhalb eines [Fensters](#evm-window) zu, das du mit deiner Post-Quanten-Signatur geöffnet hast, innerhalb der gewählten Limits.
- **Andere Netzwerke (Ethereum, Solana, Cosmos):** Sie akzeptieren nur klassische Signaturen. QoreX kann dort keinen Post-Quanten-Schutz hinzufügen.

## Jetzt sichern - niemand kann eine verlorene Wallet für dich wiederherstellen {#back-up-now}

:::danger Lies dies, bevor du deine Wallet mit Guthaben befüllst
QoreX ist **non-custodial**: Deine Schlüssel existieren ausschließlich auf deinem eigenen Gerät, und QoreChain Association besitzt weder eine Kopie davon noch einen Hauptschlüssel noch eine Möglichkeit, deine Wallet zurückzusetzen oder wiederherzustellen. **Es gibt keinen „Passwort vergessen“-Ablauf, kein Support-Ticket und keine kundendienstliche Umgehung** - verlierst du den Zugriff auf deine Schlüssel ohne vorhandenes Backup, sind die Mittel dauerhaft und unwiderruflich verloren. Das gilt für jede non-custodial Wallet, nicht nur für QoreX - aber es lohnt sich, es klar auszusprechen.

**Mach mindestens eines davon - direkt nach dem Erstellen deiner Wallet, nicht später:**

1. **Schreibe deine 24-Wörter-Wiederherstellungsphrase auf** und bewahre sie offline und dauerhaft auf (kein Screenshot, keine mit der Cloud synchronisierte Notiz, keine Nachricht an dich selbst). Sie ist das Einzige, das deine Wallet auf jedem Gerät und zu jeder Zeit wiederherstellen kann - auf Mobilgeräten zeigst du sie unter **Einstellungen → Sicherheit → Wiederherstellungsphrase anzeigen** an (die App zeigt sie **nicht** an, während sie die Wallet erstellt, du musst sie also selbst abrufen - tu das sofort); in der Erweiterung wird sie einmalig beim Erstellen der Wallet angezeigt und jederzeit über **Wiederherstellungsphrase anzeigen** im Popup. Siehe [Eine bestehende Wallet wiederherstellen](/qorex/getting-started#2-restore-an-existing-wallet).
2. **Richte [soziale Wiederherstellung](#social-recovery)** mit Guardians ein, denen du vertraust. So kannst du deine Wallet auch dann wiederherstellen, wenn du die Phrase verlierst - ohne dass ein einzelner Guardian jemals allein auf deine Gelder zugreifen könnte.

Beides zu tun ist die sicherste Option - die Phrase schützt dich, wenn du das Gerät wechselst oder die App nicht verfügbar ist; die Guardians schützen dich, wenn du die Phrase selbst verlierst.

**Das Deinstallieren der App löscht deine Schlüssel von diesem Gerät.** Der Vault der mobilen App und der Vault der Browser-Erweiterung existieren jeweils nur auf dem Gerät, das sie erzeugt hat. Das Deinstallieren der App, das Zurücksetzen des Telefons oder das Entfernen/Löschen der Erweiterung löscht diese Kopie - ohne Backup und ohne verknüpftes Gerät kann deine Wallet von niemandem wiederhergestellt werden, auch nicht von QoreChain. **Das Entfernen einer Wallet von einem Telefon oder einem Browser** (Einstellungen → Wallets → *Von diesem Telefon entfernen* bzw. *Aus diesem Browser entfernen* in der Erweiterung) löscht den Schlüssel dieser Wallet auf die gleiche Weise vom Gerät - deine Gelder bleiben on-chain, aber nur ihre Wiederherstellungsphrase kann sie zurückbringen.
:::

## ML-DSA-87-Schlüssel {#pqc-key}

Der Sicherheitsbildschirm zeigt den aktuellen On-Chain-Status deines ML-DSA-87-Schlüssels: **„Registrierung mit deiner ersten Überweisung“** → **„On-Chain registriert ✓“**. Der Algorithmus ist **ML-DSA-87** (deterministisch, hybrid mit secp256k1).

Websites können QoreX nicht auffordern, deinen ML-DSA-87-Schlüssel zu registrieren, zu migrieren oder zu rotieren. Die Registrierung erfolgt von selbst mit deiner ersten Überweisung und erfordert nichts von dir - seit v3.2.3 akzeptiert die Chain zur Registrierung außerdem einen optionalen *Besitznachweis (Proof of Possession)*, den QoreX in den aktuellen Store-Builds unsichtbar übernimmt. Du kannst den Schlüssel auch selbst [rotieren](#pqc-rotation) oder einen Eintrag [reparieren](#pqc-repair), der nicht mehr signieren kann. Den zugrunde liegenden Mechanismus findest du unter [Schlüsselrotation](/developer-guide/post-quantum-signing#key-rotation).

### Einen Schlüssel reparieren, der nicht mehr signieren kann {#pqc-repair}

In seltenen Fällen ist der Schlüsseleintrag, den das Netzwerk für dein Konto führt, **leer, nur klassisch oder degeneriert**, sodass von dem Konto nichts gesendet werden kann. QoreX unterscheidet die beiden Fälle: Ein von einer **anderen Wallet** registrierter Schlüssel wird als solcher gemeldet, während für einen Eintrag, der **nicht mehr signieren kann**, auf dem Bildschirm **Home** (App) oder auf der Popup-Startseite (Erweiterung und Safari) eine Reparaturkarte erscheint.

1. Lies die Karte: *„Der Post-Quanten-Schlüssel dieses Kontos im Netzwerk kann nicht mehr signieren, daher kann von diesem Konto nichts gesendet werden. Eine erneute Registrierung des Schlüssels behebt das.“* Sie zeigt die Netzwerkgebühr von **0,09 QOR** und sagt, dass das Netzwerk ein vorhandenes EVM-Fenster des Kontos schließt (öffne danach ein neues).
2. Tippe auf **Schlüssel erneut registrieren**.
3. Tippe erneut (*Erneut tippen zum Registrieren (Gebühr 0,09 QOR)*). Bestätige in der App mit Biometrie.

Die Reparatur geschieht **nie automatisch**: Es sind immer zwei Antipper nötig. Gesendet wird nur die Schlüsselregistrierung, mit deinem klassischen Schlüssel signiert. Danach sagt QoreX *„Der Schlüssel ist erneut registriert. Von diesem Konto kann wieder gesendet werden.“*

### Den Post-Quanten-Schlüssel rotieren {#pqc-rotation}

**Post-Quanten-Schlüssel rotieren** ersetzt den ML-DSA-87-Schlüssel des Kontos im Netzwerk durch den **nächsten Schlüssel, der aus deiner Wiederherstellungsphrase abgeleitet wird**. App: **Einstellungen → Sicherheit → Post-Quanten-Schlüssel rotieren**. Erweiterung und Safari: die Schaltfläche **Post-Quanten-Schlüssel rotieren** auf der Popup-Startseite. Tippe und dann zur Bestätigung erneut (*Erneut tippen, um den Schlüssel zu rotieren*); die App verlangt außerdem Biometrie. Die Transaktion wird sowohl mit dem aktuellen als auch mit dem neuen Schlüssel signiert, und die aus einer Simulation ermittelte Netzwerkgebühr wird im Ergebnis angezeigt.

- **Es schützt vor** einem durchgesickerten Post-Quanten-Schlüssel.
- **Es schützt nicht vor** einer durchgesickerten Wiederherstellungsphrase. Wer deine Phrase hat, kann jeden dieser Schlüssel ableiten. Verschiebe in diesem Fall deine Mittel in eine neue Wallet mit neuer Phrase.
- **Andere Wallets, die dieselbe Phrase verwenden,** können für dieses Konto nicht signieren, bis sie rotierte Schlüssel unterstützen.
- **Das Netzwerk schließt das EVM-Fenster des Kontos.** Öffne bei Bedarf ein neues.
- **Die Wiederherstellung funktioniert weiterhin.** QoreX durchsucht die Schlüssel, die deine Phrase ableiten kann, nach dem im Netzwerk hinterlegten, sodass eine wiederhergestellte Wallet mit dem rotierten Schlüssel signiert.

Die Rotation geschieht nie automatisch, und Websites können sie nicht anfordern.

## Multisig-Konten {#multisig}

Ein **Multisig-Konto** benötigt die Signaturen mehrerer Mitglieder. QoreX unterstützt das Post-Quanten-Multisig im Mainnet und Testnet und verwendet **dieselben Dateien wie die QoreChain-Kommandozeile**, sodass jedes Mitglied in QoreX oder im Kommandozeilenwerkzeug signieren kann. App: **Einstellungen → Sicherheit → Multisig-Konten**. Erweiterung und Safari: **Multisig-Konten** auf der Popup-Startseite.

**Eines erstellen oder hinzufügen**

1. **Multisig erstellen:** Gib die Mitgliederadressen (`qor1...`) ein, eine pro Zeile, die Anzahl der benötigten Signaturen (den Schwellenwert) und optional einen Namen, dann **Speichern**. Jedes Mitglied muss mindestens eine Transaktion gesendet haben.
2. Oder **Bestehendes Multisig hinzufügen:** Füge den Multisig-Schlüssel ein (die Ausgabe von `keys show <name> -p` der Kommandozeile oder einen aus QoreX geteilten Schlüssel). **Multisig-Schlüssel teilen** sendet ihn an die anderen Mitglieder.

**Status prüfen.** Der Kontobildschirm zeigt das Guthaben, ob die **Menge der Post-Quanten-Mitglieder** registriert ist (und ihre Version), ob das verwendete Konto Mitglied ist und für jedes Mitglied, ob sein Schlüssel bereit ist, fehlt, nicht mehr signieren kann, ohne Nachweis registriert wurde oder nicht geprüft werden konnte. Solange die Mitgliedermenge nicht registriert ist, kann das Konto nicht senden.

**In zwei Runden signieren**

1. **Registrierung vorbereiten** (zuerst, einmalig) oder **Überweisung vorbereiten**. QoreX ermittelt das Gas aus einer Simulation und erstellt eine Datei. In der Erweiterung und Safari wird die Datei **heruntergeladen**; in der App wird sie **als Text geteilt**. Sende sie an die anderen Mitglieder.
2. **Runde 1.** Jedes Post-Quanten-Mitglied öffnet die Datei (**Dateien von Mitgliedern öffnen**), prüft sie und wählt **Als Post-Quanten-Mitglied signieren**. In der App **fügen** die Mitglieder den erhaltenen Text **ein**; in der Erweiterung öffnen sie die Datei.
3. **Kombiniere** die Mitgliedssignaturen.
4. **Runde 2.** Die Mitglieder, die klassisch signieren, werden ausgewählt (genau so viele wie der Schwellenwert, für alle dieselbe Auswahl), und jedes prüft und wählt **Klassisch signieren**. Kombiniere erneut.
5. **An das Netzwerk senden.**

Jeder Signierschritt zeigt zuerst, was du signierst, und braucht **zwei Antipper**; die App verlangt außerdem Biometrie. Würde eine Transaktion einen **Authenticator** registrieren, warnt dich QoreX: Ein Authenticator kann die Mittel des Multisig ohne die Signaturen der anderen Mitglieder bewegen. Um andere Transaktionsarten offline aus einer Datei zu signieren, siehe den Offline- und Multisig-Arbeitsbereich im [Entwicklermodus](/qorex/developer-mode).

## Soziale Wiederherstellung {#social-recovery}

Die soziale Wiederherstellung lässt vertrauenswürdige **Guardians** dir helfen, deine Wallet wiederherzustellen, ohne jemals deine Wiederherstellungsphrase zu sehen.

- Dein Seed wird in **verschlüsselte Shares** aufgeteilt (versiegelt mit ML-KEM): standardmäßig drei, von denen beliebige **zwei** dir bei der Wiederherstellung helfen können (ein 2-von-3-Schwellenwert-Schema); einer allein kann es nicht.
- Jeder Guardian erhält ein Credential.
- **Das Wiederherstellungs-Kit.** Die verschlüsselte Kopie deines Seeds ist dein **Wiederherstellungs-Kit** (es beginnt mit `qorexkit1:`), das du selbst aufbewahrst. Die Guardians allein können die Wallet nicht wiederherstellen: Sie brauchen auch dieses Kit, und das Kit allein ist ohne sie nutzlos. Neue Einrichtungen senden dem Wiederherstellungsdienst nur die Anzahl der Guardians und den Schwellenwert. Siehe [Wiederherstellungs-Kit](#recovery-kit).
- Eine Wiederherstellung erfordert die Zustimmung des Schwellenwerts an Guardians, durchläuft dann eine **48-Stunden-Zeitsperre** und sendet dir einen **Abbruch-Alarm**, sodass ein böswilliger Versuch gestoppt werden kann.

**Einrichtung:** Home → **Wiederherstellung einrichten** (oder Einstellungen → Sicherheit → Soziale Wiederherstellung) → **Treuhänder-Nachweise erstellen**. QoreX erstellt drei Credentials - *Guardian 1*, *Guardian 2* und ein *Druckbares Backup* - und beliebige **2 der 3** können dir bei der Wiederherstellung helfen. Gib je eines an eine vertrauenswürdige Person oder ein vertrauenswürdiges Gerät und bewahre das druckbare Backup an einem sicheren Ort auf. Speichere dann das Wiederherstellungs-Kit wie unten beschrieben. Die Backup-Health-Warnung verschwindet, sobald die Einrichtung abgeschlossen ist.

### Wiederherstellungs-Kit {#recovery-kit}

Am Ende der Einrichtung zeigt QoreX dein **Wiederherstellungs-Kit**. Nutze **Kit kopieren** oder **Teilen oder speichern** und bewahre eine Kopie an einem Ort auf, den du kontrollierst, **nicht nur auf diesem Telefon** (ein Passwortmanager, eine Notiz, ein Ausdruck). Bevor **Fertig** funktioniert, musst du *Ich habe das Kit außerhalb dieses Telefons gesichert* ankreuzen. Zum Wiederherstellen fügst du die **Wiederherstellungs-ID oder das Kit** ein.

Hast du die soziale Wiederherstellung mit einer früheren Version eingerichtet, kann QoreX dir mitteilen, dass noch eine verschlüsselte Kopie deines Kits beim Wiederherstellungsdienst liegt. Speichere das Kit und wähle dann **Kopie vom Relay entfernen**. Die Credentials deiner Guardians funktionieren weiterhin. Nach dem Entfernen besitzt nur du das Kit.

**Die Wiederherstellung einer anderen Person genehmigen:** Wenn du für jemanden Guardian bist, nutze **Wiederherstellung helfen** im Home-Tab, um dessen Anfrage zu genehmigen.

## Legacy Protocol {#legacy}

**Legacy Protocol** ist ein Totmannschalter über deinen Guardians: Dein Vermögen kann an deinen gewählten Begünstigten übergehen, falls du nicht mehr erreichbar bist. Es ist optional und wird unter Einstellungen → Sicherheit konfiguriert.

## Neues Gerät verknüpfen {#link-device}

Verschiebe deine Wallet auf ein zweites Telefon oder Tablet **ohne Server und ohne die 24 Wörter einzutippen**:

1. **Neues Gerät** → Onboarding → **Von einem anderen Gerät verknüpfen**. Es zeigt einen einmaligen **10-stelligen Code** an und öffnet die Kamera.
2. **Altes Gerät** → Einstellungen → Sicherheit → **Neues Gerät verknüpfen** → diesen Code eingeben → mit Biometrie bestätigen. Ein **QR-Code** erscheint (dein Seed, versiegelt mit einem aus dem Code abgeleiteten Schlüssel: scrypt N=2¹⁷ → AES-256-GCM).
3. **Neues Gerät** scannt den QR-Code → entschlüsselt lokal → gleiche Wallet, gleiche Adressen.

**Warum ein Foto des QR-Codes nicht ausreicht:** Der Code und der QR-Code erscheinen niemals auf demselben Bildschirm. Ein Foto allein vom QR-Code ist Chiffretext hinter einer speicherintensiven Schlüsselableitungsfunktion, und beide Artefakte sind einmalig und verschwinden mit den Bildschirmen. Ein falscher Code liefert eine eindeutige Fehlermeldung - einfach erneut versuchen.

:::note
Die Geräteverknüpfung ist eine **Annehmlichkeit**, keine Wiederherstellungsmethode. Deine 24-Wörter-Phrase und die soziale Wiederherstellung sind deine eigentlichen Sicherheitsnetze.
:::

## EVM-Zugriffsfenster {#evm-window}

Ab Chain **v3.2.0** wird eine Transaktion auf der **EVM-Lane** - zum Beispiel eine, die du in MetaMask gegen das EVM-Netzwerk von QoreChain signierst - nur von einem Konto zugelassen, das einen **registrierten ML-DSA-87-Schlüssel** *und* ein **offenes Autorisierungsfenster** hat (eine hybrid signierte `MsgOpenEVMWindow`). Die EVM-Transaktion selbst trägt nur eine secp256k1-Signatur. Der Explorer kennzeichnet eine solche Transaktion mit „Authorised by a PQC window“. Das Öffnen eines Fensters ist eine Nachricht der QoreChain-Native-Lane, die MetaMask nicht erzeugen kann, daher öffnest du es in QoreX. Die eigenen Überweisungen von QoreX nutzen die Native-Lane und brauchen nie ein Fenster.

**Wer es braucht.** Ein Fenster ist für **Ethereum-artige (Coin-60-)Konten** gedacht - die Konten, die du mit *Ethereum-Konto hinzufügen (coin 60)* für eine zuerst in MetaMask verwendete Phrase hinzufügst (siehe [Eine Phrase aus MetaMask oder dem Dashboard wiederherstellen](/qorex/getting-started#restore-dashboard)). MetaMask signiert mit einem Ethereum-Schlüssel, und das ist der Schlüssel eines Coin-60-Kontos; kein MetaMask-Schlüssel kann von einem gewöhnlichen Coin-118-Konto `qor1…` aus senden, ein dort geöffnetes Fenster bewirkt also nichts und kostet nur die Gebühr.

Bist du auf einem Konto, das kein Fenster nutzen kann, listet der Bildschirm die nötigen Schritte auf und hat eine Schaltfläche zu **Deine Konten**.

Ein Fenster kann auf zwei Arten geöffnet werden: **Du öffnest es selbst** (unten), oder [QoreX öffnet eines für eine einzelne Transaktion](#per-transaction-windows), wenn eine Website dich zur Freigabe auffordert.

Öffne es in der App unter **Einstellungen → Sicherheit → EVM-Zugriffsfenster** oder mit der Schaltfläche **EVM-Zugriffsfenster** im Popup der Erweiterung. Wähle zuerst, **was das Fenster zulässt**:

- **Nur QOR-Überweisungen** (Standard, empfohlen): keine Vertragsaufrufe, keine neuen Verträge, kein Empfänger, der ein Vertrag ist.
- **Jeder Vertrag:** eine eigene Wahl mit Warnung: *„Jeder Vertrag kann aufgerufen werden. Das Limit zählt nur QOR: Token, NFTs und Freigaben, die ein Vertrag bewegt, begrenzt das Fenster nicht.“*

Kann das Netzwerk ein Fenster nicht auf QOR-Überweisungen begrenzen, sagt QoreX das und fragt, ob es stattdessen für jeden Vertrag geöffnet werden soll. Nichts wird geöffnet, bis du genau dem zustimmst.

Dann wählst du:

| Feld | Bedeutung | Limit |
|---|---|---|
| **Wie lange (Blöcke, max. 17280)** | wie lange das Fenster offen bleibt | bis zu 17.280 Blöcke (etwa 15 Stunden im Mainnet) |
| **Wie viele Transaktionen (max. 1000)** | wie viele EVM-Transaktionen es zulässt | bis zu 1.000 |
| **Ausgabelimit, QOR** | das Maximum, das es durchlässt | zählt **alle QOR, die dieses Konto verlassen, plus jede maximale Gebühr**; Token werden nicht gezählt |

Auf diesem Bildschirm kannst du keine bestimmten Verträge benennen; auf bestimmte Verträge begrenzte Fenster öffnet QoreX für eine einzelne Transaktion (unten). Die Standardwerte sind 300 Blöcke (etwa 16 Minuten im Mainnet), 5 Transaktionen und 1 QOR. Das Öffnen kostet eine normale Netzwerkgebühr und wird mit der üblichen hybriden Signatur (secp256k1 und ML-DSA-87) signiert, und ein neues Fenster **ersetzt** jedes bereits offene Fenster. Das Öffnen erhöht außerdem die Nonce deines Kontos, öffne das Fenster also **zuerst** und sende dann aus MetaMask - eine früher vorbereitete Transaktion wird mit „nonce too low“ abgelehnt. **Fenster schließen** wird nur angeboten, solange ein Fenster aktiv ist.

**Ein offenes Fenster sagt genau, was es zulässt:** *Lässt zu: nur QOR-Überweisungen*, *Lässt zu: jeden Vertrag (Token zählen nicht zum Limit)* oder *Lässt zu: nur \{targets\}*. Im letzten Fall ergänzt QoreX, dass **ein aufgeführter Vertrag trotzdem für das Konto handeln kann**, auch Token bewegen, die es hält oder ihm freigegeben hat, und dass das QOR-Limit das nicht abdeckt.

Der Bildschirm zeigt einen von vier Zuständen: *Noch \{blocks\} Blöcke offen · \{txs\} Transaktionen · \{value\} QOR übrig*; *Es ist kein Fenster offen. MetaMask-Transaktionen von diesem Konto werden abgelehnt.*; *Dieses Fenster ist abgelaufen oder aufgebraucht*; oder *QoreX konnte das Fenster nicht aus dem Netzwerk lesen* - das bedeutet, dass QoreX es nicht weiß, **nicht**, dass du keines hast. Wenn dein Konto noch keinen ML-DSA-87-Schlüssel hat, registriere zuerst einen (deine erste QoreX-Überweisung erledigt das); vorher hilft ein Fenster nicht.

:::caution Halte es klein und kurz
Ein Fenster lässt gewöhnliche MetaMask-Transaktionen dein QOR **nur mit einer secp256k1-Signatur** bewegen. Halte die Limits niedrig - ein kleines Ausgabelimit, wenige Transaktionen, eine kurze Zeit -, wähle **Nur QOR-Überweisungen**, wenn du keinen Vertrag brauchst, und schließe das Fenster, wenn du fertig bist. Das Limit deckt alle QOR ab, die das Konto verlassen, einschließlich der maximalen Gebühr, sodass eine Transaktion, die das Limit überschreiten würde, abgelehnt wird. Token deckt es nicht ab.
:::

### Fenster für eine einzelne Transaktion {#per-transaction-windows}

Wenn eine Website QoreX bittet, eine EVM-Transaktion auf QoreChain zu senden, und kein offenes Fenster sie abdeckt, öffnet die Freigabe eines **für genau diese Transaktion**, signiert mit deinem hybriden ML-DSA-87-Schlüssel:

- eine Transaktion, bis zum Wert **plus der maximalen Gebühr**, für etwa zehn Minuten;
- auf die aufgerufenen Verträge beschränkt, soweit das Netzwerk das unterstützt;
- die Freigabe **nennt jeden Vertrag**, den das Fenster zulassen würde (einschließlich Verträgen, für die du kürzlich ein Permit signieren musstest), und sagt, dass **es jedes offene Fenster ersetzt**;
- das QOR-Limit deckt alle QOR ab, die das Konto verlassen, einschließlich der maximalen Gebühr, und ein aufgeführter Vertrag kann trotzdem für das Konto handeln (Token bewegen, die es hält oder freigegeben hat, oder QOR, die andere Verträge halten);
- akzeptiert das Netzwerk kein auf Verträge beschränktes Fenster, **fragt QoreX ein zweites Mal**, bevor es eines ohne diese Beschränkung öffnet. Mit Nein wird nichts geöffnet und nichts gesendet.

Eine Typed-Data-Signatur, die ein Vertrag auf QoreChain prüft (ein Permit), öffnet auf ähnliche Weise ein kurzes Fenster, das diesen Vertrag aufführt. Im Transaktionsverlauf zeigt eine EVM-Transaktion, wie viel sie aus dem Fenster verbraucht hat. Die Entwicklersicht findest du unter [dApp-Integration](/qorex/dapp-integration). Nutzt du MetaMask oder eine andere EVM-Wallet mit einer App, die Verträge aufruft, wähle **Jeder Vertrag**, wenn du das Fenster selbst öffnest. Eine App, die ihre Transaktionen über QoreX sendet, braucht kein vorab geöffnetes Fenster. Wie das manuelle Fenster gilt dies für Konten im Ethereum-Stil (Coin 60).

(ETH, BNB und andere Assets auf *anderen* Netzwerken aus QoreX zu senden, ist etwas anderes - siehe [Externe Netzwerke & Token](/qorex/send-and-receive#external-networks-tokens).)

## Was das Genehmigungsfenster zeigt {#approvals}

Jede Signatur, die QoreX erzeugt, wird von dir genehmigt, und die Genehmigung listet genau auf, was du signierst. QoreX zeigt:

- einen Titel und beschriftete Felder für **jede Nachricht** der Anfrage, einschließlich Nachrichten, die in einem authz-**MsgExec** verschachtelt sind, und der Bedingungen von Berechtigungs-Grants - und es **lehnt** alles ab, was es nicht anzeigen kann („QoreX kann diese Nachricht nicht lesen … Genehmige nur, wenn du dieser Website vollständig vertraust“);
- die **Gebühr** (*Gebühr: \{amount\} · Gas \{gas\}*), wer sie zahlt und jeden Fee Grant - kann die Gebühr nicht gelesen werden, sagt QoreX das und rät dir, nicht zu genehmigen;
- das **Limit, die erlaubte Aktion und den Ablauf** von Ausgabeberechtigungen und authz-Grants, wobei *UNLIMITED* und *NEVER* ausgeschrieben werden; ein Ablauf wird sekundengenau angezeigt (`YYYY-MM-DD HH:MM:SS UTC`). Lies die erlaubte Aktion genau: Eine Gebührenberechtigung, deren erlaubte Nachrichten `MsgExec` enthalten (eine `AllowedMsgAllowance`), deckt jede Nachricht ab, die der Begünstigte darüber ausführen kann, und ein generischer authz-Grant deckt den Nachrichtentyp ab, den er nennt. Eine Governance-Abstimmung wird dekodiert, sodass du siehst, worüber du abstimmst. Alles Unlesbare, Unbegrenzte oder Endlose erfordert einen **zweiten Tipp** auf Genehmigen (*Zum Genehmigen erneut tippen*);
- das signierende Konto (*Signiert von …*), wenn du mehrere hast;
- bei einer Anfrage mit sehr vielen Nachrichten die ersten 50 und die Anzahl der übrigen.

Bei **EVM**-Anfragen dekodiert QoreX die Transaktion oder die typisierten Daten (Überweisung, Freigabe mit ausgeschriebenem *UNLIMITED*, Permit und andere) und behandelt unbekannte Aufrufe und Typen als hochriskant mit zweitem Tippen. Es simuliert, soweit das Netzwerk es zulässt. Der EVM-Node von QoreChain kann nur prüfen, dass ein Aufruf mit Daten nicht fehlschlägt, daher sagt die Freigabe dann *„Was er mit deinen Tokens macht, wurde nicht geprüft. Genehmige nur, wenn du dieser Seite vertraust.“* und verlangt ein zweites Tippen. Eine Transaktion, die fehlschlagen würde oder nicht simuliert werden kann, verlangt ebenfalls ein zweites Tippen. Native Anfragen, die einen Vertrag aufrufen, werden vor der Freigabe simuliert, und ein Aufruf, den der Vertrag ablehnen würde, wird mit der Begründung der Chain abgelehnt. Freigabebildschirme zeigen das Memo und lassen dich die vollständige Nachricht öffnen.

QoreX **lehnt außerdem eine Anfrage ab, deren Bytes auf zwei Arten gelesen werden können** (seit 1.1.7 / 0.3.7). Eine Anfrage, die ein Feld wiederholt, das nur einmal vorkommen sollte - zum Beispiel eine doppelte Gebühr oder ein doppelter Betrag -, könnte auf eine Weise angezeigt und auf eine andere ausgeführt werden, daher zeigt QoreX sie gar nicht erst zur Genehmigung an. Bei Websites identifiziert QoreX die anfragende Website anhand der Origin, die der Browser selbst bestätigt, niemals anhand dessen, was die Anfrage über sich selbst sagt.

Ein Wallet- oder Kontowechsel oder das Sperren der Wallet beantwortet wartende Anfragen mit „Nein“; eine Website kann eine Anfrage warten lassen, insgesamt können drei warten. Feldnamen in Genehmigungsfenstern werden in einigen Builds auf Englisch angezeigt.

### Was eine Website niemals anfordern kann {#never-requested}

Diese Aktionen gibt es **nur in den eigenen Bildschirmen von QoreX**. QoreX lehnt sie von jeder Website ab, egal was die Website sagt:

- Verwaltung des Post-Quanten-Schlüssels (registrieren, migrieren, rotieren);
- Authenticators (verknüpfte Signierer) und Ausgabenregeln;
- Öffnen, Schließen oder Löschen eines EVM-Zugriffsfensters;
- Nachrichten für das Solana-on-QoreChain-Fenster und das Relay;
- eine Berechtigung (authz), mit der jemand weitere Berechtigungen **erteilen** oder als dein Konto Nachrichten **ausführen** dürfte. Eine solche Berechtigung ließe den Empfänger als dich handeln. QoreX lehnt sie direkt ab, beliebig tief in `MsgExec` verpackt oder als generischen Grant.

## Ähnlich aussehende Adressen {#look-alike}

Betrüger senden winzige Beträge von Adressen, die genauso beginnen und enden wie eine, die du nutzt, in der Hoffnung, dass du die falsche kopierst. QoreX vergleicht einen Empfänger mit den Adressen, die du kennst (gespeicherte Kontakte, deine eigenen Konten und Adressen, an die du gezahlt hast), auf QoreChain und externen Netzwerken, und markiert vor dem Senden eine Adresse, die einer davon nur **ähnlich sieht**. Wahrscheinlicher Spam mit einem Link im Memo wird außerdem im Verlauf ausgeblendet. Siehe [Kontakte und Favoriten](/qorex/send-and-receive#contacts) und [Verlauf](/qorex/send-and-receive#history).

## Automatische Sperre {#auto-lock}

QoreX sperrt sich nach einer Zeit ohne Nutzung selbst. Wähle unter **Automatisch sperren nach** **1, 5, 15, 30, 60 Minuten oder 4 Stunden**; der Standard ist **15 Minuten**. App: Einstellungen → Sicherheit; nach Ablauf verlangt QoreX erneut Biometrie, bevor es etwas anzeigt. Erweiterung und Safari: Die Einstellung befindet sich auf der Popup-Startseite neben einer Schaltfläche **Sperren**; nach Ablauf gibst du dein Passwort erneut ein.

## Deine Wiederherstellungsphrase und Bedienungshilfen {#phrase-privacy}

Der Bildschirm mit der Wiederherstellungsphrase verlangt jedes Mal eine frische Biometrie oder Geräte-PIN, zeigt die Wörter als nummeriertes, schreibgeschütztes Raster **ohne Kopieren-Schaltfläche**, ist unter Android für Screenshots gesperrt und im App-Umschalter verborgen. Unter **Android 14 und neuer** werden die Wörter außerdem Bedienungshilfen-Diensten vorenthalten, die keine echten Bedienungshilfen sind (TalkBack und andere echte Screenreader können sie weiterhin vorlesen). Unter älterem Android und unter iOS sind die Wörter standardmäßig vor Screenreadern verborgen; wenn du auf einen Screenreader angewiesen bist, tippe auf den Hinweis auf diesem Bildschirm, damit er sie vorlesen darf. Zeige die Phrase nur an, wenn niemand deinen Bildschirm sehen kann.

## Verbundene dApps {#connected-dapps}

dApp-Verbindungen sind **pro Ursprung (per-origin)** und bestehen, bis du sie entfernst. In der App werden sie **auf diesem Gerät je Wallet** gespeichert (nur die Adresse der Website); du siehst und widerrufst sie unter [Schutz meines Geldes](#protection). In der Browser-Erweiterung und in Safari öffnest du **Verbundene Websites** im Popup, um jede von dieser Wallet genehmigte Website zu sehen, und kannst jede davon **widerrufen**.

## Verknüpfte Signierer & Ausgabelimits {#linked-signers}

Das Verknüpfen eines externen Schlüssels (Phantom oder MetaMask) als **verknüpfter Signierer** mit eigenen Ausgabelimits ist **innerhalb von QoreX noch nicht verfügbar** - Einstellungen → Sicherheit zeigt die Karte, mit der Aktion als *demnächst* markiert. Mit deiner Wallet ist nichts verknüpft, es sei denn, du hast es selbst außerhalb von QoreX getan. Die Schlüsselverwaltung kann niemals an einen verknüpften Schlüssel delegiert werden. Das On-Chain-Modell findest du unter [Linked Wallet Authenticators](/developer-guide/account-abstraction#authenticators).

## Q-Day Scanner {#q-day-scanner}

Mit dem **Q-Day Scanner** kannst du eine beliebige Adresse eingeben - deine eigene oder die von jemand anderem - und einen Expositionsbericht für jede Bitcoin- oder Ethereum-Adresse erhalten. Erreichbar über die Schnellzugriff-Buttons im Home-Tab. Um eine **Bitcoin**-Adresse zu prüfen, muss QoreX blockstream.info abfragen, einen von Dritten betriebenen Dienst, der die Adresse und deine IP-Adresse sieht. Der Scanner nennt ihn und scannt erst, nachdem du zugestimmt hast.

## Hilfe und Support {#support}

App: **Einstellungen → Hilfe**. Erweiterung und Safari: **Hilfe** auf der Popup-Startseite. Der Bildschirm listet die **einzigen offiziellen Kanäle**, mit jeder vollständig angezeigten Adresse zum Vergleichen:

- Telegram-Community: [https://t.me/QorechainCommunity](https://t.me/QorechainCommunity)
- Discord: [https://discord.gg/qorechain](https://discord.gg/qorechain)
- Hilfeseite: [https://qorechain.io/help/qorex](https://qorechain.io/help/qorex)
- E-Mail: team@qorechain.io
- Sicherheitslücke melden: [https://qorechain.io/security](https://qorechain.io/security)

:::danger Das QoreX-Team fragt nie nach deiner Wiederherstellungsphrase
*„Das QoreChain-Team fragt dich NIE nach deiner Wiederherstellungsphrase, deinem Passwort oder deinen Schlüsseln. Wer das tut, ist ein Betrüger.“* Das gilt auch für den QoreX-Support.
:::

Auf demselben Bildschirm gibt es eine optionale **Diagnoseübersicht**, die du **nur kopieren solltest, wenn der Support darum bittet**. Sie enthält die App-Version, das Netzwerk und Fehlercodes: keine Phrase, Schlüssel, Adressen oder Guthaben.

## Sicherheitsmodell im Überblick

1. **Non-custodial** - Schlüssel werden auf dem Gerät erzeugt, liegen in hardwaregestützten Vaults (mobil) oder einem verschlüsselten Vault (Erweiterung) und verlassen dieses niemals.
2. **Nichts ohne Zustimmung** - jede Verbindung ist pro Ursprung, jede Signatur wird einzeln genehmigt (biometrisch auf Mobilgeräten), und Payloads werden vor dem Signieren dekodiert. Was QoreX nicht lesen kann, wird abgelehnt oder deutlich markiert und hinter einem zweiten Tippen zurückgehalten.
3. **Hybrid signierte native Lane.** Jede native QOR-Überweisung wird zweifach signiert: mit einem klassischen Schlüssel und mit ML-DSA-87 (FIPS 204). Alles Klassische (externe Netzwerke, EVM) ist gekennzeichnet, niemals stillschweigend.
4. **Keine Analyse, keine Absturzberichte, kein Tracking-SDK.** Schlüssel, Wiederherstellungsphrase, Vault und Genehmigungen verlassen das Gerät niemals. Die optionale Anmeldung, Push-Benachrichtigungen und die soziale Wiederherstellung nutzen einen Server nur, wenn du sie einschaltest; die vollständige Liste dessen, was QoreX sendet, findest du unter [Was QoreX über das Netzwerk sendet](/qorex/overview#data-and-privacy), und die [QoreChain-Datenschutzrichtlinie](https://qorechain.io/privacy) deckt sie ab.
5. **Wiederherstellungswege** - 24-Wörter-Phrase (immer), soziale Wiederherstellung mit Guardians + 48-Stunden-Zeitsperre (optional), Legacy-Vererbung (optional), Geräteverknüpfung (Annehmlichkeit).

## Einschränkungen und bekannte Probleme {#limits}

- Soziale Wiederherstellung, Legacy, Geräteverknüpfung und der Q-Day Scanner gibt es nur mobil.
- Das Rotieren des Post-Quanten-Schlüssels schützt vor einem durchgesickerten Post-Quanten-Schlüssel, nicht vor einer durchgesickerten Wiederherstellungsphrase. Andere Wallets mit derselben Phrase können für ein rotiertes Konto nicht signieren, bis sie rotierte Schlüssel unterstützen.
- Verknüpfte Signierer mit Ausgabelimits sind innerhalb von QoreX noch nicht verfügbar.
- Der manuelle EVM-Fenster-Bildschirm bietet nur „Nur QOR-Überweisungen“ oder „Jeder Vertrag“. Das QOR-Limit eines Fensters begrenzt niemals Token.
- Token-Freigaben werden nur auf dem EVM von QoreChain geprüft, und zum Widerrufen ist ein Coin-60-Konto nötig.
- Die Geräteverknüpfung ist eine Annehmlichkeit, keine Wiederherstellungsmethode. Eine verlorene Wallet ohne aufgeschriebene Phrase und ohne soziale Wiederherstellung kann von niemandem wiederhergestellt werden.
- Das Genehmigungsfenster zeigt einige Feldnamen in einigen Builds auf Englisch.
