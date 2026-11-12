---
slug: /build-before-qday/workshop-1
title: "Workshop 1: Your first hybrid-signed transaction"
sidebar_label: "Workshop 1"
sidebar_position: 2
date: 2026-11-12
---

# Workshop 1: Your first hybrid-signed transaction

Workshop 1 took place on 12 November 2026. This page is the step-by-step guide to everything shown, so you can redo it yourself. Recording: linked here when published.

## What we built {#what-we-built}

A complete Solidity project scaffolded with one command, deployed to the QoreChain testnet, followed by one transaction signed with **two keys at once** and checked by the chain.

Innovations it shows:

- **Hybrid signing.** The transaction carries a classical secp256k1 signature and a post-quantum ML-DSA-87 signature.
- **One hybrid-signed transaction verified on chain.** The validators verify both signatures. You read the proof from the public REST endpoint (the `PQCHybridSignature` extension and the `pqc_hybrid_verify` event) and in the explorer.
- **The EVM authorisation window.** An Ethereum transaction cannot carry a post-quantum signature, so on QoreChain you register your ML-DSA-87 key once and open a short window, with a hybrid-signed message, during which your normal EVM transactions are admitted. See [Deploy in 5 Minutes](/getting-started/deploy-in-5-minutes) for the idea in depth.

This is exactly what the Quantum Pass level asks for.

## Prerequisites {#prerequisites}

- Node.js and `pnpm` installed.
- The testnet `qorechain-diana` (EVM chain ID 9800), which runs release v3.2.8 since 12 November 2026.
- Public endpoints used in this guide:

| Service | URL |
| --- | --- |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` |
| Explorer | `https://explore.qore.network` (switch to Testnet) |
| Faucet | `https://dashboard.qorechain.io/faucet` (sign-in required) |

:::caution Throwaway testnet keys only
Use keys made for this exercise, holding test QOR only. Never put a key or recovery phrase of an account that holds real funds into `.env`, and never commit `.env` to git.
:::

## Where it is published {#published}

| What | Registry and name | Version |
| --- | --- | --- |
| Scaffolder | npm, `create-qorechain-dapp` | 0.13.1 |
| QoreChain SDK | npm, `@qorechain/sdk` | 0.13.0 |
| QoreX app | App Store and Google Play (iOS, Android) | 1.2.3 |
| QoreX browser extension | Chrome Web Store and Firefox add-ons (Chrome, Firefox) | 0.4.2 |

The versions in the QoreX rows are the ones used in the workshop. Check [QoreX](/qorex/overview) for the current stamps.

## Steps {#steps}

### Step 1: Scaffold the project {#step-1}

```bash
npx create-qorechain-dapp@latest qday-demo -t hardhat --network testnet --package-manager pnpm
cd qday-demo
pnpm test
```

You should see `Done! Created qday-demo`, and then `2 passing` from the tests. Check the version with `npx create-qorechain-dapp@latest --version`: it should print `0.13.1`.

Look at what you got: `contracts/Counter.sol`, `ignition/modules/Counter.ts`, `scripts/window.ts` (the helper for the authorisation window) and `hardhat.config.ts` with the `qorechainTestnet` network (chain ID 9800). More on the templates: [Scaffolders and CLI](/developer-tools/scaffolders-and-cli) and [Chain developer kit](/developer-tools/chain-dev-sdk).

### Step 2: Create the `.env` file {#step-2}

Create a throwaway testnet account and put it in `.env`. There are two ways.

**With a private key and a recovery code:**

```bash
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1...
```

The recovery code is how the template derives your ML-DSA-87 key when you use `PRIVATE_KEY`. Create a new one with:

```bash
pnpm window recovery-code
```

Keep the code apart from the private key.

**With a mnemonic:**

```bash
QORE_MNEMONIC="..."
```

With `QORE_MNEMONIC`, both keys come from the same phrase and no recovery code is needed.

### Step 3: Get testnet QOR from the faucet {#step-3}

