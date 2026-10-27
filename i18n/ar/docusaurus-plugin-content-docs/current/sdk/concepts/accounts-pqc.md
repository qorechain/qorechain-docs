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

الإيداع إلى **أي** من العناوين الثلاثة يصل إلى رصيد **واحد**، والمفتاح الواحد
هو الموقِّع على كل مسار (على مسار EVM داخل
[نافذة تفويض](/sdk/guides/evm#evm-window)؛ أما مسار معاملات SVM فهو معطّل
حاليًا على مستوى الشبكة كلها، لذا فإن SVM للقراءة فقط اليوم):

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
account.publicKey;    // "0x…" hex string of the 33-byte compressed secp256k1 key
account.privateKey;   // "0x…" hex string (a secret: never log or commit it)
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
عبارة الاسترجاع هي `"seed:" + hex(seed32)`.) منذ SDK 0.8.3 تقوم
`derivePqcCanonical(account, mnemonic)` أولًا بتحويل `account` إلى صيغته
`qor1…` بأحرف صغيرة (`canonicalAccount`)، لذا فإن عنوان bech32 بأحرف كبيرة أو
صيغة `0x` للحساب نفسه تُنتج المفتاح نفسه.
لكل لغة الدالة نفسها (Python `derive_pqc_canonical`، وGo
`authenticator.DerivePQCCanonical`، وRust `try_derive_pqc_canonical`، وJava
`Authenticator.derivePqcCanonical`؛ راجع
[الجدول في دليل الأمان الكمومي](/sdk/guides/quantum-safe#canonical-derivation))،
ويعطي `{ address, mnemonic }` نفسه المفتاح نفسه في جميعها (جرى التحقق من
TypeScript وPython وGo وRust في أكتوبر 2026).

### الإرسال على مسار Native باستخدام مفتاح eth

يوقّع الحساب الموحّد معاملات مسار Native بمخطط `eth_secp256k1`: التوقيع
الكلاسيكي هو secp256k1 على **keccak256** لبايتات SignDoc (وليس sha256)،
ويستخدم المفتاح العام في `SignerInfo` عنوان النوع (type URL)
`/cosmos.evm.crypto.v1.ethsecp256k1.PubKey`. أما المسار الهجين
(`signHybridEth`، أو `EthNativeSigner` مع قيمته الافتراضية
`signMode: "hybrid"`) فيُرفق إضافةً إلى ذلك امتداد `PQCHybridSignature` الخاص
بـ ML-DSA-87، وهو مطلوب على الشبكات الحية.

يلزم أمران قبل أول إرسال هجين. أولًا، يجب **تسجيل** مفتاح ML-DSA-87 الخاص
بالحساب (مرة واحدة). التسجيل هو المعاملة الوحيدة الموقَّعة كلاسيكيًا
والمعفاة من متطلب التوقيع الهجين: وقِّعها باستخدام `signMode: "classical"`.
إن `publicKey` الخاص بالحساب سلسلة سداسية عشرية بالبادئة `0x`، لذا فك ترميزها
إلى بايتات لاستخدامها في `ecdsaPubkey`. ثانيًا، مرِّر `rest` إلى الموقِّع
ليتمكن من سؤال الشبكة عن [صيغة بايتات التوقيع](#sign-bytes-versions) التي
تتحقق منها (وعلى `qorechain-vladi` و`qorechain-diana` يرمي خطأ بدلًا من
التخمين). يتطلب SDK 0.8.1 أو أحدث (و0.9.0 لدوال إثبات الحيازة المساعدة)، و`npm i @cosmjs/stargate`:

```ts
import { StargateClient } from "@cosmjs/stargate";
import {
  createClient,
  deriveUnifiedAccount,
  EthNativeSigner,
  buildRegisterPqcKeyMsg,
  signProofOfPossession,
  toBase,
} from "@qorechain/sdk";

const REST = "https://api.qore.host";
const RPC = "https://rpc.qore.host";
const CHAIN_ID = "qorechain-vladi";

const client = createClient({ network: "mainnet", endpoints: { rest: REST, rpc: RPC } });
const transport = await StargateClient.connect(RPC);
const account = await deriveUnifiedAccount(mnemonic);

// The REST account record carries the number and sequence (the account must
// exist, that is, have received funds).
async function authInfo() {
  const { account: base } = await client.rest.get<{
    account: { account_number: string; sequence: string };
  }>(`/cosmos/auth/v1beta1/accounts/${account.cosmos}`);
  return { accountNumber: BigInt(base.account_number), sequence: BigInt(base.sequence) };
}

// 1) Register the ML-DSA-87 key once (classical-signed, exempt from the hybrid rule).
const classical = new EthNativeSigner(account, { signMode: "classical" });
await classical.signAndBroadcast(transport, {
  chainId: CHAIN_ID,
  ...(await authInfo()),
  messages: [
    buildRegisterPqcKeyMsg(account.cosmos, {
      pqcKeypair: account.pqc,
      ecdsaPubkey: Uint8Array.from(Buffer.from(account.publicKey.slice(2), "hex")),
      // Optional since v3.2.3 (SDK 0.9.0+): the new key signs a proof that its owner
      // holds the secret. Leave it out on a network that has not applied v3.2.3,
      // because an older node refuses the whole transaction when the field is set.
      proofOfPossession: signProofOfPossession({
        chainId: CHAIN_ID,
        account: account.cosmos,
        keypair: account.pqc,
      }),
    }),
  ],
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" }, // the 2,592-byte key needs about 600k gas
});

// 2) Send with the hybrid signature (the default signMode).
const signer = new EthNativeSigner(account, { rest: REST });
const res = await signer.bankSend(
  transport,
  "qor1recipient…",
  [{ denom: "uqor", amount: toBase("1.5") }],
  {
    chainId: CHAIN_ID,
    ...(await authInfo()),
    fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" }, // 0.1 uqor per gas is the floor
  },
);
console.log(res.transactionHash);
```

لمزيد من التحكم منخفض المستوى، تُعيد `signHybridEth(params)` /
`signClassicalEth(params)` بايتات `TxRaw` المُجمّعة ومخرجات التوقيع، بينما
تقرأ `accountAuthInfo(baseAccount)` قيمتي `account_number` / `sequence` من
`BaseAccount` بصيغة protobuf يستخدم مفتاحه العام على السلسلة عنوان النوع
`eth_secp256k1` (أما حساب REST بصيغة JSON فتجب مواءمة حقوله أولًا، كما تفعل
`authInfo` أعلاه).

:::caution قم بالترقية إلى SDK 0.6.1+ للمعاملات الهجينة
أصلح إصدار SDK ‏**0.6.1** خطأ ترميز حرجًا على مستوى الإجماع: كان امتداد
جسم المعاملة `/qorechain.pqc.v1.PQCHybridSignature` يُسلسل بصيغة JSON داخل
`Any.value`، وكانت السلسلة **ترفض تلك المعاملات عند CheckTx** (خطأ تحليل
المعاملة). أصبح الآن مرمَّزًا بصيغة protobuf (تبدأ قيمة الامتداد بـ `0x08`)
في اللغات الخمس جميعها. أي معاملة هجينة — بما في ذلك مسار eth-native —
مبنية بإصدار SDK ‏≤ 0.6.0 تُرفض على السلسلة: قم بالترقية إلى 0.6.1 أو أحدث.
:::

### Phantom والمحافظ الخارجية الأخرى {#phantom}

:::danger أُزيلت في SDK 0.8.0
تضمّنت إصدارات SDK من 0.6.0 إلى 0.7.0 الدالتين `connectPhantomUnified()` و`unifiedAccountFromPhantomSignature()` (أُزيلتا في 0.8.0؛ وفي Python وRust: `unified_account_from_phantom_signature`، وفي Go: `unified.UnifiedAccountFromPhantomSignature`، وفي Java: `UnifiedAccounts.unifiedAccountFromPhantomSignature`)، وكانتا تشتقان مفتاح الإنفاق للحساب من توقيع Phantom على الرسالة الثابتة `QoreChain unified account derivation v1` متبوعة بالمفتاح العام للمحفظة بصيغة base58.
توقيع ed25519 حتمي، وأي موقع ويب يستطيع أن يطلب من المحفظة توقيع الرسالة نفسها، لذا يستطيع كل من حصل على ذلك التوقيع يومًا إعادة بناء مفتاحي secp256k1 وML-DSA للحساب. الدالتان الآن ترميان خطأ.

إذا أنشأت حسابًا بهذه الطريقة فاعتبره مخترقًا الآن: أنشئ حسابًا جديدًا من عبارة استرجاع (mnemonic)، وانقل الأموال إليه، ثم اربط Phantom بالحساب الجديد كمُصادِق (انظر أدناه). لا يمكن إصلاح الحساب القديم، لأن عنوانه مرتبط بالمفتاح المكشوف، وتدوير مفتاح PQC لا يستبدل إلا النصف ما بعد الكمّي. استخدم SDK 0.8.2 أو أحدث.
:::

لتمكين مفتاح Phantom (أو MetaMask) من الإنفاق من حساب، استخدم **مسارات المُصادِقات**: سجّل مفتاح المحفظة عبر `MsgRegisterAuthenticator`، ثم أنفق من حساب PQC القياسي عبر `MsgExecuteCosmos` / `MsgExecuteEVM` ضمن صلاحية و`SpendingRule`. يحتفظ الحساب بمفاتيحه المشتقة من عبارة الاسترجاع، ويمكن إلغاء مفتاح المحفظة في أي وقت. انظر [المُصادِقات والإنفاق المفوَّض](/sdk/guides/authenticators). لاحظ أن وحدة `abstractaccount` التي توفّر هذه المسارات معطّلة على الشبكة الرئيسية (يُظهر `GET /qorechain/abstractaccount/v1/config` القيمة `enabled: false`؛ وهي مفعَّلة على شبكة الاختبار)، لذا لا يمكن ربط مفتاح محفظة على الشبكة الرئيسية بعد؛ وإلى أن يصبح ذلك ممكنًا استخدم حساب عبارة الاسترجاع الجديد مباشرة.

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
`PqcSigner` و`HybridSigner`، ونوع `SignatureMode` (`"classical" | "pqc" |
"hybrid"`). استخدم هذه العناصر
عندما تريد دمج توقيع PQC في تدفقك الخاص بدلًا من استدعاء العمليات الأولية
مباشرةً.

## التوقيع الهجين {#hybrid-signing}

تحمل المعاملة **الهجينة** توقيع secp256k1 كلاسيكيًا وتوقيع ML-DSA-87 معًا،
فتبقى صالحة في ظل التحقق الكلاسيكي مع اكتسابها حماية ما بعد كمومية. وينتقل
الجزء ما بعد الكمومي كامتداد `PQCHybridSignature` على المعاملة.

:::caution التوقيع الهجين مطلوب على مسار Native
اعتبارًا من إصدار السلسلة **v3.2.0** (تعمل الشبكة الرئيسية بالإصدار v3.2.4 وشبكة الاختبار بالإصدار v3.2.6)،
الإعداد الافتراضي للشبكة هو
`hybrid_signature_mode = required` مع `allow_classical_fallback = false`.
التوقيع الهجين عبر `buildHybridTx` / `signAndBroadcastHybrid` (مرِّر `rest`)،
أو `signHybridEth` / `EthNativeSigner` للحسابات الموحّدة eth-native، **إلزامي**
لمعاملات مسار Native؛ وتُرفض المعاملات الكلاسيكية فقط على مسار Native على
السلسلة. أما معاملات EVM فهي مسار منفصل، لكنها منذ v3.2.0 لا تُقبل إلا من
حساب لديه مفتاح ML-DSA-87 مسجَّل و[نافذة تفويض](/sdk/guides/evm#evm-window)
مفتوحة.
:::

:::caution المعاملات الهجينة بإصدار SDK ‏≤ 0.6.0 مرفوضة
أصلح إصدار 0.6.1 ترميز امتداد `PQCHybridSignature` ‏(من JSON إلى protobuf،
حرج على مستوى الإجماع). المعاملات الهجينة المبنية بإصدار SDK ‏0.6.0 أو أقدم
تفشل عند CheckTx بخطأ تحليل المعاملة — قم بالترقية إلى 0.6.1 أو أحدث.
:::

أداة البناء الشاملة لحساب من نوع coin type 118 هي `signAndBroadcastHybrid`
(أو `buildHybridTx` للبناء دون بث). وتحتاج إلى الموقِّع الكلاسيكي، وزوج مفاتيح
ML-DSA-87 الخاص بالحساب، ورقم الحساب والتسلسل (sequence)، و`rest`.
بالنسبة إلى حساب من نوع coin type 118 في TypeScript، أقصر مسار هو `TxClient`
الهجين (SDK 0.9.0): مرِّر زوج المفاتيح عند الاتصال فتُوقَّع كل معاملة توقيعًا
هجينًا، مع `fee: "auto"` الذي يحاكي المعاملة الهجينة نفسها (أما التسجيل وحده
فيبقى كلاسيكيًا):

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  toBase,
} from "@qorechain/sdk";

const client = createClient({
  network: "mainnet",
  endpoints: { rest: "https://api.qore.host", rpc: "https://rpc.qore.host", evmRpc: "https://evm.qore.host" },
});
const account = await deriveNativeAccount(mnemonic);                  // coin type 118
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);     // the key registered on-chain

const tx = await client.connectTx(signer, { pqcKeypair });            // signs every transaction hybrid
await tx.bankSend("qor1recipient…", [{ denom: "uqor", amount: toBase("1.5") }]);
```

للتحكم الصريح في الرسوم ورقم الحساب والتسلسل، استخدم `signAndBroadcastHybrid`
(SDK 0.8.1 أو أحدث، و`npm i @cosmjs/stargate`):

```ts
import { StargateClient } from "@cosmjs/stargate";
import {
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  signAndBroadcastHybrid,
  qorechainRegistry,
  MSG_SEND_TYPE_URL,
  toBase,
} from "@qorechain/sdk";

const REST = "https://api.qore.host";
const RPC = "https://rpc.qore.host";

const account = await deriveNativeAccount(mnemonic);                  // coin type 118
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);     // the key registered on-chain
const transport = await StargateClient.connect(RPC);
const info = await transport.getSequence(account.address);            // { accountNumber, sequence }

const result = await signAndBroadcastHybrid({
  registry: qorechainRegistry(),
  signer,
  pqcKeypair,
  messages: [
    {
      typeUrl: MSG_SEND_TYPE_URL,
      value: {
        fromAddress: account.address,
        toAddress: "qor1recipient…",
        amount: [{ denom: "uqor", amount: toBase("1.5") }],
      },
    },
  ],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" }, // 0.1 uqor per gas is the floor
  chainId: "qorechain-vladi",
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: REST,        // lets the SDK pick the v1/v2 PQC sign-bytes form
  transport,
});
```

### المتطلب المسبق على السلسلة

قبل أن تجتاز المعاملة الهجينة تحقق PQC، يجب **تسجيل** المفتاح العام PQC الخاص
بالموقّع عبر `MsgRegisterPQCKeyV2` (موقَّعة كلاسيكيًا ومعفاة من التوقيع
الهجين لحساب لا يملك مفتاحًا بعد). وتقوم بذلك الدالتان
`ensurePqcRegistered` / `buildRegisterPqcKeyMsg` في SDK، أو الأمر
`qorechaind tx pqc
register-key`، أو محفظة QoreChain. أما `includePqcPublicKey: true` فتضمّن
المفتاح في الامتداد فقط؛ وهي **لا** تسجّله، والسلسلة لا تسجّل مفتاحًا عند أول
استخدام. منذ الإصدار v3.2.3 ترفض السلسلة المفاتيح الضعيفة والمنحلّة والمُعاد
استخدامها، وتقبل إثبات حيازة (proof of possession) اختياريًا (راجع
[قواعد سلامة المفاتيح](/architecture/post-quantum-security#key-integrity))؛
وفي SDK 0.9.0 تُرفق `ensurePqcRegistered` الإثبات تلقائيًا متى طبّقت الشبكة v3.2.3، وتُصدَّر
`signProofOfPossession` / `verifyProofOfPossession` لعمليات التسجيل المبنية يدويًا؛ أما أدوات
البناء في 0.8.x فتسجّل دون إثبات، وهذا مسموح.

### أي صيغة لبايتات التوقيع؟ {#sign-bytes-versions}

يُوقَّع النصف ML-DSA-87 من المعاملة الهجينة على إحدى صيغتين للبايتات، وتتحقق
الشبكة من صيغة واحدة فقط عند أي ارتفاع:

```text
v1: BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A
v2: "qorechain-pqc-hybrid-v2" ‖ BE64(len chainId) ‖ chainId ‖ BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A
```

`B0` هو جسم المعاملة دون امتداد PQC، و`A` هي بايتات `AuthInfo`.
تتحقق كل من `qorechain-vladi` و`qorechain-diana` من الصيغة **v2**. سُجّل التبديل
تحت اسم الترقية `v3.2.0` على الشبكة الرئيسية وتحت `v3.1.98` (ثم
`v3.2.0`) على الشبكة التجريبية، لذا يجب على العميل أن يستعلم
`GET /cosmos/upgrade/v1beta1/applied_plan/{name}` عن **كلا** الاسمين وأن يستخدم v2 إذا
كان ارتفاع أي منهما أكبر من الصفر. تفعل حزمة SDK ذلك نيابةً عنك: يقبل كل
مُنشئ هجين المعامل
`signBytesVersion` (القيمة الافتراضية `"auto"`، أو `"v1"` / `"v2"`)، وتتطلب
`"auto"` عنوان REST الخاص بالشبكة (`rest`) على هاتين السلسلتين: فهي ترمي خطأ
بدلًا من التخمين. وتعيد المسارات عالية المستوى الحل وتعيد المحاولة مرة واحدة
عندما ترفض السلسلة التوقيع برمز `pqc` رقم 21. في اختبارات الوحدة مرِّر
`signBytesVersion` صراحةً حتى لا يعتمد الاختبار على عقدة حية. راجع أيضًا
[استكشاف الأخطاء: الرمز 21](/developer-guide/post-quantum-signing#code-21).

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
