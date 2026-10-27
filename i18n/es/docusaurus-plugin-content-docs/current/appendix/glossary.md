---
slug: /appendix/glossary
title: Glosario
sidebar_label: Glosario
sidebar_position: 1
---

# Glosario

Referencia alfabética de términos, abreviaturas y acrónimos utilizados a lo largo de la documentación de QoreChain.

---

**AMM** — Creador de Mercado Automatizado (Automated Market Maker). El módulo nativo de liquidez en cadena de QoreChain (`x/amm`) que proporciona pools de producto constante, swaps y provisión de liquidez directamente a nivel de protocolo, sin un despliegue externo de contrato inteligente. Consulta [AMM](/architecture/amm).

**Ventana de autorización (EVM)** — Un permiso acotado (bloques, número de transacciones, valor total) que se abre con un mensaje del carril Cosmos que lleva una firma híbrida ML-DSA-87 (FIPS 204) y dentro del cual debe caer una transacción del carril EVM desde v3.2.0. Desde v3.2.3 una ventana puede restringirse a transferencias nativas únicamente o a una lista de destinatarios. Consulta [Ventana de autorización EVM](/getting-started/first-transaction#evm-window).

**BPF** — Berkeley Packet Filter. El formato de bytecode utilizado por el runtime SVM para ejecutar programas en cadena. Los programas se compilan a BPF antes del despliegue.

**Licencia de cadena** — Un registro de licencia en cadena gestionado por el módulo `x/license`. Las licencias de cadena controlan el acceso a capacidades específicas del protocolo y permiten a los operadores registrar, verificar y gestionar derechos de licencia en cadena. Consulta [Licenciamiento de cadena](/architecture/chain-licensing).

**Disyuntor (circuit breaker)** — El mecanismo del Cosmos SDK que desactiva tipos de mensaje individuales en toda la red; la lista actual se puede consultar en `/cosmos/circuit/v1/disable_list`. Consulta [Parámetros de la cadena](/appendix/chain-parameters#circuit-breaker).

**CLFB** — Agrupación de Comisiones entre Capas (Cross-Layer Fee Bundling). Un único pago de comisión en la capa de origen que cubre la ejecución a través de las capas de una ruta entre capas (el parámetro `cross_layer_fee_bundling` de `x/multilayer`). Consulta [Arquitectura multicapa](/architecture/multilayer-architecture).

**CPI** — Invocación entre Programas (Cross-Program Invocation). Un mecanismo en el runtime SVM que permite a un programa desplegado llamar a otro programa dentro del mismo contexto de transacción.

**CPoS** — Prueba de Participación Compuesta (Composite Proof-of-Stake). El diseño de clasificación de consenso de QoreChain que agrupa a los validadores en tres pools (RPoS, DPoS, PoS) según la reputación y la delegación. Cada pool tiene pesos distintos en el algoritmo de selección de proponentes. Implementado en `x/qca`, pero aún no activo en la producción de bloques.

**DA** — Disponibilidad de Datos (Data Availability). La garantía de que los datos de transacción publicados en la cadena pueden ser recuperados por cualquier nodo. El módulo RDK proporciona DA nativa para rollups, almacenando blobs en cadena con periodos de retención configurables.

**DPoS** — Prueba de Participación Delegada (Delegated Proof-of-Stake). Un mecanismo de consenso en el que los poseedores de tokens delegan su stake a validadores que producen bloques en su nombre.

**EIP-1559** — Propuesta de Mejora de Ethereum 1559 (Ethereum Improvement Proposal 1559). Un modelo de comisiones de transacción que utiliza una comisión base (quemada) más una comisión de prioridad (pagada a los validadores). QoreChain implementa una mecánica de comisiones al estilo EIP-1559 en su Motor EVM de QoreChain.

**HCS** — Esquemas de Compromiso Jerárquicos (Hierarchical Commitment Schemes). El mecanismo por el cual las sidechains, las paychains y los rollups anclan periódicamente sus raíces de estado en la cadena principal (consulta la Arquitectura multicapa). No debe confundirse con el esquema de firma híbrido secp256k1 + ML-DSA-87, que esta documentación denomina *firma híbrida*.

**Hybrid sign-bytes v2** — Los bytes etiquetados por dominio y vinculados a la cadena que firma la clave ML-DSA desde v3.2.0. Consulta [Seguridad post-cuántica](/architecture/post-quantum-security#sign-bytes-v2).

**IBC** — Comunicación entre Cadenas de Bloques (Inter-Blockchain Communication). Un protocolo para el paso autenticado de mensajes entre cadenas de bloques independientes. QoreChain admite canales IBC para transferencias de tokens entre cadenas y retransmisión de datos.

**Nodo ligero** — Un cliente de bajos recursos que sigue la cadena contrastando las cabeceras de bloque con uno o varios endpoints RPC, sin mantener el estado completo. No atiende consultas de otros. La división de comisiones del protocolo reserva una cuota del **3%** para el programa de recompensas de nodos ligeros. El registro en el programa está abierto y sujeto a una licencia `lightnode_operator` (50 $, que se compra en el Dashboard); a 27 de octubre de 2026 se habían concedido siete licencias en la mainnet y se había registrado un nodo ligero en cada red. Ejecutar un nodo no requiere licencia. Consulta [Nodo ligero](/light-node/overview) y su [estado del programa de recompensas](/light-node/overview#reward-program-status).

**MEV** — Valor Máximo Extraíble (Maximal Extractable Value). El beneficio que se puede obtener reordenando, insertando o censurando transacciones dentro de un bloque. El módulo FairBlock de QoreChain (cifrado tIBE) está diseñado para mitigar la extracción de MEV; todavía no está habilitado.

**ML-DSA-87** — Algoritmo de Firma Digital basado en Retículos Modulares (Module-Lattice Digital Signature Algorithm, nivel de seguridad 5). El esquema de firma digital post-cuántica estandarizado por el NIST que utiliza QoreChain, junto con secp256k1, para las firmas híbridas de transacción en el carril nativo. Produce firmas de 4.627 bytes con claves públicas de 2.592 bytes.

**ML-KEM-1024** — Mecanismo de Encapsulación de Claves basado en Retículos Modulares (Module-Lattice Key Encapsulation Mechanism, nivel de seguridad 5). Un esquema de encapsulación de claves post-cuántica estandarizado por el NIST, disponible en el registro de algoritmos PQC de QoreChain para futuros canales de comunicación cifrados.

**MLP** — Perceptrón Multicapa (Multi-Layer Perceptron). Una clase de red neuronal utilizada por QCAI para el reconocimiento de patrones en la detección de fraude y la puntuación de anomalías.

**PPO** — Optimización de Política Proximal (Proximal Policy Optimization). Un algoritmo de aprendizaje por refuerzo utilizado por PRISM para optimizar los parámetros de la cadena (tiempo de bloque, precio del gas, pesos de los pools; el tamaño del conjunto de validadores solo se registra) según las condiciones observadas de la red. En las redes en producción no se carga ninguna política entrenada.

**PQC** — Criptografía Post-Cuántica (Post-Quantum Cryptography). Algoritmos criptográficos diseñados para ser seguros frente a ataques tanto de computadoras clásicas como cuánticas. QoreChain implementa PQC a través de su módulo `x/pqc` con ML-DSA-87 como esquema de firma principal.

**PRISM** — Aprendizaje por Refuerzo Basado en Políticas para Máquinas de Estado Inteligentes (Policy-driven Reinforcement-learning for Intelligent State Machines). La capa de optimización por aprendizaje por refuerzo integrada en el Motor de Consenso de QoreChain (mediante el módulo `x/rlconsensus`). PRISM observa las métricas de la red y está diseñado para proponer ajustes deterministas de los parámetros de consenso bajo controles de seguridad de disyuntor; hoy funciona en modo de observación. Consulta [Motor de Consenso PRISM](/architecture/prism-consensus-engine).

**Prueba de posesión (PoP)** — Una firma que una clave post-cuántica realiza sobre sus propios datos de registro, demostrando que quien se registra posee la clave privada. Opcional en el registro de claves de cuenta desde v3.2.3 (`tx pqc register-key-v2 ... --pqc-key <name>`); obligatoria para las claves de validadores del puente desde v3.2.4 (en la testnet desde el 19 de octubre de 2026 y en la mainnet desde el 23 de octubre de 2026).

**Característica de protocolo** — Un interruptor de comportamiento que el manejador de actualización de una versión activa en una altura de bloque concreta en todos los nodos (por ejemplo `pqc-sign-bytes-v2`, `evm-pqc-authorisation-window`), de modo que el historial se reproduce sin cambios por debajo de esa altura.

**PvP Rebase** — Rebase Jugador contra Jugador (Player versus Player Rebase). Un mecanismo en el módulo xQORE donde las penalizaciones por desbloqueo anticipado se redistribuyen proporcionalmente a los stakers que permanecen bloqueados, recompensando el compromiso a largo plazo (aún no conectado en cadena).

**QCAI** — Inteligencia Artificial de QoreChain (QoreChain Artificial Intelligence). El término general para el subsistema de IA de QoreChain, que incluye el motor heurístico en cadena (módulo `x/ai`) y el sidecar QCAI fuera de cadena que proporciona capacidades avanzadas de inferencia.

**QoreChain Native** — El nombre que QoreChain da a su runtime de contratos inteligentes CosmWasm: los contratos se escriben en Rust con las bibliotecas estándar de CosmWasm y se compilan a WebAssembly. Es uno de los tres runtimes (EVM, QoreChain Native, SVM). La subida e instanciación ordinarias de contratos están actualmente cerradas en ambas redes (consulta [Desarrollo con QoreChain Native](/developer-guide/cosmwasm-development)).

**QCB** — Puente de QoreChain (QoreChain Bridge). El protocolo de puente nativo de QoreChain para conectar con cadenas no IBC (p. ej., Ethereum, Bitcoin, Solana, Avalanche). QCB utiliza un umbral de atestación de validadores (7 de 10 firmas ML-DSA-87) para la atestación entre cadenas. Consulta [Arquitectura del puente](/architecture/bridge-architecture).

**QDRW** — Delegación Cuadrática con Ponderación por Reputación (Quadratic Delegation with Reputation Weighting). Una fórmula de poder de voto de gobernanza (raíz cuadrada del stake más xQORE ponderado, escalada por un multiplicador de reputación). Implementada en `x/qca`, pero desactivada en las redes en producción (`qdrw_enabled = false`).

**RDK** — Rollup Development Kit. El marco nativo de QoreChain para desplegar y gestionar rollups con cuatro paradigmas de liquidación (optimistic, zk, based, sovereign), cinco perfiles preconfigurados y disponibilidad de datos integrada. Consulta [Visión general de Rollups](/rollups/overview).

**RL** — Aprendizaje por Refuerzo (Reinforcement Learning). Un enfoque de aprendizaje automático en el que un agente aprende las acciones óptimas mediante prueba y recompensa. PRISM está diseñado para usar RL para ajustar los parámetros de la cadena dentro del Motor de Consenso de QoreChain (hoy solo observación).

**RPoS** — Prueba de Participación por Reputación (Reputation Proof-of-Stake). El pool de los validadores que se sitúan en el percentil 70 de reputación o por encima, con al menos el stake autovinculado mediano. Los validadores ganan reputación mediante la disponibilidad, la participación y las contribuciones a la comunidad.

**SHAKE-256** — Una función hash de longitud de salida variable de la familia SHA-3. SHAKE-256 es el hash de aplicación predeterminado de QoreChain (el paquete `qorehash`) y se usa en operaciones relacionadas con PQC, como la derivación de claves.

**SNARK** — Argumento Sucinto No Interactivo de Conocimiento (Succinct Non-interactive Argument of Knowledge). Un tipo de prueba de conocimiento cero que puede verificarse rápidamente con un tamaño de prueba pequeño. Admitido como paradigma de liquidación en el módulo RDK para zk-rollups.

**STARK** — Argumento Escalable y Transparente de Conocimiento (Scalable Transparent Argument of Knowledge). Un sistema de prueba de conocimiento cero que no requiere configuración de confianza y se basa en funciones hash en lugar de curvas elípticas. Disponible como sistema de prueba alternativo para la liquidación de zk-rollups en el RDK.

**Cuota de stakers varados / reserva del pool de recompensas** — Cantidades registradas en la actualización a v3.2.0 que solo se mueven mediante una votación de gobernanza; la gobernanza las liberó en octubre de 2026 (el remanente corregido de la cuota varada, recalculado en v3.2.3, lo liberó la propuesta 12). Consulta [Tokenomics](/architecture/tokenomics#stranded-and-reserve).

**SVM** — Máquina Virtual de Solana (Solana Virtual Machine). Un entorno de ejecución de alto rendimiento para programas BPF. QoreChain integra la SVM como uno de los tres runtimes admitidos junto con el Motor EVM de QoreChain y QoreChain Native.

**TEE** — Entorno de Ejecución Confiable (Trusted Execution Environment). Un área segura de un procesador que garantiza que el código y los datos están protegidos del acceso externo. QoreChain define especificaciones de interfaz para la atestación TEE; todavía no existe ninguna implementación.

**tIBE** — Cifrado Basado en Identidad con Umbral (Threshold Identity-Based Encryption). Un esquema criptográfico en el que un mensaje solo puede descifrarse cuando colabora un umbral de partes. Utilizado por el módulo FairBlock para cifrar el contenido de las transacciones hasta la finalización del bloque, evitando la extracción de MEV.

**Staking con bloqueo temporal** — Un compromiso opcional de parte de una delegación durante un plazo fijo, proporcionado por el módulo `x/stakingtier`. Forma parte de v3.2.4: en la testnet desde el 19 de octubre de 2026 y en la mainnet desde el 23 de octubre de 2026. Consulta [Staking y delegación](/user-guide/staking-and-delegation#time-locked-staking).

**uqor** — La denominación base del token QOR. 1 QOR = 1.000.000 uqor (10^6). Todas las cantidades en cadena, comisiones y valores de staking se denominan en uqor.

**xQORE** — El derivado de staking de gobernanza de QOR. Los usuarios bloquean QOR para recibir xQORE, lo que otorga un mayor poder de voto en la gobernanza y genera recompensas de rebase PvP procedentes de las penalizaciones por desbloqueo anticipado (comportamiento diseñado; las transacciones de bloqueo y desbloqueo aún no están conectadas en cadena). Consulta [Tokenomics](/architecture/tokenomics#x-xqore).
