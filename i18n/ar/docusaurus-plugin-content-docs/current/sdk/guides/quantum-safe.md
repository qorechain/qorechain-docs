---
slug: /sdk/guides/quantum-safe
title: آمن كمّيًا افتراضيًا
sidebar_label: آمن كمّيًا
sidebar_position: 6
---

# آمن كمّيًا افتراضيًا

تتعامل QoreChain مع التشفير ما بعد الكمّي كنظام توقيع **من الدرجة الأولى**.
يسجّل الحساب مفتاح **ML-DSA-87 (Dilithium-5، NIST FIPS 204)** على السلسلة،
وبعد ذلك يمكن لمعاملاته أن تحمل توقيعًا **هجينًا** — التوقيع الكلاسيكي
المعتاد secp256k1 **إضافةً إلى** توقيع ML-DSA-87. يتحقّق معالج
ما-قبل (ante handler) السلسلة من كليهما، فيبقى الحساب الآمن كمّيًا متوافقًا
تمامًا مع التحقّق الكلاسيكي مع اكتسابه الحماية من خصم كمّي مستقبلي.

يغلّف الـ SDK هذا في سطح صغير وعديم الأثر الجانبي (idempotent) بحيث يصبح
تطبيق dApp **آمنًا كمّيًا افتراضيًا**: استدعاء واحد ليُحمى بـ PQC. وعلى الشبكات
الحيّة لا يكون هذا اختياريًا لمعاملات المسار الأصلي (Native): يجب تسجيل المفتاح
**صراحةً** (لا يوجد تسجيل تلقائي عند أول معاملة)، ثم يجب أن تحمل كل معاملة
على المسار الأصلي التوقيع الهجين.

## التحقق من الحالة {#check-status}

تقرأ `isPqcRegistered` / `getPqcStatus` ما إذا كان لعنوان مفتاح PQC مسجّل
عبر طريقة JSON-RPC المسمّاة `qor_getPQCKeyStatus`. وهما تقبلان إمّا
`QorClient` أو العميل المُركّب من `createClient`. **لا تخدم نقاط النهاية
العامة مساحة الأسماء `qor_`** (انظر
[مساحة الأسماء `qor_`](/api-reference/json-rpc-qor_-namespace))، لذا تفشل
هذه المساعِدات مقابل `*.qore.host` بخطأ JSON-RPC رقم `-32601`. اقرأ الحالة
عبر REST بدلًا من ذلك:

```ts
import { createClient } from "@qorechain/sdk";

const client = createClient({
  network: "mainnet",
  endpoints: {
    rest: "https://api.qore.host",
    rpc: "https://rpc.qore.host",
    evmRpc: "https://evm.qore.host",
  },
});

async function isPqcRegistered(address: string): Promise<boolean> {
  const res = await client.rest.get<{ found: boolean }>(
    `/qorechain/pqc/v1/account/${address}`,
  );
  return res.found;
}
```

المسار هو `GET /qorechain/pqc/v1/account/{address}` (`account` بصيغة المفرد).
وهو يردّ بـ `{"found": true, "account": {…}}` لعنوان مسجّل وبـ
`{"found": false, "account": null}` فيما عدا ذلك. لا تستخدم `client.rest.getPqcAccount`
لهذا الغرض: فهي تستدعي المسار بصيغة الجمع `/accounts/`، وهو مسار لا تخدمه السلسلة.

تظل `isPqcRegistered(client, address)` و`getPqcStatus(client, address)` (مع الخيار
`statusSource`) الاستدعاءين الصحيحين مقابل عقدة تخدم مساحة الأسماء `qor`؛
ونتيجتهما هي
`{ registered: boolean; algorithmId?: number; pubkey?: string | Uint8Array }`.

