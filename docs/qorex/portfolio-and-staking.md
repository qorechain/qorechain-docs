---
slug: /qorex/portfolio-and-staking
title: Portfolio & Staking
sidebar_label: Portfolio & Staking
sidebar_position: 4
---

# Portfolio & Staking

This page covers the Portfolio view and staking in QoreX: delegating QOR to validators, claiming rewards, moving stake, unstaking, and, in builds that carry it, time-locked staking. It is for anyone holding QOR in the mobile app or the extension.

## Portfolio

The **Portfolio** view (biometric-gated the first time you open it each session) shows an **allocation donut** - your QOR unified across its three lanes (Native, EVM, SVM) - with a caption under the ring, plus a row for each asset. Percentages appear once the price feed is live, and each balance shows its estimated value in USD alongside the QOR amount. On **testnet**, QOR is shown with **no USD value** - test tokens have none.

Use **+ Coin or token** to add coins and tokens before you hold any, and **Receive** to get their addresses - see [Coins and tokens](/qorex/send-and-receive#coins-and-tokens).

**Where the price comes from.** QoreX reads it from `GET https://api.qore.network/v1/price/{symbol}` - a public endpoint of ours, not a direct call to any exchange. Nothing on your device talks to a price source outside QoreChain's own infrastructure, so your IP address is never exposed to one. If a defensible price genuinely isn't available, the endpoint responds with an error rather than guessing - QoreX shows the price as unavailable rather than ever displaying a fabricated zero or stale figure as if it were current.

Tap any asset to open **Asset detail**, which shows:

- **Balance history** - a real trend built from your on-chain transfers.
- **Recent activity** - transaction rows with reverse **@handle** lookup, so counterparties show by name where possible. Tap any row to open its full detail: amount, counterparty, block, transaction hash, and signature.

## Staking & Earn

Staking QOR helps secure QoreChain and earns you rewards, which are not guaranteed. All staking operations are real on-chain transactions on the hybrid-signed native lane: each is signed twice, with a classical key and with ML-DSA-87 (FIPS 204). Staking never goes through an EVM precompile.

### Stake with a validator

1. Open **Stake**.
2. Choose a validator from the list (loaded live from the chain, smallest stake shown first, with any validator currently jailed left out - delegating to one is never what you want). Validators you already have QOR with carry a *staked* badge.
3. Enter an amount. While you type, QoreX warns you if what would be left would not cover the next network fee: *"This leaves \{remaining\} QOR - less than the \{fee\} QOR a transaction costs. You would not be able to unstake or claim rewards until this account holds QOR for the fee again."* It is a warning, not a block - it is your money - but unstaking and claiming both cost a fee from your **liquid** balance, so staking down to nearly nothing locks the stake until someone sends QOR in.
4. **Confirm** (biometrics on mobile). You can stake vesting QOR, up to your total, but the network fee must come from your **unlocked** QOR - vesting QOR cannot pay fees.
5. Claim rewards from the same screen whenever they accrue - see below.

:::note Ordinary delegation has no lock-in period; the wait is only on the way out
An ordinary delegation has no fixed term: it stays active, with rewards flowing from the next block, until you ask to undelegate. There is no expiry to renew and no minimum stake duration. The only waiting period is on exit: once you undelegate, that QOR sits in a 21-day unbonding period, earning nothing and unmovable, before it is back in your spendable balance. Moving a delegation to a different validator instead (redelegate) skips that wait entirely. Chain release v3.2.4 (mainnet since 23 October 2026) adds an optional time-locked form of staking, which newer QoreX builds can use: see [Staking locks](#staking-locks) below. In builds without it (iOS 1.1.8, Chrome 0.3.8, Safari 0.3.8), every delegation you make is an ordinary one with no lock. See also [Is there a lock-in period?](/user-guide/staking-and-delegation#lock-in-period).
:::


### Staking locks {#staking-locks}

Staking locks are in Android 1.1.9 and the Firefox extension 0.3.9 today; iOS, Chrome and Safari get them when their stores serve those builds. A lock is optional. It commits part of your stake for 3, 6 or 12 months in return for a bonus.

- **The bonus shown is the one the lock earns today**, under the ceiling the network sets. It can change as network conditions change, and it is not guaranteed.
- **The tier schedule is labelled "up to"**, with today's figure shown beside it.
- **Unlocking early** sits behind a second confirmation that names the cost before you sign.
- **Unstake and Move stake are limited to the unlocked part** of your stake.

For how the module works on chain, see [Time-locked staking](/user-guide/staking-and-delegation#time-locked-staking).

### Move stake between validators (redelegate) {#move-stake}

Move QOR you already have staked to a different validator - or split it across several - without touching the 21-day unbonding queue at all. The stake keeps earning rewards the whole way across.

1. Open **Stake** and tap the validator your QOR is currently with; the panel offers **Move stake**.
2. Choose where it should go - pick a single destination, or several at once. Splitting across several divides the amount equally, and the exact figure going to each validator is shown before you confirm.
3. Confirm with biometric approval. Every destination moves in a **single transaction** - one fee, and either the whole move lands or none of it does.

This is the move to make when a validator you're delegated to gets jailed or raises its commission - before this existed, the only way out was to unstake and wait 21 days earning nothing; moving instead costs no wait and no lost rewards.

:::caution A per-pair limit exists, and the fee is spent even if you hit it
The chain allows at most **7 redelegations in flight at once for the same (source, destination) validator pair** - normal use won't come close, but QoreX checks this limit before you sign and warns you if you're at it. Past that limit, the transaction fails on-chain and the network fee is still spent, so don't retry a move that's already been declined for this reason without waiting for an existing one to clear first.

One more rule of the chain: stake you have just moved **into** a validator cannot be moved **onward** from that validator until the move that brought it there has completed (21 days) - QoreX tells you when a move is refused for this reason. You can still unstake it, or move stake that was already with that validator.
:::

### Claim, and Claim & restake {#claim}

- **Claim** collects your rewards into your balance. QoreX claims only from validators that actually have rewards waiting.
- **Claim & restake** (button *Claim & restake*: "Compound \{amount\} QOR back to the same validators, in one transaction.") claims and delegates the rewards straight back to the validators that earned them - one transaction, one fee. It is offered only when QoreX can read the per-validator breakdown.
- **Fee check.** The fee is paid *before* the rewards arrive. If your unlocked QOR cannot cover it, QoreX stops before you sign and says how much is needed ("Claiming needs about \{fee\} QOR unlocked for the network fee - it is paid before the rewards arrive."); send a little QOR to that address and try again. Vesting QOR cannot pay fees.

### Undelegate

1. Open **Stake** and tap the validator. If you have QOR with it, the panel offers **Unstake** (and **Move stake**).
2. Enter the amount. The panel shows how much you have with that validator and, above the **Unstake** button, "Unstaking takes 21 days before the QOR is yours to move" - you see the 21-day wait before you confirm.
3. Confirm with biometric approval. The QOR stops earning immediately and becomes spendable again after the unbonding period completes.

### Unstaking in progress {#unbonding}

Unstaked QOR leaves both your delegation and your spendable balance for 21 days. QoreX lists it under **Unstaking in progress** - *"\{amount\} QOR unstaking"*, each entry with the time left (*\{days\}d \{hours\}h \{minutes\}m left*, or *Less than a minute left*, or *The wait is over - this should be back in your balance.*). If QoreX cannot read when an entry completes it says so and keeps the amount in the total. If your node cannot be reached the list stays as it was - it never reads as "nothing unstaking".

:::note Unstaking when you run a validator
If your wallet is a validator operator's, unstaking is refused when it would take your self-bond below the required 100,000 QOR: *"Unstaking this much would drop your validator's self-bond below the required 100,000 QOR. The floor applies for as long as the validator operates."*
:::

### Earn

The **Earn** view summarizes your staking in one place: your staked QOR, your claimable rewards, how many validators you are with, and the share of all QOR that is staked network-wide. It shows no staking rate: the chain does not publish an emission figure a rate could be derived from, so QoreX shows *Not available* rather than a number it cannot support.

In the extension the Stake screen has the same pieces (staked total, rewards, **Claim**, **Claim & restake**, **Unstake**, **Move stake**, an account selector when you have several accounts, and the unstake warning).

## Next steps

- [Send & Receive](/qorex/send-and-receive) - move QOR and external assets.
- [Security & Recovery](/qorex/security-and-recovery) - guardians, Legacy inheritance, and device linking.

## Limits and known issues {#limits}

- Rewards are not guaranteed. QoreX shows no overall staking rate.
- Staking locks are not in iOS 1.1.8, Chrome 0.3.8 or Safari 0.3.8.
- Unstaked QOR takes 21 days to return; moving stake between validators has no wait but is limited to 7 redelegations in flight for the same validator pair.
- Vesting QOR can be staked but cannot pay fees; the fee must come from unlocked QOR.
- Portfolio is mobile only. On testnet, QOR shows no USD value.
