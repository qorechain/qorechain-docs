---
slug: /developer-guide/governance-proposals-contracts
title: "Governance Proposals for Contracts: Upload Native Code and Open Cross-VM Access (Testnet)"
sidebar_label: Contract Proposals
sidebar_position: 12
---

# Governance Proposals for Contracts: Upload Native Code and Open Cross-VM Access (Testnet)

On the QoreChain testnet `qorechain-diana`, nobody uploads a QoreChain Native (CosmWasm) contract with a plain transaction, and no EVM contract can call a Native contract through the bridge until governance has said so. Both go through a **governance proposal**: the proposal stores your compiled code, optionally creates the contract, and adds it to the cross-VM allowlist, **pinned to the exact code** you uploaded. This page shows a builder how to prepare, submit, watch and verify such a proposal, and then call the approved contract from Solidity.

This page was checked against the live testnet on **22 November 2026** (chain `qorechain-diana`, chain v3.2.9 since 20 November). The on-chain examples are real proposals: 40 (the `qday-receipts` contract, code 865), 23, 27 and 34 (stored code), 19 and 20 (instantiation rules), 32 (the allowlist). The `qorechaind` command lines were written from the existing CLI reference and the proposal JSON on chain; the binary itself was not run for this page, so run `qorechaind tx gov submit-proposal --help` once on your machine if a flag differs.

:::note Testnet only
These steps describe the testnet. Mainnet does not have the open cross-VM bridge, and code upload there is also governance only. Test QOR has no value; use test accounts only.
:::

## Why it goes through governance {#why}

* **Upload is closed to accounts.** `code_upload_access` is `Nobody` and `MsgStoreCode` sits on the circuit breaker list. A governance proposal opens the breaker, stores the code as the governance account, and closes it again inside the same proposal, so the door is never left open between votes.
* **Instantiation is open.** `instantiate_default_permission` is `Everybody` since proposal 19, so once governance has stored your code anybody (you included) can create contracts from it, unless the stored code carries a tighter permission.
* **The bridge reaches only approved contracts.** The `0x0901` bridge can call only the targets in `bridge_allowed_targets`. Each target is pinned to a code id and to the length of its code history, so the contract cannot be migrated to different code and keep its approval.
* **It is atomic.** The messages of a proposal run together. If one fails (for example a code the chain refuses), none of them applies, and the breaker is not left open.

## What you need {#needs}

