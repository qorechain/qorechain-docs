---
slug: /architecture/amm
title: AMM & On-Chain Liquidity
sidebar_label: AMM & On-Chain Liquidity
sidebar_position: 8
---

# AMM & On-Chain Liquidity

The `x/amm` module is QoreChain's native, on-chain automated market maker (AMM). It lets anyone create liquidity pools, provide liquidity, and swap between QoreChain-native assets directly at the protocol level — no off-chain order book and no external smart-contract DEX required. It is the on-chain settlement layer behind the **Dashboard Trade / DEX** experience.

Pools follow familiar AMM pricing curves:

- **`constant_product`** — the `x*y=k` curve (general-purpose pairs).
- **`stable_swap`** — a low-slippage curve for closely-pegged pairs, tuned by an amplification coefficient.

All amounts use QoreChain's native units. The staking and fee token is **QOR**, whose base denom is **uqor** (1 QOR = 10^6 uqor). Pool participants and addresses use the `qor` bech32 prefix.

:::note
Commands below use `qorechaind`. Append the usual transaction flags (`--from`, `--chain-id`, `--gas`, `--fees`, `--node`) for your environment — for example `--chain-id qorechain-vladi` against mainnet.
:::

## Pools and LP shares

A pool holds reserves of two denoms (`token_a`, `token_b`, stored in sorted order) and mints **LP tokens** that represent a proportional claim on those reserves. Each pool has a numeric `id`, a `type`, a `status` (`active` or `paused`), and its own LP denom. When you add liquidity you receive LP tokens; when you remove liquidity you burn them to redeem your share of the reserves.

### Create a pool

`create-pool` takes a pool type and the two initial deposits (as coins). For a stable pair, set the amplification coefficient with `--amp`.

```bash
# Constant-product pool seeded with QOR and a bridged USD asset
qorechaind tx amm create-pool constant_product 1000000000uqor 1000000000uusdc \
  --from qor1youraddr... --chain-id qorechain-vladi

# Stable-swap pool with an amplification coefficient
qorechaind tx amm create-pool stable_swap 1000000000uusdc 1000000000uusdt \
  --amp 200 --from qor1youraddr... --chain-id qorechain-vladi
```

### Add liquidity

`add-liquidity` deposits both sides into a pool and mints LP tokens. The final argument is the minimum LP amount you will accept — your protection against the pool ratio shifting before your transaction lands.

```bash
qorechaind tx amm add-liquidity 1 500000000uqor 500000000uusdc 100000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

### Remove liquidity

`remove-liquidity` burns LP tokens and withdraws reserves. The two `min` arguments set the minimum amount of each side you will accept back.

```bash
qorechaind tx amm remove-liquidity 1 100000 490000000 490000000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

## Swaps

The AMM supports the two standard swap directions.

### Exact-in

`swap-exact-in` spends a fixed input amount and returns however much output the curve yields, subject to a minimum-out floor (slippage protection).

```bash
# Spend exactly 1,000,000 uqor for uusdc, refusing anything below 990,000 uusdc out
qorechaind tx amm swap-exact-in 1 1000000uqor uusdc 990000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

### Exact-out

`swap-exact-out` requests a fixed output amount and spends however much input is required, subject to a maximum-in ceiling.

```bash
# Receive exactly 1,000,000 uusdc, spending at most 1,010,000 uqor
qorechaind tx amm swap-exact-out 1 uqor 1000000uusdc 1010000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

The trailing `min-out` / `max-in` argument on every swap is the slippage guard: set it from a fresh quote (below) plus your tolerance, and the transaction reverts if the executed price would breach it.

## Quotes (price preview)

Quotes are read-only — they preview a swap without submitting it, so a client can show an expected output and fee before the user signs. They are the natural backing for a Trade UI's price field.

```bash
# Preview the output of spending 1,000,000 uqor into pool 1
qorechaind query amm quote-exact-in 1 uqor 1000000
# -> returns amount_out and fee

# Preview the input needed to receive 1,000,000 uusdc from pool 1
qorechaind query amm quote-exact-out 1 uusdc 1000000
# -> returns amount_in and fee
```

The returned `fee` is the swap fee the AMM applies to the trade. Fee and slippage levels are pool/parameter-driven; use the quote endpoints to see their concrete effect on any given trade rather than computing them by hand.

## Inspecting pools and balances

All of these are read-only queries that anyone can run.

```bash
# Module parameters
qorechaind query amm params

# A single pool by ID
qorechaind query amm pool 1

# Every pool
qorechaind query amm pools

# Resolve a pool from its denom pair (order-independent)
qorechaind query amm pool-by-denoms uqor uusdc

# An account's LP balance in a pool
qorechaind query amm lp-balance 1 qor1youraddr...
```

`pool` returns the pool's reserves, LP supply, type, status, and a running weighted-average price. `lp-balance` returns the LP token `balance` an account holds for that pool.

## Pausing and resuming a pool

Pools can be paused and resumed by the pool authority (the address passed via `--from`). A paused pool rejects swaps and liquidity changes until it is resumed — useful for incident response or coordinated maintenance.

```bash
# Pause pool 1 with a human-readable reason
qorechaind tx amm pause-pool 1 "scheduled maintenance" \
  --from qor1authority... --chain-id qorechain-vladi

# Resume pool 1
qorechaind tx amm resume-pool 1 \
  --from qor1authority... --chain-id qorechain-vladi
```

## Command summary

**Transactions** (`qorechaind tx amm …`):

| Command | Purpose |
| --- | --- |
| `create-pool` | Create a `constant_product` or `stable_swap` pool |
| `add-liquidity` | Deposit reserves and mint LP tokens |
| `remove-liquidity` | Burn LP tokens and withdraw reserves |
| `swap-exact-in` | Swap a fixed input amount |
| `swap-exact-out` | Swap to a fixed output amount |
| `pause-pool` | Pause a pool (authority) |
| `resume-pool` | Resume a paused pool (authority) |

**Queries** (`qorechaind query amm …`):

| Command | Purpose |
| --- | --- |
| `params` | Show module parameters |
| `pool` | Show one pool by ID |
| `pools` | List all pools |
| `pool-by-denoms` | Resolve a pool from its denom pair |
| `lp-balance` | An account's LP balance in a pool |
| `quote-exact-in` | Preview output for a fixed-input swap |
| `quote-exact-out` | Preview input for a fixed-output swap |

## Related

- The **Dashboard Trade / DEX** surfaces these pools, quotes, and swaps in a graphical interface for everyday users.
- For how QOR supply, fees, and value flow through the chain, see [Tokenomics](/architecture/tokenomics).
- Try swaps yourself in the [Trade / DEX](/dashboard/trade) interface.
- To bring assets onto QoreChain first, see [Bridging Assets](/user-guide/bridging-assets).
