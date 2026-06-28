---
slug: /appendix/version-history
title: Historial de Versiones
sidebar_label: Historial de Versiones
sidebar_position: 3
---

# Historial de Versiones

Historial público de versiones de QoreChain. La última versión es **v3.1.80**, ejecutándose en la mainnet **`qorechain-vladi`** (EVM chain ID **9801**, activa desde el 7 de junio de 2026). La testnet **`qorechain-diana`** (EVM chain ID **9800**) sigue las compilaciones previas al lanzamiento.

:::note
Las entradas a continuación son resúmenes de capacidades de alto nivel. Las entradas anteriores `v1.x` se conservan como registro histórico de la línea de lanzamiento de testnet que precedió a la mainnet.
:::

---

## v3.1.80 — Consultas de Anclaje de Estado Multicapa (Versión Actual de Mainnet)

**Enfoque de la versión:** Anclajes de liquidación legibles y verificables sin conexión para rollups.

* **Consultas de lectura de anclajes** — El servicio de consultas `x/multilayer` ahora expone `Anchor` (el último anclaje de estado de una capa) y `Anchors` (el historial de anclajes de una capa), de modo que los clientes pueden obtener el anclaje de liquidación de una capa y verificarlo de forma independiente.
* **Pasarela REST para multicapa** — Cada consulta de multicapa (`params`, `layers`, `layers/{layer_id}`, `anchor/{layer_id}`, `anchors/{layer_id}`, `routing-stats`) ahora está disponible a través de REST además de gRPC.
* **Recibos de liquidación seguros frente a la computación cuántica desbloqueados** — Cada anclaje incluye una firma **ML-DSA-87 (Dilithium-5)** sobre sus campos canónicos, lo que proporciona la base on-chain para la verificación sin conexión de recibos de liquidación del Rollup Development Kit.

## v3.1.79 — Auto-Aprovisionamiento de Validadores para Redes de Puente

**Enfoque de la versión:** Participación lista para usar en redes conectadas para validadores con licencia.

* **Marco de controladores de red** — Un marco de controladores declarativo permite que un validador de QoreChain que posea la licencia `validator_<chain>` (o `qcb_bridge`) correspondiente tenga el cliente de red externa coincidente aprovisionado, configurado y ejecutado en el mismo nodo bajo la orquestación de QoreChain — solo una vez que la licencia esté activada.
* **Controladores para las 37 redes de puente** — La cobertura abarca todas las redes conectadas, clasificadas por modelo de participación (validador sin permisos, con límite/elegido/admisión, nodo completo L2 y roles sin staking/lista de confianza). El stake y las claves de firma de la red externa siguen siendo proporcionados por el operador para cada red; QoreChain entrega el marco y la barrera de licencia aplicada.

## v3.1.78 — Preparación Previa al Despliegue

**Enfoque de la versión:** Las carteras, los puentes, IBC y las licencias funcionan en el lanzamiento — sin gobernanza posterior al despliegue.

* **Activación de puentes sin confianza posterior al despliegue** — Una clave `bridge_admin` (o titular de licencia `qcb_bridge`) puede activar el puente de cualquier cadena conectada con una sola transacción firmada (`tx bridge update-chain-config` / `set-verifier-bootstrap`) — estableciendo la dirección del contrato, las confirmaciones, la arquitectura, el estado, el verificador activo y la raíz de confianza del verificador — sin propuesta de gobernanza ni actualización de cadena.
* **Barrera de licencia de red de validadores** — El orquestador ahora aplica la licencia `validator_<chain>` / `qcb_bridge` (fail-closed) antes de iniciar cualquier cliente de red externa.
* **Paquetes de integración de carteras** — `@qorechain/wallet-adapter` y `@qorechain/connect` publicados en npm (v0.1.0), añadiendo el registro de red de MetaMask con una sola llamada (EIP-3085, QOR nativo de **18 decimales** en el riel EVM) y la configuración de precio de gas de Keplr.
* **Relayer IBC listo para usar** — Configuración de relayer lista para ejecutar y herramientas de bootstrap de canales para las ocho contrapartes IBC, de modo que los canales se levanten tras el despliegue sin configuración a medida.

