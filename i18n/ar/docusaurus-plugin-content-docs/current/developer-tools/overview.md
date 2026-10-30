---
slug: /developer-tools/overview
title: حزم المطورين
sidebar_label: نظرة عامة
sidebar_position: 1
---

# حزم المطورين

تنشر QoreChain أدوات المطورين على شكل حزم صغيرة في السجلات العامة (npm وPyPI وcrates.io ووكيل وحدات Go وMaven Central وSwift Package Manager). هذه الصفحة هي الفهرس: ما الغرض من كل حزمة، واسمها الدقيق في السجل، ولغتها، وإصدارها الحالي، وأمر تثبيتها، وحالتها، وأين تقرأ كيفية استخدامها. وهي موجهة للمطورين الذين يبنون تطبيقات dApp والمحافظ والخوادم الخلفية والتجميعات على QoreChain ويريدون اختيار الحزمة المناسبة قبل قراءة أي دليل.

قُرئت الإصدارات في الجداول من السجلات في 27 أكتوبر 2026. تعمل الشبكة الرئيسية `qorechain-vladi` على v3.2.5 (طُبّق في 29 أكتوبر 2026) وتعمل شبكة الاختبار `qorechain-diana` على v3.2.6. كل حزمة مدرجة على أنها منشورة مرخّصة بموجب Apache-2.0.

## الابتكارات {#innovations}

