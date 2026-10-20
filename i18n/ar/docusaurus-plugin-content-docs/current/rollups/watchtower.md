---
slug: /rollups/watchtower
title: برج المراقبة
sidebar_label: برج المراقبة
sidebar_position: 9
---

# برج المراقبة (Watchtower)

برج المراقبة (Watchtower) هو إطار عمل للطعن التلقائي (auto-challenger) مخصص للتجميعات التفاؤلية (optimistic rollups). فهو يتتبع دُفعات التسوية الخاصة بأي تجميع (rollup)، ويُظهر كل دُفعة جديدة والموعد النهائي لنافذة الطعن الخاصة بها، و — عندما يرفض مُسنِد الصلاحية **الخاص بك** دُفعةً ما — يُسلّمها إلى دالة الاستدعاء `onInvalid` لديك حتى تتمكن من إعداد الطعن.

يُراقب الإطار ويقرر *متى*؛ بينما **أنت من يوفّر فحص الصلاحية**. لا يقرر برج المراقبة من تلقاء نفسه أبدًا أن دُفعةً ما احتيالية — بل يستدعي دالة `validate` لديك ويتصرف بناءً على ما تُعيده.

:::caution مرحلة مبكرة: لا يوجد ما يمكن مراقبته، وتنبيهات المواعيد النهائية في الإصدار 0.5.0 خاطئة
يقرأ برج المراقبة الدُفعات عبر عميل REST الخاص بالـ RDK، ومسارات `/qorechain/rdk/v1/…` تُقدَّم على الشبكتين. لم يتم إنشاء أي تجميع (rollup) على أي من الشبكتين (تم التحقق في 20 أكتوبر 2026)، ولذلك لا يوجد ما يمكن مراقبته بعد. وفي `@qorechain/rdk` 0.5.0 يكون منطق الموعد النهائي لنافذة الطعن غير موثوق أيضًا: فقيمة `submittedAt` للدُفعة هي **ارتفاع كتلة**، لكن برج المراقبة (والفحص الصحي الذي يقوم عليه `qorollup status`) يضيف إليها النافذة بالثواني ويقارن المجموع بساعة الحائط، لذا فإن `secondsRemaining` بلا معنى ويُطلَق `onDeadline` بمجرد رؤية الدُفعة لأول مرة. لا تستخدم `onDeadline` أو العدّ التنازلي لاتخاذ القرارات؛ احسب الموعد النهائي بنفسك (راجع الملاحظة أدناه). كما لا يقرأ المراقب سوى الصفحة الأولى من الدُفعات (50).
:::

## `watchBatches`

```ts
import { createRdkClient, watchBatches } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });

// `tx` is a signing client that produces the hybrid (post-quantum) signature
// the networks require: pass `pqcKeypair` to `RdkClient.connectTx` (see
// "RDK 0.5.0 limits" in Deploying a Rollup). Without it the transaction is
// classical-only and refused.
declare const tx: {
  challengeBatch(input: { rollupId: string; batchIndex: number; proof: string }): Promise<unknown>;
};

const watcher = watchBatches(rdk, "my-rollup", {
  onBatch: (batch) => {
    console.log("new batch", batch.batchIndex);
  },

  // Your validity predicate. Return false to flag the batch as invalid.
  validate: async (batch) => {
    return await isBatchValid(batch); // your logic
  },

  // Called when validate() returns false — wire it to a challenge.
  onInvalid: async ({ batch }) => {
    await tx.challengeBatch({
      rollupId: "my-rollup",
      batchIndex: batch.batchIndex,
      proof: myFraudProofHex, // hex fraud proof
    });
  },

  // Called when a batch is within `deadlineWarnSecs` of its deadline. In 0.5.0 the
  // deadline mixes a block height with the wall clock, so treat this as unreliable.
  onDeadline: ({ batch, secondsRemaining }) => {
    console.warn("challenge window alert for batch", batch.batchIndex, secondsRemaining);
  },
});

// Later:
watcher.stop();
```

يُظهر الإطار:

- **الدُفعات الجديدة** عبر `onBatch`،
- **المواعيد النهائية لنافذة الطعن** عبر `onDeadline`، و
- **الدُفعات غير الصالحة** (حيث أعادت دالة `validate` لديك القيمة `false`) عبر `onInvalid`.

ربط `onInvalid` بطعن يُحوّل برج المراقبة إلى مُطاعِن تلقائي متكامل؛ اتركه دون تعيين لتشغيله في وضع المراقبة فقط.

:::note نافذة الطعن
احسب الموعد النهائي للدُفعة بالكتل لا بالثواني: `submitted_at` (ارتفاع كتلة) مضافًا إليه النافذة. **على الشبكة الرئيسية (v3.2.3)** تكون النافذة هي القيمة الافتراضية 604,800 "ثانية" محوَّلة بمعدل ثابت قدره 6 ثوانٍ لكل كتلة، أي **100,800 كتلة** (ويتبع الزمن الفعلي زمن الكتلة، فهو أقصر من "7 أيام" مع كتل الشبكة الرئيسية البالغة ≈3.2 ثانية). **على شبكة الاختبار فقط (v3.2.4)**، تحصل الدُفعة المرسلة ابتداءً من الارتفاع 8,337,253 على نافذة تُقاس بثواني زمن الكتلة. كما يتطلب نشر طعن سند التحدّي الخاص بالـ rollup (1,000 QOR للإعدادين المسبقين `nft` و`custom`).
:::

## واجهة سطر الأوامر (CLI)

```bash
qorollup watchtower my-rollup
```

يُشغّل الأمر `watchtower` الإطار من سطر الأوامر، ويطبع الدُفعات الجديدة والمواعيد النهائية لنافذة الطعن حتى تضغط Ctrl-C. راجع [نشر تجميع (Rollup)](/rollups/deploying-a-rollup) للاطلاع على واجهة سطر أوامر المشغّل الكاملة `qorollup`.
