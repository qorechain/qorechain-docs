---
slug: /cli-reference/query-commands
title: أوامر الاستعلام
sidebar_label: أوامر الاستعلام
sidebar_position: 3
---

# أوامر الاستعلام

تتّبع جميع أوامر الاستعلام النمط:

```bash
qorechaind query <module> <command> [args] [flags]
```

:::note
تُنفَّذ الاستعلامات مقابل العُقدة التي يشير إليها `--node`. استخدم نقطة نهاية RPC للشبكة الرئيسية **`qorechain-vladi`** (إصدار السلسلة **v3.1.77**) للبيانات الحيّة، أو نقطة نهاية لشبكة الاختبار **`qorechain-diana`** للاختبار. تستهدف القيمة الافتراضية `tcp://localhost:26657` عُقدة تشغّلها بنفسك.
:::

تنطبق العلامات الشائعة على كل أمر فرعي لـ `query`:

| العَلَم       | النوع   | الوصف                                     |
| ---------- | ------ | ----------------------------------------------- |
| `--node`   | string | نقطة نهاية RPC (الافتراضي: `tcp://localhost:26657`) |
| `--output` | string | تنسيق الإخراج: `json` أو `text`                 |
| `--height` | int    | استعلام عن الحالة عند ارتفاع كتلة محدد          |

---

## bank

### balances

استعلام عن جميع أرصدة حساب.

```bash
qorechaind query bank balances <address>
```

### total

استعلام عن إجمالي معروض جميع الرموز.

```bash
qorechaind query bank total
```

---

## staking

### validator

استعلام عن مدقق واحد عبر عنوان المشغّل.

```bash
qorechaind query staking validator <validator_address>
```

### validators

سرد جميع المدققين.

```bash
qorechaind query staking validators
```

### delegation

استعلام عن تفويض من مفوِّض إلى مدقق.

```bash
qorechaind query staking delegation <delegator_address> <validator_address>
```

### delegations

استعلام عن جميع تفويضات مفوِّض ما.

```bash
qorechaind query staking delegations <delegator_address>
```

### unbonding-delegation

استعلام عن تفويض قيد فك الارتباط (unbonding).

```bash
qorechaind query staking unbonding-delegation <delegator_address> <validator_address>
```

---

## distribution

### rewards

استعلام عن جميع مكافآت التفويض لمفوِّض ما.

```bash
qorechaind query distribution rewards <delegator_address>
```

### commission

استعلام عن عمولة مدقق.

```bash
qorechaind query distribution commission <validator_address>
```

---

## gov

### proposal

استعلام عن مقترح واحد عبر المعرّف.

```bash
qorechaind query gov proposal <proposal_id>
```

### proposals

سرد جميع المقترحات، مع إمكانية التصفية حسب الحالة.

```bash
qorechaind query gov proposals [flags]
```

| العَلَم       | النوع   | الوصف                                                               |
| ---------- | ------ | ------------------------------------------------------------------------- |
| `--status` | string | التصفية حسب الحالة: `deposit_period` و`voting_period` و`passed` و`rejected` |

### votes

استعلام عن الأصوات على مقترح.

```bash
qorechaind query gov votes <proposal_id>
```

---

## pqc

### account

استعلام عن حالة تسجيل مفتاح PQC لحساب.

```bash
qorechaind query pqc account <address>
```

### algorithms

سرد جميع خوارزميات PQC المدعومة.

```bash
qorechaind query pqc algorithms
```

### algorithm

استعلام عن تفاصيل خوارزمية PQC محددة.

```bash
qorechaind query pqc algorithm <algorithm_name>
```

### stats

استعلام عن إحصاءات تسجيل PQC الإجمالية.

```bash
qorechaind query pqc stats
```

### params

استعلام عن معلمات وحدة PQC.

```bash
qorechaind query pqc params
```

### migration

استعلام عن حالة ترحيل مفتاح PQC لحساب.

```bash
qorechaind query pqc migration <address>
```

### hybrid-mode

استعلام عن وضع فرض التوقيع الهجين الحالي.

```bash
qorechaind query pqc hybrid-mode
```

---

## xqore

### position

استعلام عن مركز staking الـ xQORE لعنوان.

```bash
qorechaind query xqore position <address>
```

### params

استعلام عن معلمات وحدة xQORE.

```bash
qorechaind query xqore params
```

