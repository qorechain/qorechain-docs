---
slug: /build-before-qday/workshop-1/apps/hybrid-inspector
title: Hybrid Inspector
sidebar_label: Hybrid Inspector
sidebar_position: 3
---

# Hybrid Inspector

الـ Hybrid Inspector صفحة ويب صغيرة (مبنية بـ React) تُظهر شكل التوقيع الهجين في QoreChain على شبكة testnet ‏`qorechain-diana`. تربط محفظة QoreX، ثم ترسل معاملة واحدة توقّعها QoreX بمفتاحَي secp256k1 وML-DSA-87 معًا، وتفتح الصفحة هذه المعاملة لتعرض أجزاءها: التوقيع الكلاسيكي، والتوقيع المقاوم للحوسبة الكمومية، وحكم السلسلة نفسها. ويمكنك أيضًا لصق أي معرّف (hash) لمعاملة على testnet.

**كم يستغرق هذا:** نحو 20 دقيقة، بما في ذلك التثبيتات. بعد ذلك تعمل الصفحة في ثوانٍ.

## ما الذي يعرضه {#what-it-shows}

- **توقيع هجين ML-DSA-87 + secp256k1 من صفحة ويب.** تسلّم الصفحة رسالة مشفّرة إلى QoreX عبر `qorexSignAndBroadcast`. توقّع QoreX بالمفتاحين وتبثّ المعاملة.
- **معاملة واحدة موقّعة هجينيًا ومتحقَّق منها على السلسلة.** تقرأ الصفحة حدث `pqc_hybrid_verify` الخاص بالمعاملة. هذا الحدث هو إعلان السلسلة أنها تحققت من التوقيع المقاوم للحوسبة الكمومية.
- **الأحجام ظاهرة.** التوقيع الكلاسيكي 64 بايت. أما توقيع ML-DSA-87 (معيار FIPS 204) فحجمه 4,627 بايت، ويسافر داخل الامتداد `PQCHybridSignature` في المعاملة.

## خطوة بخطوة {#steps}

تعمل في الطرفية (terminal) الخاصة بك وفي متصفحك. استخدم حسابًا تجريبيًا مؤقتًا على testnet فقط. عملة QOR على testnet بلا قيمة. لا تستخدم هنا محفظة حقيقية ولا أموالًا حقيقية أبدًا.

### 1. قبل أن تبدأ: ثبّت الأدوات {#install}

تحتاج إلى أربعة أشياء: متصفح مبني على Chromium (Chrome أو Edge أو Brave)، و**Git** (لتنزيل الكود)، و**Node.js** (لتشغيل أدوات الصفحة)، و**pnpm** (لتثبيت مكتبات الصفحة). استخدم Node.js 22 أو أحدث. تعمل الصفحة نفسها أيضًا مع Node.js 20، لكن 22 هو الخيار الآمن لكل تطبيقات الورشة.

**macOS**

| الأداة | طريقة التثبيت | التحقق |
| --- | --- | --- |
| Git | `xcode-select --install` (أو `brew install git`) | `git --version` |
| Node.js 22+ | نزّل مثبّت LTS من https://nodejs.org، أو نفّذ `brew install node` | `node --version` (يجب أن يظهر v22 أو أعلى) |
| pnpm | `npm install -g pnpm` | `pnpm --version` |

**Windows** (استخدم PowerShell)

| الأداة | طريقة التثبيت | التحقق |
| --- | --- | --- |
| Git | نزّله من https://git-scm.com/download/win | `git --version` |
| Node.js 22+ | نزّل مثبّت LTS من https://nodejs.org (أو `winget install OpenJS.NodeJS.LTS`) | `node --version` |
| pnpm | `npm install -g pnpm` | `pnpm --version` |

**Linux (Debian أو Ubuntu)**

| الأداة | طريقة التثبيت | التحقق |
| --- | --- | --- |
| Git | `sudo apt update && sudo apt install -y git curl` | `git --version` |
| Node.js 22+ | اتبع https://nodejs.org/en/download (اختر Linux ثم إصدار LTS) | `node --version` |
| pnpm | `npm install -g pnpm` | `pnpm --version` |

