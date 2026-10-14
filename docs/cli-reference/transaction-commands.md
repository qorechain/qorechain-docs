---
slug: /cli-reference/transaction-commands
title: Transaction Commands
sidebar_label: Transaction Commands
sidebar_position: 2
---

# Transaction Commands

All transaction commands follow the pattern:

```bash
qorechaind tx <module> <command> [args] [flags]
```

:::note
Set `--chain-id qorechain-vladi` to broadcast against the live mainnet, or `--chain-id qorechain-diana` for the testnet. Both networks run the v3.2 line (mainnet node release **v3.2.1**, testnet **v3.2.2**; check `latest.json` under [download.qore.host](https://download.qore.host) for the current release). If `--chain-id` is omitted, the client uses the `chain-id` from your local client config.
:::

Common flags apply to every `tx` subcommand:

| Flag                | Type   | Description                                                    |
| ------------------- | ------ | -------------------------------------------------------------- |
| `--from`            | string | Name or address of the signing key                             |
| `--chain-id`        | string | Chain identifier (default: from client config)                 |
| `--fees`            | string | Transaction fee, e.g. `40000uqor`                              |
| `--gas-prices`      | string | Gas price instead of `--fees`, e.g. `0.1uqor`                  |
| `--gas`             | string | Gas limit, or `auto` to estimate (default `200000`)            |
| `--gas-adjustment`  | float  | Multiplier applied to the `auto` estimate (default `1`)        |
| `--keyring-backend` | string | `os`, `file`, `kwallet`, `pass`, `test` or `memory`            |
| `--node`            | string | RPC endpoint (default `tcp://localhost:26657`)                 |
| `--broadcast-mode`  | string | `sync` or `async`                                              |
| `--generate-only`   | bool   | Print the unsigned transaction instead of signing it           |
| `-y`                | bool   | Skip the confirmation prompt                                   |

---

## Fees and gas {#fees-and-gas}

The network fee floor is **0.1 uqor per unit of gas** (`query feemarket params` shows `min_gas_price`; the live base fee can rise above the floor under load, see `query feemarket base-fee`). A transaction is rejected unless `fee >= gas limit x gas price`, so `--fees 500uqor` only works for a gas limit of 5,000 or less and fails for any real transaction.

| Transaction                                   | Suggested `--gas` | Matching `--fees` |
| --------------------------------------------- | ----------------- | ----------------- |
| Hybrid-signed transfer, delegate, vote, claim | `400000`          | `40000uqor`       |
| PQC key registration                          | `600000`          | `60000uqor`       |
| `lightnode register`                          | `300000`          | `30000uqor`       |

A hybrid signature adds about 4.7 KB to a transaction, which is charged at 10 gas per byte, so the default `--gas 200000` is not always enough: hybrid-signed transfers on mainnet have used between roughly 160,000 and 240,000 gas. Always set `--gas` explicitly together with `--fees` (or `--gas-prices`).

---

## Hybrid signing is required on the Cosmos lane {#hybrid-signing}

`hybrid_signature_mode` is `required` on both networks (`qorechaind query pqc hybrid-mode`). Every Cosmos-lane transaction must carry an ML-DSA-87 (Dilithium-5) signature next to the secp256k1 signature; a plain `tx bank send ... -y` is rejected. The only exemptions are PQC key registration and migration (so a new account can register its first key) and `tx slashing unjail` for an account that has no registered PQC key.

Every command on this page except `pqc register-key`, `pqc register-key-v2` and `pqc migrate-key` is therefore run in two steps: build the transaction with `--generate-only`, then sign and broadcast it with `tx pqc cosign`:

```bash
qorechaind tx bank send mykey qor1recipient... 1000000uqor \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

The key name `mypqc` is a key created with `tx pqc gen-key` and registered on the account (see [pqc](#pqc)). Use the official release binary from [download.qore.host](https://download.qore.host) for this: a binary built from the public source tree cannot create or apply a Dilithium signature (`gen-key` and `cosign` report that they need the full build). [QoreX](/qorex/overview) and the SDKs perform the same signing for you.

---

## bank

### send

Transfer tokens from one account to another.

```bash
qorechaind tx bank send <from_key_or_address> <to_address> <amount> [flags]
```

Example: `qorechaind tx bank send mykey qor1recipient... 1000000uqor --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > tx.json`, then `tx pqc cosign` as shown above. 1 QOR = 1,000,000 uqor.

---

## staking

### create-validator

Create a validator from a JSON file (the flag-based form was removed). Mainnet also requires an active `validator_operator` licence and a registered PQC key; see [Running a Validator](/developer-guide/running-a-validator).

```bash
qorechaind tx staking create-validator validator.json \
  --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi \
  --generate-only > tx.json
```

`validator.json`:

```json
{
  "pubkey": {"@type": "/cosmos.crypto.ed25519.PubKey", "key": "<base64 key from: qorechaind comet show-validator>"},
  "amount": "100000000000uqor",
  "moniker": "my-validator",
  "identity": "",
  "website": "",
  "security": "",
  "details": "",
  "commission-rate": "0.10",
  "commission-max-rate": "0.20",
  "commission-max-change-rate": "0.01",
  "min-self-delegation": "1"
}
```

### edit-validator

Edit an existing validator's description or commission.

```bash
qorechaind tx staking edit-validator --new-moniker "new-name" --website "https://example.org" --from mykey [flags]
```

Flags: `--new-moniker`, `--website`, `--identity`, `--security-contact`, `--details`, `--commission-rate`, `--min-self-delegation`. Omitted fields are left unchanged.

### delegate

```bash
qorechaind tx staking delegate <validator_address> <amount> [flags]
```

### redelegate

```bash
qorechaind tx staking redelegate <src_validator> <dst_validator> <amount> [flags]
```

### unbond

```bash
qorechaind tx staking unbond <validator_address> <amount> [flags]
```

### cancel-unbond

Cancel an in-flight unbonding entry.

```bash
qorechaind tx staking cancel-unbond <validator_address> <amount> <creation_height> [flags]
```

---

## slashing

### unjail

Return a jailed validator to the active set after the jail period.

```bash
qorechaind tx slashing unjail --from mykey [flags]
```

---

## distribution

### withdraw-all-rewards

Withdraw all pending staking rewards.

```bash
qorechaind tx distribution withdraw-all-rewards [flags]
```

### withdraw-rewards

Withdraw rewards from one validator.

```bash
qorechaind tx distribution withdraw-rewards <validator_address> [flags]
```

| Flag           | Type | Description                                              |
| -------------- | ---- | -------------------------------------------------------- |
| `--commission` | bool | Also withdraw commission (validator operator addresses)  |

---

## gov

### submit-proposal

Submit a governance proposal from a JSON file with `messages`, `metadata`, `deposit`, `title`, `summary` and optionally `expedited`. Generate a skeleton with `qorechaind tx gov draft-proposal`.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> [flags]
```

### vote

```bash
qorechaind tx gov vote <proposal_id> <option> [flags]
```

Vote options: `yes`, `no`, `abstain`, `no_with_veto`. Use `tx gov weighted-vote <proposal_id> yes=0.6,no=0.4` to split a vote.

### deposit

```bash
qorechaind tx gov deposit <proposal_id> <amount> [flags]
```

---

## pqc {#pqc}

### gen-key

Generate a Dilithium-5 (ML-DSA-87) key and store it under `<home>/pqc/<name>.dilithium` (mode `0600`, **not encrypted**). It prints the public key in hex.

```bash
qorechaind tx pqc gen-key <name>
```

### register-key

Register a PQC public key for your account (legacy command: the algorithm is Dilithium-5). Signed with the classical key only; this is the bootstrap exemption.

```bash
qorechaind tx pqc register-key <pubkey_hex> <key_type> --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

`key_type` is `hybrid` (recommended), `pqc_only` or `classical_only`. The 2,592-byte public key makes registration more expensive than a transfer, which is why it needs the larger gas limit.

### register-key-v2

Register a key with explicit algorithm selection.

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> <key_type> --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

`algorithm` is `dilithium5` (or `1`) or `mlkem1024` (or `2`).

### cosign

Sign an unsigned transaction with the PQC key and the account's classical key, then broadcast it.

```bash
qorechaind tx pqc cosign <unsigned_tx_file> --from <key> --pqc-key <name> --chain-id <id>
```

| Flag           | Description                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------- |
| `--pqc-key`    | Name of the key created with `gen-key` or `recover-key`                                           |
| `--sign-bytes` | `auto` (default: asks the chain which sign-bytes form applies), `v1` or `v2`                      |
| `--generate-only` / `--offline` | Print the signed transaction as JSON instead of broadcasting it; submit later with `tx broadcast`; `--offline` also needs `--account-number`, `--sequence` and `--sign-bytes v1\|v2` |
| `--dry-run`    | Simulate and print the gas estimate                                                               |

Both networks have applied the upgrade that moved hybrid verification to the v2 sign-bytes; the v1 form is refused.

### migrate-key

Migrate your account's PQC key from one algorithm to another. A migration must be active for your current algorithm (started by governance); both keys sign the migration bytes.

```bash
qorechaind tx pqc migrate-key <new_algorithm> <old_pubkey_hex> <new_pubkey_hex> <old_sig_hex> <new_sig_hex> [flags]
```

### recover-key

Reconstruct the account's ML-DSA-87 key from its BIP-39 mnemonic (read from stdin) and store it locally. Uses `SHAKE-256("qorechain:pqc:v1|address|mnemonic")`.

```bash
echo "<mnemonic>" | qorechaind tx pqc recover-key <name> <address> [flags]
```

| Flag           | Type   | Description                                                                |
| -------------- | ------ | -------------------------------------------------------------------------- |
| `--derivation` | string | `adapter` (canonical, default) or `bridge` (legacy `SHAKE-256(mnemonic)`)  |

### rotate-key

Rotate the account's ML-DSA-87 key within the same algorithm. Reads the mnemonic from stdin, dual-signs with the old and new keys, cosigns with the old key and broadcasts.

```bash
echo "<mnemonic>" | qorechaind tx pqc rotate-key --from mykey --old-derivation bridge --new-derivation adapter \
  --gas 600000 --fees 60000uqor --chain-id qorechain-vladi
```

| Flag               | Type   | Description                                                                          |
| ------------------ | ------ | ------------------------------------------------------------------------------------ |
| `--old-derivation` | string | Derivation of the currently registered key: `bridge` (default) or `adapter`          |
| `--new-derivation` | string | Derivation of the new key: `adapter` (default) or `bridge`                           |
| `--new-random`     | bool   | Rotate to a fresh random key; requires `--new-key-out`                               |
| `--new-key-out`    | string | Save the new private key as `<home>/pqc/<name>.dilithium` before anything is sent    |
| `--sign-bytes`     | string | `auto` (default), `v1` or `v2`                                                       |

### open-evm-window

The EVM lane admits a transaction only from an account that holds a registered PQC key **and** has an open authorisation window. A window is opened with a Cosmos-lane message, so it carries the PQC signature that an Ethereum wallet cannot. Inside the window, ordinary MetaMask transactions work unchanged.

```bash
qorechaind tx pqc open-evm-window <blocks> <max-txs> <max-value> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > w.json
qorechaind tx pqc cosign w.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

| Argument    | Limit                | Meaning                                                                                       |
| ----------- | -------------------- | --------------------------------------------------------------------------------------------- |
| `blocks`    | 1 to 17,280          | How long the window stays open, counted from the block that opens it                          |
| `max-txs`   | 1 to 1,000           | How many EVM transactions it admits                                                           |
| `max-value` | positive             | Total admitted, counting transferred value **and** the maximum fee each transaction could pay; `uqor` or `qor`, e.g. `1000qor` |

Opening a window replaces any existing one. Check it with `qorechaind query pqc evm-window <address>`.

### close-evm-window

Close your window immediately, for example when you suspect the classical key is compromised.

```bash
qorechaind tx pqc close-evm-window --from mykey --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > c.json
qorechaind tx pqc cosign c.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

---

## lightnode

```bash
qorechaind tx lightnode register <node_type> <version> [--capabilities <csv>] --from operator \
  --gas 300000 --fees 30000uqor --chain-id qorechain-vladi --generate-only > register.json
qorechaind tx pqc cosign register.json --from operator --pqc-key <name> --chain-id qorechain-vladi
```

`node_type` is `sx` or `ux`. Registration needs an active `lightnode_operator` licence, and registration for the light-node reward program is **not open yet**. Other commands: `tx lightnode heartbeat`, `tx lightnode claim-rewards`, `tx lightnode deregister`. See [Light Node](/light-node/overview).

---

## bridge

The bridge is not in production: on both networks every configured chain is in `pending` status and no bridge validators are registered (`query bridge chains`, `query bridge validators`).

### withdraw

```bash
qorechaind tx bridge withdraw <destination_chain> <destination_address> <asset> <amount> [flags]
```

### deposit

Credit assets bridged in from a source chain. Carries validator signatures (`--validator-sigs`, `--pqc-commitment`); it is a bridge-operator message, not the way an end user starts a deposit.

```bash
qorechaind tx bridge deposit <source_chain> <source_tx_hash> <asset> <amount> [flags]
```

### update-chain-config / set-verifier-bootstrap

Administrative (`bridge_admin` or `qcb_bridge` licence).

```bash
qorechaind tx bridge update-chain-config <chain_id> [--status active|paused|pending] [--verifier <kind>] [--contract <addr>] [--confirmations <n>] [--architecture <a>] [--lock-event-sig <hex>] [flags]
qorechaind tx bridge set-verifier-bootstrap <kind> <chain_id> [flags]
```

---

## ibc-transfer

```bash
qorechaind tx ibc-transfer transfer transfer <channel> <receiver> <amount> [flags]
```

The first `transfer` is the subcommand and the second is the source port. No IBC channels are open on either network at the time of writing (`query ibc channel channels`).

---

## rdk

```bash
qorechaind tx rdk create-rollup <rollup_id> <profile> <stake_amount> [--vm evm|cosmwasm|svm|custom] [flags]
qorechaind tx rdk submit-batch <rollup_id> <batch_index> <state_root_hex> [flags]
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> --proof <hex> [flags]
qorechaind tx rdk pause-rollup <rollup_id> <reason> [flags]
qorechaind tx rdk resume-rollup <rollup_id> [flags]
qorechaind tx rdk stop-rollup <rollup_id> [flags]
qorechaind tx rdk execute-withdrawal <rollup_id> <batch_index> <withdrawal_index> <recipient> <denom> <amount> --proof <hex,hex,...> [flags]
```

`profile` is `defi`, `gaming`, `nft`, `enterprise` or `custom`; `stake_amount` is in uqor (the current minimum is in `query rdk config`). The profile's preset supplies settlement, sequencer, DA and gas model; only the VM can be overridden on the command line. There is no `finalize-batch` command.

---

## multilayer

```bash
qorechaind tx multilayer register-sidechain <layer_id> <description> [--block-time-ms 2000] [--domains defi] [--max-tx 1000] [--min-validators 1] [--settlement-interval 100] [--vm-types evm] [flags]
qorechaind tx multilayer register-paychain <layer_id> <description> [--max-tx 5000] [--settlement-interval 50] [--base-fee-multiplier 0.01] [flags]
qorechaind tx multilayer anchor-state <layer_id> <layer_height> <state_root_hex> <pqc_agg_sig_hex> [flags]
qorechaind tx multilayer route-transaction <payload_hex> [--preferred-layer <id>] [--max-latency-ms 10000] [--max-fee 1000000] [flags]
qorechaind tx multilayer challenge-anchor <layer_id> <anchor_height> <fraud_proof_hex> <reason> [flags]
qorechaind tx multilayer update-layer-status <layer_id> <new_status> <reason> [flags]
```

`new_status` is `proposed`, `active`, `suspended` or `decommissioned`. `update-layer-status` is disabled on mainnet by the circuit breaker (see below).

---

## Messages disabled or unavailable today {#disabled-messages}

Some commands exist in the binary but cannot succeed on the live networks:

| Command                                                   | Reason                                                                                         |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `tx wasm store`, `tx wasm instantiate`, `instantiate2`    | Upload and instantiate permission is `Nobody` on both networks, and the message types are also on the circuit-breaker list |
| `tx crossvm call`                                         | Disabled on mainnet by the circuit breaker                                                     |
| `tx svm deploy-program`, `execute`, `create-account`      | The SVM transaction lane is disabled network-wide                                              |
| `tx abstractaccount create`, `register-authenticator`, `execute-cosmos`, `execute-evm` | The abstract-account module is switched off (`query abstractaccount config` shows `enabled: false`) |
| `tx rlconsensus *`, `tx amm pause-pool`/`resume-pool`      | Governance-authority messages; also on the mainnet circuit-breaker list                        |
| `tx license *`                                            | Authority-only (licences are granted by the network's licence authority)                       |

The live list is `qorechaind query circuit disabled-list`.
