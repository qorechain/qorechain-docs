---
slug: /qorex/overview
title: QoreX Wallet
sidebar_label: Overview
sidebar_position: 1
---

# QoreX Wallet

**QoreX** is the official **non-custodial** wallet for **QoreChain**, the quantum-safe Layer 1 (mainnet `qorechain-vladi`). Your private keys are generated and stored **only on your device** — QoreChain Association never has access to your funds, and the apps have **no analytics, no crash reporting and no tracking SDK** — keys, recovery phrase, vault and approvals never leave your device (see [What QoreX sends over the network](#data-and-privacy)). Every QOR transfer on the Native lane carries a **hybrid post-quantum signature** (ML-DSA-87, NIST FIPS-204, paired with secp256k1), so your funds are protected against both classical and quantum attackers.

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
| Pay an @handle | ✅ | ✅ |
| Claim an @handle | ✅ (needs a signed-in account) | — (the extension points you to the app) |
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
- **No analytics, no crash reporting, no tracking SDK** in any QoreX app. A few optional extras talk to a server only when you turn them on — account sign-in (see [Account & Dashboard](/qorex/account-and-dashboard)) and push notifications, which register your device and your *public* addresses so QoreX can tell you when QOR arrives. The wallet never depends on either. The full list is in [What QoreX sends over the network](#data-and-privacy).
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

Store review runs on its own schedule, so each store serves its own build, and Google Play and the Chrome Web Store currently lag the others. This is the current version **on each store** as of **20 October 2026**:

| Store | Current version | Note |
|---|---|---|
| Apple App Store (iOS) | 1.1.7 | released 15 October |
| Google Play (Android) | 1.1.6 | 1.1.7 is uploaded but not public yet — the public listing still shows 1.1.6 |
| Chrome Web Store | 0.3.6 | still serves 0.3.6 |
| Firefox Add-ons | 0.3.7 | |
| Safari (Mac App Store) | 1.7.7, carrying extension 0.3.7 | the Mac App Store uses its own `1.x` numbering |

The stores always show their current version, and a store still serving an older build catches up automatically. Features below marked **1.1.7 / 0.3.7** are live on the stores in the table that already carry that build (iOS, Firefox, Safari) and arrive on Google Play and Chrome when those listings update. Nothing newer than 1.1.7 / 0.3.7 is described in this manual as available.

What the 1.1.7 / 0.3.7 builds changed for you:

- **Approvals refuse a request whose bytes can be read two ways.** If the same field appears twice in a request, a screen and the chain could disagree about what is being signed — for example a fee or an amount shown differently from the one executed. QoreX now refuses such a request instead of showing one reading of it. See [What the approval window shows](/qorex/security-and-recovery#approvals).
- **Grant expiry is shown to the second**, and governance votes are decoded and shown on the approval screen.
- **Sites are identified by the origin the browser itself attests**, not by what a request claims about itself.
- **@handle lookups work again in the extension.**
- **Claiming an @handle needs a signed-in account and happens in the app**; the extension points you there.
- **Look-alike QoreChain names are reserved**, so a new handle cannot imitate the project or its staff.

Highlights since 1.0.9 / 0.2.6:

- **Several wallets** on one phone or browser, each with its own recovery phrase, with one-tap switching — see [Several wallets](/qorex/getting-started#several-wallets).
- **Ethereum-style (coin 60) account**, added by hand, for phrases first used in MetaMask or on the Dashboard — see [Restore a phrase from MetaMask or the Dashboard](/qorex/getting-started#restore-dashboard).
- **Add a token by contract**, **Receive on any network**, global **search**, a first-run **tour**, a **home-screen widget** and **push notifications** when QOR arrives (mobile) — see [Send & Receive](/qorex/send-and-receive).
- **Claim & restake**, a fee check before claiming, an **Unstaking in progress** list and warnings before you stake your way out of being able to unstake — see [Portfolio & Staking](/qorex/portfolio-and-staking).
- Approval screens that show every message, the fee, spending limits and expiry, and refuse what QoreX cannot display; **`signAndBroadcast`** for dApps; **Connected sites** with Revoke (extension); the **EVM access window** — see [Security & Recovery](/qorex/security-and-recovery) and the [Browser Extension](/qorex/browser-extension).
- Fixes: a funded account could momentarily vanish from "Your accounts" (1.0.9); Android hardware Back now goes back one screen (1.1.1); the recovery phrase is withheld from non-accessibility services on Android 14 and later (1.1.6).

QoreX works on mainnet `qorechain-vladi`, which runs chain **v3.2.3** (live since 7 June 2026) until height 3,742,566 and v3.2.4 from that block. Signing format, addresses, decimals, memos and fees do not change in these upgrades, so no QoreX update is needed for them.

## What QoreX sends over the network {#data-and-privacy}

QoreX has **no analytics, no crash reporting and no tracking SDK**. Your keys, your recovery phrase, the vault and your approvals **never leave the device**. The apps do talk to the network, as any wallet must; this is the complete list.

**Always (needed to show balances and send):**

- **QoreChain public endpoints** (`api`, `rpc`, `evm` and `svm` on `qore.host`, and the `-testnet` equivalents) for balances, history and broadcasting. These requests carry your **public** `qor1…` address.
- **Price lookup** — one request for the QOR price, which carries **no address**.
- **External networks you hold or view** — public third-party RPC/REST services for that network, carrying your **public** address on that network.
- **@handle registry** — carries the handle you look up, or a public address.

**Only if you turn it on:**

- **Push notifications** (mobile) — off until you enable them. The server then receives your device token and the public `qor1…` addresses of the wallet in use (up to 10). A device the server has not heard from for 90 days is forgotten.
- **Social recovery** — the relay stores **ciphertext only**.
- **Sign-in** (email, or Apple or Google) — needed to claim an @handle, to link to the Dashboard and to use payment requests.
- **Dashboard connect and linked addresses** — sends a signed proof that you own the address.
- **Payment requests** — send the from-handle, to-handle, amount and optional note.

**The home-screen widget** makes no request of its own to QoreChain servers: the app hands it your address, balance and privacy flag locally, and the widget refreshes the balance from the public QoreChain REST endpoint.

There is **no AI chat and no QCAI service** in either app.
