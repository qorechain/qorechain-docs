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
3. The server sets `Expiration Time` on every message it issues (see [Expiration and maximum age](#expiry)), then verifies with `verifySiwqWithChain`, which checks the message, the
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

## Expiration and maximum age {#expiry}

Always set `Expiration Time` on the message your server issues. A message
without it is refused with `SIWQ_EXPIRED` once it is older than 600 seconds
(10 minutes), counted from `Issued At`. To use another limit, pass the maximum
age to the verifier. The option name per binding:

- TypeScript, Swift and Kotlin: `maxAgeSeconds`
- Python: `max_age_seconds`
- Rust: `VerifySiwqArgs::max_age_seconds`
- Go: `VerifySiwqOptions.MaxAge`

A zero or negative value fails with `INVALID_ARGUMENT`.

Timestamps (`Issued At`, `Expiration Time`, `Not Before`) must follow the strict
RFC 3339 grammar of the [specification](/qoresign/spec/siwq-v1#timestamps): hour
00 to 23, minute and second 00 to 59, a real calendar date, an uppercase `Z` or
an offset with a colon, `T` as the separator, no `24:00:00` and no leap seconds.
The same rules apply when you create, parse, sign and verify, and a timestamp
outside them fails with `SIWQ_MALFORMED`. Messages created by QoreSign already use
the grammar.

When you upgrade from 0.1.x, Swift, Kotlin and Python must upgrade the package
and its native library together.

## Classical-only accounts {#classical-only}

`verifySiwq` refuses a sign-in without the ML-DSA-87 part unless
`requirePq: false` is passed. Accept classical-only sign-ins only if your
service does not need the post-quantum guarantee.

A runnable server is in
[`examples/siwq-server`](https://github.com/qorechain/qoresign/tree/main/examples/siwq-server).
