---
slug: /introduction/what-is-qorechain
title: What is QoreChain?
sidebar_label: What is QoreChain?
sidebar_position: 1
---

# What is QoreChain?

QoreChain is the first Layer 1 blockchain built with post-quantum cryptography at genesis, AI-native transaction processing, and a triple-VM runtime that executes EVM, CosmWasm, and SVM programs on a single chain. Rather than retrofitting quantum resistance onto an existing protocol, QoreChain was designed from the ground up to be secure against both classical and quantum adversaries while delivering the developer experience and interoperability expected of a modern general-purpose blockchain.

Mainnet (`qorechain-vladi`, EVM chain ID **9801**) has been live since 7 June 2026 and runs chain version **v3.1.80**. A public testnet (`qorechain-diana`, EVM chain ID **9800**) runs in parallel for staging and integration testing. The native token is **QOR** (display) / **uqor** (base, 10^6), with Bech32 prefixes `qor` for accounts and `qorvaloper` for validators. The chain is built on the Cosmos SDK v0.53.

## Core Innovations

### 1. Post-Quantum Cryptography

QoreChain uses NIST-standardized ML-DSA-87 (Dilithium-5) for digital signatures, ML-KEM-1024 for key encapsulation, and SHAKE-256 as the default application hash, providing security against attacks from both classical and quantum computers. Hybrid signatures are now **required by default** on the cosmos transaction path: every cosmos-path transaction must carry a Dilithium-5 (ML-DSA-87) signature as a transaction extension *alongside* the classical secp256k1 (ECDSA) signature. Classical-only cosmos transactions are rejected — the downgrade path is closed (only genesis gentxs and PQC key registration/migration transactions are exempt). EVM transactions are unaffected: they use a separate `eth_secp256k1` ante path (the QoreChain EVM Engine path) and do not require the hybrid signature. Three governance-controlled enforcement modes (disabled, optional, required) remain available, but the current network default is **required**. An algorithm agility framework ensures that signature schemes can be upgraded via governance proposals as cryptographic standards evolve.

### 2. AI-Native Processing

An on-chain reinforcement learning agent (PPO MLP with 73,733 parameters) runs deterministic fixed-point inference directly in the block lifecycle, dynamically tuning consensus parameters such as block time, gas limits, and validator pool weights. This optimization layer is branded **PRISM** (Policy-driven Reinforcement-learning for Intelligent State Machines). Statistical isolation forest anomaly detection and multi-dimensional risk scoring evaluate every transaction in the ante handler chain, flagging fraudulent patterns before execution. Dynamic fee optimization adjusts base fees based on real-time network conditions. All AI inference is fully deterministic across validators — identical inputs produce identical outputs with no external oracle dependency.

### 3. Triple-VM Runtime

QoreChain is the only Layer 1 that natively runs three virtual machines within one consensus:

* **EVM** — Full Ethereum compatibility with EIP-1559 gas pricing and JSON-RPC on port 8545. Deploy Solidity contracts using standard tooling (Hardhat, Foundry, Remix).
* **CosmWasm** — WebAssembly smart contracts written in Rust with full lifecycle support (instantiate, execute, query, migrate).
* **SVM** — BPF program deployment and execution with a Solana-compatible JSON-RPC server on port 8899. Existing Solana clients and tooling work out of the box.

Cross-VM messaging enables all three runtimes to communicate: EVM contracts call CosmWasm via precompile, CosmWasm contracts call EVM via custom messages, and SVM programs participate through async event-based bridging.

### 4. Fixed-Supply Tokenomics

Ten distinct burn channels (transaction fees, governance penalties, slashing, bridge fees, spam deterrence, epoch excess, manual burns, contract callbacks, cross-VM fees, and rollup creation burns) feed a central burn accounting module. Collected fees are split **37% to validators, 30% permanently burned, 20% to treasury, 10% to stakers, and 3% to light nodes**. The xQORE governance staking mechanism lets users lock QOR for doubled governance weight with PvP rebase redistribution — early exit penalties are redistributed to remaining holders, rewarding conviction.

QoreChain uses a **fixed-supply** model with a finite emission budget rather than perpetual percentage inflation. Total supply is fixed at **4,500,000,000 QOR**, of which **80,000,000 (1.78%)** was burned at TGE. Staking rewards are paid from a dedicated **590,000,000 QOR** pool on a multi-year schedule:

