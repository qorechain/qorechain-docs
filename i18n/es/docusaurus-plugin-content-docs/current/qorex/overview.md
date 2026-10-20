---
slug: /qorex/overview
title: Monedero QoreX
sidebar_label: Visión general
sidebar_position: 1
---

# Monedero QoreX

**QoreX** es el monedero oficial **no custodial** de **QoreChain**, la Layer 1 resistente a la computación cuántica (mainnet `qorechain-vladi`). Tus claves privadas se generan y se almacenan **únicamente en tu dispositivo**: QoreChain Association nunca tiene acceso a tus fondos y las aplicaciones **no tienen analíticas, ni informes de fallos, ni ningún SDK de rastreo** — las claves, la frase de recuperación, la bóveda y las aprobaciones nunca salen de tu dispositivo (consulta [Qué envía QoreX por la red](#data-and-privacy)). Cada transferencia de QOR en el carril Native lleva una **firma híbrida poscuántica** (ML-DSA-87, NIST FIPS-204, combinada con secp256k1), de modo que tus fondos quedan protegidos frente a atacantes clásicos y cuánticos.

QoreX se compone de dos partes que funcionan juntas:

- **Extensión de navegador** — el monedero de escritorio, **disponible y público en Chrome, Firefox y Safari (macOS)**. Es un monedero autónomo (crear/importar, guardar y enviar QOR) y, a la vez, el conector que permite a cualquier sitio web detectar QoreX y convertir cada solicitud en una aprobación explícita. Consulta [Extensión de navegador](/qorex/browser-extension).
- **Aplicación móvil** (Android e iOS) — el monedero completo: crear/restaurar, enviar y recibir QOR resistente a la computación cuántica, redes externas, staking, portafolio, recuperación y un navegador de dApps integrado. **En Google Play** para Android y **en la App Store** para iOS (consulta la disponibilidad más abajo).

:::caution Haz una copia de seguridad de tu frase de recuperación en cuanto crees un monedero
QoreX es no custodial: QoreChain Association no puede recuperar un monedero perdido, restablecerlo ni restaurarlo por ti. **Desinstalar la aplicación, restablecer el teléfono o quitar la extensión borra tus claves de ese dispositivo.** Anota tu frase de recuperación de 24 palabras (la aplicación móvil no la muestra mientras crea el monedero — revélala desde **Ajustes → Seguridad → Mostrar frase de recuperación**; la extensión la muestra una sola vez al crearlo) y, si puedes, configura la [recuperación social](/qorex/security-and-recovery#social-recovery). Consulta [Haz la copia ahora](/qorex/security-and-recovery#back-up-now).
:::

## Disponibilidad por plataforma {#platform-availability}

| Funcionalidad | Aplicación móvil (Android e iOS) | Extensión de navegador |
|---|---|---|
| Crear / importar un monedero | ✅ (la aplicación no muestra la frase al crear el monedero — revélala desde Ajustes → Seguridad) | ✅ (autónoma; la frase se muestra una sola vez al crearlo) |
| Varios monederos, cada uno con su propia frase de recuperación | ✅ (Ajustes → Monederos) | ✅ (**Monederos**, una sola contraseña para todos) |
| Varias cuentas a partir de una sola frase de recuperación | ✅ (hasta 20 por monedero) | ✅ |
| Cuenta de estilo Ethereum (coin 60), añadida a mano | ✅ | ✅ |
| Enviar y recibir QOR (poscuántico) | ✅ | ✅ (Enviar; Recibir con QR) |
| Recibir en cualquier red compatible | ✅ | ✅ |
| Pagar a un @handle | ✅ | ✅ |
| Reclamar un @handle | ✅ (requiere una cuenta con sesión iniciada) | — (la extensión te remite a la aplicación) |
| Staking: delegar, deshacer delegación, mover el stake, reclamar, reclamar y volver a hacer staking | ✅ | ✅ |
| Redes externas (Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis, Celestia + tokens) | ✅ | ✅ (envío desde la ventana emergente) |
| Añadir un token por contrato (redes EVM) | ✅ | ✅ |
| Ventana de acceso EVM | ✅ | ✅ |
| Idioma de la interfaz (10 idiomas) | ✅ (sigue el idioma del teléfono) | ✅ (sigue el idioma del navegador) |
| Portafolio, Q-Day Scanner, Recuperación social, Legacy | ✅ | — |
| Búsqueda, recorrido de primer uso, widget de pantalla de inicio, notificaciones push | ✅ | — |
| Conexiones con dApps | ✅ (navegador integrado, limitadas a la sesión) | ✅ (cualquier sitio web; **Sitios conectados** con Revocar) |
| Swap | Solo Android, desactivado hasta que haya liquidez en el pool (no se muestra en iOS) | — |
| Inicio de sesión de cuenta y solicitudes de pago | ✅ | — |
| Vinculación de varios dispositivos | ✅ | — |
| Emparejamiento con el Dashboard | ✅ | ✅ (conexión + transferencias propuestas, incl. staking) |

## Por qué QoreX es diferente

- **Resistente a la computación cuántica por defecto** — las transferencias de QOR en el carril Native llevan siempre una firma híbrida ML-DSA-87 + secp256k1. Todo lo que sea clásico (cadenas externas) se indica con claridad, nunca en silencio.
- **Verdaderamente no custodial** — las claves se generan en el dispositivo y residen en una bóveda respaldada por hardware (Secure Enclave en iOS, StrongBox en Android) o en una bóveda cifrada (extensión). Nunca salen de tu dispositivo.
- **Sin analíticas, sin informes de fallos y sin ningún SDK de rastreo** en ninguna aplicación de QoreX. Unos pocos extras opcionales usan un servidor solo cuando tú los activas: el inicio de sesión de cuenta (consulta [Cuenta y Dashboard](/qorex/account-and-dashboard)) y las notificaciones push, que registran tu dispositivo y tus direcciones *públicas* para que QoreX pueda avisarte cuando llegue QOR. El monedero nunca depende de ninguno de los dos. La lista completa está en [Qué envía QoreX por la red](#data-and-privacy).
- **Un único saldo unificado** — tus QOR forman un solo saldo entre los carriles Native, EVM y SVM; QoreX lo muestra como una sola cifra.
- **Varias vías de recuperación** — una frase de recuperación de 24 palabras (siempre; en el móvil, revélala desde Ajustes → Seguridad), recuperación social opcional con guardianes y un bloqueo temporal de 48 horas, herencia Legacy opcional y una cómoda vinculación de varios dispositivos.

## Primeros pasos

- ¿Es tu primera vez con QoreX? Empieza por [Primeros pasos](/qorex/getting-started) para crear o restaurar tu monedero.
- Después aprende a [Enviar y recibir](/qorex/send-and-receive) QOR resistente a la computación cuántica.
- Configura tu red de seguridad en [Seguridad y recuperación](/qorex/security-and-recovery).
- En el escritorio, instala la [Extensión de navegador](/qorex/browser-extension).

## Descarga y disponibilidad {#availability}

- **Extensión de navegador** — disponible y pública: instálala desde [Chrome Web Store, Firefox Add-ons o la Mac App Store (Safari)](/qorex/browser-extension#install). Instala siempre desde una ficha de tienda oficial.
- **Aplicación para Android** — disponible en producción en Google Play: https://play.google.com/store/apps/details?id=network.qore.qorex (Android 7.0 o posterior).
- **Aplicación para iOS** — disponible en la **App Store**: https://apps.apple.com/us/app/qorex-wallet/id6791256626 (iOS 15.1 o posterior).

## Qué versión está disponible en cada plataforma {#versions}

La revisión de cada tienda sigue su propio calendario, así que cada tienda sirve su propia compilación, y Google Play y Chrome Web Store van actualmente por detrás de las demás. Esta es la versión actual **en cada tienda** a fecha de **20 de octubre de 2026**:

| Tienda | Versión actual | Nota |
|---|---|---|
| Apple App Store (iOS) | 1.1.7 | publicada el 15 de octubre |
| Google Play (Android) | 1.1.6 | la 1.1.7 está subida pero todavía no es pública — la ficha pública sigue mostrando la 1.1.6 |
| Chrome Web Store | 0.3.6 | sigue sirviendo la 0.3.6 |
| Firefox Add-ons | 0.3.7 | |
| Safari (Mac App Store) | 1.7.7, con la extensión 0.3.7 | la Mac App Store usa su propia numeración `1.x` |

Las tiendas siempre muestran su versión actual, y una tienda que todavía sirva una compilación anterior se pondrá al día automáticamente. Las funciones que se indican a continuación como **1.1.7 / 0.3.7** están activas en las tiendas de la tabla que ya incluyen esa compilación (iOS, Firefox, Safari) y llegarán a Google Play y Chrome cuando esas fichas se actualicen. En este manual no se describe como disponible nada más reciente que 1.1.7 / 0.3.7.

Qué han cambiado para ti las compilaciones 1.1.7 / 0.3.7:

- **Las aprobaciones rechazan una solicitud cuyos bytes pueden leerse de dos maneras.** Si el mismo campo aparece dos veces en una solicitud, una pantalla y la cadena podrían discrepar sobre lo que se está firmando — por ejemplo, una comisión o un importe mostrados de forma distinta a la ejecutada. Ahora QoreX rechaza una solicitud así en lugar de mostrar una sola lectura de ella. Consulta [Qué muestra la ventana de aprobación](/qorex/security-and-recovery#approvals).
- **La caducidad de las concesiones se muestra al segundo**, y los votos de gobernanza se decodifican y se muestran en la pantalla de aprobación.
- **Los sitios se identifican por el origen que atestigua el propio navegador**, no por lo que una solicitud afirma de sí misma.
- **Las búsquedas de @handle vuelven a funcionar en la extensión.**
- **Reclamar un @handle requiere una cuenta con sesión iniciada y se hace en la aplicación**; la extensión te remite a ella.
- **Los nombres de QoreChain que se le parecen están reservados**, de modo que un handle nuevo no puede imitar al proyecto ni a su personal.

Novedades destacadas desde 1.0.9 / 0.2.6:

- **Varios monederos** en un mismo teléfono o navegador, cada uno con su propia frase de recuperación, con cambio en un toque — consulta [Varios monederos](/qorex/getting-started#several-wallets).
- **Cuenta de estilo Ethereum (coin 60)**, añadida a mano, para frases que se usaron primero en MetaMask o en el Dashboard — consulta [Restaurar una frase de MetaMask o del Dashboard](/qorex/getting-started#restore-dashboard).
- **Añadir un token por contrato**, **Recibir en cualquier red**, **búsqueda** global, un **recorrido** de primer uso, un **widget de pantalla de inicio** y **notificaciones push** cuando llega QOR (móvil) — consulta [Enviar y recibir](/qorex/send-and-receive).
- **Reclamar y volver a hacer staking**, una comprobación de comisión antes de reclamar, una lista de **Unstaking en curso** y avisos antes de que hagas staking de forma que te quedes sin poder deshacerlo — consulta [Portafolio y staking](/qorex/portfolio-and-staking).
- Pantallas de aprobación que muestran cada mensaje, la comisión, los límites de gasto y la caducidad, y rechazan lo que QoreX no puede mostrar; **`signAndBroadcast`** para dApps; **Sitios conectados** con Revocar (extensión); la **ventana de acceso EVM** — consulta [Seguridad y recuperación](/qorex/security-and-recovery) y la [Extensión de navegador](/qorex/browser-extension).
- Correcciones: una cuenta con fondos podía desaparecer momentáneamente de "Tus cuentas" (1.0.9); el botón físico Atrás de Android ahora retrocede una pantalla (1.1.1); la frase de recuperación se oculta a los servicios que no son de accesibilidad en Android 14 y posteriores (1.1.6).

QoreX funciona en la mainnet `qorechain-vladi`, que ejecuta la cadena **v3.2.3** (activa desde el 7 de junio de 2026) hasta la altura 3,742,566 y v3.2.4 desde ese bloque. El formato de firma, las direcciones, los decimales, los memos y las comisiones no cambian en estas actualizaciones, por lo que no hace falta ninguna actualización de QoreX para ellas.

## Qué envía QoreX por la red {#data-and-privacy}

QoreX **no tiene analíticas, ni informes de fallos, ni ningún SDK de rastreo**. Tus claves, tu frase de recuperación, la bóveda y tus aprobaciones **nunca salen del dispositivo**. Las aplicaciones sí se comunican con la red, como debe hacer cualquier monedero; esta es la lista completa.

**Siempre (necesario para mostrar saldos y enviar):**

- **Endpoints públicos de QoreChain** (`api`, `rpc`, `evm` y `svm` en `qore.host`, y los equivalentes `-testnet`) para saldos, historial y difusión de transacciones. Estas solicitudes llevan tu dirección `qor1…` **pública**.
- **Consulta de precio** — una solicitud para el precio de QOR, que **no lleva ninguna dirección**.
- **Redes externas que tienes o consultas** — servicios RPC/REST públicos de terceros para esa red, que llevan tu dirección **pública** en esa red.
- **Registro de @handle** — lleva el handle que consultas, o una dirección pública.

**Solo si lo activas:**

- **Notificaciones push** (móvil) — desactivadas hasta que las actives. El servidor recibe entonces el token de tu dispositivo y las direcciones `qor1…` públicas del monedero en uso (hasta 10). Un dispositivo del que el servidor no ha tenido noticias en 90 días se olvida.
- **Recuperación social** — el relé almacena **solo texto cifrado**.
- **Inicio de sesión** (correo electrónico, o Apple o Google) — necesario para reclamar un @handle, para vincular con el Dashboard y para usar las solicitudes de pago.
- **Conexión con el Dashboard y direcciones vinculadas** — envía una prueba firmada de que eres el propietario de la dirección.
- **Solicitudes de pago** — envían el handle de origen, el handle de destino, el importe y una nota opcional.

**El widget de pantalla de inicio** no hace ninguna solicitud propia a los servidores de QoreChain: la aplicación le entrega localmente tu dirección, tu saldo y el indicador de privacidad, y el widget actualiza el saldo desde el endpoint REST público de QoreChain.

**No hay chat de IA ni servicio QCAI** en ninguna de las dos aplicaciones.
