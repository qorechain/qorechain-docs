---
slug: /sdk/why
title: لماذا QoreChain SDK
sidebar_label: لماذا QoreChain SDK
sidebar_position: 2
---

# لماذا QoreChain SDK

توفّر لك QoreChain SDK كل ما توفّره أي حزمة تطوير حديثة متعددة السلاسل — رسائل
ذات أنواع محدّدة (typed) لكل وحدة، واستعلامات ذات أنواع محدّدة، وحسابات لثلاث
آلات افتراضية من عبارة استرجاع (mnemonic) واحدة، وتقدير الغاز التلقائي، وفكّ
ترميز الأخطاء، والاشتراكات، والمحافظ، وحزمة React.

لكن هناك خمس قدرات **ممكنة فقط على QoreChain**، لأنها مبنية على خصائص في
البروتوكول لا تملكها أي شبكة أخرى من الطبقة الأولى (Layer 1): ذكاء اصطناعي على
السلسلة، وثلاث آلات افتراضية متعايشة مع جسر أصلي، وتشفير ما بعد الكم الإلزامي،
وهوية واحدة من 20 بايت عبر مسارات الآلات الافتراضية الثلاثة، وإنفاق مفوَّض آمن
من ناحية تشفير ما بعد الكم (PQC) لمفاتيح المحافظ الخارجية. هذه هي الأسباب التي
تدفعك للبناء هنا.

---

## 1. تقييم المخاطر المسبق بالذكاء الاصطناعي

**افحص المعاملة بذكاء اصطناعي على السلسلة قبل بثّها.**

توفّر QoreChain تحليل المخاطر بالذكاء الاصطناعي كعمليات مسبقة التجميع
(precompiles) على EVM. تستدعيها SDK نيابة عنك وتعيد الغاز مع حكم
المخاطر/الشذوذ في استدعاء واحد — بحيث تستطيع المحفظة أو التطبيق اللامركزي
التحذير (أو الحظر) *قبل* التوقيع.

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

**لماذا هذا فريد:** يعمل التقييم *داخل السلسلة نفسها* كعملية مسبقة التجميع
حتمية (`aiRiskScore` على العنوان `0x…0B01`، و`aiAnomalyCheck` على العنوان
`0x…0B02`). الشبكات الأخرى لا تستطيع سوى إلحاق خدمات ذكاء اصطناعي خارج
السلسلة وغير حتمية. هذه أول SDK تفحص المعاملة بالذكاء الاصطناعي قبل توقيعها،
بنتيجة صادرة من على السلسلة. راجع [الفحص المسبق بالذكاء الاصطناعي](/sdk/guides/ai-preflight).

---

## 2. استدعاءات موحّدة عبر الآلات الافتراضية — حساب واحد، ثلاث آلات افتراضية، معاملة واحدة

**استدعِ عقدًا على أي آلة افتراضية، وادمج استدعاءات عبر الآلات الثلاث كلها بشكل ذرّي.**

تشغّل QoreChain عقود CosmWasm وEVM وSVM على السلسلة نفسها مع جسر أصلي عابر
للآلات الافتراضية. تعرض SDK واجهة واحدة لاستدعاء أي منها — ولحزم عدة
استدعاءات عابرة للآلات الافتراضية في معاملة ذرّية واحدة تُوقَّع مرة واحدة.

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

**لماذا هذا فريد:** إن QoreChain هي شبكة الطبقة الأولى الوحيدة التي تضم ثلاث
آلات افتراضية متعايشة مع وحدة جسر أصلية (وحدة `crossvm` + العملية مسبقة
التجميع `CrossVMBridge`). السلاسل ذات الآلة الافتراضية الواحدة لا يمكنها
التعبير عن "حساب واحد، ثلاث آلات افتراضية، معاملة ذرّية واحدة" — فحِزم SDK
لديها لا تملك شيئًا لتغليفه. اكتب مرة واحدة، واستدعِ أي آلة افتراضية. راجع
[الاستدعاءات عبر الآلات الافتراضية](/sdk/guides/cross-vm).

---

## 3. آمن كموميًّا افتراضيًا

**اجعل المُوقِّع محميًّا بتشفير ما بعد الكم باستدعاء واحد.**