## v3.1.77 — Endpoints REST de Bridge y Burn

**Enfoque de la versión:** Acceso REST de solo lectura para los módulos cross-chain y de suministro.

* **Endpoints REST de Bridge** — Endpoints de consulta HTTP de solo lectura para el módulo bridge, exponiendo el estado del puente sobre REST estándar además de gRPC.
* **Endpoints REST de Burn** — Endpoints de consulta HTTP de solo lectura para el módulo burn, haciendo consultables los datos de distribución de comisiones y de suministro sobre REST estándar.

## v3.1.76 — Modernización de la Cadena de Herramientas SVM

**Enfoque de la versión:** Renovación de la compatibilidad con la Solana Virtual Machine.

* **Soporte de programas con la cadena de herramientas actual** — Ejecución SVM modernizada para que los programas compilados con la cadena de herramientas actual de Solana se ejecuten en el runtime SVM de QoreChain.

## v3.1.75 — JSON-RPC de SVM por Defecto

**Enfoque de la versión:** RPC compatible con Solana listo para usar.

* **JSON-RPC compatible con Solana** — El servidor JSON-RPC de SVM ahora está habilitado por defecto (puerto **8899**) y se inicia automáticamente con el nodo, proporcionando una interfaz RPC compatible con Solana para las herramientas de SVM.

## v3.1.74 — Plantillas Predefinidas de Perfiles de Rollup

**Enfoque de la versión:** Usabilidad y liquidación del Rollup Development Kit.

* **Aplicación de plantillas predefinidas de perfil** — La creación de rollups ahora aplica la plantilla predefinida del perfil seleccionado (DeFi, gaming, NFT, empresarial o totalmente personalizado), de modo que los nuevos rollups heredan valores predeterminados sensatos para su caso de uso.
* **Liquidación optimista** — La vía de liquidación optimista (envío de lotes y disputa) es operativa de extremo a extremo.

## v3.1.73 — Línea Base de Hash Post-Cuántico

**Enfoque de la versión:** Completar la línea base criptográfica post-cuántica por defecto.

* **Hash SHAKE-256 por defecto** — SHAKE-256 (familia SHA-3) se adopta como el hash de aplicación por defecto, completando la línea base post-cuántica por defecto de firmas **ML-DSA-87 (Dilithium-5)**, encapsulación de claves **ML-KEM-1024** y hashing **SHAKE-256**.

## v3.1.72 — Estabilidad y Mantenimiento

**Enfoque de la versión:** Estabilidad rutinaria y mantenimiento de la canalización de compilación.

* **Mejoras de estabilidad** — Mantenimiento interno de estabilidad, dependencias y canalización de compilación sin cambios de comportamiento visibles externamente.

## v3.1.71 — Firmas Híbridas PQC Aplicadas por Defecto

**Enfoque de la versión:** Seguridad post-cuántica activada por defecto en la vía de transacciones de Cosmos.

* **Firmas híbridas requeridas por defecto** — Las firmas híbridas post-cuánticas ahora se aplican por defecto en la vía de transacciones de Cosmos: cada transacción incluye una firma post-cuántica **ML-DSA-87 (Dilithium-5)** junto a la firma clásica **secp256k1**.
* **Aplicación controlada por gobernanza** — El modo de aplicación sigue estando controlado por gobernanza, con el valor predeterminado establecido en **required**.

## v3.1.70 — Endurecimiento para Producción

**Enfoque de la versión:** Endurecimiento para producción y optimización de consenso para la mainnet en vivo.

