---
slug: /build-before-qday/workshop-1/kits
title: Los kits de QoreChain
sidebar_label: Kits
sidebar_position: 10
---

# Los kits de QoreChain

El stack de desarrollo de QoreChain son catorce kits. Esta página enumera cada uno en una línea, con su versión y dónde se publica, y termina con seis ideas que podrías construir a partir de ellos. Doce kits están disponibles. Dos no se han lanzado: el Asset kit es una propuesta y el light client PQ es una especificación.

## Innovaciones {#innovations}

- **La firma híbrida ML-DSA-87 + secp256k1 está integrada en el SDK, en las wallets y en QoreSign**, así que una aplicación no tiene que implementar por sí misma la firma poscuántica.
- **Una transacción firmada de forma híbrida y verificada en la cadena** es la prueba compartida entre las aplicaciones: consulta el [Q-Day Counter](/build-before-qday/workshop-1/apps/qday-counter), el [Q-Day Guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) y el [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector).
- **La misma estructura en muchos lenguajes.** El SDK, QoreSign y la librería PQC se publican en varios lenguajes y se comprueban con vectores de prueba compartidos.

## Construye aplicaciones {#build-apps}

| Kit | Qué hace | Versión y registro |
| --- | --- | --- |
| [SDK de QoreChain](/sdk/overview) | Un único cliente para los carriles nativo, EVM y SVM con firma híbrida, registro de claves PQC, auxiliares de la ventana EVM, niveles de staking, tokenomics, AMM, llamadas cross-VM y rollups. TypeScript, Python, Rust, Java y Go. | 0.13.0: npm, PyPI, crates.io, Maven Central, Go |
| [create-qorechain-dapp](/developer-tools/scaffolders-and-cli) | Genera un proyecto funcional con un solo comando a partir de siete plantillas: hardhat, foundry, viem-wagmi, fullstack-web, evm-solidity, cosmwasm y rollup-app. | 0.13.1: npm |
| [RDK, el Rollup Development Kit](/rollups/overview) | Crea, lanza y opera rollups específicos de aplicación que se liquidan en QoreChain, con lotes de liquidación firmados, retiradas y lecturas de disponibilidad de datos. | `@qorechain/rdk` 0.8.0, cinco lenguajes |

```sh
npm i @qorechain/sdk @qorechain/evm
npx create-qorechain-dapp my-app -t hardhat --network testnet
```

## Wallets y firma {#wallets-signing}

| Kit | Qué hace | Versión y registro |
| --- | --- | --- |
| [QoreX y qorex-integrations](/developer-tools/qorex-integrations) | La wallet oficial guarda las dos claves, firma de forma híbrida y muestra lo que firmas. Las integraciones añaden QoreX a RainbowKit y wagmi, cosmos-kit e Interchain Kit, con tipos, una wallet simulada y fixtures de Playwright. Consulta también la [visión general de QoreX](/qorex/overview). | QoreX 1.2.3 (iOS, Android), extensión 0.4.2 (Chrome, Firefox), `@qorechain/qorex-rainbowkit` 0.1.0 |
| [Wallet Adapter](/developer-tools/wallet-adapter) | Añade QoreChain a las wallets que la gente ya usa (Keplr, Leap, Cosmostation, MetaMask, Phantom), incluida la firma híbrida ML-DSA-87 que exige la cadena. | `@qorechain/wallet-adapter` 0.5.0 |
| [QoreSign](/qoresign/overview) | Firma híbrida para wallets y backends distintos de QoreX: deriva la clave ML-DSA, firma transacciones del carril nativo con las dos claves, verifica firmas híbridas en local, simula antes de firmar e inicia sesión con QoreChain (Sign In With QoreChain). | 0.2.0: TypeScript, Rust, Go, Swift, Kotlin |
| [QoreChain PQC](/developer-tools/pqc-library) | Las primitivas poscuánticas que sostienen al resto: ML-DSA (FIPS 204), ML-KEM (FIPS 203) y SHAKE-256, compatibles byte a byte entre lenguajes y comprobadas con vectores de prueba compartidos. | `@qorechain/pqc` 0.2.3, seis lenguajes |

```sh
npm i @qorechain/qorex-rainbowkit @qorechain/qorex-types
npm i @qorechain/wallet-adapter
npm i @qorechain/qoresign
npm i @qorechain/pqc
```

## Datos y privacidad {#data-privacy}

