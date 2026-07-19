---
slug: /qorex/getting-started
title: Primeros pasos con QoreX
sidebar_label: Primeros pasos
sidebar_position: 2
---

# Primeros pasos con QoreX

Esta página explica paso a paso cómo instalar la aplicación móvil y crear, restaurar o vincular tu monedero.

## Antes de empezar: protege tu dispositivo

Un monedero QoreX solo puede crearse o importarse cuando tu dispositivo tiene la **protección biométrica** activada — Face ID / Touch ID en iOS, o una huella dactilar / factor fuerte equivalente en Android. Esto es lo que protege tus claves en la bóveda de hardware.

Si no hay ninguna biometría activada, los botones de crear/importar permanecen desactivados y la pantalla explica qué debes activar. Activa Face ID o una huella dactilar en los ajustes del sistema y luego vuelve a QoreX.

## Primer inicio

La aplicación se abre en la pantalla de incorporación **solo cuando no existe ningún monedero en el dispositivo**. Una vez que tienes un monedero, cada inicio posterior va directamente a la pestaña Inicio (Monedero). Ver los saldos no requiere biometría; **firmar una transacción siempre la requiere**.

Tienes tres formas de configurarlo:

### 1. Crear un monedero nuevo

1. Toca **Create a new wallet**.
2. QoreX genera una **frase de recuperación de 24 palabras** en tu dispositivo (entropía de 256 bits) y deriva tu identidad de QoreChain — coin type 118, una dirección `qor1…` (tus cuentas de ETH y SOL provienen de la misma semilla).
3. **Anota las 24 palabras** y guárdalas sin conexión. Esta frase es la **única** forma de recuperar tu monedero si pierdes el dispositivo.
4. Confirma la frase; QoreX la sella en la bóveda respaldada por hardware y protegida con biometría.

:::caution Tu frase de recuperación lo es todo
Cualquiera que tenga tus 24 palabras controla tus fondos, y nadie — incluida QoreChain Association — puede recuperarlas por ti. Nunca escribas tu frase en un sitio web, no la compartas ni la guardes en una captura de pantalla o en una nota en la nube.
:::

### 2. Restaurar un monedero existente

1. Toca **Restore existing wallet**.
2. Escribe tus 24 palabras en orden.
3. QoreX vuelve a derivar las mismas direcciones — tu monedero se ve idéntico en cualquier dispositivo.

### 3. Vincular desde otro dispositivo

Si ya tienes QoreX en otro teléfono o tableta, puedes trasladar el monedero **sin servidor y sin escribir nada** — consulta [Vincular un nuevo dispositivo](/qorex/security-and-recovery#link-device). Elige **Link from another device** en el nuevo dispositivo para comenzar.

## Opcional: reclama un @handle

Después de crear tu monedero puedes reclamar un **@handle** único (por ejemplo `@liviu`) para que la gente pueda enviarte fondos por nombre en lugar de por una dirección `qor1…`. Esto es opcional y se puede omitir — tu monedero nunca depende de ello. Consulta [Cuenta y Dashboard](/qorex/account-and-dashboard#handle).

## Próximos pasos

- [Enviar y recibir](/qorex/send-and-receive) — realiza tu primera transferencia resistente a la computación cuántica.
- [Seguridad y recuperación](/qorex/security-and-recovery) — configura la recuperación social para no quedarte nunca sin acceso.
- [Portafolio y staking](/qorex/portfolio-and-staking) — sigue tus activos y gana recompensas de staking.
