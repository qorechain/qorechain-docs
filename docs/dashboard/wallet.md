---
slug: /dashboard/wallet
title: Wallet
sidebar_label: Wallet
sidebar_position: 3
---

# Wallet

The **Wallet** page is where you view your balance and transaction history, receive QOR, and (on mainnet) compose sends and staking actions. It is for anyone holding QOR who wants one place to see an account on all three rails. How it works depends on the network:

- **Mainnet is non-custodial.** The Dashboard does not hold mainnet keys. You connect your own wallet (**QoreX**, **Keplr** or **MetaMask**), and the page reads your real balance and history from the chain. Sends and staking on the Native rail are composed on the page and signed in **QoreX**, because QoreChain accounts sign with a post-quantum hybrid signature that QoreX produces. Keplr connects to view and receive. MetaMask connects on the EVM rail; sending there needs a registered post-quantum key and an open EVM authorisation window, opened from QoreX (see [Sending with MetaMask](#send-metamask)).
- **Testnet is custodial.** The Dashboard creates and holds test wallets for your account, so you can send and receive test QOR with no install. There is no staking screen for testnet wallets.

## Innovations {#innovations}

- **One account, three encodings.** The page derives the `qor1...`, `0x...` and SVM base58 forms of the same account and reads the balance and history once, through `qor1...`. History rows carry a Native, EVM or SVM badge.
- **The Dashboard never signs on mainnet.** For a send, delegate, undelegate or claim it passes QoreX only the parameters and the network, never a prepared transaction. QoreX rebuilds the transaction, shows it in full, signs it with the ML-DSA-87 hybrid signature and broadcasts it. The Dashboard learns only the transaction hash.
- **@handle pinning.** A resolved handle's address is remembered in this browser only after you confirm it. If the handle later resolves to a different address, the flow stops and shows both full addresses.
- **Fee check before staking.** The page reads spendable QOR (vesting excluded) and the account's ML-DSA-87 key status from the chain, and keeps Submit disabled if the fee cannot be paid.
- **The test-address warning sits where you copy.** "Test address, never send real QOR here." appears next to the address, in My Wallets and on Receive, because testnet and mainnet addresses look identical.
- **Recovery-phrase export with a check.** On testnet, revealing a phrase needs a fresh sign-in, the 24 words show for 60 seconds, and the backup counts as confirmed only after you type words 3, 5 and 9.

## How to use {#how-to-use}

### One account, three encodings {#one-account-three-encodings}

A QoreChain account is a single identity written three ways, one per execution rail:

| Rail | Encoding | Looks like |
| --- | --- | --- |
| **Native QOR** | bech32 | `qor1...` |
| **EVM** | hex | `0x...` |
| **SVM** | base58 | e.g. `5Gv7...` |

All three point to the **same account and the same balance**. Funds received on any rail land in one balance, and the Dashboard indexes balance and history through the `qor1` encoding, so activity from every rail shows up together.

### Use the Wallet on mainnet {#mainnet}

Prerequisites: signed in, header on **Mainnet**, the [one-time acknowledgement](/dashboard/overview#risk-acknowledgement) accepted, and for sending or staking the QoreX app or extension.

1. Open **Wallet**. If no wallet is connected yet, a "Connect your wallet" card shows the **QoreX wallet** card with **Connect with QoreX**, and below it, under "or connect another wallet", **Connect Keplr** and **Connect MetaMask**.
2. Connect a wallet (steps below). Phantom cannot be connected here; see [Linked signers](#linked-signers).
3. The page loads your real balance and history from the chain.

Once connected, the page has six tabs: **Wallet**, **Send from QoreX**, **Stake / Delegate**, **Rewards**, **Details** and **Connect Wallets**.

- **Wallet:** a **Viewing** row of wallet chips (only when more than one wallet is attached), **Total Balance**, **Receive**, and **Assets & Activity** with the latest 10 transactions.
- **Send from QoreX, Stake / Delegate, Rewards:** these work through QoreX even if Keplr or MetaMask is also connected. Staking steps are on [Staking & Validators](/dashboard/staking-and-validators).
- **Details:** your Native, EVM and SVM addresses, and **Linked addresses** (rename, make default, controllable in QoreX or watch-only).
- **Connect Wallets:** connected wallets (click one to view it, X to detach it), unlinked QoreX accounts with **Link this account**, **+ QoreX**, **+ Keplr**, **+ MetaMask**, and the [Add QoreChain to your wallet](#add-network) panel.

If your wallet does not have QoreChain configured yet, add it first, see [Add QoreChain to your wallet](#add-network).

#### Connect with QoreX, browser extension {#connect-qorex-extension}

1. On the Wallet page, find the **QoreX wallet** card and select **Connect with QoreX**.
2. Because the QoreX extension is detected, the Dashboard asks how you want to connect. Select **Browser extension**.
3. The extension opens an approval popup showing `dashboard.qorechain.io` as the requesting site.
4. Approve it. This signs a one-time proof that you own your `qor1...` address; no funds move and no other permission is granted.
5. The popup closes and the Dashboard shows **Connected: qor1...**. The choice is saved, so the next connect on this browser reuses it without asking. A **Use a different method** link appears only while a pairing is pending.

You can link more than one QoreX address to the same Dashboard account (for example one from a Firefox extension and one from Chrome, or a phone and a laptop). Select **Add another wallet** to repeat the flow; each linked address can be given a label and one is marked default for sending, both from the **Connect Wallets** tab.

**Switching between wallets on the Wallet tab.** With more than one wallet attached, the **Viewing** row of chips lets you switch whose balance and history you see without leaving the tab. The row is hidden when only one wallet is attached.

**Accounts in your QoreX extension that are not linked yet.** One recovery phrase can derive several accounts, and creating one in QoreX does not tell the Dashboard. When the extension can list its accounts, the **Wallet**, **Details** and **Connect Wallets** tabs show a card such as "2 accounts in your QoreX extension are not linked here", with each account's balance (and how much is staked, which cannot be sent). Select **Link this account** to pair it; linking grants no control over your keys. If your QoreX build cannot choose which account to prove, only the active account can be linked from here.

#### Connect with QoreX, mobile app {#connect-qorex-app}

1. On the Wallet page, select **Connect with QoreX** on the **QoreX wallet** card.
2. If the chooser appears, select **QoreX app** (with no extension detected, the Dashboard goes straight to this flow).
3. The Dashboard shows a QR code and **Open QoreX**, and polls ("Waiting for approval in QoreX...").
4. On your phone, scan the QR code in QoreX, or tap **Open QoreX** if you are browsing on the same phone (it opens the app through its `qorex://connect` link).
5. QoreX shows the pairing request with the Dashboard's origin. Approve with Face ID, Touch ID or PIN.
6. Within a couple of seconds the Dashboard shows **Connected: qor1...**.

#### Connect with Keplr {#connect-keplr}

Keplr connects to view your Native-rail balance and history and to receive. Sending and staking use QoreX.

1. On the Wallet page, select **Connect Keplr**.
2. If QoreChain is not configured in Keplr, the Dashboard triggers Keplr's `suggestChain` prompt. Review the chain ID and endpoints and select **Approve**.
3. Pick the account and approve the connection.
4. The Dashboard reads your `qor1...` address and loads your balance and history.

Phantom cannot be connected as a wallet on the mainnet Wallet page. Phantom addresses linked earlier still appear in **Connected wallets**; for linking a Phantom key as a signer, see [Linked signers (Phantom)](#linked-signers).

#### Connect with MetaMask {#connect-metamask}

1. On the Wallet page, select **Connect MetaMask**.
2. If the QoreChain EVM network is not yet added, MetaMask shows its **Add network** prompt (EIP-3085) with the chain ID, RPC URL and symbol filled in. Select **Approve**, then **Switch network**.
3. Select the account and **Connect**.
4. The Dashboard reads your `0x...` address and loads your balance and history.

### Send on mainnet {#send-mainnet}

Every send is composed on the Dashboard but finalized in your own wallet. On the **Native rail** that wallet is always **QoreX**. On the **EVM rail**, MetaMask signs, provided the account already has a post-quantum key and an open EVM window (see [Sending with MetaMask](#send-metamask)).

:::caution Real funds, irreversible transfers
Mainnet transactions are irreversible. Double-check the recipient before approving.
:::

:::note Vesting balances
If part of your balance is still vesting, it counts toward what you can delegate, but it cannot pay a transaction fee. You need separately spendable QOR for that, including to register a post-quantum key. A wallet funded with only its vesting amount can delegate but cannot send.
:::

#### Send with QoreX, step by step

1. In the **Send from QoreX** card, optionally choose **Send from** (when you linked more than one QoreX wallet), then enter the recipient (a `qor1...` address or an `@handle`), the **Amount (QOR)** and an optional **Memo**.
2. Select **Continue in QoreX**.
3. Approve, either:
   - **Browser extension:** select **Approve in browser extension**. The extension popup shows the transfer decoded in full (recipient and amount). Approve with your extension's own unlock. The extension signs with the hybrid post-quantum signature and broadcasts directly to the chain.
   - **Mobile app:** scan the QR code with QoreX, or select **Open in QoreX** (a `qorex://tx` request) on the same phone. QoreX decodes the request, shows recipient and amount, and you approve with your biometric. QoreX signs and broadcasts.
4. The page shows "Transfer confirmed" with the transaction hash (open it in the [Explorer](/dashboard/explorer)), then **New transfer**. In the app path the Dashboard polls for the result.

**Minimal example:** Connect with QoreX (app, scan the QR code), then Send from QoreX with a `qor1...` recipient and amount 1, select **Continue in QoreX** and approve in QoreX.

#### Sending to an @handle

The recipient field also accepts an `@handle`. What happens next depends on whether you have paid that handle from this browser before:

- **First time:** the resolved address is shown in full with "First time sending to @handle from this browser. Check the address before you continue:", and you must confirm it before it is used. The address is pinned only after you confirm.
- **Same address as before:** it passes with a light confirmation.
- **A different address than before:** the flow stops. Both the previous and the new address are shown in full, with an explicit warning that the address changed, and a secondary-styled button to proceed anyway.

The pin lives only in your browser, so a different computer or cleared browser shows "first time" again. Handles are 3 to 20 characters (`a-z`, `0-9`, `_`) and belong to one address. If handle lookup is temporarily unavailable, the field says so and you can still send to a `qor1...` address.

#### Send with MetaMask {#send-metamask}

:::caution Since chain v3.2.0, MetaMask alone cannot send on mainnet
The EVM lane admits a transaction only from an account that holds a registered post-quantum key and has an **open EVM authorisation window**: a time-, count- and value-bounded permission opened with a message carrying a hybrid ML-DSA-87 signature (FIPS 204). MetaMask cannot produce that message. Without a window the chain refuses the transaction (typical errors: no window, window exhausted, no post-quantum key).
:::

1. In **QoreX**, register the account's post-quantum key if it has none (your first QoreX transfer from that account does it), then open an EVM authorisation window, see [EVM access window](/qorex/security-and-recovery#evm-window). This is for the **Ethereum-style (coin 60) account** that shares MetaMask's key: add it in QoreX with **Add an Ethereum account (coin 60)** using the same recovery phrase ([how](/qorex/getting-started#restore-dashboard)). No MetaMask key can send from an ordinary coin-118 `qor1...` account.
2. A window is bounded by blocks (at most 17,280, about 15 hours on mainnet), by transaction count (at most 1,000) and by a QOR spending cap that counts each amount **plus** its maximum fee. Keep the limits small: while a window is open, MetaMask transactions move QOR without a post-quantum signature. Opening a new window replaces the previous one and advances the account's nonce, so open it **before** you send from MetaMask (a transaction prepared earlier fails with "nonce too low"). Since v3.2.3 the chain also supports narrower, scoped windows; QoreX has no screen for them yet.
3. Open MetaMask and confirm it is set to the QoreChain EVM network.
4. Select **Send** inside MetaMask, enter the `0x...` recipient and amount, review gas and confirm.
5. Back on the Dashboard, the transaction appears in your history once it is on chain (refresh if needed).

Each transaction uses up part of the window; when its time, count or value limit is reached, open a new one in QoreX, and close the window when you are done.

### Receive {#receive-mainnet}

1. Select **Receive**.
2. Pick a rail with the selector: **Native QOR**, **EVM** or **SVM**.
3. The modal shows your address in that encoding with a QR code and a copy button.
4. On the Native rail only, **Payment Request Options** (amount, memo) build a `qorechain:` link you can copy.

Whichever rail the sender uses, the funds arrive in the same account.

### Read your transaction history {#history}

On mainnet the **Assets & Activity** list shows the **latest 10** transactions. Each row has:

- a **rail badge** (Native, EVM or SVM);
- **Sent** or **Received** for ordinary transfers, and a descriptive label for other activity (for example *PQC key registration* or a contract action);
- the amount, time, a **Confirmed** or **Failed** status, and a hash you can open in the [Explorer](/dashboard/explorer). For older activity, open your address in the Explorer.

### Use the Wallet on testnet {#testnet}

On testnet (`qorechain-diana`) the Dashboard manages test wallets for you. Testnet has no QoreX connect and no staking screen.

**First visit:** create a wallet, or import a 24-word phrase.

**Main card:** the wallet label, the address with a copy button, **Total Balance**, **Send**, **Receive** and **My Wallets**, a last-updated indicator with refresh, and **Assets & Activity** with a **Transaction history** tab and a **Tokens** tab.

The **Tokens** tab lists only tokens issued through Dashboard deployments. The fest test tokens from the [Faucet](/dashboard/faucet#fest-tokens) never appear there; check them with a bank balance query or the [Explorer](/dashboard/explorer).

:::caution Testnet addresses look exactly like mainnet addresses
Testnet and mainnet use the same `qor1...` format, so a testnet address can be pasted into a withdrawal form or another wallet without any warning, and real QOR sent to it lands on **mainnet**, at that address, where this testnet page cannot show it. Never send real QOR to a testnet address. The Dashboard repeats the warning beside the address on the Wallet page, in **My Wallets** and on **Receive**. If you already sent real QOR to a testnet address, contact support and do not try to move it yourself.
:::

#### Send QOR (testnet)

1. Select **Send**.
2. Pick an **Asset** (QOR, or a token issued through the Dashboard).
3. Enter the **Recipient Address** (saved contacts and recent addresses are suggested as you type) and the **Amount** (or **MAX**), plus an optional **Memo**.
4. Select **Review Transaction**, check the details and estimated fee, then **Confirm & Send**.
5. You get a confirmation with the hash, and "Save this address?" is offered so the recipient is kept as a contact.

**Minimal example:** switch to Testnet, create a wallet, claim from the [Faucet](/dashboard/faucet), then send 1 QOR to another address.

#### Receive QOR (testnet)

1. Select **Receive**.
2. Share the address or QR code, or copy the address.
3. Optionally fill **Payment Request Options** (amount, memo) to generate a payment link; use **Copy Link** or **Save Image**.

#### Manage your test wallets

**My Wallets** opens your address list: switch between wallets, create, import or remove one. The active wallet is the one used for signed actions on testnet across the Dashboard.

#### Back up or export a test wallet's recovery phrase {#reveal-recovery-phrase}

On testnet the Dashboard manages your wallets, but you can export a wallet's 24-word recovery phrase to import it into a self-custody wallet such as QoreX.

1. On the testnet **Wallet** page, find the **Recovery phrase** card. It lists your Dashboard-managed wallets with their **mainnet** balance (funded wallets first), so you can pick the one that holds your tokens.
2. Select **Reveal**, read the warning ("Reveal the phrase for ...?") and select **Continue**.
3. Sign in again when asked (a fresh password check is required; the Dashboard never sees your password). You return to the wallet automatically.
4. The 24 words show for 60 seconds, with a **Copy phrase** button. Write them down and keep them offline. The countdown pauses while you tick the confirmation box or type in the check fields.
5. Tick **I have written down my recovery phrase and stored it somewhere safe**, type words **3**, **5** and **9** (marked *Required*), and select **Confirm backup**. You see "Recovery phrase saved".
6. If you leave with **Hide without confirming** (or the timer runs out), the card shows "Backup not confirmed" and offers **Reveal again and confirm**.

Anyone with these 24 words controls the wallet. QoreChain can never recover or reset them for you, and support will never ask for them.

### Add QoreChain to your wallet {#add-network}

The **Add QoreChain to your wallet** panel (on mainnet it sits on the **Connect Wallets** tab and below the connect buttons until a wallet is connected; on testnet at the bottom of the page) has four cards:

| Card | What it gives you | Buttons |
| --- | --- | --- |
| **Native (Cosmos) wallets** | RPC and REST endpoints and the chain ID, each with a copy button. | **Add to Keplr**, **Add to Cosmostation** (the label follows the detected wallet) |
| **EVM wallets** | EIP-3085 network parameters. | **Add to EVM wallet** (or **Add to MetaMask / Rabby**, following the detected wallets) |
| **SVM wallets** | The SVM RPC URL for custom-RPC settings. | **Copy SVM RPC URL** |
| **Mobile wallets (WalletConnect)** | A WalletConnect v2 pairing. | **Create pairing QR** |

1. Find the panel and pick the card that matches your wallet's rail.
2. Select the add button, or copy the endpoints and chain ID into your wallet's add-network form.
3. Approve the new network in your wallet.

The public endpoints are `rpc.qore.host` (Native RPC), `api.qore.host` (REST), `evm.qore.host` (EVM JSON-RPC) and `svm.qore.host` (SVM RPC), with `*-testnet` variants (for example `rpc-testnet.qore.host`). Chain IDs: mainnet `qorechain-vladi` (EVM chain ID `9801`), testnet `qorechain-diana` (EVM chain ID `9800`).

### Linked signers (Phantom) {#linked-signers}

The **SVM wallets** card also lets you link a Phantom key to your account as a **linked signer**: a time-bounded (30-day), revocable authenticator, not a separate primary wallet. Select **Connect Phantom**, then **Register authenticator**. The registration must be signed by **Keplr** (the Dashboard needs Keplr connected for this), and Phantom never becomes its own identity.

:::caution Registration availability differs by network
The chain's smart-account and linked-wallet features are enabled on the testnet and switched off on mainnet (`GET /qorechain/abstractaccount/v1/config` returns `enabled: true` on testnet and `enabled: false` on mainnet, checked 27 October 2026). On mainnet the chain refuses new linked-signer registrations; treat the card as a preview there.
:::

:::caution A linked signer is real authority over the account
The permission you grant decides which lane the key may act on, not how much it can move, and a registration stays valid for 30 days. Link only a key you trust as much as the account itself, and revoke it when you no longer need it.
:::

For the permission and spending-limit model, see [Linked signers & spending limits](/qorex/security-and-recovery#linked-signers) in the QoreX docs.

## How to access {#how-to-access}

- **URL:** [dashboard.qorechain.io/wallet](https://dashboard.qorechain.io/wallet). Sign-in is required: signed out, the page redirects to sign-in.
- **Network:** the header switch decides which view you get (mainnet non-custodial, testnet custodial). On mainnet accept the one-time acknowledgement first.
- **Wallets:** none needed on testnet. On mainnet use QoreX (app or extension) for sending and staking; Keplr or MetaMask to view and receive.
- **Costs:** none from the Dashboard. On-chain transactions pay the network fee (floor 0.1 uqor per gas).
- **Funds:** testnet QOR from the [Faucet](/dashboard/faucet). Mainnet QOR must already be in your account.

## Where it is published {#where-published}

| Surface | Address | Networks | Notes |
| --- | --- | --- | --- |
| Wallet page | `dashboard.qorechain.io/wallet` | Mainnet (non-custodial) and testnet (custodial) | Sign-in required |
| QoreX connect and send | QoreX app and extension (see [QoreX](/qorex/overview)) | Mainnet only | The Dashboard's QoreX flows are fixed to mainnet |
| Add-network panel | On the Wallet page | Both | Also on the [Explorer](/dashboard/explorer) overview |

## Limits and known issues {#limits}

- **Testnet has no staking UI and no QoreX connect.** Staking and the Rewards tab are mainnet only.
- **Mainnet history is the latest 10 transactions.** Open the address in the Explorer for more.
- **Keplr and MetaMask:** Keplr can view and receive; MetaMask can view and receive, and sends from inside MetaMask once an EVM window is open. Neither sends or stakes on the Native rail from the Dashboard.
- **Phantom** cannot be connected; earlier linked Phantom addresses are still listed.
- **Linked-signer registration** works on testnet and is off on mainnet; it needs Keplr to sign.
- **Not on the Dashboard:** redelegation (do it in QoreX), a time-locked staking screen, and a token list on mainnet.
- **The Tokens tab on testnet** shows only Dashboard-issued tokens, not the fest tokens.

## Related

- [Token Operations](/user-guide/token-operations) - concepts behind QOR transfers and denominations.
- [Staking & Validators](/dashboard/staking-and-validators) - delegate, unbond and claim from the Wallet page.
- [Trade](/dashboard/trade) - the test-token swap screen.
