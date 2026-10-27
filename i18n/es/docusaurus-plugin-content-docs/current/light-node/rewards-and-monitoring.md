---
slug: /light-node/rewards-and-monitoring
title: Recompensas y monitoreo
sidebar_label: Recompensas y monitoreo
sidebar_position: 5
---

# Recompensas y monitoreo

A un nodo ligero registrado se le acredita una parte de la asignación para nodos ligeros y **necesita mantenerse en buen estado** para seguir siendo elegible. Esta página cubre la participación del 3 % de recompensa para nodos ligeros, cómo se acreditan y se reclaman las recompensas, qué hace y qué no hace el nodo con las delegaciones, y cómo monitorear el nodo.

:::note Nada de lo aquí expuesto es una promesa de ganancias
El registro está abierto en ambas redes; consulta [Estado del programa de recompensas](/light-node/overview#reward-program-status) para conocer el estado actual. Lo que se acredita a un nodo depende de la asignación para nodos ligeros, del número de nodos elegibles, de su stake y su tiempo de actividad, y del límite por nodo descrito a continuación.
:::

## La participación del 3 % de la recompensa por bloque

La distribución de comisiones de QoreChain reserva una **participación fija del 3 % para los nodos ligeros** que sirven datos de la red. Este es uno de los cinco destinos en el reparto de recompensas del protocolo — validadores (37 %), quemado (30 %), tesorería (20 %), stakers (10 %) y **nodos ligeros (3 %)** — aplicado en la cadena. Consulta [Tokenómica](/architecture/tokenomics) para el desglose completo.

Para participar en esta porción, un nodo necesita lo siguiente, verificado en la cadena y no autodeclarado: una licencia `lightnode_operator` activa (se comprueba al registrarte), un mínimo de **1,000 QOR delegados a validadores en bonding** — contados como tu total en todos los validadores a los que delegas, no por validador; las delegaciones a validadores encarcelados (jailed) o fuera de bonding no cuentan; exigidos al registrarte y releídos desde el staking cada vez que se acreditan recompensas — y una tarifa de registro de **1 QOR**, que se paga una sola vez al registrarte. La participación tiene un límite a nivel de red de **10,000 nodos ligeros**. Consulta [Registro y licencias](/light-node/registration-and-licensing) para ver cómo funciona el registro y [Estado del programa de recompensas](/light-node/overview#reward-program-status) para conocer el estado actual.

El 3 % es lo que fluye al módulo de nodos ligeros, no un derecho por nodo: a cada nodo elegible se le acredita su parte ponderada por stake de lo acumulado, acotada por nodo, y todo lo no ganado va a una reserva que solo una votación de gobernanza puede liberar. Desde la cadena v3.2.3 el límite por nodo es de **2,000 QOR cada 30 días** (`max_reward_per_month_per_node`), prorrateado según el tiempo de bloque transcurrido entre liquidaciones y escalado por el tiempo de actividad (la regla `lightnode-monthly-cap`); sustituye al límite anterior por bloque (`max_reward_per_block_per_node`, `1713` uqor por bloque). Desde v3.2.4 (mainnet desde el 23 de octubre de 2026, testnet desde el 19 de octubre de 2026) el límite de un nodo comienza en el más tardío entre la liquidación anterior y el propio registro del nodo, de modo que a un nodo recién registrado no se le acredita el tiempo anterior a su registro. Consulta [la participación del 3 % de recompensa para nodos ligeros](/light-node/overview#the-3-light-node-reward-share).

Una vez registrado y delegado, mantener la elegibilidad es cuestión de seguir activo. Un nodo necesita al menos un **80 % de tiempo de actividad**, y debe seguir enviando pruebas de actividad por heartbeat en un intervalo de **1,000 bloques** (unos 52 minutos en mainnet con el tiempo medio de bloque medido de aproximadamente 3.1 s; unos 22 minutos en testnet, con aproximadamente 1.3 s por bloque).

**Las reglas de temporización.** La cadena rechaza un heartbeat enviado **menos de 1,000 bloques después del anterior** (`heartbeat submitted too early`); tu primer heartbeat tras registrarte no tiene ese límite inferior. Si no llega ningún heartbeat dentro de **1,000 + 100 bloques** (el `heartbeat_interval` más el `heartbeat_grace_period`; en mainnet unos 52 minutos más una gracia de aproximadamente 5 minutos) desde el último — o desde el registro, si no has enviado ninguno — el nodo se marca como inactivo y deja de acreditársele. Un heartbeat enviado más tarde se sigue aceptando y lo reactiva. El daemon envía el siguiente heartbeat en cuanto han pasado 1,000 bloques desde el `last_heartbeat` de tu nodo según la propia cadena, comprobándolo cada 60 segundos.

**Perder la ventana cuesta tiempo de actividad, no tu registro.** Un nodo que la pierde se marca como inactivo y deja de ganar, pero el siguiente heartbeat exitoso lo reactiva — no hay que volver a registrarse. Tu **tiempo de actividad** es la proporción acumulada de heartbeats recibidos respecto a los esperados (uno por cada 1,000 bloques) desde el bloque en que te registraste, con un tope de 1. Por debajo del umbral `min_uptime_for_rewards` (`0.80`) un nodo no gana nada; en o por encima de él, el techo por nodo se escala según tu tiempo de actividad. Por lo tanto, una interrupción larga reduce la proporción, y esta solo se recupera a medida que se acumulan heartbeats puntuales. Comprueba `status` si un nodo aparece como inactivo: informa del estado del firmante, la licencia y el registro.

:::note Lo que realmente demuestra un heartbeat
Un heartbeat exitoso demuestra que la clave del operador firmó a tiempo — no demuestra que un nodo esté ejecutando continuamente el software completo. Trátalo como una firma de actividad, no como "verificado como nodo activo".
:::

:::note `last_heartbeat` es una altura de bloque, no una marca de tiempo
Si consultas directamente el registro en la cadena de un nodo, `last_heartbeat` es una altura de bloque, y un valor de `0` significa que todavía no se ha registrado ningún heartbeat — la cadena entonces mide el plazo de inactividad desde la altura `registered_at` del nodo. Leer `0` como un cálculo ingenuo de tiempo transcurrido hace que un nodo recién registrado parezca tener un retraso de millones de bloques.
:::

*Elegibilidad para recompensas: mantén una licencia activa en la cadena y el stake mínimo en bonding, regístrate y luego sigue demostrando actividad mediante heartbeats para mantenerte por encima de los umbrales de tiempo de actividad e intervalo de heartbeat.*

```mermaid
flowchart LR
    A["Register on-chain"] --> B["Submit heartbeat<br/>liveness proofs"]
    B --> C{"Synced and<br/>proving liveness?"}
    C -- "yes" --> D["Active status<br/>eligible for light-node rewards"]
    C -- "stalled / offline" --> E["Not eligible<br/>(no share)"]
    E --> B
    D --> F["Credited its share<br/>(bounded per node)"]
    F --> G["Claim to the<br/>operator account"]
    G --> D
```

## Cómo funcionan las recompensas {#how-rewards-work}

### Acreditación

Cada 100 bloques la cadena acredita a cada nodo elegible (activo, con al menos el stake mínimo delegado y al menos el tiempo de actividad mínimo) su parte de lo acumulado, acotada por nodo (como máximo 2,000 QOR cada 30 días, prorrateado según el tiempo transcurrido desde la liquidación anterior) como se describe en [la participación del 3 % de recompensa para nodos ligeros](/light-node/overview#the-3-light-node-reward-share). El importe se suma a `accumulated_rewards` del nodo. Léelo con:

```bash
curl -s https://api.qore.host/qorechain/lightnode/v1/rewards/<operator-address>
# or: qorechaind query lightnode rewards <operator-address>
```

(Usa `https://api-testnet.qore.host` para la testnet.)

### Reclamación

Las recompensas acreditadas permanecen en el registro del nodo hasta que las reclames. El nodo puede reclamarlas por ti: establece `auto_claim = true` en `[delegation]`, y el daemon reclama las recompensas de nodo ligero acumuladas hacia la cuenta del operador en cuanto superan `min_reward_claim` (por defecto `1000000` uqor, 1 QOR), comprobándolo cada `compound_interval` (por defecto `1h`). Firma la reclamación del mismo modo que los heartbeats (de forma nativa o mediante la alternativa `qorechaind`). La reclamación automática está **desactivada por defecto**, y solo reclama: el nodo nunca vuelve a delegar ni mueve stake.

Para reclamar a mano con `qorechaind` (la clave del operador en un keyring de `qorechaind`, y la clave post-cuántica exportada con `lightnode-sx keys export <key-name> --out ~/.qorechaind/pqc/<key-name>.dilithium`), usa un par de generar y cofirmar:

```bash
qorechaind tx lightnode claim-rewards --from operator --chain-id <chain-id> --node https://rpc.qore.host --gas 300000 --fees 30000uqor --generate-only > claim.json
qorechaind tx pqc cosign claim.json --from operator --pqc-key <key-name> --chain-id <chain-id> --node https://rpc.qore.host
```

`qorechaind tx lightnode deregister` elimina el registro y paga todo lo que aún esté acreditado; la tarifa de registro no se reembolsa.

### Seguimiento de delegaciones y alertas de stake {#delegation-alerts}

El nodo replica desde la cadena las delegaciones de la cuenta del operador al arrancar y después cada cinco minutos. Nunca mueve stake: cambia las delegaciones desde tu propia billetera. Lo que advierte depende de la versión del nodo ligero:

- **3.1.11 y posteriores (con `rebalance_enabled = true`, el valor por defecto).** Advierte cuando un validador al que delegas está encarcelado (jailed), cuando no está en el conjunto activo y cuando tu stake en bonding cae por debajo de `min_delegated_stake` (1,000 QOR). En los tres casos la cadena deja de acreditar al nodo y no da ningún mensaje. Se registra una advertencia cuando aparece, cada hora mientras dure y una vez cuando desaparece.
- **Puntuación de reputación (3.1.12, por ahora solo en testnet).** El nodo también lee la puntuación de cada validador delegado desde `GET /qorechain/reputation/v1/validator/<valoper>` y advierte cuando está por debajo de `min_reputation` (por defecto `0.5`). Se omite a un validador que la cadena todavía no ha puntuado (`404`). La testnet sirve esta ruta ahora; **mainnet lo hará a partir de una versión de la cadena posterior a v3.2.5**. Mientras no se sirva la ruta, el nodo anota una vez que las puntuaciones no están publicadas y vuelve a preguntar cada seis horas.
- **3.1.10 y anteriores.** La comprobación de reputación nunca funcionó: registraba "failed to check reputation" cada cinco minutos y no emitía ninguna advertencia. No confíes en las alertas de esas versiones; instala 3.1.12 a mano una vez (consulta [SX Edition: actualización](/light-node/sx-edition#updating)).

Las opciones `validators` y `split_weights` de `[delegation]` se aceptan pero actualmente no se aplican.

### Inspeccionar recompensas y delegaciones

```bash
lightnode-sx validators   # the bonded validator set
lightnode-sx delegation   # the operator account's delegations, as mirrored by the running daemon
lightnode-sx rewards      # the operator account's pending staking rewards
```

Desde 3.1.6 estos comandos, y la vista **Delegation** de UX, leen la cuenta indicada en `operator_address`. `rewards` muestra las recompensas de **staking** de tus delegaciones, no las recompensas de nodo ligero. Para leerlo todo directamente desde la cadena:

```bash
curl -s https://api.qore.host/cosmos/staking/v1beta1/delegations/<operator-address>
curl -s https://api.qore.host/cosmos/distribution/v1beta1/delegators/<operator-address>/rewards
curl -s https://api.qore.host/qorechain/lightnode/v1/rewards/<operator-address>   # light-node rewards
```

## Monitoreo

Mantener el nodo en buen estado es lo que lo mantiene elegible para recompensas. Hay tres cosas que vale la pena vigilar.

### Telemetría

La telemetría en tiempo real cubre validadores, consenso/red, el puente y la tokenómica, cada una actualizada en su propio intervalo (configurado bajo `[telemetry]` en `config.toml`). Desde la CLI:

```bash
lightnode-sx status    # node and light-client sync status
lightnode-sx network   # recent synced headers and latest height
```

La edición UX muestra los mismos datos en vivo en sus vistas **Overview**, **Network**, **Bridge** y **Tokenomics** — consulta [Edición UX](/light-node/ux-edition).

### Estado de sincronización y heartbeat

El comando `status` informa el ID de cadena, la altura del último bloque, si la cadena está poniéndose al día, la altura sincronizada del cliente ligero y su estado de sincronización, el `Signer` (nativo, `qorechaind`, o no disponible con el motivo) y — una vez establecido `operator_address` — el estado de `Licence` y `Registration` (incluido el estado del nodo y la altura del último heartbeat). Un nodo que está registrado, sincronizado y en funcionamiento continúa enviando **pruebas de actividad por heartbeat** y, por lo tanto, se mantiene elegible para recompensas. Estos heartbeats se producen mediante un **canal de transacción cofirmado con PQC** (híbrido Dilithium-5 / ML-DSA-87), coherente con el valor por defecto que exige PQC en la cadena — consulta [Registro y licencias](/light-node/registration-and-licensing#pqc-cosigned-heartbeat-pipeline) para ver cómo funciona el canal y cómo elige el nodo su firmante. Si `status` muestra que el nodo está estancado o no está sincronizando, puede estar fallando en demostrar su actividad — investiga antes de que se vea afectada la elegibilidad.

### Estado del autotest

Si sospechas que hay un problema con el stack criptográfico, ejecuta el autotest PQC en cualquier momento:

```bash
lightnode-sx selftest
```

Ejecuta keygen → firma → verificación → detección de manipulación (cinco comprobaciones) y sale con un código distinto de cero ante cualquier fallo. Esta es la forma más rápida de descartar un problema en el stack de firma post-cuántica al diagnosticar problemas del nodo. Consulta [Edición SX](/light-node/sx-edition) para el desglose completo del autotest.

### Consultas a la cadena {#chain-queries}

URL base: `https://api.qore.host` (mainnet) y `https://api-testnet.qore.host` (testnet).

| Consulta | Devuelve |
| --- | --- |
| `GET /qorechain/lightnode/v1/params` | Tarifa de registro, intervalo de heartbeat y gracia, stake delegado mínimo, participación de recompensa, tiempo de actividad mínimo, límite de nodos. |
| `GET /qorechain/lightnode/v1/stats` | Recuentos de nodos registrados y activos, total de recompensas acreditadas. |
| `GET /qorechain/lightnode/v1/node/{address}` | El registro de un nodo (`status`, `last_heartbeat`, `total_heartbeats`, `expected_heartbeats`, `accumulated_rewards`). |
| `GET /qorechain/lightnode/v1/rewards/{address}` | Recompensas acreditadas y aún no reclamadas. |
| `GET /qorechain/lightnode/v1/reward_pool` | Cómo se divide el saldo del módulo entre reserva, recompensas acreditadas y el siguiente pago; incluye los límites por nodo (`max_reward_per_month_per_node`, y el anterior `max_reward_per_block_per_node`). |
| `GET /qorechain/license/v1/check/{address}/lightnode_operator` | Si una dirección posee una licencia activa. |

## A dónde ir después

- [Registro y licencias](/light-node/registration-and-licensing) — regístrate y mantente activo.
- [Tokenómica](/architecture/tokenomics) — el modelo completo de recompensas y quemado.
