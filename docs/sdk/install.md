---
slug: /sdk/install
title: Install
sidebar_label: Install
sidebar_position: 2
---

# Install

Install the SDK for your language. The TypeScript core (`@qorechain/sdk`), the
EVM and SVM adapters (`@qorechain/evm`, `@qorechain/svm`), the React kit
(`@qorechain/react`), and the Python, Go, Rust, and Java clients are all
**published** to their registries with full native-chain parity (typed messages,
queries, the tx lifecycle, hybrid PQC transactions, and WebSocket
subscriptions). Pick your language below.

## TypeScript

The core package:

```bash
npm i @qorechain/sdk
```

It targets Node.js 20+ and ships ESM, CommonJS, and type definitions.

### EVM adapter

`@qorechain/evm` is a thin, type-safe adapter over [viem](https://viem.sh).
viem is a **peer dependency** — install it alongside:

```bash
npm i @qorechain/evm viem
```

Published to npm at `0.5.0`.

### SVM adapter

`@qorechain/svm` is a thin adapter over
[`@solana/web3.js`](https://solana.com/docs/clients/javascript), which is a
**peer dependency**:

```bash
npm i @qorechain/svm @solana/web3.js
```

Published to npm at `0.5.0`.

### React kit

`@qorechain/react` is the official React layer over `@qorechain/sdk` — a
provider, hooks, and the `ConnectButton` / `QuantumSafeBadge` components.
`react` (>=18) is a peer dependency:

```bash
npm i @qorechain/react
```

Published to npm at `0.5.0`. See the [React kit guide](/sdk/guides/react).

## Python

```bash
pip install qorechain-sdk
```

Requires Python 3.10+. The package ships type hints and a `py.typed` marker.

> The distribution installs as `qorechain-sdk` (published to PyPI at `0.5.0`)
> but **imports as `qorsdk`**:
>
> ```python
> import qorsdk
> ```

## Go

```bash
go get github.com/qorechain/qorechain-sdk/packages/go/...
```

Requires Go 1.23+. Import the sub-packages you need, for example:

```go
import (
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/client"
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/accounts"
)
```

Published as a self-contained Go module at `packages/go/v0.5.0`.

## Rust

```bash
cargo add qorechain-sdk
```

Or in `Cargo.toml`:

```toml
[dependencies]
qorechain-sdk = "0.5"
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

Requires Rust 1.74+. The read clients are async (Tokio).

> Published to crates.io as `qorechain-sdk` at `0.5.0`.

## Java

Maven (`pom.xml`):

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.5.0</version>
</dependency>
```

Or Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.5.0'
```

> Published to Maven Central as `io.github.qorechain:qorechain-sdk:0.5.0`.

## Next

Continue to the [Quickstart](/sdk/quickstart) to connect and read on-chain state.
