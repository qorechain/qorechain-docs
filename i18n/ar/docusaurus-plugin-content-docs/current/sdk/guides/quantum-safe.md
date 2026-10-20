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

تقرأ `isPqcRegistered` / `getPqcStatus` ما إذا كان لعنوان مفتاح PQC مسجّل.
وعند تمرير العميل المُركّب من `createClient` تقرآن عبر REST
(`GET /qorechain/pqc/v1/account/{address}`، التي تخدمها كل نقطة نهاية عامة)؛ وعند
تمرير `QorClient` مجرّد تستخدمان طريقة JSON-RPC المسمّاة `qor_getPQCKeyStatus`،
التي **لا تخدمها نقاط النهاية العامة** (انظر
[مساحة الأسماء `qor_`](/api-reference/json-rpc-qor_-namespace))، لذا مرّر
العميل المُركّب مقابل `*.qore.host`. كانت الإصدارات السابقة لـ 0.9.0 تستخدم دائمًا
الطريقة `qor_` وتفشل بخطأ JSON-RPC رقم `-32601`؛ فاقرأ مسار REST مباشرةً هناك.

```ts
import { createClient, isPqcRegistered, getPqcStatus } from "@qorechain/sdk";

const client = createClient({
  network: "mainnet",
  endpoints: {
    rest: "https://api.qore.host",
    rpc: "https://rpc.qore.host",
    evmRpc: "https://evm.qore.host",
  },
});

const registered = await isPqcRegistered(client, address); // boolean
const status = await getPqcStatus(client, address);
// { registered: boolean; algorithmId?: number; pubkey?: string | Uint8Array }
```

المسار هو `GET /qorechain/pqc/v1/account/{address}` (`account` بصيغة المفرد).
وهو يردّ بـ `{"found": true, "account": {…}}` لعنوان مسجّل وبـ
`{"found": false, "account": null}` فيما عدا ذلك؛ وتُعيد `client.rest.getPqcAccount(address)`
ذلك الجسم، وتحوّله `fetchPqcStatus({ rest, address })` إلى الحالة أعلاه. أما الإجابة
غير القابلة للقراءة (خطأ HTTP أو فشل في النقل) فتُطلَق كخطأ بعد محاولة إعادة واحدة:
ولا تُقرأ أبدًا على أنها "غير مسجّل". في الإصدارات 0.8.x كانت `getPqcAccount`
تستدعي مسار `/accounts/` بصيغة الجمع الذي لا تخدمه السلسلة.

