---
slug: /user-guide/gas-abstraction
title: Gas Abstraction
sidebar_label: Gas Abstraction
sidebar_position: 7
---

# Gas Abstraction

Gas abstraction lets a user pay a transaction fee in an accepted non-native token instead of QOR. The fee-conversion code is part of the chain, but **no non-native token is accepted on either network today**, so every fee is paid in QOR. This page explains what is live, how conversion works as built, and what you do instead.

:::caution Not usable yet: pay every fee in uqor
On mainnet (**`qorechain-vladi`**) and on the testnet (**`qorechain-diana`**), on node release **v3.2.4** and **v3.2.6** respectively, checked 27 October 2026:

* The live accepted-token list contains **only `uqor`**. Fee conversion switched on with v3.2.2, but nothing else is listed, the per-block conversion cap is `0` (conversion off) and the conversion float holds no balance. A fee paid in any other denomination is refused with a "denom not accepted for fee payment" error, in simulation as well as in a real transaction.
* No IBC channel exists on mainnet, and the testnet's single test channel does not make any `ibc/…` token an accepted fee token (the list is `uqor` only), so there is nothing but `uqor` to pay with.

Pay every fee in `uqor`. This page will be updated when a token is accepted on a live network.
:::

---

## What works today: pay fees in uqor

Every transaction pays at least **0.1 uqor per unit of gas**. Set the gas limit and the fee together:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --gas 400000 --fees 40000uqor \
  --chain-id qorechain-vladi --generate-only > tx.json
```

Then hybrid-sign and broadcast it with `qorechaind tx pqc cosign`, as described in [Transaction Commands](/cli-reference/transaction-commands#hybrid-signing). See [Fees and gas](/cli-reference/transaction-commands#fees-and-gas) for suggested limits per transaction type.

---

## The live configuration {#live-configuration}

The module serves its configuration over REST and gRPC. These are the values on both networks on 27 October 2026:

| Field | Value | Meaning |
| --- | --- | --- |
| `enabled` | `true` | Module switch |
| `native_denom` | `uqor` | The denomination every fee is finally paid in |
| `accepted_tokens` | `uqor` only | Tokens that may pay a fee. `uqor` needs no price source |
| `premium_bps` | `300` | The share of a converted fee's value that the float keeps to cover its price risk (3 %) |
| `max_tip_multiplier` | `3` | A converted fee may not exceed this multiple of the minimum fee for its gas; `0` would mean no bound |
| `float_min` | `0` | The native balance the float always keeps back |
| `block_conversion_cap` | `0` | The most the float pays out per block; `0` means conversion is off |

Earlier versions of this page showed `ibc/USDC` and `ibc/ATOM` placeholder entries with fixed rates. They are not in the live list.

Read it yourself:

```bash
qorechaind query gasabstraction config
qorechaind query gasabstraction accepted-tokens
qorechaind query gasabstraction conversion-rate uqor
qorechaind query gasabstraction float

curl -s https://api.qore.host/qorechain/gasabstraction/v1/config
curl -s "https://api.qore.host/qorechain/gasabstraction/v1/conversion_rate?denom=uqor"
curl -s https://api.qore.host/qorechain/gasabstraction/v1/float
```

`conversion_rate` reports `rate`, `effective_rate` (the rate less the premium), `price_source`, and whether the token is `usable` at this height, with a `reason` when it is not. `float` reports the float's address and balances and the current block's usage against `block_cap`. The `qor_getGasAbstractionConfig` JSON-RPC method is not served on any public endpoint (see [the `qor_` namespace](/api-reference/json-rpc-qor_-namespace)); use REST or gRPC.

---

## How conversion works (as built) {#how-it-works}

Since v3.2.2 the fee decorator routes each transaction down one of two paths:

* A fee in `uqor`, or in more than one denomination, takes the **native path**, unchanged.
* A fee in **exactly one** non-native denomination takes the **conversion path**.

On the conversion path:

1. **Accepted?** The denomination must be in the accepted-token list and have a price source, or the transaction is refused.
2. **Price.** The token's price comes from one of two sources: a governance-set static rate that expires at a stated block height, or the time-weighted average price of the [AMM](/architecture/amm) pool that pairs the token with QOR. A pool price is used only if the pool is active, holds at least the configured minimum liquidity on the QOR side, and its spot price is within the configured deviation of its average.
3. **Value.** The fee's native value is the token amount times the price, less the premium.
4. **Same rules as a native fee.** The native minimum-fee and dynamic-fee rules are applied to that native value, so a converted fee must clear exactly what a QOR fee must clear (0.1 uqor per unit of gas as a floor), and is bounded by `max_tip_multiplier`.
5. **Settlement.** The payer's tokens go to the gas-abstraction module's **float**, and the float pays the native value in `uqor` to the fee collector. Everything downstream of the fee collector (burning, validator, staker, treasury and light-node shares) therefore only ever sees `uqor`.

Conversion is bounded three ways: per transaction (`max_tip_multiplier`), per block (`block_conversion_cap`) and by the balance the float always keeps (`float_min`). Every refusal also happens during simulation, so gas estimation fails the same way the real transaction would.

### Getting a token accepted

* **Governance** replaces the configuration with `MsgUpdateConfig` (authority: the governance module account). That is how a real `ibc/<hash>` fee token and its pool or static rate would be added and conversion opened.
* **The float** is a module account that refuses ordinary bank sends. It is funded with `MsgFundFloat` (`qorechaind tx gasabstraction fund-float <amount>uqor`), for example by an account that received a community-pool spend for the purpose.

No proposal to do either has been made on mainnet, and the list stays `uqor`-only until one passes.
