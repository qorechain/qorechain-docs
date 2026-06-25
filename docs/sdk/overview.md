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

## The SDK family

The SDK ships as a family of packages so you can build in your language of
choice. They share the same network presets, derivation schemes, denomination
math, and read surfaces.

| Package | Language | Install | Status |
| --- | --- | --- | --- |
| `@qorechain/sdk` | TypeScript | `npm i @qorechain/sdk` | Available |
| `@qorechain/evm` | TypeScript (EVM adapter) | `npm i @qorechain/evm viem` | Publish-pending |
| `@qorechain/svm` | TypeScript (SVM adapter) | `npm i @qorechain/svm @solana/web3.js` | Publish-pending |
| `qorechain` | Python | `pip install qorechain` | Publish-pending |
| `qorechain-sdk` | Go | `go get github.com/qorechain/qorechain-sdk/packages/go/...` | Publish-pending |
| `qorechain` | Rust | `cargo add qorechain` | Publish-pending |
| `create-qorechain-dapp` | CLI | `npm create qorechain-dapp` | Publish-pending |

The TypeScript core (`@qorechain/sdk`) is the most complete package and is the
basis for the examples in this documentation. The Python, Go, and Rust packages
mirror the same read surface (network presets, denom/address utilities, HD
account derivation, PQC signing primitives, REST + `qor_` JSON-RPC read
clients); native transaction building is available today in TypeScript and is a
follow-up in the other languages.

## Where to go next

- [Install](/sdk/install) — per-language install instructions.
- [Quickstart](/sdk/quickstart) — connect, read a balance, send a transfer.
- [Concepts: Architecture](/sdk/concepts/architecture) — the triple-VM model.
- [Concepts: Accounts & PQC signing](/sdk/concepts/accounts-pqc) — keys and
  post-quantum signing.
- [Guides](/sdk/guides/evm) — per-VM how-tos.
- [Network & endpoints reference](/sdk/reference/network) — chain id, ports, token.
- [Examples](/sdk/examples) — runnable, copy-pasteable snippets.
