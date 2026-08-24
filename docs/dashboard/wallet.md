---
slug: /dashboard/wallet
title: Wallet
sidebar_label: Wallet
sidebar_position: 3
---

# Wallet

The **Wallet** page is where you view your balance and transaction history, receive QOR, and send it. How the page works depends on the network:

- **Mainnet — non-custodial.** The Dashboard does not hold mainnet keys. You connect your own wallet — **QoreX** (the official QoreChain wallet, extension or app), **Keplr**, or **MetaMask** — your real balance and history are read directly from the chain, and you can receive funds on any rail. Sending and staking on the **Native rail require QoreX**: QoreChain accounts sign with a post-quantum hybrid signature, and QoreX is the wallet that produces it, so the Dashboard's Send and Stake tabs work through QoreX regardless of which other wallet you also have connected. Keplr can still be connected to view your Native-rail (`qor1...`) balance and to receive funds on it. **MetaMask** signs and sends independently on the **EVM rail** (`0x...`), which uses a classical signature and is unaffected by this.
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
3. Select **Connect Wallet** and pick a wallet — **QoreX** (recommended, the official QoreChain wallet — required for sending and staking on the Native rail), **Keplr** (to view/receive on the Native rail), or **MetaMask** (to connect, send, and receive on the EVM rail). See the click-by-click steps for each below.
4. The page loads your real balance and transaction history from the chain.

