---
slug: /qorex/dapp-browser
title: dApp Browser
sidebar_label: dApp Browser
sidebar_position: 7
---

# dApp Browser (mobile)

QoreX includes an in-app **dApp browser** so you can use QoreChain applications without leaving the wallet, with every signature explicitly approved.

## Connecting to a dApp

Open the **dApp browser** from the Home tab and navigate to an app. Type or paste the dApp's address in the **Enter a dApp URL** box (only `https://` addresses connect). QoreX injects its providers into the page as `window.qorex` — a QoreChain Native provider (including `signAndBroadcast`), a read-only EVM provider (account and chain queries only), and a Solana provider — and also announces itself through EIP-6963. It sets `window.ethereum` only when no other wallet has, and never overwrites another wallet. There is no `window.keplr` alias.

- **Connecting** takes **one approval per origin**. Approving reveals only your public address to that site.
- **Every signature** is its own biometric-gated approval, with the payload **decoded** so you can see exactly what you are signing — there is **no blind signing**.
- **All permissions die when the browser closes** — connections are session-scoped.
- **Native transactions go through `signAndBroadcast`:** QoreX shows every message, the fee and the signing account, adds the quantum-safe layer and broadcasts. The EVM provider here only answers account and chain queries; it does not sign or send EVM transactions. See [What the approval window shows](/qorex/security-and-recovery#approvals).

## Q-Day Scanner

From the Home tab quick buttons you can also open the **Q-Day Scanner**: enter any address to get its quantum-exposure report — which funds sit on classical-only keys and which are already post-quantum protected. See [Security & Recovery](/qorex/security-and-recovery#q-day-scanner).

## Settings quick reference

Other useful entries in **Settings**:

- **Security** → [Security & Recovery](/qorex/security-and-recovery)
- **Language** — follows the phone by default; 10 languages
- **Take the tour again** — five short cards on what QoreX does and where things are
- **Coins and networks** — everything the wallet can hold and send today
- **Wallets** — several recovery phrases on this phone — see [Several wallets](/qorex/getting-started#several-wallets)
- **Your accounts** and **Your addresses** → [Account & Dashboard](/qorex/account-and-dashboard)
- **Claim your @handle** and **Linked account** → [Account & Dashboard](/qorex/account-and-dashboard)
- **Use testnet (developers)** — switches to the `qorechain-diana` testnet (EVM chain ID 9800); the app re-binds live, with no restart. The default is always mainnet. Testnet balances show no USD value.
- **Portfolio animation** — toggles the Aurora background.
- **Delete account** → [Delete your account](/qorex/account-and-dashboard#delete-account)
- **Connected to** — shows the active network and its chain ID.

## Platform notes

- **iOS** (iOS 15.1 or later) — Face ID (a usage prompt appears on first use), a Secure Enclave vault, sign-in through the system authentication sheet, and a camera permission for device-linking and QR scanning.
- **Android** (Android 7.0 or later) — BiometricPrompt with a StrongBox Keystore, deep links registered for `qorex://` flows (auth callback, connect, tx, link), and a camera permission for device-linking.

For desktop dApps, use the [Browser Extension](/qorex/browser-extension) instead.
