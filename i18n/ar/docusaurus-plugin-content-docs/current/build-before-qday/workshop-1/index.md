---
slug: /build-before-qday/workshop-1
title: "الورشة 1: معاملتك الأولى الموقّعة هجينًا"
sidebar_label: "الورشة 1"
sidebar_position: 2
date: 2026-11-12
---

# الورشة 1: معاملتك الأولى الموقّعة هجينًا

يأخذك هذا الدليل من حاسوب لم يُثبَّت عليه شيء إلى معاملة واحدة موقّعة بمفتاحين معًا ومتحقَّق منها على شبكة QoreChain الاختبارية. لا يلزم أن تكون مطوّرًا. كل أمر يُشرح بكلمات بسيطة، وتنتهي كل خطوة بما ينبغي أن تراه على شاشتك.

**كم يستغرق ذلك:** نحو 30 دقيقة في المرة الأولى، بما في ذلك تثبيت الأدوات. ونحو 10 دقائق إن كانت الأدوات مثبّتة أصلًا.

## ما الذي نبنيه {#what-we-built}

مشروع Solidity كامل (عقد ذكي صغير) يُنشأ بأمر واحد، ثم يُختبر، ثم يُنشر على شبكة QoreChain الاختبارية، ثم تُرسل معاملة واحدة موقّعة **بمفتاحين معًا** وتتحقق منها السلسلة.

ما يوضّحه هذا الدليل:

- **التوقيع الهجين.** تحمل المعاملة توقيعًا كلاسيكيًا بخوارزمية secp256k1 وتوقيعًا ما بعد كمومي بخوارزمية ML-DSA-87 (معيار NIST FIPS 204). يجب أن يكون كلاهما صالحًا.
- **معاملة واحدة موقّعة هجينًا ومتحقَّق منها على السلسلة.** يتحقق المدقّقون (validators) من التوقيعين. وتقرأ الدليل من نقطة REST العامة (امتداد `PQCHybridSignature` والحدث `pqc_hybrid_verify`) ومن المستكشف.
- **نافذة تفويض EVM.** لا تستطيع معاملة إيثريوم أن تحمل توقيعًا ما بعد كمومي. لذلك تسجّل على QoreChain مفتاح ML-DSA-87 الخاص بك مرة واحدة، ثم تفتح نافذة قصيرة برسالة موقّعة هجينًا، وخلالها تُقبل معاملات EVM العادية. راجع [النشر في 5 دقائق](/getting-started/deploy-in-5-minutes) لفهم الفكرة بعمق.

وهذا هو بالضبط ما يطلبه مستوى Quantum Pass.

## كلمات تُستخدم في هذا الدليل {#words}

| الكلمة | معناها ببساطة |
| --- | --- |
| الطرفية (Terminal) | النافذة التي تكتب فيها الأوامر. Terminal على macOS وLinux، وPowerShell على Windows |
| الشبكة الاختبارية (Testnet) | نسخة تجريبية من QoreChain. عملاتها بلا قيمة |
| QOR وuqor | QOR هي العملة. وuqor أصغر وحدة فيها. 1 QOR = 1,000,000 uqor |
| المعاملة (Transaction) | تعليمة واحدة موقّعة تُرسل إلى السلسلة |
| المذكّرة (Memo) | نص قصير يُرفق بالمعاملة |
| المفتاح الخاص (Private key) | سرّ يوقّع باسم حسابك. من يملكه يتحكم بالحساب |
| رمز الاسترداد (Recovery code) | سرّ ثانٍ (يبدأ بـ `QRC1`) يُصنع منه مفتاحك ما بعد الكمومي |
| الهاش (Hash) | المعرّف الفريد للمعاملة. تستخدمه للبحث عن المعاملة |
| الغاز والرسوم (Gas and fee) | الثمن الصغير بعملة QOR الذي تدفعه لتعالج السلسلة المعاملة |

:::caution حساب اختباري مؤقت فقط
استخدم مفتاحًا أُنشئ لهذا التمرين ويحمل QOR اختبارية فقط. لا تستخدم أبدًا محفظة حقيقية أو أموالًا حقيقية. لا تضع أبدًا في ملف `.env` مفتاحًا أو رمز استرداد لحساب يحمل أموالًا حقيقية، ولا تشارك `.env` ولا تودِعه في git.
:::

