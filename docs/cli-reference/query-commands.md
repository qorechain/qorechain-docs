---
slug: /cli-reference/query-commands
title: Query Commands
sidebar_label: Query Commands
sidebar_position: 3
---

# Query Commands

All query commands follow the pattern:

```bash
qorechaind query <module> <command> [args] [flags]
```

:::note
Queries run against whichever node `--node` points to. Use a **`qorechain-vladi`** mainnet RPC endpoint for live data (for example `--node https://rpc.qore.host:443`), or a **`qorechain-diana`** testnet endpoint (`--node https://rpc-testnet.qore.host:443`) for testing. The default `tcp://localhost:26657` targets a node you run yourself. Mainnet runs node release v3.2.4 since 23 October 2026 (applied at height 3,742,566 by governance proposal 13), and mainnet governance proposal 14 would apply v3.2.5 at height 3,906,833; the testnet runs v3.2.6 (v3.2.4 since 19 October 2026, v3.2.5 since 26 October, v3.2.6 since 27 October). The v3.2.4 release adds a few routes and commands (marked **v3.2.4** below): they work on both networks, and a node still on an older release answers them with `Not Implemented`. The v3.2.6 release adds two commands (marked **v3.2.6**, testnet only until mainnet applies it). The commands on this page were checked against the v3.2.3 release binary, run against `https://rpc.qore.host:443`; the v3.2.4 routes were checked over REST on 23 October 2026 and the v3.2.6 commands against the v3.2.6 source.
:::

Common flags apply to every `query` subcommand:

| Flag       | Type   | Description                                     |
| ---------- | ------ | ----------------------------------------------- |
| `--node`   | string | RPC endpoint (default: `tcp://localhost:26657`) |
| `--output` | string | Output format: `json` or `text`                 |
| `--height` | int    | Query state at a specific block height          |

Not every module has a CLI query. Where a command is missing, use the REST endpoint (`https://api.qore.host/...`); see [REST API](/api-reference/rest-grpc-endpoints).

---

## bank

```bash
qorechaind query bank balances <address>
qorechaind query bank total-supply
qorechaind query bank total-supply-of uqor
qorechaind query bank spendable-balances <address>
```

(There is no `query bank total`.)

---

## staking

```bash
qorechaind query staking validator <validator_address>
qorechaind query staking validators
qorechaind query staking validators --status BOND_STATUS_BONDED
qorechaind query staking delegation <delegator_address> <validator_address>
qorechaind query staking delegations <delegator_address>
qorechaind query staking delegations-to <validator_address>
qorechaind query staking unbonding-delegation <delegator_address> <validator_address>
qorechaind query staking unbonding-delegations <delegator_address>
qorechaind query staking redelegation <delegator_address> <src_validator> <dst_validator>
qorechaind query staking params
qorechaind query staking pool
```

`--status` takes the full enum name: `BOND_STATUS_BONDED`, `BOND_STATUS_UNBONDING` or `BOND_STATUS_UNBONDED` (`--status bonded` is rejected).

---

## distribution

```bash
qorechaind query distribution rewards <delegator_address>
qorechaind query distribution commission <validator_address>
qorechaind query distribution validator-outstanding-rewards <validator_address>
qorechaind query distribution community-pool
qorechaind query distribution params
```

---

## gov

```bash
qorechaind query gov proposals
qorechaind query gov proposals --proposal-status voting-period
qorechaind query gov proposal <proposal_id>
qorechaind query gov votes <proposal_id>
qorechaind query gov vote <proposal_id> <voter_address>
qorechaind query gov tally <proposal_id>
qorechaind query gov params
```

`--proposal-status` accepts `deposit-period`, `voting-period`, `passed`, `rejected` or `failed`. Other filters: `--voter`, `--depositor`.

---

## tx

```bash
qorechaind query tx <txhash>
qorechaind query txs --query "message.sender='<address>'"
```

---

## pqc

```bash
qorechaind query pqc account <address>
qorechaind query pqc algorithms
qorechaind query pqc algorithm dilithium5
qorechaind query pqc stats
qorechaind query pqc params
qorechaind query pqc migration <algorithm_id>
qorechaind query pqc hybrid-mode
qorechaind query pqc evm-window <address>
qorechaind query pqc evm-delegation-consent <address>
```

