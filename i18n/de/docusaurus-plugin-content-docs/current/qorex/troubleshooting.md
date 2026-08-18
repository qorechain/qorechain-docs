---
slug: /qorex/troubleshooting
title: QoreX Fehlerbehebung
sidebar_label: Fehlerbehebung
sidebar_position: 9
---

# Fehlerbehebung

Häufige Fragen und schnelle Lösungen für die QoreX-App und -Erweiterung.

| Symptom | Ursache / Lösung |
|---|---|
| **„Sichern Sie zuerst Ihr Gerät"** beim Onboarding | Richten Sie Face ID / einen Fingerabdruck **oder eine Bildschirmsperre (PIN / Muster)** in Ihren Systemeinstellungen ein und kehren Sie dann zurück. Ein Wallet kann nur auf einem Gerät mit einem starken Entsperrfaktor erstellt werden. Unter Android ist die 2D-Gesichtsentsperrung allein eine *schwache* Biometrie — die dahinterliegende PIN ist das, was qualifiziert. |
| **Anmeldeblatt geschlossen** / „Dieser Anmeldeversuch ist abgelaufen" | Ein vorheriger Versuch wurde abgebrochen — tippen Sie einfach erneut auf Anmelden. |
| **„Passkey hinzufügen" fehlt** nach der Anmeldung über Google / Dashboard | Erwartet: Passkeys werden nur an Konten mit E-Mail-Code angehängt (siehe den Hinweis unter [Konto & Dashboard](/qorex/account-and-dashboard#sign-in)). |
| **„Handles in Kürze verfügbar"** | Das @handle-Register ist vorübergehend nicht erreichbar. Ihr Wallet ist nicht betroffen; Handles werden automatisch aktiviert, sobald das Register zurückkehrt. |
| **„Falscher Code oder beschädigter QR"** beim Verknüpfen von Geräten | Überprüfen Sie den 10-stelligen Code erneut (das Alphabet lässt ähnlich aussehende Zeichen aus: kein 0/O/1/I/L) und scannen Sie erneut. Beide Artefakte sind einmalig verwendbar. |
| **Kamerabildschirm meldet, dass eine Berechtigung erforderlich ist** | iOS: Einstellungen → QoreX → Kamera. Android: App-Info → Berechtigungen → Kamera. |
| **Erweiterung: kein Wallet beim ersten Öffnen** | Die Erweiterung ist ein **eigenständiges** Wallet — öffnen Sie das Popup und wählen Sie **Wallet erstellen** oder **Wallet importieren**. Die mobile App ist nicht erforderlich. |
| **Senden von einer schreibgeschützten Adresse abgelehnt** | Diese Adresse gehört zu einem anderen Wallet (die Bezeichnung zeigt, zu welchem). QoreX kann nur für seine eigenen abgeleiteten Konten signieren — senden Sie von dem Wallet, dem die Adresse gehört. |
| **Testnet-Badge wird angezeigt** | Einstellungen → **„Testnet verwenden (Entwickler)"** ist aktiviert. Deaktivieren Sie es, um zum Mainnet zurückzukehren. |
| **Swap-Schaltfläche ist deaktiviert** | Vorerst erwartet — Swap wird automatisch aktiviert, sobald Pool-Liquidität verfügbar ist; ein App-Update ist nicht erforderlich. |

## Kommen Sie nicht weiter?

- Sehen Sie sich die Seite [Sicherheit & Wiederherstellung](/qorex/security-and-recovery) für Guardians und die Geräteverknüpfung an.
- Für Fragen zu QoreChain selbst siehe die [Hauptdokumentation](/introduction/what-is-qorechain) oder die Community-Kanäle, die auf [qorechain.io](https://qorechain.io) verlinkt sind.
