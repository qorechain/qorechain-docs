---
slug: /developer-guide/cross-vm-interoperability
title: قابلية التشغيل البيني عبر الأنوية الافتراضية
sidebar_label: قابلية التشغيل البيني عبر الأنوية الافتراضية
sidebar_position: 5
---

# قابلية التشغيل البيني عبر الأنوية الافتراضية

صُمّمت **بنية الأنوية الافتراضية الثلاثية** في QoreChain (‏EVM، QoreChain Native، SVM) لتتيح للعقود الذكية على أي آلة افتراضية التواصل مع العقود على أي آلة افتراضية أخرى. توفر وحدة `x/crossvm` رسالة استدعاء لها مسار ضمن المعاملة نفسها ومسار عبر الطابور.

:::caution ما الذي يعمل اليوم
لا تتوفر الاستدعاءات عبر الأنوية الافتراضية إلا بقدر توفر المسار (lane) الهدف:

* `MsgCrossVMCall` **معطّلة على الشبكة الرئيسية** بواسطة قاطع الدائرة (circuit breaker) (`qorechaind query circuit disabled-list`)؛ وهي مفعّلة على شبكة الاختبار.
* **مسار SVM معطّل** للمعاملات على كلتا الشبكتين، لذا لا يمكن تشغيل مقطع SVM.
* **رفع عقود QoreChain Native مقيّد بأذونات** على كلتا الشبكتين، و**إنشاء النسخ منها مقيّد بأذونات على الشبكة الرئيسية**، التي لا تحتوي على أي شيفرة عقد مخزّنة، لذا لا يوجد بعدُ عقد QoreChain Native يمكن استدعاؤه على الشبكة الرئيسية. وعلى شبكة الاختبار خزّنت الحوكمة بضعة عقود مراجَعة يستطيع أي حساب إنشاء نسخة منها (انظر [تطوير QoreChain Native](/developer-guide/cosmwasm-development))، لذا يمكن أن يوجد هناك هدف QoreChain Native.
* **الـ precompile المتزامن في EVM غير مفعّل** (انظر أدناه). توجد نسخة مُحصَّنة منه في الملف الثنائي منذ v3.2.3، لكن الـ precompile الخاص بـ CrossVM غير مفعّل على أي من الشبكتين. (وفي 27 أكتوبر 2026 فعّلت حوكمة شبكة الاختبار ثلاثة precompiles أخرى هي PQC Verify وPQC Key Status وPRISM Consensus Params؛ ولا يوجد أي منها مفعّلًا على الشبكة الرئيسية. ولا يغيّر الإصدار v3.2.4 أيًّا من الـ precompiles مفعّل.)

على الشبكة الرئيسية، مسارات REST الخاصة بالوحدة (`/qorechain/crossvm/v1/...`) لا تقدّمها البوابة العامة (`501`)؛ اقرأ الرسائل عبر واجهة سطر الأوامر أو عبر عميل استعلام gRPC/ABCI.
:::

:::note
تُعيَّن نقاط النهاية أدناه افتراضياً إلى عقدة محلية. على الشبكة الرئيسية، استخدم نقاط نهاية RPC الخاصة بـ **`qorechain-vladi`** (‏Cosmos RPC **26657**، EVM JSON-RPC **8545**)؛ أما شبكة الاختبار فهي **`qorechain-diana`**.
:::

---

## نظرة عامة على البنية

```
 EVM (Solidity)     QoreChain Native (Rust/Wasm)     SVM (BPF)
      |                        |                        |
      |--- sync (precompile) ->|                        |
      |                        |                        |
      |<-- async (EndBlocker) -|-- async (EndBlocker) ->|
      |                        |                        |
      |<------------ async (EndBlocker) ----------------|
```

| المسار             | الاتجاه       | التوقيت           | الآلية                       |
| ---------------- | --------------- | ---------------- | ------------------------------- |
| **المتزامن**  | EVM إلى QoreChain Native | المعاملة نفسها | Precompile عند `0x0000...0901` (غير مفعّل بعد، انظر أدناه)   |
| **رسالة، الافتراضي** | أي آلة افتراضية إلى أي آلة افتراضية أخرى | المعاملة نفسها | `MsgCrossVMCall`؛ ينفَّذ الاستدعاء فوراً، ويؤدي أي إخفاق إلى ارتداد المعاملة بأكملها |
| **رسالة، عبر الطابور** | أي آلة افتراضية إلى أي آلة افتراضية أخرى | الكتلة التالية (أو لاحقاً) | `MsgCrossVMCall` مع ضبط `async`؛ تنتظر الرسالة في الطابور |

