---
slug: /rollups/why
title: لماذا QoreChain RDK
sidebar_label: لماذا QoreChain RDK
sidebar_position: 2
---

# لماذا QoreChain RDK

معظم أدوات تطوير الـ Rollup هي اختلافات على النغمة نفسها: فهي تساعدك على
إطلاق سلسلة تطبيقات (app-chain) تُسوّى على طبقة أساس. تقوم QoreChain RDK بذلك
أيضًا، وتضيف إليه ثلاث قدرات خاصة بـ QoreChain مبنية حول الطبقة الأولى (Layer 1)
لـ QoreChain وليس حول الأدوات نفسها:

- طبقة تسوية **مقاومة للحوسبة الكمومية**،
- أساسيات استشارية للذكاء الاصطناعي/التعلم المعزز **على السلسلة** (QCAI)، و
- بيئة تشغيل **ثلاثية الأجهزة الافتراضية (VM)** مع استدعاءات عابرة بين الأجهزة الافتراضية.

:::caution مرحلة مبكرة: اقرأ عمود الحالة
لم يُنشأ أي Rollup على أي من الشبكتين حتى الآن (جرى التحقق في 23 أكتوبر 2026).
يوضح الجدول أدناه ما يعمل اليوم؛ وقد جُمع ما غيّره عملاء 0.6.0 المنشورون وما بقي من
الحدود في [RDK 0.6.0: التغييرات والحدود](/rollups/deploying-a-rollup#rdk-050-limits). إذا كنت تحتاج فقط
إلى Rollup تفاؤلي/zk عام، فأي مجموعة أدوات ستفي بالغرض؛ أما القدرات المذكورة
هنا فهي ما تضيفه RDK فوق ذلك، بلغات TypeScript وPython وGo وRust وJava.
:::

| القدرة | الحالة | ما تعتمد عليه |
| --- | --- | --- |
| **إيصالات تسوية آمنة كموميًا** | 🟡 مرحلة مبكرة | تُوقَّع المراسي بـ ML-DSA-87، مخطط السلسلة الرئيسية ما بعد الكمومي؛ ولا توجد مراسٍ بعد، ولذلك لم يُشغَّل المُتحقِّق في 0.6.0 (الذي يفحص مقابل السلسلة) على مرساة حقيقية قط |
| **QCAI Rollup Copilot** | 🟡 غير متاح بعد على نقاط النهاية العامة | خدمات استشارية للذكاء الاصطناعي/التعلم المعزز على السلسلة لا تكشفها نقاط النهاية العامة اليوم |
| **استدعاءات عابرة بين أجهزة افتراضية متعددة** | 🟡 غير قابل للاستخدام بعد على الشبكات الحية | عقد مسبق التجميع (precompile) للاستدعاءات العابرة بين الأجهزة الافتراضية غير مفعّل (ويطابق المُرمِّز في 0.6.0 تخطيط السلسلة)، ورفع QoreChain Native مغلق |

---

## 1. إيصالات تسوية آمنة كموميًا

> 🟡 **تصميم مبني على طبقة الأساس ما بعد الكمومية في QoreChain.** تُوقَّع مراسي
> التسوية بـ ML-DSA-87 (Dilithium-5, FIPS-204)، وهو المخطط نفسه الذي تستخدمه
> السلسلة الرئيسية. مرحلة مبكرة: لا توجد مراسٍ على أي من الشبكتين بعد.

عندما يرسّخ منشئ الـ Rollup الخاص بك دفعة تسوية، يُوقَّع المرساة بمفتاح
ما بعد كمومي مسجّل على السلسلة. يمكن لـ RDK تغليف هذه المرساة في **إيصال قابل
للنقل**، ويعيد المُتحقِّق قراءة الادعاء من عقدة QoreChain ليتأكد من أن الـ Rollup
والدفعة والمرساة ومفتاح المنشئ كلها تطابق ما تحتفظ به السلسلة.

```ts
import { createRdkClient, buildSettlementReceipt, verifySettlementReceipt } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });
const receipt = await buildSettlementReceipt(rdk, "my-rollup", 42);
const result = await verifySettlementReceipt(receipt, { client: rdk });
console.log(result.valid);
```

تتحقق `verifySettlementReceipt` مقابل السلسلة وترفض القول `valid` من دون `client`.
في 0.5.0 لم يكن فحصها للسلسلة يكتمل على الشبكات الحيّة (فكانت تفشل بإغلاق آمن بدلًا من
أن تُبلغ عن إيصال حقيقي على أنه صالح)؛ والإصدار 0.6.0 يصلح ذلك، لكن لا توجد مرساة بعد،
ولذلك لم يُشغَّل على مرساة حقيقية.
راجع [إيصالات التسوية الآمنة كموميًا](/rollups/settlement-receipts) لمعرفة ما
يُثبته الإيصال وما لا يُثبته ولمعرفة الحدود بدقة.

---

## 2. QCAI Rollup Copilot

> 🟡 **غير متاح بعد على نقاط النهاية العامة.**

صُمّم الـ Copilot لتجميع الخدمات الاستشارية في الشبكة (وكيل سياسة رسوم،
وتوصيات، وتحقيقات احتيال) في عرض واحد للقراءة فقط وبلغة واضحة لـ Rollup واحد.
وهو يعمل بمبدأ أفضل جهد ممكن: إذا تعذّر الوصول إلى خدمة، فإنه يتراجع إلى
تحذير بدلًا من الفشل. هذه الخدمات غير مكشوفة على نقاط النهاية العامة اليوم،
لذلك يعود كل قسم على شكل تحذير.

```ts
import { createRdkClient, getRollupAdvice } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });
const advice = await getRollupAdvice(rdk, "my-rollup");
console.log(advice.warnings); // services that could not be reached
```

من واجهة سطر الأوامر: `qorollup advise my-rollup`. راجع [QCAI Copilot](/rollups/qcai-copilot).

---

## 3. استدعاءات عابرة بين أجهزة افتراضية متعددة

> 🟡 **غير قابل للاستخدام بعد على الشبكات الحية** — الـ precompile غير مفعّل
> ورفع QoreChain Native مغلق. راجع [الأجهزة الافتراضية المتعددة](/rollups/multi-vm).

تتضمن RDK دوال مساعدة تُرمّز استدعاءً من عقد EVM (بلغة Solidity) إلى عقد
**QoreChain Native** عبر precompile ثابت على العنوان `0x…0901`. هذا الـ precompile
**غير مفعّل** على الشبكة الرئيسية ولا على شبكة الاختبار (راجع
[عقود EVM المسبقة التجميع: حالة الشبكة](/developer-guide/evm-precompiles#network-status)):
فالاستدعاء `eth_getCode` للعنوان `0x…0901` يعيد `0x` على كلتيهما، واستدعاء عقد له
ينجح من دون أي أثر.

تبني الدالة المساعدة `encodeCrossVmCalldata` في الإصدار 0.6.0 بيانات استدعاء
للدالة `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)`، وهو التخطيط
الذي تفك العقدة ترميزه (أما 0.5.0 وما قبله فكانت ترمّز صيغة بوسيطين بمحدِّد مختلف،
ما كان يمنع وصولها إلى الـ precompile أصلًا). ويمكنك ترميز الاستدعاء نفسه بنفسك،
كما هو موضَّح هنا باستخدام viem (القيمة 1 لـ `targetVM` هي QoreChain Native، وهي الهدف الوحيد المدعوم):

```ts
import { encodeFunctionData, parseAbi, toHex } from "viem";

const abi = parseAbi([
  "function executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)",
]);

const calldata = encodeFunctionData({
  abi,
  functionName: "executeCrossVMCall",
  args: [
    1,                                                          // 1 = QoreChain Native
    "qor1examplecontract…",                                     // target contract
    toHex(new TextEncoder().encode(JSON.stringify({ increment: {} }))), // its execute message
  ],
});

// Send an EVM transaction:  to = 0x0000000000000000000000000000000000000901,  data = calldata
```

أو مباشرةً من Solidity على الـ Rollup الخاص بك:

```solidity
address constant CROSS_VM_PRECOMPILE = 0x0000000000000000000000000000000000000901;

function callCosmWasm(string calldata contractAddr, bytes calldata msg_)
    external returns (bytes memory)
{
    bytes memory data =
        abi.encodeWithSignature("executeCrossVMCall(uint8,string,bytes)", uint8(1), contractAddr, msg_);
    (bool ok, bytes memory ret) = CROSS_VM_PRECOMPILE.call(data);
    require(ok, "cross-VM call failed");
    return ret;
}
```

لا تثبت `ok` وحدها شيئًا اليوم: فما دام الـ precompile بلا شيفرة، يعيد الاستدعاء
نجاحًا مع بيانات فارغة ولا ينفّذ شيئًا، ولذلك تأكّد من الأثر على العقد الهدف.

أنشئ هيكل مشروع للبداية باستخدام `npm create qorechain-rollup my-app -- --template multivm-rollup`.
(EVM↔QoreChain Native فقط؛ الاستدعاءات العابرة لـ SVM منفصلة.)

---

## كل ما تتوقعه إضافةً إلى ذلك

إلى جانب هذه القدرات، تشحن RDK أيضًا الأساسيات المتوقعة: خمسة عملاء
لغات منشورون ومُتحقق منهم مقابل متجهات ذهبية مشتركة، وملفات التعريف الخمسة المسبقة الإعداد
ومصفوفة التوافق الكاملة، وإدارة دفعات التسوية ودورة الحياة،
وتخزين أصلي لتوافر البيانات (راجع ملاحظة حالته)، ومتحدٍّ تلقائي من نوع **watchtower** للـ Rollups
التفاؤلية، وواجهة سطر أوامر المشغّل `qorollup`.

## التالي

- [نشر Rollup](/rollups/deploying-a-rollup) — التثبيت لكل لغة
  ومسار واجهة سطر الأوامر إلى Rollup على شبكة الاختبار.
- [إيصالات التسوية الآمنة كموميًا](/rollups/settlement-receipts) ·
  [QCAI Copilot](/rollups/qcai-copilot) ·
  [الأجهزة الافتراضية المتعددة](/rollups/multi-vm) ·
  [Watchtower](/rollups/watchtower) — الشروحات المعمّقة.
