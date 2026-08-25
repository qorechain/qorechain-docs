---
slug: /qorex/portfolio-and-staking
title: Portafolio y Staking
sidebar_label: Portafolio y Staking
sidebar_position: 4
---

# Portafolio y Staking

## Portafolio

La vista **Portfolio** (protegida por biometría la primera vez que la abres en cada sesión) muestra un **donut de asignación** — tu QOR unificado a través de sus tres carriles (Native, EVM, SVM) — con una leyenda debajo del anillo, además de una fila para cada activo. Los porcentajes aparecen una vez que el feed de precios está activo.

Toca cualquier activo para abrir el **detalle del activo**, que muestra:

- **Historial de saldo** — una tendencia real construida a partir de tus transferencias on-chain.
- **Actividad reciente** — filas de transacciones con búsqueda inversa de **@handle**, de modo que las contrapartes se muestran por nombre cuando es posible.

## Staking y Earn

Hacer staking de QOR ayuda a asegurar QoreChain y te otorga recompensas. Todas las operaciones de staking son transacciones on-chain reales que llevan tu firma post-cuántica.

### Haz staking con un validador

1. Abre **Stake**.
2. Elige un validador de la lista (cargada en vivo desde la cadena).
3. Introduce un importe y **delega** con confirmación biométrica.
4. Reclama recompensas desde la misma pantalla cada vez que se acumulen.

:::note Hoy no hay periodo de bloqueo — la espera solo ocurre al salir
No hay un plazo fijo que elegir, porque ahora mismo no existe: la delegación permanece activa con recompensas fluyendo desde el siguiente bloque hasta que solicitas deshacer la delegación — no hay vencimiento que renovar ni duración mínima de staking. El único periodo de espera está a la salida: una vez que deshaces la delegación, ese QOR queda en un periodo de unbonding de 21 días, sin generar recompensas y sin poder moverse, antes de volver a tu saldo disponible. Mover una delegación a otro validador (redelegar) en cambio evita esa espera por completo. Esto describe el comportamiento actual de la cadena, no una garantía permanente — consulta [¿Existe un periodo de bloqueo?](/user-guide/staking-and-delegation#lock-in-period) para más información.
:::

:::note Esta pantalla todavía no tiene su propio botón de Undelegate
Esta pantalla de Stake cubre solo delegar y reclamar. Para deshacer la delegación directamente desde una pantalla de QoreX, usa la [pantalla de Stake de la extensión del navegador](/qorex/browser-extension#stake) — o deshaz la delegación desde el [Dashboard](/dashboard/staking-and-validators#delegate), que envía la solicitud a cualquier QoreX que tengas conectado, incluida la app, para que la apruebes.
:::

### Earn

La vista **Earn** resume tus posiciones activas y tu rendimiento en un solo lugar.

## Próximos pasos

- [Enviar y Recibir](/qorex/send-and-receive) — mueve QOR y activos externos.
- [Seguridad y Recuperación](/qorex/security-and-recovery) — guardianes, herencia Legacy y vinculación de dispositivos.
