---
slug: /qoresign/overview
title: نظرة عامة على QoreSign
sidebar_label: نظرة عامة
sidebar_position: 1
---

# QoreSign

QoreSign مكتبة مفتوحة المصدر للتوقيع الهجين الذي يجمع secp256k1 وML-DSA-87 (FIPS 204) على QoreChain، موجهة للمحافظ والبورصات وجهات الحفظ والخوادم الخلفية.

يتيح QoreSign لمحفظة غير محفظة QoreChain الأصلية أن تشتق مفتاح ML-DSA-87 لحساب ما، وأن توقّع معاملات المسار الأصلي بالمفتاحين معًا، وأن تتحقق محليًا من التواقيع الهجينة، وأن توقّع رسائل اعتباطية، وأن تحاكي المعاملة قبل توقيعها، وأن تقرأ كيف جرت حماية معاملة مُثبَّتة، وأن تنفّذ Sign In With QoreChain. وهو طبقة رقيقة فوق ارتباطات [`qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) ولا يضيف أي بدائيات تشفيرية خاصة به. تصونه QoreChain Association بموجب رخصة Apache-2.0.

الإصدار الحالي هو **0.1.1** (27 أكتوبر 2026). وهو منشور بلغات TypeScript وRust وGo وKotlin (JVM وAndroid) وSwift، وأُضيفت إليها في 0.1.1 لغة Python. توجد الشيفرة المصدرية والأمثلة ونواقل الاختبار في مستودع [qorechain/qoresign](https://github.com/qorechain/qoresign). ويعمل على الشبكة الرئيسية (`qorechain-vladi`) وعلى الشبكة التجريبية (`qorechain-diana`).

## ما الذي يفعله QoreSign على كل مسار {#lanes}

| المسار | ما الذي يفعله QoreSign حاليًا |
|---|---|
| **الأصلي** (Cosmos SDK) | التوقيع الهجين والتحقق منه. تشترط الشبكة توقيع ML-DSA-87 افتراضيًا. |
| **EVM** | نافذة التفويض فقط: يسجّل الحساب مفتاح ML-DSA-87 ويفتح نافذة تفويض محدودة من المسار الأصلي. أما معاملات Ethereum نفسها فلا تحمل أي توقيع ML-DSA-87. |
| **SVM** | غير مفتوح على الشبكة بعد (`LANE_NOT_AVAILABLE`). |

يتطلب التوقيع الهجين على EVM أن تدعم الشبكة أولًا PQC لكل مسار على حدة. راجع [محافظ EVM: نافذة التفويض](/qoresign/guides/evm-quantum-ready).

## ما الذي يفعله {#what-it-does}

نواة تعمل دون اتصال، وهي نفسها في كل لغة:

- تشتق المفتاح الكلاسيكي على `m/44'/118'/0'/0/0` (`deriveClassicalKey`) ومفتاح ML-DSA-87 القياسي الذي تسجّله محافظ QoreChain لحساب ما (`deriveCanonicalPqKey`، مرتبط بالعبارة الاستذكارية وبالعنوان). يوجد اشتقاق HD مُقوّى كمسودة (`deriveHdPqKey`)؛ وتعيد `pqKeyFromSeed` بناء زوج مفاتيح من بذرته ذات 32 بايت.
- تبني عناوين `qor1` وتحلّلها لحسابات `secp256k1` و`eth_secp256k1`.
- توقّع معاملة المسار الأصلي بالمفتاحين (`signHybrid`)، أو تضيف طبقة ML-DSA-87 فقط إلى جسم بنته إحدى الـ dApps (`signPqLayer`). تواقيع ML-DSA-87 حتمية افتراضيًا؛ والتوقيع المتحوّط (hedged) خيار متاح، وتقبل الشبكة النوعين. يستخدم secp256k1 المعيار RFC 6979 مع low-S.
- تحسب بايتات التوقيع الهجينة v1 وv2 (`hybridSignBytes`) وتتحقق من معاملة هجينة كاملة (`verifyHybridTx`) أو من طبقة ML-DSA-87 وحدها (`verifyPqLayer`).
- تبني `MsgRegisterPQCKeyV2` مع إثبات الحيازة (`buildRegisterPqKeyMessage`، `signProofOfPossession`) وترفض المفاتيح العامة المنحلّة.
- توقّع رسائل اعتباطية وتتحقق منها (`signMessage`، `verifyMessage`) وتنفّذ Sign In With QoreChain v1 (`createSiwqMessage`، `signSiwq`، `verifySiwq`).
- تطبّق قواعد المسارات في الشيفرة (`decideLane`، `assertHybridLane`، `evaluateLayerState`). تحمل الأخطاء رمزًا ثابتًا مشتركًا بين كل اللغات (`QoreSignError`، مثل `INVALID_MNEMONIC` و`LANE_NOT_AVAILABLE` و`KEY_NOT_REGISTERED`).

دوال الشبكة المساعدة (في TypeScript عبر `@qorechain/qoresign/network`؛ وفي Go عبر `github.com/qorechain/qoresign/go/network` وفيها كلها عدا الدالتين الجديدتين):

- `fetchPqKeyStatus`: هل سُجّل مفتاح ML-DSA-87 لعنوان ما، وأي مفتاح.
- `resolveSignBytesVersion`: أي صيغة لبايتات التوقيع تتحقق منها الشبكة.
- `simulateTx` (الغاز المستهلك، وحد الغاز المقترح، وتغيّرات الأرصدة لكل عنوان) و`suggestGasLimit` و`broadcastTx` و`submitWithSignBytesFallback` (محاولة واحدة إضافية بالصيغة الأخرى لبايتات التوقيع عندما ترفض الشبكة الأولى).
- `assertPqLayerMatchesRegisteredKey`: يفحص طبقة قدّمتها إحدى الـ dApps مقابل المفتاح المسجّل على السلسلة قبل أن تضيف المحفظة توقيعها الكلاسيكي.
- `verifySiwqWithChain` و`verifyMessageWithChain`: التحقق مقابل المفتاح المسجّل على السلسلة.
- `fetchCommittedExtensionTypeUrls`: يقرأ أي الامتدادات حملتها معاملة مُثبَّتة.
- جديد في 0.1.1، في TypeScript فقط: `inspectTransaction` و`fetchEvmWindow`، وهما موصوفتان أدناه.

## الجديد في 0.1.1 {#new-in-0-1-1}

- **Python.** الحزمة `qorechain-qoresign` (الاستيراد `qoresign`) موجودة على PyPI، مع عجلات (wheels) لـ macOS وLinux. وهي تربط تنفيذ Rust وتعيد إنتاج نواقل الاختبار نفسها. تعمل دون اتصال مثل ارتباطات Swift وKotlin: بلا دوال شبكة مساعدة.
- **مفتش المعاملات (مكتبة).** تقرأ `inspectTransaction` معاملة مُثبَّتة وتبلّغ كيف جرت حمايتها. راجع [مفتش المعاملات](#inspector).
- **قارئ نافذة EVM.** تقرأ `fetchEvmWindow` نافذة تفويض EVM لحساب ما.
- **إصلاحات التغليف.** لم يعد أرشيف إطار Swift الثنائي يحتوي على مجلد resource-fork شارد، ولم تعد المكتبات الأصلية لـ macOS في حزمتي Kotlin وPython تسجّل مجلد البناء كاسم تثبيت لها.

## مفتش المعاملات {#inspector}

`inspectTransaction({ rest, chainId, txhash, rpc? })` دالة للقراءة فقط في `@qorechain/qoresign/network`. تجلب معاملة مُثبَّتة وتعيد:

- الرسائل والمذكرة (memo) ورمز النتيجة والارتفاع والرسوم؛
- الموقّع: العنوان ونوع المفتاح والمفتاح العام والتسلسل (sequence)؛
- هل يتحقق التوقيع الكلاسيكي؛
- حالة طبقة ML-DSA-87: موجودة أم لا، وكم عدد الطبقات، وهل تتحقق الطبقة مقابل المفتاح المسجّل لدى الموقّع الآن، وأي صيغة لبايتات التوقيع استخدمت؛
- مستوى أمان، بالتصنيف نفسه المستخدم في المستكشف العام: `pqc` (تحمل طبقة ML-DSA-87) أو `enrollment` (تسجّل مفتاح ML-DSA-87 أو تدوّره، ويُوقَّع بالمفتاح الكلاسيكي بحكم التصميم) أو `shake` (معاملة في المسار الأصلي دون الطبقة) أو `classical` (معاملة في مسار EVM).

تعيد `undefined` لتجزئة لا تعرفها الشبكة. مرّر نقطة `rpc` لقراءة البايتات المُثبَّتة الدقيقة من عقدة؛ وبدونها تستخدم الدالة بايتات تعيد بوابة REST ترميزها. لا ترسل شيئًا ولا تحتاج إلى حساب أو مفتاح.

```js
import { fetchEvmWindow, fetchPqKeyStatus, inspectTransaction } from "@qorechain/qoresign/network";

const rest = "https://api-testnet.qore.host";
const address = "qor178nscfyp0cq2ac5x7un4u98xrj4ayp6pt0kw08"; // public testnet faucet account

const status = await fetchPqKeyStatus({ rest, address });
console.log("ML-DSA-87 key registered:", status.registered);

const tx = await inspectTransaction({ rest, chainId: "qorechain-diana", txhash: process.argv[2] });
console.log(tx?.tier, tx?.pqLayer, tx?.messages.map((m) => m.typeUrl));

const win = await fetchEvmWindow({ rest, address });
console.log("EVM window:", win.found, win.live);
```

احفظه باسم `inspect.mjs` وشغّل `node inspect.mjs <txhash>` مع تجزئة معاملة من الشبكة التجريبية. عند تشغيله على تحويل حديث من الحنفية على الشبكة التجريبية طبع `ML-DSA-87 key registered: true`، والمستوى `pqc`، و`pqLayer { present: true, count: 1, algorithmId: 1, verified: true, signBytesVersion: 'v2' }`، والرسالة `/cosmos.bank.v1beta1.MsgSend`، و`EVM window: false false`.

تعيد `fetchEvmWindow({ rest, address })` الحقول `found` و`live` وارتفاعي الفتح والانتهاء والحد الأقصى للمعاملات والقيمة والمستخدم منهما، والكتل والمعاملات والقيمة المتبقية، و`nativeOnly` و`allowedTargets`.

هذه دالة المكتبة. لا تحتوي صفحة [المطورين](/dashboard/developers) في لوحة التحكم على تبويب مفتش المعاملات بعد.

## فيم يُستخدم {#use-cases}

1. **محفظة متوافقة مع Keplr تضيف التوقيع الهجين على QoreChain.** تنتج Leap أو Cosmostation أو محفظة جديدة توقيع secp256k1 عبر `signDirect`. ومع QoreSign تشتق مفتاح ML-DSA-87 للحساب من العبارة الاستذكارية نفسها وتضيف الطبقة (`signPqLayer`) قبل التوقيع. راجع [دليل المحفظة](/qoresign/guides/keplr-compatible-wallets).
2. **بورصة أو جهة حفظ توقّع عمليات السحب على خوادمها.** تقوم خدمة محفظة ساخنة أو دافئة بلغة Go أو Rust بتوقيع تحويلات المسار الأصلي بـ `signHybrid`، وتحاكيها أولًا (`simulateTx`، في Go وTypeScript) لترى تغيّرات الأرصدة والغاز، وتبث بـ `submitWithSignBytesFallback`. تبني [حقيبة الحفظ](/developer-tools/custody-kit) على هذا.
3. **خادم خلفي ينفّذ Sign In With QoreChain.** يصدر الخادم nonce للاستخدام مرة واحدة، وتوقّع المحفظة رسالة تسجيل الدخول، ويستدعي الخادم `verifySiwqWithChain`. راجع [دليل تسجيل الدخول](/qoresign/guides/sign-in).
4. **أداة امتثال أو دعم تتحقق من كيفية حماية معاملة.** تبلّغ `inspectTransaction` هل حملت معاملة مُثبَّتة طبقة ML-DSA-87 متحققًا منها، وأي صيغة لبايتات التوقيع استخدمت، ومستواها.
5. **محفظة تعرض نافذة تفويض حساب EVM.** قبل أن يرسل المستخدم من محفظة EVM، تُظهر `fetchEvmWindow` هل النافذة قائمة وكم معاملة وكم قيمة بقيت.
6. **فريق Python يوقّع التقارير أو الموافقات.** تنتج `qoresign.sign_message` توقيعًا هجينًا على بايتات اعتباطية يمكن لأي لغة أخرى في QoreSign التحقق منه.
7. **محفظة جوال على iOS أو Android.** تقدّم حزمة Swift وAAR لنظام Android الاشتقاق والتوقيع وتسجيل الدخول نفسها كما في حزمة TypeScript، بايتًا ببايت.
8. **المدقّقون والمدمجون يتحققون من التواقيع دون اتصال.** تعمل `verifyHybridTx` و`verifyPqLayer` و`verifyMessage` دون شبكة، بمجرد توفر المفاتيح العامة.

## كيف يعمل {#how-it-works}

- **المعاملة الهجينة** هي `TxRaw` عادية في Cosmos SDK يوقّعها الحساب نفسه مرتين: توقيع ML-DSA-87 محمول في جسم المعاملة كخيار امتداد `/qorechain.pqc.v1.PQCHybridSignature` (معرّف الخوارزمية `1`)، وتوقيع secp256k1 بنمط `SIGN_MODE_DIRECT` على الجسم النهائي.
- **بايتات التوقيع v2** (تتحقق منها الشبكتان العامتان اليوم) هي `"qorechain-pqc-hybrid-v2"`، ثم معرّف السلسلة، ثم الجسم دون امتداد PQC، ثم auth info، كل منها ببادئة طول. لذلك يغطي توقيع ML-DSA-87 الرسوم. أما التوقيع الكلاسيكي فيغطي الجسم النهائي بما فيه الامتداد. وتبقى v1 لإعادة إنتاج التواقيع الأقدم. راجع [توقيع المعاملات الهجين v1](/qoresign/spec/hybrid-signing-v1).
- **الترتيب:** رمّز الجسم وauth info، واحسب بايتات التوقيع وتوقيع ML-DSA-87، وألحق الامتداد، ثم وقّع SignDoc بـ secp256k1 وابثّ.
- **التسجيل:** تحمل `MsgRegisterPQCKeyV2` المفتاح العام لـ ML-DSA-87 ومفتاح secp256k1 المضغوط للحساب وإثبات الحيازة. وتُوقَّع معاملة التسجيل بالمفتاح الكلاسيكي وحده.
- **فصل النطاقات:** يبدأ كل توقيع ML-DSA-87 ببادئة محجوزة، فلا يمكن أبدًا إعادة استخدام توقيع رسالة أو تسجيل دخول كتوقيع معاملة.
- **ما يوجد على السلسلة:** المفتاح العام المسجّل لـ ML-DSA-87 والمعاملات الهجينة ونوافذ EVM. أما المفاتيح والتوقيع والتحقق فتجري على الجهاز أو الخادم الذي يشغّل QoreSign.
- **نواقل اختبار مشتركة:** صيغ النقل لها إصدارات مستقلة عن الحزم، وتغطيها [نواقل الاختبار](/qoresign/vectors) التي تعيد كل لغة إنتاجها بايتًا ببايت.

الأحجام (FIPS 204 و[دليل الأحجام](/qoresign/guides/sizes-and-transport)): المفتاح العام لـ ML-DSA-87 بحجم 2,592 بايت، والمفتاح السري 4,896 بايت، والتوقيع 4,627 بايت، والبذرة 32 بايت. المعاملة الهجينة أكبر بنحو 4.7 كيلوبايت من الكلاسيكية، فحاكِ قبل أن توقّع. لا يتسع التوقيع أو المفتاح العام في رمز QR ثابت واحد؛ وتحتاج أجهزة التوقيع المعزولة عن الشبكة إلى QR متعدد الأجزاء. احتفظ بالبذرة ذات 32 بايت لا بالمفتاح السري.

## الحزم {#packages}

| اللغة | الحزمة | التثبيت | الحد الأدنى للمنصة |
|---|---|---|---|
| TypeScript | [`@qorechain/qoresign`](https://www.npmjs.com/package/@qorechain/qoresign) | `npm install @qorechain/qoresign` | Node.js 20 أو أحدث؛ المتصفحات |
| Rust | [`qorechain-qoresign`](https://crates.io/crates/qorechain-qoresign) (اسم المكتبة `qoresign`) | `cargo add qorechain-qoresign` | Rust المستقر |
| Go | [`github.com/qorechain/qoresign/go`](https://pkg.go.dev/github.com/qorechain/qoresign/go) | `go get github.com/qorechain/qoresign/go@v0.1.1` | Go 1.25 |
| Python | [`qorechain-qoresign`](https://pypi.org/project/qorechain-qoresign/) (الاستيراد `qoresign`) | `pip install qorechain-qoresign` | Python 3.9+؛ عجلات لـ macOS 11+ (arm64 وx86_64) وLinux (x86_64 وaarch64)؛ لا توجد عجلة لـ Windows بعد، وتُبنى المنصات الأخرى من توزيعة المصدر (تحتاج Rust 1.95) |
| Swift | `QoreSign` من [`github.com/qorechain/qoresign`](https://github.com/qorechain/qoresign) (إطار ثنائي في إصدار GitHub) | `.package(url: "https://github.com/qorechain/qoresign", from: "0.1.1")`، المنتج `QoreSign` | iOS 16، macOS 13 |
| Kotlin / JVM | [`io.github.qorechain:qoresign`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) | `implementation("io.github.qorechain:qoresign:0.1.1")` | Java 17، Kotlin 2.3 أو أحدث؛ مكتبات أصلية لـ macOS (arm64 وx86-64) وLinux (x86-64 وarm64) وWindows (x86-64) |
| Android | [`io.github.qorechain:qoresign-android`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign-android) | `implementation("io.github.qorechain:qoresign-android:0.1.1")` | API 24، Kotlin 2.3 أو أحدث؛ `arm64-v8a` و`armeabi-v7a` و`x86_64`؛ قواعد keep لـ R8 مضمّنة |

:::note إصدار مترجم Kotlin
تحتاج حزمتا Kotlin وAndroid إلى مترجم **Kotlin 2.3 أو أحدث** في مشروعك. يفشل مشروع على Kotlin 2.1 في الترجمة مقابلهما. ارفع إصدار Kotlin في البناء قبل أن تضيف الاعتمادية.
:::

تتحقق جميع التنفيذات من نفسها مقابل [نواقل الاختبار](/qoresign/vectors) ذاتها.

## مثال {#example}

```ts
import {
  addressFromPublicKey,
  deriveCanonicalPqKey,
  deriveClassicalKey,
  signHybrid,
  verifyHybridTx,
} from "@qorechain/qoresign";

const classical = deriveClassicalKey({ mnemonic });                 // m/44'/118'/0'/0/0
const address = addressFromPublicKey(classical.publicKey, "secp256k1").bech32;
const pqKey = deriveCanonicalPqKey({ mnemonic, address });         // the key QoreChain wallets register

// bodyBytes / authInfoBytes / accountNumber come from the dApp's SignDoc
const signed = signHybrid({ chainId: "qorechain-vladi", accountNumber, bodyBytes, authInfoBytes, classicalKey: classical, pqKey });

verifyHybridTx({
  txBytes: signed.txBytes,
  chainId: "qorechain-vladi",
  accountNumber,
  classicalPublicKey: classical.publicKey,
  pqPublicKey: pqKey.publicKey,
}); // { valid: true, classical: true, pq: { valid: true, signBytesVersion: "v2" } }
```

ينفّذ [البدء السريع](/qoresign/quickstart) التدفق نفسه من البداية إلى النهاية، دون اتصال، ويتضمن بدايات سريعة لتوقيع الرسائل بلغتي Python وGo.

## واجهة البرمجة الرئيسية {#main-api}

الأسماء مذكورة بصيغة TypeScript. تستخدم Go الأسماء نفسها بأسلوب Go في الحروف (`SignHybrid`، `VerifySiwq`)؛ وتستخدم Rust وPython صيغة snake_case (`sign_hybrid`)؛ وتستخدم Swift وKotlin صيغة camelCase فوق نواة Rust.

| الاسم | ما الذي يفعله | أين |
|---|---|---|
| `deriveClassicalKey`، `deriveCanonicalPqKey`، `pqKeyFromSeed`، `classicalKeyFromPrivate` | مفاتيح من عبارة استذكارية أو بذرة أو بايتات خام | الكل |
| `deriveHdPqKey` | اشتقاق HD مُقوّى لمفاتيح ML-DSA-87 (مسودة، قابل للتغيير) | الكل |
| `addressFromPublicKey`، `addressFromBytes`، `parseAddress` | عناوين `qor1` | الكل |
| `signHybrid`، `signPqLayer`، `hybridSignBytes` | التوقيع الهجين وبايتات التوقيع v1 أو v2 | الكل |
| `verifyHybridTx`، `verifyPqLayer` | التحقق المحلي | الكل |
| `buildRegisterPqKeyMessage`، `signProofOfPossession`، `verifyProofOfPossession` | تسجيل المفتاح مع إثبات الحيازة | الكل |
| `signMessage`، `verifyMessage` | توقيع رسائل اعتباطية (ADR-36 مع ML-DSA-87) | الكل |
| `createSiwqMessage`، `parseSiwqMessage`، `signSiwq`، `verifySiwq` | Sign In With QoreChain v1 | الكل |
| `decideLane`، `assertHybridLane`، `evaluateLayerState` | قواعد المسارات؛ كشف الطبقة المسقطة | الكل |
| `fetchPqKeyStatus`، `resolveSignBytesVersion`، `simulateTx`، `suggestGasLimit`، `broadcastTx`، `submitWithSignBytesFallback`، `assertPqLayerMatchesRegisteredKey`، `verifySiwqWithChain`، `verifyMessageWithChain`، `fetchCommittedExtensionTypeUrls` | دوال الشبكة المساعدة | TypeScript، Go |
| `inspectTransaction`، `fetchEvmWindow` | قراءة معاملة مُثبَّتة؛ قراءة نافذة EVM (0.1.1) | TypeScript |

في Go تكون دوال الشبكة المساعدة methods على عميل: `client := network.NewClient("https://api-testnet.qore.host")`، ثم `client.VerifySiwqWithChain(ctx, address, qoresign.VerifySiwqOptions{...})` أو `client.SimulateTx(...)`. أخطاء Python هي `QoreSignError` مع `code` و`detail`؛ وحقول البايتات من النوع `bytes`.

مرجع واجهة البرمجة: في نسخة مستنسخة من المستودع، شغّل `pnpm -C packages/ts docs` (TypeScript) أو `cargo doc -p qorechain-qoresign` (Rust) أو `go doc github.com/qorechain/qoresign/go` (Go). تحاكي ارتباطات Swift وKotlin وPython واجهة Rust البرمجية؛ راجع ملفات README لـ [Swift](https://github.com/qorechain/qoresign/tree/main/swift) و[Kotlin](https://github.com/qorechain/qoresign/tree/main/kotlin) و[Python](https://github.com/qorechain/qoresign/tree/main/python).

## الشبكات والمتطلبات {#networks}

| | الشبكة الرئيسية | الشبكة التجريبية |
|---|---|---|
| معرّف السلسلة | `qorechain-vladi` (معرّف سلسلة EVM 9801) | `qorechain-diana` (معرّف سلسلة EVM 9800) |
| REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM | `https://evm.qore.host` | `https://evm-testnet.qore.host` |
| بايتات التوقيع المتحقق منها | v2 | v2 |

- **المسار الأصلي:** تشترط الشبكة توقيع ML-DSA-87 افتراضيًا. المستثنى: تسجيل مفتاح ML-DSA-87 لحساب ما، وفك الحبس (unjail) من حساب بلا مفتاح. يجب أن يكون مفتاح الحساب مسجّلًا (`MsgRegisterPQCKeyV2`) قبل أن تتحقق المعاملات الهجينة؛ وتسجّله محافظ QoreChain عند إنشاء الحساب.
- **مسار EVM:** يفتح الحساب ذو مفتاح ML-DSA-87 المسجّل نافذة تفويض محدودة (ارتفاع الانتهاء، والحد الأقصى للمعاملات، والحد الأقصى للقيمة، وعقود مسموحة اختيارية) بمعاملة في المسار الأصلي موقّعة توقيعًا هجينًا. خارج النافذة القائمة ترفض الشبكة معاملات EVM الخاصة بالحساب. القراءات وتقدير الغاز لا تحتاج إلى نافذة.
- **الرسوم:** الفئة `uqor` (6 خانات عشرية)، والحد الأدنى لسعر الغاز 0.1 uqor لكل وحدة غاز.
- **قيم تسجيل Keplr:** بادئة bech32 هي `qor`، ونوع العملة `118`.
- **الحسابات:** لا حاجة لها للدوال العاملة دون اتصال. تحتاج دوال الشبكة المساعدة إلى نقطة REST فقط؛ ويحتاج البث إلى حساب ممول له مفتاح ML-DSA-87 مسجّل.

## التوثيق {#documentation}

- [البدء السريع](/qoresign/quickstart): اشتقاق المفاتيح وتوقيع معاملة هجينة والتحقق منها في دقائق قليلة.
- الأدلة
  - [إضافة التوقيع الهجين إلى محفظة متوافقة مع Keplr](/qoresign/guides/keplr-compatible-wallets)
  - [Sign In With QoreChain: التحقق على الخادم](/qoresign/guides/sign-in)
  - [محافظ EVM: نافذة التفويض](/qoresign/guides/evm-quantum-ready)
  - [اشتقاق المفاتيح: المفاتيح القياسية ومسودة HD](/qoresign/guides/key-derivation)
  - [الأحجام والنقل](/qoresign/guides/sizes-and-transport)
- المواصفات
  - [توقيع المعاملات الهجين v1](/qoresign/spec/hybrid-signing-v1)
  - [Sign In With QoreChain v1](/qoresign/spec/siwq-v1)
  - [توقيع الرسائل v1](/qoresign/spec/message-signing-v1)
  - [اشتقاق مفاتيح ML-DSA-87](/qoresign/spec/hd-derivation-draft)
- [نواقل الاختبار](/qoresign/vectors)
- [الأمثلة](https://github.com/qorechain/qoresign/tree/main/examples)

## النطاق والحدود {#scope}

- يوقّع QoreSign محليًا. فهو لا يحتفظ بالمفاتيح نيابةً عنك، ولا يقوم بالتوقيع العتبي أو MPC، ولا يوقّع على المحافظ العتادية.
- لا يوجد توقيع EVM هجين: تطلق `assertHybridLane("evm")` الخطأ `LANE_NOT_AVAILABLE`. وتستخدم حسابات EVM نافذة التفويض بدلًا من ذلك. معاملات SVM غير مفتوحة.
- لا تحتوي Rust وSwift وKotlin وPython على شيفرة شبكة. يبقى جلب أرقام الحسابات والمحاكاة والبث في تطبيقك، أو استخدم دوال TypeScript أو Go المساعدة.
- توجد `inspectTransaction` و`fetchEvmWindow` في TypeScript فقط. تفحص `inspectTransaction` الطبقة مقابل المفتاح المسجّل لدى الموقّع الآن، لذلك بعد تدوير المفتاح تبلّغ المعاملة الأقدم `verified: false`.
- يحتاج الاشتقاق القياسي إلى العبارة الاستذكارية. أما المحافظ التي لا تملكها (مفاتيح محفوظة في عتاد) فتولّد مفتاحًا عشوائيًا (`pqKeyFromSeed`) أو تستخدم مسودة HD، وتسجّل ذلك المفتاح. يجب أن تكون العبارة الاستذكارية بالصيغة القياسية (أحرف صغيرة، ومسافات مفردة)؛ تُرفض الكتابات الأخرى ولا تُطبَّع.
- اشتقاق HD (`deriveHdPqKey`) مسودة وقد يتغير.
- ليست لـ Python عجلة لـ Windows بعد. وتحتاج Kotlin وAndroid إلى مترجم Kotlin 2.3 أو أحدث.
- تأتي تنفيذات ML-DSA-87 وsecp256k1 من `qorechain-pqc` (المبنية على `@noble/post-quantum` و`fips204` وCloudflare CIRCL) ومن `@noble/curves` و`k256` و`decred/secp256k1`.

## ملاحظات الأمان {#security}

- لا تغادر المفاتيح العملية التي تشغّل QoreSign. لا يُرسل شيء إلى أي مكان ما لم تستدعِ إحدى دوال الشبكة المساعدة، وهذه ترسل بيانات عامة فقط: العناوين وبايتات المعاملات الموقّعة والتجزئات.
- اعرض على المستخدم الرسائل والرسوم من `bodyBytes` و`authInfoBytes` قبل التوقيع؛ فتوقيع ML-DSA-87 يغطي الرسوم.
- عندما تقدّم إحدى الـ dApps جسمًا يحمل بالفعل طبقة PQC، افحصه بـ `assertPqLayerMatchesRegisteredKey` قبل أن تضيف التوقيع الكلاسيكي. وبعد البث، تؤكد `evaluateLayerState` مع `fetchCommittedExtensionTypeUrls`، أو `inspectTransaction`، أن الطبقة وصلت إلى السلسلة.
- لا توقّع أبدًا بايتات خام بمفتاح ML-DSA-87 خارج النطاقات المحجوزة.
- nonce تسجيل الدخول للاستخدام مرة واحدة. ترفض `verifySiwq` تسجيل دخول دون جزء ML-DSA-87 ما لم يُمرَّر `requirePq: false`؛ لا تقبل تسجيلات الدخول الكلاسيكية فقط إلا حين لا تحتاج خدمتك إلى الضمان ما بعد الكمي.
- خزّن بذرة ML-DSA-87 ذات 32 بايت مشفّرة، بدلًا من المفتاح السري.
- لا تضع أبدًا عبارة استذكارية للشبكة الرئيسية في سكربت أو في سجل الصدفة. تستخدم الأمثلة عبارة BIP-39 الاختبارية العامة (`abandon` إحدى عشرة مرة، ثم `about`)؛ لا تموّلها أبدًا.
- أبلغ عن الثغرات بشكل خاص على security@qore.network، لا في القضايا العامة. تدخل إصلاحات الأمان في أحدث إصدار فرعي.

## أين نُشر {#where-published}

الإصدارات مفحوصة على السجلات في 27 أكتوبر 2026.

| السجل | الحزمة | الإصدار | الرابط |
|---|---|---|---|
| npm | `@qorechain/qoresign` | 0.1.1 | [npmjs.com](https://www.npmjs.com/package/@qorechain/qoresign) |
| crates.io | `qorechain-qoresign` | 0.1.1 | [crates.io](https://crates.io/crates/qorechain-qoresign) |
| Go module proxy | `github.com/qorechain/qoresign/go` | v0.1.1 (الوسم `go/v0.1.1`) | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qoresign/go) |
| Maven Central | `io.github.qorechain:qoresign` | 0.1.1 | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) |
| Maven Central | `io.github.qorechain:qoresign-android` | 0.1.1 | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoresign-android) |
| PyPI | `qorechain-qoresign` | 0.1.1 (عجلات macOS arm64 وx86_64 وLinux x86_64 وaarch64، وتوزيعة المصدر) | [pypi.org](https://pypi.org/project/qorechain-qoresign/) |
| Swift Package Manager | `QoreSign` من `github.com/qorechain/qoresign` | 0.1.1 (الملف الثنائي `QoreSignFFI.xcframework.zip` في الإصدار) | [إصدار GitHub](https://github.com/qorechain/qoresign/releases/tag/v0.1.1) |

المستودع: [github.com/qorechain/qoresign](https://github.com/qorechain/qoresign) (الإصداران v0.1.0 وv0.1.1).

## صفحات ذات صلة {#related}

- [بدائيات ما بعد الكم (`qorechain-pqc`)](/developer-tools/pqc-library): بدائيات ML-DSA-87 التي يقوم عليها QoreSign.
- [QoreChain SDK](/sdk/overview): مؤلّفو المعاملات ورسائل نافذة EVM وكشف الميزات.
- [محول المحفظة](/developer-tools/wallet-adapter): البديل من جهة الـ dApp حين لا يمكن تغيير المحفظة. تحتفظ الـ dApp بمفتاح ML-DSA-87 وتطلب `signDirect` من المحفظة دون تغيير؛ والبايتات هي نفسها في QoreSign.
- [QoreSeal](/developer-tools/qoreseal): التشفير إلى الحسابات؛ وبطاقات المستلمين فيه هي تواقيع رسائل QoreSign.
- [حقيبة الحفظ](/developer-tools/custody-kit): كشف الإيداعات والتحقق من عمليات السحب المبنيان على QoreSign.
- [خادم QoreChain MCP](/developer-tools/mcp): تستخدم أداته `get_pq_status` QoreSign للتحقق من الطبقة الهجينة.
- [التوقيع ما بعد الكمي](/developer-guide/post-quantum-signing) و[تكامل البورصات](/developer-guide/exchange-integration).
- [نظرة عامة على حزم المطورين](/developer-tools/overview).

## إدارة الإصدارات {#versioning}

QoreSign في مرحلة ما قبل 1.0: قد تغيّر الإصدارات الفرعية واجهة البرمجة، ويُدرج كل تغيير كاسر في [سجل التغييرات](https://github.com/qorechain/qoresign/blob/main/CHANGELOG.md). أما صيغ النقل فلها إصداراتها المستقلة (مواصفات `v1` والملف `vectors/qoresign-v1.json`) ولا تتغير ضمن الإصدار الواحد.

## المساهمة والأمان {#contributing}

راجع [CONTRIBUTING.md](https://github.com/qorechain/qoresign/blob/main/CONTRIBUTING.md). أبلغ عن الثغرات بشكل خاص على security@qore.network كما هو موضح في [SECURITY.md](https://github.com/qorechain/qoresign/blob/main/SECURITY.md).

## الترخيص {#license}

[Apache-2.0](https://github.com/qorechain/qoresign/blob/main/LICENSE). حقوق النشر 2026 QoreChain Association.
