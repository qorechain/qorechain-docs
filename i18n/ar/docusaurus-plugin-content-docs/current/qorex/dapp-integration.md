---
slug: /qorex/dapp-integration
title: دمج تطبيق لامركزي مع QoreX
sidebar_label: دمج التطبيقات اللامركزية
sidebar_position: 8
---

# دمج تطبيق لامركزي مع QoreX

هذا هو الدليل الكامل للمطوّر الذي يريد أن يعمل تطبيق الويب مع محفظة QoreX: كيف يكتشفها ويتصل بها ويرسل معاملات QoreChain ويوقّع الرسائل ويستخدم EVM وSolana ويتعامل مع حالات الرفض، وكيف يُنشئ روابط تفتح QoreX. وهو يغطي إضافة متصفح QoreX ومتصفح dApp المدمج في تطبيق QoreX، ويوضح أين يختلفان. وقد دُقّقت نماذج الشيفرة مقابل شيفرة المحفظة نفسها.

## الابتكارات {#innovations}

- **الصفحة لا تحتفظ أبدًا بمفتاح ما بعد الكم.** يأخذ `signAndBroadcast` رسائلك؛ وتعرضها QoreX بعد فك ترميزها، وتضيف طبقة ML-DSA-87 التي لا تستطيع صنعها إلا المحفظة، ثم تبثّ. وتعمل cosmjs وcosmos-kit وInterchain Kit دون تغيير عبر `getOfflineSigner`، وتضيف QoreX الطبقة نفسها عندما لا تحمل المعاملة أي طبقة.
- **الاكتشاف بحسب القدرات لا بحسب الإصدار.** تسرد `window.qorex.native.capabilities` ما تفعله البنية، فيعمل مسار شيفرة واحد على كل إصدار.
- **لا يُستولى على شيء.** تعلن QoreX عن نفسها عبر EIP-6963 وSolana Wallet Standard، ولا تضبط `window.keplr` أبدًا، ولا تستبدل أبدًا `window.ethereum` الخاص بمحفظة أخرى.
- **توقيع رسائل بنصف ما بعد كمومي.** يوقّع `signArbitrary` بالمفتاح الكلاسيكي للحساب (ADR-36) وبـ ML-DSA-87. ويتحقق الخادم من كليهما بـ `@qorechain/qoresign` مقابل المفتاح المسجَّل على السلسلة.
- **EVM على QoreChain، مشروحًا للمستخدم.** يُفك ترميز `personal_sign` و`eth_signTypedData_v4` و`eth_sendTransaction` على الجهاز، وتُحاكى حيث تسمح العقدة، وتفتح الموافقة نافذة التفويض لكل معاملة التي يحتاجها مسار EVM في QoreChain.
- **لا توقيع أعمى، وقائمة قصيرة بما لا يمكن لموقع طلبه أبدًا.** تُرفض الرسالة التي لا تستطيع QoreX عرضها، وتُرفض من أي موقع الرسائل الخاصة بالمحفظة وحدها (إدارة المفاتيح، وقواعد الإنفاق، والنوافذ، والمنح).
- **روابط يمكن لخدمة إنشاؤها.** افتح صفحة في التطبيق، أو اطلب دفعة موقَّعة بمفتاح المستلم نفسه، أو سلّم اقتراحًا من وكيل.

## ما تحقنه QoreX {#injected}

على كل صفحة تضيف QoreX كائنًا واحدًا، `window.qorex`، فيه ثلاثة مزوّدين:

| المزوّد | ما هو |
|---|---|
| `window.qorex.native` | مسار QoreChain (Cosmos). بنمط Keplr: `enable` و`getKey` و`signAndBroadcast` و`signDirect` و`signArbitrary` و`verifyArbitrary` و`getOfflineSigner*`، إضافةً إلى قائمة `capabilities`. وليس بديلًا جاهزًا لـ Keplr. |
| `window.qorex.evm` | مزوّد EIP-1193 لمسار EVM في QoreChain (و، في الإضافة، Ethereum). ويُعلَن عنه أيضًا عبر EIP-6963. |
| `window.qorex.svm` | مزوّد Solana. وفي الإضافة تجد تطبيقات Solana اللامركزية QoreX عادةً عبر Wallet Standard بدلًا منه. |

ما لا تفعله QoreX:

