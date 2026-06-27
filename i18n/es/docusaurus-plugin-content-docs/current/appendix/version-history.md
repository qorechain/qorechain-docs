---
slug: /appendix/version-history
title: Historial de versiones
sidebar_label: Historial de versiones
sidebar_position: 3
---

# Historial de versiones

Historial de versiones público de QoreChain. La última versión es la **v3.1.77**, ejecutándose en la mainnet **`qorechain-vladi`** (EVM chain ID **9801**, en funcionamiento desde el 7 de junio de 2026). La testnet **`qorechain-diana`** (EVM chain ID **9800**) sigue las compilaciones previas a la versión.

:::note
Las entradas siguientes son resúmenes de capacidades de alto nivel. Las entradas anteriores `v1.x` se conservan como registro histórico de la línea de versiones de testnet que precedió a la mainnet.
:::

---

## v3.1.77 — Versión actual de mainnet

**Foco de la versión:** Acceso REST de solo lectura para los módulos de cadena cruzada y de suministro.

* **Endpoints REST del puente** — Endpoints de consulta HTTP de solo lectura para el módulo del puente, exponiendo el estado del puente sobre REST estándar además de gRPC.
* **Endpoints REST de quema** — Endpoints de consulta HTTP de solo lectura para el módulo de quema, haciendo que los datos de distribución de comisiones y suministro sean consultables sobre REST estándar.

## v3.1.76 — Modernización de la cadena de herramientas SVM

**Foco de la versión:** Renovación de la compatibilidad con la Solana Virtual Machine.

* **Soporte de programas con la cadena de herramientas actual** — Ejecución SVM modernizada para que los programas compilados con la cadena de herramientas actual de Solana se ejecuten en el runtime SVM de QoreChain.

## v3.1.75 — SVM JSON-RPC por defecto

**Foco de la versión:** RPC compatible con Solana listo para usar.

* **JSON-RPC compatible con Solana** — El servidor SVM JSON-RPC ahora está habilitado por defecto (puerto **8899**) y se inicia automáticamente con el nodo, proporcionando una interfaz RPC compatible con Solana para las herramientas SVM.

## v3.1.74 — Presets de perfil de rollup

**Foco de la versión:** Usabilidad y liquidación del Rollup Development Kit.

* **Aplicación de presets de perfil** — La creación de rollups ahora aplica el preset del perfil seleccionado (DeFi, gaming, NFT, enterprise o totalmente personalizado), de modo que los nuevos rollups heredan valores predeterminados razonables para su caso de uso.
* **Liquidación optimistic** — La ruta de liquidación optimistic (envío de lotes y desafío) es operativa de extremo a extremo.

## v3.1.73 — Línea base de hash post-cuántico

**Foco de la versión:** Completar la línea base criptográfica post-cuántica predeterminada.

* **SHAKE-256 como hash predeterminado** — SHAKE-256 (familia SHA-3) se adopta como el hash de aplicación predeterminado, completando la línea base post-cuántica predeterminada de firmas **ML-DSA-87 (Dilithium-5)**, encapsulación de claves **ML-KEM-1024** y hashing **SHAKE-256**.

## v3.1.72 — Estabilidad y mantenimiento

**Foco de la versión:** Estabilidad rutinaria y mantenimiento del pipeline de compilación.

* **Mejoras de estabilidad** — Mantenimiento interno de estabilidad, dependencias y pipeline de compilación sin cambios de comportamiento visibles externamente.

## v3.1.71 — Firmas híbridas PQC obligatorias por defecto

**Foco de la versión:** Seguridad post-cuántica activada por defecto en la ruta de transacciones de Cosmos.

* **Firmas híbridas obligatorias por defecto** — Las firmas híbridas post-cuánticas ahora son obligatorias por defecto en la ruta de transacciones de Cosmos: cada transacción lleva una firma post-cuántica **ML-DSA-87 (Dilithium-5)** junto con la firma clásica **secp256k1**.
* **Cumplimiento controlado por gobernanza** — El modo de cumplimiento sigue estando controlado por gobernanza, con el valor predeterminado establecido en **required**.

