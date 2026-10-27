---
slug: /developer-tools/overview
title: Developer Packages
sidebar_label: Overview
sidebar_position: 1
---

# Developer packages

QoreChain publishes its developer tooling as small packages on the public registries (npm, PyPI, crates.io, the Go module proxy, Maven Central and Swift Package Manager). This page is the index: what each package is for, its exact registry name, language, current version, install command and status, and where to read how to use it. It is for developers who build dApps, wallets, backends and rollups on QoreChain and want to pick the right package before they read a guide.

Versions in the tables were read from the registries on 27 October 2026. Mainnet `qorechain-vladi` runs v3.2.4 and testnet `qorechain-diana` runs v3.2.6. Every package listed as published is licensed Apache-2.0.

## Innovations {#innovations}

- **One hybrid signature format in every language.** The chain requires a secp256k1 signature plus an ML-DSA-87 (FIPS 204) signature on native-lane transactions. QoreSign reproduces its published test vectors byte for byte in TypeScript, Rust, Go, Swift, Kotlin and Python, and `qorechain-pqc` runs one shared set of vectors in its six bindings, so a key or signature made in one language verifies in the others.
- **Sign-bytes form chosen from chain state, not guessed.** The SDK, the wallet adapter, `chain-bridge` and the QoreSign network helpers ask the node `GET /cosmos/upgrade/v1beta1/applied_plan/{name}` for both upgrade names (`v3.2.0` and `v3.1.98`) and sign the v2 form when either height is above zero. Without a REST endpoint on these two chains they throw instead of guessing. Both networks verify v2 today (checked 27 October 2026: `v3.2.0` applied on mainnet at height 2,981,742 and `v3.1.98` on testnet at height 5,746,000).
- **Quickstarts that were run, not only written.** For the packages that have one, the example was run on 27 October 2026 after installing from the public registry. 31 of 34 quickstart entries ran and passed; the manifest records which three did not (see [Limits](#limits)).
- **One manifest behind the tables.** The package names, versions and install commands on this page come from a single machine-readable manifest with a live version endpoint per package, the same data the SDK hub on the [dashboard Developers page](/dashboard/developers#sdks) is built from.

## How to use {#how-to-use}

Pick by what you are building.

| You want to | Use | Read |
|---|---|---|
| Read chain state, derive accounts, send hybrid-signed transactions from a script or dApp | QoreChain SDK | [SDK overview](/sdk/overview), [Install](/sdk/install), [Quickstart](/sdk/quickstart) |
| Sign in your own wallet or backend, verify signatures, Sign In With QoreChain | QoreSign | [QoreSign overview](/qoresign/overview), [Quickstart](/qoresign/quickstart) |
| Add QoreChain to Keplr, Leap or Cosmostation, generate unified wallets, build EVM window and linked-key messages | Wallet adapter | [Wallet adapter](/developer-tools/wallet-adapter) |
| Run a server job that sends QOR, registers keys or deploys contracts | Chain bridge (or the SDK) | [Chain bridge and handles](/developer-tools/chain-bridge) |
| Resolve an `@handle` to a verified address | Handles | [Chain bridge and handles](/developer-tools/chain-bridge#handles) |
| Let your dApp use the QoreX wallet, or test it without an extension | QoreX integrations | [QoreX integrations](/developer-tools/qorex-integrations), [QoreX, for developers](/qorex/overview#developers) |
| Create and operate an application rollup | RDK | [Rollups overview](/rollups/overview), [Deploying a rollup](/rollups/deploying-a-rollup) |
| Use the post-quantum primitives alone (ML-DSA, ML-KEM, SHAKE-256) | `qorechain-pqc` | [Post-Quantum Signing](/developer-guide/post-quantum-signing) |
| Let an AI agent or developer tool read the chain (blocks, transactions, accounts, hybrid signature status, simulation, unsigned transfers) | QoreChain MCP server | [QoreChain MCP server](/developer-tools/mcp) |
| Read the chain from a terminal or a shell script, with JSON output | `qore` CLI | [QoreChain CLI](/developer-tools/qore-cli) |
| Read back how a committed transaction was protected (messages, signer, fee, ML-DSA-87 layer, tier) | QoreSign transaction inspector (`inspectTransaction`) | [QoreSign overview](/qoresign/overview#inspector) |
| Encrypt data to QoreChain accounts, private groups or sidechains with ML-KEM-1024 | QoreSeal | [QoreSeal](/developer-tools/qoreseal) |
| Review or test a post-quantum light client design (checkpoint verification) | PQ light client | [PQ light client](/developer-tools/pq-light-client) |
| Integrate QoreChain as a custodian or exchange (address checks, withdrawal verification, deposit crediting) | Custody kit | [Custody kit](/developer-tools/custody-kit) |
| Inventory the cryptography of a node, a network or Solidity sources as a CycloneDX CBOM | QoreScan | [QoreScan](/developer-tools/qorescan) |
| Build and test Solidity or CosmWasm projects on QoreChain with Foundry, Hardhat or viem | Chain developer kit (SDK 0.11.0, coming) | [Chain developer kit](/developer-tools/chain-dev-sdk) |

Install one package and run its quickstart against the public testnet first. Reads need no account, no key and no fee.

## How to access {#how-to-access}

| | Testnet | Mainnet |
|---|---|---|
| Chain ID | `qorechain-diana` | `qorechain-vladi` |
| EVM chain ID | 9800 | 9801 |
| REST | `https://api-testnet.qore.host` | `https://api.qore.host` |
| Consensus RPC | `https://rpc-testnet.qore.host` | `https://rpc.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` | `https://evm.qore.host` |
| SVM JSON-RPC | `https://svm-testnet.qore.host` | `https://svm.qore.host` |

- **Account and keys:** none for reads. To send, you need an account with QOR (testnet QOR comes from the [Faucet](/dashboard/faucet)) and, on the native lane, an ML-DSA-87 key registered for it.
- **Cost:** the packages are free. Transactions pay the network fee; the fee floor is 0.1 uqor per gas.
- **Signature rules:** a native-lane transaction must carry a hybrid (secp256k1 plus ML-DSA-87) signature. An EVM transaction is accepted only from an account with a registered ML-DSA-87 key and an open EVM authorization window. SVM reads work and SVM transactions are not open yet. See [Accounts and PQC signing](/sdk/concepts/accounts-pqc).
- **Quickstart conventions:** the examples read the public testnet faucet account and sign with the public test phrase (`abandon` eleven times, then `about`). Never fund an account derived from that phrase. No quickstart sends a transaction.

### The dashboard developer page {#dashboard-developers}

The dashboard has a public page at [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers). Checked on 27 October 2026 it has six tabs (full walkthrough: [Developers](/dashboard/developers)):

- **SDKs:** the SDK hub. Every package in the manifest, grouped by product, with a language selector, the latest version read live from each registry, install and import lines with copy buttons, the quickstart with the output the SDK team observed, known issues, and the chain ids and public endpoints. Packages that are not published show no install command.
- **PQ key status:** reads the ML-DSA-87 key an address has registered on chain and its EVM authorization window, on testnet or mainnet.
- **Simulator:** dry-runs a signed transaction (base64 or hex `TxRaw`) and shows gas use and balance changes. Nothing is broadcast.
- **Signing playground:** testnet only. Generates a throwaway hybrid key in the browser, kept in memory, to sign and verify messages and Sign In With QoreChain requests.
- **QoreX test wallet:** testnet only. Injects a test wallet (`window.qorex`, announced over EIP-6963 as "QoreX (mock)") into the tab so you can try dApp flows.
- **AI agents (MCP):** the status of the QoreChain MCP server (published) and the setup for an MCP client: local `npx` first, plus a hosted testnet endpoint that needs an API key. See [QoreChain MCP server](/developer-tools/mcp).

A **Transaction inspector** tab (paste a hash, see every message, the signer, the fee and whether the post-quantum signature verifies) is not on the dashboard page yet; on 27 October 2026 the page still showed the six tabs above. The same check is available now as a library function, `inspectTransaction`, in QoreSign 0.1.1 (TypeScript): see [Transaction inspector](/qoresign/overview#inspector). The tables below and the SDK hub show the same package data; the tables were checked against the registries on 27 October 2026.

## Where it is published {#where-published}

Each name is the exact registry name. The link on the package opens its registry page. "Published" means the version shown is installable today.

### QoreChain SDK {#group-sdk}

Guides: [SDK overview](/sdk/overview), [Install](/sdk/install), [React guide](/sdk/guides/react), [CLI reference](/sdk/reference/cli). Source: [qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk).

| Package | Language | Version | Install | Status |
|---|---|---|---|---|
| [`@qorechain/sdk`](https://www.npmjs.com/package/@qorechain/sdk) | TypeScript | 0.10.0 | `npm install @qorechain/sdk` | Published |
| [`@qorechain/react`](https://www.npmjs.com/package/@qorechain/react) | TypeScript (React) | 0.10.0 | `npm install @qorechain/react @qorechain/sdk react react-dom` | Published. Provider, hooks, `ConnectButton` and the PQC status badge (exported as `QuantumSafeBadge` in 0.10.0) |
| [`@qorechain/evm`](https://www.npmjs.com/package/@qorechain/evm) | TypeScript | 0.8.0 | `npm install @qorechain/evm viem` | Published |
| [`@qorechain/svm`](https://www.npmjs.com/package/@qorechain/svm) | TypeScript | 0.8.0 | `npm install @qorechain/svm @solana/web3.js` | Published. Reads only on the live networks |
| [`create-qorechain-dapp`](https://www.npmjs.com/package/create-qorechain-dapp) | TypeScript (CLI) | 0.10.0 | `npx create-qorechain-dapp my-dapp` | Published |
| [`qorechain-sdk`](https://pypi.org/project/qorechain-sdk/) | Python | 0.10.0 | `pip install qorechain-sdk` | Published |
| [`qorechain-sdk`](https://crates.io/crates/qorechain-sdk) | Rust | 0.10.0 | `cargo add qorechain-sdk tokio --features tokio/macros,tokio/rt-multi-thread` | Published |
| [`github.com/qorechain/qorechain-sdk/packages/go`](https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go) | Go | v0.10.0 | `go get github.com/qorechain/qorechain-sdk/packages/go@latest` | Published |
| [`io.github.qorechain:qorechain-sdk`](https://central.sonatype.com/artifact/io.github.qorechain/qorechain-sdk) | Java | 0.10.0 | `implementation("io.github.qorechain:qorechain-sdk:0.10.0")` | Published |

### QoreSign {#group-qoresign}

Guides: [QoreSign overview](/qoresign/overview), [Quickstart](/qoresign/quickstart), [Test vectors](/qoresign/vectors). Source: [qorechain/qoresign](https://github.com/qorechain/qoresign). Version 0.1.1 was published on 27 October 2026. QoreSign signs locally; it holds no keys for you and does no threshold, MPC or hardware-wallet signing.

| Package | Language | Version | Install | Status |
|---|---|---|---|---|
| [`@qorechain/qoresign`](https://www.npmjs.com/package/@qorechain/qoresign) | TypeScript | 0.1.1 | `npm install @qorechain/qoresign` | Published. Includes `inspectTransaction` and `fetchEvmWindow` (new in 0.1.1) |
| [`qorechain-qoresign`](https://crates.io/crates/qorechain-qoresign) | Rust (imports as `qoresign`) | 0.1.1 | `cargo add qorechain-qoresign` | Published |
| [`github.com/qorechain/qoresign/go`](https://pkg.go.dev/github.com/qorechain/qoresign/go) | Go | v0.1.1 | `go get github.com/qorechain/qoresign/go@v0.1.1` | Published |
| [`qorechain-qoresign`](https://pypi.org/project/qorechain-qoresign/) | Python 3.9+ (imports as `qoresign`) | 0.1.1 | `pip install qorechain-qoresign` | Published, new in 0.1.1. Wheels for macOS (arm64, x86_64) and Linux (x86_64, aarch64); no Windows wheel yet. Offline functions only |
| `QoreSign` (Swift package) | Swift (iOS 16+, macOS 13+) | 0.1.1 | `.package(url: "https://github.com/qorechain/qoresign", from: "0.1.1")`, product `QoreSign` | Published as a GitHub release; the binary framework downloads from it |
| [`io.github.qorechain:qoresign`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) | Kotlin / JVM (JVM 17+, Kotlin 2.3+) | 0.1.1 | `implementation("io.github.qorechain:qoresign:0.1.1")` | Published |
| [`io.github.qorechain:qoresign-android`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign-android) | Kotlin (Android API 24+, Kotlin 2.3+) | 0.1.1 | `implementation("io.github.qorechain:qoresign-android:0.1.1")` | Published. Same API as the JVM artifact; its example was run on the JVM artifact only, not on an Android device |

The Kotlin and Android artifacts need the Kotlin 2.3 or later compiler in your project; a project on Kotlin 2.1 fails to compile against them.

The TypeScript package has a `@qorechain/qoresign/network` subpath, and the Go module has the same helpers except `inspectTransaction` and `fetchEvmWindow`: `fetchPqKeyStatus`, `resolveSignBytesVersion`, `simulateTx` (with balance changes), `suggestGasLimit`, `broadcastTx`, `submitWithSignBytesFallback` (one fallback, then it stops), `verifySiwqWithChain` and `verifyMessageWithChain`. The Rust, Swift, Kotlin and Python packages have no network code.

### QoreSeal {#group-qoreseal}

Page: [QoreSeal](/developer-tools/qoreseal). Source: [qorechain/qoreseal](https://github.com/qorechain/qoreseal). QoreSeal 0.1.0 encrypts data to QoreChain accounts, private groups and sidechains with ML-KEM-1024 (FIPS 203). The encryption works offline; reading a recipient's key from the chain needs the KEM key registry, which is live on the testnet and comes to mainnet after the v3.2.5 upgrade. The construction is pending an external review before 1.0.

| Package | Language | Version | Install | Status |
|---|---|---|---|---|
| [`qorechain-qoreseal`](https://crates.io/crates/qorechain-qoreseal) | Rust (imports as `qoreseal`) | 0.1.0 | `cargo add qorechain-qoreseal` | Published |
| [`github.com/qorechain/qoreseal/go`](https://pkg.go.dev/github.com/qorechain/qoreseal/go) | Go | v0.1.0 | `go get github.com/qorechain/qoreseal/go@v0.1.0` | Published |
| [`qorechain-qoreseal`](https://pypi.org/project/qorechain-qoreseal/) | Python 3.9+ (imports as `qoreseal`) | 0.1.0 | `pip install qorechain-qoreseal` | Published. Wheels for macOS (arm64, x86_64) and Linux (x86_64, aarch64); no Windows wheel yet |
| `QoreSeal` (Swift package) | Swift (iOS 16+, macOS 13+) | 0.1.0 | `.package(url: "https://github.com/qorechain/qoreseal", from: "0.1.0")`, product `QoreSeal` | Published as a GitHub release; the binary framework downloads from it |
| [`io.github.qorechain:qoreseal`](https://central.sonatype.com/artifact/io.github.qorechain/qoreseal) | Kotlin / JVM (JVM 17+, Kotlin 2.3+) | 0.1.0 | `implementation("io.github.qorechain:qoreseal:0.1.0")` | Published on Maven Central |
| [`io.github.qorechain:qoreseal-android`](https://central.sonatype.com/artifact/io.github.qorechain/qoreseal-android) | Kotlin (Android API 24+, Kotlin 2.3+) | 0.1.0 | `implementation("io.github.qorechain:qoreseal-android:0.1.0")` | Published on Maven Central |
| `@qorechain/qoreseal` | TypeScript | none yet | none | **Not published** to npm (404 on 27 October 2026). The source is in the repository |

### PQ light client {#group-pq-light-client}

Page: [PQ light client](/developer-tools/pq-light-client). Source: [qorechain/qorechain-pq-light-client](https://github.com/qorechain/qorechain-pq-light-client). A draft specification and reference verifiers for ML-DSA-87 signed checkpoints. It does not connect to mainnet or testnet: QoreChain does not produce the checkpoints it verifies and no chain support is scheduled. It runs against simulated validator sets and shared test vectors.

| Package | Language | Version | Install | Status |
|---|---|---|---|---|
| [`@qorechain/pq-light-client`](https://www.npmjs.com/package/@qorechain/pq-light-client) | TypeScript | 0.1.0 | `npm install @qorechain/pq-light-client` | Published. Depends on `@qorechain/pqc` 0.2.3 |
| [`qorechain-pq-light-client`](https://crates.io/crates/qorechain-pq-light-client) | Rust (library `qorechain_pq_light_client`) | 0.1.0 | `cargo add qorechain-pq-light-client` | Published |
| [`github.com/qorechain/qorechain-pq-light-client/go`](https://pkg.go.dev/github.com/qorechain/qorechain-pq-light-client/go) | Go (package `pqlightclient`) | v0.1.0 | `go get github.com/qorechain/qorechain-pq-light-client/go@v0.1.0` | Published |

### Custody kit {#group-custody-kit}

Page: [Custody kit](/developer-tools/custody-kit). Source: [qorechain/qorechain-custody-kit](https://github.com/qorechain/qorechain-custody-kit). An integration guide, reference code and test vectors for custodians and exchanges, in TypeScript, Python, Go, Rust and Java. It is reference code to read, copy or vendor, not a package set: the only registry entry is the Go module.

| Package | Language | Version | Install | Status |
|---|---|---|---|---|
| GitHub release `v0.1.0` | TypeScript, Python, Go, Rust, Java | 0.1.0 | `git clone https://github.com/qorechain/qorechain-custody-kit`, then build the folder for your language | Published, 27 October 2026. No npm, PyPI, crates.io or Maven package, by design |
| [`github.com/qorechain/qorechain-custody-kit/code/go`](https://pkg.go.dev/github.com/qorechain/qorechain-custody-kit/code/go) | Go (package `custodykit`) | v0.1.0 | `go get github.com/qorechain/qorechain-custody-kit/code/go@v0.1.0` | Published |

### QoreScan {#group-qorescan}

Page: [QoreScan](/developer-tools/qorescan). Source: [qorechain/qorescan](https://github.com/qorechain/qorescan). QoreScan Community 0.1.0 inventories the cryptography of a QoreChain deployment (a node home directory, live network state, TLS endpoints and Solidity sources) and writes a CycloneDX 1.6 CBOM and Markdown reports. It is an inventory aid, not a certification or an audit.

| Package | Language | Version | Install | Status |
|---|---|---|---|---|
| [GitHub release `v0.1.0`](https://github.com/qorechain/qorescan/releases/tag/v0.1.0) | Binaries for macOS, Linux and Windows (amd64, arm64) | 0.1.0 | download and check against `qorescan_0.1.0_checksums.txt` | Published, 27 October 2026 |
| [`@qorechain/qorescan`](https://www.npmjs.com/package/@qorechain/qorescan) | npm wrapper (Node.js 18+) | 0.1.0 | `npx @qorechain/qorescan scan ...` | Published. Downloads and checks the release binary on first run |
| [`qorescan`](https://pypi.org/project/qorescan/) | PyPI wrapper (Python 3.9+) | 0.1.0 | `pipx run qorescan scan ...` or `pip install qorescan` | Published. Same behaviour as the npm wrapper |
| [`github.com/qorechain/qorescan`](https://pkg.go.dev/github.com/qorechain/qorescan) | Go | v0.1.0 | `go install github.com/qorechain/qorescan/cmd/qorescan@v0.1.0` | Published. Go 1.26 |

### Chain developer kit (SDK 0.11.0) {#group-chain-dev-sdk}

Page: [Chain developer kit](/developer-tools/chain-dev-sdk). Source: [qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk). The part of QoreChain SDK 0.11.0 for Solidity and smart-contract teams: viem chain definitions and EVM authorization window helpers in `@qorechain/evm`, four new `create-qorechain-dapp` templates (Foundry, Hardhat 3, viem with wagmi, and a QoreChain Native token), EVM quickstarts and a page on how the QoreChain EVM differs from Ethereum.

**Coming.** SDK 0.11.0 is tagged on GitHub (`v0.11.0`) and its npm release is pending: on 27 October 2026 npm served `@qorechain/sdk` 0.10.0, `@qorechain/evm` 0.8.0 and `create-qorechain-dapp` 0.10.0, and `@qorechain/sdk@0.11.0` returned 404. Until npm shows 0.11.0, the new chain definitions, window helpers and templates cannot be installed; the 0.10.0 packages in the [SDK table](#group-sdk) are what you get today. 0.11.0 changes the npm packages only: the Python, Rust, Go and Java SDKs stay at 0.10.0.

### Rollup Development Kit (RDK) {#group-rdk}

Guides: [Rollups overview](/rollups/overview), [Deploying a rollup](/rollups/deploying-a-rollup), [Rollup Development Kit architecture](/architecture/rollup-development-kit). Source: [qorechain/qorechain-rdk](https://github.com/qorechain/qorechain-rdk).

| Package | Language | Version | Install | Status |
|---|---|---|---|---|
| [`@qorechain/rdk`](https://www.npmjs.com/package/@qorechain/rdk) | TypeScript | 0.7.0 | `npm install @qorechain/rdk` | Published. The only RDK client that signs hybrid, and only when you pass a `pqcKeypair` |
| [`@qorechain/rdk-cli`](https://www.npmjs.com/package/@qorechain/rdk-cli) | TypeScript (CLI `qorollup`) | 0.7.0 | `npm install -g @qorechain/rdk-cli` | Published. Since 0.6.2 it launches through the npm bin link (0.6.1 and earlier printed nothing). Its transaction commands sign classical only, which the networks refuse |
| [`create-qorechain-rollup`](https://www.npmjs.com/package/create-qorechain-rollup) | TypeScript (CLI) | 0.7.0 | `npx create-qorechain-rollup my-rollup` | Published |
| [`qorechain-rdk`](https://pypi.org/project/qorechain-rdk/) | Python (3.10+, imports `qorrdk`) | 0.7.0 | `pip install qorechain-rdk` | Published. Reads work; transactions sign classical only |
| [`qorechain-rdk`](https://crates.io/crates/qorechain-rdk) | Rust | 0.7.0 | `cargo add qorechain-rdk` | Published. Reads work; transactions sign classical only |
| [`github.com/qorechain/qorechain-rdk/packages/go`](https://pkg.go.dev/github.com/qorechain/qorechain-rdk/packages/go) | Go | v0.7.0 | `go get github.com/qorechain/qorechain-rdk/packages/go@v0.7.0` | Published. Reads work; transactions sign classical only |
| [`io.github.qorechain:qorechain-rdk`](https://central.sonatype.com/artifact/io.github.qorechain/qorechain-rdk) | Java (JDK 17+) | 0.7.0 | `implementation("io.github.qorechain:qorechain-rdk:0.7.0")` | Published. Reads work; transactions sign classical only |

### Post-quantum primitives (`qorechain-pqc`) {#group-pqc}

Guide: [Post-Quantum Signing](/developer-guide/post-quantum-signing). Source: [qorechain/qorechain-pqc](https://github.com/qorechain/qorechain-pqc). ML-DSA signing is deterministic by default in all bindings; hedged signing is an explicit opt-in.

| Package | Language | Version | Install | Status |
|---|---|---|---|---|
| [`@qorechain/pqc`](https://www.npmjs.com/package/@qorechain/pqc) | TypeScript | 0.2.3 | `npm install @qorechain/pqc` | Published |
| [`qorechain-pqc`](https://pypi.org/project/qorechain-pqc/) | Python (3.9+) | 0.2.3 | `pip install qorechain-pqc` | Published. Needs liboqs; the first import builds it if missing (git, CMake and a C compiler) |
| [`qorechain-pqc`](https://crates.io/crates/qorechain-pqc) | Rust | 0.2.3 | `cargo add qorechain-pqc` | Published |
| [`github.com/qorechain/qorechain-pqc/go`](https://pkg.go.dev/github.com/qorechain/qorechain-pqc/go) | Go | v0.2.3 | `go get github.com/qorechain/qorechain-pqc/go` | Published |
| [`io.github.qorechain:qorechain-pqc`](https://central.sonatype.com/artifact/io.github.qorechain/qorechain-pqc) | Java | 0.2.3 | `implementation("io.github.qorechain:qorechain-pqc:0.2.3")` | Published |
| C library | C | 0.2.3 | build `c/` from the repository (needs liboqs and OpenSSL) | Source only, no package registry |

### Wallet adapter {#group-wallet-adapter}

Page: [Wallet adapter](/developer-tools/wallet-adapter). Source: [qorechain/qorechain-wallet-adapter](https://github.com/qorechain/qorechain-wallet-adapter).

| Package | Language | Version | Install | Status |
|---|---|---|---|---|
| [`@qorechain/wallet-adapter`](https://www.npmjs.com/package/@qorechain/wallet-adapter) | TypeScript (ES module, plain JavaScript with typings) | 0.4.0 | `npm install @qorechain/wallet-adapter @cosmjs/stargate @cosmjs/proto-signing` | Published. No tested quickstart |

### Chain bridge {#group-chain-bridge}

Page: [Chain bridge and handles](/developer-tools/chain-bridge).

| Package | Language | Version | Install | Status |
|---|---|---|---|---|
| [`@qorechain/chain-bridge`](https://www.npmjs.com/package/@qorechain/chain-bridge) | TypeScript (Node.js server) | 0.2.3 | `npm install @qorechain/chain-bridge` | Published. No tested quickstart. The registry lists no source repository |

### Handles {#group-handles}

Page: [Chain bridge and handles](/developer-tools/chain-bridge#handles).

| Package | Language | Version | Install | Status |
|---|---|---|---|---|
| [`@qorechain/handles`](https://www.npmjs.com/package/@qorechain/handles) | TypeScript | 0.1.0 | `npm install @qorechain/handles` | Published. Verifies a handle resolution against a pinned registry key. It does not pin addresses itself: the caller supplies the pin store and decides when to pin. No tested quickstart. The registry lists no source repository |

### QoreX integrations {#group-qorex}

Guide: [QoreX, for developers](/qorex/overview#developers). Source: [qorechain/qorex-integrations](https://github.com/qorechain/qorex-integrations). All six were published on 27 October 2026.

| Package | Language | Version | Install | Status |
|---|---|---|---|---|
| [`@qorechain/qorex-types`](https://www.npmjs.com/package/@qorechain/qorex-types) | TypeScript | 0.1.0 | `npm install @qorechain/qorex-types` | Published. Finds QoreX (EIP-6963 and the native provider) |
| [`@qorechain/qorex-rainbowkit`](https://www.npmjs.com/package/@qorechain/qorex-rainbowkit) | TypeScript | 0.1.0 | `npm install @qorechain/qorex-rainbowkit @rainbow-me/rainbowkit wagmi viem @tanstack/react-query` | Published |
| [`@qorechain/qorex-interchain-kit`](https://www.npmjs.com/package/@qorechain/qorex-interchain-kit) | TypeScript (React) | 0.1.0 | `npm install @qorechain/qorex-interchain-kit @interchain-kit/core @interchain-kit/react` | Published |
| [`@qorechain/qorex-cosmos-kit`](https://www.npmjs.com/package/@qorechain/qorex-cosmos-kit) | TypeScript (React) | 0.1.0 | `npm install @qorechain/qorex-cosmos-kit @cosmos-kit/core @cosmos-kit/react` | Published. With `@cosmos-kit/react` 2.24 pass `throwErrors={false}`; the README snippet omits it |
| [`@qorechain/qorex-wallet-mock`](https://www.npmjs.com/package/@qorechain/qorex-wallet-mock) | TypeScript | 0.1.0 | `npm install -D @qorechain/qorex-wallet-mock` | Published. A test wallet that signs for real on testnet |
| [`@qorechain/qorex-synpress`](https://www.npmjs.com/package/@qorechain/qorex-synpress) | TypeScript | 0.1.0 | `npm install -D @qorechain/qorex-synpress @playwright/test` | Published. Playwright fixtures; extension mode throws today |

### Connect (deprecated) {#group-connect}

| Package | Language | Version | Install | Status |
|---|---|---|---|---|
| [`@qorechain/connect`](https://www.npmjs.com/package/@qorechain/connect) | TypeScript | 0.2.1 | none | **Deprecated and no longer maintained.** Do not use it for new work. Replace it as in the table below |

:::caution @qorechain/connect is deprecated
`@qorechain/connect` is marked deprecated on npm. Its peer range is `@qorechain/wallet-adapter` `^0.2.1`, which does not include 0.4.0, and it does not open an [EVM authorization window](/sdk/guides/evm#evm-window), so an EVM send through it is refused until the account has a registered key and an open window. The repository listed in its registry metadata is not publicly reachable.
:::

| Need | Use instead |
|---|---|
| Detect QoreX (EVM, native, Solana) | `@qorechain/qorex-types` |
| EVM dApps with RainbowKit and wagmi | `@qorechain/qorex-rainbowkit` |
| Cosmos dApps | `@qorechain/qorex-interchain-kit` (or `@qorechain/qorex-cosmos-kit`) |
| Hybrid signing in your own wallet or backend | `@qorechain/qoresign` |

### QORel, the IBC relayer {#group-qorel}

| Package | Where | Version | Install | Status |
|---|---|---|---|---|
| QORel (`qorel`) | GitHub release `qorel-v0.1.0`, Homebrew, container `ghcr.io/qorechain/qorel` | 0.1.0 | `brew install qorechain/tap/qorel` | Published as a pre-release. IBC v1 only; testnet only. See [QORel](/qorel/overview) |

### MCP server and CLI {#group-mcp}

Pages: [QoreChain MCP server](/developer-tools/mcp), [QoreChain CLI](/developer-tools/qore-cli). Source: [qorechain/qorechain-mcp](https://github.com/qorechain/qorechain-mcp) (public). Both read the chain and neither signs, holds keys or broadcasts. Published on 27 October 2026.

| Package | Language | Version | Install | Status |
|---|---|---|---|---|
| [`@qorechain/mcp`](https://www.npmjs.com/package/@qorechain/mcp) | TypeScript (Node.js server, bin `qorechain-mcp`) | 0.1.0 | `npx -y @qorechain/mcp` | Published. stdio and Streamable HTTP. A hosted endpoint, `https://mcp.qorechain.io/mcp`, needs an API key, requested from your dashboard |
| [`qorechain-mcp`](https://pypi.org/project/qorechain-mcp/) | Python (3.10+) | 0.1.0 | `pip install qorechain-mcp` (or `uvx qorechain-mcp`) | Published. Same tools as the npm package; stdio only |
| [`@qorechain/qore-cli`](https://www.npmjs.com/package/@qorechain/qore-cli) | TypeScript (CLI `qore`) | 0.1.0 | `npm install -g @qorechain/qore-cli` | Published. `--json` output identical to the MCP tool output |

### Planned (not published) {#planned}

These are not on their registry yet, so there is nothing to install and the behaviour described for them cannot be used yet. Each returned 404 (or was not listed) on 27 October 2026.

| Package | Intended use | Status |
|---|---|---|
| `@qorechain/qoreseal` on npm | QoreSeal for TypeScript | Not published; the source is in the repository |
| `@qorechain/sdk`, `@qorechain/evm`, `@qorechain/react`, `@qorechain/svm`, `create-qorechain-dapp` 0.11.0 on npm | The [chain developer kit](/developer-tools/chain-dev-sdk) | Tagged on GitHub, npm release pending |

## How to get live versions {#live-versions}

The tables are a snapshot. To read the current version of a package yourself:

| Registry | Request | Field |
|---|---|---|
| npm | `https://registry.npmjs.org/<name>/latest` | `version` |
| PyPI | `https://pypi.org/pypi/<name>/json` | `info.version` |
| crates.io | `https://crates.io/api/v1/crates/<name>` (send a `User-Agent` header or the request is refused) | `crate.max_stable_version` |
| Go | `https://proxy.golang.org/<module>/@latest` | `Version` (remove the leading `v`) |
| Maven Central | `https://repo1.maven.org/maven2/<group path>/<artifact>/maven-metadata.xml` | `<release>` |
| Swift | `https://api.github.com/repos/qorechain/qoresign/releases/latest` | `tag_name` (remove the leading `v`); unauthenticated GitHub calls are limited to 60 per hour per address |

For a scoped npm name keep the `@`, for example `https://registry.npmjs.org/@qorechain/sdk/latest`. A 404 means the package is not published. The Go proxy can answer `@latest` from a cache for a short while after a release, so pin the version in the command when you need a specific one (the RDK Go install above does). Each package page on its registry also shows the version and the release history.

## Limits and known issues {#limits}

- **Two live networks, different versions.** Mainnet runs v3.2.4 and testnet runs v3.2.6. A feature that exists only on testnet is marked on its own page. Do not assume v3.2.5 behaviour on mainnet.
- **Not live yet:** the Transaction inspector tab on the dashboard developer page (the library function `inspectTransaction` in QoreSign 0.1.1 is published), `@qorechain/qoreseal` on npm, SDK 0.11.0 (the chain developer kit) on npm, SVM transactions, and the EVM precompiles on mainnet (they are active on testnet only; see the [SDK overview](/sdk/overview) for the lane-by-lane list).
- **QoreSeal registry and the PQ light client.** Encrypting to an address read from the chain needs the KEM key registry, live on testnet and coming to mainnet after v3.2.5. The PQ light client does not connect to either network; no chain support for its checkpoints is scheduled.
- **Kotlin 2.3 or later.** The QoreSign and QoreSeal Kotlin and Android artifacts need the Kotlin 2.3 or later compiler; Kotlin 2.1 fails to compile against them.
- **No Windows wheels.** The QoreSign and QoreSeal Python packages have wheels for macOS and Linux only; other platforms build from the source distribution, which needs Rust.
- **Examples not run:** of the 34 quickstart entries, 31 ran and passed on 27 October 2026. The QoreSign Python example was run after the package was published (macOS arm64 and Linux aarch64), and the QoreSign Android example was not run on a device. The wallet adapter, chain bridge and handles have no quickstart, so their examples in this manual come from the package typings and source and were not run end to end.
- **`@qorechain/rdk-cli` before 0.6.2** printed nothing when started through the npm bin link, and its `--version` printed 0.4.1. **`@qorechain/rdk` before 0.7.0** built withdrawal proofs that never verified on chain. Use 0.7.0.
- **cosmjs version conflict.** `@qorechain/wallet-adapter` and `@qorechain/chain-bridge` use cosmjs 0.32; the SDK uses cosmjs 0.39. Installing the adapter next to the SDK in one project makes npm report `ERESOLVE`. Keep them in separate projects or pass `--legacy-peer-deps`.
- **Nested SDK copy in older RDK releases.** `@qorechain/rdk` 0.6.2 and earlier depend on `@qorechain/sdk` `^0.9.0`, so an app on SDK 0.10.0 got a second, nested SDK 0.9.x copy. From 0.7.0 the kit depends on `@qorechain/sdk` `^0.10.0` and shares one copy.
- **Classical-only RDK clients.** The Python, Rust, Go and Java RDK clients sign classical only, which the native lane refuses on both networks; use them for reads, or use the TypeScript client with a `pqcKeypair` for transactions.
- **Packages without a public source repository.** `@qorechain/chain-bridge` and `@qorechain/handles` list no source repository in their registry metadata. You can read the published package contents on npm.
- **Python `qorechain-pqc`** has no seeded key generation in 0.2.3, and it needs liboqs.
