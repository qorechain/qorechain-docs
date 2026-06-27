---
slug: /sdk/overview
title: QoreChain SDK Overview
sidebar_label: Overview
sidebar_position: 1
---

# QoreChain SDK

The QoreChain SDK is the official multi-language developer kit for building
decentralized applications on **QoreChain** — a quantum-safe, triple-VM Layer 1
network.

This documentation covers how to install the SDK, connect to the network, read
on-chain state, derive accounts, sign and send transactions, and work with each
of QoreChain's virtual machines.

## What is QoreChain?

QoreChain is a Layer 1 blockchain with three first-class smart-contract
runtimes on a single chain:

- **CosmWasm** — Wasm smart contracts via the Cosmos SDK.
- **QoreChain EVM Engine** — Ethereum-compatible execution (Solidity, viem,
  standard JSON-RPC).
- **SVM** — a Solana-compatible runtime with a Solana-style JSON-RPC.

Accounts, balances, and tokens are shared across the runtimes, and the chain
supports IBC for cross-chain interoperability.

### Quantum-safe by design

QoreChain provides post-quantum cryptography (PQC) primitives based on
**ML-DSA-87** (Dilithium-5, FIPS 204). Alongside classical secp256k1 signing,
the chain supports a **hybrid** signing posture in which a transaction carries
*both* a classical signature and a post-quantum signature, so it stays valid
under classical verification today while gaining post-quantum protection.

The SDK exposes ML-DSA-87 key generation, signing, and verification today, plus
the building blocks for hybrid transactions. See
[Accounts & PQC signing](/sdk/concepts/accounts-pqc) for details. No marketing
claims here — the SDK exposes exactly the primitives the chain implements.

## What makes this SDK different

Beyond full multi-chain parity, three capabilities are **only possible on
QoreChain**, because they are built on protocol features no other Layer 1 has:

- **AI pre-flight risk scoring** — scan a transaction with on-chain AI before you
  broadcast it. `simulateWithRiskScore` returns gas plus a risk/anomaly verdict
  from deterministic EVM precompiles, so a wallet or dApp can warn (or block)
  *before* signing. See [AI pre-flight](/sdk/guides/ai-preflight).
- **Unified cross-VM calls** — one account, three VMs, one transaction.
  `createCrossVMClient` calls a contract on any VM and `callAtomic` packs several
  cross-VM calls into a single atomic transaction signed once. See
  [Cross-VM calls](/sdk/guides/cross-vm).
- **Quantum-safe DX** — make a signer post-quantum protected in one idempotent
  call (`ensurePqcRegistered` / `migrateToHybrid`), with a drop-in React badge.
  See [Quantum-safe](/sdk/guides/quantum-safe).

A new **`@qorechain/react`** kit (provider, hooks, `ConnectButton`,
`QuantumSafeBadge`) makes building a quantum-safe dApp the default path — see the
[React kit guide](/sdk/guides/react). For the full case, read
[Why QoreChain SDK](/sdk/why).

## The SDK family

The SDK ships as a family of packages so you can build in your language of
choice. They share the same network presets, derivation schemes, denomination
math, and read surfaces.

| Package | Language | Install | Status |
| --- | --- | --- | --- |
| `@qorechain/sdk` | TypeScript | `npm i @qorechain/sdk` | Published (npm, v0.5.0) |
| `qorechain-sdk` | Python | `pip install qorechain-sdk` (import `qorsdk`) | Published (PyPI, v0.5.0) |
| `qorechain-sdk` (Go module) | Go | `go get github.com/qorechain/qorechain-sdk/packages/go/...` | Published (Go proxy, v0.5.0) |
| `qorechain-sdk` | Rust | `cargo add qorechain-sdk` | Published (crates.io, v0.5.0) |
| `io.github.qorechain:qorechain-sdk` | Java | `io.github.qorechain:qorechain-sdk:0.5.0` | Published (Maven Central, v0.5.0) |
| `@qorechain/evm` | TypeScript (EVM adapter) | `npm i @qorechain/evm viem` | Published (npm, v0.5.0) |
| `@qorechain/svm` | TypeScript (SVM adapter) | `npm i @qorechain/svm @solana/web3.js` | Published (npm, v0.5.0) |
| `@qorechain/react` | TypeScript (React kit) | `npm i @qorechain/react` | Published (npm, v0.5.0) |
| `create-qorechain-dapp` | CLI | `npm create qorechain-dapp` | Published (npm, v0.5.0) |

> The Python distribution installs as `qorechain-sdk` but **imports as
> `qorsdk`**. All clients are published to their registries — see
> [Install](/sdk/install) for the per-language commands.

The TypeScript core (`@qorechain/sdk`) is the basis for the examples in this
documentation. The Python, Go, Rust, and Java clients reach **full native-chain
parity** with TypeScript: network presets, denom/address utilities, HD account
derivation (native/EVM/SVM), PQC (ML-DSA-87) signing, typed message composers
for every custom module plus the standard Cosmos modules, typed query clients,
the complete transaction lifecycle (auto-gas, error decoding, tx tracking,
block/tx search), hybrid post-quantum transactions, and WebSocket
subscriptions. All of these clients are **published**: TypeScript to npm
(`@qorechain/sdk` 0.5.0), Python to PyPI (`qorechain-sdk` 0.5.0, import
`qorsdk`), Go to the module proxy (`.../packages/go` 0.5.0), Rust to
crates.io (`qorechain-sdk` 0.5.0), and Java to Maven Central
(`io.github.qorechain:qorechain-sdk` 0.5.0). The EVM/SVM execution adapters
(`@qorechain/evm`, `@qorechain/svm`, both 0.5.0), the `@qorechain/react` kit
(0.5.0), and the `create-qorechain-dapp` scaffolding CLI are TypeScript-only and
likewise published to npm.

The v0.4 release added rollup withdrawals (`MsgExecuteWithdrawal`, the L2→L1 exit
path), typed query clients for the `multilayer`, `rdk`, and `bridge` modules,
bridge admin messages, and high-level sidechain/paychain and rollup helpers
across all five languages.

## Where to go next

- [Why QoreChain SDK](/sdk/why) — the three capabilities unique to QoreChain.
- [Install](/sdk/install) — per-language install instructions.
- [Quickstart](/sdk/quickstart) — connect, read a balance, send a transfer.
- [Concepts: Architecture](/sdk/concepts/architecture) — the triple-VM model.
- [Concepts: Accounts & PQC signing](/sdk/concepts/accounts-pqc) — keys and
  post-quantum signing.
- [Guides](/sdk/guides/evm) — per-VM how-tos.
- [Network & endpoints reference](/sdk/reference/network) — chain id, ports, token.
- [Examples](/sdk/examples) — runnable, copy-pasteable snippets.
- [Network & endpoints reference](/sdk/reference/network) is also surfaced in [Networks](/appendix/networks).
