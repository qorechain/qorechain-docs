---
slug: /qorex/dapp-browser
title: dApp Browser
sidebar_label: dApp Browser
sidebar_position: 7
---

# dApp Browser (mobile)

QoreX includes an in-app **dApp browser** so you can use QoreChain applications without leaving the wallet, with every signature explicitly approved. It is for mobile users who want to use a web app without installing anything else, and for developers testing their app inside the mobile wallet.

## Innovations {#innovations}

- **Session-scoped connections.** One approval per origin, and every connection ends when you close the browser.
- **Decoded, biometric-gated signatures.** Each signature is its own approval, with the payload decoded; what QoreX cannot decode, it refuses.
- **`signAndBroadcast`.** A page sends the messages; QoreX shows them, adds the ML-DSA-87 layer that only the wallet can make, and broadcasts.
- **Discovery without taking over.** QoreX announces itself with EIP-6963 and never overwrites another wallet's `window.ethereum` or `window.keplr`.

## How to access {#how-to-access}

The dApp browser is part of the mobile app: install it from the App Store (iOS 15.1 or later) or Google Play (Android 7.0 or later); the links are in the [overview](/qorex/overview#how-to-access). It needs no account. For desktop dApps, use the [Browser Extension](/qorex/browser-extension).

## Connecting to a dApp {#how-to-use}

Open the **dApp browser** from the Home tab and navigate to an app. Type or paste the dApp's address in the **Enter a dApp URL** box (only `https://` addresses connect). QoreX injects its providers into the page as `window.qorex` - a QoreChain Native provider (including `signAndBroadcast`), a read-only EVM provider (account and chain queries only), and a Solana provider - and also announces itself through EIP-6963. It sets `window.ethereum` only when no other wallet has, and never overwrites another wallet. There is no `window.keplr` alias.

- **Connecting** takes **one approval per origin**. Approving reveals only your public address to that site.
- **Every signature** is its own biometric-gated approval, with the payload **decoded** so you can see exactly what you are signing - there is **no blind signing**.
- **All permissions die when the browser closes** - connections are session-scoped.
- **Native transactions go through `signAndBroadcast`:** QoreX shows every message, the fee and the signing account, adds the ML-DSA-87 layer and broadcasts. The EVM provider here only answers account and chain queries; it does not sign or send EVM transactions. See [What the approval window shows](/qorex/security-and-recovery#approvals).

## Q-Day Scanner

From the Home tab quick buttons you can also open the **Q-Day Scanner**: enter any Bitcoin or Ethereum address to get an exposure report. See [Security & Recovery](/qorex/security-and-recovery#q-day-scanner).

## Settings quick reference

Other useful entries in **Settings**:

- **Security** → [Security & Recovery](/qorex/security-and-recovery)
- **Language** - follows the phone by default; 10 languages
- **Take the tour again** - five short cards on what QoreX does and where things are
- **Coins and networks** - everything the wallet can hold and send today
- **Wallets** - several recovery phrases on this phone - see [Several wallets](/qorex/getting-started#several-wallets)
- **Your accounts** and **Your addresses** → [Account & Dashboard](/qorex/account-and-dashboard)
- **Claim your @handle** and **Linked account** → [Account & Dashboard](/qorex/account-and-dashboard)
- **Use testnet (developers)** - switches to the `qorechain-diana` testnet (EVM chain ID 9800); the app re-binds live, with no restart. The default is always mainnet. Testnet balances show no USD value.
- **Portfolio animation** - toggles the Aurora background.
- **Delete account** → [Delete your account](/qorex/account-and-dashboard#delete-account)
- **Connected to** - shows the active network and its chain ID.

## Platform notes

- **iOS** (iOS 15.1 or later) - Face ID (a usage prompt appears on first use), a Secure Enclave vault, sign-in through the system authentication sheet, and a camera permission for device-linking and QR scanning.
- **Android** (Android 7.0 or later) - BiometricPrompt with a StrongBox Keystore, deep links registered for `qorex://` flows (auth callback, connect, tx, link), and a camera permission for device-linking.

For desktop dApps, use the [Browser Extension](/qorex/browser-extension) instead.

## Where it is published {#where-published}

The dApp browser ships inside the QoreX mobile app (App Store and Google Play); see [Where it is published](/qorex/overview#where-published) for the listings and current versions. It is not a separate download.

## Limits and known issues {#limits}

- Only `https://` addresses connect.
- The EVM provider here answers account and chain queries only; it does not sign or send EVM transactions or messages. `signArbitrary` (message signing) is not supported.
- `window.qorex.native` is Keplr-style, not a Keplr drop-in, and there is no `window.keplr` alias.
- Connections do not persist: they end when the browser closes.
- The Q-Day Scanner, social recovery and Legacy are in the app, not in the extension.
