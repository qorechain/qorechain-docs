---
slug: /qorex/dapp-browser
title: dApp Browser
sidebar_label: dApp Browser
sidebar_position: 7
---

# dApp Browser (mobile)

QoreX includes an in-app **dApp browser** so you can use QoreChain applications without leaving the wallet, with every signature explicitly approved.

## Connecting to a dApp

Open the **dApp browser** from the Home tab and navigate to an app. QoreX injects its providers into the page — a QoreChain connect provider, a read-only EVM provider, and polite `keplr` / `ethereum` aliases that **never hijack** other real wallets.

- **Connecting** takes **one approval per origin**. Approving reveals only your public address to that site.
- **Every signature** is its own biometric-gated approval, with the payload **decoded** so you can see exactly what you are signing — there is **no blind signing**.
- **All permissions die when the browser closes** — connections are session-scoped.

## Q-Day Scanner

From the Home tab quick buttons you can also open the **Q-Day Scanner**: enter any address to get its quantum-exposure report — which funds sit on classical-only keys and which are already post-quantum protected. See [Security & Recovery](/qorex/security-and-recovery#q-day-scanner).

## Settings quick reference

Other useful controls in **Settings**:

- **Security dashboard** → [Security & Recovery](/qorex/security-and-recovery)
- **Your addresses** and **Linked account** → [Account & Dashboard](/qorex/account-and-dashboard)
- **Use testnet (developers)** — switches to the `qorechain-diana` testnet (EVM chain ID 9800); the app re-binds live, with no restart. The default is always mainnet.
- **Portfolio animation** — toggles the Aurora background.
- **Network status** — shows "Connected to …" with the active endpoints.

## Platform notes

- **iOS** — Face ID (a usage prompt appears on first use), a Secure Enclave vault, sign-in through the system authentication sheet, and a camera permission for device-linking and QR scanning.
- **Android** — BiometricPrompt with a StrongBox Keystore, deep links registered for `qorex://` flows (auth callback, connect, tx, link), and a camera permission for device-linking.

For desktop dApps, use the [Browser Extension](/qorex/browser-extension) instead.
