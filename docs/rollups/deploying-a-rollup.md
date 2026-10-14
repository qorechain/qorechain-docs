---
slug: /rollups/deploying-a-rollup
title: Deploying a Rollup
sidebar_label: Deploying a Rollup
sidebar_position: 3
---

# Deploying a Rollup

You can set up an application-specific rollup three ways: through the **Dashboard** (a request form, not an on-chain transaction), through the chain **CLI** (`qorechaind`, full control over the on-chain transaction), or with the **TypeScript RDK** (`@qorechain/rdk` plus the `create-qorechain-rollup` scaffolder), which today covers configuration and reads. This page covers all three, plus the operator lifecycle and batch commands.

:::caution Early-stage capability
No rollup has been created on either network yet. The commands below use the **`qorechain-diana`** testnet (EVM chain ID **9800**, chain version **v3.2.2**). Mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) runs chain version **v3.2.1**; this page describes mainnet behaviour, and the testnet's newer release can differ in detail. Validate every deployment on testnet first.
:::

:::note Fees and signing
The network enforces a minimum gas price of `0.1uqor`, so a bare `--fees 500uqor` is refused, and every native-lane transaction needs the hybrid post-quantum co-signature. The CLI samples on this page therefore build the transaction with `--generate-only` and cosign it with `qorechaind tx pqc cosign`, which signs and broadcasts it (create the key once with `qorechaind tx pqc gen-key`, and register it on-chain once with `qorechaind tx pqc register-key`, or through QoreX or the SDK, which do it for you). The fee is fixed when the unsigned file is generated, so set the gas limit and the fee together: the fee must be at least the gas limit × 0.1 uqor. Gas limits below are indicative — simulate before you rely on them. See [First Transaction](/getting-started/first-transaction) and [Post-Quantum Signing](/developer-guide/post-quantum-signing).
:::

---

## Requirements

| Requirement | Details |
| ----------- | ------- |
| **Minimum stake** | At least 10,000 QOR (`min_stake_for_rollup`); the stake is escrowed when the rollup is created |
| **Creation burn** | 1 % of the stake you supply is permanently burned on creation (a creation that cannot apply the burn is refused); the remainder is held in escrow and returned when the rollup is stopped |
| **Layer registration stake** | Creation also registers the rollup's layer in the multilayer module, which locks a further **1,000 QOR** (`min_sidechain_stake`) from the creator, returned when the layer is decommissioned on stop. If the layer cannot be registered (balance too low, or the multilayer sidechain limit of 10 is reached) the rollup is still created but has no layer, so its batches cannot be anchored |
| **Rollup id** | Use 3–64 characters: lower-case letters, digits, `.`, `_` and `-`, starting with a letter or digit. Newer chain releases enforce this rule, so use it from the start |
| **Account** | A funded QoreChain account with a registered post-quantum key, with enough balance for the stake, the layer stake and transaction fees |

Query the live module parameters for the current minimum stake and burn rate before deploying:

```bash
qorechaind query rdk config
```

---

## Deploy via the Dashboard (Tools → Rollups)

The Dashboard has a **Deploy a Rollup** form under **Tools → Rollups**. It is a **request form**: submitting it records a provisioning request for your account, reviewed by **The Qore Trust**, and a new request shows a **provisioning** status. It does **not** broadcast an on-chain `create-rollup` transaction — to register a rollup on-chain, use the CLI below.

### Steps

1. **Sign in.** The form requires an authenticated session to submit a request and to list your existing requests.
2. **Name your rollup.** Enter a rollup name (2–41 characters: letters, numbers, spaces, hyphens, or underscores).
3. **Pick a virtual machine.** The on-chain record stores a VM label. Your rollup executes off-chain in its own runtime; the choice does not run on QoreChain's own EVM, CosmWasm or SVM lanes:
   * **EVM** — Solidity / Vyper contracts with full Ethereum tooling (Hardhat, Foundry, MetaMask)
   * **CosmWasm** — Rust smart contracts on the Cosmos SDK runtime, with native IBC
   * **SVM** — the Solana Virtual Machine, for parallel-execution, high-throughput apps
4. **Choose a data-availability layer.** Where your rollup publishes transaction data so anyone can reconstruct state: **QoreChain DA**, **Celestia**, or **EigenDA**. Note that EigenDA is a Dashboard-level option, whereas the on-chain `x/rdk` DA backends are native, Celestia, or both — see [Data Availability](/rollups/data-availability).
5. **Set a gas token.** The token used to pay for execution on your rollup. Defaults to **QOR**; enter a custom symbol to use your own native token.
6. **Choose a sequencer.** Who orders transactions before settlement: **Shared sequencer** (the QoreChain shared set), **Dedicated (single)** (run your own single sequencer), or **Decentralized** (a permissionless sequencer set).
7. **Choose a settlement target.** Where the rollup anchors its state roots and validity proofs: **QoreChain mainnet** or **Ethereum**.
8. **Submit the request.** Provisioning is reviewed by **The Qore Trust**, so a freshly submitted request appears with a **provisioning** status until review completes.

