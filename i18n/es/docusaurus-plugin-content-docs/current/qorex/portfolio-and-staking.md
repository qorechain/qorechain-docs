---
slug: /qorex/portfolio-and-staking
title: Portafolio y Staking
sidebar_label: Portafolio y Staking
sidebar_position: 4
---

# Portafolio y Staking

Esta página cubre la vista Portfolio y el staking en QoreX: delegar QOR a validadores, reclamar recompensas, mover el stake, deshacer el staking y el staking con bloqueo temporal. Es para cualquiera que tenga QOR en la app móvil, en la extensión de navegador o en la extensión de Safari.

## Innovaciones {#innovations}

- **Cifras de la cadena.** El periodo de unbonding y el rendimiento base se leen de la red, no están fijados en la wallet.
- **Los movimientos que la red rechazaría se detectan antes.** Mover stake atenúa lo que no se puede mover y dice por qué, antes de gastar una comisión.
- **Las recompensas pueden ir a otra cuenta de la misma wallet,** y solo allí.
- **Sin ceros inventados.** Cuando la red no responde, QoreX muestra los últimos valores que le dieron, con su hora, o un guion.

## Portafolio

La vista **Portfolio** (protegida por biometría la primera vez que la abres en cada sesión) muestra un **donut de asignación** - tu QOR unificado a través de sus tres carriles (Native, EVM, SVM) - con una leyenda debajo del anillo, además de una fila para cada activo. Los porcentajes aparecen una vez que el feed de precios está activo, y cada saldo muestra su valor estimado en USD junto con el importe en QOR. En **testnet**, QOR se muestra **sin valor en USD** - los tokens de prueba no tienen ninguno.

