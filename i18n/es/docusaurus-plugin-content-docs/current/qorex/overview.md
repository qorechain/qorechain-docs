---
slug: /qorex/overview
title: Monedero QoreX
sidebar_label: Visión general
sidebar_position: 1
---

# Monedero QoreX

**QoreX** es el monedero oficial **no custodial** de **QoreChain** (mainnet `qorechain-vladi`). Es para quien quiera conservar, enviar, hacer staking y recibir QOR, pagar a otras personas por @handle, conservar activos de otras redes desde la misma frase de recuperación y aprobar lo que los sitios web piden firmar a su monedero. Tus claves privadas se generan y se almacenan **únicamente en tu dispositivo**. QoreChain Association nunca tiene acceso a tus fondos y las aplicaciones **no tienen analíticas, ni informes de fallos, ni ningún SDK de rastreo**. Las claves, la frase de recuperación, la bóveda y las aprobaciones nunca salen de tu dispositivo (consulta [Qué envía QoreX por la red](#data-and-privacy)). Cada transferencia nativa de QOR se firma dos veces: con una clave clásica y con ML-DSA-87 (FIPS 204).

QoreX es una familia de cuatro compilaciones que funcionan juntas:

- **Aplicación móvil** (Android e iOS): el monedero completo, con recuperación, staking, portafolio, un navegador de dApps integrado y el Q-Day Scanner. Consulta [Primeros pasos](/qorex/getting-started) y [Navegador de dApps](/qorex/dapp-browser).
- **Extensión de navegador** (Chrome y navegadores Chromium, Firefox): un monedero de escritorio autónomo y el conector que permite a cualquier sitio web detectar QoreX y convertir cada solicitud en una aprobación explícita. Consulta [Extensión de navegador](/qorex/browser-extension).
- **Extensión de Safari**: la misma extensión, empaquetada dentro de la aplicación de macOS **QoreX Wallet** en la Mac App Store.
- **Kit para desarrolladores**: seis paquetes npm públicos para aplicaciones que se integran con QoreX. Consulta [Para desarrolladores](#developers).

:::caution Haz una copia de seguridad de tu frase de recuperación en cuanto crees un monedero
QoreX es no custodial: QoreChain Association no puede recuperar un monedero perdido, restablecerlo ni restaurarlo por ti. **Desinstalar la aplicación, restablecer el teléfono o quitar la extensión borra tus claves de ese dispositivo.** Anota tu frase de recuperación de 24 palabras (la aplicación móvil no la muestra mientras crea el monedero, así que revélala desde **Ajustes → Seguridad → Mostrar frase de recuperación**; la extensión la muestra una sola vez al crearlo) y, si puedes, configura la [recuperación social](/qorex/security-and-recovery#social-recovery). Consulta [Haz la copia ahora](/qorex/security-and-recovery#back-up-now).
:::

## Innovaciones {#innovations}

- **Carril nativo con firma híbrida.** Cada transferencia nativa de QOR se firma dos veces: con una clave clásica secp256k1 y con ML-DSA-87 (FIPS 204). La cadena verifica ambas. Todo lo que ocurre en una red externa es solo clásico, y QoreX lo indica así antes de que confirmes.
- **Una frase de recuperación, una clave ML-DSA-87, sin una segunda copia de seguridad.** La clave ML-DSA-87 se deriva de forma determinista de las mismas 24 palabras: `SHAKE256("qorechain:pqc:v1|" + address + "|" + mnemonic)`. La derivación está publicada en [QoreSign](/qoresign/overview), así que cualquier monedero compatible deriva la misma clave.
- **Registrada automáticamente y luego comprobada.** La clave ML-DSA-87 se registra en la cadena con tu primera transacción (con una prueba de posesión en la cadena v3.2.3 y posteriores). Tras cada difusión, el monedero comprueba que la transacción confirmada lleva la capa ML-DSA-87 y te avisa si no es así.
- **Aprobaciones que rechazan lo que no pueden leer.** Cada mensaje, la comisión, los límites de gasto y la caducidad se decodifican antes de que firmes. Una solicitud que QoreX no puede decodificar, o cuyos bytes pueden leerse de dos maneras, se rechaza.
- **`signAndBroadcast` para dApps.** Un sitio web envía los mensajes; el monedero los muestra decodificados, añade la capa ML-DSA-87 que solo el monedero puede generar y difunde la transacción. Una página no puede producir esa capa.
- **Ventanas de acceso EVM.** Por encima de la cadena v3.2.0, una transacción EVM se admite solo mientras la cuenta tiene una ventana abierta: un `MsgOpenEVMWindow` firmado de forma híbrida, acotado por número de transacciones, valor y caducidad. QoreX la abre, la muestra y la cierra.
- **Handles con fijación.** Un @handle está vinculado a una dirección `qor1…` mediante una atestación ed25519 del registro más la propia firma secp256k1 del titular. QoreX fija la dirección que resolvió por primera vez y avisa si cambia en silencio.
- **Recuperación que no necesita ninguna empresa.** La recuperación social divide la semilla en fragmentos cifrados y sellados con ML-KEM (2 de 3 guardianes), con un bloqueo temporal de 48 horas que te avisa; Legacy es un mecanismo de hombre muerto sobre tus guardianes; la vinculación de dispositivos traslada un monedero con un código de un solo uso y un QR que por sí solo no sirve de nada. Consulta [Seguridad y recuperación](/qorex/security-and-recovery).
- **Huella pequeña.** La extensión solicita al navegador un único permiso de API, `storage`, y no incluye código de analíticas ni de rastreo. El push solo comunica al servidor tus direcciones públicas y la notificación dice únicamente "QOR received".

## Cómo usarlo {#how-to-use}

1. Instala QoreX desde una ficha de tienda oficial (consulta [Cómo acceder](#how-to-access)).
2. Crea un monedero o restaura uno: [Primeros pasos](/qorex/getting-started) para la aplicación móvil, [Extensión de navegador](/qorex/browser-extension#wallet) para la extensión.
3. Anota las 24 palabras y luego envía y recibe QOR: [Enviar y recibir](/qorex/send-and-receive).
4. Haz staking: [Portafolio y staking](/qorex/portfolio-and-staking). Configura tu red de seguridad: [Seguridad y recuperación](/qorex/security-and-recovery).
5. Para usar un sitio web con QoreX, ábrelo en la extensión (escritorio) o en el [Navegador de dApps](/qorex/dapp-browser) de la aplicación. Cada conexión y cada firma es una aprobación que das tú.

## Cómo acceder {#how-to-access}

- **Redes:** mainnet `qorechain-vladi` (predeterminada) y testnet `qorechain-diana`. En el móvil, la testnet está en **Ajustes → Usar testnet (desarrolladores)**.
- **Cuenta necesaria:** ninguna. El inicio de sesión (correo electrónico, Apple o Google) es opcional y solo hace falta para reclamar un @handle, vincular con el Dashboard y usar las solicitudes de pago.
- **Requisitos previos:** en el móvil, un desbloqueo del dispositivo (Face ID o Touch ID en iOS; una biometría de clase 3 o un PIN de bloqueo de pantalla en Android), o los botones de crear e importar permanecen desactivados. En la extensión, una contraseña.
- **Coste:** QoreX es gratuito. Enviar, hacer staking y abrir una ventana EVM pagan la comisión normal de la red (el mínimo de la red es 0.1 uqor por gas).
- **Instala siempre desde una ficha oficial:**

| Compilación | Dónde | Mínimo |
|---|---|---|
| Aplicación para iOS | [App Store, QoreX](https://apps.apple.com/us/app/qorex-wallet/id6791256626) | iOS 15.1 |
| Aplicación para Android | [Google Play](https://play.google.com/store/apps/details?id=network.qore.qorex) | Android 7.0 |
| Chrome, Brave, Edge, Arc, Opera | [Chrome Web Store](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) | un navegador Chromium |
| Firefox | [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/qorex/) | Firefox 140 |
| Safari | [Mac App Store, QoreX Wallet](https://apps.apple.com/us/app/qorex-wallet/id6794132220) | macOS 12 |

## Dónde está publicado {#where-published}

| Compilación | Ficha y nombre del paquete | Versión actual (27 oct 2026) | Enlace |
|---|---|---|---|
| Aplicación para iOS | App Store, **QoreX** (id 6791256626) | 1.1.8 | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6791256626) |
| Aplicación para Android | Google Play, `network.qore.qorex` | 1.1.9 | [play.google.com](https://play.google.com/store/apps/details?id=network.qore.qorex) |
| Extensión de Chrome | Chrome Web Store, **QoreX** | 0.3.8 | [chromewebstore.google.com](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) |
| Extensión de Firefox | Firefox Add-ons, `qorex` | 0.3.9 | [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/qorex/) |
| Extensión de Safari | Mac App Store, **QoreX Wallet** (id 6794132220) | aplicación 1.7.8, extensión 0.3.8 | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6794132220) |
| Kit para desarrolladores | seis paquetes npm, consulta [Para desarrolladores](#developers) | 0.1.0 | [Integraciones de QoreX](/developer-tools/qorex-integrations) |

La revisión de cada tienda sigue su propio calendario, así que una tienda puede servir una compilación más antigua que otra; consulta [Qué versión está disponible en cada plataforma](#versions). El código fuente de QoreX no es público.

## Límites y problemas conocidos {#limits}

- **Ninguna promesa más allá de lo que se firma.** La firma híbrida cubre las transacciones del carril nativo. Las transacciones EVM llevan solo una firma secp256k1 y se admiten únicamente mientras hay una ventana de acceso EVM abierta. Las transferencias SVM y de redes externas son solo clásicas.
- **El proveedor EVM de la extensión solo responde a consultas de cuenta y de red.** Todavía no firma transacciones ni mensajes EVM. La firma de mensajes (`signArbitrary`) no está disponible.
- **Solo en el móvil:** Portafolio, Q-Day Scanner, recuperación social, Legacy, solicitudes de pago, inicio de sesión y vinculación de dispositivos.
- **El swap no está disponible.** Permanece desactivado hasta que exista liquidez en el pool y no se muestra en iOS.
- **Los firmantes vinculados** (Phantom o MetaMask como clave vinculada con límites de gasto) todavía no están disponibles dentro de QoreX.
- **La rotación de claves** de tu clave ML-DSA-87 todavía no está disponible dentro de QoreX.
- **Si el servicio de handles está caído,** el monedero recurre a direcciones simples; todo lo demás sigue funcionando.
- Un monedero perdido, sin frase anotada y sin recuperación social, no puede ser recuperado por nadie.

## Disponibilidad por plataforma {#platform-availability}

| Funcionalidad | Aplicación móvil (Android e iOS) | Extensión de navegador |
|---|---|---|
| Crear / importar un monedero | ✅ (la aplicación no muestra la frase al crear el monedero - revélala desde Ajustes → Seguridad) | ✅ (autónoma; la frase se muestra una sola vez al crearlo) |
| Varios monederos, cada uno con su propia frase de recuperación | ✅ (Ajustes → Monederos) | ✅ (**Monederos**, una sola contraseña para todos) |
| Varias cuentas a partir de una sola frase de recuperación | ✅ (hasta 20 por monedero) | ✅ |
| Cuenta de estilo Ethereum (coin 60), añadida a mano | ✅ | ✅ |
| Enviar y recibir QOR (carril nativo con firma híbrida) | ✅ | ✅ (Enviar; Recibir con QR) |
| Recibir en cualquier red compatible | ✅ | ✅ |
| Pagar a un @handle | ✅ | ✅ |
| Reclamar un @handle | ✅ (requiere una cuenta con sesión iniciada) | - (la extensión te remite a la aplicación) |
| Staking: delegar, deshacer delegación, mover el stake, reclamar, reclamar y volver a hacer staking | ✅ | ✅ |
| Redes externas (Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis, Celestia + tokens) | ✅ | ✅ (envío desde la ventana emergente) |
| Añadir un token por contrato (redes EVM) | ✅ | ✅ |
| Ventana de acceso EVM | ✅ | ✅ |
| Idioma de la interfaz (10 idiomas) | ✅ (sigue el idioma del teléfono) | ✅ (sigue el idioma del navegador) |
| Portafolio, Q-Day Scanner, Recuperación social, Legacy | ✅ | - |
| Búsqueda, recorrido de primer uso, widget de pantalla de inicio, notificaciones push | ✅ | - |
| Conexiones con dApps | ✅ (navegador integrado, limitadas a la sesión) | ✅ (cualquier sitio web; **Sitios conectados** con Revocar) |
| Swap | Solo Android, desactivado hasta que haya liquidez en el pool (no se muestra en iOS) | - |
| Inicio de sesión de cuenta y solicitudes de pago | ✅ | - |
| Vinculación de varios dispositivos | ✅ | - |
| Emparejamiento con el Dashboard | ✅ | ✅ (conexión + transferencias propuestas, incl. staking) |

## Primeros pasos

- ¿Es tu primera vez con QoreX? Empieza por [Primeros pasos](/qorex/getting-started) para crear o restaurar tu monedero.
- Después aprende a [Enviar y recibir](/qorex/send-and-receive) QOR en el carril nativo con firma híbrida.
- Configura tu red de seguridad en [Seguridad y recuperación](/qorex/security-and-recovery).
- En el escritorio, instala la [Extensión de navegador](/qorex/browser-extension).

## Descarga y disponibilidad {#availability}

Instala desde las fichas oficiales de [Cómo acceder](#how-to-access). La aplicación para Android requiere Android 7.0 o posterior, la de iOS iOS 15.1 o posterior, la extensión de Firefox Firefox 140 o posterior y la extensión de Safari macOS 12 o posterior.

## Qué versión está disponible en cada plataforma {#versions}

La revisión de cada tienda sigue su propio calendario, así que una tienda puede servir durante un tiempo una compilación más antigua que otra. Esta es la versión actual **en cada tienda** a fecha de **27 de octubre de 2026**:

| Tienda | Versión actual | Nota |
|---|---|---|
| Apple App Store (iOS) | 1.1.8 | publicada el 21 de octubre |
| Google Play (Android) | 1.1.9 | |
| Chrome Web Store | 0.3.8 | |
| Firefox Add-ons | 0.3.9 | |
| Safari (Mac App Store) | 1.7.8, con la extensión 0.3.8 | la Mac App Store usa su propia numeración `1.x` |

Las tiendas siempre muestran su versión actual, y una tienda que todavía sirva una compilación anterior se pondrá al día automáticamente. En este manual no se describe como disponible ninguna compilación que una tienda aún no haya publicado.

Qué añaden las compilaciones 1.1.9 / 0.3.9 (hoy, Android 1.1.9 y la extensión de Firefox 0.3.9; iOS, Chrome y Safari las incorporan cuando sus tiendas sirvan esas compilaciones):

- **Bloqueos de staking.** Bloquea parte de tu stake durante 3, 6 o 12 meses. La bonificación mostrada es la que el bloqueo obtiene hoy, bajo el techo de la red. Desbloquear antes de tiempo requiere una segunda confirmación que indica el coste, y **Unstake** y **Mover stake** se limitan a la parte desbloqueada. La tabla de niveles se etiqueta como "hasta", con la cifra de hoy al lado. Consulta [Portafolio y staking](/qorex/portfolio-and-staking#staking-locks).
- **Memos de transferencias IBC en lenguaje claro** en las aprobaciones.
- **Staking desde cuentas importadas de MetaMask (coin 60)** en la extensión.

Qué han cambiado para ti las compilaciones 1.1.8 / 0.3.8:

- **MetaMask en QoreChain, desde la primera pantalla.** Abre, comprueba y cierra la ventana de acceso EVM que necesita MetaMask, y consulta lo que le queda.
- **Comprobaciones de firma más estrictas.** QoreX verifica la firma ML-DSA-87 de una aplicación con la clave registrada de tu cuenta, y te avisa con claridad si esa clave la registró otro monedero.
- **Correcciones de problemas de seguridad reportados.**

Qué han cambiado para ti las compilaciones 1.1.7 / 0.3.7 (incluidas en 1.1.8 / 0.3.8):

- **Las aprobaciones rechazan una solicitud cuyos bytes pueden leerse de dos maneras.** Si el mismo campo aparece dos veces en una solicitud, una pantalla y la cadena podrían discrepar sobre lo que se está firmando, por ejemplo, una comisión o un importe mostrados de forma distinta a la ejecutada. Ahora QoreX rechaza una solicitud así en lugar de mostrar una sola lectura de ella. Consulta [Qué muestra la ventana de aprobación](/qorex/security-and-recovery#approvals).
- **La caducidad de las concesiones se muestra al segundo**, y los votos de gobernanza se decodifican y se muestran en la pantalla de aprobación.
- **Los sitios se identifican por el origen que atestigua el propio navegador**, no por lo que una solicitud afirma de sí misma.
- **Las búsquedas de @handle vuelven a funcionar en la extensión.**
- **Reclamar un @handle requiere una cuenta con sesión iniciada y se hace en la aplicación**; la extensión te remite a ella.
- **Los nombres de QoreChain que se le parecen están reservados**, de modo que un handle nuevo no puede imitar al proyecto ni a su personal.

Novedades destacadas desde 1.0.9 / 0.2.6:

- **Varios monederos** en un mismo teléfono o navegador, cada uno con su propia frase de recuperación, con cambio en un toque - consulta [Varios monederos](/qorex/getting-started#several-wallets).
- **Cuenta de estilo Ethereum (coin 60)**, añadida a mano, para frases que se usaron primero en MetaMask o en el Dashboard - consulta [Restaurar una frase de MetaMask o del Dashboard](/qorex/getting-started#restore-dashboard).
- **Añadir un token por contrato**, **Recibir en cualquier red**, **búsqueda** global, un **recorrido** de primer uso, un **widget de pantalla de inicio** y **notificaciones push** cuando llega QOR (móvil) - consulta [Enviar y recibir](/qorex/send-and-receive).
- **Reclamar y volver a hacer staking**, una comprobación de comisión antes de reclamar, una lista de **Unstaking en curso** y avisos antes de que hagas staking de forma que te quedes sin poder deshacerlo - consulta [Portafolio y staking](/qorex/portfolio-and-staking).
- Pantallas de aprobación que muestran cada mensaje, la comisión, los límites de gasto y la caducidad, y rechazan lo que QoreX no puede mostrar; **`signAndBroadcast`** para dApps; **Sitios conectados** con Revocar (extensión); la **ventana de acceso EVM** - consulta [Seguridad y recuperación](/qorex/security-and-recovery) y la [Extensión de navegador](/qorex/browser-extension).
- Correcciones: una cuenta con fondos podía desaparecer momentáneamente de "Tus cuentas" (1.0.9); el botón físico Atrás de Android ahora retrocede una pantalla (1.1.1); la frase de recuperación se oculta a los servicios que no son de accesibilidad en Android 14 y posteriores (1.1.6).

QoreX funciona en la mainnet `qorechain-vladi` (activa desde el 7 de junio de 2026), que ejecuta la cadena **v3.2.4** desde el 23 de octubre de 2026. El formato de firma, las direcciones, los decimales, los memos y las comisiones no cambian en estas actualizaciones, por lo que no hace falta ninguna actualización de QoreX para ellas.

## Para desarrolladores {#developers}

Para integrarte con QoreX desde tu propia aplicación, usa el kit para desarrolladores de QoreX: seis paquetes npm, publicados en la 0.1.0. Sus comandos de instalación, ejemplos y límites están en [Integraciones de QoreX](/developer-tools/qorex-integrations). Para el descubrimiento de monederos y la firma en una aplicación web, consulta también el [wallet adapter](/developer-tools/wallet-adapter) y, para el proveedor de navegador que QoreX inyecta, la [Extensión de navegador](/qorex/browser-extension#standards).

## Qué envía QoreX por la red {#data-and-privacy}

QoreX **no tiene analíticas, ni informes de fallos, ni ningún SDK de rastreo**. Tus claves, tu frase de recuperación, la bóveda y tus aprobaciones **nunca salen del dispositivo**. Las aplicaciones sí se comunican con la red, como debe hacer cualquier monedero; esta es la lista completa.

**Siempre (necesario para mostrar saldos y enviar):**

- **Endpoints públicos de QoreChain** (`api`, `rpc`, `evm` y `svm` en `qore.host`, y los equivalentes `-testnet`) para saldos, historial y difusión de transacciones. Estas solicitudes llevan tu dirección `qor1…` **pública**.
- **Consulta de precio** - una solicitud para el precio de QOR, que **no lleva ninguna dirección**.
- **Redes externas que tienes o consultas** - servicios RPC/REST públicos de terceros para esa red, que llevan tu dirección **pública** en esa red.
- **Registro de @handle** - lleva el handle que consultas, o una dirección pública.

**Solo si lo activas:**

- **Notificaciones push** (móvil) - desactivadas hasta que las actives. El servidor recibe entonces el token de tu dispositivo y las direcciones `qor1…` públicas del monedero en uso (hasta 10). Un dispositivo del que el servidor no ha tenido noticias en 90 días se olvida.
- **Recuperación social** - el relé almacena **solo texto cifrado**.
- **Inicio de sesión** (correo electrónico, o Apple o Google) - necesario para reclamar un @handle, para vincular con el Dashboard y para usar las solicitudes de pago.
- **Conexión con el Dashboard y direcciones vinculadas** - envía una prueba firmada de que eres el propietario de la dirección.
- **Solicitudes de pago** - envían el handle de origen, el handle de destino, el importe y una nota opcional.

**El widget de pantalla de inicio** no hace ninguna solicitud propia a los servidores de QoreChain: la aplicación le entrega localmente tu dirección, tu saldo y el indicador de privacidad, y el widget actualiza el saldo desde el endpoint REST público de QoreChain.

**No hay chat de IA ni servicio QCAI** en ninguna de las dos aplicaciones.
