---
slug: /qorex/portfolio-and-staking
title: Portfolio & Staking
sidebar_label: Portfolio & Staking
sidebar_position: 4
---

# Portfolio & Staking

## Portfolio

The **Portfolio** view (biometric-gated the first time you open it each session) shows an **allocation donut** — your QOR unified across its three lanes (Native, EVM, SVM) — with a caption under the ring, plus a row for each asset. Percentages appear once the price feed is live.

Tap any asset to open **Asset detail**, which shows:

- **Balance history** — a real trend built from your on-chain transfers.
- **Recent activity** — transaction rows with reverse **@handle** lookup, so counterparties show by name where possible.

## Staking & Earn

Staking QOR helps secure QoreChain and earns you rewards. All staking operations are real on-chain transactions carrying your post-quantum signature.

### Stake with a validator

1. Open **Stake**.
2. Choose a validator from the list (loaded live from the chain).
3. Enter an amount and **delegate** with biometric confirmation.
4. Claim rewards from the same screen whenever they accrue.

:::note No lock-in period today — the wait is only on the way out
There's no fixed term to choose, because there isn't one right now: delegating stays active with rewards flowing from the next block until you ask to undelegate — there's no expiry to renew and no minimum stake duration. The only waiting period is on exit: once you undelegate, that QOR sits in a 21-day unbonding period, earning nothing and unmovable, before it's back in your spendable balance. Moving a delegation to a different validator instead (redelegate) skips that wait entirely. This describes today's chain behavior, not a permanent guarantee — see [Is there a lock-in period?](/user-guide/staking-and-delegation#lock-in-period) for more.
:::

:::note This screen doesn't have its own Undelegate button yet
This Stake screen covers delegate and claim only. To undelegate directly from a QoreX screen, use the [browser extension's Stake screen](/qorex/browser-extension#stake) instead — or undelegate through the [Dashboard](/dashboard/staking-and-validators#delegate), which sends the request to whichever QoreX you have connected, app included, for you to approve.
:::

### Earn

The **Earn** view summarizes your active positions and yield in one place.

## Next steps

- [Send & Receive](/qorex/send-and-receive) — move QOR and external assets.
- [Security & Recovery](/qorex/security-and-recovery) — guardians, Legacy inheritance, and device linking.
