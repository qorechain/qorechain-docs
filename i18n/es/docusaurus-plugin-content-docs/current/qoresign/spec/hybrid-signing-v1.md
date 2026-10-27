---
slug: /qoresign/spec/hybrid-signing-v1
title: Firma híbrida de transacciones v1
sidebar_label: Firma híbrida v1
sidebar_position: 1
---

# Firma híbrida de transacciones en QoreChain, versión 1

Estado: estable. Se aplica al carril nativo (Cosmos SDK) de `qorechain-vladi`
(mainnet) y `qorechain-diana` (testnet). Fuente:
[`spec/hybrid-signing-v1.md`](https://github.com/qorechain/qoresign/blob/main/spec/hybrid-signing-v1.md).

## Resumen {#summary}

Una transacción híbrida es un `TxRaw` ordinario de Cosmos SDK firmado dos veces
por la misma cuenta:

1. una firma ML-DSA-87 (FIPS 204), transportada dentro del cuerpo de la
   transacción como la opción de extensión
   `/qorechain.pqc.v1.PQCHybridSignature`;
2. una firma secp256k1 `SIGN_MODE_DIRECT` sobre el cuerpo final, en
   `TxRaw.signatures`.

La red verifica ambas. En el carril nativo la red exige por defecto la firma
ML-DSA-87 (`HybridSignatureMode = Required`, un parámetro de toda la cadena);
salvo un pequeño conjunto de mensajes exentos, como los que registran o mantienen
la clave ML-DSA-87 de la cuenta, una transacción sin ella es rechazada.

## Claves {#keys}

| Clave | Algoritmo | Tamaño |
|---|---|---|
| Clásica | secp256k1 (cuentas `secp256k1`: dirección = RIPEMD160(SHA256(clave comprimida)); cuentas `eth_secp256k1`: dirección = últimos 20 bytes de KECCAK256(clave sin comprimir)) | clave pública comprimida de 33 bytes |
| Post-cuántica | ML-DSA-87, id de algoritmo `1` | clave pública 2592 bytes, firma 4627 bytes |

La clave pública ML-DSA-87 debe registrarse para la cuenta con
`MsgRegisterPQCKeyV2` antes de que las transacciones híbridas se verifiquen
(consulta [Registro](#registration)). En cambio, una transacción puede incrustar
la clave pública en la extensión (campo 3) para registrarla en el primer uso.

## La extensión {#extension}

```protobuf
package qorechain.pqc.v1;

message PQCHybridSignature {
  uint32 algorithm_id   = 1; // 1 = ML-DSA-87
  bytes  pqc_signature  = 2; // 4627 bytes
  bytes  pqc_public_key = 3; // optional, 2592 bytes
}
```

Se añade a `TxBody.extension_options` (campo 1023) como `google.protobuf.Any` con
`type_url = "/qorechain.pqc.v1.PQCHybridSignature"` y la codificación protobuf
como `value`. Un cuerpo debe llevar exactamente una extensión de este tipo.

## Sign-bytes {#sign-bytes}

Sea `B0` la codificación protobuf canónica del `TxBody` **sin** la extensión PQC
(se conservan, en orden, todos los demás campos y extensiones) y `A` los bytes
de `AuthInfo` exactamente como se difunden. `BE32`/`BE64` son longitudes
enteras sin signo en big-endian.

```
v1 = BE32(len(B0)) || B0 || BE32(len(A)) || A
v2 = "qorechain-pqc-hybrid-v2" || BE64(len(chain_id)) || chain_id || v1
```

Una red verifica exactamente una forma a una altura dada. Ambas redes públicas
verifican `v2` desde sus actualizaciones `v3.1.98` / `v3.2.0` (mainnet: `v3.2.0`
en la altura 2,981,742); cualquier otra red verifica `v2` desde el génesis. `v1`
solo hace falta para reproducir firmas hechas antes de esas alturas. Un cliente
puede preguntar a un nodo qué forma verifica leyendo
`/cosmos/upgrade/v1beta1/applied_plan/{v3.1.98|v3.2.0}`.

La firma ML-DSA-87 es `ML-DSA.Sign(sk, signBytes, ctx = "")`. La red acepta
tanto la variante determinista como la hedged; QoreSign firma de forma
determinista por defecto (FIPS 204, `rnd` = 32 bytes cero) para que las firmas
sean reproducibles frente a los vectores publicados.

## Orden de las operaciones {#order-of-operations}

1. Codifica `B0` y `A` (la comisión, el límite de gas y la información del
   firmante quedan fijados en este punto).
2. Calcula los sign-bytes y la firma ML-DSA-87.
3. Añade la extensión a `B0`, en el orden canónico de campos (después de las
   `extension_options` existentes, antes de `non_critical_extension_options`),
   lo que da el cuerpo final `B`.
4. Firma `SignDoc { body_bytes = B, auth_info_bytes = A, chain_id, account_number }`
   con secp256k1: SHA-256 para cuentas `secp256k1`, KECCAK-256 para cuentas
   `eth_secp256k1`; `r || s` de 64 bytes, low-S.
5. Difunde `TxRaw { B, A, [classical signature] }`.

La firma clásica cubre la extensión; la firma ML-DSA-87 cubre todo lo demás del
cuerpo y de la información de autenticación, incluida la comisión. Ninguna de las
dos firmas se firma a sí misma.

## Registro {#registration}

`MsgRegisterPQCKeyV2` (type URL `/qorechain.pqc.v1.MsgRegisterPQCKeyV2`):

| Campo | Número | Valor |
|---|---|---|
| `sender` | 1 | la cuenta `qor1` |
| `public_key` | 2 | clave pública ML-DSA-87 |
| `algorithm_id` | 3 | `1` |
| `ecdsa_pubkey` | 4 | la clave secp256k1 comprimida de 33 bytes de la cuenta; debe derivar a `sender` |
| `key_type` | 5 | `hybrid` |
| `proof_of_possession` | 6 | firma ML-DSA-87 sobre el mensaje siguiente |

```
"qorechain-pqc-pop-v1|" + chain_id + "|" + algorithm_id + "|" + sender + "|" + lowercase_hex(public_key)
```

La propia transacción de registro se firma solo con la clave clásica. Se rechaza
una clave pública cuya parte `t1` (bytes 32 en adelante) sea toda cero, porque
sus firmas pueden falsificarse.

## Otros carriles {#other-lanes}

- Carril EVM: las transacciones de Ethereum no tienen campo para una extensión,
  por lo que no llevan firma ML-DSA-87. Una cuenta con una clave ML-DSA-87
  registrada puede abrir desde el carril nativo una ventana de autorización EVM
  acotada (altura de expiración, máximo de transacciones, valor máximo).
  Consulta [Carteras EVM: modo quantum-ready](/qoresign/guides/evm-quantum-ready).
- Carril SVM: aún no está abierto en la red.

## Vectores de prueba {#test-vectors}

`vectors/qoresign-v1.json`, campo `hybridTx`, da un cuerpo, la información de
autenticación y el número de cuenta con los sign-bytes esperados, las firmas, el
cuerpo final y el `TxRaw` para ambas versiones. Consulta
[Vectores de prueba](/qoresign/vectors).
