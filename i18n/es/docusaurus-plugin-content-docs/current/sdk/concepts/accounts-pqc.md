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
saldo, y la única clave es la firmante en todos los carriles (en el carril EVM
dentro de una [ventana de autorización](/sdk/guides/evm#evm-window); el carril
de transacciones SVM está actualmente desactivado en toda la red, por lo que
SVM es hoy de solo lectura):

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
account.publicKey;    // "0x…" hex string of the 33-byte compressed secp256k1 key
account.privateKey;   // "0x…" hex string (a secret: never log or commit it)
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
campo del mnemónico es `"seed:" + hex(seed32)`.) Desde el SDK 0.8.3,
`derivePqcCanonical(account, mnemonic)` resuelve primero `account` a su forma
`qor1…` en minúsculas (`canonicalAccount`), de modo que un bech32 en
mayúsculas o la forma `0x` de la misma cuenta produce la misma clave.
Todos los lenguajes tienen la misma función (Python `derive_pqc_canonical`, Go
`authenticator.DerivePQCCanonical`, Rust `try_derive_pqc_canonical`, Java
`Authenticator.derivePqcCanonical`; consulta la
[tabla de la guía Firma híbrida](/sdk/guides/quantum-safe#canonical-derivation)),
y el mismo `{ address, mnemonic }` da la misma clave en todos ellos
(comprobado para TypeScript, Python, Go y Rust en octubre de 2026).

### Envío en el carril Native con la clave eth

Una cuenta unificada firma las transacciones de la ruta Native con el
esquema `eth_secp256k1`: la firma clásica es secp256k1 sobre **keccak256**
de los bytes del SignDoc (no sha256), y la clave pública de `SignerInfo` usa
la URL de tipo `/cosmos.evm.crypto.v1.ethsecp256k1.PubKey`. La ruta híbrida
(`signHybridEth`, o `EthNativeSigner` con su `signMode: "hybrid"`
predeterminado) además adjunta la extensión `PQCHybridSignature` de
ML-DSA-87, obligatoria en las redes activas.

Se necesitan dos cosas antes del primer envío híbrido. Primero, la clave
ML-DSA-87 de la cuenta debe estar **registrada** (una sola vez). El registro
es la única transacción firmada de forma clásica y exenta de la regla
híbrida: fírmala con `signMode: "classical"`. El `publicKey` de la cuenta es
una cadena hexadecimal `0x`, así que decodifícala a bytes para
`ecdsaPubkey`. Segundo, pasa `rest` al firmante para que pueda preguntar a la
red qué [forma de sign-bytes](#sign-bytes-versions) verifica (en
`qorechain-vladi` y `qorechain-diana` lanza un error en lugar de adivinar).
Requiere el SDK 0.8.1 o posterior (0.9.0 para los helpers de prueba de posesión)
y `npm i @cosmjs/stargate`:

```ts
import { StargateClient } from "@cosmjs/stargate";
import {
  createClient,
  deriveUnifiedAccount,
  EthNativeSigner,
  buildRegisterPqcKeyMsg,
  signProofOfPossession,
  toBase,
} from "@qorechain/sdk";

const REST = "https://api.qore.host";
const RPC = "https://rpc.qore.host";
const CHAIN_ID = "qorechain-vladi";

const client = createClient({ network: "mainnet", endpoints: { rest: REST, rpc: RPC } });
const transport = await StargateClient.connect(RPC);
const account = await deriveUnifiedAccount(mnemonic);

// The REST account record carries the number and sequence (the account must
// exist, that is, have received funds).
async function authInfo() {
  const { account: base } = await client.rest.get<{
    account: { account_number: string; sequence: string };
  }>(`/cosmos/auth/v1beta1/accounts/${account.cosmos}`);
  return { accountNumber: BigInt(base.account_number), sequence: BigInt(base.sequence) };
}

// 1) Register the ML-DSA-87 key once (classical-signed, exempt from the hybrid rule).
const classical = new EthNativeSigner(account, { signMode: "classical" });
await classical.signAndBroadcast(transport, {
  chainId: CHAIN_ID,
  ...(await authInfo()),
  messages: [
    buildRegisterPqcKeyMsg(account.cosmos, {
      pqcKeypair: account.pqc,
      ecdsaPubkey: Uint8Array.from(Buffer.from(account.publicKey.slice(2), "hex")),
      // Optional since v3.2.3 (SDK 0.9.0+): the new key signs a proof that its owner
      // holds the secret. Leave it out on a network that has not applied v3.2.3,
      // because an older node refuses the whole transaction when the field is set.
      proofOfPossession: signProofOfPossession({
        chainId: CHAIN_ID,
        account: account.cosmos,
        keypair: account.pqc,
      }),
    }),
  ],
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" }, // the 2,592-byte key needs about 600k gas
});

// 2) Send with the hybrid signature (the default signMode).
const signer = new EthNativeSigner(account, { rest: REST });
const res = await signer.bankSend(
  transport,
  "qor1recipient…",
  [{ denom: "uqor", amount: toBase("1.5") }],
  {
    chainId: CHAIN_ID,
    ...(await authInfo()),
    fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" }, // 0.1 uqor per gas is the floor
  },
);
console.log(res.transactionHash);
```

Para un control de más bajo nivel, `signHybridEth(params)` /
`signClassicalEth(params)` devuelven los bytes ensamblados de `TxRaw` y los
artefactos de firma, y `accountAuthInfo(baseAccount)` lee `account_number` /
`sequence` de un `BaseAccount` protobuf cuya clave pública on-chain usa la URL
de tipo `eth_secp256k1` (una cuenta JSON de REST necesita que sus campos se
mapeen primero, como hace `authInfo` arriba).

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

### Phantom y otros wallets externos {#phantom}

:::danger Eliminado en el SDK 0.8.0
Los SDK 0.6.0 a 0.7.0 incluían `connectPhantomUnified()` y `unifiedAccountFromPhantomSignature()` (eliminadas en 0.8.0; en Python y Rust, `unified_account_from_phantom_signature`; en Go, `unified.UnifiedAccountFromPhantomSignature`; en Java, `UnifiedAccounts.unifiedAccountFromPhantomSignature`), que derivaban la clave de gasto de una cuenta a partir de una firma de Phantom sobre el mensaje fijo `QoreChain unified account derivation v1` seguido de la clave pública base58 del wallet.
Una firma ed25519 es determinista y cualquier sitio web puede pedir al wallet que firme ese mismo mensaje, así que quien haya obtenido alguna vez la firma puede reconstruir las claves secp256k1 y ML-DSA de la cuenta. Ambas funciones lanzan ahora un error.

Si creaste una cuenta de esta forma, considérala comprometida desde ya: crea una cuenta nueva a partir de un mnemónico, mueve los fondos a ella y después vincula Phantom a la nueva cuenta como autenticador (ver abajo). La cuenta antigua no se puede reparar, porque su dirección está ligada a la clave expuesta y una rotación de la clave PQC solo sustituye la mitad poscuántica. Usa el SDK 0.8.2 o posterior.
:::

Para que una clave de Phantom (o MetaMask) gaste desde una cuenta, usa los **carriles de autenticador**: registra la clave del wallet con `MsgRegisterAuthenticator` y luego gasta desde la cuenta PQC canónica mediante `MsgExecuteCosmos` / `MsgExecuteEVM` bajo un permiso y una `SpendingRule`. La cuenta conserva sus propias claves derivadas del mnemónico y la clave del wallet se puede revocar en cualquier momento. Consulta [Autenticadores y gasto delegado](/sdk/guides/authenticators). Ten en cuenta que el módulo `abstractaccount` que ofrece estos carriles está desactivado en mainnet (`GET /qorechain/abstractaccount/v1/config` muestra `enabled: false`; en la testnet está activado), así que todavía no se puede vincular una clave de wallet en mainnet; hasta entonces, usa directamente la nueva cuenta del mnemónico.

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
implementaciones `PqcSigner` y `HybridSigner`, y un tipo `SignatureMode`
(`"classical" | "pqc" | "hybrid"`). Úsalos cuando quieras integrar la firma
PQC en tu propio flujo en lugar de llamar directamente a las primitivas.

## Firma híbrida {#hybrid-signing}

Una transacción **híbrida** lleva tanto una firma clásica secp256k1 como una
firma ML-DSA-87, de modo que sigue siendo válida bajo verificación clásica
mientras gana protección poscuántica. La parte poscuántica viaja como una
extensión `PQCHybridSignature` en la transacción.

:::caution La firma híbrida es obligatoria en la ruta Native
Desde la versión de cadena **v3.2.0** (la mainnet ejecuta la v3.2.4, la testnet la v3.2.6), el valor predeterminado de la red es `hybrid_signature_mode = required` con
`allow_classical_fallback = false`. La firma híbrida mediante
`buildHybridTx` / `signAndBroadcastHybrid` (pasa `rest`), o `signHybridEth` /
`EthNativeSigner` para cuentas unificadas eth-native, es **obligatoria** para
las transacciones de la ruta Native; las transacciones Native solo-clásicas
son rechazadas on-chain. Las transacciones EVM son un carril independiente,
pero desde v3.2.0 solo se admiten desde una cuenta con una clave ML-DSA-87
registrada y una [ventana de autorización](/sdk/guides/evm#evm-window)
abierta.
:::

:::caution Las transacciones híbridas del SDK ≤ 0.6.0 son rechazadas
La versión 0.6.1 corrigió la codificación de la extensión
`PQCHybridSignature` (JSON → protobuf, crítico para el consenso). Las
transacciones híbridas construidas con SDK 0.6.0 o anterior fallan en
CheckTx con un error de análisis de la transacción — actualiza a 0.6.1+.
:::

El constructor de extremo a extremo para una cuenta con coin type 118 es
`signAndBroadcastHybrid` (o `buildHybridTx` para construir sin difundir).
Necesita el firmante clásico, el par de claves ML-DSA-87 de la cuenta, el
número de cuenta y la secuencia, y `rest`.
Para una cuenta con coin type 118 en TypeScript, el camino más corto es el
`TxClient` híbrido (SDK 0.9.0): pasa el par de claves al conectarte y cada
transacción se firma de forma híbrida, con `fee: "auto"` simulando la propia
transacción híbrida (solo el registro permanece clásico):

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  toBase,
} from "@qorechain/sdk";

const client = createClient({
  network: "mainnet",
  endpoints: { rest: "https://api.qore.host", rpc: "https://rpc.qore.host", evmRpc: "https://evm.qore.host" },
});
const account = await deriveNativeAccount(mnemonic);                  // coin type 118
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);     // the key registered on-chain

const tx = await client.connectTx(signer, { pqcKeypair });            // signs every transaction hybrid
await tx.bankSend("qor1recipient…", [{ denom: "uqor", amount: toBase("1.5") }]);
```

Con control explícito sobre la comisión, el número de cuenta y la secuencia,
usa `signAndBroadcastHybrid` (SDK 0.8.1 o posterior, `npm i @cosmjs/stargate`):

```ts
import { StargateClient } from "@cosmjs/stargate";
import {
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  signAndBroadcastHybrid,
  qorechainRegistry,
  MSG_SEND_TYPE_URL,
  toBase,
} from "@qorechain/sdk";

const REST = "https://api.qore.host";
const RPC = "https://rpc.qore.host";

const account = await deriveNativeAccount(mnemonic);                  // coin type 118
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);     // the key registered on-chain
const transport = await StargateClient.connect(RPC);
const info = await transport.getSequence(account.address);            // { accountNumber, sequence }

