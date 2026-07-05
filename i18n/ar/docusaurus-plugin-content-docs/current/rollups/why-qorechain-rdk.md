---
slug: /rollups/why
title: لماذا QoreChain RDK
sidebar_label: لماذا QoreChain RDK
sidebar_position: 2
---

# لماذا QoreChain RDK

معظم أدوات تطوير الـ Rollup هي اختلافات على النغمة نفسها: فهي تساعدك على
إطلاق سلسلة تطبيقات (app-chain) تُسوّى على طبقة أساس. تقوم QoreChain RDK بذلك
أيضًا — لكنها تتيح بالإضافة إلى ذلك ثلاثة أشياء **لا تستطيع أي مجموعة أدوات Rollup أخرى تقديمها**، لأنها
تعتمد على قدرات موجودة في الطبقة الأولى (Layer 1) لـ QoreChain، وليس في الأدوات نفسها:

- طبقة تسوية **مقاومة للحوسبة الكمومية**،
- أساسيات استشارية للذكاء الاصطناعي/التعلم المعزز **على السلسلة** (QCAI)، و
- بيئة تشغيل **ثلاثية الأجهزة الافتراضية (VM)** مع استدعاءات عابرة بين الأجهزة الافتراضية.

إذا كنت تحتاج فقط إلى Rollup تفاؤلي/zk عام، فأي مجموعة أدوات ستفي بالغرض. أما إذا أردت
أن تكون تسوية الـ Rollup الخاص بك **قابلة للتحقق، وآمنة كموميًا، وواعية بالذكاء الاصطناعي**، فهذه
هي مجموعة الأدوات الوحيدة القادرة على التعبير عن ذلك — بلغات TypeScript وPython وGo وRust وJava.

| عامل التميّز | الحالة | لماذا هذا ممكن هنا فقط |
| --- | --- | --- |
| **إيصالات تسوية آمنة كموميًا** | 🟢 فريدة (السبّاقة) | تتطلب طبقة L1 ما بعد كمومية — مستحيلة على طبقة أساس غير مزودة بـ PQC |
| **QCAI Rollup Copilot** | 🟢 فريد عبر السلسلة | يغلّف نقاط نهاية الذكاء الاصطناعي/التعلم المعزز على السلسلة الحصرية بـ QoreChain |
| **استدعاءات عابرة بين أجهزة افتراضية متعددة** | 🟡 مميّز | تشغّل QoreChain كلًا من EVM + CosmWasm + SVM تحت سلسلة واحدة |

---

## 1. إيصالات تسوية آمنة كموميًا

> 🟢 **فريدة.** لا يمكن لأي مجموعة أدوات Rollup مبنية على طبقة L1 غير ما بعد كمومية أن تقدّم هذا.

عندما يرسّخ الـ Rollup الخاص بك دفعة تسوية، تلتزم QoreChain بجذر حالته على
السلسلة الرئيسية (Main Chain) بتوقيع **ما بعد كمومي (ML-DSA-87 / Dilithium-5, FIPS-204)**.
تحوّل الـ RDK هذا الترسيخ إلى **إيصال قابل للنقل** يمكن لأي شخص
التحقق منه **دون اتصال بالكامل** — لا عقدة، ولا ثقة في مجموعة الأدوات، مجرد رياضيات.

يثبت الإيصال أمرين: أن جذر حالة الدفعة هو نفسه الذي تم
ترسيخه (الربط)، وأن الترسيخ وُقّع بمفتاح ما بعد كمومي مسجّل يخص منشئ
الطبقة (الموثوقية). يغطي التوقيع الرسالة القياسية
`layer_id || layer_height(8-byte big-endian) || state_root || validator_set_hash`.

```ts
import {
  createRdkClient,
  buildSettlementReceipt,
  verifySettlementReceipt,
} from "@qorechain/rdk";

// The public qore.host endpoints are baked into the presets (RDK ≥ 0.4.2);
// pass `endpoints` only to target your own node.
const rdk = createRdkClient({ network: "mainnet" });

// Build a portable receipt for batch #42 of "my-rollup".
const receipt = await buildSettlementReceipt(rdk, "my-rollup", 42);
// → { algorithm: "ML-DSA-87", stateRoot, layerHeight, pqcSignature, creator, ... }

// Verify it — fetches the creator's PQC key from the chain.
const result = await verifySettlementReceipt(receipt, { client: rdk });
console.log(result.valid);                 // true
console.log(result.checks.pqcSignature);   // Dilithium-5 signature verified
console.log(result.checks.stateRootBinding); // batch root == anchored root
```

**دون اتصال بالكامل** — سلّم الإيصال والمفتاح العام لمنشئ الطبقة إلى أي شخص، على
جهاز معزول عن الشبكة (air-gapped)، وسيتمكن من التحقق منه دون لمس الشبكة:

```ts
const result = await verifySettlementReceipt(receipt, {
  creatorPublicKey: "a1b2…", // the layer creator's ML-DSA-87 key (hex)
});
// result.valid === true, with zero network calls
```

