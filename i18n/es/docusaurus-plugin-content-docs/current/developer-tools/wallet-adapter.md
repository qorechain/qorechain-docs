---
slug: /developer-tools/wallet-adapter
title: Wallet Adapter
sidebar_label: Wallet adapter
sidebar_position: 2
---

# Wallet adapter (`@qorechain/wallet-adapter`)

`@qorechain/wallet-adapter` añade QoreChain a los monederos de Cosmos que exponen `signDirect` (Keplr, Leap, Cosmostation) y construye las transacciones que exige la cadena: una transacción del carril nativo debe llevar una firma ML-DSA-87 (FIPS 204) junto a la firma secp256k1 clásica de la cuenta, y un monedero estándar no puede producir la firma ML-DSA-87. El adapter la produce, la coloca en el cuerpo de la transacción y luego pide al monedero, sin modificar, una firma ordinaria. Está pensado para desarrolladores de dApps y monederos, y para quienes crean herramientas que necesitan en JavaScript monederos unificados de QoreChain, mensajes de la ventana de autorización EVM o mensajes de claves vinculadas (authenticators). La versión actual es la 0.4.0.

Si solo necesitas que una dApp envíe una transacción desde el monedero QoreX de un usuario, el camino más corto es [`qorexSignAndBroadcast`](#qorex) de este paquete, o los paquetes de QoreX listados en el índice de [Paquetes para desarrolladores](/developer-tools/overview#group-qorex). Si estás escribiendo un monedero y quieres una biblioteca de firma completa en cinco lenguajes, lee primero [QoreSign](/qoresign/overview).

## Innovaciones {#innovations}

- **El monedero firma un cuerpo ordinario.** El adapter construye el cuerpo sin la extensión, firma la capa ML-DSA-87 sobre los sign-bytes, la inserta en el cuerpo como la opción de extensión `/qorechain.pqc.v1.PQCHybridSignature` (id de algoritmo 1) y solo entonces llama a `wallet.signDirect` sobre el `SignDoc` terminado. El monedero produce una firma estándar `SIGN_MODE_DIRECT` y no necesita ningún código específico de QoreChain. El resultado son los bytes habituales de `TxRaw`.
- **Selector de sign-bytes por red.** La clave ML-DSA-87 firma una de dos formas de bytes y una red verifica exactamente una en cada altura. Con `signBytesVersion: "auto"` (el valor por defecto) el firmante pregunta al nodo `GET /cosmos/upgrade/v1beta1/applied_plan/{name}` por `v3.2.0` y luego por `v3.1.98`, firma la forma v2 (etiqueta de dominio `qorechain-pqc-hybrid-v2` más el id de la cadena) si cualquiera de las dos alturas es mayor que cero, guarda la respuesta en caché durante 60 segundos por URL REST e id de cadena, y lanza un error en lugar de adivinar cuando no puede preguntar. Comprobado el 27 de octubre de 2026 contra los nodos en vivo: mainnet y testnet se resuelven ambas a `v2`, y una llamada para `qorechain-vladi` sin `rest` lanza un error. `refreshSignBytesVersion()` omite la caché e `isHybridSignBytesRejection()` reconoce el rechazo `pqc` con código 21, de modo que quien llama puede volver a resolver y reintentar una vez cuando una red se actualiza mientras hay un monedero abierto.
- **Una clave ML-DSA-87 por mnemónico, compartida entre herramientas.** `walletFromMnemonic` deriva la clave como `SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)` alimentada a la generación de claves ML-DSA-87. Está vinculada a la dirección de la cuenta y es la misma derivación que usan el SDK, `@qorechain/chain-bridge`, QoreX y el comando `qorechaind tx pqc recover-key`, de modo que un mnemónico da una clave, sea cual sea la herramienta que firme. Consulta [Derivación determinista de claves y recuperación](/developer-guide/post-quantum-signing#key-derivation).
- **Una cuenta, tres formas de dirección, una clave de firma.** `generateQoreWallet` y `walletFromMnemonic` devuelven las formas `qor1`, `0x` (EIP-55) y base58 de SVM de la misma identidad de 20 bytes, junto con el par de claves ML-DSA-87. `signClassicalEth` y `signHybridEth` firman transacciones del carril Cosmos con esa clave eth-native (`eth_secp256k1`), de modo que la misma clave también firma transacciones EVM en otros lugares.
- **Códigos de recuperación PQC.** `generatePqcRecoveryCode` devuelve un secreto aleatorio de 256 bits con formato `QRC1-` más base32 de Crockford con una suma de comprobación de 24 bits. `pqcKeyFromRecoveryCode(code, address)` deriva de él la clave ML-DSA-87, vinculada a la dirección. Un carácter mal escrito se rechaza con un mensaje en lugar de derivar en silencio una clave que no corresponde a nada, y el código deliberadamente no es una frase semilla.
- **QoreX como firmante.** `qorexSignAndBroadcast` envía mensajes codificados en protobuf (de 1 a 32 por llamada, memo de hasta 256 bytes, límite de gas de 100,000 a 5,000,000) al monedero QoreX del usuario, que los muestra decodificados, añade la capa ML-DSA-87 que solo el monedero puede producir, firma y difunde. El adapter comprueba los límites en local y rechaza los mensajes de gestión de claves PQC (`MsgRegisterPQCKey`, `MsgRegisterPQCKeyV2`, `MsgMigratePQCKey`, `MsgRotatePQCKey`), también dentro de un `MsgExec` de authz a cualquier profundidad. Un `MsgExec` que no puede decodificar se rechaza.
- **Bloques de construcción para la ventana de autorización EVM, nunca una automática.** `openEvmWindowMsg`, `closeEvmWindowMsg`, `fetchEvmWindow`, `parseEvmWindow` e `isEvmWindowRejection` cubren la ventana que debe estar abierta antes de un envío EVM. Cada límite (`blocks` de 1 a 17,280, `maxTxs` de 1 a 1,000, `maxValue` mayor que cero) es obligatorio y se comprueba en el cliente sin valor por defecto, los campos de estado de la ventana son BigInt, y el paquete nunca abre una ventana por sí mismo: el usuario debe ver un paso de autorización explícito.
- **Mensajes de claves vinculadas (authenticators) con digests exactos de la cadena.** `registerAuthenticatorMsg`, `registerEthAuthenticatorMsg`, `buildPhantomExecuteEvm`, `buildPhantomExecuteCosmos`, `buildMetaMaskExecuteEvm` y `buildMetaMaskExecuteCosmos` construyen los mensajes que permiten que una clave de Phantom o MetaMask gaste desde una cuenta de QoreChain bajo un conjunto de permisos y una regla de gasto. `evmAuthSignBytesV2` es el digest de la cadena v3.2.3, que también vincula el límite de gas de la llamada (no puede ser cero). El nonce es la secuencia de authenticator de la clave vinculada, no el nonce EVM de la cuenta. Consulta [Authenticators y gasto delegado](/sdk/guides/authenticators).
- **Rotación segura de claves.** `rotateFromLegacyWalletKey` construye un `MsgRotatePQCKey` que se aleja de una clave creada con la derivación retirada por firma de monedero, y se niega salvo que la clave que vuelve a derivar sea igual a la registrada. `rotatePqcKeyMsgFromMnemonic` mueve una clave heredada `SHAKE-256(mnemonic)` a la clave canónica vinculada a la dirección, y rechaza la derivación heredada como nueva clave.

## Cómo usarlo {#how-to-use}

Instala el adapter con los dos peers de cosmjs (versión 0.32):

```bash
npm install @qorechain/wallet-adapter @cosmjs/stargate @cosmjs/proto-signing
```

El paquete es un módulo ES de JavaScript simple con tipados de TypeScript. El manifiesto no tiene un inicio rápido probado para él. Los fragmentos siguientes proceden de los tipados y del código fuente del paquete; el 27 de octubre de 2026 se ejecutaron la generación de monederos, el resolvedor de sign-bytes, la lectura del estado de la ventana EVM, `openEvmWindowMsg` y el error de la función retirada contra el paquete 0.4.0 publicado y los endpoints REST en vivo de testnet y mainnet, y las 102 pruebas del propio paquete pasan. Los fragmentos de firma y de QoreX no se ejecutaron de extremo a extremo.

### Generar un monedero unificado {#unified-wallet}

```js
import { generateQoreWallet, walletFromMnemonic } from "@qorechain/wallet-adapter";

const w = await generateQoreWallet();           // random 24-word mnemonic
// const w = await walletFromMnemonic(mnemonic); // or recover one
console.log(w.cosmos); // qor1...   (bech32)
console.log(w.evm);    // 0x...     (EIP-55)
console.log(w.svm);    // base58 form of the same 20 bytes
// w.privateKey, w.pubkey, w.pqc = { publicKey (2592 bytes), secretKey }
```

`walletFromSeed(seed32)` construye el mismo monedero a partir de 32 bytes secretos: la semilla se convierte en la clave privada secp256k1, así que debe proceder de una fuente aleatoria segura o de una función de derivación de claves sobre material que solo el usuario posee. No la derives nunca de una firma que un sitio web pueda pedir a un monedero.

### Registrar la cadena en los monederos del usuario {#register-chain}

```js
import { qoreChainInfo, addQoreEvmToWallet } from "@qorechain/wallet-adapter";

// Keplr and other Cosmos wallets. chainId defaults to the testnet, so pass it for mainnet.
await window.keplr.experimentalSuggestChain(
  qoreChainInfo({ chainId: "qorechain-vladi", rpc: "https://rpc.qore.host", rest: "https://api.qore.host" }),
);
await window.keplr.enable("qorechain-vladi");

// MetaMask and other EIP-1193 wallets (18-decimal native currency on the EVM lane).
await addQoreEvmToWallet(window.ethereum, {
  evmChainId: 9801, testnet: false, rpcUrl: "https://evm.qore.host",
});
```

`qoreChainInfo` usa el coin type 118, el prefijo bech32 `qor`, el denom `uqor` con 6 decimales y un escalón de precio del gas de 0.1, 0.15 y 0.25 uqor por gas, lo que respeta el mínimo de comisión de 0.1 uqor por gas. `addQoreEvmToWallet` necesita `rpcUrl`.

### Firmar una transacción híbrida con un monedero de Cosmos {#sign-hybrid}

```js
import { QoreChainSigner, pqcKeyFromRecoveryCode } from "@qorechain/wallet-adapter";

const signer = window.keplr.getOfflineSigner("qorechain-vladi");
const [account] = await signer.getAccounts();

// The account's ML-DSA-87 keypair, from a recovery code. Use this in a wallet or tool that
// legitimately owns the key; a web page should send its messages to QoreX instead (see below).
const pqc = await pqcKeyFromRecoveryCode(userRecoveryCode, account.address);

const adapter = new QoreChainSigner({
  wallet: window.keplr,
  chainId: "qorechain-vladi",
  address: account.address,
  pubkeySecp256k1: account.pubkey,
  accountNumber,                 // from GET /cosmos/auth/v1beta1/accounts/{address}
  pqc,
  rest: "https://api.qore.host", // lets the signer pick the sign-bytes form this network verifies
});

const txRaw = await adapter.signHybrid({ messages, fee, sequence }); // TxRaw bytes, with .signBytesVersion
// broadcast txRaw yourself (RPC broadcast_tx_sync or REST /cosmos/tx/v1beta1/txs)
```

Cosas que debes saber:

- El adapter firma; tú difundes. No construye el mensaje de registro de clave. Registra una sola vez la clave ML-DSA-87 de la cuenta con [QoreSign](/qoresign/quickstart) (`buildRegisterPqKeyMessage`), el SDK o la CLI (consulta [Registrar tu clave](/developer-guide/post-quantum-signing#pqc-key-registration)); esa primera transacción es la que puede firmarse de forma clásica.
- Una página web que guarda la clave ML-DSA-87 de la cuenta es un diseño que conviene evitar. `derivePqcKeyFromWallet`, que antes la derivaba de una firma de monedero, se retiró en la 0.3.0 y siempre lanza un error. Una dApp debe enviar los mensajes a QoreX (más abajo) y dejar que el monedero firme.
- Si una difusión es rechazada con `pqc` código 21 y usaste `"auto"`, llama a `adapter.refreshSignBytesVersion()` y firma una vez más; no reintentes si pasaste un `"v1"` o `"v2"` explícito. Consulta [Solución de problemas del código 21](/developer-guide/post-quantum-signing#code-21).

### Enviar a través de QoreX {#qorex}

```js
import {
  hasQorexSignAndBroadcast, qorexSignAndBroadcast, isQorexRejection,
} from "@qorechain/wallet-adapter";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx.js";

if (!hasQorexSignAndBroadcast()) throw new Error("Install or update QoreX");

try {
  const { txHash, code } = await qorexSignAndBroadcast({
    chainId: "qorechain-vladi",   // must equal the wallet's active network
    messages: [{
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: MsgSend.encode(MsgSend.fromPartial({ fromAddress, toAddress, amount })).finish(),
    }],
    gasLimit: 300_000,            // optional, 100,000 to 5,000,000
  });
  if (code !== 0) throw new Error(`rejected by the chain with code ${code}`);
} catch (err) {
  if (isQorexRejection(err)) return; // the user declined; not a failure
  throw err;
}
```

`value` son bytes protobuf (un `Uint8Array`, un array de números o base64), firmados exactamente como se entregan. Una dApp no puede cambiar la red del monedero. Necesita la extensión QoreX 0.3.5 o la app 1.1.5 o posterior; comprueba con `hasQorexSignAndBroadcast()` en lugar de comparar versiones. El contrato a nivel de protocolo está en [Extensión de navegador QoreX](/qorex/browser-extension#sign-and-broadcast).

### Construir un mensaje de ventana EVM {#evm-window}

```js
import { openEvmWindowMsg, fetchEvmWindow } from "@qorechain/wallet-adapter";

const status = await fetchEvmWindow({ rest: "https://api.qore.host", address: qor1 });
if (!status.live) {
  const msg = openEvmWindowMsg({
    sender: qor1,
    blocks: 300,        // 1 to 17280
    maxTxs: 3,          // 1 to 1000
    maxValue: "250000", // uqor: value plus the maximum fee of each admitted transaction
  });
  // sign it with signHybrid (or signHybridEth) and broadcast: it is an ordinary Cosmos-lane message
}
```

El orden importa: abre la ventana, luego lee el nonce EVM y después firma la transacción EVM, porque abrir una ventana avanza la secuencia de la cuenta, que es también su nonce EVM. `openEvmWindowMsg` construye solo la forma sin alcance de la ventana; una ventana con alcance (`native_only`, `allowed_targets`) necesita el SDK. Contexto: [Ventana de autorización EVM](/sdk/guides/evm#evm-window) y [Tu primera transacción](/getting-started/first-transaction#evm-window).

### Otros puntos de entrada

| Tarea | Funciones |
|---|---|
| Recuperar o rotar una clave PQC | `generatePqcRecoveryCode`, `pqcKeyFromRecoveryCode`, `isValidRecoveryCode`, `rotatePqcKeyMsgFromMnemonic`, `rotateFromLegacyWalletKey`, `rotatePqcKeyMsg` |
| Firmar con la clave eth-native | `signClassicalEth` (el registro de clave clásico), `signHybridEth` |
| Ayudantes de sign-bytes | `hybridSignBytes(version, chainId, body, authInfo)`, `resolveSignBytesVersion`, `signBytesVersionFor`, `SIGN_BYTES_V2_UPGRADES` |
| Vincular y gastar con una clave externa | `registerAuthenticatorMsg`, `registerEthAuthenticatorMsg`, `revokeAuthenticatorMsg`, las funciones `buildPhantom*` y `buildMetaMask*` |

## Cómo acceder {#how-to-access}

- **Redes:** mainnet `qorechain-vladi` y testnet `qorechain-diana`. Pasa `chainId` y la URL `rest` correspondiente ([endpoints](/developer-tools/overview#how-to-access)).
- **Monederos:** Keplr es el monedero que usan la guía de QoreSign y los ejemplos ([monederos compatibles con Keplr](/qoresign/guides/keplr-compatible-wallets)). Leap y Cosmostation exponen la misma interfaz `signDirect` y el paquete está escrito para cualquier monedero así; no se comprobó con ellos para esta página. MetaMask usa el carril EVM, no el firmante del adapter, y necesita una ventana EVM abierta para cada envío ([Paquetes para desarrolladores](/developer-tools/overview#how-to-access)). Phantom se vincula como authenticator.
- **Cuenta y clave:** una cuenta con QOR para la comisión, y la clave ML-DSA-87 de la cuenta registrada en la cadena antes de la primera transacción híbrida.
- **Requisitos previos:** Node.js con módulos ES, o un bundler para el navegador. Dependencias peer `@cosmjs/stargate` y `@cosmjs/proto-signing` `^0.32`. Dependencias de ejecución: `@qorechain/pqc` `^0.2.1`, `cosmjs-types` `^0.9.0`, `@cosmjs/crypto` y `@cosmjs/encoding` `^0.32`.
- **Coste:** el paquete es gratuito; las transacciones pagan la comisión de red a 0.1 uqor por gas o más. Registrar una clave usa un límite de gas grande porque la clave pública ML-DSA-87 ocupa 2,592 bytes.

## Dónde se publica {#where-published}

| Registro | Paquete | Versión | Enlace |
|---|---|---|---|
| npm | `@qorechain/wallet-adapter` | 0.4.0 (publicada el 20 de octubre de 2026) | [npmjs.com](https://www.npmjs.com/package/@qorechain/wallet-adapter) |

Código fuente: [github.com/qorechain/qorechain-wallet-adapter](https://github.com/qorechain/qorechain-wallet-adapter) (público, etiqueta `v0.4.0`, Apache-2.0). No está publicado en PyPI, crates.io, Maven Central ni en el proxy de Go. Relacionado: [Paquetes para desarrolladores](/developer-tools/overview), [QoreSign](/qoresign/overview), [Firma poscuántica](/developer-guide/post-quantum-signing), [Guía para Exchanges e Integradores](/developer-guide/exchange-integration).

## Límites y problemas conocidos {#limits}

- **Firma; no difunde, no registra claves ni abre ventanas.** No hay ninguna función que registre la clave ML-DSA-87, y nada abre una ventana EVM por ti.
- **Sin prueba de posesión.** Un registro de clave hecho con herramientas que solo usan este paquete no lleva ninguna. La cadena lo acepta igualmente, y verifica la prueba cuando está presente ([Prueba de posesión](/developer-guide/post-quantum-signing#proof-of-possession)).
- **`derivePqcKeyFromWallet` está retirada** (0.3.0) y siempre lanza un error. Las cuentas que registraron una clave con ella deben rotarla con `rotateFromLegacyWalletKey`.
- **Solo ventanas sin alcance.** `openEvmWindowMsg` no tiene campos de alcance.
- **`qoreChainInfo` usa por defecto la testnet.** Pasa siempre `chainId` para mainnet.
- **Nonces de authenticator.** Todavía ninguna consulta expone la secuencia de authenticator de la clave vinculada, así que debes llevar tú el control; la cadena responde `abstractaccount` código 11 cuando el valor es incorrecto. El módulo de authenticators está activado en testnet y desactivado en mainnet (consulta la [descripción general del SDK](/sdk/overview)).
- **Peers de cosmjs 0.32.** El SDK usa cosmjs 0.39; instalar ambos en un mismo proyecto da un error `ERESOLVE`, así que mantenlos separados o pasa `--legacy-peer-deps`.
- **No copies del README del paquete.** Todavía dice que mainnet verifica la primera forma de sign-bytes y que un envío con MetaMask no necesita ningún paso adicional. Ambas cosas están desactualizadas: las dos redes verifican v2, y un envío EVM necesita una clave registrada y una ventana abierta.
- **No hay un inicio rápido probado** registrado para este paquete, y el camino de QoreX necesita el monedero instalado, así que no puede ejecutarse en un script.
