---
slug: /build-before-qday/workshop-1/apps/hybrid-inspector
title: Hybrid Inspector
sidebar_label: Hybrid Inspector
sidebar_position: 3
---

# Hybrid Inspector

The Hybrid Inspector is a small React page that shows what a QoreChain hybrid signature looks like on the testnet `qorechain-diana`. You connect the QoreX wallet, send one transaction that QoreX signs with both secp256k1 and ML-DSA-87, and the page breaks that transaction open: the classical signature, the post-quantum signature and the chain's own verdict. You can also paste any testnet transaction hash.

## What it shows {#what-it-shows}

- **Hybrid ML-DSA-87 + secp256k1 signing from a web page.** The page hands an encoded message to QoreX with `qorexSignAndBroadcast`. QoreX signs with both keys and broadcasts.
- **One hybrid-signed transaction, verified on chain.** The page reads the chain's `pqc_hybrid_verify` event for the transaction. That event is the chain saying it checked the post-quantum signature.
- **The sizes are visible.** The classical signature is 64 bytes. The ML-DSA-87 signature (FIPS 204) is 4,627 bytes and travels in the `PQCHybridSignature` extension of the transaction.

## Step by step {#steps}

### 1. Install the tools

You need a Chromium based browser (Chrome, Edge, Brave), Git, Node.js 20 or newer and pnpm.

- Git: https://git-scm.com/downloads
- Node.js 20+: https://nodejs.org (the LTS release is fine)
- pnpm: `npm install -g pnpm`

Check the versions:

```sh
git --version
node --version     # v20.0.0 or higher
pnpm --version     # 9 or higher
```

### 2. Install the QoreX browser extension

Install QoreX from the store of your browser. See [QoreX Integrations](/developer-tools/qorex-integrations) and the [dApp browser](/qorex/dapp-browser) for details.

### 3. Create a throwaway testnet account in QoreX

This workshop never needs your real wallet. In QoreX, create a **new** account (a new profile or a new wallet) used only for this exercise, and switch it to the testnet `qorechain-diana`. See [Deploy in 5 Minutes](/getting-started/deploy-in-5-minutes#step-testnet) for the testnet switch. QoreX shows a recovery phrase when it creates the account: write it down on paper, keep it private, and never reuse it on mainnet. The account has no value beyond this exercise.

Copy the account address (it starts with `qor1...`).

### 4. Get testnet QOR from the faucet

1. Open https://dashboard.qorechain.io/faucet and sign in.
2. Paste your `qor1...` address and claim. A claim pays 100 QOR, once every 24 hours per account.

### 5. Get the code

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/03-hybrid-inspector
```

### 6. Install dependencies

```sh
pnpm install
```

### 7. Check that it builds

```sh
pnpm build
```

The command type checks the project and builds it. It ends with `built in` and a time.

### 8. Run the page

```sh
pnpm dev
```

Open http://localhost:5173 in the browser where QoreX is installed. Add `?tx=<HASH>` to the address (`http://localhost:5173?tx=<HASH>`) to inspect a transaction directly. If port 5173 is taken, Vite prints the port it uses instead.

The REST calls go through the Vite proxy `/lcd` to `https://api-testnet.qore.host`, because the public REST endpoint sends no CORS headers. The page works on the testnet only, and no `.env` file is needed.

### 9. Connect, send and verify

1. Click **Connect QoreX**. The page shows your address (`qor1...`), your testnet balance and whether an ML-DSA-87 key is registered. QoreX registers the key on your first send.
2. **Send** a small amount of QOR with a memo. QoreX shows what you sign and asks for approval.
3. The page inspects the transaction automatically. You can also paste any 64-character testnet transaction hash.

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
