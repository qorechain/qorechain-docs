---
slug: /appendix/faq
title: FAQ
sidebar_label: FAQ
sidebar_position: 5
---

# Frequently Asked Questions

General questions about QoreChain, answered from the documentation. Each answer links to the authoritative page for full detail. For SDK-specific questions, see the [SDK FAQ](/sdk/faq).

### Is mainnet live?

Yes. QoreChain mainnet (chain `qorechain-vladi`, EVM chain ID 9801) has been live since 29 June 2026 and runs release v3.2.1. See [Networks](/appendix/networks) and [Connecting to Mainnet](/getting-started/connecting-to-mainnet).

### What are the chain IDs and EVM chain IDs?

Mainnet is Cosmos chain `qorechain-vladi` with EVM chain ID **9801** (hex `0x2649`); testnet is `qorechain-diana` with EVM chain ID **9800** (hex `0x2648`). See [Networks](/appendix/networks) for the full table.

### How are transaction fees distributed?

Collected fees are split **37% to validators, 30% burned, 20% to the community treasury, 10% to stakers, and 3% to light nodes**. The split applies to everything in the fee collector, which includes the epoch emission. See [Tokenomics](/architecture/tokenomics#fee-distribution).

### What is PRISM?

PRISM is the reinforcement-learning optimization layer embedded in the QoreChain Consensus Engine. It observes network metrics and proposes deterministic consensus-parameter adjustments under circuit-breaker safety controls. Today it runs in observation mode: no trained policy is loaded, so it does not change any parameter. See [PRISM Consensus Engine](/architecture/prism-consensus-engine).

### Is the cross-chain bridge live?

No. The bridge module is deployed, but all 37 chain configurations are pending, no bridge validators are registered and no IBC channels exist on either network. It is designed around 37 chain configurations and up to 8 IBC counterparties; treat the targets as design intent. See [Bridge Architecture](/architecture/bridge-architecture).

### How do I connect a wallet?

Use the official [QoreX](/qorex/overview) wallet, or add a QoreChain network to an EVM wallet using the EVM chain IDs (9801 mainnet, 9800 testnet). See [Wallet Setup](/getting-started/wallet-setup).

### How do I get testnet tokens?

Use the testnet faucet on the Dashboard. See [Dashboard Faucet](/dashboard/faucet) and [Connecting to Testnet](/getting-started/connecting-to-testnet).

### How do I run a node, validator, or light node?

For a full node, see [Running a Node](/developer-guide/running-a-node). For a validator, see [Running a Validator](/developer-guide/running-a-validator). For a light node, see [Light Node](/light-node/overview).

### What signature scheme does QoreChain use?

QoreChain uses a post-quantum hybrid scheme combining classical **secp256k1 (ECDSA)** with post-quantum **ML-DSA-87 (Dilithium-5)**. This hybrid scheme is required by default on the Cosmos transaction path, with enforcement mode governance-controlled. On the EVM lane the signature stays secp256k1, and an account must additionally hold a registered ML-DSA key and an open authorisation window (v3.2.0). See [Post-Quantum Security](/architecture/post-quantum-security).

### Why is my EVM transaction refused with "no open EVM authorisation window"?

Since v3.2.0 the EVM lane admits a transaction only from an account that has a registered post-quantum key and an open authorisation window. Open a window with a post-quantum-signed Cosmos-lane transaction, then retry. See [EVM authorisation window](/getting-started/first-transaction#evm-window).

### Which block time should I expect?

About 3.2 seconds on mainnet and about 1 second on the testnet (measured averages, October 2026). Block time is set by the validators' node configuration.

### Is xQORE available?

Not yet. The accounting module exists, but lock and unlock transactions are not wired into the live networks. See [Tokenomics](/architecture/tokenomics#x-xqore).

### Is the QOR supply fixed?

Genesis supply was 4,420,000,000 QOR. Staking emission is minted under a hard cumulative cap of 114,285,714 QOR, and burns remove tokens permanently. See [Tokenomics](/architecture/tokenomics#supply-and-emission).

### How do I build a rollup?

Use the QoreChain Rollup Development Kit. See [Rollups](/rollups/overview) and the [Rollup Development Kit](/architecture/rollup-development-kit) architecture reference.

### How do I build a dApp?

Use the [QoreChain SDK](/sdk/overview), the public SDK for building applications on QoreChain across its EVM, SVM, and CosmWasm execution environments.

### Where can I ask questions?

The QCAIA community bot answers questions on Discord ([discord.gg/qorechain](https://discord.gg/qorechain)) and Telegram ([t.me/QoreChainCommunity](https://t.me/QoreChainCommunity)). See [QCAIA Community Bot](/qcaia/overview).

## Related

* [Networks](/appendix/networks) — chain IDs, ports, and endpoints reference.
* [What is QoreChain](/introduction/what-is-qorechain) — the platform overview.
* [QCAIA Community Bot](/qcaia/overview) — ask questions on Discord and Telegram.
