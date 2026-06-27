---
slug: /appendix/faq
title: Preguntas frecuentes
sidebar_label: Preguntas frecuentes
sidebar_position: 5
---

# Preguntas frecuentes

Preguntas generales sobre QoreChain, respondidas a partir de la documentación. Cada respuesta enlaza a la página autorizada con todo el detalle. Para preguntas específicas del SDK, consulta las [Preguntas frecuentes del SDK](/sdk/faq).

### ¿Está la mainnet en funcionamiento?

Sí. La mainnet de QoreChain (cadena `qorechain-vladi`, EVM chain ID 9801) está en funcionamiento desde el 7 de junio de 2026. Consulta [Redes](/appendix/networks) y [Conectarse a la mainnet](/getting-started/connecting-to-mainnet).

### ¿Cuáles son los chain ID y los EVM chain ID?

La mainnet es la cadena Cosmos `qorechain-vladi` con EVM chain ID **9801** (hex `0x2649`); la testnet es `qorechain-diana` con EVM chain ID **9800** (hex `0x2648`). Consulta [Redes](/appendix/networks) para la tabla completa.

### ¿Cómo se distribuyen las comisiones de transacción?

Las comisiones recaudadas se dividen en **37% para validadores, 30% quemado, 20% para la tesorería comunitaria, 10% para stakers y 3% para nodos ligeros**. Consulta [Tokenomics](/architecture/tokenomics).

### ¿Qué es PRISM?

PRISM es la capa de optimización por aprendizaje por refuerzo integrada en el Motor de Consenso de QoreChain. Observa las métricas de la red y propone ajustes deterministas de los parámetros de consenso bajo controles de seguridad de disyuntor. Consulta [Motor de Consenso PRISM](/architecture/prism-consensus-engine).

### ¿Está el puente entre cadenas en funcionamiento?

El puente entre cadenas se encuentra actualmente en testnet y pendiente; todavía no es un sistema de producción. Está diseñado en torno a 37 configuraciones de cadena QCB y 8 canales IBC; trata estos objetivos como intención de diseño y no como garantías en vivo de la mainnet. Consulta [Arquitectura del puente](/architecture/bridge-architecture).

### ¿Cómo conecto una billetera?

Configura una billetera y añade una red de QoreChain usando los EVM chain ID (9801 mainnet, 9800 testnet). Consulta [Configuración de la billetera](/getting-started/wallet-setup).

### ¿Cómo obtengo tokens de testnet?

Usa el faucet de testnet en el Dashboard. Consulta [Faucet del Dashboard](/dashboard/faucet) y [Conectarse a la testnet](/getting-started/connecting-to-testnet).

### ¿Cómo ejecuto un nodo, un validador o un nodo ligero?

Para un nodo completo, consulta [Ejecutar un nodo](/developer-guide/running-a-node). Para un validador, consulta [Ejecutar un validador](/developer-guide/running-a-validator). Para un nodo ligero, consulta [Nodo ligero](/light-node/overview).

### ¿Qué esquema de firma usa QoreChain?

QoreChain usa un esquema híbrido post-cuántico que combina el clásico **secp256k1 (ECDSA)** con el post-cuántico **ML-DSA-87 (Dilithium-5)**. Este esquema híbrido es obligatorio de forma predeterminada en la ruta de transacciones de Cosmos, con el modo de cumplimiento controlado por gobernanza. Consulta [Seguridad post-cuántica](/architecture/post-quantum-security).

### ¿Cómo construyo un rollup?

Usa el Rollup Development Kit de QoreChain. Consulta [Rollups](/rollups/overview) y la referencia de arquitectura del [Rollup Development Kit](/architecture/rollup-development-kit).

### ¿Cómo construyo una dApp?

Usa el [QoreChain SDK](/sdk/overview), el SDK público para construir aplicaciones en QoreChain a través de sus entornos de ejecución EVM, SVM y CosmWasm.

### ¿Dónde puedo hacer preguntas?

El bot comunitario QCAIA responde preguntas en Discord ([discord.gg/qorechain](https://discord.gg/qorechain)) y Telegram ([t.me/QoreChainCommunity](https://t.me/QoreChainCommunity)). Consulta [Bot comunitario QCAIA](/qcaia/overview).

## Relacionado

* [Redes](/appendix/networks) — referencia de chain ID, puertos y endpoints.
* [Qué es QoreChain](/introduction/what-is-qorechain) — visión general de la plataforma.
* [Bot comunitario QCAIA](/qcaia/overview) — haz preguntas en Discord y Telegram.
