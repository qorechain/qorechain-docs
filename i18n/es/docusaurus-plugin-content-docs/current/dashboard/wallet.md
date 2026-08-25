---
slug: /dashboard/wallet
title: Monedero
sidebar_label: Monedero
sidebar_position: 3
---

# Monedero

La página **Monedero** es donde consultas tu saldo y tu historial de transacciones, recibes QOR y lo envías. El funcionamiento de la página depende de la red:

- **Mainnet — sin custodia.** El Panel no guarda las claves de mainnet. Conectas tu propio monedero — **QoreX** (el monedero oficial de QoreChain, como extensión o como app), **Keplr** o **MetaMask** — tu saldo y tu historial reales se leen directamente desde la cadena, y puedes recibir fondos en cualquier carril. Enviar y hacer staking en el **carril Native requieren QoreX**: las cuentas de QoreChain firman con una firma híbrida post-cuántica, y QoreX es el monedero que la genera, de modo que las pestañas Enviar y Stake / Delegar del Panel funcionan a través de QoreX sin importar qué otro monedero también tengas conectado. Keplr puede seguir conectado para consultar tu saldo en el carril Native (`qor1...`) y para recibir fondos en él. **MetaMask** firma y envía de forma independiente en el **carril EVM** (`0x...`), que usa una firma clásica y no se ve afectado por esto.
- **Testnet — con custodia.** El Panel gestiona un monedero de prueba por ti, para que puedas probar transferencias, swaps y staking sin ninguna configuración. Fóndalo desde el [Faucet](/dashboard/faucet).

Las cuentas están protegidas con criptografía resistente a la computación cuántica, y la codificación Native de cada dirección usa el prefijo bech32 `qor` (`qor1...`).

## Una cuenta, tres codificaciones {#one-account-three-encodings}

Una cuenta de QoreChain es una identidad única que puede escribirse de tres maneras — una por cada carril de ejecución:

| Carril | Codificación | Aspecto |
| --- | --- | --- |
| **Native QOR** | bech32 | `qor1...` |
| **EVM** | hex | `0x...` |
| **SVM** | base58 | p. ej. `5Gv7...` |

Las tres codificaciones apuntan a la **misma cuenta y al mismo saldo**. Los fondos recibidos en cualquier carril llegan a tu único saldo, y el Panel indexa el saldo y el historial mediante la codificación `qor1` (Native), de modo que la actividad de todos los carriles aparece junta.

## Usa el Monedero en mainnet {#mainnet}

