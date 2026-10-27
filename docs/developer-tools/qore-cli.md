---
slug: /developer-tools/qore-cli
title: QoreChain CLI (qore)
sidebar_label: QoreChain CLI
sidebar_position: 24
---

# QoreChain CLI (`@qorechain/qore-cli`, command `qore`)

`qore` reads QoreChain from the terminal. It is for developers, operators and scripts that want to look up a transaction, check whether its post-quantum signature verifies, read an account or the validator set, simulate a transaction, or prepare an unsigned transfer, without writing code. Every command runs one tool of the [QoreChain MCP server](/developer-tools/mcp), and `--json` prints exactly the JSON that the tool returns, so a script and an AI agent see the same data.

Nothing is ever signed or broadcast, and the CLI holds no keys. Version **0.1.0**, published on 27 October 2026, Apache-2.0, Node.js 20 or later.

## Innovations {#innovations}

- **JSON identical to the MCP tool output.** `qore <command> --json` prints the same object, with the same field names, that the matching MCP tool returns. Without `--json` the same object is printed as readable text. A script written against one works against the other.
- **Post-quantum status from the terminal.** `qore pq status <txhash>` reports whether the transaction carries exactly one hybrid layer and whether the ML-DSA-87 (FIPS 204) signature verifies against the key the signer registered on chain, for sign-bytes v1 and v2. `qore pq status <address>` reports the registered key, its type, proof of possession and the EVM authorization window.
- **A pipeline for a transfer that needs no key.** `prepare-transfer --json` writes an unsigned transfer and `simulate` accepts that file, so you can build, check and price a transfer from a shell script. The signing step stays in your wallet or in [QoreSign](/qoresign/overview).
- **Stable exit codes.** 0 is success, 1 is a tool error that carries a stable code such as `NOT_FOUND` or `INVALID_INPUT`, and 2 is a usage error, so a script can branch on the result.

## What it is used for {#use-cases}

1. **Checking that a transaction carried the hybrid signature.** Right after a broadcast, `qore pq status <hash>` reports the signature tier and whether the ML-DSA-87 layer verifies against the signer's registered key.
2. **Looking up chain state from a terminal.** `qore block`, `qore account <address>`, `qore validators` and `qore search <query>` answer a quick question without opening an explorer or writing code.
3. **Pricing and checking a transfer before you sign it.** `prepare-transfer` writes an unsigned transfer, `simulate` shows the gas, the balance changes and any decoded refusal, and `estimate-fee` gives the suggested fee. You sign in your own wallet or with [QoreSign](/qoresign/overview).
4. **Reading contracts from a script or a CI job.** `qore read-contract --to 0x... --function "balanceOf(address)" --arg 0x... --returns uint256 --json | jq` checks a token balance or a contract view and parses the result.
5. **Shell scripts and monitoring.** `--json` output plus stable exit codes (0, 1, 2) let a script branch on the result. The same JSON is what the [MCP server](/developer-tools/mcp) returns, so an AI client and a script see the same data.

## How it works {#how-it-works}

