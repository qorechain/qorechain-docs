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

- **QoreChain Native** — contratos inteligentes Wasm mediante el Cosmos SDK (el runtime CosmWasm).
- **QoreChain EVM Engine** — ejecución compatible con Ethereum (Solidity, viem,
  JSON-RPC estándar).
- **SVM** — un runtime compatible con Solana con un JSON-RPC al estilo de Solana.

Las cuentas, los saldos y los tokens se comparten entre los runtimes, y la
cadena incluye el módulo IBC para la interoperabilidad entre cadenas (no hay ningún
canal IBC abierto en mainnet; la testnet tiene un canal `transfer` abierto hacia una
cadena de prueba, comprobado el 27 de octubre de 2026).

:::note Qué funciona hoy en las redes en vivo (mainnet v3.2.4, testnet v3.2.6)
**Funciona:** lecturas en todos los carriles, transacciones Native con firma
híbrida, cuentas unificadas, transacciones EVM dentro de una
[ventana de autorización](/sdk/guides/evm#evm-window) y lecturas de SVM.
**Aún no disponible:** los precompilados EVM en mainnet (ninguno está activo allí; la
testnet tiene tres activos, verificación PQC, estado de clave PQC y parámetros de
consenso, y el par de IA y el puente cross-VM están inactivos en ambas), el espacio de nombres
JSON-RPC `qor_`, las transacciones SVM, las llamadas cross-VM en mainnet
(`MsgCrossVMCall` está desactivado por el circuit breaker), la subida e
instanciación de QoreChain Native para cuentas ordinarias (en la testnet, la
instanciación está abierta y la subida no), los flujos de autenticador /
cuenta abstracta en mainnet (módulo desactivado allí, habilitado en la
testnet), xQORE y la abstracción de gas. Cada guía repite la advertencia donde
corresponde. Comprobado contra los endpoints en vivo el 27 de octubre de 2026.

El SDK publicado (0.10.0, 26 de octubre de 2026) firma en la forma que verifican ambas
redes (sign-bytes híbridos v2, resueltos a partir del estado de la cadena), y el
formato de firma, las direcciones, los decimales, los memos y las comisiones no
cambiaron en la v3.2.3 ni en la v3.2.4 (la mainnet ejecuta la v3.2.4 desde el 23 de octubre de 2026;
la testnet ejecuta la v3.2.6, aplicada el 27 de octubre). Incluye el lado cliente de las reglas
poscuánticas posteriores (la prueba de posesión en el registro de claves, las ventanas
EVM con alcance, los mensajes de consentimiento EIP-7702) y de la v3.2.4 (niveles
de staking, el nonce del autenticador, interruptores de funciones del protocolo); las versiones anteriores
a la 0.9.0 no incluyen el primer grupo, consulta [Versiones anteriores a la 0.9.0](/sdk/install#before-090)
y [Qué añade la 0.10.0](/sdk/install#whats-new-0100).

Firma para wallets y backends: consulta [QoreSign](/qoresign/overview).
:::

### Resistente a la computación cuántica por diseño

QoreChain proporciona primitivas de criptografía poscuántica (PQC) basadas en
**ML-DSA-87** (Dilithium-5, FIPS 204). Junto a la firma clásica secp256k1, la
cadena admite una postura de firma **híbrida** en la que una transacción lleva
*a la vez* una firma clásica y una firma poscuántica, de modo que sigue siendo
válida bajo verificación clásica hoy mientras gana protección poscuántica.

El SDK expone hoy la generación de claves, la firma y la verificación con
ML-DSA-87, además de los bloques de construcción para transacciones híbridas.
En las redes en vivo, una transacción de la vía Native **debe** tener firma
híbrida y la clave ML-DSA-87 de la cuenta debe estar registrada primero.
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
  *antes* de firmar. Los precompilados de IA aún no están activos en mainnet ni en
  testnet. Consulta [AI pre-flight](/sdk/guides/ai-preflight).
- **Llamadas unificadas entre VMs** — una cuenta, tres VMs, una transacción.
  `createCrossVMClient` llama a un contrato en cualquier VM y `callAtomic`
  agrupa varias llamadas entre VMs en una sola transacción atómica firmada una
  única vez. Consulta [Llamadas cross-VM](/sdk/guides/cross-vm).
- **DX resistente a la computación cuántica** — haz que un firmante quede
  protegido de forma poscuántica con una sola llamada idempotente
  (`ensurePqcRegistered` / `migrateToHybrid`), con una insignia React lista
  para usar. Consulta [Quantum-safe](/sdk/guides/quantum-safe).

Otras dos capacidades a nivel de cadena llegaron en 0.6.0 y 0.7.0 (la segunda
aún no se puede usar en las redes en vivo, véase más abajo):

- **Cuentas unificadas eth-nativas** — una clave `eth_secp256k1` es una única
  identidad de 20 bytes representada como `qor1…`, `0x…` y una dirección SVM en
  base58, todas compartiendo un mismo saldo. Consulta
  [Cuentas unificadas](/sdk/concepts/accounts-pqc#unified-accounts).
- **Carriles de autenticadores** — vincula una clave de Phantom o MetaMask a la
  cuenta canónica que requiere PQC y permite que gaste a través de un relayer
  bajo condiciones de privilegio mínimo, con límites de gasto y revocables. El
  módulo `abstractaccount` que lo sustenta está desactivado en mainnet y habilitado en la testnet.
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
| `@qorechain/sdk` | TypeScript | `npm i @qorechain/sdk` | Publicado (npm, v0.10.0) |
| `qorechain-sdk` | Python | `pip install qorechain-sdk` (se importa como `qorsdk`) | Publicado (PyPI, v0.10.0) |
| `qorechain-sdk` (módulo Go) | Go | `go get github.com/qorechain/qorechain-sdk/packages/go/...` | Publicado (proxy de Go, tag `packages/go/v0.10.0`) |
| `qorechain-sdk` | Rust | `cargo add qorechain-sdk` (se importa como `qorechain`) | Publicado (crates.io, v0.10.0) |
| `io.github.qorechain:qorechain-sdk` | Java | `io.github.qorechain:qorechain-sdk:0.10.0` | Publicado (Maven Central, v0.10.0) |
| `@qorechain/evm` | TypeScript (adaptador EVM) | `npm i @qorechain/evm viem` | Publicado (npm, v0.8.0) |
| `@qorechain/svm` | TypeScript (adaptador SVM) | `npm i @qorechain/svm @solana/web3.js` | Publicado (npm, v0.8.0) |
| `@qorechain/react` | TypeScript (kit de React) | `npm i @qorechain/react` | Publicado (npm, v0.10.0) |
| `create-qorechain-dapp` | CLI | `npm create qorechain-dapp` | Publicado (npm, v0.10.0) |

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
clientes están **publicados**: TypeScript en npm (`@qorechain/sdk` 0.10.0),
Python en PyPI (`qorechain-sdk` 0.10.0, se importa como `qorsdk`), Go en el
proxy de módulos (tag `packages/go/v0.10.0`), Rust en crates.io
(`qorechain-sdk` 0.10.0) y Java en Maven Central
(`io.github.qorechain:qorechain-sdk` 0.10.0). Los adaptadores
de ejecución EVM/SVM (`@qorechain/evm`, `@qorechain/svm`, ambos 0.8.0), el kit
`@qorechain/react` (0.10.0) y la CLI de scaffolding `create-qorechain-dapp`
(0.10.0) son solo para TypeScript y también están publicados en npm. Consulta
[Instalación](/sdk/install#related-packages) para los paquetes complementarios.

## Novedades en 0.6, 0.7, 0.8, 0.9 y 0.10

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
`signClassicalEth` / `signHybridEth`, y una clave de Phantom o MetaMask se vincula a la cuenta como autenticador
(la derivación a partir de una firma de Phantom se eliminó en 0.8.0). El
método heredado `deriveNativeAccount` con coin type 118 no cambia. Consulta
[Cuentas unificadas](/sdk/concepts/accounts-pqc#unified-accounts).

**0.6.1 — corrección crítica para el consenso.** La extensión del cuerpo de la
tx `PQCHybridSignature` ahora se codifica en protobuf (antes se codificaba en
JSON y era rechazada en CheckTx). Las transacciones híbridas construidas con
SDK ≤ 0.6.0 son **rechazadas on-chain** — actualiza.

**0.7.0 — carriles de autenticadores (cadena v3.1.85).** El módulo
`abstractaccount` que los sustenta está actualmente desactivado en mainnet y habilitado en la testnet
(consulta la [guía de Autenticadores](/sdk/guides/authenticators)). Una clave
vinculada de Phantom (ed25519) o MetaMask (secp256k1, por dirección de 20
bytes) puede gastar desde la cuenta canónica que requiere PQC a través de un
relayer, bajo condiciones de privilegio mínimo, con límites de gasto y
revocables: compositores de `MsgExecuteEVM` / `MsgExecuteCosmos` /
`MsgRotatePQCKey`, helpers byte-exactos `evmAuthSignBytes` /
`cosmosAuthSignBytes` / `rotationSignBytes`, la consulta `permissionSchema`,
códigos de error decodificados y builders de wallet en TypeScript
(`buildPhantomExecuteCosmos`, `buildMetaMaskExecuteEvm`, …). Recorrido completo
con ejemplos listos para copiar y pegar:
[Autenticadores y gasto delegado](/sdk/guides/authenticators).

**0.8.0 – 0.8.3 — sign-bytes híbridos v2 y la ventana de autorización EVM
(cadena v3.2.0).** La mitad poscuántica de una transacción híbrida ahora se
firma en la forma que verifica la red de destino (v1 o v2,
`signBytesVersion: "auto" | "v1" | "v2"`). Ambas redes públicas están en v2, así
que se requiere el SDK **0.8.1 o posterior** para operar en mainnet (usa la versión actual). **0.8.2**
añade `openEvmWindowMsg`, `closeEvmWindowMsg`, `fetchEvmWindow` y
`classifyEvmWindowRejection` para la
[ventana de autorización](/sdk/guides/evm#evm-window) del carril EVM.
**0.8.0** eliminó los helpers de cuenta basados en firma de wallet (`connectPhantomUnified` y
`unifiedAccountFromPhantomSignature`, eliminados en 0.8.0), aplica comprobaciones
estrictas de tamaño de ML-DSA-87 en todos los lenguajes, y añade el flag `async`
y los datos devueltos del callee a las llamadas cross-VM. **0.8.3** corrige la
búsqueda de tx, las condiciones de carrera de los hooks de React, la secuencia de
`migrate_to_hybrid` en Python y la derivación PQC canónica independiente de la
forma de la dirección (`derivePqcCanonical`, `canonicalAccount`). Consulta las
[Notas de actualización](/sdk/install#upgrade).

**0.9.0 — soporte de cliente para la cadena v3.2.2 y v3.2.3.** El `TxClient` de
TypeScript firma de forma híbrida cuando pasas el keypair de la cuenta
(`client.connectTx(signer, { pqcKeypair })`), de modo que `bankSend` y los clientes
de rollup, multilayer y cross-VM del SDK funcionan en las redes públicas.
`ensurePqcRegistered` comprueba primero la clave registrada por REST, se niega a
registrar una segunda clave distinta y adjunta por sí mismo la prueba de posesión
una vez que la red ha aplicado la v3.2.3. Los nuevos constructores cubren las
ventanas EVM con alcance (`nativeOnly`, `allowedTargets`) y los mensajes de
consentimiento EIP-7702, y `derivePqcCanonical(address, mnemonic)` da una clave que
puedes recuperar a partir del mnemónico en todos los lenguajes. La ruta de cuenta
PQC es la singular `/qorechain/pqc/v1/account/{address}`, los fallos dentro de un
bloque conservan su codespace y `create-qorechain-dapp` genera proyectos sobre el
SDK actual. Consulta [Qué añadió la 0.9.0](/sdk/install#whats-new-090).

**0.10.0 — soporte de cliente para la cadena v3.2.4.** Compositores y lecturas de
niveles de staking (`lockDelegation`, `unlockEarly`, `claimBonus`,
`fetchStakingTierParams`, `fetchStakingLocks`), `fetchAuthNonce` para la siguiente
secuencia de una clave vinculada, `fetchProtocolFeatures` / `isProtocolFeatureEnabled`
para las reglas de consenso que una red aplica por nombre, `possessionProven` en el
estado PQC e `ibcTimeoutTimestamp`. `ensurePqcRegistered` ahora compara la clave
registrada en lugar de confiar en un estado sin una, y un rechazo de la cadena que llega como
texto durante la simulación de comisiones se nombra en todos los lenguajes. Consulta
[Qué añade la 0.10.0](/sdk/install#whats-new-0100).

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
