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

:::caution إرسال معاملات SVM معطَّل
مسار تنفيذ SVM معطَّل على مستوى الشبكة بأكملها لإرسال المعاملات
(`code 11, "SVM module is disabled"`)، ونقاط نهاية SVM RPC العامة للقراءة فقط.
تعمل عمليات القراءة (`getBalance` و`getAccountInfo` و`getSlot` و
`getSignaturesForAddress` و`getMinimumBalanceForRentExemption` و
`getLatestBlockhash`). لا تبنِ تدفق تحويل أو نشر برامج على SVM بعد: فمساعدات
البناء والتوقيع والإرسال أدناه هي واجهة مكتبة العميل ولا يمكنها اليوم إدراج
معاملة على الشبكات العامة. انظر
[تطوير SVM](/developer-guide/svm-development).
:::

## إنشاء عميل

```ts
import { createSvmClient } from "@qorechain/svm";

const client = createSvmClient({
  endpoints: { svmRpc: "https://svm-testnet.qore.host" }, // mainnet: https://svm.qore.host
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

ابنِ تحويلًا غير موقّع (دون اتصال). يُعرض الإرسال للاكتمال فحسب، ولا يمكن أن
ينجح على الشبكات العامة ما دام مسار معاملات SVM معطَّلًا:

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
