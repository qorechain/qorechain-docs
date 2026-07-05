---
slug: /sdk/guides/authenticators
title: الموثِّقات والإنفاق المفوَّض
sidebar_label: الموثِّقات
sidebar_position: 8
---

# الموثِّقات والإنفاق المفوَّض

تتيح **مسارات الموثِّقات** (SDK 0.7.0، السلسلة **v3.1.85**) لمفتاح خارجي
مرتبط — مفتاح **ed25519** من Phantom، أو مفتاح **secp256k1** من MetaMask / EVM —
الإنفاق من الحساب القانوني الوحيد **المُلزَم بـ PQC** وفق شروط قائمة على الحد
الأدنى من الامتيازات، ومحدودة الإنفاق، وقابلة للإلغاء، **دون أن يُنتج المفتاح
الخارجي أبدًا توقيعًا مشتركًا بخوارزمية ML-DSA**.

هذه الصفحة هي نظير SDK لوحدة
[تجريد الحسابات](/developer-guide/account-abstraction) على مستوى السلسلة.

## نموذج المُرحِّل (relayer)

يقوم **المُرحِّل** بإرسال المعاملة ودفع الرسوم. توقيع المُرحِّل الهجين الخاص به
(كلاسيكي + ML-DSA-87) يُلبّي متطلبات معالج ante على الغلاف، وبالتالي لا حاجة
لتوقيع PQC الخاص بالحساب القانوني على السلسلة. التفويض بدلاً من ذلك هو توقيع
المفتاح المرتبط على ملخّص **sign-bytes** مفصولٍ حسب النطاق ومقيَّدٍ ضد إعادة
التشغيل.

```text
 Phantom / MetaMask key            Relayer (pays fees)             Chain
 ─────────────────────            ───────────────────            ─────
 sign(authSignBytes)  ──────────▶ wrap in Msg, sign envelope ──▶ verify authenticator sig
                                                                  check permission + rule
                                                                  spend FROM canonical account
```

المُرحِّل حساب **مختلف** عن المالك، ولذلك لا يزيد قيمة nonce الخاصة بـ EVM
للحساب.

## المسارات الثلاثة

| المسار | الرسالة | Sign-bytes | ما يُنفَق |
| --- | --- | --- | --- |
| EVM | `MsgExecuteEVM` | `evmAuthSignBytes` | QOR أصلي / استدعاء EVM من عنوان الحساب `0x` |
| الأصلي (Native) | `MsgExecuteCosmos` | `cosmosAuthSignBytes` | QOR أصلي عبر `x/bank` من الحساب |
| تدوير المفتاح | `MsgRotatePQCKey` | `rotationSignBytes` | (يُدوِّر مفتاح PQC الخاص بالحساب) |

عناوين URL لأنواع الرسائل هي `/qorechain.abstractaccount.v1.MsgExecuteEVM`،
و`/qorechain.abstractaccount.v1.MsgExecuteCosmos`،
و`/qorechain.pqc.v1.MsgRotatePQCKey`.

## تسجيل موثِّق Phantom

ربط المفتاح يتم **بتوقيع المالك** (معاملة هجينة عادية من الحساب القانوني):
تُحدِّد `MsgRegisterAuthenticator` المفتاح (المخطط + بايتات المفتاح العام الخام)،
و`permissions` الممنوحة، وموعدًا نهائيًا للجلسة `expiryUnix`. تُلحَق حدود
الإنفاق بواسطة `SpendingRule` عبر `MsgUpdateSpendingRules`:

```ts
import { msg } from "@qorechain/sdk";

// The Phantom wallet in the browser:
const phantomPubkey = window.solana.publicKey.toBytes(); // 32-byte ed25519

// 1) Link the key: least privilege ("send" only) + a session expiry.
const register = msg.abstractaccount.registerAuthenticator({
  owner: canonicalAccount,          // the PQC-required account ("qor1…")
  accountAddress: canonicalAccount, // the account the key may act for
  scheme: "ed25519",                // Phantom keys are ed25519
  pubkey: phantomPubkey,
  permissions: ["send"],            // e.g. "send", "evm", "svm" — never "all" for a hot key
  expiryUnix: String(Math.floor(Date.now() / 1000) + 7 * 24 * 3600), // 7 days
  label: "phantom",
});

// 2) Bound what it can move: per-tx and daily limits, uqor only.
const limits = msg.abstractaccount.updateSpendingRules({
  owner: canonicalAccount,
  accountAddress: canonicalAccount,
  rules: [
    {
      id: "phantom-hot",
      perTxLimit: "1000000",    // ≤ 1 QOR per spend
      dailyLimit: "10000000",   // ≤ 10 QOR per day
      allowedDenoms: ["uqor"],
      enabled: true,
    },
  ],
});

// Broadcast BOTH owner-signed (hybrid) — e.g. via the hybrid tx path:
// await signAndBroadcastHybrid({ ..., messages: [register, limits] });
```

