---
slug: /developer-guide/evm-window-reference
title: EVM Authorisation Window Reference (v3.2.8)
sidebar_label: EVM Window Reference
sidebar_position: 7
---

# EVM Authorisation Window Reference (v3.2.8)

An Ethereum transaction carries one secp256k1 signature and nothing else, so it cannot carry the post-quantum (ML-DSA-87) signature that QoreChain asks of every other transaction. The **EVM authorisation window** closes that gap. The account first opens a bounded window with a QoreChain Native message that **is** signed with its post-quantum key, and the EVM lane then admits the account's ordinary MetaMask, ethers.js, Hardhat or Foundry transactions only while the window covers them. This page is the complete reference for how a window behaves in release **v3.2.8**.

:::note Where v3.2.8 runs
The **`qorechain-diana`** testnet has run **v3.2.8** since 12 November 2026. The **`qorechain-vladi`** mainnet has not applied it yet; on mainnet the window works as described in [EVM Development](/developer-guide/evm-development#evm-window), without the options and rules marked "v3.2.8" below. A node below v3.2.8 refuses a window message that sets the new lists.
:::

## Why it matters {#why}

- **A stolen classical key is worth only what an open window admits.** The window bounds time (blocks), the number of transactions, the QOR that can leave, and optionally which contracts the account may touch.
- **The post-quantum key stays in charge.** Opening, narrowing and closing a window are all hybrid-signed Native messages. The classical key alone can never open one.
- **v3.2.8 makes the defaults stricter.** Standard precompile methods are deny-by-default, signatures checked by other contracts need the window's consent, and changing the post-quantum key closes the window.

The short version of the v3.2.8 additions is in [Window options added in v3.2.8](/developer-guide/evm-development#evm-window-v328); this page does not repeat it in full and adds the examples, the field reference and the error table. For the step-by-step first window see [Your First Transaction](/getting-started/first-transaction#evm-window).

## Open, close and read {#lifecycle}

| Action | Message | CLI | REST |
| ------ | ------- | --- | ---- |
| Open (replaces any open window) | `/qorechain.pqc.v1.MsgOpenEVMWindow` | `qorechaind tx pqc open-evm-window [blocks] [max-txs] [max-value]` | none (a transaction) |
| Close at once | `/qorechain.pqc.v1.MsgCloseEVMWindow` | `qorechaind tx pqc close-evm-window` | none (a transaction) |
| Read | none | `qorechaind q pqc evm-window <address>` | `GET /qorechain/pqc/v1/evm_window/{address}` |

Opening and closing are Native-lane transactions and need the account's hybrid (classical plus ML-DSA-87) signature, and the account must already hold a registered post-quantum key to open a window. Closing a window also withdraws a pending EIP-7702 consent. Opening **advances the account's nonce** (the Native sequence is the EVM nonce), so open the window first and read the EVM nonce afterwards.

### CLI {#cli}

Build the transaction with `--generate-only`, then add the post-quantum signature with `tx pqc cosign`. The release `qorechaind` binary has `gen-key` and `cosign`; a community build does not.

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana

# Open: 7,200 blocks, 20 transactions, 100 QOR cap (value plus maximum fees)
qorechaind tx pqc open-evm-window 7200 20 100qor \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window.json

qorechaind tx pqc cosign window.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

With no arguments the CLI uses defaults sized for a deploy session: 3,600 blocks, 10 transactions and 25 QOR. A window scoped to one contract, which can also delegate to one validator and send to one IBC receiver:

```bash
qorechaind tx pqc open-evm-window 600 5 100qor \
  --allowed-targets 0x0000000000000000000000000000000000000800 \
  --staking-validators qorvaloper1... \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window.json
```

Close a window early, for example if you think the classical key is exposed. Whatever the window still admitted is refused from the next block:

```bash
qorechaind tx pqc close-evm-window \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 40000uqor --generate-only > close.json

qorechaind tx pqc cosign close.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

Read the window:

```bash
qorechaind q pqc evm-window <qor1-address> --node $QNODE
```

`live: true` together with `remaining_blocks`, `remaining_txs` and `remaining_value` (uqor) is what you want to see. The command reference is in [Transaction Commands](/cli-reference/transaction-commands#open-evm-window).

### REST {#rest}

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_window/<qor1-address>
```

An account with no window answers HTTP 200 with `found: false`, so the route is safe to poll. Every number is a JSON string. A stored window can be expired or exhausted: `live` tells you whether it still admits at least one more zero-value transaction at the current height.

### TypeScript {#typescript}

The window helpers are in `@qorechain/sdk` (see the [SDK EVM guide](/sdk/guides/evm#evm-window-scope) for the signing set-up). `openEvmWindowMsg` takes every field below, `closeEvmWindowMsg` builds the close message, `fetchEvmWindow` reads the window, and `classifyEvmWindowRejection` explains a refusal.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  openEvmWindowMsg,
  closeEvmWindowMsg,
  fetchEvmWindow,
} from "@qorechain/sdk";

const REST = "https://api-testnet.qore.host";
const client = createClient({
  network: "testnet",
  endpoints: { rest: REST, rpc: "https://rpc-testnet.qore.host", evmRpc: "https://evm-testnet.qore.host" },
});
const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic); // already registered on chain
const tx = await client.connectTx(signer, { pqcKeypair });         // signs hybrid

// Open a window that may call one token contract and delegate to one validator.
await tx.signAndBroadcast(
  [
    openEvmWindowMsg({
      sender: account.address,
      blocks: 7200,
      maxTxs: 20,
      maxValue: "100000000",                 // uqor: value PLUS the maximum fee of each transaction
      allowedTargets: ["0x0000000000000000000000000000000000000800"],
      stakingValidators: ["qorvaloper1..."],
    }),
  ],
  "auto",
);

// Read it back (opens first, then read the nonce).
const w = await fetchEvmWindow({ rest: REST, address: account.address });
console.log(w.live, w.remainingBlocks, w.remainingTxs, w.remainingValue);

// Close it early.
await tx.signAndBroadcast([closeEvmWindowMsg(account.address)], "auto");
```

`openEvmWindowMsg` checks the bounds and the list formats before anything is signed, so a mistake fails locally instead of costing a refused transaction. `MAX_EVM_WINDOW_BLOCKS` and `MAX_EVM_WINDOW_TXS` export the bounds. The read-back (`fetchEvmWindow`) returns the bounds, the counters and the v3.2.3 scope (`nativeOnly`, `allowedTargets`); `validators`, `stakingValidators` and `ibcReceivers` are accepted by the builder. With a hybrid-signing `connectTx` the post-quantum key must already be registered.

### Tested on the testnet {#tested}

Run on `qorechain-diana` on 12 November 2026 (release v3.2.8) with an eth-native account that had registered its post-quantum key, using SDK 0.13.0 (`openEvmWindowMsg`, `closeEvmWindowMsg`, `fetchEvmWindow`) and hybrid signing. The window fields `validators`, `staking_validators` and `ibc_receivers` are not in the published SDK 0.13.0 builders yet; use the command line for them until an SDK release adds them.

| Step | Result |
| ---- | ------ |
| `GET /qorechain/pqc/v1/evm_window/{address}` before opening | `found: false`, `live: false` |
| Open: 300 blocks, 5 transactions, 1,000,000 uqor | code 0, 187,282 gas used. Read back: `found: true`, `live: true`, `opened_height` 9942089, `expiry_height` 9942389, `max_txs` 5, `max_value` 1000000, `remaining_blocks` 297, `native_only: false`, `allowed_targets: []` |
| Open again with `nativeOnly: true` | code 0, 187,803 gas used. The new window replaced the old one: `native_only: true`, a new `opened_height` |
| Close | code 0, 170,468 gas used. Read back: `found: false` |

`fetchEvmWindow` returned the same fields in camel case (`openedHeight`, `remainingBlocks`, `nativeOnly`, `allowedTargets`). Opening and closing are hybrid-signed Cosmos transactions, so the first one an account sends needs its key registered first.

### Python, Go, Rust and Java {#other-languages}

Each SDK has a builder for the message and a REST read. All of them check the chain's bounds locally. A language builder that sets the v3.2.8 lists needs the SDK release that supports v3.2.8; earlier releases build only the older fields.

| Language | Open (with every list) | Close | Read | EVM limits |
| -------- | ---------------------- | ----- | ---- | ---------- |
| Python | `msg.pqc.open_evm_window(sender=, blocks=, max_txs=, max_value=, native_only=, allowed_targets=, validators=, staking_validators=, ibc_receivers=)` | `msg.pqc.close_evm_window(sender=)` | `get_evm_window(rest, address)` | `fetch_evm_limits(rest)` |
| Go | `messages.NewOpenEVMWindowWithScope(sender, blocks, maxTxs, maxValue, scope)` with a `messages.EVMWindowScope` | `messages.NewCloseEVMWindow(sender)` | `rest.GetEVMWindowStatus(address)` | `rest.GetEVMLimits()` |
| Rust | `msg::pqc::open_evm_window_with_scope_any(sender, blocks, max_txs, max_value, &scope)` with `EvmWindowScope` | `msg::pqc::close_evm_window_any(sender)` | `get_evm_window(&rest, address)` | no helper yet; read the REST route |
| Java | `EvmWindow.openWithPolicy(sender, blocks, maxTxs, maxValue, nativeOnly, allowedTargets, validators, stakingValidators, ibcReceivers)` | `EvmWindow.close(sender)` | `rest.evmWindow(address)` | `rest.evmLimits()` |

Python:

```python
from qorsdk import RestClient, get_network, get_evm_window, msg

sender = "qor1..."
open_msg = msg.pqc.open_evm_window(
    sender=sender,
    blocks=7200,
    max_txs=20,
    max_value="100000000",  # uqor, integer string
    allowed_targets=["0x0000000000000000000000000000000000000800"],
    staking_validators=["qorvaloper1..."],
)
# broadcast it through the usual hybrid path, then:
rest = RestClient(get_network("testnet").endpoints.rest)
status = get_evm_window(rest, sender)
print(status.live, status.remaining_blocks, status.remaining_txs, status.remaining_value)
close_msg = msg.pqc.close_evm_window(sender=sender)
```

Go:

```go
open, err := messages.NewOpenEVMWindowWithScope(sender, 7200, 20, "100000000",
    messages.EVMWindowScope{
        AllowedTargets:    []string{"0x0000000000000000000000000000000000000800"},
        StakingValidators: []string{"qorvaloper1..."},
    })
status, err := rest.GetEVMWindowStatus(sender)
closeMsg, err := messages.NewCloseEVMWindow(sender)
```

Rust:

```rust
use qorechain::evm_window::{get_evm_window, EvmWindowScope};
use qorechain::msg;

let scope = EvmWindowScope {
    allowed_targets: vec!["0x0000000000000000000000000000000000000800".into()],
    staking_validators: vec!["qorvaloper1...".into()],
    ..Default::default()
};
let open = msg::pqc::open_evm_window_with_scope_any("qor1...", 7200, 20, "100000000", &scope)?;
let status = get_evm_window(&rest, "qor1...").await?;
let close = msg::pqc::close_evm_window_any("qor1...");
```

Java:

```java
TypedMessage open = EvmWindow.openWithPolicy(sender, 7200, 20, "100000000",
    false,
    List.of("0x0000000000000000000000000000000000000800"), // allowedTargets
    null,                                                   // validators
    List.of("qorvaloper1..."),                              // stakingValidators
    null);                                                  // ibcReceivers
EvmWindowStatus status = rest.evmWindow(sender);
TypedMessage close = EvmWindow.close(sender);
```

The SDK never opens a window for you. A window authorises spending, so the step stays explicit and visible to the user.

## Fields {#fields}

| Field (CLI flag) | Limit | Meaning |
| ---------------- | ----- | ------- |
| `blocks` (first argument) | 1 to 17,280 | The window admits nothing after the opening height plus `blocks`. This is a block count, not a duration: about 5 hours on the testnet and about 15 hours on mainnet at today's block times |
| `max_txs` (second argument) | 1 to 1,000 | How many EVM transactions it admits |
| `max_value` (third argument) | positive | Total uqor the window lets out of the account: transferred value **plus** the maximum fee (gas limit times fee cap) of every admitted transaction |
| `native_only` (`--native-only`) | true or false | Admit plain QOR transfers only: no calldata, no contract creation, no recipient that carries code, no EIP-7702 authorisation |
| `allowed_targets` (`--allowed-targets`) | at most 16 `0x` addresses, no duplicates | Admit only transactions to these addresses; contract creation is refused |
| `validators` (`--validators`) | at most 16 `0x` addresses, no duplicates | Contracts whose check of the account's signature counts for the account's own actions: a validator module a wallet contract calls, or the ERC-4337 entry point. v3.2.8 |
| `staking_validators` (`--staking-validators`) | at most 16 `qorvaloper...` addresses, no duplicates | Validators the account may delegate or redelegate to through the window. v3.2.8 |
| `ibc_receivers` (`--ibc-receivers`) | at most 16 entries of `<channel>/<receiver>`, at most 256 characters each, no spaces or commas | Exact destinations a native QOR IBC transfer may go to. Compared byte for byte, so write `channel-0` and the lowercase bech32 receiver exactly as the transfer carries them. v3.2.8 |

Every bound must be given: the chain refuses a missing one rather than defaulting it (the CLI fills the deploy-session defaults itself). Any bound running out ends the window in practice. A window works only while the account's post-quantum key is usable, that is, not empty, not classical-only and not disabled by governance.

### What a window counts {#counting}

At admission, before the transaction runs, each EVM transaction uses one of `max_txs` and adds to the used value its transferred value plus its maximum fee, converted from the 18-decimal EVM unit to uqor and rounded up. A transaction that is admitted and then reverts has still used its share. After execution, native QOR a precompile moved on the account's behalf (a delegation, a deposit, an IBC transfer) is charged to the window too, so it counts against `max_value` although the transaction value was zero.

Not counted: `eth_call`, `eth_estimateGas` and simulations. Tokens are not priced at all: an ERC-20 transfer or approval carries value zero, so bound those with a scope (`allowed_targets`). Each charge emits a `pqc_evm_window_used` event with the attributes `address`, `evm_address`, `window_open_height`, `used_txs`, `used_value`, `tx_value` and `source` (`ante` for admission, `settlement` for the after-execution charge), so a wallet can show what a transaction took. The opening and closing emit `pqc_evm_window_opened` and `pqc_evm_window_closed`.

## Standard precompiles through a window {#precompile-allowlist}

For an account a window authorises, a method of a standard precompile (staking, distribution, ICS-20, gov, slashing, the ERC-20 token precompiles) is refused unless it is in the table and the window lists that precompile in `allowed_targets`. The precompile addresses are in [EVM Precompiles](/developer-guide/evm-precompiles); the staking, distribution, ICS-20 and gov ones are `0x...0800`, `0x...0801`, `0x...0802` and `0x...0805`.

| Precompile | Method | Admitted when |
| ---------- | ------ | ------------- |
| distribution | `claimRewards`, `withdrawDelegatorRewards` | the rewards are paid to the account itself (its withdraw address is its own) |
| distribution | `withdrawValidatorCommission` | the validator is the account's own and pays the account itself |
| distribution | `depositValidatorRewardsPool` | the validator is in `staking_validators` and every coin is native QOR |
| staking | `delegate`, `redelegate` | the destination validator is in `staking_validators` |
| ICS-20 | `transfer` | native QOR, over the `transfer` port, with no memo, to a pair in `ibc_receivers` |
| ERC-20 token precompiles | `transfer`, `transferFrom`, `approve` | native QOR; another token only when the window lists that token's address |

Everything else is refused through a window, whatever it lists: undelegating, cancelling an unbonding, voting and other governance actions, changing the withdraw address, creating or editing a validator, unjailing, funding the community pool. Send those as post-quantum signed Native transactions. Listing ICS-20 without `ibc_receivers` admits no transfer, and listing the staking precompile without `staking_validators` admits no delegation.

Examples of what to list:

| Goal | Window |
| ---- | ------ |
| Claim staking rewards from MetaMask | `allowed_targets` with the distribution precompile; keep the withdraw address as the account itself |
| Stake from MetaMask | `allowed_targets` with the staking precompile, plus `staking_validators` |
| Bridge QOR out | `allowed_targets` with the ICS-20 precompile, plus `ibc_receivers` such as `channel-0/<receiver>` |
| Move an IBC token held as an ERC-20 precompile | `allowed_targets` with that token's address |

Listing a contract is the account's consent to what that contract can do with its assets: for a vault, router or token that holds the account's tokens, the window does not bound which tokens move or where.

## Contract creation {#contract-creation}

Deploying a contract needs an **unscoped** window. A window with `native_only` or with `allowed_targets` refuses contract creation. For a deploy session open a plain window (the CLI defaults are sized for one), deploy, then close it. For later sessions, open a window with `--allowed-targets <contract-address>` to limit it to calls to the contract you deployed. The deploy walk-through with Hardhat and Foundry is in [EVM Development](/developer-guide/evm-development).

## Permits, EIP-712 orders and Permit2 {#permits}

An EIP-2612 permit, a Permit2 transfer, a signed order or a meta-transaction is checked by a contract with the `ecrecover` precompile. From v3.2.8 (both networks, once a network applies it), for an account that holds a usable post-quantum key that check succeeds only while the account's own **live** window admits the **verifying contract**, which is the token or Permit2 itself and not the router that forwards the call.

1. If the window is scoped, list the verifying contract in `allowed_targets` (`native_only` admits no such signature).
2. Open the window **before** the user signs. Without a live window the signature is treated as invalid and the contract refuses it.
3. The signature itself is never charged to the window, because a signature is public once used.
4. A permit or approval granted inside a window stays after the window closes. Review and revoke approvals when the session ends.

Accounts with no post-quantum record, a delegated wallet checking its own signature, and the sender's own signature in an unscoped window recover as before. Queries and gas estimates are not affected.

## Key changes and EIP-7702 consent {#key-changes}

- **Rotating, migrating or re-registering the post-quantum key closes the window** and deletes any EIP-7702 consent. Open the window again afterwards. Plan for this in hot wallets and exchange integrations.
- The window, EIP-7702 consent (`MsgAuthorizeEVMDelegation`, `MsgClearEVMDelegation`) and abstract-account management messages must be the account's **own top-level, hybrid-signed message**. They cannot be sent through authz (`MsgExec`) or granted to another account, and a grant of those message types is refused. Existing consent grants of this kind were removed at the upgrade.
- An EIP-7702 delegated account that acts inside someone else's transaction needs its own live window at the moment its code acts. Without one only that call fails, and the calling contract sees the failure, so a payment to a delegated account no longer makes the payer's whole transaction revert.

Consent for a delegation is recorded with `qorechaind tx pqc authorize-evm-delegation <delegate_0x> <blocks>` and read with `GET /qorechain/pqc/v1/evm_delegation_consent/{address}`; see [EIP-7702 delegations](/developer-guide/evm-development#eip-7702).

## Limits in force {#limits}

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_limits
```

The testnet answered on 12 November 2026 with `tx_max_gas` **30000000** and `precompile_input_max_bytes` **16384**:

| Limit | Value | Meaning |
| ----- | ----- | ------- |
| `tx_max_gas` | 30,000,000 | The most gas one EVM transaction may ask for; above it the transaction is refused before it runs. The EVM runs started by one Native message share the same budget |
| `precompile_input_max_bytes` | 16,384 | The largest input a guarded stateful precompile accepts |
| Window `blocks` | 17,280 | Longest window |
| Window `max_txs` | 1,000 | Most transactions in one window |
| List entries | 16 per list | `allowed_targets`, `validators`, `staking_validators`, `ibc_receivers` |

The response also carries a `limits` object with the governance-set values; read the top-level `tx_max_gas` and `precompile_input_max_bytes`, which are the values in force. The route is served from v3.2.8, so the public mainnet answers `501 Not Implemented` until it upgrades.

A window opened at a normal gas price still counts the maximum fee: a gas limit of 30,000,000 at a fee cap of 100 gwei counts 3 QOR against `max_value` for one transaction.

## Errors {#errors}

Refusals come back with codespace `pqc`. Over EVM JSON-RPC a refusal arrives as a broadcast error that carries the message and no codespace, so match on the text too (the SDK classifiers do).

| Code | Message | Cause | What to do |
| ---- | ------- | ----- | ---------- |
| 26 | `no open EVM authorisation window` | No window, no registered post-quantum key, or the window expired | Register a key first if there is none, then open a window |
| 27 | `EVM authorisation window exhausted` | A bound is used up, or the transaction is outside the window's scope (including a standard precompile the window does not list, or contract creation under a scoped window) | Open a new window with larger bounds or the scope you need |
| 28 | `invalid EVM authorisation window` | An open request outside the limits, or no usable key at that point | Check `blocks`, `max_txs`, `max_value` and the lists; register or repair the key |
| 62 | `delegated account has no window covering this action` | A delegated account acted, or the sender moved more than its window covers, without a covering window. From v3.2.8 the same rule fails only the offending call | Open a window for that account that admits the action |
| revert | `<method> is disabled: the circuit breaker has tripped ...` | A standard precompile method whose Native message is switched off | Wait; nothing to change in the window |
| revert | `<method>: account ... has no open EVM authorisation window that lists 0x...` | A value-moving precompile reached through code, for an account whose window does not list it | Add the precompile to `allowed_targets` |
| nonce | `nonce too low` | The EVM transaction was signed before the window opened (opening advances the nonce) | Re-read the nonce and sign again |
| chain id | `only replay-protected (EIP-155) Ethereum transactions are accepted` | A transaction signed without a chain id | Set the chain id in the tool's network config |

`classifyEvmWindowRejection(err)` in the TypeScript SDK returns `"no-pqc-key"`, `"no-window"`, `"exhausted"` or `"invalid"`; the other SDKs have an equivalent classifier (`describe_evm_window_error` in Python, `tx.ClassifyEVMWindowError` in Go, `classify_evm_window_error` in Rust, `EvmWindowIssue.classify` in Java).

## What the window does not govern {#outside}

The window governs the EVM lane, that is, transactions signed with the classical key alone. These are not charged to it, because each carries its own post-quantum signature or is started by a module for an account that did sign:

- Native-lane messages the account signs itself: bank sends, staking, governance, and a `MsgCrossVMCall` into the EVM, which runs as the signer's own `0x` address.
- Abstract-account executions authorised by the account's authenticators.
- ERC-20 conversions and IBC callbacks run by modules.

A cross-VM call into the EVM that the sender did not send itself (for example under an authz grant) runs under the sender's window and needs it to admit the target. The `0x0901` cross-VM bridge needs a window that lists it. See [Cross-VM Interoperability](/developer-guide/cross-vm-interoperability).

## MetaMask and QoreX flow {#qorex-flow}

MetaMask signs with an Ethereum key, which is the key of an **Ethereum-style (coin 60) account**, and MetaMask cannot produce a Native message. QoreX is where such an account opens its window; QoreX's own sends use the Native lane and never need one.

1. In QoreX, add or restore the coin-60 account for your MetaMask phrase (see [Restore a phrase from MetaMask or the Dashboard](/qorex/getting-started#restore-dashboard)). The account needs a registered ML-DSA-87 key; your first QoreX transfer registers it.
2. Open the **EVM access window** card (app: Settings, Security, EVM access window; extension: the **EVM access window** button in the popup) and choose how many blocks (up to 17,280), how many transactions (up to 1,000) and the spending cap in QOR. The cap covers each amount plus its maximum fee. The defaults are 300 blocks, 5 transactions and 1 QOR.
3. Approve the hybrid-signed message. A new window replaces any open one, and opening advances your nonce, so send from MetaMask only afterwards; a transaction prepared earlier is refused with "nonce too low".
4. Send from MetaMask against chain id 9800 (testnet) or 9801 (mainnet). When you are done, use **Close the window**, offered only while a window is live.

The QoreX card sets the three bounds. It does not offer a screen for the scope lists (`allowed_targets`, `validators`, `staking_validators`, `ibc_receivers`, `native_only`), so a scoped window comes from `qorechaind` or an SDK. See [EVM access window](/qorex/security-and-recovery#evm-window) for the card and its four states.

## Related pages {#related}

- [EVM Development](/developer-guide/evm-development): the runtime, gas limits and the [v3.2.8 window options](/developer-guide/evm-development#evm-window-v328)
- [EVM Precompiles](/developer-guide/evm-precompiles)
- [Cross-VM Interoperability](/developer-guide/cross-vm-interoperability)
- [Post-Quantum Signing](/developer-guide/post-quantum-signing)
- [SDK EVM guide](/sdk/guides/evm#evm-window-scope)
- [Transaction Commands](/cli-reference/transaction-commands#open-evm-window) and [Query Commands](/cli-reference/query-commands)
- [REST and gRPC endpoints](/api-reference/rest-grpc-endpoints)
- [Your First Transaction](/getting-started/first-transaction#evm-window)
- [QoreX: EVM access window](/qorex/security-and-recovery#evm-window)
