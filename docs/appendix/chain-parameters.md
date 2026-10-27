---
slug: /appendix/chain-parameters
title: Chain Parameters
sidebar_label: Chain Parameters
sidebar_position: 2
---

# Chain Parameters

Consolidated reference of the module parameters of the QoreChain networks, grouped by module. Parameters can be queried with `qorechaind query <module> params` where the module has a params query (`pqc`, `amm`, `crossvm`, `lightnode`, `multilayer`, `reputation`, `rlconsensus`; `ai`, `qca`, `rdk`, `bridge`, `abstractaccount` and `gasabstraction` use `config`), and over REST only for the routes listed in the [REST / gRPC reference](/api-reference/rest-grpc-endpoints). The `x/inflation` parameters are also served over REST on mainnet since v3.2.3 (`/qorechain/inflation/v1/params`). REST is not available on mainnet for `ai`, `qca`, `reputation`, `crossvm`, `rlconsensus`, `fairblock` or `xqore`, nor for the `pqc` parameters (the testnet has served the `pqc`, `crossvm` and `rlconsensus` parameters over REST since v3.2.6).

:::note
Values shown were read live from mainnet **`qorechain-vladi`** (EVM chain ID **9801**, release **v3.2.4**, applied 23 October 2026) on 23 October 2026 (genesis values unless a governance proposal changed them; those are noted), and the core-module rows were re-read on 27 October 2026. Governance proposal 14 would apply v3.2.5 on mainnet at height 3,906,833 (in its voting period at the time of writing); this page describes mainnet as it is today and is updated when that upgrade is applied. The testnet **`qorechain-diana`** (EVM chain ID **9800**) runs release **v3.2.6** (applied 27 October 2026). Its values are identical to mainnet except where stated; the remaining differences are collected in [Differences between testnet and mainnet](#testnet-differences). Durations given in blocks convert at the measured mainnet block time of about 3.1 seconds (the testnet produces a block about every 1.3 seconds).
:::

---

## PQC Module (`x/pqc`)

| Parameter                  | Value                      | Description                                                              |
| -------------------------- | -------------------------- | ------------------------------------------------------------------------ |
| `pqc_primary`              | `true`                     | Post-quantum signatures are the primary scheme                           |
| `allow_classical_fallback` | `false`                    | Classical-only fallback is closed; Cosmos-lane txs must be hybrid        |
| `min_security_level`       | `5`                        | Minimum NIST security level for a registered algorithm                   |
| `default_migration_blocks` | `1,000,000`                | Default length of a governance-started algorithm migration (about 36 days at ≈3.1 s blocks) |
| `default_signature_algo`   | `1`                        | Dilithium-5 / ML-DSA-87                                                  |
| `hybrid_signature_mode`    | `2` (required)             | Enforcement mode: 0=disabled, 1=optional, 2=required                     |

The algorithm registry (id 1 `dilithium5`, id 2 `mlkem1024`) is chain state rather than a parameter. Keys are registered explicitly with `MsgRegisterPQCKey` or `MsgRegisterPQCKeyV2`; there is no auto-registration. Since v3.2.3 the chain refuses weak, degenerate and already-used public keys, and `MsgRegisterPQCKeyV2` accepts an optional proof of possession (`tx pqc register-key-v2 ... --pqc-key <name>`) that the chain verifies when present.

### EVM authorisation window limits {#evm-window-limits}

The bounds of an [EVM authorisation window](/getting-started/first-transaction#evm-window) are protocol constants rather than module parameters:

| Bound | Value |
| ----- | ----- |
| Maximum `blocks` | 17,280 (about 15 hours at ≈3.1 s blocks) |
| Maximum `max_txs` | 1,000 |
| `max_value` | greater than 0 (uqor; transferred value plus the maximum fee of each transaction) |
| Maximum `allowed_targets` | 16 recipient addresses (optional scope, v3.2.3) |

A window can also be narrowed with `native_only` (plain native QOR transfers only) from v3.2.3.

---

## AI Module (`x/ai`)

The module's configuration (`qorechaind query ai config`):

| Parameter           | Value                  | Description                                                                 |
| ------------------- | ---------------------- | --------------------------------------------------------------------------- |
| `anomaly_threshold` | `0.7`                  | Anomaly score above which the ante handler flags a transaction              |
| `routing_strategy`  | `reputation_weighted`  | Routing strategy                                                            |
| `risk_threshold`    | `0.8`                  | Risk score threshold                                                        |
| `max_tx_per_minute` | `600`                  | Per-sender transaction limit on the Cosmos lane, counted over a 30-block window (about 94 s at ≈3.1 s blocks; the name is historical). Enforced since v3.2.0; the default is 10 |

The fraud-scoring weights and severity thresholds described on the [AI Engine](/architecture/ai-engine) page are detector constants, not module parameters.

---

## Reputation Module (`x/reputation`)

| Parameter   | Value  | Description                                          |
| ----------- | ------ | ---------------------------------------------------- |
| `alpha`     | `0.30` | Weight for uptime score (S\_i) in reputation formula |
| `beta`      | `0.35` | Weight for participation score (P\_i)                |
| `gamma`     | `0.20` | Weight for community score (C\_i)                    |
| `delta`     | `0.15` | Weight for tenure score (T\_i)                       |
| `lambda`    | `1000` | Time-decay scale for historical scores               |
| `min_score` | `0.10` | Floor for a reputation score                         |

Reputation formula: `R_i = alpha * S_i + beta * P_i + gamma * C_i + delta * T_i` with time decay applied to historical scores.

---

## QCA Module (`x/qca`)

:::note Implemented, not yet active
The Triple-Pool CPoS logic is implemented in `x/qca` and these parameters are on chain, but they are **not yet wired into block production, rewards, slashing or the governance tally**. Slashing in force is the standard `x/slashing` module (see [Staking, slashing, governance, fees and EVM](#core-modules)). See [Consensus Mechanism](/architecture/consensus-mechanism).
:::

The configuration (`qorechaind query qca config`):

| Parameter                       | Value               | Description                                           |
| ------------------------------- | ------------------- | ----------------------------------------------------- |
| `use_reputation_weighting`      | `true`              | Genesis setting for reputation weighting              |
| `min_reputation_score`          | `0.1`               | Minimum reputation score                              |
| `pool_classification_interval`  | `1000` blocks       | Blocks between pool classifications                   |
| `pool_weight_rpos`              | `0.40`              | Proposal weight of the RPoS pool                      |
| `pool_weight_dpos`              | `0.35`              | Proposal weight of the DPoS pool                      |
| `pool_min_delegation_dpos`      | `10,000,000,000 uqor` | Minimum delegation for the DPoS pool (10,000 QOR)   |
| `pool_rep_percentile_rpos`      | `70`                | Reputation percentile for the RPoS pool               |
| `bonding_alpha`                 | `0.1`               | Bonding-curve parameter                               |
| `bonding_beta`                  | `1.0`               | Bonding-curve parameter                               |
| `bonding_phase_multiplier`      | `1.5`               | Bonding-curve phase multiplier                        |
| `slashing_base_rate`            | `0.01`              | Progressive-slashing base rate                        |
| `slashing_escalation_factor`    | `1.5`               | Progressive-slashing escalation factor                |
| `slashing_max_penalty`          | `0.33`              | Progressive-slashing maximum penalty                  |
| `slashing_decay_halflife`       | `100,000` blocks    | Progressive-slashing decay half-life                  |
| `qdrw_enabled`                  | `false`             | QDRW tallying is disabled                             |
| `qdrw_xqore_multiplier`         | `2.0`               | xQORE weight in the QDRW formula                      |
| `qdrw_rep_min_multiplier`       | `0.5`               | Lower bound of the reputation multiplier              |
| `qdrw_rep_max_multiplier`       | `2.0`               | Upper bound of the reputation multiplier              |

---

## Burn Module (`x/burn`)

| Parameter              | Value                        | Description                                           |
| ---------------------- | ---------------------------- | ----------------------------------------------------- |
| `gas_burn_rate`        | `0.30`                       | Fraction of the fee collector burned                  |
| `contract_create_fee`  | `100,000,000 uqor` (100 QOR) | Flat burn fee for contract creation                   |
| `ai_service_burn_rate` | `0.50`                       | Fraction of AI service fees burned                    |
| `bridge_burn_rate`     | `1.00`                       | Fraction of bridge fees burned                        |
| `failed_tx_burn_rate`  | `0.10`                       | Fraction of failed-transaction gas burned (applied by the chain since v3.2.2) |
| `validator_share`      | `0.37`                       | Fraction distributed to validators                    |
| `treasury_share`       | `0.20`                       | Fraction sent to the treasury                         |
| `staker_share`         | `0.10`                       | Fraction distributed to stakers                       |
| `light_node_share`     | `0.03`                       | Fraction distributed to light nodes                   |
| `enabled`              | `true`                       | Module activation flag                                |

The fee split is **37 / 30 / 20 / 10 / 3** across validators, burn, treasury, stakers and light nodes; the shares must sum to `1.00`. A `milestone_burn_schedule` also exists. See [Tokenomics](/architecture/tokenomics).

---

## xQORE Module (`x/xqore`)

:::caution Not yet available on-chain
The xQORE module's accounting exists, but the lock and unlock transactions, queries and CLI commands are **not yet wired into the live networks**: no QOR can currently be locked, and no xQORE has been minted. The values below are the genesis configuration.
:::

| Parameter                 | Value                  | Description                                          |
| ------------------------- | ---------------------- | ---------------------------------------------------- |
| `governance_multiplier`   | `2.0`                  | Voting-power multiplier for xQORE holders            |
| `min_lock_amount`         | `1,000,000 uqor`       | Minimum amount to lock (1 QOR)                       |
| `penalty_burn_rate`       | `0.0`                  | Fraction of exit penalties burned (all are redistributed) |
| `rebase_interval`         | `100` blocks           | Blocks between PvP rebase events                     |
| `enabled`                 | `true`                 | Module activation flag                               |

Exit penalties: 50 % (lock shorter than 30 days), 35 % (30–90 days), 15 % (90–180 days), 0 % (over 180 days). Lock multipliers: 1.0 / 1.2 / 1.4 / 1.7 / 2.0 at 0 / 90 / 180 / 365 / 730 days.

---

## Inflation Module (`x/inflation`)

| Parameter              | Value                   | Description                                           |
| ---------------------- | ----------------------- | ----------------------------------------------------- |
| `emission_mode`        | `fixed`                 | `schedule` (legacy) or `fixed` (since v3.1.94)        |
| `fixed_epoch_emission` | `86,000,000,000 uqor` (86,000 QOR) | Minted per epoch in fixed mode (16,239 QOR before governance proposal 10, 19 October 2026) |
| `max_total_emission`   | `590,000,000,000,000 uqor` (590,000,000 QOR) | Hard cumulative ceiling (114,285,714 QOR before proposal 10) |
| `epoch_length`         | `43,200` blocks         | Blocks per epoch (about 37.7 hours at ≈3.1 s blocks)  |
| `schedule`             | 17.5 %, 11 %, 7 %, 7 %, 2 % | Legacy year-based rates, unused in fixed mode     |
| `enabled`              | `true`                  | Module activation flag                                |

The module mints this emission into the fee collector until the cap is reached. The first epoch at 86,000 QOR starts at block 3,672,000. On 23 October 2026 (epoch 86) 105,420,896.21 QOR had been minted and 484,579,103.79 QOR remained under the cap (`GET /qorechain/inflation/v1/epoch_info`). See [Tokenomics](/architecture/tokenomics#supply-and-emission).

---

## RL Consensus Module (`x/rlconsensus`)

The `x/rlconsensus` module implements **PRISM**, the reinforcement-learning optimization layer. On mainnet it is in observation mode: no policy weights are loaded, so it tunes nothing, and the four PRISM control messages are switched off by the circuit breaker (see [Circuit Breaker Status](#circuit-breaker)). On the testnet the agent runs in **shadow mode** with a small demonstration policy loaded: it observes every 10 blocks and records a proposed action without changing any value. The table gives the mainnet values; the testnet differs only in `agent_mode` (`0`, shadow) and serves them over REST (`GET /qorechain/rlconsensus/v1/params`, v3.2.6; mainnet answers 501).

| Parameter                        | Value          | Description                                                   |
| -------------------------------- | -------------- | ------------------------------------------------------------- |
| `enabled`                        | `true`         | Module activation flag                                        |
| `observation_interval`           | `10`           | Blocks between PRISM observation samples                      |
| `agent_mode`                     | `1` (conservative) | Agent mode: 0=shadow, 1=conservative, 2=autonomous, 3=paused |
| `max_change_conservative`        | `0.10`         | Maximum parameter change per action in conservative mode      |
| `max_change_autonomous`          | `0.25`         | Maximum parameter change per action in autonomous mode        |
| `circuit_breaker_window`         | `50`           | Circuit-breaker window                                        |
| `circuit_breaker_threshold`      | `0.50`         | Circuit-breaker threshold                                     |
| `reward_weight_throughput`       | `0.30`         | Reward weight for throughput                                  |
| `reward_weight_finality`         | `0.25`         | Reward weight for finality                                    |
| `reward_weight_decentralization` | `0.20`         | Reward weight for decentralization                            |
| `reward_weight_mev`              | `0.15`         | Reward weight for MEV                                         |
| `reward_weight_failed_txs`       | `0.10`         | Reward weight for failed transactions                         |
| `default_block_time_ms`          | `5000`         | Default block time in the observation baseline (not the live block time) |
| `default_base_gas_price`         | `100`          | Default base gas price in the observation baseline            |
| `default_validator_set_size`     | `100`          | Default validator-set size in the observation baseline        |

---

## Bridge Module (`x/bridge`)

:::caution Not live
All 37 chain configurations are in `pending` status, no bridge validators are registered, no bridge operation has been created, and no IBC channel is open on mainnet (the testnet has a single ICS-20 transfer channel (`channel-0`) to a test counterparty chain with chain ID `provider`, opened for IBC testing (checked 27 October 2026)). See [Bridge Architecture](/architecture/bridge-architecture).
:::

`GET /qorechain/bridge/v1/config`:

| Parameter                  | Value                       | Description                                       |
| -------------------------- | --------------------------- | ------------------------------------------------- |
| `min_validators`           | `10`                        | Validators required for the attestation set       |
| `attestation_threshold`    | `7`                         | Attestations required                             |
| `challenge_period_secs`    | `86400`                     | Challenge period (24 hours)                       |
| `large_transfer_threshold` | `100,000,000,000 uqor` (100,000 QOR) | Transfers above this wait for the challenge period |
| `enabled`                  | `true`                      | Module activation flag                            |

Per-chain settings (`min_confirmations`, `max_single_transfer`, `daily_limit`) live in each chain configuration, not in the module parameters.

---

## Multilayer Module (`x/multilayer`)

| Parameter                      | Value            | Description                                       |
| ------------------------------ | ---------------- | ------------------------------------------------- |
| `max_sidechains`               | `10` (testnet: `64`) | Maximum number of registered sidechains       |
| `max_paychains`                | `50`             | Maximum number of registered paychains            |
| `min_anchor_interval`          | `100`            | Minimum anchor interval (blocks)                  |
| `max_anchor_interval`          | `1000`           | Maximum anchor interval (blocks)                  |
| `default_challenge_period`     | `86400` s        | Default challenge period (1 day)                  |
| `min_sidechain_stake`          | `1,000,000,000`  | Minimum stake to register a sidechain (1,000 QOR) |
| `min_paychain_stake`           | `100,000,000`    | Minimum stake to register a paychain (100 QOR)    |
| `routing_enabled`              | `true`           | Cross-layer routing enabled                       |
| `routing_confidence_threshold` | `0.6`            | Confidence threshold for automatic routing        |
| `cross_layer_fee_bundling`     | `true`           | One fee payment can cover several layers          |

---

## Cross-VM Module (`x/crossvm`)

| Parameter             | Value   | Description                                    |
| --------------------- | ------- | ---------------------------------------------- |
| `max_message_size`    | `65536` | Maximum cross-VM message size in bytes (64 KB) |
| `max_queue_size`      | `1000`  | Maximum pending messages in the cross-VM queue |
| `queue_timeout_blocks`| `100`   | Blocks before a pending message is timed out   |
| `enabled`             | `true`  | Module activation flag                         |

`MsgCrossVMCall` is switched off on mainnet by the circuit breaker (enabled on the testnet). The testnet serves these values over REST (`GET /qorechain/crossvm/v1/params`); mainnet answers 501.

---

## SVM Module (`x/svm`)

Genesis values:

| Parameter               | Value        | Description                                  |
| ----------------------- | ------------ | -------------------------------------------- |
| `max_program_size`      | `10485760`   | Maximum program binary size in bytes (10 MB) |
| `max_account_data_size` | `10485760`   | Maximum account data size in bytes (10 MB)   |
| `compute_budget_max`    | `1400000`    | Maximum compute units per transaction (1.4M) |
| `lamports_per_byte`     | `3480`       | Rent cost per byte in lamports               |
| `rent_exemption_multi`  | `2.0`        | Years of rent required for exemption         |
| `enabled`               | `true`       | Module activation flag                       |
| `svm_slot_offset`       | `0`          | Slot offset                                  |
| `default_sig_scheme`    | `0`          | Default signature scheme                     |
| `max_cpi`               | `4`          | Maximum cross-program-invocation depth       |

The SVM transaction lane is disabled network-wide (see [Networks](/appendix/networks)).

---

## RDK Module (`x/rdk`)

`qorechaind query rdk config`:

| Parameter                   | Value                | Description                                   |
| --------------------------- | -------------------- | --------------------------------------------- |
| `max_rollups`               | `100` (testnet: `200`) | Maximum registered rollups                  |
| `min_stake_for_rollup`      | `10,000,000,000 uqor`| Minimum operator stake (10,000 QOR)           |
| `rollup_creation_burn_rate` | `0.01`               | Fraction of the creation stake burned (1%)    |
| `default_challenge_window`  | `604,800` s (testnet: `3,600` s) | Default challenge window (7 days; 1 hour on the testnet) |
| `max_da_blob_size`          | `2,097,152`          | Maximum DA blob size in bytes (2 MB)          |
| `blob_retention_blocks`     | `432,000`            | Blocks to retain DA blobs (about 16 days at ≈3.1 s blocks) |
| `max_batches_per_block`     | `10`                 | Maximum batches processed per block           |

No rollup has been created on either network yet.

---

## FairBlock Module (`x/fairblock`)

Genesis values (the module has no query service, so they cannot be re-read live):

| Parameter            | Value   | Description                                 |
| -------------------- | ------- | ------------------------------------------- |
| `enabled`            | `false` | FairBlock tIBE encryption is disabled       |
| `tibe_threshold`     | `5`     | Minimum decryption key shares required      |
| `decryption_delay`   | `3`     | Blocks after finalization before decryption |
| `max_encrypted_size` | `65536` | Maximum encrypted payload size in bytes     |

---

## Gas Abstraction Module (`x/gasabstraction`)

Genesis configuration (`enabled = true`, `native_denom = uqor`):

| Token Denom | Conversion Rate | Description            |
| ----------- | --------------- | ---------------------- |
| `uqor`      | `1.0`           | Native QOR token (1:1) |
| `ibc/USDC`  | `1.0`           | IBC-bridged USDC       |
| `ibc/ATOM`  | `10.0`          | IBC-bridged ATOM       |

The conversion rate is the rate used when converting a fee paid in that token.

:::note No accepted IBC fee token
No IBC channel is open on mainnet, so no `ibc/USDC` or `ibc/ATOM` can exist there; the testnet's single test channel carries a small test voucher balance but its accepted-token list is also `uqor` only. Fees are paid in `uqor`.
:::

---

## Light Node Module (`x/lightnode`)

| Parameter                | Value              | Description                                          |
| ------------------------ | ------------------ | ---------------------------------------------------- |
| `registration_fee`       | `1,000,000 uqor` (1 QOR) | Fee to register a light node                   |
| `heartbeat_interval`     | `1000` blocks      | Blocks between required heartbeats (about 52 minutes at ≈3.1 s blocks) |
| `min_delegated_stake`    | `1,000,000,000 uqor` (1,000 QOR) | Minimum stake delegated by the operator |
| `reward_share`           | `0.03`             | Share of the fee collector set aside for light nodes |
| `min_uptime_for_rewards` | `0.80`             | Minimum uptime fraction for reward eligibility       |
| `max_light_nodes`        | `10,000`           | Maximum registered light nodes                       |
| `heartbeat_grace_period` | `100` blocks       | Grace period for a late heartbeat                    |

Reward accounting is live. `GET /qorechain/lightnode/v1/reward_pool` reports the pool (`balance`, `reserved`, `outstanding`, `payable`, `distributable`) and the per-node reward bound. Since v3.2.3 the bound is `max_reward_per_month_per_node`, **2,000 QOR (`2000000000` uqor) per node per 30 days**, prorated by block time and scaled by the node's uptime; the older per-block value (`max_reward_per_block_per_node`, `1713` uqor) is still reported. On 27 October 2026 the mainnet pool held a reserve of about 13,380.9 QOR (`reserved`), of which a small amount (0.06 QOR) was outstanding and nothing was payable yet. Registration is open and licence-gated: on that date seven `lightnode_operator` licences had been granted on mainnet and one light node was registered on each network (`GET /qorechain/license/v1/holders/lightnode_operator`, `GET /qorechain/lightnode/v1/stats`). See [Light Node](/light-node/overview#reward-program-status) and [Tokenomics](/architecture/tokenomics#stranded-and-reserve).

---

## AMM Module (`x/amm`)

| Parameter               | Value                         | Description                         |
| ----------------------- | ----------------------------- | ----------------------------------- |
| `swap_fee_bps`          | `30`                          | Swap fee (0.30%)                    |
| `protocol_fee_bps`      | `10`                          | Protocol fee share (0.10%)          |
| `min_liquidity`         | `1000`                        | Minimum liquidity                   |
| `max_pools_per_creator` | `50`                          | Maximum pools per creator           |
| `lp_token_decimals`     | `6`                           | LP share display decimals (shares are ledger entries, not tokens) |
| `pool_creation_fee`     | `100,000,000 uqor` (100 QOR)  | Fee to create a pool                |
| `max_swap_impact_bps`   | `500`                         | Maximum price impact of a swap (5%) |
| `enabled`               | `true`                        | Module activation flag              |

No pools exist yet on mainnet or testnet, and `MsgPausePool` / `MsgResumePool` are switched off on mainnet.

---

## Smart Accounts (`x/abstractaccount`)

:::caution Switched off on mainnet
On mainnet `enabled` is `false` (the testnet has it `true`, checked 27 October 2026): registering an authenticator, executing through one and creating a smart account are all refused while it is off. Check `GET /qorechain/abstractaccount/v1/config` before building on these features.
:::

| Parameter             | Value    | Description                      |
| --------------------- | -------- | -------------------------------- |
| `enabled`             | `false` (testnet: `true`) | Module activation flag |
| `max_session_keys`    | `10`     | Maximum session keys per account |
| `max_spending_rules`  | `5`      | Maximum spending rules           |
| `default_session_ttl` | `86400` s| Default session-key lifetime     |

---

## Staking, Slashing, Governance, Fees and EVM {#core-modules}

Standard Cosmos SDK and EVM modules, all read live on mainnet on 27 October 2026 (unchanged from the earlier readings). The testnet matches except for the governance voting periods, the active EVM precompiles and the QoreChain Native instantiate permission (see [Differences between testnet and mainnet](#testnet-differences)).

| Module | Parameter | Value |
| --- | --- | --- |
| Staking | `unbonding_time` | 1,814,400 s (21 days) |
| | `max_validators` | 100 |
| | `max_entries` | 7 |
| | `historical_entries` | 10,000 |
| | `bond_denom` | `uqor` |
| | `min_commission_rate` | 0 |
| Slashing | `signed_blocks_window` | 10,000 blocks (about 8.7 hours at ≈3.1 s blocks) |
| | `min_signed_per_window` | 5 % (a validator that signs fewer than 5 % of the window is jailed) |
| | `downtime_jail_duration` | 600 s |
| | `slash_fraction_downtime` | 1 % |
| | `slash_fraction_double_sign` | 5 % |
| Governance | `min_deposit` | 10,000,000 uqor (10 QOR) |
| | `max_deposit_period` / `voting_period` | 172,800 s (2 days) each |
| | `quorum` / `threshold` / `veto_threshold` | 0.334 / 0.5 / 0.334 |
| | `expedited_voting_period` / `expedited_min_deposit` / `expedited_threshold` | 86,400 s / 50 QOR / 0.667 |
| | `burn_vote_veto` | `true` |
| Distribution | `community_tax` | 0.02 |
| Fee market | `min_gas_price` | 0.1 uqor per gas |
| | `base_fee_change_denominator` / `elasticity_multiplier` | 8 / 2 |
| | `no_base_fee` | `false` |
| EVM | `evm_denom` / `extended_denom` | `uqor` / `aqor` (18 decimals) |
| | contract create / call access | permissionless |
| | `active_static_precompiles` | empty on mainnet (no EVM precompile is active; the testnet has three active, see below) |
| | `history_serve_window` | 8,192 |
| ERC-20 | `enable_erc20` / `permissionless_registration` | `true` / `false` |
| QoreChain Native | `code_upload_access` / `instantiate_default_permission` | `Nobody` / `Nobody` |

---

## Circuit Breaker Status {#circuit-breaker}

The chain can switch individual message types off with the Cosmos SDK circuit breaker, controlled by the foundation operations account and governance. A disabled message type is rejected at the ante handler on every lane. The live list is at `GET /cosmos/circuit/v1/disable_list`.

**Mainnet (27 October 2026, 16 entries, unchanged since 14 October):** vesting-account creation (`MsgCreateVestingAccount`, `MsgCreatePermanentLockedAccount`, `MsgCreatePeriodicVestingAccount`); QoreChain Native `MsgStoreCode`, `MsgInstantiateContract`, `MsgInstantiateContract2`; AMM `MsgPausePool`, `MsgResumePool`; `crossvm.MsgCrossVMCall`; `multilayer.MsgUpdateLayerStatus`; `pqc.MsgDeprecateAlgorithm`, `pqc.MsgDisableAlgorithm`; and the four PRISM control messages (`MsgSetAgentMode`, `MsgUpdatePolicy`, `MsgUpdateRewardWeights`, `MsgResumeAgent`). The EVM lane (`MsgEthereumTx`) is **open**: it was switched off from 16 to 25 September and reopened by the v3.2.0 upgrade.

**Testnet (27 October 2026, 1 entry):** only the QoreChain Native `MsgStoreCode` (contract upload); instantiation is no longer switched off there.

Every other message type, including all standard bank, staking, governance, distribution, authz and `x/pqc` registration messages, is enabled. The list is governance-controlled and can change; always query it.

---

## Differences between testnet and mainnet {#testnet-differences}

Read live on 27 October 2026. Mainnet `qorechain-vladi` runs v3.2.4 (since height 3,742,566, 23 October 2026; governance proposal 14 would apply v3.2.5 at height 3,906,833 and was in its voting period at the time of writing). The testnet `qorechain-diana` runs **v3.2.6**: v3.2.4 reached it at height 8,337,253 (19 October 2026), v3.2.5 at height 8,890,800 (26 October) and v3.2.6 at height 8,970,638 (27 October). The testnet is a staging network that takes each release first and is tuned for testing, so the values below differ from mainnet. This section covers the parameter tables of this page; the v3.2.5 features are documented on the day mainnet applies that release, and this section is revised then. Every parameter not listed here is identical on both networks (the staking, slashing, distribution, fee-market, ERC-20, AMM, burn, light-node, bridge, gas-abstraction and time-locked staking values were compared one by one).

| Area | Mainnet | Testnet |
| ---- | ------- | ------- |
| Governance voting periods | `voting_period` 172,800 s (2 days); `expedited_voting_period` 86,400 s (1 day) | `voting_period` 14,400 s (4 hours); `expedited_voting_period` 3,600 s (1 hour). Deposits, quorum and thresholds are the same |
| `x/inflation` | `emission_mode` `fixed`; `fixed_epoch_emission` 86,000 QOR; `max_total_emission` 590,000,000 QOR; `target_apy_bps` `0` | `emission_mode` `target_apy`; `target_apy_bps` `1667`; `fixed_epoch_emission` 16,239 QOR; `max_total_emission` 3,950,390,341,362,112,750 uqor, already reached (`remaining_emission` `0` at `/qorechain/inflation/v1/epoch_info`, so the testnet mints nothing more) |
| EVM active static precompiles | none (`[]`) | three: the PRISM parameters precompile at `0x0000000000000000000000000000000000000C01` and the precompiles at `0x...0a01` and `0x...0a02` |
| PRISM agent (`x/rlconsensus`) | Observation mode, no policy loaded; control messages switched off | Shadow mode with a demonstration policy (set by testnet governance); `GET /qorechain/rlconsensus/v1/...` answers (mainnet answers 501) |
| Smart accounts (`x/abstractaccount`) | `enabled` `false` | `enabled` `true` |
| RDK (`x/rdk`) | `max_rollups` 100; `default_challenge_window` 604,800 s | `max_rollups` 200; `default_challenge_window` 3,600 s |
| Multilayer (`x/multilayer`) | `max_sidechains` 10 | `max_sidechains` 64 |
| QoreChain Native instantiate permission | `Nobody` | `Everybody` (code upload stays `Nobody` on both) |
| Circuit breaker | 16 entries (see above) | 1 entry: QoreChain Native `MsgStoreCode` |
| Parameter routes over REST | `x/pqc`, `x/crossvm` and `x/rlconsensus` parameters answer 501 | `GET /qorechain/pqc/v1/params`, `/qorechain/crossvm/v1/params` and `/qorechain/rlconsensus/v1/params` answer (v3.2.6) |
| Block time and validators | about 3.1 s; 8 bonded validators | about 1.3 s; 4 bonded validators |
| Test tokens | none | fUSD, fETH and fBTC (see [Faucet](/dashboard/faucet#fest-tokens)) |

Both networks carry the v3.2.4 additions: the optional time-locked staking module `x/stakingtier` (49 modules instead of 48; `GET /qorechain/stakingtier/v1/params`, minimum lock 10 QOR, early-unlock penalty 5 %), a thirteenth recorded burn source (`staking_tier_penalty`), extra light-node reward-pool reporting fields with a reward bound that starts at a node's own registration, the `possession_proven` flag on PQC accounts (proof of possession stays optional for account keys and is required for bridge validator keys), the RDK challenge window counted in block time, and the `protocol_features` and `auth_nonce` queries. See [Staking and Delegation](/user-guide/staking-and-delegation#time-locked-staking). The v3.2.6 additions to the testnet are summarised in [Version History](/appendix/version-history#testnet-v326).
