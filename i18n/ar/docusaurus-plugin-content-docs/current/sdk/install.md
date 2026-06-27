---
slug: /sdk/install
title: التثبيت
sidebar_label: التثبيت
sidebar_position: 2
---

# التثبيت

ثبّت الـ SDK الخاص بلغتك. إنّ نواة TypeScript (`@qorechain/sdk`) ومحوّلي
EVM وSVM (`@qorechain/evm`، `@qorechain/svm`) وعدّة React
(`@qorechain/react`) وعملاء Python وGo وRust وJava جميعها
**منشورة** في سجلّاتها مع توافق كامل مع السلسلة الأصلية (الرسائل المُصنّفة،
والاستعلامات، ودورة حياة المعاملة، ومعاملات PQC الهجينة، واشتراكات
WebSocket). اختر لغتك أدناه.

## TypeScript

الحزمة الأساسية:

```bash
npm i @qorechain/sdk
```

تستهدف Node.js 20+ وتشحن ESM وCommonJS وتعريفات الأنواع.

### محوّل EVM

`@qorechain/evm` هو محوّل رقيق وآمن من حيث الأنواع فوق [viem](https://viem.sh).
إنّ viem هو **اعتمادية نظيرة (peer dependency)** — ثبّته معه:

```bash
npm i @qorechain/evm viem
```

منشور في npm بإصدار `0.5.0`.

### محوّل SVM

`@qorechain/svm` هو محوّل رقيق فوق
[`@solana/web3.js`](https://solana.com/docs/clients/javascript)، وهو
**اعتمادية نظيرة**:

```bash
npm i @qorechain/svm @solana/web3.js
```

منشور في npm بإصدار `0.5.0`.

### عدّة React

`@qorechain/react` هي طبقة React الرسمية فوق `@qorechain/sdk` — مزوّد،
وخطّافات (hooks)، ومكوّنا `ConnectButton` / `QuantumSafeBadge`.
إنّ `react` (>=18) هو اعتمادية نظيرة:

```bash
npm i @qorechain/react
```

منشور في npm بإصدار `0.5.0`. انظر [دليل عدّة React](/sdk/guides/react).

## Python

```bash
pip install qorechain-sdk
```

يتطلّب Python 3.10+. تشحن الحزمة تلميحات الأنواع وعلامة `py.typed`.

> يُثبَّت التوزيع باسم `qorechain-sdk` (منشور في PyPI بإصدار `0.5.0`)
> لكنّه **يُستورَد باسم `qorsdk`**:
>
> ```python
> import qorsdk
> ```

## Go

```bash
go get github.com/qorechain/qorechain-sdk/packages/go/...
```

يتطلّب Go 1.23+. استورد الحزم الفرعية التي تحتاجها، على سبيل المثال:

```go
import (
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/client"
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/accounts"
)
```

منشور كوحدة Go قائمة بذاتها بإصدار `packages/go/v0.5.0`.

## Rust

```bash
cargo add qorechain-sdk
```

أو في `Cargo.toml`:

```toml
[dependencies]
qorechain-sdk = "0.5"
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

يتطلّب Rust 1.74+. عملاء القراءة غير متزامنين (Tokio).

> منشور في crates.io باسم `qorechain-sdk` بإصدار `0.5.0`.

## Java

Maven (`pom.xml`):

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.5.0</version>
</dependency>
```

أو Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.5.0'
```

> منشور في Maven Central باسم `io.github.qorechain:qorechain-sdk:0.5.0`.

## التالي

تابع إلى [البدء السريع](/sdk/quickstart) للاتصال وقراءة الحالة على السلسلة.
