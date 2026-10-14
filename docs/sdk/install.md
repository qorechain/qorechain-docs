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
subscriptions). The current release line is **0.8**: TypeScript, Python, Rust and
Java are at **0.8.3**, and the Go module is at **v0.8.4**. Pick your language
below.

## Upgrade notes {#upgrade}

:::danger Use SDK 0.8.1 or later on the live networks
Both public networks verify the **v2 hybrid sign-bytes** form (domain-tagged and
bound to the chain id) and refuse the old form with `pqc` code 21. Every SDK
release before **0.8.0** signs the old form, and **0.8.0** looks for the switch
under only one of the two upgrade names the networks used (mainnet recorded it as
`v3.2.0`, the testnet as `v3.1.98` and later `v3.2.0`), so it signs the wrong form
on mainnet. Use **0.8.1 or later** in every language; **0.8.2 or later** is needed
to open an [EVM authorization window](/sdk/guides/evm#evm-window). Hybrid
builders take a `signBytesVersion` option (`"auto"` | `"v1"` | `"v2"`); `"auto"`
asks the network and therefore needs the REST endpoint (`rest`) on
`qorechain-vladi` / `qorechain-diana`: it throws instead of guessing. See
[Which sign-bytes form?](/sdk/concepts/accounts-pqc#sign-bytes-versions).
:::

:::caution Older fixes
SDK **0.6.1** fixed a consensus-critical bug: the
`/qorechain.pqc.v1.PQCHybridSignature` tx-body extension was JSON-serialized
into `Any.value` and **rejected by the chain at CheckTx**. Hybrid (PQC +
classical) transactions built with SDK ≤ 0.6.0 are rejected on-chain. **0.8.0**
removed the wallet-signature account helpers (see
[Accounts & PQC signing](/sdk/concepts/accounts-pqc#phantom)).
:::

## TypeScript

The core package:

```bash
npm i @qorechain/sdk
```

It targets Node.js 20+ and ships ESM, CommonJS, and type definitions. The
hybrid-transaction samples in these docs also import `StargateClient` from
`@cosmjs/stargate` (`npm i @cosmjs/stargate`).

### EVM adapter

`@qorechain/evm` is a thin, type-safe adapter over [viem](https://viem.sh).
viem is a **peer dependency** — install it alongside:

```bash
npm i @qorechain/evm viem
```

Published to npm at `0.8.0`.

### SVM adapter

`@qorechain/svm` is a thin adapter over
[`@solana/web3.js`](https://solana.com/docs/clients/javascript), which is a
**peer dependency**:

```bash
npm i @qorechain/svm @solana/web3.js
```

Published to npm at `0.8.0`.

### React kit

`@qorechain/react` is the official React layer over `@qorechain/sdk` — a
provider, hooks, and the `ConnectButton` / `QuantumSafeBadge` components.
`react` (>=18) is a peer dependency:

```bash
npm i @qorechain/react
```

Published to npm at `0.8.3`. See the [React kit guide](/sdk/guides/react).

### Scaffolder

`create-qorechain-dapp` (npm, `0.8.0`) scaffolds a ready-to-run dApp:

```bash
npm create qorechain-dapp@latest my-dapp
```

The generated `package.json` files pin `@qorechain/sdk` / `@qorechain/evm` to
`^0.3.0`, which npm resolves to a 0.3 release that cannot sign for the live
networks. After scaffolding, run `npm i @qorechain/sdk@latest` (and
`npm i @qorechain/evm@latest` for the EVM template). See the
[CLI reference](/sdk/reference/cli).

## Python

```bash
pip install qorechain-sdk
```

Requires Python 3.10+. The package ships type hints and a `py.typed` marker.

> The distribution installs as `qorechain-sdk` (published to PyPI at `0.8.3`)
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

Published as a self-contained Go module (tagged `packages/go/v0.8.4`).

## Rust

```bash
cargo add qorechain-sdk
```

Or, to track the repository head:

```toml
[dependencies]
qorechain-sdk = { git = "https://github.com/qorechain/qorechain-sdk" }
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

Requires Rust 1.74+. The read clients are async (Tokio). The crate imports as
`qorechain` (`use qorechain;`).

> Published to crates.io as `qorechain-sdk` (0.8.3); `cargo add qorechain-sdk`
> installs the latest release.

## Java

Maven (`pom.xml`):

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.8.3</version>
</dependency>
```

Or Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.8.3'
```

> Published to Maven Central as `io.github.qorechain:qorechain-sdk:0.8.3`. Central
> has no 0.8.0 or 0.8.1 build, so on the live networks use 0.8.2 or later.

## Related packages {#related-packages}

| Package | Purpose | Version |
| --- | --- | --- |
| `@qorechain/wallet-adapter` | Wallet-side helpers: wallet generation (`generateQoreWallet`), `eth_secp256k1` hybrid signing (`signHybridEth`, `QoreChainSigner`), MetaMask network registration (`addQoreEvmToWallet`), authenticator and EVM-window message builders. Peer dependencies: `@cosmjs/proto-signing` and `@cosmjs/stargate` `^0.32` | 0.3.0 |
| `@qorechain/chain-bridge` | Server-side worker for backends: derives the PQC key, hybrid-signs and broadcasts (`sendTokens`, `registerPqc`, and more). Pass `cosmosRest` | 0.2.2 |
| `@qorechain/pqc` | Standards-only ML-DSA / ML-KEM / SHAKE-256 primitives and `hybridSignBytes` (see [Post-Quantum Signing](/developer-guide/post-quantum-signing)) | 0.2.1 |
| `@qorechain/handles` | Verified `@handle` resolution with trust-on-first-use pinning (`HandleClient`) | 0.1.0 |
| `@qorechain/rdk` | Rollup Development Kit client (see [Rollups](/rollups/why)). The npm release (0.4.4) signs transactions classical-only, which the networks refuse, so it can read but not send; hybrid signing is in 0.5.0, currently on PyPI and the Go module only | 0.4.4 (npm) |

## Next

Continue to the [Quickstart](/sdk/quickstart) to connect and read on-chain state.
