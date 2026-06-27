---
slug: /developer-guide/post-quantum-signing
title: Firma poscuántica
sidebar_label: Firma poscuántica
sidebar_position: 8
---

# Firma poscuántica

`qorechain-pqc` es la biblioteca de criptografía poscuántica de código abierto y **basada únicamente en estándares** que respalda QoreChain. Ofrece a las carteras, integradores y herramientas exactamente las primitivas que usa la cadena —en seis lenguajes, con una API consistente— y con **compatibilidad de bytes demostrada** frente a un conjunto compartido de vectores de prueba multilenguaje.

La biblioteca envuelve implementaciones auditadas de los **estándares finales del NIST**. **No** inventa un esquema personalizado: una variante no estándar es precisamente lo que rompe la interoperabilidad (una firma producida en un lugar no se verificaría en otro). Cada binding se valida frente a los mismos vectores, de modo que una firma ML-DSA producida en un lenguaje se verifica en todos los demás, los secretos compartidos de ML-KEM coinciden en los seis y los digests SHAKE-256 son idénticos.

* **Repositorio:** [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc)
* **Licencia:** Apache-2.0

## Primitivas

| Primitiva | Estándar | Función | Niveles (por defecto en **negrita**) |
| --- | --- | --- | --- |
| **ML-DSA** | FIPS-204 | firmas digitales | 44 · 65 · **87** |
| **ML-KEM** | FIPS-203 | encapsulado de claves | 512 · 768 · **1024** |
| **SHAKE-256** | FIPS-202 | hash de salida extensible | — |

Estas son las mismas primitivas que QoreChain ejecuta a nivel de protocolo: firmas **ML-DSA-87 (Dilithium-5)**, encapsulado de claves **ML-KEM-1024** y **SHAKE-256** como hash de aplicación por defecto. Consulta [Seguridad poscuántica](/architecture/post-quantum-security) para ver cómo las usa la cadena.

### Tamaños (bytes)

Elige el nivel de seguridad según tu presupuesto de tamaño/seguridad.

| Esquema | Seguridad | Clave pública | Firma / Texto cifrado |
| --- | --- | --- | --- |
| ML-DSA-44 | L2 | 1312 | 2420 |
| ML-DSA-65 | L3 | 1952 | 3309 |
| **ML-DSA-87** | L5 | 2592 | 4627 |
| ML-KEM-512 | L1 | 800 | 768 |
| ML-KEM-768 | L3 | 1184 | 1088 |
| **ML-KEM-1024** | L5 | 1568 | 1568 |

> No puedes hacer más pequeño un estándar del NIST y seguir siendo estándar. ML-DSA-87 tiene tamaños fijos de clave/firma y bytes fijos: "optimizarlo" produce una variante no estándar que ninguna otra implementación puede verificar. Para reducir la huella en cadena, usa las palancas siguientes en lugar de alterar el esquema.

## Lenguajes y paquetes

Cada lenguaje expone la misma API, respaldada cada uno por una implementación auditada distinta. Esto es lo que garantiza la compatibilidad de bytes: backends independientes coinciden en el estándar.