Usa **+ Coin or token** para añadir monedas y tokens antes de tener alguno, y **Receive** para obtener sus direcciones - consulta [Monedas y tokens](/qorex/send-and-receive#coins-and-tokens).

**De dónde viene el precio.** QoreX lo obtiene de `GET https://api.qore.network/v1/price/{symbol}` - un endpoint público nuestro, no una llamada directa a ningún exchange. Nada en tu dispositivo se comunica con una fuente de precios externa a la infraestructura de QoreChain, por lo que tu dirección IP nunca queda expuesta a una. Si genuinamente no hay disponible un precio defendible, el endpoint responde con un error en lugar de adivinar - QoreX muestra el precio como no disponible en lugar de mostrar jamás un cero fabricado o una cifra desactualizada como si fuera actual.

Toca cualquier activo para abrir el **detalle del activo**, que muestra:

- **Historial de saldo** - una tendencia real construida a partir de tus transferencias on-chain.
- **Actividad reciente** - filas de transacciones con búsqueda inversa de **@handle**, de modo que las contrapartes se muestran por nombre cuando es posible. Toca cualquier fila para abrir su detalle completo: importe, contraparte, bloque, hash de transacción y firma.

La página de **QOR** enumera todas las transacciones de la cuenta, entrantes y salientes, con **Mostrar más** al final. Para ver todos los tipos de transacción, los estados pendiente y fallida y la exportación CSV, consulta [Historial](/qorex/send-and-receive#history). En testnet, QOR no tiene valor en dólares en Inicio ni en Portfolio.

## Cuando la red va lenta o no responde {#network-status}

- **Aviso del estado de la red.** QoreX comprueba la hora del último bloque de la cadena. Si tiene más de un minuto, un aviso dice *"La red va lenta: el bloque más reciente tiene \{seconds\} segundos. Las transacciones pueden tardar más."* Si ningún nodo responde, dice *"No se puede contactar con la red ahora. Los saldos pueden no estar actualizados."* Es la propia hora de los bloques de la cadena, no una página de estado.
- **Últimos valores conocidos.** Cuando la red no responde (por ejemplo, mientras un nodo se está reindexando o después de una actualización), la tarjeta de cuenta de la extensión y las pantallas de Inicio y Staking de la app siguen mostrando el último saldo y las últimas delegaciones que la red dio para esa cuenta, y lo dicen: *"La red no responde. Estos son los últimos valores conocidos, del \{time\}."* No se asigna ningún valor en dólares a un saldo antiguo.
- **Las recompensas que no se pudieron leer** muestran un guion, no 0 QOR, y no se ofrece **Reclamar** para ellas.

## Staking y Earn {#staking}

Hacer staking de QOR ayuda a asegurar QoreChain y te otorga recompensas, que no están garantizadas. Todas las operaciones de staking son transacciones on-chain reales en el carril nativo con firma híbrida: cada una se firma dos veces, con una clave clásica y con ML-DSA-87 (FIPS 204). El staking nunca pasa por un precompile de EVM.

### Dónde está el staking {#staking-screens}

- **App:** la pantalla **Stake** muestra tu total, tus recompensas con **Reclamar** y, debajo, los validadores. Los controles adicionales, como reclamar y volver a delegar, la dirección de recompensas y los bloqueos, se desplazan con la lista. La tabla de niveles de staking está plegada en una sola línea: tócala para abrirla.
- **Extensión y Safari:** **Staking** es un menú, y cada acción abre su propia pantalla con una explicación de una línea, sus propios mensajes de error y **Volver al stake**: **Delegar QOR**, **Retirar del staking**, **Mover stake**, **Reclamar**, **Reclamar y volver a delegar**, **Bloquear para un bono** y **Las recompensas van a**. **Reclamar** siempre aparece. Cuando tienes varias cuentas aparece un selector de cuenta.

### Haz staking con un validador

1. Abre **Stake**.
2. Elige un validador de la lista (cargada en vivo desde la cadena, mostrando primero el de menor stake, y excluyendo cualquier validador actualmente en jail - delegar a uno de ellos nunca es lo que quieres). Los validadores con los que ya tienes QOR llevan una insignia *staked*.
3. Introduce un importe. Mientras escribes, QoreX te avisa si lo que quedaría no cubriría la siguiente comisión de red: *"This leaves \{remaining\} QOR - less than the \{fee\} QOR a transaction costs. You would not be able to unstake or claim rewards until this account holds QOR for the fee again."* Es una advertencia, no un bloqueo - es tu dinero -, pero deshacer el staking y reclamar cuestan ambos una comisión de tu saldo **líquido**, así que hacer staking hasta casi no dejar nada bloquea el stake hasta que alguien envíe QOR.
4. **Confirma** (biometría en el móvil). Puedes hacer staking de QOR en vesting, hasta tu total, pero la comisión de red debe salir de tu QOR **desbloqueado** - el QOR en vesting no puede pagar comisiones.
5. Reclama recompensas cada vez que se acumulen - consulta más abajo.

En la primera transacción de una cuenta, las pantallas de staking dicen que también registra la clave ML-DSA-87 de la cuenta (una comisión de red única).

:::note La delegación ordinaria no tiene periodo de bloqueo; la espera solo ocurre al salir
Una delegación ordinaria no tiene plazo fijo: permanece activa, con recompensas fluyendo desde el siguiente bloque, hasta que solicitas deshacer la delegación. No hay vencimiento que renovar ni duración mínima de staking. El único periodo de espera está a la salida: una vez que deshaces la delegación, ese QOR queda en un **periodo de unbonding**, sin generar recompensas y sin poder moverse, antes de volver a tu saldo disponible. QoreX lee la duración de ese periodo de la red y la muestra antes de que confirmes (21 días en QoreChain en el momento de escribir esto; si no se puede leer, QoreX dice *el periodo que fija la red*). Mover una delegación a otro validador (redelegar) en cambio evita esa espera por completo. El staking con bloqueo temporal es opcional; consulta [Bloqueos de staking](#staking-locks) más abajo. Consulta también [¿Existe un periodo de bloqueo?](/user-guide/staking-and-delegation#lock-in-period).
:::


### Bloqueos de staking {#staking-locks}

Los bloqueos de staking están en la app y en las extensiones, incluido Safari. Un bloqueo es opcional. Compromete una parte de tu stake durante 3, 6 o 12 meses a cambio de una bonificación.

- **La bonificación mostrada es la que el bloqueo gana hoy**, dentro del techo que fija la red. Puede cambiar a medida que cambian las condiciones de la red, y no está garantizada.
- **El calendario de niveles está rotulado "hasta"**, con la cifra de hoy mostrada a su lado.
- **Desbloquear antes de tiempo** queda tras una segunda confirmación que nombra el coste antes de que firmes.
- **Unstake y Move stake se limitan a la parte desbloqueada** de tu stake.

Para saber cómo funciona el módulo en la cadena, consulta [Staking con bloqueo temporal](/user-guide/staking-and-delegation#time-locked-staking).

### Mover el stake entre validadores (redelegar) {#move-stake}

Mueve el QOR que ya tienes en staking a un validador distinto - o repártelo entre varios - sin pasar en absoluto por la cola de unbonding. El stake sigue generando recompensas durante todo el trayecto.

**Extensión y Safari** (Stake → **Mover stake**) te guían en tres pasos:

1. **Mover desde.** Elige el validador del que sale tu stake. Cada uno muestra *En stake \{held\} QOR · puedes mover \{free\} QOR* (y la cantidad bloqueada, si la hay). Un validador del que todavía no puedes mover aparece atenuado con la fecha: *"Podrás mover desde aquí de nuevo después del \{date\}: el stake que moviste aquí debe llegar primero."*
2. **Mover a.** Elige uno o más destinos. Un par que ya tiene el número máximo de movimientos en curso aparece desactivado (*"\{n\} movimientos en curso, la cadena permite \{max\}"*).
3. **Cuánto.** Introduce el importe o toca **Max** (la cantidad libre y desbloqueada en el origen). La ruta (*De ... a ...*) y, con varios destinos, el reparto (*\{amount\} QOR a cada uno de \{n\} validadores*) se muestran antes del botón. Cualquier error y la respuesta de la red aparecen junto al botón.

**App:** abre **Stake**, toca el validador con el que está tu QOR y elige **Mover stake**. En el validador que abres se hacen las mismas comprobaciones. Elige uno o varios destinos, introduce el importe (tiene su propio campo y **Max**), comprueba el reparto y confirma con biometría.

Repartirlo entre varios divide el importe a partes iguales, y cada destino se mueve en una **única transacción** - una sola comisión, y o bien el movimiento completo se realiza o ninguna parte lo hace.

Este es el movimiento a realizar cuando un validador al que estás delegando entra en jail o sube su comisión: mover no cuesta espera ni recompensas perdidas.

:::caution Reglas de la cadena que pueden rechazar un movimiento
- **7 movimientos en curso por par.** La cadena permite como máximo 7 redelegaciones en curso a la vez para el mismo par de validadores (origen, destino).
- **El stake movido no puede volver a moverse de inmediato.** El stake que acabas de mover **a** un validador no puede moverse **de ahí en adelante** desde ese validador hasta que haya terminado el movimiento que lo llevó allí (el periodo de unbonding de la red). Aun así puedes deshacer su staking, o mover stake que ya estaba con ese validador.

QoreX comprueba ambas antes de que firmes. Si la red aun así rechaza un movimiento, QoreX explica por qué con palabras en lugar de con un código; un movimiento rechazado on-chain ya ha pagado la comisión de red, así que no lo reintentes sin esperar.
:::

### Reclamar, y Claim & restake {#claim}

- **Claim** recoge tus recompensas en tu saldo. QoreX reclama solo de los validadores que realmente tienen recompensas pendientes.
- **Claim & restake** (botón *Claim & restake*: "Compound \{amount\} QOR back to the same validators, in one transaction.") reclama y delega las recompensas de vuelta directamente a los validadores que las generaron - una transacción, una comisión. Solo se ofrece cuando QoreX puede leer el desglose por validador. Una transacción puede cubrir **como máximo 127 validadores**; si hay más, QoreX lo dice y no firma nada.
- **Reclamar cuando cuesta más de lo que aporta.** Si la comisión de reclamo es mayor que tus recompensas, el primer toque te avisa y el botón cambia a **Reclamar de todos modos**. Las recompensas siguen creciendo si esperas.
- **Comprobación de comisión.** La comisión se paga *antes* de que lleguen las recompensas. Si tu QOR desbloqueado no puede cubrirla, QoreX se detiene antes de que firmes e indica cuánto se necesita ("Claiming needs about \{fee\} QOR unlocked for the network fee - it is paid before the rewards arrive."); envía un poco de QOR a esa dirección e inténtalo de nuevo. El QOR en vesting no puede pagar comisiones.

### Elige adónde van las recompensas {#rewards-address}

Por defecto, las recompensas van a la cuenta que las generó. Puedes enviar las recompensas **futuras** a **otra cuenta de la misma wallet**, y solo allí.

1. App: en **Stake**, abre **Las recompensas van a**. Extensión y Safari: **Staking → Las recompensas van a**. Ves adónde van ahora las recompensas.
2. Elige **Cambiar adónde van las recompensas** y selecciona una de tus cuentas.
3. El primer toque nombra la cuenta completa (*"Las recompensas futuras irán a \{name\}. Toca de nuevo para firmar."*); el segundo lo firma (firma híbrida, comisión de red normal; biometría en la app).

Tu stake no se mueve. QoreX calcula tus propias direcciones a partir de tu frase de recuperación, así que no se puede apuntar a una dirección fuera de la wallet, y los sitios web no pueden solicitar este cambio. Si las recompensas ya van a una dirección fuera de tu wallet, QoreX lo señala y ofrece enviarlas en su lugar a una de tus cuentas.

### Precio del gas y tamaño de la transacción {#gas}

QoreX lee el precio mínimo de gas actual de la red. Si la red lo sube, QoreX paga por encima del nuevo mínimo; los precios integrados en la wallet siguen siendo el suelo. La comisión que se muestra en una revisión es la que se firma. QoreChain acepta como máximo **50,000,000 de gas** en una transacción: una mayor se rechaza antes de que se firme nada y no se cobra comisión, así que divídela en partes más pequeñas (por ejemplo, reclama de menos validadores a la vez).

### Deshacer la delegación (undelegate)

1. Abre **Stake** y toca el validador. Si tienes QOR con él, el panel ofrece **Unstake** (y **Move stake**).
2. Introduce el importe. El panel muestra cuánto tienes con ese validador y, encima del botón **Unstake**, cuánto tarda el unstaking (*"Retirar la delegación tarda \{days\} hasta que puedas mover los QOR."*, con el periodo leído de la red) - ves la espera antes de confirmar.
3. Confirma con aprobación biométrica. El QOR deja de generar recompensas de inmediato y vuelve a estar disponible una vez que se completa el periodo de unbonding.

### Unstaking in progress {#unbonding}

El QOR cuyo staking has deshecho sale de tu delegación y de tu saldo disponible durante el periodo de unbonding de la red. QoreX lo lista en **Retiros de delegación en curso** - *"\{amount\} QOR en retirada"*, cada entrada con el tiempo restante (*Quedan \{days\}d \{hours\}h \{minutes\}m*, o *Queda menos de un minuto*, o *La espera terminó. Esto debería estar de vuelta en tu saldo.*). Si QoreX no puede leer cuándo se completa una entrada, lo indica y mantiene el importe en el total. Si no se puede contactar con tu nodo, la lista se queda como estaba - nunca se interpreta como "nada en unstaking".

:::note Deshacer el staking cuando gestionas un validador
Si tu monedero es el de un operador de validador, se rechaza deshacer el staking cuando dejaría tu self-bond por debajo de los 100,000 QOR requeridos: *"Unstaking this much would drop your validator's self-bond below the required 100,000 QOR. The floor applies for as long as the validator operates."*
:::

### Earn

La vista **Earn** resume tu staking en un solo lugar: tu QOR en staking, tus recompensas reclamables, con cuántos validadores estás y la proporción de todo el QOR que está en staking en toda la red.

**Rendimiento.** La tasa anual base viene de **la cifra propia de la cadena**. Se muestra *antes de la comisión del validador*, y es **variable y no está garantizada**. Si la cadena indica que las recompensas ahora vienen solo de las comisiones, QoreX dice *recompensas de comisiones* en lugar de un porcentaje. Si la cifra no se puede leer, QoreX muestra *No disponible* en lugar de un número que no puede respaldar. La bonificación de un bloqueo temporal es una cifra aparte, consulta [Bloqueos de staking](#staking-locks).

La extensión y Safari tienen las piezas del staking en pantallas separadas, consulta [Dónde está el staking](#staking-screens).

## Próximos pasos

- [Enviar y Recibir](/qorex/send-and-receive) - mueve QOR y activos externos.
- [Seguridad y Recuperación](/qorex/security-and-recovery) - guardianes, herencia Legacy y vinculación de dispositivos.

## Límites y problemas conocidos {#limits}

- Las recompensas no están garantizadas, y el rendimiento mostrado es variable y antes de la comisión.
- El QOR cuyo staking se deshace vuelve solo después del periodo de unbonding de la red (21 días en el momento de escribir esto); mover stake entre validadores no tiene espera, pero se limita a 7 movimientos en curso para el mismo par de validadores, y el stake movido no puede volver a moverse hasta que su movimiento termine.
- Las recompensas solo se pueden redirigir a otra cuenta de la misma wallet.
- Reclamar y volver a delegar cubre como máximo 127 validadores en una transacción, y ninguna transacción puede superar 50,000,000 de gas.
- El QOR en vesting puede ponerse en staking, pero no puede pagar comisiones; la comisión debe salir de QOR desbloqueado.
- Portfolio es solo móvil. En testnet, QOR no muestra valor en USD.
