---
slug: /appendix/glossary
title: Glossary
sidebar_label: Glossary
sidebar_position: 1
---

# Glossary

Alphabetical reference of terms, abbreviations, and acronyms used throughout the QoreChain documentation.

---

**AMM** — Automated Market Maker. QoreChain's native on-chain liquidity module (`x/amm`) providing constant-product pools, swaps, and liquidity provisioning directly at the protocol level, without an external smart-contract deployment. See [AMM](/architecture/amm).

**Authorisation window (EVM)** — A bounded permission (blocks, transaction count, total value) opened with a post-quantum-signed Cosmos-lane message that an EVM-lane transaction must fall inside since v3.2.0. See [EVM authorisation window](/getting-started/first-transaction#evm-window).

**BPF** — Berkeley Packet Filter. The bytecode format used by the SVM runtime to execute on-chain programs. Programs are compiled to BPF before deployment.

**Chain License** — An on-chain license record managed by the `x/license` module. Chain licenses gate access to specific protocol capabilities and let operators register, verify, and manage licensing entitlements on-chain. See [Chain Licensing](/architecture/chain-licensing).

**Circuit breaker** — The Cosmos SDK mechanism that switches individual message types off network-wide; the current list is queryable at `/cosmos/circuit/v1/disable_list`. See [Chain Parameters](/appendix/chain-parameters#circuit-breaker).

**CLFB** — Cross-Layer Fee Bundling. A single fee payment on the source layer that covers execution across the layers in a cross-layer path (the `cross_layer_fee_bundling` parameter of `x/multilayer`). See [Multilayer Architecture](/architecture/multilayer-architecture).

**CPI** — Cross-Program Invocation. A mechanism in the SVM runtime that allows one deployed program to call another program within the same transaction context.

**CPoS** — Composite Proof-of-Stake. QoreChain's consensus classification design that groups validators into three pools (RPoS, DPoS, PoS) based on reputation and delegation. Each pool has distinct weights in the proposer selection algorithm. Implemented in `x/qca` but not yet active in block production.

**DA** — Data Availability. The guarantee that transaction data published to the chain can be retrieved by any node. The RDK module provides native DA for rollups, storing blobs on-chain with configurable retention periods.

**DPoS** — Delegated Proof-of-Stake. A consensus mechanism where token holders delegate their stake to validators who produce blocks on their behalf.

**EIP-1559** — Ethereum Improvement Proposal 1559. A transaction fee model that uses a base fee (burned) plus a priority fee (paid to validators). QoreChain implements EIP-1559-style fee mechanics in its QoreChain EVM Engine.

**HCS** — Hierarchical Commitment Schemes. The mechanism by which sidechains, paychains and rollups periodically anchor their state roots to the main chain (see Multilayer Architecture). Not to be confused with the hybrid secp256k1 + ML-DSA-87 signature scheme, which this documentation calls a *hybrid signature*.

**Hybrid sign-bytes v2** — The domain-tagged, chain-bound bytes the ML-DSA key signs from v3.2.0. See [Post-Quantum Security](/architecture/post-quantum-security#sign-bytes-v2).

**IBC** — Inter-Blockchain Communication. A protocol for authenticated message passing between independent blockchains. QoreChain supports IBC channels for cross-chain token transfers and data relay.

**Light Node** — A resource-light client that follows the chain by cross-checking block headers against one or more RPC endpoints, without holding full state. It does not serve queries to others. The protocol fee split reserves a **3%** share for the light-node reward program, which is not open to registration yet. See [Light Node](/light-node/overview) and its [reward program status](/light-node/overview#reward-program-status).

**MEV** — Maximal Extractable Value. The profit that can be obtained by reordering, inserting, or censoring transactions within a block. QoreChain's FairBlock module (tIBE encryption) is designed to mitigate MEV extraction; it is not yet enabled.

**ML-DSA-87** — Module-Lattice Digital Signature Algorithm (security level 5). The NIST-standardized post-quantum digital signature scheme used by QoreChain for quantum-resistant transaction signing. Produces signatures of 4,627 bytes with public keys of 2,592 bytes.

**ML-KEM-1024** — Module-Lattice Key Encapsulation Mechanism (security level 5). A NIST-standardized post-quantum key encapsulation scheme available in QoreChain's PQC algorithm registry for future encrypted communication channels.

**MLP** — Multi-Layer Perceptron. A class of neural network used by QCAI for pattern recognition in fraud detection and anomaly scoring.

**PPO** — Proximal Policy Optimization. A reinforcement learning algorithm used by PRISM to optimize chain parameters (block time, gas price, pool weights; validator-set size is logged only) based on observed network conditions. No trained policy is loaded on the live networks.

**PQC** — Post-Quantum Cryptography. Cryptographic algorithms designed to be secure against attacks from both classical and quantum computers. QoreChain implements PQC through its `x/pqc` module with ML-DSA-87 as the primary signature scheme.

**PRISM** — Policy-driven Reinforcement-learning for Intelligent State Machines. The reinforcement-learning optimization layer embedded in the QoreChain Consensus Engine (via the `x/rlconsensus` module). PRISM observes network metrics and is designed to propose deterministic consensus-parameter adjustments under circuit-breaker safety controls; today it runs in observation mode. See [PRISM Consensus Engine](/architecture/prism-consensus-engine).

**Protocol feature** — A behaviour switch that a release's upgrade handler turns on at one block height on every node (for example `pqc-sign-bytes-v2`, `evm-pqc-authorisation-window`), so history replays unchanged below that height.

**PvP Rebase** — Player versus Player Rebase. A mechanism in the xQORE module where penalties from early unlock are redistributed proportionally to remaining locked stakers, rewarding long-term commitment (not yet wired on-chain).

**QCAI** — QoreChain Artificial Intelligence. The umbrella term for QoreChain's AI subsystem, including the on-chain heuristic engine (`x/ai` module) and the off-chain QCAI sidecar that provides advanced inference capabilities.

**QCB** — QoreChain Bridge. QoreChain's native bridge protocol for connecting to non-IBC chains (e.g., Ethereum, Bitcoin, Solana, Avalanche). QCB uses a validator attestation threshold (7 of 10 ML-DSA-87 signatures) for cross-chain attestation. See [Bridge Architecture](/architecture/bridge-architecture).

**QDRW** — Quadratic Delegation with Reputation Weighting. A governance voting-power formula (square root of stake plus weighted xQORE, scaled by a reputation multiplier). Implemented in `x/qca` but disabled on the live networks (`qdrw_enabled = false`).

**RDK** — Rollup Development Kit. QoreChain's native framework for deploying and managing rollups with four settlement paradigms (optimistic, zk, based, sovereign), five preset profiles, and integrated data availability. See [Rollups Overview](/rollups/overview).

**RL** — Reinforcement Learning. A machine learning approach where an agent learns optimal actions through trial and reward. PRISM is designed to use RL to tune chain parameters within the QoreChain Consensus Engine (observation only today).

**RPoS** — Reputation Proof-of-Stake. The pool for validators at or above the 70th reputation percentile with at least median self-bonded stake. Validators earn reputation through uptime, participation, and community contributions.

**SHAKE-256** — A variable-output-length hash function from the SHA-3 family. SHAKE-256 is QoreChain's default application hash (the `qorehash` package) and is used for PQC-related operations such as key derivation.

**SNARK** — Succinct Non-interactive Argument of Knowledge. A type of zero-knowledge proof that can be verified quickly with a small proof size. Supported as a settlement paradigm in the RDK module for zk-rollups.

**STARK** — Scalable Transparent Argument of Knowledge. A zero-knowledge proof system that requires no trusted setup and is quantum-resistant. Available as an alternative proof system for zk-rollup settlement in the RDK.

**Stranded staker share / reward-pool reserve** — Amounts recorded at the v3.2.0 upgrade that move only by a governance vote. See [Tokenomics](/architecture/tokenomics#stranded-and-reserve).

**SVM** — Solana Virtual Machine. A high-performance execution environment for BPF programs. QoreChain integrates the SVM as one of three supported runtimes alongside the QoreChain EVM Engine and CosmWasm.

**TEE** — Trusted Execution Environment. A secure area of a processor that ensures code and data are protected from external access. QoreChain defines interface specifications for TEE attestation; no implementation exists yet.

**tIBE** — Threshold Identity-Based Encryption. A cryptographic scheme where a message can only be decrypted when a threshold of parties collaborate. Used by the FairBlock module to encrypt transaction contents until block finalization, preventing MEV extraction.

**uqor** — The base denomination of the QOR token. 1 QOR = 1,000,000 uqor (10^6). All on-chain amounts, fees, and staking values are denominated in uqor.

**xQORE** — The governance staking derivative of QOR. Users lock QOR to receive xQORE, which grants enhanced governance voting power and earns PvP rebase rewards from early-unlock penalties (designed behaviour; the lock and unlock transactions are not yet wired on-chain). See [Tokenomics](/architecture/tokenomics#x-xqore).
