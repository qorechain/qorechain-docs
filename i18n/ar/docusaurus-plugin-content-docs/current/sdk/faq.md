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
تستخدم `evmRpc` (وكذلك استدعاءات `qor_`، على عقدة تخدم ذلك النطاق). عناوين URL
الخاصة بالشبكة الرئيسية موجودة في
[مرجع الشبكة](/sdk/reference/network#public-endpoints).

## "Cannot find module 'viem'" / "'@solana/web3.js'"

هذه **تبعيات نظيرة (peer dependencies)** لحزمتَي `@qorechain/evm` و
`@qorechain/svm` على التوالي. ثبّتها في مشروعك:

```bash
npm i @qorechain/evm viem
npm i @qorechain/svm @solana/web3.js
```

## استدعاء precompile يُطلق خطأ "returned no data" / "feature not present"

الـ precompiles الخاصة بـ EVM في QoreChain مُدمجة في العقدة لكنها **غير مُفعّلة
بعد** على الشبكة الرئيسية أو الاختبارية: فهي تستجيب فقط حيث تكون عناوينها
مُدرجة في معامل `active_static_precompiles` الخاص بوحدة EVM، وهذه القائمة فارغة
على كلتا الشبكتين. اليوم يُرجع الاستدعاء بيانات فارغة، ولذلك تُبلغ viem عن
`returned no data ("0x")` ويُطلق المساعد خطأً على الشبكات العامة أيضًا (راجع
[الـ Precompiles في EVM: حالة الشبكة](/developer-guide/evm-precompiles#network-status)).
على عقدة EVM عادية تفشل الاستدعاءات بالطريقة نفسها. تحقّق من
`GET /cosmos/evm/vm/v1/params` ولفّ كل استدعاء precompile بحيث يُعالج الخطأ لكل
استدعاء على حدة.

## استدعاء `client.qor` لديّ يفشل بالرمز -32601

يستدعي `client.qor` نطاق JSON-RPC المسمى `qor_`، وهو نطاق لا تخدمه أي نسخة
منشورة من العقدة؛ إذ تُدرج `rpc_modules` على نقاط نهاية EVM العامة فقط `eth` و
`net` و`rpc` و`txpool` و`web3`. استخدم مسار REST بدلًا من ذلك، على سبيل المثال
`GET /qorechain/pqc/v1/account/{address}` (حالة مفتاح PQC) أو
`GET /qorechain/burn/v1/stats`، عبر `client.rest.get(...)`. راجع
[نطاق `qor_`](/api-reference/json-rpc-qor_-namespace).

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

جميعها. نواة TypeScript (`@qorechain/sdk`، 0.8.3)، ومحوّلات EVM/SVM
(`@qorechain/evm`، `@qorechain/svm`، 0.8.0)، وحزمة React (`@qorechain/react`،
0.8.3)، وأداة البناء `create-qorechain-dapp` (0.8.0) متوفرة على npm؛ وعميل
Python متوفر على PyPI (`pip install qorechain-sdk` بالإصدار 0.8.3، والاستيراد
`qorsdk`)؛ وعميل Go متوفر على وسيط الوحدات (module proxy)
(`go get github.com/qorechain/qorechain-sdk/packages/go/...`، بالوسم
`packages/go/v0.8.4`)؛ وعميل Rust متوفر على crates.io (`cargo add qorechain-sdk`،
0.8.3)؛ وعميل Java متوفر على Maven Central
(`io.github.qorechain:qorechain-sdk:0.8.3`). راجع [التثبيت](/sdk/install) للاطلاع
على أوامر كل لغة كاملةً.

## عبارتي التذكيرية (mnemonic) مرفوضة

تتحقق الـ SDK من قائمة كلمات BIP-39 **ومن رقم التحقق (checksum)** معًا قبل
اشتقاق أي مفتاح، بحيث تُطلق العبارة المكتوبة بخطأ إملائي خطأً بدلاً من إنتاج
حساب خاطئ بصمت. تحقق من الكلمات مجددًا؛ واستخدم `validateMnemonic` لاختبار
العبارة.

## معاملات PQC الهجينة

الإرسال الهجين (الكلاسيكي + ML-DSA-87) **مُفعّل وإلزامي** على المسار الأصلي
(Native) — تُرفض معاملات Native الكلاسيكية فقط على السلسلة (إصدار السلسلة
v3.2.0). قبل أن تنجح المعاملة الهجينة في التحقق عبر PQC، يجب **تسجيل المفتاح
العام الخاص بـ PQC للموقّع صراحةً** عبر `MsgRegisterPQCKeyV2` (معاملة موقّعة
تقليديًا ومعفاة من التوقيع الهجين)؛ أما تضمين المفتاح العام في الامتداد
(`includePqcPublicKey: true`) فلا **يسجّله**، والسلسلة لا تسجّل المفتاح عند أول
استخدام.
تقبل السلسلة أي توقيع ML-DSA-87 صالح وفق FIPS-204، سواء كان مُحوَّطًا (hedged)
أو حتميًا. تُوقّع الـ SDK بشكل حتمي افتراضيًا (منذ الإصدار 0.5.1) كي يكون للمعاملة
دائمًا التوقيع نفسه وتجزئة المعاملة نفسها. إذا فشلت معاملة هجينة برمز `pqc` رقم 21
(`hybrid_verify_failed`)، فالسبب هو إصدار بايتات التوقيع أو معرّف السلسلة أو مكتبة
PQC قديمة أو مفتاح غير مسجّل، وليس التوقيع المُحوَّط أبدًا.
تتحقق كلتا الشبكتين من صيغة بايتات التوقيع v2، لذا استخدم الـ SDK بالإصدار
**0.8.1 أو أحدث** ومرّر `rest` (أو `signBytesVersion`): تُطلق الأدوات المُنشئة
(builders) خطأً على `qorechain-vladi` / `qorechain-diana` من دون أحدهما. راجع
[استكشاف أخطاء الرمز 21](/developer-guide/post-quantum-signing#code-21) و
[الحسابات وتوقيع PQC](/sdk/concepts/accounts-pqc).

## معاملة EVM لديّ مرفوضة برسالة "no open EVM authorisation window"

منذ إصدار السلسلة v3.2.0، لا يقبل مسار EVM معاملة إلا من حساب لديه مفتاح PQC
مسجّل ونافذة تفويض مفتوحة. سجّل مفتاحًا، وافتح نافذة، ثم أرسل. راجع
[نافذة تفويض EVM](/sdk/guides/evm#evm-window). ومع الـ SDK، تُرجع
`classifyEvmWindowRejection(err)` إحدى القيم `"no-pqc-key"` أو `"no-window"` أو
`"exhausted"` أو `"invalid"`.

## معاملاتي الهجينة تفشل عند CheckTx بخطأ تحليل (parse) للمعاملة

قم بترقية الـ SDK. الإصدارات **0.6.0 وما قبلها** كانت تُسلسل (JSON-serialize)
امتداد جسم المعاملة `/qorechain.pqc.v1.PQCHybridSignature`، وهو ما يرفضه
مُفكِّك معاملات السلسلة عند CheckTx. ومنذ الإصدار **0.6.1** أصبح الامتداد
مُرمَّزًا بصيغة protobuf (تبدأ القيمة بـ `0x08`) في جميع اللغات الخمس —
المعاملات الهجينة المُنشأة بإصدارات أقدم تُرفض على السلسلة، في كل مسار
(بما في ذلك eth-native).

## إنفاق المُخوِّل (authenticator) لديّ مرفوض برمز `authenticator_replay`

(وحدة `abstractaccount` معطّلة على كلتا الشبكتين اليوم؛ ويُرفض الإنفاق برسالة
`abstract account module is disabled` قبل فحص أي nonce. راجع
[المُخوِّلون والإنفاق المفوَّض](/sdk/guides/authenticators). تنطبق الإرشادات أدناه
بمجرد تفعيل الوحدة.)

الـ nonce غير صحيح. يجب أن يكون `MsgExecuteEVM.nonce` هو nonce EVM **الحالي**
للحساب (الموزّع/relayer حساب مختلف، لذا لا تُضِف 1)؛ أما `MsgExecuteCosmos.nonce`
فهو **تسلسل خاص بالمُخوِّل (per-authenticator sequence)** لكل زوج
`(account, pubkey)`، وهو عدّاد تخزين منفصل. أعد جلب القيمة ووقّع من جديد.
أخطاء المُخوِّل الأخرى تُفكَّك عبر `decodeTxError`: رموز `abstractaccount` رقم
5 (`spending_limit_exceeded`)، ورقم 6 (`session_key_expired`)، ورقم
10 (`permission_denied`). راجع
[المُخوِّلون والإنفاق المفوَّض](/sdk/guides/authenticators).
