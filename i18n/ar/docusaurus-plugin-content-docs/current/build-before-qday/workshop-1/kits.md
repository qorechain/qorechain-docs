---
slug: /build-before-qday/workshop-1/kits
title: أطقم QoreChain
sidebar_label: الأطقم
sidebar_position: 10
---

# أطقم QoreChain

تتألف حزمة المطورين في QoreChain من أربعة عشر طقمًا. تعرض هذه الصفحة كل طقم في سطر، مع إصداره ومكان نشره، وتنتهي بست أفكار يمكنك بناؤها منها. اثنا عشر طقمًا متاحة. أما اثنان فلم يُطلقا: طقم Asset مجرد مقترح، وعميل PQ الخفيف مجرد مواصفة.

## الابتكارات {#innovations}

- **التوقيع الهجين ML-DSA-87 مع secp256k1 مدمج في SDK والمحافظ وQoreSign**، فلا يحتاج التطبيق إلى تنفيذ التوقيع ما بعد الكمّي بنفسه.
- **معاملة واحدة بتوقيع هجين، متحقَّق منها على السلسلة**، هي الدليل المشترك بين التطبيقات: انظر [Q-Day Counter](/build-before-qday/workshop-1/apps/qday-counter) و[Q-Day Guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) و[Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector).
- **الشكل نفسه بلغات كثيرة.** يصدر SDK وQoreSign ومكتبة PQC بعدة لغات، ويُفحص كل منها بناءً على متجهات اختبار مشتركة.

## ابنِ التطبيقات {#build-apps}

| الطقم | ماذا يفعل | الإصدار والسجل |
| --- | --- | --- |
| [QoreChain SDK](/sdk/overview) | عميل واحد لمسارات Native وEVM وSVM مع التوقيع الهجين، وتسجيل مفتاح PQC، ومساعدات نافذة EVM، ومستويات التخزين (staking tiers)، والاقتصاد الرمزي، وAMM، والاستدعاءات عبر الآلات الافتراضية، وrollups. TypeScript وPython وRust وJava وGo. | 0.13.0: npm وPyPI وcrates.io وMaven Central وGo |
| [create-qorechain-dapp](/developer-tools/scaffolders-and-cli) | يولّد مشروعًا يعمل بأمر واحد من سبعة قوالب: hardhat وfoundry وviem-wagmi وfullstack-web وevm-solidity وcosmwasm وrollup-app. | 0.13.1: npm |
| [RDK، حزمة تطوير Rollup](/rollups/overview) | إنشاء rollups مخصصة لتطبيقات معينة وإطلاقها وتشغيلها، تُسوّى على QoreChain، مع دفعات تسوية موقّعة وسحوبات وقراءات إتاحة البيانات. | `@qorechain/rdk` 0.8.0، خمس لغات |

```sh
npm i @qorechain/sdk @qorechain/evm
npx create-qorechain-dapp my-app -t hardhat --network testnet
```

## المحافظ والتوقيع {#wallets-signing}

| الطقم | ماذا يفعل | الإصدار والسجل |
| --- | --- | --- |
| [QoreX وqorex-integrations](/developer-tools/qorex-integrations) | المحفظة الرسمية تحمل المفتاحين، وتوقّع توقيعًا هجينًا، وتُظهر لك ما توقّعه. وتضيف التكاملات QoreX إلى RainbowKit وwagmi وcosmos-kit وInterchain Kit، مع الأنواع ومحفظة وهمية وأدوات Playwright. انظر أيضًا [نظرة عامة على QoreX](/qorex/overview). | QoreX 1.2.3 (iOS وAndroid)، الإضافة 0.4.2 (Chrome وFirefox)، `@qorechain/qorex-rainbowkit` 0.1.0 |
| [Wallet Adapter](/developer-tools/wallet-adapter) | يضيف QoreChain إلى المحافظ التي يستخدمها الناس أصلًا (Keplr وLeap وCosmostation وMetaMask وPhantom)، بما في ذلك توقيع ML-DSA-87 الهجين الذي تشترطه السلسلة. | `@qorechain/wallet-adapter` 0.5.0 |
| [QoreSign](/qoresign/overview) | توقيع هجين للمحافظ والخوادم الخلفية غير QoreX: اشتقاق مفتاح ML-DSA، وتوقيع معاملات مسار Native بالمفتاحين، والتحقق محليًا من التواقيع الهجينة، والمحاكاة قبل التوقيع، وSign In With QoreChain. | 0.2.0: TypeScript وRust وGo وSwift وKotlin |
| [QoreChain PQC](/developer-tools/pqc-library) | اللبنات ما بعد الكمّية التي تقوم عليها بقية الأطقم: ML-DSA (FIPS 204) وML-KEM (FIPS 203) وSHAKE-256، متوافقة بايتًا ببايت بين اللغات ومفحوصة بمتجهات اختبار مشتركة. | `@qorechain/pqc` 0.2.3، ست لغات |

```sh
npm i @qorechain/qorex-rainbowkit @qorechain/qorex-types
npm i @qorechain/wallet-adapter
npm i @qorechain/qoresign
npm i @qorechain/pqc
```

## البيانات والخصوصية {#data-privacy}

