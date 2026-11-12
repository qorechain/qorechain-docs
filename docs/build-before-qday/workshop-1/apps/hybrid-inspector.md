---
slug: /build-before-qday/workshop-1/apps/hybrid-inspector
title: Hybrid Inspector
sidebar_label: Hybrid Inspector
sidebar_position: 3
---

# Hybrid Inspector

The Hybrid Inspector is a small web page (built with React) that shows what a QoreChain hybrid signature looks like on the testnet `qorechain-diana`. You connect the QoreX wallet, send one transaction that QoreX signs with both secp256k1 and ML-DSA-87, and the page breaks that transaction open: the classical signature, the post-quantum signature and the chain's own verdict. You can also paste any testnet transaction hash.

**How long this takes:** about 20 minutes, including the installs. After that the page runs in seconds.

## What it shows {#what-it-shows}

- **Hybrid ML-DSA-87 + secp256k1 signing from a web page.** The page hands an encoded message to QoreX with `qorexSignAndBroadcast`. QoreX signs with both keys and broadcasts.
- **One hybrid-signed transaction, verified on chain.** The page reads the chain's `pqc_hybrid_verify` event for the transaction. That event is the chain saying it checked the post-quantum signature.
- **The sizes are visible.** The classical signature is 64 bytes. The ML-DSA-87 signature (FIPS 204) is 4,627 bytes and travels in the `PQCHybridSignature` extension of the transaction.

## Step by step {#steps}

You work in your own terminal and your browser. You use a throwaway testnet account only. Testnet QOR has no value. Never use a real wallet or real funds here.

### 1. Before you start: install the tools {#install}

You need four things: a Chromium based browser (Chrome, Edge or Brave), **Git** (downloads the code), **Node.js** (runs the page's tools) and **pnpm** (installs the page's libraries). Use Node.js 22 or later. The page itself also works from Node.js 20, but 22 is the safe choice for every workshop app.

**macOS**

| Tool | How to install | Check it |
| --- | --- | --- |
| Git | `xcode-select --install` (or `brew install git`) | `git --version` |
| Node.js 22+ | Download the LTS installer from https://nodejs.org, or run `brew install node` | `node --version` (must show v22 or higher) |
| pnpm | `npm install -g pnpm` | `pnpm --version` |

**Windows** (use PowerShell)

| Tool | How to install | Check it |
| --- | --- | --- |
| Git | Download from https://git-scm.com/download/win | `git --version` |
| Node.js 22+ | Download the LTS installer from https://nodejs.org (or `winget install OpenJS.NodeJS.LTS`) | `node --version` |
| pnpm | `npm install -g pnpm` | `pnpm --version` |

**Linux (Debian or Ubuntu)**

| Tool | How to install | Check it |
| --- | --- | --- |
| Git | `sudo apt update && sudo apt install -y git curl` | `git --version` |
| Node.js 22+ | Follow https://nodejs.org/en/download (choose Linux, then the LTS version) | `node --version` |
| pnpm | `npm install -g pnpm` | `pnpm --version` |

**Gotcha:** Node.js installed with Homebrew does not include pnpm. If you see `pnpm: command not found`, run `npm install -g pnpm`, then open a new terminal.

**What you should see:** every check command prints a version number. `node --version` starts with `v22` or higher.

### 2. Before you start: QoreX on testnet {#qorex}

QoreX is the official QoreChain wallet. This page needs the **QoreX browser extension** in the browser where you open the page. Install it from the store of your browser. See [QoreX Integrations](/developer-tools/qorex-integrations) and the [dApp browser](/qorex/dapp-browser).

Use a **new throwaway account** made only for this exercise. QoreX shows a recovery phrase when it creates the account. Write it on paper, keep it private, and never reuse it on mainnet.

Switch QoreX to the testnet:

- **Browser extension:** unlock it, tap the version number at the bottom 7 times, then choose **Switch to testnet (diana)**.
- **QoreX app:** open Settings and turn on **Use testnet (developers)**. (The page runs in a desktop browser, so you use the extension for this tutorial.)

