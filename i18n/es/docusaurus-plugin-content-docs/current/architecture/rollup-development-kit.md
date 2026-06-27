---
slug: /architecture/rollup-development-kit
title: Rollup Development Kit
sidebar_label: Rollup Development Kit
sidebar_position: 12
---

# Rollup Development Kit

El módulo `x/rdk` proporciona un Rollup Development Kit (RDK) completo que permite a los desarrolladores desplegar rollups específicos de aplicación en QoreChain. Admite cuatro paradigmas de liquidación, múltiples modos de secuenciador, backends de disponibilidad de datos conectables y optimización de configuración asistida por IA.

---

## Paradigmas de liquidación

El RDK de QoreChain admite cuatro modos de liquidación distintos — **optimistic**, **zk**, **based** y **sovereign** — cada uno con diferentes supuestos de confianza, características de finalidad y requisitos de prueba.

### Liquidación optimista

Los rollups optimistas asumen que las transacciones son válidas por defecto y dependen de pruebas de fraude para la resolución de disputas.

* **Sistema de pruebas**: pruebas de fraude interactivas
* **Ventana de impugnación**: 7 días (604.800 segundos), configurable por rollup
* **Fianza de impugnación**: 1.000 QOR (1.000.000.000 uqor) — requerida para presentar una impugnación con prueba de fraude
* **Finalidad**: retrasada hasta que expire la ventana de impugnación sin una impugnación válida
* **Auto-finalización**: el `EndBlocker` finaliza automáticamente los lotes una vez que la ventana de impugnación ha pasado sin disputa

**Ciclo de vida del lote**:

```
Submitted → [challenge window expires] → Finalized
Submitted → [fraud proof submitted] → Challenged → Rejected
```

### Liquidación ZK (Zero-Knowledge) {#zk-zero-knowledge-settlement}

Los rollups ZK proporcionan pruebas criptográficas de validez que garantizan la corrección de las transiciones de estado.

* **Sistema de pruebas**: SNARK (Groth16, PLONK) o STARK (transparente, sin configuración de confianza)
* **Finalidad**: instantánea al verificar la prueba — no se requiere ventana de impugnación
* **Tamaño máximo de prueba**: 1 MB (1.048.576 bytes)
* **Profundidad de recursión**: profundidad de agregación de pruebas configurable (por defecto: 1)
* **Madurez**: en la versión actual, la liquidación ZK utiliza una verificación stub que acepta cualquier prueba no vacía. La verificación completa de pruebas SNARK/STARK es una mejora planificada y debe tratarse como aún no endurecida para producción.

**Ciclo de vida del lote**:

```
Submitted + valid proof → Finalized (instant)
```

### Liquidación based

Los rollups based delegan la secuenciación de transacciones a los proponentes de L1 (QoreChain), heredando las garantías de disponibilidad y resistencia a la censura de la cadena anfitriona.

* **Sistema de pruebas**: ninguno requerido — los proponentes de L1 son la fuente de verdad
* **Secuenciador**: debe usar el modo de secuenciador `based` (impuesto por validación)
* **Finalidad**: confirmación de 2 bloques en QoreChain
* **Retraso de inclusión**: bloques configurables antes de la inclusión forzada de transacciones del rollup
* **Reparto de tarifas de prioridad**: porcentaje configurable de las tarifas de prioridad pagadas a los proponentes de L1

**Ciclo de vida del lote**:

```
Submitted → [2 L1 blocks] → Finalized (auto)
```

### Liquidación sovereign

Los rollups sovereign operan con consenso independiente y secuencian sus propias transacciones. Anclan el estado a QoreChain para verificabilidad, pero no dependen de la cadena anfitriona para la finalidad.

* **Sistema de pruebas**: ninguno
* **Finalidad**: independiente — determinada por el propio consenso del rollup
* **Anclaje de estado**: las raíces de estado se publican en QoreChain para transparencia y verificabilidad, pero no se imponen
* **Auto-finalización**: ninguna — los rollups sovereign gestionan su propia finalidad

---

## Compatibilidad de sistemas de pruebas

| Modo de liquidación | Pruebas de fraude |     SNARK |     STARK |    Ninguno |
| ------------------- | ----------------: | --------: | --------: | ---------: |
| **Optimistic**      |          Requerido |        -- |        -- |        -- |
| **ZK**              |                -- | Compatible | Compatible |        -- |
| **Based**           |                -- |        -- |        -- |  Requerido |
| **Sovereign**       |                -- |        -- |        -- |  Requerido |

