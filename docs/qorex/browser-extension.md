---
slug: /qorex/browser-extension
title: Browser Extension
sidebar_label: Browser Extension
sidebar_position: 8
---

# Browser Extension

The QoreX **browser extension** (Chrome and Firefox; a Safari version is on the way with identical functionality) is the **dApp connector** for desktop. It lets websites discover your wallet and turns every request into an explicit approval. It pairs conceptually with the mobile app and does **not** include staking, portfolio, or account features — those live in the app.

## Set up

The extension pairs with a wallet created in the **QoreX mobile app**. If you open the popup before pairing, it says **"No wallet yet — create one in the QoreX app."**

## Unlock

The popup asks for your **vault password** (or a passkey where the browser supports passkey-derived keys). The vault is AES-256-GCM-encrypted in extension storage, it locks automatically, and every unlock is explicit.

## Connecting to dApps

Websites discover QoreX via **EIP-6963** (the multi-wallet standard) and the QoreChain connect contract. QoreX **never overwrites** `window.ethereum` or `window.keplr` — it appears **alongside** other wallets, and you pick which wallet to use per site.

1. A site requests a connection; the approval popup shows the **origin**.
2. Approving reveals only your **public address** to that origin.
3. Approvals are **per-origin**, persist across browser restarts, and one site's approval grants nothing to another.

## Signing

Every signature request opens an approval window showing the **decoded payload** — recipient, amount, network — never a bare hash.

- For Native-lane QoreChain transactions, the extension notes that the **dApp supplies the post-quantum layer** (the wallet signs the classical half — the same pattern established wallets use).
- If a request is **classical-only**, the popup shows an explicit warning: **"⚠ This request is a classical signature — the app did not add a quantum-safe layer."**
- **Reject** is always one click, and requests expire on their own.

## Send on external networks

From the popup you can send **ETH / BNB / POL / ARB / SOL** and **ERC-20 / SPL** tokens (the same seed derivations as the app). You must acknowledge the classical-signature note before sending; a result link opens the block explorer.

## Networks & security posture

- **Active network** — QoreChain **mainnet** by default (chain `0x2649` on the EVM lane). Testnet stays supported for dApps that request it, and cross-network signature requests are refused.
- **Permissions** — the extension requests **`storage` only**. The content script injects only the provider APIs; it does not read page content beyond wallet requests, and there is no analytics and no remote code.
