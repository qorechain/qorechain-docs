---
slug: /qorel/signing-from-any-language
title: توقيع معاملات QoreChain من أي لغة
sidebar_label: التوقيع من أي لغة
sidebar_position: 8
---

# توقيع معاملات QoreChain من أي لغة

يوقّع QORel بلغة Rust عبر الحزمة `qorel-signer`. ويمكن لمُرحِّلات وروبوتات وأدوات أخرى أن تنتج التوقيع الهجين ما بعد الكمومي نفسه بلغات أخرى باستخدام QoreChain SDK ومكتبات التشفير ما بعد الكمومي. تذكر هذه الصفحة العقد الذي تتبعه جميعها وتسرد المكتبة المستخدمة في Rust وTypeScript وGo وPython وJava. وهي موجّهة إلى المطورين الذين يبنون مُرحِّلًا أو روبوتًا أو خادمًا خلفيًا يرسل معاملات إلى QoreChain.

## الابتكارات {#innovations}

- **عقد واحد، ومجموعة واحدة من نواقل الاختبار.** تبني كل لغة sign bytes نفسها والامتداد نفسه. وينشر مستودع QORel نواقل أُعيد بناؤها بايتًا ببايت من معاملات قبلتها السلسلة، فيمكنك فحص أي تنفيذ قبل أن يلمس أي شبكة.
- **الامتداد هو الإضافة الوحيدة.** يسافر التوقيع ما بعد الكمومي في خيار امتداد واحد من جسم المعاملة؛ أما الرسائل والرسوم والتوقيع الكلاسيكي فتحتفظ بصيغتها المعتادة.
- **نقطة الربط ضيقة.** يُضاف التوقيع بعد أن تصبح auth info نهائية وقبل بناء مستند التوقيع الكلاسيكي. يحتاج المُرحِّل إلى تغيير واحد عند تلك النقطة، لا إلى إعادة كتابة.
- **المفتاح نفسه في كل مكان.** يُشتق مفتاح ML-DSA-87 من العبارة السرية للحساب باشتقاق محفظة QoreChain، فأي محفظة أو مُرحِّل يستورد العبارة السرية يحصل على المفتاح ما بعد الكمومي نفسه.

## كيفية الاستخدام {#how-to-use}

### العقد {#contract}

لا تقبل QoreChain معاملة في المسار الأصلي إلا إذا حملت التوقيعين معًا:

- **توقيع secp256k1 الكلاسيكي**، بصيغة `SIGN_MODE_DIRECT` المعتادة. ويغطي الجسم النهائي، بما فيه الامتداد.
- **توقيع ML-DSA-87 (FIPS 204)** في خيار امتداد من الجسم، من النوع `/qorechain.pqc.v1.PQCHybridSignature`، مع `algorithm_id = 1` و`pqc_signature` (4,627 بايت) و`pqc_public_key` اختياري (2,592 بايت). ويجب أن يكون خيار الامتداد الحرج الوحيد (في `extension_options`) في المعاملة.

يغطي توقيع ML-DSA الـ sign bytes (الإصدار 2، الحالي على الشبكتين):

```
"qorechain-pqc-hybrid-v2" || BE64(len(chain_id)) || chain_id
                          || BE32(len(B0)) || B0
                          || BE32(len(A))  || A
```

- `B0` هو `TxBody` بدون امتداد PQC، معاد ترميزه ترميزًا قانونيًا (canonical).
- `A` هي بايتات `AuthInfo`، دون تغيير.

ترتيب العمليات:

1. ابنِ الجسم وauth info.
2. وقّع الـ sign bytes بـ ML-DSA-87.
3. ألحق الامتداد بالجسم.
4. وقّع الجسم النهائي بـ secp256k1.
5. أذِع المعاملة.

قواعد يسهل الخطأ فيها:

