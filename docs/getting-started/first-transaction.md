---
slug: /getting-started/first-transaction
title: First Transaction
sidebar_label: First Transaction
sidebar_position: 5
---

# First Transaction

This guide walks through sending QOR tokens, querying transactions, and interacting with QoreChain across its native, EVM, and SVM interfaces.

:::note
The commands below use the **`qorechain-diana`** testnet (EVM chain ID **9800**). Mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) has been live since 7 June 2026 and runs release v3.2.4 since 23 October 2026 (the testnet runs v3.2.6 since 27 October 2026) — substitute the mainnet chain ID and endpoints from the **Connecting to Mainnet** page when transacting on mainnet.
:::

## Check Your Balance

Before sending tokens, verify your account balance:

```bash
qorechaind query bank balances qor1youraddress... --output json
```

The response includes all token denominations held by the account. QOR balances are displayed in `uqor` (micro-QOR), where **1 QOR = 1,000,000 uqor**.

## Send QOR {#send-qor}

A QoreChain account sends on the Cosmos lane with a **hybrid signature**: the classical secp256k1 signature plus an ML-DSA-87 (Dilithium-5) signature. A plain `qorechaind tx bank send ... -y` is rejected, so the transfer is built unsigned and then co-signed. You need a post-quantum key registered on your account once (see [Register your post-quantum key](#register-pqc-key) below), and the official `qorechaind` release binary from [download.qore.host](https://download.qore.host) (a binary built from the public source tree cannot create or apply a Dilithium signature).

```bash
# 1. Build the unsigned transaction (the fee is fixed here, because cosign signs the fee in this file)
qorechaind tx bank send mykey qor1recipient... 1000000uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > tx.json

# 2. Add the ML-DSA-87 signature and broadcast
qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

This sends **1 QOR** (1,000,000 uqor) to the recipient address and pays a fee of 40,000 uqor (0.04 QOR). The network floor is **0.1 uqor per unit of gas**, so the fee must be at least the gas limit multiplied by 0.1: `--gas 400000` needs `--fees 40000uqor` or more. A hybrid-signed transfer typically uses 160,000 to 240,000 gas because the signature adds about 4.7 KB to the transaction. `cosign` asks the node which signed-bytes form the network verifies, so the same command works on both networks.

### Register your post-quantum key {#register-pqc-key}

A post-quantum key is **registered explicitly**, once per account. The chain does not register it for you on your first transaction. The registration transaction itself (and key migration) may be signed with the classical key alone so a brand-new account can bootstrap:

```bash
# generate the ML-DSA-87 key (stored under ~/.qorechaind/pqc/mypqc.dilithium, mode 0600, not encrypted)
qorechaind tx pqc gen-key mypqc

# register the printed public key for your account
qorechaind tx pqc register-key <public_key_hex> hybrid --from mykey \
  --chain-id qorechain-diana --gas 600000 --fees 60000uqor
```

Since v3.2.3 the chain also accepts an optional **proof of possession** with the registration, and refuses weak, degenerate or already-used keys. To attach one, register with `register-key-v2` and name your local key:

```bash
qorechaind tx pqc register-key-v2 dilithium5 <public_key_hex> hybrid --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --gas 600000 --fees 60000uqor
```

Back up the PQC key file as carefully as your recovery phrase; it can be re-derived from the phrase with `qorechaind tx pqc recover-key`. [QoreX](/qorex/overview) and the QoreChain SDK perform key registration for you. See [Wallet Setup](/getting-started/wallet-setup) for the full hybrid flow.

:::caution Cosmos transfers require a hybrid PQC signature
On the Cosmos lane the network setting is `hybrid_signature_mode = required` (live networks run the v3.2 line). A classical-only transaction is **rejected**. To produce the hybrid signature outside the CLI, the open-source [**qorechain-pqc**](/developer-guide/post-quantum-signing) library (`hybridSignBytes`) and the QoreChain SDK do the equivalent in code.
:::

After the co-signed transaction is accepted, the CLI returns a transaction hash.

## Query Transaction

Look up a completed transaction by its hash:

```bash
qorechaind query tx <txhash>
```

The output includes the transaction status, gas used, block height, and all events emitted during execution.

For JSON output:

```bash
qorechaind query tx <txhash> --output json
```

## Using JSON-RPC (EVM)

QoreChain's EVM execution environment exposes a standard Ethereum JSON-RPC interface on port `8545`.

:::caution EVM transactions need an authorisation window
Standard Ethereum signing (MetaMask, ethers.js, ...) still works unmodified, but since v3.2.0 the EVM lane only admits a transaction from an account that has a **registered post-quantum key** and an **open EVM authorisation window**. Open one first (it is a Cosmos-lane transaction, signed with your ML-DSA key) — see [EVM authorisation window](#evm-window) below. Without it the node answers `no open EVM authorisation window`. Reading state (`eth_blockNumber`, `eth_getBalance`, `eth_call`, `eth_estimateGas`) needs no window.
:::

### Get the Latest Block Number

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_blockNumber",
    "params": [],
    "id": 1
  }' | jq '.result'
```

### Get an Account Balance

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_getBalance",
    "params": ["0xYourEVMAddress", "latest"],
    "id": 1
  }' | jq '.result'
```

The balance is returned as a hex-encoded value in the smallest denomination.

### EVM authorisation window {#evm-window}

Since chain release **v3.2.0** (mainnet height 2,981,742, 25 September 2026; testnet height 5,920,000) the EVM lane admits a transaction only from an account that

1. has a **registered post-quantum key** (ML-DSA-87), and
2. has an **open EVM authorisation window** that still has room for the transaction.

Everything else about the EVM lane is unchanged: you keep signing with MetaMask, ethers.js, Hardhat or Foundry, and `eth_estimateGas` and other simulations work without a window. Contract deployments count like any other EVM transaction, so a window is needed before you deploy.

**Why a window?** A standard wallet signs one secp256k1 signature over an Ethereum transaction and gives applications no way to attach a second, post-quantum signature. So the post-quantum authorisation travels *ahead* of the transaction: you open a bounded window with a normal Cosmos-lane transaction, which does carry your ML-DSA signature, and the EVM lane then admits transactions covered by it. A classical key alone can never open a window, so a stolen classical key can only spend what an already-open window allows. It works like an ERC-20 approval: authorise a bounded amount for a bounded time, then transact normally.

**What a window bounds.** Three bounds apply at once; whichever runs out first closes the window.

| Bound | Meaning | Allowed range |
| --- | --- | --- |
| `blocks` | How long the window stays open, counted from the block that opens it | 1 – 17,280 |
| `max-txs` | How many EVM transactions it admits | 1 – 1,000 |
| `max-value` | Total outflow it admits, in uqor: transferred value **plus** the maximum fee each transaction could pay (gas limit × fee cap), rounded up | greater than 0 |

* 17,280 blocks is about 15 hours on mainnet (about 3.1 s per block) and about 6 hours on the testnet (about 1.3 s per block).
* A transaction that is admitted and then fails still uses its slot and value budget.
* Opening a new window **replaces** the previous one; consumption starts again from zero.
* The CLI accepts `max-value` in `uqor` or `qor` (`1000qor` = 1,000,000,000 uqor).
* The value bound counts native QOR only: a token transfer, an approval or any other contract call carries value zero. To bound those as well, narrow the window's scope (below).

**Step 1 — register your post-quantum key** (once): see [Register your post-quantum key](#register-pqc-key) above.

**Step 2 — open a window.** Opening a window is a Cosmos-lane transaction, so it is produced unsigned and then co-signed:

```bash
# at most 1000 QOR in total, at most 20 transactions, for 7,200 blocks (about 6.4 hours on mainnet)
qorechaind tx pqc open-evm-window 7200 20 1000qor --from mykey \
  --chain-id qorechain-diana --gas 400000 --fees 40000uqor --generate-only > window.json

qorechaind tx pqc cosign window.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

**Narrowing the scope (v3.2.3 and later).** Two optional flags restrict what an open window admits: `--native-only` admits plain native QOR transfers only (no calldata, no contract creation, no recipient that carries code), and `--allowed-targets 0xAAA...,0xBBB...` admits only transactions to those recipients (at most 16; contract creation is then refused). For example:

```bash
qorechaind tx pqc open-evm-window 7200 20 1000qor --native-only --from mykey \
  --chain-id qorechain-diana --gas 400000 --fees 40000uqor --generate-only > window.json
```

On mainnet, opening a window has used about 180,000 gas. In [QoreX](/qorex/security-and-recovery#evm-window) the same step is **Settings → Security → EVM access window** (app) or the **EVM access window** button (extension). Opening the window advances your account nonce, so open it **before** you prepare the EVM transaction in your wallet.

**Step 3 — check what is left:**

```bash
qorechaind query pqc evm-window qor1youraddress...
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_window/qor1youraddress...
```

The REST answer never fails for an address without a window; it returns `found: false`. The fields are `found`, `live`, `opened_height`, `expiry_height`, `max_txs`, `used_txs`, `max_value`, `used_value`, `remaining_blocks`, `remaining_txs` and `remaining_value` (uqor integers, returned as strings). On mainnet use `https://api.qore.host`.

**Step 4 — use the EVM lane normally.** Send from MetaMask or your tooling as usual. Each transaction consumes one transaction slot and (value + maximum fee) from the window.

**Close a window early.** If you suspect your classical key is compromised, close the window; whatever it still admitted is refused from the next block. Closing also revokes any pending EIP-7702 delegation consent (since v3.2.2; a type-4 transaction that changes an account's code is admitted only after a post-quantum `authorize-evm-delegation` consent):

```bash
qorechaind tx pqc close-evm-window --from mykey --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor --generate-only > close.json
qorechaind tx pqc cosign close.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

**Errors**

| What you see | Meaning | What to do |
| --- | --- | --- |
| `no open EVM authorisation window; open one with MsgOpenEVMWindow ...` (module `pqc`, code 26) | No window for this account | Step 2 |
| `... has no registered post-quantum key; the EVM lane requires one` (code 26 on the EVM lane; code 28 if you try to open a window) | No ML-DSA key registered | Step 1 |
| `the EVM authorisation window for ... does not admit this transaction (remaining: ...)` (code 27) | Expired or exhausted; the message shows which bound | Open a new window |
| `invalid EVM authorisation window` (code 28) | Bounds out of range (`blocks` 1–17,280, `max-txs` 1–1,000, `max-value` > 0) | Fix the arguments |

From code, the QoreChain SDK and `@qorechain/wallet-adapter` can compose the open and close messages and read the window state; see the [SDK documentation](/sdk/overview).

The window applies to the EVM lane only. Cosmos-lane transactions already carry the hybrid signature on every transaction, and if you never open a window your EVM transactions are refused while nothing else changes.

## Using SVM RPC

QoreChain's SVM execution environment exposes a Solana-compatible RPC interface on port `8899`. The SVM transaction lane is currently disabled network-wide, so these read methods are the part you can use today.

### Get the Current Slot

```bash
curl -s -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getSlot",
    "id": 1
  }' | jq '.result'
```

### Get an Account Balance

```bash
curl -s -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getBalance",
    "params": ["YourSVMPublicKey"],
    "id": 1
  }' | jq '.result'
```

## Common CLI Patterns

When working with the `qorechaind` CLI, these flags are used frequently:

| Flag               | Description                   | Example                        |
| ------------------ | ----------------------------- | ------------------------------ |
| `--chain-id`       | Specifies the target chain    | `--chain-id qorechain-diana`   |
| `--fees`           | Transaction fee in uqor (gas limit × at least 0.1) | `--fees 40000uqor`  |
| `--from`           | Signing key name or address   | `--from mykey`                 |
| `--output`         | Response format               | `--output json`                |
| `--node`           | RPC endpoint to connect to    | `--node tcp://localhost:26657` |
| `--gas`            | Gas limit for the transaction | `--gas 400000` (or `--gas auto`) |
| `--gas-adjustment` | Multiplier for estimated gas  | `--gas-adjustment 1.5`         |
| `--gas-prices`     | Gas price instead of `--fees` | `--gas-prices 0.1uqor`         |
| `--generate-only`  | Print the unsigned transaction (needed before `tx pqc cosign`) | `--generate-only` |
| `-y`               | Skip confirmation prompt      | `-y`                           |

### Example: Full Command with All Common Flags

```bash
qorechaind tx bank send mykey qor1recipient... 500000uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --node tcp://localhost:26657 \
  --output json \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

## Next Steps

Now that you have sent your first transaction, explore more of what QoreChain offers:

* **Staking and Delegation** — Stake QOR to help secure the network and receive staking rewards
* **Bridging Assets** — Move assets across chains
* **EVM Development** — Deploy Solidity smart contracts on QoreChain
