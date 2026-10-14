---
slug: /qorex/getting-started
title: Primeros pasos con QoreX
sidebar_label: Primeros pasos
sidebar_position: 2
---

# Primeros pasos con QoreX

Esta página explica cómo instalar la **aplicación móvil** y crear, restaurar o vincular tu wallet. Para la wallet de escritorio, consulta la [Extensión de navegador](/qorex/browser-extension), disponible en Chrome, Firefox y Safari.

:::note Disponibilidad móvil
- **Android** — disponible en producción en Google Play (Android 7.0 o posterior): https://play.google.com/store/apps/details?id=network.qore.qorex
- **iOS** — disponible en la App Store (iOS 15.1 o posterior): https://apps.apple.com/us/app/qorex-wallet/id6791256626
:::

## Antes de empezar: protege tu dispositivo

Una wallet de QoreX solo puede crearse o importarse cuando tu dispositivo tiene configurado un **factor de desbloqueo fuerte**. Esto es lo que protege tus claves en la bóveda de hardware. Cualquiera de las siguientes opciones es válida:

- **iOS** — Face ID o Touch ID.
- **Android** — un biométrico de Clase 3 (huella, iris o desbloqueo facial 3D) **o** un bloqueo de pantalla del dispositivo (PIN, patrón o contraseña).

:::note Desbloqueo facial 2D en Android
El desbloqueo facial 2D basado en cámara (presente en algunos dispositivos, por ejemplo ciertos modelos Samsung) se considera un biométrico *débil*. Si es lo único que tienes, QoreX se apoya en el **PIN / patrón** subyacente — y la hoja del sistema lo ofrece automáticamente, así que sigues estando cubierto.
:::

Si no hay ningún factor fuerte configurado, los botones de crear/importar permanecen deshabilitados y la pantalla explica qué activar. Configura Face ID, una huella o un bloqueo de pantalla en los ajustes de tu sistema y luego vuelve a QoreX.

## Primer inicio

La app abre en la pantalla de incorporación **solo cuando no existe ninguna wallet en el dispositivo**. Una vez que tienes una wallet, cada inicio posterior va directo a la pestaña de Inicio (Wallet). Ver saldos no requiere biometría; **firmar una transacción siempre la requiere**.

Tienes tres formas de configurarla:

### 1. Crear una wallet nueva

