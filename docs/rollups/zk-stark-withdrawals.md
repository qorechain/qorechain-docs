---
slug: /rollups/zk-stark-withdrawals
title: ZK / STARK & Withdrawals
sidebar_label: ZK / STARK & Withdrawals
sidebar_position: 5
---

# ZK / STARK & Withdrawals

This page covers two related topics: the **ZK proof systems** (`snark` and `stark`) used by ZK-settled rollups, and the **L2 → L1 withdrawal flow** that moves funds from a rollup back to QoreChain once a batch is finalized.

:::caution
ZK and STARK verification are an actively maturing part of the RDK. Treat the proof systems and the withdrawal flow described here as design intent, validate on the **`qorechain-diana`** testnet, and do not assume production-hardened cryptographic guarantees on mainnet yet.
:::

---

## ZK proof systems

A ZK-settled rollup (`zk` settlement mode) attaches a validity proof to each settlement batch, proving the state transition is correct without re-executing the rollup's transactions. ZK settlement supports two proof systems:

| Proof system | Characteristics |
| ------------ | --------------- |
| **`snark`** | Succinct proofs |
| **`stark`** | Transparent proofs — no trusted setup |

The `zk` settlement mode requires one of `snark` or `stark`; the pairing is enforced on-chain when the rollup is created. By contrast, `optimistic` settlement uses the `fraud` proof system, and `based` and `sovereign` settlement use `none`. See **[Rollups Overview](/rollups/overview)** for the full compatibility matrix.

### Finality

Unlike optimistic rollups — which wait out a fraud-proof challenge window — a ZK batch can finalize on **valid proof verification**, without a dispute window. This is the core trade-off of ZK settlement: stronger, faster finality in exchange for the cost and complexity of generating proofs.

### Maturity

ZK and STARK proof verification are still maturing. Treat ZK settlement as **not yet production-hardened**: prototype and validate on testnet, and track the RDK's release notes for the status of full proof verification before relying on it for value-bearing mainnet rollups.

---

## How batches carry withdrawals

When a rollup settles a batch, that batch can also commit the rollup's outbound cross-layer messages — its **L2 → L1 withdrawals**. Conceptually:

* A finalized batch can carry a commitment to its set of withdrawals (a Merkle root over the batch's withdrawal messages).
* Each individual withdrawal is a leaf under that root, identified by its batch index and a withdrawal index.
* Once the batch is finalized, any party can prove that a specific withdrawal leaf is included under the committed root, and trigger payout.

This is why withdrawals depend on settlement: a withdrawal can only be executed against a **finalized** batch, because finalization is what makes the committed withdrawals root canonical.

For how batches are submitted and finalized — including `submit-batch` and the `challenge-batch` dispute path for optimistic rollups — see **[Deploying a Rollup](/rollups/deploying-a-rollup)**.

---

## Executing a withdrawal: `execute-withdrawal`

The `execute-withdrawal` command finalizes an L2 → L1 withdrawal against a finalized batch's withdrawals root. It proves that a withdrawal leaf is committed in that root and pays the recipient from the rdk module escrow. The action is **permissionless** — anyone may submit a valid proof.

```bash
qorechaind tx rdk execute-withdrawal \
  [rollup-id] [batch-index] [withdrawal-index] [recipient] [denom] [amount] \
  --proof <sibling-hash-1>,<sibling-hash-2>,... \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Positional arguments:**

| Argument | Description |
| -------- | ----------- |
| `rollup-id` | The rollup the withdrawal belongs to |
| `batch-index` | The finalized batch whose withdrawals root commits this withdrawal |
| `withdrawal-index` | The index of the withdrawal leaf within that batch |
| `recipient` | The address to pay out to |
| `denom` | The denomination to pay |
| `amount` | The amount to pay |

**Flag:**

| Flag | Description |
| ---- | ----------- |
| `--proof` | Comma-separated hex Merkle sibling hashes, ordered from leaf to root, that prove the withdrawal leaf is committed in the batch's withdrawals root |

The `--proof` value is the inclusion proof: the sibling hashes along the path from the withdrawal leaf up to the batch's committed withdrawals root. The module recomputes the root from the leaf and the supplied siblings and checks it against the finalized batch's committed root before releasing escrowed funds.

---

## End-to-end withdrawal flow

1. **Settle a batch.** The rollup operator submits a settlement batch with `submit-batch`. The batch can commit a withdrawals root over its outbound L2 → L1 messages.
2. **Finalize.** The batch finalizes according to the rollup's settlement mode — on valid proof verification for `zk`, or after the challenge window for `optimistic` (during which `challenge-batch` may dispute it).
3. **Prove and execute.** Once finalized, anyone submits `execute-withdrawal` with the Merkle inclusion proof (`--proof`) for the specific withdrawal leaf. The module verifies inclusion against the finalized batch's withdrawals root and pays the recipient from escrow.

Because step 3 is permissionless and proof-based, a withdrawal does not depend on the rollup operator's cooperation once the batch carrying it is finalized.

---

## Related

* **[Rollups Overview](/rollups/overview)** — settlement paradigms and the proof-system compatibility matrix.
* **[Deploying a Rollup](/rollups/deploying-a-rollup)** — `submit-batch` and `challenge-batch` operator commands.
* **[Rollup Development Kit](/architecture/rollup-development-kit)** — the lower-level module reference.
