---
slug: /qorex/dapp-browser
title: dApp Browser
sidebar_label: dApp Browser
sidebar_position: 7
---

# dApp Browser (mobile)

QoreX includes an in-app **dApp browser** so you can use QoreChain applications without leaving the wallet, with every signature explicitly approved. It is for mobile users who want to use a web app without installing anything else, and for developers testing their app inside the mobile wallet.

## Innovations {#innovations}

- **One approval per site, always revocable.** Each origin is approved separately; connected sites are saved on this device, per wallet, and you can revoke any of them in [My money's protection](/qorex/security-and-recovery#protection).
- **Decoded, biometric-gated signatures.** Each signature is its own approval, with the payload decoded; what QoreX cannot decode, it refuses.
- **`signAndBroadcast`.** A page sends the messages; QoreX shows them, adds the ML-DSA-87 layer that only the wallet can make, and broadcasts.
- **EVM and message signing in the browser.** EVM dApps can sign messages, typed data and transactions on QoreChain, with what each one does decoded and simulated first, and any page can ask for a message signature that also carries an ML-DSA-87 half.
- **Open a page from a link.** A `browse` link opens your page straight in the dApp browser, and the start page keeps your favourite and recent sites on the device.
- **Discovery without taking over.** QoreX announces itself with EIP-6963 and never overwrites another wallet's `window.ethereum` or `window.keplr`.

## How to access {#how-to-access}

The dApp browser is part of the mobile app: install it from the App Store (iOS 15.1 or later) or Google Play (Android 7.0 or later); the links are in the [overview](/qorex/overview#how-to-access). It needs no account. For desktop dApps, use the [Browser Extension](/qorex/browser-extension).

## Connecting to a dApp {#how-to-use}

Open the **dApp browser** from the Home tab and navigate to an app. Type or paste the dApp's address in the **Enter a dApp URL** box (only `https://` addresses connect). QoreX injects its providers into the page as `window.qorex` - a QoreChain Native provider (including `signAndBroadcast`, `signDirect` and message signing), an EVM provider, and a Solana provider object - and also announces itself through EIP-6963. It sets `window.ethereum` only when no other wallet has, and never overwrites another wallet. There is no `window.keplr` alias. Developers: see [Integrate a dApp with QoreX](/qorex/dapp-integration).

### Favourite and recent sites {#favourites}

The browser's start page lists your **Favourites** and your **Recent** sites (the last 8). Tap the star in the address bar to keep the open page as a favourite (tap it again to remove it), and use the home button to go back to the list. **Clear** empties the recent list. A page you opened from a [browse link](#browse-links) counts as a visit. Both lists stay on this phone, saved without the page's query or fragment.

### Open a page from a link {#browse-links}

A link on the web can open a page in the dApp browser: `https://link.qore.network/browse?url=<encoded https address>` or `qorex://browse?url=<encoded https address>`. QoreX asks for the biometric prompt that opens the dApp browser first. It refuses an address that is not `https://` on a domain name, or that has a port, a user name, an IP address or `localhost`. The link gives the page nothing: it still has to ask to connect, and every signature still goes through the approval sheet. With no wallet on the phone, the app stays on onboarding. See [Links a service can generate](/qorex/dapp-integration#links).

- **Connecting** takes **one approval per origin**. Approving reveals only your public address to that site.
- **Every signature** is its own biometric-gated approval, with the payload **decoded** so you can see exactly what you are signing - there is **no blind signing**.
- **Connections last until you revoke them.** From 1.2.5 the site's address is saved on this device, per wallet. See and revoke connected sites in [My money's protection](/qorex/security-and-recovery#protection). A connection never signs anything by itself: every signature still needs its own approval.
- **Native transactions go through `signAndBroadcast`:** QoreX shows every message, the fee and the signing account, adds the ML-DSA-87 layer and broadcasts. See [What the approval window shows](/qorex/security-and-recovery#approvals).
- **EVM dApps** can ask for `personal_sign`, typed data and transactions on QoreChain. The approval decodes them and shows what the transaction does to your balance where the network allows. On QoreChain's EVM lane the approval also opens the short authorisation window the transaction needs and names every contract it admits; see [EVM access window](/qorex/security-and-recovery#evm-window). Only accounts imported from MetaMask can send on that lane.
- **Message signing:** a page can ask you to sign a message; you see all of it first.
- **Network:** a page cannot switch the network. Switch it in QoreX itself (see the settings below), and the page must be on the same network as the wallet.

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
- **Developer mode** - off by default; adds a Developer tab with tools for people building on QoreChain. See [Developer mode](/qorex/developer-mode).
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
- The in-app browser signs on QoreChain's active network only, and emits only the EVM `connect` event: it is closed to switch account or network. It does not sign Solana transactions, and it has no Ethereum network.
- `window.qorex.native` is Keplr-style, not a Keplr drop-in, and there is no `window.keplr` alias. Amino signing is refused.
- The Q-Day Scanner, social recovery and Legacy are in the app, not in the extension.
