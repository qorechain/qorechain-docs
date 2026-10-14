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

:::caution Trimiterea de tranzacții SVM este dezactivată
Banda de execuție SVM este dezactivată în întreaga rețea pentru trimiterea de tranzacții
(`code 11, "SVM module is disabled"`), iar endpoint-urile RPC SVM publice sunt doar
pentru citire. Citirile (`getBalance`, `getAccountInfo`, `getSlot`,
`getSignaturesForAddress`, `getMinimumBalanceForRentExemption`,
`getLatestBlockhash`) funcționează. Nu construi încă un flux de transfer sau de
implementare de programe pe SVM: helperele build, sign și send de mai jos reprezintă
suprafața bibliotecii client și nu pot include astăzi o tranzacție pe rețelele publice.
Vezi [Dezvoltare SVM](/developer-guide/svm-development).
:::

## Crearea unui client

```ts
import { createSvmClient } from "@qorechain/svm";

const client = createSvmClient({
  endpoints: { svmRpc: "https://svm-testnet.qore.host" }, // mainnet: https://svm.qore.host
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

Construiește un transfer nesemnat (offline). Trimiterea este prezentată pentru
completitudine, dar nu poate reuși pe rețelele publice cât timp banda de tranzacții SVM
este dezactivată:

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
