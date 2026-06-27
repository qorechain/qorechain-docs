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

> منشورة على npm باسم `create-qorechain-dapp` (`0.3.0`).

## القوالب

| القالب | الوصف |
| --- | --- |
| `evm-solidity` | عقد `Counter` بلغة Solidity + سكربت نشر/تفاعل بـ viem (`@qorechain/evm`). |
| `fullstack-web` | تطبيق لامركزي بـ Vite + React + TypeScript يقرأ الأرصدة واقتصاديات الرمز (`@qorechain/sdk`). |

## الخيارات

| الراية | الوصف |
| --- | --- |
| `-t, --template <name>` | القالب المراد استخدامه (`evm-solidity` \| `fullstack-web`). |
| `--network <name>` | إعداد الشبكة المسبق (`testnet` \| `mainnet`). |
| `--package-manager <pm>` | `pnpm` \| `npm` \| `yarn`. |
| `-y, --yes` | تخطّ المطالبات واستخدم الإعدادات الافتراضية. |
| `--no-install` | لا تثبّت التبعيات بعد إنشاء الهيكل. |
| `--local` | أعد كتابة تبعيات `@qorechain/*` إلى روابط `file:` محلية داخل مستودع SDK الموحّد. |
| `-h, --help` | إظهار المساعدة. |
| `-v, --version` | طباعة الإصدار. |

## التطوير المحلي مقابل مساحة العمل

تُنشَر حزم `@qorechain/*` على npm؛ وبمجرد نشرها يعمل `npm install`
العادي. قبل ذلك، استخدم `--local` لتوجيه المشروع المُنشأ
إلى حزم المستودع الموحّد (ابنها أولاً بـ `pnpm -r build`):

```bash
npx create-qorechain-dapp my-dapp --template fullstack-web --local
```
