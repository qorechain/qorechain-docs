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
Set `--chain-id qorechain-vladi` to broadcast against the live mainnet, or `--chain-id qorechain-diana` for the testnet. Both networks run the v3.2 line: mainnet node release **v3.2.3** (applied at height 3,662,051 on 20 October 2026), testnet **v3.2.4** (applied at height 8,337,253 on 19 October 2026; not yet applied on mainnet; governance proposal 13 would apply it at height 3,742,566). Check `latest.json` under [download.qore.host](https://download.qore.host) for the current release. If `--chain-id` is omitted, the client uses the `chain-id` from your local client config.

The commands and flags on this page were checked against the v3.2.3 release binary. Anything that exists only on the v3.2.4 testnet is marked **testnet only**.
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

`hybrid_signature_mode` is `required` on both networks (`qorechaind query pqc hybrid-mode`). Every Cosmos-lane transaction must carry an ML-DSA-87 (Dilithium-5) signature next to the secp256k1 signature; a plain `tx bank send ... -y` is rejected (codespace `pqc`, code 20). The only exemptions, since mainnet v3.2.3, are:

- the **first** PQC key registration of an account that has no key yet (`register-key` or `register-key-v2`), so a new account can bootstrap;
- repairing an account record that holds no usable key, with `register-key-v2`;
- `tx slashing unjail` for an account that has no registered PQC key.

An account that already holds a PQC key must hybrid-sign everything, **including** `register-key-v2` and `migrate-key` (a classical-only attempt is refused with code 234). An account without a key cannot attach a hybrid signature either: it has nothing to verify against, so it registers first.

Every command on this page except the first registration (`pqc register-key` / `pqc register-key-v2` on a key-less account) is therefore run in two steps: build the transaction with `--generate-only`, then sign and broadcast it with `tx pqc cosign`. `pqc rotate-key` does its own cosigning and broadcast; `pqc gen-key` and `pqc recover-key` only create a key file locally:

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

`gen-key` and `recover-key` refuse to overwrite an existing key file of that name; `--force` replaces it and keeps the old file as `<name>.dilithium.bak-<unix-time>`.

### register-key

Register a PQC public key for your account (legacy command: the algorithm is Dilithium-5). A first registration is signed with the classical key only; this is the bootstrap exemption. An account that already has a key must hybrid-sign it (`--generate-only`, then `tx pqc cosign`).

```bash
qorechaind tx pqc register-key <pubkey_hex> <key_type> --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

`key_type` is `hybrid` (recommended) or `pqc_only`. `classical_only` is refused (code 230): it registers no post-quantum key, so the account could never sign again. The 2,592-byte public key makes registration more expensive than a transfer, which is why it needs the larger gas limit.

The chain also refuses a key that gives no post-quantum protection (code 230) and a key this account has used before (code 232). It refuses a registration whose classical key is not the signer's own (code 45).

### register-key-v2

Register a key with explicit algorithm selection, and optionally prove that you hold the key's secret.

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> <key_type> [--pqc-key <name>] \
  --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

`algorithm` is `dilithium5` (or `1`) or `mlkem1024` (or `2`); `key_type` is `hybrid` or `pqc_only`.

**Proof of possession (optional).** With `--pqc-key <name>` (a key made by `gen-key` or `recover-key`) the command attaches a proof of possession: the new key's own signature over `qorechain-pqc-pop-v1|<chain-id>|<algorithm id>|<address>|<public key hex>`. The chain verifies it when it is present and refuses the registration if it does not verify (code 231); a registration without it is still accepted. The proof names the chain, the algorithm, the account and the key, so it proves nothing for another account or network. It adds one 4,627-byte signature to the transaction, so keep the gas limit at `600000`. The proof travels in the message's `proof_of_possession` field. The TypeScript SDK 0.9.0 attaches one by itself through `ensurePqcRegistered` once the network has applied v3.2.3; earlier SDK releases and `@qorechain/wallet-adapter` do not, so a registration made through them carries no proof (still accepted).

```bash
qorechaind tx pqc gen-key mypqc                      # prints the public key hex
qorechaind tx pqc register-key-v2 dilithium5 <pubkey_hex> hybrid --pqc-key mypqc \
  --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

On the testnet (v3.2.4, **testnet only**) the account record also reports whether a proof was verified, as `possession_proven` (see [REST / gRPC Endpoints](/api-reference/rest-grpc-endpoints#pqc-module)); mainnet does not report it yet.

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

Both networks have applied the upgrade that moved hybrid verification to the v2 sign-bytes; the v1 form is refused. A transaction may carry only one hybrid signature extension (more than one is refused since v3.2.3).

### migrate-key

Migrate your account's PQC key from one algorithm to another. A migration must be active for your current algorithm (started by governance); both keys sign the migration bytes, and the transaction itself needs your hybrid signature (`--generate-only`, then `tx pqc cosign`). A key the account has used before is refused (code 232).

```bash
qorechaind tx pqc migrate-key <new_algorithm> <old_pubkey_hex> <new_pubkey_hex> <old_sig_hex> <new_sig_hex> --generate-only [flags] > m.json
qorechaind tx pqc cosign m.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
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

Since v3.2.3 a rotation refuses a new key that gives no post-quantum protection (code 230) and a key the account has used before (code 232); the account remembers the keys it has rotated away from, so a rotation cannot be replayed to return to an old key.

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

**Scoped windows (mainnet v3.2.3 and later).** The value bound counts native QOR only: a token transfer, an approval or any other contract call carries value zero and is not counted against it. Two optional flags narrow what the window admits:

| Flag                | Effect                                                                                                                     |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `--native-only`     | Admit plain QOR transfers only: no calldata, no contract creation, no recipient that carries code, no EIP-7702 authorisation |
| `--allowed-targets` | Admit only these recipients (comma-separated `0x` addresses); contract creation is refused                                  |

```bash
qorechaind tx pqc open-evm-window 7200 20 1000qor --native-only --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > w.json
```

A window opened without either flag admits what it always did. The scope is reported by the window query as `native_only` and `allowed_targets`.

### close-evm-window

Close your window immediately, for example when you suspect the classical key is compromised. It also revokes a pending EIP-7702 delegation consent.

```bash
qorechaind tx pqc close-evm-window --from mykey --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > c.json
qorechaind tx pqc cosign c.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

### authorize-evm-delegation and clear-evm-delegation

An EIP-7702 delegation of your account takes effect only with your own post-quantum consent (mainnet since v3.2.2). `authorize-evm-delegation` records that consent for one delegate address; it is single-use, expires after the given number of blocks and is revoked by `close-evm-window`. `clear-evm-delegation` removes a delegation that is already set. Both are hybrid-signed Cosmos-lane messages (`--generate-only`, then `tx pqc cosign`).

```bash
qorechaind tx pqc authorize-evm-delegation <delegate_0x_address> <blocks> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > d.json
qorechaind tx pqc clear-evm-delegation --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > d.json
```

The zero address as `delegate` consents to clearing the delegation. Check the state with `qorechaind query pqc evm-delegation-consent <address>`.

None of the PQC key messages (`register-key`, `register-key-v2`, `rotate-key`, `migrate-key`) can be sent on an account's behalf through `authz` (mainnet v3.2.3 and later).

---

## lightnode

```bash
qorechaind tx lightnode register <node_type> <version> [--capabilities <csv>] --from operator \
  --gas 300000 --fees 30000uqor --chain-id qorechain-vladi --generate-only > register.json
qorechaind tx pqc cosign register.json --from operator --pqc-key <name> --chain-id qorechain-vladi
```

`node_type` is `sx` or `ux`. Registration needs an active `lightnode_operator` licence granted by the network's licence authority; see [Light Node](/light-node/overview) for the programme's current status. Other commands: `tx lightnode heartbeat`, `tx lightnode claim-rewards`, `tx lightnode deregister`.

Since v3.2.3 the reward a node can accrue is bounded **per month** (`max_reward_per_month_per_node` in `GET /qorechain/lightnode/v1/reward_pool`, 2,000 QOR per 30 days), prorated by block time and uptime, so the bound no longer depends on how fast blocks are produced. A bound is a ceiling, not a promised amount. On the testnet (v3.2.4, **testnet only**) a node's bound starts at its own registration rather than at the previous settlement.

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

### register-validator / attest

Bridge-validator messages. `register-validator <pqc_pubkey_hex> <supported_chains_csv>` registers a validator for attestation duty and `attest <chain> <event_type> <operation_id> <tx_hash> <amount> <asset> [--pqc-signature <hex>] [--proof <hex>]` submits an attestation. No bridge validator is registered on either network. On the testnet (v3.2.4, **testnet only**) a bridge validator registration also needs a proof of possession and a key no other bridge validator uses.

### update-chain-config / set-verifier-bootstrap / update-circuit-breaker-limits

Administrative (`bridge_admin` or `qcb_bridge` licence; the circuit-breaker limits can also be set by governance).

```bash
qorechaind tx bridge update-chain-config <chain_id> [--status active|paused|pending] [--verifier <kind>] [--contract <addr>] [--confirmations <n>] [--architecture <a>] [--lock-event-sig <hex>] [flags]
qorechaind tx bridge set-verifier-bootstrap <kind> <chain_id> [flags]
qorechaind tx bridge update-circuit-breaker-limits <chain_id> <max_single_transfer> <daily_limit> [flags]
```

Limits are in base units and `0` means unlimited. Only a route whose status is exactly `active` moves value.

---

## ibc-transfer

```bash
qorechaind tx ibc-transfer transfer transfer <channel> <receiver> <amount> [flags]
```

The first `transfer` is the subcommand and the second is the source port. No IBC channels are open on either network at the time of writing (`query ibc channel channels`).

---

## amm

Native AMM messages. No pool exists on either network at the time of writing, so these commands have nothing to act on yet.

```bash
qorechaind tx amm create-pool <pool_type> <deposit_a> <deposit_b> [flags]     # pool_type: constant_product | stable_swap; deposits as coins, e.g. 1000000uqor
qorechaind tx amm add-liquidity <pool_id> <amount_a> <amount_b> <min_lp_out> [flags]
qorechaind tx amm remove-liquidity <pool_id> <lp_amount> <min_a> <min_b> [flags]
qorechaind tx amm swap-exact-in <pool_id> <token_in> <denom_out> <min_out> [flags]
qorechaind tx amm swap-exact-out <pool_id> <denom_in> <token_out> <max_in> [flags]
```

Since v3.2.2 a swap must name both of the pool's denominations, `max_swap_impact_bps` is enforced and the protocol fee is routed through the burn module.

---

## gasabstraction

```bash
qorechaind tx gasabstraction fund-float <amount> [flags]
```

Moves native tokens (for example `1000000uqor`) into the fee-conversion float, the QOR reserve the module uses to pay validators when a fee is paid in another accepted token. Governance decides which tokens are accepted. On both networks the configuration accepts native `uqor` only, so no conversion takes place; check it with `qorechaind query gasabstraction accepted-tokens`.

---

## crossvm

```bash
qorechaind tx crossvm call <evm|cosmwasm|svm> <target_contract> --payload <hex> [--funds <coins>] [--async] [flags]
```

`call` is switched off on mainnet by the circuit breaker (see [below](#disabled-messages)) and works on the testnet only where the target lane is available. A queued call (`--async`) that fails leaves no side effects behind, only its `Failed` record (since v3.2.3), and a call whose derived source lane equals its target lane is refused. See [Cross-VM Interoperability](/developer-guide/cross-vm-interoperability).

---

## stakingtier (testnet only) {#stakingtier}

:::note Testnet only
The staking-tiers module arrived with the **v3.2.4** release, applied on the `qorechain-diana` testnet. It is **not** on mainnet and a mainnet upgrade to it is only proposed so far (governance proposal 13, at height 3,742,566); do not build mainnet tooling on it until it is applied.
:::

Optional time-locked delegations: a delegator can lock part of an existing delegation for 3, 6 or 12 months and later claim the bonus the module credits for it. A lock is a record on top of the delegation: the delegated funds stay with the validator.

```bash
qorechaind tx stakingtier lock <validator_address> <amount_uqor> <months> [flags]    # months: 3, 6 or 12
qorechaind tx stakingtier unlock-early <lock_id> [flags]
qorechaind tx stakingtier claim [flags]
```

The lock is enforced by the staking message server, so it also covers undelegating through `authz`, a group or a contract. Ending a lock early forfeits its unpaid bonus and burns a penalty; the minimum lock amount and the other parameters are in `GET /qorechain/stakingtier/v1/params`. Like every Cosmos-lane transaction these need the hybrid cosign (`--generate-only`, then `tx pqc cosign`) and a generous gas limit (for example `--gas 900000 --fees 90000uqor`).

---

## rdk

```bash
qorechaind tx rdk create-rollup <rollup_id> <profile> <stake_amount> [--vm evm|cosmwasm|svm|custom] [flags]
qorechaind tx rdk submit-batch <rollup_id> <batch_index> <state_root_hex> [--prev-state-root <hex>] [--tx-count <n>] [--data-hash <hex>] [--withdrawals-root <hex>] [--validator-set-hash <hex>] [--anchor-signature <hex>] [flags]
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> --proof <hex> [flags]
qorechaind tx rdk pause-rollup <rollup_id> <reason> [flags]
qorechaind tx rdk resume-rollup <rollup_id> [flags]
qorechaind tx rdk stop-rollup <rollup_id> [flags]
qorechaind tx rdk execute-withdrawal <rollup_id> <batch_index> <withdrawal_index> <recipient> <denom> <amount> --proof <hex,hex,...> [flags]
```

`profile` is `defi`, `gaming`, `nft`, `enterprise` or `custom`; `stake_amount` is in uqor (the current minimum is in `query rdk config`). The profile's preset supplies settlement, sequencer, DA and gas model; only the VM can be overridden on the command line. There is no `finalize-batch` command.

`--anchor-signature` is the rollup creator's ML-DSA signature over the **v2 anchor sign bytes**; with it the batch is also anchored in the multilayer module. Print the exact bytes to sign with `qorechaind query rdk anchor-sign-bytes <layer_id> <batch_index> <state_root_hex> --tx-count <n> --validator-set-hash <hex>`; the values must match the `submit-batch` flags. Since v3.2.3 the module keeps a **per-rollup escrow ledger**: a withdrawal is paid only out of what that rollup's ledger holds, and it is checked for denomination, a positive amount, proof depth and sibling size; stopping a rollup refunds only what is left in its ledger, and a stopped rollup pays no further withdrawals. At the time of writing no rollup exists on either network.

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
| `tx crossvm call`                                         | Disabled on mainnet by the circuit breaker; enabled on the testnet                             |
| `tx vesting create-vesting-account`, `create-periodic-vesting-account`, `create-permanent-locked-account` | On the mainnet circuit-breaker list; since v3.2.3 a vesting account can in any case only be created for the signer itself |
| PQC `MsgDeprecateAlgorithm` / `MsgDisableAlgorithm`        | Governance-proposal messages (no CLI command), on the mainnet circuit-breaker list; since v3.2.3 governance also cannot remove the last active signature algorithm |
| `tx svm deploy-program`, `execute`, `create-account`      | The SVM transaction lane is disabled network-wide                                              |
| `tx abstractaccount create`, `register-authenticator`, `execute-cosmos`, `execute-evm` | The abstract-account module is switched off (`query abstractaccount config` shows `enabled: false`) |
| `tx rlconsensus *`, `tx amm pause-pool`/`resume-pool`      | Governance-authority messages; also on the mainnet circuit-breaker list                        |
| `tx license *`                                            | Authority-only (licences are granted by the network's licence authority; since v3.2.3 governance can replace that authority with `MsgUpdateAuthority`) |

The live list is `qorechaind query circuit disabled-list`.
