---
slug: /introduction/what-is-qorechain
title: What is QoreChain?
sidebar_label: What is QoreChain?
sidebar_position: 1
---

# What is QoreChain?

QoreChain is the first Layer 1 blockchain built with post-quantum cryptography at genesis, AI-native transaction processing, and a triple-VM runtime that executes EVM, QoreChain Native (the CosmWasm runtime), and SVM programs on a single chain. Rather than retrofitting quantum resistance onto an existing protocol, QoreChain was designed from the ground up to be secure against both classical and quantum adversaries while delivering the developer experience and interoperability expected of a modern general-purpose blockchain.

Mainnet (`qorechain-vladi`, EVM chain ID **9801**) has been live since 7 June 2026 and runs chain release **v3.2.4** (applied by governance proposal 13 at height 3,742,566 on 23 October 2026). A public testnet (`qorechain-diana`, EVM chain ID **9800**, running v3.2.4 since 19 October 2026) runs in parallel for staging and integration testing. The native token is **QOR** (display) / **uqor** (base, 10^6), with Bech32 prefixes `qor` for accounts and `qorvaloper` for validators. The chain is built on the Cosmos SDK v0.53.

## Core Innovations

### 1. Post-Quantum Cryptography

QoreChain uses NIST-standardized ML-DSA-87 (Dilithium-5) for digital signatures, ML-KEM-1024 for key encapsulation, and SHAKE-256 as the default application hash, providing security against attacks from both classical and quantum computers. Hybrid signatures are now **required by default** on the cosmos transaction path: every cosmos-path transaction must carry a Dilithium-5 (ML-DSA-87) signature as a transaction extension *alongside* the classical secp256k1 (ECDSA) signature. Classical-only cosmos transactions are rejected — the downgrade path is closed (only genesis gentxs, PQC key registration/migration transactions, and an unjail from an operator account that has no registered key are exempt). The EVM lane keeps the standard `eth_secp256k1` signature, so Ethereum tooling signs unchanged, but since v3.2.0 an EVM transaction is admitted only from an account that has a registered ML-DSA-87 key and an open **EVM authorisation window** — a bounded permission opened with a post-quantum-signed Cosmos-lane message (see [EVM authorisation window](/getting-started/first-transaction#evm-window)). A classical key alone can no longer move funds on the EVM lane. Three governance-controlled enforcement modes (disabled, optional, required) remain available, but the current network default is **required**. An algorithm agility framework ensures that signature schemes can be upgraded via governance proposals as cryptographic standards evolve.

### 2. AI-Native Processing

**PRISM** (Policy-driven Reinforcement-learning for Intelligent State Machines) is an on-chain reinforcement-learning layer — a fixed-point PPO policy network of 73,733 parameters with circuit-breaker safety limits — built into the block lifecycle. It currently runs in observation mode: the live networks record observations and rewards every 10 blocks, and no trained policy is loaded, so no consensus parameter is being tuned by it today. Statistical isolation forest anomaly detection and multi-dimensional risk scoring evaluate every transaction in the ante handler chain, flagging fraudulent patterns before execution. Dynamic fee optimization adjusts base fees based on real-time network conditions. All on-chain AI inference is designed to be fully deterministic across validators — identical inputs produce identical outputs with no external oracle dependency.

### 3. Triple-VM Runtime

QoreChain is the only Layer 1 that natively runs three virtual machines within one consensus:

* **EVM** — Full Ethereum compatibility with EIP-1559 gas pricing and JSON-RPC on port 8545. Deploy Solidity contracts using standard tooling (Hardhat, Foundry, Remix).
* **QoreChain Native** — WebAssembly smart contracts written in Rust with full lifecycle support (instantiate, execute, query, migrate).
* **SVM** — BPF program deployment and execution with a Solana-compatible JSON-RPC server on port 8899. Existing Solana clients and tooling work out of the box.

Cross-VM messaging enables all three runtimes to communicate: EVM contracts call QoreChain Native via precompile (once that precompile is activated), QoreChain Native contracts call EVM via custom messages, and SVM programs participate through async event-based bridging. Today only the EVM runtime accepts transactions on the live networks: QoreChain Native code upload and instantiation are disabled, the SVM transaction lane is disabled, no EVM precompile is active, and the cross-VM call message is switched off on mainnet.

### 4. Capped-Emission Tokenomics

The burn engine defines **twelve burn sources** (gas fees, contract creation, AI service fees, bridge fees, treasury buyback, failed transactions, xQORE penalties, automated buyback, the TGE burn, rollup creation, transaction-count milestones and AMM) feeding a central burn accounting module; on mainnet only the gas-fee and failed-transaction channels have recorded burns so far. Everything that enters the fee collector is split **37% to validators, 30% permanently burned, 20% to treasury, 10% to stakers, and 3% to light nodes**. The split applies to transaction fees and to the epoch emission alike. The xQORE governance-staking design lets users lock QOR for doubled governance weight, with early-exit penalties redistributed to remaining holders; the lock and unlock transactions are not yet wired into the live networks.

QOR has a **finite supply path**: **4,420,000,000 QOR** at genesis (4,500,000,000 QOR planned, of which 80,000,000 QOR was burned at the token generation event before genesis), staking emission minted under a **hard cumulative cap of 590,000,000 QOR**, and the burn engine, which permanently removes tokens. The `x/inflation` module mints a fixed amount per 43,200-block epoch (86,000 QOR since governance proposal 10 in October 2026) until the cap is reached, after which rewards come from transaction fees alone. See [Tokenomics](/architecture/tokenomics#supply-and-emission) for the live figures and the schedule.

### 5. Cross-Chain Connectivity

QoreChain is designed to connect to a broad set of blockchain ecosystems through two complementary protocols: native IBC and the QoreChain Bridge (QCB). The bridge layer defines **37 chain configurations (36 external chains plus Injective, reached over IBC)** and up to **8 IBC counterparties**. The cross-chain layer is **not live on either network**: all 37 chain configurations are in `pending` status and no IBC channel is open. The figures below describe the targeted coverage.

* **Up to 8 IBC counterparties** — Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon, and Injective. Pre-configured relayer templates with client updates, misbehaviour detection, and automatic packet clearing.
* **37 QCB chain configurations (36 external chains plus Injective over IBC)** — each endpoint is designed to include per-type address validation, configurable confirmation depth, circuit breaker volume caps, and PQC-signed validator attestations. The targeted external chains are:
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

Five preset profiles (**defi, gaming, nft, enterprise, custom**) enable one-click deployment with pre-configured settlement modes, block times, VM choices, DA backends, and gas models. A native DA router provides SHAKE-256 committed blob storage with configurable retention and automatic pruning. The PRISM consensus module provides advisory methods for AI-assisted rollup configuration. No rollup has been created on the live networks yet.

### 7. Account and Gas Abstraction

Smart accounts with three programmable types (multisig, social recovery, session-based) support session keys with granular permissions and expiry, per-account spending rules, and denom allowlists. This enables wallet UX patterns impossible with standard accounts: dApp session keys for mobile, social recovery as a first-class account type, and programmable spend limits. Smart-account and linked-wallet features are implemented but currently **switched off** on both networks (`abstractaccount.enabled = false`; check `GET /qorechain/abstractaccount/v1/config`). Gas abstraction is designed to let users pay fees in an accepted non-native token (the configuration lists `ibc/USDC` and `ibc/ATOM`); no IBC channel is open yet, so fees are currently paid in QOR.

## Ecosystem

QoreChain ships with **48 genesis modules, 20 of them QoreChain-specific**, covering security (pqc), AI (ai, reputation, rlconsensus), consensus (qca), virtual machines (vm, svm, crossvm), tokenomics (burn, xqore, inflation), liquidity (amm), licensing (license), bridges (bridge, babylon, multilayer), governance extensions (abstractaccount, fairblock, gasabstraction), and rollups (rdk). Recent additions include `x/amm` for AMM / on-chain liquidity and `x/license` for chain licensing. The chain follows an open-core architecture — the protocol layer is fully open source, with optional proprietary extensions for enterprise deployments.

## Related

* [Architecture Overview](/introduction/architecture-overview) — how the layers fit together end to end.
* [Key Features](/introduction/key-features) — the capability highlights at a glance.
* [PRISM Consensus Engine](/architecture/prism-consensus-engine) — the AI-assisted consensus at the core.
* [Tokenomics](/architecture/tokenomics) — QOR supply, burns, rebases, and emissions.
* [Quickstart](/getting-started/quickstart) — spin up a local node and start building.
