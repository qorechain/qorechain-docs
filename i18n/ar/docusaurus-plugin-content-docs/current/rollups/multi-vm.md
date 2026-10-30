---
slug: /rollups/multi-vm
title: متعدد الأجهزة الافتراضية (الاستدعاءات عبر الأجهزة الافتراضية)
sidebar_label: متعدد الأجهزة الافتراضية
sidebar_position: 8
---

# متعدد الأجهزة الافتراضية (الاستدعاءات عبر الأجهزة الافتراضية)

يتضمّن الـ RDK أدوات مساعدة بلغة TypeScript تُرمّز استدعاءً من عقد EVM إلى **precompile الاستدعاءات عبر الأجهزة الافتراضية** عند العنوان `0x0000000000000000000000000000000000000901`، وهو مصمَّم لتوجيهه إلى عقد QoreChain Native على بيئة تشغيل **QoreChain Native** (Wasm)، إضافةً إلى قالب هيكلي `multivm-rollup` يربط بينها. تغطّي هذه الأدوات **EVM ← QoreChain Native** فقط؛ أما SVM فهو بيئة تشغيل منفصلة وليس جزءًا من الـ precompile.

:::caution غير قابل للاستخدام على الشبكات الحيّة بعد
الـ precompile الخاص بالاستدعاءات عبر الأجهزة الافتراضية **غير مُفعَّل** على أيٍّ من الشبكتين: قائمة الـ precompiles الثابتة النشطة في وحدة EVM فارغة على الشبكة الرئيسية، وعلى شبكة الاختبار لا تحتوي إلا `0x…0A01` و`0x…0A02` و`0x…0C01` (جرى التحقق في 27 أكتوبر 2026)، فالعنوان `0x…0901` ليس في أي من القائمتين؛ واستدعاء `eth_getCode` للعنوان `0x…0901` يُرجع `0x`، والاستدعاء الموجَّه إليه ينجح ببيانات فارغة ولا ينفّذ شيئًا. كما أن رفع عقود QoreChain Native مغلق على الشبكتين، ومسار معاملات SVM معطَّل على مستوى الشبكة بأكملها. وإلى أن يتم تفعيل الـ precompile وإعادة فتح رفع عقود QoreChain Native، لا يوجد ما يمكن استدعاؤه. توثّق هذه الصفحة الأدوات لتتمكّن من الاستعداد؛ فلا تبنِ عليها تدفقات إنتاجية. راجع [EVM Precompiles: Network status](/developer-guide/evm-precompiles#network-status).
:::

:::note المُرمِّز يطابق تخطيط السلسلة منذ الإصدار 0.6.0
كانت الدالة `encodeCrossVmCalldata` في `@qorechain/rdk` **الإصدار 0.5.0 وما قبله** (وكذلك نقطة البداية `CrossVmCaller.sol` في قالب `multivm-rollup` لتلك الإصدارات) تستخدم `executeCrossVMCall(string,bytes)`، وهي دالة ذات محدِّد (selector) يختلف عن الذي تفكّ العقدة ترميزه، فلم يكن بإمكان أي استدعاء رمّزته أن يصل إلى الـ precompile حتى على شبكة فعّلته. أما **الإصدار 0.6.0** فيرمّز `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)` (المحدِّد `0x3c11078c`)، وهو ما تفكّ العقدة ترميزه (محدِّد من 4 بايتات، ثم المعاملات المرمَّزة وفق ABI؛ والقيمة `targetVM` 1 تعني QoreChain Native، وهي الوجهة الوحيدة المدعومة)، وبحسب ملاحظات الإصدار تمرّ بيانات الاستدعاء الصادرة عن الأداة المساعدة ذهابًا وإيابًا عبر مفكّ الترميز الخاص بالسلسلة نفسها. وقد تتغيّر واجهة ABI قبل التفعيل.
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
    1, // QoreChain Native
    "qor1cosmwasmcontractaddress...",
    toHex(new TextEncoder().encode(JSON.stringify({ transfer: { recipient: "qor1...", amount: "100" } }))),
  ],
});
```

تبني الدالة `encodeCrossVmCalldata` من `@qorechain/rdk` الإصدار 0.6.0 وما بعده (و0.7.0 هو الحالي) بيانات الاستدعاء نفسها نيابةً عنك:

```ts
import {
  CROSS_VM_PRECOMPILE,
  CROSS_VM_TARGET,
  encodeCrossVmCalldata,
  isCrossVmPrecompileActive,
} from "@qorechain/rdk";

// Ask the node first: today this answers `active: false` on both networks.
const status = await isCrossVmPrecompileActive("https://api.qore.host");
console.log(status.active, status.reason);

