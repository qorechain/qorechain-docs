---
slug: /user-guide/deploying-rollups
title: نشر الـ Rollups
sidebar_label: نشر الـ Rollups
sidebar_position: 6
---

# نشر الـ Rollups

يغطّي هذا الدليل كيفية نشر rollups مخصّصة للتطبيقات على QoreChain باستخدام مجموعة تطوير الـ Rollup (RDK). توفّر الـ RDK ملفات تعريف مُعدّة مسبقاً لحالات الاستخدام الشائعة، وتخصيصاً كاملاً لعمليات النشر المتقدّمة.

:::caution
تُعدّ الـ RDK وطبقة تسوية الـ rollup قدرة تتطوّر بنشاط. عامِل المعاملات والإعدادات المسبقة ونضج كل ميزة على حدة أدناه على أنها قابلة للتغيير، وتحقّق من عمليات النشر على **`qorechain-diana`** قبل استهداف الشبكة الرئيسية.
:::

:::note
تستخدم الأوامر أدناه شبكة الاختبار **`qorechain-diana`** (معرّف سلسلة EVM **9800**). أمّا الشبكة الرئيسية (**`qorechain-vladi`**، معرّف سلسلة EVM **9801**) فهي قيد التشغيل منذ 7 يونيو 2026 وتعمل بإصدار السلسلة **v3.1.77** — استبدل معرّف سلسلة الشبكة الرئيسية ونقاط النهاية من صفحة **الاتصال بالشبكة الرئيسية** عند النشر على الشبكة الرئيسية.
:::

---

## نظرة عامة

تتيح RDK الخاصة بـ QoreChain للمطوّرين إطلاق rollups سيادية تُسوّى على QoreChain. كل rollup هو بيئة تنفيذ مستقلّة لها وقت كتلة خاص بها، وآلة افتراضية، ونموذج رسوم، مع وراثة ضمانات الأمان وتوافر البيانات في QoreChain.

---

## الملفات التعريفية المُعدّة مسبقاً

تأتي الـ RDK مع خمسة ملفات تعريفية مُعدّة مسبقاً، كل منها مضبوط لفئة تطبيق شائعة:

| الملف التعريفي        | التسوية (الإثبات)  | المسلسِل (Sequencer) | DA              | نموذج الغاز    | الآلة الافتراضية       | حالة الاستخدام المقصودة |
| -------------- | ------------------- | --------- | --------------- | ------------ | -------- | ----------------- |
| **defi**       | zk (SNARK)          | dedicated | native          | EIP-1559     | EVM      | تطبيقات DeFi/AMM (الإقراض، DEXs، المشتقّات) |
| **gaming**     | based               | based     | native          | flat         | custom   | حالة لعبة عالية الإنتاجية وتجارب آنية |
| **nft**        | optimistic (fraud)  | dedicated | native (Celestia DA مخطّط له) | standard | CosmWasm | أعباء سكّ NFT والأسواق |
| **enterprise** | based               | based     | native          | subsidized   | EVM      | عمليات نشر مأذونة وكونسورتيوم برسوم مدعومة |
| **custom**     | بمعاملات كاملة | بمعاملات كاملة | بمعاملات كاملة | بمعاملات كاملة | بمعاملات كاملة | اضبط كل حقل بنفسك |

:::note
تطابق القيم لكل إعداد مسبق أعلاه الإعدادات الافتراضية للملفات التعريفية المشحونة في `@qorechain/rdk`. قد تتطوّر التهيئة الدقيقة مع نضج الـ RDK — استعلم عن القيم الموثوقة بـ `qorechaind query rdk config` (أو `RdkClient.params()`)، ولاحظ أن تسوية `based` تقترن دائماً بوضع المسلسِل `based`.
:::

---

## المتطلّبات

قبل نشر rollup، تأكّد من استيفائك للمتطلّبات التالية:

| المتطلّب       | التفاصيل                                                                                |
| ----------------- | -------------------------------------------------------------------------------------- |
| **الحد الأدنى للحصّة** | 10,000 QOR (10,000,000,000 uqor)                                                       |
| **حرق الإنشاء** | يُحرق 1% من المبلغ المرهون نهائياً عند إنشاء الـ rollup                       |
| **الحساب**       | حساب QoreChain مموَّل برصيد كافٍ للحصّة إضافةً إلى رسوم المعاملات |