| Lenguaje | Paquete | Instalación | Respaldado por |
| --- | --- | --- | --- |
| JavaScript / TypeScript | `@qorechain/pqc` (npm) | `npm i @qorechain/pqc` | [@noble/post-quantum](https://github.com/paulmillr/noble-post-quantum) |
| Rust | `qorechain-pqc` (crates.io) | `cargo add qorechain-pqc` | `fips204` · `fips203` · `sha3` |
| Python | `qorechain-pqc` (PyPI) | `pip install qorechain-pqc` (import `qorpqc`) | [liboqs-python](https://github.com/open-quantum-safe/liboqs-python) |
| Go | `github.com/qorechain/qorechain-pqc/go` | `go get github.com/qorechain/qorechain-pqc/go` | [Cloudflare CIRCL](https://github.com/cloudflare/circl) |
| C | `c/` (biblioteca estática + cabecera) | compilar desde el [repo](https://github.com/qorechain/qorechain-pqc) | [liboqs](https://github.com/open-quantum-safe/liboqs) + OpenSSL |
| Java | `io.github.qorechain:qorechain-pqc` (Maven Central) | `io.github.qorechain:qorechain-pqc:0.1.0` | [Bouncy Castle](https://www.bouncycastle.org/) |

:::info Disponibilidad
Los bindings de JavaScript, Rust, Python, Go y Java están todos **publicados** en la versión **0.1.0**: instálalos directamente desde npm, crates.io, PyPI, el proxy de módulos de Go y Maven Central con los comandos anteriores. La distribución de Python se instala como `qorechain-pqc` pero **se importa como `qorpqc`**. El paquete de **Java** está en Maven Central como `io.github.qorechain:qorechain-pqc:0.1.0` (backend Bouncy Castle). El binding de **C** es una biblioteca estática + cabecera que compilas desde [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc).
:::

## API consistente

Cada lenguaje proporciona la misma superficie:

```text
keygen()                              -> (publicKey, secretKey)
sign(secretKey, message)              -> signature
verify(publicKey, message, signature) -> bool

kem.keygen()                          -> (publicKey, secretKey)
kem.encapsulate(publicKey)            -> (cipherText, sharedSecret)
kem.decapsulate(secretKey, cipherText)-> sharedSecret

shake256(data, outLen=32)             -> digest
```

### Inicio rápido (JavaScript / TypeScript)

```js
import { mldsa, mlkem, shake256, pubkeyHash } from '@qorechain/pqc';

// ML-DSA-87 signatures
const { publicKey, secretKey } = mldsa.keygen();
const sig = mldsa.sign(secretKey, message);
mldsa.verify(publicKey, message, sig); // true

// ML-KEM-1024 key encapsulation
const { publicKey: ek, secretKey: dk } = mlkem.keygen();
const { cipherText, sharedSecret } = mlkem.encapsulate(ek);
mlkem.decapsulate(dk, cipherText); // === sharedSecret

// SHAKE-256 + blockchain helpers
shake256(data, 32);        // 32-byte digest
pubkeyHash(publicKey, 20); // pay-to-pubkey-hash
```

Hay exportaciones específicas por nivel disponibles cuando el valor por defecto no es el que quieres: `mldsa44/65/87` y `mlkem512/768/1024` (`mldsa` / `mlkem` son los valores por defecto L5).

Los bindings de **Rust, Go, C, Python y Java** reflejan esto exactamente. Por ejemplo:

```rust
// Rust
use qorechain_pqc::mldsa::default as mldsa;
let (pk, sk) = mldsa::keygen()?;
let sig = mldsa::sign(&sk, msg)?;
assert!(mldsa::verify(&pk, msg, &sig));
```

```go
// Go
pk, sk, _ := pqc.MLDSA.Keygen()
sig, _ := pqc.MLDSA.Sign(sk, msg)
pqc.MLDSA.Verify(pk, msg, sig) // true
```

## Utilidades de blockchain

Más allá de las primitivas en bruto, la biblioteca expone dos utilidades que los integradores necesitan para interactuar con las cuentas y transacciones de QoreChain.

### `pubkeyHash(pk, len=20)`

Una utilidad de registro **pay-to-pubkey-hash**. Produce un hash SHAKE-256 corto (de 20 a 32 bytes) de una clave pública. El patrón: almacenar solo el `pubkeyHash` en el estado de la cuenta y exigir la clave pública completa en la transacción. El estado de la cuenta se mantiene diminuto independientemente de la clave de 1 a 2,5 KB.

### `hybridSignBytes(bodyWithoutPqcExt, authInfo)`

El **encuadre de los sign-bytes de extensión híbrida** de QoreChain, compatible con carteras. Produce exactamente los bytes que deben firmarse con ML-DSA-87 (Dilithium-5) para formar la mitad PQC de una transacción híbrida.

Esta es la pieza que usan las carteras e integradores para producir la **firma híbrida obligatoria** en la ruta de transacciones de cosmos. A partir de la versión actual de la cadena, las firmas híbridas son **obligatorias por defecto** (`hybrid_signature_mode = required`, `allow_classical_fallback = false`): cada transacción de la ruta cosmos debe llevar una firma Dilithium-5 junto con su firma clásica secp256k1. Consulta [Seguridad poscuántica](/architecture/post-quantum-security) para ver el modelo de cumplimiento.

La firma clásica secp256k1 se calcula sobre los sign bytes estándar (que **excluyen** la extensión PQC), y la firma ML-DSA-87 se calcula y se adjunta como la extensión `PQCHybridSignature`. Como los sign bytes clásicos excluyen la extensión, la firma clásica sigue siendo válida tanto si un verificador entiende la parte PQC como si no.

Hay tres maneras de producir esta firma híbrida:

* **La CLI** — `qorechaind tx pqc cosign` adjunta la cofirma Dilithium-5 a una transacción (tras `qorechaind tx pqc gen-key`). Consulta [Comandos de transacción](/cli-reference/transaction-commands).
* **El SDK de QoreChain** — `buildHybridTx` (con `includePqcPublicKey`) hace el equivalente en TypeScript/Python/Go/Rust. Consulta [Cuentas y firma PQC del SDK](/sdk/concepts/accounts-pqc).
* **`qorechain-pqc` directamente** — usa `hybridSignBytes` para encuadrar los sign bytes y `mldsa.sign` para producir la firma Dilithium-5, cuando estés construyendo herramientas fuera del SDK en uno de los seis lenguajes admitidos.

## Optimizar la huella en cadena

Las claves y firmas ML-DSA son grandes para los estándares clásicos. Como los bytes de un estándar son fijos, la forma de mantener pequeña la huella en cadena es usar estas tres palancas, ninguna de las cuales altera el estándar:

1. **Elige el nivel de seguridad de forma deliberada.** Las firmas ML-DSA-65 (L3) son ~28% más pequeñas que las ML-DSA-87 (L5) y siguen siendo muy fuertes; los textos cifrados ML-KEM-768 son más pequeños que los de 1024. Elige según el caso de uso.
2. **Pay-to-pubkey-hash.** Almacena solo `pubkeyHash(pk)` (de 20 a 32 bytes de SHAKE-256) en el estado de la cuenta y exige la clave pública completa en la transacción. El estado de la cuenta se mantiene diminuto independientemente del tamaño de la clave.
3. **Firmas de verificar y descartar.** Una firma debe vivir en la transacción (datos del bloque), pero nunca debería escribirse en el árbol de estado persistente.

> **¿Por qué no Falcon?** FN-DSA (Falcon) daría firmas más pequeñas, pero está **excluido** intencionadamente: FN-DSA es un *borrador* de FIPS-206 (no final), y una biblioteca basada únicamente en estándares solo distribuye estándares finalizados. Puede revisarse una vez que FIPS-206 esté finalizado.

## Relacionado

* [Seguridad poscuántica](/architecture/post-quantum-security) — cómo usa la cadena estas primitivas y cómo aplica las firmas híbridas.
* [Comandos de transacción](/cli-reference/transaction-commands) — el flujo de CLI `tx pqc gen-key` / `tx pqc cosign`.
* [Cuentas y firma PQC del SDK](/sdk/concepts/accounts-pqc) — claves y firma híbrida desde el SDK de QoreChain.
* [Configuración de la cartera](/getting-started/wallet-setup) — crea y gestiona cuentas respaldadas por PQC.
