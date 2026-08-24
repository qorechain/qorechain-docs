---
slug: /sdk/concepts/accounts-pqc
title: Cuentas y firma PQC
sidebar_label: Cuentas y PQC
sidebar_position: 2
---

# Cuentas y firma PQC

Las cuentas de QoreChain se derivan de un único mnemónico BIP-39. Existen dos
modelos de cuentas, ambos totalmente compatibles:

- **Derivación HD por carril (heredado/predeterminado)** — el mismo mnemónico
  genera una cuenta nativa (coin type 118), una cuenta EVM (coin type 60) y
  una cuenta SVM (coin type 501) mediante rutas de derivación independientes.
  Tres claves, tres direcciones.
- **Cuentas unificadas eth-native** (SDK 0.6.0, cadena v3.1.83) — UNA clave
  `eth_secp256k1` es UNA identidad de 20 bytes representada en las tres
  codificaciones de dirección, con un único saldo compartido. Consulta
  [Cuentas unificadas](#unified-accounts).

## Derivación HD (heredado/predeterminado, coin type 118)

```ts
import {
  generateMnemonic,
  validateMnemonic,
  deriveNativeAccount,
  deriveEvmAccount,
  deriveSvmAccount,
} from "@qorechain/sdk";

const mnemonic = generateMnemonic(); // 12 words; pass 256 for 24 words

const native = await deriveNativeAccount(mnemonic);
console.log(native.address); // "qor1..."  (secp256k1, bech32)

const evm = await deriveEvmAccount(mnemonic);
console.log(evm.address); // "0x..."   (EIP-55 checksummed)

const svm = await deriveSvmAccount(mnemonic);
console.log(svm.address); // base58 ed25519 public key
```

El mnemónico se valida (palabras **y** checksum) antes de derivar cualquier
clave, de modo que un error tipográfico lanza una excepción en lugar de
producir silenciosamente una cuenta incorrecta. Puedes validar explícitamente
con `validateMnemonic(mnemonic)`.

### Esquemas de derivación

| Tipo | Curva | Ruta | Dirección |
| --- | --- | --- | --- |
| native | secp256k1 | `m/44'/118'/0'/0/{i}` | bech32 `qor` de `ripemd160(sha256(pubkey))` |
| evm | secp256k1 | `m/44'/60'/0'/0/{i}` | `0x` + `keccak256(pubkey)[-20:]`, EIP-55 |
| svm | ed25519 | `m/44'/501'/{i}'/0'` | base58 de la clave pública de 32 bytes |

Pasa un índice de cuenta para derivar cuentas adicionales. En TypeScript:

```ts
const second = await deriveNativeAccount(mnemonic, { accountIndex: 1 });
```

En Python/Go/Rust el índice es un argumento posicional
(`derive_native_account(mnemonic, 1)` / `DeriveNativeAccount(mnemonic, 1)` /
`derive_native_account(&mnemonic, 1)`).

### Nota sobre vectores de prueba conocidos

Los esquemas de derivación son deterministas y están cubiertos por pruebas de
vectores conocidos (known-answer tests) en los cuatro SDKs, de modo que el
mismo mnemónico produce direcciones idénticas en TypeScript, Python, Go y
Rust. Esto te permite derivar en un lenguaje y verificar en otro.

> Esta derivación por carril (`deriveNativeAccount` con coin type 118, más
> `deriveEvmAccount` / `deriveSvmAccount`) es el modelo **heredado/predeterminado**
> y sigue siendo compatible y sin cambios. Las cuentas unificadas descritas
> más abajo son un modelo de identidad adicional y opcional (opt-in).

## Cuentas unificadas (eth-native) {#unified-accounts}

Desde el SDK **0.6.0** (cadena v3.1.83), `deriveUnifiedAccount(mnemonic, index = 0)`
deriva UNA clave `eth_secp256k1` en la ruta HD de Ethereum
`m/44'/60'/0'/0/{index}`, cuyos 20 bytes de dirección
(`keccak256(pubkey)[12:]`) son la MISMA identidad representada de tres
formas:

| Carril | Codificación |
| --- | --- |
| Native | bech32 con el prefijo `qor` (`qor1…`) |
| EVM | `0x` + hexadecimal con checksum de mayúsculas/minúsculas mixtas EIP-55 |
| SVM | base58 de los 20 bytes rellenados a la derecha con 12 bytes cero (32 bytes) |

Un depósito en **cualquiera** de los tres carriles termina en **un solo**
saldo, y la clave puede gastar en todos los carriles:

```ts
import {
  deriveUnifiedAccount,
  qoreAddresses,
  addressesFrom20,
} from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);

account.cosmos;       // "qor1…"   bech32, Native lane
account.evm;          // "0x…"     EIP-55 hex, EVM lane
account.svm;          // "<base58>" 32-byte SVM address (addr20 + 12 zero bytes)
account.addressBytes; // the raw 20 bytes shared by all three
account.publicKey;    // 33-byte compressed secp256k1 public key
account.pqc;          // { publicKey, secretKey } — ML-DSA-87, derived below

// Decode any ONE encoding into all three:
const all = qoreAddresses({ evm: account.evm });
all.cosmos; // qor1…
all.svm;    // base58

// or straight from the raw 20 bytes:
const same = addressesFrom20(account.addressBytes);
```

`unifiedAccountFromSeed(seed32)` hace lo mismo a partir de una clave privada
secp256k1 sin procesar de 32 bytes.

### La derivación de la semilla PQC

El par de claves ML-DSA-87 de la cuenta se deriva de forma determinista y
**vinculada a la dirección**:

```text
pqcSeed = shake256("qorechain:pqc:v1|" + cosmosAddress + "|" + mnemonic, 32)
```

por lo que es recuperable a partir de `{ address, mnemonic }` e idéntica en
todos los SDKs de lenguaje de QoreChain. (Para `unifiedAccountFromSeed`, el
campo del mnemónico es `"seed:" + hex(seed32)`.)

### Envío en el carril Native con la clave eth

Una cuenta unificada firma las transacciones de la ruta Native con el
esquema `eth_secp256k1`: la firma clásica es secp256k1 sobre **keccak256**
de los bytes del SignDoc (no sha256), y la clave pública de `SignerInfo` usa
la URL de tipo `/cosmos.evm.crypto.v1.ethsecp256k1.PubKey`. La ruta híbrida
(`signHybridEth`) además adjunta la extensión `PQCHybridSignature` de
ML-DSA-87 — obligatoria en las redes activas:

```ts
import { EthNativeSigner, deriveUnifiedAccount } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
const signer = new EthNativeSigner(account); // signMode: "hybrid" by default

// `transport` is anything with broadcastTx (e.g. a connected client).
await signer.bankSend(
  transport,
  "qor1recipient…",
  [{ denom: "uqor", amount: "1000000" }], // 1 QOR
  { chainId: "qorechain-vladi", accountNumber, sequence, fee },
);
```

Para un control de más bajo nivel, `signHybridEth(params)` /
`signClassicalEth(params)` devuelven los bytes ensamblados de `TxRaw` y los
artefactos de firma, y `accountAuthInfo(baseAccount)` lee `account_number` /
`sequence` de una cuenta cuya clave pública on-chain usa la URL de tipo
`eth_secp256k1`. La ruta solo-clásica es para el `MsgRegisterPQCKeyV2`
puntual, exento del requisito de bootstrap; usa la ruta híbrida para todo lo
demás.

:::caution Actualiza al SDK 0.6.1+ para transacciones híbridas
El SDK **0.6.1** corrigió un error de codificación crítico para el consenso:
la extensión del cuerpo de la transacción
`/qorechain.pqc.v1.PQCHybridSignature` se serializaba en JSON dentro de
`Any.value`, y la cadena **rechazaba esas transacciones en CheckTx** (un
error de análisis de la transacción). Ahora se codifica en protobuf (el
valor de la extensión comienza con `0x08`) en los cinco lenguajes. Cualquier
transacción híbrida — incluido el carril eth-native — construida con SDK
≤ 0.6.0 es rechazada on-chain: actualiza a la versión 0.6.1 o posterior.
:::

### Phantom (P1a): una cuenta unificada sin exportar una clave

`connectPhantomUnified()` (TypeScript) deriva una cuenta unificada canónica
y **no custodial** a partir de una firma determinista de Phantom: el usuario
firma un mensaje fijo y separado por dominio con la clave ed25519 de
Phantom, y `shake256(signature, 32)` genera la semilla de la cuenta.

```ts
import {
  connectPhantomUnified,
  unifiedAccountFromPhantomSignature,
} from "@qorechain/sdk";

// In the browser (uses window.solana):
const account = await connectPhantomUnified();

// Or, given a raw signature you already have:
const same = unifiedAccountFromPhantomSignature(signatureBytes);
```

La cuenta derivada es una clave canónica independiente de la clave ed25519
de Phantom — Phantom nunca ve los secretos secp256k1/PQC derivados. Para
permitir que la propia clave de Phantom gaste desde la cuenta dentro de
ciertos límites, consulta
[Autenticadores y gasto delegado](/sdk/guides/authenticators).

## Criptografía poscuántica (PQC)

QoreChain admite firmas **ML-DSA-87** (Dilithium-5, FIPS 204). El SDK expone
las primitivas directamente.

```ts
import {
  generatePqcKeypair,
  pqcSign,
  pqcVerify,
  ML_DSA_87_PUBLIC_KEY_LENGTH,
  ML_DSA_87_SIGNATURE_LENGTH,
} from "@qorechain/sdk";

const keypair = generatePqcKeypair();
const message = new TextEncoder().encode("hello");

const signature = pqcSign(keypair.secretKey, message);
const ok = pqcVerify(keypair.publicKey, message, signature);
```

Las constantes de longitud exportadas (`ML_DSA_87_PUBLIC_KEY_LENGTH`,
`ML_DSA_87_SECRET_KEY_LENGTH`, `ML_DSA_87_SIGNATURE_LENGTH`,
`ML_DSA_87_SEED_LENGTH`) te permiten validar el tamaño de los búferes.

> Por debajo, las primitivas PQC provienen de
> [**qorechain-pqc**](/developer-guide/post-quantum-signing) — la biblioteca
> de código abierto y basada únicamente en estándares que envuelve
> implementaciones auditadas de FIPS-204/203/202 detrás de una API coherente
> en seis lenguajes (JavaScript/TypeScript, Rust, Go, C, Python, Java).
> Recurre a ella directamente cuando necesites las primitivas sin procesar o
> el formato `hybridSignBytes` fuera del SDK.

### Firmantes conectables

Para la composición, el SDK ofrece una abstracción `Signer` más las
implementaciones `PqcSigner` y `HybridSigner`, y un enum `SignatureMode`.
Úsalos cuando quieras integrar la firma PQC en tu propio flujo en lugar de
llamar directamente a las primitivas.

## Firma híbrida {#hybrid-signing}

Una transacción **híbrida** lleva tanto una firma clásica secp256k1 como una
firma ML-DSA-87, de modo que sigue siendo válida bajo verificación clásica
mientras gana protección poscuántica. La parte poscuántica viaja como una
extensión `PQCHybridSignature` en la transacción.

:::caution La firma híbrida es obligatoria en la ruta Native
A partir de la versión actual de la cadena (**v3.1.92**), el valor
predeterminado de la red es `hybrid_signature_mode = required` con
`allow_classical_fallback = false`. La firma híbrida mediante
`buildHybridTx` (con `includePqcPublicKey`) — o `signHybridEth` para cuentas
unificadas eth-native — es **obligatoria** para las transacciones de la ruta
Native; las transacciones Native solo-clásicas son rechazadas on-chain. Las
transacciones EVM usan una ruta `eth_secp256k1` independiente y no se ven
afectadas.
:::

:::caution Las transacciones híbridas del SDK ≤ 0.6.0 son rechazadas
La versión 0.6.1 corrigió la codificación de la extensión
`PQCHybridSignature` (JSON → protobuf, crítico para el consenso). Las
transacciones híbridas construidas con SDK 0.6.0 o anterior fallan en
CheckTx con un error de análisis de la transacción — actualiza a 0.6.1+.
:::

```ts
import {
  buildHybridTx,
  deriveNativeAccount,
  directSignerFromPrivateKey,
} from "@qorechain/sdk";

const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");

// buildHybridTx assembles a tx with BOTH a classical signature and an
// ML-DSA-87 signature attached as a PQCHybridSignature extension.
// (See packages/ts and the pqc-hybrid-sign example for the full call.)
```

### Requisito previo on-chain

Antes de que una transacción híbrida pueda verificarse mediante PQC
on-chain, la clave pública PQC del firmante debe estar **registrada**
mediante el `MsgRegisterPQCKey` de la cadena — *a menos que* establezcas
`includePqcPublicKey: true`, lo que incrusta la clave en la extensión para
que la cadena pueda autorregistrarla en el primer uso.

### Contrato de la tx híbrida (nivel alto)

La transacción se firma clásicamente sobre los bytes de firma estándar (que
**excluyen** la extensión PQC), y la firma ML-DSA-87 se calcula y se adjunta
como la extensión `PQCHybridSignature`. Dado que los bytes de firma clásicos
excluyen la extensión, la firma clásica sigue siendo válida sea o no que un
verificador entienda la parte PQC. Los ayudantes de bajo nivel
(`encodeHybridExtension`, `attachHybridExtension`,
`buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`) y los constructores
de extremo a extremo (`buildHybridTx`, `signAndBroadcastHybrid`) se exportan
para uso avanzado.

> El envío de transacciones híbridas es la ruta obligatoria en la red activa
> para las transacciones cosmos. Las primitivas locales de firma/verificación
> y los ayudantes de construcción de transacciones están disponibles hoy.

## Rotación de claves PQC

Desde el SDK 0.7.0, una cuenta puede rotar su clave ML-DSA-87 a una nueva
clave del **mismo algoritmo** — migrando de forma canónica una clave
heredada `shake256(mnemonic)` a la clave vinculada a la dirección
`shake256("qorechain:pqc:v1|addr|mnemonic")` — mediante
`rotatePqcKeyMsgFromMnemonic` (ambas claves firman conjuntamente los bytes
de la rotación). Consulta
[Rotación de claves](/sdk/guides/authenticators#key-rotation) en la guía de
Autenticadores para ver un ejemplo completo.

## Identificadores de algoritmo

El SDK exporta identificadores de algoritmo y funciones auxiliares para
trabajo a nivel de protocolo: `AlgorithmUnspecified`, `AlgorithmDilithium5`,
`AlgorithmMLKEM1024`, `algorithmName(id)`, y `isSignatureAlgorithm(id)`.
