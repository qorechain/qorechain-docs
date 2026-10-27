---
slug: /appendix/version-history
title: Version History
sidebar_label: Version History
sidebar_position: 3
---

# Version History

Public version history for QoreChain. Mainnet **`qorechain-vladi`** (EVM chain ID **9801**, live since 7 June 2026) runs **v3.2.4** (applied by governance proposal 13 at height 3,742,566 on 23 October 2026; the previous release, v3.2.3, was applied at height 3,662,051 on 20 October 2026). Governance proposal 14 would apply v3.2.5 on mainnet at height 3,906,833 (in its voting period at the time of writing, 27 October 2026). The testnet **`qorechain-diana`** (EVM chain ID **9800**) runs **v3.2.6** (applied at height 8,970,638 on 27 October 2026); v3.2.4 reached it at height 8,337,253 (19 October 2026) and v3.2.5 at height 8,890,800 (26 October 2026).

:::note
Entries below are high-level capability summaries. Earlier `v1.x` entries are retained as historical record of the testnet release line that preceded mainnet. The release manifest ([Connecting to Mainnet](/getting-started/connecting-to-mainnet)) is promoted separately from tagging and can lag a tag by some time — check it directly for what a fresh install actually downloads.
:::

## Mainnet governance timeline {#governance-timeline}

Proposals that changed the running mainnet since 14 October 2026. All eight are expedited proposals (one-day voting period); proposals 7 to 13 passed with all voting bonded stake in favour, and proposal 14 is still being voted on at the time of writing. The full list is at `GET /cosmos/gov/v1/proposals` on `https://api.qore.host`.

| Proposal | What it does | Voting | Outcome |
| --- | --- | --- | --- |
| 7 | Applies v3.2.2 at height 3,556,788 | 14–15 October 2026 (ends 21:24 UTC) | Passed; applied 16 October 2026 |
| 8 | Releases the light-node reserve (3,156,983.796395 QOR) to the foundation | 18–19 October 2026 (ends 19:15 UTC) | Passed |
| 9 | Releases the stranded staker share (6,693,045.921330 QOR) to the foundation | 18–19 October 2026 (ends 19:15 UTC) | Passed |
| 10 | Emission: sets the fixed emission to 86,000 QOR per epoch and the cumulative cap to 590,000,000 QOR (epoch length unchanged; the first 86,000 QOR epoch starts at block 3,672,000) | 18–19 October 2026 (ends 19:15 UTC) | Passed |
| 11 | Applies v3.2.3 at height 3,662,051 | 18–19 October 2026 (ends 19:15 UTC) | Passed; applied 20 October 2026 |
| 12 | Releases the corrected stranded staker share (3,807,496.785528 QOR, recomputed at the v3.2.3 height) to the foundation | 20 October 2026 20:01 UTC to 21 October 2026 20:01 UTC | Passed |
| 13 | Coordinated upgrade to v3.2.4 at height 3,742,566: optional time-locked staking, light-node reward bound counted from registration, a possession flag for post-quantum keys, proof of possession for bridge validators, the RDK challenge window in block time, and node-local hardening | 20 October 2026 21:18 UTC to 21 October 2026 21:18 UTC | Passed; applied 23 October 2026 at height 3,742,566 |
| 14 | Coordinated upgrade to v3.2.5 (build 2) at height 3,906,833 (nodes stay on v3.2.4 until that height, halt there and restart on v3.2.5; transaction signing is unchanged) | 27 October 2026 00:29 UTC to 28 October 2026 00:29 UTC | In voting at the time of writing. The content of v3.2.5 is documented on the day mainnet applies it |