**تنبيه:** لا يتضمن Node.js المثبّت عبر Homebrew الأداة pnpm. إذا ظهرت لك الرسالة `pnpm: command not found` فنفّذ `npm install -g pnpm`، ثم افتح طرفية جديدة.

**ما الذي يجب أن تراه:** كل أمر تحقق يطبع رقم إصدار. ويبدأ ناتج `node --version` بـ `v22` أو أعلى.

### 2. قبل أن تبدأ: QoreX على testnet {#qorex}

QoreX هي المحفظة الرسمية لـ QoreChain. تحتاج هذه الصفحة إلى **امتداد QoreX للمتصفح** في المتصفح الذي ستفتح فيه الصفحة. ثبّته من متجر متصفحك. راجع [QoreX Integrations](/developer-tools/qorex-integrations) و[متصفح dApp](/qorex/dapp-browser).

استخدم **حسابًا جديدًا مؤقتًا** أُنشئ لهذا التمرين فقط. تعرض QoreX عبارة استرجاع عند إنشاء الحساب. اكتبها على ورقة، وأبقِها سرية، ولا تعيد استخدامها على الشبكة الرئيسية أبدًا.

حوّل QoreX إلى testnet:

- **امتداد المتصفح:** افتح قفله، ثم اضغط على رقم الإصدار أسفل النافذة 7 مرات، ثم اختر **Switch to testnet (diana)**.
- **تطبيق QoreX:** افتح الإعدادات وفعّل **Use testnet (developers)**. (تعمل الصفحة في متصفح سطح المكتب، لذلك تستخدم الامتداد في هذا الدليل.)

