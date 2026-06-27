---
slug: /sdk/why
title: لماذا QoreChain SDK
sidebar_label: لماذا QoreChain SDK
sidebar_position: 2
---

# لماذا QoreChain SDK

توفّر لك QoreChain SDK كل ما تقدّمه أي مجموعة تطوير برمجيات حديثة متعددة السلاسل —
رسائل ذات أنواع محدّدة لكل وحدة، واستعلامات ذات أنواع محدّدة، وحسابات لثلاث آلات
افتراضية (VMs) من عبارة استرجاع واحدة (mnemonic)، وغاز تلقائي، وفك ترميز الأخطاء،
والاشتراكات، والمحافظ، ومجموعة أدوات React.

لكن هناك ثلاث قدرات **ممكنة فقط على QoreChain**، لأنها مبنية على ميزات بروتوكول لا
تمتلكها أي طبقة أولى (Layer 1) أخرى: الذكاء الاصطناعي على السلسلة، وثلاث آلات
افتراضية متعايشة مع جسر أصلي، والتشفير الإلزامي المقاوم للكم. هذه هي الأسباب
للبناء هنا.

---

## 1. تسجيل المخاطر المسبق بالذكاء الاصطناعي

**افحص معاملة بالذكاء الاصطناعي على السلسلة قبل بثّها.**

تقدّم QoreChain تحليل مخاطر بالذكاء الاصطناعي على شكل precompiles لـ EVM. تستدعيها
الـ SDK نيابةً عنك وتعيد الغاز إضافةً إلى حكم بشأن المخاطر/الشذوذ في استدعاء واحد —
بحيث يمكن للمحفظة أو تطبيق dApp أن تحذّر (أو تمنع) *قبل* التوقيع.

```ts
import { createClient } from "@qorechain/sdk";
import { simulateWithRiskScore } from "@qorechain/evm";

const client = createClient({ network: "mainnet", endpoints: { evmRpc } });

const preflight = await simulateWithRiskScore(client.evm, {
  from: account.address,
  to: contractAddress,
  data: calldata,
  value: 0n,
});

console.log(preflight.gas);            // estimated gas
console.log(preflight.risk.level);     // on-chain risk level
console.log(preflight.anomaly.flagged);// anomalous pattern?
if (!preflight.safe) {
  // advisory verdict — set your own policy
  console.warn("Transaction flagged by on-chain AI risk scoring");
}
```

**لماذا هي فريدة:** يجري التسجيل *داخل السلسلة* بوصفه precompile حتمياً
(`aiRiskScore` عند `0x…0B01`، و`aiAnomalyCheck` عند `0x…0B02`). أما الشبكات
الأخرى فلا يمكنها سوى إلحاق خدمات ذكاء اصطناعي خارج السلسلة وغير حتمية. هذه هي أول
SDK تفحص معاملة بالذكاء الاصطناعي قبل توقيعها، مع نتيجة على السلسلة. راجع
[الفحص المسبق بالذكاء الاصطناعي](/sdk/guides/ai-preflight).

---

## 2. استدعاءات موحّدة عبر الآلات الافتراضية — حساب واحد، ثلاث آلات افتراضية، معاملة واحدة

**استدعِ عقداً على أي آلة افتراضية، وادمج الاستدعاءات عبر الثلاث جميعها بشكل ذرّي.**

تشغّل QoreChain عقود CosmWasm وEVM وSVM على السلسلة نفسها مع جسر أصلي عبر الآلات
الافتراضية. تكشف الـ SDK عن واجهة واحدة لاستدعاء أيٍّ منها — ولتجميع عدة استدعاءات
عبر الآلات الافتراضية في معاملة واحدة ذرّية يجري توقيعها مرة واحدة.

```ts
import { createCrossVMClient } from "@qorechain/sdk";

const crossVM = createCrossVMClient(tx, { query: client.query });

// Call an EVM contract from a native account (payload ABI-encoded for you).
await crossVM.call({
  targetVm: "evm",
  targetContract: "0xToken…",
  evm: { abi, functionName: "transfer", args: [recipient, amount] },
});

// One signature, three VMs, atomic: EVM → SVM → CosmWasm.
await crossVM.callAtomic([
  { targetVm: "evm", targetContract: "0x…", evm: { abi, functionName: "approve", args } },
  { targetVm: "svm", targetContract: "Prog…", svm: { data } },
  { targetVm: "cosmwasm", targetContract: "qor1…", cosmwasm: { swap: {} } },
]);
```

**لماذا هي فريدة:** QoreChain هي الطبقة الأولى الوحيدة التي تمتلك ثلاث آلات افتراضية
متعايشة ووحدة جسر أصلية (`crossvm` + الـ precompile الخاص بـ `CrossVMBridge`).
لا تستطيع السلاسل أحادية الآلة الافتراضية التعبير عن "حساب واحد، ثلاث آلات افتراضية،
معاملة ذرّية واحدة" — إذ لا يوجد ما تغلّفه الـ SDKs الخاصة بها. اكتب مرة واحدة،
واستدعِ أي آلة افتراضية. راجع
[الاستدعاءات عبر الآلات الافتراضية](/sdk/guides/cross-vm).

---

## 3. آمن كمومياً بشكل افتراضي

**اجعل الموقّع محمياً ضد الكم في استدعاء واحد.**

تفرض QoreChain توقيعات هجينة مقاومة للكم (ML-DSA-87 + كلاسيكي) على مستوى
البروتوكول. تجعل الـ SDK اعتمادها سطراً واحداً: التحقق، والتسجيل، والترحيل إلى
التوقيع الهجين — مع شارة React لإظهار أن المستخدمين محميون.

```ts
import { ensurePqcRegistered, migrateToHybrid } from "@qorechain/sdk";

// Idempotent: registers the signer's ML-DSA-87 key on-chain if not already.
const { alreadyRegistered, txHash } = await ensurePqcRegistered(tx, { pqcKeypair });

// Switch the signing path to hybrid (classical + post-quantum).
const hybrid = await migrateToHybrid(tx, { pqcKeypair });
await hybrid.send(messages);
```

```tsx
import { QuantumSafeBadge } from "@qorechain/react";

// Shows a "Quantum-safe" indicator when the address has a registered PQC key.
<QuantumSafeBadge address={account.address} />
```

**لماذا هي فريدة:** التشفير المقاوم للكم أصلي وإلزامي على QoreChain، وليس تجربة.
هذه هي أول SDK يكون فيها "الأمان الكمومي افتراضياً" استدعاءً واحداً مع شارة جاهزة
للإدراج. راجع [الأمان الكمومي](/sdk/guides/quantum-safe).

---

## وكل شيء آخر أيضاً

إلى جانب المميّزات الثلاثة الفارقة، تغطي الـ SDK كامل سطح السلسلة عبر
**TypeScript وPython وGo وRust وJava**: مؤلِّفات (composers) ذات أنواع محدّدة لكل
وحدة (بما في ذلك السلاسل الجانبية/سلاسل الدفع عبر `multilayer` والـ rollups عبر
`rdk`)، واستعلامات ذات أنواع محدّدة، ودورة حياة المعاملة، والاشتراكات، ومحافظ
المتصفّح، ومجموعة الخطّافات (hooks) في
[`@qorechain/react`](/sdk/guides/react).

جاهز للبناء؟ ابدأ بـ [البدء السريع](/sdk/quickstart).
