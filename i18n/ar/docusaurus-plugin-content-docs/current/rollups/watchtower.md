---
slug: /rollups/watchtower
title: برج المراقبة
sidebar_label: برج المراقبة
sidebar_position: 9
---

# برج المراقبة (Watchtower)

برج المراقبة هو إطار عمل للطعن التلقائي لرول-أب التفاؤلية (optimistic rollups).
فهو يتتبع دُفعات التسوية الخاصة بأي رول-أب، ويُظهر كل دُفعة جديدة والموعد النهائي
لنافذة الطعن الخاصة بها، و — عندما يرفض **مُسنِد الصلاحية الخاص بك** دُفعةً ما — يُسلّمها
إلى دالة الاستدعاء `onInvalid` لديك حتى تتمكن من إعداد الطعن.

يُراقب الإطار ويقرر *متى*؛ **أنت من يوفّر فحص الصلاحية**.
لا يقرر برج المراقبة من تلقاء نفسه أبدًا أن دُفعةً ما احتيالية — بل يستدعي دالة
`validate` لديك ويتصرف بناءً على ما تُعيده.

## `watchBatches`

```ts
import { createRdkClient, watchBatches, challengeBatch } from "@qorechain/rdk";

const rdk = createRdkClient({
  endpoints: {
    rest: "https://rest.testnet.example",
    rpc: "https://rpc.testnet.example", // needed to broadcast a challenge
  },
});

const watcher = watchBatches(rdk, "my-roll", {
  onBatch: (batch) => {
    console.log("new batch", batch.index);
  },

  // Your validity predicate. Return false to flag the batch as invalid.
  validate: async (batch) => {
    return await isBatchValid(batch); // your logic
  },

  // Called when validate() returns false — wire it to a challenge.
  onInvalid: async (batch) => {
    await challengeBatch(rdk, "my-roll", batch.index /* + your fraud proof */);
  },

  // Called as a batch approaches the end of its challenge window.
  onDeadline: (batch) => {
    console.warn("challenge window closing for batch", batch.index);
  },
});

// Later:
watcher.stop();
```

يُظهر الإطار:

- **الدُفعات الجديدة** عبر `onBatch`،
- **المواعيد النهائية لنافذة الطعن** عبر `onDeadline`، و
- **الدُفعات غير الصالحة** (حيث أعادت دالة `validate` لديك القيمة `false`) عبر `onInvalid`.

ربط `onInvalid` بـ `challengeBatch` يُحوّل برج المراقبة إلى مُطاعِن تلقائي
متكامل؛ اتركه دون تعيين لتشغيله في وضع المراقبة فقط.

## واجهة سطر الأوامر (CLI)

```bash
qorollup watchtower my-roll
```

يُشغّل `watchtower` الإطار من سطر الأوامر، ويطبع الدُفعات الجديدة والمواعيد
النهائية لنافذة الطعن حتى تضغط Ctrl-C. راجع
[نشر رول-أب](/rollups/deploying-a-rollup) للاطلاع على واجهة سطر الأوامر التشغيلية
الكاملة `qorollup`.
