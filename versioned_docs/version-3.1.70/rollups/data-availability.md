---
slug: /rollups/data-availability
title: Data Availability
sidebar_label: Data Availability
sidebar_position: 4
---

# Data Availability

Data availability (DA) is the guarantee that the transaction data behind a rollup's state is published somewhere anyone can read it — so that anyone can independently reconstruct and verify the rollup's state. The RDK supports three DA backends.

| Backend | What it is |
| ------- | ---------- |
| **`native`** | On-chain blob storage within QoreChain itself |
| **`celestia`** | Data availability via IBC to Celestia, a dedicated modular DA layer |
| **`both`** | Native and Celestia together, for redundancy |

:::caution
Data availability backends are part of the actively evolving RDK. Treat the maturity notes below as design intent and validate on the **`qorechain-diana`** testnet before relying on a backend in production.
:::

---

## Native DA (on-chain blob storage)

Native DA stores rollup transaction data as **blobs** directly on QoreChain. Each blob is committed and addressable so that the data behind a settlement batch can be retrieved and verified on-chain.

Key concepts:

* **Blobs.** Rollup transaction data is published as data-availability blobs, each associated with a rollup ID and a blob index.
* **Commitments.** Each blob carries a commitment (a hash of the blob data) so a blob can be verified against what was committed, without trusting the storer.
* **Namespaces.** Blobs can carry a rollup-specific namespace, keeping each rollup's data logically separated within shared storage.
* **Retention and pruning.** Native blobs are retained for a bounded window and then pruned to keep on-chain storage sustainable. After pruning, the raw blob data is removed while commitment metadata is retained, so the historical commitment remains verifiable even though the bytes are no longer stored on-chain.

The exact maximum blob size and retention window are governed by the live module parameters. Query them before you design around any specific limit:

```bash
qorechaind query rdk config
```

Native DA is the simplest option — it keeps everything inside QoreChain, inheriting the host chain's security and post-quantum cryptography, at the cost of consuming host-chain storage.

---

## Celestia DA (IBC to Celestia)

The `celestia` backend publishes data availability through IBC to **Celestia**, a dedicated modular DA network. This offloads blob storage from QoreChain to a purpose-built DA layer while still anchoring settlement on QoreChain.

:::note
Celestia DA is a maturing integration. In the current release it should be treated as not yet production-hardened — validate behaviour on testnet, and prefer `native` or `both` where you need a settled guarantee today.
:::

---

## Both (redundancy)

The `both` backend writes to **native and Celestia together**, giving redundancy across an on-chain store and an external modular DA layer. Choose `both` when you want the broadest availability surface and are willing to pay for storing data in two places.

Because the Celestia path is still maturing, treat `both` as native-with-redundancy-in-progress rather than a guarantee that two fully independent copies are settled today. Confirm current behaviour on testnet.

---

## Choosing a backend

| If you want... | Choose |
| -------------- | ------ |
| The simplest, fully on-chain option inheriting QoreChain security | **`native`** |
| To offload DA to a dedicated modular layer (maturing) | **`celestia`** |
| Maximum availability surface with redundancy (maturing) | **`both`** |

For how DA fits into the broader settlement picture, see **[Rollups Overview](/rollups/overview)**. For the lower-level module reference, see the **[Rollup Development Kit](/architecture/rollup-development-kit)** page.
