---
slug: /architecture/ai-engine
title: Motor de IA
sidebar_label: Motor de IA
sidebar_position: 4
---

# Motor de IA

QoreChain integra capacidades de IA en múltiples niveles de la pila del protocolo a través del módulo `x/ai`. La capa on-chain proporciona análisis determinista basado en heurísticas, adecuado para operaciones críticas para el consenso, mientras que un sidecar off-chain amplía las capacidades con modelos de aprendizaje profundo para asesoramiento y herramientas para desarrolladores.

## Arquitectura de tres capas

El motor QCAI (QoreChain AI) opera a través de tres capas:

| Capa                  | Alcance                                                  | Ejecución                | Determinista |
| --------------------- | ------------------------------------------------------ | ------------------------ | ------------- |
| **Nivel de consenso**   | Producción de bloques, ajuste de parámetros                     | On-chain (x/rlconsensus) — hoy solo observación | Sí           |
| **Nivel de red**     | Enrutamiento de transacciones, detección de fraudes, optimización de comisiones | On-chain (x/ai)          | Sí           |
| **Nivel de aplicación** | Generación de contratos, auditoría, análisis profundo           | Off-chain (sidecar)      | No            |

El nivel de consenso se documenta por separado en el [Motor de consenso PRISM](/architecture/prism-consensus-engine). Esta página cubre los niveles de red y de aplicación.

:::note Qué se aplica en las redes en producción (mainnet v3.2.3, testnet v3.2.4)
Dos partes de `x/ai` actúan hoy sobre las transacciones, tanto en el carril Cosmos como en el carril EVM:

* Un **límite de frecuencia por emisor**. El límite en producción es de **600 transacciones por minuto por emisor** (`max_tx_per_minute`; el carril EVM tiene su propio límite opcional, que no está configurado, por lo que se aplica el mismo valor). El «minuto» se cuenta sobre una ventana fija de bloques, no en tiempo real, porque la altura de bloque es el único reloj que comparten todos los validadores. A un emisor que alcanza el límite se le rechazan las transacciones siguientes hasta que las más antiguas salgan de la ventana. El límite se aplica en el carril Cosmos desde v3.2.0 y en ambos carriles desde v3.2.2.
* Una **puntuación de anomalía** para cada transacción. El `anomaly_action` en producción es `flag`: una puntuación alta emite un evento `ai_anomaly_check` y cuenta la transacción como señalada, pero no la rechaza. Rechazar según la puntuación es un ajuste de gobernanza que no está habilitado.

Todo lo demás en esta página (el enrutador, la canalización de fraude de seis capas, el optimizador de comisiones, el optimizador de red, el sidecar) describe análisis y asesoramiento: nada de ello cambia qué transacciones acepta la cadena, y la canalización de seis capas no se invoca desde la ruta de las transacciones. Consulta los ajustes en producción con `qorechaind query ai config` y los contadores con `qorechaind query ai stats`.
:::

## Enrutador de transacciones

El enrutador mejorado con IA selecciona los validadores y las rutas óptimas para cada transacción mediante una puntuación ponderada multifactorial.

### Fórmula de optimización

```
OptimalRoute = argmin_r( alpha * Latency(r) + beta * Cost(r) + gamma * Security(r)^-1 )
```

| Peso     | Símbolo | Predeterminado | Descripción                                                                      |
| -------- | ------ | ------- | -------------------------------------------------------------------------------- |
| Latencia  | alpha  | 0.4     | Tiempo de respuesta normalizado (0=mejor, 1=peor). 0ms corresponde a 0.0, 1000ms corresponde a 1.0. |
| Coste     | beta   | 0.3     | Porcentaje de carga actual como aproximación del coste.                                     |
| Seguridad | gamma  | 0.3     | Inverso de la puntuación de reputación. Una mayor reputación produce una puntuación más baja (mejor).    |

El enrutador mantiene una **caché de métricas** (TTL predeterminado: 30 segundos) con datos de rendimiento por validador, que incluyen la latencia media, el porcentaje de tiempo de actividad, el porcentaje de carga y la puntuación de reputación. Cuando las métricas en caché no están disponibles, el sistema recurre al enrutador heurístico.

