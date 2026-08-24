---
slug: /qorex/overview
title: Monedero QoreX
sidebar_label: Visión general
sidebar_position: 1
---

# Monedero QoreX

**QoreX** es el monedero oficial **no custodial** de **QoreChain**, la Layer 1 resistente a la computación cuántica (mainnet `qorechain-vladi`). Tus claves privadas se generan y se almacenan **únicamente en tu dispositivo**: QoreChain Association nunca tiene acceso a tus fondos y las aplicaciones no recopilan **ningún dato**. Cada transferencia de QOR en el carril Native lleva una **firma híbrida poscuántica** (ML-DSA-87, NIST FIPS-204, combinada con secp256k1), de modo que tus fondos quedan protegidos frente a atacantes clásicos y cuánticos.

QoreX se compone de dos partes que funcionan juntas:

- **Extensión de navegador** — el monedero de escritorio, **disponible y público en Chrome, Firefox y Safari (macOS)**. Es un monedero autónomo (crear/importar, guardar y enviar QOR) y, a la vez, el conector que permite a cualquier sitio web detectar QoreX y convertir cada solicitud en una aprobación explícita. Consulta [Extensión de navegador](/qorex/browser-extension).
- **Aplicación móvil** (Android e iOS) — el monedero completo: crear/restaurar, enviar y recibir QOR resistente a la computación cuántica, redes externas, staking, portafolio, recuperación y un navegador de dApps integrado. **En Google Play** para Android y **en la App Store** para iOS (consulta la disponibilidad más abajo).

## Disponibilidad por plataforma {#platform-availability}

| Funcionalidad | Aplicación móvil (Android e iOS) | Extensión de navegador |
|---|---|---|
| Crear / importar un monedero | ✅ | ✅ (autónoma, una cuenta) |
| Varias cuentas a partir de una sola frase de recuperación | ✅ (hasta 20) | — (una cuenta) |
| Enviar y recibir QOR (poscuántico) | ✅ | ✅ (desde la ventana emergente, incluye QR para recibir) |
| Pagar / reclamar un @handle | ✅ | ✅ |
| Redes externas (Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis, Celestia + tokens) | ✅ | ✅ (envío desde la ventana emergente) |
| Idioma de la interfaz (10 idiomas) | ✅ (sigue el idioma del teléfono) | ✅ (sigue el idioma del navegador) |
| Staking, Portafolio, Q-Day Scanner, Recuperación, Legacy | ✅ | — |
| Conexiones con dApps | ✅ (navegador integrado) | ✅ (cualquier sitio web) |
| Inicio de sesión de cuenta y solicitudes de pago | ✅ | — |
| Vinculación de varios dispositivos | ✅ | — |
| Emparejamiento con el Dashboard | ✅ | ✅ (conexión + transferencias propuestas) |

## Por qué QoreX es diferente

- **Resistente a la computación cuántica por defecto** — las transferencias de QOR en el carril Native llevan siempre una firma híbrida ML-DSA-87 + secp256k1. Todo lo que sea clásico (cadenas externas) se indica con claridad, nunca en silencio.
- **Verdaderamente no custodial** — las claves se generan en el dispositivo y residen en una bóveda respaldada por hardware (Secure Enclave en iOS, StrongBox en Android) o en una bóveda cifrada (extensión). Nunca salen de tu dispositivo.
- **Sin recopilación de datos** — ninguna aplicación de QoreX incluye analíticas, rastreo ni publicidad. Un inicio de sesión de cuenta opcional añade comodidades (consulta [Cuenta y Dashboard](/qorex/account-and-dashboard)), pero el monedero nunca depende de ello.
- **Un único saldo unificado** — tus QOR forman un solo saldo entre los carriles Native, EVM y SVM; QoreX lo muestra como una sola cifra.
- **Varias vías de recuperación** — una frase de recuperación de 24 palabras (siempre), recuperación social opcional con guardianes y un bloqueo temporal de 48 horas, herencia Legacy opcional y una cómoda vinculación de varios dispositivos.

## Primeros pasos

- ¿Es tu primera vez con QoreX? Empieza por [Primeros pasos](/qorex/getting-started) para crear o restaurar tu monedero.
- Después aprende a [Enviar y recibir](/qorex/send-and-receive) QOR resistente a la computación cuántica.
- Configura tu red de seguridad en [Seguridad y recuperación](/qorex/security-and-recovery).
- En el escritorio, instala la [Extensión de navegador](/qorex/browser-extension).

:::note Descarga y disponibilidad
- **Extensión de navegador** — disponible y pública: instálala desde [Chrome Web Store, Firefox Add-ons o la Mac App Store (Safari)](/qorex/browser-extension#install). Consulta [qué versión está disponible en cada plataforma](/qorex/browser-extension#versions) — es posible que las funciones más nuevas aún se estén implementando en algunos navegadores.
- **Aplicación para Android** — disponible en producción en Google Play: https://play.google.com/store/apps/details?id=network.qore.qorex
- **Aplicación para iOS** — disponible en la **App Store**: https://apps.apple.com/us/app/qorex-wallet/id6791256626.

La revisión de cada tienda sigue su propio calendario, así que la versión más reciente a veces llega antes a una tienda que a otra — consulta [qué versión está disponible en cada plataforma](#platform-availability) más abajo para conocer la situación exacta actual. Instala siempre desde una ficha de tienda oficial.
:::

:::note Qué versión está disponible en cada plataforma
Las aprobaciones de las tiendas llegan en momentos distintos, así que la versión que aparece abajo puede diferir brevemente según la plataforma:

| Plataforma | Versión disponible |
|---|---|
| Android | 1.0.3 |
| iOS | 1.0 (hay una actualización en revisión) |
| Firefox | 0.1.9 |
| Chrome | 0.1.5 (0.1.9 está en revisión) |
| Safari (macOS) | 1.1, con la extensión 0.1.5 (hay una actualización en revisión) |

Esta página describe el conjunto de funciones actual de QoreX — una tienda que todavía sirva una versión anterior se pondrá al día automáticamente sin que tengas que hacer nada.
:::
