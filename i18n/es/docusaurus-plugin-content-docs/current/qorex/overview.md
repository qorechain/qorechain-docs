---
slug: /qorex/overview
title: Monedero QoreX
sidebar_label: Descripción general
sidebar_position: 1
---

# Monedero QoreX

**QoreX** es el monedero **no custodial** oficial de **QoreChain**, la Layer 1 resistente a la computación cuántica (mainnet `qorechain-vladi`). Tus claves privadas se generan y se almacenan **únicamente en tu dispositivo**: QoreChain Association nunca tiene acceso a tus fondos y las aplicaciones no recopilan **ningún dato**. Cada transferencia de QOR en la lane Native lleva una **firma híbrida post-cuántica** (ML-DSA-87, NIST FIPS-204, combinada con secp256k1), de modo que tus fondos están protegidos frente a atacantes tanto clásicos como cuánticos.

QoreX consta de dos partes que funcionan de forma conjunta:

- **Aplicación móvil** (iOS y Android): el monedero completo — crear/restaurar, enviar y recibir QOR resistente a la computación cuántica, redes externas, staking, portafolio, recuperación y un navegador de dApps integrado en la app.
- **Extensión de navegador** (Chrome y Firefox; Safari pendiente): el conector de dApps para escritorio — permite que los sitios web descubran tu monedero y convierte cada solicitud en una aprobación explícita.

## Disponibilidad por plataforma

| Capacidad | App iOS/Android | Extensión Chrome/Firefox |
|---|---|---|
| Crear / restaurar / vincular un monedero | ✅ | — (se empareja con la app) |
| Enviar y recibir QOR (post-cuántico) | ✅ | mediante firma de dApp |
| Redes externas (ETH / BNB / POL / ARB / SOL + tokens) | ✅ | ✅ (envío desde el popup) |
| Staking, Portafolio, Q-Day Scanner, Recuperación, Legacy | ✅ | — |
| Conexiones a dApps | ✅ (navegador integrado) | ✅ (cualquier sitio web) |
| Cuenta (@handle, solicitudes de pago, enlace con Dashboard) | ✅ | — |

## Por qué QoreX es diferente

- **Resistente a la computación cuántica por defecto**: las transferencias de QOR en la lane Native siempre llevan una firma híbrida ML-DSA-87 + secp256k1. Todo lo que sea clásico (cadenas externas) se indica con claridad, nunca de forma silenciosa.
- **Verdaderamente no custodial**: las claves se generan en el dispositivo y residen en una bóveda respaldada por hardware (Secure Enclave en iOS, StrongBox en Android) o en una bóveda cifrada (extensión). Nunca abandonan tu dispositivo.
- **Sin recopilación de datos**: ninguna aplicación de QoreX tiene analítica, rastreo ni publicidad. Un inicio de sesión de cuenta opcional añade comodidades (consulta [Cuenta y Dashboard](/qorex/account-and-dashboard)), pero el monedero nunca depende de ello.
- **Un único saldo unificado**: tu QOR es un solo saldo a través de las lanes Native, EVM y SVM; QoreX lo muestra como una única cifra.
- **Múltiples vías de recuperación**: una frase de recuperación de 24 palabras (siempre), recuperación social opcional con guardianes y un bloqueo temporal de 48 horas, herencia Legacy opcional y una cómoda vinculación multidispositivo.

## Primeros pasos

- ¿Nuevo en QoreX? Comienza con [Primeros pasos](/qorex/getting-started) para crear o restaurar tu monedero.
- Luego aprende a [Enviar y recibir](/qorex/send-and-receive) QOR resistente a la computación cuántica.
- Configura tu red de seguridad en [Seguridad y recuperación](/qorex/security-and-recovery).
- En escritorio, instala la [Extensión de navegador](/qorex/browser-extension).

:::note Descarga
QoreX para iOS y Android se publica en la App Store y en Google Play, y la extensión de navegador en la Chrome Web Store y en Firefox Add-ons. Encuentra los enlaces de descarga actuales en [qorechain.io](https://qorechain.io). Instala QoreX únicamente desde la ficha de una tienda oficial.
:::
