---
slug: /dashboard/wallet
title: Monedero
sidebar_label: Monedero
sidebar_position: 3
---

# Monedero

La página **Monedero** es donde consultas tu saldo y tu historial de transacciones, recibes QOR y (en mainnet) preparas envíos y acciones de staking. Es para cualquiera que tenga QOR y quiera un único lugar donde ver una cuenta en los tres carriles. Su funcionamiento depende de la red:

- **Mainnet no tiene custodia.** El Panel no guarda claves de mainnet. Conectas tu propio monedero (**QoreX**, **Keplr** o **MetaMask**) y la página lee tu saldo y tu historial reales desde la cadena. Los envíos y el staking en el carril Native se preparan en la página y se firman en **QoreX**, porque las cuentas de QoreChain firman con una firma híbrida post-cuántica que genera QoreX. Keplr se conecta para consultar y recibir. MetaMask se conecta en el carril EVM; para enviar desde ahí hace falta una clave post-cuántica registrada y una ventana de autorización EVM abierta, que se abre desde QoreX (consulta [Envío con MetaMask](#send-metamask)).
- **Testnet tiene custodia.** El Panel crea y guarda monederos de prueba para tu cuenta, de modo que puedes enviar y recibir QOR de prueba sin instalar nada. No hay pantalla de staking para los monederos de testnet.

## Innovaciones {#innovations}

- **Una cuenta, tres codificaciones.** La página deriva las formas `qor1...`, `0x...` y base58 de SVM de la misma cuenta, y lee el saldo y el historial una sola vez, a través de `qor1...`. Las filas del historial llevan una insignia Native, EVM o SVM.
- **El Panel nunca firma en mainnet.** Para un envío, una delegación, una retirada de delegación o un cobro, solo pasa a QoreX los parámetros y la red, nunca una transacción ya preparada. QoreX reconstruye la transacción, la muestra completa, la firma con la firma híbrida ML-DSA-87 y la transmite. El Panel solo llega a conocer el hash de la transacción.
- **Anclaje de @handle.** La dirección de un handle resuelto se recuerda en este navegador solo después de que la confirmes. Si más tarde el handle se resuelve a una dirección distinta, el flujo se detiene y muestra ambas direcciones completas.
- **Comprobación de comisión antes del staking.** La página lee de la cadena el QOR disponible (sin el que está en vesting) y el estado de la clave ML-DSA-87 de la cuenta, y mantiene Submit desactivado si la comisión no se puede pagar.
- **La advertencia de dirección de prueba está donde copias.** «Test address, never send real QOR here.» aparece junto a la dirección, en My Wallets y en Receive, porque las direcciones de testnet y de mainnet son idénticas a la vista.
- **Exportación de la frase de recuperación con comprobación.** En testnet, revelar una frase exige un inicio de sesión reciente, las 24 palabras se muestran durante 60 segundos y la copia de seguridad solo cuenta como confirmada cuando escribes las palabras 3, 5 y 9.

## Cómo usarlo {#how-to-use}

### Una cuenta, tres codificaciones {#one-account-three-encodings}

Una cuenta de QoreChain es una identidad única escrita de tres maneras, una por cada carril de ejecución:

| Carril | Codificación | Aspecto |
| --- | --- | --- |
| **Native QOR** | bech32 | `qor1...` |
| **EVM** | hex | `0x...` |
| **SVM** | base58 | p. ej. `5Gv7...` |

Las tres apuntan a la **misma cuenta y al mismo saldo**. Los fondos recibidos en cualquier carril llegan a un único saldo, y el Panel indexa el saldo y el historial mediante la codificación `qor1`, de modo que la actividad de todos los carriles aparece junta.

### Usa el Monedero en mainnet {#mainnet}

Requisitos previos: haber iniciado sesión, tener la cabecera en **Mainnet**, haber aceptado el [reconocimiento único](/dashboard/overview#risk-acknowledgement) y, para enviar o hacer staking, tener la app o la extensión de QoreX.

1. Abre **Monedero**. Si todavía no hay ningún monedero conectado, una tarjeta «Connect your wallet» muestra la tarjeta **QoreX wallet** con **Connect with QoreX** y, debajo, en «or connect another wallet», **Connect Keplr** y **Connect MetaMask**.
2. Conecta un monedero (pasos más abajo). Phantom no puede conectarse aquí; consulta [Firmantes vinculados](#linked-signers).
3. La página carga tu saldo y tu historial reales desde la cadena.

Una vez conectada, la página tiene seis pestañas: **Wallet**, **Send from QoreX**, **Stake / Delegate**, **Rewards**, **Details** y **Connect Wallets**.

- **Wallet:** una fila **Viewing** de chips de monedero (solo cuando hay más de un monedero vinculado), **Total Balance**, **Receive** y **Assets & Activity** con las últimas 10 transacciones.
- **Send from QoreX, Stake / Delegate, Rewards:** funcionan a través de QoreX aunque también tengas conectado Keplr o MetaMask. Los pasos de staking están en [Staking y validadores](/dashboard/staking-and-validators).
- **Details:** tus direcciones Native, EVM y SVM, y **Linked addresses** (renombrar, marcar como predeterminada, controlable en QoreX o solo de observación).
- **Connect Wallets:** los monederos conectados (haz clic en uno para verlo, en X para desvincularlo), las cuentas de QoreX sin vincular con **Link this account**, **+ QoreX**, **+ Keplr**, **+ MetaMask** y el panel [Añade QoreChain a tu monedero](#add-network).

Si tu monedero todavía no tiene QoreChain configurado, añádelo primero, consulta [Añade QoreChain a tu monedero](#add-network).

#### Conéctate con QoreX, extensión de navegador {#connect-qorex-extension}

1. En la página Monedero, busca la tarjeta **QoreX wallet** y selecciona **Connect with QoreX**.
2. Como se detecta la extensión de QoreX, el Panel te pregunta cómo quieres conectarte. Selecciona **Browser extension**.
3. La extensión abre una ventana emergente de aprobación que muestra `dashboard.qorechain.io` como el sitio solicitante.
4. Apruébala. Esto firma una prueba única de que eres dueño de tu dirección `qor1...`; no se mueven fondos y no se concede ningún otro permiso.
5. La ventana emergente se cierra y el Panel muestra **Connected: qor1...**. La elección se guarda, de modo que la próxima conexión en este navegador la reutiliza sin preguntar. Un enlace **Use a different method** aparece solo mientras hay un emparejamiento pendiente.

Puedes vincular más de una dirección de QoreX a la misma cuenta del Panel (por ejemplo una de una extensión de Firefox y otra de Chrome, o un teléfono y un portátil). Selecciona **Add another wallet** para repetir el flujo; a cada dirección vinculada se le puede dar una etiqueta y una se marca como predeterminada para enviar, ambas cosas desde la pestaña **Connect Wallets**.

**Cambiar entre monederos en la pestaña Wallet.** Con más de un monedero vinculado, la fila de chips **Viewing** te permite cambiar de qué monedero ves el saldo y el historial sin salir de la pestaña. La fila se oculta cuando solo hay un monedero vinculado.

**Cuentas de tu extensión de QoreX que todavía no están vinculadas.** Una frase de recuperación puede derivar varias cuentas, y crear una en QoreX no se lo comunica al Panel. Cuando la extensión puede listar sus cuentas, las pestañas **Wallet**, **Details** y **Connect Wallets** muestran una tarjeta como «2 accounts in your QoreX extension are not linked here», con el saldo de cada cuenta (y cuánto está en staking, lo cual no se puede enviar). Selecciona **Link this account** para emparejarla; vincular no concede ningún control sobre tus claves. Si tu versión de QoreX no puede elegir qué cuenta demostrar, desde aquí solo se puede vincular la cuenta activa.

#### Conéctate con QoreX, app móvil {#connect-qorex-app}

1. En la página Monedero, selecciona **Connect with QoreX** en la tarjeta **QoreX wallet**.
2. Si aparece el selector, elige **QoreX app** (si no se detecta ninguna extensión, el Panel va directo a este flujo).
3. El Panel muestra un código QR y **Open QoreX**, y consulta el estado («Waiting for approval in QoreX...»).
4. En tu teléfono, escanea el código QR en QoreX o toca **Open QoreX** si navegas desde el mismo teléfono (abre la app mediante su enlace `qorex://connect`).
5. QoreX muestra la solicitud de emparejamiento con el origen del Panel. Aprueba con Face ID, Touch ID o PIN.
6. En un par de segundos, el Panel muestra **Connected: qor1...**.

#### Conéctate con Keplr {#connect-keplr}

Keplr se conecta para consultar tu saldo y tu historial en el carril Native y para recibir. Enviar y hacer staking usan QoreX.

1. En la página Monedero, selecciona **Connect Keplr**.
2. Si QoreChain no está configurado en Keplr, el Panel activa el aviso `suggestChain` de Keplr. Revisa el ID de cadena y los endpoints y selecciona **Approve**.
3. Elige la cuenta y aprueba la conexión.
4. El Panel lee tu dirección `qor1...` y carga tu saldo y tu historial.

Phantom no puede conectarse como monedero en la página Monedero de mainnet. Las direcciones de Phantom vinculadas anteriormente siguen apareciendo en **Connected wallets**; para vincular una clave de Phantom como firmante, consulta [Firmantes vinculados (Phantom)](#linked-signers).

#### Conéctate con MetaMask {#connect-metamask}

1. En la página Monedero, selecciona **Connect MetaMask**.
2. Si la red EVM de QoreChain todavía no está añadida, MetaMask muestra su aviso **Add network** (EIP-3085) con el ID de cadena, la URL de RPC y el símbolo ya rellenados. Selecciona **Approve** y luego **Switch network**.
3. Selecciona la cuenta y **Connect**.
4. El Panel lee tu dirección `0x...` y carga tu saldo y tu historial.

### Envía en mainnet {#send-mainnet}

Cada envío se prepara en el Panel pero se finaliza en tu propio monedero. En el **carril Native**, ese monedero es siempre **QoreX**. En el **carril EVM**, firma MetaMask, siempre que la cuenta ya tenga una clave post-cuántica y una ventana EVM abierta (consulta [Envío con MetaMask](#send-metamask)).

:::caution Fondos reales, transferencias irreversibles
Las transacciones de mainnet son irreversibles. Verifica dos veces el destinatario antes de aprobar.
:::

:::note Saldos en vesting
Si parte de tu saldo todavía está en vesting, cuenta para lo que puedes delegar, pero no puede pagar una comisión de transacción. Para eso necesitas QOR disponible por separado, incluido para registrar una clave post-cuántica. Un monedero financiado solo con su importe en vesting puede delegar pero no puede enviar.
:::

#### Envía con QoreX, paso a paso

1. En la tarjeta **Send from QoreX**, elige opcionalmente **Send from** (cuando has vinculado más de un monedero de QoreX) e introduce el destinatario (una dirección `qor1...` o un `@handle`), el **Amount (QOR)** y un **Memo** opcional.
2. Selecciona **Continue in QoreX**.
3. Aprueba, de una de estas formas:
   - **Extensión de navegador:** selecciona **Approve in browser extension**. La ventana emergente de la extensión muestra la transferencia decodificada por completo (destinatario e importe). Apruébala con el propio desbloqueo de tu extensión. La extensión firma con la firma híbrida post-cuántica y transmite directamente a la cadena.
   - **App móvil:** escanea el código QR con QoreX, o selecciona **Open in QoreX** (una solicitud `qorex://tx`) en el mismo teléfono. QoreX decodifica la solicitud, muestra destinatario e importe, y apruebas con tu biométrico. QoreX firma y transmite.
4. La página muestra «Transfer confirmed» con el hash de la transacción (ábrelo en el [Explorador](/dashboard/explorer)) y luego **New transfer**. En la ruta de la app, el Panel consulta el resultado.

**Ejemplo mínimo:** Connect with QoreX (app, escanea el código QR), luego Send from QoreX con un destinatario `qor1...` y un importe de 1, selecciona **Continue in QoreX** y aprueba en QoreX.

#### Enviar a un @handle

El campo de destinatario también acepta un `@handle`. Lo que ocurre a continuación depende de si ya le has pagado a ese handle antes desde este navegador:

- **Primera vez:** la dirección resuelta se muestra por completo con «First time sending to @handle from this browser. Check the address before you continue:», y debes confirmarla antes de usarla. La dirección se ancla solo después de que la confirmes.
- **La misma dirección que antes:** pasa con una confirmación ligera.
- **Una dirección distinta a la anterior:** el flujo se detiene. Se muestran por completo tanto la dirección anterior como la nueva, con una advertencia explícita de que la dirección cambió, y un botón de estilo secundario para continuar de todos modos.

El anclaje vive solo en tu navegador, de modo que otro ordenador o un navegador con los datos borrados vuelve a mostrar «primera vez». Los handles tienen entre 3 y 20 caracteres (`a-z`, `0-9`, `_`) y pertenecen a una dirección. Si la búsqueda de handles no está disponible temporalmente, el campo lo indica y aun así puedes enviar a una dirección `qor1...`.

#### Envío con MetaMask {#send-metamask}

:::caution Desde la cadena v3.2.0, MetaMask por sí solo no puede enviar en mainnet
El carril EVM admite una transacción solo de una cuenta que tenga una clave post-cuántica registrada y una **ventana de autorización EVM abierta**: un permiso acotado en tiempo, número y valor que se abre con un mensaje que lleva una firma híbrida ML-DSA-87 (FIPS 204). MetaMask no puede producir ese mensaje. Sin una ventana, la cadena rechaza la transacción (errores típicos: no window, window exhausted, no post-quantum key).
:::

1. En **QoreX**, registra la clave post-cuántica de la cuenta si no tiene ninguna (tu primera transferencia desde QoreX con esa cuenta lo hace) y luego abre una ventana de autorización EVM, consulta [Ventana de acceso EVM](/qorex/security-and-recovery#evm-window). Esto es para la **cuenta de estilo Ethereum (coin 60)** que comparte la clave de MetaMask: añádela en QoreX con **Add an Ethereum account (coin 60)** usando la misma frase de recuperación ([cómo](/qorex/getting-started#restore-dashboard)). Ninguna clave de MetaMask puede enviar desde una cuenta `qor1...` ordinaria de coin 118.
2. Una ventana está acotada por bloques (como máximo 17,280, unas 15 horas en mainnet), por número de transacciones (como máximo 1,000) y por un tope de gasto en QOR que cuenta cada importe **más** su comisión máxima. Mantén los límites pequeños: mientras hay una ventana abierta, las transacciones de MetaMask mueven QOR sin una firma post-cuántica. Abrir una ventana nueva sustituye a la anterior y avanza el nonce de la cuenta, así que ábrela **antes** de enviar desde MetaMask (una transacción preparada antes falla con «nonce too low»). Desde v3.2.3 la cadena también admite ventanas más estrechas y acotadas; QoreX todavía no ofrece una pantalla para ellas.
3. Abre MetaMask y confirma que está configurado en la red EVM de QoreChain.
4. Selecciona **Send** dentro de MetaMask, introduce el destinatario `0x...` y el importe, revisa el gas y confirma.
5. De vuelta en el Panel, la transacción aparece en tu historial en cuanto está en la cadena (actualiza si hace falta).

Cada transacción consume parte de la ventana; cuando se alcanza su límite de tiempo, de número de transacciones o de valor, abre una nueva en QoreX, y cierra la ventana cuando hayas terminado.

### Recibe {#receive-mainnet}

1. Selecciona **Receive**.
2. Elige un carril con el selector: **Native QOR**, **EVM** o **SVM**.
3. El modal muestra tu dirección en esa codificación con un código QR y un botón de copiado.
4. Solo en el carril Native, **Payment Request Options** (importe, memo) generan un enlace `qorechain:` que puedes copiar.

Sea cual sea el carril que use el remitente, los fondos llegan a la misma cuenta.

### Lee tu historial de transacciones {#history}

En mainnet, la lista **Assets & Activity** muestra las **últimas 10** transacciones. Cada fila tiene:

- una **insignia de carril** (Native, EVM o SVM);
- **Sent** o **Received** para las transferencias ordinarias, y una etiqueta descriptiva para otra actividad (por ejemplo *PQC key registration* o una acción de contrato);
- el importe, la hora, un estado **Confirmed** o **Failed** y un hash que puedes abrir en el [Explorador](/dashboard/explorer). Para actividad más antigua, abre tu dirección en el Explorador.

### Usa el Monedero en testnet {#testnet}

En testnet (`qorechain-diana`) el Panel gestiona monederos de prueba por ti. Testnet no tiene conexión con QoreX ni pantalla de staking.

**Primera visita:** crea un monedero o importa una frase de 24 palabras.

**Tarjeta principal:** la etiqueta del monedero, la dirección con un botón de copiado, **Total Balance**, **Send**, **Receive** y **My Wallets**, un indicador de última actualización con refresco, y **Assets & Activity** con una pestaña **Transaction history** y una pestaña **Tokens**.

La pestaña **Tokens** lista solo los tokens emitidos mediante despliegues del Panel. Los tokens de prueba del evento del [Faucet](/dashboard/faucet#fest-tokens) nunca aparecen ahí; compruébalos con una consulta de saldo de bank o en el [Explorador](/dashboard/explorer).

:::caution Las direcciones de testnet son idénticas a las de mainnet
Testnet y mainnet usan el mismo formato `qor1...`, de modo que una dirección de testnet puede pegarse en un formulario de retiro o en otro monedero sin ningún aviso, y el QOR real enviado a ella llega a **mainnet**, a esa dirección, donde esta página de testnet no puede mostrarlo. No envíes nunca QOR real a una dirección de testnet. El Panel repite la advertencia junto a la dirección en la página Monedero, en **My Wallets** y en **Receive**. Si ya has enviado QOR real a una dirección de testnet, contacta con soporte y no intentes moverlo tú mismo.
:::

#### Envía QOR (testnet)

1. Selecciona **Send**.
2. Elige un **Asset** (QOR, o un token emitido mediante el Panel).
3. Introduce la **Recipient Address** (se sugieren contactos guardados y direcciones recientes mientras escribes) y el **Amount** (o **MAX**), más un **Memo** opcional.
4. Selecciona **Review Transaction**, revisa los detalles y la comisión estimada, y luego **Confirm & Send**.
5. Recibes una confirmación con el hash, y se ofrece «Save this address?» para guardar al destinatario como contacto.

**Ejemplo mínimo:** cambia a Testnet, crea un monedero, reclama del [Faucet](/dashboard/faucet) y luego envía 1 QOR a otra dirección.

#### Recibe QOR (testnet)

1. Selecciona **Receive**.
2. Comparte la dirección o el código QR, o copia la dirección.
3. Opcionalmente rellena **Payment Request Options** (importe, memo) para generar un enlace de pago; usa **Copy Link** o **Save Image**.

#### Gestiona tus monederos de prueba

**My Wallets** abre tu lista de direcciones: cambia entre monederos, crea, importa o elimina uno. El monedero activo es el que se usa para las acciones firmadas en testnet en todo el Panel.

#### Haz una copia de seguridad o exporta la frase de recuperación de un monedero de prueba {#reveal-recovery-phrase}

En testnet el Panel gestiona tus monederos, pero puedes exportar la frase de recuperación de 24 palabras de un monedero para importarla en un monedero de autocustodia como QoreX.

1. En la página **Monedero** de testnet, busca la tarjeta **Recovery phrase**. Lista tus monederos gestionados por el Panel con su saldo de **mainnet** (los monederos con fondos primero), para que puedas elegir el que contiene tus tokens.
2. Selecciona **Reveal**, lee la advertencia («Reveal the phrase for ...?») y selecciona **Continue**.
3. Inicia sesión de nuevo cuando se te pida (se requiere una nueva comprobación de contraseña; el Panel nunca ve tu contraseña). Vuelves al monedero automáticamente.
4. Las 24 palabras se muestran durante 60 segundos, con un botón **Copy phrase**. Anótalas y guárdalas sin conexión. La cuenta atrás se pausa mientras marcas la casilla de confirmación o escribes en los campos de comprobación.
5. Marca **I have written down my recovery phrase and stored it somewhere safe**, escribe las palabras **3**, **5** y **9** (marcadas como *Required*) y selecciona **Confirm backup**. Verás «Recovery phrase saved».
6. Si sales con **Hide without confirming** (o se agota el temporizador), la tarjeta muestra «Backup not confirmed» y ofrece **Reveal again and confirm**.

Cualquiera que tenga estas 24 palabras controla el monedero. QoreChain nunca puede recuperarlas ni restablecerlas por ti, y el soporte nunca te las pedirá.

### Añade QoreChain a tu monedero {#add-network}

El panel **Add QoreChain to your wallet** (en mainnet está en la pestaña **Connect Wallets** y debajo de los botones de conexión hasta que se conecta un monedero; en testnet, al final de la página) tiene cuatro tarjetas:

| Tarjeta | Qué te ofrece | Botones |
| --- | --- | --- |
| **Native (Cosmos) wallets** | Endpoints RPC y REST y el ID de cadena, cada uno con un botón de copiado. | **Add to Keplr**, **Add to Cosmostation** (la etiqueta sigue al monedero detectado) |
| **EVM wallets** | Parámetros de red EIP-3085. | **Add to EVM wallet** (o **Add to MetaMask / Rabby**, según los monederos detectados) |
| **SVM wallets** | La URL RPC de SVM para ajustes de RPC personalizado. | **Copy SVM RPC URL** |
| **Mobile wallets (WalletConnect)** | Un emparejamiento WalletConnect v2. | **Create pairing QR** |

1. Busca el panel y elige la tarjeta que corresponde al carril de tu monedero.
2. Selecciona el botón de añadir, o copia los endpoints y el ID de cadena en el formulario de añadir red de tu monedero.
3. Aprueba la nueva red en tu monedero.

Los endpoints públicos son `rpc.qore.host` (RPC Native), `api.qore.host` (REST), `evm.qore.host` (JSON-RPC EVM) y `svm.qore.host` (RPC SVM), con variantes `*-testnet` (por ejemplo `rpc-testnet.qore.host`). IDs de cadena: mainnet `qorechain-vladi` (ID de cadena EVM `9801`), testnet `qorechain-diana` (ID de cadena EVM `9800`).

### Firmantes vinculados (Phantom) {#linked-signers}

La tarjeta **SVM wallets** también te permite vincular una clave de Phantom a tu cuenta como **firmante vinculado**: un autenticador con límite de tiempo (30 días) y revocable, no un monedero principal independiente. Selecciona **Connect Phantom** y luego **Register authenticator**. El registro debe firmarse con **Keplr** (el Panel necesita tener Keplr conectado para esto), y Phantom nunca se convierte en su propia identidad.

:::caution La disponibilidad del registro difiere según la red
Las funciones de cuenta inteligente y de monedero vinculado de la cadena están activadas en testnet y desactivadas en mainnet (`GET /qorechain/abstractaccount/v1/config` devuelve `enabled: true` en testnet y `enabled: false` en mainnet, comprobado el 27 de octubre de 2026). En mainnet la cadena rechaza nuevos registros de firmantes vinculados; trata la tarjeta como una vista previa allí.
:::

:::caution Un firmante vinculado es autoridad real sobre la cuenta
El permiso que concedes decide en qué carril puede actuar la clave, no cuánto puede mover, y un registro sigue siendo válido durante 30 días. Vincula solo una clave en la que confíes tanto como en la propia cuenta, y revócala cuando ya no la necesites.
:::

Para conocer el modelo de permisos y límites de gasto, consulta [Firmantes vinculados y límites de gasto](/qorex/security-and-recovery#linked-signers) en la documentación de QoreX.

## Cómo acceder {#how-to-access}

- **URL:** [dashboard.qorechain.io/wallet](https://dashboard.qorechain.io/wallet). Se requiere iniciar sesión: sin sesión, la página redirige al inicio de sesión.
- **Red:** el selector de la cabecera decide qué vista obtienes (mainnet sin custodia, testnet con custodia). En mainnet, acepta primero el reconocimiento único.
- **Monederos:** no hace falta ninguno en testnet. En mainnet usa QoreX (app o extensión) para enviar y hacer staking; Keplr o MetaMask para consultar y recibir.
- **Costes:** ninguno por parte del Panel. Las transacciones en cadena pagan la comisión de red (mínimo 0.1 uqor por gas).
- **Fondos:** QOR de testnet desde el [Faucet](/dashboard/faucet). El QOR de mainnet debe estar ya en tu cuenta.

## Dónde está publicado {#where-published}

| Superficie | Dirección | Redes | Notas |
| --- | --- | --- | --- |
| Página Monedero | `dashboard.qorechain.io/wallet` | Mainnet (sin custodia) y testnet (con custodia) | Requiere iniciar sesión |
| Conexión y envío con QoreX | App y extensión de QoreX (consulta [QoreX](/qorex/overview)) | Solo mainnet | Los flujos de QoreX del Panel están fijados a mainnet |
| Panel para añadir la red | En la página Monedero | Ambas | También en la vista general del [Explorador](/dashboard/explorer) |

## Límites y problemas conocidos {#limits}

- **Testnet no tiene interfaz de staking ni conexión con QoreX.** El staking y la pestaña Rewards son solo de mainnet.
- **El historial de mainnet son las últimas 10 transacciones.** Abre la dirección en el Explorador para ver más.
- **Keplr y MetaMask:** Keplr puede consultar y recibir; MetaMask puede consultar y recibir, y envía desde dentro de MetaMask una vez que hay una ventana EVM abierta. Ninguno envía ni hace staking en el carril Native desde el Panel.
- **Phantom** no puede conectarse; las direcciones de Phantom vinculadas anteriormente siguen listadas.
- **El registro de firmantes vinculados** funciona en testnet y está desactivado en mainnet; necesita que Keplr firme.
- **No está en el Panel:** la redelegación (hazla en QoreX), una pantalla de staking con bloqueo temporal y una lista de tokens en mainnet.
- **La pestaña Tokens en testnet** muestra solo los tokens emitidos por el Panel, no los tokens del evento.

## Relacionado

- [Token Operations](/user-guide/token-operations) - conceptos detrás de las transferencias y denominaciones de QOR.
- [Staking y validadores](/dashboard/staking-and-validators) - delega, retira la delegación y cobra desde la página Monedero.
- [Trade](/dashboard/trade) - la pantalla de swap de tokens de prueba.
