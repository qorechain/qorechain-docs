---
slug: /cli-reference/query-commands
title: أوامر الاستعلام
sidebar_label: أوامر الاستعلام
sidebar_position: 3
---

# أوامر الاستعلام

تتبع جميع أوامر الاستعلام النمط التالي:

```bash
qorechaind query <module> <command> [args] [flags]
```

:::note
تُنفَّذ الاستعلامات على العقدة التي يشير إليها الخيار `--node`. استخدم نقطة نهاية RPC للشبكة الرئيسية **`qorechain-vladi`** (إصدار السلسلة **v3.1.92**) للحصول على بيانات حية، أو نقطة نهاية شبكة الاختبار **`qorechain-diana`** للاختبار. القيمة الافتراضية `tcp://localhost:26657` تستهدف عقدة تشغّلها بنفسك.
:::

تنطبق الرايات (Flags) الشائعة على كل أمر فرعي من أوامر `query`:

| الراية     | النوع  | الوصف                                            |
| ---------- | ------ | ------------------------------------------------ |
| `--node`   | string | نقطة نهاية RPC (الافتراضية: `tcp://localhost:26657`) |
| `--output` | string | تنسيق الإخراج: `json` أو `text`                  |
| `--height` | int    | الاستعلام عن الحالة عند ارتفاع كتلة محدد         |

---

## bank

### balances

الاستعلام عن جميع أرصدة حساب معيّن.

```bash
qorechaind query bank balances <address>
```

### total

الاستعلام عن إجمالي المعروض من جميع الرموز.

```bash
qorechaind query bank total
```

---

## staking

### validator

الاستعلام عن مُدقِّق واحد باستخدام عنوان المشغّل.

```bash
qorechaind query staking validator <validator_address>
```

### validators

سرد جميع المدقِّقين.

```bash
qorechaind query staking validators
```

### delegation

الاستعلام عن تفويض من مفوِّض إلى مُدقِّق.

```bash
qorechaind query staking delegation <delegator_address> <validator_address>
```

### delegations

الاستعلام عن جميع تفويضات مفوِّض معيّن.

```bash
qorechaind query staking delegations <delegator_address>
```

### unbonding-delegation

الاستعلام عن تفويض قيد فك الارتباط.

```bash
qorechaind query staking unbonding-delegation <delegator_address> <validator_address>
```

---

## distribution

### rewards

الاستعلام عن جميع مكافآت التفويض لمفوِّض معيّن.

```bash
qorechaind query distribution rewards <delegator_address>
```

### commission

الاستعلام عن عمولة المُدقِّق.

```bash
qorechaind query distribution commission <validator_address>
```

---

## gov

### proposal

الاستعلام عن مقترح واحد باستخدام المعرّف.

```bash
qorechaind query gov proposal <proposal_id>
```

### proposals

سرد جميع المقترحات، مع إمكانية التصفية حسب الحالة.

```bash
qorechaind query gov proposals [flags]
```

| الراية     | النوع  | الوصف                                                                       |
| ---------- | ------ | --------------------------------------------------------------------------- |
| `--status` | string | التصفية حسب الحالة: `deposit_period`، `voting_period`، `passed`، `rejected` |

### votes

الاستعلام عن الأصوات على مقترح معيّن.

```bash
qorechaind query gov votes <proposal_id>
```

---

## pqc

### account

الاستعلام عن حالة تسجيل مفتاح PQC لحساب معيّن.

```bash
qorechaind query pqc account <address>
```

### algorithms

سرد جميع خوارزميات PQC المدعومة.

```bash
qorechaind query pqc algorithms
```

### algorithm

الاستعلام عن تفاصيل خوارزمية PQC محددة.

```bash
qorechaind query pqc algorithm <algorithm_name>
```

### stats

الاستعلام عن إحصاءات تسجيل PQC المجمَّعة.

```bash
qorechaind query pqc stats
```

### params

الاستعلام عن معاملات وحدة PQC.

```bash
qorechaind query pqc params
```

### migration

الاستعلام عن حالة ترحيل مفتاح PQC لحساب معيّن.

```bash
qorechaind query pqc migration <address>
```

### hybrid-mode

الاستعلام عن وضع فرض التوقيع الهجين الحالي.

```bash
qorechaind query pqc hybrid-mode
```

---

## xqore

### position

الاستعلام عن مركز التحصيص (staking) في xQORE لعنوان معيّن.

```bash
qorechaind query xqore position <address>
```

### params

الاستعلام عن معاملات وحدة xQORE.

```bash
qorechaind query xqore params
```

---

## burn

### stats

الاستعلام عن إحصاءات الحرق عبر جميع القنوات.

```bash
qorechaind query burn stats
```

### params

الاستعلام عن معاملات وحدة الحرق.

```bash
qorechaind query burn params
```

---

## inflation

### rate

الاستعلام عن معدل التضخم السنوي الحالي.

```bash
qorechaind query inflation rate
```

