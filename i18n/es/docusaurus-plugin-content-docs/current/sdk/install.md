---
slug: /sdk/install
title: Instalación
sidebar_label: Instalación
sidebar_position: 2
---

# Instalación

Instala el SDK para tu lenguaje. El núcleo TypeScript (`@qorechain/sdk`), los
adaptadores EVM y SVM (`@qorechain/evm`, `@qorechain/svm`), el kit de React
(`@qorechain/react`) y los clientes de Python, Go, Rust y Java están todos
**publicados** en sus registros con paridad completa con la cadena nativa
(mensajes tipados, consultas, el ciclo de vida de las transacciones,
transacciones PQC híbridas y suscripciones WebSocket). La línea de versiones
actual es la **0.8**: TypeScript, Python, Rust y Java están en la **0.8.3**, y el
módulo de Go está en la **v0.8.4**. Elige tu lenguaje a continuación.

## Notas de actualización {#upgrade}

:::danger Usa el SDK 0.8.1 o posterior en las redes en producción
Ambas redes públicas verifican la forma de **sign-bytes híbridos v2** (con etiqueta
de dominio y vinculada al chain id) y rechazan la forma antigua con el código `pqc` 21.
Todas las versiones del SDK anteriores a la **0.8.0** firman la forma antigua, y la **0.8.0**
busca el cambio bajo uno solo de los dos nombres de actualización que usaron las redes
(mainnet lo registró como `v3.2.0`, la testnet como `v3.1.98` y más tarde `v3.2.0`), por lo
que firma la forma equivocada en mainnet. Usa la **0.8.1 o posterior** en todos los
lenguajes; se necesita la **0.8.2 o posterior** para abrir una
[ventana de autorización EVM](/sdk/guides/evm#evm-window). Los constructores
híbridos aceptan una opción `signBytesVersion` (`"auto"` | `"v1"` | `"v2"`); `"auto"`
consulta a la red y por tanto necesita el endpoint REST (`rest`) en
`qorechain-vladi` / `qorechain-diana`: lanza un error en lugar de adivinar. Consulta
[¿Qué forma de sign-bytes?](/sdk/concepts/accounts-pqc#sign-bytes-versions).
:::

:::caution Correcciones anteriores
El SDK **0.6.1** corrigió un error crítico para el consenso: la extensión del
cuerpo de la transacción `/qorechain.pqc.v1.PQCHybridSignature` se serializaba
en JSON dentro de `Any.value` y era **rechazada por la cadena en CheckTx**. Las
transacciones híbridas (PQC + clásica) construidas con SDK ≤ 0.6.0 son
rechazadas en la cadena. La **0.8.0** eliminó las utilidades de cuenta basadas en firmas de wallet (consulta
[Cuentas y firma PQC](/sdk/concepts/accounts-pqc#phantom)).
:::

## TypeScript

El paquete principal:

```bash
npm i @qorechain/sdk
```

Está dirigido a Node.js 20+ y se distribuye con ESM, CommonJS y definiciones de
tipos. Los ejemplos de transacciones híbridas de esta documentación también importan
`StargateClient` de `@cosmjs/stargate` (`npm i @cosmjs/stargate`).

### Adaptador EVM

`@qorechain/evm` es un adaptador ligero y con tipado seguro sobre
[viem](https://viem.sh). viem es una **peer dependency** — instálalo junto al
paquete:

```bash
npm i @qorechain/evm viem
```

Publicado en npm en la versión `0.8.0`.

### Adaptador SVM

`@qorechain/svm` es un adaptador ligero sobre
[`@solana/web3.js`](https://solana.com/docs/clients/javascript), que es una
**peer dependency**:

```bash
npm i @qorechain/svm @solana/web3.js
```

Publicado en npm en la versión `0.8.0`.

### Kit de React

`@qorechain/react` es la capa oficial de React sobre `@qorechain/sdk` — un
provider, hooks y los componentes `ConnectButton` / `QuantumSafeBadge`.
`react` (>=18) es una peer dependency:

```bash
npm i @qorechain/react
```

Publicado en npm en la versión `0.8.3`. Consulta la
[guía del kit de React](/sdk/guides/react).

### Generador de proyectos

`create-qorechain-dapp` (npm, `0.8.0`) genera una dApp lista para ejecutar:

```bash
npm create qorechain-dapp@latest my-dapp
```

Los archivos `package.json` generados fijan `@qorechain/sdk` / `@qorechain/evm` en
`^0.3.0`, que npm resuelve a una versión 0.3 que no puede firmar para las redes en
producción. Tras generar el proyecto, ejecuta `npm i @qorechain/sdk@latest` (y
`npm i @qorechain/evm@latest` para la plantilla EVM). Consulta la
[referencia de la CLI](/sdk/reference/cli).

## Python

```bash
pip install qorechain-sdk
```

Requiere Python 3.10+. El paquete incluye type hints y un marcador `py.typed`.

> La distribución se instala como `qorechain-sdk` (publicada en PyPI en la
> versión `0.8.3`) pero **se importa como `qorsdk`**:
>
> ```python
> import qorsdk
> ```

## Go

```bash
go get github.com/qorechain/qorechain-sdk/packages/go/...
```

Requiere Go 1.23+. Importa los subpaquetes que necesites, por ejemplo:

```go
import (
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/client"
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/accounts"
)
```

Publicado como un módulo Go autocontenido (etiquetado `packages/go/v0.8.4`).

## Rust

```bash
cargo add qorechain-sdk
```

O, para seguir la cabecera del repositorio:

```toml
[dependencies]
qorechain-sdk = { git = "https://github.com/qorechain/qorechain-sdk" }
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

Requiere Rust 1.74+. Los clientes de lectura son asíncronos (Tokio). El crate
se importa como `qorechain` (`use qorechain;`).

> Publicado en crates.io como `qorechain-sdk` (0.8.3); `cargo add qorechain-sdk`
> instala la última versión.

## Java

Maven (`pom.xml`):

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.8.3</version>
</dependency>
```

O Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.8.3'
```

> Publicado en Maven Central como `io.github.qorechain:qorechain-sdk:0.8.3`. Central
> no tiene una compilación 0.8.0 ni 0.8.1, así que en las redes en producción usa la 0.8.2 o posterior.

## Paquetes relacionados {#related-packages}

| Paquete | Finalidad | Versión |
| --- | --- | --- |
| `@qorechain/wallet-adapter` | Utilidades del lado de la wallet: generación de wallets (`generateQoreWallet`), firma híbrida `eth_secp256k1` (`signHybridEth`, `QoreChainSigner`), registro de la red en MetaMask (`addQoreEvmToWallet`), constructores de mensajes de autenticadores y de ventanas EVM. Peer dependencies: `@cosmjs/proto-signing` y `@cosmjs/stargate` `^0.32` | 0.3.0 |
| `@qorechain/chain-bridge` | Worker del lado del servidor para backends: deriva la clave PQC, firma de forma híbrida y difunde (`sendTokens`, `registerPqc` y más). Pasa `cosmosRest` | 0.2.2 |
| `@qorechain/pqc` | Primitivas ML-DSA / ML-KEM / SHAKE-256 que siguen solo los estándares y `hybridSignBytes` (consulta [Firma poscuántica](/developer-guide/post-quantum-signing)) | 0.2.1 |
| `@qorechain/handles` | Resolución verificada de `@handle` con fijado trust-on-first-use (`HandleClient`) | 0.1.0 |
| `@qorechain/rdk` | Cliente del Rollup Development Kit (consulta [Rollups](/rollups/why)). La versión de npm (0.4.4) firma las transacciones solo de forma clásica, lo que las redes rechazan, así que puede leer pero no enviar; la firma híbrida está en la 0.5.0, actualmente solo en PyPI y en el módulo de Go | 0.4.4 (npm) |

## Siguiente paso

Continúa con el [Inicio rápido](/sdk/quickstart) para conectarte y leer el
estado en la cadena.
