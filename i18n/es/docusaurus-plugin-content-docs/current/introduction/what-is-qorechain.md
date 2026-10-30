---
slug: /introduction/what-is-qorechain
title: ¿Qué es QoreChain?
sidebar_label: ¿Qué es QoreChain?
sidebar_position: 1
---

# ¿Qué es QoreChain?

QoreChain es la primera blockchain de Capa 1 construida con criptografía poscuántica desde el génesis, procesamiento de transacciones nativo de IA y un entorno de ejecución triple-VM que ejecuta programas EVM, QoreChain Native (el runtime CosmWasm) y SVM en una sola cadena. En lugar de adaptar la resistencia cuántica a un protocolo existente, QoreChain se diseñó desde cero para ser segura frente a adversarios tanto clásicos como cuánticos, al tiempo que ofrece la experiencia de desarrollo y la interoperabilidad que se espera de una blockchain moderna de propósito general.

La mainnet (`qorechain-vladi`, EVM chain ID **9801**) está activa desde el 7 de junio de 2026 y ejecuta la versión de cadena **v3.2.5** (aplicada por la propuesta de gobernanza 14 en la altura 3,906,833 el 29 de octubre de 2026; v3.2.4 se había aplicado en la altura 3,742,566 el 23 de octubre). Una testnet pública (`qorechain-diana`, EVM chain ID **9800**, que ejecuta v3.2.6 desde el 27 de octubre de 2026) se ejecuta en paralelo para pruebas de staging e integración. El token nativo es **QOR** (visualización) / **uqor** (base, 10^6), con prefijos Bech32 `qor` para cuentas y `qorvaloper` para validadores. La cadena está construida sobre Cosmos SDK v0.53.

## Innovaciones principales

### 1. Criptografía poscuántica

