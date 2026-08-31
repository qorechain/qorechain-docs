---
slug: /qorex/portfolio-and-staking
title: Portafolio y Staking
sidebar_label: Portafolio y Staking
sidebar_position: 4
---

# Portafolio y Staking

## Portafolio

La vista **Portfolio** (protegida por biometría la primera vez que la abres en cada sesión) muestra un **donut de asignación** — tu QOR unificado a través de sus tres carriles (Native, EVM, SVM) — con una leyenda debajo del anillo, además de una fila para cada activo. Los porcentajes aparecen una vez que el feed de precios está activo, y cada saldo muestra su valor estimado en USD junto con el importe en QOR.

**De dónde viene el precio.** QoreX lo obtiene de `GET https://api.qore.network/v1/price/{symbol}` — un endpoint público nuestro, no una llamada directa a ningún exchange. Nada en tu dispositivo se comunica con una fuente de precios externa a la infraestructura de QoreChain, por lo que tu dirección IP nunca queda expuesta a una. Si genuinamente no hay disponible un precio defendible, el endpoint responde con un error en lugar de adivinar — QoreX muestra el precio como no disponible en lugar de mostrar jamás un cero fabricado o una cifra desactualizada como si fuera actual.

Toca cualquier activo para abrir el **detalle del activo**, que muestra:

- **Historial de saldo** — una tendencia real construida a partir de tus transferencias on-chain.
- **Actividad reciente** — filas de transacciones con búsqueda inversa de **@handle**, de modo que las contrapartes se muestran por nombre cuando es posible. Toca cualquier fila para abrir su detalle completo: importe, contraparte, bloque, hash de transacción y firma.

## Staking y Earn

Hacer staking de QOR ayuda a asegurar QoreChain y te otorga recompensas. Todas las operaciones de staking son transacciones on-chain reales que llevan tu firma post-cuántica.

### Haz staking con un validador

1. Abre **Stake**.
2. Elige un validador de la lista (cargada en vivo desde la cadena, mostrando primero el de menor stake, y excluyendo cualquier validador actualmente en jail — delegar a uno de ellos nunca es lo que quieres).
3. Introduce un importe y **delega** con confirmación biométrica.
4. Reclama recompensas desde la misma pantalla cada vez que se acumulen.

:::note Hoy no hay periodo de bloqueo — la espera solo ocurre al salir
No hay un plazo fijo que elegir, porque ahora mismo no existe: la delegación permanece activa con recompensas fluyendo desde el siguiente bloque hasta que solicitas deshacer la delegación — no hay vencimiento que renovar ni duración mínima de staking. El único periodo de espera está a la salida: una vez que deshaces la delegación, ese QOR queda en un periodo de unbonding de 21 días, sin generar recompensas y sin poder moverse, antes de volver a tu saldo disponible. Mover una delegación a otro validador (redelegar) en cambio evita esa espera por completo. Esto describe el comportamiento actual de la cadena, no una garantía permanente — consulta [¿Existe un periodo de bloqueo?](/user-guide/staking-and-delegation#lock-in-period) para más información.
:::

### Mover el stake entre validadores (redelegar) {#move-stake}

Mueve el QOR que ya tienes en staking a un validador distinto — o repártelo entre varios — sin tocar en absoluto la cola de unbonding de 21 días. El stake sigue generando recompensas durante todo el trayecto.

1. Abre **Stake** y toca el validador con el que tu QOR está actualmente.
2. Elige a dónde debe ir — selecciona un único destino, o varios a la vez. Repartirlo entre varios divide el importe a partes iguales, y la cifra exacta que va a cada validador se muestra antes de confirmar.
3. Confirma con aprobación biométrica. Cada destino se mueve en una **única transacción** — una sola comisión, y o bien el movimiento completo se realiza o ninguna parte lo hace.

Este es el movimiento a realizar cuando un validador al que estás delegando entra en jail o sube su comisión — antes de que esto existiera, la única salida era deshacer la delegación y esperar 21 días sin ganar nada; mover el stake en cambio no cuesta espera ni recompensas perdidas.

:::caution Existe un límite por par, y la comisión se gasta incluso si lo alcanzas
La cadena permite como máximo **7 redelegaciones en curso a la vez para el mismo par de validadores (origen, destino)** — el uso normal no se acercará a esto, pero QoreX comprueba este límite antes de que firmes y te avisa si lo has alcanzado. Superado ese límite, la transacción falla on-chain y la comisión de red igualmente se gasta, así que no reintentes un movimiento que ya haya sido rechazado por este motivo sin esperar antes a que se libere uno existente.
:::

### Deshacer la delegación (undelegate)

1. Abre **Stake**, toca el validador y elige deshacer la delegación en lugar de mover tu stake.
2. Introduce el importe — la pantalla muestra el **periodo de unbonding de 21 días** y la **comisión exacta** que pagarás, ambos antes de que confirmes.
3. Confirma con aprobación biométrica. El QOR deja de generar recompensas de inmediato y vuelve a estar disponible una vez que se completa el periodo de unbonding.

### Earn

La vista **Earn** resume tus posiciones activas y tu rendimiento en un solo lugar.

## Próximos pasos

- [Enviar y Recibir](/qorex/send-and-receive) — mueve QOR y activos externos.
- [Seguridad y Recuperación](/qorex/security-and-recovery) — guardianes, herencia Legacy y vinculación de dispositivos.
