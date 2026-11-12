---
slug: /build-before-qday/workshop-1/apps/rust-qday-pay
title: Rust App, qday-pay
sidebar_label: Rust, qday-pay
sidebar_position: 4
---

# Rust App: qday-pay

**qday-pay** is a small Rust command line tool that pays in QOR on the QoreChain testnet (`qorechain-diana`, EVM chain ID 9800) with a **hybrid signature**: a classical secp256k1 signature and a post-quantum ML-DSA-87 (FIPS 204) signature on the same transaction. After sending, it reads the transaction back from the chain and shows whether the chain verified both halves.

:::note Status of this app
Built and compiled; the on-chain run has not been verified yet. The Python and Java apps of this workshop have their own pages. Treat the output described below as what the code is written to print, not as a recorded run.
:::

## What it shows {#what-it-shows}

- **Hybrid ML-DSA-87 + secp256k1 signing** from Rust, with the published crate and no extra tooling.
- **One hybrid-signed transaction verified on chain**: the chain emits a `pqc_hybrid_verify` event with `status=verified`, and the transaction body carries a 4627-byte ML-DSA-87 signature next to the 64-byte secp256k1 signature.
- **One recovery phrase, two keys**: the ML-DSA-87 key is derived from the same mnemonic as the classical key and bound to your address.

Why it matters: a future quantum computer is expected to break secp256k1 signatures. A transaction that also carries an ML-DSA-87 signature stays protected. See [Quantum-Safe Transactions](/sdk/guides/quantum-safe).

## Packages and versions {#packages}

| Item | Value |
| --- | --- |
| Crate | `qorechain-sdk` 0.13 on crates.io (imported as `qorechain`), SDK release 0.13.0 |
| Other crates | `tokio` 1, `serde_json` 1, `base64` 0.22, `cosmrs` 0.22 |
| App crate | `qday-pay` 0.1.0 (not published) |
| Network | testnet `qorechain-diana`, release v3.2.8 since 12 November 2026 |

The `Cargo.toml` dependency is `qorechain-sdk = "0.13"`. See [SDK install](/sdk/install) for the release table of all languages.

## Before you start {#before}

- A recent stable Rust toolchain with `cargo`.
- Testnet QOR. The account must exist on chain to pay the key registration fee.

Get testnet QOR from the [Faucet](/dashboard/faucet) (sign-in required). A claim pays 100 QOR, once every 24 hours per account and per address, plus the builder-fest test tokens in a separate transaction.

## Build and run {#run}

```bash
cargo run --release -- new                     # new account, mnemonic saved to a 0600 key file
cargo run --release -- status                  # address, balance, PQC key, latest block
cargo run --release -- register                # register the ML-DSA-87 key (once, idempotent)
cargo run --release -- send qor1... 1 --memo "Build Before Q-Day Workshop 1 (Rust)"
cargo run --release -- verify <TX_HASH>        # the verification report for any transaction
```

1. **`new`** creates a recovery phrase and saves it to a key file with mode 0600. The phrase is never printed. The key file defaults to `~/.config/qday/rust.env`; set `QDAY_KEY_FILE` to change it. It refuses to overwrite an existing file. Keep the file private and never share or commit it.
2. **Fund the address** it prints from the Faucet.
3. **`register`** registers your ML-DSA-87 key once. The registration transaction is signed classically, because a key cannot co-sign its own registration. Running it again does nothing.
4. **`send`** pays the amount in QOR to a `qor1...` address and then runs the verification.
5. **`verify`** prints the report for any transaction hash.

The tool is testnet only: it uses the SDK `testnet` preset and refuses to run against any other chain id.

## The account {#account}

The account is a QoreChain Native secp256k1 account, coin type 118 (`m/44'/118'/0'/0/0`), with a `qor1...` address. The ML-DSA-87 key comes from the same mnemonic with the SDK's canonical address-bound rule. This app signs from a mnemonic, so it does not use the seed-path helpers. If you build on those, SDK 0.13.0 needs a `QRC1` recovery code or an independent 32-byte PQC secret; see [SDK install](/sdk/install#whats-new-0130). In Rust that is `SeedPqcOptions::recovery_code(code)`. Never print a recovery code or store it next to the seed.

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

## What you see when it works {#output}

Once the on-chain run is verified, a successful `send` is expected to print the amount and fee, the block it was included in, and then a report that shows the transaction succeeded, `pqc_hybrid_verify` is `verified`, and the ML-DSA-87 signature is 4627 bytes. If any check fails, the tool exits with status 2. The same transaction opens at `https://explore.qore.network/tx/<HASH>` (switch the explorer to Testnet).

## Where to access it {#access}

| What | Where |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| Explorer | `https://explore.qore.network` (switch to Testnet) |
| Faucet | [Faucet](/dashboard/faucet) |

## Get the code {#get-the-code}

The code is in the public repository: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/04-rust-qday-pay (the link works once the repository is published; the code is also shown inline on this page).
