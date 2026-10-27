---
slug: /qoresign/vectors
title: Vectores de prueba de QoreSign
sidebar_label: Vectores de prueba
sidebar_position: 5
---

# Vectores de prueba

[`qoresign-v1.json`](https://github.com/qorechain/qoresign/blob/main/vectors/qoresign-v1.json)
se genera a partir de la implementación en TypeScript (`pnpm build && pnpm vectors`)
y lo comprueban las suites de pruebas de TypeScript, Rust, Go, Swift y Kotlin.
Un cambio en el archivo es un cambio en el formato de red: añade un archivo
nuevo con una versión nueva en lugar de editar este.

Todas las claves se derivan del mnemónico de prueba público de BIP-39
(`abandon ... about`). Nunca envíes fondos a estas cuentas.

## Campos {#fields}

| Campo | Contenido |
|---|---|
| `accounts` | claves clásicas y direcciones de las cuentas `secp256k1` (`m/44'/118'/0'/0/0`) y `eth_secp256k1` (`m/44'/60'/0'/0/0`) |
| `canonical` | claves públicas ML-DSA-87 canónicas por dirección ([derivación de claves](/qoresign/spec/hd-derivation-draft#canonical-derivation)) |
| `hd`, `hdRejected` | derivación jerárquica en borrador: claves públicas por ruta y rutas que deben rechazarse ([derivación de claves](/qoresign/spec/hd-derivation-draft#hierarchical-derivation)) |
| `hybridTx` | un `TxBody` y un `AuthInfo`, número de cuenta y chain id, con los sign-bytes esperados, la firma ML-DSA-87, el cuerpo final, la firma secp256k1 y el `TxRaw` para los sign-bytes `v2` y `v1` ([firma híbrida](/qoresign/spec/hybrid-signing-v1)) |
| `proofOfPossession` | mensaje y firma de prueba de posesión ([registro](/qoresign/spec/hybrid-signing-v1#registration)) |
| `registerMessage` | `MsgRegisterPQCKeyV2` codificado |
| `message` | firma de mensajes arbitrarios: datos, sign-bytes ADR-36 y ML-DSA-87, firma ([firma de mensajes](/qoresign/spec/message-signing-v1)) |
| `siwq` | campos del inicio de sesión, mensaje renderizado, sign-bytes ADR-36 y ML-DSA-87, firma y un instante en el que se verifica ([Sign In With QoreChain](/qoresign/spec/siwq-v1)) |

## Codificación {#encoding}

Todas las cadenas de bytes están en hexadecimal en minúsculas. Las firmas
ML-DSA-87 son deterministas (FIPS 204, `rnd` = 32 bytes cero); las firmas
secp256k1 usan RFC 6979 y low-S.
