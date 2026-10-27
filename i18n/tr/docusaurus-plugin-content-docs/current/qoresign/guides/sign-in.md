---
slug: /qoresign/guides/sign-in
title: "Sign In With QoreChain: sunucu doğrulaması"
sidebar_label: Sign In With QoreChain
sidebar_position: 2
---

# Sign In With QoreChain: sunucu doğrulaması

SIWQ, hesabın secp256k1 anahtarı (ADR-36) ve ML-DSA-87 anahtarı tarafından
imzalanan, EIP-4361 tarzı bir oturum açma mesajıdır. Biçim:
[Sign In With QoreChain v1](/qoresign/spec/siwq-v1).

## Akış {#flow}

1. Sunucu, oturum için tek kullanımlık bir nonce üretir.
2. İstemci mesajı `createSiwqMessage` ile oluşturur ve cüzdan `signSiwq` ile
   imzalar (veya klasik kısmı `signArbitrary` ile, ML-DSA-87 kısmını ise
   `siwqPqSignBytes(message)` üzerinde `pqSign` ile üretir).
3. Sunucu `verifySiwqWithChain` ile doğrular; bu işlev mesajı, nonce'u, alan adını,
   zamanları, klasik anahtarın adresi kontrol ettiğini ve ML-DSA-87 imzasını
   adres için **zincirde kayıtlı** anahtara karşı denetler (bkz.
   [Doğrulama](/qoresign/spec/siwq-v1#verification)).

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

## Yalnızca klasik hesaplar {#classical-only}

`verifySiwq`, `requirePq: false` verilmedikçe ML-DSA-87 kısmı olmayan bir oturum
açmayı reddeder. Yalnızca klasik oturum açmaları, ancak hizmetiniz kuantum sonrası
güvenceye ihtiyaç duymuyorsa kabul edin.

Çalıştırılabilir bir sunucu
[`examples/siwq-server`](https://github.com/qorechain/qoresign/tree/main/examples/siwq-server)
içindedir.