- `algorithm` takes an algorithm name (`dilithium5`, `mlkem1024`) or numeric ID.
- `migration` takes an **algorithm ID** (for example `1`), not an address, and reports `No active migration` when none is running.
- `account` reports the registered key. Besides the key, `key_type` and `algorithm_name`, the record has `classical_key_source` (`stored`, `auth_account` or `none`: where the classical public key comes from). From v3.2.4 (mainnet since 23 October 2026, testnet since 19 October 2026) it also carries `possession_proven`, which is `true` when the key was registered with a verified proof of possession.
- `evm-window` shows whether the address has an open EVM-lane authorisation window and how many blocks, transactions and value remain (`found`, `live`, `remaining_blocks`, `remaining_txs`, `remaining_value`), plus the window's scope (`native_only`, `allowed_targets`; since mainnet v3.2.3). REST: `GET /qorechain/pqc/v1/evm_window/{address}`.
- `evm-delegation-consent` shows the address's EIP-7702 delegation consent (`found`, `live`, `delegate`, `granted_height`, `expiry_height`), its current delegation and its EVM nonce. REST: `GET /qorechain/pqc/v1/evm_delegation_consent/{address}`.
- `params` and `hybrid-mode` report `hybrid_signature_mode` (`2` = required on both networks) and `allow_classical_fallback` (`false`).

---

## burn

The burn module has no CLI query. Use REST:

```bash
curl -s https://api.qore.host/qorechain/burn/v1/params
curl -s https://api.qore.host/qorechain/burn/v1/stats
curl -s https://api.qore.host/qorechain/burn/v1/records
curl -s https://api.qore.host/qorechain/burn/v1/milestone
curl -s https://api.qore.host/qorechain/burn/v1/stranded_rewards
```

`stranded_rewards` reports the staker share that was deposited into the distribution module without backing any claim (`reserved`, `released`, `snapshot_height`). It can be released only by a governance vote. The reserve was first recorded at the v3.2.0 upgrade and recomputed at the v3.2.3 upgrade height, so read the live values rather than a figure quoted elsewhere.

`stats` splits the cumulative burn by source, including `failed_tx`, which has been non-zero since the v3.2.2 upgrade.

---

## mint and inflation

`qorechaind query mint params|inflation|annual-provisions` reads the standard mint module, whose rate is `0` on both networks; it does **not** report the protocol's emission schedule. There is no `query inflation` CLI command. The protocol's own emission settings and progress are served over REST since v3.2.2:

```bash
curl -s https://api.qore.host/qorechain/inflation/v1/params       # emission_mode, fixed_epoch_emission, max_total_emission, epoch_length
curl -s https://api.qore.host/qorechain/inflation/v1/epoch_info   # current_epoch, next_epoch_height, total_minted, remaining_emission
```

On mainnet these report `emission_mode: "fixed"`, a fixed emission of 86,000 QOR per epoch of 43,200 blocks and a cumulative cap of 590,000,000 QOR (governance proposal 10, passed 19 October 2026; the first epoch at the new amount starts at block 3,672,000). Amounts are in `uqor`. The testnet reports its own, different values: it switched to the further emission mode that v3.2.4 added (`target_apy`) through its own governance (proposal 14, passed 20 October 2026). A network only switches modes by its own governance vote, so mainnet keeps `fixed` until such a vote passes (checked 27 October 2026).

---

## ai

```bash
qorechaind query ai config
qorechaind query ai stats
```

---

## reputation and qca

```bash
qorechaind query reputation params
qorechaind query qca config
```

There are no per-validator reputation or pool-classification queries.

---

## lightnode

```bash
qorechaind query lightnode params
qorechaind query lightnode stats
qorechaind query lightnode light-nodes
qorechaind query lightnode light-node <operator_address>
qorechaind query lightnode rewards <operator_address>
qorechaind query lightnode reward-pool
```

`reward-pool` shows how the module's reward balance splits into `reserved`, `outstanding`, `payable` and `distributable`, and the per-node bounds: `max_reward_per_block_per_node` and, since v3.2.3, `max_reward_per_month_per_node` (2,000 QOR, prorated by block time and uptime). From v3.2.4 (mainnet since 23 October 2026, testnet since 19 October 2026) it also reports `monthly_cap_active`, `last_distribution_time` and `last_distribution_height`.

