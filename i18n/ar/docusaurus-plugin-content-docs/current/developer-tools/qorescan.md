---
slug: /developer-tools/qorescan
title: QoreScan Community
sidebar_label: QoreScan
sidebar_position: 33
---

# QoreScan Community

QoreScan Community أداة سطر أوامر تجرد التشفير المستخدم في نشر QoreChain وتكتب النتيجة بصيغة CBOM (قائمة مواد تشفيرية) من نوع CycloneDX 1.6. تقرأ مجلد الدليل الرئيسي للعقدة، والحالة الحية للشبكة، ونقاط TLS، ومصادر Solidity، وتسجّل كل خوارزمية وبروتوكول وشهادة ومفتاح تجده، مع الملف والسطر أو النقطة التي وُجد فيها.

هي موجهة لمشغّلي المدقّقين (validators) والعقد، وفرق الامتثال والمخاطر، والمدقّقين الذين يعدّون حزمة أدلة، وفرق Solidity التي تريد معرفة أي مخططات توقيع تعتمد عليها عقودها. ومن CBOM تكتب تقارير Markdown مربوطة بإرشادات FINMA 05/2026، وخارطة طريق التشفير ما بعد الكمي لمجموعة التعاون الأوروبية NIS، والمعيار التقني التنظيمي لـ DORA حول إدارة مخاطر تقنية المعلومات والاتصالات (المادة 6)، مع حالة لكل خوارزمية مقابل FIPS 203 و204 و205 وNIST IR 8547.

الإصدار **0.1.0**، نُشر في 27 أكتوبر 2026، برخصة Apache-2.0. يقرأ الشبكة الرئيسية (`qorechain-vladi`) والشبكة التجريبية (`qorechain-diana`) عبر نقاط REST العامة لكل منهما، أو أي نقطة REST توجّهه إليها.

QoreScan أداة مساعدة للجرد. وهو ليس شهادة ولا تدقيقًا ولا رأيًا قانونيًا، ولا يثبت المطابقة مع أي لائحة أو معيار. وكل ما لا يستطيع الفحص إثباته يُترك "To be completed".

## الابتكارات {#innovations}

- **CBOM بصيغة قياسية.** كل نتيجة هي مكوّن `cryptographic-asset` من CycloneDX 1.6 مع `cryptoProperties` (نوع الأصل، والبدائية، ومجموعة المعاملات، والمنحنى، ومستوى الأمان الكلاسيكي، وفئة الأمان الكمي لدى NIST، وOID) و`evidence.occurrences` (الملف والسطر، أو النقطة). ترتبط الشهادات بخوارزمية توقيعها ومفتاحها العام، والبروتوكولات بالخوارزميات التي تستخدمها، والمكتبات بالخوارزميات التي توفّرها. كل CBOM يُكتب في اختبارات المشروع يُتحقق منه مقابل مخطط JSON الرسمي لـ CycloneDX 1.6، ويُفحص أن كل `bom-ref` مستخدَم معرَّف، فيُحمَّل الناتج في أي مستهلك لـ CycloneDX 1.6.
- **مصادر تعي السلسلة.** إلى جانب الملفات وTLS، يقرأ QoreChain نفسها: معاملات PQC، ومفاتيح البروتوكول المتعلقة بـ PQC، وأنواع مفاتيح الإجماع لمجموعة المدقّقين النشطة، وprecompiles الخاصة بـ EVM النشطة، ولكل حساب تسمّيه: هل له مفتاح PQC مسجّل، وخوارزميته، ونوع مفتاحه (هجين، أو PQC وحده، أو كلاسيكي وحده)، وحجم مفتاحه العام.
- **تبادل المفاتيح الهجين ظاهر.** مصافحة TLS واحدة لكل نقطة تسجّل الإصدار، وحزمة التشفير، ومجموعة تبادل المفاتيح (بما فيها مجموعات ML-KEM الهجينة مثل `X25519MLKEM768`)، وALPN، وSNI، وكل شهادة أرسلها الخادم.
- **لا تُقرأ قيم المفاتيح الخاصة أبدًا.** تُفكّ ملفات المفاتيح إلى بنى ليس فيها حقل للمفتاح الخاص، فلا تُفكّ تلك البايتات ولا تُخزَّن ولا تُسجَّل ولا تُكتب. يفشل اختبار إذا اكتسبت تلك البنى حقلًا قادرًا على حمل بيانات خاصة، ويفحص اختبار آخر دليل عقدة بمفاتيح مولّدة حديثًا ويتأكد من أن أي ترميز لها لا يظهر في أي ناتج.
- **لكل خوارزمية تصنيف وحالة انتقال.** `post-quantum` أو `hybrid` أو `quantum-vulnerable` أو `symmetric`، مع فئة الأمان الكمي لدى NIST حيث تكون معرَّفة، وحالتها مقابل FIPS 203 و204 و205 وجدول NIST IR 8547.
- **ناتج قابل لإعادة الإنتاج.** الطابع الزمني للـ CBOM هو الوقت الحالي، أو `SOURCE_DATE_EPOCH` إن كان معيّنًا. ويُشتق الرقم التسلسلي من المحتوى، فيعطي المدخل نفسه في الوقت نفسه الوثيقة نفسها.
- **أغلفة تتحقق مما تشغّله.** تنزّل حزمتا npm وPyPI الملف الثنائي للإصدار الخاص بمنصتك عند الطلب، وتقارن SHA-256 الخاص به بالبصمات المشحونة داخل الحزمة. وترفضان ملفًا ثنائيًا لا يطابقها، بعد التنزيل وفي كل تشغيل لاحق للنسخة المخزّنة مؤقتًا. ولا يعمل أي سكربت تثبيت عند `npm install`.
- **لا شيفرة من أطراف ثالثة في الملف الثنائي.** يستخدم الملف الثنائي `qorescan` المكتبة القياسية لـ Go في الفحص (مدقّق مخطط JSON تستخدمه اختباراته). ولا يعيد استخدام أي شيفرة من مشاريع PQCA CBOMkit؛ ويُحمَّل ناتجه في عارض CBOMkit.