1. Open the [faucet](https://dashboard.qorechain.io/faucet) and sign in.
2. Paste your `qor1...` address (or choose **Use my address**).
3. Select **Request Tokens**. The card shows **Tokens Sent!** with 100 QOR, plus the fest test tokens, and a **View on Explorer** link.

The faucet pays once every 24 hours per account and per address. The exact amounts are on [Faucet](/dashboard/faucet). Check the balance and the account state:

```bash
pnpm window status
```

### Step 4: Connect QoreX (EVM lane) {#step-4}

For the dApps you will connect from a browser, use [QoreX](/qorex/overview): the app 1.2.3 (iOS, Android) or the browser extension 0.4.2 (Chrome, Firefox).

1. Switch QoreX to the testnet. In the app: Settings, **Use testnet (developers)**. In the extension: unlock it, tap the version number at the bottom seven times, then choose **Switch to testnet (diana)**.
2. For the EVM lane, open **Your accounts** and tap **Add an Ethereum account (coin 60)**. See [Deploy in 5 Minutes](/getting-started/deploy-in-5-minutes#step-import) for why coin 60 matters.
3. Fund that account from the faucet, then connect it to a dApp. QoreX holds two keys, secp256k1 and ML-DSA-87. The dApp never sees the post-quantum key: QoreX signs with both. See [Browser extension](/qorex/browser-extension) and [dApp browser](/qorex/dapp-browser).

The deploy in step 5 does not depend on QoreX.

### Step 5: Register, open the window, deploy {#step-5}

```bash
pnpm window status
pnpm window register
pnpm window open
```

Expected output: `registered: <HASH>`, then `opened: <HASH>`, then a line like `window: 600 blocks, 5 txs, 3750000 uqor`. Registration is a one-time step per account and is signed with the classical key, as the chain requires for registering. Opening the window is itself a hybrid-signed transaction.

Wait about 10 seconds, because the window advances the account nonce. Then:

```bash
pnpm build
pnpm deploy:testnet
```

Answer `y` to "Confirm deploy to network qorechainTestnet (9800)?". You should see `CounterModule#Counter - 0x...`.

### Step 6: Send one hybrid transaction and verify it {#step-6}

Send any transaction signed hybrid. The easiest ways are:

- the [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) example app, connected to QoreX, which sends a transaction and shows the verification itself;
- a native send from QoreX with the testnet selected;
- one of the language apps listed in [The example apps](#example-apps).

Then check the proof yourself with the transaction hash:

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

Look for:

1. `tx_response.code` equal to `0`.
2. In the transaction body, the `PQCHybridSignature` extension holding the ML-DSA-87 signature: **4,627 bytes**, next to the 64-byte secp256k1 signature.
3. In `tx_response.events`, the event `pqc_hybrid_verify` with the attribute `status` set to `verified`. To print only that event:

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> \
  | jq '.tx_response.events[] | select(.type=="pqc_hybrid_verify")'
```

For reference, a check of this kind on the testnet on 12 November 2026 (release v3.2.8) gave: a key registration with code 0 using 299,233 gas, then a hybrid-signed transfer with code 0 using 187,494 gas, a `PQCHybridSignature` extension holding a 4,627-byte ML-DSA-87 signature, and `pqc_hybrid_verify` with `status` `verified`. The explorer shows the same signature size.

Finally open [explore.qore.network](https://explore.qore.network), switch to **Testnet**, and search for the hash. The transaction page shows the signature security as quantum-safe, verified on chain, with the ML-DSA-87 algorithm (FIPS 204).

That is the proof: the validators checked both signatures.

## Troubleshooting {#troubleshooting}

| What you see | Why | What to do |
| --- | --- | --- |
| `HHE10402` or "wait for confirmations" right after the window opened | The window open advanced the account nonce | Run `pnpm deploy:testnet` again |
| "EVM authorisation window exhausted" or "no window" | The window ran out of transactions or blocks, or it is scoped to another contract (a window scoped to another contract blocks a deploy) | Run `pnpm window open` to open a new window, wait about 10 seconds, then deploy again |
| "account has no PQC key and classical fallback is disabled" | The account has not registered an ML-DSA-87 key | Run `pnpm window register` first, then open the window |
| "Rate Limit Reached" on the faucet, or no tokens after 30 seconds | One claim per 24 hours per account and per address, and requests are served one at a time | Wait a few seconds and retry, or wait for the cooldown to end |
| A browser app cannot call the public REST (CORS error) | The public REST sends no CORS headers | Call REST from a server or through a proxy. The `create-qorechain-dapp` 0.13.1 browser templates proxy REST through `/lcd` |
| `pnpm window` stops with a message about a missing recovery code | You use `PRIVATE_KEY` without `QORE_PQC_RECOVERY_CODE` | Run `pnpm window recovery-code`, put the code in `.env` or use `QORE_MNEMONIC` |

## The example apps {#example-apps}

The same flow, from several languages and front ends. Each one signs hybrid.

All example apps live in the public repository https://github.com/qorechain/build-before-qday, folder `workshop-1` (the link works once the repository is published; the code is also shown inline on each app page).

| App | Language | Page |
| --- | --- | --- |
| Q-Day Counter | TypeScript, Solidity | [qday-counter](/build-before-qday/workshop-1/apps/qday-counter) |
| Q-Day Guestbook | TypeScript, Solidity | [qday-guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) |
| Hybrid Inspector | TypeScript | [hybrid-inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) |
| Q-Day Pay | Rust | [rust-qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) |
| Q-Day Tip Jar | Java | [java-tipjar](/build-before-qday/workshop-1/apps/java-tipjar) |
| Q-Day Airdrop | Python | [python-airdrop](/build-before-qday/workshop-1/apps/python-airdrop) |

The Rust app was built and compiled; the on-chain run has not been verified yet. The kits and registries behind these apps are listed on [Kits](/build-before-qday/workshop-1/kits).

## Recording {#recording}

Linked here when published.
