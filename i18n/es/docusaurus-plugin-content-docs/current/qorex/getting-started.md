---
slug: /qorex/getting-started
title: Primeros pasos con QoreX
sidebar_label: Primeros pasos
sidebar_position: 2
---

# Primeros pasos con QoreX

Esta página explica cómo instalar la **aplicación móvil** y cómo crear, restaurar o vincular tu monedero. Para el monedero de escritorio, consulta la [Extensión de navegador](/qorex/browser-extension), que ya está disponible en Chrome, Firefox y Safari.

:::note Disponibilidad en móvil
- **Android** — disponible en Google Play: https://play.google.com/store/apps/details?id=network.qore.qorex
- **iOS** — disponible para pruebas mediante **TestFlight**: https://testflight.apple.com/join/Xa9D7vgR — la publicación en la App Store sigue en revisión.
:::

## Antes de empezar: protege tu dispositivo

Un monedero QoreX solo puede crearse o importarse cuando tu dispositivo tiene configurado un **factor de desbloqueo fuerte**. Eso es lo que protege tus claves en la bóveda de hardware. Cualquiera de los siguientes sirve:

- **iOS** — Face ID o Touch ID.
- **Android** — un dato biométrico de Clase 3 (huella dactilar, iris o desbloqueo facial 3D) **o** un bloqueo de pantalla del dispositivo (PIN, patrón o contraseña).

:::note Desbloqueo facial 2D en Android
El desbloqueo facial 2D basado en cámara (presente en algunos dispositivos, por ejemplo ciertos modelos de Samsung) cuenta como un dato biométrico *débil*. Si es lo único que tienes, QoreX recurre al **PIN / patrón** que hay detrás — y el panel del sistema lo ofrece automáticamente, así que sigues estando cubierto.
:::

Si no hay ningún factor fuerte registrado, los botones de crear/importar permanecen desactivados y la pantalla explica qué debes activar. Configura Face ID, una huella dactilar o un bloqueo de pantalla en los ajustes de tu sistema y vuelve a QoreX.

## Primer inicio

La aplicación se abre en la pantalla de incorporación **solo cuando no existe ningún monedero en el dispositivo**. Una vez que tienes un monedero, cada inicio posterior va directamente a la pestaña Inicio (Monedero). Ver los saldos no requiere biometría; **firmar una transacción siempre la requiere**.

Tienes tres formas de configurarlo:

### 1. Crear un monedero nuevo

1. Toca **Crear un monedero nuevo**.
2. QoreX genera una **frase de recuperación de 24 palabras** en tu dispositivo (256 bits de entropía) y deriva tu identidad de QoreChain — tipo de moneda 118, una dirección `qor1…` (tus cuentas de ETH y SOL provienen de la misma semilla).
3. **Anota las 24 palabras** y guárdalas sin conexión. Esta frase es la **única** forma de recuperar tu monedero si pierdes el dispositivo.
4. Confirma la frase; QoreX la sella en la bóveda respaldada por hardware y protegida por biometría.

:::caution Tu frase de recuperación lo es todo
Cualquiera que tenga tus 24 palabras controla tus fondos, y nadie — ni siquiera QoreChain Association — puede recuperarlos por ti. Nunca escribas tu frase en un sitio web, no la compartas ni la guardes en una captura de pantalla o en una nota en la nube.
:::

### 2. Restaurar un monedero existente

1. Toca **Restaurar monedero existente**.
2. Escribe tus 24 palabras en orden.
3. QoreX vuelve a derivar las mismas direcciones — tu monedero se ve idéntico en cualquier dispositivo.

### 3. Vincular desde otro dispositivo

Si ya tienes QoreX en otro teléfono o tableta, puedes trasladar el monedero **sin servidor y sin escribir nada** — consulta [Vincular un dispositivo nuevo](/qorex/security-and-recovery#link-device). Elige **Vincular desde otro dispositivo** en el dispositivo nuevo para empezar.

## Opcional: reclama un @handle

Después de crear tu monedero puedes reclamar un **@handle** único (por ejemplo `@liviu`) para que la gente pueda enviarte fondos por nombre en lugar de usar una dirección `qor1…`. Es opcional y se puede omitir — tu monedero nunca depende de ello. Consulta [Cuenta y Dashboard](/qorex/account-and-dashboard#handle).

## Siguientes pasos

- [Enviar y recibir](/qorex/send-and-receive) — realiza tu primera transferencia con seguridad cuántica.
- [Seguridad y recuperación](/qorex/security-and-recovery) — configura la recuperación social para no quedarte nunca fuera.
- [Portafolio y staking](/qorex/portfolio-and-staking) — sigue tus activos y obtén recompensas de staking.
