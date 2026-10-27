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
3. Serverul verifică cu `verifySiwqWithChain`, care controlează mesajul, nonce-ul,
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

fields, err := network.VerifySiwqWithChain(ctx, network.Options{REST: "https://api.qore.host"}, address, message, signature,
    qoresign.VerifySiwqOptions{Domain: "app.example.com", Nonce: nonce, ChainID: "qorechain-vladi"})
```

## Conturi doar cu cheie clasică {#classical-only}

`verifySiwq` refuză un sign-in fără partea ML-DSA-87, cu excepția cazului în
care se transmite `requirePq: false`. Acceptați sign-in-uri doar cu cheie
clasică numai dacă serviciul dumneavoastră nu are nevoie de garanția
post-cuantică.

Un server care rulează se găsește în
[`examples/siwq-server`](https://github.com/qorechain/qoresign/tree/main/examples/siwq-server).
