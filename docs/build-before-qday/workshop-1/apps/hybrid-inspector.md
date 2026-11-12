---
slug: /build-before-qday/workshop-1/apps/hybrid-inspector
title: Hybrid Inspector
sidebar_label: Hybrid Inspector
sidebar_position: 3
---

# Hybrid Inspector

The Hybrid Inspector is a small React page that shows what a QoreChain hybrid signature looks like on the testnet `qorechain-diana`. It connects QoreX, sends one transaction that QoreX signs with both secp256k1 and ML-DSA-87, and then breaks that transaction open: the classical signature, the post-quantum signature and the chain's own verdict. You can also paste any testnet transaction hash.

## Innovations {#innovations}

- **Hybrid ML-DSA-87 + secp256k1 signing from a web page.** The page hands an encoded message to QoreX with `qorexSignAndBroadcast`. QoreX signs with both keys and broadcasts.
- **One hybrid-signed transaction, verified on chain.** The page reads the chain's `pqc_hybrid_verify` event for the transaction. That event is the chain saying it checked the post-quantum signature.
- **The sizes are visible.** The classical signature is 64 bytes. The ML-DSA-87 signature (FIPS 204) is 4,627 bytes and travels in the `PQCHybridSignature` extension of the transaction.

## Packages and versions {#packages}

| Package | Version | Used for |
| --- | --- | --- |
| `@qorechain/qorex-types` | 0.1.0 (pinned) | `getQorexNative`, `qorexSignAndBroadcast` |
| `@qorechain/sdk` | ^0.13.0 | Listed as a dependency; the page itself uses plain REST calls |
| `react`, `react-dom` | ^18.3.1 | Interface |
| `@vitejs/plugin-react` | ^4.3.0 | Vite React plugin |
| `vite` | ^5.4.0 | Dev server |

Wallet: the QoreX browser extension (the page reads `window.qorex.native`). See [QoreX Integrations](/developer-tools/qorex-integrations) and the [dApp browser](/qorex/dapp-browser).

## Step by step {#steps}

1. Install the QoreX extension, switch it to the testnet and fund the account from the [faucet](/dashboard/faucet). See [Deploy in 5 Minutes](/getting-started/deploy-in-5-minutes#step-testnet) for the switch.
2. Run the page:

   ```sh
   pnpm install
   pnpm dev     # http://localhost:5173
   ```

   Add `?tx=<HASH>` to the address (`http://localhost:5173?tx=<HASH>`) to inspect a transaction directly.
3. **Connect QoreX.** The page shows your address (`qor1...`), your testnet balance and whether an ML-DSA-87 key is registered. QoreX registers the key on your first send.
4. **Send** a small amount of QOR with a memo. QoreX shows what you sign and asks for approval.
5. **Verify.** The page inspects the transaction automatically. You can also paste any 64-character testnet transaction hash.

The REST calls go through the Vite proxy `/lcd` to `https://api-testnet.qore.host`, because the public REST endpoint sends no CORS headers. The page works on the testnet only.

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

`msgSendBytes` is a small protobuf encoder in `src/App.tsx` for the bank `MsgSend` message, because QoreX takes the encoded message. The header block height comes from `/cosmos/base/node/v1beta1/status`, read every 3 seconds. The memo field starts with `Build Before Q-Day Workshop 1`.

The page marks a transaction as hybrid-verified when its code is 0, a `pqc_hybrid_verify` event has status `verified`, and the post-quantum signature is 4,627 bytes.

## What you see when it works {#result}

- The header shows `qorechain-diana (testnet)` and a block height that keeps rising.
- After connecting: your address, balance and key status.
- After sending: the transaction hash and result code, then the inspection card with the memo, the message type, the 64-byte classical signature, the 4,627-byte ML-DSA-87 signature with its first bytes in hex, the algorithm name `ML-DSA-87 (FIPS 204)`, and the `pqc_hybrid_verify` verdict. Links open the transaction on the [explorer](https://explore.qore.network) (switch it to Testnet) and on the dashboard explorer.

## Get the code {#get-the-code}

The code is in the public repository: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/03-hybrid-inspector (the link works once the repository is published; the code is also shown inline on this page).
