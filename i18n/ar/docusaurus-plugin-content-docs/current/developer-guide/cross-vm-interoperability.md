---
slug: /developer-guide/cross-vm-interoperability
title: قابلية التشغيل البيني عبر الأنوية الافتراضية
sidebar_label: قابلية التشغيل البيني عبر الأنوية الافتراضية
sidebar_position: 5
---

# قابلية التشغيل البيني عبر الأنوية الافتراضية

صُمّمت **بنية الأنوية الافتراضية الثلاثية** في QoreChain (‏EVM، CosmWasm، SVM) لتتيح للعقود الذكية على أي آلة افتراضية التواصل مع العقود على أي آلة افتراضية أخرى. توفر وحدة `x/crossvm` رسالة استدعاء لها مسار ضمن المعاملة نفسها ومسار عبر الطابور.

:::caution ما الذي يعمل اليوم
لا تتوفر الاستدعاءات عبر الأنوية الافتراضية إلا بقدر توفر المسار (lane) الهدف:

* `MsgCrossVMCall` **معطّلة على الشبكة الرئيسية** بواسطة قاطع الدائرة (circuit breaker) (`qorechaind query circuit disabled-list`)؛ وهي مفعّلة على شبكة الاختبار.
* **مسار SVM معطّل** للمعاملات على كلتا الشبكتين، لذا لا يمكن تشغيل مقطع SVM.
* **رفع عقود CosmWasm وإنشاء نسخ منها مقيّدان بأذونات** على كلتا الشبكتين، ولا تحتوي الشبكة الرئيسية على أي شيفرة عقد مخزّنة، لذا لا يوجد بعدُ عقد CosmWasm يمكن استدعاؤه.
* **الـ precompile المتزامن في EVM غير مفعّل** (انظر أدناه).

مسارات REST الخاصة بالوحدة (`/qorechain/crossvm/v1/...`) لا تقدّمها البوابة العامة؛ اقرأ الرسائل عبر واجهة سطر الأوامر أو عبر عميل استعلام gRPC/ABCI.
:::

:::note
تُعيَّن نقاط النهاية أدناه افتراضياً إلى عقدة محلية. على الشبكة الرئيسية، استخدم نقاط نهاية RPC الخاصة بـ **`qorechain-vladi`** (‏Cosmos RPC **26657**، EVM JSON-RPC **8545**)؛ أما شبكة الاختبار فهي **`qorechain-diana`**.
:::

---

## نظرة عامة على البنية

```
 EVM (Solidity)          CosmWasm (Rust/Wasm)         SVM (BPF)
      |                        |                        |
      |--- sync (precompile) ->|                        |
      |                        |                        |
      |<-- async (EndBlocker) -|-- async (EndBlocker) ->|
      |                        |                        |
      |<------------ async (EndBlocker) ----------------|
```

| المسار             | الاتجاه       | التوقيت           | الآلية                       |
| ---------------- | --------------- | ---------------- | ------------------------------- |
| **المتزامن**  | EVM إلى CosmWasm | المعاملة نفسها | Precompile عند `0x0000...0901` (غير مفعّل بعد، انظر أدناه)   |
| **رسالة، الافتراضي** | أي آلة افتراضية إلى أي آلة افتراضية أخرى | المعاملة نفسها | `MsgCrossVMCall`؛ ينفَّذ الاستدعاء فوراً، ويؤدي أي إخفاق إلى ارتداد المعاملة بأكملها |
| **رسالة، عبر الطابور** | أي آلة افتراضية إلى أي آلة افتراضية أخرى | الكتلة التالية (أو لاحقاً) | `MsgCrossVMCall` مع ضبط `async`؛ تنتظر الرسالة في الطابور |

---

## المسار المتزامن (EVM إلى CosmWasm)

يستخدم المسار المتزامن **precompile** في EVM عند العنوان `0x0000000000000000000000000000000000000901`. وهو مصمَّم ليتيح لعقود Solidity استدعاء عقود CosmWasm وتلقي استجابة ضمن المعاملة نفسها.

