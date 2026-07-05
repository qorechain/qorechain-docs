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

Two more chain-level capabilities landed in 0.6.0 and 0.7.0:

- **Unified eth-native accounts** — one `eth_secp256k1` key is one 20-byte
  identity rendered as `qor1…`, `0x…`, and an SVM base58 address, all sharing
  one balance. See
  [Unified accounts](/sdk/concepts/accounts-pqc#unified-accounts).
- **Authenticator lanes** — link a Phantom or MetaMask key to the canonical
  PQC-required account and let it spend through a relayer under
  least-privilege, spending-limited, revocable terms. See
  [Authenticators & delegated spending](/sdk/guides/authenticators).

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
| `@qorechain/sdk` | TypeScript | `npm i @qorechain/sdk` | Published (npm, v0.7.0) |
| `qorechain-sdk` | Python | `pip install qorechain-sdk` (import `qorsdk`) | Published (PyPI, v0.7.0) |
| `qorechain-sdk` (Go module) | Go | `go get github.com/qorechain/qorechain-sdk/packages/go/...` | Published (Go proxy, tag `packages/go/v0.7.0`) |
| `qorechain-sdk` | Rust | `cargo add qorechain-sdk` (import `qorechain`) | Published (crates.io, latest published; 0.7.0 from the repo) |
| `io.github.qorechain:qorechain-sdk` | Java | `io.github.qorechain:qorechain-sdk:0.7.0` | Published (Maven Central, v0.7.0) |
| `@qorechain/evm` | TypeScript (EVM adapter) | `npm i @qorechain/evm viem` | Published (npm, v0.7.0) |
| `@qorechain/svm` | TypeScript (SVM adapter) | `npm i @qorechain/svm @solana/web3.js` | Published (npm, v0.7.0) |
| `@qorechain/react` | TypeScript (React kit) | `npm i @qorechain/react` | Published (npm, v0.7.0) |
| `create-qorechain-dapp` | CLI | `npm create qorechain-dapp` | Published (npm, v0.7.0) |

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
(`@qorechain/sdk` 0.7.0), Python to PyPI (`qorechain-sdk` 0.7.0, import
`qorsdk`), Go to the module proxy (tag `packages/go/v0.7.0`), Rust to
crates.io (`qorechain-sdk`, latest published — the 0.7.0 crate publish is
pending, so install from crates.io or from the repo), and Java to Maven
Central (`io.github.qorechain:qorechain-sdk` 0.7.0). The EVM/SVM execution
adapters (`@qorechain/evm`, `@qorechain/svm`, both 0.7.0), the
`@qorechain/react` kit (0.7.0), and the `create-qorechain-dapp` scaffolding CLI
(0.7.0) are TypeScript-only and likewise published to npm.

## What's new in 0.6 and 0.7

**0.6.0 — unified eth-native accounts (chain v3.1.83).** One `eth_secp256k1`
key is one 20-byte identity rendered as all three address encodings, sharing
one spendable balance on every lane:

```ts
import { deriveUnifiedAccount } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
account.cosmos; // "qor1…"   (bech32, Native lane)
account.evm;    // "0x…"     (EIP-55, EVM lane)
account.svm;    // base58    (20 bytes + 12 zero bytes)
```

Native-lane signing with the same key is `signClassicalEth` / `signHybridEth`,
and `connectPhantomUnified` derives a non-custodial unified account from a
deterministic Phantom signature. The legacy coin-type-118
`deriveNativeAccount` is unchanged. See
[Unified accounts](/sdk/concepts/accounts-pqc#unified-accounts).

**0.6.1 — consensus-critical fix.** The `PQCHybridSignature` tx-body extension
is now protobuf-encoded (it was JSON-encoded and rejected at CheckTx). Hybrid
transactions built with SDK ≤ 0.6.0 are **rejected on-chain** — upgrade.

**0.7.0 — authenticator lanes (chain v3.1.85).** A linked Phantom (ed25519) or
MetaMask (secp256k1, by 20-byte address) key can spend from the canonical
PQC-required account through a relayer, under least-privilege, spending-limited,
revocable terms: `MsgExecuteEVM` / `MsgExecuteCosmos` / `MsgRotatePQCKey`
composers, byte-exact `evmAuthSignBytes` / `cosmosAuthSignBytes` /
`rotationSignBytes` helpers, the `permissionSchema` query, decoded error codes,
and TypeScript wallet builders (`buildPhantomExecuteCosmos`,
`buildMetaMaskExecuteEvm`, …). Full walkthrough with copy-pasteable examples:
[Authenticators & delegated spending](/sdk/guides/authenticators).

## Where to go next

- [Why QoreChain SDK](/sdk/why) — the five capabilities unique to QoreChain.
- [Install](/sdk/install) — per-language install instructions.
- [Quickstart](/sdk/quickstart) — connect, read a balance, send a transfer.
- [Concepts: Architecture](/sdk/concepts/architecture) — the triple-VM model.
- [Concepts: Accounts & PQC signing](/sdk/concepts/accounts-pqc) — keys and
  post-quantum signing.
- [Guides](/sdk/guides/evm) — per-VM how-tos.
- [Authenticators & delegated spending](/sdk/guides/authenticators) — linked
  Phantom/MetaMask keys spending via a relayer.
- [Network & endpoints reference](/sdk/reference/network) — chain id, ports, token.
- [Examples](/sdk/examples) — runnable, copy-pasteable snippets.
- [Network & endpoints reference](/sdk/reference/network) is also surfaced in [Networks](/appendix/networks).
