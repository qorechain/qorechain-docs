---
slug: /qorex/send-and-receive
title: Enviar y recibir
sidebar_label: Enviar y recibir
sidebar_position: 3
---

# Enviar y recibir

Esta página cubre cómo enviar y recibir QOR, pagar a un @handle, las solicitudes de pago, los contactos, el historial de transacciones, tener activos en otras redes y los extras de la pantalla de inicio. Es para quien usa la app móvil de QoreX (la extensión tiene las mismas pantallas de Enviar y Recibir, consulta [Extensión de navegador](/qorex/browser-extension)). Cuando algo difiere entre la app, la extensión de navegador y la extensión de Safari, el texto lo dice.

## Innovaciones {#innovations}

- **Solicitudes de pago firmadas.** Una solicitud es un enlace firmado con tu propia clave de cuenta. Quien la paga ve que QoreX comprueba la firma, la red exacta y cualquier @handle antes de que aparezca la revisión normal, así que un importe o un destinatario modificados se ven en lugar de pasar en silencio. Consulta [Solicitudes de pago](#payment-requests).
- **Estado leído de la cadena.** Una transferencia está *pendiente*, *confirmada* o *fallida* porque la red lo dice, y una solicitud de pago se marca como *pagada* solo cuando la cadena muestra un pago que coincide. Consulta [Historial](#history).
- **Aviso de direcciones parecidas.** Una dirección que solo se parece a una que ya conoces se señala antes de que envíes. Consulta [Contactos y favoritos](#contacts).
- **Advertencias de comisión en lenguaje claro.** QoreX te dice cuándo la comisión es mayor que el importe que envías, y muestra en tu primer envío la comisión única de registro de la clave y el total.

La pestaña Inicio (Wallet) es tu punto de partida. Muestra una **insignia de red** (MAINNET de forma predeterminada, o TESTNET si activaste el interruptor de desarrollador), tu **saldo total** (toca para ocultar/mostrar) y las acciones principales: **Enviar · Recibir · Swap · Stake** (**Swap** no se muestra en iOS). Tu lista de activos muestra **QOR** (un saldo unificado en los carriles Nativo, EVM y SVM, que se envía por el carril nativo con firma híbrida) y **Todas las redes** (una vista unificada de ETH, BNB, POL, ARB y las demás [redes externas](#external-networks-tokens) que admite QoreX).

## Enviar QOR por el carril nativo con firma híbrida

1. Toca **Enviar**.
2. Introduce el destinatario como una dirección `qor1…` **o** un **@handle**. Un handle se resuelve y se verifica criptográficamente (firma del registro + firma del propietario + anclaje en el primer uso); si la clave de un handle cambia alguna vez de forma silenciosa, QoreX muestra una advertencia explícita.
3. Introduce el importe. La vista previa muestra el destinatario, el importe, la **comisión de red** y el estado de la firma (si la transferencia lleva la capa ML-DSA-87).
4. Confirma con la aprobación **biométrica**. Cada transferencia nativa de QOR se firma dos veces: con una clave clásica y con ML-DSA-87 (FIPS 204). QoreX firma con esa firma híbrida obligatoria y la difunde por el carril nativo. Tras la difusión, comprueba que la transacción confirmada lleva la capa ML-DSA-87 y te avisa si no es así.

En la primera pantalla, el cuadro de relleno rápido (**Ask QoreX**) te permite escribir una petición sencilla como "send 50 QOR to @maria" y rellena el formulario por ti. Es un simple lector de texto que se ejecuta **por completo en tu dispositivo** - nada de lo que escribes ahí se envía a ninguna parte, y no es un asistente de IA (QoreX no tiene ninguno). Sigues revisando todo y confirmando con biometría como de costumbre; si no puede leer lo que escribiste, lo dice y rellenas el formulario a mano. Tus contactos favoritos y los destinatarios recientes aparecen como chips de un toque (consulta [Contactos y favoritos](#contacts)).

QoreChain no registra tu clave ML-DSA-87 por sí sola. QoreX lo hace por ti como parte de tu **primera** transferencia (una pequeña comisión de red de una sola vez), y puedes ver el estado en [Seguridad y recuperación](/qorex/security-and-recovery#pqc-key). No se necesita ningún paso adicional en QoreX.

**La revisión de un primer envío muestra el coste desde el principio.** Además del importe y la **Comisión de red**, la revisión enumera *Registro único de la clave ML-DSA-87* con su comisión y luego **Total de comisiones**, así que no hay sorpresas después de confirmar. Los envíos posteriores desde la misma cuenta muestran solo la comisión de red.

**Comisión mayor que el importe.** Si la comisión de red es mayor que el importe que envías, la revisión lo dice (*"La comisión de red ... es mayor que la cantidad que envías ..."*) como precaución. Nunca bloquea el envío. QoreX lo muestra en los envíos nativos de QOR y en la moneda propia de una red externa cuando la comisión se cotiza en esa moneda. Reclamar recompensas de staking tiene la misma comprobación, consulta [Portafolio y Staking](/qorex/portfolio-and-staking#claim).

### Enviar a un @handle, paso a paso {#handle-send}

1. Abre **Enviar** y escribe `@` seguido del handle (por ejemplo `@liviu`) en el campo de destinatario en lugar de una dirección.
2. QoreX busca el handle y te muestra la **dirección `qor1…` resuelta** antes de que confirmes nada. (Reclamar tu propio handle requiere una cuenta con sesión iniciada y se hace en la app - consulta [@handle](/qorex/account-and-dashboard#handle).)
3. Comprueba la dirección resuelta, introduce el importe y confirma como de costumbre.

QoreX solo acepta una resolución que supere **ambas** comprobaciones que realiza: una atestación del registro verificada frente a una clave de confianza fijada en la app, y la propia firma del propietario del handle sobre la reclamación. Si falla cualquiera de las dos comprobaciones, se produce un error en lugar de recurrir a una dirección no verificada. La primera vez que pagas a un handle determinado, QoreX recuerda la dirección a la que se resolvió; si la dirección de ese handle cambia alguna vez, QoreX se detiene antes de firmar y te muestra la dirección antigua y la nueva una junto a la otra para que decidas si quieres continuar. Esta memoria es **por dispositivo** - pagar al mismo handle por primera vez desde otro teléfono o una instalación nueva lo muestra como nuevo también ahí, lo cual es lo esperado, no un error. La extensión de navegador resuelve y paga handles de la misma manera (su memoria es **por navegador**, así que un navegador o equipo distinto lo verá como nuevo) - consulta [Enviar a un @handle](/qorex/browser-extension#handle-send).

### Enviar QOR en proceso de consolidación (bloqueado) {#vesting}

Si parte de tu saldo todavía está en proceso de **consolidación (vesting)** - por ejemplo, una asignación de TGE aún no liberada - tu total se divide en **disponible ahora** y **todavía bloqueado**. Solo puedes enviar la parte disponible; QoreX rechaza por sí mismo un intento de gasto excesivo en lugar de dejar que la red lo rechace después de cobrar una comisión. La parte bloqueada se vuelve gastable gradualmente a medida que el calendario de consolidación la va liberando. Esta división se muestra en todos los lugares donde aparece tu saldo - Inicio, Enviar y Detalle del activo.

## Recibir {#receive}

Toca **Recibir**. Empieza por la moneda: una **lista con búsqueda** (*Elige la moneda que quieres recibir*, cuadro de búsqueda *Buscar moneda o red*) con **QOR primero**, luego la moneda propia de cada red admitida y los tokens incluidos, cada uno con su imagen y la de su red. Si nada coincide con tu búsqueda, la lista dice *Ninguna moneda coincide.* Las imágenes vienen dentro de QoreX, así que no se obtiene nada de un tercero para dibujar la lista.

- **QOR** muestra tu dirección `qor1...` (y tu @handle, si tienes uno) como código QR con el icono de QoreChain, además de **Copiar** y **Compartir**. Todo lo que se envíe a ella llega por el carril nativo, donde cada transferencia lleva una firma clásica y una firma ML-DSA-87.
- **Cualquier otra moneda o token** muestra la dirección propia de esa red y la advertencia *"Envía solo \{coin\} en \{network\} a esta dirección. Las monedas enviadas en otra red pueden perderse."* La advertencia nombra la moneda que elegiste. Usa **Elegir otra moneda** para volver a la lista.
- **Redes cubiertas:** Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis y Celestia. Todas las redes EVM comparten una única dirección `0x...`. Tus direcciones de EVM y de Solana se derivan de tu frase de recuperación, por lo que QoreX pide una confirmación biométrica (**Mostrar la dirección**) antes de mostrarlas. Otras redes no pueden llevar firmas ML-DSA-87. Consulta [Redes externas](#external-networks-tokens).
- **Los tokens personalizados también están en la lista.** Un token que añadiste por la dirección del contrato (o, en Solana, por la dirección del mint) se ofrece en Recibir con la dirección de su red, igual que un token incluido. Consulta [Monedas y tokens](#coins-and-tokens).
- **Direcciones de Cosmos Hub, Osmosis y Celestia.** La dirección mostrada es la que firma tus envíos desde esa red (tu clave coin-118). Versiones anteriores podían mostrar una dirección distinta en una cuenta coin-60 o seguir a la cuenta activa; está corregido, y el envío vuelve a comprobar la dirección antes de firmar.

La extensión y la extensión de Safari tienen la misma lista de monedas en **Recibir**.

## Monedas y tokens {#coins-and-tokens}

Una moneda sin fila no tiene una dirección en la que recibirla. Para ver una moneda o un token en **Portafolio** *antes* de tener alguno, abre Portafolio → **+ Moneda o token** y actívalo (en la extensión: **Monedas y tokens**). Una moneda fijada en cero abre **Recibir** en su red al tocarla. Ajustes → **Monedas y redes** lista todo lo que el monedero puede guardar hoy.

**Añadir un token por contrato** (solo redes EVM):

1. Portafolio → **+ Moneda o token** → **Añadir un token por contrato** (extensión: **Monedas y tokens** → *Añadir un token por contrato*).
2. Elige la **Red**, pega la **Dirección del contrato (0x…)** y toca **Comprobar contrato**.
3. QoreX lee el símbolo y los decimales del propio contrato y muestra *"The contract says: \{symbol\} · \{decimals\} decimals"*. Cualquiera puede crear un token y ponerle cualquier nombre - QoreX no responde por él, así que asegúrate de que es el contrato que querías.
4. Toca **Añadir \{symbol\}**. Se marca como *Añadido por ti* y se puede enviar como los tokens incluidos. Quítalo cuando quieras.

Una vez añadido, el token también aparece en [Recibir](#receive).

QoreX rechaza un token que ya viene incluido, uno que ya añadiste, una red que no sea EVM, una dirección incorrecta, un contrato que no responde como un token y un contrato que usa el nombre de un token que QoreX ya incluye en esa red (probable copia).

## Solicitudes de pago {#payment-requests}

Pide a alguien una cantidad de QOR con un enlace firmado que compartes o copias. Funciona en la app, en la extensión y en la extensión de Safari, en mainnet y en testnet, y **no** necesita iniciar sesión en QoreX.

**Crear una solicitud**

1. Abre **Solicitudes de pago** (app: Ajustes; extensión: un botón en la pantalla de inicio).
2. Toca **Nueva solicitud** e introduce la **Cantidad (QOR)** y una **Nota** opcional (140 caracteres como máximo). Si tienes un @handle puedes marcar *Mostrar mi @\{handle\} en la solicitud*.
3. Toca **Crear enlace**. QoreX firma la solicitud con tu propia clave de cuenta y muestra *"Tu solicitud está lista. Cualquiera puede pagarla, en QoreX o en otra cartera."*
4. **Compartir enlace** o **Copiar enlace**.

El enlace se firma con tu clave de cuenta, así que se detecta un importe o una dirección modificados. La clave debe pertenecer a la dirección que recibe: nadie más puede volver a firmar en tu nombre un enlace alterado. La firma es solo una comprobación de integridad del enlace; el pago en sí lo firma normalmente quien paga, con la firma híbrida en el carril nativo. El formato del enlace es `qorex://pay?v=1&...` y nombra la red exacta (mainnet o testnet).

El botón **Solicitar** de Inicio en la app pide a un usuario concreto de QoreX por su @handle (necesita [iniciar sesión](/qorex/account-and-dashboard#sign-in) y tu propio @handle). Una vez creada, esa solicitud también se puede compartir como enlace firmado.

**Pagar una solicitud**

1. Abre el enlace en un teléfono con QoreX, o ve a **Pagar una solicitud**, usa **Pega un enlace de pago** (también en la extensión) y toca **Abrir**.
2. QoreX comprueba la firma, la red y cualquier @handle *antes* de mostrar nada que pagar. Después muestra el destinatario, el importe, la nota y la etiqueta de memo, y sigue la revisión normal. Confirmas como en cualquier envío.
3. Los mensajes que puedes ver: *"Firma comprobada: la solicitud no ha cambiado desde que se firmó."*, o un rechazo como *"Este enlace se modificó después de firmarse. No lo pagues."*, *"Este enlace no lo firmó el propietario de la dirección que recibe. No lo pagues."* o *"Esta solicitud es para \{network\}. Cambia la red en QoreX para pagarla."*
4. Si el enlace lleva un @handle, QoreX lo comprueba en el registro de handles: verificado, primer pago a él, *ahora apunta a una dirección distinta que antes* (confirma con esa persona antes de pagar) o no apunta a esta dirección (no pagues a menos que estés seguro). Una advertencia sobre el handle necesita una segunda confirmación.

Por ahora QoreX paga solicitudes solo en QOR. Una solicitud de testnet dice *"Solicitud de testnet. Los QOR de testnet no tienen valor."*

**Seguir y reutilizar**

**Mis solicitudes** enumera las solicitudes que creaste. Cada una muestra **Pagada** o **Aún no pagada**, leído de la cadena: QoreX busca un pago que coincida (la etiqueta de memo en la transferencia), y solo se marca como pagada cuando la cadena lo muestra. Si la red no responde dice *Estado desconocido*, nunca una suposición. **Comprobar estado** vuelve a preguntar. **Reutilizar el mes que viene** crea una solicitud nueva con los mismos datos y un id nuevo. Con un @handle también ves **Solicitudes para mí** y **Solicitudes que envié por @handle**.

## Contactos y favoritos {#contacts}

Los **Contactos** (app: Ajustes; extensión: un botón en la pantalla de inicio) son nombres para las direcciones a las que pagas. Se guardan **solo en este dispositivo**. Un contacto tiene un nombre, como máximo una dirección por red (QoreChain, EVM, Solana, Cosmos) y un @handle opcional; la lista admite hasta 200.

- **Favoritos.** Marca *Favorito (aparece en la pantalla de envío)* y el contacto aparece como un chip de un toque encima del campo del destinatario. Un chip solo rellena el formulario: tú sigues revisando y confirmando.
- **Repetir pago.** En un pago anterior (app: su pantalla de detalle; extensión: la fila del historial), **Repetir pago** vuelve a rellenar el formulario de envío con el mismo destinatario, importe y memo. Siempre revisas y confirmas antes de que se envíe nada.
- **Aviso de direcciones parecidas.** Un contacto no es una comprobación de seguridad, y QoreX lo dice. Cuando una dirección a la que vas a pagar solo *se parece* a una que ya conoces (mismos primeros y últimos caracteres, un truco que usan los estafadores plantando direcciones parecidas en tu historial), la revisión avisa *"Cuidado: esta dirección solo SE PARECE a una que ya conoces"* y muestra la dirección conocida para compararla carácter por carácter. Necesita un segundo toque (extensión) o aceptar el riesgo (app). El aviso compara con tus contactos guardados, las cuentas que son tuyas y las direcciones a las que has pagado.
- **Un contacto guardado se nombra en la revisión** (*Contacto guardado: \{name\}*). Un @handle guardado muestra además si su dirección es la misma que cuando le pagaste la última vez, es nueva o ha **cambiado**.

## Historial {#history}

El Historial muestra todas las transacciones de QoreChain de una cuenta, no solo los envíos: recibidas, en staking, retiradas del staking, stake movido, recompensas reclamadas, bloqueos, bonificación, ventanas EVM, dirección de recompensas y registro de la clave ML-DSA-87, con el importe, la comisión y las transacciones fallidas marcadas como *Fallida (la comisión se pagó igualmente)*. La insignia híbrida aparece solo en una transacción que la propia cadena ha verificado. Las redes externas todavía no están en el Historial.

- **Dónde.** App: **Actividad**, con un selector de cuenta, y un enlace **Historial** en cada cuenta de **Tus cuentas**. Extensión: **Historial** en la pantalla de inicio, con un selector de cuenta.
- **Pendiente, confirmada, fallida.** Una transferencia que acabas de enviar muestra **Pendiente: esperando a la red** hasta que la cadena la conoce. Una transacción que la cadena no ha visto tras unos minutos dice *No encontrada en la red: puede haber fallado. Revisa la transacción antes de volver a enviar.* Nunca se muestra como enviada por suposición. **Descartar** quita esa fila.
- **Por cuenta.** Cada cuenta de la wallet tiene su propio Historial.
- **Exportar CSV.** **Exportar CSV** escribe el historial de la cuenta en un archivo **en este dispositivo**. Solo contiene tu historial: sin frase ni claves. Las columnas son fijas y en inglés, y toda celda que una hoja de cálculo pudiera interpretar como fórmula (una dirección o un memo que empiece por `=`, `+`, `-` o `@`) lleva un prefijo para que se abra como texto.
- **El spam se oculta.** Las transferencias entrantes inferiores a 0.1 QOR cuyo memo contiene un enlace o un dominio se ocultan en Actividad y en las notificaciones, con una línea como *"\{n\} transferencias probablemente spam ocultas"* y **Mostrarlas**. Las transferencias de valor cero se ocultan. Un memo con un enlace lleva una advertencia en el detalle de la transacción: QoreChain y QoreX nunca te piden visitar un enlace enviado con una transferencia.
- **Nodos podados.** Si un nodo ya no conserva bloques antiguos, QoreX pide una página más pequeña hasta que el nodo responde, y lo dice cuando no se puede contactar con la red. En ese caso ya no muestra una lista vacía.

La **página de QOR** (toca QOR en Inicio) enumera todas las transacciones de la cuenta, entrantes y salientes, con **Mostrar más** al final.

## Redes y tokens externos {#external-networks-tokens}

El envío está activado en todas las redes que enumera QoreX: Ethereum, BNB Smart Chain, Polygon, Arbitrum One, Base, OP Mainnet, Avalanche C-Chain, Solana, Cosmos Hub, Osmosis y Celestia, con sus tokens. BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche y Celestia vuelven a funcionar tras haber sido durante un tiempo solo de recepción. Los envíos nativos en Arbitrum usan la propia estimación de gas de la red.

Desde **Todas las redes** (o Enviar-externo) puedes enviar **ETH, BNB, POL, AVAX y SOL** de forma nativa, además de ETH en **Arbitrum, Base y OP Mainnet**, y **ATOM, OSMO y TIA** en Cosmos, además de tokens **ERC-20**, **SPL** e **IBC** - USDC y USDT en las cadenas EVM y Solana, DAI en Ethereum, y Noble USDC a través de IBC - todos derivados de la misma frase de recuperación (ETH usa `m/44'/60'`, SOL usa su ruta estándar, y SPL usa cuentas de token asociadas).

:::caution Las cadenas externas son solo clásicas
Otras blockchains no pueden llevar firmas ML-DSA-87. Cuando envías en una red externa, QoreX lo indica explícitamente (la transferencia usa una firma clásica y la línea de firma la marca como clásica). Tu **QOR** permanece en el carril nativo con firma híbrida. Los envíos externos basados en Cosmos admiten una nota opcional. En las redes EVM, QoreX también muestra la **comisión de red máxima** antes de que confirmes - "Network fee: at most \{fee\}. Check it before you confirm." - y firma con exactamente esa cifra.
:::

## Swap

La pestaña **Swap** está conectada al AMM en cadena de QoreChain, pero permanece deshabilitada - el botón indica **"Swap - coming with pool liquidity"** - hasta que la liquidez y el indicador de función remoto la activen. Cuando eso ocurra, se activará automáticamente; **no se necesita ninguna actualización de la app**.

:::note iOS
La pestaña Swap no aparece en absoluto en la versión de la App Store - Apple trata un intercambio de tokens dentro de la app como un servicio regulado. Swap permanece disponible (una vez habilitado) solo en Android. La extensión de navegador no tiene pantalla de Swap.
:::

## Extras de la pantalla de inicio {#home-extras}

- **Widget de pantalla de inicio** (Android y iPhone) - añade **QoreX** desde el selector de widgets de tu teléfono. Muestra tu saldo de QOR de la cuenta en uso, muestra puntos en lugar del importe mientras el modo de privacidad está activado, se actualiza solo aproximadamente cada 30 minutos y abre la app al tocarlo. El widget no hace ninguna solicitud propia a los servidores de QoreChain: la app le entrega en el dispositivo tu dirección, tu saldo y tu ajuste de privacidad, y el widget lee el saldo del endpoint REST público de QoreChain (que solo ve tu dirección pública). Cualquiera que pueda ver tu pantalla de inicio puede ver el widget, así que activa el modo de privacidad (toca tu saldo) si eso te importa.
- **Notificaciones push** (móvil, mainnet) - la campana de Inicio → **Notificaciones** tiene un interruptor de **Notificaciones push**: *"Get a notification when QOR arrives, even with the app closed. Our server watches only your public addresses; Apple and Google see no amount or address."* El texto de la notificación es solo "QOR received". Las notificaciones push están **desactivadas hasta que las actives**. Cuando están activadas, el servidor guarda el token de tu dispositivo y las direcciones públicas `qor1…` de la wallet en uso (hasta 10); desactivar el interruptor elimina tu dispositivo del servidor, y un dispositivo del que el servidor no ha sabido nada en 90 días se olvida. Consulta [Qué envía QoreX por la red](/qorex/overview#data-and-privacy). Si las notificaciones de QoreX están desactivadas en los ajustes de tu teléfono, actívalas primero allí. La entrega se ha probado de extremo a extremo en Android; en iPhone, considérala de mejor esfuerzo y sigue consultando la lista de **Notificaciones** dentro de la app.
- **Búsqueda y recorrido** - consulta [Orientarte](/qorex/getting-started#find-your-way).

## Próximos pasos

- [Portafolio y Staking](/qorex/portfolio-and-staking) - consulta tu asignación y gana recompensas.
- [Seguridad y recuperación](/qorex/security-and-recovery) - protege y recupera tu wallet.

## Límites y problemas conocidos {#limits}

- Las transferencias en redes externas (EVM, Solana, Cosmos) son solo clásicas. Las transferencias SVM y EVM no están cubiertas por la firma híbrida.
- El intercambio (swap) no está disponible: está desactivado hasta que exista liquidez en los pools y no se muestra en iOS.
- Reclamar un @handle requiere una cuenta con sesión iniciada y se hace en la app móvil. Las cuentas de estilo Ethereum (coin 60) no tienen handle. Si el servicio de handles está caído, aún puedes pagar por dirección `qor1…`.
- Las solicitudes de pago se pagan solo en QOR. Solicitar por @handle (para ver las solicitudes enviadas a un handle) necesita un @handle reclamado.
- El Historial cubre por ahora solo QoreChain; las demás redes vendrán después.
- Las notificaciones push solo están disponibles en mainnet y, en iPhone, son de mejor esfuerzo.
- El QOR en vesting no puede pagar comisiones; solo se puede enviar la parte disponible.
