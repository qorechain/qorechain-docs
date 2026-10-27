---
slug: /qorex/getting-started
title: Getting Started with QoreX
sidebar_label: Getting Started
sidebar_position: 2
---

# Getting Started with QoreX

The **QoreX mobile app** (iOS and Android) is the full QoreChain wallet in your pocket. It is for anyone who wants to hold and send QOR, stake, pay people by @handle, hold assets on other networks, and keep a recovery plan that does not depend on a company. This page walks through installing the app and creating, restoring, or linking your wallet. For the desktop wallet, see the [Browser Extension](/qorex/browser-extension); for the whole family, see the [overview](/qorex/overview).

## Innovations {#innovations}

- **Keys that never leave the device.** The 24 words are generated on the phone and sealed in a hardware-backed, biometric-gated vault (Secure Enclave on iOS, StrongBox on Android). Signing always needs your biometric or PIN.
- **Hybrid-signed native lane.** Every native QOR transfer is signed twice: with a classical key and with ML-DSA-87 (FIPS 204).
- **ML-DSA-87 key from the same 24 words.** `SHAKE256("qorechain:pqc:v1|" + address + "|" + mnemonic)` derives it deterministically, so there is no second backup. The derivation is published in [QoreSign](/qoresign/overview). The key is registered on chain automatically with your first transaction.
- **A check after every broadcast.** The wallet reads the committed transaction and warns you if the ML-DSA-87 layer is missing.
- **EVM access window.** QoreX opens, shows and closes the window that lets an Ethereum-style account send on the EVM lane. See [Security & Recovery](/qorex/security-and-recovery#evm-window).
- **@handles with pinning.** Two signatures bind a name to an address; the first resolved address is pinned and a silent change is flagged.
- **Recovery without a company.** Social recovery (encrypted shares, 2 of 3, 48-hour timelock), Legacy (a dead-man's switch over your guardians) and device linking. See [Security & Recovery](/qorex/security-and-recovery).
- **Q-Day Scanner.** An exposure report for any Bitcoin or Ethereum address.
- **Push and widget with a small footprint.** Push tells the server only your public addresses, and the notification says only "QOR received". The widget shows the QOR balance of the account in use.

## How to access {#how-to-access}

:::note Mobile availability
- **Android**: Google Play (Android 7.0 or later): https://play.google.com/store/apps/details?id=network.qore.qorex
- **iOS**: the App Store (iOS 15.1 or later): https://apps.apple.com/us/app/qorex-wallet/id6791256626
:::

Current versions are listed under [Which version is live where](/qorex/overview#versions). The app is free and needs no account. Mainnet `qorechain-vladi` is the default; **Settings → Use testnet (developers)** switches to `qorechain-diana`. Sending and staking pay the normal network fee (floor 0.1 uqor per gas). The app has 10 languages, including Arabic with right-to-left layout, and follows the phone's language.

## How to use {#how-to-use}

The steps below cover setting up a wallet. For day-to-day use, see [Send & Receive](/qorex/send-and-receive), [Portfolio & Staking](/qorex/portfolio-and-staking), [Security & Recovery](/qorex/security-and-recovery) and the [dApp Browser](/qorex/dapp-browser).

## Before you begin: secure your device

A QoreX wallet can only be created or imported when your device has a **strong unlock factor** set up. This is what protects your keys in the hardware vault. Any of the following qualifies:

- **iOS** - Face ID or Touch ID.
- **Android** - a Class-3 biometric (fingerprint, iris, or 3D face unlock) **or** a device screen lock (PIN, pattern, or password).

:::note Android 2D face unlock
Camera-based 2D face unlock (found on some devices, e.g. certain Samsung models) counts as a *weak* biometric. If that is all you have, QoreX relies on the **PIN / pattern** behind it - and the system sheet offers it automatically, so you are still covered.
:::

If no strong factor is enrolled, the create/import buttons stay disabled and the screen explains what to turn on. Set up Face ID, a fingerprint, or a screen lock in your system settings, then return to QoreX.

## First launch

The app opens on the onboarding screen **only when no wallet exists on the device**. Once you have a wallet, every later launch goes straight to the Home (Wallet) tab. Viewing balances needs no biometric; **signing a transaction always does**.

You have three ways to set up:

### 1. Create a new wallet

1. Tap **Create a new wallet**.
2. QoreX generates a **24-word recovery phrase** on your device (256-bit entropy), seals it straight into the hardware-backed, biometric-gated vault, and derives your QoreChain identity - coin type 118, a `qor1…` address (your ETH and SOL accounts come from the same seed). **The app does not show you the phrase while it creates the wallet.**
3. **Reveal the phrase and write it down immediately:** open **Settings → Security → Reveal recovery phrase**, confirm with biometrics or your device PIN, and copy the 24 words onto paper, in order. Store them offline. This phrase is the **only** way to recover your wallet if you lose the device.
4. Optionally set up [social recovery](/qorex/security-and-recovery#social-recovery). Note that the **Backup health** card on Home tracks social recovery only - it cannot tell whether you have written the phrase down, so it will not remind you.

:::danger Do step 3 now - nothing in the app will remind you
Because the app moves straight to Home after creating the wallet, it is easy to carry on without ever writing the phrase down. **Do it before you receive or send anything.** If you lose or uninstall the app, or lose the phone, without the written phrase or a set-up [social recovery](/qorex/security-and-recovery#social-recovery), nobody - including QoreChain Association - can get your funds back.
:::

:::caution Your recovery phrase is everything
Anyone with your 24 words controls your funds, and no one - including QoreChain Association - can recover them for you. Never type your phrase into a website, share it, or store it in a screenshot or cloud note. **Uninstalling QoreX deletes the keys stored on that device** - without your written phrase (or [social recovery](/qorex/security-and-recovery#social-recovery) set up beforehand), an uninstall means permanent loss of access. Back up before you fund the wallet, not after.
:::

### 2. Restore an existing wallet {#2-restore-an-existing-wallet}

1. Tap **Restore existing wallet**.
2. Choose **Recovery phrase** (if you wrote down your 24 words) or **Social recovery** (if you set up guardians and no longer have the phrase - see [Social recovery](/qorex/security-and-recovery#social-recovery)).
3. For the recovery-phrase path: type your 24 words in order. QoreX normalizes case and stray spacing, checks the phrase, and tells you plainly if a word doesn't check out rather than a generic error.
4. QoreX re-derives the same addresses - your wallet looks identical on any device.

:::note Extra accounts come back one by one
Restoring from the phrase brings back **Account 1**. If you used several accounts in the old wallet, tap **Add an account** (Settings → Your accounts) to bring back the next ones - they are derived from the same phrase, so they reappear at the same addresses. Ethereum-style accounts are added with **Add an Ethereum account (coin 60)**; see [Restore a phrase from MetaMask or the Dashboard](#restore-dashboard). Add them in the same order you created them in the old wallet: accounts are numbered by slot, and a different order on a new device can give a different account at a slot.
:::

### 3. Link from another device

If you already have QoreX on another phone or tablet, you can move the wallet across with **no server and no typing** - see [Link a new device](/qorex/security-and-recovery#link-device). Choose **Link from another device** on the new device to begin.

## Several wallets on one device {#several-wallets}

Each wallet has its **own recovery phrase**. You can keep several on one phone - for example your main wallet and one restored from another service - and switch between them with one tap.

- **Mobile:** Settings → **Wallets** lists the wallets on this phone. Tap one to make it the active wallet - the whole app switches to it (nothing moves on chain). **Add a wallet** lets you create a new one, restore one from its recovery phrase, or link one from another device; the wallets you already have stay. Restoring a phrase that is already on the phone just switches to it.
- **Extension:** the popup's **Wallets** screen does the same, with **one password** for all of them. Adding or removing a wallet asks for your password once, to re-seal the vault, and turns passkey unlock off (turn it on again from the home screen).
- **Removing a wallet** (*Remove from this phone* / *Remove from this browser*) deletes that wallet's key from the device. Your funds stay on chain, but only its recovery phrase can bring it back - write it down first.

## Restore a phrase from MetaMask or the Dashboard {#restore-dashboard}

By default QoreX derives your `qor1…` address from a recovery phrase on coin type **118**. A phrase that was first used in MetaMask - or in a wallet created on the QoreChain Dashboard - keeps its QOR at an **Ethereum-style** address (coin type **60**) instead, so restoring it shows an empty **Account 1**. Nothing is lost; add the Ethereum-style account:

1. Update QoreX to the current version from your store.
2. **Add a wallet** (Settings → Wallets → *Add a wallet* → *Restore existing wallet*) and enter the phrase. Your existing wallet stays where it is. In the extension: **Wallets** → restore.
3. Open Settings → **Your accounts** and tap **Add an Ethereum account (coin 60)**. The first tap adds the account at index 0 - the same `0x…` address MetaMask shows for those words, and the same key as your QoreChain `qor1…` address for that account. Your QOR sits there.
4. Switch to that account (it is labelled *Ethereum · coin 60*). You can send, stake and claim from it. The first send also registers that account's ML-DSA-87 key, which costs a small one-time fee.

An Ethereum-style account has no @handle (handles are claimed on a QoreChain `qor1…` account at coin type 118), and websites sign through `signAndBroadcast` rather than `signDirect` with it. It is also the kind of account for which the [EVM access window](/qorex/security-and-recovery#evm-window) matters: MetaMask signs with the same key, so MetaMask transactions can move its QOR once a window is open. Each tap on **Add an Ethereum account (coin 60)** adds the next index.

## Find your way around {#find-your-way}

- **Search** - the magnifier at the top of Home searches screens ("stake"), coins ("USDC"), people (an @handle or address), memos and the start of a transaction hash; typing an @handle or `qor1…` address offers **Send QOR to …** directly.
- **Tour** - the first time a wallet opens on Home, five short cards explain what QoreX does and where things are. It runs once; replay it from Settings → **Take the tour again**.

## Optional: claim an @handle

After your wallet is created you can claim a unique **@handle** (for example `@liviu`) so people can send to you by name instead of a `qor1…` address. Claiming needs a [signed-in account](/qorex/account-and-dashboard#sign-in) and happens **in the mobile app** (the browser extension points you there). It is optional and skippable - your wallet never depends on it. A handle binds to a specific address rather than to the wallet as a whole, which matters once you have more than one account - see [Several accounts from one phrase](/qorex/account-and-dashboard#accounts) and [@handle](/qorex/account-and-dashboard#handle).

## Language

QoreX ships in ten languages - English, Romanian, German, Spanish, French, Italian, Turkish, Arabic, Japanese, and Korean - and follows your phone's language automatically, falling back to English for anything else. You can override the detected language anytime from **Settings → Language**; choosing Arabic also switches the interface to right-to-left.

## Next steps

- [Send & Receive](/qorex/send-and-receive) - make your first hybrid-signed transfer.
- [Security & Recovery](/qorex/security-and-recovery) - set up social recovery so you are never locked out.
- [Portfolio & Staking](/qorex/portfolio-and-staking) - track assets and earn staking rewards.

## Where it is published {#where-published}

| Store | Listing | Link |
|---|---|---|
| App Store (iOS) | **QoreX** | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6791256626) |
| Google Play (Android) | `network.qore.qorex` | [play.google.com](https://play.google.com/store/apps/details?id=network.qore.qorex) |

The mobile app source code is not public. Always install from the official listing.

## Limits and known issues {#limits}

- **Swap is not available**: it is off until pool liquidity exists, and not shown on iOS.
- **Linked signers** (Phantom or MetaMask as a linked key with spending limits) are not available inside QoreX yet.
- **Key rotation** for your ML-DSA-87 key is not yet available inside QoreX.
- **The app does not show the phrase while it creates the wallet.** Reveal it at once from Settings → Security. The Backup health card tracks social recovery only.
- **EVM and SVM transfers are not covered by the hybrid signature.** An EVM transaction carries a secp256k1 signature only and needs an open access window; transfers on external networks are classical only.
- **Push** is mainnet only; on iPhone treat it as best effort.
- A lost wallet with no written phrase and no social recovery cannot be recovered by anyone.
