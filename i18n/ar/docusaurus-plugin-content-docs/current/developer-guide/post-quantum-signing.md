---
slug: /developer-guide/post-quantum-signing
title: التوقيع ما بعد الكمومي
sidebar_label: التوقيع ما بعد الكمومي
sidebar_position: 8
---

# التوقيع ما بعد الكمومي

`qorechain-pqc` هي مكتبة التشفير ما بعد الكمومي مفتوحة المصدر **القائمة على المعايير فقط** التي تقف خلف QoreChain. توفّر للمحافظ والمُدمِجين والأدوات نفس الأوليات (primitives) التي تستخدمها السلسلة بالضبط — في ست لغات، بواجهة برمجية واحدة متسقة، **مثبتة التوافق على مستوى البايت** عبر مجموعة مشتركة من متجهات الاختبار عبر اللغات.

تغلّف المكتبة تطبيقات مدقَّقة لـ**معايير NIST النهائية**. وهي **لا** تبتكر مخططًا مخصصًا: فالمتغير غير القياسي هو بالضبط ما يكسر قابلية التشغيل البيني (توقيع يُنتَج في مكان ما لن يتحقق في مكان آخر). يتم التحقق من كل ربط لغوي مقابل نفس المتجهات، بحيث إن توقيع ML-DSA المُنتَج بلغة ما يتحقق في كل لغة أخرى، وتتطابق الأسرار المشتركة لـ ML-KEM عبر اللغات الست جميعها، وتكون خلاصات SHAKE-256 متطابقة.

* **المستودع:** [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc)
* **الترخيص:** Apache-2.0

## الأوليات

| الأولية | المعيار | الدور | المستويات (الافتراضي بخط **عريض**) |
| --- | --- | --- | --- |
| **ML-DSA** | FIPS-204 | التوقيعات الرقمية | 44 · 65 · **87** |
| **ML-KEM** | FIPS-203 | تغليف المفاتيح | 512 · 768 · **1024** |
| **SHAKE-256** | FIPS-202 | تجزئة قابلة لتمديد المخرجات | — |

هذه هي نفس الأوليات التي تشغّلها QoreChain على مستوى البروتوكول: توقيعات **ML-DSA-87 (Dilithium-5)**، وتغليف المفاتيح **ML-KEM-1024**، و**SHAKE-256** كتجزئة التطبيق الافتراضية. راجع [الأمان ما بعد الكمومي](/architecture/post-quantum-security) لمعرفة كيف تستخدمها السلسلة.

### الأحجام (بالبايت)

اختر مستوى الأمان وفق ميزانيتك من حيث الحجم/الأمان.

| المخطط | الأمان | المفتاح العام | التوقيع / النص المشفَّر |
| --- | --- | --- | --- |
| ML-DSA-44 | L2 | 1312 | 2420 |
| ML-DSA-65 | L3 | 1952 | 3309 |
| **ML-DSA-87** | L5 | 2592 | 4627 |
| ML-KEM-512 | L1 | 800 | 768 |
| ML-KEM-768 | L3 | 1184 | 1088 |
| **ML-KEM-1024** | L5 | 1568 | 1568 |

> لا يمكنك جعل معيار NIST أصغر مع بقائه قياسيًا. يمتلك ML-DSA-87 أحجام مفاتيح/توقيعات ثابتة وبايتات ثابتة — و«تحسينه» يُنتج متغيرًا غير قياسي لا يستطيع أي تطبيق آخر التحقق منه. لتقليص البصمة على السلسلة، استخدم الروافع المذكورة أدناه بدلًا من تعديل المخطط.

## اللغات والحزم

تعرض كل لغة نفس الواجهة البرمجية، وكل واحدة مدعومة بتطبيق مدقَّق مختلف. هذا ما يضمن التوافق على مستوى البايت — فالخلفيات المستقلة تتفق على المعيار.

