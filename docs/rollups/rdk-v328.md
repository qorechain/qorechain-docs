---
slug: /rollups/rdk-v328
title: "RDK on v3.2.8: What Changed"
sidebar_label: RDK on v3.2.8
sidebar_position: 11
---

# RDK on v3.2.8: What Changed

QoreChain release v3.2.8 changes how rollups settle. Rollups can now put their data on the chain, let the chain order their transactions (based sequencing), settle optimistically with a fraud proof that re-runs the batch, keep their posts private to a set of members, and bind Groth16 withdrawal roots in a way that accepts any 32-byte root. STARK settlement is paused until a later release. This page describes what each change does and how to use it. It is for rollup operators and developers who build on the `x/rdk` module.

:::caution Testnet only for now

v3.2.8 runs on the public testnet `qorechain-diana` since 12 November 2026. Mainnet has not applied it yet, so every feature on this page is refused there until it does. Treat the examples as testnet examples.

:::

:::note Which tools can do this today

* **Node command line (`qorechaind`)**: every message on this page has a command. This is the Linux node binary; there is no packaged macOS binary, so on a Mac run it on a Linux host or read the chain over REST.
* **RDK kit**: the latest published release of `@qorechain/rdk` is 0.8.0, and it does not carry v3.2.8 support. Support for these messages, the new batch rules and the new proof helpers arrives in the next RDK release. Until then, use the command line or the raw message for anything that changes state. The read-only helpers `RestClient.getParams`, `getRollup` and `getLatestBatch` work, but the 0.8.0 views do not show the new fields, so read those with `curl` as shown below.
* **Python, Go, Rust and Java RDK clients**: same status as TypeScript. A later release adds this; use the command line or the raw message until then.

:::

## What changed at a glance {#at-a-glance}

| Area | Behaviour from v3.2.8 |
| --- | --- |
| Data posting | `MsgPostRollupData` puts a payload in a transaction and keeps a commitment on chain under the rollup's next inbox sequence. |
| Based sequencing | The chain orders a rollup's transactions by their inclusion. Set at creation or by governance with `MsgSetRollupSequencing`. |
| Optimistic rollups | New optimistic rollups (`nft`, `custom`) run the `qledger-v1` execution model and must be based. A fraud proof re-executes the batch. |
| Submitter bond | Batches on a `qledger-v1` rollup need a bond (`MsgBondRollupSubmitter`). An upheld fraud proof burns half and pays half to the challenger. |
| Deposits | `MsgDepositToRollup` credits a 32-byte account on a `qledger-v1` rollup. |
| Private rollups | `defi` rollups created with privacy `encapsulated` accept only ML-KEM-1024 envelopes to their members (`MsgSetRollupMembers`). |
| Groth16 inputs | Inputs are read modulo the BLS12-381 scalar field. `withdrawals_root` may be any 32 bytes and is stored reduced. |
| STARK | STARK keys and STARK batches are refused until a later release. |
| Retention | Posted-data commitments are kept for `posted_data_retention_blocks`, with checkpoints kept longer on `qledger-v1` rollups. |

## Why it matters {#why}

Before v3.2.8 a rollup's data had no place on the chain, so anyone checking a batch had to trust the sequencer's copy. Posting data and ordering by inclusion removes that trust: the chain itself records what was posted and in what order, and a batch must consume exactly that range. For optimistic rollups, a challenge now checks execution rather than only a root, so a wrong batch loses its submitter's bond. Private rollups let a group share data on a public chain without publishing it.

## Posting rollup data {#posting-data}

`MsgPostRollupData` (command `tx rdk post-data`) sends a payload in a transaction. The bytes stay in the transaction, so they are in the block. The chain keeps a commitment under the rollup's next inbox sequence (starting at 1): the SHA-256 of the data, its size, the poster and the height. It also extends the rollup's inbox accumulator.

