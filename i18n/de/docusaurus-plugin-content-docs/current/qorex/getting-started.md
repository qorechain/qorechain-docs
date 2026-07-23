---
slug: /qorex/getting-started
title: Erste Schritte mit QoreX
sidebar_label: Erste Schritte
sidebar_position: 2
---

# Erste Schritte mit QoreX

Diese Seite führt durch die Installation der mobilen App sowie das Erstellen, Wiederherstellen oder Verknüpfen deiner Wallet.

## Bevor du beginnst: sichere dein Gerät

Eine QoreX-Wallet kann nur erstellt oder importiert werden, wenn auf deinem Gerät ein **starker Entsperrfaktor** eingerichtet ist. Dieser schützt deine Schlüssel im Hardware-Tresor. Jede der folgenden Optionen erfüllt die Anforderung:

- **iOS** — Face ID oder Touch ID.
- **Android** — eine Class-3-Biometrie (Fingerabdruck, Iris oder 3D-Gesichtsentsperrung) **oder** eine Bildschirmsperre des Geräts (PIN, pattern oder password).

:::note Android 2D-Gesichtsentsperrung
Die kamerabasierte 2D-Gesichtsentsperrung (auf manchen Geräten zu finden, z. B. bestimmten Samsung-Modellen) gilt als *schwache* Biometrie. Wenn du nur diese hast, verlässt sich QoreX auf die dahinterliegende **PIN / pattern** — und die Systemabfrage bietet sie automatisch an, sodass du weiterhin geschützt bist.
:::

Wenn kein starker Faktor eingerichtet ist, bleiben die Schaltflächen zum Erstellen/Importieren deaktiviert und der Bildschirm erklärt, was du aktivieren musst. Richte Face ID, einen Fingerabdruck oder eine Bildschirmsperre in deinen Systemeinstellungen ein und kehre dann zu QoreX zurück.

## Erster Start

Die App öffnet sich **nur dann** auf dem Onboarding-Bildschirm, wenn auf dem Gerät noch keine Wallet vorhanden ist. Sobald du eine Wallet hast, führt jeder spätere Start direkt zum Tab Home (Wallet). Das Ansehen von Guthaben erfordert keine Biometrie; **das Signieren einer Transaktion immer**.

Du hast drei Möglichkeiten der Einrichtung:

### 1. Eine neue Wallet erstellen

1. Tippe auf **Create a new wallet**.
2. QoreX generiert eine **24-Wörter-Wiederherstellungsphrase** auf deinem Gerät (256-Bit-Entropie) und leitet daraus deine QoreChain-Identität ab — coin type 118, eine `qor1…`-Adresse (deine ETH- und SOL-Konten stammen aus demselben Seed).
3. **Schreibe die 24 Wörter auf** und bewahre sie offline auf. Diese Phrase ist die **einzige** Möglichkeit, deine Wallet wiederherzustellen, falls du das Gerät verlierst.
4. Bestätige die Phrase; QoreX versiegelt sie im hardwaregestützten, biometrisch geschützten Tresor.

:::caution Deine Wiederherstellungsphrase ist alles
Jeder mit deinen 24 Wörtern kontrolliert deine Gelder, und niemand — auch nicht die QoreChain Association — kann sie für dich wiederherstellen. Gib deine Phrase niemals auf einer Website ein, teile sie nicht und speichere sie nicht in einem Screenshot oder einer Cloud-Notiz.
:::

### 2. Eine bestehende Wallet wiederherstellen

1. Tippe auf **Restore existing wallet**.
2. Gib deine 24 Wörter der Reihe nach ein.
3. QoreX leitet dieselben Adressen erneut ab — deine Wallet sieht auf jedem Gerät identisch aus.

### 3. Von einem anderen Gerät verknüpfen

Wenn du QoreX bereits auf einem anderen Smartphone oder Tablet hast, kannst du die Wallet **ohne Server und ohne Tippen** übertragen — siehe [Ein neues Gerät verknüpfen](/qorex/security-and-recovery#link-device). Wähle auf dem neuen Gerät **Link from another device**, um zu beginnen.

## Optional: einen @handle beanspruchen

Nachdem deine Wallet erstellt wurde, kannst du einen eindeutigen **@handle** (zum Beispiel `@liviu`) beanspruchen, damit dir Leute unter deinem Namen statt einer `qor1…`-Adresse senden können. Dies ist optional und kann übersprungen werden — deine Wallet hängt niemals davon ab. Siehe [Account & Dashboard](/qorex/account-and-dashboard#handle).

## Nächste Schritte

- [Senden & Empfangen](/qorex/send-and-receive) — führe deinen ersten quantensicheren Transfer durch.
- [Sicherheit & Wiederherstellung](/qorex/security-and-recovery) — richte die soziale Wiederherstellung ein, damit du niemals ausgesperrt wirst.
- [Portfolio & Staking](/qorex/portfolio-and-staking) — verfolge Assets und verdiene Staking-Belohnungen.