يُتحقّق من الإيصال نفسه **بايتًا ببايت عبر اللغات الخمس جميعها** (يستخدم
العملاء غير المكتوبين بـ TypeScript مكتبة `qorechain-pqc` الخاصة بالسلسلة نفسها)، وبالتالي فإن الإيصال
الذي تنتجه خدمة TypeScript يُتحقّق منه بشكل مطابق في مدقّق مكتوب بـ Go أو خلفية
مكتوبة بـ Java. راجع [إيصالات التسوية الآمنة كموميًا](/rollups/settlement-receipts).

---

## 2. QCAI Rollup Copilot

> 🟢 **فريد عبر السلسلة.** مبني على نقاط نهاية للذكاء الاصطناعي/التعلم المعزز على السلسلة لا
> تمتلكها الشبكات الأخرى ببساطة.

تشغّل QoreChain خدمات ذكاء اصطناعي/تعلم معزز على مستوى الشبكة على السلسلة — وكيل سياسة رسوم،
وتوصيات للشبكة، وتحقيقات احتيال، وقواطع دوائر. يجمّع الـ Copilot
هذه الخدمات في عرض واحد قابل للمراجعة وبلغة واضحة لـ Rollup واحد. وهو
للقراءة فقط ويعمل بمبدأ أفضل جهد ممكن: إذا تعذّر الوصول إلى خدمة استشارية، فإنه يتراجع إلى
تحذير بدلًا من الفشل.

```ts
import { createRdkClient, getRollupAdvice } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "mainnet" }); // REST + qor_ JSON-RPC endpoints baked in (RDK ≥ 0.4.2)

const advice = await getRollupAdvice(rdk, "my-rollup");

for (const s of advice.suggestions) {
  console.log(`[${s.level}] ${s.message}`);
  // [action] 2 open fraud investigation(s) reference this rollup …
  // [warn]   QCAI reports network congestion — consider raising the fee …
  // [info]   A live QCAI fee estimate is available …
}

console.log(advice.feeEstimate);          // live QCAI fee estimate
console.log(advice.fraudInvestigations);  // investigations touching this rollup
console.log(advice.rlAgentStatus);        // the RL fee/routing agent's state
```

من واجهة سطر الأوامر:

```bash
qorollup advise my-rollup
```

مجموعات الأدوات الأخرى لا تملك شيئًا لتغلّفه — فالبيانات الاستشارية أساسية خاصة بـ QoreChain.
راجع [QCAI Copilot](/rollups/qcai-copilot).

---

## 3. استدعاءات عابرة بين أجهزة افتراضية متعددة

> 🟡 **مميّز.** تشغّل QoreChain كلًا من EVM وCosmWasm وSVM تحت سلسلة واحدة، مع
> عقد مسبق التجميع (precompile) يجسّر EVM ← CosmWasm.

يمكن لعقد الـ Rollup الخاص بك على EVM (بلغة Solidity) استدعاء عقد **CosmWasm** موجود
عبر precompile ثابت على العنوان `0x…0901`. تبني الـ RDK بيانات الاستدعاء (calldata) نيابةً عنك، بحيث
يمكنك إعادة استخدام أوراكل أو رمز أو سجل من CosmWasm انطلاقًا من Solidity دون
إعادة تنفيذه.

```ts
import { encodeCrossVmCalldata, CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

const calldata = encodeCrossVmCalldata({
  contract: "qor1examplecontract…",       // target CosmWasm contract
  msg: JSON.stringify({ increment: {} }),  // its execute message
});

// Send an EVM transaction:  to = CROSS_VM_PRECOMPILE,  data = calldata
console.log(CROSS_VM_PRECOMPILE); // 0x0000000000000000000000000000000000000901
```

أو مباشرةً من Solidity على الـ Rollup الخاص بك:

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

أنشئ هيكل مشروع للبداية باستخدام `npm create qorechain-rollup my-app -- --template multivm-rollup`.
(EVM↔CosmWasm فقط؛ الاستدعاءات العابرة لـ SVM منفصلة.) راجع [الأجهزة الافتراضية المتعددة](/rollups/multi-vm).

---

## كل ما تتوقعه إضافةً إلى ذلك

إلى جانب عوامل التميّز، تشحن الـ RDK أيضًا الأساسيات المتوقعة: خمسة عملاء
لغات منشورون ومُتحقق منهم مقابل متجهات ذهبية مشتركة، وملفات التعريف الخمسة المسبقة الإعداد
ومصفوفة التوافق الكاملة، وإدارة دفعات التسوية ودورة الحياة،
وتوافر بيانات أصلي، ومتحدٍّ تلقائي من نوع **watchtower** للـ Rollups
التفاؤلية، وواجهة سطر أوامر المشغّل `qorollup`.

## التالي

- [نشر Rollup](/rollups/deploying-a-rollup) — التثبيت لكل لغة
  ومن الصفر إلى Rollup حي على شبكة الاختبار.
- [إيصالات التسوية الآمنة كموميًا](/rollups/settlement-receipts) ·
  [QCAI Copilot](/rollups/qcai-copilot) ·
  [الأجهزة الافتراضية المتعددة](/rollups/multi-vm) ·
  [Watchtower](/rollups/watchtower) — الشروحات المعمّقة.
