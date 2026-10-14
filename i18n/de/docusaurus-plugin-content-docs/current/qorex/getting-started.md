---
slug: /qorex/getting-started
title: Erste Schritte mit QoreX
sidebar_label: Erste Schritte
sidebar_position: 2
---

# Erste Schritte mit QoreX

Diese Seite führt Sie durch die Installation der **mobilen App** sowie das Erstellen, Wiederherstellen oder Verknüpfen Ihrer Wallet. Für die Desktop-Wallet siehe die [Browser-Erweiterung](/qorex/browser-extension), die für Chrome, Firefox und Safari verfügbar ist.

:::note Verfügbarkeit für Mobilgeräte
- **Android** — live im Google Play Store verfügbar (Android 7.0 oder neuer): https://play.google.com/store/apps/details?id=network.qore.qorex
- **iOS** — im App Store verfügbar (iOS 15.1 oder neuer): https://apps.apple.com/us/app/qorex-wallet/id6791256626
:::

## Bevor Sie beginnen: Sichern Sie Ihr Gerät

Eine QoreX-Wallet kann nur erstellt oder importiert werden, wenn auf Ihrem Gerät ein **starker Entsperrfaktor** eingerichtet ist. Dieser schützt Ihre Schlüssel im Hardware-Tresor. Folgendes qualifiziert sich dafür:

- **iOS** — Face ID oder Touch ID.
- **Android** — eine biometrische Erkennung der Klasse 3 (Fingerabdruck, Iris- oder 3D-Gesichtserkennung) **oder** eine Displaysperre des Geräts (PIN, Muster oder Passwort).

:::note Android 2D-Gesichtserkennung
Kamerabasierte 2D-Gesichtserkennung (auf manchen Geräten vorhanden, z. B. bestimmten Samsung-Modellen) gilt als *schwache* Biometrie. Wenn das Ihre einzige Option ist, greift QoreX auf die dahinterliegende **PIN / das Muster** zurück — das System bietet sie automatisch an, sodass Sie weiterhin abgesichert sind.
:::

Ist kein starker Faktor eingerichtet, bleiben die Schaltflächen zum Erstellen/Importieren deaktiviert, und der Bildschirm erklärt, was Sie aktivieren müssen. Richten Sie Face ID, einen Fingerabdruck oder eine Displaysperre in Ihren Systemeinstellungen ein und kehren Sie dann zu QoreX zurück.

## Erster Start

Die App öffnet den Onboarding-Bildschirm **nur, wenn auf dem Gerät noch keine Wallet vorhanden ist**. Sobald eine Wallet existiert, führt jeder spätere Start direkt zum Home-Tab (Wallet). Für das Anzeigen von Guthaben ist keine biometrische Bestätigung nötig; **für das Signieren einer Transaktion ist sie immer erforderlich**.

Es gibt drei Möglichkeiten zur Einrichtung:

### 1. Neue Wallet erstellen

