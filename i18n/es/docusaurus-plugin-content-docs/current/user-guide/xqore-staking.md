---
slug: /user-guide/xqore-staking
title: Staking de xQORE
sidebar_label: Staking de xQORE
sidebar_position: 4
---

# Staking de xQORE

Esta página describe el mecanismo de staking de gobernanza xQORE **diseñado**, en el que los poseedores de QOR bloquearían sus tokens para obtener un poder de gobernanza mejorado con un modelo de rebase PvP que recompensa a los participantes a largo plazo. **xQORE no se puede usar hoy en ninguna de las dos redes**; nada de lo que aparece en esta página es algo que puedas hacer todavía.

:::warning Aún no disponible
xQORE está habilitado en el génesis pero **aún no se puede usar** en mainnet (`qorechain-vladi`, versión de nodo **v3.2.3**) ni en testnet (`qorechain-diana`, versión de nodo **v3.2.4**); ninguna de las dos versiones cambia esto (comprobado el 20 de octubre de 2026). El nodo no tiene ningún punto de entrada de transacción, consulta, CLI o RPC para él (la ruta REST `/qorechain/xqore/v1/params` devuelve `Not Implemented` en ambas redes), así que no existen `tx xqore lock` / `unlock`, ni `query xqore ...`, ni ninguna ruta REST de xQORE, ni el método `qor_getXQOREPosition`; no se puede bloquear ningún QOR y nadie posee xQORE. Está previsto para una futura versión de la cadena, que también cambiará la forma en que se redistribuyen las penalizaciones de salida para que desbloquear siga siendo barato sin importar cuántos poseedores haya. La versión se indicará aquí cuando se publique.
:::

---

## Visión General

En el diseño, bloquear QOR acuña xQORE en una **proporción 1:1**, y xQORE cuenta con **doble peso** en la fórmula de poder de voto QDRW:

```
VP = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)
```

El propio QDRW está desactivado en las redes en vivo y los votos de gobernanza se cuentan únicamente con el stake vinculado (consulta [Gobernanza](/user-guide/governance#voting-power)), así que incluso cuando xQORE se publique no cambiará el poder de voto hasta que una versión futura habilite QDRW.

---

## Calendario de penalización de salida diseñado

La configuración del génesis define una penalización de salida que disminuye cuanto más tiempo lleva bloqueado el QOR:

| Duración del bloqueo | Penalización de salida |
| ------------------ | ------------ |
| Menos de 30 días  | **50%**      |
| De 30 a 90 días      | **35%**      |
| De 90 a 180 días     | **15%**      |
| Más de 180 días | **0%**       |

Según el diseño, las penalizaciones **no se queman** (`penalty_burn_rate` es `0`): toda la penalización se redistribuye proporcionalmente entre los poseedores de xQORE restantes (el "rebase PvP"). El mecanismo de redistribución es la parte que cambiará en la versión que integre xQORE.

---

## Qué no está disponible

* **Bloqueo y desbloqueo.** No hay comandos `tx xqore` ni un tipo de transacción para bloquear o desbloquear QOR.
* **Posiciones.** No hay ninguna consulta de una posición de xQORE en ninguna interfaz (CLI, REST o JSON-RPC), y `total_locked` y `total_xqore` son ambos cero.
* **Bonificación de voto.** Hoy no existe ninguna bonificación de voto de xQORE.

Si quieres participar en la gobernanza ahora, delega QOR a un validador (consulta [Staking y Delegación](/user-guide/staking-and-delegation)) y vota en las propuestas (consulta [Gobernanza](/user-guide/governance)).

---

## El staking con bloqueo temporal es una función distinta (solo testnet) {#staking-tiers}

La versión **v3.2.4**, que se ejecuta solo en la testnet (se propone una actualización de mainnet a ella: propuesta de gobernanza 13, en la altura 3,742,566), añade un módulo aparte, `x/stakingtier`, para el **staking con bloqueo temporal opcional**. No es xQORE: no acuña xQORE, no cambia el poder de voto y no toca los parámetros de xQORE anteriores. En resumen:

* Un delegador bloquea una delegación a un validador durante un plazo elegido (el módulo ofrece 3, 6 y 12 meses). Mientras dura el bloqueo, el monto bloqueado no se puede retirar de la delegación ni redelegar, por ninguna vía de mensaje (una transacción, authz, un contrato o gobernanza).
* Los bloqueos tienen un tamaño mínimo y un límite de cuántos puede tener un delegador; léelos con `GET /qorechain/stakingtier/v1/params`.
* Un componente de recompensa adicional definido por los parámetros del módulo se acredita por época de inflación y se reclama con un mensaje aparte. El tamaño de ese componente es un parámetro del módulo y no se indica en esta página.
* Un bloqueo puede liberarse de forma anticipada. La liberación anticipada pierde lo acumulado y no reclamado y conlleva una penalización, parte de la cual se quema.
* Los bloqueos y el estado de la cuenta del módulo se pueden leer en `/qorechain/stakingtier/v1/locks/{holder}` y `/qorechain/stakingtier/v1/pool`.

Nada de esta sección existe en la mainnet v3.2.3: `GET https://api.qore.host/qorechain/stakingtier/v1/params` devuelve allí `Not Implemented`. El staking en mainnet es la delegación ordinaria, tratada en [Staking y Delegación](/user-guide/staking-and-delegation).
