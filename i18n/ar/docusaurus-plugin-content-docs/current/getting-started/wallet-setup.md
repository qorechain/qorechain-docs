---
slug: /getting-started/wallet-setup
title: إعداد المحفظة
sidebar_label: إعداد المحفظة
sidebar_position: 2
---

# إعداد المحفظة

تدعم QoreChain أنواعًا متعددة من المحافظ عبر بيئات التنفيذ الأصلية وEVM وSVM. اختر المحفظة التي تناسب حالة الاستخدام الخاصة بك.

:::note
القيم أدناه تغطي كلًّا من الشبكة الرئيسية **`qorechain-vladi`** (معرّف سلسلة EVM ‏**9801**، تعمل منذ 7 يونيو 2026) وشبكة الاختبار **`qorechain-diana`** (معرّف سلسلة EVM ‏**9800**). نقاط النهاية العامة لكلتا الشبكتين مدرجة في [الشبكات](/appendix/networks#public-endpoints).
:::

## محفظة Keplr

‏Keplr هي المحفظة الموصى بها لمعاملات QoreChain الأصلية والتخزين (staking) والحوكمة.

### إضافة QoreChain كسلسلة مخصصة

افتح Keplr وانتقل إلى **Settings > Add Custom Chain**، ثم أدخل:

| الحقل               | الشبكة الرئيسية            | شبكة الاختبار                    |
| ------------------- | -------------------------- | -------------------------------- |
| اسم السلسلة         | `QoreChain`                | `QoreChain Diana Testnet`        |
| معرّف السلسلة       | `qorechain-vladi`          | `qorechain-diana`                |
| عنوان RPC           | `https://rpc.qore.host`    | `https://rpc-testnet.qore.host`  |
| عنوان REST          | `https://api.qore.host`    | `https://api-testnet.qore.host`  |
| بادئة Bech32        | `qor`                      | `qor`                            |
| رمز العملة          | `QOR`                      | `QOR`                            |
| أصغر وحدة للعملة    | `uqor`                     | `uqor`                           |
| الخانات العشرية     | `6`                        | `6`                              |
| نوع العملة (BIP-44) | `118`                      | `118`                            |

بعد إضافة السلسلة، تنشئ Keplr عنوانًا بصيغة `qor1...` لحسابك.

:::caution الحد الأدنى لسعر الغاز
الحد الأدنى لسعر الغاز في الشبكة هو **0.1uqor**. إذا قمت بضبط درجات سعر الغاز في Keplr (مثلًا عبر `suggestChain`)، فاستخدم قيمًا **تساوي أو تتجاوز 0.1** (القيم المقترحة للمنخفض/المتوسط/المرتفع: `0.1 / 0.15 / 0.25`) — المعاملات الموقّعة بأقل من هذا الحد تُرفض.
:::

## MetaMask (EVM)

تتيح MetaMask التفاعل مع بيئة تنفيذ EVM في QoreChain — نشر عقود Solidity، وإدارة رموز ERC-20، واستخدام أدوات Ethereum المألوفة.

### إضافة QoreChain كشبكة مخصصة

افتح MetaMask وانتقل إلى **Settings > Networks > Add Network**، ثم أدخل:

| الحقل               | الشبكة الرئيسية                | شبكة الاختبار                    |
| ------------------- | ------------------------------- | --------------------------------- |
| اسم الشبكة          | `QoreChain`                     | `QoreChain Diana Testnet`         |
| عنوان RPC           | `https://evm.qore.host`         | `https://evm-testnet.qore.host`   |
| معرّف السلسلة       | `9801`                          | `9800`                            |
| رمز العملة          | `QOR`                           | `QOR`                             |
| عنوان مستكشف الكتل  | `https://explore.qore.network`  | `https://explore.qore.network`    |

يمتلك QOR الأصلي **18 خانة عشرية** على واجهة EVM (بأسلوب wei). بمجرد الاتصال، يمكنك استخدام MetaMask لتوقيع معاملات EVM، والتفاعل مع العقود الذكية المنشورة، وإدارة رموز ERC-20 على QoreChain.

### تسجيل الشبكة باستدعاء واحد

بالنسبة للتطبيقات اللامركزية (dApps)، تقوم الحزمتان **`@qorechain/wallet-adapter`** و**`@qorechain/connect`** (المنشورتان على npm) بتسجيل QoreChain في محفظة المستخدم باستدعاء واحد — إذ تطلبان من MetaMask إضافة الشبكة عبر EIP-3085 (مع QOR الأصلي الصحيح ذي **18 خانة عشرية** على مسار EVM) وتضبطان درجة سعر الغاز في Keplr:

```bash
npm install @qorechain/wallet-adapter @qorechain/connect
```

```ts
import { addQoreEvmToWallet } from "@qorechain/wallet-adapter";

await addQoreEvmToWallet(); // prompts MetaMask with QoreChain's EVM network params
```

## حساب واحد، ثلاثة عناوين (الحسابات الموحّدة) {#unified-accounts}

اعتبارًا من إصدار السلسلة **v3.1.83**، أصبح حساب QoreChain **هوية واحدة من 20 بايت بثلاثة ترميزات**: ‏`qor1…` (الأصلي)، و`0x…` ‏(EVM)، وصيغة base58 ‏(SVM). ويحمل **رصيدًا واحدًا** و — بالنسبة للحسابات ذات الأصل الإيثيري — **يوقّع على المسارات الثلاثة بمفتاح واحد**، بما في ذلك التوقيع الهجين المطلوب المقاوم للحوسبة الكمومية على المسار الأصلي.

أنشئ محفظة موحّدة برمجيًا باستخدام `@qorechain/wallet-adapter`:

```js
import { generateQoreWallet } from "@qorechain/wallet-adapter";

const w = await generateQoreWallet();          // or walletFromMnemonic(mnemonic)
console.log(w.addresses.cosmos);               // qor1...
console.log(w.addresses.evm);                  // 0x... (same identity)
console.log(w.addresses.svm);                  // base58 (same identity)
// Native-lane sends use signHybridEth (classical eth_secp256k1 + ML-DSA-87 hybrid).
```

الأموال المرسلة إلى أي من الصيغ الثلاث تصل إلى الرصيد نفسه.

## المحافظ المرتبطة: Phantom وMetaMask كمفاتيح إنفاق {#linked-wallets}

اعتبارًا من إصدار السلسلة **v3.1.85**، لم تعد بحاجة إلى كشف مفتاحك الجذري للإنفاق من حساب QoreChain داخل تطبيق لامركزي. يمكن **تسجيل** مفتاح **Phantom** ‏(ed25519) أو **MetaMask** (بواسطة عنوانه على Ethereum، عبر `personal_sign`) **كموثِّق (authenticator)** على حسابك — مع صلاحيات محددة النطاق، وحدود إنفاق، وتاريخ انتهاء، وإمكانية إلغاء فوري — ثم يمكنه تفويض تحويلات يمررها الخادم الخلفي للتطبيق اللامركزي. راجع [موثِّقات المحافظ المرتبطة](/developer-guide/account-abstraction#authenticators) للاطلاع على النموذج الكامل والكود، و[دليل الموثِّقات في SDK](/sdk/guides/authenticators) للحصول على أمثلة شاملة من البداية إلى النهاية.

## محافظ Solana ‏(SVM)

:::caution إرسال معاملات SVM معطّل حاليًا
مسار تنفيذ SVM **معطّل حاليًا على مستوى الشبكة بأكملها بالنسبة لإرسال المعاملات** — لا تُرسل معاملات عبر محفظة متوافقة مع Solana إلى QoreChain في الوقت الحالي. قد تظل قراءة الأرصدة/الشرائح (slots) تعمل؛ راجع [تطوير SVM](/developer-guide/svm-development) لمعرفة الوضع الحالي.
:::

بيئة تنفيذ SVM في QoreChain متوافقة مع أدوات Solana القياسية، ويظهر **رصيد QOR الأصلي للحساب مباشرة على واجهة SVM** (بوحدة lamports، بـ 9 خانات عشرية؛ 1 uqor = 1,000 lamports). يمكنك توصيل أي محفظة أو مكتبة متوافقة مع Solana.

### استخدام @solana/web3.js

```javascript
import { Connection } from "@solana/web3.js";

// Public read-only endpoint (or http://localhost:8899 on your own node)
const connection = new Connection("https://svm.qore.host");
const slot = await connection.getSlot();
console.log("Current slot:", slot);
```

نقاط نهاية SVM العامة هي **للقراءة فقط**؛ ويتطلب إرسال المعاملات تشغيل عقدتك الخاصة. راجع [تطوير SVM](/developer-guide/svm-development) للتفاصيل.

## المحافظ الداعمة لـ PQC (إلزامية على مسار Cosmos)

تشترط QoreChain استخدام التشفير الهجين المقاوم للحوسبة الكمومية (PQC) على مسار معاملات cosmos. اعتبارًا من إصدار السلسلة الحالي (**v3.1.82**)، الإعداد الافتراضي للشبكة هو `hybrid_signature_mode = required` مع `allow_classical_fallback = false` — أي أن **كل معاملة على مسار cosmos يجب أن تحمل توقيع ML-DSA-87 ‏(Dilithium-5) إلى جانب توقيع secp256k1 ‏(ECDSA) القياسي**. معاملات cosmos الكلاسيكية فقط الصادرة من حساب PQC تُرفض.

:::caution معاملات Cosmos تتطلب امتداد PQC الهجين
إرسال معاملة كلاسيكية عادية على مسار cosmos سيؤدي إلى رفضها. يجب عليك إرفاق توقيع Dilithium-5 كامتداد معاملة من نوع `PQCHybridSignature`. أدوات CosmJS / Keplr القياسية لا تُنتج هذا الامتداد بنفسها — استخدم أمر CLI ‏`qorechaind tx pqc cosign`، أو التوقيع الهجين في QoreChain SDK (انظر أدناه)، أو، لبنائه بنفسك برمجيًا، مكتبة [**qorechain-pqc**](/developer-guide/post-quantum-signing) مفتوحة المصدر (`hybridSignBytes`). الاستثناءات الوحيدة هي معاملات gentx الخاصة بالتكوين الأولي (genesis) ومعاملات تسجيل/ترحيل مفاتيح PQC.
:::

### كيف يعمل

ترفق المحافظ توقيع PQC من نوع ML-DSA-87 كامتداد للمعاملة إلى جانب توقيع secp256k1 ‏(ECDSA) القياسي. يُحسب التوقيع الكلاسيكي على بايتات توقيع تستثني الامتداد، فيبقى صالحًا للتحقق الكلاسيكي بينما يوفر توقيع PQC المقاومة الكمومية.

### توليد مفتاح Dilithium-5

قم بتوليد مفتاح مقاوم للحوسبة الكمومية للتوقيع الهجين:

```bash
qorechaind tx pqc gen-key
```

### التسجيل التلقائي

عندما تُضمِّن مفتاح PQC العام في معاملتك الأولى، تسجّله QoreChain تلقائيًا على السلسلة. لا حاجة إلى خطوة تسجيل منفصلة. (معاملات تسجيل/ترحيل مفاتيح PQC معفاة بنفسها من متطلب التوقيع الهجين، مما يتيح للحساب إعداد مفتاحه الأول.)

### التوقيع الهجين باستخدام SDK

يُنتج QoreChain SDK معاملات cosmos متوافقة عبر `buildHybridTx` مع `includePqcPublicKey: true`، حيث يرفق امتداد Dilithium-5 ويضمّن المفتاح العام للتسجيل التلقائي. راجع [حسابات SDK والتوقيع بـ PQC](/sdk/concepts/accounts-pqc).

### أوضاع PQC

تظل أوضاع الإنفاذ الثلاثة خاضعة للحوكمة؛ **الإعداد الافتراضي الحالي للشبكة هو Required**:

| الوضع                     | الوصف                                                             |
| ------------------------- | ------------------------------------------------------------------ |
| **Disabled**               | التحقق من PQC معطّل. التوقيعات القياسية فقط.                       |
| **Optional**                | يجوز أن تتضمن المعاملات توقيعات PQC. وإذا وُجدت، يتم التحقق منها.  |
| **Required** (الافتراضي) | يجب أن تتضمن جميع المعاملات على مسار cosmos توقيع PQC صالحًا.       |

يُضبط الوضع النشط على مستوى السلسلة ويمكن تحديثه عبر الحوكمة.

:::note EVM / MetaMask غير متأثرين
مسار MetaMask ‏(EVM) الموضح أعلاه **غير** متأثر بمتطلب التوقيع الهجين. تستخدم معاملات EVM مسار ante منفصلًا من نوع `eth_secp256k1` ولا تحتاج أبدًا إلى امتداد PQC.
:::

## محفظة سطر الأوامر (CLI)

يتضمن الملف التنفيذي `qorechaind` نظام إدارة مفاتيح مدمجًا للاستخدام عبر سطر الأوامر.

### إنشاء مفتاح جديد

```bash
qorechaind keys add mykey
```

يولّد هذا الأمر زوج مفاتيح جديدًا ويعرض العبارة الاسترجاعية (mnemonic). **احفظ العبارة الاسترجاعية بأمان** — فهي الطريقة الوحيدة لاستعادة هذا المفتاح.

### عرض عنوانك

```bash
qorechaind keys show mykey -a
```

يعرض هذا الأمر عنوانك بصيغة bech32 ‏(`qor1...`).

### عرض جميع المفاتيح

```bash
qorechaind keys list
```

### استيراد مفتاح موجود

```bash
qorechaind keys add mykey --recover
```

سيُطلب منك إدخال عبارتك الاسترجاعية.

## الخطوات التالية

* [معاملتك الأولى](/getting-started/first-transaction) — أرسل رموز QOR باستخدام محفظتك الجديدة
* [الاتصال بشبكة الاختبار](/getting-started/connecting-to-testnet) — انضم إلى شبكة اختبار Diana الحية
