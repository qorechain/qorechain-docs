---
slug: /developer-tools/custody-kit
title: مجموعة الحفظ QoreChain Custody Kit
sidebar_label: Custody Kit
sidebar_position: 32
---

# مجموعة الحفظ QoreChain Custody Kit

مجموعة الحفظ QoreChain Custody Kit هي دليل تكامل مكتوب، ومجموعة متجهات اختبار، وشيفرة مرجعية صغيرة لجهات الحفظ ومنصات التداول التي تحتفظ بأموال العملاء على QoreChain. تشرح ما تشترطه الشبكة على كل مسار تنفيذ، وتعرض بشيفرة مقروءة الأجزاء التي يسهل الخطأ فيها في أي تكامل: فحص العنوان، وفك ترميز المعاملة الموقّعة والتحقق منها قبل بثّها، والقرار بشأن التحويلات الواردة التي تُحتسب.

وهي موجهة لجهات الحفظ ومنصات التداول ومعالجات المدفوعات والخوادم الخلفية للمحافظ، وللمهندسين والمدققين الذين يراجعون هذه التكاملات. الإصدار **0.1.0**، نُشر في 27 أكتوبر 2026، برخصة Apache-2.0. وهي تعمل مع الشبكة الرئيسية (`qorechain-vladi`) وشبكة الاختبار (`qorechain-diana`)؛ أما الفحوص الحية المرفقة بها فتعمل على شبكة الاختبار وللقراءة فقط.

