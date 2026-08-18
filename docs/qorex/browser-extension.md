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

The current public build is **0.1.3**. Version **0.1.5** is rolling out now; it adds the [Dashboard connection bridge](#dashboard-bridge). The permission surface is unchanged across these versions.

:::note
On Safari, approvals open in a browser tab rather than a popup window — the extension is packaged with Apple's Safari web-extension wrapper from the same codebase.
:::

## Create or restore a wallet {#wallet}

Open the popup and choose:

- **Create wallet** — generates a fresh 24-word recovery phrase on your device (256-bit entropy), derives your QoreChain identity, and seals it in the vault under a password (and, optionally, a passkey — see [Security](#security)).
- **Import wallet** — restore from an existing 24-word phrase.

The extension holds its own keys; it does not require the mobile app. You can also export your mnemonic from the popup. Keys never leave the device.

## Supported wallet standards {#standards}

QoreX exposes three interfaces, all injected on the page as `window.qorex` (`{ evm, native, svm }`) and discovered through the [`@qorechain/connect`](/sdk/overview) detection contracts.

| Standard | What it is | What it means for you as a dev |
|---|---|---|
| **EIP-1193** | The Ethereum provider JavaScript API (`request(...)`, events). | Your existing ethers.js / viem / web3.js code talks to QoreX's EVM lane unchanged; numeric error codes (e.g. `4902`) are forwarded verbatim. |
| **EIP-6963** | Multi-wallet provider discovery (announce / request events). | QoreX announces itself alongside every other wallet — it **never overwrites `window.ethereum`** — so the user picks QoreX per site with no conflicts. |
| **Keplr-pattern `signDirect`** | A Cosmos `OfflineDirectSigner`-shaped provider on `window.qorex.native`. | Cosmos-style dApps sign QoreChain **Native-lane** transactions the same way they would with Keplr; the post-quantum layer is pre-applied (see [Post-quantum signing](#pqc)). |

:::note SVM (Solana-compatible)
An SVM provider is exposed on `window.qorex.svm` with `connect` / `signAndSendTransaction` / `signMessage`. QoreX does **not** yet register through the Solana **Wallet Standard** discovery protocol, so Solana dApps that rely on Wallet-Standard auto-discovery will not detect QoreX automatically — reach it through `window.qorex.svm` directly for now.
:::

## Security & permissions {#security}

QoreX is built to be verifiable, not just trusted:

- **Vault** — your keys are sealed with **AES-256-GCM**. The password path derives its key with **Argon2id** (RFC 9106, memory-hard: 64 MiB, t=3, p=1), so an exfiltrated vault blob resists GPU/ASIC cracking. (Legacy PBKDF2 blobs remain openable and re-seal to Argon2id on next unlock.)
- **Passkey unlock (optional)** — where your authenticator supports the **WebAuthn PRF** extension, QoreX can unlock the vault from the passkey's 32-byte PRF output instead of a typed password.
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

### Dashboard bridge (v0.1.5) {#dashboard-bridge}

Version 0.1.5 adds a bridge scoped to **`dashboard.qorechain.io` only**: `window.qorex.native.connectProof(sessionId)` signs the *Connect with QoreX* pairing proof (the backend re-verifies the signature), and `executeTransfer({ to, amountUqor, memo })` approves and broadcasts a Dashboard-proposed QOR transfer, returning the `txHash`. These methods are refused on any other origin.

## Post-quantum signing {#pqc}

Every QOR transfer QoreX itself initiates is signed with a **hybrid post-quantum signature** — **ML-DSA-87** (Dilithium-5, NIST **FIPS-204**) alongside the classical secp256k1 signature — using the full hybrid pipeline in `@qorechain/sdk`. **There is no toggle**: QoreChain requires it and QoreX never sends a Native-lane QOR transfer without it.

- **dApp-initiated Native signing** — dApps built on the qorechain-connect flow pre-layer the PQC extension (`/qorechain.pqc.v1.PQCHybridSignature`) into the transaction body before calling `signDirect`; QoreX contributes the classical half and **refuses to blind-sign**, decoding the payload and marking whether the PQC layer is present.
- **Classical requests are always labeled** — if a request carries no PQC layer, or targets an external chain (ETH/BNB/etc., which cannot carry PQC), QoreX shows an explicit warning rather than silently downgrading.

**What this means for transaction size.** ML-DSA-87 is a large signature: the signature is **4,627 bytes** and the public key **2,592 bytes** (fixed by FIPS-204). A hybrid QoreChain transaction is therefore several kilobytes larger than a purely classical one. If you build and broadcast transactions yourself, size your buffers and fee estimates for the extra bytes; QoreChain's gas accounting already expects them. See [Post-Quantum Signing](/developer-guide/post-quantum-signing) for the primitives and the deterministic-signing requirement.
