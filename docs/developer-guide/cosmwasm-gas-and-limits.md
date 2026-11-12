---
slug: /developer-guide/cosmwasm-gas-and-limits
title: CosmWasm Gas, Pricing and Upload Limits
sidebar_label: CosmWasm Gas and Limits
sidebar_position: 6
---

# CosmWasm Gas, Pricing and Upload Limits

QoreChain Native contracts (QoreChain's name for its CosmWasm runtime) are priced by what they cost a validator to run. From release **v3.2.8** the price of a contract call depends on three things: whether the contract code is already loaded in memory for the current block, how busy the block is with contract work, and how much memory the call touches. Code uploads are bounded in size and shape.

:::note Testnet first
v3.2.8 has run on the **`qorechain-diana`** testnet since 12 November 2026. Mainnet (`qorechain-vladi`) applies it with a later governance upgrade, so the figures below describe the testnet today and the mainnet after that upgrade. Every command uses `--chain-id qorechain-diana`; substitute `qorechain-vladi` once mainnet has upgraded.
:::

## Why it matters {#why}

- A contract call that worked with a fixed gas limit yesterday can run out of gas today, because the first call of a code in a block costs several times more than a repeat. A fixed limit is a guess that fails at the worst moment.
- Fees follow load. When blocks are full of contract calls the price of contract execution rises, and it falls back when they are not.
- Every block has a limited amount of contract work. A call that does not fit fails and pays its fee as any failed transaction does.

The short rule: **simulate, multiply the result by at least 1.3, and never hardcode gas for a contract call.**

## The gas model {#gas-model}

### Code load cost {#code-load}

Before a contract runs, its compiled code must be loaded. The first call of a code in a block pays for that load. Calls to the same code later in the same block are cheap, because the code is already in memory.

| Call | Approximate gas |
| ---- | --------------- |
| cw20 `transfer`, first call of the code in a block (one message, measured gas used) | 585,151 |
| cw20 `transfer`, three calls in one transaction, so two repeats in the same block (measured gas used, total) | 646,169 |
| The same single call, as reported by the simulation | 591,280 |

These numbers were measured on the testnet on 12 November 2026 with the reviewed cw20 code that governance stored (congestion factor 1x). A repeat of the same code in the same block adds only about 30,500 gas in practice. The simulation reports more than a transaction uses, because it always charges the cold load and adds a margin for congestion: three calls simulated at 1,326,504 and used 646,169. The figures depend on the code and the call, so measure your own contract. In detail, the load is charged in full on the first call of a code in a block, the next eight calls to that code in the same block pay no load, and each later call in the block pays an eighth of it. The set of loaded codes starts empty at every block, so every validator charges the same calls. This applies to instantiate, execute, migrate, and to calls made from another contract or from the cross-VM bridge.

**Pinned codes skip the load charge.** Governance can pin a popular code so that validators keep it loaded, and calls to a pinned code never pay the load cost. Check which codes are pinned:

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/codes/pinned
```

### Call setup and memory {#setup}

Every call also pays a small setup charge (a base cost, a cost per 64 KiB page of initial memory and a cost per data segment) and a charge for each page of memory it grows. Contracts that keep memory small are cheaper.

### Congestion pricing {#congestion}

Contract execution gas is multiplied by a **congestion factor**.

| Property | Value |
| -------- | ----- |
| Range | 1x up to 20x by default |
| Governance ceiling | Governance can set the maximum up to 100x |
| When it rises | Only when blocks are full: after a block that used more than half of its contract budget (the default target) the factor rises, and it rises faster when the budget was exhausted |
| When it falls | After a block that used less than the target |

The factor scales contract execution only. Storage, call setup and code upload are not multiplied. The factor was 1x when the transfers above were measured.

Read the live values:

```bash
qorechaind query crossvm params --node https://rpc-testnet.qore.host:443
```

The fields to look at are `wasm_congestion_factor_micro` (the factor in force, in millionths, so `1000000` is 1x), `wasm_congestion_max_factor`, `wasm_congestion_target_bps`, `max_block_wasm_gas` and `max_tx_wasm_share_bps`.

### The per-block contract budget {#budget}

Each block has a budget of contract work. The defaults are:

| Parameter | Default | Meaning |
| --------- | ------- | ------- |
| `max_block_wasm_gas` | 3,000,000 | Contract execution all transactions together may use in one block |
| `max_tx_wasm_share_bps` | 5,000 (half) | The share of that budget one transaction may use, so 1,500,000 at the default |
| `queue_wasm_reserve_bps` | 2,500 | Share of the budget reserved for queued asynchronous cross-VM calls |

When the budget refuses a transaction's contract work, the transaction fails ("block wasm gas budget exhausted") and pays its fee like any failed transaction. Retry in the next block, which starts with a full budget. A priority fee helps you land early in a block, before the budget is spent. A single call that needs more than one transaction's share cannot run until governance raises the budget or the share.

### Simulation and the safety margin {#simulation}

A simulation **always charges the cold load**, as if your call were the first of its code in the block, and it prices execution at the congestion factor the next block will use plus two steps of rise (about 2.25x on the execution part). An estimate therefore survives a couple of blocks of rising load. It is never too low for a first call.

Because of this, use this rule for every contract message:

1. Simulate the transaction.
2. Multiply the simulated gas by **at least 1.3**.
3. Use the result as the gas limit, and do not exceed the transaction cap.

### Transaction cap {#tx-cap}

A Cosmos transaction may not set a gas limit above **50,000,000**. A transaction above the cap is refused before its fee is charged.

## Upload rules {#upload}

Uploading code (`MsgStoreCode`) stays **controlled by governance**: `code_upload_access` is `Nobody` on both networks, so code is stored through a governance proposal. Check it any time:

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/codes/params
```

From v3.2.8 an upload is checked in a fixed order, cheapest checks first:

1. **Access.** The sender must be allowed by the upload rule. The mempool admits upload messages only from allowed senders.
2. **Gas for the declared size, up front.** The transaction must have gas left for the module size it declares, or it fails out of gas immediately, before anything is unpacked.
3. **One-pass inspection.** The module is unpacked once, never past its declared size, and inspected against the limits below. A gzip upload must be exactly one gzip member that unpacks to the size it declares.
4. **Storage and compile.** Storage is charged per byte, then the module is compiled.

Typical upload costs: about **9.9 million gas for a cw20** and about **22.8 million for a cw721**. The densest upload that stays within the limits costs about 32 million, still inside the 50,000,000 cap.

### Module limits {#module-limits}

| Limit | Value |
| ----- | ----- |
| Functions | at most 4,096 |
| Function types | at most 512 |
| Compiled size (conservative estimate) | at most 32 MiB |
| Exports | at most 128 |
| Globals | at most 256 |
| Element segments | at most 16, with at most 2,500 entries in total |
| Data segments | at most 1,024 |
| Initial memory | at most 64 pages (4 MiB) |
| Custom sections | at most 128 KiB in total |
| Floating-point operations | none allowed |

Floating-point instructions are refused because they are not deterministic across validator hardware. Write contracts with integer or decimal types from `cosmwasm-std`, and check that your build has no floating-point instructions before you submit it for governance.

The limits are also checked **at call time for code that is already stored**, so a code stored earlier that breaks a limit (for example floating point) is refused when called. Contracts built from the standard cw20 and cw721 templates and the release contracts stay well inside every limit.

## Worked example: estimate and execute a cw20 transfer {#worked-example}

The message is the standard cw20 `transfer`: `{"transfer": {"recipient": "qor1...", "amount": "1000"}}`. Examples use the testnet.

### CLI {#example-cli}

Let the CLI simulate with `--gas auto`, and use an adjustment of 1.3 or more. Build the transaction with `--generate-only` and sign it with `tx pqc cosign`, as on the rest of the manual (see [Hybrid signing](/cli-reference/transaction-commands#hybrid-signing)):

```bash
qorechaind tx wasm execute <contract-addr> \
  '{"transfer":{"recipient":"qor1recipient...","amount":"1000"}}' \
  --from mykey \
  --gas auto --gas-adjustment 1.3 --gas-prices 0.15uqor \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

The network floor is 0.1 uqor per unit of gas; `0.15uqor` leaves headroom. If your contract is called often in the same block as other users of the same code, the simulated limit already covers the cold load.

### TypeScript {#example-ts}

Simulate, multiply by 1.3, check the cap, then send through the hybrid builder. This follows the [QoreChain Native SDK guide](/sdk/guides/cosmwasm#gas), which has the full imports and the registration of the account's ML-DSA-87 key.

```ts
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { checkCosmosGasLimit, COSMOS_TX_MAX_GAS } from "@qorechain/sdk";

const cwClient = await SigningCosmWasmClient.connectWithSigner(
  "https://rpc-testnet.qore.host",
  signer,
);

const msgs = [
  {
    typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
    value: MsgExecuteContract.fromPartial({
      sender,
      contract: contractAddress,
      msg: new TextEncoder().encode(
        JSON.stringify({ transfer: { recipient, amount: "1000" } }),
      ),
      funds: [],
    }),
  },
];

const simulatedGas = await cwClient.simulate(sender, msgs, undefined);
const gas = Math.ceil(simulatedGas * 1.3);
checkCosmosGasLimit(gas); // throws above COSMOS_TX_MAX_GAS (50,000,000)

const gasPrice = 0.15; // uqor per unit of gas
const fee = {
  amount: [{ denom: "uqor", amount: String(Math.ceil(gas * gasPrice)) }],
  gas: String(gas),
};
// Pass `fee` and `msgs` to signAndBroadcastHybrid exactly as in the SDK guide.
```

`carriesWasmExecution(messages)` tells you whether a list of messages needs simulated gas, and `WASM_GAS_MULTIPLIER_MIN` is the 1.3 minimum. Where a CosmJS client accepts `"auto"` as the fee, it simulates for you.

### Tested on the testnet {#example-tested}

This run was made on `qorechain-diana` on 12 November 2026 (release v3.2.8) with an eth-native account, the TypeScript SDK 0.13.0 and the cw20 code that governance stored (code id 859). It signs the transaction, posts the signed bytes to the REST simulate route, and sends the real transaction with the simulated gas times 1.3.

```ts
import { Registry } from "@cosmjs/proto-signing";
import { wasmTypes } from "@cosmjs/cosmwasm-stargate";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { EthNativeSigner, qorechainRegistryTypes } from "@qorechain/sdk";

const registry = new Registry([...qorechainRegistryTypes, ...wasmTypes]);
const signer = new EthNativeSigner(account, { rest: REST, registry });
const signBytesVersion = await signer.resolveSignBytesVersion(CHAIN_ID);

// 1. Sign once with a generous limit, then ask the node what the call needs.
const base = { chainId: CHAIN_ID, accountNumber, sequence, messages: [msg] };
const { txRawBytes } = signer.sign({
  ...base,
  fee: { amount: [{ denom: "uqor", amount: "450000" }], gas: "3000000" },
  signBytesVersion,
});
const sim = await fetch(`${REST}/cosmos/tx/v1beta1/simulate`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ tx_bytes: Buffer.from(txRawBytes).toString("base64") }),
}).then((r) => r.json());

