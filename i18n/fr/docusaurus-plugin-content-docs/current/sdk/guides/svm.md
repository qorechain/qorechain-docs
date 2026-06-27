---
slug: /sdk/guides/svm
title: Guide SVM
sidebar_label: SVM
sidebar_position: 2
---

# Guide SVM

`@qorechain/svm` est un adaptateur fin et fortement typé au-dessus de
[`@solana/web3.js`](https://solana.com/docs/clients/javascript) pour le JSON-RPC
compatible Solana de QoreChain. `@solana/web3.js` est une dépendance pair. Le paquet
ajoute une fabrique de client ciblant le point de terminaison RPC SVM, des assistants de clés,
des wrappers de lecture typés, la construction/signature/envoi de transferts SOL, et des
constructeurs d'instructions minimaux pour les programmes natifs.

```bash
npm i @qorechain/svm @solana/web3.js
```

## Créer un client

```ts
import { createSvmClient } from "@qorechain/svm";

const client = createSvmClient({
  endpoints: { svmRpc: "https://svm.testnet.example" },
});
```

Vous pouvez aussi passer `rpcUrl`, une `connection` existante, ou vous appuyer sur
`DEFAULT_SVM_RPC_URL` (localhost `8899`).

## Clés

Reconstruisez un `Keypair` `@solana/web3.js` à partir d'une clé secrète SVM dérivée, ou
affichez une adresse :

```ts
import { deriveSvmAccount } from "@qorechain/sdk";
import { svmKeypairFromSecretKey, svmAddress } from "@qorechain/svm";

const account = await deriveSvmAccount(mnemonic);
const keypair = svmKeypairFromSecretKey(account.secretKey);
console.log(svmAddress(keypair)); // base58
```

## Transférer du SOL

Construisez un transfert non signé, puis envoyez-le (l'envoi nécessite un nœud accessible et un
compte approvisionné) :

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

## Programmes

Constructeurs pour les programmes natifs courants plus un constructeur d'invocation générique :

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

Voir l'[exemple](/sdk/examples) `svm-transfer` pour une version exécutable.
