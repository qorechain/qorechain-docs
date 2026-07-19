---
slug: /qorex/troubleshooting
title: QoreX Fehlerbehebung
sidebar_label: Fehlerbehebung
sidebar_position: 9
---

# Fehlerbehebung

Häufige Fragen und schnelle Lösungen für die QoreX-App und die Erweiterung.

| Symptom | Ursache / Lösung |
|---|---|
| **"Secure your device first"** beim Onboarding | Richten Sie Face ID / einen Fingerabdruck in Ihren Systemeinstellungen ein und kehren Sie dann zur App zurück. Ein Wallet kann nur auf einem biometrisch geschützten Gerät erstellt werden. |
| **Anmeldeblatt geschlossen** / "That sign-in attempt expired" | Ein vorheriger Versuch wurde abgebrochen — tippen Sie einfach erneut auf Anmelden. |
| **"Add a passkey" fehlt** nach der Anmeldung über Google / Dashboard | Erwartet: Passkeys werden nur an E-Mail-Code-Konten angehängt (siehe den Hinweis unter [Konto & Dashboard](/qorex/account-and-dashboard#sign-in)). |
| **"Handles coming soon"** | Die @handle-Registry ist vorübergehend nicht erreichbar. Ihr Wallet ist davon nicht betroffen; Handles werden automatisch aktiviert, sobald sie wieder verfügbar ist. |
| **"Wrong code or damaged QR"** beim Verknüpfen von Geräten | Überprüfen Sie den 10-character-Code erneut (das Alphabet lässt Zeichen weg, die sich ähneln: kein 0/O/1/I/L) und scannen Sie erneut. Beide Artefakte sind einmalig. |
| **Kamerabildschirm meldet, dass eine Berechtigung erforderlich ist** | iOS: Einstellungen → QoreX → Kamera. Android: App-Info → Berechtigungen → Kamera. |
| **Erweiterung: "No wallet yet"** | Die Erweiterung wird mit einem in der mobilen QoreX-App erstellten Wallet gekoppelt — erstellen Sie dort zuerst eines. |
| **Senden von einer schreibgeschützten Adresse abgelehnt** | Diese Adresse gehört zu einem anderen Wallet (das Label zeigt, welchem). QoreX kann nur für seine eigenen abgeleiteten Konten signieren — senden Sie von dem Wallet, dem sie gehört. |
| **Testnet-Abzeichen wird angezeigt** | Einstellungen → **"Use testnet (developers)"** ist aktiviert. Deaktivieren Sie es, um zum Mainnet zurückzukehren. |
| **Swap-Schaltfläche ist deaktiviert** | Derzeit erwartet — Swap wird automatisch aktiviert, sobald Pool-Liquidität verfügbar ist; ein App-Update ist nicht erforderlich. |

## Immer noch nicht weiter?

- Lesen Sie die Seite [Sicherheit & Wiederherstellung](/qorex/security-and-recovery) für Guardians und die Geräteverknüpfung.
- Bei Fragen zu QoreChain selbst siehe die [Hauptdokumentation](/introduction/what-is-qorechain) oder die auf [qorechain.io](https://qorechain.io) verlinkten Community-Kanäle.