## قبل أن تبدأ {#prerequisites}

تحتاج إلى حاسوب بنظام macOS أو Windows أو Linux، وطرفية، ومتصفح ويب. في هذا الدليل ستثبّت أداتين: **Node.js الإصدار 22 أو أحدث** (يحتاج Hardhat 3، أداة المشروع المستخدمة هنا، إلى الإصدار 22) و**pnpm** (الأداة التي تنزّل مكتبات المشروع). وهناك أداة اختيارية واحدة، **jq**، تجعل مخرجات التحقق أسهل قراءة فقط.

افتح الطرفية أولًا. على macOS افتح **Terminal**. على Windows افتح **PowerShell**. على Linux افتح تطبيق الطرفية لديك.

### Node.js الإصدار 22 أو أحدث {#install-node}

1. تحقق إن كان مثبّتًا لديك:

```bash
node -v
```

يجب أن يطبع `v22` أو رقمًا أعلى. إن طبع `command not found` أو إصدارًا أقدم، فثبّت Node.js كما يلي.

2. ثبّته لنظامك:

| النظام | طريقة التثبيت |
| --- | --- |
| macOS | نزّل المثبّت من [nodejs.org/en/download](https://nodejs.org/en/download)، أو شغّل `brew install node@22` إن كنت تستخدم Homebrew |
| Windows | شغّل `winget install OpenJS.NodeJS.LTS` في PowerShell، أو نزّل المثبّت من [nodejs.org/en/download](https://nodejs.org/en/download) |
| Linux | شغّل `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh \| bash`، ثم أغلق الطرفية وأعد فتحها، ثم شغّل `nvm install 22` |

3. أغلق الطرفية، وافتح طرفية جديدة، وشغّل `node -v` مرة أخرى.

**ما ينبغي أن تراه:** رقمًا يبدأ بـ `v22` أو أعلى، مثل `v22.12.0`.

### pnpm {#install-pnpm}

1. تحقق إن كان مثبّتًا لديك:

```bash
pnpm -v
```

2. إن طبع `command not found` (أو `pnpm: command not found`)، فثبّته:

```bash
npm install -g pnpm
```

| الجزء | المعنى |
| --- | --- |
| `npm` | أداة الحزم التي تأتي مع Node.js |
| `install` | نزّل وثبّت برنامجًا |
| `-g` | عام (Global): ثبّته على الحاسوب كله، لا لمجلد واحد |
| `pnpm` | البرنامج المراد تثبيته |

لا يشمل Node.js المثبّت عبر Homebrew أداة pnpm. ولهذا تظهر رسالة `pnpm: command not found` كثيرًا على macOS: وتشغيل الأمر أعلاه يحلّها. وعلى Linux أو macOS، إن ظهر خطأ أذونات فشغّل `corepack enable` بدلًا من ذلك ثم `pnpm -v` مرة أخرى.

3. تحقق مرة أخرى بـ `pnpm -v`.

**ما ينبغي أن تراه:** رقم إصدار، مثل `9.12.0` أو أعلى.

### jq (اختياري) {#install-jq}

يطبع `jq` إجابة طويلة بصورة قصيرة مقروءة. وتُستخدم مرة واحدة في الخطوة 8.

| النظام | التثبيت | التحقق |
| --- | --- | --- |
| macOS | `brew install jq` | `jq --version` |
| Windows | `winget install jqlang.jq` | `jq --version` |
| Linux | `sudo apt install jq` (Debian وUbuntu) | `jq --version` |

أداة `curl` المستخدمة في الخطوة 8 موجودة أصلًا على macOS وLinux وWindows 10 أو أحدث. في Windows PowerShell اكتب `curl.exe` بدلًا من `curl`.

## محفظتك الاختبارية والصنبور {#wallet}

ينشئ المشروع حسابه المؤقت بنفسه في الخطوة 3، فلا تحتاج إلى محفظة لإكمال هذا الدليل. لكنك تحتاج إلى QOR اختبارية في ذلك الحساب، ويمكنك أيضًا إعداد محفظة QoreX على الشبكة الاختبارية لاستخدامها مع التطبيقات النموذجية.

**QoreX على الشبكة الاختبارية (اختياري هنا، ومطلوب لتطبيقات المتصفح النموذجية):**

1. في **تطبيق QoreX**: افتح **Settings** وفعّل **Use testnet (developers)**.
2. في **امتداد متصفح QoreX**: افتحه، ثم المس رقم الإصدار في الأسفل 7 مرات، ثم اختر **Switch to testnet (diana)**.
3. لأي شيء على جانب إيثريوم (EVM)، اختر أيضًا **Add an Ethereum account (coin 60)**. يمنحك هذا حسابًا بعنوان `0x...` يعمل مع أدوات إيثريوم.

**الصنبور** آلة مجانية تعطيك QOR اختبارية. ستستخدمه في الخطوة 4:

- العنوان: [dashboard.qorechain.io/faucet](https://dashboard.qorechain.io/faucet). تسجّل الدخول أولًا.
- الكمية: 100 QOR، مرة كل 24 ساعة لكل حساب.
- أول معاملة لحساب جديد تسجّل مفتاحه ما بعد الكمومي ML-DSA-87. وهذا يكلّف رسمًا لمرة واحدة نحو 0.09 QOR، فـ 100 QOR أكثر من كافية.

تفاصيل الشبكة المستخدمة في هذا الدليل:

| الخدمة | العنوان |
| --- | --- |
| الشبكة الاختبارية | `qorechain-diana`، معرّف سلسلة EVM هو 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` |
| المستكشف | `https://explore.qore.network` (بدّل إلى Testnet) |
| الصنبور | `https://dashboard.qorechain.io/faucet` (يتطلب تسجيل الدخول) |

## الخطوات {#steps}

### الخطوة 1: تحقق من أدواتك {#step-1}

**كم يستغرق ذلك:** دقيقة واحدة.

```bash
node -v
```

| الجزء | المعنى |
| --- | --- |
| `node` | برنامج Node.js |
| `-v` | اطبع رقم إصداره وتوقف |

```bash
pnpm -v
```

| الجزء | المعنى |
| --- | --- |
| `pnpm` | أداة الحزم |
| `-v` | اطبع رقم إصداره وتوقف |

**ما ينبغي أن تراه:** `v22` أو أعلى لـ Node.js، ورقم إصدار لـ pnpm. وإلا فارجع إلى "قبل أن تبدأ".

### الخطوة 2: أنشئ المشروع وشغّل الاختبارات {#step-2}

**كم يستغرق ذلك:** نحو دقيقة. ويحتاج إلى اتصال بالإنترنت.

1. أنشئ المشروع في مجلد جديد. في الطرفية، انتقل إلى مجلد تحفظ فيه مشاريعك (مثل مجلد Documents)، ثم شغّل:

```bash
npx create-qorechain-dapp@latest qday-demo -t hardhat --network testnet --package-manager pnpm
```

ما يفعله: ينزّل أداة QoreChain لإنشاء المشاريع ويبني مشروعًا جاهزًا باسم `qday-demo` في مجلد جديد.

المعاملات:

- `npx`: يشغّل برنامجًا من الإنترنت دون تثبيته بصورة دائمة.
- `create-qorechain-dapp@latest`: أداة QoreChain لإنشاء المشاريع. و`@latest` تعني استخدم أحدث إصدار (جُرّب هذا الدليل مع 0.14.0).
- `qday-demo`: اسم المجلد والمشروع الجديد. يمكنك اختيار اسم آخر.
- `-t hardhat`: الحرف `-t` يعني القالب (template). يختار هذا قالب Hardhat: مشروع عقد Solidity مع اختبارات.
- `--network testnet`: أي شبكة QoreChain يتصل بها المشروع. `testnet` هي الشبكة التجريبية.
- `--package-manager pnpm`: أي أداة تثبّت المكتبات التي يحتاجها المشروع.

**ما ينبغي أن تراه:** قائمة بالحزم المثبّتة ثم `Done! Created qday-demo`. إن سألك عن تثبيت `create-qorechain-dapp` فأجب `y`.

2. ادخل إلى مجلد المشروع:

```bash
cd qday-demo
```

ما يفعله: ينقل طرفيتك إلى المجلد الجديد. كل الأوامر التالية تُشغَّل من هنا.

المعاملات:

- `cd`: تغيير المجلد (change directory).
- `qday-demo`: المجلد المراد دخوله.

3. شغّل الاختبارات:

```bash
pnpm test
```

ما يفعله: يُترجم العقد ويتأكد أنه يعمل، على سلسلة صغيرة محاكاة داخل حاسوبك. ولا يرسل شيئًا إلى الشبكة الاختبارية الحقيقية.

المعاملات:

- `pnpm`: أداة الحزم.
- `test`: اسم السكربت المراد تشغيله (مذكور في `package.json`، وهو يشغّل `hardhat test`).

**ما ينبغي أن تراه:**

```text
  Counter
    ✔ starts at the constructor value
    ✔ increments and emits CountChanged

2 passing (2 nodejs)
```

4. اطّلع على ما حصلت عليه (اختياري):

| الملف | ما هو |
| --- | --- |
| `contracts/Counter.sol` | العقد الذكي: يخزّن رقمًا واحدًا ويستطيع إضافة 1 إليه |
| `ignition/modules/Counter.ts` | الوصفة التي تنشر العقد |
| `scripts/window.ts` | المساعد الذي يقف خلف `pnpm window`: يسجّل مفتاحك ويفتح نافذة التفويض |
| `hardhat.config.ts` | الإعدادات، ومنها شبكة `qorechainTestnet` (معرّف السلسلة 9800) |
| `.env` | ملف إعداداتك السرية. تملؤه في الخطوة 3. لا تشاركه أبدًا |

المزيد عن القوالب: [المولّدات وCLI](/developer-tools/scaffolders-and-cli) و[مجموعة أدوات مطوري السلسلة](/developer-tools/chain-dev-sdk).

### الخطوة 3: أنشئ حسابًا اختباريًا مؤقتًا {#step-3}

**كم يستغرق ذلك:** 3 دقائق.

يحتاج الحساب إلى سرّين: **مفتاح خاص** بنمط إيثريوم، و**رمز استرداد** (يبدأ بـ `QRC1`) يُصنع منه مفتاح ML-DSA-87 ما بعد الكمومي. يذهب كلاهما إلى ملف `.env` في مجلد مشروعك. والملف خاص بحاسوبك.

1. أنشئ مفتاحًا خاصًا جديدًا. أنشئ أولًا ملفًا صغيرًا باسم `make-key.mjs` داخل مجلد `qday-demo`، بهذا المحتوى (استخدم أي محرر نصوص، مثل Notepad أو TextEdit بوضع النص العادي أو nano):

```js
import { generatePrivateKey } from "viem/accounts";
import { readFileSync, writeFileSync } from "node:fs";

const env = readFileSync(".env", "utf8");
writeFileSync(".env", env.replace(/^PRIVATE_KEY=.*$/m, `PRIVATE_KEY=${generatePrivateKey()}`));
console.log("New private key saved in .env");
```

ما يفعله هذا الملف: يصنع مفتاحًا خاصًا عشوائيًا ويكتبه في ملف `.env`، فلا يظهر على الشاشة ولا تنسخه بيدك.

2. شغّله:

```bash
node make-key.mjs
```

ما يفعله: يشغّل الملف الصغير بواسطة Node.js.

المعاملات:

- `node`: برنامج Node.js.
- `make-key.mjs`: الملف المراد تشغيله.

**ما ينبغي أن تراه:** `New private key saved in .env`. شغّله مرة واحدة فقط: التشغيل الثاني يصنع حسابًا مختلفًا.

3. أنشئ رمز استرداد:

```bash
pnpm window recovery-code
```

ما يفعله: ينشئ رمز استرداد جديدًا ويطبعه.

المعاملات:

- `pnpm window`: يشغّل مساعد النافذة في المشروع (`scripts/window.ts`).
- `recovery-code`: الإجراء المطلوب: اطبع رمز استرداد جديدًا.

**ما ينبغي أن تراه:** سطرًا طويلًا واحدًا يبدأ بـ `QRC1`، ثم ملاحظة عن حفظه. انسخ سطر `QRC1...` بالكامل.

4. ضع الرمز في `.env`. افتح الملف في محرر:

| النظام | الأمر |
| --- | --- |
| macOS | `open -e .env` |
| Windows | `notepad .env` |
| Linux | `nano .env` |

ابحث عن السطر `QORE_PQC_RECOVERY_CODE=` والصق الرمز مباشرة بعد علامة المساواة، دون مسافات ودون علامات اقتباس. احفظ الملف. تبدو النتيجة هكذا (القيم هنا رموز نائبة، وقيمك حقيقية):

```text
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1...
QORE_NETWORK=testnet
```

معنى كل سطر:

- `PRIVATE_KEY`: السرّ الذي يوقّع عن النصف الكلاسيكي (secp256k1) من حسابك.
- `QORE_PQC_RECOVERY_CODE`: السرّ الذي يصنع النصف ما بعد الكمومي (ML-DSA-87).
- `QORE_NETWORK`: أي شبكة يتصل بها المساعد. `testnet` هي الشبكة التجريبية.

أبقِ `.env` كما هو تمامًا. فالمفتاح والرمز نفسهما يعطيانك الحساب نفسه في كل مرة. وإن ضاع الملف فابدأ من جديد بحساب جديد. لا تشاركه أبدًا ولا تودِعه في git.

تفضّل عبارة استرجاعية (اثنتا عشرة كلمة)؟ بدلًا من المفتاح والرمز، ضع `QORE_MNEMONIC="your twelve words"` في `.env`. يُشتق المفتاحان من العبارة نفسها ولا حاجة إلى رمز استرداد. استخدم عبارة أُنشئت لهذا التمرين فقط.

5. اطلب من المشروع عنوان حسابك الجديد:

```bash
pnpm window status
```

ما يفعله: يقرأ السلسلة العامة ويعرض حسابك ومفتاحك ما بعد الكمومي ونافذتك. ولا يغيّر شيئًا.

المعاملات:

- `pnpm window`: يشغّل مساعد النافذة.
- `status`: الإجراء المطلوب: اعرض الحالة الحالية.

**ما ينبغي أن تراه:** ثلاثة أسطر (تعرض أسطرك عناوين حقيقية):

```text
account:  0x...  (qor1...)
PQC key:  not registered (run: pnpm window register)
window:   none (run: pnpm window open)
```

انسخ عنوان `qor1...`. هذا هو العنوان الذي تعطيه للصنبور. العنوانان ينتميان إلى الحساب نفسه: `0x...` هو الصيغة الإيثريومية و`qor1...` هو صيغة QoreChain.

### الخطوة 4: احصل على QOR اختبارية من الصنبور {#step-4}

**كم يستغرق ذلك:** دقيقتان.

1. افتح [الصنبور](https://dashboard.qorechain.io/faucet) في متصفحك وسجّل الدخول.
2. تأكد أن اللوحة على **Testnet**.
3. الصق عنوان `qor1...` الخاص بك.
4. اختر **Request Tokens**.

**ما ينبغي أن تراه:** بطاقة تقول **Tokens Sent!** مع 100 QOR (وبعض رموز الفعالية الاختبارية) ورابط **View on Explorer**.

يدفع الصنبور مرة كل 24 ساعة لكل حساب. الكميات الدقيقة في صفحة [الصنبور](/dashboard/faucet). تحقق الآن من طرفيتك:

```bash
pnpm window status
```

**ما ينبغي أن تراه:** الأسطر الثلاثة نفسها كما قبل. حسابك موجود الآن على السلسلة ويستطيع دفع الرسوم. وما زال يقول إن المفتاح غير مسجّل. وهذا هو التالي.

### الخطوة 5: سجّل مفتاحك وافتح النافذة {#step-5}

**كم يستغرق ذلك:** نحو دقيقتين.

1. سجّل مفتاح ML-DSA-87 الخاص بك. هذه خطوة تُنفَّذ مرة واحدة لكل حساب:

```bash
pnpm window register
```

لتفهم ما يفعله التسجيل، اقرأ [كيف يرتبط مفتاحك ما بعد الكمّي بحسابك](/build-before-qday/key-binding).

ما يفعله: يرسل معاملة واحدة تخبر السلسلة أي مفتاح ما بعد كمومي يخص حسابك. ويكلّف رسمًا لمرة واحدة نحو 0.09 QOR. تقبل السلسلة هذه الرسالة الواحدة موقّعة بالمفتاح الكلاسيكي وحده، لأنه لا يوجد بعد مفتاح ما بعد كمومي مسجّل.

المعاملات:

- `pnpm window`: يشغّل مساعد النافذة.
- `register`: الإجراء المطلوب: سجّل المفتاح.

**ما ينبغي أن تراه:** `registered: <HASH>`. وإن قال `The account already has a PQC key; nothing to do.` فلا بأس: تابع.

2. افتح نافذة التفويض:

```bash
pnpm window open
```

ما يفعله: يرسل معاملة **موقّعة هجينًا** (بالمفتاحين) تفتح نافذة قصيرة تُقبل خلالها معاملاتك العادية بنمط إيثريوم، مثل نشر عقد.

المعاملات:

- `pnpm window`: يشغّل مساعد النافذة.
- `open`: الإجراء المطلوب: افتح نافذة. وتدوم افتراضيًا 600 كتلة وتسمح بـ 5 معاملات. يمكنك تغيير ذلك بـ `QORE_WINDOW_BLOCKS` و`QORE_WINDOW_TXS` في `.env`.

**ما ينبغي أن تراه:** `opened: <HASH>`، ثم سطرًا مثل `window: 600 blocks, 5 txs, 3750000 uqor (value plus fees)`. هذا الرقم الأخير هو حد الإنفاق للنافذة بوحدة uqor (3.75 QOR). دوّن هاش `opened:`: ستتحقق منه في الخطوة 8.

3. انتظر نحو 10 ثوانٍ. فقد قدّم فتح النافذة عدّاد الحساب (nonce)، وتنتظر Hardhat استقرار السلسلة.

### الخطوة 6: ابنِ العقد {#step-6}

**كم يستغرق ذلك:** بضع ثوانٍ.

```bash
pnpm build
```

ما يفعله: يحوّل عقد Solidity إلى الصيغة التي تشغّلها السلسلة.

المعاملات:

- `pnpm`: أداة الحزم.
- `build`: السكربت المراد تشغيله (وهو يشغّل `hardhat build`).

**ما ينبغي أن تراه:** `Compiled 1 Solidity file` أو `No contracts to compile`. كلاهما سليم: فاختبار الخطوة 2 ترجم العقد أصلًا.

### الخطوة 7: انشر العقد على الشبكة الاختبارية {#step-7}

**كم يستغرق ذلك:** نحو 30 ثانية.

```bash
pnpm deploy:testnet
```

ما يفعله: يرسل العقد إلى شبكة QoreChain الاختبارية بواسطة Hardhat Ignition، مستخدمًا النافذة التي فتحتها. وهذه معاملة EVM عادية.

المعاملات:

- `pnpm`: أداة الحزم.
- `deploy:testnet`: السكربت المراد تشغيله. وهو يشغّل `hardhat ignition deploy ignition/modules/Counter.ts --network qorechainTestnet`: انشر الوصفة `Counter.ts` على الشبكة المسماة `qorechainTestnet` (معرّف السلسلة 9800).

عندما يسأل Hardhat `Confirm deploy to network qorechainTestnet (9800)?` اكتب `y` واضغط Enter.

**ما ينبغي أن تراه:** `[ CounterModule ] successfully deployed` وسطرًا `CounterModule#Counter - 0x...`. والعنوان `0x...` هو عنوان عقدك. وإن رأيت `HHE10402` فأعد تشغيل الأمر نفسه (انظر استكشاف الأخطاء).

### الخطوة 8: تحقق من التوقيع الهجين على السلسلة {#step-6-verify}

**كم يستغرق ذلك:** 3 دقائق.

معاملة `opened:` من الخطوة 5 وُقّعت بالمفتاحين معًا. يستطيع أي شخص التحقق منها من نقطة REST العامة.

1. استبدل `<HASH>` بذلك الهاش (دون `<` و`>`) وشغّل:

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

ما يفعله: يطلب من خادم الشبكة الاختبارية العام السجل الكامل لمعاملتك.

المعاملات:

- `curl`: برنامج يجلب عنوان ويب.
- `-s`: صامت، فيخفي شريط التقدم ويعرض الإجابة فقط.
- `https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>`: عنوان REST للشبكة الاختبارية، يليه هاش معاملتك.

**ما ينبغي أن تراه:** كتلة نص طويلة. ابحث فيها عن ثلاثة أشياء:

1. `"code": 0` داخل `tx_response`. الرمز 0 يعني النجاح.
2. امتداد `PQCHybridSignature`، وفيه توقيع ML-DSA-87: **4,627 بايت**، إلى جانب توقيع secp256k1 البالغ 64 بايت.
3. في `events`، حدثًا من النوع `pqc_hybrid_verify` وخاصيته `status` تساوي `verified`.

2. لطباعة ذلك الحدث فقط (يحتاج إلى `jq`):

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> | jq '.tx_response.events[] | select(.type=="pqc_hybrid_verify")'
```

ما يفعله: يجلب السجل نفسه ويمرّره عبر `jq`، الذي يُبقي على حدث التحقق وحده.

المعاملات:

- `|`: أرسل مخرجات الأمر الأول إلى الأمر الثاني.
- `jq`: برنامج التصفية.
- `'.tx_response.events[] | select(.type=="pqc_hybrid_verify")'`: مرّ على قائمة الأحداث وأبقِ التي نوعها `pqc_hybrid_verify`.

**ما ينبغي أن تراه:** كتلة نص صغيرة فيها `"status"` تساوي `"verified"`.

3. اطّلع عليها في المستكشف:
   1. افتح [explore.qore.network](https://explore.qore.network).
   2. بدّل محدّد الشبكة إلى **Testnet**.
   3. ابحث عن الهاش.

**ما ينبغي أن تراه:** تعرض صفحة المعاملة أمان التوقيع بأنه آمن كموميًا ومتحقَّق منه على السلسلة، بخوارزمية ML-DSA-87 (FIPS 204).

هذا هو الدليل: لقد تحقق المدقّقون من التوقيعين. وهذه هي معاملة Quantum Pass الخاصة بك.

## ما ينبغي أن تراه، في لمحة {#what-you-should-see}

| أين | ماذا |
| --- | --- |
| بعد الخطوة 2 | `Done! Created qday-demo` و`2 passing` |
| بعد الخطوة 3 | عنوان `qor1...` وعنوان `0x...` من `pnpm window status`، مع مفتاح غير مسجّل |
| بعد الخطوة 4 | **Tokens Sent!** على الصنبور |
| بعد الخطوة 5 | `registered: <HASH>`، ثم `opened: <HASH>` وسطر النافذة |
| بعد الخطوة 7 | `CounterModule#Counter - 0x...` |
| بعد الخطوة 8 | `code` يساوي 0، وتوقيع ML-DSA-87 بحجم 4,627 بايت، و`pqc_hybrid_verify` مع `status` يساوي `verified`، في مخرجات REST وفي المستكشف على Testnet |

## الحزم المستخدمة {#published}

مصرَّح بها في `package.json` المولَّد:

| الحزمة | السجل | الإصدار |
| --- | --- | --- |
| `create-qorechain-dapp` | npm | 0.14.0 |
| `@qorechain/sdk` | npm | ^0.14.0 |
| `@qorechain/evm` | npm | ^0.14.0 |
| `@cosmjs/stargate` | npm | ^0.39.0 |
| `hardhat` | npm | ^3.21.1 |
| `viem` | npm | ^2.47.6 |
| `tsx` | npm | ^4.19.0 |
| `typescript` | npm | ^5.6.3 |

يثبّت المولّد أيضًا إضافات Hardhat toolbox وIgnition وkeystore المذكورة في `package.json` المولَّد.

## استكشاف الأخطاء {#troubleshooting}

| ما تراه | السبب | ما العمل |
| --- | --- | --- |
| `HHE10402` أو "wait for confirmations" مباشرة بعد فتح النافذة | فتح النافذة قدّم عدّاد الحساب (nonce) | شغّل `pnpm deploy:testnet` مرة أخرى |
| "EVM authorisation window exhausted" أو "no window" | نفدت معاملات النافذة أو كتلها، أو أنها مخصّصة لعقد آخر (والنافذة المخصّصة لعقد آخر تمنع النشر) | شغّل `pnpm window open` لفتح نافذة جديدة، وانتظر نحو 10 ثوانٍ، ثم انشر مرة أخرى |
| "account has no PQC key and classical fallback is disabled" | لم يسجّل الحساب مفتاح ML-DSA-87 | شغّل `pnpm window register` أولًا، ثم `pnpm window open` |
| "does not exist on chain yet" | لا يملك الحساب QOR بعد | احصل على QOR من الصنبور (الخطوة 4) |
| "Rate Limit Reached" على الصنبور، أو لا رموز بعد 30 ثانية | طلب واحد كل 24 ساعة لكل حساب ولكل عنوان، وتُعالَج الطلبات واحدًا تلو الآخر | انتظر بضع ثوانٍ وأعد المحاولة، أو انتظر مرور 24 ساعة. طلب واحد فقط كل 24 ساعة |
| `pnpm: command not found` | pnpm غير مثبّت. فـ Node.js المثبّت عبر Homebrew لا يشمله | شغّل `npm install -g pnpm`، ثم افتح طرفية جديدة |
| يتوقف `pnpm window` برسالة عن رمز استرداد مفقود | يحتوي `.env` على `PRIVATE_KEY` دون `QORE_PQC_RECOVERY_CODE` | شغّل `pnpm window recovery-code` والصق الرمز في `.env` (الخطوة 3)، أو استخدم `QORE_MNEMONIC` |
| "QORE_PQC_RECOVERY_CODE is not a valid QRC1 recovery code" | خطأ إملائي أو مسافة أو علامة اقتباس عند اللصق | الصق الرمز مرة أخرى دون مسافات أو علامات اقتباس |
| "registered, but NOT this key" في `pnpm window status` | استُخدم رمز استرداد مختلف لهذا الحساب سابقًا | أعد رمز الاسترداد الأصلي إلى `.env`، أو ابدأ من جديد بحساب جديد |
| أخطاء CORS في تطبيق متصفح | يحجب المتصفح الاستدعاءات إلى عنوان سلسلة لا يسمح بصفحتك | استخدم مسار الوكيل `/lcd` الخاص بالقالب لاستدعاءات REST من المتصفح بدلًا من استدعاء عنوان السلسلة مباشرة |
| يرفض Hardhat البدء | إصدار Node.js أقدم من 22 | ثبّت Node.js الإصدار 22 أو أحدث (انظر "قبل أن تبدأ") وشغّل `pnpm install` مرة أخرى |
| يعرض `curl` الرسالة `tx not found` مباشرة بعد الخطوة | الكتلة لم تُثبَّت نهائيًا بعد | انتظر 10 ثوانٍ وشغّل الأمر مرة أخرى |
| لا يعمل `curl` في Windows PowerShell | `curl` أمر مختلف هناك | اكتب `curl.exe` بدلًا من `curl` |

## التطبيقات النموذجية {#example-apps}

التدفق نفسه، من عدة لغات وواجهات أمامية. وكلها توقّع هجينًا. جميعها في المستودع العام [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday)، المجلد `workshop-1`. للحصول عليها تحتاج إلى Git (تحقق بـ `git --version`؛ وثبّته من [git-scm.com](https://git-scm.com/downloads))، ثم شغّل:

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1
```

ما يفعله: ينزّل نسخة من كل التطبيقات النموذجية وينتقل إلى مجلد `workshop-1`.

المعاملات:

- `git clone <address>`: انسخ مشروعًا من الإنترنت إلى حاسوبك.
- `cd build-before-qday/workshop-1`: ادخل المجلد الذي يضم التطبيقات الستة.

كل صفحة تطبيق دليل كامل من البداية إلى النهاية، فيه ما يجب تثبيته وما ينبغي توقعه.

| التطبيق | اللغة | الصفحة |
| --- | --- | --- |
| Q-Day Counter | TypeScript, Solidity | [qday-counter](/build-before-qday/workshop-1/apps/qday-counter) |
| Q-Day Guestbook | TypeScript, Solidity | [qday-guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) |
| Hybrid Inspector | TypeScript | [hybrid-inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) |
| Q-Day Pay | Rust | [rust-qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) |
| Q-Day Tip Jar | Java | [java-tipjar](/build-before-qday/workshop-1/apps/java-tipjar) |
| Q-Day Airdrop | Python | [python-airdrop](/build-before-qday/workshop-1/apps/python-airdrop) |

المجموعات التي تقف خلف هذه التطبيقات مدرجة في [المجموعات](/build-before-qday/workshop-1/kits). ولاستخدام محفظة QoreX مع dApp في المتصفح، راجع [QoreX](/qorex/overview).
