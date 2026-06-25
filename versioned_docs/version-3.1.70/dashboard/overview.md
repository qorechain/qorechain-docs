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
| **[Wallet](/dashboard/wallet)** | View balances, send and receive QOR, and manage your addresses. |
| **[Trade](/dashboard/trade)** | Swap tokens and provide liquidity on the on-chain AMM. |
| **[Bridge](/dashboard/bridge)** | Move assets between QoreChain and other chains. |
| **[Smart Contract Creator](/dashboard/smart-contract-creator)** | Generate smart contracts with **QCAI** across 17 supported blockchains. |
| **[Contract Auditor](/dashboard/contract-auditor)** | Run a **QCAI** security analysis on a smart contract. |
| **[Staking & Validators](/dashboard/staking-and-validators)** | Review validators and delegate your QOR. |
| **[Faucet](/dashboard/faucet)** | Request test tokens on testnet. |
| **[Quests](/dashboard/quests)** | Complete guided tasks to learn the network. |
| **[Tools Hub](/dashboard/tools-hub)** | Reach node, rollup, SDK, and licensing tooling. |

## Connect your wallet

Most actions that change on-chain state — sending tokens, swapping, staking, bridging — require a connected wallet.

1. Open [dashboard.qorechain.io](https://dashboard.qorechain.io).
2. Select **Connect Wallet**.
3. Approve the connection in your wallet.

Once connected, the Dashboard shows your address (in shortened form) in the header and unlocks the actions that need a signature. Read-only pages such as the Explorer work without connecting.

QoreChain accounts use the `qor` bech32 prefix, so a connected address looks like `qor1...`. Accounts are protected with quantum-safe cryptography. See [Wallet Setup](/getting-started/wallet-setup) for first-time setup guidance.

## Select your network

The Dashboard works against two networks. The header shows the network you are currently connected to.

| Network | Chain ID | When to use it |
| --- | --- | --- |
| **Mainnet** | `qorechain-vladi` | Live network for real value and production use. |
| **Testnet** | `qorechain-diana` | Free environment for testing, with the [Faucet](/dashboard/faucet) for test tokens. |

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
