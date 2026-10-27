---
slug: /dashboard/staking-and-validators
title: Staking & Validators
sidebar_label: Staking & Validators
sidebar_position: 8
---

# Staking & Validators

This page covers staking from the Dashboard: delegating your QOR to a validator, unbonding it, and claiming rewards. The actions live on the **Wallet** page (tabs **Stake / Delegate** and **Rewards**) on **mainnet**, with your QoreX wallet connected. To compare validators first, use the read-only [Validators](/dashboard/validators) page. For the concepts behind delegation and rewards, see [Staking & Delegation](/user-guide/staking-and-delegation).

## Innovations {#innovations}

- **The Dashboard never holds a staking key.** You compose the request (which validator, how much) on the Dashboard, and QoreX reconstructs, shows, signs with the ML-DSA-87 hybrid signature and broadcasts it. The Dashboard sends only parameters through a `qorex://tx?...` link and learns only the transaction hash. The flow is the same as the [Send flow](/dashboard/wallet#send-mainnet).
- **Native lane only, permanently.** Staking, delegation and validator operations happen only on the native (Cosmos) lane with the hybrid post-quantum signature, never through an EVM precompile. A MetaMask-linked address can receive and, with an open EVM window, send QOR, but it cannot stake. Only a QoreX-connected address can.
- **The validator order spreads stake.** Only bonded, non-jailed validators are listed, smallest first. The top slot is drawn at random on the server from the smaller half, so the largest validator is never the default.
- **The light-node threshold is one total.** "Currently bonded" is shown against the light-node stake threshold, counted across all your validators together, so a shortfall can be split between validators.
- **Unbonding time is shown where it matters.** The 21-day unbonding period is read from the chain and shown once on Delegate and twice on Unbond, deliberately, because that is where people need it.
- **Fee check before you sign.** The panel reads your spendable QOR (vesting and bonded coins excluded) and keeps **Continue in QoreX** disabled until the fee can be paid.

## How to use {#how-to-use}

Prerequisites: signed in, header on **Mainnet**, the [acknowledgement](/dashboard/overview#risk-acknowledgement) accepted, and a QoreX wallet connected as described in [Use the Wallet on mainnet](/dashboard/wallet#mainnet).

### Choose a validator

Open [Validators](/dashboard/validators) to compare commission, voting power and status. The page is at `/validators` on the Dashboard: it needs you to be signed in, it has no sidebar link (type the address or follow the link here), and it follows the network selected in the header. Its APY column is read from the chain and carries the note "variable, not guaranteed, lock bonuses not included" (or reads "From fees"); no figure is promised. When picking one, consider:

- **Commission:** a lower rate leaves more rewards for you, but sustainable operators need a reasonable cut.
- **Status:** a validator is jailed when it signs fewer than 5% of the blocks in a 10,000-block window, which is about 8.3 hours of missed blocks on mainnet at roughly 3.1 seconds per block. A downtime jailing lasts a fixed **600 seconds** and costs the validator **1% of its stake**; double-signing is a separate, more serious infraction that slashes **5%**. These are the live chain parameters (checked 27 October 2026).
- **Voting power:** spreading stake across validators supports decentralization. The Delegate panel's ordering helps with that.

### Delegate {#delegate}

1. On **Wallet**, open the **Stake / Delegate** tab and find the **Delegate QOR** panel.
2. Read the info box: **Currently bonded** against the **Light-node threshold**, and whether you meet it. The threshold is checked on your total delegated stake across all validators. There is no way to "delegate to a light node" directly: delegation always targets a validator, and light-node eligibility is a separate check on your total.
3. Open the **Validator** dropdown and choose one. The first entry is drawn at random from the smaller half of the validators and can change when you reload; the rest are listed smallest-stake first. Jailed validators are not offered.
4. Enter an **Amount (QOR)**.
5. Read the note under the amount: unbonding takes 21 days, and bonded QOR cannot be moved or sold until that period passes.
6. If the panel warns that the address does not have enough spendable QOR for the fee, send a little spendable QOR to it first. **Continue in QoreX** stays disabled until this is resolved.
7. Select **Continue in QoreX** (it reads **Preparing...** while the request is created).
8. The panel shows "Approve it in QoreX" with **Open QoreX**, the request ID, and **Approve in the browser extension** when the extension is detected. QoreX shows the validator and amount before signing; nothing is sent until you approve.
9. Approve in QoreX. It builds, signs and broadcasts the delegation.

**Minimal example:** delegate 10 QOR to the first listed validator and approve in QoreX.

:::note Time-locked staking is not part of the Dashboard
Release v3.2.4 adds an optional time-locked staking module (on mainnet since 23 October 2026, on the testnet since 19 October 2026); see [Time-locked staking](/user-guide/staking-and-delegation#time-locked-staking). Neither the Dashboard nor QoreX has a screen for it. Delegations made here are ordinary delegations with no lock-in; the only wait is the 21-day unbonding on the way out.
:::

### Redelegate {#redelegate}

The Dashboard has no Redelegate panel. **QoreX moves stake between validators directly** (app 1.0.8+ and extension 0.2.6+): no 21-day unbonding wait, no lost rewards, and it can split a move across several destination validators in one transaction. Open **Stake** in QoreX, tap the validator you want to leave and choose where the stake should go; see [Move stake between validators](/qorex/portfolio-and-staking#move-stake).

On an older QoreX build without this feature, move stake in two steps instead: [undelegate](#undelegate), wait out the unbonding period (the QOR is not movable or earning during it), then [delegate](#delegate) to the new validator. That workaround costs 21 days of rewards and more fees, so update QoreX if you can.

### Undelegate {#undelegate}

:::caution 21-day unbonding period
Undelegated QOR does not arrive today. It sits in a **21-day unbonding period** first, during which it earns no rewards and cannot be moved or sold. The panel states this twice on purpose, once as its subtitle and once again right above the confirm button.
:::

1. On **Wallet**, open **Stake / Delegate** and scroll to the **Unbond QOR** panel, below Delegate.
2. If you have no active delegations from this address, the panel says so and stops here.
3. Open **Unbond from** and pick the delegation to reduce. It lists only validators you are delegated to, with the bonded amount.
4. Enter an amount, or select **Unbond all X QOR** to fill in the full bonded amount.
5. Entering more than is bonded blocks submission.
6. Read the second warning above the confirm button: the QOR arrives in 21 days, not today.
7. If the address cannot cover the fee (bonded coins cannot pay it), the panel warns and disables the button.
8. Select **Continue in QoreX** (**Preparing...** while the request is created), then approve in QoreX through **Open QoreX**, or **Approve in the browser extension**.

The QOR becomes spendable again only after the 21-day unbonding period ends.

### Claim rewards {#claim}

1. On **Wallet**, open the **Rewards** tab.
2. The **Staking rewards** panel reads your accrued rewards across every validator you are delegated to. If nothing is staked from this address, it says so.
3. Otherwise it shows the total waiting plus a line per validator. Rewards accrue continuously and are not lost by waiting.
4. Select **Claim in QoreX**. This claims from **all** validators at once; there is no per-validator claim.
5. Approve the claim in QoreX (**Open QoreX**, or **Approve in the browser extension**).

## How to access {#how-to-access}

- **Where:** [dashboard.qorechain.io/wallet](https://dashboard.qorechain.io/wallet), tabs **Stake / Delegate** and **Rewards**. Sign-in is required.
- **Network:** mainnet only, with a QoreX wallet linked. Testnet wallets have no staking screen.
- **Wallet:** QoreX (app or extension). Keplr and MetaMask cannot stake from the Dashboard.
- **Costs:** the network fee, paid from spendable QOR (floor 0.1 uqor per gas). The Dashboard charges nothing.
- **Funds:** vesting balances count toward what you can delegate but cannot pay the fee.

## Where it is published {#where-published}

| Surface | Address | Network |
| --- | --- | --- |
| Delegate, Unbond, Rewards | `dashboard.qorechain.io/wallet` | Mainnet |
| Compare validators | `dashboard.qorechain.io/validators`, see [Validators](/dashboard/validators) | Follows the header network |
| Move stake between validators | QoreX, see [Portfolio & Staking](/qorex/portfolio-and-staking#move-stake) | Mainnet |

## Limits and known issues {#limits}

- **Not on the Dashboard:** redelegation (use QoreX) and time-locked staking.
- **No staking on testnet wallets** in the Dashboard.
- **Estimates are approximate:** the fee estimate and the light-node threshold shown on the panel are values built into the Dashboard, not read from the chain at that moment. QoreX shows the exact fee before you sign.
- **Unbonding is 21 days** and cannot be shortened.
- **Claim is claim-all.**

## Related

- [Validators](/dashboard/validators) - compare validators, commission and variable yield.
- [Staking & Delegation](/user-guide/staking-and-delegation) - full staking concepts.
- [Use the Wallet on mainnet](/dashboard/wallet#mainnet) - connect QoreX before staking.
- [Explorer Validators](/dashboard/explorer#validators) - browse validators without a wallet.
- [Nodes & Validators](/dashboard/tools-hub) - apply to run your own validator.
