---
slug: /dashboard/wallet
title: Wallet
sidebar_label: Wallet
sidebar_position: 3
---

# Wallet

The **Wallet** page is where you view your balance and transaction history, receive QOR, and send it. How the page works depends on the network:

- **Mainnet — non-custodial.** The Dashboard does not hold mainnet keys. You connect your own wallet (**Keplr** for the Native rail, **MetaMask** for the EVM rail), your real balance and history are read directly from the chain, and you can receive funds on any rail. Sends happen from your own connected wallet.
- **Testnet — custodial.** The Dashboard manages a test wallet for you, so you can try transfers, swaps, and staking with zero setup. Fund it from the [Faucet](/dashboard/faucet).

Accounts are protected with quantum-safe cryptography, and the Native encoding of every address uses the `qor` bech32 prefix (`qor1...`).

## One account, three encodings {#one-account-three-encodings}

A QoreChain account is a single identity that can be written three ways — one per execution rail:

| Rail | Encoding | Looks like |
| --- | --- | --- |
| **Native QOR** | bech32 | `qor1...` |
| **EVM** | hex | `0x...` |
| **SVM** | base58 | e.g. `5Gv7...` |

All three encodings point to the **same account and the same balance**. Funds received on any rail land in your one balance, and the Dashboard indexes balance and history via the `qor1` (Native) encoding, so activity from every rail shows up together.

## Use the Wallet on mainnet {#mainnet}

1. Switch the Dashboard header to **Mainnet**.
2. If prompted, accept the [one-time risk acknowledgement](/dashboard/overview#risk-acknowledgement) — mainnet moves real funds, the Dashboard is non-custodial, and transactions are irreversible.
3. Select **Connect Wallet** and choose **Keplr** (Native rail) or **MetaMask** (EVM rail), then approve the connection in your wallet.
4. The page loads your real balance and transaction history from the chain.

If your wallet does not have QoreChain configured yet, add it first — see [Add QoreChain to your wallet](#add-network).

### Send on mainnet {#send-mainnet}

Because the Dashboard never holds your mainnet keys, sends are made from your own connected wallet: create the transfer in Keplr (Native rail) or MetaMask (EVM rail) as you would on any network, and sign it there. The Dashboard shows the transaction in your history once it is on-chain.

:::caution Real funds, irreversible transfers
Mainnet transactions are irreversible. Always double-check the recipient address in your wallet before signing.
:::

### Receive on a specific rail {#receive-mainnet}

1. Select **Receive**.
2. In the receive modal, pick a rail with the selector: **Native QOR**, **EVM**, or **SVM**.
3. The modal shows your address in that rail's encoding (`qor1...`, `0x...`, or base58) with a QR code and a copy button.
4. Copy the address, or let the sender scan the QR code.

Whichever rail the sender uses, the funds arrive in the same account — one account, three encodings, one balance.

### Read your transaction history {#history}

On mainnet, each row in your history shows:

- A **rail badge** — Native, EVM, or SVM — telling you which rail the transaction used.
- A **real transaction-type label**, such as *Send*, *PQC key registration*, or *contract deploy*, instead of a generic label.
- The amount, time, and status, with the transaction hash you can open in the [Explorer](/dashboard/explorer).

## Use the Wallet on testnet {#testnet}

On testnet (`qorechain-diana`) the Dashboard manages a test wallet for you, so you can test flows end to end without connecting anything.

### What the page shows

- Your wallet label and active address, in shortened form, with a one-click copy button.
- Your **total balance** in QOR.
- A security panel noting quantum-safe encryption and the connected network.
- A last-updated indicator with a refresh control.
- **Assets** and **Activity** tabs showing your holdings and transaction history.

Use the refresh control any time to pull your current balance and latest activity from the chain.

### Send QOR (testnet)

1. Select **Send**.
2. Enter the recipient address (`qor1...`).
3. Enter the amount, and an optional memo.
4. Review the details and estimated fee, then confirm.

As you type a recipient, saved contacts and recent addresses are suggested to help you avoid mistakes. After the transfer is submitted, you receive a confirmation with the transaction hash, which you can open in the [Explorer](/dashboard/explorer).

### Receive QOR (testnet)

1. Select **Receive**.
2. Share your address or its QR code with the sender, or copy the address with one click.
3. Optionally enter a requested amount and memo to generate a payment link and a downloadable QR code.

### Manage your test wallets

Select **My Wallets** to open your address list. From there you can switch between wallets, create a new wallet, import an existing one, or remove a wallet you no longer need. The active wallet is the one used for sending, swapping, staking, and other signed actions across the Dashboard on testnet.

## Add QoreChain to your wallet {#add-network}

The **Add Network** page shows four side-by-side cards — one per way of connecting — so you can add QoreChain to your own wallet in one click:

| Card | What it gives you |
| --- | --- |
| **Native** | RPC and REST endpoints plus the chain ID, each with a copy button — for Keplr and other Native-rail wallets. |
| **EVM** | Ready-made EIP-3085 network parameters — one click adds QoreChain to MetaMask and other EVM wallets. |
| **SVM** | The SVM RPC URL for SVM-compatible wallets and tools. |
| **WalletConnect** | A WalletConnect pairing to link any WalletConnect-compatible wallet. |

To add QoreChain:

1. Open the **Add Network** page from the Dashboard.
2. Pick the card that matches your wallet's rail.
3. Select the add button (EVM, WalletConnect), or copy the endpoints and chain ID into your wallet's add-network form (Native, SVM).
4. Approve the new network in your wallet.

The public endpoints are `rpc.qore.host` (Native RPC), `api.qore.host` (REST), `evm.qore.host` (EVM JSON-RPC), and `svm.qore.host` (SVM RPC), with `*-testnet` variants (for example `rpc-testnet.qore.host`) for testnet. Chain IDs: mainnet `qorechain-vladi` (EVM chain ID `9801`), testnet `qorechain-diana` (EVM chain ID `9800`).

## Related

- [Token Operations](/user-guide/token-operations) — concepts behind QOR transfers and denominations.
- [Trade](/dashboard/trade) — swap your tokens on the on-chain AMM.
- [Bridge](/dashboard/bridge) — move assets to and from other chains.
