---
slug: /qoresign/spec/message-signing-v1
title: Firma de mensajes v1
sidebar_label: Firma de mensajes v1
sidebar_position: 3
---

# Firma de mensajes, versión 1

Estado: estable. Sirve para firmar datos arbitrarios fuera de la cadena (la
solicitud `signArbitrary` de las carteras compatibles con Keplr), por ejemplo
para demostrar el control de una cuenta ante un servicio. Fuente:
[`spec/message-signing-v1.md`](https://github.com/qorechain/qoresign/blob/main/spec/message-signing-v1.md).

## Firma {#signature}

```json
{
  "signatureType": "ml-dsa-87-hybrid",
  "classical": { "keyType": "secp256k1", "publicKey": "<base64>", "signature": "<base64>" },
  "pq": { "algorithmId": 1, "signature": "<base64>" }
}
```

- **Parte clásica:** ADR-36. La clave secp256k1 de la cuenta firma el documento
  de firma amino JSON de `MsgSignData { signer, data }`, exactamente como en
  [Sign In With QoreChain v1](/qoresign/spec/siwq-v1#classical-part) (digest
  SHA-256 para cuentas `secp256k1`, KECCAK-256 para `eth_secp256k1`; `r || s`
  de 64 bytes, low-S).
- **Parte post-cuántica:**

```
pq.signature = ML-DSA-87.Sign(sk, UTF-8("qorechain-msg-v1|" + chain_id + "|") || data, ctx = "")
```

`data` son los bytes en bruto del mensaje. `chain_id` contiene solo letras,
dígitos, `.`, `_` y `-`.

## Separación de dominios {#domain-separation}

Toda firma ML-DSA-87 que hace una cuenta en QoreChain empieza con un dominio
propio, de modo que una firma producida para un fin no pueda reutilizarse como
otra. Una cartera nunca debe firmar bytes en bruto con la clave ML-DSA-87 sin uno
de estos prefijos, ni dejar que un mensaje empiece por un prefijo reservado para
otro uso.

| Prefijo | Uso |
|---|---|
| `qorechain-pqc-hybrid-v2` | sign-bytes de transacción ([Firma híbrida de transacciones v1](/qoresign/spec/hybrid-signing-v1#sign-bytes)) |
| `qorechain-pqc-pop-v1\|` | prueba de posesión al registrar la clave |
| `qorechain:pqc:recovery:v1` | recuperación de la cuenta |
| `qorechain-svm-auth-v2` | autorización del carril SVM |
| `qorechain-siwq-v1\|` | Sign In With QoreChain ([Sign In With QoreChain v1](/qoresign/spec/siwq-v1)) |
| `qorechain-msg-v1\|` | esta especificación |

## Verificación {#verification}

1. La clave pública clásica deriva a `signer` bajo `keyType`, y la firma ADR-36
   se verifica.
2. La firma ML-DSA-87 se verifica con la clave **registrada en la cadena** para
   `signer` (`/qorechain/pqc/v1/account/{address}`), sobre los bytes anteriores
   con el chain id esperado.

## Vectores de prueba {#test-vectors}

`vectors/qoresign-v1.json`, campo `message`. Consulta
[Vectores de prueba](/qoresign/vectors).
