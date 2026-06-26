---
slug: /sdk/install
title: Install
sidebar_label: Install
sidebar_position: 2
---

# Install

Install the SDK for your language. The TypeScript core (`@qorechain/sdk`) is
published to npm. The Python, Go, and Rust clients now exist in the
[monorepo](https://github.com/qorechain/qorechain-sdk) at the same unified
`0.3.0` release with full native-chain parity (typed messages, queries, the tx
lifecycle, hybrid PQC transactions, and WebSocket subscriptions), but they are
not yet published to PyPI, crates.io, or the Go module proxies — build them from
`packages/` for now. The EVM/SVM adapters are likewise publish-pending. The
registry commands below show how each package will install once published.

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

> Publish-pending. Until published, build `packages/evm` from the monorepo.

### SVM adapter

`@qorechain/svm` is a thin adapter over
[`@solana/web3.js`](https://solana.com/docs/clients/javascript), which is a
**peer dependency**:

```bash
npm i @qorechain/svm @solana/web3.js
```

> Publish-pending. Until published, build `packages/svm` from the monorepo.

## Python

```bash
pip install qorechain
```

Requires Python 3.10+. The package ships type hints and a `py.typed` marker.

> Available in the repo at `packages/py` (v0.3.0); publishing to PyPI is in
> progress. Until then, install from a local checkout (`pip install ./packages/py`).

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

> Available in the repo at `packages/go` (v0.3.0) as a self-contained Go module;
> the `go get` path becomes resolvable once a tagged release is pushed. Until
> then, consume it via a local `replace` directive or a checkout.

## Rust

```bash
cargo add qorechain
```

Or in `Cargo.toml`:

```toml
[dependencies]
qorechain = "0.3"
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

Requires Rust 1.74+. The read clients are async (Tokio).

> Available in the repo at `packages/rust` (v0.3.0); publishing to crates.io is
> in progress. Until then, depend on it by path or git:
> `qorechain = { path = "packages/rust" }`.

## Next

Continue to the [Quickstart](/sdk/quickstart) to connect and read on-chain state.
