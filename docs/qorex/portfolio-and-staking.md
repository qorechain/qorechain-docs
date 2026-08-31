---
slug: /qorex/portfolio-and-staking
title: Portfolio & Staking
sidebar_label: Portfolio & Staking
sidebar_position: 4
---

# Portfolio & Staking

## Portfolio

The **Portfolio** view (biometric-gated the first time you open it each session) shows an **allocation donut** — your QOR unified across its three lanes (Native, EVM, SVM) — with a caption under the ring, plus a row for each asset. Percentages appear once the price feed is live, and each balance shows its estimated value in USD alongside the QOR amount.

**Where the price comes from.** QoreX reads it from `GET https://api.qore.network/v1/price/{symbol}` — a public endpoint of ours, not a direct call to any exchange. Nothing on your device talks to a price source outside QoreChain's own infrastructure, so your IP address is never exposed to one. If a defensible price genuinely isn't available, the endpoint responds with an error rather than guessing — QoreX shows the price as unavailable rather than ever displaying a fabricated zero or stale figure as if it were current.

Tap any asset to open **Asset detail**, which shows:

- **Balance history** — a real trend built from your on-chain transfers.
- **Recent activity** — transaction rows with reverse **@handle** lookup, so counterparties show by name where possible. Tap any row to open its full detail: amount, counterparty, block, transaction hash, and signature.

## Staking & Earn

Staking QOR helps secure QoreChain and earns you rewards. All staking operations are real on-chain transactions carrying your post-quantum signature.

### Stake with a validator

1. Open **Stake**.
2. Choose a validator from the list (loaded live from the chain, smallest stake shown first, with any validator currently jailed left out — delegating to one is never what you want).
3. Enter an amount and **delegate** with biometric confirmation.
4. Claim rewards from the same screen whenever they accrue.

:::note No lock-in period today — the wait is only on the way out
There's no fixed term to choose, because there isn't one right now: delegating stays active with rewards flowing from the next block until you ask to undelegate — there's no expiry to renew and no minimum stake duration. The only waiting period is on exit: once you undelegate, that QOR sits in a 21-day unbonding period, earning nothing and unmovable, before it's back in your spendable balance. Moving a delegation to a different validator instead (redelegate) skips that wait entirely. This describes today's chain behavior, not a permanent guarantee — see [Is there a lock-in period?](/user-guide/staking-and-delegation#lock-in-period) for more.
:::

### Move stake between validators (redelegate) {#move-stake}

Move QOR you already have staked to a different validator — or split it across several — without touching the 21-day unbonding queue at all. The stake keeps earning rewards the whole way across.

1. Open **Stake**, and tap the validator your QOR is currently with.
2. Choose where it should go — pick a single destination, or several at once. Splitting across several divides the amount equally, and the exact figure going to each validator is shown before you confirm.
3. Confirm with biometric approval. Every destination moves in a **single transaction** — one fee, and either the whole move lands or none of it does.

This is the move to make when a validator you're delegated to gets jailed or raises its commission — before this existed, the only way out was to unstake and wait 21 days earning nothing; moving instead costs no wait and no lost rewards.

:::caution A per-pair limit exists, and the fee is spent even if you hit it
The chain allows at most **7 redelegations in flight at once for the same (source, destination) validator pair** — normal use won't come close, but QoreX checks this limit before you sign and warns you if you're at it. Past that limit, the transaction fails on-chain and the network fee is still spent, so don't retry a move that's already been declined for this reason without waiting for an existing one to clear first.
:::

### Undelegate

1. Open **Stake**, tap the validator, and choose to undelegate instead of moving your stake.
2. Enter the amount — the screen shows the **21-day unbonding period** and the **exact commission** you'll pay, both before you confirm.
3. Confirm with biometric approval. The QOR stops earning immediately and becomes spendable again after the unbonding period completes.

### Earn

The **Earn** view summarizes your active positions and yield in one place.

## Next steps

- [Send & Receive](/qorex/send-and-receive) — move QOR and external assets.
- [Security & Recovery](/qorex/security-and-recovery) — guardians, Legacy inheritance, and device linking.
