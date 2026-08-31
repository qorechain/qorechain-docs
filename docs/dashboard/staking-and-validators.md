---
slug: /dashboard/staking-and-validators
title: Staking & Validators
sidebar_label: Staking & Validators
sidebar_position: 8
---

# Staking & Validators

The **Validators** page (`/validators`) lets you review the network's validators — it is a read-only browser, with no wallet connection and no delegate button on it. The actual staking actions (delegate, undelegate, claim) live on the **Wallet** page instead, under its **Stake / Delegate** and **Rewards** tabs, once your QoreX wallet is connected there. Delegating helps secure the network and earns staking rewards. For the concepts behind delegation and rewards, see [Staking & Delegation](/user-guide/staking-and-delegation).

QoreChain staking is signed post-quantum, so the dashboard never holds a key that could sign a delegation. Every staking action below works the same way: you compose the request on the dashboard (which validator, how much), then approve and sign it **in your connected QoreX wallet** — the app, or the browser extension on **version 0.2.2 or later** (see [which version is live where](/qorex/overview#platform-availability); on an older extension build the Dashboard will ask you to update rather than silently failing) — exactly like the [Send flow](/dashboard/wallet#mainnet). The dashboard sends only the parameters through a `qorex://tx?...` link; QoreX reconstructs, signs, and broadcasts the actual transaction itself. Connect your wallet first — see [Use the Wallet on mainnet](/dashboard/wallet#mainnet).

Staking, delegation, and validation happen exclusively on the native (Cosmos) lane, using the hybrid post-quantum signature — never through an EVM precompile. This is a permanent security property, not a temporary gap: the EVM lane runs a single ante decorator, so the validator-license, minimum-self-bond, and PQC checks that live in the native lane's ante would all be bypassed if staking were exposed there. A MetaMask-linked address can send and receive QOR (see [Use the Wallet on mainnet](/dashboard/wallet#mainnet)), but it cannot stake — only a QoreX-connected address can.

## Review validators

:::caution On mainnet, this page currently shows testnet validators
The **Validators** page on mainnet is showing the testnet validator set (4 nodes) rather than the actual mainnet set (8 nodes) — a backend data issue, not something wrong with your connection or account. Don't use this page to decide who mainnet's validators are; use the [block explorer](https://explore.qore.network) or a direct chain query (`qorechaind query staking validators`) instead. This is purely an informational mismatch, though: the **Delegate** validator picker on the [Wallet page's Stake tab](/dashboard/wallet#mainnet) reads a different, correct route straight from the chain, so you cannot actually pick or delegate to a validator that doesn't exist on mainnet — you'll just see a different (and correct) list once you get there.
:::

The page opens with summary cards for the active validator count, total bonded QOR, average commission, and average uptime. Below that is the validator list. Each validator row shows:

- A **rank** and the validator's **moniker** (name), with its address and a copy button.
- **Voting power** — the validator's bonded stake and its share of the total.
- **Commission** — the percentage the validator keeps from rewards.
- **APY** — shown as an em dash (—) rather than a number. QoreChain's emission comes from a custom module the standard yield-estimation endpoint can't see, so a computed figure here would be a guess dressed up as data; showing it as unavailable was a deliberate fix, not a bug. There is currently no endpoint for computing a live, chain-backed staking APY — treat any specific percentage you see quoted elsewhere as unverified, and don't assume a number that appears here later is automatically correct: the underlying formula assumes the standard Cosmos inflation path, which isn't how this chain's emission actually reaches stakers, and would need to be checked against the real mechanism before being trusted.
- **Status** — for example active or jailed.
- Operational details: region, uptime, blocks proposed, software version, and last seen.

A search box filters the list by validator name or address.

This page is for comparing validators only. To actually delegate to one, go to the **Wallet** page — see below.

## Choose a validator

When picking a validator to delegate to, consider:

- **Commission** — a lower rate leaves more rewards for you, but sustainable operators need a reasonable cut.
- **Uptime and status** — favor active validators with strong uptime; a jailed validator is not earning. A validator jails when it misses signing on more than 5% of blocks within a 10,000-block window (roughly six hours to accumulate) — it earns nothing, for you or itself, until it unjails. A downtime jailing lasts a fixed **600 seconds (10 minutes)** and costs the validator **1% of its stake**; double-signing is a separate, more serious infraction that slashes **5%**. These figures are the live, current chain parameters — treat any older figure you see elsewhere as superseded.
- **Voting power** — spreading stake across validators supports decentralization. On the Delegate panel, validators are listed smallest-first for exactly this reason.

## Delegate, redelegate, undelegate, and claim rewards

All four actions live on the **Wallet** page (`/dashboard/wallet`), not on the Validators page. Open the wallet, connect QoreX if you haven't already (see [Use the Wallet on mainnet](/dashboard/wallet#mainnet)), then use the **Stake / Delegate** tab for delegating and undelegating, and the **Rewards** tab for claiming.

### Delegate {#delegate}

1. On the **Wallet** page, select the **Stake / Delegate** tab.
2. In the **Delegate QOR** panel, check the info box at the top — it shows your currently bonded total against the light-node stake threshold, and whether you already meet it. This threshold is checked against your **total delegated stake across all validators combined**, not per validator, so a shortfall can be split between them — there's no way to "delegate to a light node" directly, since delegation always targets a validator and light-node eligibility is a separate check on your total.
3. Open the **Validator** dropdown and choose one. Validators are listed smallest-stake-first.
4. Enter an **Amount (QOR)**.
5. Read the note under the amount field: unbonding takes 21 days, and once bonded the QOR cannot be moved or sold until that period passes.
6. If the panel shows a warning that this address doesn't have enough spendable QOR to cover the fee, send a little spendable QOR to it first — vesting or bonded coins cannot pay the fee. The **Continue in QoreX** button stays disabled until this is resolved.
7. Click **Continue in QoreX** (it reads **Preparing…** while the request is being created).
8. The panel now shows **Approve it in QoreX** with an **Open QoreX** link and a request ID. QoreX will show you the validator and amount before signing — nothing is sent until you approve it there.
9. Open QoreX (the link/deeplink does this) and approve the delegation. QoreX builds, signs, and broadcasts the transaction; the dashboard never sees your key.

### Redelegate {#redelegate}

The dashboard itself does not have a dedicated Redelegate panel — but you don't need one anymore. **QoreX itself now moves stake between validators directly** (app 1.0.8+ and extension 0.2.6+): no 21-day unbonding wait, no lost rewards, and it can even split a move across several destination validators in one transaction. Open **Stake** in QoreX, tap the validator you want to leave, and choose where the stake should go — see [Move stake between validators](/qorex/portfolio-and-staking#move-stake) for the full walkthrough. This is a better answer than anything the dashboard's own request contract could offer, so use QoreX directly for this rather than the workaround below.

If you're on an older QoreX build without this feature yet, move a stake to a different validator in two steps using the flows on this page instead:

1. **[Undelegate](#undelegate)** the amount from the validator you want to leave.
2. Wait out the unbonding period shown in that flow — the QOR is not movable or earning during this time.
3. Once the unbonded QOR is spendable again, **[Delegate](#delegate)** it to the new validator.

This workaround costs 21 days of lost rewards and more in fees than a direct move, so update QoreX rather than relying on it if you can.

### Undelegate {#undelegate}

Exiting a delegation is now available on the dashboard — for a while it was possible to delegate but not to unbond from here at all, so if you remember it being missing, that's why.

:::caution 21-day unbonding period
Undelegated QOR does not arrive today. It sits in a **21-day unbonding period** first, during which it earns no rewards and cannot be moved or sold. The panel states this twice on purpose — once as its subtitle, once again right above the confirm button — because someone reaching for this screen in a hurry (a falling market, a jailed validator) is exactly who most needs to see it before signing.
:::

1. On the **Wallet** page, select the **Stake / Delegate** tab and scroll to the **Unbond QOR** panel, below Delegate. Its subtitle already restates the 21-day unbonding warning above.
2. If you have no active delegations from this address, the panel says so and stops here.
3. Open the **Unbond from** dropdown and pick the delegation to reduce — it lists only validators you're actually delegated to, each showing the bonded amount.
4. Enter an **Amount (QOR)** to unbond, or click **Unbond all `<amount>` QOR** to fill in the full bonded amount for that validator.
5. If you enter more than is bonded to that validator, the panel tells you so and blocks submission.
6. Immediately above the confirm button, the warning appears a second time: the QOR arrives in 21 days, not today, and earns nothing until then. This is deliberate repetition, not a docs typo — read it again before continuing.
7. If the address can't cover the fee (bonded coins can't pay it — you need a little spendable QOR here first), the panel warns you and disables the button.
8. Click **Continue in QoreX** (**Preparing…** while the request is created).
9. The panel shows **Approve it in QoreX** with an **Open QoreX** link and a request ID — QoreX displays the validator and amount before you sign.
10. Open QoreX and approve. It signs and broadcasts the undelegation; the QOR becomes spendable again only after the 21-day unbonding period ends.

### Claim rewards {#claim}

1. On the **Wallet** page, select the **Rewards** tab.
2. The **Staking rewards** panel reads your accrued rewards across every validator you're delegated to. If nothing is staked from this address, it says so and there is nothing to claim.
3. Otherwise it shows the total waiting to be claimed, plus a line per validator with the amount accrued there. Rewards accrue continuously and are never lost by waiting — there's no deadline.
4. Click **Claim in QoreX**. This is claim-all: it claims the accrued rewards from every validator shown, in one request — there is no per-validator claim button.
5. Approve the claim in QoreX (via the **Open QoreX** link) to sign and broadcast it.

:::note Unbonding period
Undelegated QOR goes through a 21-day unbonding period before it becomes spendable again, during which it does not earn rewards. See [Staking & Delegation](/user-guide/staking-and-delegation) for details.
:::

## Related

- [Staking & Delegation](/user-guide/staking-and-delegation) — full staking concepts.
- [Use the Wallet on mainnet](/dashboard/wallet#mainnet) — connect QoreX before staking.
- [Explorer Validators](/dashboard/explorer#validators) — browse validators without a wallet.
- [Tools Hub](/dashboard/tools-hub) — apply to run your own validator.