## حالات الاستخدام {#use-cases}

1. **فريق امتثال ينتج CBOM لجهة إشرافية.** مؤسسة مالية سويسرية تشغّل عقدة QoreChain يجب أن تُظهر جردًا للطرق التشفيرية في أنظمة تقنية المعلومات والاتصالات لديها، بما فيها تقنية دفتر الأستاذ الموزع (إرشادات FINMA 05/2026، القسم 3.2). تشغّل `qorescan scan --node-home ... --network mainnet`، وترفق الـ CBOM و`qorescan report --framework finma` بتحليل المخاطر لديها، وتستكمل الأقسام التنظيمية يدويًا.
2. **مدقّق يفحص عقدته.** يريد المشغّل التأكد من نوع مفتاح الإجماع الذي يستخدمه المدقّق، وهل ملفات المفاتيح مقروءة لمستخدمين آخرين، وهل مستمعو RPC أو EVM JSON-RPC مكشوفون دون TLS، وهل ضُبط موقّع بعيد. يسجّل `qorescan scan --node-home ~/.qorechain` كل ذلك دون فتح قيم المفاتيح الخاصة.
3. **فحص الحسابات قبل الاعتماد عليها.** يريد مكتب حفظ أو فريق تكامل بورصة أن يعرف هل لعناوين الخزينة أو المحفظة الساخنة مفتاح ML-DSA-87 مسجّل، وهل هو هجين. يكتب `qorescan scan --network mainnet --address qor1... --address qor1...` حالة مفتاح PQC لكل حساب في الـ CBOM. راجع [حقيبة الحفظ](/developer-tools/custody-kit).
4. **فريق Solidity ينقل عقودًا.** فريق ينقل عقودًا من Ethereum يريد قائمة بكل موضع يعتمد على `ecrecover` أو OpenZeppelin `ECDSA` أو P-256 أو RSA، وبكل موضع يستدعي بالفعل precompiles الخاصة بـ PQC في QoreChain. يسرد `qorescan solidity ./contracts` كل استخدام مع الملف والسطر.
5. **مراجعة النقاط.** يريد فريق منصة أن يعرف هل تتفاوض نقاط RPC أو REST أو واجهة المحفظة العامة لديه على تبادل مفاتيح هجين ما بعد كمي مع العملاء الحديثين. يسجّل `qorescan tls api.example.org:443` المجموعة المتفاوض عليها وحزمة التشفير وسلسلة الشهادات.
6. **بوابة CI عند كل pull request.** يضيف مستودع dApp إجراء QoreScan لـ GitHub فينتج كل تغيير CBOM جديدًا وتقرير DORA أو FINMA كمخرجات بناء، ويرى المراجعون متى يدخل مخطط توقيع أو تجزئة جديد إلى قاعدة الشيفرة.
7. **العناية الواجبة تجاه المورّدين.** ترسل جهة خاضعة للتنظيم ناتج `qorescan template questionnaire` إلى مزوّد خدمة، معبّأً مسبقًا بما يُظهره فحص نقاط ذلك المزوّد، فيجيب المزوّد عن البنود المفتوحة فقط.
8. **كيانات في الاتحاد الأوروبي تستعد لخارطة طريق NIS وDORA.** يستخدم كيان `qorescan report --framework nis` و`--framework dora` ليُظهر أين يغذي جرده خطوة إدارة الأصول التشفيرية والمادة 6 من المعيار التقني التنظيمي لـ DORA.