تفرض QoreChain التوقيعات الهجينة لما بعد الكم (ML-DSA-87 + الكلاسيكية) على
مستوى البروتوكول. وتجعل SDK اعتمادها أمرًا من سطر واحد: تحقّق، وسجّل، وانتقل
إلى التوقيع الهجين — مع شارة React تُظهر للمستخدمين أنهم محميّون.

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

**لماذا هذا فريد:** تشفير ما بعد الكم أصلي وإلزامي على QoreChain، وليس تجربة.
هذه أول SDK يكون فيها "الأمان الكمومي افتراضيًا" استدعاءً واحدًا مع شارة جاهزة
للاستخدام. راجع [الأمان الكمومي](/sdk/guides/quantum-safe).

---

## 4. حسابات موحّدة أصلية بمفاتيح eth — مفتاح واحد، ثلاثة عناوين، رصيد واحد

**مفتاح `eth_secp256k1` واحد هو هوية واحدة من 20 بايت على المسارات الثلاثة
كلها.** (SDK 0.6.0، السلسلة v3.1.83.)

```ts
import { deriveUnifiedAccount } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
account.cosmos; // "qor1…"  bech32 — Native lane
account.evm;    // "0x…"    EIP-55 — EVM lane
account.svm;    // base58   — SVM lane (same 20 bytes + 12 zero bytes)
// A deposit to ANY of the three lands in ONE balance,
// and the same key spends on every lane (signHybridEth on the Native path).
```

**لماذا هذا فريد:** في المنظومات متعددة الآلات الافتراضية في أماكن أخرى، لكل
بيئة تشغيل فضاء حسابات خاص بها وتبقى الأموال عالقة في كل مسار على حدة. أما
QoreChain فتعرض هوية واحدة من 20 بايت بثلاث صيغ مع رصيد واحد مشترك —
فالمحفظة لا "تملك أموالًا على مسار دون آخر" أبدًا. بل إن `connectPhantomUnified`
تُنشئ هذه الهوية بشكل غير وصائي (non-custodial) انطلاقًا من توقيع Phantom. راجع
[الحسابات الموحّدة](/sdk/concepts/accounts-pqc#unified-accounts).

---

## 5. مسارات المصادِقات (Authenticators) — إنفاق مفوَّض دون التخلي عن PQC

**مفتاح Phantom أو MetaMask مرتبط يُنفق من الحساب القانوني الذي يشترط PQC،
ضمن حدود، عبر مُرحِّل (relayer).** (SDK 0.7.0، السلسلة v3.1.85.)

```ts
import { buildPhantomExecuteCosmos } from "@qorechain/sdk";

// The Phantom key signs a domain-separated digest; a relayer pays fees and
// broadcasts. The external key NEVER produces an ML-DSA co-signature.
const msg = await buildPhantomExecuteCosmos({
  wallet: window.solana,
  relayer: relayerAddress,
  chainId: "qorechain-vladi",
  account: canonicalAccount, // the PQC-required owner
  to: recipient,
  amount: "100uqor",
  nonce, // per-authenticator sequence
});
```

**لماذا هذا فريد:** كل عملية إنفاق مقيّدة بتصنيف صلاحيات على السلسلة، وبحدود
`SpendingRule`، وبتاريخ انتهاء — وفق مبدأ الحد الأدنى من الامتيازات وقابلة
للإلغاء — بينما يبقى الحساب نفسه محميًّا بتشفير ما بعد الكم. راجع
[المصادِقات والإنفاق المفوَّض](/sdk/guides/authenticators).

---

## وكل شيء آخر أيضًا

إلى جانب الميزات التفاضلية الخمس، تغطي SDK كامل سطح السلسلة عبر
**TypeScript وPython وGo وRust وJava**: مُنشئات رسائل ذات أنواع محدّدة لكل
وحدة (بما في ذلك السلاسل الجانبية/سلاسل الدفع عبر `multilayer` والـ rollups
عبر `rdk`)، واستعلامات ذات أنواع محدّدة، ودورة حياة المعاملة، والاشتراكات،
ومحافظ المتصفح، وحزمة خطافات [`@qorechain/react`](/sdk/guides/react).

جاهز للبناء؟ ابدأ من [دليل البدء السريع](/sdk/quickstart).
