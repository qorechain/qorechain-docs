---
slug: /developer-guide/post-quantum-signing
title: التوقيع ما بعد الكمومي
sidebar_label: التوقيع ما بعد الكمومي
sidebar_position: 8
---

# التوقيع ما بعد الكمومي

`qorechain-pqc` هي مكتبة التشفير ما بعد الكمومي مفتوحة المصدر و**المعتمدة على المعايير فقط** التي تقف خلف QoreChain. توفّر للمحافظ والمتكاملين والأدوات نفس الأساسيات (primitives) التي تستخدمها السلسلة بالضبط — بست لغات، وبواجهة برمجية واحدة متسقة، **مثبتة التوافق على مستوى البايت** مقابل مجموعة مشتركة من متجهات الاختبار عبر اللغات.

تغلّف المكتبة تطبيقات مدقَّقة لـ**معايير NIST النهائية**. وهي **لا** تبتكر مخططًا مخصصًا: فالمتغير غير القياسي هو بالضبط ما يكسر قابلية التشغيل البيني (توقيع أُنتج في مكان ما لن يتم التحقق منه في مكان آخر). يتم التحقق من كل ارتباط لغوي مقابل نفس المتجهات، بحيث إن توقيع ML-DSA المُنتَج بلغة ما يتم التحقق منه في كل اللغات الأخرى، وتتطابق أسرار ML-KEM المشتركة عبر اللغات الست جميعها، وتكون خلاصات SHAKE-256 متطابقة.

* **المستودع:** [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc)
* **الترخيص:** Apache-2.0

## الأساسيات (Primitives)

| الأساسية | المعيار | الدور | المستويات (الافتراضي **بالخط العريض**) |
| --- | --- | --- | --- |
| **ML-DSA** | FIPS-204 | التوقيعات الرقمية | 44 · 65 · **87** |
| **ML-KEM** | FIPS-203 | تغليف المفاتيح | 512 · 768 · **1024** |
| **SHAKE-256** | FIPS-202 | دالة تجزئة ذات مخرجات قابلة للتمديد | — |

هذه هي نفس الأساسيات التي تشغّلها QoreChain على مستوى البروتوكول: توقيعات **ML-DSA-87 (Dilithium-5)**، وتغليف المفاتيح **ML-KEM-1024**، و**SHAKE-256** كدالة التجزئة التطبيقية الافتراضية. راجع [الأمان ما بعد الكمومي](/architecture/post-quantum-security) لمعرفة كيفية استخدام السلسلة لها.

### الأحجام (بالبايت)

اختر مستوى الأمان وفقًا لميزانيتك من حيث الحجم/الأمان.

| المخطط | الأمان | المفتاح العام | التوقيع / النص المشفَّر |
| --- | --- | --- | --- |
| ML-DSA-44 | L2 | 1312 | 2420 |
| ML-DSA-65 | L3 | 1952 | 3309 |
| **ML-DSA-87** | L5 | 2592 | 4627 |
| ML-KEM-512 | L1 | 800 | 768 |
| ML-KEM-768 | L3 | 1184 | 1088 |
| **ML-KEM-1024** | L5 | 1568 | 1568 |

> لا يمكنك جعل معيار NIST أصغر مع بقائه قياسيًا. يمتلك ML-DSA-87 أحجام مفاتيح/توقيعات ثابتة وبايتات ثابتة — و"تحسينه" ينتج متغيرًا غير قياسي لا يمكن لأي تطبيق آخر التحقق منه. لتقليص البصمة على السلسلة، استخدم الأدوات المذكورة أدناه بدلًا من تعديل المخطط.

## اللغات والحزم

تكشف كل لغة عن نفس الواجهة البرمجية، وكل منها مدعوم بتطبيق مدقَّق مختلف. هذا هو ما يضمن التوافق على مستوى البايت — خلفيات مستقلة تتفق على المعيار.

