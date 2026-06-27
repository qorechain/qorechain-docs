---
slug: /sdk/overview
title: Visión general del SDK de QoreChain
sidebar_label: Visión general
sidebar_position: 1
---

# SDK de QoreChain

El SDK de QoreChain es el kit de desarrollo multilenguaje oficial para crear
aplicaciones descentralizadas sobre **QoreChain**: una red Layer 1
resistente a la computación cuántica y con triple VM.

Esta documentación cubre cómo instalar el SDK, conectarse a la red, leer
el estado on-chain, derivar cuentas, firmar y enviar transacciones, y trabajar con cada
una de las máquinas virtuales de QoreChain.

## ¿Qué es QoreChain?

QoreChain es una blockchain Layer 1 con tres entornos de ejecución de contratos
inteligentes de primera clase en una sola cadena:

- **CosmWasm** — contratos inteligentes Wasm a través del Cosmos SDK.
- **QoreChain EVM Engine** — ejecución compatible con Ethereum (Solidity, viem,
  JSON-RPC estándar).
- **SVM** — un entorno de ejecución compatible con Solana con un JSON-RPC al estilo de Solana.

Las cuentas, los saldos y los tokens se comparten entre los entornos de ejecución, y la cadena
admite IBC para la interoperabilidad entre cadenas.

### Resistente a la computación cuántica por diseño

QoreChain proporciona primitivas de criptografía post-cuántica (PQC) basadas en
**ML-DSA-87** (Dilithium-5, FIPS 204). Junto con la firma clásica secp256k1,
la cadena admite una postura de firma **híbrida** en la que una transacción lleva
*tanto* una firma clásica como una firma post-cuántica, de modo que permanece válida
bajo verificación clásica hoy mientras gana protección post-cuántica.

El SDK expone hoy la generación de claves, la firma y la verificación ML-DSA-87, además de
los componentes básicos para las transacciones híbridas. Consulta
[Cuentas y firma PQC](/sdk/concepts/accounts-pqc) para más detalles. Sin afirmaciones de
marketing aquí: el SDK expone exactamente las primitivas que implementa la cadena.

## Qué hace diferente a este SDK

Más allá de la plena paridad multicadena, hay tres capacidades **solo posibles en
QoreChain**, porque se construyen sobre características del protocolo que ninguna otra Layer 1 tiene:

- **Puntuación de riesgo de IA pre-vuelo** — escanea una transacción con IA on-chain antes de
  difundirla. `simulateWithRiskScore` devuelve el gas más un veredicto de riesgo/anomalía
  de precompilados EVM deterministas, de modo que una billetera o dApp puede advertir (o bloquear)
  *antes* de firmar. Consulta [IA pre-vuelo](/sdk/guides/ai-preflight).
- **Llamadas cross-VM unificadas** — una cuenta, tres VM, una transacción.
  `createCrossVMClient` llama a un contrato en cualquier VM y `callAtomic` empaqueta varias
  llamadas cross-VM en una sola transacción atómica firmada una vez. Consulta
  [Llamadas cross-VM](/sdk/guides/cross-vm).
- **DX resistente a la computación cuántica** — protege un firmante con criptografía post-cuántica en una sola
  llamada idempotente (`ensurePqcRegistered` / `migrateToHybrid`), con una insignia React lista para usar.
  Consulta [Resistente a la computación cuántica](/sdk/guides/quantum-safe).

Un nuevo kit **`@qorechain/react`** (provider, hooks, `ConnectButton`,
`QuantumSafeBadge`) hace que crear una dApp resistente a la computación cuántica sea el camino por defecto; consulta la
[guía del kit React](/sdk/guides/react). Para el argumento completo, lee
[Por qué el SDK de QoreChain](/sdk/why).

## La familia del SDK

El SDK se distribuye como una familia de paquetes para que puedas desarrollar en el lenguaje de
tu elección. Comparten los mismos preajustes de red, esquemas de derivación, aritmética de
denominaciones y superficies de lectura.

