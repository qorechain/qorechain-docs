---
slug: /build-before-qday/workshop-1
title: "الورشة 1: معاملتك الأولى الموقّعة هجينًا"
sidebar_label: "الورشة 1"
sidebar_position: 2
date: 2026-11-12
---

# الورشة 1: معاملتك الأولى الموقّعة هجينًا

يأخذك هذا الدليل من حاسوب لم يُثبَّت عليه شيء إلى معاملة واحدة موقّعة بمفتاحين معًا ومتحقَّق منها على شبكة QoreChain الاختبارية. كل شيء يعمل في بيئتك الخاصة، بحساب اختباري مؤقت.

## ما الذي نبنيه {#what-we-built}

مشروع Solidity كامل يُولَّد بأمر واحد، ويُختبر، ويُنشر على شبكة QoreChain الاختبارية، ثم تُرسل معاملة واحدة موقّعة بـ **مفتاحين معًا** وتفحصها السلسلة.

ما يُظهره:

- **التوقيع الهجين.** تحمل المعاملة توقيعًا كلاسيكيًا من نوع secp256k1 وتوقيعًا ما بعد كمومي من نوع ML-DSA-87 (NIST FIPS 204).
- **معاملة هجينة واحدة متحقَّق منها على السلسلة.** يتحقق المدققون من التوقيعين. تقرأ الدليل من نقطة REST العامة (الامتداد `PQCHybridSignature` والحدث `pqc_hybrid_verify`) ومن المستكشف.
- **نافذة تفويض EVM.** لا تستطيع معاملة إيثريوم أن تحمل توقيعًا ما بعد كمومي، لذلك تسجّل على QoreChain مفتاح ML-DSA-87 مرة واحدة ثم تفتح نافذة قصيرة، برسالة موقّعة هجينًا، تُقبل خلالها معاملات EVM العادية الخاصة بك. راجع [النشر في 5 دقائق](/getting-started/deploy-in-5-minutes) لشرح الفكرة بعمق.

هذا بالضبط ما يطلبه مستوى Quantum Pass.

## المتطلبات {#prerequisites}

تحتاج إلى حاسوب بنظام macOS أو Linux أو Windows (مع WSL)، وطرفية، ومتصفح ويب. ثبّت هذه الأدوات أولًا وافحص إصدار كل منها:

