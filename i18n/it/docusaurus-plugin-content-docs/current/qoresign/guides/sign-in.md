---
slug: /qoresign/guides/sign-in
title: "Sign In With QoreChain: verifica lato server"
sidebar_label: Sign In With QoreChain
sidebar_position: 2
---

# Sign In With QoreChain: verifica lato server

SIWQ è un messaggio di sign-in in stile EIP-4361 firmato dalla chiave secp256k1
dell'account (ADR-36) e dalla sua chiave ML-DSA-87. Formato:
[Sign In With QoreChain v1](/qoresign/spec/siwq-v1).

## Flusso {#flow}

1. Il server emette un nonce monouso per la sessione.
2. Il client costruisce il messaggio con `createSiwqMessage` e il wallet lo firma
   con `signSiwq` (oppure produce la parte classica con `signArbitrary` e la
   parte ML-DSA-87 con `pqSign` su `siwqPqSignBytes(message)`).
3. Il server verifica con `verifySiwqWithChain`, che controlla il messaggio, il
   nonce, il dominio, gli orari, che la chiave classica controlli l'indirizzo e
   la firma ML-DSA-87 rispetto alla chiave **registrata on-chain** per
   l'indirizzo (vedi [Verifica](/qoresign/spec/siwq-v1#verification)).

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

## Account solo classici {#classical-only}

`verifySiwq` rifiuta un sign-in privo della parte ML-DSA-87 a meno che venga
passato `requirePq: false`. Accetta sign-in solo classici soltanto se il tuo
servizio non ha bisogno della garanzia post-quantistica.

Un server eseguibile si trova in
[`examples/siwq-server`](https://github.com/qorechain/qoresign/tree/main/examples/siwq-server).