const result = await signAndBroadcastHybrid({
  registry: qorechainRegistry(),
  signer,
  pqcKeypair,
  messages: [
    {
      typeUrl: MSG_SEND_TYPE_URL,
      value: {
        fromAddress: account.address,
        toAddress: "qor1recipient…",
        amount: [{ denom: "uqor", amount: toBase("1.5") }],
      },
    },
  ],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" }, // 0.1 uqor per gas is the floor
  chainId: "qorechain-vladi",
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: REST,        // lets the SDK pick the v1/v2 PQC sign-bytes form
  transport,
});
```

### Requisito previo on-chain

Antes de que una transacción híbrida pueda verificarse mediante PQC, la clave
pública PQC del firmante debe estar **registrada** con `MsgRegisterPQCKeyV2`
(firmada de forma clásica, exenta de la regla híbrida para una cuenta que aún
no tiene ninguna clave). Lo hacen
`ensurePqcRegistered` / `buildRegisterPqcKeyMsg` del SDK, `qorechaind tx pqc
register-key` o un wallet de QoreChain. `includePqcPublicKey: true` solo
incrusta la clave en la extensión; **no** la registra, y la cadena no registra
una clave en el primer uso. Desde v3.2.3 la cadena rechaza las claves débiles,
degeneradas y reutilizadas, y acepta una prueba de posesión opcional (consulta
[Reglas de integridad de claves](/architecture/post-quantum-security#key-integrity)).
En el SDK 0.9.0, `ensurePqcRegistered` adjunta la prueba por sí mismo una vez que
la red haya aplicado v3.2.3, y `signProofOfPossession` / `verifyProofOfPossession`
se exportan para registros construidos a mano; los constructores de la 0.8.x
registran sin prueba, lo cual está permitido.

### ¿Qué forma de sign-bytes? {#sign-bytes-versions}

La mitad ML-DSA-87 de una transacción híbrida se firma sobre una de dos formas
de bytes, y una red verifica exactamente una en cada altura:

```text
v1: BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A
v2: "qorechain-pqc-hybrid-v2" ‖ BE64(len chainId) ‖ chainId ‖ BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A
```

`B0` es el cuerpo de la transacción sin la extensión PQC y `A` los bytes de
`AuthInfo`. `qorechain-vladi` y `qorechain-diana` verifican ambas **v2**. El
cambio quedó registrado con el nombre de actualización `v3.2.0` en la mainnet
y con `v3.1.98` (después `v3.2.0`) en la testnet, así que un cliente debe
consultar `GET /cosmos/upgrade/v1beta1/applied_plan/{name}` para **ambos**
nombres y usar v2 si alguna de las alturas es mayor que cero. El SDK lo hace
por ti: cada constructor híbrido acepta `signBytesVersion` (`"auto"` por
defecto, o `"v1"` / `"v2"`), y `"auto"` necesita la URL REST de la red
(`rest`) en estas dos cadenas: lanza un error en lugar de adivinar. Las rutas
de alto nivel vuelven a resolver y reintentan una vez cuando la cadena rechaza
la firma con el código `pqc` 21. En las pruebas unitarias pasa
`signBytesVersion` de forma explícita para que la prueba no dependa de un nodo
activo. Consulta también
[Solución de problemas del código 21](/developer-guide/post-quantum-signing#code-21).

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