1. Toca **Crear una wallet nueva**.
2. QoreX genera una **frase de recuperación de 24 palabras** en tu dispositivo (entropía de 256 bits), la sella directamente en la bóveda respaldada por hardware y protegida por biometría, y deriva tu identidad de QoreChain — tipo de moneda 118, una dirección `qor1…` (tus cuentas de ETH y SOL provienen de la misma semilla). **La app no te muestra la frase mientras crea la wallet.**
3. **Revela la frase y anótala de inmediato:** abre **Ajustes → Seguridad → Revelar frase de recuperación**, confirma con biometría o con el PIN de tu dispositivo y copia las 24 palabras en papel, en orden. Guárdalas fuera de línea. Esta frase es la **única** forma de recuperar tu wallet si pierdes el dispositivo.
4. Opcionalmente, configura la [recuperación social](/qorex/security-and-recovery#social-recovery). Ten en cuenta que la tarjeta **Estado de la copia de seguridad** en Inicio solo hace seguimiento de la recuperación social — no puede saber si has anotado la frase, así que no te lo recordará.

:::danger Haz el paso 3 ahora — nada en la app te lo recordará
Como la app pasa directamente a Inicio tras crear la wallet, es fácil seguir adelante sin anotar nunca la frase. **Hazlo antes de recibir o enviar cualquier cosa.** Si pierdes o desinstalas la app, o pierdes el teléfono, sin la frase anotada o sin una [recuperación social](/qorex/security-and-recovery#social-recovery) configurada, nadie — ni siquiera QoreChain Association — puede recuperar tus fondos.
:::

:::caution Tu frase de recuperación lo es todo
Cualquiera que tenga tus 24 palabras controla tus fondos, y nadie — ni siquiera QoreChain Association — puede recuperarlos por ti. Nunca escribas tu frase en un sitio web, la compartas ni la guardes en una captura de pantalla o nota en la nube. **Desinstalar QoreX elimina las claves guardadas en ese dispositivo** — sin tu frase escrita (o la [recuperación social](/qorex/security-and-recovery#social-recovery) configurada de antemano), una desinstalación significa la pérdida permanente de acceso. Haz la copia de seguridad antes de fondear la wallet, no después.
:::

### 2. Restaurar una wallet existente {#2-restore-an-existing-wallet}

1. Toca **Restaurar wallet existente**.
2. Elige **Frase de recuperación** (si anotaste tus 24 palabras) o **Recuperación social** (si configuraste guardianes y ya no tienes la frase — consulta [Recuperación social](/qorex/security-and-recovery#social-recovery)).
3. Para la ruta de frase de recuperación: escribe tus 24 palabras en orden. QoreX normaliza mayúsculas/minúsculas y espacios sueltos, verifica la frase y te avisa con claridad si alguna palabra no es válida, en lugar de mostrar un error genérico.
4. QoreX vuelve a derivar las mismas direcciones — tu wallet se ve idéntica en cualquier dispositivo.

:::note Las cuentas adicionales vuelven una a una
Restaurar desde la frase recupera la **Cuenta 1**. Si usabas varias cuentas en la wallet anterior, toca **Añadir una cuenta** (Ajustes → Tus cuentas) para recuperar las siguientes — se derivan de la misma frase, así que reaparecen en las mismas direcciones. Las cuentas de estilo Ethereum se añaden con **Añadir una cuenta Ethereum (coin 60)**; consulta [Restaurar una frase de MetaMask o del Dashboard](#restore-dashboard). Añádelas en el mismo orden en que las creaste en la wallet anterior: las cuentas se numeran por ranura, y un orden distinto en un dispositivo nuevo puede dar una cuenta diferente en una ranura.
:::

### 3. Vincular desde otro dispositivo

Si ya tienes QoreX en otro teléfono o tablet, puedes trasladar la wallet **sin servidor y sin escribir nada** — consulta [Vincular un nuevo dispositivo](/qorex/security-and-recovery#link-device). Elige **Vincular desde otro dispositivo** en el dispositivo nuevo para empezar.

## Varias wallets en un dispositivo {#several-wallets}

Cada wallet tiene su **propia frase de recuperación**. Puedes tener varias en un mismo teléfono — por ejemplo, tu wallet principal y otra restaurada desde otro servicio — y cambiar entre ellas con un toque.

- **Móvil:** Ajustes → **Wallets** muestra las wallets de este teléfono. Toca una para convertirla en la wallet activa — toda la app cambia a ella (no se mueve nada en la cadena). **Añadir una wallet** te permite crear una nueva, restaurar una desde su frase de recuperación o vincular una desde otro dispositivo; las wallets que ya tienes se mantienen. Restaurar una frase que ya está en el teléfono simplemente cambia a ella.
- **Extensión:** la pantalla **Wallets** del popup hace lo mismo, con **una sola contraseña** para todas. Añadir o eliminar una wallet te pide la contraseña una vez, para volver a sellar la bóveda, y desactiva el desbloqueo con passkey (vuelve a activarlo desde la pantalla de inicio).
- **Eliminar una wallet** (*Eliminar de este teléfono* / *Eliminar de este navegador*) borra la clave de esa wallet del dispositivo. Tus fondos permanecen en la cadena, pero solo su frase de recuperación puede recuperarla — anótala antes.

## Restaurar una frase de MetaMask o del Dashboard {#restore-dashboard}

Por defecto, QoreX deriva tu dirección `qor1…` de una frase de recuperación con el tipo de moneda **118**. Una frase que se usó primero en MetaMask — o en una wallet creada en el Dashboard de QoreChain — mantiene sus QOR en una dirección de **estilo Ethereum** (tipo de moneda **60**), por lo que al restaurarla aparece una **Cuenta 1** vacía. No se ha perdido nada; añade la cuenta de estilo Ethereum:

1. Actualiza QoreX a la versión actual desde tu tienda.
2. **Añade una wallet** (Ajustes → Wallets → *Añadir una wallet* → *Restaurar wallet existente*) e introduce la frase. Tu wallet existente se queda donde está. En la extensión: **Wallets** → restaurar.
3. Abre Ajustes → **Tus cuentas** y toca **Añadir una cuenta Ethereum (coin 60)**. El primer toque añade la cuenta en el índice 0 — la misma dirección `0x…` que MetaMask muestra para esas palabras, y la misma clave que tu dirección de QoreChain `qor1…` para esa cuenta. Tus QOR están ahí.
4. Cambia a esa cuenta (está etiquetada como *Ethereum · coin 60*). Puedes enviar, hacer staking y reclamar desde ella. El primer envío también registra la clave poscuántica de esa cuenta, lo que cuesta una pequeña comisión única.

Una cuenta de estilo Ethereum no tiene @handle (los handles se reclaman en una cuenta `qor1…` de QoreChain con tipo de moneda 118), y los sitios web firman con ella mediante `signAndBroadcast` en lugar de `signDirect`. Cada toque en **Añadir una cuenta Ethereum (coin 60)** añade el siguiente índice.

## Orientarte {#find-your-way}

- **Búsqueda** — la lupa en la parte superior de Inicio busca pantallas ("stake"), monedas ("USDC"), personas (un @handle o una dirección), memos y el inicio de un hash de transacción; al escribir un @handle o una dirección `qor1…` se ofrece directamente **Enviar QOR a …**.
- **Recorrido** — la primera vez que una wallet se abre en Inicio, cinco tarjetas breves explican qué hace QoreX y dónde está cada cosa. Se ejecuta una sola vez; vuelve a verlo desde Ajustes → **Repetir el recorrido**.

## Opcional: reclama un @handle

Después de crear tu wallet puedes reclamar un **@handle** único (por ejemplo, `@liviu`) para que la gente pueda enviarte fondos por tu nombre en lugar de una dirección `qor1…`. Esto es opcional y se puede omitir — tu wallet nunca depende de ello. (En la extensión de navegador, algunas versiones no permiten reclamarlo; si el popup no lo ofrece, reclámalo desde la app móvil.) Un handle se vincula a una dirección específica y no a la wallet en su conjunto, algo relevante en cuanto tengas más de una cuenta — consulta [Varias cuentas desde una misma frase](/qorex/account-and-dashboard#accounts) y [@handle](/qorex/account-and-dashboard#handle).

## Idioma

QoreX está disponible en diez idiomas — inglés, rumano, alemán, español, francés, italiano, turco, árabe, japonés y coreano — y sigue automáticamente el idioma de tu teléfono, recurriendo al inglés para cualquier otro caso. Puedes cambiar el idioma detectado en cualquier momento desde **Ajustes → Idioma**; elegir árabe también cambia la interfaz a derecha a izquierda.

## Próximos pasos

- [Enviar y recibir](/qorex/send-and-receive) — realiza tu primera transferencia a prueba de computación cuántica.
- [Seguridad y recuperación](/qorex/security-and-recovery) — configura la recuperación social para no quedarte nunca sin acceso.
- [Portafolio y staking](/qorex/portfolio-and-staking) — sigue tus activos y gana recompensas de staking.
