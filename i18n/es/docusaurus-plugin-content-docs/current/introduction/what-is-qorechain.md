---
slug: /introduction/what-is-qorechain
title: ¿Qué es QoreChain?
sidebar_label: ¿Qué es QoreChain?
sidebar_position: 1
---

# ¿Qué es QoreChain?

QoreChain es la primera blockchain de Capa 1 construida con criptografía poscuántica desde el génesis, procesamiento de transacciones nativo de IA y un entorno de ejecución triple-VM que ejecuta programas EVM, CosmWasm y SVM en una sola cadena. En lugar de adaptar la resistencia cuántica a un protocolo existente, QoreChain se diseñó desde cero para ser segura frente a adversarios tanto clásicos como cuánticos, al tiempo que ofrece la experiencia de desarrollo y la interoperabilidad que se espera de una blockchain moderna de propósito general.

La mainnet (`qorechain-vladi`, EVM chain ID **9801**) está activa desde el 7 de junio de 2026 y ejecuta la versión de cadena **v3.1.82**. Una testnet pública (`qorechain-diana`, EVM chain ID **9800**) se ejecuta en paralelo para pruebas de staging e integración. El token nativo es **QOR** (visualización) / **uqor** (base, 10^6), con prefijos Bech32 `qor` para cuentas y `qorvaloper` para validadores. La cadena está construida sobre Cosmos SDK v0.53.

## Innovaciones principales

### 1. Criptografía poscuántica

QoreChain usa ML-DSA-87 (Dilithium-5) estandarizado por NIST para firmas digitales, ML-KEM-1024 para encapsulación de claves y SHAKE-256 como hash de aplicación predeterminado, proporcionando seguridad frente a ataques de computadoras tanto clásicas como cuánticas. Las firmas híbridas ahora son **obligatorias por defecto** en la ruta de transacciones cosmos: toda transacción de la ruta cosmos debe llevar una firma Dilithium-5 (ML-DSA-87) como extensión de transacción *junto con* la firma clásica secp256k1 (ECDSA). Las transacciones cosmos solo clásicas se rechazan: la ruta de degradación está cerrada (solo están exentas las gentxs de génesis y las transacciones de registro/migración de claves PQC). Las transacciones EVM no se ven afectadas: usan una ruta ante `eth_secp256k1` independiente (la ruta del QoreChain EVM Engine) y no requieren la firma híbrida. Siguen disponibles tres modos de aplicación controlados por gobernanza (disabled, optional, required), pero el valor predeterminado actual de la red es **required**. Un framework de agilidad de algoritmos garantiza que los esquemas de firma puedan actualizarse mediante propuestas de gobernanza a medida que evolucionan los estándares criptográficos.

### 2. Procesamiento nativo de IA

Un agente de aprendizaje por refuerzo on-chain (PPO MLP con 73.733 parámetros) ejecuta inferencia determinista de punto fijo directamente en el ciclo de vida del bloque, ajustando dinámicamente parámetros de consenso como el tiempo de bloque, los límites de gas y los pesos de los pools de validadores. Esta capa de optimización lleva la marca **PRISM** (Policy-driven Reinforcement-learning for Intelligent State Machines). La detección estadística de anomalías mediante isolation forest y la puntuación de riesgo multidimensional evalúan cada transacción en la cadena del ante handler, marcando patrones fraudulentos antes de la ejecución. La optimización dinámica de comisiones ajusta las comisiones base en función de las condiciones de red en tiempo real. Toda la inferencia de IA es totalmente determinista en todos los validadores: entradas idénticas producen salidas idénticas sin dependencia de oráculos externos.

### 3. Entorno de ejecución triple-VM

QoreChain es la única Capa 1 que ejecuta de forma nativa tres máquinas virtuales dentro de un mismo consenso:

* **EVM** — Compatibilidad total con Ethereum con precios de gas EIP-1559 y JSON-RPC en el puerto 8545. Despliega contratos Solidity usando herramientas estándar (Hardhat, Foundry, Remix).
* **CosmWasm** — Contratos inteligentes WebAssembly escritos en Rust con soporte completo del ciclo de vida (instantiate, execute, query, migrate).
* **SVM** — Despliegue y ejecución de programas BPF con un servidor JSON-RPC compatible con Solana en el puerto 8899. Los clientes y herramientas existentes de Solana funcionan de forma inmediata.

La mensajería entre VMs permite que los tres entornos de ejecución se comuniquen: los contratos EVM llaman a CosmWasm mediante precompile, los contratos CosmWasm llaman a EVM mediante mensajes personalizados y los programas SVM participan mediante un puenteo asíncrono basado en eventos.

### 4. Tokenomics de suministro fijo

Diez canales de quema distintos (comisiones de transacción, penalizaciones de gobernanza, slashing, comisiones de puente, disuasión de spam, exceso de época, quemas manuales, callbacks de contratos, comisiones entre VMs y quemas por creación de rollups) alimentan un módulo central de contabilidad de quemas. Las comisiones recaudadas se reparten **37% a los validadores, 30% quemado de forma permanente, 20% a la tesorería, 10% a los stakers y 3% a los nodos ligeros**. El mecanismo de staking de gobernanza xQORE permite a los usuarios bloquear QOR para obtener el doble de peso de gobernanza con redistribución por rebase PvP: las penalizaciones por salida anticipada se redistribuyen a los titulares restantes, recompensando la convicción.

QoreChain usa un modelo de **suministro fijo** con un presupuesto de emisión finito en lugar de inflación porcentual perpetua. El suministro total es fijo en **4.500.000.000 QOR**, de los cuales **80.000.000 (1,78%)** se quemaron en el TGE. Las recompensas de staking se pagan desde un pool dedicado de **590.000.000 QOR** sobre un calendario plurianual:

