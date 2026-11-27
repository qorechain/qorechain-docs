---
slug: /qorex/browser-extension
title: Extensión de Navegador QoreX
sidebar_label: Extensión de Navegador
sidebar_position: 2
---

# Extensión de Navegador QoreX

La **extensión de navegador** QoreX es la wallet de escritorio de QoreChain. Es una **wallet independiente** (crea o importa una wallet, guarda, envía y haz staking de QOR, y conéctate a dApps) y es la pieza que permite que cualquier sitio web descubra QoreX y convierta cada solicitud en una aprobación explícita y decodificada. Es para quien usa QoreChain desde un navegador de escritorio, y para desarrolladores que quieren que su aplicación web funcione con una wallet de QoreChain.

Está **activa y disponible públicamente** en tres tiendas (Chrome, Firefox y Safari), y las tres llevan la extensión 0.4.5. Ver [qué versión está activa en cada uno](#versions).

## Innovaciones {#innovations}

- **`signAndBroadcast`.** Una dApp envía mensajes; la wallet muestra cada mensaje decodificado y la comisión, añade la capa ML-DSA-87 que solo la wallet puede crear, y transmite. Una página nunca tiene la clave ML-DSA-87.
- **`signDirect` comprueba la capa contra la clave registrada.** Si una dApp adjunta por sí misma una capa ML-DSA-87, QoreX la comprueba contra la clave registrada de la cuenta en cadena antes de que se abra cualquier ventana de aprobación. Si la transacción no lleva ninguna capa, QoreX la añade. `signAndBroadcast` sigue siendo la ruta más sencilla (ver [Enviar una transacción de QoreChain](#sign-and-broadcast)).
- **Una superficie de permisos pequeña.** La extensión declara `storage` y además (en Chrome y Firefox) `nativeMessaging` para la herramienta opcional de agentes de IA del modo desarrollador. No hay permisos de host y no hay código de analítica, de informes de fallos ni de seguimiento. Ver [Qué permisos solicita QoreX](#permissions).
- **Bóveda sellada.** La bóveda se cifra con AES-256-GCM bajo una clave derivada de la contraseña (Argon2id). Donde el navegador expone WebAuthn PRF (Chrome y Edge), puedes desbloquear con una passkey en su lugar; la contraseña siempre sigue como respaldo.
- **Descubrimiento sin apropiarse.** QoreX se anuncia con EIP-6963 (`rdns` `network.qore.qorex`) y el Solana Wallet Standard. Nunca sobrescribe `window.ethereum` ni `window.keplr`.
- **Aprobaciones por origen, identificado por el navegador.** El sitio es el origen que atestigua el propio navegador, nunca lo que la solicitud afirma. Una solicitud que repite un campo para que pueda leerse de dos maneras se rechaza.
- **Una wallet bloqueada pide tu contraseña, no un reintento.** Una solicitud de firma de un sitio hecha mientras QoreX está bloqueado abre la pantalla de contraseña y nombra el sitio; tras desbloquear, la solicitud muestra su propia aprobación. No se firma nada sin la contraseña.
- **Una revisión antes de cada transferencia.** El formulario de envío lleva a una pantalla de revisión con el destinatario completo, las comisiones y las advertencias, y solo entonces a la firma.
- **Historial con exportación CSV**, por cuenta, con cada transacción pendiente, confirmada o fallida según lo informa la cadena.
- **Solicitudes de pago, contactos, La protección de mi dinero y Ayuda** en el popup. Ver [Solicitudes de pago](#pay-requests), [Contactos](#contacts) y [La protección de mi dinero](#protection).
- **Modo desarrollador con 17 herramientas.** Un botón **Herramientas de desarrollo** las abre todas en su propia página. Ver [Modo desarrollador](/qorex/developer-mode).

## Cómo usarla {#how-to-use}

1. Instala la extensión (ver [Cómo acceder](#how-to-access)) y abre el popup.
2. Elige **Crear una cartera nueva** (una contraseña y luego 24 palabras mostradas una sola vez) o **Importar una frase de recuperación**. Ver [Crear o restaurar una wallet](#wallet). Después elige **¿Qué quieres hacer primero?** o sáltalo.
3. Usa **Enviar**, **Recibir**, **Delegar QOR**, **Historial** y **Monedas y tokens** en el popup. Ver [Enviar QOR](#send), [Historial](#history), [Hacer staking desde la extensión](#stake) y [Enviar en redes externas](#send-external).
4. Abre una dApp. La primera conexión muestra una aprobación con el origen del sitio; aprobar revela únicamente tu dirección pública. Revoca cualquier sitio en [Sitios conectados](#connected-sites).
5. Como desarrollador, detecta QoreX con EIP-6963 y envía una transacción con `signAndBroadcast`. Ver [Conectar una dApp a QoreX](#connect) y [Enviar una transacción de QoreChain desde una dApp](#sign-and-broadcast).

## Cómo acceder {#how-to-access}

Solo necesitas un navegador de escritorio: sin cuenta, sin registro y sin app móvil. Se aplican comisiones de red cuando envías o haces staking (el mínimo de la red es 0.1 uqor por gas). La extensión sigue la red en la que está configurada; mainnet `qorechain-vladi` es la predeterminada.

### Instalación {#install}

| Navegador | Instalación |
|---|---|
| **Chrome y navegadores basados en Chromium** (Brave, Edge, Arc, Opera) | https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg |
| **Firefox** (Firefox 140 o posterior) | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 12 o posterior)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

Instala siempre desde una de estas fichas.

### Qué versión está activa en cada uno {#versions}

:::note
Versiones comprobadas el 27 de noviembre de 2026. Las apps 1.2.5 para iPhone y Android y las extensiones 0.4.5 para Chrome y Firefox ya están disponibles. Safari 1.8.2, que incluye la extensión 0.4.5, está en revisión de la tienda: en Safari, las funciones que este manual describe para la 0.4.5 llegan cuando la Mac App Store ofrezca la actualización. La página web de los enlaces de pago compartidos ya está en línea; consulta [Abrir un enlace de pago sin la app](/qorex/send-and-receive#pay-web).
:::

Versión actual en cada tienda:

| Tienda | Versión actual |
|---|---|
| Chrome Web Store | 0.4.5 |
| Firefox Add-ons | 0.4.5 |
| Safari (Mac App Store, app de macOS **QoreX Wallet**) | 1.8.1, que incluye la extensión 0.4.3 (la Mac App Store usa su propia numeración `1.x`) |

Las revisiones de cada tienda se completan en momentos distintos, así que una tienda puede servir un build más antiguo que otra; la ficha de la tienda siempre muestra su versión actual. Consulta también [Qué versión está activa en cada uno](/qorex/overview#versions).

La extensión 0.4.x añade [bloqueo automático](#unlock), una [revisión antes de cada transferencia](#send), [Historial con exportación CSV](#history), [solicitudes de pago](#pay-requests), [contactos](#contacts), [La protección de mi dinero](#protection), [reparación, rotación y multifirma de la clave poscuántica](#pqc-care), [pantallas de staking](#stake) separadas, una [pantalla Recibir que empieza por la moneda](#receive), [firma EVM para dApps](#standards), [ventanas de acceso EVM más seguras](#evm-window) y [herramientas de desarrollo](#developer-tools). La lista completa por versión está en [Qué añaden las compilaciones 1.2.5 / 0.4.5](/qorex/overview#whats-new-125) y en las listas que le siguen.

Desde 0.2.6 la extensión también ha incorporado: [varias wallets con una sola contraseña](#wallets), una [cuenta al estilo Ethereum que añades a mano](#coin60), [Claim & restake](#stake), una lista **Unstaking en curso**, [añadir un token por contrato](#custom-tokens), [Recibir en cualquier red](#receive), [Sitios conectados con Revocar](#connected-sites), la [ventana de acceso EVM](#evm-window), [`signAndBroadcast` para dApps](#sign-and-broadcast) y pantallas de aprobación que muestran cada mensaje, comisión y caducidad.

**La superficie de permisos no ha cambiado desde 0.1.3.** Ver [Qué permisos solicita QoreX](#permissions).

:::note
En Safari, las aprobaciones se abren en una pestaña del navegador en lugar de una ventana emergente. La extensión se empaqueta con el envoltorio de extensiones web de Safari de Apple, a partir de la misma base de código. La herramienta **Agentes de IA** del modo desarrollador no está disponible en Safari.
:::

## Crear o restaurar una wallet {#wallet}

Abre el popup y elige:

- **Crear una wallet nueva** - elige una contraseña (de al menos 8 caracteres); QoreX genera en tu dispositivo una frase de recuperación nueva de 24 palabras (256 bits de entropía), deriva tu identidad de QoreChain y la sella en la bóveda bajo esa contraseña (y, opcionalmente, una passkey - ver [Seguridad](#security)). Las 24 palabras se muestran **una sola vez** - anótalas, marca *He guardado mi frase de recuperación en un lugar seguro* y continúa. Puedes volver a mostrarlas más tarde con **Mostrar frase de recuperación** en el popup (requiere la contraseña).
- **Comprueba tu copia de seguridad** - justo después de confirmar que guardaste la frase, QoreX te pide escribir tres de sus palabras, en posiciones al azar, tal como las anotaste. Si una no coincide, mira tu papel e inténtalo de nuevo. Puedes elegir **Comprobar más tarde**; más adelante, **Comprobar mi copia de seguridad** pide tu contraseña y no muestra la frase, porque el objetivo es comprobar tu copia escrita.
- **Importar una frase de recuperación** - restaura a partir de una frase existente. Una frase de menos de 24 palabras restaura tus fondos con normalidad, pero QoreX te avisa de que tu clave ML-DSA-87 solo tiene entonces la fortaleza de esa frase; para la fortaleza completa, crea una wallet nueva de 24 palabras y mueve tus fondos allí.

:::danger Anota la frase antes de continuar
La bóveda de la extensión vive solo en este navegador. **Quitar la extensión, borrar sus datos o restablecer el navegador elimina tus claves**, y nadie - incluida QoreChain Association - puede restaurarlas. Sin tus 24 palabras anotadas, tus fondos se pierden para siempre. Ver [Haz la copia de seguridad ahora](/qorex/security-and-recovery#back-up-now).
:::

Tras crear o importar, QoreX pregunta una vez **¿Qué quieres hacer primero?** En la extensión, **Quiero recibir dinero** te guía por la moneda, su dirección y un enlace de pago; **Quiero enviar dinero** por la financiación de la wallet, la nota sobre el @handle (los handles se reclaman en la app) y tu primer pago, con la comisión explicada; **Quiero mantener mis criptomonedas seguras** muestra tu dirección de depósito y la comprobación de la copia. Toca **Omitir por ahora** para pasar; **¿Qué quieres hacer?** en la pantalla de inicio del popup lo abre de nuevo.

La extensión mantiene sus propias claves; no requiere la app móvil. Las claves nunca salen del dispositivo.

## Desbloqueo y bloqueo automático {#unlock}

- **Desbloquear** - escribe tu contraseña y pulsa **Enter** o toca **Desbloquear**. El botón muestra que está trabajando (la clave de la bóveda es deliberadamente lenta de derivar). **Contraseña incorrecta.** aparece solo con una contraseña incorrecta; cualquier otro fallo se nombra. Cuando el [desbloqueo con passkey](#security) está activado, puedes usar **Desbloquear con passkey**.
- **Bloqueo automático** - en la pantalla de inicio del popup, **Bloquear automáticamente tras** define cuánto tiempo permanece abierto QoreX sin uso: 1, 5, 15, 30, 60 o 240 minutos (mostrados como minutos u horas). El valor predeterminado es 15 minutos.
- **Bloquear** - el botón **Bloquear** de la pantalla de inicio del popup bloquea al instante; la siguiente pantalla pide tu contraseña.
- **Un sitio pide algo mientras estás bloqueado** - una solicitud de firma de un sitio (nativa, EVM o Solana) abre QoreX en la pantalla de contraseña, nombrando el sitio. Tras desbloquear, esa ventana se cierra y la solicitud muestra su propia aprobación. Si en cambio cierras la ventana, la solicitud se rechaza y no se firma nada.

## Varias wallets y cuentas {#wallets}

- **Wallets** (desde 0.3.3) - la pantalla **Wallets** del popup («Wallets en este navegador») lista todas las wallets de este navegador. Cada una tiene su propia frase de recuperación; **una sola contraseña** las desbloquea todas, y cambiar de una a otra modifica cuál muestra y con cuál firma QoreX (nada se mueve en cadena). **Añade** una wallet creando una nueva (su frase se muestra una sola vez) o restaurando una; se te pide la contraseña una vez para volver a sellar la bóveda. Añadir o quitar una wallet desactiva el **desbloqueo con passkey** - vuelve a activarlo desde la pantalla de inicio. Para quitar una, toca *Quitar de este navegador* e introduce tu contraseña; la última wallet no se puede quitar desde esta pantalla. Quitarla elimina esa clave del navegador - solo su frase de recuperación la recupera.
- **Cuentas** (desde 0.2.2) - **Tus cuentas** crea y alterna entre varias cuentas a partir de la misma frase (hasta 20 por wallet; están numeradas y no se pueden renombrar). Restaurar la frase que anotaste devuelve la **Cuenta 1**; vuelve a añadir las demás con **Añadir una cuenta**. Cambiar de cuenta mueve todo con ella: envíos, staking, recepción y tu @handle siguen a la cuenta que esté activa.

### Cuenta al estilo Ethereum {#coin60}

Desde 0.3.2, **Añadir una cuenta Ethereum (coin 60)** (en la pantalla **Tus cuentas**) añade la cuenta para una frase usada primero en MetaMask o en el Dashboard; ver [Restaurar una frase de MetaMask o del Dashboard](/qorex/getting-started#restore-dashboard). Su dirección 0x es la que MetaMask muestra para las mismas palabras. No se ofrecen handles en ella. Desde la extensión 0.3.9 puedes hacer staking desde esta cuenta en la extensión.

Portafolio, Q-Day Scanner, recuperación social, Legacy Protocol, inicio de sesión con la cuenta y vinculación de dispositivos siguen siendo exclusivos de la app móvil - ver [QoreX Wallet](/qorex/overview#platform-availability).

## Tu cuenta, saldo y @handle {#account}

La pantalla de inicio del popup muestra tu dirección `qor1…` (toca para copiar) y tu saldo de QOR en vivo, así no necesitas abrir un explorador de bloques para consultar ninguno de los dos.

### Saldos en vesting (bloqueados) {#vesting}

Si tu cuenta tiene QOR en vesting (por ejemplo, una asignación TGE aún no liberada), el saldo se divide en **disponible ahora** y **aún bloqueado**, y un envío que supere el monto disponible se rechaza antes de que llegue a la red, en lugar de fallar en cadena después de cobrar una comisión. QoreX deliberadamente **no** muestra una "próxima fecha de desbloqueo" aquí: un cronograma de vesting puede ser modificado por gobernanza, así que una fecha en la tarjeta de saldo se leería como una promesa que QoreX no puede garantizar. La división entre disponible y bloqueado es lo que se mantiene exacto.

### Reclama un @handle

Reclamar un **@handle** único (por ejemplo, `@liviu`) requiere una **cuenta con sesión iniciada** y se hace **en la app móvil**; la extensión te dirige allí y no reclama handles por sí misma. Una vez reclamado, el handle se vincula a esa dirección, de modo que la extensión lo resuelve cuando lo pagas y otros pueden pagarte por nombre. Consulta [@handle](/qorex/account-and-dashboard#handle) para ver cómo los handles se vinculan a direcciones (no a una wallet en su conjunto).

## Enviar QOR {#send}

1. Abre el popup y toca **Enviar**.
2. Introduce el destinatario (dirección `qor1…` o @handle), el importe y un memo opcional. Los [favoritos](#contacts) aparecen como chips de un toque en el formulario.
3. **Revisa la transferencia.** La pantalla de revisión muestra el destinatario completo (y el nombre del contacto, si es un contacto guardado), el importe y el memo. Si es la primera transacción de la cuenta, muestra además la comisión única de registro de la clave ML-DSA-87 y el total.
4. Lee cualquier advertencia. QoreX te avisa cuando es el primer pago a esa dirección desde esta wallet, cuando la dirección solo **se parece** a una a la que ya has pagado o que has guardado (compara cada carácter; necesitas un segundo toque, **Toca de nuevo para enviar igualmente a esta dirección**) y cuando la comisión de red es mayor que el importe que envías.
5. Toca **Confirmar y enviar**. QoreX firma con la firma híbrida y envía.

Disponible en mainnet y testnet. Una transacción que supere el límite de gas por transacción de la red se rechaza antes de que se firme nada.

## Enviar a un @handle {#handle-send}

Desde 0.1.9 puedes pagar directamente a un @handle registrado en lugar de buscar una dirección (las búsquedas estuvieron interrumpidas por un fallo en las versiones hasta 0.3.6 y vuelven a funcionar desde 0.3.7):

1. Abre el popup y toca **Enviar**.
2. En el campo de destinatario, escribe `@` seguido del handle (por ejemplo, `@liviu`) en lugar de una dirección `qor1…`.
3. QoreX resuelve el handle y te muestra la **dirección resuelta** antes de que firmes nada - verifica siempre esto frente a lo que esperas.
4. Ingresa el monto, comprueba la [pantalla de revisión](#send) y confirma.

La resolución se verifica de dos maneras antes de que QoreX la use: una atestación del registro comprobada contra una clave de confianza integrada en la extensión, y la propia firma del titular del handle sobre el reclamo. Una respuesta que falle en cualquiera de las dos comprobaciones se rechaza por completo - QoreX no recurre a mostrar una dirección sin verificar. La primera vez que pagas a un handle determinado, QoreX recuerda (fija) la dirección a la que se resolvió; si ese handle más adelante se resuelve a una dirección **diferente**, QoreX se detiene y te muestra tanto la dirección antigua como la nueva en su totalidad, para que puedas decidir si continuar. Esta memoria vive **por navegador** - pagar al mismo handle por primera vez desde un navegador o computadora diferente lo mostrará también como nuevo allí. Eso es lo esperado, no un error.

## Recibir {#receive}

Toca **Recibir** en el popup. **Empieza por la moneda**:

1. **Elige la moneda que quieres recibir** - una lista con búsqueda (**Buscar moneda o red**) con QOR primero, luego la moneda propia de cada red y los tokens incluidos, cada uno con su imagen y la de su red. Los tokens que [añadiste por contrato](#custom-tokens) también aparecen. Las imágenes vienen dentro de la wallet, así que no se obtiene nada de un tercero para mostrarlas.
2. QoreX muestra la dirección de la red de esa moneda como código QR con un botón de copiar, y una advertencia que nombra la moneda: envía solo esa moneda, en esa red, a esta dirección. Cuando una dirección funciona en varias redes (las redes EVM), indica cuáles.
3. **Elegir otra moneda** te devuelve a la lista.

Las redes admitidas son QoreChain, Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis y Celestia. La dirección de otra red se deriva de tu frase de recuperación, así que puede necesitar una confirmación para mostrarse. Para Cosmos Hub, Osmosis y Celestia, QoreX muestra la dirección desde la que firman tus envíos en esas redes.

## Historial {#history}

Toca **Historial** en la pantalla de inicio del popup para ver lo que ha ocurrido en la cuenta:

- **Todo tipo de transacción de QoreChain**, no solo los envíos: enviadas, recibidas, en staking, retiradas del staking, stake movido, recompensas reclamadas, bloqueos de staking, ventanas EVM y cambios de clave, con importe y comisión. Una transacción EVM muestra además cuánto consumió de la [ventana de acceso EVM](#evm-window).
- **Estado, leído de la cadena.** Una transferencia enviada desde este dispositivo que el historial de la cadena aún no muestra aparece como **Pendiente: esperando a la red**. Si la red no la encuentra, QoreX dice que puede haber fallado, así que revísala antes de volver a enviar (puedes **Descartar** la línea). Una transacción fallida se marca, con la comisión que se pagó igualmente.
- **Por cuenta** - con varias cuentas, elige la cuenta arriba.
- **Repetir pago** - vuelve a rellenar el formulario de envío a partir de un pago anterior. Sigues revisándolo y confirmándolo.
- **Exportar CSV** - el archivo se crea en tu dispositivo y contiene solo tu historial (sin frase ni claves), y se hace seguro para abrirlo en una hoja de cálculo.

Si no se puede contactar con la red, QoreX dice que no pudo cargar el historial; nunca lo muestra como "sin transacciones". Por ahora el Historial cubre solo QoreChain. Está disponible en mainnet y testnet.

## Solicitudes de pago {#pay-requests}

Pide a alguien una cantidad de QOR con un enlace que no se puede cambiar sin que se note.

**Pedir un pago:**

1. Abre **Solicitudes de pago** en la pantalla de inicio del popup y crea una **Nueva solicitud**: la cantidad en QOR, una nota opcional (hasta 140 caracteres) y, si tienes uno, si quieres mostrar tu @handle.
2. Toca **Crear enlace**. QoreX firma la solicitud con la clave de tu cuenta. Copia el enlace con **Copiar enlace** y envíalo a quien deba pagar.
3. **Mis solicitudes** las enumera. **Comprobar estado** lee la cadena y muestra **Pagada** o **Aún no pagada** (o que la red no respondió). **Reutilizar el mes que viene** crea una solicitud nueva a partir de una anterior.

**Pagar una solicitud:**

1. Abre **Pagar una solicitud**, pega el enlace y toca **Abrir**.
2. QoreX comprueba la firma, que el firmante sea dueño de la dirección receptora, la red exacta y cualquier @handle de la solicitud. Se rechaza un enlace modificado, un firmante incorrecto, una red desconocida o una moneda distinta de QOR. Si la solicitud es para la otra red, cámbiala tú; QoreX no lo hará.
3. Toca **Pagar**. Aparece la [pantalla de revisión](#send) normal antes de que se envíe nada. El pago lleva la etiqueta de la solicitud en el memo, que es como el QoreX del solicitante lo encuentra en la cadena.

Una solicitud firmada no necesita cuenta ni inicio de sesión. Una solicitud de testnet lo indica: los QOR de testnet no tienen valor. Los formatos de enlace para desarrolladores están en [Integración de dApps](/qorex/dapp-integration).

## Contactos y favoritos {#contacts}

**Contactos**, en la pantalla de inicio del popup, guarda nombres para las direcciones a las que pagas, **solo en este dispositivo**.

- **Añadir contacto** - un nombre y al menos una dirección: QoreChain (`qor1…`), EVM (`0x…`), Solana o Cosmos, y un @handle opcional. Márcalo como **Favorito** para verlo como chip de un toque en el formulario de envío. **Pagar a &#123;name&#125;** abre el formulario rellenado. Borrar requiere dos toques. La lista admite hasta 200 contactos.
- Los **contactos con @handle** muestran si el handle apunta a la misma dirección que la última vez que les pagaste, y te avisan si su dirección **cambió**.
- **Direcciones parecidas** - se señala una dirección que solo se parece a una que ya conoces, mostrando ambas para que compares cada carácter.

Un contacto no es una comprobación de seguridad: cada pago sigue mostrando la dirección completa para revisarla.

## La protección de mi dinero {#protection}

**La protección de mi dinero**, en la pantalla de inicio del popup, es una pantalla en la que cada línea se comprueba al abrirla, en tu dispositivo y en la red. Una comprobación que no se puede leer lo dice; nunca cuenta como "bien" ni como "ninguno".

- **Copia de seguridad verificada** y **Recuperación probada** - la fecha, o **Todavía no**. **Probar mi frase de recuperación** pide tres palabras de tu frase. Se comparan en tu dispositivo; nada de lo que escribes se guarda ni se envía.
- **Apps con permisos** - los sitios que pueden ver tu dirección y pedirte que firmes, con **Revocar**.
- **Permisos concedidos en la red** - autorizaciones que permiten a otra cuenta enviar por ti (authz) o gastar tus QOR en comisiones de red (fee grants), primero las ilimitadas, con **Revocar**. Al revocar se muestra lo que vas a firmar y la comisión, y luego confirmas.
- **Aprobaciones de tokens en el EVM de QoreChain** - toca **Revisar aprobaciones de tokens** (leerlas necesita tu frase una vez). QoreX dice hasta dónde ha comprobado; abre la pantalla de nuevo para seguir. **Revocar** envía `approve(spender, 0)` después de abrir una ventana EVM de una sola transacción limitada al contrato del token. Solo una cuenta de estilo Ethereum (coin 60) puede revocar aquí.
- **Protección poscuántica, por canal** - en lenguaje claro: las transacciones nativas de QoreChain llevan dos firmas (ML-DSA-87 y clásica); las transacciones EVM se firman de forma clásica y se admiten solo dentro de una ventana que abriste con tu firma poscuántica; las demás redes aceptan solo firmas clásicas.

Los guardianes y la recuperación social están en la app móvil. Ver [Seguridad y recuperación](/qorex/security-and-recovery).

## Ayuda y estado de la red {#help-and-status}

- **Ayuda**, en la pantalla de inicio del popup, enumera los únicos canales oficiales: la [comunidad de Telegram](https://t.me/QorechainCommunity), [Discord](https://discord.gg/qorechain), la [página de ayuda](https://qorechain.io/help/qorex), el correo a team@qorechain.io e **Informar de una vulnerabilidad**. El equipo de QoreChain nunca pide tu frase de recuperación, tu contraseña ni tus claves. **Mostrar resumen** ofrece un resumen de diagnóstico opcional (versión de la app, red y códigos de error, sin frase, claves, direcciones ni saldos) para copiarlo solo si el soporte lo pide.
- **Aviso del estado de la red** - QoreX lee la hora del último bloque de la cadena. Si tiene más de un minuto, un aviso dice que la red va lenta y qué antigüedad tiene el bloque; si no se puede contactar con la red, dice que los saldos pueden no estar actualizados. No muestra nada mientras la red va bien.
- **Últimos valores conocidos** - cuando la red no responde, el popup muestra el último saldo y las últimas delegaciones que leyó y dice de cuándo son.

## Hacer staking desde la extensión {#stake}

Desde **0.2.2**, el popup tiene su propia pantalla de staking - una wallet creada solo en la extensión no necesita la app móvil para obtener recompensas de staking. Abre **Delegar QOR** en la pantalla de inicio del popup. Abre un **menú** con una línea de explicación por acción; cada acción abre su propia pantalla, con su propia línea de error, y **Volver al stake** regresa al menú.

| Pantalla | Qué hace |
|---|---|
| **Delegar QOR** | Elige un validador y un monto. Los validadores activos se listan con su comisión; los **encarcelados (jailed)** quedan fuera. Mientras escribes, QoreX te avisa si el monto dejaría menos que la comisión de una transacción (no podrías retirar de staking ni reclamar hasta que la cuenta vuelva a tener QOR). |
| **Retirar del staking** | Inicia el desbonding. El tiempo antes de que puedas mover los QOR se **lee de la red**, y el monto aparece en **Retiros de delegación en curso** con el tiempo restante. |
| **Mover stake** | Redelega sin espera de desbonding, en tres pasos: (1) el validador **desde** el que mover (los que todavía no puedes abandonar aparecen atenuados, con la fecha), (2) los validadores **a** los que mover, (3) **cuánto**, con **Max** y la ruta y el reparto mostrados antes de firmar. Un movimiento que la red rechazaría se detecta antes. Ver [Mover stake entre validadores](/qorex/portfolio-and-staking#move-stake). |
| **Reclamar** | Recoge las recompensas. Si la comisión es mayor que las recompensas, el primer toque te avisa. |
| **Reclamar y volver a delegar** | Recompone las recompensas de vuelta a los validadores que las generaron en una sola transacción (hasta 127 validadores). QoreX comprueba antes que tu QOR **desbloqueado** pueda pagar la comisión, que se paga antes de que lleguen las recompensas. |
| **Bloquear para un bono** | Bloquea parte de tu stake durante 3, 6 o 12 meses. Ver [bloqueos de staking](/qorex/portfolio-and-staking#staking-locks). |
| **Las recompensas van a** | Envía las futuras recompensas de staking a **otra cuenta de la misma wallet**, y a ninguna otra dirección. Muestra adónde van ahora las recompensas, nombra la cuenta nueva completa en el primer toque y firma en el segundo. Tu stake no se mueve. |

Debajo del menú, una tarjeta **El staking, en sencillo** presenta las recompensas ganadas hasta ahora, lo que cuesta el staking (comisión del validador y comisiones de red) y cuándo llegan los QOR retirados del staking. Con varias cuentas, elige cuál hace el staking desde el selector de cuenta. Cada acción se firma con la firma híbrida obligatoria (secp256k1 y ML-DSA-87), igual que un Envío, y la pantalla dice cuándo tu primera transacción también registra tu clave. La tasa anual se lee de la cifra propia de la cadena. El staking, la delegación y las recompensas ocurren exclusivamente en el carril **Nativo**, nunca a través de un precompilado EVM - ver [Staking y Delegación](/user-guide/staking-and-delegation).

### Aprobar una solicitud de staking del Dashboard {#stake-dashboard}

El [Dashboard](/dashboard/staking-and-validators) de QoreChain compone las solicitudes de staking pero no puede firmarlas - tu clave nunca sale de la bóveda de la extensión. Al hacer clic en **Continuar en QoreX** en el Dashboard, la solicitud se abre en la extensión para que la revises (validador y monto) y la apruebes, exactamente igual que un Envío.

:::note Si una transacción aparece como "degradada" en lugar de exitosa
El Dashboard ocasionalmente muestra una transacción como **degradada (downgraded)** en lugar de un éxito limpio. Esto significa que tus fondos se movieron, pero la capa de firma ML-DSA-87 no se encontró en cadena para esa transacción - no es algo que hayas hecho mal ni algo que puedas arreglar de tu lado. Es un fallo de nuestro lado; por favor repórtalo a soporte para que podamos investigarlo. El mensaje permanece en pantalla deliberadamente en lugar de desaparecer, para que tengas tiempo de leerlo y reportarlo.
:::

### Enviar en redes externas {#send-external}

Además de QOR en el carril Nativo, la pantalla **Enviar en redes externas** del popup envía activos en otras redes, todas derivadas de la misma frase de recuperación. Todas las redes siguientes pueden enviar y recibir:

| Tipo | Redes | Tokens incluidos |
|---|---|---|
| EVM | Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche C-Chain | Entradas ERC-20 (USDC y USDT en las cadenas EVM, DAI en Ethereum) |
| SVM | Solana | Entradas SPL (USDC, USDT) |
| Cosmos | Cosmos Hub, Osmosis, Celestia | Noble USDC vía IBC; campo de memo opcional |

1. Elige la moneda o el token y luego introduce el destinatario y el monto (y, en las redes Cosmos, un memo opcional).
2. Marca la confirmación. En inglés dice: **"External networks accept only classical signatures. Unlike your QOR, this transfer has NO ML-DSA-87 signature. I understand."** (las redes externas solo aceptan firmas clásicas; a diferencia de tu QOR, esta transferencia NO tiene firma ML-DSA-87). Las cadenas externas no pueden llevar una firma ML-DSA-87, y QoreX nunca lo oculta.
3. En las redes EVM, el primer toque calcula la **comisión máxima de red** («Comisión de red: como máximo …»); el segundo envía con exactamente esa cotización. Cualquier cambio la descarta. Si la comisión, pagada en la moneda que envías, es mayor que el monto, se te avisa.
4. Un destinatario que solo se parece a una dirección a la que ya has pagado en esa red se muestra completo y necesita un toque más.

## Estándares de wallet compatibles {#standards}

QoreX expone tres interfaces, todas inyectadas en la página como `window.qorex` (`{ evm, native, svm }`) y detectadas mediante EIP-6963 y el Solana Wallet Standard. En una aplicación web, el [wallet adapter](/developer-tools/wallet-adapter) envuelve esta detección.

| Estándar | Qué es | Qué significa para ti como desarrollador |
|---|---|---|
| **EIP-1193** | La API JavaScript del proveedor de Ethereum (`request(...)`, eventos). | Además de las consultas de cuenta y de red (`eth_requestAccounts`, `eth_accounts`, `eth_chainId`, `wallet_switchEthereumChain`), QoreX firma `personal_sign`, `eth_signTypedData_v4` y `eth_sendTransaction` en el carril EVM de QoreChain (chain id 9801, testnet 9800) y en Ethereum. Cada aprobación dice, decodificado en tu dispositivo, qué se está autorizando, y simula antes la transacción cuando puede. En QoreChain solo las cuentas de estilo Ethereum (coin 60) pueden enviar, y una transacción necesita una [ventana de acceso EVM](#evm-window). Ver [Integración de dApps](/qorex/dapp-integration). |
| **EIP-6963** | Descubrimiento de proveedores multi-wallet (eventos announce / request). | QoreX se anuncia junto a cualquier otra wallet - **nunca sobrescribe `window.ethereum`** - así que el usuario elige QoreX por sitio sin conflictos. |
| **Proveedor Nativo (estilo Keplr)** | `window.qorex.native`: `enable`, `getKey`, `signAndBroadcast`, `signDirect`, `getOfflineSigner` (para cosmjs, cosmos-kit e Interchain Kit), `signArbitrary` / `verifyArbitrary`, además de una lista `capabilities`. **No** es un reemplazo completo de Keplr: QoreX no crea el alias `window.keplr`, y la firma amino y `sendTx` no están disponibles. | La forma más sencilla de enviar una transacción de QoreChain es **`signAndBroadcast`** (ver [Enviar una transacción de QoreChain](#sign-and-broadcast)): QoreX muestra los mensajes decodificados y la comisión, añade la capa ML-DSA-87 que solo la wallet puede crear, y transmite. Con `signDirect` o `getOfflineSigner`, QoreX comprueba una capa que tu página adjuntó contra la clave registrada de la cuenta, o añade él mismo la capa cuando no hay ninguna. Ver [Integración de dApps](/qorex/dapp-integration). |
| **Solana Wallet Standard** *(desde 0.1.5)* | Descubrimiento nativo de wallets para dApps de Solana (`wallet-standard:register-wallet` / `app-ready`). | Las dApps de Solana **detectan automáticamente QoreX** - sin integración personalizada. Funciones: `standard:connect`, `standard:disconnect`, `standard:events`, `solana:signMessage`, `solana:signTransaction`, `solana:signAndSendTransaction`; cadena `solana:mainnet`; transacciones tanto `legacy` como `v0`. |

:::note Cómo acceder al carril SVM directamente
La misma interfaz también está disponible en `window.qorex.svm` (`connect` / `signAndSendTransaction` / `signMessage`). El descubrimiento automático de Wallet-Standard y el carril SVM totalmente implementado se lanzaron en **0.1.5** y están activos tanto en Chrome como en Firefox (ver [qué versión está activa en cada uno](#versions)).

Las aprobaciones de Solana muestran **una línea por instrucción**, decodificada donde QoreX puede: transferencias de SOL (destinatario y lamports), transferencias de tokens SPL, **«PERMITIR GASTAR tus tokens»** (approve), **«ENTREGAR el control de la cuenta»** (set authority) y el cierre de una cuenta de tokens - y dicen «instrucción que QoreX no puede leer» para cualquier otra, junto con el programa. Una solicitud que incluye una instrucción approve o set-authority se titula «quiere autoridad sobre tus tokens de Solana - lee cada línea de abajo». Se rechazan las transacciones que no incluyan tu wallet como firmante, `signMessage` no firmará bytes que en realidad sean una transacción, y la firma se marca como **clásica**. Ver [Firma híbrida](#pqc).
:::

## Monedas y tokens {#custom-tokens}

La pantalla **Monedas y tokens** del popup te permite añadir un **token ERC-20 por su contrato**: elige la red, pega la dirección del contrato, **Comprobar contrato**. QoreX lee el nombre y los decimales del token del propio contrato - y vuelve a leerlos en segundo plano al añadirlo, en lugar de fiarse del popup - y luego te los muestra con un recordatorio de que cualquiera puede crear un token con cualquier nombre. El token aparece entonces en **Enviar en redes externas** y en [Recibir](#receive). Rechaza tokens incluidos de serie, duplicados, redes que no son EVM, direcciones incorrectas, contratos ilegibles y contratos que toman prestado el nombre de un token incluido.

## Sitios conectados {#connected-sites}

**Sitios conectados** en el popup lista todos los sitios que esta wallet ha aprobado - un sitio puede ver la dirección de esta wallet y pedirte que firmes. Toca **Revocar** para quitar uno. Las aprobaciones se guardan **por wallet**: un sitio aprobado para una wallet no puede leer la dirección de otra wallet después de que cambies.

## Ventana de acceso EVM {#evm-window}

La pantalla **Ventana de acceso EVM** del popup abre y cierra la ventana que permite a una cuenta de estilo Ethereum (coin 60) enviar en el carril EVM de QoreChain (v3.2.0 y posteriores), con los mismos límites que en la app: hasta 17,280 bloques y 1,000 transacciones, y un límite de gasto en QOR que cuenta todos los QOR que salen de la cuenta, más cada comisión máxima. Los tokens no cuentan para el límite.

1. Elige cuánto tiempo (bloques), cuántas transacciones y el límite de gasto.
2. Elige **Qué admite la ventana**:
   - **Solo transferencias de QOR (recomendado)**, la opción predeterminada: sin llamadas a contratos, sin contratos nuevos y sin destinatarios que sean contratos;
   - **Cualquier contrato**: se puede llamar a cualquier contrato, y la pantalla advierte de que los tokens, NFT y aprobaciones que mueva un contrato no quedan limitados por la ventana. Si la red no puede limitar una ventana a transferencias de QOR, QoreX te pregunta antes de abrir una para cualquier contrato; si dices que no, no se abre nada.
3. Toca **Abrir la ventana**. La ventana abierta dice exactamente qué admite. **Cerrar la ventana** la termina.

Una ventana que abriste con **Solo transferencias de QOR** no permite que un sitio llame a un contrato. La transacción propia de un sitio puede hacer que QoreX abra una ventana exactamente para esa transacción desde su aprobación, que nombra todos los contratos que la ventana admitiría y dice que sustituye cualquier ventana abierta.

Una cuenta coin 118 no puede usar el carril EVM; la pantalla enumera los tres pasos a seguir y tiene un botón a **Tus cuentas**. Solo las pantallas de tu propia wallet pueden abrir, cerrar o borrar una ventana; un sitio no puede. Ver [Ventana de acceso EVM](/qorex/security-and-recovery#evm-window).

## Cuidado de la clave poscuántica y multifirma {#pqc-care}

**Registrar la clave de nuevo (reparación).** Si el registro de la clave poscuántica de la cuenta en la red ya no puede firmar (está vacío, es solo clásico o no se puede usar por otro motivo), la pantalla de inicio del popup muestra una tarjeta. Al tocar **Registrar la clave de nuevo** se muestra la comisión de red; toca otra vez para registrar. QoreX nunca lo hace por su cuenta. Si la cuenta tiene una ventana EVM, la red la cierra, así que abre una nueva después.

**Rotar la clave poscuántica.** El botón **Rotar la clave poscuántica** sustituye la clave ML-DSA-87 de la cuenta en la red por la siguiente clave derivada de tu frase de recuperación. Toca dos veces; la comisión se muestra en el resultado. La rotación te protege si solo quedó expuesta la clave poscuántica; **no** ayuda si quedó expuesta tu frase de recuperación. Después, otras wallets que usen la misma frase no pueden firmar por esta cuenta hasta que admitan claves rotadas, y la red cierra la ventana EVM de la cuenta. QoreX encuentra la clave correcta cuando restauras desde la frase.

**Cuentas multifirma.** **Cuentas multifirma** gestiona cuentas que necesitan que firmen varios miembros, con una firma poscuántica de cada miembro además de una clásica. QoreX usa los mismos archivos que la línea de comandos de QoreChain, así que cada miembro puede firmar en QoreX o en la línea de comandos.

1. **Crear una multifirma** a partir de las direcciones de los miembros (cada una debe haber enviado al menos una transacción), el número de firmas necesarias y un nombre opcional, o **Añadir una multifirma existente** pegando su clave.
2. La pantalla muestra el saldo y el estado de la clave de cada miembro. Primero **Preparar el registro** del conjunto de miembros poscuánticos; hasta que esté registrado, la cuenta no puede enviar. Después **Preparar un envío**.
3. En la extensión, los archivos se descargan y se abren. **Ronda 1:** los miembros añaden firmas poscuánticas; combínalas. **Ronda 2:** los miembros acordados firman de forma clásica. Luego **Enviar a la red**.
4. Firmar requiere dos toques, y antes revisas lo que firmas. QoreX te avisa si la transacción registra un autenticador, porque un autenticador puede mover los fondos de la multifirma sin las firmas de los demás miembros.

## Herramientas de desarrollo {#developer-tools}

El modo desarrollador está desactivado por defecto. Para activarlo en la extensión, toca siete veces el **número de versión** en la parte inferior del popup. Aparece una sección de desarrollador al final de la pantalla de inicio del popup con **Herramientas de desarrollo** (el botón `</>`), **Cambiar a testnet (diana)** (o **Volver a mainnet**) y **Desactivar el modo desarrollador**.

**Herramientas de desarrollo** abre una página con las herramientas agrupadas en **Inspeccionar**, **Transacciones**, **Contratos y rollups**, **Otras máquinas virtuales** y **Firma y agentes**. Son 17 herramientas, las mismas que en la app; en la testnet, **Solana en QoreChain** también aparece entre ellas. El modo desarrollador no cambia ninguna regla de firma: todo lo que firma sigue mostrando qué firma y espera tu aprobación. Cada herramienta se describe en [Modo desarrollador](/qorex/developer-mode).

La herramienta **Agentes de IA** permite que un asistente de IA en tu ordenador lea lo que permitas y **proponga** una transacción. QoreX comprueba y simula cada propuesta, y tú la apruebas o la rechazas en la ventana de aprobación normal; ningún agente puede firmar. En la extensión necesita un programa complementario en tu ordenador que **todavía no se ha publicado**, y no está disponible en Safari.

Solo en la **testnet**, la pantalla de inicio del popup ofrece además enviar a otra cadena por IBC y la pantalla de QoreChain Bridge; ninguna se ofrece en mainnet. Ver [Funciones de testnet](/qorex/testnet-features).

## Idioma {#language}

La extensión habla los mismos diez idiomas que la app móvil, el dashboard y el sitio: inglés, rumano, alemán, español, francés, italiano, turco, árabe, japonés y coreano. Por defecto sigue el idioma de tu **navegador** (recurriendo al inglés para cualquier otro) - nota que esta es una fuente distinta a la de la app móvil, que sigue el idioma del **teléfono**, así que ambas pueden mostrar idiomas diferentes si tu teléfono y tu navegador están configurados de forma distinta. Un selector en la pantalla de inicio del popup te permite anular el idioma detectado en cualquier momento; cambiar a árabe invierte el popup a derecha-a-izquierda de inmediato, no solo el texto.

## Seguridad y permisos {#security}

QoreX está construido para ser verificable, no solo confiable:

- **Bóveda** - tus claves están selladas con **AES-256-GCM**. La ruta de contraseña deriva su clave con **Argon2id** (RFC 9106, resistente a memoria: 64 MiB, t=3, p=1), de modo que un blob de bóveda copiado es lento de atacar por fuerza bruta con hardware GPU o ASIC. (Los blobs heredados con PBKDF2 se pueden seguir abriendo y se resellan a Argon2id en el siguiente desbloqueo.)
- **Desbloqueo con passkey (opcional, desde 0.1.5)** - donde tu autenticador admite la extensión **WebAuthn PRF**, QoreX puede desbloquear la bóveda a partir de la salida PRF de 32 bytes de la passkey en lugar de una contraseña escrita. Tu contraseña siempre permanece como respaldo.

  :::note Dónde aparece el desbloqueo con passkey
  QoreX detecta WebAuthn por funcionalidad y solo muestra **Activar desbloqueo con passkey** donde el navegador lo expone a las páginas de extensión - eso es **Chrome y Edge**. En **Firefox** la opción está oculta, porque Firefox no expone WebAuthn a las páginas de extensión. Esto es esperado, no un error.
  :::
- **Bloqueo automático** - QoreX se bloquea tras un tiempo sin uso (15 minutos por defecto) y tiene un botón **Bloquear**. Ver [Desbloqueo y bloqueo automático](#unlock).
- **Manifest V3 + CSP estricta** - `script-src 'self'; object-src 'self'; base-uri 'self'`. No hay **carga de código remoto** después de la instalación, ni `wasm-unsafe-eval`.
- **Sin analítica, sin informes de fallos, sin SDK de seguimiento, sin registro de usuario** - la extensión no necesita ninguna cuenta para guardar, enviar o hacer staking de QOR. Tus claves, tu frase de recuperación, la bóveda y las aprobaciones nunca salen del navegador. Sí hace solicitudes de red: a los endpoints públicos de QoreChain para saldos, historial y difusión de transacciones (estas llevan tu dirección pública `qor1…`), una consulta de precios (sin dirección), los servicios públicos de cualquier red externa que tengas o consultes (tu dirección pública en esa red) y el registro de @handle (el handle, o una dirección pública). Solo si usas el [emparejamiento con el Dashboard](#dashboard-bridge) envía una prueba firmada de que eres el titular de la dirección. Consulta [Qué envía QoreX por la red](/qorex/overview#data-and-privacy).

### Qué permisos solicita QoreX, y por qué {#permissions}

Esta sección existe porque la ficha de Firefox muestra el permiso **"Acceder a tus datos en todos los sitios web"**, lo cual puede parecer contradictorio con una wallet que declara no tener permisos de host. Aquí está la verdad exacta, sin editar, tomada del manifiesto.

El `manifest.json` de la extensión declara:

```json
"permissions": ["storage", "nativeMessaging"],
"host_permissions": [],
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["dist/content.js"], "run_at": "document_start" }
],
"web_accessible_resources": [
  { "resources": ["dist/inpage.js"], "matches": ["<all_urls>"], "use_dynamic_url": true }
]
```

- **`storage`** - almacena la bóveda cifrada, tus aprobaciones de conexión por origen y los ajustes y listas propios de tu wallet (como los contactos) **localmente**, en el almacenamiento de la extensión.
- **`nativeMessaging`** - nuevo en la 0.4.5, usado solo por la herramienta de [agentes de IA](#developer-tools) del modo desarrollador, para comunicarse con un programa complementario en tu propio ordenador (aún no publicado). QoreX abre esa conexión solo después de que actives **Permitir conexiones de agentes de IA en este ordenador** en esa herramienta. El paquete de **Safari** no declara este permiso.
- **`host_permissions: []`** - QoreX no declara **ningún** permiso de host. No solicita la capacidad de hacer solicitudes de red entre orígenes a sitios arbitrarios en tu nombre.
- **`web_accessible_resources`** - permite que las páginas carguen el `inpage.js` propio de QoreX, el pequeño script que expone el proveedor. `use_dynamic_url` le da una dirección distinta por sesión para que los sitios no puedan identificar la extensión sondeando su presencia (fingerprinting).
- **`content_scripts` con matches `<all_urls>`** - esta es la razón honesta por la que Firefox dice *"Acceder a tus datos en todos los sitios web."* QoreX inyecta un pequeño script proveedor (`content.js` → `inpage.js`) en **cada página**. Un content script que se ejecuta en todos los sitios *puede* técnicamente leer la página, y los navegadores describen esa capacidad con esa frase exacta - venga de `host_permissions` o de una coincidencia de content script.

**Por qué el content script se ejecuta en todas partes.** Para que **cualquier** dApp pueda descubrir la wallet mediante EIP-6963 sin que primero le concedas acceso por sitio. Así es como funcionan MetaMask, Keplr, Phantom y cualquier otra wallet inyectada: el proveedor inyectado debe estar presente antes de que se ejecuten los scripts de la página (`document_start`), en cualquier sitio que visites.

**Qué hace ese script - y qué no hace.** Solo enlaza mensajes de la wallet (anuncia el proveedor, reenvía solicitudes de conexión/firma al service worker, devuelve el resultado). **No** lee el contenido de la página más allá de esas solicitudes de la wallet, no envía nada a un servidor, ni carga código remoto - y no puede obtener datos arbitrarios entre orígenes porque no hay permisos de host. Todo esto es verificable: la extensión está bloqueada por CSP, no incluye analítica y su manifiesto (arriba) se puede leer en el paquete instalado.

## Conectar una dApp a QoreX {#connect}

Una dApp descubre QoreX mediante **EIP-6963** (anuncia la solicitud y elige la wallet cuyo `rdns` es `network.qore.qorex`) y luego usa el proveedor EIP-1193 devuelto; para el carril **Nativo** de QoreChain usa `window.qorex.native`, y lee `capabilities` para ver qué admite este build. QoreX nunca define `window.ethereum` ni `window.keplr`. La guía completa para desarrolladores, con código, está en su propia página: [Integrar una dApp con QoreX](/qorex/dapp-integration) (ver [Detectar QoreX](/qorex/dapp-integration#detection) y [Conectar](/qorex/dapp-integration#connect)). En una aplicación web, el [wallet adapter](/developer-tools/wallet-adapter) envuelve por ti esta detección, y el [kit para desarrolladores de QoreX](/developer-tools/qorex-integrations) cubre la integración del lado de la aplicación. (`@qorechain/connect` está obsoleto; no inicies trabajo nuevo con él.)

Las aprobaciones son **por origen**: la primera conexión a un sitio abre un popup de aprobación que muestra el origen, aprobar revela únicamente tu dirección pública, y la aprobación de un sitio no concede nada a otro. Las aprobaciones se guardan por wallet, persisten hasta que las revoques en **Sitios conectados**, y un sitio puede tener una solicitud en espera (tres en total); cambiar de wallet o bloquear responde "no" a las solicitudes en espera. Desde la 0.4.5, una solicitud de firma de un sitio hecha mientras QoreX está bloqueado abre la pantalla de contraseña, nombrando el sitio, y muestra su aprobación después de desbloquear; cerrar la ventana la rechaza. Ver [Qué muestra la ventana de aprobación](/qorex/security-and-recovery#approvals).

### Puente del Dashboard (v0.1.5, ampliado en v0.2.2) {#dashboard-bridge}

La versión 0.1.5 añade un puente limitado exclusivamente a **`dashboard.qorechain.io`**: `window.qorex.native.connectProof(sessionId)` firma la prueba de emparejamiento *Connect with QoreX* (el backend reverifica la firma), y `executeTransfer({ to, amountUqor, memo })` aprueba y transmite una transferencia de QOR propuesta por el Dashboard, devolviendo el `txHash`. Estos métodos se rechazan en cualquier otro origen.

**0.2.2** añade `native:executeRequest`, que acepta una solicitud completa propuesta por el Dashboard - incluyendo [staking](#stake-dashboard) - validada contra el mismo parser compartido que QoreX usa en todas partes: se rechaza ante un desajuste de red, un origen ajeno, una dirección que no es la tuya, un tipo de solicitud desconocido, o una solicitud de staking que lleve un `toAddress` (las solicitudes de staking no tienen uno). Los tipos de solicitud son enviar, delegar, retirar delegación, redelegar y reclamar; una solicitud de Connect te deja elegir cuál de tus cuentas vincular, y `listAccounts()` devuelve tus cuentas (solo lectura).

Dado que una dirección `qor1…` es igualmente válida en mainnet y en testnet, una solicitud propuesta por el Dashboard indica a qué red apunta, y QoreX se niega a actuar sobre ella si eso no coincide con la red a la que la extensión está conectada actualmente - nunca cambiará de red por cuenta propia a partir de una solicitud.

## Enviar una transacción de QoreChain desde una dApp: `signAndBroadcast` {#sign-and-broadcast}

Toda transacción del carril nativo de QoreChain de una cuenta con una clave ML-DSA-87 registrada necesita una firma híbrida - secp256k1 **y** ML-DSA-87 - y solo la wallet posee la clave ML-DSA, así que una página no puede construirla. Una dApp envía los mensajes con `window.qorex.native.signAndBroadcast({ chainId, messages, memo?, gasLimit? })`; QoreX muestra los mensajes decodificados y la comisión, construye la transacción para la cuenta que seleccionaste, añade la firma híbrida (registrando antes la clave ML-DSA-87 de la cuenta si es su primera transacción), transmite y resuelve con `{ txHash, code, height?, shield }`. Disponible desde la extensión **0.3.5**.

- La cadena debe ser la red activa de la wallet (`qorechain-vladi` en mainnet). Una dApp no puede cambiar la red; solo tú puedes.
- De 1 a 32 mensajes por llamada; la comisión se muestra antes de la aprobación; los mensajes exclusivos de la wallet, como la gestión de la clave ML-DSA-87, se rechazan.
- cosmjs, cosmos-kit e Interchain Kit funcionan mediante `getOfflineSigner` (desde 0.4.0), donde QoreX añade la capa ML-DSA-87 y la comisión que le corresponde.
- `signArbitrary` firma un mensaje con la clave clásica de la cuenta y ML-DSA-87 (desde 0.4.0).

Las reglas, el gas, los errores y los ejemplos de código completos están en [Integrar una dApp con QoreX](/qorex/dapp-integration#sign-and-broadcast).

## Firma híbrida {#pqc}

Cada transferencia nativa de QOR que QoreX inicia por sí misma se firma dos veces: con una clave clásica secp256k1 y con **ML-DSA-87** (FIPS 204), usando el pipeline híbrido de `@qorechain/sdk`. **No hay opción para desactivarlo**: QoreChain lo exige y QoreX nunca envía una transferencia de QOR del carril Nativo sin ello.

- **Firma Nativa iniciada por dApp** - usa [`signAndBroadcast`](#sign-and-broadcast): QoreX decodifica cada mensaje, muestra la comisión y añade por sí misma la capa ML-DSA-87. `signDirect` y los firmantes de cosmjs (`getOfflineSigner`) firman una transacción que construyó la página; cuando no lleva capa ML-DSA-87, QoreX añade una, y una capa que la página adjuntó se comprueba contra la clave registrada de la cuenta antes de cualquier ventana de aprobación (las cuentas importadas de MetaMask usan `signAndBroadcast`). QoreX nunca firma a ciegas: una solicitud que no puede decodificar se rechaza, y nunca firma una transacción de QoreChain solo clásica. Ver [Integrar una dApp con QoreX](/qorex/dapp-integration#cosmjs).
- **Las firmas clásicas siempre están etiquetadas** - las transferencias en redes externas (ETH, BNB, Solana, …) no pueden llevar una firma ML-DSA-87; QoreX te hace marcar una confirmación explícita y las marca como clásicas en lugar de degradar silenciosamente.

**Qué significa esto para el tamaño de la transacción.** ML-DSA-87 es una firma grande: la firma tiene **4,627 bytes** y la clave pública **2,592 bytes** (fijado por FIPS-204). Una transacción híbrida de QoreChain es, por lo tanto, varios kilobytes más grande que una puramente clásica. Si construyes y transmites transacciones tú mismo, dimensiona tus búferes y estimaciones de comisión para los bytes adicionales; la contabilidad de gas de QoreChain ya los espera. Ver [Firma post-cuántica](/developer-guide/post-quantum-signing) (la guía para desarrolladores) para las primitivas y el requisito de firma determinista.

## Dónde está publicada {#where-published}

| Tienda | Ficha | Versión actual | Enlace |
|---|---|---|---|
| Chrome Web Store | **QoreX** | 0.4.5 | [chromewebstore.google.com](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) |
| Firefox Add-ons | `qorex` | 0.4.5 | [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/qorex/) |
| Mac App Store (Safari) | **QoreX Wallet**, app 1.8.1 | extensión 0.4.3 | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6794132220) |

El código fuente de QoreX no es público. Las fichas de las tiendas siempre muestran la versión actual.

## Límites y problemas conocidos {#limits}

- **La firma EVM tiene límites.** El proveedor firma `personal_sign`, `eth_signTypedData_v4` y `eth_sendTransaction` (QoreChain, y Ethereum por sitio) y rechaza otros métodos de firma. En QoreChain solo las cuentas importadas de MetaMask pueden enviar, una transacción EVM necesita una ventana de autorización (la aprobación abre una para esa transacción) y lleva solo una firma secp256k1. Ver [Integrar una dApp con QoreX](/qorex/dapp-integration#evm).
- **`window.qorex.native` es de estilo Keplr, no un reemplazo completo de Keplr.** No hay alias `window.keplr`. `signAmino` y `sendTx` no existen: Amino se rechaza con el código `4200`. `getOfflineSigner` y `signDirect` funcionan, y QoreX añade la capa ML-DSA-87 cuando la página no la trae. `signArbitrary` y `verifyArbitrary` (firma de mensajes) funcionan desde 0.4.0. Una dApp no puede cambiar la red, y los mensajes exclusivos de la wallet (gestión de claves, reglas de gasto, ventanas EVM, ciertas autorizaciones) se rechazan desde cualquier sitio.
- **Solo en la app móvil:** Portafolio, Q-Day Scanner, recuperación social, Legacy, inicio de sesión, vinculación de dispositivos y reclamar un @handle.
- **Sin pantalla de Swap** en la extensión.
- **El desbloqueo con passkey** se ofrece solo donde el navegador expone WebAuthn a las páginas de extensión (Chrome y Edge); en Firefox está oculto.
- **Safari** abre las aprobaciones en una pestaña del navegador en lugar de un popup.
- **Las redes externas** aceptan solo firmas clásicas; QoreX te hace confirmarlo antes de cada transferencia.
- **Solo en testnet:** enviar a otra cadena por IBC, la pantalla de QoreChain Bridge y Solana en QoreChain. Ver [Funciones de testnet](/qorex/testnet-features).
- **Los agentes de IA** necesitan un programa complementario que todavía no se ha publicado, y no están disponibles en Safari.
- **El Historial** cubre por ahora solo QoreChain.
- La bóveda de la extensión vive solo en este navegador. Quitar la extensión, borrar sus datos o restablecer el navegador elimina tus claves; solo tus 24 palabras anotadas las restauran.
