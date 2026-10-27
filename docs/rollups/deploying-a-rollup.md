---
slug: /rollups/deploying-a-rollup
title: Deploying a Rollup
sidebar_label: Deploying a Rollup
sidebar_position: 3
---

# Deploying a Rollup

You can set up an application-specific rollup three ways: through the **Dashboard** (a request form, not an on-chain transaction), through the chain **CLI** (`qorechaind`, full control over the on-chain transaction), or with the **TypeScript RDK** (`@qorechain/rdk` plus the `create-qorechain-rollup` scaffolder), which covers configuration, reads and, when you give it a post-quantum key, hybrid-signed transactions (see [RDK 0.7.0: changes and limits](#rdk-050-limits)). This page covers all three, plus the operator lifecycle and batch commands.

:::caution Early-stage capability
No rollup has been created on either network yet (checked 27 October 2026). The commands below use the **`qorechain-diana`** testnet (EVM chain ID **9800**, chain version **v3.2.6**: v3.2.4 was applied there on 19 October 2026, v3.2.5 on 26 October at height 8,890,800 and v3.2.6 on 27 October at height 8,970,638). Mainnet (**`qorechain-vladi`**, EVM chain ID **9801**, live since 7 June 2026) runs chain version **v3.2.4** since 23 October 2026 (applied at height 3,742,566 by governance proposal 13); governance proposal 14 would apply v3.2.5 at height 3,906,833 and was in its voting period at the time of writing, and what v3.2.5 changes for rollups is marked "Testnet now" where it applies (a summary table is in the [Rollups Overview](/rollups/overview#v325)). Earlier releases differ in a few details, which this page marks "from v3.2.4". The testnet is a staging network with its own module parameters (for example a default challenge window of 3,600 seconds against 604,800 on mainnet, and 200 rollups at most against 100); read `GET /qorechain/rdk/v1/params` on the network you target. Validate every deployment on testnet first.
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
| **Rollup id** | Use 3–64 characters: lower-case letters, digits, `.`, `_` and `-`, starting with a letter or digit. The chain enforces this rule on both networks since v3.2.2 (the CLI checks it before it builds the transaction), so a non-conforming id is refused |
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
3. **Pick a virtual machine.** The on-chain record stores a VM label. Your rollup executes off-chain in its own runtime; the choice does not run on QoreChain's own EVM, QoreChain Native or SVM lanes:
   * **EVM** — Solidity / Vyper contracts with full Ethereum tooling (Hardhat, Foundry, MetaMask)
   * **QoreChain Native** — Rust smart contracts on the Cosmos SDK runtime (the CosmWasm runtime), with native IBC
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

**Do not create a `defi` (ZK) rollup yet.** The chain accepts the creation and escrows the stake, but it has no way to register a verification key, so every ZK batch is refused after its fee is paid. Key registration is planned for chain v3.2.7. Choose an `optimistic` profile such as `nft` or `custom` for now (see [ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)).

**Flags:**

| Flag | Default | Description |
| ---- | ------- | ----------- |
| `--vm` | *(empty — use the profile's VM)* | Override the rollup VM type: `evm`, `cosmwasm`, `svm`, or `custom`. Leave unset to apply the preset's VM. (In the RDK clients the Wasm runtime is the **`native`** VM type — QoreChain Native — with `cosmwasm` kept as a legacy alias; `cosmwasm` is the on-wire value, which is what this chain-level flag takes.) |

:::note The VM label is metadata
`--vm` records which runtime your rollup uses. The host chain only settles the rollup; it does not execute its contracts. The host chain's own QoreChain Native upload is currently closed and its SVM transaction lane is disabled network-wide, which does not affect settlement of an off-chain rollup but does mean you cannot deploy contracts for a rollup onto those host-chain lanes.
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

The Rollup Development Kit ships as two public npm packages for the same on-chain `x/rdk` module as the CLI. No rollup exists on either network yet, so no transaction path of the kit has been exercised on a live rollup; read [RDK 0.7.0: changes and limits](#rdk-050-limits) before you rely on it to send transactions:

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)** (`v0.7.0`) — the TypeScript SDK: a config builder with preset profiles, transaction helpers for the rollup and settlement-batch lifecycles, native DA, typed read clients, settlement receipts with an ML-DSA-87 signature, the QCAI Rollup Copilot, cross-VM calldata helpers, and the watchtower. It depends on `@qorechain/sdk` `^0.10.0` (from 0.7.0; 0.6.x used `^0.9.0`) and `@qorechain/evm` `^0.8.0`.
* **`create-qorechain-rollup`** (`v0.7.0`) — a scaffolder that clones one runnable starter template per profile (including the `multivm-rollup` template).

These are published to npm. The repo also ships a published operator CLI, **`@qorechain/rdk-cli`** (`qorollup`, `v0.7.0`), with `doctor`, `create`, `status`, `watch`, `params`, `suggest`, lifecycle (`pause`/`resume`/`stop`), `keygen`, `manifest`, `withdraw`, and `faucet` commands, plus the `receipt`, `advise`, and `watchtower` commands. Its transaction commands sign classical-only (see the limits below).

Highlights by release:

* **v0.4.2 — works against the live network out of the box.** The `mainnet` and `testnet` presets now ship the public `qore.host` endpoints (REST at `api.qore.host` / `api-testnet.qore.host`), so `createRdkClient({ network })` reaches the chain with no manual `endpoints` — override only to target your own node. The same release renamed the Wasm rollup VM identifier to **`native`** (QoreChain Native); `cosmwasm` remains an accepted legacy alias, and both map to `cosmwasm` on the wire — the chain, explorer, and Dashboard are unchanged.
* **v0.4.3 — dependency bump for the SDK's hybrid-signature encoding fix.** The RDK transaction client itself still signed classical-only.
* **v0.4.4 — tracks `@qorechain/sdk` `^0.7.0`**, the SDK release for the chain **v3.1.85** authenticator lanes. No RDK API change.
* **v0.5.0 (18 October 2026)** — settlement-receipt verification checks against chain state and never reports a receipt valid from its own fields; the TypeScript transaction client signs hybrid when given a `pqcKeypair`. It depends on `@qorechain/sdk` `^0.8.0`.
* **v0.6.0 (GitHub release of 20 October 2026)** — the compatibility release for chain v3.2.2 to v3.2.4: anchored batches, settlement receipts that can verify, challenge windows measured as the chain measures them, an encoder that matches the chain's cross-VM layout, templates that sign hybrid, and `@qorechain/sdk` `^0.9.0`. The details are below.
* **v0.6.1 (GitHub release of 25 October 2026)** — a security and template fix release for chain v3.2.3 onward, in all five languages: settlement-receipt verification compares every field the receipt states with the chain's anchor, the six starter templates no longer submit batches the chain refuses (they leave `dataHash` empty), and the optimistic templates publish the chain's canonical state root instead of a placeholder. It keeps the `@qorechain/sdk` `^0.9.0` and `@qorechain/evm` `^0.8.0` ranges. The details are below.
* **v0.6.2 (GitHub release of 27 October 2026)**: a CLI hotfix with no library changes: `qorollup` installed from npm (local, global or `npx`) runs again, and `qorollup --version` and `create-qorechain-rollup --version` print their real versions. The other packages were re-released as 0.6.2 so every registry stays on one version.
* **v0.7.0 (GitHub release of 27 October 2026; current)**: ready for chain v3.2.5 in all five languages (the testnet runs it; mainnet gets it when governance proposal 14 is applied), and it fixes how withdrawals and data-availability blobs are hashed: withdrawal proofs built with the 0.6.x defaults never verified on chain, and 0.7.0 builds the chain's exact tree. It moves to `@qorechain/sdk` `^0.10.0`, and the templates pin `@qorechain/rdk` `^0.7.0`. The details are below.

**Published versions (checked on every registry on 27 October 2026).** npm `@qorechain/rdk`, `@qorechain/rdk-cli` and `create-qorechain-rollup`: **0.7.0** (`latest`); PyPI `qorechain-rdk`: 0.7.0; crates.io `qorechain-rdk`: 0.7.0; Maven Central `io.github.qorechain:qorechain-rdk`: 0.7.0 (its `maven-metadata.xml` lists 0.6.2 and 0.7.0 as well as earlier versions); Go module `github.com/qorechain/qorechain-rdk/packages/go`: `v0.7.0` (tag `packages/go/v0.7.0`; the module proxy's `@latest` can lag a new tag, so pin `@v0.7.0` explicitly). The GitHub release is [v0.7.0](https://github.com/qorechain/qorechain-rdk/releases/tag/v0.7.0).

#### RDK 0.7.0: changes and limits {#rdk-050-limits}

This section states what the published 0.7.0 packages do (and what 0.6.2, 0.6.1 and 0.6.0 changed before them), checked against the package contents and the GitHub release notes, and what they still cannot do. None of these items is a chain behaviour. Where a statement says "untested live", no rollup exists on either network, so the path has only been checked against the code and offline.

**What 0.7.0 changed** (all five languages, unless a line says otherwise; the [release notes](https://github.com/qorechain/qorechain-rdk/releases/tag/v0.7.0) have the full list). Behaviour that belongs to chain v3.2.5 is labelled with its network: **the testnet runs v3.2.5 and later today; mainnet runs v3.2.4 until governance proposal 14 applies v3.2.5**.

* **Withdrawal proofs verify on chain.** The Merkle and withdrawal helpers defaulted to SHA-256 and re-hashed each leaf, while the chain hashes nodes with SHAKE-256 and builds its leaves from the withdrawal itself, so a proof built with the 0.6.x defaults never verified. `withdrawalsTree` now builds a batch's withdrawals root and every proof exactly as the chain does (leaf position is the withdrawal index): with first-form leaves, or with second-form leaves that also name the chain id, which the chain uses for batches from v3.2.5 (testnet now; mainnet after the upgrade). `withdrawalLeafV1` and `withdrawalLeafV2` build one leaf, `assembleWithdrawalProof` builds the chain's tree by default, and the generic Merkle helpers default to SHAKE-256. This is breaking for code that relied on the SHA-256 defaults (pass `hash` explicitly to keep them). The new byte formats were tested against vectors produced by the chain's own code, and every withdrawal proof in those vectors is accepted by the chain's verifier. See [Leaf and node encoding](/rollups/zk-stark-withdrawals#leaf-and-node-encoding).
* **`qorollup withdraw` checks before it pays.** It takes the batch's withdrawals (`qorollup withdraw --file withdrawal.json [--dry-run]`), builds the proof under the batch's own binding, and refuses before paying a fee when the result is not the batch's on-chain `withdrawals_root`.
* **`buildDaBlob` commits as the chain does.** Its commitment is SHAKE-256, not SHA-256 (no transaction posts a blob, so `dataHash` is still left empty).
* **Watchtower.** The Watchtower told batches apart by index only, so it missed a batch resubmitted at a rejected index. From chain v3.2.5 (testnet now) an upheld fraud rejects the batch and every later unfinalized one, and the sequencer resubmits under the same indexes; the Watchtower now tells batches apart by index and state root and never validates a rejected batch. New helpers `transitionRootValidator` (a `validate` predicate that applies the chain's fraud rule) and `fraudProofForBatch` (the proof that wins, or none for an honest batch), and `qorollup watchtower --canonical`, which reports the batches a challenge would win.
* **Chain v3.2.5 settlement helpers** (testnet now; mainnet after the upgrade): `getRollupHealth` reports `heldBackBy` when the latest batch could finalize on its own window but an earlier batch is still submitted or challenged (batches finalize in order), and `qorollup status` prints it; `stopRollupError` and a pre-check in `stopRollup` (TypeScript and Rust), because a rollup whose latest batch is submitted or challenged cannot be stopped; `MAX_PENDING_OPTIMISTIC_BATCHES` (4,096); `withdrawalsRootError` (a withdrawals root is empty or exactly 32 bytes), checked before every batch submission in all five languages.
* **Cross-VM helpers for chain v3.2.5** (testnet): `getCrossVmParams` (the allowlist, at `/qorechain/crossvm/v1/params`), `crossVmTargetReady` (precompile active, bridge enabled and target allowlisted, with the blocking reason), `decodeCrossVmResult` (the reply is `abi.encode(bytes)`) and `decodeRevertReason` (a refusal is `Error(string)`), checked against encodings Solidity produced. See [Multi-VM](/rollups/multi-vm).
* **Error decoding and small additions.** `decodeRdkTxError` and `RDK_ERRORS` name the `rdk` module's error codes (2 to 36) and what to do about the ones an operator meets; `qorehash` (SHAKE-256, 32 bytes) is exported in all five languages; `FEATURE_RDK_CHALLENGE_SETTLEMENT` names the chain feature flag.
* **The `defi` template stops before it wastes a fee.** No chain release up to v3.2.5 can register a ZK verification key, so every ZK batch is refused. The template now stops before sending, and `RollupView.hasVerificationKey` reads the field that chain v3.2.7 is planned to add.
* **Dependencies.** `@qorechain/sdk` `^0.10.0` (was `^0.9.0`), so an application on SDK 0.10.0 now shares one SDK copy with the kit; the templates pin `@qorechain/rdk` `^0.7.0`.

**What 0.6.2 changed** (the CLI and scaffolder only; the library packages are unchanged):

* **`qorollup` runs when installed from npm.** The CLI started only when `process.argv[1]` equalled its own file path, but npm starts a package's bin through a symlink in `node_modules/.bin`, so 0.6.1 and earlier, installed locally, globally or run with `npx`, exited with code 0 and printed nothing; only `node .../dist/index.js` worked. 0.6.2 compares real paths. After `npm i -g @qorechain/rdk-cli`, `qorollup ...` works.
* **Versions print correctly.** `qorollup --version` printed `0.4.1` and `create-qorechain-rollup --version` printed `0.2.0` in earlier releases; both now read their own `package.json` (checked on 27 October 2026: `qorollup --version` prints `0.6.2`).

**What 0.6.1 changed** (all five languages, unless a line says otherwise; the [release notes](https://github.com/qorechain/qorechain-rdk/releases/tag/v0.6.1) have the full list):

* **Receipt verification compares every field.** `verifySettlementReceipt` now requires every anchor field the receipt states to equal the chain's anchor (a mismatch names the field), requires `batchStateRoot` to equal the chain's batch root, and refuses a receipt with an unknown `version` or an `algorithm` other than `ML-DSA-87` before anything is read from the chain. The result carries the chain's matched `anchor` and, when valid, a `verifiedReceipt` rebuilt from chain state; `qorollup receipt verify --json` returns that chain-read receipt as `receipt`. See [Settlement receipts](/rollups/settlement-receipts#what-060-verifies).
* **Native data availability: leave `dataHash` empty.** Every rollup profile uses `native` data availability, where the chain accepts a non-empty `data_hash` only when a matching blob is stored on chain, and no transaction can store one (see [Data Availability](/rollups/data-availability)). The six starter templates put a data hash on their batches in 0.6.0 and earlier, so the chain refused every template batch after the fee was paid. They now leave it empty; `SubmitBatchInput.dataHash` is optional in TypeScript (omitted means empty), `dataHashError` (`data_hash_error`, `DataHashError`, `Rules.dataHashError`) exposes the rule, and `RdkTxClient.submitBatch` refuses such a batch before broadcasting when it can read the rollup (a hybrid client with a REST endpoint).
* **Optimistic templates publish the canonical state root.** The chain judges an optimistic batch by its canonical transition root, a SHAKE-256 commitment of the batch's previous state root, data hash and transaction count (`batchTransitionRoot` in the RDK, with `transitionRootVersionFor` choosing the binding the connected network applies). The `custom`, `multivm` and `nft` templates used to submit a fixed placeholder root, which does not match the canonical root the chain checks; they now publish the canonical root and no longer send a placeholder proof. The `nft` template's `challenge.ts` reads the batch from chain and challenges only a batch whose root is provably wrong. Do not hand-roll the formula: use `batchTransitionRoot` so the binding matches the network you submit to. The chain's own check is the same for every client, so an optimistic batch whose state root is not the canonical root can be challenged successfully, whichever client sent it.
* **New helpers.** `fraudProof`, `transitionRootVersionForBatch`, `receiptSchemaError` with `SUPPORTED_RECEIPT_VERSIONS`, `RestClient.getProtocolFeatures` / `isProtocolFeatureEnabled` (a chain without the route reads as "not enabled") and `getAppliedPlanHeight`. `@qorechain/rdk` now depends on `@noble/hashes` directly (SHAKE-256 for the transition root; it was already installed through `@qorechain/sdk`). The templates pin `@qorechain/rdk` `^0.6.1`.

**What changed in 0.6.0** (TypeScript, unless a line says otherwise):

* **Signing.** `RdkClient.connectTx(signer, { pqcKeypair, rest })` signs hybrid (secp256k1 + ML-DSA-87) when you pass a keypair; without one it signs classical-only and the networks refuse the transaction. `signer` must be an `OfflineDirectSigner`, and the fee must be explicit (a `fee`, or a `gasPrice` on connect). New helpers `resolvePqcKeypair` and `pqcKeypairFromEnv` derive both the canonical and the legacy ML-DSA-87 key from a mnemonic and use whichever the account has registered on-chain; they refuse, rather than guess, when the account holds a different key. `QORE_PQC_SEED_HEX` supplies a seed for an operator who signs with a raw private key. The kit now depends on `@qorechain/sdk` `^0.9.0`, so a fresh install holds one SDK copy (0.9.0); with 0.5.0, npm installed SDK 0.8.3 nested under the kit.
* **Anchored batches.** `MsgSubmitBatch` carries `anchor_signature` and `validator_set_hash`. `RdkTxClient.submitBatch` signs the anchor itself only when the client signs hybrid, has a REST endpoint, and **is the rollup's creator** (the chain checks the anchor against the creator's registered key); in every other case it submits unanchored, as before. Pass `anchor: "require"` to refuse instead of submitting unanchored, `anchor: "off"` to never sign, or `anchorSignature` to send a signature you obtained yourself. `anchorSignBytesForBatch` builds the v2 bytes for a creator who signs out of band, which a rollup with a separate sequencer needs. Untested live.
* **Settlement receipts.** The PQC account lookup uses the singular route `/qorechain/pqc/v1/account/{address}` (0.5.0 used a plural path the networks do not serve). Verification supports both anchor sign-bytes forms and picks one by the anchor's height, never by trying both: v1 below the v3.2.2 switch, v2 from it. Receipt schema v2 records `chainId`; verification refuses a receipt checked against a node of another chain, and reports `signBytesVersion` and a `chainBinding` check. Version-1 receipts still verify. See [Settlement receipts](/rollups/settlement-receipts).
* **Reads.** `getLatestBatch` calls `/qorechain/rdk/v1/latest_batch/{rollup_id}` (0.5.0 called a form the chain does not serve), and `listBatches` follows every page (`listBatchesPage` reads one). `RollupView` carries `escrowBalance` and, where the node reports them, `challengeWindowSec`, `challengeBond` and `proofSystem`; `BatchView` carries `submittedTime`.
* **Challenge windows.** `batchChallengeWindow` computes a batch's window the way the chain does and judges it against the chain tip (`getChainTip`), not the local clock: seconds of block time for a batch that has a recorded submission time (the v3.2.4 rule: the testnet since height 8,337,253, mainnet since height 3,742,566), `window / 6` blocks counted from the submission height otherwise (the rule for batches submitted before the upgrade height). The health check behind `qorollup status` and the watchtower use it (see [Watchtower](/rollups/watchtower)).
* **Cross-VM.** `encodeCrossVmCalldata` now encodes `executeCrossVMCall(uint8,string,bytes)`, the layout the node decodes, and takes a `targetVm`. `isCrossVmPrecompileActive` reads the live list of active precompiles (see [Multi-VM](/rollups/multi-vm)).
* **Rules checked before a fee is paid.** `rollupIdError` checks the id grammar when you validate a config and before `createRollup` broadcasts; `withdrawalErrors` checks a withdrawal before `executeWithdrawal` broadcasts.
* **Templates.** The scaffolded templates connect through `pqcKeypairFromEnv`, so their `create` and `submit-batch` scripts sign hybrid, and they depended on `@qorechain/rdk` `^0.6.0` (`^0.6.1` since the 0.6.1 scaffolder). The `multivm-rollup` template checks that the precompile is live and requires a non-empty reply from the target.
* **Python, Go, Rust and Java.** The read-side fixes above (singular PQC route, `latest_batch`, anchor sign bytes v2, challenge-window rules, id and withdrawal checks) are in the published packages of the four other languages as well.
* **Breaking changes.** `encodeCrossVmCalldata` takes `targetVm`, and `CROSS_VM_DEFAULT_SIGNATURE` changed. `RollupHealth` and `BatchDeadline` carry a `challengeWindow` instead of the old seconds-based deadline.

**Limits that remain in 0.7.0:**

* **ZK settlement cannot be used on either network yet.** The `defi` profile, the `defi-rollup` template and every rollup created with `zk` settlement are affected: the chain has no way yet to register a verification key for a rollup, so every ZK batch is refused after its fee is paid. Key registration is planned for chain v3.2.7. Use `optimistic` settlement until then (see [ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)).
* **The `defi` template's demo circuit cannot verify.** It is a `snarkjs` multiplier circuit, while the chain checks Groth16 over BLS12-381 with three public inputs (the previous state root, the new state root and the data hash). Even once key registration exists, a proof from the demo circuit would not pass; replace the circuit with your own state-transition circuit.
* **Fixed in 0.7.0: withdrawal Merkle helpers.** In 0.6.2 and earlier the helpers defaulted to SHA-256 and a proof built with the defaults never verified on chain; use `withdrawalsTree` / `assembleWithdrawalProof` from 0.7.0 (see [Leaf and node encoding](/rollups/zk-stark-withdrawals#leaf-and-node-encoding)).

* **Only the TypeScript client signs hybrid.** The `qorollup` CLI (its `create`, `pause`, `resume`, `stop` and `withdraw` commands connect without a post-quantum key) and the **Python, Go, Rust and Java** clients sign classical-only, which both networks refuse on the native lane; their READMEs still say so. Their message builders have no `anchor_signature` or `validator_set_hash` field. For transactions from these, build and sign with the chain CLI (`--generate-only`, then `qorechaind tx pqc cosign`) or use the TypeScript client with a `pqcKeypair`.
* **No hybrid creation of a rollup has been exercised live,** because no rollup exists on either network. The same holds for anchored batches, withdrawals and the whole receipt flow.
* **Anchoring needs the creator.** A batch is anchored in the same transaction only if the creator's signature is in it. If the sequencer is another address, the creator has to sign the v2 bytes out of band and the sequencer sends the result.
* **The cross-VM precompile at `0x…0901` is still not active on either network**, so a call from a contract does nothing on mainnet and is not yet usable on the testnet either (see [Multi-VM](/rollups/multi-vm)).
* **Challenge-window length.** The kit reads a rollup's own window only when the node reports it (the package documents this as v3.2.4 and later, which both networks run). Otherwise it uses the module's default window; pass `challengeWindowSecs` for a rollup that configured its own. The older helpers `challengeWindowDeadline` and `isChallengeWindowClosed` are still exported and still take seconds, so do not feed them a block height.
* **Data availability.** No transaction posts a blob, so a batch on a `native` or `both` rollup must leave `dataHash` empty (see [Data Availability](/rollups/data-availability)). `buildDaBlob` hashed with SHA-256 in 0.6.2 and earlier; from 0.7.0 its commitment is the chain's SHAKE-256.

**Versions before 0.7.0.** 0.6.2 and earlier build withdrawal proofs that never verify on chain and hash `buildDaBlob` with SHA-256; use 0.7.0. 0.6.1 and earlier installed the `qorollup` CLI from npm in a state where it printed nothing and exited 0 (fixed in 0.6.2). 0.6.0 compares fewer fields in receipt verification than 0.6.1 and ships templates that submit batches the chain refuses (a data hash on a native-DA rollup, a placeholder state root on the optimistic ones). 0.5.0 and earlier should not be used for settlement receipts, the watchtower or cross-VM calldata: 0.5.0 looked up the creator's key on a route the networks do not serve (so receipt verification failed closed on every genuine receipt), rebuilt only the v1 anchor message, read a block height as a timestamp (every batch age and challenge deadline was wrong, and the watchtower raised its deadline alert at once for every batch), called a latest-batch route the chain does not serve, read only the first 50 batches, encoded a function the precompile does not decode, and shipped templates that signed classical-only. 0.4.x had no hybrid signing in the transaction client.

#### Python, Go, Rust, and Java clients

Alongside the TypeScript package, the RDK provides full **Python**, **Go**, **Rust**, and **Java** clients that mirror the TypeScript surface: the config builder with validation, the five preset profiles, denom/economics/bech32 utilities, binary-Merkle and withdrawal-proof helpers, rollup manifests, REST and `qor_` JSON-RPC read clients, preflight/health checks, accounts (mnemonic → `qor` address), and classical transaction signing + broadcast (`SIGN_MODE_DIRECT`, not accepted on the hybrid-signature networks — see [RDK 0.7.0: changes and limits](#rdk-050-limits)). All are verified against shared cross-language golden vectors and are **published** to their registries:

```bash
# Python — installs as qorechain-rdk, imports as qorrdk
pip install qorechain-rdk

# Rust
cargo add qorechain-rdk

# Go (pin the version)
go get github.com/qorechain/qorechain-rdk/packages/go@v0.7.0

# Java (Maven / Gradle)
# io.github.qorechain:qorechain-rdk:0.7.0
```

```python
import qorrdk
```

Current published versions, all **0.7.0** (checked 27 October 2026): Python `qorechain-rdk` (PyPI, import `qorrdk`), Go module `github.com/qorechain/qorechain-rdk/packages/go` (`v0.7.0`), Rust `qorechain-rdk` (crates.io) and Java `io.github.qorechain:qorechain-rdk` (Maven Central). These clients read chain state; they still do not produce the hybrid signature the networks require, and their message builders carry no anchor fields (see [RDK 0.7.0: changes and limits](#rdk-050-limits)).

:::note
The TypeScript RDK and its templates default to the **`qorechain-diana`** testnet, and the presets reach the live public endpoints out of the box. Pin versions and validate on testnet before mainnet.
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

:::caution What the scaffolded scripts can do
The templates of `create-qorechain-rollup` 0.7.0 depend on `@qorechain/rdk` `^0.7.0`. Their `create` and `submit-batch` scripts connect through `connectOperator()` in `src/signer.ts`, which resolves your post-quantum key from `QORE_MNEMONIC` (or from `QORE_PQC_SEED_HEX` when you sign with `QORE_OPERATOR_PRIVATE_KEY_HEX`), checks it against the chain, and signs hybrid; with neither set the script warns and signs classical-only, which both networks refuse. No rollup has been created through a template on a live network, so this path is untested live. The starter's `submit-batch` script is a reference flow only: since 0.6.1 it leaves `dataHash` empty (the chain refuses a data hash on a native-DA rollup), and the optimistic templates publish the canonical state root instead of a placeholder; it still uses illustrative values for the rest, and it is not expected to finalise a batch on a live network. The `defi-rollup` template (ZK) stops before sending a batch from 0.7.0, because the chain would refuse it (see [ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)).
:::

### Build a rollup configuration from code

Build a config from a preset, read the live stake and burn rate from the chain, and produce the create message. The config builder enforces the settlement → proof compatibility matrix on `validate()` / `build()`. Submit the resulting values with the CLI above, or with the TypeScript client given a `pqcKeypair` — see [RDK 0.7.0: changes and limits](#rdk-050-limits).

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// A config builder pre-filled with the defi preset's defaults; override via .set({ ... }).
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

// The public qore.host endpoints are baked into the presets (RDK ≥ 0.4.2).
// `params()` is a REST read of /qorechain/rdk/v1/params, served on both networks.
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

The typed REST client needs no signer and reads both networks:

```ts
const rollup = await rdk.rest.getRollup("my-defi-rollup");
console.log(rollup.status, rollup.settlementMode, rollup.daBackend, rollup.vmType);
```

For batches, use `rdk.rest.getBatch(rollupId, index)` or `qorechaind query rdk batch [rollup-id]` (below); `getLatestBatch` and `listBatches` read the chain's `latest_batch` route and every page of the batch list since 0.6.0 (see [RDK 0.7.0: changes and limits](#rdk-050-limits)).

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

Permanently decommission the rollup and release its stake. The staked QOR — minus the one-time creation burn, and minus anything already paid out of the rollup's escrow by withdrawals or fraud-proof rewards — is returned to the creator: since v3.2.3 a per-rollup escrow ledger records what each rollup still holds, `stop-rollup` refunds exactly that balance, and a stopped rollup pays no further withdrawals. The 1,000 QOR layer-registration stake is returned separately when the rollup's layer is decommissioned.

**Testnet now (chain v3.2.5 and later), mainnet after the upgrade:** a rollup cannot be stopped while its latest batch is `submitted` or `challenged`, so settle or finalize it first; a stopped rollup frees its slot under the module's rollup limit. On mainnet (v3.2.4) neither rule applies yet. From TypeScript, `stopRollupError` and the pre-check in `stopRollup` tell you before you pay the fee.

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
* A `zk` rollup must attach a proof, and the proof must verify; no ZK batch can be accepted yet (see [ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)).
* **Testnet now (chain v3.2.5 and later), mainnet after the upgrade:** a batch's `withdrawals_root` must be empty or exactly 32 bytes, and a rollup holds at most 4,096 pending optimistic batches (`MAX_PENDING_OPTIMISTIC_BATCHES` in the RDK); batches also finalize in index order, so a later batch waits for an earlier one that is still `submitted` or `challenged`. The RDK checks the root's length before every submission. On mainnet (v3.2.4) none of these three rules applies yet.

### Submit a batch {#submit-a-batch}

Submit a settlement batch for a rollup. Takes the rollup ID, a batch index, and a hex-encoded state root. For every batch after the first, pass the previous batch's state root as `--prev-state-root`.

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --prev-state-root <previous-state-root-hex> --tx-count 120 \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > batch.json
qorechaind tx pqc cosign batch.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

| Flag | Description |
| ---- | ----------- |
| `--prev-state-root` | Hex state root the batch starts from (required for every batch after index `0`) |
| `--tx-count` | Number of rollup transactions in the batch |
| `--data-hash` | Hex hash of the batch data posted as a DA blob (leave empty today: there is no way to post a blob, see [Data Availability](/rollups/data-availability)) |
| `--withdrawals-root` | Hex Merkle root of the batch's L2 → L1 withdrawals (see [ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)) |
| `--anchor-signature` | Hex ML-DSA-87 signature by the rollup **creator** over the v2 anchor sign bytes (since v3.2.2); the batch is then anchored in `x/multilayer` in the same transaction, and a refused anchor refuses the batch |
| `--validator-set-hash` | Hex validator-set commitment carried in the anchor and covered by the signature |

Without `--anchor-signature` the batch settles **unanchored**. To anchor a batch, print the bytes to sign, sign them with the creator's registered post-quantum key, and pass the signature (the `--tx-count` and `--validator-set-hash` values must match the ones you submit):

```bash
qorechaind query rdk anchor-sign-bytes [layer-id] [batch-index] [state-root-hex] \
  --chain-id qorechain-diana --tx-count 120
```

`layer-id` is the rollup's layer id (the rollup id for rollups created by the RDK). From TypeScript, `RdkTxClient.submitBatch` in `@qorechain/rdk` 0.6.0 and later signs the anchor for you when the client signs hybrid and is the rollup's creator, and `anchorSignBytesForBatch` gives a creator the bytes to sign out of band (see [RDK 0.7.0: changes and limits](#rdk-050-limits)). The ZK `--proof` for a `zk` rollup has no CLI flag today, and the resolve-challenge message is not a CLI command: use a client. See [Settlement receipts](/rollups/settlement-receipts) for what an anchor does and does not prove. No rollup, layer or anchor exists on either network yet.

### Challenge a batch (optimistic rollups) {#challenge-a-batch-optimistic-rollups}

Any account can challenge a `submitted` batch inside the challenge window (100,800 blocks by default for a batch submitted on mainnet before height 3,742,566; from v3.2.4, a window in seconds of block time for new batches: on the testnet since height 8,337,253, on mainnet since height 3,742,566) by posting a bond (the rollup's `challenge_bond`; 1,000 QOR for the `nft` and `custom` presets) and a fraud proof. An optimistic batch is judged by whether its state root is the canonical transition root, so a submitter should publish exactly that root (the RDK templates do, from 0.6.1; see [RDK 0.7.0: changes and limits](#rdk-050-limits)). Takes the rollup ID and batch index; pass the fraud proof with `--proof`:

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

A challenge **freezes** the batch (`challenged`): it cannot finalise. On **mainnet (v3.2.4) only the rollup creator** can then resolve it, with a resolve-challenge message (not exposed as a CLI command; use a client). The chain decides the outcome itself by verifying the stored proof. If fraud is upheld the batch is `rejected`, the bond is returned and the challenger is paid an additional amount equal to the bond out of the rollup's stake; if it is dismissed the bond goes to the creator and the batch returns to `submitted`.

**Testnet now (chain v3.2.5 and later), mainnet after the upgrade:** **any account** can resolve a challenge, not only the creator. An upheld fraud rejects that batch **and every later batch that is not yet finalized**, and the sequencer resubmits those batches from the last good state root under the same indexes; the rollup carries on from there. The Watchtower tells such batches apart by index and state root (see [Watchtower](/rollups/watchtower)). Until governance proposal 14 applies v3.2.5 on mainnet, treat the creator-only rule above as the mainnet behaviour.

### Inspect batches

```bash
# Latest batch for a rollup
qorechaind query rdk batch [rollup-id]

# A specific batch by index
qorechaind query rdk batch [rollup-id] --index 42

# A page of batches in index order (--limit up to 100, default 50)
qorechaind query rdk batches [rollup-id] --start 0 --limit 50
```

---

## Querying

| Command | Purpose |
| ------- | ------- |
| `qorechaind query rdk rollup [rollup-id]` | Details of a specific rollup |
| `qorechaind query rdk list-rollups` | All registered rollups |
| `qorechaind query rdk batch [rollup-id]` | Latest settlement batch (or `--index`) |
| `qorechaind query rdk batches [rollup-id]` | A page of batches in index order (`--start`, `--limit`) |
| `qorechaind query rdk anchor-sign-bytes [layer-id] [batch-index] [state-root-hex]` | The v2 anchor sign bytes for a batch (offline) |
| `qorechaind query rdk config` | RDK module parameters |
| `qorechaind query rdk suggest-profile [use-case]` | Prints a pointer to the `qor_suggestRollupProfile` RPC; the public endpoints do not serve it, so choose a profile from the [Preset Profiles](/rollups/preset-profiles) table |

---

## Next steps

* **[Data Availability](/rollups/data-availability)** — native, Celestia, and redundant DA backends.
* **[ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)** — proof verification and the L2 → L1 withdrawal flow via `execute-withdrawal`.
