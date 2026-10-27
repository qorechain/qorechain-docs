---
slug: /qoresign/guides/sign-in
title: "Sign In With QoreChain : vérification côté serveur"
sidebar_label: Sign In With QoreChain
sidebar_position: 2
---

# Sign In With QoreChain : vérification côté serveur

SIWQ est un message de connexion de style EIP-4361, signé par la clé secp256k1 du
compte (ADR-36) et par sa clé ML-DSA-87. Format :
[Sign In With QoreChain v1](/qoresign/spec/siwq-v1).

## Déroulement {#flow}

1. Le serveur émet un nonce à usage unique pour la session.
2. Le client construit le message avec `createSiwqMessage` et le portefeuille le
   signe avec `signSiwq` (ou produit la partie classique avec `signArbitrary` et
   la partie ML-DSA-87 avec `pqSign` sur `siwqPqSignBytes(message)`).
3. Le serveur vérifie avec `verifySiwqWithChain`, qui contrôle le message, le
   nonce, le domaine, les dates, que la clé classique contrôle l'adresse, et la
   signature ML-DSA-87 par rapport à la clé **enregistrée sur la chaîne** pour
   l'adresse (voir [Vérification](/qoresign/spec/siwq-v1#verification)).

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

## Comptes uniquement classiques {#classical-only}

`verifySiwq` refuse une connexion sans la partie ML-DSA-87, sauf si
`requirePq: false` est passé. N'acceptez les connexions uniquement classiques que
si votre service n'a pas besoin de la garantie post-quantique.

Un serveur exécutable se trouve dans
[`examples/siwq-server`](https://github.com/qorechain/qoresign/tree/main/examples/siwq-server).