| اللغة | الحزمة | التثبيت | مدعومة بـ |
| --- | --- | --- | --- |
| JavaScript / TypeScript | `@qorechain/pqc` (npm) | `npm i @qorechain/pqc` | [@noble/post-quantum](https://github.com/paulmillr/noble-post-quantum) |
| Rust | `qorechain-pqc` (crates.io) | `cargo add qorechain-pqc` | `fips204` · `fips203` · `sha3` |
| Python | `qorechain-pqc` (PyPI) | `pip install qorechain-pqc` (الاستيراد باسم `qorpqc`) | [liboqs-python](https://github.com/open-quantum-safe/liboqs-python) |
| Go | `github.com/qorechain/qorechain-pqc/go` | `go get github.com/qorechain/qorechain-pqc/go` | [Cloudflare CIRCL](https://github.com/cloudflare/circl) |
| C | `c/` (مكتبة ثابتة + ملف ترويسة) | البناء من [المستودع](https://github.com/qorechain/qorechain-pqc) | [liboqs](https://github.com/open-quantum-safe/liboqs) + OpenSSL |
| Java | `io.github.qorechain:qorechain-pqc` (Maven Central) | `io.github.qorechain:qorechain-pqc:0.1.1` | [Bouncy Castle](https://www.bouncycastle.org/) |

:::info التوفر
ارتباطات JavaScript وRust وPython وGo وJava كلها **منشورة** بالإصدار **0.1.1** — ثبّتها مباشرة من npm وcrates.io وPyPI ووكيل وحدات Go وMaven Central باستخدام الأوامر أعلاه. توزيعة Python تُثبَّت باسم `qorechain-pqc` لكنها **تُستورد باسم `qorpqc`**. حزمة **Java** موجودة على Maven Central باسم `io.github.qorechain:qorechain-pqc:0.1.1` (بخلفية Bouncy Castle). ارتباط **C** عبارة عن مكتبة ثابتة + ملف ترويسة تبنيه من [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc).
:::

## التوقيع الحتمي (حرج للإجماع) {#deterministic-signing}

اعتبارًا من الإصدار **0.1.1**، تُنتج `sign()` متغير ML-DSA **الحتمي** (FIPS-204 §3.4، حيث تكون عشوائية التوقيع 32 بايتًا صفرية) في **الارتباطات الست جميعها** — وهذا هو المتغير الوحيد الذي تقبله السلسلة. مُتحقِّق المعاملات في QoreChain **يرفض توقيعات ML-DSA المحوّطة (العشوائية)**، لذا فإن التوقيع المحوّط يفشل على السلسلة رغم أنه يجتاز التحقق التشفيري.

حقائق أساسية:

* **لا تغيّر الإعداد الافتراضي.** التوقيع الحتمي حرج للإجماع؛ وكل ارتباط لغوي يوثّقه على هذا النحو.
* الناتج الحتمي **متطابق على مستوى البايت عبر الارتباطات الست جميعها** لنفس المفتاح والرسالة — مثبَّت عبر متجهات اختبار مشتركة بين اللغات.
* يبقى التوقيع المحوّط متاحًا كخيار **صريح يجب تفعيله يدويًا** في كل ارتباط (مثل `{hedged: true}` في JavaScript، و`sign_hedged` في Rust، و`mldsaSignHedged` في Java، و`sign(..., hedged=True)` في Python) لحالات الاستخدام خارج السلسلة — التوقيعات المحوّطة **غير مقبولة من السلسلة**.
* الإصدار 0.1.0 من ارتباط JavaScript كان يوقّع محوّطًا افتراضيًا — إذا كنت قد بنيت أدوات معاملات على 0.1.0، **فقم بالترقية إلى 0.1.1**؛ المعاملات الموقَّعة بالإعداد الافتراضي القديم تُرفض على السلسلة.

## واجهة برمجية متسقة

توفّر كل لغة نفس السطح البرمجي:

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

تتوفر تصديرات خاصة بكل مستوى عندما لا يكون الافتراضي هو ما تريده: `mldsa44/65/87` و`mlkem512/768/1024` (`mldsa` / `mlkem` هما الافتراضيان لمستوى L5).

ارتباطات **Rust وGo وC وPython وJava** تعكس ذلك بالضبط. على سبيل المثال:

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

## أدوات مساعدة للبلوكتشين

بالإضافة إلى الأساسيات الخام، تكشف المكتبة عن أداتين مساعدتين يحتاجهما المتكاملون للتعامل مع حسابات ومعاملات QoreChain.

### `pubkeyHash(pk, len=20)`

أداة مساعدة لتسجيل نمط **الدفع إلى تجزئة المفتاح العام (pay-to-pubkey-hash)**. تُنتج تجزئة SHAKE-256 قصيرة (20–32 بايتًا) لمفتاح عام. النمط: خزّن `pubkeyHash` فقط في حالة الحساب واطلب المفتاح العام الكامل في المعاملة. تبقى حالة الحساب صغيرة جدًا بغض النظر عن المفتاح ذي الحجم 1–2.5 كيلوبايت.

### `hybridSignBytes(bodyWithoutPqcExt, authInfo)`

تأطير **بايتات التوقيع للامتداد الهجين** المتوافق مع محافظ QoreChain. تُنتج هذه الدالة بالضبط البايتات التي يجب توقيعها بـ ML-DSA-87 (Dilithium-5) لتشكيل النصف الخاص بـ PQC من معاملة هجينة.

هذا هو الجزء الذي تستخدمه المحافظ والمتكاملون لإنتاج **التوقيع الهجين المطلوب** على مسار معاملات cosmos. اعتبارًا من إصدار السلسلة الحالي، التوقيعات الهجينة **مطلوبة افتراضيًا** (`hybrid_signature_mode = required`، `allow_classical_fallback = false`): كل معاملة على مسار cosmos يجب أن تحمل توقيع Dilithium-5 إلى جانب توقيعها الكلاسيكي secp256k1. راجع [الأمان ما بعد الكمومي](/architecture/post-quantum-security) للاطلاع على نموذج الإنفاذ.

يُحسب التوقيع الكلاسيكي secp256k1 على بايتات التوقيع القياسية (التي **تستبعد** امتداد PQC)، ويُحسب توقيع ML-DSA-87 ويُرفق كامتداد `PQCHybridSignature`. ولأن بايتات التوقيع الكلاسيكية تستبعد الامتداد، يبقى التوقيع الكلاسيكي صالحًا سواء فهم المتحقِّق الجزء الخاص بـ PQC أم لا.

هناك ثلاث طرق لإنتاج هذا التوقيع الهجين:

* **واجهة سطر الأوامر (CLI)** — يقوم الأمر `qorechaind tx pqc cosign` بإرفاق التوقيع المشترك Dilithium-5 بالمعاملة (بعد `qorechaind tx pqc gen-key`). راجع [أوامر المعاملات](/cli-reference/transaction-commands).
* **حزمة QoreChain SDK** — تقوم `buildHybridTx` (مع `includePqcPublicKey`) بالمكافئ في TypeScript/Python/Go/Rust. راجع [حسابات SDK وتوقيع PQC](/sdk/concepts/accounts-pqc).
* **استخدام `qorechain-pqc` مباشرة** — استخدم `hybridSignBytes` لتأطير بايتات التوقيع و`mldsa.sign` لإنتاج توقيع Dilithium-5، عندما تبني أدوات خارج SDK بإحدى اللغات الست المدعومة.

## تحسين البصمة على السلسلة

مفاتيح وتوقيعات ML-DSA كبيرة بالمعايير الكلاسيكية. ولأن بايتات المعيار ثابتة، فإن الطريقة لإبقاء البصمة على السلسلة صغيرة هي استخدام هذه الأدوات الثلاث — التي لا يعدّل أي منها المعيار:

1. **اختر مستوى الأمان عن قصد.** توقيعات ML-DSA-65 (L3) أصغر بنحو 28% من ML-DSA-87 (L5) وتبقى قوية جدًا؛ والنصوص المشفَّرة في ML-KEM-768 أصغر من 1024. اختر حسب حالة الاستخدام.
2. **الدفع إلى تجزئة المفتاح العام.** خزّن `pubkeyHash(pk)` فقط (20–32 بايتًا من SHAKE-256) في حالة الحساب واطلب المفتاح العام الكامل في المعاملة. تبقى حالة الحساب صغيرة جدًا بغض النظر عن حجم المفتاح.
3. **تحقَّق من التوقيعات ثم تخلَّص منها.** يجب أن يبقى التوقيع في المعاملة (بيانات الكتلة) لكن لا ينبغي أبدًا كتابته في شجرة الحالة الدائمة.

> **لماذا لا يوجد Falcon؟** كان FN-DSA (Falcon) سيمنح توقيعات أصغر، لكنه **مستبعَد** عمدًا: FN-DSA هو *مسودة* FIPS-206 (وليس نهائيًا)، والمكتبة المعتمدة على المعايير فقط لا تشحن سوى المعايير النهائية. يمكن إعادة النظر فيه بمجرد اعتماد FIPS-206 نهائيًا.

## مواضيع ذات صلة

* [الأمان ما بعد الكمومي](/architecture/post-quantum-security) — كيف تستخدم السلسلة هذه الأساسيات وتفرض التوقيعات الهجينة.
* [أوامر المعاملات](/cli-reference/transaction-commands) — تدفق واجهة سطر الأوامر `tx pqc gen-key` / `tx pqc cosign`.
* [حسابات SDK وتوقيع PQC](/sdk/concepts/accounts-pqc) — المفاتيح والتوقيع الهجين من حزمة QoreChain SDK.
* [إعداد المحفظة](/getting-started/wallet-setup) — إنشاء وإدارة حسابات مدعومة بـ PQC.
