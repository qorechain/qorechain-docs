---
slug: /sdk/overview
title: نظرة عامة على QoreChain SDK
sidebar_label: نظرة عامة
sidebar_position: 1
---

# QoreChain SDK

إن QoreChain SDK هي حزمة التطوير الرسمية متعددة اللغات لبناء التطبيقات
اللامركزية على **QoreChain** — شبكة من الطبقة الأولى (Layer 1) آمنة كمومياً
وذات ثلاث آلات افتراضية.

تغطي هذه الوثائق كيفية تثبيت SDK، والاتصال بالشبكة، وقراءة الحالة على
السلسلة، واشتقاق الحسابات، وتوقيع المعاملات وإرسالها، والعمل مع كل واحدة من
الآلات الافتراضية في QoreChain.

## ما هي QoreChain؟

QoreChain هي سلسلة كتل من الطبقة الأولى تضم ثلاث بيئات تشغيل للعقود الذكية
من الدرجة الأولى على سلسلة واحدة:

- **CosmWasm** — عقود ذكية بتقنية Wasm عبر Cosmos SDK.
- **QoreChain EVM Engine** — تنفيذ متوافق مع Ethereum ‏(Solidity و viem
  و JSON-RPC القياسي).
- **SVM** — بيئة تشغيل متوافقة مع Solana مع واجهة JSON-RPC على نمط Solana.

الحسابات والأرصدة والرموز المميزة مشتركة بين بيئات التشغيل، كما تدعم السلسلة
IBC للتشغيل البيني عبر السلاسل.

### آمنة كمومياً بحكم التصميم

توفر QoreChain أساسيات التشفير ما بعد الكمومي (PQC) المبنية على
**ML-DSA-87** ‏(Dilithium-5، معيار FIPS 204). وإلى جانب التوقيع الكلاسيكي
بـ secp256k1، تدعم السلسلة وضعية توقيع **هجينة** تحمل فيها المعاملة توقيعاً
كلاسيكياً وتوقيعاً ما بعد كمومي *معاً*، بحيث تبقى صالحة وفق التحقق الكلاسيكي
اليوم مع اكتساب حماية ما بعد كمومية.

تتيح SDK اليوم توليد مفاتيح ML-DSA-87 والتوقيع والتحقق بها، إضافة إلى
اللبنات الأساسية للمعاملات الهجينة. راجع
[الحسابات وتوقيع PQC](/sdk/concepts/accounts-pqc) للتفاصيل. لا ادعاءات
تسويقية هنا — تتيح SDK بالضبط الأساسيات التي تنفذها السلسلة.

## ما الذي يميز هذه SDK

إلى جانب التكافؤ الكامل متعدد السلاسل، هناك ثلاث قدرات **ممكنة فقط على
QoreChain**، لأنها مبنية على ميزات بروتوكولية لا تملكها أي سلسلة أخرى من
الطبقة الأولى:

- **تقييم المخاطر المسبق بالذكاء الاصطناعي** — افحص المعاملة بالذكاء
  الاصطناعي على السلسلة قبل بثها. تُرجع `simulateWithRiskScore` تقدير الغاز
  إضافة إلى حكم بالمخاطر/الشذوذ صادر عن precompiles حتمية على EVM، بحيث
  تستطيع المحفظة أو التطبيق اللامركزي التحذير (أو المنع) *قبل* التوقيع. راجع
  [الفحص المسبق بالذكاء الاصطناعي](/sdk/guides/ai-preflight).
- **استدعاءات موحّدة عبر الآلات الافتراضية** — حساب واحد، ثلاث آلات
  افتراضية، معاملة واحدة. تستدعي `createCrossVMClient` عقداً على أي آلة
  افتراضية، وتحزم `callAtomic` عدة استدعاءات عبر الآلات الافتراضية في معاملة
  ذرية واحدة تُوقَّع مرة واحدة. راجع
  [الاستدعاءات عبر الآلات الافتراضية](/sdk/guides/cross-vm).
- **تجربة تطوير آمنة كمومياً** — اجعل المُوقِّع محمياً ما بعد كمومياً
  باستدعاء واحد قابل للتكرار (`ensurePqcRegistered` / `migrateToHybrid`)، مع
  شارة React جاهزة للاستخدام. راجع
  [الأمان الكمومي](/sdk/guides/quantum-safe).

وصلت قدرتان إضافيتان على مستوى السلسلة في 0.6.0 و 0.7.0:

