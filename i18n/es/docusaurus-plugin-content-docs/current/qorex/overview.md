---
slug: /qorex/overview
title: Monedero QoreX
sidebar_label: Descripción general
sidebar_position: 1
---

# Monedero QoreX

**QoreX** es el monedero oficial **no custodial** de **QoreChain**, la Layer 1 resistente a la computación cuántica (mainnet `qorechain-vladi`). Tus claves privadas se generan y almacenan **únicamente en tu dispositivo**: QoreChain Association nunca tiene acceso a tus fondos y las aplicaciones no recopilan **ningún dato**. Cada transferencia de QOR en el carril Native lleva una **firma híbrida post-cuántica** (ML-DSA-87, NIST FIPS-204, combinada con secp256k1), de modo que tus fondos quedan protegidos frente a atacantes tanto clásicos como cuánticos.

QoreX se compone de dos partes que funcionan juntas:

- **Aplicación móvil** (iOS y Android): el monedero completo: crear/restaurar, enviar y recibir QOR resistente a la computación cuántica, redes externas, staking, cartera, recuperación y un navegador de dApps integrado en la aplicación.
- **Extensión de navegador** (Chrome y Firefox, con Safari desde el mismo código base): el conector de dApps para escritorio: permite que los sitios web detecten tu monedero y convierte cada solicitud en una aprobación explícita.

## Disponibilidad por plataforma

| Función | App iOS/Android | Extensión Chrome/Firefox |
|---|---|---|
| Crear / restaurar / vincular un monedero | ✅ | — (se empareja con la app) |
| Enviar y recibir QOR (post-cuántico) | ✅ | mediante firma de dApp |
| Redes externas (ETH / BNB / POL / ARB / SOL + tokens) | ✅ | ✅ (envío desde el popup) |
| Staking, Cartera, Q-Day Scanner, Recuperación, Legado | ✅ | — |
| Conexiones con dApps | ✅ (navegador integrado) | ✅ (cualquier sitio web) |
| Cuenta (@handle, solicitudes de pago, enlace con Dashboard) | ✅ | — |

## Por qué QoreX es diferente

- **Resistente a la computación cuántica de forma predeterminada**: las transferencias de QOR en el carril Native siempre llevan una firma híbrida ML-DSA-87 + secp256k1. Cualquier operación clásica (cadenas externas) se identifica claramente, nunca de forma silenciosa.
- **Verdaderamente no custodial**: las claves se generan en el dispositivo y residen en un baúl respaldado por hardware (Secure Enclave en iOS, StrongBox en Android) o en un baúl cifrado (extensión). Nunca salen de tu dispositivo.
- **Sin recopilación de datos**: ninguna aplicación de QoreX incluye analíticas, seguimiento ni anuncios. Un inicio de sesión de cuenta opcional añade comodidades (consulta [Cuenta y Dashboard](/qorex/account-and-dashboard)), pero el monedero nunca depende de él.
- **Un saldo unificado**: tu QOR es un único saldo en los carriles Native, EVM y SVM; QoreX lo muestra como una sola cifra.
- **Múltiples vías de recuperación**: una frase de recuperación de 24 palabras (siempre), recuperación social opcional con guardianes y un bloqueo temporal de 48 horas, herencia Legado opcional y una cómoda vinculación multidispositivo.

## Primeros pasos

- ¿Nuevo en QoreX? Empieza por [Primeros pasos](/qorex/getting-started) para crear o restaurar tu monedero.
- Después aprende a [Enviar y recibir](/qorex/send-and-receive) QOR resistente a la computación cuántica.
- Configura tu red de seguridad en [Seguridad y recuperación](/qorex/security-and-recovery).
- En escritorio, instala la [Extensión de navegador](/qorex/browser-extension).

:::note Descarga y disponibilidad
QoreX **1.0** se está lanzando en las tiendas de aplicaciones: las apps de iOS y Android (App Store y Google Play) y la extensión de navegador (Chrome Web Store, Firefox Add-ons y una compilación para Safari). Es posible que algunos destinos sigan en la cola de revisión de una tienda en un momento dado. Encuentra siempre los enlaces de descarga oficiales y vigentes en [qorechain.io](https://qorechain.io), e instala QoreX únicamente desde una ficha de tienda oficial.
:::
