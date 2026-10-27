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

> منشورة على npm باسم `create-qorechain-dapp` (`0.10.0`). تعتمد ملفات
> `package.json` المُنشأة على `@qorechain/sdk` ‏`^0.10.0` (وقالب EVM على
> `@qorechain/evm` ‏`^0.8.0`). كان الإصدار 0.8.0 من أداة الهيكلة يكتب نطاقات `^0.3.0`،
> وهو ما يحلّه npm إلى إصدار 0.3 لا يستطيع التوقيع للشبكات الحيّة؛ وإن كنت قد
> أنشأت الهيكل بـ 0.8.0، فنفّذ `npm i @qorechain/sdk@latest`.

## القوالب

| القالب | الوصف |
| --- | --- |
| `evm-solidity` | عقد `Counter` بلغة Solidity + سكربت نشر/تفاعل بـ viem (`@qorechain/evm`). |
| `fullstack-web` | تطبيق لامركزي بـ Vite + React + TypeScript يقرأ الأرصدة واقتصاديات الرمز (`@qorechain/sdk`). |
| `rollup-app` | تطبيق rollup + سلسلة جانبية/paychain يستخدم `RollupClient` ومساعد multilayer (`@qorechain/sdk`). |

يُجري قالب `rollup-app` (أداة الهيكلة 0.10.0) تشغيلًا تجريبيًا افتراضيًا. ومع `QORE_BROADCAST=1`
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
| `-t, --template <name>` | القالب المراد استخدامه (`evm-solidity` \| `fullstack-web` \| `rollup-app`). |
| `--network <name>` | إعداد الشبكة المسبق (`testnet` \| `mainnet`). |
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
