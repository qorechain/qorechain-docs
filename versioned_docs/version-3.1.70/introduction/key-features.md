---
slug: /introduction/key-features
title: Key Features
sidebar_label: Key Features
sidebar_position: 3
---

# Key Features

The following table lists every major feature in QoreChain, organized by the release phase in which it was introduced. The current chain version is **v3.1.70**, with mainnet (`qorechain-vladi`, EVM chain ID 9801) live since 7 June 2026 and a parallel testnet (`qorechain-diana`, EVM chain ID 9800).

| Feature                    | Introduced in       | Description                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PQC Hybrid Signatures      | v1.1.0 (Security)   | Dual signatures on every transaction: a classical secp256k1 (ECDSA) signature paired with ML-DSA-87 (Dilithium-5). Three governance-controlled enforcement modes: disabled (classical only), optional (PQC verified if present, classical fallback), and required (both signatures mandatory). Seamless wallet onboarding via TX extension auto-registration.                                                                              |
| SHAKE-256 Hash Foundation  | v1.1.0 (Security)   | SHA-3 family extendable-output function (XOF) utility layer for future post-quantum Merkle tree replacement. Provides variable-length hashing, fixed 32-byte output, Merkle internal node concatenation, and domain-separated hashing — all in pure Go with no FFI dependency.                                                                                                                 |
| TEE and FL Interfaces      | v1.1.0 (Security)   | Production-grade interface specifications for Trusted Execution Environment attestation (SGX, TDX, SEV-SNP, ARM CCA) and Federated Learning coordination (FedAvg, FedProx, SCAFFOLD aggregation methods). Enables hardware-enclave AI inference and privacy-preserving distributed model training with cryptographic guarantees.                                                                |
| On-Chain RL Consensus (PRISM) | v1.0.0 (Genesis) | A Go-native fixed-point MLP (73,733 parameters) runs PPO inference directly in the block lifecycle. The PRISM optimization layer dynamically tunes block time, gas limits, and validator pool weights without external oracles. Deterministic Taylor series math ensures identical results across all validators. Four operating modes: shadow, conservative, autonomous, and paused. Circuit breaker protection for safety. |
| Triple-Pool Composite PoS  | v1.0.0 (Genesis)    | Validators are classified into RPoS (reputation-weighted), DPoS (delegation-weighted), and PoS (standard) pools every 1,000 blocks on the QoreChain Consensus Engine. Pool-weighted sortition diversifies block production beyond pure stake dominance. Custom bonding curve factors in self-bonded stake, loyalty duration, reputation quality, and protocol phase.                            |
| QDRW Governance            | v1.0.0 (Genesis)    | Quadratic Delegation with Reputation Weighting. Voting power uses a square-root function dampened by a sigmoid reputation multiplier, preventing whale capture while rewarding long-term honest participation. A 100x stake advantage yields approximately 10x voting power. xQORE holdings double voting weight.                                                                               |
| Burn Engine                | v1.0.0 (Genesis)    | Ten distinct burn channels: transaction fees, governance penalties, slashing, bridge fees, spam deterrence, epoch excess, manual burns, contract callbacks, cross-VM fees, and rollup creation burns. Collected fees are split **37% to validators, 30% permanently burned, 20% to treasury, 10% to stakers, and 3% to light nodes**.                                                            |
| xQORE Staking              | v1.0.0 (Genesis)    | Lock QOR to mint xQORE at a 1:1 ratio for doubled governance weight in QDRW votes. Graduated exit penalties (50% under 30 days, 35% at 30-90 days, 15% at 90-180 days, 0% after 180 days) are redistributed to remaining holders via PvP rebase — rewarding conviction and penalizing short-term capital.                                                                                      |
| Fixed-Supply Emissions     | v1.0.0 (Genesis)    | A fixed total supply of 4,500,000,000 QOR (80,000,000 burned at TGE) with a finite staking-rewards budget of 590,000,000 QOR: Year 1 at 8–12% APY (127,500,000 QOR), Year 2 at 6–10% APY (106,250,000 QOR), Years 3–4 at 5–8% APY (85,000,000 QOR per year), and Year 5+ governance-determined (~186,000,000 QOR remaining). Combined with the burn engine, QOR converges toward net-deflationary behavior as transaction volume increases. |
| EVM Runtime                | v1.0.0 (Genesis)    | Full Ethereum compatibility with EIP-1559 gas pricing, JSON-RPC on port 8545 (`eth_`, `web3_`, `net_`, `txpool_`, `qor_` namespaces), and standard tooling support (Hardhat, Foundry, Remix). Deploy and interact with Solidity contracts using existing Ethereum workflows.                                                                                                                    |
| CosmWasm Runtime           | v1.0.0 (Genesis)    | WebAssembly smart contract engine for Rust-based contracts. Full lifecycle support: instantiate, execute, query, and migrate. Contracts run in a sandboxed Wasm environment with deterministic execution.                                                                                                                                                                                       |
| SVM Runtime                | v1.0.0 (Genesis)    | BPF program deployment and execution via a Rust-backed executor. Solana-compatible JSON-RPC server on port 8899 supports `getAccountInfo`, `getBalance`, `getSlot`, and more. Existing Solana clients and tooling work without modification.                                                                                                                                                    |
| Cross-VM Bridge            | v1.0.0 (Genesis)    | Seamless interoperability across all three VMs. EVM contracts call CosmWasm via precompile; CosmWasm contracts call EVM via custom messages; SVM programs participate through async event-based bridging. Synchronous EVM-CosmWasm calls and asynchronous SVM messaging within a single chain.                                                                                                  |
| Cross-Chain Connectivity   | v1.2.0 (Interop)    | Eight IBC channels (Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon, Injective) plus **37 QCB configs covering 36 external chains** (including QoreChain itself as a native loopback). PQC-signed validator attestations, per-chain confirmation depths, and circuit breaker volume caps. Currently in testnet / pending status — not yet production.                               |
| BTC Restaking              | v1.2.0 (Interop)    | Babylon Protocol integration for Bitcoin finality guarantees. Validators register BTC staking positions (minimum 100,000 satoshis). QoreChain epoch state roots are periodically checkpointed to Bitcoin via IBC-relayed Babylon epochs, providing a secondary finality layer backed by BTC hashrate.                                                                                           |
| Account Abstraction        | v1.2.0 (Interop)    | Programmable smart accounts at the protocol layer (similar to ERC-4337). Three account types: multisig, social recovery, and session-based. Session keys with granular permissions and expiry, per-account daily and per-transaction spending rules, scoped denom allowlists, and automatic rule enforcement at consensus.                                                                      |
| MEV Protection             | v1.2.0 (Interop)    | FairBlock threshold identity-based encryption (tIBE) framework for encrypted mempools. Transactions are cryptographically opaque to block proposers until after inclusion, eliminating front-running and sandwich attacks. The FairBlockDecorator ante handler is wired and ready; tIBE threshold decryption activates after key ceremony deployment.                                           |
| Gas Abstraction            | v1.2.0 (Interop)    | Multi-token gas payment removes the requirement to hold native QOR for transaction fees. Users can pay in accepted IBC-transferred tokens: ibc/USDC at a 1:1 rate and ibc/ATOM at a 10:1 rate. The GasAbstractionDecorator validates and converts non-native fee denoms before the standard fee deduction.                                                                                      |
| 5-Lane Prioritization      | v1.2.0 (Interop)    | Block space is statically partitioned into five priority lanes: PQC (priority 100, 15% space), MEV (90, 20%), AI (80, 15%), Default (50, 40%), and Free (10, 10%). Security-critical transactions can never be crowded out by high-volume standard traffic.                                                                                                                                     |
| On-Chain Liquidity (AMM)   | v1.2.0 (Interop)    | Native automated market maker (`x/amm`) provides on-chain liquidity pools and swaps at the protocol layer.                                                                                                                                                                                                                                                                                     |
| RDK Rollups                | v1.3.0 (Rollups)    | Rollup Development Kit with four settlement paradigms (optimistic, zk, based, sovereign), five preset profiles (defi, gaming, nft, enterprise, custom), native DA router with SHA-256 blob storage and automatic pruning, bank escrow lifecycle with configurable creation burn rate, EndBlocker auto-finalization, and PRISM-assisted configuration via the consensus module. Rollup capabilities are delivered as a host-chain framework.                          |
| Chain Licensing            | v1.3.0 (Rollups)    | The `x/license` module provides protocol-native chain licensing.                                                                                                                                                                                                                                                                                                                              |

