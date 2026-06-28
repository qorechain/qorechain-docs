---
slug: /getting-started/wallet-setup
title: إعداد المحفظة
sidebar_label: إعداد المحفظة
sidebar_position: 2
---

# إعداد المحفظة

تدعم QoreChain أنواعًا متعددة من المحافظ عبر بيئات التنفيذ الأصلية وEVM وSVM. اختر المحفظة التي تناسب حالة استخدامك.

:::note
تستهدف معرّفات السلاسل ونقاط نهاية RPC أدناه شبكة الاختبار **`qorechain-diana`** (معرّف سلسلة EVM **9800**). أما الشبكة الرئيسية (**`qorechain-vladi`**، معرّف سلسلة EVM **9801**) فهي تعمل منذ 7 يونيو 2026؛ وقد وُثّقت قيم اتصال المحفظة الخاصة بها في صفحة **الاتصال بالشبكة الرئيسية** المنفصلة.
:::

## محفظة Keplr

Keplr هي المحفظة الموصى بها لمعاملات QoreChain الأصلية، والإيداع (staking)، والحوكمة.

### إضافة QoreChain كسلسلة مخصصة

افتح Keplr وانتقل إلى **Settings > Add Custom Chain**، ثم أدخل:

| الحقل              | القيمة                    |
| ------------------ | ------------------------- |
| Chain Name         | `QoreChain Diana Testnet` |
| Chain ID           | `qorechain-diana`         |
| RPC URL            | `http://localhost:26657`  |
| REST URL           | `http://localhost:1317`   |
| Bech32 Prefix      | `qor`                     |
| Coin Denom         | `QOR`                     |
| Coin Minimal Denom | `uqor`                    |
| Decimals           | `6`                       |

بعد إضافة السلسلة، تولّد Keplr عنوانًا بصيغة `qor1...` لحسابك. استخدم هذا العنوان لاستلام رموز QOR الخاصة بشبكة الاختبار.

## MetaMask (EVM)

تتيح MetaMask التفاعل مع بيئة تنفيذ EVM في QoreChain — نشر عقود Solidity، وإدارة رموز ERC-20، واستخدام أدوات Ethereum المألوفة.

### إضافة QoreChain كشبكة مخصصة

افتح MetaMask وانتقل إلى **Settings > Networks > Add Network**، ثم أدخل:

| الحقل           | القيمة                  |
| --------------- | ----------------------- |
| Network Name    | `QoreChain EVM`         |
| RPC URL         | `http://localhost:8545` |
| Chain ID        | `9800`                  |
| Currency Symbol | `QOR`                   |

بمجرد الاتصال، يمكنك استخدام MetaMask لتوقيع معاملات EVM، والتفاعل مع العقود الذكية المنشورة، وإدارة رموز ERC-20 على QoreChain.

### تسجيل الشبكة باستدعاء واحد

بالنسبة لتطبيقات dApp، تقوم حزمتا **`@qorechain/wallet-adapter`** و**`@qorechain/connect`** (المنشورتان على npm، الإصدار v0.1.0) بتسجيل QoreChain في محفظة المستخدم باستدعاء واحد — حيث تطالب MetaMask بإضافة الشبكة عبر EIP-3085 (مع رمز QOR الأصلي الصحيح بـ **18 خانة عشرية** على مسار EVM) وتهيئة خطوة سعر الغاز في Keplr:

```bash
npm install @qorechain/wallet-adapter @qorechain/connect
```

```ts
import { addQoreEvmToWallet } from "@qorechain/wallet-adapter";

await addQoreEvmToWallet(); // prompts MetaMask with QoreChain's EVM network params
```

## محافظ Solana (SVM)

بيئة تنفيذ SVM في QoreChain متوافقة مع أدوات Solana القياسية. اربط أي محفظة أو مكتبة متوافقة مع Solana للتفاعل مع برامج SVM.

### استخدام @solana/web3.js

```javascript
import { Connection } from "@solana/web3.js";

const connection = new Connection("http://localhost:8899");
const slot = await connection.getSlot();
console.log("Current slot:", slot);
```

يتيح ذلك نشر برامج SVM والتفاعل معها أثناء تشغيلها على QoreChain.

## المحافظ المدعومة بـ PQC (مطلوبة على مسار Cosmos)

تتطلب QoreChain تشفيرًا هجينًا مقاومًا للحوسبة الكمومية (PQC) على مسار معاملات cosmos. اعتبارًا من إصدار السلسلة الحالي (**v3.1.80**)، فإن الإعداد الافتراضي للشبكة هو `hybrid_signature_mode = required` مع `allow_classical_fallback = false` — لذا **يجب أن تحمل كل معاملة على مسار cosmos توقيع ML-DSA-87 (Dilithium-5) إلى جانب توقيع secp256k1 (ECDSA) القياسي**. ويتم رفض معاملات cosmos الكلاسيكية فقط الصادرة من حساب PQC.

