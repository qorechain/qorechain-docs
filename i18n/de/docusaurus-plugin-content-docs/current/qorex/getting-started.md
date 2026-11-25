---
slug: /qorex/getting-started
title: Erste Schritte mit QoreX
sidebar_label: Erste Schritte
sidebar_position: 2
---

# Erste Schritte mit QoreX

Die **mobile QoreX-App** (iOS und Android) ist die vollständige QoreChain-Wallet für die Hosentasche. Sie ist für alle gedacht, die QOR halten und senden, staken, Personen per @Handle bezahlen, Assets in anderen Netzwerken halten und einen Wiederherstellungsplan haben möchten, der nicht von einem Unternehmen abhängt. Diese Seite führt Sie durch die Installation der App sowie das Erstellen, Wiederherstellen oder Verknüpfen Ihrer Wallet. Für die Desktop-Wallet siehe die [Browser-Erweiterung](/qorex/browser-extension); für die gesamte Familie siehe die [Übersicht](/qorex/overview).

## Innovationen {#innovations}

- **Schlüssel, die das Gerät nie verlassen.** Die 24 Wörter werden auf dem Telefon erzeugt und in einem hardwaregestützten, biometrisch abgesicherten Tresor versiegelt (Secure Enclave unter iOS, StrongBox unter Android). Zum Signieren sind immer Ihre Biometrie oder Ihre PIN nötig.
- **Hybrid-signierte native Lane.** Jede native QOR-Überweisung wird doppelt signiert: mit einem klassischen Schlüssel und mit ML-DSA-87 (FIPS 204).
- **ML-DSA-87-Schlüssel aus denselben 24 Wörtern.** `SHAKE256("qorechain:pqc:v1|" + address + "|" + mnemonic)` leitet ihn deterministisch ab, es gibt also kein zweites Backup. Die Ableitung ist in [QoreSign](/qoresign/overview) veröffentlicht. Der Schlüssel wird mit Ihrer ersten Transaktion automatisch on-chain registriert.
- **Eine Prüfung nach jedem Broadcast.** Die Wallet liest die bestätigte Transaktion und warnt Sie, wenn die ML-DSA-87-Ebene fehlt.
- **EVM-Zugriffsfenster.** QoreX öffnet, zeigt und schließt das Fenster, mit dem ein Konto im Ethereum-Stil auf der EVM-Lane senden kann. Siehe [Sicherheit & Wiederherstellung](/qorex/security-and-recovery#evm-window).
- **@Handles mit Pinning.** Zwei Signaturen binden einen Namen an eine Adresse; die zuerst aufgelöste Adresse wird angeheftet, und eine stille Änderung wird markiert.
- **Wiederherstellung ohne Unternehmen.** Social Recovery (verschlüsselte Shares, 2 von 3, 48 Stunden Timelock), Legacy (ein Dead-Man's-Switch über Ihre Guardians) und Geräteverknüpfung. Siehe [Sicherheit & Wiederherstellung](/qorex/security-and-recovery).
- **Erster Start mit Ziel.** Nach der kurzen Tour fragt QoreX **Was möchtest du zuerst tun?** und führt Sie dorthin, einschließlich einer kurzen Prüfung, ob Ihre Wiederherstellungsphrase korrekt aufgeschrieben ist. Siehe [Erster Start](#first-run).
- **Schutz meines Geldes.** Ein Bildschirm, der Ihre Sicherung, Ihren Wiederherstellungstest, Ihre Vertrauenspersonen, verbundene Websites und dauerhafte Berechtigungen prüft. Siehe [Sicherheit und Wiederherstellung](/qorex/security-and-recovery).
- **Q-Day-Scanner.** Ein Exposure-Bericht für jede Bitcoin- oder Ethereum-Adresse. Bei einer Bitcoin-Adresse fragt QoreX einen von Dritten betriebenen Dienst ab, der die Adresse und Ihre IP-Adresse sieht, und das erst, nachdem Sie zugestimmt haben.
- **Push und Widget mit kleinem Fußabdruck.** Push teilt dem Server nur Ihre öffentlichen Adressen mit, und die Benachrichtigung sagt nur „QOR received“. Das Widget zeigt das QOR-Guthaben des gerade verwendeten Kontos.

## Zugang {#how-to-access}

:::note Verfügbarkeit für Mobilgeräte
- **Android**: Google Play (Android 7.0 oder neuer): https://play.google.com/store/apps/details?id=network.qore.qorex
- **iOS**: der App Store (iOS 15.1 oder neuer): https://apps.apple.com/us/app/qorex-wallet/id6791256626
:::

Die aktuellen Versionen sind unter [Welche Version wo live ist](/qorex/overview#versions) aufgeführt: Die iOS-App ist 1.2.5 und die Android-App 1.2.4 (1.2.5 ist in der Store-Prüfung, Stand 25. November 2026). Die App ist kostenlos und erfordert kein Konto. Standard ist das Mainnet `qorechain-vladi`; **Settings → Testnet verwenden (Entwickler)** wechselt zu `qorechain-diana`. Senden und Staking zahlen die normale Netzwerkgebühr (Untergrenze 0,1 uqor pro Gas). Die App ist in 10 Sprachen verfügbar, darunter Arabisch mit Rechts-nach-links-Layout, und folgt der Sprache des Telefons.

## Verwendung {#how-to-use}

Die folgenden Schritte behandeln das Einrichten einer Wallet. Für die tägliche Nutzung siehe [Senden & Empfangen](/qorex/send-and-receive), [Portfolio & Staking](/qorex/portfolio-and-staking), [Sicherheit & Wiederherstellung](/qorex/security-and-recovery) und den [dApp-Browser](/qorex/dapp-browser).

## Bevor Sie beginnen: Sichern Sie Ihr Gerät

Eine QoreX-Wallet kann nur erstellt oder importiert werden, wenn auf Ihrem Gerät ein **starker Entsperrfaktor** eingerichtet ist. Dieser schützt Ihre Schlüssel im Hardware-Tresor. Folgendes qualifiziert sich dafür:

- **iOS** - Face ID oder Touch ID.
- **Android** - eine biometrische Erkennung der Klasse 3 (Fingerabdruck, Iris- oder 3D-Gesichtserkennung) **oder** eine Displaysperre des Geräts (PIN, Muster oder Passwort).

:::note Android 2D-Gesichtserkennung
Kamerabasierte 2D-Gesichtserkennung (auf manchen Geräten vorhanden, z. B. bestimmten Samsung-Modellen) gilt als *schwache* Biometrie. Wenn das Ihre einzige Option ist, greift QoreX auf die dahinterliegende **PIN / das Muster** zurück - das System bietet sie automatisch an, sodass Sie weiterhin abgesichert sind.
:::

Ist kein starker Faktor eingerichtet, bleiben die Schaltflächen zum Erstellen/Importieren deaktiviert, und der Bildschirm erklärt, was Sie aktivieren müssen. Richten Sie Face ID, einen Fingerabdruck oder eine Displaysperre in Ihren Systemeinstellungen ein und kehren Sie dann zu QoreX zurück.

## Erster Start

Die App öffnet den Onboarding-Bildschirm **nur, wenn auf dem Gerät noch keine Wallet vorhanden ist**. Sobald eine Wallet existiert, führt jeder spätere Start direkt zum Home-Tab (Wallet). Für das Anzeigen von Guthaben ist keine biometrische Bestätigung nötig; **für das Signieren einer Transaktion ist sie immer erforderlich**.

Es gibt drei Möglichkeiten zur Einrichtung:

### 1. Neue Wallet erstellen

1. Tippen Sie auf **Neue Wallet erstellen**.
2. QoreX generiert auf Ihrem Gerät eine **24-Wörter-Wiederherstellungsphrase** (256-Bit-Entropie), versiegelt sie direkt im hardwaregestützten, biometrisch abgesicherten Tresor und leitet daraus Ihre QoreChain-Identität ab - Coin-Typ 118, eine `qor1…`-Adresse (Ihre ETH- und SOL-Konten stammen aus demselben Seed). **Die App zeigt Ihnen die Phrase beim Erstellen der Wallet nicht an.**
3. **Lassen Sie sich die Phrase anzeigen und schreiben Sie sie sofort auf:** Öffnen Sie **Einstellungen → Sicherheit → Wiederherstellungsphrase anzeigen**, bestätigen Sie mit Biometrie oder der Geräte-PIN und schreiben Sie die 24 Wörter der Reihe nach auf Papier ab. Bewahren Sie sie offline auf. Diese Phrase ist die **einzige** Möglichkeit, Ihre Wallet wiederherzustellen, falls Sie das Gerät verlieren.
4. Prüfen Sie, was Sie geschrieben haben: Tippen Sie auf dem Bildschirm, der Ihre Phrase zeigt, auf **Mein Backup prüfen** und geben Sie die drei abgefragten Wörter ein (siehe [Die Backup-Prüfung](#backup-check)).
5. Richten Sie optional [Social Recovery](/qorex/security-and-recovery#social-recovery) ein. Beachten Sie, dass die Karte **Backup-Status** auf Home nur Social Recovery verfolgt. Ob Ihre aufgeschriebene Phrase geprüft wurde, zeigt **Schutz meines Geldes**.

:::danger Erledigen Sie Schritt 3 jetzt - verlassen Sie sich nicht auf eine Erinnerung
Da die App die Phrase beim Erstellen der Wallet nicht anzeigt, ist es leicht, weiterzumachen, ohne sie jemals aufzuschreiben. **Tun Sie es, bevor Sie etwas empfangen oder senden.** Wenn Sie die App verlieren oder deinstallieren oder das Telefon verlieren, ohne die aufgeschriebene Phrase oder eine eingerichtete [Social Recovery](/qorex/security-and-recovery#social-recovery), kann niemand - auch nicht die QoreChain Association - Ihre Guthaben zurückholen.
:::

:::caution Ihre Wiederherstellungsphrase ist alles
Jeder, der Ihre 24 Wörter kennt, kontrolliert Ihre Guthaben, und niemand - auch nicht die QoreChain Association - kann sie für Sie wiederherstellen. Geben Sie Ihre Phrase niemals auf einer Website ein, teilen Sie sie nicht und speichern Sie sie nicht als Screenshot oder in einer Cloud-Notiz. **Das Deinstallieren von QoreX löscht die auf diesem Gerät gespeicherten Schlüssel** - ohne Ihre schriftliche Phrase (oder eine vorher eingerichtete [Social Recovery](/qorex/security-and-recovery#social-recovery)) bedeutet eine Deinstallation den dauerhaften Verlust des Zugriffs. Sichern Sie die Phrase, bevor Sie die Wallet aufladen, nicht danach.
:::

### 2. Vorhandene Wallet wiederherstellen {#2-restore-an-existing-wallet}

1. Tippen Sie auf **Vorhandene Wallet wiederherstellen**.
2. Wählen Sie **Wiederherstellungsphrase** (wenn Sie Ihre 24 Wörter aufgeschrieben haben) oder **Social Recovery** (wenn Sie Guardians eingerichtet haben und die Phrase nicht mehr besitzen - siehe [Social Recovery](/qorex/security-and-recovery#social-recovery)).
3. Für den Weg über die Wiederherstellungsphrase: Geben Sie Ihre 24 Wörter in der richtigen Reihenfolge ein. QoreX normalisiert Groß-/Kleinschreibung und versehentliche Leerzeichen, prüft die Phrase und teilt Ihnen klar mit, wenn ein Wort nicht stimmt, statt eine allgemeine Fehlermeldung anzuzeigen.
4. QoreX leitet dieselben Adressen erneut ab - Ihre Wallet sieht auf jedem Gerät identisch aus.

:::note Zusätzliche Konten kehren einzeln zurück
Die Wiederherstellung über die Phrase bringt **Konto 1** zurück. Wenn Sie in der alten Wallet mehrere Konten verwendet haben, tippen Sie auf **Konto hinzufügen** (Einstellungen → Ihre Konten), um die nächsten zurückzuholen - sie werden aus derselben Phrase abgeleitet und erscheinen daher unter denselben Adressen wieder. Konten im Ethereum-Stil werden mit **Ethereum-Konto hinzufügen (Coin 60)** hinzugefügt; siehe [Phrase aus MetaMask oder dem Dashboard wiederherstellen](#restore-dashboard). Fügen Sie sie in derselben Reihenfolge hinzu, in der Sie sie in der alten Wallet erstellt haben: Konten werden nach Slot nummeriert, und eine andere Reihenfolge auf einem neuen Gerät kann an einem Slot ein anderes Konto ergeben.
:::

### 3. Von einem anderen Gerät verknüpfen

Wenn Sie QoreX bereits auf einem anderen Smartphone oder Tablet installiert haben, können Sie die Wallet **ohne Server und ohne Tippen** übertragen - siehe [Neues Gerät verknüpfen](/qorex/security-and-recovery#link-device). Wählen Sie auf dem neuen Gerät **Von einem anderen Gerät verknüpfen**, um zu beginnen.

## Erster Start: Was möchtest du zuerst tun? {#first-run}

Einmal pro Wallet fragt QoreX nach der kurzen Tour **Was möchtest du zuerst tun?** Wählen Sie eines von drei Zielen oder tippen Sie auf **Vorerst überspringen**. Sie können es später unter **Settings → Was möchtest du tun?** erneut öffnen. Es funktioniert im Mainnet und im Testnet gleich (im Testnet hat QOR keinen Wert).

| Ziel | Wodurch QoreX Sie führt |
|---|---|
| **Ich möchte Geld empfangen** | Wählen Sie die Münze, die Sie empfangen möchten, sehen Sie die richtige Adresse als QR-Code mit der Warnung, nur diese Münze in diesem Netzwerk zu senden, dann **Zahlungslink erstellen** (Zahlungslinks fordern QOR auf QoreChain an). Siehe [Zahlungsanforderungen](/qorex/send-and-receive). |
| **Ich möchte Geld senden** | **Add funds**: Ihre QoreChain-Adresse und QR-Code. **Hol dir einen @handle** (oder sehen Sie den vorhandenen). **Meine erste Zahlung**: die Gebühr, ungefähr wie hoch sie ist (und die einmalige Gebühr für die Registrierung des Post-Quanten-Schlüssels, falls Ihr Konto noch keinen registriert hat), dann **Meine erste Zahlung machen**. Sie sehen den genauen Betrag, bevor Sie signieren. |
| **Ich möchte meine Krypto sicher aufbewahren** | **Deine Einzahlungsadresse**; **Wiederherstellung einrichten** mit [Vertrauenspersonen](/qorex/security-and-recovery#social-recovery), die Ihre Phrase niemals sehen; dann **Mein Backup prüfen**, das zeigt, ob Ihr Backup geprüft wurde, und Sie zu Ihrer Phrase führt, um es zu prüfen. |

In der Browser-Erweiterung erscheint dieselbe Frage, nachdem Sie eine Wallet erstellt oder importiert haben; das Sicherheitsziel besteht dort aus der Einzahlungsadresse und der Backup-Prüfung, und @handles werden in der App beansprucht. Siehe [Wallet erstellen oder wiederherstellen](/qorex/browser-extension#wallet).

### Die Backup-Prüfung {#backup-check}

Die Backup-Prüfung ist ein kurzes Quiz: QoreX fragt nach **drei Wörtern Ihrer Wiederherstellungsphrase** an zufälligen Positionen, und Sie tippen sie so ein, wie Sie sie aufgeschrieben haben.

- In der **App**: Öffnen Sie **Settings → Security → Reveal recovery phrase**, bestätigen Sie mit Biometrie oder Ihrer Geräte-PIN, schreiben Sie die Wörter auf und tippen Sie dann auf **Mein Backup prüfen**. Passt ein Wort nicht, vergleichen Sie mit Ihrem Papier und versuchen Sie es erneut; **Phrase erneut anzeigen** bringt Sie zurück zu den Wörtern, und **Später prüfen** verlässt den Bildschirm. Wenn Sie bestehen, vermerkt QoreX nur, dass geprüft wurde und wann.
- In der **Erweiterung**: Die Prüfung folgt auf den Bildschirm, der die neue Phrase anzeigt. **Mein Backup prüfen** fragt später nach Ihrem Passwort und zeigt die Phrase nicht an.
- **Schutz meines Geldes** bietet **Meine Wiederherstellungsphrase testen**, das auf dieselbe Weise nach drei Wörtern fragt. Die Wörter werden auf Ihrem Gerät verglichen; nichts, was Sie eingeben, wird gespeichert oder gesendet.

## Mehrere Wallets auf einem Gerät {#several-wallets}

Jede Wallet hat ihre **eigene Wiederherstellungsphrase**. Sie können mehrere auf einem Telefon behalten - zum Beispiel Ihre Haupt-Wallet und eine, die von einem anderen Dienst wiederhergestellt wurde - und mit einem Tipp zwischen ihnen wechseln.

- **Mobil:** Unter Einstellungen → **Wallets** sind die Wallets auf diesem Telefon aufgelistet. Tippen Sie auf eine, um sie zur aktiven Wallet zu machen - die gesamte App wechselt dorthin (on-chain bewegt sich nichts). Mit **Wallet hinzufügen** können Sie eine neue erstellen, eine aus ihrer Wiederherstellungsphrase wiederherstellen oder eine von einem anderen Gerät verknüpfen; die bereits vorhandenen Wallets bleiben erhalten. Wird eine Phrase wiederhergestellt, die bereits auf dem Telefon vorhanden ist, wechselt die App einfach zu ihr.
- **Erweiterung:** Der Bildschirm **Wallets** im Popup leistet dasselbe, mit **einem Passwort** für alle. Das Hinzufügen oder Entfernen einer Wallet fragt einmal nach Ihrem Passwort, um den Tresor neu zu versiegeln, und schaltet die Passkey-Entsperrung aus (schalten Sie sie auf dem Startbildschirm wieder ein).
- **Das Entfernen einer Wallet** (*Von diesem Telefon entfernen* / *Aus diesem Browser entfernen*) löscht den Schlüssel dieser Wallet vom Gerät. Ihre Guthaben bleiben on-chain, aber nur ihre Wiederherstellungsphrase kann sie zurückbringen - schreiben Sie sie vorher auf.

## Phrase aus MetaMask oder dem Dashboard wiederherstellen {#restore-dashboard}

Standardmäßig leitet QoreX Ihre `qor1…`-Adresse aus einer Wiederherstellungsphrase mit Coin-Typ **118** ab. Eine Phrase, die zuerst in MetaMask - oder in einer im QoreChain Dashboard erstellten Wallet - verwendet wurde, hält ihre QOR stattdessen an einer **Ethereum-Stil**-Adresse (Coin-Typ **60**), sodass die Wiederherstellung ein leeres **Konto 1** zeigt. Nichts ist verloren; fügen Sie das Konto im Ethereum-Stil hinzu:

1. Aktualisieren Sie QoreX in Ihrem Store auf die aktuelle Version.
2. **Fügen Sie eine Wallet hinzu** (Einstellungen → Wallets → *Wallet hinzufügen* → *Vorhandene Wallet wiederherstellen*) und geben Sie die Phrase ein. Ihre vorhandene Wallet bleibt, wo sie ist. In der Erweiterung: **Wallets** → Wiederherstellen.
3. Öffnen Sie Einstellungen → **Ihre Konten** und tippen Sie auf **Ethereum-Konto hinzufügen (Coin 60)**. Der erste Tipp fügt das Konto bei Index 0 hinzu - dieselbe `0x…`-Adresse, die MetaMask für diese Wörter anzeigt, und derselbe Schlüssel wie Ihre QoreChain-Adresse `qor1…` für dieses Konto. Ihre QOR liegen dort.
4. Wechseln Sie zu diesem Konto (es ist mit *Ethereum · Coin 60* beschriftet). Sie können davon senden, staken und Rewards einfordern. Der erste Versand registriert außerdem den ML-DSA-87-Schlüssel dieses Kontos, wofür eine geringe einmalige Gebühr anfällt.

Ein Konto im Ethereum-Stil hat kein @Handle (Handles werden auf einem QoreChain-`qor1…`-Konto mit Coin-Typ 118 beansprucht), und Websites signieren damit über `signAndBroadcast` statt über `signDirect`. Es ist außerdem die Art von Konto, für die das [EVM-Zugriffsfenster](/qorex/security-and-recovery#evm-window) wichtig ist: MetaMask signiert mit demselben Schlüssel, daher können MetaMask-Transaktionen dessen QOR bewegen, sobald ein Fenster geöffnet ist. Jeder Tipp auf **Ethereum-Konto hinzufügen (Coin 60)** fügt den nächsten Index hinzu.

## Orientierung {#find-your-way}

- **Suche** - die Lupe oben auf Home durchsucht Bildschirme („stake“), Coins („USDC“), Personen (ein @Handle oder eine Adresse), Memos und den Anfang eines Transaktions-Hashs; die Eingabe eines @Handles oder einer `qor1…`-Adresse bietet direkt **Send QOR to …** an.
- **Tour** - beim ersten Öffnen einer Wallet auf Home erklären fünf kurze Karten, was QoreX kann und wo sich was befindet. Sie läuft einmal; wiederholen Sie sie unter Einstellungen → **Tour erneut ansehen**. Danach folgt [Was möchtest du zuerst tun?](#first-run).
- **Einstellungen** enthält außerdem **Zahlungsanforderungen**, **Eine Anforderung bezahlen**, **Kontakte**, **Schutz meines Geldes**, **Hilfe** und **Was möchtest du tun?** (und, nur im Testnet, das Senden an eine andere Chain und den QoreChain-Bridge-Bildschirm - siehe [Testnet-Funktionen](/qorex/testnet-features)).
- **Entwicklermodus** - ein Schalter in den Einstellungen, standardmäßig aus. Ist er an, erscheint in der unteren Leiste ein Tab **Entwickler** mit einem `</>`-Symbol. Siehe [Entwicklermodus](/qorex/developer-mode).
- **Automatische Sperre** - nach einer Zeit ohne Nutzung fragt QoreX erneut nach Biometrie oder PIN; das Intervall (1, 5, 15, 30, 60 oder 240 Minuten, Standard 15) legen Sie mit **Automatisch sperren nach** unter Einstellungen → Sicherheit fest.
- **Netzwerkstatus** - ist der neueste Block der Chain älter als eine Minute oder ist das Netzwerk nicht erreichbar, weist ein Banner darauf hin.

## Optional: Ein @Handle beanspruchen

Nachdem Ihre Wallet erstellt wurde, können Sie ein eindeutiges **@Handle** beanspruchen (zum Beispiel `@liviu`), damit andere Personen Ihnen anhand des Namens statt einer `qor1…`-Adresse senden können. Das Beanspruchen erfordert ein [angemeldetes Konto](/qorex/account-and-dashboard#sign-in) und erfolgt **in der mobilen App** (die Browser-Erweiterung verweist Sie dorthin). Es ist optional und kann übersprungen werden - Ihre Wallet ist nie davon abhängig. Ein Handle ist an eine bestimmte Adresse gebunden, nicht an die Wallet als Ganzes, was relevant wird, sobald Sie mehr als ein Konto haben - siehe [Mehrere Konten aus einer Phrase](/qorex/account-and-dashboard#accounts) und [@Handle](/qorex/account-and-dashboard#handle).

## Sprache

QoreX ist in zehn Sprachen verfügbar - Englisch, Rumänisch, Deutsch, Spanisch, Französisch, Italienisch, Türkisch, Arabisch, Japanisch und Koreanisch - und folgt automatisch der Sprache Ihres Telefons, mit Englisch als Rückfalloption für alle anderen. Sie können die erkannte Sprache jederzeit unter **Einstellungen → Sprache** überschreiben; bei Auswahl von Arabisch wechselt die Oberfläche zusätzlich auf Rechts-nach-links-Schreibrichtung.

## Nächste Schritte

- [Senden & Empfangen](/qorex/send-and-receive) - tätigen Sie Ihre erste hybrid-signierte Überweisung.
- [Sicherheit & Wiederherstellung](/qorex/security-and-recovery) - richten Sie Social Recovery ein, damit Sie nie ausgesperrt werden.
- [Portfolio & Staking](/qorex/portfolio-and-staking) - behalten Sie Ihre Assets im Blick und verdienen Sie Staking-Rewards.

## Wo veröffentlicht {#where-published}

| Store | Eintrag | Link |
|---|---|---|
| App Store (iOS) | **QoreX** | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6791256626) |
| Google Play (Android) | `network.qore.qorex` | [play.google.com](https://play.google.com/store/apps/details?id=network.qore.qorex) |

Der Quellcode der mobilen App ist nicht öffentlich. Installieren Sie immer über den offiziellen Eintrag.

## Grenzen und bekannte Probleme {#limits}

- **Swap ist nicht verfügbar**: Er ist abgeschaltet, bis Pool-Liquidität vorhanden ist, und wird unter iOS nicht angezeigt.
- **Verknüpfte Signer** (Phantom oder MetaMask als verknüpfter Schlüssel mit Ausgabenlimits) sind in QoreX noch nicht verfügbar.
- **Nur Testnet:** das Senden an eine andere Chain über IBC, der QoreChain-Bridge-Bildschirm und Solana auf QoreChain. Siehe [Testnet-Funktionen](/qorex/testnet-features).
- **Die App zeigt die Phrase beim Erstellen der Wallet nicht an.** Lassen Sie sie sich sofort unter Einstellungen → Sicherheit anzeigen. Die Karte Backup-Status verfolgt nur Social Recovery; **Schutz meines Geldes** zeigt, ob Ihr Backup geprüft wurde.
- **EVM- und SVM-Überweisungen werden nicht von der Hybrid-Signatur abgedeckt.** Eine EVM-Transaktion trägt nur eine secp256k1-Signatur und braucht ein geöffnetes Zugriffsfenster; Überweisungen in externen Netzwerken sind ausschließlich klassisch.
- **Push** gibt es nur im Mainnet; unter iPhone ist es als Best Effort zu betrachten.
- Eine verlorene Wallet ohne aufgeschriebene Phrase und ohne Social Recovery kann von niemandem wiederhergestellt werden.
