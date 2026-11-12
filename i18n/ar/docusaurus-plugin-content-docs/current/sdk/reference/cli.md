---
slug: /sdk/reference/cli
title: واجهة الأوامر — create-qorechain-dapp
sidebar_label: CLI
sidebar_position: 2
---

# واجهة الأوامر: `create-qorechain-dapp`

أنشئ هيكل تطبيق QoreChain لامركزي جديد من قالب بدء رسمي.

```bash
# interactive
npm create qorechain-dapp my-dapp
# or
npx create-qorechain-dapp my-dapp

# non-interactive (CI)
npx create-qorechain-dapp my-dapp --template evm-solidity --yes --no-install
```

> منشورة على npm باسم `create-qorechain-dapp` (`0.14.0`، الذي يحمل أيضًا إصلاحات القوالب في 0.13.1). تعتمد ملفات
> `package.json` المُنشأة على `@qorechain/sdk` ‏`^0.14.0` (وقوالب EVM على
> `@qorechain/evm` ‏`^0.14.0`). كان الإصدار 0.8.0 من أداة الهيكلة يكتب نطاقات `^0.3.0`،
> وهو ما يحلّه npm إلى إصدار 0.3 لا يستطيع التوقيع للشبكات الحيّة؛ وإن كنت قد
> أنشأت الهيكل بـ 0.8.0، فنفّذ `npm i @qorechain/sdk@latest`.

## القوالب

| القالب | الوصف |
| --- | --- |
| `evm-solidity` | عقد `Counter` بلغة Solidity + سكربت نشر/تفاعل بـ viem (`@qorechain/evm`). شغّل السكربت بـ `pnpm run deploy` (وليس `pnpm deploy`، فهو أمر pnpm مختلف)؛ يقرأ `.env`، ويشرح README فتح نافذة EVM قبل النشر. |
| `fullstack-web` | تطبيق لامركزي بـ Vite + React + TypeScript يقرأ الأرصدة واقتصاديات الرمز (`@qorechain/sdk`). يمر REST عبر وكيل Vite باسم `/lcd` لأن REST العام لا يرسل ترويسات CORS، فيستدعي كود المتصفح `/lcd/...` أثناء التطوير. |
| `rollup-app` | تطبيق rollup + سلسلة جانبية/paychain يستخدم `RollupClient` ومساعد multilayer (`@qorechain/sdk`). |
| `foundry` | مشروع Foundry لمحرك EVM في QoreChain. يسجّل `pnpm window` مفتاح ML-DSA-87 للحساب ويفتح [نافذة تفويض EVM](/sdk/guides/evm#evm-window) قبل النشر (أُضيف في 0.11.0 الخاص بـ npm فقط). |
| `hardhat` | الشيء نفسه لـ Hardhat 3، مع `pnpm window status` و`register` و`open`. |
| `viem-wagmi` | تطبيق ويب لامركزي على viem وwagmi يستخدم سلسلتي `qorechain` و`qorechainTestnet` من `@qorechain/evm`. يثبّت viem على `~2.53.1` ويستخدم وكيل `/lcd` نفسه لـ REST. |
| `cosmwasm` | مشروع عقد على QoreChain Native (Wasm). على الشبكتين الحيّتين رفع الشيفرة بالحوكمة فقط؛ راجع [دليل QoreChain Native](/sdk/guides/cosmwasm). |

يُجري قالب `rollup-app` (منذ أداة الهيكلة 0.10.0) تشغيلًا تجريبيًا افتراضيًا. ومع `QORE_BROADCAST=1`
يشتق مفتاح ML-DSA-87 للحساب من عبارة الاسترجاع، ويسجّله مرة واحدة ويوقّع
توقيعًا هجينًا، وهو ما لم يكن القالب السابق قادرًا عليه. وقيم الـ rollup النموذجية فيه
(`profile: "default"`، والحصة) توضيحية: خذ أسماء الملفات التعريفية الحقيقية والحصة
من [الإعدادات المسبقة](/rollups/preset-profiles) ومن معاملات الوحدة الحيّة
قبل أن تبثّ.

يقرأ قالب `fullstack-web` نظرة اقتصاديات الرمز عبر `client.qor`، وهو
استدعاء JSON-RPC من نوع `qor_` لا تخدمه نقاط النهاية العامة، لذا تعرض تلك اللوحة خطأً على الشبكة الرئيسية
والتجريبية؛ أما قراءة الرصيد فتعمل. بدّله إلى قراءة REST
مثل `client.rest.getBurnStats()` للشبكات العامة.

## الخيارات

| الراية | الوصف |
| --- | --- |
| `-t, --template <name>` | القالب المراد استخدامه (`evm-solidity` \| `fullstack-web` \| `rollup-app` \| `foundry` \| `hardhat` \| `viem-wagmi` \| `cosmwasm`). |
| `--network <name>` | إعداد الشبكة المسبق (`testnet` \| `mainnet`). يكتب نقاط النهاية العامة للشبكة المختارة في ملف `.env` المولَّد (منذ 0.13.1). |
| `--package-manager <pm>` | `pnpm` \| `npm` \| `yarn`. |
| `-y, --yes` | تخطّ المطالبات واستخدم الإعدادات الافتراضية. |
| `--no-install` | لا تثبّت التبعيات بعد إنشاء الهيكل. |
| `--local` | أعد كتابة تبعيات `@qorechain/*` إلى روابط `file:` محلية داخل مستودع SDK الموحّد. |
| `-h, --help` | إظهار المساعدة. |
| `-v, --version` | طباعة الإصدار. |

## التطوير المحلي مقابل مساحة العمل

حزم `@qorechain/*` منشورة على npm، لذا يعمل `npm install`
العادي. استخدم `--local` لتوجيه المشروع المُنشأ
إلى حزم المستودع الموحّد بدلًا من ذلك (ابنها أولاً بـ `pnpm -r build`):

```bash
npx create-qorechain-dapp my-dapp --template fullstack-web --local
```
