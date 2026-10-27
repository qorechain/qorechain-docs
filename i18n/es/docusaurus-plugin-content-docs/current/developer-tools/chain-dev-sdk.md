---
slug: /developer-tools/chain-dev-sdk
title: Kit de desarrollo de cadena
sidebar_label: Kit de desarrollo de cadena
sidebar_position: 34
---

# Kit de desarrollo de cadena (plantillas EVM y QoreChain Native)

El kit de desarrollo de cadena es la parte del SDK de QoreChain **0.11.0** que ayuda a los equipos de Solidity y de contratos inteligentes a construir sobre QoreChain con las herramientas que ya usan. Añade definiciones de cadena de viem y ayudantes de la ventana de autorización EVM a `@qorechain/evm`, cuatro plantillas de proyecto nuevas a `create-qorechain-dapp` (Foundry, Hardhat 3, viem con wagmi y un token CosmWasm de QoreChain Native), guías de inicio rápido de EVM para cinco lenguajes y una referencia sobre en qué se diferencia la EVM de QoreChain de Ethereum. Está pensado para equipos de Solidity que portan contratos desde Ethereum, desarrolladores de front end de dApps con wagmi y RainbowKit, desarrolladores de CosmWasm y mantenedores de herramientas EVM que quieren añadir QoreChain.

:::caution Próximamente: el SDK 0.11.0 está etiquetado, pero no publicado en npm
El SDK 0.11.0 está etiquetado en GitHub (`qorechain/qorechain-sdk`, etiqueta `v0.11.0`, 27 de octubre de 2026). **Su publicación en npm está pendiente**, y el 27 de octubre de 2026 `npm view` para la versión 0.11.0 de `@qorechain/evm`, `@qorechain/sdk`, `@qorechain/react`, `@qorechain/svm` y `create-qorechain-dapp` no encontró nada. Esta página **no da ningún comando de instalación para 0.11.0**. Todo lo marcado **desde 0.11.0** más abajo no funciona hoy desde npm. Lo marcado **disponible hoy** sí funciona: procede de `@qorechain/sdk` 0.10.0, `@qorechain/evm` 0.8.0, `create-qorechain-dapp` 0.10.0 y los SDK de lenguaje en 0.10.0. La versión 0.11.0 cambia solo los paquetes de npm; los SDK de Python, Rust, Go y Java se quedan en 0.10.0.
:::

El kit apunta a la mainnet (`qorechain-vladi`, ID de cadena EVM 9801) y a la testnet (`qorechain-diana`, ID de cadena EVM 9800).

## Disponible hoy y novedades de 0.11.0 {#status}

