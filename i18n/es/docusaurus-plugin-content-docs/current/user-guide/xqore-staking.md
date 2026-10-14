---
slug: /user-guide/xqore-staking
title: Staking de xQORE
sidebar_label: Staking de xQORE
sidebar_position: 4
---

# Staking de xQORE

Esta página describe el mecanismo de staking de gobernanza xQORE **diseñado**, en el que los poseedores de QOR bloquearían sus tokens para obtener un poder de gobernanza mejorado con un modelo de rebase PvP que recompensa a los participantes a largo plazo. **xQORE no se puede usar hoy en ninguna de las dos redes**; nada de lo que aparece en esta página es algo que puedas hacer todavía.

:::warning Aún no disponible
xQORE está habilitado en el génesis pero **aún no se puede usar** en mainnet (`qorechain-vladi`, versión de nodo **v3.2.1**) ni en testnet (`qorechain-diana`). El nodo no tiene ningún punto de entrada de transacción, consulta, CLI o RPC para él, así que no existen `tx xqore lock` / `unlock`, ni `query xqore ...`, ni ninguna ruta REST de xQORE, ni el método `qor_getXQOREPosition`; no se puede bloquear ningún QOR y nadie posee xQORE. Está previsto para una futura versión de la cadena, que también cambiará la forma en que se redistribuyen las penalizaciones de salida para que desbloquear siga siendo barato sin importar cuántos poseedores haya. La versión se indicará aquí cuando se publique.
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
