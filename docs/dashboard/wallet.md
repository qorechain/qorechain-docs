---
slug: /dashboard/wallet
title: Wallet
sidebar_label: Wallet
sidebar_position: 3
---

# Wallet

The **Wallet** page is where you view your balance and transaction history, receive QOR, and send it. How the page works depends on the network:

- **Mainnet — non-custodial.** The Dashboard does not hold mainnet keys. You connect your own wallet — **QoreX** (the official QoreChain wallet, extension or app), **Keplr**, or **MetaMask** — your real balance and history are read directly from the chain, and you can receive funds on any rail. Sending and staking on the **Native rail require QoreX**: QoreChain accounts sign with a post-quantum hybrid signature, and QoreX is the wallet that produces it, so the Dashboard's Send and Stake tabs work through QoreX regardless of which other wallet you also have connected. Keplr can still be connected to view your Native-rail (`qor1...`) balance and to receive funds on it. **MetaMask** connects on the **EVM rail** (`0x...`) and signs EVM transactions itself, but since chain v3.2.0 the EVM lane admits a transaction only from an account that has a registered post-quantum key **and** an open EVM authorisation window. MetaMask cannot register that key or open a window; QoreX can. See [Sending with MetaMask](#send-metamask).
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
3. On the connect screen pick a wallet — **Connect with QoreX** (recommended, the official QoreChain wallet — required for sending and staking on the Native rail), **Connect Keplr** (to view/receive on the Native rail), or **Connect MetaMask** (to connect and receive on the EVM rail; sending needs an open EVM window, see [Sending with MetaMask](#send-metamask)). See the click-by-click steps for each below. Phantom cannot be connected as a wallet here; see the note under [Connect with Keplr](#connect-keplr).
4. The page loads your real balance and transaction history from the chain.

Once connected, the Wallet page organizes everything into six tabs: **Wallet** (balance and account summary), **Send from QoreX**, **Stake / Delegate**, **Rewards**, **Details** (your `qor1...` / `0x...` / SVM addresses), and **Connect Wallets** (every wallet you've attached, and where you connect more). The Send, Stake, and Rewards tabs work through QoreX — that's true even if you also have Keplr or MetaMask connected, because Native-rail transactions need the post-quantum hybrid signature QoreX produces.

If your wallet does not have QoreChain configured yet, add it first — see [Add QoreChain to your wallet](#add-network).

### Connect with QoreX — browser extension {#connect-qorex-extension}

1. On the Wallet page, find the **QoreX wallet** card and select **Connect with QoreX**.
2. Because the QoreX extension is detected in this browser, the Dashboard asks how you want to connect. Select **Browser extension**.
3. The QoreX extension opens its own approval popup, showing `dashboard.qorechain.io` as the site requesting the connection.
4. Review the request in the popup and approve it — this signs a one-time proof that you own your `qor1...` address; no funds move and no other permission is granted.
5. The popup closes and the Dashboard shows **Connected: qor1...** on the QoreX card, with your address unlocking the rest of the Wallet page. The extension/app choice is remembered, so the next time you select **Connect with QoreX** on this browser it reconnects the same way without asking — use **Use a different method** on the connect card if you ever want to switch.

You can link more than one QoreX address to the same Dashboard account — for example one from a Firefox extension and one from Chrome, or a phone and a laptop. Select **Add another wallet** to repeat the flow with a second address; each linked address can be given its own label and one is marked default for sending, both from the **Connect Wallets** tab.

**Switching between wallets on the Wallet tab.** Once more than one wallet is attached — QoreX and MetaMask, or two QoreX addresses — a row of wallet chips introduced by **Viewing** appears at the top of the **Wallet** tab itself, one per attached wallet, with the active one marked. Click a chip to switch which wallet's balance and history you're looking at, without leaving the tab or going to **Connect Wallets**. The row is hidden when only one wallet is attached, since a picker would have nothing to do.

**Accounts in your QoreX extension that are not linked yet.** One recovery phrase can derive several accounts, and creating one in QoreX does not tell the Dashboard about it — linking is a separate, signed step. When the QoreX extension can list its accounts, the **Wallet**, **Details** and **Connect Wallets** tabs show a card such as "2 accounts in your QoreX extension are not linked here", with each account's balance (and how much of it is staked, which cannot be sent). Select **Link this account** to pair it; linking lets the Dashboard show its balance and history and grants no control over your keys. If your QoreX build cannot choose which account to prove, only the active account can be linked from here — the card tells you to switch to the account in QoreX first.

On the **Details** tab, **Linked addresses** lists every address attached to your account with its wallet of origin; you can rename an address, mark one as the default for sending, and see whether it is controllable in QoreX or watch-only (padlock).

### Connect with QoreX — mobile app {#connect-qorex-app}

1. On the Wallet page, find the **QoreX wallet** card and select **Connect with QoreX**.
2. If the extension chooser appears, select **QoreX app** (if no extension is detected in this browser, the Dashboard goes straight to this flow).
3. The Dashboard shows a QR code and an **Open QoreX** link.
4. On your phone, open the QoreX app and scan the QR code with it — or, if you're browsing on the same phone, tap **Open QoreX** to launch the app directly via its `qorex://connect` link.
5. QoreX shows the pairing request with the Dashboard's origin. Review it and approve with your biometric confirmation (Face ID / Touch ID / PIN).
6. The Dashboard is polling for the approval in the background; within a couple of seconds it shows **Connected: qor1...** on the QoreX card, and your address unlocks the rest of the Wallet page.

### Connect with Keplr {#connect-keplr}

Keplr connects to view your Native-rail balance, history, and receive address. Sending and staking on the Native rail use QoreX (see below) — QoreChain accounts sign with a post-quantum hybrid signature, which is why the Dashboard's Send and Stake tabs work through QoreX rather than through whichever wallet you connected here.

1. On the Wallet page, select **Connect Keplr**.
2. If QoreChain is not yet configured in Keplr, the Dashboard triggers Keplr's `suggestChain` prompt — review the network details (chain ID, RPC/REST endpoints) in the Keplr popup and select **Approve** to add it.
3. Keplr then asks you to select the account to connect and to approve the connection — select **Approve**.
4. The Dashboard reads your `qor1...` address and loads your balance and history.

Phantom cannot be connected as a wallet on the mainnet Wallet page. Phantom addresses that were linked earlier still appear in **Connected wallets**; for linking a Phantom key as a signer, see [Linked signers (Phantom)](#linked-signers).

### Connect with MetaMask {#connect-metamask}

1. On the Wallet page, select **Connect MetaMask**.
2. If the QoreChain EVM network is not yet added, MetaMask shows its **Add network** prompt (EIP-3085) with the chain ID, RPC URL, and currency symbol pre-filled — review it and select **Approve**, then **Switch network**.
3. MetaMask asks which account to connect — select the account and confirm **Connect**.
4. The Dashboard reads your `0x...` address and loads your balance and history.

### Send on mainnet {#send-mainnet}

Because the Dashboard never holds your mainnet keys, every send is composed on the Dashboard but finalized in your own wallet. On the **Native rail**, that wallet is always **QoreX** — the Send and Stake tabs work through it regardless of which other wallet you also have connected, because QoreChain accounts sign with a post-quantum hybrid signature. On the **EVM rail**, MetaMask signs the transaction, provided the account already has a post-quantum key and an open EVM window (see [Sending with MetaMask](#send-metamask)).

:::caution Real funds, irreversible transfers
Mainnet transactions are irreversible. Always double-check the recipient address before approving.
:::

:::note Vesting balances
If part of your balance is still vesting, it counts toward what you can delegate for staking, but it cannot pay a transaction fee — you need separately-spendable QOR for that, including to register a PQC key. A wallet funded with only its vesting amount can delegate but can't send.
:::

#### Send with QoreX — browser extension

1. On the Wallet page, in the **Send from QoreX** card, enter the recipient (a `qor1...` address or an `@handle`), the amount in QOR, and an optional memo. If you have linked more than one QoreX wallet, choose which one pays in **Send from**.
2. Select **Continue in QoreX**.
3. The Dashboard shows an **Approve in browser extension** button — select it.
4. The QoreX extension opens its approval popup with the transfer decoded in full — recipient and amount. Review it and approve using your extension's own security (biometric or password unlock).
5. The extension signs the transfer with a hybrid PQC signature and broadcasts it directly to the chain — the Dashboard only ever learns the resulting transaction hash.
6. The Wallet page shows **Transfer confirmed** with the transaction hash, which you can open in the [Explorer](/dashboard/explorer).

#### Send with QoreX — mobile app

1. On the Wallet page, in the **Send from QoreX** card, enter the recipient (a `qor1...` address or an `@handle`), the amount in QOR, and an optional memo. If you have linked more than one QoreX wallet, choose which one pays in **Send from**.
2. Select **Continue in QoreX**.
3. The Dashboard shows a QR code and an **Open in QoreX** link carrying a `qorex://tx` request.
4. Scan the QR code with the QoreX app, or tap **Open in QoreX** if you're on the same phone.
5. QoreX decodes the request and shows the recipient and amount in full. Review it and approve with your biometric confirmation.
6. QoreX signs the transfer with a hybrid PQC signature and broadcasts it.
7. The Dashboard polls for the result and shows **Transfer confirmed** with the transaction hash once it lands on-chain, which you can open in the [Explorer](/dashboard/explorer).

#### Sending to an @handle

The recipient field on the **Send from QoreX** card also accepts an `@handle` instead of a `qor1...` address. What happens next depends on whether you've paid that handle from this browser before:

- **First time**: the resolved address is shown in full with "First time sending to @handle from this browser. Check the address before you continue:", and you must select **This address is right — continue** before it can be used — the address is only remembered (pinned) after you've confirmed it, not the moment it resolves.
- **Same address as before**: it passes with a light confirmation — no re-typing needed.
- **A different address than before**: the flow stops hard. Both the previous and the new address are shown in full — never truncated, since truncation hides exactly the middle characters an attacker would try to make look similar — with an explicit warning that the address changed, and a deliberately secondary-styled **I trust this change — continue** button to proceed anyway.

This pin is stored only in your own browser, not on any server, so a different computer or a cleared browser shows "first time" again — that's intentional. Handles are 3–20 characters (`a-z`, `0-9`, `_`) and belong to a specific address, so someone with several addresses can use a different handle on each. If handle lookup is temporarily unavailable, the field says so and you can still send to a `qor1...` address.

#### Send with MetaMask {#send-metamask}

:::caution Since chain v3.2.0, MetaMask alone cannot send on mainnet
The EVM lane admits a transaction only from an account that holds a registered post-quantum key and has an **open EVM authorisation window**: a time-, count- and value-bounded permission that the account opens with a post-quantum-signed message. MetaMask cannot produce that message. If you send without a window the chain refuses the transaction (typical errors: no window, window exhausted, no post-quantum key).
:::

1. In **QoreX** (the account's own wallet), register the account's post-quantum key if it has none (your first QoreX transfer from that account does it), then open an EVM authorisation window — see [EVM access window](/qorex/security-and-recovery#evm-window). This is for the **Ethereum-style (coin 60) account** that shares MetaMask's key — add it in QoreX with **Add an Ethereum account (coin 60)** using the same recovery phrase ([how](/qorex/getting-started#restore-dashboard)); no MetaMask key can send from an ordinary coin-118 `qor1…` account. A window is bounded by blocks (at most 17,280, about 15 hours on mainnet), by transaction count (at most 1,000) and by a QOR spending cap that counts each amount **plus** its maximum fee. Choose limits you are comfortable with and keep them small: while a window is open, MetaMask transactions move QOR without a post-quantum signature. Opening a new window replaces the previous one, and it advances the account's nonce, so open it **before** you send from MetaMask (a transaction prepared earlier fails with "nonce too low"). Since v3.2.3 the chain also supports narrower, scoped windows; QoreX does not offer a screen for them yet.
2. Open MetaMask and confirm it is set to the QoreChain EVM network.
3. Select **Send** inside MetaMask, enter the recipient's `0x...` address and the amount, review the gas fee, and confirm.
4. Back on the Dashboard Wallet page, the transaction appears in your history once it is on-chain (refresh if it hasn't shown up yet).

Each transaction uses up part of the window; when its time, transaction count or value limit is reached, open a new one in QoreX. Close the window from QoreX when you are done.

### Receive on a specific rail {#receive-mainnet}

1. Select **Receive**.
2. In the receive modal, pick a rail with the selector: **Native QOR**, **EVM**, or **SVM**.
3. The modal shows your address in that rail's encoding (`qor1...`, `0x...`, or base58) with a QR code and a copy button.
4. Copy the address, or let the sender scan the QR code.

Whichever rail the sender uses, the funds arrive in the same account — one account, three encodings, one balance.

### Read your transaction history {#history}

On mainnet, each row in your history shows:

- A **rail badge** — Native, EVM, or SVM — telling you which rail the transaction used.
- **Sent** or **Received** for ordinary transfers, and a descriptive type label for other activity (for example *PQC key registration* or a contract action).
- The amount, time, and a **Confirmed** / **Failed** status, with the transaction hash you can open in the [Explorer](/dashboard/explorer).

## Use the Wallet on testnet {#testnet}

On testnet (`qorechain-diana`) the Dashboard manages a test wallet for you, so you can test flows end to end without connecting anything.

### What the page shows

- Your wallet label and active address, in shortened form, with a one-click copy button.
- Your **total balance** in QOR.
- A security panel noting quantum-safe encryption and the connected network.
- A last-updated indicator with a refresh control.
- An **Assets & Activity** section with a **Transaction history** tab and a **Tokens** tab.

Use the refresh control any time to pull your current balance and latest activity from the chain.

:::caution Testnet addresses look exactly like mainnet addresses
Testnet and mainnet use the same `qor1...` format, so a testnet address can be pasted into an exchange withdrawal or another wallet without any warning — and real QOR sent to it lands on **mainnet**, at that address, where this testnet page cannot show it. Never send real QOR to a testnet address. The Dashboard repeats this warning beside the address on the Wallet page, in the **My Wallets** list, and on the **Receive** screen. For real QOR, switch to Mainnet and use the address shown there; if you have already sent real QOR to a testnet address, contact support — do not try to move it yourself.
:::

### Send QOR (testnet)

1. Select **Send**.
2. Enter the **Recipient Address** (`qor1...`).
3. Enter the **Amount** (or **MAX**) and an optional **Memo**.
4. Select **Review Transaction**, check the details and estimated network fee, then select **Confirm & Send**.

As you type a recipient, saved contacts and recent addresses are suggested to help you avoid mistakes. After the transfer is submitted, you receive a confirmation with the transaction hash, which you can open in the [Explorer](/dashboard/explorer).

### Receive QOR (testnet)

1. Select **Receive**.
2. Share your address or its QR code with the sender, or copy the address with one click.
3. Optionally enter a requested amount and memo to generate a payment link and a downloadable QR code.

### Manage your test wallets

Select **My Wallets** to open your address list. From there you can switch between wallets, create a new wallet, import an existing one, or remove a wallet you no longer need. The active wallet is the one used for sending, swapping, staking, and other signed actions across the Dashboard on testnet.

### Back up or export a test wallet's recovery phrase {#reveal-recovery-phrase}

On testnet the Dashboard manages your wallets for you, but you can export a wallet's 24-word recovery phrase to import it into a self-custody wallet such as QoreX.

1. On the testnet **Wallet** page, find the **Recovery phrase** card. It lists each of your Dashboard-managed wallets with its **mainnet** balance (funded wallets first), so you can pick the one that actually holds your tokens.
2. Select **Reveal** next to the wallet, read the warning ("Reveal the phrase for …?"), and select **Continue**.
3. You are sent to sign in again on the account's sign-in page (a fresh password check is required; the Dashboard never sees your password) and return to the wallet automatically.
4. The 24 words are shown for 60 seconds. Write them down and keep them offline. The countdown pauses while you tick the confirmation box or type in the check fields.
5. Tick **I have written down my recovery phrase and stored it somewhere safe**, type words **3**, **5** and **9** from your written copy (marked *Required*), and select **Confirm backup**. You see "Recovery phrase saved".
6. If you leave with **Hide without confirming** (or the timer runs out), the card shows "Backup not confirmed" — nothing records that you wrote the phrase down — and offers **Reveal again and confirm**.

Anyone with these 24 words controls the wallet. QoreChain can never recover or reset them for you, and support will never ask for them.

## Add QoreChain to your wallet {#add-network}

The **Add QoreChain to your wallet** panel on the Wallet page (on mainnet it sits on the **Connect Wallets** tab, and below the connect buttons until a wallet is connected; on testnet it is at the bottom of the page) shows four side-by-side cards — one per way of connecting — so you can add QoreChain to your own wallet in one click:

| Card | What it gives you |
| --- | --- |
| **Native (Cosmos) wallets** | RPC and REST endpoints plus the chain ID, each with a copy button — for Keplr and other Native-rail wallets. |
| **EVM wallets** | Ready-made EIP-3085 network parameters — one click adds QoreChain to MetaMask and other EVM wallets. |
| **SVM wallets** | The SVM RPC URL for SVM-compatible wallets and tools. |
| **Mobile wallets (WalletConnect)** | A WalletConnect v2 pairing QR for the mobile versions of compatible wallets. |

To add QoreChain:

1. Open the **Wallet** page and find **Add QoreChain to your wallet**.
2. Pick the card that matches your wallet's rail.
3. Select the add button (**Add to Keplr** / **Add to Cosmostation**, **Add to MetaMask** or your other EVM wallet, or the WalletConnect pairing), or copy the endpoints and chain ID into your wallet's add-network form (the SVM card gives the SVM RPC URL to paste into a custom-RPC setting).
4. Approve the new network in your wallet.

The public endpoints are `rpc.qore.host` (Native RPC), `api.qore.host` (REST), `evm.qore.host` (EVM JSON-RPC), and `svm.qore.host` (SVM RPC), with `*-testnet` variants (for example `rpc-testnet.qore.host`) for testnet. Chain IDs: mainnet `qorechain-vladi` (EVM chain ID `9801`), testnet `qorechain-diana` (EVM chain ID `9800`).

### Linked signers (Phantom) {#linked-signers}

The **SVM wallets** card also lets you link a Phantom key to your account as a **linked signer** — a time-bounded (30-day), revocable authenticator, not a separate primary wallet connection like QoreX, Keplr, or MetaMask. Select **Connect Phantom**, then **Register authenticator**; your existing wallet signs the registration, and Phantom never becomes its own identity.

:::caution Linked-signer registration is currently switched off on the chain
The chain's smart-account and linked-wallet features are implemented but switched off on mainnet and enabled on the testnet (`abstractaccount.enabled` is `false` on mainnet; check `GET /qorechain/abstractaccount/v1/config`), and the mainnet chain refuses new linked-signer registrations while that is the case. On mainnet, treat the card as a preview for now and do not expect a registration to succeed.
:::

:::caution A linked signer is real authority over the account
When the feature is enabled, the permission you grant decides which lane the key may act on, not how much it can move, and a registration stays valid for 30 days. Link only a Phantom key you trust as much as the account itself, and revoke it when you no longer need it.
:::

For the on-chain permission and spending-limit model, see [Linked signers & spending limits](/qorex/security-and-recovery#linked-signers) in the QoreX docs.

## Related

- [Token Operations](/user-guide/token-operations) — concepts behind QOR transfers and denominations.
- [Trade](/dashboard/trade) — swap tokens (currently test tokens).