QoreChain usa ML-DSA-87 (Dilithium-5) estandarizado por NIST para firmas digitales, ML-KEM-1024 para encapsulación de claves y SHAKE-256 como hash de aplicación predeterminado. Las firmas híbridas ahora son **obligatorias por defecto** en la ruta de transacciones cosmos: toda transacción de la ruta cosmos debe llevar una firma Dilithium-5 (ML-DSA-87) como extensión de transacción *junto con* la firma clásica secp256k1 (ECDSA). Las transacciones cosmos solo clásicas se rechazan: la ruta de degradación está cerrada (solo están exentas las gentxs de génesis, las transacciones de registro/migración de claves PQC y un unjail desde una cuenta de operador que no tiene clave registrada). El carril EVM conserva la firma estándar `eth_secp256k1`, por lo que las herramientas de Ethereum firman sin cambios, pero desde v3.2.0 una transacción EVM solo se admite desde una cuenta que tenga una clave ML-DSA-87 registrada y una **ventana de autorización EVM** abierta — un permiso acotado que se abre con un mensaje del carril Cosmos firmado de forma poscuántica (consulta [Ventana de autorización EVM](/getting-started/first-transaction#evm-window)). Una clave clásica por sí sola ya no puede mover fondos en el carril EVM. Siguen disponibles tres modos de aplicación controlados por gobernanza (disabled, optional, required), pero el valor predeterminado actual de la red es **required**. Un framework de agilidad de algoritmos garantiza que los esquemas de firma puedan actualizarse mediante propuestas de gobernanza a medida que evolucionan los estándares criptográficos.

### 2. Procesamiento nativo de IA

**PRISM** (Policy-driven Reinforcement-learning for Intelligent State Machines) es una capa de aprendizaje por refuerzo on-chain — una red de políticas PPO de punto fijo con 73,733 parámetros y límites de seguridad de disyuntor — integrada en el ciclo de vida del bloque. Actualmente funciona en modo de observación: las redes en producción registran observaciones y recompensas cada 10 bloques, y no se carga ninguna política entrenada, por lo que hoy no ajusta ningún parámetro de consenso. La detección estadística de anomalías mediante isolation forest y la puntuación de riesgo multidimensional evalúan cada transacción en la cadena del ante handler, marcando patrones fraudulentos antes de la ejecución. La optimización dinámica de comisiones ajusta las comisiones base en función de las condiciones de red en tiempo real. Toda la inferencia de IA on-chain está diseñada para ser totalmente determinista en todos los validadores: entradas idénticas producen salidas idénticas sin dependencia de oráculos externos.

### 3. Entorno de ejecución triple-VM

QoreChain es la única Capa 1 que ejecuta de forma nativa tres máquinas virtuales dentro de un mismo consenso:

* **EVM** — Compatibilidad total con Ethereum con precios de gas EIP-1559 y JSON-RPC en el puerto 8545. Despliega contratos Solidity usando herramientas estándar (Hardhat, Foundry, Remix).
* **QoreChain Native** — Contratos inteligentes WebAssembly escritos en Rust con soporte completo del ciclo de vida (instantiate, execute, query, migrate).
* **SVM** — Despliegue y ejecución de programas BPF con un servidor JSON-RPC compatible con Solana en el puerto 8899. Los clientes y herramientas existentes de Solana funcionan de forma inmediata.

La mensajería entre VMs permite que los tres entornos de ejecución se comuniquen: los contratos EVM llaman a QoreChain Native mediante precompile (una vez que ese precompile se active), los contratos QoreChain Native llaman a EVM mediante mensajes personalizados y los programas SVM participan mediante un puenteo asíncrono basado en eventos. Hoy, en las redes en producción, solo el entorno de ejecución EVM acepta transacciones: la subida e instanciación de código QoreChain Native están deshabilitadas, el carril de transacciones SVM está deshabilitado, no hay ningún precompile EVM activo en mainnet (la testnet tiene tres activos) y el mensaje de llamada entre VMs está desactivado en mainnet.

### 4. Tokenomics de emisión limitada

El motor de quema define **doce fuentes de quema** (comisiones de gas, creación de contratos, comisiones de servicios de IA, comisiones de puente, recompra de la tesorería, transacciones fallidas, penalizaciones de xQORE, recompra automatizada, la quema del TGE, creación de rollups, hitos de número de transacciones y AMM) que alimentan un módulo central de contabilidad de quemas; en mainnet, hasta ahora solo los canales de comisiones de gas y de transacciones fallidas han registrado quemas. Todo lo que entra en el colector de comisiones se reparte **37% a los validadores, 30% quemado de forma permanente, 20% a la tesorería, 10% a los stakers y 3% a los nodos ligeros**. El reparto se aplica por igual a las comisiones de transacción y a la emisión de la época. El diseño de staking de gobernanza xQORE permite a los usuarios bloquear QOR para obtener el doble de peso de gobernanza, con las penalizaciones por salida anticipada redistribuidas a los titulares restantes; las transacciones de bloqueo y desbloqueo todavía no están conectadas a las redes en producción.

QOR tiene una **trayectoria de suministro finita**: **4,420,000,000 QOR** en el génesis (4,500,000,000 QOR previstos, de los cuales 80,000,000 QOR se quemaron en el evento de generación del token antes del génesis), una emisión de staking acuñada bajo un **tope acumulado estricto de 590,000,000 QOR**, y el motor de quema, que elimina tokens de forma permanente. El módulo `x/inflation` acuña una cantidad fija por época de 43,200 bloques (86,000 QOR desde la propuesta de gobernanza 10 de octubre de 2026) hasta alcanzar el tope, tras lo cual las recompensas provienen únicamente de las comisiones de transacción. Consulta [Tokenomics](/architecture/tokenomics#supply-and-emission) para las cifras en vivo y el calendario.

### 5. Conectividad entre cadenas

QoreChain está diseñada para conectarse a un amplio conjunto de ecosistemas blockchain mediante dos protocolos complementarios: IBC nativo y el QoreChain Bridge (QCB). La capa de puente define **37 configuraciones de cadena (36 cadenas externas más Injective, alcanzada por IBC)** y hasta **8 contrapartes IBC**. La capa entre cadenas **no está activa en ninguna de las dos redes**: las 37 configuraciones de cadena están en estado `pending`, la mainnet no tiene ningún canal IBC y la testnet tiene un único canal de prueba hacia una cadena de prueba. Las cifras que aparecen a continuación describen la cobertura objetivo.

* **Hasta 8 contrapartes IBC** — Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon e Injective. Plantillas de relayer preconfiguradas con actualizaciones de cliente, detección de comportamiento indebido y limpieza automática de paquetes.
* **37 configuraciones de cadena QCB (36 cadenas externas más Injective por IBC)** — cada endpoint está diseñado para incluir validación de direcciones por tipo, profundidad de confirmación configurable, topes de volumen del disyuntor y atestaciones de validadores firmadas con PQC. Las cadenas externas objetivo son:
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

Cinco perfiles predefinidos (**defi, gaming, nft, enterprise, custom**) permiten un despliegue de un clic con modos de liquidación, tiempos de bloque, elecciones de VM, backends de DA y modelos de gas preconfigurados. Un router de DA nativo proporciona almacenamiento de blobs comprometidos con SHAKE-256, con retención configurable y poda automática. El módulo de consenso PRISM proporciona métodos de asesoramiento para la configuración de rollups asistida por IA. Todavía no se ha creado ningún rollup en las redes en producción.

### 7. Abstracción de cuentas y de gas

Las cuentas inteligentes con tres tipos programables (multifirma, recuperación social, basada en sesión) admiten claves de sesión con permisos granulares y expiración, reglas de gasto por cuenta y listas de permitidos de denoms. Esto habilita patrones de UX de billetera imposibles con cuentas estándar: claves de sesión de dApps para móvil, recuperación social como tipo de cuenta de primera clase y límites de gasto programables. Las funciones de cuentas inteligentes y de wallets vinculadas están implementadas pero **desactivadas en mainnet** (`abstractaccount.enabled = false`) y activadas en la testnet (consulta `GET /qorechain/abstractaccount/v1/config`). La abstracción de gas está diseñada para que los usuarios puedan pagar las comisiones con un token no nativo aceptado (la configuración enumera `ibc/USDC` e `ibc/ATOM`); todavía no hay ningún canal IBC abierto, por lo que las comisiones se pagan actualmente en QOR.

## Ecosistema

QoreChain incluye **48 módulos de génesis, 20 de ellos específicos de QoreChain**, que abarcan seguridad (pqc), IA (ai, reputation, rlconsensus), consenso (qca), máquinas virtuales (vm, svm, crossvm), tokenomics (burn, xqore, inflation), liquidez (amm), licenciamiento (license), puentes (bridge, babylon, multilayer), extensiones de gobernanza (abstractaccount, fairblock, gasabstraction) y rollups (rdk). Entre las incorporaciones recientes se incluyen `x/amm` para AMM / liquidez on-chain y `x/license` para licenciamiento de cadenas. La cadena sigue una arquitectura open-core: la capa de protocolo es totalmente de código abierto, con extensiones propietarias opcionales para despliegues empresariales.

## Relacionado

* [Visión general de la arquitectura](/introduction/architecture-overview) — cómo encajan las capas de extremo a extremo.
* [Características principales](/introduction/key-features) — los aspectos destacados de las capacidades de un vistazo.
* [PRISM Consensus Engine](/architecture/prism-consensus-engine) — el consenso asistido por IA en el núcleo.
* [Tokenomics](/architecture/tokenomics) — suministro, quemas, rebases y emisiones de QOR.
* [Inicio rápido](/getting-started/quickstart) — levanta un nodo local y empieza a construir.
