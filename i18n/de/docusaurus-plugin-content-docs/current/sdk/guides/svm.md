---
slug: /sdk/guides/svm
title: SVM-Leitfaden
sidebar_label: SVM
sidebar_position: 2
---

# SVM-Leitfaden

`@qorechain/svm` ist ein schlanker, typsicherer Adapter über
[`@solana/web3.js`](https://solana.com/docs/clients/javascript) für QoreChains
Solana-kompatibles JSON-RPC. `@solana/web3.js` ist eine Peer-Abhängigkeit. Das Paket
ergänzt eine Client-Factory, die auf den SVM-RPC-Endpunkt abzielt, Schlüsselhelfer, typisierte
Lese-Wrapper, Aufbau/Signieren/Senden von SOL-Überweisungen sowie minimale Builder für
Anweisungen nativer Programme.

```bash
npm i @qorechain/svm @solana/web3.js
```

## Einen Client erstellen

```ts
import { createSvmClient } from "@qorechain/svm";

const client = createSvmClient({
  endpoints: { svmRpc: "https://svm.testnet.example" },
});
```

Sie können auch `rpcUrl`, eine bestehende `connection` übergeben oder sich auf
`DEFAULT_SVM_RPC_URL` (localhost `8899`) verlassen.

## Schlüssel

Rekonstruieren Sie ein `@solana/web3.js`-`Keypair` aus einem abgeleiteten SVM-Geheimschlüssel oder
geben Sie eine Adresse aus:

```ts
import { deriveSvmAccount } from "@qorechain/sdk";
import { svmKeypairFromSecretKey, svmAddress } from "@qorechain/svm";

const account = await deriveSvmAccount(mnemonic);
const keypair = svmKeypairFromSecretKey(account.secretKey);
console.log(svmAddress(keypair)); // base58
```

## SOL überweisen

Erstellen Sie eine unsignierte Überweisung und senden Sie sie anschließend (das Senden erfordert
einen erreichbaren Node und ein gedecktes Konto):

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

## Programme

Builder für die gängigen nativen Programme sowie ein generischer Invoke-Builder:

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

Eine lauffähige Version finden Sie im `svm-transfer`-[Beispiel](/sdk/examples).
