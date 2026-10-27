---
slug: /qorex/send-and-receive
title: Enviar y recibir
sidebar_label: Enviar y recibir
sidebar_position: 3
---

# Enviar y recibir

Esta página cubre cómo enviar y recibir QOR, pagar a un @handle, tener activos en otras redes y los extras de la pantalla de inicio. Es para quien usa la app móvil de QoreX (la extensión tiene las mismas pantallas de Enviar y Recibir, consulta [Extensión de navegador](/qorex/browser-extension)).

La pestaña Inicio (Wallet) es tu punto de partida. Muestra una **insignia de red** (MAINNET de forma predeterminada, o TESTNET si activaste el interruptor de desarrollador), tu **saldo total** (toca para ocultar/mostrar) y las acciones principales: **Enviar · Recibir · Swap · Stake** (**Swap** no se muestra en iOS). Tu lista de activos muestra **QOR** (un saldo unificado en los carriles Nativo, EVM y SVM, que se envía por el carril nativo con firma híbrida) y **Todas las redes** (una vista unificada de ETH, BNB, POL, ARB y las demás [redes externas](#external-networks-tokens) que admite QoreX).

## Enviar QOR por el carril nativo con firma híbrida

1. Toca **Enviar**.
2. Introduce el destinatario como una dirección `qor1…` **o** un **@handle**. Un handle se resuelve y se verifica criptográficamente (firma del registro + firma del propietario + anclaje en el primer uso); si la clave de un handle cambia alguna vez de forma silenciosa, QoreX muestra una advertencia explícita.
3. Introduce el importe. La vista previa muestra el destinatario, el importe, la **comisión de red** y el estado de la firma (si la transferencia lleva la capa ML-DSA-87).
4. Confirma con la aprobación **biométrica**. Cada transferencia nativa de QOR se firma dos veces: con una clave clásica y con ML-DSA-87 (FIPS 204). QoreX firma con esa firma híbrida obligatoria y la difunde por el carril nativo. Tras la difusión, comprueba que la transacción confirmada lleva la capa ML-DSA-87 y te avisa si no es así.

En la primera pantalla, el cuadro de relleno rápido (**Ask QoreX**) te permite escribir una petición sencilla como "send 50 QOR to @maria" y rellena el formulario por ti. Es un simple lector de texto que se ejecuta **por completo en tu dispositivo** - nada de lo que escribes ahí se envía a ninguna parte, y no es un asistente de IA (QoreX no tiene ninguno). Sigues revisando todo y confirmando con biometría como de costumbre; si no puede leer lo que escribiste, lo dice y rellenas el formulario a mano. Los destinatarios recientes aparecen como chips.

QoreChain no registra tu clave ML-DSA-87 por sí sola. QoreX lo hace por ti como parte de tu **primera** transferencia (una pequeña comisión de red de una sola vez), y puedes ver el estado en [Seguridad y recuperación](/qorex/security-and-recovery#pqc-key). No se necesita ningún paso adicional en QoreX.

### Enviar a un @handle, paso a paso {#handle-send}

1. Abre **Enviar** y escribe `@` seguido del handle (por ejemplo `@liviu`) en el campo de destinatario en lugar de una dirección.
2. QoreX busca el handle y te muestra la **dirección `qor1…` resuelta** antes de que confirmes nada. (Reclamar tu propio handle requiere una cuenta con sesión iniciada y se hace en la app - consulta [@handle](/qorex/account-and-dashboard#handle).)
3. Comprueba la dirección resuelta, introduce el importe y confirma como de costumbre.

QoreX solo acepta una resolución que supere **ambas** comprobaciones que realiza: una atestación del registro verificada frente a una clave de confianza fijada en la app, y la propia firma del propietario del handle sobre la reclamación. Si falla cualquiera de las dos comprobaciones, se produce un error en lugar de recurrir a una dirección no verificada. La primera vez que pagas a un handle determinado, QoreX recuerda la dirección a la que se resolvió; si la dirección de ese handle cambia alguna vez, QoreX se detiene antes de firmar y te muestra la dirección antigua y la nueva una junto a la otra para que decidas si quieres continuar. Esta memoria es **por dispositivo** - pagar al mismo handle por primera vez desde otro teléfono o una instalación nueva lo muestra como nuevo también ahí, lo cual es lo esperado, no un error. La extensión de navegador resuelve y paga handles de la misma manera (su memoria es **por navegador**, así que un navegador o equipo distinto lo verá como nuevo) - consulta [Enviar a un @handle](/qorex/browser-extension#handle-send).

### Enviar QOR en proceso de consolidación (bloqueado) {#vesting}

Si parte de tu saldo todavía está en proceso de **consolidación (vesting)** - por ejemplo, una asignación de TGE aún no liberada - tu total se divide en **disponible ahora** y **todavía bloqueado**. Solo puedes enviar la parte disponible; QoreX rechaza por sí mismo un intento de gasto excesivo en lugar de dejar que la red lo rechace después de cobrar una comisión. La parte bloqueada se vuelve gastable gradualmente a medida que el calendario de consolidación la va liberando. Esta división se muestra en todos los lugares donde aparece tu saldo - Inicio, Enviar y Detalle del activo.

## Recibir {#receive}

Toca **Recibir**. QoreChain aparece seleccionada primero - tu dirección `qor1…` (y tu @handle, si tienes uno) como código QR con el icono de QoreChain, además de **Copiar** y **Compartir**. Todo lo que se envíe a ella llega por el carril nativo, donde cada transferencia lleva una firma clásica y una firma ML-DSA-87.

Para recibir en otra red, usa el selector de **Red** de la parte superior: Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis y Celestia muestran cada una **su propia dirección** y la advertencia *"Send only \{coin\} or tokens on \{network\} to this address. Coins sent from another network can be lost."* Todas las redes EVM comparten una única dirección `0x…`. Tus direcciones de EVM y de Solana se derivan de tu frase de recuperación, por lo que QoreX pide una confirmación biométrica (**Mostrar la dirección**) antes de mostrarlas. Otras redes no pueden llevar firmas ML-DSA-87. Consulta [Redes externas](#external-networks-tokens).

En la extensión de navegador, **Recibir** tiene el mismo selector de red.

## Monedas y tokens {#coins-and-tokens}

Una moneda sin fila no tiene una dirección en la que recibirla. Para ver una moneda o un token en **Portafolio** *antes* de tener alguno, abre Portafolio → **+ Moneda o token** y actívalo (en la extensión: **Monedas y tokens**). Una moneda fijada en cero abre **Recibir** en su red al tocarla. Ajustes → **Monedas y redes** lista todo lo que el monedero puede guardar hoy.

**Añadir un token por contrato** (solo redes EVM):

1. Portafolio → **+ Moneda o token** → **Añadir un token por contrato** (extensión: **Monedas y tokens** → *Añadir un token por contrato*).
2. Elige la **Red**, pega la **Dirección del contrato (0x…)** y toca **Comprobar contrato**.
3. QoreX lee el símbolo y los decimales del propio contrato y muestra *"The contract says: \{symbol\} · \{decimals\} decimals"*. Cualquiera puede crear un token y ponerle cualquier nombre - QoreX no responde por él, así que asegúrate de que es el contrato que querías.
4. Toca **Añadir \{symbol\}**. Se marca como *Añadido por ti* y se puede enviar como los tokens incluidos. Quítalo cuando quieras.

QoreX rechaza un token que ya viene incluido, uno que ya añadiste, una red que no sea EVM, una dirección incorrecta, un contrato que no responde como un token y un contrato que usa el nombre de un token que QoreX ya incluye en esa red (probable copia).

## Solicitar un pago

Toca **Solicitar** (requiere [inicio de sesión](/qorex/account-and-dashboard#sign-in)) para crear una solicitud de pago - un importe más una nota opcional - como código QR o enlace. Quien la escanee verá la transferencia previamente rellenada.

## Redes y tokens externos {#external-networks-tokens}

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
- Las solicitudes de pago requieren iniciar sesión y son solo para móvil.
- Las notificaciones push solo están disponibles en mainnet y, en iPhone, son de mejor esfuerzo.
- El QOR en vesting no puede pagar comisiones; solo se puede enviar la parte disponible.