- لا تضبط `window.keplr` أبدًا. الشيفرة التي تبحث عن Keplr لن تجد QoreX؛ فاكتشف `window.qorex` بدلًا من ذلك.
- لا تستبدل `window.ethereum` أبدًا. الإضافة لا تضبطه إطلاقًا. ويضبط المتصفح المدمج في التطبيق `window.ethereum` فقط عندما لم تضبطه أي محفظة أخرى. اختر QoreX باسمها في EIP-6963 لا عبر `window.ethereum`.
- لا وجود لـ `signAmino` و`sendTx` (راجع [cosmjs](#cosmjs)).

## اكتشاف QoreX {#detection}

**EVM.** استمع إلى إعلانات EIP-6963 واختر التي `rdns` الخاص بها `network.qore.qorex`:

```ts
const wallets = new Map<string, EIP6963ProviderDetail>();
window.addEventListener("eip6963:announceProvider", (event) => {
  const detail = (event as CustomEvent<EIP6963ProviderDetail>).detail;
  wallets.set(detail.info.rdns, detail);
});
window.dispatchEvent(new Event("eip6963:requestProvider"));

const qorex = wallets.get("network.qore.qorex"); // undefined when QoreX is not there
```

**مسار QoreChain الأصلي.** تحقق من وجود `window.qorex?.native` واقرأ قدراته. تحقق منها بدل رقم الإصدار:

```js
const native = window.qorex?.native;
const can = (name) => native?.capabilities?.includes(name) === true;
```

| القدرة | الإضافة | التطبيق |
|---|---|---|
| `signAndBroadcast` | 0.3.5 | 1.2.1 (الطريقة موجودة من 1.1.5) |
| `signDirectAddsPqcLayer` | 0.4.0 | 1.2.1 (السلوك من 1.2.0) |
| `signArbitrary` | 0.4.0 | 1.2.1 (الطريقة موجودة من 1.2.0) |
| `listAccounts`, `connectProofPicksAccount`, `executeRequest` | 0.3.x | ليست في التطبيق |

في التطبيق 1.2.0 الطرق موجودة لكنه لا يعلن أي قدرات؛ ولتغطيته ارجع إلى `typeof window.qorex?.native?.signArbitrary === "function"`. أما `executeRequest` فهو جسر Dashboard، ويعمل لـ `dashboard.qorechain.io` فقط (راجع [جسر Dashboard](/qorex/browser-extension#dashboard-bridge))؛ ولا تحتاج إليه المواقع الأخرى. وتعلن البنيتان 1.2.5 و0.4.5 القدرات نفسها كما من قبل.

**الإضافة أم التطبيق.** لا تستطيع الصفحة أن تسأل أيهما تخاطب، ولا ينبغي أن تحتاج إلى ذلك. والفروق المهمة في الجدول أدناه.

| | الإضافة (سطح المكتب) | التطبيق (متصفح dApp المدمج) |
|---|---|---|
| مسار QoreChain الأصلي | نعم | نعم |
| توقيع EVM على QoreChain | نعم | نعم |
| EVM على Ethereum (`wallet_switchEthereumChain` إلى `0x1`، لكل موقع) | نعم | لا، شبكة QoreChain النشطة فقط |
| أحداث EVM (`connect` و`accountsChanged` و`chainChanged`) | الثلاثة | `connect` فقط: يُغلق المتصفح عند تبديل الحساب أو الشبكة |
| Solana (Wallet Standard) | نعم | لا، المتصفح المدمج لا يوقّع معاملات Solana |
| جسر Dashboard (`connectProof` و`executeRequest`) | نعم، `dashboard.qorechain.io` فقط | لا |
| فتح صفحة من رابط | لا ينطبق | روابط `browse` (راجع [الروابط](#links)) |

راجع [إضافة المتصفح](/qorex/browser-extension) و[متصفح dApp](/qorex/dapp-browser) لجانب المستخدم في كل منهما.

## الاتصال {#connect}

يتطلب الاتصال موافقة واحدة لكل موقع، تكشف العنوان العام فقط:

```js
await window.qorex.native.enable("qorechain-vladi"); // once per site; mainnet chain id
const key = await window.qorex.native.getKey("qorechain-vladi");
// key.bech32Address is the qor1... address; key.algo is "secp256k1", or "ethsecp256k1" for a coin-60 account
```

EVM:

```js
const [account] = await qorex.provider.request({ method: "eth_requestAccounts" });
```

تعيد `eth_accounts` قائمة فارغة إلى أن يوافق المستخدم على الموقع، ولا تفتح نافذة من تلقاء نفسها أبدًا. أما `enable` و`eth_requestAccounts` فتفتحان المحفظة عندما تكون مقفلة (راجع [المحفظة المقفلة](#locked)).

تطلق الإضافة حدث نافذة، `qorex_keystorechange`، عند تغير الحساب أو المحفظة أو الشبكة. وتُحفظ الموافقات لكل محفظة، ويستطيع المستخدم إلغاء موقع في أي وقت ضمن **المواقع المتصلة**.

## إرسال معاملة QoreChain: `signAndBroadcast` {#sign-and-broadcast}

كل معاملة QoreChain من حساب لديه مفتاح ما بعد كم مسجَّل يجب أن تحمل توقيعًا هجينًا: secp256k1 **و** ML-DSA-87. ولا تحتفظ بمفتاح ML-DSA إلا المحفظة، لذا لا تستطيع الصفحة بناء ذلك التوقيع بنفسها. أرسل الرسائل وتتولى QoreX الباقي:

1. تعرض على المستخدم الرسائل المفكوكة والرسوم،
2. تبني المعاملة للحساب الذي اختاره المستخدم،
3. تضيف التوقيع الهجين (مسجِّلةً أولًا مفتاح ما بعد الكم للحساب إن كانت هذه أول معاملة له)،
4. تبثّ، ثم تُرجع النتيجة.

```js
const provider = window.qorex.native;
if (!provider.capabilities?.includes("signAndBroadcast")) {
  throw new Error("Please update QoreX");
}
await provider.enable("qorechain-vladi");              // connect, once per site

const res = await provider.signAndBroadcast({
  chainId: "qorechain-vladi",                          // must be the wallet's active network
  messages: [
    {
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: MsgSend.encode(msgSend).finish(),         // protobuf bytes: Uint8Array,
    },                                                 // number[] or a base64 string
  ],
  memo: "",                                            // optional, at most 256 bytes
  gasLimit: 300000,                                    // optional: 100k to 5M, default 400k
});
// res = { txHash, code, height?, shield }
```

يخبرك `shield` هل تحمل المعاملة المثبَّتة الطبقة الهجينة: `shielded` عندما تحملها، و`downgraded` عندما ثُبّتت دونها (أبلغ عن هذه الحالة)، و`pending` أو `classical` في غير ذلك.

**القواعد**

- يجب أن يساوي `chainId` الشبكة النشطة للمحفظة: `qorechain-vladi` (الرئيسية) أو `qorechain-diana` عندما يكون المستخدم قد انتقل إلى الشبكة التجريبية. ويُرفض عدم التطابق برسالة تسمّي الاثنين. **لا تستطيع dApp تبديل الشبكة** (راجع [الشبكة التجريبية](#testnet)).
- من رسالة واحدة إلى 32 رسالة في كل استدعاء. تُوقَّع بايتات الرسالة تمامًا كما ترسلها؛ ولا تعيد المحفظة ترميزها.
- تظهر في ورقة الموافقة مذكرة لا تتجاوز 256 بايت؛ وتظهر فيها فواصل الأسطر وأحرف التحكم برموزها.
- تُرفض الرسائل الخاصة بالمحفظة وحدها (راجع [الرسائل التي لا يمكن لموقع طلبها أبدًا](#wallet-only)).
- لن توقّع QoreX رسالة لا تستطيع عرضها. ويُرفض مثل هذا الطلب بـ `QoreX cannot show what <type> does, so it will not sign it`، بما في ذلك داخل `MsgExec`. استخدم نوع رسالة تستطيع QoreX فك ترميزه.

**gas والرسوم**

- الرسوم هي `gasLimit` مضروبًا في سعر gas في الشبكة (تتبع QoreX الحد الأدنى الحالي في الشبكة)، وتُعرض قبل أن يوافق المستخدم.
- يُقيَّد `gasLimit` الخاص بك بين 100,000 و5,000,000؛ ودون قيمة يكون 400,000.
- المعاملة التي تشغّل شيفرة CosmWasm أو شيفرة بين الآلات الافتراضية تُحاكى أولًا قبل الموافقة. تطلب QoreX ما لا يقل عن 1.3 ضعف gas المحاكى، حتى 20,000,000، وتحتفظ بالقيمة الأعلى القادمة من صفحتك. ويُرفض قبل الموافقة، مع سبب السلسلة، الاستدعاء الذي كان العقد سيرفضه. وإذا احتاج الاستدعاء إلى أكثر من 20,000,000، تقول QoreX ذلك وترفض.
- لا يمكن لمعاملة أن تتجاوز حد gas للمعاملة الواحدة في الشبكة نفسها؛ وترفض QoreX ما يتجاوزه قبل توقيع أي شيء.

يطلق رفض المستخدم `QoreX: signature rejected` بالرمز `4001`.

## cosmjs وcosmos-kit وInterchain Kit {#cosmjs}

تُرجع `getOfflineSigner(chainId)` و`getOfflineSignerOnlyDirect(chainId)` و`getOfflineSignerAuto(chainId)` موقّع cosmjs من نوع `OfflineDirectSigner`، فيعمل `SigningStargateClient` دون تغيير:

```js
const signer = window.qorex.native.getOfflineSigner("qorechain-vladi");
const client = await SigningStargateClient.connectWithSigner(rpc, signer, {
  gasPrice: GasPrice.fromString("0.15uqor"),
});
await client.sendTokens(from, to, [{ denom: "uqor", amount: "1000" }], "auto");
```

**طبقة ما بعد الكم التي تضيفها المحفظة.** عندما لا تحمل المعاملة طبقة ML-DSA (وهي ما لا تستطيع الصفحة صنعه)، تضيفها QoreX: تحاكي تكلفة الطبقة، وترفع gas والرسوم في المعاملة، وتوقّع ML-DSA-87 على الجسم ومعلومات الرسوم المرفوعة، وتعرض على المستخدم الرسوم النهائية قبل أن يوافق. لذلك تعود رسوم `"auto"` لديك أعلى بتكلفة الطبقة، أي عشرات الآلاف من وحدات gas. ابثّ دائمًا المستند `signed` العائد، لا الذي أرسلته. تحقق من `capabilities.includes("signDirectAddsPqcLayer")` قبل الاعتماد على ذلك.

- يجب أن يكون مفتاح ما بعد الكم للحساب مسجَّلًا بالفعل؛ وهو يُسجَّل مع أول معاملة له من QoreX. وإلا يفشل الاستدعاء بالرمز `4100` والسبب `pqc-key-missing`. اطلب من المستخدم إرسال معاملة واحدة من QoreX أولًا، أو استخدم `signAndBroadcast` الذي يسجّل المفتاح بنفسه.
- **يُرفض Amino.** يُرفض `signAmino` و`getOfflineSignerOnlyAmino().signAmino` بالرمز `4200` والسبب `amino-unsupported`، لأن Amino JSON لا يستطيع حمل التوقيع الهجين. اضبط مكتبتك على التوقيع المباشر.
- الحسابات المستوردة من MetaMask (coin 60) توقّع عبر `signAndBroadcast`؛ وترفض الإضافة لها `signDirect`، ومن ثم موقّعي cosmjs.
- يُرجع `getKey` و`getAccounts` الحساب النشط.

في تطبيق الويب، يغلّف [محوّل المحفظة](/developer-tools/wallet-adapter) وحزم [تكاملات QoreX](/developer-tools/qorex-integrations) (RainbowKit وInterchain Kit وcosmos-kit) هذا الاكتشاف وهذه الاستدعاءات نيابةً عنك.

## `signDirect` {#sign-direct}

يوقّع `signDirect` مستند `SignDoc` بنته صفحتك. إذا كان الجسم يحمل بالفعل طبقة ML-DSA، تتحقق QoreX منها مقابل المفتاح المسجَّل للحساب، كما تفعل السلسلة، قبل أن تُفتح أي نافذة. وإذا لم يحمل أي طبقة، تضيفها QoreX كما هو موصوف أعلاه. وتُرفض قبل فتح أي موافقة الطبقةُ التي لا تطابق المفتاح المسجَّل، أو الرسالة الخاصة بالمحفظة وحدها، أو الرسالة التي لا تستطيع QoreX عرضها، أو ما يزيد على 1,000 رسالة. وللشيفرة الجديدة يكون `signAndBroadcast` أبسط.

## توقيع رسالة: `signArbitrary` و`verifyArbitrary` {#sign-arbitrary}

```js
const message = "Log in to example.com\nNonce: 1234";
const sig = await window.qorex.native.signArbitrary("qorechain-vladi", address, message);
const ok = await window.qorex.native.verifyArbitrary("qorechain-vladi", address, message, sig);
```

يتبع التوقيع [QoreSign message-signing-v1](/qoresign/spec/message-signing-v1): ADR-36 بالمفتاح الكلاسيكي للحساب (secp256k1، أو eth_secp256k1 لحساب coin-60)، إضافةً إلى ML-DSA-87 على `"qorechain-msg-v1|" + chainId + "|" + data`. كما يحمل حقلي `pub_key` و`signature` الخاصين بـ Keplr، فتستطيع الشيفرة المكتوبة لـ Keplr قراءته. ويرى المستخدم الرسالة كاملة. يجب أن يكون طول الرسالة من 1 إلى 4096 بايت، وألا تبدأ بنطاق توقيع آخر من نطاقات QoreChain.

**تحقق على خادمك، لا في الصفحة أبدًا.** يجب فحص نصف ML-DSA مقابل المفتاح المسجَّل على السلسلة لذلك العنوان، لا أبدًا مقابل مفتاح يرسله العميل. استخدم [`@qorechain/qoresign`](/qoresign/overview):

```ts
import { verifyMessageWithChain } from "@qorechain/qoresign/network";

try {
  await verifyMessageWithChain({
    rest: "https://api.qore.host",     // the network's REST endpoint
    chainId: "qorechain-vladi",
    signer: address,                    // the qor1... address that signed
    data: message,                      // exactly the text you asked the user to sign
    signature: sig,                     // the object signArbitrary returned
  });
  // signed in
} catch (err) {
  // a QoreSignError with a stable code: the signature does not verify
}
```

تجلب `verifyMessageWithChain` مفتاح ML-DSA-87 المسجَّل للموقّع وتطلق `QoreSignError` عندما لا يتحقق أي شيء. والحساب الذي لم يرسل معاملة قط على تلك الشبكة ليس له مفتاح مسجَّل بعد فيفشل بـ `KEY_NOT_REGISTERED`: اطلب من المستخدم إرسال معاملة واحدة من QoreX أولًا. ضع في الرسالة nonce لمرة واحدة ونطاقك، وتحقق من كليهما على الخادم، حتى لا يُعاد استخدام التوقيع على موقع آخر. وتغطي أدلة QoreSign رسائل تسجيل الدخول بمزيد من التفصيل.

## التطبيقات اللامركزية على EVM {#evm}

تجيب QoreX على EIP-6963، ومن خلال مزوّد EIP-1193 الخاص بها توقّع `personal_sign` و`eth_signTypedData_v4` و`eth_sendTransaction` على مسار EVM في QoreChain (معرّف السلسلة **9801**، والتجريبية **9800**). وفي الإضافة توقّع أيضًا على Ethereum بعد أن يستدعي الموقع `wallet_switchEthereumChain` إلى `0x1` (لكل موقع). وتذهب طرق القراءة فقط (`eth_call` و`eth_getBalance` و`eth_getLogs` وعمليات القراءة القياسية الأخرى) إلى عقدة الشبكة المختارة. وأي طريقة أخرى تجيب بـ `4200`، و`wallet_switchEthereumChain` أو `wallet_addEthereumChain` إلى أي سلسلة لا توقّع QoreX لها تجيب بـ `4902`. ولا يستطيع موقع التبديل إلى شبكة QoreChain الأخرى: يجيب ذلك بـ `4100` مع `switch the network in QoreX itself`.

```js
const [from] = await qorex.provider.request({ method: "eth_requestAccounts" });
const hash = await qorex.provider.request({
  method: "eth_sendTransaction",
  params: [{ from, to, value: "0x0", data }],
});
```

**ما تفك الموافقة ترميزه.** تذكر كل نافذة ما يُفوَّض، بعد فك ترميزه على الجهاز: التحويلات، ومخصصات الرموز (غير المحدود منها يقول UNLIMITED)، و`setApprovalForAll`، وتواقيع Permit وPermit2، ومعاملات Safe (يُعلَّم DELEGATECALL بأنه عالي المخاطر). والاستدعاء الذي لا تستطيع QoreX فك ترميزه يُعرض على أنه غير معروف وعالي المخاطر ويتطلب نقرة ثانية. وتُرفض تفويضات EIP-7702.

**المحاكاة.** قبل التوقيع تعرض النافذة ما تغيّره المعاملة في رصيد المستخدم.

- مع `eth_simulateV1` (تتبّع التحويلات) على العقدة، تعرض التغيرات في QOR والرموز.
- على عقدة دون `eth_simulateV1`، وهذا حال عقد EVM في QoreChain اليوم، لا يتوفر إلا `eth_call`، وهو يقول هل سيتراجع الاستدعاء (revert). وعندئذ يعرض الاستدعاء الذي يحمل بيانات "what it does to your tokens was not checked"، ويحتاج المستخدم إلى نقرة ثانية للموافقة.
- المعاملة التي ستفشل، أو التي لا تستطيع العقدة محاكاتها، تتطلب أيضًا نقرة ثانية.
- تذهب المحاكاة إلى العقدة نفسها التي ستستلم المعاملة؛ ولا يُرسل شيء آخر إلى أي مكان.

صمّم الصفحة بحيث لا تكون هذه النقرة الثانية مفاجأة: اشرح ما يفعله الاستدعاء في واجهتك أيضًا.

**نافذة تفويض EVM، لكل معاملة.** على QoreChain لا تُقبل معاملة EVM إلا داخل نافذة تفويض فُتحت بتوقيع ML-DSA-87 الهجين للحساب على المسار الأصلي. وعندما لا تغطي المعاملةَ أي نافذة، تفتح الموافقة نفسها نافذة لتلك المعاملة بالضبط:

- حدّها القيمة زائد أقصى رسوم،
- نحو عشر دقائق،
- مقيَّدة بالعقود التي تستدعيها المعاملة، حيث تدعم الشبكة ذلك.

تسمّي الموافقة كل عقد ستسمح به النافذة (بما في ذلك العقود التي تحققت مؤخرًا من توقيع للموقع نفسه) وتقول إنها تحل محل أي نافذة مفتوحة لدى المستخدم. وإذا لم تستطع الشبكة قصر النافذة على عقود، تسأل QoreX مرة ثانية، مسمّيةً العقود وقائلةً إن النافذة ستسمح بأي عقد، قبل أن تفتح نافذة غير مقيَّدة؛ و"لا" لا ترسل شيئًا. يغطي حد QOR كل QOR يغادر الحساب، بما في ذلك أقصى رسوم، ويظل بإمكان العقد الذي تتيح النافذة للمستخدم استدعاءه التصرف باسم الحساب (الرموز التي يحتفظ بها أو المعتمدة له، أو QOR الذي تحتفظ به عقود أخرى). راجع [نافذة وصول EVM](/qorex/security-and-recovery#evm-window).

**نافذة فتحها المستخدم يدويًا.** النافذة التي يفتحها المستخدم في شاشة النافذة تقتصر افتراضيًا على **تحويلات QOR فقط**؛ والسماح بأي عقد خيار منفصل مع تحذير. لذلك لن تغطي نافذة فتحها المستخدم سابقًا استدعاء رمز أو عقد. وعلى dApp التي تتوقع وجود نافذة إما أن تدع QoreX تفتح النافذة لكل معاملة (وهي الطريقة الأبسط والأضيق)، أو أن تطلب من المستخدم اختيار **أي عقد** إذا فتحها بنفسه.

**قواعد أخرى على هذا المسار**

- لا يستطيع الإرسال على مسار EVM في QoreChain إلا الحسابات المستوردة من MetaMask (coin type 60). ويجيب أي حساب آخر بـ `4100` وتخبر الرسالة المستخدم بالخطوات التالية.
- تُرفض (`4200`) عمليات precompile الخاصة بالرهن والتوزيع والحوكمة والاستحقاق (vesting) والبنك وIBC: فعلى QoreChain تمر هذه عبر المسار الأصلي.
- التواقيع على مسار EVM كلاسيكية (secp256k1). ولا تدّعي QoreX أكثر من ذلك.
- تُرفض البيانات المنظمة لسلسلة غير المختارة بـ `-32602`.

## التطبيقات اللامركزية على Solana (الإضافة) {#solana}

تسجّل الإضافة نفسها في Solana Wallet Standard على الشبكة الرئيسية لـ Solana (`solana:mainnet`)، فتجدها تطبيقات Solana اللامركزية دون شيفرة مخصصة. الميزات: connect وdisconnect والأحداث و`solana:signMessage` و`solana:signTransaction` و`solana:signAndSendTransaction`، لمعاملات legacy وv0. و`connect({ silent: true })` مدعوم.

تفك الموافقة ترميز تحويلات System، وتحويلات SPL Token وToken-2022، والموافقات، وتغييرات الصلاحية، وإغلاق الحسابات، وتعرض نص المذكرة. والتعليمة التي لا تستطيع QoreX فك ترميزها تُعلَّم في الورقة بأنها غير مقروءة وتتطلب الموافقة نقرة ثانية. وتُرفض المعاملة التي لا تدرج المحفظة موقِّعًا، ولن يوقّع `signMessage` بايتات هي في الحقيقة معاملة. التواقيع كلاسيكية ومعلَّمة كذلك.

المتصفح المدمج في التطبيق لا يوقّع معاملات Solana. أما سولانا على QoreChain نفسها فميزة منفصلة داخل المحفظة للشبكة التجريبية فقط: راجع [ميزات الشبكة التجريبية فقط](/qorex/testnet-features).

## عندما تكون المحفظة مقفلة {#locked}

بدءًا من الإضافة 0.4.5 وSafari 1.8.2، فإن طلب التوقيع المقدَّم أثناء قفل QoreX (Native أو EVM أو Solana) يفتح المحفظة على شاشة كلمة المرور مع تسمية الموقع. وبعد أن يفتح المستخدم القفل، تُغلق النافذة ويعرض الطلب موافقته الخاصة. وإذا أغلق المستخدم النافذة بدلًا من ذلك، يُرفض الطلب بالرمز `4001`. وقبل ذلك كان مثل هذا الطلب يفشل فورًا بـ "wallet is locked".

- توقظ `enable` و`getKey` و`eth_requestAccounts` وطرق التوقيع المحفظة بهذه الطريقة.
- عمليات القراءة التي تجريها الصفحة عند التحميل (`eth_accounts` و`eth_chainId` وقراءات السلسلة) لا تفتح نافذة أبدًا: فـ `eth_accounts` تعيد قائمة فارغة فقط.
- لا يُوقَّع شيء دون كلمة المرور، ويُجاب عن الطلب المنتظر بـ "لا" إذا بدّل المستخدم المحفظة أو قفلها مجددًا.

تعامل مع `4001` على أنه نتيجة عادية لا خلل.

## الرسائل التي لا يمكن لموقع طلبها أبدًا {#wallet-only}

ترفض QoreX هذه الرسائل من أي موقع وعلى كل مسار (`signAndBroadcast` و`signDirect` واقتراح الوكيل)، لأنها تسلّم صلاحية دائمة على الحساب. ويقوم المستخدم بها من شاشات QoreX نفسها:

- إدارة مفتاح ما بعد الكم: تسجيل مفتاح وترحيله وتدويره، ومفتاح التشفير، وتسجيل الحساب متعدد التوقيع لـ PQC؛
- الـ authenticators وقواعد الإنفاق: تسجيل مفتاح توقيع أو إلغاؤه، وقواعد الإنفاق، وإنشاء حساب مجرّد (abstract account)؛
- فتح نافذة EVM وإغلاقها ومسحها (وموافقة التفويض)؛
- فتح نافذة سولانا على QoreChain وإغلاقها، ورسالة ترحيل Solana؛
- منحة authz (`MsgGrant`) لـ `MsgGrant` أو `MsgExec`، لأن مثل هذه المنحة تتيح للمُستفيد التصرف بصفة الحساب.

ينطبق الرفض مباشرةً، وداخل `MsgExec` بأي عمق، وكمنحة عامة لإحدى هذه الرسائل. ونص الخطأ `QoreX: <type> is managed by the wallet itself, not by a website`.

## الأخطاء والأحداث {#errors}

تحمل الأخطاء `code` وفق EIP-1193:

| الرمز | المعنى |
|---|---|
| `4001` | رفض المستخدم، أو أغلق النافذة (بما في ذلك نافذة فتح القفل). |
| `4100` | غير مصرَّح: حساب مجهول، أو لا مفتاح ما بعد كم مسجَّل (`reason: pqc-key-missing`)، أو حساب coin-118 يحاول استخدام مسار EVM، أو طلب تبديل الشبكة. |
| `4200` | غير مدعوم: Amino (`reason: amino-unsupported`)، أو طريقة EVM لا توقّعها QoreX، أو تفويض EIP-7702، أو precompile خاص بالمسار الأصلي. |
| `4901` | سلسلة Solana خاطئة. |
| `4902` | سلسلة مجهولة. |
| `-32602` | معاملات (parameters) غير صالحة (مثل بيانات منظمة لسلسلة أخرى). |

الأحداث:

- مزوّد EVM: `connect` و`accountsChanged` و`chainChanged` في الإضافة؛ و`connect` فقط في التطبيق.
- المسار الأصلي (الإضافة): حدث النافذة `qorex_keystorechange` عند تغير الحساب أو المحفظة أو الشبكة. وتستمع إليه cosmos-kit.
- Solana Wallet Standard: `change`.

## الروابط التي يمكن لخدمة إنشاؤها {#links}

ثلاثة روابط تفتح QoreX من صفحة أو تطبيق آخر.

### فتح صفحة في التطبيق: `browse` {#link-browse}

```
https://link.qore.network/browse?url=<encodeURIComponent(https URL)>
qorex://browse?url=<encodeURIComponent(https URL)>
```

على الهاتف، يفتح الرابط صفحتك في متصفح dApp في QoreX بعد المصادقة الحيوية المعتادة. يجب أن تكون الصفحة `https://` على اسم نطاق. وترفض QoreX الرابط إذا كان في الصفحة:

- منفذ،
- اسم مستخدم أو كلمة مرور،
- عنوان IP،
- `localhost`،
- شرطة مائلة عكسية أو مسافة بيضاء،
- أكثر من 2048 حرفًا.

لا يمنح الرابط الصفحة شيئًا. فهي لا تزال تطلب الاتصال، ويظل كل توقيع يمر عبر ورقة الموافقة. وإذا لم تكن على الهاتف محفظة، يبقى التطبيق في شاشة الإعداد الأولي. وإذا لم تكن QoreX مثبَّتة، يعرض شكل https صفحة فيها رابط للحصول عليها. ولا يوجد في الإضافة رابط `browse`.

### طلب دفعة: `qorex://pay` {#link-pay}

```
qorex://pay?v=1&net=qorechain-vladi&to=qor1...&amt=1500000&d=uqor&id=pr_...&tag=...&pk=...&sig=...
```

يحمل رابط طلب الدفع المستلم، والمبلغ بالوحدات الأساسية، والفئة النقدية (denom)، ومعرّف الطلب ووسم مذكرته، وملاحظة و@handle اختياريين، والشبكة، وتوقيعًا على كل ذلك بمفتاح حساب المستلم نفسه. تتحقق QoreX عند الدافع من التوقيع، ومن أن مفتاح التوقيع يملك عنوان المستلم، ومن الشبكة الدقيقة، وأي @handle، ثم تعرض المراجعة المعتادة قبل الإرسال. ويُكتشف أي تغيير في المبلغ أو المستلم، ويُعلَّم الطلب بأنه مدفوع بقراءة السلسلة.

**أنشئه بشاشة الطلب في QoreX نفسها** (التطبيق، **طلبات الدفع**، **طلب جديد**) بدل إنشائه يدويًا: فالتوقيع يُصنع بمفتاح الحساب الذي لا تحتفظ به أي صفحة أبدًا. اعتبر الرابط الذي تبنيه أو تعدّله بنفسك غير مدعوم. ولا تتوفر بعد صيغة ويب للرابط.

### تسليم اقتراح وكيل: `qorex://propose` {#link-propose}

```
qorex://propose?d=<base64url of the proposal JSON>
```

للتطبيق فقط. يحمل الرابط معاملة يقترحها وكيل ذكاء اصطناعي؛ تتحقق QoreX منها وتحاكيها وتعرضها في نافذة الموافقة المعتادة. لا يُوقَّع اقتراح كما هو أبدًا، ويمكن للرابط أن يحمل 64 KB على الأكثر. راجع [نموذج وكيل الذكاء الاصطناعي](#agents) أدناه.

## وكلاء الذكاء الاصطناعي {#agents}

إذا كنت تبني وكيل ذكاء اصطناعي يعمل مع محفظة، فالنموذج هو أن الوكيل يستطيع قراءة ما يسمح به المستخدم و**اقتراح** معاملة؛ ولا يوقّع أبدًا. تتحقق QoreX من كل اقتراح وتحاكيه، ويوافق المستخدم عليه أو يرفضه في نافذة الموافقة نفسها التي يستخدمها طلب dApp. ويُرفض اقتراح رسالة خاصة بالمحفظة وحدها قبل أن تُفتح أي نافذة. وفي الإضافة يصل الوكيل إلى QoreX عبر برنامج مرافق على حاسوب المستخدم لم يُنشر بعد؛ وفي التطبيق يُلصق الاقتراح أو يصل كرابط `qorex://propose`. ولمعرفة كيف يشغّل المستخدم ذلك وما يراه، اقرأ [وضع المطوّر: وكلاء الذكاء الاصطناعي](/qorex/developer-mode#ai-agents).

## الشبكة التجريبية {#testnet}

**لا تستطيع dApp تبديل الشبكة.** يجب أن يطابق `chainId` في الطلب الشبكة التي عليها المحفظة؛ ويُرفض عدم التطابق. وهذا يحمي المستخدم من صفحة تنقله إلى شبكة تبدو فيها الأموال نفسها وليست كذلك.

لاستخدام الشبكة التجريبية (`qorechain-diana`، معرّف سلسلة EVM هو 9800)، يبدّلها المستخدم في QoreX:

- **التطبيق:** الإعدادات، ثم **استخدام شبكة الاختبار (للمطوّرين)**.
- **الإضافة:** شغّل وضع المطوّر (انقر رقم الإصدار أسفل النافذة المنبثقة سبع مرات)، ثم **التبديل إلى الشبكة التجريبية (diana)**. ويعيدك **العودة إلى الشبكة الرئيسية** إلى الافتراضي.

ثم يظهر شريط TESTNET على كل شاشة، ولا تعرض أرصدة الشبكة التجريبية قيمة بالدولار الأمريكي، وتُعاد تهيئة الارتباط بالشبكة دون إعادة تشغيل. أخبر مستخدميك أن يبدّلوا قبل فتح صفحتك الخاصة بالشبكة التجريبية. وميزات المحفظة الخاصة بالشبكة التجريبية فقط (IBC، وشاشة QoreChain Bridge، وسولانا على QoreChain) موصوفة في [ميزات الشبكة التجريبية فقط](/qorex/testnet-features).

## استكشاف الأخطاء وإصلاحها {#troubleshooting}

| ما تراه | السبب وما ينبغي فعله |
|---|---|
| `window.keplr` غير معرَّف | مقصود. استخدم `window.qorex.native`، أو مكتبة فيها موصّل QoreX. |
| `window.ethereum` ليس QoreX | مقصود. اختر المحفظة عبر EIP-6963 (`rdns` `network.qore.qorex`). |
| `QoreX: chain X does not match the active network Y` | المستخدم على الشبكة الأخرى. اطلب منه التبديل في QoreX؛ فأنت لا تستطيع. |
| `4100`، `pqc-key-missing` | ليس للحساب مفتاح ما بعد كم على الشبكة بعد. اطلب من المستخدم إرسال معاملة واحدة من QoreX، أو استخدم `signAndBroadcast`. |
| `4200`، `amino-unsupported` | مكتبتك تطلب Amino. اضبط التوقيع المباشر. |
| `QoreX: <type> is managed by the wallet itself, not by a website` | رسالة خاصة بالمحفظة وحدها. احذفها؛ فالمستخدم يقوم بذلك من QoreX. |
| `QoreX cannot show what <type> does, so it will not sign it` | رسالة لا تستطيع QoreX فك ترميزها. استخدم نوعًا تستطيع عرضه. |
| `QoreX: send between 1 and 32 messages` | قسّم الطلب. |
| `QoreX: the memo may be at most 256 bytes` | قصّر المذكرة. |
| `QoreX: a message must be 1 to 4096 bytes` | قصّر الرسالة التي تطلب توقيعها. |
| `needs about N gas, more than the 20,000,000 QoreX allows` | استدعاء العقد أثقل من أن تتسع له معاملة واحدة. قسّمه. |
| `QoreX: EVM method X not yet supported` (`4200`) | توقّع QoreX `personal_sign` و`eth_signTypedData_v4` و`eth_sendTransaction` فقط. |
| `QoreX: this account uses the QoreChain (coin 118) key and cannot send on QoreChain's EVM lane` | لا يرسل على مسار EVM إلا الحسابات المستوردة من MetaMask (coin 60). |
| `QoreX: staking, rewards, IBC and governance on QoreChain go through the native lane` | استدعِ المسار الأصلي لذلك؛ فعمليات precompile على EVM تُرفض. |
| استدعاء EVM يظل يتطلب نقرة ثانية | لا تستطيع العقدة فحص ما يفعله الاستدعاء بالرموز، أو لا يمكن فك ترميز الاستدعاء. اشرحه في صفحتك. |
| يفشل استدعاء رمز رغم أن المستخدم فتح نافذة | النافذة التي فتحها المستخدم يدويًا تغطي تحويلات QOR فقط افتراضيًا. دع QoreX تفتح النافذة لكل معاملة، أو اطلب من المستخدم اختيار أي عقد. |
| `4001` مباشرةً بعد أن تطلب الصفحة توقيعًا | رفض المستخدم، أو أغلق نافذة فتح القفل على محفظة مقفلة. اعرض المحاولة مجددًا. |
| تُرجع `eth_accounts` القيمة `[]` | الموقع غير متصل بعد. استدعِ `eth_requestAccounts`. |
| رابط `browse` لا يفعل شيئًا | خالف عنوان الصفحة قاعدة (منفذ، أو IP، أو `localhost`، أو ليس https، أو أكثر من 2048 حرفًا)، أو ليس على الهاتف محفظة بعد. |
| `KEY_NOT_REGISTERED` على خادمك | لم يرسل الموقّع أي معاملة على تلك الشبكة قط. اطلب واحدة أولًا. |

إذا بقيت المشكلة، يستطيع المستخدم إرسال سجل طلبات منقّح من [وضع المطوّر](/qorex/developer-mode)، ويمكنك استخدام الشبكة التجريبية لإعادة إنتاجها.

## أين نُشر {#where-published}

| ماذا | أين |
|---|---|
| إضافة متصفح QoreX | Chrome Web Store وFirefox Add-ons وMac App Store (Safari). راجع [إضافة المتصفح](/qorex/browser-extension#install). |
| تطبيق QoreX ومتصفح dApp فيه | App Store وGoogle Play. راجع [محفظة QoreX](/qorex/overview#how-to-access). |
| التحقق من الرسائل والمعاملات | `@qorechain/qoresign` (TypeScript ولغات أخرى). راجع [QoreSign](/qoresign/overview). |
| اكتشاف المحفظة لتطبيقات الويب | [`@qorechain/wallet-adapter`](/developer-tools/wallet-adapter) |
| موصّلات RainbowKit وInterchain Kit وcosmos-kit، وأنواع، ومحفظة تجريبية | [`@qorechain/qorex-*`](/developer-tools/qorex-integrations) |
| SDK الأساسية لبناء المعاملات وإرسالها | [أدوات المطوّرين](/developer-tools/overview) |

شيفرة QoreX المصدرية ليست عامة. والإصدار الحالي في كل متجر في صفحة [النظرة العامة](/qorex/overview#versions).
