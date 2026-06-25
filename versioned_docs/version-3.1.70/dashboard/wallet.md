---
slug: /dashboard/wallet
title: Wallet
sidebar_label: Wallet
sidebar_position: 3
---

# Wallet

The **Wallet** page is where you view your balance, send and receive QOR, and manage your addresses. Your QoreChain accounts are protected with quantum-safe cryptography, and every address uses the `qor` bech32 prefix (`qor1...`).

Connect your wallet first — see [Overview & Getting Started](/dashboard/overview#connect-your-wallet).

## What the page shows

- Your wallet label and active address, in shortened form, with a one-click copy button.
- Your **total balance** in QOR.
- A security panel noting quantum-safe encryption and the connected network.
- A last-updated indicator with a refresh control.
- **Assets** and **Activity** tabs showing your holdings and transaction history.

Use the refresh control any time to pull your current balance and latest activity from the chain.

## Send QOR

1. Select **Send**.
2. Enter the recipient address (`qor1...`).
3. Enter the amount, and an optional memo.
4. Review the details and estimated fee, then confirm.

As you type a recipient, saved contacts and recent addresses are suggested to help you avoid mistakes. After the transfer is submitted, you receive a confirmation with the transaction hash, which you can open in the [Explorer](/dashboard/explorer).

:::caution Double-check the address
Blockchain transfers are irreversible. Always confirm the recipient address before sending.
:::

## Receive QOR

1. Select **Receive**.
2. Share your address or its QR code with the sender, or copy the address with one click.
3. Optionally enter a requested amount and memo to generate a payment link and a downloadable QR code.

## Manage your wallets

Select **My Wallets** to open your address list. From there you can switch between wallets, create a new wallet, import an existing one, or remove a wallet you no longer need. The active wallet is the one used for sending, swapping, staking, and other signed actions across the Dashboard.

## Related

- [Token Operations](/user-guide/token-operations) — concepts behind QOR transfers and denominations.
- [Trade](/dashboard/trade) — swap your tokens on the on-chain AMM.
- [Bridge](/dashboard/bridge) — move assets to and from other chains.