Your submitted requests appear in the **Your rollups** list with their VM, DA layer, gas token, sequencer, settlement target, and current status.

:::note
The form's options (virtual machine, data-availability layer, gas token, sequencer, settlement target) describe what you are asking for; they are broader than what the on-chain `x/rdk` module currently supports. On-chain, data availability is `native` (Celestia is not active), and sequencing is by the rollup creator or a configured sequencer address. See [Data Availability](/rollups/data-availability).
:::

---

## Deploy via the CLI

The CLI creates the rollup directly on-chain. `create-rollup` takes three positional arguments — the rollup ID, a profile, and the stake amount (in `uqor`) — plus an optional `--vm` flag.

:::tip
Since chain version **v3.1.74**, `create-rollup` **applies the chosen profile's preset automatically** — settlement mode, sequencer, DA, gas model, and VM are all taken from the preset. You no longer need to set them by hand (previously the message hardcoded a sovereign configuration). The `--vm` flag now **defaults to empty**, so the profile's VM applies unless you explicitly override it.
:::

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 600000 --fees 60000uqor \
  --generate-only > create-rollup.json
```

**Example** — create a rollup from the `defi` preset (settlement, sequencer, DA, and VM all come from the preset; `defi` resolves to zk settlement on the EVM). Build the unsigned transaction, then attach the post-quantum co-signature and broadcast:

```bash
# 1. Build the unsigned transaction (10,000 QOR stake)
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 600000 --fees 60000uqor \
  --generate-only > create-rollup.json

# 2. Cosign with your post-quantum key and broadcast
qorechaind tx pqc cosign create-rollup.json \
  --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

A ZK profile such as `defi` is accepted at creation, but a rollup created this way does not carry a verifying key, so its ZK batches cannot be finalised yet (see [ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)).

**Flags:**

| Flag | Default | Description |
| ---- | ------- | ----------- |
| `--vm` | *(empty — use the profile's VM)* | Override the rollup VM type: `evm`, `cosmwasm`, `svm`, or `custom`. Leave unset to apply the preset's VM. (In the RDK clients the Wasm runtime is the **`native`** VM type — QoreChain Native — with `cosmwasm` kept as a legacy alias; `cosmwasm` is the on-wire value, which is what this chain-level flag takes.) |

:::note The VM label is metadata
`--vm` records which runtime your rollup uses. The host chain only settles the rollup; it does not execute its contracts. The host chain's own CosmWasm upload is currently closed and its SVM transaction lane is disabled network-wide, which does not affect settlement of an off-chain rollup but does mean you cannot deploy contracts for a rollup onto those host-chain lanes.
:::

The `[profile]` argument selects a preset configuration that is applied automatically — see **[Preset Profiles](/rollups/preset-profiles)**. The `[stake-amount]` is the bond in `uqor`; the creation burn is 1 % of it.

### Inspect what you deployed

```bash
# Query a specific rollup by ID
qorechaind query rdk rollup my-defi-rollup

# List all registered rollups
qorechaind query rdk list-rollups
```

---

## Deploy with the TypeScript RDK (`@qorechain/rdk`) {#deploy-with-the-typescript-rdk-qorechainrdk}

The Rollup Development Kit ships as two public npm packages for the same on-chain `x/rdk` module as the CLI. Today they are most useful for building and validating configurations and for reading state; see the signing caution below before you rely on them to send transactions:

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)** (`v0.4.4`) — the TypeScript SDK: a config builder with preset profiles, transaction helpers for the rollup and settlement-batch lifecycles, native DA, typed read clients, and the v0.4 additions — quantum-safe settlement receipts, the QCAI Rollup Copilot, cross-VM calldata helpers, and the watchtower.
* **`create-qorechain-rollup`** (`v0.4.4`) — a scaffolder that clones one runnable starter template per profile (including the `multivm-rollup` template).

These are published to npm. The repo also ships a published operator CLI, **`@qorechain/rdk-cli`** (`qorollup`, `v0.4.4`), with `doctor`, `create`, `status`, `watch`, `params`, `suggest`, lifecycle (`pause`/`resume`/`stop`), `keygen`, `manifest`, `withdraw`, and `faucet` commands, plus the v0.4 `receipt`, `advise`, and `watchtower` commands.

Highlights since the initial v0.4.0 release:

