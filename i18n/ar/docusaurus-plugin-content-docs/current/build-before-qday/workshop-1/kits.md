---
slug: /build-before-qday/workshop-1/kits
title: أدوات QoreChain
sidebar_label: الأدوات
sidebar_position: 10
---

# أدوات QoreChain

تتألف حزمة المطورين في QoreChain من أربع عشرة أداة. تسرد هذه الصفحة كل واحدة في سطر، مع إصدارها ومكان نشرها، وتنتهي بست أفكار يمكنك بناؤها منها. اثنتا عشرة أداة متاحة. أما أداتان فلم تُطلقا: Asset kit مجرد مقترح، وPQ light client مجرد مواصفة.

## الابتكارات {#innovations}

- **التوقيع الهجين ML-DSA-87 + secp256k1 مدمج في SDK والمحافظ وQoreSign**، فلا يحتاج التطبيق إلى تنفيذ التوقيع ما بعد الكمومي بنفسه.
- **معاملة هجينة واحدة متحقَّق منها على السلسلة** هي الدليل المشترك بين التطبيقات: راجع [Q-Day Counter](/build-before-qday/workshop-1/apps/qday-counter) و[Q-Day Guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) و[Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector).
- **الشكل نفسه بلغات كثيرة.** تُنشر SDK وQoreSign ومكتبة PQC بعدة لغات وتُفحص مقابل متجهات اختبار مشتركة.

## ابنِ التطبيقات {#build-apps}

| الأداة | ما تفعله | الإصدار والسجل |
| --- | --- | --- |
| [QoreChain SDK](/sdk/overview) | عميل واحد لمسارات Native وEVM وSVM مع التوقيع الهجين، وتسجيل مفاتيح PQC، ومساعدات نافذة EVM، ومستويات الستيكنغ، والاقتصاد الرمزي، وAMM، والاستدعاءات عبر الآلات الافتراضية، وrollups. بلغات TypeScript وPython وRust وJava وGo. | 0.13.0: npm وPyPI وcrates.io وMaven Central وGo |
| [create-qorechain-dapp](/developer-tools/scaffolders-and-cli) | يولّد مشروعًا يعمل بأمر واحد من سبعة قوالب: hardhat وfoundry وviem-wagmi وfullstack-web وevm-solidity وcosmwasm وrollup-app. | 0.13.1: npm |
| [RDK، حزمة تطوير Rollup](/rollups/overview) | إنشاء rollups خاصة بتطبيقات محددة وإطلاقها وتشغيلها، تتسوّى على QoreChain، مع دفعات تسوية موقّعة وعمليات سحب وقراءات إتاحة البيانات. | `@qorechain/rdk` 0.8.0، خمس لغات |

```sh
npm i @qorechain/sdk @qorechain/evm
npx create-qorechain-dapp my-app -t hardhat --network testnet
```

## المحافظ والتوقيع {#wallets-signing}

| الأداة | ما تفعله | الإصدار والسجل |
| --- | --- | --- |
| [QoreX وqorex-integrations](/developer-tools/qorex-integrations) | المحفظة الرسمية تحمل المفتاحين، وتوقّع هجينًا، وتعرض ما توقّعه. وتضيف التكاملات QoreX إلى RainbowKit وwagmi وcosmos-kit وInterchain Kit، مع الأنواع ومحفظة وهمية وتجهيزات Playwright. راجع أيضًا [نظرة عامة على QoreX](/qorex/overview). | QoreX 1.2.3 (iOS وAndroid)، الإضافة 0.4.2 (Chrome وFirefox)، `@qorechain/qorex-rainbowkit` 0.1.0 |
| [Wallet Adapter](/developer-tools/wallet-adapter) | يضيف QoreChain إلى المحافظ التي يستخدمها الناس أصلًا (Keplr وLeap وCosmostation وMetaMask وPhantom)، بما في ذلك توقيع ML-DSA-87 الهجين الذي تشترطه السلسلة. | `@qorechain/wallet-adapter` 0.5.0 |
| [QoreSign](/qoresign/overview) | توقيع هجين للمحافظ والخلفيات غير QoreX: اشتقاق مفتاح ML-DSA، وتوقيع معاملات مسار Native بالمفتاحين، والتحقق محليًا من التواقيع الهجينة، والمحاكاة قبل التوقيع، وSign In With QoreChain. | 0.2.0: TypeScript وRust وGo وSwift وKotlin |
| [QoreChain PQC](/developer-tools/pqc-library) | اللبنات ما بعد الكمومية التي تقوم عليها بقية الأدوات: ML-DSA (FIPS 204) وML-KEM (FIPS 203) وSHAKE-256، متوافقة بايت ببايت بين اللغات ومفحوصة مقابل متجهات اختبار مشتركة. | `@qorechain/pqc` 0.2.3، ست لغات |

```sh
npm i @qorechain/qorex-rainbowkit @qorechain/qorex-types
npm i @qorechain/wallet-adapter
npm i @qorechain/qoresign
npm i @qorechain/pqc
```

## البيانات والخصوصية {#data-privacy}

