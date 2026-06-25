---
slug: /rollups/deploying-a-rollup
title: Deploying a Rollup
sidebar_label: Deploying a Rollup
sidebar_position: 3
---

# Deploying a Rollup

You can deploy an application-specific rollup two ways: through the **Dashboard** (a guided, no-code wizard) or through the **CLI** (full control over the on-chain transaction). This page covers both, plus the operator lifecycle and batch commands.

:::note
The commands below target the **`qorechain-diana`** testnet. Mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) has been live since 7 June 2026 running chain version **v3.1.70** — substitute the mainnet chain ID and endpoints when deploying on mainnet. Validate every deployment on testnet first.
:::

---

## Requirements

| Requirement | Details |
| ----------- | ------- |
| **Minimum stake** | A stake bond in QOR is escrowed when the rollup is created |
| **Creation burn** | A fraction of the staked amount is permanently burned on creation; the remainder is held in escrow and returned when the rollup is stopped |
| **Account** | A funded QoreChain account with enough balance for the stake plus transaction fees |

Query the live module parameters for the current minimum stake and burn rate before deploying:

```bash
qorechaind query rdk config
```

---

## Deploy via the Dashboard (Tools → Rollups)

The Dashboard provides a guided **Deploy a Rollup** wizard under **Tools → Rollups**. It is the fastest path for launching an app-specific rollup without assembling a transaction by hand.

### Steps

1. **Sign in.** The wizard requires an authenticated session to deploy and to list your existing deployments.
2. **Name your rollup.** Enter a rollup name (2–41 characters: letters, numbers, spaces, hyphens, or underscores).
3. **Pick a virtual machine.** QoreChain is a triple-VM chain, so your rollup can run any of:
   * **EVM** — Solidity / Vyper contracts with full Ethereum tooling (Hardhat, Foundry, MetaMask)
   * **CosmWasm** — Rust smart contracts on the Cosmos SDK runtime, with native IBC
   * **SVM** — the Solana Virtual Machine, for parallel-execution, high-throughput apps
4. **Choose a data-availability layer.** Where your rollup publishes transaction data so anyone can reconstruct state: **QoreChain DA**, **Celestia**, or **EigenDA**.
5. **Set a gas token.** The token used to pay for execution on your rollup. Defaults to **QOR**; enter a custom symbol to use your own native token.
6. **Choose a sequencer.** Who orders transactions before settlement: **Shared sequencer** (the QoreChain shared set), **Dedicated (single)** (run your own single sequencer), or **Decentralized** (a permissionless sequencer set).
7. **Choose a settlement target.** Where the rollup anchors its state roots and validity proofs: **QoreChain mainnet** or **Ethereum**.
8. **Deploy.** Submit the wizard. Provisioning is reviewed by **The Qore Trust** before the rollup goes live, so a freshly submitted rollup appears with a **provisioning** status until review completes.

Your submitted rollups appear in the **Your rollups** list with their VM, DA layer, gas token, sequencer, settlement target, and current status.

:::note
The Dashboard wizard presents friendly, product-level choices and routes provisioning through a reviewed pipeline. The CLI below works directly against the `x/rdk` module's on-chain message surface. The two share the same underlying concepts (VM, DA, sequencer, settlement) but expose them at different altitudes.
:::

---

## Deploy via the CLI

The CLI creates the rollup directly on-chain. `create-rollup` takes three positional arguments — the rollup ID, a profile, and the stake amount (in `uqor`) — plus an optional `--vm` flag.

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount] \
  --vm evm \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Example** — create a rollup from the `defi` preset:

```bash
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 \
  --vm evm \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Flags:**

| Flag | Default | Description |
| ---- | ------- | ----------- |
| `--vm` | `evm` | Rollup VM type: `evm`, `cosmwasm`, `svm`, or `custom` |

The `[profile]` argument selects a preset configuration — see **[Preset Profiles](/rollups/preset-profiles)**. The `[stake-amount]` is the bond in `uqor`.

### Inspect what you deployed

```bash
# Query a specific rollup by ID
qorechaind query rdk rollup my-defi-rollup

# List all registered rollups
qorechaind query rdk list-rollups
```

---

## Lifecycle management

A rollup moves through `pending`, `active`, `paused`, and `stopped` states. The creator manages transitions with the following commands.

### Pause

Temporarily halt the rollup. State is preserved and the rollup can be resumed. A reason string is required.

```bash
qorechaind tx rdk pause-rollup [rollup-id] [reason] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Resume

Resume a previously paused rollup.

```bash
qorechaind tx rdk resume-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Stop

Permanently decommission the rollup and release its stake. The staked QOR — minus the one-time creation burn — is returned to the creator.

```bash
qorechaind tx rdk stop-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

:::danger
Stopping a rollup is permanent. The rollup cannot be restarted after it is stopped.
:::

---

## Operator commands: batches and challenges

Rollup operators submit settlement batches, and challengers can dispute optimistic batches. These commands underpin the settlement layer described in **[Rollups Overview](/rollups/overview)** and **[ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)**.

### Submit a batch

Submit a settlement batch for a rollup. Takes the rollup ID, a batch index, and a hex-encoded state root.

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Challenge a batch

Challenge a submitted batch (for optimistic rollups). Takes the rollup ID and batch index; pass the fraud proof with `--proof`.

```bash
qorechaind tx rdk challenge-batch [rollup-id] [batch-index] \
  --proof <hex-encoded-fraud-proof> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

| Flag | Description |
| ---- | ----------- |
| `--proof` | Hex-encoded fraud proof |

### Inspect batches

```bash
# Latest batch for a rollup
qorechaind query rdk batch [rollup-id]

# A specific batch by index
qorechaind query rdk batch [rollup-id] --index 42
```

---

## Querying

| Command | Purpose |
| ------- | ------- |
| `qorechaind query rdk rollup [rollup-id]` | Details of a specific rollup |
| `qorechaind query rdk list-rollups` | All registered rollups |
| `qorechaind query rdk batch [rollup-id]` | Latest settlement batch (or `--index`) |
| `qorechaind query rdk config` | RDK module parameters |
| `qorechaind query rdk suggest-profile [use-case]` | Recommend a preset for a use case |

---

## Next steps

* **[Data Availability](/rollups/data-availability)** — native, Celestia, and redundant DA backends.
* **[ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)** — proof verification and the L2 → L1 withdrawal flow via `execute-withdrawal`.
