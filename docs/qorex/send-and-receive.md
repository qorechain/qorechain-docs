---
slug: /qorex/send-and-receive
title: Send & Receive
sidebar_label: Send & Receive
sidebar_position: 3
---

# Send & Receive

The Home (Wallet) tab is your starting point. It shows a **network badge** (MAINNET by default, or TESTNET if you enabled the developer toggle), your **total balance** (tap to hide/show), and the main actions: **Send · Receive · Swap · Stake**. Your asset list shows **QOR** (Native + post-quantum 🛡, one unified balance across the Native/EVM/SVM lanes) and **All networks** (a unified ETH · BNB · POL · ARB view).

## Send quantum-safe QOR

1. Tap **Send**.
2. Enter the recipient as a `qor1…` address **or** an **@handle**. A handle is resolved and cryptographically verified (registry signature + owner signature + trust-on-first-use pinning); if a handle's key ever changes silently, QoreX shows an explicit warning.
3. Enter the amount. The preview shows the recipient, amount, fee, and the **Shield** state — the post-quantum protection level of the signature.
4. Confirm with **biometric** approval. QoreX signs the transfer with the mandatory hybrid post-quantum signature (ML-DSA-87 + secp256k1) and broadcasts it on the Native lane.

Your **first** transfer also registers your post-quantum key on-chain automatically — you can see this in [Security & Recovery](/qorex/security-and-recovery#pqc-key). No separate step is needed.

## Receive QOR

Tap **Receive** to show your `qor1…` address as a QR code (with the QoreChain icon embedded) and a copy button. Share either with the sender.

## Request a payment

Tap **Request** (requires [sign-in](/qorex/account-and-dashboard#sign-in)) to create a payment request — an amount plus an optional memo — as a QR code or link. Whoever scans it sees the pre-filled transfer.

## External networks & tokens

From **All networks** (or Send-external) you can send **ETH, BNB, POL, ARB, and SOL** natively, plus **ERC-20** and **SPL** tokens — all derived from the same recovery phrase (ETH uses `m/44'/60'`, SOL uses its standard path, and SPL uses associated token accounts).

:::caution External chains are classical-only
Other blockchains cannot carry post-quantum signatures. When you send on an external network, QoreX states this explicitly (the transfer uses a classical signature and the **Shield** shows the downgrade). Your **QOR** always stays on the protected Native lane. Cosmos-based external sends support an optional memo.
:::

## Swap

The **Swap** tab is wired to QoreChain's on-chain AMM but stays disabled — the button reads **"Swap — coming with pool liquidity"** — until liquidity and the remote feature flag turn it on. When that happens it lights up automatically; **no app update is needed**.

## Next steps

- [Portfolio & Staking](/qorex/portfolio-and-staking) — see your allocation and earn rewards.
- [Security & Recovery](/qorex/security-and-recovery) — protect and recover your wallet.
