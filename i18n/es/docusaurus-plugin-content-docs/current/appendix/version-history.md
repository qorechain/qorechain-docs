---
slug: /appendix/version-history
title: Historial de versiones
sidebar_label: Historial de versiones
sidebar_position: 3
---

# Historial de versiones

Historial público de versiones de QoreChain. La versión más reciente es **v3.1.82**, en ejecución en la mainnet **`qorechain-vladi`** (chain ID EVM **9801**, en vivo desde el 7 de junio de 2026). La testnet **`qorechain-diana`** (chain ID EVM **9800**) sigue las compilaciones previas al lanzamiento.

:::note
Las entradas a continuación son resúmenes de capacidades de alto nivel. Las entradas anteriores `v1.x` se conservan como registro histórico de la línea de versiones de testnet que precedió a la mainnet.
:::

---

## v3.1.82 — QOR nativo en SVM en vivo + habilitación para integradores (versión actual de mainnet)

**Enfoque de la versión:** La unificación del QOR nativo en la SVM funcionando en ambas redes, más todo lo que un exchange o integrador necesita para conectarse.

* **Saldo unificado de QOR nativo en vivo en las tres interfaces** — La unificación de la SVM (v3.1.81) está confirmada en vivo en mainnet y testnet: la misma cuenta mantiene un único saldo visible como `uqor` (6 decimales) en Cosmos, 18 decimales estilo wei en la EVM y lamports (9 decimales; 1 uqor = 1,000 lamports) en la interfaz compatible con Solana.
* **Endpoints públicos verificados** — Endpoints HTTPS públicos para el RPC de consenso, REST, JSON-RPC de EVM y JSON-RPC de SVM en ambas redes, además del [explorador de bloques](https://explore.qore.network) público. Consulte [Redes](/appendix/networks).
* **Descargas** — Paquetes versionados de binarios de nodo, el génesis de mainnet y snapshots recientes de datos de cadena (con sumas de verificación SHA-256) publicados en [download.qore.host](https://download.qore.host).
* **Firma post-cuántica determinista en toda la pila de clientes** — `@qorechain/pqc` 0.1.1 firma ML-DSA-87 de forma determinista (FIPS-204 §3.4) en los seis bindings de lenguaje, coincidiendo con lo que la cadena acepta; `@qorechain/wallet-adapter` 0.1.2 se apoya en él para la firma de transacciones híbridas.
* **Guía para integradores** — Nueva [Guía para exchanges e integradores](/developer-guide/exchange-integration) que cubre depósitos, retiros y operaciones de nodo en las tres interfaces.

## v3.1.81 — Unificación del QOR nativo en SVM

**Enfoque de la versión:** El QOR nativo como activo de primera clase en la interfaz compatible con Solana.

* **QOR nativo en SVM** — El runtime de la SVM ahora expone directamente el saldo de QOR nativo de la cuenta (en lamports), en lugar de llevar un saldo separado exclusivo de la SVM. `getBalance` y `getSignaturesForAddress` funcionan contra fondos nativos, y las transferencias del System Program mueven QOR nativo.
* **Mapeo de direcciones SVM** — La dirección SVM de una cuenta se deriva de sus 20 bytes de cuenta (rellenados a la derecha hasta 32 bytes y codificados en base58), de modo que las direcciones Cosmos, EVM y SVM de una misma clave se refieren a los mismos fondos.

## v3.1.80 — Consultas de anclas de estado multicapa

**Enfoque de la versión:** Anclas de liquidación legibles y verificables sin conexión para rollups.

* **Consultas de lectura de anclas** — El servicio de consultas de `x/multilayer` ahora expone `Anchor` (el ancla de estado más reciente de una capa) y `Anchors` (el historial de anclas de una capa), de modo que los clientes pueden obtener el ancla de liquidación de una capa y verificarla de forma independiente.
* **Puerta de enlace REST para multilayer** — Todas las consultas de multilayer (`params`, `layers`, `layers/{layer_id}`, `anchor/{layer_id}`, `anchors/{layer_id}`, `routing-stats`) están ahora disponibles por REST además de gRPC.
* **Recibos de liquidación resistentes a lo cuántico desbloqueados** — Cada ancla lleva una firma **ML-DSA-87 (Dilithium-5)** sobre sus campos canónicos, proporcionando la base en cadena para la verificación sin conexión de recibos de liquidación del Rollup Development Kit.

## v3.1.79 — Aprovisionamiento automático de validadores para redes puente

**Enfoque de la versión:** Participación llave en mano en redes conectadas para validadores con licencia.

* **Marco de drivers de red** — Un marco declarativo de drivers permite que un validador de QoreChain que posea la licencia `validator_<chain>` (o `qcb_bridge`) correspondiente tenga el cliente de la red externa asociada aprovisionado, configurado y ejecutado en el mismo nodo bajo la orquestación de QoreChain — solo una vez que la licencia esté activada.
* **Drivers para las 37 redes puente** — La cobertura abarca todas las redes conectadas, clasificadas por modelo de participación (validador sin permisos, con cupo/electo/por admisión, nodo completo de L2 y roles sin staking/de lista de confianza). Las claves de staking y de firma de la red externa siguen siendo aportadas por el operador para cada red; QoreChain proporciona el marco y la puerta de licencia aplicada.

## v3.1.78 — Preparación previa al despliegue

**Enfoque de la versión:** Wallets, puentes, IBC y licencias funcionan desde el lanzamiento — sin gobernanza posterior al despliegue.

* **Activación de puentes post-despliegue sin confianza** — Una clave `bridge_admin` (o un titular de licencia `qcb_bridge`) puede activar el puente de cualquier cadena conectada con una sola transacción firmada (`tx bridge update-chain-config` / `set-verifier-bootstrap`) — estableciendo la dirección del contrato, las confirmaciones, la arquitectura, el estado, el verificador activo y la raíz de confianza del verificador — sin propuesta de gobernanza ni actualización de la cadena.
* **Puerta de licencia para redes de validadores** — El orquestador ahora aplica la licencia `validator_<chain>` / `qcb_bridge` (con cierre ante fallo) antes de iniciar cualquier cliente de red externa.
* **Paquetes de integración de wallets** — `@qorechain/wallet-adapter` y `@qorechain/connect` publicados en npm (v0.1.0), añadiendo registro de red en MetaMask con una sola llamada (EIP-3085, QOR nativo de **18 decimales** en el raíl EVM) y configuración del precio de gas para Keplr.
* **Relayer IBC llave en mano** — Configuración de relayer lista para ejecutar y herramientas de bootstrap de canales para las ocho contrapartes IBC, de modo que los canales se levantan tras el despliegue sin configuración a medida.

## v3.1.77 — Endpoints REST de puente y quema

**Enfoque de la versión:** Acceso REST de solo lectura para los módulos de cross-chain y de suministro.

* **Endpoints REST de puente** — Endpoints de consulta HTTP de solo lectura para el módulo de puente, exponiendo el estado del puente por REST estándar además de gRPC.
* **Endpoints REST de quema** — Endpoints de consulta HTTP de solo lectura para el módulo de quema, haciendo consultables por REST estándar los datos de distribución de comisiones y de suministro.

## v3.1.76 — Modernización de la toolchain de SVM

**Enfoque de la versión:** Actualización de compatibilidad con la Solana Virtual Machine.

* **Soporte de programas con la toolchain actual** — Ejecución de la SVM modernizada para que los programas compilados con la toolchain actual de Solana se ejecuten en el runtime SVM de QoreChain.

## v3.1.75 — JSON-RPC de SVM por defecto

**Enfoque de la versión:** RPC compatible con Solana listo para usar.

* **JSON-RPC compatible con Solana** — El servidor JSON-RPC de la SVM ahora está habilitado por defecto (puerto **8899**) y se inicia automáticamente con el nodo, proporcionando una interfaz RPC compatible con Solana para las herramientas de SVM.

## v3.1.74 — Perfiles preconfigurados de rollup

**Enfoque de la versión:** Usabilidad y liquidación del Rollup Development Kit.

* **Aplicación de perfiles preconfigurados** — La creación de rollups ahora aplica el preset del perfil seleccionado (DeFi, gaming, NFT, empresarial o totalmente personalizado), de modo que los nuevos rollups heredan valores predeterminados razonables para su caso de uso.
* **Liquidación optimista** — La ruta de liquidación optimista (envío de lotes y desafío) está operativa de extremo a extremo.

## v3.1.73 — Línea base de hash post-cuántico

**Enfoque de la versión:** Completar la línea base criptográfica post-cuántica por defecto.

* **SHAKE-256 como hash por defecto** — SHAKE-256 (familia SHA-3) se adopta como hash de aplicación por defecto, completando la línea base post-cuántica predeterminada de firmas **ML-DSA-87 (Dilithium-5)**, encapsulación de claves **ML-KEM-1024** y hashing **SHAKE-256**.

## v3.1.72 — Estabilidad y mantenimiento

**Enfoque de la versión:** Mantenimiento rutinario de estabilidad y del pipeline de compilación.

* **Mejoras de estabilidad** — Mantenimiento interno de estabilidad, dependencias y pipeline de compilación sin cambios de comportamiento visibles externamente.

## v3.1.71 — Firmas híbridas PQC aplicadas por defecto

**Enfoque de la versión:** Seguridad post-cuántica activada por defecto en la ruta de transacciones de Cosmos.

* **Firmas híbridas requeridas por defecto** — Las firmas híbridas post-cuánticas ahora se aplican por defecto en la ruta de transacciones de Cosmos: cada transacción lleva una firma post-cuántica **ML-DSA-87 (Dilithium-5)** junto a la firma clásica **secp256k1**.
* **Aplicación controlada por gobernanza** — El modo de aplicación sigue controlado por gobernanza, con el valor predeterminado establecido en **requerido**.

## v3.1.70 — Endurecimiento para producción

**Enfoque de la versión:** Endurecimiento para producción y optimización del consenso para la mainnet en vivo.

* **Optimización del consenso PRISM** — Mejoras continuas en la capa de optimización por aprendizaje por refuerzo PRISM para el ajuste adaptativo de parámetros bajo condiciones de red en vivo, con controles de seguridad de tipo cortacircuitos.
* **Rendimiento y estabilidad** — Refinamientos de throughput, latencia y uso de recursos en validadores y nodos completos.
* **Herramientas operativas** — Mejoras en la ergonomía de monitorización, consulta y operación de nodos para los operadores de mainnet.
* **Alineación con Tokenomics v2.1** — Distribución de comisiones y mecánicas de emisión alineadas con el modelo económico de suministro fijo y emisión finita.

## v3.0.0 — Génesis de mainnet

**Enfoque de la versión:** Lanzamiento de mainnet y evento de generación de tokens.

* **Génesis de mainnet** — La mainnet de QoreChain (`qorechain-vladi`, chain ID EVM 9801) se lanzó el **7 de junio de 2026**, con el evento de generación de tokens (TGE) en el génesis.
* **Reparto de comisiones en cinco vías** — Distribución de las comisiones del protocolo entre validadores, quema, tesorería, stakers y nodos ligeros (**37 / 30 / 20 / 10 / 3**), añadiendo una participación dedicada para los nodos ligeros.
* **AMM en cadena** — Módulo nativo de creador de mercado automatizado (`x/amm`) para pools de liquidez y swaps en cadena.
* **Licencias de cadena** — Módulo de licencias en cadena (`x/license`) para registrar y gestionar derechos del protocolo.
* **Paradigmas de liquidación consolidados** — Modos de liquidación del RDK finalizados como optimista, zk, based y soberano.

## v1.4.0 — Expansión previa a mainnet

**Enfoque de la versión:** Cobertura cross-chain y estabilización de la release candidate antes de mainnet.

* **Cobertura cross-chain ampliada** — Conectividad adicional de IBC y puentes hacia un conjunto más amplio de redes externas.
* **Participación de nodos ligeros** — Se introdujeron los nodos ligeros y las bases para sus recompensas por participación en comisiones.
* **Endurecimiento de la release candidate** — Pruebas exhaustivas, auditorías y estabilización en todos los módulos centrales en preparación para el génesis de mainnet.

## v1.3.0 — Rollup Development Kit

**Enfoque de la versión:** Infraestructura nativa de rollups para despliegues de rollups soberanos y de seguridad compartida.

* **Módulo x/rdk** — Rollup Development Kit completo con cuatro paradigmas de liquidación: optimista, zk, based y soberano
* **5 perfiles preconfigurados** — Plantillas de rollup preconfiguradas para casos de uso de DeFi, gaming, NFT, empresarial y totalmente personalizado
* **Disponibilidad de datos nativa** — Capa de DA en cadena con almacenamiento de blobs, gestión de retención y ciclo de vida de poda
* **Autofinalización en el EndBlocker** — Finalización automática de lotes cuando expira la ventana de desafío, sin intervención del operador
* **Selección de perfil asistida por IA** — Consulta `suggest-profile` que recomienda una configuración de rollup óptima según el caso de uso previsto
* **Integración multicapa** — Los rollups se registran como capas en la arquitectura multicapa, heredando las mecánicas de enrutamiento, anclaje y desafío
* **Ciclo de vida de depósito en garantía bancario** — El stake del operador se mantiene en depósito en garantía durante la operación del rollup y se libera al cierre limpio o se pierde por slashing

## v1.2.0 — IBC y puentes

**Enfoque de la versión:** Conectividad cross-chain y abstracciones avanzadas de cuentas.

* **25 conexiones cross-chain** — 8 canales IBC y 17 conexiones QoreChain Bridge (QCB) a redes externas
* **Módulo x/babylon** — Integración de restaking de BTC que permite a los tenedores de Bitcoin participar en la seguridad de staking de QoreChain
* **Módulo x/abstractaccount** — Marco de cuentas inteligentes con reglas de gasto programables, claves de sesión y lógica de autenticación personalizada
* **Módulo x/fairblock** — Cifrado basado en identidad con umbral (tIBE) para el cifrado de transacciones resistente a MEV
* **Módulo x/gasabstraction** — Pago de gas multi-token con soporte para QOR nativo, USDC vía IBC y ATOM vía IBC
* **Priorización de TX en 5 carriles** — Carriles de transacciones ordenados por prioridad: sistema, gobernanza, staking, puente y general
* **Configuraciones de relayer IBC** — Configuraciones de relayer preconfiguradas para todos los canales IBC compatibles
* **Integración puente-quema** — Las comisiones de los puentes se encaminan a través de la distribución de comisiones del módulo de quema

## v1.1.0 — Firmas híbridas PQC

**Enfoque de la versión:** Seguridad criptográfica post-cuántica y agilidad de algoritmos.

* **Firmas duales secp256k1 (ECDSA) + ML-DSA-87** — Cada transacción lleva tanto una firma clásica como una post-cuántica, verificadas en la cadena del AnteHandler
* **3 modos de aplicación** — Aplicación configurable de firmas híbridas: desactivado (modo 0), permisivo (modo 1, PQC opcional), obligatorio (modo 2, PQC requerido)
* **Autorregistro** — Las claves públicas PQC se registran automáticamente en la primera transacción híbrida, eliminando un paso de registro separado
* **Base de hash SHAKE-256** — Todas las operaciones de hashing relacionadas con PQC usan SHAKE-256 (familia SHA-3) para la derivación de direcciones resistente a lo cuántico
* **Interfaces de atestación TEE** — Soporte de atestación de entorno de ejecución confiable (TEE) para probar la integridad de la generación de claves PQC
* **Marco de agilidad de algoritmos** — Registro de algoritmos conectable que permite añadir futuros algoritmos PQC mediante gobernanza sin actualizar la cadena

## v1.0.0 — Génesis (motor de tokenomics)

**Enfoque de la versión:** Lanzamiento inicial del protocolo con tokenomics completa, ejecución multi-VM y operaciones asistidas por IA.

* **Módulo x/burn** — Mecanismo de quema de comisiones multicanal con distribución en cuatro vías entre validadores, quema, tesorería y stakers
* **Módulo x/xqore** — Derivado de staking de gobernanza con penalizaciones escalonadas por desbloqueo anticipado y redistribución de rebase PvP
* **Módulo x/inflation** — Emisión basada en épocas con decaimiento anual, regida por el modelo económico de emisión finita
* **Capa de consenso PRISM** — Optimización por aprendizaje por refuerzo (PPO) para el ajuste dinámico de parámetros de la cadena con controles de seguridad de tipo cortacircuitos
* **CPoS de triple pool** — Proof-of-Stake clasificado con pools de validadores Emerald, Sapphire y Ruby ponderados por puntuaciones de reputación
* **Gobernanza QDRW** — Sistema de ponderación dinámica de recompensas (Dynamic Reward Weighting) que permite ajustes aprobados por gobernanza en la distribución de recompensas entre pools
* **Runtimes EVM + CosmWasm + SVM** — Tres entornos de ejecución concurrentes: el QoreChain EVM Engine, contratos inteligentes CosmWasm y la Solana Virtual Machine
* **Puente cross-VM** — Paso de mensajes y transferencias de activos entre los runtimes EVM, CosmWasm y SVM dentro de un mismo bloque
* **Criptografía post-cuántica** — Firma resistente a lo cuántico respaldada por una biblioteca PQC de alto rendimiento
* **QCAI** — Análisis heurístico en cadena con un sidecar opcional fuera de cadena para detección de fraude, estimación de comisiones y optimización de la red
* **Despliegue en contenedores** — Despliegue completo de testnet multi-validador con servicio sidecar e indexador de bloques
* **Indexador de bloques** — Listener de bloques con almacenamiento persistente para consultas históricas y analítica
