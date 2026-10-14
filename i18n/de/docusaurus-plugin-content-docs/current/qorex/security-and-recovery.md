---
slug: /qorex/security-and-recovery
title: Sicherheit & Wiederherstellung
sidebar_label: Sicherheit & Wiederherstellung
sidebar_position: 5
---

# Sicherheit & Wiederherstellung

Alles rund um den Schutz und die Wiederherstellung deiner Wallet findest du unter **Einstellungen → Sicherheit**. Der Home-Tab zeigt außerdem eine **Backup-Health**-Karte, die so lange warnt, bis die soziale Wiederherstellung eingerichtet ist. Die Karte verfolgt nur die soziale Wiederherstellung: Sie kann nicht erkennen, ob du deine Wiederherstellungsphrase aufgeschrieben hast, also erledige das selbst (siehe unten).

## Jetzt sichern — niemand kann eine verlorene Wallet für dich wiederherstellen {#back-up-now}

:::danger Lies dies, bevor du deine Wallet mit Guthaben befüllst
QoreX ist **non-custodial**: Deine Schlüssel existieren ausschließlich auf deinem eigenen Gerät, und QoreChain Association besitzt weder eine Kopie davon noch einen Hauptschlüssel noch eine Möglichkeit, deine Wallet zurückzusetzen oder wiederherzustellen. **Es gibt keinen „Passwort vergessen"-Ablauf, kein Support-Ticket und keine kundendienstliche Umgehung** — verlierst du den Zugriff auf deine Schlüssel ohne vorhandenes Backup, sind die Mittel dauerhaft und unwiderruflich verloren. Das gilt für jede non-custodial Wallet, nicht nur für QoreX — aber es lohnt sich, es klar auszusprechen.

**Mach mindestens eines davon — direkt nach dem Erstellen deiner Wallet, nicht später:**

