---
slug: /appendix/faq
title: Preguntas frecuentes
sidebar_label: Preguntas frecuentes
sidebar_position: 5
---

# Preguntas frecuentes

Preguntas generales sobre QoreChain, respondidas a partir de la documentación. Cada respuesta enlaza a la página autorizada con todo el detalle. Para preguntas específicas del SDK, consulta las [Preguntas frecuentes del SDK](/sdk/faq).

### ¿Está la mainnet en funcionamiento?

Sí. La mainnet de QoreChain (cadena `qorechain-vladi`, EVM chain ID 9801) está en funcionamiento desde el 7 de junio de 2026 y ejecuta la versión v3.2.8 (aplicada en la altura 4.273.000 el 18 de noviembre de 2026 por la propuesta de gobernanza 17; la v3.2.7 se había aplicado en la altura 4.164.600 el 12 de noviembre de 2026 por la propuesta 16); la testnet, `qorechain-diana`, ejecuta la v3.2.9 desde el 20 de noviembre de 2026, después de la v3.2.8 desde el 12 de noviembre (v3.2.9 en la altura 10.424.000; v3.2.8 en la altura 9.929.500). Consulta [Redes](/appendix/networks) y [Conectarse a la mainnet](/getting-started/connecting-to-mainnet).

### ¿Cuáles son los chain ID y los EVM chain ID?

La mainnet es la cadena Cosmos `qorechain-vladi` con EVM chain ID **9801** (hex `0x2649`); la testnet es `qorechain-diana` con EVM chain ID **9800** (hex `0x2648`). Consulta [Redes](/appendix/networks) para la tabla completa.

### ¿Cómo se distribuyen las comisiones de transacción?

