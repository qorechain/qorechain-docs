---
slug: /build-before-qday/workshop-1/apps/hybrid-inspector
title: Hybrid Inspector
sidebar_label: Hybrid Inspector
sidebar_position: 3
---

# Hybrid Inspector

Hybrid Inspector صفحة React صغيرة تعرض كيف يبدو التوقيع الهجين في QoreChain على شبكة الاختبار `qorechain-diana`. تربط محفظة QoreX، وترسل معاملة واحدة يوقّعها QoreX بـ secp256k1 وML-DSA-87 معًا، فتفتح الصفحة تلك المعاملة وتفصّلها: التوقيع الكلاسيكي، والتوقيع ما بعد الكمومي، وحكم السلسلة نفسها. ويمكنك أيضًا لصق تجزئة أي معاملة على شبكة الاختبار.

## ما الذي يُظهره {#what-it-shows}

- **توقيع هجين ML-DSA-87 + secp256k1 من صفحة ويب.** تسلّم الصفحة رسالة مرمّزة إلى QoreX عبر `qorexSignAndBroadcast`. يوقّع QoreX بالمفتاحين ويبث.
- **معاملة هجينة واحدة متحقَّق منها على السلسلة.** تقرأ الصفحة حدث `pqc_hybrid_verify` الخاص بالمعاملة من السلسلة. هذا الحدث هو إعلان السلسلة أنها فحصت التوقيع ما بعد الكمومي.
- **الأحجام ظاهرة.** التوقيع الكلاسيكي 64 بايت. وتوقيع ML-DSA-87 (FIPS 204) بحجم 4,627 بايت ويسافر في الامتداد `PQCHybridSignature` من المعاملة.

## خطوة بخطوة {#steps}

### 1. ثبّت الأدوات

تحتاج إلى متصفح مبني على Chromium (Chrome أو Edge أو Brave) وGit وNode.js 20 أو أحدث وpnpm.

- Git: https://git-scm.com/downloads
- Node.js 20+: https://nodejs.org (إصدار LTS مناسب)
- pnpm: `npm install -g pnpm`

افحص الإصدارات:

```sh
git --version
node --version     # v20.0.0 or higher
pnpm --version     # 9 or higher
```

### 2. ثبّت إضافة QoreX للمتصفح

ثبّت QoreX من متجر متصفحك. راجع [تكاملات QoreX](/developer-tools/qorex-integrations) و[متصفح dApp](/qorex/dapp-browser) للتفاصيل.

### 3. أنشئ حسابًا اختباريًا مؤقتًا في QoreX

لا تحتاج هذه الورشة إلى محفظتك الحقيقية أبدًا. في QoreX أنشئ حسابًا **جديدًا** (ملفًا شخصيًا جديدًا أو محفظة جديدة) لا يُستخدم إلا في هذا التمرين، وبدّله إلى شبكة الاختبار `qorechain-diana`. راجع [النشر في 5 دقائق](/getting-started/deploy-in-5-minutes#step-testnet) لطريقة التبديل. يعرض QoreX عبارة استرداد عند إنشاء الحساب: دوّنها على ورق، وأبقها سرية، ولا تعِد استخدامها على الشبكة الرئيسية. ليس للحساب قيمة خارج هذا التمرين.

انسخ عنوان الحساب (يبدأ بـ `qor1...`).

### 4. احصل على QOR اختبارية من الصنبور

1. افتح https://dashboard.qorechain.io/faucet وسجّل الدخول.
2. الصق عنوانك `qor1...` واطلب. تدفع المطالبة 100 QOR، مرة كل 24 ساعة لكل حساب.

### 5. احصل على الشيفرة

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/03-hybrid-inspector
```

### 6. ثبّت الاعتماديات

```sh
pnpm install
```

### 7. تأكد من أنه يُبنى

```sh
pnpm build
```

يفحص الأمر أنواع المشروع ثم يبنيه. وينتهي بـ `built in` ومعه الزمن.

### 8. شغّل الصفحة

```sh
pnpm dev
```

افتح http://localhost:5173 في المتصفح الذي ثبّتّ عليه QoreX. أضف `?tx=<HASH>` إلى العنوان (`http://localhost:5173?tx=<HASH>`) لفحص معاملة مباشرة. إن كان المنفذ 5173 مشغولًا، يطبع Vite المنفذ الذي يستخدمه بدلًا منه.

تمر نداءات REST عبر وكيل Vite الذي هو `/lcd` إلى `https://api-testnet.qore.host`، لأن نقطة REST العامة لا ترسل ترويسات CORS. تعمل الصفحة على شبكة الاختبار فقط، ولا حاجة إلى ملف `.env`.

### 9. اربط وأرسل وتحقق

1. انقر **Connect QoreX**. تعرض الصفحة عنوانك (`qor1...`) ورصيدك على شبكة الاختبار وهل مفتاح ML-DSA-87 مسجَّل. يسجّل QoreX المفتاح عند أول إرسال.
2. **أرسل** مبلغًا صغيرًا من QOR مع مذكرة. يعرض QoreX ما توقّعه ويطلب الموافقة.
3. تفحص الصفحة المعاملة تلقائيًا. ويمكنك أيضًا لصق تجزئة أي معاملة على شبكة الاختبار من 64 حرفًا.

## الشيفرة {#code}

الاتصال والإرسال:

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

`msgSendBytes` مرمّز protobuf صغير في `src/App.tsx` لرسالة `MsgSend` الخاصة بالبنك، لأن QoreX يستقبل الرسالة مرمّزة. تعلّم الصفحة المعاملة على أنها متحقَّق منها هجينًا عندما يكون رمزها 0، ويكون لحدث `pqc_hybrid_verify` الحالة `verified`، ويكون التوقيع ما بعد الكمومي بحجم 4,627 بايت.

## ما الذي يجب أن تراه {#result}

- تعرض الترويسة `qorechain-diana (testnet)` وارتفاع كتلة يواصل الزيادة.
- بعد الاتصال: عنوانك ورصيدك وحالة المفتاح.
- بعد الإرسال: تجزئة المعاملة ورمز النتيجة، ثم بطاقة الفحص مع المذكرة ونوع الرسالة والتوقيع الكلاسيكي البالغ 64 بايت وتوقيع ML-DSA-87 البالغ 4,627 بايت مع أولى بايتاته بالست عشري، واسم الخوارزمية `ML-DSA-87 (FIPS 204)`، وحكم `pqc_hybrid_verify`.
- في المستكشف: افتح https://explore.qore.network وبدّله إلى **Testnet** وابحث عن تجزئة معاملتك.

## الحزم المستخدمة {#packages}

| الحزمة | الإصدار | الاستخدام |
| --- | --- | --- |
| `@qorechain/qorex-types` | 0.1.0 (مثبّت) | `getQorexNative` و`qorexSignAndBroadcast` |
| `@qorechain/sdk` | ^0.13.0 | مدرجة كاعتمادية؛ تستخدم الصفحة نفسها نداءات REST عادية |
| `react`, `react-dom` | ^18.3.1 | الواجهة |
| `@vitejs/plugin-react` | ^4.3.0 | إضافة React لـ Vite |
| `vite` | ^5.4.0 | خادم التطوير والبناء |
| `typescript` | ^5.6.3 | فحص الأنواع |

## الشيفرة المصدرية {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/03-hybrid-inspector
