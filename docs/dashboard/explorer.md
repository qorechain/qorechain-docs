---
slug: /dashboard/explorer
title: Explorer
sidebar_label: Explorer
sidebar_position: 2
---

# Explorer

The **Explorer** is the read-only window into the chain: look up blocks, transactions, addresses and validators and watch network activity. It is for anyone who wants to check a transfer, inspect an account, see which signature protected a transaction, or look at the validator set. There are two explorers: the one inside the Dashboard at `dashboard.qorechain.io/explorer`, and a separate public app at [explore.qore.network](https://explore.qore.network) that needs no account. They are different applications and they do not apply the same labelling rules, so this page covers both.

## Innovations {#innovations}

- **A signature label only when the chain verified it.** On the Dashboard Explorer a native transaction shows the **PQC Verified** card only if it succeeded (code 0) **and** the chain emitted a `pqc_hybrid_verify` event with status verified. A failed transaction gets no post-quantum claim.
- **EVM transactions show the window that authorised them.** From the activation height (testnet 5,920,000; mainnet 2,981,742) an EVM transaction shows "Authorised by a PQC window", with a "Window opened by" link to the native, ML-DSA-87-signed transaction that opened it. The window shown is the sender's latest window-open at or below the transaction height that is unexpired and not closed since. An EVM transaction is never labelled "PQC Verified": it carries an ordinary secp256k1 signature. See [EVM authorisation window](/developer-guide/evm-development#evm-window).
- **No per-block post-quantum label.** Blocks are signed by consensus keys, so the protection is shown per transaction, never per block.
- **Validator post-quantum status from the chain.** A validator's address page has a "Post-Quantum Crypto" field, read from the chain. **Enabled** means an ML-DSA-87 key is registered for the operator; **N/A** means the status could not be read. Proof of possession is optional on chain.
- **One account, three rails.** A `qor1...` history merges native, EVM and SVM activity, and the address page shows the amount still vesting and the next unlock date.
- **Network facts and endpoints in one panel.** Chain ID, EVM chain ID, token, decimals, address prefix, coin type, minimum gas price, and copyable public endpoints, with an "Add QoreChain to your wallet" panel.
- **The standalone explorer is built on the public endpoints only.** [explore.qore.network](https://explore.qore.network) reads the chain's public endpoints and needs no account. Its address page shows the `qor1`, `0x` and SVM forms of one account with a live parity check (wei = uqor x 10^12; lamports = uqor x 1000), and its routes work as wallet deep links.

## How to use {#how-to-use}

### Overview

Open **Explorer** in the sidebar. The overview shows:

- the network status with a "Post-Quantum Secured" chip (a network-level label; the per-transaction claim is on the transaction page);
- **Latest Block**, **Block Time** and **Blocks Today**;
- **Total Bonded**, **Bonded Ratio** and **Circulating**;
- **Transactions**, **Real Txs**, **Active Set** and **Total Addresses**;
- **Latest Blocks** and **Latest Transactions**, with refresh buttons and automatic refresh.

Click a block or transaction row to open its page.

### Search

The search box (placeholder "Search QoreChain (Address, Tx, Block)...") routes by what you type:

- `qor...` opens the address page.
- `0x...` or a 64-character string opens the transaction page.
- Digits open the block page.

:::note A 0x address lands on "Transaction Not Found"
The Dashboard search treats `0x...` input as a transaction hash. To look up an EVM address, search its `qor1...` form instead (a `0x` address is the same 20 bytes as its `qor1` form), or use [explore.qore.network](https://explore.qore.network), whose address page accepts both.
:::

### Transaction page

The transaction page shows the hash (with copy), status and type, Block Height, Interactions (From and To), Value & Fees, Memo, Gas Consumed, a cross-chain row when there is one, and **Raw Data**. It also shows what protected the transaction, and it only makes a claim the chain backs up:

- **PQC Verified.** A native-lane transaction that succeeded and whose hybrid signature (including the ML-DSA-87 part) the chain itself verified. A failed transaction, or one without a verified hybrid signature, shows standard security instead.
- **Authorised by a PQC window.** An EVM transaction that was sent while the sender had an open [EVM authorisation window](/developer-guide/evm-development#evm-window), with the **Window opened by** link.

### Block page

Previous and next arrows step through the chain. **Core Information** has the height, hash, proposer, signature count and Gas Used; **Technical Hashes** and **Block Transactions** follow. Blocks carry no post-quantum label.

### Address page

A QoreChain address is one account with three encodings, Native (`qor1...`), EVM (`0x...`) and SVM (base58), and the address page merges activity from all three.

- **Copy address** and **Show QR Code** (a popover; there is no download).
- **Total Balance** and **Available**, and a line for the amount still vesting with the next unlock date.
- **Total Activity** and the combined history (methods such as Transfer, Faucet Claim and Cross-Chain Swap).
- On a validator's address page (`/explorer/address/qorvaloper1...`), the **Post-Quantum Crypto** field.

### Validators {#validators}

`/explorer/validators` lists the network's validators. Summary cards show **Active Validators**, **Bonded Tokens** and **Consensus Health** (a status label, not a measured value). The table has Rank, Validator, Voting Power, Commission, Status and PQC (the PQC column in the table is dimmed for every row; use the validator's address page for its real status). The search box reads "Search validator...". The list follows the network selected in the header. To delegate, see [Staking & Validators](/dashboard/staking-and-validators); for a wider comparison with yield and sign-in, see [Validators](/dashboard/validators).

### Network facts and add to wallet

The overview carries the chain facts and the public endpoints, each copyable, and the same **Add QoreChain to your wallet** panel as the Wallet page (see [Add QoreChain to your wallet](/dashboard/wallet#add-network)).

### Standalone explorer {#standalone-explorer}

[explore.qore.network](https://explore.qore.network) is a separate, explorer-only web app. It opens on **mainnet** and has a **Testnet / Mainnet** toggle in its header. Routes:

| Route | What it shows |
| --- | --- |
| `/` | Live height, status, supply, bonded stake, latest blocks and transactions, chain facts, public endpoints and guide links. |
| `/blocks`, `/block/{height}` | Block list and a block with its transactions. |
| `/txs`, `/tx/{hash}` | Transaction list and a transaction with status, fee, gas, messages and the raw response. |
| `/address/{qor1... or 0x...}` | The unified identity page with the three encodings and the parity check. `/account/*` redirects to `/address/*`. |
| `/validators`, `/validator/{address}` | The validator set with voting power and commission, and one validator. |
| `/tokens`, `/token/{denom}`, `/assets` | Token and asset listings. |
| `/contracts`, `/nfts`, `/collections` | Contracts, NFTs and collections. |

Search accepts a block height, a 64-hex hash (with or without `0x`), a `qor1...` or `0x...` address, or a `qorvaloper1...` address. A `qorvaloper1...` search opens the validators list, not that validator's page. An **Add to wallet** section offers suggestChain (Keplr, Leap, Cosmostation), EIP-3085 (MetaMask and other EVM wallets), SVM custom-RPC instructions and WalletConnect v2 pairing.

The `/tx/`, `/block/` and `/address/` routes work with EIP-3085 block-explorer links, so wallets that open an explorer URL land on the right page.

:::caution Do not use the explorer's /api/lcd from code
The standalone explorer has a read-only proxy at `/api/lcd/...` that serves its own pages, and it answers according to the network cookie of the browser. It is not a public API: it can change, is not rate-planned for programmatic use and returns the network the cookie names. For scripts, services and wallets use the public REST endpoints instead: `https://api.qore.host` (mainnet) and `https://api-testnet.qore.host` (testnet). See [REST & gRPC endpoints](/api-reference/rest-grpc-endpoints).
:::

:::note The standalone explorer does not apply the Dashboard's PQC labelling rules yet
The rules in [Innovations](#innovations) (a post-quantum label only after chain verification, and the "Authorised by a PQC window" card for EVM transactions) are live in the Dashboard Explorer. The standalone explorer at explore.qore.network has not been updated for them: its transaction page shows a hybrid-signature marker that does not yet distinguish a failed transaction, and it labels EVM transactions with its older wording. Treat the Dashboard Explorer's labels as the reference.
:::

## How to access {#how-to-access}

- **Dashboard Explorer:** [dashboard.qorechain.io/explorer](https://dashboard.qorechain.io/explorer). Choose the network in the header. The **overview** on mainnet needs sign-in and the [one-time acknowledgement](/dashboard/overview#risk-acknowledgement); the overview on testnet and **all detail pages** (transaction, block, address, validators) on both networks open without an account.
- **Standalone explorer:** [explore.qore.network](https://explore.qore.network). No account, no wallet. Use its header toggle for testnet.
- **Cost:** free. No wallet connection is needed to read anything.

## Where it is published {#where-published}

| Surface | Address | Networks | Account |
| --- | --- | --- | --- |
| Dashboard Explorer | `dashboard.qorechain.io/explorer` (`/explorer/tx/<hash>`, `/explorer/block/<height>`, `/explorer/address/<address>`, `/explorer/validators`) | Mainnet and testnet, header switch | Overview on mainnet only |
| Standalone explorer | `explore.qore.network` | Mainnet (default) and testnet toggle | None |
| Chain data | `api.qore.host`, `api-testnet.qore.host` (REST), `rpc.qore.host`, `rpc-testnet.qore.host` (RPC) | Mainnet and testnet | None |

## Limits and known issues {#limits}

- **A `0x` address typed into the Dashboard search** lands on "Transaction Not Found". Use the `qor1...` form.
- **The PQC column** in the Dashboard validators table is always dimmed. A validator's real status is on its address page.
- **Not shown:** a per-transaction window-usage counter, post-quantum proofs for blocks, and a per-validator post-quantum flag in the validators table.
- **The standalone explorer** has not yet adopted the Dashboard's labelling rules (see above), and a `qorvaloper1...` search opens the validators list.
- **The standalone explorer's /api/lcd** is for the site itself, not for programs.
- **Network follows the header** on the Dashboard Explorer: a hash from the other network shows "not found".