---

## المسار المتزامن (EVM إلى QoreChain Native)

يستخدم المسار المتزامن **precompile** في EVM عند العنوان `0x0000000000000000000000000000000000000901`. وهو مصمَّم ليتيح لعقود Solidity استدعاء عقود QoreChain Native وتلقي استجابة ضمن المعاملة نفسها.

:::warning غير مفعّل على الشبكة الرئيسية ولا على شبكة الاختبار
الـ precompile الخاص بجسر CrossVM **غير مفعّل** على `qorechain-vladi` ولا على `qorechain-diana`: ينجح الاستدعاء إلى `0x…0901` ويعيد بيانات فارغة. يحمل الملف الثنائي v3.2.3 نسخة مُحصَّنة منه (يرفض `STATICCALL`، ويحتسب استدعاءه المتداخل ضمن غاز الإطار المستدعي ويسجّله في السجل بحيث يتراجع جانب QoreChain Native أيضاً عند ارتداد EVM، ولا يصل إلا إلى أهداف QoreChain Native المدرجة في قائمة السماح، ويحترم قاطع الدائرة الخاص بالاستدعاءات عبر الأنوية الافتراضية)، لكنه لا يعمل إلا بعد أن تضيفه ترقية معتمدة بالحوكمة إلى القائمة المفعّلة. المثال أدناه هو الشكل الذي تفكّ العقدة ترميزه، لكنه لا يمكن أن يعمل ما لم يُفعَّل الـ precompile. راجع [الـ Precompiles في EVM: حالة الشبكة](/developer-guide/evm-precompiles#network-status).
:::

### مثال Solidity

تفكّ العقدة ترميز مُدخل الـ precompile على أنه محدِّد (selector) من 4 بايتات يليه الوسائط المُرمَّزة بـ ABI للدالة `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)` (المحدِّد `0x3c11078c`). تكون قيمة `targetVM` هي `1` لعقد QoreChain Native (وQoreChain Native هو وقت تشغيل CosmWasm؛ أما `0` فهو EVM، الذي يرفضه الجسر المُحصَّن هدفًا). أما `targetContract` فهو عنوان bech32 للعقد كسلسلة نصية، و`payload` هو رسالة execute الخاصة بالعقد كبايتات JSON بترميز UTF-8. ويعيد الـ precompile بايتات استجابة الهدف الخام.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CrossVMCaller {
    address constant CROSSVM = 0x0000000000000000000000000000000000000901;
    uint8 constant TARGET_QORECHAIN_NATIVE = 1;

    function callQoreChainNative(string calldata contractAddr, bytes calldata executeMsg)
        external
        returns (bytes memory)
    {
        bytes memory data = abi.encodeWithSignature(
            "executeCrossVMCall(uint8,string,bytes)",
            TARGET_QORECHAIN_NATIVE,
            contractAddr,
            executeMsg
        );
        (bool ok, bytes memory ret) = CROSSVM.call(data);
        require(ok, "cross-VM call failed");
        // While the precompile is not active, the call succeeds with empty data
        // and nothing executes; treat an empty reply as a failure.
        require(ret.length > 0, "cross-VM precompile not active or empty reply");
        return ret;
    }
}
```

هذا هو الشكل الذي تفكّ العقدة ترميزه؛ وهو الشكل نفسه الذي يبنيه مرمِّز `@qorechain/rdk`، ويطابق العقد أعلاه نموذج البداية في [Multi-VM](/rollups/multi-vm). لا يمكن إرفاق أموال عبر الـ precompile (فمسار الرسالة `MsgCrossVMCall` يقبل `--funds`). ولا يستطيع هذا النموذج فعل أي شيء اليوم على أي من الشبكتين، لأن الـ precompile غير مفعّل (انظر التحذير أعلاه)؛ وقد تتغير ABI قبل التفعيل.

عند تفعيله، ينفّذ الـ precompile عقد QoreChain Native فوراً ويُرجع النتيجة. (تبني دالة المساعدة `encodeCrossVmCalldata` في `@qorechain/rdk`، المتاحة منذ 0.6.0 وفي الإصدار الحالي 0.7.0، بيانات الاستدعاء (calldata)؛ راجع [Multi-VM](/rollups/multi-vm).) تكلفة الغاز: **50,000 أساسية + 4 لكل بايت إدخال + تكلفة التنفيذ**.

---

## مسار الرسائل (`MsgCrossVMCall`)

تستخدم الاستدعاءات الأخرى عبر الأنوية الافتراضية معاملة `MsgCrossVMCall`. تستنتج السلسلة المسار المصدر من المُرسِل، لذا لا تحمل الرسالة سوى الآلة الافتراضية الهدف، والعقد الهدف، والحمولة، والأموال الاختيارية. افتراضياً ينفَّذ الاستدعاء فوراً ضمن المعاملة، وترتدّ المعاملة بأكملها إذا أخفق الهدف. أما مع العلم `async` فتوضع الرسالة في الطابور بدلاً من ذلك وتعالجها تمريرة طابور نهاية الكتلة (end-block) الخاصة بالوحدة في كتلة لاحقة (انظر دورة الحياة أدناه). وكما ذُكر أعلاه، هذه الرسالة معطّلة على الشبكة الرئيسية.

### واجهة سطر الأوامر (CLI)

يأخذ `tx crossvm call` الآلة الافتراضية الهدف (`evm` أو `cosmwasm` أو `svm`) والعقد الهدف كوسائط موضعية، مع الحمولة بصيغة Hex. لا تطلب واجهة CLI الآلة الافتراضية المصدر: إذ تستخرج السلسلة مسار المُستدعي من الحالة وتتجاهل الحقل المُعلَن (وتملأ CLI قيمة مؤقتة ليجتاز الرسالة تحققها الخاص):

```bash
qorechaind tx crossvm call evm 0x1234567890123456789012345678901234567890 \
  --payload 0a0b0c --from mykey --generate-only > tx.json
```

أعلام أخرى: `--funds <coins>` (لأهداف QoreChain Native فقط) و`--async` لوضع الاستدعاء في الطابور بدلاً من تنفيذه الآن. وقّع `tx.json` وأذِعه باستخدام `tx pqc cosign` (راجع [التوقيع ما بعد الكمومي](/developer-guide/post-quantum-signing))؛ والحد الأدنى للرسوم هو 0.1 uqor لكل وحدة غاز. يُرفض الاستدعاء إلى مسار المُستدعي نفسه (منذ v3.2.3).

:::caution معطّلة على الشبكة الرئيسية
`MsgCrossVMCall` معطّلة على الشبكة الرئيسية بواسطة قاطع الدائرة، لذا لا يمكن أن ينجح الأمر هناك اليوم. (كانت الملفات التنفيذية للإصدارات السابقة لـ v3.2.3 تبني أيضاً رسالة تفشل في التحقق الخاص بها لأن الآلة الافتراضية المصدر فارغة؛ ويصلح الملف الثنائي v3.2.3 ذلك.) وعلى شبكة الاختبار تكون الرسالة مفعّلة، لكن مسار SVM معطّل، لذا لا يمكن الوصول إلى هدف SVM؛ ويمكن الوصول إلى هدف EVM، وإلى هدف QoreChain Native متى أُنشئت نسخة من عقد هناك.
:::

---

## دورة حياة الرسالة

تنتقل كل رسالة عبر الأنوية الافتراضية موضوعة في الطابور خلال مجموعة محددة من الحالات:

```
Submitted --> Pending --> Executed
                |
                +--> Failed
                |
                +--> Timed Out
```

| الحالة         | الوصف                                               |
| ------------- | --------------------------------------------------------- |
| **Submitted** | قُبِلت الرسالة في الطابور                           |
| **Pending**   | بانتظار التنفيذ في تمريرة EndBlocker التالية            |
| **Executed**  | استُدعي العقد الهدف بنجاح؛ سُجِّلت الاستجابة    |
| **Failed**    | ارتدّ تنفيذ العقد الهدف؛ سُجِّل الخطأ        |
| **Timed Out** | تجاوزت الرسالة `queue_timeout_blocks` دون تنفيذ |

منذ v3.2.3 يُتراجع عن الاستدعاء الموضوع في الطابور والذي يفشل بكامله: لا يبقى منه سوى سجل `Failed`، ولم تعد الأموال المرفقة باستدعاء QoreChain Native فاشل تُنقل إلى العقد. وما دامت الوحدة معطّلة، أو دامت `MsgCrossVMCall` معطّلة بواسطة قاطع الدائرة، فإن الطابور **لا يُنفَّذ**: تبقى الرسائل الموضوعة فيه معلّقة وتنتهي صلاحيتها عند انتهاء مهلتها ما لم يُرفع التعطيل قبل ذلك.

---

## المعاملات (Parameters)

| المعامل              | القيمة        | الوصف                                    |
| ---------------------- | ------------ | ---------------------------------------------- |
| `enabled`              | `true`       | مفتاح على مستوى الوحدة (أما رسالة الاستدعاء نفسها فمعطّلة بشكل منفصل على الشبكة الرئيسية) |
| `max_message_size`     | 65,536 bytes | الحد الأقصى لحجم الحمولة لكل رسالة               |
| `max_queue_size`       | 1,000        | الحد الأقصى للرسائل المعلّقة في الطابور          |
| `queue_timeout_blocks` | 100          | عدد الكتل قبل انتهاء مهلة رسالة غير معالَجة |

---

## الأحداث

تُصدر وحدة `x/crossvm` الأحداث التالية:

| الحدث              | السمات                                                          | الوصف                           |
| ------------------ | ------------------------------------------------------------------- | ------------------------------------- |
| `crossvm_request`  | `message_id`, `source_vm`, `target_vm`, `target_contract`, `sender` | تم إرسال رسالة جديدة عبر الأنوية الافتراضية        |
| `crossvm_response` | `message_id`, `status`, `result`                                    | نُفّذت الرسالة (نجاح أو فشل) |
| `crossvm_timeout`  | `message_id`, `source_vm`, `target_vm`                              | انتهت صلاحية الرسالة دون تنفيذ     |

اشترك في الأحداث عبر WebSocket:

```bash
wscat -c ws://localhost:26657/websocket
> {"jsonrpc":"2.0","method":"subscribe","params":["tm.event='Tx' AND crossvm_request.message_id EXISTS"],"id":1}
```

---

## الاستعلام عن الرسائل

### واجهة سطر الأوامر (CLI)

```bash
# Query a specific message by ID
qorechaind query crossvm message <message-id>

# List all pending messages
qorechaind query crossvm pending

# Module parameters
qorechaind query crossvm params
```

### JSON-RPC

> **غير مُقدَّم بعد:** لا يوجد أي إصدار منشور للعقدة يقدّم مساحة أسماء JSON-RPC `qor_`، لذا يعيد هذا الاستدعاء اليوم `-32601` (الطريقة غير موجودة) على كل نقطة نهاية عامة. راجع [مساحة الأسماء `qor_`](/api-reference/json-rpc-qor_-namespace).

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getCrossVMMessage",
    "params": ["<message-id>"],
    "id": 1
  }'
```

### صيغة الاستجابة

```json
{
  "message_id": "crossvm-00000042",
  "source_vm": "cosmwasm",
  "target_vm": "evm",
  "target_contract": "0x1234...abcd",
  "sender": "qor1sender...",
  "payload": "...",
  "status": "executed",
  "result": "0x...",
  "submitted_height": 12345,
  "executed_height": 12346
}
```

---

## اعتبارات التصميم

**الذرّية (Atomicity):** صُمّمت الاستدعاءات المتزامنة (‏EVM إلى QoreChain Native عبر الـ precompile) لتكون ذرّية، بحيث إذا ارتدّ أي من الطرفين ترتدّ المعاملة بأكملها. لا يضمن الـ precompile الحالي ذلك بعد، وهذا أحد أسباب عدم تفعيله (انظر أعلاه). أما الاستدعاءات غير المتزامنة فهي **ليست ذرّية** عبر الكتل؛ صمّم عقودك لتتعامل مع حالتي `Failed` و`Timed Out` بسلاسة.

**الترتيب:** تُعالَج الرسائل في الطابور بنظام الوارد أولاً يخرج أولاً (FIFO) ضمن كل تمريرة EndBlocker. لا يوجد ترتيب مضمون عبر الأنوية الافتراضية المصدرية المختلفة.

**ترميز الحمولة:** تعتمد صيغة الحمولة على الآلة الافتراضية الهدف:

* **أهداف EVM:** استدعاءات دوال مُرمَّزة بـ ABI
* **أهداف QoreChain Native:** رسائل execute مُرمَّزة بـ JSON
* **أهداف SVM:** بيانات تعليمات BPF مُرمَّزة بصيغة Hex

---

## الخطوات التالية

* [الـ Precompiles في EVM](/developer-guide/evm-precompiles) — حالة الـ precompile المتزامن لـ CrossVM والـ precompiles المخطَّط لها الأخرى
* [تطوير EVM](/developer-guide/evm-development) — تطوير Solidity على QoreChain
* [تطوير QoreChain Native](/developer-guide/cosmwasm-development) — تطوير عقود Rust/Wasm
* [تطوير SVM](/developer-guide/svm-development) — نشر برامج BPF
