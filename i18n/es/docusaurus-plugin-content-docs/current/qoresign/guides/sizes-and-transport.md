---
slug: /qoresign/guides/sizes-and-transport
title: Tamaños y transporte
sidebar_label: Tamaños y transporte
sidebar_position: 5
---

# Tamaños y transporte

| Elemento | Bytes | Fuente |
|---|---|---|
| Clave pública ML-DSA-87 | 2592 | FIPS 204, Table 2 |
| Clave secreta ML-DSA-87 | 4896 | FIPS 204, Table 2 |
| Firma ML-DSA-87 | 4627 | FIPS 204, Table 2 |
| Semilla ML-DSA-87 | 32 | FIPS 204 |
| Clave pública comprimida secp256k1 | 33 | SEC 1 |
| Firma secp256k1 (r, s) | 64 | |
| Extensión PQC en un cuerpo | unos 4640 (firma más el encuadre protobuf; más 2595 cuando se incrusta la clave pública) | `qorechain.pqc.v1.PQCHybridSignature` |

## Consecuencias para las carteras {#consequences}

- Una transacción híbrida ocupa unos 4,7 KB más que una clásica. El gas y las
  comisiones escalan con el tamaño de la transacción; simula antes de firmar
  (`simulateTx`) y usa el límite de gas sugerido.
- Un único código QR estático contiene como máximo 2953 bytes (versión 40,
  binario, corrección de errores baja), por lo que una firma o una clave pública
  ML-DSA-87 no cabe en uno. Los firmantes aislados de la red (air-gapped)
  necesitan codificaciones en varias partes (QR animado o con códigos fountain).
- Guarda la semilla de 32 bytes, no la clave secreta de 4896 bytes, cuando
  necesites persistir una clave ML-DSA-87; `pqKeyFromSeed` recrea el par de
  claves.

El diseño de la extensión está definido en
[Firma híbrida de transacciones v1](/qoresign/spec/hybrid-signing-v1#extension).
