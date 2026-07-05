---
slug: /sdk/faq
title: الأسئلة الشائعة واستكشاف الأخطاء وإصلاحها
sidebar_label: الأسئلة الشائعة
sidebar_position: 8
---

# الأسئلة الشائعة واستكشاف الأخطاء وإصلاحها

## هل الشبكة الرئيسية (mainnet) قيد التشغيل؟

نعم. الشبكة الرئيسية **قيد التشغيل** (معرّف السلسلة `qorechain-vladi`). كما يظل الإعداد المسبق لشبكة الاختبار
(`qorechain-diana`) متاحًا. كلا الإعدادين المسبقين يأتيان بنقاط نهاية افتراضية على localhost؛
اختر الشبكة عبر `createClient({ network: "mainnet" })` ثم
استبدل `endpoints` بعناوين URL الخاصة بعقدتك. راجع
[الشبكة ونقاط النهاية](/sdk/reference/network).

## لماذا تتوجه استدعاءاتي إلى localhost؟

يستخدم `createClient()` نقاط نهاية **localhost** افتراضيًا. للتواصل مع عقدة حقيقية،
مرِّر كائن `endpoints`:

```ts
const client = createClient({
  endpoints: {
    rest: "https://api-testnet.qore.host",
    rpc: "https://rpc-testnet.qore.host",
    evmRpc: "https://evm-testnet.qore.host",
  },
});
```

يحتاج مسار التوقيع (`connectTx`) إلى نقطة نهاية الإجماع **`rpc`**؛ كما تستخدمها
قراءات CosmWasm أيضًا. تستخدم قراءات REST نقطة `rest`؛ بينما تستخدم استدعاءات EVM و `qor_` نقطة `evmRpc`.

## "Cannot find module 'viem'" / "'@solana/web3.js'"

هذه **تبعيات نظيرة (peer dependencies)** لحزمتي `@qorechain/evm` و `@qorechain/svm`
على التوالي. ثبّتها في مشروعك:

```bash
npm i @qorechain/evm viem
npm i @qorechain/svm @solana/web3.js
```

## استدعاء precompile يُظهر الخطأ "feature not present"

توجد الـ precompiles الخاصة بـ EVM فقط على العقد التي تشغّل QoreChain EVM Engine. على
عقدة EVM عادية تفشل هذه الاستدعاءات. إذا كنت تستهدف عقدًا غير متجانسة، فغلّف كل
استدعاء precompile وعالج الخطأ لكل استدعاء على حدة.

## مبالغي غير صحيحة بمعامل مليون

يمتلك QOR وحدات أساس `uqor` بمقدار **10^6**. استخدم `toBase` / `fromBase` وأجرِ جميع العمليات الحسابية
بوحدات الأساس:

```ts
toBase("1.5");       // "1500000"
fromBase("1500000"); // "1.5"
```

لاحظ أن بيئة تشغيل EVM تمثّل QOR بـ **18** منزلة عشرية (وفق اصطلاح EVM)، وهو أمر
مختلف عن أساس `uqor` في QoreChain Native البالغ 10^6.

## ما الحزم المنشورة، وأين؟

جميعها. النواة المكتوبة بـ TypeScript (‏`@qorechain/sdk`)، ومحوّلات EVM/SVM
(‏`@qorechain/evm` و `@qorechain/svm`)، وحزمة React (‏`@qorechain/react`)، وأداة
التهيئة `create-qorechain-dapp` متوفرة على npm بالإصدار `0.7.0`؛ وعميل Python
متوفر على PyPI (‏`pip install qorechain-sdk` بالإصدار `0.7.0`، ويُستورد باسم `qorsdk`)؛ وعميل Go
متوفر على وكيل الوحدات
(`go get github.com/qorechain/qorechain-sdk/packages/go/...`، بالوسم
`packages/go/v0.7.0`)؛ وعميل Java متوفر على Maven Central
(‏`io.github.qorechain:qorechain-sdk:0.7.0`). أما عميل Rust فمتوفر على crates.io
(‏`cargo add qorechain-sdk`) عند **أحدث إصدار منشور للـ crate**، والذي
لا يزال حاليًا متأخرًا عن 0.7.0 — ثبّته من crates.io أو من المستودع. راجع
[التثبيت](/sdk/install) للاطلاع على الأوامر الكاملة لكل لغة.

## عبارتي الاسترجاعية (mnemonic) مرفوضة

تتحقق SDK من قائمة كلمات BIP-39 **ومن** المجموع الاختباري (checksum) معًا قبل اشتقاق
أي مفتاح، لذا فإن العبارة التي تحتوي على خطأ إملائي تُطلق استثناءً بدلًا من أن تنتج بصمت
حسابًا خاطئًا. أعد التحقق من الكلمات؛ واستخدم `validateMnemonic` لاختبار العبارة.

## المعاملات الهجينة (PQC)

إرسال المعاملات الهجينة (الكلاسيكية + ML-DSA-87) أصبح **قيد التشغيل وإلزاميًا** على
مسار QoreChain Native — المعاملات الكلاسيكية فقط على المسار Native تُرفض على السلسلة (السلسلة
v3.1.85). قبل أن تجتاز المعاملة الهجينة تحقق PQC، يجب أن يكون المفتاح العام لـ PQC الخاص بالموقّع
مسجلًا (`MsgRegisterPQCKeyV2`)، أو يمكنك ضبط
`includePqcPublicKey: true` لتضمينه من أجل التسجيل التلقائي عند أول استخدام.
تقبل السلسلة توقيعات ML-DSA-87 **الحتمية فقط** (توقّع SDK
بشكل حتمي افتراضيًا منذ 0.5.1)؛ أما التوقيعات المحوّطة (hedged) فتفشل برمز `pqc`
رقم 21 (`hybrid_verify_failed`). راجع
[الحسابات وتوقيع PQC](/sdk/concepts/accounts-pqc).

## معاملاتي الهجينة تفشل عند CheckTx بخطأ في تحليل المعاملة

قم بترقية SDK. الإصدارات **0.6.0 وما قبلها** كانت تُسلسل امتداد جسم المعاملة
`/qorechain.pqc.v1.PQCHybridSignature` بصيغة JSON، وهو ما يرفضه
مفكك ترميز المعاملات في السلسلة عند CheckTx. منذ **0.6.1** أصبح الامتداد مرمّزًا بـ protobuf
(تبدأ القيمة بـ `0x08`) في جميع اللغات الخمس — المعاملات الهجينة
المبنية بإصدارات أقدم تُرفض على السلسلة، في جميع المسارات (بما في ذلك
eth-native).

## عملية الإنفاق عبر المصادِق (authenticator) مرفوضة بالخطأ `authenticator_replay`

قيمة nonce غير صحيحة. يجب أن يكون `MsgExecuteEVM.nonce` هو nonce الخاص بـ EVM
**الحالي** للحساب (المُرحِّل حساب مختلف، لذا **لا** تُضِف 1)؛
أما `MsgExecuteCosmos.nonce` فهو **التسلسل الخاص بكل مصادِق** للزوج
`(account, pubkey)`، وهو عدّاد تخزين منفصل. أعد جلب القيمة ووقّع من جديد.
تُفكّك أخطاء المصادِق الأخرى عبر `decodeTxError`: رموز `abstractaccount`
هي 5 (`spending_limit_exceeded`) و 6 (`session_key_expired`) و
10 (`permission_denied`). راجع
[المصادِقات والإنفاق المفوَّض](/sdk/guides/authenticators).
