---
slug: /developer-tools/overview
title: Paquetes para desarrolladores
sidebar_label: Visión general
sidebar_position: 1
---

# Paquetes para desarrolladores

QoreChain publica sus herramientas para desarrolladores como paquetes pequeños en los registros públicos (npm, PyPI, crates.io, el proxy de módulos de Go, Maven Central y Swift Package Manager). Esta página es el índice: para qué sirve cada paquete, su nombre exacto en el registro, lenguaje, versión actual, comando de instalación y estado, y dónde leer cómo usarlo. Está pensada para desarrolladores que crean dApps, monederos, backends y rollups en QoreChain y quieren elegir el paquete adecuado antes de leer una guía.

Las versiones de las tablas se leyeron de los registros el 27 de octubre de 2026. Mainnet `qorechain-vladi` ejecuta v3.2.4 y testnet `qorechain-diana` ejecuta v3.2.6. Todos los paquetes listados como publicados tienen licencia Apache-2.0.

## Innovaciones {#innovations}

- **Un único formato de firma híbrida en todos los lenguajes.** La cadena exige una firma secp256k1 más una firma ML-DSA-87 (FIPS 204) en las transacciones del carril nativo. QoreSign reproduce byte a byte sus vectores de prueba publicados en TypeScript, Rust, Go, Swift, Kotlin y Python, y `qorechain-pqc` ejecuta un conjunto compartido de vectores en sus seis bindings, de modo que una clave o una firma creada en un lenguaje se verifica en los demás.
- **La forma de los sign-bytes se elige a partir del estado de la cadena, no a ojo.** El SDK, el wallet adapter, `chain-bridge` y los ayudantes de red de QoreSign piden al nodo `GET /cosmos/upgrade/v1beta1/applied_plan/{name}` para ambos nombres de actualización (`v3.2.0` y `v3.1.98`) y firman la forma v2 cuando cualquiera de las dos alturas es mayor que cero. Sin un endpoint REST en estas dos cadenas, lanzan un error en lugar de adivinar. Ambas redes verifican v2 hoy (comprobado el 27 de octubre de 2026: `v3.2.0` aplicada en mainnet en la altura 2,981,742 y `v3.1.98` en testnet en la altura 5,746,000).
- **Inicios rápidos que se ejecutaron, no solo se escribieron.** En los paquetes que tienen uno, el ejemplo se ejecutó el 27 de octubre de 2026 tras instalar desde el registro público. 31 de las 34 entradas de inicio rápido se ejecutaron y pasaron; el manifiesto registra cuáles tres no (consulta [Límites](#limits)).
- **Un manifiesto detrás de las tablas.** Los nombres de paquete, las versiones y los comandos de instalación de esta página proceden de un único manifiesto legible por máquina, con un endpoint de versión en vivo por paquete, los mismos datos con los que se construye el centro de SDK de la [página Developers del panel](/dashboard/developers#sdks).

## Cómo usarlo {#how-to-use}

Elige según lo que estés construyendo.

| Quieres | Usa | Lee |
|---|---|---|
| Leer el estado de la cadena, derivar cuentas, enviar transacciones con firma híbrida desde un script o una dApp | QoreChain SDK | [Visión general del SDK](/sdk/overview), [Instalación](/sdk/install), [Inicio rápido](/sdk/quickstart) |
| Firmar en tu propio monedero o backend, verificar firmas, Sign In With QoreChain | QoreSign | [Descripción general de QoreSign](/qoresign/overview), [Inicio rápido](/qoresign/quickstart) |
| Añadir QoreChain a Keplr, Leap o Cosmostation, generar monederos unificados, construir mensajes de ventana EVM y de clave vinculada | Wallet adapter | [Wallet adapter](/developer-tools/wallet-adapter) |
| Ejecutar una tarea de servidor que envíe QOR, registre claves o despliegue contratos | Chain bridge (o el SDK) | [Chain bridge y handles](/developer-tools/chain-bridge) |
| Resolver un `@handle` a una dirección verificada | Handles | [Chain bridge y handles](/developer-tools/chain-bridge#handles) |
| Permitir que tu dApp use el monedero QoreX, o probarla sin una extensión | Integraciones de QoreX | [Integraciones de QoreX](/developer-tools/qorex-integrations), [QoreX, para desarrolladores](/qorex/overview#developers) |
| Crear y operar un rollup de aplicación | RDK | [Visión general de los Rollups](/rollups/overview), [Despliegue de un rollup](/rollups/deploying-a-rollup) |
| Usar solo las primitivas post-cuánticas (ML-DSA, ML-KEM, SHAKE-256) | `qorechain-pqc` | [Firma poscuántica](/developer-guide/post-quantum-signing) |
| Permitir que un agente de IA o una herramienta para desarrolladores lea la cadena (bloques, transacciones, cuentas, estado de la firma híbrida, simulación, transferencias sin firmar) | Servidor MCP de QoreChain | [Servidor MCP de QoreChain](/developer-tools/mcp) |
| Leer la cadena desde una terminal o un script de shell, con salida JSON | CLI `qore` | [CLI de QoreChain](/developer-tools/qore-cli) |
| Leer cómo se protegió una transacción confirmada (mensajes, firmante, comisión, capa ML-DSA-87, nivel) | Inspector de transacciones de QoreSign (`inspectTransaction`) | [Descripción general de QoreSign](/qoresign/overview#inspector) |
| Cifrar datos hacia cuentas de QoreChain, grupos privados o sidechains con ML-KEM-1024 | QoreSeal | [QoreSeal](/developer-tools/qoreseal) |
| Revisar o probar el diseño de un cliente ligero poscuántico (verificación de checkpoints) | Cliente ligero PQ | [Cliente ligero PQ](/developer-tools/pq-light-client) |
| Integrar QoreChain como custodio o exchange (comprobación de direcciones, verificación de retiros, acreditación de depósitos) | Kit de custodia | [Kit de custodia](/developer-tools/custody-kit) |
| Inventariar la criptografía de un nodo, una red o código fuente Solidity como CBOM de CycloneDX | QoreScan | [QoreScan](/developer-tools/qorescan) |
| Construir y probar proyectos de Solidity o CosmWasm en QoreChain con Foundry, Hardhat o viem | Kit de desarrollo de cadena (SDK 0.11.0, próximamente) | [Kit de desarrollo de cadena](/developer-tools/chain-dev-sdk) |

Instala un paquete y ejecuta su inicio rápido primero contra la testnet pública. Las lecturas no necesitan cuenta, clave ni comisión.

## Cómo acceder {#how-to-access}

| | Testnet | Mainnet |
|---|---|---|
| ID de cadena | `qorechain-diana` | `qorechain-vladi` |
| ID de cadena EVM | 9800 | 9801 |
| REST | `https://api-testnet.qore.host` | `https://api.qore.host` |
| RPC de consenso | `https://rpc-testnet.qore.host` | `https://rpc.qore.host` |
| JSON-RPC EVM | `https://evm-testnet.qore.host` | `https://evm.qore.host` |
| JSON-RPC SVM | `https://svm-testnet.qore.host` | `https://svm.qore.host` |

- **Cuenta y claves:** ninguna para lecturas. Para enviar necesitas una cuenta con QOR (el QOR de testnet viene del [Faucet](/dashboard/faucet)) y, en el carril nativo, una clave ML-DSA-87 registrada para ella.
- **Coste:** los paquetes son gratuitos. Las transacciones pagan la comisión de red; el mínimo de comisión es 0.1 uqor por gas.
- **Reglas de firma:** una transacción del carril nativo debe llevar una firma híbrida (secp256k1 más ML-DSA-87). Una transacción EVM solo se acepta de una cuenta con una clave ML-DSA-87 registrada y una ventana de autorización EVM abierta. Las lecturas de SVM funcionan y las transacciones SVM todavía no están abiertas. Consulta [Cuentas y firma PQC](/sdk/concepts/accounts-pqc).
- **Convenciones de los inicios rápidos:** los ejemplos leen la cuenta del faucet público de testnet y firman con la frase de prueba pública (`abandon` once veces, y luego `about`). No fondees nunca una cuenta derivada de esa frase. Ningún inicio rápido envía una transacción.

### La página de desarrolladores del panel {#dashboard-developers}

El panel tiene una página pública en [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers). Comprobada el 27 de octubre de 2026, tiene seis pestañas (recorrido completo: [Developers](/dashboard/developers)):

- **SDKs:** el centro de SDK. Cada paquete del manifiesto, agrupado por producto, con un selector de lenguaje, la última versión leída en vivo de cada registro, líneas de instalación e importación con botones de copiar, el inicio rápido con la salida que observó el equipo del SDK, los problemas conocidos, y los ID de cadena y los endpoints públicos. Los paquetes que no están publicados no muestran comando de instalación.
- **PQ key status:** lee la clave ML-DSA-87 que una dirección tiene registrada en la cadena y su ventana de autorización EVM, en testnet o mainnet.
- **Simulator:** simula una transacción firmada (`TxRaw` en base64 o hex) y muestra el consumo de gas y los cambios de saldo. No se transmite nada.
- **Signing playground:** solo testnet. Genera en el navegador una clave híbrida desechable, mantenida en memoria, para firmar y verificar mensajes y solicitudes de Sign In With QoreChain.
- **QoreX test wallet:** solo testnet. Inyecta un monedero de prueba (`window.qorex`, anunciado mediante EIP-6963 como «QoreX (mock)») en la pestaña para que puedas probar flujos de dApp.
- **AI agents (MCP):** el estado del servidor MCP de QoreChain (publicado) y la configuración para un cliente MCP: primero `npx` local, más un endpoint alojado de testnet que necesita una clave de API. Consulta [Servidor MCP de QoreChain](/developer-tools/mcp).

Una pestaña **Transaction inspector** (pegas un hash y ves cada mensaje, el firmante, la comisión y si la firma poscuántica se verifica) todavía no está en la página del panel; el 27 de octubre de 2026 la página seguía mostrando las seis pestañas anteriores. La misma comprobación ya está disponible como función de biblioteca, `inspectTransaction`, en QoreSign 0.1.1 (TypeScript): consulta [Inspector de transacciones](/qoresign/overview#inspector). Las tablas de abajo y el centro de SDK muestran los mismos datos de paquetes; las tablas se contrastaron con los registros el 27 de octubre de 2026.

## Dónde está publicado {#where-published}

Cada nombre es el nombre exacto del registro. El enlace del paquete abre su página en el registro. «Publicado» significa que la versión mostrada se puede instalar hoy.

### QoreChain SDK {#group-sdk}

Guías: [Visión general del SDK](/sdk/overview), [Instalación](/sdk/install), [Kit de React](/sdk/guides/react), [Referencia de la CLI](/sdk/reference/cli). Código fuente: [qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk).

| Paquete | Lenguaje | Versión | Instalación | Estado |
|---|---|---|---|---|
| [`@qorechain/sdk`](https://www.npmjs.com/package/@qorechain/sdk) | TypeScript | 0.10.0 | `npm install @qorechain/sdk` | Publicado |
| [`@qorechain/react`](https://www.npmjs.com/package/@qorechain/react) | TypeScript (React) | 0.10.0 | `npm install @qorechain/react @qorechain/sdk react react-dom` | Publicado. Provider, hooks, `ConnectButton` y la insignia de estado PQC (exportada como `QuantumSafeBadge` en 0.10.0) |
| [`@qorechain/evm`](https://www.npmjs.com/package/@qorechain/evm) | TypeScript | 0.8.0 | `npm install @qorechain/evm viem` | Publicado |
| [`@qorechain/svm`](https://www.npmjs.com/package/@qorechain/svm) | TypeScript | 0.8.0 | `npm install @qorechain/svm @solana/web3.js` | Publicado. Solo lecturas en las redes en vivo |
| [`create-qorechain-dapp`](https://www.npmjs.com/package/create-qorechain-dapp) | TypeScript (CLI) | 0.10.0 | `npx create-qorechain-dapp my-dapp` | Publicado |
| [`qorechain-sdk`](https://pypi.org/project/qorechain-sdk/) | Python | 0.10.0 | `pip install qorechain-sdk` | Publicado |
| [`qorechain-sdk`](https://crates.io/crates/qorechain-sdk) | Rust | 0.10.0 | `cargo add qorechain-sdk tokio --features tokio/macros,tokio/rt-multi-thread` | Publicado |
| [`github.com/qorechain/qorechain-sdk/packages/go`](https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go) | Go | v0.10.0 | `go get github.com/qorechain/qorechain-sdk/packages/go@latest` | Publicado |
| [`io.github.qorechain:qorechain-sdk`](https://central.sonatype.com/artifact/io.github.qorechain/qorechain-sdk) | Java | 0.10.0 | `implementation("io.github.qorechain:qorechain-sdk:0.10.0")` | Publicado |

### QoreSign {#group-qoresign}

Guías: [Descripción general de QoreSign](/qoresign/overview), [Inicio rápido](/qoresign/quickstart), [Vectores de prueba](/qoresign/vectors). Código fuente: [qorechain/qoresign](https://github.com/qorechain/qoresign). La versión 0.1.1 se publicó el 27 de octubre de 2026. QoreSign firma en local; no guarda claves por ti y no hace firma con umbral, MPC ni con monedero de hardware.

| Paquete | Lenguaje | Versión | Instalación | Estado |
|---|---|---|---|---|
| [`@qorechain/qoresign`](https://www.npmjs.com/package/@qorechain/qoresign) | TypeScript | 0.1.1 | `npm install @qorechain/qoresign` | Publicado. Incluye `inspectTransaction` y `fetchEvmWindow` (nuevos en 0.1.1) |
| [`qorechain-qoresign`](https://crates.io/crates/qorechain-qoresign) | Rust (se importa como `qoresign`) | 0.1.1 | `cargo add qorechain-qoresign` | Publicado |
| [`github.com/qorechain/qoresign/go`](https://pkg.go.dev/github.com/qorechain/qoresign/go) | Go | v0.1.1 | `go get github.com/qorechain/qoresign/go@v0.1.1` | Publicado |
| [`qorechain-qoresign`](https://pypi.org/project/qorechain-qoresign/) | Python 3.9+ (se importa como `qoresign`) | 0.1.1 | `pip install qorechain-qoresign` | Publicado, nuevo en 0.1.1. Wheels para macOS (arm64, x86_64) y Linux (x86_64, aarch64); todavía no hay wheel para Windows. Solo funciones sin conexión |
| `QoreSign` (paquete Swift) | Swift (iOS 16+, macOS 13+) | 0.1.1 | `.package(url: "https://github.com/qorechain/qoresign", from: "0.1.1")`, producto `QoreSign` | Publicado como release de GitHub; el framework binario se descarga desde ahí |
| [`io.github.qorechain:qoresign`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) | Kotlin / JVM (JVM 17+, Kotlin 2.3+) | 0.1.1 | `implementation("io.github.qorechain:qoresign:0.1.1")` | Publicado |
| [`io.github.qorechain:qoresign-android`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign-android) | Kotlin (Android API 24+, Kotlin 2.3+) | 0.1.1 | `implementation("io.github.qorechain:qoresign-android:0.1.1")` | Publicado. Misma API que el artefacto JVM; su ejemplo se ejecutó solo en el artefacto JVM, no en un dispositivo Android |

Los artefactos de Kotlin y Android necesitan en tu proyecto el compilador de Kotlin 2.3 o posterior; un proyecto con Kotlin 2.1 falla al compilar contra ellos.

El paquete de TypeScript tiene una subruta `@qorechain/qoresign/network`, y el módulo de Go tiene los mismos ayudantes salvo `inspectTransaction` y `fetchEvmWindow`: `fetchPqKeyStatus`, `resolveSignBytesVersion`, `simulateTx` (con cambios de saldo), `suggestGasLimit`, `broadcastTx`, `submitWithSignBytesFallback` (una alternativa y luego se detiene), `verifySiwqWithChain` y `verifyMessageWithChain`. Los paquetes de Rust, Swift, Kotlin y Python no tienen código de red.

### QoreSeal {#group-qoreseal}

Página: [QoreSeal](/developer-tools/qoreseal). Código fuente: [qorechain/qoreseal](https://github.com/qorechain/qoreseal). QoreSeal 0.1.0 cifra datos hacia cuentas de QoreChain, grupos privados y sidechains con ML-KEM-1024 (FIPS 203). El cifrado funciona sin conexión; leer la clave de un destinatario desde la cadena necesita el registro de claves KEM, que está en vivo en la testnet y llega a mainnet tras la actualización v3.2.5. La construcción está pendiente de una revisión externa antes de 1.0.

| Paquete | Lenguaje | Versión | Instalación | Estado |
|---|---|---|---|---|
| [`qorechain-qoreseal`](https://crates.io/crates/qorechain-qoreseal) | Rust (se importa como `qoreseal`) | 0.1.0 | `cargo add qorechain-qoreseal` | Publicado |
| [`github.com/qorechain/qoreseal/go`](https://pkg.go.dev/github.com/qorechain/qoreseal/go) | Go | v0.1.0 | `go get github.com/qorechain/qoreseal/go@v0.1.0` | Publicado |
| [`qorechain-qoreseal`](https://pypi.org/project/qorechain-qoreseal/) | Python 3.9+ (se importa como `qoreseal`) | 0.1.0 | `pip install qorechain-qoreseal` | Publicado. Wheels para macOS (arm64, x86_64) y Linux (x86_64, aarch64); todavía no hay wheel para Windows |
| `QoreSeal` (paquete Swift) | Swift (iOS 16+, macOS 13+) | 0.1.0 | `.package(url: "https://github.com/qorechain/qoreseal", from: "0.1.0")`, producto `QoreSeal` | Publicado como release de GitHub; el framework binario se descarga desde ahí |
| [`io.github.qorechain:qoreseal`](https://central.sonatype.com/artifact/io.github.qorechain/qoreseal) | Kotlin / JVM (JVM 17+, Kotlin 2.3+) | 0.1.0 | `implementation("io.github.qorechain:qoreseal:0.1.0")` | Publicado en Maven Central |
| [`io.github.qorechain:qoreseal-android`](https://central.sonatype.com/artifact/io.github.qorechain/qoreseal-android) | Kotlin (Android API 24+, Kotlin 2.3+) | 0.1.0 | `implementation("io.github.qorechain:qoreseal-android:0.1.0")` | Publicado en Maven Central |
| `@qorechain/qoreseal` | TypeScript | todavía ninguna | ninguna | **No publicado** en npm (404 el 27 de octubre de 2026). El código fuente está en el repositorio |

### Cliente ligero PQ {#group-pq-light-client}

Página: [Cliente ligero PQ](/developer-tools/pq-light-client). Código fuente: [qorechain/qorechain-pq-light-client](https://github.com/qorechain/qorechain-pq-light-client). Una especificación en borrador y verificadores de referencia para checkpoints firmados con ML-DSA-87. No se conecta a mainnet ni a testnet: QoreChain no produce los checkpoints que verifica y no hay soporte de cadena planificado. Funciona con conjuntos de validadores simulados y vectores de prueba compartidos.

| Paquete | Lenguaje | Versión | Instalación | Estado |
|---|---|---|---|---|
| [`@qorechain/pq-light-client`](https://www.npmjs.com/package/@qorechain/pq-light-client) | TypeScript | 0.1.0 | `npm install @qorechain/pq-light-client` | Publicado. Depende de `@qorechain/pqc` 0.2.3 |
| [`qorechain-pq-light-client`](https://crates.io/crates/qorechain-pq-light-client) | Rust (biblioteca `qorechain_pq_light_client`) | 0.1.0 | `cargo add qorechain-pq-light-client` | Publicado |
| [`github.com/qorechain/qorechain-pq-light-client/go`](https://pkg.go.dev/github.com/qorechain/qorechain-pq-light-client/go) | Go (paquete `pqlightclient`) | v0.1.0 | `go get github.com/qorechain/qorechain-pq-light-client/go@v0.1.0` | Publicado |

### Kit de custodia {#group-custody-kit}

Página: [Kit de custodia](/developer-tools/custody-kit). Código fuente: [qorechain/qorechain-custody-kit](https://github.com/qorechain/qorechain-custody-kit). Una guía de integración, código de referencia y vectores de prueba para custodios y exchanges, en TypeScript, Python, Go, Rust y Java. Es código de referencia para leer, copiar o incorporar a tu repositorio, no un conjunto de paquetes: la única entrada en un registro es el módulo de Go.

| Paquete | Lenguaje | Versión | Instalación | Estado |
|---|---|---|---|---|
| Release de GitHub `v0.1.0` | TypeScript, Python, Go, Rust, Java | 0.1.0 | `git clone https://github.com/qorechain/qorechain-custody-kit`, y luego compila la carpeta de tu lenguaje | Publicado, 27 de octubre de 2026. Sin paquete de npm, PyPI, crates.io ni Maven, a propósito |
| [`github.com/qorechain/qorechain-custody-kit/code/go`](https://pkg.go.dev/github.com/qorechain/qorechain-custody-kit/code/go) | Go (paquete `custodykit`) | v0.1.0 | `go get github.com/qorechain/qorechain-custody-kit/code/go@v0.1.0` | Publicado |

### QoreScan {#group-qorescan}

Página: [QoreScan](/developer-tools/qorescan). Código fuente: [qorechain/qorescan](https://github.com/qorechain/qorescan). QoreScan Community 0.1.0 inventaría la criptografía de un despliegue de QoreChain (un directorio home de nodo, el estado de la red en vivo, endpoints TLS y código fuente Solidity) y escribe un CBOM de CycloneDX 1.6 e informes en Markdown. Es una ayuda de inventario, no una certificación ni una auditoría.

| Paquete | Lenguaje | Versión | Instalación | Estado |
|---|---|---|---|---|
| [Release de GitHub `v0.1.0`](https://github.com/qorechain/qorescan/releases/tag/v0.1.0) | Binarios para macOS, Linux y Windows (amd64, arm64) | 0.1.0 | descarga y comprueba con `qorescan_0.1.0_checksums.txt` | Publicado, 27 de octubre de 2026 |
| [`@qorechain/qorescan`](https://www.npmjs.com/package/@qorechain/qorescan) | Wrapper de npm (Node.js 18+) | 0.1.0 | `npx @qorechain/qorescan scan ...` | Publicado. Descarga y comprueba el binario del release en la primera ejecución |
| [`qorescan`](https://pypi.org/project/qorescan/) | Wrapper de PyPI (Python 3.9+) | 0.1.0 | `pipx run qorescan scan ...` o `pip install qorescan` | Publicado. Mismo comportamiento que el wrapper de npm |
| [`github.com/qorechain/qorescan`](https://pkg.go.dev/github.com/qorechain/qorescan) | Go | v0.1.0 | `go install github.com/qorechain/qorescan/cmd/qorescan@v0.1.0` | Publicado. Go 1.26 |

### Kit de desarrollo de cadena (SDK 0.11.0) {#group-chain-dev-sdk}

Página: [Kit de desarrollo de cadena](/developer-tools/chain-dev-sdk). Código fuente: [qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk). La parte de QoreChain SDK 0.11.0 pensada para equipos de Solidity y contratos inteligentes: definiciones de cadena para viem y ayudantes de ventana de autorización EVM en `@qorechain/evm`, cuatro plantillas nuevas de `create-qorechain-dapp` (Foundry, Hardhat 3, viem con wagmi y un token de QoreChain Native), inicios rápidos de EVM y una página sobre en qué se diferencia la EVM de QoreChain de Ethereum.

**Próximamente.** El SDK 0.11.0 está etiquetado en GitHub (`v0.11.0`) y su publicación en npm está pendiente: el 27 de octubre de 2026 npm servía `@qorechain/sdk` 0.10.0, `@qorechain/evm` 0.8.0 y `create-qorechain-dapp` 0.10.0, y `@qorechain/sdk@0.11.0` devolvía 404. Hasta que npm muestre 0.11.0, las nuevas definiciones de cadena, los ayudantes de ventana y las plantillas no se pueden instalar; los paquetes 0.10.0 de la [tabla del SDK](#group-sdk) son lo que obtienes hoy. 0.11.0 cambia solo los paquetes de npm: los SDK de Python, Rust, Go y Java se quedan en 0.10.0.

### Rollup Development Kit (RDK) {#group-rdk}

Guías: [Visión general de los Rollups](/rollups/overview), [Despliegue de un rollup](/rollups/deploying-a-rollup), [Arquitectura del Rollup Development Kit](/architecture/rollup-development-kit). Código fuente: [qorechain/qorechain-rdk](https://github.com/qorechain/qorechain-rdk).

| Paquete | Lenguaje | Versión | Instalación | Estado |
|---|---|---|---|---|
| [`@qorechain/rdk`](https://www.npmjs.com/package/@qorechain/rdk) | TypeScript | 0.7.0 | `npm install @qorechain/rdk` | Publicado. El único cliente RDK que firma en híbrido, y solo cuando pasas un `pqcKeypair` |
| [`@qorechain/rdk-cli`](https://www.npmjs.com/package/@qorechain/rdk-cli) | TypeScript (CLI `qorollup`) | 0.7.0 | `npm install -g @qorechain/rdk-cli` | Publicado. Desde 0.6.2 arranca a través del enlace bin de npm (0.6.1 y anteriores no imprimían nada). Sus comandos de transacción firman solo en clásico, lo cual las redes rechazan |
| [`create-qorechain-rollup`](https://www.npmjs.com/package/create-qorechain-rollup) | TypeScript (CLI) | 0.7.0 | `npx create-qorechain-rollup my-rollup` | Publicado |
| [`qorechain-rdk`](https://pypi.org/project/qorechain-rdk/) | Python (3.10+, se importa `qorrdk`) | 0.7.0 | `pip install qorechain-rdk` | Publicado. Las lecturas funcionan; las transacciones firman solo en clásico |
| [`qorechain-rdk`](https://crates.io/crates/qorechain-rdk) | Rust | 0.7.0 | `cargo add qorechain-rdk` | Publicado. Las lecturas funcionan; las transacciones firman solo en clásico |
| [`github.com/qorechain/qorechain-rdk/packages/go`](https://pkg.go.dev/github.com/qorechain/qorechain-rdk/packages/go) | Go | v0.7.0 | `go get github.com/qorechain/qorechain-rdk/packages/go@v0.7.0` | Publicado. Las lecturas funcionan; las transacciones firman solo en clásico |
| [`io.github.qorechain:qorechain-rdk`](https://central.sonatype.com/artifact/io.github.qorechain/qorechain-rdk) | Java (JDK 17+) | 0.7.0 | `implementation("io.github.qorechain:qorechain-rdk:0.7.0")` | Publicado. Las lecturas funcionan; las transacciones firman solo en clásico |

### Primitivas post-cuánticas (`qorechain-pqc`) {#group-pqc}

Guía: [Firma poscuántica](/developer-guide/post-quantum-signing). Código fuente: [qorechain/qorechain-pqc](https://github.com/qorechain/qorechain-pqc). La firma ML-DSA es determinista por defecto en todos los bindings; la firma hedged es una opción explícita.

| Paquete | Lenguaje | Versión | Instalación | Estado |
|---|---|---|---|---|
| [`@qorechain/pqc`](https://www.npmjs.com/package/@qorechain/pqc) | TypeScript | 0.2.3 | `npm install @qorechain/pqc` | Publicado |
| [`qorechain-pqc`](https://pypi.org/project/qorechain-pqc/) | Python (3.9+) | 0.2.3 | `pip install qorechain-pqc` | Publicado. Necesita liboqs; la primera importación lo compila si falta (git, CMake y un compilador de C) |
| [`qorechain-pqc`](https://crates.io/crates/qorechain-pqc) | Rust | 0.2.3 | `cargo add qorechain-pqc` | Publicado |
| [`github.com/qorechain/qorechain-pqc/go`](https://pkg.go.dev/github.com/qorechain/qorechain-pqc/go) | Go | v0.2.3 | `go get github.com/qorechain/qorechain-pqc/go` | Publicado |
| [`io.github.qorechain:qorechain-pqc`](https://central.sonatype.com/artifact/io.github.qorechain/qorechain-pqc) | Java | 0.2.3 | `implementation("io.github.qorechain:qorechain-pqc:0.2.3")` | Publicado |
| Biblioteca C | C | 0.2.3 | compila `c/` desde el repositorio (necesita liboqs y OpenSSL) | Solo código fuente, sin registro de paquetes |

### Wallet adapter {#group-wallet-adapter}

Página: [Wallet adapter](/developer-tools/wallet-adapter). Código fuente: [qorechain/qorechain-wallet-adapter](https://github.com/qorechain/qorechain-wallet-adapter).

| Paquete | Lenguaje | Versión | Instalación | Estado |
|---|---|---|---|---|
| [`@qorechain/wallet-adapter`](https://www.npmjs.com/package/@qorechain/wallet-adapter) | TypeScript (módulo ES, JavaScript puro con tipados) | 0.4.0 | `npm install @qorechain/wallet-adapter @cosmjs/stargate @cosmjs/proto-signing` | Publicado. Sin inicio rápido probado |

### Chain bridge {#group-chain-bridge}

Página: [Chain bridge y handles](/developer-tools/chain-bridge).

| Paquete | Lenguaje | Versión | Instalación | Estado |
|---|---|---|---|---|
| [`@qorechain/chain-bridge`](https://www.npmjs.com/package/@qorechain/chain-bridge) | TypeScript (servidor Node.js) | 0.2.3 | `npm install @qorechain/chain-bridge` | Publicado. Sin inicio rápido probado. El registro no lista ningún repositorio de código fuente |

### Handles {#group-handles}

Página: [Chain bridge y handles](/developer-tools/chain-bridge#handles).

| Paquete | Lenguaje | Versión | Instalación | Estado |
|---|---|---|---|---|
| [`@qorechain/handles`](https://www.npmjs.com/package/@qorechain/handles) | TypeScript | 0.1.0 | `npm install @qorechain/handles` | Publicado. Verifica la resolución de un handle contra una clave de registro anclada. No ancla direcciones por sí mismo: el llamador aporta el almacén de anclajes y decide cuándo anclar. Sin inicio rápido probado. El registro no lista ningún repositorio de código fuente |

### Integraciones de QoreX {#group-qorex}

Guía: [QoreX, para desarrolladores](/qorex/overview#developers). Código fuente: [qorechain/qorex-integrations](https://github.com/qorechain/qorex-integrations). Los seis se publicaron el 27 de octubre de 2026.

| Paquete | Lenguaje | Versión | Instalación | Estado |
|---|---|---|---|---|
| [`@qorechain/qorex-types`](https://www.npmjs.com/package/@qorechain/qorex-types) | TypeScript | 0.1.0 | `npm install @qorechain/qorex-types` | Publicado. Encuentra QoreX (EIP-6963 y el proveedor nativo) |
| [`@qorechain/qorex-rainbowkit`](https://www.npmjs.com/package/@qorechain/qorex-rainbowkit) | TypeScript | 0.1.0 | `npm install @qorechain/qorex-rainbowkit @rainbow-me/rainbowkit wagmi viem @tanstack/react-query` | Publicado |
| [`@qorechain/qorex-interchain-kit`](https://www.npmjs.com/package/@qorechain/qorex-interchain-kit) | TypeScript (React) | 0.1.0 | `npm install @qorechain/qorex-interchain-kit @interchain-kit/core @interchain-kit/react` | Publicado |
| [`@qorechain/qorex-cosmos-kit`](https://www.npmjs.com/package/@qorechain/qorex-cosmos-kit) | TypeScript (React) | 0.1.0 | `npm install @qorechain/qorex-cosmos-kit @cosmos-kit/core @cosmos-kit/react` | Publicado. Con `@cosmos-kit/react` 2.24 pasa `throwErrors={false}`; el fragmento del README lo omite |
| [`@qorechain/qorex-wallet-mock`](https://www.npmjs.com/package/@qorechain/qorex-wallet-mock) | TypeScript | 0.1.0 | `npm install -D @qorechain/qorex-wallet-mock` | Publicado. Un monedero de prueba que firma de verdad en testnet |
| [`@qorechain/qorex-synpress`](https://www.npmjs.com/package/@qorechain/qorex-synpress) | TypeScript | 0.1.0 | `npm install -D @qorechain/qorex-synpress @playwright/test` | Publicado. Fixtures de Playwright; el modo extensión lanza un error hoy |

### Connect (obsoleto) {#group-connect}

| Paquete | Lenguaje | Versión | Instalación | Estado |
|---|---|---|---|---|
| [`@qorechain/connect`](https://www.npmjs.com/package/@qorechain/connect) | TypeScript | 0.2.1 | ninguna | **Obsoleto y sin mantenimiento.** No lo uses en trabajo nuevo. Sustitúyelo como en la tabla de abajo |

:::caution @qorechain/connect está obsoleto
`@qorechain/connect` está marcado como obsoleto en npm. Su rango de peer es `@qorechain/wallet-adapter` `^0.2.1`, que no incluye 0.4.0, y no abre una [ventana de autorización EVM](/sdk/guides/evm#evm-window), de modo que un envío EVM a través de él se rechaza hasta que la cuenta tenga una clave registrada y una ventana abierta. El repositorio listado en sus metadatos del registro no es accesible públicamente.
:::

| Necesidad | Usa en su lugar |
|---|---|
| Detectar QoreX (EVM, nativo, Solana) | `@qorechain/qorex-types` |
| dApps EVM con RainbowKit y wagmi | `@qorechain/qorex-rainbowkit` |
| dApps de Cosmos | `@qorechain/qorex-interchain-kit` (o `@qorechain/qorex-cosmos-kit`) |
| Firma híbrida en tu propio monedero o backend | `@qorechain/qoresign` |

### QORel, el relayer de IBC {#group-qorel}

| Paquete | Dónde | Versión | Instalación | Estado |
|---|---|---|---|---|
| QORel (`qorel`) | Release de GitHub `qorel-v0.1.0`, Homebrew, contenedor `ghcr.io/qorechain/qorel` | 0.1.0 | `brew install qorechain/tap/qorel` | Publicado como prelanzamiento. Solo IBC v1; solo testnet. Consulta [QORel](/qorel/overview) |

### Servidor MCP y CLI {#group-mcp}

Páginas: [Servidor MCP de QoreChain](/developer-tools/mcp), [CLI de QoreChain](/developer-tools/qore-cli). Código fuente: [qorechain/qorechain-mcp](https://github.com/qorechain/qorechain-mcp) (público). Ambos leen la cadena y ninguno firma, custodia claves ni transmite. Publicados el 27 de octubre de 2026.

| Paquete | Lenguaje | Versión | Instalación | Estado |
|---|---|---|---|---|
| [`@qorechain/mcp`](https://www.npmjs.com/package/@qorechain/mcp) | TypeScript (servidor Node.js, bin `qorechain-mcp`) | 0.1.0 | `npx -y @qorechain/mcp` | Publicado. stdio y Streamable HTTP. Un endpoint alojado, `https://mcp.qorechain.io/mcp`, necesita una clave de API, solicitada desde su panel |
| [`qorechain-mcp`](https://pypi.org/project/qorechain-mcp/) | Python (3.10+) | 0.1.0 | `pip install qorechain-mcp` (o `uvx qorechain-mcp`) | Publicado. Las mismas herramientas que el paquete de npm; solo stdio |
| [`@qorechain/qore-cli`](https://www.npmjs.com/package/@qorechain/qore-cli) | TypeScript (CLI `qore`) | 0.1.0 | `npm install -g @qorechain/qore-cli` | Publicado. Salida `--json` idéntica a la salida de las herramientas MCP |

### Planificado (no publicado) {#planned}

Estos todavía no están en su registro, así que no hay nada que instalar y el comportamiento descrito para ellos todavía no se puede usar. Cada uno devolvió 404 (o no figuraba) el 27 de octubre de 2026.

| Paquete | Uso previsto | Estado |
|---|---|---|
| `@qorechain/qoreseal` en npm | QoreSeal para TypeScript | No publicado; el código fuente está en el repositorio |
| `@qorechain/sdk`, `@qorechain/evm`, `@qorechain/react`, `@qorechain/svm`, `create-qorechain-dapp` 0.11.0 en npm | El [kit de desarrollo de cadena](/developer-tools/chain-dev-sdk) | Etiquetado en GitHub, publicación en npm pendiente |

## Cómo obtener las versiones en vivo {#live-versions}

Las tablas son una instantánea. Para leer tú mismo la versión actual de un paquete:

| Registro | Solicitud | Campo |
|---|---|---|
| npm | `https://registry.npmjs.org/<name>/latest` | `version` |
| PyPI | `https://pypi.org/pypi/<name>/json` | `info.version` |
| crates.io | `https://crates.io/api/v1/crates/<name>` (envía una cabecera `User-Agent` o la solicitud se rechaza) | `crate.max_stable_version` |
| Go | `https://proxy.golang.org/<module>/@latest` | `Version` (quita la `v` inicial) |
| Maven Central | `https://repo1.maven.org/maven2/<group path>/<artifact>/maven-metadata.xml` | `<release>` |
| Swift | `https://api.github.com/repos/qorechain/qoresign/releases/latest` | `tag_name` (quita la `v` inicial); las llamadas a GitHub sin autenticar están limitadas a 60 por hora por dirección |

En un nombre de npm con ámbito conserva la `@`, por ejemplo `https://registry.npmjs.org/@qorechain/sdk/latest`. Un 404 significa que el paquete no está publicado. El proxy de Go puede responder `@latest` desde una caché durante un breve tiempo tras una publicación, así que fija la versión en el comando cuando necesites una concreta (la instalación de Go del RDK de arriba lo hace). La página de cada paquete en su registro también muestra la versión y el historial de publicaciones.

## Límites y problemas conocidos {#limits}

- **Dos redes en vivo, versiones distintas.** Mainnet ejecuta v3.2.4 y testnet ejecuta v3.2.6. Una función que existe solo en testnet se marca en su propia página. No asumas el comportamiento de v3.2.5 en mainnet.
- **Todavía no están en vivo:** la pestaña Transaction inspector de la página de desarrolladores del panel (la función de biblioteca `inspectTransaction` de QoreSign 0.1.1 sí está publicada), `@qorechain/qoreseal` en npm, el SDK 0.11.0 (el kit de desarrollo de cadena) en npm, las transacciones SVM y los precompilados EVM en mainnet (solo están activos en testnet; consulta la [visión general del SDK](/sdk/overview) para la lista carril por carril).
- **Registro de QoreSeal y cliente ligero PQ.** Cifrar hacia una dirección leída desde la cadena necesita el registro de claves KEM, en vivo en testnet y que llega a mainnet tras v3.2.5. El cliente ligero PQ no se conecta a ninguna de las dos redes; no hay soporte de cadena planificado para sus checkpoints.
- **Kotlin 2.3 o posterior.** Los artefactos de Kotlin y Android de QoreSign y QoreSeal necesitan el compilador de Kotlin 2.3 o posterior; con Kotlin 2.1 falla la compilación contra ellos.
- **Sin wheels para Windows.** Los paquetes de Python de QoreSign y QoreSeal tienen wheels solo para macOS y Linux; otras plataformas compilan desde la distribución de código fuente, que necesita Rust.
- **Ejemplos no ejecutados:** de las 34 entradas de inicio rápido, 31 se ejecutaron y pasaron el 27 de octubre de 2026. El ejemplo de QoreSign en Python se ejecutó tras publicarse el paquete (macOS arm64 y Linux aarch64) y el ejemplo de QoreSign para Android no se ejecutó en un dispositivo. El wallet adapter, chain bridge y handles no tienen inicio rápido, así que sus ejemplos en este manual proceden de los tipados y el código fuente del paquete y no se ejecutaron de extremo a extremo.
- **`@qorechain/rdk-cli` anterior a 0.6.2** no imprimía nada al arrancar a través del enlace bin de npm, y su `--version` imprimía 0.4.1. **`@qorechain/rdk` anterior a 0.7.0** construía pruebas de retirada que nunca se verificaban en la cadena. Usa 0.7.0.
- **Conflicto de versión de cosmjs.** `@qorechain/wallet-adapter` y `@qorechain/chain-bridge` usan cosmjs 0.32; el SDK usa cosmjs 0.39. Instalar el adapter junto al SDK en un mismo proyecto hace que npm informe `ERESOLVE`. Mantenlos en proyectos separados o pasa `--legacy-peer-deps`.
- **Copia anidada del SDK en versiones antiguas del RDK.** `@qorechain/rdk` 0.6.2 y anteriores dependen de `@qorechain/sdk` `^0.9.0`, así que una app con el SDK 0.10.0 obtenía una segunda copia anidada del SDK 0.9.x. Desde 0.7.0 el kit depende de `@qorechain/sdk` `^0.10.0` y comparte una única copia.
- **Clientes RDK solo clásicos.** Los clientes RDK de Python, Rust, Go y Java firman solo en clásico, lo cual el carril nativo rechaza en ambas redes; úsalos para lecturas, o usa el cliente de TypeScript con un `pqcKeypair` para las transacciones.
- **Paquetes sin repositorio de código fuente público.** `@qorechain/chain-bridge` y `@qorechain/handles` no listan ningún repositorio de código fuente en los metadatos de su registro. Puedes leer el contenido publicado del paquete en npm.
- **Python `qorechain-pqc`** no tiene generación de claves con semilla en 0.2.3, y necesita liboqs.
