---
slug: /qorex/overview
title: QoreX Wallet
sidebar_label: Overview
sidebar_position: 1
---

# QoreX Wallet

**QoreX** is the official **non-custodial** wallet for **QoreChain**, the quantum-safe Layer 1 (mainnet `qorechain-vladi`). Your private keys are generated and stored **only on your device** — QoreChain Association never has access to your funds and the apps collect **no data**. Every QOR transfer on the Native lane carries a **hybrid post-quantum signature** (ML-DSA-87, NIST FIPS-204, paired with secp256k1), so your funds are protected against both classical and quantum attackers.

QoreX comes in two parts that work together:

- **Mobile app** (iOS & Android) — the full wallet: create/restore, send & receive quantum-safe QOR, external networks, staking, portfolio, recovery, and an in-app dApp browser.
- **Browser extension** (Chrome & Firefox, with Safari from the same codebase) — the dApp connector for desktop: it lets websites discover your wallet and turns every request into an explicit approval.

## Platform availability

| Capability | iOS/Android app | Chrome/Firefox extension |
|---|---|---|
| Create / restore / link a wallet | ✅ | — (pairs with the app) |
| Send & receive QOR (post-quantum) | ✅ | via dApp signing |
| External networks (ETH / BNB / POL / ARB / SOL + tokens) | ✅ | ✅ (send from the popup) |
| Staking, Portfolio, Q-Day Scanner, Recovery, Legacy | ✅ | — |
| dApp connections | ✅ (in-app browser) | ✅ (any website) |
| Account (@handle, payment requests, Dashboard link) | ✅ | — |

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
QoreX **1.0** is rolling out across the app stores — the iOS and Android apps (App Store and Google Play) and the browser extension (Chrome Web Store, Firefox Add-ons, and a Safari build). Some targets may still be in a store's review queue at any given moment. Always find the current, official download links on [qorechain.io](https://qorechain.io), and only install QoreX from an official store listing.
:::
