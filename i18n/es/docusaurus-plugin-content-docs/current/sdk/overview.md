---
slug: /sdk/overview
title: Visión general del SDK de QoreChain
sidebar_label: Visión general
sidebar_position: 1
---

# SDK de QoreChain

El SDK de QoreChain es el kit de desarrollo oficial multilenguaje para construir
aplicaciones descentralizadas sobre **QoreChain**, una red Layer 1 de triple VM
y resistente a la computación cuántica.

Esta documentación cubre cómo instalar el SDK, conectarse a la red, leer el
estado on-chain, derivar cuentas, firmar y enviar transacciones, y trabajar con
cada una de las máquinas virtuales de QoreChain.

## ¿Qué es QoreChain?

QoreChain es una blockchain Layer 1 con tres entornos de ejecución de contratos
inteligentes de primera clase en una sola cadena:

- **CosmWasm** — contratos inteligentes Wasm mediante el Cosmos SDK.
- **QoreChain EVM Engine** — ejecución compatible con Ethereum (Solidity, viem,
  JSON-RPC estándar).
- **SVM** — un runtime compatible con Solana con un JSON-RPC al estilo de Solana.

Las cuentas, los saldos y los tokens se comparten entre los runtimes, y la
cadena admite IBC para la interoperabilidad entre cadenas.

### Resistente a la computación cuántica por diseño

QoreChain proporciona primitivas de criptografía poscuántica (PQC) basadas en
**ML-DSA-87** (Dilithium-5, FIPS 204). Junto a la firma clásica secp256k1, la
cadena admite una postura de firma **híbrida** en la que una transacción lleva
*a la vez* una firma clásica y una firma poscuántica, de modo que sigue siendo
válida bajo verificación clásica hoy mientras gana protección poscuántica.

El SDK expone hoy la generación de claves, la firma y la verificación con
ML-DSA-87, además de los bloques de construcción para transacciones híbridas.
Consulta [Cuentas y firma PQC](/sdk/concepts/accounts-pqc) para más detalles.
Aquí no hay afirmaciones de marketing: el SDK expone exactamente las primitivas
que la cadena implementa.

## Qué hace diferente a este SDK

Más allá de la paridad multichain completa, hay tres capacidades que **solo son
posibles en QoreChain**, porque se apoyan en funcionalidades de protocolo que
ninguna otra Layer 1 tiene:

- **Evaluación de riesgo con IA antes del envío** — analiza una transacción con
  IA on-chain antes de difundirla. `simulateWithRiskScore` devuelve el gas más
  un veredicto de riesgo/anomalía procedente de precompilados EVM
  deterministas, de modo que una wallet o dApp puede advertir (o bloquear)
  *antes* de firmar. Consulta [AI pre-flight](/sdk/guides/ai-preflight).
- **Llamadas unificadas entre VMs** — una cuenta, tres VMs, una transacción.
  `createCrossVMClient` llama a un contrato en cualquier VM y `callAtomic`
  agrupa varias llamadas entre VMs en una sola transacción atómica firmada una
  única vez. Consulta [Llamadas cross-VM](/sdk/guides/cross-vm).
- **DX resistente a la computación cuántica** — haz que un firmante quede
  protegido de forma poscuántica con una sola llamada idempotente
  (`ensurePqcRegistered` / `migrateToHybrid`), con una insignia React lista
  para usar. Consulta [Quantum-safe](/sdk/guides/quantum-safe).

Otras dos capacidades a nivel de cadena llegaron en 0.6.0 y 0.7.0:

