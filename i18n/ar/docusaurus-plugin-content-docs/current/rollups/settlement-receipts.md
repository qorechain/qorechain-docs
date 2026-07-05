---
slug: /rollups/settlement-receipts
title: إيصالات التسوية الآمنة كمومياً
sidebar_label: إيصالات التسوية
sidebar_position: 6
---

# إيصالات التسوية الآمنة كمومياً

**إيصال التسوية** هو إثبات محمول وقائم بذاته على أن دفعة التسوية الخاصة بـ rollup
قد تم تثبيتها (anchored) على السلسلة الرئيسية بموجب توقيع ما بعد الكم.
وهو يربط دفعة محددة بالمرساة (anchor) المسجلة على السلسلة التي وثّقت حالة
الـ rollup عند ذلك الارتفاع، ويمكن التحقق منه **دون اتصال بالإنترنت بالكامل** —
لا حاجة إلى عقدة، ولا إلى الثقة في مسار الشبكة لدى الجهة المتحقِّقة.

توقيع المرساة هو **ML-DSA-87** ‏(Dilithium-5، ‏FIPS-204)، وهو نفس مخطط
ما بعد الكم الذي تستخدمه السلسلة الرئيسية، وبذلك يرث الإيصال سلامة السلسلة
الأساسية الآمنة كمومياً.

## رسالة المرساة القانونية

يتحقق التحقُّق من توقيع Dilithium-5 على رسالة قانونية (canonical) مبنية من
حقول المرساة، مُسلسلة بهذا الترتيب الدقيق:

```
layer_id || layer_height (8-byte big-endian) || state_root || validator_set_hash
```

تنتج الدالة `anchorSignBytes(...)` هذه البايتات؛ وتعيد الجهة المتحقِّقة بناءها من
الإيصال ثم تفحص التوقيع مقابل مفتاح ML-DSA-87 المسجل الخاص بمنشئ الطبقة.

## البناء والتحقق (TypeScript)

```ts
import {
  createRdkClient,
  buildSettlementReceipt,
  verifySettlementReceipt,
} from "@qorechain/rdk";

// The public qore.host endpoints are baked into the presets (RDK ≥ 0.4.2);
// pass `endpoints` only to target your own node.
const rdk = createRdkClient({ network: "testnet" });

// Build a portable receipt for one batch.
const receipt = await buildSettlementReceipt(rdk, "my-roll", 7);

// Persist it, ship it, hand it to a counterparty — it is self-contained JSON.

// Verify fully offline. With no client, you must supply the creator's key.
const result = await verifySettlementReceipt(receipt, {
  creatorPublicKey: "<layer creator ML-DSA-87 public key>",
});

console.log(result.valid); // true when the signature and the batch↔anchor binding both hold
```

إذا مرّرت `client` بدلاً من `creatorPublicKey` (أو إلى جانبه)، فإن التحقق
يجلب مفتاح ML-DSA-87 المسجل لمنشئ الطبقة من السلسلة
(`getPqcAccount(address)`). ثم يفحص التحقق أمرين:

1. **توقيع Dilithium-5** على رسالة المرساة القانونية، و
2. **ربط جذر الحالة بين الدفعة والمرساة (batch ↔ anchor)** — أي أن الدفعة التي
   بحوزتك هي نفسها التي وثّقتها المرساة.

```ts
// Online verification: fetch the creator's PQC key from the chain.
const online = await verifySettlementReceipt(receipt, { client: rdk });
```

## قراءة المراسي

تُبنى الإيصالات من استعلام **Anchor** الخاص بوحدة `x/multilayer` على السلسلة،
وهو متاح عبر gRPC وREST معاً اعتباراً من إصدار السلسلة **v3.1.80** (راجع
[نقاط نهاية REST / gRPC‏](/api-reference/rest-grpc-endpoints#multilayer-module)).
عمليات القراءة:

- `getAnchor(layerId)` — المرساة الخاصة بطبقة معينة.
- `getLatestAnchor()` — أحدث مرساة.
- `getAnchors(layerId)` — سجل المراسي الخاص بطبقة معينة.
- `getPqcAccount(address)` — حساب ما بعد الكم المسجل (مفتاح ML-DSA-87 الخاص
  به)، ويُستخدم للتحقق من توقيع المنشئ.

## واجهة سطر الأوامر (CLI)

```bash
# Build a receipt and print it.
qorollup receipt my-roll 7

# Build, then verify it inline.
qorollup receipt my-roll 7 --verify

# Build and write it to a file.
qorollup receipt my-roll 7 --out receipt.json
```

راجع [نشر Rollup‏](/rollups/deploying-a-rollup) للاطلاع على واجهة سطر الأوامر
الكاملة للمشغّل `qorollup`.

## اللغات الأخرى

توفر عملاء Python وGo وRust وJava ‏(JVM) نفس واجهة البناء/التحقق.
وهي تُجري تحقق ML-DSA-87 عبر مكتبة
[`qorechain-pqc`](https://github.com/qorechain) بدلاً من تطبيق JavaScript
مضمّن؛ ثبّتها إلى جانب عميل RDK الخاص بلغتك.
