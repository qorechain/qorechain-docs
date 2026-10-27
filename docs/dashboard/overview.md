---
slug: /dashboard/overview
title: Dashboard Overview & Getting Started
sidebar_label: Overview & Getting Started
sidebar_position: 1
---

# Dashboard Overview & Getting Started

The QoreChain Dashboard at **[dashboard.qorechain.io](https://dashboard.qorechain.io)** is the official web app for using QoreChain from a browser. One account and one network switch give you the explorer, a wallet view, a testnet faucet, a test-token swap screen, quests, AI contract tools, node and validator tooling, and a developer page. It is for anyone who wants to try the network without installing anything, and for builders who want quick checks while they develop. Nothing is installed: it runs in your browser.

This section is a user how-to: what each page does, how to open it and what its limits are.

## Innovations {#innovations}

- **One switch sets the network for every page.** The header **Testnet / Mainnet** control stores your choice in the browser and reloads the page, so the server and the browser read the same network. Mainnet is the default.
- **Mainnet is non-custodial.** The Dashboard never holds mainnet keys and never signs a mainnet transaction. It sends QoreX only the parameters of a send or a staking action, and QoreX rebuilds, shows, signs (ML-DSA-87 hybrid signature) and broadcasts the transaction. The Dashboard only learns the transaction hash.
- **Mainnet views need an account; testnet is open.** On mainnet, the home stats, Wallet, Trade and the Explorer overview check access on the server. A signed-out visitor sees "Sign in to view mainnet".
- **A real-funds acknowledgement, once per browser.** Before the first mainnet Wallet, Trade, Explorer overview or home-stats view, a card titled "You're entering QoreChain Mainnet" lists four points: the Dashboard is non-custodial, transactions are final and irreversible, there is a risk of total loss and nothing here is financial advice, and testnet QOR is never exchangeable. The acceptance is stored in your browser, not on your account.
- **One account, three encodings.** The same account is shown as a `qor1...` address, a `0x...` address and an SVM base58 address, and the Dashboard reads balance and history once, through `qor1...`.

## How to use {#how-to-use}

### The layout

**Header.** The network switch, then **Sign In** or a profile menu (Profile, Edit Profile, Theme, Language, Rewards, Referral, Docs, Log out).

**Desktop sidebar, in order:**

| Entry | Page | What it is |
| --- | --- | --- |
| **Discover** | `/` | Home: hero buttons **Create Smart Contract** and **Explore Network**, "Dashboard Overview" counters, lists of created contracts, latest audits and top contributors, and a "Developer Toolkit" with **Start Generating**, **New Audit** and **Claim Tokens**. |
| **Public Sale** | `/public-sale` | Existing participants see their allocation, vesting timeline and claim. |
| **Wallet** | [Wallet](/dashboard/wallet) | Balance, history, receive, and (mainnet) send and stake through QoreX. |
| **Faucet** | [Faucet](/dashboard/faucet) | Free testnet tokens. |
| **Explorer** | [Explorer](/dashboard/explorer) | Blocks, transactions, addresses and validators. |
| **Trade** | [Trade](/dashboard/trade) | Test-token swap screen. |
| **Earn** group | [Quests](/dashboard/quests) | Quests, Leaderboard, Badges. |
| **Games** | [Quests](/dashboard/quests#games) | The QoreChain Arcade. |
| **Build** group | [Smart Contract Creator](/dashboard/smart-contract-creator), [Contract Auditor](/dashboard/contract-auditor), [Nodes & Validators](/dashboard/tools-hub) (`/tools`), [Developers](/dashboard/developers) | Contract tools, node and validator tooling, developer tools. The Nodes & Validators entry used to be labelled "Tools". |
| **FAQ** | `/faq` | In-app help. Parts of it are out of date; this manual is the reference. |

The [Validators](/dashboard/validators) page (`/validators`) has no sidebar link; open it by address.

**Mobile.** A bottom bar (Discover, Wallet, Faucet, then Explorer, Trade, Quests) plus a centre fan menu with the rest.

### Sign in {#sign-in}

The Dashboard has two layers: a **Dashboard account** you sign in with, and the **wallet** you connect to it. Browsing never needs a wallet.

- **Redirected to sign-in before the page loads:** Profile, [Wallet](/dashboard/wallet), Rewards, Referral, [Quests](/dashboard/quests), [Trade](/dashboard/trade), [Faucet](/dashboard/faucet), Connection, Contracts, Public Sale, and every saved contract page `/smart-contract-creator/<id>`.
- **Shows an "Authentication Required" screen when you are signed out:** [Nodes & Validators](/dashboard/tools-hub), [Validators](/dashboard/validators), FAQ, [AI Audit](/dashboard/contract-auditor), Badges, Leaderboard and Games.
- **Open without an account:** the Discover home, the [Explorer](/dashboard/explorer) detail pages (transaction, block, address, validators) on both networks, the Explorer overview on testnet, the [Smart Contract Creator](/dashboard/smart-contract-creator) landing page (one free generation), the audits list at `/audits` and public audit reports, and the [Developers](/dashboard/developers) page.
- **Mainnet while signed out:** pages that show mainnet data (home counters, Wallet, Trade, the Explorer overview) show "Sign in to view mainnet" and a **Sign In** button.

### Select your network {#select-network}

The header shows the network you are on and lets you switch. The choice is remembered in your browser.

| Network | Chain ID | When to use it |
| --- | --- | --- |
| **Mainnet** | `qorechain-vladi` | Live network (live since 7 June 2026, running chain v3.2.4 since 23 October 2026) for real value. Non-custodial: you connect your own wallet. |
| **Testnet** | `qorechain-diana` | Free environment (running chain v3.2.6 since 27 October 2026) with a Dashboard-managed test wallet and the [Faucet](/dashboard/faucet). |

The native token is **QOR** (base denomination `uqor`, 1 QOR = 10^6 uqor). If you are new, start on testnet, claim tokens from the Faucet and try a first transfer before moving to mainnet.

A few pages ignore the switch: the Faucet always pays on testnet, [Trade](/dashboard/trade) always shows testnet content, and Quests, Badges, Leaderboard, Games, Public Sale and FAQ do not depend on the network.

### Connect your wallet {#connect-your-wallet}

- **Mainnet is non-custodial.** Connect **QoreX** (the official QoreChain wallet, extension or app), **Keplr** or **MetaMask**. Sending and staking on the Native rail require QoreX, because QoreChain accounts sign with a post-quantum hybrid signature that only QoreX produces today. Keplr connects to view and receive on the Native rail. MetaMask connects on the EVM rail; sending there also needs the account's post-quantum key and an open EVM window, opened from QoreX (see [Sending with MetaMask](/dashboard/wallet#send-metamask)).
- **Testnet is custodial.** The Dashboard manages a test wallet for you, so there is nothing to install and no real value at risk.

#### Connect with QoreX (recommended) {#connect-qorex}

1. Open [dashboard.qorechain.io](https://dashboard.qorechain.io) and make sure the header shows **Mainnet**.
2. If this is your first visit to a mainnet page in this browser, accept the [one-time risk acknowledgement](#risk-acknowledgement).
3. Open **Wallet** (you must be signed in) and select **Connect with QoreX** on the **QoreX wallet** card.
4. If the QoreX browser extension is detected and no method is saved, the Dashboard asks "How do you want to connect?" with **Browser extension** and **QoreX app**. The choice is saved. If no extension is detected, it goes straight to the app flow.
   - **Browser extension:** the extension popup shows `dashboard.qorechain.io` as the requesting site. Approve it; this signs a one-time proof that you own your `qor1...` address. No funds move.
   - **QoreX app:** the Dashboard shows a QR code and **Open QoreX**. Scan or tap it, review the pairing request in QoreX and approve with your biometric. The Dashboard polls ("Waiting for approval in QoreX...") and finishes by itself.
   - A **Use a different method** link appears only while a pairing is pending.
5. Once approved, the Dashboard shows your `qor1...` address and unlocks the actions that need a signature.

See [Wallet](/dashboard/wallet#mainnet) for the full connect and send walkthrough, and the QoreX docs' [Account & Dashboard](/qorex/account-and-dashboard#dashboard) page for the wallet-side view of the same pairing.

#### Connect with Keplr or MetaMask

1. With the header on **Mainnet** and the acknowledgement accepted, open **Wallet**.
2. Under **or connect another wallet**, select **Connect Keplr** or **Connect MetaMask**.
3. Approve the connection in your wallet. If your wallet does not know QoreChain yet, see [Add QoreChain to your wallet](/dashboard/wallet#add-network).

Once connected, the Wallet page shows your address with its balance and history. See [Wallet Setup](/getting-started/wallet-setup) for first-time setup guidance.

### One-time risk acknowledgement {#risk-acknowledgement}

The acknowledgement card appears before the first mainnet **Wallet**, **Trade**, **Explorer overview** or **home-stats** view in a browser. It is not required for every mainnet page: the Explorer detail pages, the Creator and the other pages open without it. Accept it once per browser; clearing the browser's data shows it again.

## How to access {#how-to-access}

- **URL:** [dashboard.qorechain.io](https://dashboard.qorechain.io), in any current browser. No install.
- **Account:** sign-in by email or a supported identity provider on the sign-in page. Which pages need it is listed under [Sign in](#sign-in).
- **Networks:** mainnet `qorechain-vladi` and testnet `qorechain-diana`, with the header switch. Mainnet is the default.
- **Wallet:** none for browsing. QoreX for mainnet sends and staking, Keplr or MetaMask to view and receive. On testnet the Dashboard creates a test wallet for you.
- **Cost:** the Dashboard is free to use. On-chain actions pay the network fee (floor 0.1 uqor per gas). Some paid items are described on their own pages (the light node licence and the validator programme fee on [Nodes & Validators](/dashboard/tools-hub)).
- **Early-access gate:** none today. Mainnet pages need only sign-in (where listed above) and the one-time acknowledgement.

## Where it is published {#where-published}

| Surface | Address | Networks | Sign-in |
| --- | --- | --- | --- |
| Dashboard | [dashboard.qorechain.io](https://dashboard.qorechain.io) | Mainnet and testnet | Per page, see [Sign in](#sign-in) |
| Standalone explorer | [explore.qore.network](https://explore.qore.network) (a separate app, see [Explorer](/dashboard/explorer#standalone-explorer)) | Mainnet and testnet | None |
| Public endpoints | `rpc.qore.host`, `api.qore.host`, `evm.qore.host`, `svm.qore.host`, with `*-testnet` variants | Mainnet and testnet | None |

Pages of this section: [Explorer](/dashboard/explorer), [Wallet](/dashboard/wallet), [Trade](/dashboard/trade), [Bridge](/dashboard/bridge), [Smart Contract Creator](/dashboard/smart-contract-creator), [Contract Auditor](/dashboard/contract-auditor), [Staking & Validators](/dashboard/staking-and-validators), [Validators](/dashboard/validators), [Faucet](/dashboard/faucet), [Quests, Badges, Leaderboard and Games](/dashboard/quests), [Nodes & Validators](/dashboard/tools-hub) and [Developers](/dashboard/developers).

## Limits and known issues {#limits}

- **There is no Bridge screen.** See [Bridge](/dashboard/bridge).
- **Trade does not follow the network switch.** It shows testnet content even with the header on Mainnet. See [Trade](/dashboard/trade).
- **Some in-app text is out of date.** The FAQ, and some wording on the create-wallet screen and the Nodes & Validators SDK tab, do not match current behaviour. Where this manual and the app disagree, follow this manual and report the page.
- **Mainnet restrictions.** Staking, send and contract deploys on mainnet are described per page; several flows (Native or SVM deploys, redelegation, time-locked staking) are not offered on the Dashboard.
- **Testnet has no real value.** Never send real QOR to a testnet address: the formats are identical. See [Wallet](/dashboard/wallet#testnet).

:::tip New to QoreChain?
Follow [Connecting to Testnet](/getting-started/connecting-to-testnet) and [Your First Transaction](/getting-started/first-transaction) to get hands-on quickly, then come back to explore the rest of the Dashboard.
:::
