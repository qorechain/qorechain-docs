---
slug: /rollups/multi-vm
title: متعدد الأجهزة الافتراضية (الاستدعاءات عبر الأجهزة الافتراضية)
sidebar_label: متعدد الأجهزة الافتراضية
sidebar_position: 8
---

# متعدد الأجهزة الافتراضية (الاستدعاءات عبر الأجهزة الافتراضية)

يشغّل الـ rollup متعدد الأجهزة الافتراضية طبقة تنفيذ EVM يمكنها استدعاء عقود
CosmWasm من خلال **precompile مخصص للاستدعاءات عبر الأجهزة الافتراضية**. يوفّر الـ RDK
أدوات TypeScript لترميز هذه الاستدعاءات وقالب هيكلي للبدء منه.

> تغطّي هذه الأدوات **EVM → CosmWasm** فقط. أما SVM فهو وقت تشغيل منفصل و
> ليس جزءًا من الـ precompile الخاص بالاستدعاءات عبر الأجهزة الافتراضية.

## الـ precompile

يُتاح الـ precompile الخاص بالاستدعاءات عبر الأجهزة الافتراضية عند عنوان ثابت:

```ts
import { CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

console.log(CROSS_VM_PRECOMPILE); // 0x…0901
```

## ترميز استدعاء عبر الأجهزة الافتراضية

تبني الدالة `encodeCrossVmCalldata` بيانات الاستدعاء (calldata) التي يرسلها عقد EVM
الخاص بك إلى الـ precompile لاستدعاء عقد CosmWasm. وتحسب الدالة `functionSelector`
محدِّد الـ 4 بايت لتوقيع دالة Solidity.

```ts
import { encodeCrossVmCalldata, functionSelector } from "@qorechain/rdk";

const calldata = encodeCrossVmCalldata({
  contract: "qor1cosmwasmcontractaddress...",
  msg: { transfer: { recipient: "qor1...", amount: "100" } },
});

const selector = functionSelector("callCosmwasm(string,bytes)");
```

## جانب Solidity

من عقد EVM تستدعي عنوان الـ precompile باستخدام بيانات الاستدعاء المرمّزة.
يتضمّن قالب `multivm-rollup` مقتطف `contracts/CrossVmCaller.sol`
على هذا النحو:

```solidity
// contracts/CrossVmCaller.sol
address constant CROSS_VM_PRECOMPILE = 0x0000000000000000000000000000000000000901;

function callCosmwasm(bytes memory calldata_) internal returns (bytes memory) {
    (bool ok, bytes memory out) = CROSS_VM_PRECOMPILE.call(calldata_);
    require(ok, "cross-vm call failed");
    return out;
}
```

## إنشاء هيكل rollup متعدد الأجهزة الافتراضية

يقوم قالب جديد، `multivm-rollup`، بإنشاء هيكل rollup من نوع EVM مهيّأ لاستدعاء CosmWasm،
بما في ذلك مقتطف `CrossVmCaller.sol`:

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

راجع [نشر rollup](/rollups/deploying-a-rollup) للاطلاع على جميع قوالب
أداة الإنشاء الهيكلي.
