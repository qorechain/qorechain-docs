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
WebSocket). خط الإصدارات الحالي هو **0.8**: إصدارات TypeScript وPython وRust
وJava عند **0.8.3**، ووحدة Go عند **v0.8.4**. اختر لغتك أدناه.

## ملاحظات الترقية {#upgrade}

:::danger استخدم SDK 0.8.1 أو أحدث على الشبكات الحيّة
تتحقّق الشبكتان العامتان من صيغة **sign-bytes الهجينة v2** (الموسومة بالنطاق
والمرتبطة بمعرّف السلسلة) وترفضان الصيغة القديمة بالرمز `pqc` رقم 21.
كل إصدار من الـ SDK قبل **0.8.0** يوقّع الصيغة القديمة، أمّا **0.8.0** فتبحث عن
التحوّل تحت اسم واحد فقط من اسمَي الترقية اللذين استخدمتهما الشبكتان (سجّلته
الشبكة الرئيسية باسم `v3.2.0`، والشبكة التجريبية باسم `v3.1.98` ثم لاحقًا `v3.2.0`)،
ولذلك توقّع الصيغة الخاطئة على الشبكة الرئيسية. استخدم **0.8.1 أو أحدث** في كل لغة؛
ويلزم **0.8.2 أو أحدث** لفتح
[نافذة تفويض EVM](/sdk/guides/evm#evm-window). تقبل البُناة الهجينة خيار
`signBytesVersion` (`"auto"` | `"v1"` | `"v2"`)؛ و`"auto"` يسأل الشبكة
ولذلك يحتاج إلى نقطة نهاية REST (`rest`) على
`qorechain-vladi` / `qorechain-diana`: فهو يرمي خطأً بدلًا من التخمين. انظر
[أي صيغة لبايتات التوقيع؟](/sdk/concepts/accounts-pqc#sign-bytes-versions).
:::

:::caution إصلاحات أقدم
أصلح إصدار SDK **0.6.1** خللًا حرجًا على مستوى الإجماع: كان امتداد جسم المعاملة
`/qorechain.pqc.v1.PQCHybridSignature` يُسلسل بصيغة JSON
داخل `Any.value` **وترفضه السلسلة عند CheckTx**. المعاملات الهجينة (PQC +
كلاسيكية) المبنية بإصدار SDK ‏≤ 0.6.0 تُرفض على السلسلة. وقد أزال الإصدار **0.8.0**
مساعِدات الحساب القائمة على توقيعات المحافظ (انظر
[الحسابات وتوقيع PQC](/sdk/concepts/accounts-pqc#phantom)).
:::

## TypeScript

الحزمة الأساسية:

```bash
npm i @qorechain/sdk
```

تستهدف Node.js 20 فما فوق وتأتي مزوّدة بـ ESM وCommonJS وتعريفات الأنواع.
وتستورد أمثلة المعاملات الهجينة في هذه الوثائق أيضًا `StargateClient` من
`@cosmjs/stargate` (`npm i @cosmjs/stargate`).

### محوّل EVM

`@qorechain/evm` هو محوّل خفيف وآمن الأنواع فوق [viem](https://viem.sh).
تُعد viem **اعتمادية نظيرة (peer dependency)** — ثبّتها معه:

```bash
npm i @qorechain/evm viem
```

منشور على npm بالإصدار `0.8.0`.

### محوّل SVM

`@qorechain/svm` هو محوّل خفيف فوق
[`@solana/web3.js`](https://solana.com/docs/clients/javascript)، وهي
**اعتمادية نظيرة**:

```bash
npm i @qorechain/svm @solana/web3.js
```

منشور على npm بالإصدار `0.8.0`.

### عدّة React

`@qorechain/react` هي طبقة React الرسمية فوق `@qorechain/sdk` — مزوّد
(provider)، وخطافات (hooks)، ومكوّنا `ConnectButton` / `QuantumSafeBadge`.
تُعد `react` (‏>=18) اعتمادية نظيرة:

```bash
npm i @qorechain/react
```

منشورة على npm بالإصدار `0.8.3`. انظر [دليل عدّة React](/sdk/guides/react).

### أداة التهيئة (Scaffolder)

تقوم `create-qorechain-dapp` (على npm، الإصدار `0.8.0`) بتهيئة تطبيق dApp جاهز للتشغيل:

```bash
npm create qorechain-dapp@latest my-dapp
```

تثبّت ملفات `package.json` المُولَّدة `@qorechain/sdk` / `@qorechain/evm` على
`^0.3.0`، وهو ما يحلّه npm إلى إصدار 0.3 لا يستطيع التوقيع للشبكات
الحيّة. بعد التهيئة، شغّل `npm i @qorechain/sdk@latest` (و
`npm i @qorechain/evm@latest` لقالب EVM). انظر
[مرجع CLI](/sdk/reference/cli).

## Python

```bash
pip install qorechain-sdk
```

تتطلب Python 3.10 فما فوق. تأتي الحزمة مزوّدة بتلميحات الأنواع وعلامة `py.typed`.

> تُثبَّت التوزيعة باسم `qorechain-sdk` (منشورة على PyPI بالإصدار `0.8.3`)
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

منشورة كوحدة Go مستقلة بذاتها (موسومة بـ `packages/go/v0.8.4`).

## Rust

```bash
cargo add qorechain-sdk
```

أو، لتتبّع رأس المستودع (repository head):

```toml
[dependencies]
qorechain-sdk = { git = "https://github.com/qorechain/qorechain-sdk" }
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

تتطلب Rust 1.74 فما فوق. عملاء القراءة غير متزامنين (Tokio). تُستورد الحزمة (crate) باسم
`qorechain`‏ (`use qorechain;`).

> منشورة على crates.io باسم `qorechain-sdk` (0.8.3)؛ يقوم الأمر `cargo add qorechain-sdk`
> بتثبيت أحدث إصدار.

## Java

Maven‏ (`pom.xml`):

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.8.3</version>
</dependency>
```

أو Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.8.3'
```

> منشورة على Maven Central باسم `io.github.qorechain:qorechain-sdk:0.8.3`. لا يحتوي
> Central على إصدار 0.8.0 أو 0.8.1، لذا استخدم 0.8.2 أو أحدث على الشبكات الحيّة.

## الحزم ذات الصلة {#related-packages}

| الحزمة | الغرض | الإصدار |
| --- | --- | --- |
| `@qorechain/wallet-adapter` | مساعِدات من جانب المحفظة: إنشاء المحافظ (`generateQoreWallet`)، والتوقيع الهجين بـ `eth_secp256k1` (`signHybridEth`، `QoreChainSigner`)، وتسجيل شبكة MetaMask (`addQoreEvmToWallet`)، وبُناة رسائل المصادِقين ونافذة EVM. الاعتماديات النظيرة: `@cosmjs/proto-signing` و`@cosmjs/stargate` `^0.32` | 0.3.0 |
| `@qorechain/chain-bridge` | عامل (worker) من جانب الخادم للأنظمة الخلفية: يشتق مفتاح PQC، ويوقّع هجينًا ويبثّ (`sendTokens` و`registerPqc` وغيرهما). مرّر `cosmosRest` | 0.2.2 |
| `@qorechain/pqc` | بدائيات ML-DSA / ML-KEM / SHAKE-256 المطابقة للمعايير فقط و`hybridSignBytes` (انظر [التوقيع ما بعد الكمّي](/developer-guide/post-quantum-signing)) | 0.2.1 |
| `@qorechain/handles` | حلّ `@handle` الموثَّق مع تثبيت الثقة عند أول استخدام (`HandleClient`) | 0.1.0 |
| `@qorechain/rdk` | عميل Rollup Development Kit (انظر [Rollups](/rollups/why)). إصدار npm (0.4.4) يوقّع المعاملات توقيعًا كلاسيكيًا فقط، وهو ما ترفضه الشبكات، فيستطيع القراءة لكن لا يستطيع الإرسال؛ والتوقيع الهجين موجود في 0.5.0، المتاح حاليًا على PyPI ووحدة Go فقط | 0.4.4 (npm) |

## التالي

تابع إلى [البدء السريع](/sdk/quickstart) للاتصال وقراءة الحالة على السلسلة.
