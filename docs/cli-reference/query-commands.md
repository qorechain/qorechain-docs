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
Queries run against whichever node `--node` points to. Use a **`qorechain-vladi`** mainnet RPC endpoint for live data (for example `--node https://rpc.qore.host:443`), or a **`qorechain-diana`** testnet endpoint (`--node https://rpc-testnet.qore.host:443`) for testing. The default `tcp://localhost:26657` targets a node you run yourself. Mainnet runs node release v3.2.1 and the testnet v3.2.2; the testnet can serve a few extra routes that mainnet does not have yet, so a query that works there may return `Not Implemented` on mainnet.
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
```

- `algorithm` takes an algorithm name (`dilithium5`, `mlkem1024`) or numeric ID.
- `migration` takes an **algorithm ID** (for example `1`), not an address, and reports `No active migration` when none is running.
- `evm-window` shows whether the address has an open EVM-lane authorisation window and how many blocks, transactions and value remain (`found`, `live`, `remaining_blocks`, `remaining_txs`, `remaining_value`). REST: `GET /qorechain/pqc/v1/evm_window/{address}`.

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

`stranded_rewards` reports the staker share that was deposited into the distribution module without backing any claim, as recorded at the v3.2.0 upgrade (`reserved`, `released`, `snapshot_height`). It can be released only by a governance vote.

---

## mint and inflation

`qorechaind query mint params|inflation|annual-provisions` reads the standard mint module, whose rate is `0` on both networks; it does **not** report the protocol's emission schedule. There is no `query inflation` command.

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

`reward-pool` shows how the module's reward balance splits into `reserved`, `outstanding`, `payable` and `distributable`.

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

`config` shows the module parameters (minimum stake, creation burn rate, challenge window, DA limits). `suggest-profile <use_case>` does not query the chain; it only prints a pointer to a JSON-RPC method that the public endpoints do not serve, so choose a profile from [Preset Profiles](/rollups/preset-profiles).

---

## rlconsensus

```bash
qorechaind query rlconsensus agent-status
qorechaind query rlconsensus observation
qorechaind query rlconsensus reward
qorechaind query rlconsensus params
qorechaind query rlconsensus policy
```

---

## abstractaccount

The abstract-account module is currently switched off on both networks (`config.enabled` is `false`), so these queries return no accounts.

```bash
qorechaind query abstractaccount config
qorechaind query abstractaccount accounts
qorechaind query abstractaccount account <address>
qorechaind query abstractaccount permission-schema
```

`auth-keygen`, `auth-sign-cosmos <chain_id> <account> <to> <amount> <nonce>` and `auth-sign-evm <chain_id> <account> <to_0x> <value_wei> <data_hex> <nonce>` build authenticator signatures offline. The authenticator seed is never an argument: it is read from `--seed-file <file>` (or `-` for stdin), from the `QORE_AUTH_SEED` environment variable, or from a no-echo prompt, and `auth-keygen` writes it to a new `0600` file (`--out`) instead of printing it.

---

## gasabstraction

Mainnet does not serve gas-abstraction queries yet (`qorechaind query gasabstraction ...` prints its help text and the REST route returns `Not Implemented`). Fees are paid in `uqor` only; see [Gas Abstraction](/user-guide/gas-abstraction).

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

---

## evm, erc20, wasm

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

---

## Modules without a CLI

`xqore`, `babylon` and `fairblock` have no transaction or query commands. They are not usable from the CLI or any public API at this time.
