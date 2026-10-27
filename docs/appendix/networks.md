---
slug: /appendix/networks
title: Networks
sidebar_label: Networks
sidebar_position: 4
---

# Networks

A consolidated reference for the QoreChain networks — chain identifiers, EVM chain IDs, token denomination, address prefixes, public endpoints, and standard service ports.

## Networks at a glance

| | Mainnet | Testnet |
|---|---|---|
| **Status** | Live | Active testnet |
| **Cosmos chain ID** | `qorechain-vladi` | `qorechain-diana` |
| **EVM chain ID (EIP-155)** | **9801** (hex `0x2649`) | **9800** (hex `0x2648`) |
| **Live since** | 7 June 2026 | 1 July 2026 (continuous since; no reset) |
| **Chain version** | v3.2.4 (applied at height 3,742,566, 23 October 2026, governance proposal 13). v3.2.3 was applied at height 3,662,051 on 20 October 2026 | v3.2.6 (applied at height 8,970,638, 27 October 2026; v3.2.5 was applied at height 8,890,800 on 26 October and v3.2.4 at 8,337,253 on 19 October) |
| **Block time (measured average)** | about 3.2 s | about 1.3 s |
| **Release manifest** | [download.qore.host/mainnet/latest.json](https://download.qore.host/mainnet/latest.json) | [download.qore.host/testnet/latest.json](https://download.qore.host/testnet/latest.json) |
| **Framework** | Cosmos SDK v0.53 | Cosmos SDK v0.53 |
| **Minimum gas price** | `0.1uqor` | `0.1uqor` |
| **Test tokens** | None | Fest tokens fUSD, fETH and fBTC (no value; see [Faucet](/dashboard/faucet#fest-tokens)) |
| **Connection guide** | [Connecting to Mainnet](/getting-started/connecting-to-mainnet) | [Connecting to Testnet](/getting-started/connecting-to-testnet) |

Both manifests are the source of truth for the release a fresh node should run. Both networks take coordinated upgrades through governance, so each manifest carries the `upgradeHeight` of its current release and a `minCompatible` equal to that release (3.2.4 on mainnet and 3.2.6 on the testnet, checked 27 October 2026). The testnet takes each release first: mainnet has run v3.2.4 since 23 October 2026, and governance proposal 14 would apply v3.2.5 on mainnet at height 3,906,833 (in its voting period at the time of writing), so a node joining mainnet must keep following its own manifest. Never copy a binary between the networks.

## Public endpoints {#public-endpoints}

All public endpoints are served over HTTPS.

| Service | Mainnet | Testnet |
|---|---|---|
| Consensus RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| Consensus WebSocket | `wss://rpc.qore.host/websocket` | `wss://rpc-testnet.qore.host/websocket` |
| Cosmos REST (LCD) | `https://api.qore.host` | `https://api-testnet.qore.host` |
| EVM JSON-RPC | `https://evm.qore.host` | `https://evm-testnet.qore.host` |
| EVM WebSocket | — | `wss://evm-ws-testnet.qore.host` |
| SVM JSON-RPC (Solana-compatible, read-only) | `https://svm.qore.host` | `https://svm-testnet.qore.host` |
| Block explorer | [explore.qore.network](https://explore.qore.network) | [explore.qore.network](https://explore.qore.network) (toggle to Testnet) |
| Downloads (binary / genesis / snapshot) | [download.qore.host](https://download.qore.host) | [download.qore.host/testnet/latest.json](https://download.qore.host/testnet/latest.json) |

:::note
The public SVM endpoints are **read-only** (transaction submission is disabled at the edge); run your own node for SVM writes. For heavy or production workloads, run your own node — see [Running a Node](/developer-guide/running-a-node). There is no public gRPC endpoint and no public mainnet EVM WebSocket. On the public EVM endpoints, `eth_getLogs` accepts at most 10,000 blocks per query and `txpool_content` is disabled (a self-hosted node serves the full namespace); see [eth_ Namespace](/api-reference/json-rpc-eth_-namespace).
:::

:::tip
If a script gets `403 Forbidden` from a public endpoint, set an explicit `User-Agent` header (Python's default `urllib` agent is blocked; `requests`, `curl`, Node and Go clients work as-is).
:::

:::caution SVM transaction lane currently disabled
Beyond the public endpoints being read-only, the SVM execution lane is **currently disabled network-wide for transaction submission** (since chain version v3.1.89, 22 August) — this includes submission via your own node, not just the public `svm.qore.host` / `svm-testnet.qore.host` endpoints. See [SVM Development](/developer-guide/svm-development) for details. Use the Cosmos or EVM interfaces until the lane reopens.
:::

## Token and addresses

| Item | Value |
|---|---|
| **Display denom** | QOR |
| **Base denom** | uqor (1 QOR = 10⁶ uqor) |
| **Decimals by interface** | Cosmos **6** (`uqor`) · EVM **18** (wei-style; 1 uqor = 10¹² wei) · SVM **9** (lamports; 1 uqor = 1,000 lamports) |
| **HD coin type (BIP-44)** | `118` |
| **Bech32 account prefix** | `qor` (e.g. `qor1...`) |
| **Bech32 validator prefix** | `qorvaloper` (e.g. `qorvaloper1...`) |

The three interfaces expose **one unified native-QOR balance**: the same key controls the same funds under its `qor1...` (Cosmos), `0x...` (EVM), and base58 (SVM) address forms.

## Standard ports

These are the standard service ports exposed by a QoreChain node you run yourself.

| Service | Port |
|---|---|
| Cosmos RPC | 26657 |
| P2P | 26656 |
| REST / API | 1317 |
| gRPC | 9090 |
| EVM JSON-RPC | 8545 |
| EVM JSON-RPC (WebSocket) | 8546 |
| SVM (Solana-compatible) JSON-RPC | 8899 |
| Prometheus metrics | 26660 |

## Endpoints and access

- For node connection, peers, genesis, and snapshots, follow [Connecting to Mainnet](/getting-started/connecting-to-mainnet) or [Connecting to Testnet](/getting-started/connecting-to-testnet).
- For programmatic access from an application, use the [QoreChain SDK](/sdk/overview), which resolves network configuration for you.
- The public **block explorer** is at [explore.qore.network](https://explore.qore.network); the Dashboard at [dashboard.qorechain.io](https://dashboard.qorechain.io) includes its own explorer view, and the testnet **Faucet** is reachable there (see [Dashboard Faucet](/dashboard/faucet)).
- These docs are published at [docs.qorechain.io](https://docs.qorechain.io).

## Add to MetaMask

To add a QoreChain network to an EVM wallet such as MetaMask, use the EVM chain IDs above — **9801** for mainnet with `https://evm.qore.host`, and **9800** for testnet with `https://evm-testnet.qore.host` — with `https://explore.qore.network` as the block-explorer URL. See [Wallet Setup](/getting-started/wallet-setup) for the step-by-step walkthrough.

## Related

* [Connecting to Mainnet](/getting-started/connecting-to-mainnet) — join the live `qorechain-vladi` network.
* [Connecting to Testnet](/getting-started/connecting-to-testnet) — join the Diana testnet.
* [Exchange & Integrator Guide](/developer-guide/exchange-integration) — deposits, withdrawals, and node operations for integrators.
* [Chain Parameters](/appendix/chain-parameters) — canonical chain configuration.
* [SDK Overview](/sdk/overview) — resolve network configuration from code.