- **Cuentas unificadas eth-nativas** — una clave `eth_secp256k1` es una única
  identidad de 20 bytes representada como `qor1…`, `0x…` y una dirección SVM en
  base58, todas compartiendo un mismo saldo. Consulta
  [Cuentas unificadas](/sdk/concepts/accounts-pqc#unified-accounts).
- **Carriles de autenticadores** — vincula una clave de Phantom o MetaMask a la
  cuenta canónica que requiere PQC y permite que gaste a través de un relayer
  bajo condiciones de privilegio mínimo, con límites de gasto y revocables.
  Consulta
  [Autenticadores y gasto delegado](/sdk/guides/authenticators).

Un nuevo kit **`@qorechain/react`** (provider, hooks, `ConnectButton`,
`QuantumSafeBadge`) convierte la construcción de una dApp resistente a la
computación cuántica en el camino por defecto — consulta la
[guía del kit de React](/sdk/guides/react). Para el argumento completo, lee
[Por qué el SDK de QoreChain](/sdk/why).

## La familia del SDK

El SDK se distribuye como una familia de paquetes para que puedas construir en
el lenguaje que prefieras. Comparten los mismos presets de red, esquemas de
derivación, aritmética de denominaciones y superficies de lectura.

| Paquete | Lenguaje | Instalación | Estado |
| --- | --- | --- | --- |
| `@qorechain/sdk` | TypeScript | `npm i @qorechain/sdk` | Publicado (npm, v0.7.0) |
| `qorechain-sdk` | Python | `pip install qorechain-sdk` (se importa como `qorsdk`) | Publicado (PyPI, v0.7.0) |
| `qorechain-sdk` (módulo Go) | Go | `go get github.com/qorechain/qorechain-sdk/packages/go/...` | Publicado (proxy de Go, tag `packages/go/v0.7.0`) |
| `qorechain-sdk` | Rust | `cargo add qorechain-sdk` (se importa como `qorechain`) | Publicado (crates.io, última versión publicada; 0.7.0 desde el repositorio) |
| `io.github.qorechain:qorechain-sdk` | Java | `io.github.qorechain:qorechain-sdk:0.7.0` | Publicado (Maven Central, v0.7.0) |
| `@qorechain/evm` | TypeScript (adaptador EVM) | `npm i @qorechain/evm viem` | Publicado (npm, v0.7.0) |
| `@qorechain/svm` | TypeScript (adaptador SVM) | `npm i @qorechain/svm @solana/web3.js` | Publicado (npm, v0.7.0) |
| `@qorechain/react` | TypeScript (kit de React) | `npm i @qorechain/react` | Publicado (npm, v0.7.0) |
| `create-qorechain-dapp` | CLI | `npm create qorechain-dapp` | Publicado (npm, v0.7.0) |

> La distribución de Python se instala como `qorechain-sdk` pero **se importa
> como `qorsdk`**. Todos los clientes están publicados en sus registros —
> consulta [Instalación](/sdk/install) para los comandos por lenguaje.

El núcleo en TypeScript (`@qorechain/sdk`) es la base de los ejemplos de esta
documentación. Los clientes de Python, Go, Rust y Java alcanzan **paridad
completa con la cadena nativa** respecto a TypeScript: presets de red,
utilidades de denominación/direcciones, derivación de cuentas HD
(nativa/EVM/SVM), firma PQC (ML-DSA-87), compositores de mensajes tipados para
cada módulo personalizado más los módulos estándar de Cosmos, clientes de
consulta tipados, el ciclo de vida completo de la transacción (auto-gas,
decodificación de errores, seguimiento de tx, búsqueda de bloques/tx),
transacciones poscuánticas híbridas y suscripciones WebSocket. Todos estos
clientes están **publicados**: TypeScript en npm (`@qorechain/sdk` 0.7.0),
Python en PyPI (`qorechain-sdk` 0.7.0, se importa como `qorsdk`), Go en el
proxy de módulos (tag `packages/go/v0.7.0`), Rust en crates.io
(`qorechain-sdk`, última versión publicada — la publicación del crate 0.7.0
está pendiente, así que instala desde crates.io o desde el repositorio) y Java
en Maven Central (`io.github.qorechain:qorechain-sdk` 0.7.0). Los adaptadores
de ejecución EVM/SVM (`@qorechain/evm`, `@qorechain/svm`, ambos 0.7.0), el kit
`@qorechain/react` (0.7.0) y la CLI de scaffolding `create-qorechain-dapp`
(0.7.0) son solo para TypeScript y también están publicados en npm.

## Novedades en 0.6 y 0.7

**0.6.0 — cuentas unificadas eth-nativas (cadena v3.1.83).** Una clave
`eth_secp256k1` es una única identidad de 20 bytes representada en las tres
codificaciones de dirección, compartiendo un mismo saldo gastable en todos los
carriles:

```ts
import { deriveUnifiedAccount } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
account.cosmos; // "qor1…"   (bech32, Native lane)
account.evm;    // "0x…"     (EIP-55, EVM lane)
account.svm;    // base58    (20 bytes + 12 zero bytes)
```

La firma en el carril nativo con la misma clave se hace con
`signClassicalEth` / `signHybridEth`, y `connectPhantomUnified` deriva una
cuenta unificada no custodial a partir de una firma determinista de Phantom. El
método heredado `deriveNativeAccount` con coin type 118 no cambia. Consulta
[Cuentas unificadas](/sdk/concepts/accounts-pqc#unified-accounts).

**0.6.1 — corrección crítica para el consenso.** La extensión del cuerpo de la
tx `PQCHybridSignature` ahora se codifica en protobuf (antes se codificaba en
JSON y era rechazada en CheckTx). Las transacciones híbridas construidas con
SDK ≤ 0.6.0 son **rechazadas on-chain** — actualiza.

**0.7.0 — carriles de autenticadores (cadena v3.1.85).** Una clave vinculada de
Phantom (ed25519) o MetaMask (secp256k1, por dirección de 20 bytes) puede
gastar desde la cuenta canónica que requiere PQC a través de un relayer, bajo
condiciones de privilegio mínimo, con límites de gasto y revocables:
compositores de `MsgExecuteEVM` / `MsgExecuteCosmos` / `MsgRotatePQCKey`,
helpers byte-exactos `evmAuthSignBytes` / `cosmosAuthSignBytes` /
`rotationSignBytes`, la consulta `permissionSchema`, códigos de error
decodificados y builders de wallet en TypeScript
(`buildPhantomExecuteCosmos`, `buildMetaMaskExecuteEvm`, …). Recorrido completo
con ejemplos listos para copiar y pegar:
[Autenticadores y gasto delegado](/sdk/guides/authenticators).

## Próximos pasos

- [Por qué el SDK de QoreChain](/sdk/why) — las cinco capacidades exclusivas de QoreChain.
- [Instalación](/sdk/install) — instrucciones de instalación por lenguaje.
- [Inicio rápido](/sdk/quickstart) — conéctate, lee un saldo, envía una transferencia.
- [Conceptos: Arquitectura](/sdk/concepts/architecture) — el modelo de triple VM.
- [Conceptos: Cuentas y firma PQC](/sdk/concepts/accounts-pqc) — claves y
  firma poscuántica.
- [Guías](/sdk/guides/evm) — tutoriales por VM.
- [Autenticadores y gasto delegado](/sdk/guides/authenticators) — claves
  vinculadas de Phantom/MetaMask gastando a través de un relayer.
- [Referencia de red y endpoints](/sdk/reference/network) — chain id, puertos, token.
- [Ejemplos](/sdk/examples) — fragmentos ejecutables y listos para copiar y pegar.
- La [Referencia de red y endpoints](/sdk/reference/network) también aparece en [Redes](/appendix/networks).
