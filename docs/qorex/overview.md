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
- **Mobile app** (Android & iOS) — the full wallet: create/restore, send & receive quantum-safe QOR, external networks, staking, portfolio, recovery, and an in-app dApp browser. Currently in public testing (see availability below).

## Platform availability

| Capability | Mobile app (Android & iOS) | Browser extension |
|---|---|---|
| Create / import a wallet | ✅ | ✅ (standalone) |
| Send & receive QOR (post-quantum) | ✅ | ✅ (from the popup) |
| External networks (Ethereum, BNB Chain, Polygon, Arbitrum, Solana, Cosmos Hub, Osmosis, Celestia + tokens) | ✅ | ✅ (send from the popup) |
| Staking, Portfolio, Q-Day Scanner, Recovery, Legacy | ✅ | — |
| dApp connections | ✅ (in-app browser) | ✅ (any website) |
| Account (@handle, payment requests) | ✅ | — |
| Multi-device linking | ✅ | — |
| Dashboard pairing | ✅ | ✅ (connect + proposed transfers, v0.1.5) |

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
- **Browser extension** — live and public: install it from the [Chrome Web Store, Firefox Add-ons, or the Mac App Store (Safari)](/qorex/browser-extension#install).
- **Android app** — available for **public testing** on Google Play.
- **iOS app** — available for testing via **TestFlight** if you'd like to try it.

Find the current, official links on [qorechain.io](https://qorechain.io), and only install QoreX from an official listing.
:::