1. Tippen Sie auf **Neue Wallet erstellen**.
2. QoreX generiert auf Ihrem Gerät eine **24-Wörter-Wiederherstellungsphrase** (256-Bit-Entropie), versiegelt sie direkt im hardwaregestützten, biometrisch abgesicherten Tresor und leitet daraus Ihre QoreChain-Identität ab — Coin-Typ 118, eine `qor1…`-Adresse (Ihre ETH- und SOL-Konten stammen aus demselben Seed). **Die App zeigt Ihnen die Phrase beim Erstellen der Wallet nicht an.**
3. **Lassen Sie sich die Phrase anzeigen und schreiben Sie sie sofort auf:** Öffnen Sie **Einstellungen → Sicherheit → Wiederherstellungsphrase anzeigen**, bestätigen Sie mit Biometrie oder der Geräte-PIN und schreiben Sie die 24 Wörter der Reihe nach auf Papier ab. Bewahren Sie sie offline auf. Diese Phrase ist die **einzige** Möglichkeit, Ihre Wallet wiederherzustellen, falls Sie das Gerät verlieren.
4. Richten Sie optional [Social Recovery](/qorex/security-and-recovery#social-recovery) ein. Beachten Sie, dass die Karte **Backup-Status** auf Home nur Social Recovery verfolgt — sie kann nicht erkennen, ob Sie die Phrase aufgeschrieben haben, und erinnert Sie daher auch nicht daran.

:::danger Erledigen Sie Schritt 3 jetzt — nichts in der App erinnert Sie daran
Da die App nach dem Erstellen der Wallet direkt zu Home wechselt, ist es leicht, weiterzumachen, ohne die Phrase jemals aufzuschreiben. **Tun Sie es, bevor Sie etwas empfangen oder senden.** Wenn Sie die App verlieren oder deinstallieren oder das Telefon verlieren, ohne die aufgeschriebene Phrase oder eine eingerichtete [Social Recovery](/qorex/security-and-recovery#social-recovery), kann niemand — auch nicht die QoreChain Association — Ihre Guthaben zurückholen.
:::

:::caution Ihre Wiederherstellungsphrase ist alles
Jeder, der Ihre 24 Wörter kennt, kontrolliert Ihre Guthaben, und niemand — auch nicht die QoreChain Association — kann sie für Sie wiederherstellen. Geben Sie Ihre Phrase niemals auf einer Website ein, teilen Sie sie nicht und speichern Sie sie nicht als Screenshot oder in einer Cloud-Notiz. **Das Deinstallieren von QoreX löscht die auf diesem Gerät gespeicherten Schlüssel** — ohne Ihre schriftliche Phrase (oder eine vorher eingerichtete [Social Recovery](/qorex/security-and-recovery#social-recovery)) bedeutet eine Deinstallation den dauerhaften Verlust des Zugriffs. Sichern Sie die Phrase, bevor Sie die Wallet aufladen, nicht danach.
:::

### 2. Vorhandene Wallet wiederherstellen {#2-restore-an-existing-wallet}

1. Tippen Sie auf **Vorhandene Wallet wiederherstellen**.
2. Wählen Sie **Wiederherstellungsphrase** (wenn Sie Ihre 24 Wörter aufgeschrieben haben) oder **Social Recovery** (wenn Sie Guardians eingerichtet haben und die Phrase nicht mehr besitzen — siehe [Social Recovery](/qorex/security-and-recovery#social-recovery)).
3. Für den Weg über die Wiederherstellungsphrase: Geben Sie Ihre 24 Wörter in der richtigen Reihenfolge ein. QoreX normalisiert Groß-/Kleinschreibung und versehentliche Leerzeichen, prüft die Phrase und teilt Ihnen klar mit, wenn ein Wort nicht stimmt, statt eine allgemeine Fehlermeldung anzuzeigen.
4. QoreX leitet dieselben Adressen erneut ab — Ihre Wallet sieht auf jedem Gerät identisch aus.

:::note Zusätzliche Konten kehren einzeln zurück
Die Wiederherstellung über die Phrase bringt **Konto 1** zurück. Wenn Sie in der alten Wallet mehrere Konten verwendet haben, tippen Sie auf **Konto hinzufügen** (Einstellungen → Ihre Konten), um die nächsten zurückzuholen — sie werden aus derselben Phrase abgeleitet und erscheinen daher unter denselben Adressen wieder. Konten im Ethereum-Stil werden mit **Ethereum-Konto hinzufügen (Coin 60)** hinzugefügt; siehe [Phrase aus MetaMask oder dem Dashboard wiederherstellen](#restore-dashboard). Fügen Sie sie in derselben Reihenfolge hinzu, in der Sie sie in der alten Wallet erstellt haben: Konten werden nach Slot nummeriert, und eine andere Reihenfolge auf einem neuen Gerät kann an einem Slot ein anderes Konto ergeben.
:::

### 3. Von einem anderen Gerät verknüpfen

Wenn Sie QoreX bereits auf einem anderen Smartphone oder Tablet installiert haben, können Sie die Wallet **ohne Server und ohne Tippen** übertragen — siehe [Neues Gerät verknüpfen](/qorex/security-and-recovery#link-device). Wählen Sie auf dem neuen Gerät **Von einem anderen Gerät verknüpfen**, um zu beginnen.

## Mehrere Wallets auf einem Gerät {#several-wallets}

Jede Wallet hat ihre **eigene Wiederherstellungsphrase**. Sie können mehrere auf einem Telefon behalten — zum Beispiel Ihre Haupt-Wallet und eine, die von einem anderen Dienst wiederhergestellt wurde — und mit einem Tipp zwischen ihnen wechseln.

- **Mobil:** Unter Einstellungen → **Wallets** sind die Wallets auf diesem Telefon aufgelistet. Tippen Sie auf eine, um sie zur aktiven Wallet zu machen — die gesamte App wechselt dorthin (on-chain bewegt sich nichts). Mit **Wallet hinzufügen** können Sie eine neue erstellen, eine aus ihrer Wiederherstellungsphrase wiederherstellen oder eine von einem anderen Gerät verknüpfen; die bereits vorhandenen Wallets bleiben erhalten. Wird eine Phrase wiederhergestellt, die bereits auf dem Telefon vorhanden ist, wechselt die App einfach zu ihr.
- **Erweiterung:** Der Bildschirm **Wallets** im Popup leistet dasselbe, mit **einem Passwort** für alle. Das Hinzufügen oder Entfernen einer Wallet fragt einmal nach Ihrem Passwort, um den Tresor neu zu versiegeln, und schaltet die Passkey-Entsperrung aus (schalten Sie sie auf dem Startbildschirm wieder ein).
- **Das Entfernen einer Wallet** (*Von diesem Telefon entfernen* / *Aus diesem Browser entfernen*) löscht den Schlüssel dieser Wallet vom Gerät. Ihre Guthaben bleiben on-chain, aber nur ihre Wiederherstellungsphrase kann sie zurückbringen — schreiben Sie sie vorher auf.

## Phrase aus MetaMask oder dem Dashboard wiederherstellen {#restore-dashboard}

Standardmäßig leitet QoreX Ihre `qor1…`-Adresse aus einer Wiederherstellungsphrase mit Coin-Typ **118** ab. Eine Phrase, die zuerst in MetaMask — oder in einer im QoreChain Dashboard erstellten Wallet — verwendet wurde, hält ihre QOR stattdessen an einer **Ethereum-Stil**-Adresse (Coin-Typ **60**), sodass die Wiederherstellung ein leeres **Konto 1** zeigt. Nichts ist verloren; fügen Sie das Konto im Ethereum-Stil hinzu:

1. Aktualisieren Sie QoreX in Ihrem Store auf die aktuelle Version.
2. **Fügen Sie eine Wallet hinzu** (Einstellungen → Wallets → *Wallet hinzufügen* → *Vorhandene Wallet wiederherstellen*) und geben Sie die Phrase ein. Ihre vorhandene Wallet bleibt, wo sie ist. In der Erweiterung: **Wallets** → Wiederherstellen.
3. Öffnen Sie Einstellungen → **Ihre Konten** und tippen Sie auf **Ethereum-Konto hinzufügen (Coin 60)**. Der erste Tipp fügt das Konto bei Index 0 hinzu — dieselbe `0x…`-Adresse, die MetaMask für diese Wörter anzeigt, und derselbe Schlüssel wie Ihre QoreChain-Adresse `qor1…` für dieses Konto. Ihre QOR liegen dort.
4. Wechseln Sie zu diesem Konto (es ist mit *Ethereum · Coin 60* beschriftet). Sie können davon senden, staken und Rewards einfordern. Der erste Versand registriert außerdem den Post-Quanten-Schlüssel dieses Kontos, wofür eine geringe einmalige Gebühr anfällt.

Ein Konto im Ethereum-Stil hat kein @Handle (Handles werden auf einem QoreChain-`qor1…`-Konto mit Coin-Typ 118 beansprucht), und Websites signieren damit über `signAndBroadcast` statt über `signDirect`. Jeder Tipp auf **Ethereum-Konto hinzufügen (Coin 60)** fügt den nächsten Index hinzu.

## Orientierung {#find-your-way}

- **Suche** — die Lupe oben auf Home durchsucht Bildschirme („stake“), Coins („USDC“), Personen (ein @Handle oder eine Adresse), Memos und den Anfang eines Transaktions-Hashs; die Eingabe eines @Handles oder einer `qor1…`-Adresse bietet direkt **QOR senden an …** an.
- **Tour** — beim ersten Öffnen einer Wallet auf Home erklären fünf kurze Karten, was QoreX kann und wo sich was befindet. Sie läuft einmal; wiederholen Sie sie unter Einstellungen → **Tour erneut starten**.

## Optional: Ein @Handle beanspruchen

Nachdem Ihre Wallet erstellt wurde, können Sie ein eindeutiges **@Handle** beanspruchen (zum Beispiel `@liviu`), damit andere Personen Ihnen anhand des Namens statt einer `qor1…`-Adresse senden können. Dies ist optional und kann übersprungen werden — Ihre Wallet ist nie davon abhängig. (In der Browser-Erweiterung bieten manche Versionen das Beanspruchen nicht an; falls das Popup es nicht anbietet, beanspruchen Sie das Handle in der mobilen App.) Ein Handle ist an eine bestimmte Adresse gebunden, nicht an die Wallet als Ganzes, was relevant wird, sobald Sie mehr als ein Konto haben — siehe [Mehrere Konten aus einer Phrase](/qorex/account-and-dashboard#accounts) und [@Handle](/qorex/account-and-dashboard#handle).

## Sprache

QoreX ist in zehn Sprachen verfügbar — Englisch, Rumänisch, Deutsch, Spanisch, Französisch, Italienisch, Türkisch, Arabisch, Japanisch und Koreanisch — und folgt automatisch der Sprache Ihres Telefons, mit Englisch als Rückfalloption für alle anderen. Sie können die erkannte Sprache jederzeit unter **Einstellungen → Sprache** überschreiben; bei Auswahl von Arabisch wechselt die Oberfläche zusätzlich auf Rechts-nach-links-Schreibrichtung.

## Nächste Schritte

- [Senden & Empfangen](/qorex/send-and-receive) — tätigen Sie Ihre erste quantensichere Überweisung.
- [Sicherheit & Wiederherstellung](/qorex/security-and-recovery) — richten Sie Social Recovery ein, damit Sie nie ausgesperrt werden.
- [Portfolio & Staking](/qorex/portfolio-and-staking) — behalten Sie Ihre Assets im Blick und verdienen Sie Staking-Rewards.
