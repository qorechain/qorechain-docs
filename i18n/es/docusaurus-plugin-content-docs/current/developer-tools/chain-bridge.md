---
slug: /developer-tools/chain-bridge
title: Chain Bridge y Handles
sidebar_label: Chain bridge y handles
sidebar_position: 3
---

# Chain bridge y handles

Esta página cubre dos paquetes pequeños del lado del servidor.

**`@qorechain/chain-bridge`** (0.2.3) es una biblioteca de Node.js para backends que actúan en QoreChain sin una persona ante el teclado: envía QOR, registra la clave ML-DSA-87 de una cuenta, registra nodos ligeros, despliega contratos y, para quien posee la clave de autoridad de licencias de la cadena, concede y revoca licencias. Se encarga de las dos cosas que un backend simple no puede hacer solo: la firma híbrida ML-DSA-87 que necesitan las transacciones del carril nativo, y la codificación protobuf exacta de los mensajes personalizados de QoreChain. Está pensada para workers de hot wallet, backends de pagos y de paneles, y servicios similares.

**`@qorechain/handles`** (0.1.0) resuelve un `@handle` de QoreX a una dirección y verifica criptográficamente la respuesta antes de devolverla. Está pensada para monederos y servicios que permiten a una persona escribir `@alice` en lugar de una dirección `qor1...`.

Ninguno de los dos paquetes lista un repositorio de código fuente en los metadatos de su registro. Puedes leer el código publicado en npm.

## Innovaciones {#innovations}

### Chain bridge {#innovations-chain-bridge}

