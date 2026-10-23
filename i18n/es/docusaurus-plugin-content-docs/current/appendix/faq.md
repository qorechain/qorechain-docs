---
slug: /appendix/faq
title: Preguntas frecuentes
sidebar_label: Preguntas frecuentes
sidebar_position: 5
---

# Preguntas frecuentes

Preguntas generales sobre QoreChain, respondidas a partir de la documentación. Cada respuesta enlaza a la página autorizada con todo el detalle. Para preguntas específicas del SDK, consulta las [Preguntas frecuentes del SDK](/sdk/faq).

### ¿Está la mainnet en funcionamiento?

Sí. La mainnet de QoreChain (cadena `qorechain-vladi`, EVM chain ID 9801) está en funcionamiento desde el 7 de junio de 2026 y ejecuta la versión v3.2.4 (aplicada en la altura 3.742.566 el 23 de octubre de 2026 por la propuesta de gobernanza 13); la testnet, `qorechain-diana`, ejecuta la v3.2.4 desde el 19 de octubre de 2026. Consulta [Redes](/appendix/networks) y [Conectarse a la mainnet](/getting-started/connecting-to-mainnet).

### ¿Cuáles son los chain ID y los EVM chain ID?

La mainnet es la cadena Cosmos `qorechain-vladi` con EVM chain ID **9801** (hex `0x2649`); la testnet es `qorechain-diana` con EVM chain ID **9800** (hex `0x2648`). Consulta [Redes](/appendix/networks) para la tabla completa.

### ¿Cómo se distribuyen las comisiones de transacción?

Las comisiones recaudadas se dividen en **37% para validadores, 30% quemado, 20% para la tesorería comunitaria, 10% para stakers y 3% para nodos ligeros**. La división se aplica a todo lo que hay en el fee collector, lo que incluye la emisión de la época. Consulta [Tokenomics](/architecture/tokenomics#fee-distribution).

### ¿Qué es PRISM?

PRISM es la capa de optimización por aprendizaje por refuerzo integrada en el Motor de Consenso de QoreChain. Observa las métricas de la red y propone ajustes deterministas de los parámetros de consenso bajo controles de seguridad de disyuntor. Hoy funciona en modo de observación: no hay cargada ninguna política entrenada, por lo que no cambia ningún parámetro. Consulta [Motor de Consenso PRISM](/architecture/prism-consensus-engine).

### ¿Está el puente entre cadenas en funcionamiento?

No. El módulo del puente está desplegado, pero las 37 configuraciones de cadena siguen pendientes, no hay validadores del puente registrados y no existen canales IBC en ninguna de las dos redes. Está diseñado en torno a 37 configuraciones de cadena y hasta 8 contrapartes IBC; trata estos objetivos como intención de diseño. Consulta [Arquitectura del puente](/architecture/bridge-architecture).

### ¿Cómo conecto una billetera?

Usa la billetera oficial [QoreX](/qorex/overview), o añade una red de QoreChain a una billetera EVM usando los EVM chain ID (9801 mainnet, 9800 testnet). Consulta [Configuración de la billetera](/getting-started/wallet-setup).

### ¿Cómo obtengo tokens de testnet?

Usa el faucet de testnet en el Dashboard. Consulta [Faucet del Dashboard](/dashboard/faucet) y [Conectarse a la testnet](/getting-started/connecting-to-testnet).

### ¿Cómo ejecuto un nodo, un validador o un nodo ligero?

Para un nodo completo, consulta [Ejecutar un nodo](/developer-guide/running-a-node). Para un validador, consulta [Ejecutar un validador](/developer-guide/running-a-validator). Para un nodo ligero, consulta [Nodo ligero](/light-node/overview); el registro en el programa de recompensas de nodos ligeros está abierto y sujeto a licencia ([estado](/light-node/overview#reward-program-status)).

### ¿Qué esquema de firma usa QoreChain?

QoreChain usa un esquema híbrido post-cuántico que combina el clásico **secp256k1 (ECDSA)** con el post-cuántico **ML-DSA-87 (Dilithium-5)**. Este esquema híbrido es obligatorio de forma predeterminada en la ruta de transacciones de Cosmos, con el modo de cumplimiento controlado por gobernanza. En el carril EVM la firma sigue siendo secp256k1, y además la cuenta debe tener una clave ML-DSA registrada y una ventana de autorización abierta (desde la v3.2.0). Consulta [Seguridad post-cuántica](/architecture/post-quantum-security).

### ¿Por qué se rechaza mi transacción EVM con "no open EVM authorisation window"?

Desde la v3.2.0, el carril EVM admite una transacción solo de una cuenta que tenga una clave post-cuántica registrada y una ventana de autorización abierta. Abre una ventana con una transacción del carril Cosmos firmada con firma post-cuántica y vuelve a intentarlo. Consulta [Ventana de autorización EVM](/getting-started/first-transaction#evm-window).

### ¿Cuántos validadores tiene la mainnet?

Ocho validadores en bonding el 23 de octubre de 2026, con unos 55,6 millones de QOR en bonding (el conjunto activo puede tener hasta 100). La testnet tiene tres. Consulta el conjunto en vivo en `GET /cosmos/staking/v1beta1/validators` en `https://api.qore.host`.

### ¿Qué tiempo de bloque debo esperar?

Unos 3,2 segundos en la mainnet y unos 1 segundo en la testnet (promedios medidos, octubre de 2026). El tiempo de bloque lo fija la configuración de los nodos de los validadores.

### ¿Está disponible xQORE?

Todavía no. El módulo de contabilidad existe, pero las transacciones de bloqueo y desbloqueo no están conectadas a las redes en vivo. Consulta [Tokenomics](/architecture/tokenomics#x-xqore).

### ¿Es fijo el suministro de QOR?

El suministro en génesis fue de 4,420,000,000 QOR. La emisión por staking se acuña bajo un tope acumulado estricto de 590,000,000 QOR (86,000 QOR por época desde la propuesta de gobernanza 10, de octubre de 2026), y las quemas retiran tokens de forma permanente. Consulta [Tokenomics](/architecture/tokenomics#supply-and-emission).

### ¿Cómo construyo un rollup?

Usa el Rollup Development Kit de QoreChain. Consulta [Rollups](/rollups/overview) y la referencia de arquitectura del [Rollup Development Kit](/architecture/rollup-development-kit).

### ¿Cómo construyo una dApp?

Usa el [QoreChain SDK](/sdk/overview), el SDK público para construir aplicaciones en QoreChain a través de sus entornos de ejecución EVM, SVM y QoreChain Native.

### ¿Dónde puedo hacer preguntas?

El bot comunitario QCAIA responde preguntas en Discord ([discord.gg/qorechain](https://discord.gg/qorechain)) y Telegram ([t.me/QoreChainCommunity](https://t.me/QoreChainCommunity)). Consulta [Bot comunitario QCAIA](/qcaia/overview).

## Relacionado

* [Redes](/appendix/networks) — referencia de chain ID, puertos y endpoints.
* [Qué es QoreChain](/introduction/what-is-qorechain) — visión general de la plataforma.
* [Bot comunitario QCAIA](/qcaia/overview) — haz preguntas en Discord y Telegram.
