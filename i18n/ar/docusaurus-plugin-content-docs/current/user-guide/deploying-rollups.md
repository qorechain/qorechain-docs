---
slug: /user-guide/deploying-rollups
title: نشر التجميعات (Rollups)
sidebar_label: نشر التجميعات
sidebar_position: 6
---

# نشر التجميعات (Rollups)

يشرح هذا الدليل كيفية نشر تجميعات (rollups) مخصصة للتطبيقات على QoreChain باستخدام حزمة تطوير التجميعات (Rollup Development Kit - RDK). توفّر حزمة RDK ملفات تعريفية جاهزة (presets) لحالات الاستخدام الشائعة، بالإضافة إلى إمكانية التخصيص الكامل للنشرات المتقدمة.

:::caution
حزمة RDK وطبقة تسوية التجميعات هي قدرة قيد التطوير النشط. تعامل مع المعاملات والملفات الجاهزة ومستوى نضج الميزات الفردية أدناه على أنها قابلة للتغيير، وتحقق من عمليات النشر على شبكة **`qorechain-diana`** قبل الاستهداف على الشبكة الرئيسية.
:::

:::note
تستخدم الأوامر أدناه الشبكة التجريبية **`qorechain-diana`** (معرّف سلسلة EVM **9800**). الشبكة الرئيسية (**`qorechain-vladi`**، معرّف سلسلة EVM **9801**) تعمل منذ 7 يونيو 2026 بإصدار السلسلة **v3.1.92** — استبدل معرّف السلسلة ونقاط النهاية الخاصة بالشبكة الرئيسية من صفحة **الاتصال بالشبكة الرئيسية** عند النشر عليها.
:::

---

## نظرة عامة

تتيح حزمة RDK الخاصة بـ QoreChain للمطورين إطلاق تجميعات سيادية (sovereign rollups) تُسوَّى على QoreChain. كل تجميع هو بيئة تنفيذ مستقلة لها زمن إنتاج الكتل الخاص بها، وآلتها الافتراضية، ونموذج الرسوم الخاص بها، بينما ترث ضمانات الأمان وتوفر البيانات من QoreChain.

---

## الملفات الجاهزة (Presets)

تأتي حزمة RDK مع خمسة ملفات جاهزة، كل منها مُهيَّأ لفئة تطبيقات شائعة:

| الملف          | التسوية (الإثبات)   | المُرتِّب (Sequencer) | توفر البيانات (DA) | نموذج الغاز  | الآلة الافتراضية (VM) | حالة الاستخدام المقصودة |
| -------------- | ------------------- | --------- | --------------- | ------------ | -------- | ----------------- |
| **defi**       | zk (SNARK)          | dedicated | native          | EIP-1559     | EVM      | تطبيقات DeFi/AMM (الإقراض، بورصات التداول اللامركزية DEXs، المشتقات) |
| **gaming**     | based               | based     | native          | flat         | custom   | حالة ألعاب عالية الإنتاجية وتجارب في الوقت الفعلي |
| **nft**        | optimistic (fraud)  | dedicated | native (Celestia DA planned) | standard | CosmWasm | أعمال سك (minting) الرموز غير القابلة للاستبدال (NFT) وأعمال أسواق التداول |
| **enterprise** | based               | based     | native          | subsidized   | EVM      | عمليات نشر مرخصة واتحادية (consortium) برسوم مدعومة |
| **custom**     | fully parameterized | fully parameterized | fully parameterized | fully parameterized | fully parameterized | اضبط كل حقل بنفسك |

:::note
تطابق القيم الخاصة بكل ملف أعلاه القيم الافتراضية للملفات الجاهزة المشحونة ضمن `@qorechain/rdk`. قد يتطور الإعداد الدقيق مع نضج حزمة RDK — استعلم عن القيم الرسمية عبر `qorechaind query rdk config` (أو `RdkClient.params()`)، ولاحظ أن تسوية `based` تقترن دائمًا بوضع المُرتِّب `based`.
:::

---

## المتطلبات

قبل نشر تجميع، تأكد من استيفاء المتطلبات التالية:

| المتطلب            | التفاصيل                                                                                |
| ----------------- | -------------------------------------------------------------------------------------- |
| **الحد الأدنى للحصة (Stake)** | 10,000 QOR (10,000,000,000 uqor)                                                       |
| **رسوم الحرق عند الإنشاء** | تُحرق 1% من المبلغ المُحاصص بشكل دائم عند إنشاء التجميع                       |
| **الحساب**       | حساب QoreChain ممول برصيد كافٍ لتغطية الحصة بالإضافة إلى رسوم المعاملات |

---

## إنشاء تجميع من ملف جاهز

انشر تجميعًا باستخدام أحد الملفات الجاهزة:

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "my-defi-rollup" \
  --profile defi \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**مثال:** نشر تجميع ألعاب (gaming):

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "battle-arena" \
  --profile gaming \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## إنشاء تجميع مخصص

