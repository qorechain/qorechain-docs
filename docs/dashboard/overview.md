---
slug: /dashboard/overview
title: Dashboard Overview & Getting Started
sidebar_label: Overview & Getting Started
sidebar_position: 1
---

# Dashboard Overview & Getting Started

The QoreChain Dashboard at **[dashboard.qorechain.io](https://dashboard.qorechain.io)** is the official web app for using QoreChain from your browser. From a single place you can explore the chain, manage a wallet, swap tokens, move assets across chains, generate and audit smart contracts, stake to validators, claim testnet tokens, complete quests, and reach the network's tooling.

Everything in this section is a user how-to: what each page does and how to use it. No installation is required — the Dashboard runs entirely in your browser.

## What you can do

| Area | What it is for |
| --- | --- |
| **[Explorer](/dashboard/explorer)** | Browse blocks, transactions, addresses, and validators. |
| **[Wallet](/dashboard/wallet)** | View your balance and history and receive QOR — with your own wallet (non-custodial) on mainnet, or a dashboard-managed test wallet on testnet. |
| **[Trade](/dashboard/trade)** | Swap tokens and provide liquidity on the on-chain AMM. |
| **[Bridge](/dashboard/bridge)** | Move assets between QoreChain and other chains. |
| **[Smart Contract Creator](/dashboard/smart-contract-creator)** | Generate smart contracts with **QCAI** across 17 supported blockchains. |
| **[Contract Auditor](/dashboard/contract-auditor)** | Run a **QCAI** security analysis on a smart contract. |
| **[Staking & Validators](/dashboard/staking-and-validators)** | Review validators and delegate your QOR. |
| **[Faucet](/dashboard/faucet)** | Request test tokens on testnet. |
| **[Quests](/dashboard/quests)** | Complete guided tasks to learn the network. |
| **[Tools Hub](/dashboard/tools-hub)** | Reach node, rollup, SDK, and licensing tooling. |

## Connect your wallet {#connect-your-wallet}

Most actions that change on-chain state — sending tokens, swapping, staking, bridging — require a connected wallet. How the Dashboard handles keys depends on the network:

- **Mainnet is non-custodial.** The Dashboard never holds your mainnet keys. You connect your own wallet — **QoreX** (the official QoreChain wallet, extension or app), **Keplr**, or **MetaMask** — and the Dashboard reads your real balance and history from the chain. Every mainnet transaction is signed in your own wallet, never by the Dashboard. Sending and staking on the **Native rail require QoreX**, since QoreChain accounts sign with a post-quantum hybrid signature that only QoreX produces today; Keplr can still connect to view your Native-rail balance. **MetaMask** signs and sends independently on the **EVM rail**.
- **Testnet is custodial.** The Dashboard manages a test wallet for you, so you can experiment with zero setup and no real value at risk.

### Connect with QoreX (recommended) {#connect-qorex}

QoreX is the official QoreChain wallet. The Dashboard's **Connect with QoreX** card supports both the browser extension and the mobile app from the same entry point.

1. Open [dashboard.qorechain.io](https://dashboard.qorechain.io) and make sure the header shows **Mainnet**.
2. If this is your first visit to a mainnet page, read and accept the [one-time risk acknowledgement](#risk-acknowledgement).
3. Select **Connect Wallet** (or **Connect with QoreX** on the wallet card).
4. If the QoreX browser extension is installed and detected in this browser, the Dashboard asks **"How do you want to connect?"** with two options, **Browser extension** and **QoreX app**. Pick one — the choice is saved, so returning visits skip this prompt (a **Use a different method** link is always available if you want to switch later). If no extension is detected, the Dashboard goes straight to the app flow.
   - **Browser extension**: the extension's own popup opens, showing `dashboard.qorechain.io` as the site requesting the connection. Review it and approve — this signs a one-time proof that you own your `qor1...` address (no funds move). Pairing completes immediately, in the same browser session.
   - **QoreX app**: the Dashboard shows a QR code (with an **Open QoreX** link that opens the app directly if you're browsing from the same phone). Open the QoreX app, scan the QR code (or tap the link), review the pairing request showing the Dashboard's origin, and approve it with your biometric confirmation. The Dashboard is polling in the background and finishes pairing automatically once you approve.
5. Once approved, the Dashboard shows your `qor1...` address and unlocks the actions that need a signature.

See [Wallet](/dashboard/wallet#mainnet) for the full connect and send walkthrough per wallet type, and the QoreX docs' [Account & Dashboard](/qorex/account-and-dashboard#dashboard) page for the wallet-side view of the same pairing.

### Connect with Keplr or MetaMask

1. Open [dashboard.qorechain.io](https://dashboard.qorechain.io) and make sure the header shows **Mainnet**.
2. If this is your first visit to a mainnet page, read and accept the one-time risk acknowledgement (see below).
3. Select **Connect Wallet** and choose **Keplr** or **MetaMask**.
4. Approve the connection in your wallet.

Once connected, the Dashboard shows your address (in shortened form) in the header. MetaMask unlocks sending and other signed actions directly on the EVM rail. Keplr unlocks viewing your balance and history on the Native rail — sending and staking there go through QoreX (see above), since QoreChain accounts sign with a post-quantum hybrid signature. Read-only pages such as the Explorer work without connecting at all.

QoreChain accounts use the `qor` bech32 prefix, so a connected address looks like `qor1...` — the same account also has an EVM (`0x...`) and an SVM (base58) encoding. Accounts are protected with quantum-safe cryptography. See [Wallet Setup](/getting-started/wallet-setup) for first-time setup guidance, and [Add QoreChain to your wallet](/dashboard/wallet#add-network) if your wallet does not know the network yet.

### One-time risk acknowledgement {#risk-acknowledgement}

Before you can use any mainnet page, the Dashboard asks you to accept a one-time disclaimer. It confirms you understand that mainnet transactions move **real funds**, that the Dashboard is **non-custodial** (only you control your keys), and that on-chain transactions are **irreversible**. You accept it once; after that, mainnet pages open directly.

## Select your network

The Dashboard works against two networks. The header shows the network you are currently connected to.

| Network | Chain ID | When to use it |
| --- | --- | --- |
| **Mainnet** | `qorechain-vladi` | Live network for real value and production use. Non-custodial: you connect your own wallet. |
| **Testnet** | `qorechain-diana` | Free environment for testing, with a dashboard-managed test wallet and the [Faucet](/dashboard/faucet) for test tokens. |

The native token is **QOR** (base denomination `uqor`, where 1 QOR = 10^6 uqor). If you are new, start on testnet, claim tokens from the Faucet, and try a first transfer before moving to mainnet.

:::tip New to QoreChain?
Follow [Connecting to Testnet](/getting-started/connecting-to-testnet) and [Your First Transaction](/getting-started/first-transaction) to get hands-on quickly, then come back to explore the rest of the Dashboard.
:::

## Related

* [Explorer](/dashboard/explorer) — browse blocks, transactions, and accounts.
* [Wallet](/dashboard/wallet) — manage accounts and send transactions.
* [Trade / DEX](/dashboard/trade) — swap tokens against on-chain AMM pools.
* [Bridge](/dashboard/bridge) — move assets across chains.
* [Tools Hub](/dashboard/tools-hub) — licenses, faucet, and developer utilities.
