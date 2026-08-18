---
slug: /qorex/getting-started
title: Getting Started with QoreX
sidebar_label: Getting Started
sidebar_position: 2
---

# Getting Started with QoreX

This page walks through installing the **mobile app** and creating, restoring, or linking your wallet. For the desktop wallet, see the [Browser Extension](/qorex/browser-extension), which is live on Chrome, Firefox, and Safari.

:::note Mobile availability
The QoreX mobile app is currently in public testing:

- **Android** — available for **public testing** on Google Play.
- **iOS** — available for testing via **TestFlight** if you'd like to try it.

Find the current links on [qorechain.io](https://qorechain.io).
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
2. QoreX generates a **24-word recovery phrase** on your device (256-bit entropy) and derives your QoreChain identity — coin type 118, a `qor1…` address (your ETH and SOL accounts come from the same seed).
3. **Write the 24 words down** and store them offline. This phrase is the **only** way to recover your wallet if you lose the device.
4. Confirm the phrase; QoreX seals it in the hardware-backed, biometric-gated vault.

:::caution Your recovery phrase is everything
Anyone with your 24 words controls your funds, and no one — including QoreChain Association — can recover them for you. Never type your phrase into a website, share it, or store it in a screenshot or cloud note.
:::

### 2. Restore an existing wallet

1. Tap **Restore existing wallet**.
2. Type your 24 words in order.
3. QoreX re-derives the same addresses — your wallet looks identical on any device.

### 3. Link from another device

If you already have QoreX on another phone or tablet, you can move the wallet across with **no server and no typing** — see [Link a new device](/qorex/security-and-recovery#link-device). Choose **Link from another device** on the new device to begin.

## Optional: claim an @handle

After your wallet is created you can claim a unique **@handle** (for example `@liviu`) so people can send to you by name instead of a `qor1…` address. This is optional and skippable — your wallet never depends on it. See [Account & Dashboard](/qorex/account-and-dashboard#handle).

## Next steps

- [Send & Receive](/qorex/send-and-receive) — make your first quantum-safe transfer.
- [Security & Recovery](/qorex/security-and-recovery) — set up social recovery so you are never locked out.
- [Portfolio & Staking](/qorex/portfolio-and-staking) — track assets and earn staking rewards.