| اللغة | الحزمة | التثبيت | مدعومة بـ |
| --- | --- | --- | --- |
| JavaScript / TypeScript | `@qorechain/pqc` (npm) | `npm i @qorechain/pqc` | [@noble/post-quantum](https://github.com/paulmillr/noble-post-quantum) |
| Rust | `qorechain-pqc` (crates.io) | `cargo add qorechain-pqc` | `fips204` · `fips203` · `sha3` |
| Python | `qorechain-pqc` (PyPI) | `pip install qorechain-pqc` (الاستيراد باسم `qorpqc`) | [liboqs-python](https://github.com/open-quantum-safe/liboqs-python) |
| Go | `github.com/qorechain/qorechain-pqc/go` | `go get github.com/qorechain/qorechain-pqc/go` | [Cloudflare CIRCL](https://github.com/cloudflare/circl) |
| C | `c/` (مكتبة ساكنة + ترويسة) | البناء من [المستودع](https://github.com/qorechain/qorechain-pqc) | [liboqs](https://github.com/open-quantum-safe/liboqs) + OpenSSL |
| Java | `io.github.qorechain:qorechain-pqc` (Maven Central) | `io.github.qorechain:qorechain-pqc:0.2.2` | [Bouncy Castle](https://www.bouncycastle.org/) |

:::info التوفر
روابط JavaScript وRust وPython وGo وJava اللغوية كلها **منشورة** بالإصدار **0.2.2** (npm وcrates.io وPyPI ووكيل وحدات Go باسم `v0.2.2` وMaven Central؛ جرى التحقق في 21 أكتوبر 2026). ثبّتها باستخدام الأوامر أعلاه. توزيعة Python تُثبَّت باسم `qorechain-pqc` لكنها **تُستورَد باسم `qorpqc`**. حزمة **Java** هي `io.github.qorechain:qorechain-pqc:0.2.2` (بخلفية Bouncy Castle). أضاف الإصدار **0.2.0** الدالة `hybridSignBytes` الواعية بالإصدار (أدناه)، وصحّح الإصدار **0.2.1** اسم الترقية الذي يحدد الانتقال إلى v2 على الشبكة الرئيسية، وصحّح الإصدار **0.2.2** الوثائق والتعليقات المتعلقة بالتوقيع المُحوَّط مقابل الحتمي (تقبل السلسلة كليهما؛ وفي رابط JavaScript لم يتغير في الشيفرة سوى ثابت الإصدار)، لذا استخدم 0.2.1 أو أحدث. ربط **C** هو مكتبة ساكنة + ترويسة تبنيها بنفسك من [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc).
:::

## التوقيع الحتمي (الافتراضي) {#deterministic-signing}

اعتبارًا من الإصدار **0.1.1** (وفي كل إصدار لاحق)، تُنتج `sign()` متغير ML-DSA **الحتمي** (FIPS-204 §3.4، حيث تكون عشوائية التوقيع 32 بايتًا صفرية) في **الروابط الست جميعها**. تقبل السلسلة أي توقيع ML-DSA-87 صالح وفق FIPS-204، سواء كان مُحوَّطًا (hedged) أو حتميًا: فالتحقق متطابق في الحالتين، ولا يستطيع المُحقِّق التمييز بينهما دون المفتاح السري. توقّع الروابط بشكل حتمي افتراضيًا كي تُنتج المعاملة نفسها دائمًا التوقيع نفسه وتجزئة المعاملة نفسها، وكي تطابق جميع الروابط متجهات الاختبار المشتركة.

حقائق أساسية:

* المُخرَج الحتمي **متطابق بايتًا ببايت عبر الروابط الست جميعها** للمفتاح والرسالة نفسيهما، ومثبّت بمتجهات اختبار مشتركة عبر اللغات.
* يظل التوقيع المُحوَّط متاحًا **كخيار صريح** في كل رابط (مثل `{hedged: true}` في JavaScript، و`sign_hedged` في Rust، و`mldsaSignHedged` في Java، و`sign(..., hedged=True)` في Python). **تقبل السلسلة** التوقيعات المُحوَّطة مثل أي توقيع FIPS-204 صالح؛ والفرق الوحيد أن التوقيع، ومن ثم تجزئة المعاملة، يتغير في كل مرة توقّع فيها.
* كان الإصدار 0.1.0 من رابط JavaScript يوقّع بشكل مُحوَّط افتراضيًا. تلك التوقيعات صالحة على السلسلة أيضًا؛ قم بالترقية إلى 0.1.1 إذا أردت توقيعات قابلة لإعادة الإنتاج تطابق المتجهات المشتركة.

## تسجيل مفتاحك {#pqc-key-registration}

يسجّل كل حساب مفتاحه العام ML-DSA-87 **مرة واحدة وبشكل صريح**. لا يوجد تسجيل تلقائي: فالمفتاح العام المضمَّن في معاملة هجينة لاحقة (مثل خيار `includePqcPublicKey` في SDK) يُحمَل في الامتداد لكنه **لا** يسجّله. **التسجيل الأول** هو معاملة مسار Cosmos الوحيدة التي يجوز توقيعها توقيعًا كلاسيكيًا، بحيث يتمكن الحساب الجديد كليًا من تهيئة مفتاحه الأول؛ أما الحساب الذي لديه مفتاح بالفعل فيجب أن يوقّع توقيعًا هجينًا كل رسالة مفاتيح لاحقة. نفّذه باستخدام `qorechaind` الخاص بالإصدار الرسمي (فالملف التنفيذي المبني من المصدر العام لا يستطيع التوقيع؛ راجع [البناء من المصدر](/developer-guide/building-from-source))، أو باستخدام QoreX، أو باستخدام `ensurePqcRegistered` في SDK:

```bash
# 1. Create a key. It is stored unencrypted under ~/.qorechaind/pqc/mypqc.dilithium (mode 0600) and the public key hex is printed.
qorechaind tx pqc gen-key mypqc

# 2. Register the public key on your account (classical-signed, because the account has no key yet).
#    --pqc-key mypqc also attaches the optional proof of possession (see below).
qorechaind tx pqc register-key-v2 dilithium5 <printed-pubkey-hex> hybrid --pqc-key mypqc \
  --from mykey --chain-id qorechain-vladi --gas 600000 --fees 60000uqor -y

# 3. Verify.
qorechaind query pqc account <address>
```

حدّد `--gas` صراحةً: فالمفتاح العام البالغ 2,592 بايتًا قد يتجاوز الغاز الافتراضي البالغ 200,000 (استخدمت تسجيلات الشبكة الرئيسية ما يقارب 220,000 إلى 310,000؛ ويحمل التسجيل المصحوب بإثبات امتلاك توقيعًا إضافيًا واحدًا بحجم 4,627 بايتًا، أي نحو 46,000 غاز إضافي)، ويجب ألا تقل الرسوم عن الغاز × 0.1 uqor، لذا يتطلب `--gas 600000` رسومًا قدرها `--fees 60000uqor` أو أكثر. الصيغة القديمة `qorechaind tx pqc register-key <pubkey-hex> hybrid` مكافئة لـ Dilithium-5. بعد ذلك، ابنِ كل معاملة على مسار Cosmos باستخدام `--generate-only` ووقّعها باستخدام `qorechaind tx pqc cosign`. ملف المفتاح هو مفتاح التوقيع ما بعد الكمومي للحساب: كل من يستطيع قراءته يمكنه التوقيع المصاحب عن الحساب مع المفتاح الكلاسيكي، لذا احتفظ بنسخة احتياطية منه كما تفعل مع العبارة الاستذكارية (ويمكن إعادة اشتقاقه من العبارة الاستذكارية، انظر أدناه).

المفتاح المسجَّل هو أيضًا أول متطلبَين اثنين لإرسال معاملات EVM؛ والثاني هو [نافذة تفويض EVM](/developer-guide/evm-development#evm-window) المفتوحة.

### ما تتحقق منه السلسلة عند التسجيل (الشبكة الرئيسية v3.2.3 وما بعده) {#key-integrity}

منذ ترقية v3.2.3 (طُبِّقت على الشبكة الرئيسية عند الارتفاع 3,662,051 في 20 أكتوبر 2026) تتحقق السلسلة من المفتاح نفسه، لا من أن طوله صحيح فحسب:

| القاعدة | الرفض (النطاق `pqc`) |
| --- | --- |
| يجب أن يكون `key_type` إما `hybrid` أو `pqc_only`؛ إذ لا يسجّل `classical_only` أي مفتاح ما بعد كمومي وسيترك الحساب عاجزاً عن التوقيع مجدداً | الرمز 230 |
| يُرفض أي مفتاح لا يوفّر أي حماية ما بعد كمومية (مفتاح منحلّ لا يحتاج أحد إلى سر له)، سواء عند التسجيل أو التدوير أو الترحيل | الرمز 230 |
| لا يمكن تسجيل مفتاح سبق للحساب استخدامه مرة أخرى ولا التدوير إليه مجدداً (يتذكّر الحساب المفاتيح المسحوبة من الخدمة) | الرمز 232 |
| يجب أن يكون المفتاح الكلاسيكي في التسجيل هو مفتاح secp256k1 المضغوط الخاص بالمُوقِّع نفسه (منذ v3.2.2) | الرمز 45 |
| إثبات الامتلاك الاختياري، إن وُجد، يجب أن يتحقق | الرمز 231 |
| الحساب الذي يحتفظ بمفتاح بالفعل يجب أن يوقّع توقيعاً هجيناً أي رسالة مفاتيح أخرى (تسجيل، ترحيل)؛ ولا يجوز أن يكون كلاسيكياً إلا إصلاح سجل لا يحتوي على أي مفتاح صالح للاستخدام | الرمز 234 |
| لا يجوز أن يؤدي إيقاف خوارزمية أو تعطيلها إلى ترك السلسلة دون خوارزمية توقيع نشطة | الرمز 233 |

علاوة على ذلك، منذ v3.2.3، لا يمكن إرسال أي من رسائل المفاتيح (`MsgRegisterPQCKey` و`MsgRegisterPQCKeyV2` و`MsgRotatePQCKey` و`MsgMigratePQCKey`) نيابةً عن حساب عبر `authz`؛ ويمكن للمعاملة أن تحمل **امتداد توقيع هجين واحداً** على الأكثر؛ ولم يعد بإمكان الحساب الذي **ليس** له مفتاح مسجَّل أن يرفق امتداداً هجيناً لا يوجد ما يُتحقَّق منه مقابله (لا يجتاز إلا التسجيل، تماماً كما هي الحال دون أي امتداد).

### إثبات الامتلاك (اختياري) {#proof-of-possession}

يمكن للتسجيل أيضاً أن يثبت أن المُسجِّل يحوز السر الخاص بالمفتاح الجديد. يوقّع المفتاح الرسالة `qorechain-pqc-pop-v1|<chain-id>|<algorithm id>|<address>|<public key hex>` (معرّف الخوارزمية هو `1` لـ ML-DSA-87؛ والمفتاح العام بصيغة سداسية عشرية بأحرف صغيرة) ويوضع التوقيع في الحقل `proof_of_possession` ضمن `MsgRegisterPQCKeyV2`. وفي سطر الأوامر، يبنيه `register-key-v2 ... --pqc-key <name>` ويرفقه. ومع TypeScript SDK بالإصدار 0.9.0، ترفق `ensurePqcRegistered` الإثبات بنفسها متى طبّقت الشبكة v3.2.3 (وتبني `signProofOfPossession` / `verifyProofOfPossession` إثباتاً وتتحقق منه يدوياً)؛ وتفعل `@qorechain/chain-bridge` 0.2.3 الشيء نفسه عند تمرير `cosmosRest`. أما `@qorechain/wallet-adapter` (0.4.0) وإصدارات SDK السابقة للإصدار 0.9.0 فلا ترفق إثباتاً، لذا فالتسجيل الذي يُجرى عبرها لا يحمل أياً منه، وما زالت السلسلة تقبله. تتحقق السلسلة من الإثبات **عند وجوده** وترفض التسجيل إذا لم يتحقق (الرمز 231)؛ أما التسجيل دون إثبات فما زال مقبولاً على الشبكة الرئيسية. ولأن الرسالة تسمّي السلسلة والخوارزمية والحساب والمفتاح، فإن إثباتاً صُنع لأحدها لا يثبت شيئاً بالنسبة لغيره.

على الشبكة الاختبارية (v3.2.4، **للشبكة الاختبارية فقط**) يبيّن سجل الحساب ما إذا كان قد جرى التحقق من إثبات (`possession_proven`، في `GET /qorechain/pqc/v1/account/{address}`)، ويتطلب تسجيل مدقّق الجسر إثباتاً. وكلاهما غير موجود على الشبكة الرئيسية بعد؛ ومن شأن مقترح حوكمة الشبكة الرئيسية 13 أن يطبّق v3.2.4 عند الارتفاع 3,742,566.

## رموز الرفض (النطاق `pqc`) {#pqc-codes}

| الرمز | المعنى |
| --- | --- |
| 20 | التوقيع الهجين مطلوب: المعاملة لا تحمل أي امتداد PQC (لا يُعفى إلا التسجيل الأول، وإلغاء السجن (unjail) من حساب بلا مفتاح) |
| 21 | لم يتحقق جزء ML-DSA-87، انظر [أدناه](#code-21) |
| 26, 27, 28 | مسار EVM: لا توجد نافذة مفتوحة أو لا يوجد مفتاح / استُنفدت النافذة / حدود النافذة غير صالحة، انظر [تطوير EVM](/developer-guide/evm-development#evm-window) |
| 45 | المفتاح الكلاسيكي في التسجيل ليس مفتاح secp256k1 المضغوط الخاص بالمُوقِّع نفسه |
| 60, 61 | تفويض EIP-7702: لا توجد موافقة ما بعد كمومية على هذا التفويض / طلب التفويض غير صالح |
| 62, 63 | لا توجد للحساب المفوَّض نافذة تغطي الإجراء / معاملة Ethereum تُنفَّذ على مسار EVM فقط |
| 230 | مفتاح ضعيف أو تسجيل `classical_only` |
| 231 | إثبات الامتلاك لا يتحقق |
| 232 | سبق لهذا الحساب استخدام المفتاح |
| 233 | لن تبقى أي خوارزمية توقيع نشطة |
| 234 | صيانة المفاتيح من حساب لديه مفتاح تحتاج إلى التوقيع الهجين |

## استكشاف أخطاء رمز `pqc` رقم 21 (`hybrid_verify_failed`) وإصلاحها {#code-21}

يعني الرمز 21 أن جزء ML-DSA-87 من التوقيع الهجين لم يتحقق مقابل المفتاح المسجّل للحساب. ولا يكون السبب **أبدًا** اختيار التوقيع المُحوَّط بدلًا من الحتمي. تحقّق بالترتيب التالي:

1. **إصدار بايتات التوقيع (sign-bytes).** يغطي توقيع PQC إما بايتات التوقيع v1 أو v2، وتتحقق الشبكة من صيغة واحدة فقط عند أي ارتفاع: انتقلت `qorechain-diana` إلى v2 عند ترقيتها `v3.1.98`، و`qorechain-vladi` عند ترقيتها `v3.2.0`، والسلاسل التي تنشأ لاحقًا تكون v2 منذ التكوين. تختار حِزم SDK الحالية الصيغة لكل شبكة؛ أما المُوقِّعات المبنية يدويًا فيجب أن تسأل العقدة عن الترقية المطبّقة (انظر [الحسابات وتوقيع PQC](/sdk/concepts/accounts-pqc)).
2. **معرّف السلسلة في بايتات التوقيع v2.** تربط v2 معرّف السلسلة، لذا فإن التوقيع المُعدّ لـ `qorechain-diana` لا يتحقق على `qorechain-vladi` والعكس صحيح.
3. **مكتبة PQC قديمة.** تُنتج الإصدارات السابقة للمعيار (ما قبل FIPS-204) توقيعات يرفضها المُحقِّق المتوافق مع المعيار. استخدم `qorechain-pqc` 0.1.1 أو أحدث.
4. **مفتاح خاطئ.** يجب أن يكون المفتاح العام هو المفتاح المسجّل للحساب (`GET /qorechain/pqc/v1/account/{address}`). المفتاح المشتق باشتقاق مختلف (مثل اشتقاق الجسر القديم `shake256(mnemonic)` بدلًا من الاشتقاق المرتبط بالعنوان) يوقّع توقيعًا صالحًا لكنه لا يطابق. راجع [تدوير المفتاح](#key-rotation) للانتقال إلى المفتاح القياسي.

## الاشتقاق الحتمي للمفاتيح والاسترداد {#key-derivation}

يربط الاشتقاق القياسي في المنظومة مفتاح ML-DSA-87 بالحساب، بحيث يكون **قابلًا للاسترداد من العبارة الاستذكارية (mnemonic) للحساب وحدها**:

```
seed = SHAKE-256("qorechain:pqc:v1|" + cosmosAddress + "|" + mnemonic)
(publicKey, secretKey) = mldsa.keygen(seed)
```

كل أداة منشورة (`@qorechain/wallet-adapter` و`@qorechain/sdk` و`@qorechain/chain-bridge` ≥0.1.1) تشتق هذا المفتاح نفسه، بحيث تُنتج عبارة استذكارية واحدة مفتاحًا واحدًا بصرف النظر عن الأداة المستخدمة. استرد مفتاحًا عبر سطر الأوامر (العبارة الاستذكارية عبر stdin):

```bash
# the mnemonic is read from stdin; keep it out of shell history by redirecting from a file you delete afterwards
qorechaind tx pqc recover-key mykey qor1youraddress... < mnemonic.txt
# legacy tooling derivation (shake256(mnemonic) only, unbound to the address):
qorechaind tx pqc recover-key mykey qor1youraddress... --derivation bridge < mnemonic.txt
```

يُكتب المفتاح الخاص المُسترَد كنص سداسي عشري غير مشفَّر (الصلاحيات 0600) في `<home>/pqc/mykey.dilithium` لاستخدامه مع `tx pqc cosign`.

## تدوير المفاتيح (نفس الخوارزمية) {#key-rotation}

اعتبارًا من إصدار السلسلة **v3.1.85**، تقوم **`MsgRotatePQCKey`** بتدوير مفتاح ML-DSA-87 الخاص بالحساب **ضمن نفس الخوارزمية** — بينما كان التسجيل سابقًا لمرة واحدة فقط، وكانت `MigratePQCKey` تعبر بين الخوارزميات فحسب. استخدمها لترحيل مفتاح مشتق بالطريقة القديمة إلى الاشتقاق القانوني المرتبط بالعنوان، أو لسحب مفتاح مُخترَق من الخدمة.

التدوير **موقَّع توقيعًا مزدوجًا**: يوقّع كل من المفتاح القديم والمفتاح الجديد الرسالة مفصولة النطاق `"qorechain-pqc-rotate-v1|chainId|algorithm|account|oldPubHex|newPubHex"`. إعادة التشغيل (replay) مستحيلة بنيويًا — فبمجرد التدوير، لم يعد المفتاح القديم يطابق المفتاح المسجَّل، وبالتالي لا يمكن للرسالة نفسها أن تُطبَّق مجددًا. التدوير عملية **مقصورة على المفتاح الجذري فقط** (لا يمكن تفويضها أبدًا إلى [مُوثِّق](/developer-guide/account-abstraction#authenticators))، والمعاملة نفسها لا تزال موقَّعة توقيعًا هجينًا بالمفتاح *القديم*، ما يثبت الملكية الحالية.

أمر سطر أوامر بخطوة واحدة (العبارة الاستذكارية عبر stdin؛ يسترد المفتاح القديم، ويشتق المفتاح الجديد أو يولّده، ويوقّع توقيعًا مزدوجًا، ويبث المعاملة):

```bash
# migrate a legacy-derived key to the canonical derivation (mnemonic on stdin):
qorechaind tx pqc rotate-key --old-derivation bridge --new-derivation adapter \
  --from mykey --chain-id qorechain-vladi --gas 600000 --fees 60000uqor -o json -y < mnemonic.txt

# rotate to a brand-new random key (compromise recovery); --new-key-out is required and is written before anything is sent:
qorechaind tx pqc rotate-key --old-derivation adapter --new-random --new-key-out mykey-new \
  --from mykey --chain-id qorechain-vladi --gas 600000 --fees 60000uqor -o json -y < mnemonic.txt
```

يحمل التدوير مفتاحين عامين بحجم 2,592 بايتًا لكل منهما وثلاثة توقيعات، لذا يحتاج إلى غاز أكبر بكثير من التحويل؛ أبقِ `--gas 600000` صريحًا ورسومًا لا تقل عن 60,000 uqor. يتم رفض `--new-random` دون `--new-key-out` (إصدار العقدة v3.2.1 وما بعده) كي لا يتركك التدوير أبدًا دون المفتاح الجديد.

في الشيفرة، توفّر `@qorechain/wallet-adapter` (≥0.1.7) و`@qorechain/sdk` (≥0.7.0) نفس المسار (متزامن؛ ويُرجع الرسالة مع زوجَي المفاتيح كليهما):

```js
import { rotatePqcKeyMsgFromMnemonic } from "@qorechain/wallet-adapter";

// Builds the dual-signed MsgRotatePQCKey migrating shake256(mnemonic) -> canonical:
const { msg, oldKeypair, newKeypair } = rotatePqcKeyMsgFromMnemonic({
  account: "qor1youraddress...", mnemonic, chainId: "qorechain-vladi",
});
// Sign & broadcast `msg` with the account's normal hybrid signer, using `oldKeypair` for the envelope's PQC signature.
```

ترفض أدوات التدوير المساعدة في SDK 0.9.0 و`@qorechain/wallet-adapter` 0.4.0 الاشتقاق القديم بوصفه المفتاح **الجديد** (فهو غير مرتبط بالحساب)؛ ويمكن أن يبقى المفتاح القديم هو المفتاح السابق. بعد نجاح التدوير، يوقّع المفتاح الجديد (الرمز 0) ويُرفض المفتاح القديم (الرمز 21 في `pqc`). منذ v3.2.3 يرفض التدوير (مثل الترحيل) مفتاحاً جديداً لا يوفّر أي حماية ما بعد كمومية (الرمز 230) ومفتاحاً سبق للحساب استخدامه (الرمز 232)، ولا يمكن إرساله عبر `authz`.

## واجهة برمجية متسقة

توفّر كل لغة نفس الواجهة:

```text
keygen()                              -> (publicKey, secretKey)
sign(secretKey, message)              -> signature
verify(publicKey, message, signature) -> bool

kem.keygen()                          -> (publicKey, secretKey)
kem.encapsulate(publicKey)            -> (cipherText, sharedSecret)
kem.decapsulate(secretKey, cipherText)-> sharedSecret

shake256(data, outLen=32)             -> digest
```

### البداية السريعة (JavaScript / TypeScript)

```js
import { mldsa, mlkem, shake256, pubkeyHash } from '@qorechain/pqc';

// ML-DSA-87 signatures
const { publicKey, secretKey } = mldsa.keygen();
const sig = mldsa.sign(secretKey, message);
mldsa.verify(publicKey, message, sig); // true

// ML-KEM-1024 key encapsulation
const { publicKey: ek, secretKey: dk } = mlkem.keygen();
const { cipherText, sharedSecret } = mlkem.encapsulate(ek);
mlkem.decapsulate(dk, cipherText); // === sharedSecret

// SHAKE-256 + blockchain helpers
shake256(data, 32);        // 32-byte digest
pubkeyHash(publicKey, 20); // pay-to-pubkey-hash
```

تتوفر صادرات خاصة بكل مستوى عندما لا يكون الافتراضي هو ما تريده: `mldsa44/65/87` و`mlkem512/768/1024` (‏`mldsa` / `mlkem` هما افتراضيا المستوى L5).

روابط **Rust وGo وC وPython وJava** تعكس هذا بالضبط. على سبيل المثال:

```rust
// Rust
use qorechain_pqc::mldsa::default as mldsa;
let (pk, sk) = mldsa::keygen()?;
let sig = mldsa::sign(&sk, msg)?;
assert!(mldsa::verify(&pk, msg, &sig));
```

```go
// Go
pk, sk, _ := pqc.MLDSA.Keygen()
sig, _ := pqc.MLDSA.Sign(sk, msg)
pqc.MLDSA.Verify(pk, msg, sig) // true
```

## أدوات مساعدة للبلوكشين

بالإضافة إلى الأوليات الخام، تعرض المكتبة أداتين مساعدتين يحتاجهما المُدمِجون للتفاعل مع حسابات QoreChain ومعاملاتها.

### `pubkeyHash(pk, len=20)`

أداة تسجيل من نوع **الدفع إلى تجزئة المفتاح العام** (pay-to-pubkey-hash). تُنتج تجزئة SHAKE-256 قصيرة (20–32 بايتًا) للمفتاح العام. النمط: خزّن `pubkeyHash` فقط في حالة الحساب واطلب المفتاح العام الكامل في المعاملة. تبقى حالة الحساب صغيرة جدًا بصرف النظر عن المفتاح الذي يتراوح حجمه بين 1 و2.5 كيلوبايت.

### `hybridSignBytes(version, chainId, bodyWithoutPqcExt, authInfo)`

تأطير **بايتات التوقيع بالامتداد الهجين** المتوافق مع محافظ QoreChain. يُنتج هذا بالضبط البايتات التي يجب توقيعها بـ ML-DSA-87 (Dilithium-5) لتكوين النصف ما بعد الكمومي من المعاملة الهجينة. توجد صيغتان وتتحقق الشبكة من صيغة واحدة فقط عند أي ارتفاع: **v1** = `BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A` و**v2** = `"qorechain-pqc-hybrid-v2" ‖ BE64(len chainId) ‖ chainId ‖ BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A` (حيث `B0` هو جسم المعاملة دون امتداد PQC، و`A` هو auth info). كلتا الشبكتين العامتين على **v2**. المكتبة نقية (pure)، لذا يختار المستدعي الصيغة: اسأل العقدة `GET /cosmos/upgrade/v1beta1/applied_plan/{name}` عن **كلٍّ من** `v3.2.0` (اسم ترقية الشبكة الرئيسية) و`v3.1.98` (الاسم الأسبق للشبكة الاختبارية) واستخدم v2 إذا كان أي من الارتفاعين أكبر من 0؛ وتنفّذ `signBytesVersionForApplied` و`signBytesVersionFor(chainId, height)` هذه القاعدة (استخدم `@qorechain/pqc` 0.2.1 أو أحدث؛ وتُطلق صيغة المعاملين من 0.1.x استثناءً).

هذا هو الجزء الذي تستخدمه المحافظ والمُدمِجون لإنتاج **التوقيع الهجين المطلوب** على مسار معاملات cosmos. اعتبارًا من إصدار السلسلة الحالي، التوقيعات الهجينة **مطلوبة افتراضيًا** (`hybrid_signature_mode = required`، و`allow_classical_fallback = false`): يجب أن تحمل كل معاملة على مسار cosmos توقيع Dilithium-5 إلى جانب توقيعها الكلاسيكي secp256k1. راجع [الأمان ما بعد الكمومي](/architecture/post-quantum-security) للاطلاع على نموذج الإنفاذ.

يُحسب التوقيع الكلاسيكي secp256k1 على بايتات التوقيع القياسية (التي **تستثني** امتداد PQC)، ويُحسب توقيع ML-DSA-87 ويُرفق كامتداد `PQCHybridSignature`. ولأن بايتات التوقيع الكلاسيكية تستثني الامتداد، يبقى التوقيع الكلاسيكي صالحًا سواء فهم المُحقِّق الجزء ما بعد الكمومي أم لا.

هناك ثلاث طرق لإنتاج هذا التوقيع الهجين:

* **سطر الأوامر** — يُرفق `qorechaind tx pqc cosign` توقيع Dilithium-5 المصاحب بالمعاملة ويبثّها (بعد `qorechaind tx pqc gen-key` وتسجيل المفتاح). وهو جزء من الملف التنفيذي الرسمي فقط. راجع [أوامر المعاملات](/cli-reference/transaction-commands).
* **حزمة QoreChain SDK** — تقوم `buildHybridTx` / `signAndBroadcastHybrid` (مرّر `rest` كي تُحدَّد صيغة بايتات التوقيع) بالعمل المكافئ في TypeScript وPython وGo وRust وJava؛ وفي TypeScript توقّع `client.connectTx(signer, { pqcKeypair })` (SDK 0.9.0) كل معاملة توقيعاً هجيناً. سجّل مفتاحك أولًا (انظر أعلاه). راجع [حسابات SDK وتوقيع PQC](/sdk/concepts/accounts-pqc).
* **`qorechain-pqc` مباشرة** — استخدم `hybridSignBytes` لتأطير بايتات التوقيع و`mldsa.sign` لإنتاج توقيع Dilithium-5، عندما تبني أدوات خارج SDK بإحدى اللغات الست المدعومة.

## تحسين البصمة على السلسلة

مفاتيح ML-DSA وتوقيعاتها كبيرة بالمعايير الكلاسيكية. ولأن بايتات المعيار ثابتة، فإن الطريقة لإبقاء البصمة على السلسلة صغيرة هي استخدام هذه الروافع الثلاث — ولا يغيّر أي منها المعيار:

1. **اختر مستوى الأمان بتروٍّ.** توقيعات ML-DSA-65 (المستوى L3) أصغر بنحو 28% من ML-DSA-87 (المستوى L5) وتظل قوية جدًا؛ ونصوص ML-KEM-768 المشفَّرة أصغر من 1024. اختر بحسب حالة الاستخدام.
2. **الدفع إلى تجزئة المفتاح العام.** خزّن `pubkeyHash(pk)` فقط (20–32 بايتًا من SHAKE-256) في حالة الحساب واطلب المفتاح العام الكامل في المعاملة. تبقى حالة الحساب صغيرة جدًا بصرف النظر عن حجم المفتاح.
3. **تحقّق من التوقيعات ثم تخلّص منها.** يجب أن يوجد التوقيع في المعاملة (بيانات الكتلة) لكن لا ينبغي أبدًا كتابته في شجرة الحالة الدائمة.

> **لماذا لا يوجد Falcon؟** كان FN-DSA (Falcon) سيمنح توقيعات أصغر، لكنه **مستبعَد** عمدًا: فـ FN-DSA لا يزال *مسودة* في FIPS-206 (غير نهائية)، والمكتبة القائمة على المعايير فقط لا تشحن إلا المعايير المكتملة. يمكن إعادة النظر فيه بعد اكتمال FIPS-206.

## مواضيع ذات صلة

* [الأمان ما بعد الكمومي](/architecture/post-quantum-security) — كيف تستخدم السلسلة هذه الأوليات وتفرض التوقيعات الهجينة.
* [أوامر المعاملات](/cli-reference/transaction-commands) — مسار سطر الأوامر `tx pqc gen-key` / `tx pqc cosign`.
* [حسابات SDK وتوقيع PQC](/sdk/concepts/accounts-pqc) — المفاتيح والتوقيع الهجين من QoreChain SDK.
* [إعداد المحفظة](/getting-started/wallet-setup) — إنشاء الحسابات المدعومة بـ PQC وإدارتها.
