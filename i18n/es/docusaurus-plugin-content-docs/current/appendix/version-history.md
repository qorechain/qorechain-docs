---
slug: /appendix/version-history
title: Historial de versiones
sidebar_label: Historial de versiones
sidebar_position: 3
---

# Historial de versiones

Historial de versiones público de QoreChain. La versión más reciente es **v3.1.95**, en ejecución en la mainnet **`qorechain-vladi`** (chain ID EVM **9801**, activa desde el 7 de junio de 2026). La testnet **`qorechain-diana`** (chain ID EVM **9800**) sigue las compilaciones previas al lanzamiento.

:::note
Las entradas siguientes son resúmenes de capacidades de alto nivel. Las entradas anteriores `v1.x` se conservan como registro histórico de la línea de versiones de testnet que precedió a la mainnet.
:::

---

## v3.1.95 — Endurecimiento de Cosmos EVM (versión actual)

**Enfoque de la versión:** Actualización de seguridad progresiva de la biblioteca de contabilidad de saldos EVM.

* **Endurecimiento frente a overflow** — Una ruta de actualización de saldo EVM ahora falla de forma segura en lugar de desbordarse silenciosamente ante una condición extrema de overflow. Se entrega como una actualización progresiva que no rompe el consenso — no se requirió voto de gobernanza ni altura de detención coordinada.

## v3.1.94 — Tope de emisión y endurecimiento de mensajes administrativos

**Enfoque de la versión:** Alinear la emisión de recompensas de staking con las condiciones reales de la red, y reforzar las verificaciones de autorización en mensajes administrativos privilegiados.

