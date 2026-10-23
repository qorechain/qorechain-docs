---
slug: /qorex/security-and-recovery
title: Seguridad y recuperación
sidebar_label: Seguridad y recuperación
sidebar_position: 5
---

# Seguridad y recuperación

Todo lo relacionado con proteger y recuperar tu monedero se encuentra en **Ajustes → Seguridad**. La pestaña Inicio también muestra una tarjeta de **Estado de la copia de seguridad** que sigue avisando hasta que se configura la recuperación social. La tarjeta solo controla la recuperación social: no puede saber si has anotado tu frase de recuperación, así que hazlo tú mismo (consulta más abajo).

## Haz una copia de seguridad ahora — nadie puede recuperar un monedero perdido por ti {#back-up-now}

:::danger Lee esto antes de financiar tu monedero
QoreX es **sin custodia**: tus claves existen únicamente en tu propio dispositivo, y QoreChain Association no tiene ninguna copia de ellas, ninguna clave maestra ni ninguna forma de restablecer o restaurar tu monedero. **No existe un flujo de "olvidé mi contraseña", ni un ticket de soporte, ni una anulación por parte de atención al cliente**: si pierdes el acceso a tus claves sin tener una copia de seguridad, los fondos se pierden, de forma permanente e irreversible. Esto es así en todo monedero sin custodia, no es una limitación de QoreX, pero merece la pena decirlo con claridad.

**Haz al menos una de estas dos cosas — justo después de crear tu monedero, no más tarde:**

