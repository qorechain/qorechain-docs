---
slug: /sdk/faq
title: الأسئلة الشائعة واستكشاف الأخطاء
sidebar_label: الأسئلة الشائعة
sidebar_position: 8
---

# الأسئلة الشائعة واستكشاف الأخطاء وإصلاحها

## هل الشبكة الرئيسية مُفعّلة؟

نعم. الشبكة الرئيسية **مُفعّلة** (معرّف السلسلة `qorechain-vladi`). لا تزال نسخة
الشبكة الاختبارية المُعدة مسبقًا (`qorechain-diana`) متاحة أيضًا. كلا الإعدادين
يستخدمان نقاط نهاية `localhost` افتراضيًا؛ اختر الشبكة عبر
`createClient({ network: "mainnet" })` واستبدل `endpoints` بعناوين URL الخاصة
بعُقدك. راجع [الشبكة ونقاط النهاية](/sdk/reference/network).

## لماذا تصل طلباتي إلى localhost؟

تستخدم `createClient()` نقاط نهاية **localhost** افتراضيًا. للتواصل مع عقدة
حقيقية، مرّر كائن `endpoints`:

```ts
const client = createClient({
  endpoints: {
    rest: "https://api-testnet.qore.host",
    rpc: "https://rpc-testnet.qore.host",
    evmRpc: "https://evm-testnet.qore.host",
  },
});
```

يحتاج مسار التوقيع (`connectTx`) إلى نقطة نهاية الإجماع **`rpc`**؛ وتستخدمها
أيضًا عمليات قراءة CosmWasm. عمليات قراءة REST تستخدم `rest`؛ واستدعاءات EVM
و`qor_` تستخدم `evmRpc`.

## "Cannot find module 'viem'" / "'@solana/web3.js'"

هذه **تبعيات نظيرة (peer dependencies)** لحزمتَي `@qorechain/evm` و
`@qorechain/svm` على التوالي. ثبّتها في مشروعك:

```bash
npm i @qorechain/evm viem
npm i @qorechain/svm @solana/web3.js
```

## استدعاء precompile يُطلق خطأ "feature not present"

توجد الـ precompiles الخاصة بـ EVM فقط على العُقد التي تُشغّل محرك QoreChain
EVM. على عقدة EVM عادية، تفشل هذه الاستدعاءات. إذا كنت تستهدف عُقدًا غير
متجانسة، لفّ كل استدعاء precompile وعالج الخطأ لكل استدعاء على حدة.

## المبالغ لديّ تختلف بمقدار مليون

تحتوي وحدة QOR على **10^6** من وحدات `uqor` الأساسية. استخدم `toBase` /
`fromBase` وأجرِ كل الحسابات بالوحدات الأساسية:

```ts
toBase("1.5");       // "1500000"
fromBase("1500000"); // "1.5"
```

لاحظ أن بيئة تشغيل EVM تمثّل QOR بـ **18** منزلة عشرية (وفق اصطلاح EVM)، وهذا
يختلف عن الوحدة الأساسية `uqor` في المسار الأصلي (Native) البالغة 10^6.

## ما هي الحزم المنشورة، وأين؟

جميعها. نواة TypeScript (`@qorechain/sdk`)، ومحوّلات EVM/SVM
(`@qorechain/evm`، `@qorechain/svm`)، وحزمة React (`@qorechain/react`)، وأداة
البناء `create-qorechain-dapp` متوفرة على npm بالإصدار `0.7.0`؛ وعميل Python
متوفر على PyPI (`pip install qorechain-sdk` بالإصدار `0.7.0`، والاستيراد
`qorsdk`)؛ وعميل Go متوفر على وسيط الوحدات (module proxy)
(`go get github.com/qorechain/qorechain-sdk/packages/go/...`، بالوسم
`packages/go/v0.7.0`)؛ وعميل Java متوفر على Maven Central
(`io.github.qorechain:qorechain-sdk:0.7.0`). أما عميل Rust فمتوفر على
crates.io (`cargo add qorechain-sdk`) بأحدث إصدار صندوق (crate) منشور، وهو
حاليًا متأخر عن 0.7.0 — ثبّته من crates.io أو من المستودع. راجع
[التثبيت](/sdk/install) للاطلاع على أوامر كل لغة كاملةً.

## عبارتي التذكيرية (mnemonic) مرفوضة

تتحقق الـ SDK من قائمة كلمات BIP-39 **ومن رقم التحقق (checksum)** معًا قبل
اشتقاق أي مفتاح، بحيث تُطلق العبارة المكتوبة بخطأ إملائي خطأً بدلاً من إنتاج
حساب خاطئ بصمت. تحقق من الكلمات مجددًا؛ واستخدم `validateMnemonic` لاختبار
العبارة.

## معاملات PQC الهجينة

الإرسال الهجين (الكلاسيكي + ML-DSA-87) **مُفعّل وإلزامي** على المسار الأصلي
(Native) — تُرفض معاملات Native الكلاسيكية فقط على السلسلة (إصدار السلسلة
v3.1.95). قبل أن تنجح المعاملة الهجينة في التحقق عبر PQC، يجب تسجيل المفتاح
العام الخاص بـ PQC للموقّع (`MsgRegisterPQCKeyV2`)، أو يمكنك ضبط
`includePqcPublicKey: true` لتضمينه من أجل التسجيل التلقائي عند أول استخدام.
تقبل السلسلة **فقط** توقيعات ML-DSA-87 الحتمية (deterministic) (تُوقّع الـ SDK
بشكل حتمي افتراضيًا منذ الإصدار 0.5.1)؛ أما التوقيعات غير الحتمية (hedged)
فتفشل برمز `pqc` رقم 21 (`hybrid_verify_failed`). راجع
[الحسابات وتوقيع PQC](/sdk/concepts/accounts-pqc).

## معاملاتي الهجينة تفشل عند CheckTx بخطأ تحليل (parse) للمعاملة

قم بترقية الـ SDK. الإصدارات **0.6.0 وما قبلها** كانت تُسلسل (JSON-serialize)
امتداد جسم المعاملة `/qorechain.pqc.v1.PQCHybridSignature`، وهو ما يرفضه
مُفكِّك معاملات السلسلة عند CheckTx. ومنذ الإصدار **0.6.1** أصبح الامتداد
مُرمَّزًا بصيغة protobuf (تبدأ القيمة بـ `0x08`) في جميع اللغات الخمس —
المعاملات الهجينة المُنشأة بإصدارات أقدم تُرفض على السلسلة، في كل مسار
(بما في ذلك eth-native).

## إنفاق المُخوِّل (authenticator) لديّ مرفوض برمز `authenticator_replay`

الـ nonce غير صحيح. يجب أن يكون `MsgExecuteEVM.nonce` هو nonce EVM **الحالي**
للحساب (الموزّع/relayer حساب مختلف، لذا لا تُضِف 1)؛ أما `MsgExecuteCosmos.nonce`
فهو **تسلسل خاص بالمُخوِّل (per-authenticator sequence)** لكل زوج
`(account, pubkey)`، وهو عدّاد تخزين منفصل. أعد جلب القيمة ووقّع من جديد.
أخطاء المُخوِّل الأخرى تُفكَّك عبر `decodeTxError`: رموز `abstractaccount` رقم
5 (`spending_limit_exceeded`)، ورقم 6 (`session_key_expired`)، ورقم
10 (`permission_denied`). راجع
[المُخوِّلون والإنفاق المفوَّض](/sdk/guides/authenticators).