تكون الحالة نفسها قابلة للقراءة أيضًا على جانب EVM عبر مكوّن ما قبل التجميع
`pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey)`
على العنوان `0x0000000000000000000000000000000000000A02` (مكشوف باسم
`pqcKeyStatus` في `@qorechain/evm`) متى أصبح ذلك الـ precompile فعّالًا؛ وهو غير
فعّال بعد على الشبكة الرئيسية ولا على الشبكة التجريبية (انظر
[حالة الشبكة](/developer-guide/evm-precompiles#network-status)).

## التسجيل باستدعاء واحد {#register-in-one-call}

تجعل `ensurePqcRegistered` الحساب آمنًا كمّيًا. وهي تبني وتبثّ
`MsgRegisterPQCKeyV2` بمفتاح ML-DSA-87 العام للموقّع. وهي **عديمة الأثر الجانبي**:
فهي تقرأ حالة الحساب أولًا (عبر REST عندما تمرّر `rest`)، وتتخطّى التسجيل عندما
يحمل الحساب مفتاح زوج المفاتيح هذا بالفعل، ولذلك يكون استدعاؤها آمنًا عند كلّ بدء
للتطبيق. وعندما يحمل الحساب مفتاحًا *مختلفًا* تُطلق `PqcKeyMismatchError` ولا
ترسل شيئًا، لأن كل معاملة هجينة موقَّعة بزوج مفاتيحك ستُرفض. وهي لا تسجّل أبدًا
دون تحقّق: فإن تعذّرت قراءة الحالة تُطلق خطأً (ولا تمرّر `force: true` إلا لحساب
تعرف أنه لا يملك مفتاحًا).

يُوقَّع التسجيل توقيعًا كلاسيكيًا ويُعفى من اشتراط التوقيع الهجين، بحيث يستطيع
الحساب الجديد تهيئة مفتاحه الأول؛ ومنذ v3.2.3 يقتصر هذا الإعفاء على حساب لا مفتاح
له (أما الحساب الذي يحمل مفتاحًا بالفعل فيجب أن يوقّع التسجيل أو الترحيل توقيعًا
هجينًا، وترفض السلسلة المفاتيح الضعيفة أو المنحلّة أو المعاد استخدامها). وبمجرد أن
تطبّق الشبكة v3.2.3 توقّع المساعِدة **إثبات الحيازة** الاختياري بالمفتاح الجديد
وتُرفقه (تقرأ معرّف السلسلة من `chainId` أو من العقدة، وتترك الحقل خارجًا على شبكة
لم تطبّق v3.2.3، لأن العقدة الأقدم ترفضه). ويُوقَّع عبر موقّع CosmJS، أي حساب بنوع
العملة 118 (`deriveNativeAccount`)؛ أمّا للحساب الموحّد eth-native فوقّع التسجيل
بـ `EthNativeSigner` مع `signMode: "classical"` (انظر
[الحسابات وتوقيع PQC](/sdk/concepts/accounts-pqc#hybrid-signing)). يحتاج المفتاح
البالغ 2,592 بايت إلى حدّ غاز يقارب 600,000؛ والحدّ الأدنى لسعر الغاز في الشبكة هو 0.1 uqor
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

// The address-bound key, recoverable from { address, mnemonic } (0.8.3+; see below).
// Never register a throwaway key from generatePqcKeypair() unless you store it.
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);

// With the keypair the client signs every transaction hybrid; the registration
// itself stays classical (the chain's bootstrap path).
const tx = await client.connectTx(signer, { pqcKeypair });

const res = await ensurePqcRegistered(tx, {
  pqcKeypair,
  rest: client.network.endpoints.rest,
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
});
// res: { alreadyRegistered: boolean; txHash?: string }

await tx.bankSend("qor1…", [{ denom: "uqor", amount: "1000000" }]); // hybrid-signed
```

### مفتاح يمكنك استرداده {#canonical-derivation}

تشتق `derivePqcCanonical(address, mnemonic)` مفتاح ML-DSA-87 للحساب من عنوانه
وعبارة الاسترجاع الخاصة به، فيمكن استرداد الجهاز المفقود وتشتق كل لغة ومحفظة
المفتاح نفسه (عبارة استرجاع واحدة، ومفتاح واحد لكل حساب). وهي تحوّل العنوان أولًا
إلى صيغته `qor1…` بأحرف صغيرة، لذا تعطي صيغة `0x` للحساب الموحّد المفتاح نفسه.
المكافئات:

| اللغة | الدالة | منشورة |
| --- | --- | --- |
| TypeScript | `derivePqcCanonical(address, mnemonic)` (`@qorechain/sdk`) | 0.9.0 |
| Python | `derive_pqc_canonical(address, mnemonic)` (`qorsdk`) | 0.9.0 |
| Go | `authenticator.DerivePQCCanonical(address, mnemonic)` | v0.9.0 |
| Rust | `authenticator::try_derive_pqc_canonical(address, mnemonic)` (تُرجع `Result`) | 0.9.0 |
| Java | `Authenticator.derivePqcCanonical(address, mnemonic)` | 0.9.0 |

الاشتقاق القديم (`derivePqcLegacy`، `"bridge"`) غير مرتبط بالحساب وهو
مهجور للمفاتيح الجديدة؛ وترفضه مساعِدات التدوير كمفتاح جديد (انظر
[تدوير مفتاح](#rotate-a-key)).

التسجيل في Python (0.9.0؛ تجري قراءة الحالة عبر REST وتُطلق الاستدعاءة
`PqcKeyMismatchError` لمفتاح مسجّل مختلف بدلًا من دفع رسوم تسجيل ثانٍ):

```python
import httpx
from qorsdk import derive_native_account, derive_pqc_canonical, ensure_pqc_registered, fetch_pqc_status

REST = "https://api.qore.host"
native = derive_native_account(mnemonic, 0)
pqc_keypair = derive_pqc_canonical(native.address, mnemonic)

print(fetch_pqc_status(REST, native.address))  # {'registered': False} for a new account

acct = httpx.get(f"{REST}/cosmos/auth/v1beta1/accounts/{native.address}").json()["account"]
result = ensure_pqc_registered(
    account=native,
    pqc_keypair=pqc_keypair,
    chain_id="qorechain-vladi",
    account_number=int(acct["account_number"]),
    sequence=int(acct.get("sequence", 0)),
    rest_url=REST,
    fee={"amount": [{"denom": "uqor", "amount": "60000"}], "gas": "600000"},
)
```

وتقرأ مساعِدات Go (`pqcdx.Signer.RestURL`) وRust (`pqc_dx` `rest_url`) وJava
(`signer.restUrl`) الحالة من مسار REST نفسه وتُرفق إثبات الحيازة بالطريقة نفسها.

وتوقّع حزم SDK الأخرى توقيعًا هجينًا عبر بُناة المعاملات الهجينة فيها
(`build_hybrid_tx` في Python وRust، و`tx.BuildHybridMessages` في Go،
و`PqcDx.HybridSendPath` في Java)؛ ولا يوقّع هجينًا نيابةً عنك سوى `TxClient` في TypeScript.

:::warning دعها تتحقق أولًا دائمًا
ترفض السلسلة تسجيلًا ثانيًا للمفتاح نفسه **بعد اقتطاع الرسوم**. لذلك تقرأ
`ensurePqcRegistered` الحالة أولًا، عبر REST
(`/qorechain/pqc/v1/account/{address}`)، وترفض التسجيل عندما لا تستطيع
التمييز. مرّر `rest` (أو `statusSource` لعقدة تكشف `qor_*`، أو `status` مقروءًا
مسبقًا)؛ ويتخطّى `force: true` التحقق. في الإصدارات 0.8.x لم يكن للمساعِدة
بديل REST وكانت تبثّ التسجيل دون تحقق ما لم تمرّر `status` بنفسك.
:::

## التوقيع الهجين

مع وجود `pqcKeypair` على العميل، توقّع `tx.bankSend(...)` و
`tx.signAndBroadcast([messages], "auto")` توقيعًا هجينًا (يحاكي مسار `fee: "auto"`
المعاملة الهجينة ويضيف غاز التحقق ما بعد الكمّي). يُحسب التوقيع الهجين على صيغة
بايتات التوقيع التي تتحقق منها الشبكة (انظر
[أي صيغة لبايتات التوقيع؟](/sdk/concepts/accounts-pqc#sign-bytes-versions))؛
ويسأل العميل الشبكة عبر نقطة نهاية REST الخاصة بها.

تضمن `migrateToHybrid` التسجيل وتعيد مسار إرسال هجين مع ربط زوج المفاتيح
مسبقًا ببُناة `buildHybridTx` / `signAndBroadcastHybrid` منخفضي المستوى،
لحالة إدارتك الرسوم ورقم الحساب والتسلسل بنفسك. مرّر `rest`
ليتمكّن الـ SDK من تحديد صيغة بايتات التوقيع (sign-bytes):

```ts
import { StargateClient } from "@cosmjs/stargate";
import { migrateToHybrid, qorechainRegistry } from "@qorechain/sdk";

const hybrid = await migrateToHybrid(tx, {
  pqcKeypair,
  rest: "https://api.qore.host",
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

## تدوير مفتاح {#rotate-a-key}

لاستبدال مفتاح ML-DSA-87 لحساب بمفتاح آخر من **الخوارزمية نفسها**
(مثلًا نقل مفتاح قديم `shake256(mnemonic)` إلى المفتاح القانوني المرتبط بالعنوان،
أو إخراج مفتاح مخترَق من الخدمة)، ابنِ `MsgRotatePQCKey` باستخدام
`rotatePqcKeyMsgFromMnemonic`؛ ويوقّعها المفتاحان معًا. انظر
[تدوير المفاتيح](/sdk/guides/authenticators#key-rotation) للاطّلاع على المثال الكامل.

تبثّ `migratePqcKeyHybrid` الرسالة الأقدم `MsgMigratePQCKey`، التي تنقل حسابًا
بين **الخوارزميات**، بالتوقيع الهجين الذي تتطلبه السلسلة منذ v3.2.3 من
حساب يملك مفتاحًا. و`pqcKeypair` هو المفتاح المسجَّل **حاليًا**
(الذي يجري إخراجه من التدوير)، ويوفّر المستدعي توقيعَي الملكية
(`oldSignature` بالمفتاح القديم، و`newSignature` بالمفتاح الجديد). أما
`migratePqcKey` الكلاسيكية فهي مهجورة: إذ ترفض عقدة v3.2.3 ترحيلًا كلاسيكيًا من
حساب يملك مفتاحًا.

```ts
import { StargateClient } from "@cosmjs/stargate";
import { migratePqcKeyHybrid, qorechainRegistry } from "@qorechain/sdk";

const transport = await StargateClient.connect("https://rpc.qore.host");
const info = await transport.getSequence(account.address);

await migratePqcKeyHybrid({
  sender: account.address,
  registry: qorechainRegistry(),
  signer,
  pqcKeypair,   // the currently registered key
  oldPublicKey,
  newPublicKey,
  oldSignature, // by the old key
  newSignature, // by the new key
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
  chainId: "qorechain-vladi",
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: "https://api.qore.host",
  transport,
});
```

## في واجهة المستخدم

تكشف عدّة [`@qorechain/react`](/sdk/guides/react) عن كلّ هذا في React: يُظهِر
خطّاف `usePqcStatus` ومكوّن `<QuantumSafeBadge/>` مؤشر **آمن كمّيًا**
كلّما كان للحساب المتّصل مفتاح PQC مسجّل. كلاهما يقرأ الحالة عبر
`getPqcStatus` مع العميل المُركّب، لذا ابتداءً من `@qorechain/react`
0.9.0 يقرآنها عبر REST ويعملان مقابل نقاط النهاية العامة؛ أما 0.8.x فلم تكن
تستطيع تأكيد وجود مفتاح هناك.
