---
slug: /user-guide/gas-abstraction
title: Gas Abstraction
sidebar_label: Gas Abstraction
sidebar_position: 7
---

# Gas Abstraction

This page describes QoreChain's gas abstraction feature, whose design lets users pay transaction fees in an accepted non-native token instead of QOR. **It is not usable on either network today**; this page explains the design and what you do instead.

:::caution Not available yet
Paying fees in a non-native token does **not** work on mainnet (**`qorechain-vladi`**, node release **v3.2.1**) or on the testnet (**`qorechain-diana`**) today.

* The gas-abstraction queries are not served on mainnet: `qorechaind query gasabstraction accepted-tokens` prints its help text and the REST route `/qorechain/gasabstraction/v1/config` returns `Not Implemented`.
* No IBC channels are open on either network, so no `ibc/USDC` or `ibc/ATOM` balance can exist to pay with.
* The network fee floor is checked in `uqor`, so a fee in any other denomination is rejected.

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

## Overview

Gas abstraction is designed to remove the requirement to hold QOR for paying transaction fees. A user holding an accepted alternative token (for example an IBC-transferred stablecoin) would pay the fee in that token, and the protocol would convert the fee amount to its native equivalent before processing.

---

## Intended design

### Accepted tokens

The module's genesis configuration lists these tokens and protocol-defined conversion rates. They are exchange ratios for fee purposes, not market prices. Only `uqor` can exist on the networks today (see the notice above).

| Token              | Denomination | Conversion Rate |
| ------------------ | ------------ | --------------- |
| **QOR**            | `uqor`       | 1.0 (native)    |
| **USDC** (via IBC) | `ibc/USDC`   | 1.0             |
| **ATOM** (via IBC) | `ibc/ATOM`   | 10.0            |

### How it is meant to work

QoreChain's `GasAbstractionDecorator` sits in the transaction processing pipeline. For a transaction whose fee is in a non-native denomination:

1. **Fee inspection** — the decorator reads the fee denomination.
2. **Rate lookup** — if the denomination is in the accepted-tokens list, the corresponding conversion rate is looked up.
3. **Conversion** — the fee is converted to its native `uqor` equivalent.
4. **Standard processing** — the converted fee goes through the standard fee-deduction handler, so downstream fee handling (distribution to validators, burning, treasury, staker and light-node shares) operates on the native equivalent.

---

## Querying the configuration

Mainnet does not serve the gas-abstraction queries yet, and the `qor_getGasAbstractionConfig` JSON-RPC method is not served on any public endpoint (see [the `qor_` namespace](/api-reference/json-rpc-qor_-namespace)). There is currently no public way to read a live accepted-token list.
