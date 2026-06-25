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
The exact configuration behind each preset — settlement mode, sequencer, data availability, VM, block time, and gas/fee parameters — is **resolved on-chain** and may evolve as the RDK matures. The descriptions below are indicative use-case guidance, not a guarantee of specific per-preset values. Query the live module parameters with `qorechaind query rdk config` for the authoritative configuration, and validate on the **`qorechain-diana`** testnet before mainnet.
:::

---

## The preset profiles

| Profile | Intended use case (qualified) |
| ------- | ----------------------------- |
| **`defi`** | Tuned for DeFi and AMM-style applications — lending markets, DEXs, and derivatives where finality characteristics and predictable fees matter |
| **`gaming`** | Intended for high-throughput, low-latency game state and in-game economies |
| **`nft`** | Tuned for NFT minting, marketplaces, and digital collectibles |
| **`social`** | Intended for social and content applications with frequent, lightweight actions |
| **`general`** | A balanced, general-purpose default for mixed workloads |

Treat these as starting points. Each preset is intended to be a sensible default for its category; the precise bundled parameters are owned by the chain and can change between releases. When in doubt, start from a preset and refine.

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
