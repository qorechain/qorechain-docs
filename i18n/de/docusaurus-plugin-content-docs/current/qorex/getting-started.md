---
slug: /qorex/getting-started
title: Erste Schritte mit QoreX
sidebar_label: Erste Schritte
sidebar_position: 2
---

# Erste Schritte mit QoreX

Diese Seite führt Sie durch die Installation der **mobilen App** sowie das Erstellen, Wiederherstellen oder Verknüpfen Ihrer Wallet. Für die Desktop-Wallet siehe die [Browser-Erweiterung](/qorex/browser-extension), die für Chrome, Firefox und Safari verfügbar ist.

:::note Verfügbarkeit für Mobilgeräte
- **Android** — live im Google Play Store verfügbar: https://play.google.com/store/apps/details?id=network.qore.qorex
- **iOS** — im App Store verfügbar: https://apps.apple.com/us/app/qorex-wallet/id6791256626
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
2. QoreX generiert auf Ihrem Gerät eine **24-Wörter-Wiederherstellungsphrase** (256-Bit-Entropie) und leitet daraus Ihre QoreChain-Identität ab — Coin-Typ 118, eine `qor1…`-Adresse (Ihre ETH- und SOL-Konten stammen aus demselben Seed).
3. **Schreiben Sie die 24 Wörter auf** und bewahren Sie sie offline auf. Diese Phrase ist die **einzige** Möglichkeit, Ihre Wallet wiederherzustellen, falls Sie das Gerät verlieren.
4. Bestätigen Sie die Phrase; QoreX versiegelt sie im hardwaregestützten, biometrisch abgesicherten Tresor.

:::caution Ihre Wiederherstellungsphrase ist alles
Jeder, der Ihre 24 Wörter kennt, kontrolliert Ihre Guthaben, und niemand — auch nicht die QoreChain Association — kann sie für Sie wiederherstellen. Geben Sie Ihre Phrase niemals auf einer Website ein, teilen Sie sie nicht und speichern Sie sie nicht als Screenshot oder in einer Cloud-Notiz. **Das Deinstallieren von QoreX löscht die auf diesem Gerät gespeicherten Schlüssel** — ohne Ihre schriftliche Phrase (oder eine vorher eingerichtete [Social Recovery](/qorex/security-and-recovery#social-recovery)) bedeutet eine Deinstallation den dauerhaften Verlust des Zugriffs. Sichern Sie die Phrase, bevor Sie die Wallet aufladen, nicht danach.
:::

### 2. Vorhandene Wallet wiederherstellen {#2-restore-an-existing-wallet}

1. Tippen Sie auf **Vorhandene Wallet wiederherstellen**.
2. Wählen Sie **Wiederherstellungsphrase** (wenn Sie Ihre 24 Wörter aufgeschrieben haben) oder **Social Recovery** (wenn Sie Guardians eingerichtet haben und die Phrase nicht mehr besitzen — siehe [Social Recovery](/qorex/security-and-recovery#social-recovery)).
3. Für den Weg über die Wiederherstellungsphrase: Geben Sie Ihre 24 Wörter in der richtigen Reihenfolge ein. QoreX normalisiert Groß-/Kleinschreibung und versehentliche Leerzeichen, prüft die Phrase und teilt Ihnen klar mit, wenn ein Wort nicht stimmt, statt eine allgemeine Fehlermeldung anzuzeigen.
4. QoreX leitet dieselben Adressen erneut ab — Ihre Wallet sieht auf jedem Gerät identisch aus.

:::note Versionsanforderung
Die direkte Wiederherstellung über Ihre Wiederherstellungsphrase erfordert QoreX Mobile **1.0.4 oder höher**. Bei einer älteren Version bietet **Vorhandene Wallet wiederherstellen** nur den Guardian-Weg an — siehe [welche Version wo verfügbar ist](/qorex/overview#platform-availability) und aktualisieren Sie bei Bedarf.
:::

### 3. Von einem anderen Gerät verknüpfen

Wenn Sie QoreX bereits auf einem anderen Smartphone oder Tablet installiert haben, können Sie die Wallet **ohne Server und ohne Tippen** übertragen — siehe [Neues Gerät verknüpfen](/qorex/security-and-recovery#link-device). Wählen Sie auf dem neuen Gerät **Von einem anderen Gerät verknüpfen**, um zu beginnen.

## Optional: Ein @Handle beanspruchen

Nachdem Ihre Wallet erstellt wurde, können Sie ein eindeutiges **@Handle** beanspruchen (zum Beispiel `@liviu`), damit andere Personen Ihnen anhand des Namens statt einer `qor1…`-Adresse senden können. Dies ist optional und kann übersprungen werden — Ihre Wallet ist nie davon abhängig. Ein Handle ist an eine bestimmte Adresse gebunden, nicht an die Wallet als Ganzes, was relevant wird, sobald Sie mehr als ein Konto haben — siehe [Mehrere Konten aus einer Phrase](/qorex/account-and-dashboard#accounts) und [@Handle](/qorex/account-and-dashboard#handle).

## Sprache

QoreX ist in zehn Sprachen verfügbar — Englisch, Rumänisch, Deutsch, Spanisch, Französisch, Italienisch, Türkisch, Arabisch, Japanisch und Koreanisch — und folgt automatisch der Sprache Ihres Telefons, mit Englisch als Rückfalloption für alle anderen. Sie können die erkannte Sprache jederzeit unter **Einstellungen → Sprache** überschreiben; bei Auswahl von Arabisch wechselt die Oberfläche zusätzlich auf Rechts-nach-links-Schreibrichtung.

## Nächste Schritte

- [Senden & Empfangen](/qorex/send-and-receive) — tätigen Sie Ihre erste quantensichere Überweisung.
- [Sicherheit & Wiederherstellung](/qorex/security-and-recovery) — richten Sie Social Recovery ein, damit Sie nie ausgesperrt werden.
- [Portfolio & Staking](/qorex/portfolio-and-staking) — behalten Sie Ihre Assets im Blick und verdienen Sie Staking-Rewards.
