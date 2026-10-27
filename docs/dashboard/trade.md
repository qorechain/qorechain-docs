---
slug: /dashboard/trade
title: Trade (DEX)
sidebar_label: Trade (DEX)
sidebar_position: 4
---

# Trade (DEX)

The **Trade** page (titled "QoreChain DEX") is a test-token swap screen with four tabs: **Swap**, **Pools**, **Add Liquidity** and **My Positions**. It is for trying a swap flow end to end with test tokens before real pools exist. For the design of QoreChain's native automated market maker, see [AMM & On-Chain Liquidity](/architecture/amm).

:::caution Test tokens only, for now
Everything on this page runs on **testnet**, whatever network the header shows. On mainnet the page is still gated by sign-in and the acknowledgement, but it shows `qorechain-diana` and testnet tokens. Only five QoreSwap test tokens settle on chain; everything else here is a practice area. QoreChain's native AMM module is live, but no pools have been created on either network yet (`GET /qorechain/amm/v1/pools` returns an empty list on both, checked 27 October 2026).
:::

## Innovations {#innovations}

- **On-chain swaps for five test tokens.** Swaps between WQOR, QUSDC, QUSDT, QWETH and QWBTC run against the QoreSwap AMM contract on the testnet EVM (chain ID 9800). The quote comes from the contract's `getAmountOut`.
- **Slippage enforced in the transaction.** The trade runs as an approve followed by `swapExactTokensForTokens`, with a minimum output derived from your slippage setting, signed by the test wallet's EVM key. If the price moves past your tolerance the swap reverts instead of filling at a worse price.
- **Test tokens on demand.** **Get test tokens** claims all five tokens, once every 12 hours per token.
- **Honest split between real and practice.** Other pairs, the Pools list, Add Liquidity and My Positions are a testnet practice area and are not on chain.

## How to use {#how-to-use}

Prerequisites: signed in and a test wallet (see [Wallet](/dashboard/wallet#testnet)). Without one the page shows "Wallet Required for Trading".

### Swap

1. The banner offers **Get test tokens**; use it first.
2. Pick the token you pay with and enter an amount. The default pair, QOR to USDC, is a **practice** pair that does not settle on chain. Pick **WQOR** and **QUSDC** (or any pair of the five) for an on-chain swap.
3. Pick the token to receive; the output is quoted automatically.
4. Optionally adjust **slippage tolerance** (default 0.5%).
5. Select **Swap Now**, then **Confirm Swap**. The result shows "Swap Confirmed" with **View Transaction**.

**Recent Swaps** lists swaps across all users; **Show My History** filters it to yours.

**Minimal example:** on testnet select **Get test tokens**, sell 10 WQOR for QUSDC, **Swap Now**, **Confirm Swap**.

:::tip Slippage
A higher tolerance makes a swap more likely to go through in fast-moving markets, but you may receive a worse price. The default suits most pairs.
:::

### Pools

Browse pool cards: trading pair, total liquidity, 24-hour volume, number of providers, and also an APR, a fee, a pool ID, a price and the reserves. A search box filters by token symbol. These are practice figures; do not read them as yields.

### Add Liquidity

1. Select two tokens to pair (one defaults to QOR). Use **Create Pool** for a new pair.
2. Enter an amount for the first token; the second fills in to match the pool ratio. The page notes "Minimum 1000 QOR required".
3. Review your share, then confirm.

### My Positions

Each entry shows the token pair, the amount of each token, your share and fees earned. To leave a position, select **Withdraw**, then **Request Withdrawal (x%)**; after a cooldown, select **Confirm Withdraw** (or **Cancel Withdrawal**). There is no single "Remove Liquidity" button.

## How to access {#how-to-access}

- **URL:** [dashboard.qorechain.io/trade](https://dashboard.qorechain.io/trade).
- **Account:** sign-in is required. A test wallet is needed to swap. On mainnet the one-time [acknowledgement](/dashboard/overview#risk-acknowledgement) is also required before the page opens.
- **Network:** testnet content only; the header switch does not change it.
- **Cost:** free. The test tokens come from **Get test tokens**; the test wallet pays gas in test QOR from the [Faucet](/dashboard/faucet).

## Where it is published {#where-published}

| Surface | Address | Network | Settles on chain? |
| --- | --- | --- | --- |
| Swap of WQOR, QUSDC, QUSDT, QWETH, QWBTC | `dashboard.qorechain.io/trade` | Testnet EVM, chain ID 9800 | Yes |
| Other pairs, Pools, Add Liquidity, My Positions | `dashboard.qorechain.io/trade` | Testnet | No, practice ledger |
| Native AMM | See [AMM](/architecture/amm) | Both networks | No pools exist yet |

## Limits and known issues {#limits}

- **No mainnet trading.** The page ignores the network switch and shows testnet content on mainnet too.
- **Only five tokens settle on chain.** The fest tokens from the [Faucet](/dashboard/faucet#fest-tokens) are not on this page.
- **The native AMM has no pools** on either network. Real pools will be described when they exist.
- **Practice figures** (prices, APR, volume) are not market data.
- **Testnet tokens have no value** and cannot be exchanged for anything.

## Related

- [AMM & On-Chain Liquidity](/architecture/amm) - pool types and pricing curves.
- [Wallet](/dashboard/wallet) - check balances before and after a swap.
