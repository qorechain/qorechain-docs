---
slug: /qorex/overview
title: QoreX Wallet
sidebar_label: Overview
sidebar_position: 1
---

# QoreX Wallet

**QoreX** is the official **non-custodial** wallet for **QoreChain** (mainnet `qorechain-vladi`). It is for anyone who wants to hold, send, stake and receive QOR, pay people by @handle, hold assets on other networks from the same recovery phrase, and approve what websites ask their wallet to sign. Your private keys are generated and stored **only on your device**. QoreChain Association never has access to your funds, and the apps have **no analytics, no crash reporting and no tracking SDK**. Keys, recovery phrase, vault and approvals never leave your device (see [What QoreX sends over the network](#data-and-privacy)). Every native QOR transfer is signed twice: with a classical key and with ML-DSA-87 (FIPS 204).

QoreX is a family of four builds that work together:

- **Mobile app** (Android and iOS): the full wallet, with recovery, staking, portfolio, an in-app dApp browser and the Q-Day Scanner. See [Getting Started](/qorex/getting-started) and [dApp Browser](/qorex/dapp-browser).
- **Browser extension** (Chrome and Chromium browsers, Firefox): a standalone desktop wallet, and the connector that lets any website discover QoreX and turn every request into an explicit approval. See [Browser Extension](/qorex/browser-extension).
- **Safari extension**: the same extension, packaged inside the **QoreX Wallet** macOS app on the Mac App Store.
- **Developer kit**: six public npm packages for apps that integrate with QoreX. See [For developers](#developers).

:::caution Back up your recovery phrase as soon as you create a wallet
QoreX is non-custodial: QoreChain Association cannot recover a lost wallet, reset it, or restore it for you. **Uninstalling the app, resetting the phone or removing the extension deletes your keys from that device.** Write down your 24-word recovery phrase (the mobile app does not show it while it creates the wallet, so reveal it from **Settings → Security → Reveal recovery phrase**; the extension shows it once at creation) and, if you can, set up [social recovery](/qorex/security-and-recovery#social-recovery). See [Back up now](/qorex/security-and-recovery#back-up-now).
:::

## Innovations {#innovations}

- **Hybrid-signed native lane.** Every native QOR transfer is signed twice: with a classical secp256k1 key and with ML-DSA-87 (FIPS 204). The chain verifies both. Anything on an external network is classical only, and QoreX labels it as such before you confirm.
- **One recovery phrase, one ML-DSA-87 key, no second backup.** The ML-DSA-87 key is derived deterministically from the same 24 words: `SHAKE256("qorechain:pqc:v1|" + address + "|" + mnemonic)`. The derivation is published in [QoreSign](/qoresign/overview), so any compatible wallet derives the same key.
- **Registered automatically, then checked.** The ML-DSA-87 key is registered on chain with your first transaction (with a proof of possession on chain v3.2.3 and later). After every broadcast the wallet checks that the committed transaction carries the ML-DSA-87 layer, and warns you if it does not.
- **Approvals that refuse what they cannot read.** Every message, the fee, spending limits and expiry are decoded before you sign. A request QoreX cannot decode, or one whose bytes can be read two ways, is refused.
- **`signAndBroadcast` for dApps.** A website sends the messages; the wallet shows them decoded, adds the ML-DSA-87 layer that only the wallet can make, and broadcasts. A page cannot produce that layer.
- **EVM access windows.** Above chain v3.2.0, an EVM transaction is admitted only while the account has an open window: a hybrid-signed `MsgOpenEVMWindow`, bounded by transaction count, value and expiry. QoreX opens, shows and closes it.
- **Handles with pinning.** An @handle is bound to a `qor1…` address by a registry ed25519 attestation plus the owner's own secp256k1 signature. QoreX pins the address it first resolved and flags a silent change.
- **Recovery that needs no company.** Social recovery splits the seed into encrypted shares sealed with ML-KEM (2 of 3 guardians), with a 48-hour timelock that alerts you; Legacy is a dead-man's switch over your guardians; device linking moves a wallet with a one-time code and a QR that is useless alone. See [Security & Recovery](/qorex/security-and-recovery).
- **Small footprint.** The extension asks the browser for one API permission, `storage`, and ships no analytics or tracking code. Push tells the server only your public addresses and the notification says only "QOR received".

## How to use {#how-to-use}

1. Install QoreX from an official store listing (see [How to access](#how-to-access)).
2. Create a wallet or restore one: [Getting Started](/qorex/getting-started) for the mobile app, [Browser Extension](/qorex/browser-extension#wallet) for the extension.
3. Write down the 24 words, then send and receive QOR: [Send & Receive](/qorex/send-and-receive).
4. Stake: [Portfolio & Staking](/qorex/portfolio-and-staking). Set up your safety net: [Security & Recovery](/qorex/security-and-recovery).
5. To use a website with QoreX, open it in the extension (desktop) or in the app's [dApp Browser](/qorex/dapp-browser). Every connection and every signature is an approval you give.

## How to access {#how-to-access}

- **Networks:** mainnet `qorechain-vladi` (default) and testnet `qorechain-diana`. On mobile, testnet is **Settings → Use testnet (developers)**.
- **Account needed:** none. Sign-in (email, Apple or Google) is optional and only needed to claim an @handle, link to the Dashboard and use payment requests.
- **Prerequisites:** on mobile, a device unlock (Face ID or Touch ID on iOS; a Class-3 biometric or a screen-lock PIN on Android) or the create and import buttons stay disabled. In the extension, a password.
- **Cost:** QoreX is free. Sending, staking and opening an EVM window pay the normal network fee (the network floor is 0.1 uqor per gas).
- **Always install from an official listing:**

| Build | Where | Minimum |
|---|---|---|
| iOS app | [App Store, QoreX](https://apps.apple.com/us/app/qorex-wallet/id6791256626) | iOS 15.1 |
| Android app | [Google Play](https://play.google.com/store/apps/details?id=network.qore.qorex) | Android 7.0 |
| Chrome, Brave, Edge, Arc, Opera | [Chrome Web Store](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) | a Chromium browser |
| Firefox | [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/qorex/) | Firefox 140 |
| Safari | [Mac App Store, QoreX Wallet](https://apps.apple.com/us/app/qorex-wallet/id6794132220) | macOS 12 |

## Where it is published {#where-published}

| Build | Listing and package name | Current version (27 Oct 2026) | Link |
|---|---|---|---|
| iOS app | App Store, **QoreX** (id 6791256626) | 1.1.8 | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6791256626) |
| Android app | Google Play, `network.qore.qorex` | 1.1.9 | [play.google.com](https://play.google.com/store/apps/details?id=network.qore.qorex) |
| Chrome extension | Chrome Web Store, **QoreX** | 0.3.8 | [chromewebstore.google.com](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) |
| Firefox extension | Firefox Add-ons, `qorex` | 0.3.9 | [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/qorex/) |
| Safari extension | Mac App Store, **QoreX Wallet** (id 6794132220) | app 1.7.8, extension 0.3.8 | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6794132220) |
| Developer kit | six npm packages, see [For developers](#developers) | 0.1.0 | [QoreX integrations](/developer-tools/qorex-integrations) |

Store review runs on its own schedule, so a store can serve an older build than another; see [Which version is live where](#versions). The QoreX source code is not public.

## Limits and known issues {#limits}

- **No promise beyond what is signed.** The hybrid signature covers native-lane transactions. EVM transactions carry a secp256k1 signature only, and are admitted only while an EVM access window is open. SVM and external-network transfers are classical only.
- **The extension's EVM provider answers account and network queries only.** It does not sign EVM transactions or messages yet. Message signing (`signArbitrary`) is not shipped.
- **Mobile only:** Portfolio, Q-Day Scanner, social recovery, Legacy, payment requests, sign-in and device linking.
- **Swap is not available.** It stays off until pool liquidity exists and is not shown on iOS.
- **Linked signers** (Phantom or MetaMask as a linked key with spending limits) are not available inside QoreX yet.
- **Key rotation** for your ML-DSA-87 key is not yet available inside QoreX.
- **If the handle service is down,** the wallet falls back to plain addresses; everything else keeps working.
- A lost wallet with no written phrase and no social recovery cannot be recovered by anyone.

## Platform availability {#platform-availability}

| Capability | Mobile app (Android & iOS) | Browser extension |
|---|---|---|
| Create / import a wallet | ✅ (the app does not show the phrase when it creates the wallet - reveal it from Settings → Security) | ✅ (standalone; the phrase is shown once at creation) |
| Several wallets, each with its own recovery phrase | ✅ (Settings → Wallets) | ✅ (**Wallets**, one password for all) |
| Several accounts from one recovery phrase | ✅ (up to 20 per wallet) | ✅ |
| Ethereum-style (coin 60) account, added by hand | ✅ | ✅ |
| Send & receive QOR (hybrid-signed native lane) | ✅ | ✅ (Send; Receive with QR) |
| Receive on any supported network | ✅ | ✅ |
| Pay an @handle | ✅ | ✅ |
| Claim an @handle | ✅ (needs a signed-in account) | - (the extension points you to the app) |
| Staking: delegate, unstake, move stake, claim, claim & restake | ✅ | ✅ |
| External networks (Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis, Celestia + tokens) | ✅ | ✅ (send from the popup) |
| Add a token by contract (EVM networks) | ✅ | ✅ |
| EVM access window | ✅ | ✅ |
| Interface language (10 languages) | ✅ (follows the phone) | ✅ (follows the browser) |
| Portfolio, Q-Day Scanner, Social Recovery, Legacy | ✅ | - |
| Search, first-run tour, home-screen widget, push notifications | ✅ | - |
| dApp connections | ✅ (in-app browser, session-scoped) | ✅ (any website; **Connected sites** with Revoke) |
| Swap | Android only, off until pool liquidity (not shown on iOS) | - |
| Account sign-in & payment requests | ✅ | - |
| Multi-device linking | ✅ | - |
| Dashboard pairing | ✅ | ✅ (connect + proposed transfers, incl. staking) |

## Get started

- New to QoreX? Start with [Getting Started](/qorex/getting-started) to create or restore your wallet.
- Then learn to [Send & Receive](/qorex/send-and-receive) QOR on the hybrid-signed native lane.
- Set up your safety net in [Security & Recovery](/qorex/security-and-recovery).
- On desktop, install the [Browser Extension](/qorex/browser-extension).

## Download & availability {#availability}

Install from the official listings in [How to access](#how-to-access). The Android app needs Android 7.0 or later, the iOS app iOS 15.1 or later, the Firefox extension Firefox 140 or later and the Safari extension macOS 12 or later.

## Which version is live where {#versions}

Store review runs on its own schedule, so a store can serve an older build than another for a while. This is the current version **on each store** as of **27 October 2026**:

| Store | Current version | Note |
|---|---|---|
| Apple App Store (iOS) | 1.1.8 | released 21 October |
| Google Play (Android) | 1.1.9 | |
| Chrome Web Store | 0.3.8 | |
| Firefox Add-ons | 0.3.9 | |
| Safari (Mac App Store) | 1.7.8, carrying extension 0.3.8 | the Mac App Store uses its own `1.x` numbering |

The stores always show their current version, and a store still serving an older build catches up automatically. Builds that a store has not yet released are not described in this manual as available.

What the 1.1.9 / 0.3.9 builds add (Android 1.1.9 and the Firefox extension 0.3.9 today; iOS, Chrome and Safari carry them once their stores serve those builds):

- **Staking locks.** Lock part of your stake for 3, 6 or 12 months. The bonus shown is the bonus the lock earns today, under the network's ceiling. Unlocking early sits behind a second confirmation that names the cost, and **Unstake** and **Move stake** are limited to the unlocked part. The tier schedule is labelled "up to", with today's figure beside it. See [Portfolio & Staking](/qorex/portfolio-and-staking#staking-locks).
- **IBC transfer memos in plain words** on approvals.
- **Staking from accounts imported from MetaMask (coin 60)** in the extension.

What the 1.1.8 / 0.3.8 builds changed for you:

- **MetaMask on QoreChain, from the first page.** Open, check and close the EVM access window that MetaMask needs, and see what it has left.
- **Stronger signature checks.** QoreX verifies an app's ML-DSA-87 signature against your account's registered key, and says clearly if that key was registered by another wallet.
- **Fixes for reported security issues.**

What the 1.1.7 / 0.3.7 builds changed for you (included in 1.1.8 / 0.3.8):

- **Approvals refuse a request whose bytes can be read two ways.** If the same field appears twice in a request, a screen and the chain could disagree about what is being signed - for example a fee or an amount shown differently from the one executed. QoreX now refuses such a request instead of showing one reading of it. See [What the approval window shows](/qorex/security-and-recovery#approvals).
- **Grant expiry is shown to the second**, and governance votes are decoded and shown on the approval screen.
- **Sites are identified by the origin the browser itself attests**, not by what a request claims about itself.
- **@handle lookups work again in the extension.**
- **Claiming an @handle needs a signed-in account and happens in the app**; the extension points you there.
- **Look-alike QoreChain names are reserved**, so a new handle cannot imitate the project or its staff.

Highlights since 1.0.9 / 0.2.6:

- **Several wallets** on one phone or browser, each with its own recovery phrase, with one-tap switching - see [Several wallets](/qorex/getting-started#several-wallets).
- **Ethereum-style (coin 60) account**, added by hand, for phrases first used in MetaMask or on the Dashboard - see [Restore a phrase from MetaMask or the Dashboard](/qorex/getting-started#restore-dashboard).
- **Add a token by contract**, **Receive on any network**, global **search**, a first-run **tour**, a **home-screen widget** and **push notifications** when QOR arrives (mobile) - see [Send & Receive](/qorex/send-and-receive).
- **Claim & restake**, a fee check before claiming, an **Unstaking in progress** list and warnings before you stake your way out of being able to unstake - see [Portfolio & Staking](/qorex/portfolio-and-staking).
- Approval screens that show every message, the fee, spending limits and expiry, and refuse what QoreX cannot display; **`signAndBroadcast`** for dApps; **Connected sites** with Revoke (extension); the **EVM access window** - see [Security & Recovery](/qorex/security-and-recovery) and the [Browser Extension](/qorex/browser-extension).
- Fixes: a funded account could momentarily vanish from "Your accounts" (1.0.9); Android hardware Back now goes back one screen (1.1.1); the recovery phrase is withheld from non-accessibility services on Android 14 and later (1.1.6).

QoreX works on mainnet `qorechain-vladi` (live since 7 June 2026), which has run chain **v3.2.5** since 29 October 2026 (v3.2.4 from 23 October 2026). Signing format, addresses, decimals, memos and fees do not change in these upgrades, so no QoreX update is needed for them.

## For developers {#developers}

To integrate with QoreX from your own app, use the QoreX developer kit: six npm packages, published at 0.1.0. Their install commands, examples and limits are on [QoreX integrations](/developer-tools/qorex-integrations). For wallet discovery and signing in a web app, see also the [wallet adapter](/developer-tools/wallet-adapter) and, for the browser provider QoreX injects, the [Browser Extension](/qorex/browser-extension#standards).

## What QoreX sends over the network {#data-and-privacy}

QoreX has **no analytics, no crash reporting and no tracking SDK**. Your keys, your recovery phrase, the vault and your approvals **never leave the device**. The apps do talk to the network, as any wallet must; this is the complete list.

**Always (needed to show balances and send):**

- **QoreChain public endpoints** (`api`, `rpc`, `evm` and `svm` on `qore.host`, and the `-testnet` equivalents) for balances, history and broadcasting. These requests carry your **public** `qor1…` address.
- **Price lookup** - one request for the QOR price, which carries **no address**.
- **External networks you hold or view** - public third-party RPC/REST services for that network, carrying your **public** address on that network.
- **@handle registry** - carries the handle you look up, or a public address.

**Only if you turn it on:**

- **Push notifications** (mobile) - off until you enable them. The server then receives your device token and the public `qor1…` addresses of the wallet in use (up to 10). A device the server has not heard from for 90 days is forgotten.
- **Social recovery** - the relay stores **ciphertext only**.
- **Sign-in** (email, or Apple or Google) - needed to claim an @handle, to link to the Dashboard and to use payment requests.
- **Dashboard connect and linked addresses** - sends a signed proof that you own the address.
- **Payment requests** - send the from-handle, to-handle, amount and optional note.

**The home-screen widget** makes no request of its own to QoreChain servers: the app hands it your address, balance and privacy flag locally, and the widget refreshes the balance from the public QoreChain REST endpoint.

There is **no AI chat and no QCAI service** in either app.
