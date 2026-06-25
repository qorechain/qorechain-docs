---
slug: /user-guide/deploying-rollups
title: Deploying Rollups
sidebar_label: Deploying Rollups
sidebar_position: 6
---

# Deploying Rollups

This guide covers how to deploy application-specific rollups on QoreChain using the Rollup Development Kit (RDK). The RDK provides preset profiles for common use cases and full customization for advanced deployments.

:::caution
The RDK and the rollup settlement layer are an actively evolving capability. Treat the parameters, presets, and maturity of individual features below as subject to change, and validate deployments on **`qorechain-diana`** before targeting mainnet.
:::

:::note
The commands below use the **`qorechain-diana`** testnet (EVM chain ID **9800**). Mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) has been live since 7 June 2026 running chain version **v3.1.70** — substitute the mainnet chain ID and endpoints from the **Connecting to Mainnet** page when deploying on mainnet.
:::

---

## Overview

The QoreChain RDK allows developers to launch sovereign rollups that settle on QoreChain. Each rollup is an independent execution environment with its own block time, virtual machine, and fee model, while inheriting QoreChain's security and data availability guarantees.

---

## Preset Profiles

The RDK ships with five preset profiles, each tuned for a common application category:

| Profile     | Intended use case                                                  |
| ----------- | ------------------------------------------------------------------ |
| **defi**    | Preset tuned for DeFi/AMM applications (lending, DEXs, derivatives) |
| **gaming**  | Intended for high-throughput game state and real-time experiences  |
| **nft**     | Tuned for NFT minting and marketplace workloads                    |
| **social**  | Intended for social and content applications                       |
| **general** | Balanced, general-purpose default profile                          |

:::note
The exact configuration behind each preset — settlement mode, sequencer, data availability, and gas/fee parameters — is detailed in the **Rollups architecture** section. Preset specifics may evolve as the RDK matures, so treat the descriptions above as indicative rather than authoritative.
:::

---

## Requirements

Before deploying a rollup, ensure you meet the following requirements:

| Requirement       | Details                                                                                |
| ----------------- | -------------------------------------------------------------------------------------- |
| **Minimum Stake** | 10,000 QOR (10,000,000,000 uqor)                                                       |
| **Creation Burn** | 1% of the staked amount is permanently burned on rollup creation                       |
| **Account**       | A funded QoreChain account with sufficient balance for the stake plus transaction fees |

---

## Creating a Rollup from a Preset

Deploy a rollup using one of the preset profiles:

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "my-defi-rollup" \
  --profile defi \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Example:** Deploy a gaming rollup:

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "battle-arena" \
  --profile gaming \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Creating a Custom Rollup

For full control over rollup parameters, use the `custom` profile and specify each option:

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "my-rollup" \
  --profile custom \
  --settlement optimistic \
  --sequencer dedicated \
  --da-backend native \
  --vm-type evm \
  --block-time 1000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Custom parameters:**

| Parameter      | Options                                       | Description                        |
| -------------- | --------------------------------------------- | ---------------------------------- |
| `--settlement` | `optimistic`, `zk`, `based`, `sovereign`      | How state transitions are verified |
| `--sequencer`  | `dedicated`, `shared`, `based`                | Transaction ordering strategy      |
| `--da-backend` | `native`, `external`                          | Data availability layer            |
| `--vm-type`    | `evm`, `cosmwasm`, `custom`                   | Execution environment              |
| `--block-time` | Integer (milliseconds)                        | Target block production interval   |

---

## Submitting Batches

Rollup operators submit transaction batches to QoreChain for settlement:

```bash
qorechaind tx rdk submit-batch \
  --rollup-id "my-rollup" \
  --state-root <hex_encoded_state_root> \
  --tx-count 500 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Example:**

```bash
qorechaind tx rdk submit-batch \
  --rollup-id "my-rollup" \
  --state-root a1b2c3d4e5f6... \
  --tx-count 500 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Rollup Lifecycle Management

Rollup operators can manage the lifecycle of their deployments:

1. **Pause a Rollup** — Temporarily halt block production. The rollup state is preserved and can be resumed.

   ```bash
   qorechaind tx rdk pause-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

2. **Resume a Rollup** — Resume block production on a paused rollup:

   ```bash
   qorechaind tx rdk resume-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

3. **Stop a Rollup (Permanent)** — Permanently stop a rollup. This action is **irreversible**.

   ```bash
   qorechaind tx rdk stop-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

:::danger
Stopping a rollup is permanent. All associated state is archived but the rollup cannot be restarted. The staked QOR (minus the creation burn) is returned to the operator.
:::

---

## Querying Rollups

Get details about a specific rollup:

```bash
qorechaind query rdk rollup <rollup_id>
```

List all rollups on QoreChain:

```bash
qorechaind query rdk rollups
```

**Sample output:**

```yaml
rollup:
  id: "my-defi-rollup"
  owner: qor1abc...xyz
  profile: defi
  settlement: zk
  vm_type: evm
  block_time: 500ms
  status: active
  total_batches: 1247
  last_state_root: "a1b2c3d4..."
```

---

## QCAI-Assisted Profile Suggestion

Not sure which profile fits your use case? Use the QCAI-assisted suggestion tool:

```bash
qorechaind query rdk suggest-profile --use-case "defi lending protocol"
```

**Sample output:**

```yaml
suggested_profile: defi
confidence: 0.94
reasoning: "DeFi lending protocols benefit from ZK settlement for fast finality, EVM compatibility for Solidity smart contracts, and EIP-1559 fee model for predictable gas costs."
alternative_profile: general
```

This command analyzes your description and recommends the most suitable preset profile along with an explanation.

---

## Tips

* Start with a preset profile and customize later. Presets are optimized for their target use cases.
* The 1% creation burn is a one-time cost applied to the minimum stake at deployment time.
* Use `based` settlement if you want the simplest setup with QoreChain validators handling sequencing.
* Monitor batch submissions closely. Gaps in batch submission can trigger alerts from the network.
* The `suggest-profile` command is a helpful starting point, but review the recommendation against your specific requirements.