### epoch

الاستعلام عن رقم الحقبة (epoch) الحالية ومدى تقدمها.

```bash
qorechaind query inflation epoch
```

### params

الاستعلام عن معاملات وحدة التضخم.

```bash
qorechaind query inflation params
```

---

## ai

### config

الاستعلام عن تكوين وحدة الذكاء الاصطناعي.

```bash
qorechaind query ai config
```

### stats

الاستعلام عن إحصاءات معالجة الذكاء الاصطناعي المجمَّعة.

```bash
qorechaind query ai stats
```

### fee-estimate

الحصول على تقدير لرسوم الغاز بمساعدة الذكاء الاصطناعي.

```bash
qorechaind query ai fee-estimate [flags]
```

| الراية      | النوع  | الوصف                            |
| ----------- | ------ | -------------------------------- |
| `--tx-type` | string | نوع المعاملة المستخدم في التقدير |
| `--urgency` | string | `low`، `medium`، `high`          |

### investigations

سرد تحقيقات الاحتيال النشطة.

```bash
qorechaind query ai investigations
```

### recommendations

الحصول على توصيات لتحسين الشبكة مولَّدة بالذكاء الاصطناعي.

```bash
qorechaind query ai recommendations
```

### circuit-breakers

الاستعلام عن حالات قواطع الدائرة الحالية.

```bash
qorechaind query ai circuit-breakers
```

---

## reputation

### validators

الاستعلام عن درجات السمعة لجميع المدقِّقين.

```bash
qorechaind query reputation validators
```

### validator

الاستعلام عن درجة السمعة لمُدقِّق محدد.

```bash
qorechaind query reputation validator <validator_address>
```

---

## bridge

### chains

سرد جميع سلاسل الجسر المسجَّلة.

```bash
qorechaind query bridge chains
```

### chain

الاستعلام عن تفاصيل سلسلة مجسورة محددة.

```bash
qorechaind query bridge chain <chain_id>
```

### validators

سرد مدقِّقي الجسر النشطين.

```bash
qorechaind query bridge validators
```

### operations

سرد عمليات الجسر الأخيرة.

```bash
qorechaind query bridge operations
```

| الراية     | النوع  | الوصف                                     |
| ---------- | ------ | ----------------------------------------- |
| `--status` | string | التصفية: `pending`، `completed`، `failed` |
| `--chain`  | string | التصفية حسب معرّف السلسلة                 |

### limits

الاستعلام عن حدود المعدل لسلسلة مجسورة.

```bash
qorechaind query bridge limits <chain_id>
```

### estimate

تقدير رسوم الجسر ووقت التحويل.

```bash
qorechaind query bridge estimate <chain_id> <amount> <asset>
```

---

## crossvm

### message

استرجاع رسالة عابرة للأجهزة الافتراضية (cross-VM) باستخدام المعرّف.

```bash
qorechaind query crossvm message <message_id>
```

### pending

سرد الرسائل العابرة للأجهزة الافتراضية المعلَّقة.

```bash
qorechaind query crossvm pending
```

### params

الاستعلام عن معاملات وحدة Cross-VM.

```bash
qorechaind query crossvm params
```

---

## svm

### account

الاستعلام عن معلومات حساب SVM.

```bash
qorechaind query svm account <pubkey>
```

### program

الاستعلام عن معلومات برنامج SVM منشور.

```bash
qorechaind query svm program <program_id>
```

### params

الاستعلام عن معاملات وحدة SVM.

```bash
qorechaind query svm params
```

### slot

الاستعلام عن رقم فتحة (slot) SVM الحالية.

```bash
qorechaind query svm slot
```

---

## multilayer

### layer

الاستعلام عن تفاصيل طبقة محددة.

```bash
qorechaind query multilayer layer <layer_id>
```

### layers

سرد جميع الطبقات المسجَّلة.

```bash
qorechaind query multilayer layers
```

### anchor

الاستعلام عن سجل إرساء (anchor) محدد.

```bash
qorechaind query multilayer anchor <anchor_id>
```

### anchors

سرد عمليات إرسال الإرساء الأخيرة.

```bash
qorechaind query multilayer anchors [flags]
```

| الراية       | النوع  | الوصف                             |
| ------------ | ------ | --------------------------------- |
| `--layer-id` | string | التصفية حسب معرّف الطبقة          |
| `--limit`    | uint   | الحد الأقصى لعدد النتائج المعادة  |

### routing-stats

الاستعلام عن إحصاءات توجيه المعاملات عبر الطبقات.

```bash
qorechaind query multilayer routing-stats
```

### simulate-route

محاكاة توجيه المعاملة دون تنفيذها.

```bash
qorechaind query multilayer simulate-route <tx_data_hex>
```

### params

الاستعلام عن معاملات وحدة Multilayer.

```bash
qorechaind query multilayer params
```

---

## rdk

### rollup

