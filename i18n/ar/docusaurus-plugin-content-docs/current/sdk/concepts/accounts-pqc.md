---
slug: /sdk/concepts/accounts-pqc
title: الحسابات وتوقيع PQC
sidebar_label: الحسابات و PQC
sidebar_position: 2
---

# الحسابات وتوقيع PQC

تُشتق حسابات QoreChain من عبارة استرجاع (mnemonic) واحدة وفق BIP-39. يوجد
نموذجان للحسابات، وكلاهما مدعوم بالكامل:

- **الاشتقاق الهرمي (HD) لكل مسار (النموذج القديم/الافتراضي)** — تُنتج عبارة
  الاسترجاع نفسها حسابًا أصليًا (coin type 118) وحساب EVM (coin type 60)
  وحساب SVM (coin type 501) عبر مسارات اشتقاق مستقلة. ثلاثة مفاتيح، ثلاثة
  عناوين.
- **الحسابات الموحّدة eth-native** (SDK 0.6.0، الشبكة v3.1.83) — مفتاح
  `eth_secp256k1` واحد هو هوية واحدة من 20 بايت تُعرض بجميع ترميزات العناوين
  الثلاثة، مع رصيد واحد مشترك. راجع
  [الحسابات الموحّدة](#unified-accounts).

## الاشتقاق الهرمي HD (النموذج القديم/الافتراضي، coin type 118)

```ts
import {
  generateMnemonic,
  validateMnemonic,
  deriveNativeAccount,
  deriveEvmAccount,
  deriveSvmAccount,
} from "@qorechain/sdk";

const mnemonic = generateMnemonic(); // 12 words; pass 256 for 24 words

const native = await deriveNativeAccount(mnemonic);
console.log(native.address); // "qor1..."  (secp256k1, bech32)

const evm = await deriveEvmAccount(mnemonic);
console.log(evm.address); // "0x..."   (EIP-55 checksummed)

const svm = await deriveSvmAccount(mnemonic);
console.log(svm.address); // base58 ed25519 public key
```

يتم التحقق من صحة عبارة الاسترجاع (الكلمات **و** مجموع التحقق checksum) قبل
اشتقاق أي مفتاح، لذا فإن أي خطأ إملائي يُطلق استثناءً بدلًا من إنتاج حساب خاطئ
بصمت. يمكنك التحقق صراحةً باستخدام `validateMnemonic(mnemonic)`.

### مخططات الاشتقاق

| النوع | المنحنى | المسار | العنوان |
| --- | --- | --- | --- |
| native | secp256k1 | `m/44'/118'/0'/0/{i}` | bech32 بالبادئة `qor` لقيمة `ripemd160(sha256(pubkey))` |
| evm | secp256k1 | `m/44'/60'/0'/0/{i}` | `0x` + `keccak256(pubkey)[-20:]`، وفق EIP-55 |
| svm | ed25519 | `m/44'/501'/{i}'/0'` | ترميز base58 للمفتاح العام ذي 32 بايت |

مرِّر فهرس حساب لاشتقاق حسابات إضافية. في TypeScript:

```ts
const second = await deriveNativeAccount(mnemonic, { accountIndex: 1 });
```

في Python/Go/Rust يكون الفهرس وسيطًا موضعيًا
(`derive_native_account(mnemonic, 1)` / `DeriveNativeAccount(mnemonic, 1)` /
`derive_native_account(&mnemonic, 1)`).

### ملاحظة حول اختبارات الإجابة المعروفة

مخططات الاشتقاق حتمية (deterministic) ومغطاة باختبارات الإجابة المعروفة
(known-answer tests) عبر جميع حزم SDK الأربع، لذا تُنتج عبارة الاسترجاع نفسها
عناوين متطابقة في TypeScript وPython وGo وRust. وهذا يتيح لك الاشتقاق بلغة
والتحقق بلغة أخرى.

> هذا الاشتقاق لكل مسار (`deriveNativeAccount` عند coin type 118، إضافةً إلى
> `deriveEvmAccount` / `deriveSvmAccount`) هو النموذج **القديم/الافتراضي**
> ويبقى مدعومًا ودون تغيير. أما الحسابات الموحّدة أدناه فهي نموذج هوية إضافي
> اختياري.

## الحسابات الموحّدة (eth-native) {#unified-accounts}

منذ SDK ‏**0.6.0** (الشبكة v3.1.83)، تشتق
`deriveUnifiedAccount(mnemonic, index = 0)` مفتاح `eth_secp256k1` واحدًا على
مسار Ethereum الهرمي `m/44'/60'/0'/0/{index}`، وتكون بايتات عنوانه العشرون
(`keccak256(pubkey)[12:]`) هي الهوية نفسها معروضة بثلاث طرق:

| المسار | الترميز |
| --- | --- |
| Native | bech32 بالبادئة `qor` ‏(`qor1…`) |
| EVM | `0x` + ترميز سداسي عشري بمجموع تحقق مختلط الحالة وفق EIP-55 |
| SVM | ترميز base58 للبايتات العشرين مع حشو 12 بايت صفرية على اليمين (32 بايت) |

الإيداع إلى **أي** من العناوين الثلاثة يصل إلى رصيد **واحد**، والمفتاح يُنفق
على كل مسار:

```ts
import {
  deriveUnifiedAccount,
  qoreAddresses,
  addressesFrom20,
} from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);

account.cosmos;       // "qor1…"   bech32, Native lane
account.evm;          // "0x…"     EIP-55 hex, EVM lane
account.svm;          // "<base58>" 32-byte SVM address (addr20 + 12 zero bytes)
account.addressBytes; // the raw 20 bytes shared by all three
account.publicKey;    // 33-byte compressed secp256k1 public key
account.pqc;          // { publicKey, secretKey } — ML-DSA-87, derived below

// Decode any ONE encoding into all three:
const all = qoreAddresses({ evm: account.evm });
all.cosmos; // qor1…
all.svm;    // base58

// or straight from the raw 20 bytes:
const same = addressesFrom20(account.addressBytes);
```

تقوم `unifiedAccountFromSeed(seed32)` بالأمر نفسه انطلاقًا من مفتاح خاص
secp256k1 خام من 32 بايت.

### اشتقاق بذرة PQC

يُشتق زوج مفاتيح ML-DSA-87 الخاص بالحساب بشكل حتمي و**مرتبط بالعنوان**:

```text
pqcSeed = shake256("qorechain:pqc:v1|" + cosmosAddress + "|" + mnemonic, 32)
```

وبذلك يمكن استرجاعه من `{ address, mnemonic }` وهو متطابق عبر جميع حزم SDK
اللغوية الخاصة بـ QoreChain. (بالنسبة إلى `unifiedAccountFromSeed`، تكون خانة
عبارة الاسترجاع هي `"seed:" + hex(seed32)`.)

### الإرسال على مسار Native باستخدام مفتاح eth

يوقّع الحساب الموحّد معاملات مسار Native بمخطط `eth_secp256k1`: التوقيع
الكلاسيكي هو secp256k1 على **keccak256** لبايتات SignDoc (وليس sha256)،
ويستخدم المفتاح العام في `SignerInfo` عنوان النوع (type URL)
`/cosmos.evm.crypto.v1.ethsecp256k1.PubKey`. أما المسار الهجين
(`signHybridEth`) فيُرفق إضافةً إلى ذلك امتداد `PQCHybridSignature` الخاص بـ
ML-DSA-87 — وهو مطلوب على الشبكات الحية:

```ts
import { EthNativeSigner, deriveUnifiedAccount } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
const signer = new EthNativeSigner(account); // signMode: "hybrid" by default

// `transport` is anything with broadcastTx (e.g. a connected client).
await signer.bankSend(
  transport,
  "qor1recipient…",
  [{ denom: "uqor", amount: "1000000" }], // 1 QOR
  { chainId: "qorechain-vladi", accountNumber, sequence, fee },
);
```

لمزيد من التحكم منخفض المستوى، تُعيد `signHybridEth(params)` /
`signClassicalEth(params)` بايتات `TxRaw` المُجمّعة ومخرجات التوقيع، بينما
تقرأ `accountAuthInfo(baseAccount)` قيمتي `account_number` / `sequence` من
حساب يستخدم مفتاحه العام على السلسلة عنوان النوع `eth_secp256k1`. المسار
الكلاسيكي فقط مخصص لرسالة `MsgRegisterPQCKeyV2` التي تُنفَّذ مرة واحدة وتُعفى
من متطلب التوقيع الهجين عند التمهيد؛ استخدم المسار الهجين لكل شيء آخر.

:::caution قم بالترقية إلى SDK 0.6.1+ للمعاملات الهجينة
أصلح إصدار SDK ‏**0.6.1** خطأ ترميز حرجًا على مستوى الإجماع: كان امتداد
جسم المعاملة `/qorechain.pqc.v1.PQCHybridSignature` يُسلسل بصيغة JSON داخل
`Any.value`، وكانت السلسلة **ترفض تلك المعاملات عند CheckTx** (خطأ تحليل
المعاملة). أصبح الآن مرمَّزًا بصيغة protobuf (تبدأ قيمة الامتداد بـ `0x08`)
في اللغات الخمس جميعها. أي معاملة هجينة — بما في ذلك مسار eth-native —
مبنية بإصدار SDK ‏≤ 0.6.0 تُرفض على السلسلة: قم بالترقية إلى 0.6.1 أو أحدث.
:::

### Phantom ‏(P1a): حساب موحّد دون تصدير مفتاح

تشتق `connectPhantomUnified()` ‏(TypeScript) حسابًا موحّدًا قانونيًا **غير
وصائي** من توقيع Phantom حتمي: يوقّع المستخدم رسالة ثابتة مفصولة بالنطاق
(domain-separated) بمفتاح ed25519 الخاص بـ Phantom، وتُستخدم
`shake256(signature, 32)` كبذرة للحساب.

```ts
import {
  connectPhantomUnified,
  unifiedAccountFromPhantomSignature,
} from "@qorechain/sdk";

// In the browser (uses window.solana):
const account = await connectPhantomUnified();

// Or, given a raw signature you already have:
const same = unifiedAccountFromPhantomSignature(signatureBytes);
```

الحساب المشتق هو مفتاح قانوني منفصل عن مفتاح ed25519 الخاص بـ Phantom — ولا
ترى Phantom أبدًا أسرار secp256k1/PQC المشتقة. لتمكين مفتاح Phantom نفسه من
الإنفاق من الحساب ضمن حدود، راجع
[المُصادِقون والإنفاق المفوَّض](/sdk/guides/authenticators).

## التشفير ما بعد الكمومي (PQC)

تدعم QoreChain توقيعات **ML-DSA-87** ‏(Dilithium-5، معيار FIPS 204). وتتيح
حزمة SDK هذه العمليات الأولية (primitives) مباشرةً.

```ts
import {
  generatePqcKeypair,
  pqcSign,
  pqcVerify,
  ML_DSA_87_PUBLIC_KEY_LENGTH,
  ML_DSA_87_SIGNATURE_LENGTH,
} from "@qorechain/sdk";

const keypair = generatePqcKeypair();
const message = new TextEncoder().encode("hello");

const signature = pqcSign(keypair.secretKey, message);
const ok = pqcVerify(keypair.publicKey, message, signature);
```

تتيح لك ثوابت الأطوال المُصدَّرة (`ML_DSA_87_PUBLIC_KEY_LENGTH`،
`ML_DSA_87_SECRET_KEY_LENGTH`، `ML_DSA_87_SIGNATURE_LENGTH`،
`ML_DSA_87_SEED_LENGTH`) التحقق من أحجام المخازن المؤقتة.

> في الأساس، تأتي عمليات PQC الأولية من مكتبة [**qorechain-pqc**](/developer-guide/post-quantum-signing) — المكتبة مفتوحة المصدر المعتمدة على المعايير فقط، والتي تغلّف تطبيقات FIPS-204/203/202 المدققة خلف واجهة برمجية واحدة متسقة بست لغات (JavaScript/TypeScript وRust وGo وC وPython وJava). استخدمها مباشرةً عندما تحتاج إلى العمليات الأولية الخام أو تأطير `hybridSignBytes` خارج SDK.

### المُوقِّعون القابلون للتوصيل

من أجل قابلية التركيب، توفر حزمة SDK تجريدًا `Signer` إضافةً إلى تطبيقَي
`PqcSigner` و`HybridSigner`، وتعدادًا `SignatureMode`. استخدم هذه العناصر
عندما تريد دمج توقيع PQC في تدفقك الخاص بدلًا من استدعاء العمليات الأولية
مباشرةً.

## التوقيع الهجين {#hybrid-signing}

تحمل المعاملة **الهجينة** توقيع secp256k1 كلاسيكيًا وتوقيع ML-DSA-87 معًا،
فتبقى صالحة في ظل التحقق الكلاسيكي مع اكتسابها حماية ما بعد كمومية. وينتقل
الجزء ما بعد الكمومي كامتداد `PQCHybridSignature` على المعاملة.

:::caution التوقيع الهجين مطلوب على مسار Native
اعتبارًا من إصدار السلسلة الحالي (**v3.1.95**)، الإعداد الافتراضي للشبكة هو
`hybrid_signature_mode = required` مع `allow_classical_fallback = false`.
التوقيع الهجين عبر `buildHybridTx` (مع `includePqcPublicKey`) — أو
`signHybridEth` للحسابات الموحّدة eth-native — **إلزامي** لمعاملات مسار
Native؛ وتُرفض المعاملات الكلاسيكية فقط على مسار Native على السلسلة. أما
معاملات EVM فتستخدم مسار `eth_secp256k1` منفصلًا ولا تتأثر.
:::

:::caution المعاملات الهجينة بإصدار SDK ‏≤ 0.6.0 مرفوضة
أصلح إصدار 0.6.1 ترميز امتداد `PQCHybridSignature` ‏(من JSON إلى protobuf،
حرج على مستوى الإجماع). المعاملات الهجينة المبنية بإصدار SDK ‏0.6.0 أو أقدم
تفشل عند CheckTx بخطأ تحليل المعاملة — قم بالترقية إلى 0.6.1 أو أحدث.
:::

```ts
import {
  buildHybridTx,
  deriveNativeAccount,
  directSignerFromPrivateKey,
} from "@qorechain/sdk";

const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");

// buildHybridTx assembles a tx with BOTH a classical signature and an
// ML-DSA-87 signature attached as a PQCHybridSignature extension.
// (See packages/ts and the pqc-hybrid-sign example for the full call.)
```

### المتطلب المسبق على السلسلة

قبل أن تجتاز المعاملة الهجينة تحقق PQC على السلسلة، يجب **تسجيل** المفتاح
العام PQC الخاص بالموقّع عبر رسالة `MsgRegisterPQCKey` الخاصة بالسلسلة —
*إلا* إذا ضبطت `includePqcPublicKey: true`، مما يضمّن المفتاح في الامتداد
لتتمكن السلسلة من تسجيله تلقائيًا عند أول استخدام.

### عقد المعاملة الهجينة (نظرة عالية المستوى)

تُوقَّع المعاملة كلاسيكيًا على بايتات التوقيع القياسية (التي **تستثني**
امتداد PQC)، ويُحسب توقيع ML-DSA-87 ويُرفق بوصفه امتداد `PQCHybridSignature`.
ولأن بايتات التوقيع الكلاسيكية تستثني الامتداد، يبقى التوقيع الكلاسيكي صالحًا
سواء فهم المتحقق جزء PQC أم لا. تُصدَّر أدوات المستوى الأدنى
(`encodeHybridExtension`، `attachHybridExtension`،
`buildHybridSignatureExtension`، `HYBRID_SIG_TYPE_URL`) وأدوات البناء
الشاملة (`buildHybridTx`، `signAndBroadcastHybrid`) للاستخدام المتقدم.

> إرسال المعاملات الهجينة هو المسار المطلوب على الشبكة الحية لمعاملات
> cosmos. أما العمليات الأولية المحلية للتوقيع/التحقق وأدوات بناء المعاملات
> فمتاحة اليوم.

## تدوير مفتاح PQC

منذ SDK 0.7.0 يمكن للحساب تدوير مفتاح ML-DSA-87 الخاص به إلى مفتاح جديد
بنفس **الخوارزمية** — بما يشمل الترحيل القانوني لمفتاح قديم من نوع
`shake256(mnemonic)` إلى المفتاح المرتبط بالعنوان
`shake256("qorechain:pqc:v1|addr|mnemonic")` — عبر
`rotatePqcKeyMsgFromMnemonic` (يوقّع كلا المفتاحين بايتات التدوير توقيعًا
مزدوجًا). راجع [تدوير المفاتيح](/sdk/guides/authenticators#key-rotation) في
دليل المُصادِقين للاطلاع على مثال كامل.

## معرِّفات الخوارزميات

تُصدِّر حزمة SDK معرِّفات الخوارزميات وأدوات مساعدة للعمل على مستوى
البروتوكول: `AlgorithmUnspecified` و`AlgorithmDilithium5`
و`AlgorithmMLKEM1024` و`algorithmName(id)` و`isSignatureAlgorithm(id)`.
