---
slug: /user-guide/xqore-staking
title: xQORE Staking
sidebar_label: xQORE Staking
sidebar_position: 4
---

# xQORE Staking

This page describes the **designed** xQORE governance-staking mechanism, in which QOR holders would lock tokens for enhanced governance power under a PvP rebase model that rewards long-term participants. **xQORE cannot be used on either network today**; nothing on this page is something you can do yet.

:::warning Not live yet
xQORE is enabled in genesis but **not usable yet** on mainnet (`qorechain-vladi`, node release **v3.2.3**) or testnet (`qorechain-diana`, node release **v3.2.4**); neither release changes this (checked 20 October 2026). The node has no transaction, query, CLI or RPC entry point for it (the REST route `/qorechain/xqore/v1/params` returns `Not Implemented` on both networks), so there is no `tx xqore lock` / `unlock`, no `query xqore ...`, no xQORE REST route and no `qor_getXQOREPosition` method, no QOR can be locked, and nobody holds xQORE. It is planned for a future chain release, which will also change how exit penalties are redistributed so that unlocking stays cheap however many holders there are. The release will be named here when it ships.
:::

---

## Overview

In the design, locking QOR mints xQORE at a **1:1 ratio**, and xQORE counts at **double weight** in the QDRW voting-power formula:

```
VP = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)
```

QDRW itself is switched off on the live networks and governance votes are tallied on bonded stake alone (see [Governance](/user-guide/governance#voting-power)), so even once xQORE ships it will not change voting power until QDRW is enabled by a future release.

---

## Designed exit penalty schedule

The genesis configuration defines an exit penalty that falls the longer QOR has been locked:

| Lock Duration      | Exit Penalty |
| ------------------ | ------------ |
| Less than 30 days  | **50%**      |
| 30 to 90 days      | **35%**      |
| 90 to 180 days     | **15%**      |
| More than 180 days | **0%**       |

Under the design, penalties are **not burned** (`penalty_burn_rate` is `0`): the whole penalty is redistributed proportionally to the remaining xQORE holders (the "PvP rebase"). The redistribution mechanism is the part that will change in the release that wires xQORE in.

---

## What is not available

* **Locking and unlocking.** There are no `tx xqore` commands and no transaction type to lock or unlock QOR.
* **Positions.** There is no query for an xQORE position on any interface (CLI, REST or JSON-RPC), and `total_locked` and `total_xqore` are both zero.
* **Voting bonus.** There is no xQORE voting bonus today.

If you want to take part in governance now, delegate QOR to a validator (see [Staking and Delegation](/user-guide/staking-and-delegation)) and vote on proposals (see [Governance](/user-guide/governance)).

---

## Time-locked staking is a different feature (testnet only) {#staking-tiers}

Release **v3.2.4**, which runs on the testnet only (a mainnet upgrade to it is proposed: governance proposal 13, at height 3,742,566), adds a separate module, `x/stakingtier`, for **optional time-locked staking**. It is not xQORE: it mints no xQORE, does not change voting power and does not touch the xQORE parameters above. In outline:

* A delegator locks a delegation to a validator for a chosen term (the module offers 3, 6 and 12 months). While the lock runs, the locked amount cannot be undelegated or redelegated, through any message path (a transaction, authz, a contract or governance).
* Locks have a minimum size and a limit on how many one delegator may hold; read them with `GET /qorechain/stakingtier/v1/params`.
* An extra reward component defined by the module's parameters is credited per inflation epoch and claimed with a separate message. The size of that component is a module parameter and is not stated on this page.
* A lock can be released early. Early release forfeits what has accrued and unclaimed and carries a penalty, part of which is burned.
* Locks and the module account's state are readable at `/qorechain/stakingtier/v1/locks/{holder}` and `/qorechain/stakingtier/v1/pool`.

Nothing in this section exists on mainnet v3.2.3: `GET https://api.qore.host/qorechain/stakingtier/v1/params` returns `Not Implemented` there. Staking on mainnet is ordinary delegation, covered in [Staking and Delegation](/user-guide/staking-and-delegation).
