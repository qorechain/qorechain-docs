---
slug: /sdk/guides/svm
title: Ghid SVM
sidebar_label: SVM
sidebar_position: 2
---

# Ghid SVM

`@qorechain/svm` este un adaptor subțire, type-safe peste
[`@solana/web3.js`](https://solana.com/docs/clients/javascript) pentru JSON-RPC-ul
compatibil Solana al QoreChain. `@solana/web3.js` este o dependență peer. Pachetul
adaugă o fabrică de clienți care vizează endpoint-ul RPC SVM, helpere pentru chei,
wrappere de citire tipizate, build/sign/send pentru transferul SOL și constructori
minimali de instrucțiuni pentru programe native.

```bash
npm i @qorechain/svm @solana/web3.js
```

## Crearea unui client

```ts
import { createSvmClient } from "@qorechain/svm";

const client = createSvmClient({
  endpoints: { svmRpc: "https://svm.testnet.example" },
});
```

Poți de asemenea să transmiți `rpcUrl`, o `connection` existentă sau să te bazezi pe
`DEFAULT_SVM_RPC_URL` (localhost `8899`).

## Chei

Reconstruiește un `Keypair` `@solana/web3.js` dintr-o cheie secretă SVM derivată, sau
afișează o adresă:

```ts
import { deriveSvmAccount } from "@qorechain/sdk";
import { svmKeypairFromSecretKey, svmAddress } from "@qorechain/svm";

const account = await deriveSvmAccount(mnemonic);
const keypair = svmKeypairFromSecretKey(account.secretKey);
console.log(svmAddress(keypair)); // base58
```

## Transfer SOL

Construiește un transfer nesemnat, apoi trimite-l (trimiterea necesită un nod accesibil și un
cont finanțat):

```ts
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

const lamports = Math.round(0.01 * LAMPORTS_PER_SOL);

// Build only (no broadcast):
const tx = client.buildTransferSol({ from: keypair, to: recipient, lamports });

// Or build + sign + send + confirm in one call:
// const sig = await client.transferSol({ from: keypair, to: recipient, lamports });

// Send an arbitrary transaction:
// const sig = await client.sendTransaction(tx, [keypair]);

// Simulate without submitting:
// const sim = await client.simulateTransaction(tx);
```

## Programe

Constructori pentru programele native comune plus un constructor generic de invocare:

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

Vezi [exemplul](/sdk/examples) `svm-transfer` pentru o versiune executabilă.
