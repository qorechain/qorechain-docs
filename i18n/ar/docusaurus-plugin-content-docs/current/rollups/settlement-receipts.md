---
slug: /rollups/settlement-receipts
title: إيصالات التسوية الآمنة كمومياً
sidebar_label: إيصالات التسوية
sidebar_position: 6
---

# إيصالات التسوية الآمنة كمومياً

**إيصال التسوية** هو سجل محمول يثبت أن دفعة التسوية الخاصة بـ rollup قد تم تثبيتها (anchored) على السلسلة الرئيسية بموجب توقيع ما بعد الكم. وهو يسمّي الـ rollup والدفعة والمرساة، ويحمل توقيع **ML-DSA-87** ‏(Dilithium-5، ‏FIPS-204) الخاص بالمرساة، وهو نفس المخطط الذي تستخدمه السلسلة الرئيسية.

:::caution مرحلة مبكرة: لا توجد مراسٍ بعد
تعتمد الإيصالات على المراسي، و**لا يوجد أي rollup أو مرساة على أيٍّ من الشبكتين حتى الآن** (جرى التحقق في 20 أكتوبر 2026). منذ الإصدار v3.2.2 (الحي على كلتا الشبكتين) تُثبَّت الدفعة المُرسلة مع `anchor_signature` في `x/multilayer` ضمن المعاملة نفسها؛ أما الدفعة المُرسلة بدونه فتُسوّى غير مثبَّتة. لا ترسل عملاء RDK المنشورة (0.5.0) هذا الحقل، ولذلك تكون الدفعات التي ترسلها غير مثبَّتة. تعامل مع هذه الصفحة على أنها وصف للتصميم ولمكوّناته الأساسية، وليست وصفًا لخدمة يمكنك الاعتماد عليها اليوم.
:::

## الإيصال ادّعاء وليس دليلًا {#a-receipt-is-a-claim}

كل حقل في الإيصال يوفّره من يسلّمه إليك. والتحقق من التوقيع مقابل مفتاح أُعطيتَ إياه يُظهر أن شخصًا ما يحمل ذلك المفتاح قد وقّع تلك البايتات؛ لكنه لا يُظهر أن QoreChain ثبّتت أي شيء. ولذلك تحتاج الجهة المتحقِّقة إلى عميل متصل بعقدة QoreChain تثق بها، وتعيد قراءة الادّعاء من حالة السلسلة: الـ rollup وطبقته، والدفعة وجذر حالتها، والمرساة، ومفتاح ما بعد الكم المسجَّل للمنشئ.

## ما الذي توقّعه المرساة {#what-the-anchor-signs}

