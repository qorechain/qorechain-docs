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
transacciones PQC híbridas y suscripciones WebSocket). La versión actual es
**0.7.0**, que añade cuentas unificadas eth-nativas, la corrección crítica para
el consenso en la codificación de la extensión híbrida y los carriles de
autenticadores (consulta la [guía de Authenticators](/sdk/guides/authenticators)).
Elige tu lenguaje a continuación.

:::caution Actualización desde 0.6.0 o anterior
El SDK **0.6.1** corrigió un error crítico para el consenso: la extensión del
cuerpo de la transacción `/qorechain.pqc.v1.PQCHybridSignature` se serializaba
en JSON dentro de `Any.value` y era **rechazada por la cadena en CheckTx**. Las
transacciones híbridas (PQC + clásica) construidas con SDK ≤ 0.6.0 son
rechazadas en la cadena — actualiza a 0.6.1 o posterior en todos los lenguajes
que uses.
:::

## TypeScript

El paquete principal:

```bash
npm i @qorechain/sdk
```

Está dirigido a Node.js 20+ y se distribuye con ESM, CommonJS y definiciones de
tipos.

### Adaptador EVM

`@qorechain/evm` es un adaptador ligero y con tipado seguro sobre
[viem](https://viem.sh). viem es una **peer dependency** — instálalo junto al
paquete:

```bash
npm i @qorechain/evm viem
```

Publicado en npm en la versión `0.7.0`.

### Adaptador SVM

`@qorechain/svm` es un adaptador ligero sobre
[`@solana/web3.js`](https://solana.com/docs/clients/javascript), que es una
**peer dependency**:

```bash
npm i @qorechain/svm @solana/web3.js
```

Publicado en npm en la versión `0.7.0`.

### Kit de React

`@qorechain/react` es la capa oficial de React sobre `@qorechain/sdk` — un
provider, hooks y los componentes `ConnectButton` / `QuantumSafeBadge`.
`react` (>=18) es una peer dependency:

```bash
npm i @qorechain/react
```

Publicado en npm en la versión `0.7.0`. Consulta la
[guía del kit de React](/sdk/guides/react).

### Generador de proyectos

`create-qorechain-dapp` (npm, `0.7.0`) genera una dApp lista para ejecutar:

```bash
npm create qorechain-dapp@latest my-dapp
```

## Python

```bash
pip install qorechain-sdk
```

Requiere Python 3.10+. El paquete incluye type hints y un marcador `py.typed`.

> La distribución se instala como `qorechain-sdk` (publicada en PyPI en la
> versión `0.7.0`) pero **se importa como `qorsdk`**:
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

Publicado como un módulo Go autocontenido (etiquetado `packages/go/v0.7.0`).

## Rust

```bash
cargo add qorechain-sdk
```

O, para seguir las fuentes de `0.7.0` directamente desde el repositorio:

```toml
[dependencies]
qorechain-sdk = { git = "https://github.com/qorechain/qorechain-sdk" }
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

Requiere Rust 1.74+. Los clientes de lectura son asíncronos (Tokio). El crate
se importa como `qorechain` (`use qorechain;`).

> Publicado en crates.io como `qorechain-sdk`. `cargo add qorechain-sdk`
> instala el **último crate publicado**, que actualmente va por detrás de la
> versión `0.7.0` — instala desde crates.io (último publicado) o desde el
> repositorio para obtener la superficie más reciente.

## Java

Maven (`pom.xml`):

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.7.0</version>
</dependency>
```

O Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.7.0'
```

> Publicado en Maven Central como `io.github.qorechain:qorechain-sdk:0.7.0`.

## Siguiente paso

Continúa con el [Inicio rápido](/sdk/quickstart) para conectarte y leer el
estado en la cadena.
