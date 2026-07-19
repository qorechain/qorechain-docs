---
slug: /qorex/security-and-recovery
title: Sicherheit & Wiederherstellung
sidebar_label: Sicherheit & Wiederherstellung
sidebar_position: 5
---

# Sicherheit & Wiederherstellung

Alles rund um den Schutz und die Wiederherstellung Ihres Wallets finden Sie unter **Einstellungen → Sicherheits-Dashboard**. Der Home-Tab zeigt außerdem eine Karte **Backup-Zustand**, die so lange warnt, bis die soziale Wiederherstellung eingerichtet ist.

## Post-Quanten-Schlüssel {#pqc-key}

Das Sicherheits-Dashboard zeigt den aktuellen On-Chain-Status Ihres Post-Quanten-Schlüssels: **„Wird bei Ihrer ersten Übertragung registriert"** → **„On-Chain registriert ✓"**. Der Algorithmus ist **ML-DSA-87** (deterministisch, hybrid mit secp256k1).

**Schlüsselrotation** — das Rotieren Ihres Post-Quanten-Schlüssels (eine On-Chain-Operation `MsgRotatePQCKey`) erfordert eine erneute biometrische Zeremonie und wird **niemals automatisiert**. Siehe [Schlüsselrotation](/developer-guide/post-quantum-signing#key-rotation) für den zugrunde liegenden Mechanismus.

## Soziale Wiederherstellung {#social-recovery}

Die soziale Wiederherstellung ermöglicht es vertrauenswürdigen **Guardians**, Ihnen bei der Wiederherstellung Ihres Wallets zu helfen, ohne jemals Ihre Wiederherstellungsphrase zu sehen.

- Ihr Seed wird in **ML-KEM-versiegelte Shares** aufgeteilt und als **Schwellenwert**-Schema (t-of-n) an Guardians verteilt: jeweils *t* Ihrer *n* Guardians können Ihnen bei der Wiederherstellung helfen, weniger jedoch nicht.
- Jeder Guardian erhält eine Berechtigung. Bei der Einrichtung wird nichts Lesbares an das Relay geschrieben — nur undurchsichtige, versiegelte Umschläge.
- Eine Wiederherstellung erfordert, dass die Schwelle der Guardians zustimmt, läuft dann durch eine **48-Stunden-Zeitsperre** und sendet Ihnen eine **Abbruchwarnung**, sodass ein böswilliger Versuch gestoppt werden kann.

**Einrichten:** Sicherheits-Dashboard → Soziale Wiederherstellung → wählen Sie Ihre Guardians und den Schwellenwert. Die Warnung zum Backup-Zustand verschwindet, sobald dies abgeschlossen ist.

**Die Wiederherstellung einer anderen Person genehmigen:** Wenn Sie Guardian für jemanden sind, verwenden Sie **Bei Wiederherstellung helfen** im Home-Tab, um deren Anfrage zu genehmigen.

## Legacy Protocol {#legacy}

**Legacy Protocol** ist quantensichere Vererbung: ein Totmannschalter, der über Ihre Guardians gelegt wird, sodass Ihre Vermögenswerte an die von Ihnen gewählten Begünstigten übergehen können, falls Sie nicht mehr erreichbar sind. Es ist optional und wird über das Sicherheits-Dashboard konfiguriert.

## Ein neues Gerät verknüpfen {#link-device}

Verschieben Sie Ihr Wallet auf ein zweites Smartphone oder Tablet **ohne Server und ohne Eintippen** der 24 Wörter:

1. **Neues Gerät** → Onboarding → **Von einem anderen Gerät verknüpfen**. Es zeigt einen einmaligen **10-stelligen Code** und öffnet die Kamera.
2. **Altes Gerät** → Einstellungen → Sicherheit → **Ein neues Gerät verknüpfen** → geben Sie diesen Code ein → bestätigen Sie mit Biometrie. Ein **QR-Code** erscheint (Ihr Seed, versiegelt mit einem aus dem Code abgeleiteten Schlüssel: scrypt N=2¹⁷ → AES-256-GCM).
3. **Neues Gerät** scannt den QR → er wird lokal entschlüsselt → dasselbe Wallet, dieselben Adressen.

**Warum es sicher ist:** der Code und der QR erscheinen niemals auf demselben Bildschirm. Ein Foto des QR allein ist Chiffretext hinter einer speicherharten Schlüsselableitungsfunktion, und beide Artefakte sind einmalig und verschwinden mit den Bildschirmen. Ein falscher Code liefert eine saubere Fehlermeldung — versuchen Sie es einfach erneut.

:::note
Die Geräteverknüpfung ist eine **Bequemlichkeit**, keine Wiederherstellungsmethode. Ihre 24-Wörter-Phrase und die soziale Wiederherstellung sind Ihre eigentlichen Sicherheitsnetze.
:::

## Verbundene dApps {#connected-dapps}

dApp-Verbindungen sind **pro Origin** und **Sitzungsgebunden**: Das Schließen des in der App integrierten dApp-Browsers widerruft jede Verbindung. Sie können aktive Verbindungen im Sicherheits-Dashboard überprüfen und trennen.

## Verknüpfte Signierende & Ausgabelimits {#linked-signers}

Wenn Sie externe Schlüssel (Phantom / MetaMask) über das [Dashboard](/qorex/account-and-dashboard#dashboard) verknüpfen, erhält jeder **eingeschränkte Berechtigungen** und eine **SpendingRule**, die **On-Chain** durchgesetzt wird, nicht nur in der Oberfläche. Die Schlüsselverwaltung kann niemals an einen verknüpften Schlüssel delegiert werden. Siehe [Linked Wallet Authenticators](/developer-guide/account-abstraction#authenticators) für das On-Chain-Modell. Das Dashboard zeigt immer die aktuelle On-Chain-Wahrheit.

## Q-Day Scanner {#q-day-scanner}

Der **Q-Day Scanner** ermöglicht es Ihnen, eine beliebige Adresse einzugeben — Ihre eigene oder die einer anderen Person — und einen Bericht zur Quantengefährdung zu erhalten: welche Gelder auf rein klassischen Schlüsseln liegen und welche bereits post-quantum geschützt sind. Sie erreichen ihn über die Schnellschaltflächen im Home-Tab.

## Sicherheitsmodell, in Kürze

1. **Non-custodial** — Schlüssel werden auf dem Gerät generiert, leben in hardwaregestützten Tresoren (mobil) oder einem verschlüsselten Tresor (Erweiterung) und verlassen es niemals.
2. **Nichts ohne Zustimmung** — jede Verbindung erfolgt pro Origin, jede Signatur wird einzeln genehmigt (biometrisch auf Mobilgeräten), und Nutzdaten werden vor dem Signieren stets dekodiert.
3. **Quantensicher standardmäßig** — QOR-Übertragungen der Native-Lane tragen immer ML-DSA-87 + secp256k1; alles Klassische wird gekennzeichnet, niemals stillschweigend.
4. **Keine Datenerfassung** — keine Analytik, kein Tracking, keine Werbung. Die optionale Kontoanmeldung ist durch die [QoreChain-Datenschutzrichtlinie](https://qorechain.io/privacy) abgedeckt.
5. **Wiederherstellungswege** — 24-Wörter-Phrase (immer), soziale Wiederherstellung mit Guardians + 48h-Zeitsperre (optional), Legacy-Vererbung (optional), Geräteverknüpfung (Bequemlichkeit).
