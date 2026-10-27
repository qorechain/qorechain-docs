---
slug: /dashboard/developers
title: Developers
sidebar_label: Developers
sidebar_position: 13
---

# Developers

The **Developers** page (`/developers`, sidebar **Build**, entry **Developers**) is a public toolbox for people building on QoreChain. It has six tabs: **SDKs**, **PQ key status**, **Simulator**, **Signing playground**, **QoreX test wallet** and **AI agents (MCP)**. You can check which post-quantum key an account has registered and whether its EVM authorisation window is open, dry-run a signed transaction, practise hybrid signing with a throwaway key, and exercise a dApp against a mock QoreX wallet, all in the browser and without an account. It is for dApp, wallet and backend developers. For the SDKs themselves see [SDK Overview](/sdk/overview) and [Install](/sdk/install).

## Innovations {#innovations}

- **Read a PQC key and EVM window from the chain, for any address.** The PQ key status tab looks up the ML-DSA-87 key an account registered and its EVM authorisation window through the chain's own query routes, on mainnet or testnet. It accepts `qor1...`, `0x...` and `qorvaloper1...` addresses.
- **A dry-run that broadcasts nothing.** The simulator posts a signed transaction to the chain's simulate route and reports the gas used, a suggested gas limit and the balance changes and events the transaction would produce. The only write route the Dashboard exposes for this is simulate.
- **Hybrid signing in the browser, on a key that never leaves it.** The signing playground generates a throwaway 24-word phrase in the page, derives a secp256k1 key and an ML-DSA-87 key, and signs and verifies messages and Sign In With QoreChain requests with the [QoreSign](/qoresign/overview) library. The key lives in memory only and vanishes on reload.
- **A mock QoreX for testing dApps.** The QoreX test wallet installs `window.qorex` and announces itself over EIP-6963 as "QoreX (mock)" in the current tab, with real hybrid signing on testnet and a manual approve or reject for every request.
- **Testnet-only by construction.** The signing playground and the test wallet refuse mainnet: they sign only for `qorechain-diana`. The two read-only tabs can point at either network.

## How to use {#how-to-use}

The page opens on the **SDKs** tab. The **PQ key status** and **Simulator** tabs show a **Network** toggle that is local to the page and **defaults to Testnet**, whatever the header says. (A page-level toggle is used so that switching network does not reload the page and wipe your in-memory keys and test wallet.)

### PQ key status {#pq-status}

1. Open the **PQ key status** tab and pick the network.
2. Enter an **Account address** (`qor1...`, `0x...` or `qorvaloper1...`). A `0x` address is the same 20 bytes as its `qor1` form; a `qorvaloper` address is looked up as the operator's own account. The page checks the format and the checksum.
3. Select **Check**.
4. **Registered PQC key** shows whether a key is registered, its algorithm (ML-DSA-87), key type, **Proof of possession** (the chain treats it as optional) and the public key. If none is registered it says so.
5. **EVM authorisation window** shows the state (**Open** or **Closed**), **Blocks left**, **Transactions used** (for example "3 of 20"), **Value used**, the opened and expiry heights, whether the window is **Native QOR transfers only**, and any allowed targets. If the account never opened one it says "No EVM authorisation window has been opened for this account."

The window is opened from the native lane with the account's ML-DSA-87 key, and it closes when its block limit or transaction limit is reached; see [EVM authorisation window](/developer-guide/evm-development#evm-window). This tab answers the common question "why was my EVM transaction refused?" without a command line.

### Simulator {#simulator}

1. Open the **Simulator** tab and pick the network.
2. Paste a **Signed TxRaw** (base64 or hex) into the box. The page tells you the decoded size and the number of signatures, and warns if there are none (the chain will most likely refuse to simulate an unsigned transaction).
3. Select **Simulate**. The result shows **Gas used**, the **Suggested gas limit**, **Balance changes** (address, denomination, change) and the **Events**.
4. If the chain refuses, the page shows its code, codespace and log.

Nothing is broadcast. It needs signed transaction bytes: build and sign with an SDK or `qorechaind` first (see [Post-Quantum Signing](/developer-guide/post-quantum-signing)). The input is limited to roughly 180 KB.

### Signing playground (testnet only) {#signing-playground}

