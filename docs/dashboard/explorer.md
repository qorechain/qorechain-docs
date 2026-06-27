---
slug: /dashboard/explorer
title: Explorer
sidebar_label: Explorer
sidebar_position: 2
---

# Explorer

The **Explorer** is the Dashboard's window into the chain. Use it to look up blocks, transactions, addresses, and validators, and to watch network activity in real time. The Explorer is read-only — no wallet connection is needed to browse it.

## The overview page

Open **Explorer** from the Dashboard to see a live snapshot of the network:

- **Network status** — chain ID, current status, and a quantum-safe indicator.
- **Block activity** — the latest block height, average block time, and blocks produced today.
- **Supply** — total bonded QOR, the bonded ratio, and circulating supply.
- **Headline stats** — total transactions, active and total validators, and total addresses.
- **Latest blocks** — a live list with each block's height, time, transaction count, and proposer.
- **Latest transactions** — a live list with each transaction's hash, type, block, amount, and sender.

Click any block or transaction row to open its detail page. A refresh control on each list pulls the newest entries.

## Search

The search box at the top of the Explorer accepts any of the following and routes you to the right page automatically:

- An **address** (`qor1...`)
- A **transaction hash**
- A **block height** (a number)

## Transaction details

A transaction page shows its hash, status, amount, sender and recipient (both clickable), fee, block height, transaction type, and memo if present. You can copy the hash and toggle a raw view of the full transaction for deeper inspection.

## Block details

A block page shows its height, timestamp, proposer, hash, transaction count, gas used, and the list of transactions it contains, along with consensus and post-quantum signature information. Previous and next controls let you step through the chain block by block.

## Address details

An address page shows the address with a scannable QR code, its QOR balance, transaction count, and totals for incoming and outgoing transfers. Below that is the full transaction history for the address — transfers, swaps, faucet claims, and more — each with its amount, time, and status. You can copy the address, download its QR code, and open any transaction for details.

## Validators {#validators}

The validators view lists the network's validators with summary cards for the active validator count, total bonded QOR, and consensus health. The table shows each validator's rank, moniker, voting power, commission, and status (for example active or jailed), plus a post-quantum indicator. A search box filters by validator name or address. To delegate to a validator, see [Staking & Validators](/dashboard/staking-and-validators).