## Version History

<details>

<summary>v1.0.0 — Genesis release</summary>

Established the core protocol with post-quantum cryptography (Dilithium-5, ML-KEM-1024), the PRISM on-chain reinforcement learning consensus layer, triple-VM runtime (EVM, CosmWasm, SVM) with cross-VM messaging, fixed-supply tokenomics engine (burn, xQORE, finite emission budget), Triple-Pool Composite PoS validator selection, QDRW quadratic governance, and the AI transaction processing pipeline.

</details>

<details>

<summary>v1.1.0 — Security hardening release</summary>

Introduced hybrid signature architecture pairing a classical secp256k1 (ECDSA) signature with ML-DSA-87, with three governance-controlled enforcement modes, SHAKE-256 post-quantum hash foundation for future Merkle tree replacement, and production-grade interface specifications for TEE attestation (SGX, TDX, SEV-SNP, ARM CCA) and federated learning coordination (FedAvg, FedProx, SCAFFOLD).

</details>

<details>

<summary>v1.2.0 — Interoperability and UX release</summary>

Added cross-chain connectivity (8 IBC channels + 37 QCB configs covering 36 external chains, currently in testnet/pending), BTC restaking via Babylon Protocol, smart account abstraction with session keys and social recovery, FairBlock MEV protection framework, multi-token gas abstraction, on-chain liquidity (`x/amm`), and 5-lane block space prioritization.

</details>

<details>

<summary>v1.3.0 — Rollup ecosystem release</summary>

Shipped the Rollup Development Kit with four settlement paradigms (optimistic, zk, based, sovereign), five preset deployment profiles (defi, gaming, nft, enterprise, custom), a native DA router, bank escrow lifecycle management, EndBlocker-driven auto-finalization, PRISM-assisted rollup configuration, and chain licensing (`x/license`). Deep integration with the multilayer architecture module for automatic sidechain registration and state anchoring.

</details>
