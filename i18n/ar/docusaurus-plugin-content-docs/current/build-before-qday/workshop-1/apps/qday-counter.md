---
slug: /build-before-qday/workshop-1/apps/qday-counter
title: Q-Day Counter
sidebar_label: Q-Day Counter
sidebar_position: 1
---

# Q-Day Counter

Q-Day Counter هو أصغر مشروع EVM مفيد على QoreChain. وهو عقد Solidity يخزّن رقمًا واحدًا، ومشروع Hardhat ينشره على الشبكة الاختبارية `qorechain-diana`، وسكربت قصير يقرأ الرقم ويضيف إليه واحدًا.

كُتب هذا الدليل للمبتدئين. لا يلزم أن تعرف Solidity ولا أدوات البلوكتشين. كل أمر مشروح، وتنتهي كل خطوة بما ينبغي أن تراه.

**كم يستغرق ذلك:** نحو 25 دقيقة في المرة الأولى، معظمها لتثبيت الأدوات وانتظار الصنبور.

## ما الذي يوضّحه {#shows}

- **التوقيع الهجين جزء من مسار النشر.** قبل أي معاملة EVM، بما فيها نشر العقد، يحتاج الحساب إلى مفتاح ما بعد كمومي مسجّل (ML-DSA-87) ونافذة تفويض EVM سارية. وتُفتح النافذة بمعاملة واحدة موقّعة مرتين: بالمفتاح الكلاسيكي (secp256k1) وبالمفتاح ما بعد الكمومي. وهذا هو التوقيع الهجين. وتتحقق السلسلة من الاثنين.
- **معاملة واحدة موقّعة هجينًا يمكنك التحقق منها.** تُرسل الخطوة `pnpm window open` تلك المعاملة. يمكنك البحث عنها في المستكشف ورؤية حكم السلسلة نفسها.
- **أدوات EVM المعتادة تواصل العمل.** ترسل Hardhat وviem معاملات إيثريوم عادية. والحماية ما بعد الكمومية موجودة في النافذة، فلا يستطيع مفتاح secp256k1 مسروق وحده أن ينفق من الحساب.

قد يستطيع حاسوب كمومي كبير بما يكفي لكسر secp256k1 أن يزوّر التوقيعات الكلاسيكية. وتشترط QoreChain توقيعًا ثانيًا (ML-DSA-87، المعيار FIPS 204) لا يستطيع ذلك الحاسوب تزويره. ويُظهر Counter حلقة عمل المطوّر كاملة مع تفعيل هذه القاعدة: سجّل المفتاح، افتح نافذة، انشر، استدعِ، اقرأ.

## قبل أن تبدأ {#prerequisites}

يستخدم هذا الدليل حسابًا اختباريًا مؤقتًا. لا تستخدم أبدًا محفظة حقيقية أو أموالًا حقيقية. QOR الاختبارية بلا قيمة.

تحتاج إلى طرفية. على macOS افتح **Terminal**. على Windows افتح **PowerShell** (أو **Git Bash** الذي يأتي مع Git). على Linux افتح أي طرفية. ثم ثبّت هذه الأدوات الثلاث. وإن كان أمر التحقق يطبع إصدارًا مناسبًا أصلًا فتجاوز التثبيت.

### Node.js الإصدار 22 أو أحدث

يشغّل Node.js كود JavaScript على حاسوبك. ويحتاج Hardhat 3 إلى Node.js الإصدار 22 أو أحدث.

