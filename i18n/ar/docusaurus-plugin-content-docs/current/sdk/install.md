---
slug: /sdk/install
title: التثبيت
sidebar_label: التثبيت
sidebar_position: 2
---

# التثبيت

ثبّت حزمة SDK الخاصة بلغتك. إن النواة المكتوبة بلغة TypeScript‏ (`@qorechain/sdk`)،
ومحوّلا EVM وSVM‏ (`@qorechain/evm` و`@qorechain/svm`)، وعدّة React‏
(`@qorechain/react`)، وعملاء Python وGo وRust وJava جميعها
**منشورة** في سجلّاتها مع تكافؤ كامل مع السلسلة الأصلية (رسائل منمّطة الأنواع،
والاستعلامات، ودورة حياة المعاملة، ومعاملات PQC الهجينة، واشتراكات
WebSocket). الإصدار الحالي هو **0.7.0**، وهو يضيف الحسابات الموحّدة الأصلية
بنمط eth، وإصلاح ترميز الامتداد الهجين الحرج على مستوى الإجماع، ومسارات
المصادقين (انظر [دليل المصادقين](/sdk/guides/authenticators)).
اختر لغتك أدناه.

:::caution الترقية من 0.6.0 أو ما قبله
أصلح إصدار SDK **0.6.1** خللًا حرجًا على مستوى الإجماع: كان امتداد جسم المعاملة
`/qorechain.pqc.v1.PQCHybridSignature` يُسلسل بصيغة JSON
داخل `Any.value` **وترفضه السلسلة عند CheckTx**. المعاملات الهجينة (PQC +
كلاسيكية) المبنية بإصدار SDK ‏≤ 0.6.0 تُرفض على السلسلة — قم بالترقية
إلى 0.6.1 أو أحدث في كل لغة تستخدمها.
:::

## TypeScript

الحزمة الأساسية:

```bash
npm i @qorechain/sdk
```

تستهدف Node.js 20 فما فوق وتأتي مزوّدة بـ ESM وCommonJS وتعريفات الأنواع.

### محوّل EVM

`@qorechain/evm` هو محوّل خفيف وآمن الأنواع فوق [viem](https://viem.sh).
تُعد viem **اعتمادية نظيرة (peer dependency)** — ثبّتها معه:

```bash
npm i @qorechain/evm viem
```

منشور على npm بالإصدار `0.7.0`.

### محوّل SVM

`@qorechain/svm` هو محوّل خفيف فوق
[`@solana/web3.js`](https://solana.com/docs/clients/javascript)، وهي
**اعتمادية نظيرة**:

```bash
npm i @qorechain/svm @solana/web3.js
```

منشور على npm بالإصدار `0.7.0`.

### عدّة React

`@qorechain/react` هي طبقة React الرسمية فوق `@qorechain/sdk` — مزوّد
(provider)، وخطافات (hooks)، ومكوّنا `ConnectButton` / `QuantumSafeBadge`.
تُعد `react` (‏>=18) اعتمادية نظيرة:

```bash
npm i @qorechain/react
```

منشورة على npm بالإصدار `0.7.0`. انظر [دليل عدّة React](/sdk/guides/react).

### أداة التهيئة (Scaffolder)

تقوم `create-qorechain-dapp` (على npm، الإصدار `0.7.0`) بتهيئة تطبيق dApp جاهز للتشغيل:

```bash
npm create qorechain-dapp@latest my-dapp
```

## Python

```bash
pip install qorechain-sdk
```

تتطلب Python 3.10 فما فوق. تأتي الحزمة مزوّدة بتلميحات الأنواع وعلامة `py.typed`.

> تُثبَّت التوزيعة باسم `qorechain-sdk` (منشورة على PyPI بالإصدار `0.7.0`)
> لكنها **تُستورد باسم `qorsdk`**:
>
> ```python
> import qorsdk
> ```

## Go

```bash
go get github.com/qorechain/qorechain-sdk/packages/go/...
```

تتطلب Go 1.23 فما فوق. استورد الحزم الفرعية التي تحتاجها، على سبيل المثال:

```go
import (
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/client"
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/accounts"
)
```

منشورة كوحدة Go مستقلة بذاتها (موسومة بـ `packages/go/v0.7.0`).

## Rust

```bash
cargo add qorechain-sdk
```

أو، لتتبّع مصادر `0.7.0` مباشرة من المستودع:

```toml
[dependencies]
qorechain-sdk = { git = "https://github.com/qorechain/qorechain-sdk" }
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

تتطلب Rust 1.74 فما فوق. عملاء القراءة غير متزامنين (Tokio). تُستورد الحزمة (crate) باسم
`qorechain`‏ (`use qorechain;`).

> منشورة على crates.io باسم `qorechain-sdk`. يقوم الأمر `cargo add qorechain-sdk` بتثبيت
> **أحدث حزمة منشورة**، وهي حاليًا متأخرة عن إصدار `0.7.0` —
> ثبّت من crates.io (أحدث إصدار منشور) أو من المستودع للحصول على أحدث
> واجهة.

## Java

Maven‏ (`pom.xml`):

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.7.0</version>
</dependency>
```

أو Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.7.0'
```

> منشورة على Maven Central باسم `io.github.qorechain:qorechain-sdk:0.7.0`.

## التالي

تابع إلى [البدء السريع](/sdk/quickstart) للاتصال وقراءة الحالة على السلسلة.
