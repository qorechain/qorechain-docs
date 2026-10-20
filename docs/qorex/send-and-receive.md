---
slug: /qorex/send-and-receive
title: Send & Receive
sidebar_label: Send & Receive
sidebar_position: 3
---

# Send & Receive

The Home (Wallet) tab is your starting point. It shows a **network badge** (MAINNET by default, or TESTNET if you enabled the developer toggle), your **total balance** (tap to hide/show), and the main actions: **Send · Receive · Swap · Stake** (**Swap** is not shown on iOS). Your asset list shows **QOR** (Native + post-quantum 🛡, one unified balance across the Native/EVM/SVM lanes) and **All networks** (a unified view across ETH, BNB, POL, ARB, and the other [external networks](#external-networks-tokens) QoreX supports).

## Send quantum-safe QOR

1. Tap **Send**.
2. Enter the recipient as a `qor1…` address **or** an **@handle**. A handle is resolved and cryptographically verified (registry signature + owner signature + trust-on-first-use pinning); if a handle's key ever changes silently, QoreX shows an explicit warning.
3. Enter the amount. The preview shows the recipient, amount, the **Network fee**, and the **Shield** state — the post-quantum protection level of the signature.
4. Confirm with **biometric** approval. QoreX signs the transfer with the mandatory hybrid post-quantum signature (ML-DSA-87 + secp256k1) and broadcasts it on the Native lane.

On the first screen, the quick-fill box (**Ask QoreX**) lets you type a plain request such as "send 50 QOR to @maria" and fills the form in for you. It is a simple text reader that runs **entirely on your device** — nothing you type there is sent anywhere, and it is not an AI assistant (QoreX has none). You still review everything and confirm with biometrics as usual; if it cannot read what you typed, it says so and you fill the form by hand. Recent recipients appear as chips.

QoreChain does not register your post-quantum key by itself — QoreX does it for you as part of your **first** transfer (a small one-time network fee), and you can see the state in [Security & Recovery](/qorex/security-and-recovery#pqc-key). No separate step is needed in QoreX.

### Send to an @handle, step by step {#handle-send}

1. Open **Send** and type `@` followed by the handle (for example `@liviu`) in the recipient field instead of an address.
2. QoreX looks the handle up and shows you the **resolved `qor1…` address** before you confirm anything. (Claiming your own handle needs a signed-in account and is done in the app — see [@handle](/qorex/account-and-dashboard#handle).)
3. Check the resolved address, enter the amount, and confirm as usual.

QoreX only accepts a resolution that passes **both** checks it performs: a registry attestation verified against a trust key pinned in the app, and the handle owner's own signature over the claim. Failing either check throws an error rather than falling back to an unverified address. The first time you pay a given handle, QoreX remembers the address it resolved to; if that handle's address ever changes, QoreX stops before signing and shows you the old and new address side by side so you can decide whether to continue. This memory is **per device** — paying the same handle for the first time from a different phone or a fresh install shows it as new there too, which is expected, not an error. The browser extension resolves and pays handles the same way (its memory is **per browser**, so a different browser or computer sees it as new) — see [Send to an @handle](/qorex/browser-extension#handle-send).

### Sending vesting (locked) QOR {#vesting}

If part of your balance is still **vesting** — for example an unreleased TGE allocation — your total is split into **available now** and **still locked**. You can only send the available portion; QoreX refuses an over-spend attempt itself rather than letting the network reject it after taking a fee. The locked portion becomes spendable gradually as the vesting schedule unlocks it. This split is shown wherever your balance appears — Home, Send, and Asset detail.

## Receive {#receive}

Tap **Receive**. QoreChain is selected first — your `qor1…` address (and your @handle, if you have one) as a QR code with the QoreChain icon, plus **Copy** and **Share**. Anything sent to it arrives with quantum-safe protection.

To receive on another network, use the **Network** picker at the top: Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis and Celestia each show **their own address** and the warning *"Send only \{coin\} or tokens on \{network\} to this address. Coins sent from another network can be lost."* All EVM networks share one `0x…` address. Your EVM and Solana addresses are derived from your recovery phrase, so QoreX asks for one biometric confirmation (**Show the address**) before it shows them. Other networks cannot carry post-quantum signatures — see [External networks](#external-networks-tokens).

In the browser extension, **Receive** has the same network picker.

## Coins and tokens {#coins-and-tokens}

A coin with no row has no address to receive it on. To see a coin or token on **Portfolio** *before* you hold any, open Portfolio → **+ Coin or token** and switch it on (in the extension: **Coins and tokens**). A coin pinned at zero opens **Receive** on its network when tapped. Settings → **Coins and networks** lists everything the wallet can hold today.

**Add a token by contract** (EVM networks only):

1. Portfolio → **+ Coin or token** → **Add a token by contract** (extension: **Coins and tokens** → *Add a token by contract*).
2. Pick the **Network**, paste the **Contract address (0x…)** and tap **Check contract**.
3. QoreX reads the symbol and decimals from the contract itself and shows *"The contract says: \{symbol\} · \{decimals\} decimals"*. Anyone can create a token and give it any name — QoreX does not vouch for it, so make sure it is the contract you meant.
4. Tap **Add \{symbol\}**. It is marked *Added by you* and can be sent like the bundled tokens. Remove it any time.

QoreX refuses a token that is already bundled, one you already added, a non-EVM network, a bad address, a contract that does not answer as a token, and a contract that uses the name of a token QoreX already ships on that network (a likely copy).

## Request a payment

Tap **Request** (requires [sign-in](/qorex/account-and-dashboard#sign-in)) to create a payment request — an amount plus an optional memo — as a QR code or link. Whoever scans it sees the pre-filled transfer.

## External networks & tokens {#external-networks-tokens}

From **All networks** (or Send-external) you can send **ETH, BNB, POL, AVAX, and SOL** natively, plus ETH on **Arbitrum, Base, and OP Mainnet**, and **ATOM, OSMO, and TIA** on Cosmos, plus **ERC-20**, **SPL**, and **IBC** tokens — USDC and USDT across the EVM chains and Solana, DAI on Ethereum, and Noble USDC over IBC — all derived from the same recovery phrase (ETH uses `m/44'/60'`, SOL uses its standard path, and SPL uses associated token accounts).

:::caution External chains are classical-only
Other blockchains cannot carry post-quantum signatures. When you send on an external network, QoreX states this explicitly (the transfer uses a classical signature and the **Shield** shows the downgrade). Your **QOR** always stays on the protected Native lane. Cosmos-based external sends support an optional memo. For EVM networks QoreX also shows the **maximum network fee** before you confirm — "Network fee: at most \{fee\}. Check it before you confirm." — and signs with exactly that figure.
:::

## Swap

The **Swap** tab is wired to QoreChain's on-chain AMM but stays disabled — the button reads **"Swap — coming with pool liquidity"** — until liquidity and the remote feature flag turn it on. When that happens it lights up automatically; **no app update is needed**.

:::note iOS
The Swap tab does not appear at all in the App Store build — Apple treats an in-app token exchange as a regulated service. Swap remains available (once enabled) on Android only. The browser extension has no Swap screen.
:::

## Home screen extras {#home-extras}

- **Home-screen widget** (Android and iPhone) — add **QoreX** from your phone's widget picker. It shows your QOR balance for the account in use, shows dots instead of the amount while privacy mode is on, refreshes itself about every 30 minutes, and opens the app when tapped. The widget makes no request of its own to QoreChain servers: the app hands it your address, balance and privacy setting on the device, and the widget reads the balance from the public QoreChain REST endpoint (which sees only your public address). Anyone who can see your home screen can see the widget, so turn privacy mode on (tap your balance) if that matters.
- **Push notifications** (mobile, mainnet) — the bell on Home → **Notifications** has a **Push notifications** switch: *"Get a notification when QOR arrives, even with the app closed. Our server watches only your public addresses; Apple and Google see no amount or address."* The notification text is just "QOR received". Push is **off until you turn it on**. When it is on, the server holds your device token and the public `qor1…` addresses of the wallet in use (up to 10); turning the switch off removes your device from the server, and a device the server has not heard from for 90 days is forgotten. See [What QoreX sends over the network](/qorex/overview#data-and-privacy). If notifications are off for QoreX in your phone's settings, turn them on there first. Delivery has been tested end to end on Android; on iPhone, treat it as best effort and keep checking the in-app **Notifications** list.
- **Search and tour** — see [Find your way around](/qorex/getting-started#find-your-way).

## Next steps

- [Portfolio & Staking](/qorex/portfolio-and-staking) — see your allocation and earn rewards.
- [Security & Recovery](/qorex/security-and-recovery) — protect and recover your wallet.