| النظام | التثبيت | التحقق |
| --- | --- | --- |
| macOS | `brew install node` (يحتاج إلى [Homebrew](https://brew.sh))، أو نزّل من https://nodejs.org | `node --version` |
| Windows | `winget install OpenJS.NodeJS.LTS`، أو نزّل من https://nodejs.org | `node --version` |
| Linux | `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh \| bash`، ثم افتح طرفية جديدة، ثم `nvm install 22` | `node --version` |

ما ينبغي أن تراه: رقمًا يبدأ بـ `v22` أو أعلى، مثل `v22.12.0`. على Windows أغلق PowerShell وأعد فتحه بعد التثبيت.

### pnpm

تنزّل pnpm المكتبات التي يحتاجها المشروع. ولا تأتي مع تثبيت Node.js، فتضيفها بنفسك، على كل الأنظمة.

```sh
npm install -g pnpm
```

| الجزء | المعنى |
| --- | --- |
| `npm` | الأداة التي تأتي مع Node.js. تثبّت أدوات أخرى. |
| `install` | نزّل وثبّت. |
| `-g` | عام (Global): ثبّت للحاسوب كله، لا لمجلد واحد فقط. |
| `pnpm` | الأداة المراد تثبيتها. |

تحقق منها بـ `pnpm --version`. ينبغي أن ترى رقمًا مثل `9.12.0` (الإصدار 9 أو أعلى). وإن رأيت يومًا `pnpm: command not found` فقد تخطّيت هذه الخطوة: شغّل أمر التثبيت أعلاه، ثم افتح طرفية جديدة.

إن قال Linux أو macOS `EACCES: permission denied` فشغّل `sudo npm install -g pnpm` بدلًا من ذلك.

### Git

ينزّل Git المشروع من GitHub.

| النظام | التثبيت | التحقق |
| --- | --- | --- |
| macOS | `xcode-select --install` أو `brew install git` | `git --version` |
| Windows | `winget install Git.Git`، أو نزّل من https://git-scm.com | `git --version` |
| Linux | `sudo apt install git` (Debian وUbuntu) أو `sudo dnf install git` (Fedora) | `git --version` |

ما ينبغي أن تراه: `git version 2.` ورقمًا بعدها.

## محفظة اختبارية {#wallet}

تحتاج إلى حساب اختباري فيه قليل من QOR. ينشئ لك هذا الدليل حسابًا في الخطوات التالية (ملف مفاتيح). لا تحتاج إلى QoreX لتطبيق Counter. وإن أردت رؤية الحساب نفسه في محفظة لاحقًا فاستخدم [QoreX](/qorex/overview) على الشبكة الاختبارية:

- **تطبيق QoreX:** Settings، ثم **Use testnet (developers)**.
- **امتداد متصفح QoreX:** افتحه، ثم المس رقم الإصدار في الأسفل 7 مرات، ثم اختر **Switch to testnet (diana)**.
- لمسار EVM اختر **Add an Ethereum account (coin 60)**.

يعطيك الصنبور QOR اختبارية مجانية: https://dashboard.qorechain.io/faucet. تسجّل الدخول، وتلصق عنوانًا، وتطلب. تحصل على 100 QOR كل 24 ساعة لكل حساب.

**عن الكميات.** QOR هي العملة. و`uqor` أصغر جزء منها: 1 QOR = 1,000,000 uqor. تظهر الرسوم على السلسلة بوحدة `uqor`. أول معاملة لحساب جديد تسجّل مفتاحه ما بعد الكمومي، وتكلّف رسمًا لمرة واحدة نحو 0.09 QOR.

## خطوة بخطوة {#steps}

### 1. احصل على الكود {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/01-qday-counter
```

**ما يفعله**

- `git clone <address>` ينزّل نسخة من المشروع من GitHub إلى مجلد جديد باسم `build-before-qday`.
- `cd <folder>` ينقل طرفيتك إلى مجلد مشروع Counter. وكل الأوامر التالية تُشغَّل من هنا.

**ما ينبغي أن تراه:** `Cloning into 'build-before-qday'...` ثم موجّه الأوامر في المجلد الجديد. **كم يستغرق:** بضع ثوانٍ.

اختياري: إن فضّلت بناء المشروع من الصفر، كما في الورشة المباشرة، فراجع [ابنِ المشروع نفسه من الصفر](#scaffold) في نهاية الخطوات.

### 2. ثبّت المكتبات {#step-install}

```sh
pnpm install
```

**ما يفعله**

- `pnpm install` يقرأ قائمة المكتبات في `package.json` وينزّلها إلى مجلد `node_modules` (Hardhat وQoreChain SDK وغيرهما).

**ما ينبغي أن تراه:** قائمة حزم بعلامات `+` ثم `Done in` وبضع ثوانٍ. **كم يستغرق:** أقل من دقيقة.

### 3. شغّل الاختبارات والبناء {#step-test}

```sh
pnpm test
```

**ما يفعله**

- `pnpm test` يشغّل فحوص المشروع على سلسلة وهمية داخل حاسوبك. ولا يحتاج إلى مفتاح ولا شبكة ولا QOR. التشغيل الأول ينزّل أيضًا مترجم Solidity، فيحتاج إلى الإنترنت.

**ما ينبغي أن تراه:** `Counter`، وسطرين بعلامة صح (`starts at the constructor value` و`increments and emits CountChanged`)، و`2 passing`.

```sh
pnpm build
```

**ما يفعله**

- `pnpm build` يحوّل عقد Solidity إلى كود آلة (يترجمه). وبعد `pnpm test` يطبع `No contracts to compile`، وهذا سليم: فالاختبار ترجمه أصلًا.

### 4. أنشئ ملف الإعدادات {#step-account}

يقرأ المشروع أسراره من ملف باسم `.env`. أنشئه من القالب.

macOS وLinux وGit Bash:

```sh
cp .env.example .env
```

Windows PowerShell:

```sh
copy .env.example .env
```

**ما يفعله**

- `cp` (أو `copy`) ينسخ ملف القالب `.env.example` إلى ملف جديد `.env`.

ملف `.env` هو **ملف مفاتيحك**. وهو موجود في مجلد هذا المشروع فقط. ويحمل مفتاحًا مؤقتًا. **لا تشاركه أبدًا، ولا تودِعه في Git، ولا تعيد استخدام هذه المفاتيح لمحفظة حقيقية.** المشروع يتجاهل `.env` في Git أصلًا. افتحه في أي محرر نصوص (`open -e .env` على macOS، و`notepad .env` على Windows، و`nano .env` على Linux). ستملأ قيمتين.

**أ. مفتاح خاص مؤقت.** ولّد مفتاحًا عشوائيًا:

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

**ما يفعله**

- `node -e "..."` يشغّل سطرًا واحدًا من JavaScript.
- يصنع السطر 32 بايتًا عشوائية ويطبعها بالنظام الست عشري مع `0x` في أولها. وهذا مفتاح خاص.

**ما ينبغي أن تراه:** سطرًا واحدًا، `0x` ثم 64 حرفًا ورقمًا. انسخه إلى `.env` على هيئة `PRIVATE_KEY=0x...` بدلًا من القيمة النائبة المكوّنة من أصفار.

**ب. رمز استرداد ما بعد كمومي.** يُصنع مفتاح ML-DSA-87 للحساب من سرّ ثانٍ هو رمز الاسترداد.

```sh
pnpm window recovery-code
```

**ما يفعله**

- `pnpm window` يشغّل سكربت المساعد `scripts/window.ts`. والكلمة التي بعده هي الأمر.
- `recovery-code` يطبع رمز استرداد عشوائيًا جديدًا.

**ما ينبغي أن تراه:** سطرًا واحدًا يبدأ بـ `QRC1-`، ثم تذكيرًا قصيرًا. انسخ سطر `QRC1-...` إلى `.env` على هيئة `QORE_PQC_RECOVERY_CODE=QRC1-...`. احتفظ بالرمز نفسه لهذا الحساب: فالرمز الجديد يعطي الحساب مفتاحًا ما بعد كمومي مختلفًا.

اترك `QORE_MNEMONIC` فارغًا. (العبارة الاسترجاعية هي عبارة من 12 أو 24 كلمة تستطيع أن تحلّ محل القيمتين أعلاه. استخدم إحداهما لا كلتيهما.) وأبقِ `QORE_NETWORK=testnet`، الذي يخبر المساعد بالتحدث إلى الشبكة التجريبية. يبدو ملف `.env` هكذا، بقيم نائبة:

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

احفظ الملف.

### 5. اعرض عنوان حسابك {#step-address}

```sh
pnpm window status
```

**ما يفعله**

- `status` يعرض حسابك، وهل مفتاحه ما بعد الكمومي مسجّل، وهل لديك نافذة EVM.

**ما ينبغي أن تراه:** ثلاثة أسطر. الأول `account:  0x...  (qor1...)`. لحسابك عنوانان: `0x...` لـ EVM و`qor1...` للمسار الأصلي (native). وهما ينتميان إلى الحساب نفسه. والسطران الآخران يقولان `PQC key:  not registered` و`window:   none`. وهذا طبيعي: فالحساب جديد. انسخ عنوان `qor1...` من السطر الأول.

### 6. احصل على QOR اختبارية من الصنبور {#step-faucet}

1. افتح https://dashboard.qorechain.io/faucet وسجّل الدخول.
2. تأكد أن الصفحة مضبوطة على **Testnet**.
3. الصق عنوان `qor1...` واطلب QOR. تحصل على 100 QOR مرة كل 24 ساعة لكل حساب.
4. انتظر نحو 10 ثوانٍ، ثم شغّل `pnpm window status` مرة أخرى.

**ما ينبغي أن تراه:** الأسطر الثلاثة نفسها كما قبل: المفتاح ما زال `not registered` ولا توجد نافذة. لكن الحساب يحمل QOR الآن. وإن أردت دليلًا فافتح https://explore.qore.network (Testnet) وابحث عن عنوان `qor1...` الخاص بك.

### 7. سجّل المفتاح وافتح النافذة {#step-window}

```sh
pnpm window register
```

**ما يفعله**

- `register` يرسل المفتاح العام ML-DSA-87 للحساب إلى السلسلة. تفعل هذا مرة واحدة لكل حساب. وهي الرسالة الوحيدة التي تقبلها السلسلة دون توقيع ما بعد كمومي، لأنه لا يوجد على السلسلة مفتاح بعد للتحقق منه. وتكلّف نحو 0.09 QOR.

**ما ينبغي أن تراه:** `registered: ` يتبعه هاش معاملة (64 حرفًا).

```sh
pnpm window open
```

**ما يفعله**

- `open` يرسل معاملة واحدة، موقّعة بالمفتاحين (هجين)، تفتح نافذة تفويض EVM. وما دامت النافذة سارية تُسمح معاملات EVM العادية. وتدوم افتراضيًا 600 كتلة وتسمح بـ 5 معاملات. يمكنك تغيير ذلك بـ `QORE_WINDOW_BLOCKS` و`QORE_WINDOW_TXS` في `.env`.

**ما ينبغي أن تراه:** `opened: ` يتبعه هاش معاملة، ثم `window: 600 blocks, 5 txs, ... uqor (value plus fees)`. **انسخ هذا الهاش.** ستتحقق منه في الخطوة 10.

انتظر الآن نحو 10 ثوانٍ. فتح النافذة يغيّر عدّاد معاملات الحساب، ويجب أن يرى الأمر التالي القيمة الجديدة.

```sh
sleep 10
pnpm window status
```

**ما يفعله**

- `sleep 10` ينتظر 10 ثوانٍ (ويعمل في PowerShell وGit Bash أيضًا).
- `status` يعرض النتيجة.

**ما ينبغي أن تراه:** `PQC key:  registered` و`window:   live; ... blocks, ... txs, ... uqor left`.

### 8. انشر العقد {#step-deploy}

```sh
pnpm deploy:testnet
```

**ما يفعله**

- يشغّل Hardhat Ignition، الأداة التي تنشر العقود، بالوحدة `Counter` على الشبكة `qorechainTestnet` (معرّف السلسلة 9800، شبكة QoreChain الاختبارية).
- ويطلب منك التأكيد. اكتب `y` واضغط Enter.

**ما ينبغي أن تراه:** سؤال تأكيد عن النشر على `qorechainTestnet` (9800)، ثم بعد `y` سطرًا ينتهي بـ `CounterModule#Counter` وعنوان عقدك `0x...`. وهذا هو عنوان عقدك. **كم يستغرق:** نحو 30 ثانية.

### 9. اقرأ وزِد {#step-interact}

```sh
pnpm interact
```

**ما يفعله**

- يقرأ الرقم المخزّن، ثم يستدعي `increment()` (يضيف واحدًا)، ثم يقرأه مرة أخرى. ويستهلك الاستدعاء واحدة من معاملات نافذتك الخمس.

**ما ينبغي أن تراه:** `Counter 0x... on qorechain-diana EVM (9800)` و`count: 0` و`increment tx: 0x...` و`status: success in block ...` و`count: 1` ورابطًا إلى المستكشف.

```sh
pnpm interact --read
```

**ما يفعله**

- `--read` تعني للقراءة فقط: يعرض الرقم ولا يرسل شيئًا.

**ما ينبغي أن تراه:** عنوان Counter و`count: 1`.

### 10. تحقق من المعاملة الهجينة {#step-explorer}

معاملة `pnpm window open` هي دليلك على أن السلسلة تحققت من توقيع ما بعد كمومي. تحقق منها بطريقتين.

**أ. بطلب الويب البسيط.** استبدل `<HASH>` بالهاش من الخطوة 7. احذف `<` و`>`.

```sh
curl https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

**ما يفعله**

- `curl <address>` يطلب من خادم QoreChain عام سجل تلك المعاملة ويطبعه. على Windows PowerShell اكتب `curl.exe` بدلًا من `curl`.
- `api-testnet.qore.host` هو الخادم العام للشبكة الاختبارية. و`<HASH>` هو المعاملة التي تريدها.

**ما ينبغي أن تراه في الإجابة الطويلة:**

- `"code": 0`، ويعني أن المعاملة نجحت.
- امتدادًا من النوع `PQCHybridSignature` يحمل توقيع ML-DSA-87 بطول 4,627 بايت.
- حدثًا `pqc_hybrid_verify` وخاصيته `status` تساوي `verified`.

**ب. بالمستكشف.**

1. افتح https://explore.qore.network وبدّل محدّد الشبكة إلى **Testnet**.
2. ابحث عن الهاش من `pnpm window open`. تعرض الصفحة توقيعًا ما بعد كمومي تحققت منه السلسلة.
3. ابحث عن هاش `increment tx` من الخطوة 9، أو عن عنوان Counter، لترى استدعاء العقد.

يعرض [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) النوع نفسه من الدليل بايتًا بايتًا.

## ابنِ المشروع نفسه من الصفر {#scaffold}

تبدأ الورشة المباشرة من مجلد فارغ. وينشئ هذا الأمر مشروع Hardhat نفسه (دون سكربت `interact` الموجود في النسخة المنزّلة فقط). شغّله في مجلد تحتفظ فيه بمشاريعك، بدلًا من الخطوة 1.

```sh
npx create-qorechain-dapp@latest qday-demo -t hardhat --network testnet --package-manager pnpm
cd qday-demo
```

| الجزء | المعنى |
| --- | --- |
| `npx` | يشغّل أداة مباشرة من الإنترنت دون تثبيتها. |
| `create-qorechain-dapp@latest` | أداة QoreChain لإنشاء المشاريع، أحدث إصدار. |
| `qday-demo` | اسم المجلد الجديد. |
| `-t hardhat` | أي قالب مشروع يُستخدم: مشروع Hardhat 3 مع عقد واختبارات ومساعد النافذة. |
| `--network testnet` | أي شبكة QoreChain يتصل بها المشروع: الشبكة التجريبية، لا الحقيقية. |
| `--package-manager pnpm` | أي أداة تثبّت المكتبات. |

**ما ينبغي أن تراه:** قائمة حزم مثبّتة، ثم `Done! Created qday-demo`. المكتبات مثبّتة أصلًا وملف `.env` موجود أصلًا، فيمكنك تخطي الخطوة 2 ونسخ الملف في الخطوة 4. تابع بـ `pnpm test` (الخطوة 3)، ثم 4 أ و4 ب (املأ `.env`)، ثم الخطوات 5 إلى 8. **كم يستغرق:** نحو 30 ثانية.

## ما ينبغي أن تراه في النهاية {#result}

- يطبع `pnpm test` العبارة `2 passing`.
- يطبع `pnpm window status` العبارتين `PQC key:  registered` و`window:   live` مع الكتل والمعاملات والقيمة المتبقية.
- يطبع `pnpm deploy:testnet` عنوان `Counter` المنشور (`0x...`).
- يطبع `pnpm interact` الرقم `count` وهو ينتقل من 0 إلى 1، و`status: success`، ورابطًا إلى المستكشف.
- يُظهر فحص `curl` القيمة `"code": 0` وامتداد `PQCHybridSignature` والحدث `pqc_hybrid_verify` مع `status` يساوي `verified`. ويعلّم المستكشف (Testnet) المعاملة نفسها بأنها متحقَّق منها.

## استكشاف الأخطاء {#troubleshooting}

| ما تراه | السبب | ما العمل |
| --- | --- | --- |
| `pnpm: command not found` | pnpm غير مثبّتة. لا يشملها Node.js. | شغّل `npm install -g pnpm`، ثم افتح طرفية جديدة. |
| `ERROR: You are using Node.js ... which is not supported by Hardhat` | إصدار Node.js قديم جدًا. | ثبّت Node.js الإصدار 22 أو أحدث وتحقق بـ `node --version`. |
| `node: .env: not found` | لا يوجد ملف `.env` في هذا المجلد. | نفّذ الخطوة 4، وشغّل الأمر من مجلد المشروع. |
| `Set QORE_MNEMONIC, or PRIVATE_KEY as 0x followed by 64 hex characters, in .env` | ملف `.env` مفقود، أو `PRIVATE_KEY` ما زال القيمة النائبة أو فيه خطأ إملائي. | أعد الخطوة 4. احفظ الملف. شغّل الأمر من مجلد المشروع. |
| `Set QORE_PQC_RECOVERY_CODE in .env` أو `not a valid QRC1 recovery code` | رمز الاسترداد فارغ أو فيه خطأ إملائي. | شغّل `pnpm window recovery-code` والصق سطر `QRC1-...` كاملًا. |
| `... does not exist on chain yet: send it some QOR first` (عند `register` أو `open`) | لا يملك الحساب QOR بعد. | اطلب QOR من الصنبور (الخطوة 6) وانتظر 10 ثوانٍ. |
| يقول الصنبور إنك بلغت الحد | طلب واحد كل 24 ساعة لكل حساب. | انتظر ثم حاول مرة أخرى. أو استخدم حسابًا مؤقتًا ثانيًا. |
| `account has no PQC key and classical fallback is disabled` | أرسلت معاملة قبل تسجيل المفتاح. | شغّل `pnpm window register`، ثم `pnpm window open`. |
| `EVM authorisation window exhausted` (أو التلميح `open an EVM window first`) | نفدت كتل النافذة أو معاملاتها، أو لم تُفتح قط. | شغّل `pnpm window open`، وانتظر 10 ثوانٍ، وحاول مرة أخرى. |
| `HHE10402` بعد فتح النافذة | جرى النشر قبل أن يتحدّث عدّاد معاملات الحساب. | انتظر 10 ثوانٍ وأعد تشغيل `pnpm deploy:testnet`. |
| `Deploy first (pnpm deploy:testnet) or set COUNTER_ADDRESS` | لا يجد `pnpm interact` العقد. | أكمل الخطوة 8 في هذا المجلد. |
| `PQC key: registered, but NOT this key` | رمز الاسترداد في `.env` يختلف عن الذي استُخدم عند التسجيل. | أعد رمز الاسترداد الأصلي. فالرمز المختلف يصنع مفتاحًا مختلفًا. |
| أخطاء CORS في تطبيق متصفح | خادم REST العام لا يرسل ترويسات CORS، فيحجبه المتصفح. | استخدم وكيل `/lcd` الخاص بالقالب، كما تفعل [صفحة ويب Guestbook](/build-before-qday/workshop-1/apps/qday-guestbook). |

## الكود {#code}

العقد (`contracts/Counter.sol`):

```solidity
contract Counter {
    uint256 public count;
    event CountChanged(uint256 newCount);

    constructor(uint256 initial) {
        count = initial;
        emit CountChanged(initial);
    }

    function increment() external {
        count += 1;
        emit CountChanged(count);
    }

    function set(uint256 value) external {
        count = value;
        emit CountChanged(value);
    }
}
```

الجزء الموقّع هجينًا في `scripts/window.ts` (رسالة النافذة والموقّع):

```ts
import { EthNativeSigner, openEvmWindowMsg } from "@qorechain/sdk";
import { evmWindowCost } from "@qorechain/evm";

// 3,000,000 gas at a 250 gwei fee cap, for a few deploys
const perTx = evmWindowCost({ gas: 3_000_000n, maxFeePerGas: 250_000_000_000n });
const maxValue = BigInt(process.env.QORE_WINDOW_MAX_UQOR ?? (perTx * maxTxs).toString());
const msg = openEvmWindowMsg({ sender: acc.cosmos, blocks, maxTxs, maxValue });

// broadcast(acc, "hybrid", [msg]) does this:
const signer = new EthNativeSigner(acc, { signMode: "hybrid", rest: net.rest });
const res = await signer.signAndBroadcast(transport, {
  chainId: net.chainId, accountNumber, sequence, fee: FEE, messages: [msg],
});
```

`acc` هو الحساب المصنوع من مواد مفاتيحك، و`net` هو سجل الشبكة الخاص بـ `QORE_NETWORK` (الافتراضي `testnet`، معرّف السلسلة `qorechain-diana`). الرسم الذي يستخدمه السكربت هو 100000 `uqor` (0.1 QOR) مع حد غاز 800000، لأن المعاملات الهجينة كبيرة.

## الحزم المستخدمة {#packages}

| الحزمة | الإصدار | تُستخدم لـ |
| --- | --- | --- |
| `@qorechain/sdk` | ^0.13.0 | التوقيع الهجين، وتسجيل مفتاح PQC، و`openEvmWindowMsg` |
| `@qorechain/evm` | ^0.13.0 | مساعدات نافذة EVM (`evmWindowStatus` و`evmWindowCost`) |
| `@cosmjs/stargate` | ^0.39.0 | بثّ معاملة المسار الأصلي |
| `hardhat` | ^3.21.1 | الترجمة والاختبار والنشر بـ Ignition |
| `viem` | ^2.47.6 | قراءة العقد والكتابة إليه |
| `tsx` | ^4.19.0 | تشغيل سكربتات TypeScript |
| `typescript` | ^5.6.3 | فحص الأنواع |

راجع [المولّدات وCLI](/developer-tools/scaffolders-and-cli) و[تثبيت SDK](/sdk/install).

## تفاصيل الشبكة {#networks}

| البند | القيمة |
| --- | --- |
| الشبكة | الشبكة الاختبارية `qorechain-diana` |
| معرّف سلسلة EVM | 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| EVM RPC | `https://evm-testnet.qore.host` |

المصدر: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/01-qday-counter
