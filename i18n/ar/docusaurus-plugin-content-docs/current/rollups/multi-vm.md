---
slug: /rollups/multi-vm
title: متعدد الأجهزة الافتراضية (الاستدعاءات عبر الأجهزة الافتراضية)
sidebar_label: متعدد الأجهزة الافتراضية
sidebar_position: 8
---

# متعدد الأجهزة الافتراضية (الاستدعاءات عبر الأجهزة الافتراضية)

يتضمّن الـ RDK أدوات مساعدة بلغة TypeScript تُرمّز استدعاءً من عقد EVM إلى **precompile الاستدعاءات عبر الأجهزة الافتراضية** عند العنوان `0x0000000000000000000000000000000000000901`، وهو مصمَّم لتوجيهه إلى عقد CosmWasm على بيئة تشغيل **QoreChain Native** (Wasm)، إضافةً إلى قالب هيكلي `multivm-rollup` يربط بينها. تغطّي هذه الأدوات **EVM ← QoreChain Native** فقط؛ أما SVM فهو بيئة تشغيل منفصلة وليس جزءًا من الـ precompile.

:::caution غير قابل للاستخدام على الشبكات الحيّة بعد
الـ precompile الخاص بالاستدعاءات عبر الأجهزة الافتراضية **غير مُفعَّل** على أيٍّ من الشبكتين: قائمة الـ precompiles الثابتة النشطة في وحدة EVM فارغة على الشبكة الرئيسية وعلى شبكة الاختبار، واستدعاء `eth_getCode` للعنوان `0x…0901` يُرجع `0x`، والاستدعاء الموجَّه إليه ينجح ببيانات فارغة ولا ينفّذ شيئًا. كما أن رفع عقود CosmWasm مغلق على الشبكتين، ومسار معاملات SVM معطَّل على مستوى الشبكة بأكملها. وإلى أن يتم تفعيل الـ precompile وإعادة فتح رفع عقود CosmWasm، لا يوجد ما يمكن استدعاؤه. توثّق هذه الصفحة الأدوات لتتمكّن من الاستعداد؛ فلا تبنِ عليها تدفقات إنتاجية. راجع [EVM Precompiles: Network status](/developer-guide/evm-precompiles#network-status).
:::

:::caution المُرمِّز في الإصدار 0.5.0 لا يطابق تخطيط السلسلة
تستخدم الدالة `encodeCrossVmCalldata` في `@qorechain/rdk` الإصدار 0.5.0 (وكذلك نقطة البداية `CrossVmCaller.sol` في قالب `multivm-rollup`) الدالة `executeCrossVMCall(string,bytes)`. أما العقدة فتفكّ ترميز `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)` (محدِّد من 4 بايتات، ثم المعاملات المرمَّزة وفق ABI؛ والقيمة `targetVM` 1 تعني CosmWasm، وهي الوجهة الوحيدة المدعومة)، وقد تتغيّر واجهة ABI قبل التفعيل. لذلك لا تُفكّ بيانات الاستدعاء الصادرة عن الأداة المساعدة على العقدة حتى بعد وجود الـ precompile. تعرض الأقسام التالية تخطيط العقدة.
:::

:::note
اعتبارًا من RDK v0.4.2 أصبح معرّف خيار الجهاز الافتراضي لبيئة تشغيل Wasm هو **`native`** ‏(QoreChain Native)؛ ويبقى `cosmwasm` اسمًا بديلًا قديمًا مقبولًا، وكلاهما يُترجم إلى `cosmwasm` على مستوى الشبكة.
:::

## عنوان الـ precompile

```ts
import { CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

console.log(CROSS_VM_PRECOMPILE); // 0x0000000000000000000000000000000000000901
```

## ترميز استدعاء عبر الأجهزة الافتراضية

رمِّز تخطيط العقدة مباشرةً. والمعامل `payload` هو رسالة التنفيذ الخاصة بالعقد على هيئة بايتات JSON بترميز UTF-8 (يظهر المثال باستخدام viem):

```ts
import { encodeFunctionData, parseAbi, toHex } from "viem";

const abi = parseAbi([
  "function executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)",
]);

const calldata = encodeFunctionData({
  abi,
  functionName: "executeCrossVMCall",
  args: [
    1, // CosmWasm
    "qor1cosmwasmcontractaddress...",
    toHex(new TextEncoder().encode(JSON.stringify({ transfer: { recipient: "qor1...", amount: "100" } }))),
  ],
});
```

تبني الدالة `encodeCrossVmCalldata({ contract, msg })` من `@qorechain/rdk` الصيغة `(string,bytes)` بدلًا من ذلك، وهي صيغة لا تقرؤها العقدة (راجع التنبيه أعلاه).

## جانب Solidity

من عقد EVM تستدعي عنوان الـ precompile باستخدام الاستدعاء المرمّز:

```solidity
address constant CROSS_VM_PRECOMPILE = 0x0000000000000000000000000000000000000901;

function callCosmWasm(string calldata contractAddr, bytes calldata msg_)
    external returns (bytes memory)
{
    bytes memory data = abi.encodeWithSignature(
        "executeCrossVMCall(uint8,string,bytes)", uint8(1), contractAddr, msg_
    );
    (bool ok, bytes memory ret) = CROSS_VM_PRECOMPILE.call(data);
    require(ok, "cross-VM call failed");
    return ret;
}
```

ولأن الـ precompile غير نشط، فإن استدعاء `.call` عاديًا إليه يُرجع **نجاحًا مع بيانات فارغة ولا ينفّذ شيئًا**؛ فالعلم `ok` لا يدل على أن الاستدعاء قد أحدث أثرًا. إذا جرّبت ذلك اليوم، فتحقّق من الأثر على العقد الهدف.

## إنشاء هيكل rollup متعدد الأجهزة الافتراضية

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

يتضمّن القالب نقطة بداية في `contracts/CrossVmCaller.sol`؛ قارِنها بتخطيط العقدة أعلاه قبل الاعتماد عليها. راجع [نشر Rollup](/rollups/deploying-a-rollup) للاطلاع على جميع قوالب أداة الإنشاء الهيكلي.
