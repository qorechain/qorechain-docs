---
slug: /qorex/getting-started
title: Erste Schritte mit QoreX
sidebar_label: Erste Schritte
sidebar_position: 2
---

# Erste Schritte mit QoreX

Diese Seite führt durch die Installation der **mobilen App** sowie das Erstellen, Wiederherstellen oder Verknüpfen deiner Wallet. Für die Desktop-Wallet siehe die [Browser-Erweiterung](/qorex/browser-extension), die in Chrome, Firefox und Safari verfügbar ist.

:::note Verfügbarkeit auf Mobilgeräten
- **Android** — verfügbar bei Google Play: https://play.google.com/store/apps/details?id=network.qore.qorex
- **iOS** — zum Testen über **TestFlight** verfügbar, falls du es ausprobieren möchtest; die Veröffentlichung im App Store wird noch geprüft. Den aktuellen Einladungslink findest du auf [qorechain.io](https://qorechain.io).
:::

## Bevor du beginnst: Sichere dein Gerät

Eine QoreX-Wallet lässt sich nur erstellen oder importieren, wenn auf deinem Gerät ein **starker Entsperrfaktor** eingerichtet ist. Genau dieser schützt deine Schlüssel im Hardware-Tresor. Eine der folgenden Möglichkeiten genügt:

- **iOS** — Face ID oder Touch ID.
- **Android** — eine Biometrie der Klasse 3 (Fingerabdruck, Iris oder 3D-Gesichtsentsperrung) **oder** eine Bildschirmsperre des Geräts (PIN, Muster oder Passwort).

:::note 2D-Gesichtsentsperrung unter Android
Kamerabasierte 2D-Gesichtsentsperrung (auf manchen Geräten zu finden, z. B. bei bestimmten Samsung-Modellen) gilt als *schwache* Biometrie. Wenn du nur diese hast, greift QoreX auf die dahinterliegende **PIN / das Muster** zurück — und das Systemdialogfeld bietet dies automatisch an, sodass du dennoch geschützt bist.
:::

Ist kein starker Faktor hinterlegt, bleiben die Schaltflächen zum Erstellen/Importieren deaktiviert und der Bildschirm erklärt, was du aktivieren musst. Richte Face ID, einen Fingerabdruck oder eine Bildschirmsperre in deinen Systemeinstellungen ein und kehre dann zu QoreX zurück.

## Erster Start

Die App öffnet den Onboarding-Bildschirm **nur, wenn auf dem Gerät noch keine Wallet vorhanden ist**. Sobald du eine Wallet hast, führt jeder spätere Start direkt zum Tab „Home“ (Wallet). Für das Ansehen von Guthaben ist keine Biometrie nötig; **für das Signieren einer Transaktion immer**.

Du hast drei Möglichkeiten zur Einrichtung:

### 1. Eine neue Wallet erstellen

1. Tippe auf **Neue Wallet erstellen**.
2. QoreX erzeugt auf deinem Gerät eine **24-Wörter-Wiederherstellungsphrase** (256 Bit Entropie) und leitet daraus deine QoreChain-Identität ab — Coin-Typ 118, eine `qor1…`-Adresse (deine ETH- und SOL-Konten stammen aus demselben Seed).
3. **Schreibe die 24 Wörter auf** und bewahre sie offline auf. Diese Phrase ist die **einzige** Möglichkeit, deine Wallet wiederherzustellen, falls du das Gerät verlierst.
4. Bestätige die Phrase; QoreX verschließt sie im hardwaregestützten, biometrisch gesicherten Tresor.

:::caution Deine Wiederherstellungsphrase ist alles
Wer deine 24 Wörter besitzt, kontrolliert dein Guthaben, und niemand — auch nicht die QoreChain Association — kann es für dich wiederherstellen. Gib deine Phrase niemals auf einer Website ein, teile sie nicht und speichere sie nicht in einem Screenshot oder einer Cloud-Notiz.
:::

### 2. Eine bestehende Wallet wiederherstellen

1. Tippe auf **Bestehende Wallet wiederherstellen**.
2. Gib deine 24 Wörter der Reihe nach ein.
3. QoreX leitet dieselben Adressen erneut ab — deine Wallet sieht auf jedem Gerät identisch aus.

### 3. Von einem anderen Gerät verknüpfen

Wenn du QoreX bereits auf einem anderen Smartphone oder Tablet hast, kannst du die Wallet **ohne Server und ohne Tippen** übertragen — siehe [Ein neues Gerät verknüpfen](/qorex/security-and-recovery#link-device). Wähle auf dem neuen Gerät **Von einem anderen Gerät verknüpfen**, um zu beginnen.

## Optional: ein @handle sichern

Nachdem deine Wallet erstellt wurde, kannst du dir ein eindeutiges **@handle** sichern (zum Beispiel `@liviu`), damit dir andere per Namen statt an eine `qor1…`-Adresse senden können. Das ist optional und überspringbar — deine Wallet hängt nie davon ab. Siehe [Konto & Dashboard](/qorex/account-and-dashboard#handle).

## Nächste Schritte

- [Senden & Empfangen](/qorex/send-and-receive) — führe deine erste quantensichere Übertragung durch.
- [Sicherheit & Wiederherstellung](/qorex/security-and-recovery) — richte die soziale Wiederherstellung ein, damit du dich nie aussperrst.
- [Portfolio & Staking](/qorex/portfolio-and-staking) — verfolge Vermögenswerte und erhalte Staking-Belohnungen.
