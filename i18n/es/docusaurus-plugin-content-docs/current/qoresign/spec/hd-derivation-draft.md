---
slug: /qoresign/spec/hd-derivation-draft
title: Derivación de claves ML-DSA-87
sidebar_label: Derivación de claves (borrador HD)
sidebar_position: 4
---

# Derivación de claves ML-DSA-87

Estado: la derivación canónica es estable. La derivación jerárquica es un
**borrador**: las implementaciones pueden cambiar antes de que sea definitiva, y
las claves derivadas con ella deben registrarse en la cadena como cualquier otra
clave. Fuente:
[`spec/hd-derivation-draft.md`](https://github.com/qorechain/qoresign/blob/main/spec/hd-derivation-draft.md).

## Derivación canónica (estable) {#canonical-derivation}

Las carteras de QoreChain y el SDK de QoreChain derivan una clave ML-DSA-87 por
cuenta a partir del mnemónico BIP-39 y de la dirección de la cuenta:

```
seed = SHAKE256( UTF-8( "qorechain:pqc:v1|" + bech32_address + "|" + mnemonic ), 32 bytes )
(pk, sk) = ML-DSA-87.KeyGen_internal(seed)
```

- `bech32_address` es la forma `qor1` de la cuenta (una dirección `0x` se
  convierte primero a los mismos 20 bytes).
- `mnemonic` es la frase en forma canónica: palabras en inglés en minúsculas
  separadas por un solo espacio, sin nada antes ni después. Las implementaciones
  deben rechazar cualquier otra grafía en lugar de normalizarla en silencio,
  porque una cadena distinta da una clave distinta.
- La clave está ligada a la dirección: el mismo mnemónico da una clave distinta
  para cada cuenta.

Una cartera que use esta derivación firma con la clave ya registrada para las
cuentas creadas por las carteras de QoreChain.

## Derivación jerárquica (borrador) {#hierarchical-derivation}

Para carteras que necesitan varias claves post-cuánticas a partir de una semilla
sin ligarlas a una dirección. ML-DSA no tiene derivación pública de claves hijas,
por lo que cada segmento de la ruta es endurecido.

La construcción es SLIP-0010 con su propia cadena de clave maestra:

```
I  = HMAC-SHA512(key = "qorechain-mldsa87-seed", data = seed)
k  = I[0..32],  c = I[32..64]
for each index i (all >= 2^31):
    I = HMAC-SHA512(key = c, data = 0x00 || k || ser32(i))
    k = I[0..32],  c = I[32..64]
(pk, sk) = ML-DSA-87.KeyGen_internal(k)
```

- `seed` es la semilla BIP-39 de 64 bytes (mnemónico más frase de contraseña
  opcional), o cualquier semilla de 16 a 64 bytes.
- La ruta predeterminada es `m/44'/118'/{account}'/0'/0'`.
- Se rechaza una ruta con cualquier segmento no endurecido.

Puntos abiertos antes de que esto sea definitivo: el coin type que se usará en
la ruta, la interacción con la rotación de claves en la cadena
(`MsgRotatePQCKey`) y la alineación con otros ecosistemas que derivan claves
post-cuánticas a partir de una semilla.

## Vectores de prueba {#test-vectors}

`vectors/qoresign-v1.json`, campos `canonical`, `hd` y `hdRejected`. Consulta
[Vectores de prueba](/qoresign/vectors).
