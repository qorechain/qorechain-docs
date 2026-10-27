---
slug: /dashboard/overview
title: Dashboard Overview & Getting Started
sidebar_label: Overview & Getting Started
sidebar_position: 1
---

# Dashboard Overview & Getting Started

The QoreChain Dashboard at **[dashboard.qorechain.io](https://dashboard.qorechain.io)** is the official web app for using QoreChain from your browser. From a single place you can explore the chain, manage a wallet, swap tokens, generate and audit smart contracts, stake to validators, claim testnet tokens, complete quests, and reach the network's tooling.

Everything in this section is a user how-to: what each page does and how to use it. No installation is required — the Dashboard runs entirely in your browser.

## What you can do

| Area | What it is for |
| --- | --- |
| **[Explorer](/dashboard/explorer)** | Browse blocks, transactions, addresses, and validators. |
| **[Wallet](/dashboard/wallet)** | View your balance and history and receive QOR — with your own wallet (non-custodial) on mainnet, or a dashboard-managed test wallet on testnet. |
| **[Trade](/dashboard/trade)** | Swap tokens and provide liquidity on the on-chain AMM. |
| **[Smart Contract Creator](/dashboard/smart-contract-creator)** | Generate smart contracts with **QCAI** across 17 supported blockchains. |
| **[Contract Auditor](/dashboard/contract-auditor)** | Run a **QCAI** security analysis on a smart contract. |
| **[Staking & Validators](/dashboard/staking-and-validators)** | Review validators and delegate your QOR. |
| **[Faucet](/dashboard/faucet)** | Request test tokens on testnet. |
| **[Quests](/dashboard/quests)** | Complete guided tasks to learn the network. |
| **[Tools Hub](/dashboard/tools-hub)** | Operator and builder tooling in six tabs: Validator Program, Validator Application, Light Node, Node Registration, Rollups and SDK. |

## Sign in {#sign-in}

The Dashboard has two layers: a **Dashboard account** you sign in with, and the **wallet** you connect to it. Most pages need the account first:

- **Pages that need you to be signed in:** [Wallet](/dashboard/wallet), [Trade](/dashboard/trade), [Faucet](/dashboard/faucet), [Quests](/dashboard/quests), your saved contracts in the [Smart Contract Creator](/dashboard/smart-contract-creator), and your profile. Opening one of them while signed out sends you to the sign-in page.
- **Viewing mainnet while signed out:** on pages that show mainnet data, including the Explorer inside the Dashboard, a signed-out visitor sees "Sign in to view mainnet" and a **Sign in** button. The same Explorer is also served without any account at [explore.qore.network](https://explore.qore.network).
- **Open without an account:** the [Smart Contract Creator](/dashboard/smart-contract-creator) landing page (it offers one free generation) and the [Tools Hub](/dashboard/tools-hub). Running a contract audit needs an account.

Browsing the Dashboard never needs a wallet; connecting one is a separate step, described next.

## Connect your wallet {#connect-your-wallet}

Most actions that change on-chain state — sending tokens, swapping, staking — require a connected wallet. How the Dashboard handles keys depends on the network:

- **Mainnet is non-custodial.** The Dashboard never holds your mainnet keys. You connect your own wallet — **QoreX** (the official QoreChain wallet, extension or app), **Keplr**, or **MetaMask** — and the Dashboard reads your real balance and history from the chain. Every mainnet transaction is signed in your own wallet, never by the Dashboard. Sending and staking on the **Native rail require QoreX**, since QoreChain accounts sign with a post-quantum hybrid signature that only QoreX produces today; Keplr can still connect to view your Native-rail balance. **MetaMask** connects on the **EVM rail**; sending there also needs the account's post-quantum key and an open EVM authorisation window, which is opened from QoreX on the Ethereum-style (coin 60) account that shares MetaMask's key (see [Sending with MetaMask](/dashboard/wallet#send-metamask)).
- **Testnet is custodial.** The Dashboard manages a test wallet for you, so you can experiment with zero setup and no real value at risk.

### Connect with QoreX (recommended) {#connect-qorex}

QoreX is the official QoreChain wallet. The Dashboard's **Connect with QoreX** card supports both the browser extension and the mobile app from the same entry point.

1. Open [dashboard.qorechain.io](https://dashboard.qorechain.io) and make sure the header shows **Mainnet**.
2. If this is your first visit to a mainnet page, read and accept the [one-time risk acknowledgement](#risk-acknowledgement).
3. Open **Wallet** in the sidebar (you must be signed in) and select **Connect with QoreX** on the **QoreX wallet** card.
4. If the QoreX browser extension is installed and detected in this browser, the Dashboard asks **"How do you want to connect?"** with two options, **Browser extension** and **QoreX app**. Pick one — the choice is saved, so returning visits skip this prompt (a **Use a different method** link is always available if you want to switch later). If no extension is detected, the Dashboard goes straight to the app flow.
   - **Browser extension**: the extension's own popup opens, showing `dashboard.qorechain.io` as the site requesting the connection. Review it and approve — this signs a one-time proof that you own your `qor1...` address (no funds move). Pairing completes immediately, in the same browser session.
   - **QoreX app**: the Dashboard shows a QR code (with an **Open QoreX** link that opens the app directly if you're browsing from the same phone). Open the QoreX app, scan the QR code (or tap the link), review the pairing request showing the Dashboard's origin, and approve it with your biometric confirmation. The Dashboard is polling in the background and finishes pairing automatically once you approve.
5. Once approved, the Dashboard shows your `qor1...` address and unlocks the actions that need a signature.

See [Wallet](/dashboard/wallet#mainnet) for the full connect and send walkthrough per wallet type, and the QoreX docs' [Account & Dashboard](/qorex/account-and-dashboard#dashboard) page for the wallet-side view of the same pairing.

### Connect with Keplr or MetaMask

1. Open [dashboard.qorechain.io](https://dashboard.qorechain.io) and make sure the header shows **Mainnet**.
2. If this is your first visit to a mainnet page, read and accept the one-time risk acknowledgement (see below).
3. Open **Wallet** in the sidebar and, under **or connect another wallet**, select **Connect Keplr** or **Connect MetaMask**.
4. Approve the connection in your wallet.

Once connected, the Wallet page shows your address (in shortened form) with its balance and history. MetaMask lets you receive on the EVM rail, and send there once an EVM window is open (see [Sending with MetaMask](/dashboard/wallet#send-metamask)). Keplr unlocks viewing your balance and history on the Native rail — sending and staking there go through QoreX (see above), since QoreChain accounts sign with a post-quantum hybrid signature. Read-only pages such as the Explorer work without connecting at all.

QoreChain accounts use the `qor` bech32 prefix, so a connected address looks like `qor1...` — the same account also has an EVM (`0x...`) and an SVM (base58) encoding. Accounts are protected with quantum-safe cryptography. See [Wallet Setup](/getting-started/wallet-setup) for first-time setup guidance, and [Add QoreChain to your wallet](/dashboard/wallet#add-network) if your wallet does not know the network yet.

### One-time risk acknowledgement {#risk-acknowledgement}

Before you can use any mainnet page, the Dashboard asks you to accept a one-time disclaimer. It confirms you understand that mainnet transactions move **real funds**, that the Dashboard is **non-custodial** (only you control your keys), and that on-chain transactions are **irreversible**. You accept it once; after that, mainnet pages open directly.

## Select your network

The Dashboard works against two networks. The header shows the network you are currently connected to and lets you switch; it opens on **Mainnet** by default, and your choice is remembered in your browser.

| Network | Chain ID | When to use it |
| --- | --- | --- |
| **Mainnet** | `qorechain-vladi` | Live network (live since 7 June 2026, running chain v3.2.4 since 23 October 2026) for real value and production use. Non-custodial: you connect your own wallet. |
| **Testnet** | `qorechain-diana` | Free environment for testing (running chain v3.2.6 since 27 October 2026), with a dashboard-managed test wallet and the [Faucet](/dashboard/faucet) for test tokens. |

The native token is **QOR** (base denomination `uqor`, where 1 QOR = 10^6 uqor). If you are new, start on testnet, claim tokens from the Faucet, and try a first transfer before moving to mainnet.

:::tip New to QoreChain?
Follow [Connecting to Testnet](/getting-started/connecting-to-testnet) and [Your First Transaction](/getting-started/first-transaction) to get hands-on quickly, then come back to explore the rest of the Dashboard.
:::

## Related

* [Explorer](/dashboard/explorer) — browse blocks, transactions, and accounts.
* [Wallet](/dashboard/wallet) — manage accounts and send transactions.
* [Trade / DEX](/dashboard/trade) — swap tokens against on-chain AMM pools.
* [Tools Hub](/dashboard/tools-hub) — Validator Program, Validator Application, Light Node, Node Registration, Rollups and SDK.
* [Faucet](/dashboard/faucet) — test tokens on testnet.