### Confianza del enrutamiento

La confianza escala con el número de validadores con métricas disponibles:

| Validadores con métricas | Confianza |
| ----------------------- | ---------- |
| >= 10                   | 0.95       |
| >= 5                    | 0.85       |
| >= 2                    | 0.75       |
| 1                       | 0.60       |

## Detección de fraudes

El detector de fraudes implementa una **canalización de detección de seis capas** que analiza cada transacción frente al historial reciente mediante métodos estadísticos.

### Capas de detección

| Capa | Detector                | Método                                                                | Umbral de activación                                          |
| ----- | ----------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------- |
| 1     | **Isolation Forest**    | Puntuación Z estadística sobre las características de monto, gas y frecuencia del emisor | Puntuación de anomalía > 0.7                                        |
| 2     | **Analizador de secuencias**   | Detecta patrones alternos de envío/recepción (wash trading)              | > 3 transferencias alternas entre el mismo par                |
| 3     | **Detector Sybil**      | Rastrea nuevas direcciones únicas; señala picos de nuevos emisores               | > 30% de las transacciones recientes provenientes de nuevas direcciones            |
| 4     | **Detector DDoS**       | Monitorea la frecuencia de transacciones por emisor                             | > 100 transacciones por minuto desde un único emisor         |
| 5     | **Detector de flash loan** | Identifica patrones de pedir prestado-manipular-devolver dentro de un mismo bloque     | >= 3 transacciones en el mismo bloque con una variación de monto > 10x |
| 6     | **Detector de exploits**    | Señala el consumo anormal de gas en las llamadas a contratos                       | > 5x del gas medio para el mismo tipo de transacción         |

### Clasificación de amenazas

| Rango de confianza | Nivel de amenaza |
| ---------------- | ------------ |
| >= 0.9           | Crítico     |
| >= 0.7           | Alto         |
| >= 0.5           | Medio       |
| >= 0.3           | Bajo          |
| &lt; 0.3         | Ninguno         |

### Acciones de respuesta

| Nivel de amenaza | Confianza | Acción                                                       |
| ------------ | ---------- | ------------------------------------------------------------ |
| Crítico     | > 0.8      | `circuit_break` — Pausa la ejecución de contratos específicos         |
| Crítico     | &lt;= 0.8  | `rate_limit` — Reduce temporalmente la aceptación de TX desde el origen  |
| Alto         | > 0.7      | `rate_limit`                                                 |
| Alto         | &lt;= 0.7  | `alert` — Emite un evento para validadores y operadores            |
| Medio       | Cualquiera        | `alert`                                                      |
| Bajo / Ninguno   | Cualquiera        | `allow`                                                      |

Cuando se activa una acción distinta de `allow`, la canalización crea un registro de investigación de fraude con un ID único (formato: `INV-{block_height}-{txhash}`, truncado a 48 caracteres). En las redes en producción la canalización no se invoca desde la ruta de las transacciones (consulta la nota al principio de esta página), por lo que hoy no se genera ningún registro de investigación ni la canalización activa ningún interruptor de circuito de contratos.

## Optimizador de comisiones

El optimizador de comisiones predice la congestión de la red y sugiere comisiones óptimas para los tiempos de confirmación deseados mediante el seguimiento de la congestión con media móvil exponencial (EMA).

### Predicción de congestión

* **Factor de suavizado EMA (alpha)**: 0.2
* **Ventana de historial**: 100 bloques
* **Análisis de tendencias**: Compara los 5 bloques más recientes con los 5 bloques anteriores para detectar tendencias de congestión y luego proyecta hacia adelante con una atenuación del 50%.

### Niveles de urgencia

| Urgencia  | Multiplicador base | Confirmación estimada |
| -------- | --------------- | ---------------------- |
| `fast`   | 2.0x            | 1-2 bloques             |
| `normal` | 1.0x            | 3-5 bloques             |
| `slow`   | 0.5x            | 6-10 bloques             |

