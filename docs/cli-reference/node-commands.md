---
slug: /cli-reference/node-commands
title: Node Commands
sidebar_label: Node Commands
sidebar_position: 1
---

# Node Commands

Reference for `qorechaind` commands used to initialize, configure, and operate a QoreChain node.

:::note
QoreChain runs two networks: the **`qorechain-vladi`** mainnet (live since 7 June 2026; node release **v3.2.3**, applied at height 3,662,051 on 20 October 2026; mainnet runs v3.2.3 until height 3,742,566 and **v3.2.4** from that block, scheduled by governance proposal 13) and the **`qorechain-diana`** testnet (node release **v3.2.4**, applied at height 8,337,253 on 19 October 2026). Pass the appropriate `--chain-id` for the network you intend to join — the examples below target the testnet; use `--chain-id qorechain-vladi` for mainnet. The current release for each network is listed in `latest.json` under [download.qore.host](https://download.qore.host).

The commands on this page were checked against the v3.2.3 release binary. The v3.2.4 binary adds commands that a v3.2.3 binary does not have (for example `stakingtier`); they run on the testnet now and on mainnet from height 3,742,566, and where this manual mentions one it says so.
:::

---

## init

Initialize a new node with the given moniker.

```bash
qorechaind init <moniker> --chain-id qorechain-diana
```

| Flag          | Type   | Description                                                     |
| ------------- | ------ | --------------------------------------------------------------- |
| `--chain-id`  | string | Chain identifier (always pass it; a random one is created if left out) |
| `--home`      | string | Node home directory (default: `~/.qorechaind`)                  |
| `--overwrite` | bool   | Overwrite the existing `genesis.json`                           |
| `--recover`   | bool   | Provide a seed phrase to recover an existing key instead of creating one |

Creates the directory structure under `--home` with `config/`, `data/`, and an initial `genesis.json`. For a network node, replace that `genesis.json` with the network's genesis file before starting (see [Connecting to Mainnet](/getting-started/connecting-to-mainnet)).

`init` also writes the network's EVM chain id (`9801` for `qorechain-vladi`, `9800` for `qorechain-diana`) into the `evm-chain-id` setting of `app.toml`, so pass the right `--chain-id`.

---

## start

Start the node and begin syncing or producing blocks.

```bash
qorechaind start [flags]
```

| Flag                   | Type   | Description                                          |
| ---------------------- | ------ | ---------------------------------------------------- |
| `--home`               | string | Node home directory                                  |
| `--minimum-gas-prices` | string | Minimum gas price this node accepts. The network floor is `0.1uqor`; set at least that |
| `--pruning`            | string | Pruning strategy: `default`, `nothing`, `everything`, `custom` (with `--pruning-keep-recent` and `--pruning-interval`) |
| `--halt-height`        | uint   | Stop the node at this block height                   |
| `--halt-time`          | uint   | Stop the node at this Unix timestamp                 |
| `--log_level`          | string | Log verbosity: `info`, `debug`, `warn`, `error`      |
| `--trace`              | bool   | Enable full stack trace on errors                    |

A binary built from the public source tree (the community build) refuses to start on `qorechain-vladi` or `qorechain-diana`: it cannot verify post-quantum signatures and cannot replay the networks' blocks faithfully (node release v3.2.3 and later). Use the release binary from [download.qore.host](https://download.qore.host); see [Building from Source](/developer-guide/building-from-source).

---

## version

`qorechaind version` does **not** report the release number on the release binaries: it prints an empty line, and `version --long` adds no build details. Do not rely on it to tell releases apart. To confirm what you run:

- Compare the SHA-256 of the **downloaded archive** with `binary.sha256` in the network's [manifest](https://download.qore.host/mainnet/latest.json) before you extract it (and keep that archive, or its checksum, as the record of what you installed).
- Ask the chain which upgrades it has applied: `GET /cosmos/upgrade/v1beta1/applied_plan/<upgrade_name>` returns the height an upgrade was applied at, or `0` if it has not been applied.

```bash
# archive checksum, as published
curl -s https://download.qore.host/mainnet/latest.json | jq -r '.version, .binary.sha256'
# has v3.2.3 been applied on mainnet, and at which height?
curl -s https://api.qore.host/cosmos/upgrade/v1beta1/applied_plan/v3.2.3   # {"height":"3662051"}
```

---

## status

Query the running node for its current status, including sync state, latest block height, and consensus information.

```bash
qorechaind status
```

| Flag     | Type   | Description                                     |
| -------- | ------ | ----------------------------------------------- |
| `--node` | string | RPC endpoint (default: `tcp://localhost:26657`) |

Returns JSON with `node_info`, `sync_info`, and `validator_info` sections.

---

## client configuration

There is no `config` subcommand. Client defaults (`chain-id`, `keyring-backend`, `output`, `node`) are read from `<home>/config/client.toml`; edit that file, or pass the flag on each command (`--chain-id`, `--keyring-backend`, `--output`, `--node`).

---

## keys

Manage local keyring for signing transactions.

### Add a New Key

```bash
qorechaind keys add <name> [flags]
```

| Flag                   | Type   | Description                                     |
| ---------------------- | ------ | ----------------------------------------------- |
| `--keyring-backend`    | string | Backend: `os`, `file`, `kwallet`, `pass`, `test`, `memory` |
| `--key-type`           | string | Key algorithm: `secp256k1` (default) or `eth_secp256k1` |
| `--coin-type`          | uint32 | HD coin type (default `118`)                    |
| `--recover`            | bool   | Recover key from mnemonic                       |
| `--multisig`           | string | Comma-separated list of keys for multisig       |
| `--multisig-threshold` | uint   | Minimum signatures required                     |

### List All Keys

```bash
qorechaind keys list --keyring-backend <backend>
```

### Show Key Details

```bash
qorechaind keys show <name> [flags]
```

| Flag        | Type   | Description                         |
| ----------- | ------ | ----------------------------------- |
| `--bech`    | string | Output format: `acc`, `val`, `cons` |
| `--address` | bool   | Show address only                   |
| `--pubkey`  | bool   | Show public key only                |

### Delete a Key

```bash
qorechaind keys delete <name> --keyring-backend <backend>
```

### Export a Key (Armor-Encrypted)

```bash
qorechaind keys export <name>
```

### Import a Key

```bash
qorechaind keys import <name> <keyfile>
```

---

## genesis

Manage the genesis file.

### Add a Genesis Account

```bash
qorechaind genesis add-genesis-account <address> <coins> [flags]
```

| Flag                 | Type   | Description                       |
| -------------------- | ------ | --------------------------------- |
| `--vesting-amount`   | string | Vesting amount                    |
| `--vesting-start-time` | int  | Vesting start time (Unix timestamp) |
| `--vesting-end-time` | int    | Vesting end time (Unix timestamp) |

### Create a Genesis Transaction

```bash
qorechaind genesis gentx <key-name> <stake-amount> [flags]
```

| Flag                    | Type   | Description             |
| ----------------------- | ------ | ----------------------- |
| `--chain-id`            | string | Chain identifier        |
| `--moniker`             | string | Validator moniker       |
| `--commission-rate`     | string | Initial commission rate |
| `--commission-max-rate` | string | Maximum commission rate |

### Collect Genesis Transactions

```bash
qorechaind genesis collect-gentxs
```

Other `genesis` subcommands: `bulk-add-genesis-account` and `migrate`.

### Validate the Genesis File

```bash
qorechaind genesis validate
```

---

## Consensus Engine

These subcommands interact with the QoreChain Consensus Engine layer.

### Show Validator Key

```bash
qorechaind comet show-validator
```

Outputs the consensus public key in JSON format. Used to verify validator identity.

### Show Node ID

```bash
qorechaind comet show-node-id
```

Outputs the P2P node identifier (hex-encoded). Used for persistent peer configuration.

---

## export

Export the current chain state as a JSON genesis file. Useful for chain upgrades or snapshots.

```bash
qorechaind export [flags]
```

| Flag                | Type   | Description                               |
| ------------------- | ------ | ----------------------------------------- |
| `--for-zero-height` | bool   | Prepare export for restarting at height 0 |
| `--height`          | int    | Export state at a specific block height   |
| `--home`            | string | Node home directory                       |
| `--output-document` | string | Write the export to this file instead of STDOUT |
| `--modules-to-export` | strings | Comma-separated list of modules to export (default: all) |
| `--jail-allowed-addrs` | strings | Operator addresses of jailed validators to unjail |

---

## rollback

Roll back the chain state by one block. Useful for recovering from a consensus failure.

```bash
qorechaind rollback [flags]
```

| Flag     | Type   | Description                                        |
| -------- | ------ | -------------------------------------------------- |
| `--hard` | bool   | Remove the last block from the block store as well |
| `--home` | string | Node home directory                                |

This command rolls back both the application state and the consensus state. Use with caution, as it cannot be undone.
