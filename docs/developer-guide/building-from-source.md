---
slug: /developer-guide/building-from-source
title: Building from Source
sidebar_label: Building from Source
sidebar_position: 1
---

# Building from Source

This guide walks you through building the community `qorechaind` binary from the public source, and explains what that binary is and is not for.

:::caution A source build cannot join mainnet or testnet
The public repository contains the module interfaces with **stub keepers**; the consensus-critical keeper implementations and the post-quantum signer are not in the public source tree. A binary built from it cannot reproduce the networks' consensus state, and it cannot create the hybrid post-quantum signature that every Cosmos-lane transaction requires. Since v3.2.3 it also **refuses to start** on `qorechain-vladi` or `qorechain-diana` (it recognises them by chain id and genesis time; a local devnet that reuses a public chain id with its own genesis is not affected). `qorechaind start --community-unenforced-pqc` overrides the refusal for experiments; the node then verifies no post-quantum signatures and can diverge from the network without warning, so never use it for a node you rely on. To run a node or validator on mainnet or testnet, install the **release binary** named in the live manifest (`https://download.qore.host/mainnet/latest.json` or `.../testnet/latest.json`); see [Running a Node](/developer-guide/running-a-node) and [Running a Validator](/developer-guide/running-a-validator).
:::

## Prerequisites

| Dependency         | Minimum Version           | Notes                                             |
| ------------------ | ------------------------- | ------------------------------------------------- |
| **Go**             | 1.26+                     | Required for all builds                           |
| **CGO**            | Enabled (`CGO_ENABLED=1`) | Required for PQC and SVM FFI bridges              |
| **Make**           | 3.81+                     | Build automation                                  |
| **Git**            | 2.x                       | Source checkout                                   |

Verify your environment:

```bash
go version        # go1.26.x or later
echo $CGO_ENABLED # must be 1
```

:::danger
Every `go build`, `go test`, and `go run` invocation **must** have `CGO_ENABLED=1` set. The node links native libraries (the QoreChain Native runtime, and in the release build the PQC and SVM libraries) through cgo.
:::

## Native Libraries

### libqorepqc and libqoresvm

The post-quantum (`libqorepqc`) and SVM (`libqoresvm`) libraries are built from Rust sources that are **not part of the public repository** (there is no `rust/` directory in `qorechain-core`). The community build does not need them. The release archives for the networks bundle the compiled libraries (`libqorepqc.so`, `libqoresvm.so`, `libwasmvm.x86_64.so`) in a `lib/` directory next to `qorechaind`; place them in `lib/{os}_{arch}/` or point the loader at them as shown below.

### Setting the Library Path

When you use the release binary, its shared libraries must be discoverable at runtime. Set the appropriate environment variable for your platform:

**macOS:**

```bash
export DYLD_LIBRARY_PATH=$(pwd)/lib/darwin_arm64:$DYLD_LIBRARY_PATH
```

**Linux:**

```bash
export LD_LIBRARY_PATH=$(pwd)/lib/linux_amd64:$LD_LIBRARY_PATH
```

:::info
Tip: Add the export to your shell profile (`~/.bashrc`, `~/.zshrc`) so it persists across sessions.
:::

## Open-Core Architecture

QoreChain follows an **open-core** model:

* **Community build** — Contains the full module interfaces, CLI commands, protobuf definitions, and message types for every QoreChain module (x/pqc, x/ai, x/reputation, x/qca, x/svm, x/crossvm, etc.). Keepers for proprietary modules use **stub implementations** that return safe defaults or no-op responses. This allows third-party tooling, wallets, and indexers to integrate with all QoreChain APIs without requiring proprietary code.
* **Full build** — Contains the complete keeper implementations (the real consensus-critical module logic and the post-quantum signer). It is distributed as the release binaries published at [download.qore.host](https://download.qore.host); it is not built from the public source tree.

Both builds produce the same `qorechaind` binary name and expose the same CLI commands. The difference is in the runtime behaviour of the keeper logic behind those interfaces.

## Community Build

```bash
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

This compiles all public module interfaces with stub keepers for proprietary features. The resulting binary is intended for:

* Local development and testing (for example a single-node devnet)
* Querying a network (`query ...` commands work against any node)
* Building third-party integrations and tooling against the module interfaces

It is not a way to join mainnet or testnet as a validator or to transact there: it has no post-quantum signer (`tx pqc gen-key` and `tx pqc cosign` return an error) and its stub keepers do not reproduce the networks' consensus rules.

## Full Build (release binary)

The full keeper implementations, and the signer behind `tx pqc gen-key` and `tx pqc cosign`, are not in the public source tree, so they cannot be built from it. The binaries published at [download.qore.host](https://download.qore.host) are the full build; use those for mainnet and testnet.

## Running Tests

```bash
CGO_ENABLED=1 go test ./... -count=1
```

The `-count=1` flag disables test caching, ensuring a clean run every time. Individual package tests can be run with:

```bash
CGO_ENABLED=1 go test ./x/pqc/... -count=1 -v
CGO_ENABLED=1 go test ./x/svm/... -count=1 -v
```

Tests that exercise the native libraries or the proprietary keepers are compiled only into the full build and are not part of the public suite.

## Build Verification

After a successful build, verify the binary:

```bash
./qorechaind version   # may print nothing: release binaries do not report a version string
./qorechaind init test-node --chain-id qorechain-diana
```

The `init` command should create a genesis file and node configuration in `~/.qorechaind/` without errors. The example above initializes against the **`qorechain-diana`** testnet — for mainnet, substitute `--chain-id qorechain-vladi`, the live network (node release **v3.2.4** at the time of writing; the testnet runs **v3.2.6**).

## Docker Build

A Dockerfile is provided at the repository root:

```bash
docker build -t qorechaind:community .
```

It builds the **community** binary (its own comment reads "Public build — no PQC library"), so the image is for local development and tooling, not for following mainnet or testnet. To run a network node in Docker, wrap the release binary instead; see [Running a Node](/developer-guide/running-a-node#docker-compose).

## Troubleshooting

<details>

<summary>cgo: C compiler not found</summary>

Install Xcode CLI tools (macOS) or `build-essential` (Linux)

</details>

<details>

<summary>cannot find -lqorepqc</summary>

You are linking a build that expects the native libraries. Use the community build (it does not need them) or the release archive, which bundles them, and set `LD_LIBRARY_PATH` / `DYLD_LIBRARY_PATH` to its `lib/` directory

</details>

<details>

<summary>undefined: sonic.*</summary>

Ensure `go.sum` is up to date: `go mod tidy`

</details>

<details>

<summary>signal: killed during build</summary>

Increase available memory (common in Docker with low limits)

</details>

<details>

<summary>PQC tests fail with size mismatch</summary>

ML-DSA-87 sizes are public key 2,592 bytes, secret key 4,896 bytes and signature 4,627 bytes. Any other size means a different algorithm or a truncated value.

</details>