* **v0.4.2 — works against the live network out of the box.** The `mainnet` and `testnet` presets now ship the public `qore.host` endpoints (REST at `api.qore.host` / `api-testnet.qore.host`), so `createRdkClient({ network })` reaches the chain with no manual `endpoints` — override only to target your own node. The same release renamed the Wasm rollup VM identifier to **`native`** (QoreChain Native); `cosmwasm` remains an accepted legacy alias, and both map to `cosmwasm` on the wire — the chain, explorer, and Dashboard are unchanged.
* **v0.4.3 — dependency bump for the SDK's hybrid-signature encoding fix.** The RDK transaction client itself still signs classical-only (see the caution below).
* **v0.4.4 — tracks `@qorechain/sdk` `^0.7.0`**, the SDK release for the chain **v3.1.85** authenticator lanes, so those capabilities reach the RDK's TypeScript users directly through the SDK. No RDK API change.

:::caution Signing with the published clients
Both networks require a hybrid (secp256k1 + ML-DSA-87) signature on every native-lane transaction. The current published npm package (`@qorechain/rdk` 0.4.4) signs through a classical-only client, so it can **read** chain state but cannot get a transaction accepted. For transactions today, build and sign with the CLI (`--generate-only`, then `qorechaind tx pqc cosign`) or with the hybrid signing in [`@qorechain/sdk`](/sdk/overview). Python, Go, Rust and Java RDK clients sign classical-only too and are **not suitable for transactions** on these networks. Check the version you install; releases that add hybrid signing to the RDK clients will be noted here.
:::

:::note Reads need the RDK REST routes
The TypeScript read helpers (`rdk.params()`, `rdk.rest.getRollup()`) call `/qorechain/rdk/v1/…` REST routes, which the public mainnet endpoints do not serve today. On mainnet use `qorechaind query rdk …` (gRPC).
:::

#### Python, Go, Rust, and Java clients

Alongside the TypeScript package, the RDK provides full **Python**, **Go**, **Rust**, and **Java** clients that mirror the TypeScript surface: the config builder with validation, the five preset profiles, denom/economics/bech32 utilities, binary-Merkle and withdrawal-proof helpers, rollup manifests, REST and `qor_` JSON-RPC read clients, preflight/health checks, accounts (mnemonic → `qor` address), and classical transaction signing + broadcast (`SIGN_MODE_DIRECT`, not accepted on the hybrid-signature networks — see the caution above). All are verified against shared cross-language golden vectors and are **published** to their registries:

```bash
# Python — installs as qorechain-rdk, imports as qorrdk
pip install qorechain-rdk

# Rust
cargo add qorechain-rdk

# Go
go get github.com/qorechain/qorechain-rdk/packages/go

# Java (Maven / Gradle)
# io.github.qorechain:qorechain-rdk:0.4.4
```

```python
import qorrdk
```

Current published versions: Python `qorechain-rdk` **0.5.0** (PyPI, import `qorrdk`), Go module `github.com/qorechain/qorechain-rdk/packages/go` (**v0.5.0**), Rust `qorechain-rdk` **0.4.4** (crates.io) and Java `io.github.qorechain:qorechain-rdk` **0.4.4** (Maven Central). These clients read chain state; they do not produce the hybrid signature the networks require (see the caution above).

:::note
The TypeScript RDK and its templates default to the **`qorechain-diana`** testnet, and since v0.4.2 the presets reach the live public endpoints out of the box. Pin versions and validate on testnet before mainnet.
:::

### Scaffold a project with `create-qorechain-rollup` {#scaffold-a-project-with-create-qorechain-rollup}

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

:::caution Check the RDK version the template installs
The templates currently pin `@qorechain/rdk` to the 0.2 series. After scaffolding, run `npm install @qorechain/rdk@latest` so you get the public `qore.host` endpoint presets and the current read clients. The starter's `submit-batch` script is a reference flow only: it posts illustrative roots and a sample proof and is not expected to finalise a batch on a live network.
:::

### Build a rollup configuration from code

Build a config from a preset, read the live stake and burn rate from the chain, and produce the create message. The config builder enforces the settlement → proof compatibility matrix on `validate()` / `build()`. Submit the resulting values with the CLI above (or with a client that signs hybrid) — see the signing caution.

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// A config builder pre-filled with the defi preset's defaults; override via .set({ ... }).
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

// The public qore.host endpoints are baked into the presets (RDK ≥ 0.4.2).
// `params()` is a REST read: it works where the RDK REST routes are served and
// is refused (HTTP 501) on mainnet today — use `qorechaind query rdk config` there.
const rdk = createRdkClient({ network: "testnet" });

// Read the live module parameters — never hardcode the stake or burn rate.
const params = await rdk.params();
const cost = estimateCreationCost({
  stakeUqor: params.minStakeForRollup,
  burnRate: params.rollupCreationBurnRate,
});
console.log(`Stake: ${uqorToQor(cost.stakeUqor)} QOR — burned: ${uqorToQor(cost.burnUqor)} QOR`);

