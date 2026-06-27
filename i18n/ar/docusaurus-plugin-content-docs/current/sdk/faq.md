---
slug: /sdk/faq
title: الأسئلة الشائعة واستكشاف الأخطاء وإصلاحها
sidebar_label: الأسئلة الشائعة
sidebar_position: 8
---

# الأسئلة الشائعة واستكشاف الأخطاء وإصلاحها

## هل الشبكة الرئيسية (mainnet) حيّة؟

نعم. الشبكة الرئيسية **حيّة** (معرّف السلسلة `qorechain-vladi`). كما تظل إعدادات شبكة الاختبار
(`qorechain-diana`) متاحة أيضًا. توفّر كلا الإعدادين قيمًا افتراضية لنقاط نهاية localhost؛
اختر الشبكة عبر `createClient({ network: "mainnet" })` وتجاوز
`endpoints` بعناوين URL لعقدتك. راجع
[الشبكة ونقاط النهاية](/sdk/reference/network).

## لماذا تتجه استدعاءاتي إلى localhost؟

تستخدم `createClient()` افتراضيًا نقاط نهاية **localhost**. للتحدث إلى عقدة حقيقية،
مرّر كائن `endpoints`:

```ts
const client = createClient({
  endpoints: {
    rest: "https://rest.testnet.example",
    rpc: "https://rpc.testnet.example",
    evmRpc: "https://evm.testnet.example",
  },
});
```

يحتاج مسار التوقيع (`connectTx`) إلى نقطة نهاية الإجماع **`rpc`**؛
كما تستخدمها قراءات CosmWasm. قراءات REST تستخدم `rest`؛ واستدعاءات EVM و`qor_` تستخدم `evmRpc`.

## "Cannot find module 'viem'" / "'@solana/web3.js'"

هذه **اعتماديات نظيرة (peer dependencies)** لكل من `@qorechain/evm` و`@qorechain/svm`
على التوالي. ثبّتها في مشروعك:

```bash
npm i @qorechain/evm viem
npm i @qorechain/svm @solana/web3.js
```

## استدعاء precompile يُطلق "feature not present"

توجد precompiles الخاصة بـ EVM فقط على العقد التي تشغّل QoreChain EVM Engine. على
عقدة EVM عادية تفشل تلك الاستدعاءات. إذا كنت تستهدف عقدًا غير متجانسة، فلفّ كل
استدعاء precompile وعالج الخطأ لكل استدعاء على حدة.

## مقاديري مختلفة بمعامل مليون

يملك QOR **10^6** وحدة أساسية `uqor`. استخدم `toBase` / `fromBase` ونفّذ كل العمليات الحسابية
بالوحدات الأساسية:

```ts
toBase("1.5");       // "1500000"
fromBase("1500000"); // "1.5"
```

لاحظ أن بيئة تشغيل EVM تمثّل QOR بـ **18** خانة عشرية (اصطلاح EVM)، وهو ما
يختلف عن الأساس `uqor` في Cosmos البالغ 10^6.

## أيّ الحزم منشورة، وأين؟

جميعها. النواة TypeScript (`@qorechain/sdk`) ومحوّلات EVM/SVM
(`@qorechain/evm`، `@qorechain/svm`) موجودة على npm بالإصدار `0.3.0`؛ وعميل Python
موجود على PyPI (`pip install qorechain-sdk` بالإصدار `0.3.1`، يُستورد باسم `qorsdk`)؛ وعميل Rust
موجود على crates.io (`cargo add qorechain-sdk` بالإصدار `0.3.0`)؛ وعميل Go
موجود على وسيط الوحدات (`go get github.com/qorechain/qorechain-sdk/packages/go/...`).
راجع [التثبيت](/sdk/install) للأوامر الكاملة لكل لغة.

## عبارتي الاستذكارية مرفوضة

يتحقق الـ SDK من قائمة كلمات BIP-39 **و** من المجموع الاختباري (checksum) قبل اشتقاق
أي مفتاح، لذا فإن العبارة المكتوبة بخطأ مطبعي تُطلق خطأً بدلًا من إنتاج الحساب الخاطئ بصمت.
أعد التحقق من الكلمات؛ استخدم `validateMnemonic` لاختبار عبارة.

## المعاملات الهجينة (PQC)

تتوفر اليوم وظائف التوقيع/التحقق المحلية بـ ML-DSA-87 والمساعِدات لبناء المعاملات الهجينة.
قبل أن تتحقق معاملة هجينة عبر PQC على السلسلة، يجب أن يكون المفتاح العام PQC الخاص بالموقّع
مسجّلًا (`MsgRegisterPQCKey`)، أو يجب أن تضبط
`includePqcPublicKey: true` لتضمينه من أجل التسجيل التلقائي. يجري إنجاز
الإرسال الهجين الكامل للشبكة الحيّة. راجع
[الحسابات والتوقيع PQC](/sdk/concepts/accounts-pqc).