* **Optimización de consenso PRISM** — Mejoras continuas en la capa de optimización por aprendizaje por refuerzo de PRISM para el ajuste adaptativo de parámetros bajo condiciones de red en vivo, con controles de seguridad de tipo disyuntor (circuit-breaker).
* **Rendimiento y estabilidad** — Refinamientos de rendimiento, latencia y uso de recursos en validadores y nodos completos.
* **Herramientas operativas** — Mejora de la monitorización, las consultas y la ergonomía de operación de nodos para los operadores de mainnet.
* **Alineación con Tokenomics v2.1** — Distribución de comisiones y mecánica de emisión alineadas con el modelo económico de suministro fijo y emisión finita.

## v3.0.0 — Génesis de Mainnet

**Enfoque de la versión:** Lanzamiento de mainnet y evento de generación de tokens.

* **Génesis de mainnet** — La mainnet de QoreChain (`qorechain-vladi`, EVM chain ID 9801) se lanzó el **7 de junio de 2026**, con el evento de generación de tokens (TGE) en el génesis.
* **Reparto de comisiones en cinco vías** — Distribución de comisiones del protocolo entre validadores, burn, tesorería, stakers y nodos ligeros (**37 / 30 / 20 / 10 / 3**), añadiendo una participación dedicada para los nodos ligeros.
* **AMM on-chain** — Módulo nativo de creador de mercado automatizado (`x/amm`) para pools de liquidez y swaps on-chain.
* **Licencias de cadena** — Módulo de licencias on-chain (`x/license`) para registrar y gestionar los derechos del protocolo.
* **Paradigmas de liquidación endurecidos** — Modos de liquidación del RDK finalizados como optimistic, zk, based y sovereign.

## v1.4.0 — Expansión Previa a la Mainnet

**Enfoque de la versión:** Cobertura cross-chain y estabilización de candidata a lanzamiento antes de la mainnet.

* **Cobertura cross-chain ampliada** — Conectividad adicional de IBC y de puente a un conjunto más amplio de redes externas.
* **Participación de nodos ligeros** — Se introdujeron los nodos ligeros y las bases para sus recompensas de participación en comisiones.
* **Endurecimiento de candidata a lanzamiento** — Pruebas, auditorías y estabilización exhaustivas en todos los módulos centrales en preparación para el génesis de mainnet.

## v1.3.0 — Rollup Development Kit

**Enfoque de la versión:** Infraestructura nativa de rollups para despliegues de rollups soberanos y de seguridad compartida.

* **Módulo x/rdk** — Rollup Development Kit completo con cuatro paradigmas de liquidación: optimistic, zk, based y sovereign
* **5 perfiles predefinidos** — Plantillas de rollup preconfiguradas para casos de uso de DeFi, gaming, NFT, empresarial y totalmente personalizado
* **Disponibilidad de datos nativa** — Capa de DA on-chain con almacenamiento de blobs, gestión de retención y ciclo de vida de pruning
* **Auto-finalización con EndBlocker** — Finalización automática de lotes cuando expira la ventana de disputa, sin necesidad de intervención del operador
* **Selección de perfil asistida por IA** — Consulta `suggest-profile` que recomienda una configuración óptima de rollup según el caso de uso previsto
* **Integración multicapa** — Los rollups se registran como capas en la arquitectura multicapa, heredando las mecánicas de enrutamiento, anclaje y disputa
* **Ciclo de vida de escrow del banco** — El stake del operador se mantiene en escrow durante la operación del rollup y se libera tras un cierre limpio o se confisca en caso de slashing

## v1.2.0 — IBC y Puentes

**Enfoque de la versión:** Conectividad cross-chain y abstracciones de cuenta avanzadas.

