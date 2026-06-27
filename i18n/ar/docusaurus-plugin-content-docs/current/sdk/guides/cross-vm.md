---
slug: /sdk/guides/cross-vm
title: دليل Cross-VM
sidebar_label: Cross-VM
sidebar_position: 4
---

# دليل Cross-VM

تشغّل QoreChain **EVM وSVM وCosmWasm جنبًا إلى جنب**، وتتيح وحدة `x/crossvm`
لحساب أصلي واحد استدعاء عقد على أيٍّ منها. يوفّر الـ SDK
مساعِدًا عالي المستوى هو `createCrossVMClient` لبناء هذه الاستدعاءات وتوقيعها وبثها —
بما في ذلك تجميع عدة استدعاءات في **معاملة ذرّية واحدة عبر الأنظمة الافتراضية الثلاثة جميعًا** —
بالإضافة إلى مساعِدات قراءة مُنمَّطة لتتبع حالة الرسالة. ما يزال توجيه EVM→الأصلي
المُنطلق *من داخل EVM* يجري على السلسلة عبر **precompile جسر cross-VM**
في `@qorechain/evm`.

## استدعاءات cross-VM موحّدة

تلفّ `createCrossVMClient` الرسالة `MsgCrossVMCall` (عنوان النوع
`/qorechain.crossvm.v1.MsgCrossVMCall`) كي لا تضطر أبدًا إلى بناء `{ typeUrl,
value }` يدويًا أو ترميز حمولة بنفسك. مُرسِل العميل هو عنوان
`TxClient` المتصل؛ وتكون قيمة `sourceVm` الافتراضية `"evm"`.

```ts
import { createClient, createCrossVMClient } from "@qorechain/sdk";

const client = createClient({ network: "testnet", endpoints: { rpc, rest } });
const tx = await client.connectTx(signer);
const xvm = createCrossVMClient(tx);

// Call an EVM contract from a native account — the payload is ABI-encoded.
const { messageId, result } = await xvm.call({
  sourceVm: "cosmwasm",
  targetVm: "evm",
  targetContract: "0xToken",
  evm: { abi: erc20Abi, functionName: "transfer", args: ["0xRecipient", 1n] },
});
```

`VMType` هو واحد من `"evm" | "cosmwasm" | "svm"` (يُصدَّر أيضًا كمصفوفة `VM_TYPES`).

### ترميز الحمولة لكل VM

اختر **شكل حمولة واحدًا** بالضبط لكل استدعاء:

| الشكل | الترميز |
|---|---|
| `{ payload: Uint8Array \| Hex }` | بايتات خام، تُمرَّر كما هي دون تغيير |
| `{ evm: { abi, functionName, args } }` | مُرمَّز بـ ABI باستخدام `encodeFunctionData` من viem (المحدِّد + الوسائط) |
| `{ cosmwasm: object }` | `JSON.stringify` ثم بايتات UTF-8 (اصطلاح execute-msg في CosmWasm) |
| `{ svm: { data: Uint8Array \| Hex } }` | بايتات خام (كتلة تعليمة SVM) |

يستورد مسار EVM `viem` بشكل كسول (lazily)، لذا فإن النظير الاختياري `viem`
مطلوب فقط عندما تستخدم فعليًا حمولة `{ evm: ... }`.

### البناء فقط (دون اتصال)

تُرجِع `buildCall` كائن `EncodeObject` دون بثّ — مفيد
للفحص، أو التجميع يدويًا، أو التوقيع في مكان آخر. (تُرمَّز حمولات EVM
بـ ABI بشكل غير متزامن، لذا استخدم لها `call`/`callAtomic`، أو رمّز مسبقًا
ومرّر `{ payload }`.)

```ts
const msg = xvm.buildCall({
  targetVm: "svm",
  targetContract: "Prog...",
  svm: { data: new Uint8Array([1, 2, 3]) },
});
```

## معاملات ذرّية ثلاثية الأنظمة الافتراضية

تجمع `callAtomic` عدة رسائل `MsgCrossVMCall` في **جسم معاملة واحد**
بحيث تُنفَّذ ذرّيًا تحت توقيع واحد — وهي الميزة البارزة للأنظمة الثلاثة. توقيع
واحد، واستدعاءات عبر EVM + SVM + CosmWasm تنجح جميعًا معًا
أو لا تنجح إطلاقًا:

```ts
const { messageIds, result } = await xvm.callAtomic([
  {
    targetVm: "evm",
    targetContract: "0xToken",
    evm: { abi: erc20Abi, functionName: "transfer", args: ["0xRecipient", 2n] },
  },
  { targetVm: "svm", targetContract: "Prog...", svm: { data: instructionBytes } },
  { targetVm: "cosmwasm", targetContract: "qor1c...", cosmwasm: { ping: {} } },
]);
```

## قراءة رسالة مرة أخرى

تقرأ `getMessage` رسالة cross-VM حسب المعرّف، مع تفضيل عميل الاستعلام المُنمَّط
والرجوع إلى طريقة JSON-RPC المسمّاة `qor_getCrossVMMessage`:

```ts
import { connectQueryClients } from "@qorechain/sdk";

const queries = connectQueryClients(rpcClient);
const reader = createCrossVMClient(tx, { query: queries.crossvm });

const msg = await reader.getMessage(messageId);
```

## قراءة حالة رسائل cross-VM

يُصدِّر `@qorechain/sdk` أغلفة REST مُنمَّطة فوق `x/crossvm`:

```ts
import {
  createClient,
  getCrossVmMessage,
  getPendingCrossVmMessages,
  getCrossVmParams,
} from "@qorechain/sdk";

const client = createClient({
  endpoints: { rest: "https://rest.testnet.example" },
});

// A single message by id.
const msg = await getCrossVmMessage(client.rest, messageId);

// All pending messages.
const pending = await getPendingCrossVmMessages(client.rest);

// Module parameters.
const params = await getCrossVmParams(client.rest);
```

تُرجِع هذه أشكالًا مُنمَّطة: `CrossVmMessage` و`CrossVmMessageResponse` و
`PendingCrossVmMessagesResponse` و`CrossVmParamsResponse`.

يمكنك أيضًا قراءة رسالة عبر مساحة الأسماء `qor_` في JSON-RPC:

```ts
const m = await client.qor.getCrossVMMessage(messageId);
```

## precompile جسر EVM

يُنفَّذ توجيه EVM→الأصلي على السلسلة عبر precompile جسر cross-VM،
المكشوف في `@qorechain/evm`:

```ts
import { PRECOMPILE_ADDRESSES } from "@qorechain/evm";

console.log(PRECOMPILE_ADDRESSES.crossVmBridge);
// 0x0000000000000000000000000000000000000901
```

استدعِ precompile من عقد Solidity (أو عبر viem) عند ذلك العنوان
لتوجيه رسالة إلى الطبقة الأصلية، ثم تتبّع حالتها بمساعِدات القراءة
أعلاه. راجع [دليل EVM](/sdk/guides/evm) للحصول على قائمة precompiles الكاملة.
