---
slug: /user-guide/token-operations
title: Token Operations
sidebar_label: Token Operations
sidebar_position: 1
---

# Token Operations

This guide covers the QOR token, how to send and receive tokens, query balances, and understand the fee distribution model on QoreChain.

:::note
The commands below use the **`qorechain-diana`** testnet (EVM chain ID **9800**). Mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) has been live since 7 June 2026 and runs release **v3.2.4** since 23 October 2026; the testnet runs **v3.2.6** (since 27 October 2026) — substitute the mainnet chain ID and endpoints from the **Connecting to Mainnet** page when transacting on mainnet.
:::

:::caution Sign with `tx pqc cosign`
Mainnet and testnet require a hybrid post-quantum signature on every Cosmos-lane transaction, so the commands on this page do not broadcast as written. Add `--generate-only > tx.json` to a command, then run `qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id <chain-id>`. See [Hybrid signing](/cli-reference/transaction-commands#hybrid-signing). [QoreX](/qorex/overview) and the [Dashboard](/dashboard/overview) do this signing for you.
:::

## Token Information

| Property                 | Value                         |
| ------------------------ | ----------------------------- |
| **Display Denomination** | QOR                           |
| **Base Denomination**    | uqor                          |
| **Conversion**           | 1 QOR = 1,000,000 uqor (10^6) |
| **Chain ID**             | `qorechain-vladi` (mainnet) / `qorechain-diana` (testnet) |
| **Bech32 Prefix**        | `qor` (e.g., `qor1abc...xyz`) |

All on-chain amounts are denominated in **uqor**. When submitting transactions, always specify amounts in uqor.

## Sending Tokens

To transfer QOR tokens from one account to another:

```bash
qorechaind tx bank send <from_address> <to_address> <amount>uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**Example:** Send 5 QOR (5,000,000 uqor) to another address:

```bash
qorechaind tx bank send qor1sender... qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

You can also use a key name instead of a raw address for the sender:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

## Querying Balances

Check the balance of any account:

```bash
qorechaind query bank balances <address>
```

**Example:**

```bash
qorechaind query bank balances qor1abc...xyz
```

**Sample output:**

```yaml
balances:
- amount: "15000000"
  denom: uqor
pagination:
  next_key: null
  total: "0"
```

This indicates the account holds 15 QOR (15,000,000 uqor).

## Fee Structure

Transaction fees on QoreChain are distributed across five destinations to align network incentives:

| Destination     | Share | Purpose                                                         |
| --------------- | ----- | --------------------------------------------------------------- |
| **Validators**  | 37%   | Rewards block producers and secures the network                 |
| **Burned**      | 30%   | Permanently removed from supply                                 |
| **Treasury**    | 20%   | Funds protocol development and ecosystem grants                 |
| **Stakers**     | 10%   | Distributed proportionally to all delegators                    |
| **Light Nodes** | 3%    | Light-node rewards (see the note below)                         |

The split applies to everything that enters the fee collector, which holds transaction fees and the staking emission minted each epoch. The light-node share accrues to the light-node reward pool; registration is open and licence-gated, but no light node has registered yet, so no node is paid from it today (see [Light Node](/light-node/overview#reward-program-status)). Since the v3.2.0 upgrade the staker share is paid out as a normal staking reward (see [Tokenomics](/architecture/tokenomics#stranded-and-reserve)).

## Burn Channels

QoreChain's burn module defines 12 burn sources. QOR burned through any of them is permanently removed from circulation. On mainnet only the gas-fee and failed-transaction channels have recorded burns so far; the others are defined but have recorded nothing. From v3.2.4 (testnet since 19 October 2026, mainnet since 23 October 2026) there is a thirteenth source, `staking_tier_penalty`, for the optional time-locked staking module.

| Channel            | Description                                                                      |
| ------------------ | -------------------------------------------------------------------------------- |
| `gas_fee`          | 30% of all gas fees are burned                                                   |
| `contract_create`  | Flat 100 QOR fee burned per contract creation (inactive: QoreChain Native upload is closed) |
| `ai_service`       | 50% of AI service fees burned (inactive: AI service fees are not live)           |
| `bridge_fee`       | 100% of bridge fees burned (inactive: the bridge is not live)                    |
| `treasury_buyback` | Periodic buyback-and-burn from the treasury                                      |
| `failed_tx`        | 10% of the gas of failed transactions; applied by the chain since v3.2.2         |
| `xqore_penalty`    | xQORE early-exit penalties routed through burn (xQORE is not live)               |
| `auto_buyback`     | Protocol-level automated burns (inactive)                                        |
| `tge`              | Reserved; the TGE burn happened before genesis and this channel records nothing  |
| `rollup_create`    | 1% of the rollup creation stake is burned                                        |
| `milestone`        | Scheduled burns at fixed cumulative transaction counts (none triggered yet)      |
| `amm`              | Reserved for AMM protocol fees (none recorded)                                   |

The burn module has no CLI query; read the cumulative burn per source from REST:

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stats
```

The response lists `total_burned` and `burns_by_source` (in uqor). Current total supply is `qorechaind query bank total-supply-of uqor`.

## Tips

:::caution
Always double-check recipient addresses before sending tokens. Transactions on QoreChain are irreversible.
:::

:::tip

* Use the `--dry-run` flag to simulate a transaction without broadcasting it.
* Set `--gas` explicitly (400,000 is enough for a hybrid-signed transfer).
* The fee floor is **0.1 uqor per unit of gas**, so a 400,000 gas limit needs at least **40,000 uqor**.

:::
