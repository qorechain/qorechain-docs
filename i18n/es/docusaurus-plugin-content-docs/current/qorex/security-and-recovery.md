---
slug: /qorex/security-and-recovery
title: Seguridad y recuperación
sidebar_label: Seguridad y recuperación
sidebar_position: 5
---

# Seguridad y recuperación

Todo lo relacionado con proteger y recuperar tu monedero se encuentra en **Ajustes → Panel de seguridad**. La pestaña Inicio también muestra una tarjeta de **Estado de la copia de seguridad** que sigue avisando hasta que se configura la recuperación social.

## Haz una copia de seguridad ahora — nadie puede recuperar un monedero perdido por ti {#back-up-now}

:::danger Lee esto antes de financiar tu monedero
QoreX es **sin custodia**: tus claves existen únicamente en tu propio dispositivo, y QoreChain Association no tiene ninguna copia de ellas, ninguna clave maestra ni ninguna forma de restablecer o restaurar tu monedero. **No existe un flujo de "olvidé mi contraseña", ni un ticket de soporte, ni una anulación por parte de atención al cliente**: si pierdes el acceso a tus claves sin tener una copia de seguridad, los fondos se pierden, de forma permanente e irreversible. Esto es así en todo monedero sin custodia, no es una limitación de QoreX, pero merece la pena decirlo con claridad.

**Haz al menos una de estas dos cosas — justo después de crear tu monedero, no más tarde:**

