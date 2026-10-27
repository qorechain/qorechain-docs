---
slug: /sdk/concepts/architecture
title: Architecture & Concepts
sidebar_label: Architecture
sidebar_position: 1
---

# Architecture & concepts

QoreChain is a single Layer 1 chain that runs three smart-contract virtual
machines side by side, with shared accounts and a shared token.

## The triple-VM model

| VM | Contracts | Client surface in the SDK |
| --- | --- | --- |
| **QoreChain Native** | Rust/Wasm contracts (the CosmWasm runtime) | `client.cosmwasm()` and the `queryContractSmart` / `execute` helpers in `@qorechain/sdk` |
| **QoreChain EVM Engine** | Solidity / Vyper | `@qorechain/evm` (a viem adapter) |
| **SVM** | Solana programs | `@qorechain/svm` (a `@solana/web3.js` adapter) |

The native (Cosmos) layer handles bank transfers, staking, governance, and the
`x/crossvm` module that routes messages between runtimes.

## Read surfaces

The SDK talks to a node through several endpoints:

- **Cosmos REST (LCD)** — bank balances, account info, module queries.
- **Consensus RPC** — used for signing/broadcasting native transactions and for
  the QoreChain Native read client.
- **EVM JSON-RPC** — standard `eth_*`, `net_*`, `web3_*` and `txpool_*` calls on
  the public endpoints. The QoreChain `qor_*` namespace is not served there (see
  below). The EVM precompiles `pqcVerify` (`0x0A01`) and `pqcKeyStatus` (`0x0A02`)
  are active on the testnet only; none is active on mainnet (activation needs a
  governance decision, with no date). See
  [EVM Precompiles](/developer-guide/evm-precompiles#network-status).
- **SVM JSON-RPC** — Solana-compatible RPC for the SVM runtime (read-only on the
  public endpoints; SVM transaction submission is disabled network-wide).

On nodes that enable it, the `qor_*` JSON-RPC namespace exposes QoreChain-specific
reads such as tokenomics, PQC key status, hybrid-signature mode, cross-VM messages,
and network statistics. In TypeScript these are typed methods on `client.qor`
(`QorClient`); the same surface exists in the Python, Go, and Rust SDKs. Against
the public endpoints use the REST routes instead (for example
`GET /qorechain/pqc/v1/account/{address}` for PQC key status and
`GET /qorechain/burn/v1/stats` for burn statistics).

> **Not served yet:** no released node build serves the `qor_` JSON-RPC namespace, so every `qor_*` call returns `-32601` (method not found) on every public endpoint today. See [the `qor_` namespace](/api-reference/json-rpc-qor_-namespace).

## Tokens & denominations

- Display token: **QOR**.
- Base denomination: **uqor**, with **10^6** base units per QOR.

Always do money math in base units. The SDK provides exact conversions so you
never lose precision to floating point:

```ts
import { toBase, fromBase } from "@qorechain/sdk";

toBase("1.5");        // "1500000"  (QOR -> uqor)
fromBase("1500000");  // "1.5"      (uqor -> QOR)
```

> Note: the EVM runtime represents QOR with 18 decimals (the EVM convention),
> which is distinct from the Cosmos `uqor` base of 10^6. The `@qorechain/evm`
> client defaults to 18 decimals for display. Confirm the value for your target
> network.

## Addresses

The same key material can be expressed in three address formats:

- **native** — bech32 with the `qor` prefix (`qor1…`), validators use
  `qorvaloper`.
- **EVM** — `0x…`, EIP-55 checksummed.
- **SVM** — base58 of the ed25519 public key.

See [Accounts & PQC signing](/sdk/concepts/accounts-pqc) for the derivation paths.

## Cross-VM

QoreChain's `x/crossvm` module lets contracts on one VM trigger actions on
another. The EVM→native path runs on-chain through the **cross-VM bridge
precompile** (`@qorechain/evm`; not active on the public networks yet), and the SDK provides typed REST read helpers
(`getCrossVmMessage`, `getPendingCrossVmMessages`, `getCrossVmParams`) plus
`client.qor.getCrossVmMessage(...)` to track message state. On the public
endpoints the REST helpers and `client.qor` are not served; read messages with
`connectQueryClients(rpc).crossvm`. See the
[cross-VM guide](/sdk/guides/cross-vm).
