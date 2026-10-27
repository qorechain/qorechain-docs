---
slug: /architecture/rollup-development-kit
title: Rollup Development Kit
sidebar_label: Rollup Development Kit
sidebar_position: 12
---

# Rollup Development Kit

El módulo `x/rdk` proporciona un Rollup Development Kit (RDK) completo que permite a los desarrolladores desplegar rollups específicos de aplicación en QoreChain. Admite cuatro paradigmas de liquidación, múltiples modos de secuenciador, backends de disponibilidad de datos conectables y optimización de configuración asistida por IA.

:::caution Capacidad en fase temprana
El módulo está desplegado en mainnet (versión de cadena **v3.2.4** desde el 23 de octubre de 2026) y en testnet (**v3.2.6** desde el 27 de octubre de 2026), pero **todavía no se ha creado ningún rollup en ninguna de las dos redes** (comprobado el 27 de octubre de 2026: `GET /qorechain/rdk/v1/rollups` devuelve una lista vacía en ambas). Varias de las capacidades descritas a continuación no son utilizables de extremo a extremo hoy; el estado se indica donde se describe cada una. Para la guía práctica dirigida a desarrolladores, consulte [Rollups Overview](/rollups/overview).
:::

---

## Paradigmas de liquidación

El RDK de QoreChain admite cuatro modos de liquidación distintos — **optimistic**, **zk**, **based** y **sovereign** — cada uno con diferentes supuestos de confianza, características de finalidad y requisitos de prueba.

### Liquidación optimista {#optimistic-settlement}

Los rollups optimistas asumen que las transacciones son válidas por defecto y dependen de pruebas de fraude para la resolución de disputas.

