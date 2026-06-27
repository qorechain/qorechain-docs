---
slug: /getting-started/wallet-setup
title: إعداد المحفظة
sidebar_label: إعداد المحفظة
sidebar_position: 2
---

# إعداد المحفظة

تدعم QoreChain أنواعًا متعددة من المحافظ عبر بيئات التنفيذ الأصلية وEVM وSVM. اختر المحفظة التي تناسب حالة استخدامك.

:::note
معرّفات السلسلة ونقاط نهاية RPC أدناه تستهدف شبكة الاختبار **`qorechain-diana`** (معرّف سلسلة EVM **9800**). أما الشبكة الرئيسية (**`qorechain-vladi`**، معرّف سلسلة EVM **9801**) فهي نشطة منذ 7 يونيو 2026؛ وقيم اتصال المحفظة الخاصة بها موثّقة في صفحة **الاتصال بالشبكة الرئيسية** المنفصلة.
:::

## محفظة Keplr

تُعد Keplr المحفظة المُوصى بها لمعاملات QoreChain الأصلية والـ staking والحوكمة.

### إضافة QoreChain كسلسلة مخصصة

افتح Keplr وانتقل إلى **Settings > Add Custom Chain**، ثم أدخل:

| الحقل              | القيمة                     |
| ------------------ | ------------------------- |
| Chain Name         | `QoreChain Diana Testnet` |
| Chain ID           | `qorechain-diana`         |
| RPC URL            | `http://localhost:26657`  |
| REST URL           | `http://localhost:1317`   |
| Bech32 Prefix      | `qor`                     |
| Coin Denom         | `QOR`                     |
| Coin Minimal Denom | `uqor`                    |
| Decimals           | `6`                       |

بعد إضافة السلسلة، تُنشئ Keplr عنوانًا بصيغة `qor1...` لحسابك. استخدم هذا العنوان لاستلام رموز QOR الخاصة بشبكة الاختبار.

## MetaMask (EVM)

تتيح MetaMask التفاعل مع بيئة تنفيذ EVM في QoreChain — نشر عقود Solidity، وإدارة رموز ERC-20، واستخدام أدوات Ethereum المألوفة.

### إضافة QoreChain كشبكة مخصصة

افتح MetaMask وانتقل إلى **Settings > Networks > Add Network**، ثم أدخل:

| الحقل           | القيمة                   |
| --------------- | ----------------------- |
| Network Name    | `QoreChain EVM`         |
| RPC URL         | `http://localhost:8545` |
| Chain ID        | `9800`                  |
| Currency Symbol | `QOR`                   |

بمجرد الاتصال، يمكنك استخدام MetaMask لتوقيع معاملات EVM، والتفاعل مع العقود الذكية المنشورة، وإدارة رموز ERC-20 على QoreChain.

## محافظ Solana (SVM)

بيئة تنفيذ SVM في QoreChain متوافقة مع أدوات Solana القياسية. اربط أي محفظة أو مكتبة متوافقة مع Solana للتفاعل مع برامج SVM.

### استخدام @solana/web3.js

```javascript
import { Connection } from "@solana/web3.js";

const connection = new Connection("http://localhost:8899");
const slot = await connection.getSlot();
console.log("Current slot:", slot);
```

يتيح ذلك نشر برامج SVM التي تعمل على QoreChain والتفاعل معها.

## المحافظ المُمكَّنة بـ PQC (مطلوبة على مسار Cosmos)

تتطلب QoreChain تشفيرًا هجينًا مقاومًا للحوسبة الكمومية (PQC) على مسار معاملات cosmos. اعتبارًا من إصدار السلسلة الحالي (**v3.1.77**)، يكون الإعداد الافتراضي للشبكة هو `hybrid_signature_mode = required` مع `allow_classical_fallback = false` — لذا **يجب أن تحمل كل معاملة على مسار cosmos توقيع ML-DSA-87 (Dilithium-5) إلى جانب توقيع secp256k1 (ECDSA) القياسي**. تُرفض معاملات cosmos الكلاسيكية فقط الصادرة من حساب PQC.

