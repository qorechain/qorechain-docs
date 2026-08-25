---
slug: /qorex/security-and-recovery
title: Sicherheit & Wiederherstellung
sidebar_label: Sicherheit & Wiederherstellung
sidebar_position: 5
---

# Sicherheit & Wiederherstellung

Alles rund um den Schutz und die Wiederherstellung deiner Wallet findest du unter **Einstellungen → Sicherheits-Dashboard**. Der Home-Tab zeigt außerdem eine **Backup-Health**-Karte, die so lange warnt, bis die soziale Wiederherstellung eingerichtet ist.

## Jetzt sichern — niemand kann eine verlorene Wallet für dich wiederherstellen {#back-up-now}

:::danger Lies dies, bevor du deine Wallet mit Guthaben befüllst
QoreX ist **non-custodial**: Deine Schlüssel existieren ausschließlich auf deinem eigenen Gerät, und QoreChain Association besitzt weder eine Kopie davon noch einen Hauptschlüssel noch eine Möglichkeit, deine Wallet zurückzusetzen oder wiederherzustellen. **Es gibt keinen „Passwort vergessen"-Ablauf, kein Support-Ticket und keine kundendienstliche Umgehung** — verlierst du den Zugriff auf deine Schlüssel ohne vorhandenes Backup, sind die Mittel dauerhaft und unwiderruflich verloren. Das gilt für jede non-custodial Wallet, nicht nur für QoreX — aber es lohnt sich, es klar auszusprechen.

**Mach mindestens eines davon — direkt nach dem Erstellen deiner Wallet, nicht später:**

