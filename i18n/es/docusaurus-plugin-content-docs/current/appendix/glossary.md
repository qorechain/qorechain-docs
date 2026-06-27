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

**BPF** — Berkeley Packet Filter. El formato de bytecode utilizado por el runtime SVM para ejecutar programas en cadena. Los programas se compilan a BPF antes del despliegue.

**Licencia de cadena** — Un registro de licencia en cadena gestionado por el módulo `x/license`. Las licencias de cadena controlan el acceso a capacidades específicas del protocolo y permiten a los operadores registrar, verificar y gestionar derechos de licencia en cadena. Consulta [Licenciamiento de cadena](/architecture/chain-licensing).

**CLFB** — Equilibrado de Comisiones entre Capas (Cross-Layer Fee Balancing). Un mecanismo dentro de la arquitectura multicapa que ajusta dinámicamente las comisiones entre sidechains y paychains para mantener el equilibrio y evitar la congestión en cualquier capa individual.

**CPI** — Invocación entre Programas (Cross-Program Invocation). Un mecanismo en el runtime SVM que permite a un programa desplegado llamar a otro programa dentro del mismo contexto de transacción.

**CPoS** — Prueba de Participación Clasificada (Classified Proof-of-Stake). El sistema de clasificación de consenso de QoreChain que agrupa a los validadores en tres pools (Emerald, Sapphire, Ruby) según sus puntuaciones de reputación. Cada pool tiene pesos distintos en el algoritmo de selección de proponentes.

**DA** — Disponibilidad de Datos (Data Availability). La garantía de que los datos de transacción publicados en la cadena pueden ser recuperados por cualquier nodo. El módulo RDK proporciona DA nativa para rollups, almacenando blobs en cadena con periodos de retención configurables.

**DPoS** — Prueba de Participación Delegada (Delegated Proof-of-Stake). Un mecanismo de consenso en el que los poseedores de tokens delegan su stake a validadores que producen bloques en su nombre. QoreChain amplía DPoS con clasificación ponderada por reputación (CPoS).

**EIP-1559** — Propuesta de Mejora de Ethereum 1559 (Ethereum Improvement Proposal 1559). Un modelo de comisiones de transacción que utiliza una comisión base (quemada) más una comisión de prioridad (pagada a los validadores). QoreChain implementa una mecánica de comisiones al estilo EIP-1559 en su Motor EVM de QoreChain.

**HCS** — Firmas Criptográficas Híbridas (Hybrid Cryptographic Signatures). El sistema de doble firma de QoreChain donde las transacciones llevan tanto una firma clásica (secp256k1/ECDSA) como una firma post-cuántica (ML-DSA-87), proporcionando seguridad criptográfica frente a adversarios tanto clásicos como cuánticos.

**IBC** — Comunicación entre Cadenas de Bloques (Inter-Blockchain Communication). Un protocolo para el paso autenticado de mensajes entre cadenas de bloques independientes. QoreChain admite canales IBC para transferencias de tokens entre cadenas y retransmisión de datos.

**Nodo ligero** — Un nodo de bajos recursos que sigue la cadena y atiende consultas ligeras sin mantener el estado completo. Los nodos ligeros reciben una cuota dedicada del **3%** de la división de comisiones del protocolo, recompensando a los participantes que amplían el alcance de la red. Consulta [Nodo ligero](/light-node/overview).

**MEV** — Valor Máximo Extraíble (Maximal Extractable Value). El beneficio que se puede obtener reordenando, insertando o censurando transacciones dentro de un bloque. El módulo FairBlock de QoreChain (cifrado tIBE) y la priorización de TX en 5 carriles mitigan la extracción de MEV.

**ML-DSA-87** — Algoritmo de Firma Digital basado en Retículos Modulares (Module-Lattice Digital Signature Algorithm, nivel de seguridad 5). El esquema de firma digital post-cuántica estandarizado por el NIST que utiliza QoreChain para la firma de transacciones resistente a la computación cuántica. Produce firmas de 4.627 bytes con claves públicas de 2.592 bytes.

**ML-KEM-1024** — Mecanismo de Encapsulación de Claves basado en Retículos Modulares (Module-Lattice Key Encapsulation Mechanism, nivel de seguridad 5). Un esquema de encapsulación de claves post-cuántica estandarizado por el NIST, disponible en el registro de algoritmos PQC de QoreChain para futuros canales de comunicación cifrados.

**MLP** — Perceptrón Multicapa (Multi-Layer Perceptron). Una clase de red neuronal utilizada por QCAI para el reconocimiento de patrones en la detección de fraude y la puntuación de anomalías.

**PPO** — Optimización de Política Proximal (Proximal Policy Optimization). Un algoritmo de aprendizaje por refuerzo utilizado por PRISM para optimizar los parámetros de la cadena (tamaño de bloque, límites de gas, tamaño del conjunto de validadores) según las condiciones observadas de la red.

**PQC** — Criptografía Post-Cuántica (Post-Quantum Cryptography). Algoritmos criptográficos diseñados para ser seguros frente a ataques tanto de computadoras clásicas como cuánticas. QoreChain implementa PQC a través de su módulo `x/pqc` con ML-DSA-87 como esquema de firma principal.

