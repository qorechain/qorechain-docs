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

**افحص المعاملة بذكاء اصطناعي على السلسلة قبل بثّها** (يتطلب تفعيل العمليات
المسبقة التجميع الخاصة بالذكاء الاصطناعي على الشبكة المستهدفة، وهي غير مفعّلة
بعد على الشبكات العامة).

توفّر QoreChain تحليل المخاطر بالذكاء الاصطناعي كعمليات مسبقة التجميع
(precompiles) على EVM. تستدعيها SDK نيابة عنك وتعيد الغاز مع حكم
المخاطر/الشذوذ في استدعاء واحد — بحيث تستطيع المحفظة أو التطبيق اللامركزي
التحذير (أو الحظر) *قبل* التوقيع. العمليات المسبقة التجميع الخاصة بالذكاء
الاصطناعي **غير مفعّلة بعد** على الشبكة الرئيسية أو شبكة الاختبار (راجع
[عمليات EVM المسبقة التجميع: حالة الشبكة](/developer-guide/evm-precompiles#network-status)).

```ts
import { createEvmClient, simulateWithRiskScore } from "@qorechain/evm";

const { publicClient } = await createEvmClient({ endpoints: { evmRpc } });

const preflight = await simulateWithRiskScore(publicClient, {
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

**لماذا هذا مختلف:** صُمّم التقييم ليعمل *داخل السلسلة نفسها* كعملية مسبقة
التجميع حتمية (`aiRiskScore` على العنوان `0x…0B01`، و`aiAnomalyCheck` على العنوان
`0x…0B02`)، وليس كخدمة خارج السلسلة. إلى أن يتم تفعيل هذه العمليات المسبقة
التجميع، تُطلق الدوال المساعدة أعلاه خطأً على الشبكات العامة
(`returned no data ("0x")`؛ والعمليات المسبقة التجميع الثلاث المفعّلة على شبكة الاختبار
هي الخاصة بـ PQC والإجماع، وليست هذه). راجع [الفحص المسبق بالذكاء الاصطناعي](/sdk/guides/ai-preflight).

---

## 2. استدعاءات موحّدة عبر الآلات الافتراضية — حساب واحد، ثلاث آلات افتراضية، معاملة واحدة

**استدعِ عقدًا على أي آلة افتراضية، وادمج استدعاءات عبر الآلات الثلاث كلها بشكل ذرّي.**

تشغّل QoreChain عقود QoreChain Native وEVM وSVM على السلسلة نفسها مع جسر أصلي عابر
للآلات الافتراضية. تعرض SDK واجهة واحدة لاستدعاء أي منها — ولحزم عدة
استدعاءات عابرة للآلات الافتراضية في معاملة ذرّية واحدة تُوقَّع مرة واحدة.

```ts
import { connectQueryClients, createCrossVMClient } from "@qorechain/sdk";

// rpcClient: a connected consensus-RPC client (the CosmJS RPC client type).
const crossVM = createCrossVMClient(tx, { query: connectQueryClients(rpcClient).crossvm });

// Call an EVM contract from a native account (payload ABI-encoded for you).
await crossVM.call({
  targetVm: "evm",
  targetContract: "0xToken…",
  evm: { abi, functionName: "transfer", args: [recipient, amount] },
});

// One signature, three VMs, atomic: EVM → SVM → QoreChain Native.
await crossVM.callAtomic([
  { targetVm: "evm", targetContract: "0x…", evm: { abi, functionName: "approve", args } },
  { targetVm: "svm", targetContract: "Prog…", svm: { data } },
  { targetVm: "cosmwasm", targetContract: "qor1…", cosmwasm: { swap: {} } },
]);
```

**لماذا هذا مختلف:** تشغّل QoreChain ثلاث آلات افتراضية متعايشة مع وحدة جسر
أصلية (`crossvm`، إضافةً إلى العملية مسبقة التجميع `CrossVMBridge` متى تم
تفعيلها؛ وهي غير مفعّلة على أيٍّ من الشبكتين بعد)، ولذلك تستطيع واجهة SDK واحدة مخاطبة الآلات الثلاث كلها. السلاسل ذات
الآلة الافتراضية الواحدة ليس لديها ما يماثل ذلك لتغليفه. واليوم يقتصر مدى
الاستدعاء على المسار الذي يستهدفه: فرسالة `MsgCrossVMCall` معطّلة على الشبكة
الرئيسية، ومعاملات SVM معطّلة، ورفع عقود QoreChain Native وإنشاء نسخ منها يتطلبان إذنًا (والإنشاء مفتوح على شبكة الاختبار).
راجع [الاستدعاءات عبر الآلات الافتراضية](/sdk/guides/cross-vm).

---

## 3. التوقيع الهجين افتراضيًا

**سجّل مفتاح ML-DSA-87 للمُوقِّع باستدعاء واحد.**

تفرض QoreChain التوقيعات الهجينة لما بعد الكم (ML-DSA-87 + الكلاسيكية) على
مستوى البروتوكول. وتجعل SDK اعتمادها أمرًا من سطر واحد: تحقّق، وسجّل، وانتقل
إلى التوقيع الهجين — مع شارة React تُظهر ما إذا كان للعنوان مفتاح مسجّل.

```ts
import { ensurePqcRegistered, migrateToHybrid } from "@qorechain/sdk";

// Registers the signer's ML-DSA-87 key on-chain unless the chain already has it:
// it reads the status over REST first and never registers blind.
const rest = "https://api.qore.host";
const { alreadyRegistered, txHash } = await ensurePqcRegistered(tx, { pqcKeypair, rest });

// Switch the signing path to hybrid (classical + post-quantum).
const hybrid = await migrateToHybrid(tx, { pqcKeypair, rest });
await hybrid.signAndBroadcastHybrid({
  registry, signer, messages, fee, chainId, accountNumber, sequence,
  rest: "https://api.qore.host", // resolves the v1/v2 PQC sign-bytes form
  transport,
});
```

```tsx
import { QuantumSafeBadge } from "@qorechain/react";

// Shows a status badge when the address has a registered PQC key
// (read over REST, so it works on the public endpoints from `@qorechain/react` 0.9.0 and later).
<QuantumSafeBadge address={account.address} />
```

**لماذا هذا مهم:** تشفير ما بعد الكم أصلي وإلزامي على المسار الأصلي (Native) في
QoreChain، وليس تجربة، وتختزل SDK اعتماده في استدعاء تسجيل واحد ومسار إرسال
هجين. التسجيل صريح: لا يوجد تسجيل تلقائي عند أول معاملة. راجع
[التوقيع الهجين](/sdk/guides/quantum-safe).

---

## 4. حسابات موحّدة أصلية بمفاتيح eth — مفتاح واحد، ثلاثة عناوين، رصيد واحد

**مفتاح `eth_secp256k1` واحد هو هوية واحدة من 20 بايت على المسارات الثلاثة
كلها.** (SDK 0.6.0، السلسلة v3.1.83.) مسار معاملات SVM معطّل حاليًا على مستوى
الشبكة كلها، ومسار EVM يحتاج إلى
[نافذة تفويض](/sdk/guides/evm#evm-window)؛ أما الرصيد المشترك وربط العناوين
فيبقيان قائمين في كل الأحوال.

```ts
import { deriveUnifiedAccount } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
account.cosmos; // "qor1…"  bech32 — Native lane
account.evm;    // "0x…"    EIP-55 — EVM lane
account.svm;    // base58   — SVM lane (same 20 bytes + 12 zero bytes)
// A deposit to ANY of the three lands in ONE balance,
// and the same key signs on every enabled lane (signHybridEth on the Native path).
```

**لماذا هذا فريد:** في المنظومات متعددة الآلات الافتراضية في أماكن أخرى، لكل
بيئة تشغيل فضاء حسابات خاص بها وتبقى الأموال عالقة في كل مسار على حدة. أما
QoreChain فتعرض هوية واحدة من 20 بايت بثلاث صيغ مع رصيد واحد مشترك —
فالمحفظة لا "تملك أموالًا على مسار دون آخر" أبدًا. ويمكن ربط محفظة خارجية مثل Phantom بهذه الهوية كمُصادِق محدود الصلاحيات
([المُصادِقات](/sdk/guides/authenticators)). راجع
[الحسابات الموحّدة](/sdk/concepts/accounts-pqc#unified-accounts).

---

## 5. مسارات المصادِقات (Authenticators) — إنفاق مفوَّض دون التخلي عن PQC

**مفتاح Phantom أو MetaMask مرتبط يُنفق من الحساب القانوني الذي يشترط PQC،
ضمن حدود، عبر مُرحِّل (relayer).** (SDK 0.7.0، السلسلة v3.1.85.)

:::caution غير متاح على الشبكة الرئيسية بعد
وحدة `abstractaccount` معطّلة على `qorechain-vladi`
(يعيد `GET /qorechain/abstractaccount/v1/config` القيمة `"enabled": false`)،
وابتداءً من إصدار السلسلة v3.2.0 يُفرض هذا الإعداد على كل مسار، وبالتالي لا
يمكن على الشبكة الرئيسية ربط مفتاح ولا استخدام المسارات أدناه. والوحدة مفعّلة على
شبكة الاختبار `qorechain-diana` (جرى التحقق في 27 أكتوبر 2026). راجع
[دليل المُصادِقات](/sdk/guides/authenticators).
:::

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

**لماذا هذا مهم:** متى تم تفعيل الوحدة، تصبح كل عملية إنفاق مقيّدة بتصنيف
صلاحيات على السلسلة، وبحدود `SpendingRule`، وبتاريخ انتهاء — وفق مبدأ الحد
الأدنى من الامتيازات وقابلة للإلغاء — بينما يبقى الحساب نفسه محميًّا بتشفير ما
بعد الكم. راجع
[المصادِقات والإنفاق المفوَّض](/sdk/guides/authenticators).

---

## وكل شيء آخر أيضًا

إلى جانب الميزات التفاضلية الخمس، تغطي SDK كامل سطح السلسلة عبر
**TypeScript وPython وGo وRust وJava**: مُنشئات رسائل ذات أنواع محدّدة لكل
وحدة (بما في ذلك السلاسل الجانبية/سلاسل الدفع عبر `multilayer` والـ rollups
عبر `rdk`)، واستعلامات ذات أنواع محدّدة، ودورة حياة المعاملة، والاشتراكات،
ومحافظ المتصفح، وحزمة خطافات [`@qorechain/react`](/sdk/guides/react).

جاهز للبناء؟ ابدأ من [دليل البدء السريع](/sdk/quickstart).
