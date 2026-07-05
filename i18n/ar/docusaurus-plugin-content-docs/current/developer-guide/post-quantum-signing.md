---
slug: /developer-guide/post-quantum-signing
title: التوقيع ما بعد الكمومي
sidebar_label: التوقيع ما بعد الكمومي
sidebar_position: 8
---

# التوقيع ما بعد الكمومي

`qorechain-pqc` هي مكتبة التشفير ما بعد الكمومي مفتوحة المصدر **القائمة على المعايير فقط** التي تقف خلف QoreChain. توفّر للمحافظ والمُدمِجين والأدوات نفس الأوليات (primitives) التي تستخدمها السلسلة بالضبط — في ست لغات، بواجهة برمجية واحدة متسقة، **مثبتة التوافق على مستوى البايت** عبر مجموعة مشتركة من متجهات الاختبار عبر اللغات.

تغلّف المكتبة تطبيقات مدقَّقة لـ**معايير NIST النهائية**. وهي **لا** تبتكر مخططًا مخصصًا: فالمتغير غير القياسي هو بالضبط ما يكسر قابلية التشغيل البيني (توقيع يُنتَج في مكان ما لن يتحقق في مكان آخر). يتم التحقق من كل ربط لغوي مقابل نفس المتجهات، بحيث إن توقيع ML-DSA المُنتَج بلغة ما يتحقق في كل لغة أخرى، وتتطابق الأسرار المشتركة لـ ML-KEM عبر اللغات الست جميعها، وتكون خلاصات SHAKE-256 متطابقة.

* **المستودع:** [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc)
* **الترخيص:** Apache-2.0

## الأوليات

| الأولية | المعيار | الدور | المستويات (الافتراضي بخط **عريض**) |
| --- | --- | --- | --- |
| **ML-DSA** | FIPS-204 | التوقيعات الرقمية | 44 · 65 · **87** |
| **ML-KEM** | FIPS-203 | تغليف المفاتيح | 512 · 768 · **1024** |
| **SHAKE-256** | FIPS-202 | تجزئة قابلة لتمديد المخرجات | — |

هذه هي نفس الأوليات التي تشغّلها QoreChain على مستوى البروتوكول: توقيعات **ML-DSA-87 (Dilithium-5)**، وتغليف المفاتيح **ML-KEM-1024**، و**SHAKE-256** كتجزئة التطبيق الافتراضية. راجع [الأمان ما بعد الكمومي](/architecture/post-quantum-security) لمعرفة كيف تستخدمها السلسلة.

### الأحجام (بالبايت)

اختر مستوى الأمان وفق ميزانيتك من حيث الحجم/الأمان.

| المخطط | الأمان | المفتاح العام | التوقيع / النص المشفَّر |
| --- | --- | --- | --- |
| ML-DSA-44 | L2 | 1312 | 2420 |
| ML-DSA-65 | L3 | 1952 | 3309 |
| **ML-DSA-87** | L5 | 2592 | 4627 |
| ML-KEM-512 | L1 | 800 | 768 |
| ML-KEM-768 | L3 | 1184 | 1088 |
| **ML-KEM-1024** | L5 | 1568 | 1568 |

> لا يمكنك جعل معيار NIST أصغر مع بقائه قياسيًا. يمتلك ML-DSA-87 أحجام مفاتيح/توقيعات ثابتة وبايتات ثابتة — و«تحسينه» يُنتج متغيرًا غير قياسي لا يستطيع أي تطبيق آخر التحقق منه. لتقليص البصمة على السلسلة، استخدم الروافع المذكورة أدناه بدلًا من تعديل المخطط.

## اللغات والحزم

تعرض كل لغة نفس الواجهة البرمجية، وكل واحدة مدعومة بتطبيق مدقَّق مختلف. هذا ما يضمن التوافق على مستوى البايت — فالخلفيات المستقلة تتفق على المعيار.

