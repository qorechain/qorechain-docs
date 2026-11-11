---
slug: /qoresign/spec/siwq-v1
title: Sign In With QoreChain v1
sidebar_label: Sign In With QoreChain v1
sidebar_position: 2
---

# Sign In With QoreChain (SIWQ), versión 1

Estado: estable para la versión 1 del formato de mensaje. Fuente:
[`spec/siwq-v1.md`](https://github.com/qorechain/qoresign/blob/main/spec/siwq-v1.md).

SIWQ permite que una cuenta de QoreChain demuestre ante un servicio fuera de la
cadena que controla sus claves. El mensaje sigue el diseño de
[EIP-4361](https://eips.ethereum.org/EIPS/eip-4361) y de Sign In With Solana,
adaptado a las direcciones y a los chain ids de QoreChain. La firma tiene dos
partes: una firma secp256k1 ADR-36, que cualquier cartera compatible con Keplr
puede producir con `signArbitrary`, y una firma ML-DSA-87 (FIPS 204) de la clave
post-cuántica registrada de la cuenta.

## Mensaje {#message}

```
${scheme://}${domain} wants you to sign in with your QoreChain account:
${address}

${statement}

URI: ${uri}
Version: 1
Chain ID: ${chain-id}
Nonce: ${nonce}
Issued At: ${issued-at}
Expiration Time: ${expiration-time}
Not Before: ${not-before}
Request ID: ${request-id}
Resources:
- ${resources[0]}
- ${resources[1]}
...
```

- Las líneas se separan con un único `\n`; no hay salto de línea final.
- `scheme://` es opcional. `domain` es la autoridad RFC 3986 del sitio que
  solicita (host y puerto opcional).
- `address` es la forma bech32 `qor1` de la cuenta.
- La línea de la declaración (statement) es opcional. Sin ella, la dirección va
  seguida de dos líneas vacías, como en EIP-4361.
- `Version` es `1`. `Chain ID` es un chain id de QoreChain, como
  `qorechain-vladi`.
- `Nonce` tiene al menos 8 caracteres alfanuméricos elegidos por el servidor, de
  un solo uso.
- Las marcas de tiempo siguen la gramática estricta de RFC 3339 descrita en [Marcas de tiempo](#timestamps).
- `Expiration Time`, `Not Before`, `Request ID` y `Resources` son opcionales y
  aparecen en este orden.

Un verificador debe volver a renderizar los campos analizados y rechazar un
mensaje que no coincida byte por byte.

## Firmas {#signatures}

```json
{
  "signatureType": "ml-dsa-87-hybrid",
  "classical": { "keyType": "secp256k1", "publicKey": "<base64>", "signature": "<base64>" },
  "pq": { "algorithmId": 1, "signature": "<base64>" }
}
```

### Parte clásica (ADR-36) {#classical-part}

La clave secp256k1 de la cuenta firma el documento de firma amino JSON siguiente,
serializado con las claves ordenadas y sin espacios en blanco, donde `data` es el
base64 del mensaje UTF-8 y `signer` la dirección `qor1`:

```json
{"account_number":"0","chain_id":"","fee":{"amount":[],"gas":"0"},"memo":"","msgs":[{"type":"sign/MsgSignData","value":{"data":"...","signer":"qor1..."}}],"sequence":"0"}
```

El digest es SHA-256 para cuentas `secp256k1` y KECCAK-256 para cuentas
`eth_secp256k1`; la firma es `r || s` de 64 bytes, low-S. `publicKey` es la clave
comprimida de 33 bytes, que debe derivar a `address` bajo `keyType`.

### Parte post-cuántica {#post-quantum-part}

```
pq.signature = ML-DSA-87.Sign(sk, UTF-8("qorechain-siwq-v1|" + message))
```

El prefijo de dominio evita que una firma de inicio de sesión pueda usarse como
firma de transacción y viceversa (consulta
[Separación de dominios](/qoresign/spec/message-signing-v1#domain-separation)).

`signatureType` es `secp256k1` cuando falta la parte `pq`. Los verificadores
deben rechazar esos inicios de sesión salvo que acepten explícitamente cuentas
solo clásicas.

## Marcas de tiempo {#timestamps}

`Issued At`, `Expiration Time` y `Not Before` usan una sola gramática estricta
de RFC 3339. Las mismas reglas se aplican al crear, analizar, firmar y verificar
un mensaje:

- hora de 00 a 23, minuto y segundo de 00 a 59, así que `24:00:00` y los
  segundos intercalares (segundo 60) se rechazan;
- una fecha real del calendario;
- una `Z` mayúscula, o un desfase de 00:00 a 23:59 escrito con dos puntos (un
  desfase sin dos puntos se rechaza);
- `T` como separador: sin espacio y sin `t` ni `z` minúsculas.

Una marca fuera de la gramática falla con `SIWQ_MALFORMED`. Los vectores
compartidos están en `vectors/siwq-timestamps-v1.json`. Desde QoreSign 0.2.0,
`parseSiwqTimestamp` (TypeScript) y `ParseSiwqTimestamp` (Go) devuelven los
milisegundos Unix de una marca en esta gramática.

## Edad máxima {#max-age}

Los servidores deben exigir `Expiration Time` y fijarlo siempre en los mensajes
que emiten. Un mensaje sin `Expiration Time` se rechaza con `SIWQ_EXPIRED`
cuando tiene más de 600 segundos (10 minutos), contados desde `Issued At`.
QoreSign 0.2.0 y posteriores hacen la edad configurable en todos los bindings:

| Binding | Opción |
|---|---|
| TypeScript | `maxAgeSeconds` |
| Python | `max_age_seconds` |
| Rust | `VerifySiwqArgs::max_age_seconds` |
| Go | `VerifySiwqOptions.MaxAge` |
| Swift | `maxAgeSeconds` |
| Kotlin | `maxAgeSeconds` |

Un valor cero o negativo falla con `INVALID_ARGUMENT`.

## Verificación {#verification}

Un verificador debe comprobar, en este orden:

1. que el mensaje se analiza y está en forma canónica;
2. que `domain` es igual al dominio del que llegó la solicitud;
3. que `nonce` es igual al nonce que el servidor emitió para esta sesión, y que
   el nonce no se ha usado antes;
4. que `Chain ID` es la red esperada;
5. que `Expiration Time` está en el futuro, y que `Not Before` e `Issued At` no
   están en el futuro (permitiendo un pequeño desfase de reloj). Un mensaje sin
   `Expiration Time` se rechaza cuando tiene más de 600 segundos (10 minutos),
   contados desde `Issued At`; el verificador hace configurable esta edad máxima
   (consulta [Edad máxima](#max-age));
6. que la clave pública clásica deriva a `address` y que la firma ADR-36 se
   verifica;
7. que la firma ML-DSA-87 se verifica con la clave pública **registrada en la
   cadena** para `address` (`/qorechain/pqc/v1/account/{address}`), no con una
   clave aportada por el cliente.

## Vectores de prueba {#test-vectors}

`vectors/qoresign-v1.json`, campo `siwq`. Consulta
[Vectores de prueba](/qoresign/vectors).
