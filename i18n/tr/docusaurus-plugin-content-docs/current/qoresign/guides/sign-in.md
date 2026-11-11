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
3. Sunucu ürettiği her mesaja `Expiration Time` ekler (bkz. [Geçerlilik süresi ve en yüksek yaş](#expiry)), ardından `verifySiwqWithChain` ile doğrular; bu işlev mesajı, nonce'u, alan adını,
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

## Geçerlilik süresi ve en yüksek yaş {#expiry}

Sunucunuzun ürettiği mesaja her zaman `Expiration Time` ekleyin. Bu alanı
taşımayan bir mesaj, `Issued At` değerinden itibaren 600 saniyeden (10 dakika)
eski olduğunda `SIWQ_EXPIRED` ile reddedilir. Başka bir sınır kullanmak için en
yüksek yaşı doğrulayıcıya verin. Bağlama göre seçenek adı:

- TypeScript, Swift ve Kotlin: `maxAgeSeconds`
- Python: `max_age_seconds`
- Rust: `VerifySiwqArgs::max_age_seconds`
- Go: `VerifySiwqOptions.MaxAge`

Sıfır veya negatif bir değer `INVALID_ARGUMENT` ile başarısız olur.

Zaman damgaları (`Issued At`, `Expiration Time`, `Not Before`), [belirtimin](/qoresign/spec/siwq-v1#timestamps)
katı RFC 3339 dilbilgisine uymalıdır: saat 00 ile 23, dakika ve saniye 00 ile 59
arası, gerçek bir takvim tarihi, büyük harfli `Z` veya iki nokta üst üste ile
yazılmış bir sapma, ayırıcı olarak `T`, `24:00:00` ve artık saniye yok. Aynı
kurallar oluşturma, ayrıştırma, imzalama ve doğrulamada geçerlidir; bunların
dışındaki bir zaman damgası `SIWQ_MALFORMED` ile başarısız olur. QoreSign'ın
oluşturduğu mesajlar bu dilbilgisini zaten kullanır.

0.1.x sürümünden yükseltirken Swift, Kotlin ve Python paketi ile yerel
kütüphanesini birlikte yükseltmelidir.

## Yalnızca klasik hesaplar {#classical-only}

`verifySiwq`, `requirePq: false` verilmedikçe ML-DSA-87 kısmı olmayan bir oturum
açmayı reddeder. Yalnızca klasik oturum açmaları, ancak hizmetiniz kuantum sonrası
güvenceye ihtiyaç duymuyorsa kabul edin.

Çalıştırılabilir bir sunucu
[`examples/siwq-server`](https://github.com/qorechain/qoresign/tree/main/examples/siwq-server)
içindedir.
