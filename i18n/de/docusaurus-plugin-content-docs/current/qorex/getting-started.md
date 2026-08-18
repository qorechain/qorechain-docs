---
slug: /qorex/getting-started
title: Erste Schritte mit QoreX
sidebar_label: Erste Schritte
sidebar_position: 2
---

# Erste Schritte mit QoreX

Diese Seite führt durch die Installation der **mobilen App** sowie durch das Erstellen, Wiederherstellen oder Verknüpfen Ihrer Wallet. Für die Desktop-Wallet siehe die [Browser-Erweiterung](/qorex/browser-extension), die auf Chrome, Firefox und Safari verfügbar ist.

:::note Verfügbarkeit auf Mobilgeräten
- **Android** — verfügbar bei Google Play: https://play.google.com/store/apps/details?id=network.qore.qorex
- **iOS** — zum Testen verfügbar über **TestFlight**: https://testflight.apple.com/join/Xa9D7vgR — die Veröffentlichung im App Store befindet sich noch in Prüfung.
:::

## Bevor Sie beginnen: Sichern Sie Ihr Gerät

Eine QoreX-Wallet kann nur erstellt oder importiert werden, wenn auf Ihrem Gerät ein **starker Entsperrfaktor** eingerichtet ist. Genau dieser schützt Ihre Schlüssel im Hardware-Tresor. Jede der folgenden Optionen genügt:

- **iOS** — Face ID oder Touch ID.
- **Android** — eine Biometrie der Klasse 3 (Fingerabdruck, Iris oder 3D-Gesichtsentsperrung) **oder** eine Bildschirmsperre des Geräts (PIN, Muster oder Passwort).

:::note 2D-Gesichtsentsperrung unter Android
Kamerabasierte 2D-Gesichtsentsperrung (auf manchen Geräten zu finden, z. B. bei bestimmten Samsung-Modellen) gilt als *schwache* Biometrie. Wenn Ihnen nur das zur Verfügung steht, stützt sich QoreX auf die dahinterliegende **PIN / das Muster** — und das Systemdialogfeld bietet dies automatisch an, sodass Sie dennoch abgesichert sind.
:::

Ist kein starker Faktor eingerichtet, bleiben die Schaltflächen zum Erstellen/Importieren deaktiviert und der Bildschirm erklärt, was Sie aktivieren müssen. Richten Sie Face ID, einen Fingerabdruck oder eine Bildschirmsperre in Ihren Systemeinstellungen ein und kehren Sie dann zu QoreX zurück.

## Erster Start

Die App öffnet sich **nur dann** mit dem Onboarding-Bildschirm, **wenn auf dem Gerät keine Wallet vorhanden ist**. Sobald Sie eine Wallet haben, führt jeder weitere Start direkt zum Tab Home (Wallet). Für das Ansehen von Guthaben ist keine Biometrie nötig; **für das Signieren einer Transaktion immer**.

Sie haben drei Möglichkeiten zur Einrichtung:

### 1. Eine neue Wallet erstellen

1. Tippen Sie auf **Neue Wallet erstellen**.
2. QoreX erzeugt auf Ihrem Gerät eine **24-Wort-Wiederherstellungsphrase** (256 Bit Entropie) und leitet daraus Ihre QoreChain-Identität ab — Coin-Typ 118, eine `qor1…`-Adresse (Ihre ETH- und SOL-Konten stammen aus demselben Seed).
3. **Schreiben Sie die 24 Wörter auf** und bewahren Sie sie offline auf. Diese Phrase ist die **einzige** Möglichkeit, Ihre Wallet wiederherzustellen, falls Sie das Gerät verlieren.
4. Bestätigen Sie die Phrase; QoreX versiegelt sie im hardwaregestützten, biometrisch geschützten Tresor.

:::caution Ihre Wiederherstellungsphrase ist alles
Wer Ihre 24 Wörter besitzt, kontrolliert Ihr Guthaben, und niemand — auch nicht die QoreChain Association — kann es für Sie wiederherstellen. Geben Sie Ihre Phrase niemals auf einer Website ein, teilen Sie sie nicht und speichern Sie sie nicht in einem Screenshot oder einer Cloud-Notiz.
:::

### 2. Eine bestehende Wallet wiederherstellen

1. Tippen Sie auf **Bestehende Wallet wiederherstellen**.
2. Geben Sie Ihre 24 Wörter in der richtigen Reihenfolge ein.
3. QoreX leitet dieselben Adressen erneut ab — Ihre Wallet sieht auf jedem Gerät identisch aus.

### 3. Von einem anderen Gerät verknüpfen

Wenn Sie QoreX bereits auf einem anderen Smartphone oder Tablet haben, können Sie die Wallet **ohne Server und ohne Tippen** übertragen — siehe [Ein neues Gerät verknüpfen](/qorex/security-and-recovery#link-device). Wählen Sie auf dem neuen Gerät **Von einem anderen Gerät verknüpfen**, um zu beginnen.

## Optional: einen @handle beanspruchen

Nachdem Ihre Wallet erstellt wurde, können Sie einen eindeutigen **@handle** beanspruchen (zum Beispiel `@liviu`), damit Ihnen andere per Name statt an eine `qor1…`-Adresse senden können. Das ist optional und überspringbar — Ihre Wallet hängt niemals davon ab. Siehe [Konto & Dashboard](/qorex/account-and-dashboard#handle).

## Nächste Schritte

- [Senden & Empfangen](/qorex/send-and-receive) — führen Sie Ihre erste quantensichere Überweisung durch.
- [Sicherheit & Wiederherstellung](/qorex/security-and-recovery) — richten Sie Social Recovery ein, damit Sie nie ausgesperrt sind.
- [Portfolio & Staking](/qorex/portfolio-and-staking) — behalten Sie Assets im Blick und erhalten Sie Staking-Belohnungen.
