---
slug: /qorex/overview
title: QoreX Wallet
sidebar_label: Overview
sidebar_position: 1
---

# QoreX Wallet

**QoreX** is the official **non-custodial** wallet for **QoreChain** (mainnet `qorechain-vladi`). It is for anyone who wants to hold, send, stake and receive QOR, pay people by @handle, hold assets on other networks from the same recovery phrase, and approve what websites ask their wallet to sign. Your private keys are generated and stored **only on your device**. QoreChain Association never has access to your funds, and the apps have **no analytics, no crash reporting and no tracking SDK**. Keys, recovery phrase, vault and approvals never leave your device (see [What QoreX sends over the network](#data-and-privacy)). Every native QOR transfer is signed twice: with a classical key and with ML-DSA-87 (FIPS 204).

QoreX is a family of four builds that work together:

- **Mobile app** (Android and iOS): the full wallet, with recovery, staking, portfolio, an in-app dApp browser and the Q-Day Scanner. See [Getting Started](/qorex/getting-started) and [dApp Browser](/qorex/dapp-browser).
- **Browser extension** (Chrome and Chromium browsers, Firefox): a standalone desktop wallet, and the connector that lets any website discover QoreX and turn every request into an explicit approval. See [Browser Extension](/qorex/browser-extension).
- **Safari extension**: the same extension, packaged inside the **QoreX Wallet** macOS app on the Mac App Store.
- **Developer kit**: six public npm packages for apps that integrate with QoreX. See [For developers](#developers).

:::caution Back up your recovery phrase as soon as you create a wallet
QoreX is non-custodial: QoreChain Association cannot recover a lost wallet, reset it, or restore it for you. **Uninstalling the app, resetting the phone or removing the extension deletes your keys from that device.** Write down your 24-word recovery phrase (the mobile app does not show it while it creates the wallet, so reveal it from **Settings → Security → Reveal recovery phrase**; the extension shows it once at creation) and, if you can, set up [social recovery](/qorex/security-and-recovery#social-recovery). See [Back up now](/qorex/security-and-recovery#back-up-now).
:::

## Innovations {#innovations}

- **Hybrid-signed native lane.** Every native QOR transfer is signed twice: with a classical secp256k1 key and with ML-DSA-87 (FIPS 204). The chain verifies both. Anything on an external network is classical only, and QoreX labels it as such before you confirm.
- **One recovery phrase, one ML-DSA-87 key, no second backup.** The ML-DSA-87 key is derived deterministically from the same 24 words: `SHAKE256("qorechain:pqc:v1|" + address + "|" + mnemonic)`. The derivation is published in [QoreSign](/qoresign/overview), so any compatible wallet derives the same key.
- **Registered automatically, then checked.** The ML-DSA-87 key is registered on chain with your first transaction (with a proof of possession on chain v3.2.3 and later). After every broadcast the wallet checks that the committed transaction carries the ML-DSA-87 layer, and warns you if it does not.
- **Approvals that refuse what they cannot read.** Every message, the fee, spending limits and expiry are decoded before you sign. A request QoreX cannot decode, or one whose bytes can be read two ways, is refused.
- **`signAndBroadcast` for dApps.** A website sends the messages; the wallet shows them decoded, adds the ML-DSA-87 layer that only the wallet can make, and broadcasts. A page cannot produce that layer.
- **EVM access windows, safer by default.** Above chain v3.2.0, an EVM transaction is admitted only while the account has an open window: a hybrid-signed `MsgOpenEVMWindow`, bounded by transaction count, value and expiry. QoreX opens, shows and closes it. A window you open yourself is limited to **QOR transfers only** unless you choose **Any contract**, which comes with its own warning; an open window says exactly what it admits; and an approval that opens a window for a site names every contract the window allows and says when it replaces the one that is open. See [Security & Recovery](/qorex/security-and-recovery#evm-window).
- **Handles with pinning.** An @handle is bound to a `qor1…` address by a registry ed25519 attestation plus the owner's own secp256k1 signature. QoreX pins the address it first resolved and flags a silent change.
- **Recovery that needs no company.** Social recovery splits the seed into encrypted shares sealed with ML-KEM (2 of 3 guardians), with a 48-hour timelock that alerts you; Legacy is a dead-man's switch over your guardians; device linking moves a wallet with a one-time code and a QR that is useless alone. See [Security & Recovery](/qorex/security-and-recovery).
- **First run with a purpose.** After the short tour QoreX asks **What do you want to do first?** (receive money, send money, or keep my crypto safe) and walks you to it, ending with a short backup check. See [First run](/qorex/getting-started#first-run).
- **Payment requests with signed links.** Ask for an amount and QoreX makes a link signed by your own account key, so a changed recipient or amount is detected. The payer's QoreX checks the signature, the network and any @handle, then shows the normal review. A request is marked paid only when the chain shows the payment. See [Send & Receive](/qorex/send-and-receive).
- **Contacts and favourites.** Names for the addresses you pay, kept on the device only. Favourites are one-tap chips on the send form, **Repeat payment** fills the form again (you still review it), and an address that only looks like a saved one is flagged.
- **My money's protection.** One screen that checks, live, whether your backup was verified, whether your recovery was tested, your guardians (app), the sites and apps connected to you, the permissions your account gave on the network and the ERC-20 approvals on QoreChain's EVM (each with Revoke), and which signatures are post-quantum on which lane. See [Security & Recovery](/qorex/security-and-recovery).
- **A clear history.** Each transaction shows as pending, confirmed or failed, read from the chain, per account, with an export to CSV that is safe to open in a spreadsheet.
- **A network status banner.** If blocks stop arriving, QoreX says so, using the chain's own block times. It says nothing while the network is fine.
- **Post-quantum key care.** If an account's post-quantum key record can no longer sign, QoreX offers to register it again (never automatically, two taps). You can also rotate the ML-DSA-87 key from your recovery phrase, and create, co-sign and send from a post-quantum **multisig** account.
- **Developer mode.** A switch (off by default) that adds 17 tools: inspectors, a transaction simulator, contract and deployment review, rollup profiles, offline and multisig signing, and a place for AI agents to propose transactions that you approve. Nothing in it changes a signing rule. See [Developer mode](/qorex/developer-mode).
- **Testnet-only network features.** Send to another chain over IBC, a QoreChain Bridge screen and Solana on QoreChain exist on the testnet only. See [Testnet features](/qorex/testnet-features).
- **Small footprint.** The extension asks the browser for one API permission, `storage`, and ships no analytics or tracking code. Push tells the server only your public addresses and the notification says only "QOR received".

## How to use {#how-to-use}

1. Install QoreX from an official store listing (see [How to access](#how-to-access)).
2. Create a wallet or restore one: [Getting Started](/qorex/getting-started) for the mobile app, [Browser Extension](/qorex/browser-extension#wallet) for the extension.
3. Write down the 24 words, then pick **What do you want to do first?** (receive, send or keep my crypto safe) and follow it: [First run](/qorex/getting-started#first-run). Then send and receive QOR: [Send & Receive](/qorex/send-and-receive).
4. Stake: [Portfolio & Staking](/qorex/portfolio-and-staking). Set up your safety net: [Security & Recovery](/qorex/security-and-recovery).
5. To use a website with QoreX, open it in the extension (desktop) or in the app's [dApp Browser](/qorex/dapp-browser). Every connection and every signature is an approval you give.

## How to access {#how-to-access}

- **Networks:** mainnet `qorechain-vladi` (default) and testnet `qorechain-diana`. On mobile, testnet is **Settings → Use testnet (developers)**. In the extension, turn on Developer mode first (tap the version number at the bottom of the popup seven times), then choose **Switch to testnet (diana)**. A yellow **TESTNET** banner shows on every screen while you are on the testnet.
- **Account needed:** none. Sign-in (email, Apple or Google) is optional and only needed to claim an @handle, link to the Dashboard and use the account-based payment requests in the app. Signed payment links need no account.
- **Prerequisites:** on mobile, a device unlock (Face ID or Touch ID on iOS; a Class-3 biometric or a screen-lock PIN on Android) or the create and import buttons stay disabled. In the extension, a password.
- **Cost:** QoreX is free. Sending, staking and opening an EVM window pay the normal network fee (the network floor is 0.1 uqor per gas).
- **Always install from an official listing:**

| Build | Where | Minimum |
|---|---|---|
| iOS app | [App Store, QoreX](https://apps.apple.com/us/app/qorex-wallet/id6791256626) | iOS 15.1 |
| Android app | [Google Play](https://play.google.com/store/apps/details?id=network.qore.qorex) | Android 7.0 |
| Chrome, Brave, Edge, Arc, Opera | [Chrome Web Store](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) | a Chromium browser |
| Firefox | [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/qorex/) | Firefox 140 |
| Safari | [Mac App Store, QoreX Wallet](https://apps.apple.com/us/app/qorex-wallet/id6794132220) | macOS 12 |

## Where it is published {#where-published}

| Build | Listing and package name | Current version | Link |
|---|---|---|---|
| iOS app | App Store, **QoreX** (id 6791256626) | 1.2.5 | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6791256626) |
| Android app | Google Play, `network.qore.qorex` | 1.2.5 | [play.google.com](https://play.google.com/store/apps/details?id=network.qore.qorex) |
| Chrome extension | Chrome Web Store, **QoreX** | 0.4.5 | [chromewebstore.google.com](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) |
| Firefox extension | Firefox Add-ons, `qorex` | 0.4.5 | [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/qorex/) |
| Safari extension | Mac App Store, **QoreX Wallet** (id 6794132220) | app 1.8.1, extension 0.4.3 | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6794132220) |
| Developer kit | six npm packages, see [For developers](#developers) | 0.1.0 | [QoreX integrations](/developer-tools/qorex-integrations) |

Store review runs on its own schedule, so a store can serve an older build than another; see [Which version is live where](#versions). The QoreX source code is not public.

## Limits and known issues {#limits}

- **No promise beyond what is signed.** The hybrid signature covers native-lane transactions. EVM transactions carry a secp256k1 signature only, and are admitted only while an EVM access window is open (only accounts added with **Add an Ethereum account (coin 60)** can send on that lane). SVM and external-network transfers are classical only.
- **Mobile only:** Portfolio, Q-Day Scanner, social recovery, Legacy, sign-in, claiming an @handle and device linking.
- **Swap is not available.** It stays off until pool liquidity exists and is not shown on iOS.
- **Linked signers** (Phantom or MetaMask as a linked key with spending limits) are not available inside QoreX yet.
- **Testnet only:** sending to another chain over IBC, the QoreChain Bridge screen and Solana on QoreChain. None of them is offered on mainnet. See [Testnet features](/qorex/testnet-features).
- **AI agents** (Developer mode) cannot sign: they can only propose a transaction that you approve. In the extension they need a companion program on your computer that is not yet published, and they are not available in Safari. In the app you paste a proposal or open a proposal link. See [Developer mode](/qorex/developer-mode).
- **If the handle service is down,** the wallet falls back to plain addresses; everything else keeps working.
- A lost wallet with no written phrase and no social recovery cannot be recovered by anyone.

## Platform availability {#platform-availability}

| Capability | Mobile app (Android & iOS) | Browser extension |
|---|---|---|
| Create / import a wallet | ✅ (the app does not show the phrase when it creates the wallet - reveal it from Settings → Security) | ✅ (standalone; the phrase is shown once at creation, then a short backup check) |
| First run: **What do you want to do first?** | ✅ (after the tour; reopen from Settings) | ✅ (after creating or importing; reopen from the popup) |
| Backup check (a quiz on three words of your phrase) | ✅ | ✅ |
| Several wallets, each with its own recovery phrase | ✅ (Settings → Wallets) | ✅ (**Wallets**, one password for all) |
| Several accounts from one recovery phrase | ✅ (up to 20 per wallet) | ✅ |
| Ethereum-style (coin 60) account, added by hand | ✅ | ✅ |
| Send & receive QOR (hybrid-signed native lane) | ✅ | ✅ (Send with a review step; Receive starts with the coin) |
| Receive on any supported network | ✅ | ✅ |
| Pay an @handle | ✅ | ✅ |
| Claim an @handle | ✅ (needs a signed-in account) | - (the extension points you to the app) |
| Payment requests with signed links, and paying one | ✅ | ✅ |
| Contacts, favourites and **Repeat payment** | ✅ | ✅ |
| History per account (pending, confirmed, failed) and CSV export | ✅ (Activity) | ✅ (**History**) |
| **My money's protection** | ✅ | ✅ |
| **Support** (official channels) | ✅ | ✅ |
| Network status banner | ✅ | ✅ |
| Auto-lock (default 15 minutes) | ✅ (asks for your biometric or PIN again) | ✅ (asks for your password again) |
| Staking: delegate, unstake, move stake, claim, claim & restake, locks, choose where rewards go | ✅ | ✅ (one screen for each) |
| Post-quantum key repair and rotation | ✅ | ✅ |
| Post-quantum multisig accounts | ✅ | ✅ |
| External networks (Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis, Celestia + tokens) | ✅ | ✅ (send from the popup) |
| Add a token by contract (EVM networks) | ✅ | ✅ |
| EVM access window | ✅ | ✅ |
| Interface language (10 languages) | ✅ (follows the phone) | ✅ (follows the browser) |
| Portfolio, Q-Day Scanner, Social Recovery, Legacy | ✅ | - |
| Search, first-run tour, home-screen widget, push notifications | ✅ | - |
| dApp connections | ✅ (in-app browser, revocable per site, favourite and recent sites) | ✅ (any website; **Connected sites** with Revoke) |
| Developer mode (17 tools) | ✅ (a **Developer** tab in the bottom bar) | ✅ (one **Developer tools** button) |
| AI agents proposing transactions (Developer mode) | ✅ (paste a proposal or open a proposal link) | companion program needed (not yet published); not in Safari |
| Send to another chain (IBC), QoreChain Bridge screen, Solana on QoreChain | testnet only | testnet only |
| Swap | Android only, off until pool liquidity (not shown on iOS) | - |
| Account sign-in | ✅ | - |
| Multi-device linking | ✅ | - |
| Dashboard pairing | ✅ | ✅ (connect + proposed transfers, incl. staking) |

## Get started

- New to QoreX? Start with [Getting Started](/qorex/getting-started) to create or restore your wallet.
- Then learn to [Send & Receive](/qorex/send-and-receive) QOR on the hybrid-signed native lane.
- Set up your safety net in [Security & Recovery](/qorex/security-and-recovery).
- On desktop, install the [Browser Extension](/qorex/browser-extension).

## Download & availability {#availability}

Install from the official listings in [How to access](#how-to-access). The Android app needs Android 7.0 or later, the iOS app iOS 15.1 or later, the Firefox extension Firefox 140 or later and the Safari extension macOS 12 or later.

## Which version is live where {#versions}

:::note
Versions as checked on 27 November 2026. The iPhone and Android apps 1.2.5 and the Chrome and Firefox extensions 0.4.5 are live. Safari 1.8.2, which carries extension 0.4.5, is in store review: on Safari, the features this manual describes for 0.4.5 arrive when the Mac App Store offers the update. The web page behind shared payment links is online; see [Opening a payment link without the app](/qorex/send-and-receive#pay-web).
:::

Store review runs on its own schedule, so a store can serve an older build than another for a while. This is the current version **on each store**:

| Store | Current version | Note |
|---|---|---|
| Apple App Store (iOS) | 1.2.5 | |
| Google Play (Android) | 1.2.5 | |
| Chrome Web Store | 0.4.5 | |
| Firefox Add-ons | 0.4.5 | |
| Safari (Mac App Store) | 1.8.1, carrying extension 0.4.3 | the Mac App Store uses its own `1.x` numbering |

The stores always show their current version, and a store still serving an older build catches up automatically.

### What the 1.2.5 / 0.4.5 builds add {#whats-new-125}

For everyday use (app and extension, mainnet and testnet unless noted):

- **First run with a purpose.** After the tour, **What do you want to do first?** walks you to receiving, sending or keeping your crypto safe, with a short backup check. Skippable, and you can reopen it. See [First run](/qorex/getting-started#first-run).
- **Payment requests with signed links**, and paying one from a link. A request is marked paid when the chain shows it.
- **Contacts and favourites**, with **Repeat payment** and a warning for look-alike addresses.
- **A clearer history**: pending, confirmed or failed, per account, with a CSV export.
- **My money's protection**: backup, recovery test, guardians (app), connected sites, permissions and token approvals with Revoke, and a plain explanation of which signatures are post-quantum on which lane.
- **Safer EVM access windows.** A window you open yourself defaults to **QOR transfers only**; allowing any contract is a separate choice with a warning. Approvals name every contract a window allows and say when a new window replaces the open one. When a node cannot check what a call does to your tokens, QoreX says so and asks for a second tap.
- **Help inside the app** (**Support**): only the official channels, plus a reminder that QoreX staff never ask for your phrase.
- **A network status banner** when blocks stop arriving, and the **staking period** (the time before unstaked QOR is yours to move) is read from the network instead of being a fixed number.
- **Extension: a site's signing request while QoreX is locked** opens the password screen and names the site; after you unlock, the request shows its own approval.
- **App: favourite and recent sites** on the dApp browser's start page.
- **Post-quantum key care**: **Register key again** for a key record that can no longer sign (never automatic, two taps), **Rotate post-quantum key** from your recovery phrase, and full multisig accounts (create, co-sign by file or by pasting, send).
- **Receive** also offers the tokens you added by contract, with their network's address.
- **Receive** for Cosmos Hub, Osmosis and Celestia shows the address that your sends on those networks sign from.
- **Developer mode** with 17 tools. See [Developer mode](/qorex/developer-mode).
- **Testnet only:** send to another chain over IBC, a QoreChain Bridge screen and Solana on QoreChain. See [Testnet features](/qorex/testnet-features).
- **For sites:** QoreX now refuses a standing permission (an authz grant of `MsgGrant` or `MsgExec`) that would let someone else act as your account, from any site. See [dApp integration](/qorex/dapp-integration).

What the 1.2.4 / 0.4.3 builds changed for you:

- **Extension unlock.** Enter unlocks, the button shows it is working, **Wrong password.** appears only for a wrong password, and any other failure is named.
- **Contract calls get enough gas.** A site's CosmWasm or cross-VM transaction is simulated before the approval, and a call the contract would refuse is refused before you see it.
- **Gas prices follow the network**, and a transaction above the network's per-transaction gas limit is refused before anything is signed.
- **Solana approvals** mark an instruction QoreX cannot decode as unreadable and ask for a second tap; a memo shows its text.
- **A post-quantum key that can no longer sign is named as such**, instead of "registered by another wallet".
- **A site can no longer close your EVM window or clear its consent**; you do both from QoreX's own screens.
- **Staking yield** is read from the chain's own figure, and **EVM window usage** shows in History.
- **Firefox:** github.com loads normally with QoreX installed.

What the 1.2.3 / 0.4.2 builds changed for you:

- **Receive starts with the coin.** A searchable list with QOR first, then each network's own coin and the bundled tokens, each with its picture. Picking one shows the address and QR code for that network, with a warning that names the coin.
- **Accounts that cannot use an EVM window are told what to do next**, with a button to **Your accounts**.
- **Staking and the EVM window screens say when your first transaction also registers your key.**

What the 1.2.2 / 0.4.1 builds changed for you:

- The QOR page lists every transaction of the account, in and out, with **Show more**.
- **Send works on BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche and Celestia** (and their tokens), as on Ethereum, Solana, Cosmos Hub and Osmosis.
- Approval screens read spending rules and EVM call data, and offer the full message. Messages that manage an account's keys or authority can only be signed from QoreX's own screens.
- The review of a first send shows the one-time key registration fee and the total.

What the 1.2.1 build (app) changed for you: a link can open a page in the dApp browser (after the usual biometric prompt), the approval sheets show a transaction's memo, and the app declares its signing capabilities to sites. Links that start with `qorex://` that the dashboard hands out work again.

What the 1.2.0 / 0.4.0 builds changed for you:

- **Auto-lock** (1, 5, 15, 30, 60 or 240 minutes; default 15) and a **Lock** button in the extension.
- **A review before every transfer** in the extension, and a warning when an address only looks like one you have paid before.
- **History per account** with every kind of QoreChain transaction.
- **Staking screens** in the extension are separate (Stake QOR, Unstake, Move stake, Claim, Claim & restake, Lock for a bonus, Rewards go to), **Move stake** is in three steps and catches moves the network would refuse, and you can **choose where staking rewards go** (another account of the same wallet).
- **EVM dApps sign through QoreX** (`personal_sign`, typed data and transactions), with the decoded risk of each request and a simulation before you sign.
- **Last known values** are shown, and labelled as such, when the network does not answer.
- A warning when the fee is larger than the value you move.

What the 1.1.9 / 0.3.9 builds added (included in every current build):

- **Staking locks.** Lock part of your stake for 3, 6 or 12 months. The bonus shown is the bonus the lock earns today, under the network's ceiling. Unlocking early sits behind a second confirmation that names the cost, and **Unstake** and **Move stake** are limited to the unlocked part. The tier schedule is labelled "up to", with today's figure beside it. See [Portfolio & Staking](/qorex/portfolio-and-staking#staking-locks).
- **IBC transfer memos in plain words** on approvals.
- **Staking from accounts imported from MetaMask (coin 60)** in the extension.

What the 1.1.8 / 0.3.8 builds changed for you:

- **MetaMask on QoreChain, from the first page.** Open, check and close the EVM access window that MetaMask needs, and see what it has left.
- **Stronger signature checks.** QoreX verifies an app's ML-DSA-87 signature against your account's registered key, and says clearly if that key was registered by another wallet.
- **Fixes for reported security issues.**

What the 1.1.7 / 0.3.7 builds changed for you (included in 1.1.8 / 0.3.8):

- **Approvals refuse a request whose bytes can be read two ways.** If the same field appears twice in a request, a screen and the chain could disagree about what is being signed - for example a fee or an amount shown differently from the one executed. QoreX now refuses such a request instead of showing one reading of it. See [What the approval window shows](/qorex/security-and-recovery#approvals).
- **Grant expiry is shown to the second**, and governance votes are decoded and shown on the approval screen.
- **Sites are identified by the origin the browser itself attests**, not by what a request claims about itself.
- **@handle lookups work again in the extension.**
- **Claiming an @handle needs a signed-in account and happens in the app**; the extension points you there.
- **Look-alike QoreChain names are reserved**, so a new handle cannot imitate the project or its staff.

Highlights since 1.0.9 / 0.2.6:

- **Several wallets** on one phone or browser, each with its own recovery phrase, with one-tap switching - see [Several wallets](/qorex/getting-started#several-wallets).
- **Ethereum-style (coin 60) account**, added by hand, for phrases first used in MetaMask or on the Dashboard - see [Restore a phrase from MetaMask or the Dashboard](/qorex/getting-started#restore-dashboard).
- **Add a token by contract**, **Receive on any network**, global **search**, a first-run **tour**, a **home-screen widget** and **push notifications** when QOR arrives (mobile) - see [Send & Receive](/qorex/send-and-receive).
- **Claim & restake**, a fee check before claiming, an **Unstaking in progress** list and warnings before you stake your way out of being able to unstake - see [Portfolio & Staking](/qorex/portfolio-and-staking).
- Approval screens that show every message, the fee, spending limits and expiry, and refuse what QoreX cannot display; **`signAndBroadcast`** for dApps; **Connected sites** with Revoke (extension); the **EVM access window** - see [Security & Recovery](/qorex/security-and-recovery) and the [Browser Extension](/qorex/browser-extension).
- Fixes: a funded account could momentarily vanish from "Your accounts" (1.0.9); Android hardware Back now goes back one screen (1.1.1); the recovery phrase is withheld from non-accessibility services on Android 14 and later (1.1.6).

QoreX works on mainnet `qorechain-vladi` (live since 7 June 2026), which has run chain **v3.2.8** since 18 November 2026 (v3.2.7 from 12 November 2026, v3.2.6 from 4 November 2026, v3.2.5 from 29 October 2026, v3.2.4 from 23 October 2026). Signing format, addresses, decimals and memos do not change in these upgrades. QoreX 1.2.4 / 0.4.3 added handling for the v3.2.8 rules (EVM window scope, gas limits and the network's gas price), so keep QoreX up to date.

## For developers {#developers}

To connect a website to QoreX (wallet discovery, the provider, signing, links and errors), start with [dApp integration](/qorex/dapp-integration); the tools built into the wallet for builders are on [Developer mode](/qorex/developer-mode). To integrate with QoreX from your own app, you can also use the QoreX developer kit: six npm packages, published at 0.1.0. Their install commands, examples and limits are on [QoreX integrations](/developer-tools/qorex-integrations). For wallet discovery and signing in a web app, see also the [wallet adapter](/developer-tools/wallet-adapter) and, for the browser provider QoreX injects, the [Browser Extension](/qorex/browser-extension#standards).

## What QoreX sends over the network {#data-and-privacy}

QoreX has **no analytics, no crash reporting and no tracking SDK**. Your keys, your recovery phrase, the vault and your approvals **never leave the device**. The apps do talk to the network, as any wallet must; this is the complete list.

**Always (needed to show balances and send):**

- **QoreChain public endpoints** (`api`, `rpc`, `evm` and `svm` on `qore.host`, and the `-testnet` equivalents) for balances, history and broadcasting. These requests carry your **public** `qor1…` address.
- **Price lookup** - one request for the QOR price, which carries **no address**.
- **External networks you hold or view** - public third-party RPC/REST services for that network, carrying your **public** address on that network.
- **@handle registry** - carries the handle you look up, or a public address.

**Only if you turn it on:**

- **Push notifications** (mobile) - off until you enable them. The server then receives your device token and the public `qor1…` addresses of the wallet in use (up to 10). A device the server has not heard from for 90 days is forgotten.
- **Social recovery** - the relay stores **ciphertext only**.
- **Sign-in** (email, or Apple or Google) - needed to claim an @handle, to link to the Dashboard and to use the account-based payment requests in the app.
- **Dashboard connect and linked addresses** - sends a signed proof that you own the address.
- **Account-based payment requests** (to an @handle, in the app) - send the from-handle, to-handle, amount and optional note. A **signed payment link** is made and signed on your device; whether it has been paid is read from the public QoreChain endpoints.
- **Q-Day Scanner on a Bitcoin address** - asks a service run by someone else, which sees that address and your IP address. QoreX names it and scans only after you accept.

**The home-screen widget** makes no request of its own to QoreChain servers: the app hands it your address, balance and privacy flag locally, and the widget refreshes the balance from the public QoreChain REST endpoint.

**Kept on the device only:** contacts, your app's favourite and recent dApp sites (saved without the query or fragment of the address), the history export you make, and the recovery test and backup check (the words you type are not kept or sent). The **network status** banner reads the latest block from the public QoreChain endpoints, not from a separate status service.

There is **no AI chat and no QCAI service** in either app. The Developer mode **AI agents** tool lets an AI assistant that you run yourself propose transactions to QoreX; QoreX has no AI service of its own in it, and nothing is signed without your approval.
