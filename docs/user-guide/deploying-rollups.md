---
slug: /user-guide/deploying-rollups
title: Deploying Rollups
sidebar_label: Deploying Rollups
sidebar_position: 6
---

# Deploying Rollups

This guide is a short orientation to launching an application-specific rollup that settles on QoreChain with the Rollup Development Kit (RDK). The step-by-step commands live in **[Deploying a Rollup](/rollups/deploying-a-rollup)**; this page covers what you need before you start.

:::caution Early-stage capability
No rollup has been created on either network yet. Mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) runs chain version **v3.2.1**; the testnet (**`qorechain-diana`**, EVM chain ID **9800**) runs a newer release (**v3.2.2**). Validate on testnet first.
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
| **nft**        | optimistic (fraud)  | dedicated | native (Celestia DA planned) | standard | CosmWasm | NFT minting and marketplace workloads |
| **enterprise** | based               | based     | native          | subsidized   | EVM      | Permissioned and consortium deployments with sponsored fees |
| **custom**     | defaults: optimistic (fraud) | dedicated | native | standard | EVM | Starting defaults; adjust what the message allows |

See [Preset Profiles](/rollups/preset-profiles) for details and maturity notes (for example, a `defi` rollup created through the CLI cannot yet finalise ZK batches, and `based` sequencing currently means the creator submits).

---

## Requirements {#requirements}

| Requirement | Details |
| ----------- | ------- |
| **Rollup stake** | At least 10,000 QOR (`min_stake_for_rollup`, 10,000,000,000 uqor). Read the live value: `qorechaind query rdk config` |
| **Creation burn** | 1 % of the stake you supply is burned on creation; the remainder is escrowed and returned when you stop the rollup |
| **Layer registration stake** | Creating a rollup also registers a layer with the multilayer module, which locks a further 1,000 QOR from the creator (returned when the rollup is stopped). Without that balance the layer is not created and the rollup cannot be anchored |
| **Account** | A funded account with a registered post-quantum key (every native-lane transaction is hybrid-signed) |

---

## Tips {#tips}

* Start with a preset profile. Presets set the settlement mode, sequencer, data-availability backend and VM; `create-rollup` takes only the id, the profile, the stake and an optional `--vm`.
* The 1 % creation burn applies to the stake you supply.
* The rollup creator is the batch submitter today (no sequencer address is set by any preset), so keep the creator key safe: only the creator can pause, resume or stop the rollup.
* The `suggest-profile` helper currently returns a fixed `defi` fallback on the public endpoints, so choose from the profile table.

---

## Next steps {#next-steps}

* [Deploying a Rollup](/rollups/deploying-a-rollup) — create, operate and stop a rollup from the CLI or TypeScript.
* [Rollups Overview](/rollups/overview) — settlement modes, sequencers, proof systems.
* [Data Availability](/rollups/data-availability) and [ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals).
