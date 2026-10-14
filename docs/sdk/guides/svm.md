---
slug: /sdk/guides/svm
title: SVM Guide
sidebar_label: SVM
sidebar_position: 2
---

# SVM guide

`@qorechain/svm` is a thin, type-safe adapter over
[`@solana/web3.js`](https://solana.com/docs/clients/javascript) for QoreChain's
Solana-compatible JSON-RPC. `@solana/web3.js` is a peer dependency. The package
adds a client factory targeting the SVM RPC endpoint, key helpers, typed read
wrappers, SOL transfer build/sign/send, and minimal native-program instruction
builders.

```bash
npm i @qorechain/svm @solana/web3.js
```

:::caution SVM transaction submission is disabled
The SVM execution lane is disabled network-wide for transaction submission
(`code 11, "SVM module is disabled"`), and the public SVM RPC endpoints are
read-only. Reads (`getBalance`, `getAccountInfo`, `getSlot`,
`getSignaturesForAddress`, `getMinimumBalanceForRentExemption`,
`getLatestBlockhash`) work. Do not build a transfer or program-deployment flow on
SVM yet: the build, sign and send helpers below are the client library surface
and cannot land a transaction on the public networks today. See
[SVM Development](/developer-guide/svm-development).
:::

## Create a client

```ts
import { createSvmClient } from "@qorechain/svm";

const client = createSvmClient({
  endpoints: { svmRpc: "https://svm-testnet.qore.host" }, // mainnet: https://svm.qore.host
});
```

You can also pass `rpcUrl`, an existing `connection`, or rely on
`DEFAULT_SVM_RPC_URL` (localhost `8899`).

## Keys

Reconstruct a `@solana/web3.js` `Keypair` from a derived SVM secret key, or
print an address:

```ts
import { deriveSvmAccount } from "@qorechain/sdk";
import { svmKeypairFromSecretKey, svmAddress } from "@qorechain/svm";

const account = await deriveSvmAccount(mnemonic);
const keypair = svmKeypairFromSecretKey(account.secretKey);
console.log(svmAddress(keypair)); // base58
```

## Transfer SOL

Build an unsigned transfer (offline). Sending is shown for completeness, but it
cannot succeed on the public networks while the SVM transaction lane is disabled:

```ts
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

const lamports = Math.round(0.01 * LAMPORTS_PER_SOL);
const recipient = new PublicKey("<recipient base58 address>"); // `to` is a PublicKey, not a string

// Build only (no broadcast):
const tx = client.buildTransferSol({ from: keypair, to: recipient, lamports });

// Or build + sign + send + confirm in one call:
// const sig = await client.transferSol({ from: keypair, to: recipient, lamports });

// Send an arbitrary transaction:
// const sig = await client.sendTransaction(tx, [keypair]);

// Simulate without submitting:
// const sim = await client.simulateTransaction(tx);
```

## Programs

Builders for the common native programs plus a generic invoke builder:

```ts
import {
  createMemoInstruction,
  createTransferTokenInstruction,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createInvokeInstruction,
  PROGRAM_IDS,
  SYSTEM_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MEMO_PROGRAM_ID,
} from "@qorechain/svm";

// Attach a memo to a transaction.
tx.add(createMemoInstruction("hello from @qorechain/svm", [keypair.publicKey]));

// SPL-Token transfer, ATA creation, and a generic program invoke are also
// available via the builders above.
```

See the `svm-transfer` [example](/sdk/examples) for a runnable version.