- **صيغة توقيع هجينة واحدة في كل لغة.** تشترط السلسلة توقيع secp256k1 مع توقيع ML-DSA-87 (FIPS 204) على معاملات مسار Native. يعيد QoreSign إنتاج متجهات الاختبار المنشورة له بايتاً ببايت في TypeScript وRust وGo وSwift وKotlin وPython، وتشغّل `qorechain-pqc` مجموعة متجهات مشتركة واحدة في روابطها الستة، لذا فإن مفتاحاً أو توقيعاً أُنتج بلغة ما يُتحقَّق منه في اللغات الأخرى.
- **صيغة sign-bytes تُختار من حالة السلسلة، لا بالتخمين.** يسأل كلٌّ من SDK ومحوّل المحفظة و`chain-bridge` ومساعدات الشبكة في QoreSign العقدةَ عبر `GET /cosmos/upgrade/v1beta1/applied_plan/{name}` عن اسمَي الترقية (`v3.2.0` و`v3.1.98`) ويوقّعون بالصيغة v2 عندما يكون أحد الارتفاعين أكبر من صفر. وإذا لم تتوفر نقطة نهاية REST على هاتين السلسلتين فإنها تُطلق خطأً بدلاً من التخمين. وتتحقق الشبكتان كلتاهما من v2 اليوم (جرى التحقق في 27 أكتوبر 2026: طُبّقت `v3.2.0` على الشبكة الرئيسية عند الارتفاع 2,981,742 وطُبّقت `v3.1.98` على شبكة الاختبار عند الارتفاع 5,746,000).
- **بدايات سريعة جرى تشغيلها فعلاً، لا مجرد كتابتها.** للحزم التي لها مثال، شُغّل المثال في 27 أكتوبر 2026 بعد التثبيت من السجل العام. نجح 31 من أصل 34 إدخالاً من إدخالات البدء السريع؛ ويسجّل البيان أي ثلاثة لم تنجح (راجع [الحدود](#limits)).
- **بيان واحد وراء الجداول.** أسماء الحزم والإصدارات وأوامر التثبيت في هذه الصفحة تأتي من بيان واحد مقروء آلياً مع نقطة نهاية إصدار حية لكل حزمة، وهي البيانات نفسها التي يُبنى منها مركز SDK في [صفحة المطورين في لوحة التحكم](/dashboard/developers#sdks).

## طريقة الاستخدام {#how-to-use}

اختر بحسب ما تبنيه.

| تريد أن | استخدم | اقرأ |
|---|---|---|
| تقرأ حالة السلسلة، وتشتق الحسابات، وترسل معاملات موقّعة هجيناً من سكربت أو dApp | QoreChain SDK | [نظرة عامة على SDK](/sdk/overview)، [التثبيت](/sdk/install)، [البدء السريع](/sdk/quickstart) |
| توقّع في محفظتك أو خادمك الخلفي، وتتحقق من التواقيع، وتستخدم Sign In With QoreChain | QoreSign | [نظرة عامة على QoreSign](/qoresign/overview)، [البدء السريع](/qoresign/quickstart) |
| تضيف QoreChain إلى Keplr أو Leap أو Cosmostation، وتنشئ محافظ موحّدة، وتبني رسائل نافذة EVM والمفاتيح المرتبطة | محوّل المحفظة | [محوّل المحفظة](/developer-tools/wallet-adapter) |
| تشغّل مهمة على خادم ترسل QOR أو تسجّل المفاتيح أو تنشر العقود | Chain bridge (أو SDK) | [Chain bridge والـ handles](/developer-tools/chain-bridge) |
| تحلّ `@handle` إلى عنوان موثَّق | Handles | [Chain bridge والـ handles](/developer-tools/chain-bridge#handles) |
| تتيح لتطبيق dApp لديك استخدام محفظة QoreX، أو تختبره بلا إضافة متصفح | تكاملات QoreX | [تكاملات QoreX](/developer-tools/qorex-integrations)، [QoreX للمطورين](/qorex/overview#developers) |
| تنشئ تجميعاً للتطبيقات وتشغّله | RDK | [نظرة عامة على التجميعات](/rollups/overview)، [نشر تجميع](/rollups/deploying-a-rollup) |
| تستخدم الأساسيات ما بعد الكمّية وحدها (ML-DSA وML-KEM وSHAKE-256) | `qorechain-pqc` | [التوقيع ما بعد الكمّي](/developer-guide/post-quantum-signing) |
| تتيح لوكيل ذكاء اصطناعي أو لأداة مطورين قراءة السلسلة (الكتل والمعاملات والحسابات وحالة التوقيع الهجين والمحاكاة والتحويلات غير الموقّعة) | خادم MCP الخاص بـ QoreChain | [خادم MCP الخاص بـ QoreChain](/developer-tools/mcp) |
| تقرأ السلسلة من الطرفية أو من سكربت shell بمخرجات JSON | أداة `qore` CLI | [QoreChain CLI](/developer-tools/qore-cli) |
| تقرأ كيف جرت حماية معاملة مثبَّتة (الرسائل والموقّع والرسوم وطبقة ML-DSA-87 والمستوى) | مفتش معاملات QoreSign (`inspectTransaction`) | [نظرة عامة على QoreSign](/qoresign/overview#inspector) |
| تشفّر البيانات إلى حسابات QoreChain أو مجموعات خاصة أو سلاسل جانبية باستخدام ML-KEM-1024 | QoreSeal | [QoreSeal](/developer-tools/qoreseal) |
| تراجع أو تختبر تصميم عميل خفيف ما بعد كمّي (التحقق من نقاط التحقق) | PQ light client | [PQ light client](/developer-tools/pq-light-client) |
| تدمج QoreChain بصفتك جهة حفظ أو منصة تداول (فحص العناوين، والتحقق من السحوبات، واحتساب الإيداعات) | Custody kit | [Custody kit](/developer-tools/custody-kit) |
| تجرد التشفير في عقدة أو شبكة أو مصادر Solidity على شكل CycloneDX CBOM | QoreScan | [QoreScan](/developer-tools/qorescan) |
| تنشئ نموذجاً أولياً لرمز أصل حقيقي مقيَّد الصلاحيات على شبكة الاختبار (ERC-3643 وCMTAT وخزائن بحصص مقيَّدة وفحص حامل ما بعد كمّي) | Asset Kit | [Asset Kit](/developer-tools/asset-kit) |
| تبني وتختبر مشاريع Solidity أو CosmWasm على QoreChain باستخدام Foundry أو Hardhat أو viem | Chain developer kit (SDK 0.11.0، قريباً) | [Chain developer kit](/developer-tools/chain-dev-sdk) |

ثبّت حزمة واحدة وشغّل بدايتها السريعة على شبكة الاختبار العامة أولاً. القراءات لا تحتاج حساباً ولا مفتاحاً ولا رسوماً.

## طريقة الوصول {#how-to-access}

| | شبكة الاختبار | الشبكة الرئيسية |
|---|---|---|
| معرّف السلسلة | `qorechain-diana` | `qorechain-vladi` |
| معرّف سلسلة EVM | 9800 | 9801 |
| REST | `https://api-testnet.qore.host` | `https://api.qore.host` |
| RPC الإجماع | `https://rpc-testnet.qore.host` | `https://rpc.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` | `https://evm.qore.host` |
| SVM JSON-RPC | `https://svm-testnet.qore.host` | `https://svm.qore.host` |

- **الحساب والمفاتيح:** لا شيء للقراءات. للإرسال تحتاج إلى حساب فيه QOR (يأتي QOR شبكة الاختبار من [الصنبور (Faucet)](/dashboard/faucet)) وعلى مسار Native إلى مفتاح ML-DSA-87 مسجَّل له.
- **التكلفة:** الحزم مجانية. تدفع المعاملات رسوم الشبكة؛ والحد الأدنى للرسوم 0.1 uqor لكل وحدة غاز.
- **قواعد التوقيع:** يجب أن تحمل معاملة مسار Native توقيعاً هجيناً (secp256k1 مع ML-DSA-87). ولا تُقبل معاملة EVM إلا من حساب لديه مفتاح ML-DSA-87 مسجَّل ونافذة تفويض EVM مفتوحة. قراءات SVM تعمل ومعاملات SVM غير مفتوحة بعد. راجع [الحسابات والتوقيع PQC](/sdk/concepts/accounts-pqc).
- **أعراف البدايات السريعة:** تقرأ الأمثلة حساب صنبور شبكة الاختبار العام وتوقّع بالعبارة التجريبية العامة (`abandon` إحدى عشرة مرة، ثم `about`). لا تموّل أبداً حساباً مشتقاً من تلك العبارة. لا تُرسل أي بداية سريعة معاملة.

### صفحة المطورين في لوحة التحكم {#dashboard-developers}

لدى لوحة التحكم صفحة عامة على [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers). وقد جرى التحقق في 27 أكتوبر 2026 من أن فيها سبع علامات تبويب (الشرح الكامل: [Developers](/dashboard/developers)):

- **SDKs:** مركز SDK. كل حزمة في البيان، مجمّعة بحسب المنتج، مع محدد اللغة، وآخر إصدار مقروء حياً من كل سجل، وأسطر التثبيت والاستيراد مع أزرار النسخ، والبداية السريعة مع المخرجات التي لاحظها فريق SDK، والمشكلات المعروفة، ومعرّفات السلاسل ونقاط النهاية العامة. الحزم غير المنشورة لا تعرض أمر تثبيت.
- **Transaction inspector:** الصق تجزئة معاملة من 64 رقماً سداسياً عشرياً على شبكة الاختبار أو الرئيسية لترى الحالة والموقّع والرسوم وهل تتحقق طبقة ما بعد الكمّي وفئة الأمان (PQC أو Enrollment أو SHAKE أو Classical). تستخدم دالة QoreSign 0.1.1 المسماة `inspectTransaction`: راجع [مفتش المعاملات](/qoresign/overview#inspector).
- **PQ key status:** تقرأ مفتاح ML-DSA-87 الذي سجّله عنوان ما على السلسلة ونافذة تفويض EVM الخاصة به، على شبكة الاختبار أو الرئيسية.
- **Simulator:** تجري تشغيلاً تجريبياً لمعاملة موقّعة (`TxRaw` بصيغة base64 أو hex) وتعرض استهلاك الغاز وتغيّرات الأرصدة. لا يُبثّ شيء.
- **Signing playground:** لشبكة الاختبار فقط. تنشئ مفتاحاً هجيناً مؤقتاً في المتصفح، محفوظاً في الذاكرة، لتوقيع الرسائل وطلبات Sign In With QoreChain والتحقق منها.
- **QoreX test wallet:** لشبكة الاختبار فقط. تحقن محفظة اختبار (`window.qorex`، تُعلَن عبر EIP-6963 باسم "QoreX (mock)") في علامة التبويب لتجرّب تدفقات dApp.
- **AI agents (MCP):** حالة خادم MCP الخاص بـ QoreChain (منشور) وإعداد عميل MCP: الإعداد المحلي عبر `npx` أولاً، إضافة إلى نقطة نهاية مستضافة للشبكة التجريبية تحتاج إلى مفتاح API. راجع [خادم MCP الخاص بـ QoreChain](/developer-tools/mcp).

فحص المعاملات نفسه متاح في الشيفرة كدالة المكتبة `inspectTransaction` في QoreSign 0.1.1 (TypeScript). تعرض الجداول أدناه ومركز SDK بيانات الحزم نفسها؛ وقد جرى التحقق من الجداول مقابل السجلات في 27 أكتوبر 2026.

## أين يُنشر {#where-published}

كل اسم هو الاسم الدقيق في السجل. يفتح الرابط على الحزمة صفحتها في السجل. "Published" تعني أن الإصدار المعروض قابل للتثبيت اليوم.

### QoreChain SDK {#group-sdk}

الأدلة: [نظرة عامة على SDK](/sdk/overview)، [التثبيت](/sdk/install)، [دليل React](/sdk/guides/react)، [مرجع CLI](/sdk/reference/cli). المصدر: [qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk).

| الحزمة | اللغة | الإصدار | التثبيت | الحالة |
|---|---|---|---|---|
| [`@qorechain/sdk`](https://www.npmjs.com/package/@qorechain/sdk) | TypeScript | 0.10.0 | `npm install @qorechain/sdk` | منشورة |
| [`@qorechain/react`](https://www.npmjs.com/package/@qorechain/react) | TypeScript (React) | 0.10.0 | `npm install @qorechain/react @qorechain/sdk react react-dom` | منشورة. المزوّد والخطافات و`ConnectButton` وشارة حالة PQC (تُصدَّر باسم `QuantumSafeBadge` في 0.10.0) |
| [`@qorechain/evm`](https://www.npmjs.com/package/@qorechain/evm) | TypeScript | 0.8.0 | `npm install @qorechain/evm viem` | منشورة |
| [`@qorechain/svm`](https://www.npmjs.com/package/@qorechain/svm) | TypeScript | 0.8.0 | `npm install @qorechain/svm @solana/web3.js` | منشورة. قراءات فقط على الشبكات الحية |
| [`create-qorechain-dapp`](https://www.npmjs.com/package/create-qorechain-dapp) | TypeScript (CLI) | 0.10.0 | `npx create-qorechain-dapp my-dapp` | منشورة |
| [`qorechain-sdk`](https://pypi.org/project/qorechain-sdk/) | Python | 0.10.0 | `pip install qorechain-sdk` | منشورة |
| [`qorechain-sdk`](https://crates.io/crates/qorechain-sdk) | Rust | 0.10.0 | `cargo add qorechain-sdk tokio --features tokio/macros,tokio/rt-multi-thread` | منشورة |
| [`github.com/qorechain/qorechain-sdk/packages/go`](https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go) | Go | v0.10.0 | `go get github.com/qorechain/qorechain-sdk/packages/go@latest` | منشورة |
| [`io.github.qorechain:qorechain-sdk`](https://central.sonatype.com/artifact/io.github.qorechain/qorechain-sdk) | Java | 0.10.0 | `implementation("io.github.qorechain:qorechain-sdk:0.10.0")` | منشورة |

### QoreSign {#group-qoresign}

الأدلة: [نظرة عامة على QoreSign](/qoresign/overview)، [البدء السريع](/qoresign/quickstart)، [متجهات الاختبار](/qoresign/vectors). المصدر: [qorechain/qoresign](https://github.com/qorechain/qoresign). نُشر الإصدار 0.1.1 في 27 أكتوبر 2026. يوقّع QoreSign محلياً؛ فهو لا يحتفظ بأي مفاتيح نيابةً عنك ولا يجري توقيعاً بعتبة أو MPC أو بمحفظة عتادية.

| الحزمة | اللغة | الإصدار | التثبيت | الحالة |
|---|---|---|---|---|
| [`@qorechain/qoresign`](https://www.npmjs.com/package/@qorechain/qoresign) | TypeScript | 0.1.1 | `npm install @qorechain/qoresign` | منشورة. تتضمن `inspectTransaction` و`fetchEvmWindow` (جديدتان في 0.1.1) |
| [`qorechain-qoresign`](https://crates.io/crates/qorechain-qoresign) | Rust (تُستورد باسم `qoresign`) | 0.1.1 | `cargo add qorechain-qoresign` | منشورة |
| [`github.com/qorechain/qoresign/go`](https://pkg.go.dev/github.com/qorechain/qoresign/go) | Go | v0.1.1 | `go get github.com/qorechain/qoresign/go@v0.1.1` | منشورة |
| [`qorechain-qoresign`](https://pypi.org/project/qorechain-qoresign/) | Python 3.9+ (تُستورد باسم `qoresign`) | 0.1.1 | `pip install qorechain-qoresign` | منشورة، جديدة في 0.1.1. عجلات (wheels) لنظام macOS (arm64 وx86_64) ولنظام Linux (x86_64 وaarch64)؛ ولا توجد عجلة لنظام Windows بعد. دوال بلا اتصال بالشبكة فقط |
| `QoreSign` (حزمة Swift) | Swift (iOS 16+، macOS 13+) | 0.1.1 | `.package(url: "https://github.com/qorechain/qoresign", from: "0.1.1")`, product `QoreSign` | منشورة كإصدار على GitHub؛ ويُنزَّل الإطار الثنائي منه |
| [`io.github.qorechain:qoresign`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) | Kotlin / JVM (JVM 17+، Kotlin 2.3+) | 0.1.1 | `implementation("io.github.qorechain:qoresign:0.1.1")` | منشورة |
| [`io.github.qorechain:qoresign-android`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign-android) | Kotlin (Android API 24+، Kotlin 2.3+) | 0.1.1 | `implementation("io.github.qorechain:qoresign-android:0.1.1")` | منشورة. واجهة API نفسها كما في حزمة JVM؛ وقد شُغّل مثالها على حزمة JVM فقط، لا على جهاز Android |

تحتاج حزم Kotlin وAndroid إلى مترجم Kotlin 2.3 أو أحدث في مشروعك؛ أما المشروع على Kotlin 2.1 فتفشل ترجمته مقابلها.

تحتوي حزمة TypeScript على مسار فرعي `@qorechain/qoresign/network`، وفي وحدة Go المساعدات نفسها باستثناء `inspectTransaction` و`fetchEvmWindow`: `fetchPqKeyStatus` و`resolveSignBytesVersion` و`simulateTx` (مع تغيّرات الأرصدة) و`suggestGasLimit` و`broadcastTx` و`submitWithSignBytesFallback` (بديل احتياطي واحد ثم يتوقف) و`verifySiwqWithChain` و`verifyMessageWithChain`. ولا تحتوي حزم Rust وSwift وKotlin وPython على شيفرة شبكة.

### QoreSeal {#group-qoreseal}

الصفحة: [QoreSeal](/developer-tools/qoreseal). المصدر: [qorechain/qoreseal](https://github.com/qorechain/qoreseal). يشفّر QoreSeal 0.1.0 البيانات إلى حسابات QoreChain والمجموعات الخاصة والسلاسل الجانبية باستخدام ML-KEM-1024 (FIPS 203). يعمل التشفير دون اتصال بالشبكة؛ أما قراءة مفتاح المستلم من السلسلة فتحتاج إلى سجل مفاتيح KEM، وهو يعمل على شبكة الاختبار ويردّ مسار القراءة فيه على الشبكة الرئيسية منذ v3.2.5 (طُبّق في 29 أكتوبر 2026؛ ولم يكن قد نُشر فيها أي مفتاح وقت التحقق). والبنية بانتظار مراجعة خارجية قبل 1.0.

| الحزمة | اللغة | الإصدار | التثبيت | الحالة |
|---|---|---|---|---|
| [`qorechain-qoreseal`](https://crates.io/crates/qorechain-qoreseal) | Rust (تُستورد باسم `qoreseal`) | 0.1.0 | `cargo add qorechain-qoreseal` | منشورة |
| [`github.com/qorechain/qoreseal/go`](https://pkg.go.dev/github.com/qorechain/qoreseal/go) | Go | v0.1.0 | `go get github.com/qorechain/qoreseal/go@v0.1.0` | منشورة |
| [`qorechain-qoreseal`](https://pypi.org/project/qorechain-qoreseal/) | Python 3.9+ (تُستورد باسم `qoreseal`) | 0.1.0 | `pip install qorechain-qoreseal` | منشورة. عجلات (wheels) لنظام macOS (arm64 وx86_64) ولنظام Linux (x86_64 وaarch64)؛ ولا توجد عجلة لنظام Windows بعد |
| `QoreSeal` (حزمة Swift) | Swift (iOS 16+، macOS 13+) | 0.1.0 | `.package(url: "https://github.com/qorechain/qoreseal", from: "0.1.0")`, product `QoreSeal` | منشورة كإصدار على GitHub؛ ويُنزَّل الإطار الثنائي منه |
| [`io.github.qorechain:qoreseal`](https://central.sonatype.com/artifact/io.github.qorechain/qoreseal) | Kotlin / JVM (JVM 17+، Kotlin 2.3+) | 0.1.0 | `implementation("io.github.qorechain:qoreseal:0.1.0")` | منشورة على Maven Central |
| [`io.github.qorechain:qoreseal-android`](https://central.sonatype.com/artifact/io.github.qorechain/qoreseal-android) | Kotlin (Android API 24+، Kotlin 2.3+) | 0.1.0 | `implementation("io.github.qorechain:qoreseal-android:0.1.0")` | منشورة على Maven Central |
| `@qorechain/qoreseal` | TypeScript | لا يوجد بعد | لا يوجد | **غير منشورة** على npm (الخطأ 404 في 27 أكتوبر 2026). المصدر موجود في المستودع |

### PQ light client {#group-pq-light-client}

الصفحة: [PQ light client](/developer-tools/pq-light-client). المصدر: [qorechain/qorechain-pq-light-client](https://github.com/qorechain/qorechain-pq-light-client). مواصفة مسودة وأدوات تحقق مرجعية لنقاط التحقق الموقّعة بـ ML-DSA-87. لا يتصل بالشبكة الرئيسية ولا بشبكة الاختبار: فـ QoreChain لا تنتج نقاط التحقق التي يتحقق منها ولا يوجد دعم على السلسلة مجدول لها. ويعمل مقابل مجموعات مدققين محاكاة ومتجهات اختبار مشتركة.

| الحزمة | اللغة | الإصدار | التثبيت | الحالة |
|---|---|---|---|---|
| [`@qorechain/pq-light-client`](https://www.npmjs.com/package/@qorechain/pq-light-client) | TypeScript | 0.1.0 | `npm install @qorechain/pq-light-client` | منشورة. تعتمد على `@qorechain/pqc` 0.2.3 |
| [`qorechain-pq-light-client`](https://crates.io/crates/qorechain-pq-light-client) | Rust (المكتبة `qorechain_pq_light_client`) | 0.1.0 | `cargo add qorechain-pq-light-client` | منشورة |
| [`github.com/qorechain/qorechain-pq-light-client/go`](https://pkg.go.dev/github.com/qorechain/qorechain-pq-light-client/go) | Go (الحزمة `pqlightclient`) | v0.1.0 | `go get github.com/qorechain/qorechain-pq-light-client/go@v0.1.0` | منشورة |

### Custody kit {#group-custody-kit}

الصفحة: [Custody kit](/developer-tools/custody-kit). المصدر: [qorechain/qorechain-custody-kit](https://github.com/qorechain/qorechain-custody-kit). دليل تكامل وشيفرة مرجعية ومتجهات اختبار لجهات الحفظ ومنصات التداول، بلغات TypeScript وPython وGo وRust وJava. إنها شيفرة مرجعية تُقرأ أو تُنسخ أو تُضمَّن في مشروعك، وليست مجموعة حزم: الإدخال الوحيد في السجلات هو وحدة Go.

| الحزمة | اللغة | الإصدار | التثبيت | الحالة |
|---|---|---|---|---|
| إصدار GitHub `v0.1.0` | TypeScript وPython وGo وRust وJava | 0.1.0 | `git clone https://github.com/qorechain/qorechain-custody-kit`، ثم ابنِ المجلد الخاص بلغتك | منشورة، 27 أكتوبر 2026. لا توجد حزمة npm أو PyPI أو crates.io أو Maven، وذلك عن قصد |
| [`github.com/qorechain/qorechain-custody-kit/code/go`](https://pkg.go.dev/github.com/qorechain/qorechain-custody-kit/code/go) | Go (الحزمة `custodykit`) | v0.1.0 | `go get github.com/qorechain/qorechain-custody-kit/code/go@v0.1.0` | منشورة |

### QoreScan {#group-qorescan}

الصفحة: [QoreScan](/developer-tools/qorescan). المصدر: [qorechain/qorescan](https://github.com/qorechain/qorescan). يجرد QoreScan Community 0.1.0 التشفير في نشر QoreChain (مجلد العقدة الرئيسي وحالة الشبكة الحية ونقاط نهاية TLS ومصادر Solidity) ويكتب CycloneDX 1.6 CBOM وتقارير Markdown. إنه أداة مساعدة للجرد، وليس شهادة اعتماد ولا تدقيقاً.

| الحزمة | اللغة | الإصدار | التثبيت | الحالة |
|---|---|---|---|---|
| [إصدار GitHub `v0.1.0`](https://github.com/qorechain/qorescan/releases/tag/v0.1.0) | ملفات ثنائية لأنظمة macOS وLinux وWindows (amd64 وarm64) | 0.1.0 | نزّل الملف وتحقق منه مقابل `qorescan_0.1.0_checksums.txt` | منشورة، 27 أكتوبر 2026 |
| [`@qorechain/qorescan`](https://www.npmjs.com/package/@qorechain/qorescan) | غلاف npm (Node.js 18+) | 0.1.0 | `npx @qorechain/qorescan scan ...` | منشورة. ينزّل الملف الثنائي للإصدار ويتحقق منه عند أول تشغيل |
| [`qorescan`](https://pypi.org/project/qorescan/) | غلاف PyPI (Python 3.9+) | 0.1.0 | `pipx run qorescan scan ...` أو `pip install qorescan` | منشورة. السلوك نفسه كما في غلاف npm |
| [`github.com/qorechain/qorescan`](https://pkg.go.dev/github.com/qorechain/qorescan) | Go | v0.1.0 | `go install github.com/qorechain/qorescan/cmd/qorescan@v0.1.0` | منشورة. Go 1.26 |

### Asset Kit {#group-asset-kit}

الصفحة: [Asset Kit](/developer-tools/asset-kit). المصدر: [qorechain/qorechain-asset-kit](https://github.com/qorechain/qorechain-asset-kit). QoreChain Asset Kit 0.1.0 أدوات مفتوحة المصدر لرموز الأصول الحقيقية المقيَّدة الصلاحيات: عقود EVM (وحدة ERC-3643 وقاعدة CMTAT وخزائن بحصص مقيَّدة فوق ضابط يشترط مفتاح ML-DSA-87 مسجَّلاً)، وسكربتات نشر بـ Foundry ووحدة تحكم للمُصدِر، إضافة إلى عملاء لـ**مقترح** وحدات أصلية (`x/asset` و`x/identity` و`x/compliance` و`x/settlement` و`x/attest`) غير مجدول وغير موجود على أي شبكة. تعمل العقود على شبكة الاختبار فقط: فالمُسبَق `0x0A02` غير فعّال على الشبكة الرئيسية، حيث يفشل الضابط مغلقاً. ما قبل 1.0 ولم تُدقَّق؛ والقوالب القانونية في المستودع مسودات لم تُراجَع، وليست استشارة قانونية.

| الحزمة | اللغة | الإصدار | التثبيت | الحالة |
|---|---|---|---|---|
| [إصدار GitHub `v0.1.0`](https://github.com/qorechain/qorechain-asset-kit/releases/tag/v0.1.0) | عقود Solidity ووحدة تحكم المُصدِر وملفات proto والمستندات | 0.1.0 | `git clone --recurse-submodules https://github.com/qorechain/qorechain-asset-kit`، أو `forge install qorechain/qorechain-asset-kit@v0.1.0` | منشورة. تُستخدم العقود ووحدة التحكم من المستودع |
| [`io.github.qorechain:asset-kit`](https://central.sonatype.com/artifact/io.github.qorechain/asset-kit) | Java 17 (عميل للمقترح) | 0.1.0 | `implementation("io.github.qorechain:asset-kit:0.1.0")` | منشورة |
| [`github.com/qorechain/qorechain-asset-kit/clients/go`](https://pkg.go.dev/github.com/qorechain/qorechain-asset-kit/clients/go) | Go (الحزمة `assetkit`، عميل للمقترح) | v0.1.0 | `go get github.com/qorechain/qorechain-asset-kit/clients/go@v0.1.0` | منشورة |
| `qorechain-asset-kit` على PyPI | Python | لا يوجد بعد | لا يوجد | قريباً. ليست على PyPI (الخطأ 404 في 28 أكتوبر 2026) |
| `@qorechain/asset-kit` على npm | TypeScript | لا يوجد بعد | لا يوجد | قريباً. غير منشورة (الخطأ 404 في 28 أكتوبر 2026) |

### Chain developer kit (SDK 0.11.0) {#group-chain-dev-sdk}

الصفحة: [Chain developer kit](/developer-tools/chain-dev-sdk). المصدر: [qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk). الجزء من QoreChain SDK 0.11.0 الموجّه لفرق Solidity والعقود الذكية: تعريفات سلسلة viem ومساعدات نافذة تفويض EVM في `@qorechain/evm`، وأربعة قوالب جديدة في `create-qorechain-dapp` (Foundry وHardhat 3 وviem مع wagmi، ورمز QoreChain Native)، وبدايات سريعة لـ EVM، وصفحة عن اختلاف EVM في QoreChain عن Ethereum.

**قريباً.** وُسم SDK 0.11.0 على GitHub (`v0.11.0`) وإصداره على npm معلّق: ففي 27 أكتوبر 2026 كان npm يقدّم `@qorechain/sdk` 0.10.0 و`@qorechain/evm` 0.8.0 و`create-qorechain-dapp` 0.10.0، وأعاد `@qorechain/sdk@0.11.0` الخطأ 404. وإلى أن يعرض npm الإصدار 0.11.0 لا يمكن تثبيت تعريفات السلسلة ومساعدات النافذة والقوالب الجديدة؛ والمتاح اليوم هو حزم 0.10.0 في [جدول SDK](#group-sdk). يغيّر 0.11.0 حزم npm فقط: تبقى SDK لغات Python وRust وGo وJava على 0.10.0.

### Rollup Development Kit (RDK) {#group-rdk}

الأدلة: [نظرة عامة على التجميعات](/rollups/overview)، [نشر تجميع](/rollups/deploying-a-rollup)، [بنية Rollup Development Kit](/architecture/rollup-development-kit). المصدر: [qorechain/qorechain-rdk](https://github.com/qorechain/qorechain-rdk).

| الحزمة | اللغة | الإصدار | التثبيت | الحالة |
|---|---|---|---|---|
| [`@qorechain/rdk`](https://www.npmjs.com/package/@qorechain/rdk) | TypeScript | 0.7.0 | `npm install @qorechain/rdk` | منشورة. عميل RDK الوحيد الذي يوقّع هجيناً، وفقط عند تمرير `pqcKeypair` |
| [`@qorechain/rdk-cli`](https://www.npmjs.com/package/@qorechain/rdk-cli) | TypeScript (CLI `qorollup`) | 0.7.0 | `npm install -g @qorechain/rdk-cli` | منشورة. يعمل عبر رابط npm bin منذ 0.6.2 (ولم يكن 0.6.1 وما قبله يطبع شيئاً). تُوقّع أوامر المعاملات فيه توقيعاً كلاسيكياً فقط، وهو ما ترفضه الشبكتان |
| [`create-qorechain-rollup`](https://www.npmjs.com/package/create-qorechain-rollup) | TypeScript (CLI) | 0.7.0 | `npx create-qorechain-rollup my-rollup` | منشورة |
| [`qorechain-rdk`](https://pypi.org/project/qorechain-rdk/) | Python (3.10+، تُستورد باسم `qorrdk`) | 0.7.0 | `pip install qorechain-rdk` | منشورة. القراءات تعمل؛ والمعاملات تُوقَّع توقيعاً كلاسيكياً فقط |
| [`qorechain-rdk`](https://crates.io/crates/qorechain-rdk) | Rust | 0.7.0 | `cargo add qorechain-rdk` | منشورة. القراءات تعمل؛ والمعاملات تُوقَّع توقيعاً كلاسيكياً فقط |
| [`github.com/qorechain/qorechain-rdk/packages/go`](https://pkg.go.dev/github.com/qorechain/qorechain-rdk/packages/go) | Go | v0.7.0 | `go get github.com/qorechain/qorechain-rdk/packages/go@v0.7.0` | منشورة. القراءات تعمل؛ والمعاملات تُوقَّع توقيعاً كلاسيكياً فقط |
| [`io.github.qorechain:qorechain-rdk`](https://central.sonatype.com/artifact/io.github.qorechain/qorechain-rdk) | Java (JDK 17+) | 0.7.0 | `implementation("io.github.qorechain:qorechain-rdk:0.7.0")` | منشورة. القراءات تعمل؛ والمعاملات تُوقَّع توقيعاً كلاسيكياً فقط |

### الأساسيات ما بعد الكمّية (`qorechain-pqc`) {#group-pqc}

الدليل: [التوقيع ما بعد الكمّي](/developer-guide/post-quantum-signing). المصدر: [qorechain/qorechain-pqc](https://github.com/qorechain/qorechain-pqc). توقيع ML-DSA حتمي افتراضياً في كل الروابط؛ أما التوقيع المتحوّط (hedged) فهو اختيار صريح.

| الحزمة | اللغة | الإصدار | التثبيت | الحالة |
|---|---|---|---|---|
| [`@qorechain/pqc`](https://www.npmjs.com/package/@qorechain/pqc) | TypeScript | 0.2.3 | `npm install @qorechain/pqc` | منشورة |
| [`qorechain-pqc`](https://pypi.org/project/qorechain-pqc/) | Python (3.9+) | 0.2.3 | `pip install qorechain-pqc` | منشورة. تحتاج liboqs؛ ويبنيها أول استيراد إن كانت مفقودة (git وCMake ومترجم C) |
| [`qorechain-pqc`](https://crates.io/crates/qorechain-pqc) | Rust | 0.2.3 | `cargo add qorechain-pqc` | منشورة |
| [`github.com/qorechain/qorechain-pqc/go`](https://pkg.go.dev/github.com/qorechain/qorechain-pqc/go) | Go | v0.2.3 | `go get github.com/qorechain/qorechain-pqc/go` | منشورة |
| [`io.github.qorechain:qorechain-pqc`](https://central.sonatype.com/artifact/io.github.qorechain/qorechain-pqc) | Java | 0.2.3 | `implementation("io.github.qorechain:qorechain-pqc:0.2.3")` | منشورة |
| مكتبة C | C | 0.2.3 | ابنِ `c/` من المستودع (يحتاج liboqs وOpenSSL) | مصدر فقط، بلا سجل حزم |

### محوّل المحفظة {#group-wallet-adapter}

الصفحة: [محوّل المحفظة](/developer-tools/wallet-adapter). المصدر: [qorechain/qorechain-wallet-adapter](https://github.com/qorechain/qorechain-wallet-adapter).

| الحزمة | اللغة | الإصدار | التثبيت | الحالة |
|---|---|---|---|---|
| [`@qorechain/wallet-adapter`](https://www.npmjs.com/package/@qorechain/wallet-adapter) | TypeScript (وحدة ES، JavaScript عادي مع تعريفات الأنواع) | 0.4.0 | `npm install @qorechain/wallet-adapter @cosmjs/stargate @cosmjs/proto-signing` | منشورة. بلا بداية سريعة مُختبَرة |

### Chain bridge {#group-chain-bridge}

الصفحة: [Chain bridge والـ handles](/developer-tools/chain-bridge).

| الحزمة | اللغة | الإصدار | التثبيت | الحالة |
|---|---|---|---|---|
| [`@qorechain/chain-bridge`](https://www.npmjs.com/package/@qorechain/chain-bridge) | TypeScript (خادم Node.js) | 0.2.3 | `npm install @qorechain/chain-bridge` | منشورة. بلا بداية سريعة مُختبَرة. لا يعرض السجل أي مستودع مصدر |

### Handles {#group-handles}

الصفحة: [Chain bridge والـ handles](/developer-tools/chain-bridge#handles).

| الحزمة | اللغة | الإصدار | التثبيت | الحالة |
|---|---|---|---|---|
| [`@qorechain/handles`](https://www.npmjs.com/package/@qorechain/handles) | TypeScript | 0.1.0 | `npm install @qorechain/handles` | منشورة. تتحقق من حلّ handle مقابل مفتاح سجل مثبَّت. ولا تثبّت العناوين بنفسها: يوفّر المستدعي مخزن التثبيت ويقرر متى يثبّت. بلا بداية سريعة مُختبَرة. لا يعرض السجل أي مستودع مصدر |

### تكاملات QoreX {#group-qorex}

الدليل: [QoreX للمطورين](/qorex/overview#developers). المصدر: [qorechain/qorex-integrations](https://github.com/qorechain/qorex-integrations). نُشرت الحزم الست كلها في 27 أكتوبر 2026.

| الحزمة | اللغة | الإصدار | التثبيت | الحالة |
|---|---|---|---|---|
| [`@qorechain/qorex-types`](https://www.npmjs.com/package/@qorechain/qorex-types) | TypeScript | 0.1.0 | `npm install @qorechain/qorex-types` | منشورة. تكتشف QoreX (EIP-6963 والمزوّد الأصلي) |
| [`@qorechain/qorex-rainbowkit`](https://www.npmjs.com/package/@qorechain/qorex-rainbowkit) | TypeScript | 0.1.0 | `npm install @qorechain/qorex-rainbowkit @rainbow-me/rainbowkit wagmi viem @tanstack/react-query` | منشورة |
| [`@qorechain/qorex-interchain-kit`](https://www.npmjs.com/package/@qorechain/qorex-interchain-kit) | TypeScript (React) | 0.1.0 | `npm install @qorechain/qorex-interchain-kit @interchain-kit/core @interchain-kit/react` | منشورة |
| [`@qorechain/qorex-cosmos-kit`](https://www.npmjs.com/package/@qorechain/qorex-cosmos-kit) | TypeScript (React) | 0.1.0 | `npm install @qorechain/qorex-cosmos-kit @cosmos-kit/core @cosmos-kit/react` | منشورة. مع `@cosmos-kit/react` 2.24 مرّر `throwErrors={false}`؛ فمقطع README يتجاهله |
| [`@qorechain/qorex-wallet-mock`](https://www.npmjs.com/package/@qorechain/qorex-wallet-mock) | TypeScript | 0.1.0 | `npm install -D @qorechain/qorex-wallet-mock` | منشورة. محفظة اختبار توقّع فعلياً على شبكة الاختبار |
| [`@qorechain/qorex-synpress`](https://www.npmjs.com/package/@qorechain/qorex-synpress) | TypeScript | 0.1.0 | `npm install -D @qorechain/qorex-synpress @playwright/test` | منشورة. تجهيزات Playwright؛ ووضع الإضافة يُطلق خطأً اليوم |

### Connect (مهملة) {#group-connect}

| الحزمة | اللغة | الإصدار | التثبيت | الحالة |
|---|---|---|---|---|
| [`@qorechain/connect`](https://www.npmjs.com/package/@qorechain/connect) | TypeScript | 0.2.1 | لا يوجد | **مهملة ولم تعد تُصان.** لا تستخدمها في عمل جديد. استبدلها كما في الجدول أدناه |

:::caution @qorechain/connect مهملة
`@qorechain/connect` موسومة بأنها مهملة على npm. نطاق التبعية النظيرة فيها هو `@qorechain/wallet-adapter` `^0.2.1`، ولا يشمل 0.4.0، ولا تفتح [نافذة تفويض EVM](/sdk/guides/evm#evm-window)، لذا يُرفض إرسال EVM عبرها إلى أن يكون للحساب مفتاح مسجَّل ونافذة مفتوحة. والمستودع المذكور في بيانات السجل الوصفية غير متاح للعموم.
:::

| الحاجة | استخدم بدلاً منها |
|---|---|
| اكتشاف QoreX (EVM وNative وSolana) | `@qorechain/qorex-types` |
| تطبيقات EVM dApp مع RainbowKit وwagmi | `@qorechain/qorex-rainbowkit` |
| تطبيقات Cosmos dApp | `@qorechain/qorex-interchain-kit` (أو `@qorechain/qorex-cosmos-kit`) |
| التوقيع الهجين في محفظتك أو خادمك الخلفي | `@qorechain/qoresign` |

### QORel، مُرحِّل IBC {#group-qorel}

| الحزمة | المصدر | الإصدار | التثبيت | الحالة |
|---|---|---|---|---|
| QORel (`qorel`) | إصدار GitHub `qorel-v0.1.0`، وHomebrew، والحاوية `ghcr.io/qorechain/qorel` | 0.1.0 | `brew install qorechain/tap/qorel` | منشورة كإصدار تجريبي مبدئي (pre-release). IBC v1 فقط؛ لشبكة الاختبار فقط. راجع [QORel](/qorel/overview) |

### خادم MCP وأداة CLI {#group-mcp}

الصفحات: [خادم MCP الخاص بـ QoreChain](/developer-tools/mcp)، [QoreChain CLI](/developer-tools/qore-cli). المصدر: [qorechain/qorechain-mcp](https://github.com/qorechain/qorechain-mcp) (عام). كلاهما يقرأ السلسلة ولا يوقّع ولا يحتفظ بمفاتيح ولا يبثّ. نُشرا في 27 أكتوبر 2026.

| الحزمة | اللغة | الإصدار | التثبيت | الحالة |
|---|---|---|---|---|
| [`@qorechain/mcp`](https://www.npmjs.com/package/@qorechain/mcp) | TypeScript (خادم Node.js، الأمر `qorechain-mcp`) | 0.1.0 | `npx -y @qorechain/mcp` | منشورة. تدعم stdio وStreamable HTTP. نقطة نهاية مستضافة، `https://mcp.qorechain.io/mcp`، تحتاج إلى مفتاح API يُطلب من لوحة التحكم |
| [`qorechain-mcp`](https://pypi.org/project/qorechain-mcp/) | Python (3.10+) | 0.1.0 | `pip install qorechain-mcp` (أو `uvx qorechain-mcp`) | منشورة. الأدوات نفسها الموجودة في حزمة npm؛ وstdio فقط |
| [`@qorechain/qore-cli`](https://www.npmjs.com/package/@qorechain/qore-cli) | TypeScript (أداة CLI باسم `qore`) | 0.1.0 | `npm install -g @qorechain/qore-cli` | منشورة. مخرجات `--json` مطابقة لمخرجات أداة MCP |

### المخطط لها (غير منشورة) {#planned}

هذه الحزم ليست على سجلاتها بعد، فلا شيء للتثبيت ولا يمكن استخدام السلوك الموصوف لها بعد. أعادت كل منها الخطأ 404 (أو لم تكن مدرجة) في 27 أكتوبر 2026.

| الحزمة | الاستخدام المقصود | الحالة |
|---|---|---|
| `@qorechain/qoreseal` على npm | QoreSeal للغة TypeScript | غير منشورة؛ المصدر موجود في المستودع |
| `qorechain-asset-kit` على PyPI، و`@qorechain/asset-kit` على npm | عملاء [Asset Kit](/developer-tools/asset-kit) للغتي Python وTypeScript | غير منشورين؛ استخدم نسخة مستنسخة من المستودع |
| `@qorechain/sdk` و`@qorechain/evm` و`@qorechain/react` و`@qorechain/svm` و`create-qorechain-dapp` الإصدار 0.11.0 على npm | [chain developer kit](/developer-tools/chain-dev-sdk) | موسومة على GitHub، وإصدار npm معلّق |

## كيف تحصل على الإصدارات الحية {#live-versions}

الجداول لقطة من وقت معيّن. لقراءة الإصدار الحالي لحزمة بنفسك:

| السجل | الطلب | الحقل |
|---|---|---|
| npm | `https://registry.npmjs.org/<name>/latest` | `version` |
| PyPI | `https://pypi.org/pypi/<name>/json` | `info.version` |
| crates.io | `https://crates.io/api/v1/crates/<name>` (أرسل ترويسة `User-Agent` وإلا رُفض الطلب) | `crate.max_stable_version` |
| Go | `https://proxy.golang.org/<module>/@latest` | `Version` (أزل `v` البادئة) |
| Maven Central | `https://repo1.maven.org/maven2/<group path>/<artifact>/maven-metadata.xml` | `<release>` |
| Swift | `https://api.github.com/repos/qorechain/qoresign/releases/latest` | `tag_name` (أزل `v` البادئة)؛ وطلبات GitHub غير الموثَّقة محدودة بـ 60 في الساعة لكل عنوان |

في اسم npm ذي النطاق أبقِ `@`، مثلاً `https://registry.npmjs.org/@qorechain/sdk/latest`. الرد 404 يعني أن الحزمة غير منشورة. قد يجيب وكيل Go عن `@latest` من ذاكرة مؤقتة لفترة قصيرة بعد الإصدار، لذا ثبّت الإصدار في الأمر عندما تحتاج إصداراً بعينه (كما يفعل تثبيت RDK لـ Go أعلاه). وتعرض صفحة كل حزمة في سجلها الإصدار وتاريخ الإصدارات أيضاً.

## الحدود والمشكلات المعروفة {#limits}

- **شبكتان حيتان بإصدارين مختلفين.** تعمل الشبكة الرئيسية على v3.2.5 (منذ 29 أكتوبر 2026) وتعمل شبكة الاختبار على v3.2.6. تُوسَم الميزة الموجودة على شبكة الاختبار فقط (بنود v3.2.6 ودوال EVM PQC المُترجَمة مسبقاً) في صفحتها.
- **غير متاح بعد:** `@qorechain/qoreseal` على npm، وAsset Kit على PyPI وnpm (ووحداته الأصلية، وهي مقترح غير مجدول)، وSDK 0.11.0 (chain developer kit) على npm، ومعاملات SVM، ومُسبقات EVM (precompiles) على الشبكة الرئيسية (وهي فعّالة على شبكة الاختبار فقط؛ راجع [نظرة عامة على SDK](/sdk/overview) للقائمة مساراً بمسار).
- **سجل QoreSeal وPQ light client.** يحتاج التشفير إلى عنوان مقروء من السلسلة إلى سجل مفاتيح KEM، وهو يعمل على شبكة الاختبار، ويردّ مسار القراءة فيه على الشبكة الرئيسية منذ v3.2.5. ولا يتصل PQ light client بأي من الشبكتين؛ ولا يوجد دعم مجدول على السلسلة لنقاط التحقق الخاصة به.
- **Kotlin 2.3 أو أحدث.** تحتاج حزم Kotlin وAndroid الخاصة بـ QoreSign وQoreSeal إلى مترجم Kotlin 2.3 أو أحدث؛ ويفشل Kotlin 2.1 في الترجمة مقابلها.
- **لا عجلات لنظام Windows.** لحزمتي Python الخاصتين بـ QoreSign وQoreSeal عجلات (wheels) لنظامَي macOS وLinux فقط؛ وتُبنى المنصات الأخرى من توزيعة المصدر، وهي تحتاج إلى Rust.
- **أمثلة لم تُشغَّل:** من إدخالات البدء السريع الـ 34، شُغّل 31 ونجحت في 27 أكتوبر 2026. شُغّل مثال QoreSign بلغة Python بعد نشر الحزمة (macOS arm64 وLinux aarch64)، ولم يُشغَّل مثال QoreSign لـ Android على جهاز. ولمحوّل المحفظة وchain bridge وhandles لا توجد بداية سريعة، لذا فإن أمثلتها في هذا الدليل مأخوذة من تعريفات أنواع الحزم ومصدرها ولم تُشغَّل من البداية إلى النهاية.
- **`@qorechain/rdk-cli` قبل 0.6.2** لم يطبع شيئاً عند تشغيله عبر رابط npm bin، وطبع `--version` فيه 0.4.1. و**`@qorechain/rdk` قبل 0.7.0** كان يبني براهين سحب لا تجتاز التحقق على السلسلة أبداً. استخدم 0.7.0.
- **تعارض إصدارات cosmjs.** يستخدم `@qorechain/wallet-adapter` و`@qorechain/chain-bridge` الإصدار 0.32 من cosmjs؛ ويستخدم SDK الإصدار 0.39. تثبيت المحوّل بجانب SDK في مشروع واحد يجعل npm يبلّغ عن `ERESOLVE`. أبقِهما في مشروعين منفصلين أو مرّر `--legacy-peer-deps`.
- **نسخة SDK متداخلة في إصدارات RDK الأقدم.** يعتمد `@qorechain/rdk` 0.6.2 وما قبله على `@qorechain/sdk` `^0.9.0`، لذا كان تطبيق على SDK 0.10.0 يحصل على نسخة SDK 0.9.x ثانية متداخلة. ومنذ 0.7.0 تعتمد الحزمة على `@qorechain/sdk` `^0.10.0` وتشارك نسخة واحدة.
- **عملاء RDK الكلاسيكيون فقط.** تُوقّع عملاء RDK في Python وRust وGo وJava توقيعاً كلاسيكياً فقط، وهو ما يرفضه مسار Native على الشبكتين؛ استخدمها للقراءات، أو استخدم عميل TypeScript مع `pqcKeypair` للمعاملات.
- **حزم بلا مستودع مصدر عام.** لا تذكر `@qorechain/chain-bridge` و`@qorechain/handles` أي مستودع مصدر في بيانات سجلهما الوصفية. يمكنك قراءة محتويات الحزمة المنشورة على npm.
- **حزمة Python `qorechain-pqc`** ليس فيها توليد مفاتيح من بذرة في 0.2.3، وتحتاج إلى liboqs.
