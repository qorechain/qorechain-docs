---
slug: /rollups/settlement-receipts
title: إيصالات التسوية الآمنة كمومياً
sidebar_label: إيصالات التسوية
sidebar_position: 6
---

# إيصالات التسوية الآمنة كمومياً

**إيصال التسوية** هو سجل محمول يثبت أن دفعة التسوية الخاصة بـ rollup قد تم تثبيتها (anchored) على السلسلة الرئيسية بموجب توقيع ما بعد الكم. وهو يسمّي الـ rollup والدفعة والمرساة، ويحمل توقيع **ML-DSA-87** ‏(Dilithium-5، ‏FIPS-204) الخاص بالمرساة، وهو نفس المخطط الذي تستخدمه السلسلة الرئيسية.

:::caution مرحلة مبكرة: لا توجد مراسٍ بعد
تعتمد الإيصالات على المراسي، و**لا يوجد أي rollup أو مرساة على أيٍّ من الشبكتين حتى الآن**. وعلى الشبكة الرئيسية لا يكتب الـ RDK المراسي بعد: تُسجَّل دفعات التسوية، لكن خطوة التثبيت تُتخطّى. تعامل مع هذه الصفحة على أنها وصف للتصميم ولمكوّناته الأساسية، وليست وصفًا لخدمة يمكنك الاعتماد عليها اليوم.
:::

## الإيصال ادّعاء وليس دليلًا {#a-receipt-is-a-claim}

كل حقل في الإيصال يوفّره من يسلّمه إليك. والتحقق من التوقيع مقابل مفتاح أُعطيتَ إياه يُظهر أن شخصًا ما يحمل ذلك المفتاح قد وقّع تلك البايتات؛ لكنه لا يُظهر أن QoreChain ثبّتت أي شيء. ولذلك تحتاج الجهة المتحقِّقة إلى عميل متصل بعقدة QoreChain تثق بها، وتعيد قراءة الادّعاء من حالة السلسلة: الـ rollup وطبقته، والدفعة وجذر حالتها، والمرساة، ومفتاح ما بعد الكم المسجَّل للمنشئ.

## ما الذي توقّعه المرساة {#what-the-anchor-signs}

يُنشأ توقيع المرساة بواسطة مفتاح ML-DSA-87 المسجَّل الخاص بـ**منشئ الـ rollup**. وعلى الشبكة الرئيسية اليوم تكون الرسالة الموقَّعة هي

```
layer_id || layer_height (8-byte big-endian) || state_root || validator_set_hash
```

يغيّر إصدار أحدث للسلسلة الرسالة الموقَّعة، لذا لا تُدرجها في الشيفرة بقيمة ثابتة: اقرأ بايتات التوقيع الخاصة بالشبكة التي تستهدفها. والمرساة كائن على مستوى الطبقة: فهي لا تسمّي الـ rollup ولا الدفعة، ولذلك تربط الجهة المتحقِّقة بينهما عبر قراءات من السلسلة (راجع [البنية متعددة الطبقات](/architecture/multilayer-architecture#reading-anchors)).

## قراءة المراسي {#reading-anchors}

يمكن قراءة المراسي عبر REST وgRPC ‏(`/qorechain/multilayer/v1/anchor/{layer_id}` لأحدث مرساة و`/qorechain/multilayer/v1/anchors/{layer_id}` للسجل)، ويمكن قراءة مفتاح ما بعد الكم المسجَّل لحساب ما عبر `/qorechain/pqc/v1/account/{address}`. وتُقرأ دفعات الـ rollup بالأمر `qorechaind query rdk batch [rollup-id]` (مسارات REST الخاصة بالـ RDK غير متاحة على الشبكة الرئيسية اليوم).

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

مرّر `client` عند كل عملية تحقق. استخدم أحدث إصدار منشور من عميل RDK الخاص بك: فقد تغيّرت واجهة الإيصالات وفحوصاتها بين الإصدارات، وتوفّر عملاء Python وGo وRust وJava نفس واجهة البناء/التحقق (وهي تُجري تحقق ML-DSA-87 عبر مكتبة [`qorechain-pqc`](https://github.com/qorechain)).

:::note قيود العملاء الحالية
تبحث عملاء RDK المنشورة عن مفتاح المنشئ عبر مسار لا تخدمه السلسلة الحيّة، ولذلك لا يكتمل التحقق عبر الإنترنت بعد على الشبكات الحيّة. وإلى أن يعالج أحد إصدارات العملاء هذا الأمر، استخدم الإيصال فقط كسجل تقارنه بالمرساة التي تقرؤها من عقدتك الخاصة.
:::

## واجهة سطر الأوامر (CLI) {#cli}

```bash
qorollup receipt my-rollup 7                 # build and print
qorollup receipt my-rollup 7 --out receipt.json
```

راجع [نشر Rollup](/rollups/deploying-a-rollup) للاطلاع على واجهة سطر الأوامر الكاملة للمشغّل `qorollup`.
