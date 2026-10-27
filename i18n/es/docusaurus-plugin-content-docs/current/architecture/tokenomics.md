---
slug: /architecture/tokenomics
title: Tokenómica
sidebar_label: Tokenómica
sidebar_position: 6
---

# Tokenómica

El modelo económico de QoreChain se centra en el token nativo **QOR** y sigue una **trayectoria de suministro finita y con tope**: un suministro de génesis fijo, una emisión de recompensas de staking acuñada bajo un límite acumulado estricto y un motor de quema multicanal que elimina tokens de forma permanente. Esta página describe cómo funcionan el suministro, la emisión, las quemas y el reparto de tarifas, usando cifras leídas de la cadena en vivo.

---

## Conceptos básicos del token

| Propiedad              | Valor                                                    |
| --------------------- | -------------------------------------------------------- |
| **Token de visualización** | QOR                                                 |
| **Denominación base** | uqor                                                     |
| **Precisión decimal** | 10^6 (1 QOR = 1.000.000 uqor)                            |
| **Suministro**        | Génesis 4.420.000.000 QOR; consulta el [Modelo de suministro y emisión](#supply-and-emission) |
| **Chain ID**          | `qorechain-vladi` (mainnet, EVM chain ID 9801)          |
| **Prefijo Bech32**    | `qor` (cuentas: `qor1...`, validadores: `qorvaloper...`) |

:::note
Las cifras de esta página describen la **mainnet** (`qorechain-vladi`, EVM chain ID **9801**), en vivo desde el 7 de junio de 2026 en la versión **v3.2.4** (aplicada en la altura 3.742.566 el 23 de octubre de 2026). La testnet **`qorechain-diana`** (EVM chain ID **9800**, versión **v3.2.6** desde el 27 de octubre de 2026) tiene su propio historial de suministro y emisión (el suministro de la testnet es muy superior al de la mainnet y su emisión ya superó el tope), así que usa las cifras de la mainnet. Las cantidades que cambian con cada bloque se marcan con la fecha en que se leyeron (23 de octubre de 2026).
:::

---

## Modelo de suministro y emisión {#supply-and-emission}

QoreChain tiene una **trayectoria de suministro finita y con tope**. El suministro de génesis fue de **4.420.000.000 QOR** (estaban previstos 4.500.000.000 QOR; 80.000.000 QOR, el 1,78 %, se quemaron en el Token Generation Event antes del génesis). Después del génesis el protocolo modifica el suministro mediante dos mecanismos:

* **Emisión** — el módulo `x/inflation` acuña una cantidad fija en cada época, bajo un **límite acumulado estricto de 590.000.000 QOR**. Los tokens acuñados entran en el colector de tarifas y pasan por el mismo reparto que las tarifas de transacción (consulta [Distribución de tarifas](#fee-distribution)).
* **Quemas** — el módulo `x/burn` elimina de forma permanente la parte de quema de todo lo que hay en el colector de tarifas.

### Emisión {#staking-reward-schedule}

| Parámetro | Valor |
| --- | --- |
| Modo de emisión | `fixed` (desde v3.1.94, altura 2.122.074 — 26 de agosto de 2026) |
| Emisión por época | **86.000 QOR** (16.239 QOR hasta la propuesta de gobernanza 10; la primera época de 86.000 QOR comienza en el bloque 3.672.000) |
| Duración de la época | 43.200 bloques (unas 37,7 horas con el tiempo de bloque actual de ≈3,1 s) |
| Límite acumulado (`max_total_emission`) | **590.000.000 QOR** (114.285.714 QOR hasta la propuesta 10) |
| Acuñado hasta ahora (23 de octubre de 2026, época 86) | 105.420.896,21 QOR (17,87 % del límite) |
| Restante bajo el límite | 484.579.103,79 QOR (unas 5.635 épocas a 86.000 QOR por época; la última es parcial) |

Una vez alcanzado el límite, el módulo deja de acuñar de forma permanente; a partir de entonces, las recompensas provienen únicamente de las tarifas de transacción. Las cifras de emisión las fijó la gobernanza: la propuesta n.º 4 (26 de agosto de 2026) sustituyó el calendario decreciente original por una cantidad fija bajo un límite estricto, y la propuesta n.º 10 (aprobada el 19 de octubre de 2026 con todo el stake en staking votando a favor) cambió esa cantidad de 16.239 QOR a 86.000 QOR por época y elevó el límite de 114.285.714 QOR a 590.000.000 QOR. La duración de la época no cambió. Los valores del calendario (17,5 %, 11 %, 7 %, 7 %, 2 % para los años 1–5) siguen almacenados en los parámetros del módulo, pero no se usan en el modo `fixed`.

El total acuñado, la cantidad restante y la altura de la próxima época están disponibles en vivo en `GET /qorechain/inflation/v1/epoch_info` (su campo `current_inflation_rate` informa la tasa heredada por año, que el modo `fixed` no utiliza).

QoreChain no expone una cifra de retorno de staking en vivo; trata cualquier porcentaje citado como no verificado. Las cifras actuales pueden leerse del estado de la cadena: el suministro en `GET /cosmos/bank/v1beta1/supply/by_denom?denom=uqor` (4.493.785.581,46 QOR el 23 de octubre de 2026) y los totales de quema en `GET /qorechain/burn/v1/stats`.

---

## x/burn — Motor de quema multicanal

El módulo `x/burn` define hoy **12 orígenes de quema** en la mainnet. Cada token quemado se elimina permanentemente del suministro. En la mainnet solo `gas_fee` (31.626.314,61 QOR a 23 de octubre de 2026) y, desde v3.2.2, `failed_tx` (0,1355 QOR) tienen quemas registradas; los demás están definidos pero no han registrado ninguna. Desde v3.2.4 hay un decimotercer origen, `staking_tier_penalty`, que registra la penalización quemada cuando una delegación con bloqueo temporal se desbloquea anticipadamente (en vivo en la testnet desde el 19 de octubre de 2026 y en la mainnet desde el 23 de octubre de 2026; todavía no se ha registrado ningún desbloqueo anticipado en la mainnet; consulta [Staking y delegación](/user-guide/staking-and-delegation#time-locked-staking)).

### Canales de quema

| #  | Canal              | Origen                     | Descripción                                   |
| -- | ------------------ | -------------------------- | --------------------------------------------- |
| 1  | `gas_fee`          | Tarifas de transacción     | Se quema el 30% de todas las tarifas de gas   |
| 2  | `contract_create`  | Despliegue de smart contracts | Tarifa fija de 100 QOR quemada por creación de contrato |
| 3  | `ai_service`       | Tarifas de uso del módulo de IA | Se quema el 50% de las tarifas de servicios de IA |
| 4  | `bridge_fee`       | Tarifas de bridge entre cadenas | Se quema el 100% de las tarifas de bridge   |
| 5  | `treasury_buyback` | Operaciones de tesorería   | Recompra y quema periódica desde la tesorería |
| 6  | `failed_tx`        | Gas de transacciones fallidas | Se quema el 10% del gas de transacciones fallidas (aplicado por la cadena desde v3.2.2) |
| 7  | `xqore_penalty`    | Penalizaciones por salida anticipada de xQORE | Los montos de penalización se enrutan a través de la quema |
| 8  | `auto_buyback`     | Programa de recompra automatizado | Quemas automatizadas a nivel de protocolo |
| 9  | `tge`              | Token generation event     | La quema de 80.000.000 QOR del TGE ocurrió antes del génesis (el suministro de génesis es de 4.420.000.000 QOR); este canal está reservado y registra 0 |
| 10 | `rollup_create`    | Despliegue de rollup       | Se quema el 1% del stake de creación del rollup |
| 11 | `milestone`        | Hitos de recuento de transacciones | Quemas programadas en recuentos acumulados fijos de transacciones (ninguna activada todavía) |
| 12 | `amm`              | AMM                        | Reservado para las tarifas de protocolo del AMM (ninguna registrada) |

Los canales `contract_create`, `ai_service`, `bridge_fee` y `auto_buyback` están inactivos hoy: la carga de QoreChain Native está cerrada, y las tarifas de servicios de IA y el bridge no están en vivo.

### Distribución de tarifas {#fee-distribution}

Todo lo que hay en el colector de tarifas se reparte entre cinco destinos, como se muestra a continuación. El colector de tarifas contiene tanto las tarifas de transacción como la emisión de la época acuñada por `x/inflation`. Los porcentajes se imponen on-chain y siempre suman exactamente el 100%.

```mermaid
flowchart LR
    F["Colector de tarifas<br/>(tarifas + emisión)"]
    F --> V["Validadores<br/>37%"]
    F --> B["Quemado<br/>30%"]
    F --> T["Tesorería<br/>20%"]
    F --> S["Stakers<br/>10%"]
    F --> L["Light Nodes<br/>3%"]
```

Los porcentajes son:

| Destinatario    | Porcentaje | Descripción                                                  |
| --------------- | ----- | -------------------------------------------------------------------- |
| **Validadores** | 37%   | Distribuido al conjunto de validadores activos en proporción al stake |
| **Quemado**     | 30%   | Eliminado permanentemente del suministro vía el canal de quema `gas_fee` |
| **Tesorería**   | 20%   | Asignado a la tesorería comunitaria para gasto dirigido por la gobernanza |
| **Stakers**     | 10%   | Distribuido a todos los stakers de QOR en proporción a la delegación |
| **Light Nodes** | 3%    | Distribuido a los light nodes por servir datos de la red             |

Los porcentajes se imponen on-chain y siempre deben sumar exactamente el 100%.

:::note Lo que realmente fluye por el reparto
El reparto se aplica a todo lo que hay en el colector de tarifas, que contiene tanto las tarifas de transacción como la emisión de la época acuñada por `x/inflation`. En la práctica, hoy casi todo es emisión: de los 105.420.896 QOR acuñados, se han quemado 31.626.315 QOR (30,0 %) a través del canal de tarifas de gas. Hasta la actualización a v3.2.0 (25 de septiembre de 2026, altura 2.981.742), la parte del 10 % de los stakers se movía al saldo del módulo de distribución sin respaldar ninguna reclamación, por lo que stakers y validadores juntos recibían el 37 %, no el 47 %; desde esa altura la parte de los stakers se paga como una recompensa de staking normal. La cantidad que ya había quedado varada se registró on-chain y desde entonces la han liberado votaciones de gobernanza — consulta [Parte de stakers varada y reserva de light nodes](#stranded-and-reserve).
:::

### Parámetros de quema

| Parámetro              | Por defecto                | Descripción                              |
| ---------------------- | -------------------------- | ---------------------------------------- |
| `gas_burn_rate`        | 0.30                       | Fracción de tarifas de gas quemada (30%) |
| `contract_create_fee`  | 100.000.000 uqor (100 QOR) | Tarifa fija de quema por creación de contrato |
| `ai_service_burn_rate` | 0.50                       | Fracción de tarifas de servicios de IA quemada (50%) |
| `bridge_burn_rate`     | 1.00                       | Fracción de tarifas de bridge quemada (100%) |
| `failed_tx_burn_rate`  | 0.10                       | Fracción del gas de TX fallidas quemada (10%) |
| `validator_share`      | 0.37                       | Parte del colector de tarifas para los validadores |
| `treasury_share`       | 0.20                       | Parte para la tesorería |
| `staker_share`         | 0.10                       | Parte para los stakers |
| `light_node_share`     | 0.03                       | Parte para los light nodes |
| `enabled`              | true                       | Indicador de activación del módulo |

Cada evento de quema se registra on-chain con su origen, monto, altura de bloque y hash de transacción asociado. Las estadísticas agregadas se pueden consultar por canal y en total.

---

## Parte de stakers varada y reserva de light nodes {#stranded-and-reserve}

Dos cantidades se acumularon en la mainnet antes de la actualización a v3.2.0 (25 de septiembre de 2026, altura 2.981.742). La actualización las registró **on-chain, fuera de cualquier distribución**, y solo permitió moverlas mediante una votación de gobernanza. Desde entonces la gobernanza ha liberado ambas a la fundación, en octubre de 2026:

| Registro | Liberación | Cantidad | Mensaje de gobernanza |
| --- | --- | --- | --- |
| **Parte de stakers varada** — la parte del 10 % de los stakers que se depositó donde no respaldaba ninguna reclamación de recompensas de staking | Propuesta 9 (aprobada el 19 de octubre de 2026) | 6.693.045,921330 QOR liberados | `MsgReleaseStrandedRewards` (autoridad de gobernanza; destino nombrado; no puede superar el registro) |
| **Reserva de light nodes** — la parte del 3 % de los light nodes que se acumuló mientras ningún light node era elegible | Propuesta 8 (aprobada el 19 de octubre de 2026) | 3.156.983,796395 QOR liberados | `MsgReleaseLightNodeReserve` (autoridad de gobernanza) |

**Remanente corregido de la parte varada.** En la actualización a v3.2.3 (altura 3.662.051, 20 de octubre de 2026) la cadena recalculó el registro de la parte varada, que entonces ascendía a 3.807.496,785528 QOR (`reserved` en `GET /qorechain/burn/v1/stranded_rewards`, junto a `released`, 6.693.045,921330 QOR). La propuesta de gobernanza 12 liberó ese remanente, 3.807.496,785528 QOR, a la fundación: fue aprobada (la votación terminó el 21 de octubre de 2026 a las 20:01 UTC) con todo el stake bonded que votó a favor. El registro puede consultarse en `GET /qorechain/burn/v1/stranded_rewards` y la propuesta en `GET /cosmos/gov/v1/proposals/12`.

**El pool de light nodes ahora.** Desde la actualización a v3.2.0, las recompensas de los light nodes se pagan únicamente de lo acumulado desde la ejecución de distribución anterior, con un techo por nodo. Desde v3.2.3 el techo es de **2.000 QOR por nodo cada 30 días** (`max_reward_per_month_per_node`), prorrateado por tiempo de bloque y por el uptime del nodo; el valor por bloque (`max_reward_per_block_per_node`, 1.713 uqor) se sigue informando pero ya no es la regla. Lo que no se gana permanece en la reserva del pool, que solo una votación de gobernanza puede liberar. Tras la propuesta 8 la reserva vuelve a acumularse: el 27 de octubre de 2026 el `reserved` del pool de la mainnet (en `GET /qorechain/lightnode/v1/reward_pool`) era de unos 13.380,9 QOR, con 0,06 QOR pendientes y nada pagable; ese día había un light node registrado en cada red. El registro está abierto y sujeto a licencia (consulta [Light Node](/light-node/overview#reward-program-status)). Se rechaza una liberación anterior a la instantánea de la actualización, superior a la cantidad registrada o dirigida a un destino no válido.

## x/xqore — Staking bloqueado y amplificación de gobernanza {#x-xqore}

:::warning Aún no está en vivo
La contabilidad del módulo xQORE existe y está activada en el génesis, pero **todavía no se puede usar** en la mainnet (`qorechain-vladi`) ni en la testnet (`qorechain-diana`). El nodo no tiene ningún punto de entrada de transacción, consulta, CLI o RPC para él, por lo que `tx xqore lock` / `unlock`, `query xqore ...`, las rutas REST de xQORE y `qor_getXQOREPosition` no funcionan, y nadie posee xQORE. Está previsto para una versión futura de la cadena, que también cambiará cómo se redistribuyen las penalizaciones por salida para que desbloquear siga siendo barato sin importar cuántos poseedores haya. La versión se indicará aquí cuando se publique.
:::

El módulo `x/xqore` introduce **xQORE**, un derivado de staking bloqueado no transferible. Los usuarios bloquean QOR para acuñar xQORE en una proporción 1:1. Los poseedores de xQORE reciben un poder de gobernanza amplificado y una parte de las penalizaciones por salida redistribuidas.

### Mecanismo de bloqueo

* **Bloqueo**: enviar QOR al módulo xQORE para acuñar xQORE en una proporción 1:1.
* **Peso de gobernanza**: los poseedores de xQORE reciben **2x de poder de voto en gobernanza** en comparación con los stakers estándar de QOR.
* **No transferible**: el xQORE no puede enviarse entre cuentas. Está vinculado a la dirección de bloqueo.

### Calendario de penalizaciones por salida

El retiro anticipado de xQORE incurre en una penalización que disminuye con la duración del bloqueo:

| Duración del bloqueo | Tasa de penalización | Descripción                                |
| -------------- | ------------ | ------------------------------------------ |
| &lt; 30 días   | **50%**      | Se pierde la mitad del QOR bloqueado       |
| 30 -- 90 días  | **35%**      | Penalización significativa para bloqueos a corto plazo |
| 90 -- 180 días | **15%**      | Penalización reducida para compromiso a medio plazo |
| > 180 días     | **0%**       | Retiro completo sin penalización           |

### Redistribución por rebase PvP

Las penalizaciones recaudadas de las salidas anticipadas no se destruyen simplemente. En cambio, siguen un modelo de rebase PvP (player-versus-player):

1. En la configuración de génesis se quema el **0%** de los montos de penalización (`penalty_burn_rate = 0`; el canal de quema `xqore_penalty` existe por si la gobernanza lo cambia).
2. El **100%** se redistribuye a prorrata a todos los poseedores de xQORE restantes.

Esto crea una dinámica de suma positiva para los poseedores a largo plazo: cada salida anticipada aumenta el valor efectivo de las posiciones de xQORE restantes. Los rebases ocurren cada **100 bloques**.

### Parámetros de xQORE

| Parámetro               | Por defecto            | Descripción                               |
| ----------------------- | ---------------------- | ------------------------------------------ |
| `governance_multiplier` | 2.0                    | Multiplicador de poder de voto para poseedores de xQORE |
| `min_lock_amount`       | 1.000.000 uqor (1 QOR) | QOR mínimo requerido para bloquear        |
| `penalty_burn_rate`     | 0.00                   | Fracción de penalizaciones por salida quemada (valor de génesis por defecto: todas las penalizaciones se redistribuyen) |
| `rebase_interval`       | 100 bloques            | Bloques entre eventos de rebase PvP       |
| `enabled`               | true                   | Indicador de activación del módulo        |

---

## x/inflation — Emisión con tope

El módulo `x/inflation` acuña la emisión por época (86.000 QOR desde la propuesta 10, `emission_mode = fixed`) y la envía al colector de tarifas, hasta que se alcanza el límite acumulado de 590.000.000 QOR. Los cambios de parámetros pasan por una propuesta de parámetros de gobernanza normal (`MsgUpdateParams`, añadido en v3.1.94).

### Mecánica de épocas

* **Duración de la época**: 43.200 bloques (unas 37,7 horas a ≈3,1 s por bloque).
* En cada límite de época el módulo acuña la emisión de la época (o el remanente hasta el límite), actualiza el registro de la época y deja de acuñar cuando `total_minted` alcanza el límite.
* Desde v3.2.3 el año de emisión se deriva de la duración de la época en lugar de un número fijo de bloques.

### Parámetros

Leídos en vivo el 23 de octubre de 2026 desde `GET /qorechain/inflation/v1/params`:

| Parámetro | Valor (mainnet) | Descripción |
| --- | --- | --- |
| `emission_mode` | `fixed` | `schedule` (heredado, tasas por año) o `fixed`; v3.2.4 añade un tercer modo, `target_apy` |
| `fixed_epoch_emission` | 86.000.000.000 uqor (86.000 QOR) | Acuñado por época en modo fijo |
| `max_total_emission` | 590.000.000.000.000 uqor (590.000.000 QOR) | Techo acumulado estricto |
| `epoch_length` | 43.200 bloques | Bloques por época de emisión |
| `schedule` | 17,5 %, 11 %, 7 %, 7 %, 2 % (años 1–5) | Calendario heredado, sin uso en modo fijo |
| `enabled` | `true` | Indicador de activación del módulo |

Los parámetros del módulo y el registro de la época se exponen por REST en la mainnet desde v3.2.3 (`/qorechain/inflation/v1/params` y `/qorechain/inflation/v1/epoch_info`); también pueden leerse del estado de la cadena con la interfaz de almacén en bruto de la RPC `abci_query` (almacén `inflation`, claves `inflation/params` y `inflation/epoch`).

:::note v3.2.4 y la emisión de la testnet
La testnet `qorechain-diana` está ajustada para pruebas y difiere de la mainnet (leído el 27 de octubre de 2026): está en modo `target_apy` con `target_apy_bps` `1667`, `fixed_epoch_emission` sigue siendo 16.239 QOR, y `max_total_emission` es 3.950.390.341.362.112.750 uqor, que equivale a lo ya acuñado allí (`remaining_emission` es `0` en `/qorechain/inflation/v1/epoch_info`), por lo que la testnet no acuña nada más. La mainnet usa los valores anteriores. La versión v3.2.4 añade el tercer modo de emisión, `target_apy`, con un parámetro `target_apy_bps`: en la testnet desde el 19 de octubre de 2026 y en la mainnet desde el 23 de octubre de 2026 (propuesta de gobernanza 13). En la mainnet el parámetro es `0` y no determina la emisión. Cambiar la mainnet a ese modo es una votación de gobernanza aparte y no se ha propuesto; hasta que se apruebe una, la mainnet permanece en modo `fixed` con 86.000 QOR por época.
:::

---

## Quema frente a emisión

La emisión tiene tope (590.000.000 QOR en total) y la parte de quema se aplica a todo lo que entra en el colector de tarifas, emisión incluida. Hasta la fecha (23 de octubre de 2026) se han quemado 31.626.315 QOR frente a 105.420.896 QOR acuñados, por lo que el suministro (4.493.785.581 QOR) está actualmente por encima de su nivel de génesis. Una vez alcanzado el límite, el suministro solo puede disminuir, en la cantidad quemada.

---

## Relacionado

* [Parámetros de la cadena](/appendix/chain-parameters) — valores por defecto canónicos económicos y de consenso.
* [Staking y delegación](/user-guide/staking-and-delegation) — delegar QOR y recibir recompensas de staking.
* [Staking de xQORE](/user-guide/xqore-staking) — el mecanismo de staking con rebase PvP.
* [Recompensas de Light Node](/light-node/rewards-and-monitoring) — la parte de recompensa de los light nodes.