* **25 conexiones cross-chain** — 8 canales IBC y 17 conexiones de QoreChain Bridge (QCB) a redes externas
* **Módulo x/babylon** — Integración de restaking de BTC que permite a los poseedores de Bitcoin participar en la seguridad del staking de QoreChain
* **Módulo x/abstractaccount** — Marco de cuentas inteligentes con reglas de gasto programables, claves de sesión y lógica de autenticación personalizada
* **Módulo x/fairblock** — Cifrado de identidad basado en umbrales (tIBE) para el cifrado de transacciones resistente a MEV
* **Módulo x/gasabstraction** — Pago de gas multi-token que admite QOR nativo, USDC puenteado por IBC y ATOM puenteado por IBC
* **Priorización de TX en 5 carriles** — Carriles de transacciones ordenados por prioridad: sistema, gobernanza, staking, puente y general
* **Configuraciones de relayer IBC** — Configuraciones de relayer preconfiguradas para todos los canales IBC compatibles
* **Integración bridge-to-burn** — Las comisiones del puente se enrutan a través de la distribución de comisiones del módulo burn

## v1.1.0 — Firmas Híbridas PQC

**Enfoque de la versión:** Seguridad criptográfica post-cuántica y agilidad de algoritmos.

* **Firmas duales secp256k1 (ECDSA) + ML-DSA-87** — Cada transacción incluye una firma clásica y una post-cuántica, verificadas en la cadena del AnteHandler
* **3 modos de aplicación** — Aplicación configurable de firmas híbridas: off (modo 0), permissive (modo 1, PQC opcional), mandatory (modo 2, PQC requerido)
* **Auto-registro** — Las claves públicas PQC se registran automáticamente en la primera transacción híbrida, eliminando un paso de registro separado
* **Base de hash SHAKE-256** — Todas las operaciones de hashing relacionadas con PQC usan SHAKE-256 (familia SHA-3) para la derivación de direcciones resistente a la computación cuántica
* **Interfaces de atestación TEE** — Soporte de atestación de Trusted Execution Environment para demostrar la integridad de la generación de claves PQC
* **Marco de agilidad de algoritmos** — Registro de algoritmos enchufable que permite añadir futuros algoritmos PQC mediante gobernanza sin una actualización de cadena

## v1.0.0 — Génesis (Motor de Tokenomics)

**Enfoque de la versión:** Lanzamiento inicial del protocolo con tokenomics completo, ejecución multi-VM y operaciones asistidas por IA.

* **Módulo x/burn** — Mecanismo de quema de comisiones multicanal con una distribución en cuatro vías entre validadores, burn, tesorería y stakers
* **Módulo x/xqore** — Derivado de staking de gobernanza con penalizaciones escalonadas por desbloqueo anticipado y redistribución rebase PvP
* **Módulo x/inflation** — Emisión basada en épocas con decaimiento anual, regida por el modelo económico de emisión finita
* **Capa de consenso PRISM** — Optimización por aprendizaje por refuerzo (PPO) para el ajuste dinámico de parámetros de cadena con controles de seguridad de tipo disyuntor (circuit-breaker)
* **CPoS de triple pool** — Classified Proof-of-Stake con pools de validadores Emerald, Sapphire y Ruby ponderados por puntuaciones de reputación
* **Gobernanza QDRW** — Sistema de Dynamic Reward Weighting que permite ajustes aprobados por gobernanza a la distribución de recompensas entre pools
* **Runtimes EVM + CosmWasm + SVM** — Tres entornos de ejecución concurrentes: el QoreChain EVM Engine, los contratos inteligentes CosmWasm y la Solana Virtual Machine
* **Puente cross-VM** — Paso de mensajes y transferencias de activos entre los runtimes EVM, CosmWasm y SVM dentro de un único bloque
* **Criptografía post-cuántica** — Firma resistente a la computación cuántica respaldada por una biblioteca PQC de alto rendimiento
* **QCAI** — Análisis heurístico on-chain con un sidecar off-chain opcional para la detección de fraude, la estimación de comisiones y la optimización de red
* **Despliegue en contenedores** — Despliegue completo de testnet multi-validador con servicio sidecar e indexador de bloques
* **Indexador de bloques** — Escucha de bloques con almacenamiento persistente para consultas históricas y análisis