للتحكم الكامل في معاملات التجميع، استخدم الملف الجاهز `custom` وحدد كل خيار على حدة:

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "my-rollup" \
  --profile custom \
  --settlement optimistic \
  --sequencer dedicated \
  --da-backend native \
  --vm-type evm \
  --block-time 1000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**المعاملات المخصصة:**

| المعامل      | الخيارات                                       | الوصف                        |
| -------------- | --------------------------------------------- | ---------------------------------- |
| `--settlement` | `optimistic`, `zk`, `based`, `sovereign`      | كيفية التحقق من انتقالات الحالة |
| `--sequencer`  | `dedicated`, `shared`, `based`                | استراتيجية ترتيب المعاملات      |
| `--da-backend` | `native`, `external`                          | طبقة توفر البيانات            |
| `--vm-type`    | `evm`, `cosmwasm`, `custom`                   | بيئة التنفيذ              |
| `--block-time` | عدد صحيح (بالميلي ثانية)                        | الفاصل الزمني المستهدف لإنتاج الكتل   |

---

## إرسال الدُفعات (Batches)

يقوم مشغلو التجميعات بإرسال دُفعات المعاملات إلى QoreChain لتسويتها:

```bash
qorechaind tx rdk submit-batch \
  --rollup-id "my-rollup" \
  --state-root <hex_encoded_state_root> \
  --tx-count 500 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**مثال:**

```bash
qorechaind tx rdk submit-batch \
  --rollup-id "my-rollup" \
  --state-root a1b2c3d4e5f6... \
  --tx-count 500 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## إدارة دورة حياة التجميع

يمكن لمشغلي التجميعات إدارة دورة حياة عمليات النشر الخاصة بهم:

1. **إيقاف تجميع مؤقتًا (Pause)** — إيقاف إنتاج الكتل مؤقتًا. يتم الحفاظ على حالة التجميع ويمكن استئنافها لاحقًا.

   ```bash
   qorechaind tx rdk pause-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

2. **استئناف تجميع (Resume)** — استئناف إنتاج الكتل على تجميع متوقف مؤقتًا:

   ```bash
   qorechaind tx rdk resume-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

3. **إيقاف تجميع بشكل نهائي (Stop)** — إيقاف تجميع بشكل دائم. هذا الإجراء **لا رجعة فيه**.

   ```bash
   qorechaind tx rdk stop-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

:::danger
إيقاف التجميع نهائي. تُؤرشف جميع الحالات المرتبطة به، لكن لا يمكن إعادة تشغيل التجميع بعد ذلك. يُعاد رصيد QOR المُحاصص (بعد خصم رسوم الحرق عند الإنشاء) إلى المشغّل.
:::

---

## الاستعلام عن التجميعات

للحصول على تفاصيل تجميع معين:

```bash
qorechaind query rdk rollup <rollup_id>
```

لعرض جميع التجميعات على QoreChain:

```bash
qorechaind query rdk rollups
```

**نموذج للمخرجات:**

```yaml
rollup:
  id: "my-defi-rollup"
  owner: qor1abc...xyz
  profile: defi
  settlement: zk
  vm_type: evm
  block_time: 500ms
  status: active
  total_batches: 1247
  last_state_root: "a1b2c3d4..."
```

---

## اقتراح الملف الشخصي بمساعدة QCAI

لست متأكدًا من الملف الجاهز الأنسب لحالة استخدامك؟ استخدم أداة الاقتراح المدعومة بـ QCAI:

```bash
qorechaind query rdk suggest-profile --use-case "defi lending protocol"
```

**نموذج للمخرجات:**

```yaml
suggested_profile: defi
confidence: 0.94
reasoning: "DeFi lending protocols benefit from ZK settlement for fast finality, EVM compatibility for Solidity smart contracts, and EIP-1559 fee model for predictable gas costs."
alternative_profile: enterprise
```

يحلل هذا الأمر وصفك ويوصي بالملف الجاهز الأنسب مع تقديم شرح لذلك.

---

## نصائح

* ابدأ بملف جاهز ثم خصصه لاحقًا. الملفات الجاهزة مُحسَّنة لحالات الاستخدام المستهدفة الخاصة بها.
* رسوم الحرق البالغة 1% هي تكلفة تُطبَّق مرة واحدة فقط على الحد الأدنى للحصة عند النشر.
* استخدم تسوية `based` إذا كنت تريد أبسط إعداد، حيث يتولى مدققو QoreChain عملية الترتيب.
* راقب عمليات إرسال الدُفعات عن كثب. يمكن أن تؤدي الفجوات في إرسال الدُفعات إلى إطلاق تنبيهات من الشبكة.
* يُعد أمر `suggest-profile` نقطة انطلاق مفيدة، لكن راجع التوصية مقابل متطلباتك المحددة.
