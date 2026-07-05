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
subscriptions). The current release is **0.7.0**, which adds unified eth-native
accounts, the consensus-critical hybrid-extension encoding fix, and the
authenticator lanes (see the [Authenticators guide](/sdk/guides/authenticators)).
Pick your language below.

:::caution Upgrade from 0.6.0 or earlier
SDK **0.6.1** fixed a consensus-critical bug: the
`/qorechain.pqc.v1.PQCHybridSignature` tx-body extension was JSON-serialized
into `Any.value` and **rejected by the chain at CheckTx**. Hybrid (PQC +
classical) transactions built with SDK ≤ 0.6.0 are rejected on-chain — upgrade
to 0.6.1 or later in every language you use.
:::

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

Published to npm at `0.7.0`.

### SVM adapter

`@qorechain/svm` is a thin adapter over
[`@solana/web3.js`](https://solana.com/docs/clients/javascript), which is a
**peer dependency**:

```bash
npm i @qorechain/svm @solana/web3.js
```

Published to npm at `0.7.0`.

### React kit

`@qorechain/react` is the official React layer over `@qorechain/sdk` — a
provider, hooks, and the `ConnectButton` / `QuantumSafeBadge` components.
`react` (>=18) is a peer dependency:

```bash
npm i @qorechain/react
```

Published to npm at `0.7.0`. See the [React kit guide](/sdk/guides/react).

### Scaffolder

`create-qorechain-dapp` (npm, `0.7.0`) scaffolds a ready-to-run dApp:

```bash
npm create qorechain-dapp@latest my-dapp
```

## Python

```bash
pip install qorechain-sdk
```

Requires Python 3.10+. The package ships type hints and a `py.typed` marker.

> The distribution installs as `qorechain-sdk` (published to PyPI at `0.7.0`)
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

Published as a self-contained Go module (tagged `packages/go/v0.7.0`).

## Rust

```bash
cargo add qorechain-sdk
```

Or, to track the `0.7.0` sources directly from the repository:

```toml
[dependencies]
qorechain-sdk = { git = "https://github.com/qorechain/qorechain-sdk" }
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

Requires Rust 1.74+. The read clients are async (Tokio). The crate imports as
`qorechain` (`use qorechain;`).

> Published to crates.io as `qorechain-sdk`. `cargo add qorechain-sdk` installs
> the **latest published crate**, which currently lags the `0.7.0` release —
> install from crates.io (latest published) or from the repo for the newest
> surface.

## Java

Maven (`pom.xml`):

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.7.0</version>
</dependency>
```

Or Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.7.0'
```

> Published to Maven Central as `io.github.qorechain:qorechain-sdk:0.7.0`.

## Next

Continue to the [Quickstart](/sdk/quickstart) to connect and read on-chain state.
