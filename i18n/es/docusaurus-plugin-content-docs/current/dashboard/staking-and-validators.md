---
slug: /dashboard/staking-and-validators
title: Staking y validadores
sidebar_label: Staking y validadores
sidebar_position: 8
---

# Staking y validadores

Esta página cubre el staking desde el Dashboard: delegar tu QOR a un validador, desvincularlo y reclamar recompensas. Las acciones están en la página **Wallet** (pestañas **Stake / Delegate** y **Rewards**) en **mainnet**, con tu wallet QoreX conectada. Para comparar validadores primero, usa la página de solo lectura [Validators](/dashboard/validators). Para los conceptos detrás de la delegación y las recompensas, consulta [Staking y delegación](/user-guide/staking-and-delegation).

## Innovaciones {#innovations}

- **El Dashboard nunca guarda una clave de staking.** Compones la solicitud (qué validador, cuánto) en el Dashboard, y QoreX la reconstruye, la muestra, la firma con la firma híbrida ML-DSA-87 y la transmite. El Dashboard envía únicamente parámetros a través de un enlace `qorex://tx?...` y solo conoce el hash de la transacción. El flujo es el mismo que el del [flujo de Envío](/dashboard/wallet#send-mainnet).
- **Solo el carril nativo, de forma permanente.** El staking, la delegación y las operaciones de validador ocurren únicamente en el carril nativo (Cosmos) con la firma híbrida post-cuántica, nunca a través de un precompile de EVM. Una dirección vinculada a MetaMask puede recibir y, con una ventana EVM abierta, enviar QOR, pero no puede hacer staking. Solo puede hacerlo una dirección conectada con QoreX.
- **El orden de los validadores reparte el stake.** Solo se listan los validadores bonded y no encarcelados, de menor a mayor. El primer puesto se sortea en el servidor entre la mitad más pequeña, así que el validador más grande nunca es el predeterminado.
- **El umbral de light node es un único total.** "Currently bonded" se muestra frente al umbral de stake de light node, contado entre todos tus validadores en conjunto, de modo que un déficit puede repartirse entre validadores.
- **El tiempo de unbonding se muestra donde importa.** El periodo de unbonding de 21 días se lee de la cadena y se muestra una vez en Delegate y dos veces en Unbond, deliberadamente, porque es donde la gente lo necesita.
- **Comprobación de comisión antes de firmar.** El panel lee tu QOR disponible (excluidas las monedas en vesting y bonded) y mantiene **Continue in QoreX** deshabilitado hasta que se pueda pagar la comisión.

## Cómo usarlo {#how-to-use}

Requisitos previos: sesión iniciada, encabezado en **Mainnet**, el [reconocimiento](/dashboard/overview#risk-acknowledgement) aceptado y una wallet QoreX conectada como se describe en [Usar la Billetera en mainnet](/dashboard/wallet#mainnet).

### Elegir un validador

Abre [Validators](/dashboard/validators) para comparar comisión, poder de voto y estado. La página está en `/validators` en el Dashboard: requiere que hayas iniciado sesión, no tiene enlace en la barra lateral (escribe la dirección o sigue el enlace de aquí) y sigue la red seleccionada en el encabezado. Su columna APY se lee de la cadena y lleva la nota "variable, not guaranteed, lock bonuses not included" (o dice "From fees"); no se promete ninguna cifra. Al elegir uno, ten en cuenta:

- **Comisión:** una tasa más baja deja más recompensas para ti, pero los operadores sostenibles necesitan una parte razonable.
- **Estado:** un validador es encarcelado (jailed) cuando firma menos del 5% de los bloques en una ventana de 10,000 bloques, lo que equivale a unas 8.3 horas de bloques perdidos en mainnet con aproximadamente 3.1 segundos por bloque. Un encarcelamiento por inactividad dura un tiempo fijo de **600 segundos** y le cuesta al validador el **1% de su stake**; la doble firma es una infracción distinta, más grave, que penaliza con un **5%**. Estos son los parámetros actuales y en vivo de la cadena (comprobados el 27 de octubre de 2026).
- **Poder de voto:** distribuir el stake entre varios validadores favorece la descentralización. El orden del panel de Delegate ayuda con eso.

### Delegar {#delegate}

1. En **Wallet**, abre la pestaña **Stake / Delegate** y busca el panel **Delegate QOR**.
2. Lee el cuadro de información: **Currently bonded** frente al **Light-node threshold**, y si lo cumples. El umbral se comprueba sobre tu stake delegado total entre todos los validadores. No existe una forma de "delegar a un light node" directamente: la delegación siempre se dirige a un validador, y la elegibilidad de light node es una comprobación aparte sobre tu total.
3. Abre el desplegable **Validator** y elige uno. La primera entrada se elige al azar entre la mitad más pequeña de los validadores y puede cambiar al recargar; el resto se lista de menor a mayor stake. No se ofrecen los validadores encarcelados.
4. Introduce un **Amount (QOR)**.
5. Lee la nota debajo del importe: el unbonding tarda 21 días, y los QOR en bonding no pueden moverse ni venderse hasta que pase ese periodo.
6. Si el panel avisa de que la dirección no tiene suficiente QOR disponible para la comisión, envíale primero un poco de QOR disponible. **Continue in QoreX** permanece deshabilitado hasta que esto se resuelva.
7. Selecciona **Continue in QoreX** (muestra **Preparing...** mientras se crea la solicitud).
8. El panel muestra "Approve it in QoreX" con **Open QoreX**, el ID de la solicitud y **Approve in the browser extension** cuando se detecta la extensión. QoreX muestra el validador y el importe antes de firmar; no se envía nada hasta que lo apruebes.
9. Aprueba en QoreX. Construye, firma y transmite la delegación.

**Ejemplo mínimo:** delega 10 QOR al primer validador de la lista y aprueba en QoreX.

:::note El staking con bloqueo temporal no forma parte del Dashboard
La versión v3.2.4 añade un módulo opcional de staking con bloqueo temporal (en mainnet desde el 23 de octubre de 2026, en la testnet desde el 19 de octubre de 2026); consulta [Staking con bloqueo temporal](/user-guide/staking-and-delegation#time-locked-staking). Ni el Dashboard ni QoreX tienen una pantalla para él. Las delegaciones hechas aquí son delegaciones ordinarias sin bloqueo; la única espera es el unbonding de 21 días al salir.
:::

### Redelegar {#redelegate}

El Dashboard no tiene un panel de Redelegate. **QoreX mueve el stake entre validadores directamente** (app 1.0.8+ y extensión 0.2.6+): sin espera de unbonding de 21 días, sin recompensas perdidas, y puede repartir un movimiento entre varios validadores de destino en una sola transacción. Abre **Stake** en QoreX, toca el validador que quieres dejar y elige a dónde debe ir el stake; consulta [Mover stake entre validadores](/qorex/portfolio-and-staking#move-stake).

En una compilación de QoreX anterior sin esta función, mueve el stake en dos pasos: [anula la delegación](#undelegate), espera a que termine el periodo de unbonding (el QOR no se puede mover ni genera recompensas durante ese tiempo) y luego [delega](#delegate) al nuevo validador. Esa solución alternativa cuesta 21 días de recompensas y más comisiones, así que actualiza QoreX si puedes.

### Anular delegación {#undelegate}

:::caution Periodo de unbonding de 21 días
Los QOR con delegación anulada no llegan hoy. Primero pasan por un **periodo de unbonding de 21 días**, durante el cual no generan recompensas y no se pueden mover ni vender. El panel indica esto dos veces a propósito, una como subtítulo y otra justo encima del botón de confirmar.
:::

1. En **Wallet**, abre **Stake / Delegate** y desplázate hasta el panel **Unbond QOR**, debajo de Delegate.
2. Si no tienes delegaciones activas desde esta dirección, el panel lo indica y se detiene aquí.
3. Abre **Unbond from** y elige la delegación a reducir. Lista únicamente los validadores en los que tienes delegación, con el importe en bonding.
4. Introduce un importe, o selecciona **Unbond all X QOR** para rellenar el importe total en bonding.
5. Introducir más de lo que está en bonding bloquea el envío.
6. Lee la segunda advertencia encima del botón de confirmar: los QOR llegan en 21 días, no hoy.
7. Si la dirección no puede cubrir la comisión (las monedas en bonding no pueden pagarla), el panel avisa y deshabilita el botón.
8. Selecciona **Continue in QoreX** (**Preparing...** mientras se crea la solicitud) y luego aprueba en QoreX a través de **Open QoreX**, o **Approve in the browser extension**.

Los QOR vuelven a estar disponibles solo después de que termine el periodo de unbonding de 21 días.

### Reclamar recompensas {#claim}

1. En **Wallet**, abre la pestaña **Rewards**.
2. El panel **Staking rewards** lee tus recompensas acumuladas en todos los validadores en los que tienes delegación. Si no hay nada en staking desde esta dirección, lo indica.
3. En caso contrario, muestra el total pendiente más una línea por validador. Las recompensas se acumulan de forma continua y no se pierden por esperar.
4. Selecciona **Claim in QoreX**. Esto reclama de **todos** los validadores a la vez; no hay reclamación por validador.
5. Aprueba la reclamación en QoreX (**Open QoreX**, o **Approve in the browser extension**).

## Cómo acceder {#how-to-access}

- **Dónde:** [dashboard.qorechain.io/wallet](https://dashboard.qorechain.io/wallet), pestañas **Stake / Delegate** y **Rewards**. Se requiere iniciar sesión.
- **Red:** solo mainnet, con una wallet QoreX vinculada. Las wallets de testnet no tienen pantalla de staking.
- **Wallet:** QoreX (app o extensión). Keplr y MetaMask no pueden hacer staking desde el Dashboard.
- **Costes:** la comisión de red, pagada con QOR disponible (mínimo 0.1 uqor por gas). El Dashboard no cobra nada.
- **Fondos:** los saldos en vesting cuentan para lo que puedes delegar, pero no pueden pagar la comisión.

## Dónde está publicado {#where-published}

| Superficie | Dirección | Red |
| --- | --- | --- |
| Delegate, Unbond, Rewards | `dashboard.qorechain.io/wallet` | Mainnet |
| Comparar validadores | `dashboard.qorechain.io/validators`, consulta [Validators](/dashboard/validators) | Sigue la red del encabezado |
| Mover stake entre validadores | QoreX, consulta [Portafolio y Staking](/qorex/portfolio-and-staking#move-stake) | Mainnet |

## Límites y problemas conocidos {#limits}

- **No está en el Dashboard:** la redelegación (usa QoreX) y el staking con bloqueo temporal.
- **Sin staking en las wallets de testnet** del Dashboard.
- **Las estimaciones son aproximadas:** la estimación de la comisión y el umbral de light node que muestra el panel son valores integrados en el Dashboard, no leídos de la cadena en ese momento. QoreX muestra la comisión exacta antes de firmar.
- **El unbonding es de 21 días** y no se puede acortar.
- **Claim reclama todo.**

## Relacionado

- [Validators](/dashboard/validators) - compara validadores, comisión y rendimiento variable.
- [Staking y delegación](/user-guide/staking-and-delegation) - conceptos completos de staking.
- [Usar la Billetera en mainnet](/dashboard/wallet#mainnet) - conecta QoreX antes de hacer staking.
- [Validadores del Explorador](/dashboard/explorer#validators) - explora validadores sin wallet.
- [Nodes & Validators](/dashboard/tools-hub) - solicita ejecutar tu propio validador.
