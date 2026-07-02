---
slug: /developer-guide/post-quantum-signing
title: Firma poscuántica
sidebar_label: Firma poscuántica
sidebar_position: 8
---

# Firma poscuántica

`qorechain-pqc` es la biblioteca de criptografía poscuántica de código abierto y **basada únicamente en estándares** que respalda QoreChain. Ofrece a las carteras, integradores y herramientas exactamente las primitivas que usa la cadena — en seis lenguajes, con una API consistente y con **compatibilidad a nivel de bytes demostrada** frente a un conjunto compartido de vectores de prueba multilenguaje.

La biblioteca envuelve implementaciones auditadas de los **estándares finales del NIST**. **No** inventa un esquema propio: una variante no estándar es exactamente lo que rompe la interoperabilidad (una firma producida en un lugar no se verificaría en otro). Cada binding se valida contra los mismos vectores, de modo que una firma ML-DSA producida en un lenguaje se verifica en todos los demás, los secretos compartidos de ML-KEM coinciden en los seis, y los digests de SHAKE-256 son idénticos.

* **Repositorio:** [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc)
* **Licencia:** Apache-2.0

## Primitivas

| Primitiva | Estándar | Rol | Niveles (predeterminado en **negrita**) |
| --- | --- | --- | --- |
| **ML-DSA** | FIPS-204 | firmas digitales | 44 · 65 · **87** |
| **ML-KEM** | FIPS-203 | encapsulación de claves | 512 · 768 · **1024** |
| **SHAKE-256** | FIPS-202 | hash de salida extensible | — |

Estas son las mismas primitivas que QoreChain ejecuta a nivel de protocolo: firmas **ML-DSA-87 (Dilithium-5)**, encapsulación de claves **ML-KEM-1024** y **SHAKE-256** como hash de aplicación predeterminado. Consulta [Seguridad poscuántica](/architecture/post-quantum-security) para ver cómo la cadena las utiliza.

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

> No se puede hacer más pequeño un estándar del NIST y que siga siendo estándar. ML-DSA-87 tiene tamaños fijos de clave/firma y bytes fijos — "optimizarlo" produce una variante no estándar que ninguna otra implementación puede verificar. Para reducir la huella on-chain, usa las palancas descritas más abajo en lugar de alterar el esquema.

## Lenguajes y paquetes

Cada lenguaje expone la misma API, cada uno respaldado por una implementación auditada distinta. Esto es lo que garantiza la compatibilidad a nivel de bytes — backends independientes coinciden sobre el estándar.