* **Tope de emisión** — Una propuesta de gobernanza, aprobada con el pleno respaldo del stake bonded y aplicada en la altura 2,122,074 (26 de agosto de 2026), sustituyó el calendario de emisión decreciente original por un monto fijo por época bajo un tope acumulativo estricto. El calendario original había sido calibrado para una red mucho más madura y totalmente bonded; frente al stake bonded real, estaba pagando mucho más rápido de lo previsto. Consulte [Tokenomics](/architecture/tokenomics#staking-reward-schedule) para conocer las cifras actuales y el margen restante.
* **Endurecimiento de mensajes administrativos** — Un conjunto de mensajes administrativos privilegiados, protegidos por autoridad, ahora verifican a su firmante contra la propia dirección del módulo de gobernanza en lugar de confiar en un valor transportado en el propio mensaje.
* También incorpora la corrección de fiabilidad de incorporación de nodos de la v3.1.92, para cualquier nodo que actualice directamente a esta versión.

## v3.1.92 — Fiabilidad de sincronización de nodos

**Enfoque de la versión:** Incorporación de nodos más fiable a partir de snapshots y del archivo de cadena publicado.

* **Corrección de sincronización de snapshots y archivo** — Se resolvió un problema por el cual un nodo que se restauraba a partir de un snapshot de state-sync o del archivo de cadena publicado podía no completar la sincronización más allá de ciertos bloques históricos. La incorporación por cualquiera de las dos vías ahora se completa de forma fiable.

## v3.1.90 — Contabilización del uptime de nodos ligeros

**Enfoque de la versión:** El uptime medido para la elegibilidad de recompensas de nodos ligeros ahora se acumula de forma consistente a lo largo del tiempo.

* **Acumulación progresiva del uptime** — El uptime de elegibilidad para recompensas de un nodo ligero ahora se calcula acumulando de forma progresiva su recuento esperado de heartbeats desde su propio registro, según el intervalo de heartbeat vigente en cada momento, en lugar de recalcular todo su historial bajo el intervalo actualmente vigente. Por lo tanto, un cambio de gobernanza en el intervalo de heartbeat afecta el uptime únicamente hacia adelante, y nunca vuelve a calificar retroactivamente el desempeño pasado de un nodo.

## v3.1.86 — Salvaguarda de recuperación de validadores

**Enfoque de la versión:** Un validador ya no puede quedar bloqueado permanentemente para recuperarse de una cárcel por inactividad.

* **Corrección del bloqueo de cárcel** — Una cuenta de operador de validador sin clave post-cuántica registrada ahora siempre puede enviar `MsgUnjail` para recuperarse de una cárcel por inactividad, incluso cuando la aplicación de firmas híbridas está establecida como requerida con el respaldo clásico desactivado. Anteriormente, dicha cuenta no tenía ninguna vía de recuperación, ya que salir de la cárcel requería enviar una transacción que tenía bloqueada.
* **Snapshots de state-sync** — La generación de snapshots está habilitada en toda la red, lo que permite a los nuevos validadores y nodos completos incorporarse rápidamente mediante state sync en lugar de una reproducción histórica completa.

## v3.1.85 — Gasto delegado mediante wallets vinculadas

**Enfoque de la versión:** Una clave de wallet externa vinculada (Phantom, MetaMask) ahora puede **gastar** desde la única cuenta canónica post-cuántica — bajo permisos de mínimo privilegio, límites de gasto y revocación instantánea.

* **Carriles de ejecución para autenticadores** — Dos nuevos mensajes permiten que un autenticador registrado autorice transferencias desde la cuenta canónica sin que el propietario de la cuenta esté presente: **`MsgExecuteEVM`** (una llamada/transferencia EVM desde la dirección `0x…` de la cuenta) y **`MsgExecuteCosmos`** (un envío bancario por el carril Native). Un **relayer** envía y paga el sobre de la transacción — su propia firma híbrida PQC satisface los requisitos de la transacción — mientras que la firma del autenticador sobre bytes de firma con separación de dominio y protección contra repetición constituye la autorización. La clave externa nunca necesita una cofirma ML-DSA.
* **MetaMask como autenticador** — Los autenticadores secp256k1 ahora pueden registrarse mediante su **dirección Ethereum de 20 bytes** y verificarse vía **EIP-191 `personal_sign`** (además de la forma de clave comprimida de 33 bytes), de modo que una cuenta MetaMask estándar puede vincularse y gastar bajo límites.
* **Aplicación en los tres carriles** — Los alcances de permisos y los límites de valor de **SpendingRule** (por transacción + topes diarios) se aplican en los carriles Native, EVM y SVM; los mensajes de gestión de claves nunca son delegables. Códigos de error distintos permiten a las wallets mostrar el mensaje correcto: `5` límite de gasto excedido, `6` autenticador expirado, `10` permiso denegado, `11` repetición rechazada.
* **Consulta del esquema de permisos** — `GET /qorechain/abstractaccount/v1/permission_schema` (también gRPC/CLI) devuelve la taxonomía canónica de permisos (11 permisos), el mapa mensaje→permiso y la lista de mensajes no delegables, de modo que las wallets validan los alcances sin codificarlos de forma fija.
* **Rotación de claves PQC dentro del mismo algoritmo** — El nuevo **`MsgRotatePQCKey`** rota la clave ML-DSA-87 de una cuenta dentro del mismo algoritmo (con firma dual de la clave antigua y la nueva), lo que permite migrar claves derivadas con el método heredado a la derivación canónica vinculada a la dirección y retirar una clave comprometida. Nuevos comandos CLI: `tx pqc rotate-key` y `tx pqc recover-key` (recuperación determinista de claves a partir de un mnemónico).
* **Las transacciones con clave raíz no se ven afectadas** — Los cambios son aditivos; los flujos normales de wallets, exchanges y Keplr no cambian. Los operadores de nodos deben estar en **v3.1.85** antes de la altura de actualización de la red.

## v3.1.84 — Permisos de autenticadores y límites de gasto

**Enfoque de la versión:** El modelo de permisos detrás del gasto delegado.

* **Taxonomía canónica de permisos** — Once permisos (`all`, `send`, `delegate`, `withdraw`, `vote`, `evm`, `wasm`, `svm`, `amm`, `ibc`, `deploy`) con un mapa mensaje→permiso que falla en cerrado: un tipo de mensaje que no está mapeado se deniega, y los mensajes de gestión de claves nunca pueden delegarse.
* **Aplicación de SpendingRule** — Se aplican y registran topes de gasto por transacción y por día (UTC) con listas de denominaciones permitidas por cada par (cuenta, autenticador).
* **Autorización en el carril SVM** — Las acciones autorizadas por una clave de esquema foráneo (p. ej., ed25519 de Phantom) en el carril SVM pasan por la misma puerta central de autorización.

## v3.1.83 — Firma con cuenta unificada en las tres interfaces

**Enfoque de la versión:** Una clave, una cuenta — una única identidad unificada que ahora puede **firmar**, no solo mantener un saldo, en las interfaces Cosmos, EVM y SVM.

* **Una clave firma en cada carril** — Una cuenta creada como eth-native (dirección = keccak de su clave pública secp256k1) ahora firma transacciones del carril Cosmos con el esquema `eth_secp256k1`, además de las transacciones EVM. Sus formas `qor1…` (Cosmos), `0x…` (EVM) y Solana-VM (base58) son una única identidad de 20 bytes que tanto **mantiene un solo saldo** como **gasta en los tres carriles** — incluidas las transacciones Cosmos híbridas post-cuánticas (ML-DSA-87).
* **La firma post-cuántica no cambia** — La cuenta unificada sigue registrando su clave ML-DSA-87 y lleva la firma híbrida FIPS-204 que la cadena exige; la parte clásica es `eth_secp256k1` (keccak) en lugar del esquema coinType-118. Las cuentas coinType-118 existentes no se ven afectadas.
* **Actualización progresiva neutral para el consenso** — Entregada como una actualización binaria progresiva en ambas redes, **sin re-génesis y sin detención de la cadena**. Los saldos de las cuentas, el historial y el génesis no cambian.
* **Herramientas de cliente** — `@qorechain/wallet-adapter` 0.1.5 añade la firma Cosmos eth-native (`signClassicalEth` / `signHybridEth`), la generación unificada de 3 direcciones y `walletFromSeed` (derivar la cuenta canónica a partir de cualquier semilla de 32 bytes — p. ej., una firma de Phantom); `@qorechain/chain-bridge` incorpora una ruta de firma `eth_secp256k1`.

:::caution Operadores de nodos — actualización obligatoria
Los nodos completos deben ejecutar **v3.1.83+**. Un nodo anterior a 3.1.83 no puede decodificar una transacción eth-native (`eth_secp256k1`) y dejará de sincronizar en cuanto una aparezca en un bloque. Descargue el paquete actual desde [download.qore.host](https://download.qore.host).
:::

## v3.1.82 — QOR nativo en SVM en producción + habilitación para integradores

**Enfoque de la versión:** La unificación de QOR nativo en SVM en funcionamiento en ambas redes, además de todo lo que un exchange o integrador necesita para conectarse.

* **Saldo unificado de QOR nativo activo en las tres interfaces** — La unificación SVM (v3.1.81) está confirmada en producción en mainnet y testnet: la misma cuenta mantiene un único saldo visible como `uqor` (6 decimales) en Cosmos, 18 decimales al estilo wei en la EVM y lamports (9 decimales; 1 uqor = 1,000 lamports) en la interfaz compatible con Solana.
* **Endpoints públicos verificados** — Endpoints HTTPS públicos para RPC de consenso, REST, JSON-RPC de EVM y JSON-RPC de SVM en ambas redes, además del [explorador de bloques](https://explore.qore.network) público. Consulte [Redes](/appendix/networks).
* **Descargas** — Paquetes versionados de binarios de nodo, el génesis de mainnet y snapshots recientes de los datos de la cadena (con sumas de verificación SHA-256) publicados en [download.qore.host](https://download.qore.host).
* **Firma post-cuántica determinista en toda la pila de cliente** — `@qorechain/pqc` 0.1.1 firma ML-DSA-87 de forma determinista (FIPS-204 §3.4) en los seis bindings de lenguaje, en correspondencia con lo que la cadena acepta; `@qorechain/wallet-adapter` 0.1.2 se apoya en él para la firma de transacciones híbridas.
* **Guía para integradores** — Nueva [Guía para exchanges e integradores](/developer-guide/exchange-integration) que cubre depósitos, retiros y operación de nodos a través de las tres interfaces.

## v3.1.81 — Unificación de QOR nativo en SVM

**Enfoque de la versión:** QOR nativo como activo de primera clase en la interfaz compatible con Solana.

* **QOR nativo en SVM** — El entorno de ejecución SVM ahora expone directamente el saldo de QOR nativo de la cuenta (en lamports), en lugar de llevar un saldo separado exclusivo de SVM. `getBalance` y `getSignaturesForAddress` funcionan contra los fondos nativos, y las transferencias del System Program mueven QOR nativo.
* **Mapeo de direcciones SVM** — La dirección SVM de una cuenta se deriva de sus 20 bytes de cuenta (rellenados a la derecha hasta 32 bytes y codificados en base58), de modo que las direcciones Cosmos, EVM y SVM de una misma clave se refieren a los mismos fondos.

## v3.1.80 — Consultas de anclajes de estado multicapa

**Enfoque de la versión:** Anclajes de liquidación legibles y verificables sin conexión para rollups.

* **Consultas de lectura de anclajes** — El servicio de consultas de `x/multilayer` ahora expone `Anchor` (el anclaje de estado más reciente de una capa) y `Anchors` (el historial de anclajes de una capa), de modo que los clientes pueden obtener el anclaje de liquidación de una capa y verificarlo de forma independiente.
* **Pasarela REST para multilayer** — Cada consulta multilayer (`params`, `layers`, `layers/{layer_id}`, `anchor/{layer_id}`, `anchors/{layer_id}`, `routing-stats`) está ahora disponible por REST además de gRPC.
* **Recibos de liquidación con seguridad cuántica desbloqueados** — Cada anclaje lleva una firma **ML-DSA-87 (Dilithium-5)** sobre sus campos canónicos, lo que proporciona la base en cadena para la verificación sin conexión de recibos de liquidación del Rollup Development Kit.

## v3.1.79 — Aprovisionamiento automático de validadores para redes puente

**Enfoque de la versión:** Participación llave en mano en redes conectadas para validadores con licencia.

* **Framework de drivers de red** — Un framework declarativo de drivers permite que un validador de QoreChain que posea la licencia `validator_<chain>` (o `qcb_bridge`) correspondiente tenga el cliente de la red externa asociada aprovisionado, configurado y en ejecución en el mismo nodo bajo la orquestación de QoreChain — solo una vez que la licencia esté activada.
* **Drivers para las 37 redes puente** — La cobertura abarca todas las redes conectadas, clasificadas por modelo de participación (validador sin permisos, con límite/electo/por admisión, nodo completo L2 y roles sin staking/lista de confianza). Las claves de staking y firma de la red externa siguen siendo aportadas por el operador para cada red; QoreChain proporciona el framework y la puerta de licencia aplicada.

## v3.1.78 — Preparación previa al despliegue

**Enfoque de la versión:** Wallets, puentes, IBC y licencias funcionan desde el lanzamiento — sin gobernanza posterior al despliegue.

* **Activación de puentes post-despliegue sin confianza** — Una clave `bridge_admin` (o un titular de licencia `qcb_bridge`) puede activar el puente de cualquier cadena conectada con una única transacción firmada (`tx bridge update-chain-config` / `set-verifier-bootstrap`) — estableciendo la dirección del contrato, las confirmaciones, la arquitectura, el estado, el verificador activo y la raíz de confianza del verificador — sin propuesta de gobernanza ni actualización de la cadena.
* **Puerta de licencia para redes de validadores** — El orquestador ahora exige la licencia `validator_<chain>` / `qcb_bridge` (falla en cerrado) antes de iniciar cualquier cliente de red externa.
* **Paquetes de integración de wallets** — `@qorechain/wallet-adapter` y `@qorechain/connect` publicados en npm (v0.1.0), añadiendo el registro de red en MetaMask con una sola llamada (EIP-3085, QOR nativo de **18 decimales** en el raíl EVM) y la configuración del precio de gas en Keplr.
* **Relayer IBC llave en mano** — Configuración de relayer lista para ejecutar y herramientas de arranque de canales para las ocho contrapartes IBC, de modo que los canales se levantan tras el despliegue sin configuración a medida.

## v3.1.77 — Endpoints REST de puente y quema

**Enfoque de la versión:** Acceso REST de solo lectura para los módulos de cross-chain y suministro.

* **Endpoints REST del puente** — Endpoints de consulta HTTP de solo lectura para el módulo de puente, exponiendo el estado del puente por REST estándar además de gRPC.
* **Endpoints REST de quema** — Endpoints de consulta HTTP de solo lectura para el módulo de quema, haciendo consultables por REST estándar los datos de distribución de comisiones y suministro.

## v3.1.76 — Modernización de la cadena de herramientas SVM

**Enfoque de la versión:** Actualización de compatibilidad con la Solana Virtual Machine.

* **Compatibilidad con programas de la cadena de herramientas actual** — Ejecución SVM modernizada para que los programas compilados con la cadena de herramientas actual de Solana se ejecuten en el entorno SVM de QoreChain.

## v3.1.75 — JSON-RPC de SVM por defecto

**Enfoque de la versión:** RPC compatible con Solana listo para usar.

* **JSON-RPC compatible con Solana** — El servidor JSON-RPC de SVM ahora está habilitado por defecto (puerto **8899**) y se inicia automáticamente con el nodo, proporcionando una interfaz RPC compatible con Solana para las herramientas SVM.

## v3.1.74 — Perfiles predefinidos de rollup

**Enfoque de la versión:** Usabilidad y liquidación del Rollup Development Kit.

* **Aplicación de perfiles predefinidos** — La creación de rollups ahora aplica el preset del perfil seleccionado (DeFi, gaming, NFT, empresarial o totalmente personalizado), de modo que los nuevos rollups heredan valores por defecto sensatos para su caso de uso.
* **Liquidación optimista** — La ruta de liquidación optimista (envío de lotes y disputa) está operativa de extremo a extremo.

## v3.1.73 — Línea base de hash post-cuántico

**Enfoque de la versión:** Completar la línea base criptográfica post-cuántica por defecto.

* **SHAKE-256 como hash por defecto** — SHAKE-256 (familia SHA-3) se adopta como hash de aplicación por defecto, completando la línea base post-cuántica por defecto de firmas **ML-DSA-87 (Dilithium-5)**, encapsulación de claves **ML-KEM-1024** y hashing **SHAKE-256**.

## v3.1.72 — Estabilidad y mantenimiento

**Enfoque de la versión:** Mantenimiento rutinario de estabilidad y de la canalización de compilación.

* **Mejoras de estabilidad** — Mantenimiento interno de estabilidad, dependencias y canalización de compilación sin cambios de comportamiento visibles externamente.

## v3.1.71 — Firmas híbridas PQC aplicadas por defecto

**Enfoque de la versión:** Seguridad post-cuántica activada por defecto en la ruta de transacciones Cosmos.

* **Firmas híbridas requeridas por defecto** — Las firmas híbridas post-cuánticas se aplican ahora por defecto en la ruta de transacciones Cosmos: cada transacción lleva una firma post-cuántica **ML-DSA-87 (Dilithium-5)** junto a la firma clásica **secp256k1**.
* **Aplicación controlada por gobernanza** — El modo de aplicación sigue controlado por gobernanza, con el valor por defecto establecido en **requerido**.

## v3.1.70 — Endurecimiento de producción

**Enfoque de la versión:** Endurecimiento de producción y optimización del consenso para la mainnet en vivo.

* **Optimización del consenso PRISM** — Mejoras continuas en la capa de optimización por aprendizaje por refuerzo PRISM para el ajuste adaptativo de parámetros bajo condiciones reales de red, con controles de seguridad tipo cortacircuitos.
* **Rendimiento y estabilidad** — Refinamientos de throughput, latencia y uso de recursos en validadores y nodos completos.
* **Herramientas operativas** — Mejoras en la monitorización, las consultas y la ergonomía de operación de nodos para los operadores de mainnet.
* **Alineación con Tokenomics v2.1** — Mecánicas de distribución de comisiones y emisión alineadas con el modelo económico de suministro fijo y emisión finita.

## v3.0.0 — Génesis de mainnet

**Enfoque de la versión:** Lanzamiento de la mainnet y evento de generación de tokens.

* **Génesis de mainnet** — La mainnet de QoreChain (`qorechain-vladi`, chain ID EVM 9801) se lanzó el **7 de junio de 2026**, con el evento de generación de tokens (TGE) en el génesis.
* **Reparto de comisiones en cinco vías** — Distribución de las comisiones del protocolo entre validadores, quema, tesorería, stakers y nodos ligeros (**37 / 30 / 20 / 10 / 3**), añadiendo una parte dedicada a los nodos ligeros.
* **AMM en cadena** — Módulo nativo de creador de mercado automatizado (`x/amm`) para pools de liquidez y swaps en cadena.
* **Licencias de cadena** — Módulo de licencias en cadena (`x/license`) para registrar y gestionar derechos del protocolo.
* **Paradigmas de liquidación endurecidos** — Modos de liquidación del RDK finalizados como optimista, zk, based y soberano.

## v1.4.0 — Expansión previa a la mainnet

**Enfoque de la versión:** Cobertura cross-chain y estabilización de la candidata a versión final antes de la mainnet.

* **Cobertura cross-chain ampliada** — Conectividad IBC y de puentes adicional hacia un conjunto más amplio de redes externas.
* **Participación de nodos ligeros** — Se introdujeron los nodos ligeros y las bases para sus recompensas por participación en comisiones.
* **Endurecimiento de la candidata a versión final** — Pruebas exhaustivas, auditorías y estabilización de todos los módulos centrales en preparación para el génesis de la mainnet.

## v1.3.0 — Rollup Development Kit

**Enfoque de la versión:** Infraestructura nativa de rollups para despliegues de rollups soberanos y de seguridad compartida.

* **Módulo x/rdk** — Rollup Development Kit completo con cuatro paradigmas de liquidación: optimista, zk, based y soberano
* **5 perfiles predefinidos** — Plantillas de rollup preconfiguradas para casos de uso DeFi, gaming, NFT, empresarial y totalmente personalizado
* **Disponibilidad de datos nativa** — Capa de DA en cadena con almacenamiento de blobs, gestión de retención y ciclo de vida de poda
* **Autofinalización por EndBlocker** — Finalización automática de lotes cuando expira la ventana de disputa, sin necesidad de intervención del operador
* **Selección de perfil asistida por IA** — Consulta `suggest-profile` que recomienda una configuración óptima de rollup según el caso de uso previsto
* **Integración multicapa** — Los rollups se registran como capas en la arquitectura multicapa, heredando las mecánicas de enrutamiento, anclaje y disputa
* **Ciclo de vida de depósito en garantía** — El stake del operador se mantiene en garantía durante la operación del rollup y se libera tras un cierre limpio o se pierde por slashing

## v1.2.0 — IBC y puentes

**Enfoque de la versión:** Conectividad cross-chain y abstracciones avanzadas de cuentas.

* **25 conexiones cross-chain** — 8 canales IBC y 17 conexiones QoreChain Bridge (QCB) a redes externas
* **Módulo x/babylon** — Integración de restaking de BTC que permite a los tenedores de Bitcoin participar en la seguridad de staking de QoreChain
* **Módulo x/abstractaccount** — Framework de cuentas inteligentes con reglas de gasto programables, claves de sesión y lógica de autenticación personalizada
* **Módulo x/fairblock** — Cifrado basado en identidad con umbral (tIBE) para el cifrado de transacciones resistente al MEV
* **Módulo x/gasabstraction** — Pago de gas multi-token con soporte para QOR nativo, USDC puenteado por IBC y ATOM puenteado por IBC
* **Priorización de TX en 5 carriles** — Carriles de transacciones ordenados por prioridad: sistema, gobernanza, staking, puente y general
* **Configuraciones de relayer IBC** — Configuraciones de relayer predefinidas para todos los canales IBC soportados
* **Integración puente-quema** — Las comisiones del puente se enrutan a través de la distribución de comisiones del módulo de quema

## v1.1.0 — Firmas híbridas PQC

**Enfoque de la versión:** Seguridad criptográfica post-cuántica y agilidad de algoritmos.

* **Firmas duales secp256k1 (ECDSA) + ML-DSA-87** — Cada transacción lleva tanto una firma clásica como una post-cuántica, verificadas en la cadena del AnteHandler
* **3 modos de aplicación** — Aplicación configurable de firmas híbridas: desactivada (modo 0), permisiva (modo 1, PQC opcional), obligatoria (modo 2, PQC requerida)
* **Autorregistro** — Las claves públicas PQC se registran automáticamente en la primera transacción híbrida, eliminando un paso de registro separado
* **Base de hash SHAKE-256** — Todas las operaciones de hashing relacionadas con PQC usan SHAKE-256 (familia SHA-3) para una derivación de direcciones resistente a la computación cuántica
* **Interfaces de atestación TEE** — Soporte de atestación de Entornos de Ejecución Confiables para demostrar la integridad de la generación de claves PQC
* **Framework de agilidad de algoritmos** — Registro de algoritmos conectable que permite añadir futuros algoritmos PQC vía gobernanza sin una actualización de la cadena

## v1.0.0 — Génesis (motor de tokenomics)

**Enfoque de la versión:** Lanzamiento inicial del protocolo con tokenomics completa, ejecución multi-VM y operaciones asistidas por IA.

* **Módulo x/burn** — Mecanismo de quema de comisiones multicanal con una distribución en cuatro vías entre validadores, quema, tesorería y stakers
* **Módulo x/xqore** — Derivado de staking de gobernanza con penalizaciones escalonadas por desbloqueo anticipado y redistribución de rebase PvP
* **Módulo x/inflation** — Emisión basada en épocas con decaimiento anual, regida por el modelo económico de emisión finita
* **Capa de consenso PRISM** — Optimización por aprendizaje por refuerzo (PPO) para el ajuste dinámico de parámetros de la cadena con controles de seguridad tipo cortacircuitos
* **CPoS de triple pool** — Proof-of-Stake Clasificado con pools de validadores Emerald, Sapphire y Ruby ponderados por puntuaciones de reputación
* **Gobernanza QDRW** — Sistema de Ponderación Dinámica de Recompensas que permite ajustes aprobados por gobernanza en la distribución de recompensas entre pools
* **Entornos EVM + CosmWasm + SVM** — Tres entornos de ejecución concurrentes: el QoreChain EVM Engine, contratos inteligentes CosmWasm y la Solana Virtual Machine
* **Puente cross-VM** — Paso de mensajes y transferencias de activos entre los entornos EVM, CosmWasm y SVM dentro de un mismo bloque
* **Criptografía post-cuántica** — Firma resistente a la computación cuántica respaldada por una biblioteca PQC de alto rendimiento
* **QCAI** — Análisis heurístico en cadena con un sidecar opcional fuera de cadena para detección de fraude, estimación de comisiones y optimización de la red
* **Despliegue en contenedores** — Despliegue completo de testnet multivalidador con servicio sidecar e indexador de bloques
* **Indexador de bloques** — Listener de bloques con almacenamiento persistente para consultas históricas y analítica
