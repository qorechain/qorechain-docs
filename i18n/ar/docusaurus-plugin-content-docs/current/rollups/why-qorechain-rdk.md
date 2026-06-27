---
slug: /rollups/why
title: لماذا QoreChain RDK
sidebar_label: لماذا QoreChain RDK
sidebar_position: 2
---

# لماذا QoreChain RDK

معظم أدوات تطوير الرول-أب هي صيغ مختلفة من الفكرة نفسها: فهي تساعدك على
إطلاق سلسلة تطبيقات تُسوّى إلى طبقة أساسية. وتفعل QoreChain RDK ذلك
أيضًا — لكنها تكشف بالإضافة إلى ذلك ثلاثة أمور **لا تستطيع أي أداة رول-أب أخرى
تقديمها**، لأنها تعتمد على قدرات موجودة في الطبقة الأولى (Layer 1) لـ QoreChain،
لا في الأدوات نفسها:

- طبقة تسوية **ما بعد الكمومية (post-quantum)**،
- بدائيات استشارية **للذكاء الاصطناعي/التعلم المعزّز على السلسلة** (QCAI)، و
- زمن تشغيل **بثلاثة أجهزة افتراضية (triple-VM)** مع استدعاءات بين الأجهزة الافتراضية.

إذا كنت بحاجة فقط إلى رول-أب تفاؤلية/zk عامة، فستفي أي أداة بالغرض.
أما إذا أردت أن تكون تسوية رول-أب الخاصة بك **قابلة للتحقق، وآمنة كموميًا،
ومُدركة للذكاء الاصطناعي**، فهذه هي الأداة الوحيدة القادرة على التعبير عن ذلك —
بلغة TypeScript وPython وGo وRust وJava.

| عامل التمييز | الحالة | لماذا يمكن تحقيق ذلك هنا فقط |
| --- | --- | --- |
| **إيصالات تسوية آمنة كموميًا** | 🟢 فريد (سبّاق في السوق) | يتطلب طبقة أولى ما بعد كمومية — مستحيل على طبقة أساسية غير PQC |
| **QCAI Rollup Copilot** | 🟢 فريد عبر السلسلة | يغلّف نقاط نهاية الذكاء الاصطناعي/التعلم المعزّز على السلسلة الخاصة بـ QoreChain فقط |
| **استدعاءات متعددة الأجهزة الافتراضية بين الأجهزة الافتراضية** | 🟡 مميّز | تُشغّل QoreChain أجهزة EVM + CosmWasm + SVM تحت سلسلة واحدة |

---

## 1. إيصالات تسوية آمنة كموميًا

> 🟢 **فريد.** لا تستطيع أي أداة رول-أب مبنية على طبقة أولى غير ما بعد كمومية تقديم هذا.

عندما تُرسي رول-أب الخاصة بك دُفعة تسوية، تُلزم QoreChain جذر حالتها بالسلسلة
الرئيسية تحت توقيع **ما بعد كمومي (ML-DSA-87 / Dilithium-5، FIPS-204)**.
تُحوّل RDK ذلك الإرساء إلى **إيصال قابل للنقل** يمكن لأي شخص التحقق منه
**كليًا دون اتصال** — لا عقدة، ولا ثقة في الأداة، بل رياضيات فحسب.

يُثبت الإيصال أمرين: أن جذر حالة الدُفعة هو نفسه الذي تم إرساؤه (الربط)،
وأن الإرساء قد وُقّع بمفتاح مُنشئ الطبقة المُسجّل ما بعد الكمومي (الأصالة).
يغطي التوقيع الرسالة المعيارية
`layer_id || layer_height(8-byte big-endian) || state_root || validator_set_hash`.

```ts
import {
  createRdkClient,
  buildSettlementReceipt,
  verifySettlementReceipt,
} from "@qorechain/rdk";

const rdk = createRdkClient({
  network: "mainnet",
  endpoints: { rest: "https://api.qore.network" }, // your QoreChain node REST
});

// Build a portable receipt for batch #42 of "my-rollup".
const receipt = await buildSettlementReceipt(rdk, "my-rollup", 42);
// → { algorithm: "ML-DSA-87", stateRoot, layerHeight, pqcSignature, creator, ... }

// Verify it — fetches the creator's PQC key from the chain.
const result = await verifySettlementReceipt(receipt, { client: rdk });
console.log(result.valid);                 // true
console.log(result.checks.pqcSignature);   // Dilithium-5 signature verified
console.log(result.checks.stateRootBinding); // batch root == anchored root
```

**كليًا دون اتصال** — سلّم الإيصال والمفتاح العام للمُنشئ إلى أي شخص، على
جهاز معزول عن الشبكة، وسيتمكن من التحقق منه دون لمس الشبكة:

