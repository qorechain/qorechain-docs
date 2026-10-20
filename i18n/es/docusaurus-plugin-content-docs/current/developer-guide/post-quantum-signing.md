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
| Java | `io.github.qorechain:qorechain-pqc` (Maven Central) | `io.github.qorechain:qorechain-pqc:0.2.3` | [Bouncy Castle](https://www.bouncycastle.org/) |

:::info Disponibilidad
Los bindings de JavaScript, Rust, Python, Go y Java están todos **publicados** en la versión **0.2.3** (npm, crates.io, PyPI, el proxy de módulos de Go como `v0.2.3` y Maven Central; comprobado el 21 de octubre de 2026). Instálalos con los comandos anteriores. La distribución de Python se instala como `qorechain-pqc` pero **se importa como `qorpqc`**. El paquete de **Java** es `io.github.qorechain:qorechain-pqc:0.2.3` (backend Bouncy Castle). La versión **0.2.0** añadió `hybridSignBytes` con soporte de versión (más abajo), la **0.2.1** corrigió qué nombre de actualización marca el paso a v2 en la mainnet y la **0.2.2** corrigió la documentación y los comentarios sobre la firma hedged frente a la determinista (la cadena acepta ambas; en el binding de JavaScript solo cambió la constante de versión en el código); la **0.2.3** actualiza las dependencias criptográficas (Bouncy Castle en Java, `@noble/post-quantum` en JavaScript) con una salida idéntica. Usa la 0.2.1 o posterior. El binding de **C** es una biblioteca estática + cabecera que compilas desde [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc).
:::

## Firma determinista (predeterminada) {#deterministic-signing}

A partir de la versión **0.1.1** (y en todas las posteriores), `sign()` produce la variante **determinista** de ML-DSA (FIPS-204 §3.4, donde la aleatoriedad de firma son 32 bytes a cero) en **los seis bindings**. La cadena acepta cualquier firma ML-DSA-87 válida según FIPS-204, hedged o determinista: la verificación es idéntica para ambas y un verificador no puede distinguirlas sin la clave secreta. Los bindings firman de forma determinista por defecto para que la misma transacción produzca siempre la misma firma y el mismo hash de tx, y para que todos los bindings coincidan con los vectores compartidos.

Datos clave:

* La salida determinista es **idéntica byte a byte en los seis bindings** para la misma clave y mensaje, fijada por vectores de prueba compartidos entre lenguajes.
* La firma hedged sigue disponible como **opción explícita** en cada binding (p. ej. `{hedged: true}` en JavaScript, `sign_hedged` en Rust, `mldsaSignHedged` en Java, `sign(..., hedged=True)` en Python). Las firmas hedged **son aceptadas por la cadena** como cualquier firma FIPS-204 válida; la única diferencia es que la firma, y por tanto el hash de tx, cambia cada vez que firma.
* La versión 0.1.0 del binding de JavaScript firmaba hedged por defecto. Esas firmas también son válidas on-chain; actualice a 0.1.1 si quiere firmas reproducibles que coincidan con los vectores compartidos.

## Registrar tu clave {#pqc-key-registration}

Cada cuenta registra su clave pública ML-DSA-87 **una sola vez y de forma explícita**. No existe registro automático: una clave pública incluida en una transacción híbrida posterior (por ejemplo, la opción `includePqcPublicKey` del SDK) viaja en la extensión pero **no** la registra. Un **primer** registro es la única transacción de la lane Cosmos que puede firmarse de forma clásica, para que una cuenta recién creada pueda arrancar su primera clave; una cuenta que ya tiene una clave debe firmar en modo híbrido todos los mensajes de clave posteriores. Hazlo con el `qorechaind` de la release (un binario compilado desde el código fuente público no puede firmar; consulta [Compilar desde el código fuente](/developer-guide/building-from-source)), con QoreX o con `ensurePqcRegistered` del SDK:

```bash
# 1. Create a key. It is stored unencrypted under ~/.qorechaind/pqc/mypqc.dilithium (mode 0600) and the public key hex is printed.
qorechaind tx pqc gen-key mypqc

# 2. Register the public key on your account (classical-signed, because the account has no key yet).
#    --pqc-key mypqc also attaches the optional proof of possession (see below).
qorechaind tx pqc register-key-v2 dilithium5 <printed-pubkey-hex> hybrid --pqc-key mypqc \
  --from mykey --chain-id qorechain-vladi --gas 600000 --fees 60000uqor -y

# 3. Verify.
qorechaind query pqc account <address>
```

Fija `--gas` explícitamente: la clave pública de 2,592 bytes puede superar los 200,000 de gas predeterminados (los registros en mainnet han usado aproximadamente entre 220,000 y 310,000; un registro con prueba de posesión lleva una firma más de 4,627 bytes, unos 46,000 de gas adicionales), y la comisión debe ser como mínimo gas × 0.1 uqor, así que `--gas 600000` requiere `--fees 60000uqor` o más. La forma heredada `qorechaind tx pqc register-key <pubkey-hex> hybrid` es equivalente para Dilithium-5. A partir de ahí, construye cada transacción de la lane Cosmos con `--generate-only` y fírmala con `qorechaind tx pqc cosign`. El archivo de clave es la clave de firma poscuántica de la cuenta: quien pueda leerlo puede cofirmar por la cuenta junto con la clave clásica, así que respáldalo como el mnemónico (puede volver a derivarse del mnemónico, véase más abajo).

Una clave registrada es además el primero de los dos requisitos para enviar transacciones EVM; el segundo es una [ventana de autorización EVM](/developer-guide/evm-development#evm-window) abierta.

### Qué comprueba la cadena en el registro (mainnet v3.2.3 y posteriores) {#key-integrity}

Desde la actualización v3.2.3 (aplicada en la mainnet en la altura 3,662,051 el 20 de octubre de 2026) la cadena comprueba la propia clave, no solo que tenga la longitud correcta:

| Regla | Rechazo (codespace `pqc`) |
| --- | --- |
| `key_type` debe ser `hybrid` o `pqc_only`; `classical_only` no registra ninguna clave poscuántica y dejaría a la cuenta sin poder volver a firmar | código 230 |
| Se rechaza una clave que no ofrece protección poscuántica (una clave degenerada para la que nadie necesita un secreto), tanto en el registro como en la rotación y la migración | código 230 |
| Una clave que la cuenta ya ha usado antes no puede registrarse de nuevo ni se puede volver a ella mediante rotación (la cuenta recuerda las claves retiradas) | código 232 |
| La clave clásica del registro debe ser la clave secp256k1 comprimida del propio firmante (desde v3.2.2) | código 45 |
| Una prueba de posesión opcional, si está presente, debe verificarse | código 231 |
| Una cuenta que ya tiene una clave debe firmar en modo híbrido cualquier otro mensaje de clave (registro, migración); solo la reparación de un registro que no contiene ninguna clave utilizable puede ser clásica | código 234 |
| Deprecar o deshabilitar un algoritmo no puede dejar a la cadena sin un algoritmo de firma activo | código 233 |

Además, desde v3.2.3, ninguno de los mensajes de clave (`MsgRegisterPQCKey`, `MsgRegisterPQCKeyV2`, `MsgRotatePQCKey`, `MsgMigratePQCKey`) puede enviarse en nombre de una cuenta a través de `authz`; una transacción puede llevar como máximo **una** extensión de firma híbrida; y una cuenta que **no** tiene ninguna clave registrada ya no puede adjuntar una extensión híbrida que no tenga nada contra lo que verificarse (solo puede pasar un registro, exactamente igual que sin ninguna extensión).

### Prueba de posesión (opcional) {#proof-of-possession}

Un registro también puede demostrar que quien lo realiza posee el secreto de la nueva clave. La clave firma `qorechain-pqc-pop-v1|<chain-id>|<algorithm id>|<address>|<public key hex>` (el id de algoritmo es `1` para ML-DSA-87; la clave pública va en hex en minúsculas) y la firma se coloca en el campo `proof_of_possession` de `MsgRegisterPQCKeyV2`. Con la CLI, `register-key-v2 ... --pqc-key <name>` la construye y la adjunta. Con el SDK de TypeScript 0.9.0, `ensurePqcRegistered` adjunta la prueba por sí mismo una vez que la red ha aplicado v3.2.3 (y `signProofOfPossession` / `verifyProofOfPossession` construyen y comprueban una a mano); `@qorechain/chain-bridge` 0.2.3 hace lo mismo cuando se le proporciona `cosmosRest`. `@qorechain/wallet-adapter` (0.4.0) y las versiones del SDK anteriores a la 0.9.0 no adjuntan ninguna, por lo que un registro hecho con ellos no lleva ninguna, algo que la cadena sigue aceptando. La cadena verifica la prueba **cuando está presente** y rechaza el registro si no se verifica (código 231); un registro sin prueba se sigue aceptando en la mainnet. Como el mensaje nombra la cadena, el algoritmo, la cuenta y la clave, una prueba hecha para uno de ellos no demuestra nada para otro.

**Indicador de posesión y validadores de bridge (v3.2.4).** El registro de la cuenta indica si la clave actual de la cuenta fue demostrada: `possession_proven`, en `GET /qorechain/pqc/v1/account/{address}`. Es `true` cuando la clave se registró con una prueba de posesión verificada, o la instaló una rotación (la nueva clave firma la rotación, lo que la demuestra); permanece `false` para una cuenta que se registró sin prueba. El indicador no cambia nada respecto a quién puede enviar o recibir. Registrar un **validador de bridge** exige además una prueba de posesión de la clave poscuántica del validador (`proof_of_possession` en el registro; la clave firma `qorechain-pqc-pop-v1|<chain-id>|1|<validator address>|<public key hex>`, con la CLI `--pqc-key`), y dos validadores de bridge no pueden registrar la misma clave. El propio bridge entre cadenas no está en producción. Ambos cambios están en la testnet desde el 19 de octubre de 2026 y en la mainnet desde la altura 3,742,566 (propuesta de gobernanza 13): la mainnet ejecuta v3.2.3 hasta ese bloque y v3.2.4 desde él.

## Códigos de rechazo (codespace `pqc`) {#pqc-codes}

| Código | Significado |
| --- | --- |
| 20 | Se requiere firma híbrida: la transacción no lleva ninguna extensión PQC (solo un primer registro y un unjail de una cuenta sin clave están exentos) |
| 21 | La mitad ML-DSA-87 no se verificó, véase [más abajo](#code-21) |
| 26, 27, 28 | Lane EVM: no hay ventana abierta o no hay clave / ventana agotada / límites de ventana no válidos, véase [Desarrollo EVM](/developer-guide/evm-development#evm-window) |
| 45 | La clave clásica de un registro no es la clave secp256k1 comprimida del propio firmante |
| 60, 61 | Delegación EIP-7702: no hay consentimiento poscuántico para esta delegación / solicitud de delegación no válida |
| 62, 63 | Una cuenta delegada no tiene ninguna ventana que cubra la acción / una transacción de Ethereum se ejecuta solo en la lane EVM |
| 230 | Clave débil o registro `classical_only` |
| 231 | La prueba de posesión no se verifica |
| 232 | La clave ya fue usada por esta cuenta |
| 233 | No quedaría ningún algoritmo de firma activo |
| 234 | El mantenimiento de claves desde una cuenta con clave necesita la firma híbrida |

## Solución de problemas del código 21 de `pqc` (`hybrid_verify_failed`) {#code-21}

El código 21 significa que la mitad ML-DSA-87 de una firma híbrida no se verificó contra la clave registrada de la cuenta. **Nunca** se debe a elegir firma hedged en lugar de determinista. Compruebe, en este orden:

1. **Versión de los sign-bytes.** La firma PQC cubre los sign-bytes v1 o v2, y una red verifica exactamente una forma en cada altura: `qorechain-diana` pasó a v2 en su actualización `v3.1.98`, `qorechain-vladi` en su actualización `v3.2.0`, y las cadenas creadas después son v2 desde el génesis. Los SDK actuales eligen la forma por red; los firmadores propios deben preguntar al nodo qué actualización está aplicada (consulte [Cuentas y firma PQC](/sdk/concepts/accounts-pqc)).
2. **Chain-id en los sign-bytes v2.** v2 vincula el chain-id, así que una firma hecha para `qorechain-diana` no se verifica en `qorechain-vladi` y viceversa.
3. **Biblioteca PQC obsoleta.** Las compilaciones anteriores al estándar (pre-FIPS-204) producen firmas que un verificador conforme rechaza. Use `qorechain-pqc` 0.1.1 o posterior.
4. **Clave equivocada.** La clave pública debe ser la registrada para la cuenta (`GET /qorechain/pqc/v1/account/{address}`). Una clave obtenida con otra derivación (por ejemplo la derivación heredada del bridge `shake256(mnemonic)` en lugar de la vinculada a la dirección) firma de forma válida pero no coincide. Consulte [Rotación de clave](#key-rotation) para pasar a la clave canónica.

## Derivación determinista de claves y recuperación {#key-derivation}

La derivación estándar del ecosistema vincula la clave ML-DSA-87 a la cuenta, por lo que es **recuperable solo con el mnemónico de la cuenta**:

```
seed = SHAKE-256("qorechain:pqc:v1|" + cosmosAddress + "|" + mnemonic)
(publicKey, secretKey) = mldsa.keygen(seed)
```

Todas las herramientas publicadas (`@qorechain/wallet-adapter`, `@qorechain/sdk`, `@qorechain/chain-bridge` ≥0.1.1) derivan esta misma clave, de modo que un mnemónico produce una única clave sea cual sea la herramienta. Recupera una clave en la CLI (mnemónico por stdin):

```bash
# the mnemonic is read from stdin; keep it out of shell history by redirecting from a file you delete afterwards
qorechaind tx pqc recover-key mykey qor1youraddress... < mnemonic.txt
# legacy tooling derivation (shake256(mnemonic) only, unbound to the address):
qorechaind tx pqc recover-key mykey qor1youraddress... --derivation bridge < mnemonic.txt
```

La clave privada recuperada se escribe como hex sin cifrar (modo 0600) en `<home>/pqc/mykey.dilithium` para usarla con `tx pqc cosign`.

## Rotación de claves (mismo algoritmo) {#key-rotation}

A partir de la versión de cadena **v3.1.85**, **`MsgRotatePQCKey`** rota la clave ML-DSA-87 de una cuenta **dentro del mismo algoritmo** — anteriormente el registro era de un solo uso y `MigratePQCKey` solo cruzaba entre algoritmos. Úsalo para migrar una clave con derivación legacy a la derivación canónica vinculada a la dirección, o para retirar una clave comprometida.

La rotación lleva **doble firma**: tanto la clave antigua como la nueva firman el mensaje con separación de dominio `"qorechain-pqc-rotate-v1|chainId|algorithm|account|oldPubHex|newPubHex"`. El replay es estructuralmente imposible — una vez rotada, la clave antigua ya no coincide con la clave registrada, por lo que el mismo mensaje no puede volver a aplicarse. La rotación es una operación **exclusiva de la clave raíz** (nunca delegable a un [authenticator](/developer-guide/account-abstraction#authenticators)), y la propia transacción sigue firmándose en modo híbrido con la clave *antigua*, lo que demuestra la propiedad actual.

CLI de un solo paso (mnemónico por stdin; recupera la clave antigua, deriva o genera la nueva, aplica la doble firma y difunde):

```bash
# migrate a legacy-derived key to the canonical derivation (mnemonic on stdin):
qorechaind tx pqc rotate-key --old-derivation bridge --new-derivation adapter \
  --from mykey --chain-id qorechain-vladi --gas 600000 --fees 60000uqor -o json -y < mnemonic.txt

# rotate to a brand-new random key (compromise recovery); --new-key-out is required and is written before anything is sent:
qorechaind tx pqc rotate-key --old-derivation adapter --new-random --new-key-out mykey-new \
  --from mykey --chain-id qorechain-vladi --gas 600000 --fees 60000uqor -o json -y < mnemonic.txt
```

La rotación incluye dos claves de 2,592 bytes y tres firmas, por lo que necesita mucho más gas que una transferencia; mantén el `--gas 600000` explícito y una comisión de al menos 60,000 uqor. `--new-random` sin `--new-key-out` se rechaza (versión de nodo v3.2.1 y posteriores) para que una rotación nunca pueda dejarte sin la clave nueva.

En código, `@qorechain/wallet-adapter` (≥0.1.7) y `@qorechain/sdk` (≥0.7.0) exponen el mismo flujo (síncrono; devuelve el mensaje junto con ambos pares de claves):

```js
import { rotatePqcKeyMsgFromMnemonic } from "@qorechain/wallet-adapter";

// Builds the dual-signed MsgRotatePQCKey migrating shake256(mnemonic) -> canonical:
const { msg, oldKeypair, newKeypair } = rotatePqcKeyMsgFromMnemonic({
  account: "qor1youraddress...", mnemonic, chainId: "qorechain-vladi",
});
// Sign & broadcast `msg` with the account's normal hybrid signer, using `oldKeypair` for the envelope's PQC signature.
```

Los asistentes de rotación del SDK 0.9.0 y de `@qorechain/wallet-adapter` 0.4.0 rechazan la derivación legacy como clave **nueva** (no está vinculada a la cuenta); una clave legacy aún puede ser la clave antigua. Tras una rotación correcta, la clave nueva firma (código 0) y la clave antigua se rechaza (`pqc` código 21). Desde v3.2.3 una rotación (como una migración) rechaza una clave nueva que no ofrece protección poscuántica (código 230) y una clave que la cuenta ya ha usado antes (código 232), y no puede enviarse a través de `authz`.

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

### `hybridSignBytes(version, chainId, bodyWithoutPqcExt, authInfo)`

El framing de **sign-bytes con extensión híbrida** compatible con wallets de QoreChain. Produce exactamente los bytes que deben firmarse con ML-DSA-87 (Dilithium-5) para formar la mitad PQC de una transacción híbrida. Existen dos formas y una red verifica exactamente una en cada altura: **v1** = `BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A` y **v2** = `"qorechain-pqc-hybrid-v2" ‖ BE64(len chainId) ‖ chainId ‖ BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A` (`B0` es el cuerpo de la transacción sin la extensión PQC y `A` la auth info). Las dos redes públicas están en **v2**. La biblioteca es pura, así que quien la llama elige la forma: pregunta al nodo con `GET /cosmos/upgrade/v1beta1/applied_plan/{name}` por **ambos** `v3.2.0` (el nombre de actualización de la mainnet) y `v3.1.98` (el nombre anterior de la testnet) y usa v2 si alguna de las alturas es mayor que 0; `signBytesVersionForApplied` y `signBytesVersionFor(chainId, height)` implementan la regla (usa `@qorechain/pqc` 0.2.1 o posterior; la forma de 2 argumentos de 0.1.x lanza un error).

Esta es la pieza que wallets e integradores usan para producir la **firma híbrida obligatoria** en la ruta de transacciones cosmos. En la versión actual de la cadena, las firmas híbridas son **obligatorias por defecto** (`hybrid_signature_mode = required`, `allow_classical_fallback = false`): toda transacción por la ruta cosmos debe llevar una firma Dilithium-5 junto a su firma clásica secp256k1. Consulta [Seguridad poscuántica](/architecture/post-quantum-security) para el modelo de aplicación.

La firma clásica secp256k1 se calcula sobre los sign bytes estándar (que **excluyen** la extensión PQC), y la firma ML-DSA-87 se calcula y se adjunta como la extensión `PQCHybridSignature`. Como los sign bytes clásicos excluyen la extensión, la firma clásica sigue siendo válida entienda o no el verificador la parte PQC.

Hay tres maneras de producir esta firma híbrida:

* **La CLI** — `qorechaind tx pqc cosign` adjunta la cofirma Dilithium-5 a una transacción y la difunde (después de `qorechaind tx pqc gen-key` y de registrar la clave). Forma parte solo del binario de la release. Consulta [Comandos de transacción](/cli-reference/transaction-commands).
* **El SDK de QoreChain** — `buildHybridTx` / `signAndBroadcastHybrid` (pasa `rest` para que se resuelva la forma de los sign-bytes) hacen el equivalente en TypeScript, Python, Go, Rust y Java; en TypeScript, `client.connectTx(signer, { pqcKeypair })` (SDK 0.9.0) firma cada transacción de forma híbrida. Registra primero tu clave (véase arriba). Consulta [Cuentas del SDK y firma PQC](/sdk/concepts/accounts-pqc).
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