* **Who may post**: the rollup's sequencer (its creator when no sequencer address is set). On a based rollup, anyone.
* **Size**: at most `max_posted_data_bytes` per post (default 131,072 bytes, hard ceiling 1 MiB) and `max_posted_data_bytes_per_block` across all rollups (default 524,288 billable bytes).
* **Fee**: `posted_data_fee_per_byte` uqor per billable byte (default 10), and a post is billed for at least 1 KiB. The fee goes to the fee collector and is split like a transaction fee. Gas is charged on top.
* **Retention**: the commitment is pruned after `posted_data_retention_blocks` (default 648,000). The bytes stay in block history.
* **Use in a batch**: a batch of a native-DA rollup that is not based may reference a retained post with `data_hash` equal to the SHA-256 of the data.

Command line (Linux node binary):

```bash
# Post a file's raw bytes to a rollup
qorechaind tx rdk post-data my-rollup @payload.bin --from <key> --chain-id qorechain-diana

# Or post hex
qorechaind tx rdk post-data my-rollup 68656c6c6f --from <key> --chain-id qorechain-diana

# Read a commitment back (the payload itself is in the transaction at its height)
qorechaind query rdk posted-data my-rollup 1
```

Read a commitment over REST (verified on the testnet, see [Checked routes](#checked-routes)):

```bash
curl -s https://api-testnet.qore.host/qorechain/rdk/v1/posted_data/<rollup-id>/1
```

The response carries `data_hash`, `size`, `poster`, `height`, `inbox_acc` and `expires_at_height`. A sequence that was never posted, or was pruned, returns HTTP 404.

## Based sequencing {#based-sequencing}

A based rollup is ordered by inclusion on QoreChain. Each post gets the next inbox sequence, and every batch consumes the inbox in order.

* Create a rollup as based with `--sequencing based`, or move an existing rollup with governance `MsgSetRollupSequencing`.
* Each batch sets `inbox_end` (the sequence of the last post it consumes) and carries the inbox range commitment as `data_hash`. Ask the chain for it with `query rdk inbox` (it returns `range_data_hash`).
* A based rollup is paused, resumed and stopped by governance only.

Who may submit batches on a based rollup depends on the rollup:

| Rollup | Who submits batches |
| --- | --- |
| zk with a Groth16 key (`defi`) | Any account. The proof binds the roots, the inbox range and the withdrawals root. |
| based settlement (`gaming`, `enterprise`) | The rollup's sequencer only. |
| optimistic with `qledger-v1` (`nft`, `custom`) | Any account holding a submitter bond. |

Optimistic rollups without `qledger-v1` and STARK rollups cannot be based in this release.

```bash
# Create a based defi rollup (a Groth16 key is registered separately with set-verification-key)
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 --sequencing based --from <key> --chain-id qorechain-diana

# Inbox head, consumed position and the range hash for a batch ending at the head
qorechaind query rdk inbox my-defi-rollup

# Range hash for a batch that ends earlier
qorechaind query rdk inbox my-defi-rollup --inbox-end 12
```

The accumulator and the range commitment, for provers that want to compute them without trusting a node:

```
acc_n = SHA-256("qorechain/rdk/inbox/v1" | lp(chain_id) | lp(rollup_id) | acc_(n-1)
                | be64(n) | be64(height) | lp(poster) | SHA-256(data))
range = SHA-256("qorechain/rdk/inbox-range/v1" | lp(chain_id) | lp(rollup_id)
                | be64(from) | be64(to) | acc_from | acc_to)
```

`acc_0` is 32 zero bytes and `lp` is a 4-byte big-endian length prefix.

## Optimistic rollups with qledger-v1 {#qledger-v1}

From v3.2.8 a new optimistic rollup cannot be created without an execution VM. The `nft` and `custom` presets need `--execution-vm qledger-v1` together with `--sequencing based`. Optimistic rollups created before v3.2.8 are unchanged.

`qledger-v1` is an account ledger in uqor (a sparse Merkle tree with SHA-256) with signed transfers and withdrawals. Account keys are ML-DSA-44 only. Its inputs are its inbox:

* **User posts**: one transaction each, at most 6 KiB.
* **Deposits**: `MsgDepositToRollup` credits a 32-byte account id. The chain appends the deposit to the inbox itself.

```bash
qorechaind tx rdk create-rollup my-nft-rollup nft 10000000000 \
  --execution-vm qledger-v1 --sequencing based --from <key> --chain-id qorechain-diana

# Deposit 1,000,000 uqor (1 QOR) for a 32-byte L2 account id
qorechaind tx rdk deposit my-nft-rollup <64-hex-chars> 1000000 --from <key> --chain-id qorechain-diana
```

### Submitter bond and pending {#submitter-bond}

Any account may submit batches once it holds a submitter bond of at least `min_submitter_bond` (default 1,000 QOR, 1,000,000,000 uqor) on that rollup.

```bash
qorechaind tx rdk bond-submitter my-nft-rollup 1000000000 --from <key> --chain-id qorechain-diana
qorechaind query rdk submitter-bond my-nft-rollup <submitter-address>
qorechaind tx rdk unbond-submitter my-nft-rollup --from <key> --chain-id qorechain-diana
```

The bond query returns `amount`, `last_submit_time`, `unbond_after` and `pending`. `pending` is the number of that submitter's batches still waiting for finality: it goes up on each submitted batch and down when one is finalized or rejected. A submitter may have fewer than 1,024 batches pending. A bond can be taken back with `unbond-submitter` a full challenge window after the holder's last batch.

### Batch rules {#batch-rules}

Let `consumed` be the inbox position the next batch starts from and `head` the last post (both in `query rdk inbox`). A batch with `inbox_end = end` is admitted when all of these hold:

1. The submitter holds at least `min_submitter_bond` and has fewer than 1,024 batches pending.
2. `consumed < end <= head`. A batch consumes at least one entry.
3. `end - consumed <= 64`. At most 64 inbox entries per batch.
4. The chain can still produce the accumulator at `end`: `end` is the head, or the commitment of post `end` is retained (`query rdk inbox <rollup> --inbox-end <end>` returns a `range_data_hash`).
5. A batch of fewer than 64 entries that stops before the head stops either just before a post made in the last 20 blocks, or at a checkpoint (`end` is a multiple of 64) whose next post is no longer retained.
6. `data_hash` is the inbox range commitment from `consumed` to `end`, the first batch starts from the empty ledger root, and `state_root` is 32 bytes.

A client can choose `end` like this:

```
want = min(head, consumed + 64)
if want == head or retained(want):
    end = want                          # to the head, or a full batch of 64
else:
    end = (consumed // 64 + 1) * 64     # the next checkpoint, which is retained
```

Submit with the command line:

```bash
qorechaind tx rdk submit-batch my-nft-rollup 0 <state-root-hex> \
  --prev-state-root <hex> --tx-count 4 --inbox-end 4 \
  --data-hash <range_data_hash from query rdk inbox> \
  --withdrawals-root <hex> --from <key> --chain-id qorechain-diana
```

### Fraud proofs {#fraud-proofs}

During the challenge window anyone may send `MsgChallengeBatch` with a `qledger-v1` fraud proof: the batch's inputs and a Merkle witness of the accounts they touch. The chain re-executes the batch.

* If the state root or the withdrawals root is wrong, the batch is rejected, and so is every batch built on it. The inbox rolls back.
* The submitter's whole bond is slashed. **Half is burned and half is paid to the challenger.** A submitter that challenges its own wrong batch still loses half of its bond.
* A proof that does not show a wrong batch fails with error 51 and changes nothing.

```bash
qorechaind tx rdk challenge-batch my-nft-rollup 1 --proof <hex-fraud-proof> --from <key> --chain-id qorechain-diana
```

Building the proof bytes needs the kit's `qledger-v1` helpers, which arrive in the next RDK release. Until then a challenger builds the proof with its own tooling.

Batches that are not challenged finalize on their own when the challenge window ends. Withdrawals are paid from finalized batches only, from the rollup's deposit pool, never from the creator's escrow. A rollup cannot be stopped while the pool holds deposits (error 54).

### Retention and idle periods {#retention}

* A post commitment is kept for `posted_data_retention_blocks`, and then, while no finalized batch covers it, for up to 4 more retention periods.
* After that it is pruned, except a checkpoint: every post whose sequence is a multiple of 64 keeps its commitment until a finalized batch covers it, or until the rollup is stopped.
* A stopped rollup keeps no commitment past its retention period.
* `posted_data_retention_blocks` must be at least the longest challenge window in force, counted as one block per second (`default_challenge_window` and the window of every rollup that is not stopped). A parameter update that leaves it shorter, or raises a window above it, is refused with `invalid params`. The upper bound is 25,920,000.
* At the v3.2.8 upgrade, a stored value below that window is raised to it. Default parameters are left as they are.

After a long idle period, with more than 64 unconsumed posts and their commitments pruned, a submitter catches up in order: one batch to the next multiple of 64 if `consumed` is not one, then full batches of 64 from checkpoint to checkpoint, then a last batch to the head (or to any retained position under rule 5). In normal operation nothing changes: batch up to 64 entries, to the head or to just before a recent post.

## Private rollups {#private-rollups}

A `defi` (Groth16) rollup created with privacy `encapsulated` accepts only posts that are ML-KEM-1024 envelopes to its members.

An envelope encrypts the data once with AES-256-GCM under a fresh key, and encapsulates that key to every member's ML-KEM-1024 key from the chain's KEM registry. A key commitment makes sure all members open the same content. The chain checks that the envelope is well formed and that each entry names the member's current key. It never decrypts.

* The creator sets the members with `MsgSetRollupMembers`: at most 32, each with a registered ML-KEM-1024 key. Each change starts a new membership epoch.
* Posts, the poster, timing, sizes, members, roots and withdrawals (recipient and amount) stay public. Only the post contents are private.

```bash
qorechaind tx rdk create-rollup my-private-rollup defi 10000000000 --privacy encapsulated \
  --verification-key-file vk.json --from <key> --chain-id qorechain-diana

qorechaind tx rdk set-members my-private-rollup <addr1>,<addr2> --from <key> --chain-id qorechain-diana

# Encrypt to the members and post, in one step
qorechaind tx rdk post-private-data my-private-rollup @message.bin --from <key> --chain-id qorechain-diana

# A member opens a post offline
qorechaind tx rdk decrypt-private-data my-private-rollup @envelope.hex
```

## Groth16 inputs and the withdrawals root {#groth16}

A Groth16 batch over BLS12-381 (the `defi` profile, SNARK) is verified against public inputs, each one a 32-byte value read as a big-endian integer and reduced modulo the scalar field order:

```
r = 0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001
input_i = int.from_bytes(value_i, "big") mod r
values  = prev_state_root, state_root, data_hash, withdrawals_root
```

A batch submitted before withdrawals were bound has the first three inputs only. The prover's witness must take the same reduced values.

Whether a value must already be below `r` depends on who sets it:

| Value | Who sets it | Must be below r |
| --- | --- | --- |
| `state_root` | the prover | yes |
| `prev_state_root` | the chain (the latest settled `state_root`), except on a rollup's first batch | first batch only |
| `data_hash` | the chain when bound (a based rollup's inbox range, a posted-data commitment), otherwise the prover | only when not bound |
| `withdrawals_root` | the chain (the withdrawal tree root that `MsgExecuteWithdrawal` rebuilds) | no |

What this means for a client:

* Submit the withdrawals root as the tree gives it. It may be any 32 bytes.
* The chain stores `withdrawals_root mod r` as 32 big-endian bytes. The batch query shows that stored value, with `withdrawals_root_reduced` true. About 55 percent of tree roots are at or above `r`, so the stored value often differs from the submitted bytes.
* `MsgExecuteWithdrawal` does not change for the client: send the leaf fields and the sibling hashes. The chain rebuilds the root and accepts the withdrawal when `rebuilt_root mod r == stored_root mod r`.
* Two submissions of the same batch whose roots differ by a multiple of `r` are the same batch. The first settles, the second is refused as a batch that already exists, and every withdrawal in the tree is paid against the stored root.
* After settlement, compare the stored root with `tree_root mod r`, not with `tree_root`.

Optimistic, `qledger-v1` and Groth16 batches from before the reduction rule store and compare the exact 32 bytes. For the tree and leaf encoding, see [ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals).

## STARK settlement is paused {#stark}

The only STARK statement the verifier supports proves iterated squaring between two 64-bit values. That does not constrain a rollup's withdrawals or data. From v3.2.8 a STARK key cannot be set and a STARK rollup's batches are refused (error 52). Governance can move such a rollup to a Groth16 key. STARK settlement returns in a later release with a real rollup statement.

## New messages {#messages}

| Message | Command | Who sends it |
| --- | --- | --- |
| `MsgPostRollupData` | `tx rdk post-data` | The sequencer, or anyone on a based rollup |
| `MsgSetRollupSequencing` | governance proposal | Governance |
| `MsgDepositToRollup` | `tx rdk deposit` | Anyone, for a `qledger-v1` rollup |
| `MsgBondRollupSubmitter` | `tx rdk bond-submitter` | A batch submitter |
| `MsgUnbondRollupSubmitter` | `tx rdk unbond-submitter` | A batch submitter |
| `MsgSetRollupMembers` | `tx rdk set-members` | The creator of a private rollup |
| `MsgSubmitBatch` field `inbox_end` | `tx rdk submit-batch --inbox-end` | The submitter of a based rollup's batch |

`create-rollup` also takes `--sequencing`, `--execution-vm` and `--privacy`. The compatibility matrix is now: optimistic with fraud proofs needs `qledger-v1` and based sequencing, and ZK settlement means SNARK.

## Worked flow: create, bond, deposit, post, batch, challenge, finalize, withdraw {#worked-flow}

:::caution Untested here

The RDK kit has no end-to-end example for this flow yet, and none of these commands was run for this page. They follow the node CLI definitions. Run them on the testnet with a funded test key and read each result before moving on.

:::

```bash
CHAIN="--chain-id qorechain-diana --from <key>"

# 1. Create an optimistic, based qledger-v1 rollup (needs the creation stake)
qorechaind tx rdk create-rollup my-nft-rollup nft 10000000000 \
  --execution-vm qledger-v1 --sequencing based $CHAIN

# 2. Bond the submitter (at least min_submitter_bond)
qorechaind tx rdk bond-submitter my-nft-rollup 1000000000 $CHAIN

# 3. Deposit funds for an L2 account
qorechaind tx rdk deposit my-nft-rollup <64-hex-account-id> 1000000 $CHAIN

# 4. Post a signed L2 transaction (one transaction, at most 6 KiB)
qorechaind tx rdk post-data my-nft-rollup @signed-l2-tx.bin $CHAIN

# 5. Read the range hash, execute the entries off chain, then submit the batch
qorechaind query rdk inbox my-nft-rollup
qorechaind tx rdk submit-batch my-nft-rollup 0 <new-state-root> --tx-count <n> \
  --inbox-end <end> --data-hash <range_data_hash> --withdrawals-root <root> $CHAIN

# 6. A challenger who finds a wrong root sends a fraud proof inside the window
qorechaind tx rdk challenge-batch my-nft-rollup 0 --proof <hex-fraud-proof> $CHAIN

# 7. An unchallenged batch finalizes by itself when the challenge window ends
qorechaind query rdk batch my-nft-rollup --index 0   # status finalized

# 8. Withdraw from the finalized batch (anyone may submit the proof)
qorechaind tx rdk execute-withdrawal my-nft-rollup 0 <withdrawal-index> <recipient> uqor <amount> \
  --proof <sibling-hex>,<sibling-hex> $CHAIN
```

The challenge window of a rollup is in its `challenge_window_sec` (the testnet default is 3,600 seconds, so a test batch finalizes within an hour). Steps 5 to 8 need roots and proofs computed from the ledger; the RDK kit's `qledger-v1` helpers do that from the next release on.

## Reading the chain with the published TypeScript kit {#typescript}

These reads use names that exist in `@qorechain/rdk` 0.8.0. They return the fields the 0.8.0 views know, which do not include the new v3.2.8 fields; use `curl` for those.

```ts
import { RestClient } from "@qorechain/rdk";

const rest = new RestClient("https://api-testnet.qore.host");

const params = await rest.getParams();
const rollup = await rest.getRollup("my-nft-rollup");
const latest = await rest.getLatestBatch("my-nft-rollup");
console.log(params, rollup, latest);
```

This snippet was not executed for this page.

## Checked routes {#checked-routes}

These read-only routes were requested from the public testnet on 12 November 2026.

| Route | Status |
| --- | --- |
| `GET /qorechain/rdk/v1/params` | 200 |
| `GET /qorechain/rdk/v1/rollups` | 200 |
| `GET /qorechain/rdk/v1/rollup/<id>` | 200 |
| `GET /qorechain/rdk/v1/inbox/<id>` and `?inbox_end=N` | 200 |
| `GET /qorechain/rdk/v1/posted_data/<id>/<sequence>` | 200, or 404 for a sequence never posted or pruned |
| `GET /qorechain/rdk/v1/submitter_bond/<id>/<address>` | 200 |
| `GET /qorechain/rdk/v1/batches/<id>`, `latest_batch/<id>`, `batch/<id>/<index>` | 200 |
| any route for an unknown rollup | 404 |

```bash
BASE=https://api-testnet.qore.host/qorechain/rdk/v1
curl -s $BASE/params
curl -s $BASE/inbox/<rollup-id>
curl -s $BASE/submitter_bond/<rollup-id>/<address>
curl -s $BASE/latest_batch/<rollup-id>
```

The module parameters now include `max_posted_data_bytes`, `max_posted_data_bytes_per_block`, `posted_data_fee_per_byte`, `posted_data_retention_blocks`, `min_submitter_bond` and `finalized_batch_retention_blocks`. The batch view adds `inbox_start`, `inbox_end` and `withdrawals_root_reduced`, and the rollup view adds `sequencing`, `execution_vm`, `privacy`, `members`, `members_epoch` and `deposit_pool`. The inbox response has `head_sequence`, `consumed_sequence` and `range_data_hash`, which is empty when the commitment at the requested end is not available.

## Limits and errors {#limits}

| Limit or error | Value or meaning |
| --- | --- |
| Post size | `max_posted_data_bytes`, default 131,072 bytes, ceiling 1 MiB |
| Posted bytes per block | `max_posted_data_bytes_per_block`, default 524,288 billable bytes |
| Post fee | 10 uqor per billable byte by default, at least 1 KiB billed |
| Posted-data retention | 648,000 blocks by default, at most 25,920,000, never below the longest challenge window in seconds |
| `qledger-v1` post | One transaction, at most 6 KiB |
| Batch size | 1 to 64 inbox entries |
| Batches pending per submitter | fewer than 1,024 |
| Private rollup members | at most 32, each with a registered ML-KEM-1024 key |
| Batches settled per block, per rollup | `max_batches_per_block`, default 10 (error 40) |
| Error 41, 44, 47 | The feature is not enabled at this height (the network has not applied v3.2.8) |
| Error 42, 43 | Post too large, or the block's post limit is reached |
| Error 45 | Based sequencing is not available for this rollup |
| Error 46 | The batch does not match the rollup's inbox (wrong `inbox_end` or `data_hash`) |
| Error 48 | Invalid execution or privacy mode |
| Error 49 | Submitter bond required |
| Error 50 | Submitter bond is still locked |
| Error 51 | The fraud proof does not show the batch invalid |
| Error 52 | STARK settlement is paused |
| Error 53 | The post is not a valid envelope to the rollup's members |
| Error 54 | The rollup still holds user deposits, so it cannot be stopped |

## Related pages {#related}

* [Rollups Overview](/rollups/overview)
* [Preset Profiles](/rollups/preset-profiles)
* [Deploying a Rollup](/rollups/deploying-a-rollup)
* [Data Availability](/rollups/data-availability)
* [ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)
* [Watchtower](/rollups/watchtower)