// 2. Send it for real with the simulated gas times 1.3.
const gas = Math.ceil(Number(sim.gas_info.gas_used) * 1.3);
const res = await signer.signAndBroadcast(transport, {
  ...base,
  fee: { amount: [{ denom: "uqor", amount: String(Math.ceil(gas * 0.15)) }], gas: String(gas) },
});
```

What the run printed:

| Step | Result |
| ---- | ------ |
| Instantiate cw20 (code 859): simulated, then sent with that times 1.3 | simulated 634,956; limit 825,443; code 0, gas used 629,267 |
| cw20 `transfer`: simulated | 591,280 gas |
| The same transfer with a fixed limit of 400,000 | refused: `out of gas in location: wasm code load; gasWanted: 400000, gasUsed: 564549` (the fee is still charged) |
| The same transfer with simulated x 1.3 (768,664) | code 0, gas used 585,151 |
| Three transfers in one transaction, simulated x 1.3 (1,724,456) | code 0, gas used 646,169 |

A fixed 400,000 limit fails on the first call of the code in a block, and the simulated limit does not. The fee is set on the limit you ask for (0.15 uqor per unit of gas in this run), so a larger margin costs a larger fee: use 1.3, not 5.

### Python, Go, Rust and Java {#example-other}

Each of these SDKs simulates against the REST route and sizes the limit from the result. They need a fully assembled (signed) transaction, because the simulate route requires the transaction structure. For a CosmWasm execute, instantiate or migrate (and a cross-VM call), the SDKs raise the limit to at least 1.3 times the simulated gas. None of them has a ready-made cw20 or CosmWasm message builder, so build the `MsgExecuteContract` with your protobuf library and pass its signed bytes.

**Python** (`qorechain-sdk`, `qorsdk`): `estimate_gas` and `auto_fee` take the built transaction and apply the 1.3 floor for wasm messages.

```python
from qorsdk import auto_fee, estimate_gas