Every `qore` command runs one tool of the MCP server's shared core, in your process, against the public REST, RPC and EVM JSON-RPC endpoints of the network you choose. Responses are built field by field from the chain's answer, upstream error text is never printed, and a failure maps to one of seven stable error codes (`NOT_FOUND`, `INVALID_INPUT`, `UPSTREAM_UNAVAILABLE`, `NOT_AVAILABLE_ON_CHAIN`, `RATE_LIMITED`, `UNAUTHORIZED`, `INTERNAL_ERROR`). Each upstream request has a 10 second timeout (`--timeout` changes it), a 4 MiB response limit and no retries. Hybrid signature checks run locally with [QoreSign](/qoresign/overview). Nothing is signed or sent. Details of each tool are in the [MCP server page](/developer-tools/mcp#how-it-works).

## How to use {#how-to-use}

Run it without installing, or install it once:

```bash
npx -y @qorechain/qore-cli chain
npm install -g @qorechain/qore-cli
qore --version
```

The commands are read-only and default to testnet:

```bash
# the latest block, and the chain info
qore block
qore chain

# is this testnet transaction hybrid-signed, and does the ML-DSA-87 layer verify?
qore pq status F642F59F2A2FEDA2B3A61A3CF49F8B5F792D65985027997004FEBB22A6F42152

# an account on mainnet, as JSON
qore account qor1... --network mainnet --json

# the top bonded validators
qore validators --limit 3

# an unsigned transfer, then its simulation (nothing is signed or sent)
qore prepare-transfer --from qor1... --to qor1... --amount 1.5 --json > transfer.json
qore simulate transfer.json
qore estimate-fee --from qor1... --to qor1... --amount 1.5
```

Amounts are `1.5` or `1.5 QOR` (QOR, up to 6 decimals) or `1500000uqor`. Addresses can be `qor1...` or `0x...`.

### A script that checks an account and a transaction {#script}

The repository has a full script (`examples/cli/pq-check.sh`) that does this. The core of it:

```bash
net=testnet
qore() { npx -y @qorechain/qore-cli "$@" --network "$net" --json; }

qore account "$addr" | jq '{exists, balances: [.balances[] | {denom, amount, display}], pq_key_registered}'
qore pq status "$addr" | jq '.address_status | {registered, algorithm, key_type, possession_proven, evm_window: .evm_window.live}'
qore pq status "$tx" | jq '.transaction_status | {tier, has_exactly_one_pqc_layer, signer, verified: .verification.verified, reason: .verification.reason}'

# An unsigned transfer to yourself, then its fee (nothing is signed or sent).
qore prepare-transfer --from "$addr" --to "$addr" --amount 0.000001 > transfer.json
qore simulate transfer.json | jq '{ok, gas_used, suggested_gas_limit, refusal}'
```

An example of `qore block --network mainnet --json` (27 October 2026):

```json
{
  "network": "mainnet",
  "height": "3858155",
  "hash": "1DA8CA5049ACF8844A3B775E2E138B2B118EDC1FC8C1F3602369B0C18D0B90C2",
  "time": "2026-10-27T21:32:48.831948088Z",
  "chain_id": "qorechain-vladi",
  "proposer_address": "B1CDC8C45DA1FFF9BA5A01320F16FC7460E90B8F",
  "tx_count": 0,
  "tx_hashes": [],
  "tx_hashes_truncated": false,
  "explorer_url": "https://explore.qore.network/block/3858155"
}
```

### Commands {#commands}

| Command | MCP tool | What it does |
|---|---|---|
| `chain`, `features` | `get_chain_info` | chain IDs, latest block, minimum gas price, sign-bytes version, protocol feature switches, active EVM precompiles |
| `block [height]` | `get_block` | one block, the latest by default |
| `tx get <hash>` | `get_transaction` | a transaction by native or EVM hash: status, fee, messages, signers, signature tier |
| `account <address>` | `get_address_info` | balances, account state, staked amount, both address forms |
| `pq status <address\|txhash>` | `get_pq_status` | ML-DSA-87 key status for an address, or the hybrid layer check for a transaction |
| `validators [--status S] [--limit N]` | `get_validators` | validators by stake; status is `bonded` (default), `unbonding`, `unbonded` or `all`; limit up to 200 |
| `staking-tiers [--holder A]` | `get_staking_tiers` | staking tier parameters and pool, and one holder's locks (chain v3.2.4 and later) |
| `search <query>` | `search` | detects a height, hash, address or validator and reads it |
| `read-contract --to 0x.. (--data 0x.. \| --function "f(address)" --arg V) [--returns T]` | `read_contract` | an EVM `eth_call` only, with optional encoding and decoding |
| `simulate <txfile.json\|base64> [--no-pqc-placeholder]` | `simulate_tx` | gas, balance changes and a decoded refusal for an encoded transaction |
| `estimate-fee (<txfile.json\|base64> \| --from A --to B --amount X)` | `estimate_fee` | suggested gas limit and fee, including the ML-DSA-87 layer |
| `prepare-transfer --from A --to B --amount X [--memo M] [--gas-limit N]` | `prepare_transfer` | an unsigned transfer for your wallet to sign |

Global options: `--network testnet|mainnet` (default `testnet`), `--json`, `--timeout <ms>` (upstream timeout, default 10000), `--help` and `--version`. The tool schemas are in the [MCP tools reference](https://github.com/qorechain/qorechain-mcp/blob/main/docs/tools.md).

### What was run {#what-was-run}

On 27 October 2026 `@qorechain/qore-cli` 0.1.0 and `@qorechain/mcp` 0.1.0 were installed from npm into an empty project and these read-only commands were run against the public endpoints:

- `qore --version` printed `0.1.0`, and `qore --help` listed the commands above.
- `qore chain` (testnet) printed chain `qorechain-diana`, EVM chain ID 9800, minimum gas price 0.1 and sign-bytes `v2`; `qore chain --network mainnet` printed chain `qorechain-vladi`, EVM chain ID 9801 and sign-bytes `v2`.
- `qore block`, `qore validators --limit 3 --json`, `qore staking-tiers --json`, `qore search 8981000`, `qore account qor178nscfyp0cq2ac5x7un4u98xrj4ayp6pt0kw08` and `qore read-contract --to 0x...0a02 --function "x()"` returned their data.
- `qore pq status F642F59F...2152` printed tier `pqc`, `has_exactly_one_pqc_layer: true` and `verified: true` with sign-bytes `v2`.
- `qore prepare-transfer --from A --to A --amount 1.5 --json` wrote an unsigned transfer (gas limit 171698, fee 17170 uqor), `qore simulate` on that file returned `ok: true`, and `qore estimate-fee` returned a matching fee. The sender and recipient were the same address, so the tool added a warning, and nothing was signed or sent.
- `qore tx get zzz` printed `error [INVALID_INPUT]` and exited 1; `qore bogus` exited 2.

## How to access {#how-to-access}

- **Networks.** Testnet `qorechain-diana` (the default) and mainnet `qorechain-vladi` with `--network mainnet`.
- **Endpoints.** The CLI reads the public REST, RPC and EVM JSON-RPC endpoints: `https://api-testnet.qore.host`, `https://rpc-testnet.qore.host` and `https://evm-testnet.qore.host` on testnet, and `https://api.qore.host`, `https://rpc.qore.host` and `https://evm.qore.host` on mainnet.
- **Account and keys.** None. There is no sign-in, no API key and no configuration file; the hosted MCP endpoint's key does not apply to the CLI.
- **Prerequisites.** Node.js 20 or later and outbound HTTPS.
- **Cost.** Free. To send the transfer you prepared you pay the network fee (floor 0.1 uqor per gas) from your own wallet; the CLI does not do that step.

## Security notes {#security}

* **No signing code path.** The CLI holds no keys, signs nothing and broadcasts nothing; `prepare-transfer` returns an unsigned document.
* **Secrets are refused.** Input that looks like a recovery phrase (12 or more consecutive BIP-39 words) or a bare 32-byte private key is rejected with `INVALID_INPUT` before any request is made. Do not put one in a command line anyway: your shell history keeps it, and the error tells you to treat that secret as exposed.
* **Only public data leaves your machine:** addresses, hashes and encoded transactions that you pass in, sent to the public QoreChain endpoints.
* **Mainnet is explicit.** Calls go to testnet unless you pass `--network mainnet`, and a transfer prepared for mainnet carries a warning.
* **Memos are public and permanent.** Never put a secret in a `--memo`.
* Report vulnerabilities privately to security@qore.network, never in a public issue.

## Where it is published {#where-published}

| Registry | Package | Version | Install | Notes |
|---|---|---|---|---|
| npm | [`@qorechain/qore-cli`](https://www.npmjs.com/package/@qorechain/qore-cli) | 0.1.0 | `npm install -g @qorechain/qore-cli` | Bin `qore`. Node.js 20 or later |

Source: [github.com/qorechain/qorechain-mcp](https://github.com/qorechain/qorechain-mcp), folder `packages/cli` (public, Apache-2.0, checked 27 October 2026). There is no Python or Rust build of the CLI; the server itself is also on PyPI as [`qorechain-mcp`](/developer-tools/mcp#where-published).

## Limits and known issues {#limits}

- **Read only.** No command signs or broadcasts. `prepare-transfer` builds a native-lane `MsgSend` of uqor only; it does not prepare EVM, SVM, staking, governance or contract transactions. `simulate` and `estimate-fee` accept any encoded native-lane transaction.
- **No faucet and no token-holder listing.** Those two MCP tools have no CLI command. Testnet QOR comes from the [Faucet](/dashboard/faucet).
- **Testnet history is pruned.** An old testnet block or transaction returns `NOT_FOUND` with the lowest available height; mainnet served from height 1 when checked.
- **Gas figures differ by network.** Testnet simulation already includes the ML-DSA-87 verification cost; mainnet simulation does not, so the suggested gas limit carries a margin.
- **Output limits.** At most 100 transaction hashes per block, 50 messages per transaction, 100 balances per account, 200 validators per call. Each request has a 10 second default timeout, a 4 MiB response limit and no retries.
- **Secrets are refused.** Input that looks like a recovery phrase or a bare private key is rejected with `INVALID_INPUT`. Do not put one in a command line: shell history keeps it.
- **EVM post-quantum precompiles** `0x...0A01` and `0x...0A02` are active on testnet only.
- **First release.** 0.1.0: command names and options can change in later versions. Use `--json` and the exit codes for scripts, and pin the version.

## Related pages {#related}

* [QoreChain MCP server](/developer-tools/mcp): the same tools for AI clients, with a hosted endpoint.
* [QoreSign](/qoresign/overview): sign the transfer that `prepare-transfer` writes.
* [SDK CLI reference](/sdk/reference/cli): the SDK's own command line.
* [Faucet](/dashboard/faucet): testnet QOR.
* [Developer packages overview](/developer-tools/overview).
