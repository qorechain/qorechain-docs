---
slug: /qorex/portfolio-and-staking
title: Portafolio y Staking
sidebar_label: Portafolio y Staking
sidebar_position: 4
---

# Portafolio y Staking

## Portafolio

La vista **Portfolio** (protegida por biometría la primera vez que la abres en cada sesión) muestra un **donut de asignación** — tu QOR unificado a través de sus tres carriles (Native, EVM, SVM) — con una leyenda debajo del anillo, además de una fila para cada activo. Los porcentajes aparecen una vez que el feed de precios está activo, y cada saldo muestra su valor estimado en USD junto con el importe en QOR. En **testnet**, QOR se muestra **sin valor en USD** — los tokens de prueba no tienen ninguno.

Usa **+ Coin or token** para añadir monedas y tokens antes de tener alguno, y **Receive** para obtener sus direcciones — consulta [Monedas y tokens](/qorex/send-and-receive#coins-and-tokens).

**De dónde viene el precio.** QoreX lo obtiene de `GET https://api.qore.network/v1/price/{symbol}` — un endpoint público nuestro, no una llamada directa a ningún exchange. Nada en tu dispositivo se comunica con una fuente de precios externa a la infraestructura de QoreChain, por lo que tu dirección IP nunca queda expuesta a una. Si genuinamente no hay disponible un precio defendible, el endpoint responde con un error en lugar de adivinar — QoreX muestra el precio como no disponible en lugar de mostrar jamás un cero fabricado o una cifra desactualizada como si fuera actual.

Toca cualquier activo para abrir el **detalle del activo**, que muestra:

- **Historial de saldo** — una tendencia real construida a partir de tus transferencias on-chain.
- **Actividad reciente** — filas de transacciones con búsqueda inversa de **@handle**, de modo que las contrapartes se muestran por nombre cuando es posible. Toca cualquier fila para abrir su detalle completo: importe, contraparte, bloque, hash de transacción y firma.

## Staking y Earn

Hacer staking de QOR ayuda a asegurar QoreChain y te otorga recompensas, que no están garantizadas. Todas las operaciones de staking son transacciones on-chain reales que llevan tu firma post-cuántica.

### Haz staking con un validador

1. Abre **Stake**.
2. Elige un validador de la lista (cargada en vivo desde la cadena, mostrando primero el de menor stake, y excluyendo cualquier validador actualmente en jail — delegar a uno de ellos nunca es lo que quieres). Los validadores con los que ya tienes QOR llevan una insignia *staked*.
3. Introduce un importe. Mientras escribes, QoreX te avisa si lo que quedaría no cubriría la siguiente comisión de red: *"This leaves \{remaining\} QOR — less than the \{fee\} QOR a transaction costs. You would not be able to unstake or claim rewards until this account holds QOR for the fee again."* (Esto deja \{remaining\} QOR — menos de los \{fee\} QOR que cuesta una transacción. No podrías deshacer el staking ni reclamar recompensas hasta que esta cuenta vuelva a tener QOR para la comisión.) Es una advertencia, no un bloqueo — es tu dinero —, pero deshacer el staking y reclamar cuestan ambos una comisión de tu saldo **líquido**, así que hacer staking hasta casi no dejar nada bloquea el stake hasta que alguien envíe QOR.
4. **Confirma** (biometría en el móvil). Puedes hacer staking de QOR en vesting, hasta tu total, pero la comisión de red debe salir de tu QOR **desbloqueado** — el QOR en vesting no puede pagar comisiones.
5. Reclama recompensas desde la misma pantalla cada vez que se acumulen — consulta más abajo.

:::note Hoy no hay periodo de bloqueo — la espera solo ocurre al salir
No hay un plazo fijo que elegir, porque ahora mismo no existe: la delegación permanece activa con recompensas fluyendo desde el siguiente bloque hasta que solicitas deshacer la delegación — no hay vencimiento que renovar ni duración mínima de staking. El único periodo de espera está a la salida: una vez que deshaces la delegación, ese QOR queda en un periodo de unbonding de 21 días, sin generar recompensas y sin poder moverse, antes de volver a tu saldo disponible. Mover una delegación a otro validador (redelegar) en cambio evita esa espera por completo. Esto describe el comportamiento actual de la cadena, no una garantía permanente — consulta [¿Existe un periodo de bloqueo?](/user-guide/staking-and-delegation#lock-in-period) para más información.
:::

### Mover el stake entre validadores (redelegar) {#move-stake}

Mueve el QOR que ya tienes en staking a un validador distinto — o repártelo entre varios — sin tocar en absoluto la cola de unbonding de 21 días. El stake sigue generando recompensas durante todo el trayecto.

1. Abre **Stake** y toca el validador con el que tu QOR está actualmente; el panel ofrece **Move stake**.
2. Elige a dónde debe ir — selecciona un único destino, o varios a la vez. Repartirlo entre varios divide el importe a partes iguales, y la cifra exacta que va a cada validador se muestra antes de confirmar.
3. Confirma con aprobación biométrica. Cada destino se mueve en una **única transacción** — una sola comisión, y o bien el movimiento completo se realiza o ninguna parte lo hace.

Este es el movimiento a realizar cuando un validador al que estás delegando entra en jail o sube su comisión — antes de que esto existiera, la única salida era deshacer la delegación y esperar 21 días sin ganar nada; mover el stake en cambio no cuesta espera ni recompensas perdidas.

:::caution Existe un límite por par, y la comisión se gasta incluso si lo alcanzas
La cadena permite como máximo **7 redelegaciones en curso a la vez para el mismo par de validadores (origen, destino)** — el uso normal no se acercará a esto, pero QoreX comprueba este límite antes de que firmes y te avisa si lo has alcanzado. Superado ese límite, la transacción falla on-chain y la comisión de red igualmente se gasta, así que no reintentes un movimiento que ya haya sido rechazado por este motivo sin esperar antes a que se libere uno existente.

Una regla más de la cadena: el stake que acabas de mover **a** un validador no puede moverse **de ahí en adelante** desde ese validador hasta que haya terminado el movimiento que lo llevó allí (21 días) — QoreX te avisa cuando se rechaza un movimiento por este motivo. Aun así puedes deshacer su staking, o mover stake que ya estaba con ese validador.
:::

### Reclamar, y Claim & restake {#claim}

- **Claim** recoge tus recompensas en tu saldo. QoreX reclama solo de los validadores que realmente tienen recompensas pendientes.
- **Claim & restake** (botón *Claim & restake*: "Compound \{amount\} QOR back to the same validators, in one transaction.", es decir, reinvertir \{amount\} QOR en los mismos validadores, en una sola transacción) reclama y delega las recompensas de vuelta directamente a los validadores que las generaron — una transacción, una comisión. Solo se ofrece cuando QoreX puede leer el desglose por validador.
- **Comprobación de comisión.** La comisión se paga *antes* de que lleguen las recompensas. Si tu QOR desbloqueado no puede cubrirla, QoreX se detiene antes de que firmes e indica cuánto se necesita ("Claiming needs about \{fee\} QOR unlocked for the network fee — it is paid before the rewards arrive.", es decir, reclamar necesita unos \{fee\} QOR desbloqueados para la comisión de red — se paga antes de que lleguen las recompensas); envía un poco de QOR a esa dirección e inténtalo de nuevo. El QOR en vesting no puede pagar comisiones.

### Deshacer la delegación (undelegate)

1. Abre **Stake** y toca el validador. Si tienes QOR con él, el panel ofrece **Unstake** (y **Move stake**).
2. Introduce el importe. El panel muestra cuánto tienes con ese validador y, encima del botón **Unstake**, "Unstaking takes 21 days before the QOR is yours to move" (Deshacer el staking tarda 21 días antes de que puedas mover el QOR) — ves la espera de 21 días antes de confirmar.
3. Confirma con aprobación biométrica. El QOR deja de generar recompensas de inmediato y vuelve a estar disponible una vez que se completa el periodo de unbonding.

### Unstaking in progress {#unbonding}

El QOR cuyo staking has deshecho sale de tu delegación y de tu saldo disponible durante 21 días. QoreX lo lista en **Unstaking in progress** — *"\{amount\} QOR unstaking"*, cada entrada con el tiempo restante (*\{days\}d \{hours\}h \{minutes\}m left*, o *Less than a minute left*, o *The wait is over — this should be back in your balance.*). Si QoreX no puede leer cuándo se completa una entrada, lo indica y mantiene el importe en el total. Si no se puede contactar con tu nodo, la lista se queda como estaba — nunca se interpreta como "nada en unstaking".

:::note Deshacer el staking cuando gestionas un validador
Si tu monedero es el de un operador de validador, se rechaza deshacer el staking cuando dejaría tu self-bond por debajo de los 100,000 QOR requeridos: *"Unstaking this much would drop your validator's self-bond below the required 100,000 QOR. The floor applies for as long as the validator operates."* (Deshacer el staking de esta cantidad dejaría el self-bond de tu validador por debajo de los 100,000 QOR requeridos. El mínimo se aplica mientras el validador esté en funcionamiento.)
:::

### Earn

La vista **Earn** resume tu staking en un solo lugar: tu QOR en staking, tus recompensas reclamables, con cuántos validadores estás y la proporción de todo el QOR que está en staking en toda la red. No muestra ninguna tasa de staking — la cadena no publica una cifra de emisión de la que derivar una tasa, así que QoreX muestra *Not available* en lugar de un número que no puede respaldar.

En la extensión, la pantalla Stake tiene las mismas piezas (total en staking, recompensas, **Claim**, **Claim & restake**, **Unstake**, **Move stake**, un selector de cuenta cuando tienes varias cuentas y la advertencia de unstake).

## Próximos pasos

- [Enviar y Recibir](/qorex/send-and-receive) — mueve QOR y activos externos.
- [Seguridad y Recuperación](/qorex/security-and-recovery) — guardianes, herencia Legacy y vinculación de dispositivos.
