---
slug: /qorex/overview
title: QoreX Wallet
sidebar_label: Overview
sidebar_position: 1
---

# QoreX Wallet

**QoreX** is the official **non-custodial** wallet for **QoreChain**, the quantum-safe Layer 1 (mainnet `qorechain-vladi`). Your private keys are generated and stored **only on your device** — QoreChain Association never has access to your funds and the apps collect **no data**. Every QOR transfer on the Native lane carries a **hybrid post-quantum signature** (ML-DSA-87, NIST FIPS-204, paired with secp256k1), so your funds are protected against both classical and quantum attackers.

QoreX comes in two parts that work together:

- **Browser extension** — the desktop wallet, **live and public on Chrome, Firefox, and Safari (macOS)**. It is a standalone wallet (create/import, hold and send QOR) and the connector that lets any website discover QoreX and turn every request into an explicit approval. See [Browser Extension](/qorex/browser-extension).
- **Mobile app** (Android & iOS) — the full wallet: create/restore, send & receive quantum-safe QOR, external networks, staking, portfolio, recovery, and an in-app dApp browser. **On Google Play** for Android, and **on the App Store** for iOS (see availability below).

## Platform availability {#platform-availability}

| Capability | Mobile app (Android & iOS) | Browser extension |
|---|---|---|
| Create / import a wallet | ✅ | ✅ (standalone) |
| Several accounts from one recovery phrase | ✅ (up to 20) | ✅ *(from 0.2.2)* |
| Send & receive QOR (post-quantum) | ✅ | ✅ (from the popup, incl. Receive QR) |
| Pay / claim an @handle | ✅ | ✅ |
| Staking (delegate, undelegate, claim) | ✅ | ✅ *(from 0.2.2 — its own Stake screen, and it can approve a staking request the Dashboard sends over)* |
| External networks (Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis, Celestia + tokens) | ✅ | ✅ (send from the popup) |
| Interface language (10 languages) | ✅ (follows the phone) | ✅ (follows the browser) |
| Portfolio, Q-Day Scanner, Social Recovery, Legacy | ✅ | — |
| dApp connections | ✅ (in-app browser) | ✅ (any website) |
| Account sign-in & payment requests | ✅ | — |
| Multi-device linking | ✅ | — |
| Dashboard pairing | ✅ | ✅ (connect + proposed transfers, incl. staking) |

:::note Extension staking needs 0.2.2 or later
If your extension is older than 0.2.2, the Dashboard's staking button may report that the extension needs updating even though you're on a recent build — the fix that connects the Dashboard's staking request to the extension shipped in 0.2.2. Check [which version is live where](/qorex/browser-extension#versions); if your store hasn't pushed 0.2.2 yet, staking approval will start working as soon as it does, with no action from you.
:::

## Why QoreX is different

- **Quantum-safe by default** — Native-lane QOR transfers always carry an ML-DSA-87 + secp256k1 hybrid signature. Anything classical (external chains) is clearly labeled, never silent.
- **Truly non-custodial** — keys are generated on-device and live in a hardware-backed vault (Secure Enclave on iOS, StrongBox on Android) or an encrypted vault (extension). They never leave your device.
- **No data collection** — no analytics, tracking, or ads in any QoreX app. An optional account sign-in adds conveniences (see [Account & Dashboard](/qorex/account-and-dashboard)) but the wallet never depends on it.
- **One unified balance** — your QOR is one balance across the Native, EVM, and SVM lanes; QoreX shows it as a single figure.
- **Multiple recovery paths** — a 24-word recovery phrase (always), optional social recovery with guardians and a 48-hour timelock, optional Legacy inheritance, and convenient multi-device linking.

## Get started

- New to QoreX? Start with [Getting Started](/qorex/getting-started) to create or restore your wallet.
- Then learn to [Send & Receive](/qorex/send-and-receive) quantum-safe QOR.
- Set up your safety net in [Security & Recovery](/qorex/security-and-recovery).
- On desktop, install the [Browser Extension](/qorex/browser-extension).

:::note Download & availability
- **Browser extension** — live and public: install it from the [Chrome Web Store, Firefox Add-ons, or the Mac App Store (Safari)](/qorex/browser-extension#install). See [which version is live where](/qorex/browser-extension#versions) — newer features may still be rolling out to some browsers.
- **Android app** — live in production on Google Play: https://play.google.com/store/apps/details?id=network.qore.qorex
- **iOS app** — live on the **App Store**: https://apps.apple.com/us/app/qorex-wallet/id6791256626.

Store review runs on its own schedule, so the newest release sometimes reaches one store before another — see [which version is live where](#platform-availability) below for the exact current picture. Always install from an official store listing.
:::

:::note Which version is live where
Store approvals land at different times, so the version below can differ briefly by platform:

| Platform | Live version |
|---|---|
| Android | 1.0.4 |
| iOS | 1.0.2 (an update is in review) |
| Firefox | 0.2.2 |
| Chrome | 0.1.5 (0.1.9 is in review; a later 0.2.2 submission follows once that review clears) |
| Safari (macOS) | 1.3, carrying extension 0.2.2 |

This page describes QoreX's current feature set — a store still serving an older build will catch up automatically with no action from you.
:::
