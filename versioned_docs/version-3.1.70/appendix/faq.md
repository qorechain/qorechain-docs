---
slug: /appendix/faq
title: FAQ
sidebar_label: FAQ
sidebar_position: 5
---

# Frequently Asked Questions

General questions about QoreChain, answered from the documentation. Each answer links to the authoritative page for full detail. For SDK-specific questions, see the [SDK FAQ](/sdk/faq).

### Is mainnet live?

Yes. QoreChain mainnet (chain `qorechain-vladi`, EVM chain ID 9801) has been live since 7 June 2026. See [Networks](/appendix/networks) and [Connecting to Mainnet](/getting-started/connecting-to-mainnet).

### What are the chain IDs and EVM chain IDs?

Mainnet is Cosmos chain `qorechain-vladi` with EVM chain ID **9801** (hex `0x2649`); testnet is `qorechain-diana` with EVM chain ID **9800** (hex `0x2648`). See [Networks](/appendix/networks) for the full table.

### How are transaction fees distributed?

Collected fees are split **37% to validators, 30% burned, 20% to the community treasury, 10% to stakers, and 3% to light nodes**. See [Tokenomics](/architecture/tokenomics).

### What is PRISM?

PRISM is the reinforcement-learning optimization layer embedded in the QoreChain Consensus Engine. It observes network metrics and proposes deterministic consensus-parameter adjustments under circuit-breaker safety controls. See [PRISM Consensus Engine](/architecture/prism-consensus-engine).

### Is the cross-chain bridge live?

The cross-chain bridge is currently in testnet and pending — it is not yet a production system. It is designed around 37 QCB chain configurations and 8 IBC channels; treat the targets as design intent rather than live mainnet guarantees. See [Bridge Architecture](/architecture/bridge-architecture).

### How do I connect a wallet?

Set up a wallet and add a QoreChain network using the EVM chain IDs (9801 mainnet, 9800 testnet). See [Wallet Setup](/getting-started/wallet-setup).

### How do I get testnet tokens?

Use the testnet faucet on the Dashboard. See [Dashboard Faucet](/dashboard/faucet) and [Connecting to Testnet](/getting-started/connecting-to-testnet).

### How do I run a node, validator, or light node?

For a full node, see [Running a Node](/developer-guide/running-a-node). For a validator, see [Running a Validator](/developer-guide/running-a-validator). For a light node, see [Light Node](/light-node/overview).

### What signature scheme does QoreChain use?

QoreChain uses a hybrid scheme combining classical **secp256k1 (ECDSA)** with post-quantum **ML-DSA-87 (Dilithium-5)**. See [Post-Quantum Security](/architecture/post-quantum-security).

### How do I build a rollup?

Use the QoreChain Rollup Development Kit. See [Rollups](/rollups/overview) and the [Rollup Development Kit](/architecture/rollup-development-kit) architecture reference.

### How do I build a dApp?

Use the [QoreChain SDK](/sdk/overview), the public SDK for building applications on QoreChain across its EVM, SVM, and CosmWasm execution environments.

### Where can I ask questions?

The QCAIA community bot answers questions on Discord ([discord.gg/qorechain](https://discord.gg/qorechain)) and Telegram ([t.me/QoreChainCommunity](https://t.me/QoreChainCommunity)). See [QCAIA Community Bot](/qcaia/overview).
