---
slug: /architecture/rollup-development-kit
title: Rollup Development Kit
sidebar_label: Rollup Development Kit
sidebar_position: 12
---

# Rollup Development Kit

The `x/rdk` module provides a comprehensive Rollup Development Kit (RDK) that allows developers to deploy application-specific rollups on QoreChain. It supports four settlement paradigms, multiple sequencer modes, pluggable data availability backends, and AI-assisted configuration optimization.

:::caution Early-stage capability
The module is deployed on mainnet (chain version **v3.2.5** since 29 October 2026) and testnet (**v3.2.6** since 27 October 2026), but **no rollup has been created on either network yet** (checked 30 October 2026: `GET /qorechain/rdk/v1/rollups` returns an empty list on both). Several capabilities described below are not usable end to end today; the status is stated where each is described. For the developer-facing how-to, see [Rollups Overview](/rollups/overview).
:::

---

## Settlement Paradigms

QoreChain RDK supports four distinct settlement modes — **optimistic**, **zk**, **based**, and **sovereign** — each with different trust assumptions, finality characteristics, and proof requirements.

### Optimistic Settlement {#optimistic-settlement}

Optimistic rollups assume transactions are valid by default and rely on fraud proofs for dispute resolution.

* **Proof system**: Interactive fraud proofs
* **Challenge window**: 604,800 seconds (default, 7 days). **Before v3.2.4:** the chain converts this to blocks at a fixed 6 seconds per block, **100,800 blocks**, so the real elapsed time depends on actual block time (about 3.7 days at mainnet's current ≈3.1 s blocks); plan in blocks, not days. **From v3.2.4:** for a batch submitted from the upgrade height on, the window is measured in seconds of block time (a full 7 days). A batch submitted earlier keeps the block-count rule. The testnet applied v3.2.4 at height 8,337,253 (19 October 2026); mainnet applied it at height 3,742,566 (23 October 2026, governance proposal 13). The testnet's configured default is shorter, 3,600 seconds (1 hour), so a testnet rollup finalises faster than the 7 days described here.
* **Challenge bond**: 1,000 QOR (1,000,000,000 uqor) — required to submit a fraud proof challenge (`nft` and `custom` presets; the `defi`, `gaming` and `enterprise` presets set no bond because they have no challenge window)
* **Finality**: Delayed until the challenge window expires with no valid challenge
* **Auto-finalization**: The `EndBlocker` automatically finalizes batches once the challenge window has passed without dispute. A challenged batch is never auto-finalised: it must be resolved first, by any account (from v3.2.5, on mainnet since 29 October 2026 and on the testnet since 26 October; before v3.2.5 only the rollup creator could) (see [Deploying a Rollup](/rollups/deploying-a-rollup#challenge-a-batch-optimistic-rollups)).

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
* **Maturity**: SNARK batches are verified on-chain (Groth16 over BLS12-381) against a verifying key stored with the rollup. **ZK settlement cannot be used on either network yet:** the chain has no way to register a verification key for a rollup, so every ZK batch is refused after its fee is paid. Key registration is planned for chain v3.2.7. STARK verification is experimental: it is opt-in and checks a demonstration circuit, not your rollup's own state transition. Treat ZK settlement as not production-ready.

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
| **`nft`**        | optimistic (fraud)       | dedicated | native (Celestia DA planned) | standard | QoreChain Native | NFT minting, marketplaces, and digital collectibles |
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
The module defines blob storage, retention and pruning, but there is no transaction message for posting a blob in the current releases. A batch that names a data hash on a `native` or `both` rollup is refused because no matching blob can be stored. See [Data Availability](/rollups/data-availability). On native data availability a batch must therefore leave `data_hash` empty; the RDK client (0.7.0) does so, and the chain refuses a batch that claims one.
:::

| Parameter            | Value                                                                                               |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| **Max blob size**    | 2 MB (2,097,152 bytes)                                                                              |
| **Retention period** | 432,000 blocks (about 16 days at mainnet's current ≈3.1 s blocks; the figure moves with block time) |
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
| **Stopped** | Permanently decommissioned — what remains of the creator's escrow is returned (see [Escrow ledger](#escrow-ledger)) |

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

RDK 0.6.1 and later behaviour (0.7.0 is current): for an optimistic rollup the client builds a batch whose state root is the chain's canonical transition root (`batchTransitionRoot` in the RDK), not a free-form value of your own.

### Auto-Finalization Rules

| Settlement Mode | Finalization Trigger                                        |
| --------------- | ----------------------------------------------------------- |
| **Optimistic**  | 100,800 blocks after submission (default window) with no challenge; for batches submitted since v3.2.4 (testnet from height 8,337,253; mainnet from height 3,742,566, 23 October 2026), 604,800 seconds of block time |
| **ZK**          | Instant on valid proof submission                           |
| **Based**       | 2 L1 blocks after submission                                |
| **Sovereign**   | None — managed by the rollup's own consensus                |

Auto-finalization is executed in the `EndBlocker` for optimistic and based rollups. ZK batches are finalized inline during batch submission.

---

## Module Parameters

| Parameter                   |                          Default | Description                                      |
| --------------------------- | -------------------------------: | ------------------------------------------------ |
| `max_rollups`               |                              100 (testnet: 200) | Maximum number of rollups that can be registered |
| `min_stake_for_rollup`      | 10,000,000,000 uqor (10,000 QOR) | Minimum stake required to create a rollup        |
| `rollup_creation_burn_rate` |                        0.01 (1%) | Fraction of creation stake burned via `x/burn`   |
| `default_challenge_window`  | 604,800 s (testnet: 3,600 s) | Default optimistic challenge window; before v3.2.4 the chain converted it to 100,800 blocks |
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

Registration is **non-fatal**: if it fails (insufficient balance or limit reached), the rollup is still created, but it has no layer and cannot be anchored. A settlement anchor does not require the layer to be `active`: the layer an RDK rollup registers stays `proposed` and is still anchorable by its creator (see [Anchor Submission](/architecture/multilayer-architecture#anchor-submission)).

### State Anchoring {#state-anchoring}

A settlement batch can be anchored to `x/multilayer`, which records the layer ID, layer height (the batch index), state root, validator-set hash and transaction count under a post-quantum signature by the rollup creator.

* **Since v3.2.2 (live on mainnet and testnet):** `MsgSubmitBatch` has two optional fields. `anchor_signature` is the creator's ML-DSA-87 signature over the **v2 anchor sign bytes** of the batch (see [Reading Anchors](/architecture/multilayer-architecture#reading-anchors)); when it is present the batch is anchored in `x/multilayer` in the **same transaction**, and a refused anchor refuses the batch. `validator_set_hash` is the rollup's validator-set commitment carried in the anchor and covered by the signature. On the CLI: `qorechaind query rdk anchor-sign-bytes <layer-id> <batch-index> <state-root-hex> --chain-id <id> --tx-count <n>` prints the bytes to sign (`<layer-id>` is the rollup's layer id, which equals the rollup id for rollups created through the RDK), and `tx rdk submit-batch ... --anchor-signature <hex> --validator-set-hash <hex>` submits them.
* **Without the signature** the batch settles unanchored, exactly as before. A client that does not send the field produces unanchored batches, so check that the toolkit you use supports it: the TypeScript `@qorechain/rdk` 0.6.0 signs the anchor when its client signs hybrid and is the rollup's creator (and otherwise submits unanchored), while the Python, Go, Rust and Java clients do not build the field. No rollup, layer or anchor exists on either network yet, so no anchor has been written and that path is untested live.

See [Settlement Receipts](/rollups/settlement-receipts) for what an anchor does and does not prove.

---

## Escrow ledger and withdrawals {#escrow-ledger}

All rollups' escrow sits in one pooled module balance. Since **v3.2.3** (mainnet height 3,662,051, 20 October 2026) a per-rollup **escrow ledger** is the single account of what each rollup holds in that pool:

* `create-rollup` credits the ledger with the escrow the rollup actually keeps: the stake less the 1% creation burn.
* A withdrawal (`tx rdk execute-withdrawal`) and a fraud-proof reward are paid out of the ledger and debited from it. A withdrawal larger than what the rollup still holds is refused with an insufficient-escrow error.
* `stop-rollup` refunds only what is left in the ledger and zeroes it. A stopped rollup pays no further withdrawals.
* The read-only `RollupView` returned by the rollup queries carries `escrow_balance`: the uqor still held for that rollup.

Before v3.2.3 the ledger was credited with zero, so every withdrawal failed closed; `execute-withdrawal` can therefore succeed on mainnet only from v3.2.3 on. The checks a client should run before paying a fee: the denom must be exactly `uqor`, the amount must be positive, the Merkle proof has at most 64 levels with every sibling exactly 32 bytes, and the submitter and recipient must be valid `qor1…` addresses. A withdrawal also needs a finalized batch that committed a `withdrawals_root`, and each withdrawal leaf can be paid only once.

## Reading RDK state {#reading-state}

The RDK queries are served over REST on mainnet and testnet under `/qorechain/rdk/v1/`:

| Route | Returns |
| --- | --- |
| `/params` | Module parameters (the table above) |
| `/rollups` and `/rollup/{rollup_id}` | Rollup records, including `escrow_balance` |
| `/batches/{rollup_id}` | Batches, paged (`start_index`, `limit` default 50, at most 100, `next_index`) |
| `/batch/{rollup_id}/{batch_index}` and `/latest_batch/{rollup_id}` | One batch, or the newest one |
| `/blob/{rollup_id}/{blob_index}` | Blob metadata, including `expires_at_height` (the blob bytes are not returned) |

`qorechaind query rdk config` prints the module parameters (the route is `/params`; there is no `/config` route). Rollup and layer ids must match the id grammar in [Layer and rollup ids](/architecture/multilayer-architecture#id-grammar), enforced since v3.2.2.

---

## Burn Integration

On rollup creation, **1% of the stake amount** is burned via the `x/burn` module through the `rollup_create` burn channel. For example, creating a rollup with the minimum 10,000 QOR stake burns 100 QOR permanently. The remaining 9,900 QOR is held in escrow and, when the rollup is stopped, whatever is left of it is returned to the creator (withdrawals and fraud-proof rewards paid out of the escrow reduce the refund). The creation burn is enforced since chain version v3.2.0; earlier releases did not apply it.
