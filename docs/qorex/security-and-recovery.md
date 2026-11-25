---
slug: /qorex/security-and-recovery
title: Security & Recovery
sidebar_label: Security & Recovery
sidebar_position: 5
---

# Security & Recovery

This page explains how QoreX protects your keys and how you get a wallet back: the one-screen protection check, the ML-DSA-87 key and its care, multisig accounts, social recovery, Legacy, device linking, the EVM access window, what approvals show, auto-lock, the Q-Day Scanner and where to get help. It is for every QoreX user; most of the recovery tools are in the mobile app, and the text says where something differs in the browser or Safari extension.

## Innovations {#innovations}

- **My money's protection.** One screen that checks your backup, your connected sites, the permissions you gave on chain and your token approvals, live, and lets you revoke. See [My money's protection](#protection).
- **Post-quantum key care.** Rotate the ML-DSA-87 key from your recovery phrase, repair a record that can no longer sign, and run a post-quantum multisig. See [Rotate the key](#pqc-rotation), [Repair](#pqc-repair) and [Multisig accounts](#multisig).
- **Social recovery with encrypted shares and a recovery kit.** Guardians hold shares sealed with ML-KEM, split 2 of 3, and need your recovery kit to restore the wallet. A recovery runs a 48-hour timelock and alerts you; you can cancel, and a cancel can only delay, never move funds.
- **Legacy.** A dead-man's switch over your guardians, for a beneficiary you choose.
- **Device linking.** A one-time code and a QR, never on the same screen. The QR alone is ciphertext behind a memory-hard key derivation.
- **Deterministic ML-DSA-87 key.** Derived from your recovery phrase (the first key is `SHAKE256("qorechain:pqc:v1|" + address + "|" + mnemonic)`, and rotated keys are derived from the same phrase), so the key needs no separate backup. See [QoreSign](/qoresign/overview).
- **Bounded EVM access.** An EVM transaction is admitted only while an access window is open, limited by transaction count, value and expiry, and a window you open yourself admits QOR transfers only unless you choose otherwise.
- **Approvals that refuse what they cannot read.** See [What the approval window shows](#approvals).
- **Q-Day Scanner.** An exposure report for any Bitcoin or Ethereum address.

## How to use and where to find it {#how-to-use}

Most of what follows lives in **Settings → Security** in the mobile app; **My money's protection** and **Support** are in **Settings**. In the browser and Safari extensions the popup's home screen has buttons for the EVM access window, Connected sites, Reveal recovery phrase, Rotate post-quantum key, Multisig accounts, My money's protection and Support, plus the auto-lock setting. Social recovery, Legacy, device linking and the Q-Day Scanner are mobile only. QoreX is free and needs no account for any of this; see the [overview](/qorex/overview#how-to-access) for the store links.

The Home tab also shows a **Backup health** card that keeps warning until social recovery is set up. The card tracks social recovery only: it cannot tell whether you have written your recovery phrase down, so do that yourself (see below).

## My money's protection {#protection}

One screen that answers "is my money safe, and who can act for me?". App: **Settings → My money's protection**. Extension and Safari: **My money's protection** on the popup's home screen. Every line is checked when you open it, on this device and on the network; nothing is assumed. When something cannot be read, QoreX says *"Could not be read right now. This does not mean there are none."*

| Line | What it checks | What you can do |
|---|---|---|
| **Backup verified** and **Recovery tested** | whether you have proved you hold your recovery phrase, and when | **Test my recovery phrase**: type three words of your phrase. It is a dry run: they are compared on this device, nothing you type is kept or sent, and nothing is restored or changed. Wrong words record nothing |
| **Guardians (social recovery)** | whether guardians are set up, how many, and how many are needed | set them up in [Social recovery](#social-recovery) |
| **Apps with permissions** | sites that can see your address and ask you to sign (in the app, the in-app dApp browser's sites; in the extension, connected sites) | **Revoke** any site |
| **Permissions given on the network** | standing **authz grants** and **fee grants** your account gave to others, read from the chain, unlimited ones first, with end dates | **Revoke**: QoreX shows a review with the network fee, then signs the removal with your hybrid signature |
| **ERC-20 token approvals** | spenders allowed to move your tokens on **QoreChain's EVM** | **Revoke**, which sends `approve(spender, 0)` |

**About token approvals.** In the app, tap **Check token approvals**; reading them uses this wallet's Ethereum address, which needs your phrase once. They are read in ranges the node accepts, so the screen can say *"Token approvals checked back to block \{from\}. Older ones may exist: open this screen again to keep checking."* To revoke, QoreX first opens a **one-transaction EVM window**, signed with your post-quantum key and limited to the token contract, then sends the EVM transaction, which is signed with your classical key. Only an Ethereum-style (coin 60) account can send on QoreChain's EVM, so a coin-118 account cannot revoke an EVM approval here, and QoreX says so.

**Post-quantum protection, per lane.** The screen explains plainly which signatures protect what:

- **QoreChain (native):** every transaction carries two signatures, a post-quantum one (ML-DSA-87) and a classical one, and the network checks both.
- **QoreChain EVM:** EVM transactions are signed classically, like in every EVM wallet. The network admits them only inside a [window](#evm-window) you opened with your post-quantum signature, within the limits you chose.
- **Other networks (Ethereum, Solana, Cosmos):** they accept classical signatures only. QoreX cannot add post-quantum protection there.

## Back up now - nobody can recover a lost wallet for you {#back-up-now}

:::danger Read this before you fund your wallet
QoreX is **non-custodial**: your keys exist only on your own device, and QoreChain Association has no copy of them, no master key, and no way to reset or restore your wallet. **There is no "forgot password" flow, no support ticket, and no customer-service override** - if you lose access to your keys with no backup in place, the funds are gone, permanently and irreversibly. This is true of every non-custodial wallet, not a QoreX limitation, but it is worth stating plainly.

**Do at least one of these - right after you create your wallet, not later:**

1. **Write down your 24-word recovery phrase** and store it somewhere offline and durable (not a screenshot, not a note synced to the cloud, not a message to yourself). It is the only thing that can restore your wallet on any device, at any time - on mobile, reveal it from **Settings → Security → Reveal recovery phrase** (the app does **not** show it while it creates the wallet, so you have to go and get it - do it straight away); in the extension it is shown once when you create the wallet, and any time from **Reveal recovery phrase** in the popup. See [Restore an existing wallet](/qorex/getting-started#2-restore-an-existing-wallet).
2. **Set up [social recovery](#social-recovery)** with guardians you trust. This lets you recover your wallet even if you lose the phrase, without any single guardian ever being able to access your funds alone.

Doing both is the safest option - the phrase covers you if you switch devices or the app is unavailable; guardians cover you if you lose the phrase itself.

**Uninstalling the app deletes your keys from that device.** The mobile app's vault and the browser extension's vault each live only on the device that created them. Uninstalling the app, resetting the phone, or removing/clearing the extension deletes that copy - with no backup and no linked device, your wallet cannot be recovered by anyone, including QoreChain. **Removing a wallet from a phone or a browser** (Settings → Wallets → *Remove from this phone*, or *Remove from this browser* in the extension) deletes that wallet's key from the device in the same way - your funds stay on chain, but only its recovery phrase can bring it back.
:::

## ML-DSA-87 key {#pqc-key}

The **Security** screen shows the live on-chain state of your ML-DSA-87 key: **"Registers with your first transfer"** → **"Registered on-chain ✓"**. The algorithm is **ML-DSA-87** (deterministic, hybrid with secp256k1).

Websites cannot ask QoreX to register, migrate or rotate your ML-DSA-87 key. Registration happens by itself with your first transfer and needs nothing from you - since v3.2.3 the chain also accepts an optional *proof of possession* with the registration, which QoreX handles invisibly in current store builds. You can also [rotate the key](#pqc-rotation) yourself, or [repair](#pqc-repair) a record that can no longer sign. See [Key rotation](/developer-guide/post-quantum-signing#key-rotation) for the underlying mechanism.

### Repair a key that can no longer sign {#pqc-repair}

In rare cases the key record that the network holds for your account is **empty, classical only or degenerate**, so nothing can be sent from the account. QoreX tells the two cases apart: a key registered by **another wallet** is reported as such, while a record that **can no longer sign** gets a repair card on the **Home** screen (app) or the popup's home screen (extension and Safari).

1. Read the card: *"This account's post-quantum key on the network can no longer sign, so nothing can be sent from it. Registering the key again fixes it."* It shows the network fee, **0.09 QOR**, and says that if the account has an EVM window, the network closes it (open a new one afterwards).
2. Tap **Register key again**.
3. Tap again (*Tap again to register (fee 0.09 QOR)*). In the app, confirm with biometrics.

The repair is **never automatic**: two taps are always needed. It sends only the key registration, signed with your classical key. Afterwards QoreX says *"The key is registered again. This account can send again."*

### Rotate the post-quantum key {#pqc-rotation}

**Rotate post-quantum key** replaces the account's ML-DSA-87 key on the network with the **next key derived from your recovery phrase**. App: **Settings → Security → Rotate post-quantum key**. Extension and Safari: the **Rotate post-quantum key** button on the popup's home screen. Tap, then tap again to confirm (*Tap again to rotate the key*); the app also asks for biometrics. The transaction is signed by both the current and the new key, and the network fee, taken from a simulation, is shown in the result.

- **It protects against** a leaked post-quantum key.
- **It does not protect against** a leaked recovery phrase. Whoever has your phrase can derive every one of these keys. In that case, move your funds to a new wallet with a new phrase.
- **Other wallets that use the same phrase** cannot sign for this account until they support rotated keys.
- **The network closes the account's EVM window.** Open a new one if you need it.
- **Restoring still works.** QoreX looks through the keys your phrase can derive for the one the network holds, so a restored wallet signs with the rotated key.

Rotation is never automatic, and websites cannot ask for it.

## Multisig accounts {#multisig}

A **multisig account** needs several members to sign. QoreX supports the post-quantum multisig on mainnet and testnet, using **the same files as the QoreChain command line**, so each member can sign in QoreX or in the command line tool. App: **Settings → Security → Multisig accounts**. Extension and Safari: **Multisig accounts** on the popup's home screen.

**Create or add one**

1. **Create a multisig:** enter the member addresses (`qor1...`), one per line, the number of signatures needed (the threshold) and an optional name, then **Save**. Each member must have sent at least one transaction.
2. Or **Add an existing multisig:** paste the multisig key (the output of the command line's `keys show <name> -p`, or a key shared from QoreX). **Share the multisig key** sends it to the other members.

**Check its status.** The account screen shows the balance, whether the **post-quantum member set** is registered (and its version), whether the account in use is a member, and, for each member, whether their key is ready, missing, no longer able to sign, registered without proof, or could not be checked. Until the member set is registered, the account cannot send.

**Sign in two rounds**

1. **Prepare the registration** (first, once) or **Prepare a send**. QoreX takes gas from a simulation and creates a file. In the extension and Safari the file is **downloaded**; in the app it is **shared as text**. Send it to the other members.
2. **Round 1.** Each post-quantum member opens the file (**Open files from members**), reviews it and chooses **Sign as a post-quantum member**. In the app, members **paste** the text they received; in the extension they open the file.
3. **Combine** the member signatures.
4. **Round 2.** The members who sign classically are chosen (exactly the threshold number, the same choice for all of them), and each reviews and chooses **Sign classically**. Combine again.
5. **Send to the network.**

Every signing step shows what you are signing first and needs **two taps**; the app also asks for biometrics. If a transaction would register an **authenticator**, QoreX warns you: an authenticator can move the multisig's funds without the other members' signatures. To sign other kinds of transaction offline from a file, see the offline and multisig workspace in [Developer mode](/qorex/developer-mode).

## Social recovery {#social-recovery}

Social recovery lets trusted **guardians** help you restore your wallet without ever seeing your recovery phrase.

- Your seed is split into **encrypted shares** (sealed with ML-KEM): by default three, of which any **two** can help you recover (a 2-of-3 threshold scheme); one alone cannot.
- Each guardian receives a credential.
- **The recovery kit.** The encrypted copy of your seed is your **recovery kit** (it starts with `qorexkit1:`), which you keep. Guardians alone cannot restore the wallet: they also need this kit, and the kit alone is useless without them. New setups send the recovery service only the number of guardians and the threshold. See [Recovery kit](#recovery-kit).
- A recovery requires the threshold of guardians to approve, then runs a **48-hour timelock** and sends a **cancel alert** to you, so a malicious attempt can be stopped.

**Set it up:** Home → **Set up recovery** (or Settings → Security → Social recovery) → **Create guardian credentials**. QoreX creates three credentials - *Guardian 1*, *Guardian 2* and a *Printable backup* - and any **2 of the 3** can help you recover. Give one to each trusted person or device and keep the printable backup somewhere safe. Then save the recovery kit, as described below. The Backup health warning clears once setup is done.

### Recovery kit {#recovery-kit}

At the end of setup QoreX shows your **recovery kit**. Use **Copy the recovery kit** or **Share or save**, and keep a copy somewhere you control and **not only on this phone** (a password manager, a note, a printout). You have to tick *I saved the recovery kit somewhere off this phone* before **Done** works. To recover, paste the **recovery ID or recovery kit**.

If you set up social recovery with an earlier version, QoreX may tell you that an encrypted copy of your kit is still on the recovery service. Save the kit, then choose **Remove the copy from the relay**. Your guardians' credentials keep working. After removal, only you hold the kit.

**Approve someone else's recovery:** if you are a guardian for someone, use **Help recover** on the Home tab to approve their request.

## Legacy Protocol {#legacy}

**Legacy Protocol** is a dead-man's switch over your guardians: your assets can pass to your chosen beneficiary if you become unreachable. It is optional and configured from Settings → Security.

## Link a new device {#link-device}

Move your wallet to a second phone or tablet with **no server and no typing** of the 24 words:

1. **New device** → onboarding → **Link from another device**. It shows a one-time **10-character code** and opens the camera.
2. **Old device** → Settings → Security → **Link a new device** → type that code → confirm with biometrics. A **QR code** appears (your seed sealed with a key derived from the code: scrypt N=2¹⁷ → AES-256-GCM).
3. **New device** scans the QR → it decrypts locally → same wallet, same addresses.

**Why a photo of the QR is not enough:** the code and the QR never appear on the same screen. A photo of the QR alone is ciphertext behind a memory-hard key-derivation function, and both artifacts are one-time and disappear with the screens. A wrong code gives a clean error - just retry.

:::note
Device linking is a **convenience**, not a recovery method. Your 24-word phrase and social recovery are your real safety nets.
:::

## EVM access window {#evm-window}

From chain **v3.2.0**, a transaction on the **EVM lane** - for example one you sign in MetaMask against QoreChain's EVM network - is admitted only from an account that has a **registered ML-DSA-87 key** *and* an **open authorisation window** (a hybrid-signed `MsgOpenEVMWindow`). The EVM transaction itself carries a secp256k1 signature only. The explorer labels such a transaction "Authorised by a PQC window". Opening a window is a QoreChain Native-lane message that MetaMask cannot produce, so QoreX is where you open it. QoreX's own sends use the Native lane and never need a window.

**Who needs it.** A window is for **Ethereum-style (coin 60) accounts** - the accounts you add with *Add an Ethereum account (coin 60)* for a phrase first used in MetaMask (see [Restore a phrase from MetaMask or the Dashboard](/qorex/getting-started#restore-dashboard)). MetaMask signs with an Ethereum key, which is the key of a coin-60 account; no MetaMask key can send from an ordinary coin-118 `qor1…` account, so a window opened on one achieves nothing and only costs the fee.

If you are on an account that cannot use a window, the screen lists the steps to take and has a button to **Your accounts**.

There are two ways a window gets opened: **you open it yourself** (below), or [QoreX opens one for a single transaction](#per-transaction-windows) when a site asks you to approve it.

Open it in the app at **Settings → Security → EVM access window**, or with the **EVM access window** button in the extension popup. First choose **what the window admits**:

- **QOR transfers only** (default, recommended): no contract calls, no new contracts, no recipient that is a contract.
- **Any contract:** a separate choice, with a warning: *"Any contract can be called. The spending cap counts QOR only: tokens, NFTs and approvals moved by a contract are not limited by the window."*

If the network cannot limit a window to QOR transfers, QoreX says so and asks whether to open it for any contract instead. Nothing opens until you say yes to exactly that.

Then you choose:

| Field | Meaning | Limit |
|---|---|---|
| **How long (blocks, max 17280)** | how long the window stays open | up to 17,280 blocks (about 15 hours on mainnet) |
| **How many transactions (max 1000)** | how many EVM transactions it admits | up to 1,000 |
| **Spending cap, QOR** | the most QOR it lets leave | counts **all QOR leaving this account, plus each maximum fee**; tokens are not counted |

On this screen you cannot name particular contracts; windows limited to specific contracts are opened by QoreX for a single transaction (below). The defaults are 300 blocks (about 16 minutes on mainnet), 5 transactions and 1 QOR. Opening costs a normal network fee and is signed with the usual hybrid signature (secp256k1 and ML-DSA-87), and a new window **replaces** any window that is already open. Opening it also advances your account's nonce, so open the window **first**, then send from MetaMask - a transaction prepared earlier will be refused with "nonce too low". **Close the window** is offered only while a window is live.

**An open window says exactly what it admits:** *Admits: QOR transfers only*, *Admits: any contract (tokens are not counted against the cap)*, or *Admits: only \{targets\}*. In the last case QoreX adds that **a listed contract can still act for the account**, including moving tokens it holds or approved to them, and that the QOR limit does not cover that.

The screen shows one of four states: *Open for \{blocks\} more blocks · \{txs\} transactions · \{value\} QOR left*; *No window is open. MetaMask transactions from this account are refused.*; *That window has expired or is used up*; or *QoreX could not read the window from the network* - which means QoreX does not know, **not** that you have none. If your account has no ML-DSA-87 key yet, register one first (your first QoreX transfer does it); a window will not help before that.

:::caution Keep it small and short
A window lets ordinary MetaMask transactions move your QOR **with a secp256k1 signature only**. Keep the limits low - a small spending cap, few transactions, a short time - choose **QOR transfers only** unless you need a contract, and close the window when you are done. The cap covers all QOR leaving the account, including the maximum fee, so a transaction that would pass the cap is refused. It does not cover tokens.
:::

### Windows for a single transaction {#per-transaction-windows}

When a site asks QoreX to send an EVM transaction on QoreChain and no open window covers it, the approval opens one **for exactly that transaction**, signed with your hybrid ML-DSA-87 key:

- one transaction, up to the value **plus the maximum fee**, for about ten minutes;
- limited to the contracts it calls, where the network supports it;
- the approval **names every contract** the window would admit (including contracts that recently had you sign a permit) and says that **it replaces any window you have open**;
- the QOR limit covers all QOR leaving the account, the maximum fee included, and a listed contract can still act for the account (move tokens it holds or approved, or QOR held by other contracts);
- if the network does not accept a window limited to contracts, QoreX **asks a second time** before opening one without that limit. Saying no opens nothing and sends nothing.

A typed-data signature that a contract on QoreChain checks (a permit) similarly opens a short window listing that contract. In the transaction history, an EVM transaction shows how much it used from the window. See [dApp integration](/qorex/dapp-integration) for the developer view. If you use MetaMask or another EVM wallet with an app that calls contracts, choose **Any contract** when you open the window yourself. An app that sends its transactions through QoreX needs no window opened in advance. Like the manual window, this applies to Ethereum-style (coin 60) accounts.

(Sending ETH, BNB and other assets on *other* networks from QoreX is a different thing - see [External networks & tokens](/qorex/send-and-receive#external-networks-tokens).)

## What the approval window shows {#approvals}

Every signature QoreX produces is approved by you, and the approval lists exactly what you are signing. QoreX shows:

- a title and labelled fields for **every message** in the request, including messages nested inside an authz **MsgExec** and the terms of permission grants - and it **refuses** anything it cannot display ("QoreX cannot read this message … Approve only if you trust this site completely");
- the **fee** (*Fee: \{amount\} · gas \{gas\}*), who pays it and any fee grant - if the fee cannot be read, QoreX says so and tells you not to approve;
- the **limit, allowed action and expiry** of spending allowances and authz grants, with *UNLIMITED* and *NEVER* written out; an expiry is shown to the second (`YYYY-MM-DD HH:MM:SS UTC`). Read the allowed action closely: a fee allowance whose allowed messages include `MsgExec` (an `AllowedMsgAllowance`) covers any message the grantee can execute through it, and a generic authz grant covers whatever message type it names. A governance vote is decoded so you see what you are voting on. Anything unreadable, unlimited or endless needs a **second tap** on Approve (*Tap again to approve*);
- the signing account (*Signed by …*) when you have several;
- for a request with a very large number of messages, the first 50 and a count of the rest.

For **EVM** requests, QoreX decodes the transaction or typed data (transfer, approval with *UNLIMITED* spelled out, permit and others), and treats unknown calls and types as high risk with a second tap. It simulates where the network allows it. QoreChain's EVM node can only check that a call with data would not fail, so the approval then says *"What it does to your tokens was not checked. Approve only if you trust this site."* and needs a second tap. A transaction that would fail, or cannot be simulated, also needs a second tap. Native requests that call a contract are simulated before the approval, and a call the contract would refuse is refused with the chain's reason. Approval screens show the memo, and let you open the full message.

QoreX also **refuses a request whose bytes can be read two ways** (since 1.1.7 / 0.3.7). A request that repeats a field that should appear once - for example a doubled fee or amount - could be shown one way and executed another, so QoreX will not show it for approval at all. For websites, QoreX identifies the requesting site by the origin the browser itself attests, never by what the request says about itself.

A wallet or account switch, or locking the wallet, answers waiting requests with "no"; a site can have one request waiting, and three can wait in all. Field names in approval windows are shown in English in some builds.

### What a site can never request {#never-requested}

These actions are available **only from QoreX's own screens**. QoreX refuses them from any website, whatever the site says:

- post-quantum key management (register, migrate, rotate);
- authenticators (linked signers) and spending rules;
- opening, closing or clearing an EVM access window;
- Solana-on-QoreChain window and relay messages;
- a permission (authz) that would let someone **grant** further permissions or **execute** messages as your account. Such a grant would let the receiver act as you. QoreX refuses it directly, wrapped inside `MsgExec` at any depth, or as a generic grant.

## Look-alike addresses {#look-alike}

Scammers send tiny amounts from addresses that start and end like one you use, hoping you will copy the wrong one. QoreX compares a recipient with the addresses you know (saved contacts, your own accounts and addresses you have paid), on QoreChain and external networks, and flags an address that only **looks like** one of them before you send. Likely spam with a link in the memo is also hidden from History. See [Contacts and favourites](/qorex/send-and-receive#contacts) and [History](/qorex/send-and-receive#history).

## Auto-lock {#auto-lock}

QoreX locks itself after a while without use. Choose **1, 5, 15, 30, 60 minutes or 4 hours** under **Lock automatically after**; the default is **15 minutes**. App: Settings → Security; after the interval QoreX asks for biometrics again before it shows anything. Extension and Safari: the setting is on the popup's home screen, next to a **Lock** button; after the interval you enter your password again.

## Your recovery phrase and accessibility tools {#phrase-privacy}

The recovery phrase screen asks for a fresh biometric or device PIN every time, shows the words as a numbered, read-only grid with **no copy button**, is blocked from screenshots on Android, and is hidden from the app switcher. On **Android 14 and later** the words are also withheld from accessibility services that are not genuine accessibility tools (TalkBack and other real screen readers can still read them). On older Android and on iOS the words are hidden from screen readers by default; if you rely on a screen reader, tap the notice on that screen to let it read them. Reveal the phrase only when nobody can see your screen.

## Connected dApps {#connected-dapps}

dApp connections are **per-origin**, and they last until you remove them. In the app they are saved **on this device, per wallet** (the site's address only); see and revoke them in [My money's protection](#protection). In the browser extension and Safari, open **Connected sites** in the popup to see every site this wallet approved and **Revoke** any of them.

## Linked signers & spending limits {#linked-signers}

Linking an external key (Phantom or MetaMask) as a **linked signer** with its own spending limits is **not available inside QoreX yet** - Settings → Security shows the card, with the action marked *coming*. Nothing is linked to your wallet unless you did it yourself outside QoreX. Key management can never be delegated to a linked key. For the on-chain model, see [Linked Wallet Authenticators](/developer-guide/account-abstraction#authenticators).

## Q-Day Scanner {#q-day-scanner}

The **Q-Day Scanner** lets you enter any address - yours or anyone's - and get an exposure report for any Bitcoin or Ethereum address. Reach it from the Home tab quick buttons. To check a **Bitcoin** address, QoreX has to ask blockstream.info, a service run by someone else, which sees the address and your IP address. The scanner names it and scans only after you accept.

## Help and support {#support}

App: **Settings → Support**. Extension and Safari: **Support** on the popup's home screen. The screen lists the **only official channels**, with each full address shown so you can compare:

- Telegram community: [https://t.me/QorechainCommunity](https://t.me/QorechainCommunity)
- Discord: [https://discord.gg/qorechain](https://discord.gg/qorechain)
- Help page: [https://qorechain.io/help/qorex](https://qorechain.io/help/qorex)
- Email: team@qorechain.io
- Report a vulnerability: [https://qorechain.io/security](https://qorechain.io/security)

:::danger QoreX staff never ask for your recovery phrase
*"QoreChain staff will NEVER ask for your recovery phrase, password or keys. Anyone who does is a scammer."* That covers QoreX support too.
:::

The same screen has an optional **diagnostic summary** to copy **only if support asks for it**. It holds the app version, the network and error codes: no phrase, keys, addresses or balances.

## Security model, in brief

1. **Non-custodial** - keys are generated on-device, live in hardware-backed vaults (mobile) or an encrypted vault (extension), and never leave.
2. **Nothing without consent** - every connection is per-origin, every signature is individually approved (biometric on mobile), and payloads are decoded before signing. What QoreX cannot read is refused, or clearly marked and held behind a second tap.
3. **Hybrid-signed native lane.** Every native QOR transfer is signed twice: with a classical key and with ML-DSA-87 (FIPS 204). Anything classical (external networks, EVM) is labeled, never silent.
4. **No analytics, no crash reporting, no tracking SDK.** Keys, recovery phrase, vault and approvals never leave the device. Optional sign-in, push notifications and social recovery use a server only when you turn them on; the complete list of what QoreX sends is in [What QoreX sends over the network](/qorex/overview#data-and-privacy), and the [QoreChain privacy policy](https://qorechain.io/privacy) covers it.
5. **Recovery paths** - 24-word phrase (always), social recovery with guardians + 48h timelock (optional), Legacy inheritance (optional), device linking (convenience).

## Limits and known issues {#limits}

- Social recovery, Legacy, device linking and the Q-Day Scanner are mobile only.
- Rotating the post-quantum key protects against a leaked post-quantum key, not a leaked recovery phrase. Other wallets on the same phrase cannot sign for a rotated account until they support rotated keys.
- Linked signers with spending limits are not available inside QoreX yet.
- The manual EVM window screen offers only "QOR transfers only" or "Any contract". A window's QOR cap never limits tokens.
- Token approvals are checked on QoreChain's EVM only, and revoking them needs a coin-60 account.
- Device linking is a convenience, not a recovery method. A lost wallet with no written phrase and no social recovery cannot be recovered by anyone.
- The approval window shows some field names in English in some builds.