## كيف يعمل {#how-it-works}

### المصادر {#sources}

- **دليل العقدة الرئيسي** (`--node-home DIR`). يقرأ `config/config.toml` و`config/app.toml` و`config/genesis.json` و`priv_validator_key.json` و`node_key.json` وأي ملفات شهادات تسمّيها. يسجّل نقل P2P وخوارزمياته، وشهادات TLS لـ RPC وEVM JSON-RPC، والمستمعين على عناوين غير loopback دون TLS، والموقّع البعيد، وأنواع مفاتيح المدقّق والعقدة ومفاتيحها العامة، وأذونات ملفات المفاتيح، ومعاملات وحدة `pqc` في genesis، وسجل الخوارزميات على السلسلة عند genesis، وأنواع مفاتيح إجماع المدقّقين.
- **الشبكة** (`--network mainnet|testnet` أو `--rest URL`). يقرأ مفاتيح البروتوكول المتعلقة بـ PQC، ومعاملات `pqc`، وأنواع مفاتيح الإجماع لمجموعة المدقّقين النشطة، وprecompiles الخاصة بـ EVM النشطة عبر REST.
- **الحسابات** (`--address ADDR`، قابل للتكرار). يقرأ مفتاح PQC المسجّل لكل حساب عبر REST.
- **TLS** (`--tls HOST:PORT`، قابل للتكرار). مصافحة واحدة لكل نقطة.
- **Solidity** (`--solidity PATH`، قابل للتكرار). كشف نصي لـ `ecrecover`، واستدعاءات precompiles: ecrecover (`0x01`) وpqcVerify (`0x0A01`) وpqcKeyStatus (`0x0A02`) وP-256 (`0x100`)، و`keccak256` و`sha256` و`ripemd160`، واستيرادات مكتبات التوقيع OpenZeppelin وSolady و`IQorePQC.sol`. precompiles pqcVerify وpqcKeyStatus نشطتان على الشبكة التجريبية فقط؛ ولا واحدة منهما نشطة على الشبكة الرئيسية. راجع [EVM precompiles](/developer-guide/evm-precompiles).

### قراءات الشبكة {#network-reads}

كل طلب إلى الشبكة هو HTTP GET. المسارات المقروءة هي مسار معلومات العقدة، و`/qorechain/pqc/v1/protocol_features`، و`/qorechain/pqc/v1/params`، ومسار أحدث مجموعة مدقّقين، و`/cosmos/evm/vm/v1/params`، و`/qorechain/pqc/v1/account/{address}`. المسار الذي لا تخدمه العقدة يصبح ملاحظة في الـ CBOM، لا خطأ.

### التصنيف {#classification}

ML-KEM (FIPS 203) وML-DSA (FIPS 204) وSLH-DSA (FIPS 205) وLMS/XMSS هي `post-quantum`. تبادل المفاتيح الكلاسيكي المدموج مع ML-KEM هو `hybrid`. أما RSA وECDSA وEdDSA وDiffie-Hellman على الحقول المنتهية وعلى المنحنيات الإهليلجية والتواقيع القائمة على الازدواج (pairing) فهي `quantum-vulnerable`، مع جدول NIST IR 8547 "deprecated after 2030, disallowed after 2035". والعمليات المتماثلة من شفرات الكتل وAEAD والتجزئات وXOF وKDF هي `symmetric`. يطبّق QoreScan جدول IR 8547 على كل منحنى من عائلات ECDSA وEdDSA وECDH، بما فيها secp256k1 وX25519، لأن التعرّض الكمي واحد. هذه تصنيفات جرد، لا إفادات بشأن اعتماد NIST.

