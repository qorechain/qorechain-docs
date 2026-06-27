---
slug: /dashboard/staking-and-validators
title: Staking y validadores
sidebar_label: Staking y validadores
sidebar_position: 8
---

# Staking y validadores

La página de **Validadores** te permite revisar los validadores de la red y hacer staking de tus QOR delegando en ellos. Delegar ayuda a asegurar la red y genera recompensas de staking. Para los conceptos detrás de la delegación y las recompensas, consulta [Staking y delegación](/user-guide/staking-and-delegation).

Conecta tu billetera para hacer staking —consulta [Resumen y primeros pasos](/dashboard/overview#connect-your-wallet).

## Revisar validadores

La página se abre con tarjetas de resumen del número de validadores activos, el total de QOR vinculados (bonded), la comisión media y el tiempo de actividad medio. Debajo está la lista de validadores. Cada validador muestra:

- Un **rango** y el **moniker** (nombre) del validador, con su dirección y un botón de copiar.
- **Poder de voto** — el stake vinculado del validador y su participación en el total.
- **Comisión** — el porcentaje que el validador retiene de las recompensas.
- **APY** — la estimación de rendimiento anual por delegar.
- **Estado** — por ejemplo, activo o encarcelado (jailed).
- Detalles operativos como la región, el tiempo de actividad, los bloques propuestos, la versión del software y la última vez visto.

Un cuadro de búsqueda filtra la lista por nombre o dirección del validador.

## Elegir un validador

Al elegir un validador en el que delegar, ten en cuenta:

- **Comisión** — una tarifa más baja deja más recompensas para ti, pero los operadores sostenibles necesitan una parte razonable.
- **Tiempo de actividad y estado** — favorece a los validadores activos con buen tiempo de actividad; un validador encarcelado no genera ingresos.
- **Poder de voto** — distribuir el stake entre varios validadores favorece la descentralización.

## Delegar, redelegar y reclamar

Con una billetera conectada, puedes:

- **Delegar** QOR a un validador para empezar a generar recompensas.
- **Redelegar** tu stake de un validador a otro.
- **Anular la delegación (undelegate)** para empezar a retirar tu stake.
- **Reclamar recompensas** acumuladas de tus delegaciones.

:::note Periodo de desvinculación
Los QOR cuya delegación se anula pasan por un periodo de desvinculación (unbonding) antes de que vuelvan a ser gastables, durante el cual no generan recompensas. Consulta [Staking y delegación](/user-guide/staking-and-delegation) para más detalles.
:::

## Relacionado

- [Staking y delegación](/user-guide/staking-and-delegation) — conceptos completos de staking.
- [Validadores del Explorador](/dashboard/explorer#validators) — explora validadores sin billetera.
- [Centro de herramientas](/dashboard/tools-hub) — solicita ejecutar tu propio validador.
