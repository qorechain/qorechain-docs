---
slug: /architecture/rollup-development-kit
title: Rollup Development Kit
sidebar_label: Rollup Development Kit
sidebar_position: 12
---

# Rollup Development Kit

The `x/rdk` module provides a comprehensive Rollup Development Kit (RDK) that allows developers to deploy application-specific rollups on QoreChain. It supports four settlement paradigms, multiple sequencer modes, pluggable data availability backends, and AI-assisted configuration optimization.

:::caution Early-stage capability
The module is deployed on mainnet (chain version **v3.2.1**) and testnet, but **no rollup has been created on either network yet**. Several capabilities described below are not usable end to end today; the status is stated where each is described. For the developer-facing how-to, see [Rollups Overview](/rollups/overview).
:::

---

## Settlement Paradigms

QoreChain RDK supports four distinct settlement modes — **optimistic**, **zk**, **based**, and **sovereign** — each with different trust assumptions, finality characteristics, and proof requirements.

### Optimistic Settlement

Optimistic rollups assume transactions are valid by default and rely on fraud proofs for dispute resolution.

* **Proof system**: Interactive fraud proofs
* **Challenge window**: 604,800 "seconds" (default), converted by the chain to blocks at a fixed 6 seconds per block — **100,800 blocks**. The real elapsed time depends on actual block time (about 3.7 days at mainnet's current ≈3.2 s blocks), so plan in blocks, not days.
* **Challenge bond**: 1,000 QOR (1,000,000,000 uqor) — required to submit a fraud proof challenge (`nft` and `custom` presets; the `defi`, `gaming` and `enterprise` presets set no bond because they have no challenge window)
* **Finality**: Delayed until the challenge window expires with no valid challenge
* **Auto-finalization**: The `EndBlocker` automatically finalizes batches once the challenge window has passed without dispute. A challenged batch is never auto-finalised: the rollup creator resolves the challenge first (see [Deploying a Rollup](/rollups/deploying-a-rollup#challenge-a-batch-optimistic-rollups)).

**Batch lifecycle**:

```
Submitted → [challenge window expires] → Finalized
Submitted → [fraud proof submitted] → Challenged → Rejected
```

### ZK (Zero-Knowledge) Settlement {#zk-zero-knowledge-settlement}

ZK rollups provide cryptographic validity proofs that guarantee state transition correctness.

* **Proof system**: SNARK (Groth16 over BLS12-381) or STARK (transparent, no trusted setup)
* **Finality**: Instant on proof verification — no challenge window required
* **Max proof size**: 1 MB (1,048,576 bytes)
* **Recursion depth**: Configurable proof aggregation depth (default: 1)
* **Maturity**: SNARK batches are verified on-chain (Groth16 over BLS12-381) against a verifying key stored with the rollup. A rollup created through `create-rollup` does not currently carry a verifying key, so ZK batches cannot yet be finalised end to end. STARK verification is experimental: it is opt-in and checks a demonstration circuit, not your rollup's own state transition. Treat ZK settlement as not production-ready.

**Batch lifecycle**:

```
Submitted + valid proof → Finalized (instant)
```

### Based Settlement

Based rollups delegate transaction sequencing to L1 (QoreChain) proposers, inheriting the host chain's liveness and censorship resistance guarantees.

* **Proof system**: None required — L1 proposers are the source of truth
* **Sequencer**: Must use `based` sequencer mode (enforced by validation)
* **Finality**: 2-block confirmation on QoreChain
* **Inclusion delay**: Configurable blocks before forced inclusion of rollup transactions
* **Priority fee sharing**: Configurable percentage of priority fees paid to L1 proposers

**Batch lifecycle**:

```
Submitted → [2 L1 blocks] → Finalized (auto)
```

### Sovereign Settlement

Sovereign rollups operate with independent consensus and self-sequence their transactions. They anchor state to QoreChain for verifiability but do not depend on the host chain for finality.

* **Proof system**: None
* **Finality**: Independent — determined by the rollup's own consensus
* **State anchoring**: State roots are posted to QoreChain for transparency and verifiability, but are not enforced
* **Auto-finalization**: None — sovereign rollups manage their own finality

---

## Proof System Compatibility

| Settlement Mode | Fraud Proofs |     SNARK |     STARK |     None |
| --------------- | -----------: | --------: | --------: | -------: |
| **Optimistic**  |     Required |        -- |        -- |       -- |
| **ZK**          |           -- | Supported | Supported |       -- |
| **Based**       |           -- |        -- |        -- | Required |
| **Sovereign**   |           -- |        -- |        -- | Required |

STARK verification is experimental and ZK settlement is not production-ready; see the [ZK Settlement](#zk-zero-knowledge-settlement) maturity note above.

---

## Preset Profiles

The RDK ships **five preset profiles** that provide turnkey rollup configurations optimized for common use cases. Each preset bundles a settlement paradigm, sequencer mode, data availability backend, gas model, and VM tuned for its target domain:

| Profile          | Settlement (proof)       | Sequencer | DA              | Gas model    | VM      | Target use case |
| ---------------- | ------------------------ | --------- | --------------- | ------------ | ------- | --------------- |
| **`defi`**       | zk (SNARK)               | dedicated | native          | EIP-1559     | EVM     | Trading, lending, and AMM-style applications |
| **`gaming`**     | based                    | based     | native          | flat         | custom  | High-throughput, low-latency game state and in-game economies |
| **`nft`**        | optimistic (fraud)       | dedicated | native (Celestia DA planned) | standard | CosmWasm | NFT minting, marketplaces, and digital collectibles |
| **`enterprise`** | based                    | based     | native          | subsidized   | EVM     | Permissioned and consortium deployments with sponsored fees |
| **`custom`**     | fully parameterized      | fully parameterized | fully parameterized | fully parameterized | fully parameterized | Every field is user-defined |

The `custom` profile leaves every field for you to set. The exact values bundled into each preset can evolve as the RDK matures; query the live configuration with `qorechaind query rdk config` (or `RdkClient.params()` from `@qorechain/rdk`) for the authoritative per-preset parameters, and note that `based` settlement always pairs with the `based` sequencer mode.

---

## Sequencer Modes

The sequencer determines who orders transactions within a rollup block.

:::note What is enforced today
On-chain, a batch may be submitted only by the rollup's configured sequencer address or, when none is set (every preset), by its creator. The `shared` and `based` modes are recorded in the rollup configuration, but QoreChain does not yet admit a shared sequencer roster or L1 proposers as batch submitters; those modes describe the intended design.
:::

### Dedicated Sequencer

A single operator sequences all rollup transactions.

* **Operator**: Single designated address
* **Latency**: Lowest possible — single-party ordering
* **Trust**: Requires trust in the sequencer operator for liveness and fair ordering

### Shared Sequencer

A set of sequencers collectively order transactions.

* **Status**: a label today — the roster is not admitted on-chain yet (see the note above)
* **Minimum set size**: Configurable (default: 1)
* **Latency**: Slightly higher due to multi-party coordination
* **Trust**: Distributed across the sequencer set

### Based Sequencer

QoreChain L1 proposers sequence rollup transactions.

* **Status**: a label today — L1 proposers are not admitted as batch submitters yet (see the note above)
* **Inclusion delay**: Configurable blocks before forced inclusion (default: 10)
* **Priority fee share**: Configurable percentage of priority fees paid to L1 proposers
* **Trust**: Inherits QoreChain's validator set security and censorship resistance
* **Requirement**: Based settlement mode requires the based sequencer (enforced at validation)

---

## Data Availability Backends

### Native DA

On-chain KV-store blob storage within QoreChain itself.

:::caution No public way to post a blob yet
The module defines blob storage, retention and pruning, but there is no transaction message for posting a blob in the current releases. A batch that names a data hash on a `native` or `both` rollup is refused because no matching blob can be stored. See [Data Availability](/rollups/data-availability).
:::

| Parameter            | Value                                                                                               |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| **Max blob size**    | 2 MB (2,097,152 bytes)                                                                              |
| **Retention period** | 432,000 blocks (about 16 days at mainnet's current ≈3.2 s blocks; the figure moves with block time) |
| **Auto-pruning**     | Expired blobs are pruned in the `EndBlocker` — data is removed but commitment metadata is retained  |
| **Commitment**       | SHAKE-256 (32-byte) hash of the blob data                                                           |

### Celestia DA

IBC-based data availability using Celestia's dedicated DA layer.

* **Status**: Stubbed in the current release — returns an error if selected as the sole backend
* **Namespace support**: Rollup-specific namespaces are supported in the blob schema
* **Planned**: Full IBC integration with Celestia's blob submission and verification

### Both (Redundant)

Stores blobs on both Native and Celestia backends simultaneously.

* In the current release, only the native blob is actually stored; a warning is logged for the Celestia component.

---

## Rollup Lifecycle

```
Pending → Active → Paused → Active → Stopped
                      ↑                  |
                      └──────────────────┘
                      (can resume from paused,
                       stopped is permanent)
```

| State       | Description                                                  |
| ----------- | ------------------------------------------------------------ |
| **Pending** | Rollup registered but not yet activated                      |
| **Active**  | Rollup is live and processing batches                        |
| **Paused**  | Temporarily halted by creator (can resume)                   |
| **Stopped** | Permanently decommissioned — stake bond returned to creator  |

On creation, rollup status is set to `Active` immediately after stake escrow and the creation burn succeed (layer registration is attempted but non-fatal). Only the creator can pause, resume or stop a rollup (enforced since chain version v3.2.0).

---

## Batch Lifecycle

Settlement batches track the state progression of rollup state roots:

```
Submitted → Finalized                              (happy path)
Submitted → Challenged → Rejected                  (fraud detected)
```

| State          | Description                                       |
| -------------- | ------------------------------------------------- |
| **Submitted**  | Batch posted to QoreChain, awaiting finalization  |
| **Challenged** | Fraud proof challenge submitted (optimistic only) |
| **Finalized**  | Batch accepted as canonical                       |
| **Rejected**   | Batch invalidated by successful challenge         |

### Auto-Finalization Rules

| Settlement Mode | Finalization Trigger                                        |
| --------------- | ----------------------------------------------------------- |
| **Optimistic**  | 100,800 blocks after submission (default window) with no challenge |
| **ZK**          | Instant on valid proof submission                           |
| **Based**       | 2 L1 blocks after submission                                |
| **Sovereign**   | None — managed by the rollup's own consensus                |

Auto-finalization is executed in the `EndBlocker` for optimistic and based rollups. ZK batches are finalized inline during batch submission.

---

## Module Parameters

| Parameter                   |                          Default | Description                                      |
| --------------------------- | -------------------------------: | ------------------------------------------------ |
| `max_rollups`               |                              100 | Maximum number of rollups that can be registered |
| `min_stake_for_rollup`      | 10,000,000,000 uqor (10,000 QOR) | Minimum stake required to create a rollup        |
| `rollup_creation_burn_rate` |                        0.01 (1%) | Fraction of creation stake burned via `x/burn`   |
| `default_challenge_window`  | 604,800 (converted to 100,800 blocks) | Default optimistic challenge window         |
| `max_da_blob_size`          |           2,097,152 bytes (2 MB) | Maximum data availability blob size              |
| `blob_retention_blocks`     |                   432,000 blocks | Blocks before DA blobs are pruned                |
| `max_batches_per_block`     |                               10 | Maximum settlement batches processed per block   |

---

## Multilayer Integration

The RDK module integrates with `x/multilayer` for cross-layer state management:

### Layer Registration {#layer-registration}

When a rollup is created, the module registers a layer for it through `RegisterSidechain`, so on-chain the layer type is **`sidechain`**, it starts in the `proposed` status, it counts against the multilayer sidechain limit (`max_sidechains`, default **10**) and it locks the creator's `min_sidechain_stake` (1,000 QOR). The registration includes:

* Layer ID (matches rollup ID)
* Target block time and max transactions per block
* Supported VM types and domains
* Settlement interval

Registration is **non-fatal**: if it fails (insufficient balance or limit reached), the rollup is still created, but it has no layer and cannot be anchored.

### State Anchoring {#state-anchoring}

A settlement batch can be anchored to `x/multilayer`, which records the layer ID, layer height (the batch index), state root, validator-set hash and transaction count under a post-quantum signature by the rollup creator.

* **Mainnet today:** batches are settled but are **not** anchored — the RDK does not supply the creator signature the anchor requires, so the anchoring step does not succeed and no anchor has been written. Anchoring is non-fatal: it never prevents batch processing.

See [Settlement Receipts](/rollups/settlement-receipts) for what an anchor does and does not prove.

---

## Burn Integration

On rollup creation, **1% of the stake amount** is burned via the `x/burn` module through the `rollup_create` burn channel. For example, creating a rollup with the minimum 10,000 QOR stake burns 100 QOR permanently. The remaining 9,900 QOR is held in escrow and returned when the rollup is stopped. The creation burn is enforced since chain version v3.2.0; earlier releases did not apply it.
