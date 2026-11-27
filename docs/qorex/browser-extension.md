---
slug: /qorex/browser-extension
title: QoreX Browser Extension
sidebar_label: Browser Extension
sidebar_position: 2
---

# QoreX Browser Extension

The QoreX **browser extension** is the desktop QoreChain wallet. It is a **standalone wallet** (create or import a wallet, hold, send and stake QOR, and connect to dApps) and it is the piece that lets any website discover QoreX and turn every request into an explicit, decoded approval. It is for anyone who uses QoreChain from a desktop browser, and for developers who want their web app to work with a QoreChain wallet.

It is **live and public** on three stores (Chrome, Firefox and Safari), all carrying extension 0.4.5. See [which version is live where](#versions).

## Innovations {#innovations}

- **`signAndBroadcast`.** A dApp sends messages; the wallet shows every decoded message and the fee, then adds the ML-DSA-87 layer that only the wallet can make, and broadcasts. A page never holds the ML-DSA-87 key.
- **`signDirect` checks the layer against the registered key.** If a dApp attaches an ML-DSA-87 layer itself, QoreX checks it against the key registered for the account on chain before any approval window opens. If the transaction carries no layer, QoreX adds it. `signAndBroadcast` stays the simplest path (see [Sending a QoreChain transaction](#sign-and-broadcast)).
- **A small permission surface.** The extension declares `storage`, plus (in Chrome and Firefox) `nativeMessaging` for the optional Developer mode AI agents tool. There are no host permissions, and there is no analytics, crash-report or tracking code. See [What permissions QoreX asks for](#permissions).
- **Sealed vault.** The vault is encrypted with AES-256-GCM under a password-derived key (Argon2id). Where the browser exposes WebAuthn PRF (Chrome and Edge), you can unlock with a passkey instead; the password always remains a fallback.
- **Discovery without taking over.** QoreX announces itself with EIP-6963 (`rdns` `network.qore.qorex`) and the Solana Wallet Standard. It never overwrites `window.ethereum` or `window.keplr`.
- **Per-origin approvals, identified by the browser.** The site is the origin the browser itself attests, never what the request claims. A request that repeats a field so it can be read two ways is refused.
- **A locked wallet asks for your password, not for a retry.** A site's signing request made while QoreX is locked opens the password screen and names the site; after you unlock, the request shows its own approval. Nothing is signed without the password.
- **A review before every transfer.** The send form leads to a review screen with the full recipient, the fees and warnings, and only then to signing.
- **History with CSV export**, per account, with each transaction pending, confirmed or failed as the chain reports it.
- **Payment requests, contacts, My money's protection and Support** in the popup. See [Payment requests](#pay-requests), [Contacts](#contacts) and [My money's protection](#protection).
- **Developer mode with 17 tools.** One **Developer tools** button opens them all on their own page. See [Developer mode](/qorex/developer-mode).

## How to use {#how-to-use}

1. Install the extension (see [How to access](#how-to-access)) and open the popup.
2. Choose **Create a new wallet** (a password, then 24 words shown once) or **Import a recovery phrase**. See [Create or restore a wallet](#wallet). Then choose **What do you want to do first?** or skip it.
3. Use **Send**, **Receive**, **Stake QOR**, **History** and **Coins and tokens** in the popup. See [Send QOR](#send), [History](#history), [Stake from the extension](#stake) and [Send on external networks](#send-external).
4. Open a dApp. The first connection shows an approval with the site's origin; approving reveals only your public address. Revoke any site under [Connected sites](#connected-sites).
5. As a developer, detect QoreX with EIP-6963 and send a transaction with `signAndBroadcast`. See [Connect a dApp to QoreX](#connect) and [Sending a QoreChain transaction from a dApp](#sign-and-broadcast).

## How to access {#how-to-access}

You need a desktop browser and nothing else: no account, no sign-up and no mobile app. Network fees apply when you send or stake (the network floor is 0.1 uqor per gas). The extension follows the network it is set to; mainnet `qorechain-vladi` is the default.

### Install {#install}

| Browser | Install |
|---|---|
| **Chrome and Chromium browsers** (Brave, Edge, Arc, Opera) | https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg |
| **Firefox** (Firefox 140 or later) | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 12 or later)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

Always install from one of these listings.

### Which version is live where {#versions}

:::note
Versions as checked on 27 November 2026. The iPhone and Android apps 1.2.5 and the Chrome and Firefox extensions 0.4.5 are live. Safari 1.8.2, which carries extension 0.4.5, is in store review: on Safari, the features this manual describes for 0.4.5 arrive when the Mac App Store offers the update. The web page behind shared payment links is not online yet; the links open in QoreX.
:::

Current version on each store:

| Store | Current version |
|---|---|
| Chrome Web Store | 0.4.5 |
| Firefox Add-ons | 0.4.5 |
| Safari (Mac App Store, **QoreX Wallet** macOS app) | 1.8.1, carrying extension 0.4.3 (the Mac App Store uses its own `1.x` numbering) |

Store reviews land at different times, so a store can serve an older build than another; the store listing always shows its current version. See also [Which version is live where](/qorex/overview#versions).

Extension 0.4.x adds [auto-lock](#unlock), a [review before every transfer](#send), [History with CSV export](#history), [payment requests](#pay-requests), [contacts](#contacts), [My money's protection](#protection), [post-quantum key repair, rotation and multisig](#pqc-care), separate [staking screens](#stake), a [coin-first Receive screen](#receive), [EVM signing for dApps](#standards), [safer EVM access windows](#evm-window) and [Developer tools](#developer-tools). The full list by version is in [What the 1.2.5 / 0.4.5 builds add](/qorex/overview#whats-new-125) and the lists that follow it.

Since 0.2.6 the extension also gained: [several wallets with one password](#wallets), an [Ethereum-style account you add by hand](#coin60), [Claim & restake](#stake), an **Unstaking in progress** list, [adding a token by contract](#custom-tokens), [Receive on any network](#receive), [Connected sites with Revoke](#connected-sites), the [EVM access window](#evm-window), [`signAndBroadcast` for dApps](#sign-and-broadcast), and approval screens that show every message, fee and expiry.

**The permission surface has not changed since 0.1.3.** See [What permissions QoreX asks for](#permissions).

:::note
On Safari, approvals open in a browser tab rather than a popup window. The extension is packaged with Apple's Safari web-extension wrapper from the same codebase. The Developer mode **AI agents** tool is not available in Safari.
:::

## Create or restore a wallet {#wallet}

Open the popup and choose:

- **Create a new wallet** - choose a password (at least 8 characters); QoreX generates a fresh 24-word recovery phrase on your device (256-bit entropy), derives your QoreChain identity, and seals it in the vault under that password (and, optionally, a passkey - see [Security](#security)). The 24 words are shown **once** - write them down, tick *I have saved my recovery phrase somewhere safe*, then continue. You can show them again later with **Reveal recovery phrase** in the popup (password required).
- **Check your backup** - right after you confirm that you saved the phrase, QoreX asks you to type three of its words, at random positions, as you wrote them down. If one does not match, look at your paper and try again. You can choose **Check later**; later, **Check my backup** asks for your password and does not show the phrase, because the point is to check your written copy.
- **Import a recovery phrase** - restore from an existing phrase. A phrase shorter than 24 words restores your funds normally, but QoreX warns that your ML-DSA-87 key is then only as strong as the phrase; for full strength, create a new 24-word wallet and move your funds there.

:::danger Write the phrase down before you continue
The extension's vault lives only in this browser. **Removing the extension, clearing its data or resetting the browser deletes your keys**, and nobody - including QoreChain Association - can restore them. Without your written 24 words, your funds are gone for good. See [Back up now](/qorex/security-and-recovery#back-up-now).
:::

After creating or importing, QoreX asks **What do you want to do first?** once. In the extension, **I want to receive money** walks you through the coin, its address and a payment link; **I want to send money** through funding the wallet, the @handle note (handles are claimed in the app) and your first payment, with the fee explained; **I want to keep my crypto safe** shows your deposit address and the backup check. Tap **Skip for now** to pass; **What do you want to do?** on the popup home opens it again.

The extension holds its own keys; it does not require the mobile app. Keys never leave the device.

## Unlock and auto-lock {#unlock}

- **Unlock** - type your password and press **Enter** or tap **Unlock**. The button shows that it is working (the vault key is deliberately slow to derive). **Wrong password.** appears only for a wrong password; any other failure is named. Where [passkey unlock](#security) is turned on, you can use **Unlock with passkey**.
- **Auto-lock** - on the popup home, **Lock automatically after** sets how long QoreX stays open without use: 1, 5, 15, 30, 60 or 240 minutes (shown as minutes or hours). The default is 15 minutes.
- **Lock** - the **Lock** button on the popup home locks at once; the next screen asks for your password.
- **A site asks while you are locked** - a signing request from a site (native, EVM or Solana) opens QoreX on the password screen, naming the site. After you unlock, that window closes and the request shows its own approval. If you close the window instead, the request is refused and nothing is signed.

## Several wallets and accounts {#wallets}

- **Wallets** (from 0.3.3) - the popup's **Wallets** screen ("Wallets in this browser") lists every wallet in this browser. Each has its own recovery phrase; **one password** unlocks them all, and switching changes which one QoreX shows and signs with (nothing moves on chain). **Add** a wallet by creating a new one (its phrase is shown once) or restoring one; your password is asked once to re-seal the vault. Adding or removing a wallet turns **passkey unlock** off - turn it back on from the home screen. To remove one, tap *Remove from this browser* and enter your password; the last wallet cannot be removed from this screen. Removing deletes that key from the browser - only its recovery phrase brings it back.
- **Accounts** (from 0.2.2) - **Your accounts** creates and switches between several accounts from the same phrase (up to 20 per wallet; they are numbered and cannot be renamed). Restoring the phrase you wrote down brings back **Account 1**; re-add the others with **Add an account**. Switching moves everything with it: sending, staking, receiving, and your @handle follow whichever account is active.

### Ethereum-style account {#coin60}

From 0.3.2, **Add an Ethereum account (coin 60)** (on the **Your accounts** screen) adds the account for a phrase first used in MetaMask or on the Dashboard; see [Restore a phrase from MetaMask or the Dashboard](/qorex/getting-started#restore-dashboard). Its 0x address is the one MetaMask shows for the same words. Handles are not offered on it. From extension 0.3.9 you can stake from this account in the extension.

Portfolio, Q-Day Scanner, social recovery, Legacy Protocol, account sign-in and device linking remain mobile-only - see [QoreX Wallet](/qorex/overview#platform-availability).

## Your account, balance & @handle {#account}

The popup's idle screen shows your `qor1…` address (tap to copy) and your live QOR balance, so you don't need to open a block explorer to check either.

### Vesting (locked) balances {#vesting}

If your account holds vesting QOR (for example, an unreleased TGE allocation), the balance splits into **available now** and **still locked**, and a send that exceeds the available amount is refused before it reaches the network rather than failing on-chain after taking a fee. QoreX deliberately does **not** show a "next unlock date" here: a vesting schedule can be amended by governance, so a date on the balance card would read as a promise QoreX can't guarantee. The available-vs-locked split is what stays accurate.

### Claim an @handle

Claiming a unique **@handle** (for example `@liviu`) needs a **signed-in account** and happens **in the mobile app**; the extension points you there and does not claim handles itself. Once claimed, the handle binds to that address, so the extension resolves it when you pay it and others can pay you by name. See [@handle](/qorex/account-and-dashboard#handle) for how handles are bound to addresses (not to a wallet as a whole).

## Send QOR {#send}

1. Open the popup and tap **Send**.
2. Enter the recipient (`qor1…` address or @handle), the amount and an optional memo. [Favourites](#contacts) appear as one-tap chips on the form.
3. **Review the transfer.** The review screen shows the recipient in full (and the contact name, if it is a saved contact), the amount and the memo. If this is the account's first transaction, it also shows the one-time ML-DSA-87 key registration fee and the total.
4. Read any warning. QoreX tells you when it is the first payment to that address from this wallet, when the address only **looks like** one you have paid before or saved (compare every character; you need a second tap, **Tap again to send to this address anyway**), and when the network fee is larger than the amount you are sending.
5. Tap **Confirm and send**. QoreX signs with the hybrid signature and sends.

Available on mainnet and testnet. A transaction above the network's per-transaction gas limit is refused before anything is signed.

## Send to an @handle {#handle-send}

Since 0.1.9 you can pay a registered @handle directly instead of looking up an address (lookups were interrupted by a fault in versions up to 0.3.6 and work again from 0.3.7):

1. Open the popup and tap **Send**.
2. In the recipient field, type `@` followed by the handle (for example `@liviu`) instead of a `qor1…` address.
3. QoreX resolves the handle and shows you the **resolved address** before you sign anything - always check this against what you expect.
4. Enter the amount, check the [review screen](#send) and confirm.

Resolution is verified two ways before QoreX will use it: a registry attestation checked against a trust key built into the extension, and the handle owner's own signature over the claim. A response that fails either check is rejected outright - QoreX does not fall back to showing an unverified address. The first time you pay a given handle, QoreX remembers (pins) the address it resolved to; if that handle later resolves to a **different** address, QoreX stops and shows you both the old and new address in full so you can decide whether to continue. This memory lives **per browser** - paying the same handle for the first time from a different browser or computer shows it as new there too. That's expected, not an error.

## Receive {#receive}

Tap **Receive** in the popup. It **starts with the coin**:

1. **Choose the coin to receive** - a searchable list (**Search coin or network**) with QOR first, then each network's own coin and the bundled tokens, each with its picture and its network's picture. Tokens you [added by contract](#custom-tokens) are listed too. The pictures ship inside the wallet, so nothing is fetched from a third party to show them.
2. QoreX shows the address for that coin's network as a QR code with a copy button, and a warning that names the coin: send only that coin, on that network, to this address. Where one address works on several networks (the EVM networks), it says which.
3. **Choose another coin** takes you back to the list.

The supported networks are QoreChain, Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis and Celestia. An address for another network is derived from your recovery phrase, so it can need one confirmation to show. For Cosmos Hub, Osmosis and Celestia, QoreX shows the address that your sends on those networks sign from.

## History {#history}

Tap **History** on the popup home to see what happened on the account:

- **Every kind of QoreChain transaction**, not only sends: sent, received, staked, unstaked, stake moved, rewards claimed, stake locks, EVM window and key changes, with amount and fee. An EVM transaction also shows how much it took from the [EVM access window](#evm-window).
- **State, read from the chain.** A transfer sent from this device that the chain's history does not show yet is listed as **Pending: waiting for the network**. If the network cannot find it, QoreX says it may have failed, so check it before you send again (you can **Dismiss** the line). A failed transaction is marked, with the fee still paid.
- **Per account** - with several accounts, pick the account at the top.
- **Repeat payment** - fills the send form again from a past payment. You still review and confirm it.
- **Export CSV** - the file is made on your device and holds your history only (no phrase, no keys), and is made safe to open in a spreadsheet.

If the network cannot be reached, QoreX says it could not load the history; it never shows that as "no transactions". History covers QoreChain only for now. It is available on mainnet and testnet.

## Payment requests {#pay-requests}

Ask someone for an amount of QOR with a link that cannot be changed without it showing.

**Ask for a payment:**

1. Open **Payment requests** on the popup home and create a **New request**: the amount in QOR, an optional note (up to 140 characters) and, if you have one, whether to show your @handle.
2. Tap **Create link**. QoreX signs the request with your account key. Copy the link with **Copy link** and send it to whoever should pay.
3. **My requests** lists them. **Check status** reads the chain and shows **Paid** or **Not paid yet** (or that the network did not answer). **Reuse next month** makes a new request from an old one.

**Pay a request:**

1. Open **Pay a request**, paste the link and tap **Open**.
2. QoreX checks the signature, that the signer owns the receiving address, the exact network and any @handle on the request. A changed link, a wrong signer, an unknown network or a coin other than QOR is refused. If the request is for the other network, switch yourself; QoreX will not.
3. Tap **Pay**. You get the normal [review screen](#send) before anything is sent. The payment carries the request's tag in the memo, which is how the requester's QoreX finds it on chain.

A signed request needs no account and no sign-in. A testnet request says so: testnet QOR has no value. Link formats for developers are in [dApp integration](/qorex/dapp-integration).

## Contacts and favourites {#contacts}

**Contacts** on the popup home keeps names for the addresses you pay, **on this device only**.

- **Add contact** - a name and at least one address: QoreChain (`qor1…`), EVM (`0x…`), Solana or Cosmos, and an optional @handle. Mark it **Favourite** to see it as a one-tap chip on the send form. **Pay &#123;name&#125;** opens the form filled in. Deleting takes two taps. The list holds up to 200 contacts.
- **@handle contacts** show whether the handle points to the same address as when you last paid it, and warn you if its address **changed**.
- **Look-alikes** - an address that only looks like one you already know is flagged, with both shown so you can compare every character.

A contact is not a safety check: every payment still shows the full address for review.

## My money's protection {#protection}

**My money's protection** on the popup home is one screen where every line is checked when you open it, on your device and on the network. A check that cannot be read says so; it never counts as "fine" or "none".

- **Backup verified** and **Recovery tested** - the date, or **Not yet**. **Test my recovery phrase** asks for three words of your phrase. They are compared on your device; nothing you type is kept or sent.
- **Apps with permissions** - the sites that can see your address and ask you to sign, with **Revoke**.
- **Permissions given on the network** - grants that let another account send for you (authz) or spend your QOR on network fees (fee grants), unlimited ones first, with **Revoke**. Revoking shows what you are about to sign and the fee, then you confirm.
- **Token approvals on QoreChain's EVM** - tap **Check token approvals** (reading them needs your phrase once). QoreX says how far back it has checked; open the screen again to keep checking. **Revoke** sends `approve(spender, 0)` after opening a one-transaction EVM window limited to the token contract. Only an Ethereum-style (coin 60) account can revoke here.
- **Post-quantum protection, per lane** - in plain words: QoreChain native transactions carry two signatures (ML-DSA-87 and classical); EVM transactions are signed classically and admitted only inside a window you opened with your post-quantum signature; other networks accept classical signatures only.

Guardians and social recovery are in the mobile app. See [Security & Recovery](/qorex/security-and-recovery).

## Support and network status {#help-and-status}

- **Support** on the popup home lists the only official channels: the [Telegram community](https://t.me/QorechainCommunity), [Discord](https://discord.gg/qorechain), the [help page](https://qorechain.io/help/qorex), email to team@qorechain.io and **Report a vulnerability**. QoreChain staff never ask for your recovery phrase, password or keys. **Show summary** gives an optional diagnostic summary (app version, network and error codes, with no phrase, keys, addresses or balances) to copy only if support asks.
- **Network status banner** - QoreX reads the time of the chain's latest block. If it is more than a minute old, a banner says the network is slow and how old the block is; if the network cannot be reached, it says balances may be out of date. It shows nothing while the network is fine.
- **Last known values** - when the network does not answer, the popup shows the last balance and delegations it read and says from when.

## Stake from the extension {#stake}

Since **0.2.2**, the popup has its own staking screen - a wallet created only in the extension does not need the mobile app to earn staking rewards. Open **Stake QOR** on the popup home. It opens a **menu** with one line of explanation per action; each action opens its own screen, with its own error line, and **Back to staking** returns to the menu.

| Screen | What it does |
|---|---|
| **Stake QOR** | Pick a validator and an amount. Active validators are listed with their commission; **jailed** validators are left out. While you type, QoreX warns you if the amount would leave less than a transaction's fee (you could not unstake or claim until the account holds QOR again). |
| **Unstake** | Starts unbonding. The time before the QOR is yours to move is **read from the network**, and the amount appears under **Unstaking in progress** with the time left. |
| **Move stake** | Redelegate with no unbonding wait, in three steps: (1) the validator to move **from** (ones you cannot move out of yet are greyed, with the date), (2) the validators to move **to**, (3) **how much**, with **Max** and the route and split shown before you sign. A move the network would refuse is caught first. See [Move stake between validators](/qorex/portfolio-and-staking#move-stake). |
| **Claim** | Collects rewards. If the fee is larger than the rewards, the first tap warns you. |
| **Claim & restake** | Compounds rewards back to the validators that earned them in one transaction (up to 127 validators). QoreX checks first that your **unlocked** QOR can pay the fee, which is paid before rewards arrive. |
| **Lock for a bonus** | Lock part of your stake for 3, 6 or 12 months. See [staking locks](/qorex/portfolio-and-staking#staking-locks). |
| **Rewards go to** | Send future staking rewards to **another account of the same wallet**, and no other address. It shows where rewards go now, names the new account in full on the first tap and signs on the second. Your stake does not move. |

Under the menu, a **Staking, simply** card sets out the rewards earned so far, what staking costs (validator commission and network fees) and when unstaked QOR arrives. With several accounts, choose which one stakes from the account selector. Every action is signed with the mandatory hybrid signature (secp256k1 and ML-DSA-87), the same as a Send, and the screen says when your first transaction also registers your key. The yearly rate is read from the chain's own figure. Staking, delegation and rewards happen exclusively on the **Native** lane, never through an EVM precompile - see [Staking & Delegation](/user-guide/staking-and-delegation).

### Approving a Dashboard staking request {#stake-dashboard}

The QoreChain [Dashboard](/dashboard/staking-and-validators) composes staking requests but cannot sign them - your key never leaves the extension's vault. When you click **Continue in QoreX** on the Dashboard, the request opens in the extension for you to review (validator and amount) and approve, exactly like a Send.

:::note If a transaction shows as "downgraded" instead of successful
The Dashboard occasionally shows a transaction as **downgraded** rather than a clean success. This means your funds moved, but the ML-DSA-87 signature layer wasn't found on chain for that transaction - it is not something you did wrong and not something you can fix from your side. It's a fault on our side; please report it to support so we can investigate. The message stays on screen deliberately rather than clearing, so you have time to read and report it.
:::

### Send on external networks {#send-external}

Besides QOR on the Native lane, the popup's **Send on external networks** screen sends assets on other networks, all derived from the same recovery phrase. All the networks below can send and receive:

| Kind | Networks | Bundled tokens |
|---|---|---|
| EVM | Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche C-Chain | ERC-20 entries (USDC and USDT across the EVM chains, DAI on Ethereum) |
| SVM | Solana | SPL entries (USDC, USDT) |
| Cosmos | Cosmos Hub, Osmosis, Celestia | Noble USDC over IBC; optional memo field |

1. Choose the coin or token, then enter the recipient and the amount (and, on Cosmos networks, an optional memo).
2. Tick the acknowledgement. In English it reads: **"External networks accept only classical signatures. Unlike your QOR, this transfer has NO ML-DSA-87 signature. I understand."** External chains cannot carry an ML-DSA-87 signature, and QoreX never hides that.
3. On EVM networks the first tap quotes the **maximum network fee** ("Network fee: at most …"); the second sends with exactly that quote. Any edit throws the quote away. If the fee, paid in the coin you are sending, is larger than the amount, you are warned.
4. A recipient that only looks like an address you have already paid on that network is shown in full and needs one more tap.

## Supported wallet standards {#standards}

QoreX exposes three interfaces, all injected on the page as `window.qorex` (`{ evm, native, svm }`) and discovered through EIP-6963 and the Solana Wallet Standard. In a web app, the [wallet adapter](/developer-tools/wallet-adapter) wraps this detection.

| Standard | What it is | What it means for you as a dev |
|---|---|---|
| **EIP-1193** | The Ethereum provider JavaScript API (`request(...)`, events). | Besides account and network queries (`eth_requestAccounts`, `eth_accounts`, `eth_chainId`, `wallet_switchEthereumChain`), QoreX signs `personal_sign`, `eth_signTypedData_v4` and `eth_sendTransaction` on QoreChain's EVM lane (chain id 9801, testnet 9800) and on Ethereum. Each approval says, decoded on your device, what is being authorised, and simulates the transaction first where it can. On QoreChain, only Ethereum-style (coin 60) accounts can send, and a transaction needs an [EVM access window](#evm-window). See [dApp integration](/qorex/dapp-integration). |
| **EIP-6963** | Multi-wallet provider discovery (announce / request events). | QoreX announces itself alongside every other wallet - it **never overwrites `window.ethereum`** - so the user picks QoreX per site with no conflicts. |
| **Native provider (Keplr-style)** | `window.qorex.native`: `enable`, `getKey`, `signAndBroadcast`, `signDirect`, `getOfflineSigner` (for cosmjs, cosmos-kit and Interchain Kit), `signArbitrary` / `verifyArbitrary`, plus a `capabilities` list. It is **not** a Keplr drop-in: QoreX does not alias `window.keplr`, and amino signing and `sendTx` are not available. | The simplest way to send a QoreChain transaction is **`signAndBroadcast`** (see [Sending a QoreChain transaction](#sign-and-broadcast)): QoreX shows the decoded messages and fee, adds the ML-DSA-87 layer that only the wallet can make, and broadcasts. With `signDirect` or `getOfflineSigner`, QoreX checks a layer your page attached against the account's registered key, or adds the layer itself when there is none. See [dApp integration](/qorex/dapp-integration). |
| **Solana Wallet Standard** *(from 0.1.5)* | Native wallet discovery for Solana dApps (`wallet-standard:register-wallet` / `app-ready`). | Solana dApps **auto-detect QoreX** - no custom integration. Features: `standard:connect`, `standard:disconnect`, `standard:events`, `solana:signMessage`, `solana:signTransaction`, `solana:signAndSendTransaction`; chain `solana:mainnet`; both `legacy` and `v0` transactions. |

:::note Reaching the SVM lane directly
The same interface is also available on `window.qorex.svm` (`connect` / `signAndSendTransaction` / `signMessage`). Wallet-Standard auto-discovery and the fully implemented SVM lane shipped in **0.1.5** and are live on both Chrome and Firefox (see [which version is live where](#versions)).

Solana approvals show **one line per instruction**, decoded where QoreX can: SOL transfers (recipient and lamports), SPL token transfers, **"ALLOW SPENDING of your tokens"** (approve), **"HAND OVER control of the account"** (set authority) and closing a token account - and say "instruction QoreX cannot read" for anything else, with the program. A request that includes an approve or set-authority instruction is headlined "wants authority over your Solana tokens - read every line below". Transactions that do not list your wallet as a signer are rejected, `signMessage` will not sign bytes that are really a transaction, and the signature is marked **classical**. See [Hybrid signing](#pqc).
:::

## Coins and tokens {#custom-tokens}

The popup's **Coins and tokens** screen lets you add an **ERC-20 token by its contract**: pick the network, paste the contract address, **Check contract**. QoreX reads the token's name and decimals from the contract itself - and reads it again in the background when you add it, rather than trusting the popup - then shows them with a reminder that anyone can create a token with any name. The token then appears in **Send on external networks** and on [Receive](#receive). It refuses bundled tokens, duplicates, non-EVM networks, bad addresses, unreadable contracts and contracts that borrow the name of a bundled token.

## Connected sites {#connected-sites}

**Connected sites** in the popup lists every site this wallet has approved - a site can see this wallet's address and ask you to sign. Tap **Revoke** to remove one. Approvals are kept **per wallet**: a site approved for one wallet cannot read another wallet's address after you switch.

## EVM access window {#evm-window}

The popup's **EVM access window** screen opens and closes the window that lets an Ethereum-style (coin 60) account send on QoreChain's EVM lane (v3.2.0 and later), with the same limits as in the app: up to 17,280 blocks and 1,000 transactions, and a QOR spending cap that counts all QOR leaving the account, plus each maximum fee. Tokens are not counted against the cap.

1. Choose how long (blocks), how many transactions and the spending cap.
2. Choose **What the window admits**:
   - **QOR transfers only (recommended)**, the default: no contract calls, no new contracts and no recipient that is a contract;
   - **Any contract**: any contract can be called, and the screen warns that tokens, NFTs and approvals moved by a contract are not limited by the window. If the network cannot limit a window to QOR transfers, QoreX asks you before it opens one for any contract; if you say no, nothing is opened.
3. Tap **Open the window**. The open window says exactly what it admits. **Close the window** ends it.

A window you opened with **QOR transfers only** does not let a site call a contract. A site's own transaction can have QoreX open a window for exactly that transaction from its approval, which names every contract the window would admit and says that it replaces any open window.

A coin-118 account cannot use the EVM lane; the screen lists the three steps to take and has a button to **Your accounts**. Only your own wallet screens can open, close or clear a window; a site cannot. See [EVM access window](/qorex/security-and-recovery#evm-window).

## Post-quantum key care and multisig {#pqc-care}

**Register key again (repair).** If the account's post-quantum key record on the network can no longer sign (it is empty, classical only or otherwise unusable), the popup home shows a card. Tapping **Register key again** shows the network fee; tap again to register. QoreX never does this on its own. If the account has an EVM window, the network closes it, so open a new one afterwards.

**Rotate post-quantum key.** The **Rotate post-quantum key** button replaces the account's ML-DSA-87 key on the network with the next key derived from your recovery phrase. Tap twice; the fee is shown in the result. Rotation protects you if the post-quantum key alone was exposed; it does **not** help if your recovery phrase was exposed. Afterwards, other wallets that use the same phrase cannot sign for this account until they support rotated keys, and the network closes the account's EVM window. QoreX finds the right key when you restore from the phrase.

**Multisig accounts.** **Multisig accounts** manages accounts that need several members to sign, with a post-quantum signature from each member as well as a classical one. QoreX uses the same files as the QoreChain command line, so each member can sign in QoreX or in the command line.

1. **Create a multisig** from member addresses (each must have sent at least one transaction), the number of signatures needed and an optional name, or **Add an existing multisig** by pasting its key.
2. The screen shows the balance and the state of each member's key. **Prepare the registration** of the post-quantum member set first; until it is registered the account cannot send. Then **Prepare a send**.
3. In the extension, files are downloaded and opened. **Round 1:** members add post-quantum signatures; combine them. **Round 2:** the agreed members sign classically. Then **Send to the network**.
4. Signing takes two taps, and you review what you are signing first. QoreX warns you if the transaction registers an authenticator, because an authenticator can move the multisig's funds without the other members' signatures.

## Developer tools {#developer-tools}

Developer mode is off by default. To turn it on in the extension, tap the **version number** at the bottom of the popup seven times. A developer section appears at the bottom of the popup home with **Developer tools** (the `</>` button), **Switch to testnet (diana)** (or **Switch back to mainnet**) and **Turn off developer mode**.

**Developer tools** opens one page with the tools grouped as **Inspect**, **Transactions**, **Contracts and rollups**, **Other virtual machines** and **Signing and agents**. There are 17 tools, the same as in the app; on the testnet, **Solana on QoreChain** is also listed among them. Developer mode changes no signing rule: anything that signs still shows what it signs and waits for your approval. Each tool is described in [Developer mode](/qorex/developer-mode).

The **AI agents** tool lets an AI assistant on your computer read what you allow and **propose** a transaction. QoreX checks and simulates every proposal, and you approve or reject it in the normal approval window; no agent can sign. In the extension it needs a companion program on your computer that **is not yet published**, and it is not available in Safari.

On the **testnet** only, the popup home also offers sending to another chain over IBC and the QoreChain Bridge screen; neither is offered on mainnet. See [Testnet features](/qorex/testnet-features).

## Language {#language}

The extension speaks the same ten languages as the mobile app, dashboard, and site: English, Romanian, German, Spanish, French, Italian, Turkish, Arabic, Japanese, and Korean. It follows your **browser's** language by default (falling back to English for anything else) - note this is a different source than the mobile app, which follows the **phone's** language, so the two can show different languages if your phone and browser are set differently. A picker on the popup's idle screen lets you override the detected language at any time; switching to Arabic flips the popup to right-to-left immediately, not just the text.

## Security & permissions {#security}

QoreX is built to be verifiable, not just trusted:

- **Vault** - your keys are sealed with **AES-256-GCM**. The password path derives its key with **Argon2id** (RFC 9106, memory-hard: 64 MiB, t=3, p=1), so a copied vault blob is slow to brute-force on GPU or ASIC hardware. (Legacy PBKDF2 blobs remain openable and re-seal to Argon2id on next unlock.)
- **Passkey unlock (optional, from 0.1.5)** - where your authenticator supports the **WebAuthn PRF** extension, QoreX can unlock the vault from the passkey's 32-byte PRF output instead of a typed password. Your password always remains a fallback.

  :::note Where passkey unlock appears
  QoreX feature-detects WebAuthn and only shows **Enable passkey unlock** where the browser exposes it to extension pages - that is **Chrome and Edge**. On **Firefox** the option is hidden, because Firefox does not expose WebAuthn to extension pages. This is expected, not a bug.
  :::
- **Auto-lock** - QoreX locks itself after a while without use (15 minutes by default) and has a **Lock** button. See [Unlock and auto-lock](#unlock).
- **Manifest V3 + strict CSP** - `script-src 'self'; object-src 'self'; base-uri 'self'`. There is **no remote code loading** after install and no `wasm-unsafe-eval`.
- **No analytics, no crash reporting, no tracking SDK, no sign-up** - the extension needs no account to hold, send or stake QOR. Your keys, recovery phrase, vault and approvals never leave the browser. It does make network requests: to the public QoreChain endpoints for balances, history and broadcasting (these carry your public `qor1…` address), a price lookup (no address), the public services of any external network you hold or view (your public address on that network), and the @handle registry (the handle, or a public address). Only if you use [Dashboard pairing](#dashboard-bridge) does it send a signed proof that you own the address. See [What QoreX sends over the network](/qorex/overview#data-and-privacy).

### What permissions QoreX asks for, and why {#permissions}

This section exists because the Firefox listing surfaces the permission **"Access your data for all websites"**, which can look at odds with a wallet that declares no host permissions. Here is the exact, unedited truth from the manifest.

The extension's `manifest.json` declares:

```json
"permissions": ["storage", "nativeMessaging"],
"host_permissions": [],
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["dist/content.js"], "run_at": "document_start" }
],
"web_accessible_resources": [
  { "resources": ["dist/inpage.js"], "matches": ["<all_urls>"], "use_dynamic_url": true }
]
```

- **`storage`** - stores the encrypted vault, your per-origin connection approvals and your wallet's own settings and lists (such as contacts) **locally**, in extension storage.
- **`nativeMessaging`** - new in 0.4.5, used only by the Developer mode [AI agents](#developer-tools) tool, to talk to a companion program on your own computer (not yet published). QoreX opens that connection only after you turn on **Allow AI agent connections on this computer** in that tool. The **Safari** package does not declare this permission.
- **`host_permissions: []`** - QoreX declares **no** host permissions. It does not request the ability to make cross-origin network requests to arbitrary sites on your behalf.
- **`web_accessible_resources`** - lets pages load QoreX's own `inpage.js`, the small script that exposes the provider. `use_dynamic_url` gives it a per-session address so sites cannot fingerprint the extension by probing for it.
- **`content_scripts` matches `<all_urls>`** - this is the honest reason Firefox says *"Access your data for all websites."* QoreX injects a small provider script (`content.js` → `inpage.js`) into **every page**. A content script that runs on all sites *can* technically read the page, and browsers describe that capability with that exact wording - whether it comes from `host_permissions` or from a content-script match.

**Why the content script runs everywhere.** So that **any** dApp can discover the wallet through EIP-6963 without you first granting per-site access. This is how MetaMask, Keplr, Phantom and every other injected wallet work: the injected provider must be present before the page's scripts run (`document_start`), on whatever site you visit.

**What that script does - and does not do.** It only bridges wallet messages (announce the provider, forward connect/sign requests to the service worker, return the result). It does **not** read page content beyond those wallet requests, send anything to a server, or load remote code - and it can't fetch arbitrary cross-origin data because there are no host permissions. All of this is verifiable: the extension is CSP-locked and ships no analytics, and its manifest (above) is readable in the installed package.

## Connect a dApp to QoreX {#connect}

A dApp discovers QoreX through **EIP-6963** (announce the request, pick the wallet whose `rdns` is `network.qore.qorex`) and then uses the returned EIP-1193 provider; for the QoreChain **Native** lane it uses `window.qorex.native`, and it reads `capabilities` to see what this build supports. QoreX never sets `window.ethereum` or `window.keplr`. The complete developer guide, with code, is on its own page: [Integrate a dApp with QoreX](/qorex/dapp-integration) (see [Detect QoreX](/qorex/dapp-integration#detection) and [Connect](/qorex/dapp-integration#connect)). In a web app, the [wallet adapter](/developer-tools/wallet-adapter) wraps this detection for you, and the [QoreX developer kit](/developer-tools/qorex-integrations) covers app-side integration. (`@qorechain/connect` is deprecated; do not start new work on it.)

Approvals are **per-origin**: the first connection to a site opens an approval popup showing the origin, approving reveals only your public address, and one site's approval grants nothing to another. Approvals are kept per wallet, persist until you revoke them under **Connected sites**, and one site can have one request waiting (three in all); switching wallet or locking answers waiting requests with "no". From 0.4.5, a site's signing request made while QoreX is locked opens the password screen, naming the site, and shows its approval after you unlock; closing the window refuses it. See [What the approval window shows](/qorex/security-and-recovery#approvals).

### Dashboard bridge (v0.1.5, extended in v0.2.2) {#dashboard-bridge}

Version 0.1.5 adds a bridge scoped to **`dashboard.qorechain.io` only**: `window.qorex.native.connectProof(sessionId)` signs the *Connect with QoreX* pairing proof (the backend re-verifies the signature), and `executeTransfer({ to, amountUqor, memo })` approves and broadcasts a Dashboard-proposed QOR transfer, returning the `txHash`. These methods are refused on any other origin.

**0.2.2** adds `native:executeRequest`, which accepts a whole Dashboard-proposed request - including [staking](#stake-dashboard) - validated against the same shared parser QoreX uses everywhere else: refused on a network mismatch, a foreign origin, an address that isn't yours, an unknown request kind, or a staking request that carries a `toAddress` (staking requests don't have one). The request kinds are send, delegate, undelegate, redelegate and claim; a Connect request lets you choose which of your accounts to link, and `listAccounts()` returns your accounts (read-only).

Because a `qor1…` address is equally valid on mainnet and testnet, a Dashboard-proposed request states which network it targets, and QoreX refuses to act on it if that doesn't match the network the extension is currently connected to - it will never switch networks on a request's behalf.

## Sending a QoreChain transaction from a dApp: `signAndBroadcast` {#sign-and-broadcast}

Every QoreChain native-lane transaction from an account with a registered ML-DSA-87 key needs a hybrid signature - secp256k1 **and** ML-DSA-87 - and only the wallet holds the ML-DSA key, so a page cannot build it. A dApp sends the messages with `window.qorex.native.signAndBroadcast({ chainId, messages, memo?, gasLimit? })`; QoreX shows the decoded messages and fee, builds the transaction for the account you selected, adds the hybrid signature (registering the account's ML-DSA-87 key first if this is its first transaction), broadcasts, and resolves with `{ txHash, code, height?, shield }`. Available from extension **0.3.5**.

- The chain must be the wallet's active network (`qorechain-vladi` on mainnet). A dApp cannot switch the network; only you can.
- 1-32 messages per call; the fee is shown before approval; wallet-only messages such as ML-DSA-87 key management are refused.
- cosmjs, cosmos-kit and Interchain Kit work through `getOfflineSigner` (from 0.4.0), where QoreX adds the ML-DSA-87 layer and the fee that goes with it.
- `signArbitrary` signs a message with the account's classical key and ML-DSA-87 (from 0.4.0).

Rules, gas, errors and the full code samples are in [Integrate a dApp with QoreX](/qorex/dapp-integration#sign-and-broadcast).

## Hybrid signing {#pqc}

Every native QOR transfer QoreX itself initiates is signed twice: with a classical secp256k1 key and with **ML-DSA-87** (FIPS 204), using the hybrid pipeline in `@qorechain/sdk`. **There is no toggle**: QoreChain requires it and QoreX never sends a Native-lane QOR transfer without it.

- **dApp-initiated Native signing** - use [`signAndBroadcast`](#sign-and-broadcast): QoreX decodes every message, shows the fee, and adds the ML-DSA-87 layer itself. `signDirect` and the cosmjs signers (`getOfflineSigner`) sign a transaction the page built; when it carries no ML-DSA-87 layer QoreX adds one, and a layer the page attached is checked against the account's registered key before any approval window (accounts imported from MetaMask use `signAndBroadcast`). QoreX never blind-signs: a request it cannot decode is refused, and it never signs a classical-only QoreChain transaction. See [Integrate a dApp with QoreX](/qorex/dapp-integration#cosmjs).
- **Classical signatures are always labeled** - transfers on external networks (ETH, BNB, Solana, …) cannot carry an ML-DSA-87 signature; QoreX makes you tick an explicit acknowledgement and marks them classical rather than silently downgrading.

**What this means for transaction size.** ML-DSA-87 is a large signature: the signature is **4,627 bytes** and the public key **2,592 bytes** (fixed by FIPS-204). A hybrid QoreChain transaction is therefore several kilobytes larger than a purely classical one. If you build and broadcast transactions yourself, size your buffers and fee estimates for the extra bytes; QoreChain's gas accounting already expects them. See [Post-Quantum Signing](/developer-guide/post-quantum-signing) (the developer guide) for the primitives and the deterministic-signing requirement.

## Where it is published {#where-published}

| Store | Listing | Current version | Link |
|---|---|---|---|
| Chrome Web Store | **QoreX** | 0.4.5 | [chromewebstore.google.com](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) |
| Firefox Add-ons | `qorex` | 0.4.5 | [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/qorex/) |
| Mac App Store (Safari) | **QoreX Wallet**, app 1.8.1 | extension 0.4.3 | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6794132220) |

The QoreX source code is not public. The store listings always show the current version.

## Limits and known issues {#limits}

- **EVM signing has limits.** The provider signs `personal_sign`, `eth_signTypedData_v4` and `eth_sendTransaction` (QoreChain, and Ethereum per site) and refuses other signing methods. On QoreChain only accounts imported from MetaMask can send, an EVM transaction needs an authorisation window (the approval opens one for that transaction), and it carries a secp256k1 signature only. See [Integrate a dApp with QoreX](/qorex/dapp-integration#evm).
- **`window.qorex.native` is Keplr-style, not a Keplr drop-in.** There is no `window.keplr` alias. `signAmino` and `sendTx` are absent: Amino is refused with code `4200`. `getOfflineSigner` and `signDirect` work, and QoreX adds the ML-DSA-87 layer when the page brings none. `signArbitrary` and `verifyArbitrary` (message signing) work from 0.4.0. A dApp cannot switch the network, and wallet-only messages (key management, spending rules, EVM windows, certain grants) are refused from any site.
- **Mobile only:** Portfolio, Q-Day Scanner, social recovery, Legacy, sign-in, device linking and claiming an @handle.
- **No Swap screen** in the extension.
- **Passkey unlock** is offered only where the browser exposes WebAuthn to extension pages (Chrome and Edge); on Firefox it is hidden.
- **Safari** opens approvals in a browser tab rather than a popup.
- **External networks** accept classical signatures only; QoreX makes you acknowledge this before each transfer.
- **Testnet only:** sending to another chain over IBC, the QoreChain Bridge screen and Solana on QoreChain. See [Testnet features](/qorex/testnet-features).
- **AI agents** need a companion program that is not yet published, and are not available in Safari.
- **History** covers QoreChain only for now.
- The extension's vault lives only in this browser. Removing the extension, clearing its data or resetting the browser deletes your keys; only your written 24 words restore them.