### الناتج {#output}

يضيف QoreScan بضع خصائص `qorescan:*` (التصنيف، وانتقال NIST IR 8547، والمعيار، والمصدر) ويسجّل الحقائق المفحوصة والملاحظات وخاصية إخلاء المسؤولية في بيانات تعريف الـ CBOM. مسارات الأدلة نسبية إلى المجلد المفحوص.

يحتوي التقرير على جدول ربط الإطار، وملخص حسب التصنيف، وكل خوارزمية مع فئة NIST الخاصة بها وحالتها مقابل FIPS 203 و204 و205 وNIST IR 8547 وأدلتها، ثم البروتوكولات والشهادات والمفاتيح والمكتبات والحقائق المفحوصة وملاحظات الفحص والمصادر المقتبسة. وتُكتب البنود التنظيمية "To be completed".

### ربط الأطر {#frameworks}

| الإطار | المصدر | أين يُستخدم الجرد كمدخل |
|---|---|---|
| `finma` | FINMA Guidance 05/2026 "Quantum computing"، 9 يوليو 2026، القسم 3 | 3.2 الجرد (الـ CBOM)؛ 3.3 البيانات الحرجة (تبادل المفاتيح في وسائل النقل المفحوصة، ونمط التوقيع الهجين للمسار الأصلي)؛ 3.4 المرونة التشفيرية (سجل الخوارزميات، وفترة الترحيل، ومفاتيح البروتوكول)؛ 3.5 المزوّدون (مُصدرو الشهادات، والاستبيان). 3.1 الاستراتيجية تنظيمية. |
| `nis` | NIS Cooperation Group، "A Coordinated Implementation Roadmap for the Transition to Post-Quantum Cryptography"، الجزء 1، v1.1، 11 يونيو 2025 | إدارة الأصول التشفيرية (الـ CBOM)؛ معلما 2030 و2035 (قائمة الخوارزميات `quantum-vulnerable`)؛ المرونة. |
| `dora` | Commission Delegated Regulation (EU) 2024/1774، المادة 6 | 6(2)(a) و(c) سجلات النقل والمستمعون دون TLS؛ 6(2)(d) سجلات المفاتيح (الأنواع والمفاتيح العامة)؛ 6(3) كل خوارزمية مقابل FIPS وNIST IR 8547؛ 6(4) السجل وفترة الترحيل والمفاتيح. 6(1) و6(5) تنظيميتان. |

## كيفية الاستخدام {#how-to-use}

### التثبيت {#install}