| الأداة | ما تفعله | الإصدار والسجل |
| --- | --- | --- |
| [QoreSeal](/developer-tools/qoreseal) | تشفير البيانات إلى حسابات QoreChain بـ ML-KEM-1024 (هجين مع X25519 افتراضيًا). ينشر الحساب مفتاحه على السلسلة ويستطيع أي شخص التشفير إليه. عدة مستلمين، ومفاتيح مدققين، ومفاتيح مجموعات متجددة. | 0.1.0: TypeScript وRust وGo وSwift وKotlin وPython |
| [QoreChain MCP](/developer-tools/mcp) | خادم Model Context Protocol وأداة سطر أوامر تمنح أدوات المطورين المتوافقة صلاحية القراءة من QoreChain: الكتل والمعاملات والحسابات والمدققين ومستويات الستيكنغ وحالة التوقيع الهجين وقراءات العقود وتقديرات الرسوم. لا يوقّع أبدًا، ولا يحتفظ بمفاتيح، ولا يبث. | `@qorechain/mcp` 0.1.0 |

```sh
npm i @qorechain/qoreseal
npx -y @qorechain/mcp
```

## البنية التحتية والامتثال {#infra-compliance}

| الأداة | ما تفعله | الإصدار والسجل |
| --- | --- | --- |
| [QORel](/qorel/overview) | مرحّل IBC، وهو نسخة متفرعة من Hermes، بطبقة موقّع قابلة للتبديل ليمكن الترحيل إلى سلاسل تحتاج توقيعًا ما بعد كمومي على كل معاملة. وتحتفظ السلاسل القياسية بصيغة Hermes نفسها تمامًا. | 0.1.0: GitHub وصورة حاوية وHomebrew |
| [Custody kit](/developer-tools/custody-kit) | للجهات الحافظة: ما يتطلبه كل مسار، والتحقق من العناوين، واكتشاف الإيداعات، وتوقيع عمليات السحب والتحقق منها، والستيكنغ، وإدارة مفتاح ML-DSA-87، مع متجهات اختبار وشيفرة مرجعية. | 0.1.0: TypeScript وPython وGo وRust وJava |
| [QoreScan](/developer-tools/qorescan) | يجرد التشفير في نشر ما (إعدادات العقدة، والمفاتيح حسب النوع، ونقاط TLS، ومصادر Solidity، وحالة السلسلة) ويصدّر CBOM بصيغة CycloneDX 1.6، بمخرجات مرتبطة بإرشادات FINMA 05/2026 وخارطة طريق PQC في الاتحاد الأوروبي وDORA. أداة مساعدة للجرد، وليست شهادة. | `@qorechain/qorescan` 0.1.0 |
| [Asset kit](/developer-tools/asset-kit) | **مقترح، غير مُطلق ككل.** أدوات للأصول المرمّزة المنظَّمة: محوّلات ERC-3643 وCMTAT مع فحص حامل ما بعد كمومي، وخزائن ERC-4626 وERC-7540، ووحدة تحكم للمصدّر وعملاء. عقود EVM متاحة؛ أما وحدات الأصول الأصلية فمقترحة. | 0.1.0 |
| [PQ light client](/developer-tools/pq-light-client) | **مواصفة، غير مُطلقة.** عميل خفيف يتتبع نقاط تحقق موقّعة بـ ML-DSA-87. لا تنتج QoreChain هذه النقاط اليوم. يحتوي المستودع على المواصفة ومدققات مرجعية (Go وRust وTypeScript) ليمكن مراجعة التصميم. | 0.1.0 (مواصفة) |

```sh
brew install qorechain/tap/qorel
npx @qorechain/qorescan --help
```

## ست أفكار يمكنك بناؤها {#ideas}

| الفكرة | تُبنى من | ما هي |
| --- | --- | --- |
| دفع آمن كموميًا | SDK وQoreX | زر الدفع بـ QOR لمتجر ويب حيث تُوقَّع كل دفعة هجينًا. |
| قالب انطلاق للهاكاثون | create-qorechain-dapp | من الصفر إلى عقد منشور على شبكة الاختبار في عشر دقائق، بأمر واحد لكل طالب. |
| Sign In With QoreChain | QoreSign | تسجيل دخول دون كلمة مرور لتطبيق ويب، مع فحص التوقيع الهجين على خادمك. |
| مزاد بعروض مختومة | QoreSeal | تبقى العروض مشفّرة حتى لحظة الكشف. |
| جرد الجاهزية لـ PQC | QoreScan | جرد للتشفير وملف CBOM لفريق تقنية مالية ومدققيه. |
| رحّل قناتك الخاصة | QORel | الترحيل بين شبكة QoreChain الاختبارية وسلسلة Cosmos اختبارية أخرى. |

## احصل على الشيفرة {#get-the-code}

لكل أداة صفحة دليل خاصة بها، مرتبطة أعلاه. تطبيقات الأمثلة من هذه الورشة في المستودع العام [qorechain/build-before-qday](https://github.com/qorechain/build-before-qday)، وتمر كل صفحة تطبيق عليها من الأمر الأول إلى الأخير:

```sh
git clone https://github.com/qorechain/build-before-qday
```