لتعطيل مفتاح فورًا، يبثّ المالك
`msg.abstractaccount.revokeAuthenticator({ owner, accountAddress, scheme,
pubkey })`.

## الإنفاق من Phantom (المسار الأصلي، عبر مُرحِّل)

بعد ربط المفتاح، يبني المتصفح رسالة `MsgExecuteCosmos` جاهزة للمُرحِّل:
تُعيد `buildPhantomExecuteCosmos` بناء الملخّص المفصول حسب النطاق، وتجعل
Phantom يوقّعه (`signMessage`)، وتُرجع الرسالة `{ typeUrl, value }`.

**المتصفح (مستخدم Phantom):**

```ts
import { buildPhantomExecuteCosmos } from "@qorechain/sdk";

// window.solana is a Phantom-style wallet: { publicKey, signMessage }.
const msgExecute = await buildPhantomExecuteCosmos({
  wallet: window.solana,
  relayer: relayerAddress,       // who will submit + pay fees
  chainId: "qorechain-vladi",
  account: canonicalAccount,     // the PQC-required owner
  to: recipient,                 // "qor1…"
  amount: "100uqor",             // single-coin amount string
  nonce,                         // the per-authenticator sequence for (account, pubkey)
});

// Ship `msgExecute` to your relayer service (it is already signed by Phantom):
await fetch("/api/relay", {
  method: "POST",
  body: JSON.stringify({
    typeUrl: msgExecute.typeUrl,
    value: {
      ...msgExecute.value,
      pubkey: Buffer.from(msgExecute.value.pubkey).toString("base64"),
      signature: Buffer.from(msgExecute.value.signature).toString("base64"),
      nonce: msgExecute.value.nonce.toString(),
    },
  }),
});
```

**الخادم (المُرحِّل):** يوقّع الغلاف بحسابه **الخاص** (هجين، كالمعتاد على
المسار الأصلي) ويدفع الرسوم. توقيع الموثِّق داخل الرسالة هو التفويض بالإنفاق
من حساب المالك.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
} from "@qorechain/sdk";

const client = createClient({
  network: "mainnet",
  endpoints: {
    rpc: "https://rpc.qore.host",
    rest: "https://api.qore.host",
  },
});

// The relayer's OWN account — a different account than the owner.
const relayer = await deriveNativeAccount(process.env.RELAYER_MNEMONIC!);
const signer = await directSignerFromPrivateKey(relayer.privateKey, "qor");
const tx = await client.connectTx(signer);

// Decode the message from the request, then broadcast it (relayer pays fees).
const result = await tx.signAndBroadcast([msgExecute], { fee });
console.log(result.transactionHash);
```

توجد نسخة كاملة قابلة للتشغيل من البداية إلى النهاية (بمفتاح ed25519 محلي
يقوم مقام Phantom) في مثال
[`authenticator-spend`](https://github.com/qorechain/qorechain-sdk/tree/main/examples/authenticator-spend).

## الإنفاق من MetaMask (مسار EVM)

يُربَط مفتاح MetaMask بواسطة **عنوان ETH المكوَّن من 20 بايتًا** (المخطط
`secp256k1`) باستخدام `registerEthAuthenticatorMsg`، ويفوِّض الإنفاق بتوقيع
`personal_sign` وفق EIP-191 بطول 65 بايتًا على النوع نفسه من الملخّص.

**1) المالك يربط عنوان MetaMask** (بتوقيع المالك، هجين):

```ts
import { registerEthAuthenticatorMsg } from "@qorechain/sdk";

const [ethAddress] = await window.ethereum.request({
  method: "eth_requestAccounts",
  params: [],
});

