---
slug: /qorex/account-and-dashboard
title: Konto & Dashboard
sidebar_label: Konto & Dashboard
sidebar_position: 6
---

# Konto & Dashboard

QoreX funktioniert **vollständig ohne Konto** — Ihre Schlüssel hängen niemals von einem Konto ab. Die Anmeldung fügt lediglich Annehmlichkeiten hinzu wie @handles, Zahlungsanfragen und die Kopplung mit dem Dashboard.

## Anmelden {#sign-in}

Sie können sich über **Sign in** auf dem Home-Tab anmelden oder während des Onboardings. Methoden:

- **E-Mail-Code** — geben Sie Ihre E-Mail-Adresse ein und erhalten Sie einen Einmalcode. Nach dieser Anmeldung bietet QoreX an, einen **Passkey** für sofortige künftige Anmeldungen hinzuzufügen (Face ID / Touch ID / PIN). Dies ist ein *Konto*-Passkey — er berührt niemals Ihre Wallet-Schlüssel.
- **Passkey** — falls Sie zuvor einen registriert haben.
- **Continue with Google** — ein einziger nativer Sprung durch das System-Authentifizierungsblatt (die App springt niemals in einen Browser hinaus).
- **Continue with QORECHAIN Dashboard** — melden Sie sich mit einem bestehenden Dashboard-Konto an (einschließlich dessen Google-Login) und importieren Sie Ihr Profil.

:::note
Das Passkey-Angebot erscheint nur nach der Anmeldung per **E-Mail-Code**. Wenn Sie sich mit einem Identitätsanbieter (Google oder Dashboard) anmelden, verwaltet dieser Anbieter seine eigene Authentifizierung, sodass an diese Konten kein Passkey angehängt werden kann.
:::

## @handle {#handle}

Beanspruchen Sie einen eindeutigen Namen (zum Beispiel `@liviu`), der durch **doppelte Signaturen** an Ihre Adresse gebunden ist (eine ed25519-Signatur der Registry + Ihre eigene secp256k1-Signatur). Jeder kann dann an Ihr @handle senden. Die Auflösung erfolgt nach dem Prinzip **verify-then-pin** (Trust-on-First-Use), sodass QoreX es kennzeichnet, falls der Schlüssel eines Handles jemals unbemerkt geändert wird.

Ist die Handle-Registry vorübergehend nicht erreichbar, wechselt der Bildschirm zu **"Handles coming soon"** und alles andere funktioniert weiter; Handles werden automatisch wieder aktiv, sobald die Registry zurückkehrt.

## Verknüpftes Konto {#linked-account}

**Settings → Linked account** verbindet Ihr QoreX-Wallet und Ihr Dashboard-Konto in beide Richtungen:

1. Geben Sie den 8-character-Code ein, der vom Dashboard angezeigt wird, **oder** erstellen Sie einen in QoreX (10 Minuten gültig) und tippen Sie ihn in das Dashboard ein.
2. Sobald verknüpft, erscheinen Ihr @handle und Ihre verbundenen Adressen auf beiden.
3. Trennen Sie die Verknüpfung jederzeit.

Die Anmeldung *über* **Continue with Dashboard** verknüpft beide implizit — es ist nichts Zusätzliches zu tun.

## Dashboard-Integration {#dashboard}

Wenn das Dashboard verbunden ist:

- **Connect with QoreX** auf dem Dashboard koppelt es über einen `qorex://connect` Deep Link plus einen signierten Eigentumsnachweis mit Ihrem Wallet.
- **Auf dem Dashboard initiierte Transfers** treffen in QoreX als `qorex://tx`-Anfragen ein. Sie werden dekodiert, Ihnen vollständig angezeigt und **nur in der App** nach biometrischer Freigabe signiert — und nur von der eigenen abgeleiteten Adresse der App.
- **Ihre Adressen (Settings)** — listet jedes aus diesem Wallet abgeleitete Konto auf, plus **schreibgeschützte** Adressen, die Sie aus anderen Wallets (Keplr / MetaMask / Phantom) verknüpft haben. Schreibgeschützte Einträge sind mit dem Wallet gekennzeichnet, das sie erstellt hat; der Versuch, von einer solchen Adresse zu senden, erklärt, dass Sie aus dem Wallet senden müssen, das sie erstellt hat.

## Nächste Schritte

- [Sicherheit & Wiederherstellung](/qorex/security-and-recovery) — verknüpfte Signierer und Ausgabelimits bauen auf dieser Kopplung auf.
- [dApp-Browser](/qorex/dapp-browser) — verbinden Sie sich von innerhalb von QoreX mit Apps.
