---
slug: /dashboard/faucet
title: Faucet
sidebar_label: Faucet
sidebar_position: 9
---

# Faucet

The **Faucet** gives you free test tokens so you can try the Dashboard without spending anything of value. It is a **testnet-only** tool — use it on testnet (`qorechain-diana`) to fund your address before testing transfers, swaps, staking, and contract deployment.

## Request test tokens

1. Connect to **testnet** and open the **Faucet**.
2. Enter the address to fund (`qor1...`). If your wallet is connected, select **Use my address** to fill it in automatically. The form confirms the address is valid before you can continue.
3. Select the request button. Funding is processed within seconds.

When the request succeeds, a confirmation card shows the amount sent and the transaction hash, with a copy button and a link to open the transaction in the [Explorer](/dashboard/explorer).

## Limits

Each address can request from the Faucet once per cooldown period. The page shows the exact amount per request and the cooldown before you can claim again. If you request again too soon, the Faucet tells you when you will next be eligible.

## What to do with test tokens

Test tokens let you exercise the network end to end on testnet:

- Send and receive on the [Wallet](/dashboard/wallet) page.
- Try a [swap](/dashboard/trade) on the AMM.
- [Delegate](/dashboard/staking-and-validators) to a validator.
- Deploy and test contracts before moving to mainnet.

:::note Test value only
Faucet tokens exist on testnet and have no real value. When you are ready for production use, switch to mainnet (`qorechain-vladi`).
:::