- **حسابات موحّدة أصلية بنمط eth** — مفتاح `eth_secp256k1` واحد هو هوية
  واحدة من 20 بايت تُعرض بصيَغ `qor1…` و `0x…` وعنوان base58 لـ SVM، وكلها
  تتشارك رصيداً واحداً. راجع
  [الحسابات الموحّدة](/sdk/concepts/accounts-pqc#unified-accounts).
- **مسارات المصادقة (Authenticator lanes)** — اربط مفتاح Phantom أو
  MetaMask بالحساب القانوني الذي يتطلب PQC ودعه ينفق عبر مُرحِّل وفق شروط
  قائمة على أدنى الامتيازات ومحدودة الإنفاق وقابلة للإلغاء. راجع
  [المصادِقات والإنفاق المفوَّض](/sdk/guides/authenticators).

كما أن حزمة **`@qorechain/react`** الجديدة (مزوِّد، وخطافات hooks، و
`ConnectButton`، و `QuantumSafeBadge`) تجعل بناء تطبيق لامركزي آمن كمومياً
هو المسار الافتراضي — راجع
[دليل حزمة React](/sdk/guides/react). وللاطلاع على الحجة الكاملة، اقرأ
[لماذا QoreChain SDK](/sdk/why).

## عائلة SDK

تُشحن SDK كعائلة من الحزم لتتمكن من البناء بلغتك المفضلة. وتتشارك الحزم
نفس الإعدادات المسبقة للشبكة، ومخططات الاشتقاق، وحسابات وحدات العملة،
وواجهات القراءة.

| الحزمة | اللغة | التثبيت | الحالة |
| --- | --- | --- | --- |
| `@qorechain/sdk` | TypeScript | `npm i @qorechain/sdk` | منشورة (npm، الإصدار v0.7.0) |
| `qorechain-sdk` | Python | `pip install qorechain-sdk` (الاستيراد باسم `qorsdk`) | منشورة (PyPI، الإصدار v0.7.0) |
| `qorechain-sdk` (وحدة Go) | Go | `go get github.com/qorechain/qorechain-sdk/packages/go/...` | منشورة (وكيل Go، الوسم `packages/go/v0.7.0`) |
| `qorechain-sdk` | Rust | `cargo add qorechain-sdk` (الاستيراد باسم `qorechain`) | منشورة (crates.io، آخر إصدار منشور؛ الإصدار 0.7.0 من المستودع) |
| `io.github.qorechain:qorechain-sdk` | Java | `io.github.qorechain:qorechain-sdk:0.7.0` | منشورة (Maven Central، الإصدار v0.7.0) |
| `@qorechain/evm` | TypeScript (محوِّل EVM) | `npm i @qorechain/evm viem` | منشورة (npm، الإصدار v0.7.0) |
| `@qorechain/svm` | TypeScript (محوِّل SVM) | `npm i @qorechain/svm @solana/web3.js` | منشورة (npm، الإصدار v0.7.0) |
| `@qorechain/react` | TypeScript (حزمة React) | `npm i @qorechain/react` | منشورة (npm، الإصدار v0.7.0) |
| `create-qorechain-dapp` | CLI | `npm create qorechain-dapp` | منشورة (npm، الإصدار v0.7.0) |

> توزيعة Python تُثبَّت باسم `qorechain-sdk` لكنها **تُستورَد باسم
> `qorsdk`**. جميع العملاء منشورون في سجلاتهم — راجع
> [التثبيت](/sdk/install) لأوامر كل لغة.

النواة المكتوبة بـ TypeScript ‏(`@qorechain/sdk`) هي أساس الأمثلة في هذه
الوثائق. ويصل عملاء Python و Go و Rust و Java إلى **تكافؤ كامل مع السلسلة
الأصلية** مثل TypeScript: الإعدادات المسبقة للشبكة، وأدوات وحدات
العملة/العناوين، واشتقاق الحسابات الهرمي HD ‏(native/EVM/SVM)، وتوقيع PQC
‏(ML-DSA-87)، ومُنشئات رسائل منمَّطة لكل وحدة مخصصة إضافة إلى وحدات Cosmos
القياسية، وعملاء استعلام منمَّطون، ودورة حياة المعاملة الكاملة (الغاز
التلقائي، وفك ترميز الأخطاء، وتتبع المعاملات، والبحث في الكتل/المعاملات)،
والمعاملات الهجينة ما بعد الكمومية، واشتراكات WebSocket. جميع هؤلاء العملاء
**منشورون**: ‏TypeScript على npm ‏(`@qorechain/sdk` 0.7.0)، و Python على
PyPI ‏(`qorechain-sdk` 0.7.0، الاستيراد باسم `qorsdk`)، و Go على وكيل
الوحدات (الوسم `packages/go/v0.7.0`)، و Rust على crates.io
‏(`qorechain-sdk`، آخر إصدار منشور — نشر الحزمة 0.7.0 على crates.io ما يزال
معلقاً، لذا ثبّت من crates.io أو من المستودع)، و Java على Maven Central
‏(`io.github.qorechain:qorechain-sdk` 0.7.0). أما محوِّلات التنفيذ EVM/SVM
‏(`@qorechain/evm` و `@qorechain/svm`، وكلاهما 0.7.0)، وحزمة
`@qorechain/react` ‏(0.7.0)، وأداة السقالة `create-qorechain-dapp` ‏(0.7.0)
فهي خاصة بـ TypeScript فقط ومنشورة كذلك على npm.

## الجديد في 0.6 و 0.7

**0.6.0 — الحسابات الموحّدة الأصلية بنمط eth (السلسلة v3.1.83).** مفتاح
`eth_secp256k1` واحد هو هوية واحدة من 20 بايت تُعرض بجميع ترميزات العناوين
الثلاثة، وتتشارك رصيداً واحداً قابلاً للإنفاق على كل مسار:

```ts
import { deriveUnifiedAccount } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
account.cosmos; // "qor1…"   (bech32, Native lane)
account.evm;    // "0x…"     (EIP-55, EVM lane)
account.svm;    // base58    (20 bytes + 12 zero bytes)
```

التوقيع على المسار الأصلي بنفس المفتاح يتم عبر `signClassicalEth` /
`signHybridEth`، وتشتق `connectPhantomUnified` حساباً موحّداً غير وصائي من
توقيع Phantom حتمي. أما الاشتقاق التقليدي بنوع العملة 118 عبر
`deriveNativeAccount` فيبقى دون تغيير. راجع
[الحسابات الموحّدة](/sdk/concepts/accounts-pqc#unified-accounts).

**0.6.1 — إصلاح حرج للإجماع.** أصبح امتداد جسم المعاملة
`PQCHybridSignature` الآن مُرمَّزاً بصيغة protobuf (كان مُرمَّزاً بصيغة JSON
ويُرفض عند CheckTx). المعاملات الهجينة المبنية بإصدار SDK ‏≤ 0.6.0
**تُرفض على السلسلة** — قم بالترقية.

**0.7.0 — مسارات المصادقة (السلسلة v3.1.85).** يمكن لمفتاح Phantom مرتبط
‏(ed25519) أو MetaMask ‏(secp256k1، عبر عنوان من 20 بايت) أن ينفق من الحساب
القانوني الذي يتطلب PQC عبر مُرحِّل، وفق شروط قائمة على أدنى الامتيازات
ومحدودة الإنفاق وقابلة للإلغاء: مُنشئات `MsgExecuteEVM` /
`MsgExecuteCosmos` / `MsgRotatePQCKey`، ومساعدات مطابقة للبايت
`evmAuthSignBytes` / `cosmosAuthSignBytes` / `rotationSignBytes`، واستعلام
`permissionSchema`، ورموز أخطاء مفكوكة الترميز، ومُنشئات محافظ بـ
TypeScript ‏(`buildPhantomExecuteCosmos` و `buildMetaMaskExecuteEvm`، …).
شرح كامل مع أمثلة قابلة للنسخ واللصق:
[المصادِقات والإنفاق المفوَّض](/sdk/guides/authenticators).

## إلى أين تتجه بعد ذلك

- [لماذا QoreChain SDK](/sdk/why) — القدرات الخمس الفريدة في QoreChain.
- [التثبيت](/sdk/install) — تعليمات التثبيت لكل لغة.
- [البدء السريع](/sdk/quickstart) — الاتصال، وقراءة رصيد، وإرسال تحويل.
- [المفاهيم: البنية](/sdk/concepts/architecture) — نموذج الآلات الافتراضية
  الثلاث.
- [المفاهيم: الحسابات وتوقيع PQC](/sdk/concepts/accounts-pqc) — المفاتيح
  والتوقيع ما بعد الكمومي.
- [الأدلة](/sdk/guides/evm) — إرشادات عملية لكل آلة افتراضية.
- [المصادِقات والإنفاق المفوَّض](/sdk/guides/authenticators) — مفاتيح
  Phantom/MetaMask المرتبطة تنفق عبر مُرحِّل.
- [مرجع الشبكة ونقاط النهاية](/sdk/reference/network) — معرِّف السلسلة،
  والمنافذ، والرمز المميز.
- [الأمثلة](/sdk/examples) — مقتطفات قابلة للتشغيل والنسخ واللصق.
- [مرجع الشبكة ونقاط النهاية](/sdk/reference/network) معروض أيضاً في
  [الشبكات](/appendix/networks).
