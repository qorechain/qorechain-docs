---
slug: /dashboard/faucet
title: Faucet
sidebar_label: Faucet
sidebar_position: 9
---

# Faucet

The **Faucet** pays free test tokens to a testnet address so you can try the Dashboard, wallets and contracts without spending anything of value. It is for anyone who needs testnet QOR (and, during the builder fest, three test tokens) to test transfers, swaps, staking tools and contract deployment on testnet `qorechain-diana`.

:::caution Testnet only, no real value
Testnet QOR has **no real value**. The Faucet never touches mainnet: there is no faucet for mainnet QOR, and nothing you claim here can be moved to mainnet.
:::

## Innovations {#innovations}

- **One claim, two kinds of token.** A claim pays 100 QOR, and in a separate transaction 1,000 fUSD, 0.5 fETH and 0.02 fBTC. If the fest send fails, the QOR still arrives and the result card says so.
- **A double cooldown.** One claim per 24 hours per account **and** per address. The slot is reserved before anything is sent and released if the send fails, so a failed claim does not use up your day.
- **Fest tokens are native bank coins.** They are `erc20:0x...` bank denominations that the on-chain AMM, bank sends, IBC and QoreChain Native contracts use as they are. MetaMask or an EVM DEX see them only after a `MsgConvertCoin` conversion (see [Fest test tokens](#fest-tokens)).
- **A `0x` recipient is paid on its `qor1` twin.** A `0x` address is the same 20 bytes as its `qor1` form, so the service pays the same account. The Dashboard form itself only accepts `qor1...`.

## How to use {#how-to-use}

1. **Sign in.** Signed out, the page shows "Sign in to access the faucet."
2. Open **Faucet**. In **Request Tokens**, under **Wallet Address**, use "Select a wallet" or **Use my address ->** to fill in one of your Dashboard wallets, or type a `qor1...` address.
3. The info line reads "You can request 100 QOR once every 24 hours" plus the fest amounts.
4. Select **Request Tokens**.
5. On success the card shows **Tokens Sent!** with the amount, a **Fest tokens** row (what arrived, or a short note if only the QOR went through), the transaction hash with a copy button, and **View on Explorer**.
6. Claiming again too soon shows "Rate Limit Reached" and "Rate limited for another HH:MM".

The address check in the form is light: it looks for the `qor` prefix and a length of at least 10 characters, and it rejects `0x...` input. Check the address yourself before you send.

A faucet claim also counts toward faucet [quests](/dashboard/quests).

**Minimal example:** sign in, open Faucet, select **Use my address ->**, select **Request Tokens**, then **View on Explorer** with the header on Testnet.

### Fest test tokens (fUSD, fETH, fBTC) {#fest-tokens}

Three extra test tokens exist on the testnet for the builder fest: **fUSD** (FestUSD, 6 decimals), **fETH** (FestETH, 18 decimals) and **fBTC** (FestBTC, 8 decimals). They have no value and no link to any real asset. Testnet governance registered them with the ERC-20 module (testnet proposal 26), so each exists both as an ERC-20 contract on the testnet EVM and as a bank coin that wallets and the AMM can hold. The Faucet is configured to send some of each with a QOR claim (at the time of writing, 27 October 2026: 1,000 fUSD, 0.5 fETH and 0.02 fBTC, on the same 24-hour cooldown); the page shows the exact amounts next to the QOR amount whenever it pays them. The fest tokens arrive in a separate transaction; its hash is not shown on the card.

| Token | Decimals | ERC-20 contract on the testnet EVM | Bank denomination (case-sensitive) |
| --- | --- | --- | --- |
| fUSD | 6 | `0x97143B771D34ddb9130b807b135Ae675A5a963CA` | `erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA` |
| fETH | 18 | `0x02292293c13880a26242690eb70a0e42B8E91c28` | `erc20:0x02292293c13880a26242690eb70a0e42B8E91c28` |
| fBTC | 8 | `0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` | `erc20:0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` |

- **Testnet only.** The tokens do not exist on mainnet.
- **Copy the denomination exactly.** The address part is in EIP-55 mixed case and the denomination is matched case-sensitively.
- **See them on chain.** `GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata` lists the three denominations with their symbols and display names.
- **Using them from MetaMask or an EVM DEX.** The Faucet pays bank coins. To hold one as an ERC-20 for MetaMask or an EVM DEX, convert it with `MsgConvertCoin` (sender your `qor1...` address, receiver a `0x...` address, and the exact mixed-case denomination). Moving it back is `MsgConvertERC20`. Steps and gas figures are in [EVM Development](/developer-guide/evm-development#fest-tokens).
- **Pools.** The testnet [AMM](/architecture/amm) can pool them against `uqor`; whether a pool exists is shown by `GET /qorechain/amm/v1/pools`. The [Wallet](/dashboard/wallet) Tokens tab and [Trade](/dashboard/trade) have no entry for them; check a balance with `GET /cosmos/bank/v1beta1/balances/{address}`.

### What to do with test tokens

- Send and receive on the [Wallet](/dashboard/wallet) page.
- Try a [swap](/dashboard/trade) with the QoreSwap test tokens.
- Deploy and test contracts from the [Smart Contract Creator](/dashboard/smart-contract-creator) before moving to mainnet.
- Test a node or validator setup against testnet with the tools on [Nodes & Validators](/dashboard/tools-hub).

## How to access {#how-to-access}

- **URL:** [dashboard.qorechain.io/faucet](https://dashboard.qorechain.io/faucet).
- **Account:** sign-in is required. No wallet connection is needed; you can paste any `qor1...` address.
- **Network:** the Faucet **always pays on testnet** `qorechain-diana`, whatever the header says. You do not need to switch the header to testnet to claim. Switch it to testnet only so that **View on Explorer** opens the right network; with the header on mainnet that link shows "Transaction Not Found".
- **Cost:** free.

## Where it is published {#where-published}

| Surface | Address | Network | Account |
| --- | --- | --- | --- |
| Faucet page | `dashboard.qorechain.io/faucet` | Testnet `qorechain-diana` only | Sign-in required |
| Fest token metadata | `api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata` | Testnet | None |

## Limits and known issues {#limits}

- **100 QOR once every 24 hours**, per account and per address. The fest tokens follow the same cooldown.
- **No mainnet faucet.** Testnet QOR is never exchangeable for mainnet QOR.
- **The form rejects `0x` addresses** and only does a light `qor` check.
- **The fest send can fail on its own;** the QOR is still paid and the card says so. Wait for the cooldown or check your balance before retrying.
- **Fest tokens do not show** in the Wallet Tokens tab.