- يجب أن يكون `B0` قانونيًا، لأن السلسلة تعيد اشتقاقه بفك ترميز الجسم وإسقاط الخيار الهجين وإعادة الترميز. لا ترسل أجسامًا فيها خيارات امتداد خاصة بها، أو العلم `unordered`، أو حقولًا غير معروفة، أو ترميزًا غير قانوني.
- الرفض بالرمز codespace `pqc` والرمز 21 يعني أن التوقيع الهجين لم يتحقق. أعد قراءة إصدار sign-bytes وتسجيل الحساب قبل إعادة المحاولة؛ راجع [التوقيع ما بعد الكمومي](/developer-guide/post-quantum-signing#code-21).
- الغاز: يكلّف التحقق 2,000 وحدة غاز لكل موقِّع له مفتاح، إضافة إلى كلفة الحجم لنحو 4.7 كيلوبايت من الامتداد. حاكِ عبر المسار نفسه كي يُحتسب الاثنان.

### تسجيل المفتاح واشتقاقه {#keys}

يسجّل الحساب مفتاحه العام ML-DSA مرة واحدة بالرسالة `MsgRegisterPQCKeyV2`، مع إثبات حيازة. وهذه هي المعاملة الوحيدة التي تقبلها QoreChain بالتوقيع الكلاسيكي وحده. راجع [التوقيع ما بعد الكمومي](/developer-guide/post-quantum-signing#pqc-key-registration).

يُشتق مفتاح ML-DSA من العبارة السرية نفسها للحساب:

```
seed = SHAKE256("qorechain:pqc:v1|" + address + "|" + mnemonic)[:32]
```

ثم `ML-DSA-87.KeyGen_internal(seed)`. وتُصفَّر الأسرار في الذاكرة ولا تُطبع أبدًا. ويوصف الاشتقاق نفسه في [اشتقاق المفاتيح](/qoresign/guides/key-derivation).

### طبقة الموقِّع في QORel {#signer-layer}

تقسم الحزمة `qorel-signer` العمل إلى ثلاث واجهات:

- `PqSigner`: بدائية ما بعد كمومية (`algorithm_id` و`public_key` و`sign`). يتوافر `MlDsa87Signer`، بتوقيع hedged افتراضيًا وتوقيع حتمي لنواقل الاختبار؛ ويُتحقق من كل توقيع قبل استخدامه.
- `SignBytesFramer`: قواعد السلسلة (`check_body` و`frame` و`pack`).
- `TxExtensionSigner`: ما يستدعيه المُرحِّل. يجمع `PqExtensionSigner` بين بدائية وframer.

يبني المُرحِّل المعاملة بهذا الترتيب: يرمّز الجسم دون أي امتداد للموقِّع المشارك (`B0`)؛ يرمّز auth info النهائية (`A`)؛ يسأل الموقِّع المشارك عن خيارات الامتداد المطلوب إلحاقها؛ يعيد ترميز الجسم بها؛ ينشئ التوقيع الكلاسيكي على مستند التوقيع للجسم النهائي. ولاستخدام الحزمة من Rust، اعتمد عليها من المستودع (فهي ليست على crates.io):

```toml
[dependencies]
qorel-signer = { git = "https://github.com/qorechain/QORel", tag = "qorel-v0.1.0" }
```

يوجد استدعاء كامل، يبني الموقِّع الهجين لسلسلة ويسأله عن خيارات الامتداد، في `crates/qorel-signer/README.md` في المستودع. تعمل الحزمة على بايتات protobuf الخام، وترفض الأجسام التي سترفضها السلسلة (خيار امتداد حرج موجود أصلًا، أو `unordered`، أو حقول مجهولة)، ولا ترجع أبدًا إلى sign bytes الإصدار v1 على شبكات QoreChain قبل معرفة الإصدار، وتتحقق من كل توقيع تنشئه، وتصفّر الأسرار وتحجبها في مخرجات `Debug`. وتعيد اختباراتها بناء معاملات قبلها معالج ante في السلسلة، بايتًا ببايت. راجع أيضًا [qorel-signer في النظرة العامة](/qorel/overview#qorel-signer).

والسلسلة التي تحتاج إلى توقيع إضافي مختلف تنفّذ framer، وبدائية جديدة إذا اختلفت الخوارزمية؛ ولا يتغير شيء آخر في المُرحِّل.

### المكتبات {#libraries}

| اللغة | الحزمة | التوقيع الهجين |
|---|---|---|
| Rust | `qorechain-sdk` (crates.io)، أو `qorel-signer` من [مستودع QORel](https://github.com/qorechain/QORel) (`crates/qorel-signer`) | `qorel_signer::qorechain::qorechain_hybrid_signer` مع `PqExtensionSigner`؛ و`qorechain::tx::build_hybrid_tx` |
| TypeScript وJavaScript | `npm install @qorechain/sdk` | يوقّع `TxClient` هجينًا بواسطة `pqcKeypair`؛ و`ensurePqcRegistered` |
| Go | `go get github.com/qorechain/qorechain-sdk/packages/go@latest` | `qorechain/tx` (بناء هجين وتوقيع)، و`qorechain/signbytes`، و`qorechain/pqcdx` |
| Python | `pip install qorechain-sdk` | `build_hybrid_tx` و`build_hybrid_signature_extension` |
| Java وKotlin | `io.github.qorechain:qorechain-sdk` (Maven Central) | `PqcDx` (التسجيل ومسار الإرسال الهجين) وبانِي المعاملة الهجينة |
| C وغيرها | [`qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) | ارتباطات توليد مفاتيح ML-DSA-87 والتوقيع والتحقق؛ ثم أطّر الـ sign bytes كما سبق |

راجع [حزم المطورين](/developer-tools/overview) للإصدار الحالي لكل حزمة و[QoreSign](/qoresign/overview) للتوقيع في محفظة أو خادم خلفي. العملاء الكلاسيكيون فقط في بعض الحزم لا يستطيعون إرسال معاملات المسار الأصلي؛ فتحقق من صفحة الحزمة قبل استخدام أحدها للكتابة.

### نواقل الاختبار {#test-vectors}

يضم `crates/qorel-signer/tests/vectors/` في مستودع QORel:

- ملف إجابات معروفة لـ sign-bytes؛
- نواقل معاملات الترحيل: الجسم بدون الامتداد، والـ sign bytes، وبايتات الامتداد، والمعاملة الموقّعة الكاملة، أُعيد بناؤها بايتًا ببايت من معاملات قبلتها السلسلة؛
- ناقل اشتقاق المفاتيح عبر مختلف SDK.

شغّلها بلغتك قبل إرسال أي شيء إلى شبكة حية. ونواقل QoreSign في [نواقل الاختبار](/qoresign/vectors).

### إضافة التوقيع ما بعد الكمومي إلى مُرحِّل آخر {#other-relayers}

نقطة الربط هي «بعد أن تصبح auth info نهائية وقبل بناء مستند التوقيع الكلاسيكي». وصِل الامتداد هناك:

- في المُرحِّلات المبنية على Hermes، هذه هي `crates/relayer/src/chain/cosmos/encode.rs::sign_tx`. وتغيير QORel هناك عام: يمكن لأي `TxExtensionSigner` إضافة خيارات امتداد.
- في مُرحِّلات Go المبنية على الحزمة `client/tx` من Cosmos SDK، غلّف `TxBuilder` قبل `SetSignatures`.

## كيفية الوصول {#how-to-access}

- **الشبكة.** العقد نفسه على شبكتي QoreChain؛ أما QORel نفسه فمُختبَر على شبكة الاختبار فقط.
- **المفتاح والحساب.** حساب ممول بمفتاح ML-DSA-87 مسجّل؛ وQOR الخاص بشبكة الاختبار من [صنبور لوحة التحكم](/dashboard/faucet).
- **التكلفة.** المكتبات مجانية (Apache-2.0). وتدفع المعاملات الغاز بحد أدنى 0.1 uqor لكل وحدة غاز.

## أين يُنشر {#where-published}

| الحزمة | السجل | المصدر |
|---|---|---|
| `qorel-signer` | في المستودع (`crates/qorel-signer`)؛ وليست على crates.io، فاستخدم اعتمادية git أعلاه | [qorechain/QORel](https://github.com/qorechain/QORel) |
| `qorechain-sdk` و`@qorechain/sdk` ووحدة Go ومُنتَج Maven | crates.io وnpm وGo proxy وMaven Central وPyPI | [qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk) |
| `qorechain-pqc` | npm وPyPI وcrates.io وGo وMaven | [qorechain/qorechain-pqc](https://github.com/qorechain/qorechain-pqc) |

## الحدود والمشكلات المعروفة {#limits}

- **ML-DSA-87 فقط (معرّف الخوارزمية 1).** وهي الخوارزمية الوحيدة التي يوقّع بها QORel والمكتبات أعلاه.
- **إصدار sign-bytes.** توثّق هذه الصفحة الإصدار 2، الذي تتحقق منه الشبكتان. ويجب أن تقرأ الأداة الإصدار من السلسلة (سجلات الترقيات المطبّقة) بدلًا من افتراضه؛ وهذا ما يفعله QORel.
- **التوقيع محلي.** لا تحتفظ أي من هذه المكتبات بمفتاح نيابةً عنك ولا توقّع عبر محفظة عتادية.
- **أمثلة اللغات لا تتكرر هنا.** استخدم البدء السريع الخاص بكل حزمة؛ ولا يدّعي هذا الدليل أن كل لغة شُغِّلت مقابل نواقل اختبار QORel.
