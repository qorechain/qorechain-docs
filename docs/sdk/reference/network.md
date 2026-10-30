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
| Chain version (30 October 2026) | v3.2.5 (since height 3,906,833, 29 October 2026, governance proposal 14; v3.2.4 was applied at height 3,742,566 on 23 October). SDK 0.10.0 is the client for v3.2.4 and keeps working; it has no builders for the v3.2.5 additions |
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
| Chain version (27 October 2026) | v3.2.6 (since height 8,970,638, 27 October 2026; v3.2.5 was applied at height 8,890,800 on 26 October and v3.2.4 at height 8,337,253 on 19 October) |
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

### Testnet-only differences that matter to a client {#testnet-only}

The testnet is a staging network and runs ahead of mainnet, so a few things you can
read there are not on mainnet (checked 27 October 2026; the full list is in
[Differences between testnet and mainnet](/appendix/chain-parameters#testnet-differences)):

* **REST routes.** `GET /qorechain/rlconsensus/v1/{agent,params,observation,reward,policy,applied_params,last_action}`, `GET /qorechain/pqc/v1/params` and `GET /qorechain/crossvm/v1/params` answer on the testnet; mainnet answers HTTP 501 for them. The AMM routes under `/qorechain/amm/v1/` (`pools`, `params`) answer on both networks.
* **Test tokens.** Three tokens with no value exist only on the testnet, as bank denominations named `erc20:<EIP-55 contract address>` (case-sensitive): fUSD (6 decimals), fETH (18) and fBTC (8). `GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata` lists them. Mainnet's only bank denomination is `uqor`. See [Testnet test tokens (Fest)](/api-reference/rest-grpc-endpoints#fest-tokens).
* **Modules switched on.** The `abstractaccount` module is enabled on the testnet and off on mainnet, three EVM precompiles are active on the testnet and none on mainnet, and QoreChain Native instantiate is open on the testnet.

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
