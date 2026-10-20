---
slug: /user-guide/staking-and-delegation
title: Staking and Delegation
sidebar_label: Staking and Delegation
sidebar_position: 2
---

# Staking and Delegation

This guide covers how to delegate QOR tokens to validators, redelegate between validators, unbond your stake, claim rewards, and understand which parts of QoreChain's staking design are live today.

:::note
The commands below use the **`qorechain-diana`** testnet (EVM chain ID **9800**). Mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) has been live since 7 June 2026 and runs release **v3.2.3**; the testnet runs **v3.2.4** — substitute the mainnet chain ID and endpoints from the **Connecting to Mainnet** page when staking on mainnet.
:::

:::caution Sign with `tx pqc cosign`
Mainnet and testnet require a hybrid post-quantum signature on every Cosmos-lane transaction, so the commands on this page do not broadcast as written. Add `--generate-only > tx.json` to a command, then run `qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id <chain-id>`. See [Hybrid signing](/cli-reference/transaction-commands#hybrid-signing). [QoreX](/qorex/portfolio-and-staking) and the [Dashboard](/dashboard/staking-and-validators) do this signing for you.
:::

## Is there a lock-in period? {#lock-in-period}

**On mainnet today**, no — there's no term to pick, because staking isn't sold in fixed durations here the way it often is on an exchange. Delegating stays active with rewards flowing from the next block, for as long as you want, until you choose to undelegate; there's nothing expiring and nothing to renew. The **21-day unbonding period** you'll see referenced throughout this guide is not a lock-in you agree to up front — it only starts once you *ask* to undelegate, and only applies to the QOR you're taking out. Moving a delegation between validators (redelegate) skips that wait entirely, since the stake never leaves the bonded pool. The "loyalty" term in the [bonding curve](#bonding-curve) further down is part of QoreChain's design but is **not applied by the live chain today**, so how long you stay delegated does not change your reward rate. An optional, time-locked form of staking exists on the testnet only; see [Time-locked staking (testnet only)](#time-locked-staking).

This describes current mainnet behavior, not a permanent guarantee — a minimum staking period is something governance could introduce in the future, the same way any other staking parameter on this page can change by vote. If that ever happens, the wallet will show the resulting wait (any minimum plus the 21-day unbonding) before you confirm a delegation, and this page will be updated to match.

---

## Delegating Tokens

Delegate QOR to a validator to take part in network security. Delegators receive a share of the rewards the validator earns, less the validator's commission:

```bash
qorechaind tx staking delegate <validator_address> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**Example:** Delegate 100 QOR to a validator:

```bash
qorechaind tx staking delegate qorvaloper1abc...xyz 100000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

---

## Redelegating

Move your delegation from one validator to another without waiting for the unbonding period:

```bash
qorechaind tx staking redelegate <source_validator> <destination_validator> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**Example:**

```bash
qorechaind tx staking redelegate qorvaloper1src... qorvaloper1dst... 50000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

Redelegating has **no penalty and no lock of its own** — the stake never leaves the bonded pool, never stops earning, and takes effect immediately. It is not subject to the 21-day unbonding period at all; that applies only to `unbond`. One standard staking rule applies: stake you have just moved **to** a validator cannot be redelegated again **from** that validator until the first move has matured (21 days); you can still `unbond` it or redelegate your other stake in the meantime.

:::caution The real limit is a count, not a cooldown
A delegator can have at most **7 simultaneous in-flight redelegation entries** for the exact same (delegator, source validator, destination validator) route — each entry clears on its own as it matures, freeing a slot. This is a ceiling normal use essentially never reaches, not a general "wait before you can redelegate again" rule.
:::

---

## Unbonding

Withdraw your delegated tokens from a validator. Unbonding takes **21 days** to complete, during which the tokens do not earn rewards and cannot be transferred.

```bash
qorechaind tx staking unbond <validator_address> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**Example:**

```bash
qorechaind tx staking unbond qorvaloper1abc...xyz 25000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

After the 21-day unbonding period (1,814,400 seconds), tokens are automatically returned to your account. A delegator can have at most 7 simultaneous unbonding entries per validator.

---

## Claiming Rewards

Withdraw all accumulated staking rewards from every validator you have delegated to:

```bash
qorechaind tx distribution withdraw-all-rewards \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

To withdraw rewards from a specific validator only:

```bash
qorechaind tx distribution withdraw-rewards <validator_address> \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

Staking rewards are funded from two sources: the protocol's capped emission budget (see [Tokenomics](/architecture/tokenomics#staking-reward-schedule) for the current amount per epoch and the cap, both set by governance — most recently proposal 10 on 19 October 2026) and the staker share of every transaction fee (paid out as a normal staking reward since the v3.2.0 upgrade; see [the stranded staker share](/architecture/tokenomics#stranded-and-reserve)). Rewards depend on the validator's commission and on network activity, and are not guaranteed.

---

## Time-locked staking (testnet only) {#time-locked-staking}

:::note Not on mainnet
Release v3.2.4 adds an optional time-locked staking module, `x/stakingtier`, to the **`qorechain-diana` testnet only**. It is not live on mainnet yet (mainnet governance proposal 13 would apply v3.2.4 at height 3,742,566); on mainnet, delegation has no lock-in (see [above](#lock-in-period)). Everything below describes the testnet.
:::

On the testnet a delegator can commit part of an existing delegation to a validator for a fixed term of 3, 6 or 12 months. Terms and amounts are chain parameters; read the current ones from `GET /qorechain/stakingtier/v1/params` rather than from this page.

* **Locking is optional.** An ordinary delegation, redelegation and unbonding work exactly as described on this page. Only the locked amount is restricted: while a lock is open it cannot be undelegated or redelegated, and this holds for every route (transaction, authz, group, contract, governance).
* **Minimum lock** of 10 QOR, and at most 16 open locks per delegator.
* **Early unlock** is allowed: it ends the lock, forfeits the unpaid lock bonus and burns a part of the locked amount (recorded under the `staking_tier_penalty` burn source); the rest stays delegated and unlocked.
* **Slashing** applies to a locked delegation like any other; the lock shrinks with the delegation.
* **Claiming.** Lock bonuses accrue per epoch and are paid when you claim them.

```bash
qorechaind tx stakingtier lock <validator_address> <amount>uqor <months> --from mykey \
  --chain-id qorechain-diana --gas 400000 --fees 40000uqor --generate-only > tx.json
qorechaind tx stakingtier unlock-early <lock_id> --from mykey --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor --generate-only > tx.json
qorechaind tx stakingtier claim --from mykey --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor --generate-only > tx.json
qorechaind query stakingtier locks <holder_address>
```

As on the rest of this page, sign each generated transaction with `tx pqc cosign`.

---

## Triple-Pool Classification (design status)

QoreChain's design includes a **Triple-Pool** model that would classify validators into three pools by reputation and delegation level, with a weighted share of block rewards per pool:

| Pool                                 | Entry Criteria                                              | Design Reward Weight |
| ------------------------------------ | ----------------------------------------------------------- | -------------------- |
| **RPoS** (Reputation Proof of Stake) | Reputation score >= 70th percentile **AND** stake >= median | 40%                  |
| **DPoS** (Delegated Proof of Stake)  | Total delegation >= 10,000 QOR                              | 35%                  |
| **PoS** (Proof of Stake)             | All remaining validators                                    | 25%                  |

:::note Not active on the live networks
The pool classification, pool-weighted proposer selection and pool reward weights are implemented in the `x/qca` module and their parameters are on chain (`qorechaind query qca config`), but they are **not yet wired into block production or reward distribution**. Today block proposal rotates by stake in the standard way and rewards are shared in proportion to bonded stake, less each validator's commission. Which pool a validator "belongs" to does not change what you receive.
:::

---

## Bonding Curve Rewards {#bonding-curve}

QoreChain's design also defines a bonding-curve reward formula:

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Variable | Description                                                          |
| -------- | -------------------------------------------------------------------- |
| `R`      | Reward amount for the period                                         |
| `beta`   | Base reward rate (protocol parameter)                                |
| `S`      | Staked amount                                                        |
| `alpha`  | Loyalty coefficient (protocol parameter)                             |
| `L`      | Staking duration in epochs                                           |
| `Q(r)`   | Quality multiplier derived from the validator's reputation score `r` |
| `P(t)`   | Pool multiplier at time `t` (40%, 35%, or 25% depending on pool)     |

:::note Not active on the live networks
The bonding-curve calculation, like the pool classification above, is **not called by the live chain**: rewards are not computed with this formula, and neither staking duration nor validator reputation changes them today. The parameters (`bonding_alpha`, `bonding_beta`) exist on chain but have no effect.
:::

---

## Slashing and Jailing

Slashing on QoreChain follows the standard Cosmos SDK slashing module with these live parameters (`qorechaind query slashing params`):

| Event                | Rule                                                                 | Consequence                                  |
| -------------------- | -------------------------------------------------------------------- | -------------------------------------------- |
| Downtime             | Signing fewer than 5% of the last 10,000 blocks (about 8.9 hours at the mainnet's roughly 3.2-second blocks) | Jailed for 600 seconds; 1% of stake slashed |
| Double-signing       | Signing two different blocks at the same height                      | 5% of stake slashed                          |

Slashing applies to a validator's total bonded stake, so delegators bear their proportional share. It can also reach stake that is already unbonding from a slashed validator, which is why the unbonding period is a security measure and not only a waiting time.

---

## Querying Validator Information

Look up details about any validator:

```bash
qorechaind query staking validator <validator_operator_address>
```

**Example:**

```bash
qorechaind query staking validator qorvaloper1abc...xyz
```

List all active validators:

```bash
qorechaind query staking validators --status BOND_STATUS_BONDED
```

Query your current delegations:

```bash
qorechaind query staking delegations <delegator_address>
```

---

:::tip

* Look at a validator's commission, uptime and track record before delegating; a validator's pool or reputation does not currently change the rewards you receive.
* Redelegation takes effect immediately with no penalty and no lock. The limits are the 7-entry cap on simultaneous redelegations along the exact same route and the rule that freshly redelegated stake cannot be moved on from the destination validator until it matures.
* The 21-day unbonding period is a security measure. During this time, slashing events can still affect your tokens.

:::
