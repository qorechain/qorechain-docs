---
slug: /build-before-qday/overview
title: Build Before Q-Day
sidebar_label: Resumen
sidebar_position: 1
---

# Build Before Q-Day

**Build Before Q-Day** es el fest de desarrolladores de QoreChain, que se celebra en línea en [build.qorechain.io](https://build.qorechain.io) con el hashtag #BuildBeforeQDay. Los participantes eligen un nivel, construyen en la testnet de QoreChain con los kits de código abierto, publican su avance en abierto y presentan su proyecto ante un jurado y la comunidad. Junto al fest hay un taller técnico por semana. Cada taller tiene una guía completa paso a paso en esta sección, desde el primer comando hasta el último, para que puedas hacerlo todo a tu ritmo en tu propio ordenador. Las aplicaciones de ejemplo de cada taller están reunidas en el repositorio público [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday).

## Innovaciones {#innovations}

Cada taller de esta sección gira en torno a las funciones que diferencian a QoreChain:

- **Firma híbrida.** Una transacción se firma dos veces: una con una clave clásica secp256k1 y otra con una clave poscuántica ML-DSA-87. Quien robe solo la clave clásica no puede producir la segunda firma.
- **Verificada en la cadena.** Los validadores comprueban ambas firmas. La transacción lleva una extensión `PQCHybridSignature` y la cadena emite un evento `pqc_hybrid_verify` con el estado `verified`. Puedes leer ambos desde el endpoint REST público y ver el resultado en el explorador.
- **Herramientas habituales.** Sigues usando Hardhat, Foundry o el lenguaje que prefieras. Los kits se encargan de la clave poscuántica y de la ventana de autorización por ti.

## Cómo funciona {#how-it-works}

1. **Regístrate** en [build.qorechain.io](https://build.qorechain.io): inicia sesión con GitHub, elige tu nivel, conecta X y QoreX.
2. **Construye** en la testnet con los kits, los talleres semanales y los retos de mitad del hackathon. Los commits y las actualizaciones aparecen en el feed público.
3. **Envía** tu proyecto antes de la fecha límite con un repositorio público, un vídeo de hasta 3 minutos y la dirección de la testnet que usa tu proyecto.

Participar es gratis: construyes en la testnet, donde los QOR de prueba salen del [faucet](/dashboard/faucet). Las reglas completas de elegibilidad, envío y evaluación están en la página Rules del sitio del fest. El fondo de premios es de 20.000 $ en total, con subvenciones posteriores en QOR a partir de enero de 2027; el reparto está en el sitio del fest.

## Niveles {#levels}

Eliges un nivel al registrarte y puedes cambiarlo después.

| Nivel | Para quién es |
| --- | --- |
| Quantum Pass | Eres nuevo en QoreChain o en web3. Construye una pequeña aplicación que envía una transacción poscuántica híbrida y la lee de vuelta desde la cadena. |
| Intermediate | Ya has publicado una dApp. Construye una aplicación completa con el SDK de QoreChain y QoreX. |
| Advanced | Tres vías: A, agentes; B, aplicaciones cifradas con QoreSeal; C, aplicaciones entre VM que abarcan los carriles EVM y Native. |
| Expert | Infraestructura de protocolo: rollups con el RDK, IBC con QORel, custodia y herramientas para desarrolladores. |

El Taller 1 cubre exactamente lo que pide el nivel Quantum Pass: una transacción con firma híbrida, verificada en la cadena.

## Calendario {#timeline}

Todas las horas son UTC.

| Cuándo | Qué |
| --- | --- |
| 4 de noviembre de 2026 | Se abren el registro y la construcción |
| Cada semana | Un taller (4 en total) con su guía paso a paso aquí |
| 18 de noviembre de 2026 | Empiezan los retos de mitad del hackathon |
| 2 de diciembre de 2026, 23:59 | Fecha límite de envío |
| Del 3 al 5 de diciembre | Comprobación de los envíos |
| Del 6 al 15 de diciembre | Evaluación y votación People's Choice |
| 16 de diciembre | Ganadores y demostración en directo |
| Del 17 al 22 de diciembre | Pago de los premios |
| Enero de 2027 | Subvenciones posteriores |

El calendario está en el sitio del fest.

## Talleres {#workshops}

| Taller | Tema | Guía |
| --- | --- | --- |
| Taller 1 | Tu primera transacción con firma híbrida | [Taller 1](/build-before-qday/workshop-1) |

Cada guía parte de cero, sin nada instalado. Indica qué instalar y después recorre los comandos uno por uno: obtener el código, instalar, crear una clave solo para la testnet, conseguir QOR de prueba en el faucet, ejecutar y comprobar el resultado en el explorador. Termina con los paquetes usados y las aplicaciones de ejemplo. Todas las aplicaciones de ejemplo están en el repositorio público [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday).

## Por dónde empezar {#where-to-start}

- Sigue el [Taller 1](/build-before-qday/workshop-1) en la testnet.
- Explora las [aplicaciones de ejemplo](/build-before-qday/workshop-1/kits) y los kits que hay detrás.
- Si nunca has desplegado en QoreChain, lee primero [Despliega en 5 minutos](/getting-started/deploy-in-5-minutes).
