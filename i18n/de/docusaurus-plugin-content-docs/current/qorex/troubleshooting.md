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
| **QoreX warnt, dass sich die Adresse eines Handles geändert hat** | Erwartetes Sicherheitsverhalten, kein Fehler — QoreX merkt sich die Adresse, zu der ein Handle beim ersten Mal, als Sie ihn bezahlt haben, aufgelöst wurde, und markiert eine spätere Änderung, anstatt ihr stillschweigend zu vertrauen. Bestätigen Sie die neue Adresse auf einem unabhängigen Kommunikationsweg beim Empfänger, bevor Sie fortfahren. |
| **Senden wegen „mehr als Ihr verfügbares Guthaben" abgelehnt** bei einem Vesting-Konto | Ein Teil Ihres Guthabens ist noch durch einen Vesting-Zeitplan gesperrt. Nur der **verfügbare** Anteil (angezeigt auf Startseite, Senden und in den Asset-Details) kann gesendet werden; der Rest wird nach und nach freigeschaltet. |
| **Eine Wallet-Anfrage besagt, sie sei „für Testnet/Mainnet, Ihr Wallet ist aber auf…"** | Die Anfrage (z. B. vom Dashboard) richtet sich an ein anderes Netzwerk als das, mit dem Sie gerade verbunden sind. Wechseln Sie zuerst selbst das Netzwerk, falls das beabsichtigt war — QoreX wechselt nicht automatisch für Sie. |
| **„Falscher Code oder beschädigter QR"** beim Verknüpfen von Geräten | Überprüfen Sie den 10-stelligen Code erneut (das Alphabet lässt ähnlich aussehende Zeichen aus: kein 0/O/1/I/L) und scannen Sie erneut. Beide Artefakte sind einmalig verwendbar. |
| **Kamerabildschirm meldet, dass eine Berechtigung erforderlich ist** | iOS: Einstellungen → QoreX → Kamera. Android: App-Info → Berechtigungen → Kamera. |
| **Erweiterung: kein Wallet beim ersten Öffnen** | Die Erweiterung ist ein **eigenständiges** Wallet — öffnen Sie das Popup und wählen Sie **Wallet erstellen** oder **Wallet importieren**. Die mobile App ist nicht erforderlich. |
| **Senden von einer schreibgeschützten Adresse abgelehnt** | Diese Adresse gehört zu einem anderen Wallet (die Bezeichnung zeigt, zu welchem). QoreX kann nur für seine eigenen abgeleiteten Konten signieren — senden Sie von dem Wallet, dem die Adresse gehört. |
| **Testnet-Badge wird angezeigt** | Einstellungen → **„Testnet verwenden (Entwickler)"** ist aktiviert. Deaktivieren Sie es, um zum Mainnet zurückzukehren. |
| **Swap-Schaltfläche ist deaktiviert** | Vorerst erwartet — Swap wird automatisch aktiviert, sobald Pool-Liquidität verfügbar ist; ein App-Update ist nicht erforderlich. |
| **Ich habe die App deinstalliert / die Erweiterung entfernt und sehe jetzt kein Wallet mehr** | Der Vault existierte nur auf diesem Gerät oder in diesem Browser. Wenn Sie Ihre 24-Wörter-Phrase gesichert hatten, stellen Sie das Wallet damit wieder her. Wenn Sie [Social Recovery](/qorex/security-and-recovery#social-recovery) eingerichtet hatten, starten Sie eine Wiederherstellung mit Ihren Guardians. Ohne eines von beidem kann das Wallet nicht wiederhergestellt werden — siehe [Jetzt sichern](/qorex/security-and-recovery#back-up-now), um jedes neue Wallet sofort zu schützen. |

## Kommen Sie nicht weiter?

- Sehen Sie sich die Seite [Sicherheit & Wiederherstellung](/qorex/security-and-recovery) für Guardians und die Geräteverknüpfung an.
- Für Fragen zu QoreChain selbst siehe die [Hauptdokumentation](/introduction/what-is-qorechain) oder die Community-Kanäle, die auf [qorechain.io](https://qorechain.io) verlinkt sind.
