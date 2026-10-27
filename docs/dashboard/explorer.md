---
slug: /dashboard/explorer
title: Explorer
sidebar_label: Explorer
sidebar_position: 2
---

# Explorer

The **Explorer** is the Dashboard's window into the chain. Use it to look up blocks, transactions, addresses, and validators, and to watch network activity in real time. The Explorer is read-only — no wallet connection is needed to browse it. Inside the Dashboard, viewing mainnet requires being signed in; a separate public explorer that needs no account is available at [explore.qore.network](https://explore.qore.network) (it is a different application, with its own Mainnet/Testnet toggle).

## The overview page

Open **Explorer** from the Dashboard to see a live snapshot of the network:

- **Network status** — chain ID, current status, and a security status chip.
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

The page also shows what protected the transaction, and it only makes a claim the chain backs up:

* **PQC Verified.** A native-lane transaction shows this card only when it succeeded **and** the chain itself verified its hybrid signature, including the ML-DSA-87 part (the chain records a verification event for it). A failed transaction, or one without a verified hybrid signature, shows standard security instead; the Explorer does not assume a signature is post-quantum.
* **Authorised by a PQC window.** A transaction sent from an EVM wallet carries an ordinary secp256k1 signature, so it is never labelled "PQC Verified". If the sender had an open [EVM authorisation window](/developer-guide/evm-development#evm-window) when it was sent, the page says it was **authorised by a PQC window** and shows a **Window opened by** link to the post-quantum-signed transaction that opened the window. This applies from the activation heights of the window feature (testnet 5,920,000; mainnet 2,981,742).

These labels are specific to the Dashboard Explorer at dashboard.qorechain.io/explorer. The separate explorer at explore.qore.network is a different application and does not apply these rules.

## Block details

A block page shows its height, timestamp, proposer, hash, transaction count, gas used, and the list of transactions it contains, along with its signature count. Blocks carry no post-quantum label: they are signed by the validators' consensus keys, and the post-quantum protection is shown per transaction, not per block. Previous and next controls let you step through the chain block by block.

## Address details

A QoreChain address is one account with three encodings — Native (`qor1...`), EVM (`0x...`), and SVM (base58) — and the address page merges the activity from all three rails into a single view of that one identity.

The page shows the address with a scannable QR code, its QOR balance, transaction count, and totals for incoming and outgoing transfers. Below that is the combined transaction history for the address across the Native, EVM, and SVM rails — transfers, contract deployments, PQC key registrations, swaps, faucet claims, and more — each with its amount, time, and status. You can copy the address, download its QR code, and open any transaction for details.

## Validators {#validators}

The validators view lists the network's validators with summary cards for the active validator count, total bonded QOR, and consensus health. The table shows each validator's rank, moniker, voting power, commission, and status (for example active or jailed), plus a post-quantum indicator. A search box filters by validator name or address. To delegate to a validator, see [Staking & Validators](/dashboard/staking-and-validators).

:::note The Dashboard's own validators list can show the other network's set
Use [explore.qore.network](https://explore.qore.network) for the authoritative per-network validator list.
:::

## Standalone explorer {#standalone-explorer}

The same Explorer is served without the Dashboard at [explore.qore.network](https://explore.qore.network): anonymous, explorer-only, with short links such as `/tx/…`, `/block/…`, `/address/…` and `/validators`. It opens on mainnet by default.
