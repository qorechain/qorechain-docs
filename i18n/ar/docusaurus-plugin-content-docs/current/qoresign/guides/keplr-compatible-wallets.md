---
slug: /qoresign/guides/keplr-compatible-wallets
title: إضافة التوقيع الهجين إلى محفظة متوافقة مع Keplr
sidebar_label: المحافظ المتوافقة مع Keplr
sidebar_position: 1
---

# إضافة التوقيع الهجين إلى محفظة متوافقة مع Keplr

يرفض المسار الأصلي في QoreChain أي معاملة من حساب له مفتاح ML-DSA-87 مسجَّل ما لم تحمل المعاملة أيضًا توقيع ذلك المفتاح. تنتج المحفظة المتوافقة مع Keplr (Keplr وLeap وCosmostation وغيرها مما ينفّذ `signDirect`) جزء secp256k1؛ أما جزء ML-DSA-87 فيجب أن يأتي ممن يحتفظ بالمفتاح ما بعد الكمّي.

هناك طريقتان لإضافته.

## الخيار أ: المحفظة تحتفظ بالمفتاحين (QoreSign) {#option-a}

تشتق المحفظة مفتاح ML-DSA-87 إلى جانب مفتاح secp256k1 وتضيف الطبقة قبل أن توقّع.

```ts
import { deriveCanonicalPqKey, signPqLayer } from "@qorechain/qoresign";

// at account creation or import, from the same mnemonic and address
const pqKey = deriveCanonicalPqKey({ mnemonic, address });

// inside signDirect(signerAddress, signDoc):
const { bodyBytes } = signPqLayer({
  chainId: signDoc.chainId,
  bodyBytes: signDoc.bodyBytes,
  authInfoBytes: signDoc.authInfoBytes,
  pqKey,
});
const finalDoc = { ...signDoc, bodyBytes }; // sign this with the secp256k1 key, as for any Cosmos SDK chain
```

قواعد تحمي المستخدم:

- اعرض على المستخدم الرسائل والرسوم الواردة في `bodyBytes` / `authInfoBytes` قبل التوقيع، كما في أي طلب `signDirect`. يغطي توقيع ML-DSA-87 الرسوم.
- عندما يرسل dApp جسمًا يحمل طبقة PQC بالفعل، تحقق منه باستخدام `assertPqLayerMatchesRegisteredKey` (من `@qorechain/qoresign/network`) قبل إضافة توقيعك الكلاسيكي؛ فالطبقة التي لا تجتاز التحقق لا تحمي شيئًا.
- سجّل المفتاح مرة واحدة لكل حساب باستخدام `buildRegisterPqKeyMessage`، موقَّعًا في وضع `classicalOnly` (راجع [`examples/register-and-send`](https://github.com/qorechain/qoresign/tree/main/examples/register-and-send) و[التسجيل](/qoresign/spec/hybrid-signing-v1#registration)).
- بعد البث، اقرأ المعاملة المثبَّتة واستدعِ `evaluateLayerState`؛ وتعني `downgraded` أن الطبقة لم تصل إلى السلسلة.

## الخيار ب: الـ dApp تحتفظ بالمفتاح ما بعد الكمّي (`@qorechain/wallet-adapter`) {#option-b}

عندما يتعذّر تغيير المحفظة، يمكن لـ dApp استخدام [`@qorechain/wallet-adapter`](https://www.npmjs.com/package/@qorechain/wallet-adapter): فهو يضيف طبقة ML-DSA-87 إلى الجسم ثم يطلب من المحفظة غير المعدَّلة توقيع `signDirect` عاديًا. وعندئذ يبقى المفتاح ما بعد الكمّي لدى الـ dApp أو موقّع مرافق، لا في المحفظة. ينتج QoreSign والمحوّل البايتات نفسها للمفاتيح نفسها.

## تسجيل السلسلة في Keplr {#chain-registration}

اقترح السلسلة باستخدام `experimentalSuggestChain` مع واصفات السلسلة المنشورة: معرّفا السلسلة `qorechain-vladi` (الشبكة الرئيسية) و`qorechain-diana` (الشبكة التجريبية)، وبادئة bech32 هي `qor`، ونوع العملة `118`، وعملة الرسوم `uqor` بـ 6 خانات عشرية، وأدنى سعر للغاز `0.1`. نقاط النهاية العامة: `https://rpc.qore.host` و`https://api.qore.host` (الشبكة الرئيسية)، و`https://rpc-testnet.qore.host` و`https://api-testnet.qore.host` (الشبكة التجريبية).