rest = "https://api-testnet.qore.host"
gas = estimate_gas(rest, built, gas_multiplier=1.3)   # raises above the 50,000,000 cap
fee = auto_fee(rest, built, gas_multiplier=1.3, gas_price="0.15uqor")
```

**Go** (`github.com/qorechain/qorechain-sdk/packages/go/qorechain/tx`): `EstimateGas` returns the simulated gas, `WasmGasWanted` applies the 1.3 floor, and `EstimateFee` prices a multiplier you pass (it does not add the floor itself, so pass 1.3 or more).

```go
used, err := tx.EstimateGas("https://api-testnet.qore.host", txBytes, nil)
if err != nil { return err }
gas := tx.WasmGasWanted(used, 1.3)

fee, err := tx.EstimateFee("https://api-testnet.qore.host", txBytes, 1.3, "0.15uqor", nil)
```

**Rust** (`qorechain-sdk`): `estimate_gas_wanted` raises the limit to at least 1.3 times the simulated gas for wasm and cross-VM messages, and `estimate_fee` prices it.

```rust
use qorechain_sdk::tx::{estimate_fee, estimate_gas_wanted};

let est = estimate_gas_wanted("https://api-testnet.qore.host", &tx_bytes, 1.3).await?;
// est.simulated, est.gas_wanted
let fee = estimate_fee("https://api-testnet.qore.host", &tx_bytes, 1.3, "0.15uqor").await?;
```

**Java** (`io.github.qorechain.tx.AutoGas`): pass `true` for the last argument when the transaction carries wasm or cross-VM messages.

```java
AutoGas.Estimate est = AutoGas.estimate(
    "https://api-testnet.qore.host", txBytes, /* hybrid */ true, 1.3, null, /* wasmOrCrossVm */ true);