| Paquete | Lenguaje | Instalación | Estado |
| --- | --- | --- | --- |
| `@qorechain/sdk` | TypeScript | `npm i @qorechain/sdk` | Publicado (npm, v0.5.0) |
| `qorechain-sdk` | Python | `pip install qorechain-sdk` (import `qorsdk`) | Publicado (PyPI, v0.5.0) |
| `qorechain-sdk` (módulo Go) | Go | `go get github.com/qorechain/qorechain-sdk/packages/go/...` | Publicado (Go proxy, v0.5.0) |
| `qorechain-sdk` | Rust | `cargo add qorechain-sdk` | Publicado (crates.io, v0.5.0) |
| `io.github.qorechain:qorechain-sdk` | Java | `io.github.qorechain:qorechain-sdk:0.5.0` | Publicado (Maven Central, v0.5.0) |
| `@qorechain/evm` | TypeScript (adaptador EVM) | `npm i @qorechain/evm viem` | Publicado (npm, v0.5.0) |
| `@qorechain/svm` | TypeScript (adaptador SVM) | `npm i @qorechain/svm @solana/web3.js` | Publicado (npm, v0.5.0) |
| `@qorechain/react` | TypeScript (kit React) | `npm i @qorechain/react` | Publicado (npm, v0.5.0) |
| `create-qorechain-dapp` | CLI | `npm create qorechain-dapp` | Publicado (npm, v0.5.0) |

> La distribución de Python se instala como `qorechain-sdk` pero **se importa como
> `qorsdk`**. Todos los clientes están publicados en sus registros; consulta
> [Instalación](/sdk/install) para los comandos por lenguaje.

El núcleo de TypeScript (`@qorechain/sdk`) es la base de los ejemplos de esta
documentación. Los clientes de Python, Go, Rust y Java alcanzan **plena paridad nativa
con la cadena** respecto a TypeScript: preajustes de red, utilidades de denominación/dirección, derivación
de cuentas HD (native/EVM/SVM), firma PQC (ML-DSA-87), compositores de mensajes tipados
para cada módulo personalizado más los módulos estándar de Cosmos, clientes de consulta tipados,
el ciclo de vida completo de la transacción (auto-gas, decodificación de errores, seguimiento de tx,
búsqueda de bloques/tx), transacciones híbridas post-cuánticas, y suscripciones
WebSocket. Todos estos clientes están **publicados**: TypeScript en npm
(`@qorechain/sdk` 0.5.0), Python en PyPI (`qorechain-sdk` 0.5.0, import
`qorsdk`), Go en el proxy de módulos (`.../packages/go` 0.5.0), Rust en
crates.io (`qorechain-sdk` 0.5.0), y Java en Maven Central
(`io.github.qorechain:qorechain-sdk` 0.5.0). Los adaptadores de ejecución EVM/SVM
(`@qorechain/evm`, `@qorechain/svm`, ambos 0.5.0), el kit `@qorechain/react`
(0.5.0), y la CLI de andamiaje `create-qorechain-dapp` son exclusivos de TypeScript y
también están publicados en npm.

La versión v0.4 añadió retiros de rollup (`MsgExecuteWithdrawal`, la ruta de salida
L2→L1), clientes de consulta tipados para los módulos `multilayer`, `rdk` y `bridge`,
mensajes de administración del bridge, y helpers de alto nivel para sidechain/paychain y rollup
en los cinco lenguajes.

## Hacia dónde ir a continuación

- [Por qué el SDK de QoreChain](/sdk/why) — las tres capacidades exclusivas de QoreChain.
- [Instalación](/sdk/install) — instrucciones de instalación por lenguaje.
- [Quickstart](/sdk/quickstart) — conectarse, leer un saldo, enviar una transferencia.
- [Conceptos: Arquitectura](/sdk/concepts/architecture) — el modelo de triple VM.
- [Conceptos: Cuentas y firma PQC](/sdk/concepts/accounts-pqc) — claves y
  firma post-cuántica.
- [Guías](/sdk/guides/evm) — tutoriales por VM.
- [Referencia de red y endpoints](/sdk/reference/network) — chain id, puertos, token.
- [Ejemplos](/sdk/examples) — fragmentos ejecutables y listos para copiar y pegar.
- [La referencia de red y endpoints](/sdk/reference/network) también aparece en [Redes](/appendix/networks).
