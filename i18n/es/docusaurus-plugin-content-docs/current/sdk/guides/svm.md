---
slug: /sdk/guides/svm
title: Guía de SVM
sidebar_label: SVM
sidebar_position: 2
---

# Guía de SVM

`@qorechain/svm` es un adaptador ligero y con tipado seguro sobre
[`@solana/web3.js`](https://solana.com/docs/clients/javascript) para el JSON-RPC compatible con
Solana de QoreChain. `@solana/web3.js` es una dependencia entre pares. El paquete
añade una factoría de clientes que apunta al endpoint RPC de SVM, utilidades para claves, envoltorios
de lectura tipados, construcción/firma/envío de transferencias de SOL y constructores mínimos de
instrucciones de programas nativos.

```bash
npm i @qorechain/svm @solana/web3.js
```

## Crear un cliente

```ts
import { createSvmClient } from "@qorechain/svm";

const client = createSvmClient({
  endpoints: { svmRpc: "https://svm.testnet.example" },
});
```

También puedes pasar `rpcUrl`, una `connection` existente, o apoyarte en
`DEFAULT_SVM_RPC_URL` (localhost `8899`).

## Claves

Reconstruye un `Keypair` de `@solana/web3.js` a partir de una clave secreta SVM derivada, o
imprime una dirección:

```ts
import { deriveSvmAccount } from "@qorechain/sdk";
import { svmKeypairFromSecretKey, svmAddress } from "@qorechain/svm";

const account = await deriveSvmAccount(mnemonic);
const keypair = svmKeypairFromSecretKey(account.secretKey);
console.log(svmAddress(keypair)); // base58
```

## Transferir SOL

Construye una transferencia sin firmar y luego envíala (el envío necesita un nodo accesible y una
cuenta con fondos):

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

## Programas

Constructores para los programas nativos comunes más un constructor de invocación genérico:

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

Consulta el [ejemplo](/sdk/examples) `svm-transfer` para una versión ejecutable.
