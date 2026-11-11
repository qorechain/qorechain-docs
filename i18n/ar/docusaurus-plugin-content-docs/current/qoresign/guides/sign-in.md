---
slug: /qoresign/guides/sign-in
title: "Sign In With QoreChain: التحقق على الخادم"
sidebar_label: Sign In With QoreChain
sidebar_position: 2
---

# Sign In With QoreChain: التحقق على الخادم

SIWQ هي رسالة تسجيل دخول على نمط EIP-4361 يوقّعها مفتاح secp256k1 للحساب (ADR-36) ومفتاح ML-DSA-87 الخاص به. الصيغة: [Sign In With QoreChain v1](/qoresign/spec/siwq-v1).

## التدفق {#flow}

1. يصدر الخادم nonce لمرة واحدة للجلسة.
2. يبني العميل الرسالة بالدالة `createSiwqMessage` وتوقّعها المحفظة بالدالة `signSiwq` (أو تنتج الجزء الكلاسيكي بـ `signArbitrary` وجزء ML-DSA-87 بـ `pqSign` على `siwqPqSignBytes(message)`).
3. يضبط الخادم `Expiration Time` في كل رسالة يصدرها (راجع [الانتهاء والعمر الأقصى](#expiry))، ثم يتحقق بالدالة `verifySiwqWithChain`، التي تفحص الرسالة والـ nonce والنطاق والأوقات، وأن المفتاح الكلاسيكي يتحكم بالعنوان، وتتحقق من توقيع ML-DSA-87 مقابل المفتاح **المسجَّل على السلسلة** لذلك العنوان (راجع [التحقق](/qoresign/spec/siwq-v1#verification)).

## TypeScript {#typescript}

```ts
import { verifySiwqWithChain } from "@qorechain/qoresign/network";

const fields = await verifySiwqWithChain({
  rest: "https://api.qore.host",
  address: body.address,
  message: body.message,
  signature: body.signature,
  domain: "app.example.com",       // the host the request came to
  nonce: session.nonce,            // single use; delete it now
  chainId: "qorechain-vladi",
});
// fields.address is signed in; fields.possessionProven tells whether the key was registered with a proof of possession
```

## Go {#go}

```go
import (
    qoresign "github.com/qorechain/qoresign/go"
    "github.com/qorechain/qoresign/go/network"
)

// The network helpers are methods on a client.
client := network.NewClient("https://api.qore.host")

var sig qoresign.SiwqSignature
if err := json.Unmarshal(signatureJSON, &sig); err != nil {
    return err
}
result, err := client.VerifySiwqWithChain(ctx, address, qoresign.VerifySiwqOptions{
    Message:   message,
    Signature: sig,
    Domain:    "app.example.com", // the host the request came to
    Nonce:     issuedNonce,       // the nonce your server issued
    ChainID:   "qorechain-vladi",
})
if qoresign.IsCode(err, qoresign.CodeSiwqExpired) {
    // ask the user to sign in again
}
// result.Address signed in; result.PossessionProven reports how the key was registered.
```

## الانتهاء والعمر الأقصى {#expiry}

اضبط دائمًا `Expiration Time` في الرسالة التي يصدرها خادمك. الرسالة التي لا تحمله تُرفض بالرمز `SIWQ_EXPIRED` متى تجاوز عمرها 600 ثانية (10 دقائق)، محسوبةً من `Issued At`. ولاستخدام حد آخر، مرّر العمر الأقصى إلى أداة التحقق. اسم الخيار في كل ربط:

- TypeScript وSwift وKotlin: `maxAgeSeconds`
- Python: `max_age_seconds`
- Rust: `VerifySiwqArgs::max_age_seconds`
- Go: `VerifySiwqOptions.MaxAge`

القيمة صفر أو السالبة تفشل بالرمز `INVALID_ARGUMENT`.

يجب أن تتبع الطوابع الزمنية (`Issued At` و`Expiration Time` و`Not Before`) قواعد RFC 3339 الصارمة الواردة في [المواصفة](/qoresign/spec/siwq-v1#timestamps): الساعة من 00 إلى 23، والدقيقة والثانية من 00 إلى 59، وتاريخ تقويمي حقيقي، و`Z` بحرف كبير أو إزاحة بنقطتين رأسيتين، و`T` فاصلًا، ولا `24:00:00` ولا ثواني كبيسة. تسري القواعد نفسها عند الإنشاء والتحليل والتوقيع والتحقق، والطابع الزمني الخارج عنها يفشل بالرمز `SIWQ_MALFORMED`. الرسائل التي ينشئها QoreSign تستخدم هذه القواعد أصلًا.

عند الترقية من 0.1.x، يجب ترقية الحزمة ومكتبتها الأصلية معًا في Swift وKotlin وPython.

## الحسابات الكلاسيكية فقط {#classical-only}

ترفض `verifySiwq` أي تسجيل دخول بلا جزء ML-DSA-87 ما لم يُمرَّر `requirePq: false`. لا تقبل تسجيلات الدخول الكلاسيكية فقط إلا إذا كانت خدمتك لا تحتاج إلى الضمان ما بعد الكمّي.

يوجد خادم قابل للتشغيل في [`examples/siwq-server`](https://github.com/qorechain/qoresign/tree/main/examples/siwq-server).
