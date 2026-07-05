---
slug: /developer-guide/post-quantum-signing
title: Firma poscuántica
sidebar_label: Firma poscuántica
sidebar_position: 8
---

# Firma poscuántica

`qorechain-pqc` es la biblioteca de criptografía poscuántica de código abierto y **basada exclusivamente en estándares** que hay detrás de QoreChain. Ofrece a wallets, integradores y herramientas exactamente las mismas primitivas que usa la cadena — en seis lenguajes, con una API consistente, **con compatibilidad byte a byte demostrada** frente a una suite compartida de vectores de prueba entre lenguajes.

La biblioteca envuelve implementaciones auditadas de los **estándares finales del NIST**. **No** inventa un esquema propio: una variante no estándar es precisamente lo que rompe la interoperabilidad (una firma producida en un lugar no se verificaría en otro). Cada binding se valida contra los mismos vectores, de modo que una firma ML-DSA producida en un lenguaje se verifica en todos los demás, los secretos compartidos de ML-KEM coinciden en los seis y los digests de SHAKE-256 son idénticos.

* **Repositorio:** [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc)
* **Licencia:** Apache-2.0

## Primitivas

| Primitiva | Estándar | Rol | Niveles (predeterminado en **negrita**) |
| --- | --- | --- | --- |
| **ML-DSA** | FIPS-204 | firmas digitales | 44 · 65 · **87** |
| **ML-KEM** | FIPS-203 | encapsulación de claves | 512 · 768 · **1024** |
| **SHAKE-256** | FIPS-202 | hash de salida extensible | — |

Son las mismas primitivas que QoreChain ejecuta a nivel de protocolo: firmas **ML-DSA-87 (Dilithium-5)**, encapsulación de claves **ML-KEM-1024** y **SHAKE-256** como hash de aplicación predeterminado. Consulta [Seguridad poscuántica](/architecture/post-quantum-security) para ver cómo la cadena las utiliza.

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

> No puedes hacer más pequeño un estándar del NIST y seguir siendo estándar. ML-DSA-87 tiene tamaños de clave/firma fijos y bytes fijos — "optimizarlo" produce una variante no estándar que ninguna otra implementación puede verificar. Para reducir la huella on-chain, usa las palancas que se describen más abajo en lugar de alterar el esquema.

## Lenguajes y paquetes

Cada lenguaje expone la misma API, cada uno respaldado por una implementación auditada distinta. Esto es lo que garantiza la compatibilidad byte a byte — backends independientes que coinciden en el estándar.

