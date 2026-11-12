---
slug: /build-before-qday/workshop-1/apps/rust-qday-pay
title: Rust App, qday-pay
sidebar_label: Rust, qday-pay
sidebar_position: 4
---

# Rust App: qday-pay

**qday-pay** is a small Rust command line tool that pays in QOR on the QoreChain testnet (`qorechain-diana`, EVM chain ID 9800) with a **hybrid signature**: a classical secp256k1 signature and a post-quantum ML-DSA-87 (FIPS 204) signature on the same transaction. After sending, it reads the transaction back from the chain and shows whether the chain verified both halves.

## What it shows {#what-it-shows}

- **Hybrid ML-DSA-87 + secp256k1 signing** from Rust, with the published crate and no extra tooling.
- **One hybrid-signed transaction verified on chain**: the chain emits a `pqc_hybrid_verify` event with `status=verified`, and the transaction body carries a 4627-byte ML-DSA-87 signature next to the 64-byte secp256k1 signature.
- **One recovery phrase, two keys**: the ML-DSA-87 key is derived from the same mnemonic as the classical key and bound to your address.

Why it matters: a future quantum computer is expected to break secp256k1 signatures. A transaction that also carries an ML-DSA-87 signature stays protected. See [Quantum-Safe Transactions](/sdk/guides/quantum-safe).

## Step by step {#run}

### 1. Install the tools

You need Git and a recent stable Rust toolchain with `cargo`.

- Git: https://git-scm.com/downloads
- Rust: install with rustup from https://rustup.rs

Check the versions:

```bash
git --version
rustc --version
cargo --version
```

### 2. Get the code

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/04-rust-qday-pay
```

### 3. Build

```bash
cargo build --release
```

The first build downloads and compiles the dependencies and takes a few minutes. It ends with `Finished` `release` profile. Running the tool without arguments prints the list of commands:

```bash
cargo run --release
```

### 4. Create a throwaway testnet account

```bash
cargo run --release -- new
```

`new` creates a recovery phrase and saves it to a key file with mode 0600. The phrase is never printed. The key file defaults to `~/.config/qday/rust.env`; set `QDAY_KEY_FILE` to use another path. It refuses to overwrite an existing file. This is a testnet-only account: never use a real wallet here, never share or commit the key file, and never reuse it on mainnet. The command prints your `qor1...` address.

### 5. Get testnet QOR from the faucet

1. Open https://dashboard.qorechain.io/faucet and sign in.
2. Paste your `qor1...` address and claim. A claim pays 100 QOR, once every 24 hours per account and per address.

The account must exist on chain before the next step, because registration pays a fee.

### 6. Check the account

```bash
cargo run --release -- status                  # address, balance, PQC key, latest block
```

### 7. Register the ML-DSA-87 key

```bash
cargo run --release -- register                # register the ML-DSA-87 key (once, idempotent)
```

The registration transaction is signed classically, because a key cannot co-sign its own registration. Running it again does nothing.

### 8. Send a hybrid-signed payment

```bash
cargo run --release -- send qor1... 1 --memo "Build Before Q-Day Workshop 1 (Rust)"
```

Replace `qor1...` with any testnet address (for example a second throwaway account). The amount is in QOR. `send` pays the amount and then runs the verification.

### 9. Verify any transaction

```bash
cargo run --release -- verify <TX_HASH>        # the verification report for any transaction
```

The tool is testnet only: it uses the SDK `testnet` preset and refuses to run against any other chain id.

## The account {#account}

The account is a QoreChain Native secp256k1 account, coin type 118 (`m/44'/118'/0'/0/0`), with a `qor1...` address. The ML-DSA-87 key comes from the same mnemonic with the SDK's canonical address-bound rule. One mnemonic restores both keys.

```rust
let classical = derive_native_account(mnemonic, 0)?;
let pqc = try_derive_pqc_canonical(&classical.address, mnemonic)?;
```

## The SDK code that matters {#code}

This is the core of the `send` command, trimmed:

```rust
// The payment: a plain bank MsgSend.
let send = bank_send_any(w.address(), to, vec![coin(&uqor)]);
// Which hybrid sign-bytes form this network verifies (asked once, cached).
let version = SignBytesResolver::new()
    .resolve(SignBytesMode::Auto, &net.chain_id, Some(&net.rest_url)).await?;

let mut params = BuildHybridTxParams {
    private_key: w.classical.private_key.clone(), // secp256k1 half
    public_key: w.classical.public_key.clone(),
    pqc_secret_key: w.pqc.secret_key.clone(),     // ML-DSA-87 half
    pqc_public_key: w.pqc.public_key.clone(),
    messages: vec![Message { type_url: send.type_url, value: send.value }],
    chain_id: net.chain_id.clone(),
    include_pqc_public_key: false, // key registered with `register`
    sign_bytes_version: Some(version),
    /* fee, account_number, sequence, memo, timeout_height */
};

let draft = build_hybrid_tx(params.clone())?;                    // sign a draft
params.fee = estimate_fee(&net.rest_url, &draft.tx_raw_bytes, 1.3, "0.15uqor").await?; // simulate, gas x 1.3
let tx = build_hybrid_tx(params.clone())?;                       // sign for real
let res = broadcast_and_wait(&net.rest_url, &tx.tx_raw_bytes, WaitOptions::default()).await?;
```

Registration is one idempotent call, `ensure_pqc_registered()` on `PqcDx`: it sends `MsgRegisterPQCKeyV2` with a proof of possession only when no key is registered yet, and fails if the account holds a different key.

Gas is never fixed: the draft is simulated and the limit is the simulated gas times 1.3, priced at 0.15 uqor per gas (the chain floor is 0.1 uqor).

## How "verified" is decided {#verified}

`verify` reads `GET /cosmos/tx/v1beta1/txs/{hash}` from the public testnet REST endpoint and checks three things:

- the transaction succeeded (`code 0`);
- the chain emitted `pqc_hybrid_verify` with `status=verified` for the signer;
- the body carries a `/qorechain.pqc.v1.PQCHybridSignature` extension with a 4627-byte ML-DSA-87 signature.

## What you should see {#output}

A successful `send` prints the amount and fee, the block it was included in, and then a report that shows the transaction succeeded, `pqc_hybrid_verify` is `verified`, and the ML-DSA-87 signature is 4627 bytes. If any check fails, the tool exits with status 2. To look the transaction up, open https://explore.qore.network, switch it to **Testnet**, and search for the hash, or open `https://explore.qore.network/tx/<HASH>`.

## Network endpoints {#access}

| What | Where |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| Explorer | `https://explore.qore.network` (switch to Testnet) |
| Faucet | https://dashboard.qorechain.io/faucet |

## Packages used {#packages}

| Item | Version |
| --- | --- |
| `qorechain-sdk` (imported as `qorechain`) | 0.13 (resolved to 0.13.0) |
| `tokio` | 1 |
| `serde_json` | 1 |
| `base64` | 0.22 |
| `cosmrs` | 0.22 |
| `qday-pay` (this app, not published) | 0.1.0 |

See [SDK install](/sdk/install) for the SDK release table of all languages.

## Source code {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/04-rust-qday-pay
