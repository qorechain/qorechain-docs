---
slug: /rollups/data-availability
title: Data Availability
sidebar_label: Data Availability
sidebar_position: 4
---

# Data Availability

Data availability (DA) is the guarantee that the transaction data behind a rollup's state is published somewhere anyone can read it — so that anyone can independently reconstruct and verify the rollup's state. The RDK defines three DA backends; today only `native` is implemented.

| Backend | What it is | Status |
| ------- | ---------- | ------ |
| **`native`** | On-chain blob storage within QoreChain itself | Implemented in the module; no public way to post a blob yet (see below) |
| **`celestia`** | Data availability via IBC to Celestia, a dedicated modular DA layer | Not implemented |
| **`both`** | Native and Celestia together, for redundancy | Behaves exactly like `native` today |

:::caution Early-stage capability
No rollup has been created on either network yet, and the DA backends are only partly implemented. The status of each backend is stated below; validate on the **`qorechain-diana`** testnet before relying on any of them.
:::

---

## Native DA (on-chain blob storage)

Native DA is the on-chain blob store inside `x/rdk`: each blob is keyed by rollup ID and blob index, carries a **SHAKE-256 commitment** of its bytes, and is pruned after the retention window while its commitment is kept.

:::caution No public way to post a blob yet
The module defines blob storage, retention and pruning, but there is **no transaction message for posting a blob** in the current releases. Until a submit message ships, a settlement batch must leave `data_hash` empty — a batch that names a data hash on a `native` or `both` rollup is refused because no matching blob can be stored.
:::

Key concepts:

* **Blobs.** A blob is associated with a rollup ID and a blob index.
* **Commitments.** Each blob carries a 32-byte SHAKE-256 commitment of its data, so a blob can be verified against what was committed, without trusting the storer. (The TypeScript helper `buildDaBlob()` currently hashes with SHA-256, so its `dataHash` does not match the chain's commitment.)
* **Namespaces.** Blobs can carry a rollup-specific namespace, keeping each rollup's data logically separated within shared storage.
* **Retention and pruning.** Native blobs are retained for `blob_retention_blocks` (432,000 blocks — about 16 days at mainnet's current ≈3.2 s block time; the figure moves with block time) and then pruned to keep on-chain storage sustainable. After pruning, the raw blob data is removed while commitment metadata is retained, so the historical commitment remains verifiable even though the bytes are no longer stored on-chain.

The maximum blob size and retention window are governed by the live module parameters. Query them before you design around any specific limit:

```bash
qorechaind query rdk config
```

---

## Celestia DA (IBC to Celestia)

Celestia DA is **not implemented**. A rollup whose DA backend is `celestia` cannot post data (the module returns an error). The planned design publishes data availability through IBC to **Celestia**, a dedicated modular DA network, while still anchoring settlement on QoreChain; no IBC channel exists on either network today (see [Bridge Architecture](/architecture/bridge-architecture)). Use `native`.

---

## Both (redundancy)

The `both` backend is intended to write to **native and Celestia together**. Today `both` behaves exactly like `native`: only the native copy is stored, and the Celestia half is skipped with a logged warning. Do not treat it as two independent copies.

---

## Choosing a backend

| If you want... | Choose |
| -------------- | ------ |
| The simplest, fully on-chain option inheriting QoreChain security | **`native`** |
| To offload DA to a dedicated modular layer | **`celestia`** — not implemented |
| Redundancy across two stores | **`both`** — same as `native` today |

For how DA fits into the broader settlement picture, see **[Rollups Overview](/rollups/overview)**. For the lower-level module reference, see the **[Rollup Development Kit](/architecture/rollup-development-kit)** page.
