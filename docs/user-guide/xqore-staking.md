---
slug: /user-guide/xqore-staking
title: xQORE Staking
sidebar_label: xQORE Staking
sidebar_position: 4
---

# xQORE Staking

This page describes the **designed** xQORE governance-staking mechanism, in which QOR holders would lock tokens for enhanced governance power under a PvP rebase model that rewards long-term participants. **xQORE cannot be used on either network today**; nothing on this page is something you can do yet.

:::warning Not live yet
xQORE is enabled in genesis but **not usable yet** on mainnet (`qorechain-vladi`, node release **v3.2.1**) or testnet (`qorechain-diana`). The node has no transaction, query, CLI or RPC entry point for it, so there is no `tx xqore lock` / `unlock`, no `query xqore ...`, no xQORE REST route and no `qor_getXQOREPosition` method, no QOR can be locked, and nobody holds xQORE. It is planned for a future chain release, which will also change how exit penalties are redistributed so that unlocking stays cheap however many holders there are. The release will be named here when it ships.
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
