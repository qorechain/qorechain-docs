---
slug: /rollups/multi-vm
title: متعدد الأجهزة الافتراضية (الاستدعاءات عبر الأجهزة الافتراضية)
sidebar_label: متعدد الأجهزة الافتراضية
sidebar_position: 8
---

# متعدد الأجهزة الافتراضية (الاستدعاءات عبر الأجهزة الافتراضية)

يتضمّن الـ RDK أدوات مساعدة بلغة TypeScript تُرمّز استدعاءً من عقد EVM إلى **precompile الاستدعاءات عبر الأجهزة الافتراضية** عند العنوان `0x0000000000000000000000000000000000000901`، وهو مصمَّم لتوجيهه إلى عقد CosmWasm على بيئة تشغيل **QoreChain Native** (Wasm)، إضافةً إلى قالب هيكلي `multivm-rollup` يربط بينها. تغطّي هذه الأدوات **EVM ← QoreChain Native** فقط؛ أما SVM فهو بيئة تشغيل منفصلة وليس جزءًا من الـ precompile.

:::caution غير قابل للاستخدام على الشبكات الحيّة بعد
الـ precompile الخاص بالاستدعاءات عبر الأجهزة الافتراضية **غير مُفعَّل** على أيٍّ من الشبكتين: قائمة الـ precompiles الثابتة النشطة في وحدة EVM فارغة على الشبكة الرئيسية وعلى شبكة الاختبار، لذا فإن استدعاء `0x…0901` يُرجع بيانات فارغة ولا ينفّذ شيئًا. كما أن رفع عقود CosmWasm مغلق على الشبكتين، ومسار معاملات SVM معطَّل على مستوى الشبكة بأكملها. وإلى أن يتم تفعيل الـ precompile وإعادة فتح رفع عقود CosmWasm، لا يوجد ما يمكن استدعاؤه. توثّق هذه الصفحة الأدوات لتتمكّن من الاستعداد؛ فلا تبنِ عليها تدفقات إنتاجية. راجع [EVM Precompiles: Network status](/developer-guide/evm-precompiles#network-status).
:::

:::note
اعتبارًا من RDK v0.4.2 أصبح معرّف خيار الجهاز الافتراضي لبيئة تشغيل Wasm هو **`native`** ‏(QoreChain Native)؛ ويبقى `cosmwasm` اسمًا بديلًا قديمًا مقبولًا، وكلاهما يُترجم إلى `cosmwasm` على مستوى الشبكة. أما دالة ABI الخاصة بالـ precompile فهي `executeCrossVMCall(string,bytes)`.
:::

## عنوان الـ precompile

```ts
import { CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

console.log(CROSS_VM_PRECOMPILE); // 0x0000000000000000000000000000000000000901
```

## ترميز استدعاء عبر الأجهزة الافتراضية

تبني الدالة `encodeCrossVmCalldata` بيانات الاستدعاء (calldata) للدالة `executeCrossVMCall(string contract, bytes msg)`. والمعامل `msg` هو رسالة التنفيذ الخاصة بالعقد، إما كسلسلة JSON بترميز UTF-8 أو كبايتات خام.

```ts
import { encodeCrossVmCalldata } from "@qorechain/rdk";

const calldata = encodeCrossVmCalldata({
  contract: "qor1cosmwasmcontractaddress...",
  msg: JSON.stringify({ transfer: { recipient: "qor1...", amount: "100" } }),
});
```

## جانب Solidity

من عقد EVM تستدعي عنوان الـ precompile باستخدام الاستدعاء المرمّز:

```solidity
address constant CROSS_VM_PRECOMPILE = 0x0000000000000000000000000000000000000901;

function callCosmWasm(string calldata contractAddr, bytes calldata msg_)
    external returns (bytes memory)
{
    bytes memory data =
        abi.encodeWithSignature("executeCrossVMCall(string,bytes)", contractAddr, msg_);
    (bool ok, bytes memory ret) = CROSS_VM_PRECOMPILE.call(data);
    require(ok, "cross-VM call failed");
    return ret;
}
```

ولأن الـ precompile غير نشط، فإن استدعاء `.call` عاديًا إليه يُرجع نجاحًا مع بيانات فارغة؛ لذا تحقّق من طول البيانات المُرجَعة بدلًا من الاعتماد على العلم `ok` وحده إذا جرّبت ذلك اليوم.

## إنشاء هيكل rollup متعدد الأجهزة الافتراضية

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

يتضمّن القالب نقطة بداية في `contracts/CrossVmCaller.sol`؛ قارِنها بواجهة ABI أعلاه قبل الاعتماد عليها. راجع [نشر Rollup](/rollups/deploying-a-rollup) للاطلاع على جميع قوالب أداة الإنشاء الهيكلي.
