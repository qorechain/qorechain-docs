---
slug: /qoresign/overview
title: Descripción general de QoreSign
sidebar_label: Descripción general
sidebar_position: 1
---

# QoreSign

QoreSign es la firma híbrida secp256k1 + ML-DSA-87 (FIPS 204) para carteras y
backends en QoreChain.

QoreSign permite que una cartera distinta de la propia de QoreChain derive la
clave ML-DSA-87 de una cuenta, firme transacciones del carril nativo con ambas
claves, verifique firmas híbridas de forma local, simule una transacción antes
de firmarla e implemente Sign In With QoreChain. Es una capa delgada sobre los
bindings de [`qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) y no
añade primitivas criptográficas propias.

La versión actual es la **0.1.0**. El código fuente, los ejemplos y los vectores
de prueba están en el repositorio
[qorechain/qoresign](https://github.com/qorechain/qoresign).

## Qué hace QoreSign en cada carril {#lanes}

| Carril | Qué hace QoreSign hoy |
|---|---|
| **Nativo** (Cosmos SDK) | Firma y verificación híbridas. La red exige por defecto la firma ML-DSA-87. |
| **EVM** | Solo modo quantum-ready: la cuenta registra una clave ML-DSA-87 y abre desde el carril nativo una ventana de autorización acotada. Las transacciones de Ethereum en sí no llevan ninguna firma ML-DSA-87. |
| **SVM** | Aún no está abierto en la red (`LANE_NOT_AVAILABLE`). |

La firma híbrida en EVM requiere antes soporte PQC por carril en la red.
Consulta [Carteras EVM: modo quantum-ready](/qoresign/guides/evm-quantum-ready).

## Paquetes {#packages}

| Lenguaje | Paquete | Instalación |
|---|---|---|
| TypeScript | [`@qorechain/qoresign`](https://www.npmjs.com/package/@qorechain/qoresign) | `npm install @qorechain/qoresign` |
| Rust | [`qorechain-qoresign`](https://crates.io/crates/qorechain-qoresign) | `cargo add qorechain-qoresign` |
| Go | [`github.com/qorechain/qoresign/go`](https://pkg.go.dev/github.com/qorechain/qoresign/go) | `go get github.com/qorechain/qoresign/go` |
| Swift | [`QoreSign`](https://github.com/qorechain/qoresign) (Swift Package, iOS 16+, macOS 13+) | `.package(url: "https://github.com/qorechain/qoresign", from: "0.1.0")` |
| Kotlin / JVM | [`io.github.qorechain:qoresign`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) | `implementation("io.github.qorechain:qoresign:0.1.0")` |

Las cinco implementaciones se comprueban a sí mismas con los mismos
[vectores de prueba](/qoresign/vectors).

## Ejemplo {#example}

```ts
import {
  addressFromPublicKey,
  deriveCanonicalPqKey,
  deriveClassicalKey,
  signHybrid,
  verifyHybridTx,
} from "@qorechain/qoresign";

const classical = deriveClassicalKey({ mnemonic });                 // m/44'/118'/0'/0/0
const address = addressFromPublicKey(classical.publicKey, "secp256k1").bech32;
const pqKey = deriveCanonicalPqKey({ mnemonic, address });         // the key QoreChain wallets register

// bodyBytes / authInfoBytes / accountNumber come from the dApp's SignDoc
const signed = signHybrid({ chainId: "qorechain-vladi", accountNumber, bodyBytes, authInfoBytes, classicalKey: classical, pqKey });

verifyHybridTx({
  txBytes: signed.txBytes,
  chainId: "qorechain-vladi",
  accountNumber,
  classicalPublicKey: classical.publicKey,
  pqPublicKey: pqKey.publicKey,
}); // { valid: true, classical: true, pq: { valid: true, signBytesVersion: "v2" } }
```

Los helpers de red (estado de la clave, simulación con cambios de saldo,
difusión, verificación del inicio de sesión contra la cadena) están en
`@qorechain/qoresign/network`.

## Documentación {#documentation}

- [Inicio rápido](/qoresign/quickstart): deriva claves, firma y verifica una
  transacción híbrida en pocos minutos.
- Guías
  - [Añadir firma híbrida a una cartera compatible con Keplr](/qoresign/guides/keplr-compatible-wallets)
  - [Sign In With QoreChain: verificación en el servidor](/qoresign/guides/sign-in)
  - [Carteras EVM: modo quantum-ready](/qoresign/guides/evm-quantum-ready)
  - [Derivación de claves: claves canónicas y el borrador HD](/qoresign/guides/key-derivation)
  - [Tamaños y transporte](/qoresign/guides/sizes-and-transport)
- Especificaciones
  - [Firma híbrida de transacciones v1](/qoresign/spec/hybrid-signing-v1)
  - [Sign In With QoreChain v1](/qoresign/spec/siwq-v1)
  - [Firma de mensajes v1](/qoresign/spec/message-signing-v1)
  - [Derivación de claves ML-DSA-87](/qoresign/spec/hd-derivation-draft)
- [Vectores de prueba](/qoresign/vectors)
- [Ejemplos](https://github.com/qorechain/qoresign/tree/main/examples)

Referencia de la API: en un clon del repositorio, ejecuta
`pnpm -C packages/ts docs` (TypeScript), `cargo doc -p qorechain-qoresign`
(Rust) o `go doc github.com/qorechain/qoresign/go` (Go). Los bindings de Swift
y Kotlin reflejan la API de Rust; consulta los README de
[Swift](https://github.com/qorechain/qoresign/tree/main/swift) y
[Kotlin](https://github.com/qorechain/qoresign/tree/main/kotlin).

## Alcance {#scope}

QoreSign firma de forma local. No custodia claves por ti, no hace firma por
umbral ni MPC, y no firma en carteras de hardware. Las implementaciones de
ML-DSA-87 y secp256k1 provienen de `qorechain-pqc` (construido sobre
`@noble/post-quantum`, `fips204` y Cloudflare CIRCL) y de `@noble/curves`,
`k256` y `decred/secp256k1`.

## Versionado {#versioning}

QoreSign es pre-1.0: las versiones menores pueden cambiar la API, y cada cambio
incompatible figura en el
[registro de cambios](https://github.com/qorechain/qoresign/blob/main/CHANGELOG.md).
Los formatos de red se versionan por separado (las especificaciones `v1` y
`vectors/qoresign-v1.json`) y no cambian dentro de una versión.

## Contribuciones y seguridad {#contributing}

Consulta
[CONTRIBUTING.md](https://github.com/qorechain/qoresign/blob/main/CONTRIBUTING.md).
Comunica las vulnerabilidades de forma privada, como se describe en
[SECURITY.md](https://github.com/qorechain/qoresign/blob/main/SECURITY.md).

## Licencia {#license}

[Apache-2.0](https://github.com/qorechain/qoresign/blob/main/LICENSE). Copyright
2026 QoreChain Association.