1. Cambia la cabecera del Panel a **Mainnet**.
2. Si se te solicita, acepta el [reconocimiento de riesgo único](/dashboard/overview#risk-acknowledgement) — mainnet mueve fondos reales, el Panel no tiene custodia y las transacciones son irreversibles.
3. Selecciona **Connect Wallet** y elige un monedero — **QoreX** (recomendado, el monedero oficial de QoreChain — necesario para enviar y hacer staking en el carril Native), **Keplr** (para consultar/recibir en el carril Native) o **MetaMask** (para conectar, enviar y recibir en el carril EVM). Más abajo encontrarás los pasos detallados para cada uno.
4. La página carga tu saldo y tu historial de transacciones reales desde la cadena.

Una vez conectada, la página Monedero organiza todo en seis pestañas: **Monedero** (saldo y resumen de la cuenta), **Enviar desde QoreX**, **Stake / Delegar**, **Recompensas**, **Detalles** (tus direcciones `qor1...` / `0x...` / SVM) y **Conectar monederos** (todos los monederos que has vinculado, y desde donde conectas más). Las pestañas Enviar, Stake / Delegar y Recompensas funcionan a través de QoreX — esto es así incluso si también tienes Keplr o MetaMask conectados, porque las transacciones del carril Native necesitan la firma híbrida post-cuántica que produce QoreX.

Si tu monedero todavía no tiene QoreChain configurado, añádelo primero — consulta [Añade QoreChain a tu monedero](#add-network).

### Conéctate con QoreX — extensión de navegador {#connect-qorex-extension}

1. En la página Monedero, busca la tarjeta **QoreX wallet** y selecciona **Connect with QoreX**.
2. Como la extensión de QoreX (0.1.4 o posterior) se detecta en este navegador, el Panel te pregunta cómo quieres conectarte. Selecciona **Browser extension**.
3. La extensión de QoreX abre su propia ventana emergente de aprobación, mostrando `dashboard.qorechain.io` como el sitio que solicita la conexión.
4. Revisa la solicitud en la ventana emergente y apruébala — esto firma una prueba única de que eres dueño de tu dirección `qor1...`; no se mueven fondos y no se concede ningún otro permiso.
5. La ventana emergente se cierra y el Panel muestra **Connected: qor1...** en la tarjeta de QoreX, y tu dirección desbloquea el resto de la página Monedero. La elección de extensión/app se recuerda, de modo que la próxima vez que selecciones **Connect with QoreX** en este navegador se reconecta de la misma forma sin preguntar — usa **Use a different method** en la tarjeta de conexión si alguna vez quieres cambiar.

Puedes vincular más de una dirección de QoreX a la misma cuenta del Panel — por ejemplo una de una extensión de Firefox y otra de Chrome, o un teléfono y un portátil. Selecciona **Add another wallet** para repetir el flujo con una segunda dirección; a cada dirección vinculada se le puede asignar su propia etiqueta, y una se marca como predeterminada para enviar, ambas cosas desde la pestaña **Conectar monederos**.

**Cambiar entre monederos en la pestaña Monedero.** En cuanto hay más de un monedero vinculado — QoreX y MetaMask, o dos direcciones de QoreX — aparece una fila de chips de monedero en la parte superior de la propia pestaña **Monedero**, uno por cada monedero vinculado, con el activo marcado. Haz clic en un chip para cambiar de qué monedero estás viendo el saldo y el historial, sin salir de la pestaña ni ir a **Conectar monederos**. La fila se oculta cuando solo hay un monedero vinculado, ya que un selector no tendría nada que hacer.

### Conéctate con QoreX — app móvil {#connect-qorex-app}

1. En la página Monedero, busca la tarjeta **QoreX wallet** y selecciona **Connect with QoreX**.
2. Si aparece el selector de extensión, selecciona **QoreX app** (si no se detecta ninguna extensión en este navegador, el Panel va directo a este flujo).
3. El Panel muestra un código QR y un enlace **Open QoreX**.
4. En tu teléfono, abre la app de QoreX y escanea el código QR con ella — o, si estás navegando desde el mismo teléfono, toca **Open QoreX** para abrir la app directamente a través de su enlace `qorex://connect`.
5. QoreX muestra la solicitud de emparejamiento con el origen del Panel. Revísala y apruébala con tu confirmación biométrica (Face ID / Touch ID / PIN).
6. El Panel sondea la aprobación en segundo plano; en un par de segundos muestra **Connected: qor1...** en la tarjeta de QoreX, y tu dirección desbloquea el resto de la página Monedero.

### Conéctate con Keplr {#connect-keplr}

Keplr se conecta para consultar tu saldo, historial y dirección de recepción en el carril Native. Enviar y hacer staking en el carril Native usan QoreX (ver más abajo) — las cuentas de QoreChain firman con una firma híbrida post-cuántica, por lo que las pestañas Enviar y Stake / Delegar del Panel funcionan a través de QoreX en lugar de a través del monedero que conectaste aquí.

1. En la página Monedero, selecciona **Connect Wallet** y elige **Keplr**.
2. Si QoreChain todavía no está configurado en Keplr, el Panel activa el aviso `suggestChain` de Keplr — revisa los detalles de la red (chain ID, endpoints RPC/REST) en la ventana emergente de Keplr y selecciona **Approve** para añadirla.
3. Keplr te pide entonces que selecciones la cuenta a conectar y que apruebes la conexión — selecciona **Approve**.
4. El Panel lee tu dirección `qor1...` y carga tu saldo y tu historial.

### Conéctate con MetaMask {#connect-metamask}

1. En la página Monedero, selecciona **Connect Wallet** y elige **MetaMask**.
2. Si la red EVM de QoreChain todavía no está añadida, MetaMask muestra su aviso **Add network** (EIP-3085) con el chain ID, la URL de RPC y el símbolo de moneda ya rellenados — revísalo y selecciona **Approve**, y luego **Switch network**.
3. MetaMask pregunta qué cuenta conectar — selecciona la cuenta y confirma con **Connect**.
4. El Panel lee tu dirección `0x...` y carga tu saldo y tu historial.

### Envía en mainnet {#send-mainnet}

Como el Panel nunca guarda tus claves de mainnet, cada envío se compone en el Panel pero se finaliza en tu propio monedero. En el **carril Native**, ese monedero es siempre **QoreX** — las pestañas Enviar y Stake / Delegar funcionan a través de él sin importar qué otro monedero también tengas conectado, porque las cuentas de QoreChain firman con una firma híbrida post-cuántica. En el **carril EVM**, MetaMask firma y envía de forma independiente.

:::caution Fondos reales, transferencias irreversibles
Las transacciones de mainnet son irreversibles. Verifica siempre dos veces la dirección del destinatario antes de aprobar.
:::

:::note Saldos en vesting
Si parte de tu saldo todavía está en vesting, cuenta para lo que puedes delegar en staking, pero no puede pagar una comisión de transacción — para eso necesitas QOR disponible por separado, incluido para registrar una clave PQC. Un monedero financiado solo con su importe en vesting puede delegar pero no puede enviar.
:::

#### Envía con QoreX — extensión de navegador

1. En la página Monedero, en la tarjeta **Enviar desde QoreX**, introduce el destinatario (una dirección `qor1...` o un `@handle`), el importe en QOR y un memo opcional.
2. Selecciona **Continuar en QoreX**.
3. El Panel muestra un botón **Aprobar en la extensión del navegador** — selecciónalo.
4. La extensión de QoreX abre su ventana emergente de aprobación con la transferencia decodificada por completo — destinatario e importe. Revísala y apruébala usando la seguridad propia de la extensión (desbloqueo biométrico o por contraseña).
5. La extensión firma la transferencia con una firma PQC híbrida y la transmite directamente a la cadena — el Panel solo llega a conocer el hash de transacción resultante.
6. La página Monedero muestra **Transferencia confirmada** con el hash de la transacción, que puedes abrir en el [Explorador](/dashboard/explorer).

#### Envía con QoreX — app móvil

1. En la página Monedero, en la tarjeta **Enviar desde QoreX**, introduce el destinatario (una dirección `qor1...` o un `@handle`), el importe en QOR y un memo opcional.
2. Selecciona **Continuar en QoreX**.
3. El Panel muestra un código QR y un enlace **Abrir QoreX** que lleva una solicitud `qorex://tx`.
4. Escanea el código QR con la app de QoreX, o toca **Abrir QoreX** si estás en el mismo teléfono.
5. QoreX decodifica la solicitud y muestra el destinatario y el importe por completo. Revísala y apruébala con tu confirmación biométrica.
6. QoreX firma la transferencia con una firma PQC híbrida y la transmite.
7. El Panel sondea el resultado y muestra **Transferencia confirmada** con el hash de la transacción en cuanto llega a la cadena, que puedes abrir en el [Explorador](/dashboard/explorer).

#### Enviar a un @handle

El campo de destinatario en la tarjeta **Enviar desde QoreX** también acepta un `@handle` en lugar de una dirección `qor1...`. Lo que ocurre a continuación depende de si ya le has pagado a ese handle antes desde este navegador:

- **Primera vez**: la dirección resuelta se muestra por completo, y debes seleccionar **Confirmar dirección** antes de que pueda usarse — la dirección solo se recuerda (se fija) después de que la confirmes, no en el momento en que se resuelve.
- **La misma dirección que antes**: pasa con una confirmación ligera — no hace falta volver a escribirla.
- **Una dirección distinta a la anterior**: el flujo se detiene por completo. Tanto la dirección anterior como la nueva se muestran por completo — nunca truncadas, ya que truncar oculta precisamente los caracteres del medio que un atacante intentaría hacer parecer similares — con una advertencia explícita de que la dirección cambió, y un botón **deliberadamente con estilo secundario** para continuar de todos modos.

Este anclaje se almacena solo en tu propio navegador, no en ningún servidor, de modo que un ordenador distinto o un navegador con la caché borrada vuelve a mostrar «primera vez» de nuevo — esto es intencionado. Los handles tienen entre 3 y 20 caracteres (`a-z`, `0-9`, `_`) y pertenecen a una dirección concreta, de modo que alguien con varias direcciones puede usar un handle distinto en cada una.

#### Envía con MetaMask

1. Abre MetaMask y confirma que está configurado en la red EVM de QoreChain.
2. Selecciona **Send** dentro de MetaMask.
3. Introduce la dirección `0x...` del destinatario y el importe.
4. Revisa la comisión de gas y confirma para firmar y transmitir.
5. De vuelta en la página Monedero del Panel, la transacción aparece en tu historial en cuanto está en la cadena (actualiza si todavía no ha aparecido).

### Recibe en un carril específico {#receive-mainnet}

1. Selecciona **Receive**.
2. En el modal de recepción, elige un carril con el selector: **Native QOR**, **EVM** o **SVM**.
3. El modal muestra tu dirección en la codificación de ese carril (`qor1...`, `0x...` o base58) con un código QR y un botón de copiado.
4. Copia la dirección, o deja que el remitente escanee el código QR.

Sea cual sea el carril que use el remitente, los fondos llegan a la misma cuenta — una cuenta, tres codificaciones, un solo saldo.

### Lee tu historial de transacciones {#history}

En mainnet, cada fila de tu historial muestra:

- Una **insignia de carril** — Native, EVM o SVM — que te indica qué carril usó la transacción.
- Una **etiqueta real del tipo de transacción**, como *Send*, *registro de clave PQC* o *despliegue de contrato*, en lugar de una etiqueta genérica.
- El importe, la hora y el estado, con el hash de la transacción que puedes abrir en el [Explorador](/dashboard/explorer).

## Usa el Monedero en testnet {#testnet}

En testnet (`qorechain-diana`) el Panel gestiona un monedero de prueba por ti, para que puedas probar los flujos de principio a fin sin conectar nada.

### Qué muestra la página

- La etiqueta de tu monedero y la dirección activa, en forma abreviada, con un botón de copiado de un clic.
- Tu **saldo total** en QOR.
- Un panel de seguridad que indica el cifrado resistente a la computación cuántica y la red conectada.
- Un indicador de última actualización con un control de refresco.
- Las pestañas **Assets** y **Activity**, que muestran tus tenencias y tu historial de transacciones.

Usa el control de refresco en cualquier momento para obtener de la cadena tu saldo actual y tu actividad más reciente.

### Envía QOR (testnet)

1. Selecciona **Send**.
2. Introduce la dirección del destinatario (`qor1...`).
3. Introduce el importe y, opcionalmente, un memo.
4. Revisa los detalles y la comisión estimada, y luego confirma.

Mientras escribes un destinatario, se sugieren contactos guardados y direcciones recientes para ayudarte a evitar errores. Una vez enviada la transferencia, recibes una confirmación con el hash de la transacción, que puedes abrir en el [Explorador](/dashboard/explorer).

### Recibe QOR (testnet)

1. Selecciona **Receive**.
2. Comparte tu dirección o su código QR con el remitente, o copia la dirección con un clic.
3. Opcionalmente, introduce un importe solicitado y un memo para generar un enlace de pago y un código QR descargable.

### Gestiona tus monederos de prueba

Selecciona **My Wallets** para abrir tu lista de direcciones. Desde allí puedes cambiar entre monederos, crear un monedero nuevo, importar uno existente o eliminar un monedero que ya no necesites. El monedero activo es el que se usa para enviar, hacer swaps, hacer staking y otras acciones firmadas en todo el Panel en testnet.

## Añade QoreChain a tu monedero {#add-network}

La página **Add Network** muestra cuatro tarjetas lado a lado — una por cada forma de conexión — para que puedas añadir QoreChain a tu propio monedero con un clic:

| Tarjeta | Qué te ofrece |
| --- | --- |
| **Native** | Endpoints RPC y REST más el ID de cadena, cada uno con un botón de copiado — para Keplr y otros monederos del carril Native. |
| **EVM** | Parámetros de red EIP-3085 listos para usar — un clic añade QoreChain a MetaMask y otros monederos EVM. |
| **SVM** | La URL RPC de SVM para monederos y herramientas compatibles con SVM. |
| **WalletConnect** | Un emparejamiento WalletConnect para vincular cualquier monedero compatible con WalletConnect. |

Para añadir QoreChain:

1. Abre la página **Add Network** desde el Panel.
2. Elige la tarjeta que corresponde al carril de tu monedero.
3. Selecciona el botón de añadir (EVM, WalletConnect), o copia los endpoints y el ID de cadena en el formulario de añadir red de tu monedero (Native, SVM).
4. Aprueba la nueva red en tu monedero.

Los endpoints públicos son `rpc.qore.host` (RPC Native), `api.qore.host` (REST), `evm.qore.host` (JSON-RPC EVM) y `svm.qore.host` (RPC SVM), con variantes `*-testnet` (por ejemplo `rpc-testnet.qore.host`) para testnet. IDs de cadena: mainnet `qorechain-vladi` (ID de cadena EVM `9801`), testnet `qorechain-diana` (ID de cadena EVM `9800`).

### Firmantes vinculados (Phantom) {#linked-signers}

La tarjeta **SVM** también te permite vincular una clave de Phantom a tu cuenta como **firmante vinculado** — un autenticador de gasto delegado y revocable, no una conexión de monedero principal independiente como QoreX, Keplr o MetaMask. Tu monedero existente firma el registro; Phantom nunca se convierte en su propia identidad. Para conocer el modelo de permisos y límites de gasto en cadena que hay detrás, consulta [Firmantes vinculados y límites de gasto](/qorex/security-and-recovery#linked-signers) en la documentación de QoreX.

## Relacionado

- [Token Operations](/user-guide/token-operations) — conceptos detrás de las transferencias y denominaciones de QOR.
- [Trade](/dashboard/trade) — intercambia tus tokens en el AMM en cadena.
- [Bridge](/dashboard/bridge) — mueve activos hacia y desde otras cadenas.
