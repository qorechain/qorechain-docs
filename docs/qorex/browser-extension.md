---
slug: /qorex/browser-extension
title: QoreX Browser Extension
sidebar_label: Browser Extension
sidebar_position: 2
---

# QoreX Browser Extension

The QoreX **browser extension** is the desktop QoreChain wallet. It is a **standalone wallet** — create or import a wallet, hold and send QOR, and connect to dApps — and it is the piece that lets any website discover QoreX and turn every request into an explicit, decoded approval.

It is **live and public** on three stores (Chrome, Firefox and Safari); Chrome currently lags the others by one release — see [which version is live where](#versions).

## Install {#install}

| Browser | Install |
|---|---|
| **Chrome and Chromium browsers** (Brave, Edge, Arc, Opera) | https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg |
| **Firefox** (Firefox 140 or later) | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 12 or later)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

### Which version is live where {#versions}

Current version on each store, as of **23 October 2026**:

| Store | Current version |
|---|---|
| Chrome Web Store | 0.3.8 |
| Firefox Add-ons | 0.3.8 |
| Safari (Mac App Store, **QoreX Wallet** macOS app) | 1.7.8, carrying extension 0.3.8 — the Mac App Store uses its own `1.x` numbering |

Store reviews land at different times, so a store can serve an older build than another; the store listing always shows its current version. This page describes the 0.3.7 feature set, which every store now carries (0.3.8 is the current build). See also [Which version is live where](/qorex/overview#versions).

Since 0.2.6 the extension gained: [several wallets with one password](#wallets), an [Ethereum-style account you add by hand](#coin60), [Claim & restake](#stake), an **Unstaking in progress** list, [adding a token by contract](#custom-tokens), [Receive on any network](#receive), [Connected sites with Revoke](#connected-sites), the [EVM access window](#evm-window), [`signAndBroadcast` for dApps](#sign-and-broadcast), and approval screens that show every message, fee and expiry.

**The permission surface has not changed since 0.1.3** — see [What permissions QoreX asks for](#permissions).

:::note
On Safari, approvals open in a browser tab rather than a popup window — the extension is packaged with Apple's Safari web-extension wrapper from the same codebase.
:::

## Create or restore a wallet {#wallet}

Open the popup and choose:

- **Create a new wallet** — choose a password (at least 8 characters); QoreX generates a fresh 24-word recovery phrase on your device (256-bit entropy), derives your QoreChain identity, and seals it in the vault under that password (and, optionally, a passkey — see [Security](#security)). The 24 words are shown **once** — write them down, tick *I have saved my recovery phrase somewhere safe*, then continue. You can show them again later with **Reveal recovery phrase** in the popup (password required).
- **Import a recovery phrase** — restore from an existing phrase. A phrase shorter than 24 words restores your funds normally, but QoreX warns that your post-quantum key then only gets the phrase's strength; for full strength, create a new 24-word wallet and move your funds there.

:::danger Write the phrase down before you continue
The extension's vault lives only in this browser. **Removing the extension, clearing its data or resetting the browser deletes your keys**, and nobody — including QoreChain Association — can restore them. Without your written 24 words, your funds are gone for good. See [Back up now](/qorex/security-and-recovery#back-up-now).
:::

The extension holds its own keys; it does not require the mobile app. Keys never leave the device.

## Several wallets and accounts {#wallets}

- **Wallets** (from 0.3.3) — the popup's **Wallets** screen ("Wallets in this browser") lists every wallet in this browser. Each has its own recovery phrase; **one password** unlocks them all, and switching changes which one QoreX shows and signs with (nothing moves on chain). **Add** a wallet by creating a new one (its phrase is shown once) or restoring one; your password is asked once to re-seal the vault. Adding or removing a wallet turns **passkey unlock** off — turn it back on from the home screen. To remove one, tap *Remove from this browser* and enter your password; the last wallet cannot be removed from this screen. Removing deletes that key from the browser — only its recovery phrase brings it back.
- **Accounts** (from 0.2.2) — **Your accounts** creates and switches between several accounts from the same phrase (up to 20 per wallet; they are numbered and cannot be renamed). Restoring the phrase you wrote down brings back **Account 1**; re-add the others with **Add an account**. Switching moves everything with it: sending, staking, receiving, and your @handle follow whichever account is active.

### Ethereum-style account {#coin60}

From 0.3.2, **Add an Ethereum account (coin 60)** (on the **Your accounts** screen) adds the account for a phrase first used in MetaMask or on the Dashboard; see [Restore a phrase from MetaMask or the Dashboard](/qorex/getting-started#restore-dashboard). Its 0x address is the one MetaMask shows for the same words. Handles are not offered on it.

Portfolio, Q-Day Scanner, social recovery, Legacy Protocol, payment requests, account sign-in and device linking remain mobile-only — see [QoreX Wallet](/qorex/overview#platform-availability).

## Your account, balance & @handle {#account}

The popup's idle screen shows your `qor1…` address (tap to copy) and your live QOR balance, so you don't need to open a block explorer to check either.

### Vesting (locked) balances {#vesting}

If your account holds vesting QOR (for example, an unreleased TGE allocation), the balance splits into **available now** and **still locked**, and a send that exceeds the available amount is refused before it reaches the network rather than failing on-chain after taking a fee. QoreX deliberately does **not** show a "next unlock date" here: a vesting schedule can be amended by governance, so a date on the balance card would read as a promise QoreX can't guarantee. The available-vs-locked split is what stays accurate.

### Claim an @handle

Claiming a unique **@handle** (for example `@liviu`) needs a **signed-in account** and happens **in the mobile app**; the extension points you there and does not claim handles itself. Once claimed, the handle binds to that address, so the extension resolves it when you pay it and others can pay you by name. See [@handle](/qorex/account-and-dashboard#handle) for how handles are bound to addresses (not to a wallet as a whole).

## Send to an @handle {#handle-send}

Since 0.1.9 you can pay a registered @handle directly instead of looking up an address (lookups were interrupted by a fault in versions up to 0.3.6 and work again from 0.3.7):

1. Open the popup and tap **Send**.
2. In the recipient field, type `@` followed by the handle (for example `@liviu`) instead of a `qor1…` address.
3. QoreX resolves the handle and shows you the **resolved address** before you sign anything — always check this against what you expect.
4. Enter the amount and confirm.

Resolution is verified two ways before QoreX will use it: a registry attestation checked against a trust key built into the extension, and the handle owner's own signature over the claim. A response that fails either check is rejected outright — QoreX does not fall back to showing an unverified address. The first time you pay a given handle, QoreX remembers (pins) the address it resolved to; if that handle later resolves to a **different** address, QoreX stops and shows you both the old and new address in full so you can decide whether to continue. This memory lives **per browser** — paying the same handle for the first time from a different browser or computer shows it as new there too. That's expected, not an error.

## Receive {#receive}

Tap **Receive** in the popup to show your `qor1…` address as a QR code (with the QoreChain icon embedded) alongside a copy button — scan it from a phone or paste the address directly.

**Network picker.** Receive can also show the address for Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis and Celestia, each with an "only this network" warning (QoreChain stays first).

## Stake from the extension {#stake}

Since **0.2.2**, the popup has its own **Stake** screen — a wallet created only in the extension no longer needs the mobile app to earn staking rewards.

1. Open the popup and go to **Stake**.
2. The screen lists active validators with their commission, your currently staked total, and any rewards waiting to be claimed. Validators the network has **jailed** are left out of the list — delegating to one is never what you want.
3. To delegate, pick a validator and an amount, then confirm. QoreX signs with the mandatory hybrid post-quantum signature, the same as a Send. While you type, it warns you if the amount would leave less than a transaction's fee (you could not unstake or claim until the account holds QOR again). With several accounts, choose which one stakes from the account selector on the Stake screen.
4. **Claim** collects rewards; **Claim & restake** compounds them back to the validators that earned them in one transaction. QoreX checks first that your **unlocked** QOR can pay the fee (it is paid before rewards arrive) and tells you if not.
5. **Unstake** starts the 21-day unbonding period and the amount appears under **Unstaking in progress** with the time left — see [Staking & Delegation](/user-guide/staking-and-delegation).
6. **Move stake** moves stake to one or several other validators (redelegate) — no unbonding wait, no penalty, rewards keep flowing. See [Move stake between validators](/qorex/portfolio-and-staking#move-stake).

Staking, delegation, and rewards happen exclusively on the **Native** lane, never through an EVM precompile.

### Approving a Dashboard staking request {#stake-dashboard}

The QoreChain [Dashboard](/dashboard/staking-and-validators) composes staking requests but cannot sign them — your key never leaves the extension's vault. When you click **Continue in QoreX** on the Dashboard, the request opens in the extension for you to review (validator and amount) and approve, exactly like a Send.

:::note If a transaction shows as "downgraded" instead of successful
The Dashboard occasionally shows a transaction as **downgraded** rather than a clean success. This means your funds moved, but the post-quantum signature layer wasn't found on chain for that transaction — it is not something you did wrong and not something you can fix from your side. It's a fault on our side; please report it to support so we can investigate. The message stays on screen deliberately rather than clearing, so you have time to read and report it.
:::

### Send on external networks {#send-external}

Besides QOR on the Native lane, the popup can send assets on external networks, all derived from the same recovery phrase (for EVM networks it shows the **maximum network fee** — "Network fee: at most …" — before you confirm):

| Kind | Networks | Bundled tokens |
|---|---|---|
| EVM | Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche C-Chain | ERC-20 entries (USDC and USDT across the EVM chains, DAI on Ethereum) |
| SVM | Solana | SPL entries (USDC, USDT) |
| Cosmos | Cosmos Hub, Osmosis, Celestia | Noble USDC over IBC; optional memo field |

Before an external transfer goes out you must tick an explicit acknowledgement: **"External networks accept only classical signatures — unlike your QOR, this transfer is NOT quantum-safe."** External chains cannot carry a post-quantum signature, and QoreX never hides that.

## Supported wallet standards {#standards}

QoreX exposes three interfaces, all injected on the page as `window.qorex` (`{ evm, native, svm }`) and discovered through the [`@qorechain/connect`](/sdk/overview) detection contracts.

| Standard | What it is | What it means for you as a dev |
|---|---|---|
| **EIP-1193** | The Ethereum provider JavaScript API (`request(...)`, events). | QoreX's EVM provider answers account and network queries — `eth_requestAccounts`, `eth_accounts`, `eth_chainId` and `wallet_switchEthereumChain` (any other chain returns the standard `4902`). It does **not** sign or send EVM transactions or messages yet: other methods return "EVM method … not yet supported". Use MetaMask or another EVM wallet for EVM-lane transactions (which now also need an open [EVM access window](#evm-window)). |
| **EIP-6963** | Multi-wallet provider discovery (announce / request events). | QoreX announces itself alongside every other wallet — it **never overwrites `window.ethereum`** — so the user picks QoreX per site with no conflicts. |
| **Native provider (Keplr-style)** | `window.qorex.native`: `enable`, `getKey`, `signDirect` and `signAndBroadcast`, plus a `capabilities` list. It is **not** a full Keplr drop-in — QoreX does not alias `window.keplr` and has no `getOfflineSigner`, `signAmino` or `sendTx`. | To send a QoreChain transaction call **`signAndBroadcast`** (see [Sending a QoreChain transaction](#sign-and-broadcast)): QoreX shows the decoded messages and fee, adds the hybrid post-quantum signature that only the wallet can make, and broadcasts. `signDirect` on QoreChain is refused unless the transaction already carries a valid quantum-safe layer. |
| **Solana Wallet Standard** *(from 0.1.5)* | Native wallet discovery for Solana dApps (`wallet-standard:register-wallet` / `app-ready`). | Solana dApps **auto-detect QoreX** — no custom integration. Features: `standard:connect`, `standard:disconnect`, `standard:events`, `solana:signMessage`, `solana:signTransaction`, `solana:signAndSendTransaction`; chain `solana:mainnet`; both `legacy` and `v0` transactions. |

:::note Reaching the SVM lane directly
The same interface is also available on `window.qorex.svm` (`connect` / `signAndSendTransaction` / `signMessage`). Wallet-Standard auto-discovery and the fully implemented SVM lane shipped in **0.1.5** and are live on both Chrome and Firefox (see [which version is live where](#versions)).

Solana approvals show **one line per instruction**, decoded where QoreX can: SOL transfers (recipient and lamports), SPL token transfers, **"ALLOW SPENDING of your tokens"** (approve), **"HAND OVER control of the account"** (set authority) and closing a token account — and say "instruction QoreX cannot read" for anything else, with the program. A request that includes an approve or set-authority instruction is headlined "wants authority over your Solana tokens — read every line below". Transactions that do not list your wallet as a signer are rejected, `signMessage` will not sign bytes that are really a transaction, and the signature is marked **classical** — see [Post-quantum signing](#pqc).
:::

## Coins and tokens {#custom-tokens}

The popup's **Coins and tokens** screen lets you add an **ERC-20 token by its contract**: pick the network, paste the contract address, **Check contract**. QoreX reads the token's name and decimals from the contract itself — and reads it again in the background when you add it, rather than trusting the popup — then shows them with a reminder that anyone can create a token with any name. The token then appears in **Send on external networks**. It refuses bundled tokens, duplicates, non-EVM networks, bad addresses, unreadable contracts and contracts that borrow the name of a bundled token.

## Connected sites {#connected-sites}

**Connected sites** in the popup lists every site this wallet has approved — a site can see this wallet's address and ask you to sign. Tap **Revoke** to remove one. Approvals are kept **per wallet**: a site approved for one wallet cannot read another wallet's address after you switch.

## EVM access window {#evm-window}

The popup's **EVM access window** screen opens and closes the window that lets an Ethereum-style (coin 60) account send on QoreChain's EVM lane (v3.2.0 and later) — the same screen as in the app, with the same limits (up to 17,280 blocks and 1,000 transactions, and a QOR cap that counts each amount plus its maximum fee). See [EVM access window](/qorex/security-and-recovery#evm-window).

## Language {#language}

The extension speaks the same ten languages as the mobile app, dashboard, and site: English, Romanian, German, Spanish, French, Italian, Turkish, Arabic, Japanese, and Korean. It follows your **browser's** language by default (falling back to English for anything else) — note this is a different source than the mobile app, which follows the **phone's** language, so the two can show different languages if your phone and browser are set differently. A picker on the popup's idle screen lets you override the detected language at any time; switching to Arabic flips the popup to right-to-left immediately, not just the text.

## Security & permissions {#security}

QoreX is built to be verifiable, not just trusted:

- **Vault** — your keys are sealed with **AES-256-GCM**. The password path derives its key with **Argon2id** (RFC 9106, memory-hard: 64 MiB, t=3, p=1), so an exfiltrated vault blob resists GPU/ASIC cracking. (Legacy PBKDF2 blobs remain openable and re-seal to Argon2id on next unlock.)
- **Passkey unlock (optional, from 0.1.5)** — where your authenticator supports the **WebAuthn PRF** extension, QoreX can unlock the vault from the passkey's 32-byte PRF output instead of a typed password. Your password always remains a fallback.

  :::note Where passkey unlock appears
  QoreX feature-detects WebAuthn and only shows **Enable passkey unlock** where the browser exposes it to extension pages — that is **Chrome and Edge**. On **Firefox** the option is hidden, because Firefox does not expose WebAuthn to extension pages. This is expected, not a bug.
  :::
- **Manifest V3 + strict CSP** — `script-src 'self'; object-src 'self'; base-uri 'self'`. There is **no remote code loading** after install and no `wasm-unsafe-eval`.
- **No analytics, no crash reporting, no tracking SDK, no sign-up** — the extension needs no account to hold, send or stake QOR. Your keys, recovery phrase, vault and approvals never leave the browser. It does make network requests: to the public QoreChain endpoints for balances, history and broadcasting (these carry your public `qor1…` address), a price lookup (no address), the public services of any external network you hold or view (your public address on that network), and the @handle registry (the handle, or a public address). Only if you use [Dashboard pairing](#dashboard-bridge) does it send a signed proof that you own the address. See [What QoreX sends over the network](/qorex/overview#data-and-privacy).

### What permissions QoreX asks for, and why {#permissions}

This section exists because the Firefox listing surfaces the permission **"Access your data for all websites"**, which can look at odds with a wallet that declares no host permissions. Here is the exact, unedited truth from the manifest.

The extension's `manifest.json` declares:

```json
"permissions": ["storage"],
"host_permissions": [],
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["dist/content.js"], "run_at": "document_start" }
],
"web_accessible_resources": [
  { "resources": ["dist/inpage.js"], "matches": ["<all_urls>"], "use_dynamic_url": true }
]
```

- **`permissions: ["storage"]`** — the only API permission. It stores the encrypted vault and your per-origin connection approvals **locally**, in extension storage.
- **`host_permissions: []`** — QoreX declares **no** host permissions. It does not request the ability to make cross-origin network requests to arbitrary sites on your behalf.
- **`web_accessible_resources`** — lets pages load QoreX's own `inpage.js`, the small script that exposes the provider. `use_dynamic_url` gives it a per-session address so sites cannot fingerprint the extension by probing for it.
- **`content_scripts` matches `<all_urls>`** — this is the honest reason Firefox says *"Access your data for all websites."* QoreX injects a small provider script (`content.js` → `inpage.js`) into **every page**. A content script that runs on all sites *can* technically read the page, and browsers describe that capability with that exact wording — whether it comes from `host_permissions` or from a content-script match.

**Why the content script runs everywhere.** So that **any** dApp can discover the wallet through EIP-6963 without you first granting per-site access. This is how MetaMask, Keplr, Phantom and every other injected wallet work: the injected provider must be present before the page's scripts run (`document_start`), on whatever site you visit.

**What that script does — and does not do.** It only bridges wallet messages (announce the provider, forward connect/sign requests to the service worker, return the result). It does **not** read page content beyond those wallet requests, send anything to a server, or load remote code — and it can't fetch arbitrary cross-origin data because there are no host permissions. All of this is verifiable: the extension is CSP-locked, ships no analytics, and the Firefox package includes a reproducible source zip.

## Connect a dApp to QoreX {#connect}

A dApp discovers QoreX through **EIP-6963**. Announce-and-request, then use the returned EIP-1193 provider (which answers account and network queries only — see the table above):

```ts
import type { EIP6963ProviderDetail } from "./types";

const wallets = new Map<string, EIP6963ProviderDetail>();

// 1. Collect every wallet that announces itself.
window.addEventListener("eip6963:announceProvider", (event) => {
  const detail = (event as CustomEvent<EIP6963ProviderDetail>).detail;
  wallets.set(detail.info.rdns, detail);
});

// 2. Ask installed wallets to announce.
window.dispatchEvent(new Event("eip6963:requestProvider"));

// 3. Pick QoreX by its rdns and use the standard EIP-1193 provider.
const qorex = wallets.get("network.qore.qorex");
if (qorex) {
  const accounts = await qorex.provider.request({ method: "eth_requestAccounts" });
  console.log("QoreX EVM account:", accounts[0]);
}
```

For the QoreChain **Native** lane, use the provider at `window.qorex.native` (`enable`, `getKey`, `signAndBroadcast`, `signDirect`; read `capabilities` to see what this build supports). The higher-level [`@qorechain/connect`](/sdk/overview) package wraps this detection for you.

Approvals are **per-origin**: the first connection to a site opens an approval popup showing the origin, approving reveals only your public address, and one site's approval grants nothing to another. Approvals are kept per wallet, persist until you revoke them under **Connected sites**, and one site can have one request waiting (three in all); switching wallet or locking answers waiting requests with "no". See [What the approval window shows](/qorex/security-and-recovery#approvals).

### Dashboard bridge (v0.1.5, extended in v0.2.2) {#dashboard-bridge}

Version 0.1.5 adds a bridge scoped to **`dashboard.qorechain.io` only**: `window.qorex.native.connectProof(sessionId)` signs the *Connect with QoreX* pairing proof (the backend re-verifies the signature), and `executeTransfer({ to, amountUqor, memo })` approves and broadcasts a Dashboard-proposed QOR transfer, returning the `txHash`. These methods are refused on any other origin.

**0.2.2** adds `native:executeRequest`, which accepts a whole Dashboard-proposed request — including [staking](#stake-dashboard) — validated against the same shared parser QoreX uses everywhere else: refused on a network mismatch, a foreign origin, an address that isn't yours, an unknown request kind, or a staking request that carries a `toAddress` (staking requests don't have one). The request kinds are send, delegate, undelegate, redelegate and claim; a Connect request lets you choose which of your accounts to link, and `listAccounts()` returns your accounts (read-only).

Because a `qor1…` address is equally valid on mainnet and testnet, a Dashboard-proposed request states which network it targets, and QoreX refuses to act on it if that doesn't match the network the extension is currently connected to — it will never switch networks on a request's behalf.

## Sending a QoreChain transaction from a dApp: `signAndBroadcast` {#sign-and-broadcast}

Every QoreChain transaction from an account with a registered post-quantum key needs a hybrid signature — secp256k1 **and** ML-DSA-87 — and only the wallet holds the ML-DSA key, so a page cannot build it. Send the messages; QoreX does the rest: it shows the decoded messages and fee, builds the transaction for the account the user selected, adds the hybrid signature (registering the account's post-quantum key first if this is its first transaction), broadcasts, and resolves with the result. Available from extension **0.3.5** and app **1.1.5** (every store build today).

```js
const provider = window.qorex.native;
if (!provider.capabilities?.includes("signAndBroadcast")) {
  throw new Error("Please update QoreX");
}
await provider.enable("qorechain-vladi");            // connect, once per site

const res = await provider.signAndBroadcast({
  chainId: "qorechain-vladi",                        // must be the wallet's active network
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: msgSendBytes }],  // protobuf bytes: Uint8Array, number[] or base64
  memo: "",                                          // optional, up to 256 bytes
  gasLimit: 300000,                                  // optional
});
// → { txHash, code, height?, shield }
```

- `chainId` must equal the wallet's active network (`qorechain-vladi` on mainnet). A dApp cannot switch the network; only the user can.
- 1–32 messages per call; the message bytes are signed exactly as sent.
- The fee (`gasLimit` × the network's gas price) is shown before approval. A rejection throws `QoreX: signature rejected`.
- Post-quantum key management (register, migrate, rotate — also inside authz `MsgExec`) is refused: the wallet manages the account's key itself.

## Post-quantum signing {#pqc}

Every QOR transfer QoreX itself initiates is signed with a **hybrid post-quantum signature** — **ML-DSA-87** (Dilithium-5, NIST **FIPS-204**) alongside the classical secp256k1 signature — using the full hybrid pipeline in `@qorechain/sdk`. **There is no toggle**: QoreChain requires it and QoreX never sends a Native-lane QOR transfer without it.

- **dApp-initiated Native signing** — use [`signAndBroadcast`](#sign-and-broadcast): QoreX decodes every message, shows the fee, and adds the quantum-safe layer itself. `signDirect` signs a transaction the page built and, on QoreChain, is **refused** unless that transaction already carries a valid quantum-safe layer (and refused for Ethereum-style accounts, which use `signAndBroadcast`). QoreX never blind-signs: a request it cannot decode is refused, and it never signs a classical-only QoreChain transaction.
- **Classical signatures are always labeled** — transfers on external networks (ETH, BNB, Solana, …) cannot carry a post-quantum signature; QoreX makes you tick an explicit acknowledgement and marks them classical rather than silently downgrading.

**What this means for transaction size.** ML-DSA-87 is a large signature: the signature is **4,627 bytes** and the public key **2,592 bytes** (fixed by FIPS-204). A hybrid QoreChain transaction is therefore several kilobytes larger than a purely classical one. If you build and broadcast transactions yourself, size your buffers and fee estimates for the extra bytes; QoreChain's gas accounting already expects them. See [Post-Quantum Signing](/developer-guide/post-quantum-signing) for the primitives and the deterministic-signing requirement.
