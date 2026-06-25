---
slug: /dashboard/trade
title: Trade (DEX)
sidebar_label: Trade (DEX)
sidebar_position: 4
---

# Trade (DEX)

The **Trade** page is the Dashboard's decentralized exchange. It lets you swap tokens and provide liquidity directly on QoreChain's native on-chain automated market maker (AMM) — no off-chain order book and no external smart contract required. Swaps and liquidity actions settle at the protocol level. For the design behind it, see [AMM & On-Chain Liquidity](/architecture/amm).

Connect your wallet to trade — see [Overview & Getting Started](/dashboard/overview#connect-your-wallet).

The page has four tabs: **Swap**, **Pools**, **Add Liquidity**, and **My Positions**.

## Swap

Exchange one token for another:

1. Choose the token you are paying with and enter an amount.
2. Choose the token you want to receive — the output amount is quoted automatically.
3. Optionally adjust your **slippage tolerance** (the maximum price movement you will accept; default 0.5%).
4. Select **Swap** and confirm.

A swap history panel lists your past swaps with the tokens, amounts, rate, time, and status.

:::tip Slippage
A higher slippage tolerance makes a swap more likely to go through in fast-moving markets, but you may receive a less favorable price. The default suits most pairs.
:::

## Pools

Browse the available liquidity pools. Each pool card shows the trading pair, total liquidity, 24-hour volume, APR, and the number of providers. A search box filters pools by token symbol.

## Add Liquidity

Provide liquidity to earn a share of swap fees:

1. Select the two tokens to pair (one defaults to QOR).
2. Enter an amount for the first token — the second amount fills in automatically to match the current pool ratio.
3. Review your projected share of the pool, then select **Add Liquidity** and confirm.

You receive liquidity provider (LP) tokens representing your position.

## My Positions

View the liquidity positions you hold. Each entry shows the token pair, the amount in each token, your share of the pool, fees earned, and APR. Select **Remove Liquidity** on a position to preview the tokens you would receive and withdraw your share.

## Related

- [AMM & On-Chain Liquidity](/architecture/amm) — pool types and pricing curves.
- [Wallet](/dashboard/wallet) — check balances before and after a swap.
