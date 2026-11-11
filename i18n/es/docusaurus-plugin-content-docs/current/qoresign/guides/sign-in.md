---
slug: /qoresign/guides/sign-in
title: "Sign In With QoreChain: verificación en el servidor"
sidebar_label: Sign In With QoreChain
sidebar_position: 2
---

# Sign In With QoreChain: verificación en el servidor

SIWQ es un mensaje de inicio de sesión al estilo EIP-4361 firmado por la clave
secp256k1 de la cuenta (ADR-36) y por su clave ML-DSA-87. Formato:
[Sign In With QoreChain v1](/qoresign/spec/siwq-v1).

## Flujo {#flow}

1. El servidor emite un nonce de un solo uso para la sesión.
2. El cliente construye el mensaje con `createSiwqMessage` y la cartera lo firma
   con `signSiwq` (o produce la parte clásica con `signArbitrary` y la parte
   ML-DSA-87 con `pqSign` sobre `siwqPqSignBytes(message)`).
3. El servidor fija `Expiration Time` en cada mensaje que emite (consulta [Expiración y edad máxima](#expiry)) y después verifica con `verifySiwqWithChain`, que comprueba el mensaje, el
   nonce, el dominio, los tiempos, que la clave clásica controla la dirección y
   la firma ML-DSA-87 contra la clave **registrada en la cadena** para la
   dirección (consulta [Verificación](/qoresign/spec/siwq-v1#verification)).

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

## Expiración y edad máxima {#expiry}

Fija siempre `Expiration Time` en el mensaje que emite tu servidor. Un mensaje
sin él se rechaza con `SIWQ_EXPIRED` cuando tiene más de 600 segundos
(10 minutos), contados desde `Issued At`. Para usar otro límite, pasa la edad
máxima al verificador. El nombre de la opción en cada binding:

- TypeScript, Swift y Kotlin: `maxAgeSeconds`
- Python: `max_age_seconds`
- Rust: `VerifySiwqArgs::max_age_seconds`
- Go: `VerifySiwqOptions.MaxAge`

Un valor cero o negativo falla con `INVALID_ARGUMENT`.

Las marcas de tiempo (`Issued At`, `Expiration Time`, `Not Before`) deben seguir
la gramática estricta de RFC 3339 de la [especificación](/qoresign/spec/siwq-v1#timestamps):
hora de 00 a 23, minuto y segundo de 00 a 59, una fecha real del calendario, una
`Z` mayúscula o un desfase con dos puntos, `T` como separador, sin `24:00:00` y
sin segundos intercalares. Las mismas reglas se aplican al crear, analizar,
firmar y verificar, y una marca fuera de ellas falla con `SIWQ_MALFORMED`. Los
mensajes creados por QoreSign ya usan la gramática.

Al actualizar desde la 0.1.x, Swift, Kotlin y Python deben actualizar el paquete
y su biblioteca nativa a la vez.

## Cuentas solo clásicas {#classical-only}

`verifySiwq` rechaza un inicio de sesión sin la parte ML-DSA-87 a menos que se
pase `requirePq: false`. Acepta inicios de sesión solo clásicos únicamente si tu
servicio no necesita la garantía post-cuántica.

Hay un servidor ejecutable en
[`examples/siwq-server`](https://github.com/qorechain/qoresign/tree/main/examples/siwq-server).