- **Un mnemónico, una clave ML-DSA-87 canónica.** La clave se deriva como `SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)` y luego la generación de claves ML-DSA-87, la misma derivación que el [wallet adapter](/developer-tools/wallet-adapter), el SDK y QoreX, de modo que la clave puede recuperarse con `qorechaind tx pqc recover-key`. Las cuentas registradas con herramientas antiguas con `SHAKE-256(mnemonic)` conservan su clave heredada: cuando una firma canónica es rechazada con un fallo de verificación, el bridge reintenta una vez con la clave heredada.
- **Forma de los sign-bytes leída de la cadena.** Con `cosmosRest` configurado, el bridge pregunta al nodo por los planes de actualización aplicados (`v3.2.0` y `v3.1.98`) y firma la forma v2 cuando cualquiera de ellos está aplicado, como se describe en la [página del wallet adapter](/developer-tools/wallet-adapter#innovations). Si la cadena rechaza con `pqc` código 21, vuelve a resolver una vez y firma de nuevo. En las redes en vivo `cosmosRest` es obligatorio; sin él, una llamada híbrida lanza un error en lugar de adivinar.
- **Registra la clave en el primer uso, pero comprueba antes la cadena.** Cuando una transacción híbrida es rechazada por falta de clave PQC, el bridge envía `MsgRegisterPQCKeyV2` (una transacción clásica, que la cadena permite para un primer registro) y reintenta. Como ese mensaje cuesta su comisión incluso si es rechazado, primero lee `GET /qorechain/pqc/v1/account/{address}`: si la cuenta ya tiene una clave que no es ni la canónica ni la heredada de tu mnemónico, lanza `pqc_key_mismatch` y no envía nada. Con `cosmosRest`, un registro también lleva la prueba de posesión una vez que la red ha aplicado v3.2.3 (mainnet y testnet ya lo han hecho).
- **IDs de característica de licencia a partir de nombres simples.** `featureIdsFor({ type, chains })` convierte la descripción de un producto en los IDs de característica de la cadena (`validator_operator` más `validator_<chain>`, `lightnode_operator`, `qcb_bridge` más `bridge_<chain>`), normaliza nombres de cadena en texto libre como "Solana" o "BNB Chain", y descarta una cadena desconocida en lugar de construir un ID que la cadena rechazaría. Comprobado el 27 de octubre de 2026: `featureIdsFor({ type: "validator", chains: ["Solana", "Ethereum", "Foo"] })` devolvió `validator_operator`, `validator_solana`, `validator_ethereum` y descartó `Foo`.
- **JavaScript puro, sin complementos nativos.** Es un módulo ES para Node.js 18 o posterior, así que funciona en workers serverless. Además de la entrada principal exporta `@qorechain/chain-bridge/proto` (los codificadores de protocolo) y `@qorechain/chain-bridge/features` (el mapeo de características).

### Handles {#innovations-handles}

- **Una resolución se comprueba dos veces antes de devolverse.** El registro debe llevar la firma ed25519 del registry, verificada contra una clave pública del registry que fijas en el cliente, y la propia firma secp256k1 del propietario sobre la reclamación, cuya clave pública debe dar como hash la dirección `qor1` del registro. Un registro que falla cualquiera de las dos comprobaciones nunca se devuelve.
- **El almacén de pins es tuyo.** `resolve` devuelve `pin.status` como `new`, `match` o `CHANGED` comparando el registro con un pin que tú guardas, y nunca fija nada por sí mismo. Fijas después de que el usuario haya visto la dirección y haya continuado. El sentido de un pin es notar que el registry empezó a decir algo distinto, así que debe guardarlo alguien distinto de la parte que se comprueba, por ejemplo en el dispositivo del usuario.
- **Solo se devuelven direcciones firmadas por el propietario para una red.** `addressForNetwork(record, caip2)` devuelve la dirección `qor1` para las redes de QoreChain, y la dirección `0x` para los ids de cadena 9800 y 9801 cuando el registro es una cuenta unificada. Las direcciones en otras cadenas que el registry solo atestigua no se devuelven para enviar.
- **Búsqueda inversa solo para mostrar.** `reverse(address)` devuelve un handle para mostrarlo en el historial. Su resultado nunca debe convertirse en el destino de un envío.
- **Reclamar y borrar usan dominios de firma distintos.** `signClaim` y `signDelete` firman mensajes diferentes, de modo que una firma de borrado no puede reutilizarse como reclamación.

## Cómo usarlo {#how-to-use}

### Chain bridge {#use-chain-bridge}

```bash
npm install @qorechain/chain-bridge
```

Trae `@qorechain/wallet-adapter` (^0.4.0), `@qorechain/pqc` (^0.2.1), cosmjs 0.32 y ethers 6. No tiene un inicio rápido probado; el fragmento siguiente sigue los tipados del paquete y la [Guía para Exchanges e Integradores](/developer-guide/exchange-integration#chain-bridge). El 27 de octubre de 2026 se comprobaron el constructor, `featureIdsFor` y la lista de métodos contra el paquete 0.2.3 publicado; no se envió ninguna transacción.

```js
import { ChainBridge } from "@qorechain/chain-bridge";

const bridge = new ChainBridge({
  cosmosRpc: "https://rpc-testnet.qore.host",
  cosmosRest: "https://api-testnet.qore.host", // picks the sign-bytes form; required on both live networks
  chainId: "qorechain-diana",
  signerMnemonic: process.env.WORKER_MNEMONIC, // from your secrets manager, never in source code
});

// Once per account (the bridge also does it on first use if the chain reports no key).
await bridge.registerPqc({ mnemonic: process.env.WORKER_MNEMONIC });

// Amounts are in uqor (6 decimals): 1 QOR = 1000000.
const { txHash, code } = await bridge.sendTokens({ to: "qor1...", amountUqor: "1000000" });
```

Métodos principales:

| Método | Qué hace | Clave usada |
|---|---|---|
| `sendTokens({ to, amountUqor })` | `MsgSend` de bank, con firma híbrida | firmante |
| `registerPqc({ mnemonic })` | `MsgRegisterPQCKeyV2`, clásico | esa cuenta |
| `registerLightNode({ operatorMnemonic, nodeType, version, capabilities })` | registro de nodo ligero, con firma híbrida | operador |
| `grantLicense`, `grantLicenseSet`, `revokeLicense`, `suspendLicense`, `resumeLicense` | mensajes del módulo de licencias | la clave de autoridad de licencias de la cadena |
| `deployEvm({ bytecode, abi, args })` | un despliegue al estilo Ethereum mediante `eth_sendRawTransaction` | clave del desplegador |
| `deploySvm({ bytecode })` | despliegue de programas SVM | firmante |
| `createVestingAccount`, `createPeriodicVestingAccount` | creación de cuentas de vesting | firmante |
| `featureIdsFor`, `normalizeChain` | ayudantes locales | ninguna |

Cada llamada devuelve `{ txHash, code, height, gasUsed }`, y una llamada híbrida informa además de `signBytesVersion`. El precio del gas por defecto es 0.1 uqor por gas, que es el mínimo de la red (un `sendTokens` de 300,000 de gas cuesta 30,000 uqor a ese precio, y el valor por defecto de 6,000,000 de gas para el registro de una clave cuesta 600,000 uqor, que pagas una vez por cuenta). El carril EVM usa 18 decimales: el `value` de `deployEvm` está en wei. Establece `keyType: "eth_secp256k1"` en la configuración para firmar con la clave unificada eth-native (una identidad como `qor1`, `0x` y SVM) en lugar de la clave por defecto de coin type 118; esa opción está en el código fuente y en el README del wallet adapter pero no en los tipados.

### Handles {#handles}

```bash
npm install @qorechain/handles
```

Sus únicas dependencias de ejecución son `@noble/curves`, `@noble/hashes` y `bech32`. No existe un inicio rápido probado para él. El fragmento sigue el README y los tipados del paquete; el 27 de octubre de 2026 se comprobaron `isHandleInput`, `normalizeHandle` y la lista de exportaciones en el paquete 0.1.0 publicado, y no se contactó con ningún registry.

```ts
import { HandleClient, type PinStore } from "@qorechain/handles";

const client = new HandleClient({ baseUrl: registryUrl, registryPubkeyHex });

// You supply the pin store, ideally on the user's device.
const pins: PinStore = { get: (handle) => load(handle), put: (pin) => save(pin) };

const { record, pin } = await client.resolve("@alice", pins);

if (pin.status === "CHANGED") {
  // Stop. Show both addresses in full and require explicit confirmation.
  // Never update the pin silently.
}

// Show record.qorAddress to the user. When they proceed (and only then):
await client.pin(record, pins, Date.now());
```

`resolve` lanza un error cuando el handle es desconocido, no se puede alcanzar el registry, o la respuesta no supera la verificación. `isHandleInput(text)` distingue un handle de una dirección (un handle son de 3 a 20 caracteres de `a-z`, `0-9` y `_`, o empieza por `@`; una cadena `qor1...` o `0x...` nunca es un handle). Otras exportaciones: `claimSignBytes`, `signClaim`, `deleteSignBytes`, `signDelete`, `verifyResolution`, `checkPin`, `QorexError`. Para ver cómo usa QoreX los handles, consulta [Enviar a un @handle](/qorex/browser-extension#handle-send) y [Cuenta y panel](/qorex/account-and-dashboard).

## Cómo acceder {#how-to-access}

- **Redes:** el chain bridge funciona contra mainnet `qorechain-vladi` o testnet `qorechain-diana` con los endpoints listados en la página de [Paquetes para desarrolladores](/developer-tools/overview#how-to-access) (el RPC de EVM y el id de cadena 9800 o 9801 para `deployEvm`).
- **Requisitos previos del chain bridge:** Node.js 18 o posterior; una cuenta con fondos cuyo mnemónico guarde tu worker (guárdalo en un gestor de secretos); y la URL REST de la red. La clave ML-DSA-87 se deriva del mnemónico y se registra en el primer uso, así que la cuenta debe tener QOR suficiente para esa comisión de registro.
- **Las llamadas de licencias** solo tienen éxito cuando las firma la clave con la que se configuró la cadena como su autoridad de licencias. Un desarrollador externo no la tiene, así que estos métodos son para el operador de esa clave. Para licencias y registro de nodos ligeros como usuario, consulta [Registro y licencias](/light-node/registration-and-licensing).
- **Requisitos previos de handles:** la URL base del registry y su clave pública ed25519 (hex), un almacén de pins que implementes tú, y `fetch`. Las lecturas no necesitan cuenta.
- **Coste:** ambos paquetes son gratuitos. Las transacciones del chain bridge pagan la comisión de red.

## Dónde se publica {#where-published}

| Registro | Paquete | Versión | Enlace |
|---|---|---|---|
| npm | `@qorechain/chain-bridge` | 0.2.3 (publicada el 20 de octubre de 2026) | [npmjs.com](https://www.npmjs.com/package/@qorechain/chain-bridge) |
| npm | `@qorechain/handles` | 0.1.0 (publicada en agosto de 2026) | [npmjs.com](https://www.npmjs.com/package/@qorechain/handles) |

Ambos son Apache-2.0 y se publican solo en npm (no en PyPI, crates.io, Maven Central ni en el proxy de Go). Ninguno lista un repositorio de código fuente en los metadatos de su registro, así que no hay una página pública de código fuente a la que enlazar; el código está en el tarball publicado. Para leer las versiones en vivo, consulta [Cómo obtener las versiones en vivo](/developer-tools/overview#live-versions).

## Límites y problemas conocidos {#limits}

### Chain bridge {#limits-chain-bridge}

- **Los despliegues EVM necesitan una ventana abierta.** `deployEvm` envía una transacción estándar de Ethereum. Desde la cadena v3.2.0 el carril EVM admite una transacción solo desde una cuenta con una clave ML-DSA-87 registrada y una ventana de autorización EVM abierta, y el bridge no tiene ningún método que abra una. Abre la ventana con otras herramientas (el [wallet adapter](/developer-tools/wallet-adapter#evm-window), el SDK o QoreX) antes de llamarlo, o la transacción será rechazada (codespace `pqc`, código 26, 27 o 28). Esto sigue las reglas de la cadena y el código fuente del paquete; no se probó contra una red en vivo para esta página. El README del paquete todavía llama exento al carril EVM, lo cual está desactualizado.
- **`deploySvm`** apunta al carril SVM, que todavía no acepta transacciones en ninguna de las dos redes.
- **Existen métodos de subida de contratos pero no están documentados.** El código fuente también tiene `storeWasm`, `instantiateWasm` y `deployWasm` para contratos de QoreChain Native, que no están en los tipados ni en el README. La subida es solo por gobernanza para las cuentas ordinarias en las redes en vivo, así que espera un rechazo para una cuenta ordinaria.
- **La clave se deriva en el servidor.** El mnemónico permanece en tu proceso. Mantenlo fuera de los logs y del control de versiones, y no lo reutilices como monedero personal.
- **Un registro no es gratis.** El bridge registra la clave él mismo en el primer uso; un canal que mueve fondos debería registrarla de antemano y confirmar el resultado con `GET /qorechain/pqc/v1/account/{address}` antes del primer retiro.
- **cosmjs 0.32.** No lo instales junto al SDK (cosmjs 0.39) en un mismo proyecto; npm informa `ERESOLVE`.
- **Partes obsoletas del README.** El README dice que mainnet sigue en la primera forma de sign-bytes; las dos redes verifican v2 (consulta [Seguridad Post-Cuántica](/architecture/post-quantum-security)).
- **Sin inicio rápido probado, sin repositorio de código fuente público.**

### Handles {#limits-handles}

- **La dirección del registry y la clave pública no se publican** en el paquete ni en este manual. QoreX y el panel las llevan integradas, así que un integrador solo puede usar el paquete si se le dan esos dos valores.
- **Los handles no son nombres en cadena.** El registry es un servicio fuera de la cadena operado para QoreX; el paquete verifica sus respuestas pero no puede hacer que esté disponible. Si el registry no es alcanzable, `resolve` lanza un error `NETWORK_UNAVAILABLE`, e `isReachable()` es una sonda rápida que una interfaz puede usar para ocultar las funciones de handles.
- **No fija nada por ti.** Si nunca llamas a `pin`, cada resolución informa `new`. El que llama es responsable de guardar los pins de forma segura.
- **Solo se usan direcciones firmadas por el propietario para enviar.** Las direcciones en otras cadenas que el registry atestigua no las devuelve `addressForNetwork`.
- **Las llamadas de escritura necesitan más que el paquete.** `claim`, `deleteHandle` y `bySub` hablan con los endpoints de escritura del registry y necesitan una firma del propietario (`signClaim`, `signDelete`) o un token de cuenta; están pensadas para aplicaciones de monedero.
- **Sin inicio rápido probado, sin repositorio de código fuente público.**
