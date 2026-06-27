---
slug: /sdk/guides/svm
title: SVM Kılavuzu
sidebar_label: SVM
sidebar_position: 2
---

# SVM kılavuzu

`@qorechain/svm`, QoreChain'in Solana uyumlu JSON-RPC'si için
[`@solana/web3.js`](https://solana.com/docs/clients/javascript) üzerine ince,
tip güvenli bir adaptördür. `@solana/web3.js` bir eş bağımlılıktır. Paket,
SVM RPC uç noktasını hedefleyen bir istemci fabrikası, anahtar yardımcıları, tipli okuma
sarmalayıcıları, SOL transferi oluşturma/imzalama/gönderme ve minimal yerel program talimatı
oluşturucuları ekler.

```bash
npm i @qorechain/svm @solana/web3.js
```

## Bir istemci oluşturun

```ts
import { createSvmClient } from "@qorechain/svm";

const client = createSvmClient({
  endpoints: { svmRpc: "https://svm.testnet.example" },
});
```

Ayrıca bir `rpcUrl`, mevcut bir `connection` geçebilir veya
`DEFAULT_SVM_RPC_URL`'ye (localhost `8899`) güvenebilirsiniz.

## Anahtarlar

Türetilmiş bir SVM gizli anahtarından bir `@solana/web3.js` `Keypair`'i yeniden oluşturun veya
bir adres yazdırın:

```ts
import { deriveSvmAccount } from "@qorechain/sdk";
import { svmKeypairFromSecretKey, svmAddress } from "@qorechain/svm";

const account = await deriveSvmAccount(mnemonic);
const keypair = svmKeypairFromSecretKey(account.secretKey);
console.log(svmAddress(keypair)); // base58
```

## SOL transferi

İmzasız bir transfer oluşturun, ardından gönderin (gönderme, ulaşılabilir bir düğüm ve
fonlanmış bir hesap gerektirir):

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

## Programlar

Yaygın yerel programlar için oluşturucular artı genel bir invoke oluşturucusu:

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

Çalıştırılabilir bir sürüm için `svm-transfer` [örneğine](/sdk/examples) bakın.
