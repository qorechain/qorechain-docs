---
slug: /qorex/send-and-receive
title: Send & Receive
sidebar_label: Send & Receive
sidebar_position: 3
---

# Send & Receive

This page covers sending and receiving QOR, paying an @handle, payment requests, contacts, transaction history, holding assets on other networks, and the Home screen extras. It is for anyone using the QoreX mobile app (the extension has the same Send and Receive screens, see [Browser Extension](/qorex/browser-extension)). Where something differs between the app, the browser extension and the Safari extension, the text says so.

## Innovations {#innovations}

- **Signed payment requests.** A request is a link signed by your own account key. Whoever pays it sees QoreX check the signature, the exact network and any @handle before the normal review appears, so a changed amount or recipient shows up instead of passing silently. See [Payment requests](#payment-requests).
- **Status read from the chain.** A transfer is *pending*, *confirmed* or *failed* because the network says so, and a payment request is marked *paid* only when the chain shows a matching payment. See [History](#history).
- **Look-alike flag.** An address that only resembles one you already know is flagged before you send. See [Contacts and favourites](#contacts).
- **Fee warnings in plain words.** QoreX tells you when the fee is larger than the amount you send, and shows the one-time key registration fee and the total on your first send.

The Home (Wallet) tab is your starting point. It shows a **network badge** (MAINNET by default, or TESTNET if you enabled the developer toggle), your **total balance** (tap to hide/show), and the main actions: **Send · Receive · Swap · Stake** (**Swap** is not shown on iOS). Your asset list shows **QOR** (one unified balance across the Native, EVM and SVM lanes, sent on the hybrid-signed native lane) and **All networks** (a unified view across ETH, BNB, POL, ARB, and the other [external networks](#external-networks-tokens) QoreX supports).

## Send QOR on the hybrid-signed native lane

1. Tap **Send**.
2. Enter the recipient as a `qor1…` address **or** an **@handle**. A handle is resolved and cryptographically verified (registry signature + owner signature + trust-on-first-use pinning); if a handle's key ever changes silently, QoreX shows an explicit warning.
3. Enter the amount. The preview shows the recipient, amount, the **Network fee**, and the signature state (whether the transfer carries the ML-DSA-87 layer).
4. Confirm with **biometric** approval. Every native QOR transfer is signed twice: with a classical key and with ML-DSA-87 (FIPS 204). QoreX signs with that mandatory hybrid signature and broadcasts on the native lane. After the broadcast it checks that the committed transaction carries the ML-DSA-87 layer and warns you if it does not.

On the first screen, the quick-fill box (**Ask QoreX**) lets you type a plain request such as "send 50 QOR to @maria" and fills the form in for you. It is a simple text reader that runs **entirely on your device** - nothing you type there is sent anywhere, and it is not an AI assistant (QoreX has none). You still review everything and confirm with biometrics as usual; if it cannot read what you typed, it says so and you fill the form by hand. Your favourite contacts and recent recipients appear as one-tap chips (see [Contacts and favourites](#contacts)).

QoreChain does not register your ML-DSA-87 key by itself. QoreX does it for you as part of your **first** transfer (a small one-time network fee), and you can see the state in [Security & Recovery](/qorex/security-and-recovery#pqc-key). No separate step is needed in QoreX.

**The review of a first send shows the cost up front.** Besides the amount and the **Network fee**, the review lists *One-time ML-DSA-87 key registration* with its fee and then **Total fees**, so there is no surprise after you confirm. Later sends from the same account show only the network fee.

**Fee larger than the amount.** If the network fee is larger than the amount you are sending, the review says so (*"The network fee ... is larger than the amount you are sending ..."*) as a caution. It never blocks the send. QoreX shows it for native QOR sends and for the own coin of an external network when the fee is quoted in that coin. Claiming staking rewards gets the same check, see [Portfolio & Staking](/qorex/portfolio-and-staking#claim).

### Send to an @handle, step by step {#handle-send}

1. Open **Send** and type `@` followed by the handle (for example `@liviu`) in the recipient field instead of an address.
2. QoreX looks the handle up and shows you the **resolved `qor1…` address** before you confirm anything. (Claiming your own handle needs a signed-in account and is done in the app - see [@handle](/qorex/account-and-dashboard#handle).)
3. Check the resolved address, enter the amount, and confirm as usual.

QoreX only accepts a resolution that passes **both** checks it performs: a registry attestation verified against a trust key pinned in the app, and the handle owner's own signature over the claim. Failing either check throws an error rather than falling back to an unverified address. The first time you pay a given handle, QoreX remembers the address it resolved to; if that handle's address ever changes, QoreX stops before signing and shows you the old and new address side by side so you can decide whether to continue. This memory is **per device** - paying the same handle for the first time from a different phone or a fresh install shows it as new there too, which is expected, not an error. The browser extension resolves and pays handles the same way (its memory is **per browser**, so a different browser or computer sees it as new) - see [Send to an @handle](/qorex/browser-extension#handle-send).

### Sending vesting (locked) QOR {#vesting}

If part of your balance is still **vesting** - for example an unreleased TGE allocation - your total is split into **available now** and **still locked**. You can only send the available portion; QoreX refuses an over-spend attempt itself rather than letting the network reject it after taking a fee. The locked portion becomes spendable gradually as the vesting schedule unlocks it. This split is shown wherever your balance appears - Home, Send, and Asset detail.

## Receive {#receive}

Tap **Receive**. It starts with the coin: a **searchable list** (*Choose the coin to receive*, search box *Search coin or network*) with **QOR first**, then each supported network's own coin and the bundled tokens, each with its picture and its network's. If nothing matches your search, the list says *No coin matches your search.* The pictures ship inside QoreX, so nothing is fetched from a third party to draw the list.

- **QOR** shows your `qor1...` address (and your @handle, if you have one) as a QR code with the QoreChain icon, plus **Copy** and **Share**. Anything sent to it arrives on the native lane, where every transfer carries a classical and an ML-DSA-87 signature.
- **Any other coin or token** shows that network's own address and the warning *"Send only \{coin\} or tokens on \{network\} to this address. Coins sent from another network can be lost."* The warning names the coin you picked. Use **Choose another coin** to go back to the list.
- **Networks covered:** Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis and Celestia. All EVM networks share one `0x...` address. Your EVM and Solana addresses are derived from your recovery phrase, so QoreX asks for one biometric confirmation (**Show the address**) before it shows them. Other networks cannot carry ML-DSA-87 signatures. See [External networks](#external-networks-tokens).
- **Custom tokens are on the list too.** A token you added by contract address (or, on Solana, by mint address) is offered on Receive with its network's address, the same as a bundled token. See [Coins and tokens](#coins-and-tokens).
- **Cosmos Hub, Osmosis and Celestia addresses.** The address shown is the one your sends from that network sign with (your coin-118 key). Earlier builds could show a different address for a coin-60 account or follow the active account; that is fixed, and the send checks the address again before signing.

The extension and the Safari extension have the same coin list on **Receive**.

## Coins and tokens {#coins-and-tokens}

A coin with no row has no address to receive it on. To see a coin or token on **Portfolio** *before* you hold any, open Portfolio → **+ Coin or token** and switch it on (in the extension: **Coins and tokens**). A coin pinned at zero opens **Receive** on its network when tapped. Settings → **Coins and networks** lists everything the wallet can hold today.

**Add a token by contract** (EVM networks only):

1. Portfolio → **+ Coin or token** → **Add a token by contract** (extension: **Coins and tokens** → *Add a token by contract*).
2. Pick the **Network**, paste the **Contract address (0x…)** and tap **Check contract**.
3. QoreX reads the symbol and decimals from the contract itself and shows *"The contract says: \{symbol\} · \{decimals\} decimals"*. Anyone can create a token and give it any name - QoreX does not vouch for it, so make sure it is the contract you meant.
4. Tap **Add \{symbol\}**. It is marked *Added by you* and can be sent like the bundled tokens. Remove it any time.

Once added, the token also appears on [Receive](#receive).

QoreX refuses a token that is already bundled, one you already added, a non-EVM network, a bad address, a contract that does not answer as a token, and a contract that uses the name of a token QoreX already ships on that network (a likely copy).

## Payment requests {#payment-requests}

Ask someone for an amount of QOR with a signed link that you share or copy. It works in the app, the extension and the Safari extension, on mainnet and on testnet, and it does **not** need a QoreX sign-in.

**Create a request**

1. Open **Payment requests** (app: Settings; extension: a button on the home screen).
2. Tap **New request**, enter the **Amount (QOR)** and an optional **Note** (140 characters at most). If you have an @handle you can tick *Show my @handle on the request*.
3. Tap **Create link**. QoreX signs the request with your own account key and shows *"Your request is ready. Anyone can pay it, in QoreX or in another wallet."*
4. **Share link** or **Copy link**.

The link is signed with your account key, so a changed amount or address is detected. The key must belong to the receiving address: nobody else can re-sign an altered link in your name. The signature is an integrity check on the link only; the payment itself is signed normally by the payer, with the hybrid signature on the native lane. The link format is `qorex://pay?v=1&...` and it names the exact network (mainnet or testnet). What **Share link** and **Copy link** give you is a payment link that opens in QoreX; it starts with `https://link.qore.network/pay?`. Without the app, the same link shows a web page: see [Opening a payment link without the app](#pay-web).

The **Request** button on the app's Home asks a particular QoreX user by their @handle (it needs [sign-in](/qorex/account-and-dashboard#sign-in) and your own @handle). Once created, that request can also be shared as a signed link.

**Pay a request**

1. Open the link on a phone with QoreX, or go to **Pay a request** and use **Paste a payment link** (extension too), then **Open**.
2. QoreX checks the signature, the network and any @handle *before* showing anything to pay. It then shows the recipient, the amount, the note and the memo tag, and the normal review follows. You confirm as for any send.
3. The messages you may see: *"Signature checked: the request is unchanged since it was signed."*, or a refusal such as *"This link was changed after it was signed. Do not pay it."*, *"This link was not signed by the owner of the receiving address. Do not pay it."* or *"This request is for \{network\}. Switch the network in QoreX to pay it."*
4. If the link carries an @handle, QoreX checks it against the handle registry: verified, first payment to it, *now points to a different address than before* (check with them before paying), or does not point to this address (do not pay unless you are sure). A handle warning needs a second confirmation.

QoreX pays requests in QOR only for now. A testnet request says *"Testnet request. Testnet QOR has no value."*

**Follow and reuse**

**My requests** lists the requests you created. Each one shows **Paid** or **Not paid yet**, read from the chain: QoreX looks for a matching payment (the memo tag on the transfer), and it is marked paid only when the chain shows it. If the network does not answer it says *Status unknown*, never a guess. **Check status** asks again. **Reuse next month** makes a new request with the same details and a new id. With an @handle you also see **Requests to me** and **Requests I sent by @handle**.

### Opening a payment link without the app {#pay-web}

On an iPhone or Android phone with QoreX 1.2.5, a `https://link.qore.network/pay?` link opens the app. Without the app, it shows a web page, in English. The page checks the signature in your browser, including that the signer owns the receiving address, and refuses a link that fails, with the reason. It makes no network requests of its own to check or show the request, and has no analytics or cookies. For a valid link it shows the amount, the recipient, any note, the memo tag and the network. It cannot check an @handle: QoreX checks it with the registry before you pay. The page offers:

- **Open in QoreX**.
- **Pay with Keplr**. This does not send the payment. It adds QoreChain to Keplr and shows your Keplr address, with buttons to copy the recipient address, the amount and the memo. It does not ask Keplr to sign, because QoreChain requires a post-quantum (hybrid) signature on this payment and Keplr cannot add it by itself today. Pay in QoreX or in another wallet that signs QoreChain payments, and keep the memo exactly as it is.
- **Pay with MetaMask** (QOR only, on the EVM lane). The account you pay from first needs an [EVM access window](/qorex/browser-extension#evm-window) that you open in QoreX; without it the network refuses the payment. MetaMask's signature is classical (secp256k1). A MetaMask payment carries no memo, so the request is **not** marked paid automatically: tell the requester, who has to confirm it by hand.

## Contacts and favourites {#contacts}

**Contacts** (app: Settings; extension: a button on the home screen) are names for addresses you pay. They are kept **on this device only**. A contact has a name, up to one address per network (QoreChain, EVM, Solana, Cosmos) and an optional @handle; the list holds up to 200.

- **Favourites.** Tick *Favourite (shown on the send screen)* and the contact appears as a one-tap chip above the recipient field. A chip only fills the form: you still review and confirm.
- **Repeat payment.** On a past payment (app: its detail screen; extension: the history row) **Repeat payment** fills the send form again with the same recipient, amount and memo. You always review and confirm before anything is sent.
- **Look-alike flag.** A contact is not a safety check, and QoreX says so. When an address you are about to pay only *looks like* one you already know (same first and last characters, a trick scammers use by planting look-alike addresses in your history), the review warns *"Careful: this address only LOOKS LIKE one you already know"* and shows the known address to compare character by character. It needs a second tap (extension) or a risk acknowledgement (app). The flag compares against your saved contacts, accounts you own and addresses you have paid.
- **A saved contact is named in the review** (*Saved contact: \{name\}*). A saved @handle also shows whether its address is the same as when you last paid it, new, or **changed**.

## History {#history}

History shows every QoreChain transaction of an account, not only sends: received, staked, unstaked, stake moved, rewards claimed, locks, bonus, EVM windows, rewards address and ML-DSA-87 key registration, with the amount, the fee and failed transactions marked *Failed (the fee was still paid)*. The hybrid badge appears only on a transaction the chain itself verified. External networks are not in History yet.

- **Where.** App: **Activity**, with a picker for the account, and a **History** link on every account in **Your accounts**. Extension: **History** on the home screen, with an account picker.
- **Pending, confirmed, failed.** A transfer you just sent shows **Pending: waiting for the network** until the chain knows it. A transaction the chain has not seen after a few minutes reads *Not found on the network: it may have failed. Check the transaction before sending again.* It is never shown as sent on a guess. **Dismiss** removes such a row.
- **Per account.** Each account of the wallet has its own History.
- **Export CSV.** **Export CSV** writes the history of the account to a file **on this device**. It holds your history only: no phrase, no keys. The columns are fixed and in English, and any cell that a spreadsheet could read as a formula (an address or memo starting with `=`, `+`, `-` or `@`) is prefixed so it opens as text.
- **Spam is hidden.** Incoming transfers under 0.1 QOR whose memo contains a link or a domain are hidden from Activity and from notifications, with a line such as *"\{n\} likely spam transfers hidden"* and **Show them**. Zero-value transfers are hidden. A memo with a link carries a warning in the transaction detail: QoreChain and QoreX never ask you to visit a link sent with a transfer.
- **Pruned nodes.** If a node no longer keeps old blocks, QoreX asks for a smaller page until the node answers, and says so when the network cannot be reached. It no longer shows an empty list in that case.

The **QOR page** (tap QOR on Home) lists every transaction of the account, incoming and outgoing, with **Show more** at the bottom.

## External networks & tokens {#external-networks-tokens}

Sending is on for every network QoreX lists: Ethereum, BNB Smart Chain, Polygon, Arbitrum One, Base, OP Mainnet, Avalanche C-Chain, Solana, Cosmos Hub, Osmosis and Celestia, with their tokens. BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche and Celestia work again after being receive-only for a time. Native sends on Arbitrum use the network's own gas estimate.

From **All networks** (or Send-external) you can send **ETH, BNB, POL, AVAX, and SOL** natively, plus ETH on **Arbitrum, Base, and OP Mainnet**, and **ATOM, OSMO, and TIA** on Cosmos, plus **ERC-20**, **SPL**, and **IBC** tokens - USDC and USDT across the EVM chains and Solana, DAI on Ethereum, and Noble USDC over IBC - all derived from the same recovery phrase (ETH uses `m/44'/60'`, SOL uses its standard path, and SPL uses associated token accounts).

:::caution External chains are classical-only
Other blockchains cannot carry ML-DSA-87 signatures. When you send on an external network, QoreX states this explicitly (the transfer uses a classical signature and the signature line marks it classical). Your **QOR** stays on the hybrid-signed native lane. Cosmos-based external sends support an optional memo. For EVM networks QoreX also shows the **maximum network fee** before you confirm - "Network fee: at most \{fee\}. Check it before you confirm." - and signs with exactly that figure.
:::

## Swap

The **Swap** tab is wired to QoreChain's on-chain AMM but stays disabled - the button reads **"Swap - coming with pool liquidity"** - until liquidity and the remote feature flag turn it on. When that happens it lights up automatically; **no app update is needed**.

:::note iOS
The Swap tab does not appear at all in the App Store build - Apple treats an in-app token exchange as a regulated service. Swap remains available (once enabled) on Android only. The browser extension has no Swap screen.
:::

## Home screen extras {#home-extras}

- **Home-screen widget** (Android and iPhone) - add **QoreX** from your phone's widget picker. It shows your QOR balance for the account in use, shows dots instead of the amount while privacy mode is on, refreshes itself about every 30 minutes, and opens the app when tapped. The widget makes no request of its own to QoreChain servers: the app hands it your address, balance and privacy setting on the device, and the widget reads the balance from the public QoreChain REST endpoint (which sees only your public address). Anyone who can see your home screen can see the widget, so turn privacy mode on (tap your balance) if that matters.
- **Push notifications** (mobile, mainnet) - the bell on Home → **Notifications** has a **Push notifications** switch: *"Get a notification when QOR arrives, even with the app closed. Our server watches only your public addresses; Apple and Google see no amount or address."* The notification text is just "QOR received". Push is **off until you turn it on**. When it is on, the server holds your device token and the public `qor1…` addresses of the wallet in use (up to 10); turning the switch off removes your device from the server, and a device the server has not heard from for 90 days is forgotten. See [What QoreX sends over the network](/qorex/overview#data-and-privacy). If notifications are off for QoreX in your phone's settings, turn them on there first. Delivery has been tested end to end on Android; on iPhone, treat it as best effort and keep checking the in-app **Notifications** list.
- **Search and tour** - see [Find your way around](/qorex/getting-started#find-your-way).

## Next steps

- [Portfolio & Staking](/qorex/portfolio-and-staking) - see your allocation and earn rewards.
- [Security & Recovery](/qorex/security-and-recovery) - protect and recover your wallet.

## Limits and known issues {#limits}

- External-network transfers (EVM, Solana, Cosmos) are classical only. SVM and EVM transfers are not covered by the hybrid signature.
- Swap is not available: it is off until pool liquidity exists and is not shown on iOS.
- Claiming an @handle needs a signed-in account and happens in the mobile app. Ethereum-style (coin 60) accounts have no handle. If the handle service is down, you can still pay by `qor1…` address.
- Payment requests are paid in QOR only. Requesting by @handle (to see requests sent to a handle) needs a claimed @handle.
- History covers QoreChain only for now; other networks will follow.
- Push notifications are mainnet only, and on iPhone best effort.
- Vesting QOR cannot pay fees; only the available portion can be sent.
