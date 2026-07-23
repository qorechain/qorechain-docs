---
slug: /qorex/troubleshooting
title: QoreX Fehlerbehebung
sidebar_label: Fehlerbehebung
sidebar_position: 9
---

# Fehlerbehebung

Häufige Fragen und schnelle Lösungen für die QoreX App und Erweiterung.

| Symptom | Ursache / Lösung |
|---|---|
| **„Sichern Sie zuerst Ihr Gerät"** beim Onboarding | Richten Sie in Ihren Systemeinstellungen Face ID / einen Fingerabdruck **oder eine Bildschirmsperre (PIN / Muster)** ein und kehren Sie dann zurück. Eine Wallet lässt sich nur auf einem Gerät mit einem starken Entsperrfaktor erstellen. Auf Android ist die 2D-Gesichtsentsperrung allein ein *schwacher* biometrischer Faktor — was zählt, ist die dahinterliegende PIN. |
| **Anmeldeblatt geschlossen** / „Dieser Anmeldeversuch ist abgelaufen" | Ein vorheriger Versuch wurde abgebrochen — tippen Sie einfach erneut auf Anmelden. |
| **„Passkey hinzufügen" fehlt** nach der Anmeldung über Google / Dashboard | Erwartet: Passkeys werden nur mit Konten verknüpft, die per E-Mail-Code angemeldet sind (siehe den Hinweis unter [Konto & Dashboard](/qorex/account-and-dashboard#sign-in)). |
| **„Handles bald verfügbar"** | Das @handle-Register ist vorübergehend nicht erreichbar. Ihre Wallet ist davon nicht betroffen; Handles werden automatisch aktiviert, sobald es wieder verfügbar ist. |
| **„Falscher Code oder beschädigter QR"** beim Verknüpfen von Geräten | Überprüfen Sie den 10-stelligen Code erneut (das Alphabet lässt verwechselbare Zeichen weg: kein 0/O/1/I/L) und scannen Sie neu. Beide Artefakte sind einmalig gültig. |
| **Kamerabildschirm meldet, dass eine Berechtigung erforderlich ist** | iOS: Einstellungen → QoreX → Kamera. Android: App-Info → Berechtigungen → Kamera. |
| **Erweiterung: „Noch keine Wallet"** | Die Erweiterung koppelt sich mit einer Wallet, die in der QoreX Mobile-App erstellt wurde — erstellen Sie dort zuerst eine. |
| **Senden von einer schreibgeschützten Adresse abgelehnt** | Diese Adresse gehört zu einer anderen Wallet (das Label zeigt, zu welcher). QoreX kann nur für seine eigenen abgeleiteten Konten signieren — senden Sie von der Wallet, die die Adresse besitzt. |
| **Testnet-Badge wird angezeigt** | Einstellungen → **„Testnet verwenden (Entwickler)"** ist aktiviert. Schalten Sie es aus, um zum Mainnet zurückzukehren. |
| **Swap-Schaltfläche ist deaktiviert** | Vorerst erwartet — Swap wird automatisch aktiviert, sobald Pool-Liquidität verfügbar ist; ein App-Update ist nicht erforderlich. |

## Weiterhin blockiert?

- Sehen Sie sich die Seite [Sicherheit & Wiederherstellung](/qorex/security-and-recovery) für Guardians und das Verknüpfen von Geräten an.
- Für Fragen zu QoreChain selbst finden Sie Informationen in der [Hauptdokumentation](/introduction/what-is-qorechain) oder in den auf [qorechain.io](https://qorechain.io) verlinkten Community-Kanälen.