الاستعلام عن تفاصيل تجميع (rollup) محدد.

```bash
qorechaind query rdk rollup <rollup_id>
```

### rollups

سرد جميع التجميعات المسجَّلة.

```bash
qorechaind query rdk rollups
```

| الراية     | النوع  | الوصف                                  |
| ---------- | ------ | -------------------------------------- |
| `--status` | string | التصفية: `active`، `paused`، `stopped` |

### batch

الاستعلام عن دفعة تسوية محددة.

```bash
qorechaind query rdk batch <rollup_id> <batch_index>
```

### latest-batch

الاستعلام عن أحدث دفعة لتجميع معيّن.

```bash
qorechaind query rdk latest-batch <rollup_id>
```

### suggest-profile

الحصول على توصية بملف تعريف للتجميع بمساعدة الذكاء الاصطناعي.

```bash
qorechaind query rdk suggest-profile <use_case>
```

### blob

الاستعلام عن كتلة بيانات (DA blob) محددة.

```bash
qorechaind query rdk blob <rollup_id> <blob_index>
```

### params

الاستعلام عن معاملات وحدة RDK.

```bash
qorechaind query rdk params
```

:::note
يمكن أيضًا الاستعلام عن إثباتات سحب التجميعات وحالة التسوية ضمن مجموعة `rdk`. تعتمد الأوامر الفرعية للاستعلام ووسائطها الدقيقة على نوع التسوية الخاص بتجميعك؛ راجع وثائق **Rollup Development Kit** للاطلاع على الواجهة المرجعية لاستعلامات السحب/التسوية.
:::

---

## rlconsensus

‏PRISM هي طبقة التعلم المعزَّز التي تضبط معاملات الإجماع. اسم وحدة CLI وهو `rlconsensus` وأوامرها الفرعية محفوظة كما هي حرفيًا.

### agent-status

الاستعلام عن حالة وكيل PRISM الحالية ووضعه.

```bash
qorechaind query rlconsensus agent-status
```

### observation

الاستعلام عن أحدث متجه ملاحظات لـ PRISM.

```bash
qorechaind query rlconsensus observation
```

### reward

الاستعلام عن مقاييس مكافآت PRISM التراكمية.

```bash
qorechaind query rlconsensus reward
```

### params

الاستعلام عن معاملات وحدة إجماع PRISM.

```bash
qorechaind query rlconsensus params
```

### policy

الاستعلام عن تكوين سياسة PRISM النشطة.

```bash
qorechaind query rlconsensus policy
```

---

## babylon

### staking

الاستعلام عن مركز تحصيص BTC لعنوان معيّن.

```bash
qorechaind query babylon staking <address>
```

### checkpoint

الاستعلام عن بيانات نقطة تحقق BTC لحقبة معيّنة.

```bash
qorechaind query babylon checkpoint <epoch>
```

### params

الاستعلام عن معاملات وحدة Babylon.

```bash
qorechaind query babylon params
```

---

## abstractaccount

### account

الاستعلام عن تفاصيل الحساب المجرَّد.

```bash
qorechaind query abstractaccount account <address>
```

### params

الاستعلام عن معاملات وحدة Abstract Account.

```bash
qorechaind query abstractaccount params
```

### permission-schema

الاستعلام عن التصنيف المعياري لأذونات المصادِقات (authenticators) — الأذونات الأحد عشر، وخريطة الرسالة→الإذن، ورسائل إدارة المفاتيح غير القابلة للتفويض (متاح اعتبارًا من إصدار السلسلة **v3.1.85**؛ ويُقدَّم أيضًا عبر REST على المسار `/qorechain/abstractaccount/v1/permission_schema`).

```bash
qorechaind query abstractaccount permission-schema
```

### auth-keygen / auth-sign-cosmos / auth-sign-evm

أدوات مساعدة لبناء تفويضات المصادِقات خارج حِزم SDK: توليد مفتاح اختباري، أو إنتاج **بايتات التوقيع الدقيقة التي تتحقق منها السلسلة** لإجراء مفوَّض عبر مسار Native أو مسار EVM (متاح اعتبارًا من إصدار السلسلة **v3.1.85**).

```bash
qorechaind query abstractaccount auth-keygen
qorechaind query abstractaccount auth-sign-cosmos <account> <to> <amount> <nonce>
qorechaind query abstractaccount auth-sign-evm <account> <to> <value> <data_hex> <nonce>
```

---

## gasabstraction

### accepted-tokens

سرد الرموز المقبولة لدفع رسوم الغاز.

```bash
qorechaind query gasabstraction accepted-tokens
```

### params

الاستعلام عن معاملات وحدة Gas Abstraction.

```bash
qorechaind query gasabstraction params
```

---

## fairblock

### config

الاستعلام عن تكوين تشفير FairBlock.

```bash
qorechaind query fairblock config
```

### params

الاستعلام عن معاملات وحدة FairBlock.

```bash
qorechaind query fairblock params
```
