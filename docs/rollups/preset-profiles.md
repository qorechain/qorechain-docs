---
slug: /rollups/preset-profiles
title: Preset Profiles
sidebar_label: Preset Profiles
sidebar_position: 2
---

# Preset Profiles

The RDK ships **preset profiles** that provide turnkey rollup configurations tuned for common application categories. A preset bundles a settlement mode, sequencer mode, data availability backend, and execution parameters, so you can launch a rollup without hand-picking every option.

A profile is passed positionally to `create-rollup`:

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount]
```

:::note
The per-preset values below match the shipped **`@qorechain/rdk`** profile defaults, which mirror the network's published profile table. No rollup has been created on either network yet. Query the live module parameters with `qorechaind query rdk config` (or `rdk.params()` from `@qorechain/rdk`, which reads `GET /qorechain/rdk/v1/params`, served on both networks) for the authoritative configuration, and validate on the **`qorechain-diana`** testnet before mainnet.
:::

---

## The preset profiles

Each preset bundles a settlement paradigm (and the proof system its settlement requires), a sequencer mode, a data availability backend, a gas model, and a VM:

| Profile | Settlement (proof) | Sequencer | DA | Gas model | VM | Intended use case |
| ------- | ------------------ | --------- | -- | --------- | -- | ----------------- |
| **`defi`** | zk (SNARK); **not usable yet, see below** | dedicated | native | EIP-1559 | EVM | DeFi and AMM-style applications — lending markets, DEXs, and derivatives where fast finality and predictable fees matter |
| **`gaming`** | based | based | native | flat | custom | High-throughput, low-latency game state and in-game economies |
| **`nft`** | optimistic (fraud) | dedicated | native (Celestia DA planned) | standard | QoreChain Native (`native`) | NFT minting, marketplaces, and digital collectibles |
| **`enterprise`** | based | based | native | subsidized | EVM | Permissioned and consortium deployments with sponsored (subsidized) fees |
| **`custom`** | fully parameterized (defaults: optimistic / fraud) | fully parameterized | fully parameterized | fully parameterized | fully parameterized (default: EVM) | Every field is user-defined — start from scratch and set each option yourself |

A few constraints follow from the [settlement → proof matrix](/rollups/overview): `optimistic` settlement uses `fraud` proofs, `zk` uses `snark` (or `stark`), and `based` and `sovereign` carry no proof. `based` settlement always pairs with the `based` sequencer mode. The `nft` preset settles natively today with **Celestia DA planned**.

As of RDK v0.4.2, the Wasm VM option (the runtime that executes QoreChain Native contracts) is named **`native`** — QoreChain Native. `cosmwasm` remains an accepted legacy alias, and both map to `cosmwasm` on the wire, so the chain, explorer, and Dashboard are unchanged.

:::note
Per-preset configuration was checked against the chain's profile table in the v3.2.3 source; the table is unchanged in the v3.2.4 source (mainnet) and the v3.2.6 source (testnet), checked 27 October 2026. In it, `create-rollup` applies the profile's preset automatically: **`defi` = zk + EVM, `gaming` = based + custom VM, `nft` = optimistic + QoreChain Native (Wasm), `enterprise` = based + EVM, `custom` = optimistic + EVM (defaults)**. The `custom` preset leaves every field open — the values shown are its starting defaults.
:::

Treat the four domain presets as sensible starting points and the **`custom`** profile as the fully open option. The precise bundled parameters can change between releases — query `rdk config` (below) for the authoritative values, then start from the closest preset and refine.

The [`create-qorechain-rollup`](/rollups/deploying-a-rollup#scaffold-a-project-with-create-qorechain-rollup) CLI scaffolds a runnable starter project — one template per profile (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`) — so you can go from a profile to working create/query code in one command.

---

## What a preset carries on-chain {#what-a-preset-carries}

Some details are easy to assume and are worth knowing before you pick a profile:

* **`defi` cannot be used on either network yet.** It settles with a ZK proof, which needs a verification key registered for the rollup. The chain has no way to register one, so every ZK batch from a `defi` rollup (and from the `defi-rollup` template) is refused after its fee is paid. Key registration is planned for chain v3.2.7. The template's demo circuit also cannot verify against the chain's public inputs, and from RDK 0.7.0 the template stops before sending a batch so that no fee is wasted. Until then choose `nft` or `custom` (optimistic settlement); see [ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals).
* **`nft` and `custom`** settle optimistically with a 1,000 QOR challenge bond and a challenge window of 100,800 blocks on mainnet before v3.2.4 (the default 604,800 "seconds" converted at a fixed 6 seconds per block; about 3.7 days at mainnet's current ≈3.1 s blocks). From v3.2.4 a batch gets a window measured in seconds of block time instead: on the testnet from height 8,337,253 (19 October 2026), on mainnet from height 3,742,566 (23 October 2026). The module's default window is 604,800 seconds on mainnet and 3,600 seconds on the testnet (read on 27 October 2026), so check `GET /qorechain/rdk/v1/params` on the network you target.
* **`gaming` and `enterprise`** use `based` sequencing, which today means the rollup's creator submits batches.
* **Block time and transaction limits** (for example `defi` 500 ms, `gaming` 200 ms, `nft` 2,000 ms, `enterprise` and `custom` 1,000 ms) are stored in the on-chain record. They describe the rollup's own chain and are not enforced by the host chain.

---

## Choosing a profile {#getting-a-recommendation}

The `suggest-profile` query and the RDK's `suggestProfile()` helper are meant to recommend a preset from a plain-language description. They rely on the `qor_suggestRollupProfile` JSON-RPC method, which the public endpoints do not serve, so `suggestProfile()` currently always returns `defi` as a **fallback**, and `qorechaind query rdk suggest-profile` only prints a pointer to that RPC. Pick a profile from the table above instead, and review it against your requirements (settlement guarantees, sequencer trust model, data availability needs, and VM).

---

## Inspecting preset configuration on-chain

Because preset specifics are resolved on-chain, the authoritative way to see what a profile resolves to is to query the module and the created rollup:

```bash
# Module-level parameters that govern rollup creation and defaults
qorechaind query rdk config

# After creation, inspect the resolved configuration of a specific rollup
qorechaind query rdk rollup [rollup-id]

# List all registered rollups
qorechaind query rdk list-rollups
```

This pattern — query `config` before you deploy, then query `rollup` after — lets you confirm exactly what your chosen preset produced, rather than relying on documented values that may evolve.

---

## Next steps

* **[Deploying a Rollup](/rollups/deploying-a-rollup)** — create a rollup from a preset via the Dashboard or the CLI, then manage its lifecycle.
* **[Rollups Overview](/rollups/overview)** — the settlement paradigms and sequencer modes a preset bundles.
* **[Rollup Development Kit](/architecture/rollup-development-kit)** — the lower-level module reference.