1. Open the **Signing playground** tab. It warns: "Throwaway testnet key: never use it for real funds."
2. Select **Generate throwaway key**. The page shows the address, the secp256k1 public key size and the ML-DSA-87 key sizes. Select **New key** for another.
3. **Message:** enter text and select **Sign**. The text is signed with both keys for chain `qorechain-diana`; the signature appears as JSON.
4. **Verify:** paste a signature and the signer address and select **Verify**. It reports "Valid signature" or "Invalid signature". Because a throwaway key is not registered on chain, it checks against the signer address and this session's ML-DSA-87 public key.
5. **Sign In With QoreChain:** select **Build message** to create a sign-in message for this site with a random nonce, then sign and verify it the way a server would. The parsed fields are shown. See the [SIWQ spec](/qoresign/spec/siwq-v1) and the [sign-in guide](/qoresign/guides/sign-in).

The key is generated in the browser, never saved or sent, and cannot be recovered. See [QoreSign](/qoresign/overview) and [Hybrid signing v1](/qoresign/spec/hybrid-signing-v1) for the formats.

### QoreX test wallet (testnet only) {#test-wallet}

1. Open the **QoreX test wallet** tab and read the warning: each start generates a throwaway testnet key in memory; never send real funds to it.
2. Select **Start test wallet**. It uses the published `@qorechain/qorex-wallet-mock` package, installs the mock into **this tab** (replacing a real QoreX extension there until you reload) and lists the **Addresses** it holds: QoreChain Native, EVM and SVM.
3. Connect from a dApp running in the same tab, or call `window.qorex` from the browser console.
4. Every request waits for you under **Waiting for approval**: select **Approve** or **Reject**. The **Requests** list logs each one with its approval state and outcome.
5. Select **Stop (reloads the page)** to remove the mock.

It signs for testnet only and never mainnet. Use it to try a dApp connection flow before pointing the dApp at a real QoreX.

### SDKs and AI agents (MCP)

- **SDKs:** the tab currently shows a short static quickstart and package table. **It is out of date** (it still describes version 0.1.0 and says the packages are not on registries, which is no longer true). Use [SDK Install](/sdk/install) for the current packages and versions. A rebuilt SDKs tab, generated from the tested package list with install commands, quickstarts and live registry versions, is **upcoming and not live yet**.
- **AI agents (MCP):** the tab checks the npm registry for the QoreChain MCP server and, while the package is not published, says **"The QoreChain MCP server is not published yet."** There is no install command yet. When the package is published, the tab will show the client configuration for running it locally over stdio or self-hosted over Streamable HTTP.
- **Transaction inspector:** a tool to decode and explain any transaction is **upcoming and not live yet**.

## How to access {#how-to-access}

- **URL:** [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers), or **Developers** in the sidebar **Build** group (and in the mobile menu).
- **Sign-in:** none. The page is open to everyone.
- **Network:** PQ key status and Simulator: mainnet or testnet, via the toggle on the tab (default testnet). Signing playground and QoreX test wallet: testnet only.
- **Wallet:** none. The tools generate their own throwaway keys.
- **Cost:** free. Nothing is sent to the chain except read queries and simulate calls.
- **Privacy:** throwaway keys exist only in the page's memory. Do not paste a real recovery phrase into any tool.

## Where it is published {#where-published}

| Surface | Address | Networks |
| --- | --- | --- |
| Developers page | `dashboard.qorechain.io/developers` | Mainnet and testnet read tools; testnet-only signing tools |
| Signing library | npm `@qorechain/qoresign` 0.1.0, source `github.com/qorechain/qoresign`, see [QoreSign](/qoresign/overview) | n/a |
| Test wallet package | npm `@qorechain/qorex-wallet-mock` 0.1.0, source `github.com/qorechain/qorex-integrations` | Testnet |
| MCP server | `@qorechain/mcp`: not published yet | n/a |

Versions were checked on the npm registry on 27 October 2026.

## Limits and known issues {#limits}

- **Not live yet:** the rebuilt SDKs tab and the transaction inspector. The MCP server is not published, so there is nothing to install.
- **The current SDKs tab is stale;** use the [SDK pages](/sdk/overview) instead.
- **The simulator needs a signed transaction.** It cannot sign for you and does not broadcast.
- **The playground and test wallet are testnet-only** and use throwaway keys that vanish on reload. They cannot hold or move real funds.
- **A real QoreX extension in the same tab is replaced** by the test wallet until you reload the page.
- **Reads go through a read-only proxy.** The chain's REST endpoints do not send browser CORS headers, so the Dashboard relays read-only requests under the `cosmos/`, `cosmwasm/` and `qorechain/` paths and the simulate call. From your own code, call the public endpoints directly: `api.qore.host` and `api-testnet.qore.host`.
