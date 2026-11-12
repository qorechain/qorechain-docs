---
slug: /developer-guide/cross-vm-reference
title: مرجع الاستدعاءات عبر الأنوية الافتراضية (v3.2.8)
sidebar_label: مرجع الأنوية الافتراضية
sidebar_position: 9
---

# مرجع الاستدعاءات عبر الأنوية الافتراضية (v3.2.8)

يتيح الاستدعاء عبر الأنوية الافتراضية لشيفرة تعمل على آلة افتراضية أن تشغّل عقدًا على آلة أخرى: حساب أو عقد QoreChain Native يستدعي عقد EVM، أو حساب يستدعي عقد QoreChain Native (‏CosmWasm)، أو عقد Solidity يستدعي عقد QoreChain Native، وهكذا. وهناك طريقتان لإجراء الاستدعاء. **الاستدعاء المتزامن** يعمل داخل معاملتك ويعيد الجواب فورًا. أما **الاستدعاء غير المتزامن** فيوضع في طابور ويعمل في كتلة لاحقة.

هذه الصفحة هي مرجع الحقول والتكلفة والحدود للإصدار v3.2.8، مع مثال تطبيقي لكل اتجاه. أما المفاهيم ودورة الحياة والسلوك الأقدم فهي في [قابلية التشغيل البيني عبر الأنوية الافتراضية](/developer-guide/cross-vm-interoperability)؛ ودليل SDK في [دليل الاستدعاءات عبر الأنوية الافتراضية](/sdk/guides/cross-vm).

:::note أين يعمل v3.2.8
تعمل شبكة الاختبار **`qorechain-diana`** بالإصدار **v3.2.8** منذ 12 نوفمبر 2026. أما الشبكة الرئيسية **`qorechain-vladi`** فلم تطبّقه بعد، وعليها `MsgCrossVMCall` معطّلة. وكل ما وُسم بـ "v3.2.8" أدناه هو سلوك شبكة الاختبار في الوقت الحالي.
:::

:::caution هل رسالة الاستدعاء متاحة الآن؟
على شبكة الاختبار أوقفت الترقية `MsgCrossVMCall` مؤقتًا. ثم اجتاز مقترح الحوكمة 37 ورفع الإيقاف، فالاستدعاء مفتوح على شبكة الاختبار (جرى التحقق في 12 نوفمبر 2026: قائمة قاطع الدائرة لا تحتوي إلا على `/cosmwasm.wasm.v1.MsgStoreCode`). أما على الشبكة الرئيسية فيبقى معطّلًا. ويظهر توفر الاستدعاء في لحظة معينة من أمرين: معاملات الوحدة (`enabled`) وقائمة قاطع الدائرة. تحقق منهما قبل أن تبني أي شيء عليه:

```bash
# Module parameters: look for "enabled": true
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params

# Circuit breaker list: the call is paused while this contains /qorechain.crossvm.v1.MsgCrossVMCall
curl -s https://api-testnet.qore.host/cosmos/circuit/v1/disable_list
```

