---
slug: /introduction/key-features
title: Características principales
sidebar_label: Características principales
sidebar_position: 3
---

# Características principales

La siguiente tabla enumera todas las características importantes de QoreChain, organizadas según la fase de lanzamiento en la que se introdujeron. La mainnet (`qorechain-vladi`, EVM chain ID 9801), activa desde el 7 de junio de 2026, ejecuta **v3.2.4** (aplicada en la altura 3,742,566 el 23 de octubre de 2026); la testnet en paralelo (`qorechain-diana`, EVM chain ID 9800) ejecuta v3.2.4 desde el 19 de octubre de 2026. La tabla de [Estado de las características](#feature-status) al final de la lista muestra qué está activo hoy en las redes en producción.

| Característica             | Introducida en      | Descripción                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Firmas híbridas PQC (obligatorias por defecto) | v1.1.0 (Seguridad)   | Firmas duales en cada transacción de la ruta cosmos: una firma clásica secp256k1 (ECDSA) emparejada con ML-DSA-87 (Dilithium-5). A partir de v3.1.71 el valor predeterminado de la red es **required** (`hybrid_signature_mode = required`, `allow_classical_fallback = false`): las txs cosmos solo clásicas se rechazan; solo están exentas las gentxs de génesis y las txs de registro/migración de claves PQC. Las transacciones EVM conservan su firma `eth_secp256k1` pero, desde v3.2.0, solo se admiten desde una cuenta con una clave ML-DSA-87 registrada y una [ventana de autorización EVM](/getting-started/first-transaction#evm-window) abierta. Siguen disponibles tres modos de aplicación controlados por gobernanza (disabled / optional / required). |
| Hash SHAKE-256 por defecto     | v1.1.0 (Seguridad)   | Función de salida extensible (XOF) de la familia SHA-3. A partir de v3.1.73, SHAKE-256 (mediante el paquete `qorehash`) es el **hash de aplicación predeterminado**, completando la base PQC (Dilithium-5 + ML-KEM-1024 + SHAKE-256). Proporciona hashing de longitud variable, salida fija de 32 bytes, concatenación de nodos internos de Merkle y hashing con separación de dominio, todo en Go puro y sin dependencia de FFI. |
| Interfaces TEE y FL      | v1.1.0 (Seguridad)   | Especificaciones de interfaz (aún sin implementación) para la atestación de entornos de ejecución confiables (Trusted Execution Environment) (SGX, TDX, SEV-SNP, ARM CCA) y la coordinación de aprendizaje federado (Federated Learning) (métodos de agregación FedAvg, FedProx, SCAFFOLD); ambas están previstas para una versión futura. |
| Consenso RL on-chain (PRISM) | v1.0.0 (Génesis) | Un MLP de punto fijo nativo de Go (73.733 parámetros) está integrado en el ciclo de vida del bloque para la inferencia PPO. PRISM está diseñado para ajustar el tiempo de bloque, el precio del gas y los pesos de los pools; en las redes en producción actualmente solo observa (no se carga ninguna política entrenada y los mensajes de control están deshabilitados). La aritmética determinista de series de Taylor está diseñada para dar resultados idénticos en todos los validadores. Cuatro modos de operación (shadow, conservative, autonomous y paused); ambas redes están configuradas en conservative. Protección de disyuntor (circuit breaker) por seguridad. |
| Triple-Pool Composite PoS  | v1.0.0 (Génesis)    | Diseñado: los validadores se clasifican en pools RPoS (ponderado por reputación), DPoS (ponderado por delegación) y PoS (estándar) cada 1.000 bloques. La sortición ponderada por pool diversificaría la producción de bloques más allá del dominio puro del stake, y una curva de bonding personalizada tendría en cuenta el stake auto-vinculado, la duración de la lealtad, la calidad de la reputación y la fase del protocolo. Implementado en `x/qca`, pero **aún no activo en la producción de bloques, las recompensas ni el slashing**; la propuesta de bloques y el slashing siguen actualmente las reglas estándar ponderadas por stake. |
| Gobernanza QDRW            | v1.0.0 (Génesis)    | Delegación cuadrática con ponderación por reputación (Quadratic Delegation with Reputation Weighting). Diseñado para que el poder de voto use una función de raíz cuadrada amortiguada por un multiplicador de reputación sigmoidal, lo que evita la captura por ballenas y a la vez recompensa la participación honesta a largo plazo (una ventaja de stake de 100x rinde aproximadamente 10x de poder de voto; las posiciones de xQORE duplican el peso de voto). Implementado pero **desactivado en las redes en producción** (`qdrw` está apagado); las propuestas se escrutan actualmente según el stake vinculado. |
| Motor de quema                | v1.0.0 (Génesis)    | Doce fuentes de quema (comisiones de gas, creación de contratos, comisiones del servicio de IA, comisiones de puente, recompra de tesorería, transacciones fallidas, penalizaciones de xQORE, recompra automatizada, la quema del TGE, creación de rollups, hitos de recuento de transacciones y AMM); en mainnet, hasta ahora solo los canales de comisiones de gas y de transacciones fallidas han registrado quemas. Todo lo que hay en el recolector de comisiones, incluida la emisión de la época, se reparte **37% a los validadores, 30% quemado de forma permanente, 20% a la tesorería, 10% a los stakers y 3% a los nodos ligeros**. |
| Staking xQORE              | v1.0.0 (Génesis)    | Aún no está activo: las transacciones de bloqueo y desbloqueo del módulo no están conectadas en las redes en producción (consulta [Staking xQORE](/user-guide/xqore-staking)). Comportamiento diseñado: bloquea QOR para acuñar xQORE a una proporción 1:1 y obtener el doble de peso de gobernanza en las votaciones QDRW. Las penalizaciones de salida graduadas (50% antes de 30 días, 35% entre 30 y 90 días, 15% entre 90 y 180 días, 0% después de 180 días) se redistribuyen a los titulares restantes mediante el rebase PvP, recompensando la convicción y penalizando el capital a corto plazo. |
| Emisión limitada     | v1.0.0 (Génesis)    | Una trayectoria de suministro finito: 4.420.000.000 QOR en el génesis (80.000.000 QOR de los 4.500.000.000 previstos se quemaron en el TGE) más la emisión de staking acuñada por `x/inflation` bajo un tope acumulado estricto de 590.000.000 QOR (86.000 QOR por época de 43.200 bloques en modo `fixed`, desde la propuesta de gobernanza 10 de octubre de 2026). Las quemas eliminan tokens de forma permanente. Consulta [Tokenomics](/architecture/tokenomics#supply-and-emission). |
| Entorno de ejecución EVM                | v1.0.0 (Génesis)    | Compatibilidad total con Ethereum con precios de gas EIP-1559, JSON-RPC en el puerto 8545 (espacios de nombres `eth_`, `web3_`, `net_` y `txpool_`; el espacio de nombres `qor_` aún no se sirve) y soporte para las herramientas estándar (Hardhat, Foundry, Remix). Despliega e interactúa con contratos Solidity usando los flujos de trabajo existentes de Ethereum; desde v3.2.0 el remitente necesita una clave poscuántica registrada y una [ventana de autorización EVM](/getting-started/first-transaction#evm-window) abierta. |
| Entorno de ejecución QoreChain Native           | v1.0.0 (Génesis)    | El nombre que da QoreChain a su runtime CosmWasm: un motor de contratos inteligentes WebAssembly para contratos basados en Rust. Soporte completo del ciclo de vida: instantiate, execute, query y migrate. Los contratos se ejecutan en un entorno Wasm aislado con ejecución determinista. La carga de código y la instanciación están actualmente **deshabilitadas** en ambas redes (ajuste de gobernanza más disyuntor). |
| Entorno de ejecución SVM                | v1.0.0 (Génesis)    | Despliegue y ejecución de programas BPF mediante un ejecutor respaldado por Rust. El servidor JSON-RPC compatible con Solana en el puerto 8899 admite `getAccountInfo`, `getBalance`, `getSlot` y más. Los métodos de lectura funcionan en los endpoints públicos; el carril de transacciones SVM está actualmente **deshabilitado** en toda la red. |
| Puente entre VMs            | v1.0.0 (Génesis)    | Interoperabilidad fluida entre las tres VMs. Los contratos EVM llaman a QoreChain Native mediante precompile (aún no activo, consulta [Estado de la red](/developer-guide/evm-precompiles#network-status)); los contratos QoreChain Native llaman a EVM mediante mensajes personalizados; los programas SVM participan mediante un puenteo asíncrono basado en eventos. Llamadas síncronas EVM-QoreChain Native y mensajería asíncrona de SVM dentro de una sola cadena. El mensaje de llamada entre VMs está actualmente desactivado en mainnet. |
| Conectividad entre cadenas   | v1.2.0 (Interop)    | Diseñado para hasta ocho contrapartes IBC (Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon, Injective) más **37 configuraciones de cadena QCB (36 cadenas externas más Injective por IBC)**. Atestaciones de validadores firmadas con PQC, profundidades de confirmación por cadena y topes de volumen del disyuntor. A octubre de 2026, las 37 configuraciones de cadena están en estado `pending` y no hay ningún canal IBC abierto en ninguna de las dos redes — **no está en producción**. |
| Restaking de BTC              | v1.2.0 (Interop)    | Fase de diseño: las transacciones del módulo no están habilitadas en las redes en producción. Integración con Babylon Protocol para garantías de finalidad de Bitcoin. Los validadores registrarían posiciones de staking de BTC (mínimo 100.000 satoshis). Las raíces de estado de las épocas de QoreChain se registran periódicamente como checkpoints en Bitcoin mediante épocas de Babylon retransmitidas por IBC, proporcionando una capa de finalidad secundaria respaldada por el hashrate de BTC. |
| Abstracción de cuentas        | v1.2.0 (Interop)    | Cuentas inteligentes programables en la capa de protocolo (similares a ERC-4337). Tres tipos de cuenta: multifirma, recuperación social y basada en sesión. Claves de sesión con permisos granulares y expiración, reglas de gasto por cuenta diarias y por transacción, y listas de permitidos de denoms acotadas. Implementado, pero actualmente **desactivado** en ambas redes (`abstractaccount.enabled = false`; consulta `GET /qorechain/abstractaccount/v1/config`). |
| Protección MEV             | v1.2.0 (Interop)    | Framework de cifrado basado en identidad de umbral (tIBE) de FairBlock para mempools cifrados, diseñado para mantener las transacciones opacas para los proponentes de bloques hasta después de su inclusión. El ante handler FairBlockDecorator está cableado; el descifrado de umbral tIBE se activa tras el despliegue de la ceremonia de claves. Actualmente **deshabilitado** en ambas redes (`enabled = false`). |
| Abstracción de gas            | v1.2.0 (Interop)    | Diseñada para permitir a los usuarios pagar las comisiones con un token no nativo aceptado; la configuración lista `ibc/USDC` a una tasa 1:1 e `ibc/ATOM` a 10:1. Aún no hay ningún canal IBC abierto, por lo que no existe ningún token de ese tipo en las redes y las comisiones se pagan actualmente en QOR. |
| Priorización de 5 carriles      | v1.2.0 (Interop)    | Las definiciones de carriles (PQC, MEV, AI, Default, Free) existen como configuración, pero el mempool en producción y el manejador de propuestas no aplican los carriles de espacio de bloque. |
| Liquidez on-chain (AMM)   | v1.2.0 (Interop)    | El creador de mercado automatizado nativo (`x/amm`) proporciona pools de liquidez y swaps on-chain en la capa de protocolo. El módulo está activo; todavía no se ha creado ningún pool. |
| Rollups RDK               | v1.3.0 (Rollups)    | Rollup Development Kit con cuatro paradigmas de liquidación (optimistic, zk, based, sovereign), cinco perfiles predefinidos (defi, gaming, nft, enterprise, custom), router de DA nativo con almacenamiento de blobs SHAKE-256 y poda automática, ciclo de vida de escrow bancario con tasa de quema de creación configurable, autofinalización por EndBlocker y configuración asistida por PRISM mediante el módulo de consenso. Las capacidades de rollup se entregan como un framework de la cadena anfitriona; todavía no se ha creado ningún rollup en las redes en producción. |
| Licenciamiento de cadenas            | v1.3.0 (Rollups)    | El módulo `x/license` proporciona licenciamiento de cadenas nativo del protocolo. |

## Estado de las características (octubre de 2026) {#feature-status}

Verificado frente a las redes en producción el 20 de octubre de 2026. "Activa" significa que la capacidad está activa en mainnet (y, salvo que una fila indique lo contrario, en testnet); las descripciones anteriores indican para qué está diseñada cada característica.

| Capacidad | Estado en las redes en producción |
| --- | --- |
| Firmas híbridas ML-DSA-87 + secp256k1 (carril Cosmos) | **Activa**, obligatoria (`hybrid_signature_mode = required`) |
| Ventana de autorización EVM | **Activa** desde v3.2.0 (ámbito opcional desde v3.2.3) |
| Staking con bloqueo temporal (`x/stakingtier`, opcional) | **Activo** desde v3.2.4 (testnet desde el 19 de octubre de 2026, mainnet desde el 23 de octubre de 2026) |
| Entornos de ejecución EVM, QoreChain Native, SVM | EVM **activo**; carga de código e instanciación de QoreChain Native **deshabilitadas** (ajuste de gobernanza más disyuntor); carril de transacciones SVM **deshabilitado** (las lecturas funcionan) |
| Motor de quema y reparto de comisiones (37/30/20/10/3) | **Activo**; solo los canales de quema de comisiones de gas y de transacciones fallidas han registrado quemas en mainnet |
| Emisión limitada (`x/inflation`) | **Activa**, 86.000 QOR fijos por época hasta un tope de 590.000.000 QOR (mainnet) |
| Staking, slashing, gobernanza | **Activos** (módulos estándar; consulta [Parámetros de la cadena](/appendix/chain-parameters)) |
| Recompensas de nodos ligeros | Contabilidad de recompensas **activa**; registro **abierto** y sujeto a licencia, todavía sin ningún nodo ligero registrado (consulta el [estado](/light-node/overview#reward-program-status)) |
| AMM (`x/amm`) | Módulo **activo**, todavía sin pools creados |
| PRISM (`x/rlconsensus`) | **Solo observación** — sin política cargada |
| CPoS Triple-Pool / QDRW (`x/qca`) | Implementados, **no conectados** a la producción de bloques, las recompensas ni el escrutinio |
| xQORE (`x/xqore`) | Solo contabilidad — **todavía sin transacciones de bloqueo/desbloqueo** |
| Cuentas inteligentes / wallets vinculadas (`x/abstractaccount`) | Implementadas, **desactivadas** (`enabled = false`) |
| Rollup Development Kit (`x/rdk`), multicapa | Módulos **activos**, todavía sin rollups ni capas creados |
| Puente entre cadenas, IBC, restaking de Babylon | **Pendiente** — las 37 configuraciones de cadena en `pending`, sin canal IBC abierto, sin transacciones de restaking |
| Protección MEV de FairBlock | **Deshabilitada** (`enabled = false`) |
| Precompiles de EVM, espacio de nombres JSON-RPC `qor_` | **No activos / no servidos** (la lista de precompiles activos está vacía) |

## Historial de versiones

<details>

<summary>v1.0.0 — Lanzamiento de génesis</summary>

Estableció el protocolo principal con criptografía poscuántica (Dilithium-5, ML-KEM-1024), la capa de consenso de aprendizaje por refuerzo on-chain PRISM, el entorno de ejecución triple-VM (EVM, QoreChain Native, SVM) con mensajería entre VMs, el motor de tokenomics (quema, xQORE, módulo de emisión), la selección de validadores Triple-Pool Composite PoS, la gobernanza cuadrática QDRW y la canalización de procesamiento de transacciones de IA.

</details>

<details>

<summary>v1.1.0 — Lanzamiento de refuerzo de seguridad</summary>

Introdujo la arquitectura de firma híbrida que empareja una firma clásica secp256k1 (ECDSA) con ML-DSA-87, con tres modos de aplicación controlados por gobernanza, la base de hash poscuántico SHAKE-256 para la futura sustitución del árbol de Merkle, y especificaciones de interfaz de grado de producción para la atestación TEE (SGX, TDX, SEV-SNP, ARM CCA) y la coordinación de aprendizaje federado (FedAvg, FedProx, SCAFFOLD).

</details>

<details>

<summary>v1.2.0 — Lanzamiento de interoperabilidad y UX</summary>

Añadió conectividad entre cadenas (8 canales IBC + 37 configuraciones QCB que cubren 36 cadenas externas, actualmente en testnet/pendiente), restaking de BTC mediante Babylon Protocol, abstracción de cuentas inteligentes con claves de sesión y recuperación social, el framework de protección MEV de FairBlock, abstracción de gas multi-token, liquidez on-chain (`x/amm`) y priorización del espacio de bloque en 5 carriles.

</details>

<details>

<summary>v1.3.0 — Lanzamiento del ecosistema de rollups</summary>

Lanzó el Rollup Development Kit con cuatro paradigmas de liquidación (optimistic, zk, based, sovereign), cinco perfiles de despliegue predefinidos (defi, gaming, nft, enterprise, custom), un router de DA nativo, gestión del ciclo de vida de escrow bancario, autofinalización impulsada por EndBlocker, configuración de rollups asistida por PRISM y licenciamiento de cadenas (`x/license`). Integración profunda con el módulo de arquitectura multicapa para el registro automático de sidechains y el anclaje de estado.

</details>

## Relacionado

* [Qué es QoreChain](/introduction/what-is-qorechain) — la visión general de la plataforma en contexto.
* [Tokenomics](/architecture/tokenomics) — el modelo económico detrás de QOR.
* [Arquitectura de puentes](/architecture/bridge-architecture) — conectividad entre cadenas y restaking de BTC.
* [Visión general de los rollups](/rollups/overview) — el Rollup Development Kit y los paradigmas de liquidación.
