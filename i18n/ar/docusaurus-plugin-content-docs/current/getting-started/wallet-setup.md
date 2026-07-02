---
slug: /getting-started/wallet-setup
title: إعداد المحفظة
sidebar_label: إعداد المحفظة
sidebar_position: 2
---

# إعداد المحفظة

تدعم QoreChain أنواعًا متعددة من المحافظ عبر بيئات التنفيذ الأصلية وEVM وSVM الخاصة بها. اختر المحفظة التي تناسب حالة الاستخدام الخاصة بك.

:::note
تغطي القيم أدناه كلًّا من الشبكة الرئيسية **`qorechain-vladi`** (معرّف سلسلة EVM هو **9801**، وهي تعمل منذ 7 يونيو 2026) وشبكة الاختبار **`qorechain-diana`** (معرّف سلسلة EVM هو **9800**). نقاط الوصول العامة لكلتا الشبكتين مدرجة في [الشبكات](/appendix/networks#public-endpoints).
:::

## محفظة Keplr

Keplr هي المحفظة الموصى بها لمعاملات QoreChain الأصلية والتخزين (staking) والحوكمة.

### إضافة QoreChain كسلسلة مخصصة

افتح Keplr وانتقل إلى **Settings > Add Custom Chain**، ثم أدخل ما يلي:

| الحقل              | الشبكة الرئيسية            | شبكة الاختبار                    |
| ------------------ | -------------------------- | -------------------------------- |
| اسم السلسلة        | `QoreChain`                | `QoreChain Diana Testnet`        |
| معرّف السلسلة      | `qorechain-vladi`          | `qorechain-diana`                |
| عنوان RPC          | `https://rpc.qore.host`    | `https://rpc-testnet.qore.host`  |
| عنوان REST         | `https://api.qore.host`    | `https://api-testnet.qore.host`  |
| بادئة Bech32       | `qor`                      | `qor`                            |
| رمز العملة         | `QOR`                      | `QOR`                            |
| الوحدة الدنيا للعملة | `uqor`                   | `uqor`                           |
| المنازل العشرية    | `6`                        | `6`                              |
| نوع العملة (BIP-44) | `118`                     | `118`                            |

بعد إضافة السلسلة، تُنشئ Keplr عنوان `qor1...` لحسابك.

:::caution الحد الأدنى لسعر الغاز
الحد الأدنى لسعر الغاز في الشبكة هو **0.1uqor**. إذا قمت بتهيئة درجات سعر الغاز في Keplr (مثلًا عبر `suggestChain`)، فاستخدم قيمًا **تساوي 0.1 أو أعلى** (القيم المقترحة للمستويات منخفض/متوسط/مرتفع: `0.1 / 0.15 / 0.25`) — المعاملات الموقّعة بأقل من هذا الحد تُرفض.
:::

## MetaMask (EVM)

تتيح MetaMask التفاعل مع بيئة تنفيذ EVM في QoreChain — نشر عقود Solidity، وإدارة رموز ERC-20، واستخدام أدوات Ethereum المألوفة.

### إضافة QoreChain كشبكة مخصصة

افتح MetaMask وانتقل إلى **Settings > Networks > Add Network**، ثم أدخل ما يلي:

| الحقل              | الشبكة الرئيسية           | شبكة الاختبار                    |
| ------------------ | ------------------------- | -------------------------------- |
| اسم الشبكة         | `QoreChain`               | `QoreChain Diana Testnet`        |
| عنوان RPC          | `https://evm.qore.host`   | `https://evm-testnet.qore.host`  |
| معرّف السلسلة      | `9801`                    | `9800`                           |
| رمز العملة         | `QOR`                     | `QOR`                            |
| عنوان مستكشف الكتل | `https://explore.qore.network` | `https://explore.qore.network` |

عملة QOR الأصلية لها **18 منزلة عشرية** على واجهة EVM (على نمط wei). بعد الاتصال، يمكنك استخدام MetaMask لتوقيع معاملات EVM، والتفاعل مع العقود الذكية المنشورة، وإدارة رموز ERC-20 على QoreChain.

### تسجيل الشبكة باستدعاء واحد

بالنسبة لتطبيقات dApps، تقوم حزمتا **`@qorechain/wallet-adapter`** و**`@qorechain/connect`** (المنشورتان على npm) بتسجيل QoreChain في محفظة المستخدم باستدعاء واحد — حيث تطلبان من MetaMask إضافة الشبكة عبر EIP-3085 (مع عملة QOR الأصلية الصحيحة ذات **18 منزلة عشرية** على مسار EVM) وتهيئان درجات سعر الغاز في Keplr:

```bash
npm install @qorechain/wallet-adapter @qorechain/connect
```

```ts
import { addQoreEvmToWallet } from "@qorechain/wallet-adapter";

await addQoreEvmToWallet(); // prompts MetaMask with QoreChain's EVM network params
```

## محافظ Solana (SVM)

بيئة تنفيذ SVM في QoreChain متوافقة مع أدوات Solana القياسية، ويكون **رصيد QOR الأصلي للحساب مرئيًا مباشرة على واجهة SVM** (بوحدة lamports، بتسع منازل عشرية؛ 1 uqor = 1,000 lamports). يمكنك ربط أي محفظة أو مكتبة متوافقة مع Solana.

### استخدام @solana/web3.js

```javascript
import { Connection } from "@solana/web3.js";

// Public read-only endpoint (or http://localhost:8899 on your own node)
const connection = new Connection("https://svm.qore.host");
const slot = await connection.getSlot();
console.log("Current slot:", slot);
```

نقاط الوصول العامة لـ SVM هي **للقراءة فقط**؛ ويتطلب إرسال المعاملات تشغيل عقدتك الخاصة. راجع [تطوير SVM](/developer-guide/svm-development) لمزيد من التفاصيل.

## المحافظ المدعومة بتشفير ما بعد الكم (إلزامية على مسار Cosmos)

تشترط QoreChain استخدام تشفير ما بعد الكم الهجين (PQC) على مسار معاملات cosmos. اعتبارًا من إصدار السلسلة الحالي (**v3.1.82**)، يكون الإعداد الافتراضي للشبكة هو `hybrid_signature_mode = required` مع `allow_classical_fallback = false` — أي أن **كل معاملة على مسار cosmos يجب أن تحمل توقيع ML-DSA-87 (Dilithium-5) إلى جانب توقيع secp256k1 (ECDSA) القياسي**. تُرفض معاملات cosmos الكلاسيكية فقط الصادرة من حساب يملك مفتاح PQC.

:::caution معاملات cosmos تتطلب امتداد PQC الهجين
إرسال معاملة كلاسيكية عادية على مسار cosmos سيُرفض. يجب عليك إرفاق توقيع Dilithium-5 كامتداد معاملة من نوع `PQCHybridSignature`. أدوات CosmJS / Keplr القياسية لا تنتج هذا الامتداد بمفردها — استخدم أمر سطر الأوامر `qorechaind tx pqc cosign`، أو التوقيع الهجين في QoreChain SDK (انظر أدناه)، أو، لبنائه بنفسك برمجيًا، مكتبة [**qorechain-pqc**](/developer-guide/post-quantum-signing) مفتوحة المصدر (`hybridSignBytes`). الاستثناءات الوحيدة هي معاملات gentx في نشأة السلسلة (genesis) ومعاملات تسجيل/ترحيل مفاتيح PQC.
:::

### كيف يعمل

تُرفق المحافظ توقيع PQC من نوع ML-DSA-87 كامتداد معاملة إلى جانب توقيع secp256k1 (ECDSA) القياسي. يُحسب التوقيع الكلاسيكي على بايتات التوقيع التي تستثني الامتداد، بحيث يظل صالحًا للتحقق الكلاسيكي بينما يوفر توقيع PQC مقاومة للحوسبة الكمومية.

### إنشاء مفتاح Dilithium-5

أنشئ مفتاح ما بعد الكم للتوقيع الهجين:

```bash
qorechaind tx pqc gen-key
```

### التسجيل التلقائي

عند تضمين مفتاح PQC العام في معاملتك الأولى، تُسجّله QoreChain تلقائيًا على السلسلة. لا حاجة إلى خطوة تسجيل منفصلة. (معاملات تسجيل/ترحيل مفاتيح PQC نفسها معفاة من متطلب التوقيع الهجين، بحيث يمكن للحساب تهيئة مفتاحه الأول.)

### التوقيع الهجين باستخدام SDK

تنتج QoreChain SDK معاملات cosmos متوافقة عبر `buildHybridTx` مع الخيار `includePqcPublicKey: true`، الذي يرفق امتداد Dilithium-5 ويضمّن المفتاح العام للتسجيل التلقائي. راجع [حسابات SDK وتوقيع PQC](/sdk/concepts/accounts-pqc).

### أوضاع PQC

تظل أوضاع الفرض الثلاثة خاضعة للحوكمة؛ و**الإعداد الافتراضي الحالي للشبكة هو Required**:

| الوضع                  | الوصف                                                                   |
| ---------------------- | ----------------------------------------------------------------------- |
| **Disabled**           | التحقق من PQC معطّل. التوقيعات القياسية فقط.                             |
| **Optional**           | يمكن أن تتضمن المعاملات توقيعات PQC. وإذا وُجدت، يتم التحقق منها.        |
| **Required** (الافتراضي) | يجب أن تتضمن جميع المعاملات على مسار cosmos توقيع PQC صالحًا.          |

يُهيّأ الوضع النشط على مستوى السلسلة ويمكن تحديثه عبر الحوكمة.

:::note مسار EVM / MetaMask غير متأثر
مسار MetaMask (EVM) الموضح أعلاه **غير** متأثر بمتطلب التوقيع الهجين. تستخدم معاملات EVM مسار ante منفصلًا من نوع `eth_secp256k1` ولا تحتاج أبدًا إلى امتداد PQC.
:::

## محفظة سطر الأوامر (CLI)

يتضمن البرنامج الثنائي `qorechaind` نظامًا مدمجًا لإدارة المفاتيح للاستخدام عبر سطر الأوامر.

### إنشاء مفتاح جديد

```bash
qorechaind keys add mykey
```

يُنشئ هذا الأمر زوج مفاتيح جديدًا ويعرض عبارة الاسترداد (mnemonic). **احفظ عبارة الاسترداد في مكان آمن** — فهي الوسيلة الوحيدة لاستعادة هذا المفتاح.

### عرض عنوانك

```bash
qorechaind keys show mykey -a
```

يعرض هذا الأمر عنوان bech32 الخاص بك بصيغة `qor1...`.

### عرض جميع المفاتيح

```bash
qorechaind keys list
```

### استيراد مفتاح موجود

```bash
qorechaind keys add mykey --recover
```

سيُطلب منك إدخال عبارة الاسترداد (mnemonic) الخاصة بك.

## الخطوات التالية

* [معاملتك الأولى](/getting-started/first-transaction) — أرسل رموز QOR باستخدام محفظتك الجديدة
* [الاتصال بشبكة الاختبار](/getting-started/connecting-to-testnet) — انضم إلى شبكة اختبار Diana العاملة