| القناة | أمر التثبيت | الحد الأدنى للمنصة |
|---|---|---|
| الملف الثنائي للإصدار | نزّل `qorescan_0.1.0_<os>_<arch>` (أو `.tar.gz` أو `.zip`؛ وتنتهي الملفات الثنائية لـ Windows بـ `.exe`) من [إصدار GitHub](https://github.com/qorechain/qorescan/releases/tag/v0.1.0) وقارنه بـ `qorescan_0.1.0_checksums.txt` | macOS أو Linux أو Windows على amd64 أو arm64 |
| Go | `go install github.com/qorechain/qorescan/cmd/qorescan@v0.1.0` | Go 1.26 |
| npm | `npx @qorechain/qorescan scan ...` | Node.js 18 أو أحدث |
| PyPI | `pipx run qorescan scan ...` (أو `pip install qorescan`) | Python 3.9 أو أحدث |
| Docker | `docker build -t qorescan .` من المستودع (لا تُنشر صورة جاهزة) | Docker؛ الصورة distroless وتعمل بالمستخدم 65532 |
| GitHub Action | `uses: qorechain/qorescan@<commit sha>` | مشغّل مستضاف على GitHub أو ذاتي الاستضافة؛ يبني الإجراء QoreScan من مصدره بـ `actions/setup-go` |

متغيرات البيئة للغلافين كليهما:

| المتغير | الأثر |
|---|---|
| `QORESCAN_CACHE_DIR` | أين يُخزَّن الملف الثنائي مؤقتًا (الافتراضي: دليل ذاكرة المستخدم المؤقتة). |
| `QORESCAN_DOWNLOAD_BASE` | التنزيل من مرآة بدلًا من GitHub. ويبقى فحص البصمة ساريًا. |

### البدء السريع {#quickstart}

يرسل QoreScan طلبات GET ومصافحة TLS واحدة لكل نقطة، ولا يوقّع شيئًا ولا يحتاج أي مفتاح. شُغّلت الأوامر أدناه في 27 أكتوبر 2026 على الشبكة التجريبية العامة، بملف ثنائي مبني من مصدر v0.1.0.

**1. افحص حالة الشبكة التجريبية، وحسابًا واحدًا، وTLS لنقطة REST العامة للشبكة التجريبية، ومجلدًا من مصادر Solidity:**

```bash
qorescan scan --network testnet \
  --address qor178nscfyp0cq2ac5x7un4u98xrj4ayp6pt0kw08 \
  --tls api-testnet.qore.host:443 \
  --solidity ./contracts \
  --name my-deployment \
  --out cbom.json
```

انتهى برمز الخروج 0. سجّل الـ CBOM، من بين أمور أخرى، معرّف السلسلة `qorechain-diana`، ونمط التوقيع الهجين للمسار الأصلي `required`، ومفتاح PQC الهجين للحساب (حساب الحنفية على الشبكة التجريبية)، ومفاتيح الإجماع Ed25519 لمجموعة المدقّقين، وTLS 1.3 مع المجموعة الهجينة `X25519MLKEM768`، والخوارزميات الموجودة في مصادر Solidity.

أنتج تشغيل ثانٍ لجزأي الشبكة وTLS فقط، جرى أثناء كتابة هذه الصفحة، CBOM من 21 مكوّنًا، منها ML-DSA-87 و`X25519MLKEM768` وبند بروتوكول TLS 1.3 لـ `api-testnet.qore.host:443` وسلسلة شهاداته ومفاتيح Ed25519 لمجموعة المدقّقين.

**2. اكتب تقرير FINMA من الـ CBOM:**

```bash
qorescan report --framework finma --cbom cbom.json --out finma.md
```

يبدأ التقرير بإخلاء المسؤولية، ثم جدول الربط (الأقسام 3.1 إلى 3.5)، وملخص حسب التصنيف، وصف لكل خوارزمية مع حالتها مقابل FIPS وNIST IR 8547 وأدلتها. أنتج فحص ملف Solidity واحد يستخدم `ecrecover` الـ CBOM من CycloneDX 1.6 بمكوّن واحد (`ECDSA secp256k1`) ورأس التقرير نفسه. اسم إطار غير معروف ينتهي برمز الخروج 2 ورسالة تسرد `finma` و`nis` و`dora`.

**3. عبّئ مسبقًا استبيان المورّد وبيان المرونة:**

```bash
qorescan template questionnaire --cbom cbom.json --out vendor-questionnaire.md
qorescan template agility       --cbom cbom.json --out agility-statement.md
```

**4. افحص عقدتك.** يكفي حق القراءة على الدليل الرئيسي للعقدة:

```bash
qorescan scan --node-home ~/.qorechain --network mainnet --out node-cbom.json
```

مع Docker، اربط الدليل الرئيسي للعقدة للقراءة فقط كي لا تستطيع الحاوية تغييره:

```bash
docker run --rm -v "$HOME/.qorechain:/scan/home:ro" qorescan scan --node-home /scan/home > cbom.json
```

**5. عبر الأغلفة تكون الأوامر نفسها:**

```bash
npx @qorechain/qorescan scan --network mainnet --out cbom.json
pipx run qorescan report --framework dora --cbom cbom.json
```

**6. في GitHub Actions.** ثبّت الإجراء وكل إجراء آخر بالـ commit:

```yaml
permissions:
  contents: read
steps:
  - uses: actions/checkout@<sha>
  - id: qorescan
    uses: qorechain/qorescan@<commit sha>
    with:
      solidity: contracts
      network: mainnet
      addresses: qor1...
      out: qorescan.cbom.json
      framework: finma
  - uses: actions/upload-artifact@<sha>
    with:
      name: cbom
      path: |
        ${{ steps.qorescan.outputs.cbom }}
        ${{ steps.qorescan.outputs.report }}
```

مدخلات الإجراء: `node-home` و`network` و`rest` و`addresses` و`tls` و`solidity` (قوائم مفصولة بمسافات أو أسطر جديدة) و`out` (الافتراضي `qorescan.cbom.json`) و`framework`. المخرجات: `cbom` و`report`. يبني الإجراء QoreScan من مصدره عند الـ commit المثبّت، فلا يُنزَّل أي ملف ثنائي.

ما جرى تشغيله لهذه الصفحة: فحص الشبكة التجريبية، وفحص Solidity، وتقرير FINMA، وخطأ الإطار غير المعروف، بملف ثنائي مبني من مصدر v0.1.0. أما الملفات الثنائية المنشورة، وغلافا npm وPyPI (بعد قراءة محتويات حزمتيهما وبنديهما في السجل)، وصورة Docker، وGitHub Action، فلم تُشغَّل.

### الأوامر والخيارات {#commands}

```
qorescan scan [--node-home DIR] [--network mainnet|testnet | --rest URL] [--address ADDR]...
              [--tls HOST:PORT]... [--solidity DIR]... [--out FILE]
qorescan tls HOST:PORT... [--out FILE]
qorescan solidity DIR... [--out FILE]
qorescan report --framework finma|nis|dora --cbom FILE [--out FILE]
qorescan template agility|questionnaire --cbom FILE [--out FILE]
qorescan version
```

قد تأتي الخيارات قبل المعاملات الموضعية أو بعدها. `--out -` (الافتراضي) يكتب إلى الخرج القياسي. يطبع `qorescan <command> -h` خيارات الأمر.

| الأمر | الخيار | ما الذي يفعله |
|---|---|---|
| `scan` | `--node-home DIR` | الدليل الرئيسي للعقدة (الذي يحتوي على `config/`). |
| `scan` | `--network mainnet\|testnet` | قراءة الحالة الحية من `https://api.qore.host` أو `https://api-testnet.qore.host`. |
| `scan` | `--rest URL` | استخدام أي نقطة REST بدلًا من ذلك، مثل عقدتك (`http://127.0.0.1:1317`) أو مرحّل يمرّر طلبات GET. يتغلب على `--network`. |
| `scan` | `--address ADDR` | حساب تُقرأ حالة مفتاح PQC الخاص به. قابل للتكرار. يحتاج `--network` أو `--rest`. |
| `scan` | `--tls HOST:PORT` | نقطة TLS لإجراء المصافحة معها. قابل للتكرار. المنفذ 443 عند الحذف. |
| `scan` | `--solidity PATH` | مجلد أو ملف `.sol`. قابل للتكرار. |
| `scan`، `solidity` | `--include-deps` | فحص `node_modules` و`lib` و`out` و`cache` و`artifacts` و`typechain-types` أيضًا، وهي تُتخطى افتراضيًا. |
| `scan` | `--name NAME` | اسم النشر المفحوص في بيانات تعريف الـ CBOM. |
| `scan` | `--timeout D` | مهلة الشبكة لكل طلب (الافتراضي `20s`). |
| `tls` | `--servername NAME` | اسم الخادم في SNI (الافتراضي: المضيف). |
| `tls` | `--timeout D` | مهلة المصافحة (الافتراضي `15s`). |
| كل عمليات الفحص | `--verbose` | تسجيل كل ملف يُقرأ وكل طلب إلى الخطأ القياسي. |
| الكل | `--out FILE` | ملف الخرج، و`-` للخرج القياسي. |
| `report` | `--framework finma\|nis\|dora` | الإطار المراد الربط به. مطلوب. |
| `report`، `template` | `--cbom FILE` | الـ CBOM المراد قراءته، و`-` للدخل القياسي. مطلوب. |
| `template` | `agility` أو `questionnaire` | أي قالب يُكتب. |

أوامر أخرى: `qorescan tls` فحص TLS مستقل، و`qorescan solidity` فحص Solidity مستقل، و`qorescan template agility` يكتب بيان مرونة تشفيرية معبّأ مسبقًا من الحقائق المفحوصة، و`qorescan template questionnaire` يكتب استبيان مورّد من خمسة أسئلة يتبع التدابير الخمسة في القسم 3 من إرشادات FINMA 05/2026، ويقبل `qorescan report` أيضًا CBOM من CycloneDX 1.6 كتبته أداة أخرى (ويجري التصنيف حينئذ بحسب اسم الخوارزمية).

رموز الخروج: `0` نجاح، `1` خطأ في الفحص أو الإدخال/الإخراج، `2` خطأ في الاستخدام.

## كيفية الوصول {#how-to-access}

| | الشبكة الرئيسية | الشبكة التجريبية |
|---|---|---|
| معرّف السلسلة | `qorechain-vladi` | `qorechain-diana` |
| REST المستخدم بواسطة `--network` | `https://api.qore.host` | `https://api-testnet.qore.host` |

- لا حاجة إلى مفتاح أو حساب أو أموال. لا يوقّع QoreScan ولا يرسل أي معاملة، ولا يكتب شيئًا سوى ملف الخرج الذي تسمّيه.
- ليست كل المسارات مخدومة من كل عقدة. في 27 أكتوبر 2026 لم تكن نقطة REST العامة للشبكة الرئيسية تخدم `/qorechain/pqc/v1/params`؛ فيسجّل الفحص حينئذ ملاحظة ويتابع. وجّه `--rest` إلى عقدتك للحصول على صورة أوفى.
- سجل الخوارزميات على السلسلة غير مكشوف عبر REST. يقرأه QoreScan من `genesis.json` عند فحص دليل عقدة رئيسي.
- يعكس الفحص إصدار السلسلة لدى العقدة التي يقرأها. تختلف مفاتيح البروتوكول وprecompiles النشطة بين الشبكة الرئيسية والتجريبية؛ ويسجّل الـ CBOM ما تبلّغ به العقدة المستعلَم عنها.
- إذا تعذّر على جهازك بلوغ النقاط العامة، فاستخدم `--rest` مع عقدة تشغّلها، أو مع مرحّل يمرّر طلبات GET.
- الاعتماديات: يستخدم غلافا npm وPyPI الوحدات المضمّنة في لغتيهما فقط.

## ملاحظات الأمان {#security}

- **لا تُقرأ قيم المفاتيح الخاصة أبدًا.** من `priv_validator_key.json` يأخذ QoreScan العنوان والمفتاح العام وأسماء أنواع المفاتيح. ومن `node_key.json` يأخذ نوع المفتاح وحده؛ ولا يُشتق معرّف العقدة لأن ذلك يحتاج إلى المفتاح الخاص. تُستبدل محتويات مخزن الملف الخام بعد فك الترميز، ولا تُعاد أبدًا أخطاء فك الترميز لأنها قد تقتبس المدخل.
- لا تُفتح أدلة سلاسل المفاتيح (`keyring-*`) ولا ملفات المفاتيح التي تسميها `tls_key_file` و`tls.key-path`. يسجّل QoreScan فقط أنها موجودة أو مضبوطة. وتُتخطى كتل PEM الأخرى في ملف الشهادة دون فك ترميزها.
- كل طلب إلى الشبكة هو HTTP GET. ولا يُكتب شيء سوى ملف الخرج.
- يتحقق غلافا npm وPyPI من SHA-256 للملف الثنائي قبل كل تشغيل ويرفضان أي عدم تطابق، بما في ذلك عند استخدام مرآة. وبالنسبة للإصدار 0.1.0 تطابق البصمات داخل حزمة npm ملف المجاميع الاختبارية للإصدار.
- صورة Docker من نوع distroless وتعمل بمستخدم غير جذر. اربط الدليل الرئيسي للعقدة بـ `:ro`.
- أبلغ عن الثغرات بشكل خاص على security@qore.network.

## أين نُشر {#where-published}

قُرئت الإصدارات من كل سجل في 27 أكتوبر 2026.

| السجل | الحزمة | الإصدار | الرابط |
|---|---|---|---|
| إصدار GitHub | `qorechain/qorescan` | v0.1.0 (نُشر في 27 أكتوبر 2026)، ملفات ثنائية لـ darwin وlinux وwindows على amd64 وarm64، إضافة إلى `qorescan_0.1.0_checksums.txt` | https://github.com/qorechain/qorescan/releases/tag/v0.1.0 |
| npm | `@qorechain/qorescan` (الأمر `qorescan`) | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorescan |
| PyPI | `qorescan` (Python 3.9 أو أحدث) | 0.1.0 | https://pypi.org/project/qorescan/ |
| Go module proxy | `github.com/qorechain/qorescan` | v0.1.0 | https://pkg.go.dev/github.com/qorechain/qorescan |

المصدر: https://github.com/qorechain/qorescan (Apache-2.0، حقوق النشر 2026 QoreChain Association). لا توجد حزمة على crates.io أو Maven ولا صورة Docker جاهزة؛ ابنِ الصورة من المستودع. يوثّق المستودع كل خيار في `docs/usage.md`، وما يُقرأ وما لا يُقرأ أبدًا في `docs/scanned-data.md`، وربط الأطر ومصادره في `docs/frameworks.md`، والحدود في `docs/limitations.md`.

## الحدود والمشكلات المعروفة {#limits}

- **أداة مساعدة للجرد.** لا تصدر شهادة ولا تدقق ولا تقدم استشارة قانونية، ولا تثبت تقاريرها المطابقة مع أي لائحة أو معيار. التدابير التنظيمية (الاستراتيجية، وخارطة الطريق، وتصنيف البيانات، والمسؤوليات) تُترك "To be completed".
- **النطاق.** يفحص QoreScan المصادر التي توجّهه إليها فقط. البيانات المخزّنة، والنسخ الاحتياطية، وHSM، وأنظمة إدارة المفاتيح، وإعدادات نظام التشغيل والمكتبات، والمحافظ، والجسور، والخدمات خارج السلسلة، كلها خارج الفحص ما لم تضف نقاط TLS الخاصة بها بـ `--tls`. ولا يفحص الجسور.
- **الحالة الحية.** يأتي سجل الخوارزميات من `genesis.json` ويعكس الشبكة عند genesis، لا تغييرات الحوكمة اللاحقة. وتُقرأ مفاتيح إجماع المدقّقين لأحدث مجموعة مدقّقين.
- **TLS.** مصافحة واحدة بتفضيلات عميل Go الافتراضية تُظهر ما يتفاوض عليه الخادم مع عميل حديث، لا كل إصدار وحزمة ومجموعة يقبلها. وقد تجيب نقطة خلف موازن أحمال بشكل مختلف على اتصال آخر.
- **الموقّعون البعيدون.** عند ضبط `priv_validator_laddr` يكون مفتاح المدقّق في مكان آخر ولا يظهر نوعه من الدليل الرئيسي للعقدة.
- **Solidity.** الكشف نصي. لا يحلّ الاستيرادات ولا يتتبع الوراثة ولا يحسب العناوين وقت التشغيل. يُفوَّت عنوان precompile يُجمَّع وقت التشغيل، وقد يُبلَّغ عن متغير سُمّي مثل نمط. وتُتخطى الاعتماديات ما لم تمرّر `--include-deps`.
- **CBOM من أدوات أخرى.** تصنّف التقارير CBOM من أدوات أخرى باسم الخوارزمية وحده.
- **التواريخ.** تؤخذ فئات NIST وانتقالات IR 8547 من الوثائق المقتبسة كما هي في أكتوبر 2026. وقد تضع الإرشادات الخاصة بالتطبيقات تواريخ أبكر.
- **سلسلة الإصدار.** الملف الثنائي المبني من المصدر دون خيار إصدار يطبع `qorescan dev`. استخدم الملف الثنائي للإصدار أو تثبيت Go للإصدار الموسوم حين تحتاج إلى تسجيل الإصدار.

## صفحات ذات صلة {#related}

- [التوقيع ما بعد الكمي](/developer-guide/post-quantum-signing): الهجين secp256k1 مع ML-DSA-87 على المسار الأصلي، ونافذة تفويض EVM.
- [حقيبة الحفظ](/developer-tools/custody-kit): دليل تكامل وشيفرة مرجعية لجهات الحفظ والبورصات.
- [QoreSign](/qoresign/overview): مكتبات التوقيع الهجين والتحقق.
- [تشغيل عقدة](/developer-guide/running-a-node) و[تشغيل مدقّق](/developer-guide/running-a-validator): بنية الدليل الرئيسي للعقدة، والموقّعون البعيدون، وملفات المفاتيح.
- [EVM precompiles](/developer-guide/evm-precompiles): precompiles الخاصة بـ PQC عند `0x0A01` و`0x0A02`.
- [مكتبة ما بعد الكم (qorechain-pqc)](/developer-tools/pqc-library): ML-DSA-87 بست لغات.
- [الاتصال بالشبكة الرئيسية](/getting-started/connecting-to-mainnet) و[الاتصال بالشبكة التجريبية](/getting-started/connecting-to-testnet): النقاط العامة.