// The values to pass to `qorechaind tx rdk create-rollup`.
const msg = config.toCreateMsg("<your qor address>", { stakeAmount: params.minStakeForRollup });
console.log(msg.rollupId, msg.profile, msg.vmType, msg.stakeAmount);
```

Not sure which profile fits? `rdk.suggestProfile(...)` is meant to return a QCAI-assisted recommendation; on the current public endpoints it always returns the `defi` fallback (`source: "fallback"`), so choose from the [profile table](/rollups/preset-profiles).

### Read state from code

The typed REST client needs no signer, and works where the RDK REST routes are served (not on mainnet today):

```ts
const rollup = await rdk.rest.getRollup("my-defi-rollup");
console.log(rollup.status, rollup.settlementMode, rollup.daBackend, rollup.vmType);
```

For batches, use `qorechaind query rdk batch [rollup-id]` (below).

---

## Lifecycle management

A rollup moves through `pending`, `active`, `paused`, and `stopped` states; a new rollup starts `active` immediately. Only the creator can pause, resume or stop it (enforced since chain version v3.2.0). Each command below follows the same two-step pattern as creation: generate the unsigned transaction, then cosign it.

### Pause

Temporarily halt the rollup. State is preserved and the rollup can be resumed. A reason string is required.

```bash
qorechaind tx rdk pause-rollup [rollup-id] [reason] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > pause.json
qorechaind tx pqc cosign pause.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

### Resume

Resume a previously paused rollup.

```bash
qorechaind tx rdk resume-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > resume.json
qorechaind tx pqc cosign resume.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

### Stop

Permanently decommission the rollup and release its stake. The staked QOR — minus the one-time creation burn — is returned to the creator. The 1,000 QOR layer-registration stake is returned separately when the rollup's layer is decommissioned.

```bash
qorechaind tx rdk stop-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > stop.json
qorechaind tx pqc cosign stop.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

:::danger
Stopping a rollup is permanent. The rollup cannot be restarted after it is stopped.
:::

---

## Operator commands: batches and challenges

Rollup operators submit settlement batches, and challengers can dispute optimistic batches. These commands underpin the settlement layer described in **[Rollups Overview](/rollups/overview)** and **[ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)**.

### Who can submit, and in what order

* **Only the rollup's configured sequencer address — or, when none is configured (every preset), its creator — may submit batches.** Based and shared sequencing do not yet admit proposer sets or rosters: they are labels today, and the creator submits.
* Batches form a chain: the first batch has index `0`; each later batch must use the next index and carry the previous batch's state root as `prev_state_root`.
* A batch that carries a data hash on a `native` or `both` rollup is refused unless a matching blob is already stored (see [Data Availability](/rollups/data-availability)). A batch with no data hash is not checked.
* A `zk` rollup must attach a proof, and the proof must verify (see [ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)).

### Submit a batch

Submit a settlement batch for a rollup. Takes the rollup ID, a batch index, and a hex-encoded state root.

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > batch.json
qorechaind tx pqc cosign batch.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

The CLI command takes only these three positional arguments, so it can submit **batch 0** only; later batches need a client that can set `prev_state_root` (and, where used, `data_hash`, `withdrawals_root` and `tx_count`). A rollup's batches are settled but are **not anchored** to `x/multilayer` on mainnet today (see [Rollup Development Kit](/architecture/rollup-development-kit#state-anchoring)).

### Challenge a batch (optimistic rollups) {#challenge-a-batch-optimistic-rollups}

Any account can challenge a `submitted` batch inside the challenge window by posting a bond (the rollup's `challenge_bond`; 1,000 QOR for the `nft` and `custom` presets) and a fraud proof. Takes the rollup ID and batch index; pass the fraud proof with `--proof`:

```bash
qorechaind tx rdk challenge-batch [rollup-id] [batch-index] \
  --proof <hex-encoded-fraud-proof> \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > challenge.json
qorechaind tx pqc cosign challenge.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

| Flag | Description |
| ---- | ----------- |
| `--proof` | Hex-encoded fraud proof |

A challenge **freezes** the batch (`challenged`): it cannot finalise. The rollup **creator** then resolves it with a resolve-challenge message (not exposed as a CLI command; use a client). The chain decides the outcome itself by verifying the stored proof. If fraud is upheld the batch is `rejected`, the bond is returned and the challenger is paid an additional amount equal to the bond out of the rollup's stake; if it is dismissed the bond goes to the creator and the batch returns to `submitted`.

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
| `qorechaind query rdk suggest-profile [use-case]` | Prints a pointer to the `qor_suggestRollupProfile` RPC; the public endpoints do not serve it, so choose a profile from the [Preset Profiles](/rollups/preset-profiles) table |

---

## Next steps

* **[Data Availability](/rollups/data-availability)** — native, Celestia, and redundant DA backends.
* **[ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)** — proof verification and the L2 → L1 withdrawal flow via `execute-withdrawal`.
