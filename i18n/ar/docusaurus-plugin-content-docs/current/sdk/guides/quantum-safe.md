---
slug: /sdk/guides/quantum-safe
title: آمن كمّيًا افتراضيًا
sidebar_label: آمن كمّيًا
sidebar_position: 6
---

# آمن كمّيًا افتراضيًا

تتعامل QoreChain مع التشفير ما بعد الكمّي كنظام توقيع **من الدرجة الأولى**.
يسجّل الحساب مفتاح **ML-DSA-87 (Dilithium-5، NIST FIPS 204)** على السلسلة،
وبعد ذلك يمكن لمعاملاته أن تحمل توقيعًا **هجينًا** — التوقيع الكلاسيكي
المعتاد secp256k1 **إضافةً إلى** توقيع ML-DSA-87. يتحقّق معالج
ما-قبل (ante handler) السلسلة من كليهما، فيبقى الحساب الآمن كمّيًا متوافقًا
تمامًا مع التحقّق الكلاسيكي مع اكتسابه الحماية من خصم كمّي مستقبلي.

يغلّف الـ SDK هذا في سطح صغير وعديم الأثر الجانبي (idempotent) بحيث يصبح
تطبيق dApp **آمنًا كمّيًا افتراضيًا**: استدعاء واحد ليُحمى بـ PQC.

## التحقق من الحالة

تقرأ `isPqcRegistered` / `getPqcStatus` ما إذا كان لعنوان مفتاح PQC مسجّل
عبر طريقة JSON-RPC المسمّاة `qor_getPQCKeyStatus`. وهما تقبلان إمّا
`QorClient` أو العميل المُركّب من `createClient`:

```ts
import { createClient, isPqcRegistered, getPqcStatus } from "@qorechain/sdk";

const client = createClient({ network: "mainnet", endpoints: { /* … */ } });

const safe = await isPqcRegistered(client, "qor1…");
const status = await getPqcStatus(client, "qor1…");
// status: { registered: boolean; algorithmId?: number; pubkey?: string | Uint8Array }
```

تكون الحالة نفسها قابلة للقراءة أيضًا على جانب EVM عبر مكوّن ما قبل التجميع
`pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey)`
على العنوان `0x0000000000000000000000000000000000000A02` (مكشوف باسم
`pqcKeyStatus` في `@qorechain/evm`). تفضّل المساعدات أعلاه طريقة JSON-RPC،
التي لا تحتاج إلى نظير viem.

## التسجيل باستدعاء واحد

تجعل `ensurePqcRegistered` الحساب آمنًا كمّيًا. وهي **عديمة الأثر الجانبي**:
مرّر مصدر حالة فتتخطّى التسجيل عندما يكون المفتاح مسجّلًا مسبقًا، فيكون
استدعاؤها آمنًا عند كلّ بدء للتطبيق.

```ts
import { generatePqcKeypair, ensurePqcRegistered } from "@qorechain/sdk";

const tx = await client.connectTx(signer);
const pqcKeypair = generatePqcKeypair(); // or derive deterministically from the wallet

const res = await ensurePqcRegistered(tx, {
  pqcKeypair,
  statusSource: client, // makes the call idempotent (skips if already registered)
});
// res: { alreadyRegistered: boolean; txHash?: string }
```

في الخلفية، تبني وتبثّ `MsgRegisterPQCKey` بمفتاح Dilithium العام
للموقّع (من `pqcKeypair`) إضافةً، اختياريًا، إلى مفتاح ECDSA العام للحساب.

## التوقيع الهجين

تضمن `migrateToHybrid` التسجيل وتعيد مسار إرسال هجين مع ربط زوج المفاتيح
مسبقًا بباني `buildHybridTx` / `signAndBroadcastHybrid` الموجودَين:

```ts
import { migrateToHybrid } from "@qorechain/sdk";

const hybrid = await migrateToHybrid(tx, { pqcKeypair, statusSource: client });

await hybrid.signAndBroadcastHybrid({
  registry,
  signer,          // classical secp256k1 direct signer
  messages,
  fee,
  chainId,
  accountNumber,
  sequence,
  transport,       // a connected broadcast transport (e.g. StargateClient)
});
```

## تدوير مفتاح

إن كنت بحاجة إلى تدوير مفتاح PQC (ترقية الخوارزمية أو مفتاح مخترَق)،
استخدم `migratePqcKey`، التي تبثّ `MsgMigratePQCKey` مثبتةً ملكية كلٍّ من
المفتاح القديم والمفتاح الجديد:

```ts
import { migratePqcKey } from "@qorechain/sdk";

await migratePqcKey(tx, {
  oldPublicKey,
  newPublicKey,
  oldSignature, // by the old key
  newSignature, // by the new key
});
```

## في واجهة المستخدم

تكشف عدّة [`@qorechain/react`](/sdk/guides/react) عن كلّ هذا في React: يُظهِر
خطّاف `usePqcStatus` ومكوّن `<QuantumSafeBadge/>` مؤشر **آمن كمّيًا**
كلّما كان للحساب المتّصل مفتاح PQC مسجّل.
