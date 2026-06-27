---
slug: /developer-guide/cross-vm-interoperability
title: قابلية التشغيل البيني عبر الأنوية الافتراضية
sidebar_label: قابلية التشغيل البيني عبر الأنوية الافتراضية
sidebar_position: 5
---

# قابلية التشغيل البيني عبر الأنوية الافتراضية

تتيح **بنية الأنوية الافتراضية الثلاثية** في QoreChain (‏EVM، CosmWasm، SVM) للعقود الذكية على أي آلة افتراضية التواصل مع العقود على أي آلة افتراضية أخرى. توفر وحدة `x/crossvm` مساري مراسلة متزامناً وغير متزامن على حد سواء.

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
| **المتزامن**  | EVM إلى CosmWasm | المعاملة نفسها | Precompile عند `0x0000...0901`   |
| **غير المتزامن** | CosmWasm إلى EVM | الكتلة التالية | `MsgCrossVMCall` عبر EndBlocker |
| **غير المتزامن** | SVM إلى أي آلة افتراضية   | الكتلة التالية | `MsgCrossVMCall` عبر EndBlocker |
| **غير المتزامن** | أي آلة إلى SVM   | الكتلة التالية | `MsgCrossVMCall` عبر EndBlocker |

---

## المسار المتزامن (EVM إلى CosmWasm)

يستخدم المسار المتزامن **precompile** في EVM عند العنوان `0x0000000000000000000000000000000000000901`. يتيح ذلك لعقود Solidity استدعاء عقود CosmWasm وتلقي استجابة ضمن المعاملة نفسها.

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

ينفّذ الـ precompile عقد CosmWasm فوراً ويُرجع النتيجة. تكلفة الغاز: **50,000 أساسية + تكلفة التنفيذ**.

---

## المسار غير المتزامن

تستخدم جميع اتجاهات الانتقال الأخرى عبر الأنوية الافتراضية طابور الرسائل غير المتزامن. تُرسَل الرسائل في كتلة واحدة وتُعالَج بواسطة **EndBlocker** في الكتلة التالية.

### واجهة سطر الأوامر (CLI)

```bash
# CosmWasm to EVM
qorechaind tx crossvm call \
  --source-vm cosmwasm \
  --target-vm evm \
  --target-contract 0x1234...abcd \
  --payload '{"method":"transfer","params":["0xRecipient",100]}' \
  --from mykey \
  -y

# SVM to CosmWasm
qorechaind tx crossvm call \
  --source-vm svm \
  --target-vm cosmwasm \
  --target-contract qor1contractaddr... \
  --payload '{"execute":{"action":{}}}' \
  --from mykey \
  -y

# EVM to SVM (async)
qorechaind tx crossvm call \
  --source-vm evm \
  --target-vm svm \
  --target-contract <program-id-base58> \
  --payload '0a0b0c...' \
  --from mykey \
  -y
```

---

## دورة حياة الرسالة

تنتقل كل رسالة عبر الأنوية الافتراضية خلال مجموعة محددة من الحالات:

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

# List messages by sender
qorechaind query crossvm messages-by-sender <address>
```

### JSON-RPC

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

**الذرّية (Atomicity):** الاستدعاءات المتزامنة (‏EVM إلى CosmWasm عبر الـ precompile) ذرّية — إذا ارتدّ أي من الطرفين، ترتدّ المعاملة بأكملها. أما الاستدعاءات غير المتزامنة فهي **ليست ذرّية** عبر الكتل؛ صمّم عقودك لتتعامل مع حالتي `Failed` و`Timed Out` بسلاسة.

**الترتيب:** تُعالَج الرسائل في الطابور بنظام الوارد أولاً يخرج أولاً (FIFO) ضمن كل تمريرة EndBlocker. لا يوجد ترتيب مضمون عبر الأنوية الافتراضية المصدرية المختلفة.

**ترميز الحمولة:** تعتمد صيغة الحمولة على الآلة الافتراضية الهدف:

* **أهداف EVM:** استدعاءات دوال مُرمَّزة بـ ABI
* **أهداف CosmWasm:** رسائل execute مُرمَّزة بـ JSON
* **أهداف SVM:** بيانات تعليمات BPF مُرمَّزة بصيغة Hex

---

## الخطوات التالية

* [الـ Precompiles في EVM](/developer-guide/evm-precompiles) — الـ precompile المتزامن لـ CrossVM والـ precompiles المخصصة الأخرى
* [تطوير EVM](/developer-guide/evm-development) — تطوير Solidity على QoreChain
* [تطوير CosmWasm](/developer-guide/cosmwasm-development) — تطوير عقود Rust/Wasm
* [تطوير SVM](/developer-guide/svm-development) — نشر برامج BPF