راجع [النشر في 5 دقائق](/getting-started/deploy-in-5-minutes#step-testnet) لمزيد من التفاصيل عن التحويل إلى testnet. انسخ عنوان حسابك (يبدأ بـ `qor1...`).

لا تحتاج إلى حساب Ethereum (coin 60) لهذه الصفحة، لأنها ترسل دفعة على QoreChain Native.

### 3. احصل على QOR تجريبية من الـ faucet {#faucet}

الـ faucet موقع ويب يرسل QOR تجريبية مجانية إلى عنوان.

1. افتح https://dashboard.qorechain.io/faucet وسجّل الدخول.
2. الصق عنوانك `qor1...` واطلب. يمنح الـ faucet **100 QOR كل 24 ساعة لكل حساب**.

**المبالغ:** الوحدة التي تقرؤها هي **QOR**. أما السلسلة فتحسب بوحدة **uqor**، وهي أصغر وحدة. 1 QOR = 1,000,000 uqor. تطلب الصفحة المبلغ بـ QOR وتحوّله لك.

**من المفيد أن تعرف:** أول معاملة لحساب جديد تسجّل مفتاحه المقاوم للحوسبة الكمومية ML-DSA-87 على السلسلة. وهذه رسوم لمرة واحدة بنحو 0.09 QOR. تفعل QoreX ذلك عنك عند أول إرسال.

### 4. احصل على الكود {#get-code}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/03-hybrid-inspector
```

| الجزء | المعنى |
| --- | --- |
| `git clone <address>` | ينزّل نسخة كاملة من التطبيقات النموذجية من GitHub إلى مجلد جديد اسمه `build-before-qday`. |
| `cd <folder>` | ينقل طرفيتك إلى مجلد Hybrid Inspector. كل الأوامر التالية تُنفَّذ من هنا. |

**ما الذي يجب أن تراه:** `Cloning into 'build-before-qday'...`. نفّذ `ls` للتحقق: سترى `package.json` و`src` و`index.html` و`vite.config.ts`.

### 5. ثبّت المكتبات {#install-libs}

```sh
pnpm install
```

**ماذا يفعل:** ينزّل `pnpm` المكتبات التي تحتاجها الصفحة (المذكورة في `package.json`) إلى مجلد اسمه `node_modules`. تنفّذه مرة واحدة لكل مشروع.

| الجزء | المعنى |
| --- | --- |
| `pnpm` | الأداة التي تثبّت المكتبات. |
| `install` | اقرأ `package.json` وثبّت كل ما فيه، بالإصدارات الموجودة في `pnpm-lock.yaml`. |

**كم يستغرق:** أقل من دقيقة.

**ما الذي يجب أن تراه:** شريط تقدّم، ثم `Done in` ومعه زمن.

### 6. تحقق من أن البناء ينجح {#build}

```sh
pnpm build
```

**ماذا يفعل:** يشغّل السكربت المسمّى `build` من `package.json`. هذا السكربت هو `tsc --noEmit && vite build`.

| الجزء | المعنى |
| --- | --- |
| `pnpm build` | شغّل سكربت `build` الخاص بالمشروع. |
| `tsc --noEmit` | مدقّق TypeScript. يبحث عن أخطاء في الكود ولا يكتب أي ملفات. |
| `vite build` | يجمّع Vite الصفحة في موقع ويب صغير داخل المجلد `dist`. |

**ما الذي يجب أن تراه:** `transforming...`، ثم أسطرًا مثل `dist/index.html`، وأخيرًا `built in` ومعه زمن (أقل من ثانية بكثير).

### 7. شغّل الصفحة {#run}

```sh
pnpm dev
```

**ماذا يفعل:** يشغّل السكربت `dev`، الذي يبدأ خادم ويب صغيرًا على حاسوبك لتستخدم الصفحة في المتصفح. اترك هذه الطرفية مفتوحة أثناء عملك. اضغط Ctrl+C لإيقافه.

**ما الذي يجب أن تراه:**

```text
  VITE v5.4.21  ready in 111 ms

  ➜  Local:   http://localhost:5173/
```

افتح http://localhost:5173 في المتصفح الذي ثبّتّ فيه QoreX. إذا كان المنفذ 5173 مشغولًا، يطبع Vite منفذًا آخر. استخدم العنوان الذي يطبعه.

لفحص معاملة مباشرة، أضف `?tx=<HASH>` إلى العنوان: `http://localhost:5173?tx=<HASH>`.

**لماذا تستدعي الصفحة `/lcd`:** خدمة REST العامة لـ testnet لا ترسل ترويسات CORS، لذلك لا تستطيع صفحة في المتصفح استدعاءها مباشرة. يحوّل خادم التطوير كل استدعاء من `/lcd` إلى `https://api-testnet.qore.host`. تعمل الصفحة على testnet فقط، ولا حاجة إلى ملف `.env`.

### 8. اربط وأرسل وتحقق {#connect-send}

1. **اربط.** اضغط **Connect QoreX**. تطلب منك QoreX السماح للصفحة. وافق. تعرض الصفحة عنوانك (`qor1...`) ورصيدك على testnet وهل مفتاح ML-DSA-87 مسجّل. وتكتب "not registered yet" حتى أول إرسال.
2. **املأ نموذج الإرسال.**

| الحقل | المعنى |
| --- | --- |
| To | عنوان المستلم (`qor1...`). يُملأ بعنوانك أنت افتراضيًا، وهذا مناسب. |
| Amount (QOR) | المبلغ المراد إرساله بـ QOR. القيمة `1` تعني 1 QOR = 1,000,000 uqor. |
| Memo | نص قصير يُرفق بالمعاملة ويُخزَّن على السلسلة. يستطيع أي شخص قراءته، فلا تكتب فيه شيئًا خاصًا. |

3. **أرسل.** اضغط **Sign with QoreX and send**. تعرض QoreX ما توقّعه وتطلب الموافقة. وافق. انتظر الكتلة (بضع ثوانٍ).
4. **افحص.** تفحص الصفحة المعاملة تلقائيًا. ويمكنك أيضًا لصق أي معرّف معاملة من 64 حرفًا على testnet في الخطوة 3 من الصفحة والضغط على **Inspect**.

**ما الذي يجب أن تراه:** سطرًا `QoreX: code 0, shield ..., tx <hash>`، ثم بطاقة الفحص الموصوفة في "ما الذي يجب أن تراه" أدناه. انسخ معرّف المعاملة.

### 9. تحقق بطريقة ثانية، بدون الصفحة {#verify-curl}

يمكنك أن تسأل السلسلة مباشرة. تحتاج فقط إلى `curl`، وهو موجود في macOS ومعظم أنظمة Linux. في Windows PowerShell استخدم `curl.exe`. الأداة `jq` اختيارية وتجعل الجواب أسهل قراءة (`brew install jq` على macOS، و`sudo apt install -y jq` على Linux، و`winget install jqlang.jq` على Windows).

```sh
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> | jq '.tx_response.code, .tx.body.extension_options[0]["@type"], (.tx.body.extension_options[0].pqc_signature | length)'
```

| الجزء | المعنى |
| --- | --- |
| `curl -s <address>` | ينزّل الجواب من خدمة REST الخاصة بـ testnet. الخيار `-s` يخفي شريط التقدّم. |
| `<HASH>` | معرّف معاملتك، من الخطوة 8. |
| `\| jq '...'` | يستخرج ثلاث قيم. بدون `jq` احذف هذا الجزء واقرأ النص الكامل. |

**ما الذي يجب أن تراه:**

- `code` يساوي `0`: نجحت المعاملة.
- امتداد `PQCHybridSignature` (من النوع `/qorechain.pqc.v1.PQCHybridSignature`) فيه `pqc_signature`. نصه بصيغة base64 طوله 6,172 حرفًا، أي 4,627 بايت من توقيع ML-DSA-87.
- في `tx_response.events` حدث من النوع `pqc_hybrid_verify` والسمة `status` فيه تساوي `verified`.

**في المستكشف:** افتح https://explore.qore.network، وحوّله إلى **Testnet**، وابحث عن معرّف معاملتك.

## استكشاف الأخطاء {#troubleshooting}

| ما الذي تراه | السبب | ما العمل |
| --- | --- | --- |
| `pnpm: command not found` | pnpm غير مثبّت. لا يتضمنه Node.js المثبّت عبر Homebrew. | نفّذ `npm install -g pnpm`، ثم افتح طرفية جديدة. |
| `node --version` يعرض v18 أو أقل | إصدار Node.js قديم جدًا. | ثبّت Node.js 22 أو أحدث (الخطوة 1). |
| تقول الصفحة `QoreX was not found in this page. Install the QoreX extension, switch it to testnet, and reload.` | الامتداد غير موجود أو مقفل، أو المتصفح ليس مبنيًا على Chromium. | ثبّت QoreX وافتح قفله في Chrome أو Edge أو Brave. حوّله إلى testnet ثم أعد تحميل الصفحة. |
| يقول الـ faucet إنك بلغت حد الطلبات | طلب واحد كل 24 ساعة لكل حساب. | انتظر 24 ساعة، أو استخدم حسابًا تجريبيًا ثانيًا. |
| `account has no PQC key and classical fallback is disabled` | المفتاح المقاوم للحوسبة الكمومية لم يُسجَّل بعد. | أرسل مرة واحدة من QoreX (تسجّل المفتاح عند أول إرسال، بنحو 0.09 QOR). تأكد أولًا من أن لديك QOR من الـ faucet. |
| `EVM authorisation window exhausted` | تخص تطبيق Hardhat، لا هذه الصفحة. | في ذلك التطبيق افتح نافذة جديدة بالأمر `pnpm window open`. |
| `HHE10402` بعد فتح النافذة | تخص تطبيق Hardhat. تحتاج النافذة إلى بضع ثوانٍ. | شغّل النشر مرة أخرى. |
| خطأ CORS في وحدة تحكم المتصفح | استدعت الصفحة خدمة REST مباشرة. | استخدم وكيل `/lcd` الخاص بخادم التطوير (`pnpm dev`) وافتح الصفحة على `http://localhost:5173`. لا تفتح `dist/index.html` كملف. |
| `Enter an amount in QOR, for example 1.` | المبلغ فارغ أو صفر أو ليس رقمًا. | اكتب رقمًا مثل `1`. |
| `A transaction hash is 64 hex characters.` | المعرّف الملصوق خاطئ أو مقصوص. | الصق الـ 64 حرفًا كاملة. |
| `Transaction not found on qorechain-diana` | المعرّف من شبكة أخرى، أو الكتلة لم تُثبَّت بعد. | انتظر 10 ثوانٍ وأعد المحاولة. تأكد أن QoreX على testnet. |
| المنفذ 5173 مستخدم | برنامج آخر يستخدمه. | يختار Vite المنفذ التالي ويطبعه. افتح ذلك العنوان. |

## الكود {#code}

الربط والإرسال:

```ts
import { getQorexNative, qorexSignAndBroadcast } from "@qorechain/qorex-types";

const native = getQorexNative();
await native.enable("qorechain-diana");
const key = await native.getKey("qorechain-diana");      // key.bech32Address

const r = await qorexSignAndBroadcast({
  chainId: "qorechain-diana",
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: msgSendBytes(from, to, uqor) }],
  memo,
});                                                       // r.txHash, r.code, r.shield
```

قراءة الدليل من السلسلة:

```ts
const res = await fetch(`/lcd/cosmos/tx/v1beta1/txs/${hash}`).then((r) => r.json());
const tx = res.tx;
const ext = [...(tx.body.extension_options ?? []), ...(tx.body.non_critical_extension_options ?? [])];
const hyb = ext.find((x) => String(x["@type"]).includes("PQCHybridSignature"));
const verify = (res.tx_response.events ?? []).filter((e) => e.type === "pqc_hybrid_verify");
// classical signature: atob(tx.signatures[0]).length  -> 64
// ML-DSA-87 signature: atob(hyb.pqc_signature).length -> 4627
```

الدالة `msgSendBytes` مشفّر protobuf صغير في الملف `src/App.tsx` لرسالة `MsgSend` الخاصة بالبنك، لأن QoreX تستقبل الرسالة مشفّرة. تعدّ الصفحة المعاملة متحققًا منها هجينيًا عندما يكون رمزها 0، ويوجد حدث `pqc_hybrid_verify` حالته `verified`، ويبلغ التوقيع المقاوم للحوسبة الكمومية 4,627 بايت.

## ما الذي يجب أن تراه {#result}

- تعرض الترويسة `qorechain-diana (testnet)` وارتفاع كتلة يواصل الزيادة.
- بعد الربط: عنوانك ورصيدك وحالة المفتاح.
- بعد الإرسال: معرّف المعاملة ورمز النتيجة، ثم بطاقة الفحص التي فيها الـ memo ونوع الرسالة والتوقيع الكلاسيكي (64 بايت) وتوقيع ML-DSA-87 (4,627 بايت) مع أول بايتاته بالنظام السداسي عشري، واسم الخوارزمية `ML-DSA-87 (FIPS 204)`، وحكم `pqc_hybrid_verify`.
- في المستكشف: افتح https://explore.qore.network، وحوّله إلى **Testnet**، وابحث عن معرّف معاملتك.

## الحزم المستخدمة {#packages}

| الحزمة | الإصدار | الاستخدام |
| --- | --- | --- |
| `@qorechain/qorex-types` | 0.1.0 (مثبّت) | `getQorexNative` و`qorexSignAndBroadcast` |
| `@qorechain/sdk` | ^0.13.0 | مذكورة كاعتمادية؛ والصفحة نفسها تستخدم استدعاءات REST عادية |
| `react`, `react-dom` | ^18.3.1 | الواجهة |
| `@vitejs/plugin-react` | ^4.3.0 | إضافة Vite لـ React |
| `vite` | ^5.4.0 | خادم التطوير والبناء |
| `typescript` | ^5.6.3 | فحص الأنواع |

## الكود المصدري {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/03-hybrid-inspector