// est.simulatedGas, est.gasWanted
```

### REST simulate route {#example-rest}

`POST /cosmos/tx/v1beta1/simulate` with the base64 of a signed transaction returns `gas_info.gas_used`. Multiply it by 1.3 for the limit.

```bash
curl -s -X POST https://api-testnet.qore.host/cosmos/tx/v1beta1/simulate \
  -H 'Content-Type: application/json' \
  -d '{"tx_bytes":"<base64 of the signed TxRaw>"}'
```

The response carries `gas_info.gas_used` (a string). The route only accepts POST: a `GET` on it answers `501 Not Implemented`.

## Limits and errors {#limits-errors}

| Situation | What you see | What to do |
| --------- | ------------ | ---------- |
| Gas limit above 50,000,000 | Refused before the fee is charged | Lower the limit; split the work across transactions |
| Out of gas on a contract call | Transaction fails with an out-of-gas error | Simulate and use at least 1.3 times the result; never reuse a fixed value |
| Block contract budget used up | Failure naming the block wasm gas budget; fee paid | Retry in the next block, optionally with a priority fee |
| One call needs more than a transaction's share | Fails every time | Ask governance to raise the budget or the share, or make the call cheaper |
| Upload by a sender without access | Refused at admission | Submit code through a governance proposal |
| Upload without enough gas for its declared size | Out of gas at once | Set the gas to cover the declared size (about 9.9 million for cw20) |
| Upload over a module limit | Refused at upload | Reduce functions, exports, globals, segments or memory (see the table above) |
| Floating-point instructions in a module | Refused at upload, and at call time for stored code | Remove floating-point operations from the build |
| Gzip upload that is not one member, or whose size is wrong | Refused | Compress the module as a single gzip stream with the right size |

## Related pages {#related}

- [QoreChain Native guide (SDK): gas for contract calls](/sdk/guides/cosmwasm#gas)
- [QoreChain Native Development](/developer-guide/cosmwasm-development)
- [Cross-VM Interoperability](/developer-guide/cross-vm-interoperability)
- [Hybrid signing and `tx pqc cosign`](/cli-reference/transaction-commands#hybrid-signing)
- [Governance](/user-guide/governance)
