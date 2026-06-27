---
slug: /sdk/install
title: Instalación
sidebar_label: Instalación
sidebar_position: 2
---

# Instalación

Instala el SDK para tu lenguaje. El núcleo de TypeScript (`@qorechain/sdk`), los
adaptadores de EVM y SVM (`@qorechain/evm`, `@qorechain/svm`), el kit de React
(`@qorechain/react`) y los clientes de Python, Go, Rust y Java están todos
**publicados** en sus registros con plena paridad con la cadena nativa (mensajes tipados,
consultas, el ciclo de vida de las transacciones, transacciones híbridas PQC y suscripciones
por WebSocket). Elige tu lenguaje a continuación.

## TypeScript

El paquete principal:

```bash
npm i @qorechain/sdk
```

Apunta a Node.js 20+ y se distribuye con ESM, CommonJS y definiciones de tipos.

### Adaptador de EVM

`@qorechain/evm` es un adaptador ligero y con tipado seguro sobre [viem](https://viem.sh).
viem es una **dependencia entre pares** — instálalo junto a él:

```bash
npm i @qorechain/evm viem
```

Publicado en npm en `0.5.0`.

### Adaptador de SVM

`@qorechain/svm` es un adaptador ligero sobre
[`@solana/web3.js`](https://solana.com/docs/clients/javascript), que es una
**dependencia entre pares**:

```bash
npm i @qorechain/svm @solana/web3.js
```

Publicado en npm en `0.5.0`.

### Kit de React

`@qorechain/react` es la capa oficial de React sobre `@qorechain/sdk` — un
proveedor, hooks y los componentes `ConnectButton` / `QuantumSafeBadge`.
`react` (>=18) es una dependencia entre pares:

```bash
npm i @qorechain/react
```

Publicado en npm en `0.5.0`. Consulta la [guía del kit de React](/sdk/guides/react).

## Python

```bash
pip install qorechain-sdk
```

Requiere Python 3.10+. El paquete incluye sugerencias de tipos y un marcador `py.typed`.

> La distribución se instala como `qorechain-sdk` (publicado en PyPI en `0.5.0`)
> pero **se importa como `qorsdk`**:
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

Publicado como un módulo de Go autónomo en `packages/go/v0.5.0`.

## Rust

```bash
cargo add qorechain-sdk
```

O en `Cargo.toml`:

```toml
[dependencies]
qorechain-sdk = "0.5"
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

Requiere Rust 1.74+. Los clientes de lectura son asíncronos (Tokio).

> Publicado en crates.io como `qorechain-sdk` en `0.5.0`.

## Java

Maven (`pom.xml`):

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.5.0</version>
</dependency>
```

O Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.5.0'
```

> Publicado en Maven Central como `io.github.qorechain:qorechain-sdk:0.5.0`.

## Siguiente

Continúa con el [Inicio rápido](/sdk/quickstart) para conectarte y leer el estado en cadena.