---

## burn

### stats

استعلام عن إحصاءات الحرق عبر جميع القنوات.

```bash
qorechaind query burn stats
```

### params

استعلام عن معلمات وحدة الحرق.

```bash
qorechaind query burn params
```

---

## inflation

### rate

استعلام عن معدل الإصدار السنوي الحالي.

```bash
qorechaind query inflation rate
```

### epoch

استعلام عن رقم الحقبة الحالية وتقدّمها.

```bash
qorechaind query inflation epoch
```

### params

استعلام عن معلمات وحدة الإصدار.

```bash
qorechaind query inflation params
```

---

## ai

### config

استعلام عن تكوين وحدة الذكاء الاصطناعي.

```bash
qorechaind query ai config
```

### stats

استعلام عن إحصاءات معالجة الذكاء الاصطناعي المجمّعة.

```bash
qorechaind query ai stats
```

### fee-estimate

الحصول على تقدير لرسوم الغاز بمساعدة الذكاء الاصطناعي.

```bash
qorechaind query ai fee-estimate [flags]
```

| العَلَم        | النوع   | الوصف                     |
| ----------- | ------ | ------------------------------- |
| `--tx-type` | string | نوع المعاملة للتقدير |
| `--urgency` | string | `low` و`medium` و`high`         |

### investigations

سرد تحقيقات الاحتيال النشطة.

```bash
qorechaind query ai investigations
```

### recommendations

الحصول على توصيات تحسين الشبكة المُولَّدة بالذكاء الاصطناعي.

```bash
qorechaind query ai recommendations
```

### circuit-breakers

استعلام عن حالات قواطع الدائرة (circuit breaker) الحالية.

```bash
qorechaind query ai circuit-breakers
```

---

## reputation

### validators

استعلام عن درجات السمعة لجميع المدققين.

```bash
qorechaind query reputation validators
```

### validator

استعلام عن درجة السمعة لمدقق محدد.

```bash
qorechaind query reputation validator <validator_address>
```

---

## bridge

### chains

سرد جميع سلاسل الجسر المُسجَّلة.

```bash
qorechaind query bridge chains
```

### chain

استعلام عن تفاصيل سلسلة مجسورة محددة.

```bash
qorechaind query bridge chain <chain_id>
```

### validators

سرد مدققي الجسر النشطين.

```bash
qorechaind query bridge validators
```

### operations

سرد أحدث عمليات الجسر.

```bash
qorechaind query bridge operations
```

| العَلَم       | النوع   | الوصف                              |
| ---------- | ------ | ---------------------------------------- |
| `--status` | string | التصفية: `pending` و`completed` و`failed` |
| `--chain`  | string | التصفية حسب معرّف السلسلة                       |

### limits

استعلام عن حدود المعدل لسلسلة مجسورة.

```bash
qorechaind query bridge limits <chain_id>
```

### estimate

تقدير رسوم الجسر وزمن التحويل.

```bash
qorechaind query bridge estimate <chain_id> <amount> <asset>
```

---

## crossvm

### message

استرجاع رسالة عبر الـ VM عبر المعرّف.

```bash
qorechaind query crossvm message <message_id>
```

### pending

سرد رسائل عبر الـ VM المعلّقة.

```bash
qorechaind query crossvm pending
```

### params

استعلام عن معلمات وحدة Cross-VM.

```bash
qorechaind query crossvm params
```

---

## svm

### account

استعلام عن معلومات حساب SVM.

```bash
qorechaind query svm account <pubkey>
```

### program

استعلام عن معلومات برنامج SVM منشور.

```bash
qorechaind query svm program <program_id>
```

### params

استعلام عن معلمات وحدة SVM.

```bash
qorechaind query svm params
```

### slot

استعلام عن رقم فتحة (slot) SVM الحالية.

```bash
qorechaind query svm slot
```

---

## multilayer

### layer

استعلام عن تفاصيل طبقة محددة.

```bash
qorechaind query multilayer layer <layer_id>
```

### layers

سرد جميع الطبقات المُسجَّلة.

```bash
qorechaind query multilayer layers
```

### anchor

استعلام عن سجل ربط (anchor) محدد.

```bash
qorechaind query multilayer anchor <anchor_id>
```

### anchors

سرد أحدث عمليات تقديم الربط.

```bash
qorechaind query multilayer anchors [flags]
```

