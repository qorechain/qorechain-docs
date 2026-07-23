---
slug: /qorex/getting-started
title: Primeros pasos con QoreX
sidebar_label: Primeros pasos
sidebar_position: 2
---

# Primeros pasos con QoreX

Esta página explica cómo instalar la aplicación móvil y crear, restaurar o vincular tu monedero.

## Antes de empezar: protege tu dispositivo

Un monedero QoreX solo se puede crear o importar cuando tu dispositivo tiene configurado un **factor de desbloqueo fuerte**. Esto es lo que protege tus claves en la bóveda de hardware. Cualquiera de los siguientes sirve:

- **iOS** — Face ID o Touch ID.
- **Android** — un biométrico Class-3 (huella dactilar, iris o desbloqueo facial 3D) **o** un bloqueo de pantalla del dispositivo (PIN, pattern o password).

:::note Desbloqueo facial 2D de Android
El desbloqueo facial 2D basado en cámara (presente en algunos dispositivos, p. ej. ciertos modelos de Samsung) cuenta como un biométrico *débil*. Si es lo único que tienes, QoreX se apoya en el **PIN / pattern** que hay detrás de él —y la hoja del sistema lo ofrece automáticamente, así que sigues estando cubierto.
:::

Si no hay ningún factor fuerte registrado, los botones de crear/importar permanecen deshabilitados y la pantalla explica qué activar. Configura Face ID, una huella dactilar o un bloqueo de pantalla en los ajustes del sistema y vuelve a QoreX.

## Primer inicio

La aplicación se abre en la pantalla de incorporación **solo cuando no existe ningún monedero en el dispositivo**. Una vez que tienes un monedero, cada inicio posterior va directamente a la pestaña Home (Wallet). Ver los saldos no requiere biometría; **firmar una transacción siempre la requiere**.

Tienes tres formas de configurarlo:

### 1. Crear un monedero nuevo

1. Toca **Create a new wallet**.
2. QoreX genera una **frase de recuperación de 24 palabras** en tu dispositivo (256 bits de entropía) y deriva tu identidad de QoreChain —coin type 118, una dirección `qor1…` (tus cuentas de ETH y SOL provienen de la misma semilla).
3. **Anota las 24 palabras** y guárdalas sin conexión. Esta frase es la **única** manera de recuperar tu monedero si pierdes el dispositivo.
4. Confirma la frase; QoreX la sella en la bóveda respaldada por hardware y protegida por biometría.

:::caution Tu frase de recuperación lo es todo
Cualquiera que tenga tus 24 palabras controla tus fondos, y nadie —ni siquiera QoreChain Association— puede recuperarlos por ti. Nunca escribas tu frase en un sitio web, la compartas ni la guardes en una captura de pantalla o una nota en la nube.
:::

### 2. Restaurar un monedero existente

1. Toca **Restore existing wallet**.
2. Escribe tus 24 palabras en orden.
3. QoreX vuelve a derivar las mismas direcciones —tu monedero se ve idéntico en cualquier dispositivo.

### 3. Vincular desde otro dispositivo

Si ya tienes QoreX en otro teléfono o tableta, puedes trasladar el monedero **sin servidor ni escritura** —consulta [Vincular un nuevo dispositivo](/qorex/security-and-recovery#link-device). Elige **Link from another device** en el nuevo dispositivo para empezar.

## Opcional: reclama un @handle

Después de crear tu monedero puedes reclamar un **@handle** único (por ejemplo `@liviu`) para que la gente pueda enviarte fondos por nombre en lugar de por una dirección `qor1…`. Esto es opcional y se puede omitir —tu monedero nunca depende de ello. Consulta [Account & Dashboard](/qorex/account-and-dashboard#handle).

## Próximos pasos

- [Enviar y recibir](/qorex/send-and-receive) — realiza tu primera transferencia a prueba de cuántica.
- [Seguridad y recuperación](/qorex/security-and-recovery) — configura la recuperación social para no quedarte nunca bloqueado.
- [Portafolio y staking](/qorex/portfolio-and-staking) — sigue tus activos y gana recompensas por staking.
