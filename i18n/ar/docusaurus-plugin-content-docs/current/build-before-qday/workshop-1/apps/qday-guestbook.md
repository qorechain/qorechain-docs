---
slug: /build-before-qday/workshop-1/apps/qday-guestbook
title: Q-Day Guestbook
sidebar_label: Q-Day Guestbook
sidebar_position: 2
---

# Q-Day Guestbook

Q-Day Guestbook هو دفتر زوّار على السلسلة في شبكة QoreChain الاختبارية لـ EVM. يستطيع أي شخص التوقيع فيه مرة واحدة لكل عنوان برسالة لا تزيد على 140 حرفًا. ويتكوّن من جزأين:

- **`contracts-app/`**: عقد Solidity ومشروع Hardhat. تنشره ويمكنك التوقيع من الطرفية.
- **`web/`**: صفحة ويب تُفتح في متصفحك، وتربط محفظة QoreX، وتعرض نافذة EVM للحساب، وتسرد أحدث التواقيع مباشرة.

كُتب هذا الدليل للمبتدئين. كل أمر مشروح وتنتهي كل خطوة بما ينبغي أن تراه.

**كم يستغرق ذلك:** نحو 35 دقيقة في المرة الأولى: 20 لجزء العقد و15 لصفحة الويب.

## ما الذي يوضّحه {#shows}

- **dApp في المتصفح يوقّع هجينًا دون أن يعرف.** الصفحة تطبيق wagmi وRainbowKit عادي. وتضيف QoreX النصف ما بعد الكمومي (ML-DSA-87) من التوقيع، فتحمي المعاملةَ نفسَها المفتاحُ الكلاسيكي (secp256k1) ومفتاحٌ ما بعد كمومي.
- **نافذة EVM ظاهرة في الواجهة.** تقرأ الصفحة نافذة الحساب من السلسلة وتعرض هل هي سارية وكم كتلة ومعاملة بقيت.
- **رفض مقروء.** عندما ترفض السلسلة عملية كتابة، تربط الصفحة الخطأ بواحد من أربعة أسباب (لا مفتاح مسجّل، لا نافذة، النافذة استُنفدت، معاملات غير صالحة) وتعرض الحل.
- **توقيعات هجينة متحقَّق منها على السلسلة.** كل توقيع تكتبه هو معاملة واحدة لم تقبلها السلسلة إلا بعد التحقق من التوقيعين.

## قبل أن تبدأ {#prerequisites}

يستخدم هذا الدليل حسابًا اختباريًا مؤقتًا لجزء الطرفية. لا تستخدم أبدًا محفظة حقيقية أو أموالًا حقيقية. QOR الاختبارية بلا قيمة.

تحتاج إلى طرفية. على macOS افتح **Terminal**. على Windows افتح **PowerShell** (أو **Git Bash** الذي يأتي مع Git). على Linux افتح أي طرفية. ثبّت هذه الأدوات الثلاث. وإن كان أمر التحقق يطبع إصدارًا مناسبًا أصلًا فتجاوز التثبيت.

### Node.js الإصدار 22 أو أحدث

يشغّل Node.js كود JavaScript على حاسوبك. ويحتاج Hardhat 3 إلى Node.js الإصدار 22 أو أحدث.

