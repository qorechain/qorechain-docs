---
slug: /rollups/watchtower
title: برج المراقبة
sidebar_label: برج المراقبة
sidebar_position: 9
---

# برج المراقبة (Watchtower)

برج المراقبة (Watchtower) هو إطار عمل للطعن التلقائي (auto-challenger) مخصص للتجميعات التفاؤلية (optimistic rollups). فهو يتتبع دُفعات التسوية الخاصة بأي تجميع (rollup)، ويُظهر كل دُفعة جديدة والموعد النهائي لنافذة الطعن الخاصة بها، و — عندما يرفض مُسنِد الصلاحية **الخاص بك** دُفعةً ما — يُسلّمها إلى دالة الاستدعاء `onInvalid` لديك حتى تتمكن من إعداد الطعن.

يُراقب الإطار ويقرر *متى*؛ بينما **أنت من يوفّر فحص الصلاحية**. لا يقرر برج المراقبة من تلقاء نفسه أبدًا أن دُفعةً ما احتيالية — بل يستدعي دالة `validate` لديك ويتصرف بناءً على ما تُعيده.

:::caution مرحلة مبكرة: لا يوجد ما يمكن مراقبته بعد
يقرأ برج المراقبة الدُفعات عبر عميل REST الخاص بالـ RDK، ومسارات `/qorechain/rdk/v1/…` تُقدَّم على الشبكتين. لم يتم إنشاء أي تجميع (rollup) على أي من الشبكتين (تم التحقق في 27 أكتوبر 2026)، ولذلك لا يوجد ما يمكن مراقبته بعد ولم يعمل برج المراقبة على دُفعة حيّة. وفي `@qorechain/rdk` 0.5.0 كان منطق الموعد النهائي فيه خاطئًا (إذ كان يقرأ ارتفاع كتلة على أنه طابع زمني Unix، فيُطلَق `onDeadline` بمجرد رؤية الدُفعة لأول مرة) وكان يقرأ الصفحة الأولى فقط من 50 دُفعة؛ و**الإصدار 0.6.0 أصلح الأمرين** (انظر أدناه). استخدم 0.7.0، وهو الإصدار الحالي.
:::

## `watchBatches`

```ts
import { createRdkClient, watchBatches } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });

// `tx` is a signing client that produces the hybrid (post-quantum) signature
// the networks require: pass `pqcKeypair` to `RdkClient.connectTx` (see
// "RDK 0.7.0: changes and limits" in Deploying a Rollup). Without it the
// transaction is classical-only and refused.
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

  // Called once per batch when its challenge window is still open and close to
  // closing: within `deadlineWarnSecs` seconds (time-based window) or
  // `deadlineWarnBlocks` blocks (block-count window). `window` says which rule
  // applies and what is left.
  onDeadline: ({ batch, window }) => {
    console.warn("challenge window closing for batch", batch.batchIndex, window);
  },
});

// Later:
watcher.stop();
```

يُظهر الإطار:

- **الدُفعات الجديدة** عبر `onBatch`،
- **المواعيد النهائية لنافذة الطعن** عبر `onDeadline`، و
- **الدُفعات غير الصالحة** (حيث أعادت دالة `validate` لديك القيمة `false`) عبر `onInvalid`.

منذ الإصدار 0.6.0 (وفي كل إصدار بعده) يتتبّع الإطار كل صفحة من قائمة دُفعات الـ rollup، ويعيد الحكم على الدُفعة كلما اقترب موعدها النهائي (فيواصل الاستعلام إلى الأمام بدءًا من أقدم دُفعة لا تزال نافذتها مفتوحة، بدلًا من الحكم على كل دُفعة مرة واحدة عند أول رؤية لها)، ويقيس كل نافذة بالنسبة إلى رأس السلسلة (`getChainTip`، أي حالة العقدة) بدلًا من الساعة المحلية. أما الدُفعة التي صارت `finalized` فلا يُتحقَّق منها ولا يُحذَّر بشأنها.

**الدُفعات المُعاد إرسالها (0.7.0).** ابتداءً من إصدار السلسلة v3.2.5 (على شبكة الاختبار الآن؛ وعلى الشبكة الرئيسية بعد الترقية) يؤدي إثبات احتيال مُقَرّ إلى رفض الدُفعة وكل دُفعة لاحقة غير منتهية (unfinalized)، ثم يعيد المُسلسِل (sequencer) إرسالها بالفهارس نفسها. كانت الإصدارات السابقة لـ 0.7.0 تميّز الدُفعات بالفهرس وحده، ولذلك فاتتها دُفعة أُعيد إرسالها عند فهرس مرفوض؛ أما 0.7.0 فيميّزها بالفهرس وجذر الحالة معًا، ولا يتحقق أبدًا من دُفعة مرفوضة.

