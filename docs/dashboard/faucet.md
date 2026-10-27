---
slug: /dashboard/faucet
title: Faucet
sidebar_label: Faucet
sidebar_position: 9
---

# Faucet

The **Faucet** gives you free test tokens so you can try the Dashboard without spending anything of value. It is a **testnet-only** tool — use it on testnet (`qorechain-diana`) to fund your address before testing transfers, swaps, staking, and contract deployment.

:::caution Testnet only — no real value
Testnet QOR has **no real value**. The Faucet never touches mainnet: there is no faucet for mainnet QOR, and nothing you claim here can be moved to mainnet.
:::

## Request test tokens

1. Sign in, switch the Dashboard to **testnet**, and open the **Faucet**.
2. Enter the address to fund (`qor1...`). If your wallet is connected, select **Use my address** to fill it in automatically. The form confirms the address is valid before you can continue.
3. Select the request button. Funding is processed within seconds.

When the request succeeds, a confirmation card shows the amount sent and the transaction hash, with a copy button and a link to open the transaction in the [Explorer](/dashboard/explorer). Since 27 October 2026 a claim can also pay the three [Fest test tokens](#fest-tokens); the card then has a **Fest tokens** row listing what arrived, or a short note if only the QOR went through.

## Limits

Each address can request from the Faucet once per cooldown period. The page shows the exact amount per request and the cooldown before you can claim again. If you request again too soon, the Faucet tells you when you will next be eligible.

## Fest test tokens (fUSD, fETH, fBTC) {#fest-tokens}

Three extra test tokens exist on the testnet for the builder fest: **fUSD** (FestUSD, 6 decimals), **fETH** (FestETH, 18 decimals) and **fBTC** (FestBTC, 8 decimals). They are plain test tokens with no value and no link to any real asset. Testnet governance registered them with the ERC-20 module (testnet proposal 26), so each one exists both as an ERC-20 contract on the testnet EVM and as a bank coin that wallets and the AMM can hold. The Faucet is configured to send some of each with a QOR claim (at the time of writing, 27 October 2026: 1,000 fUSD, 0.5 fETH and 0.02 fBTC, on the same 24-hour cooldown as the QOR); the page shows the exact amounts next to the QOR amount whenever the Faucet pays them.

| Token | Decimals | ERC-20 contract on the testnet EVM | Bank denomination (case-sensitive) |
| --- | --- | --- | --- |
| fUSD | 6 | `0x97143B771D34ddb9130b807b135Ae675A5a963CA` | `erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA` |
| fETH | 18 | `0x02292293c13880a26242690eb70a0e42B8E91c28` | `erc20:0x02292293c13880a26242690eb70a0e42B8E91c28` |
| fBTC | 8 | `0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` | `erc20:0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` |

Things to know:

- **Testnet only.** The tokens do not exist on mainnet.
- **Copy the denomination exactly.** The address part is in EIP-55 mixed case and the denomination is matched case-sensitively.
- **See them on chain.** `GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata` lists the three denominations with their symbols and display names.
- **Converting between the two forms.** Moving an ERC-20 balance into bank coins (`MsgConvertERC20`) needs the sender as a `qor1...` bech32 address.
- **Pools.** The testnet [AMM](/architecture/amm) can pool them against `uqor`; whether a pool exists is shown by `GET /qorechain/amm/v1/pools`. The [Wallet](/dashboard/wallet) and [Trade](/dashboard/trade) pages have no dedicated entry for them; check a balance with `GET /cosmos/bank/v1beta1/balances/{address}`.

## What to do with test tokens

Test tokens let you exercise the network end to end on testnet:

- Send and receive on the [Wallet](/dashboard/wallet) page.
- Try a [swap](/dashboard/trade) on the AMM.
- [Delegate](/dashboard/staking-and-validators) to a validator.
- Deploy and test contracts before moving to mainnet.

:::note Test value only
Faucet tokens exist on testnet and have no real value. When you are ready for production use, switch to mainnet (`qorechain-vladi`).
:::
