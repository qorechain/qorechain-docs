---
slug: /developer-guide/cosmwasm-development
title: CosmWasm Development
sidebar_label: CosmWasm Development
sidebar_position: 3
---

# CosmWasm Development

QoreChain supports **CosmWasm** smart contracts, enabling developers to write secure, sandboxed programs in Rust that compile to WebAssembly. CosmWasm contracts run alongside EVM and SVM programs within the QoreChain triple-VM architecture.

:::note
The commands below use the **`qorechain-vladi`** mainnet (live since 29 June 2026), which runs node release **v3.2.1**. Substitute `--chain-id qorechain-diana` for the testnet, which runs v3.2.2.
:::

:::caution Code upload and instantiation currently require explicit permission
As of this writing, `code_upload_access` and `instantiate_default_permission` are both set to **`Nobody`** on **both mainnet and testnet** — meaning `MsgStoreCode` and `MsgInstantiateContract` are not open to arbitrary accounts by default, following an industry-wide CosmWasm security advisory. You'll need governance to grant your account (or a specific address list) upload/instantiate permission before the steps below will succeed. Check the live parameters first, since this is exactly the kind of setting governance can change (mainnet currently has no stored contract code at all):

```bash
qorechaind query wasm params
# or: curl -s https://api.qore.host/cosmwasm/wasm/v1/codes/params  (substitute api-testnet.qore.host for testnet)
```

The `MsgStoreCode`, `MsgInstantiateContract` and `MsgInstantiateContract2` message types are also switched off by the chain's circuit breaker on both networks (`qorechaind query circuit disabled-list`), so raising the permission alone is not enough until those entries are lifted.

This restriction doesn't affect already-instantiated contracts — `execute` and `query` against an existing contract work normally regardless of this setting.
:::

