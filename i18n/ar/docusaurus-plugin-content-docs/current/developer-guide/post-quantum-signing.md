---
slug: /developer-guide/post-quantum-signing
title: التوقيع ما بعد الكمّي
sidebar_label: التوقيع ما بعد الكمّي
sidebar_position: 8
---

# التوقيع ما بعد الكمّي

`qorechain-pqc` هي مكتبة التشفير ما بعد الكمّي مفتوحة المصدر و**القائمة على المعايير حصرًا** التي تقف خلف QoreChain. تمنح المحافظ والمكاملين والأدوات البدائيات نفسها التي تستخدمها السلسلة بالضبط — في ست لغات، بواجهة برمجية واحدة متّسقة، **مع إثبات التوافق على مستوى البايت** مقابل مجموعة متجهات اختبار مشتركة عبر اللغات.

تغلّف المكتبة تطبيقات مُدقّقة لـ **معايير NIST النهائية**. وهي **لا** تبتكر مخططًا مخصصًا: المتغير غير القياسي هو بالضبط ما يكسر التشغيل البيني (توقيع منتَج في مكان لن يجتاز التحقق في مكان آخر). كل ربط يُتحقق منه مقابل المتجهات نفسها، بحيث يجتاز توقيع ML-DSA منتَج بلغة واحدة التحقق في كل اللغات الأخرى، وتتطابق أسرار ML-KEM المشتركة عبر الست جميعها، وتكون ملخّصات SHAKE-256 متطابقة.

* **المستودع:** [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc)
* **الترخيص:** Apache-2.0

## البدائيات

| البدائية | المعيار | الدور | المستويات (الافتراضي **بخط عريض**) |
| --- | --- | --- | --- |
| **ML-DSA** | FIPS-204 | التوقيعات الرقمية | 44 · 65 · **87** |
| **ML-KEM** | FIPS-203 | تغليف المفاتيح | 512 · 768 · **1024** |
| **SHAKE-256** | FIPS-202 | تجزئة ذات خرج قابل للتمديد | — |

هذه هي البدائيات نفسها التي تُشغّلها QoreChain على مستوى البروتوكول: توقيعات **ML-DSA-87 (Dilithium-5)**، وتغليف مفاتيح **ML-KEM-1024**، و **SHAKE-256** كتجزئة التطبيق الافتراضية. راجع [الأمان ما بعد الكمّي](/architecture/post-quantum-security) لمعرفة كيف تستخدمها السلسلة.

### الأحجام (بايت)

اختر مستوى الأمان حسب موازنة الحجم/الأمان لديك.

| المخطط | الأمان | المفتاح العام | التوقيع / النص المشفّر |
| --- | --- | --- | --- |
| ML-DSA-44 | L2 | 1312 | 2420 |
| ML-DSA-65 | L3 | 1952 | 3309 |
| **ML-DSA-87** | L5 | 2592 | 4627 |
| ML-KEM-512 | L1 | 800 | 768 |
| ML-KEM-768 | L3 | 1184 | 1088 |
| **ML-KEM-1024** | L5 | 1568 | 1568 |

> لا يمكنك جعل معيار NIST أصغر مع بقائه قياسيًا. لـ ML-DSA-87 أحجام مفتاح/توقيع ثابتة وبايتات ثابتة — و«تحسينه» ينتج متغيرًا غير قياسي لا يستطيع أي تطبيق آخر التحقق منه. لتقليص البصمة على السلسلة، استخدم الأدوات أدناه بدلًا من تغيير المخطط.

## اللغات والحزم

كل لغة تكشف الواجهة البرمجية نفسها، كل منها مدعومة بتطبيق مُدقّق مختلف. هذا ما يضمن التوافق على مستوى البايت — خلفيات مستقلة تتفق على المعيار.