| Kit | Qué hace | Versión y registro |
| --- | --- | --- |
| [QoreSeal](/developer-tools/qoreseal) | Cifra datos para cuentas de QoreChain con ML-KEM-1024 (híbrido con X25519 por defecto). Una cuenta publica su clave en la cadena y cualquiera puede cifrar para ella. Varios destinatarios, claves de auditor y claves de grupo rotativas. | 0.1.0: TypeScript, Rust, Go, Swift, Kotlin, Python |
| [QoreChain MCP](/developer-tools/mcp) | Un servidor de Model Context Protocol y una herramienta de línea de comandos que da a las herramientas de desarrollo compatibles acceso de lectura a QoreChain: bloques, transacciones, cuentas, validadores, niveles de staking, estado de la firma híbrida, lecturas de contratos y estimaciones de comisiones. Nunca firma, nunca guarda claves y nunca difunde transacciones. | `@qorechain/mcp` 0.1.0 |

```sh
npm i @qorechain/qoreseal
npx -y @qorechain/mcp
```

## Infraestructura y cumplimiento {#infra-compliance}

| Kit | Qué hace | Versión y registro |
| --- | --- | --- |
| [QORel](/qorel/overview) | Un relayer de IBC, una bifurcación de Hermes, con una capa de firmantes enchufable para poder retransmitir cadenas que necesitan una firma poscuántica en cada transacción. Las cadenas estándar conservan el formato exacto de Hermes. | 0.1.0: GitHub, imagen de contenedor, Homebrew |
| [Custody kit](/developer-tools/custody-kit) | Para custodios: qué exige cada carril, validación de direcciones, detección de depósitos, firma y verificación de retiradas, staking y gestión de la clave ML-DSA-87, con vectores de prueba y código de referencia. | 0.1.0: TypeScript, Python, Go, Rust, Java |
| [QoreScan](/developer-tools/qorescan) | Inventaría la criptografía de un despliegue (configuración de nodos, claves por tipo, endpoints TLS, código fuente Solidity, estado de la cadena) y exporta un CBOM CycloneDX 1.6, con salidas alineadas con la Guidance 05/2026 de la FINMA, la hoja de ruta PQC de la UE y DORA. Una ayuda de inventario, no una certificación. | `@qorechain/qorescan` 0.1.0 |
| [Asset kit](/developer-tools/asset-kit) | **Propuesta, no lanzado en su conjunto.** Herramientas para activos tokenizados regulados: adaptadores ERC-3643 y CMTAT con una comprobación poscuántica del titular, vaults ERC-4626 y ERC-7540, una consola para emisores y clientes. Los contratos EVM están disponibles; los módulos de activos nativos son una propuesta. | 0.1.0 |
| [Light client PQ](/developer-tools/pq-light-client) | **Especificación, no lanzado.** Un light client que sigue checkpoints firmados con ML-DSA-87. QoreChain no produce hoy esos checkpoints. El repositorio contiene la especificación y verificadores de referencia (Go, Rust, TypeScript) para que se pueda revisar el diseño. | 0.1.0 (especificación) |

```sh
brew install qorechain/tap/qorel
npx @qorechain/qorescan --help
```

## Seis cosas que podrías construir {#ideas}

| Idea | Construida con | Qué es |
| --- | --- | --- |
| Pago a prueba de cuánticos | SDK, QoreX | Un botón de pagar con QOR para una tienda web donde cada pago se firma de forma híbrida. |
| Kit de inicio para hackatones | create-qorechain-dapp | De cero a un contrato desplegado en la testnet en diez minutos, un comando por estudiante. |
| Sign In With QoreChain | QoreSign | Inicio de sesión sin contraseña para una aplicación web, con la firma híbrida comprobada en tu servidor. |
| Subasta de ofertas selladas | QoreSeal | Las ofertas permanecen cifradas hasta la revelación. |
| Inventario de preparación PQC | QoreScan | Un inventario de criptografía y un archivo CBOM para un equipo fintech y sus auditores. |
| Retransmite tu propio canal | QORel | Retransmite entre la testnet de QoreChain y otra cadena de testnet de Cosmos. |

## Consigue el código {#get-the-code}

Cada kit tiene su propia página en el manual, enlazada arriba. Las aplicaciones de ejemplo de este taller están en el repositorio público [qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), y la página de cada aplicación las recorre desde el primer comando hasta el último:

```sh
git clone https://github.com/qorechain/build-before-qday
```