---

## license

```bash
qorechaind query license check <grantee_address> <feature_id>
qorechaind query license holders <feature_id>
qorechaind query license list <grantee_address>
```

`check` returns a `NotFound` error when the grantee holds no licence for the feature.

---

## bridge

```bash
qorechaind query bridge config
qorechaind query bridge chains
qorechaind query bridge chain <chain_id>
qorechaind query bridge validators
qorechaind query bridge operations
qorechaind query bridge operation <operation_id>
```

---

## crossvm

```bash
qorechaind query crossvm message <message_id>
qorechaind query crossvm pending
qorechaind query crossvm params
```

---

## svm

```bash
qorechaind query svm account <base58_address>
qorechaind query svm program <base58_address>
qorechaind query svm params
qorechaind query svm slot
```

---

## multilayer

```bash
qorechaind query multilayer layer <layer_id>
qorechaind query multilayer layers
qorechaind query multilayer routing-stats
qorechaind query multilayer params
```

---

## rdk

```bash
qorechaind query rdk config
qorechaind query rdk rollup <rollup_id>
qorechaind query rdk list-rollups
qorechaind query rdk batch <rollup_id>            # latest batch
qorechaind query rdk batch <rollup_id> --index 42 # a specific batch
```

```bash
qorechaind query rdk batches <rollup_id> [--start 0] [--limit 100]   # batches in index order
qorechaind query rdk anchor-sign-bytes <layer_id> <batch_index> <state_root_hex> --tx-count <n> --validator-set-hash <hex>
```