| العَلَم         | النوع   | الوصف               |
| ------------ | ------ | ------------------------- |
| `--layer-id` | string | التصفية حسب معرّف الطبقة        |
| `--limit`    | uint   | الحد الأقصى للنتائج المُرجعة |

### routing-stats

استعلام عن إحصاءات توجيه المعاملات عبر الطبقات.

```bash
qorechaind query multilayer routing-stats
```

### simulate-route

محاكاة توجيه المعاملة دون تنفيذ.

```bash
qorechaind query multilayer simulate-route <tx_data_hex>
```

### params

استعلام عن معلمات وحدة Multilayer.

```bash
qorechaind query multilayer params
```

---

## rdk

### rollup

استعلام عن تفاصيل rollup محدد.

```bash
qorechaind query rdk rollup <rollup_id>
```

### rollups

سرد جميع عمليات الـ rollup المُسجَّلة.

```bash
qorechaind query rdk rollups
```

| العَلَم       | النوع   | الوصف                           |
| ---------- | ------ | ------------------------------------- |
| `--status` | string | التصفية: `active` و`paused` و`stopped` |

### batch

استعلام عن دفعة تسوية محددة.

```bash
qorechaind query rdk batch <rollup_id> <batch_index>
```

### latest-batch

استعلام عن أحدث دفعة لـ rollup.

```bash
qorechaind query rdk latest-batch <rollup_id>
```

### suggest-profile

الحصول على توصية بملف rollup بمساعدة الذكاء الاصطناعي.

```bash
qorechaind query rdk suggest-profile <use_case>
```

### blob

استعلام عن blob DA محدد.

```bash
qorechaind query rdk blob <rollup_id> <blob_index>
```

### params

استعلام عن معلمات وحدة RDK.

```bash
qorechaind query rdk params
```

:::note
إثباتات سحب الـ rollup وحالة التسوية قابلة للاستعلام أيضًا ضمن مجموعة `rdk`. وتعتمد أوامر الاستعلام الفرعية ومعاملاتها الدقيقة على نوع تسوية الـ rollup لديك؛ راجع وثائق **مجموعة تطوير الـ Rollup** للاطلاع على سطح استعلام السحب/التسوية المعتمد.
:::

---

## rlconsensus

PRISM هي طبقة التعلّم المعزّز التي تضبط معلمات الإجماع. اسم وحدة CLI `rlconsensus` وأوامره الفرعية محفوظة حرفيًا.

### agent-status

استعلام عن حالة ووضع وكيل PRISM الحالي.

```bash
qorechaind query rlconsensus agent-status
```

### observation

استعلام عن أحدث متجه ملاحظة (observation vector) لـ PRISM.

```bash
qorechaind query rlconsensus observation
```

### reward

استعلام عن مقاييس مكافأة PRISM التراكمية.

```bash
qorechaind query rlconsensus reward
```

### params

استعلام عن معلمات وحدة PRISM Consensus.

```bash
qorechaind query rlconsensus params
```

### policy

استعلام عن تكوين سياسة PRISM النشطة.

```bash
qorechaind query rlconsensus policy
```

---

## babylon

### staking

استعلام عن مركز staking الـ BTC لعنوان.

```bash
qorechaind query babylon staking <address>
```

### checkpoint

استعلام عن بيانات نقطة تفتيش (checkpoint) BTC لحقبة معطاة.

```bash
qorechaind query babylon checkpoint <epoch>
```

### params

استعلام عن معلمات وحدة Babylon.

```bash
qorechaind query babylon params
```

---

## abstractaccount

### account

استعلام عن تفاصيل الحساب المجرّد (abstract account).

```bash
qorechaind query abstractaccount account <address>
```

### params

استعلام عن معلمات وحدة Abstract Account.

```bash
qorechaind query abstractaccount params
```

---

## gasabstraction

### accepted-tokens

سرد الرموز المقبولة لدفع الغاز.

```bash
qorechaind query gasabstraction accepted-tokens
```

### params

استعلام عن معلمات وحدة Gas Abstraction.

```bash
qorechaind query gasabstraction params
```

---

## fairblock

### config

استعلام عن تكوين تشفير FairBlock.

```bash
qorechaind query fairblock config
```

### params

استعلام عن معلمات وحدة FairBlock.

```bash
qorechaind query fairblock params
```