:::caution معاملات Cosmos تتطلب امتداد PQC الهجين
سيتم رفض إرسال معاملة كلاسيكية عادية على مسار cosmos. يجب إرفاق توقيع Dilithium-5 كامتداد معاملة من نوع `PQCHybridSignature`. لا تنتج أدوات CosmJS / Keplr القياسية هذا الامتداد بمفردها — استخدم أمر CLI ‏`qorechaind tx pqc cosign`، أو التوقيع الهجين في QoreChain SDK (انظر أدناه)، أو، لبنائه بنفسك في الشيفرة، مكتبة [**qorechain-pqc**](/developer-guide/post-quantum-signing) مفتوحة المصدر (`hybridSignBytes`). الاستثناءات الوحيدة هي معاملات gentxs الخاصة بالنشأة (genesis) ومعاملات تسجيل/ترحيل مفاتيح PQC.
:::

### كيف يعمل ذلك

تُرفِق المحافظ توقيع PQC من نوع ML-DSA-87 كامتداد معاملة إلى جانب توقيع secp256k1 (ECDSA) القياسي. يُحسب التوقيع الكلاسيكي على بايتات التوقيع التي تستثني الامتداد، بحيث يبقى صالحًا للتحقق الكلاسيكي بينما يوفّر توقيع PQC المقاومة الكمومية.

### توليد مفتاح Dilithium-5

ولّد مفتاحًا مقاومًا للحوسبة الكمومية للتوقيع الهجين:

```bash
qorechaind tx pqc gen-key
```

### التسجيل التلقائي

عند تضمين مفتاح PQC العام في معاملتك الأولى، تسجّله QoreChain تلقائيًا على السلسلة. لا حاجة لخطوة تسجيل منفصلة. (معاملات تسجيل/ترحيل مفاتيح PQC نفسها مُعفاة من المتطلب الهجين، لذا يمكن للحساب تمهيد مفتاحه الأول.)

### التوقيع الهجين باستخدام SDK

ينتج QoreChain SDK معاملات cosmos متوافقة عبر `buildHybridTx` مع `includePqcPublicKey: true`، والذي يُرفِق امتداد Dilithium-5 ويضمّن المفتاح العام للتسجيل التلقائي. انظر [الحسابات والتوقيع بـ PQC في SDK](/sdk/concepts/accounts-pqc).

### أوضاع PQC

تظل أوضاع الفرض الثلاثة خاضعة للحوكمة؛ و**الإعداد الافتراضي الحالي للشبكة هو Required**:

| الوضع                  | الوصف                                                                   |
| ---------------------- | ----------------------------------------------------------------------- |
| **Disabled**           | يتم إيقاف التحقق من PQC. التواقيع القياسية فقط.                          |
| **Optional**           | قد تتضمن المعاملات تواقيع PQC. وإذا وُجدت، يتم التحقق منها.              |
| **Required** (الافتراضي) | يجب أن تتضمن جميع معاملات مسار cosmos توقيع PQC صالحًا.                  |

يُهيّأ الوضع النشط على مستوى السلسلة ويمكن تحديثه من خلال الحوكمة.

:::note EVM / MetaMask غير متأثرتين
لا يتأثر مسار MetaMask (EVM) أعلاه بالمتطلب الهجين. تستخدم معاملات EVM مسار ante منفصلًا هو `eth_secp256k1` ولا تحتاج أبدًا إلى امتداد PQC.
:::

## محفظة سطر الأوامر (CLI)

يتضمن ثنائي `qorechaind` نظام إدارة مفاتيح مدمجًا للاستخدام عبر سطر الأوامر.

### إنشاء مفتاح جديد

```bash
qorechaind keys add mykey
```

يولّد هذا زوج مفاتيح جديدًا ويعرض عبارة التذكير (mnemonic). **خزّن عبارة التذكير بأمان** — فهي الطريقة الوحيدة لاستعادة هذا المفتاح.

### عرض عنوانك

```bash
qorechaind keys show mykey -a
```

يُخرِج هذا عنوانك بصيغة bech32 ‏`qor1...`.

### سرد جميع المفاتيح

```bash
qorechaind keys list
```

### استيراد مفتاح موجود

```bash
qorechaind keys add mykey --recover
```

سيُطلب منك إدخال عبارة التذكير الخاصة بك.

## الخطوات التالية

* [معاملتك الأولى](/getting-started/first-transaction) — أرسل رموز QOR باستخدام محفظتك الجديدة
* [الاتصال بشبكة الاختبار](/getting-started/connecting-to-testnet) — انضم إلى شبكة اختبار Diana الحية
