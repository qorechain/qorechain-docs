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
| Chain version (12 November 2026) | v3.2.7 (since height 4,164,600, 12 November 2026, governance proposal 16; v3.2.6 was applied at height 4,020,000 on 4 November, v3.2.5 at height 3,906,833 on 29 October and v3.2.4 at height 3,742,566 on 23 October). SDK 0.12.0 is the client for v3.2.5 and works on v3.2.6 and v3.2.7 (the signing format did not change); 0.10.0 was the client for v3.2.4 |
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
| Chain version | v3.2.8 (since height 9,929,500, 12 November 2026, applied by governance; mainnet has not applied it. v3.2.7 was applied at height 9,594,600 on 6 November; v3.2.6 was applied at height 8,970,638 on 27 October; v3.2.5 was applied at height 8,890,800 on 26 October and v3.2.4 at height 8,337,253 on 19 October) |
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

From SDK 0.12.0 the `mainnet` and `testnet` presets use these REST, consensus RPC and
EVM JSON-RPC URLs (and the testnet EVM WebSocket) by default. The presets set **no**
gRPC endpoint and **no** SVM endpoint, even though the read-only SVM URLs above exist
(SVM transactions are not open): code that needs one of them fails with an error that
names the endpoint to pass. The testnet endpoints are rate limited per IP; run or
use your own node for production traffic. Before 0.12.0 every preset defaulted to
localhost.

### Testnet-only differences that matter to a client {#testnet-only}

The testnet is a staging network and runs ahead of mainnet, so a few things you can
read there are not on mainnet (checked 27 October 2026; the full list is in
[Differences between testnet and mainnet](/appendix/chain-parameters#testnet-differences)):

* **REST routes.** `GET /qorechain/rlconsensus/v1/{agent,params,observation,reward,policy,applied_params,last_action}`, `GET /qorechain/pqc/v1/params` and `GET /qorechain/crossvm/v1/params` answer on the testnet. Mainnet answered HTTP 501 for them until chain v3.2.6; since it applied v3.2.6 (4 November 2026) all of those routes answered HTTP 200 on mainnet when checked that day. The AMM routes under `/qorechain/amm/v1/` (`pools`, `params`) answer on both networks.
* **Chain v3.2.7 routes.** On 7 November 2026 the testnet answered HTTP 200 for `GET /qorechain/pqc/v1/multisig/{address}` (`{"found":false,"multisig":null}` for an address with none), `GET /qorechain/stakingtier/v1/apr`, `GET /qorechain/stakingtier/v1/apr/{delegator}`, `GET /qorechain/stakingtier/v1/pool` and `GET /qorechain/svm/v1/cluster_info`; mainnet answered HTTP 501 for all of them except `/qorechain/stakingtier/v1/pool` (200) that day, before it applied v3.2.7. Since mainnet applied v3.2.7 (12 November 2026) these routes answer there: on 12 November 2026 `GET /qorechain/pqc/v1/multisig/{address}`, `GET /qorechain/stakingtier/v1/apr`, `GET /qorechain/stakingtier/v1/apr/{delegator}`, `GET /qorechain/stakingtier/v1/pool` and `GET /qorechain/svm/v1/cluster_info` answered HTTP 200 on mainnet (the multisig route returned `{"found":false,"multisig":null}` for an address with none; `cluster_info` reports `execution_enabled` false, as the SVM lane is still off). The textual sign doc query is a POST route: `GET /qorechain/pqc/v1/textual_sign_doc` answers 501, and a POST with an empty body answered 400 ("tx_bytes or tx_json is required") on mainnet, so it is routed. The `GET /qorechain/pqc/v1/evm_limits` and `GET /qorechain/svm/v1/params` routes (v3.2.8) answered 501 on mainnet. SDK 0.12.0 has no builder or typed client for any of the v3.2.7 routes.
* **Test tokens.** Three tokens with no value exist only on the testnet, as bank denominations named `erc20:<EIP-55 contract address>` (case-sensitive): fUSD (6 decimals), fETH (18) and fBTC (8). `GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata` lists them. Mainnet's only bank denomination is `uqor`. See [Testnet test tokens (Fest)](/api-reference/rest-grpc-endpoints#fest-tokens).
* **Modules switched on.** The `abstractaccount` module is enabled on the testnet and off on mainnet, EVM precompiles are active on the testnet (three on 27 October, four on 4 November) and none on mainnet, and QoreChain Native instantiate is open on the testnet.

## Default ports (the `localnet` preset) {#default-ports}

The `localnet` preset (chain id `qorechain-devnet`, no EVM chain id set) uses these
localhost ports, for a node on your own machine. Before SDK 0.12.0 every preset used
them by default; since 0.12.0 only `localnet` does. Override `endpoints` to point at
another node.

| Endpoint | Port | Purpose |
| --- | --- | --- |
| Cosmos REST (LCD) | `1317` | bank balances, account info, module queries |
| gRPC | `9090` | gRPC queries |
| Consensus RPC | `26657` | signing/broadcasting native txs, QoreChain Native reads |
| EVM JSON-RPC | `8545` | `eth_*` (and `qor_*` / precompiles on nodes that enable them) |
| EVM JSON-RPC (WS) | `8546` | EVM WebSocket subscriptions |
| SVM JSON-RPC | `8899` | Solana-compatible RPC |

```ts
const local = createClient({ network: "localnet" }); // a node on this machine
```

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

Select `mainnet` to target it. From SDK 0.12.0 the preset already carries the public
URLs, so the endpoints below are the defaults; pass `endpoints` only for your own node
(an SDK before 0.12.0 defaults to localhost and needs them):

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
