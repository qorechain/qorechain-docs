---
slug: /qoresign/guides/sign-in
title: "Sign In With QoreChain: Prüfung auf dem Server"
sidebar_label: Sign In With QoreChain
sidebar_position: 2
---

# Sign In With QoreChain: Prüfung auf dem Server

SIWQ ist eine Anmeldenachricht im Stil von EIP-4361, signiert mit dem
secp256k1-Schlüssel des Kontos (ADR-36) und mit seinem ML-DSA-87-Schlüssel.
Format: [Sign In With QoreChain v1](/qoresign/spec/siwq-v1).

## Ablauf {#flow}

1. Der Server stellt für die Sitzung eine einmalig verwendbare Nonce aus.
2. Der Client baut die Nachricht mit `createSiwqMessage`, und die Wallet
   signiert sie mit `signSiwq` (oder erzeugt den klassischen Teil mit
   `signArbitrary` und den ML-DSA-87-Teil mit `pqSign` über
   `siwqPqSignBytes(message)`).
3. Der Server setzt `Expiration Time` auf jeder Nachricht, die er ausstellt (siehe [Ablauf und maximales Alter](#expiry)), und prüft dann mit `verifySiwqWithChain`. Das prüft die Nachricht, die
   Nonce, die Domain, die Zeitangaben, dass der klassische Schlüssel die Adresse
   kontrolliert, und die ML-DSA-87-Signatur gegen den **on-chain registrierten**
   Schlüssel der Adresse (siehe
   [Prüfung](/qoresign/spec/siwq-v1#verification)).

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

## Ablauf und maximales Alter {#expiry}

Setzen Sie `Expiration Time` immer auf der Nachricht, die Ihr Server ausstellt.
Eine Nachricht ohne dieses Feld wird mit `SIWQ_EXPIRED` abgelehnt, sobald sie
älter als 600 Sekunden (10 Minuten) ist, gerechnet ab `Issued At`. Für ein
anderes Limit übergeben Sie das maximale Alter an den Prüfer. Der Optionsname je
Binding:

- TypeScript, Swift und Kotlin: `maxAgeSeconds`
- Python: `max_age_seconds`
- Rust: `VerifySiwqArgs::max_age_seconds`
- Go: `VerifySiwqOptions.MaxAge`

Ein Wert von null oder ein negativer Wert schlägt mit `INVALID_ARGUMENT` fehl.

Zeitstempel (`Issued At`, `Expiration Time`, `Not Before`) müssen der strengen
RFC-3339-Grammatik der [Spezifikation](/qoresign/spec/siwq-v1#timestamps)
folgen: Stunde 00 bis 23, Minute und Sekunde 00 bis 59, ein reales
Kalenderdatum, ein großes `Z` oder ein Offset mit Doppelpunkt, `T` als Trenner,
kein `24:00:00` und keine Schaltsekunden. Dieselben Regeln gelten beim Erzeugen,
Parsen, Signieren und Prüfen, und ein Zeitstempel außerhalb davon schlägt mit
`SIWQ_MALFORMED` fehl. Von QoreSign erzeugte Nachrichten nutzen die Grammatik
bereits.

Beim Wechsel von 0.1.x müssen Swift, Kotlin und Python das Paket und seine
native Bibliothek gemeinsam aktualisieren.

## Nur-klassische Konten {#classical-only}

`verifySiwq` lehnt eine Anmeldung ohne den ML-DSA-87-Teil ab, sofern nicht
`requirePq: false` übergeben wird. Akzeptieren Sie rein klassische Anmeldungen
nur, wenn Ihr Dienst die Post-Quanten-Garantie nicht benötigt.

Ein lauffähiger Server befindet sich in
[`examples/siwq-server`](https://github.com/qorechain/qoresign/tree/main/examples/siwq-server).