| Elemento | Estado | Dónde |
|---|---|---|
| Lectura con ethers v6, web3.py, go-ethereum, alloy o web3j contra los endpoints públicos | **Disponible hoy** (no hace falta ningún paquete de QoreChain) | [Inicio rápido 1](#quickstart-ethers) |
| `createEvmClient`, ayudantes de ERC-20, ERC-721 y ERC-1155, enlaces de `precompiles`, `PRECOMPILE_ADDRESSES` | **Disponible hoy** en `@qorechain/evm` 0.8.0 | [Inicio rápido 2](#quickstart-evm-080) |
| Abrir y leer una ventana de autorización EVM desde TypeScript, con `openEvmWindowMsg`, `fetchEvmWindow`, `EthNativeSigner`, `deriveUnifiedAccount` | **Disponible hoy** en `@qorechain/sdk` 0.10.0 | [Inicio rápido 5](#quickstart-open-window) |
| Los mismos constructores de ventana en Python, Go, Rust y Java | **Disponible hoy** en los SDK 0.10.0 | [API principal](#main-api) |
| Ayudantes de consentimiento EIP-7702 `authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `classifyEvmDelegationRejection` | **Disponible hoy** en `@qorechain/sdk` 0.10.0 | [API principal](#main-api) |
| El generador de proyectos con las plantillas `evm-solidity`, `fullstack-web`, `rollup-app` | **Disponible hoy** en `create-qorechain-dapp` 0.10.0 | [Inicio rápido 6](#quickstart-scaffold-live) |
| Definiciones de cadena de viem `qorechain` y `qorechainTestnet`, `QORECHAIN_CHAINS`, `QORECHAIN_REST_ENDPOINTS` | **Desde 0.11.0** (próximamente) | [Inicio rápido 3](#quickstart-viem) |
| `evmWindowStatus`, `openEvmWindowMessage`, `evmWindowCost`, `classifyEvmWindowRejection`, conversores de direcciones, constantes de ventana, subruta `@qorechain/evm/window` | **Desde 0.11.0** (próximamente) | [Inicio rápido 4](#quickstart-window-helpers) |
| Plantillas `foundry`, `hardhat`, `viem-wagmi`, `cosmwasm` y el ayudante `pnpm window` | **Desde 0.11.0** (próximamente) | [Plantillas](#templates) |
| `PqcStatusBadge` en `@qorechain/react` | **Desde 0.11.0** (próximamente) | [API principal](#main-api) |

## Innovaciones {#innovations}

- **Enviar está autorizado a propósito, con una ventana acotada.** Una transacción EVM solo se admite desde una cuenta que tiene una clave ML-DSA-87 registrada y una ventana de autorización EVM abierta. La ventana la abre un mensaje del carril nativo firmado de forma híbrida (secp256k1 más ML-DSA-87), así que la clave secp256k1 que guarda una biblioteca EVM nunca puede autorizar un gasto por sí sola. La transacción de Ethereum en sí sigue siendo una transacción normal de Ethereum.
- **Una ventana que se mide en límites, no en confianza.** Una ventana limita el número de bloques (de 1 a 17,280), el número de transacciones EVM (de 1 a 1,000) y un total en uqor que cubre el valor más la comisión máxima de cada transacción admitida. `nativeOnly` la limita a transferencias simples de QOR y `allowedTargets` (como máximo 16 direcciones) limita los destinatarios y rechaza la creación de contratos.
- **Una cuenta, dos codificaciones.** En una cuenta eth-native las direcciones `0x` y `qor1...` son los mismos 20 bytes y muestran el mismo saldo, de modo que una sola clave funciona en la EVM y en el carril nativo. QOR tiene 18 decimales en la EVM y 6 en el carril nativo (`uqor`); 1 uqor son 10^12 wei.
- **Ayudantes que nombran el rechazo.** `classifyEvmWindowRejection` convierte una transacción rechazada en uno de cuatro motivos, `no-pqc-key`, `no-window`, `exhausted` o `invalid`, a partir de un error de viem o ethers, un resultado de entrega del carril nativo o una cadena de texto.
- **Dimensionar la ventana en uqor.** `evmWindowCost` y `weiToUqorCeil` dimensionan una ventana a partir del valor, el gas y el tope de comisión, redondeando los wei hacia arriba a uqor, de modo que el total cubra el peor caso.
- **Sin apertura automática.** El kit deliberadamente no tiene ningún ayudante que abra una ventana antes de un envío. La ventana existe para que el gasto se autorice a propósito.
- **Simulación gratuita.** `eth_call` y `eth_estimateGas` funcionan para cualquier cuenta sin ventana ni clave registrada.
- **Plantillas que cablean la ventana.** Las plantillas de Foundry y Hardhat incluyen `pnpm window status|register|open`, que deriva la clave ML-DSA-87 del mismo secreto que la clave EVM, la registra una vez y difunde el mensaje de apertura firmado de forma híbrida.
- **Una superficie de compatibilidad documentada.** Una página de referencia (leída de los endpoints públicos el 27 de octubre de 2026) enumera lo que difiere de Ethereum: tipos de transacción, bifurcaciones, finalidad, campos de comisión, espacios de nombres JSON-RPC y precompilados. Se resume [más abajo](#evm-differences).

## Qué contiene el kit {#contents}

### `@qorechain/evm` {#evm-package}

**Desde 0.11.0** (nuevo):

- `qorechain` (9801) y `qorechainTestnet` (9800): objetos de cadena de viem con los endpoints públicos, la moneda nativa QOR con 18 decimales y el explorador `https://explore.qore.network`. `QORECHAIN_CHAINS` enumera ambas (mainnet y después testnet) para wagmi y RainbowKit. `QORECHAIN_REST_ENDPOINTS` asigna a cada ID de cadena EVM su endpoint REST del carril nativo.
- `evmWindowStatus({ rest, address })` lee la ventana de una cuenta por REST (`/qorechain/pqc/v1/evm_window/{address}`), acepta una dirección `qor1...` o `0x` y responde `{ found: false }` en lugar de fallar cuando no hay ninguna. `parseEvmWindow` analiza la respuesta en bruto.
- `openEvmWindowMessage(params)` comprueba los límites y compone el `MsgOpenEVMWindow` del carril nativo como un objeto simple `{ typeUrl, value }`, listo para firmar con `@qorechain/sdk`. `checkOpenEvmWindowParams` ejecuta solo las comprobaciones.
- `evmWindowCost`, `weiToUqorCeil`, `classifyEvmWindowRejection`, `isEvmWindowRejection`, `toQorAddress`, `toEvmAddress`, y las constantes `OPEN_EVM_WINDOW_TYPE_URL`, `CLOSE_EVM_WINDOW_TYPE_URL`, `MAX_EVM_WINDOW_BLOCKS` (17,280), `MAX_EVM_WINDOW_TXS` (1,000) y `MAX_EVM_WINDOW_TARGETS` (16).
- Los ayudantes de ventana también se publican sin viem en la subruta `@qorechain/evm/window`.

**Disponible hoy** (0.8.0 y posteriores): `createEvmClient`, `evmAccountFromPrivateKey`, `writeContract`, los ayudantes `erc20`, los ayudantes de ERC-721 y ERC-1155, los enlaces de `precompiles` y `PRECOMPILE_ADDRESSES`. Consulta la [guía de EVM](/sdk/guides/evm).

### Plantillas {#templates}

`create-qorechain-dapp` tiene hoy tres plantillas disponibles (`evm-solidity`, `fullstack-web`, `rollup-app`; consulta [Generadores y CLI](/developer-tools/scaffolders-and-cli)). **Desde 0.11.0** tiene siete. Las cuatro nuevas:

| Plantilla | Qué obtienes |
|---|---|
| `foundry` | Un proyecto de Foundry: contrato `Counter`, pruebas, script de despliegue, endpoints RPC con nombre `qorechain` y `qorechain_testnet`, y `pnpm window status\|register\|open`. |
| `hardhat` | Un proyecto de Hardhat 3 y viem: contrato `Counter`, pruebas en la red simulada, un módulo de despliegue de Ignition, las redes `qorechain` y `qorechainTestnet`, y `pnpm window status\|register\|open`. |
| `viem-wagmi` | Una dApp de Vite, React, wagmi y RainbowKit con la cartera QoreX (`@qorechain/qorex-rainbowkit`) y las definiciones de cadena de `@qorechain/evm`. Muestra el último bloque, el saldo de QOR y la ventana EVM de la cuenta. |
| `cosmwasm` | Un token CW20 de QoreChain Native (CosmWasm) sobre `cw20-base` de cw-plus, una compilación optimizada en Docker, un script de propuesta de gobernanza para subir el código y scripts de instanciación y consulta en la testnet. |

Las plantillas fijan `@qorechain/evm` y `@qorechain/sdk` a `^0.11.0`, por lo que no se instalan desde npm hasta que se publique 0.11.0.

### Guías en el repositorio del SDK {#guides}

El repositorio (`docs/docs/guides/`, etiqueta `v0.11.0`) tiene `evm-quickstarts.md` (lecturas para viem, ethers v6, web3.py, go-ethereum, alloy y web3j, más una sección "Before you send"), `evm-differences.md` ("QoreChain EVM compared with Ethereum"), `evm.md` y `cosmwasm.md`. El mismo material en este sitio: [guía de EVM](/sdk/guides/evm), [Desarrollo EVM](/developer-guide/evm-development) y [Desarrollo con QoreChain Native](/developer-guide/cosmwasm-development).

También en la etiqueta: archivos de contribución para otras herramientas (definiciones de cadena de viem, entradas de cadena de Sourcify y una extensión de Scaffold-ETH 2) en `contrib/` y `templates/scaffold-eth-extension/`. Son archivos preparados en el repositorio, no fusionados en los proyectos de origen.

## Casos de uso {#use-cases}

1. **Un equipo de Solidity que porta desde Ethereum.** Genera la plantilla `foundry` (desde 0.11.0), copia los contratos, ejecuta `forge test` en local, ejecuta `pnpm window register` una vez y `pnpm window open` antes de cada lote de despliegues. Las [diferencias](#evm-differences) enumeran qué cambiar: no hay transacciones blob, PREVRANDAO es una constante, no hay trazas `debug_*` en los endpoints públicos.
2. **Un proyecto de Hardhat 3 que pasa a la testnet.** Genera la plantilla `hardhat` (desde 0.11.0), conserva tus módulos de Ignition y despliega con `pnpm deploy:testnet` tras abrir una ventana.
3. **Un front end de dApp con wagmi.** Importa `QORECHAIN_CHAINS` en la configuración de wagmi y RainbowKit (desde 0.11.0), muestra la ventana del usuario con `evmWindowStatus` y explica un envío rechazado con `classifyEvmWindowRejection`.
4. **Un servicio de backend en otro lenguaje.** Un servicio en Python, Go, Rust o Java lee saldos y llama a contratos con web3.py, go-ethereum, alloy o web3j como en Ethereum, **hoy**. Para enviar, construye `MsgOpenEVMWindow` con el SDK de QoreChain 0.10.0 de ese lenguaje, que está disponible.
5. **Un desarrollador de CosmWasm.** Genera la plantilla `cosmwasm` (desde 0.11.0), prueba el CW20 con `cargo test`, compila el Wasm optimizado, envía una propuesta de gobernanza para almacenar el código e instánciala en la testnet cuando la propuesta se apruebe.
6. **Una integración de cartera o de custodia.** Una integración que guarda claves de usuarios necesita saber que la clave secp256k1 sola no puede gastar en el carril EVM. Abre ventanas estrechas (`nativeOnly` o `allowedTargets`) firmadas con la clave ML-DSA-87 de la cuenta, **hoy** con `openEvmWindowMsg` de `@qorechain/sdk` 0.10.0.
7. **Mantenedores de herramientas EVM.** Los mantenedores de viem, Sourcify o Scaffold-ETH 2 pueden leer los archivos de contribución preparados para añadir los ID de cadena 9800 y 9801.

## Cómo funciona {#how-it-works}

- **La regla de autorización.** La cadena admite una transacción EVM desde una cuenta que tiene una clave ML-DSA-87 registrada y una ventana activa, y la rechaza en caso contrario. La regla es la función de protocolo `evm-pqc-authorisation-window`, habilitada en ambas redes; léela en `/qorechain/pqc/v1/protocol_features`. Consulta [Ventana de autorización EVM](/sdk/guides/evm#evm-window) y [la guía de la primera transacción](/getting-started/first-transaction#evm-window).
- **Apertura y cierre.** `MsgOpenEVMWindow` (`/qorechain.pqc.v1.MsgOpenEVMWindow`) abre una ventana, firmada de forma híbrida; abrir una ventana sustituye a cualquier ventana anterior. `MsgCloseEVMWindow` la cierra.
- **Qué acota una ventana.** Bloques (un número de bloques, no una duración), transacciones EVM y un total en uqor que cubre el valor más la comisión máxima (límite de gas por tope de comisión) de cada transacción admitida. `nativeOnly` y `allowedTargets` la acotan aún más (consulta [Acota una ventana](/sdk/guides/evm#evm-window-scope)).
- **Nonce.** La secuencia nativa y el nonce EVM son el mismo contador. Abrir una ventana lo avanza, así que abre la ventana, después lee el nonce y luego firma la transacción EVM.
- **El ayudante de las plantillas.** En `foundry` y `hardhat`, `pnpm window` deriva la cuenta de `PRIVATE_KEY` (o `QORE_MNEMONIC`), deriva su clave ML-DSA-87 del mismo secreto, registra la clave una vez (`register`) y difunde `MsgOpenEVMWindow` firmado de forma híbrida (`open`). Por defecto dimensiona una ventana de 600 bloques y 5 transacciones para transacciones de hasta 3,000,000 de gas con un tope de comisión de 250 gwei.
- **CosmWasm en QoreChain Native.** La subida de código se hace por gobernanza en ambas redes (`code_upload_access` es `Nobody`): el código lo almacena una propuesta de gobernanza que lleva `MsgStoreCode` con el módulo de gobernanza como remitente. La instanciación está abierta a todos en la testnet y cerrada en la mainnet (`instantiate_default_permission` es `Everybody` en la testnet y `Nobody` en la mainnet, leído el 27 de octubre de 2026). Lee ambos en `/cosmwasm/wasm/v1/codes/params`; enumera los códigos almacenados en `/cosmwasm/wasm/v1/code`. La mainnet no tenía códigos almacenados el 27 de octubre de 2026.

## La EVM de QoreChain comparada con Ethereum {#evm-differences}

Leído de los endpoints públicos el 27 de octubre de 2026 (guía del SDK `evm-differences.md`). El estado de la red (comisiones, tiempos de bloque, precompilados activos) tiene fecha; léelo en vivo antes de depender de él.

- **Envío.** Toda transacción EVM necesita una clave ML-DSA-87 registrada y una ventana abierta para su remitente, sin excepciones por cuenta. Cubre despliegues, transferencias y llamadas a contratos. Una cuenta con una clave registrada tampoco tiene ruta de firma clásica en el carril nativo: toda transacción nativa que firma es híbrida.
- **Simulación.** `eth_call` y `eth_estimateGas` no necesitan ventana.
- **Tipos de transacción.** Se aceptan los tipos 0 (legacy), 1 (lista de acceso), 2 (EIP-1559) y 4 (EIP-7702). **Las transacciones blob de EIP-4844 (tipo 3) se rechazan.** Los opcodes de Cancun funcionan, pero `blobGasUsed` y `excessBlobGas` son siempre 0, `eth_blobBaseFee` no existe y el precompilado de evaluación de punto (`0x0a`) devuelve un error.
- **Bifurcaciones.** Hasta London desde el génesis; Shanghai, Cancun y Prague están activas; Osaka no está activa.
- **PREVRANDAO (EIP-4399) es una constante** (`0xff...ff`) y el `mixHash` de la cabecera es cero. No lo uses nunca como aleatoriedad.
- **EIP-7702** se acepta con una regla de QoreChain: cada autoridad cuya delegación entraría en vigor necesita una clave PQC registrada y un consentimiento de un solo uso registrado con `MsgAuthorizeEVMDelegation` (como máximo 8 autorizaciones por transacción, sin autoridad duplicada). La ventana del patrocinador no cuenta como consentimiento de las autoridades. `MsgClearEVMDelegation` elimina una delegación. Consulta [Consentimiento EIP-7702](/sdk/guides/evm#evm-delegation-consent).
- **Finalidad.** Los bloques son finales al confirmarse: `latest`, `safe` y `finalized` devuelven el mismo bloque, sin reorganizaciones ni tíos.
- **Comisiones (ambas redes, 27 de octubre de 2026).** `eth_gasPrice` 112.5 gwei; comisión base 100 gwei (el mínimo de la cadena de 0.1 uqor por gas); `eth_maxPriorityFeePerGas` 12.5 gwei; `gasLimit` de la cabecera 4,294,967,295. Las herramientas que fijan el tope de comisión cerca del doble de la comisión base (Foundry lo hace) comprometen hasta unos 200 gwei por gas contra la ventana mientras pagan unos 112.5 gwei.
- **Espacios de nombres JSON-RPC.** `eth`, `net`, `web3` y `txpool`. Todos los métodos `debug_*`, `personal_*`, `admin_*` y `miner_*` no están disponibles (`-32601`), igual que `trace_*`, `eth_coinbase`, `eth_mining`, `eth_hashrate`, `eth_getWork`, `eth_submitWork`, `eth_blobBaseFee`, `eth_simulateV1`, `eth_callMany`, `eth_signTransaction`, `eth_pendingTransactions` y `eth_config`. Las herramientas que necesitan trazas no funcionan contra los endpoints públicos.
- **Comportamiento distinto.** `eth_getProof` funciona pero devuelve las pruebas IAVL de la cadena, no pruebas Merkle-Patricia. `eth_getLogs` cubre como máximo 10,000 bloques por consulta. `eth_subscribe` funciona solo por WebSocket. `eth_accounts`, `eth_sign` y `eth_sendTransaction` se rechazan porque el nodo no guarda cuentas: firma en local y usa `eth_sendRawTransaction`. `txpool_content` se rechaza en los endpoints públicos; `txpool_status` funciona. `web3_clientVersion` no es una forma fiable de detectar el nodo.
- **Saldos.** `eth_getBalance` devuelve el saldo bancario en uqor multiplicado por 10^12 más cualquier resto inferior a un uqor.
- **Precompilados.** Los precompilados estándar de Ethereum responden como de costumbre. `pqcVerify` (`0x0A01`) y `pqcKeyStatus` (`0x0A02`) están **activos solo en la testnet**; ninguno está activo en la mainnet, y activar uno requeriría una decisión de gobernanza, sin fecha. La testnet también enumera `0x0C01` (`rlConsensusParams`). Una llamada a un precompilado inactivo devuelve datos vacíos en lugar de revertir, así que lee `active_static_precompiles` en `/cosmos/evm/vm/v1/params` antes de depender de uno. Consulta [Precompilados de EVM](/developer-guide/evm-precompiles#network-status).
- **Herramientas.** QoreChain todavía no está en `viem/chains`: importa las cadenas desde `@qorechain/evm` (desde 0.11.0). Sourcify todavía no enumera los ID de cadena 9800 ni 9801. El carril SVM no está abierto.

## Cómo usarlo {#how-to-use}

Todos los fragmentos que leen usan la testnet pública (`qorechain-diana`, ID de cadena EVM 9800), no necesitan clave y no envían nada. El ERC-20 de prueba en `0x9C2F20329750c16B215bDc50455d320De2a7Ba1c` es un token de la testnet (símbolo `WQOR`, 18 decimales); sustituye tanto el token como la dirección por los tuyos.

### Instalación por lenguaje {#install}

| Lenguaje o herramienta | Instalación | Estado | Plataforma mínima |
|---|---|---|---|
| TypeScript, lecturas EVM y ayudantes ERC | `npm install @qorechain/evm viem` (se resuelve a 0.8.0, que no tiene definiciones de cadena ni ayudantes de ventana) | Disponible hoy | Node.js 20 o posterior; peer `viem ^2` |
| TypeScript, firma del mensaje de ventana | `npm install @qorechain/sdk` (0.10.0 tiene `openEvmWindowMsg`, `fetchEvmWindow`, `EthNativeSigner`, `deriveUnifiedAccount`) | Disponible hoy | Node.js 20 o posterior |
| TypeScript, definiciones de cadena de viem y ayudantes de ventana | todavía ninguna | **Próximamente (0.11.0)** | Node.js 20 o posterior |
| Generador de proyectos, plantillas `evm-solidity`, `fullstack-web`, `rollup-app` | `npx create-qorechain-dapp my-app --template <name>` | Disponible hoy (0.10.0) | Node.js 20 o posterior |
| Generador de proyectos, plantillas `foundry`, `hardhat`, `viem-wagmi`, `cosmwasm` | todavía ninguna | **Próximamente (0.11.0)** | Foundry y Node.js 20; Node.js 22 para Hardhat 3; Rust y Docker para `cosmwasm` |
| Python (lecturas EVM) | `pip install "web3>=7,<8"`; mensaje de ventana desde `qorechain-sdk` 0.10.0 | Disponible hoy | Python 3.10 o posterior |
| Go (lecturas EVM) | `go get github.com/ethereum/go-ethereum@latest`; mensaje de ventana desde el SDK de Go de QoreChain v0.10.0 | Disponible hoy | Toolchain de Go |
| Rust (lecturas EVM) | `alloy = { version = "1", features = ["provider-http", "contract", "sol-types"] }`; mensaje de ventana desde el crate `qorechain-sdk` 0.10.0 | Disponible hoy | Rust estable |
| Java (lecturas EVM) | `org.web3j:core:5.0.0`; mensaje de ventana desde `io.github.qorechain:qorechain-sdk:0.10.0` | Disponible hoy | JDK 21 (el SDK de Java de QoreChain se compila con un toolchain de JDK 21) |

### Inicio rápido 1: leer con ethers v6 (disponible hoy) {#quickstart-ethers}

No hace falta ningún paquete de QoreChain. Ejecutado el 27 de octubre de 2026 contra la testnet, imprimió `chain id: 9800n`, un saldo y `token: WQOR 18n`.

```ts
import { Contract, JsonRpcProvider, formatEther } from "ethers";

const provider = new JsonRpcProvider("https://evm-testnet.qore.host", 9800, { staticNetwork: true });

const ADDRESS = "0x000000000000000000000000000000000000dEaD"; // any 0x address
const TOKEN = "0x9C2F20329750c16B215bDc50455d320De2a7Ba1c"; // a test ERC-20 on the testnet
const erc20 = new Contract(
  TOKEN,
  ["function symbol() view returns (string)", "function decimals() view returns (uint8)"],
  provider,
);

const { chainId } = await provider.getNetwork();
const balance = await provider.getBalance(ADDRESS);
const symbol: string = await erc20.symbol();
const decimals: bigint = await erc20.decimals();

console.log("chain id:", chainId); // 9800n
console.log("balance:", formatEther(balance), "QOR");
console.log("token:", symbol, decimals);
```

La misma lectura en web3.py, go-ethereum, alloy y web3j está en la guía del SDK `evm-quickstarts.md` (allí se informa de que se probó con web3.py 7.16, go-ethereum 1.17.10, alloy 1.8 y web3j 5.0.0 en JDK 21; esta página no los volvió a ejecutar).

### Inicio rápido 2: leer con el `@qorechain/evm` 0.8.0 publicado (disponible hoy) {#quickstart-evm-080}

Inicio rápido probado del centro para desarrolladores. Se conecta, detecta automáticamente el ID de cadena EVM e imprime el saldo de QOR de la cuenta del grifo público de la testnet.

```ts
import { createEvmClient } from "@qorechain/evm";
import { formatEther } from "viem";

// Public testnet EVM JSON-RPC (EVM chain ID 9800, auto-detected).
const client = await createEvmClient({ rpcUrl: "https://evm-testnet.qore.host" });

// A public testnet address (the testnet faucet account, EVM form).
const address = "0xf1e70c24817e00aee286f7275e14e61cabd20741";
const wei = await client.publicClient.getBalance({ address });
console.log(await client.getChainId(), address, formatEther(wei), "QOR");
```

### Inicio rápido 3: leer con la definición de cadena de viem (desde 0.11.0, próximamente) {#quickstart-viem}

Esto no se ejecuta hoy desde npm, porque 0.8.0 no tiene `qorechainTestnet`. Ejecutado el 27 de octubre de 2026 con la definición de cadena de 0.11.0 cargada desde el código fuente del repositorio (no desde npm), imprimió `chain id: 9800` y el token `WQOR`.

```ts
import { createPublicClient, erc20Abi, formatEther, http } from "viem";
import { qorechainTestnet } from "@qorechain/evm";

const client = createPublicClient({ chain: qorechainTestnet, transport: http() });

const ADDRESS = "0x000000000000000000000000000000000000dEaD"; // any 0x address
const TOKEN = "0x9C2F20329750c16B215bDc50455d320De2a7Ba1c"; // a test ERC-20 on the testnet

const chainId = await client.getChainId();
const balance = await client.getBalance({ address: ADDRESS });
const symbol = await client.readContract({ address: TOKEN, abi: erc20Abi, functionName: "symbol" });
const decimals = await client.readContract({ address: TOKEN, abi: erc20Abi, functionName: "decimals" });

console.log("chain id:", chainId); // 9800
console.log("balance:", formatEther(balance), "QOR");
console.log("token:", symbol, decimals);
```

### Inicio rápido 4: comprobar una ventana y componer el mensaje de apertura (desde 0.11.0, próximamente) {#quickstart-window-helpers}

Del README de `@qorechain/evm` en la etiqueta v0.11.0. Lee y después construye un objeto de mensaje; no firma ni envía. Para una cuenta sin ventana, `evmWindowStatus` devuelve `found: false, live: false` (comprobado en ambas redes el 27 de octubre de 2026).

```ts
import { evmWindowStatus, openEvmWindowMessage, evmWindowCost } from "@qorechain/evm";

const w = await evmWindowStatus({ rest: "https://api-testnet.qore.host", address: "0x..." });
// w.live, w.remainingTxs, w.remainingValue (uqor), w.remainingBlocks

const msg = openEvmWindowMessage({
  sender: "qor1...", // the same account; toQorAddress("0x...") converts
  blocks: 600,
  maxTxs: 5,
  maxValue: evmWindowCost({ gas: 3_000_000n, maxFeePerGas: 112_500_000_000n }) * 5n,
});
// Sign `msg` hybrid on the native lane, then read the nonce (opening advances it).
```

### Inicio rápido 5: abrir una ventana desde TypeScript (disponible hoy, SDK 0.10.0 y posteriores) {#quickstart-open-window}

De la guía del SDK `evm-quickstarts.md`, "Before you send". Esto **envía una transacción del carril nativo**: ejecútalo solo con tu propia cuenta de prueba con fondos, nunca con una frase compartida o pública.

```ts
import { StargateClient } from "@cosmjs/stargate";
import { EthNativeSigner, deriveUnifiedAccount, openEvmWindowMsg } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic); // account.evm = 0x..., account.cosmos = qor1...
const signer = new EthNativeSigner(account, { rest: "https://api-testnet.qore.host" });
const transport = await StargateClient.connect("https://rpc-testnet.qore.host");

await signer.signAndBroadcast(transport, {
  chainId: "qorechain-diana",
  accountNumber, // from /cosmos/auth/v1beta1/accounts/{qor1...}
  sequence,
  fee: { amount: [{ denom: "uqor", amount: "100000" }], gas: "800000" },
  messages: [openEvmWindowMsg({ sender: account.cosmos, blocks: 600, maxTxs: 5, maxValue: "3750000" })],
});
// Now read the nonce and send with viem, ethers, Foundry or Hardhat.
```

Este fragmento no se volvió a ejecutar para esta página. `maxValue: "3750000"` son 5 transacciones de 3,000,000 de gas con un tope de comisión de 250 gwei.

### Inicio rápido 6: generar un proyecto con el generador disponible {#quickstart-scaffold-live}

Probado el 27 de octubre de 2026 en un directorio vacío con `npx` desde el registro público de npm (0.10.0, plantilla `fullstack-web`): generó el proyecto y la compilación tuvo éxito.

```sh
npx -y create-qorechain-dapp my-dapp --template fullstack-web --network testnet --package-manager npm --yes
cd my-dapp && npm run build
```

### Las plantillas nuevas (desde 0.11.0, próximamente) {#new-templates-usage}

Una vez publicada la 0.11.0, el generador acepta los cuatro nombres de plantilla nuevos (consulta la tabla de indicadores más abajo). Un proyecto `foundry` se compila y se prueba entonces en local con `forge build` y `forge test` (sin red), y `pnpm window status` lee la cuenta, su clave PQC y su ventana. `pnpm window register` y `pnpm window open` difunden transacciones del carril nativo desde tu propia cuenta con fondos, y `forge script ... --broadcast` despliega. No pongas nunca una clave real en `.env.example`, no confirmes nunca `.env` y no financies nunca la frase de prueba pública de BIP-39 (`abandon` repetida 11 veces, y luego `about`).

## API principal {#main-api}

### `@qorechain/evm` (desde 0.11.0) {#api-evm}

| Nombre | Qué hace |
|---|---|
| `qorechain`, `qorechainTestnet` | Objetos de cadena de viem para 9801 y 9800 con endpoints públicos y explorador. |
| `QORECHAIN_CHAINS` | Ambas cadenas (mainnet y después testnet), para wagmi o RainbowKit. |
| `QORECHAIN_REST_ENDPOINTS` | ID de cadena EVM a URL REST del carril nativo. |
| `evmWindowStatus` | Lee una ventana por REST: `{ found, live, remainingBlocks, remainingTxs, remainingValue, nativeOnly, allowedTargets, ... }`. |
| `parseEvmWindow` | Analiza la respuesta REST. |
| `openEvmWindowMessage` | Comprueba los límites y construye `MsgOpenEVMWindow` como `{ typeUrl, value }`. |
| `checkOpenEvmWindowParams` | Solo las comprobaciones de límites. |
| `evmWindowCost`, `weiToUqorCeil` | Dimensionado de la ventana en uqor. |
| `classifyEvmWindowRejection`, `isEvmWindowRejection` | Explican un rechazo: `no-pqc-key`, `no-window`, `exhausted`, `invalid`. |
| `toQorAddress`, `toEvmAddress` | Convierten entre `0x` y `qor1...` para la misma cuenta. |
| `OPEN_EVM_WINDOW_TYPE_URL`, `CLOSE_EVM_WINDOW_TYPE_URL`, `MAX_EVM_WINDOW_BLOCKS`, `MAX_EVM_WINDOW_TXS`, `MAX_EVM_WINDOW_TARGETS` | Constantes. |
| `@qorechain/evm/window` | Los ayudantes de ventana sin la dependencia de viem. |

`@qorechain/evm` no firma ni difunde transacciones del carril nativo; usa `@qorechain/sdk` o los SDK de lenguaje para eso.

### Construir y leer una ventana en cada SDK (disponible hoy, 0.10.0) {#api-window}

| Lenguaje | Abrir una ventana | Leer una ventana |
|---|---|---|
| TypeScript | `openEvmWindowMsg` (`@qorechain/sdk`); `openEvmWindowMessage` (`@qorechain/evm`, desde 0.11.0) | `fetchEvmWindow`; `evmWindowStatus` (desde 0.11.0) |
| Python | `qorsdk.msg.pqc.open_evm_window` | `qorsdk.evm_window.get_evm_window` |
| Go | `messages.NewOpenEVMWindow` (`NewOpenEVMWindowScoped` para `nativeOnly` o `allowedTargets`) | REST `/qorechain/pqc/v1/evm_window/{address}` |
| Rust | `qorechain::msg::pqc::open_evm_window` | REST `/qorechain/pqc/v1/evm_window/{address}` |
| Java | `io.github.qorechain.evm.EvmWindow.open` | `EvmWindow.restPath` |

Consentimiento EIP-7702 (TypeScript, `@qorechain/sdk` 0.10.0): `authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `classifyEvmDelegationRejection`.

`@qorechain/react` 0.11.0 añade `PqcStatusBadge` (etiquetas por defecto "PQC key registered" y "No PQC key").

### Indicadores de `create-qorechain-dapp` {#api-scaffolder}

| Indicador | Qué hace |
|---|---|
| `-t, --template <name>` | `evm-solidity`, `fullstack-web`, `rollup-app` (disponibles hoy); `foundry`, `hardhat`, `viem-wagmi`, `cosmwasm` (desde 0.11.0). |
| `--network <name>` | Preajuste `testnet` o `mainnet`. |
| `--package-manager <pm>` | `pnpm`, `npm` o `yarn`. |
| `-y, --yes` | Omite las preguntas y usa los valores por defecto. |
| `--no-install` | No instala las dependencias. |
| `-h, --help` / `-v, --version` | Ayuda y versión. |

### Scripts de las plantillas (desde 0.11.0) {#api-template-scripts}

| Plantilla | Script | Qué hace |
|---|---|---|
| `foundry`, `hardhat` | `pnpm window status` | Muestra la cuenta, si su clave ML-DSA-87 está registrada (y si es esta clave) y su ventana. |
| `foundry`, `hardhat` | `pnpm window register` | Registra la clave ML-DSA-87 de la cuenta, una vez por cuenta. |
| `foundry`, `hardhat` | `pnpm window open` | Abre una ventana (por defecto 600 bloques, 5 transacciones). |
| `foundry` | `pnpm deploy:testnet` | `forge script script/Counter.s.sol --rpc-url qorechain_testnet --broadcast`. |
| `hardhat` | `pnpm build`, `pnpm test`, `pnpm deploy:testnet` | Compilación de Hardhat, pruebas, despliegue con Ignition en `qorechainTestnet`. |
| `viem-wagmi` | `pnpm dev`, `pnpm build` | Servidor de desarrollo en `http://localhost:5173`; compilación de producción. |
| `cosmwasm` | `pnpm build:wasm`, `pnpm propose-store`, `pnpm instantiate`, `pnpm query` | Compilación optimizada, propuesta de gobernanza para subir el código, instanciación (testnet), consultas REST. |

Variables de entorno de las plantillas (en `.env`, nunca confirmado en el repositorio): `PRIVATE_KEY`, `QORE_MNEMONIC`, `QORE_NETWORK` (`testnet` o `mainnet`), `QORE_WINDOW_BLOCKS`, `QORE_WINDOW_TXS`, `QORE_WINDOW_MAX_UQOR`, `COUNTER_INITIAL`; `QORE_CODE_ID` y `QORE_I_KNOW_THIS_IS_MAINNET=yes` para los scripts de CosmWasm (el script de propuesta rechaza la mainnet sin esta última); `VITE_WALLETCONNECT_PROJECT_ID` para una cartera WalletConnect en `viem-wagmi`.

## Cómo acceder {#how-to-access}

| | Testnet | Mainnet |
|---|---|---|
| ID de cadena nativa | `qorechain-diana` | `qorechain-vladi` |
| ID de cadena EVM (`eth_chainId`) | 9800 (`0x2648`) | 9801 (`0x2649`) |
| JSON-RPC de EVM | `https://evm-testnet.qore.host` | `https://evm.qore.host` |
| WebSocket de EVM | `wss://evm-ws-testnet.qore.host` | no publicado |
| REST | `https://api-testnet.qore.host` | `https://api.qore.host` |
| RPC de consenso | `https://rpc-testnet.qore.host` | `https://rpc.qore.host` |
| Explorador | `https://explore.qore.network` | `https://explore.qore.network` |

- **Las lecturas** no necesitan nada: ni cuenta, ni clave, ni ventana.
- **Enviar por el carril EVM** necesita una cuenta con fondos, su clave ML-DSA-87 registrada en la cadena (una vez) y una ventana abierta. El registro de la clave y la ventana son transacciones del carril nativo.
- **Coste.** El mínimo de comisión es 0.1 uqor por gas en ambas redes. Leer es gratis. El QOR de la testnet viene del [Grifo](/dashboard/faucet).
- **CosmWasm.** No se puede subir código sin gobernanza en ninguna de las dos redes; no hay instanciación en la mainnet sin gobernanza. La mainnet no tenía códigos almacenados el 27 de octubre de 2026.
- **Versiones de nodo y de herramientas.** Consulta la tabla de instalación de arriba.

## Dónde se publica {#where-published}

Versiones leídas en vivo de cada registro el 27 de octubre de 2026. La etiqueta de GitHub `v0.11.0` existe (27 de octubre de 2026), y todavía no hay un objeto de release de GitHub para ella (la última release es v0.10.0).

| Registro | Paquete | Versión disponible hoy | Estado de 0.11.0 | Enlace |
|---|---|---|---|---|
| npm | `@qorechain/evm` | 0.8.0 | **pendiente, no publicado** | https://www.npmjs.com/package/@qorechain/evm |
| npm | `@qorechain/sdk` | 0.10.0 | **pendiente, no publicado** | https://www.npmjs.com/package/@qorechain/sdk |
| npm | `@qorechain/react` | 0.10.0 | **pendiente, no publicado** | https://www.npmjs.com/package/@qorechain/react |
| npm | `@qorechain/svm` | 0.8.0 | **pendiente, no publicado** | https://www.npmjs.com/package/@qorechain/svm |
| npm | `create-qorechain-dapp` | 0.10.0 (plantillas `evm-solidity`, `fullstack-web`, `rollup-app`) | **pendiente, no publicado** | https://www.npmjs.com/package/create-qorechain-dapp |
| npm | `@qorechain/qorex-rainbowkit` (usado por `viem-wagmi`) | 0.1.0 | no forma parte de 0.11.0 | https://www.npmjs.com/package/@qorechain/qorex-rainbowkit |
| PyPI | `qorechain-sdk` | 0.10.0 | no forma parte de 0.11.0 | https://pypi.org/project/qorechain-sdk/ |
| crates.io | `qorechain-sdk` | 0.10.0 | no forma parte de 0.11.0 | https://crates.io/crates/qorechain-sdk |
| Proxy de Go | `github.com/qorechain/qorechain-sdk/packages/go` | v0.10.0 | no forma parte de 0.11.0 | https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go |
| Maven Central | `io.github.qorechain:qorechain-sdk` | 0.10.0 | no forma parte de 0.11.0 | https://central.sonatype.com/artifact/io.github.qorechain/qorechain-sdk |

Código fuente: [github.com/qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk), etiqueta `v0.11.0`; rutas `packages/evm`, `cli/`, `templates/`, `docs/docs/guides/`, `contrib/`. Apache-2.0, mantenido por la Asociación QoreChain.

## Límites y problemas conocidos {#limits}

- **0.11.0 todavía no está en npm.** Todo lo marcado "desde 0.11.0" (las definiciones de cadena de viem, los ayudantes de ventana, `@qorechain/evm/window`, las cuatro plantillas nuevas, `PqcStatusBadge`) no se puede instalar hoy desde un registro. Las plantillas nuevas dependen de paquetes `^0.11.0`, así que ni siquiera un proyecto generado desde el repositorio se instalará desde npm hasta la publicación. Esta página cambiará cuando npm sirva 0.11.0.
- **0.11.0 cambia solo los paquetes de npm.** Python, Rust, Go y Java se quedan en 0.10.0, que ya contiene los constructores de ventana indicados arriba.
- **`@qorechain/evm` lee la ventana y compone el mensaje; no firma ni difunde** transacciones del carril nativo.
- **Ningún ayudante abre una ventana automáticamente antes de un envío**, por diseño.
- **La cartera QoreX de la plantilla `viem-wagmi`** responde a `eth_chainId`, `eth_accounts`, `eth_requestAccounts` y `wallet_switchEthereumChain`; sus métodos de firma EVM todavía no están disponibles. Úsala para conectar y leer, y firma con una cartera EIP-1193 inyectada.
- **El ayudante `pnpm window` de las plantillas deriva la clave ML-DSA-87 del mismo secreto que la clave EVM.** Si la clave de la cuenta la registró otra cartera, abre la ventana desde esa cartera.
- **No disponibles en los endpoints públicos:** transacciones blob, trazas y los espacios de nombres `debug`, `personal`, `admin` y `miner`.
- **La subida de CosmWasm pasa por gobernanza en ambas redes**; la plantilla `cosmwasm` no puede almacenar código por sí misma.
- **Las contribuciones a otras herramientas** (viem, Sourcify, Scaffold-ETH 2) son archivos preparados en el repositorio, no fusionados en los proyectos de origen.
- **Precompilados de EVM en la mainnet:** ninguno está activo. `pqcVerify` (`0x0A01`) y `pqcKeyStatus` (`0x0A02`) están activos solo en la testnet.
- **El estado de la red tiene fecha.** Las cifras de comisiones y tiempos de bloque se leyeron el 27 de octubre de 2026.

## Notas de seguridad {#security}

- El diseño de la ventana significa que la clave secp256k1 que guarda una biblioteca EVM nunca puede autorizar un gasto por sí sola: abrir una ventana necesita una firma híbrida con la clave ML-DSA-87 de la cuenta. Mantén las ventanas pequeñas (`blocks`, `maxTxs`, `maxValue`) y usa `nativeOnly` o `allowedTargets` siempre que puedas.
- `maxValue` incluye la comisión máxima de cada transacción; dimensiónalo con `evmWindowCost` y no solo por el valor.
- Las plantillas leen las claves de `.env`, que está ignorado por git; `.env.example` contiene marcadores de posición. Los usuarios de Hardhat pueden guardar la clave cifrada con `npx hardhat keystore set PRIVATE_KEY`.
- No financies nunca la frase de prueba pública de BIP-39 (`abandon` repetida 11 veces, y luego `about`).
- Para una propuesta de CosmWasm en la mainnet, publica el código fuente y una compilación reproducible (el optimizador imprime la suma de comprobación) para que los votantes puedan verificar el binario.
- Informa de las vulnerabilidades en privado a security@qore.network.

## Páginas relacionadas {#related}

- [Resumen de paquetes para desarrolladores](/developer-tools/overview) y [Generadores y CLI](/developer-tools/scaffolders-and-cli) (el `create-qorechain-dapp` 0.10.0 disponible)
- [Visión general del SDK](/sdk/overview), [Instalación del SDK](/sdk/install) y la [guía de EVM](/sdk/guides/evm) (ventana, ventanas acotadas, consentimiento EIP-7702, precompilados)
- [Desarrollo EVM](/developer-guide/evm-development) y [Precompilados de EVM](/developer-guide/evm-precompiles#network-status)
- [Desarrollo con QoreChain Native](/developer-guide/cosmwasm-development) (CosmWasm y propuestas de gobernanza)
- [Integraciones de QoreX](/developer-tools/qorex-integrations) (`@qorechain/qorex-rainbowkit`)
- [QoreSign](/qoresign/overview) (firma híbrida en el carril nativo)
- [QoreScan](/developer-tools/qorescan) (inventario del uso de `ecrecover` y de los precompilados PQC en fuentes de Solidity)
