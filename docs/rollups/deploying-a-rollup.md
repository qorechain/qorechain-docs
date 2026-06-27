---
slug: /rollups/deploying-a-rollup
title: Deploying a Rollup
sidebar_label: Deploying a Rollup
sidebar_position: 3
---

# Deploying a Rollup

You can deploy an application-specific rollup three ways: through the **Dashboard** (a guided, no-code wizard), through the chain **CLI** (`qorechaind`, full control over the on-chain transaction), or programmatically with the **TypeScript RDK** (`@qorechain/rdk` plus the `create-qorechain-rollup` scaffolder). This page covers all three, plus the operator lifecycle and batch commands.

:::note
The commands below target the **`qorechain-diana`** testnet. Mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) has been live since 7 June 2026 running chain version **v3.1.77** — substitute the mainnet chain ID and endpoints when deploying on mainnet. Validate every deployment on testnet first.
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
4. **Choose a data-availability layer.** Where your rollup publishes transaction data so anyone can reconstruct state: **QoreChain DA**, **Celestia**, or **EigenDA**. Note that EigenDA is a Dashboard-level option, whereas the on-chain `x/rdk` DA backends are native, Celestia, or both — see [Data Availability](/rollups/data-availability).
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

:::tip
As of chain version **v3.1.74**, `create-rollup` **applies the chosen profile's preset automatically** — settlement mode, sequencer, DA, gas model, and VM are all taken from the preset. You no longer need to set them by hand (previously the message hardcoded a sovereign configuration). The `--vm` flag now **defaults to empty**, so the profile's VM applies unless you explicitly override it.
:::

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Example** — create a rollup from the `defi` preset (settlement, sequencer, DA, and VM all come from the preset; `defi` resolves to zk settlement on the EVM):

```bash
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Flags:**

| Flag | Default | Description |
| ---- | ------- | ----------- |
| `--vm` | *(empty — use the profile's VM)* | Override the rollup VM type: `evm`, `cosmwasm`, `svm`, or `custom`. Leave unset to apply the preset's VM. |

The `[profile]` argument selects a preset configuration that is applied automatically — see **[Preset Profiles](/rollups/preset-profiles)**. The `[stake-amount]` is the bond in `uqor`.

### Inspect what you deployed

```bash
# Query a specific rollup by ID
qorechaind query rdk rollup my-defi-rollup

# List all registered rollups
qorechaind query rdk list-rollups
```

---

## Deploy with the TypeScript RDK (`@qorechain/rdk`)

The Rollup Development Kit ships as two public npm packages that drive the same on-chain `x/rdk` module as the CLI, over public RPC/REST/gRPC/JSON-RPC and any cosmjs `OfflineSigner`:

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)** (`v0.4.0`) — the TypeScript SDK: a config builder with preset profiles, transaction helpers for the rollup and settlement-batch lifecycles, native DA, typed read clients, and the v0.4 additions — quantum-safe settlement receipts, the QCAI Rollup Copilot, cross-VM calldata helpers, and the watchtower.
* **`create-qorechain-rollup`** (`v0.4.0`) — a scaffolder that clones one runnable starter template per profile (including the `multivm-rollup` template).

These are published to npm. The repo also ships a published operator CLI, **`@qorechain/rdk-cli`** (`qorollup`, `v0.4.0`), with `doctor`, `create`, `status`, `watch`, `params`, `suggest`, lifecycle (`pause`/`resume`/`stop`), `keygen`, `manifest`, `withdraw`, and `faucet` commands, plus the v0.4 `receipt`, `advise`, and `watchtower` commands.

#### Python, Go, Rust, and Java clients

Alongside the TypeScript package, the RDK provides full **Python**, **Go**, **Rust**, and **Java** clients that mirror the TypeScript surface: the config builder with validation, the five preset profiles, denom/economics/bech32 utilities, binary-Merkle and withdrawal-proof helpers, rollup manifests, REST and `qor_` JSON-RPC read clients, preflight/health checks, accounts (mnemonic → `qor` address), and **transaction signing + broadcast** (`SIGN_MODE_DIRECT`). All are verified against shared cross-language golden vectors and are **published** to their registries:

```bash
# Python — installs as qorechain-rdk, imports as qorrdk
pip install qorechain-rdk

