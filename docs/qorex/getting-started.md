---
slug: /qorex/getting-started
title: Getting Started with QoreX
sidebar_label: Getting Started
sidebar_position: 2
---

# Getting Started with QoreX

This page walks through installing the **mobile app** and creating, restoring, or linking your wallet. For the desktop wallet, see the [Browser Extension](/qorex/browser-extension), which is live on Chrome, Firefox, and Safari.

:::note Mobile availability
- **Android** — live in production on Google Play (Android 7.0 or later): https://play.google.com/store/apps/details?id=network.qore.qorex
- **iOS** — live on the App Store (iOS 15.1 or later): https://apps.apple.com/us/app/qorex-wallet/id6791256626
:::

## Before you begin: secure your device

A QoreX wallet can only be created or imported when your device has a **strong unlock factor** set up. This is what protects your keys in the hardware vault. Any of the following qualifies:

- **iOS** — Face ID or Touch ID.
- **Android** — a Class-3 biometric (fingerprint, iris, or 3D face unlock) **or** a device screen lock (PIN, pattern, or password).

:::note Android 2D face unlock
Camera-based 2D face unlock (found on some devices, e.g. certain Samsung models) counts as a *weak* biometric. If that is all you have, QoreX relies on the **PIN / pattern** behind it — and the system sheet offers it automatically, so you are still covered.
:::

If no strong factor is enrolled, the create/import buttons stay disabled and the screen explains what to turn on. Set up Face ID, a fingerprint, or a screen lock in your system settings, then return to QoreX.

## First launch

The app opens on the onboarding screen **only when no wallet exists on the device**. Once you have a wallet, every later launch goes straight to the Home (Wallet) tab. Viewing balances needs no biometric; **signing a transaction always does**.

You have three ways to set up:

### 1. Create a new wallet

