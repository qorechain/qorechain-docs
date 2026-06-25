---
slug: /appendix/networks
title: Networks
sidebar_label: Networks
sidebar_position: 4
---

# Networks

A consolidated reference for the QoreChain networks — chain identifiers, EVM chain IDs, token denomination, address prefixes, and standard service ports. For the full node-connection details (public endpoints, seeds, and genesis), follow the connection guides linked below; operators obtain the current public endpoints, seeds, and genesis from the official release.

## Networks at a glance

| | Mainnet | Testnet |
|---|---|---|
| **Status** | Live | Active testnet |
| **Cosmos chain ID** | `qorechain-vladi` | `qorechain-diana` |
| **EVM chain ID (EIP-155)** | **9801** (hex `0x2649`) | **9800** (hex `0x2648`) |
| **Live since** | 7 June 2026, 23:59 UTC | — |
| **Chain version** | v3.1.70 | v3.1.70 |
| **Framework** | Cosmos SDK v0.53 | Cosmos SDK v0.53 |
| **Connection guide** | [Connecting to Mainnet](/getting-started/connecting-to-mainnet) | [Connecting to Testnet](/getting-started/connecting-to-testnet) |

## Token and addresses

| Item | Value |
|---|---|
| **Display denom** | QOR |
| **Base denom** | uqor (1 QOR = 10⁶ uqor) |
| **Bech32 account prefix** | `qor` (e.g. `qor1...`) |
| **Bech32 validator prefix** | `qorvaloper` (e.g. `qorvaloper1...`) |

## Standard ports

These are the standard service ports exposed by a QoreChain node. The actual public endpoint hostnames are published with the official release — see the connection guides above.

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

QoreChain does not publish fixed public RPC/REST/EVM hostnames in this reference. Instead:

- For node connection, seeds, and genesis, follow [Connecting to Mainnet](/getting-started/connecting-to-mainnet) or [Connecting to Testnet](/getting-started/connecting-to-testnet). Operators obtain the current public endpoints, seeds, and genesis from the official release.
- For programmatic access from an application, use the [QoreChain SDK](/sdk/overview), which resolves network configuration for you.
- The on-chain **Explorer** is available through the Dashboard at [dashboard.qorechain.io](https://dashboard.qorechain.io), and the testnet **Faucet** is also reachable there (see [Dashboard Faucet](/dashboard/faucet)).
- These docs are published at [docs.qorechain.io](https://docs.qorechain.io).

## Add to MetaMask

To add a QoreChain network to an EVM wallet such as MetaMask, use the EVM chain IDs above — **9801** for mainnet and **9800** for testnet — together with the EVM JSON-RPC endpoint for the network you are connecting to. See [Wallet Setup](/getting-started/wallet-setup) for the step-by-step walkthrough.
