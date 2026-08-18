---
slug: /qorex/getting-started
title: Erste Schritte mit QoreX
sidebar_label: Erste Schritte
sidebar_position: 2
---

# Erste Schritte mit QoreX

Diese Seite führt durch die Installation der **mobilen App** sowie durch das Erstellen, Wiederherstellen oder Verknüpfen deiner Wallet. Für die Desktop-Wallet siehe die [Browser-Erweiterung](/qorex/browser-extension), die auf Chrome, Firefox und Safari verfügbar ist.

:::note Verfügbarkeit auf Mobilgeräten
Die mobile QoreX-App befindet sich derzeit im öffentlichen Test:

- **Android** — verfügbar für den **öffentlichen Test** über Google Play.
- **iOS** — verfügbar zum Testen über **TestFlight**, falls du sie ausprobieren möchtest.

Die aktuellen Links findest du auf [qorechain.io](https://qorechain.io).
:::

## Bevor du beginnst: Sichere dein Gerät

Eine QoreX-Wallet kann nur dann erstellt oder importiert werden, wenn auf deinem Gerät ein **starker Entsperrfaktor** eingerichtet ist. Genau das schützt deine Schlüssel im Hardware-Tresor. Jedes der folgenden Kriterien genügt:

- **iOS** — Face ID oder Touch ID.
- **Android** — eine Class-3-Biometrie (Fingerabdruck, Iris oder 3D-Gesichtserkennung) **oder** eine Geräte-Bildschirmsperre (PIN, Muster oder Passwort).

:::note Android 2D-Gesichtserkennung
Kamerabasierte 2D-Gesichtserkennung (auf manchen Geräten zu finden, z. B. bestimmten Samsung-Modellen) gilt als *schwache* Biometrie. Wenn das alles ist, was du hast, greift QoreX auf die dahinterliegende **PIN / das Muster** zurück — und das System-Sheet bietet dies automatisch an, sodass du trotzdem abgesichert bist.
:::

Ist kein starker Faktor eingerichtet, bleiben die Schaltflächen zum Erstellen/Importieren deaktiviert und der Bildschirm erklärt, was du aktivieren musst. Richte Face ID, einen Fingerabdruck oder eine Bildschirmsperre in deinen Systemeinstellungen ein und kehre dann zu QoreX zurück.

## Erster Start

Die App öffnet den Onboarding-Bildschirm **nur, wenn auf dem Gerät keine Wallet vorhanden ist**. Sobald du eine Wallet hast, führt jeder spätere Start direkt zum Tab Start (Wallet). Das Anzeigen von Guthaben erfordert keine Biometrie; **das Signieren einer Transaktion immer**.

Du hast drei Möglichkeiten zur Einrichtung:

### 1. Eine neue Wallet erstellen

1. Tippe auf **Neue Wallet erstellen**.
2. QoreX generiert auf deinem Gerät eine **24-Wörter-Wiederherstellungsphrase** (256-Bit-Entropie) und leitet daraus deine QoreChain-Identität ab — coin type 118, eine `qor1…`-Adresse (deine ETH- und SOL-Konten stammen aus demselben Seed).
3. **Schreibe die 24 Wörter auf** und bewahre sie offline auf. Diese Phrase ist die **einzige** Möglichkeit, deine Wallet wiederherzustellen, falls du das Gerät verlierst.
4. Bestätige die Phrase; QoreX versiegelt sie im hardwaregestützten, biometrisch geschützten Tresor.

:::caution Deine Wiederherstellungsphrase ist alles
Jeder, der deine 24 Wörter besitzt, kontrolliert dein Guthaben, und niemand — auch nicht die QoreChain Association — kann es für dich wiederherstellen. Gib deine Phrase niemals auf einer Website ein, teile sie nicht und speichere sie nicht in einem Screenshot oder einer Cloud-Notiz.
:::

### 2. Eine bestehende Wallet wiederherstellen

1. Tippe auf **Bestehende Wallet wiederherstellen**.
2. Gib deine 24 Wörter in der richtigen Reihenfolge ein.
3. QoreX leitet dieselben Adressen erneut ab — deine Wallet sieht auf jedem Gerät identisch aus.

### 3. Von einem anderen Gerät verknüpfen

Wenn du QoreX bereits auf einem anderen Telefon oder Tablet hast, kannst du die Wallet **ohne Server und ohne Tippen** übertragen — siehe [Ein neues Gerät verknüpfen](/qorex/security-and-recovery#link-device). Wähle auf dem neuen Gerät **Von einem anderen Gerät verknüpfen**, um zu beginnen.

## Optional: Ein @handle beanspruchen

Nachdem deine Wallet erstellt wurde, kannst du ein eindeutiges **@handle** beanspruchen (zum Beispiel `@liviu`), damit Leute dir per Name statt an eine `qor1…`-Adresse senden können. Dies ist optional und überspringbar — deine Wallet hängt niemals davon ab. Siehe [Konto & Dashboard](/qorex/account-and-dashboard#handle).

## Nächste Schritte

- [Senden & Empfangen](/qorex/send-and-receive) — führe deinen ersten quantensicheren Transfer durch.
- [Sicherheit & Wiederherstellung](/qorex/security-and-recovery) — richte die soziale Wiederherstellung ein, damit du niemals ausgesperrt wirst.
- [Portfolio & Staking](/qorex/portfolio-and-staking) — verfolge Assets und verdiene Staking-Belohnungen.
