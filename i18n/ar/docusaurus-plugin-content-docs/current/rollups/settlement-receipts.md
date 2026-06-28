---
slug: /rollups/settlement-receipts
title: إيصالات التسوية الآمنة كموميًا
sidebar_label: إيصالات التسوية
sidebar_position: 6
---

# إيصالات التسوية الآمنة كموميًا

**إيصال التسوية** هو إثبات قابل للنقل ومكتفٍ ذاتيًا على أن دُفعة
تسوية الـ rollup قد رُسّخت إلى السلسلة الرئيسية (Main Chain) بموجب توقيع مقاوم للكم.
وهو يربط دُفعة محددة بالمرساة على السلسلة التي أودعت حالة الـ rollup
عند ذلك الارتفاع، ويمكن التحقق منه **بالكامل دون اتصال** — دون عقدة، ودون
ثقة في مسار شبكة المُتحقِّق.

توقيع المرساة هو **ML-DSA-87** (Dilithium-5، FIPS-204)، وهو نفس
المخطط المقاوم للكم الذي تستخدمه السلسلة الرئيسية، فيرث الإيصال سلامة
السلسلة الأساسية الآمنة كموميًا.

## رسالة المرساة المعيارية

يتحقق التحقق من توقيع Dilithium-5 على رسالة معيارية مبنية من
حقول المرساة، مُسلسَلة بهذا الترتيب الدقيق:

```
layer_id || layer_height (8-byte big-endian) || state_root || validator_set_hash
```

تنتج `anchorSignBytes(...)` هذه البايتات؛ ويعيد المُتحقِّق بناءها من
الإيصال ويتحقق من التوقيع مقابل مفتاح ML-DSA-87 المُسجَّل لمنشئ الطبقة.

## البناء والتحقق (TypeScript)

```ts
import {
  createRdkClient,
  buildSettlementReceipt,
  verifySettlementReceipt,
} from "@qorechain/rdk";

const rdk = createRdkClient({
  endpoints: { rest: "https://rest.testnet.example" },
});

// Build a portable receipt for one batch.
const receipt = await buildSettlementReceipt(rdk, "my-roll", 7);

// Persist it, ship it, hand it to a counterparty — it is self-contained JSON.

// Verify fully offline. With no client, you must supply the creator's key.
const result = await verifySettlementReceipt(receipt, {
  creatorPublicKey: "<layer creator ML-DSA-87 public key>",
});

console.log(result.valid); // true when the signature and the batch↔anchor binding both hold
```

إذا مرّرت `client` بدلًا من (أو إلى جانب) `creatorPublicKey`، فإن التحقق
يجلب مفتاح ML-DSA-87 المُسجَّل لمنشئ الطبقة من السلسلة
(`getPqcAccount(address)`). ثم يتحقق التحقق من أمرين:

1. **توقيع Dilithium-5** على رسالة المرساة المعيارية، و
2. **ربط جذر الحالة بين الدُفعة ↔ المرساة** — أن الدُفعة التي بحوزتك هي تلك
   التي أودعتها المرساة.

```ts
// Online verification: fetch the creator's PQC key from the chain.
const online = await verifySettlementReceipt(receipt, { client: rdk });
```

## قراءة المراسي

تُبنى الإيصالات من استعلام **Anchor** الخاص بـ `x/multilayer` على السلسلة،
المتاح عبر كلٍّ من gRPC وREST اعتبارًا من إصدار السلسلة **v3.1.80** (راجع
[REST / gRPC Endpoints](/api-reference/rest-grpc-endpoints#multilayer-module)).
عمليات القراءة:

- `getAnchor(layerId)` — مرساة طبقة ما.
- `getLatestAnchor()` — أحدث مرساة.
- `getAnchors(layerId)` — تاريخ المراسي لطبقة ما.
- `getPqcAccount(address)` — حساب مقاوم للكم مُسجَّل (مفتاح ML-DSA-87
  الخاص به)، يُستخدم للتحقق من توقيع المنشئ.

## واجهة سطر الأوامر

```bash
# Build a receipt and print it.
qorollup receipt my-roll 7

# Build, then verify it inline.
qorollup receipt my-roll 7 --verify

# Build and write it to a file.
qorollup receipt my-roll 7 --out receipt.json
```

راجع [نشر rollup](/rollups/deploying-a-rollup) للاطلاع على واجهة سطر أوامر المشغّل
`qorollup` الكاملة.

## لغات أخرى

تكشف عملاء Python وGo وRust وJava (JVM) عن نفس واجهة البناء/التحقق.
وهم ينفّذون التحقق من ML-DSA-87 عبر مكتبة
[`qorechain-pqc`](https://github.com/qorechain) بدلًا من تنفيذ
JavaScript مُضمَّن؛ ثبّتها إلى جانب عميل الـ RDK للغتك.
