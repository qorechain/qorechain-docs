---
slug: /user-guide/governance
title: Governance
sidebar_label: Governance
sidebar_position: 3
---

# Governance

This guide covers how on-chain governance works on QoreChain: how votes are tallied, how to submit proposals, and how to vote.

:::note
The commands below use the **`qorechain-diana`** testnet (EVM chain ID **9800**). Mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) has been live since 29 June 2026 on the v3.2 line (node release **v3.2.1**; the testnet runs **v3.2.2**) — substitute the mainnet chain ID and endpoints from the **Connecting to Mainnet** page when participating in governance on mainnet.
:::

:::caution Sign with `tx pqc cosign`
Mainnet and testnet require a hybrid post-quantum signature on every Cosmos-lane transaction, so the commands on this page do not broadcast as written. Add `--generate-only > tx.json` to a command, then run `qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id <chain-id>`. See [Hybrid signing](/cli-reference/transaction-commands#hybrid-signing).
:::

---

## Voting Power {#voting-power}

Proposals are tallied on **bonded stake**: each QOR you have delegated to a bonded validator counts as one unit of voting power, with no multiplier. If you do not vote yourself, your delegation follows your validator's vote; casting your own vote overrides that for your stake. A proposal passes when all of the following hold:

| Rule      | Live value | Meaning                                                                       |
| --------- | ---------- | ----------------------------------------------------------------------------- |
| Quorum    | 33.4%      | Share of bonded stake that must vote                                          |
| Threshold | 50%        | Share of "yes" among the non-abstaining votes needed to pass                  |
| Veto      | 33.4%      | If "no with veto" reaches this share, the proposal is rejected and its deposit is burned |

These values were read from the chain on 14 October 2026; confirm them with `qorechaind query gov params`, since governance can change them.

:::note QDRW is designed but not active
QoreChain's design includes a **Quadratic Delegation-Reputation Weighted (QDRW)** voting-power formula, `VP = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)`, that would dampen large stakes and weight reputation. It is implemented in the `x/qca` module but is **switched off** on both networks (`qdrw_enabled` is `false` in `qorechaind query qca config`) and is not part of the governance tally, so it does not affect any vote today. xQORE is also not live (see [xQORE Staking](/user-guide/xqore-staking)).
:::

---

## Submitting a Proposal

Any QOR holder can submit a governance proposal. A minimum deposit is required for the proposal to enter the voting period.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**Example proposal file** (`proposal.json`). A proposal is a list of messages the governance module executes if it passes, plus a title, summary and deposit. This one raises the maximum validator count from 100 to 150; `authority` is the governance module account (`qorechaind query auth module-account gov`):

```json
{
  "messages": [
    {
      "@type": "/cosmos.staking.v1beta1.MsgUpdateParams",
      "authority": "qor10d07y265gmmuvt4z0w9aw880jnsr700jwfyxr3",
      "params": {
        "unbonding_time": "1814400s",
        "max_validators": 150,
        "max_entries": 7,
        "historical_entries": 10000,
        "bond_denom": "uqor",
        "min_commission_rate": "0.000000000000000000"
      }
    }
  ],
  "metadata": "",
  "deposit": "10000000uqor",
  "title": "Increase maximum validator count",
  "summary": "Raise the active validator set from 100 to 150 to improve decentralization.",
  "expedited": false
}
```

`MsgUpdateParams` replaces the whole parameter set, so copy the current values from `qorechaind query staking params` and change only the field you mean to. A text-only (signalling) proposal uses `"messages": []`. `qorechaind tx gov draft-proposal` generates a skeleton.

---

## Voting on Proposals

Once a proposal enters the voting period, any staker can cast a vote:

```bash
qorechaind tx gov vote <proposal_id> <option> \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**Vote options:**

| Option         | Description                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| `yes`          | Support the proposal                                                                                     |
| `no`           | Oppose the proposal                                                                                      |
| `abstain`      | Acknowledge the proposal without taking a position                                                       |
| `no_with_veto` | Oppose the proposal and signal it should not have been submitted (burns the deposit if threshold is met) |

**Example:**

```bash
qorechaind tx gov vote 1 yes \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

---

## Proposal Types

A proposal carries zero or more messages that execute if it passes. Common cases:

| Type                 | Description                                                                                     |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| **Text**             | A signaling proposal with no messages and no automatic on-chain execution. Used for community sentiment checks. |
| **Parameter change** | A module's `MsgUpdateParams` message, sent by the governance module account. It replaces that module's whole parameter set. |
| **Software upgrade** | A `MsgSoftwareUpgrade` message that schedules a coordinated chain upgrade at a specified block height. |
| **Community spend**  | A `MsgCommunityPoolSpend` message that sends funds from the community pool to a recipient address. |
| **Expedited**        | Set `"expedited": true` for a shorter voting period with a higher deposit and pass threshold (see below). |

---

## Querying Proposals

List all proposals:

```bash
qorechaind query gov proposals
```

Query a specific proposal by ID:

```bash
qorechaind query gov proposal <proposal_id>
```

Check the current tally of votes on a proposal:

```bash
qorechaind query gov tally <proposal_id>
```

View your own vote on a proposal:

```bash
qorechaind query gov vote <proposal_id> <voter_address>
```

---

## Governance Parameters

Query the current governance parameters:

```bash
qorechaind query gov params
```

Key parameters include:

| Parameter            | Description                                                      | Live value (14 Oct 2026) |
| -------------------- | ---------------------------------------------------------------- | ------------------------ |
| `min_deposit`        | Minimum deposit required for a proposal to enter voting          | 10 QOR (`10000000uqor`)  |
| `max_deposit_period` | Time window for reaching the minimum deposit                     | 2 days                   |
| `voting_period`      | Duration of the voting period once a proposal is active          | 2 days                   |
| `quorum`             | Minimum participation required for a valid vote                  | 0.334                    |
| `threshold`          | Minimum "yes" percentage to pass (excluding abstains)            | 0.5                      |
| `veto_threshold`     | Minimum "no with veto" percentage to reject and burn the deposit | 0.334                    |
| `expedited_voting_period` / `expedited_threshold` / `expedited_min_deposit` | Voting period, pass threshold and deposit for expedited proposals | 1 day / 0.667 / 50 QOR |

---

:::tip

* Vote before the voting period ends; your vote is counted only if it is cast while the proposal is in the voting period.
* Use `no_with_veto` carefully. If the veto threshold is reached, the proposal deposit is burned.
* Proposals that do not reach the minimum deposit within the deposit period are automatically removed.

:::
