---
slug: /qorex/portfolio-and-staking
title: Portafolio y Staking
sidebar_label: Portafolio y Staking
sidebar_position: 4
---

# Portafolio y Staking

Esta página cubre la vista Portfolio y el staking en QoreX: delegar QOR a validadores, reclamar recompensas, mover el stake, deshacer el staking y, en las versiones que lo incluyen, el staking con bloqueo temporal. Es para cualquiera que tenga QOR en la app móvil o en la extensión.

## Portafolio

La vista **Portfolio** (protegida por biometría la primera vez que la abres en cada sesión) muestra un **donut de asignación** - tu QOR unificado a través de sus tres carriles (Native, EVM, SVM) - con una leyenda debajo del anillo, además de una fila para cada activo. Los porcentajes aparecen una vez que el feed de precios está activo, y cada saldo muestra su valor estimado en USD junto con el importe en QOR. En **testnet**, QOR se muestra **sin valor en USD** - los tokens de prueba no tienen ninguno.

Usa **+ Coin or token** para añadir monedas y tokens antes de tener alguno, y **Receive** para obtener sus direcciones - consulta [Monedas y tokens](/qorex/send-and-receive#coins-and-tokens).

**De dónde viene el precio.** QoreX lo obtiene de `GET https://api.qore.network/v1/price/{symbol}` - un endpoint público nuestro, no una llamada directa a ningún exchange. Nada en tu dispositivo se comunica con una fuente de precios externa a la infraestructura de QoreChain, por lo que tu dirección IP nunca queda expuesta a una. Si genuinamente no hay disponible un precio defendible, el endpoint responde con un error en lugar de adivinar - QoreX muestra el precio como no disponible en lugar de mostrar jamás un cero fabricado o una cifra desactualizada como si fuera actual.

Toca cualquier activo para abrir el **detalle del activo**, que muestra:

- **Historial de saldo** - una tendencia real construida a partir de tus transferencias on-chain.
- **Actividad reciente** - filas de transacciones con búsqueda inversa de **@handle**, de modo que las contrapartes se muestran por nombre cuando es posible. Toca cualquier fila para abrir su detalle completo: importe, contraparte, bloque, hash de transacción y firma.

## Staking y Earn

Hacer staking de QOR ayuda a asegurar QoreChain y te otorga recompensas, que no están garantizadas. Todas las operaciones de staking son transacciones on-chain reales en el carril nativo con firma híbrida: cada una se firma dos veces, con una clave clásica y con ML-DSA-87 (FIPS 204). El staking nunca pasa por un precompile de EVM.

### Haz staking con un validador

1. Abre **Stake**.
2. Elige un validador de la lista (cargada en vivo desde la cadena, mostrando primero el de menor stake, y excluyendo cualquier validador actualmente en jail - delegar a uno de ellos nunca es lo que quieres). Los validadores con los que ya tienes QOR llevan una insignia *staked*.
3. Introduce un importe. Mientras escribes, QoreX te avisa si lo que quedaría no cubriría la siguiente comisión de red: *"This leaves \{remaining\} QOR - less than the \{fee\} QOR a transaction costs. You would not be able to unstake or claim rewards until this account holds QOR for the fee again."* Es una advertencia, no un bloqueo - es tu dinero -, pero deshacer el staking y reclamar cuestan ambos una comisión de tu saldo **líquido**, así que hacer staking hasta casi no dejar nada bloquea el stake hasta que alguien envíe QOR.
4. **Confirma** (biometría en el móvil). Puedes hacer staking de QOR en vesting, hasta tu total, pero la comisión de red debe salir de tu QOR **desbloqueado** - el QOR en vesting no puede pagar comisiones.
5. Reclama recompensas desde la misma pantalla cada vez que se acumulen - consulta más abajo.

:::note La delegación ordinaria no tiene periodo de bloqueo; la espera solo ocurre al salir
Una delegación ordinaria no tiene plazo fijo: permanece activa, con recompensas fluyendo desde el siguiente bloque, hasta que solicitas deshacer la delegación. No hay vencimiento que renovar ni duración mínima de staking. El único periodo de espera está a la salida: una vez que deshaces la delegación, ese QOR queda en un periodo de unbonding de 21 días, sin generar recompensas y sin poder moverse, antes de volver a tu saldo disponible. Mover una delegación a otro validador (redelegar) en cambio evita esa espera por completo. La versión de cadena v3.2.4 (en mainnet desde el 23 de octubre de 2026) añade una forma opcional de staking con bloqueo temporal, que las versiones más recientes de QoreX pueden usar: consulta [Bloqueos de staking](#staking-locks) más abajo. En las versiones que no lo incluyen (iOS 1.1.8, Chrome 0.3.8, Safari 0.3.8), toda delegación que haces es una delegación ordinaria, sin bloqueo. Consulta también [¿Existe un periodo de bloqueo?](/user-guide/staking-and-delegation#lock-in-period).
:::


### Bloqueos de staking {#staking-locks}

Los bloqueos de staking están hoy en Android 1.1.9 y en la extensión de Firefox 0.3.9; iOS, Chrome y Safari los recibirán cuando sus tiendas sirvan esas versiones. Un bloqueo es opcional. Compromete una parte de tu stake durante 3, 6 o 12 meses a cambio de una bonificación.

- **La bonificación mostrada es la que el bloqueo gana hoy**, dentro del techo que fija la red. Puede cambiar a medida que cambian las condiciones de la red, y no está garantizada.
- **El calendario de niveles está rotulado "hasta"**, con la cifra de hoy mostrada a su lado.
- **Desbloquear antes de tiempo** queda tras una segunda confirmación que nombra el coste antes de que firmes.
- **Unstake y Move stake se limitan a la parte desbloqueada** de tu stake.

Para saber cómo funciona el módulo en la cadena, consulta [Staking con bloqueo temporal](/user-guide/staking-and-delegation#time-locked-staking).

### Mover el stake entre validadores (redelegar) {#move-stake}

Mueve el QOR que ya tienes en staking a un validador distinto - o repártelo entre varios - sin tocar en absoluto la cola de unbonding de 21 días. El stake sigue generando recompensas durante todo el trayecto.

1. Abre **Stake** y toca el validador con el que tu QOR está actualmente; el panel ofrece **Move stake**.
2. Elige a dónde debe ir - selecciona un único destino, o varios a la vez. Repartirlo entre varios divide el importe a partes iguales, y la cifra exacta que va a cada validador se muestra antes de confirmar.
3. Confirma con aprobación biométrica. Cada destino se mueve en una **única transacción** - una sola comisión, y o bien el movimiento completo se realiza o ninguna parte lo hace.

Este es el movimiento a realizar cuando un validador al que estás delegando entra en jail o sube su comisión - antes de que esto existiera, la única salida era deshacer la delegación y esperar 21 días sin ganar nada; mover el stake en cambio no cuesta espera ni recompensas perdidas.

:::caution Existe un límite por par, y la comisión se gasta incluso si lo alcanzas
La cadena permite como máximo **7 redelegaciones en curso a la vez para el mismo par de validadores (origen, destino)** - el uso normal no se acercará a esto, pero QoreX comprueba este límite antes de que firmes y te avisa si lo has alcanzado. Superado ese límite, la transacción falla on-chain y la comisión de red igualmente se gasta, así que no reintentes un movimiento que ya haya sido rechazado por este motivo sin esperar antes a que se libere uno existente.

Una regla más de la cadena: el stake que acabas de mover **a** un validador no puede moverse **de ahí en adelante** desde ese validador hasta que haya terminado el movimiento que lo llevó allí (21 días) - QoreX te avisa cuando se rechaza un movimiento por este motivo. Aun así puedes deshacer su staking, o mover stake que ya estaba con ese validador.
:::

### Reclamar, y Claim & restake {#claim}

- **Claim** recoge tus recompensas en tu saldo. QoreX reclama solo de los validadores que realmente tienen recompensas pendientes.
- **Claim & restake** (botón *Claim & restake*: "Compound \{amount\} QOR back to the same validators, in one transaction.") reclama y delega las recompensas de vuelta directamente a los validadores que las generaron - una transacción, una comisión. Solo se ofrece cuando QoreX puede leer el desglose por validador.
- **Comprobación de comisión.** La comisión se paga *antes* de que lleguen las recompensas. Si tu QOR desbloqueado no puede cubrirla, QoreX se detiene antes de que firmes e indica cuánto se necesita ("Claiming needs about \{fee\} QOR unlocked for the network fee - it is paid before the rewards arrive."); envía un poco de QOR a esa dirección e inténtalo de nuevo. El QOR en vesting no puede pagar comisiones.

### Deshacer la delegación (undelegate)

1. Abre **Stake** y toca el validador. Si tienes QOR con él, el panel ofrece **Unstake** (y **Move stake**).
2. Introduce el importe. El panel muestra cuánto tienes con ese validador y, encima del botón **Unstake**, "Unstaking takes 21 days before the QOR is yours to move" - ves la espera de 21 días antes de confirmar.
3. Confirma con aprobación biométrica. El QOR deja de generar recompensas de inmediato y vuelve a estar disponible una vez que se completa el periodo de unbonding.

### Unstaking in progress {#unbonding}

El QOR cuyo staking has deshecho sale de tu delegación y de tu saldo disponible durante 21 días. QoreX lo lista en **Unstaking in progress** - *"\{amount\} QOR unstaking"*, cada entrada con el tiempo restante (*\{days\}d \{hours\}h \{minutes\}m left*, o *Less than a minute left*, o *The wait is over - this should be back in your balance.*). Si QoreX no puede leer cuándo se completa una entrada, lo indica y mantiene el importe en el total. Si no se puede contactar con tu nodo, la lista se queda como estaba - nunca se interpreta como "nada en unstaking".

:::note Deshacer el staking cuando gestionas un validador
Si tu monedero es el de un operador de validador, se rechaza deshacer el staking cuando dejaría tu self-bond por debajo de los 100,000 QOR requeridos: *"Unstaking this much would drop your validator's self-bond below the required 100,000 QOR. The floor applies for as long as the validator operates."*
:::

### Earn

La vista **Earn** resume tu staking en un solo lugar: tu QOR en staking, tus recompensas reclamables, con cuántos validadores estás y la proporción de todo el QOR que está en staking en toda la red. No muestra ninguna tasa de staking: la cadena no publica una cifra de emisión de la que derivar una tasa, así que QoreX muestra *Not available* en lugar de un número que no puede respaldar.

En la extensión, la pantalla Stake tiene las mismas piezas (total en staking, recompensas, **Claim**, **Claim & restake**, **Unstake**, **Move stake**, un selector de cuenta cuando tienes varias cuentas y la advertencia de unstake).

## Próximos pasos

- [Enviar y Recibir](/qorex/send-and-receive) - mueve QOR y activos externos.
- [Seguridad y Recuperación](/qorex/security-and-recovery) - guardianes, herencia Legacy y vinculación de dispositivos.

## Límites y problemas conocidos {#limits}

- Las recompensas no están garantizadas. QoreX no muestra ninguna tasa de staking global.
- Los bloqueos de staking no están en iOS 1.1.8, Chrome 0.3.8 ni Safari 0.3.8.
- El QOR cuyo staking se deshace tarda 21 días en volver; mover stake entre validadores no tiene espera, pero se limita a 7 redelegaciones en curso para el mismo par de validadores.
- El QOR en vesting puede ponerse en staking, pero no puede pagar comisiones; la comisión debe salir de QOR desbloqueado.
- Portfolio es solo móvil. En testnet, QOR no muestra valor en USD.