const calldata = encodeCrossVmCalldata({
  contract: "qor1cosmwasmcontractaddress...",
  msg: JSON.stringify({ increment: {} }),
  targetVm: CROSS_VM_TARGET.NATIVE, // 1 = QoreChain Native (CosmWasm); the default
});
// An EVM transaction to CROSS_VM_PRECOMPILE with `data: calldata`.
```

تقرأ الدالة `isCrossVmPrecompileActive(restBase)` معامل EVM المسمّى `active_static_precompiles` عبر REST ولا تُجيب بـ `active: true` إلا إذا كان عنوان الـ precompile مدرجًا فيه. وهذا هو الفحص الموثوق الوحيد، ويجب أن يتم خارج السلسلة: فالـ precompile يُرجع الرد الخام للهدف، ولذلك لا يستطيع الرد الفارغ التمييز بين precompile غير نشط واستدعاء حقيقي لعقد لا يُرجع شيئًا، كما أن الـ precompile لا يملك bytecode سواء كان نشطًا أم لا. وحتى حين تُبلغ الدالة `active: true`، توثّق الحزمة أنه منذ إصدار السلسلة v3.2.3 لا يصل الاستدعاء إلا إلى الأهداف التي أدرجتها الحوكمة في قائمة السماح (معامل الأجهزة الافتراضية المتقاطعة `bridge_allowed_targets`، وكل إدخال بالصيغة `<vm>:<contract>`)، وأن الاستدعاء من EVM إلى EVM مرفوض.

### إصدار السلسلة v3.2.5: قائمة السماح وصيغة الرد وحالات الرفض (على الشبكتين) {#chain-v325}

يغيّر إصدار السلسلة v3.2.5 سلوك الجسر. تشغّله الشبكة الرئيسية منذ 29 أكتوبر 2026 (مقترح الحوكمة 14، الارتفاع 3,906,833) وشبكة الاختبار منذ 26 أكتوبر. ولأن الـ precompile غير نشط على أي من الشبكتين، فإن صيغة الرد وصيغة الرفض الواردتين أدناه هما سلوك هذا الإصدار ولم تُجرَّبا باستدعاء حي؛ وحيثما تذكر هذه الصفحة أن الـ precompile يُرجع الرد الخام للهدف فإن ذلك يصف الإصدارات السابقة لـ v3.2.5.

* **مسار لقائمة السماح.** يقدّم `GET /qorechain/crossvm/v1/params` معاملات الجسر، بما فيها قائمة السماح بالأهداف. وقائمة السماح على الشبكتين فارغة (جرى التحقق من الشبكة الرئيسية وشبكة الاختبار في 30 أكتوبر 2026)، فلا يُسمح بأي هدف بعد.
* **صيغة ثابتة للرد.** يُرجع الـ precompile القيمة `abi.encode(bytes)`، لذا يبلغ الرد دائمًا 64 بايت على الأقل ويمكن تمييز الرد الفارغ من الرد المفقود؛ فكّ ترميزه بـ `abi.decode(ret, (bytes))`.
* **حالات الرفض تحمل سببًا.** عندما يرفض الجسر استدعاءً فإنه يعيده بـ `Error(string)` (revert)، ويستطيع العقد قراءته وتمريره.
* **الـ precompile ما زال غير نشط.** العنوان `0x...0901` غير مدرج في قائمة الـ precompile النشطة على أي من الشبكتين، ولذلك لم يُشغَّل شيء من هذا من البداية إلى النهاية.

في `@qorechain/rdk` 0.7.0 مساعدات لهذا (جرى التحقق منها مقابل ترميزات أنتجها Solidity): `getCrossVmParams` (قائمة السماح) و`crossVmTargetReady` (الـ precompile نشط والجسر مفعّل والهدف في قائمة السماح، مع سبب الحظر عندما لا يكون كذلك) و`decodeCrossVmResult` (`abi.decode(ret, (bytes))`) و`decodeRevertReason` (`Error(string)`).

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

ولأن الـ precompile غير نشط، فإن استدعاء `.call` عاديًا إليه يُرجع **نجاحًا مع بيانات فارغة ولا ينفّذ شيئًا**؛ فالعلم `ok` لا يدل على أن الاستدعاء قد أحدث أثرًا. والحارس الموثوق داخل العقد هو هدف يُرجع دائمًا إقرارًا غير فارغ، مع `require(ret.length > 0)` بعد الاستدعاء، بحيث يُعامَل الرد الفارغ على أنه فشل؛ وقالب `multivm-rollup` يفعل ذلك (من 0.6.0 فصاعدًا).

## إنشاء هيكل rollup متعدد الأجهزة الافتراضية

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

يتضمّن قالب `multivm-rollup` الملف `src/crossvm-call.ts` (يتحقق من أن الـ precompile حيّ، ثم يطبع بيانات الاستدعاء) والملف `contracts/CrossVmCaller.sol` الذي يستدعي `executeCrossVMCall(uint8,string,bytes)` ويشترط ردًا غير فارغ من الهدف. ومن 0.7.0 يفكّ العقد ترميز النتيجة `abi.encode(bytes)`، ويشترط الحد الأدنى البالغ 64 بايت الذي يُرجعه precompile نشط، ويمرّر سبب الرفض الصادر عن السلسلة. وهو لا يجعل الاستدعاء يعمل ما دام الـ precompile غير نشط. راجع [نشر Rollup](/rollups/deploying-a-rollup) للاطلاع على جميع قوالب أداة الإنشاء الهيكلي.
