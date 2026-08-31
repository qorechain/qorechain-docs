---
slug: /dashboard/staking-and-validators
title: Staking y validadores
sidebar_label: Staking y validadores
sidebar_position: 8
---

# Staking y validadores

La página **Validadores** (`/validators`) te permite revisar los validadores de la red — es un visor de solo lectura, sin conexión de billetera y sin botón de delegar en ella. Las acciones de staking en sí (delegar, anular delegación, reclamar) están en la página **Billetera**, en sus pestañas **Stake / Delegar** y **Recompensas**, una vez que tu billetera QoreX esté conectada allí. Delegar ayuda a asegurar la red y genera recompensas de staking. Para los conceptos detrás de la delegación y las recompensas, consulta [Staking y delegación](/user-guide/staking-and-delegation).

El staking de QoreChain se firma con criptografía post-cuántica, por lo que el panel nunca guarda una clave capaz de firmar una delegación. Cada acción de staking a continuación funciona de la misma manera: compones la solicitud en el panel (qué validador, cuánto) y luego apruebas y firmas **en tu billetera QoreX conectada** — la app, o la extensión de navegador a partir de la **versión 0.2.2** (consulta [qué versión está disponible dónde](/qorex/overview#platform-availability); en una compilación de extensión más antigua, el Panel te pedirá que actualices en lugar de fallar en silencio) — exactamente igual que el [flujo de Envío](/dashboard/wallet#mainnet). El panel envía únicamente los parámetros a través de un enlace `qorex://tx?...`; QoreX reconstruye, firma y transmite la transacción real. Conecta tu billetera primero — consulta [Usar la Billetera en mainnet](/dashboard/wallet#mainnet).

El staking, la delegación y la validación ocurren exclusivamente en el carril nativo (Cosmos), usando la firma híbrida post-cuántica — nunca a través de un precompilado EVM. Esta es una propiedad de seguridad permanente, no una carencia temporal: el carril EVM ejecuta un único decorador ante, por lo que las comprobaciones de licencia de validador, auto-bond mínimo y PQC que sí existen en el ante del carril nativo quedarían todas eludidas si el staking se expusiera allí. Una dirección vinculada a MetaMask puede enviar y recibir QOR (consulta [Usar la Billetera en mainnet](/dashboard/wallet#mainnet)), pero no puede hacer staking — solo puede hacerlo una dirección conectada con QoreX.

## Revisar validadores

:::caution En mainnet, esta página muestra actualmente validadores de testnet
La página **Validadores** en mainnet está mostrando el conjunto de validadores de testnet (4 nodos) en lugar del conjunto real de mainnet (8 nodos) — un problema de datos del backend, no algo mal con tu conexión o tu cuenta. No uses esta página para decidir quiénes son los validadores de mainnet; usa en su lugar el [explorador de bloques](https://explore.qore.network) o una consulta directa a la cadena (`qorechaind query staking validators`). Sin embargo, este desajuste es puramente informativo: el selector de validadores de **Delegar** en la [pestaña Stake de la página Billetera](/dashboard/wallet#mainnet) lee una ruta distinta, correcta, directamente desde la cadena, así que en realidad no puedes elegir ni delegar a un validador que no exista en mainnet — simplemente verás una lista diferente (y correcta) cuando llegues allí.
:::

La página se abre con tarjetas de resumen del número de validadores activos, el total de QOR vinculados (bonded), la comisión media y el tiempo de actividad medio. Debajo está la lista de validadores. Cada fila de validador muestra:

- Un **rango** y el **moniker** (nombre) del validador, con su dirección y un botón de copiar.
- **Poder de voto** — el stake vinculado del validador y su participación en el total.
- **Comisión** — el porcentaje que el validador retiene de las recompensas.
- **APY** — se muestra como una raya (—) en lugar de un número. La emisión de QoreChain proviene de un módulo personalizado que el endpoint estándar de estimación de rendimiento no puede ver, así que una cifra calculada aquí sería una suposición disfrazada de dato; mostrarla como no disponible fue una corrección deliberada, no un error. Actualmente no existe un endpoint para calcular un APY de staking en vivo y respaldado por la cadena — trata cualquier porcentaje concreto que veas citado en otro lugar como no verificado, y no supongas que un número que aparezca aquí más adelante sea automáticamente correcto: la fórmula subyacente asume la vía de inflación estándar de Cosmos, que no es como la emisión de esta cadena llega realmente a quienes hacen staking, y habría que comprobarla contra el mecanismo real antes de confiar en ella.
- **Estado** — por ejemplo, activo o encarcelado (jailed).
- Detalles operativos: región, tiempo de actividad, bloques propuestos, versión del software y última vez visto.

Un cuadro de búsqueda filtra la lista por nombre o dirección del validador.

Esta página sirve solo para comparar validadores. Para delegar realmente en uno, ve a la página **Billetera** — ver más abajo.

## Elegir un validador

Al elegir un validador en el que delegar, ten en cuenta:

- **Comisión** — una tarifa más baja deja más recompensas para ti, pero los operadores sostenibles necesitan una parte razonable.
- **Tiempo de actividad y estado** — favorece a los validadores activos con buen tiempo de actividad; un validador encarcelado no genera ingresos. Un validador se encarcela cuando falla al firmar en más del 5% de los bloques dentro de una ventana de 10.000 bloques (aproximadamente seis horas para acumularse) — no genera nada, ni para ti ni para sí mismo, hasta que sale de la cárcel (unjail). Un encarcelamiento por inactividad dura un tiempo fijo de **600 segundos (10 minutos)** y le cuesta al validador el **1% de su stake**; la doble firma (double-signing) es una infracción distinta, más grave, que penaliza con un **5%**. Estas cifras son los parámetros actuales y en vivo de la cadena — considera cualquier cifra más antigua que veas en otro lugar como superada.
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

El panel en sí no tiene un panel dedicado de Redelegar — pero ya no lo necesitas. **QoreX ahora mueve el stake entre validadores directamente** (app 1.0.8+ y extensión 0.2.6+): sin espera de desvinculación de 21 días, sin recompensas perdidas, e incluso puede repartir un movimiento entre varios validadores de destino en una sola transacción. Abre **Stake** en QoreX, toca el validador que quieres dejar y elige a dónde debe ir el stake — consulta [Mover stake entre validadores](/qorex/portfolio-and-staking#move-stake) para el recorrido completo. Esta es una mejor solución que cualquier cosa que el propio contrato de solicitud del panel pudiera ofrecer, así que usa QoreX directamente para esto en lugar de la solución alternativa de abajo.

Si tienes una compilación de QoreX anterior sin esta función todavía, mueve un stake a un validador distinto en dos pasos usando los flujos de esta página en su lugar:

1. **[Anula la delegación](#undelegate)** del importe en el validador que quieres dejar.
2. Espera el periodo de desvinculación mostrado en ese flujo — los QOR no son movibles ni generan ingresos durante este tiempo.
3. Una vez que los QOR desvinculados vuelvan a estar disponibles, **[delégalos](#delegate)** al nuevo validador.

Esta solución alternativa cuesta 21 días de recompensas perdidas y más en comisiones que un movimiento directo, así que actualiza QoreX en lugar de depender de ella si puedes.

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