**PRISM** — Aprendizaje por Refuerzo Basado en Políticas para Máquinas de Estado Inteligentes (Policy-driven Reinforcement-learning for Intelligent State Machines). La capa de optimización por aprendizaje por refuerzo integrada en el Motor de Consenso de QoreChain (mediante el módulo `x/rlconsensus`). PRISM observa las métricas de la red y propone ajustes deterministas de los parámetros de consenso bajo controles de seguridad de disyuntor. Consulta [Motor de Consenso PRISM](/architecture/prism-consensus-engine).

**PvP Rebase** — Rebase Jugador contra Jugador (Player versus Player Rebase). Un mecanismo en el módulo xQORE donde las penalizaciones por desbloqueo anticipado se redistribuyen proporcionalmente a los stakers que permanecen bloqueados, recompensando el compromiso a largo plazo.

**QCAI** — Inteligencia Artificial de QoreChain (QoreChain Artificial Intelligence). El término general para el subsistema de IA de QoreChain, que incluye el motor heurístico en cadena (módulo `x/ai`) y el sidecar QCAI fuera de cadena que proporciona capacidades avanzadas de inferencia.

**QCB** — Puente de QoreChain (QoreChain Bridge). El protocolo de puente nativo de QoreChain para conectar con cadenas no IBC (p. ej., Ethereum, Bitcoin, Solana, Avalanche). QCB utiliza un conjunto federado de validadores para la atestación entre cadenas. Consulta [Arquitectura del puente](/architecture/bridge-architecture).

**QDRW** — Ponderación Dinámica de Recompensas de QoreChain (QoreChain Dynamic Reward Weighting). Un mecanismo de gobernanza que permite a PRISM (con aprobación de gobernanza) ajustar dinámicamente los pesos de distribución de recompensas entre los pools de validadores, optimizando las métricas de salud de la red.

**RDK** — Rollup Development Kit. El marco nativo de QoreChain para desplegar y gestionar rollups con cuatro paradigmas de liquidación (optimistic, zk, based, sovereign), cinco perfiles preconfigurados y disponibilidad de datos integrada. Consulta [Visión general de Rollups](/rollups/overview).

**RL** — Aprendizaje por Refuerzo (Reinforcement Learning). Un enfoque de aprendizaje automático en el que un agente aprende las acciones óptimas mediante prueba y recompensa. PRISM usa RL para ajustar dinámicamente los parámetros de la cadena dentro del Motor de Consenso de QoreChain.

**RPoS** — Prueba de Participación basada en Reputación (Reputation-based Proof-of-Stake). El modelo de consenso general que combina la delegación DPoS con la puntuación de reputación. Los validadores ganan reputación mediante la disponibilidad, la participación y las contribuciones a la comunidad, lo que influye en la frecuencia de sus propuestas de bloque.

**SHAKE-256** — Una función hash de longitud de salida variable de la familia SHA-3. QoreChain usa SHAKE-256 como su función hash fundamental para operaciones relacionadas con PQC, incluyendo la derivación de claves y el cálculo de direcciones.

**SNARK** — Argumento Sucinto No Interactivo de Conocimiento (Succinct Non-interactive Argument of Knowledge). Un tipo de prueba de conocimiento cero que puede verificarse rápidamente con un tamaño de prueba pequeño. Admitido como paradigma de liquidación en el módulo RDK para zk-rollups.

**STARK** — Argumento Escalable y Transparente de Conocimiento (Scalable Transparent Argument of Knowledge). Un sistema de prueba de conocimiento cero que no requiere configuración de confianza y es resistente a la computación cuántica. Disponible como sistema de prueba alternativo para la liquidación de zk-rollups en el RDK.

**SVM** — Máquina Virtual de Solana (Solana Virtual Machine). Un entorno de ejecución de alto rendimiento para programas BPF. QoreChain integra la SVM como uno de los tres runtimes admitidos junto con el Motor EVM de QoreChain y CosmWasm.

**TEE** — Entorno de Ejecución Confiable (Trusted Execution Environment). Un área segura de un procesador que garantiza que el código y los datos están protegidos del acceso externo. El módulo PQC de QoreChain admite la atestación TEE para las pruebas de generación de claves.

**tIBE** — Cifrado Basado en Identidad con Umbral (Threshold Identity-Based Encryption). Un esquema criptográfico en el que un mensaje solo puede descifrarse cuando colabora un umbral de partes. Utilizado por el módulo FairBlock para cifrar el contenido de las transacciones hasta la finalización del bloque, evitando la extracción de MEV.

**uqor** — La denominación base del token QOR. 1 QOR = 1.000.000 uqor (10^6). Todas las cantidades en cadena, comisiones y valores de staking se denominan en uqor.

**xQORE** — El derivado de staking de gobernanza de QOR. Los usuarios bloquean QOR para recibir xQORE, lo que otorga un mayor poder de voto en la gobernanza y genera recompensas de rebase PvP procedentes de las penalizaciones por desbloqueo anticipado. Consulta [Tokenomics](/architecture/tokenomics).