1. Tap **Create a new wallet**.
2. QoreX generates a **24-word recovery phrase** on your device (256-bit entropy), seals it straight into the hardware-backed, biometric-gated vault, and derives your QoreChain identity — coin type 118, a `qor1…` address (your ETH and SOL accounts come from the same seed). **The app does not show you the phrase while it creates the wallet.**
3. **Reveal the phrase and write it down immediately:** open **Settings → Security → Reveal recovery phrase**, confirm with biometrics or your device PIN, and copy the 24 words onto paper, in order. Store them offline. This phrase is the **only** way to recover your wallet if you lose the device.
4. Optionally set up [social recovery](/qorex/security-and-recovery#social-recovery). Note that the **Backup health** card on Home tracks social recovery only — it cannot tell whether you have written the phrase down, so it will not remind you.

:::danger Do step 3 now — nothing in the app will remind you
Because the app moves straight to Home after creating the wallet, it is easy to carry on without ever writing the phrase down. **Do it before you receive or send anything.** If you lose or uninstall the app, or lose the phone, without the written phrase or a set-up [social recovery](/qorex/security-and-recovery#social-recovery), nobody — including QoreChain Association — can get your funds back.
:::

:::caution Your recovery phrase is everything
Anyone with your 24 words controls your funds, and no one — including QoreChain Association — can recover them for you. Never type your phrase into a website, share it, or store it in a screenshot or cloud note. **Uninstalling QoreX deletes the keys stored on that device** — without your written phrase (or [social recovery](/qorex/security-and-recovery#social-recovery) set up beforehand), an uninstall means permanent loss of access. Back up before you fund the wallet, not after.
:::

### 2. Restore an existing wallet {#2-restore-an-existing-wallet}

1. Tap **Restore existing wallet**.
2. Choose **Recovery phrase** (if you wrote down your 24 words) or **Social recovery** (if you set up guardians and no longer have the phrase — see [Social recovery](/qorex/security-and-recovery#social-recovery)).
3. For the recovery-phrase path: type your 24 words in order. QoreX normalizes case and stray spacing, checks the phrase, and tells you plainly if a word doesn't check out rather than a generic error.
4. QoreX re-derives the same addresses — your wallet looks identical on any device.

:::note Extra accounts come back one by one
Restoring from the phrase brings back **Account 1**. If you used several accounts in the old wallet, tap **Add an account** (Settings → Your accounts) to bring back the next ones — they are derived from the same phrase, so they reappear at the same addresses. Ethereum-style accounts are added with **Add an Ethereum account (coin 60)**; see [Restore a phrase from MetaMask or the Dashboard](#restore-dashboard). Add them in the same order you created them in the old wallet: accounts are numbered by slot, and a different order on a new device can give a different account at a slot.
:::

### 3. Link from another device

If you already have QoreX on another phone or tablet, you can move the wallet across with **no server and no typing** — see [Link a new device](/qorex/security-and-recovery#link-device). Choose **Link from another device** on the new device to begin.

## Several wallets on one device {#several-wallets}

Each wallet has its **own recovery phrase**. You can keep several on one phone — for example your main wallet and one restored from another service — and switch between them with one tap.

- **Mobile:** Settings → **Wallets** lists the wallets on this phone. Tap one to make it the active wallet — the whole app switches to it (nothing moves on chain). **Add a wallet** lets you create a new one, restore one from its recovery phrase, or link one from another device; the wallets you already have stay. Restoring a phrase that is already on the phone just switches to it.
- **Extension:** the popup's **Wallets** screen does the same, with **one password** for all of them. Adding or removing a wallet asks for your password once, to re-seal the vault, and turns passkey unlock off (turn it on again from the home screen).
- **Removing a wallet** (*Remove from this phone* / *Remove from this browser*) deletes that wallet's key from the device. Your funds stay on chain, but only its recovery phrase can bring it back — write it down first.

## Restore a phrase from MetaMask or the Dashboard {#restore-dashboard}

By default QoreX derives your `qor1…` address from a recovery phrase on coin type **118**. A phrase that was first used in MetaMask — or in a wallet created on the QoreChain Dashboard — keeps its QOR at an **Ethereum-style** address (coin type **60**) instead, so restoring it shows an empty **Account 1**. Nothing is lost; add the Ethereum-style account:

1. Update QoreX to the current version from your store.
2. **Add a wallet** (Settings → Wallets → *Add a wallet* → *Restore existing wallet*) and enter the phrase. Your existing wallet stays where it is. In the extension: **Wallets** → restore.
3. Open Settings → **Your accounts** and tap **Add an Ethereum account (coin 60)**. The first tap adds the account at index 0 — the same `0x…` address MetaMask shows for those words, and the same key as your QoreChain `qor1…` address for that account. Your QOR sits there.
4. Switch to that account (it is labelled *Ethereum · coin 60*). You can send, stake and claim from it. The first send also registers that account's post-quantum key, which costs a small one-time fee.

An Ethereum-style account has no @handle (handles are claimed on a QoreChain `qor1…` account at coin type 118), and websites sign through `signAndBroadcast` rather than `signDirect` with it. Each tap on **Add an Ethereum account (coin 60)** adds the next index.

## Find your way around {#find-your-way}

- **Search** — the magnifier at the top of Home searches screens ("stake"), coins ("USDC"), people (an @handle or address), memos and the start of a transaction hash; typing an @handle or `qor1…` address offers **Send QOR to …** directly.
- **Tour** — the first time a wallet opens on Home, five short cards explain what QoreX does and where things are. It runs once; replay it from Settings → **Take the tour again**.

## Optional: claim an @handle

After your wallet is created you can claim a unique **@handle** (for example `@liviu`) so people can send to you by name instead of a `qor1…` address. This is optional and skippable — your wallet never depends on it. (In the browser extension, some versions do not offer claiming; if the popup does not, claim from the mobile app.) A handle binds to a specific address rather than to the wallet as a whole, which matters once you have more than one account — see [Several accounts from one phrase](/qorex/account-and-dashboard#accounts) and [@handle](/qorex/account-and-dashboard#handle).

## Language

QoreX ships in ten languages — English, Romanian, German, Spanish, French, Italian, Turkish, Arabic, Japanese, and Korean — and follows your phone's language automatically, falling back to English for anything else. You can override the detected language anytime from **Settings → Language**; choosing Arabic also switches the interface to right-to-left.

## Next steps

- [Send & Receive](/qorex/send-and-receive) — make your first quantum-safe transfer.
- [Security & Recovery](/qorex/security-and-recovery) — set up social recovery so you are never locked out.
- [Portfolio & Staking](/qorex/portfolio-and-staking) — track assets and earn staking rewards.