| Lenguaje | Paquete | Instalación | Respaldado por |
| --- | --- | --- | --- |
| JavaScript / TypeScript | `@qorechain/pqc` (npm) | `npm i @qorechain/pqc` | [@noble/post-quantum](https://github.com/paulmillr/noble-post-quantum) |
| Rust | `qorechain-pqc` (crates.io) | `cargo add qorechain-pqc` | `fips204` · `fips203` · `sha3` |
| Python | `qorechain-pqc` (PyPI) | `pip install qorechain-pqc` (se importa como `qorpqc`) | [liboqs-python](https://github.com/open-quantum-safe/liboqs-python) |
| Go | `github.com/qorechain/qorechain-pqc/go` | `go get github.com/qorechain/qorechain-pqc/go` | [Cloudflare CIRCL](https://github.com/cloudflare/circl) |
| C | `c/` (biblioteca estática + header) | compílala desde el [repositorio](https://github.com/qorechain/qorechain-pqc) | [liboqs](https://github.com/open-quantum-safe/liboqs) + OpenSSL |
| Java | `io.github.qorechain:qorechain-pqc` (Maven Central) | `io.github.qorechain:qorechain-pqc:0.1.1` | [Bouncy Castle](https://www.bouncycastle.org/) |

:::info Disponibilidad
Los bindings de JavaScript, Rust, Python, Go y Java están todos **publicados** en la versión **0.1.1** — instálalos directamente desde npm, crates.io, PyPI, el proxy de módulos de Go y Maven Central con los comandos anteriores. La distribución de Python se instala como `qorechain-pqc` pero **se importa como `qorpqc`**. El paquete de **Java** está en Maven Central como `io.github.qorechain:qorechain-pqc:0.1.1` (backend Bouncy Castle). El binding de **C** es una biblioteca estática + header que compilas desde [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc).
:::

## Firma determinista (crítica para el consenso) {#deterministic-signing}

A partir de la versión **0.1.1**, `sign()` produce la variante **determinista** de ML-DSA (FIPS-204 §3.4, donde la aleatoriedad de firma son 32 bytes en cero) en **los seis bindings** — y esta es la única variante que la cadena acepta. El verificador de transacciones de QoreChain **rechaza las firmas ML-DSA hedged (aleatorizadas)**, por lo que una firma hedged falla on-chain aunque se verifique criptográficamente.

Datos clave:

* **No cambies el valor predeterminado.** La firma determinista es crítica para el consenso; cada binding la documenta como tal.
* La salida determinista es **idéntica byte a byte en los seis bindings** para la misma clave y el mismo mensaje — garantizado por los vectores de prueba compartidos entre lenguajes.
* La firma hedged sigue disponible como una **opción explícita** en cada binding (p. ej. `{hedged: true}` en JavaScript, `sign_hedged` en Rust, `mldsaSignHedged` en Java, `sign(..., hedged=True)` en Python) para casos de uso fuera de la cadena — las firmas hedged **no son aceptadas por la cadena**.
* La versión 0.1.0 del binding de JavaScript firmaba en modo hedged por defecto — si construiste herramientas de transacciones contra la 0.1.0, **actualiza a la 0.1.1**; las transacciones firmadas con el antiguo valor predeterminado se rechazan on-chain.

## API consistente

Cada lenguaje ofrece la misma superficie:

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

Existen exports específicos por nivel para cuando el predeterminado no es lo que necesitas: `mldsa44/65/87` y `mlkem512/768/1024` (`mldsa` / `mlkem` son los predeterminados de nivel L5).

Los bindings de **Rust, Go, C, Python y Java** replican esto exactamente. Por ejemplo:

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

## Helpers para blockchain

Más allá de las primitivas básicas, la biblioteca expone dos helpers que los integradores necesitan para interactuar con las cuentas y transacciones de QoreChain.

### `pubkeyHash(pk, len=20)`

Un helper de registro **pay-to-pubkey-hash**. Produce un hash SHAKE-256 corto (20–32 bytes) de una clave pública. El patrón: almacenar solo el `pubkeyHash` en el estado de la cuenta y exigir la clave pública completa en la transacción. El estado de la cuenta se mantiene diminuto independientemente de la clave de 1–2.5 KB.

### `hybridSignBytes(bodyWithoutPqcExt, authInfo)`

El framing de **sign-bytes con extensión híbrida** de QoreChain, compatible con carteras. Produce exactamente los bytes que deben firmarse con ML-DSA-87 (Dilithium-5) para formar la mitad PQC de una transacción híbrida.

Esta es la pieza que carteras e integradores usan para producir la **firma híbrida requerida** en la ruta de transacciones cosmos. A partir de la versión actual de la cadena, las firmas híbridas son **requeridas por defecto** (`hybrid_signature_mode = required`, `allow_classical_fallback = false`): toda transacción por la ruta cosmos debe llevar una firma Dilithium-5 junto a su firma clásica secp256k1. Consulta [Seguridad poscuántica](/architecture/post-quantum-security) para conocer el modelo de aplicación.

La firma clásica secp256k1 se calcula sobre los sign bytes estándar (que **excluyen** la extensión PQC), y la firma ML-DSA-87 se calcula y se adjunta como la extensión `PQCHybridSignature`. Dado que los sign bytes clásicos excluyen la extensión, la firma clásica sigue siendo válida entienda o no un verificador la parte PQC.

Hay tres formas de producir esta firma híbrida:

* **La CLI** — `qorechaind tx pqc cosign` adjunta la cofirma Dilithium-5 a una transacción (después de `qorechaind tx pqc gen-key`). Consulta [Comandos de transacción](/cli-reference/transaction-commands).
* **El SDK de QoreChain** — `buildHybridTx` (con `includePqcPublicKey`) hace el equivalente en TypeScript/Python/Go/Rust. Consulta [Cuentas del SDK y firma PQC](/sdk/concepts/accounts-pqc).
* **`qorechain-pqc` directamente** — usa `hybridSignBytes` para enmarcar los sign bytes y `mldsa.sign` para producir la firma Dilithium-5, cuando construyas herramientas fuera del SDK en uno de los seis lenguajes soportados.

## Optimizar la huella on-chain

Las claves y firmas de ML-DSA son grandes para los estándares clásicos. Como los bytes de un estándar son fijos, la manera de mantener pequeña la huella on-chain es usar estas tres palancas — ninguna de las cuales altera el estándar:

1. **Elige el nivel de seguridad deliberadamente.** Las firmas ML-DSA-65 (L3) son ~28% más pequeñas que las de ML-DSA-87 (L5) y siguen siendo muy sólidas; los textos cifrados de ML-KEM-768 son más pequeños que los de 1024. Elige según el caso de uso.
2. **Pay-to-pubkey-hash.** Almacena solo `pubkeyHash(pk)` (20–32 bytes de SHAKE-256) en el estado de la cuenta y exige la clave pública completa en la transacción. El estado de la cuenta se mantiene diminuto independientemente del tamaño de la clave.
3. **Verificar y descartar las firmas.** Una firma debe vivir en la transacción (datos del bloque) pero nunca debe escribirse en el árbol de estado persistente.

> **¿Por qué no Falcon?** FN-DSA (Falcon) daría firmas más pequeñas, pero está **excluido** intencionadamente: FN-DSA es un *borrador* de FIPS-206 (no final), y una biblioteca basada únicamente en estándares solo incluye estándares finalizados. Podrá reconsiderarse una vez que FIPS-206 sea finalizado.

## Relacionado

* [Seguridad poscuántica](/architecture/post-quantum-security) — cómo la cadena usa estas primitivas y hace cumplir las firmas híbridas.
* [Comandos de transacción](/cli-reference/transaction-commands) — el flujo CLI `tx pqc gen-key` / `tx pqc cosign`.
* [Cuentas del SDK y firma PQC](/sdk/concepts/accounts-pqc) — claves y firma híbrida desde el SDK de QoreChain.
* [Configuración de cartera](/getting-started/wallet-setup) — crea y gestiona cuentas respaldadas por PQC.
