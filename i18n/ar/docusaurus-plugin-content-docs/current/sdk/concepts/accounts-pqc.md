---
slug: /sdk/concepts/accounts-pqc
title: الحسابات والتوقيع بـ PQC
sidebar_label: الحسابات و PQC
sidebar_position: 2
---

# الحسابات والتوقيع بـ PQC

تُشتق حسابات QoreChain من عبارة استرجاع BIP-39 واحدة. تُنتج عبارة الاسترجاع نفسها
حسابًا أصليًا، وحساب EVM، وحساب SVM عبر مسارات اشتقاق مستقلة.

## الاشتقاق الهرمي الحتمي (HD)

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

يُتحقق من عبارة الاسترجاع (الكلمات **و** المجموع الاختباري) قبل اشتقاق أي مفتاح،
بحيث يُطلق خطأ مطبعي استثناءً بدلًا من أن يُنتج بصمت حسابًا خاطئًا. يمكنك التحقق
صراحةً باستخدام `validateMnemonic(mnemonic)`.

### مخططات الاشتقاق

| النوع | المنحنى | المسار | العنوان |
| --- | --- | --- | --- |
| native | secp256k1 | `m/44'/118'/0'/0/{i}` | bech32 `qor` لـ `ripemd160(sha256(pubkey))` |
| evm | secp256k1 | `m/44'/60'/0'/0/{i}` | `0x` + `keccak256(pubkey)[-20:]`، EIP-55 |
| svm | ed25519 | `m/44'/501'/{i}'/0'` | base58 للمفتاح العام المكوّن من 32 بايت |

مرّر فهرس حساب لاشتقاق حسابات إضافية. في TypeScript:

```ts
const second = await deriveNativeAccount(mnemonic, { accountIndex: 1 });
```

في Python/Go/Rust يكون الفهرس وسيطًا موضعيًا
(`derive_native_account(mnemonic, 1)` / `DeriveNativeAccount(mnemonic, 1)` /
`derive_native_account(&mnemonic, 1)`).

### ملاحظة حول الإجابات المعروفة

مخططات الاشتقاق حتمية ومغطّاة باختبارات الإجابات المعروفة (known-answer tests)
عبر جميع SDKs الأربعة، بحيث تُنتج عبارة الاسترجاع نفسها عناوين متطابقة في
TypeScript وPython وGo وRust. وهذا يتيح لك الاشتقاق بلغة واحدة والتحقق
بأخرى.

## التشفير ما بعد الكمومي (PQC)

تدعم QoreChain توقيعات **ML-DSA-87** (Dilithium-5، FIPS 204). يكشف الـ SDK
البدائيات مباشرةً.

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

تتيح لك ثوابت الطول المُصدَّرة (`ML_DSA_87_PUBLIC_KEY_LENGTH`،
`ML_DSA_87_SECRET_KEY_LENGTH`، `ML_DSA_87_SIGNATURE_LENGTH`،
`ML_DSA_87_SEED_LENGTH`) التحقق من أحجام المخازن المؤقتة.

> في العمق، تأتي بدائيات PQC من [**qorechain-pqc**](/developer-guide/post-quantum-signing) — المكتبة مفتوحة المصدر القائمة على المعايير فقط، التي تغلّف تطبيقات FIPS-204/203/202 المُدقَّقة خلف واجهة برمجية واحدة متسقة بست لغات (JavaScript/TypeScript وRust وGo وC وPython وJava). استعن بها مباشرةً عندما تحتاج إلى البدائيات الخام أو تأطير `hybridSignBytes` خارج الـ SDK.

### مُوقِّعون قابلون للتوصيل

من أجل التركيب، يوفّر الـ SDK تجريدًا اسمه `Signer` بالإضافة إلى تنفيذي
`PqcSigner` و`HybridSigner`، وتعدادًا اسمه `SignatureMode`. استخدم هذه عندما
تريد توصيل توقيع PQC ضمن تدفّقك الخاص بدلًا من استدعاء البدائيات مباشرةً.

## التوقيع الهجين

تحمل المعاملة **الهجينة** توقيع secp256k1 كلاسيكيًا وتوقيع ML-DSA-87 معًا،
بحيث تظل صالحة تحت التحقق الكلاسيكي بينما تكتسب حماية ما بعد كمومية. يسافر
الجزء ما بعد الكمومي بوصفه امتداد `PQCHybridSignature` على المعاملة.

:::caution التوقيع الهجين مطلوب على مسار cosmos
اعتبارًا من إصدار السلسلة الحالي (**v3.1.82**)، فإن الافتراضي للشبكة هو
`hybrid_signature_mode = required` مع `allow_classical_fallback = false`.
يُعدّ التوقيع الهجين عبر `buildHybridTx` (مع `includePqcPublicKey`) **إلزاميًا**
لمعاملات مسار cosmos — تُرفض معاملات cosmos الكلاسيكية فقط على السلسلة.
تستخدم معاملات EVM مسارًا منفصلًا هو `eth_secp256k1` وهي غير متأثرة.
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

### شرط مسبق على السلسلة

قبل أن تتحقق معاملة هجينة من PQC على السلسلة، يجب أن يكون المفتاح العام لـ PQC
الخاص بالمُوقِّع **مُسجّلًا** عبر `MsgRegisterPQCKey` الخاص بالسلسلة — *إلا*
إذا عيّنت `includePqcPublicKey: true`، الذي يُضمّن المفتاح في الامتداد بحيث يمكن
للسلسلة تسجيله تلقائيًا عند أول استخدام.

### عقد المعاملة الهجينة (مستوى عالٍ)

تُوقَّع المعاملة كلاسيكيًا فوق بايتات التوقيع المعيارية (التي **تستثني** امتداد
PQC)، ويُحسب توقيع ML-DSA-87 ويُرفق بوصفه امتداد `PQCHybridSignature`. ولأن
بايتات التوقيع الكلاسيكية تستثني الامتداد، يظل التوقيع الكلاسيكي صالحًا سواء فهم
المُحقّق الجزء PQC أم لا. تُصدَّر المساعِدات منخفضة المستوى
(`encodeHybridExtension`، `attachHybridExtension`،
`buildHybridSignatureExtension`، `HYBRID_SIG_TYPE_URL`) وبناة التدفّق من البداية
إلى النهاية (`buildHybridTx`، `signAndBroadcastHybrid`) للاستخدام المتقدّم.

> يُعدّ إرسال المعاملات الهجينة المسارَ المطلوب على الشبكة الحية لمعاملات
> cosmos. وتتوفر بدائيات التوقيع/التحقق المحلية ومساعِدات بناء المعاملات اليوم.

## معرّفات الخوارزميات

يُصدّر الـ SDK معرّفات الخوارزميات والمساعِدات للعمل على مستوى البروتوكول:
`AlgorithmUnspecified`، `AlgorithmDilithium5`، `AlgorithmMLKEM1024`،
`algorithmName(id)`، و`isSignatureAlgorithm(id)`.