يُكتب مسار القائمة في REST على شكل `disable_list` (أما الصيغة `disabled_list` فتُجيب بـ `501`). والمكافئ في سطر الأوامر على العقدة هو `qorechaind query circuit disabled-list`. وحين يكون الاستدعاء موقوفًا تُرفض أي معاملة تحمله، وتبقى الاستدعاءات المصطفّة معلّقة حتى تنتهي مهلتها ما لم يُرفع الإيقاف قبل ذلك. قبل نجاح المقترح 37 كانت القائمة تحتوي على `/qorechain.crossvm.v1.MsgCrossVMCall`؛ ولم تعد تحتويها على شبكة الاختبار. راجع [ما اختُبر على شبكة الاختبار](#tested) لمعرفة ما أُرسل.
:::

## لماذا يهم هذا {#why}

- **التكلفة قابلة للتوقع.** الاستدعاء المصطف إلى QoreChain Native يُظهر سعره مقدمًا: تختار مقدار عمل العقد الذي يجوز له استخدامه وأعلى عامل ازدحام تقبله، ويُحتجز المال في حساب ضمان، وما لا يستخدمه الاستدعاء يعود إليك.
- **لا يستطيع حساب واحد أن يزاحم الآخرين.** يجوز للمرسل أن يملك 100 استدعاء مصطفًّا على الأكثر في وقت واحد، فيبقى الطابور المشترك قابلًا للاستخدام.
- **الاستدعاء الفاشل ليس مجانيًا أبدًا.** الاستدعاء الذي يفشل يدفع ثمن العمل الذي أنجزه، في كل اتجاه، فلا ينفع اصطياد الفشل وإعادة المحاولة بالغاز نفسه.
- **جانب EVM يبقى داخل نافذتك.** الاستدعاء إلى EVM الذي لم توقّعه بنفسك، وجسر EVM عند `0x0901`، لا يُقبلان إلا بواسطة [نافذة تفويض EVM](/developer-guide/evm-window-reference) مفتوحة.

## الاستدعاءات المتزامنة وغير المتزامنة {#sync-async}

| | متزامن (الافتراضي) | غير متزامن (`async = true`) |
| --- | --- | --- |
| وقت التشغيل | داخل معاملتك | في نهاية كتلة لاحقة، من الطابور |
| الغاز | غاز معاملتك نفسها | ميزانية محددة مدفوعة مقدمًا (انظر [التكلفة](#cost)) |
| الجواب | يُعاد في استجابة المعاملة، الحقل `data` | لا يُعاد؛ اقرأ الرسالة المنتهية بمعرّفها |
| إذا فشل الهدف | تُلغى المعاملة كلها | يُسجَّل ذلك الاستدعاء وحده بالحالة `failed` وتبقى معاملتك |
| الأموال | يجوز إرفاق `funds` لهدف QoreChain Native | الأمر نفسه؛ ويُرفض عند التقديم الاستدعاء غير المتزامن المرفق بأموال إلى مسار لا يستطيع حملها |
| الأنسب لـ | كل ما يحتاج النتيجة الآن | عمل "أطلق وانسَ"، والاستدعاءات التي تريد وضع سقف لغازها |

تنتقل الرسالة المصطفّة من `pending` إلى `executed` أو `failed` أو `timed_out`. وتنتهي مهلتها بعد `queue_timeout_blocks` (وهو 100 على شبكة الاختبار). يعمل الطابور من الأقدم أولًا، ولا يشغّل المرور في نهاية الكتلة أكثر من 50 استدعاءً في الكتلة.

### من يستدعي من، متزامنًا أو غير متزامن {#who-calls-whom}

يعتمد اختيار أحد النمطين على الجهة التي تُرسل الاستدعاء.

| المستدعِي | الهدف | متزامن | غير متزامن |
| --- | --- | --- | --- |
| حساب (يوقّع المعاملة) | EVM، QoreChain Native | نعم (الافتراضي) | نعم |
| عقد QoreChain Native يرسل `MsgCrossVMCall` بصفته نفسه | EVM | نعم (`async` خاطئة، وهو الافتراضي) | نعم |
| عقد QoreChain Native يرسل `MsgCrossVMCall` بصفته نفسه | QoreChain Native | مرفوض (مسارك أنت) | مرفوض (مسارك أنت) |
| عقد استدعاه جسر EVM عند `0x0901` (أسفل الجسر) | SVM | نعم | غير مستخدم |
| عقد استدعاه جسر EVM عند `0x0901` (أسفل الجسر) | EVM | غير مستخدم | نعم |

يستطيع عقد QoreChain Native الذي يرسل `MsgCrossVMCall` بصفته نفسه أن يستدعي EVM بأي من النمطين. المتزامن (`async` خاطئة، وهو الافتراضي) يعمل على غاز المعاملة نفسها، ويعود الجواب في `MsgCrossVMCallResponse.data`، ويرتد الفشل بالمعاملة كلها. أما غير المتزامن فيضع الاستدعاء في الطابور. وقد جُرّب النمطان على شبكة الاختبار سابقًا: الاستدعاء المتزامن عند الارتفاع 9,795,779 وغير المتزامن عند الارتفاع 9,795,783.

عبارة "متزامن إلى SVM، وغير متزامن إلى EVM" تنطبق فقط أسفل جسر `0x0901`: فبالنسبة إلى عقد استدعاه جسر EVM، قد يذهب ما يرسله هذا العقد متزامنًا إلى SVM وغير متزامن إلى EVM. وهي ليست قاعدة لعقد يتصرف بصفته نفسه، إذ يجوز له أي من النمطين نحو EVM.

## حقول MsgCrossVMCall {#fields}

عنوان النوع `/qorechain.crossvm.v1.MsgCrossVMCall`.

| الحقل | الرقم | المعنى |
| ----- | ------ | ------- |
| `sender` | 1 | عنوانك `qor1...`. وهو يوقّع الرسالة. |
| `source_vm` | 2 | تتجاهله السلسلة. فهي تستنتج مصدر الاستدعاء بنفسها. ويُرسَل مع ذلك لتقبل العقد الأقدم الرسالة. |
| `target_vm` | 3 | `evm` أو `cosmwasm` أو `svm`. ويُرفض الاستدعاء إلى مسارك أنت. مسار SVM مفتوح على شبكة الاختبار منذ المقترح 37 ومغلق على الشبكة الرئيسية؛ انظر [مسار SVM](/developer-guide/svm-lane-v328). لم يُجرَ أي استدعاء إلى SVM لهذه الصفحة. |
| `target_contract` | 4 | عنوان EVM (`0x` و40 رقمًا ست عشريًا، وليس عنوان precompile) أو عنوان عقد `qor1...`. |
| `payload` | 5 | بيانات الاستدعاء: مُرمَّزة بـ ABI لـ EVM، ورسالة execute بصيغة JSON بترميز UTF-8 لـ QoreChain Native. بحد أقصى `max_message_size` بايت (65,536). |
| `funds` | 6 | العملات المراد إرفاقها (لأهداف QoreChain Native فقط). |
| `async` | 7 | القيمة `true` تضع الاستدعاء في الطابور؛ و`false` (الافتراضي) تشغّله الآن. |
| `async_gas_limit` | 8 | v3.2.8، لغير المتزامن إلى QoreChain Native فقط: وحدات غاز العقد التي يعمل عليها الاستدعاء المصطف. القيمة `0` أو غير المضبوطة تعني 500,000. المسموح من 250,000 حتى ما يستطيع الطابور تشغيله في كتلة واحدة (1,875,000 بالميزانية الافتراضية). |
| `async_max_factor` | 9 | v3.2.8، لغير المتزامن إلى QoreChain Native فقط: أعلى عامل ازدحام تقبل دفعه، بـ **أجزاء من المليون**: القيمة `1000000` تعني 1x و`4000000` تعني 4x. النطاق الصالح من 1,000,000 إلى 100,000,000 (من 1x إلى 100x)؛ وتُرفض القيمة المضاعِفة البسيطة مثل `4` برمز codespace باسم `crossvm` والرمز 2 قبل تشغيل أي شيء. القيمة `0` أو غير المضبوطة تعني أربعة أمثال العامل عند التقديم (4,000,000 جزء من المليون حين يكون العامل 1x)، بحد أقصى هو الحد الأعلى للسلسلة. وتُرفض عند التقديم قيمة أدنى من العامل السائد. |

في سطر الأوامر يكون الحقلان الجديدان `--async-gas-limit` (عدد صحيح) و`--async-max-factor` (عدد عشري مثل `2.5`، يحوّله الأمر إلى أجزاء من المليون نيابةً عنك). أما في الرسالة الخام وفي SDK وفي صيغ REST أو JSON فالقيمة دائمًا بأجزاء من المليون: 2.5x هي `2500000`. ويصدّر SDK الثابت `CROSSVM_ASYNC_FACTOR_ONE` (1,000,000) لتحويل المضاعف إلى أجزاء من المليون، والدالة `validateCrossVmAsyncGas` للتحقق من القيمتين قبل الإرسال.

## التكلفة والضمان والاسترداد {#cost}

بالنسبة إلى **استدعاء غير متزامن إلى QoreChain Native** (v3.2.8):

1. **الضمان.** الدفع المسبق = الوحدات × العامل × سعر الغاز، ويُحتجز ولا يُنفَق. بالقيم الافتراضية يساوي 500,000 وحدة × 4 (4,000,000 جزء من المليون) × 0.1 uqor = 200,000 uqor، أي **0.2 QOR**. ينتقل من رصيدك إلى الحساب `crossvm_async_escrow`. تحتاج إلى هذا المقدار من uqor القابل للإنفاق: فلا تستطيع العملات المقفلة بالاستحقاق (vesting) ولا منح الرسوم (fee grants) ولا الرسوم المدفوعة بعملات أخرى تمويله، ويُرفض الاستدعاء حينها.
2. **رسم خانة الطابور.** يدفع كل استدعاء غير متزامن أيضًا رسم خانة على شكل غاز عند التقديم: 500,000 غاز نحو طابور فارغ، ويرتفع بحسب امتلاء الطابور إلى 2,000,000 غاز نحو طابور ممتلئ. وبسعر 0.1 uqor للغاز يعادل ذلك من 0.05 QOR إلى 0.2 QOR.
3. **التسوية.** عند انتهاء الاستدعاء يُدفع من الضمان، كرسم، الغازُ الذي استخدمه بالعامل السائد حينها، ويعود الباقي إليك. الاستدعاء الذي يفشل يدفع ما استخدمه. أما الاستدعاء الذي تنتهي مهلته أو لا يُشغَّل أبدًا فيستعيد ضمانه كاملًا، ويكون رسم خانته هو رسم المعالجة. ويحمل الحدث `crossvm_escrow_settled` الرسم والمبلغ المسترد.
4. **انتظار العامل.** يعمل الاستدعاء ما دام عامل الازدحام عند `async_max_factor` أو دونه. وإن كان العامل أعلى انتظر، وتنتهي مهلته إن بقي مرتفعًا. وبالقيمة الافتراضية (أربعة أمثال العامل عند التقديم، أي 4,000,000 جزء من المليون حين يكون العامل 1x) يجب أن يزيد العامل على أربعة أمثاله قبل أن ينتظر الاستدعاء.
5. **حدود الحجم.** يجب ألا يتجاوز الدفع المسبق 50,000,000 غاز. وفوق ذلك يُرفض الاستدعاء عند التقديم: أعد المحاولة لاحقًا أو خفّض `async_gas_limit`.

أما في **الاستدعاء غير المتزامن إلى EVM** فميزانية الدفع المسبق 1,000,000 غاز، وتُحتسب عند التقديم. وفي **الاستدعاء المتزامن** تكون التكلفة غاز المعاملة نفسها. والعقود الثقيلة في QoreChain Native التي تحمّل شيفرة كبيرة تحتاج في أول استدعاء لها ضمن الكتلة إلى `async_gas_limit` و`async_max_factor` أعلى من القيم الافتراضية.

### الاستدعاءات الفاشلة تُحاسَب {#failed-charged}

الاستدعاء عبر الأنوية الافتراضية الذي يفشل يدفع مع ذلك ثمن العمل الذي أنجزه. فاستدعاء EVM الذي يرتد أو ينفد غازه يخصم من المستدعِي غاز EVM الذي استهلكه، واستدعاء QoreChain Native عبر جسر `0x0901` الذي يفشل يخصم من إطار EVM المستدعِي الغاز الذي أنفقه العقد. وعلى العقد الذي يريد النجاة من مستدعًى باهظ الفشل أن يضع حد غاز على الاستدعاء الفرعي بدل إعادة المحاولة بالغاز المتبقي نفسه.

## الطابور المعلّق {#pending}

- **100 استدعاء معلّق على الأكثر لكل مرسل** (`max_pending_per_sender`). يُرفض أي استدعاء غير متزامن إضافي بالخطأ `ErrQueueFull` (codespace باسم `crossvm`، الرمز 4) حتى يشتغل أحد استدعاءاتك أو تنتهي مهلته. ولا تتأثر الاستدعاءات المتزامنة.
- **يتّسع الطابور كله لـ `max_queue_size` استدعاء على الأكثر** (1,000).
- **القائمة المعلّقة مقسّمة إلى صفحات.** تحتوي كل صفحة على 100 رسالة على الأكثر، ويُقتطع كل payload في القائمة عند أول **1,024 بايت** (`payload_hex`). ولقراءة payload كامل اجلب الرسالة بمعرّفها.
- **حد الصفحة يُقصّ.** قيمة `pagination.limit` التي تساوي 0 أو تزيد على 100 تُقصّ بصمت إلى 100. والطلب بـ `limit=101` يُجيب بـ `200` مع 100 عنصر على الأكثر، لا بخطأ. وللمتابعة مرّر `next_key` من الاستجابة واستمر حتى يصبح فارغًا.

```bash
# One page of pending calls (use the next key from the response for the next page)
curl -s "https://api-testnet.qore.host/qorechain/crossvm/v1/pending?pagination.limit=100"

# A message by id, with its whole payload
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/message/<id>
```

جرى التحقق على شبكة الاختبار في 12 نوفمبر 2026: أجاب مسار pending بـ `200` مع `{"messages":[],"count":0,"pagination":{"next_key":null,"total":"0"}}` (الطابور فارغ)، وأجاب مسار message بـ `200` مع `{"message":null,"found":false}` لمعرّف غير موجود. وهذه هي القراءات نفسها في واجهة سطر أوامر العقدة على Linux:

```bash
qorechaind query crossvm pending
qorechaind query crossvm message <id>
```

:::note واجهة سطر أوامر العقدة
`qorechaind` هي واجهة سطر أوامر العقدة على Linux. لا يوجد ملف ثنائي مُحزَّم لـ macOS. أما استدعاءات REST فتعمل من أي جهاز.
:::

## معاملات الوحدة {#params}

```bash
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params
```

أجاب بـ `200` في 12 نوفمبر 2026 بهذه الحقول:

| الحقل | القيمة المقروءة | المعنى |
| ----- | ---------- | ------- |
| `enabled` | `true` | مفتاح الوحدة. وللرسالة مدخل خاص بها في قائمة قاطع الدائرة. |
| `max_message_size` | `65536` | أكبر payload بالبايت. |
| `max_queue_size` | `1000` | أكبر عدد استدعاءات مصطفّة في وقت واحد. |
| `queue_timeout_blocks` | `100` | عدد الكتل قبل أن تنتهي مهلة استدعاء لم يُشغَّل. |
| `bridge_allowed_targets` | ثلاثة مدخلات `cosmwasm:qor1...` | عقود QoreChain Native التي يجوز لجسر `0x0901` استدعاؤها. وإذا كانت فارغة بقي الجسر مغلقًا. |
| `bridge_target_pins` | مدخل لكل هدف: `target` و`code_id` و`history_len` | الشيفرة التي يجب أن يظل كل هدف مسموح يشغّلها كي يستدعيه الجسر. |
| `max_pending_per_sender` | `100` | الاستدعاءات المصطفّة التي يجوز لمرسل واحد حملها. |
| `max_cosmos_tx_gas` | `"50000000"` | أكبر غاز يجوز أن تعلنه معاملة Native واحدة. |
| `record_retention_blocks` | `"100000"` | مدة الاحتفاظ بسجل الاستدعاء المصطف المنتهي. |
| `max_block_wasm_gas` | `"3000000"` | تنفيذ QoreChain Native الذي يجوز أن تستخدمه كتلة واحدة. |
| `max_tx_wasm_share_bps` | `5000` | حصة تلك الميزانية التي يجوز أن تستخدمها معاملة واحدة. |
| `max_block_level_wasm_gas` | `"10000000"` | ميزانية عمل العقود المنجز خارج المعاملات. |
| `queue_wasm_reserve_bps` | `2500` | حصة ميزانية الكتلة المخصّصة للطابور. |
| `wasm_congestion_max_factor` | `20` | أعلى قيمة يبلغها عامل الازدحام. |
| `wasm_congestion_target_bps` | `5000` | حصة الاستخدام التي يرتفع العامل فوقها. |
| `wasm_congestion_factor_micro` | `"1000000"` | العامل السائد الآن، بأجزاء من المليون (`1000000` تعني 1x). |
| `max_block_upload_bps` | `5000` | حصة الميزانية التي يجوز أن تستخدمها عمليات رفع الشيفرة. |
| `max_queue_timeouts_per_block` | `100` | عدد الاستدعاءات التي تنتهي مهلتها في الكتلة. |

استخدم `wasm_congestion_factor_micro` لمعرفة ما سيدفعه الاستدعاء المصطف الآن مقدمًا: الوحدات × العامل × 0.1 uqor.

## أمثلة بحسب الاتجاه {#examples}

توقّع كل الأمثلة بالمفتاح ما بعد الكمومي للحساب كما تفعل كل معاملة Native؛ انظر [التوقيع ما بعد الكمومي](/developer-guide/post-quantum-signing). أُرسلت فقط أمثلة الحساب الأصلي إلى QoreChain Native لهذه الصفحة (انظر [ما اختُبر على شبكة الاختبار](#tested))؛ أما أمثلة EVM فلم تُشغَّل وهي موسومة بـ UNTESTED حيث ترد.

### حساب أصلي إلى عقد EVM {#native-to-evm}

**UNTESTED:** لم يُشغَّل هذا الاتجاه لهذه الصفحة.

الهدف عقد EVM؛ والـ payload هو بيانات استدعاء مُرمَّزة بـ ABI. يعمل الاستدعاء بعنوانك `0x` نفسه، فيراك جانب EVM بوصفك `msg.sender`. في سطر الأوامر (واجهة العقدة على Linux)، ابنِ الرسالة ثم أضف التوقيع ما بعد الكمومي:

```bash
qorechaind tx crossvm call evm 0x1234567890123456789012345678901234567890 \
  --payload <hex of abi.encode(selector, args)> \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > call.json

qorechaind tx pqc cosign call.json --from mykey --pqc-key mykey-mldsa \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

TypeScript مع SDK المنشور (0.13.0). تُرمّز الدالة المساعدة الاستدعاء بـ ABI باستخدام viem:

```ts
import { createClient, createCrossVMClient } from "@qorechain/sdk";

const client = createClient({ network: "testnet" });
const tx = await client.connectTx(signer, { pqcKeypair }); // hybrid signing
const xvm = createCrossVMClient(tx);

const { messageId, executed, data } = await xvm.call({
  targetVm: "evm",
  targetContract: "0xYourErc20",
  evm: { abi: erc20Abi, functionName: "transfer", args: ["0xRecipient", 1n] },
});
```

تأخذ Python وGo وRust وJava الـ payload بايتات خامًا إلى EVM (الترميز العالي المستوى بـ ABI متاح في TypeScript فقط). Python:

```python
client.call(target_vm="evm", target_contract="0xYourErc20", payload=calldata_bytes)
```

Go:

```go
res, err := c.Call(crossvm.CallOptions{
    TargetVM:       crossvm.VMTypeEVM,
    TargetContract: "0xYourErc20",
    Payload:        calldata,
})
```

Rust:

```rust
let opts = CallOptions::new(VM_TYPE_EVM, "0xYourErc20", calldata_bytes);
let resp = cross_vm.call_with_responses(&opts).await?;
```

Java:

```java
CrossVMClient.CallOptions o = new CrossVMClient.CallOptions();
o.targetVm = CrossVMClient.VMType.EVM;
o.targetContract = "0xYourErc20";
o.payload = calldata;
client.call(o);
```

إذا لم يكن المرسل هو الحساب الذي وقّع المعاملة، كأن يكون مستفيدًا من منحة authz، فإن جانب EVM يعمل تحت نافذة المانح؛ انظر [authz والنوافذ](#authz).

### حساب أصلي إلى عقد QoreChain Native {#native-to-wasm}

الـ payload هو رسالة execute للعقد بصيغة JSON. ويعيد الاستدعاء المتزامن جواب العقد في `data`:

```bash
qorechaind tx crossvm call cosmwasm qor1...contract \
  --payload $(printf '%s' '{"transfer":{"recipient":"qor1...","amount":"1"}}' | xxd -p -c 0) \
  --funds 100uqor \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 600000 --fees 60000uqor --generate-only > call.json
```

مصطف، مع بدل غاز صريح وسقف للعامل (v3.2.8). يبلغ الضمان 800,000 × 2.5 × 0.1 uqor = 200,000 uqor (0.2 QOR) إذا كان العامل 1 (يأخذ الأمر `2.5` ويرسل 2,500,000 جزء من المليون):

```bash
qorechaind tx crossvm call cosmwasm qor1...contract \
  --payload <hex of the execute message> --async \
  --async-gas-limit 800000 --async-max-factor 2.5 \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > call.json
```

TypeScript مع SDK 0.13.0 (متزامن، ومصطف ببدل الغاز الافتراضي):

```ts
const sync = await xvm.call({
  targetVm: "cosmwasm",
  targetContract: "qor1...contract",
  cosmwasm: { transfer: { recipient: "qor1...", amount: "1" } },
});

const queued = await xvm.call({
  targetVm: "cosmwasm",
  targetContract: "qor1...contract",
  cosmwasm: { transfer: { recipient: "qor1...", amount: "1" } },
  async: true, // default allowance: 500,000 units, 4x factor (4,000,000 millionths)
});

// SDK 0.14.0: explicit allowance. The factor is in millionths: 6x is 6_000_000.
const tuned = await xvm.call({
  targetVm: "cosmwasm",
  targetContract: "qor1...contract",
  cosmwasm: { transfer: { recipient: "qor1...", amount: "1" } },
  async: true,
  asyncGasLimit: 800_000,
  asyncMaxFactor: 6_000_000,
});
```

تضع Python (`async_=True`) وGo (`Async: true`) وRust (`.queue(true)`) وJava (`o.async = true`) الاستدعاء في الطابور بالطريقة نفسها:

```python
client.call(target_vm="cosmwasm", target_contract="qor1...contract",
            cosmwasm={"transfer": {"recipient": "qor1...", "amount": "1"}}, async_=True)
```

:::note دعم SDK للحقلين الجديدين
ليس في SDK 0.13.0 خيار لـ `async_gas_limit` أو `async_max_factor`، فتستخدم استدعاءاته المصطفّة القيم الافتراضية. أما SDK 0.14.0 فيضيف `asyncGasLimit` و`asyncMaxFactor` إلى الاستدعاء عبر الأنوية الافتراضية، ويصدّر `CROSSVM_ASYNC_FACTOR_ONE` (1,000,000) و`validateCrossVmAsyncGas`، وتجعل دالته المساعدة `buildCall` القيمة الافتراضية لـ `sourceVm` هي `evm` للحساب الأصلي. تتجاهل السلسلة `source_vm` وقد سجّلت الرسالة بالقيمة `source_vm` native.
:::

### عقد EVM إلى عقد QoreChain Native عبر 0x0901 {#evm-to-wasm}

**UNTESTED:** لم يُشغَّل هذا الاتجاه لهذه الصفحة.

يستدعي عقد Solidity الـ precompile الخاص بالجسر عند `0x0000000000000000000000000000000000000901`. يعمل الاستدعاء داخل معاملة EVM، ويكون الحساب أو العقد المستدعِي (بعنوانه `qor1`) هو مرسل QoreChain Native، وأي ارتداد في أي موضع يُلغي الجانبين.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CrossVMCaller {
    address constant CROSSVM = 0x0000000000000000000000000000000000000901;

    function callNative(string calldata contractAddr, bytes calldata executeMsg)
        external returns (bytes memory)
    {
        // targetVM 1 is QoreChain Native; executeMsg is the JSON execute message
        (bool ok, bytes memory ret) = CROSSVM.call(
            abi.encodeWithSignature(
                "executeCrossVMCall(uint8,string,bytes)", 1, contractAddr, executeMsg
            )
        );
        require(ok, "cross-VM call failed");
        return ret;
    }
}
```

قواعد الجسر:

- `CALL` عادي فقط، بلا قيمة، والمحدِّد `0x3c11078c`. أما `STATICCALL` و`DELEGATECALL` والآلة الافتراضية الهدف `0` أو `2` فتُرتد.
- يجب أن يكون الهدف في `bridge_allowed_targets` (ومن v3.2.8 أن يظل يشغّل الشيفرة المثبَّتة له). اقرأ الاثنين بمسار المعاملات أعلاه.
- **يحتاج المستدعِي إلى نافذة تُدرج `0x0901`.** أي حساب يرسل معاملة إلى الجسر يجب أن تكون له [نافذة تفويض EVM](/developer-guide/evm-window-reference) مفتوحة تتضمن `allowed_targets` فيها العنوان `0x0000000000000000000000000000000000000901` (والعقد الذي يستدعيه إن استدعيت عبر عقد). افتح واحدة هكذا، بحد يناسب جلستك:

```bash
qorechaind tx pqc open-evm-window 600 5 10qor \
  --allowed-targets 0x0000000000000000000000000000000000000901 \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 80000uqor --generate-only > window.json
```

- الاستدعاء الفاشل يرتد بسبب من نوع `Error(string)` ويُحاسَب على الغاز الذي استخدمه العقد.

تبني الدالة المساعدة `encodeCrossVmCalldata({ contract, msg })` من `@qorechain/rdk` بيانات الاستدعاء نفسها في TypeScript (انظر [الأنوية الافتراضية المتعددة](/rollups/multi-vm)). ومع SDK المنشور يكون عنوان الـ precompile هو `PRECOMPILE_ADDRESSES.crossVmBridge` من `@qorechain/evm`.

### عقد QoreChain Native إلى عقد EVM {#wasm-to-evm}

**UNTESTED** من كاتب الوثائق. يفيد فريق السلسلة بأن النمطين جُرّبا على شبكة الاختبار قبل v3.2.8.

يجري عقد QoreChain Native الاستدعاء بإرسال `MsgCrossVMCall` كرسالة سلسلة، وهو نفسه المرسل. للرسالة الحقول نفسها المذكورة أعلاه؛ وتعامل السلسلة العقد على أنه مستدعٍ من نوع CosmWasm أيًّا كان ما يقوله `source_vm`. حين تكون `async` خاطئة (الافتراضي) يكون الاستدعاء متزامنًا: يعمل على غاز المعاملة، والجواب في `MsgCrossVMCallResponse.data`، والفشل يرتد بالمعاملة كلها. وحين تكون `async` صحيحة يوضع في الطابور. انظر [من يستدعي من](#who-calls-whom). المثال أدناه يضع الاستدعاء في الطابور:

```json
{
  "@type": "/qorechain.crossvm.v1.MsgCrossVMCall",
  "sender": "qor1...the contract...",
  "source_vm": "cosmwasm",
  "target_vm": "evm",
  "target_contract": "0x1234567890123456789012345678901234567890",
  "payload": "<base64 of the ABI-encoded call>",
  "async": true
}
```

أمور تعرفها قبل الاعتماد عليه:

- يرى EVM العقدَ على أنه **آخر 20 بايتًا** من عنوانه ذي 32 بايتًا. تأكد من أن عقد EVM لا يعتمد على كون `msg.sender` حسابًا عاديًا.
- ابتداءً من v3.2.8 يفشل (ويُحاسَب) الاستدعاء الذي سيترك المستدعِي حاملًا لـ QOR أصلي أكثر مما بدأ به. وعلى عقود EVM المقصودة لهذا الاتجاه أن تدفع برمز ERC-20 أو بحساب من 20 بايتًا مسمّى في الاستدعاء، لا بـ QOR أصلي إلى `msg.sender`.
- العقد الذي يتصرف بصفته نفسه لا تحدّه نافذة EVM. أما الاستدعاء المُرسَل بمنحة authz من حساب فتحدّه؛ انظر أدناه.
- أسفل جسر `0x0901` لا تُقبل `MsgCrossVMCall` إلا من عقد يتصرف بصفته نفسه، ولا تستطيع `MsgExec` من authz هناك أن تحمل واحدة لحساب آخر.

جُرّب النمطان على شبكة الاختبار سابقًا (المتزامن عند الارتفاع 9,795,779 وغير المتزامن عند الارتفاع 9,795,783). أما شيفرة Rust في جانب العقد التي ترسل هذه الرسالة فلم تُشغَّل لهذه الصفحة.

## authz والنوافذ {#authz}

الاستدعاء إلى EVM عبر الأنوية الافتراضية الذي لم يرسله المرسل بنفسه يعمل تحت **نافذة EVM الخاصة بالمرسل**، تمامًا كما لو كانت شيفرة المرسل نفسها تعمل في معاملة شخص آخر. وهذا عمليًا هو استخدام منحة authz. وحين يستخدم أحدهم منحتك لـ `MsgCrossVMCall` ليستدعي EVM:

- لا يُقبل الاستدعاء إلا إذا كانت **نافذتك** مفتوحة ويشمل نطاقها الهدف (`allowed_targets` و`native_only` وprecompiles نقل القيمة).
- يستهلك كل استدعاء ناجح معاملة واحدة من معاملات النافذة، وتُحتسب القيمة الأصلية التي تخسرها فيه ضمن قيمة النافذة.
- من دون مفتاح ما بعد كمومي صالح للاستخدام ونافذة حيّة يُرفض الاستدعاء، عند التقديم في الاستدعاء غير المتزامن ومجددًا حين يشغّله الطابور.
- العقد أو سياسة المجموعة لا يحمل نافذة، فلا تستطيع منحة authz من أحدهما أن تحمل استدعاءً إلى EVM.
- الاستدعاءات إلى QoreChain Native لا تحدّها النافذة. فمنحة authz عامة لـ `MsgCrossVMCall` تعطي المستفيد هويتك على مسار QoreChain Native: امنحها فقط لأطراف تثق بهم على الحساب.

ويُقبل تحويل رمز ERC-20 تحت منحة authz (`MsgConvertERC20`) بنافذة المرسل بالطريقة نفسها.

## الحدود والأخطاء {#limits}

| الحالة | النتيجة |
| --------- | ------ |
| payload أكبر من `max_message_size` | يُرفض، الرمز 8 (`message payload exceeds max size`) |
| عنوان هدف بشكل لا يناسب مساره | يُرفض عند التقديم، الرمز 5 (`invalid target contract address`) |
| الهدف عنوان precompile (من `0x...0000` إلى `0x...ffff`) | يُرفض عند التقديم، الرمز 5 |
| آلة افتراضية هدف تساوي مسارك أنت | يُرفض |
| آلة افتراضية غير معروفة أو غير مدعومة | الرمز 7 (`unsupported VM type`) |
| أكثر من 100 استدعاء مصطف من مرسل واحد | `ErrQueueFull`، الرمز 4، حتى ينتهي أحدها أو تنتهي مهلته |
| الطابور يحتوي `max_queue_size` استدعاء | `ErrQueueFull`، الرمز 4 |
| `async_max_factor` خارج النطاق من 1,000,000 إلى 100,000,000 (أجزاء من المليون)، مثل `6` بدل `6000000` | يُرفض قبل تشغيل أي شيء، codespace باسم `crossvm` والرمز 2 (`async_max_factor 6 is outside 1000000..100000000 (millionths)`) |
| `async_max_factor` دون العامل السائد | يُرفض عند التقديم |
| `async_gas_limit` دون 250,000 أو فوق سعة الطابور في الكتلة | يُرفض عند التقديم |
| دفع مسبق فوق 50,000,000 غاز | يُرفض عند التقديم؛ أعد المحاولة لاحقًا أو خفّض الحد |
| uqor القابل للإنفاق أقل من الضمان | يُرفض (لا تستطيع العملات المقفلة بالاستحقاق ولا منح الرسوم ولا الرسوم بعملات أخرى تمويله) |
| عامل الازدحام فوق `async_max_factor` عند وصول دور الاستدعاء | ينتظر الاستدعاء؛ وتنتهي مهلته بعد `queue_timeout_blocks` |
| انتهاء مهلة الاستدعاء أو عدم تشغيله أبدًا | يُسترد الضمان كاملًا، ويبقى رسم الخانة رسم معالجة |
| فشل الهدف | سجل `failed` (غير متزامن) أو تُلغى المعاملة (متزامن)؛ ويُحاسَب الغاز المستخدم |
| QOR أصلي يعود من EVM إلى مستدعٍ عقدٍ (مرسل بـ 32 بايتًا) | يفشل الاستدعاء ويُحاسَب |
| استدعاء `0x0901` بلا نافذة تُدرجه | يُرفض |
| هدف `0x0901` غير موجود في `bridge_allowed_targets`، أو تغيرت شيفرته منذ تثبيته | يرتد: `cross-VM bridge call refused: target ... is not allowlisted` لهدف غير مدرج |
| `MsgCrossVMCall` في قائمة قاطع الدائرة | تُرفض المعاملة؛ وتبقى الاستدعاءات المصطفّة معلّقة |
| استدعاء إلى SVM | المسار مفتوح على شبكة الاختبار منذ المقترح 37 ومغلق على الشبكة الرئيسية؛ ولم يُشغَّل أي استدعاء إلى SVM لهذه الصفحة (UNTESTED) |

الخطأ المسجَّل على استدعاء مصطف فاشل يحمل نصًا عاديًا من دون تعليق على ملف المصدر.

## الأحداث {#events}

| الحدث | السمات | المعنى |
| ----- | ---------- | ------- |
| `crossvm_request` | `message_id` و`source_vm` و`target_vm` و`target_contract` و`sender` | قُدّم استدعاء |
| `crossvm_response` | `message_id` و`status`، و`error` للاستدعاء الفاشل | انتهى استدعاء مصطف |
| `crossvm_timeout` | `message_id` | انتهت مهلة استدعاء مصطف |
| `crossvm_escrow_settled` | الرسم والمبلغ المسترد | دُفع ضمان استدعاء غير متزامن إلى QoreChain Native |

## ما اختُبر على شبكة الاختبار {#tested}

شُغّل على `qorechain-diana` في 12 نوفمبر 2026 (الإصدار v3.2.8) بعد نجاح المقترح 37، بـ SDK 0.14.0 (`createCrossVMClient(...).buildCall`، توقيع هجين، حساب eth-native)، على عقد cw20 المخزَّن بالحوكمة والمنشأ من الشيفرة 859. وكان الـ payload هو `{"transfer":{"recipient":<self>,"amount":"1"}}`.

| الخطوة | النتيجة |
| ---- | ------ |
| قراءة قائمة قاطع الدائرة | `/cosmwasm.wasm.v1.MsgStoreCode` فقط؛ رسالة الاستدعاء غير موقوفة |
| استدعاء متزامن من حساب أصلي إلى QoreChain Native | محاكاة 601,178 غاز، أُرسل بالمحاكاة × 1.3، الرمز 0، استُخدم 595,049 غاز |
| استدعاء غير متزامن من حساب أصلي إلى QoreChain Native، `asyncGasLimit` 800000 و`asyncMaxFactor` 6000000 | محاكاة 751,287 غاز؛ الرمز 0؛ استُخدم 751,277 غاز |
| الخصومات في الاستدعاء غير المتزامن (أحداث المعاملة) | الرسم (146,502 uqor، أي الحد × 0.15) و680,417 uqor أُرسلت إلى حساب وحدة (الضمان ودفعة خانة الطابور كما لوحظ؛ دون تفصيل هنا) |
| حدث الاستدعاء غير المتزامن | `crossvm_request` مع `source_vm` بقيمة native و`target_vm` بقيمة cosmwasm |
| `GET /qorechain/crossvm/v1/message/{id}` | الحالة `executed`، و`created_height` يساوي `executed_height` (عمل الاستدعاء المصطف في الكتلة نفسها)، وخطأ فارغ |
| `GET /qorechain/crossvm/v1/pending` بعد ذلك | قائمة فارغة |
| `async_max_factor` بقيمة `6` | رُفض قبل تشغيل أي شيء: codespace باسم `crossvm` والرمز 2، `async_max_factor 6 is outside 1000000..100000000 (millionths): invalid cross-VM message` |

لم يُشغَّل لهذه الصفحة (UNTESTED): EVM إلى QoreChain Native عبر `0x0901`، وQoreChain Native إلى EVM. ويفيد فريق السلسلة بأن مساري QoreChain Native إلى EVM المتزامن وغير المتزامن عملا على شبكة الاختبار عند الارتفاعين 9,795,779 و9,795,783، قبل v3.2.8.

## صفحات ذات صلة {#related}

- [قابلية التشغيل البيني عبر الأنوية الافتراضية](/developer-guide/cross-vm-interoperability) للمفاهيم ودورة الحياة وملاحظات قائمة السماح على شبكة الاختبار.
- [مرجع نافذة تفويض EVM](/developer-guide/evm-window-reference) لفتح النافذة التي يحتاجها الجسر وتحديد نطاقها.
- [معالِجات EVM المسبقة](/developer-guide/evm-precompiles) لجدول الـ precompiles وحالة الشبكة.
- [تطوير QoreChain Native](/developer-guide/cosmwasm-development) و[غاز QoreChain Native وحدوده](/developer-guide/cosmwasm-gas-and-limits) لغاز العقود وميزانية الكتلة.
- [التوقيع ما بعد الكمومي](/developer-guide/post-quantum-signing) لتوقيع المعاملات أعلاه.
- [دليل الاستدعاءات عبر الأنوية الافتراضية (SDK)](/sdk/guides/cross-vm) و[الأنوية الافتراضية المتعددة](/rollups/multi-vm) لدوال SDK وRDK المساعدة.