STARK y la verificación completa de pruebas ZK aún están madurando; consulte la nota de madurez de [Liquidación ZK](#zk-zero-knowledge-settlement) más arriba.

---

## Perfiles preconfigurados

El RDK incluye **cinco perfiles preconfigurados** que proporcionan configuraciones de rollup llave en mano optimizadas para casos de uso comunes. Cada preset agrupa un paradigma de liquidación, un modo de secuenciador, un backend de disponibilidad de datos, un modelo de gas y una VM ajustada a su dominio objetivo:

| Perfil           | Liquidación (prueba)     | Secuenciador | DA              | Modelo de gas | VM      | Caso de uso objetivo |
| ---------------- | ------------------------ | --------- | --------------- | ------------ | ------- | --------------- |
| **`defi`**       | zk (SNARK)               | dedicated | native          | EIP-1559     | EVM     | Aplicaciones de trading, préstamos y estilo AMM |
| **`gaming`**     | based                    | based     | native          | flat         | custom  | Estado de juego y economías dentro del juego de alto rendimiento y baja latencia |
| **`nft`**        | optimistic (fraud)       | dedicated | native (Celestia DA planificado) | standard | CosmWasm | Acuñación de NFT, mercados y coleccionables digitales |
| **`enterprise`** | based                    | based     | native          | subsidized   | EVM     | Despliegues permisionados y de consorcio con tarifas patrocinadas |
| **`custom`**     | totalmente parametrizado | totalmente parametrizado | totalmente parametrizado | totalmente parametrizado | totalmente parametrizado | Cada campo es definido por el usuario |

El perfil `custom` deja cada campo para que usted lo configure. Los valores exactos agrupados en cada preset pueden evolucionar a medida que el RDK madura; consulte la configuración en vivo con `qorechaind query rdk config` (o `RdkClient.params()` de `@qorechain/rdk`) para los parámetros autoritativos por preset, y tenga en cuenta que la liquidación `based` siempre se empareja con el modo de secuenciador `based`.

---

## Modos de secuenciador

El secuenciador determina quién ordena las transacciones dentro de un bloque del rollup.

### Secuenciador dedicado

Un único operador secuencia todas las transacciones del rollup.

* **Operador**: una única dirección designada
* **Latencia**: la más baja posible — ordenación de una sola parte
* **Confianza**: requiere confianza en el operador del secuenciador para la disponibilidad y la ordenación justa

### Secuenciador compartido

Un conjunto de secuenciadores ordenan colectivamente las transacciones.

* **Tamaño mínimo del conjunto**: configurable (por defecto: 1)
* **Latencia**: ligeramente mayor debido a la coordinación entre múltiples partes
* **Confianza**: distribuida entre el conjunto de secuenciadores

### Secuenciador based

Los proponentes de L1 de QoreChain secuencian las transacciones del rollup.

* **Retraso de inclusión**: bloques configurables antes de la inclusión forzada (por defecto: 10)
* **Reparto de tarifas de prioridad**: porcentaje configurable de las tarifas de prioridad pagadas a los proponentes de L1
* **Confianza**: hereda la seguridad del conjunto de validadores de QoreChain y la resistencia a la censura
* **Requisito**: el modo de liquidación based requiere el secuenciador based (impuesto en la validación)

---

## Backends de disponibilidad de datos

### Native DA

Almacenamiento de blobs en el KV-store on-chain dentro de la propia QoreChain.

| Parámetro            | Valor                                                                                               |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| **Tamaño máximo de blob** | 2 MB (2.097.152 bytes)                                                                          |
| **Período de retención** | 432.000 bloques (\~30 días con bloques de 6 segundos)                                            |
| **Auto-poda**        | Los blobs expirados se podan en el `EndBlocker` — los datos se eliminan pero se conservan los metadatos del compromiso |
| **Compromiso**       | Hash SHA-256 de los datos del blob                                                                  |

### Celestia DA

Disponibilidad de datos basada en IBC usando la capa de DA dedicada de Celestia.

* **Estado**: stub en la versión actual — devuelve un error si se selecciona como único backend
* **Soporte de namespaces**: los namespaces específicos del rollup están soportados en el esquema de blobs
* **Planificado**: integración IBC completa con el envío y la verificación de blobs de Celestia

### Ambos (redundante)

Almacena blobs en los backends Native y Celestia simultáneamente.

* En la versión actual, solo se almacena realmente el blob native; se registra una advertencia para el componente Celestia.

---

## Ciclo de vida del rollup

```
Pending → Active → Paused → Active → Stopped
                      ↑                  |
                      └──────────────────┘
                      (can resume from paused,
                       stopped is permanent)
```

| Estado      | Descripción                                                  |
| ----------- | ------------------------------------------------------------ |
| **Pending** | Rollup registrado pero aún no activado                       |
| **Active**  | El rollup está en vivo y procesando lotes                    |
| **Paused**  | Detenido temporalmente por el creador (puede reanudarse)     |
| **Stopped** | Desmantelado permanentemente — la fianza de stake se devuelve al creador |

En la creación, el estado del rollup se establece en `Active` inmediatamente después de que el escrow de stake y el registro de la capa tengan éxito.

---

## Ciclo de vida del lote

Los lotes de liquidación rastrean la progresión de estado de las raíces de estado del rollup:

```
Submitted → Finalized                              (happy path)
Submitted → Challenged → Rejected                  (fraud detected)
```

| Estado         | Descripción                                       |
| -------------- | ------------------------------------------------- |
| **Submitted**  | Lote publicado en QoreChain, en espera de finalización |
| **Challenged** | Impugnación con prueba de fraude presentada (solo optimistic) |
| **Finalized**  | Lote aceptado como canónico                        |
| **Rejected**   | Lote invalidado por una impugnación exitosa        |

### Reglas de auto-finalización

| Modo de liquidación | Disparador de finalización                                   |
| --------------- | ----------------------------------------------------------- |
| **Optimistic**  | La ventana de impugnación expira (\~7 días) sin impugnación válida |
| **ZK**          | Instantánea al enviar una prueba válida                      |
| **Based**       | 2 bloques de L1 después del envío                            |
| **Sovereign**   | Ninguna — gestionada por el propio consenso del rollup       |

La auto-finalización se ejecuta en el `EndBlocker` para los rollups optimistic y based. Los lotes ZK se finalizan en línea durante el envío del lote.

---

## Parámetros del módulo

| Parámetro                   |                       Por defecto | Descripción                                      |
| --------------------------- | -------------------------------: | ------------------------------------------------ |
| `max_rollups`               |                              100 | Número máximo de rollups que pueden registrarse  |
| `min_stake_for_rollup`      | 10.000.000.000 uqor (10.000 QOR) | Stake mínimo requerido para crear un rollup      |
| `rollup_creation_burn_rate` |                        0.01 (1%) | Fracción del stake de creación quemada vía `x/burn` |
| `default_challenge_window`  |         604.800 segundos (7 días) | Ventana de impugnación optimista por defecto    |
| `max_da_blob_size`          |           2.097.152 bytes (2 MB) | Tamaño máximo de blob de disponibilidad de datos |
| `blob_retention_blocks`     |              432.000 (\~30 días) | Bloques antes de que se poden los blobs de DA    |
| `max_batches_per_block`     |                               10 | Lotes máximos de liquidación procesados por bloque |

---

## Integración multicapa

El módulo RDK se integra con `x/multilayer` para la gestión de estado entre capas:

### Registro de capa

Cuando se crea un rollup, se registra automáticamente como una capa sidechain vía `RegisterSidechain`. El registro incluye:

* ID de capa (coincide con el ID del rollup)
* Tiempo de bloque objetivo y máximo de transacciones por bloque
* Tipos de VM y dominios soportados
* Intervalo de liquidación

El registro es **no fatal**: si el registro en `x/multilayer` falla, el rollup se crea de todos modos y se registra una advertencia.

### Anclaje de estado

Cada lote de liquidación enviado al RDK se ancla a `x/multilayer` vía `AnchorState`. Esto registra:

* ID de capa y altura de capa (índice del lote)
* Raíz de estado
* Recuento de transacciones

El anclaje es **no fatal**: los fallos se registran pero no impiden el procesamiento del lote.

---

## Integración de quema

Al crear un rollup, **el 1% del monto del stake** se quema vía el módulo `x/burn` a través del canal de quema `rollup_create`. Por ejemplo, crear un rollup con el stake mínimo de 10.000 QOR quema 100 QOR permanentemente. Los 9.900 QOR restantes se mantienen en escrow y se devuelven cuando se detiene el rollup.
