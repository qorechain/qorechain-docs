---
slug: /qorex/browser-extension
title: QoreX Browser Extension
sidebar_label: Browser Extension
sidebar_position: 2
---

# QoreX Browser Extension

The QoreX **browser extension** is the desktop QoreChain wallet. It is a **standalone wallet** — create or import a wallet, hold and send QOR, and connect to dApps — and it is the piece that lets any website discover QoreX and turn every request into an explicit, decoded approval.

It is **live and public** on three stores.

## Install {#install}

| Browser | Install |
|---|---|
| **Chrome and Chromium browsers** (Brave, Edge, Arc, Opera) | https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg |
| **Firefox** | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 10.14 or later)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

### Which version is live where {#versions}

Store reviews land at different times, so the published version currently differs per browser:

| Browser | Published version |
|---|---|
| **Firefox** | **0.2.2** |
| **Chrome / Chromium** | **0.1.5** (0.1.9 submitted, still in review; the listing is locked to new submissions until that review clears, so 0.2.2 hasn't been submitted there yet) |
| **Safari (macOS)** | ships inside the **QoreX Wallet** macOS app, which uses its own `1.x` numbering — the Mac App Store currently serves **1.3** (carries extension **0.2.2**) |

Newer features may not be live in your browser yet — check the table above before assuming something described here is available. If the Dashboard tells you your extension needs updating, it means a specific minimum version for that action (usually 0.2.2, for staking) — not that your build is generally old.

**0.1.5** added [Solana Wallet Standard discovery](#standards), [passkey unlock](#security), a fully implemented [SVM dApp lane](#standards), and the [Dashboard connection bridge](#dashboard-bridge). (Version 0.1.4 was never published — its changes reach users with 0.1.5.)

**0.1.6–0.1.9** added, in order: vesting-aware sends with honest bank-refusal messages; the account address and live balance shown directly on the popup home; and, in **0.1.9**, [paying an @handle](#handle-send) straight from Send, a [Receive screen with an address QR code](#receive), a [language picker](#language) (ten languages, matching the mobile app's set), and the removal of a confusing "next unlock date" from the [vesting balance](#vesting).

**0.2.2** added [staking, from the extension itself](#stake) — its own Stake screen (validators with commission, your staked total, waiting rewards, and delegate / unstake / claim); [several accounts from one recovery phrase](#wallet), the same as the mobile app; the fix that lets the **Dashboard's** staking button actually reach the extension (a wallet created only in the extension previously couldn't stake through the Dashboard at all — see [Dashboard bridge](#dashboard-bridge)); working @handle claiming from the browser; and the build number shown at the foot of the popup.

**The permission surface has not changed since 0.1.3** — see [What permissions QoreX asks for](#permissions).

:::note
On Safari, approvals open in a browser tab rather than a popup window — the extension is packaged with Apple's Safari web-extension wrapper from the same codebase.
:::

## Create or restore a wallet {#wallet}

Open the popup and choose:

- **Create wallet** — generates a fresh 24-word recovery phrase on your device (256-bit entropy), derives your QoreChain identity, and seals it in the vault under a password (and, optionally, a passkey — see [Security](#security)).
- **Import wallet** — restore from an existing 24-word phrase.

The extension holds its own keys; it does not require the mobile app. You can also export your mnemonic from the popup. Keys never leave the device.

:::note Several accounts from one phrase (from 0.2.2)
The extension can now create and switch between several accounts from the same recovery phrase, the same as the mobile app — the phrase you already wrote down restores every one of them. Switching moves everything with it: sending, staking, receiving, and your @handle all follow whichever account is active. Portfolio, Q-Day Scanner, social recovery, Legacy Protocol, payment requests, and device linking remain mobile-only — see [QoreX Wallet](/qorex/overview#platform-availability) for the full comparison.
:::

## Your account, balance & @handle {#account}

The popup's idle screen shows your `qor1…` address (tap to copy) and your live QOR balance, so you don't need to open a block explorer to check either.

### Vesting (locked) balances {#vesting}

If your account holds vesting QOR (for example, an unreleased TGE allocation), the balance splits into **available now** and **still locked**, and a send that exceeds the available amount is refused before it reaches the network rather than failing on-chain after taking a fee. QoreX deliberately does **not** show a "next unlock date" here: a vesting schedule can be amended by governance, so a date on the balance card would read as a promise QoreX can't guarantee. The available-vs-locked split is what stays accurate.

### Claim an @handle

From the popup you can claim a unique **@handle** (for example `@liviu`) for this account's address, the same as in the mobile app. The claim is signed with the account's own key and binds to that address, so the mobile app and the Dashboard can resolve it when someone sends to you. See [@handle](/qorex/account-and-dashboard#handle) for how handles are bound to addresses (not to a wallet as a whole).

## Send to an @handle {#handle-send}

Since 0.1.9 you can pay a registered @handle directly instead of looking up an address:

1. Open the popup and tap **Send**.
2. In the recipient field, type `@` followed by the handle (for example `@liviu`) instead of a `qor1…` address.
3. QoreX resolves the handle and shows you the **resolved address** before you sign anything — always check this against what you expect.
4. Enter the amount and confirm.

Resolution is verified two ways before QoreX will use it: a registry attestation checked against a trust key built into the extension, and the handle owner's own signature over the claim. A response that fails either check is rejected outright — QoreX does not fall back to showing an unverified address. The first time you pay a given handle, QoreX remembers (pins) the address it resolved to; if that handle later resolves to a **different** address, QoreX stops and shows you both the old and new address in full so you can decide whether to continue.

## Receive {#receive}

Tap **Receive** in the popup to show your `qor1…` address as a QR code (with the QoreChain icon embedded) alongside a copy button — scan it from a phone or paste the address directly.

## Stake from the extension {#stake}

Since **0.2.2**, the popup has its own **Stake** screen — a wallet created only in the extension no longer needs the mobile app to earn staking rewards.

1. Open the popup and go to **Stake**.
2. The screen lists active validators with their commission, your currently staked total, and any rewards waiting to be claimed. Validators the network has **jailed** are left out of the list — delegating to one is never what you want.
3. To delegate, pick a validator and an amount, then confirm. QoreX signs with the mandatory hybrid post-quantum signature, the same as a Send.
4. **Unstake** and **claim** work from the same screen. Unstaking starts the 21-day unbonding period — see [Staking & Delegation](/user-guide/staking-and-delegation) for what that means.

Staking, delegation, and rewards happen exclusively on the **Native** lane, never through an EVM precompile.

### Approving a Dashboard staking request {#stake-dashboard}

The QoreChain [Dashboard](/dashboard/staking-and-validators) composes staking requests but cannot sign them — your key never leaves the extension's vault. When you click **Continue in QoreX** on the Dashboard, the request opens in the extension for you to review (validator and amount) and approve, exactly like a Send. This connection was broken in 0.2.1 (the extension reported itself as "too old" even when it was the newest published build — the real issue was a missing internal hop, not version staleness); it's fixed as of **0.2.2**. If you're on an older build, see [which version is live where](#versions).

:::note If a transaction shows as "downgraded" instead of successful
The Dashboard occasionally shows a transaction as **downgraded** rather than a clean success. This means your funds moved, but the post-quantum signature layer wasn't found on chain for that transaction — it is not something you did wrong and not something you can fix from your side. It's a fault on our side; please report it to support so we can investigate. The message stays on screen deliberately rather than clearing, so you have time to read and report it.
:::

### Send on external networks {#send-external}

Besides QOR on the Native lane, the popup can send assets on external networks, all derived from the same recovery phrase:

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
| **EIP-1193** | The Ethereum provider JavaScript API (`request(...)`, events). | Your existing ethers.js / viem / web3.js code talks to QoreX's EVM lane unchanged; numeric error codes (e.g. `4902`) are forwarded verbatim. |
| **EIP-6963** | Multi-wallet provider discovery (announce / request events). | QoreX announces itself alongside every other wallet — it **never overwrites `window.ethereum`** — so the user picks QoreX per site with no conflicts. |
| **Keplr-pattern `signDirect`** | A Cosmos `OfflineDirectSigner`-shaped provider on `window.qorex.native`. | Cosmos-style dApps sign QoreChain **Native-lane** transactions the same way they would with Keplr; the post-quantum layer is pre-applied (see [Post-quantum signing](#pqc)). |
| **Solana Wallet Standard** *(from 0.1.5)* | Native wallet discovery for Solana dApps (`wallet-standard:register-wallet` / `app-ready`). | Solana dApps **auto-detect QoreX** — no custom integration. Features: `standard:connect`, `standard:disconnect`, `standard:events`, `solana:signMessage`, `solana:signTransaction`, `solana:signAndSendTransaction`; chain `solana:mainnet`; both `legacy` and `v0` transactions. |

:::note Reaching the SVM lane directly
The same interface is also available on `window.qorex.svm` (`connect` / `signAndSendTransaction` / `signMessage`). Wallet-Standard auto-discovery and the fully implemented SVM lane shipped in **0.1.5** and are live on both Chrome and Firefox (see [which version is live where](#versions)).

Solana approvals show the decoded payload (recipient and lamports for System transfers, and the program list), reject transactions that do not list your wallet as a signer, and mark the signature as **classical** — see [Post-quantum signing](#pqc).
:::

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
- **No account, no telemetry** — no analytics, no tracking, no remote logging, no sign-up, and no email. The Firefox listing declares data collection as `none`.

### What permissions QoreX asks for, and why {#permissions}

This section exists because the Firefox listing surfaces the permission **"Access your data for all websites"**, which can look at odds with a wallet that declares no host permissions. Here is the exact, unedited truth from the manifest.

The extension's `manifest.json` declares:

```json
"permissions": ["storage"],
"host_permissions": [],
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["dist/content.js"], "run_at": "document_start" }
]
```

- **`permissions: ["storage"]`** — the only API permission. It stores the encrypted vault and your per-origin connection approvals **locally**, in extension storage.
- **`host_permissions: []`** — QoreX declares **no** host permissions. It does not request the ability to make cross-origin network requests to arbitrary sites on your behalf.
- **`content_scripts` matches `<all_urls>`** — this is the honest reason Firefox says *"Access your data for all websites."* QoreX injects a small provider script (`content.js` → `inpage.js`) into **every page**. A content script that runs on all sites *can* technically read the page, and browsers describe that capability with that exact wording — whether it comes from `host_permissions` or from a content-script match.

**Why the content script runs everywhere.** So that **any** dApp can discover the wallet through EIP-6963 without you first granting per-site access. This is how MetaMask, Keplr, Phantom and every other injected wallet work: the injected provider must be present before the page's scripts run (`document_start`), on whatever site you visit.

**What that script does — and does not do.** It only bridges wallet messages (announce the provider, forward connect/sign requests to the service worker, return the result). It does **not** read page content beyond those wallet requests, send anything to a server, or load remote code — and it can't fetch arbitrary cross-origin data because there are no host permissions. All of this is verifiable: the extension is CSP-locked, ships no analytics, and the Firefox package includes a reproducible source zip.

## Connect a dApp to QoreX {#connect}

A dApp discovers QoreX's EVM lane through **EIP-6963**. Announce-and-request, then use the returned EIP-1193 provider:

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

For the QoreChain **Native** lane, use the Keplr-pattern provider at `window.qorex.native` (`enable`, `getKey`, `signDirect`). The higher-level [`@qorechain/connect`](/sdk/overview) package wraps this detection for you.

Approvals are **per-origin**: the first connection to a site opens an approval popup showing the origin, approving reveals only your public address, and one site's approval grants nothing to another.

### Dashboard bridge (v0.1.5, extended in v0.2.2) {#dashboard-bridge}

Version 0.1.5 adds a bridge scoped to **`dashboard.qorechain.io` only**: `window.qorex.native.connectProof(sessionId)` signs the *Connect with QoreX* pairing proof (the backend re-verifies the signature), and `executeTransfer({ to, amountUqor, memo })` approves and broadcasts a Dashboard-proposed QOR transfer, returning the `txHash`. These methods are refused on any other origin.

**0.2.2** adds `native:executeRequest`, which accepts a whole Dashboard-proposed request — including [staking](#stake-dashboard) — validated against the same shared parser QoreX uses everywhere else: refused on a network mismatch, a foreign origin, an address that isn't yours, an unknown request kind, or a staking request that carries a `toAddress` (staking requests don't have one).

Because a `qor1…` address is equally valid on mainnet and testnet, a Dashboard-proposed request states which network it targets, and QoreX refuses to act on it if that doesn't match the network the extension is currently connected to — it will never switch networks on a request's behalf.

## Post-quantum signing {#pqc}

Every QOR transfer QoreX itself initiates is signed with a **hybrid post-quantum signature** — **ML-DSA-87** (Dilithium-5, NIST **FIPS-204**) alongside the classical secp256k1 signature — using the full hybrid pipeline in `@qorechain/sdk`. **There is no toggle**: QoreChain requires it and QoreX never sends a Native-lane QOR transfer without it.

- **dApp-initiated Native signing** — dApps built on the qorechain-connect flow pre-layer the PQC extension (`/qorechain.pqc.v1.PQCHybridSignature`) into the transaction body before calling `signDirect`; QoreX contributes the classical half and **refuses to blind-sign**, decoding the payload and marking whether the PQC layer is present.
- **Classical requests are always labeled** — if a request carries no PQC layer, or targets an external chain (ETH/BNB/etc., which cannot carry PQC), QoreX shows an explicit warning rather than silently downgrading.

**What this means for transaction size.** ML-DSA-87 is a large signature: the signature is **4,627 bytes** and the public key **2,592 bytes** (fixed by FIPS-204). A hybrid QoreChain transaction is therefore several kilobytes larger than a purely classical one. If you build and broadcast transactions yourself, size your buffers and fee estimates for the extra bytes; QoreChain's gas accounting already expects them. See [Post-Quantum Signing](/developer-guide/post-quantum-signing) for the primitives and the deterministic-signing requirement.