| Item | How to get it |
| --- | --- |
| The `qorechaind` binary (Linux) | The release at [download.qore.host](https://download.qore.host). A binary from the public source tree cannot sign the hybrid signature the chain requires. |
| A testnet account with a registered post-quantum key | See [Hybrid signing](/cli-reference/transaction-commands#hybrid-signing). |
| Test QOR for the deposit and fees | The testnet faucet. A regular proposal needs 10 QOR, an expedited one 50 QOR (table below). |
| Docker, to build the contract the same way as everyone else | [Docker](https://docs.docker.com/get-docker/). |

## Step 1: build the contract and note its checksum {#build}

Build with the CosmWasm optimizer so anyone can rebuild your source and get the same bytes. The Workshop 3 contract was built with the arm64 image on Apple Silicon (an x86 machine uses the plain `optimizer` image; the two give different checksums, so say which one you used in the proposal summary):

```bash
cd my-contract
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/optimizer-arm64:0.16.1
cat artifacts/checksums.txt
```

You should see one line per contract with a 64-character hexadecimal checksum and the file name, for example `6ebfc32f...5c43c  qday_receipts.wasm`. That checksum is the **SHA-256 of the uncompressed wasm file**, and it is the `data_hash` the chain will show for your code. Copy it; it goes into the proposal summary so voters can check it.

Before you spend a deposit, check the code against the limits in [Gas and upload limits](/developer-guide/cosmwasm-development#gas-and-limits): at most 4,096 functions, at most 32 MiB compiled, no floating-point instructions.

## Step 2: encode the code for the proposal {#encode}

The proposal carries the wasm inside the JSON as base64. Compress it first (the chain accepts gzip, which is what proposal 40 used: its code starts with `H4sI`):

```bash
gzip -9 -c artifacts/my_contract.wasm | base64 | tr -d '\n' > code.b64
wc -c code.b64
```

You should see a size in bytes. The `qday-receipts` code is about 99,000 characters as base64 of gzip. Keep it in a file, because it is too long to paste into a command.

## Step 3: write the proposal {#write}

A proposal is a JSON file with `messages`, `metadata`, `deposit`, `title`, `summary` and `expedited`. The `authority` and the `sender` of every message below is the **governance module account**. Read it instead of copying it from this page:

```bash
curl -s https://api-testnet.qore.host/cosmos/auth/v1beta1/module_accounts/gov
```

You should see the account with `"name":"gov"`; its `address` starts with `qor1`. Call it `<GOV_ADDRESS>` below. On 22 November 2026 it was `qor10d07y265gmmuvt4z0w9aw880jnsr700jwfyxr3`.

### Proposal A: store the code and create the contract {#proposal-a}

This is the shape of proposal 40 without its allowlist message. The order matters: open the breaker, store, close the breaker, then instantiate.

```json
{
  "messages": [
    {
      "@type": "/cosmos.circuit.v1.MsgResetCircuitBreaker",
      "authority": "<GOV_ADDRESS>",
      "msg_type_urls": ["/cosmwasm.wasm.v1.MsgStoreCode"]
    },
    {
      "@type": "/cosmwasm.wasm.v1.MsgStoreCode",
      "sender": "<GOV_ADDRESS>",
      "wasm_byte_code": "<CONTENTS OF code.b64>",
      "instantiate_permission": { "permission": "Everybody", "addresses": [] }
    },
    {
      "@type": "/cosmos.circuit.v1.MsgTripCircuitBreaker",
      "authority": "<GOV_ADDRESS>",
      "msg_type_urls": ["/cosmwasm.wasm.v1.MsgStoreCode"]
    },
    {
      "@type": "/cosmwasm.wasm.v1.MsgInstantiateContract2",
      "sender": "<GOV_ADDRESS>",
      "admin": "",
      "code_id": "<NEXT_CODE_ID>",
      "label": "my-contract-v1",
      "msg": {},
      "funds": [],
      "salt": "<BASE64_SALT>",
      "fix_msg": false
    }
  ],
  "metadata": "",
  "deposit": "10000000uqor",
  "title": "Testnet: store my-contract and create one instance",
  "summary": "Stores my-contract, built with cosmwasm/optimizer-arm64:0.16.1 from <SOURCE URL>, sha256 <YOUR CHECKSUM>. No funds, no admin. The MsgStoreCode breaker is reset and tripped again inside this proposal; code upload by accounts stays closed.",
  "expedited": false
}
```

How to fill the placeholders:

| Placeholder | How to get it |
| --- | --- |
| `<NEXT_CODE_ID>` | The last code id plus one. Read the last one with `curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/code?pagination.reverse=true&pagination.limit=1"`. On 22 November 2026 the last was 865, so the next was 866. If someone else's proposal stores code first, yours gets a later id and the instantiate message fails, which undoes the whole proposal (nothing is lost but the wait). |
| `<BASE64_SALT>` | Any short text, base64 encoded: `printf 'my-contract-v1' \| base64`. It makes the contract address predictable. Proposal 40 used the salt `qday-receipts-w3`. |
| `msg` | The JSON your contract's `instantiate` expects. `{}` for a contract with no fields. |
| `admin` | An empty string means no admin, so nobody can migrate the contract. Prefer that for a contract the bridge will call (see [Pins](#pins)). |
| `instantiate_permission` | `Everybody`, or `{ "permission": "AnyOfAddresses", "addresses": ["qor1..."] }` to restrict who may instantiate (proposal 34 did this for a test contract). |

You do not have to instantiate inside the proposal. Drop the last message to store the code only, and instantiate later with an ordinary transaction (`tx wasm instantiate`, see [Contract lifecycle](/developer-guide/cosmwasm-development)). Proposals 23 and 27 stored code this way.

### Proposal B: put the contract on the cross-VM allowlist {#proposal-b}

After proposal A has passed, find the contract address and read the live cross-VM parameters:

```bash
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/code/<CODE_ID>/contracts"
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/contract/<CONTRACT_ADDRESS>/history"
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params
```

You should see your `qor1...` contract address, a history with **one** entry (`INIT`, your code id) and the parameter set. `MsgUpdateParams` for the cross-VM module **replaces the whole parameter set**, so copy every field from the live answer and change only two things: add your target to `bridge_allowed_targets` and add its pin to `bridge_target_pins`.

```json
{
  "messages": [
    {
      "@type": "/qorechain.crossvm.v1.MsgUpdateParams",
      "authority": "<GOV_ADDRESS>",
      "max_message_size": "65536",
      "max_queue_size": 1000,
      "queue_timeout_blocks": "100",
      "enabled": true,
      "bridge_allowed_targets": [
        "<ALL EXISTING ENTRIES, UNCHANGED>",
        "cosmwasm:<CONTRACT_ADDRESS>"
      ],
      "bridge_target_pins": [
        "<ALL EXISTING PINS, UNCHANGED>",
        { "target": "cosmwasm:<CONTRACT_ADDRESS>", "code_id": "<CODE_ID>", "history_len": "1" }
      ],
      "max_pending_per_sender": 100,
      "max_cosmos_tx_gas": "50000000",
      "record_retention_blocks": "100000",
      "max_block_wasm_gas": "3000000",
      "max_tx_wasm_share_bps": 5000,
      "max_block_level_wasm_gas": "10000000",
      "queue_wasm_reserve_bps": 2500,
      "wasm_congestion_max_factor": 20,
      "wasm_congestion_target_bps": 5000,
      "max_block_upload_bps": 5000,
      "max_queue_timeouts_per_block": 100
    }
  ],
  "metadata": "",
  "deposit": "10000000uqor",
  "title": "Testnet: allow the bridge to call my-contract",
  "summary": "Adds cosmwasm:<CONTRACT_ADDRESS> (code <CODE_ID>, no admin) to the bridge allowlist with a pin to that code. The existing targets, their pins and every other cross-VM parameter are unchanged.",
  "expedited": false
}
```

The numbers above are the values read on 22 November 2026; use the ones you read live, not these. Proposal 40 left out `wasm_congestion_factor_micro`, a field the live answer also shows; follow the live answer and the template of proposal 40 and compare the result with the table in [Cross-VM reference](/developer-guide/cross-vm-reference#params) after the vote.

### Pins: what `code_id` and `history_len` mean {#pins}

| Field | Meaning |
| --- | --- |
| `target` | `cosmwasm:` followed by the contract address, written exactly as in `bridge_allowed_targets`. |
| `code_id` | The code the contract must run for the bridge to call it. |
| `history_len` | How many entries the contract's code history has when you pin it. A fresh instance has 1. A contract migrated once has 2 (the testnet allowlist has one such contract). Any later migration changes the length, so the pin no longer matches and the bridge refuses the call. |

An allowlisted contract that has an admin other than governance must be pinned, because that admin could migrate it. The simplest safe design is what proposal 40 did: no admin, and a pin.

### Doing both in one proposal {#one-proposal}

Proposal 40 did it all in one proposal: it stored the code, instantiated it with a salt, and pinned the address that salt produces. That needs the next code id and the future contract address in advance, so it is easy to get wrong. Two proposals cost one extra vote and a few hours; prefer them unless you have already derived the address.

## Step 4: deposit, voting period and thresholds {#params}

Read the live rules before you submit:

```bash
curl -s https://api-testnet.qore.host/cosmos/gov/v1/params/voting
```

| Rule | Regular proposal | Expedited proposal (`"expedited": true`) |
| --- | --- | --- |
| Minimum deposit | 10 QOR (`10000000uqor`) | 50 QOR (`50000000uqor`) |
| Deposit period (to reach the minimum) | 172,800 s (2 days) | 172,800 s (2 days) |
| Voting period | 14,400 s (4 hours) | 3,600 s (1 hour) |
| Quorum | 33.4% of bonded stake | 33.4% of bonded stake |
| Yes threshold | 50% of votes cast | 66.7% of votes cast |
| Veto threshold | 33.4% | 33.4% |
| Minimum initial deposit | none | none |

Read on 22 November 2026. Also from the same answer: a vote of "no with veto" above the threshold burns the deposit (`burn_vote_veto` is `true`), a proposal that fails quorum does not burn it, and an expedited proposal that fails its tally continues as a regular one with the votes already cast. Every proposal to date that the testnet team submitted for contracts was expedited; a builder proposal should normally stay regular (the 10 QOR deposit and four-hour vote are easier to plan around).

## Step 5: submit {#submit}

Every transaction on the Cosmos lane must carry the hybrid signature, so you build the transaction first and then sign it with your post-quantum key. The proposal is big (the code is inside it), so give it room in gas: the fee floor is 0.1 uqor per unit of gas, and a byte of transaction costs 10 gas.

```bash
qorechaind tx gov submit-proposal proposal-a.json \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas <GAS> --fees <FEES>uqor \
  --generate-only > submit.json

qorechaind tx pqc cosign submit.json --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

Set `--gas` and `--fees` from a dry run: run `tx pqc cosign` with `--dry-run` first (it prints a gas estimate and sends nothing), then use the estimate plus 30% as `<GAS>`, and a fee of at least `<GAS>` times 0.1 uqor as `<FEES>`. A simple transfer needs roughly 300,000 to 400,000 gas, and a deploy or a proposal that carries code needs much more.

Measured on the testnet: a proposal with about 99 KB of compressed code (102.6 KB of JSON) used 14,961,429 gas. Plan about 150 gas per byte of proposal JSON, so for a 100 KB proposal use at least `--gas 20000000 --fees 2000000uqor`. A vote used about 153,400 gas: use `--gas 300000 --fees 30000uqor`. The code is stored when the vote ends and costs the submitter nothing extra.

`--generate-only` writes the unsigned transaction. `tx pqc cosign` adds both signatures and broadcasts it; background in [Hybrid signing](/cli-reference/transaction-commands#hybrid-signing) and the [gov commands](/cli-reference/transaction-commands#submit-proposal). You should see a transaction hash and code 0. If you see an out of gas error, raise `--gas` and the matching `--fees` (the fee must be at least gas times 0.1 uqor).

Find your proposal id, which is also the number in the transaction events:

```bash
curl -s "https://api-testnet.qore.host/cosmos/gov/v1/proposals?pagination.reverse=true&pagination.limit=1"
```

You should see your title and a status of `PROPOSAL_STATUS_VOTING_PERIOD` (the deposit you attached reached the minimum). With a smaller deposit the status is `PROPOSAL_STATUS_DEPOSIT_PERIOD`; anyone can top it up:

```bash
qorechaind tx gov deposit <PROPOSAL_ID> 5000000uqor --from mykey \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > deposit.json
qorechaind tx pqc cosign deposit.json --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

## Step 6: vote {#vote}

Any staker may vote with the stake they hold. A single builder wallet will not reach the 33.4% quorum, so tell the testnet validators and delegators about your proposal (the proposal summary is what they read) and ask them to vote. A vote is a hybrid-signed transaction like any other:

```bash
qorechaind tx gov vote <PROPOSAL_ID> yes --from mykey \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > vote.json
qorechaind tx pqc cosign vote.json --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

The options are `yes`, `no`, `abstain` and `no_with_veto` (see [Governance](/user-guide/governance)). Watch the tally and the clock:

```bash
curl -s https://api-testnet.qore.host/cosmos/gov/v1/proposals/<PROPOSAL_ID>/tally
curl -s https://api-testnet.qore.host/cosmos/gov/v1/proposals/<PROPOSAL_ID>
```

When voting ends the status becomes `PROPOSAL_STATUS_PASSED` (the messages have run), `PROPOSAL_STATUS_REJECTED`, or `PROPOSAL_STATUS_FAILED`. **Failed** means the vote passed but a message could not run, and then none of the messages applied; `failed_reason` says why. Proposal 40, for example, showed `PASSED`, one hour after it was submitted.

## Step 7: verify the code on chain {#verify}

Compare the code the chain holds with the checksum you built. The chain reports `data_hash` in capital letters; `sha256sum` prints lowercase.

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/code/<CODE_ID> | jq -r '.code_info.data_hash'
sha256sum artifacts/my_contract.wasm
```

You should see the same 64 characters in both lines. As a stronger check, hash the bytes the chain actually holds:

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/code/<CODE_ID> | jq -r '.data' | base64 -d | sha256sum
```

This printed `6ebfc32fb9a9c8a412fdb071fb2c317b780ba05f637b8a4d274001c95fb5c43c` for code 865, the same checksum as the optimizer build of the Workshop 3 source. Then check the contract and, after proposal B, the allowlist:

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/contract/<CONTRACT_ADDRESS>
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params | jq '{bridge_allowed_targets, bridge_target_pins}'
```

You should see `code_id` as yours and `admin` empty in the first answer, and your `cosmwasm:qor1...` target with its pin (`code_id`, `history_len` of `"1"`) in the second. On 22 November 2026 the list held four targets; the fourth was `qday-receipts` at `qor1xjayq5ev55tkzpml9klxwyshr7gdrha0nurha9jhm0f0gdckksgs3gltw8`, pinned to code 865.

## Step 8: call it from an EVM contract {#call}

The EVM calls the bridge at `0x0000000000000000000000000000000000000901` with `executeCrossVMCall(uint8,string,bytes)`: target VM `1` (Native), your contract address as a string, and the JSON message as bytes. The Native side sees the calling EVM contract's own `qor1...` account as the sender, and a revert on either side undoes both.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CallMyContract {
    address constant CROSSVM = 0x0000000000000000000000000000000000000901;

    function record(string calldata contractAddr, bytes calldata executeMsg) external {
        (bool ok, ) = CROSSVM.call(
            abi.encodeWithSignature(
                "executeCrossVMCall(uint8,string,bytes)", 1, contractAddr, executeMsg
            )
        );
        require(ok, "cross-VM call failed");
    }
}
```

Two conditions apply, both explained in [Cross-VM reference](/developer-guide/cross-vm-reference#evm-to-wasm): the target must be on the allowlist (and still run its pinned code), and the account that sends the transaction needs an open [EVM authorisation window](/developer-guide/evm-window-reference) whose `allowed_targets` lists `0x...0901`. For a complete, tested example with a Solidity shop and the `qday-receipts` contract, follow [Workshop 3](/build-before-qday/workshop-3#part-2).

## Troubleshooting {#troubleshooting}

| What you see | Likely cause and fix |
| --- | --- |
| `tx wasm store` fails or never lands | Expected. Accounts cannot upload on the testnet; the circuit breaker and `code_upload_access` both block it. Use a proposal. |
| The proposal status is `PROPOSAL_STATUS_FAILED` | The vote passed but a message failed, so nothing applied. Read `failed_reason` in `GET /cosmos/gov/v1/proposals/<id>`. A wrong `code_id` in the instantiate message is the common cause. |
| `PROPOSAL_STATUS_REJECTED` | Not enough yes votes or no quorum. Submit again with a clearer summary, or ask validators to vote. |
| Status stays `PROPOSAL_STATUS_DEPOSIT_PERIOD` | The total deposit is below the minimum (10 QOR regular, 50 QOR expedited). Add more with `tx gov deposit` within 2 days. |
| Submit fails with code 20 in the `pqc` space | The transaction carried no hybrid signature. Use `--generate-only` and `tx pqc cosign`. |
| Submit fails with out of gas | The proposal is large. Raise `--gas` and keep the fee at least gas times 0.1 uqor. |
| Checksum differs from `data_hash` | You built on a different machine type or optimizer version. Rebuild with the image named in the proposal summary (arm64 and x86 images give different bytes). |
| EVM call reverts with `cross-VM bridge call refused: target ... is not allowlisted` | The contract is not on `bridge_allowed_targets`, or its code changed since it was pinned. Compare the live params with your pin. |
| EVM call is refused before it reaches the bridge | No open EVM window that lists `0x0901`. Open one first. |
| `MsgCrossVMCall` is refused | The call may be paused on the circuit breaker list. Read `GET /cosmos/circuit/v1/disable_list`. |
| Proposal B fails | The parameter set was incomplete or a pin is wrong. Check that every field of the live answer is present and that `history_len` equals the number of history entries. |

## Related pages {#related}

* [Governance](/user-guide/governance) for voting, deposits and proposal types.
* [QoreChain Native Development](/developer-guide/cosmwasm-development) for the contract lifecycle and queries.
* [Transaction commands](/cli-reference/transaction-commands#submit-proposal) for the exact `gov` and `pqc cosign` flags.
* [Cross-VM reference](/developer-guide/cross-vm-reference) for the parameters, the queue and the call examples.
* [Workshop 3](/build-before-qday/workshop-3) for a worked cross-VM example.