## v3.1.70 — Endurecimiento para producción

**Foco de la versión:** Endurecimiento para producción y optimización del consenso para la mainnet en funcionamiento.

* **Optimización de consenso PRISM** — Mejoras continuas en la capa de optimización por aprendizaje por refuerzo PRISM para el ajuste adaptativo de parámetros bajo condiciones de red en vivo, con controles de seguridad de disyuntor.
* **Rendimiento y estabilidad** — Refinamientos de rendimiento, latencia y uso de recursos en validadores y nodos completos.
* **Herramientas operativas** — Mejoras en la monitorización, las consultas y la ergonomía de operación de nodos para los operadores de mainnet.
* **Alineación con tokenomics v2.1** — Mecánica de distribución de comisiones y emisión alineada con el modelo económico de suministro fijo y emisión finita.

## v3.0.0 — Génesis de mainnet

**Foco de la versión:** Lanzamiento de la mainnet y evento de generación de tokens.

* **Génesis de mainnet** — La mainnet de QoreChain (`qorechain-vladi`, EVM chain ID 9801) se lanzó el **7 de junio de 2026**, con el evento de generación de tokens (TGE) en el génesis.
* **División de comisiones en cinco partes** — Distribución de comisiones del protocolo entre validadores, quema, tesorería, stakers y nodos ligeros (**37 / 30 / 20 / 10 / 3**), añadiendo una cuota dedicada para los nodos ligeros.
* **AMM en cadena** — Módulo nativo de creador de mercado automatizado (`x/amm`) para pools de liquidez y swaps en cadena.
* **Licenciamiento de cadena** — Módulo de licencia en cadena (`x/license`) para registrar y gestionar derechos del protocolo.
* **Paradigmas de liquidación endurecidos** — Los modos de liquidación del RDK se finalizan como optimistic, zk, based y sovereign.

## v1.4.0 — Expansión previa a la mainnet

**Foco de la versión:** Cobertura entre cadenas y estabilización de release candidate antes de la mainnet.

* **Cobertura entre cadenas ampliada** — Conectividad IBC y de puente adicional a un conjunto más amplio de redes externas.
* **Participación de nodos ligeros** — Se introdujeron los nodos ligeros y la base para sus recompensas de cuota de comisiones.
* **Endurecimiento de release candidate** — Pruebas exhaustivas, auditorías y estabilización en todos los módulos centrales en preparación para el génesis de la mainnet.

## v1.3.0 — Rollup Development Kit

**Foco de la versión:** Infraestructura nativa de rollups para despliegues de rollups soberanos y de seguridad compartida.

* **Módulo x/rdk** — Rollup Development Kit completo con cuatro paradigmas de liquidación: optimistic, zk, based y sovereign
* **5 perfiles preconfigurados** — Plantillas de rollup preconfiguradas para DeFi, gaming, NFT, enterprise y casos de uso totalmente personalizados
* **Disponibilidad de datos nativa** — Capa DA en cadena con almacenamiento de blobs, gestión de retención y ciclo de vida de poda
* **Autofinalización en EndBlocker** — Finalización automática de lotes cuando expira la ventana de desafío, sin necesidad de intervención del operador
* **Selección de perfil asistida por IA** — Consulta `suggest-profile` que recomienda una configuración óptima de rollup según el caso de uso previsto
* **Integración multicapa** — Los rollups se registran como capas en la arquitectura multicapa, heredando la mecánica de enrutamiento, anclaje y desafío
* **Ciclo de vida de custodia bancaria** — El stake del operador se mantiene en custodia durante la operación del rollup y se libera tras un apagado limpio o se confisca en caso de slashing

## v1.2.0 — IBC y puentes

**Foco de la versión:** Conectividad entre cadenas y abstracciones de cuenta avanzadas.

