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
The per-preset values below match the shipped **`@qorechain/rdk`** profile defaults, which mirror the network's published profile table. They can still evolve as the RDK matures — query the live module parameters with `qorechaind query rdk config` (or `RdkClient.params()` from the SDK) for the authoritative configuration, and validate on the **`qorechain-diana`** testnet before mainnet.
:::

---

## The preset profiles

Each preset bundles a settlement paradigm (and the proof system its settlement requires), a sequencer mode, a data availability backend, a gas model, and a VM:

| Profile | Settlement (proof) | Sequencer | DA | Gas model | VM | Intended use case |
| ------- | ------------------ | --------- | -- | --------- | -- | ----------------- |
| **`defi`** | zk (SNARK) | dedicated | native | EIP-1559 | EVM | DeFi and AMM-style applications — lending markets, DEXs, and derivatives where fast finality and predictable fees matter |
| **`gaming`** | based | based | native | flat | custom | High-throughput, low-latency game state and in-game economies |
| **`nft`** | optimistic (fraud) | dedicated | native (Celestia DA planned) | standard | CosmWasm | NFT minting, marketplaces, and digital collectibles |
| **`enterprise`** | based | based | native | subsidized | EVM | Permissioned and consortium deployments with sponsored (subsidized) fees |
| **`custom`** | fully parameterized | fully parameterized | fully parameterized | fully parameterized | fully parameterized | Every field is user-defined — start from scratch and set each option yourself |

A few constraints follow from the [settlement → proof matrix](/rollups/overview): `optimistic` settlement uses `fraud` proofs, `zk` uses `snark` (or `stark`), and `based` and `sovereign` carry no proof. `based` settlement always pairs with the `based` sequencer mode. The `nft` preset settles natively today with **Celestia DA planned**.

Treat the four domain presets as sensible starting points and the **`custom`** profile as the fully open option. The precise bundled parameters can change between releases — query `rdk config` (below) for the authoritative values, then start from the closest preset and refine.

The [`create-qorechain-rollup`](/rollups/deploying-a-rollup#scaffold-a-project-with-create-qorechain-rollup) CLI scaffolds a runnable starter project — one template per profile (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`) — so you can go from a profile to working create/query code in one command.

---

## Getting a recommendation: `suggest-profile`

If you are unsure which preset fits, the `suggest-profile` query takes a plain-language description of your use case and returns a recommended profile.

```bash
qorechaind query rdk suggest-profile [use-case]
```

**Example:**

```bash
qorechaind query rdk suggest-profile "a lending protocol with predictable fees"
```

The suggestion is a helpful starting point — review the recommendation against your specific requirements (settlement guarantees, sequencer trust model, data availability needs, and VM) before committing to a configuration.

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
