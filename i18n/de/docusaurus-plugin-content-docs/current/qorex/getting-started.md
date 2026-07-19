---
slug: /qorex/getting-started
title: Erste Schritte mit QoreX
sidebar_label: Erste Schritte
sidebar_position: 2
---

# Erste Schritte mit QoreX

Diese Seite führt durch die Installation der mobilen App und das Erstellen, Wiederherstellen oder Verknüpfen deiner Wallet.

## Bevor du beginnst: sichere dein Gerät

Eine QoreX-Wallet kann nur erstellt oder importiert werden, wenn auf deinem Gerät ein **biometrischer Schutz** eingerichtet ist — Face ID / Touch ID unter iOS oder ein Fingerabdruck / gleichwertiger starker Faktor unter Android. Das ist es, was deine Schlüssel im Hardware-Tresor schützt.

Wenn keine Biometrie eingerichtet ist, bleiben die Schaltflächen zum Erstellen/Importieren deaktiviert und der Bildschirm erklärt, was du aktivieren musst. Richte Face ID oder einen Fingerabdruck in deinen Systemeinstellungen ein und kehre dann zu QoreX zurück.

## Erster Start

Die App öffnet den Onboarding-Bildschirm **nur, wenn auf dem Gerät keine Wallet vorhanden ist**. Sobald du eine Wallet hast, führt jeder spätere Start direkt zum Tab Home (Wallet). Das Anzeigen von Guthaben erfordert keine Biometrie; **das Signieren einer Transaktion immer**.

Du hast drei Möglichkeiten zur Einrichtung:

### 1. Eine neue Wallet erstellen

1. Tippe auf **Create a new wallet**.
2. QoreX erzeugt auf deinem Gerät eine **24-Wort-Wiederherstellungsphrase** (256-bit Entropie) und leitet daraus deine QoreChain-Identität ab — coin type 118, eine `qor1…`-Adresse (deine ETH- und SOL-Konten stammen aus demselben Seed).
3. **Schreibe die 24 Wörter auf** und bewahre sie offline auf. Diese Phrase ist der **einzige** Weg, deine Wallet wiederherzustellen, falls du das Gerät verlierst.
4. Bestätige die Phrase; QoreX versiegelt sie im hardwaregestützten, biometrisch gesicherten Tresor.

:::caution Deine Wiederherstellungsphrase ist alles
Jeder, der deine 24 Wörter besitzt, kontrolliert deine Gelder, und niemand — auch nicht die QoreChain Association — kann sie für dich wiederherstellen. Gib deine Phrase niemals auf einer Website ein, teile sie nicht und speichere sie nicht in einem Screenshot oder einer Cloud-Notiz.
:::

### 2. Eine bestehende Wallet wiederherstellen

1. Tippe auf **Restore existing wallet**.
2. Gib deine 24 Wörter in der richtigen Reihenfolge ein.
3. QoreX leitet dieselben Adressen erneut ab — deine Wallet sieht auf jedem Gerät identisch aus.

### 3. Von einem anderen Gerät verknüpfen

Wenn du QoreX bereits auf einem anderen Smartphone oder Tablet hast, kannst du die Wallet **ohne Server und ohne Tippen** übertragen — siehe [Ein neues Gerät verknüpfen](/qorex/security-and-recovery#link-device). Wähle auf dem neuen Gerät **Link from another device**, um zu beginnen.

## Optional: einen @handle beanspruchen

Nachdem deine Wallet erstellt wurde, kannst du einen einzigartigen **@handle** beanspruchen (zum Beispiel `@liviu`), damit Personen dir per Namen statt an eine `qor1…`-Adresse senden können. Dies ist optional und überspringbar — deine Wallet hängt niemals davon ab. Siehe [Konto & Dashboard](/qorex/account-and-dashboard#handle).

## Nächste Schritte

- [Senden & Empfangen](/qorex/send-and-receive) — führe deinen ersten quantensicheren Transfer durch.
- [Sicherheit & Wiederherstellung](/qorex/security-and-recovery) — richte Social Recovery ein, damit du niemals ausgesperrt wirst.
- [Portfolio & Staking](/qorex/portfolio-and-staking) — verfolge Vermögenswerte und verdiene Staking-Belohnungen.
