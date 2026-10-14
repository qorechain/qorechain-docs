---
slug: /dashboard/trade
title: Trade (DEX)
sidebar_label: Trade (DEX)
sidebar_position: 4
---

# Trade (DEX)

The **Trade** page is the Dashboard's token-swap screen: swap one token for another and provide liquidity to a pool, with no off-chain order book. For the design of QoreChain's native automated market maker (AMM), see [AMM & On-Chain Liquidity](/architecture/amm).

:::caution Test tokens only, for now
The pools and tokens on this page are test tokens: swaps run against a swap contract deployed on the testnet EVM, and the page has a **Get test tokens** button for them. Treat nothing shown here as real-value liquidity or as a market price. QoreChain's native AMM module is live, but no pools have been created on either network yet. This page will be updated when real pools are available.
:::

Trading needs a signed-in account and a wallet — see [Sign in](/dashboard/overview#sign-in) and [Connect your wallet](/dashboard/overview#connect-your-wallet).

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

Browse the available liquidity pools. Each pool card shows the trading pair, total liquidity, 24-hour volume, and the number of providers. A search box filters pools by token symbol.

## Add Liquidity

Provide liquidity to a pool and receive a share of its swap fees:

1. Select the two tokens to pair (one defaults to QOR).
2. Enter an amount for the first token — the second amount fills in automatically to match the current pool ratio.
3. Review your projected share of the pool, then select **Add Liquidity** and confirm.

You receive liquidity provider (LP) tokens representing your position.

## My Positions

View the liquidity positions you hold. Each entry shows the token pair, the amount in each token, your share of the pool, and fees earned. Select **Remove Liquidity** on a position to preview the tokens you would receive and withdraw your share.

## Related

- [AMM & On-Chain Liquidity](/architecture/amm) — pool types and pricing curves.
- [Wallet](/dashboard/wallet) — check balances before and after a swap.