:::warning غير مفعّل على الشبكة الرئيسية ولا على شبكة الاختبار
الـ precompile الخاص بجسر CrossVM **غير مفعّل** على `qorechain-vladi` ولا على `qorechain-diana`: ينجح الاستدعاء إلى `0x…0901` ويعيد بيانات فارغة. ولن يُفعَّل بشكله الحالي؛ إذ يُعاد بناؤه بحيث يتراجع جانب CosmWasm أيضاً عند حدوث ارتداد (revert) في العقد المستدعي، وتُرفض تحويلات القيمة، ويُمنع إعادة الدخول من EVM إلى EVM، ويُطبَّق قاطع الدائرة الخاص بالاستدعاءات عبر الأنوية الافتراضية. يعرض المثال أدناه الشكل المقصود فقط. راجع [الـ Precompiles في EVM: حالة الشبكة](/developer-guide/evm-precompiles#network-status).
:::

### مثال Solidity

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ICrossVM {
    function call(bytes calldata payload) external returns (bytes memory);
}

contract CrossVMCaller {
    ICrossVM constant CROSSVM = ICrossVM(0x0000000000000000000000000000000000000901);

    function callCosmWasmContract(
        string memory cosmwasmAddr,
        string memory executeMsg,
        uint256 funds
    ) external returns (bytes memory) {
        bytes memory payload = abi.encode(cosmwasmAddr, executeMsg, funds);
        return CROSSVM.call(payload);
    }
}
```

عند تفعيله، ينفّذ الـ precompile عقد CosmWasm فوراً ويُرجع النتيجة. تفكّ العقدة الحالية ترميز بيانات الاستدعاء (calldata) على أنها `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)`؛ وقد تتغير ABI مع إعادة البناء. تكلفة الغاز: **50,000 أساسية + 4 لكل بايت إدخال + تكلفة التنفيذ**.

---

## مسار الرسائل (`MsgCrossVMCall`)

تستخدم الاستدعاءات الأخرى عبر الأنوية الافتراضية معاملة `MsgCrossVMCall`. تستنتج السلسلة المسار المصدر من المُرسِل، لذا لا تحمل الرسالة سوى الآلة الافتراضية الهدف، والعقد الهدف، والحمولة، والأموال الاختيارية. افتراضياً ينفَّذ الاستدعاء فوراً ضمن المعاملة، وترتدّ المعاملة بأكملها إذا أخفق الهدف. أما مع العلم `async` فتوضع الرسالة في الطابور بدلاً من ذلك وتعالجها تمريرة طابور نهاية الكتلة (end-block) الخاصة بالوحدة في كتلة لاحقة (انظر دورة الحياة أدناه). وكما ذُكر أعلاه، هذه الرسالة معطّلة على الشبكة الرئيسية.

### واجهة سطر الأوامر (CLI)

يأخذ `tx crossvm call` الآلة الافتراضية الهدف (`evm` أو `cosmwasm` أو `svm`) والعقد الهدف كوسائط موضعية، مع الحمولة بصيغة Hex:

```bash
qorechaind tx crossvm call evm 0x1234567890123456789012345678901234567890 \
  --payload 0a0b0c --from mykey --generate-only > tx.json
```

أعلام أخرى: `--funds <coins>` (لأهداف CosmWasm فقط) و`--async` لوضع الاستدعاء في الطابور بدلاً من تنفيذه الآن. وقّع `tx.json` وأذِعه باستخدام `tx pqc cosign` (راجع [التوقيع المقاوم للحوسبة الكمومية](/developer-guide/post-quantum-signing))؛ والحد الأدنى للرسوم هو 0.1 uqor لكل وحدة غاز.

:::caution معطّلة على الشبكة الرئيسية، وصيغة CLI تحتاج إلى إصلاح
`MsgCrossVMCall` معطّلة على الشبكة الرئيسية بواسطة قاطع الدائرة. وفي الملفات التنفيذية للإصدار الحالي، يبني الأمر `tx crossvm call` أيضاً رسالة لا تجتاز التحقق الخاص بالرسالة نفسها (إذ يترك الآلة الافتراضية المصدر فارغة)، لذا فالأمر موثَّق هنا للرجوع إليه فقط.
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

**الذرّية (Atomicity):** صُمّمت الاستدعاءات المتزامنة (‏EVM إلى CosmWasm عبر الـ precompile) لتكون ذرّية، بحيث إذا ارتدّ أي من الطرفين ترتدّ المعاملة بأكملها. لا يضمن الـ precompile الحالي ذلك بعد، وهذا أحد أسباب عدم تفعيله (انظر أعلاه). أما الاستدعاءات غير المتزامنة فهي **ليست ذرّية** عبر الكتل؛ صمّم عقودك لتتعامل مع حالتي `Failed` و`Timed Out` بسلاسة.

**الترتيب:** تُعالَج الرسائل في الطابور بنظام الوارد أولاً يخرج أولاً (FIFO) ضمن كل تمريرة EndBlocker. لا يوجد ترتيب مضمون عبر الأنوية الافتراضية المصدرية المختلفة.

**ترميز الحمولة:** تعتمد صيغة الحمولة على الآلة الافتراضية الهدف:

* **أهداف EVM:** استدعاءات دوال مُرمَّزة بـ ABI
* **أهداف CosmWasm:** رسائل execute مُرمَّزة بـ JSON
* **أهداف SVM:** بيانات تعليمات BPF مُرمَّزة بصيغة Hex

---

## الخطوات التالية

* [الـ Precompiles في EVM](/developer-guide/evm-precompiles) — حالة الـ precompile المتزامن لـ CrossVM والـ precompiles المخطَّط لها الأخرى
* [تطوير EVM](/developer-guide/evm-development) — تطوير Solidity على QoreChain
* [تطوير CosmWasm](/developer-guide/cosmwasm-development) — تطوير عقود Rust/Wasm
* [تطوير SVM](/developer-guide/svm-development) — نشر برامج BPF