`config` shows the module parameters (minimum stake, creation burn rate, challenge window, DA limits). `anchor-sign-bytes` prints, in hex, the v2 anchor sign bytes that a rollup creator signs for `tx rdk submit-batch --anchor-signature`. The same queries are served over REST under `/qorechain/rdk/v1/...` since v3.2.2 (see [REST / gRPC Endpoints](/api-reference/rest-grpc-endpoints#rdk-module)). `suggest-profile <use_case>` does not query the chain; it only prints a pointer to a JSON-RPC method that the public endpoints do not serve, so choose a profile from [Preset Profiles](/rollups/preset-profiles).

---

## rlconsensus

```bash
qorechaind query rlconsensus agent-status
qorechaind query rlconsensus observation
qorechaind query rlconsensus reward
qorechaind query rlconsensus params
qorechaind query rlconsensus policy
qorechaind query rlconsensus applied-params   # v3.2.6 (testnet)
qorechaind query rlconsensus last-action      # v3.2.6 (testnet)
```

`agent-status` reports the agent's mode, epoch and step count; `policy` reports the stored policy's epoch and weight count (not the weights). **v3.2.6 (testnet only until mainnet applies that release):** `applied-params` prints the values the agent holds as applied (block time, gas-price floor, pool weights) and `last-action` the action it proposed at its last step, which is recorded in every mode, including shadow, where nothing is applied. All of these are also served over REST on the testnet (see [RL Consensus Module](/api-reference/rest-grpc-endpoints#rlconsensus-module)); against a mainnet node the two new commands answer `Not Implemented` until mainnet applies that release.

---

## abstractaccount

The abstract-account module is switched off on mainnet (`config.enabled` is `false`, so these queries return no accounts there) and switched on on the testnet by governance (`config.enabled` is `true`; checked 27 October 2026).

```bash
qorechaind query abstractaccount config
qorechaind query abstractaccount accounts
qorechaind query abstractaccount account <address>
qorechaind query abstractaccount permission-schema
```

`auth-keygen`, `auth-sign-cosmos <chain_id> <account> <to> <amount> <nonce>` and `auth-sign-evm <chain_id> <account> <to_0x> <value_wei> <data_hex> <nonce>` build authenticator signatures offline. The authenticator seed is never an argument: it is read from `--seed-file <file>` (or `-` for stdin), from the `QORE_AUTH_SEED` environment variable, or from a no-echo prompt, and `auth-keygen` writes it to a new `0600` file (`--out`) instead of printing it.

---

## gasabstraction

Gas-abstraction queries are served on both networks since v3.2.2:

```bash
qorechaind query gasabstraction config
qorechaind query gasabstraction accepted-tokens
qorechaind query gasabstraction conversion-rate <denom>   # what one unit of a fee token is worth in uqor, and whether it can pay fees
qorechaind query gasabstraction float                     # the conversion float's balances and this block's usage
```

The accepted-token list holds native `uqor` only on both networks, so fees are paid in `uqor` and no conversion takes place; governance decides which other tokens are accepted. REST: `/qorechain/gasabstraction/v1/config`, `/conversion_rate?denom=`, `/float`. See [Gas Abstraction](/user-guide/gas-abstraction).

---

## amm

```bash
qorechaind query amm params
qorechaind query amm pools
qorechaind query amm pool <pool_id>
qorechaind query amm pool-by-denoms <denom_a> <denom_b>
qorechaind query amm lp-balance <pool_id> <address>
qorechaind query amm quote-exact-in <pool_id> <denom_in> <amount_in>
qorechaind query amm quote-exact-out <pool_id> <denom_out> <amount_out>
```

No pool exists on either network at the time of writing. On the testnet the three Fest test tokens are available as the second denomination of a pool (see [Testnet test tokens](/api-reference/rest-grpc-endpoints#fest-tokens)).

---

## stakingtier (v3.2.4)

```bash
qorechaind query stakingtier params
qorechaind query stakingtier locks <holder_address>
qorechaind query stakingtier pool
```

The staking-tiers module is part of the **v3.2.4** release: it has run on the testnet since 19 October 2026 and on mainnet since 23 October 2026 (height 3,742,566, governance proposal 13). A node on an older release answers these queries with `Not Implemented`. REST: `/qorechain/stakingtier/v1/params`, `/locks/{holder}`, `/pool`. See [Transaction Commands](/cli-reference/transaction-commands#stakingtier).

---

## circuit, feemarket, upgrade

```bash
qorechaind query circuit disabled-list        # message types switched off network-wide
qorechaind query feemarket params
qorechaind query feemarket base-fee
qorechaind query upgrade plan
qorechaind query upgrade applied <upgrade_name>
qorechaind query upgrade module-versions
```

`query upgrade applied <name>` is the way to read when an upgrade took effect: on mainnet `v3.2.2` was applied at height 3,556,788, `v3.2.3` at height 3,662,051 and `v3.2.4` at height 3,742,566; on the testnet `v3.2.2` at 6,905,034, `v3.2.3` at 8,003,746, `v3.2.4` at 8,337,253, `v3.2.5` at 8,890,800 and `v3.2.6` at 8,970,638 (`0` means not applied; on mainnet `v3.2.5` is `0` at the time of writing, with governance proposal 14 in its voting period). The mainnet circuit-breaker list (`disabled-list`) currently holds the vesting-account creation messages, QoreChain Native store and instantiate, AMM pool pause and resume, cross-VM call, multilayer layer-status update, PQC algorithm deprecate and disable, and the PRISM consensus governance messages; the testnet's holds only the QoreChain Native `MsgStoreCode` message (checked 27 October 2026; instantiation was let through by testnet governance).

---

## evm, erc20, wasm

The `wasm` commands read QoreChain Native, QoreChain's name for its CosmWasm smart-contract runtime; the command and module names keep the `wasm` spelling.

```bash
qorechaind query evm params
qorechaind query evm balance-bank <0x_address> uqor
qorechaind query erc20 token-pairs
qorechaind query wasm params
qorechaind query wasm list-code
qorechaind query wasm list-contract-by-code <code_id>
qorechaind query wasm contract <contract_address>
qorechaind query wasm contract-state smart <contract_address> '<json_query>'
```

`query erc20 token-pairs` is empty on mainnet; on the testnet it lists the three Fest test tokens (fUSD, fETH, fBTC) and one IBC token. Their bank denoms are `erc20:` plus the EIP-55 contract address and are case-sensitive; see [Testnet Fest test tokens](/developer-guide/evm-development#fest-tokens). On the testnet, `query wasm params` shows `code_upload_access` `Nobody` and `instantiate_default_permission` `Everybody`; on mainnet both are `Nobody` (see [QoreChain Native Development](/developer-guide/cosmwasm-development)).

---

## Modules without a CLI

`xqore`, `babylon` and `fairblock` have no transaction or query commands. They are not usable from the CLI or any public API at this time.
