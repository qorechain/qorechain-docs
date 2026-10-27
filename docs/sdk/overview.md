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

- **QoreChain Native** — Wasm smart contracts via the Cosmos SDK (the CosmWasm runtime).
- **QoreChain EVM Engine** — Ethereum-compatible execution (Solidity, viem,
  standard JSON-RPC).
- **SVM** — a Solana-compatible runtime with a Solana-style JSON-RPC.

Accounts, balances, and tokens are shared across the runtimes, and the chain
includes the IBC module for cross-chain interoperability (no IBC channel is
open on mainnet; the testnet has one open `transfer` channel to a test chain, checked 27 October 2026).

:::note What works on the live networks today (mainnet v3.2.4, testnet v3.2.6)
**Works:** reads on every lane, hybrid-signed Native transactions, unified
accounts, EVM transactions inside an
[authorization window](/sdk/guides/evm#evm-window), and SVM reads.
**Not available yet:** the EVM precompiles on mainnet (none is active there; the
testnet has three active, PQC verify, PQC key status and consensus parameters, and
the AI pair and the cross-VM bridge are inactive on both), the `qor_` JSON-RPC
namespace, SVM transactions, cross-VM calls on mainnet (`MsgCrossVMCall` is
switched off by the circuit breaker), QoreChain Native upload and instantiate for ordinary
accounts (on the testnet, instantiate is open and upload is not), the authenticator /
abstract-account flows on mainnet (module switched off there, enabled on the
testnet), xQORE and gas abstraction. Each guide repeats the caveat where it
applies. Checked against the live endpoints on 27 October 2026.

The published SDK (0.10.0, 26 October 2026) signs in the form both networks verify
(v2 hybrid sign-bytes, resolved from chain state), and the signing format,
addresses, decimals, memos and fees did not change in v3.2.3 or v3.2.4 (mainnet has run v3.2.4 since 23 October 2026;
the testnet runs v3.2.6, applied on 27 October). It carries
the client side of the later post-quantum rules (the proof of possession on key
registration, scoped EVM windows, EIP-7702 consent messages) and of v3.2.4 (staking
tiers, the authenticator nonce, protocol feature switches); versions before 0.9.0
do not carry the first group, see [Versions before 0.9.0](/sdk/install#before-090)
and [What 0.10.0 adds](/sdk/install#whats-new-0100).

Wallet and backend signing: see [QoreSign](/qoresign/overview).
:::

### Quantum-safe by design

QoreChain provides post-quantum cryptography (PQC) primitives based on
**ML-DSA-87** (Dilithium-5, FIPS 204). Alongside classical secp256k1 signing,
the chain supports a **hybrid** signing posture in which a transaction carries
*both* a classical signature and a post-quantum signature, so it stays valid
under classical verification today while gaining post-quantum protection.

The SDK exposes ML-DSA-87 key generation, signing, and verification today, plus
the building blocks for hybrid transactions. On the live networks a Native-path
transaction **must** be hybrid-signed and the account's ML-DSA-87 key must be
registered first. See
[Accounts & PQC signing](/sdk/concepts/accounts-pqc) for details. No marketing
claims here — the SDK exposes exactly the primitives the chain implements.

## What makes this SDK different

Beyond full multi-chain parity, three capabilities are **only possible on
QoreChain**, because they are built on protocol features no other Layer 1 has:

- **AI pre-flight risk scoring** — scan a transaction with on-chain AI before you
  broadcast it. `simulateWithRiskScore` returns gas plus a risk/anomaly verdict
  from deterministic EVM precompiles, so a wallet or dApp can warn (or block)
  *before* signing. The AI precompiles are not active yet on mainnet or testnet. See
  [AI pre-flight](/sdk/guides/ai-preflight).
- **Unified cross-VM calls** — one account, three VMs, one transaction.
  `createCrossVMClient` calls a contract on any VM and `callAtomic` packs several
  cross-VM calls into a single atomic transaction signed once. See
  [Cross-VM calls](/sdk/guides/cross-vm).
- **Quantum-safe DX** — make a signer post-quantum protected in one idempotent
  call (`ensurePqcRegistered` / `migrateToHybrid`), with a drop-in React badge.
  See [Quantum-safe](/sdk/guides/quantum-safe).

Two more chain-level capabilities landed in 0.6.0 and 0.7.0 (the second is not
usable on the live networks yet, see below):

- **Unified eth-native accounts** — one `eth_secp256k1` key is one 20-byte
  identity rendered as `qor1…`, `0x…`, and an SVM base58 address, all sharing
  one balance. See
  [Unified accounts](/sdk/concepts/accounts-pqc#unified-accounts).
- **Authenticator lanes** — link a Phantom or MetaMask key to the canonical
  PQC-required account and let it spend through a relayer under
  least-privilege, spending-limited, revocable terms. The `abstractaccount`
  module behind it is switched off on mainnet and enabled on the testnet. See
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
| `@qorechain/sdk` | TypeScript | `npm i @qorechain/sdk` | Published (npm, v0.10.0) |
| `qorechain-sdk` | Python | `pip install qorechain-sdk` (import `qorsdk`) | Published (PyPI, v0.10.0) |
| `qorechain-sdk` (Go module) | Go | `go get github.com/qorechain/qorechain-sdk/packages/go/...` | Published (Go proxy, tag `packages/go/v0.10.0`) |
| `qorechain-sdk` | Rust | `cargo add qorechain-sdk` (import `qorechain`) | Published (crates.io, v0.10.0) |
| `io.github.qorechain:qorechain-sdk` | Java | `io.github.qorechain:qorechain-sdk:0.10.0` | Published (Maven Central, v0.10.0) |
| `@qorechain/evm` | TypeScript (EVM adapter) | `npm i @qorechain/evm viem` | Published (npm, v0.8.0) |
| `@qorechain/svm` | TypeScript (SVM adapter) | `npm i @qorechain/svm @solana/web3.js` | Published (npm, v0.8.0) |
| `@qorechain/react` | TypeScript (React kit) | `npm i @qorechain/react` | Published (npm, v0.10.0) |
| `create-qorechain-dapp` | CLI | `npm create qorechain-dapp` | Published (npm, v0.10.0) |

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
(`@qorechain/sdk` 0.10.0), Python to PyPI (`qorechain-sdk` 0.10.0, import
`qorsdk`), Go to the module proxy (tag `packages/go/v0.10.0`), Rust to crates.io
(`qorechain-sdk` 0.10.0), and Java to Maven Central
(`io.github.qorechain:qorechain-sdk` 0.10.0). The EVM/SVM execution adapters
(`@qorechain/evm`, `@qorechain/svm`, both 0.8.0), the `@qorechain/react` kit
(0.10.0), and the `create-qorechain-dapp` scaffolding CLI (0.10.0) are
TypeScript-only and likewise published to npm. See
[Install](/sdk/install#related-packages) for the companion packages.

## What's new in 0.6, 0.7, 0.8, 0.9 and 0.10

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
and a Phantom or MetaMask key is linked to the account as an authenticator
(the Phantom-signature derivation was removed in 0.8.0). The legacy coin-type-118
`deriveNativeAccount` is unchanged. See
[Unified accounts](/sdk/concepts/accounts-pqc#unified-accounts).

**0.6.1 — consensus-critical fix.** The `PQCHybridSignature` tx-body extension
is now protobuf-encoded (it was JSON-encoded and rejected at CheckTx). Hybrid
transactions built with SDK ≤ 0.6.0 are **rejected on-chain** — upgrade.

**0.7.0 — authenticator lanes (chain v3.1.85).** The `abstractaccount` module
behind them is currently switched off on mainnet and enabled on the testnet (see the
[Authenticators guide](/sdk/guides/authenticators)). A linked Phantom (ed25519) or
MetaMask (secp256k1, by 20-byte address) key can spend from the canonical
PQC-required account through a relayer, under least-privilege, spending-limited,
revocable terms: `MsgExecuteEVM` / `MsgExecuteCosmos` / `MsgRotatePQCKey`
composers, byte-exact `evmAuthSignBytes` / `cosmosAuthSignBytes` /
`rotationSignBytes` helpers, the `permissionSchema` query, decoded error codes,
and TypeScript wallet builders (`buildPhantomExecuteCosmos`,
`buildMetaMaskExecuteEvm`, …). Full walkthrough with copy-pasteable examples:
[Authenticators & delegated spending](/sdk/guides/authenticators).

**0.8.0 – 0.8.3 — v2 hybrid sign-bytes and the EVM authorization window (chain
v3.2.0).** The post-quantum half of a hybrid transaction is now signed in the form
the target network verifies (v1 or v2, `signBytesVersion: "auto" | "v1" | "v2"`).
Both public networks are on v2, so SDK **0.8.1 or later** is required to
transact on mainnet (use the current release). **0.8.2** adds `openEvmWindowMsg`, `closeEvmWindowMsg`,
`fetchEvmWindow` and `classifyEvmWindowRejection` for the EVM-lane
[authorization window](/sdk/guides/evm#evm-window).
**0.8.0** removed the wallet-signature account helpers (`connectPhantomUnified` and
`unifiedAccountFromPhantomSignature`, removed in 0.8.0), applies strict ML-DSA-87
size checks in every language, and adds the `async` flag and returned callee data
to cross-VM calls. **0.8.3** fixes tx search, React hook races, Python
`migrate_to_hybrid` sequencing and address-form-independent canonical PQC
derivation (`derivePqcCanonical`, `canonicalAccount`). See
[Upgrade notes](/sdk/install#upgrade).

**0.9.0 — client support for chain v3.2.2 and v3.2.3.** The TypeScript `TxClient`
signs hybrid when you pass the account's keypair
(`client.connectTx(signer, { pqcKeypair })`), so `bankSend` and the SDK's rollup,
multilayer and cross-VM clients work on the public networks. `ensurePqcRegistered`
checks the registered key over REST first, refuses to register a second, different
key, and attaches the proof of possession by itself once the network has applied
v3.2.3. New builders cover scoped EVM windows (`nativeOnly`, `allowedTargets`) and
the EIP-7702 consent messages, and `derivePqcCanonical(address, mnemonic)` gives a
key you can recover from the mnemonic in every language. The PQC account route is
the singular `/qorechain/pqc/v1/account/{address}`, failures inside a block keep
their codespace, and `create-qorechain-dapp` scaffolds on the current SDK. See
[What 0.9.0 added](/sdk/install#whats-new-090).

**0.10.0 — client support for chain v3.2.4.** Staking-tier composers and reads
(`lockDelegation`, `unlockEarly`, `claimBonus`, `fetchStakingTierParams`,
`fetchStakingLocks`), `fetchAuthNonce` for a linked key's next sequence,
`fetchProtocolFeatures` / `isProtocolFeatureEnabled` for the consensus rules a
network enforces by name, `possessionProven` on the PQC status, and
`ibcTimeoutTimestamp`. `ensurePqcRegistered` now compares the registered key
instead of trusting a status without one, and a chain refusal that arrives as
text during fee simulation is named in every language. See
[What 0.10.0 adds](/sdk/install#whats-new-0100).

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