1. **Schreibe deine 24-Wörter-Wiederherstellungsphrase auf** und bewahre sie offline und dauerhaft auf (kein Screenshot, keine mit der Cloud synchronisierte Notiz, keine Nachricht an dich selbst). Sie ist das Einzige, das deine Wallet auf jedem Gerät und zu jeder Zeit wiederherstellen kann — auf Mobilgeräten zeigst du sie unter **Einstellungen → Sicherheit → Wiederherstellungsphrase anzeigen** an (die App zeigt sie **nicht** an, während sie die Wallet erstellt, du musst sie also selbst abrufen — tu das sofort); in der Erweiterung wird sie einmalig beim Erstellen der Wallet angezeigt und jederzeit über **Wiederherstellungsphrase anzeigen** im Popup. Siehe [Eine bestehende Wallet wiederherstellen](/qorex/getting-started#2-restore-an-existing-wallet).
2. **Richte [soziale Wiederherstellung](#social-recovery)** mit Guardians ein, denen du vertraust. So kannst du deine Wallet auch dann wiederherstellen, wenn du die Phrase verlierst — ohne dass ein einzelner Guardian jemals allein auf deine Gelder zugreifen könnte.

Beides zu tun ist die sicherste Option — die Phrase schützt dich, wenn du das Gerät wechselst oder die App nicht verfügbar ist; die Guardians schützen dich, wenn du die Phrase selbst verlierst.

**Das Deinstallieren der App löscht deine Schlüssel von diesem Gerät.** Der Vault der mobilen App und der Vault der Browser-Erweiterung existieren jeweils nur auf dem Gerät, das sie erzeugt hat. Das Deinstallieren der App, das Zurücksetzen des Telefons oder das Entfernen/Löschen der Erweiterung löscht diese Kopie — ohne Backup und ohne verknüpftes Gerät kann deine Wallet von niemandem wiederhergestellt werden, auch nicht von QoreChain. **Das Entfernen einer Wallet von einem Telefon oder einem Browser** (Einstellungen → Wallets → *Von diesem Telefon entfernen* bzw. *Aus diesem Browser entfernen* in der Erweiterung) löscht den Schlüssel dieser Wallet auf die gleiche Weise vom Gerät — deine Gelder bleiben on-chain, aber nur ihre Wiederherstellungsphrase kann sie zurückbringen.
:::

## Post-Quanten-Schlüssel {#pqc-key}

Der Sicherheitsbildschirm zeigt den aktuellen On-Chain-Status deines Post-Quanten-Schlüssels: **„Registrierung mit deiner ersten Überweisung"** → **„On-Chain registriert ✓"**. Der Algorithmus ist **ML-DSA-87** (deterministisch, hybrid mit secp256k1).

**Schlüsselrotation** — die Rotation deines Post-Quanten-Schlüssels (eine On-Chain-Operation `MsgRotatePQCKey`) ist **innerhalb von QoreX noch nicht verfügbar**; sie kommt mit einem späteren Update der Schlüsselverwaltung, erfordert eine neue biometrische Bestätigung und wird **niemals automatisiert**. Websites können QoreX nicht auffordern, deinen Post-Quanten-Schlüssel zu registrieren, zu migrieren oder zu rotieren. Den zugrunde liegenden Mechanismus findest du unter [Schlüsselrotation](/developer-guide/post-quantum-signing#key-rotation).

## Soziale Wiederherstellung {#social-recovery}

Die soziale Wiederherstellung lässt vertrauenswürdige **Guardians** dir helfen, deine Wallet wiederherzustellen, ohne jemals deine Wiederherstellungsphrase zu sehen.

- Dein Seed wird in **ML-KEM-versiegelte Shares** aufgeteilt — standardmäßig drei, von denen beliebige **zwei** dir bei der Wiederherstellung helfen können (ein 2-von-3-Schwellenwert-Schema); einer allein kann es nicht.
- Jeder Guardian erhält ein Credential. Die Einrichtung schreibt nichts Lesbares an das Relay — nur undurchsichtige, versiegelte Umschläge.
- Eine Wiederherstellung erfordert die Zustimmung des Schwellenwerts an Guardians, durchläuft dann eine **48-Stunden-Zeitsperre** und sendet dir einen **Abbruch-Alarm**, sodass ein böswilliger Versuch gestoppt werden kann.

**Einrichtung:** Home → **Wiederherstellung einrichten** (oder Einstellungen → Sicherheit → Soziale Wiederherstellung) → **Guardian-Credentials erstellen**. QoreX erstellt drei Credentials — *Guardian 1*, *Guardian 2* und ein *Druckbares Backup* — und beliebige **2 der 3** können dir bei der Wiederherstellung helfen. Gib je eines an eine vertrauenswürdige Person oder ein vertrauenswürdiges Gerät und bewahre das druckbare Backup an einem sicheren Ort auf. Die Backup-Health-Warnung verschwindet, sobald dies erledigt ist.

**Die Wiederherstellung einer anderen Person genehmigen:** Wenn du für jemanden Guardian bist, nutze **Wiederherstellung helfen** im Home-Tab, um dessen Anfrage zu genehmigen.

## Legacy Protocol {#legacy}

**Legacy Protocol** ist quantensichere Vererbung: ein Totmannschalter, der über deine Guardians gelegt wird, sodass dein Vermögen an deine gewählten Begünstigten übergehen kann, falls du nicht mehr erreichbar bist. Es ist optional und wird unter Einstellungen → Sicherheit konfiguriert.

## Neues Gerät verknüpfen {#link-device}

Verschiebe deine Wallet auf ein zweites Telefon oder Tablet **ohne Server und ohne die 24 Wörter einzutippen**:

1. **Neues Gerät** → Onboarding → **Von einem anderen Gerät verknüpfen**. Es zeigt einen einmaligen **10-stelligen Code** an und öffnet die Kamera.
2. **Altes Gerät** → Einstellungen → Sicherheit → **Neues Gerät verknüpfen** → diesen Code eingeben → mit Biometrie bestätigen. Ein **QR-Code** erscheint (dein Seed, versiegelt mit einem aus dem Code abgeleiteten Schlüssel: scrypt N=2¹⁷ → AES-256-GCM).
3. **Neues Gerät** scannt den QR-Code → entschlüsselt lokal → gleiche Wallet, gleiche Adressen.

**Warum es sicher ist:** Der Code und der QR-Code erscheinen niemals auf demselben Bildschirm. Ein Foto allein vom QR-Code ist Chiffretext hinter einer speicherintensiven Schlüsselableitungsfunktion, und beide Artefakte sind einmalig und verschwinden mit den Bildschirmen. Ein falscher Code liefert eine eindeutige Fehlermeldung — einfach erneut versuchen.

:::note
Die Geräteverknüpfung ist eine **Annehmlichkeit**, keine Wiederherstellungsmethode. Deine 24-Wörter-Phrase und die soziale Wiederherstellung sind deine eigentlichen Sicherheitsnetze.
:::

## EVM-Zugriffsfenster {#evm-window}

Ab Chain **v3.2.0** wird eine Transaktion auf der **EVM-Lane** — zum Beispiel eine, die du in MetaMask gegen das EVM-Netzwerk von QoreChain signierst — nur von einem Konto zugelassen, das einen **registrierten Post-Quanten-Schlüssel** *und* ein **offenes Autorisierungsfenster** hat. Das Öffnen eines Fensters ist eine Nachricht der QoreChain-Native-Lane, die MetaMask nicht erzeugen kann, daher öffnest du es in QoreX. Die eigenen Überweisungen von QoreX nutzen die Native-Lane und brauchen nie ein Fenster.

Öffne es in der App unter **Einstellungen → Sicherheit → EVM-Zugriffsfenster** oder mit der Schaltfläche **EVM-Zugriffsfenster** im Popup der Erweiterung. Du wählst:

| Feld | Bedeutung | Limit |
|---|---|---|
| **Wie lange (Blöcke, max. 17280)** | wie lange das Fenster offen bleibt | bis zu 17.280 Blöcke (etwa 15 Stunden im Mainnet) |
| **Wie viele Transaktionen (max. 1000)** | wie viele EVM-Transaktionen es zulässt | bis zu 1.000 |
| **Ausgabelimit, QOR — deckt jeden gesendeten Betrag PLUS seine maximale Gebühr ab** | das Maximum, das es durchlässt | zählt den Wert **plus** die maximale Gebühr jeder Transaktion |

Die Standardwerte sind 300 Blöcke (etwa 16 Minuten im Mainnet), 5 Transaktionen und 1 QOR. Das Öffnen kostet eine normale Netzwerkgebühr und wird mit der üblichen hybriden Post-Quanten-Signatur signiert, und ein neues Fenster **ersetzt** jedes bereits offene Fenster. Das Öffnen erhöht außerdem die Nonce deines Kontos, öffne das Fenster also **zuerst** und sende dann aus MetaMask — eine früher vorbereitete Transaktion wird mit „nonce too low" abgelehnt. **Fenster schließen** wird nur angeboten, solange ein Fenster aktiv ist.

Der Bildschirm zeigt einen von vier Zuständen: *Noch \{blocks\} Blöcke offen · \{txs\} Transaktionen · \{value\} QOR übrig*; *Es ist kein Fenster offen. MetaMask-Transaktionen von diesem Konto werden abgelehnt.*; *Dieses Fenster ist abgelaufen oder aufgebraucht*; oder *QoreX konnte das Fenster nicht aus dem Netzwerk lesen* — das bedeutet, dass QoreX es nicht weiß, **nicht**, dass du keines hast. Wenn dein Konto noch keinen Post-Quanten-Schlüssel hat, registriere zuerst einen (deine erste QoreX-Überweisung erledigt das); vorher hilft ein Fenster nicht.

:::caution Halte es klein und kurz
Ein Fenster lässt gewöhnliche MetaMask-Transaktionen dein QOR **ohne Post-Quanten-Signatur** bewegen. Halte die Limits niedrig und schließe das Fenster, wenn du fertig bist.
:::

QoreX selbst sendet nie auf der EVM-Lane von QoreChain; nutze dafür MetaMask oder eine andere EVM-Wallet, innerhalb eines offenen Fensters. (ETH, BNB und andere Assets auf *anderen* Netzwerken aus QoreX zu senden, ist etwas anderes — siehe [Externe Netzwerke & Token](/qorex/send-and-receive#external-networks-tokens).)

## Was das Genehmigungsfenster zeigt {#approvals}

Jede Signatur, die QoreX erzeugt, wird von dir genehmigt, und die Genehmigung listet genau auf, was du signierst. QoreX zeigt:

- einen Titel und beschriftete Felder für **jede Nachricht** der Anfrage, einschließlich Nachrichten, die in einem authz-**MsgExec** verschachtelt sind, und der Bedingungen von Berechtigungs-Grants — und es **lehnt** alles ab, was es nicht anzeigen kann („QoreX kann diese Nachricht nicht lesen … Genehmige nur, wenn du dieser Website vollständig vertraust");
- die **Gebühr** (*Gebühr: \{amount\} · Gas \{gas\}*), wer sie zahlt und jeden Fee Grant — kann die Gebühr nicht gelesen werden, sagt QoreX das und rät dir, nicht zu genehmigen;
- das **Limit, die erlaubte Aktion und den Ablauf** von Ausgabeberechtigungen und authz-Grants, wobei *UNLIMITED* und *NEVER* ausgeschrieben werden. Alles Unlesbare, Unbegrenzte oder Endlose erfordert einen **zweiten Tipp** auf Genehmigen (*Zum Genehmigen erneut tippen*);
- das signierende Konto (*Signiert von …*), wenn du mehrere hast;
- bei einer Anfrage mit sehr vielen Nachrichten die ersten 50 und die Anzahl der übrigen.

Ein Wallet- oder Kontowechsel oder das Sperren der Wallet beantwortet wartende Anfragen mit „Nein"; eine Website kann eine Anfrage warten lassen, insgesamt können drei warten. Feldnamen in Genehmigungsfenstern werden in einigen Builds auf Englisch angezeigt.

## Deine Wiederherstellungsphrase und Bedienungshilfen {#phrase-privacy}

Der Bildschirm mit der Wiederherstellungsphrase ist vor Screenshots und dem App-Umschalter verborgen. Unter **Android 14 und neuer** werden die Wörter außerdem Bedienungshilfen-Diensten vorenthalten, die keine echten Bedienungshilfen sind (TalkBack und andere echte Screenreader können sie weiterhin vorlesen). Unter älterem Android und unter iOS sind die Wörter standardmäßig vor Screenreadern verborgen; wenn du auf einen Screenreader angewiesen bist, tippe auf den Hinweis auf diesem Bildschirm, damit er sie vorlesen darf. Zeige die Phrase nur an, wenn niemand deinen Bildschirm sehen kann.

## Verbundene dApps {#connected-dapps}

dApp-Verbindungen sind **pro Ursprung (per-origin)**. In der App sind sie außerdem **sitzungsgebunden**: Das Schließen des In-App-dApp-Browsers widerruft jede Verbindung, sodass nichts im Hintergrund verbunden bleibt (die Karte **Verbundene dApps** unter Einstellungen → Sicherheit sagt genau das). In der Browser-Erweiterung bleiben Verbindungen bestehen, bis du sie entfernst — öffne **Verbundene Websites** im Popup, um jede von dieser Wallet genehmigte Website zu sehen, und **widerrufe** beliebige davon.

## Verknüpfte Signierer & Ausgabelimits {#linked-signers}

Das Verknüpfen eines externen Schlüssels (Phantom oder MetaMask) als **verknüpfter Signierer** mit eigenen Ausgabelimits ist **innerhalb von QoreX noch nicht verfügbar** — Einstellungen → Sicherheit zeigt die Karte, mit der Aktion als *demnächst* markiert. Mit deiner Wallet ist nichts verknüpft, es sei denn, du hast es selbst außerhalb von QoreX getan. Die Schlüsselverwaltung kann niemals an einen verknüpften Schlüssel delegiert werden. Das On-Chain-Modell findest du unter [Linked Wallet Authenticators](/developer-guide/account-abstraction#authenticators).

## Q-Day Scanner {#q-day-scanner}

Mit dem **Q-Day Scanner** kannst du eine beliebige Adresse eingeben — deine eigene oder die von jemand anderem — und einen Quanten-Risikobericht erhalten: welche Gelder auf rein klassischen Schlüsseln liegen und welche bereits post-quanten-geschützt sind. Erreichbar über die Schnellzugriff-Buttons im Home-Tab.

## Sicherheitsmodell im Überblick

1. **Non-custodial** — Schlüssel werden auf dem Gerät erzeugt, liegen in hardwaregestützten Vaults (mobil) oder einem verschlüsselten Vault (Erweiterung) und verlassen dieses niemals.
2. **Nichts ohne Zustimmung** — jede Verbindung ist pro Ursprung, jede Signatur wird einzeln genehmigt (biometrisch auf Mobilgeräten), und Payloads werden vor dem Signieren immer entschlüsselt — was QoreX nicht entschlüsseln kann, lehnt es ab.
3. **Standardmäßig quantensicher** — Native-Lane-QOR-Überweisungen tragen immer ML-DSA-87 + secp256k1; alles Klassische ist gekennzeichnet, niemals stillschweigend.
4. **Keine Analyse, kein Tracking, keine Werbung.** Die optionale Konto-Anmeldung und Push-Benachrichtigungen nutzen einen Server nur, wenn du sie einschaltest, und sind durch die [QoreChain-Datenschutzrichtlinie](https://qorechain.io/privacy) abgedeckt.
5. **Wiederherstellungswege** — 24-Wörter-Phrase (immer), soziale Wiederherstellung mit Guardians + 48-Stunden-Zeitsperre (optional), Legacy-Vererbung (optional), Geräteverknüpfung (Annehmlichkeit).
