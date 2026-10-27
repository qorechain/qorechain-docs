---
slug: /qoresign/guides/sign-in
title: "Sign In With QoreChain: server verification"
sidebar_label: Sign In With QoreChain
sidebar_position: 2
---

# Sign In With QoreChain: server verification

SIWQ is an EIP-4361-style sign-in message signed by the account's secp256k1 key
(ADR-36) and by its ML-DSA-87 key. Format:
[Sign In With QoreChain v1](/qoresign/spec/siwq-v1).

## Flow {#flow}

1. The server issues a single-use nonce for the session.
2. The client builds the message with `createSiwqMessage` and the wallet signs
   it with `signSiwq` (or produces the classical part with `signArbitrary` and
   the ML-DSA-87 part with `pqSign` over `siwqPqSignBytes(message)`).
3. The server verifies with `verifySiwqWithChain`, which checks the message, the
   nonce, the domain, the times, that the classical key controls the address,
   and the ML-DSA-87 signature against the key **registered on chain** for the
   address (see [Verification](/qoresign/spec/siwq-v1#verification)).

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

## Classical-only accounts {#classical-only}

`verifySiwq` refuses a sign-in without the ML-DSA-87 part unless
`requirePq: false` is passed. Accept classical-only sign-ins only if your
service does not need the post-quantum guarantee.

A runnable server is in
[`examples/siwq-server`](https://github.com/qorechain/qoresign/tree/main/examples/siwq-server).