* **25 conexiones entre cadenas** — 8 canales IBC y 17 conexiones QoreChain Bridge (QCB) a redes externas
* **Módulo x/babylon** — Integración de restaking de BTC que permite a los poseedores de Bitcoin participar en la seguridad de staking de QoreChain
* **Módulo x/abstractaccount** — Marco de cuentas inteligentes con reglas de gasto programables, claves de sesión y lógica de autenticación personalizada
* **Módulo x/fairblock** — Cifrado Basado en Identidad con Umbral (tIBE) para el cifrado de transacciones resistente a MEV
* **Módulo x/gasabstraction** — Pago de gas multi-token compatible con QOR nativo, USDC puenteado vía IBC y ATOM puenteado vía IBC
* **Priorización de TX en 5 carriles** — Carriles de transacción ordenados por prioridad: sistema, gobernanza, staking, puente y general
* **Configuraciones de relayer IBC** — Configuraciones de relayer preconfiguradas para todos los canales IBC admitidos
* **Integración puente-a-quema** — Las comisiones del puente se enrutan a través de la distribución de comisiones del módulo de quema

## v1.1.0 — Firmas híbridas PQC

**Foco de la versión:** Seguridad criptográfica post-cuántica y agilidad de algoritmos.

* **Firmas duales secp256k1 (ECDSA) + ML-DSA-87** — Cada transacción lleva tanto una firma clásica como una post-cuántica, verificadas en la cadena del AnteHandler
* **3 modos de cumplimiento** — Cumplimiento de firma híbrida configurable: desactivado (modo 0), permisivo (modo 1, PQC opcional), obligatorio (modo 2, PQC requerido)
* **Autorregistro** — Las claves públicas PQC se registran automáticamente en la primera transacción híbrida, eliminando un paso de registro separado
* **Base de hash SHAKE-256** — Todas las operaciones de hashing relacionadas con PQC usan SHAKE-256 (familia SHA-3) para la derivación de direcciones resistente a la computación cuántica
* **Interfaces de atestación TEE** — Soporte de atestación de Entorno de Ejecución Confiable para probar la integridad de la generación de claves PQC
* **Marco de agilidad de algoritmos** — Registro de algoritmos enchufable que permite añadir futuros algoritmos PQC mediante gobernanza sin una actualización de la cadena

## v1.0.0 — Génesis (Motor de tokenomics)

**Foco de la versión:** Lanzamiento inicial del protocolo con tokenomics completos, ejecución multi-VM y operaciones asistidas por IA.

* **Módulo x/burn** — Mecanismo de quema de comisiones multicanal con una distribución en cuatro partes entre validadores, quema, tesorería y stakers
* **Módulo x/xqore** — Derivado de staking de gobernanza con penalizaciones por desbloqueo anticipado escalonadas y redistribución por rebase PvP
* **Módulo x/inflation** — Emisión basada en épocas con decaimiento anual, regida por el modelo económico de emisión finita
* **Capa de consenso PRISM** — Optimización por aprendizaje por refuerzo (PPO) para el ajuste dinámico de parámetros de la cadena con controles de seguridad de disyuntor
* **CPoS de triple pool** — Prueba de Participación Clasificada con pools de validadores Emerald, Sapphire y Ruby ponderados por puntuaciones de reputación
* **Gobernanza QDRW** — Sistema de Ponderación Dinámica de Recompensas que permite ajustes aprobados por gobernanza a la distribución de recompensas entre pools
* **Runtimes EVM + CosmWasm + SVM** — Tres entornos de ejecución concurrentes: el Motor EVM de QoreChain, contratos inteligentes CosmWasm y la Solana Virtual Machine
* **Puente Cross-VM** — Paso de mensajes y transferencias de activos entre los runtimes EVM, CosmWasm y SVM dentro de un mismo bloque
* **Criptografía post-cuántica** — Firma resistente a la computación cuántica respaldada por una biblioteca PQC de alto rendimiento
* **QCAI** — Análisis heurístico en cadena con un sidecar opcional fuera de cadena para la detección de fraude, la estimación de comisiones y la optimización de la red
* **Despliegue en contenedores** — Despliegue completo de testnet multi-validador con servicio sidecar e indexador de bloques
* **Indexador de bloques** — Escucha de bloques con almacenamiento persistente para consultas históricas y analítica
