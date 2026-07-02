---
slug: /appendix/version-history
title: Version History
sidebar_label: Version History
sidebar_position: 3
---

# Version History

Public version history for QoreChain. The latest release is **v3.1.82**, running on mainnet **`qorechain-vladi`** (EVM chain ID **9801**, live since 7 June 2026). The testnet **`qorechain-diana`** (EVM chain ID **9800**) tracks pre-release builds.

:::note
Entries below are high-level capability summaries. Earlier `v1.x` entries are retained as historical record of the testnet release line that preceded mainnet.
:::

---

## v3.1.82 — Native QOR on SVM Live + Integrator Enablement (Current Mainnet Release)

**Release focus:** The SVM native-QOR unification running on both networks, plus everything an exchange or integrator needs to connect.

* **Unified native-QOR balance live on all three interfaces** — The SVM unification (v3.1.81) is confirmed live on mainnet and testnet: the same account holds one balance visible as `uqor` (6 decimals) on Cosmos, wei-style 18 decimals on the EVM, and lamports (9 decimals; 1 uqor = 1,000 lamports) on the Solana-compatible interface.
* **Verified public endpoints** — Public HTTPS endpoints for consensus RPC, REST, EVM JSON-RPC, and SVM JSON-RPC on both networks, plus the public [block explorer](https://explore.qore.network). See [Networks](/appendix/networks).
* **Downloads** — Versioned node-binary bundles, the mainnet genesis, and fresh chain-data snapshots (with SHA-256 checksums) published at [download.qore.host](https://download.qore.host).
* **Deterministic post-quantum signing across the client stack** — `@qorechain/pqc` 0.1.1 signs ML-DSA-87 deterministically (FIPS-204 §3.4) in all six language bindings, matching what the chain accepts; `@qorechain/wallet-adapter` 0.1.2 builds on it for hybrid transaction signing.
* **Integrator guide** — New [Exchange & Integrator Guide](/developer-guide/exchange-integration) covering deposits, withdrawals, and node operations across the three interfaces.

## v3.1.81 — SVM Native-QOR Unification

**Release focus:** Native QOR as a first-class asset on the Solana-compatible interface.

* **Native QOR on SVM** — The SVM runtime now surfaces the account's native QOR balance directly (in lamports), rather than tracking a separate SVM-only balance. `getBalance` and `getSignaturesForAddress` work against native funds, and System Program transfers move native QOR.
* **SVM address mapping** — An account's SVM address is derived from its 20 account bytes (right-padded to 32 bytes, base58-encoded), so the Cosmos, EVM, and SVM addresses of one key refer to the same funds.

## v3.1.80 — Multilayer State-Anchor Queries

**Release focus:** Readable, offline-verifiable settlement anchors for rollups.

* **Anchor read queries** — The `x/multilayer` query service now exposes `Anchor` (the latest state anchor for a layer) and `Anchors` (a layer's anchor history), so clients can fetch a layer's settlement anchor and verify it independently.
* **REST gateway for multilayer** — Every multilayer query (`params`, `layers`, `layers/{layer_id}`, `anchor/{layer_id}`, `anchors/{layer_id}`, `routing-stats`) is now available over REST in addition to gRPC.
* **Quantum-safe settlement receipts unblocked** — Each anchor carries an **ML-DSA-87 (Dilithium-5)** signature over its canonical fields, providing the on-chain basis for the Rollup Development Kit's offline settlement-receipt verification.

## v3.1.79 — Validator Auto-Provisioning for Bridge Networks

**Release focus:** Turnkey participation on connected networks for licensed validators.

* **Network driver framework** — A declarative driver framework lets a QoreChain validator that holds the relevant `validator_<chain>` (or `qcb_bridge`) license have the matching external-network client provisioned, configured, and run on the same node under QoreChain orchestration — only once the license is activated.
* **Drivers for all 37 bridge networks** — Coverage spans every connected network, classified by participation model (permissionless validator, capped/elected/admission, L2 full-node, and non-staking/trust-list roles). External-network stake and signing keys remain operator-supplied per network; QoreChain ships the framework and the enforced license gate.

## v3.1.78 — Pre-Deploy Readiness

**Release focus:** Wallets, bridges, IBC, and licensing all work at launch — with no post-deploy governance.

* **Trustless post-deploy bridge activation** — A `bridge_admin` key (or `qcb_bridge` license holder) can activate any connected chain's bridge with a single signed transaction (`tx bridge update-chain-config` / `set-verifier-bootstrap`) — setting contract address, confirmations, architecture, status, the active verifier, and the verifier trust root — with no governance proposal or chain upgrade.
* **Validator-network license gate** — The orchestrator now enforces the `validator_<chain>` / `qcb_bridge` license (fail-closed) before starting any external-network client.
* **Wallet integration packages** — `@qorechain/wallet-adapter` and `@qorechain/connect` published to npm (v0.1.0), adding one-call MetaMask network registration (EIP-3085, **18-decimal** native QOR on the EVM rail) and Keplr gas-price configuration.
* **IBC turnkey relayer** — Ready-to-run relayer configuration and channel-bootstrap tooling for the eight IBC counterparties, so channels come up post-deploy without bespoke setup.

## v3.1.77 — Bridge & Burn REST Endpoints

**Release focus:** Read-only REST access for cross-chain and supply modules.

* **Bridge REST endpoints** — Read-only HTTP query endpoints for the bridge module, exposing bridge state over standard REST in addition to gRPC.
* **Burn REST endpoints** — Read-only HTTP query endpoints for the burn module, making fee-distribution and supply data queryable over standard REST.

## v3.1.76 — SVM Toolchain Modernization

**Release focus:** Solana Virtual Machine compatibility refresh.

* **Current-toolchain program support** — SVM execution modernized so that programs built with the current Solana toolchain run on the QoreChain SVM runtime.

## v3.1.75 — SVM JSON-RPC by Default

**Release focus:** Out-of-the-box Solana-compatible RPC.

* **Solana-compatible JSON-RPC** — The SVM JSON-RPC server is now enabled by default (port **8899**) and started automatically with the node, providing a Solana-compatible RPC interface for SVM tooling.

## v3.1.74 — Rollup Profile Presets

**Release focus:** Rollup Development Kit usability and settlement.

* **Profile-preset application** — Rollup creation now applies the selected profile's preset (DeFi, gaming, NFT, enterprise, or fully custom), so new rollups inherit sensible defaults for their use case.
* **Optimistic settlement** — The optimistic settlement path (batch submit and challenge) is operational end to end.

## v3.1.73 — Post-Quantum Hash Baseline

**Release focus:** Completing the default post-quantum cryptographic baseline.

* **SHAKE-256 default hash** — SHAKE-256 (SHA-3 family) is adopted as the default application hash, completing the default post-quantum baseline of **ML-DSA-87 (Dilithium-5)** signatures, **ML-KEM-1024** key encapsulation, and **SHAKE-256** hashing.

## v3.1.72 — Stability & Maintenance

**Release focus:** Routine stability and build-pipeline maintenance.

* **Stability improvements** — Internal stability, dependency, and build-pipeline maintenance with no externally visible behavior changes.

## v3.1.71 — PQC Hybrid Signatures Enforced by Default

**Release focus:** Post-quantum security on by default on the Cosmos transaction path.

* **Hybrid signatures required by default** — Post-quantum hybrid signatures are now enforced by default on the Cosmos transaction path: each transaction carries a post-quantum **ML-DSA-87 (Dilithium-5)** signature alongside the classical **secp256k1** signature.
* **Governance-controlled enforcement** — Enforcement mode remains governance-controlled, with the default set to **required**.

## v3.1.70 — Production Hardening

**Release focus:** Production hardening and consensus optimization for the live mainnet.

* **PRISM consensus optimization** — Continued improvements to the PRISM reinforcement-learning optimization layer for adaptive parameter tuning under live network conditions, with circuit-breaker safety controls.
* **Performance and stability** — Throughput, latency, and resource-usage refinements across validators and full nodes.
* **Operational tooling** — Improved monitoring, query, and node-operation ergonomics for mainnet operators.
* **Tokenomics v2.1 alignment** — Fee distribution and emission mechanics aligned with the fixed-supply, finite-emission economic model.

## v3.0.0 — Mainnet Genesis

**Release focus:** Mainnet launch and token generation event.

* **Mainnet genesis** — QoreChain mainnet (`qorechain-vladi`, EVM chain ID 9801) launched on **7 June 2026**, with the token generation event (TGE) at genesis.
* **Five-way fee split** — Protocol fee distribution across validators, burn, treasury, stakers, and light nodes (**37 / 30 / 20 / 10 / 3**), adding a dedicated light-node share.
* **On-chain AMM** — Native automated-market-maker module (`x/amm`) for on-chain liquidity pools and swaps.
* **Chain licensing** — On-chain license module (`x/license`) for registering and managing protocol entitlements.
* **Hardened settlement paradigms** — RDK settlement modes finalized as optimistic, zk, based, and sovereign.

## v1.4.0 — Pre-Mainnet Expansion

**Release focus:** Cross-chain coverage and release-candidate stabilization ahead of mainnet.

* **Expanded cross-chain coverage** — Additional IBC and bridge connectivity to a broader set of external networks.
* **Light-node participation** — Introduced light nodes and the groundwork for their fee-share rewards.
* **Release-candidate hardening** — Extensive testing, audits, and stabilization across all core modules in preparation for mainnet genesis.

## v1.3.0 — Rollup Development Kit

**Release focus:** Native rollup infrastructure for sovereign and shared-security rollup deployments.

* **x/rdk module** — Full Rollup Development Kit with four settlement paradigms: optimistic, zk, based, and sovereign
* **5 preset profiles** — Pre-configured rollup templates for DeFi, gaming, NFT, enterprise, and fully custom use cases
* **Native data availability** — On-chain DA layer with blob storage, retention management, and pruning lifecycle
* **EndBlocker auto-finalization** — Automatic batch finalization when the challenge window expires, with no operator intervention required
* **AI-assisted profile selection** — `suggest-profile` query that recommends an optimal rollup configuration based on the intended use case
* **Multilayer integration** — Rollups register as layers in the multilayer architecture, inheriting routing, anchoring, and challenge mechanics
* **Bank escrow lifecycle** — Operator stake is held in escrow during rollup operation and released upon clean shutdown or forfeited on slashing

## v1.2.0 — IBC & Bridges

**Release focus:** Cross-chain connectivity and advanced account abstractions.

* **25 cross-chain connections** — 8 IBC channels and 17 QoreChain Bridge (QCB) connections to external networks
* **x/babylon module** — BTC restaking integration enabling Bitcoin holders to participate in QoreChain staking security
* **x/abstractaccount module** — Smart account framework with programmable spending rules, session keys, and custom authentication logic
* **x/fairblock module** — Threshold Identity-Based Encryption (tIBE) for MEV-resistant transaction encryption
* **x/gasabstraction module** — Multi-token gas payment supporting native QOR, IBC-bridged USDC, and IBC-bridged ATOM
* **5-lane TX prioritization** — Transaction lanes ordered by priority: system, governance, staking, bridge, and general
* **IBC relayer configurations** — Pre-configured relayer setups for all supported IBC channels
* **Bridge-to-burn integration** — Bridge fees are routed through the burn module's fee distribution

## v1.1.0 — PQC Hybrid Signatures

**Release focus:** Post-quantum cryptographic security and algorithm agility.

* **Dual secp256k1 (ECDSA) + ML-DSA-87 signatures** — Every transaction carries both a classical and a post-quantum signature, verified in the AnteHandler chain
* **3 enforcement modes** — Configurable hybrid signature enforcement: off (mode 0), permissive (mode 1, PQC optional), mandatory (mode 2, PQC required)
* **Auto-registration** — PQC public keys are automatically registered on the first hybrid transaction, eliminating a separate registration step
* **SHAKE-256 hash foundation** — All PQC-related hashing operations use SHAKE-256 (SHA-3 family) for quantum-resistant address derivation
* **TEE attestation interfaces** — Trusted Execution Environment attestation support for proving PQC key generation integrity
* **Algorithm agility framework** — Pluggable algorithm registry allowing future PQC algorithms to be added via governance without a chain upgrade

## v1.0.0 — Genesis (Tokenomics Engine)

**Release focus:** Initial protocol launch with full tokenomics, multi-VM execution, and AI-assisted operations.

* **x/burn module** — Multi-channel fee burn mechanism with a four-way distribution across validators, burn, treasury, and stakers
* **x/xqore module** — Governance staking derivative with tiered early-unlock penalties and PvP rebase redistribution
* **x/inflation module** — Epoch-based emission with annual decay, governed by the finite-emission economic model
* **PRISM consensus layer** — Reinforcement-learning optimization (PPO) for dynamic chain parameter tuning with circuit-breaker safety controls
* **Triple-pool CPoS** — Classified Proof-of-Stake with Emerald, Sapphire, and Ruby validator pools weighted by reputation scores
* **QDRW governance** — Dynamic Reward Weighting system allowing governance-approved adjustments to reward distribution across pools
* **EVM + CosmWasm + SVM runtimes** — Three concurrent execution environments: the QoreChain EVM Engine, CosmWasm smart contracts, and the Solana Virtual Machine
* **Cross-VM bridge** — Message passing and asset transfers between EVM, CosmWasm, and SVM runtimes within a single block
* **Post-quantum cryptography** — Quantum-resistant signing backed by a high-performance PQC library
* **QCAI** — On-chain heuristic analysis with an optional off-chain sidecar for fraud detection, fee estimation, and network optimization
* **Containerized deployment** — Full multi-validator testnet deployment with sidecar service and block indexer
* **Block indexer** — Block listener with persistent storage for historical query and analytics
