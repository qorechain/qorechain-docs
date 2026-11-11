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
3. Il server imposta `Expiration Time` su ogni messaggio che emette (vedi [Scadenza ed età massima](#expiry)), poi verifica con `verifySiwqWithChain`, che controlla il messaggio, il
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

## Scadenza ed età massima {#expiry}

Imposta sempre `Expiration Time` sul messaggio che il tuo server emette. Un
messaggio senza questo campo viene rifiutato con `SIWQ_EXPIRED` quando ha più di
600 secondi (10 minuti), contati da `Issued At`. Per usare un altro limite, passa
l'età massima al verificatore. Il nome dell'opzione per ogni binding:

- TypeScript, Swift e Kotlin: `maxAgeSeconds`
- Python: `max_age_seconds`
- Rust: `VerifySiwqArgs::max_age_seconds`
- Go: `VerifySiwqOptions.MaxAge`

Un valore zero o negativo fallisce con `INVALID_ARGUMENT`.

I timestamp (`Issued At`, `Expiration Time`, `Not Before`) devono seguire la
grammatica RFC 3339 rigorosa della [specifica](/qoresign/spec/siwq-v1#timestamps):
ora da 00 a 23, minuti e secondi da 00 a 59, una data reale del calendario, una
`Z` maiuscola oppure uno scarto con i due punti, `T` come separatore, niente
`24:00:00` e niente secondi intercalari. Le stesse regole valgono quando crei,
analizzi, firmi e verifichi, e un timestamp fuori da esse fallisce con
`SIWQ_MALFORMED`. I messaggi creati da QoreSign usano già la grammatica.

Quando passi dalla 0.1.x, Swift, Kotlin e Python devono aggiornare insieme il
pacchetto e la sua libreria nativa.

## Account solo classici {#classical-only}

`verifySiwq` rifiuta un sign-in privo della parte ML-DSA-87 a meno che venga
passato `requirePq: false`. Accetta sign-in solo classici soltanto se il tuo
servizio non ha bisogno della garanzia post-quantistica.

Un server eseguibile si trova in
[`examples/siwq-server`](https://github.com/qorechain/qoresign/tree/main/examples/siwq-server).