```ts
const result = await verifySettlementReceipt(receipt, {
  creatorPublicKey: "a1b2…", // the layer creator's ML-DSA-87 key (hex)
});
// result.valid === true, with zero network calls
```

يتحقق الإيصال نفسه **بايتًا ببايت عبر اللغات الخمس جميعها** (تستخدم العملاء
غير TypeScript مكتبة `qorechain-pqc` الخاصة بالسلسلة نفسها)، بحيث أن إيصالًا
أنتجته خدمة TypeScript يُتحقق منه بشكل مطابق في مُدقّق Go أو في خلفية Java.
راجع [إيصالات تسوية آمنة كموميًا](/rollups/settlement-receipts).

---

## 2. QCAI Rollup Copilot

> 🟢 **فريد عبر السلسلة.** مبني على نقاط نهاية للذكاء الاصطناعي/التعلم المعزّز على
> السلسلة لا تمتلكها الشبكات الأخرى ببساطة.

تُشغّل QoreChain خدمات ذكاء اصطناعي/تعلم معزّز على مستوى الشبكة على السلسلة —
وكيل سياسة الرسوم، وتوصيات الشبكة، وتحقيقات الاحتيال، وقواطع الدوائر.
يجمع الـ Copilot هذه الخدمات في عرض واحد قابل للمراجعة وبلغة واضحة لرول-أب
واحدة. وهو للقراءة فقط ويعمل بأفضل جهد ممكن: إذا تعذّر الوصول إلى خدمة استشارية،
فإنه يتراجع إلى تحذير بدلًا من الفشل.

```ts
import { createRdkClient, getRollupAdvice } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "mainnet", endpoints: { rest, evmRpc } });

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

لا تملك الأدوات الأخرى شيئًا تغلّفه — فالبيانات الاستشارية بدائية خاصة بـ QoreChain.
راجع [QCAI Copilot](/rollups/qcai-copilot).

---

## 3. استدعاءات متعددة الأجهزة الافتراضية بين الأجهزة الافتراضية

> 🟡 **مميّز.** تُشغّل QoreChain أجهزة EVM وCosmWasm وSVM تحت سلسلة واحدة، مع
> precompile يربط EVM → CosmWasm.

يمكن لعقد رول-أب EVM (Solidity) الخاص بك استدعاء عقد **CosmWasm** قائم
عبر precompile ثابت عند العنوان `0x…0901`. تبني RDK بيانات الاستدعاء (calldata)
نيابةً عنك، فتتمكن من إعادة استخدام أوراكل أو رمز أو سجل من CosmWasm من Solidity
دون إعادة تنفيذه.

```ts
import { encodeCrossVmCalldata, CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

const calldata = encodeCrossVmCalldata({
  contract: "qor1examplecontract…",       // target CosmWasm contract
  msg: JSON.stringify({ increment: {} }),  // its execute message
});

// Send an EVM transaction:  to = CROSS_VM_PRECOMPILE,  data = calldata
console.log(CROSS_VM_PRECOMPILE); // 0x0000000000000000000000000000000000000901
```

أو مباشرة من Solidity على رول-أب الخاصة بك:

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

أنشئ هيكلًا أوليًا للبدء باستخدام `npm create qorechain-rollup my-app -- --template multivm-rollup`.
(EVM↔CosmWasm فقط؛ استدعاءات SVM المتبادلة منفصلة.) راجع [Multi-VM](/rollups/multi-vm).

---

## كل ما تتوقعه بخلاف ذلك

إلى جانب عوامل التمييز، توفّر RDK المتطلبات الأساسية أيضًا: خمسة عملاء لغة
منشورين تم التحقق منهم مقابل متجهات ذهبية مشتركة، وملفات التعريف الخمسة المُعدّة
مسبقًا ومصفوفة التوافق الكاملة، وإدارة دُفعات التسوية ودورة الحياة، وتوافر بيانات
أصلي، و**برج مراقبة (watchtower)** للطعن التلقائي لرول-أب التفاؤلية، وواجهة سطر
الأوامر التشغيلية `qorollup`.

## التالي

- [نشر رول-أب](/rollups/deploying-a-rollup) — التثبيت لكل لغة ومن
  الصفر إلى رول-أب حية على الشبكة التجريبية.
- [إيصالات تسوية آمنة كموميًا](/rollups/settlement-receipts) ·
  [QCAI Copilot](/rollups/qcai-copilot) ·
  [Multi-VM](/rollups/multi-vm) ·
  [برج المراقبة](/rollups/watchtower) — الشروحات المتعمّقة.
