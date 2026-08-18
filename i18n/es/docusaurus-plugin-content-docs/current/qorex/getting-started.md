---
slug: /qorex/getting-started
title: Primeros pasos con QoreX
sidebar_label: Primeros pasos
sidebar_position: 2
---

# Primeros pasos con QoreX

Esta página explica cómo instalar la **aplicación móvil** y crear, restaurar o vincular tu monedero. Para el monedero de escritorio, consulta la [Extensión de navegador](/qorex/browser-extension), que está disponible en Chrome, Firefox y Safari.

:::note Disponibilidad móvil
La aplicación móvil de QoreX se encuentra actualmente en fase de pruebas públicas:

- **Android** — disponible para **pruebas públicas** en Google Play.
- **iOS** — disponible para pruebas a través de **TestFlight** si quieres probarla.

Encuentra los enlaces actuales en [qorechain.io](https://qorechain.io).
:::

## Antes de empezar: protege tu dispositivo

Un monedero QoreX solo se puede crear o importar cuando tu dispositivo tiene configurado un **factor de desbloqueo fuerte**. Esto es lo que protege tus claves en el almacén de hardware. Cualquiera de los siguientes es válido:

- **iOS** — Face ID o Touch ID.
- **Android** — un biométrico de Clase 3 (huella dactilar, iris o desbloqueo facial 3D) **o** un bloqueo de pantalla del dispositivo (PIN, patrón o contraseña).

:::note Desbloqueo facial 2D en Android
El desbloqueo facial 2D basado en cámara (presente en algunos dispositivos, p. ej. ciertos modelos Samsung) cuenta como un biométrico *débil*. Si es lo único que tienes, QoreX se apoya en el **PIN / patrón** que hay detrás — y la hoja del sistema lo ofrece automáticamente, así que sigues estando cubierto.
:::

Si no hay ningún factor fuerte registrado, los botones de crear/importar permanecen desactivados y la pantalla explica qué debes activar. Configura Face ID, una huella dactilar o un bloqueo de pantalla en los ajustes del sistema y luego vuelve a QoreX.

## Primer inicio

La aplicación se abre en la pantalla de incorporación **solo cuando no existe ningún monedero en el dispositivo**. Una vez que tienes un monedero, cada inicio posterior va directamente a la pestaña Inicio (Monedero). Ver los saldos no requiere biometría; **firmar una transacción siempre la requiere**.

Tienes tres formas de configurarlo:

### 1. Crear un nuevo monedero

1. Toca **Crear un nuevo monedero**.
2. QoreX genera una **frase de recuperación de 24 palabras** en tu dispositivo (256 bits de entropía) y deriva tu identidad de QoreChain — tipo de moneda 118, una dirección `qor1…` (tus cuentas de ETH y SOL provienen de la misma semilla).
3. **Anota las 24 palabras** y guárdalas sin conexión. Esta frase es la **única** manera de recuperar tu monedero si pierdes el dispositivo.
4. Confirma la frase; QoreX la sella en el almacén respaldado por hardware y protegido por biometría.

:::caution Tu frase de recuperación lo es todo
Cualquiera que tenga tus 24 palabras controla tus fondos, y nadie — incluida QoreChain Association — puede recuperarlas por ti. Nunca escribas tu frase en un sitio web, la compartas, ni la guardes en una captura de pantalla o una nota en la nube.
:::

### 2. Restaurar un monedero existente

1. Toca **Restaurar monedero existente**.
2. Escribe tus 24 palabras en orden.
3. QoreX vuelve a derivar las mismas direcciones — tu monedero se ve idéntico en cualquier dispositivo.

### 3. Vincular desde otro dispositivo

Si ya tienes QoreX en otro teléfono o tableta, puedes mover el monedero de uno a otro **sin servidor y sin escribir nada** — consulta [Vincular un nuevo dispositivo](/qorex/security-and-recovery#link-device). Elige **Vincular desde otro dispositivo** en el nuevo dispositivo para comenzar.

## Opcional: reclama un @handle

Después de crear tu monedero puedes reclamar un **@handle** único (por ejemplo `@liviu`) para que la gente pueda enviarte por nombre en lugar de por una dirección `qor1…`. Esto es opcional y se puede omitir — tu monedero nunca depende de ello. Consulta [Cuenta y Panel](/qorex/account-and-dashboard#handle).

## Próximos pasos

- [Enviar y recibir](/qorex/send-and-receive) — realiza tu primera transferencia con seguridad cuántica.
- [Seguridad y recuperación](/qorex/security-and-recovery) — configura la recuperación social para no quedarte nunca sin acceso.
- [Portafolio y staking](/qorex/portfolio-and-staking) — haz seguimiento de tus activos y gana recompensas por staking.