Once connected, the Wallet page organizes everything into six tabs: **Wallet** (balance and account summary), **Send from QoreX**, **Stake / Delegate**, **Rewards**, **Details** (your `qor1...` / `0x...` / SVM addresses), and **Connect Wallets** (every wallet you've attached, and where you connect more). The Send, Stake, and Rewards tabs work through QoreX — that's true even if you also have Keplr or MetaMask connected, because Native-rail transactions need the post-quantum hybrid signature QoreX produces.

If your wallet does not have QoreChain configured yet, add it first — see [Add QoreChain to your wallet](#add-network).

### Connect with QoreX — browser extension {#connect-qorex-extension}

1. On the Wallet page, find the **QoreX wallet** card and select **Connect with QoreX**.
2. Because the QoreX extension (0.1.4 or later) is detected in this browser, the Dashboard asks how you want to connect. Select **Browser extension**.
3. The QoreX extension opens its own approval popup, showing `dashboard.qorechain.io` as the site requesting the connection.
4. Review the request in the popup and approve it — this signs a one-time proof that you own your `qor1...` address; no funds move and no other permission is granted.
5. The popup closes and the Dashboard shows **Connected: qor1...** on the QoreX card, with your address unlocking the rest of the Wallet page. The extension/app choice is remembered, so the next time you select **Connect with QoreX** on this browser it reconnects the same way without asking — use **Use a different method** on the connect card if you ever want to switch.

You can link more than one QoreX address to the same Dashboard account — for example one from a Firefox extension and one from Chrome, or a phone and a laptop. Select **Add another wallet** to repeat the flow with a second address; each linked address can be given its own label and one is marked default for sending, both from the **Connect Wallets** tab.

### Connect with QoreX — mobile app {#connect-qorex-app}

1. On the Wallet page, find the **QoreX wallet** card and select **Connect with QoreX**.
2. If the extension chooser appears, select **QoreX app** (if no extension is detected in this browser, the Dashboard goes straight to this flow).
3. The Dashboard shows a QR code and an **Open QoreX** link.
4. On your phone, open the QoreX app and scan the QR code with it — or, if you're browsing on the same phone, tap **Open QoreX** to launch the app directly via its `qorex://connect` link.
5. QoreX shows the pairing request with the Dashboard's origin. Review it and approve with your biometric confirmation (Face ID / Touch ID / PIN).
6. The Dashboard is polling for the approval in the background; within a couple of seconds it shows **Connected: qor1...** on the QoreX card, and your address unlocks the rest of the Wallet page.

### Connect with Keplr {#connect-keplr}

Keplr connects to view your Native-rail balance, history, and receive address. Sending and staking on the Native rail use QoreX (see below) — QoreChain accounts sign with a post-quantum hybrid signature, which is why the Dashboard's Send and Stake tabs work through QoreX rather than through whichever wallet you connected here.

1. On the Wallet page, select **Connect Wallet** and choose **Keplr**.
2. If QoreChain is not yet configured in Keplr, the Dashboard triggers Keplr's `suggestChain` prompt — review the network details (chain ID, RPC/REST endpoints) in the Keplr popup and select **Approve** to add it.
3. Keplr then asks you to select the account to connect and to approve the connection — select **Approve**.
4. The Dashboard reads your `qor1...` address and loads your balance and history.

### Connect with MetaMask {#connect-metamask}

1. On the Wallet page, select **Connect Wallet** and choose **MetaMask**.
2. If the QoreChain EVM network is not yet added, MetaMask shows its **Add network** prompt (EIP-3085) with the chain ID, RPC URL, and currency symbol pre-filled — review it and select **Approve**, then **Switch network**.
3. MetaMask asks which account to connect — select the account and confirm **Connect**.
4. The Dashboard reads your `0x...` address and loads your balance and history.

### Send on mainnet {#send-mainnet}

Because the Dashboard never holds your mainnet keys, every send is composed on the Dashboard but finalized in your own wallet. On the **Native rail**, that wallet is always **QoreX** — the Send and Stake tabs work through it regardless of which other wallet you also have connected, because QoreChain accounts sign with a post-quantum hybrid signature. On the **EVM rail**, MetaMask signs and sends independently.

:::caution Real funds, irreversible transfers
Mainnet transactions are irreversible. Always double-check the recipient address before approving.
:::

:::note Vesting balances
If part of your balance is still vesting, it counts toward what you can delegate for staking, but it cannot pay a transaction fee — you need separately-spendable QOR for that, including to register a PQC key. A wallet funded with only its vesting amount can delegate but can't send.
:::

#### Send with QoreX — browser extension

1. On the Wallet page, in the **Send from QoreX** card, enter the recipient (a `qor1...` address or an `@handle`), the amount in QOR, and an optional memo.
2. Select **Continue in QoreX**.
3. The Dashboard shows an **Approve in browser extension** button — select it.
4. The QoreX extension opens its approval popup with the transfer decoded in full — recipient and amount. Review it and approve using your extension's own security (biometric or password unlock).
5. The extension signs the transfer with a hybrid PQC signature and broadcasts it directly to the chain — the Dashboard only ever learns the resulting transaction hash.
6. The Wallet page shows **Transfer confirmed** with the transaction hash, which you can open in the [Explorer](/dashboard/explorer).

#### Send with QoreX — mobile app

1. On the Wallet page, in the **Send from QoreX** card, enter the recipient (a `qor1...` address or an `@handle`), the amount in QOR, and an optional memo.
2. Select **Continue in QoreX**.
3. The Dashboard shows a QR code and an **Open QoreX** link carrying a `qorex://tx` request.
4. Scan the QR code with the QoreX app, or tap **Open QoreX** if you're on the same phone.
5. QoreX decodes the request and shows the recipient and amount in full. Review it and approve with your biometric confirmation.
6. QoreX signs the transfer with a hybrid PQC signature and broadcasts it.
7. The Dashboard polls for the result and shows **Transfer confirmed** with the transaction hash once it lands on-chain, which you can open in the [Explorer](/dashboard/explorer).

#### Sending to an @handle

The recipient field on the **Send from QoreX** card also accepts an `@handle` instead of a `qor1...` address. What happens next depends on whether you've paid that handle from this browser before:

- **First time**: the resolved address is shown in full, and you must select **Confirm address** before it can be used — the address is only remembered (pinned) after you've confirmed it, not the moment it resolves.
- **Same address as before**: it passes with a light confirmation — no re-typing needed.
- **A different address than before**: the flow stops hard. Both the previous and the new address are shown in full — never truncated, since truncation hides exactly the middle characters an attacker would try to make look similar — with an explicit warning that the address changed, and a **deliberately secondary-styled** button to proceed anyway.

This pin is stored only in your own browser, not on any server, so a different computer or a cleared browser shows "first time" again — that's intentional. Handles are 3–20 characters (`a-z`, `0-9`, `_`) and belong to a specific address, so someone with several addresses can use a different handle on each.

#### Send with MetaMask

1. Open MetaMask and confirm it is set to the QoreChain EVM network.
2. Select **Send** inside MetaMask.
3. Enter the recipient's `0x...` address and the amount.
4. Review the gas fee and confirm to sign and broadcast.
5. Back on the Dashboard Wallet page, the transaction appears in your history once it is on-chain (refresh if it hasn't shown up yet).

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

### Linked signers (Phantom) {#linked-signers}

The **SVM** card also lets you link a Phantom key to your account as a **linked signer** — a delegated, revocable spending authenticator, not a separate primary wallet connection like QoreX, Keplr, or MetaMask. Your existing wallet signs the registration; Phantom never becomes its own identity. For the on-chain permission and spending-limit model behind it, see [Linked signers & spending limits](/qorex/security-and-recovery#linked-signers) in the QoreX docs.

## Related

- [Token Operations](/user-guide/token-operations) — concepts behind QOR transfers and denominations.
- [Trade](/dashboard/trade) — swap your tokens on the on-chain AMM.
- [Bridge](/dashboard/bridge) — move assets to and from other chains.
