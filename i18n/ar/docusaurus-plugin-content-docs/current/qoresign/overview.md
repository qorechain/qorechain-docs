---
slug: /qoresign/overview
title: نظرة عامة على QoreSign
sidebar_label: نظرة عامة
sidebar_position: 1
---

# QoreSign

QoreSign هو توقيع هجين يجمع secp256k1 وML-DSA-87 (FIPS 204) للمحافظ والخوادم الخلفية على QoreChain.

يتيح QoreSign لمحفظة غير محفظة QoreChain الأصلية أن تشتق مفتاح ML-DSA-87 لحساب ما، وأن توقّع معاملات المسار الأصلي بالمفتاحين معًا، وأن تتحقق محليًا من التواقيع الهجينة، وأن تحاكي المعاملة قبل توقيعها، وأن تنفّذ Sign In With QoreChain. وهو طبقة رقيقة فوق ارتباطات [`qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) ولا يضيف أي بدائيات تشفيرية خاصة به.

الإصدار الحالي هو **0.1.0**. يوجد الكود المصدري والأمثلة ونواقل الاختبار في مستودع [qorechain/qoresign](https://github.com/qorechain/qoresign).

## ما الذي يفعله QoreSign على كل مسار {#lanes}

| المسار | ما الذي يفعله QoreSign حاليًا |
|---|---|
| **الأصلي** (Cosmos SDK) | التوقيع الهجين والتحقق منه. تشترط الشبكة توقيع ML-DSA-87 افتراضيًا. |
| **EVM** | وضع الجاهزية للحوسبة الكمّية فقط: يسجّل الحساب مفتاح ML-DSA-87 ويفتح نافذة تفويض محدودة من المسار الأصلي. أما معاملات Ethereum نفسها فلا تحمل أي توقيع ML-DSA-87. |
| **SVM** | غير مفتوح على الشبكة بعد (`LANE_NOT_AVAILABLE`). |

يتطلب التوقيع الهجين على EVM أن تدعم الشبكة أولًا PQC لكل مسار على حدة. راجع [محافظ EVM: وضع الجاهزية للحوسبة الكمّية](/qoresign/guides/evm-quantum-ready).

## الحزم {#packages}

| اللغة | الحزمة | التثبيت |
|---|---|---|
| TypeScript | [`@qorechain/qoresign`](https://www.npmjs.com/package/@qorechain/qoresign) | `npm install @qorechain/qoresign` |
| Rust | [`qorechain-qoresign`](https://crates.io/crates/qorechain-qoresign) | `cargo add qorechain-qoresign` |
| Go | [`github.com/qorechain/qoresign/go`](https://pkg.go.dev/github.com/qorechain/qoresign/go) | `go get github.com/qorechain/qoresign/go` |
| Swift | [`QoreSign`](https://github.com/qorechain/qoresign) (حزمة Swift، iOS 16+، macOS 13+) | `.package(url: "https://github.com/qorechain/qoresign", from: "0.1.0")` |
| Kotlin / JVM | [`io.github.qorechain:qoresign`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) | `implementation("io.github.qorechain:qoresign:0.1.0")` |

تتحقق جميع التنفيذات الخمسة من نفسها مقابل [نواقل الاختبار](/qoresign/vectors) ذاتها.

## مثال {#example}

```ts
import {
  addressFromPublicKey,
  deriveCanonicalPqKey,
  deriveClassicalKey,
  signHybrid,
  verifyHybridTx,
} from "@qorechain/qoresign";

const classical = deriveClassicalKey({ mnemonic });                 // m/44'/118'/0'/0/0
const address = addressFromPublicKey(classical.publicKey, "secp256k1").bech32;
const pqKey = deriveCanonicalPqKey({ mnemonic, address });         // the key QoreChain wallets register

// bodyBytes / authInfoBytes / accountNumber come from the dApp's SignDoc
const signed = signHybrid({ chainId: "qorechain-vladi", accountNumber, bodyBytes, authInfoBytes, classicalKey: classical, pqKey });

verifyHybridTx({
  txBytes: signed.txBytes,
  chainId: "qorechain-vladi",
  accountNumber,
  classicalPublicKey: classical.publicKey,
  pqPublicKey: pqKey.publicKey,
}); // { valid: true, classical: true, pq: { valid: true, signBytesVersion: "v2" } }
```

توجد دوال الشبكة المساعدة (حالة المفتاح، والمحاكاة مع تغيّرات الأرصدة، والبث، والتحقق من تسجيل الدخول مقابل السلسلة) في `@qorechain/qoresign/network`.

## التوثيق {#documentation}

- [البدء السريع](/qoresign/quickstart): اشتقاق المفاتيح وتوقيع معاملة هجينة والتحقق منها في دقائق قليلة.
- الأدلة
  - [إضافة التوقيع الهجين إلى محفظة متوافقة مع Keplr](/qoresign/guides/keplr-compatible-wallets)
  - [Sign In With QoreChain: التحقق على الخادم](/qoresign/guides/sign-in)
  - [محافظ EVM: وضع الجاهزية للحوسبة الكمّية](/qoresign/guides/evm-quantum-ready)
  - [اشتقاق المفاتيح: المفاتيح القياسية ومسودة HD](/qoresign/guides/key-derivation)
  - [الأحجام والنقل](/qoresign/guides/sizes-and-transport)
- المواصفات
  - [توقيع المعاملات الهجين v1](/qoresign/spec/hybrid-signing-v1)
  - [Sign In With QoreChain v1](/qoresign/spec/siwq-v1)
  - [توقيع الرسائل v1](/qoresign/spec/message-signing-v1)
  - [اشتقاق مفاتيح ML-DSA-87](/qoresign/spec/hd-derivation-draft)
- [نواقل الاختبار](/qoresign/vectors)
- [الأمثلة](https://github.com/qorechain/qoresign/tree/main/examples)

مرجع واجهة البرمجة: في نسخة مستنسخة من المستودع، شغّل `pnpm -C packages/ts docs` (TypeScript) أو `cargo doc -p qorechain-qoresign` (Rust) أو `go doc github.com/qorechain/qoresign/go` (Go). تحاكي ارتباطات Swift وKotlin واجهة Rust البرمجية؛ راجع ملفي README لـ [Swift](https://github.com/qorechain/qoresign/tree/main/swift) و[Kotlin](https://github.com/qorechain/qoresign/tree/main/kotlin).

## النطاق {#scope}

يوقّع QoreSign محليًا. فهو لا يحتفظ بالمفاتيح نيابةً عنك، ولا يقوم بالتوقيع العتبي أو MPC، ولا يوقّع على المحافظ العتادية. تأتي تنفيذات ML-DSA-87 وsecp256k1 من `qorechain-pqc` (المبنية على `@noble/post-quantum` و`fips204` وCloudflare CIRCL) ومن `@noble/curves` و`k256` و`decred/secp256k1`.

## إدارة الإصدارات {#versioning}

QoreSign في مرحلة ما قبل 1.0: قد تغيّر الإصدارات الفرعية واجهة البرمجة، ويُدرج كل تغيير كاسر في [سجل التغييرات](https://github.com/qorechain/qoresign/blob/main/CHANGELOG.md). أما صيغ النقل فلها إصداراتها المستقلة (مواصفات `v1` والملف `vectors/qoresign-v1.json`) ولا تتغير ضمن الإصدار الواحد.

## المساهمة والأمان {#contributing}

راجع [CONTRIBUTING.md](https://github.com/qorechain/qoresign/blob/main/CONTRIBUTING.md). أبلغ عن الثغرات بشكل خاص كما هو موضح في [SECURITY.md](https://github.com/qorechain/qoresign/blob/main/SECURITY.md).

## الترخيص {#license}

[Apache-2.0](https://github.com/qorechain/qoresign/blob/main/LICENSE). حقوق النشر 2026 QoreChain Association.