See [Deploy in 5 Minutes](/getting-started/deploy-in-5-minutes#step-testnet) for more on the testnet switch. Copy your account address (it starts with `qor1...`).

You do not need an Ethereum account (coin 60) for this page, because it sends a QoreChain Native payment.

### 3. Get testnet QOR from the faucet {#faucet}

The faucet is a website that sends free testnet QOR to an address.

1. Open https://dashboard.qorechain.io/faucet and sign in.
2. Paste your `qor1...` address and request. The faucet pays **100 QOR per 24 hours per account**.

**Amounts:** the unit you read is **QOR**. The chain counts in **uqor**, the smallest unit. 1 QOR = 1,000,000 uqor. The page asks for QOR and converts it for you.

**Good to know:** the very first transaction of a new account registers its post-quantum ML-DSA-87 key on chain. This is a one-time fee of about 0.09 QOR. QoreX does it for you on your first send.

### 4. Get the code {#get-code}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/03-hybrid-inspector
```

| Part | Meaning |
| --- | --- |
| `git clone <address>` | Downloads a full copy of the example apps from GitHub into a new folder called `build-before-qday`. |
| `cd <folder>` | Moves your terminal into the Hybrid Inspector folder. All next commands run from here. |

**What you should see:** `Cloning into 'build-before-qday'...`. Run `ls` to check: you see `package.json`, `src`, `index.html` and `vite.config.ts`.

### 5. Install the libraries {#install-libs}

```sh
pnpm install
```

**What it does:** `pnpm` downloads the libraries the page needs (listed in `package.json`) into a folder called `node_modules`. You run it once per project.

| Part | Meaning |
| --- | --- |
| `pnpm` | The tool that installs libraries. |
| `install` | Read `package.json` and install everything it lists, at the versions in `pnpm-lock.yaml`. |

**How long:** under a minute.

**What you should see:** a progress bar and then `Done in` and a time.

### 6. Check that it builds {#build}

```sh
pnpm build
```

**What it does:** runs the script named `build` from `package.json`. That script is `tsc --noEmit && vite build`.

| Part | Meaning |
| --- | --- |
| `pnpm build` | Run the project's `build` script. |
| `tsc --noEmit` | The TypeScript checker. It looks for mistakes in the code and writes no files. |
| `vite build` | Vite packs the page into a small website in the folder `dist`. |

**What you should see:** `transforming...`, then lines such as `dist/index.html`, and finally `built in` with a time (well under a second).

### 7. Run the page {#run}

```sh
pnpm dev
```

**What it does:** runs the script `dev`, which starts a small web server on your own computer so you can use the page in the browser. Leave this terminal open while you work. Press Ctrl+C to stop it.

**What you should see:**

```text
  VITE v5.4.21  ready in 111 ms

  ➜  Local:   http://localhost:5173/
```

Open http://localhost:5173 in the browser where QoreX is installed. If port 5173 is taken, Vite prints the other port. Use the address it prints.

To inspect a transaction directly, add `?tx=<HASH>` to the address: `http://localhost:5173?tx=<HASH>`.

**Why the page calls `/lcd`:** the public testnet REST service sends no CORS headers, so a browser page cannot call it directly. The dev server forwards every call from `/lcd` to `https://api-testnet.qore.host`. The page works on the testnet only, and no `.env` file is needed.

### 8. Connect, send and verify {#connect-send}

1. **Connect.** Click **Connect QoreX**. QoreX asks you to allow the page. Approve. The page shows your address (`qor1...`), your testnet balance and whether an ML-DSA-87 key is registered. It says "not registered yet" until your first send.
2. **Fill in the send form.**

| Field | Meaning |
| --- | --- |
| To | The receiver address (`qor1...`). It is filled with your own address by default, which is fine. |
| Amount (QOR) | How much to send, in QOR. `1` means 1 QOR = 1,000,000 uqor. |
| Memo | A short text attached to the transaction and stored on chain. Anyone can read it, so write nothing private. |

3. **Send.** Click **Sign with QoreX and send**. QoreX shows what you sign and asks for approval. Approve. Wait for the block (a few seconds).
4. **Inspect.** The page inspects the transaction automatically. You can also paste any 64-character testnet transaction hash in step 3 of the page and click **Inspect**.

**What you should see:** a line `QoreX: code 0, shield ..., tx <hash>`, then the inspection card described in "What you should see" below. Copy the transaction hash.

### 9. Verify it a second way, without the page {#verify-curl}

You can ask the chain directly. You need only `curl`, which macOS and most Linux systems include. On Windows PowerShell use `curl.exe`. The tool `jq` is optional and makes the answer easier to read (`brew install jq` on macOS, `sudo apt install -y jq` on Linux, `winget install jqlang.jq` on Windows).

```sh
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> | jq '.tx_response.code, .tx.body.extension_options[0]["@type"], (.tx.body.extension_options[0].pqc_signature | length)'
```

| Part | Meaning |
| --- | --- |
| `curl -s <address>` | Downloads the answer from the testnet REST service. `-s` hides the progress bar. |
| `<HASH>` | Your transaction hash, from step 8. |
| `\| jq '...'` | Picks out three values. Without `jq`, drop this part and read the full text. |

**What you should see:**

- `code` is `0`: the transaction succeeded.
- A `PQCHybridSignature` extension (type `/qorechain.pqc.v1.PQCHybridSignature`) with a `pqc_signature`. Its base64 text is 6,172 characters long, which is 4,627 bytes of ML-DSA-87 signature.
- In `tx_response.events`, an event of type `pqc_hybrid_verify` with the attribute `status` set to `verified`.

**In the explorer:** open https://explore.qore.network, switch it to **Testnet**, and search for your transaction hash.

## Troubleshooting {#troubleshooting}

| What you see | Why | What to do |
| --- | --- | --- |
| `pnpm: command not found` | pnpm is not installed. Node.js from Homebrew does not include it. | Run `npm install -g pnpm`, then open a new terminal. |
| `node --version` shows v18 or lower | Node.js is too old. | Install Node.js 22 or later (step 1). |
| Page says `QoreX was not found in this page. Install the QoreX extension, switch it to testnet, and reload.` | The extension is missing, locked, or the browser is not Chromium based. | Install and unlock QoreX in Chrome, Edge or Brave. Switch to testnet, then reload the page. |
| Faucet says you hit a rate limit | One request per 24 hours per account. | Wait 24 hours, or use a second throwaway account. |
| `account has no PQC key and classical fallback is disabled` | The post-quantum key is not registered yet. | Send once from QoreX (it registers the key on your first send, about 0.09 QOR). Make sure you have QOR from the faucet first. |
| `EVM authorisation window exhausted` | Belongs to the Hardhat app, not this page. | In that app, open a new window with `pnpm window open`. |
| `HHE10402` after the window opens | Belongs to the Hardhat app. The window needs a few seconds. | Run the deploy again. |
| CORS error in the browser console | The page called the REST service directly. | Use the `/lcd` proxy of the dev server (`pnpm dev`) and open the page at `http://localhost:5173`. Do not open `dist/index.html` as a file. |
| `Enter an amount in QOR, for example 1.` | The amount is empty, zero or not a number. | Type a number such as `1`. |
| `A transaction hash is 64 hex characters.` | The pasted hash is wrong or cut. | Paste the full 64 characters. |
| `Transaction not found on qorechain-diana` | The hash is from another network, or the block is not final yet. | Wait 10 seconds and try again. Check that QoreX is on the testnet. |
| Port 5173 is already used | Another program uses it. | Vite picks the next port and prints it. Open that address. |

## The code {#code}

Connecting and sending:

```ts
import { getQorexNative, qorexSignAndBroadcast } from "@qorechain/qorex-types";

const native = getQorexNative();
await native.enable("qorechain-diana");
const key = await native.getKey("qorechain-diana");      // key.bech32Address

const r = await qorexSignAndBroadcast({
  chainId: "qorechain-diana",
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: msgSendBytes(from, to, uqor) }],
  memo,
});                                                       // r.txHash, r.code, r.shield
```

Reading the proof from the chain:

```ts
const res = await fetch(`/lcd/cosmos/tx/v1beta1/txs/${hash}`).then((r) => r.json());
const tx = res.tx;
const ext = [...(tx.body.extension_options ?? []), ...(tx.body.non_critical_extension_options ?? [])];
const hyb = ext.find((x) => String(x["@type"]).includes("PQCHybridSignature"));
const verify = (res.tx_response.events ?? []).filter((e) => e.type === "pqc_hybrid_verify");
// classical signature: atob(tx.signatures[0]).length  -> 64
// ML-DSA-87 signature: atob(hyb.pqc_signature).length -> 4627
```

`msgSendBytes` is a small protobuf encoder in `src/App.tsx` for the bank `MsgSend` message, because QoreX takes the encoded message. The page marks a transaction as hybrid-verified when its code is 0, a `pqc_hybrid_verify` event has status `verified`, and the post-quantum signature is 4,627 bytes.

## What you should see {#result}

- The header shows `qorechain-diana (testnet)` and a block height that keeps rising.
- After connecting: your address, balance and key status.
- After sending: the transaction hash and result code, then the inspection card with the memo, the message type, the 64-byte classical signature, the 4,627-byte ML-DSA-87 signature with its first bytes in hex, the algorithm name `ML-DSA-87 (FIPS 204)`, and the `pqc_hybrid_verify` verdict.
- On the explorer: open https://explore.qore.network, switch it to **Testnet**, and search for your transaction hash.

## Packages used {#packages}

| Package | Version | Used for |
| --- | --- | --- |
| `@qorechain/qorex-types` | 0.1.0 (pinned) | `getQorexNative`, `qorexSignAndBroadcast` |
| `@qorechain/sdk` | ^0.13.0 | Listed as a dependency; the page itself uses plain REST calls |
| `react`, `react-dom` | ^18.3.1 | Interface |
| `@vitejs/plugin-react` | ^4.3.0 | Vite React plugin |
| `vite` | ^5.4.0 | Dev server and build |
| `typescript` | ^5.6.3 | Type checking |

## Source code {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/03-hybrid-inspector
