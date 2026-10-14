---
slug: /qorex/overview
title: QoreX Wallet
sidebar_label: Overview
sidebar_position: 1
---

# QoreX Wallet

**QoreX** is the official **non-custodial** wallet for **QoreChain**, the quantum-safe Layer 1 (mainnet `qorechain-vladi`). Your private keys are generated and stored **only on your device** — QoreChain Association never has access to your funds and the apps contain **no analytics, tracking or ads**. Every QOR transfer on the Native lane carries a **hybrid post-quantum signature** (ML-DSA-87, NIST FIPS-204, paired with secp256k1), so your funds are protected against both classical and quantum attackers.

QoreX comes in two parts that work together:

- **Browser extension** — the desktop wallet, **live and public on Chrome, Firefox, and Safari (macOS)**. It is a standalone wallet (create/import, hold and send QOR) and the connector that lets any website discover QoreX and turn every request into an explicit approval. See [Browser Extension](/qorex/browser-extension).
- **Mobile app** (Android & iOS) — the full wallet: create/restore, send & receive quantum-safe QOR, external networks, staking, portfolio, recovery, and an in-app dApp browser. **On Google Play** for Android, and **on the App Store** for iOS (see availability below).

:::caution Back up your recovery phrase as soon as you create a wallet
QoreX is non-custodial: QoreChain Association cannot recover a lost wallet, reset it, or restore it for you. **Uninstalling the app, resetting the phone or removing the extension deletes your keys from that device.** Write down your 24-word recovery phrase (the mobile app does not show it while it creates the wallet — reveal it from **Settings → Security → Reveal recovery phrase**; the extension shows it once at creation) and, if you can, set up [social recovery](/qorex/security-and-recovery#social-recovery). See [Back up now](/qorex/security-and-recovery#back-up-now).
:::

## Platform availability {#platform-availability}

| Capability | Mobile app (Android & iOS) | Browser extension |
|---|---|---|
| Create / import a wallet | ✅ (the app does not show the phrase when it creates the wallet — reveal it from Settings → Security) | ✅ (standalone; the phrase is shown once at creation) |
| Several wallets, each with its own recovery phrase | ✅ (Settings → Wallets) | ✅ (**Wallets**, one password for all) |
| Several accounts from one recovery phrase | ✅ (up to 20 per wallet) | ✅ |
| Ethereum-style (coin 60) account, added by hand | ✅ | ✅ |
| Send & receive QOR (post-quantum) | ✅ | ✅ (Send; Receive with QR) |
| Receive on any supported network | ✅ | ✅ |
| Pay / claim an @handle | ✅ | ✅ paying; claiming is offered on ordinary QoreChain accounts in some extension versions — otherwise claim in the app |
| Staking: delegate, unstake, move stake, claim, claim & restake | ✅ | ✅ |
| External networks (Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis, Celestia + tokens) | ✅ | ✅ (send from the popup) |
| Add a token by contract (EVM networks) | ✅ | ✅ |
| EVM access window | ✅ | ✅ |
| Interface language (10 languages) | ✅ (follows the phone) | ✅ (follows the browser) |
| Portfolio, Q-Day Scanner, Social Recovery, Legacy | ✅ | — |
| Search, first-run tour, home-screen widget, push notifications | ✅ | — |
| dApp connections | ✅ (in-app browser, session-scoped) | ✅ (any website; **Connected sites** with Revoke) |
| Swap | Android only, off until pool liquidity (not shown on iOS) | — |
| Account sign-in & payment requests | ✅ | — |
| Multi-device linking | ✅ | — |
| Dashboard pairing | ✅ | ✅ (connect + proposed transfers, incl. staking) |

## Why QoreX is different

- **Quantum-safe by default** — Native-lane QOR transfers always carry an ML-DSA-87 + secp256k1 hybrid signature. Anything classical (external chains) is clearly labeled, never silent.
- **Truly non-custodial** — keys are generated on-device and live in a hardware-backed vault (Secure Enclave on iOS, StrongBox on Android) or an encrypted vault (extension). They never leave your device.
- **No analytics, no tracking, no ads** in any QoreX app. Optional extras use a server only when you turn them on: account sign-in (see [Account & Dashboard](/qorex/account-and-dashboard)) and push notifications, which register your device and your *public* addresses so QoreX can tell you when QOR arrives. The wallet never depends on either.
- **One unified balance** — your QOR is one balance across the Native, EVM, and SVM lanes; QoreX shows it as a single figure.
- **Multiple recovery paths** — a 24-word recovery phrase (always; on mobile, reveal it from Settings → Security), optional social recovery with guardians and a 48-hour timelock, optional Legacy inheritance, and convenient multi-device linking.

## Get started

- New to QoreX? Start with [Getting Started](/qorex/getting-started) to create or restore your wallet.
- Then learn to [Send & Receive](/qorex/send-and-receive) quantum-safe QOR.
- Set up your safety net in [Security & Recovery](/qorex/security-and-recovery).
- On desktop, install the [Browser Extension](/qorex/browser-extension).

## Download & availability {#availability}

- **Browser extension** — live and public: install it from the [Chrome Web Store, Firefox Add-ons, or the Mac App Store (Safari)](/qorex/browser-extension#install). Always install from an official store listing.
- **Android app** — live in production on Google Play: https://play.google.com/store/apps/details?id=network.qore.qorex (Android 7.0 or later).
- **iOS app** — live on the **App Store**: https://apps.apple.com/us/app/qorex-wallet/id6791256626 (iOS 15.1 or later).

## Which version is live where {#versions}

Store review runs on its own schedule, so a store can briefly serve an older or newer build than another. As of **15 October 2026**:

| Platform | Live version |
|---|---|
| Android | 1.1.6 |
| iOS | 1.1.6 |
| Chrome | 0.3.6 |
| Firefox | 0.3.7 (a point release after 0.3.6) |
| Safari (macOS) | 1.7.6, carrying extension 0.3.6 |

This documentation describes the 1.1.6 / 0.3.6 feature set. A store still serving an older build will catch up automatically; the stores always show their current version. Highlights since 1.0.9 / 0.2.6:

- **Several wallets** on one phone or browser, each with its own recovery phrase, with one-tap switching — see [Several wallets](/qorex/getting-started#several-wallets).
- **Ethereum-style (coin 60) account**, added by hand, for phrases first used in MetaMask or on the Dashboard — see [Restore a phrase from MetaMask or the Dashboard](/qorex/getting-started#restore-dashboard).
- **Add a token by contract**, **Receive on any network**, global **search**, a first-run **tour**, a **home-screen widget** and **push notifications** when QOR arrives (mobile) — see [Send & Receive](/qorex/send-and-receive).
- **Claim & restake**, a fee check before claiming, an **Unstaking in progress** list and warnings before you stake your way out of being able to unstake — see [Portfolio & Staking](/qorex/portfolio-and-staking).
- Approval screens that show every message, the fee, spending limits and expiry, and refuse what QoreX cannot display; **`signAndBroadcast`** for dApps; **Connected sites** with Revoke (extension); the **EVM access window** — see [Security & Recovery](/qorex/security-and-recovery) and the [Browser Extension](/qorex/browser-extension).
- Fixes: a funded account could momentarily vanish from "Your accounts" (1.0.9); Android hardware Back now goes back one screen (1.1.1); the recovery phrase is withheld from non-accessibility services on Android 14 and later (1.1.6).