See [Tokenomics](/architecture/tokenomics#stranded-and-reserve) for what the releases mean and [Governance](/user-guide/governance) for how to vote.

---

## Testnet releases v3.2.5 and v3.2.6 (testnet only so far) {#testnet-v326}

The testnet `qorechain-diana` takes each release a few days before mainnet. Mainnet is unchanged by anything in this section: it runs v3.2.4 until a governance upgrade says otherwise.

### v3.2.6 — Query Routes, Live PRISM Values and Test Tokens (testnet)

**Release focus:** Applied on the testnet by testnet governance proposal 28 at height **8,970,638** (27 October 2026, 16:58 UTC). The testnet manifest sets `version` and `minCompatible` to 3.2.6 with `upgradeHeight` 8970638, so a node joining the testnet needs v3.2.6. Signing format, addresses, decimals, memos and fees are unchanged.

* **New testnet read routes.** `GET /qorechain/pqc/v1/params`, the IBC v2 client route `/ibc/core/client/v2/counterparty_info/{client_id}`, and the full set of PRISM (`x/rlconsensus`) queries under `/qorechain/rlconsensus/v1/` (`agent`, `params`, `observation`, `reward`, `policy`, `applied_params`, `last_action`). Mainnet answers 501 (not implemented) on the PRISM, PQC parameter and IBC v2 client routes. The AMM routes under `/qorechain/amm/v1/` (`pools`, `quote/exact_in`, `pools/{id}/lp/{address}`) answer on both networks. See [REST / gRPC reference](/api-reference/rest-grpc-endpoints).
* **PRISM agent.** The testnet agent is in shadow mode (set by testnet governance proposal 29): it observes every 10 blocks, computes a reward and a proposed action, and records them without changing any value. The agent circuit breaker was corrected and its history is bounded. See [PRISM](/architecture/prism-consensus-engine).
* **Live PRISM values in the EVM.** The `rlConsensusParams` precompile now returns the module's applied values instead of fixed numbers.
* **Locked-stake undelegation refused earlier.** The mempool refuses an undelegation or redelegation of locked stake before it costs a fee; a transaction simulation also returns the typed error code.
* **RDK.** Batch queries gain a `withdrawals_bound` field.
* **IBC rate limit (testnet only).** A per-channel rate limiter for IBC transfers: quotas are a whole percent of supply per window of hours. **Governance sets the limits; nothing is automatic, and no limits are set today** (an empty set means unlimited). A forwarded packet is charged on both channels, and a refund returns the quota.
* **IBC packet forwarding (testnet only).** An incoming IBC v1 transfer can carry a `forward` memo (receiver, port, channel) that sends it on to another channel, with refunds to the sender if a hop fails. There are no retries and the default hop timeout is 10 minutes; a token that converts to an ERC-20 on arrival cannot be forwarded.
* **08-wasm light clients (testnet only).** The 08-wasm light-client messages (store, migrate and remove a client binary) are added, authority-only. The allowed client types still hold only the standard client, so no wasm light client can be created until governance adds `08-wasm`.
* **Fest test tokens.** Three ERC-20 contracts deployed for the builder fest were registered by testnet governance (proposal 26) as bank denominations: fUSD (6 decimals), fETH (18) and fBTC (8). They are testnet-only test tokens with no value. See [Faucet](/dashboard/faucet#fest-tokens).

### v3.2.5 (testnet)

**Release focus:** Applied on the testnet by testnet governance proposal 15 at height **8,890,800** (26 October 2026). On mainnet, governance proposal 14 would apply v3.2.5 (build 2) at height 3,906,833 and was in its voting period at the time of writing. The features of v3.2.5 are documented in this history on the day mainnet applies it.

---

## v3.2.4 — Light-Node Registration Window and Optional Time-Locked Staking (mainnet)

**Release focus:** The current mainnet release. It ran on the testnet `qorechain-diana` first: testnet governance proposal 13 applied it at height **8,337,253** (19 October 2026). On mainnet, governance proposal 13 applied it at height **3,742,566** on 23 October 2026: nodes stayed on v3.2.3 until that block, halted there and restarted on v3.2.4, and transaction signing is unchanged. The mainnet manifest sets `minCompatible` to 3.2.4, so a node joining mainnet needs v3.2.4 (the testnet has since moved on to v3.2.6). Every feature below is live on mainnet and on the testnet.

* **Light-node registration window.** A light node's reward bound starts at the later of the previous settlement and the node's own registration, so a new registration does not collect an accumulated amount from before it joined.
* **Optional time-locked staking (`x/stakingtier`, a new module).** A delegator may lock part of a delegation for 3, 6 or 12 months; the locked part cannot be undelegated or redelegated, and an early unlock is allowed with a penalty that is burned. The minimum lock is 10 QOR. See [Staking and Delegation](/user-guide/staking-and-delegation#time-locked-staking).
* **New emission mode.** `x/inflation` gains a third emission mode, `target_apy`, with a `target_apy_bps` parameter (`0` on both networks; the mode in force on mainnet is still `fixed`). Changing a network's emission mode is a separate governance decision; the mode in force is shown at `/qorechain/inflation/v1/params`.
* **`possession_proven` flag** on post-quantum account records; proof of possession for account keys stays optional.
* **Bridge validator proof of possession.** Registering a bridge validator needs a proof of possession and a key no other bridge validator uses.
* **RDK challenge window in block time.** The optimistic challenge window is counted in block time rather than a block count derived from it.
* **Node-local hardening** (JSON-RPC request bounds, state-sync chunk budget, key-registration pre-checks) and new queries (`protocol_features`, `auth_nonce`, and the extra light-node reward-pool fields such as `monthly_cap_active`).

## v3.2.3 — Second October Security Batch

**Release focus:** The second October hardening batch, applied on mainnet by governance proposal 11 at height **3,662,051** (20 October 2026, 16:01 UTC); applied earlier on the testnet at height 8,003,746 (15 October). The upgrade turns on 52 protocol features at that height; signing format, addresses, decimals, memos and fees are unchanged.

* **Post-quantum key integrity.** Weak, degenerate and already-used keys are refused at registration; hybrid-key maintenance is tightened; post-quantum key-management messages can no longer run through authz; an account cannot remove its last signing algorithm. Registration (`MsgRegisterPQCKeyV2`, `tx pqc register-key-v2 ... --pqc-key <name>`) accepts an **optional proof of possession**, verified when present.
* **Scoped EVM windows.** `MsgOpenEVMWindow` takes optional `native_only` (plain native QOR transfers only) and `allowed_targets` (up to 16 recipients) fields that narrow a window. See [EVM authorisation window](/getting-started/first-transaction#evm-window).
* **Rollup escrow ledger** for the RDK, an **atomic cross-VM queue** with precompile hardening, and **canonical stake authorisation**.
* **Self-only vesting creation.** Vesting-account creation can only fund the creator's own account (the three vesting messages also remain switched off on the circuit breaker).
* **Economics fixes.** The emission year is derived from the epoch length; the AMM end-block work is bounded; burn records are pruned; the recorded stranded staker share was recomputed at the upgrade height from 0 to 3,807,496.79 QOR (see [Tokenomics](/architecture/tokenomics#stranded-and-reserve)).
* **Light-node monthly bound.** The per-node reward bound is now stated per month: 2,000 QOR per node per 30 days, prorated by block time and uptime.
* **Governable licence authority.** A new `MsgUpdateAuthority` lets governance replace the authority that grants licences.
* **Public builds refuse public networks.** A binary built from the public source tree stops if it is pointed at a live network.
* **New read routes.** The `x/inflation` parameters and epoch record are served over REST on mainnet (`/qorechain/inflation/v1/params`, `/epoch_info`).

## v3.2.2 — Dependency Update and First October Security Batch (mainnet)

**Release focus:** A coordinated upgrade applied on mainnet by governance proposal 7 at height **3,556,788** (16 October 2026, 17:59 UTC); applied on the testnet at height 6,905,034 (2 October). Signing format is unchanged.

* **Dependencies.** Cosmos SDK v0.53.8, consensus engine v0.38.26 and ibc-go v10.7.
* **26 protocol features** turn on at the upgrade height, including: EIP-7702 delegation needs a post-quantum consent (`MsgAuthorizeEVMDelegation`, cleared by `MsgClearEVMDelegation` or `MsgCloseEVMWindow`); multisig bounds are enforced in block execution; validator admission is checked on every path; AMM integrity checks; module accounts cannot be claimed through the EVM; pre-EIP-155 transactions are refused; post-quantum key registration validates the classical key; the RDK and multilayer anchor message moves to a second form (v2); and the failed-transaction burn channel is applied.

## v3.2.1 — Node Hardening

**Release focus:** A node-local security release for mainnet (14 October 2026): **no upgrade height, no consensus change and no governance vote**. Nodes on v3.2.0 keep following the chain.

* Hardens the public API's resource limits, bounds the EVM JSON-RPC and the mempool, and gossips promoted EVM transactions.
* Pins the EVM chain ID in the node configuration and cross-checks it against the Cosmos chain ID; operators must set `evm-chain-id = 9801` in `app.toml` (a different value is logged as an error).
* Updates the consensus-engine dependency; keep the system clock NTP-synchronised (a skew of more than 60 seconds stops the node).
* Recommended for every operator; `minCompatible` in the mainnet manifest was 3.2.0 at the time.

v3.2.1 was applied node by node and has no upgrade height; it was superseded on mainnet by v3.2.2 (16 October), v3.2.3 (20 October) and v3.2.4 (23 October).

## v3.2.0 — EVM Authorisation Window and Accounting Fixes

**Release focus:** Make the post-quantum requirement true on every lane, and close two accounting gaps. Applied on mainnet by governance proposal #6 at height **2,981,742** (25 September 2026, 12:07 UTC); applied on the testnet at height 5,920,000.

* **EVM authorisation window (breaking for EVM wallets).** An EVM transaction is now admitted only from an account that has a registered ML-DSA-87 key **and** an open window. The window is opened with a Cosmos-lane message (`MsgOpenEVMWindow`, with a hybrid ML-DSA-87 signature (FIPS 204)) and bounded by blocks (≤ 17,280), transactions (≤ 1,000) and total value (transferred value plus the maximum fee of each transaction); `MsgCloseEVMWindow` revokes it. Standard Ethereum signing is unchanged inside a window. The EVM lane, which had been switched off on mainnet on the circuit breaker since 16 September, was reopened in the same block the rule took effect. See [EVM authorisation window](/getting-started/first-transaction#evm-window).
* **Hybrid signature v2.** Post-quantum signatures are now over domain-tagged, chain-bound sign-bytes; the first form is refused from the upgrade height. Clients check the node's applied upgrade plans to choose the form; the CLI (`--sign-bytes auto`), SDK 0.8.x and wallet-adapter 0.2.x do this. Key-migration and bridge-attestation payloads moved to the same scheme. See [Post-Quantum Security](/architecture/post-quantum-security#sign-bytes-v2).
* **Staker share paid.** The 10 % staker share of the fee split was being deposited where it backed no claim; from this upgrade it is paid as a normal staking reward. The amount already accumulated (6,693,045.92 QOR on mainnet) is recorded on chain (`GET /qorechain/burn/v1/stranded_rewards`) and could move only by a governance vote (`MsgReleaseStrandedRewards`); governance released it in October 2026 (see the [governance timeline](#governance-timeline) and [Tokenomics](/architecture/tokenomics#stranded-and-reserve)).
* **Light-node reward reserve.** The 3 % light-node share that accumulated while no node was eligible (3,156,009.33 QOR on mainnet) is recorded as a reserve (`GET /qorechain/lightnode/v1/reward_pool`), excluded from distribution and movable only by governance (released in October 2026); distribution afterwards pays only what accrued since the previous run, bounded per node. Light-node registration was still closed at this release and has since opened (see [Light Node](/light-node/overview#reward-program-status)).
* **Per-sender transaction limit** is now enforced (600 transactions per 30 blocks per sender, so relayers can operate).
* **Upgrade module version map** now lists every module (48), fixing a gap that would have affected later migrations.
* Also: bridge module account and attestation payloads hardened, proposed blocks validated, rollup settlement restricted to the rollup's sequencer with per-rollup escrow and an effective creation burn, multilayer creator stake locked at registration and returned on decommission, the smart-account `enabled` flag enforced on every path, and validator-admission and vesting-creation paths closed to authz nesting.

## v3.1.96 + v3.1.97 — QoreChain Native Access Lockdown

**Release focus:** Close permissionless contract code upload and instantiation, following an industry-wide security advisory for CosmWasm, the runtime that QoreChain Native is built on.

* **Contract upload and instantiation now require explicit permission.** `code_upload_access` and `instantiate_default_permission` are set to `Nobody` on both mainnet and testnet — verified live, independent of which of these two tags a given node is running, since it's an on-chain parameter rather than something only the newer binaries enforce. See [QoreChain Native Development](/developer-guide/cosmwasm-development) for what this means if you're building a contract. Already-instantiated contracts are unaffected — `execute` and `query` work as before. Both networks also have the three QoreChain Native upload and instantiate messages switched off on the circuit breaker.
* **Position-independent (PIE) release builds**, per the same advisory's hardening guidance, so the memory address an exploit would need to guess is randomized per process. Dynamically linked binaries only needed one build flag; verified not to be state-breaking.

## v3.1.95 — Cosmos EVM Hardening

**Release focus:** Rolling security update to the EVM balance-accounting library.

* **Overflow hardening** — An EVM balance-update path now fails safely instead of silently wrapping on an extreme overflow condition. Ships as a rolling, non-consensus-breaking update — no governance vote or coordinated halt height was required.

## v3.1.94 — Emission Cap and Administrative Message Hardening

**Release focus:** Bring staking-reward emission in line with actual network conditions, and tighten authorization checks on privileged administrative messages.

* **Emission cap** — A governance proposal, passed with full bonded-stake support and applied at height 2,122,074 (26 August 2026), replaced the original decaying emission schedule with a fixed per-epoch amount under a hard, cumulative cap. The original schedule had been calibrated for a much more mature, fully-bonded network; against actual bonded stake it was paying out far faster than intended. The amount per epoch and the cap were raised by governance proposal 10 on 19 October 2026. See [Tokenomics](/architecture/tokenomics#staking-reward-schedule) for the current numbers.
* **Administrative message hardening** — A set of privileged, authority-gated administrative messages now have their signer verified against the governance module's own address rather than trusting a value carried in the message itself.
* Also carries the node-onboarding reliability fix from v3.1.92, for any node updating directly to this release.

## v3.1.92 — Node Synchronization Reliability

**Release focus:** More reliable node onboarding from snapshots and the published chain archive.

* **Snapshot and archive sync fix** — Resolved an issue where a node restoring from a state-sync snapshot or the published chain archive could fail to complete sync past certain historical blocks. Onboarding via either path now completes reliably.

## v3.1.90 — Light-Node Uptime Accounting

**Release focus:** Uptime measured for light-node reward eligibility now accrues consistently over time.

* **Forward-accruing uptime** — A light node's reward-eligibility uptime is now computed by accruing its expected heartbeat count forward from its own registration, at whatever heartbeat interval was in force at each point in time, rather than by recomputing its entire history under whichever interval is currently in force. A governance change to the heartbeat interval therefore affects uptime going forward only, and never retroactively re-rates a node's past performance.

## v3.1.86 — Validator Recovery Safeguard

**Release focus:** A validator can no longer be permanently locked out of recovering from a downtime jail.

* **Jail-lock fix** — A validator operator account with no post-quantum key registered can now always submit `MsgUnjail` to recover from a downtime jail, even when hybrid-signature enforcement is set to required with classical fallback disabled. Previously, such an account had no path to recovery, since unjailing itself required sending a transaction it was blocked from sending.
* **State-sync snapshots** — Snapshot generation is enabled network-wide, letting new validators and full nodes fast-join via state sync instead of a full historical replay.

## v3.1.85 — Delegated Spending via Linked Wallets

**Release focus:** A linked external wallet key (Phantom, MetaMask) can now **spend** from the one canonical post-quantum account — under least-privilege permissions, spending limits, and instant revocation.

* **Authenticator execution lanes** — Two new messages let a registered authenticator authorize transfers from the canonical account without the account owner being present: **`MsgExecuteEVM`** (an EVM call/transfer from the account's `0x…` address) and **`MsgExecuteCosmos`** (a Native-lane bank send). A **relayer** submits and pays for the envelope — its own hybrid PQC signature satisfies the transaction requirements — while the authenticator's signature over domain-separated, replay-bound sign bytes is the authorization. The external key never needs an ML-DSA co-signature.
* **MetaMask as an authenticator** — secp256k1 authenticators can now be registered by their **20-byte Ethereum address** and verified via **EIP-191 `personal_sign`** (in addition to the 33-byte compressed-key form), so a standard MetaMask account can be linked and spend under limits.
* **Enforcement on all three lanes** — Permission scopes and **SpendingRule** value limits (per-transaction + daily caps) are enforced on the Native, EVM, and SVM lanes; key-management messages are never delegable. Distinct error codes let wallets show the right message: `5` spending limit exceeded, `6` authenticator expired, `10` permission denied, `11` replay rejected.
* **Permission schema query** — `GET /qorechain/abstractaccount/v1/permission_schema` (also gRPC/CLI) returns the canonical permission taxonomy (11 permissions), the message→permission map, and the non-delegable message list, so wallets validate scopes without hardcoding.
* **Same-algorithm PQC key rotation** — New **`MsgRotatePQCKey`** rotates an account's ML-DSA-87 key within the same algorithm (dual-signed by the old and new keys), enabling migration of legacy-derived keys to the canonical address-bound derivation and retirement of a compromised key. New CLI: `tx pqc rotate-key` and `tx pqc recover-key` (deterministic key recovery from a mnemonic).
* **Root-key transactions unaffected** — The changes are additive; normal wallet and exchange flows are unchanged. Node operators must be on **v3.1.85** by the network upgrade height.
* **Current status** — The smart-account and linked-wallet features are implemented but **switched off on mainnet** (`abstractaccount.enabled = false`) and enabled on the testnet (checked 27 October 2026); on mainnet, from v3.2.0 every authenticator path is refused while the flag is off. Check `GET /qorechain/abstractaccount/v1/config` before offering a linking flow.

## v3.1.84 — Authenticator Permissions & Spending Limits

**Release focus:** The permission model behind delegated spending.

* **Canonical permission taxonomy** — Eleven permissions (`all`, `send`, `delegate`, `withdraw`, `vote`, `evm`, `wasm`, `svm`, `amm`, `ibc`, `deploy`) with a fail-closed message→permission map: a message type that is not mapped is denied, and key-management messages can never be delegated.
* **SpendingRule enforcement** — Per-transaction and per-day (UTC) spending caps with allowed-denom lists are enforced and recorded per (account, authenticator) pair.
* **SVM lane authorization** — Actions authorized by a foreign-scheme key (e.g. Phantom ed25519) on the SVM lane route through the same central authorization gate.

## v3.1.83 — Unified Account Signing Across All Three Interfaces

**Release focus:** One key, one account — a single unified identity that can now **sign**, not just hold a balance, on the Cosmos, EVM, and SVM interfaces.

* **One key signs on every lane** — An account created eth-native (address = keccak of its secp256k1 public key) now signs Cosmos-lane transactions with the `eth_secp256k1` scheme in addition to EVM transactions. Its `qor1…` (Cosmos), `0x…` (EVM), and Solana-VM (base58) forms are one 20-byte identity that both **holds one balance** and **spends on all three lanes** — including post-quantum hybrid (ML-DSA-87) Cosmos transactions.
* **Post-quantum signing unchanged** — The unified account still registers its ML-DSA-87 key and carries the FIPS-204 hybrid signature the chain requires; the classical part is `eth_secp256k1` (keccak) instead of the coinType-118 scheme. Existing coinType-118 accounts are unaffected.
* **Consensus-neutral rolling upgrade** — Delivered as a rolling binary upgrade on both networks with **no re-genesis and no chain halt**. Account balances, history, and genesis are unchanged.
* **Client tooling** — `@qorechain/wallet-adapter` 0.1.5 adds eth-native Cosmos signing (`signClassicalEth` / `signHybridEth`), unified 3-address generation, and `walletFromSeed` (derive the canonical account from any 32-byte seed — e.g. a Phantom signature); `@qorechain/chain-bridge` gains an `eth_secp256k1` signing path.

:::caution Node operators — upgrade required
Full nodes must run **v3.1.83+**. A pre-3.1.83 node cannot decode an eth-native (`eth_secp256k1`) transaction and will stop syncing once one appears in a block. Download the current bundle from [download.qore.host](https://download.qore.host).
:::

## v3.1.82 — Native QOR on SVM Live + Integrator Enablement

**Release focus:** The SVM native-QOR unification running on both networks, plus everything an exchange or integrator needs to connect.

* **Unified native-QOR balance live on all three interfaces** — The SVM unification (v3.1.81) is confirmed live on mainnet and testnet: the same account holds one balance visible as `uqor` (6 decimals) on Cosmos, wei-style 18 decimals on the EVM, and lamports (9 decimals; 1 uqor = 1,000 lamports) on the Solana-compatible interface.
* **Verified public endpoints** — Public HTTPS endpoints for consensus RPC, REST, EVM JSON-RPC, and SVM JSON-RPC on both networks, plus the public [block explorer](https://explore.qore.network). See [Networks](/appendix/networks).
* **Downloads** — Versioned node-binary bundles, the mainnet genesis, and fresh chain-data snapshots (with SHA-256 checksums) published at [download.qore.host](https://download.qore.host).
* **Deterministic post-quantum signing across the client stack** — `@qorechain/pqc` 0.1.1 signs ML-DSA-87 deterministically (FIPS-204 §3.4) in all six language bindings, matching what the chain accepts; `@qorechain/wallet-adapter` 0.1.2 builds on it for hybrid transaction signing.
* **Integrator guide** — New [Exchange & Integrator Guide](/developer-guide/exchange-integration) covering deposits, withdrawals, and node operations across the three interfaces.

## v3.1.81 — SVM Native-QOR Unification

**Release focus:** Native QOR as a first-class asset on the Solana-compatible interface.

* **Native QOR on SVM** — The SVM runtime now surfaces the account's native QOR balance directly (in lamports), rather than tracking a separate SVM-only balance. `getBalance` and `getSignaturesForAddress` work against native funds, and System Program transfers move native QOR.
* **SVM address mapping** — An account's SVM address is derived from its 20 account bytes (right-padded to 32 bytes, base58-encoded), so the Cosmos, EVM, and SVM addresses of one key refer to the same funds.

## v3.1.80 — Multilayer State-Anchor Queries

**Release focus:** Readable, offline-verifiable settlement anchors for rollups.

* **Anchor read queries** — The `x/multilayer` query service now exposes `Anchor` (the latest state anchor for a layer) and `Anchors` (a layer's anchor history), so clients can fetch a layer's settlement anchor and verify it independently.
* **REST gateway for multilayer** — Every multilayer query (`params`, `layers`, `layers/{layer_id}`, `anchor/{layer_id}`, `anchors/{layer_id}`, `routing-stats`) is now available over REST in addition to gRPC.
* **ML-DSA-87 settlement receipts unblocked** — Each anchor carries an **ML-DSA-87 (Dilithium-5)** signature over its canonical fields, providing the on-chain basis for the Rollup Development Kit's offline settlement-receipt verification.

## v3.1.79 — Validator Auto-Provisioning for Bridge Networks

**Release focus:** Turnkey participation on connected networks for licensed validators.

* **Network driver framework** — A declarative driver framework lets a QoreChain validator that holds the relevant `validator_<chain>` (or `qcb_bridge`) license have the matching external-network client provisioned, configured, and run on the same node under QoreChain orchestration — only once the license is activated.
* **Drivers for all 37 bridge networks** — Coverage spans every connected network, classified by participation model (permissionless validator, capped/elected/admission, L2 full-node, and non-staking/trust-list roles). External-network stake and signing keys remain operator-supplied per network; QoreChain ships the framework and the enforced license gate.

## v3.1.78 — Pre-Deploy Readiness

**Release focus:** Wallets, bridges, IBC, and licensing all work at launch — with no post-deploy governance.

* **Trustless post-deploy bridge activation** — A `bridge_admin` key (or `qcb_bridge` license holder) can activate any connected chain's bridge with a single signed transaction (`tx bridge update-chain-config` / `set-verifier-bootstrap`) — setting contract address, confirmations, architecture, status, the active verifier, and the verifier trust root — with no governance proposal or chain upgrade.
* **Validator-network license gate** — The orchestrator now enforces the `validator_<chain>` / `qcb_bridge` license (fail-closed) before starting any external-network client.
* **Wallet integration packages** — `@qorechain/wallet-adapter` and `@qorechain/connect` published to npm (v0.1.0), adding one-call MetaMask network registration (EIP-3085, **18-decimal** native QOR on the EVM rail) and Keplr gas-price configuration.
* **IBC turnkey relayer** — Ready-to-run relayer configuration and channel-bootstrap tooling for the eight IBC counterparties, so channels come up post-deploy without bespoke setup.

## v3.1.77 — Bridge & Burn REST Endpoints

**Release focus:** Read-only REST access for cross-chain and supply modules.

* **Bridge REST endpoints** — Read-only HTTP query endpoints for the bridge module, exposing bridge state over standard REST in addition to gRPC.
* **Burn REST endpoints** — Read-only HTTP query endpoints for the burn module, making fee-distribution and supply data queryable over standard REST.

## v3.1.76 — SVM Toolchain Modernization

**Release focus:** Solana Virtual Machine compatibility refresh.

* **Current-toolchain program support** — SVM execution modernized so that programs built with the current Solana toolchain run on the QoreChain SVM runtime.

## v3.1.75 — SVM JSON-RPC by Default

**Release focus:** Out-of-the-box Solana-compatible RPC.

* **Solana-compatible JSON-RPC** — The SVM JSON-RPC server is now enabled by default (port **8899**) and started automatically with the node, providing a Solana-compatible RPC interface for SVM tooling.

## v3.1.74 — Rollup Profile Presets

**Release focus:** Rollup Development Kit usability and settlement.

* **Profile-preset application** — Rollup creation now applies the selected profile's preset (DeFi, gaming, NFT, enterprise, or fully custom), so new rollups inherit sensible defaults for their use case.
* **Optimistic settlement** — The optimistic settlement path (batch submit and challenge) is operational end to end.

## v3.1.73 — Post-Quantum Hash Baseline

**Release focus:** Completing the default post-quantum cryptographic baseline.

* **SHAKE-256 default hash** — SHAKE-256 (SHA-3 family) is adopted as the default application hash, completing the default post-quantum baseline of **ML-DSA-87 (Dilithium-5)** signatures, **ML-KEM-1024** key encapsulation, and **SHAKE-256** hashing.

## v3.1.72 — Stability & Maintenance

**Release focus:** Routine stability and build-pipeline maintenance.

* **Stability improvements** — Internal stability, dependency, and build-pipeline maintenance with no externally visible behavior changes.

## v3.1.71 — PQC Hybrid Signatures Enforced by Default

**Release focus:** Post-quantum security on by default on the Cosmos transaction path.

* **Hybrid signatures required by default** — Post-quantum hybrid signatures are now enforced by default on the Cosmos transaction path: each transaction carries a post-quantum **ML-DSA-87 (Dilithium-5)** signature alongside the classical **secp256k1** signature.
* **Governance-controlled enforcement** — Enforcement mode remains governance-controlled, with the default set to **required**.

## v3.1.70 — Production Hardening

**Release focus:** Production hardening and consensus optimization for the live mainnet.

* **PRISM consensus optimization** — Continued improvements to the PRISM reinforcement-learning optimization layer for adaptive parameter tuning under live network conditions, with circuit-breaker safety controls.
* **Performance and stability** — Throughput, latency, and resource-usage refinements across validators and full nodes.
* **Operational tooling** — Improved monitoring, query, and node-operation ergonomics for mainnet operators.
* **Tokenomics v2.1 alignment** — Fee distribution and emission mechanics aligned with the finite, capped-emission economic model (later refined by the v3.1.94 emission cap).

## v3.0.0 — Mainnet Genesis

**Release focus:** Mainnet launch and token generation event.

* **Mainnet genesis** — QoreChain mainnet (`qorechain-vladi`, EVM chain ID 9801) has been live since **7 June 2026**, with the token generation event (TGE) at genesis.
* **Five-way fee split** — Protocol fee distribution across validators, burn, treasury, stakers, and light nodes (**37 / 30 / 20 / 10 / 3**), adding a dedicated light-node share.
* **On-chain AMM** — Native automated-market-maker module (`x/amm`) for on-chain liquidity pools and swaps.
* **Chain licensing** — On-chain license module (`x/license`) for registering and managing protocol entitlements.
* **Hardened settlement paradigms** — RDK settlement modes finalized as optimistic, zk, based, and sovereign.

## v1.4.0 — Pre-Mainnet Expansion

**Release focus:** Cross-chain coverage and release-candidate stabilization ahead of mainnet.

* **Expanded cross-chain coverage** — Additional IBC and bridge connectivity to a broader set of external networks.
* **Light-node participation** — Introduced light nodes and the groundwork for their fee-share rewards.
* **Release-candidate hardening** — Extensive testing, audits, and stabilization across all core modules in preparation for mainnet genesis.

## v1.3.0 — Rollup Development Kit

**Release focus:** Native rollup infrastructure for sovereign and shared-security rollup deployments.

* **x/rdk module** — Full Rollup Development Kit with four settlement paradigms: optimistic, zk, based, and sovereign
* **5 preset profiles** — Pre-configured rollup templates for DeFi, gaming, NFT, enterprise, and fully custom use cases
* **Native data availability** — On-chain DA layer with blob storage, retention management, and pruning lifecycle
* **EndBlocker auto-finalization** — Automatic batch finalization when the challenge window expires, with no operator intervention required
* **AI-assisted profile selection** — `suggest-profile` query that recommends an optimal rollup configuration based on the intended use case
* **Multilayer integration** — Rollups register as layers in the multilayer architecture, inheriting routing, anchoring, and challenge mechanics
* **Bank escrow lifecycle** — Operator stake is held in escrow during rollup operation and released upon clean shutdown or forfeited on slashing

## v1.2.0 — IBC & Bridges

**Release focus:** Cross-chain connectivity and advanced account abstractions.

* *(Designed; the cross-chain layer is still pending — see [Bridge Architecture](/architecture/bridge-architecture).)* **25 cross-chain connections** — 8 IBC channels and 17 QoreChain Bridge (QCB) connections to external networks
* **x/babylon module** — BTC restaking integration enabling Bitcoin holders to participate in QoreChain staking security
* **x/abstractaccount module** — Smart account framework with programmable spending rules, session keys, and custom authentication logic
* **x/fairblock module** — Threshold Identity-Based Encryption (tIBE) for MEV-resistant transaction encryption
* **x/gasabstraction module** — Multi-token gas payment design supporting native QOR, IBC-bridged USDC, and IBC-bridged ATOM (no IBC channel is open yet)
* **5-lane TX prioritization** — Lane definitions for block-space prioritisation (configuration only; not enforced by the live mempool)
* **IBC relayer configurations** — Pre-configured relayer setups for all supported IBC channels
* **Bridge-to-burn integration** — Bridge fees are routed through the burn module's fee distribution

## v1.1.0 — PQC Hybrid Signatures

**Release focus:** Post-quantum cryptographic security and algorithm agility.

* **Dual secp256k1 (ECDSA) + ML-DSA-87 signatures** — Every transaction carries both a classical and a post-quantum signature, verified in the AnteHandler chain
* **3 enforcement modes** — Configurable hybrid signature enforcement: off (mode 0), permissive (mode 1, PQC optional), mandatory (mode 2, PQC required)
* **Key registration** — Early builds auto-registered a PQC public key on the first hybrid transaction; that behaviour was removed, and a key is now registered explicitly with `MsgRegisterPQCKey` (see [First Transaction](/getting-started/first-transaction#register-pqc-key))
* **SHAKE-256 hash foundation** — All PQC-related hashing operations use SHAKE-256 (SHA-3 family) for address derivation
* **TEE attestation interfaces** — Trusted Execution Environment attestation support for proving PQC key generation integrity
* **Algorithm agility framework** — Pluggable algorithm registry allowing future PQC algorithms to be added via governance without a chain upgrade

## v1.0.0 — Genesis (Tokenomics Engine)

**Release focus:** Initial protocol launch with full tokenomics, multi-VM execution, and AI-assisted operations.

* **x/burn module** — Multi-channel fee burn mechanism with a four-way distribution across validators, burn, treasury, and stakers
* **x/xqore module** — Governance staking derivative with tiered early-unlock penalties and PvP rebase redistribution
* **x/inflation module** — Epoch-based emission with annual decay (replaced in v3.1.94 by a fixed per-epoch amount under a hard cumulative cap)
* **PRISM consensus layer** — Reinforcement-learning optimization (PPO) for dynamic chain parameter tuning with circuit-breaker safety controls
* **Triple-pool CPoS** — Composite Proof-of-Stake with RPoS, DPoS and PoS validator pools weighted by reputation scores (implemented in `x/qca`; not yet wired into block production)
* **QDRW governance** — Quadratic Delegation with Reputation Weighting voting-power formula (implemented; disabled on the live networks)
* **EVM + QoreChain Native + SVM runtimes** — Three concurrent execution environments: the QoreChain EVM Engine, QoreChain Native smart contracts, and the Solana Virtual Machine
* **Cross-VM bridge** — Message passing and asset transfers between EVM, QoreChain Native, and SVM runtimes within a single block
* **Post-quantum cryptography** — ML-DSA-87 signing backed by a high-performance PQC library
* **QCAI** — On-chain heuristic analysis with an optional off-chain sidecar for fraud detection, fee estimation, and network optimization
* **Containerized deployment** — Full multi-validator testnet deployment with sidecar service and block indexer
* **Block indexer** — Block listener with persistent storage for historical query and analytics