# Rust
cargo add qorechain-rdk

# Go
go get github.com/qorechain/qorechain-rdk/packages/go

# Java (Maven / Gradle)
# io.github.qorechain:qorechain-rdk:0.4.0
```

```python
import qorrdk
```

Current published versions: Python `qorechain-rdk` **0.4.0** (PyPI, import `qorrdk`), Rust `qorechain-rdk` **0.4.0** (crates.io), Go module `github.com/qorechain/qorechain-rdk/packages/go`, and Java `io.github.qorechain:qorechain-rdk` **0.4.0** (Maven Central). Live broadcast requires a node endpoint.

:::note
The TypeScript RDK and its templates target the **`qorechain-diana`** testnet and are marked **coming soon** for full end-to-end flows. Pin versions and validate on testnet.
:::

### Scaffold a project with `create-qorechain-rollup`

Each profile has a matching starter template (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`). Scaffold one with either form:

```bash
npm create qorechain-rollup my-rollup
# or
npx create-qorechain-rollup my-rollup
```

For non-interactive / CI use, pass the template and network explicitly:

```bash
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --yes
```

The scaffolder prints the documented stake and creation-burn cost and the next steps to create your rollup and read its status.

### Create a rollup from code

Build a config from a preset, read the live stake and burn rate from the chain, then create the rollup with a signing client. The config builder enforces the settlement → proof compatibility matrix on `validate()` / `build()`.

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// A config builder pre-filled with the defi preset's defaults; override via .set({ ... }).
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

const rdk = createRdkClient({ network: "testnet" });

// Read the live module parameters — never hardcode the stake or burn rate.
const params = await rdk.params();
const cost = estimateCreationCost({
  stakeUqor: params.minStakeForRollup,
  burnRate: params.rollupCreationBurnRate,
});
console.log(`Stake: ${uqorToQor(cost.stakeUqor)} QOR — burned: ${uqorToQor(cost.burnUqor)} QOR`);

// Connect a signing client with any cosmjs OfflineSigner.
const tx = await rdk.connectTx(signer, { gasPrice: "0.025uqor" });
const msg = config.toCreateMsg(tx.address, { stakeAmount: params.minStakeForRollup });

const res = await tx.createRollup({
  rollupId: msg.rollupId,
  profile: msg.profile,
  vmType: msg.vmType,
  stakeAmount: msg.stakeAmount,
});
console.log(`Submitted: ${res.transactionHash} (code ${res.code})`);
```

Not sure which profile fits? `rdk.suggestProfile("a lending protocol with predictable fees")` returns a QCAI-assisted recommendation (with a documented fallback).

### Manage the lifecycle and read state from code

The signing client exposes the full lifecycle — `pauseRollup`, `resumeRollup`, `stopRollup`, plus `submitBatch`, `challengeBatch`, `resolveChallenge`, and `executeWithdrawal`. The lifecycle transitions can be guarded by passing `currentStatus`.

```ts
await tx.pauseRollup({ rollupId: "my-defi-rollup", reason: "maintenance" });
await tx.resumeRollup({ rollupId: "my-defi-rollup" });
await tx.stopRollup({ rollupId: "my-defi-rollup" });
```

Read state with the typed REST client (no signer required):

```ts
const rollup = await rdk.rest.getRollup("my-defi-rollup");
console.log(rollup.status, rollup.settlementMode, rollup.daBackend, rollup.vmType);

const batch = await rdk.rest.getLatestBatch("my-defi-rollup");
console.log(batch.batchIndex, batch.status, batch.txCount);
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

Challenge a submitted batch (for optimistic rollups). Takes the rollup ID and batch index; pass the fraud proof with `--proof`. As of chain version **v3.1.74**, the optimistic **submit-batch → challenge-batch** path is live and working end-to-end.

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