تكون الحالة نفسها قابلة للقراءة أيضًا على جانب EVM عبر مكوّن ما قبل التجميع
`pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey)`
على العنوان `0x0000000000000000000000000000000000000A02` (مكشوف باسم
`pqcKeyStatus` في `@qorechain/evm`) متى أصبح ذلك الـ precompile فعّالًا؛ وهو غير
فعّال بعد على الشبكة الرئيسية ولا على الشبكة التجريبية (انظر
[حالة الشبكة](/developer-guide/evm-precompiles#network-status)). ستعود
الإصدارة التصحيحية القادمة من الـ SDK إلى مسار REST أعلاه عندما تُعطى عميلًا يكشف
`.rest` (مثل العميل المُركّب)، وسترمي خطأً بدلًا من الإبلاغ بـ «غير مسجّل»
عندما يتعذّر قراءة الحالة.

## التسجيل باستدعاء واحد

تجعل `ensurePqcRegistered` الحساب آمنًا كمّيًا. وهي تبني وتبثّ
`MsgRegisterPQCKeyV2` بمفتاح ML-DSA-87 العام للموقّع ومفتاح ECDSA العام للحساب.
وهي **عديمة الأثر الجانبي** عندما تمرّر لها `status` مقروءًا مسبقًا (أو
`statusSource`): فتتخطّى التسجيل عندما يكون المفتاح مسجّلًا مسبقًا، فيكون
استدعاؤها آمنًا عند كلّ بدء للتطبيق.

يُوقَّع التسجيل توقيعًا كلاسيكيًا ويُعفى من اشتراط التوقيع الهجين، بحيث يستطيع
الحساب الجديد تهيئة مفتاحه الأول. ويُوقَّع عبر موقّع CosmJS، أي حساب بنوع العملة
118 (`deriveNativeAccount`)؛ أمّا للحساب الموحّد eth-native فوقّع التسجيل
بـ `EthNativeSigner` مع `signMode: "classical"` (انظر
[الحسابات وتوقيع PQC](/sdk/concepts/accounts-pqc#hybrid-signing)). يحتاج المفتاح
البالغ 2592 بايت إلى حدّ غاز يقارب 600,000؛ والحدّ الأدنى لسعر الغاز في الشبكة هو 0.1 uqor
لكل وحدة غاز.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  ensurePqcRegistered,
} from "@qorechain/sdk";

const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const tx = await client.connectTx(signer);

// The address-bound key, recoverable from { address, mnemonic } (SDK 0.8.3+).
// Never register a throwaway key from generatePqcKeypair() unless you store it.
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);

// Read the status over REST: the default status source needs the `qor_` namespace.
const { found } = await client.rest.get<{ found: boolean }>(
  `/qorechain/pqc/v1/account/${account.address}`,
);

const res = await ensurePqcRegistered(tx, {
  pqcKeypair,
  ecdsaPubkey: account.publicKey,
  status: { registered: found },
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
});
// res: { alreadyRegistered: boolean; txHash?: string }
```

## التوقيع الهجين

تضمن `migrateToHybrid` التسجيل وتعيد مسار إرسال هجين مع ربط زوج المفاتيح
مسبقًا بباني `buildHybridTx` / `signAndBroadcastHybrid` الموجودَين. مرّر `rest`
ليتمكّن الـ SDK من تحديد صيغة بايتات التوقيع (sign-bytes) الهجينة التي تتحقّق منها
الشبكة (انظر
[أي صيغة لبايتات التوقيع؟](/sdk/concepts/accounts-pqc#sign-bytes-versions)):

```ts
import { StargateClient } from "@cosmjs/stargate";
import { migrateToHybrid, qorechainRegistry } from "@qorechain/sdk";

const hybrid = await migrateToHybrid(tx, {
  pqcKeypair,
  ecdsaPubkey: account.publicKey,
  status: { registered: found },
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
});

const transport = await StargateClient.connect("https://rpc.qore.host");
const info = await transport.getSequence(account.address);

await hybrid.signAndBroadcastHybrid({
  registry: qorechainRegistry(),
  signer,          // classical secp256k1 direct signer
  messages,
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" },
  chainId: "qorechain-vladi",
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: "https://api.qore.host",
  transport,       // a connected broadcast transport (e.g. StargateClient)
});
```

تقبل السلسلة أي توقيع ML-DSA-87 صالح وفق FIPS-204، سواء كان مغطّى بعشوائية
(hedged) أو حتميًا. يوقّع الـ SDK توقيعًا حتميًا افتراضيًا (منذ 0.5.1) بحيث
يكون للمعاملة دائمًا التوقيع نفسه وتجزئة المعاملة نفسها. وإذا فشلت معاملة هجينة
بالرمز `pqc` رقم 21 (`hybrid_verify_failed`)، فالسبب هو إصدار sign-bytes
أو معرّف السلسلة (chain-id) أو مكتبة PQC قديمة أو مفتاح غير مسجّل أو مختلف، وليس
التوقيع المغطّى بعشوائية أبدًا: انظر
[استكشاف أخطاء الرمز 21](/developer-guide/post-quantum-signing#code-21).

## تدوير مفتاح

لاستبدال مفتاح ML-DSA-87 لحساب بمفتاح آخر من **الخوارزمية نفسها**
(مثلًا نقل مفتاح قديم `shake256(mnemonic)` إلى المفتاح القانوني المرتبط بالعنوان،
أو إخراج مفتاح مخترَق من الخدمة)، ابنِ `MsgRotatePQCKey` باستخدام
`rotatePqcKeyMsgFromMnemonic`؛ ويوقّعها المفتاحان معًا. انظر
[تدوير المفاتيح](/sdk/guides/authenticators#key-rotation) للاطّلاع على المثال الكامل.

تبثّ `migratePqcKey` الرسالة الأقدم `MsgMigratePQCKey`، التي تنقل حسابًا
بين **الخوارزميات** وتتطلب أن يوفّر المستدعي كلا التوقيعين:

```ts
import { migratePqcKey } from "@qorechain/sdk";

await migratePqcKey(tx, {
  oldPublicKey,
  newPublicKey,
  oldSignature, // by the old key
  newSignature, // by the new key
});
```

## في واجهة المستخدم

تكشف عدّة [`@qorechain/react`](/sdk/guides/react) عن كلّ هذا في React: يُظهِر
خطّاف `usePqcStatus` ومكوّن `<QuantumSafeBadge/>` مؤشر **آمن كمّيًا**
كلّما كان للحساب المتّصل مفتاح PQC مسجّل. كلاهما يقرأ الحالة عبر
`getPqcStatus`، لذا مقابل نقاط النهاية العامة (التي لا تحوي مساحة الأسماء `qor_`)
لا يستطيعان تأكيد وجود مفتاح اليوم؛ انظر قيود الشبكات الحيّة في صفحة React.