| النظام | التثبيت | التحقق |
| --- | --- | --- |
| macOS | `brew install node` (يحتاج إلى [Homebrew](https://brew.sh))، أو نزّل من https://nodejs.org | `node --version` |
| Windows | `winget install OpenJS.NodeJS.LTS`، أو نزّل من https://nodejs.org | `node --version` |
| Linux | `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh \| bash`، ثم افتح طرفية جديدة، ثم `nvm install 22` | `node --version` |

ما ينبغي أن تراه: رقمًا يبدأ بـ `v22` أو أعلى. على Windows أغلق PowerShell وأعد فتحه بعد التثبيت.

### pnpm

تنزّل pnpm المكتبات التي يحتاجها المشروع. ولا يشملها Node.js، فثبّتها بنفسك، على كل الأنظمة.

```sh
npm install -g pnpm
```

| الجزء | المعنى |
| --- | --- |
| `npm` | الأداة التي تأتي مع Node.js. تثبّت أدوات أخرى. |
| `install` | نزّل وثبّت. |
| `-g` | عام (Global): ثبّت للحاسوب كله، لا لمجلد واحد فقط. |
| `pnpm` | الأداة المراد تثبيتها. |

تحقق منها بـ `pnpm --version`. ينبغي أن ترى رقمًا مثل `9.12.0` (الإصدار 9 أو أعلى). وإن رأيت يومًا `pnpm: command not found` فشغّل أمر التثبيت أعلاه وافتح طرفية جديدة. وإن قال macOS أو Linux `EACCES: permission denied` فاستخدم `sudo npm install -g pnpm`.

### Git

| النظام | التثبيت | التحقق |
| --- | --- | --- |
| macOS | `xcode-select --install` أو `brew install git` | `git --version` |
| Windows | `winget install Git.Git`، أو نزّل من https://git-scm.com | `git --version` |
| Linux | `sudo apt install git` (Debian وUbuntu) أو `sudo dnf install git` (Fedora) | `git --version` |

ما ينبغي أن تراه: `git version 2.` ورقمًا بعدها.

## المحافظ الاختبارية {#wallet}

يستخدم هذا الدليل حسابين، وهما مختلفان عمدًا:

1. **حساب ملف مفاتيح** لجزء الطرفية (الخطوات 3 إلى 6). ينشئه لك الدليل. وهو الذي ينشر العقد.
2. **حساب QoreX** لصفحة الويب (الخطوتان 8 و9). وتوقّع الصفحة به.

**QoreX على الشبكة الاختبارية.** [QoreX](/qorex/overview) هي محفظة QoreChain. تستخدم امتداد المتصفح لصفحة الويب (راجع [تكاملات QoreX](/developer-tools/qorex-integrations)). ثبّته في المتصفح الذي ستستخدمه، ثم:

- **امتداد متصفح QoreX:** افتحه، ثم المس رقم الإصدار في الأسفل 7 مرات، ثم اختر **Switch to testnet (diana)**.
- **تطبيق QoreX على هاتفك:** Settings، ثم **Use testnet (developers)**.
- لمسار EVM اختر **Add an Ethereum account (coin 60)**. تحتاج صفحة الويب إلى حساب coin 60.

**الصنبور** يعطيك QOR اختبارية مجانية: https://dashboard.qorechain.io/faucet. سجّل الدخول، والصق عنوانًا، واطلب. تحصل على 100 QOR كل 24 ساعة لكل حساب.

**عن الكميات.** QOR هي العملة. و`uqor` أصغر جزء منها: 1 QOR = 1,000,000 uqor. أول معاملة لحساب جديد تسجّل مفتاحه ما بعد الكمومي، برسم لمرة واحدة نحو 0.09 QOR.

## الجزء 1: العقد {#contract}

### 1. احصل على الكود {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/02-qday-guestbook
```

**ما يفعله**

- `git clone <address>` ينزّل المشروع من GitHub إلى مجلد جديد `build-before-qday`.
- `cd <folder>` ينقل طرفيتك إلى مشروع Guestbook. وفيه مجلدان، `contracts-app` و`web`، تُعدّهما كلًّا على حدة.

**ما ينبغي أن تراه:** `Cloning into 'build-before-qday'...`. **كم يستغرق:** بضع ثوانٍ.

### 2. ثبّت المكتبات واختبر {#step-contract-install}

```sh
cd contracts-app
pnpm install
pnpm test
```

**ما يفعله**

- `cd contracts-app` يدخل مجلد العقد.
- `pnpm install` ينزّل المكتبات المذكورة في `package.json` (Hardhat وQoreChain SDK).
- `pnpm test` يشغّل فحوص العقد على سلسلة وهمية داخل حاسوبك. ولا يحتاج إلى مفتاح ولا إلى حساب على الشبكة. التشغيل الأول ينزّل مترجم Solidity.

**ما ينبغي أن تراه:** قائمة حزم، ثم `Done in` وبضع ثوانٍ، ثم `QDayGuestbook` مع ثلاث علامات صح و`3 passing`. **كم يستغرق:** نحو دقيقة.

### 3. أنشئ ملف المفاتيح {#step-account}

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

- `cp` (أو `copy`) ينسخ القالب `.env.example` إلى ملف جديد `.env`.

ملف `.env` هو **ملف مفاتيحك**. وهو موجود في مجلد `contracts-app` فقط. **لا تشاركه أبدًا، ولا تودِعه في Git، ولا تعيد استخدام هذه المفاتيح لمحفظة حقيقية.** المشروع يتجاهل `.env` في Git أصلًا. افتحه في أي محرر نصوص (`open -e .env` على macOS، و`notepad .env` على Windows، و`nano .env` على Linux) واملأ قيمتين.

**أ. مفتاح خاص مؤقت.**

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

**ما يفعله**

- `node -e "..."` يشغّل سطرًا واحدًا من JavaScript. يصنع السطر 32 بايتًا عشوائية ويطبعها بالنظام الست عشري مع `0x` في أولها. وهذا مفتاح خاص.

**ما ينبغي أن تراه:** سطرًا واحدًا، `0x` ثم 64 حرفًا ورقمًا. انسخه إلى `.env` على هيئة `PRIVATE_KEY=0x...` بدلًا من القيمة النائبة المكوّنة من أصفار.

**ب. رمز استرداد ما بعد كمومي.**

```sh
pnpm window recovery-code
```

**ما يفعله**

- `pnpm window` يشغّل سكربت المساعد `scripts/window.ts`. والكلمة التي بعده هي الأمر.
- `recovery-code` يطبع رمزًا عشوائيًا جديدًا يُصنع منه مفتاح ML-DSA-87 للحساب.

**ما ينبغي أن تراه:** سطرًا يبدأ بـ `QRC1-`. انسخه إلى `.env` على هيئة `QORE_PQC_RECOVERY_CODE=QRC1-...`. احتفظ بالرمز نفسه لهذا الحساب: فالرمز الجديد يعطي مفتاحًا ما بعد كمومي مختلفًا.

اترك `QORE_MNEMONIC` فارغًا (العبارة الاسترجاعية هي عبارة من 12 أو 24 كلمة تستطيع أن تحلّ محل القيمتين أعلاه؛ استخدم إحداهما لا كلتيهما) وأبقِ `QORE_NETWORK=testnet`، الذي يخبر المساعد باستخدام الشبكة التجريبية. يبدو ملف `.env` هكذا (القيم نائبة):

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

احفظ الملف.

### 4. موّل الحساب {#step-faucet}

```sh
pnpm window status
```

**ما يفعله**

- يعرض حسابك، وهل مفتاحه ما بعد الكمومي مسجّل، وهل لديه نافذة EVM.

**ما ينبغي أن تراه:** `account:  0x...  (qor1...)`، ثم `PQC key:  not registered` و`window:   none`. انسخ عنوان `qor1...`. ثم:

1. افتح https://dashboard.qorechain.io/faucet وسجّل الدخول.
2. تأكد أن الصفحة مضبوطة على **Testnet**.
3. الصق عنوان `qor1...` واطلب QOR (100 QOR مرة كل 24 ساعة لكل حساب).
4. انتظر نحو 10 ثوانٍ. البحث عن عنوانك في https://explore.qore.network (Testnet) يعرض الرصيد.

### 5. سجّل المفتاح، وافتح النافذة، وانشر {#step-window}

```sh
pnpm window register
```

**ما يفعله**

- يرسل مفتاحك العام ML-DSA-87 إلى السلسلة، مرة واحدة لكل حساب. وهي الرسالة الوحيدة التي تقبلها السلسلة دون توقيع ما بعد كمومي، لأنه لا يوجد على السلسلة مفتاح بعد للتحقق منه. وتكلّف نحو 0.09 QOR.

**ما ينبغي أن تراه:** `registered: ` وهاش معاملة.

```sh
pnpm window open
```

**ما يفعله**

- يرسل معاملة واحدة، موقّعة بالمفتاحين (هجين)، تفتح نافذة تفويض EVM. وما دامت سارية تُسمح معاملات EVM العادية. وتدوم افتراضيًا 600 كتلة وتسمح بـ 5 معاملات.

**ما ينبغي أن تراه:** `opened: ` وهاش معاملة، ثم `window: 600 blocks, 5 txs, ...`. **انسخ هذا الهاش** للخطوة الأخيرة.

```sh
sleep 10
```

**ما يفعله**

- ينتظر 10 ثوانٍ (ويعمل في PowerShell وGit Bash أيضًا). فتح النافذة يغيّر عدّاد معاملات الحساب، ويجب أن يرى الأمر التالي القيمة الجديدة.

```sh
pnpm deploy:testnet
```

**ما يفعله**

- يشغّل Hardhat Ignition، الأداة التي تنشر العقود، بالوحدة `QDayGuestbook` على الشبكة `qorechainTestnet` (معرّف السلسلة 9800، شبكة QoreChain الاختبارية).
- ويطلب منك التأكيد. اكتب `y` واضغط Enter.

**ما ينبغي أن تراه:** سطرًا ينتهي بـ `QDayGuestbookModule#QDayGuestbook` وعنوان عقدك `0x...`. **انسخ هذا العنوان**: تحتاج إليه صفحة الويب. **كم يستغرق:** نحو 30 ثانية.

### 6. وقّع من الطرفية {#step-cli}

```sh
pnpm sign "Hello from my terminal"
pnpm sign --read
```

**ما يفعله**

- `pnpm sign "<message>"` يكتب إدخالًا واحدًا في دفتر الزوّار. والنص بين علامتي الاقتباس هو رسالتك، وحدّها الأقصى 140 حرفًا.
- `pnpm sign --read` للقراءة فقط: يسرد أحدث الإدخالات ولا يرسل شيئًا.

**ما ينبغي أن تراه:** بعد الأمر الأول `tx: 0x...` و`status: success in block ...`. وبعد الثاني `guestbook 0x...: 1 signatures` ورسالتك مع الوقت وعنوانك.

يستطيع كل عنوان التوقيع مرة واحدة. وأي `pnpm sign` ثانٍ من الحساب نفسه يرفضه العقد برسالة `AlreadySigned`.

## الجزء 2: صفحة الويب {#web}

### 7. ثبّت الصفحة وأعدّها {#step-web}

افتح نافذة طرفية ثانية في مجلد المشروع نفسه، أو ارجع بـ `cd ..`. ثم:

```sh
cd web
pnpm install
```

**ما يفعله**

- يدخل مجلد الويب وينزّل مكتباته (React وwagmi وRainbowKit وVite).

**ما ينبغي أن تراه:** قائمة حزم و`Done in` وبضع ثوانٍ.

أنشئ ملف إعدادات الصفحة. macOS وLinux وGit Bash: `cp .env.example .env`. Windows PowerShell: `copy .env.example .env`. افتح `web/.env` في محرر واضبط عنوان العقد الذي نسخته في الخطوة 5:

```sh
VITE_GUESTBOOK_ADDRESS=0x...
```

اترك `VITE_WALLETCONNECT_PROJECT_ID` فارغًا. فهو لازم فقط إن أضفت محفظة WalletConnect إلى `src/wagmi.ts`.

### 8. شغّل الصفحة واربط QoreX {#step-run}

```sh
pnpm dev
```

**ما يفعله**

- يشغّل خادم ويب صغيرًا على حاسوبك أنت (Vite). تعيش الصفحة على `http://localhost:5174`. ويمرّر الخادم أيضًا الطلبات التي تبدأ بـ `/lcd` إلى خادم REST العام للشبكة الاختبارية. لا يستطيع المتصفح استدعاء ذلك الخادم مباشرة (فهو لا يرسل ترويسات CORS)، فيقوم هذا الوكيل بذلك نيابةً عن الصفحة.
- يبقى الأمر قيد التشغيل. اترك هذه الطرفية مفتوحة. اضغط `Ctrl+C` لإيقافه لاحقًا. وإن غيّرت `web/.env` فأوقفه وشغّله من جديد.

**ما ينبغي أن تراه:** `VITE ... ready` و`Local: http://localhost:5174/`.

الآن في المتصفح الذي ثُبّتت فيه QoreX:

1. افتح http://localhost:5174 .
2. تأكد أن QoreX مفتوحة ومبدّلة إلى الشبكة الاختبارية (راجع "المحافظ الاختبارية" أعلاه)، مع حساب coin 60 فيه QOR من الصنبور. استخدم صيغة `qor1...` لعنوانه في صفحة الصنبور إن عرضت QoreX الصيغتين.
3. في الصفحة، في البطاقة 1، اختر **Connect QoreX** (زر الاتصال). وإن لم تكن QoreX أولًا في القائمة فاخترها من قائمة المحافظ.
4. تفتح QoreX نافذة تطلب الاتصال. وافق عليها.

**ما ينبغي أن تراه:** تعرض البطاقة 1 حسابك `0x...` والسلسلة `qorechain-diana EVM (9800)` ورصيدك ونافذة EVM: `no window open` لحساب جديد. وتعرض البطاقة 3 `On chain now: 1 signatures` والإدخال الذي كتبته في الخطوة 6. وإن قال سطر السلسلة `wrong chain` فبدّل QoreX إلى الشبكة الاختبارية.

### 9. وقّع من QoreX {#step-sign}

1. في البطاقة 2، اكتب رسالة (حتى 140 حرفًا). تعرض الصفحة كم استخدمت.
2. اختر **Sign**.
3. تفتح QoreX نافذة الموافقة. وإن لم يكن لحسابك مفتاح ما بعد كمومي أو نافذة بعد، تعرض QoreX تسجيل المفتاح (برسم لمرة واحدة نحو 0.09 QOR) وفتح نافذة EVM في الموافقة نفسها. اختر ذلك.
4. وافق في QoreX. يقرأ الزر `Approve in QoreX...` أثناء الانتظار.

**ما ينبغي أن تراه:** سطر `tx 0x...` مع رابط إلى المستكشف، أولًا `waiting for the block...` ثم `success in block ...`. وتعرض البطاقة 1 الآن نافذة EVM بأنها `live` مع الكتل والمعاملات المتبقية. وتضيف البطاقة 3 رسالتك في الأعلى، الأحدث أولًا. وتسرد حتى 20 إدخالًا وتتحدّث كل بضع ثوانٍ. وإن حاولت مرة أخرى من العنوان نفسه تقول البطاقة 2 `This address has already signed.`

### 10. تحقق على السلسلة {#step-explorer}

استخدم الهاش من `pnpm window open` (الخطوة 5). أما للصفحة، فتفتح QoreX النافذة أيضًا في معاملتها الخاصة: اطلب من QoreX سجلها أو ابحث عن عنوانك في المستكشف.

**أ. بطلب الويب البسيط.** استبدل `<HASH>` بالهاش (احذف `<` و`>`).

```sh
curl https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

**ما يفعله**

- `curl <address>` يطلب من خادم QoreChain عام سجل تلك المعاملة ويطبعه. على Windows PowerShell اكتب `curl.exe` بدلًا من `curl`.

**ما ينبغي أن تراه في الإجابة الطويلة:**

- `"code": 0`، ويعني أن المعاملة نجحت.
- امتدادًا من النوع `PQCHybridSignature` مع توقيع ML-DSA-87 بطول 4,627 بايت.
- حدثًا `pqc_hybrid_verify` وخاصيته `status` تساوي `verified`.

**ب. بالمستكشف.** افتح https://explore.qore.network، وبدّل محدّد الشبكة إلى **Testnet**، وابحث عن هاش المعاملة (من الخطوة 5 أو 6 أو 9)، أو عن عنوان حسابك، أو عن عنوان `QDayGuestbook`. تعرض معاملة النافذة توقيعًا ما بعد كمومي تحققت منه السلسلة.

## ما ينبغي أن تراه في النهاية {#result}

- يطبع `pnpm test` في `contracts-app` العبارة `3 passing`.
- يطبع `pnpm window status` العبارتين `PQC key:  registered` و`window:   live` مع الكتل والمعاملات والقيمة المتبقية.
- يطبع `pnpm deploy:testnet` عنوان `QDayGuestbook` (`0x...`).
- يطبع `pnpm sign "..."` هاش المعاملة و`status: success in block ...`.
- تعرض الصفحة حسابك و`qorechain-diana EVM (9800)` ورصيدك والنافذة بأنها `live`. وبعد **Sign** وموافقتك ترى رابط معاملة و`success in block ...`.
- تعرض القائمة في الأسفل عدد التواقيع وأحدث الإدخالات، الأحدث أولًا.
- يُظهر فحص `curl` القيمة `"code": 0` وامتداد `PQCHybridSignature` والحدث `pqc_hybrid_verify` مع `status` يساوي `verified`.

## استكشاف الأخطاء {#troubleshooting}

| ما تراه | السبب | ما العمل |
| --- | --- | --- |
| `pnpm: command not found` | pnpm غير مثبّتة. لا يشملها Node.js. | شغّل `npm install -g pnpm`، ثم افتح طرفية جديدة. |
| `ERROR: You are using Node.js ... which is not supported by Hardhat` | إصدار Node.js قديم جدًا. | ثبّت Node.js الإصدار 22 أو أحدث. |
| `node: .env: not found` | لا يوجد ملف `.env` في هذا المجلد. | نفّذ الخطوة 3 في `contracts-app`، وشغّل الأوامر من ذلك المجلد. |
| `Set QORE_MNEMONIC, or PRIVATE_KEY ...` أو `Set QORE_PQC_RECOVERY_CODE ...` | قيمة في `.env` فارغة، أو نائبة، أو فيها خطأ إملائي. | املأ القيمتين كما في الخطوة 3 واحفظ. |
| `... does not exist on chain yet: send it some QOR first` | لا يملك الحساب QOR بعد. | استخدم الصنبور (الخطوة 4)، وانتظر 10 ثوانٍ. |
| يقول الصنبور إنك بلغت الحد | طلب واحد كل 24 ساعة لكل حساب. | انتظر ثم حاول مرة أخرى. |
| `account has no PQC key and classical fallback is disabled` | أُرسلت معاملة قبل تسجيل المفتاح. | شغّل `pnpm window register`، ثم `pnpm window open`. وفي QoreX وافق على التسجيل المعروض مع أول إرسال لك. |
| `EVM authorisation window exhausted` أو `open an EVM window first` | نفدت كتل النافذة أو معاملاتها، أو لم تُفتح قط. | شغّل `pnpm window open` (في الطرفية) وانتظر 10 ثوانٍ. وفي الصفحة وافق على النافذة الجديدة عندما تعرضها QoreX. |
| `HHE10402` بعد فتح النافذة | جرى النشر قبل أن يتحدّث عدّاد معاملات الحساب. | انتظر 10 ثوانٍ وأعد تشغيل `pnpm deploy:testnet`. |
| `refused: ... (AlreadySigned)` | هذا العنوان وقّع من قبل. | يوقّع كل عنوان مرة واحدة. استخدم حسابًا آخر. |
| `refused: ... (BadLength)` | الرسالة فارغة أو أطول من 140 حرفًا. | استخدم من 1 إلى 140 حرفًا. |
| `Deploy first (pnpm deploy:testnet) or set GUESTBOOK_ADDRESS` | لا يجد `pnpm sign` العقد. | أكمل الخطوة 5 في `contracts-app`. |
| لا تعرض الصفحة إدخالات وزر **Sign** رمادي | `VITE_GUESTBOOK_ADDRESS` فارغ في `web/.env`. | الصق العنوان من الخطوة 5، ثم أوقف (`Ctrl+C`) وأعد تشغيل `pnpm dev`. |
| تقول الصفحة `wrong chain` | QoreX ليست على الشبكة الاختبارية. | بدّل QoreX إلى الشبكة الاختبارية (diana)، راجع "المحافظ الاختبارية". |
| لا تُعرض QoreX عند اختيار الاتصال | فُتحت الصفحة في متصفح بلا امتداد QoreX، أو الامتداد مقفل. | افتح http://localhost:5174 في المتصفح الذي فيه QoreX وافتح قفلها. |
| المنفذ 5174 مستخدم أصلًا | برنامج آخر يستخدمه. | أغلقه، أو استخدم العنوان الآخر الذي يطبعه Vite. |
| `could not read` بجانب نافذة EVM، أو أخطاء CORS في وحدة تحكم المتصفح | استدعت الصفحة خادم REST مباشرة، وهو لا يرسل ترويسات CORS. | استدعِ REST عبر وكيل `/lcd` الخاص بخادم التطوير فقط، كما يفعل هذا المشروع. شغّل الصفحة بـ `pnpm dev`. |

## الكود {#code}

يحتفظ العقد بالإدخالات في مصفوفة ويسمح بتوقيع واحد لكل عنوان:

```solidity
uint256 public constant MAX_LENGTH = 140;
Entry[] private entries;
mapping(address => bool) public hasSigned;

function sign(string calldata message) external {
    uint256 len = bytes(message).length;
    if (len == 0 || len > MAX_LENGTH) revert BadLength();
    if (hasSigned[msg.sender]) revert AlreadySigned();
    hasSigned[msg.sender] = true;
    entries.push(Entry(msg.sender, uint64(block.timestamp), message));
    emit Signed(entries.length - 1, msg.sender, message);
}

function count() external view returns (uint256) { return entries.length; }

// the newest `limit` entries, newest first
function latest(uint256 limit) external view returns (Entry[] memory out);
```

QoreX هي أول محفظة في قائمة الموصّلات (`web/src/wagmi.ts`):

```ts
import { qorechain, qorechainTestnet } from "@qorechain/evm";
import { qorexWallet } from "@qorechain/qorex-rainbowkit";

wallets: [() => qorexWallet({ pollAccountsOnFocus: true }), injectedWallet],
// ...
chains: [qorechainTestnet, qorechain],
```

تعرض الصفحة النافذة وتشرح حالات الرفض (`web/src/App.tsx`):

```tsx
const w = await evmWindowStatus({ rest: REST, address });   // found, live, remainingBlocks, remainingTxs
const rejection = write.error ? classifyEvmWindowRejection(write.error) : undefined;
// "no-pqc-key" | "no-window" | "exhausted" | "invalid"
```

## الحزم المستخدمة {#packages}

العقود (`contracts-app/`):

| الحزمة | الإصدار | تُستخدم لـ |
| --- | --- | --- |
| `@qorechain/sdk` | ^0.13.0 | سكربت مساعد النافذة، والتوقيع الهجين |
| `@qorechain/evm` | ^0.13.0 | تعريفات السلاسل، و`evmWindowStatus` و`evmWindowCost` |
| `@cosmjs/stargate` | ^0.39.0 | بثّ رسالة النافذة |
| `hardhat` | ^3.21.1 | الترجمة والاختبار والنشر بـ Ignition |
| `viem` | ^2.47.6 | عميل إيثريوم |
| `tsx` | ^4.19.0 | تشغيل سكربتات TypeScript |
| `typescript` | ^5.6.3 | فحص الأنواع |

صفحة الويب (`web/`):

| الحزمة | الإصدار | تُستخدم لـ |
| --- | --- | --- |
| `@qorechain/evm` | ^0.13.0 | تعريفات السلاسل، و`evmWindowStatus` و`classifyEvmWindowRejection` |
| `@qorechain/qorex-rainbowkit` | ^0.1.0 | QoreX كمحفظة RainbowKit |
| `@rainbow-me/rainbowkit` | ^2.2.11 | زر الاتصال |
| `wagmi` | ^2.19.5 | خطافات React للقراءة والكتابة |
| `viem` | ^2.53.1 | عميل إيثريوم |
| `@tanstack/react-query` | ^5.59.0 | جلب البيانات للنافذة وقراءات السلسلة |
| `react`, `react-dom` | ^18.3.1 | الواجهة |
| `vite` | ^5.4.0 | خادم التطوير |
| `@vitejs/plugin-react` | ^4.3.0 | دعم React لـ Vite |
| `typescript` | ^5.6.3 | فحص الأنواع |

المصدر: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/02-qday-guestbook
