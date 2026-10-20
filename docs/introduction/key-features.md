---
slug: /introduction/key-features
title: Key Features
sidebar_label: Key Features
sidebar_position: 3
---

# Key Features

The following table lists every major feature in QoreChain, organized by the release phase in which it was introduced. The current mainnet release is **v3.2.3**, live since 7 June 2026 (`qorechain-vladi`, EVM chain ID 9801); the parallel testnet (`qorechain-diana`, EVM chain ID 9800) runs v3.2.4, a testnet-only release. The [Feature Status](#feature-status) table at the end of the feature list shows what is active on the live networks today.

| Feature                    | Introduced in       | Description                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PQC Hybrid Signatures (required by default) | v1.1.0 (Security)   | Dual signatures on every cosmos-path transaction: a classical secp256k1 (ECDSA) signature paired with ML-DSA-87 (Dilithium-5). As of v3.1.71 the network default is **required** (`hybrid_signature_mode = required`, `allow_classical_fallback = false`) — classical-only cosmos txs are rejected; only genesis gentxs and PQC key registration/migration txs are exempt. EVM transactions keep their `eth_secp256k1` signature but, since v3.2.0, are admitted only from an account with a registered ML-DSA-87 key and an open [EVM authorisation window](/getting-started/first-transaction#evm-window). Three governance-controlled enforcement modes (disabled / optional / required) remain available.                                                                              |
| SHAKE-256 Default Hash     | v1.1.0 (Security)   | SHA-3 family extendable-output function (XOF). As of v3.1.73, SHAKE-256 (via the `qorehash` package) is the **default application hash**, completing the PQC baseline (Dilithium-5 + ML-KEM-1024 + SHAKE-256). Provides variable-length hashing, fixed 32-byte output, Merkle internal node concatenation, and domain-separated hashing — all in pure Go with no FFI dependency.                                                                                                                 |
| TEE and FL Interfaces      | v1.1.0 (Security)   | Interface specifications (no implementation yet) for Trusted Execution Environment attestation (SGX, TDX, SEV-SNP, ARM CCA) and Federated Learning coordination (FedAvg, FedProx, SCAFFOLD aggregation methods); both are planned for a future release.                                                                |
| On-Chain RL Consensus (PRISM) | v1.0.0 (Genesis) | A Go-native fixed-point MLP (73,733 parameters) is built into the block lifecycle for PPO inference. PRISM is designed to tune block time, gas price and pool weights; on the live networks it currently only observes (no trained policy is loaded and the control messages are disabled). Deterministic Taylor series math is designed to give identical results across all validators. Four operating modes (shadow, conservative, autonomous, paused); both networks are set to conservative. Circuit breaker protection for safety. |
| Triple-Pool Composite PoS  | v1.0.0 (Genesis)    | Designed: validators are classified into RPoS (reputation-weighted), DPoS (delegation-weighted), and PoS (standard) pools every 1,000 blocks. Pool-weighted sortition would diversify block production beyond pure stake dominance, and a custom bonding curve would factor in self-bonded stake, loyalty duration, reputation quality, and protocol phase. Implemented in `x/qca` but **not yet active in block production, rewards or slashing**; block proposal and slashing currently follow the standard stake-weighted rules.                            |
| QDRW Governance            | v1.0.0 (Genesis)    | Quadratic Delegation with Reputation Weighting. Designed so that voting power uses a square-root function dampened by a sigmoid reputation multiplier, preventing whale capture while rewarding long-term honest participation (a 100x stake advantage yields approximately 10x voting power; xQORE holdings double voting weight). Implemented but **disabled on the live networks** (`qdrw` is off); proposals are currently tallied on bonded stake.                                                                               |
| Burn Engine                | v1.0.0 (Genesis)    | Twelve burn sources (gas fees, contract creation, AI service fees, bridge fees, treasury buyback, failed transactions, xQORE penalties, automated buyback, the TGE burn, rollup creation, transaction-count milestones and AMM); on mainnet only the gas-fee and failed-transaction channels have recorded burns so far. Everything in the fee collector, including the epoch emission, is split **37% to validators, 30% permanently burned, 20% to treasury, 10% to stakers, and 3% to light nodes**.                                                            |
| xQORE Staking              | v1.0.0 (Genesis)    | Not live yet: the module's lock and unlock transactions are not wired into the live networks (see [xQORE Staking](/user-guide/xqore-staking)). Designed behaviour: lock QOR to mint xQORE at a 1:1 ratio for doubled governance weight in QDRW votes. Graduated exit penalties (50% under 30 days, 35% at 30-90 days, 15% at 90-180 days, 0% after 180 days) are redistributed to remaining holders via PvP rebase — rewarding conviction and penalizing short-term capital.                                                                                      |
| Capped Emission            | v1.0.0 (Genesis)    | A finite supply path: 4,420,000,000 QOR at genesis (80,000,000 QOR of the planned 4,500,000,000 were burned at TGE) plus staking emission minted by `x/inflation` under a hard cumulative cap of 590,000,000 QOR (86,000 QOR per 43,200-block epoch in `fixed` mode, since governance proposal 10 in October 2026). Burns permanently remove tokens. See [Tokenomics](/architecture/tokenomics#supply-and-emission). |
| EVM Runtime                | v1.0.0 (Genesis)    | Full Ethereum compatibility with EIP-1559 gas pricing, JSON-RPC on port 8545 (`eth_`, `web3_`, `net_` and `txpool_` namespaces; the `qor_` namespace is not served yet), and standard tooling support (Hardhat, Foundry, Remix). Deploy and interact with Solidity contracts using existing Ethereum workflows; since v3.2.0 the sender needs a registered post-quantum key and an open [EVM authorisation window](/getting-started/first-transaction#evm-window).                                                                                                                    |
| CosmWasm Runtime           | v1.0.0 (Genesis)    | WebAssembly smart contract engine for Rust-based contracts. Full lifecycle support: instantiate, execute, query, and migrate. Contracts run in a sandboxed Wasm environment with deterministic execution. Code upload and instantiation are currently **disabled** on both networks (governance setting plus circuit breaker).                                                                                                                                                                                       |
| SVM Runtime                | v1.0.0 (Genesis)    | BPF program deployment and execution via a Rust-backed executor. Solana-compatible JSON-RPC server on port 8899 supports `getAccountInfo`, `getBalance`, `getSlot`, and more. Read methods work on the public endpoints; the SVM transaction lane is currently **disabled** network-wide.                                                                                                                                                    |
| Cross-VM Bridge            | v1.0.0 (Genesis)    | Seamless interoperability across all three VMs. EVM contracts call CosmWasm via precompile (not active yet, see [Network status](/developer-guide/evm-precompiles#network-status)); CosmWasm contracts call EVM via custom messages; SVM programs participate through async event-based bridging. Synchronous EVM-CosmWasm calls and asynchronous SVM messaging within a single chain. The cross-VM call message is currently switched off on mainnet.                                                                                                  |
| Cross-Chain Connectivity   | v1.2.0 (Interop)    | Designed for up to eight IBC counterparties (Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon, Injective) plus **37 QCB chain configurations (36 external chains plus Injective over IBC)**. PQC-signed validator attestations, per-chain confirmation depths, and circuit breaker volume caps. As of October 2026 all 37 chain configurations are in `pending` status and no IBC channel is open on either network — **not live**.                               |
| BTC Restaking              | v1.2.0 (Interop)    | Design stage — the module's transactions are not enabled on the live networks. Babylon Protocol integration for Bitcoin finality guarantees. Validators would register BTC staking positions (minimum 100,000 satoshis). QoreChain epoch state roots are periodically checkpointed to Bitcoin via IBC-relayed Babylon epochs, providing a secondary finality layer backed by BTC hashrate.                                                                                           |
| Account Abstraction        | v1.2.0 (Interop)    | Programmable smart accounts at the protocol layer (similar to ERC-4337). Three account types: multisig, social recovery, and session-based. Session keys with granular permissions and expiry, per-account daily and per-transaction spending rules, and scoped denom allowlists. Implemented but currently **switched off** on both networks (`abstractaccount.enabled = false`; check `GET /qorechain/abstractaccount/v1/config`).                                                                      |
| MEV Protection             | v1.2.0 (Interop)    | FairBlock threshold identity-based encryption (tIBE) framework for encrypted mempools, designed to keep transactions opaque to block proposers until after inclusion. The FairBlockDecorator ante handler is wired; tIBE threshold decryption activates after key ceremony deployment. Currently **disabled** on both networks (`enabled = false`).                                           |
| Gas Abstraction            | v1.2.0 (Interop)    | Designed to let users pay fees in an accepted non-native token; the configuration lists `ibc/USDC` at a 1:1 rate and `ibc/ATOM` at 10:1. No IBC channel is open yet, so no such token exists on the networks and fees are currently paid in QOR.                                                                                      |
| 5-Lane Prioritization      | v1.2.0 (Interop)    | Lane definitions (PQC, MEV, AI, Default, Free) exist as configuration, but block-space lanes are not enforced by the live mempool or proposal handler.                                                                                                                                     |
| On-Chain Liquidity (AMM)   | v1.2.0 (Interop)    | Native automated market maker (`x/amm`) provides on-chain liquidity pools and swaps at the protocol layer. The module is live; no pools have been created yet.                                                                                                                                                                                                                                                                                     |
| RDK Rollups                | v1.3.0 (Rollups)    | Rollup Development Kit with four settlement paradigms (optimistic, zk, based, sovereign), five preset profiles (defi, gaming, nft, enterprise, custom), native DA router with SHAKE-256 blob storage and automatic pruning, bank escrow lifecycle with configurable creation burn rate, EndBlocker auto-finalization, and PRISM-assisted configuration via the consensus module. Rollup capabilities are delivered as a host-chain framework; no rollup has been created on the live networks yet.                          |
| Chain Licensing            | v1.3.0 (Rollups)    | The `x/license` module provides protocol-native chain licensing.                                                                                                                                                                                                                                                                                                                              |

## Feature Status (October 2026) {#feature-status}

Verified against the live networks on 20 October 2026. "Live" means the capability is active on mainnet (and, unless a row says otherwise, on testnet); the descriptions above say what each feature is designed to do.

| Capability | Status on the live networks |
| --- | --- |
| Hybrid ML-DSA-87 + secp256k1 signatures (Cosmos lane) | **Live**, required (`hybrid_signature_mode = required`) |
| EVM authorisation window | **Live** since v3.2.0 (optional scoping since v3.2.3) |
| Time-locked staking (`x/stakingtier`) | **Testnet only** (v3.2.4); not on mainnet |
| EVM, CosmWasm, SVM runtimes | EVM **live**; CosmWasm code upload and instantiation **disabled** (governance setting plus circuit breaker); SVM transaction lane **disabled** (reads work) |
| Burn engine and fee split (37/30/20/10/3) | **Live**; only the gas-fee and failed-transaction burn channels have recorded burns on mainnet |
| Capped emission (`x/inflation`) | **Live**, fixed 86,000 QOR per epoch up to a 590,000,000 QOR cap (mainnet) |
| Staking, slashing, governance | **Live** (standard modules; see [Chain Parameters](/appendix/chain-parameters)) |
| Light-node rewards | Reward accounting **live**; registration **open** and licence-gated, no light node registered yet (see [status](/light-node/overview#reward-program-status)) |
| AMM (`x/amm`) | Module **live**, no pools created yet |
| PRISM (`x/rlconsensus`) | **Observation only** — no policy loaded |
| Triple-Pool CPoS / QDRW (`x/qca`) | Implemented, **not wired** into block production, rewards or tally |
| xQORE (`x/xqore`) | Accounting only — **no lock/unlock transactions yet** |
| Smart accounts / linked wallets (`x/abstractaccount`) | Implemented, **switched off** (`enabled = false`) |
| Rollup Development Kit (`x/rdk`), multilayer | Modules **live**, no rollups or layers created yet |
| Cross-chain bridge, IBC, Babylon restaking | **Pending** — all 37 chain configs `pending`, no IBC channel open, no restaking transactions |
| FairBlock MEV protection | **Disabled** (`enabled = false`) |
| EVM precompiles, `qor_` JSON-RPC namespace | **Not active / not served** (the active precompile list is empty) |

## Version History

<details>

<summary>v1.0.0 — Genesis release</summary>

Established the core protocol with post-quantum cryptography (Dilithium-5, ML-KEM-1024), the PRISM on-chain reinforcement learning consensus layer, triple-VM runtime (EVM, CosmWasm, SVM) with cross-VM messaging, tokenomics engine (burn, xQORE, emission module), Triple-Pool Composite PoS validator selection, QDRW quadratic governance, and the AI transaction processing pipeline.

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

## Related

* [What is QoreChain](/introduction/what-is-qorechain) — the platform overview in context.
* [Tokenomics](/architecture/tokenomics) — the economic model behind QOR.
* [Bridge Architecture](/architecture/bridge-architecture) — cross-chain connectivity and BTC restaking.
* [Rollups Overview](/rollups/overview) — the Rollup Development Kit and settlement paradigms.