La comisión final incorpora un **multiplicador de congestión** (1.0x con 0% de congestión, hasta 5.0x con 100% de congestión) y una **prima de tendencia** cuando la congestión prevista supera la congestión actual. La comisión mínima del propio estimador es una constante heredada de 500 uqor; no se expone en las redes en producción, y la comisión que una transacción debe pagar realmente la fija el mínimo de la red de 0.1 uqor por unidad de gas (consulta [Primera transacción](/getting-started/first-transaction#send-qor)).

## Optimizador de red

El optimizador de red monitorea continuamente las métricas de rendimiento y genera recomendaciones de parámetros de gobernanza mediante una función de recompensa multiobjetivo.

### Función de recompensa

```
R(s, a, s') = alpha * DeltaPerformance + beta * DeltaLatency + gamma * DeltaEnergy - delta * StabilityPenalty
```

| Peso | Valor | Objetivo               |
| ------ | ----- | ----------------------- |
| alpha  | 0.35  | Mejora del rendimiento |
| beta   | 0.30  | Reducción de la latencia       |
| gamma  | 0.15  | Ahorro de energía/recursos |
| delta  | 0.20  | Preservación de la estabilidad  |

### Tipos de recomendaciones

El optimizador genera recomendaciones para:

* **Límite de gas por bloque**: Aumenta cuando la utilización es > 80%, disminuye cuando es &lt; 20%
* **Tasa de comisión mínima**: Reduce cuando el número de validadores es inferior a 5
* **Número máximo de validadores**: Aumenta cuando los tiempos de bloque son saludables y hay >= 10 validadores activos
* **Objetivo de tiempo de bloque**: Alerta cuando el tiempo medio de bloque supera los 8 segundos

Cada recomendación incluye el valor actual, el valor sugerido, el impacto esperado, la puntuación de confianza y el razonamiento.

## Sidecar de IA

El sidecar de QCAI amplía la IA on-chain con modelos de aprendizaje profundo off-chain respaldados por el backend de QCAI. El sidecar es opcional y no crítico para el consenso, y se accede a él a través de una interfaz gRPC interna.

### Capacidades

| Capacidad              | Descripción                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------- |
| **Generación de contratos** | Genera contratos inteligentes a partir de especificaciones en lenguaje natural en 17 plataformas  |
| **Auditoría de contratos**   | Análisis de seguridad profundo del código de contratos inteligentes                                       |
| **Análisis profundo de fraudes** | Investigación de fraudes ampliada mediante modelos entrenados (complementa las heurísticas on-chain) |
| **Asesoramiento de red**      | Recomendaciones avanzadas de optimización de parámetros                                     |

### Modelos

| Nombre del modelo    | Caso de uso                                             |
| ------------- | ---------------------------------------------------- |
| QCAI Fast     | Respuestas de baja latencia para la estimación de comisiones y el enrutamiento |
| QCAI Balanced | Análisis más profundo para auditoría e investigación de fraudes |

El sidecar se ejecuta como un servicio off-chain independiente para que las cargas de trabajo de aprendizaje profundo nunca bloqueen ni influyan en la ejecución crítica para el consenso.

## Precompilados de EVM

Dos contratos precompilados exponen las capacidades de IA on-chain a los contratos inteligentes de EVM:

| Precompilado       | Dirección  | Descripción                                                           |
| ---------------- | -------- | --------------------------------------------------------------------- |
| `aiRiskScore`    | `0x0B01` | Devuelve una puntuación de riesgo (0-100) para una dirección o hash de transacción dados  |
| `aiAnomalyCheck` | `0x0B02` | Devuelve un indicador booleano de anomalía y una puntuación de confianza para una transacción |

:::warning Aún no están activos
Estos precompilados **no están activos** en la mainnet (`qorechain-vladi`) ni en la testnet (`qorechain-diana`); una llamada devuelve datos vacíos. Solo se activarán cuando dispongan de una ruta de puntuación de solo lectura en coma fija. Consulta [Precompilados de EVM: estado de la red](/developer-guide/evm-precompiles#network-status).
:::

**Importante**: Los precompilados de EVM utilizan **únicamente el motor heurístico determinista**. Nunca llaman al sidecar, lo que garantiza que toda la ejecución de EVM siga siendo totalmente determinista y reproducible. Desde v3.2.3 el precompilado de comprobación de anomalías analiza una transacción sin escribir estado; el resto del refuerzo de los precompilados en esa versión (el puente CrossVM rechaza `STATICCALL`, mide su llamada anidada contra el gas del marco que llama y solo alcanza destinos CosmWasm de una lista permitida) se aplica cuando se active el precompilado CrossVM. A fecha de 20 de octubre de 2026, la lista `active_static_precompiles` está vacía en ambas redes.

## Atestación TEE

El módulo de IA define interfaces para la atestación de **entornos de ejecución de confianza** (Trusted Execution Environment), lo que permitirá en el futuro una ejecución verificable de modelos de IA dentro de enclaves de hardware seguros.

### Plataformas compatibles

| Plataforma    | Identificador | Descripción                                            |
| ----------- | ---------- | ------------------------------------------------------ |
| Intel SGX   | `sgx`      | Software Guard Extensions                              |
| Intel TDX   | `tdx`      | Trust Domain Extensions                                |
| AMD SEV-SNP | `sev-snp`  | Secure Encrypted Virtualization - Secure Nested Paging |
| ARM CCA     | `arm-cca`  | Confidential Compute Architecture                      |

### Flujo de atestación

1. **Cargar los pesos del modelo** — El sidecar carga los pesos del modelo de IA en un enclave TEE.
2. **Ejecutar la inferencia dentro del enclave** — La inferencia se ejecuta dentro de la memoria protegida del enclave.
3. **Producir el informe de atestación** — El enclave produce un informe de atestación que vincula el hash del modelo, el hash de entrada y el hash de salida.
4. **Verificar la atestación on-chain** — Los validadores verifican la atestación on-chain antes de aceptar los resultados de la inferencia.

La atestación TEE se encuentra actualmente en la fase de especificación de interfaces. Su implementación está prevista para una versión futura.

## Aprendizaje federado

El módulo de IA define interfaces para la coordinación de **aprendizaje federado on-chain**, donde los nodos validadores entrenan modelos locales y envían actualizaciones de gradientes que se agregan en un modelo global sin compartir los datos de entrenamiento sin procesar.

### Métodos de agregación

| Método     | Descripción                                                             |
| ---------- | ----------------------------------------------------------------------- |
| `fedavg`   | Federated Averaging — promedio ponderado de gradientes por número de muestras     |
| `fedprox`  | Federated Proximal — añade un término proximal para manejar datos heterogéneos  |
| `scaffold` | SCAFFOLD — utiliza variables de control para corregir la deriva de los clientes            |

### Ciclo de vida de una ronda

```
Pending --> Training --> Aggregating --> Complete
                                    \-> Failed (timeout or insufficient participants)
```

Cada ronda se configura con un número mínimo/máximo de participantes, tiempo de espera, tasa de aprendizaje, norma de recorte de gradiente y un multiplicador opcional de ruido para privacidad diferencial. Todos los envíos de gradientes se firman con firmas PQC (Dilithium-5).

El aprendizaje federado se encuentra actualmente en la fase de especificación de interfaces. Su implementación está prevista para una versión futura.

## Consultas

`qorechaind query ai config` y `qorechaind query ai stats` (gRPC) son las consultas del módulo. Hoy el módulo no tiene rutas REST: las rutas `/ai/v1/...` de estimación de comisiones, investigaciones de fraude, recomendaciones de red e interruptores de circuito no se sirven ni en la mainnet ni en la testnet.

## Relacionado

* [Motor de consenso PRISM](/architecture/prism-consensus-engine) — la capa de IA diseñada para la optimización del consenso (hoy solo observación).
* [Creador de contratos inteligentes](/dashboard/smart-contract-creator) — generación de contratos asistida por IA en el Dashboard.
* [Auditor de contratos](/dashboard/contract-auditor) — revisión de seguridad de contratos asistida por IA.