1. **Anota tu frase de recuperación de 24 palabras** y guárdala en algún lugar sin conexión y duradero (no una captura de pantalla, no una nota sincronizada con la nube, no un mensaje a ti mismo). Es lo único que puede restaurar tu monedero en cualquier dispositivo, en cualquier momento — en móvil, muéstrala desde **Ajustes → Seguridad → Mostrar frase de recuperación** (la aplicación **no** la muestra mientras crea el monedero, así que tienes que ir a buscarla: hazlo de inmediato); en la extensión se muestra una sola vez al crear el monedero, y en cualquier momento desde **Mostrar frase de recuperación** en la ventana emergente. Consulta [Restaurar un monedero existente](/qorex/getting-started#2-restore-an-existing-wallet).
2. **Configura la [recuperación social](#social-recovery)** con guardianes de tu confianza. Esto te permite recuperar tu monedero incluso si pierdes la frase, sin que ningún guardián por sí solo pueda acceder jamás a tus fondos.

Hacer ambas cosas es la opción más segura: la frase te protege si cambias de dispositivo o la aplicación no está disponible; los guardianes te protegen si pierdes la propia frase.

**Desinstalar la aplicación elimina tus claves de ese dispositivo.** La bóveda de la aplicación móvil y la bóveda de la extensión del navegador residen únicamente en el dispositivo que las creó. Desinstalar la aplicación, restablecer el teléfono o eliminar/borrar la extensión elimina esa copia: sin una copia de seguridad y sin un dispositivo vinculado, nadie puede recuperar tu monedero, ni siquiera QoreChain. **Quitar un monedero de un teléfono o de un navegador** (Ajustes → Monederos → *Quitar de este teléfono*, o *Quitar de este navegador* en la extensión) elimina la clave de ese monedero del dispositivo de la misma manera: tus fondos permanecen en la cadena, pero solo su frase de recuperación puede devolverlo.
:::

## Clave post-cuántica {#pqc-key}

La pantalla de Seguridad muestra el estado en cadena en vivo de tu clave post-cuántica: **"Se registra con tu primera transferencia"** → **"Registrada en cadena ✓"**. El algoritmo es **ML-DSA-87** (determinista, híbrido con secp256k1).

**Rotación de clave** — rotar tu clave post-cuántica (una operación `MsgRotatePQCKey` en cadena) **todavía no está disponible dentro de QoreX**; llegará con una actualización posterior de gestión de claves, requerirá una nueva confirmación biométrica y **nunca se automatiza**. Los sitios web no pueden pedirle a QoreX que registre, migre o rote tu clave post-cuántica. El registro se hace por sí solo con tu primera transferencia y no requiere nada de ti — desde v3.2.3 la cadena también acepta una *prueba de posesión* opcional junto con el registro, que QoreX gestiona de forma invisible en las compilaciones actuales de las tiendas. Consulta [Rotación de clave](/developer-guide/post-quantum-signing#key-rotation) para ver el mecanismo subyacente.

## Recuperación social {#social-recovery}

La recuperación social permite que **guardianes** de confianza te ayuden a restaurar tu monedero sin ver jamás tu frase de recuperación.

- Tu semilla se divide en **fragmentos sellados con ML-KEM** — por defecto tres, de los cuales cualesquiera **dos** pueden ayudarte a recuperar (un esquema de umbral 2-de-3); uno solo no puede.
- Cada guardián recibe una credencial. La configuración no escribe nada legible en el relay: solo sobres opacos y sellados.
- Una recuperación requiere que el umbral de guardianes la apruebe, luego ejecuta un **bloqueo temporal de 48 horas** y te envía una **alerta de cancelación**, para que se pueda detener un intento malicioso.

**Configúrala:** Inicio → **Configurar recuperación** (o Ajustes → Seguridad → Recuperación social) → **Crear credenciales de guardián**. QoreX crea tres credenciales — *Guardián 1*, *Guardián 2* y una *Copia de seguridad imprimible* — y cualesquiera **2 de las 3** pueden ayudarte a recuperar. Entrega una a cada persona o dispositivo de confianza y guarda la copia de seguridad imprimible en un lugar seguro. El aviso de Estado de la copia de seguridad desaparece una vez hecho esto.

**Aprobar la recuperación de otra persona:** si eres guardián de alguien, usa **Ayudar a recuperar** en la pestaña Inicio para aprobar su solicitud.

## Legacy Protocol {#legacy}

**Legacy Protocol** es una herencia resistente a la computación cuántica: un interruptor de hombre muerto superpuesto a tus guardianes, para que tus activos puedan pasar a los beneficiarios que elijas si quedas ilocalizable. Es opcional y se configura desde Ajustes → Seguridad.

## Vincular un nuevo dispositivo {#link-device}

Traslada tu monedero a un segundo teléfono o tableta **sin servidor y sin escribir** las 24 palabras:

1. **Nuevo dispositivo** → incorporación → **Vincular desde otro dispositivo**. Muestra un **código de 10 caracteres** de un solo uso y abre la cámara.
2. **Dispositivo antiguo** → Ajustes → Seguridad → **Vincular un nuevo dispositivo** → escribe ese código → confirma con biometría. Aparece un **código QR** (tu semilla sellada con una clave derivada del código: scrypt N=2¹⁷ → AES-256-GCM).
3. **Nuevo dispositivo** escanea el QR → se descifra localmente → mismo monedero, mismas direcciones.

**Por qué es seguro:** el código y el QR nunca aparecen en la misma pantalla. Una foto del QR por sí sola es texto cifrado tras una función de derivación de claves con uso intensivo de memoria, y ambos artefactos son de un solo uso y desaparecen con las pantallas. Un código incorrecto da un error limpio: solo tienes que reintentar.

:::note
La vinculación de dispositivos es una **comodidad**, no un método de recuperación. Tu frase de 24 palabras y la recuperación social son tus verdaderas redes de seguridad.
:::

## Ventana de acceso EVM {#evm-window}

Desde la cadena **v3.2.0**, una transacción en la **lane EVM** —por ejemplo, una que firmas en MetaMask contra la red EVM de QoreChain— solo se admite desde una cuenta que tenga una **clave post-cuántica registrada** *y* una **ventana de autorización abierta**. Abrir una ventana es un mensaje de la lane Native de QoreChain que MetaMask no puede producir, así que QoreX es el lugar donde la abres. Los envíos propios de QoreX usan la lane Native y nunca necesitan una ventana.

**Quién la necesita.** Una ventana es para las **cuentas de estilo Ethereum (coin 60)** — las cuentas que añades con *Add an Ethereum account (coin 60)* para una frase usada primero en MetaMask (consulta [Restaurar una frase desde MetaMask o el Dashboard](/qorex/getting-started#restore-dashboard)). MetaMask firma con una clave de Ethereum, que es la clave de una cuenta coin 60; ninguna clave de MetaMask puede enviar desde una cuenta `qor1…` ordinaria de coin 118, así que una ventana abierta en una de ellas no consigue nada y solo cuesta la comisión.

Ábrela en la aplicación en **Ajustes → Seguridad → Ventana de acceso EVM**, o con el botón **Ventana de acceso EVM** en la ventana emergente de la extensión. Eliges:

| Campo | Significado | Límite |
|---|---|---|
| **Duración (bloques, máx. 17280)** | cuánto tiempo permanece abierta la ventana | hasta 17,280 bloques (unas 15 horas en mainnet) |
| **Cuántas transacciones (máx. 1000)** | cuántas transacciones EVM admite | hasta 1,000 |
| **Límite de gasto, QOR — cubre cada importe enviado MÁS su comisión máxima** | lo máximo que deja pasar | cuenta el valor **más** la comisión máxima de cada transacción |

Desde la v3.2.3 la cadena también admite ventanas más estrechas y *acotadas*; QoreX no ofrece una pantalla para ellas. Los valores por defecto son 300 bloques (unos 16 minutos en mainnet), 5 transacciones y 1 QOR. Abrirla cuesta una comisión de red normal y se firma con la firma híbrida post-cuántica habitual, y una ventana nueva **sustituye** a cualquier ventana que ya esté abierta. Abrirla también avanza el nonce de tu cuenta, así que abre la ventana **primero** y luego envía desde MetaMask: una transacción preparada antes será rechazada con "nonce too low". **Cerrar la ventana** solo se ofrece mientras hay una ventana activa.

La pantalla muestra uno de cuatro estados: *Abierta durante \{blocks\} bloques más · \{txs\} transacciones · \{value\} QOR restantes*; *No hay ninguna ventana abierta. Las transacciones de MetaMask desde esta cuenta son rechazadas.*; *Esa ventana ha caducado o se ha agotado*; o *QoreX no pudo leer la ventana desde la red* — lo que significa que QoreX no lo sabe, **no** que no tengas ninguna. Si tu cuenta todavía no tiene una clave post-cuántica, registra una primero (tu primera transferencia de QoreX lo hace); una ventana no ayudará antes de eso.

:::caution Mantenla pequeña y corta
Una ventana permite que transacciones normales de MetaMask muevan tu QOR **sin una firma post-cuántica**. Mantén los límites bajos — un límite de gasto pequeño, pocas transacciones, poco tiempo — y cierra la ventana cuando termines. Abrir una ventana nueva sustituye a la anterior, y el límite cuenta cada importe que envías **más** su comisión máxima, de modo que se rechaza una transacción que superaría el límite.
:::

QoreX nunca envía por sí mismo en la lane EVM de QoreChain; usa MetaMask u otro monedero EVM para eso, dentro de una ventana abierta. (Enviar ETH, BNB y otros activos en *otras* redes desde QoreX es otra cosa — consulta [Redes y tokens externos](/qorex/send-and-receive#external-networks-tokens).)

## Qué muestra la ventana de aprobación {#approvals}

Cada firma que produce QoreX la apruebas tú, y la aprobación enumera exactamente lo que estás firmando. QoreX muestra:

- un título y campos etiquetados para **cada mensaje** de la solicitud, incluidos los mensajes anidados dentro de un **MsgExec** de authz y los términos de las concesiones de permisos — y **rechaza** todo lo que no pueda mostrar ("QoreX no puede leer este mensaje … Aprueba solo si confías plenamente en este sitio");
- la **comisión** (*Comisión: \{amount\} · gas \{gas\}*), quién la paga y cualquier concesión de comisión (fee grant) — si no se puede leer la comisión, QoreX lo dice y te indica que no apruebes;
- el **límite, la acción permitida y la caducidad** de las asignaciones de gasto y las concesiones authz, con *UNLIMITED* y *NEVER* escritos explícitamente; una caducidad se muestra al segundo (`YYYY-MM-DD HH:MM:SS UTC`), y un voto de gobernanza se decodifica para que veas sobre qué estás votando. Cualquier cosa ilegible, ilimitada o interminable requiere un **segundo toque** en Aprobar (*Toca de nuevo para aprobar*);
- la cuenta firmante (*Firmado por …*) cuando tienes varias;
- para una solicitud con un número muy grande de mensajes, los primeros 50 y el recuento del resto.

QoreX también **rechaza una solicitud cuyos bytes pueden leerse de dos maneras** (desde 1.1.7 / 0.3.7). Una solicitud que repite un campo que debería aparecer una sola vez — por ejemplo, una comisión o un importe duplicados — podría mostrarse de una forma y ejecutarse de otra, así que QoreX no la mostrará para su aprobación en absoluto. En el caso de los sitios web, QoreX identifica el sitio solicitante por el origen que atestigua el propio navegador, nunca por lo que la solicitud dice de sí misma.

Un cambio de monedero o de cuenta, o bloquear el monedero, responde "no" a las solicitudes en espera; un sitio puede tener una solicitud en espera, y en total pueden esperar tres. Los nombres de los campos en las ventanas de aprobación se muestran en inglés en algunas compilaciones.

## Tu frase de recuperación y las herramientas de accesibilidad {#phrase-privacy}

La pantalla de la frase de recuperación pide una biometría o un PIN del dispositivo nuevos cada vez, muestra las palabras en una cuadrícula numerada de solo lectura **sin botón de copiar**, está bloqueada para las capturas de pantalla en Android y está oculta en el selector de aplicaciones. En **Android 14 y posterior**, las palabras también se ocultan a los servicios de accesibilidad que no son herramientas de accesibilidad genuinas (TalkBack y otros lectores de pantalla reales aún pueden leerlas). En versiones anteriores de Android y en iOS, las palabras se ocultan por defecto a los lectores de pantalla; si dependes de un lector de pantalla, toca el aviso de esa pantalla para permitir que las lea. Muestra la frase solo cuando nadie pueda ver tu pantalla.

## dApps conectadas {#connected-dapps}

Las conexiones de dApps son **por origen**. En la aplicación también son **de alcance de sesión**: al cerrar el navegador de dApps integrado se revocan todas las conexiones, de modo que nada permanece conectado en segundo plano (la tarjeta **dApps conectadas** en Ajustes → Seguridad simplemente lo indica). En la extensión del navegador, las conexiones persisten hasta que las eliminas: abre **Sitios conectados** en la ventana emergente para ver todos los sitios que este monedero aprobó y **Revocar** cualquiera de ellos.

## Firmantes vinculados y límites de gasto {#linked-signers}

Vincular una clave externa (Phantom o MetaMask) como **firmante vinculado** con sus propios límites de gasto **todavía no está disponible dentro de QoreX**: Ajustes → Seguridad muestra la tarjeta, con la acción marcada como *próximamente*. Nada está vinculado a tu monedero a menos que lo hayas hecho tú mismo fuera de QoreX. La gestión de claves nunca puede delegarse en una clave vinculada. Para ver el modelo en cadena, consulta [Autenticadores de monederos vinculados](/developer-guide/account-abstraction#authenticators).

## Q-Day Scanner {#q-day-scanner}

El **Q-Day Scanner** te permite introducir cualquier dirección —la tuya o la de cualquiera— y obtener un informe de exposición cuántica: qué fondos se encuentran en claves solo clásicas y cuáles ya están protegidos post-cuánticamente. Accede a él desde los botones rápidos de la pestaña Inicio.

## Modelo de seguridad, en resumen

1. **Sin custodia** — las claves se generan en el dispositivo, residen en bóvedas respaldadas por hardware (móvil) o en una bóveda cifrada (extensión), y nunca salen.
2. **Nada sin consentimiento** — cada conexión es por origen, cada firma se aprueba individualmente (biométrica en móvil), y las cargas útiles siempre se decodifican antes de firmar: lo que QoreX no puede decodificar, lo rechaza.
3. **Resistente a la computación cuántica por defecto** — las transferencias de QOR de la lane Native siempre llevan ML-DSA-87 + secp256k1; cualquier cosa clásica se etiqueta, nunca es silenciosa.
4. **Sin analíticas, sin informes de fallos y sin ningún SDK de rastreo.** Las claves, la frase de recuperación, la bóveda y las aprobaciones nunca salen del dispositivo. El inicio de sesión opcional, las notificaciones push y la recuperación social usan un servidor solo cuando los activas; la lista completa de lo que envía QoreX está en [Qué envía QoreX por la red](/qorex/overview#data-and-privacy), y la [política de privacidad de QoreChain](https://qorechain.io/privacy) la cubre.
5. **Rutas de recuperación** — frase de 24 palabras (siempre), recuperación social con guardianes + bloqueo temporal de 48h (opcional), herencia Legacy (opcional), vinculación de dispositivos (comodidad).