| الطقم | ماذا يفعل | الإصدار والسجل |
| --- | --- | --- |
| [QoreSeal](/developer-tools/qoreseal) | تشفير البيانات لحسابات QoreChain بـ ML-KEM-1024 (هجين مع X25519 افتراضيًا). ينشر الحساب مفتاحه على السلسلة ويستطيع أي شخص التشفير له. يدعم عدة مستلمين ومفاتيح مدقّقين ومفاتيح مجموعات متجددة. | 0.1.0: TypeScript وRust وGo وSwift وKotlin وPython |
| [QoreChain MCP](/developer-tools/mcp) | خادم Model Context Protocol وأداة سطر أوامر تمنح أدوات المطورين المتوافقة صلاحية قراءة QoreChain: الكتل والمعاملات والحسابات والمدقّقين ومستويات التخزين وحالة التوقيع الهجين وقراءات العقود وتقدير الرسوم. لا يوقّع أبدًا ولا يحتفظ بمفاتيح ولا يبث معاملات. | `@qorechain/mcp` 0.1.0 |

```sh
npm i @qorechain/qoreseal
npx -y @qorechain/mcp
```

## البنية التحتية والامتثال {#infra-compliance}

| الطقم | ماذا يفعل | الإصدار والسجل |
| --- | --- | --- |
| [QORel](/qorel/overview) | مُرحِّل IBC، وهو فرع من Hermes، مع طبقة توقيع قابلة للتبديل ليمكن الترحيل بين سلاسل تتطلب توقيعًا ما بعد كمّي على كل معاملة. وتحتفظ السلاسل العادية بصيغة Hermes نفسها تمامًا. | 0.1.0: GitHub وصورة حاوية وHomebrew |
| [طقم Custody](/developer-tools/custody-kit) | لجهات الحفظ: ما يتطلبه كل مسار، والتحقق من العناوين، واكتشاف الإيداعات، وتوقيع السحوبات والتحقق منها، والتخزين (staking)، وإدارة مفتاح ML-DSA-87، مع متجهات اختبار وشيفرة مرجعية. | 0.1.0: TypeScript وPython وGo وRust وJava |
| [QoreScan](/developer-tools/qorescan) | يجرد التشفير في منظومة منشورة (إعدادات العقد، والمفاتيح حسب نوعها، ونقاط TLS، ومصادر Solidity، وحالة السلسلة) ويصدّر CBOM بصيغة CycloneDX 1.6، مع مخرجات مربوطة بإرشادات FINMA 05/2026 وخارطة الطريق الأوروبية للتشفير ما بعد الكمّي وDORA. أداة مساعدة للجرد، لا شهادة. | `@qorechain/qorescan` 0.1.0 |
| [طقم Asset](/developer-tools/asset-kit) | **مقترح، لم يُطلق كاملًا.** أدوات للأصول المرمَّزة الخاضعة للتنظيم: محوّلات ERC-3643 وCMTAT مع فحص للحائز ما بعد كمّي، وخزائن ERC-4626 وERC-7540، ووحدة تحكم للمُصدِر وعملاء. عقود EVM متاحة؛ أما وحدات الأصول على مسار Native فمقترح. | 0.1.0 |
| [عميل PQ الخفيف](/developer-tools/pq-light-client) | **مواصفة، لم يُطلق.** عميل خفيف يتتبع نقاط تحقق موقّعة بـ ML-DSA-87. لا تُنتج QoreChain هذه النقاط اليوم. يضم المستودع المواصفة ومدقّقين مرجعيين (Go وRust وTypeScript) ليمكن مراجعة التصميم. | 0.1.0 (مواصفة) |

```sh
brew install qorechain/tap/qorel
npx @qorechain/qorescan --help
```

## ست أفكار يمكنك بناؤها {#ideas}

| الفكرة | مبنية من | ما هي |
| --- | --- | --- |
| دفع آمن كميًا | SDK وQoreX | زر "ادفع بـ QOR" لمتجر ويب، تُوقَّع فيه كل دفعة توقيعًا هجينًا. |
| بداية سريعة للهاكاثون | create-qorechain-dapp | من الصفر إلى عقد منشور على الشبكة التجريبية في عشر دقائق، بأمر واحد لكل طالب. |
| Sign In With QoreChain | QoreSign | تسجيل دخول دون كلمة مرور لتطبيق ويب، مع فحص التوقيع الهجين على خادمك. |
| مزاد بعروض مختومة | QoreSeal | تبقى العروض مشفّرة حتى لحظة الكشف. |
| جرد الجاهزية ما بعد الكمّية | QoreScan | جرد للتشفير وملف CBOM لفريق تقنية مالية ومدقّقيه. |
| رحّل قناتك الخاصة | QORel | ترحيل بين الشبكة التجريبية لـ QoreChain وسلسلة Cosmos تجريبية أخرى. |

## احصل على الشيفرة {#get-the-code}

لكل طقم صفحة دليل خاصة به، مرتبطة أعلاه. والتطبيقات النموذجية لهذه الورشة في المستودع العام [qorechain/build-before-qday](https://github.com/qorechain/build-before-qday)، وتشرحها صفحة كل تطبيق من أول أمر إلى آخره:

```sh
git clone https://github.com/qorechain/build-before-qday
```
