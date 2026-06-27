---
slug: /sdk/guides/svm
title: دليل SVM
sidebar_label: SVM
sidebar_position: 2
---

# دليل SVM

`@qorechain/svm` هو محوّل رقيق وآمن من حيث الأنواع فوق
[`@solana/web3.js`](https://solana.com/docs/clients/javascript) لـ JSON-RPC
المتوافق مع Solana في QoreChain. إنّ `@solana/web3.js` اعتمادية نظيرة. تضيف
الحزمة مصنع عميل يستهدف نقطة نهاية SVM RPC، ومساعدات المفاتيح، وأغلفة قراءة
مُصنّفة، وبناء/توقيع/إرسال تحويل SOL، وبناة تعليمات الأوامر الأصلية الأدنى.

```bash
npm i @qorechain/svm @solana/web3.js
```

## إنشاء عميل

```ts
import { createSvmClient } from "@qorechain/svm";

const client = createSvmClient({
  endpoints: { svmRpc: "https://svm.testnet.example" },
});
```

يمكنك أيضًا تمرير `rpcUrl`، أو `connection` موجود، أو الاعتماد على
`DEFAULT_SVM_RPC_URL` (المضيف المحلي `8899`).

## المفاتيح

أعد بناء `Keypair` الخاص بـ `@solana/web3.js` من مفتاح SVM السرّي المشتقّ، أو
اطبع عنوانًا:

```ts
import { deriveSvmAccount } from "@qorechain/sdk";
import { svmKeypairFromSecretKey, svmAddress } from "@qorechain/svm";

const account = await deriveSvmAccount(mnemonic);
const keypair = svmKeypairFromSecretKey(account.secretKey);
console.log(svmAddress(keypair)); // base58
```

## تحويل SOL

ابنِ تحويلًا غير موقّع، ثمّ أرسله (يتطلّب الإرسال عقدة يمكن الوصول إليها
وحسابًا مموَّلًا):

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

## الأوامر (Programs)

بناة للأوامر الأصلية الشائعة إضافةً إلى باني استدعاء عام:

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

انظر [مثال](/sdk/examples) `svm-transfer` للحصول على نسخة قابلة للتشغيل.
