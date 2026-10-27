---
slug: /user-guide/deploying-rollups
title: Deploying Rollups
sidebar_label: Deploying Rollups
sidebar_position: 6
---

# Deploying Rollups

This guide is a short orientation to launching an application-specific rollup that settles on QoreChain with the Rollup Development Kit (RDK). The step-by-step commands live in **[Deploying a Rollup](/rollups/deploying-a-rollup)**; this page covers what you need before you start.

:::caution Early-stage capability
No rollup has been created on either network yet (checked 27 October 2026). Mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) runs chain version **v3.2.4** since 23 October 2026; the testnet (**`qorechain-diana`**, EVM chain ID **9800**) runs v3.2.6 (since 27 October 2026), and its default challenge window is 1 hour rather than 7 days. Validate on testnet first; the challenge-window behaviour is described in [Rollup Development Kit](/architecture/rollup-development-kit#optimistic-settlement).
:::

---

## What a rollup is here {#what-a-rollup-is-here}

A QoreChain rollup is an application-specific chain that **executes off-chain** and uses QoreChain for **settlement**: you register the rollup on-chain, post state-root batches, and (optionally) post data blobs and withdrawal commitments. The on-chain record carries a profile, a settlement mode, a sequencer mode, a data-availability backend, a gas model and a VM label; the host chain does not run your rollup's transactions.

---

## Preset Profiles {#preset-profiles}

The RDK ships with five preset profiles, each tuned for a common application category:

| Profile        | Settlement (proof)  | Sequencer | DA              | Gas model    | VM       | Intended use case |
| -------------- | ------------------- | --------- | --------------- | ------------ | -------- | ----------------- |
| **defi**       | zk (SNARK)          | dedicated | native          | EIP-1559     | EVM      | DeFi/AMM applications (lending, DEXs, derivatives) |
| **gaming**     | based               | based     | native          | flat         | custom   | High-throughput game state and real-time experiences |
| **nft**        | optimistic (fraud)  | dedicated | native (Celestia DA planned) | standard | QoreChain Native | NFT minting and marketplace workloads |
| **enterprise** | based               | based     | native          | subsidized   | EVM      | Permissioned and consortium deployments with sponsored fees |
| **custom**     | defaults: optimistic (fraud) | dedicated | native | standard | EVM | Starting defaults; adjust what the message allows |

See [Preset Profiles](/rollups/preset-profiles) for details and maturity notes (for example, ZK settlement, and so the `defi` profile, cannot be used on either network yet, and `based` sequencing currently means the creator submits).

---

## Requirements {#requirements}

| Requirement | Details |
| ----------- | ------- |
| **Rollup stake** | At least 10,000 QOR (`min_stake_for_rollup`, 10,000,000,000 uqor). Read the live value: `qorechaind query rdk config` |
| **Creation burn** | 1 % of the stake you supply is burned on creation; the remainder is escrowed in a per-rollup ledger. When you stop the rollup you get back what is left in it (withdrawals and fraud-proof rewards paid out of it reduce the refund) |
| **Rollup id** | 3 to 64 characters: lowercase letters, digits, `.`, `_` and `-`, starting with a letter or digit. An id that breaks this is refused after you have paid the fee, so check it first (the TypeScript RDK 0.6.0 checks it before it broadcasts) |
| **Layer registration stake** | Creating a rollup also registers a layer with the multilayer module, which locks a further 1,000 QOR from the creator (returned when the rollup is stopped). Without that balance the layer is not created and the rollup cannot be anchored |
| **Account** | A funded account with a registered post-quantum key (every native-lane transaction is hybrid-signed) |

---

## Tips {#tips}

* Start with a preset profile. Presets set the settlement mode, sequencer, data-availability backend and VM; `create-rollup` takes only the id, the profile, the stake and an optional `--vm`.
* The 1 % creation burn applies to the stake you supply.
* Batches settle without an anchor unless you send the creator's post-quantum signature with them (`--anchor-signature` on `tx rdk submit-batch`, available since v3.2.2). See [State Anchoring](/architecture/rollup-development-kit#state-anchoring).
* Withdrawals to L1 (`tx rdk execute-withdrawal`) are paid from your rollup's escrow ledger and work on mainnet since v3.2.3; they need a finalized batch with a withdrawals root and use `uqor` only.
* The rollup creator is the batch submitter today (no sequencer address is set by any preset), so keep the creator key safe: only the creator can pause, resume or stop the rollup.
* The RDK is published in five languages (version 0.6.2 on npm, PyPI, crates.io and the Go module proxy, and 0.6.1 on Maven Central until 0.6.2 is live there; checked 27 October 2026), but only the TypeScript client signs hybrid transactions, and only when you give it your post-quantum keypair; the `qorollup` CLI and the Python, Go, Rust and Java clients sign classical-only, which both networks refuse. See [RDK changes and limits](/rollups/deploying-a-rollup#rdk-050-limits).
* The `suggest-profile` helper currently returns a fixed `defi` fallback on the public endpoints, so choose from the profile table.

---

## Next steps {#next-steps}

* [Deploying a Rollup](/rollups/deploying-a-rollup) — create, operate and stop a rollup from the CLI or TypeScript.
* [Rollups Overview](/rollups/overview) — settlement modes, sequencers, proof systems.
* [Data Availability](/rollups/data-availability) and [ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals).