Las comisiones recaudadas se dividen en **37% para validadores, 30% quemado, 20% para la tesorería comunitaria, 10% para stakers y 3% para nodos ligeros**. La división se aplica a todo lo que hay en el fee collector, lo que incluye la emisión de la época. Consulta [Tokenomics](/architecture/tokenomics#fee-distribution).

### ¿Qué es PRISM?

PRISM es la capa de optimización por aprendizaje por refuerzo integrada en el Motor de Consenso de QoreChain. Observa las métricas de la red y propone ajustes deterministas de los parámetros de consenso bajo controles de seguridad de disyuntor. Hoy funciona en modo de observación: no hay cargada ninguna política entrenada, por lo que no cambia ningún parámetro. Consulta [Motor de Consenso PRISM](/architecture/prism-consensus-engine).

### ¿Está el puente entre cadenas en funcionamiento?

No. El módulo del puente está desplegado, pero las 37 configuraciones de cadena siguen pendientes, no hay validadores del puente registrados y no existe ningún canal IBC en la mainnet (la testnet tiene un único canal de transferencia ICS-20 hacia una cadena de prueba, abierto para pruebas de IBC, y ninguno hacia las contrapartes previstas). Está diseñado en torno a 37 configuraciones de cadena y hasta 8 contrapartes IBC; trata estos objetivos como intención de diseño. Consulta [Arquitectura del puente](/architecture/bridge-architecture).

### ¿Cómo conecto una billetera?

Usa la billetera oficial [QoreX](/qorex/overview), o añade una red de QoreChain a una billetera EVM usando los EVM chain ID (9801 mainnet, 9800 testnet). Consulta [Configuración de la billetera](/getting-started/wallet-setup).

### ¿Cómo obtengo tokens de testnet?

Usa el faucet de testnet en el Dashboard. Consulta [Faucet del Dashboard](/dashboard/faucet) y [Conectarse a la testnet](/getting-started/connecting-to-testnet).

### ¿Qué son fUSD, fETH y fBTC?

Tokens de prueba exclusivos de la testnet (FestUSD, FestETH y FestBTC, con 6, 18 y 8 decimales) creados para el builder fest. No tienen valor, no existen en la mainnet y se mantienen como monedas bank con las denominaciones, sensibles a mayúsculas y minúsculas, `erc20:<dirección del contrato>`. El Faucet de la testnet puede enviarlos junto con un claim de QOR. Consulta [Tokens de prueba Fest](/dashboard/faucet#fest-tokens).

### ¿Cómo ejecuto un nodo, un validador o un nodo ligero?

Para un nodo completo, consulta [Ejecutar un nodo](/developer-guide/running-a-node). Para un validador, consulta [Ejecutar un validador](/developer-guide/running-a-validator). Para un nodo ligero, consulta [Nodo ligero](/light-node/overview); el registro en el programa de recompensas de nodos ligeros está abierto y sujeto a licencia, y el 27 de octubre de 2026 se registró un nodo ligero en cada red ([estado](/light-node/overview#reward-program-status)).

### ¿Qué esquema de firma usa QoreChain?

QoreChain usa un esquema híbrido post-cuántico que combina el clásico **secp256k1 (ECDSA)** con el post-cuántico **ML-DSA-87 (Dilithium-5)**. Este esquema híbrido es obligatorio de forma predeterminada en la ruta de transacciones de Cosmos, con el modo de cumplimiento controlado por gobernanza. En el carril EVM la firma sigue siendo secp256k1, y además la cuenta debe tener una clave ML-DSA registrada y una ventana de autorización abierta (desde la v3.2.0). Una cuenta queda protegida de forma post-cuántica solo después de registrar su clave ML-DSA-87; ese primer registro se firma únicamente con la clave clásica (el arranque documentado), así que regístrala antes de que la cuenta tenga fondos importantes. Consulta [Seguridad post-cuántica](/architecture/post-quantum-security).

### ¿Por qué se rechaza mi transacción EVM con "no open EVM authorisation window"?

Desde la v3.2.0, el carril EVM admite una transacción solo de una cuenta que tenga una clave post-cuántica registrada y una ventana de autorización abierta. Abre una ventana con una transacción del carril Cosmos con una firma híbrida ML-DSA-87 (FIPS 204) y vuelve a intentarlo. Consulta [Ventana de autorización EVM](/getting-started/first-transaction#evm-window).

### ¿Cuántos validadores tiene la mainnet?

Ocho validadores en bonding el 27 de octubre de 2026, con unos 60,3 millones de QOR en bonding (el conjunto activo puede tener hasta 100). La testnet tiene cuatro. Consulta el conjunto en vivo en `GET /cosmos/staking/v1beta1/validators` en `https://api.qore.host`.

### ¿Qué tiempo de bloque debo esperar?

Unos 3,1 segundos en la mainnet y unos 1,3 segundos en la testnet (promedios medidos, 27 de octubre de 2026). El tiempo de bloque lo fija la configuración de los nodos de los validadores.

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


### ¿Existe un segundo EVM RPC de la testnet, operado de forma independiente? {#testnet-second-evm-rpc}

Hoy no. `https://evm-testnet.qore.host` es el único JSON-RPC de EVM público para `qorechain-diana`, y los endpoints públicos de la testnet los opera el equipo de QoreChain. Compararlos comprueba interfaces distintas, no operadores independientes.

Para una comprobación realmente independiente, ejecuta tu propio nodo de testnet con JSON-RPC habilitado y consúltalo directamente. [Conexión a la red de pruebas](/getting-started/connecting-to-testnet) tiene el binario, el génesis, los pares y el state sync. Usa state sync: el sentry público solo conserva los bloques recientes.

Para verificaciones cruzadas rápidas puedes usar el RPC de consenso `https://rpc-testnet.qore.host` (bloques, transacciones por hash), REST `https://api-testnet.qore.host` (cuentas, saldos, estado de los módulos), el WebSocket de EVM `wss://evm-ws-testnet.qore.host` y el explorador en [explore.qore.network](https://explore.qore.network), cambiado a Testnet.

### ¿Qué ocurre si abro una nueva ventana EVM mientras otra sigue activa? {#new-evm-window}

La nueva ventana reemplaza a la activa, así que no necesitas cerrar antes la anterior. Una cuenta tiene una sola ventana a la vez.

La nueva ventana empieza con `usedTxs` y `usedValue` en cero. Su vencimiento, `maxTxs` y `maxValue` salen solo del nuevo mensaje. Nada se traspasa de la ventana anterior.

El alcance también se reemplaza por completo. Si el nuevo mensaje incluye `allowed_targets`, la ventana solo permite transacciones a esas direcciones y rechaza la creación de contratos, así que termina tus despliegues antes de abrir una ventana así. Si el nuevo mensaje no tiene lista, la nueva ventana no tiene ninguna, aunque la anterior la tuviera. Después de difundir la transacción, comprueba el resultado con la consulta de la ventana EVM o en el evento `pqc_evm_window_opened`. Consulta [Referencia de la ventana EVM](/developer-guide/evm-window-reference).

### ¿Cómo consigo que mi contrato CosmWasm se guarde y se permita para llamadas entre VM en la testnet? {#testnet-cosmwasm-allowlist}

En la testnet, la subida de código CosmWasm pasa por gobernanza. Envía una propuesta que abra la subida de código, guarde tu código y vuelva a cerrar la subida, con la misma forma que propuestas anteriores que se aprobaron (por ejemplo la 27 y la 50). Publica el código fuente, una compilación reproducible y el sha256 del archivo wasm para que otros puedan comprobarlo. Una propuesta normal necesita un depósito de 10 QOR y tiene una votación de 4 horas. Una urgente necesita 50 QOR, tiene una votación de 1 hora y requiere una proporción mayor de votos a favor.

Cuando el código esté guardado y tu contrato instanciado, una segunda propuesta lo añade a la lista de permitidos entre VM (`bridge_allowed_targets`, con un pin en `bridge_target_pins`), como hizo la propuesta 40. Un contrato con un administrador distinto de la gobernanza debe estar fijado con un pin. Esa propuesta reemplaza todos los parámetros del módulo, así que copia los valores actuales de `https://api-testnet.qore.host/qorechain/crossvm/v1/params` y añade tu entrada. El contrato ya debe existir cuando se ejecute la propuesta.

Publica el número de la propuesta en el canal de builders del festival cuando la envíes, para que los validadores de la testnet puedan revisarla y votar antes de que termine la votación. Los pasos completos, con los archivos y comandos exactos, están en [Propuestas de gobernanza para contratos](/developer-guide/governance-proposals-contracts).

## Relacionado

* [Redes](/appendix/networks) — referencia de chain ID, puertos y endpoints.
* [Qué es QoreChain](/introduction/what-is-qorechain) — visión general de la plataforma.
* [Bot comunitario QCAIA](/qcaia/overview) — haz preguntas en Discord y Telegram.
