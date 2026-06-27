---
slug: /introduction/key-features
title: Características principales
sidebar_label: Características principales
sidebar_position: 3
---

# Características principales

La siguiente tabla enumera todas las características importantes de QoreChain, organizadas según la fase de lanzamiento en la que se introdujeron. La versión actual de la cadena es **v3.1.77**, con la mainnet (`qorechain-vladi`, EVM chain ID 9801) activa desde el 7 de junio de 2026 y una testnet en paralelo (`qorechain-diana`, EVM chain ID 9800).

| Característica             | Introducida en      | Descripción                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Firmas híbridas PQC (obligatorias por defecto) | v1.1.0 (Seguridad)   | Firmas duales en cada transacción de la ruta cosmos: una firma clásica secp256k1 (ECDSA) emparejada con ML-DSA-87 (Dilithium-5). A partir de v3.1.71 el valor predeterminado de la red es **required** (`hybrid_signature_mode = required`, `allow_classical_fallback = false`): las txs cosmos solo clásicas se rechazan; solo están exentas las gentxs de génesis y las txs de registro/migración de claves PQC. Las transacciones EVM usan una ruta `eth_secp256k1` independiente y no se ven afectadas. Siguen disponibles tres modos de aplicación controlados por gobernanza (disabled / optional / required). Incorporación fluida de billeteras mediante el registro automático por extensión de TX. |
| Hash SHAKE-256 por defecto     | v1.1.0 (Seguridad)   | Función de salida extensible (XOF) de la familia SHA-3. A partir de v3.1.73, SHAKE-256 (mediante el paquete `qorehash`) es el **hash de aplicación predeterminado**, completando la base PQC (Dilithium-5 + ML-KEM-1024 + SHAKE-256). Proporciona hashing de longitud variable, salida fija de 32 bytes, concatenación de nodos internos de Merkle y hashing con separación de dominio, todo en Go puro y sin dependencia de FFI. |
| Interfaces TEE y FL      | v1.1.0 (Seguridad)   | Especificaciones de interfaz de grado de producción para la atestación de entornos de ejecución confiables (Trusted Execution Environment) (SGX, TDX, SEV-SNP, ARM CCA) y la coordinación de aprendizaje federado (Federated Learning) (métodos de agregación FedAvg, FedProx, SCAFFOLD). Permite la inferencia de IA en enclaves de hardware y el entrenamiento distribuido de modelos con preservación de la privacidad y garantías criptográficas. |
| Consenso RL on-chain (PRISM) | v1.0.0 (Génesis) | Un MLP de punto fijo nativo de Go (73.733 parámetros) ejecuta inferencia PPO directamente en el ciclo de vida del bloque. La capa de optimización PRISM ajusta dinámicamente el tiempo de bloque, los límites de gas y los pesos de los pools de validadores sin oráculos externos. La aritmética determinista de series de Taylor garantiza resultados idénticos en todos los validadores. Cuatro modos de operación: shadow, conservative, autonomous y paused. Protección de disyuntor (circuit breaker) por seguridad. |
| Triple-Pool Composite PoS  | v1.0.0 (Génesis)    | Los validadores se clasifican en pools RPoS (ponderado por reputación), DPoS (ponderado por delegación) y PoS (estándar) cada 1.000 bloques sobre el QoreChain Consensus Engine. La sortición ponderada por pool diversifica la producción de bloques más allá del dominio puro del stake. La curva de bonding personalizada tiene en cuenta el stake auto-vinculado, la duración de la lealtad, la calidad de la reputación y la fase del protocolo. |
| Gobernanza QDRW            | v1.0.0 (Génesis)    | Delegación cuadrática con ponderación por reputación (Quadratic Delegation with Reputation Weighting). El poder de voto usa una función de raíz cuadrada amortiguada por un multiplicador de reputación sigmoidal, lo que evita la captura por ballenas y a la vez recompensa la participación honesta a largo plazo. Una ventaja de stake de 100x rinde aproximadamente 10x de poder de voto. Las posiciones de xQORE duplican el peso de voto. |
| Motor de quema                | v1.0.0 (Génesis)    | Diez canales de quema distintos: comisiones de transacción, penalizaciones de gobernanza, slashing, comisiones de puente, disuasión de spam, exceso de época, quemas manuales, callbacks de contratos, comisiones entre VMs y quemas por creación de rollups. Las comisiones recaudadas se reparten **37% a los validadores, 30% quemado de forma permanente, 20% a la tesorería, 10% a los stakers y 3% a los nodos ligeros**. |
| Staking xQORE              | v1.0.0 (Génesis)    | Bloquea QOR para acuñar xQORE a una proporción 1:1 y obtener el doble de peso de gobernanza en las votaciones QDRW. Las penalizaciones de salida graduadas (50% antes de 30 días, 35% entre 30 y 90 días, 15% entre 90 y 180 días, 0% después de 180 días) se redistribuyen a los titulares restantes mediante el rebase PvP, recompensando la convicción y penalizando el capital a corto plazo. |
| Emisiones de suministro fijo     | v1.0.0 (Génesis)    | Un suministro total fijo de 4.500.000.000 QOR (80.000.000 quemados en el TGE) con un presupuesto finito de recompensas de staking de 590.000.000 QOR: Año 1 a 8–12% APY (127.500.000 QOR), Año 2 a 6–10% APY (106.250.000 QOR), Años 3–4 a 5–8% APY (85.000.000 QOR por año) y Año 5+ determinado por gobernanza (~186.000.000 QOR restantes). Combinado con el motor de quema, QOR converge hacia un comportamiento netamente deflacionario a medida que aumenta el volumen de transacciones. |
| Entorno de ejecución EVM                | v1.0.0 (Génesis)    | Compatibilidad total con Ethereum con precios de gas EIP-1559, JSON-RPC en el puerto 8545 (espacios de nombres `eth_`, `web3_`, `net_`, `txpool_`, `qor_`) y soporte para las herramientas estándar (Hardhat, Foundry, Remix). Despliega e interactúa con contratos Solidity usando los flujos de trabajo existentes de Ethereum. |
| Entorno de ejecución CosmWasm           | v1.0.0 (Génesis)    | Motor de contratos inteligentes WebAssembly para contratos basados en Rust. Soporte completo del ciclo de vida: instantiate, execute, query y migrate. Los contratos se ejecutan en un entorno Wasm aislado con ejecución determinista. |
| Entorno de ejecución SVM                | v1.0.0 (Génesis)    | Despliegue y ejecución de programas BPF mediante un ejecutor respaldado por Rust. El servidor JSON-RPC compatible con Solana en el puerto 8899 admite `getAccountInfo`, `getBalance`, `getSlot` y más. Los clientes y herramientas existentes de Solana funcionan sin modificaciones. |
| Puente entre VMs            | v1.0.0 (Génesis)    | Interoperabilidad fluida entre las tres VMs. Los contratos EVM llaman a CosmWasm mediante precompile; los contratos CosmWasm llaman a EVM mediante mensajes personalizados; los programas SVM participan mediante un puenteo asíncrono basado en eventos. Llamadas síncronas EVM-CosmWasm y mensajería asíncrona de SVM dentro de una sola cadena. |
| Conectividad entre cadenas   | v1.2.0 (Interop)    | Ocho canales IBC (Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon, Injective) más **37 configuraciones QCB que cubren 36 cadenas externas** (incluida la propia QoreChain como loopback nativo). Atestaciones de validadores firmadas con PQC, profundidades de confirmación por cadena y topes de volumen del disyuntor. Actualmente en estado de testnet / pendiente: aún no en producción. |
| Restaking de BTC              | v1.2.0 (Interop)    | Integración con Babylon Protocol para garantías de finalidad de Bitcoin. Los validadores registran posiciones de staking de BTC (mínimo 100.000 satoshis). Las raíces de estado de las épocas de QoreChain se registran periódicamente como checkpoints en Bitcoin mediante épocas de Babylon retransmitidas por IBC, proporcionando una capa de finalidad secundaria respaldada por el hashrate de BTC. |
| Abstracción de cuentas        | v1.2.0 (Interop)    | Cuentas inteligentes programables en la capa de protocolo (similares a ERC-4337). Tres tipos de cuenta: multifirma, recuperación social y basada en sesión. Claves de sesión con permisos granulares y expiración, reglas de gasto por cuenta diarias y por transacción, listas de permitidos de denoms acotadas y aplicación automática de reglas en el consenso. |
| Protección MEV             | v1.2.0 (Interop)    | Framework de cifrado basado en identidad de umbral (tIBE) de FairBlock para mempools cifrados. Las transacciones son criptográficamente opacas para los proponentes de bloques hasta después de su inclusión, eliminando el front-running y los ataques sándwich. El ante handler FairBlockDecorator está cableado y listo; el descifrado de umbral tIBE se activa tras el despliegue de la ceremonia de claves. |
| Abstracción de gas            | v1.2.0 (Interop)    | El pago de gas multi-token elimina el requisito de tener QOR nativo para las comisiones de transacción. Los usuarios pueden pagar con tokens transferidos por IBC aceptados: ibc/USDC a una tasa 1:1 e ibc/ATOM a una tasa 10:1. El GasAbstractionDecorator valida y convierte los denoms de comisión no nativos antes de la deducción de comisión estándar. |
| Priorización de 5 carriles      | v1.2.0 (Interop)    | El espacio de bloque se particiona estáticamente en cinco carriles de prioridad: PQC (prioridad 100, 15% del espacio), MEV (90, 20%), AI (80, 15%), Default (50, 40%) y Free (10, 10%). Las transacciones críticas para la seguridad nunca pueden quedar desplazadas por el tráfico estándar de alto volumen. |
| Liquidez on-chain (AMM)   | v1.2.0 (Interop)    | El creador de mercado automatizado nativo (`x/amm`) proporciona pools de liquidez y swaps on-chain en la capa de protocolo. |
| Rollups RDK               | v1.3.0 (Rollups)    | Rollup Development Kit con cuatro paradigmas de liquidación (optimistic, zk, based, sovereign), cinco perfiles predefinidos (defi, gaming, nft, enterprise, custom), router de DA nativo con almacenamiento de blobs SHA-256 y poda automática, ciclo de vida de escrow bancario con tasa de quema de creación configurable, autofinalización por EndBlocker y configuración asistida por PRISM mediante el módulo de consenso. Las capacidades de rollup se entregan como un framework de la cadena anfitriona. |
| Licenciamiento de cadenas            | v1.3.0 (Rollups)    | El módulo `x/license` proporciona licenciamiento de cadenas nativo del protocolo. |

## Historial de versiones

<details>

<summary>v1.0.0 — Lanzamiento de génesis</summary>

Estableció el protocolo principal con criptografía poscuántica (Dilithium-5, ML-KEM-1024), la capa de consenso de aprendizaje por refuerzo on-chain PRISM, el entorno de ejecución triple-VM (EVM, CosmWasm, SVM) con mensajería entre VMs, el motor de tokenomics de suministro fijo (quema, xQORE, presupuesto de emisión finito), la selección de validadores Triple-Pool Composite PoS, la gobernanza cuadrática QDRW y la canalización de procesamiento de transacciones de IA.

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