يُنشأ توقيع المرساة بواسطة مفتاح ML-DSA-87 المسجَّل الخاص بـ**منشئ الـ rollup**. وتعتمد الرسالة الموقَّعة على الارتفاع الذي تُرسَل عنده المرساة. **منذ الإصدار v3.2.2 (ارتفاع الشبكة الرئيسية 3,556,788، وارتفاع شبكة الاختبار 6,905,034) تكون الرسالة هي رسالة v2**: وسم نطاق (domain tag)، ومعرّف السلسلة، ثم الحقول `layer_id` و`layer_height` و`state_root` و`validator_set_hash` وعدد المعاملات وإثبات الحالة المضغوط، كلٌّ منها مسبوق بطوله (التخطيط الدقيق في [قراءة المراسي](/architecture/multilayer-architecture#reading-anchors)). ولا تقبل السلسلة مرساة v1 (`layer_id || layer_height || state_root || validator_set_hash`، بلا معرّف السلسلة) ابتداءً من ذلك الارتفاع. لا تُدرج أيًّا من الصيغتين في الشيفرة بقيمة ثابتة: اقرأ بايتات التوقيع الخاصة بالشبكة التي تستهدفها، مثلًا عبر `qorechaind query rdk anchor-sign-bytes <layer-id> <batch-index> <state-root-hex> --chain-id <id> --tx-count <n>`.

والمرساة كائن على مستوى الطبقة: فهي لا تسمّي الـ rollup ولا الدفعة، ولذلك تربط الجهة المتحقِّقة بينهما عبر قراءات من السلسلة (راجع [البنية متعددة الطبقات](/architecture/multilayer-architecture#reading-anchors)).

## قراءة المراسي {#reading-anchors}

يمكن قراءة المراسي عبر REST وgRPC ‏(`/qorechain/multilayer/v1/anchor/{layer_id}` لأحدث مرساة و`/qorechain/multilayer/v1/anchors/{layer_id}` للسجل)، ويمكن قراءة مفتاح ما بعد الكم المسجَّل لحساب ما عبر `/qorechain/pqc/v1/account/{address}` (`account` بصيغة المفرد). وتُقرأ دفعات الـ rollup عبر مسارات REST الخاصة بالـ RDK (`/qorechain/rdk/v1/batch/{rollup_id}/{batch_index}` و`/qorechain/rdk/v1/latest_batch/{rollup_id}` و`/qorechain/rdk/v1/batches/{rollup_id}`) التي تخدمها الشبكتان كلتاهما، أو بالأمر `qorechaind query rdk batch [rollup-id]`.

## البناء والتحقق (TypeScript) {#build-and-verify}

```ts
import {
  createRdkClient,
  buildSettlementReceipt,
  verifySettlementReceipt,
} from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });

// Build a receipt for one batch (throws if no anchor covers the batch yet).
const receipt = await buildSettlementReceipt(rdk, "my-rollup", 7);

// Verify it against chain state — pass a client; a receipt on its own proves nothing.
const result = await verifySettlementReceipt(receipt, { client: rdk });
console.log(result.valid);
```

مرّر `client` عند كل عملية تحقق. فقد تغيّرت واجهة الإيصالات وفحوصاتها بين الإصدارات، ولذلك استخدم إصدارًا يتحقق مقابل السلسلة (0.5.0 أو أحدث). وتوفّر عملاء Python وGo وRust وJava نفس واجهة البناء/التحقق (ويستخدم عميلا Go وRust مسار البحث عن المفتاح بصيغة الجمع نفسه المذكور في القيد أدناه).

:::caution قيود العملاء الحالية (RDK 0.5.0)
لا تُبلغ `verifySettlementReceipt` في الإصدار 0.5.0 عن `valid` استنادًا إلى الإيصال وحده أبدًا (فبدون `client` تكون النتيجة `mode: "signature-only"` و`valid: false`)، كما أن فحصها للسلسلة لا يكتمل بعد على الشبكات الحيّة، لسببين يعودان إلى العميل لا إلى السلسلة:

* تبحث عن مفتاح المنشئ عبر صيغة الجمع `accounts` من مسار حساب ما بعد الكم، وهو مسار لا تخدمه الشبكتان (HTTP 501؛ المسار العامل هو مسار `account` بصيغة المفرد)، ولذلك تكون النتيجة مع وجود `client` هي `valid: false` مع سبب مفاده أنه تعذّر تحديد مفتاح ما بعد الكم الخاص بالمنشئ؛ و
* تعيد بناء الرسالة الموقَّعة بتخطيط v1، الذي لا تقبله السلسلة للمراسي منذ الإصدار v3.2.2، ولذلك لم يكن بوسعها التحقق من توقيع v2 حقيقي حتى مع توفر المفتاح.

لا تعمل `buildSettlementReceipt` إلا بعد أن تغطي مرساةٌ الدفعة، ولا توجد أي مرساة. استخدم الإيصال فقط كسجل تقارنه بالمرساة وبمفتاح المنشئ اللذين تقرؤهما من عقدتك الخاصة، مع بايتات توقيع v2 الخاصة بالشبكة.
:::

## واجهة سطر الأوامر (CLI) {#cli}

```bash
qorollup receipt my-rollup 7                 # build and print
qorollup receipt my-rollup 7 --out receipt.json
```

راجع [نشر Rollup](/rollups/deploying-a-rollup) للاطلاع على واجهة سطر الأوامر الكاملة للمشغّل `qorollup`.
