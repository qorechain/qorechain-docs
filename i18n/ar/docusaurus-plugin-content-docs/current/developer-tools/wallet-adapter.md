---
slug: /developer-tools/wallet-adapter
title: محوّل المحفظة
sidebar_label: محوّل المحفظة
sidebar_position: 2
---

# محوّل المحفظة (`@qorechain/wallet-adapter`)

يضيف `@qorechain/wallet-adapter` شبكة QoreChain إلى محافظ Cosmos التي تتيح `signDirect` (Keplr وLeap وCosmostation)، ويبني المعاملات التي تشترطها السلسلة: يجب أن تحمل معاملة مسار Native توقيع ML-DSA-87 (FIPS 204) بجانب توقيع secp256k1 الكلاسيكي للحساب، ولا تستطيع المحفظة العادية إنتاج توقيع ML-DSA-87. يُنتجه المحوّل، ويضعه في جسم المعاملة، ثم يطلب من المحفظة غير المعدَّلة توقيعاً عادياً. وهو موجّه لمطوري تطبيقات dApp والمحافظ، ولبُناة الأدوات الذين يحتاجون إلى محافظ QoreChain موحّدة أو رسائل نافذة تفويض EVM أو رسائل المفاتيح المرتبطة (المصادِقات) في JavaScript. الإصدار الحالي هو 0.4.0.

