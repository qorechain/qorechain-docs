---
slug: /qorex/overview
title: Monedero QoreX
sidebar_label: Descripción general
sidebar_position: 1
---

# Monedero QoreX

**QoreX** es el monedero **sin custodia** oficial de **QoreChain**, la Layer 1 resistente a la computación cuántica (mainnet `qorechain-vladi`). Tus claves privadas se generan y se almacenan **únicamente en tu dispositivo**: QoreChain Association nunca tiene acceso a tus fondos y las aplicaciones no recopilan **ningún dato**. Cada transferencia de QOR en el carril Nativo lleva una **firma híbrida poscuántica** (ML-DSA-87, NIST FIPS-204, combinada con secp256k1), de modo que tus fondos están protegidos frente a atacantes tanto clásicos como cuánticos.

QoreX se compone de dos partes que funcionan juntas:

- **Extensión de navegador**: el monedero de escritorio, **disponible y público en Chrome, Firefox y Safari (macOS)**. Es un monedero independiente (crear/importar, guardar y enviar QOR) y el conector que permite a cualquier sitio web descubrir QoreX y convertir cada solicitud en una aprobación explícita. Consulta [Extensión de navegador](/qorex/browser-extension).
- **Aplicación móvil** (Android e iOS): el monedero completo: crear/restaurar, enviar y recibir QOR resistente a la computación cuántica, redes externas, staking, portafolio, recuperación y un navegador de dApps integrado en la app. **En Google Play** para Android; en TestFlight para iOS (consulta la disponibilidad más abajo).

## Disponibilidad por plataforma

| Funcionalidad | Aplicación móvil (Android e iOS) | Extensión de navegador |
|---|---|---|
| Crear / importar un monedero | ✅ | ✅ (independiente) |
| Enviar y recibir QOR (poscuántico) | ✅ | ✅ (desde el popup) |
| Redes externas (Ethereum, BNB Chain, Polygon, Arbitrum, Solana, Cosmos Hub, Osmosis, Celestia + tokens) | ✅ | ✅ (envío desde el popup) |
| Staking, Portafolio, Q-Day Scanner, Recuperación, Legacy | ✅ | — |
| Conexiones a dApps | ✅ (navegador integrado) | ✅ (cualquier sitio web) |
| Cuenta (@handle, solicitudes de pago) | ✅ | — |
| Vinculación multidispositivo | ✅ | — |
| Emparejamiento con el Dashboard | ✅ | ✅ (conexión + transferencias propuestas, v0.1.5) |

## Por qué QoreX es diferente

- **Resistente a la computación cuántica de forma predeterminada**: las transferencias de QOR en el carril Nativo siempre llevan una firma híbrida ML-DSA-87 + secp256k1. Todo lo clásico (cadenas externas) se etiqueta con claridad, nunca de forma silenciosa.
- **Verdaderamente sin custodia**: las claves se generan en el dispositivo y residen en una bóveda respaldada por hardware (Secure Enclave en iOS, StrongBox en Android) o en una bóveda cifrada (extensión). Nunca abandonan tu dispositivo.
- **Sin recopilación de datos**: sin analítica, seguimiento ni anuncios en ninguna app de QoreX. Un inicio de sesión de cuenta opcional añade comodidades (consulta [Cuenta y Dashboard](/qorex/account-and-dashboard)), pero el monedero nunca depende de ello.
- **Un único saldo unificado**: tu QOR es un solo saldo a través de los carriles Nativo, EVM y SVM; QoreX lo muestra como una única cifra.
- **Múltiples vías de recuperación**: una frase de recuperación de 24 palabras (siempre), recuperación social opcional con guardianes y un bloqueo temporal de 48 horas, herencia Legacy opcional y una cómoda vinculación multidispositivo.

## Primeros pasos

- ¿Es tu primera vez con QoreX? Empieza por [Primeros pasos](/qorex/getting-started) para crear o restaurar tu monedero.
- Después aprende a [Enviar y Recibir](/qorex/send-and-receive) QOR resistente a la computación cuántica.
- Configura tu red de seguridad en [Seguridad y Recuperación](/qorex/security-and-recovery).
- En el escritorio, instala la [Extensión de navegador](/qorex/browser-extension).

:::note Descarga y disponibilidad
- **Extensión de navegador**: disponible y pública: instálala desde la [Chrome Web Store, Firefox Add-ons o la Mac App Store (Safari)](/qorex/browser-extension#install).
- **Aplicación Android**: disponible en Google Play: https://play.google.com/store/apps/details?id=network.qore.qorex
- **Aplicación iOS**: disponible para pruebas mediante **TestFlight** si quieres probarla; la publicación en la App Store sigue en revisión. Encuentra el enlace de invitación actual en [qorechain.io](https://qorechain.io).

Instala QoreX únicamente desde un listado oficial de una tienda.
:::
