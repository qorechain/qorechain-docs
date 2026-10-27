---
slug: /qoresign/overview
title: Descripción general de QoreSign
sidebar_label: Descripción general
sidebar_position: 1
---

# QoreSign

QoreSign es una biblioteca de código abierto para la firma híbrida secp256k1 + ML-DSA-87 (FIPS 204) en QoreChain, pensada para carteras, exchanges, custodios y backends.

QoreSign permite que una cartera distinta de la propia de QoreChain derive la clave ML-DSA-87 de una cuenta, firme transacciones del carril nativo con ambas claves, verifique firmas híbridas de forma local, firme mensajes arbitrarios, simule una transacción antes de firmarla, lea cómo se protegió una transacción confirmada e implemente Sign In With QoreChain. Es una capa delgada sobre los bindings de [`qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) y no añade primitivas criptográficas propias. La mantiene la QoreChain Association bajo la licencia Apache-2.0.

La versión actual es la **0.1.1** (27 de octubre de 2026). Está publicada en TypeScript, Rust, Go, Kotlin (JVM y Android), Swift y, como novedad de la 0.1.1, Python. El código fuente, los ejemplos y los vectores de prueba están en el repositorio [qorechain/qoresign](https://github.com/qorechain/qoresign). Funciona en mainnet (`qorechain-vladi`) y en la testnet (`qorechain-diana`).

## Qué hace QoreSign en cada carril {#lanes}

| Carril | Qué hace QoreSign hoy |
|---|---|
| **Nativo** (Cosmos SDK) | Firma y verificación híbridas. La red exige por defecto la firma ML-DSA-87. |
| **EVM** | Solo ventana de autorización: la cuenta registra una clave ML-DSA-87 y abre desde el carril nativo una ventana de autorización acotada. Las transacciones de Ethereum en sí no llevan ninguna firma ML-DSA-87. |
| **SVM** | Aún no está abierto en la red (`LANE_NOT_AVAILABLE`). |

La firma híbrida en EVM requiere antes soporte PQC por carril en la red. Consulta [Carteras EVM: ventana de autorización](/qoresign/guides/evm-quantum-ready).

## Qué hace {#what-it-does}

Núcleo sin conexión, igual en todos los lenguajes:

- Deriva la clave clásica en `m/44'/118'/0'/0/0` (`deriveClassicalKey`) y la clave ML-DSA-87 canónica que las carteras de QoreChain registran para una cuenta (`deriveCanonicalPqKey`, ligada al mnemónico y a la dirección). Existe una derivación HD endurecida como borrador (`deriveHdPqKey`); `pqKeyFromSeed` reconstruye un par de claves a partir de su semilla de 32 bytes.
- Construye y analiza direcciones `qor1` para cuentas `secp256k1` y `eth_secp256k1`.
- Firma una transacción del carril nativo con ambas claves (`signHybrid`), o añade solo la capa ML-DSA-87 a un cuerpo que construyó una dApp (`signPqLayer`). Las firmas ML-DSA-87 son deterministas por defecto; la firma hedged es una opción, y la red acepta ambas. secp256k1 usa RFC 6979 con low-S.
- Calcula los sign-bytes híbridos v1 y v2 (`hybridSignBytes`) y verifica una transacción híbrida completa (`verifyHybridTx`) o solo la capa ML-DSA-87 (`verifyPqLayer`).
- Construye `MsgRegisterPQCKeyV2` con una prueba de posesión (`buildRegisterPqKeyMessage`, `signProofOfPossession`) y rechaza las claves públicas degeneradas.
- Firma y verifica mensajes arbitrarios (`signMessage`, `verifyMessage`) e implementa Sign In With QoreChain v1 (`createSiwqMessage`, `signSiwq`, `verifySiwq`).
- Aplica las reglas de carril en código (`decideLane`, `assertHybridLane`, `evaluateLayerState`). Los errores llevan un código estable compartido por todos los lenguajes (`QoreSignError`, por ejemplo `INVALID_MNEMONIC`, `LANE_NOT_AVAILABLE`, `KEY_NOT_REGISTERED`).

Helpers de red (TypeScript `@qorechain/qoresign/network`; Go `github.com/qorechain/qoresign/go/network` los tiene todos excepto los dos nuevos):

- `fetchPqKeyStatus`: indica si hay una clave ML-DSA-87 registrada para una dirección y cuál es.
- `resolveSignBytesVersion`: qué forma de sign-bytes verifica la red.
- `simulateTx` (gas usado, límite de gas sugerido, cambios de saldo por dirección), `suggestGasLimit`, `broadcastTx` y `submitWithSignBytesFallback` (un reintento con la otra forma de sign-bytes cuando la red rechaza la primera).
- `assertPqLayerMatchesRegisteredKey`: comprueba una capa aportada por una dApp contra la clave en la cadena antes de que la cartera añada su firma clásica.
- `verifySiwqWithChain` y `verifyMessageWithChain`: verificación contra la clave registrada en la cadena.
- `fetchCommittedExtensionTypeUrls`: lee qué extensiones llevaba una transacción confirmada.
- Novedad de la 0.1.1, solo TypeScript: `inspectTransaction` y `fetchEvmWindow`, descritos más abajo.

## Novedades de la 0.1.1 {#new-in-0-1-1}

- **Python.** El paquete `qorechain-qoresign` (import `qoresign`) está en PyPI, con wheels para macOS y Linux. Enlaza la implementación de Rust y reproduce los mismos vectores de prueba. Funciona sin conexión, como los bindings de Swift y Kotlin: sin helpers de red.
- **Inspector de transacciones (biblioteca).** `inspectTransaction` lee una transacción confirmada e informa de cómo se protegió. Consulta [Inspector de transacciones](#inspector).
- **Lector de la ventana EVM.** `fetchEvmWindow` lee la ventana de autorización EVM de una cuenta.
- **Correcciones de empaquetado.** El archivo del framework binario de Swift ya no contiene una carpeta de resource fork sobrante, y las bibliotecas nativas de macOS de los paquetes de Kotlin y Python ya no registran el directorio de compilación como su install name.

## Inspector de transacciones {#inspector}

`inspectTransaction({ rest, chainId, txhash, rpc? })` es una función de solo lectura de `@qorechain/qoresign/network`. Obtiene una transacción confirmada y devuelve:

- los mensajes, el memo, el código de resultado, la altura y la comisión;
- el firmante: dirección, tipo de clave, clave pública y secuencia;
- si la firma clásica se verifica;
- el estado de la capa ML-DSA-87: presente o no, cuántas capas, si la capa se verifica contra la clave que el firmante tiene registrada ahora y qué forma de sign-bytes usó;
- un nivel de seguridad, con la misma clasificación que el explorador público: `pqc` (lleva la capa ML-DSA-87), `enrollment` (registra o rota una clave ML-DSA-87, que por diseño se firma con la clave clásica), `shake` (una transacción del carril nativo sin la capa) o `classical` (una transacción del carril EVM).

Devuelve `undefined` para un hash que la red no conoce. Pasa un endpoint `rpc` para leer de un nodo los bytes exactos confirmados; sin él, la función usa bytes que la pasarela REST vuelve a codificar. No envía nada y no necesita cuenta ni clave.

```js
import { fetchEvmWindow, fetchPqKeyStatus, inspectTransaction } from "@qorechain/qoresign/network";

const rest = "https://api-testnet.qore.host";
const address = "qor178nscfyp0cq2ac5x7un4u98xrj4ayp6pt0kw08"; // public testnet faucet account

const status = await fetchPqKeyStatus({ rest, address });
console.log("ML-DSA-87 key registered:", status.registered);

const tx = await inspectTransaction({ rest, chainId: "qorechain-diana", txhash: process.argv[2] });
console.log(tx?.tier, tx?.pqLayer, tx?.messages.map((m) => m.typeUrl));

const win = await fetchEvmWindow({ rest, address });
console.log("EVM window:", win.found, win.live);
```

Guárdalo como `inspect.mjs` y ejecuta `node inspect.mjs <txhash>` con el hash de una transacción de testnet. Ejecutado contra una transferencia reciente del faucet en la testnet, imprimió `ML-DSA-87 key registered: true`, nivel `pqc`, `pqLayer { present: true, count: 1, algorithmId: 1, verified: true, signBytesVersion: 'v2' }`, el mensaje `/cosmos.bank.v1beta1.MsgSend` y `EVM window: false false`.

`fetchEvmWindow({ rest, address })` devuelve `found`, `live`, las alturas de apertura y de expiración, el máximo y lo usado de transacciones y de valor, los bloques, transacciones y valor restantes, `nativeOnly` y `allowedTargets`.

Esta es la función de la biblioteca. La página [Developers](/dashboard/developers) del dashboard aún no tiene una pestaña de inspector de transacciones.

## Para qué se usa {#use-cases}

1. **Una cartera compatible con Keplr añade la firma híbrida de QoreChain.** Leap, Cosmostation o una cartera nueva produce la firma secp256k1 mediante `signDirect`. Con QoreSign deriva la clave ML-DSA-87 de la cuenta a partir del mismo mnemónico y añade la capa (`signPqLayer`) antes de firmar. Consulta [la guía para carteras](/qoresign/guides/keplr-compatible-wallets).
2. **Un exchange o custodio firma retiros en sus propios servidores.** Un servicio de cartera caliente o tibia en Go o Rust firma transferencias del carril nativo con `signHybrid`, las simula antes (`simulateTx`, Go y TypeScript) para ver los cambios de saldo y el gas, y las difunde con `submitWithSignBytesFallback`. El [custody kit](/developer-tools/custody-kit) se apoya en esto.
3. **Un backend implementa Sign In With QoreChain.** El servidor emite un nonce de un solo uso, la cartera firma un mensaje de inicio de sesión y el servidor llama a `verifySiwqWithChain`. Consulta [la guía de inicio de sesión](/qoresign/guides/sign-in).
4. **Una herramienta de cumplimiento o soporte comprueba cómo se protegió una transacción.** `inspectTransaction` informa de si una transacción confirmada llevaba una capa ML-DSA-87 verificada, qué forma de sign-bytes usó y cuál es su nivel.
5. **Una cartera muestra la ventana de autorización de una cuenta EVM.** Antes de que un usuario envíe desde una cartera EVM, `fetchEvmWindow` muestra si hay una ventana activa y cuántas transacciones y cuánto valor quedan.
6. **Un equipo de Python firma informes o aprobaciones.** `qoresign.sign_message` produce una firma híbrida sobre bytes arbitrarios que cualquier otro lenguaje de QoreSign puede verificar.
7. **Una cartera móvil en iOS o Android.** El paquete de Swift y el AAR de Android ofrecen la misma derivación, firma e inicio de sesión que el paquete de TypeScript, byte por byte.
8. **Auditores e integradores verifican firmas sin conexión.** `verifyHybridTx`, `verifyPqLayer` y `verifyMessage` se ejecutan sin red, dadas las claves públicas.

## Cómo funciona {#how-it-works}

- **Una transacción híbrida** es un `TxRaw` ordinario de Cosmos SDK firmado dos veces por la misma cuenta: una firma ML-DSA-87 incluida en el cuerpo de la transacción como opción de extensión `/qorechain.pqc.v1.PQCHybridSignature` (id de algoritmo `1`), y una firma secp256k1 `SIGN_MODE_DIRECT` sobre el cuerpo final.
- **Los sign-bytes v2** (que hoy verifican ambas redes públicas) son `"qorechain-pqc-hybrid-v2"`, seguido del chain id, el cuerpo sin la extensión PQC y la auth info, cada uno con un prefijo de longitud. Por tanto, la firma ML-DSA-87 cubre la comisión. La firma clásica cubre el cuerpo final, incluida la extensión. La v1 se conserva para reproducir firmas antiguas. Consulta [Firma híbrida de transacciones v1](/qoresign/spec/hybrid-signing-v1).
- **Orden:** codifica el cuerpo y la auth info, calcula los sign-bytes y la firma ML-DSA-87, añade la extensión, firma después el SignDoc con secp256k1 y difunde.
- **Registro:** `MsgRegisterPQCKeyV2` lleva la clave pública ML-DSA-87, la clave secp256k1 comprimida de la cuenta y una prueba de posesión. La transacción de registro se firma solo con la clave clásica.
- **Separación de dominios:** toda firma ML-DSA-87 empieza con un prefijo reservado, de modo que una firma de mensaje o de inicio de sesión nunca puede reutilizarse como firma de transacción.
- **Qué hay en la cadena:** la clave pública ML-DSA-87 registrada, las transacciones híbridas y las ventanas EVM. Las claves, la firma y la verificación ocurren en el dispositivo o servidor que ejecuta QoreSign.
- **Vectores de prueba compartidos:** los formatos de red se versionan por separado de los paquetes y están cubiertos por [vectores de prueba](/qoresign/vectors) que todos los lenguajes reproducen byte por byte.

Tamaños (FIPS 204 y la [guía de tamaños](/qoresign/guides/sizes-and-transport)): una clave pública ML-DSA-87 ocupa 2.592 bytes, la clave secreta 4.896 bytes, una firma 4.627 bytes y la semilla 32 bytes. Una transacción híbrida es unos 4,7 KB mayor que una clásica, así que simula antes de firmar. Una firma o una clave pública no cabe en un único código QR estático; los firmantes aislados (air-gapped) necesitan QR de varias partes. Conserva la semilla de 32 bytes, no la clave secreta.

## Paquetes {#packages}

| Lenguaje | Paquete | Instalación | Plataforma mínima |
|---|---|---|---|
| TypeScript | [`@qorechain/qoresign`](https://www.npmjs.com/package/@qorechain/qoresign) | `npm install @qorechain/qoresign` | Node.js 20 o posterior; navegadores |
| Rust | [`qorechain-qoresign`](https://crates.io/crates/qorechain-qoresign) (nombre de la biblioteca `qoresign`) | `cargo add qorechain-qoresign` | Rust estable |
| Go | [`github.com/qorechain/qoresign/go`](https://pkg.go.dev/github.com/qorechain/qoresign/go) | `go get github.com/qorechain/qoresign/go@v0.1.1` | Go 1.25 |
| Python | [`qorechain-qoresign`](https://pypi.org/project/qorechain-qoresign/) (import `qoresign`) | `pip install qorechain-qoresign` | Python 3.9+; wheels para macOS 11+ (arm64, x86_64) y Linux (x86_64, aarch64); aún no hay wheel para Windows, otras plataformas compilan desde la distribución de código fuente (requiere Rust 1.95) |
| Swift | `QoreSign` de [`github.com/qorechain/qoresign`](https://github.com/qorechain/qoresign) (framework binario en la release de GitHub) | `.package(url: "https://github.com/qorechain/qoresign", from: "0.1.1")`, producto `QoreSign` | iOS 16, macOS 13 |
| Kotlin / JVM | [`io.github.qorechain:qoresign`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) | `implementation("io.github.qorechain:qoresign:0.1.1")` | Java 17, Kotlin 2.3 o posterior; bibliotecas nativas para macOS (arm64, x86-64), Linux (x86-64, arm64) y Windows (x86-64) |
| Android | [`io.github.qorechain:qoresign-android`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign-android) | `implementation("io.github.qorechain:qoresign-android:0.1.1")` | API 24, Kotlin 2.3 o posterior; `arm64-v8a`, `armeabi-v7a`, `x86_64`; reglas keep de R8 incluidas |

:::note Versión del compilador de Kotlin
Los artefactos de Kotlin y Android necesitan el compilador de **Kotlin 2.3 o posterior** en tu proyecto. Un proyecto con Kotlin 2.1 falla al compilar contra ellos. Sube la versión de Kotlin de la compilación antes de añadir la dependencia.
:::

Todas las implementaciones se comprueban a sí mismas con los mismos [vectores de prueba](/qoresign/vectors).

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

El [Inicio rápido](/qoresign/quickstart) ejecuta el mismo flujo de principio a fin, sin conexión, e incluye los inicios rápidos de firma de mensajes para Python y Go.

## API principal {#main-api}

Los nombres se dan en la forma de TypeScript. Go usa los mismos nombres con su capitalización (`SignHybrid`, `VerifySiwq`); Rust y Python usan snake_case (`sign_hybrid`); Swift y Kotlin usan camelCase sobre el núcleo de Rust.

| Nombre | Qué hace | Dónde |
|---|---|---|
| `deriveClassicalKey`, `deriveCanonicalPqKey`, `pqKeyFromSeed`, `classicalKeyFromPrivate` | claves a partir de un mnemónico, una semilla o bytes sin procesar | todos |
| `deriveHdPqKey` | derivación HD endurecida de claves ML-DSA-87 (borrador, puede cambiar) | todos |
| `addressFromPublicKey`, `addressFromBytes`, `parseAddress` | direcciones `qor1` | todos |
| `signHybrid`, `signPqLayer`, `hybridSignBytes` | firma híbrida y sign-bytes v1 o v2 | todos |
| `verifyHybridTx`, `verifyPqLayer` | verificación local | todos |
| `buildRegisterPqKeyMessage`, `signProofOfPossession`, `verifyProofOfPossession` | registro de claves con prueba de posesión | todos |
| `signMessage`, `verifyMessage` | firma de mensajes arbitrarios (ADR-36 más ML-DSA-87) | todos |
| `createSiwqMessage`, `parseSiwqMessage`, `signSiwq`, `verifySiwq` | Sign In With QoreChain v1 | todos |
| `decideLane`, `assertHybridLane`, `evaluateLayerState` | reglas de carril; detección de una capa descartada | todos |
| `fetchPqKeyStatus`, `resolveSignBytesVersion`, `simulateTx`, `suggestGasLimit`, `broadcastTx`, `submitWithSignBytesFallback`, `assertPqLayerMatchesRegisteredKey`, `verifySiwqWithChain`, `verifyMessageWithChain`, `fetchCommittedExtensionTypeUrls` | helpers de red | TypeScript, Go |
| `inspectTransaction`, `fetchEvmWindow` | leer una transacción confirmada; leer una ventana EVM (0.1.1) | TypeScript |

En Go los helpers de red son métodos de un cliente: `client := network.NewClient("https://api-testnet.qore.host")`, y después `client.VerifySiwqWithChain(ctx, address, qoresign.VerifySiwqOptions{...})` o `client.SimulateTx(...)`. Los errores de Python son `QoreSignError` con `code` y `detail`; los campos de bytes son `bytes`.

Referencia de la API: en un clon del repositorio, ejecuta `pnpm -C packages/ts docs` (TypeScript), `cargo doc -p qorechain-qoresign` (Rust) o `go doc github.com/qorechain/qoresign/go` (Go). Los bindings de Swift, Kotlin y Python reflejan la API de Rust; consulta los README de [Swift](https://github.com/qorechain/qoresign/tree/main/swift), [Kotlin](https://github.com/qorechain/qoresign/tree/main/kotlin) y [Python](https://github.com/qorechain/qoresign/tree/main/python).

## Redes y requisitos {#networks}

| | Mainnet | Testnet |
|---|---|---|
| Chain id | `qorechain-vladi` (chain id EVM 9801) | `qorechain-diana` (chain id EVM 9800) |
| REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM | `https://evm.qore.host` | `https://evm-testnet.qore.host` |
| Sign-bytes verificados | v2 | v2 |

- **Carril nativo:** la red exige por defecto la firma ML-DSA-87. Quedan exentos: el registro de la clave ML-DSA-87 de una cuenta y un unjail por parte de una cuenta sin clave. La cuenta debe tener su clave registrada (`MsgRegisterPQCKeyV2`) antes de que las transacciones híbridas se verifiquen; las carteras de QoreChain la registran al crear la cuenta.
- **Carril EVM:** una cuenta con una clave ML-DSA-87 registrada abre una ventana de autorización acotada (altura de expiración, máximo de transacciones, valor máximo, contratos permitidos opcionales) con una transacción del carril nativo firmada de forma híbrida. Fuera de una ventana activa, la red rechaza las transacciones EVM de la cuenta. Las lecturas y la estimación de gas no necesitan ventana.
- **Comisiones:** denom `uqor` (6 decimales), precio mínimo de gas de 0,1 uqor por unidad de gas.
- **Valores de registro en Keplr:** prefijo bech32 `qor`, coin type `118`.
- **Cuentas:** ninguna para las funciones sin conexión. Los helpers de red solo necesitan un endpoint REST; difundir requiere una cuenta con fondos y con una clave ML-DSA-87 registrada.

## Documentación {#documentation}

- [Inicio rápido](/qoresign/quickstart): deriva claves, firma y verifica una transacción híbrida en pocos minutos.
- Guías
  - [Añadir firma híbrida a una cartera compatible con Keplr](/qoresign/guides/keplr-compatible-wallets)
  - [Sign In With QoreChain: verificación en el servidor](/qoresign/guides/sign-in)
  - [Carteras EVM: ventana de autorización](/qoresign/guides/evm-quantum-ready)
  - [Derivación de claves: claves canónicas y el borrador HD](/qoresign/guides/key-derivation)
  - [Tamaños y transporte](/qoresign/guides/sizes-and-transport)
- Especificaciones
  - [Firma híbrida de transacciones v1](/qoresign/spec/hybrid-signing-v1)
  - [Sign In With QoreChain v1](/qoresign/spec/siwq-v1)
  - [Firma de mensajes v1](/qoresign/spec/message-signing-v1)
  - [Derivación de claves ML-DSA-87](/qoresign/spec/hd-derivation-draft)
- [Vectores de prueba](/qoresign/vectors)
- [Ejemplos](https://github.com/qorechain/qoresign/tree/main/examples)

## Alcance y límites {#scope}

- QoreSign firma de forma local. No custodia claves por ti, no hace firma por umbral ni MPC, y no firma en carteras de hardware.
- No existe firma EVM híbrida: `assertHybridLane("evm")` lanza `LANE_NOT_AVAILABLE`. Las cuentas EVM usan en su lugar la ventana de autorización. Las transacciones SVM no están abiertas.
- Rust, Swift, Kotlin y Python no tienen código de red. Obtener números de cuenta, simular y difundir queda en tu app, o usa los helpers de TypeScript o Go.
- `inspectTransaction` y `fetchEvmWindow` existen solo en TypeScript. `inspectTransaction` comprueba la capa contra la clave que el firmante tiene registrada ahora, así que tras una rotación de clave una transacción anterior informa `verified: false`.
- La derivación canónica necesita el mnemónico. Las carteras que no lo tienen (claves en hardware) generan una clave aleatoria (`pqKeyFromSeed`) o usan el borrador HD, y registran esa clave. El mnemónico debe estar en forma canónica (minúsculas, espacios simples); otras grafías se rechazan, no se normalizan.
- La derivación HD (`deriveHdPqKey`) es un borrador y puede cambiar.
- Python aún no tiene wheel para Windows. Kotlin y Android necesitan el compilador de Kotlin 2.3 o posterior.
- Las implementaciones de ML-DSA-87 y secp256k1 provienen de `qorechain-pqc` (construido sobre `@noble/post-quantum`, `fips204` y Cloudflare CIRCL) y de `@noble/curves`, `k256` y `decred/secp256k1`.

## Notas de seguridad {#security}

- Las claves nunca salen del proceso que ejecuta QoreSign. No se envía nada a ningún sitio salvo que llames a un helper de red, y estos envían solo datos públicos: direcciones, bytes de transacciones firmadas y hashes.
- Muestra al usuario los mensajes y la comisión de `bodyBytes` y `authInfoBytes` antes de firmar; la firma ML-DSA-87 cubre la comisión.
- Cuando una dApp aporta un cuerpo que ya lleva una capa PQC, compruébalo con `assertPqLayerMatchesRegisteredKey` antes de añadir la firma clásica. Tras la difusión, `evaluateLayerState` con `fetchCommittedExtensionTypeUrls`, o `inspectTransaction`, confirma que la capa llegó a la cadena.
- No firmes nunca bytes sin procesar con la clave ML-DSA-87 fuera de los dominios reservados.
- Los nonces de inicio de sesión son de un solo uso. `verifySiwq` rechaza un inicio de sesión sin la parte ML-DSA-87 salvo que se pase `requirePq: false`; acepta inicios de sesión solo clásicos únicamente cuando tu servicio no necesite la garantía poscuántica.
- Guarda cifrada la semilla ML-DSA-87 de 32 bytes, en lugar de la clave secreta.
- No pongas nunca un mnemónico de mainnet en un script ni en el historial del shell. Los ejemplos usan la frase de prueba pública de BIP-39 (`abandon` once veces, y después `about`); no la financies nunca.
- Comunica las vulnerabilidades de forma privada a security@qore.network, no en issues públicos. Las correcciones de seguridad van a la última versión menor.

## Dónde está publicado {#where-published}

Versiones comprobadas en los registros el 27 de octubre de 2026.

| Registro | Paquete | Versión | Enlace |
|---|---|---|---|
| npm | `@qorechain/qoresign` | 0.1.1 | [npmjs.com](https://www.npmjs.com/package/@qorechain/qoresign) |
| crates.io | `qorechain-qoresign` | 0.1.1 | [crates.io](https://crates.io/crates/qorechain-qoresign) |
| Proxy de módulos de Go | `github.com/qorechain/qoresign/go` | v0.1.1 (tag `go/v0.1.1`) | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qoresign/go) |
| Maven Central | `io.github.qorechain:qoresign` | 0.1.1 | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) |
| Maven Central | `io.github.qorechain:qoresign-android` | 0.1.1 | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoresign-android) |
| PyPI | `qorechain-qoresign` | 0.1.1 (wheels de macOS arm64 y x86_64, Linux x86_64 y aarch64, distribución de código fuente) | [pypi.org](https://pypi.org/project/qorechain-qoresign/) |
| Swift Package Manager | `QoreSign` de `github.com/qorechain/qoresign` | 0.1.1 (binario `QoreSignFFI.xcframework.zip` en la release) | [Release de GitHub](https://github.com/qorechain/qoresign/releases/tag/v0.1.1) |

Repositorio: [github.com/qorechain/qoresign](https://github.com/qorechain/qoresign) (releases v0.1.0 y v0.1.1).

## Páginas relacionadas {#related}

- [Primitivas poscuánticas (`qorechain-pqc`)](/developer-tools/pqc-library): las primitivas ML-DSA-87 bajo QoreSign.
- [QoreChain SDK](/sdk/overview): compositores de transacciones, mensajes de la ventana EVM y detección de funciones.
- [Wallet adapter](/developer-tools/wallet-adapter): la alternativa del lado de la dApp cuando no se puede cambiar la cartera. La dApp conserva la clave ML-DSA-87 y pide a la cartera sin cambios el `signDirect`; los bytes son los mismos que los de QoreSign.
- [QoreSeal](/developer-tools/qoreseal): cifrado hacia cuentas; sus tarjetas de destinatario son firmas de mensaje de QoreSign.
- [Custody kit](/developer-tools/custody-kit): detección de depósitos y verificación de retiros construidas sobre QoreSign.
- [Servidor MCP de QoreChain](/developer-tools/mcp): su herramienta `get_pq_status` usa QoreSign para verificar la capa híbrida.
- [Firma poscuántica](/developer-guide/post-quantum-signing) e [Integración para exchanges](/developer-guide/exchange-integration).
- [Resumen de paquetes para desarrolladores](/developer-tools/overview).

## Versionado {#versioning}

QoreSign es pre-1.0: las versiones menores pueden cambiar la API, y cada cambio incompatible figura en el [registro de cambios](https://github.com/qorechain/qoresign/blob/main/CHANGELOG.md). Los formatos de red se versionan por separado (las especificaciones `v1` y `vectors/qoresign-v1.json`) y no cambian dentro de una versión.

## Contribuciones y seguridad {#contributing}

Consulta [CONTRIBUTING.md](https://github.com/qorechain/qoresign/blob/main/CONTRIBUTING.md). Comunica las vulnerabilidades de forma privada a security@qore.network, como se describe en [SECURITY.md](https://github.com/qorechain/qoresign/blob/main/SECURITY.md).

## Licencia {#license}

[Apache-2.0](https://github.com/qorechain/qoresign/blob/main/LICENSE). Copyright 2026 QoreChain Association.