* **Sistema de pruebas**: pruebas de fraude interactivas
* **Ventana de impugnación**: 604,800 segundos (por defecto, 7 días). **Antes de v3.2.4:** la cadena lo convierte a bloques a razón fija de 6 segundos por bloque, **100,800 bloques**, así que el tiempo real transcurrido depende del tiempo de bloque real (unos 3,7 días con los bloques actuales de ≈3,2 s de mainnet); planifique en bloques, no en días. **Desde v3.2.4:** para un lote enviado a partir de la altura de la actualización, la ventana se mide en segundos de tiempo de bloque (7 días completos). Un lote enviado antes conserva la regla del número de bloques. La testnet aplicó la v3.2.4 en la altura 8,337,253 (19 de octubre de 2026); mainnet la aplicó en la altura 3,742,566 (23 de octubre de 2026, propuesta de gobernanza 13). El valor por defecto configurado en la testnet es más corto, 3,600 segundos (1 hora), de modo que un rollup de testnet finaliza más rápido que los 7 días descritos aquí.
* **Fianza de impugnación**: 1,000 QOR (1,000,000,000 uqor) — requerida para presentar una impugnación con prueba de fraude (presets `nft` y `custom`; los presets `defi`, `gaming` y `enterprise` no establecen fianza porque no tienen ventana de impugnación)
* **Finalidad**: retrasada hasta que expire la ventana de impugnación sin una impugnación válida
* **Auto-finalización**: el `EndBlocker` finaliza automáticamente los lotes una vez que la ventana de impugnación ha pasado sin disputa. Un lote impugnado nunca se finaliza automáticamente: el creador del rollup resuelve primero la impugnación (consulte [Deploying a Rollup](/rollups/deploying-a-rollup#challenge-a-batch-optimistic-rollups)).

**Ciclo de vida del lote**:

```
Submitted → [challenge window expires] → Finalized
Submitted → [fraud proof submitted] → Challenged → Rejected
```

### Liquidación ZK (Zero-Knowledge) {#zk-zero-knowledge-settlement}

Los rollups ZK proporcionan pruebas criptográficas de validez que garantizan la corrección de las transiciones de estado.

* **Sistema de pruebas**: SNARK (Groth16 sobre BLS12-381) o STARK (transparente, sin configuración de confianza)
* **Finalidad**: instantánea al verificar la prueba — no se requiere ventana de impugnación
* **Tamaño máximo de prueba**: 1 MB (1,048,576 bytes)
* **Profundidad de recursión**: profundidad de agregación de pruebas configurable (por defecto: 1)
* **Madurez**: los lotes SNARK se verifican on-chain (Groth16 sobre BLS12-381) contra una clave de verificación almacenada junto con el rollup. Un rollup creado mediante `create-rollup` no incluye actualmente una clave de verificación, por lo que los lotes ZK todavía no pueden finalizarse de extremo a extremo. La verificación STARK es experimental: es opcional y comprueba un circuito de demostración, no la transición de estado de su propio rollup. Trate la liquidación ZK como no apta para producción.

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

La verificación STARK es experimental y la liquidación ZK no está lista para producción; consulte la nota de madurez de [Liquidación ZK](#zk-zero-knowledge-settlement) más arriba.

---

## Perfiles preconfigurados

El RDK incluye **cinco perfiles preconfigurados** que proporcionan configuraciones de rollup llave en mano optimizadas para casos de uso comunes. Cada preset agrupa un paradigma de liquidación, un modo de secuenciador, un backend de disponibilidad de datos, un modelo de gas y una VM ajustada a su dominio objetivo:

| Perfil           | Liquidación (prueba)     | Secuenciador | DA              | Modelo de gas | VM      | Caso de uso objetivo |
| ---------------- | ------------------------ | --------- | --------------- | ------------ | ------- | --------------- |
| **`defi`**       | zk (SNARK)               | dedicated | native          | EIP-1559     | EVM     | Aplicaciones de trading, préstamos y estilo AMM |
| **`gaming`**     | based                    | based     | native          | flat         | custom  | Estado de juego y economías dentro del juego de alto rendimiento y baja latencia |
| **`nft`**        | optimistic (fraud)       | dedicated | native (Celestia DA planificado) | standard | QoreChain Native | Acuñación de NFT, mercados y coleccionables digitales |
| **`enterprise`** | based                    | based     | native          | subsidized   | EVM     | Despliegues permisionados y de consorcio con tarifas patrocinadas |
| **`custom`**     | totalmente parametrizado | totalmente parametrizado | totalmente parametrizado | totalmente parametrizado | totalmente parametrizado | Cada campo es definido por el usuario |

El perfil `custom` deja cada campo para que usted lo configure. Los valores exactos agrupados en cada preset pueden evolucionar a medida que el RDK madura; consulte la configuración en vivo con `qorechaind query rdk config` (o `RdkClient.params()` de `@qorechain/rdk`) para los parámetros autoritativos por preset, y tenga en cuenta que la liquidación `based` siempre se empareja con el modo de secuenciador `based`.

---

## Modos de secuenciador

El secuenciador determina quién ordena las transacciones dentro de un bloque del rollup.

:::note Qué se impone hoy
On-chain, un lote solo puede ser enviado por la dirección de secuenciador configurada del rollup o, cuando no hay ninguna establecida (en todos los presets), por su creador. Los modos `shared` y `based` se registran en la configuración del rollup, pero QoreChain todavía no admite una lista de secuenciadores compartida ni a los proponentes de L1 como remitentes de lotes; esos modos describen el diseño previsto.
:::

### Secuenciador dedicado

Un único operador secuencia todas las transacciones del rollup.

* **Operador**: una única dirección designada
* **Latencia**: la más baja posible — ordenación de una sola parte
* **Confianza**: requiere confianza en el operador del secuenciador para la disponibilidad y la ordenación justa

### Secuenciador compartido

Un conjunto de secuenciadores ordenan colectivamente las transacciones.

* **Estado**: hoy es solo una etiqueta — la lista todavía no se admite on-chain (consulte la nota anterior)
* **Tamaño mínimo del conjunto**: configurable (por defecto: 1)
* **Latencia**: ligeramente mayor debido a la coordinación entre múltiples partes
* **Confianza**: distribuida entre el conjunto de secuenciadores

### Secuenciador based

Los proponentes de L1 de QoreChain secuencian las transacciones del rollup.

* **Estado**: hoy es solo una etiqueta — los proponentes de L1 todavía no se admiten como remitentes de lotes (consulte la nota anterior)
* **Retraso de inclusión**: bloques configurables antes de la inclusión forzada (por defecto: 10)
* **Reparto de tarifas de prioridad**: porcentaje configurable de las tarifas de prioridad pagadas a los proponentes de L1
* **Confianza**: hereda la seguridad del conjunto de validadores de QoreChain y la resistencia a la censura
* **Requisito**: el modo de liquidación based requiere el secuenciador based (impuesto en la validación)

---

## Backends de disponibilidad de datos

### Native DA

Almacenamiento de blobs en el KV-store on-chain dentro de la propia QoreChain.

:::caution Todavía no hay una forma pública de publicar un blob
El módulo define el almacenamiento, la retención y la poda de blobs, pero en las versiones actuales no existe ningún mensaje de transacción para publicar un blob. Un lote que nombre un hash de datos en un rollup `native` o `both` es rechazado porque no se puede almacenar ningún blob coincidente. Consulte [Data Availability](/rollups/data-availability). Por tanto, con disponibilidad de datos native un lote debe dejar `data_hash` vacío; el cliente RDK (0.6.1) lo hace así, y la cadena rechaza un lote que declare uno.
:::

| Parámetro            | Valor                                                                                               |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| **Tamaño máximo de blob** | 2 MB (2,097,152 bytes)                                                                          |
| **Período de retención** | 432,000 bloques (unos 16 días con los bloques actuales de ≈3,2 s de mainnet; la cifra varía con el tiempo de bloque) |
| **Auto-poda**        | Los blobs expirados se podan en el `EndBlocker` — los datos se eliminan pero se conservan los metadatos del compromiso |
| **Compromiso**       | Hash SHAKE-256 (32 bytes) de los datos del blob                                                     |

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
| **Stopped** | Desmantelado permanentemente — se devuelve lo que queda del escrow del creador (consulte [Libro de escrow](#escrow-ledger)) |

En la creación, el estado del rollup se establece en `Active` inmediatamente después de que el escrow de stake y la quema de creación tengan éxito (se intenta el registro de la capa, pero no es fatal). Solo el creador puede pausar, reanudar o detener un rollup (impuesto desde la versión de cadena v3.2.0).

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

Comportamiento del RDK 0.6.1: para un rollup optimistic, el cliente construye un lote cuya raíz de estado es la raíz de transición canónica de la cadena (`batchTransitionRoot` en el RDK), no un valor libre propio.

### Reglas de auto-finalización

| Modo de liquidación | Disparador de finalización                                   |
| --------------- | ----------------------------------------------------------- |
| **Optimistic**  | 100,800 bloques después del envío (ventana por defecto) sin impugnación; para los lotes enviados desde v3.2.4 (testnet desde la altura 8,337,253; mainnet desde la altura 3,742,566, 23 de octubre de 2026), 604,800 segundos de tiempo de bloque |
| **ZK**          | Instantánea al enviar una prueba válida                      |
| **Based**       | 2 bloques de L1 después del envío                            |
| **Sovereign**   | Ninguna — gestionada por el propio consenso del rollup       |

La auto-finalización se ejecuta en el `EndBlocker` para los rollups optimistic y based. Los lotes ZK se finalizan en línea durante el envío del lote.

---

## Parámetros del módulo

| Parámetro                   |                       Por defecto | Descripción                                      |
| --------------------------- | -------------------------------: | ------------------------------------------------ |
| `max_rollups`               |                              100 (testnet: 200) | Número máximo de rollups que pueden registrarse  |
| `min_stake_for_rollup`      | 10,000,000,000 uqor (10,000 QOR) | Stake mínimo requerido para crear un rollup      |
| `rollup_creation_burn_rate` |                        0.01 (1%) | Fracción del stake de creación quemada vía `x/burn` |
| `default_challenge_window`  | 604,800 s (testnet: 3,600 s) | Ventana de impugnación optimista por defecto; antes de v3.2.4 la cadena la convertía a 100,800 bloques |
| `max_da_blob_size`          |           2,097,152 bytes (2 MB) | Tamaño máximo de blob de disponibilidad de datos |
| `blob_retention_blocks`     |                   432,000 bloques | Bloques antes de que se poden los blobs de DA    |
| `max_batches_per_block`     |                               10 | Lotes máximos de liquidación procesados por bloque |

---

## Integración multicapa

El módulo RDK se integra con `x/multilayer` para la gestión de estado entre capas:

### Registro de capa {#layer-registration}

Cuando se crea un rollup, el módulo registra una capa para él mediante `RegisterSidechain`, de modo que on-chain el tipo de capa es **`sidechain`**, comienza en estado `proposed`, cuenta para el límite de sidechains de multilayer (`max_sidechains`, por defecto **10**) y bloquea el `min_sidechain_stake` del creador (1,000 QOR). El registro incluye:

* ID de capa (coincide con el ID del rollup)
* Tiempo de bloque objetivo y máximo de transacciones por bloque
* Tipos de VM y dominios soportados
* Intervalo de liquidación

El registro es **no fatal**: si falla (saldo insuficiente o límite alcanzado), el rollup se crea de todos modos, pero no tiene capa y no puede anclarse. Un ancla de liquidación no requiere que la capa esté `active`: la capa que registra un rollup del RDK permanece en `proposed` y su creador todavía puede anclarla (consulte [Envío de Anclas](/architecture/multilayer-architecture#anchor-submission)).

### Anclaje de estado {#state-anchoring}

Un lote de liquidación puede anclarse a `x/multilayer`, que registra el ID de capa, la altura de capa (el índice del lote), la raíz de estado, el hash del conjunto de validadores y el recuento de transacciones bajo una firma poscuántica del creador del rollup.

* **Desde v3.2.2 (activo en mainnet y testnet):** `MsgSubmitBatch` tiene dos campos opcionales. `anchor_signature` es la firma ML-DSA-87 del creador sobre los **bytes de firma de ancla v2** del lote (consulte [Lectura de Anclas](/architecture/multilayer-architecture#reading-anchors)); cuando está presente, el lote se ancla en `x/multilayer` en la **misma transacción**, y un ancla rechazada rechaza el lote. `validator_set_hash` es el compromiso del conjunto de validadores del rollup que se incluye en el ancla y queda cubierto por la firma. En la CLI: `qorechaind query rdk anchor-sign-bytes <layer-id> <batch-index> <state-root-hex> --chain-id <id> --tx-count <n>` imprime los bytes que hay que firmar (`<layer-id>` es el id de capa del rollup, que coincide con el id del rollup en los rollups creados mediante el RDK), y `tx rdk submit-batch ... --anchor-signature <hex> --validator-set-hash <hex>` los envía.
* **Sin la firma** el lote se liquida sin anclar, exactamente como antes. Un cliente que no envía el campo produce lotes sin anclar, así que compruebe que el toolkit que usa lo admite: el `@qorechain/rdk` 0.6.0 de TypeScript firma el ancla cuando su cliente firma en modo híbrido y es el creador del rollup (y en caso contrario envía el lote sin anclar), mientras que los clientes de Python, Go, Rust y Java no construyen el campo. Todavía no existe ningún rollup, capa ni ancla en ninguna de las dos redes, por lo que no se ha escrito ningún ancla y esa vía no se ha probado en vivo.

Consulte [Settlement Receipts](/rollups/settlement-receipts) para saber qué prueba y qué no prueba un ancla.

---

## Libro de escrow y retiros {#escrow-ledger}

El escrow de todos los rollups está en un único saldo de módulo agrupado. Desde **v3.2.3** (altura 3,662,051 en mainnet, 20 de octubre de 2026) un **libro de escrow** por rollup es el registro único de lo que cada rollup tiene en ese fondo:

* `create-rollup` abona al libro el escrow que el rollup conserva realmente: el stake menos la quema de creación del 1%.
* Un retiro (`tx rdk execute-withdrawal`) y una recompensa de prueba de fraude se pagan desde el libro y se cargan a él. Un retiro mayor que lo que el rollup todavía tiene se rechaza con un error de escrow insuficiente.
* `stop-rollup` devuelve solo lo que queda en el libro y lo pone a cero. Un rollup detenido no paga más retiros.
* El `RollupView` de solo lectura que devuelven las consultas de rollup incluye `escrow_balance`: los uqor que todavía se conservan para ese rollup.

Antes de v3.2.3 el libro se abonaba con cero, de modo que todo retiro fallaba de forma segura; por tanto, `execute-withdrawal` solo puede tener éxito en mainnet a partir de v3.2.3. Las comprobaciones que un cliente debe hacer antes de pagar una comisión: el denom debe ser exactamente `uqor`, el monto debe ser positivo, la prueba Merkle tiene como máximo 64 niveles y cada hermano mide exactamente 32 bytes, y quien envía y el destinatario deben ser direcciones `qor1…` válidas. Un retiro también necesita un lote finalizado que haya comprometido un `withdrawals_root`, y cada hoja de retiro solo puede pagarse una vez.

## Lectura del estado del RDK {#reading-state}

Las consultas del RDK se sirven por REST en mainnet y testnet bajo `/qorechain/rdk/v1/`:

| Ruta | Devuelve |
| --- | --- |
| `/params` | Parámetros del módulo (la tabla anterior) |
| `/rollups` y `/rollup/{rollup_id}` | Registros de rollups, incluido `escrow_balance` |
| `/batches/{rollup_id}` | Lotes, paginados (`start_index`, `limit` por defecto 50, máximo 100, `next_index`) |
| `/batch/{rollup_id}/{batch_index}` y `/latest_batch/{rollup_id}` | Un lote, o el más reciente |
| `/blob/{rollup_id}/{blob_index}` | Metadatos del blob, incluido `expires_at_height` (no se devuelven los bytes del blob) |

`qorechaind query rdk config` imprime los parámetros del módulo (la ruta es `/params`; no hay ninguna ruta `/config`). Los ids de rollup y de capa deben cumplir la gramática de ids de [Ids de capa y de rollup](/architecture/multilayer-architecture#id-grammar), impuesta desde v3.2.2.

---

## Integración de quema

Al crear un rollup, **el 1% del monto del stake** se quema vía el módulo `x/burn` a través del canal de quema `rollup_create`. Por ejemplo, crear un rollup con el stake mínimo de 10,000 QOR quema 100 QOR permanentemente. Los 9,900 QOR restantes se mantienen en escrow y, cuando se detiene el rollup, lo que quede de ellos se devuelve al creador (los retiros y las recompensas de prueba de fraude pagados desde el escrow reducen el reembolso). La quema de creación se impone desde la versión de cadena v3.2.0; las versiones anteriores no la aplicaban.
