---
slug: /qorex/getting-started
title: Primeros pasos con QoreX
sidebar_label: Primeros pasos
sidebar_position: 2
---

# Primeros pasos con QoreX

Esta página explica cómo instalar la **aplicación móvil** y crear, restaurar o vincular tu wallet. Para la wallet de escritorio, consulta la [Extensión de navegador](/qorex/browser-extension), disponible en Chrome, Firefox y Safari.

:::note Disponibilidad móvil
- **Android** — disponible en producción en Google Play: https://play.google.com/store/apps/details?id=network.qore.qorex
- **iOS** — disponible en la App Store: https://apps.apple.com/us/app/qorex-wallet/id6791256626
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
2. QoreX genera una **frase de recuperación de 24 palabras** en tu dispositivo (entropía de 256 bits) y deriva tu identidad de QoreChain — tipo de moneda 118, una dirección `qor1…` (tus cuentas de ETH y SOL provienen de la misma semilla).
3. **Anota las 24 palabras** y guárdalas fuera de línea. Esta frase es la **única** forma de recuperar tu wallet si pierdes el dispositivo.
4. Confirma la frase; QoreX la sella en la bóveda respaldada por hardware y protegida por biometría.

:::caution Tu frase de recuperación lo es todo
Cualquiera que tenga tus 24 palabras controla tus fondos, y nadie — ni siquiera QoreChain Association — puede recuperarlos por ti. Nunca escribas tu frase en un sitio web, la compartas ni la guardes en una captura de pantalla o nota en la nube. **Desinstalar QoreX elimina las claves guardadas en ese dispositivo** — sin tu frase escrita (o la [recuperación social](/qorex/security-and-recovery#social-recovery) configurada de antemano), una desinstalación significa la pérdida permanente de acceso. Haz la copia de seguridad antes de fondear la wallet, no después.
:::

### 2. Restaurar una wallet existente {#2-restore-an-existing-wallet}

1. Toca **Restaurar wallet existente**.
2. Elige **Frase de recuperación** (si anotaste tus 24 palabras) o **Recuperación social** (si configuraste guardianes y ya no tienes la frase — consulta [Recuperación social](/qorex/security-and-recovery#social-recovery)).
3. Para la ruta de frase de recuperación: escribe tus 24 palabras en orden. QoreX normaliza mayúsculas/minúsculas y espacios sueltos, verifica la frase y te avisa con claridad si alguna palabra no es válida, en lugar de mostrar un error genérico.
4. QoreX vuelve a derivar las mismas direcciones — tu wallet se ve idéntica en cualquier dispositivo.

:::note Requisito de versión
Restaurar directamente desde tu frase de recuperación requiere QoreX móvil **1.0.4 o posterior**. En una build más antigua, **Restaurar wallet existente** solo ofrece la ruta de guardianes — consulta [qué versión está disponible dónde](/qorex/overview#platform-availability) y actualiza si es necesario.
:::

### 3. Vincular desde otro dispositivo

Si ya tienes QoreX en otro teléfono o tablet, puedes trasladar la wallet **sin servidor y sin escribir nada** — consulta [Vincular un nuevo dispositivo](/qorex/security-and-recovery#link-device). Elige **Vincular desde otro dispositivo** en el dispositivo nuevo para empezar.

## Opcional: reclama un @handle

Después de crear tu wallet puedes reclamar un **@handle** único (por ejemplo, `@liviu`) para que la gente pueda enviarte fondos por tu nombre en lugar de una dirección `qor1…`. Esto es opcional y se puede omitir — tu wallet nunca depende de ello. Un handle se vincula a una dirección específica y no a la wallet en su conjunto, algo relevante en cuanto tengas más de una cuenta — consulta [Varias cuentas desde una misma frase](/qorex/account-and-dashboard#accounts) y [@handle](/qorex/account-and-dashboard#handle).

## Idioma

QoreX está disponible en diez idiomas — inglés, rumano, alemán, español, francés, italiano, turco, árabe, japonés y coreano — y sigue automáticamente el idioma de tu teléfono, recurriendo al inglés para cualquier otro caso. Puedes cambiar el idioma detectado en cualquier momento desde **Ajustes → Idioma**; elegir árabe también cambia la interfaz a derecha a izquierda.

## Próximos pasos

- [Enviar y recibir](/qorex/send-and-receive) — realiza tu primera transferencia a prueba de computación cuántica.
- [Seguridad y recuperación](/qorex/security-and-recovery) — configura la recuperación social para no quedarte nunca sin acceso.
- [Portafolio y staking](/qorex/portfolio-and-staking) — sigue tus activos y gana recompensas de staking.
