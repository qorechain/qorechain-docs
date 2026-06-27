---
slug: /sdk/concepts/accounts-pqc
title: Cuentas y firma PQC
sidebar_label: Cuentas y PQC
sidebar_position: 2
---

# Cuentas y firma PQC

Las cuentas de QoreChain se derivan de una única frase mnemónica BIP-39. La misma
frase mnemónica produce una cuenta nativa, una EVM y una SVM mediante rutas de
derivación independientes.

## Derivación HD

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

La frase mnemónica se valida (palabras **y** checksum) antes de derivar cualquier
clave, de modo que un error de tecleo provoca un fallo en lugar de generar
silenciosamente una cuenta incorrecta. Puedes validarla explícitamente con
`validateMnemonic(mnemonic)`.

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

### Nota sobre respuestas conocidas

Los esquemas de derivación son deterministas y están cubiertos por pruebas de
respuesta conocida (known-answer tests) en los cuatro SDK, de modo que la misma
frase mnemónica produce direcciones idénticas en TypeScript, Python, Go y Rust.
Esto te permite derivar en un lenguaje y verificar en otro.

## Criptografía post-cuántica (PQC)

QoreChain admite firmas **ML-DSA-87** (Dilithium-5, FIPS 204). El SDK expone las
primitivas directamente.

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
`ML_DSA_87_SEED_LENGTH`) te permiten validar los tamaños de los búferes.

> Por debajo, las primitivas PQC provienen de [**qorechain-pqc**](/developer-guide/post-quantum-signing), la librería de código abierto y basada únicamente en estándares que envuelve implementaciones auditadas de FIPS-204/203/202 tras una API consistente en seis lenguajes (JavaScript/TypeScript, Rust, Go, C, Python, Java). Recúrrela directamente cuando necesites las primitivas en crudo o el framing de `hybridSignBytes` fuera del SDK.

### Firmantes conectables

Para la composición, el SDK proporciona una abstracción `Signer` además de las
implementaciones `PqcSigner` e `HybridSigner`, y un enum `SignatureMode`. Úsalos
cuando quieras conectar la firma PQC a tu propio flujo en lugar de llamar a las
primitivas directamente.

## Firma híbrida

Una transacción **híbrida** lleva tanto una firma secp256k1 clásica como una firma
ML-DSA-87, de modo que sigue siendo válida bajo verificación clásica mientras gana
protección post-cuántica. La parte post-cuántica viaja como una extensión
`PQCHybridSignature` en la transacción.

:::caution La firma híbrida es obligatoria en la ruta cosmos
A partir de la versión actual de la cadena (**v3.1.77**), el valor predeterminado
de la red es `hybrid_signature_mode = required` con
`allow_classical_fallback = false`. La firma híbrida mediante `buildHybridTx` (con
`includePqcPublicKey`) es **obligatoria** para las transacciones de la ruta cosmos:
las transacciones cosmos solo clásicas se rechazan on-chain. Las transacciones EVM
usan una ruta `eth_secp256k1` separada y no se ven afectadas.
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

Antes de que una transacción híbrida se verifique con PQC on-chain, la clave
pública PQC del firmante debe estar **registrada** mediante el `MsgRegisterPQCKey`
de la cadena, *a menos que* establezcas `includePqcPublicKey: true`, que incrusta
la clave en la extensión para que la cadena pueda autorregistrarla en el primer uso.

### Contrato de la tx híbrida (alto nivel)

La transacción se firma de forma clásica sobre los sign bytes estándar (que
**excluyen** la extensión PQC), y la firma ML-DSA-87 se calcula y se adjunta como
la extensión `PQCHybridSignature`. Como los sign bytes clásicos excluyen la
extensión, la firma clásica sigue siendo válida tanto si un verificador entiende
la parte PQC como si no. Los helpers de más bajo nivel
(`encodeHybridExtension`, `attachHybridExtension`,
`buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`) y los constructores de
extremo a extremo (`buildHybridTx`, `signAndBroadcastHybrid`) se exportan para uso
avanzado.

> El envío de transacciones híbridas es la ruta obligatoria en la red en vivo para
> las transacciones cosmos. Las primitivas locales de firma/verificación y los
> helpers de construcción de tx están disponibles hoy.

## Identificadores de algoritmo

El SDK exporta IDs de algoritmo y helpers para el trabajo a nivel de protocolo:
`AlgorithmUnspecified`, `AlgorithmDilithium5`, `AlgorithmMLKEM1024`,
`algorithmName(id)` e `isSignatureAlgorithm(id)`.
