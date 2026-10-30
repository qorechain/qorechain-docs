---
slug: /architecture/consensus-mechanism
title: Mecanismo de Consenso
sidebar_label: Mecanismo de Consenso
sidebar_position: 1
---

# Mecanismo de Consenso

QoreChain implementa **Triple-Pool Composite Proof-of-Stake (CPoS)**, un mecanismo de consenso que clasifica a los validadores en tres pools especializados y utiliza una selección ponderada por reputación para equilibrar seguridad, descentralización y rendimiento. CPoS está implementado en el módulo `x/qca` y opera sobre el **QoreChain Consensus Engine**.

:::note Estado actual (mainnet comprobada el 23 de octubre de 2026 con v3.2.4, y con v3.2.5 desde el 29 de octubre de 2026; la testnet ejecuta v3.2.6)
La lógica de Triple-Pool CPoS descrita en esta página — clasificación de pools, selección de proponente ponderada por pool, curva de vinculación de recompensas, slashing progresivo y conteo QDRW — está implementada en el módulo `x/qca` y sus parámetros están on-chain, pero **todavía no está conectada a la producción de bloques, las recompensas, el slashing ni el conteo de gobernanza**. Hoy la rotación de proponentes es la rotación estándar de validadores ponderada por stake, el slashing sigue los parámetros estándar de `x/slashing` (ventana de downtime de 10,000 bloques, jail por debajo del 5 % de bloques firmados, slash del 1 % por downtime y del 5 % por double-sign, jail de 10 minutos) y las propuestas se cuentan sobre el stake vinculado (quórum 33.4 %, umbral 50 %, veto 33.4 %). El diseño que sigue describe hacia dónde evoluciona el módulo. Ninguna versión hasta v3.2.4 en la mainnet cambia esto, y los parámetros de staking, slashing y gobernanza de la testnet coinciden con los de la mainnet (comprobado el 27 de octubre de 2026, salvo por periodos de votación de gobernanza más cortos); las reglas que **sí** se aplican hoy figuran en [Reglas de admisión de validadores y de staking en vigor](#admission).
:::

La capa de optimización por aprendizaje por refuerzo diseñada para ajustar los parámetros de consenso en tiempo de ejecución se denomina **PRISM** (Policy-driven Reinforcement-learning for Intelligent State Machines). Consulta el [Motor de Consenso PRISM](/architecture/prism-consensus-engine) para más detalles.

El diagrama siguiente resume un ciclo de bloque/consenso de Triple-Pool CPoS sobre el QoreChain Consensus Engine, y muestra dónde está diseñado PRISM para retroalimentar los parámetros ajustables de `x/qca` (actualmente PRISM solo observa).

```mermaid
flowchart TD
    A["Validator set<br/>(x/qca)"] --> B["Pool classification<br/>RPoS / DPoS / PoS<br/>every 1,000 blocks"]
    B --> C["Stage 1: Pool selection<br/>weights 0.40 / 0.35 / 0.25"]
    C --> D["Stage 2: Within-pool<br/>reputation x stake CDF"]
    D --> E["Block proposed &amp; finalized<br/>on QoreChain Consensus Engine"]
    E --> F["Rewards (bonding curve)<br/>&amp; progressive slashing"]
    F --> A
    P["PRISM<br/>RL optimization"] -. tunes params .-> B
    P -. tunes params .-> C
```

---

## Reglas de admisión de validadores y de staking en vigor {#admission}

Estas reglas se aplican en mainnet (desde v3.2.2, con un endurecimiento adicional en v3.2.3) y en la testnet. Forman parte del servidor de mensajes de staking, por lo que se aplican a todo mensaje sea cual sea la forma en que llegue a la cadena: una transacción, `x/authz`, `x/group`, un contrato QoreChain Native, un precompile o una propuesta de gobernanza. Las transacciones de génesis están exentas.

| Regla | Qué aplica la cadena |
| --- | --- |
| Crear un validador | El self-bond es de al menos **100,000 QOR** (100,000,000,000 uqor) **y** la cuenta del operador tiene una licencia `validator_operator` activa. Consulta [Licencias de la cadena](/architecture/chain-licensing) |
| Mínimo operativo | El propio operador de un validador no puede deshacer su delegación ni redelegar de un modo que deje su self-bond **por debajo de 100,000 QOR**. Se permite una salida completa (self-bond a cero); el validador queda entonces en jail |
| Unjail | `MsgUnjail` se rechaza mientras el self-bond del operador esté por debajo del mínimo, de modo que un validador que salió o fue penalizado por debajo de él debe reponerlo primero. Una cuenta de operador sin clave poscuántica registrada sigue pudiendo hacer unjail (consulta [Seguridad poscuántica](/architecture/post-quantum-security#hybrid-signatures)) |
| Autorizaciones de stake (v3.2.3) | Las listas de permitidos y denegados de una autorización de stake de `x/authz` comparan las direcciones de validador por sus bytes decodificados, de modo que la forma de escribir una dirección (por ejemplo, todo en mayúsculas) no puede eludir una lista de denegados |
| Slashing por redelegación (v3.2.0) | El slash total aplicado a una entrada de redelegación está limitado a la fracción de slash multiplicada por el saldo inicial de la entrada |

Parámetros de staking leídos en ambas redes el 27 de octubre de 2026: `max_validators` 100, tiempo de unbonding de 21 días (1,814,400 s), `max_entries` 7, `min_commission_rate` 0. La autoridad de licencias, la cuenta que concede las licencias `validator_operator`, puede ser reemplazada por la gobernanza desde v3.2.3 (`MsgUpdateAuthority`).

---

## Arquitectura Triple-Pool

CPoS divide el conjunto activo de validadores en tres pools según métricas de reputación, stake y delegación. Cada pool desempeña un rol diferenciado en el proceso de consenso.

### Clasificación de Pools

| Pool                                 | Criterios                                                                | Peso de Selección |
| ------------------------------------ | ----------------------------------------------------------------------- | ---------------- |
| **RPoS** (Reputation Proof-of-Stake) | Puntuación de reputación >= percentil 70 **Y** stake auto-vinculado >= mediana | 40%              |
| **DPoS** (Delegated Proof-of-Stake)  | Delegación total >= 10,000 QOR                                          | 35%              |
| **PoS** (Standard Proof-of-Stake)    | Todos los validadores activos restantes                                 | 25%              |

La clasificación se evalúa con la siguiente prioridad: **RPoS > DPoS > PoS**. Un validador que cumple los requisitos tanto de RPoS como de DPoS se asigna a RPoS.

La reclasificación ocurre cada **1,000 bloques**. En cada época de reclasificación:

1. **Recopilar puntuaciones de reputación** — Las puntuaciones de reputación se recopilan del módulo `x/reputation` para todos los validadores activos.
2. **Calcular el umbral de reputación** — El umbral de reputación del percentil 70 se calcula a partir de la distribución ordenada de puntuaciones.
3. **Calcular la mediana del stake auto-vinculado** — La mediana del stake auto-vinculado se calcula a partir de la distribución ordenada de stake.
4. **Reasignar validadores** — Cada validador activo se reasigna al pool de mayor prioridad para el que cumple los requisitos.
5. **Asignación por defecto** — Los validadores sin clasificar (aquellos aún no evaluados) se asignan por defecto al pool PoS.

---

## Selección de Proponente Ponderada por Pool

La selección del proponente de bloque sigue un proceso determinista de dos etapas.

### Etapa 1: Selección de Pool

Un valor aleatorio determinista selecciona qué pool propone el siguiente bloque:

```
seed = SHA256(lastBlockHash || height || "pool")
randVal = uint64(seed[:8]) / MaxUint64    // uniform in [0, 1)
```

El pool se elige comparando `randVal` con los umbrales de peso acumulado:

* `randVal < 0.40` → pool RPoS
* `0.40 <= randVal < 0.75` → pool DPoS
* `randVal >= 0.75` → pool PoS

### Etapa 2: Selección Dentro del Pool

Dentro del pool seleccionado, el proponente se elige mediante una **CDF ponderada por reputación × stake**. Para cada validador del pool:

1. La puntuación de reputación `r` se obtiene de `x/reputation`.
2. El peso compuesto es `w = r * tokens`.
3. Se construye una función de distribución acumulada (CDF) a partir de todos los pesos compuestos.
4. El proponente se selecciona mediante un sorteo aleatorio determinista contra la CDF, sembrado por el hash y la altura del bloque.

### Comportamiento de Respaldo

Si el pool seleccionado está vacío, el sistema recurre al pool PoS. Si el pool PoS también está vacío, la selección recurre a la selección ponderada por reputación sobre todo el conjunto activo de validadores.

---

## Curva de Vinculación Personalizada

Las recompensas de los validadores se calculan mediante una curva de vinculación multifactorial que incentiva la participación a largo plazo, la alta reputación y la alineación con las fases de crecimiento del protocolo.

### Fórmula

```
R(v, t) = beta * S_v * (1 + alpha * ln(1 + L_v)) * Q(r_v) * P(t)
```

### Definiciones de Factores

| Factor                 | Símbolo  | Descripción                                                 | Por Defecto |
| ---------------------- | -------- | ----------------------------------------------------------- | --------- |
| Multiplicador de Recompensa Base | `beta`   | Escala la magnitud global de la recompensa                  | 1.0       |
| Stake Auto-vinculado      | `S_v`    | Los tokens auto-vinculados del validador (uqor)             | --        |
| Sensibilidad de Lealtad    | `alpha`  | Controla cuánto amplifica la duración de lealtad las recompensas | 0.1       |
| Duración de Lealtad       | `L_v`    | Número de bloques consecutivos en que el validador ha estado activo | --        |
| Calidad de Reputación     | `Q(r_v)` | Mapea la reputación `r` a un multiplicador de recompensa en \[0.75, 1.25] | --        |
| Fase del Protocolo        | `P(t)`   | Multiplicador dependiente de la fase para impulsar o moderar recompensas | Ver abajo |

### Función de Calidad de Reputación

```
Q(r) = 1 + 0.5 * (r - 0.5)
```

El resultado se restringe al rango **\[0.75, 1.25]**:

| Puntuación de Reputación | Q(r)  |
| ---------------- | ----- |
| 0.0              | 0.75  |
| 0.25             | 0.875 |
| 0.5              | 1.0   |
| 0.75             | 1.125 |
| 1.0              | 1.25  |

### Multiplicadores de Fase del Protocolo

| Fase    | P(t) | Descripción                                   |
| ------- | ---- | --------------------------------------------- |
| Genesis | 1.5  | Recompensas más altas para impulsar el conjunto de validadores |
| Growth  | 1.0  | Recompensas estándar durante la expansión de la red |
| Mature  | 0.8  | Emisión reducida a medida que la red se estabiliza |

### Matemática Determinista

El cálculo de `ln(1 + L_v)` utiliza una aproximación por serie de Taylor con reducción de argumento (`TaylorLn1PlusX`), operando enteramente sobre decimales de precisión fija `LegacyDec`. No se utiliza aritmética de punto flotante en los cálculos de recompensa críticos para el consenso.

---

## Slashing Progresivo

QoreChain reemplaza las tasas de slashing fijas por un **modelo de penalización progresiva** que escala las consecuencias para los reincidentes a la vez que permite que las infracciones decaigan con el tiempo.

### Fórmula

```
penalty = base_rate * escalation_factor^effective_count * severity_factor
```

### Decaimiento Temporal

Las infracciones pasadas contribuyen un peso decreciente al recuento efectivo:

```
effective_count = SUM( 0.5^(blocks_since_i / decay_halflife) )
```

Para cada infracción pasada `i`, la contribución se reduce a la mitad cada `decay_halflife` bloques (por defecto: 100,000). Esto significa que una sola infracción antigua de hace 200,000 bloques contribuye solo 0.25 al recuento efectivo.

### Factores de Severidad

| Tipo de Infracción  | Factor de Severidad |
| ------------------- | --------------- |
| Downtime            | 1.0             |
| Double Sign         | 2.0             |
| Light Client Attack | 3.0             |

### Penalización Máxima

La penalización está limitada al **33%** por evento de slash, independientemente de cuántas infracciones pasadas haya acumulado un validador.

### Ejemplo de Cálculo

Un validador con 2 infracciones previas (una de hace 50,000 bloques, otra de hace 150,000 bloques) comete un double-sign:

1. **Contribuciones de decaimiento**:
   * Infracción 1: `0.5^(50000 / 100000) = 0.5^0.5 = 0.707`
   * Infracción 2: `0.5^(150000 / 100000) = 0.5^1.5 = 0.354`
   * `effective_count = 0.707 + 0.354 = 1.061`
2. **Escalado**: `1.5^1.061 = 1.516`
3. **Penalización**: `0.01 * 1.516 * 2.0 = 0.0303` (3.03%)

Compáralo con un infractor primerizo: `0.01 * 1.5^0 * 2.0 = 0.02` (2.0%).

---

## Gobernanza QDRW

La gobernanza de QoreChain utiliza **Quadratic Delegation with Reputation Weighting (QDRW)** para prevenir la captura plutocrática a la vez que recompensa a los participantes de la red a largo plazo.

### Fórmula de Poder de Voto

```
VP(v) = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)
```

Donde:

* `staked` = los tokens QOR vinculados del votante
* `xQORE` = el saldo de xQORE del votante (derivado de staking a largo plazo)
* `2` = el multiplicador de peso de xQORE (configurable por gobernanza)
* `r` = la puntuación de reputación del votante de `x/reputation`

### Multiplicador de Reputación

El multiplicador de reputación mapea `r` en \[0, 1] a un multiplicador en \[0.5, 2.0] mediante una curva sigmoide:

```
ReputationMultiplier(r) = 0.5 + 1.5 * sigmoid(6 * (r - 0.5))
```

| Puntuación de Reputación | Multiplicador |
| ---------------- | ---------- |
| 0.0              | 0.50       |
| 0.1              | 0.52       |
| 0.2              | 0.58       |
| 0.3              | 0.71       |
| 0.4              | 0.93       |
| 0.5              | 1.25       |
| 0.6              | 1.57       |
| 0.7              | 1.79       |
| 0.8              | 1.92       |
| 0.9              | 1.98       |
| 1.0              | 2.00       |

### Escalado Cuadrático

La función raíz cuadrada garantiza que el poder de voto escale de forma sublineal con el stake. Un votante con 4x el stake de otro votante recibe solo 2x el poder de voto, no 4x. Este es el comportamiento diseñado de QDRW; mientras esté deshabilitado, las propuestas se cuentan sobre el stake vinculado. La fórmula usa xQORE, que todavía no se puede bloquear en las redes activas.

### Matemática Determinista

`IntegerSqrt` utiliza el método de Newton con precisión `LegacyDec`. `SigmoidApprox` utiliza una `ExpApprox` por serie de Taylor con 12 términos. Toda la matemática de gobernanza es completamente determinista en todos los nodos validadores.

---

## Parámetros de QCA

Las siguientes tablas enumeran los parámetros configurables por gobernanza del módulo `x/qca`, con los nombres que devuelve `qorechaind query qca config` y los valores activos (estos parámetros aún no están activos; consulta la nota de estado anterior):

### Parámetros Centrales

| Parámetro                  | Tipo    | Por Defecto | Descripción                                       |
| -------------------------- | ------- | ------- | ------------------------------------------------- |
| `use_reputation_weighting` | bool    | `true`  | Ajuste de genesis para la selección de proponente ponderada por reputación (el selector aún no está conectado a la producción de bloques) |
| `min_reputation_score`     | float64 | `0.1`   | Puntuación mínima de reputación para participación activa |

### Configuración de Pools

| Parámetro                 | Tipo      | Por Defecto      | Descripción                                      |
| ------------------------- | --------- | ---------------- | ------------------------------------------------ |
| `pool_classification_interval` | uint64 | `1000`        | Bloques entre reclasificaciones de pool          |
| `pool_weight_rpos`        | LegacyDec | `0.40`           | Peso de selección del pool RPoS                  |
| `pool_weight_dpos`        | LegacyDec | `0.35`           | Peso de selección del pool DPoS                  |
| `pool_min_delegation_dpos`| uint64    | `10,000,000,000` | Delegación mínima para DPoS (10,000 QOR en uqor) |
| `pool_rep_percentile_rpos`| uint64    | `70`             | Umbral de percentil de reputación para RPoS      |

### Configuración de la Curva de Vinculación

| Parámetro          | Tipo      | Por Defecto | Descripción                                      |
| ------------------ | --------- | ------- | ------------------------------------------------ |
| `bonding_alpha`    | LegacyDec | `0.1`   | Coeficiente de sensibilidad de lealtad           |
| `bonding_beta`     | LegacyDec | `1.0`   | Multiplicador de recompensa base                 |
| `bonding_phase_multiplier` | LegacyDec | `1.5` | Multiplicador de recompensa por fase del protocolo (fase Genesis) |

### Configuración de Slashing

| Parámetro           | Tipo      | Por Defecto   | Descripción                            |
| ------------------- | --------- | --------- | -------------------------------------- |
| `slashing_base_rate`| LegacyDec | `0.01`    | Tasa de slash base (1%)                |
| `slashing_escalation_factor` | LegacyDec | `1.5` | Base de escalado progresivo            |
| `slashing_max_penalty` | LegacyDec | `0.33` | Penalización máxima por evento (33%)   |
| `slashing_decay_halflife` | uint64 | `100,000` | Bloques para la vida media del peso de infracción |

### Configuración de Gobernanza QDRW

| Parámetro            | Tipo      | Por Defecto | Descripción                            |
| -------------------- | --------- | ------- | -------------------------------------- |
| `qdrw_enabled`       | bool      | `false` | Habilita el conteo de gobernanza QDRW (deshabilitado en las redes activas) |
| `qdrw_xqore_multiplier` | LegacyDec | `2.0` | Peso de xQORE relativo a los tokens en stake |
| `qdrw_rep_min_multiplier` | LegacyDec | `0.5` | Multiplicador de reputación mínimo     |
| `qdrw_rep_max_multiplier` | LegacyDec | `2.0` | Multiplicador de reputación máximo     |

## Relacionado

* [Motor de Consenso PRISM](/architecture/prism-consensus-engine) — capa de IA diseñada para ajustar los parámetros de consenso.
* [Arquitectura Multicapa](/architecture/multilayer-architecture) — cómo las sidechains se anclan a la capa base.
* [Ejecutar un Validador](/developer-guide/running-a-validator) — opera un validador que asegura la cadena.
* [Tokenómica](/architecture/tokenomics) — recompensas de staking, inflación y economía del slashing.
