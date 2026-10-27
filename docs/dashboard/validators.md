---
slug: /dashboard/validators
title: Validators
sidebar_label: Validators
sidebar_position: 12
---

# Validators

The **Validators** page lists the validators of the network you have selected, with summary cards, a search box and, for each validator, its rank, voting power, commission, status and a variable yield figure read from the chain. It is a read-only comparison tool for people deciding where to delegate. It has no delegate button: staking happens on the Wallet page, see [Staking & Validators](/dashboard/staking-and-validators).

## Innovations {#innovations}

- **The list follows the selected network.** The page asks for the set of the network chosen in the header, so mainnet viewers see the mainnet validators and testnet viewers see the testnet ones.
- **Yield read from the chain, with its limits attached.** The APY column is the chain's staking-tier base rate multiplied by (1 minus the validator's commission). It is shown with an asterisk and the note "variable, not guaranteed, lock bonuses not included". The figure is a live reading of a variable protocol rate, not a promise and not a forecast.
- **"From fees" past the emission cap.** A network past its emission cap shows **From fees** instead of a percentage, because no new QOR is minted and staking then earns from transaction fees only. On testnet the column currently reads **From fees**. An unknown value shows a dash, never 0.00%.
- **Rank by voting power.** The rank is computed from voting power, so rank 1 is the validator with the most stake.
- **Honest gaps.** Region, blocks proposed, software version and last seen are shown only when the data source supplies them, and unknown uptime reads **N/A** rather than 0%.

## How to use {#how-to-use}

1. Sign in and open the page by its address, `dashboard.qorechain.io/validators`. There is no sidebar link.
2. Choose the network in the header (**Mainnet** or **Testnet**); the page reloads with that network's validators.
3. Read the summary cards: **Active Validators**, **Total Bonded**, **Avg Commission** and **Avg Uptime**.
4. Search with the box "Search by moniker or address".
5. Read each row: the rank and moniker with the address (and a copy button), **Voting power** (stake and share of the total), **Commission**, **APY** and **Status** (active, jailed or inactive), then uptime and any optional details.
6. To delegate, go to the Wallet page's **Stake / Delegate** tab ([Delegate](/dashboard/staking-and-validators#delegate)). To look at a validator in more depth, open its address page in the [Explorer](/dashboard/explorer#validators).

:::caution Read the APY note
The percentage depends on a protocol rate that can change and on the validator's commission. Lock bonuses from the optional time-locked staking module are not included. Do not treat it as guaranteed income.
:::

## How to access {#how-to-access}

- **URL:** [dashboard.qorechain.io/validators](https://dashboard.qorechain.io/validators). It is reachable by address only; the sidebar does not list it.
- **Sign-in:** required. Signed out, the page shows "Authentication Required".
- **Network:** follows the header switch.
- **Wallet:** none needed to read the page.
- **Cost:** free.

## Where it is published {#where-published}

| Surface | Address | Networks | Sign-in |
| --- | --- | --- | --- |
| Validators page | `dashboard.qorechain.io/validators` | Mainnet and testnet, header switch | Required |
| Explorer validators table | `dashboard.qorechain.io/explorer/validators` | Mainnet and testnet | Not required |
| Chain data | `GET /cosmos/staking/v1beta1/validators` on `api.qore.host` and `api-testnet.qore.host` | Mainnet and testnet | None |

## Limits and known issues {#limits}

- **The page is read-only** and not linked from the sidebar.
- **APY is variable and not guaranteed.** It excludes lock bonuses, and shows **From fees** where the emission cap has been reached.
- **Fewer data fields than a node dashboard:** region, blocks proposed, software version and last seen are shown only when available, and uptime can read N/A.
- **Jailed validators** show as jailed and are not offered on the Delegate panel.
- **Data is cached for a short time** (about 30 seconds), so a change on chain can take a moment to appear.
