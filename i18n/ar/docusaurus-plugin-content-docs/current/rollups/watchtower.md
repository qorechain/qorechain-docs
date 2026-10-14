---
slug: /rollups/watchtower
title: برج المراقبة
sidebar_label: برج المراقبة
sidebar_position: 9
---

# برج المراقبة (Watchtower)

برج المراقبة (Watchtower) هو إطار عمل للطعن التلقائي (auto-challenger) مخصص للتجميعات التفاؤلية (optimistic rollups). فهو يتتبع دُفعات التسوية الخاصة بأي تجميع (rollup)، ويُظهر كل دُفعة جديدة والموعد النهائي لنافذة الطعن الخاصة بها، و — عندما يرفض مُسنِد الصلاحية **الخاص بك** دُفعةً ما — يُسلّمها إلى دالة الاستدعاء `onInvalid` لديك حتى تتمكن من إعداد الطعن.

يُراقب الإطار ويقرر *متى*؛ بينما **أنت من يوفّر فحص الصلاحية**. لا يقرر برج المراقبة من تلقاء نفسه أبدًا أن دُفعةً ما احتيالية — بل يستدعي دالة `validate` لديك ويتصرف بناءً على ما تُعيده.

:::caution مرحلة مبكرة: يحتاج إلى مسارات REST الخاصة بالـ RDK
يقرأ برج المراقبة الدُفعات عبر عميل REST الخاص بالـ RDK. مسارات REST `/qorechain/rdk/v1/…` غير متاحة على الشبكة الرئيسية اليوم، ولذلك لا يمكن تشغيل برج المراقبة على الشبكة الرئيسية بعد. لم يتم إنشاء أي تجميع (rollup) على أي من الشبكتين، ولذلك لا يوجد ما يمكن مراقبته.
:::

## `watchBatches`

```ts
import { createRdkClient, watchBatches } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });

// `tx` is a signing client that produces the hybrid (post-quantum) signature
// the networks require. See "Signing with the published clients" in
// Deploying a Rollup — the classical-only client in @qorechain/rdk 0.4.4
// cannot get a challenge accepted.
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

  // Called as a batch approaches the end of its challenge window.
  onDeadline: ({ batch, secondsRemaining }) => {
    console.warn("challenge window closing for batch", batch.batchIndex, secondsRemaining);
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
يستخدم الموعد النهائي الذي يُبلغ عنه برج المراقبة نافذة الطعن محوَّلة إلى كتل بمعدل 6 ثوانٍ لكل كتلة (100,800 كتلة افتراضيًا)، ولذلك فإن النافذة الفعلية على الشبكة الرئيسية، بكتلها البالغة ≈3.2 ثانية، أقصر من "7 أيام". كما يتطلب نشر طعن سند التحدّي الخاص بالـ rollup (1,000 QOR للإعدادين المسبقين `nft` و`custom`).
:::

## واجهة سطر الأوامر (CLI)

```bash
qorollup watchtower my-rollup
```

يُشغّل الأمر `watchtower` الإطار من سطر الأوامر، ويطبع الدُفعات الجديدة والمواعيد النهائية لنافذة الطعن حتى تضغط Ctrl-C. راجع [نشر تجميع (Rollup)](/rollups/deploying-a-rollup) للاطلاع على واجهة سطر أوامر المشغّل الكاملة `qorollup`.
