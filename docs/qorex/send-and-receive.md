---
slug: /qorex/send-and-receive
title: Send & Receive
sidebar_label: Send & Receive
sidebar_position: 3
---

# Send & Receive

The Home (Wallet) tab is your starting point. It shows a **network badge** (MAINNET by default, or TESTNET if you enabled the developer toggle), your **total balance** (tap to hide/show), and the main actions: **Send · Receive · Swap · Stake**. Your asset list shows **QOR** (Native + post-quantum 🛡, one unified balance across the Native/EVM/SVM lanes) and **All networks** (a unified view across ETH, BNB, POL, ARB, and the other [external networks](#external-networks-tokens) QoreX supports).

## Send quantum-safe QOR

1. Tap **Send**.
2. Enter the recipient as a `qor1…` address **or** an **@handle**. A handle is resolved and cryptographically verified (registry signature + owner signature + trust-on-first-use pinning); if a handle's key ever changes silently, QoreX shows an explicit warning.
3. Enter the amount. The preview shows the recipient, amount, fee, and the **Shield** state — the post-quantum protection level of the signature.
4. Confirm with **biometric** approval. QoreX signs the transfer with the mandatory hybrid post-quantum signature (ML-DSA-87 + secp256k1) and broadcasts it on the Native lane.

Your **first** transfer also registers your post-quantum key on-chain automatically — you can see this in [Security & Recovery](/qorex/security-and-recovery#pqc-key). No separate step is needed.

### Send to an @handle, step by step {#handle-send}

1. Open **Send** and type `@` followed by the handle (for example `@liviu`) in the recipient field instead of an address.
2. QoreX looks the handle up and shows you the **resolved `qor1…` address** before you confirm anything.
3. Check the resolved address, enter the amount, and confirm as usual.

QoreX only accepts a resolution that passes **both** checks it performs: a registry attestation verified against a trust key pinned in the app, and the handle owner's own signature over the claim. Failing either check throws an error rather than falling back to an unverified address. The first time you pay a given handle, QoreX remembers the address it resolved to; if that handle's address ever changes, QoreX stops before signing and shows you the old and new address side by side so you can decide whether to continue. The browser extension resolves and pays handles the same way — see [Send to an @handle](/qorex/browser-extension#handle-send).

### Sending vesting (locked) QOR {#vesting}

If part of your balance is still **vesting** — for example an unreleased TGE allocation — your total is split into **available now** and **still locked**. You can only send the available portion; QoreX refuses an over-spend attempt itself rather than letting the network reject it after taking a fee. The locked portion becomes spendable gradually as the vesting schedule unlocks it. This split is shown wherever your balance appears — Home, Send, and Asset detail.

## Receive QOR

Tap **Receive** to show your `qor1…` address as a QR code (with the QoreChain icon embedded) and a copy button. Share either with the sender.

## Request a payment

Tap **Request** (requires [sign-in](/qorex/account-and-dashboard#sign-in)) to create a payment request — an amount plus an optional memo — as a QR code or link. Whoever scans it sees the pre-filled transfer.

## External networks & tokens {#external-networks-tokens}

From **All networks** (or Send-external) you can send **ETH, BNB, POL, AVAX, and SOL** natively, plus ETH on **Arbitrum, Base, and OP Mainnet**, and **ATOM, OSMO, and TIA** on Cosmos, plus **ERC-20**, **SPL**, and **IBC** tokens — USDC and USDT across the EVM chains and Solana, DAI on Ethereum, and Noble USDC over IBC — all derived from the same recovery phrase (ETH uses `m/44'/60'`, SOL uses its standard path, and SPL uses associated token accounts).

:::caution External chains are classical-only
Other blockchains cannot carry post-quantum signatures. When you send on an external network, QoreX states this explicitly (the transfer uses a classical signature and the **Shield** shows the downgrade). Your **QOR** always stays on the protected Native lane. Cosmos-based external sends support an optional memo.
:::

## Swap

The **Swap** tab is wired to QoreChain's on-chain AMM but stays disabled — the button reads **"Swap — coming with pool liquidity"** — until liquidity and the remote feature flag turn it on. When that happens it lights up automatically; **no app update is needed**.

:::note iOS
The Swap tab does not appear at all in the App Store build — Apple treats an in-app token exchange as a regulated service. Swap remains available (once enabled) on Android and in the browser extension.
:::

## Next steps

- [Portfolio & Staking](/qorex/portfolio-and-staking) — see your allocation and earn rewards.
- [Security & Recovery](/qorex/security-and-recovery) — protect and recover your wallet.