| Period | Target APY | Emission budget |
| --- | --- | --- |
| Year 1 | 8–12% | 127,500,000 QOR |
| Year 2 | 6–10% | 106,250,000 QOR |
| Years 3–4 | 5–8% | 85,000,000 QOR per year |
| Year 5+ | Governance-determined | ~186,000,000 QOR remaining |

Combined with the ten burn channels, the fixed-supply design converges toward net-deflationary behavior as transaction volume grows.

### 5. Cross-Chain Connectivity

QoreChain is designed to connect to a broad set of blockchain ecosystems through two complementary protocols: native IBC and the QoreChain Bridge (QCB). The bridge layer defines **37 QCB chain configurations (including QoreChain itself as a native loopback)** plus **8 IBC channels** — covering **36 external chains** in total. The cross-chain layer is currently in **testnet / pending status and is not yet production**; the figures below describe the targeted coverage.

* **8 IBC channels** — Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon, and Injective. Pre-configured relayer templates with client updates, misbehaviour detection, and automatic packet clearing.
* **37 QCB configs (36 external chains + QoreChain loopback)** — each endpoint is designed to include per-type address validation, configurable confirmation depth, circuit breaker volume caps, and PQC-signed validator attestations. The targeted external chains are:
  * **Baseline (10):** Ethereum, Solana, TON, BSC, Avalanche, Polygon, Arbitrum, Optimism, Base, Sui
  * **EVM-family (14):** zkSync Era, Linea, Scroll, Blast, Mantle, Hyperliquid, Berachain, Sonic, Sei, Monad, Plasma, Filecoin FVM, Cronos, Kaia
  * **Non-EVM (5):** Starknet, XRP Ledger, Stellar, Hedera, Algorand
  * **Pending (7):** NEAR, Bitcoin, Cardano, Polkadot, Tezos, Tron, Aptos

The architecture spans every major chain type — EVM, Solana (SVM), Move-based (Sui, Aptos), Cosmos/IBC, UTXO, and other non-EVM families — to provide broad interoperability across the ecosystem.

### 6. Rollup Development Kit

The `x/rdk` module is a protocol-native framework for deploying application-specific rollups directly on the QoreChain host chain. Rollup support is delivered as a host-chain framework; specific deployment claims should be treated as targeted capabilities. Four settlement paradigms are supported:

* **Optimistic** — Fraud proofs with a 7-day challenge window, auto-finalized by EndBlocker.
* **ZK (Zero-Knowledge)** — SNARK or STARK proofs with instant finality on verification.
* **Based** — L1-sequenced transactions with finality in approximately 2 host blocks.
* **Sovereign** — Independent chains using QoreChain exclusively for data availability.

Five preset profiles (**defi, gaming, nft, enterprise, custom**) enable one-click deployment with pre-configured settlement modes, block times, VM choices, DA backends, and gas models. A native DA router provides SHA-256 committed blob storage with configurable retention and automatic pruning. The PRISM consensus module provides advisory methods for AI-assisted rollup configuration.

### 7. Account and Gas Abstraction

Smart accounts with three programmable types (multisig, social recovery, session-based) support session keys with granular permissions and expiry, per-account spending rules, and denom allowlists. This enables wallet UX patterns impossible with standard accounts: dApp session keys for mobile, social recovery as a first-class account type, and programmable spend limits enforced at consensus. Gas abstraction removes the requirement to hold native QOR for fees — users can pay in any accepted IBC-transferred token such as USDC or ATOM.

## Ecosystem

QoreChain ships with **45+ genesis modules including 20+ custom modules**, covering security (pqc), AI (ai, reputation, rlconsensus), consensus (qca), virtual machines (vm, svm, crossvm), tokenomics (burn, xqore, inflation), liquidity (amm), licensing (license), bridges (bridge, babylon, multilayer), governance extensions (abstractaccount, fairblock, gasabstraction), and rollups (rdk). Recent additions include `x/amm` for AMM / on-chain liquidity and `x/license` for chain licensing. The chain follows an open-core architecture — the protocol layer is fully open source, with optional proprietary extensions for enterprise deployments.

## Related

* [Architecture Overview](/introduction/architecture-overview) — how the layers fit together end to end.
* [Key Features](/introduction/key-features) — the capability highlights at a glance.
* [PRISM Consensus Engine](/architecture/prism-consensus-engine) — the AI-assisted consensus at the core.
* [Tokenomics](/architecture/tokenomics) — QOR supply, burns, rebases, and emissions.
* [Quickstart](/getting-started/quickstart) — spin up a local node and start building.
