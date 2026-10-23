---
slug: /sdk/reference/network
title: Network & Endpoints
sidebar_label: Network & Endpoints
sidebar_position: 1
---

# Network & endpoints reference

## Mainnet

| Field | Value |
| --- | --- |
| Network preset | `mainnet` |
| Chain id | `qorechain-vladi` (live since 7 June 2026) |
| Chain version (23 October 2026) | v3.2.4 (since height 3,742,566, 23 October 2026, governance proposal 13) |
| EVM chain ID | `9801` |
| Display token | `QOR` |
| Base denomination | `uqor` |
| Base units per QOR | `10^6` |
| Account bech32 prefix | `qor` |
| Validator bech32 prefix | `qorvaloper` |

## Testnet

| Field | Value |
| --- | --- |
| Network preset | `testnet` |
| Chain id | `qorechain-diana` (live) |
| Chain version (23 October 2026) | v3.2.4 (since height 8,337,253, 19 October 2026) |
| EVM chain ID | `9800` |
| Display token | `QOR` |
| Base denomination | `uqor` |
| Base units per QOR | `10^6` |
| Account bech32 prefix | `qor` |
| Validator bech32 prefix | `qorvaloper` |

## Public endpoints {#public-endpoints}

| Endpoint | Mainnet (`qorechain-vladi`) | Testnet (`qorechain-diana`) |
| --- | --- | --- |
| Cosmos REST (LCD) | `https://api.qore.host` | `https://api-testnet.qore.host` |
| Consensus RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM JSON-RPC (`eth_*`) | `https://evm.qore.host` (chain ID 9801) | `https://evm-testnet.qore.host` (chain ID 9800) |
| EVM WebSocket | — | `wss://evm-ws-testnet.qore.host` |
| SVM JSON-RPC (read-only) | `https://svm.qore.host` | `https://svm-testnet.qore.host` |

The EVM endpoints serve `eth_`, `net_`, `web3_` and `txpool_`; the `qor_`
namespace is not enabled. See also [Networks](/appendix/networks#public-endpoints).

## Default ports

`createClient()` uses these localhost ports by default. Override `endpoints` to
point at a real node.

| Endpoint | Port | Purpose |
| --- | --- | --- |
| Cosmos REST (LCD) | `1317` | bank balances, account info, module queries |
| gRPC | `9090` | gRPC queries |
| Consensus RPC | `26657` | signing/broadcasting native txs, QoreChain Native reads |
| EVM JSON-RPC | `8545` | `eth_*` (and `qor_*` / precompiles on nodes that enable them) |
| EVM JSON-RPC (WS) | `8546` | EVM WebSocket subscriptions |
| SVM JSON-RPC | `8899` | Solana-compatible RPC |

Example with explicit endpoints:

```ts
import { createClient } from "@qorechain/sdk";

const client = createClient({
  endpoints: {
    rest: "https://api-testnet.qore.host",        // REST (LCD)
    rpc: "https://rpc-testnet.qore.host",         // consensus RPC
    evmRpc: "https://evm-testnet.qore.host",      // EVM JSON-RPC (eth_*)
    evmWs: "wss://evm-ws-testnet.qore.host",      // EVM WebSocket
  },
});
```

The SDK exposes network presets and lookup helpers (exported from the networks
module) so you can list and resolve networks programmatically. In Python/Go/Rust
the equivalents are `create_client` / `CreateClient` / `ClientBuilder` plus the
`networks` module.

## Targeting mainnet

Both presets ship the same localhost defaults; select `mainnet` and override the
endpoints with the public URLs (or your own node):

```ts
const main = createClient({
  network: "mainnet",       // chain id qorechain-vladi
  endpoints: {
    rest: "https://api.qore.host",
    rpc: "https://rpc.qore.host",
    evmRpc: "https://evm.qore.host",
  },
});
```
