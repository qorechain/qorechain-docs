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
3. يتحقق الخادم بالدالة `verifySiwqWithChain`، التي تفحص الرسالة والـ nonce والنطاق والأوقات، وأن المفتاح الكلاسيكي يتحكم بالعنوان، وتتحقق من توقيع ML-DSA-87 مقابل المفتاح **المسجَّل على السلسلة** لذلك العنوان (راجع [التحقق](/qoresign/spec/siwq-v1#verification)).

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

fields, err := network.VerifySiwqWithChain(ctx, network.Options{REST: "https://api.qore.host"}, address, message, signature,
    qoresign.VerifySiwqOptions{Domain: "app.example.com", Nonce: nonce, ChainID: "qorechain-vladi"})
```

## الحسابات الكلاسيكية فقط {#classical-only}

ترفض `verifySiwq` أي تسجيل دخول بلا جزء ML-DSA-87 ما لم يُمرَّر `requirePq: false`. لا تقبل تسجيلات الدخول الكلاسيكية فقط إلا إذا كانت خدمتك لا تحتاج إلى الضمان ما بعد الكمّي.

يوجد خادم قابل للتشغيل في [`examples/siwq-server`](https://github.com/qorechain/qoresign/tree/main/examples/siwq-server).