| Lenguaje | Paquete | Instalación | Respaldado por |
| --- | --- | --- | --- |
| JavaScript / TypeScript | `@qorechain/pqc` (npm) | `npm i @qorechain/pqc` | [@noble/post-quantum](https://github.com/paulmillr/noble-post-quantum) |
| Rust | `qorechain-pqc` (crates.io) | `cargo add qorechain-pqc` | `fips204` · `fips203` · `sha3` |
| Python | `qorechain-pqc` (PyPI) | `pip install qorechain-pqc` (se importa como `qorpqc`) | [liboqs-python](https://github.com/open-quantum-safe/liboqs-python) |
| Go | `github.com/qorechain/qorechain-pqc/go` | `go get github.com/qorechain/qorechain-pqc/go` | [Cloudflare CIRCL](https://github.com/cloudflare/circl) |
| C | `c/` (biblioteca estática + cabecera) | compílala desde el [repositorio](https://github.com/qorechain/qorechain-pqc) | [liboqs](https://github.com/open-quantum-safe/liboqs) + OpenSSL |
| Java | `io.github.qorechain:qorechain-pqc` (Maven Central) | `io.github.qorechain:qorechain-pqc:0.1.1` | [Bouncy Castle](https://www.bouncycastle.org/) |

:::info Disponibilidad
Los bindings de JavaScript, Rust, Python, Go y Java están todos **publicados** en la versión **0.1.1** — instálalos directamente desde npm, crates.io, PyPI, el proxy de módulos de Go y Maven Central con los comandos anteriores. La distribución de Python se instala como `qorechain-pqc` pero **se importa como `qorpqc`**. El paquete de **Java** está en Maven Central como `io.github.qorechain:qorechain-pqc:0.1.1` (backend Bouncy Castle). El binding de **C** es una biblioteca estática + cabecera que compilas desde [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc).
:::

## Firma determinista (crítica para el consenso) {#deterministic-signing}

A partir de la versión **0.1.1**, `sign()` produce la variante **determinista** de ML-DSA (FIPS-204 §3.4, donde la aleatoriedad de firma son 32 bytes a cero) en **los seis bindings** — y esta es la única variante que la cadena acepta. El verificador de transacciones de QoreChain **rechaza las firmas ML-DSA hedged (aleatorizadas)**, de modo que una firma hedged falla on-chain aunque se verifique criptográficamente.

Datos clave:

* **No cambies el valor predeterminado.** La firma determinista es crítica para el consenso; cada binding la documenta como tal.
* La salida determinista es **idéntica byte a byte en los seis bindings** para la misma clave y el mismo mensaje — garantizado por los vectores de prueba compartidos entre lenguajes.
* La firma hedged sigue disponible como **opción explícita** en cada binding (p. ej. `{hedged: true}` en JavaScript, `sign_hedged` en Rust, `mldsaSignHedged` en Java, `sign(..., hedged=True)` en Python) para casos de uso fuera de la cadena — la cadena **no acepta** firmas hedged.
* La versión 0.1.0 del binding de JavaScript firmaba en modo hedged por defecto — si construiste herramientas de transacciones contra 0.1.0, **actualiza a 0.1.1**; las transacciones firmadas con el valor predeterminado antiguo se rechazan on-chain.

## Derivación determinista de claves y recuperación {#key-derivation}

La derivación estándar del ecosistema vincula la clave ML-DSA-87 a la cuenta, por lo que es **recuperable solo con el mnemónico de la cuenta**:

```
seed = SHAKE-256("qorechain:pqc:v1|" + cosmosAddress + "|" + mnemonic)
(publicKey, secretKey) = mldsa.keygen(seed)
```

Todas las herramientas publicadas (`@qorechain/wallet-adapter`, `@qorechain/sdk`, `@qorechain/chain-bridge` ≥0.1.1) derivan esta misma clave, de modo que un mnemónico produce una única clave sea cual sea la herramienta. Recupera una clave en la CLI (mnemónico por stdin):

```bash
qorechaind tx pqc recover-key mykey qor1youraddress...
# legacy tooling derivation (shake256(mnemonic) only, unbound to the address):
qorechaind tx pqc recover-key mykey qor1youraddress... --derivation bridge
```

## Rotación de claves (mismo algoritmo) {#key-rotation}

A partir de la versión de cadena **v3.1.85**, **`MsgRotatePQCKey`** rota la clave ML-DSA-87 de una cuenta **dentro del mismo algoritmo** — anteriormente el registro era de un solo uso y `MigratePQCKey` solo cruzaba entre algoritmos. Úsalo para migrar una clave con derivación legacy a la derivación canónica vinculada a la dirección, o para retirar una clave comprometida.

La rotación lleva **doble firma**: tanto la clave antigua como la nueva firman el mensaje con separación de dominio `"qorechain-pqc-rotate-v1|chainId|algorithm|account|oldPubHex|newPubHex"`. El replay es estructuralmente imposible — una vez rotada, la clave antigua ya no coincide con la clave registrada, por lo que el mismo mensaje no puede volver a aplicarse. La rotación es una operación **exclusiva de la clave raíz** (nunca delegable a un [authenticator](/developer-guide/account-abstraction#authenticators)), y la propia transacción sigue firmándose en modo híbrido con la clave *antigua*, lo que demuestra la propiedad actual.

CLI de un solo paso (mnemónico por stdin; recupera la clave antigua, deriva o genera la nueva, aplica la doble firma y difunde):

```bash
# migrate a legacy-derived key to the canonical derivation:
qorechaind tx pqc rotate-key --old-derivation bridge --new-derivation adapter \
  --from mykey --chain-id qorechain-vladi -o json -y

# rotate to a brand-new random key (compromise recovery):
qorechaind tx pqc rotate-key --old-derivation adapter --new-random \
  --from mykey --chain-id qorechain-vladi -o json -y
```

En código, `@qorechain/wallet-adapter` (≥0.1.7) y `@qorechain/sdk` (≥0.7.0) exponen el mismo flujo:

```js
import { rotatePqcKeyMsgFromMnemonic } from "@qorechain/wallet-adapter";

// Builds the dual-signed MsgRotatePQCKey migrating shake256(mnemonic) -> canonical:
const msg = await rotatePqcKeyMsgFromMnemonic({
  mnemonic, address: "qor1youraddress...", chainId: "qorechain-vladi",
});
// Sign & broadcast with the account's normal hybrid signer (old key cosigns the envelope).
```

Tras una rotación correcta, la clave nueva firma (código 0) y la clave antigua se rechaza (`pqc` código 21).

## API consistente

Todos los lenguajes ofrecen la misma superficie:

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

Hay exports específicos por nivel disponibles cuando el predeterminado no es lo que necesitas: `mldsa44/65/87` y `mlkem512/768/1024` (`mldsa` / `mlkem` son los predeterminados de nivel L5).

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

## Helpers de blockchain

Más allá de las primitivas en bruto, la biblioteca expone dos helpers que los integradores necesitan para interactuar con las cuentas y transacciones de QoreChain.

### `pubkeyHash(pk, len=20)`

Un helper de registro **pay-to-pubkey-hash**. Produce un hash SHAKE-256 corto (20–32 bytes) de una clave pública. El patrón: almacenar solo el `pubkeyHash` en el estado de la cuenta y exigir la clave pública completa en la transacción. El estado de la cuenta se mantiene mínimo sin importar que la clave ocupe 1–2,5 KB.

### `hybridSignBytes(bodyWithoutPqcExt, authInfo)`

El framing de **sign-bytes con extensión híbrida** compatible con wallets de QoreChain. Produce exactamente los bytes que deben firmarse con ML-DSA-87 (Dilithium-5) para formar la mitad PQC de una transacción híbrida.

Esta es la pieza que wallets e integradores usan para producir la **firma híbrida obligatoria** en la ruta de transacciones cosmos. En la versión actual de la cadena, las firmas híbridas son **obligatorias por defecto** (`hybrid_signature_mode = required`, `allow_classical_fallback = false`): toda transacción por la ruta cosmos debe llevar una firma Dilithium-5 junto a su firma clásica secp256k1. Consulta [Seguridad poscuántica](/architecture/post-quantum-security) para el modelo de aplicación.

La firma clásica secp256k1 se calcula sobre los sign bytes estándar (que **excluyen** la extensión PQC), y la firma ML-DSA-87 se calcula y se adjunta como la extensión `PQCHybridSignature`. Como los sign bytes clásicos excluyen la extensión, la firma clásica sigue siendo válida entienda o no el verificador la parte PQC.

Hay tres maneras de producir esta firma híbrida:

* **La CLI** — `qorechaind tx pqc cosign` adjunta la cofirma Dilithium-5 a una transacción (después de `qorechaind tx pqc gen-key`). Consulta [Comandos de transacción](/cli-reference/transaction-commands).
* **El SDK de QoreChain** — `buildHybridTx` (con `includePqcPublicKey`) hace el equivalente en TypeScript/Python/Go/Rust. Consulta [Cuentas del SDK y firma PQC](/sdk/concepts/accounts-pqc).
* **`qorechain-pqc` directamente** — usa `hybridSignBytes` para enmarcar los sign bytes y `mldsa.sign` para producir la firma Dilithium-5, cuando construyas herramientas fuera del SDK en uno de los seis lenguajes soportados.

## Optimizar la huella on-chain

Las claves y firmas ML-DSA son grandes para los estándares clásicos. Como los bytes de un estándar son fijos, la forma de mantener pequeña la huella on-chain es usar estas tres palancas — ninguna de las cuales altera el estándar:

1. **Elige el nivel de seguridad de forma deliberada.** Las firmas ML-DSA-65 (L3) son ~28% más pequeñas que las de ML-DSA-87 (L5) y siguen siendo muy fuertes; los textos cifrados de ML-KEM-768 son más pequeños que los de 1024. Elige según el caso de uso.
2. **Pay-to-pubkey-hash.** Almacena solo `pubkeyHash(pk)` (20–32 bytes de SHAKE-256) en el estado de la cuenta y exige la clave pública completa en la transacción. El estado de la cuenta se mantiene mínimo sea cual sea el tamaño de la clave.
3. **Firmas de verificar y descartar.** Una firma debe vivir en la transacción (datos del bloque) pero nunca debería escribirse en el árbol de estado persistente.

> **¿Por qué no Falcon?** FN-DSA (Falcon) daría firmas más pequeñas, pero está **excluido** intencionadamente: FN-DSA es un *borrador* de FIPS-206 (no final), y una biblioteca basada exclusivamente en estándares solo publica estándares finalizados. Podrá reconsiderarse cuando FIPS-206 se finalice.

## Relacionado

* [Seguridad poscuántica](/architecture/post-quantum-security) — cómo la cadena usa estas primitivas y aplica las firmas híbridas.
* [Comandos de transacción](/cli-reference/transaction-commands) — el flujo de CLI `tx pqc gen-key` / `tx pqc cosign`.
* [Cuentas del SDK y firma PQC](/sdk/concepts/accounts-pqc) — claves y firma híbrida desde el SDK de QoreChain.
* [Configuración de wallet](/getting-started/wallet-setup) — crea y gestiona cuentas respaldadas por PQC.
