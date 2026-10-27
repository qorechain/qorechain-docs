---
slug: /qoresign/guides/key-derivation
title: Derivación de claves
sidebar_label: Derivación de claves
sidebar_position: 4
---

# Derivación de claves

QoreSign ofrece dos formas de obtener una clave ML-DSA-87 a partir de un
mnemónico BIP-39. Definiciones completas:
[Derivación de claves ML-DSA-87](/qoresign/spec/hd-derivation-draft).

| | `deriveCanonicalPqKey` | `deriveHdPqKey` (borrador) |
|---|---|---|
| Entrada | mnemónico + dirección de la cuenta | mnemónico (o semilla) + ruta endurecida |
| Ligada a la dirección | sí | no |
| Misma clave que las carteras de QoreChain | sí | no |
| Necesita registro en la cadena | solo si aún no está registrada | siempre |
| Estabilidad | estable | puede cambiar antes de ser definitiva |

Usa la [derivación canónica](/qoresign/spec/hd-derivation-draft#canonical-derivation)
a menos que necesites varias claves post-cuánticas por semilla que sean
independientes de las direcciones (el
[borrador jerárquico](/qoresign/spec/hd-derivation-draft#hierarchical-derivation)).

## Forma del mnemónico {#mnemonic-form}

El mnemónico debe estar en forma canónica (palabras en minúsculas, separadas por
un solo espacio). QoreSign rechaza otras grafías en lugar de normalizarlas,
porque la frase forma parte de la entrada de la derivación y una grafía distinta
daría una clave distinta.

## Carteras sin el mnemónico {#without-mnemonic}

Las carteras que no tienen el mnemónico (por ejemplo, con claves guardadas en
hardware) no pueden usar la derivación canónica. Pueden generar una clave
ML-DSA-87 aleatoria con `pqKeyFromSeed(randomBytes(32))` o usar el borrador HD,
y registrar esa clave.
