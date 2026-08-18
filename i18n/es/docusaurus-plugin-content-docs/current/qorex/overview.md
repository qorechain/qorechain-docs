---
slug: /qorex/overview
title: Monedero QoreX
sidebar_label: Visión general
sidebar_position: 1
---

# Monedero QoreX

**QoreX** es el monedero oficial **no custodial** de **QoreChain**, la Layer 1 resistente a la computación cuántica (mainnet `qorechain-vladi`). Tus claves privadas se generan y se almacenan **únicamente en tu dispositivo**: QoreChain Association nunca tiene acceso a tus fondos y las aplicaciones no recopilan **ningún dato**. Cada transferencia de QOR en el carril Native lleva una **firma híbrida poscuántica** (ML-DSA-87, NIST FIPS-204, combinada con secp256k1), de modo que tus fondos quedan protegidos frente a atacantes clásicos y cuánticos.

QoreX se compone de dos partes que funcionan juntas:

- **Extensión de navegador**: el monedero de escritorio, **disponible y público en Chrome, Firefox y Safari (macOS)**. Es un monedero autónomo (crear/importar, guardar y enviar QOR) y, a la vez, el conector que permite a cualquier sitio web detectar QoreX y convertir cada solicitud en una aprobación explícita. Consulta [Extensión de navegador](/qorex/browser-extension).
- **Aplicación móvil** (Android e iOS): el monedero completo: crear/restaurar, enviar y recibir QOR resistente a la computación cuántica, redes externas, staking, portafolio, recuperación y un navegador de dApps integrado. **En Google Play** para Android; en TestFlight para iOS (consulta la disponibilidad más abajo).

## Disponibilidad por plataforma

| Funcionalidad | Aplicación móvil (Android e iOS) | Extensión de navegador |
|---|---|---|
| Crear / importar un monedero | ✅ | ✅ (autónomo) |
| Enviar y recibir QOR (poscuántico) | ✅ | ✅ (desde la ventana emergente) |
| Redes externas (Ethereum, BNB Chain, Polygon, Arbitrum, Solana, Cosmos Hub, Osmosis, Celestia + tokens) | ✅ | ✅ (envío desde la ventana emergente) |
| Staking, Portafolio, Q-Day Scanner, Recuperación, Legacy | ✅ | — |
| Conexiones con dApps | ✅ (navegador integrado) | ✅ (cualquier sitio web) |
| Cuenta (@handle, solicitudes de pago) | ✅ | — |
| Vinculación de varios dispositivos | ✅ | — |
| Emparejamiento con el Dashboard | ✅ | ✅ (conexión + transferencias propuestas, v0.1.5) |

## Por qué QoreX es diferente

- **Resistente a la computación cuántica por defecto**: las transferencias de QOR en el carril Native llevan siempre una firma híbrida ML-DSA-87 + secp256k1. Todo lo que sea clásico (cadenas externas) se indica con claridad, nunca en silencio.
- **Verdaderamente no custodial**: las claves se generan en el dispositivo y residen en una bóveda respaldada por hardware (Secure Enclave en iOS, StrongBox en Android) o en una bóveda cifrada (extensión). Nunca salen de tu dispositivo.
- **Sin recopilación de datos**: ninguna aplicación de QoreX incluye analíticas, rastreo ni publicidad. Un inicio de sesión opcional con cuenta añade comodidades (consulta [Cuenta y Dashboard](/qorex/account-and-dashboard)), pero el monedero nunca depende de ello.
- **Un único saldo unificado**: tus QOR forman un solo saldo entre los carriles Native, EVM y SVM; QoreX lo muestra como una sola cifra.
- **Varias vías de recuperación**: una frase de recuperación de 24 palabras (siempre), recuperación social opcional con guardianes y un bloqueo temporal de 48 horas, herencia Legacy opcional y una cómoda vinculación de varios dispositivos.

## Primeros pasos

- ¿Es tu primera vez con QoreX? Empieza por [Primeros pasos](/qorex/getting-started) para crear o restaurar tu monedero.
- Después aprende a [Enviar y recibir](/qorex/send-and-receive) QOR resistente a la computación cuántica.
- Configura tu red de seguridad en [Seguridad y recuperación](/qorex/security-and-recovery).
- En el escritorio, instala la [Extensión de navegador](/qorex/browser-extension).

:::note Descarga y disponibilidad
- **Extensión de navegador**: disponible y pública, instálala desde [Chrome Web Store, Firefox Add-ons o la Mac App Store (Safari)](/qorex/browser-extension#install).
- **Aplicación para Android**: disponible en Google Play: https://play.google.com/store/apps/details?id=network.qore.qorex
- **Aplicación para iOS**: disponible para pruebas a través de **TestFlight**: https://testflight.apple.com/join/Xa9D7vgR — la publicación en la App Store sigue en revisión.

Instala QoreX únicamente desde una ficha de tienda oficial.
:::
