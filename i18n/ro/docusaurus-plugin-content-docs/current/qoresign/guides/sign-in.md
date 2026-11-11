---
slug: /qoresign/guides/sign-in
title: "Sign In With QoreChain: verificarea pe server"
sidebar_label: Sign In With QoreChain
sidebar_position: 2
---

# Sign In With QoreChain: verificarea pe server

SIWQ este un mesaj de sign-in în stil EIP-4361, semnat de cheia secp256k1 a
contului (ADR-36) și de cheia sa ML-DSA-87. Formatul:
[Sign In With QoreChain v1](/qoresign/spec/siwq-v1).

## Flux {#flow}

1. Serverul emite un nonce de unică folosință pentru sesiune.
2. Clientul construiește mesajul cu `createSiwqMessage`, iar portofelul îl
   semnează cu `signSiwq` (sau produce partea clasică cu `signArbitrary` și
   partea ML-DSA-87 cu `pqSign` peste `siwqPqSignBytes(message)`).
3. Serverul setează `Expiration Time` pe fiecare mesaj pe care îl emite (vezi [Expirare și vârstă maximă](#expiry)), apoi verifică cu `verifySiwqWithChain`, care controlează mesajul, nonce-ul,
   domeniul, momentele de timp, faptul că cheia clasică controlează adresa și
   semnătura ML-DSA-87 față de cheia **înregistrată pe lanț** pentru adresă
   (vezi [Verificare](/qoresign/spec/siwq-v1#verification)).

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

## Expirare și vârstă maximă {#expiry}

Setați întotdeauna `Expiration Time` pe mesajul emis de server. Un mesaj fără
acest câmp este refuzat cu `SIWQ_EXPIRED` după ce are mai mult de 600 de secunde
(10 minute), socotite de la `Issued At`. Pentru altă limită, transmiteți
verificatorului vârsta maximă. Numele opțiunii pentru fiecare binding:

- TypeScript, Swift și Kotlin: `maxAgeSeconds`
- Python: `max_age_seconds`
- Rust: `VerifySiwqArgs::max_age_seconds`
- Go: `VerifySiwqOptions.MaxAge`

O valoare zero sau negativă eșuează cu `INVALID_ARGUMENT`.

Marcajele de timp (`Issued At`, `Expiration Time`, `Not Before`) trebuie să
respecte gramatica strictă RFC 3339 din [specificație](/qoresign/spec/siwq-v1#timestamps):
ora de la 00 la 23, minutul și secunda de la 00 la 59, o dată calendaristică
reală, un `Z` majuscul sau un offset cu două puncte, `T` ca separator, fără
`24:00:00` și fără secunde intercalare. Aceleași reguli se aplică la creare,
parsare, semnare și verificare, iar un marcaj în afara lor eșuează cu
`SIWQ_MALFORMED`. Mesajele create de QoreSign folosesc deja gramatica.

La actualizarea de la 0.1.x, Swift, Kotlin și Python trebuie să actualizeze
pachetul împreună cu biblioteca sa nativă.

## Conturi doar cu cheie clasică {#classical-only}

`verifySiwq` refuză un sign-in fără partea ML-DSA-87, cu excepția cazului în
care se transmite `requirePq: false`. Acceptați sign-in-uri doar cu cheie
clasică numai dacă serviciul dumneavoastră nu are nevoie de garanția
post-cuantică.

Un server care rulează se găsește în
[`examples/siwq-server`](https://github.com/qorechain/qoresign/tree/main/examples/siwq-server).