const register = registerEthAuthenticatorMsg({
  owner: canonicalAccount,
  ethAddress,                 // 0x-hex 20-byte address = the authenticator pubkey
  permissions: ["evm"],       // EVM lane only
  expiryUnix: Math.floor(Date.now() / 1000) + 24 * 3600, // 24 h session
  label: "metamask",
});
// broadcast owner-signed (hybrid), like any other message
```

**2) MetaMask يفوِّض تحويل EVM** — تبني `buildMetaMaskExecuteEvm` الملخّص،
وتطلب `personal_sign` ‏(EIP-191) من الموفِّر، وتُرجع رسالة `MsgExecuteEVM`
جاهزة للمُرحِّل:

```ts
import { buildMetaMaskExecuteEvm } from "@qorechain/sdk";

const msgExecute = await buildMetaMaskExecuteEvm({
  provider: window.ethereum,   // any EIP-1193 provider
  address: ethAddress,         // the linked 20-byte address (0x-hex)
  relayer: relayerAddress,
  chainId: "qorechain-vladi",
  account: canonicalAccount,   // the PQC-required owner
  to: "0xRecipient…",          // 0x-hex recipient
  value: "1000000000000000000",// decimal wei string (EVM lane: 18 decimals)
  gasLimit: 100000,
  nonce: evmNonce,             // the account's CURRENT EVM nonce — do NOT +1
});
// hand `msgExecute` to the relayer, exactly as in the Phantom flow
```

تعمل `buildMetaMaskExecuteCosmos` بالطريقة نفسها للمسار الأصلي
(`to: "qor1…"`، و`amount: "100uqor"`، و`nonce` = التسلسل الخاص بكل موثِّق).
وتوجد مُركِّبات منخفضة المستوى مطابقة — `executeEvmMsg`،
و`executeCosmosMsg`، و`registerEthAuthenticatorMsg`، و`revokeAuthenticatorMsg`،
و`rotatePqcKeyMsg` — إذا كنت تدير المفاتيح والتوقيعات بنفسك.

## Sign-bytes (بدقة البايت)

هناك دالتان مساعدتان للبايتات: `BE64(n)` عدد صحيح big-endian بطول 8 بايتات؛
و`LP(bytes)` تساوي `BE64(len) ‖ bytes` (مسبوقة بالطول).

**مسار EVM** — تُرجع
`evmAuthSignBytes({ chainId, account, pubkey, to, value, data, nonce })`
ملخّصًا بطول 32 بايتًا:

```text
sha256( "qorechain-evm-auth-v1"
        ‖ LP(chainId) ‖ LP(account) ‖ LP(pubkey)
        ‖ LP(to) ‖ LP(value) ‖ LP(data) ‖ BE64(nonce) )
```

`to` هو عنوان المستلم بصيغة `0x` السداسية عشرية، و`value` سلسلة wei العشرية،
و`data` بيانات الاستدعاء (calldata) الخام.

**المسار الأصلي** — تُرجع
`cosmosAuthSignBytes({ chainId, account, pubkey, to, amount, nonce })`
ملخّصًا بطول 32 بايتًا:

```text
sha256( "qorechain-cosmos-auth-v1"
        ‖ LP(chainId) ‖ LP(account) ‖ LP(pubkey)
        ‖ LP(to) ‖ LP(amount) ‖ BE64(nonce) )
```

`amount` هي سلسلة العملة المفردة القانونية (مثل `100uqor`).

**التدوير** — تُرجع
`rotationSignBytes(chainId, algorithmId, account, oldPub, newPub)`
السلسلة النصية التي يوقّعها كلا المفتاحين (بترميز UTF-8 لها):

```text
qorechain-pqc-rotate-v1|<chainId>|<algorithmId>|<account>|<oldHex>|<newHex>
```

## قيم Nonce

- `MsgExecuteEVM.nonce` = **قيمة nonce الحالية لـ EVM** الخاصة بالحساب
  (المُرحِّل حساب مختلف ولا يزيد nonce المالك، لذا **لا** تُضف 1).
- `MsgExecuteCosmos.nonce` = **التسلسل الخاص بكل موثِّق** للزوج
  `(account, pubkey)` — عدّاد في المخزن منفصل عن تسلسل الحساب نفسه، يُزاد مع
  كل عملية إنفاق ناجحة عبر المسار الأصلي.

الخطأ في قيمة nonce يؤدي إلى رفضٍ بسبب إعادة التشغيل
(الرمز 11 في `abstractaccount`، انظر أدناه).

```ts
// EVM lane: the account's current nonce, straight from the EVM JSON-RPC.
const evmNonce = await client.evm.call<string>("eth_getTransactionCount", [
  account0x,
  "latest",
]);
```

## مخطط الأذونات

تنشر السلسلة التصنيف القانوني لأذونات الموثِّقات حتى تتحقق العملاء من النطاقات
دون ترميز السلاسل النصية يدويًا، وتكتشف الانحراف عبر `schema_version`:

```ts
// REST (LCD):
const schema = await client.rest.getPermissionSchema();

