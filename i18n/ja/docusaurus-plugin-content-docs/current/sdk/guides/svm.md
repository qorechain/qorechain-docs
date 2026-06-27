---
slug: /sdk/guides/svm
title: SVM ガイド
sidebar_label: SVM
sidebar_position: 2
---

# SVM ガイド

`@qorechain/svm` は QoreChain の Solana 互換 JSON-RPC 向けの、
[`@solana/web3.js`](https://solana.com/docs/clients/javascript) 上に構築された
薄く型安全なアダプターです。`@solana/web3.js` はピア依存です。このパッケージは
SVM RPC エンドポイントを対象とするクライアントファクトリ、鍵ヘルパー、型付き読み取り
ラッパー、SOL 送金の構築/署名/送信、最小限のネイティブプログラム命令ビルダーを追加します。

```bash
npm i @qorechain/svm @solana/web3.js
```

## クライアントの作成

```ts
import { createSvmClient } from "@qorechain/svm";

const client = createSvmClient({
  endpoints: { svmRpc: "https://svm.testnet.example" },
});
```

`rpcUrl`、既存の `connection` を渡すこともできますし、
`DEFAULT_SVM_RPC_URL`（localhost の `8899`）に依存することもできます。

## 鍵

導出した SVM 秘密鍵から `@solana/web3.js` の `Keypair` を再構築したり、
アドレスを出力したりします:

```ts
import { deriveSvmAccount } from "@qorechain/sdk";
import { svmKeypairFromSecretKey, svmAddress } from "@qorechain/svm";

const account = await deriveSvmAccount(mnemonic);
const keypair = svmKeypairFromSecretKey(account.secretKey);
console.log(svmAddress(keypair)); // base58
```

## SOL の送金

署名なしの送金を構築してから送信します（送信には到達可能なノードと
資金のあるアカウントが必要です）:

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

## プログラム

一般的なネイティブプログラム向けのビルダーと、汎用の invoke ビルダー:

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

実行可能なバージョンについては `svm-transfer` [サンプル](/sdk/examples)を参照してください。
