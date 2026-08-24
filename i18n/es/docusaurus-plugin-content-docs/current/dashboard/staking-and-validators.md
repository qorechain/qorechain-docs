---
slug: /dashboard/staking-and-validators
title: Staking y validadores
sidebar_label: Staking y validadores
sidebar_position: 8
---

# Staking y validadores

La página **Validadores** (`/validators`) te permite revisar los validadores de la red — es un visor de solo lectura, sin conexión de billetera y sin botón de delegar en ella. Las acciones de staking en sí (delegar, anular delegación, reclamar) están en la página **Billetera**, en sus pestañas **Stake / Delegar** y **Recompensas**, una vez que tu billetera QoreX esté conectada allí. Delegar ayuda a asegurar la red y genera recompensas de staking. Para los conceptos detrás de la delegación y las recompensas, consulta [Staking y delegación](/user-guide/staking-and-delegation).

El staking de QoreChain se firma con criptografía post-cuántica, por lo que el panel nunca guarda una clave capaz de firmar una delegación. Cada acción de staking a continuación funciona de la misma manera: compones la solicitud en el panel (qué validador, cuánto) y luego apruebas y firmas **en tu billetera QoreX conectada** — la app o la extensión de navegador — exactamente igual que el [flujo de Envío](/dashboard/wallet#mainnet). El panel envía únicamente los parámetros a través de un enlace `qorex://tx?...`; QoreX reconstruye, firma y transmite la transacción real. Conecta tu billetera primero — consulta [Usar la Billetera en mainnet](/dashboard/wallet#mainnet).

El staking, la delegación y la validación ocurren exclusivamente en el carril nativo (Cosmos), usando la firma híbrida post-cuántica — nunca a través de un precompilado EVM. Esta es una propiedad de seguridad permanente, no una carencia temporal: el carril EVM ejecuta un único decorador ante, por lo que las comprobaciones de licencia de validador, auto-bond mínimo y PQC que sí existen en el ante del carril nativo quedarían todas eludidas si el staking se expusiera allí. Una dirección vinculada a MetaMask puede enviar y recibir QOR (consulta [Usar la Billetera en mainnet](/dashboard/wallet#mainnet)), pero no puede hacer staking — solo puede hacerlo una dirección conectada con QoreX.

## Revisar validadores

La página se abre con tarjetas de resumen del número de validadores activos, el total de QOR vinculados (bonded), la comisión media y el tiempo de actividad medio. Debajo está la lista de validadores. Cada fila de validador muestra:

- Un **rango** y el **moniker** (nombre) del validador, con su dirección y un botón de copiar.
- **Poder de voto** — el stake vinculado del validador y su participación en el total.
- **Comisión** — el porcentaje que el validador retiene de las recompensas.
- **APY** — la estimación de rendimiento anual por delegar.
- **Estado** — por ejemplo, activo o encarcelado (jailed).
- Detalles operativos: región, tiempo de actividad, bloques propuestos, versión del software y última vez visto.

Un cuadro de búsqueda filtra la lista por nombre o dirección del validador.

Esta página sirve solo para comparar validadores. Para delegar realmente en uno, ve a la página **Billetera** — ver más abajo.

## Elegir un validador

Al elegir un validador en el que delegar, ten en cuenta:

- **Comisión** — una tarifa más baja deja más recompensas para ti, pero los operadores sostenibles necesitan una parte razonable.
- **Tiempo de actividad y estado** — favorece a los validadores activos con buen tiempo de actividad; un validador encarcelado no genera ingresos. Un validador se encarcela cuando falla al firmar en más del 5% de los bloques dentro de una ventana de 10.000 bloques (aproximadamente seis horas) — no genera nada, ni para ti ni para sí mismo, hasta que corrige el problema y sale de la cárcel (unjail).
- **Poder de voto** — distribuir el stake entre varios validadores favorece la descentralización. En el panel de Delegar, los validadores se listan de menor a mayor precisamente por este motivo.

## Delegar, redelegar, anular delegación y reclamar recompensas

Las cuatro acciones están en la página **Billetera** (`/dashboard/wallet`), no en la página Validadores. Abre la billetera, conecta QoreX si aún no lo has hecho (consulta [Usar la Billetera en mainnet](/dashboard/wallet#mainnet)), y luego usa la pestaña **Stake / Delegar** para delegar y anular delegaciones, y la pestaña **Recompensas** para reclamar.

### Delegar {#delegate}

1. En la página **Billetera**, selecciona la pestaña **Stake / Delegar**.
2. En el panel **Delegar QOR**, revisa el cuadro de información en la parte superior — muestra tu total actualmente vinculado frente al umbral de stake para nodo ligero, y si ya lo cumples. Este umbral se comprueba sobre tu **stake delegado total combinado en todos los validadores**, no por validador, así que un déficit puede repartirse entre ellos — no existe una forma de "delegar a un nodo ligero" directamente, ya que la delegación siempre se dirige a un validador y la elegibilidad de nodo ligero es una comprobación aparte sobre tu total.
3. Abre el desplegable **Validador** y elige uno. Los validadores se listan de menor a mayor stake.
4. Introduce un **Importe (QOR)**.
5. Lee la nota debajo del campo de importe: la desvinculación tarda 21 días, y una vez vinculados los QOR no se pueden mover ni vender hasta que ese periodo pase.
6. Si el panel muestra una advertencia de que esta dirección no tiene suficiente QOR disponible para cubrir la comisión, envíale primero algo de QOR disponible — los QOR en vesting o vinculados no pueden pagar la comisión. El botón **Continuar en QoreX** permanece deshabilitado hasta que esto se resuelva.
7. Haz clic en **Continuar en QoreX** (muestra **Preparando…** mientras se crea la solicitud).
8. El panel ahora muestra **Apruébalo en QoreX** con un enlace **Abrir QoreX** y un ID de solicitud. QoreX te mostrará el validador y el importe antes de firmar — no se envía nada hasta que lo apruebes allí.
9. Abre QoreX (el enlace/deeplink hace esto) y aprueba la delegación. QoreX construye, firma y transmite la transacción; el panel nunca ve tu clave.

### Redelegar {#redelegate}

El contrato de solicitud subyacente ya admite mover un bono directamente de un validador a otro (`redelegate`, con un validador de origen y uno de destino que deben ser distintos) — el mismo patrón no custodial firmado por QoreX que delegar y anular delegación. A fecha de esta redacción, sin embargo, el panel aún no expone un panel o botón dedicado de Redelegar para ello.

Hasta que ese panel se publique, mueve un stake a un validador distinto en dos pasos usando los flujos de esta página:

1. **[Anula la delegación](#undelegate)** del importe en el validador que quieres dejar.
2. Espera el periodo de desvinculación mostrado en ese flujo — los QOR no son movibles ni generan ingresos durante este tiempo.
3. Una vez que los QOR desvinculados vuelvan a estar disponibles, **[delégalos](#delegate)** al nuevo validador.

Esto lleva más tiempo que una redelegación directa (sin recompensas de bonding durante la ventana de desvinculación de 21 días), así que trátalo como una vía temporal, no como la prevista. También conviene saber, en cuanto a comisiones, que una redelegación directa suele ser la más cara de estas operaciones de staking, y que el paso de anular delegación en este método alternativo ya cuesta notablemente más que una simple delegación por sí sola — la cadena mide el gas por operación en lugar de cobrar una tarifa plana, y escribir una entrada en la cola de desvinculación es trabajo extra real. Delegar por sí solo sigue siendo la más barata de las tres.

### Anular delegación {#undelegate}

Salir de una delegación ya está disponible en el panel — durante un tiempo fue posible delegar pero no anular la delegación desde aquí en absoluto, así que si recuerdas que faltaba, esa es la razón.

:::caution Periodo de desvinculación de 21 días
Los QOR con delegación anulada no llegan hoy. Primero pasan por un **periodo de desvinculación de 21 días**, durante el cual no generan recompensas y no se pueden mover ni vender. El panel indica esto dos veces a propósito — una vez como subtítulo, y otra justo encima del botón de confirmar — porque quien llega a esta pantalla con prisa (un mercado a la baja, un validador encarcelado) es exactamente quien más necesita verlo antes de firmar.
:::

1. En la página **Billetera**, selecciona la pestaña **Stake / Delegar** y desplázate hasta el panel **Anular vinculación de QOR**, debajo de Delegar. Su subtítulo ya reitera la advertencia de desvinculación de 21 días de arriba.
2. Si no tienes delegaciones activas desde esta dirección, el panel lo indica y se detiene aquí.
3. Abre el desplegable **Anular desde** y elige la delegación a reducir — lista únicamente los validadores en los que realmente tienes delegación, mostrando el importe vinculado de cada uno.
4. Introduce un **Importe (QOR)** a desvincular, o haz clic en **Anular todo `<importe>` QOR** para rellenar el importe total vinculado en ese validador.
5. Si introduces más de lo vinculado en ese validador, el panel te lo indica y bloquea el envío.
6. Justo encima del botón de confirmar, la advertencia aparece por segunda vez: los QOR llegan en 21 días, no hoy, y no generan nada hasta entonces. Esto es repetición deliberada, no un error de la documentación — léela de nuevo antes de continuar.
7. Si la dirección no puede cubrir la comisión (los QOR vinculados no pueden pagarla — necesitas algo de QOR disponible aquí primero), el panel te avisa y deshabilita el botón.
8. Haz clic en **Continuar en QoreX** (**Preparando…** mientras se crea la solicitud).
9. El panel muestra **Apruébalo en QoreX** con un enlace **Abrir QoreX** y un ID de solicitud — QoreX muestra el validador y el importe antes de que firmes.
10. Abre QoreX y aprueba. Firma y transmite la anulación de delegación; los QOR vuelven a estar disponibles solo cuando termina el periodo de desvinculación de 21 días.

### Reclamar recompensas {#claim}

1. En la página **Billetera**, selecciona la pestaña **Recompensas**.
2. El panel **Recompensas de staking** lee tus recompensas acumuladas en todos los validadores en los que tienes delegación. Si no hay nada en staking desde esta dirección, lo indica y no hay nada que reclamar.
3. En caso contrario, muestra el total pendiente de reclamar, más una línea por validador con el importe acumulado allí. Las recompensas se acumulan de forma continua y nunca se pierden por esperar — no hay plazo límite.
4. Haz clic en **Reclamar en QoreX**. Esto reclama todo a la vez: reclama las recompensas acumuladas de todos los validadores mostrados, en una sola solicitud — no hay botón de reclamo por validador.
5. Aprueba el reclamo en QoreX (a través del enlace **Abrir QoreX**) para firmarlo y transmitirlo.

:::note Periodo de desvinculación
Los QOR con delegación anulada pasan por un periodo de desvinculación de 21 días antes de volver a estar disponibles, durante el cual no generan recompensas. Consulta [Staking y delegación](/user-guide/staking-and-delegation) para más detalles.
:::

## Relacionado

- [Staking y delegación](/user-guide/staking-and-delegation) — conceptos completos de staking.
- [Usar la Billetera en mainnet](/dashboard/wallet#mainnet) — conecta QoreX antes de hacer staking.
- [Validadores del Explorador](/dashboard/explorer#validators) — explora validadores sin billetera.
- [Centro de herramientas](/dashboard/tools-hub) — solicita ejecutar tu propio validador.