schema.schema_version;      // bumps on any taxonomy/mapping change
schema.permissions;         // ["send", "evm", "svm", "all", ...]
schema.msg_permissions;     // { "/qorechain.abstractaccount.v1.MsgExecuteEVM": "evm", ... }
schema.key_management_msgs; // typeURLs NEVER delegable to a linked key
```

مسار REST هو `GET /qorechain/abstractaccount/v1/permission_schema`؛ ويعرض
عميل استعلام gRPC المكتوب بأنواع البيانات نفسها عبر
`clients.abstractaccount.permissionSchema()`. تخدم الوحدة أيضًا المسارات
`/config` و`/accounts` و`/accounts/{address}`.

## رموز الأخطاء

تُفكَّك حالات الفشل عبر `decodeTxError` مع حقل `kind` سهل الفهم:

| Codespace | الرمز | النوع (Kind) |
| --- | --- | --- |
| `abstractaccount` | 5 | `spending_limit_exceeded` |
| `abstractaccount` | 6 | `session_key_expired` |
| `abstractaccount` | 10 | `permission_denied` |
| `abstractaccount` | 11 | `authenticator_replay` |
| `pqc` | 21 | `hybrid_verify_failed` |

```ts
import { decodeTxError } from "@qorechain/sdk";

const decoded = decodeTxError({
  code: result.code,
  codespace: result.codespace,
  rawLog: result.rawLog,
});

switch (decoded.kind) {
  case "spending_limit_exceeded": // over the per-tx or daily SpendingRule
    break;
  case "session_key_expired":     // expiryUnix passed — re-register the key
    break;
  case "permission_denied":       // scope missing — check the permission_schema
    break;
  case "authenticator_replay":    // wrong nonce — refetch and re-sign
    break;
  case "hybrid_verify_failed":    // ML-DSA sig did not verify (see note below)
    break;
}
```

يعني `hybrid_verify_failed` في أغلب الأحيان توقيع ML-DSA-87 **مُحوَّطًا**
(غير حتمي) — فالسلسلة لا تقبل إلا التوقيعات الحتمية. وهو أيضًا ما تراه إذا
قام إصدار SDK أقدم من 0.6.1 بترميز الامتداد الهجين بصيغة JSON
(قم بالترقية — انظر
[الحسابات وتوقيع PQC](/sdk/concepts/accounts-pqc#hybrid-signing)).

## تدوير المفاتيح {#key-rotation}

قم بتدوير مفتاح ML-DSA-87 الخاص بالحساب إلى مفتاح جديد من الخوارزمية
**نفسها** — على سبيل المثال ترحيل مفتاح قديم مشتق عبر جسر السلسلة
(`shake256(mnemonic)`) إلى المفتاح القانوني المرتبط بالعنوان
(`shake256("qorechain:pqc:v1|addr|mnemonic")`):

```ts
import { rotatePqcKeyMsgFromMnemonic, derivePqcLegacy } from "@qorechain/sdk";

const { msg, oldKeypair, newKeypair } = rotatePqcKeyMsgFromMnemonic({
  account,
  mnemonic,
  chainId: "qorechain-vladi",
  // oldDerivation: "bridge" (legacy), newDerivation: "adapter" (canonical) by default
});
// broadcast `msg` BY the account, cosigned (hybrid) with the OLD key —
// both keys dual-sign the rotation bytes (old proves ownership, new proves control).
```

تُعيد `derivePqcLegacy(mnemonic)` إنتاج زوج المفاتيح القديم بمفردها عند
الحاجة (مثلاً لمواصلة التوقيع إلى أن يكتمل التدوير على السلسلة).

## الخطوات التالية

- [الحسابات وتوقيع PQC](/sdk/concepts/accounts-pqc) — الحسابات الموحَّدة
  والتوقيع الهجين.
- [تجريد الحسابات](/developer-guide/account-abstraction) — الوحدة على مستوى
  السلسلة.
- مثال قابل للتشغيل:
  [`authenticator-spend`](https://github.com/qorechain/qorechain-sdk/tree/main/examples/authenticator-spend).