| الأداة | الإصدار | الفحص | التثبيت |
| --- | --- | --- | --- |
| Node.js | 22 أو أحدث (يتطلبه Hardhat 3) | `node -v` | [nodejs.org](https://nodejs.org) |
| pnpm | 9 أو أحدث | `pnpm -v` | `npm install -g pnpm` (أو `corepack enable`) |
| curl | أي إصدار | `curl --version` | مضمّن في macOS وLinux |
| jq (اختياري) | أي إصدار | `jq --version` | [jqlang.org](https://jqlang.org)، يُستخدم فقط لتصفية المخرجات في الخطوة 6 |

تحتاج أيضًا إلى حساب على لوحة QoreChain لاستخدام الصنبور (الخطوة 4).

الشبكة ونقاط النهاية العامة المستخدمة في هذا الدليل:

| الخدمة | العنوان |
| --- | --- |
| شبكة الاختبار | `qorechain-diana`، معرّف سلسلة EVM هو 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` |
| المستكشف | `https://explore.qore.network` (بدّل إلى Testnet) |
| الصنبور | `https://dashboard.qorechain.io/faucet` (يتطلب تسجيل الدخول) |

:::caution مفاتيح اختبارية مؤقتة فقط
استخدم مفاتيح أُنشئت لهذا التمرين وتحمل QOR اختبارية فقط. لا تضع أبدًا في `.env` مفتاحًا أو رمز استرداد لحساب يحمل أموالًا حقيقية، ولا تُودِع `.env` في git أبدًا.
:::

## الخطوات {#steps}

### الخطوة 1: افحص أدواتك {#step-1}

1. افتح طرفية.
2. شغّل الفحوص من الجدول أعلاه:

```bash
node -v
pnpm -v
```

يجب أن يطبع `node -v` الإصدار `v22` أو أعلى. إن لم يكن كذلك، ثبّت إصدارًا أحدث من Node.js قبل المتابعة.

### الخطوة 2: ولّد المشروع وشغّل الاختبارات {#step-2}

1. أنشئ المشروع في مجلد جديد. ينزّل أمر `npx` أداة التوليد، لذلك يحتاج إلى اتصال بالإنترنت:

```bash
npx create-qorechain-dapp@latest qday-demo -t hardhat --network testnet --package-manager pnpm
```

2. ادخل إلى المجلد وشغّل الاختبارات. تعمل على سلسلة محلية محاكاة ولا ترسل شيئًا:

```bash
cd qday-demo
pnpm test
```

يجب أن ترى `Done! Created qday-demo`، ثم `2 passing` من الاختبارات.

3. تفحّص ما حصلت عليه: `contracts/Counter.sol` و`ignition/modules/Counter.ts` و`scripts/window.ts` (المساعد الخاص بنافذة التفويض) و`hardhat.config.ts` مع الشبكة `qorechainTestnet` (معرّف السلسلة 9800). المزيد عن القوالب: [المولّدات وCLI](/developer-tools/scaffolders-and-cli) و[مجموعة أدوات مطوري السلسلة](/developer-tools/chain-dev-sdk).

### الخطوة 3: أنشئ حسابًا اختباريًا مؤقتًا {#step-3}

يحتاج الحساب إلى سرّين: مفتاح خاص بنمط إيثريوم، و**رمز استرداد** (يبدأ بـ `QRC1`) يُشتق منه مفتاح ML-DSA-87 ما بعد الكمومي. يولّد الأمر أدناه الاثنين بمكتبات ثبّتها المشروع أصلًا ويكتبهما مباشرة في ملف `.env` جديد، فلا يُطبع شيء على شاشتك ولا يُلصق في أي مكان. شغّله من داخل مجلد `qday-demo`:

```bash
node --input-type=module -e '
import { generatePrivateKey } from "viem/accounts";
import { generatePqcRecoveryCode } from "@qorechain/sdk";
import { writeFileSync } from "node:fs";
writeFileSync(".env", `PRIVATE_KEY=${generatePrivateKey()}\nQORE_PQC_RECOVERY_CODE=${generatePqcRecoveryCode()}\nQORE_NETWORK=testnet\n`);
console.log(".env written");
'
```

يطبع `.env written`. ملاحظات:

- يستبدل الأمر ملف `.env` النائب الذي أنشأته أداة التوليد. شغّله مرة واحدة. أي تشغيل جديد ينشئ حسابًا مختلفًا ومفتاح ما بعد كم مختلفًا.
- احتفظ بملف `.env` كما هو: المفتاح الخاص نفسه ورمز الاسترداد نفسه يعطيانك الحساب نفسه في كل مرة. إن ضاع الملف فابدأ من جديد بحساب جديد.
- تفضّل عبارة استرداد؟ ضع `QORE_MNEMONIC="your twelve words"` في `.env` بدلًا من السطرين أعلاه. مع عبارة الاسترداد يُشتق المفتاحان من العبارة نفسها ولا حاجة إلى رمز استرداد. استخدم عبارة أُنشئت لهذا التمرين فقط.

اطلب الآن من المشروع عنوان حسابك الجديد:

```bash
pnpm window status
```

يجب أن ترى ثلاثة أسطر:

```text
account:  0x...  (qor1...)
PQC key:  not registered (run: pnpm window register)
window:   none (run: pnpm window open)
```

انسخ العنوان `qor1...`. هذا هو العنوان الذي تعطيه للصنبور.

### الخطوة 4: احصل على QOR اختبارية من الصنبور {#step-4}

1. افتح [الصنبور](https://dashboard.qorechain.io/faucet) في متصفحك وسجّل الدخول.
2. الصق عنوانك `qor1...` (أو اختر **Use my address** إن كانت اللوحة تعرفه).
3. اختر **Request Tokens**. تعرض البطاقة **Tokens Sent!** مع 100 QOR، إضافة إلى رموز اختبار المهرجان، ورابط **View on Explorer**.

يدفع الصنبور مرة واحدة كل 24 ساعة لكل حساب ولكل عنوان. الكميات الدقيقة في صفحة [الصنبور](/dashboard/faucet). عد إلى الطرفية وتحقق من أن الحساب صار موجودًا على السلسلة:

```bash
pnpm window status
```

صار الناتج يعطي جوابًا بدل الفشل برسالة "does not exist on chain yet".

### الخطوة 5: سجّل مفتاحك، وافتح النافذة، وانشر {#step-5}

1. سجّل مفتاح ML-DSA-87 الخاص بك. هذه خطوة تُنفَّذ مرة واحدة لكل حساب، وتُوقَّع بالمفتاح الكلاسيكي كما تشترط السلسلة عند التسجيل:

```bash
pnpm window register
```

يطبع `registered: <HASH>`.

2. افتح نافذة التفويض. وهذه نفسها معاملة **موقّعة هجينًا**:

```bash
pnpm window open
```

يطبع `opened: <HASH>`، ثم سطرًا مثل `window: 600 blocks, 5 txs, 3750000 uqor (value plus fees)`. دوّن تجزئة `opened:` لأنك ستتحقق منها في الخطوة 6.

3. انتظر نحو 10 ثوانٍ. فقد قدّمت النافذة رقم nonce الخاص بالحساب وتنتظر Hardhat التأكيدات.
4. ابنِ العقد وانشره:

```bash
pnpm build
pnpm deploy:testnet
```

أجب بـ `y` على "Confirm deploy to network qorechainTestnet (9800)?". يجب أن ترى `CounterModule#Counter - 0x...`.

### الخطوة 6: تحقق من التوقيع الهجين على السلسلة {#step-6}

معاملة `opened:` من الخطوة 5 وُقّعت بالمفتاحين. استبدل `<HASH>` بتلك التجزئة واقرأها من نقطة REST العامة:

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

ابحث عن:

1. `tx_response.code` يساوي `0`.
2. في جسم المعاملة، الامتداد `PQCHybridSignature` الذي يحمل توقيع ML-DSA-87: **4,627 بايت**، إلى جانب توقيع secp256k1 البالغ 64 بايت.
3. في `tx_response.events`، الحدث `pqc_hybrid_verify` بالسمة `status` المضبوطة على `verified`. لطباعة هذا الحدث فقط (يتطلب `jq`):

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> \
  | jq '.tx_response.events[] | select(.type=="pqc_hybrid_verify")'
```

ثم اطّلع عليها في المستكشف:

1. افتح [explore.qore.network](https://explore.qore.network).
2. بدّل محدد الشبكة إلى **Testnet**.
3. ابحث عن التجزئة. تعرض صفحة المعاملة أمان التوقيع على أنه آمن كموميًا ومتحقَّق منه على السلسلة، بخوارزمية ML-DSA-87 (FIPS 204).

هذا هو الدليل: فحص المدققون التوقيعين معًا.

## ما الذي يجب أن تراه {#what-you-should-see}

| أين | ماذا |
| --- | --- |
| بعد الخطوة 2 | `Done! Created qday-demo` و`2 passing` |
| بعد الخطوة 3 | `.env written`، ثم سطر `account:` يحمل عنوانيك `0x...` و`qor1...` |
| بعد الخطوة 4 | **Tokens Sent!** في الصنبور وحساب موجود في `pnpm window status` |
| بعد الخطوة 5 | `registered: <HASH>` و`opened: <HASH>`، ثم `CounterModule#Counter - 0x...` |
| بعد الخطوة 6 | `code` يساوي 0، وتوقيع ML-DSA-87 بحجم 4,627 بايت، و`pqc_hybrid_verify` مع `status` يساوي `verified`، في ناتج REST وفي المستكشف على Testnet |

## الحزم المستخدمة {#published}

كما هي معلنة في `package.json` المولَّد:

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

تثبّت أداة التوليد أيضًا إضافات Hardhat toolbox وIgnition وkeystore المدرجة في `package.json` المولَّد.

## استكشاف الأخطاء وإصلاحها {#troubleshooting}

| ما تراه | السبب | ما تفعله |
| --- | --- | --- |
| `HHE10402` أو "wait for confirmations" مباشرة بعد فتح النافذة | فتح النافذة قدّم رقم nonce الحساب | شغّل `pnpm deploy:testnet` مرة أخرى |
| "EVM authorisation window exhausted" أو "no window" | نفدت معاملات النافذة أو كتلها، أو أنها مقيّدة بعقد آخر (النافذة المقيّدة بعقد آخر تمنع النشر) | شغّل `pnpm window open` لفتح نافذة جديدة، وانتظر نحو 10 ثوانٍ، ثم انشر مرة أخرى |
| "account has no PQC key and classical fallback is disabled" | لم يسجّل الحساب مفتاح ML-DSA-87 | شغّل `pnpm window register` أولًا، ثم افتح النافذة |
| "does not exist on chain yet" | ليس في الحساب QOR بعد | احصل على QOR من الصنبور (الخطوة 4) |
| "Rate Limit Reached" في الصنبور، أو لا رموز بعد 30 ثانية | مطالبة واحدة كل 24 ساعة لكل حساب ولكل عنوان، والطلبات تُخدَّم واحدًا تلو الآخر | انتظر بضع ثوانٍ وأعد المحاولة، أو انتظر انتهاء فترة التهدئة |
| يتوقف `pnpm window` برسالة عن رمز استرداد مفقود | في `.env` قيمة `PRIVATE_KEY` دون `QORE_PQC_RECOVERY_CODE` | أعد الخطوة 3، أو استخدم `QORE_MNEMONIC` |
| يرفض Hardhat البدء | إصدار Node.js أقدم من 22 | ثبّت Node.js 22 أو أحدث وشغّل `pnpm install` مرة أخرى |

## تطبيقات الأمثلة {#example-apps}

التدفق نفسه، من عدة لغات وواجهات أمامية. كل واحد منها يوقّع هجينًا. كلها في المستودع العام [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday)، مجلد `workshop-1`. احصل عليه بالأمر:

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1
```

كل صفحة تطبيق هي دليل كامل مستقل من البداية إلى النهاية.

| التطبيق | اللغة | الصفحة |
| --- | --- | --- |
| Q-Day Counter | TypeScript، Solidity | [qday-counter](/build-before-qday/workshop-1/apps/qday-counter) |
| Q-Day Guestbook | TypeScript، Solidity | [qday-guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) |
| Hybrid Inspector | TypeScript | [hybrid-inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) |
| Q-Day Pay | Rust | [rust-qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) |
| Q-Day Tip Jar | Java | [java-tipjar](/build-before-qday/workshop-1/apps/java-tipjar) |
| Q-Day Airdrop | Python | [python-airdrop](/build-before-qday/workshop-1/apps/python-airdrop) |

الأدوات التي تقف خلف هذه التطبيقات مدرجة في صفحة [الأدوات](/build-before-qday/workshop-1/kits). لاستخدام محفظة QoreX مع dApp في المتصفح، راجع [QoreX](/qorex/overview).