| Periodo | APY objetivo | Presupuesto de emisión |
| --- | --- | --- |
| Año 1 | 8–12% | 127.500.000 QOR |
| Año 2 | 6–10% | 106.250.000 QOR |
| Años 3–4 | 5–8% | 85.000.000 QOR por año |
| Año 5+ | Determinado por gobernanza | ~186.000.000 QOR restantes |

Combinado con los diez canales de quema, el diseño de suministro fijo converge hacia un comportamiento netamente deflacionario a medida que crece el volumen de transacciones.

### 5. Conectividad entre cadenas

QoreChain está diseñada para conectarse a un amplio conjunto de ecosistemas blockchain mediante dos protocolos complementarios: IBC nativo y el QoreChain Bridge (QCB). La capa de puente define **37 configuraciones de cadena QCB (incluida la propia QoreChain como loopback nativo)** más **8 canales IBC**, cubriendo **36 cadenas externas** en total. La capa entre cadenas está actualmente en **estado de testnet / pendiente y aún no en producción**; las cifras que aparecen a continuación describen la cobertura objetivo.

* **8 canales IBC** — Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon e Injective. Plantillas de relayer preconfiguradas con actualizaciones de cliente, detección de comportamiento indebido y limpieza automática de paquetes.
* **37 configuraciones QCB (36 cadenas externas + loopback de QoreChain)** — cada endpoint está diseñado para incluir validación de direcciones por tipo, profundidad de confirmación configurable, topes de volumen del disyuntor y atestaciones de validadores firmadas con PQC. Las cadenas externas objetivo son:
  * **Base (10):** Ethereum, Solana, TON, BSC, Avalanche, Polygon, Arbitrum, Optimism, Base, Sui
  * **Familia EVM (14):** zkSync Era, Linea, Scroll, Blast, Mantle, Hyperliquid, Berachain, Sonic, Sei, Monad, Plasma, Filecoin FVM, Cronos, Kaia
  * **No EVM (5):** Starknet, XRP Ledger, Stellar, Hedera, Algorand
  * **Pendientes (7):** NEAR, Bitcoin, Cardano, Polkadot, Tezos, Tron, Aptos

La arquitectura abarca todos los principales tipos de cadena —EVM, Solana (SVM), basadas en Move (Sui, Aptos), Cosmos/IBC, UTXO y otras familias no EVM— para proporcionar una amplia interoperabilidad en todo el ecosistema.

### 6. Rollup Development Kit

El módulo `x/rdk` es un framework nativo del protocolo para desplegar rollups específicos de aplicación directamente sobre la cadena anfitriona de QoreChain. El soporte de rollups se entrega como un framework de la cadena anfitriona; las afirmaciones específicas de despliegue deben tratarse como capacidades objetivo. Se admiten cuatro paradigmas de liquidación:

* **Optimistic** — Pruebas de fraude con una ventana de impugnación de 7 días, autofinalizadas por EndBlocker.
* **ZK (Zero-Knowledge)** — Pruebas SNARK o STARK con finalidad instantánea al verificarse.
* **Based** — Transacciones secuenciadas por la L1 con finalidad en aproximadamente 2 bloques anfitriones.
* **Sovereign** — Cadenas independientes que usan QoreChain exclusivamente para la disponibilidad de datos.

Cinco perfiles predefinidos (**defi, gaming, nft, enterprise, custom**) permiten un despliegue de un clic con modos de liquidación, tiempos de bloque, elecciones de VM, backends de DA y modelos de gas preconfigurados. Un router de DA nativo proporciona almacenamiento de blobs comprometidos con SHA-256, con retención configurable y poda automática. El módulo de consenso PRISM proporciona métodos de asesoramiento para la configuración de rollups asistida por IA.

### 7. Abstracción de cuentas y de gas

Las cuentas inteligentes con tres tipos programables (multifirma, recuperación social, basada en sesión) admiten claves de sesión con permisos granulares y expiración, reglas de gasto por cuenta y listas de permitidos de denoms. Esto habilita patrones de UX de billetera imposibles con cuentas estándar: claves de sesión de dApps para móvil, recuperación social como tipo de cuenta de primera clase y límites de gasto programables aplicados en el consenso. La abstracción de gas elimina el requisito de tener QOR nativo para las comisiones: los usuarios pueden pagar con cualquier token transferido por IBC aceptado, como USDC o ATOM.

## Ecosistema

QoreChain incluye **más de 45 módulos de génesis, incluidos más de 20 módulos personalizados**, que abarcan seguridad (pqc), IA (ai, reputation, rlconsensus), consenso (qca), máquinas virtuales (vm, svm, crossvm), tokenomics (burn, xqore, inflation), liquidez (amm), licenciamiento (license), puentes (bridge, babylon, multilayer), extensiones de gobernanza (abstractaccount, fairblock, gasabstraction) y rollups (rdk). Entre las incorporaciones recientes se incluyen `x/amm` para AMM / liquidez on-chain y `x/license` para licenciamiento de cadenas. La cadena sigue una arquitectura open-core: la capa de protocolo es totalmente de código abierto, con extensiones propietarias opcionales para despliegues empresariales.

## Relacionado

* [Visión general de la arquitectura](/introduction/architecture-overview) — cómo encajan las capas de extremo a extremo.
* [Características principales](/introduction/key-features) — los aspectos destacados de las capacidades de un vistazo.
* [PRISM Consensus Engine](/architecture/prism-consensus-engine) — el consenso asistido por IA en el núcleo.
* [Tokenomics](/architecture/tokenomics) — suministro, quemas, rebases y emisiones de QOR.
* [Inicio rápido](/getting-started/quickstart) — levanta un nodo local y empieza a construir.