**تطبيق قاعدة الاحتيال في السلسلة (0.7.0).** الدالة `transitionRootValidator` هي محمول `validate` جاهز يطبّق قاعدة السلسلة نفسها (تكون الدُفعة احتيالية عندما لا يكون جذر حالتها هو جذر الانتقال المعتمد)، وتُرجع الدالة `fraudProofForBatch` الإثبات الذي يكسب الطعن، أو لا شيء لدُفعة سليمة، بحيث يمكنك تمريره إلى `challengeBatch`.

ربط `onInvalid` بطعن يُحوّل برج المراقبة إلى مُطاعِن تلقائي متكامل؛ اتركه دون تعيين لتشغيله في وضع المراقبة فقط.

:::note نافذة الطعن
يقيس السلسلة نافذة الدُفعة بإحدى طريقتين، وتُبلغ الدالة `batchChallengeWindow` (التي يستخدمها برج المراقبة والفحص الصحي الذي يقوم عليه `qorollup status`) بأيهما. **نافذة عدّ الكتل، وهي القاعدة على الشبكة الرئيسية للدُفعات المرسلة قبل الارتفاع 3,742,566 (v3.2.3 وما قبله):** النافذة هي عدد الثواني المضبوط للـ rollup محوَّلًا بمعدل ثابت قدره 6 ثوانٍ لكل كتلة، أي **100,800 كتلة** للقيمة الافتراضية 604,800، وتُحتسب من ارتفاع `submitted_at` للدُفعة؛ ويتبع الزمن الفعلي زمن الكتلة، فهو أقصر من "7 أيام" مع كتل الشبكة الرئيسية البالغة ≈3.1 ثانية. وتُبلغ الحزمة عن `open` و`finalizable` منفصلتين، لأن كتلة واحدة تكون كلتيهما بموجب القاعدة التي تنفّذها (يُعدّ الطعن مفتوحًا ما دام `height - submitted_at <= window`، وقابلًا للإنهاء ابتداءً من `height - submitted_at >= window`). **النافذة المبنية على الزمن، من v3.2.4 (على شبكة الاختبار منذ الارتفاع 8,337,253، وعلى الشبكة الرئيسية منذ الارتفاع 3,742,566):** تسجّل الدُفعة المرسلة ابتداءً من ارتفاع الترقية زمن كتلتها، وتكون نافذتها هذا العدد من ثواني زمن الكتلة. يستخدم برج المراقبة نافذة الـ rollup نفسه حين تُبلغ العقدة بها (وتوثّق الحزمة ذلك بوصفه v3.2.4 وما بعده)؛ وإلا فإنه يعود إلى النافذة الافتراضية للوحدة، لذا مرّر `challengeWindowSecs` لـ rollup ضبط نافذة خاصة به. كما يتطلب نشر طعن سند التحدّي الخاص بالـ rollup (1,000 QOR للإعدادين المسبقين `nft` و`custom`). والنافذة الافتراضية للوحدة هي 604,800 ثانية على الشبكة الرئيسية و3,600 ثانية (ساعة واحدة) على شبكة الاختبار (قُرئت من `GET /qorechain/rdk/v1/params` في 27 أكتوبر 2026)، لذا فإن تهيئة الـ rollup نفسها تكون نافذتها أقصر بكثير على شبكة الاختبار.
:::

## واجهة سطر الأوامر (CLI)

```bash
qorollup watchtower my-rollup
```

يُشغّل الأمر `watchtower` الإطار من سطر الأوامر، ويطبع الدُفعات الجديدة والمواعيد النهائية لنافذة الطعن حتى تضغط Ctrl-C. أضف `--canonical` (0.7.0) فيُبلغ أيضًا عن كل دُفعة لا يكون جذر حالتها هو جذر الانتقال المعتمد، أي الدُفعات التي سيكسبها الطعن. راجع [نشر تجميع (Rollup)](/rollups/deploying-a-rollup) للاطلاع على واجهة سطر أوامر المشغّل الكاملة `qorollup`.