1. **Schreibe deine 24-Wörter-Wiederherstellungsphrase auf** und bewahre sie offline und dauerhaft auf (kein Screenshot, keine mit der Cloud synchronisierte Notiz, keine Nachricht an dich selbst). Sie ist das Einzige, das deine Wallet auf jedem Gerät und zu jeder Zeit wiederherstellen kann — auf Mobilgeräten erfordert die direkte Wiederherstellung aus der Phrase Version **1.0.4 oder neuer** (ältere Builds bieten nur den Guardian-Weg an; siehe [Eine bestehende Wallet wiederherstellen](/qorex/getting-started#2-restore-an-existing-wallet)). Die Erweiterung stellt in jeder Version stets direkt aus der Phrase wieder her.
2. **Richte [soziale Wiederherstellung](#social-recovery)** mit Guardians ein, denen du vertraust. So kannst du deine Wallet auch dann wiederherstellen, wenn du die Phrase verlierst — ohne dass ein einzelner Guardian jemals allein auf deine Gelder zugreifen könnte.

Beides zu tun ist die sicherste Option — die Phrase schützt dich, wenn du das Gerät wechselst oder die App nicht verfügbar ist; die Guardians schützen dich, wenn du die Phrase selbst verlierst.

**Das Deinstallieren der App löscht deine Schlüssel von diesem Gerät.** Der Vault der mobilen App und der Vault der Browser-Erweiterung existieren jeweils nur auf dem Gerät, das sie erzeugt hat. Das Deinstallieren der App, das Zurücksetzen des Telefons oder das Entfernen/Löschen der Erweiterung löscht diese Kopie — ohne Backup und ohne verknüpftes Gerät kann deine Wallet von niemandem wiederhergestellt werden, auch nicht von QoreChain.
:::

## Post-Quanten-Schlüssel {#pqc-key}

Das Sicherheits-Dashboard zeigt den aktuellen On-Chain-Status deines Post-Quanten-Schlüssels: **„Registrierung mit deiner ersten Überweisung"** → **„On-Chain registriert ✓"**. Der Algorithmus ist **ML-DSA-87** (deterministisch, hybrid mit secp256k1).

**Schlüsselrotation** — die Rotation deines Post-Quanten-Schlüssels (eine On-Chain-Operation `MsgRotatePQCKey`) erfordert eine neue biometrische Zeremonie und wird **niemals automatisiert**. Den zugrunde liegenden Mechanismus findest du unter [Schlüsselrotation](/developer-guide/post-quantum-signing#key-rotation).

## Soziale Wiederherstellung {#social-recovery}

Die soziale Wiederherstellung lässt vertrauenswürdige **Guardians** dir helfen, deine Wallet wiederherzustellen, ohne jemals deine Wiederherstellungsphrase zu sehen.

- Dein Seed wird in **ML-KEM-versiegelte Shares** aufgeteilt und als **Schwellenwert**-Schema (t-von-n) an Guardians verteilt: Jede beliebige Gruppe von *t* deiner *n* Guardians kann dir bei der Wiederherstellung helfen, weniger jedoch nicht.
- Jeder Guardian erhält ein Credential. Die Einrichtung schreibt nichts Lesbares an das Relay — nur undurchsichtige, versiegelte Umschläge.
- Eine Wiederherstellung erfordert die Zustimmung des Schwellenwerts an Guardians, durchläuft dann eine **48-Stunden-Zeitsperre** und sendet dir einen **Abbruch-Alarm**, sodass ein böswilliger Versuch gestoppt werden kann.

**Einrichtung:** Sicherheits-Dashboard → Soziale Wiederherstellung → wähle deine Guardians und den Schwellenwert. Die Backup-Health-Warnung verschwindet, sobald dies erledigt ist.

**Die Wiederherstellung einer anderen Person genehmigen:** Wenn du für jemanden Guardian bist, nutze **Wiederherstellung helfen** im Home-Tab, um dessen Anfrage zu genehmigen.

## Legacy Protocol {#legacy}

**Legacy Protocol** ist quantensichere Vererbung: ein Totmannschalter, der über deine Guardians gelegt wird, sodass dein Vermögen an deine gewählten Begünstigten übergehen kann, falls du nicht mehr erreichbar bist. Es ist optional und wird über das Sicherheits-Dashboard konfiguriert.

## Neues Gerät verknüpfen {#link-device}

Verschiebe deine Wallet auf ein zweites Telefon oder Tablet **ohne Server und ohne die 24 Wörter einzutippen**:

1. **Neues Gerät** → Onboarding → **Von einem anderen Gerät verknüpfen**. Es zeigt einen einmaligen **10-stelligen Code** an und öffnet die Kamera.
2. **Altes Gerät** → Einstellungen → Sicherheit → **Neues Gerät verknüpfen** → diesen Code eingeben → mit Biometrie bestätigen. Ein **QR-Code** erscheint (dein Seed, versiegelt mit einem aus dem Code abgeleiteten Schlüssel: scrypt N=2¹⁷ → AES-256-GCM).
3. **Neues Gerät** scannt den QR-Code → entschlüsselt lokal → gleiche Wallet, gleiche Adressen.

**Warum es sicher ist:** Der Code und der QR-Code erscheinen niemals auf demselben Bildschirm. Ein Foto allein vom QR-Code ist Chiffretext hinter einer speicherintensiven Schlüsselableitungsfunktion, und beide Artefakte sind einmalig und verschwinden mit den Bildschirmen. Ein falscher Code liefert eine eindeutige Fehlermeldung — einfach erneut versuchen.

:::note
Die Geräteverknüpfung ist eine **Annehmlichkeit**, keine Wiederherstellungsmethode. Deine 24-Wörter-Phrase und die soziale Wiederherstellung sind deine eigentlichen Sicherheitsnetze.
:::

## Verbundene dApps {#connected-dapps}

dApp-Verbindungen sind **pro Ursprung (per-origin)** und **sitzungsgebunden**: Das Schließen des In-App-dApp-Browsers widerruft jede Verbindung. Du kannst aktive Verbindungen im Sicherheits-Dashboard überprüfen und trennen.

## Verknüpfte Signierer & Ausgabelimits {#linked-signers}

Wenn du externe Schlüssel (Phantom / MetaMask) über das [Dashboard](/qorex/account-and-dashboard#dashboard) verknüpfst, erhält jeder davon **eingeschränkte Berechtigungen** und eine **SpendingRule**, die **on-chain** durchgesetzt wird — nicht nur in der Oberfläche. Die Schlüsselverwaltung kann niemals an einen verknüpften Schlüssel delegiert werden. Das zugrunde liegende On-Chain-Modell findest du unter [Linked Wallet Authenticators](/developer-guide/account-abstraction#authenticators). Das Dashboard zeigt immer den aktuellen On-Chain-Zustand.

## Q-Day Scanner {#q-day-scanner}

Mit dem **Q-Day Scanner** kannst du eine beliebige Adresse eingeben — deine eigene oder die von jemand anderem — und einen Quanten-Risikobericht erhalten: welche Gelder auf rein klassischen Schlüsseln liegen und welche bereits post-quanten-geschützt sind. Erreichbar über die Schnellzugriff-Buttons im Home-Tab.

## Sicherheitsmodell im Überblick

1. **Non-custodial** — Schlüssel werden auf dem Gerät erzeugt, liegen in hardwaregestützten Vaults (mobil) oder einem verschlüsselten Vault (Erweiterung) und verlassen dieses niemals.
2. **Nichts ohne Zustimmung** — jede Verbindung ist pro Ursprung, jede Signatur wird einzeln genehmigt (biometrisch auf Mobilgeräten), und Payloads werden vor dem Signieren immer entschlüsselt und angezeigt.
3. **Standardmäßig quantensicher** — Native-Lane-QOR-Überweisungen tragen immer ML-DSA-87 + secp256k1; alles Klassische ist gekennzeichnet, niemals stillschweigend.
4. **Keine Datenerfassung** — keine Analyse, kein Tracking, keine Werbung. Die optionale Konto-Anmeldung ist durch die [QoreChain-Datenschutzrichtlinie](https://qorechain.io/privacy) abgedeckt.
5. **Wiederherstellungswege** — 24-Wörter-Phrase (immer), soziale Wiederherstellung mit Guardians + 48-Stunden-Zeitsperre (optional), Legacy-Vererbung (optional), Geräteverknüpfung (Annehmlichkeit).