| اللغة | الحزمة | التثبيت | المدعومة بـ |
| --- | --- | --- | --- |
| JavaScript / TypeScript | `@qorechain/pqc` (npm) | `npm i @qorechain/pqc` | [@noble/post-quantum](https://github.com/paulmillr/noble-post-quantum) |
| Rust | `qorechain-pqc` (crates.io) | `cargo add qorechain-pqc` | `fips204` · `fips203` · `sha3` |
| Python | `qorechain-pqc` (PyPI) | `pip install qorechain-pqc` (import `qorpqc`) | [liboqs-python](https://github.com/open-quantum-safe/liboqs-python) |
| Go | `github.com/qorechain/qorechain-pqc/go` | `go get github.com/qorechain/qorechain-pqc/go` | [Cloudflare CIRCL](https://github.com/cloudflare/circl) |
| C | `c/` (static lib + header) | البناء من [المستودع](https://github.com/qorechain/qorechain-pqc) | [liboqs](https://github.com/open-quantum-safe/liboqs) + OpenSSL |
| Java | `io.github.qorechain:qorechain-pqc` (Maven Central) | `io.github.qorechain:qorechain-pqc:0.1.0` | [Bouncy Castle](https://www.bouncycastle.org/) |

:::info التوفّر
روابط JavaScript و Rust و Python و Go و Java كلها **منشورة** بالإصدار **0.1.0** — ثبّتها مباشرةً من npm و crates.io و PyPI ووكيل وحدة Go و Maven Central بالأوامر أعلاه. توزيع Python يُثبّت باسم `qorechain-pqc` لكنه **يُستورَد باسم `qorpqc`**. حزمة **Java** على Maven Central باسم `io.github.qorechain:qorechain-pqc:0.1.0` (خلفية Bouncy Castle). ربط **C** هو مكتبة ثابتة + ترويسة تبنيها من [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc).
:::

## واجهة برمجية متّسقة

كل لغة توفّر السطح نفسه:

```text
keygen()                              -> (publicKey, secretKey)
sign(secretKey, message)              -> signature
verify(publicKey, message, signature) -> bool

kem.keygen()                          -> (publicKey, secretKey)
kem.encapsulate(publicKey)            -> (cipherText, sharedSecret)
kem.decapsulate(secretKey, cipherText)-> sharedSecret

shake256(data, outLen=32)             -> digest
```

### بداية سريعة (JavaScript / TypeScript)

```js
import { mldsa, mlkem, shake256, pubkeyHash } from '@qorechain/pqc';

// ML-DSA-87 signatures
const { publicKey, secretKey } = mldsa.keygen();
const sig = mldsa.sign(secretKey, message);
mldsa.verify(publicKey, message, sig); // true

// ML-KEM-1024 key encapsulation
const { publicKey: ek, secretKey: dk } = mlkem.keygen();
const { cipherText, sharedSecret } = mlkem.encapsulate(ek);
mlkem.decapsulate(dk, cipherText); // === sharedSecret

// SHAKE-256 + blockchain helpers
shake256(data, 32);        // 32-byte digest
pubkeyHash(publicKey, 20); // pay-to-pubkey-hash
```

تتوفّر صادرات خاصة بكل مستوى عندما لا يكون الافتراضي هو ما تريده: `mldsa44/65/87` و `mlkem512/768/1024` (`mldsa` / `mlkem` هما افتراضيا L5).

روابط **Rust و Go و C و Python و Java** تعكس هذا تمامًا. على سبيل المثال:

```rust
// Rust
use qorechain_pqc::mldsa::default as mldsa;
let (pk, sk) = mldsa::keygen()?;
let sig = mldsa::sign(&sk, msg)?;
assert!(mldsa::verify(&pk, msg, &sig));
```

```go
// Go
pk, sk, _ := pqc.MLDSA.Keygen()
sig, _ := pqc.MLDSA.Sign(sk, msg)
pqc.MLDSA.Verify(pk, msg, sig) // true
```

## مساعِدات البلوكتشين

إلى جانب البدائيات الخام، تكشف المكتبة مساعِدَين يحتاجهما المكاملون للتفاعل مع حسابات ومعاملات QoreChain.

### `pubkeyHash(pk, len=20)`

مساعِد تسجيل **pay-to-pubkey-hash**. يُنتج تجزئة SHAKE-256 قصيرة (20–32 بايت) لمفتاح عام. النمط: خزّن `pubkeyHash` فقط في حالة الحساب واشترط المفتاح العام الكامل في المعاملة. تبقى حالة الحساب صغيرة جدًا بغضّ النظر عن المفتاح الذي يبلغ 1–2.5 كيلوبايت.

### `hybridSignBytes(bodyWithoutPqcExt, authInfo)`

تأطير **بايتات التوقيع للامتداد الهجين** المتوافق مع محافظ QoreChain. يُنتج هذا بالضبط البايتات التي يجب توقيعها بـ ML-DSA-87 (Dilithium-5) لتشكيل نصف PQC من المعاملة الهجينة.

هذا هو الجزء الذي تستخدمه المحافظ والمكاملون لإنتاج **التوقيع الهجين المطلوب** على مسار معاملة cosmos. اعتبارًا من إصدار السلسلة الحالي، التوقيعات الهجينة **مطلوبة افتراضيًا** (`hybrid_signature_mode = required`, `allow_classical_fallback = false`): يجب أن تحمل كل معاملة على مسار cosmos توقيع Dilithium-5 إلى جانب توقيعها الكلاسيكي secp256k1. راجع [الأمان ما بعد الكمّي](/architecture/post-quantum-security) لنموذج الإنفاذ.

يُحتسب توقيع secp256k1 الكلاسيكي على بايتات التوقيع القياسية (التي **تستثني** امتداد PQC)، ويُحتسب توقيع ML-DSA-87 ويُرفق بوصفه امتداد `PQCHybridSignature`. ولأن بايتات التوقيع الكلاسيكية تستثني الامتداد، يبقى التوقيع الكلاسيكي صالحًا سواء فهم المُتحقق جزء PQC أم لا.

هناك ثلاث طرق لإنتاج هذا التوقيع الهجين:

* **سطر الأوامر** — `qorechaind tx pqc cosign` يرفق توقيع Dilithium-5 المشترك بمعاملة (بعد `qorechaind tx pqc gen-key`). راجع [أوامر المعاملات](/cli-reference/transaction-commands).
* **QoreChain SDK** — `buildHybridTx` (مع `includePqcPublicKey`) يقوم بالمكافئ في TypeScript/Python/Go/Rust. راجع [حسابات SDK وتوقيع PQC](/sdk/concepts/accounts-pqc).
* **`qorechain-pqc` مباشرةً** — استخدم `hybridSignBytes` لتأطير بايتات التوقيع و `mldsa.sign` لإنتاج توقيع Dilithium-5، عندما تبني أدوات خارج SDK بإحدى اللغات الست المدعومة.

## تحسين البصمة على السلسلة

مفاتيح وتوقيعات ML-DSA كبيرة بالمقاييس الكلاسيكية. ولأن بايتات المعيار ثابتة، فإن طريقة إبقاء البصمة على السلسلة صغيرة هي استخدام هذه الأدوات الثلاث — ولا شيء منها يغيّر المعيار:

1. **اختر مستوى الأمان بتمعّن.** توقيعات ML-DSA-65 (L3) أصغر بنحو 28% من ML-DSA-87 (L5) وتبقى قوية جدًا؛ ونصوص ML-KEM-768 المشفّرة أصغر من 1024. اختر حسب حالة الاستخدام.
2. **pay-to-pubkey-hash.** خزّن `pubkeyHash(pk)` فقط (20–32 بايت من SHAKE-256) في حالة الحساب واشترط المفتاح العام الكامل في المعاملة. تبقى حالة الحساب صغيرة جدًا بغضّ النظر عن حجم المفتاح.
3. **توقيعات التحقق-ثم-التجاهل.** يجب أن يعيش التوقيع في المعاملة (بيانات الكتلة) لكن ينبغي ألا يُكتب أبدًا في شجرة الحالة الدائمة.

> **لماذا لا Falcon؟** كان FN-DSA (Falcon) ليعطي توقيعات أصغر، لكنه **مستبعد عمدًا**: FN-DSA هو *مسودة* FIPS-206 (ليست نهائية)، والمكتبة القائمة على المعايير حصرًا لا تشحن سوى المعايير النهائية. يمكن إعادة النظر فيه بمجرد اعتماد FIPS-206 نهائيًا.

## ذات صلة

* [الأمان ما بعد الكمّي](/architecture/post-quantum-security) — كيف تستخدم السلسلة هذه البدائيات وتُنفِذ التوقيعات الهجينة.
* [أوامر المعاملات](/cli-reference/transaction-commands) — تدفق سطر الأوامر `tx pqc gen-key` / `tx pqc cosign`.
* [حسابات SDK وتوقيع PQC](/sdk/concepts/accounts-pqc) — المفاتيح والتوقيع الهجين من QoreChain SDK.
* [إعداد المحفظة](/getting-started/wallet-setup) — إنشاء وإدارة حسابات مدعومة بـ PQC.