إذا كنت تحتاج فقط إلى أن يرسل تطبيق dApp معاملة من محفظة QoreX الخاصة بالمستخدم، فأقصر طريق هو [`qorexSignAndBroadcast`](#qorex) في هذه الحزمة، أو حزم QoreX المدرجة في فهرس [حزم المطورين](/developer-tools/overview#group-qorex). وإذا كنت تكتب محفظة وتريد مكتبة توقيع كاملة بخمس لغات، فاقرأ [QoreSign](/qoresign/overview) أولاً.

## الابتكارات {#innovations}

- **المحفظة توقّع جسماً عادياً.** يبني المحوّل الجسم دون الامتداد، ويوقّع طبقة ML-DSA-87 على sign-bytes، ويضعها في الجسم بوصفها خيار الامتداد `/qorechain.pqc.v1.PQCHybridSignature` (معرّف الخوارزمية 1)، وبعد ذلك فقط يستدعي `wallet.signDirect` على `SignDoc` الجاهز. تُنتج المحفظة توقيع `SIGN_MODE_DIRECT` قياسياً ولا تحتاج إلى أي شيفرة خاصة بـ QoreChain. والنتيجة هي بايتات `TxRaw` المعتادة.
- **محدِّد sign-bytes لكل شبكة.** يوقّع مفتاح ML-DSA-87 إحدى صيغتين للبايتات، وتتحقق الشبكة من صيغة واحدة فقط عند أي ارتفاع. مع `signBytesVersion: "auto"` (الافتراضي) يسأل الموقِّع العقدةَ عبر `GET /cosmos/upgrade/v1beta1/applied_plan/{name}` عن `v3.2.0` ثم `v3.1.98`، ويوقّع بالصيغة v2 (وسم النطاق `qorechain-pqc-hybrid-v2` مع معرّف السلسلة) إذا كان أحد الارتفاعين أكبر من صفر، ويخزّن الجواب مؤقتاً 60 ثانية لكل عنوان REST ومعرّف سلسلة، ويُطلق خطأً بدلاً من التخمين إذا تعذّر عليه السؤال. جرى التحقق في 27 أكتوبر 2026 على العقد الحية: تُحَلّ الشبكتان الرئيسية وشبكة الاختبار إلى `v2`، واستدعاء `qorechain-vladi` دون `rest` يُطلق خطأً. تتجاوز `refreshSignBytesVersion()` التخزين المؤقت وتتعرّف `isHybridSignBytesRejection()` على رفض `pqc` بالرمز 21، فيستطيع المستدعي إعادة الحل والمحاولة مرة واحدة عند ترقية الشبكة بينما المحفظة مفتوحة.
- **مفتاح ML-DSA-87 واحد لكل عبارة استرجاع (mnemonic)، مشترك بين الأدوات.** تشتق `walletFromMnemonic` المفتاح بوصفه `SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)` يُغذّى إلى توليد مفاتيح ML-DSA-87. وهو مرتبط بعنوان الحساب، وهو الاشتقاق نفسه الذي يستخدمه SDK و`@qorechain/chain-bridge` وQoreX والأمر `qorechaind tx pqc recover-key`، فتعطي عبارة استرجاع واحدة مفتاحاً واحداً أياً كانت الأداة الموقِّعة. راجع [الاشتقاق الحتمي للمفاتيح والاسترداد](/developer-guide/post-quantum-signing#key-derivation).
- **حساب واحد، ثلاث صيغ عناوين، مفتاح توقيع واحد.** تعيد `generateQoreWallet` و`walletFromMnemonic` الصيغ `qor1` و`0x` (EIP-55) وbase58 الخاصة بـ SVM للهوية نفسها ذات 20 بايتاً، مع زوج مفاتيح ML-DSA-87. وتوقّع `signClassicalEth` و`signHybridEth` معاملات مسار Cosmos بهذا المفتاح الأصلي لـ eth (`eth_secp256k1`)، فيوقّع المفتاح نفسه معاملات EVM في أماكن أخرى.
- **رموز استرداد PQC.** تعيد `generatePqcRecoveryCode` سراً عشوائياً بطول 256 بتاً بصيغة `QRC1-` يليها base32 من نوع Crockford مع مجموع تحقق بطول 24 بتاً. وتشتق `pqcKeyFromRecoveryCode(code, address)` منه مفتاح ML-DSA-87 مرتبطاً بالعنوان. يُرفض الحرف الخاطئ برسالة بدلاً من اشتقاق مفتاح لا يطابق شيئاً بصمت، والرمز ليس عبارة استرجاع عن قصد.
- **QoreX بوصفه الموقِّع.** ترسل `qorexSignAndBroadcast` رسائل مرمَّزة بـ protobuf (من 1 إلى 32 في الاستدعاء الواحد، والمذكرة حتى 256 بايتاً، وحد الغاز من 100,000 إلى 5,000,000) إلى محفظة QoreX الخاصة بالمستخدم، فتعرضها مفكوكة الترميز، وتضيف طبقة ML-DSA-87 التي لا تستطيع إنتاجها إلا المحفظة، وتوقّع وتبث. يتحقق المحوّل من الحدود محلياً ويرفض رسائل إدارة مفاتيح PQC (`MsgRegisterPQCKey` و`MsgRegisterPQCKeyV2` و`MsgMigratePQCKey` و`MsgRotatePQCKey`)، بما في ذلك داخل `MsgExec` الخاصة بـ authz على أي عمق. وتُرفض `MsgExec` التي يتعذّر فك ترميزها.
- **لبنات بناء لنافذة تفويض EVM، وليست نافذة تلقائية أبداً.** تغطي `openEvmWindowMsg` و`closeEvmWindowMsg` و`fetchEvmWindow` و`parseEvmWindow` و`isEvmWindowRejection` النافذة التي يجب أن تكون مفتوحة قبل أي إرسال عبر EVM. كل حد (`blocks` من 1 إلى 17,280، و`maxTxs` من 1 إلى 1,000، و`maxValue` أكبر من صفر) مطلوب ويُفحص من جهة العميل دون قيمة افتراضية، وحقول حالة النافذة من نوع BigInt، ولا تفتح الحزمة نافذة من تلقاء نفسها: المقصود أن يرى المستخدم خطوة تفويض صريحة.
- **رسائل المفاتيح المرتبطة (المصادِقات) بمُلخّصات مطابقة للسلسلة تماماً.** تبني `registerAuthenticatorMsg` و`registerEthAuthenticatorMsg` و`buildPhantomExecuteEvm` و`buildPhantomExecuteCosmos` و`buildMetaMaskExecuteEvm` و`buildMetaMaskExecuteCosmos` الرسائل التي تتيح لمفتاح Phantom أو MetaMask أن ينفق من حساب QoreChain ضمن مجموعة صلاحيات وقاعدة إنفاق. و`evmAuthSignBytesV2` هو المُلخّص المعتمد من السلسلة v3.2.3، وهو يربط أيضاً حد الغاز للاستدعاء (ويجب ألا يكون صفراً). والـ nonce هو تسلسل المصادِق للمفتاح المرتبط، لا nonce EVM للحساب. راجع [المصادِقات والإنفاق المفوَّض](/sdk/guides/authenticators).
- **تدوير آمن للمفاتيح.** تبني `rotateFromLegacyWalletKey` رسالة `MsgRotatePQCKey` بعيداً عن مفتاح أُنتج باشتقاق توقيع المحفظة المسحوب، وترفض ما لم يساوِ المفتاح الذي تعيد اشتقاقه المفتاحَ المسجَّل. وتنقل `rotatePqcKeyMsgFromMnemonic` مفتاحاً قديماً من نوع `SHAKE-256(mnemonic)` إلى المفتاح القانوني المرتبط بالعنوان، وترفض الاشتقاق القديم بوصفه المفتاح الجديد.

## طريقة الاستخدام {#how-to-use}

ثبّت المحوّل مع نظيرَي cosmjs (الإصدار 0.32):

```bash
npm install @qorechain/wallet-adapter @cosmjs/stargate @cosmjs/proto-signing
```

الحزمة وحدة ES من JavaScript عادية مع تعريفات TypeScript. ليس في البيان بدء سريع مُختبَر لها. المقتطفات أدناه مأخوذة من تعريفات الحزمة وشيفرتها المصدرية؛ وفي 27 أكتوبر 2026 شُغّلت مقابل الحزمة 0.4.0 المنشورة ونقاط REST الحية لشبكتي الاختبار والرئيسية: توليد المحفظة، ومحلّل sign-bytes، وقراءة حالة نافذة EVM، و`openEvmWindowMsg`، وخطأ الدالة المسحوبة، كما تنجح اختبارات الحزمة الخاصة بها وعددها 102. أما مقتطفات التوقيع وQoreX فلم تُشغَّل من البداية إلى النهاية.

### إنشاء محفظة موحّدة {#unified-wallet}

```js
import { generateQoreWallet, walletFromMnemonic } from "@qorechain/wallet-adapter";

const w = await generateQoreWallet();           // random 24-word mnemonic
// const w = await walletFromMnemonic(mnemonic); // or recover one
console.log(w.cosmos); // qor1...   (bech32)
console.log(w.evm);    // 0x...     (EIP-55)
console.log(w.svm);    // base58 form of the same 20 bytes
// w.privateKey, w.pubkey, w.pqc = { publicKey (2592 bytes), secretKey }
```

تبني `walletFromSeed(seed32)` المحفظة نفسها من 32 بايتاً سرياً: تصبح البذرة المفتاح الخاص لـ secp256k1، لذا يجب أن تأتي من مصدر عشوائي آمن أو من دالة اشتقاق مفاتيح تُطبَّق على مادة لا يملكها إلا المستخدم. لا تشتقّها أبداً من توقيع يستطيع موقع ويب أن يطلب من المحفظة إنتاجه.

### تسجيل السلسلة في محافظ المستخدم {#register-chain}

```js
import { qoreChainInfo, addQoreEvmToWallet } from "@qorechain/wallet-adapter";

// Keplr and other Cosmos wallets. chainId defaults to the testnet, so pass it for mainnet.
await window.keplr.experimentalSuggestChain(
  qoreChainInfo({ chainId: "qorechain-vladi", rpc: "https://rpc.qore.host", rest: "https://api.qore.host" }),
);
await window.keplr.enable("qorechain-vladi");

// MetaMask and other EIP-1193 wallets (18-decimal native currency on the EVM lane).
await addQoreEvmToWallet(window.ethereum, {
  evmChainId: 9801, testnet: false, rpcUrl: "https://evm.qore.host",
});
```

تستخدم `qoreChainInfo` نوع العملة 118 وبادئة bech32 `qor` والعملة الأصغر `uqor` بست خانات عشرية وخطوة سعر غاز قدرها 0.1 و0.15 و0.25 uqor لكل وحدة غاز، وهي تحترم الحد الأدنى للرسوم البالغ 0.1 uqor لكل وحدة غاز. وتحتاج `addQoreEvmToWallet` إلى `rpcUrl`.

### توقيع معاملة هجينة بمحفظة Cosmos {#sign-hybrid}

```js
import { QoreChainSigner, pqcKeyFromRecoveryCode } from "@qorechain/wallet-adapter";

const signer = window.keplr.getOfflineSigner("qorechain-vladi");
const [account] = await signer.getAccounts();

// The account's ML-DSA-87 keypair, from a recovery code. Use this in a wallet or tool that
// legitimately owns the key; a web page should send its messages to QoreX instead (see below).
const pqc = await pqcKeyFromRecoveryCode(userRecoveryCode, account.address);

const adapter = new QoreChainSigner({
  wallet: window.keplr,
  chainId: "qorechain-vladi",
  address: account.address,
  pubkeySecp256k1: account.pubkey,
  accountNumber,                 // from GET /cosmos/auth/v1beta1/accounts/{address}
  pqc,
  rest: "https://api.qore.host", // lets the signer pick the sign-bytes form this network verifies
});

const txRaw = await adapter.signHybrid({ messages, fee, sequence }); // TxRaw bytes, with .signBytesVersion
// broadcast txRaw yourself (RPC broadcast_tx_sync or REST /cosmos/tx/v1beta1/txs)
```

أمور يجب معرفتها:

- المحوّل يوقّع وأنت تبث. لا يبني رسالة تسجيل المفتاح. سجّل مفتاح ML-DSA-87 للحساب مرة واحدة عبر [QoreSign](/qoresign/quickstart) (`buildRegisterPqKeyMessage`) أو SDK أو سطر الأوامر (راجع [تسجيل مفتاحك](/developer-guide/post-quantum-signing#pqc-key-registration))؛ وتلك المعاملة الأولى هي التي يجوز توقيعها توقيعاً كلاسيكياً.
- أن تحمل صفحة ويب مفتاح ML-DSA-87 للحساب تصميمٌ ينبغي تجنّبه. أما `derivePqcKeyFromWallet` التي كانت تشتقه من توقيع المحفظة فقد سُحبت في 0.3.0 وتُطلق خطأً دائماً. على تطبيق dApp أن يرسل الرسائل إلى QoreX (أدناه) ويترك المحفظة توقّع.
- إذا رُفض البث بالرمز 21 من `pqc` وكنت قد استخدمت `"auto"`، فاستدعِ `adapter.refreshSignBytesVersion()` ووقّع مرة أخرى؛ ولا تعِد المحاولة إذا مرّرت `"v1"` أو `"v2"` صراحةً. راجع [استكشاف أخطاء الرمز 21](/developer-guide/post-quantum-signing#code-21).

### الإرسال عبر QoreX {#qorex}

```js
import {
  hasQorexSignAndBroadcast, qorexSignAndBroadcast, isQorexRejection,
} from "@qorechain/wallet-adapter";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx.js";

if (!hasQorexSignAndBroadcast()) throw new Error("Install or update QoreX");

try {
  const { txHash, code } = await qorexSignAndBroadcast({
    chainId: "qorechain-vladi",   // must equal the wallet's active network
    messages: [{
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: MsgSend.encode(MsgSend.fromPartial({ fromAddress, toAddress, amount })).finish(),
    }],
    gasLimit: 300_000,            // optional, 100,000 to 5,000,000
  });
  if (code !== 0) throw new Error(`rejected by the chain with code ${code}`);
} catch (err) {
  if (isQorexRejection(err)) return; // the user declined; not a failure
  throw err;
}
```

`value` هو بايتات protobuf (`Uint8Array` أو مصفوفة أرقام أو base64)، وتُوقَّع كما هي تماماً. لا يستطيع تطبيق dApp تبديل شبكة المحفظة. ويحتاج إلى امتداد QoreX 0.3.5 أو تطبيق 1.1.5 أو أحدث؛ اختبر باستخدام `hasQorexSignAndBroadcast()` بدلاً من فحص الإصدار. العقد على مستوى الأسلاك موصوف في [امتداد متصفح QoreX](/qorex/browser-extension#sign-and-broadcast).

### بناء رسالة نافذة EVM {#evm-window}

```js
import { openEvmWindowMsg, fetchEvmWindow } from "@qorechain/wallet-adapter";

const status = await fetchEvmWindow({ rest: "https://api.qore.host", address: qor1 });
if (!status.live) {
  const msg = openEvmWindowMsg({
    sender: qor1,
    blocks: 300,        // 1 to 17280
    maxTxs: 3,          // 1 to 1000
    maxValue: "250000", // uqor: value plus the maximum fee of each admitted transaction
  });
  // sign it with signHybrid (or signHybridEth) and broadcast: it is an ordinary Cosmos-lane message
}
```

الترتيب مهم: افتح النافذة، ثم اقرأ nonce الخاص بـ EVM، ثم وقّع معاملة EVM، لأن فتح النافذة يزيد تسلسل الحساب، وهو أيضاً nonce الخاص بـ EVM. تبني `openEvmWindowMsg` الصيغة غير المقيَّدة للنافذة فقط؛ أما النافذة المقيَّدة (`native_only` و`allowed_targets`) فتحتاج إلى SDK. الخلفية: [نافذة تفويض EVM](/sdk/guides/evm#evm-window) و[معاملتك الأولى](/getting-started/first-transaction#evm-window).

### نقاط دخول أخرى

| المهمة | الدوال |
|---|---|
| استرداد مفتاح PQC أو تدويره | `generatePqcRecoveryCode`، `pqcKeyFromRecoveryCode`، `isValidRecoveryCode`، `rotatePqcKeyMsgFromMnemonic`، `rotateFromLegacyWalletKey`، `rotatePqcKeyMsg` |
| التوقيع بالمفتاح الأصلي لـ eth | `signClassicalEth` (تسجيل المفتاح الكلاسيكي)، `signHybridEth` |
| مساعدات sign-bytes | `hybridSignBytes(version, chainId, body, authInfo)`، `resolveSignBytesVersion`، `signBytesVersionFor`، `SIGN_BYTES_V2_UPGRADES` |
| الربط والإنفاق بمفتاح خارجي | `registerAuthenticatorMsg`، `registerEthAuthenticatorMsg`، `revokeAuthenticatorMsg`، ودوال `buildPhantom*` و`buildMetaMask*` |

## طريقة الوصول {#how-to-access}

- **الشبكات:** الشبكة الرئيسية `qorechain-vladi` وشبكة الاختبار `qorechain-diana`. مرّر `chainId` وعنوان `rest` المطابق ([نقاط النهاية](/developer-tools/overview#how-to-access)).
- **المحافظ:** Keplr هي المحفظة التي يستخدمها دليل QoreSign والأمثلة ([المحافظ المتوافقة مع Keplr](/qoresign/guides/keplr-compatible-wallets)). تتيح Leap وCosmostation واجهة `signDirect` نفسها وقد كُتبت الحزمة لأي محفظة من هذا النوع؛ لكنها لم تُفحص مقابلهما لأجل هذه الصفحة. تستخدم MetaMask مسار EVM لا موقِّع المحوّل، وتحتاج إلى نافذة EVM مفتوحة لكل عملية إرسال ([حزم المطورين](/developer-tools/overview#how-to-access)). وترتبط Phantom بوصفها مصادِقاً.
- **الحساب والمفتاح:** حساب فيه QOR لدفع الرسوم، ومفتاح ML-DSA-87 للحساب مسجَّل على السلسلة قبل أول معاملة هجينة.
- **المتطلبات المسبقة:** Node.js مع وحدات ES، أو أداة تجميع (bundler) للمتصفح. الاعتماديات النظيرة `@cosmjs/stargate` و`@cosmjs/proto-signing` بالمدى `^0.32`. اعتماديات وقت التشغيل: `@qorechain/pqc` `^0.2.1` و`cosmjs-types` `^0.9.0` و`@cosmjs/crypto` و`@cosmjs/encoding` `^0.32`.
- **التكلفة:** الحزمة مجانية؛ وتدفع المعاملات رسوم الشبكة بمعدل 0.1 uqor لكل وحدة غاز أو أكثر. يستخدم تسجيل المفتاح حد غاز كبيراً لأن المفتاح العام لـ ML-DSA-87 حجمه 2,592 بايتاً.

## أين تُنشر {#where-published}

| السجل | الحزمة | الإصدار | الرابط |
|---|---|---|---|
| npm | `@qorechain/wallet-adapter` | 0.4.0 (نُشر في 20 أكتوبر 2026) | [npmjs.com](https://www.npmjs.com/package/@qorechain/wallet-adapter) |

المصدر: [github.com/qorechain/qorechain-wallet-adapter](https://github.com/qorechain/qorechain-wallet-adapter) (عام، الوسم `v0.4.0`، ترخيص Apache-2.0). لا تُنشر على PyPI ولا crates.io ولا Maven Central ولا وكيل Go. ذات صلة: [حزم المطورين](/developer-tools/overview)، [QoreSign](/qoresign/overview)، [التوقيع ما بعد الكمّي](/developer-guide/post-quantum-signing)، [تكامل البورصات](/developer-guide/exchange-integration).

## الحدود والمشكلات المعروفة {#limits}

- **يوقّع ولا يبث ولا يسجّل المفاتيح ولا يفتح النوافذ.** لا توجد دالة تسجّل مفتاح ML-DSA-87، ولا شيء يفتح نافذة EVM نيابةً عنك.
- **لا إثبات حيازة.** تسجيل المفتاح الذي يتم بأدوات لا تستخدم إلا هذه الحزمة لا يحمل إثباتاً. وتقبله السلسلة مع ذلك، وتتحقق من الإثبات عند وجوده ([إثبات الحيازة](/developer-guide/post-quantum-signing#proof-of-possession)).
- **`derivePqcKeyFromWallet` مسحوبة** (0.3.0) وتُطلق خطأً دائماً. على الحسابات التي سجّلت مفتاحاً بواسطتها أن تدوّره عبر `rotateFromLegacyWalletKey`.
- **نوافذ غير مقيَّدة فقط.** لا تحتوي `openEvmWindowMsg` على حقول للنطاق.
- **تستخدم `qoreChainInfo` شبكة الاختبار افتراضياً.** مرّر `chainId` دائماً للشبكة الرئيسية.
- **nonce المصادِقات.** لا يوجد استعلام يكشف تسلسل المصادِق للمفتاح المرتبط بعد، لذا عليك تتبّعه؛ وتجيب السلسلة بالرمز 11 من `abstractaccount` عندما تكون القيمة خاطئة. وحدة المصادِقات مفعّلة على شبكة الاختبار ومعطّلة على الشبكة الرئيسية (راجع [نظرة عامة على SDK](/sdk/overview)).
- **نظيرا cosmjs 0.32.** يستخدم SDK الإصدار cosmjs 0.39؛ وتثبيت الاثنين في مشروع واحد يعطي خطأ `ERESOLVE`، لذا أبقِهما منفصلين أو مرّر `--legacy-peer-deps`.
- **لا تنسخ من README الحزمة.** ما زال يقول إن الشبكة الرئيسية تتحقق من صيغة sign-bytes الأولى وإن الإرسال عبر MetaMask لا يحتاج إلى خطوة إضافية. كلاهما قديم: تتحقق الشبكتان من v2، ويحتاج إرسال EVM إلى مفتاح مسجَّل ونافذة مفتوحة.
- **لا يوجد بدء سريع مُختبَر** مسجَّل لهذه الحزمة، ومسار QoreX يحتاج إلى تثبيت المحفظة، لذا لا يمكن تشغيله في سكربت.