:::caution Sign with `tx pqc cosign`
Mainnet and testnet require a hybrid post-quantum signature on every Cosmos-lane transaction, so the `tx` commands on this page do not broadcast as written. They build the transaction with `--generate-only > tx.json`; then sign and broadcast it with `qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id <chain-id>` (the release binary from the [download manifest](/developer-guide/running-a-node#fetch-the-manifest) has the signer; a build from the public source does not). The network fee floor is **0.1 uqor per unit of gas**, which is what `--gas-prices 0.1uqor` expresses; the hybrid signature adds roughly 47,000 gas that a simulation does not include, hence the `1.5` adjustment. See [Post-Quantum Signing](/developer-guide/post-quantum-signing).
:::

---

## Prerequisites

| Dependency                 | Version       | Purpose                        |
| -------------------------- | ------------- | ------------------------------ |
| **Rust**                   | Latest stable | Contract compilation           |
| **wasm32-unknown-unknown** | target        | WebAssembly compilation target |
| **cargo-generate**         | Latest        | Project scaffolding            |
| **cosmwasm-std**           | 1.5+          | CosmWasm standard library      |

Install the Wasm target:

```bash
rustup target add wasm32-unknown-unknown
```

---

## Contract Lifecycle

CosmWasm contracts follow a five-step lifecycle: **Build**, **Store**, **Instantiate**, **Execute**, and **Query**.

1. **Build** — Compile your contract to optimized WebAssembly:

   ```bash
   cd my-contract

   # Standard build
   cargo build --release --target wasm32-unknown-unknown

   # Optimized build (recommended for deployment)
   docker run --rm -v "$(pwd)":/code \
     cosmwasm/rust-optimizer:0.15.0
   ```

   The optimized `.wasm` file will be in the `artifacts/` directory.

2. **Store** — Upload the compiled contract to the chain:

   ```bash
   qorechaind tx wasm store contract.wasm \
     --from mykey \
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
   ```

   After the transaction confirms (sign and broadcast `tx.json` with `tx pqc cosign` as described above), query the stored code ID:

   ```bash
   qorechaind query wasm list-code
   ```

3. **Instantiate** — Create a new contract instance from a stored code ID:

   ```bash
   qorechaind tx wasm instantiate <code-id> \
     '{"count": 0, "owner": "qor1..."}' \
     --label "my-counter-contract" \
     --from mykey \
     --no-admin \
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
   ```

   | Flag                | Description                                    |
   | ------------------- | ---------------------------------------------- |
   | `<code-id>`         | Numeric ID returned from the store transaction |
   | `--label`           | Human-readable label for this instance         |
   | `--no-admin`        | No admin address (contract is immutable)       |
   | `--admin <address>` | Set an admin who can migrate the contract      |

   Retrieve the contract address:

   ```bash
   qorechaind query wasm list-contract-by-code <code-id>
   ```

4. **Execute** — Call a contract's execute entry point to change state:

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"increment": {}}' \
     --from mykey \
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
   ```

   Execute with funds attached:

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"deposit": {}}' \
     --amount 1000000uqor \
     --from mykey \
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
   ```

5. **Query** — Read contract state without submitting a transaction:

   ```bash
   qorechaind query wasm contract-state smart <contract-addr> \
     '{"get_count": {}}'
   ```

   Query responses are returned as JSON.

---

## Useful Queries

```bash
# List all stored code
qorechaind query wasm list-code

# List all instances of a specific code ID
qorechaind query wasm list-contract-by-code <code-id>

# Get contract info (code ID, admin, label)
qorechaind query wasm contract <contract-addr>

# Get raw contract state by key
qorechaind query wasm contract-state raw <contract-addr> <key-hex>

# Get full contract state (all keys)
qorechaind query wasm contract-state all <contract-addr>

# Get contract history (instantiate/migrate events)
qorechaind query wasm contract-history <contract-addr>
```

---

## Contract Structure

A typical CosmWasm contract has three entry points:

```rust
use cosmwasm_std::{
    entry_point, Binary, Deps, DepsMut, Env, MessageInfo,
    Response, StdResult,
};

#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> StdResult<Response> {
    // Initialize contract state
    Ok(Response::new().add_attribute("method", "instantiate"))
}

#[entry_point]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> StdResult<Response> {
    // Handle state-changing operations
    Ok(Response::new().add_attribute("method", "execute"))
}

#[entry_point]
pub fn query(
    deps: Deps,
    _env: Env,
    msg: QueryMsg,
) -> StdResult<Binary> {
    // Handle read-only queries
    Ok(Binary::default())
}
```

---

## Cross-VM Calls

Cross-VM calls are sent as `MsgCrossVMCall` transactions through the `x/crossvm` module; see [Cross-VM Interoperability](/developer-guide/cross-vm-interoperability) for the message lifecycle. CosmWasm contracts do not have a contract-side binding for initiating a cross-VM call today (there is no custom `QoreChainMsg` message for contracts to emit), so a contract cannot call an EVM or SVM contract from inside its `execute` entry point.

:::caution Cross-VM calls are currently switched off on mainnet
`MsgCrossVMCall` is on mainnet's circuit-breaker list (`qorechaind query circuit disabled-list`), and the SVM lane is disabled on both networks, so the cross-VM path is not usable for ordinary transactions today.
:::

---

## Module Integration

CosmWasm contracts can interact with Cosmos SDK modules through standard message passing:

```rust
// Send native tokens via the bank module
let send_msg = BankMsg::Send {
    to_address: "qor1recipient...".to_string(),
    amount: vec![Coin {
        denom: "uqor".to_string(),
        amount: Uint128::new(1_000_000),
    }],
};

// Delegate to a validator via the staking module
let delegate_msg = StakingMsg::Delegate {
    validator: "qorvaloper1...".to_string(),
    amount: Coin {
        denom: "uqor".to_string(),
        amount: Uint128::new(1_000_000),
    },
};
```

---

## Contract Migration

If the contract was instantiated with an `--admin` address, the admin can migrate it to a new code ID:

```bash
qorechaind tx wasm migrate <contract-addr> <new-code-id> \
  '{"migrate_msg": {}}' \
  --from admin-key \
  --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
  --generate-only > tx.json
```

This calls the `migrate` entry point on the new code with the existing contract state.

---

## Next Steps

* [Cross-VM Interoperability](/developer-guide/cross-vm-interoperability) — Call EVM and SVM contracts from CosmWasm
* [SVM Development](/developer-guide/svm-development) — Deploy BPF programs on QoreChain
* [EVM Precompiles](/developer-guide/evm-precompiles) — Reference for the planned Solidity precompiles (none are active yet)
