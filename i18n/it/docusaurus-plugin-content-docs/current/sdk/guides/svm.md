---
slug: /sdk/guides/svm
title: Guida SVM
sidebar_label: SVM
sidebar_position: 2
---

# Guida SVM

`@qorechain/svm` è un adattatore sottile e type-safe basato su
[`@solana/web3.js`](https://solana.com/docs/clients/javascript) per il JSON-RPC
compatibile con Solana di QoreChain. `@solana/web3.js` è una peer dependency. Il pacchetto
aggiunge una factory di client che ha come target l'endpoint RPC SVM, helper per le chiavi, wrapper di lettura
tipizzati, build/firma/invio di trasferimenti SOL e builder minimali di istruzioni per programmi nativi.

```bash
npm i @qorechain/svm @solana/web3.js
```

:::caution L'invio di transazioni SVM è disabilitato
La corsia di esecuzione SVM è disabilitata su tutta la rete per l'invio di transazioni
(`code 11, "SVM module is disabled"`), e gli endpoint RPC SVM pubblici sono
di sola lettura. Le letture (`getBalance`, `getAccountInfo`, `getSlot`,
`getSignaturesForAddress`, `getMinimumBalanceForRentExemption`,
`getLatestBlockhash`) funzionano. Non costruire ancora un flusso di trasferimento o di deploy di programmi su
SVM: gli helper di build, firma e invio qui sotto costituiscono la superficie della libreria client
e oggi non possono portare a buon fine una transazione sulle reti pubbliche. Vedi
[Sviluppo SVM](/developer-guide/svm-development).
:::

## Creare un client

```ts
import { createSvmClient } from "@qorechain/svm";

const client = createSvmClient({
  endpoints: { svmRpc: "https://svm-testnet.qore.host" }, // mainnet: https://svm.qore.host
});
```

Puoi anche passare `rpcUrl`, una `connection` esistente, oppure affidarti a
`DEFAULT_SVM_RPC_URL` (localhost `8899`).

## Chiavi

Ricostruisci un `Keypair` di `@solana/web3.js` da una chiave segreta SVM derivata, oppure
stampa un indirizzo:

```ts
import { deriveSvmAccount } from "@qorechain/sdk";
import { svmKeypairFromSecretKey, svmAddress } from "@qorechain/svm";

const account = await deriveSvmAccount(mnemonic);
const keypair = svmKeypairFromSecretKey(account.secretKey);
console.log(svmAddress(keypair)); // base58
```

## Trasferire SOL

Costruisci un trasferimento non firmato (offline). L'invio è mostrato per completezza, ma
non può riuscire sulle reti pubbliche finché la corsia delle transazioni SVM è disabilitata:

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

## Programmi

Builder per i comuni programmi nativi più un builder di invoke generico:

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

Vedi l'[esempio](/sdk/examples) `svm-transfer` per una versione eseguibile.