**اقرأ هذا أولاً: المجموعة شيفرة أمثلة، وليست مكتبة.** تستنسخ المستودع ثم تقرأ المجلد الخاص بلغتك أو تنسخه أو تضمّنه في مشروعك. لا توجد حزمة للمجموعة على npm أو PyPI أو crates.io أو Maven Central، وذلك عن قصد. والاستثناء الوحيد في الشكل هو Go: فمجلد Go وحدة Go بإصدار موسوم، لذا يستطيع `go get` جلبها، لكنها تبقى شيفرة أمثلة بلا وعد بواجهة API مستقرة (راجع [ما هو مكتبة وما هو شيفرة أمثلة](#library-vs-example)). أما التوقيع والتحقق التشفيري فيأتيان من [QoreSign](/qoresign/overview)، وهي مكتبة منشورة.

## الابتكارات {#innovations}

- **سلوك واحد في خمس لغات، يثبته ملف واحد.** تنفّذ TypeScript وPython وGo وRust وJava الدوال الأربع نفسها بالنتائج نفسها ورموز الأخطاء نفسها. وتعمل كل لغة مقابل ملف متجهات الاختبار المشترك `vectors/custody-v1.json`، لذا يستطيع الفريق الذي ينقل المجموعة إلى لغة أخرى أن يثبت تطابقها.
- **رموز أخطاء ثابتة للعناوين.** لا تُطلق `validateAddress` استثناءً أبداً. فهي تعيد عند النجاح صيغتَي كتابة العنوان، أو أحد أحد عشر رمزاً ثابتاً (`EMPTY` و`WHITESPACE` و`BAD_HEX` و`BAD_EIP55` و`NO_CHECKSUM` و`MIXED_CASE` و`BAD_BECH32` و`BAD_CHECKSUM` و`WRONG_PREFIX` و`BAD_LENGTH` و`KIND_NOT_ALLOWED`) ليعرض نموذج السحب السبب الدقيق.
- **فحص التوقيعين قبل البث.** تتحقق `verifyTx` من توقيع secp256k1 على `SignDoc`، ومن طبقة ML-DSA-87 مقابل مفتاح تمرّره أنت، ومن كون المفتاح العام داخل المعاملة هو المتوقع. وتعيد `{ valid, classical, signerKey, pq }` ولا تُطلق استثناءً إلا عند المدخلات المشوهة، وليس عند توقيع سيئ. ويمكن لعملية ثانية تشغيلها على كل سحب موقّع قبل إرسال أي شيء.
- **قرارات الإيداع مع السبب.** تعيد `extractDeposits` كل تحويل وارد في المعاملة مع علم `creditable` و`reason` (`evm_failed` أو `fee_refund` أو `unsupported_message` أو `null`). وهي تلتقط الحالة التي تفاجئ من يدمجون EVM: فتنفيذ EVM الفاشل يبقى يبلّغ عن رمز النتيجة 0 على المستوى الأصلي.
- **منشئ استعلامات يطابق العقدة.** ينتج `buildDepositQuery` مسار REST الدقيق بترميز النسبة المئوية للتحويلات الواردة إلى عنوان (الحد من 1 إلى 100، وحدود الارتفاع، وترتيب تصاعدي)، ويحوّل مدخل `0x` إلى صيغة `qor1`.
- **إرشادات مكتوبة لكل مسار.** يغطي الدليل مسار Native ومسار EVM مع نوافذ التفويض فيه، وينص على أن مسار SVM غير مفتوح للمعاملات، فلا ينبغي بناء أي تدفق إيداع أو سحب عليه.

## حالات الاستخدام {#use-cases}

1. **ماسح إيداعات لمنصة تداول.** احتفظ بمؤشر ارتفاع، واستدعِ `buildDepositQuery({ address, minHeight, maxHeight })` مقابل عقدتك، ثم `extractDeposits(txResponse, address)` لاحتساب `MsgSend` و`MsgMultiSend` وتحويلات EVM الناجحة بوحدة `uqor`. أما تنفيذات EVM الفاشلة واستردادات الغاز والرسائل الأخرى فتُستبعد أو تُوسَم للمراجعة.
2. **مسار سحب بموافق ثانٍ.** بعد أن ينتج الموقّع سحباً موقّعاً هجيناً، تشغّل عملية مستقلة `decodeTx` (المستلم والمبلغ والرسوم والمذكرة) و`verifyTx` (التوقيعان والمفاتيح المتوقعة) قبل بث المعاملة.
3. **استقبال العناوين.** تحقق من كل عنوان سحب يقدمه المستخدم باستخدام `validateAddress`، وارفض عناوين `qorvaloper` وجهةً للدفع، واشترط اختيارياً مجاميع EIP-55 للمدخلات بصيغة hex.
4. **تخطيط HSM.** يستخدم فريق الأمن دليل إدارة المفاتيح للمفاضلة بين مفاتيح ML-DSA-87 المولَّدة في HSM والاشتقاق القانوني المبني على عبارة تذكيرية، وللتحقق من دعم PKCS #11 v3.2 للتوقيع الصرف بـ ML-DSA-87 بسياق فارغ، ولتصميم التدوير والنسخ الاحتياطي.
5. **مسار صرف على EVM.** منصة تداول تصرف على مسار EVM تسجّل مفتاح ML-DSA-87 مرة واحدة، وتفتح نافذة تفويض محدودة النطاق لكل دفعة بمعاملة هجينة واحدة على مسار Native، ثم توقّع معاملات EIP-1559 العادية بمنظومة secp256k1 الموجودة لديها.
6. **التخزين (staking) للعملاء.** تتبع جهة الحفظ التي تقدم التخزين دليل التخزين (التفويض وإلغاء التفويض وإعادة التفويض والمكافآت وأقفال مستوى التخزين) وتفك ترميز كل رسالة تخزين بـ `decodeTx` قبل التوقيع.
7. **النقل إلى لغة أخرى، أو تدقيق.** يشغّل الفريق الذي يكتب تنفيذه الخاص هذا التنفيذ مقابل `vectors/custody-v1.json` ليُظهر أنه يطابق النتائج المرجعية ورموز الأخطاء.
8. **بروفة قبل الشبكة الرئيسية.** يتبع فريق التكامل بروفة شبكة الاختبار (تسجيل المفتاح، وإرسال هجين، ومسح الإيداعات، والتخزين، ونافذة EVM، وتدوير المفتاح) وقائمة تحقق التكامل.

## كيف تعمل {#how-it-works}

### ما تحتويه المجموعة {#contents}

| الجزء | ما هو |
|---|---|
| `docs/` | عشر صفحات دليل: التوقيع لكل مسار، والعناوين والاشتقاق، والإيداعات، والسحوبات، والتخزين، والأخطاء، وإدارة المفاتيح، وبيئة الاختبار، وقائمة تحقق التكامل، والأسئلة الشائعة. |
| `code/ts`, `code/python`, `code/go`, `code/rust`, `code/java` | شيفرة مرجعية بالدوال الأربع نفسها وأمر سطر أوامر مثال صغير لكل لغة. |
| `vectors/custody-v1.json` | متجهات الاختبار: عنوان صالح وآخر سيئ لكل رمز خطأ، و`MsgDelegate` موقّعة هجيناً، و`MsgOpenEVMWindow` موقّعة هجيناً من حساب eth-native، ورسائل التخزين والنوافذ، ومعاملات مشوهة، واستعلامات الإيداع وحالات استخراج الإيداع. تُعاد استخدام متجهات QoreSign بالإشارة إليها ويُتحقق منها بـ SHA-256. |
| الفحوص الحية | فحوص للقراءة فقط على شبكة الاختبار، تُفعَّل بـ `QORE_LIVE_TEST=1`: معاملات التخزين، واستعلام إيداع لتحويل حديث، والتحقق من معاملة هجينة مثبَّتة. |

### ما هو مكتبة وما هو شيفرة أمثلة {#library-vs-example}

| القطعة | النوع | من أين تحصل عليها |
|---|---|---|
| QoreSign (التوقيع، والتحقق من ML-DSA-87 وsecp256k1، ورسالة تسجيل المفتاح) | مكتبة منشورة | npm وPyPI وcrates.io وGo وMaven Central. راجع [QoreSign](/qoresign/overview). |
| شيفرة المجموعة بلغات TypeScript وPython وRust وJava | شيفرة أمثلة، غير منشورة في أي سجل | استنسخ `qorechain/qorechain-custody-kit` وانسخ المجلد أو ضمّنه في مشروعك. |
| شيفرة المجموعة بلغة Go (الحزمة `custodykit`) | شيفرة أمثلة. يمكن جلبها كوحدة Go بإصدار موسوم، بلا وعد بواجهة API مستقرة | `go get github.com/qorechain/qorechain-custody-kit/code/go@v0.1.0`، أو استنسخ وضمّن. |
| صفحات الدليل والمتجهات وقائمة التحقق | توثيق وبيانات | المستودع. |

لا تنفّذ المجموعة أي مخطط توقيع. فالتحقق من ML-DSA-87 وsecp256k1 يأتي من QoreSign. وتحتوي شيفرة Python على Keccak-256 صغيرة تُستخدم لمجموع EIP-55 ولا شيء غيره.

### المسارات {#lanes}

| المسار | ما توقّعه جهة الحفظ | الحالة |
|---|---|---|
| Native (Cosmos SDK) | `SIGN_MODE_DIRECT` بـ secp256k1 مع طبقة ML-DSA-87 (FIPS 204). الحساب ذو المفتاح المسجَّل ليس له مسار كلاسيكي؛ ويستطيع الحساب بلا مفتاح الإرسال كلاسيكياً فقط لتسجيل مفتاحه (أو لإلغاء السجن unjail). | مفتوح |
| EVM | معاملات Ethereum عادية بـ secp256k1 (EIP-155 وEIP-1559)، تُقبل من مرسل لديه مفتاح ML-DSA-87 مسجَّل ونافذة تفويض حية، تفتحها معاملة هجينة على مسار Native: توقيع ML-DSA-87 واحد لكل نافذة. | مفتوح |
| SVM | لا ينطبق | غير مفتوح للمعاملات |

### المعاملات الهجينة على مسار Native {#hybrid}

- المعاملة الهجينة هي `TxRaw` عادية يوقّعها الحساب نفسه مرتين. يسافر توقيع ML-DSA-87 في الجسم بوصفه خيار الامتداد `/qorechain.pqc.v1.PQCHybridSignature` (`algorithm_id = 1`، وتوقيع بحجم 4,627 بايت، واختيارياً المفتاح العام بحجم 2,592 بايت). أما توقيع secp256k1 فهو توقيع `SIGN_MODE_DIRECT` المعتاد على الجسم النهائي، بما فيه الامتداد.
- يغطي توقيع ML-DSA-87 بايتات توقيع (sign-bytes) تستثني الامتداد. تتحقق الشبكتان العامتان كلتاهما من sign-bytes v2 (سلسلة نطاق، ثم معرّف السلسلة، ثم بايتات الجسم وبايتات معلومات المصادقة). وتُقبل تواقيع FIPS 204 المتحوّطة والحتمية كلتاهما. والصيغة المعيارية هي [مواصفة التوقيع الهجين في QoreSign](/qoresign/spec/hybrid-signing-v1).
- ترتيب العمليات: ترميز الجسم ومعلومات المصادقة (مع تثبيت الرسوم والغاز)، وحساب sign-bytes v2، والتوقيع بـ ML-DSA-87، وإلحاق الامتداد، وتوقيع `SignDoc` بـ secp256k1، ثم البث.
- تسجيل المفتاح: `MsgRegisterPQCKeyV2` (`key_type = "hybrid"`، مع إثبات حيازة اختياري وموصى به)، موقّعة كلاسيكياً من الحساب بلا مفتاح، مرة واحدة لكل عنوان ساخن. ويبني QoreSign الرسالة كاملة.
- المعاملة الهجينة أكبر بنحو 4.7 كيلوبايت من الكلاسيكية وتستهلك غازاً أكثر، لذا حاكِ دائماً.

### العناوين {#addresses}

- `qor1...` و`0x...` صيغتان لكتابة البايتات العشرين نفسها. الأموال المرسلة إلى أيٍّ منهما تصل إلى الرصيد نفسه. و`qorvaloper1...` عنوان مشغّل مدقق وليس عنوان دفع أبداً.
- هناك نوعان من الحسابات: `secp256k1` (نوع العملة 118، المسار `m/44'/118'/0'/0/i`) وeth-native `eth_secp256k1` (نوع العملة 60، المسار `m/44'/60'/0'/0/i`). العبارة التذكيرية نفسها تعطي حسابين مختلفين. وتتيح حسابات eth-native لمفتاح واحد تشغيل مسار Native ومسار EVM معاً.
- يمكن أن يأتي مفتاح ML-DSA-87 من الاشتقاق القانوني (ما تسجّله محافظ QoreChain وSDK، مرتبطاً بعنوان `qor1` والعبارة التذكيرية)، أو من اشتقاق هرمي مسودة، أو من مفتاح عشوائي مولَّد في HSM. ويعمل أي مفتاح صالح بعد تسجيله. راجع [اشتقاق المفاتيح](/qoresign/guides/key-derivation).

### الإيداعات {#deposits}

- تُنهي QoreChain الكتلة عند تثبيتها (commit). لا توجد إعادة تنظيم، لذا فالمعاملة في كتلة مثبَّتة نهائية بعد كتلة واحدة. والتأكيدات الإضافية خيار تشغيلي.
- تُوجد إيداعات مسار Native بـ `GET /cosmos/tx/v1beta1/txs?query=transfer.recipient='qor1...' AND tx.height>=H1 AND tx.height<=H2&order_by=ORDER_BY_ASC`. ويبني `buildDepositQuery` هذا المسار بالضبط.
- قواعد الاحتساب في `extractDeposits`: المعاملة ذات `code != 0` لم تنقل شيئاً؛ و`transfer` بلا `msg_index` هو دفع الرسوم؛ وتُرشَّح المبالغ بحسب الوحدة (`uqor` افتراضياً)؛ ومخرجات `MsgSend` و`MsgMultiSend` قابلة للاحتساب؛ و`MsgEthereumTx` قابلة للاحتساب ما لم يفشل تنفيذ EVM أو كان التحويل استرداد غاز من جامع الرسوم؛ وأي شيء آخر يعود بـ `reason: "unsupported_message"` للمراجعة.

### السحوبات والغاز {#withdrawals}

- الرسوم = ceil(حد الغاز x سعر الغاز) بوحدة `uqor`. الحد الأدنى لسعر الغاز 0.1 uqor، ويُحتسب على حد الغاز.
- خذ حد الغاز من محاكاة المعاملة الموقّعة بالكامل. على العقد التي طبّقت ترقية v3.2.5 (الشبكتان كلتاهما منذ 29 أكتوبر 2026) استخدم `ceil(gas_used x 1.02) + 2000`، لأن المحاكاة تشمل التحقق من ML-DSA-87. وقبل ذلك استخدم `ceil((gas_used + 40000) x 1.4)`. اكتشف أيهما ينطبق بـ `GET /cosmos/upgrade/v1beta1/applied_plan/v3.2.5`، لا بالتاريخ.
- بعد اختيار حد الغاز أعد بناء `AuthInfo` ووقّع من جديد: فكلا التوقيعين يغطي الرسوم.
- التسلسلات (sequences): شغّل طابور موقّع واحداً لكل عنوان ساخن، أو عدة عناوين ساخنة للصرف المتوازي.

### نوافذ تفويض EVM {#evm-windows}

- تُفتح النافذة بـ `/qorechain.pqc.v1.MsgOpenEVMWindow` (`blocks` من 1 إلى 17,280، و`max_txs` من 1 إلى 1,000، و`max_value` بوحدة `uqor` يحتسب القيمة زائد أقصى رسوم، و`native_only` اختياري، و`allowed_targets` اختياري حتى 16 عنواناً) وتُغلق بـ `MsgCloseEVMWindow`. وحالتها في `GET /qorechain/pqc/v1/evm_window/{address}`.
- فتح نافذة يستبدل أي نافذة قائمة ويقدّم تسلسل الحساب، وهو nonce الخاص بـ EVM: افتح النافذة ثم اقرأ الـ nonce.
- لا تحتاج `eth_call` و`eth_estimateGas` إلى نافذة.

## طريقة الاستخدام {#how-to-use}

### الحصول على الشيفرة {#install}

المجموعة شيفرة مرجعية: استنسخ المستودع، أو ضمّن المجلد الخاص بلغتك، بدلاً من تثبيت حزمة.

| اللغة | كيف تحصل عليها | تعتمد على | الحد الأدنى للمنصة |
|---|---|---|---|
| TypeScript | `git clone https://github.com/qorechain/qorechain-custody-kit`، ثم `cd code/ts && pnpm install && pnpm build` | `@qorechain/qoresign` 0.1.0 (npm) | Node.js 20 |
| Python | استنسخ، ثم `cd code/python && pip install -r requirements-dev.txt`. ولـ `verify_tx` نفّذ أيضاً `pip install qorechain-qoresign==0.1.1` | لا شيء وقت التشغيل؛ و`qorechain-qoresign` 0.1.1 (PyPI) لـ `verify_tx` | Python 3.9 |
| Go | `go get github.com/qorechain/qorechain-custody-kit/code/go@v0.1.0` (الحزمة `custodykit`)، أو استنسخ | `github.com/qorechain/qoresign/go` v0.1.0 | Go 1.25 |
| Rust | استنسخ، ثم `cd code/rust && cargo build` (غير موجودة على crates.io) | `qorechain-qoresign` 0.1.0 (crates.io) | إصدار Rust 2021 |
| Java | استنسخ، ثم `cd code/java && mvn test` (غير موجودة على Maven Central) | `io.github.qorechain:qoresign:0.1.0` (Maven Central)، وGson | Java 17 |

QoreSign منشورة لكل لغة تستخدمها المجموعة، بما فيها Python. وتحتاج `verify_tx` في شيفرة Python إلى `qorechain-qoresign` 0.1.1 من PyPI (macOS وLinux). أما شيفرة TypeScript وGo وRust وJava فتثبّت QoreSign 0.1.0، وهو لا يزال منشوراً بجانب 0.1.1.

### البدء السريع {#quickstart}

الشبكة المستهدفة: شبكة الاختبار (`qorechain-diana`) لكل ما يقرأ السلسلة. يوجّه متغير البيئة `QORE_REST` الأمثلة والفحوص الحية إلى نقطة REST أخرى، وهي في الإنتاج عقدتك الخاصة. العناوين أدناه مأخوذة من عبارة BIP-39 التجريبية العامة ويجب ألا تحتفظ بأموال أبداً.

**1. التحقق من عنوان (Go، دون اتصال).** شُغّل في 27 أكتوبر 2026 من نسخة مستنسخة للوسم `v0.1.0`:

```bash
cd code/go
go run ./cmd/custody-kit validate 0x9858EfFD232B4033E47d90003D41EC34EcaEda94
```

طبع (رمز الخروج 0):

```json
{
  "valid": true,
  "kind": "account",
  "format": "hex",
  "checksum": "eip55",
  "bech32": "qor1npvwllfr9dqr8erajqqr6s0vxnk2ak55am9g2c",
  "hex": "0x9858EfFD232B4033E47d90003D41EC34EcaEda94"
}
```

يُرفض عنوان المدقق ما لم تسمح به بـ `--allow-validator`:

```bash
go run ./cmd/custody-kit validate qorvaloper19rl4cm2hmr8afy4kldpxz3fka4jguq0a5ws5he
```

طبع `"valid": false` مع `"error": "KIND_NOT_ALLOWED"` والتفصيل `a validator address is not accepted here`، وخرج بالرمز 1. واجتازت أيضاً مجموعة اختبارات Go (`go test ./...`) على النسخة المستنسخة نفسها.

**2. فك ترميز معاملة موقّعة والتحقق منها قبل البث.**

```bash
go run ./cmd/custody-kit decode <tx hex or base64>
go run ./cmd/custody-kit verify <tx> --chain-id qorechain-diana --account-number <n> \
  --pubkey <33-byte hex> --pq-pubkey <2592-byte hex>
```

أضف `--eth` لحساب eth-native. اقرأ رقم الحساب من `GET /cosmos/auth/v1beta1/account_info/{address}` ومفتاح ML-DSA-87 المسجَّل من `GET /qorechain/pqc/v1/account/{address}`.

الأمر نفسه في TypeScript، من أمر سطر الأوامر المثال في المجموعة (`code/ts/src/cli.ts`):

```ts
import { decodeTx, fromHex, verifyTx } from "./index.js";

console.log(JSON.stringify(decodeTx(txBytes), null, 2)); // messages, memo, fee, signers, pqcLayers, txHash

const r = verifyTx({
  txBytes,
  chainId: "qorechain-diana",
  accountNumber: BigInt(accountNumber),
  classicalPublicKey: fromHex(secp256k1PubKeyHex),
  classicalKeyType: "secp256k1", // or "eth_secp256k1" for eth-native accounts
  pqPublicKey: fromHex(registeredMlDsa87KeyHex),
});
// r.valid, r.classical, r.signerKey ("match" | "absent" | "mismatch"), r.pq
```

**3. مسح الإيداعات (قراءات على شبكة الاختبار).**

```bash
go run ./cmd/custody-kit deposits qor1... --from-height 8976000 --to-height 8976400
```

عند تشغيله في 27 أكتوبر 2026 للعنوان التجريبي العام على ارتفاعات شبكة الاختبار من 8976000 إلى 8983000، أعاد قائمة فارغة، وهو المتوقع لعنوان لم يستلم شيئاً قط.

TypeScript (من `code/ts/src/cli.ts`):

```ts
import { DEFAULT_TESTNET_REST, buildDepositQuery, extractDeposits, getJson } from "./index.js";

const restUrl = process.env.QORE_REST ?? DEFAULT_TESTNET_REST;
const path = buildDepositQuery({ address, minHeight: BigInt(from), maxHeight: BigInt(to) });
const body = await getJson(restUrl, path);
const responses = (body.tx_responses ?? []) as Record<string, unknown>[];
const entries = responses.flatMap((r) => extractDeposits(r, address));
// each entry: txhash, height, msgIndex, messageType, sender, amount, denom, memo, creditable, reason
```

Go (من `code/go/cmd/custody-kit/main.go`):

```go
opts := custodykit.DepositQueryOptions{Address: addr, MinHeight: &from, MaxHeight: &to}
path, err := custodykit.BuildDepositQuery(opts)
// GET restURL + path, then for each tx_response:
r, err := custodykit.ParseTxResponse(raw)
entries, err := custodykit.ExtractDeposits(r, addr, "") // "" = uqor
```

**4. اللغات الأخرى.**

```bash
# Python (from code/python/src)
python -m qorechain_custody_kit validate qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h
python -m qorechain_custody_kit deposits <address> --from-height H --to-height H

# Rust
cargo run --example custody-kit -- validate 0x9858EfFD232B4033E47d90003D41EC34EcaEda94

# Java
mvn -q compile exec:java -Dexec.args="validate 0x9858EfFD232B4033E47d90003D41EC34EcaEda94"
```

**5. تشغيل المتجهات والفحوص الحية.**

```bash
scripts/fetch-qoresign-vectors.sh            # optional: also check the QoreSign hybrid vectors
cd code/go && go test ./...                  # vectors
QORE_LIVE_TEST=1 go test -run Live ./...     # live reads against testnet
```

لكل لغة ما يعادله (`pnpm test` و`pytest` و`cargo test` و`mvn test`). الفحوص الحية لا تحتاج أموالاً. لم يُشغَّل عند كتابة هذه الصفحة سوى أمرَي Go `validate` و`deposits` ومجموعة اختبارات Go؛ أما اللغات الأخرى فموصوفة من المستودع.

### الدوال والأوامر الرئيسية {#api}

| TypeScript | Go | Python وRust | Java | ما تفعله |
|---|---|---|---|---|
| `validateAddress(input, { allow, requireEip55 })` | `ValidateAddress(input, ValidateAddressOptions{Allow, RequireEIP55})` | `validate_address` | `Addresses.validateAddress` | تعيد `{ valid, kind, format, checksum, bech32, hex }` أو `{ valid: false, error }`. |
| `decodeTx(txBytes)`, `decodeMessage(typeUrl, value)` | `DecodeTx`, `DecodeMessage` | `decode_tx`, `decode_message` | `TxDecoder.decodeTx`, `decodeMessage` | الرسائل والمذكرة والرسوم والموقّعون وطبقات ML-DSA-87 وتجزئة المعاملة. |
| `verifyTx({ txBytes, chainId, accountNumber, classicalPublicKey, classicalKeyType, pqPublicKey, signBytesVersion })` | `VerifyTx(VerifyTxArgs{...})` | `verify_tx` | `TxVerifier.verifyTx` | تعيد `{ valid, classical, signerKey, pq }`. إصدار sign-bytes هو v1 أو v2 أو أيٌّ منهما. |
| `buildDepositQuery({ address, minHeight, maxHeight, event, page, limit, orderBy })` | `BuildDepositQuery` | `build_deposit_query` | `Deposits.buildDepositQuery` | مسار REST للتحويلات الواردة. `event` هو `transfer` (الافتراضي) أو `coin_received`؛ و`limit` من 1 إلى 100، والافتراضي 50؛ وتصاعدي افتراضياً. |
| `extractDeposits(txResponse, address, { denom })` | `ExtractDeposits(resp, address, denom)` | `extract_deposits` | `Deposits.extractDeposits` | إدخالات إيداع مع `creditable` و`reason`. |
| `depositEventQuery`, `percentEncode`, `getJson`, `toHex`, `fromHex` | `DepositEventQuery`, `PercentEncode`, `GetJSON`, `ToHex`, `FromHex`, `ParseTxResponse` | `deposit_event_query`, `get_json`, `from_hex` | `CustodyKit`, `Rest` | دوال مساعدة. |

كما تُصدَّر الثوابت `FEE_COLLECTOR` و`MSG_SEND` و`MSG_MULTI_SEND` و`MSG_ETHEREUM_TX` و`KNOWN_MESSAGES` و`PQC_HYBRID_TYPE_URL` و`DEFAULT_TESTNET_REST`.

أمر سطر الأوامر المثال في كل لغة:

- `validate <address> [--allow-validator] [--require-eip55]`
- `decode <tx hex or base64>`
- `verify <tx> --chain-id ID --account-number N --pubkey HEX [--eth] [--pq-pubkey HEX]`
- `deposits <address> [--from-height H] [--to-height H] [--rest URL]`

رموز الأخطاء، المتطابقة في كل لغة:

- المجموعة: `MALFORMED_TX` (البايتات ليست معاملة سليمة التكوين)، و`UNKNOWN_FIELD` (حقل لا يعرفه المفكك، وكانت الشبكة سترفضه أيضاً)، و`INVALID_ARGUMENT`.
- `validateAddress`: الرموز الأحد عشر المذكورة تحت [الابتكارات](#innovations).

رفوض السلسلة التي تصادفها جهة الحفظ في أغلب الأحيان، بصيغة codespace والرمز (الجدول الكامل في `docs/errors.md` ضمن المجموعة):

| Codespace | الرموز |
|---|---|
| `sdk` | 3 عدم تطابق التسلسل، 4 غير مصرّح، 5 رصيد غير كافٍ، 11 نفاد الغاز، 12 مذكرة كبيرة جداً، 13 رسوم غير كافية، 19 موجودة أصلاً في mempool |
| `pqc` | 20 التوقيع الهجين مطلوب، 21 فشل التحقق من التوقيع الهجين، 7 المفتاح مسجَّل أصلاً، 26 لا توجد نافذة EVM (أو لا يوجد مفتاح مسجَّل)، 27 النافذة مستنفدة أو خارج النطاق، 28 معاملات نافذة غير صالحة |
| `stakingtier` | 13 الحصة المخزَّنة مقفلة |

وجّه المنطق بحسب codespace والرمز معاً، واحتفظ بالسجل الخام.

## طريقة الوصول {#how-to-access}

| | الشبكة الرئيسية | شبكة الاختبار |
|---|---|---|
| معرّف السلسلة | `qorechain-vladi` | `qorechain-diana` |
| معرّف سلسلة EVM | 9801 | 9800 |
| REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM JSON-RPC | `https://evm.qore.host` | `https://evm-testnet.qore.host` |
| إصدار العقدة | v3.2.5 (طُبّق في 29 أكتوبر 2026) | v3.2.6 (طُبّقت v3.2.5) |

- الوحدة هي `uqor` (1 QOR = 10^6 uqor؛ وعلى مسار EVM 1 uqor = 10^12 wei). الحد الأدنى لسعر الغاز 0.1 uqor، وفترة فك الارتباط 21 يوماً، وحد المذكرة 256 حرفاً. قُرئت هذه القيم من الشبكتين في 27 أكتوبر 2026 ويمكن أن تتغير بالحوكمة، لذا اقرأها من السلسلة في الإنتاج.
- الإيداعات لا تحتاج مفاتيح ولا تسجيلاً. أما الإرسال فيحتاج إلى مفتاح ML-DSA-87 مسجَّل لكل عنوان ساخن.
- شغّل عقدك الكاملة الخاصة في الإنتاج. نقاط النهاية العامة محدودة المعدل ومخصصة للتطوير. وإذا حصل سكربت على `403 Forbidden` فاضبط ترويسة `User-Agent` صراحةً. راجع [تشغيل عقدة](/developer-guide/running-a-node) و[الاتصال بالشبكة الرئيسية](/getting-started/connecting-to-mainnet).
- تتلقى شبكة الاختبار كل إصدار للعقدة قبل الشبكة الرئيسية. بدّل قواعد الغاز بفحص الترقية المطبَّقة، لا بالتاريخ (طبّقت الشبكتان كلتاهما v3.2.5).
- الرموز التجريبية على شبكة الاختبار (وحدات bank بالصيغة `erc20:0x...`، ورمز IBC) غير موجودة على الشبكة الرئيسية. احتسب `uqor` على الشبكتين.
- يأتي QOR شبكة الاختبار من صنبور لوحة تحكم QoreChain ولا قيمة له. راجع [الاتصال بشبكة الاختبار](/getting-started/connecting-to-testnet).

## ملاحظات أمنية {#security}

- يوقّع مفتاحا العنوان الساخن (secp256k1 وML-DSA-87) كل معاملة على مسار Native. أبقِهما داخل محيط الحفظ نفسه، وتحت النصاب نفسه ومسار التدقيق نفسه.
- احتفظ بنسخة احتياطية من بذرة ML-DSA-87 ذات 32 بايتاً (للمفاتيح البرمجية) أو استخدم النسخ الاحتياطي لمفاتيح HSM. الحساب ذو المفتاح المسجَّل ليس له مسار كلاسيكي، فضياع مفتاح ML-DSA-87 يعني أن الحساب لم يعد قادراً على التوقيع. اختبر الاستعادة على شبكة الاختبار بـ `verifyTx`.
- يجب أن تدعم HSM التوقيع الصرف بـ ML-DSA-87 (`CKM_ML_DSA` في PKCS #11 v3.2) على sign-bytes بسياق فارغ. و`HashML-DSA` غير مقبول.
- شغّل `decodeTx` و`verifyTx` على كل معاملة موقّعة قبل البث، في عملية لم تبنِها.
- يستخدم التدوير `MsgRotatePQCKey`: يوقّع المفتاحان كلاهما، وتستخدم طبقة المعاملة نفسها المفتاح الحالي، ويُرفض إعادة استخدام مفتاح سابق. وإذا انكشف مفتاح secp256k1 فانقل الأموال إلى عنوان جديد بمفتاحين جديدين وأغلق أي نافذة EVM مفتوحة.
- نوافذ EVM: استخدم `native_only` أو `allowed_targets`، وأصغر `max_value` و`blocks` تغطي الدفعة، وأغلق النافذة بعد الدفعة. عامِل `MsgSetWithdrawAddress` و`MsgRotatePQCKey` و`MsgOpenEVMWindow` و`MsgAuthorizeEVMDelegation` على أنها عمليات ذات امتياز.
- لا تحتسب أبداً معاملة EVM يبلّغ حدث `ethereum_tx` فيها عن فشل، حتى لو كانت نتيجتها الأصلية `code == 0`.
- هذه شيفرة مرجعية بالإصدار 0.1.0. راجعها قبل استخدامها في الإنتاج. أبلغ عن الثغرات سراً على security@qore.network، بما في ذلك أخطاء التوثيق التي قد تؤدي إلى احتساب خاطئ أو إلى توقيع غير مقصود.

## أين يُنشر {#where-published}

جرى التحقق من السجلات في 27 أكتوبر 2026.

| السجل | الحزمة | الإصدار | الرابط |
|---|---|---|---|
| GitHub | `qorechain/qorechain-custody-kit` (اللغات الخمس وصفحات الدليل والمتجهات) | الإصدار `v0.1.0`، نُشر في 27 أكتوبر 2026 | https://github.com/qorechain/qorechain-custody-kit |
| وكيل وحدات Go | `github.com/qorechain/qorechain-custody-kit/code/go` (شيفرة أمثلة، قابلة للجلب) | v0.1.0 (الوسم `code/go/v0.1.0`) | https://pkg.go.dev/github.com/qorechain/qorechain-custody-kit/code/go |
| npm وPyPI وcrates.io وMaven Central | غير منشورة: المجموعة شيفرة أمثلة تُنسخ أو تُضمَّن | لا ينطبق | لا ينطبق |

لا يحمل إصدار GitHub أي ملفات مرفقة؛ فالإصدار هو وسم المستودع. التبعيات التي تبني عليها المجموعة كلها منشورة: `@qorechain/qoresign` على npm (الأحدث 0.1.1، والمجموعة تثبّت 0.1.0)، و`qorechain-qoresign` على PyPI (0.1.1)، و`qorechain-qoresign` على crates.io (الأحدث 0.1.1، والمجموعة تثبّت 0.1.0)، و`github.com/qorechain/qoresign/go` (v0.1.0 وv0.1.1)، و`io.github.qorechain:qoresign` على Maven Central (0.1.0 و0.1.1).

الرخصة Apache-2.0. الجهة المشرفة: QoreChain Association.

## الحدود والمشكلات المعروفة {#limits}

- لا تحتفظ المجموعة بمفاتيح، ولا توقّع معاملات، ولا تبثّ، ولا توفر توقيعاً بعتبة أو MPC. والتوقيع يتولاه QoreSign أو HSM لديك. ولا يوجد اليوم مخطط عتبة موحّد لـ ML-DSA؛ ويوثّق الدليل كيفية الجمع بين مفتاح secp256k1 بعتبة ومفتاح ML-DSA-87 محفوظ بشكل منفصل.
- لا تقدّم أي بيان عن العمليات الداخلية لأي جهة حفظ. فقائمة التحقق تصف متطلبات الشبكة فقط.
- تقبل `validateAddress` عناوين من 20 بايتاً. وتُرفض عناوين حسابات الوحدات والعقود الأطول، كما ينبغي لعناوين الإيداع والصرف.
- تحتسب `extractDeposits` تلقائياً `MsgSend` و`MsgMultiSend` و`MsgEthereumTx` الناجحة. أما الرسائل الأخرى (سحب المكافآت واستدعاءات العقود وتحويلات IBC) فتُعاد للمراجعة ولا تُحتسب.
- تتحقق `verifyTx` من معاملات الموقّع الواحد.
- مسار SVM غير مفتوح للمعاملات. لا تبنِ عليه تدفقات إيداع أو سحب.
- شيفرة المجموعة نفسها شيفرة أمثلة بالإصدار 0.1.0. يمكن أن تتغير أسماء الدوال وتواقيعها بين الإصدارات، ووسم وحدة Go لا يعد بواجهة API مستقرة.
- لم يُشغَّل عند كتابة هذه الصفحة سوى أمثلة Go ومجموعة اختباراتها. ولم تُعد الفحوص الحية وفحوص المتجهات في اللغات الأربع الأخرى.
- قد يذكر README الخاص بـ Python في المستودع أن `verify_tx` يطلق خطأ استيراد إلى أن يتوفر `qorechain-qoresign` 0.1.1 على PyPI. وهذا الإصدار منشور، فالملاحظة قديمة.
- يقتبس دليل المجموعة معاملات (أرقام الغاز وقيم مستوى التخزين) قُرئت في 27 أكتوبر 2026. اقرأها من السلسلة في الإنتاج.

## صفحات ذات صلة {#related}

- [QoreSign](/qoresign/overview): التوقيع الهجين، والتحقق، ورسالة تسجيل المفتاح، ومساعدا الغاز `suggestGasLimit` و`simulateTx`.
- [QoreChain SDK](/sdk/overview): فك ترميز الأخطاء بـ `decodeTxError`، ومؤلّفات نوافذ EVM، ومصنِّف الرفض.
- [التوقيع ما بعد الكمّي](/developer-guide/post-quantum-signing): التواقيع الهجينة، وsign-bytes v2، وتسجيل المفاتيح.
- [دليل منصات التداول والمتكاملين](/developer-guide/exchange-integration): الاختيار بين مسارات Native وEVM وSVM.
- [مُسبقات EVM](/developer-guide/evm-precompiles) ومسار EVM.
- [التخزين والتفويض](/user-guide/staking-and-delegation).
- [تشغيل عقدة](/developer-guide/running-a-node) و[الاتصال بالشبكة الرئيسية](/getting-started/connecting-to-mainnet).
- [خادم MCP الخاص بـ QoreChain](/developer-tools/mcp): `get_pq_status` و`simulate_tx` للفحوص السريعة.
- [QoreScan](/developer-tools/qorescan): جرد التشفير في عقدتك ونقاط نهايتك وحساباتك.