:::caution معاملات cosmos تتطلب امتداد PQC الهجين
سيُرفض إرسال معاملة كلاسيكية بسيطة على مسار cosmos. يجب أن تُرفق توقيع Dilithium-5 كامتداد معاملة `PQCHybridSignature`. لا تُنتج أدوات CosmJS / Keplr القياسية هذا الامتداد من تلقاء نفسها — استخدم أمر CLI ‏`qorechaind tx pqc cosign`، أو التوقيع الهجين الخاص بـ QoreChain SDK (انظر أدناه)، أو لإنشائه بنفسك في الكود، استخدم المكتبة مفتوحة المصدر [**qorechain-pqc**](/developer-guide/post-quantum-signing) (`hybridSignBytes`). الاستثناءات الوحيدة هي معاملات genesis gentxs ومعاملات تسجيل/ترحيل مفاتيح PQC.
:::

### كيف يعمل ذلك

تُرفق المحافظ توقيع PQC من نوع ML-DSA-87 كامتداد معاملة إلى جانب توقيع secp256k1 (ECDSA) القياسي. يُحسب التوقيع الكلاسيكي على بايتات التوقيع التي تستثني الامتداد، لذا يظل صالحًا للتحقق الكلاسيكي بينما يوفّر توقيع PQC مقاومة للحوسبة الكمومية.

### إنشاء مفتاح Dilithium-5

أنشئ مفتاحًا مقاومًا للحوسبة الكمومية للتوقيع الهجين:

```bash
qorechaind tx pqc gen-key
```

### التسجيل التلقائي

عند تضمين مفتاح PQC العام في معاملتك الأولى، تسجّله QoreChain تلقائيًا على السلسلة. لا حاجة إلى خطوة تسجيل منفصلة. (تُعفى معاملات تسجيل/ترحيل مفاتيح PQC نفسها من شرط الهجين، لذا يمكن لأي حساب بدء تشغيل مفتاحه الأول.)

### التوقيع الهجين باستخدام SDK

يُنتج QoreChain SDK معاملات cosmos متوافقة عبر `buildHybridTx` مع `includePqcPublicKey: true`، والذي يُرفق امتداد Dilithium-5 ويضمّن المفتاح العام للتسجيل التلقائي. انظر [حسابات SDK والتوقيع بـ PQC](/sdk/concepts/accounts-pqc).

### أوضاع PQC

تظل أوضاع الإنفاذ الثلاثة خاضعة للحوكمة؛ و**الإعداد الافتراضي الحالي للشبكة هو Required**:

| الوضع                   | الوصف                                                             |
| ---------------------- | ----------------------------------------------------------------------- |
| **Disabled**           | التحقق من PQC مُعطَّل. التواقيع القياسية فقط.               |
| **Optional**           | يجوز للمعاملات تضمين تواقيع PQC. إن وُجدت، يتم التحقق منها. |
| **Required** (الافتراضي) | يجب أن تتضمن جميع معاملات مسار cosmos توقيع PQC صالحًا.        |

يُضبط الوضع النشط على مستوى السلسلة ويمكن تحديثه عبر الحوكمة.

:::note EVM / MetaMask غير متأثرة
لا يتأثر مسار MetaMask (EVM) أعلاه بشرط الهجين. تستخدم معاملات EVM مسار ante منفصلًا هو `eth_secp256k1` ولا تحتاج أبدًا إلى امتداد PQC.
:::

## محفظة CLI

يتضمن البرنامج الثنائي `qorechaind` نظام إدارة مفاتيح مدمجًا للاستخدام عبر سطر الأوامر.

### إنشاء مفتاح جديد

```bash
qorechaind keys add mykey
```

ينشئ ذلك زوج مفاتيح جديدًا ويعرض عبارة الاسترداد (mnemonic). **خزّن عبارة الاسترداد بأمان** — فهي الطريقة الوحيدة لاسترداد هذا المفتاح.

### عرض عنوانك

```bash
qorechaind keys show mykey -a
```

يُخرج ذلك عنوانك بصيغة bech32 ‏`qor1...`.

### عرض جميع المفاتيح

```bash
qorechaind keys list
```

### استيراد مفتاح موجود

```bash
qorechaind keys add mykey --recover
```

سيُطلب منك إدخال عبارة الاسترداد الخاصة بك.

## الخطوات التالية

* [معاملتك الأولى](/getting-started/first-transaction) — أرسل رموز QOR باستخدام محفظتك الجديدة
* [الاتصال بشبكة الاختبار](/getting-started/connecting-to-testnet) — انضم إلى شبكة اختبار Diana النشطة