1. **Anota tu frase de recuperación de 24 palabras** y guárdala en algún lugar sin conexión y duradero (no una captura de pantalla, no una nota sincronizada con la nube, no un mensaje a ti mismo). Es lo único que puede restaurar tu monedero en cualquier dispositivo, en cualquier momento — en móvil, restaurar directamente desde la frase requiere la versión **1.0.4 o posterior** (las compilaciones anteriores solo ofrecen la vía del guardián; consulta [Restaurar un monedero existente](/qorex/getting-started#2-restore-an-existing-wallet)). La extensión siempre restaura directamente desde la frase, en todas las versiones.
2. **Configura la [recuperación social](#social-recovery)** con guardianes de tu confianza. Esto te permite recuperar tu monedero incluso si pierdes la frase, sin que ningún guardián por sí solo pueda acceder jamás a tus fondos.

Hacer ambas cosas es la opción más segura: la frase te protege si cambias de dispositivo o la aplicación no está disponible; los guardianes te protegen si pierdes la propia frase.

**Desinstalar la aplicación elimina tus claves de ese dispositivo.** La bóveda de la aplicación móvil y la bóveda de la extensión del navegador residen únicamente en el dispositivo que las creó. Desinstalar la aplicación, restablecer el teléfono o eliminar/borrar la extensión elimina esa copia: sin una copia de seguridad y sin un dispositivo vinculado, nadie puede recuperar tu monedero, ni siquiera QoreChain.
:::

## Clave post-cuántica {#pqc-key}

El Panel de seguridad muestra el estado en cadena en vivo de tu clave post-cuántica: **"Se registra con tu primera transferencia"** → **"Registrada en cadena ✓"**. El algoritmo es **ML-DSA-87** (determinista, híbrido con secp256k1).

**Rotación de clave** — rotar tu clave post-cuántica (una operación `MsgRotatePQCKey` en cadena) requiere una nueva ceremonia biométrica y **nunca se automatiza**. Consulta [Rotación de clave](/developer-guide/post-quantum-signing#key-rotation) para ver el mecanismo subyacente.

## Recuperación social {#social-recovery}

La recuperación social permite que **guardianes** de confianza te ayuden a restaurar tu monedero sin ver jamás tu frase de recuperación.

- Tu semilla se divide en **fragmentos sellados con ML-KEM** que se distribuyen a los guardianes como un esquema de **umbral** (t-de-n): cualquier grupo de *t* de tus *n* guardianes puede ayudarte a recuperar, pero menos no pueden.
- Cada guardián recibe una credencial. La configuración no escribe nada legible en el relay: solo sobres opacos y sellados.
- Una recuperación requiere que el umbral de guardianes la apruebe, luego ejecuta un **bloqueo temporal de 48 horas** y te envía una **alerta de cancelación**, para que se pueda detener un intento malicioso.

**Configúrala:** Panel de seguridad → Recuperación social → elige tus guardianes y el umbral. El aviso de Estado de la copia de seguridad desaparece una vez hecho esto.

**Aprobar la recuperación de otra persona:** si eres guardián de alguien, usa **Ayudar a recuperar** en la pestaña Inicio para aprobar su solicitud.

## Legacy Protocol {#legacy}

**Legacy Protocol** es una herencia resistente a la computación cuántica: un interruptor de hombre muerto superpuesto a tus guardianes, para que tus activos puedan pasar a los beneficiarios que elijas si quedas ilocalizable. Es opcional y se configura desde el Panel de seguridad.

## Vincular un nuevo dispositivo {#link-device}

Traslada tu monedero a un segundo teléfono o tableta **sin servidor y sin escribir** las 24 palabras:

1. **Nuevo dispositivo** → incorporación → **Vincular desde otro dispositivo**. Muestra un **código de 10 caracteres** de un solo uso y abre la cámara.
2. **Dispositivo antiguo** → Ajustes → Seguridad → **Vincular un nuevo dispositivo** → escribe ese código → confirma con biometría. Aparece un **código QR** (tu semilla sellada con una clave derivada del código: scrypt N=2¹⁷ → AES-256-GCM).
3. **Nuevo dispositivo** escanea el QR → se descifra localmente → mismo monedero, mismas direcciones.

**Por qué es seguro:** el código y el QR nunca aparecen en la misma pantalla. Una foto del QR por sí sola es texto cifrado tras una función de derivación de claves con uso intensivo de memoria, y ambos artefactos son de un solo uso y desaparecen con las pantallas. Un código incorrecto da un error limpio: solo tienes que reintentar.

:::note
La vinculación de dispositivos es una **comodidad**, no un método de recuperación. Tu frase de 24 palabras y la recuperación social son tus verdaderas redes de seguridad.
:::

## dApps conectadas {#connected-dapps}

Las conexiones de dApps son **por origen** y **de alcance de sesión**: al cerrar el navegador de dApps integrado se revocan todas las conexiones. Puedes revisar y desconectar las conexiones activas en el Panel de seguridad.

## Firmantes vinculados y límites de gasto {#linked-signers}

Cuando vinculas claves externas (Phantom / MetaMask) a través del [Dashboard](/qorex/account-and-dashboard#dashboard), cada una obtiene **permisos delimitados** y una **SpendingRule** que se aplica **en cadena**, no solo en la interfaz. La gestión de claves nunca puede delegarse en una clave vinculada. Consulta [Autenticadores de monederos vinculados](/developer-guide/account-abstraction#authenticators) para ver el modelo en cadena. El panel siempre muestra la verdad actual en cadena.

## Q-Day Scanner {#q-day-scanner}

El **Q-Day Scanner** te permite introducir cualquier dirección —la tuya o la de cualquiera— y obtener un informe de exposición cuántica: qué fondos se encuentran en claves solo clásicas y cuáles ya están protegidos post-cuánticamente. Accede a él desde los botones rápidos de la pestaña Inicio.

## Modelo de seguridad, en resumen

1. **Sin custodia** — las claves se generan en el dispositivo, residen en bóvedas respaldadas por hardware (móvil) o en una bóveda cifrada (extensión), y nunca salen.
2. **Nada sin consentimiento** — cada conexión es por origen, cada firma se aprueba individualmente (biométrica en móvil), y las cargas útiles siempre se decodifican antes de firmar.
3. **Resistente a la computación cuántica por defecto** — las transferencias de QOR de la lane Native siempre llevan ML-DSA-87 + secp256k1; cualquier cosa clásica se etiqueta, nunca es silenciosa.
4. **Sin recopilación de datos** — sin analítica, seguimiento ni anuncios. El inicio de sesión de cuenta opcional está cubierto por la [política de privacidad de QoreChain](https://qorechain.io/privacy).
5. **Rutas de recuperación** — frase de 24 palabras (siempre), recuperación social con guardianes + bloqueo temporal de 48h (opcional), herencia Legacy (opcional), vinculación de dispositivos (comodidad).