---

## إنشاء rollup من إعداد مسبق

انشر rollup باستخدام أحد الملفات التعريفية المُعدّة مسبقاً:

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "my-defi-rollup" \
  --profile defi \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**مثال:** انشر rollup للألعاب:

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "battle-arena" \
  --profile gaming \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## إنشاء rollup مخصّص

للتحكّم الكامل في معاملات الـ rollup، استخدم الملف التعريفي `custom` وحدّد كل خيار:

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

**المعاملات المخصّصة:**

| المعامِل      | الخيارات                                       | الوصف                        |
| -------------- | --------------------------------------------- | ---------------------------------- |
| `--settlement` | `optimistic`, `zk`, `based`, `sovereign`      | كيفية التحقّق من انتقالات الحالة |
| `--sequencer`  | `dedicated`, `shared`, `based`                | استراتيجية ترتيب المعاملات      |
| `--da-backend` | `native`, `external`                          | طبقة توافر البيانات            |
| `--vm-type`    | `evm`, `cosmwasm`, `custom`                   | بيئة التنفيذ              |
| `--block-time` | عدد صحيح (بالمللي ثانية)                        | الفترة المستهدفة لإنتاج الكتل   |

---

## إرسال الدفعات

يرسل مشغّلو الـ rollup دفعات معاملات إلى QoreChain للتسوية:

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

## إدارة دورة حياة الـ Rollup

يمكن لمشغّلي الـ rollup إدارة دورة حياة عمليات نشرهم:

1. **إيقاف rollup مؤقتاً** — أوقف إنتاج الكتل مؤقتاً. تُحفظ حالة الـ rollup ويمكن استئنافها.

   ```bash
   qorechaind tx rdk pause-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

2. **استئناف rollup** — استأنف إنتاج الكتل على rollup متوقّف مؤقتاً:

   ```bash
   qorechaind tx rdk resume-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

3. **إيقاف rollup (نهائي)** — أوقف rollup نهائياً. هذا الإجراء **لا رجعة فيه**.

   ```bash
   qorechaind tx rdk stop-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

:::danger
إيقاف rollup نهائي. تُؤرشَف جميع الحالات المرتبطة لكن لا يمكن إعادة تشغيل الـ rollup. تُعاد الـ QOR المرهونة (مطروحاً منها حرق الإنشاء) إلى المشغّل.
:::

---

## الاستعلام عن الـ Rollups

احصل على تفاصيل حول rollup محدّد:

```bash
qorechaind query rdk rollup <rollup_id>
```

اسرد جميع الـ rollups على QoreChain:

```bash
qorechaind query rdk rollups
```

**مثال على المُخرَج:**

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

## اقتراح الملف التعريفي بمساعدة QCAI

لست متأكّداً أي ملف تعريفي يناسب حالة استخدامك؟ استخدم أداة الاقتراح بمساعدة QCAI:

```bash
qorechaind query rdk suggest-profile --use-case "defi lending protocol"
```

**مثال على المُخرَج:**

```yaml
suggested_profile: defi
confidence: 0.94
reasoning: "DeFi lending protocols benefit from ZK settlement for fast finality, EVM compatibility for Solidity smart contracts, and EIP-1559 fee model for predictable gas costs."
alternative_profile: enterprise
```

يحلّل هذا الأمر وصفك ويوصي بأنسب ملف تعريفي مُعدّ مسبقاً مع شرح.

---

## نصائح

* ابدأ بملف تعريفي مُعدّ مسبقاً وخصّصه لاحقاً. الإعدادات المسبقة محسّنة لحالات الاستخدام المستهدفة.
* حرق الإنشاء البالغ 1% هو تكلفة لمرة واحدة تُطبّق على الحد الأدنى للحصّة في وقت النشر.
* استخدم تسوية `based` إذا أردت أبسط إعداد مع تولّي مدقّقي QoreChain للتسلسل.
* راقب إرسال الدفعات عن كثب. يمكن أن تُطلِق الفجوات في إرسال الدفعات تنبيهات من الشبكة.
* أمر `suggest-profile` نقطة انطلاق مفيدة، لكن راجِع التوصية في ضوء متطلّباتك الخاصة.