| اللغة | الحزمة | التثبيت | مدعومة بـ |
| --- | --- | --- | --- |
| JavaScript / TypeScript | `@qorechain/pqc` (npm) | `npm i @qorechain/pqc` | [@noble/post-quantum](https://github.com/paulmillr/noble-post-quantum) |
| Rust | `qorechain-pqc` (crates.io) | `cargo add qorechain-pqc` | `fips204` · `fips203` · `sha3` |
| Python | `qorechain-pqc` (PyPI) | `pip install qorechain-pqc` (الاستيراد باسم `qorpqc`) | [liboqs-python](https://github.com/open-quantum-safe/liboqs-python) |
| Go | `github.com/qorechain/qorechain-pqc/go` | `go get github.com/qorechain/qorechain-pqc/go` | [Cloudflare CIRCL](https://github.com/cloudflare/circl) |
| C | `c/` (مكتبة ساكنة + ترويسة) | البناء من [المستودع](https://github.com/qorechain/qorechain-pqc) | [liboqs](https://github.com/open-quantum-safe/liboqs) + OpenSSL |
| Java | `io.github.qorechain:qorechain-pqc` (Maven Central) | `io.github.qorechain:qorechain-pqc:0.1.1` | [Bouncy Castle](https://www.bouncycastle.org/) |

:::info التوفر
روابط JavaScript وRust وPython وGo وJava اللغوية كلها **منشورة** بالإصدار **0.1.1** — ثبّتها مباشرة من npm وcrates.io وPyPI ووكيل وحدات Go وMaven Central باستخدام الأوامر أعلاه. توزيعة Python تُثبَّت باسم `qorechain-pqc` لكنها **تُستورَد باسم `qorpqc`**. حزمة **Java** متوفرة على Maven Central باسم `io.github.qorechain:qorechain-pqc:0.1.1` (بخلفية Bouncy Castle). ربط **C** هو مكتبة ساكنة + ترويسة تبنيها بنفسك من [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc).
:::

## التوقيع الحتمي (حرج للإجماع) {#deterministic-signing}

اعتبارًا من الإصدار **0.1.1**، تُنتج `sign()` متغير ML-DSA **الحتمي** (FIPS-204 §3.4، حيث تكون عشوائية التوقيع 32 بايتًا صفرية) في **الروابط الست جميعها** — وهذا هو المتغير الوحيد الذي تقبله السلسلة. مُحقِّق المعاملات في QoreChain **يرفض توقيعات ML-DSA المُحوَّطة (العشوائية)**، لذا يفشل التوقيع المُحوَّط على السلسلة رغم أنه يتحقق تشفيريًا.

حقائق أساسية:

* **لا تغيّر الإعداد الافتراضي.** التوقيع الحتمي حرج للإجماع؛ وكل ربط لغوي يوثّقه على هذا الأساس.
* المخرجات الحتمية **متطابقة على مستوى البايت عبر الروابط الست جميعها** لنفس المفتاح والرسالة — وهو أمر مثبَّت عبر متجهات اختبار مشتركة عبر اللغات.
* يظل التوقيع المُحوَّط متاحًا كخيار **اشتراك صريح** في كل ربط (مثل `{hedged: true}` في JavaScript، و`sign_hedged` في Rust، و`mldsaSignHedged` في Java، و`sign(..., hedged=True)` في Python) لحالات الاستخدام خارج السلسلة — التوقيعات المُحوَّطة **غير مقبولة من السلسلة**.
* كان الإصدار 0.1.0 من ربط JavaScript يوقّع بالوضع المُحوَّط افتراضيًا — إذا بنيت أدوات معاملات على 0.1.0، **فقم بالترقية إلى 0.1.1**؛ فالمعاملات الموقَّعة بالإعداد الافتراضي القديم تُرفض على السلسلة.

## الاشتقاق الحتمي للمفاتيح والاسترداد {#key-derivation}

يربط الاشتقاق القياسي في المنظومة مفتاح ML-DSA-87 بالحساب، بحيث يكون **قابلًا للاسترداد من العبارة الاستذكارية (mnemonic) للحساب وحدها**:

```
seed = SHAKE-256("qorechain:pqc:v1|" + cosmosAddress + "|" + mnemonic)
(publicKey, secretKey) = mldsa.keygen(seed)
```

كل أداة منشورة (`@qorechain/wallet-adapter` و`@qorechain/sdk` و`@qorechain/chain-bridge` ≥0.1.1) تشتق هذا المفتاح نفسه، بحيث تُنتج عبارة استذكارية واحدة مفتاحًا واحدًا بصرف النظر عن الأداة المستخدمة. استرد مفتاحًا عبر سطر الأوامر (العبارة الاستذكارية عبر stdin):

```bash
qorechaind tx pqc recover-key mykey qor1youraddress...
# legacy tooling derivation (shake256(mnemonic) only, unbound to the address):
qorechaind tx pqc recover-key mykey qor1youraddress... --derivation bridge
```

## تدوير المفاتيح (نفس الخوارزمية) {#key-rotation}

اعتبارًا من إصدار السلسلة **v3.1.85**، تقوم **`MsgRotatePQCKey`** بتدوير مفتاح ML-DSA-87 الخاص بالحساب **ضمن نفس الخوارزمية** — بينما كان التسجيل سابقًا لمرة واحدة فقط، وكانت `MigratePQCKey` تعبر بين الخوارزميات فحسب. استخدمها لترحيل مفتاح مشتق بالطريقة القديمة إلى الاشتقاق القانوني المرتبط بالعنوان، أو لسحب مفتاح مُخترَق من الخدمة.

التدوير **موقَّع توقيعًا مزدوجًا**: يوقّع كل من المفتاح القديم والمفتاح الجديد الرسالة مفصولة النطاق `"qorechain-pqc-rotate-v1|chainId|algorithm|account|oldPubHex|newPubHex"`. إعادة التشغيل (replay) مستحيلة بنيويًا — فبمجرد التدوير، لم يعد المفتاح القديم يطابق المفتاح المسجَّل، وبالتالي لا يمكن للرسالة نفسها أن تُطبَّق مجددًا. التدوير عملية **مقصورة على المفتاح الجذري فقط** (لا يمكن تفويضها أبدًا إلى [مُوثِّق](/developer-guide/account-abstraction#authenticators))، والمعاملة نفسها لا تزال موقَّعة توقيعًا هجينًا بالمفتاح *القديم*، ما يثبت الملكية الحالية.

أمر سطر أوامر بخطوة واحدة (العبارة الاستذكارية عبر stdin؛ يسترد المفتاح القديم، ويشتق المفتاح الجديد أو يولّده، ويوقّع توقيعًا مزدوجًا، ويبث المعاملة):

```bash
# migrate a legacy-derived key to the canonical derivation:
qorechaind tx pqc rotate-key --old-derivation bridge --new-derivation adapter \
  --from mykey --chain-id qorechain-vladi -o json -y

# rotate to a brand-new random key (compromise recovery):
qorechaind tx pqc rotate-key --old-derivation adapter --new-random \
  --from mykey --chain-id qorechain-vladi -o json -y
```

في الشيفرة، توفّر `@qorechain/wallet-adapter` (≥0.1.7) و`@qorechain/sdk` (≥0.7.0) نفس المسار:

```js
import { rotatePqcKeyMsgFromMnemonic } from "@qorechain/wallet-adapter";

// Builds the dual-signed MsgRotatePQCKey migrating shake256(mnemonic) -> canonical:
const msg = await rotatePqcKeyMsgFromMnemonic({
  mnemonic, address: "qor1youraddress...", chainId: "qorechain-vladi",
});
// Sign & broadcast with the account's normal hybrid signer (old key cosigns the envelope).
```

بعد نجاح التدوير، يوقّع المفتاح الجديد (الرمز 0) ويُرفض المفتاح القديم (الرمز 21 في `pqc`).

## واجهة برمجية متسقة

توفّر كل لغة نفس الواجهة:

```text
keygen()                              -> (publicKey, secretKey)
sign(secretKey, message)              -> signature
verify(publicKey, message, signature) -> bool

kem.keygen()                          -> (publicKey, secretKey)
kem.encapsulate(publicKey)            -> (cipherText, sharedSecret)
kem.decapsulate(secretKey, cipherText)-> sharedSecret

shake256(data, outLen=32)             -> digest
```

### البداية السريعة (JavaScript / TypeScript)

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

تتوفر صادرات خاصة بكل مستوى عندما لا يكون الافتراضي هو ما تريده: `mldsa44/65/87` و`mlkem512/768/1024` (‏`mldsa` / `mlkem` هما افتراضيا المستوى L5).

روابط **Rust وGo وC وPython وJava** تعكس هذا بالضبط. على سبيل المثال:

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

## أدوات مساعدة للبلوكشين

بالإضافة إلى الأوليات الخام، تعرض المكتبة أداتين مساعدتين يحتاجهما المُدمِجون للتفاعل مع حسابات QoreChain ومعاملاتها.

### `pubkeyHash(pk, len=20)`

أداة تسجيل من نوع **الدفع إلى تجزئة المفتاح العام** (pay-to-pubkey-hash). تُنتج تجزئة SHAKE-256 قصيرة (20–32 بايتًا) للمفتاح العام. النمط: خزّن `pubkeyHash` فقط في حالة الحساب واطلب المفتاح العام الكامل في المعاملة. تبقى حالة الحساب صغيرة جدًا بصرف النظر عن المفتاح الذي يتراوح حجمه بين 1 و2.5 كيلوبايت.

### `hybridSignBytes(bodyWithoutPqcExt, authInfo)`

تأطير **بايتات التوقيع بالامتداد الهجين** المتوافق مع محافظ QoreChain. يُنتج هذا بالضبط البايتات التي يجب توقيعها بـ ML-DSA-87 (Dilithium-5) لتكوين النصف ما بعد الكمومي من المعاملة الهجينة.

هذا هو الجزء الذي تستخدمه المحافظ والمُدمِجون لإنتاج **التوقيع الهجين المطلوب** على مسار معاملات cosmos. اعتبارًا من إصدار السلسلة الحالي، التوقيعات الهجينة **مطلوبة افتراضيًا** (`hybrid_signature_mode = required`، و`allow_classical_fallback = false`): يجب أن تحمل كل معاملة على مسار cosmos توقيع Dilithium-5 إلى جانب توقيعها الكلاسيكي secp256k1. راجع [الأمان ما بعد الكمومي](/architecture/post-quantum-security) للاطلاع على نموذج الإنفاذ.

يُحسب التوقيع الكلاسيكي secp256k1 على بايتات التوقيع القياسية (التي **تستثني** امتداد PQC)، ويُحسب توقيع ML-DSA-87 ويُرفق كامتداد `PQCHybridSignature`. ولأن بايتات التوقيع الكلاسيكية تستثني الامتداد، يبقى التوقيع الكلاسيكي صالحًا سواء فهم المُحقِّق الجزء ما بعد الكمومي أم لا.

هناك ثلاث طرق لإنتاج هذا التوقيع الهجين:

* **سطر الأوامر** — يُرفق `qorechaind tx pqc cosign` توقيع Dilithium-5 المصاحب بالمعاملة (بعد `qorechaind tx pqc gen-key`). راجع [أوامر المعاملات](/cli-reference/transaction-commands).
* **حزمة QoreChain SDK** — تقوم `buildHybridTx` (مع `includePqcPublicKey`) بالعمل المكافئ في TypeScript/Python/Go/Rust. راجع [حسابات SDK وتوقيع PQC](/sdk/concepts/accounts-pqc).
* **`qorechain-pqc` مباشرة** — استخدم `hybridSignBytes` لتأطير بايتات التوقيع و`mldsa.sign` لإنتاج توقيع Dilithium-5، عندما تبني أدوات خارج SDK بإحدى اللغات الست المدعومة.

## تحسين البصمة على السلسلة

مفاتيح ML-DSA وتوقيعاتها كبيرة بالمعايير الكلاسيكية. ولأن بايتات المعيار ثابتة، فإن الطريقة لإبقاء البصمة على السلسلة صغيرة هي استخدام هذه الروافع الثلاث — ولا يغيّر أي منها المعيار:

1. **اختر مستوى الأمان بتروٍّ.** توقيعات ML-DSA-65 (المستوى L3) أصغر بنحو 28% من ML-DSA-87 (المستوى L5) وتظل قوية جدًا؛ ونصوص ML-KEM-768 المشفَّرة أصغر من 1024. اختر بحسب حالة الاستخدام.
2. **الدفع إلى تجزئة المفتاح العام.** خزّن `pubkeyHash(pk)` فقط (20–32 بايتًا من SHAKE-256) في حالة الحساب واطلب المفتاح العام الكامل في المعاملة. تبقى حالة الحساب صغيرة جدًا بصرف النظر عن حجم المفتاح.
3. **تحقّق من التوقيعات ثم تخلّص منها.** يجب أن يوجد التوقيع في المعاملة (بيانات الكتلة) لكن لا ينبغي أبدًا كتابته في شجرة الحالة الدائمة.

> **لماذا لا يوجد Falcon؟** كان FN-DSA (Falcon) سيمنح توقيعات أصغر، لكنه **مستبعَد** عمدًا: فـ FN-DSA لا يزال *مسودة* في FIPS-206 (غير نهائية)، والمكتبة القائمة على المعايير فقط لا تشحن إلا المعايير المكتملة. يمكن إعادة النظر فيه بعد اكتمال FIPS-206.

## مواضيع ذات صلة

* [الأمان ما بعد الكمومي](/architecture/post-quantum-security) — كيف تستخدم السلسلة هذه الأوليات وتفرض التوقيعات الهجينة.
* [أوامر المعاملات](/cli-reference/transaction-commands) — مسار سطر الأوامر `tx pqc gen-key` / `tx pqc cosign`.
* [حسابات SDK وتوقيع PQC](/sdk/concepts/accounts-pqc) — المفاتيح والتوقيع الهجين من QoreChain SDK.
* [إعداد المحفظة](/getting-started/wallet-setup) — إنشاء الحسابات المدعومة بـ PQC وإدارتها.
